import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import API_URL, { getImageUrl } from '../config';
import "./Profile.css";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiBriefcase,
  FiLinkedin,
  FiFileText,
  FiCpu,
  FiBookOpen,
  FiAward,
  FiCode,
  FiGlobe,
  FiSave,
  FiCamera,
  FiCheckCircle,
  FiAlertCircle,
  FiEdit2,
  FiRefreshCw,
  FiCalendar,
  FiCheck
} from "react-icons/fi";

function Profile() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    role: "",
    linkedin: "",
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

  const [activeSection, setActiveSection] = useState("personal");
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [aiSuccess, setAiSuccess] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);
  const [aiLoading, setAiLoading] = useState({
    summary: false,
    skills: false,
    experience: false
  });

  // Character limits
  const CHAR_LIMITS = {
    about: 1000,
    skills: 500,
    experience: 2000,
    projects: 1500,
    certificates: 800
  };

  // Store original user data to detect changes
  const originalUserRef = useRef(user);

  // Fetch profile on component mount
  useEffect(() => {
    fetchProfile();
  }, []);

  // Cleanup object URL on unmount or photo change
  useEffect(() => {
    return () => {
      if (user.profilePhoto && user.profilePhoto.startsWith('blob:')) {
        URL.revokeObjectURL(user.profilePhoto);
      }
    };
  }, [user.profilePhoto]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.get(`${API_URL}/api/profile/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success && res.data.profile) {
        const profileData = res.data.profile;
        setUser(prev => {
          const newUser = { ...prev, ...profileData };
          // Update original ref after state is set (use setTimeout or useEffect)
          originalUserRef.current = JSON.parse(JSON.stringify(newUser));
          return newUser;
        });
        setHasChanges(false);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      if (err.response?.status === 401) {
        // Redirect to login if needed
      }
    }
  };

  // Calculate profile completion (core fields only)
  const calculateCompletion = useCallback(() => {
    const coreFields = [
      user.name, user.email, user.role, user.about,
      user.skills, user.experience, user.projects,
      user.certificates, user.tenthSchool, user.interCollege, user.degreeCollege
    ];
    const filledFields = coreFields.filter(field => field && field.trim() !== "");
    const percentage = coreFields.length > 0 ? Math.round((filledFields.length / coreFields.length) * 100) : 0;
    setCompletionPercentage(percentage);
  }, [user]);

  useEffect(() => {
    calculateCompletion();
  }, [calculateCompletion]);

  // Detect changes (deep compare)
  useEffect(() => {
    const isChanged = JSON.stringify(user) !== JSON.stringify(originalUserRef.current);
    setHasChanges(isChanged);
  }, [user]);

  const changeHandler = (e) => {
    const { name, value } = e.target;
    if (CHAR_LIMITS[name] && value.length > CHAR_LIMITS[name]) return;
    setUser(prev => ({ ...prev, [name]: value }));
  };

  const validatePhone = (phone) => {
    if (!phone) return true;
    const phoneRegex = /^(\d{10}|\d{3}-\d{3}-\d{4})$/;
    if (!phoneRegex.test(phone)) return false;
    const digitsOnly = phone.replace(/-/g, '');
    if (/^0+$/.test(digitsOnly)) return false;
    return true;
  };

  const validateLinkedIn = (url) => {
    if (!url) return true;
    return url.includes('linkedin.com/in/') && url.length > 20;
  };

  const photoHandler = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
      const maxSize = 5 * 1024 * 1024;
      
      if (!validTypes.includes(file.type)) {
        alert('Please upload a valid image file (JPEG, PNG, GIF)');
        return;
      }
      if (file.size > maxSize) {
        alert('Image size should be less than 5MB');
        return;
      }
      
      if (user.profilePhoto && user.profilePhoto.startsWith('blob:')) {
        URL.revokeObjectURL(user.profilePhoto);
      }
      setPhotoFile(file);
      const imageURL = URL.createObjectURL(file);
      setUser(prev => ({ ...prev, profilePhoto: imageURL }));
    }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    
    if (!user.name?.trim()) {
      alert("Please enter your name");
      return;
    }
    if (!user.email?.trim()) {
      alert("Please enter your email");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email)) {
      alert("Please enter a valid email address");
      return;
    }
    if (!validatePhone(user.phone)) {
      alert("Please enter a valid phone number (10 digits or xxx-xxx-xxxx, not all zeros)");
      return;
    }
    if (!validateLinkedIn(user.linkedin)) {
      alert("Please enter a valid LinkedIn profile URL (e.g., https://linkedin.com/in/username)");
      return;
    }

    const currentYear = new Date().getFullYear();
    const years = [user.tenthYear, user.interYear, user.degreeYear].filter(y => y);
    for (let y of years) {
      const num = parseInt(y);
      if (isNaN(num) || num < 1950 || num > currentYear) {
        alert(`Please enter a valid year between 1950 and ${currentYear}`);
        return;
      }
    }

    setIsLoading(true);
    setSaveStatus(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please Login First ❌");
        setIsLoading(false);
        return;
      }

      const formData = new FormData();
      Object.keys(user).forEach(key => {
        if (user[key] !== null && user[key] !== undefined && user[key] !== "") {
          formData.append(key, user[key]);
        }
      });
      if (photoFile) {
        formData.append("profilePhoto", photoFile);
      }

      const res = await axios.post(`${API_URL}/api/profile/save`, formData, { 
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        } 
      });

      if (res.data.success) {
        setSaveStatus("success");
        // Update original reference after successful save
        const cleanUser = { ...user };
        originalUserRef.current = JSON.parse(JSON.stringify(cleanUser));
        setHasChanges(false);
        await fetchProfile();
        setTimeout(() => setSaveStatus(null), 3000);
      } else {
        setSaveStatus("error");
        setTimeout(() => setSaveStatus(null), 3000);
      }
    } catch (err) {
      console.error("Save Error:", err);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(null), 3000);
      
      if (err.response?.data?.message) {
        alert(err.response.data.message);
      } else if (err.response?.status === 401) {
        alert("Session expired. Please login again.");
      } else {
        alert("Failed to save profile. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const generateSummary = async () => {
    if (!user.role && !user.skills) {
      alert("Please enter your role or skills first for better AI suggestions.");
      return;
    }
    setAiLoading(prev => ({ ...prev, summary: true }));
    try {
      const res = await axios.post(`${API_URL}/api/ai/summary`, {
        role: user.role,
        skills: user.skills,
        experience: user.experience || ""
      });
      if (res.data.success) {
        setUser(prev => ({ ...prev, about: res.data.summary }));
        setAiSuccess("summary");
        setTimeout(() => setAiSuccess(null), 3000);
      } else {
        alert("AI failed: " + res.data.message);
      }
    } catch (err) {
      console.log("SUMMARY ERROR:", err);
      alert("Error generating summary");
    } finally {
      setAiLoading(prev => ({ ...prev, summary: false }));
    }
  };

  const generateSkills = async () => {
    if (!user.role) {
      alert("Please enter your professional role first for better skill suggestions.");
      return;
    }
    setAiLoading(prev => ({ ...prev, skills: true }));
    try {
      const res = await axios.post(`${API_URL}/api/ai/skills`, { role: user.role });
      if (res.data.success) {
        setUser(prev => ({ ...prev, skills: res.data.skills }));
        setAiSuccess("skills");
        setTimeout(() => setAiSuccess(null), 3000);
      } else {
        alert("AI failed: " + res.data.message);
      }
    } catch (err) {
      console.log("SKILLS ERROR:", err);
      alert("Error generating skills");
    } finally {
      setAiLoading(prev => ({ ...prev, skills: false }));
    }
  };

  const improveExperience = async () => {
    if (!user.experience || user.experience.trim() === "") {
      alert("Please enter some experience details first. The AI needs something to improve!");
      return;
    }
    setAiLoading(prev => ({ ...prev, experience: true }));
    try {
      const res = await axios.post(`${API_URL}/api/ai/experience`, {
        experience: user.experience,
        role: user.role,
        skills: user.skills,
        name: user.name
      });
      if (res.data.success) {
        const improvedText = res.data.improved || res.data.experience || res.data.result;
        if (improvedText) {
          setUser(prev => ({ ...prev, experience: improvedText }));
          setAiSuccess("experience");
          setTimeout(() => setAiSuccess(null), 3000);
        } else {
          alert("AI response was empty. Please try again.");
        }
      } else {
        alert("AI failed: " + (res.data.message || "Please check your input"));
      }
    } catch (err) {
      console.log("EXPERIENCE ERROR:", err);
      if (err.response?.status === 400) {
        alert(err.response?.data?.message || "Invalid request. Please ensure you have entered experience details.");
      } else if (err.response?.status === 500) {
        alert("Server error. Please try again later.");
      } else {
        alert("Error improving experience. Please try again.");
      }
    } finally {
      setAiLoading(prev => ({ ...prev, experience: false }));
    }
  };

  const sections = [
    { id: "personal", label: "Personal Info", icon: FiUser, color: "#4361ee", description: "Basic information" },
    { id: "career", label: "Career Summary", icon: FiFileText, color: "#06d6a0", description: "Professional summary" },
    { id: "skills", label: "Skills", icon: FiCpu, color: "#f9c74f", description: "Technical expertise" },
    { id: "education", label: "Education", icon: FiBookOpen, color: "#f9844a", description: "Academic background" },
    { id: "experience", label: "Experience", icon: FiBriefcase, color: "#9c89b8", description: "Work history" },
    { id: "projects", label: "Projects", icon: FiCode, color: "#4c9aff", description: "Portfolio projects" },
    { id: "certificates", label: "Certifications", icon: FiAward, color: "#06d6a0", description: "Credentials" },
    { id: "languages", label: "Languages", icon: FiGlobe, color: "#f9c74f", description: "Language skills" }
  ];

  const renderCharCounter = (fieldName, value) => {
    const limit = CHAR_LIMITS[fieldName];
    if (!limit) return null;
    const currentLength = (value || "").length;
    return (
      <div className="char-counter" style={{ fontSize: "11px", color: currentLength > limit ? "#ef4444" : "#94a3b8", marginTop: "4px", textAlign: "right" }}>
        {currentLength}/{limit} characters
      </div>
    );
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="profile-page">
      <div className="profile-container-modern">
        {/* Header Section */}
        <div className="profile-header-modern">
          <div className="header-left">
            <div className="header-badge">
              <FiEdit2 size={16} />
              <span>Profile Management</span>
            </div>
            <h1>Your Profile</h1>
            <p>Manage your personal information and build your professional identity</p>
          </div>
          <div className="header-right">
            {saveStatus === "success" && (
              <div className="toast-success">
                <FiCheckCircle size={18} />
                <span>Profile saved successfully!</span>
              </div>
            )}
            {saveStatus === "error" && (
              <div className="toast-error">
                <FiAlertCircle size={18} />
                <span>Error saving profile</span>
              </div>
            )}
            {aiSuccess === "summary" && (
              <div className="toast-ai-success">
                <FiCheckCircle size={18} />
                <span>AI generated your professional summary!</span>
              </div>
            )}
            {aiSuccess === "skills" && (
              <div className="toast-ai-success">
                <FiCheckCircle size={18} />
                <span>AI suggested skills added!</span>
              </div>
            )}
            {aiSuccess === "experience" && (
              <div className="toast-ai-success">
                <FiCheckCircle size={18} />
                <span>AI improved your experience description!</span>
              </div>
            )}
            <div className="completion-card">
              <div className="completion-header">
                <FiCheck size={16} />
                <span>Profile Completion</span>
              </div>
              <div className="completion-bar">
                <div className="completion-fill" style={{ width: `${completionPercentage}%` }} />
              </div>
              <div className="completion-text">{completionPercentage}% Complete</div>
            </div>
          </div>
        </div>

        <div className="profile-layout">
          {/* Sidebar */}
          <div className="profile-sidebar-modern">
            <div className="avatar-section">
              <div className="avatar-container">
                <img
                  src={user.profilePhoto ? getImageUrl(user.profilePhoto) : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 24 24' fill='%234361ee'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E"}
                  alt={user.name || "Profile"}
                  className="avatar-image"
                />
                <label className="avatar-upload" htmlFor="profile-photo-input">
                  <FiCamera size={16} />
                  <input id="profile-photo-input" type="file" onChange={photoHandler} hidden accept="image/*" />
                </label>
              </div>
              <h3 className="avatar-name">{user.name || "Your Name"}</h3>
              <p className="avatar-title">{user.role || "Professional"}</p>
              <div className="avatar-contact">
                {user.email && <span><FiMail size={12} /> {user.email}</span>}
                {user.phone && <span><FiPhone size={12} /> {user.phone}</span>}
              </div>
            </div>

            <nav className="section-nav">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    className={`nav-button ${activeSection === section.id ? "active" : ""}`}
                    onClick={() => setActiveSection(section.id)}
                    type="button"
                  >
                    <div className="nav-icon" style={{ backgroundColor: `${section.color}15`, color: section.color }}>
                      <Icon size={18} />
                    </div>
                    <div className="nav-text">
                      <span className="nav-label">{section.label}</span>
                      <span className="nav-description">{section.description}</span>
                    </div>
                    {activeSection === section.id && <div className="nav-indicator" style={{ background: section.color }} />}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="profile-main">
            <form onSubmit={saveProfile} className="profile-form">
              {/* Personal Information */}
              {activeSection === "personal" && (
                <div className="form-card animate-fadeIn">
                  <div className="card-header">
                    <div className="header-icon" style={{ background: "#4361ee15", color: "#4361ee" }}>
                      <FiUser size={24} />
                    </div>
                    <div>
                      <h2>Personal Information</h2>
                      <p>Update your basic personal details</p>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="form-grid">
                      <div className="input-group">
                        <label htmlFor="name">Full Name *</label>
                        <div className="input-with-icon">
                          <FiUser size={18} />
                          <input id="name" name="name" value={user.name} placeholder="Enter your full name" onChange={changeHandler} required />
                        </div>
                      </div>
                      <div className="input-group">
                        <label htmlFor="email">Email Address *</label>
                        <div className="input-with-icon">
                          <FiMail size={18} />
                          <input id="email" name="email" value={user.email} placeholder="Enter your email" onChange={changeHandler} type="email" required />
                        </div>
                      </div>
                      <div className="input-group">
                        <label htmlFor="phone">Phone Number</label>
                        <div className="input-with-icon">
                          <FiPhone size={18} />
                          <input id="phone" name="phone" value={user.phone} placeholder="10 digits or xxx-xxx-xxxx" onChange={changeHandler} type="tel" />
                        </div>
                      </div>
                      <div className="input-group">
                        <label htmlFor="address">Address</label>
                        <div className="input-with-icon">
                          <FiMapPin size={18} />
                          <input id="address" name="address" value={user.address} placeholder="Enter your address" onChange={changeHandler} />
                        </div>
                      </div>
                      <div className="input-group">
                        <label htmlFor="role">Professional Role</label>
                        <div className="input-with-icon">
                          <FiBriefcase size={18} />
                          <input id="role" name="role" value={user.role} placeholder="e.g., Software Engineer" onChange={changeHandler} />
                        </div>
                      </div>
                      <div className="input-group">
                        <label htmlFor="linkedin">LinkedIn Profile</label>
                        <div className="input-with-icon">
                          <FiLinkedin size={18} />
                          <input id="linkedin" name="linkedin" value={user.linkedin} placeholder="https://linkedin.com/in/username" onChange={changeHandler} type="url" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Career Summary */}
              {activeSection === "career" && (
                <div className="form-card animate-fadeIn">
                  <div className="card-header">
                    <div className="header-icon" style={{ background: "#06d6a015", color: "#06d6a0" }}>
                      <FiFileText size={24} />
                    </div>
                    <div>
                      <h2>Career Summary</h2>
                      <p>Tell employers about your professional background</p>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="input-group full-width">
                      <div className="ai-button-group">
                        <label htmlFor="about">Professional Summary</label>
                        <button type="button" onClick={generateSummary} disabled={aiLoading.summary} className="ai-button summary">
                          {aiLoading.summary ? <><FiRefreshCw className="spin" size={16} /> Generating...</> : <><FiRefreshCw size={16} /> Generate AI Summary</>}
                        </button>
                      </div>
                      <textarea id="about" name="about" value={user.about} placeholder="Write a compelling summary about your career goals, experience, and what you're looking for..." onChange={changeHandler} rows="8" />
                      {renderCharCounter("about", user.about)}
                      <small className="input-hint">Aim for 2-3 paragraphs highlighting your key strengths</small>
                    </div>
                  </div>
                </div>
              )}

              {/* Skills */}
              {activeSection === "skills" && (
                <div className="form-card animate-fadeIn">
                  <div className="card-header">
                    <div className="header-icon" style={{ background: "#f9c74f15", color: "#f9c74f" }}>
                      <FiCpu size={24} />
                    </div>
                    <div>
                      <h2>Skills & Expertise</h2>
                      <p>Showcase your technical and professional skills</p>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="input-group full-width">
                      <div className="ai-button-group">
                        <label htmlFor="skills">Technical & Professional Skills</label>
                        <button type="button" onClick={generateSkills} disabled={aiLoading.skills} className="ai-button skills">
                          {aiLoading.skills ? <><FiRefreshCw className="spin" size={16} /> Suggesting...</> : <><FiRefreshCw size={16} /> Suggest Skills with AI</>}
                        </button>
                      </div>
                      <textarea id="skills" name="skills" value={user.skills} placeholder="List your skills (e.g., React, Python, SQL, Project Management, Team Leadership)" onChange={changeHandler} rows="6" />
                      {renderCharCounter("skills", user.skills)}
                      <small className="input-hint">Separate skills with commas for better formatting</small>
                    </div>
                  </div>
                </div>
              )}

              {/* Education */}
              {activeSection === "education" && (
                <div className="form-card animate-fadeIn">
                  <div className="card-header">
                    <div className="header-icon" style={{ background: "#f9844a15", color: "#f9844a" }}>
                      <FiBookOpen size={24} />
                    </div>
                    <div>
                      <h2>Education</h2>
                      <p>Your academic qualifications</p>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="education-card">
                      <h3>Secondary Education (10th)</h3>
                      <div className="form-grid">
                        <div className="input-group"><label htmlFor="tenthSchool">School Name</label><input id="tenthSchool" name="tenthSchool" value={user.tenthSchool} placeholder="School Name" onChange={changeHandler} /></div>
                        <div className="input-group"><label htmlFor="tenthPercentage">Percentage / CGPA</label><input id="tenthPercentage" name="tenthPercentage" value={user.tenthPercentage} placeholder="e.g., 85% or 8.5 CGPA" onChange={changeHandler} /></div>
                        <div className="input-group"><label htmlFor="tenthYear">Year of Completion</label><div className="input-with-icon"><FiCalendar size={16} /><input id="tenthYear" name="tenthYear" type="number" min="1950" max={currentYear} value={user.tenthYear} placeholder="e.g., 2015" onChange={changeHandler} /></div></div>
                      </div>
                    </div>
                    <div className="education-card">
                      <h3>Higher Secondary / Diploma</h3>
                      <div className="form-grid">
                        <div className="input-group"><label htmlFor="interCollege">College Name</label><input id="interCollege" name="interCollege" value={user.interCollege} placeholder="College / Institute" onChange={changeHandler} /></div>
                        <div className="input-group"><label htmlFor="interCourse">Course</label><input id="interCourse" name="interCourse" value={user.interCourse} placeholder="e.g., MPC, BiPC, Diploma in CS" onChange={changeHandler} /></div>
                        <div className="input-group"><label htmlFor="interPercentage">Percentage / CGPA</label><input id="interPercentage" name="interPercentage" value={user.interPercentage} placeholder="Percentage" onChange={changeHandler} /></div>
                        <div className="input-group"><label htmlFor="interYear">Year of Completion</label><div className="input-with-icon"><FiCalendar size={16} /><input id="interYear" name="interYear" type="number" min="1950" max={currentYear} value={user.interYear} placeholder="Year" onChange={changeHandler} /></div></div>
                      </div>
                    </div>
                    <div className="education-card">
                      <h3>Degree / Graduation</h3>
                      <div className="form-grid">
                        <div className="input-group"><label htmlFor="degreeCollege">College / University</label><input id="degreeCollege" name="degreeCollege" value={user.degreeCollege} placeholder="College / University" onChange={changeHandler} /></div>
                        <div className="input-group"><label htmlFor="degreeCourse">Course</label><input id="degreeCourse" name="degreeCourse" value={user.degreeCourse} placeholder="e.g., B.Tech, B.Sc, B.Com" onChange={changeHandler} /></div>
                        <div className="input-group"><label htmlFor="degreePercentage">Percentage / CGPA</label><input id="degreePercentage" name="degreePercentage" value={user.degreePercentage} placeholder="Percentage" onChange={changeHandler} /></div>
                        <div className="input-group"><label htmlFor="degreeYear">Year of Completion</label><div className="input-with-icon"><FiCalendar size={16} /><input id="degreeYear" name="degreeYear" type="number" min="1950" max={currentYear} value={user.degreeYear} placeholder="Year" onChange={changeHandler} /></div></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Experience */}
              {activeSection === "experience" && (
                <div className="form-card animate-fadeIn">
                  <div className="card-header">
                    <div className="header-icon" style={{ background: "#8b5cf615", color: "#8b5cf6" }}>
                      <FiBriefcase size={24} />
                    </div>
                    <div>
                      <h2>Work Experience</h2>
                      <p>Your professional journey</p>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="input-group full-width">
                      <div className="ai-button-group">
                        <label htmlFor="experience">Professional Experience</label>
                        <button type="button" onClick={improveExperience} disabled={aiLoading.experience} className="ai-button experience">
                          {aiLoading.experience ? <><FiRefreshCw className="spin" size={16} /> Improving...</> : <><FiRefreshCw size={16} /> Improve with AI</>}
                        </button>
                      </div>
                      <textarea id="experience" name="experience" value={user.experience} placeholder="Describe your work experience, internships, and achievements..." onChange={changeHandler} rows="10" />
                      {renderCharCounter("experience", user.experience)}
                      <small className="input-hint">Include company names, roles, duration, and key achievements</small>
                    </div>
                  </div>
                </div>
              )}

              {/* Projects */}
              {activeSection === "projects" && (
                <div className="form-card animate-fadeIn">
                  <div className="card-header">
                    <div className="header-icon" style={{ background: "#4c9aff15", color: "#4c9aff" }}>
                      <FiCode size={24} />
                    </div>
                    <div>
                      <h2>Projects</h2>
                      <p>Showcase your best work</p>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="input-group full-width">
                      <label htmlFor="projects">Key Projects</label>
                      <textarea id="projects" name="projects" value={user.projects} placeholder="List your notable projects with descriptions, technologies used, and your role..." onChange={changeHandler} rows="10" />
                      {renderCharCounter("projects", user.projects)}
                      <small className="input-hint">Highlight your best projects and contributions</small>
                    </div>
                  </div>
                </div>
              )}

              {/* Certifications */}
              {activeSection === "certificates" && (
                <div className="form-card animate-fadeIn">
                  <div className="card-header">
                    <div className="header-icon" style={{ background: "#06d6a015", color: "#06d6a0" }}>
                      <FiAward size={24} />
                    </div>
                    <div>
                      <h2>Certifications</h2>
                      <p>Your professional credentials</p>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="input-group full-width">
                      <label htmlFor="certificates">Certificates & Achievements</label>
                      <textarea id="certificates" name="certificates" value={user.certificates} placeholder="List your certifications, awards, and achievements..." onChange={changeHandler} rows="8" />
                      {renderCharCounter("certificates", user.certificates)}
                    </div>
                  </div>
                </div>
              )}

              {/* Languages */}
              {activeSection === "languages" && (
                <div className="form-card animate-fadeIn">
                  <div className="card-header">
                    <div className="header-icon" style={{ background: "#f9c74f15", color: "#f9c74f" }}>
                      <FiGlobe size={24} />
                    </div>
                    <div>
                      <h2>Languages</h2>
                      <p>Language proficiency</p>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="input-group full-width">
                      <label htmlFor="languages">Languages Known</label>
                      <input id="languages" name="languages" value={user.languages} placeholder="e.g., English (Fluent), Hindi (Native), Spanish (Basic)" onChange={changeHandler} />
                      <small className="input-hint">Include proficiency level for each language</small>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="form-actions-modern">
                <button type="submit" className="save-button" disabled={isLoading || !hasChanges} aria-label="Save profile changes">
                  {isLoading ? <><FiRefreshCw className="spin" /> Saving...</> : <><FiSave size={18} /> Save All Changes</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;