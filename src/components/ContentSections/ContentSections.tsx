// components/ContentSections.tsx
export default function ContentSections() {
  return (
    <section className="container">
      <article>
        <h2>Trip Permits (Temporary)</h2>
        <p>Trip permits allow unregistered or out-of-state vehicles to legally operate in Oregon for a short period. Ideal for trucks or trailers not registered in Oregon that need to complete a specific trip.</p>
        <ul>
          <li><strong>Heavy Motor Vehicle Trip Permit</strong> — typically valid 10 days. For trucks over 10,000 lbs or 3+ axles.</li>
          <li><strong>Trailer Trip Permit</strong> — used for unregistered trailers, usually valid 10 days.</li>
          <li><strong>Light Vehicle / RV</strong> — short-term permits for lighter vehicles; check limits and validities.</li>
        </ul>
      </article>

      <article>
        <h2>Weight-Mile / Fuel Temporary Tax Pass</h2>
        <p>Vehicles that operate in Oregon and exceed 26,000 lbs are subject to Oregon's weight-mile tax. Temporary tax passes can be purchased for short operations.</p>
      </article>

      <article>
        <h2>Oversize / Overweight Permits</h2>
        <p>Required for vehicles and loads that exceed legal length, width, height, or weight limits. Routes, escorts, and time-of-day restrictions may apply.</p>
      </article>
    </section>
  );
}
