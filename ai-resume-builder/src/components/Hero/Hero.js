import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Hero.css";
import {
  FiArrowRight,
  FiCpu,
  FiTrendingUp,
  FiCheckCircle,
  FiZap
} from "react-icons/fi";

function Hero() {
  const [isVisible, setIsVisible] = useState(false);
  const heroRef = useRef(null);
  const navigate = useNavigate();

  // Intersection Observer effect
  useEffect(() => {
    const currentRef = heroRef.current;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  const handleGetStarted = () => {
    navigate("/signup");
  };

  const features = [
    { text: "AI-Powered Content Generation", icon: FiCpu },
    { text: "ATS-Friendly Templates", icon: FiCheckCircle },
    { text: "Real-Time Preview", icon: FiZap },
    { text: "One-Click Portfolio Generation", icon: FiTrendingUp }
  ];

  return (
    <section className="hero-modern" ref={heroRef}>
      {/* Background Elements */}
      <div className="hero-bg">
        <div className="gradient-bg"></div>
        <div className="grid-overlay"></div>
      </div>

      <div className="hero-container">
        <div className="hero-content">
          {/* Left Column */}
          <div className={`hero-left ${isVisible ? "animate-in" : ""}`}>
            <div className="hero-badge">
              <FiZap size={16} />
              <span>AI-Powered Platform</span>
            </div>
            
            <h1 className="hero-title">
              Build Your Future with
              <span className="gradient-text"> AI-Powered Resumes</span>
            </h1>
            
            <p className="hero-description">
              Create professional resumes and stunning portfolio websites in minutes using our 
              advanced AI technology. Join thousands of successful job seekers who landed their 
              dream jobs with our platform.
            </p>

            <div className="hero-buttons">
              <button className="btn-primary" onClick={handleGetStarted}>
                Start Creating Free
                <FiArrowRight size={18} />
              </button>
            </div>

            <div className="hero-features">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="feature-badge">
                    <Icon size={14} />
                    <span>{feature.text}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column - Image */}
          <div className={`hero-right ${isVisible ? "animate-in" : ""}`}>
            <div className="image-container">
              <div className="image-wrapper">
                <img
                  src="https://img.freepik.com/premium-photo/professional-cv-template_624163-8949.jpg"
                  alt="Professional Resume Template"
                />
                <div className="image-overlay"></div>
                <div className="image-glow"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;