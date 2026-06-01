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
  FiPrinter,
  FiLink,
  FiShare2,
  FiCopy,
  FiCheck,
  FiDownload
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

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
    profilePhoto: "",
    portfolioUrl: ""
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [userId, setUserId] = useState(null);
  const [portfolioId, setPortfolioId] = useState(null);
  const portfolioRef = useRef();

  useEffect(() => {
    fetchProfile();
    fetchPortfolio();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        setIsLoading(false);
        return;
      }

      const res = await axios.get(
        "http://localhost:5000/api/profile/me",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success && res.data.profile) {
        setUser(prev => ({ ...prev, ...res.data.profile }));
        if (res.data.profile.userId) {
          setUserId(res.data.profile.userId);
        }
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setSaveError("Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPortfolio = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      const res = await axios.get(
        "http://localhost:5000/api/portfolio/my-portfolio",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (res.data.success && res.data.portfolio) {
        setPortfolioId(res.data.portfolio._id);
      }
    } catch (err) {
      console.error("Error fetching portfolio:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaveStatus("saving");
    setSaveError(null);
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please login again.");
      }

      // Save/update profile - send all user data as JSON
      const profileRes = await axios.post(
        "http://localhost:5000/api/profile/save",
        user,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      if (profileRes.data.success) {
        if (profileRes.data.profile) {
          setUser(prev => ({ ...prev, ...profileRes.data.profile }));
          if (profileRes.data.profile.userId) {
            setUserId(profileRes.data.profile.userId);
          }
        }
        
        if (!portfolioId) {
          try {
            const portfolioRes = await axios.post(
              "http://localhost:5000/api/portfolio/create",
              {},
              { 
                headers: { 
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json'
                } 
              }
            );
            
            if (portfolioRes.data.success) {
              setPortfolioId(portfolioRes.data.portfolio?._id);
            }
          } catch (portfolioErr) {
            console.error("Error creating portfolio:", portfolioErr);
          }
        }
        
        setSaveStatus("success");
        setIsEditing(false);
        setTimeout(() => setSaveStatus(null), 3000);
      } else {
        throw new Error(profileRes.data.message || "Failed to save profile");
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      setSaveError(err.response?.data?.message || err.message || "Error saving data");
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(null), 5000);
    }
  };

  const downloadAsPDF = async () => {
    const input = portfolioRef.current;
    if (!input) return;
    
    setSaveStatus("downloading");
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      
      const canvas = await html2canvas(input, { 
        scale: 2, 
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: false
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`${user.name || "Portfolio"}_portfolio.pdf`);
      
      setSaveStatus("downloaded");
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error("Download error:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const getShareableLink = () => {
    const baseUrl = window.location.origin;
    if (userId) {
      return `${baseUrl}/portfolio/share/${userId}`;
    } else if (user.email) {
      const encodedEmail = btoa(user.email).replace(/=/g, '');
      return `${baseUrl}/portfolio/share/${encodedEmail}`;
    }
    return `${baseUrl}/portfolio/share/temp`;
  };

  const copyToClipboard = async () => {
    const link = getShareableLink();
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const shareViaEmail = () => {
    const link = getShareableLink();
    const subject = encodeURIComponent(`${user.name || "My"} Professional Portfolio`);
    const body = encodeURIComponent(
      `Hello,\n\n` +
      `I'd like to share my professional portfolio with you.\n\n` +
      `View my portfolio here: ${link}\n\n` +
      `Best regards,\n${user.name || "Candidate"}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setShowShareModal(false);
  };

  const shareViaLinkedIn = () => {
    const url = getShareableLink();
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
    setShowShareModal(false);
  };

  const shareViaTwitter = () => {
    const url = getShareableLink();
    const text = encodeURIComponent(`Check out my professional portfolio! ${user.name || "Candidate"} - ${user.role || "Professional"}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    setShowShareModal(false);
  };

  const shareViaWhatsApp = () => {
    const url = getShareableLink();
    const text = encodeURIComponent(`Check out my professional portfolio! ${user.name || "Candidate"} - ${user.role || "Professional"}\n\nView here: ${url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
    setShowShareModal(false);
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
              <span>LinkedIn</span>
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
                      <span>Learn More</span>
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
          <button className="share-btn-header" onClick={() => setShowShareModal(true)}>
            <FiShare2 size={18} />
            Share Portfolio
          </button>
        </div>

        <div className="header-actions">
          {saveStatus === "saving" && (
            <div className="status-badge saving">
              <FiRefreshCw className="spin" /> Saving to database...
            </div>
          )}
          {saveStatus === "downloading" && (
            <div className="status-badge saving">
              <FiRefreshCw className="spin" /> Generating PDF...
            </div>
          )}
          {saveStatus === "downloaded" && (
            <div className="status-badge success">
              <FiCheckCircle /> PDF downloaded successfully!
            </div>
          )}
          {saveStatus === "success" && (
            <div className="status-badge success">
              <FiCheckCircle /> Saved to database successfully!
            </div>
          )}
          {saveStatus === "error" && saveError && (
            <div className="status-badge error">
              <FiX /> {saveError}
            </div>
          )}
        </div>

        <div className="portfolio-actions">
          <button 
            className={`action-btn ${!isEditing ? 'active' : ''}`} 
            onClick={() => setIsEditing(false)}
          >
            <FiEye size={20} />
            Preview Portfolio
          </button>
          <button 
            className={`action-btn ${isEditing ? 'active' : ''}`} 
            onClick={() => setIsEditing(true)}
          >
            <FiEdit2 size={20} />
            Edit Data
          </button>
          <button className="action-btn download-btn" onClick={downloadAsPDF}>
            <FiDownload size={20} />
            Download PDF
          </button>
        </div>

        {showShareModal && (
          <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
            <div className="share-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>
                  <FiShare2 /> Share Your Portfolio
                </h3>
                <button className="close-modal" onClick={() => setShowShareModal(false)}>
                  <FiX />
                </button>
              </div>
              
              <div className="modal-body">
                <p className="share-description">
                  Share this link with potential employers to showcase your skills and experience.
                </p>
                
                <div className="share-link-container">
                  <div className="share-link-input">
                    <FiLink className="link-icon" />
                    <input 
                      type="text" 
                      readOnly 
                      value={getShareableLink()} 
                      id="shareLink"
                      onClick={(e) => e.target.select()}
                    />
                  </div>
                  <button className="copy-btn" onClick={copyToClipboard}>
                    {copied ? <FiCheck /> : <FiCopy />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                
                <div className="share-options">
                  <p className="share-options-title">Or share via:</p>
                  <div className="share-buttons">
                    <button className="share-option-btn email" onClick={shareViaEmail}>
                      <FiMail />
                      Email
                    </button>
                    <button className="share-option-btn linkedin" onClick={shareViaLinkedIn}>
                      <FiLinkedin />
                      LinkedIn
                    </button>
                    <button className="share-option-btn twitter" onClick={shareViaTwitter}>
                      <FiTwitter />
                      Twitter
                    </button>
                    <button className="share-option-btn whatsapp" onClick={shareViaWhatsApp}>
                      <FaWhatsapp />
                      WhatsApp
                    </button>
                  </div>
                </div>
                
                <div className="share-tip">
                  <small>
                    💡 Tip: Click the Edit Data button to update your portfolio, then save!
                  </small>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="portfolio-content">
          {!isEditing ? (
            <>
              <div className="portfolio-preview-container">
                {renderPortfolio()}
              </div>
              <div className="save-portfolio-section">
                <button className="save-portfolio-btn" onClick={handleSave}>
                  <FiSave size={20} />
                  Save Portfolio to Database
                </button>
                <p className="save-hint">Save your portfolio to generate a shareable link and keep your data safe!</p>
              </div>
            </>
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
                    <input name="linkedin" value={user.linkedin} onChange={handleChange} placeholder="LinkedIn URL" />
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
                  <textarea name="experience" value={user.experience} onChange={handleChange} rows="5" placeholder="Enter each experience on a new line" />
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
                  <button type="button" className="cancel-edit-btn" onClick={() => setIsEditing(false)}>
                    Cancel
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