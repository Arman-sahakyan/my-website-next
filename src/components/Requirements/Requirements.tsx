// components/Requirements.tsx
export default function Requirements() {
  return (
    <section className="homepage_steps" id="requirements">
      <div className="container">
        <h2 className="homepage_steps_title">
          Step-by-Step Process to Obtain Your Trip and fuel permits for Oregon:
        </h2>
        <p className="homepage_steps_description">
          To get started, please prepare the following information:
        </p>
        <ul className="homepage_steps_list flex_column">
          <li>Driver(s)’s name(s) and accurate information.</li>
          <li>Your USDOT/MC/CCD Number.</li>
          <li>Company Details: name, phone, email.</li>
          <li>Truck Information: VIN, license plate, weight, commodity, etc.</li>
          <li>Trip Dates: exact dates of your trip in Oregon.</li>
          <li>Entry and Exit Information: including stops, cities, or zip codes.</li>
        </ul>
      </div>
    </section>
  );
}
