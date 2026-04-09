import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Features.css";
import {
  FiCpu,
  FiGlobe,
  FiFileText,
  FiCheckCircle,
  FiTrendingUp,
  FiShield,
  FiZap,
  FiArrowRight
} from "react-icons/fi";

function Features() {
  const navigate = useNavigate();
  const cardsRef = useRef([]);

  useEffect(() => {
    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    cardsRef.current.forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => observer.disconnect();
  }, []);

  const handleGetStarted = () => {
    navigate("/signup");
  };

  const handleTryResumeBuilder = () => {
    navigate("/login");
  };

  const features = [
    {
      id: 1,
      icon: FiCpu,
      title: "AI-Powered Resume Creation",
      description: "Generate professional resumes with advanced AI that suggests content, optimizes keywords, and matches your skills to industry standards.",
      color: "#4361ee",
      bgColor: "#4361ee10",
      features: [
        "Smart content suggestions",
        "Keyword optimization",
        "Industry-specific templates"
      ]
    },
    {
      id: 2,
      icon: FiGlobe,
      title: "Instant Portfolio Website",
      description: "Transform your resume into a stunning personal portfolio website with one click. Showcase your work and achievements professionally.",
      color: "#06d6a0",
      bgColor: "#06d6a010",
      features: [
        "One-click deployment",
        "Custom domains",
        "Mobile-responsive design"
      ]
    },
    {
      id: 3,
      icon: FiFileText,
      title: "Easy PDF Export",
      description: "Download high-quality, ATS-friendly resumes in PDF format. Share with recruiters and track application progress.",
      color: "#f9c74f",
      bgColor: "#f9c74f10",
      features: [
        "ATS-compatible format",
        "Multiple templates",
        "Custom layouts"
      ]
    },
    {
      id: 4,
      icon: FiTrendingUp,
      title: "Analytics & Insights",
      description: "Track your resume performance with detailed analytics. See views, downloads, and recruiter engagement.",
      color: "#f9844a",
      bgColor: "#f9844a10",
      features: [
        "View tracking",
        "Download analytics",
        "Recruiter feedback"
      ]
    },
    {
      id: 5,
      icon: FiShield,
      title: "Privacy & Security",
      description: "Your data is encrypted and secure. Control who sees your information and manage privacy settings easily.",
      color: "#9c89b8",
      bgColor: "#9c89b810",
      features: [
        "End-to-end encryption",
        "Privacy controls",
        "Data ownership"
      ]
    },
    {
      id: 6,
      icon: FiZap,
      title: "Real-time Editing",
      description: "See changes instantly as you type. Live preview of your resume with all updates reflected immediately.",
      color: "#4c9aff",
      bgColor: "#4c9aff10",
      features: [
        "Live preview",
        "Instant updates",
        "Undo/redo support"
      ]
    }
  ];

  return (
    <div className="features-page">
      {/* Hero Section */}
      <div className="features-hero">
        <div className="hero-badge">
          <FiZap size={16} />
          <span>Powerful Features</span>
        </div>
        <h1 className="hero-title">
          Everything You Need to
          <span className="gradient-text"> Build Your Career</span>
        </h1>
        <p className="hero-subtitle">
          Create professional resumes and portfolios with our AI-powered platform.
          Stand out from the competition and land your dream job.
        </p>
      </div>

      {/* Features Grid */}
      <div className="features-grid-container">
        <div className="features-grid">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.id}
                className="feature-card"
                ref={el => cardsRef.current[index] = el}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="feature-icon" style={{ backgroundColor: feature.bgColor, color: feature.color }}>
                  <Icon size={32} />
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
                <ul className="feature-list">
                  {feature.features.map((item, i) => (
                    <li key={i}>
                      <FiCheckCircle size={16} style={{ color: feature.color }} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA Section  */}
      <div className="features-cta-light">
        <div className="cta-content-light">
          <h2>Ready to Build Your Professional Career?</h2>
          <p>Join thousands of professionals who have already created their resumes and portfolios with us.</p>
          <div className="cta-buttons">
            <button className="cta-primary-light" onClick={handleGetStarted}>
              Get Started Free
              <FiArrowRight size={18} />
            </button>
            <button className="cta-secondary-light" onClick={handleTryResumeBuilder}>
              Try Resume Builder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Features;