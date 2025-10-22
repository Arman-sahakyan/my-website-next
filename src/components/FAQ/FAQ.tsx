// components/FAQ.tsx
export default function FAQ() {
  return (
    <section className="FAQ" id="faq">
      <div className="container">
        <h2 className="FAQ_title">FAQ – Oregon Trip Permit</h2>
        <details>
          <summary>What is a Trip Permit?</summary>
          <p>A Trip Permit is a temporary authorization that allows trucks not registered in Oregon to legally enter and operate within the state.</p>
        </details>
        <details>
          <summary>How long is a Trip Permit valid?</summary>
          <p>Standard Trip Permits are valid for 10 consecutive days from the date issued.</p>
        </details>
        <details>
          <summary>What information do I need to provide?</summary>
          <p>USDOT/MC Number, company details, truck info, route info, and contact details.</p>
        </details>
      </div>
    </section>
  );
}
