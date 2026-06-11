import React, { useState, useEffect, useCallback, useRef, memo } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import API_URL from '../config';
import "./EditResumes.css";
import {
  FiUser, FiMail, FiPhone, FiMapPin, FiBriefcase, FiLinkedin,
  FiGithub, FiTwitter, FiCpu, FiBookOpen, FiAward, FiGlobe,
  FiCalendar, FiPercent, FiSave, FiEdit2, FiTrash2, FiX,
  FiCheck, FiClock, FiFileText, FiCode, FiStar, FiSearch,
  FiMenu, FiImage, FiUploadCloud, FiAlertCircle, FiLoader
} from "react-icons/fi";

// Memoized Field component to prevent unnecessary re-renders
const Field = memo(({ label, name, type = "text", multiline = false, icon: Icon, placeholder, rows = 4, value, onChange, isEditing }) => {
  const handleLocalChange = (e) => {
    onChange(e);
  };

  return (
    <div className={`er-input-group ${isEditing ? "editing-mode" : "view-mode"}`}>
      <label className="er-input-label">
        {Icon && <Icon size={14} className="label-icon" />}
        {label}
      </label>
      {multiline ? (
        <textarea
          name={name}
          value={value || ""}
          onChange={handleLocalChange}
          readOnly={!isEditing}
          className="er-input-field er-textarea"
          rows={rows}
          placeholder={placeholder || `Enter ${label.toLowerCase()}`}
        />
      ) : (
        <div className="input-wrapper">
          {Icon && <Icon size={16} className="input-icon" />}
          <input
            type={type}
            name={name}
            value={value || ""}
            onChange={handleLocalChange}
            readOnly={!isEditing}
            className="er-input-field"
            placeholder={placeholder || `Enter ${label.toLowerCase()}`}
          />
        </div>
      )}
    </div>
  );
});

function EditResume({ onResumeUpdated }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState(null);
  const [saveErrorMessage, setSaveErrorMessage] = useState("");
  const [activeTab, setActiveTab] = useState("personal");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoUrlError, setPhotoUrlError] = useState("");
  const [validatingPhotoUrl, setValidatingPhotoUrl] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const originalFormRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", address: "", role: "",
    linkedin: "", github: "", twitter: "",
    about: "", skills: "", experience: "",
    projects: "", certificates: "", languages: "",
    tenthSchool: "", tenthPercentage: "", tenthYear: "",
    interCollege: "", interCourse: "", interPercentage: "", interYear: "",
    degreeCollege: "", degreeCourse: "", degreePercentage: "", degreeYear: "",
    profilePhoto: ""
  });

  // Stable handleChange to avoid recreation on each render
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  // Fetch all resumes
  const fetchResumes = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return [];
      }
      const res = await axios.get(`${API_URL}/api/resume/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        const formatted = res.data.resumes.map(r => ({
          ...r.data, _id: r._id, updatedAt: r.updatedAt
        }));
        setResumes(formatted);
        return formatted;
      }
    } catch (err) {
      console.error("Error fetching resumes:", err);
    } finally {
      setIsLoading(false);
    }
    return [];
  }, [navigate]);

  // Load specific resume by ID
  const fetchSingleResume = useCallback(async (resumeId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/resume/${resumeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        const resumeData = res.data.resume;
        setSelectedResume(resumeData);
        setFormData(resumeData);
        originalFormRef.current = JSON.parse(JSON.stringify(resumeData));
        setHasUnsavedChanges(false);
        return resumeData;
      }
    } catch (err) {
      console.error("Error fetching single resume:", err);
    }
    return null;
  }, []);

  useEffect(() => {
    const load = async () => {
      const allResumes = await fetchResumes();
      if (id) {
        const existing = allResumes.find(r => r._id === id);
        if (existing) {
          setSelectedResume(existing);
          setFormData(existing);
          originalFormRef.current = JSON.parse(JSON.stringify(existing));
        } else {
          // Fetch directly if not in list (e.g., direct URL)
          const single = await fetchSingleResume(id);
          if (single) {
            setResumes(prev => [single, ...prev]);
          }
        }
      }
    };
    load();
  }, [fetchResumes, id, fetchSingleResume]);

  // Track unsaved changes
  useEffect(() => {
    if (originalFormRef.current && isEditing) {
      const changed = JSON.stringify(formData) !== JSON.stringify(originalFormRef.current);
      setHasUnsavedChanges(changed);
    }
  }, [formData, isEditing]);

  const handleSelectResume = (resume) => {
    if (isEditing && hasUnsavedChanges) {
      if (!window.confirm("You have unsaved changes. Discard them?")) return;
    }
    setSelectedResume(resume);
    setFormData(resume);
    originalFormRef.current = JSON.parse(JSON.stringify(resume));
    setIsEditing(false);
    setActiveTab("personal");
    setSaveStatus(null);
    setHasUnsavedChanges(false);
    setMobileSidebarOpen(false);
  };

  const validateForm = () => {
    if (!formData.name?.trim()) {
      setSaveErrorMessage("Full name is required");
      return false;
    }
    if (!formData.email?.trim()) {
      setSaveErrorMessage("Email is required");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setSaveErrorMessage("Please enter a valid email address");
      return false;
    }
    if (formData.phone && !/^[\d\s+()-]{8,20}$/.test(formData.phone)) {
      setSaveErrorMessage("Phone number invalid");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!selectedResume) {
      setSaveErrorMessage("No resume selected");
      return;
    }
    if (!validateForm()) return;
    setSaveStatus("saving");
    setSaveErrorMessage("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${API_URL}/api/resume/${selectedResume._id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setSaveStatus("success");
        setSelectedResume(formData);
        originalFormRef.current = JSON.parse(JSON.stringify(formData));
        setHasUnsavedChanges(false);
        setIsEditing(false);
        await fetchResumes();
        if (onResumeUpdated) onResumeUpdated();
        setTimeout(() => setSaveStatus(null), 3000);
      } else {
        throw new Error(res.data.message || "Save failed");
      }
    } catch (err) {
      console.error("Error saving resume:", err);
      setSaveStatus("error");
      setSaveErrorMessage(err.response?.data?.message || err.message || "Could not save resume");
      setTimeout(() => setSaveStatus(null), 5000);
    }
  };

  const handleDelete = async (idToDelete, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this resume permanently?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.delete(`${API_URL}/api/resume/${idToDelete}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        await fetchResumes();
        if (selectedResume?._id === idToDelete) {
          const remaining = resumes.filter(r => r._id !== idToDelete);
          if (remaining.length > 0) {
            handleSelectResume(remaining[0]);
          } else {
            setSelectedResume(null);
            setFormData({});
            originalFormRef.current = null;
          }
        }
        if (onResumeUpdated) onResumeUpdated();
      }
    } catch (err) {
      console.error("Error deleting resume:", err);
      alert("Failed to delete resume");
    }
  };

  const handleCancelEdit = () => {
    if (hasUnsavedChanges) {
      if (!window.confirm("You have unsaved changes. Discard them?")) return;
    }
    setFormData(selectedResume);
    originalFormRef.current = JSON.parse(JSON.stringify(selectedResume));
    setIsEditing(false);
    setHasUnsavedChanges(false);
    setSaveErrorMessage("");
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isEditing) return;
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      } else if (e.key === 'Escape') {
        handleCancelEdit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditing, handleSave, handleCancelEdit]);

  // Profile photo upload
  const compressImage = (file, maxWidth = 400) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => resolve(blob), file.type, 0.8);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const uploadProfilePhoto = async (file) => {
    setUploadingPhoto(true);
    try {
      const token = localStorage.getItem("token");
      const compressed = await compressImage(file, 400);
      const formDataPhoto = new FormData();
      formDataPhoto.append("profilePhoto", compressed, file.name);
      const res = await axios.post(`${API_URL}/api/profile/upload-photo`, formDataPhoto, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
      });
      if (res.data.success) {
        const photoUrl = res.data.photoUrl;
        setFormData(prev => ({ ...prev, profilePhoto: photoUrl }));
        setHasUnsavedChanges(true);
        return photoUrl;
      } else {
        throw new Error(res.data.message || "Upload failed");
      }
    } catch (err) {
      console.error(err);
      setSaveErrorMessage("Photo upload failed");
      return null;
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleProfilePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setSaveErrorMessage("Please select an image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setSaveErrorMessage("Image size should be less than 2MB");
      return;
    }
    await uploadProfilePhoto(file);
  };

  // Validate image URL by attempting to load it
  const validateImageUrl = (url) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  };

  const handleProfilePhotoUrlChange = async (e) => {
    const url = e.target.value;
    setFormData(prev => ({ ...prev, profilePhoto: url }));
    setHasUnsavedChanges(true);
    
    if (!url) {
      setPhotoUrlError("");
      return;
    }
    
    if (!url.match(/^https?:\/\/.+/i)) {
      setPhotoUrlError("Invalid URL format (must start with http:// or https://)");
      return;
    }
    
    setValidatingPhotoUrl(true);
    const isValid = await validateImageUrl(url);
    setValidatingPhotoUrl(false);
    
    if (!isValid) {
      setPhotoUrlError("Image cannot be loaded. Please check the URL.");
    } else {
      setPhotoUrlError("");
    }
  };

  const clearProfilePhoto = () => {
    setFormData(prev => ({ ...prev, profilePhoto: "" }));
    setHasUnsavedChanges(true);
    setPhotoUrlError("");
  };

  // Improved color generator based on name hash
  const getLightColor = (name) => {
    if (!name) return "#f0f4ff";
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = ((hash << 5) - hash) + name.charCodeAt(i);
      hash |= 0;
    }
    const colors = ["#e8f4f8", "#f0e6ff", "#e6f7e6", "#fff0e6", "#ffe6f0", "#e6f3ff", "#fef2e8", "#e8f0fe"];
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Recently";
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const filteredResumes = resumes.filter(resume =>
    resume.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resume.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tabs = [
    { id: "personal", label: "Personal Info", icon: FiUser, color: "#4f46e5" },
    { id: "education", label: "Education", icon: FiBookOpen, color: "#10b981" },
    { id: "professional", label: "Experience & Skills", icon: FiBriefcase, color: "#f59e0b" },
  ];

  return (
    <div className="er-dashboard">
      <button
        className="mobile-sidebar-toggle"
        onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        aria-label="Open resume list"
      >
        <FiMenu size={24} />
      </button>

      <div className="er-dashboard-container">
        <aside className={`er-sidebar-new ${mobileSidebarOpen ? "mobile-open" : ""}`}>
          <div className="er-sidebar-header-new">
            <div className="logo-area">
              <div className="logo-icon">📄</div>
              <div className="logo-text">
                <h3>Resume Manager</h3>
                <p>{resumes.length} saved resumes</p>
              </div>
            </div>
            <div className="search-bar">
              <FiSearch size={16} />
              <input
                type="text"
                placeholder="Search resumes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="er-resume-list">
            {isLoading ? (
              <div className="loader-container">
                <div className="loader"></div>
                <p>Loading resumes...</p>
              </div>
            ) : filteredResumes.length === 0 ? (
              <div className="empty-state">
                <FiFileText size={48} />
                <p>No resumes found</p>
              </div>
            ) : (
              filteredResumes.map((resume, index) => (
                <div
                  key={resume._id}
                  className={`er-resume-card ${selectedResume?._id === resume._id ? "active" : ""}`}
                  onClick={() => handleSelectResume(resume)}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="resume-card-avatar" style={{ backgroundColor: getLightColor(resume.name), color: "#4b5563" }}>
                    {getInitials(resume.name)}
                  </div>
                  <div className="resume-card-info">
                    <div className="resume-card-name">{resume.name || "Untitled Resume"}</div>
                    <div className="resume-card-role">{resume.role || "No title specified"}</div>
                    <div className="resume-card-date">
                      <FiClock size={12} />
                      <span>Updated {formatDate(resume.updatedAt)}</span>
                    </div>
                  </div>
                  <button
                    className="resume-card-delete"
                    onClick={(e) => handleDelete(resume._id, e)}
                    title="Delete resume"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
          <div className="sidebar-footer">
            <div className="stats-info">
              <FiStar size={14} />
              <span>{resumes.length} total resumes</span>
            </div>
          </div>
        </aside>

        {mobileSidebarOpen && (
          <div className="mobile-sidebar-overlay" onClick={() => setMobileSidebarOpen(false)} />
        )}

        <main className="er-main-content">
          {!selectedResume ? (
            <div className="er-welcome-state">
              <div className="welcome-illustration">
                <FiFileText size={80} />
              </div>
              <h2>Select a Resume to Edit</h2>
              <p>Choose a resume from the sidebar to view and modify its content</p>
              <div className="welcome-tips">
                <div className="tip-item"><FiCheck size={16} /><span>Edit personal information</span></div>
                <div className="tip-item"><FiCheck size={16} /><span>Update education details</span></div>
                <div className="tip-item"><FiCheck size={16} /><span>Modify experience & skills</span></div>
              </div>
            </div>
          ) : (
            <div className="er-editor-area">
              <div className="editor-header">
                <div className="editor-title">
                  <div className="title-badge" style={{ backgroundColor: getLightColor(formData.name), color: "#4b5563" }}>
                    {getInitials(formData.name)}
                  </div>
                  <div className="title-info">
                    <h1>{formData.name || "Untitled Resume"}</h1>
                    <p className="resume-role">{formData.role || "No title specified"}</p>
                    {saveStatus === "success" && (
                      <div className="save-indicator success">
                        <FiCheck size={14} />
                        <span>Saved successfully!</span>
                      </div>
                    )}
                    {saveStatus === "error" && (
                      <div className="save-indicator error">
                        <FiAlertCircle size={14} />
                        <span>{saveErrorMessage || "Error saving changes"}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="editor-actions">
                  {!isEditing ? (
                    <button className="action-btn edit-btn" onClick={() => { setIsEditing(true); setHasUnsavedChanges(false); }}>
                      <FiEdit2 size={16} />
                      Edit Resume
                    </button>
                  ) : (
                    <>
                      <button className="action-btn cancel-btn" onClick={handleCancelEdit}>
                        <FiX size={16} />
                        Cancel (Esc)
                      </button>
                      <button className="action-btn save-btn" onClick={handleSave} disabled={saveStatus === "saving"}>
                        <FiSave size={16} />
                        {saveStatus === "saving" ? "Saving..." : "Save (Ctrl+S)"}
                      </button>
                    </>
                  )}
                </div>
              </div>

              <nav className="editor-tabs">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <Icon size={16} />
                      <span>{tab.label}</span>
                      {activeTab === tab.id && <div className="tab-indicator" style={{ backgroundColor: tab.color }} />}
                    </button>
                  );
                })}
              </nav>

              <div className="editor-form-container">
                {activeTab === "personal" && (
                  <div className="form-section fade-in">
                    <div className="section-header">
                      <FiUser size={18} />
                      <h3>Basic Information</h3>
                    </div>
                    <div className="form-grid two-col">
                      <Field label="Full Name" name="name" icon={FiUser} placeholder="John Doe" value={formData.name} onChange={handleChange} isEditing={isEditing} />
                      <Field label="Job Title" name="role" icon={FiBriefcase} placeholder="Software Engineer" value={formData.role} onChange={handleChange} isEditing={isEditing} />
                      <Field label="Email Address" name="email" type="email" icon={FiMail} placeholder="john@example.com" value={formData.email} onChange={handleChange} isEditing={isEditing} />
                      <Field label="Phone Number" name="phone" icon={FiPhone} placeholder="+1 234 567 8900" value={formData.phone} onChange={handleChange} isEditing={isEditing} />
                      <Field label="LinkedIn" name="linkedin" icon={FiLinkedin} placeholder="linkedin.com/in/johndoe" value={formData.linkedin} onChange={handleChange} isEditing={isEditing} />
                      <Field label="GitHub" name="github" icon={FiGithub} placeholder="github.com/johndoe" value={formData.github} onChange={handleChange} isEditing={isEditing} />
                      <Field label="Twitter" name="twitter" icon={FiTwitter} placeholder="twitter.com/johndoe" value={formData.twitter} onChange={handleChange} isEditing={isEditing} />
                      <Field label="Location" name="address" icon={FiMapPin} placeholder="City, Country" value={formData.address} onChange={handleChange} isEditing={isEditing} />
                    </div>

                    <div className="section-header" style={{ marginTop: "28px" }}>
                      <FiImage size={18} />
                      <h3>Profile Photo</h3>
                    </div>
                    <div className="profile-photo-edit">
                      <div className="photo-preview">
                        {formData.profilePhoto ? (
                          <div className="photo-preview-img">
                            <img src={formData.profilePhoto} alt="Profile" />
                            {isEditing && (
                              <button className="clear-photo-btn" onClick={clearProfilePhoto}>
                                <FiTrash2 size={14} />
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="photo-placeholder">
                            <FiImage size={32} />
                            <span>No photo</span>
                          </div>
                        )}
                      </div>
                      {isEditing && (
                        <div className="photo-upload-buttons">
                          <label className="upload-photo-btn" disabled={uploadingPhoto}>
                            <FiUploadCloud /> {uploadingPhoto ? "Uploading..." : "Upload Image"}
                            <input type="file" accept="image/*" onChange={handleProfilePhotoUpload} hidden />
                          </label>
                          <div className="photo-url-wrapper">
                            <input
                              type="text"
                              placeholder="Or enter image URL"
                              value={formData.profilePhoto || ""}
                              onChange={handleProfilePhotoUrlChange}
                              className="photo-url-input"
                            />
                            {validatingPhotoUrl && (
                              <div className="url-validating">
                                <FiLoader className="spin" size={14} /> Validating...
                              </div>
                            )}
                          </div>
                          {photoUrlError && <small className="error-message">{photoUrlError}</small>}
                          <small>Upload a square image (max 2MB) or provide a direct URL</small>
                        </div>
                      )}
                    </div>

                    <div className="section-header" style={{ marginTop: "28px" }}>
                      <FiFileText size={18} />
                      <h3>Professional Summary</h3>
                    </div>
                    <div className="form-grid single-col">
                      <Field label="About Me" name="about" multiline rows={5} icon={FiUser} placeholder="Write a compelling professional summary..." value={formData.about} onChange={handleChange} isEditing={isEditing} />
                    </div>
                  </div>
                )}

                {activeTab === "education" && (
                  <div className="form-section fade-in">
                    <div className="section-header">
                      <FiBookOpen size={18} />
                      <h3>Higher Education</h3>
                    </div>
                    <div className="education-card">
                      <div className="edu-badge">🎓 Degree</div>
                      <div className="form-grid two-col">
                        <Field label="Institution" name="degreeCollege" placeholder="University Name" value={formData.degreeCollege} onChange={handleChange} isEditing={isEditing} />
                        <Field label="Degree/Course" name="degreeCourse" placeholder="B.Tech in Computer Science" value={formData.degreeCourse} onChange={handleChange} isEditing={isEditing} />
                        <Field label="CGPA/Percentage" name="degreePercentage" icon={FiPercent} placeholder="8.5 CGPA / 85%" value={formData.degreePercentage} onChange={handleChange} isEditing={isEditing} />
                        <Field label="Year of Passing" name="degreeYear" icon={FiCalendar} placeholder="2024" value={formData.degreeYear} onChange={handleChange} isEditing={isEditing} />
                      </div>
                    </div>

                    <div className="section-header" style={{ marginTop: "28px" }}>
                      <FiAward size={18} />
                      <h3>Higher Secondary (12th)</h3>
                    </div>
                    <div className="education-card">
                      <div className="edu-badge">📖 Intermediate</div>
                      <div className="form-grid two-col">
                        <Field label="College Name" name="interCollege" placeholder="College Name" value={formData.interCollege} onChange={handleChange} isEditing={isEditing} />
                        <Field label="Course/Specialization" name="interCourse" placeholder="MPC / BiPC" value={formData.interCourse} onChange={handleChange} isEditing={isEditing} />
                        <Field label="Percentage" name="interPercentage" icon={FiPercent} placeholder="85%" value={formData.interPercentage} onChange={handleChange} isEditing={isEditing} />
                        <Field label="Year of Completion" name="interYear" icon={FiCalendar} placeholder="2020" value={formData.interYear} onChange={handleChange} isEditing={isEditing} />
                      </div>
                    </div>

                    <div className="section-header" style={{ marginTop: "28px" }}>
                      <FiStar size={18} />
                      <h3>Secondary Education (10th)</h3>
                    </div>
                    <div className="education-card">
                      <div className="edu-badge">📚 Matriculation</div>
                      <div className="form-grid two-col">
                        <Field label="School Name" name="tenthSchool" placeholder="School Name" value={formData.tenthSchool} onChange={handleChange} isEditing={isEditing} />
                        <Field label="Percentage" name="tenthPercentage" icon={FiPercent} placeholder="90%" value={formData.tenthPercentage} onChange={handleChange} isEditing={isEditing} />
                        <Field label="Year of Completion" name="tenthYear" icon={FiCalendar} placeholder="2018" value={formData.tenthYear} onChange={handleChange} isEditing={isEditing} />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "professional" && (
                  <div className="form-section fade-in">
                    <div className="section-header">
                      <FiCpu size={18} />
                      <h3>Technical Skills</h3>
                    </div>
                    <div className="skills-hint">
                      <p>💡 Tip: Enter skills separated by commas for better organization</p>
                    </div>
                    <Field label="Skills & Expertise" name="skills" multiline rows={3} placeholder="React, Node.js, Python, MongoDB, AWS" value={formData.skills} onChange={handleChange} isEditing={isEditing} />

                    <div className="section-header" style={{ marginTop: "28px" }}>
                      <FiBriefcase size={18} />
                      <h3>Work Experience</h3>
                    </div>
                    <Field label="Experience" name="experience" multiline rows={6} placeholder="• Company Name - Position (Year-Year)\n• Key achievements and responsibilities" value={formData.experience} onChange={handleChange} isEditing={isEditing} />

                    <div className="section-header" style={{ marginTop: "28px" }}>
                      <FiCode size={18} />
                      <h3>Projects</h3>
                    </div>
                    <Field label="Projects" name="projects" multiline rows={5} placeholder="• Project Name: Description and technologies used" value={formData.projects} onChange={handleChange} isEditing={isEditing} />

                    <div className="section-header" style={{ marginTop: "28px" }}>
                      <FiAward size={18} />
                      <h3>Certifications</h3>
                    </div>
                    <Field label="Certifications" name="certificates" multiline rows={4} placeholder="• Certification Name - Issuing Organization (Year)" value={formData.certificates} onChange={handleChange} isEditing={isEditing} />

                    <div className="section-header" style={{ marginTop: "28px" }}>
                      <FiGlobe size={18} />
                      <h3>Languages</h3>
                    </div>
                    <Field label="Languages" name="languages" multiline rows={2} placeholder="English (Fluent), Spanish (Intermediate)" value={formData.languages} onChange={handleChange} isEditing={isEditing} />
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default EditResume;