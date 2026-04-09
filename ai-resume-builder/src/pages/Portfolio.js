import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./Portfolio.css";
import {
  FiGlobe,
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
  FiCheckCircle,
  FiRefreshCw,
  FiEdit2,
  FiSave,
  FiX,
  FiStar,
  FiArrowRight,
  FiEye,
  FiPrinter
} from "react-icons/fi";

function Portfolio() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    role: "",
    linkedin: "",
    github: "",
    twitter: "",
    about: "",
    skills: "",
    experience: "",
    projects: "",
    certificates: "",
    languages: "",
    tenthSchool: "",
    tenthPercentage: "",
    tenthYear: "",
    interCollege: "",
    interCourse: "",
    interPercentage: "",
    interYear: "",
    degreeCollege: "",
    degreeCourse: "",
    degreePercentage: "",
    degreeYear: "",
    profilePhoto: ""
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const portfolioRef = useRef();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.get(
        "http://localhost:5000/api/profile/me",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success && res.data.profile) {
        setUser(prev => ({ ...prev, ...res.data.profile }));
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaveStatus("saving");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/profile/save",
        user,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setSaveStatus("success");
        setIsEditing(false);
        setTimeout(() => setSaveStatus(null), 3000);
      } else {
        setSaveStatus("error");
        setTimeout(() => setSaveStatus(null), 3000);
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const exportAsPDF = async () => {
    const input = portfolioRef.current;
    if (!input) return;
    
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      const canvas = await html2canvas(input, { 
        scale: 2, 
        backgroundColor: '#ffffff',
        logging: false
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "pt", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${user.name || "Portfolio"}_portfolio.pdf`);
      setSaveStatus("exported");
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error("Export error:", error);
    }
  };

  const skillsList = user.skills?.split(',').map(s => s.trim()).filter(s => s) || [];
  const projectsList = user.projects?.split('\n').filter(p => p.trim()) || [];
  const experienceList = user.experience?.split('\n').filter(e => e.trim()) || [];
  const certificatesList = user.certificates?.split('\n').filter(c => c.trim()) || [];
  const languagesList = user.languages?.split(',').map(l => l.trim()).filter(l => l) || [];

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';
  };

  const renderPortfolio = () => (
    <div className="portfolio-preview" ref={portfolioRef}>
      {/* Animated Background */}
      <div className="portfolio-bg-animation">
        <div className="gradient-sphere sphere-1"></div>
        <div className="gradient-sphere sphere-2"></div>
        <div className="gradient-sphere sphere-3"></div>
      </div>

      {/* Hero Section */}
      <div className="portfolio-hero">
        <div className="hero-badge">
          <FiStar className="star-icon" />
          <span>Available for opportunities</span>
        </div>
        
        <div className="hero-avatar-wrapper">
          <div className="hero-avatar-glow"></div>
          <div className="hero-avatar">
            {user.profilePhoto ? (
              <img src={user.profilePhoto} alt={user.name} />
            ) : (
              <div className="avatar-initials">{getInitials(user.name)}</div>
            )}
          </div>
        </div>
        
        <h1 className="hero-name">{user.name || "Your Name"}</h1>
        <p className="hero-title">{user.role || "Professional Title"}</p>
        
        <div className="hero-contact">
          {user.email && (
            <div className="contact-chip">
              <FiMail size={14} />
              <span>{user.email}</span>
            </div>
          )}
          {user.phone && (
            <div className="contact-chip">
              <FiPhone size={14} />
              <span>{user.phone}</span>
            </div>
          )}
          {user.address && (
            <div className="contact-chip">
              <FiMapPin size={14} />
              <span>{user.address}</span>
            </div>
          )}
        </div>
        
        <div className="hero-social">
          {user.linkedin && (
            <a 
              href={user.linkedin.startsWith('http') ? user.linkedin : `https://${user.linkedin}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="social-link"
            >
              <FiLinkedin />
              <span>{user.linkedin}</span>
            </a>
          )}
          {user.github && (
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
          {user.twitter && (
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
        {/* About Section - Highlighted */}
        {user.about && (
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

        {/* Skills Section */}
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
                  <div className="skill-progress"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Experience Section */}
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

        {/* Education Section */}
        {(user.tenthSchool || user.interCollege || user.degreeCollege) && (
          <div className="portfolio-section education-section">
            <div className="section-header">
              <FiBookOpen className="section-icon" />
              <h2>Education</h2>
              <div className="section-line"></div>
            </div>
            <div className="education-grid">
              {user.tenthSchool && (
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
              {user.interCollege && (
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
              {user.degreeCollege && (
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

        {/* Projects Section */}
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

        {/* Certifications Section */}
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

        {/* Languages Section */}
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
  );

  if (isLoading) {
    return (
      <div className="portfolio-loading">
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        <p>Loading your portfolio...</p>
      </div>
    );
  }

  return (
    <div className="portfolio-container">
      <div className="portfolio-wrapper">
        {/* Header */}
        <div className="portfolio-header">
          <div className="header-content">
            <div className="header-logo">
              <div className="logo-icon">
                <FiGlobe />
              </div>
              <div>
                <h1>Portfolio Generator</h1>
                <p>Create a stunning personal portfolio website in seconds</p>
              </div>
            </div>
          </div>
        </div>

        <div className="header-actions">
          {saveStatus === "saving" && (
            <div className="status-badge saving">
              <FiRefreshCw className="spin" /> Saving...
            </div>
          )}
          {saveStatus === "success" && (
            <div className="status-badge success">
              <FiCheckCircle /> Saved successfully!
            </div>
          )}
          {saveStatus === "exported" && (
            <div className="status-badge success">
              <FiCheckCircle /> PDF exported!
            </div>
          )}
          {saveStatus === "error" && (
            <div className="status-badge error">
              <FiX /> Error saving
            </div>
          )}
        </div>

        {/* Action Buttons - Large and Left Aligned */}
        <div className="portfolio-actions">
          <button className={`action-btn preview-btn ${!isEditing ? 'active' : ''}`} onClick={() => setIsEditing(false)}>
            <FiEye size={22} />
            Preview
          </button>
          <button className={`action-btn edit-btn ${isEditing ? 'active' : ''}`} onClick={() => setIsEditing(true)}>
            <FiEdit2 size={22} />
            Edit Data
          </button>
          <button className="action-btn export-btn" onClick={exportAsPDF}>
            <FiPrinter size={22} />
            Export Portfolio
          </button>
        </div>

        {/* Main Content */}
        <div className="portfolio-content">
          {!isEditing ? (
            <div className="portfolio-preview-container">
              {renderPortfolio()}
            </div>
          ) : (
            <div className="portfolio-edit-container">
              <div className="edit-header">
                <h3>Edit Your Portfolio Data</h3>
                <p>Fill in your details to create a professional portfolio</p>
              </div>
              
              <form className="portfolio-form">
                <div className="form-section">
                  <div className="section-title">
                    <FiUser />
                    <h4>Personal Information</h4>
                  </div>
                  <div className="form-grid">
                    <input name="name" value={user.name} onChange={handleChange} placeholder="Full Name" />
                    <input name="role" value={user.role} onChange={handleChange} placeholder="Professional Title" />
                    <input name="email" value={user.email} onChange={handleChange} placeholder="Email" />
                    <input name="phone" value={user.phone} onChange={handleChange} placeholder="Phone" />
                    <input name="address" value={user.address} onChange={handleChange} placeholder="Address" />
                    <input name="linkedin" value={user.linkedin} onChange={handleChange} placeholder="LinkedIn URL (e.g., linkedin.com/in/username)" />
                    <input name="github" value={user.github} onChange={handleChange} placeholder="GitHub URL" />
                    <input name="twitter" value={user.twitter} onChange={handleChange} placeholder="Twitter URL" />
                    <input name="profilePhoto" value={user.profilePhoto} onChange={handleChange} placeholder="Profile Photo URL" />
                  </div>
                </div>

                <div className="form-section">
                  <div className="section-title">
                    <FiBriefcase />
                    <h4>About & Summary</h4>
                  </div>
                  <textarea name="about" value={user.about} onChange={handleChange} rows="4" placeholder="Write a compelling bio about yourself..." />
                </div>

                <div className="form-section">
                  <div className="section-title">
                    <FiCpu />
                    <h4>Skills</h4>
                  </div>
                  <textarea name="skills" value={user.skills} onChange={handleChange} rows="3" placeholder="Enter skills separated by commas (e.g., React, Python, Node.js)" />
                </div>

                <div className="form-section">
                  <div className="section-title">
                    <FiBriefcase />
                    <h4>Experience</h4>
                  </div>
                  <textarea name="experience" value={user.experience} onChange={handleChange} rows="5" placeholder="Enter each experience on a new line (e.g., Software Engineer at Google, 2020-2023)" />
                </div>

                <div className="form-section">
                  <div className="section-title">
                    <FiBookOpen />
                    <h4>Education</h4>
                  </div>
                  <div className="form-grid">
                    <input name="tenthSchool" value={user.tenthSchool} onChange={handleChange} placeholder="10th School" />
                    <input name="tenthPercentage" value={user.tenthPercentage} onChange={handleChange} placeholder="10th Percentage" />
                    <input name="tenthYear" value={user.tenthYear} onChange={handleChange} placeholder="10th Year" />
                    <input name="interCollege" value={user.interCollege} onChange={handleChange} placeholder="Intermediate College" />
                    <input name="interCourse" value={user.interCourse} onChange={handleChange} placeholder="Intermediate Course" />
                    <input name="interPercentage" value={user.interPercentage} onChange={handleChange} placeholder="Intermediate Percentage" />
                    <input name="interYear" value={user.interYear} onChange={handleChange} placeholder="Intermediate Year" />
                    <input name="degreeCollege" value={user.degreeCollege} onChange={handleChange} placeholder="Degree College" />
                    <input name="degreeCourse" value={user.degreeCourse} onChange={handleChange} placeholder="Degree Course" />
                    <input name="degreePercentage" value={user.degreePercentage} onChange={handleChange} placeholder="Degree Percentage" />
                    <input name="degreeYear" value={user.degreeYear} onChange={handleChange} placeholder="Degree Year" />
                  </div>
                </div>

                <div className="form-section">
                  <div className="section-title">
                    <FiCode />
                    <h4>Projects</h4>
                  </div>
                  <textarea name="projects" value={user.projects} onChange={handleChange} rows="5" placeholder="Enter each project on a new line with description" />
                </div>

                <div className="form-section">
                  <div className="section-title">
                    <FiAward />
                    <h4>Certifications</h4>
                  </div>
                  <textarea name="certificates" value={user.certificates} onChange={handleChange} rows="3" placeholder="Enter each certification on a new line" />
                </div>

                <div className="form-section">
                  <div className="section-title">
                    <FiGlobe />
                    <h4>Languages</h4>
                  </div>
                  <input 
                    name="languages" 
                    value={user.languages} 
                    onChange={handleChange} 
                    placeholder="Enter languages separated by commas (e.g., English, Spanish, French)" 
                  />
                  <small style={{ color: '#6b7280', marginTop: '0.5rem', display: 'block' }}>
                    Example: English, Spanish, French, German
                  </small>
                </div>

                <div className="form-actions">
                  <button type="button" className="save-btn" onClick={handleSave}>
                    <FiSave size={18} />
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Portfolio;