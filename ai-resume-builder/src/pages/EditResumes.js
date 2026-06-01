import React, { useState, useEffect } from "react";
import axios from "axios";
import "./EditResumes.css";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiBriefcase,
  FiLinkedin,
  FiCpu,
  FiBookOpen,
  FiAward,
  FiGlobe,
  FiCalendar,
  FiPercent,
  FiSave,
  FiEdit2,
  FiTrash2,
  FiX,
  FiCheck,
  FiClock,
  FiFileText,
  FiCode,
  FiStar,
  FiTrendingUp,
  FiSearch,
  FiFilter,
  FiChevronRight,
  FiMoreVertical,
  FiDownload,
  FiShare2,
  FiEye
} from "react-icons/fi";

function EditResume({ onResumeUpdated }) {
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState(null);
  const [activeTab, setActiveTab] = useState("personal");
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", address: "", role: "",
    linkedin: "", about: "", skills: "", experience: "",
    projects: "", certificates: "", languages: "",
    tenthSchool: "", tenthPercentage: "", tenthYear: "",
    interCollege: "", interCourse: "", interPercentage: "", interYear: "",
    degreeCollege: "", degreeCourse: "", degreePercentage: "", degreeYear: "",
    profilePhoto: ""
  });

  useEffect(() => { fetchResumes(); }, []);

  const fetchResumes = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await axios.get("http://localhost:5000/api/resume/all", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        const formatted = res.data.resumes.map(r => ({
          ...r.data, _id: r._id, updatedAt: r.updatedAt
        }));
        setResumes(formatted);
      }
    } catch (err) {
      console.error("Error fetching resumes:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectResume = (resume) => {
    setSelectedResume(resume);
    setFormData(resume);
    setIsEditing(false);
    setActiveTab("personal");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaveStatus("saving");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `http://localhost:5000/api/resume/${selectedResume._id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setSaveStatus("success");
        setSelectedResume(formData);
        setIsEditing(false);
        fetchResumes();
        if (onResumeUpdated) onResumeUpdated();
        setTimeout(() => setSaveStatus(null), 3000);
      }
    } catch (err) {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this resume permanently?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.delete(`http://localhost:5000/api/resume/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        fetchResumes();
        if (selectedResume?._id === id) setSelectedResume(null);
      }
    } catch (err) {
      console.error("Error deleting resume:", err);
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getLightColor = (name) => {
    const colors = [
      "#e8f4f8", "#f0e6ff", "#e6f7e6", "#fff0e6", "#ffe6f0", "#e6f3ff",
      "#f5e6ff", "#e6fff0", "#fff5e6", "#ffe6f5", "#e6faff", "#f0ffe6"
    ];
    const index = name ? name.length % colors.length : 0;
    return colors[index];
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

  const Field = ({ label, name, type = "text", multiline = false, icon: Icon, placeholder }) => (
    <div className={`er-input-group ${isEditing ? "editing-mode" : "view-mode"}`}>
      <label className="er-input-label">
        {Icon && <Icon size={14} className="label-icon" />}
        {label}
      </label>
      {multiline ? (
        <textarea
          name={name}
          value={formData[name] || ""}
          onChange={handleChange}
          readOnly={!isEditing}
          className="er-input-field er-textarea"
          rows={4}
          placeholder={placeholder || `Enter ${label.toLowerCase()}`}
        />
      ) : (
        <div className="input-wrapper">
          {Icon && <Icon size={16} className="input-icon" />}
          <input
            type={type}
            name={name}
            value={formData[name] || ""}
            onChange={handleChange}
            readOnly={!isEditing}
            className="er-input-field"
            placeholder={placeholder || `Enter ${label.toLowerCase()}`}
          />
        </div>
      )}
    </div>
  );

  const formatDate = (dateString) => {
    if (!dateString) return "Not updated";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="er-dashboard">
      <div className="er-dashboard-container">
        {/* Sidebar */}
        <aside className="er-sidebar-new">
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

        {/* Main Content */}
        <main className="er-main-content">
          {!selectedResume ? (
            <div className="er-welcome-state">
              <div className="welcome-illustration">
                <FiFileText size={80} />
              </div>
              <h2>Select a Resume to Edit</h2>
              <p>Choose a resume from the sidebar to view and modify its content</p>
              <div className="welcome-tips">
                <div className="tip-item">
                  <FiCheck size={16} />
                  <span>Edit personal information</span>
                </div>
                <div className="tip-item">
                  <FiCheck size={16} />
                  <span>Update education details</span>
                </div>
                <div className="tip-item">
                  <FiCheck size={16} />
                  <span>Modify experience & skills</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="er-editor-area">
              {/* Header */}
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
                        <FiX size={14} />
                        <span>Error saving changes</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="editor-actions">
                  {!isEditing ? (
                    <button className="action-btn edit-btn" onClick={() => setIsEditing(true)}>
                      <FiEdit2 size={16} />
                      Edit Resume
                    </button>
                  ) : (
                    <>
                      <button className="action-btn cancel-btn" onClick={() => { setIsEditing(false); setFormData(selectedResume); }}>
                        <FiX size={16} />
                        Cancel
                      </button>
                      <button className="action-btn save-btn" onClick={handleSave} disabled={saveStatus === "saving"}>
                        <FiSave size={16} />
                        {saveStatus === "saving" ? "Saving..." : "Save Changes"}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Tabs */}
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

              {/* Form Content */}
              <div className="editor-form-container">
                {activeTab === "personal" && (
                  <div className="form-section fade-in">
                    <div className="section-header">
                      <FiUser size={18} />
                      <h3>Basic Information</h3>
                    </div>
                    <div className="form-grid two-col">
                      <Field label="Full Name" name="name" icon={FiUser} placeholder="John Doe" />
                      <Field label="Job Title" name="role" icon={FiBriefcase} placeholder="Software Engineer" />
                      <Field label="Email Address" name="email" type="email" icon={FiMail} placeholder="john@example.com" />
                      <Field label="Phone Number" name="phone" icon={FiPhone} placeholder="+1 234 567 8900" />
                      <Field label="LinkedIn Profile" name="linkedin" icon={FiLinkedin} placeholder="linkedin.com/in/johndoe" />
                      <Field label="Location" name="address" icon={FiMapPin} placeholder="City, Country" />
                    </div>
                    
                    <div className="section-header" style={{ marginTop: "28px" }}>
                      <FiFileText size={18} />
                      <h3>Professional Summary</h3>
                    </div>
                    <div className="form-grid single-col">
                      <Field label="About Me" name="about" multiline icon={FiUser} placeholder="Write a compelling professional summary..." />
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
                        <Field label="Institution" name="degreeCollege" placeholder="University Name" />
                        <Field label="Degree/Course" name="degreeCourse" placeholder="B.Tech in Computer Science" />
                        <Field label="CGPA/Percentage" name="degreePercentage" icon={FiPercent} placeholder="8.5 CGPA / 85%" />
                        <Field label="Year of Passing" name="degreeYear" icon={FiCalendar} placeholder="2024" />
                      </div>
                    </div>

                    <div className="section-header" style={{ marginTop: "28px" }}>
                      <FiAward size={18} />
                      <h3>Higher Secondary (12th)</h3>
                    </div>
                    <div className="education-card">
                      <div className="edu-badge">📖 Intermediate</div>
                      <div className="form-grid two-col">
                        <Field label="College Name" name="interCollege" placeholder="College Name" />
                        <Field label="Course/Specialization" name="interCourse" placeholder="MPC / BiPC" />
                        <Field label="Percentage" name="interPercentage" icon={FiPercent} placeholder="85%" />
                        <Field label="Year of Completion" name="interYear" icon={FiCalendar} placeholder="2020" />
                      </div>
                    </div>

                    <div className="section-header" style={{ marginTop: "28px" }}>
                      <FiStar size={18} />
                      <h3>Secondary Education (10th)</h3>
                    </div>
                    <div className="education-card">
                      <div className="edu-badge">📚 Matriculation</div>
                      <div className="form-grid two-col">
                        <Field label="School Name" name="tenthSchool" placeholder="School Name" />
                        <Field label="Percentage" name="tenthPercentage" icon={FiPercent} placeholder="90%" />
                        <Field label="Year of Completion" name="tenthYear" icon={FiCalendar} placeholder="2018" />
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
                    <Field label="Skills & Expertise" name="skills" multiline placeholder="React, Node.js, Python, MongoDB, AWS" />
                    
                    <div className="section-header" style={{ marginTop: "28px" }}>
                      <FiBriefcase size={18} />
                      <h3>Work Experience</h3>
                    </div>
                    <Field label="Experience" name="experience" multiline placeholder="• Company Name - Position (Year-Year)\n• Key achievements and responsibilities" />
                    
                    <div className="section-header" style={{ marginTop: "28px" }}>
                      <FiCode size={18} />
                      <h3>Projects</h3>
                    </div>
                    <Field label="Projects" name="projects" multiline placeholder="• Project Name: Description and technologies used" />
                    
                    <div className="section-header" style={{ marginTop: "28px" }}>
                      <FiAward size={18} />
                      <h3>Certifications</h3>
                    </div>
                    <Field label="Certifications" name="certificates" multiline placeholder="• Certification Name - Issuing Organization (Year)" />
                    
                    <div className="section-header" style={{ marginTop: "28px" }}>
                      <FiGlobe size={18} />
                      <h3>Languages</h3>
                    </div>
                    <Field label="Languages" name="languages" multiline placeholder="English (Fluent), Spanish (Intermediate)" />
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