import React, { useState, useEffect } from "react";
import axios from "axios";
import "./EditResumes.css";

function EditResume({ onResumeUpdated }) {
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState(null);
  const [activeTab, setActiveTab] = useState("personal");

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
        setSelectedResume(null);
      }
    } catch (err) {
      console.error("Error deleting resume:", err);
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const tabs = [
    { id: "personal", label: "Contact Info", icon: "👤" },
    { id: "education", label: "Education", icon: "🎓" },
    { id: "professional", label: "Experience & Skills", icon: "💼" },
  ];

  const Field = ({ label, name, type = "text", multiline = false }) => (
    <div className={`er-input-group ${isEditing ? "editing-mode" : "view-mode"}`}>
      <label className="er-input-label">{label}</label>
      {multiline ? (
        <textarea
          name={name}
          value={formData[name] || ""}
          onChange={handleChange}
          readOnly={!isEditing}
          className="er-input-field er-textarea"
          rows={3}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={formData[name] || ""}
          onChange={handleChange}
          readOnly={!isEditing}
          className="er-input-field"
        />
      )}
    </div>
  );

  return (
    <div className="er-light-layout">
      <div className="er-main-wrapper">
        {/* Sidebar */}
        <aside className="er-sidebar">
          <div className="er-sidebar-header">
            <h2>My Resumes</h2>
          </div>
          
          <div className="er-resume-scroller">
            {isLoading ? (
              <div className="er-loader">Loading...</div>
            ) : (
              resumes.map(resume => (
                <div
                  key={resume._id}
                  className={`er-nav-card ${selectedResume?._id === resume._id ? "selected" : ""}`}
                  onClick={() => handleSelectResume(resume)}
                >
                  <div className="er-nav-avatar">{getInitials(resume.name)}</div>
                  <div className="er-nav-text">
                    <div className="er-nav-name">{resume.name || "Untitled"}</div>
                    <div className="er-nav-role">{resume.role || "No Role"}</div>
                  </div>
                  <button className="er-nav-delete" onClick={(e) => handleDelete(resume._id, e)}>✕</button>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Editor Area */}
        <section className="er-editor-panel">
          {!selectedResume ? (
            <div className="er-welcome">
              <div className="er-welcome-icon">📁</div>
              <h3>Select a Resume</h3>
              <p>Pick a profile from the sidebar to view or modify details.</p>
            </div>
          ) : (
            <div className="er-editor-content">
              <header className="er-content-header">
                <div className="er-title-box">
                  <h1>{formData.name || "Editing Profile"}</h1>
                  {saveStatus === "success" && <span className="er-save-toast">Saved Successfully!</span>}
                </div>
                
                <div className="er-action-bar">
                  {!isEditing ? (
                    <button className="er-primary-btn" onClick={() => setIsEditing(true)}>Edit Profile</button>
                  ) : (
                    <>
                      <button className="er-secondary-btn" onClick={() => {setIsEditing(false); setFormData(selectedResume)}}>Cancel</button>
                      <button className="er-save-btn" onClick={handleSave}>
                        {saveStatus === "saving" ? "Saving..." : "Save Changes"}
                      </button>
                    </>
                  )}
                </div>
              </header>

              <nav className="er-tab-nav">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    className={`er-tab-btn ${activeTab === tab.id ? "active" : ""}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </nav>

              <div className="er-form-scroll">
                {activeTab === "personal" && (
                  <div className="er-form-grid anim-up">
                    <Field label="Full Name" name="name" />
                    <Field label="Job Title" name="role" />
                    <Field label="Email Address" name="email" type="email" />
                    <Field label="Phone Number" name="phone" />
                    <Field label="LinkedIn Profile" name="linkedin" />
                    <Field label="Location / Address" name="address" />
                    <div className="er-col-full">
                      <Field label="About / Summary" name="about" multiline />
                    </div>
                  </div>
                )}

                {activeTab === "education" && (
                  <div className="er-form-sections anim-up">
                    <div className="er-section-card">
                      <h4>University / Degree</h4>
                      <div className="er-form-grid">
                        <Field label="Institution" name="degreeCollege" />
                        <Field label="Course" name="degreeCourse" />
                        <Field label="Percentage/CGPA" name="degreePercentage" />
                        <Field label="Passing Year" name="degreeYear" />
                      </div>
                    </div>
                    <div className="er-section-card">
                      <h4>High School (10th)</h4>
                      <div className="er-form-grid">
                        <Field label="School Name" name="tenthSchool" />
                        <Field label="Percentage" name="tenthPercentage" />
                        <Field label="Year" name="tenthYear" />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "professional" && (
                  <div className="er-form-sections anim-up">
                    <Field label="Key Skills" name="skills" multiline />
                    <Field label="Work Experience" name="experience" multiline />
                    <Field label="Projects" name="projects" multiline />
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default EditResume;