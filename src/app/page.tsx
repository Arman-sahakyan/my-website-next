// pages/index.tsx
// import Header from "../components/Header";
// import Footer from "../components/Footer";
import Hero from "../components/hero/Hero";
import ContentSections from "../components/ContentSections/ContentSections";
import Requirements from "../components/Requirements/Requirements";
import FAQ from "../components/FAQ/FAQ";
import "../styles/hero-permit.css";
import "../styles/tokens.css";
import "../styles/global.css"

export default function Home() {
  return (
    <>
      {/* <Header /> */}
      <main>
        <div>
          <Hero />
       <ContentSections />
        </div>
        
         <Requirements />
        <FAQ />
      </main>
      {/* <Footer /> */}
    </>
  );
}