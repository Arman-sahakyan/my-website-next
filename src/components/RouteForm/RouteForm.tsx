"use client";
import { useEffect, useState } from "react";
import { calculateRoute } from "@/actions/calculating";
import "../../styles/route.css";
declare global {
  interface Window {
    google: any;
  }
}
interface Stop {
  address?: string;
  lat?: string;
  lng?: string;
  tripType?: 'delivery' | 'pickUp'
}

interface RouteFormProps {
  draftId?: string;
  isAdmin?: boolean;
  onStateChange?: (form: any) => void;
}

import highways from "@/Data/highways.json";
import { getPermit, paymentRequest } from "@/actions/action";
import Loading from "../Loading/Loading";
import { db } from "@/server/firebaseAdmin";
import { useRouter } from "next/navigation";

export function RouteForm({ draftId}: RouteFormProps) {
  const [form, setForm] = useState({
    routeType: "enter",
    tripType: "one-way",
    entrancePoint: "",
    exitPoint: "",
    start_address: "",
    start_lat: "",
    start_lng: "",
    entrance_lat: "",
    entrance_lng: "",
    exit_lat: "",
    exit_lng: "",
  });
  const [permit, setPermit] = useState<any>(null);

  const [stops, setStops] = useState<Stop[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [calculationResult, setCalculationResult] = useState<any>(null);
  const router = useRouter()
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Handle select of highway point
  const handleSelectHighway = (type: "entrance" | "exit", name: string) => {
    const point = highways.find((p) => p.name === name);
    if (!point) return;
    setForm((prev) => ({
      ...prev,
      [`${type}Point`]: name,
      [`${type}_lat`]: point.lat.toString(),
      [`${type}_lng`]: point.lng.toString(),
    }));
  };

  const addStop = () => setStops([...stops, {tripType: 'delivery'}]);
  const removeStop = (idx: number) =>
    setStops(stops.filter((_, i) => i !== idx));

  const handleStopChange = (idx: number, value: string,name:string) => {
    const newStops = [...stops];
    // @ts-ignore
    newStops[idx][name] = value;
    setStops(newStops);
  };

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!form.routeType) newErrors.routeType = "Route type is required";
    if (!form.tripType) newErrors.tripType = "Trip type is required";
    if (form.routeType === "enter" && !form.entrancePoint)
      newErrors.entrancePoint = "Entrance point required";
    // if (!form.exitPoint) newErrors.exitPoint = "Exit point required";
    if (form.routeType === "exit" && !form.start_address)
      newErrors.start_address = "Start address required";
    stops.forEach((s, i) => {
      if (!s.address || !s.address.trim())
        newErrors[`stop_${i}`] = "Stop address required";
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const payload = {
        entrancePoint: form.entrancePoint,
        exitPoint: form.exitPoint,
        start_address: form.start_address,
        tripType: form.tripType as "one-way" | "round-trip",
        routeType: form.routeType as "enter" | "exit",
        entrance_lat: Number(form.entrance_lat),
        entrance_lng: Number(form.entrance_lng),
        start_lat: Number(form.start_lat),
        start_lng: Number(form.start_lng),
        exit_lat: Number(form.exit_lat),
        exit_lng: Number(form.exit_lng),
        stops: stops
          .filter((s) => s.lat && s.lng)
          .map((s) => ({
            lat: Number(s.lat),
            lng: Number(s.lng),
            address: s.address || "",
          })),
          
      };

      const result = await calculateRoute(
          draftId!,
          payload,
          permit?.step2?.registered_weight_or,
          permit?.step2?.axles,
          permit?.step2?.apportioned_or
        );
        setCalculationResult(result);

      console.log("Route calculated:", result);
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Error calculating route");
    } finally {
      setLoading(false);
    }
  }



  // Google Places for stops only
  useEffect(() => {
    if (!window.google?.maps?.places) return;

    const startInput = document.getElementById(
      "start_address"
    ) as HTMLInputElement;
    if (startInput) attachAutocomplete(startInput, "start");
    stops.forEach((_, idx) => {
      const stopInput = document.getElementById(
        `stop_address_${idx}`
      ) as HTMLInputElement;
      if (stopInput) attachAutocomplete(stopInput, `stop_${idx}`);
    });
  }, [stops, form]);

  function attachAutocomplete(input: HTMLInputElement, key: string) {
    const autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();

      if (!place.geometry) return;

      const lat = place.geometry.location?.lat();
      const lng = place.geometry.location?.lng();

      if (key.startsWith("stop_")) {
        const idx = parseInt(key.split("_")[1]);
        const newStops = [...stops];
        newStops[idx] = {
          ...newStops[idx],
          address: input.value,
          lat: lat?.toString(),
          lng: lng?.toString(),
        };
        setStops(newStops);
      } else if (key === "start") {
        // @ts-ignore
        setForm((prev) => ({
          ...prev,
          start_address: input.value,
          start_lat: lat?.toString(),
          start_lng: lng?.toString(),
        }));
      }
    });
  }

  useEffect(()=>{
    getData()
  },[])

  async function getData() {
    if (!draftId) return;
    setLoading(true)
    const res = await getPermit(draftId);
    setForm(res.step3)
    setPermit(res);
    setStops(res.step3.stops)
    setLoading(false)
  }

  // if (loading) return <Loading isFullScreen={true} />

  async function handlePaymentRequest() {
    if (!draftId) return

    try{
      paymentRequest(draftId)
      // await db.collection('permit').doc(draftId).set({ readyToPay: true }, { merge: true })
      router.push(`/permit/success/${draftId}`)
    }catch{

    }

  }

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <h2>Route Information</h2>

        {/* Route type */}
        <div className="form-section">
          <label>Route Type</label>
          <select
            name="routeType"
            value={form.routeType}
            onChange={handleChange}
          >
            <option value="enter">Enter Oregon</option>
            <option value="exit">Exit Oregon</option>
          </select>
        </div>

        {/* Trip type */}
        <div className="radio-row">
          <label className="radio_input">
            <input
              type="radio"
              name="tripType"
              value="one-way"
              checked={form.tripType === "one-way"}
              onChange={handleChange}
            />
            One Way
          </label>
          <label className="radio_input">
            <input
              type="radio"
              name="tripType"
              value="round-trip"
              checked={form.tripType === "round-trip"}
              onChange={handleChange}
            />
            Round Trip
          </label>
        </div>

        {/* Entrance Point */}
        {form.routeType === "enter" && (
          <div className="form-section">
            <label>Entrance Point (Highway)</label>
            <select
              value={form.entrancePoint}
              onChange={(e) => handleSelectHighway("entrance", e.target.value)}
            >
              <option value="">Select entrance</option>
              {highways.map((h) => (
                <option key={h.name} value={h.name}>
                  {h.name}
                </option>
              ))}
            </select>
            {errors.entrancePoint && (
              <p className="error">{errors.entrancePoint}</p>
            )}
          </div>
        )}
        {form.routeType === "exit" && (
          <div className="form-section">
            <label>Start Address</label>
            <input
              id="start_address"
              name="start_address"
              onChange={handleChange}
              value={form.start_address}
            />
            {errors.start_address && (
              <p className="error">{errors.start_address}</p>
            )}
          </div>
        )}

        {/* Exit Point */}
        <div className="form-section">
          <label>Exit Point (Highway)</label>
          <select
            value={form.exitPoint}
            onChange={(e) => handleSelectHighway("exit", e.target.value)}
          >
            <option value="">Select exit</option>
            {highways.map((h) => (
              <option key={h.name} value={h.name}>
                {h.name}
              </option>
            ))}
          </select>
          {errors.exitPoint && <p className="error">{errors.exitPoint}</p>}
        </div>

        {/* Stops */}
        <div>
          <label>Stops</label>
          {stops.map((s, i) => (
            <div className="stop_container" key={i}>
              <div className="stop_top_row">
                <input
                  id={`stop_address_${i}`}
                  value={s.address || ""}
                  onChange={(e) => handleStopChange(i, e.target.value,'address')}
                  placeholder="Stop address"
                />
                <button
                  type="button"
                  className="remove-stop"
                  onClick={() => removeStop(i)}
                >
                  ×
                </button>
              </div>
              <div className="stop_bottom_row">
                <label className="radio_input" htmlFor="">
                  <input
                 type="radio"
                 name={`tripType_${i}`}
                 checked={s.tripType === 'delivery'}
                 onChange={(e) => handleStopChange(i, 'delivery',`tripType`)}
                  />
                  Delivery
                </label>

                <label className="radio_input" htmlFor="">
                  <input
                 type="radio"
                 name={`tripType_${i}`}
                 checked={s.tripType === 'pickUp'}
                 onChange={(e) => handleStopChange(i, 'pickUp',`tripType`)}
                  />
                  Pick Up
                </label>
                
              </div>
              {errors[`stop_${i}`] && (
                <p className="error">{errors[`stop_${i}`]}</p>
              )}
            </div>
          ))}
          <button type="button" className="add-stop" onClick={addStop}>
            + Add Stop
          </button>
        </div>
        {calculationResult && (
          <section className="price-card">
            <h3 className="price-title">Permit Calculation</h3>
            <div className="price-rows">
              <div className="price-total">
                <span>Total Miles</span>
                <span>{calculationResult.miles.toFixed()} MI</span>
              </div>
              <div className="price-total">
                <span>Total Price</span>
                <span>{calculationResult.pricing.total.toFixed()}$</span>
              </div>
              <button onClick={handlePaymentRequest} className="btn-primary">
                Submit
              </button>
            </div>
            <p className="price-note">
              * Final charges are confirmed at checkout.
            </p>
          </section>
        )}

        <button type="submit" className="btn-primary calculate-btn" disabled={loading}>
          {loading ? "Calculating..." : "Calculate"}
        </button>
      </form>

      {/* Google Maps Autocomplete script */}
      <script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_MAPS_API_KEY}&libraries=places`}
        async
        defer
      ></script>
    </div>
  );
}
