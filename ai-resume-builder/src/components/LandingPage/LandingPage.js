import React from "react";
import Navbar from "../Navbar/Navbar";
import Hero from "../Hero/Hero";
import Features from "../Features/Features";
import Footer from "../Footer/Footer";

function LandingPage() {
  return (
    <div>
      <Navbar />
      {/* Added id="hero-section" for smooth scrolling from navbar home button */}
      <div id="hero-section">
        <Hero />
      </div>
      {/* Added id="features-section" for smooth scrolling from navbar features button */}
      <div id="features-section">
        <Features />
      </div>
      <Footer />
    </div>
  );
}

export default LandingPage;