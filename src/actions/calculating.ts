"use server";

import { db } from "@/server/firebaseAdmin";

const MAPS_API_KEY = process.env.MAPS_API_KEY!;
const SERVICE_FEE_USD = Number(process.env.SERVICE_FEE_USD ?? 50);
const STOPS_SURCHARGE_PER_STOP = 5;
const AXLE_SURCHARGE_PER_AXLE = 10;
const NON_APPORTIONED_SURCHARGE = 50;
const BASE_PERMIT_FEE = 43;

type RouteStop = { lat: number; lng: number; address: string };
type RoutePayload = {
  tripType?: "one-way" | "round-trip";
  entrance_lat?: number;
  entrance_lng?: number;
  start_lat?: number;
  start_lng?: number;
  exit_lat?: number;
  exit_lng?: number;
  stops?: RouteStop[];
  routeType?: string;
  entrancePoint?: string;
  exitPoint?: string;
  start_address?: string;
};

// ---------- Utility helpers ----------
function upperBound(weight: string): number {
  if (!weight) return 0;
  const m = weight.match(/(\d+)\s*-\s*(\d+)/);
  if (m) return parseInt(m[2], 10);
  const n = parseInt(weight.replace(/,/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
}

function perMileRateByWeight(upper: number) {
  if (upper <= 26000) return 0.05;
  if (upper <= 34000) return 0.06;
  if (upper <= 44000) return 0.07;
  if (upper <= 80000) return 0.08;
  return 0.09;
}

function calculatePricing(opts: {
  registered_weight_or: string;
  tripType: "one-way" | "round-trip";
  axles: number | null;
  stopsCount: number;
  miles: number;
  apportioned_or: "yes" | "no";
}) {
  const ub = upperBound(opts.registered_weight_or);
  const perMileRate = perMileRateByWeight(ub);
  let mileageFee = opts.miles * perMileRate;
  if (opts.tripType === "round-trip") mileageFee *= 1.5;

  const axleSurcharge =
    opts.axles && opts.axles > 5
      ? (opts.axles - 5) * AXLE_SURCHARGE_PER_AXLE
      : 0;
  const stopsSurcharge =
    opts.stopsCount > 0 ? opts.stopsCount * STOPS_SURCHARGE_PER_STOP : 0;
  const nonApportioned =
    opts.apportioned_or === "no" ? NON_APPORTIONED_SURCHARGE : 0;
  const subtotal =
    mileageFee +
    axleSurcharge +
    stopsSurcharge +
    nonApportioned +
    BASE_PERMIT_FEE;
  const commision = subtotal * 0.9 ;
  const total = +(subtotal + commision).toLocaleString();

  return {
    mileageFee,
    axleSurcharge,
    stopsSurcharge,
    nonApportioned,
    serviceFee: SERVICE_FEE_USD,
    baseFee: BASE_PERMIT_FEE,
    subtotal,
    total,
  };
}

// ---------- Main server function ----------
export async function calculateRoute(
  draftId: string,

  payload: RoutePayload,
  registered_weight_or: string,
  axles: number | null,
  apportioned_or: "yes" | "no"
): Promise<{
  miles: number;
  pricing: any;
  stops: RouteStop[];
  routeType: string;
  origin: any;
  destination: any;
}> {
  const {
    tripType = "one-way",
    entrance_lat = null,
    entrance_lng = null,
    start_lat = null,
    start_lng = null,
    exit_lat = null,
    exit_lng = null,
    stops = [],
    routeType,
    entrancePoint = null,
    exitPoint = null,
    start_address = null,
  } = payload;

  // ---------------- Determine route structure ----------------
  // origin → [stops...] → destination
  let origin: { lat: number; lng: number };
  let destination: { lat: number; lng: number };

  // Priority-based determination
  if (entrance_lat && entrance_lng && routeType === "enter") {
    origin = { lat: entrance_lat, lng: entrance_lng };
  } else if (start_lat && start_lng && routeType === "exit") {
    origin = { lat: start_lat, lng: start_lng };
  } else {
    throw new Error("Missing both entrance and start coordinates");
  }

  if (exit_lat && exit_lng) {
    destination = { lat: exit_lat, lng: exit_lng };
  } else if (stops.length > 0) {
    const lastStop = stops[stops.length - 1];
    destination = { lat: lastStop.lat, lng: lastStop.lng };
  } else {
    throw new Error("No destination (exit or stops) provided");
  }

  // Prepare Google API payload
  const intermediates = stops.length
    ? stops.map((s) => ({
        location: { latLng: { latitude: s.lat, longitude: s.lng } },
      }))
    : [];

  const routePayload = {
    origin: {
      location: { latLng: { latitude: origin.lat, longitude: origin.lng } },
    },
    destination: {
      location: {
        latLng: { latitude: destination.lat, longitude: destination.lng },
      },
    },
    intermediates,
    travelMode: "DRIVE",
    routingPreference: "TRAFFIC_AWARE_OPTIMAL",
  };

  // ---------------- Fetch from Google Routes API ----------------
  const resp = await fetch(
    "https://routes.googleapis.com/directions/v2:computeRoutes",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": MAPS_API_KEY,
        "X-Goog-FieldMask": "routes.distanceMeters,routes.legs.distanceMeters",
      },
      body: JSON.stringify(routePayload),
    }
  );

  if (!resp.ok) throw new Error(`Google Routes API Error ${resp.status}`);

  const data = await resp.json();
  const route = data?.routes?.[0];
  if (!route) throw new Error("No route found");

  // Compute distance (in miles)
  let miles =
    (route.legs?.reduce(
      (sum: number, leg: any) => sum + (leg.distanceMeters ?? 0),
      0
    ) ?? 0) / 1609.34;
  if (tripType === "round-trip") miles *= 2;

  // ---------------- Get truck info ----------------
  // const snap = await db.collection("permits").doc(draftId).get();
  // const d = snap.exists ? (snap.data() as any) : {};
  // const registered_weight_or = d?.step2?.registered_weight_or ?? "26001-28000";
  // const axles = d?.step2?.axles ?? null;
  // const apportioned_or = d?.step2?.apportioned_or ?? "yes";

  const pricing = calculatePricing({
    registered_weight_or,
    tripType,
    axles,
    stopsCount: stops.length,
    miles,
    apportioned_or,
  });

  // ---------------- Save to Firestore ----------------
  if (draftId) {
    await db
      .collection("permits")
      .doc(draftId)
      .set(
        {
          step3: {
            routeType,
            stops,
            distance_miles: miles,
            tripType,
            pricing,
            entrance_lat,
            entrance_lng,
            start_lat,
            start_lng,
            exit_lat,
            exit_lng,
            entrancePoint,
            exitPoint,
            start_address,
          },
          status: "completed",
          updatedAt: new Date(),
        },
        { merge: true }
      );
  }

  return { miles, pricing, stops, routeType, origin, destination };
}
