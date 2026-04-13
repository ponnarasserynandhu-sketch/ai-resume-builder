import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./Portfolio.css"; // Changed from ../Portfolio.css to ./Portfolio.css
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiBriefcase,
  FiLinkedin,
  FiGithub,
  FiTwitter,
  FiCpu,
  FiBookOpen,
  FiAward,
  FiCode,
  FiStar,
  FiArrowRight,
  FiGlobe
} from "react-icons/fi";

function PublicPortfolio() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPublicProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axios.get(
        `http://localhost:5000/api/profile/public/${id}`
      );

      if (res.data.success && res.data.profile) {
        setUser(res.data.profile);
      } else {
        setError("Profile not found");
      }
    } catch (err) {
      console.error("Error fetching public profile:", err);
      setError("Unable to load profile. The link may be invalid or expired.");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPublicProfile();
  }, [fetchPublicProfile]);

  const skillsList = user?.skills?.split(',').map(s => s.trim()).filter(s => s) || [];
  const projectsList = user?.projects?.split('\n').filter(p => p.trim()) || [];
  const experienceList = user?.experience?.split('\n').filter(e => e.trim()) || [];
  const certificatesList = user?.certificates?.split('\n').filter(c => c.trim()) || [];
  const languagesList = user?.languages?.split(',').map(l => l.trim()).filter(l => l) || [];

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';
  };

  if (isLoading) {
    return (
      <div className="portfolio-loading">
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        <p>Loading portfolio...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="portfolio-error">
        <div className="error-container">
          <div className="error-icon">😕</div>
          <h2>Profile Not Found</h2>
          <p>{error}</p>
          <button className="home-btn" onClick={() => window.location.href = '/'}>
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="portfolio-container public-portfolio">
      <div className="portfolio-wrapper">
        <div className="public-header">
          <div className="header-content">
            <div className="header-logo">
              <div className="logo-icon">
                <FiGlobe />
              </div>
              <div>
                <h1>Professional Portfolio</h1>
                <p>{user?.name || "Candidate"}</p>
              </div>
            </div>
          </div>
          <button className="home-btn-header" onClick={() => window.location.href = '/'}>
            Portfolio Generator
          </button>
        </div>

        <div className="portfolio-content">
          <div className="portfolio-preview-container">
            <div className="portfolio-preview">
              <div className="portfolio-bg-animation">
                <div className="gradient-sphere sphere-1"></div>
                <div className="gradient-sphere sphere-2"></div>
                <div className="gradient-sphere sphere-3"></div>
              </div>

              <div className="portfolio-hero">
                <div className="hero-badge">
                  <FiStar className="star-icon" />
                  <span>Professional Portfolio</span>
                </div>
                
                <div className="hero-avatar-wrapper">
                  <div className="hero-avatar-glow"></div>
                  <div className="hero-avatar">
                    {user?.profilePhoto ? (
                      <img src={user.profilePhoto} alt={user.name} />
                    ) : (
                      <div className="avatar-initials">{getInitials(user?.name)}</div>
                    )}
                  </div>
                </div>
                
                <h1 className="hero-name">{user?.name || "Your Name"}</h1>
                <p className="hero-title">{user?.role || "Professional Title"}</p>
                
                <div className="hero-contact">
                  {user?.email && (
                    <div className="contact-chip">
                      <FiMail size={14} />
                      <span>{user.email}</span>
                    </div>
                  )}
                  {user?.phone && (
                    <div className="contact-chip">
                      <FiPhone size={14} />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  {user?.address && (
                    <div className="contact-chip">
                      <FiMapPin size={14} />
                      <span>{user.address}</span>
                    </div>
                  )}
                </div>
                
                <div className="hero-social">
                  {user?.linkedin && (
                    <a 
                      href={user.linkedin.startsWith('http') ? user.linkedin : `https://${user.linkedin}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="social-link"
                    >
                      <FiLinkedin />
                      <span>LinkedIn</span>
                    </a>
                  )}
                  {user?.github && (
                    <a 
                      href={user.github.startsWith('http') ? user.github : `https://${user.github}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="social-link"
                    >
                      <FiGithub />
                      <span>GitHub</span>
                    </a>
                  )}
                  {user?.twitter && (
                    <a 
                      href={user.twitter.startsWith('http') ? user.twitter : `https://${user.twitter}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="social-link"
                    >
                      <FiTwitter />
                      <span>Twitter</span>
                    </a>
                  )}
                </div>
              </div>

              <div className="portfolio-inner">
                {user?.about && (
                  <div className="portfolio-section about-section">
                    <div className="section-header">
                      <FiUser className="section-icon" />
                      <h2>About Me</h2>
                      <div className="section-line"></div>
                    </div>
                    <div className="about-content">
                      <p>{user.about}</p>
                    </div>
                  </div>
                )}

                {skillsList.length > 0 && (
                  <div className="portfolio-section skills-section">
                    <div className="section-header">
                      <FiCpu className="section-icon" />
                      <h2>Skills & Expertise</h2>
                      <div className="section-line"></div>
                    </div>
                    <div className="skills-grid">
                      {skillsList.map((skill, index) => (
                        <div key={index} className="skill-item">
                          <div className="skill-icon">
                            <FiCode />
                          </div>
                          <span>{skill}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {experienceList.length > 0 && (
                  <div className="portfolio-section experience-section">
                    <div className="section-header">
                      <FiBriefcase className="section-icon" />
                      <h2>Work Experience</h2>
                      <div className="section-line"></div>
                    </div>
                    <div className="timeline">
                      {experienceList.map((exp, index) => (
                        <div key={index} className="timeline-item">
                          <div className="timeline-marker">
                            <div className="timeline-dot"></div>
                            {index < experienceList.length - 1 && <div className="timeline-line"></div>}
                          </div>
                          <div className="timeline-content">
                            <div className="timeline-icon">
                              <FiBriefcase />
                            </div>
                            <p>{exp}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(user?.tenthSchool || user?.interCollege || user?.degreeCollege) && (
                  <div className="portfolio-section education-section">
                    <div className="section-header">
                      <FiBookOpen className="section-icon" />
                      <h2>Education</h2>
                      <div className="section-line"></div>
                    </div>
                    <div className="education-grid">
                      {user?.tenthSchool && (
                        <div className="education-card">
                          <div className="education-icon">📚</div>
                          <div className="education-content">
                            <h3>Secondary Education</h3>
                            <p className="education-institute">{user.tenthSchool}</p>
                            <div className="education-meta">
                              <span className="education-percentage">{user.tenthPercentage}%</span>
                              <span className="education-year">{user.tenthYear}</span>
                            </div>
                          </div>
                        </div>
                      )}
                      {user?.interCollege && (
                        <div className="education-card">
                          <div className="education-icon">🎓</div>
                          <div className="education-content">
                            <h3>Higher Secondary</h3>
                            <p className="education-institute">{user.interCollege}</p>
                            <p className="education-course">{user.interCourse}</p>
                            <div className="education-meta">
                              <span className="education-percentage">{user.interPercentage}%</span>
                              <span className="education-year">{user.interYear}</span>
                            </div>
                          </div>
                        </div>
                      )}
                      {user?.degreeCollege && (
                        <div className="education-card">
                          <div className="education-icon">🏛️</div>
                          <div className="education-content">
                            <h3>Graduation</h3>
                            <p className="education-institute">{user.degreeCollege}</p>
                            <p className="education-course">{user.degreeCourse}</p>
                            <div className="education-meta">
                              <span className="education-percentage">{user.degreePercentage}%</span>
                              <span className="education-year">{user.degreeYear}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {projectsList.length > 0 && (
                  <div className="portfolio-section projects-section">
                    <div className="section-header">
                      <FiCode className="section-icon" />
                      <h2>Featured Projects</h2>
                      <div className="section-line"></div>
                    </div>
                    <div className="projects-grid">
                      {projectsList.map((project, index) => (
                        <div key={index} className="project-card">
                          <div className="project-icon">
                            <FiCode />
                          </div>
                          <div className="project-content">
                            <p>{project}</p>
                            <div className="project-tags">
                              <span>View Project</span>
                              <FiArrowRight />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {certificatesList.length > 0 && (
                  <div className="portfolio-section certifications-section">
                    <div className="section-header">
                      <FiAward className="section-icon" />
                      <h2>Certifications</h2>
                      <div className="section-line"></div>
                    </div>
                    <div className="certifications-grid">
                      {certificatesList.map((cert, index) => (
                        <div key={index} className="cert-card">
                          <FiAward />
                          <span>{cert}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {languagesList.length > 0 && (
                  <div className="portfolio-section languages-section">
                    <div className="section-header">
                      <FiGlobe className="section-icon" />
                      <h2>Languages</h2>
                      <div className="section-line"></div>
                    </div>
                    <div className="languages-grid">
                      {languagesList.map((lang, index) => (
                        <div key={index} className="language-item">
                          <div className="language-dot"></div>
                          <span>{lang}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PublicPortfolio;