"use client";
import React, { useEffect, useState } from "react";
import { RouteForm } from "../RouteForm/RouteForm";
import { TruckForm } from "../TruckForm/TruckForm";
import { log } from "console";
import { addDoc, getPermit, savePermit } from "@/actions/action";
import { Rye } from "next/font/google";
import Loading from "../Loading/Loading";
import highways from "@/Data/highways.json";
import "@/styles/route.css";
import { calculateRoute } from "@/actions/calculating";
import { useRouter } from "next/navigation";

interface Stop {
  address: string;
  lat: number;
  lng: number;
  tripType: "delivery" | "pickUp";
}
const US_STATES = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
  "DC",
];

function buildWeightRanges(): string[] {
  const ranges: string[] = [];
  let start = 26001;
  let end = 28000;
  while (end < 105500) {
    ranges.push(`${start}-${end}`);
    start = end + 1;
    end = start + 1999;
  }
  ranges.push(`${start}-105500`);
  return ranges;
}
const AdminForm = ({ draftId }:{draftId?: string}) => {
  const [form, setForm] = useState({
    readyToPay: false,
    step1: {
      usdot_mc_ccd: "",
      email: "",
      permit_start_date: "",
      company_name: "",
      phone: "",
    },
    step2: {
      drivers: "",
      truck_year: "",
      truck_make: "",
      unit_number: "",
      vin: "",
      license_plate: "",
      license_state: "",
      apportioned_or: "yes",
      registered_weight_or: "",
      axles: "",
      purchase_type: "company",
      lessor_company: "",
      commodity: "",
    },
    step3: {
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
    },
  });

  const [showAxles, setShowAxles] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const weightRanges = buildWeightRanges();
  const [loading, setLoading] = useState(false);
  const [stops, setStops] = useState<Stop[]>([]);
  const [calculationResult, setCalculationResult] = useState<any>(null);
  const router = useRouter()
  console.log(form);

  useEffect(() => {
    const val = form.step2.registered_weight_or;
    const match = val.match(/(\d+)-(\d+)/);
    const upper = match ? parseInt(match[2], 10) : parseInt(val, 10);
    setShowAxles(upper > 80000);
    if (upper <= 80000) setForm((prev) => ({ ...prev, axles: "" }));
  }, [form.step2.registered_weight_or]);

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
          // @ts-ignore
          lat: lat?.toString(),
          // @ts-ignore
          lng: lng?.toString(),
        };
        setStops(newStops);
      } else if (key === "start") {
        // @ts-ignore
        setForm((prev) => ({
          ...prev,
          step3: {
            ...prev.step3,
            start_address: input.value,
            start_lat: lat?.toString(),
            start_lng: lng?.toString(),
          },
        }));
      }
    });
  }

  const handleStep1Change = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, step1: { ...prev.step1, [name]: value } }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };
  const handleStep2Change = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, step2: { ...prev.step2, [name]: value } }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };
  useEffect(() => {
    getData();
  }, []);

  async function getData() {

    if (!draftId) return;
    setLoading(true);

    const res = await getPermit(draftId);

    console.log(res);

    setForm(res);
    if (res.step3) setStops(res.step3.stops);

    setLoading(false);
  }
  console.log(stops);

  async function handleSubmit(e:any) {
    e.preventDefault();
    const payload = {
        ...form,
        step3: {
          ...form.step3,
          stops
        }
      };
    if (draftId) {
      
      await savePermit(draftId, payload);
    }else{
      await addDoc(payload)
    }
    router.push('/admin')
  }
  console.log(form?.step3);

  async function handleCalculate(e:any) {
    e.preventDefault();
    const payload = {
      entrancePoint: form.step3.entrancePoint,
      exitPoint: form.step3.exitPoint,
      start_address: form.step3.start_address,
      tripType: form.step3.tripType as "one-way" | "round-trip",
      routeType: form.step3.routeType as "enter" | "exit",
      entrance_lat: Number(form.step3.entrance_lat),
      entrance_lng: Number(form.step3.entrance_lng),
      start_lat: Number(form.step3.start_lat),
      start_lng: Number(form.step3.start_lng),
      exit_lat: Number(form.step3.exit_lat),
      exit_lng: Number(form.step3.exit_lng),
      stops: stops
        .filter((s) => s.lat && s.lng)
        .map((s) => ({
          lat: Number(s.lat),
          lng: Number(s.lng),
          address: s.address || "",
        })),
    };
    console.log(payload);

    const result = await calculateRoute(
      draftId!,
      payload,
      form?.step2?.registered_weight_or,
      Number(form?.step2?.axles),
      // @ts-ignore
      form?.step2?.apportioned_or
    );
    setCalculationResult(result);
  }
  const handleStep3Change = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, step3: { ...prev.step3, [name]: value } }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSelectHighway = (type: "entrance" | "exit", name: string) => {
    const point = highways.find((p) => p.name === name);
    if (!point) return;
    setForm((prev) => ({
      ...prev,
      step3: {
        ...prev.step3,
        [`${type}Point`]: name,
        [`${type}_lat`]: point.lat.toString(),
        [`${type}_lng`]: point.lng.toString(),
      },
    }));
  };
  // @ts-ignore
  const addStop = () => setStops([...stops, {}]);
  const removeStop = (idx: number) =>
    setStops(stops.filter((_, i) => i !== idx));

  const handleStopChange = (idx: number, value: string,name:string) => {
    const newStops = [...stops];
    // @ts-ignore
    newStops[idx][name] = value;
    setStops(newStops);
  };
  console.log(calculationResult);

  if (loading) return <Loading isFullScreen={true} />;

  return (
    <div className="container max-w-4xl mx-auto p-6">
      {
        form.readyToPay && <h3 className="redy_pay">Ready To Pay</h3>
      }
      <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Company Info */}
        <h2 className="col-span-full text-xl font-semibold mb-2">
          Company Info
        </h2>

        <div>
          <label className="form-label" htmlFor="usdot_mc_ccd">
            USDOT/MC/CCD Number#
          </label>
          <input
            id="usdot_mc_ccd"
            name="usdot_mc_ccd"
            placeholder="USDOT/MC/CCD Number"
            className="places-autocomplete-input"
            value={form.step1.usdot_mc_ccd}
            onChange={handleStep1Change}
          />
          {errors.usdot_mc_ccd && (
            <p className="field-error">{errors.usdot_mc_ccd}</p>
          )}
        </div>

        <div>
          <label className="form-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            placeholder="Email"
            className="places-autocomplete-input"
            value={form.step1.email}
            onChange={handleStep1Change}
          />
          {errors.email && <p className="field-error">{errors.email}</p>}
        </div>

        <div>
          <label className="form-label" htmlFor="permit_start_date">
            Permit Start Date
          </label>
          <input
            id="permit_start_date"
            name="permit_start_date"
            type="date"
            className="places-autocomplete-input"
            value={form.step1.permit_start_date}
            onChange={handleStep1Change}
          />
          {errors.permit_start_date && (
            <p className="field-error">{errors.permit_start_date}</p>
          )}
        </div>

        <div>
          <label className="form-label" htmlFor="company_name">
            Company Name
          </label>
          <input
            id="company_name"
            name="company_name"
            placeholder="Company Name"
            className="places-autocomplete-input"
            value={form.step1.company_name}
            onChange={handleStep1Change}
          />
          {errors.company_name && (
            <p className="field-error">{errors.company_name}</p>
          )}
        </div>

        <div>
          <label className="form-label" htmlFor="phone">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            placeholder="Phone"
            className="places-autocomplete-input"
            value={form.step1.phone}
            onChange={handleStep1Change}
          />
          {errors.phone && <p className="field-error">{errors.phone}</p>}
        </div>
        <input type="hidden" name="draftId" value={draftId ?? ""} />

        <label className="form-label" htmlFor="drivers">
          Name of drivers
        </label>
        <input
          id="drivers"
          name="drivers"
          className="places-autocomplete-input"
          placeholder="e.g. John Doe, Jane Roe"
          value={form.step2.drivers}
          onChange={handleStep2Change}
        />
        {errors.drivers && <p className="error">{errors.drivers}</p>}
        <div className="grid-2">
          <div>
            <label className="form-label" htmlFor="truck_year">
              Truck year
            </label>
            <input
              id="truck_year"
              name="truck_year"
              placeholder="YYYY"
              className="places-autocomplete-input"
              value={form.step2.truck_year}
              onChange={handleStep2Change}
            />
            {errors.truck_year && <p className="error">{errors.truck_year}</p>}
          </div>

          <div>
            <label className="form-label" htmlFor="truck_make">
              Make
            </label>
            <input
              id="truck_make"
              name="truck_make"
              className="places-autocomplete-input"
              value={form.step2.truck_make}
              onChange={handleStep2Change}
            />
            {errors.truck_make && <p className="error">{errors.truck_make}</p>}
          </div>
        </div>

        <div className="grid-2">
          <div>
            <label className="form-label" htmlFor="unit_number">
              Unit number#
            </label>
            <input
              id="unit_number"
              name="unit_number"
              className="places-autocomplete-input"
              value={form.step2.unit_number}
              onChange={handleStep2Change}
            />
            {errors.unit_number && (
              <p className="error">{errors.unit_number}</p>
            )}
          </div>
          <div>
            <label className="form-label" htmlFor="vin">
              VIN (17)
            </label>
            <input
              id="vin"
              name="vin"
              maxLength={17}
              minLength={17}
              className="places-autocomplete-input"
              value={form.step2.vin}
              onChange={handleStep2Change}
            />
            {errors.vin && <p className="error">{errors.vin}</p>}
          </div>
        </div>

        <div className="grid-2">
          <div>
            <label className="form-label" htmlFor="license_plate">
              License plate
            </label>
            <input
              id="license_plate"
              name="license_plate"
              className="places-autocomplete-input"
              value={form.step2.license_plate}
              onChange={handleStep2Change}
            />
            {errors.license_plate && (
              <p className="error">{errors.license_plate}</p>
            )}
          </div>
          <div>
            <label className="form-label" htmlFor="license_state">
              Issue state
            </label>
            <select
              id="license_state"
              name="license_state"
              className="places-autocomplete-input"
              value={form.step2.license_state}
              onChange={handleStep2Change}
            >
              <option value="">Select state</option>
              {US_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {errors.license_state && (
              <p className="error">{errors.license_state}</p>
            )}
          </div>
        </div>

        <fieldset className="trip-type">
          <legend className="form-label">Apportioned with Oregon?</legend>
          <div className="radio-row">
            <label className="trip-type__option">
              <input
                type="radio"
                name="apportioned_or"
                value="yes"
                checked={form.step2.apportioned_or === "yes"}
                onChange={handleStep2Change}
              />
              Yes
            </label>
            <label className="trip-type__option">
              <input
                type="radio"
                name="apportioned_or"
                value="no"
                checked={form.step2.apportioned_or === "no"}
                onChange={handleStep2Change}
              />
              No
            </label>
            {errors.apportioned_or && (
              <p className="error">{errors.apportioned_or}</p>
            )}
          </div>
        </fieldset>

        <label className="form-label" htmlFor="registered_weight_or">
          Registered weight (OR)
        </label>
        <select
          id="registered_weight_or"
          name="registered_weight_or"
          className="places-autocomplete-input"
          value={form.step2.registered_weight_or}
          onChange={handleStep2Change}
        >
          <option value="">Select registered weight</option>
          {weightRanges.map((r) => (
            <option key={r} value={r}>
              {r.replace(/-/g, " – ")}
            </option>
          ))}
        </select>
        {errors.registered_weight_or && (
          <p className="error">{errors.registered_weight_or}</p>
        )}

        {showAxles && (
          <div>
            <label className="form-label" htmlFor="axles">
              How many axles do you have?
            </label>
            <input
              id="axles"
              name="axles"
              inputMode="numeric"
              pattern="[0-9]*"
              className="places-autocomplete-input"
              value={form.step2.axles}
              onChange={handleStep2Change}
            />
            {errors.axles && <p className="error">{errors.axles}</p>}
          </div>
        )}

        <fieldset className="trip-type">
          <legend className="form-label">
            Purchased by company or leased?
          </legend>
          <div className="radio-row">
            <label className="trip-type__option">
              <input
                type="radio"
                name="purchase_type"
                value="company"
                checked={form.step2.purchase_type === "company"}
                onChange={handleStep2Change}
              />
              Company
            </label>
            <label className="trip-type__option">
              <input
                type="radio"
                name="purchase_type"
                value="leased"
                checked={form.step2.purchase_type === "leased"}
                onChange={handleStep2Change}
              />
              Leased
            </label>
            {errors.purchase_type && (
              <p className="error">{errors.purchase_type}</p>
            )}
          </div>
        </fieldset>
        {form.step2.purchase_type === "leased" && (
          <div>
            <label className="form-label" htmlFor="lessor_company">
              Lessor company
            </label>
            <input
              id="lessor_company"
              name="lessor_company"
              className="places-autocomplete-input"
              value={form.step2.lessor_company}
              onChange={handleStep2Change}
            />
            {errors.lessor_company && (
              <p className="error">{errors.lessor_company}</p>
            )}
          </div>
        )}

        <label className="form-label" htmlFor="commodity">
          Commodity (what are you hauling?)
        </label>
        <input
          id="commodity"
          name="commodity"
          className="places-autocomplete-input"
          value={form.step2.commodity}
          onChange={handleStep2Change}
        />
        {errors.commodity && <p className="error">{errors.commodity}</p>}
        <div>
          <label>Route Type</label>
          <select
            name="routeType"
            value={form.step3.routeType}
            onChange={handleStep3Change}
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
              checked={form.step3.tripType === "one-way"}
              onChange={handleStep3Change}
            />
            One Way
          </label>
          <label className="radio_input">
            <input
              type="radio"
              name="tripType"
              value="round-trip"
              checked={form.step3.tripType === "round-trip"}
              onChange={handleStep3Change}
            />
            Round Trip
          </label>
        </div>

        {/* Entrance Point */}
        {form.step3.routeType === "enter" && (
          <div>
            <label>Entrance Point (Highway)</label>
            <select
              value={form.step3.entrancePoint}
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
        {form.step3.routeType === "exit" && (
          <div>
            <label>Start Address</label>
            <input
              id="start_address"
              name="start_address"
              value={form.step3.start_address}
              onChange={handleStep3Change}
            />
            {errors.start_address && (
              <p className="error">{errors.start_address}</p>
            )}
          </div>
        )}

        {/* Exit Point */}
        <div>
          <label>Exit Point (Highway)</label>
          <select
            value={form.step3.exitPoint}
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
            <div key={i}>
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
              
            </div>
            <p className="price-note">
              * Final charges are confirmed at checkout.
            </p>
          </section>
        )}
        <div className="buttons_container">
          <button
          onClick={handleCalculate}
          className="btn-primary"
          disabled={loading}
        >
          {loading ? "Calculating..." : "Calculate"}
        </button>
        <button className="btn-primary" onClick={handleSubmit}>
          Save
        </button>
        </div>

        
      </form>
      {/* <TruckForm draftId={draftId} isAdmin={true} onStateChange={(form:any)=>setStep2(form) } step2={step2} />
      <RouteForm draftId={draftId} isAdmin={true} onStateChange={(form:any)=>setStep3(form)} /> */}
      <script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_MAPS_API_KEY}&libraries=places`}
        async
        defer
      ></script>
    </div>
  );
};

export default AdminForm;
