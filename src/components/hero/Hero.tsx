"use client"
// pages/index.tsx
import { useState } from "react";
// import Header from "../components/Header/Header";
// import Footer from "../components/Footer/Footer";

import { db } from "../../server/firebaseAdmin";
import { addDoc } from "@/actions/action";
import { useRouter } from "next/navigation";
import type {Step1} from '@/Types/Step1'
import Loading from "../Loading/Loading";
const heroImage = "/images/Truck_banner.webp";

export default function Hero() {
  const [form, setForm] = useState<Step1>({
    usdot_mc_ccd: "",
    email: "",
    permit_start_date: "",
    company_name: "",
    phone: "",
  });
  const [loading,setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({});
    const router = useRouter();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" })); // clear field error
  };


  
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const payload = {step1: Object.fromEntries(formData.entries())};

     const newErrors: Record<string, string> = {};
    if (!form.usdot_mc_ccd) newErrors.usdot_mc_ccd = "USDOT is required";
    if (!form.email) newErrors.email = "Email is required";
    if (!form.permit_start_date) newErrors.permit_start_date = "Start date required";
    if (!form.company_name) newErrors.company_name = "Company name required";
    if (!form.phone) newErrors.phone = "Phone number required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false)
      return;
    }

    try {
      const result = await addDoc(payload);
      setLoading(false)

      if (result?.id) {
        // ✅ redirect to dynamic route (no query string)
        router.push(`/permit/truck/${result.id}`);
      } else {
        alert("Something went wrong while creating the draft.");
      }
    } catch (err) {
      console.error("Error creating draft:", err);
      alert("Failed to create draft.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <main>
        <section className="hero">
          <div className="hero__bg" style={{ backgroundImage: `url(${heroImage})` }} />
          <div className="hero__veil" />
          <div className="hero__content">
            <div className="form-card">
              <h1 className="hero__title">Issue a Temporary Permit</h1>
              <p className="hero__subtitle">
                Temporary permits valid for <strong>10 days</strong>.
              </p>
              <form className="form-grid" onSubmit={handleSubmit} noValidate>
                <label className="form-label" htmlFor="usdot_mc_ccd">USDOT/MC/CCD number#</label>
                <input
                  id="usdot_mc_ccd"
                  name="usdot_mc_ccd"
                  placeholder="Your USDOT Number#"
                  className="places-autocomplete-input"
                  value={form.usdot_mc_ccd}
                  onChange={handleChange}
                />
                {errors.usdot_mc_ccd && <p className="field-error">{errors.usdot_mc_ccd}</p>}

                <label className="form-label" htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  placeholder="Your Email"
                  className="places-autocomplete-input"
                  value={form.email}
                  onChange={handleChange}
                />
                {errors.email && <p className="field-error">{errors.email}</p>}

                <div className="grid-2">
                  <div>
                    <label className="form-label" htmlFor="permit_start_date">Permit starting date</label>
                    <input
                      id="permit_start_date"
                      name="permit_start_date"
                      className="places-autocomplete-input"
                      type="date"
                      value={form.permit_start_date}
                      onChange={handleChange}
                    />
                    {errors.permit_start_date && <p className="field-error">{errors.permit_start_date}</p>}
                  </div>
                  <div>
                    <label className="form-label" htmlFor="company_name">Company name</label>
                    <input
                      id="company_name"
                      name="company_name"
                      placeholder="Company name"
                      className="places-autocomplete-input"
                      value={form.company_name}
                      onChange={handleChange}
                    />
                    {errors.company_name && <p className="field-error">{errors.company_name}</p>}
                  </div>
                </div>

                <label className="form-label" htmlFor="phone">Phone number</label>
                <input
                  id="phone"
                  name="phone"
                  placeholder="e.g. (307) 721‑8848"
                  className="places-autocomplete-input"
                  value={form.phone}
                  onChange={handleChange}
                />
                {errors.phone && <p className="field-error">{errors.phone}</p>}

                <div className="button-container">
<button className="next-button hero-btn" type="submit">{loading?<Loading size="20px" color="white" />:'Next'}</button>                </div>
              </form>
            </div>
            <aside className="hero__copy">
          <h2 className="hero__title">WELCOME TO Trip and fuel permits for Oregon</h2>
          

          <div className="hero__blurb">
            <p>
             Apply for Oregon truck permits with our private online service.
We help carriers prepare and submit applications quickly — permits are issued by official state agencies.
Prefer help from a human? Our support team is ready to assist. <a
                href="tel:+15034387888">Contact us</a>.
            </p>
            <p className="hero__mini">
              Need details on required info? <a href="#requirements"
                >See the checklist</a>.
            </p>
          </div>
        </aside>
          </div>
        </section>
      </main>
    </>
  );
}
