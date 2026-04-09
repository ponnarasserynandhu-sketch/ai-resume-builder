import React, { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import axios from "axios";
import "./CreateResume.css";
import {
  FiDownload,
  FiEye,
  FiGrid,
  FiFileText,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiBriefcase,
  FiLinkedin,
  FiCpu,
  FiBookOpen,
  FiCheckCircle,
  FiSave,
  FiCheck
} from "react-icons/fi";

// Template components
const TemplateClassic = ({ user }) => (
  <div className="resume-preview template-classic">
    <div className="resume-header">
      <h1 className="resume-name">{user.name || "Your Name"}</h1>
      <h3 className="resume-title">{user.role || "Professional Title"}</h3>
      <div className="resume-contact">
        {user.email && <span><FiMail size={14} /> {user.email}</span>}
        {user.phone && <span><FiPhone size={14} /> {user.phone}</span>}
        {user.linkedin && <span><FiLinkedin size={14} /> {user.linkedin}</span>}
        {user.address && <span><FiMapPin size={14} /> {user.address}</span>}
      </div>
    </div>

    <div className="resume-section">
      <h4 className="section-title">Professional Summary</h4>
      <p className="section-content">{user.about || "Add your professional summary"}</p>
    </div>

    <div className="resume-section">
      <h4 className="section-title">Skills & Expertise</h4>
      <p className="section-content">{user.skills || "Add your skills"}</p>
    </div>

    <div className="resume-section">
      <h4 className="section-title">Education</h4>
      <div className="education-entry">
        {user.tenthSchool && <p><strong>10th:</strong> {user.tenthSchool}, {user.tenthPercentage}%, {user.tenthYear}</p>}
        {user.interCollege && <p><strong>Intermediate:</strong> {user.interCollege}, {user.interCourse}, {user.interPercentage}%, {user.interYear}</p>}
        {user.degreeCollege && <p><strong>Degree:</strong> {user.degreeCollege}, {user.degreeCourse}, {user.degreePercentage}%, {user.degreeYear}</p>}
      </div>
    </div>

    <div className="resume-section">
      <h4 className="section-title">Work Experience</h4>
      <p className="section-content">{user.experience || "Add your work experience"}</p>
    </div>

    <div className="resume-section">
      <h4 className="section-title">Projects</h4>
      <p className="section-content">{user.projects || "Add your projects"}</p>
    </div>

    <div className="resume-section">
      <h4 className="section-title">Certifications</h4>
      <p className="section-content">{user.certificates || "Add your certifications"}</p>
    </div>

    <div className="resume-section">
      <h4 className="section-title">Languages</h4>
      <p className="section-content">{user.languages || "Add languages"}</p>
    </div>
  </div>
);

const TemplateModern = ({ user }) => (
  <div className="resume-preview template-modern">
    <div className="modern-two-column">
      <div className="modern-left">
        <h1 className="modern-name">{user.name || "Your Name"}</h1>
        <h3 className="modern-title">{user.role || "Professional Title"}</h3>
        <div className="modern-contact">
          {user.email && <p><FiMail size={14} /> {user.email}</p>}
          {user.phone && <p><FiPhone size={14} /> {user.phone}</p>}
          {user.linkedin && <p><FiLinkedin size={14} /> {user.linkedin}</p>}
          {user.address && <p><FiMapPin size={14} /> {user.address}</p>}
        </div>
        <div className="modern-skills">
          <h4>Skills</h4>
          <p>{user.skills || "Add your skills"}</p>
        </div>
        <div className="modern-languages">
          <h4>Languages</h4>
          <p>{user.languages || "Add languages"}</p>
        </div>
      </div>
      <div className="modern-right">
        <div className="modern-summary">
          <h4>Professional Summary</h4>
          <p>{user.about || "Add your professional summary"}</p>
        </div>
        <div className="modern-education">
          <h4>Education</h4>
          {user.tenthSchool && <p><strong>10th:</strong> {user.tenthSchool}, {user.tenthPercentage}%, {user.tenthYear}</p>}
          {user.interCollege && <p><strong>Intermediate:</strong> {user.interCollege}, {user.interCourse}, {user.interPercentage}%, {user.interYear}</p>}
          {user.degreeCollege && <p><strong>Degree:</strong> {user.degreeCollege}, {user.degreeCourse}, {user.degreePercentage}%, {user.degreeYear}</p>}
        </div>
        <div className="modern-experience">
          <h4>Work Experience</h4>
          <p>{user.experience || "Add your work experience"}</p>
        </div>
        <div className="modern-projects">
          <h4>Projects</h4>
          <p>{user.projects || "Add your projects"}</p>
        </div>
        <div className="modern-certificates">
          <h4>Certifications</h4>
          <p>{user.certificates || "Add your certifications"}</p>
        </div>
      </div>
    </div>
  </div>
);

const TemplateElegant = ({ user }) => (
  <div className="resume-preview template-elegant">
    <div className="elegant-header">
      <h1>{user.name || "Your Name"}</h1>
      <h3>{user.role || "Professional Title"}</h3>
      <div className="elegant-contact">
        {user.email && <span>{user.email}</span>}
        {user.phone && <span>{user.phone}</span>}
        {user.linkedin && <span>{user.linkedin}</span>}
      </div>
    </div>
    <div className="elegant-content">
      <div className="elegant-summary">
        <h4>About Me</h4>
        <p>{user.about || "Add your professional summary"}</p>
      </div>
      <div className="elegant-skills">
        <h4>Core Skills</h4>
        <div className="skills-tags">
          {user.skills?.split(',').map((skill, i) => (
            <span key={i} className="skill-tag">{skill.trim()}</span>
          ))}
        </div>
      </div>
      <div className="elegant-education">
        <h4>Education Background</h4>
        {user.tenthSchool && <p><strong>Secondary:</strong> {user.tenthSchool} ({user.tenthPercentage}%)</p>}
        {user.interCollege && <p><strong>Higher Secondary:</strong> {user.interCollege}, {user.interCourse}</p>}
        {user.degreeCollege && <p><strong>Graduation:</strong> {user.degreeCollege}, {user.degreeCourse}</p>}
      </div>
      <div className="elegant-experience">
        <h4>Professional Experience</h4>
        <p>{user.experience || "Add your work experience"}</p>
      </div>
      <div className="elegant-projects">
        <h4>Key Projects</h4>
        <p>{user.projects || "Add your projects"}</p>
      </div>
    </div>
  </div>
);

const TemplateCreative = ({ user }) => (
  <div className="resume-preview template-creative">
    <div className="creative-sidebar">
      <div className="creative-avatar">
        <img src={user.profilePhoto || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} alt="avatar" />
      </div>
      <h2>{user.name || "Your Name"}</h2>
      <p className="creative-title">{user.role || "Professional Title"}</p>
      <div className="creative-contact">
        {user.email && <p><FiMail size={14} /> {user.email}</p>}
        {user.phone && <p><FiPhone size={14} /> {user.phone}</p>}
        {user.linkedin && <p><FiLinkedin size={14} /> {user.linkedin}</p>}
      </div>
      <div className="creative-skills">
        <h4>Skills</h4>
        <p>{user.skills || "Add your skills"}</p>
      </div>
      <div className="creative-languages">
        <h4>Languages</h4>
        <p>{user.languages || "Add languages"}</p>
      </div>
    </div>
    <div className="creative-main">
      <div className="creative-summary">
        <h3>About Me</h3>
        <p>{user.about || "Add your professional summary"}</p>
      </div>
      <div className="creative-education">
        <h3>Education</h3>
        {user.tenthSchool && <p>✓ {user.tenthSchool} - {user.tenthPercentage}% ({user.tenthYear})</p>}
        {user.interCollege && <p>✓ {user.interCollege}, {user.interCourse} - {user.interPercentage}% ({user.interYear})</p>}
        {user.degreeCollege && <p>✓ {user.degreeCollege}, {user.degreeCourse} - {user.degreePercentage}% ({user.degreeYear})</p>}
      </div>
      <div className="creative-experience">
        <h3>Experience</h3>
        <p>{user.experience || "Add your work experience"}</p>
      </div>
      <div className="creative-projects">
        <h3>Projects</h3>
        <p>{user.projects || "Add your projects"}</p>
      </div>
    </div>
  </div>
);

const TemplateExecutive = ({ user }) => (
  <div className="resume-preview template-executive">
    <div className="executive-header">
      <div className="executive-name">
        <h1>{user.name || "Your Name"}</h1>
        <h3>{user.role || "Professional Title"}</h3>
      </div>
      <div className="executive-contact">
        {user.email && <div><FiMail size={14} /> {user.email}</div>}
        {user.phone && <div><FiPhone size={14} /> {user.phone}</div>}
        {user.linkedin && <div><FiLinkedin size={14} /> {user.linkedin}</div>}
      </div>
    </div>
    <div className="executive-body">
      <div className="executive-summary">
        <h4>Executive Summary</h4>
        <p>{user.about || "Add your professional summary"}</p>
      </div>
      <div className="executive-grid">
        <div className="executive-left">
          <h4>Core Competencies</h4>
          <p>{user.skills || "Add your skills"}</p>
          <h4>Languages</h4>
          <p>{user.languages || "Add languages"}</p>
        </div>
        <div className="executive-right">
          <h4>Education</h4>
          {user.degreeCollege && <p><strong>{user.degreeCourse}</strong><br/>{user.degreeCollege}, {user.degreePercentage}%</p>}
          {user.interCollege && <p><strong>{user.interCourse}</strong><br/>{user.interCollege}, {user.interPercentage}%</p>}
        </div>
      </div>
      <div className="executive-experience">
        <h4>Professional Experience</h4>
        <p>{user.experience || "Add your work experience"}</p>
      </div>
      <div className="executive-projects">
        <h4>Notable Projects</h4>
        <p>{user.projects || "Add your projects"}</p>
      </div>
    </div>
  </div>
);

function CreateResume() {
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

  const [selectedTemplate, setSelectedTemplate] = useState("t1");
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const resumeRef = useRef();

  // Template mapping
  const templateComponents = {
    t1: TemplateClassic,
    t2: TemplateModern,
    t3: TemplateElegant,
    t4: TemplateCreative,
    t5: TemplateExecutive
  };

  const templates = [
    { id: "t1", name: "Classic", icon: FiFileText, color: "#4361ee", description: "Traditional professional layout" },
    { id: "t2", name: "Modern", icon: FiGrid, color: "#06d6a0", description: "Two-column modern design" },
    { id: "t3", name: "Elegant", icon: FiEye, color: "#f9c74f", description: "Clean and minimalistic" },
    { id: "t4", name: "Creative", icon: FiUser, color: "#f9844a", description: "Sidebar with profile photo" },
    { id: "t5", name: "Executive", icon: FiBriefcase, color: "#9c89b8", description: "Bold and professional" }
  ];

  useEffect(() => {
    const fetchProfile = async () => {
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
      }
    };

    fetchProfile();
  }, []);

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
  };

  const exportPDF = async () => {
    if (!resumeRef.current) return;
    
    setIsExporting(true);
    try {
      const canvas = await html2canvas(resumeRef.current, { 
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4"
      });
      
      const imgWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`${user.name || "Resume"}_${selectedTemplate.toUpperCase()}.pdf`);
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const saveResume = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login to save your resume");
        return;
      }

      const resumeData = {
        ...user,
        selectedTemplate,
        lastModified: new Date().toISOString()
      };

      const response = await axios.post(
        "http://localhost:5000/api/resume/save",
        { resumeData, template: selectedTemplate },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert("Failed to save resume. Please try again.");
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("Error saving resume. Please check your connection.");
    } finally {
      setIsSaving(false);
    }
  };

  const CurrentTemplate = templateComponents[selectedTemplate];

  return (
    <div className="create-resume-container">
      <div className="create-resume-wrapper">
        {/* Header */}
        <div className="resume-header-modern">
          <div className="header-content">
            <h1>Create Your Resume</h1>
            <div className="header-description">
              <p>Choose a template and generate a professional resume instantly</p>
            </div>
          </div>
        </div>

        {/* Template Selector */}
        <div className="template-selector-modern">
          <h3 className="selector-title">Choose Template Style</h3>
          <div className="template-grid">
            {templates.map((template) => {
              const Icon = template.icon;
              return (
                <div
                  key={template.id}
                  className={`template-card ${selectedTemplate === template.id ? "active" : ""}`}
                  onClick={() => handleTemplateSelect(template.id)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => e.key === 'Enter' && handleTemplateSelect(template.id)}
                >
                  <div className="template-icon" style={{ backgroundColor: `${template.color}15`, color: template.color }}>
                    <Icon size={32} />
                  </div>
                  <h4>{template.name}</h4>
                  <p>{template.description}</p>
                  {selectedTemplate === template.id && (
                    <div className="template-check">
                      <FiCheckCircle size={20} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Preview Toggle */}
        <div className="preview-toggle">
          <button 
            className={`toggle-btn ${showPreview ? "active" : ""}`}
            onClick={() => setShowPreview(true)}
            aria-pressed={showPreview}
          >
            <FiEye size={18} />
            Preview Resume
          </button>
          <button 
            className={`toggle-btn ${!showPreview ? "active" : ""}`}
            onClick={() => setShowPreview(false)}
            aria-pressed={!showPreview}
          >
            <FiFileText size={18} />
            Raw Data
          </button>
        </div>

        {/* Resume Preview Area */}
        {showPreview && (
          <div className="resume-preview-area">
            <div className="preview-content" ref={resumeRef}>
              <CurrentTemplate user={user} />
            </div>
          </div>
        )}

        {/* Raw Data View */}
        {!showPreview && (
          <div className="raw-data-area">
            <h3>Your Resume Data</h3>
            <div className="data-grid">
              <div className="data-card">
                <h4><FiUser /> Personal Information</h4>
                <p><strong>Name:</strong> {user.name || "Not provided"}</p>
                <p><strong>Email:</strong> {user.email || "Not provided"}</p>
                <p><strong>Phone:</strong> {user.phone || "Not provided"}</p>
                <p><strong>Role:</strong> {user.role || "Not provided"}</p>
                {user.address && <p><strong>Address:</strong> {user.address}</p>}
                {user.linkedin && <p><strong>LinkedIn:</strong> {user.linkedin}</p>}
              </div>
              <div className="data-card">
                <h4><FiCpu /> Skills & Languages</h4>
                <p><strong>Skills:</strong> {user.skills || "Not provided"}</p>
                <p><strong>Languages:</strong> {user.languages || "Not provided"}</p>
                {user.certificates && <p><strong>Certifications:</strong> {user.certificates}</p>}
              </div>
              <div className="data-card">
                <h4><FiBookOpen /> Education</h4>
                {user.tenthSchool && <p><strong>10th:</strong> {user.tenthSchool} - {user.tenthPercentage}% ({user.tenthYear})</p>}
                {user.interCollege && <p><strong>Intermediate:</strong> {user.interCollege} - {user.interCourse} ({user.interPercentage}%)</p>}
                {user.degreeCollege && <p><strong>Degree:</strong> {user.degreeCollege} - {user.degreeCourse} ({user.degreePercentage}%)</p>}
                {!user.tenthSchool && !user.interCollege && !user.degreeCollege && <p>Not provided</p>}
              </div>
              <div className="data-card">
                <h4><FiBriefcase /> Experience & Projects</h4>
                <p><strong>Experience:</strong> {user.experience || "Not provided"}</p>
                <p><strong>Projects:</strong> {user.projects || "Not provided"}</p>
              </div>
              <div className="data-card">
                <h4><FiFileText /> Professional Summary</h4>
                <p>{user.about || "Not provided"}</p>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Action Buttons */}
        <div className="bottom-actions">
          <div className="actions-container">
            <button 
              className="save-resume-btn" 
              onClick={saveResume}
              disabled={isSaving || saveSuccess}
            >
              {isSaving ? (
                <>Saving...</>
              ) : saveSuccess ? (
                <>
                  <FiCheck size={18} />
                  Saved Successfully!
                </>
              ) : (
                <>
                  <FiSave size={18} />
                  Save Resume
                </>
              )}
            </button>
            <button 
              className="download-resume-btn" 
              onClick={exportPDF}
              disabled={isExporting}
            >
              {isExporting ? (
                <>Generating PDF...</>
              ) : (
                <>
                  <FiDownload size={18} />
                  Download Resume
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateResume;