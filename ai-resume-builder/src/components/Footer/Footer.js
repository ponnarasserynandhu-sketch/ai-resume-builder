import React from "react";
import "./Footer.css";
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiLinkedin,
  FiInstagram,
  FiGithub,
  FiTwitter,
  FiFacebook,
  FiYoutube,
  FiArrowUpRight,
  FiCpu,
  FiGlobe,
  FiFileText,
  FiTrendingUp
} from "react-icons/fi";

function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "Home", path: "/", icon: FiTrendingUp },
    { name: "Features", path: "/features", icon: FiCpu },
    { name: "Pricing", path: "/pricing", icon: FiFileText },
    { name: "About Us", path: "/about", icon: FiGlobe },
    { name: "Contact", path: "/contact", icon: FiMail }
  ];

  const resources = [
    { name: "Blog", path: "/blog" },
    { name: "Templates", path: "/templates" },
    { name: "Help Center", path: "/help" },
    { name: "Privacy Policy", path: "/privacy" },
    { name: "Terms of Service", path: "/terms" }
  ];

  const socialLinks = [
    { icon: FiLinkedin, name: "LinkedIn", color: "#0077b5", url: "https://linkedin.com" },
    { icon: FiTwitter, name: "Twitter", color: "#1da1f2", url: "https://twitter.com" },
    { icon: FiInstagram, name: "Instagram", color: "#e4405f", url: "https://instagram.com" },
    { icon: FiGithub, name: "GitHub", color: "#333", url: "https://github.com" },
    { icon: FiFacebook, name: "Facebook", color: "#1877f2", url: "https://facebook.com" },
    { icon: FiYoutube, name: "YouTube", color: "#ff0000", url: "https://youtube.com" }
  ];

  return (
    <footer className="footer-modern">
      {/* Main Footer Content */}
      <div className="footer-main">
        <div className="footer-container">
          
          {/* Column 1 - Brand Section */}
          <div className="footer-column brand-column">
            <div className="footer-logo-wrapper">
              <div className="logo-icon">
                <svg className="footer-logo-svg" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="32" height="32" rx="8" fill="url(#footerLogoGradient)"/>
                  <defs>
                    <linearGradient id="footerLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6366f1"/>
                      <stop offset="100%" stopColor="#8b5cf6"/>
                    </linearGradient>
                  </defs>
                  <path d="M10 12L16 8L22 12V20L16 24L10 20V12Z" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                  <path d="M16 16V24M10 12L16 16L22 12" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                  <circle cx="16" cy="16" r="1.5" fill="white"/>
                </svg>
              </div>
              <h2 className="footer-logo">AI Resume<span>Builder</span></h2>
            </div>
            <p className="footer-description">
              Create smart AI-powered resumes and build your professional portfolio website easily. 
              Land your dream job with our intelligent tools.
            </p>
          </div>

          {/* Column 2 - Quick Links */}
          <div className="footer-column">
            <h3 className="footer-column-title">Quick Links</h3>
            <ul className="footer-links">
              {quickLinks.map((link, index) => {
                const Icon = link.icon;
                return (
                  <li key={index}>
                    <a href={link.path} className="footer-link">
                      <Icon size={14} />
                      <span>{link.name}</span>
                      <FiArrowUpRight size={12} className="link-icon" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Column 3 - Resources */}
          <div className="footer-column">
            <h3 className="footer-column-title">Resources</h3>
            <ul className="footer-links">
              {resources.map((resource, index) => (
                <li key={index}>
                  <a href={resource.path} className="footer-link">
                    <span>{resource.name}</span>
                    <FiArrowUpRight size={12} className="link-icon" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 - Contact Info */}
          <div className="footer-column">
            <h3 className="footer-column-title">Contact Us</h3>
            <div className="contact-info-horizontal">
              <div className="contact-item">
                <FiMail size={18} />
                <a href="mailto:support@airesume.com">support@airesume.com</a>
              </div>
              <div className="contact-item">
                <FiPhone size={18} />
                <a href="tel:+919876543210">+91 98765 43210</a>
              </div>
              <div className="contact-item">
                <FiMapPin size={18} />
                <span>Hyderabad, India</span>
              </div>
            </div>
            
            {/* Social Links */}
            <div className="social-links">
              <h4>Follow Us</h4>
              <div className="social-icons">
                {socialLinks.map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-icon"
                      style={{ '--hover-color': social.color }}
                      aria-label={social.name}
                    >
                      <Icon size={18} />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom-modern">
        <div className="footer-bottom-container">
          <div className="copyright">
            <p>© {currentYear} AI Resume Builder. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="footer-decoration">
        <div className="decoration-circle circle-1"></div>
        <div className="decoration-circle circle-2"></div>
        <div className="decoration-line"></div>
      </div>
    </footer>
  );
}

export default Footer;