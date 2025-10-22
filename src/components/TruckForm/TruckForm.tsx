"use client";
import { addTruckInfo, getTruckInfo } from "@/actions/action";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Step2 } from "@/Types/Step2";

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
interface TruckFormProps {
  draftId: string;

}
export function TruckForm({ draftId}: TruckFormProps) {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    if (!draftId) {
      //   router.push("/?error=Please start the form on the home page first.");
    }
  }, [draftId, router]);

  const [form, setForm] = useState<Step2>({
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
  });

  const [showAxles, setShowAxles] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

  const weightRanges = buildWeightRanges();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" })); // clear error on change
  };

  // Show/hide axles
  useEffect(() => {
    const val = form.registered_weight_or;
    const match = val.match(/(\d+)-(\d+)/);
    const upper = match ? parseInt(match[2], 10) : parseInt(val, 10);
    setShowAxles(upper > 80000);
    if (upper <= 80000) setForm((prev) => ({ ...prev, axles: "" }));
  }, [form.registered_weight_or]);

  useEffect(() => {
    getForm();
  }, []);

  async function getForm() {
    const res = await getTruckInfo(draftId!);
    console.log(res);
    if(!res.drivers) return

    if (res) setForm(res);
  }

  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    console.log(draftId, payload);

    try {
      await addTruckInfo(draftId!, payload);
      router.push(`/permit/route/${draftId}`)
      // you can now redirect to step3 if needed
    } catch (err) {
      console.error("Error saving step2:", err);
      alert("Failed to save truck info.");
    } finally {
      setLoading(false);
    }
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!form.drivers.trim()) newErrors.drivers = "Driver name is required";
    if (!form.truck_year.match(/^\d{4}$/)) newErrors.truck_year = "Truck year must be 4 digits";
    if (+form.truck_year > 2025) newErrors.truck_year = "Truck year must be less 2026";
    if (!form.truck_make.trim()) newErrors.truck_make = "Truck make is required";
    if (!form.unit_number.trim()) newErrors.unit_number = "Unit number is required";
    if (!form.vin || form.vin.length !== 17) newErrors.vin = "VIN must be 17 characters";
    if (!form.license_plate.trim()) newErrors.license_plate = "License plate is required";
    if (!form.license_state) newErrors.license_state = "Issue state is required";
    if (!form.registered_weight_or) newErrors.registered_weight_or = "Registered weight is required";
    if (showAxles && (!form.axles || isNaN(Number(form.axles)))) newErrors.axles = "Valid number of axles required";
    if (form.purchase_type === "leased" && !form.lessor_company.trim()) newErrors.lessor_company = "Lessor company required";
    if (!form.commodity.trim()) newErrors.commodity = "Commodity is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  return (
    <main className="trip-planner">
      <div className="container">

        <form onSubmit={handleSubmit} className="form-grid">
          <input type="hidden" name="draftId" value={draftId ?? ""} />

          <label className="form-label" htmlFor="drivers">
            Name of drivers
          </label>
          <input
            id="drivers"
            name="drivers"
            className="places-autocomplete-input"
            placeholder="e.g. John Doe, Jane Roe"
            value={form.drivers}
            onChange={handleChange}
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
                value={form.truck_year}
                onChange={handleChange}
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
                value={form.truck_make}
                onChange={handleChange}
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
                value={form.unit_number}
                onChange={handleChange}
              />
              {errors.unit_number && <p className="error">{errors.unit_number}</p>}
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
                value={form.vin}
                onChange={handleChange}
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
                value={form.license_plate}
                onChange={handleChange}
              />
              {errors.license_plate && <p className="error">{errors.license_plate}</p>}
            </div>
            <div>
              <label className="form-label" htmlFor="license_state">
                Issue state
              </label>
              <select
                id="license_state"
                name="license_state"
                className="places-autocomplete-input"
                value={form.license_state}
                onChange={handleChange}
              >
                <option value="">Select state</option>
                {US_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {errors.license_state && <p className="error">{errors.license_state}</p>}
            </div>
          </div>

          <fieldset className="trip-type">
            <legend className="form-label">Apportioned with Oregon?</legend>
            <div className="radio-row">
              <label className="trip-type__option input_radio">
                <input
                  type="radio"
                  name="apportioned_or"
                  value="yes"
                  checked={form.apportioned_or === "yes"}
                  onChange={handleChange}
                />
                Yes
              </label>
              <label className="trip-type__option">
                <input
                  type="radio"
                  name="apportioned_or"
                  value="no"
                  checked={form.apportioned_or === "no"}
                  onChange={handleChange}
                />
                No
              </label>
              {errors.apportioned_or && <p className="error">{errors.apportioned_or}</p>}
            </div>
          </fieldset>

          <label className="form-label" htmlFor="registered_weight_or">
            Registered weight (OR)
          </label>
          <select
            id="registered_weight_or"
            name="registered_weight_or"
            className="places-autocomplete-input"
            value={form.registered_weight_or}
            onChange={handleChange}
          >
            <option value="">Select registered weight</option>
            {weightRanges.map((r) => (
              <option key={r} value={r}>
                {r.replace(/-/g, " – ")}
              </option>
            ))}
          </select>
          {errors.registered_weight_or && <p className="error">{errors.registered_weight_or}</p>}

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
                value={form.axles}
                onChange={handleChange}
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
                  checked={form.purchase_type === "company"}
                  onChange={handleChange}
                />
                Company
              </label>
              <label className="trip-type__option">
                <input
                  type="radio"
                  name="purchase_type"
                  value="leased"
                  checked={form.purchase_type === "leased"}
                  onChange={handleChange}
                />
                Leased
              </label>
              {errors.purchase_type && <p className="error">{errors.purchase_type}</p>}
            </div>
          </fieldset>
          {form.purchase_type === "leased" && (
            <div>
              <label className="form-label" htmlFor="lessor_company">
                Lessor company
              </label>
              <input
                id="lessor_company"
                name="lessor_company"
                className="places-autocomplete-input"
                value={form.lessor_company}
                onChange={handleChange}
              />
              {errors.lessor_company && <p className="error">{errors.lessor_company}</p>}
            </div>
          )}

          <label className="form-label" htmlFor="commodity">
            Commodity (what are you hauling?)
          </label>
          <input
            id="commodity"
            name="commodity"
            className="places-autocomplete-input"
            value={form.commodity}
            onChange={handleChange}
          />
            {errors.commodity && <p className="error">{errors.commodity}</p>}
            <div className="button-container">
            <button className="next-button hero-btn" type="submit">
              NEXT
            </button>
          </div>
          
        </form>
      </div>
    </main>
  );
}
