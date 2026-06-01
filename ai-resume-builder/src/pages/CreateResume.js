import React, { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import axios from "axios";
import "./CreateResume.css";
import {
  FiDownload,
  FiSave,
  FiCheck,
  FiDroplet,
  FiUploadCloud,
  FiZap,
  FiLoader,
  FiX,
  FiCalendar,
  FiPercent,
  FiRefreshCw,
  FiMail,
  FiPhone,
  FiMapPin,
  FiLinkedin,
  FiCpu,
  FiAward,
  FiGlobe,
  FiHome,
  FiGrid,
  FiFileText,
  FiLayout
} from "react-icons/fi";

// Utility helper to safely add opacity to HEX strings for custom backgrounds
const hexToRgba = (hex, opacity) => {
  if (!hex) return "rgba(0,0,0,0.05)";
  let c = hex.substring(1);
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Helper function to get display titles for sections
const getSectionDisplayTitle = (sectionKey) => {
  const titles = {
    summary: "Professional Summary",
    skills: "Core Competencies",
    experience: "Work Experience",
    education: "Education",
    projects: "Projects",
    certifications: "Certifications",
    languages: "Languages"
  };
  return titles[sectionKey] || sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1);
};

// Show notification helper
const showNotification = (message, type = 'info') => {
  const notification = document.createElement('div');
  notification.className = `ai-notification ${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-icon">${type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ'}</span>
      <span class="notification-message">${message}</span>
    </div>
  `;
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
};

// ==========================================
// AI RESUME GENERATOR COMPONENT
// ==========================================
function AIResumeGenerator({ userProfile, onAIStyleGenerated, onCancel }) {
  const [dragActive, setDragActive] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisDetails, setAnalysisDetails] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (imageFile) {
      setError(null);
      setUploadProgress(0);
      setAnalysisDetails(null);
    }
  }, [imageFile]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError(null);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (PNG/JPEG)");
      showNotification("Please upload an image file (PNG/JPEG)", "error");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File size should be less than 10MB");
      showNotification("File size should be less than 10MB", "error");
      return;
    }
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError(null);
    showNotification(`Selected: ${file.name}`, "info");
  };

  const clearFile = () => {
    setImageFile(null);
    setPreviewUrl(null);
    setError(null);
    setUploadProgress(0);
    setAnalysisDetails(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const transformBackendResponse = (aiResponse) => {
    const { layout } = aiResponse;
    const structuralSections = {};
    
    if (layout.sections) {
      Object.entries(layout.sections).forEach(([sectionKey, sectionData]) => {
        structuralSections[sectionKey] = {
          visible: sectionData.visible !== false,
          column: sectionData.column || (layout.layoutType === "two-column" ? "right" : "main"),
          customTitle: sectionData.customTitle || getSectionDisplayTitle(sectionKey),
          hasBottomBorder: sectionData.hasBottomBorder || false,
          hasLeftBorder: sectionData.hasLeftBorder || false,
          spacingBelow: sectionData.spacingBelow || "20px",
          innerPadding: sectionData.innerPadding || "0px",
          titleFontSize: sectionData.titleFontSize || layout.globalStyles?.titleFontSize || "16px",
          uppercaseTitle: false
        };
      });
    }
    
    const standardSections = ["summary", "skills", "experience", "education", "projects", "certifications", "languages"];
    standardSections.forEach(section => {
      if (!structuralSections[section]) {
        structuralSections[section] = {
          visible: true,
          column: layout.layoutType === "two-column" ? 
            (section === "skills" || section === "certifications" || section === "languages" ? "left" : "right") : 
            "main",
          customTitle: getSectionDisplayTitle(section),
          hasBottomBorder: false,
          hasLeftBorder: false,
          spacingBelow: "20px",
          innerPadding: "0px",
          titleFontSize: layout.globalStyles?.titleFontSize || "16px",
          uppercaseTitle: false
        };
      }
    });
    
    let columnWidths = "1fr 2fr";
    if (layout.columnRatio) {
      if (layout.columnRatio.includes('/')) {
        const parts = layout.columnRatio.split('/');
        columnWidths = `${parts[0]}fr ${parts[1]}fr`;
      } else if (layout.columnRatio.includes('-')) {
        const parts = layout.columnRatio.split('-');
        columnWidths = `${parts[0]}fr ${parts[1]}fr`;
      } else {
        const percent = parseInt(layout.columnRatio);
        if (!isNaN(percent)) {
          columnWidths = `${percent}fr ${100 - percent}fr`;
        }
      }
    }
    
    return {
      layoutType: layout.layoutType || "two-column",
      columnWidths: columnWidths,
      globalStyles: {
        fontFamily: layout.globalStyles?.fontFamily || "Inter, system-ui, sans-serif",
        primaryColor: aiResponse.primaryColor || layout.globalStyles?.primaryColor || "#2563eb",
        accentColor: aiResponse.accentColor || layout.globalStyles?.accentColor || "#7c3aed",
        pagePadding: layout.globalStyles?.pagePadding || "40px",
        lineHeight: layout.globalStyles?.lineHeight || "1.5",
        headerAlignment: layout.globalStyles?.headerAlignment || "left",
        backgroundColor: layout.globalStyles?.backgroundColor || "#ffffff",
        titleFontSize: layout.globalStyles?.titleFontSize || "18px",
        bodyFontSize: layout.globalStyles?.bodyFontSize || "14px"
      },
      structuralSections: structuralSections,
      analyzedAt: aiResponse.analyzedAt,
      imageAnalyzed: aiResponse.imageAnalyzed,
      analysisMethod: aiResponse.analysisMethod,
      imageDimensions: aiResponse.imageDimensions,
      requestId: aiResponse.requestId,
      processingTime: aiResponse.processingTime
    };
  };

  const triggerGeneration = async () => {
    if (!imageFile) return;
    setLoading(true);
    setError(null);
    setUploadProgress(0);
    setAnalysisDetails(null);

    try {
      const formData = new FormData();
      formData.append("layoutImage", imageFile);
      formData.append("profileData", JSON.stringify(userProfile));

      console.log("🤖 Sending image for AI analysis:", imageFile.name);
      console.log("📊 Image size:", (imageFile.size / 1024).toFixed(2), "KB");
      
      showNotification(`🔍 AI is analyzing ${imageFile.name}...`, "info");
      
      const response = await axios.post(
        "http://localhost:5000/api/ai/clone-layout",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 60000,
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(percentCompleted);
            }
          }
        }
      );

      console.log("✅ AI Analysis Response:", response.data);

      if (response.data.success) {
        const transformedManifest = transformBackendResponse(response.data);
        
        setAnalysisDetails({
          layoutType: transformedManifest.layoutType,
          processingTime: response.data.processingTime,
          analysisMethod: response.data.analysisMethod,
          imageDimensions: response.data.imageDimensions,
          colors: {
            primary: transformedManifest.globalStyles.primaryColor,
            accent: transformedManifest.globalStyles.accentColor
          }
        });
        
        const layoutType = transformedManifest.layoutType === "two-column" ? "Two Column" : "Single Column";
        const analysisTime = response.data.processingTime;
        
        showNotification(
          `✨ AI Analysis Complete! Detected ${layoutType} layout in ${analysisTime}. Your template is ready!`, 
          "success"
        );
        
        if (onAIStyleGenerated) {
          onAIStyleGenerated(transformedManifest);
        }
        
        setTimeout(() => {
          clearFile();
        }, 2000);
      } else {
        throw new Error(response.data.message || "AI processing failed");
      }
    } catch (err) {
      console.error("❌ AI processing error:", err);
      
      let errorMessage = "Failed to analyze layout. ";
      
      if (err.code === "ECONNABORTED") {
        errorMessage += "Request timeout - try with a smaller image.";
      } else if (err.code === "ERR_NETWORK") {
        errorMessage += "Cannot connect to server. Please check if backend is running on port 5000.";
      } else if (err.response) {
        errorMessage += err.response.data?.message || `Server error: ${err.response.status}`;
      } else if (err.request) {
        errorMessage += "No response from server. Please check your backend connection.";
      } else {
        errorMessage += err.message || "Unknown error occurred";
      }
      
      setError(errorMessage);
      showNotification(errorMessage, "error");
    } finally {
      setLoading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  return (
    <div className="ai-generator-card">
      <div className="ai-card-header">
        <FiZap className="sparkle-icon" />
        <h3>AI Resume Layout Analyzer</h3>
        <span className="badge-new">AI POWERED</span>
        {onCancel && (
          <button onClick={onCancel} className="ai-cancel-btn">
            <FiX size={18} />
          </button>
        )}
      </div>
      <p className="ai-card-instruction">
        Upload any resume image. Our AI will analyze its layout, colors, typography, and structure,
        then create a matching template populated with your profile data.
      </p>

      <div 
        className={`drag-drop-zone ${dragActive ? "drag-active" : ""} ${previewUrl ? "has-preview" : ""}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: "none" }} 
          accept="image/*" 
          onChange={handleFileChange}
        />

        {previewUrl ? (
          <div className="preview-container">
            <img src={previewUrl} alt="Target layout" className="upload-thumbnail" />
            <div className="preview-overlay-text">
              Click or drag to change image
              <button onClick={(e) => { e.stopPropagation(); clearFile(); }} className="clear-preview-btn">
                <FiX size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="dropzone-prompt">
            <FiUploadCloud size={48} />
            <p>Drag and drop your resume image here or <span>Browse files</span></p>
            <small className="ai-supported-formats">Supports: JPG, PNG (Max 10MB)</small>
          </div>
        )}
      </div>

      {loading && uploadProgress > 0 && uploadProgress < 100 && (
        <div className="ai-progress-bar">
          <div className="ai-progress-fill" style={{ width: `${uploadProgress}%` }}></div>
          <span className="ai-progress-text">{uploadProgress}% Uploading...</span>
        </div>
      )}

      {loading && (
        <div className="ai-analyzing-status">
          <FiLoader className="spinning-loader" />
          <span>AI is analyzing your resume layout...</span>
          <small>Analyzing columns, colors, typography, and spacing</small>
        </div>
      )}

      {analysisDetails && !loading && (
        <div className="ai-analysis-results">
          <h4>📊 Analysis Complete!</h4>
          <div className="analysis-stats">
            <div className="stat-item">
              <span className="stat-label">Layout Type:</span>
              <span className="stat-value">{analysisDetails.layoutType === "two-column" ? "Two Column" : "Single Column"}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Processing Time:</span>
              <span className="stat-value">{analysisDetails.processingTime}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Primary Color:</span>
              <span className="stat-value" style={{ color: analysisDetails.colors.primary }}>
                {analysisDetails.colors.primary}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Analysis Method:</span>
              <span className="stat-value">{analysisDetails.analysisMethod}</span>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="ai-error-message">
          <FiX size={16} />
          <span>{error}</span>
        </div>
      )}

      {imageFile && !loading && (
        <button 
          onClick={(e) => { e.stopPropagation(); triggerGeneration(); }} 
          className="ai-generate-submit-btn"
        >
          <FiZap /> Analyze & Generate Template
        </button>
      )}
    </div>
  );
}

// ==========================================
// TEMPLATE 1: SIMPLE SINGLE COLUMN (No Sidebar, No Profile Pic)
// ==========================================
const TemplateSimple = ({ user, primaryColor, accentColor }) => (
  <div className="resume-preview template-simple">
    <div className="simple-header" style={{ borderBottom: `3px solid ${primaryColor}`, paddingBottom: "15px", marginBottom: "20px" }}>
      <h1 style={{ color: primaryColor, fontSize: "28px", margin: "0 0 5px 0" }}>{user.name || "Your Name"}</h1>
      <h3 style={{ color: accentColor, fontSize: "16px", margin: "0 0 10px 0", fontWeight: "500" }}>{user.role || "Professional Title"}</h3>
      <div className="simple-contact" style={{ display: "flex", flexWrap: "wrap", gap: "15px", fontSize: "12px", color: "#64748b" }}>
        {user.email && <span>📧 {user.email}</span>}
        {user.phone && <span>📞 {user.phone}</span>}
        {user.linkedin && <span>🔗 {user.linkedin}</span>}
        {user.address && <span>📍 {user.address}</span>}
      </div>
    </div>

    <div className="simple-section" style={{ marginBottom: "20px" }}>
      <h4 style={{ color: primaryColor, fontSize: "16px", margin: "0 0 10px 0", borderLeft: `3px solid ${primaryColor}`, paddingLeft: "10px" }}>Professional Summary</h4>
      <p style={{ fontSize: "13px", lineHeight: "1.5", color: "#334155", margin: "0" }}>{user.about || "Add your professional summary"}</p>
    </div>

    <div className="simple-section" style={{ marginBottom: "20px" }}>
      <h4 style={{ color: primaryColor, fontSize: "16px", margin: "0 0 10px 0", borderLeft: `3px solid ${primaryColor}`, paddingLeft: "10px" }}>Core Competencies</h4>
      <div className="skills-tags" style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {user.skills ? user.skills.split(',').map((skill, i) => skill.trim() && (
          <span key={i} className="skill-tag" style={{ backgroundColor: hexToRgba(primaryColor, 0.1), color: primaryColor, padding: "4px 12px", borderRadius: "20px", fontSize: "12px" }}>{skill.trim()}</span>
        )) : <p style={{ fontSize: "13px", color: "#64748b" }}>Add your skills</p>}
      </div>
    </div>

    <div className="simple-section" style={{ marginBottom: "20px" }}>
      <h4 style={{ color: primaryColor, fontSize: "16px", margin: "0 0 10px 0", borderLeft: `3px solid ${primaryColor}`, paddingLeft: "10px" }}>Work Experience</h4>
      <div className="experience-list">
        {user.experience ? user.experience.split('\n').map((exp, i) => exp.trim() && (
          <p key={i} style={{ fontSize: "13px", margin: "5px 0", color: "#334155" }}>• {exp}</p>
        )) : <p style={{ fontSize: "13px", color: "#64748b" }}>Add your work experience</p>}
      </div>
    </div>

    <div className="simple-section" style={{ marginBottom: "20px" }}>
      <h4 style={{ color: primaryColor, fontSize: "16px", margin: "0 0 10px 0", borderLeft: `3px solid ${primaryColor}`, paddingLeft: "10px" }}>Projects</h4>
      <div className="projects-list">
        {user.projects ? user.projects.split('\n').map((project, i) => project.trim() && (
          <p key={i} style={{ fontSize: "13px", margin: "5px 0", color: "#334155" }}>• {project}</p>
        )) : <p style={{ fontSize: "13px", color: "#64748b" }}>Add your projects</p>}
      </div>
    </div>

    <div className="simple-section" style={{ marginBottom: "20px" }}>
      <h4 style={{ color: primaryColor, fontSize: "16px", margin: "0 0 10px 0", borderLeft: `3px solid ${primaryColor}`, paddingLeft: "10px" }}>Education</h4>
      <div className="education-entry">
        {user.tenthSchool && <p style={{ fontSize: "13px", margin: "5px 0" }}><strong>10th:</strong> {user.tenthSchool} | {user.tenthPercentage}% | {user.tenthYear}</p>}
        {user.interCollege && <p style={{ fontSize: "13px", margin: "5px 0" }}><strong>12th:</strong> {user.interCollege} ({user.interCourse}) | {user.interPercentage}% | {user.interYear}</p>}
        {user.degreeCollege && <p style={{ fontSize: "13px", margin: "5px 0" }}><strong>Degree:</strong> {user.degreeCollege} ({user.degreeCourse}) | {user.degreePercentage} CGPA | {user.degreeYear}</p>}
      </div>
    </div>

    <div className="simple-section" style={{ marginBottom: "20px" }}>
      <h4 style={{ color: primaryColor, fontSize: "16px", margin: "0 0 10px 0", borderLeft: `3px solid ${primaryColor}`, paddingLeft: "10px" }}>Certifications</h4>
      <div className="certifications-list">
        {user.certificates ? user.certificates.split('\n').map((cert, i) => cert.trim() && (
          <p key={i} style={{ fontSize: "13px", margin: "5px 0", color: "#334155" }}>• {cert}</p>
        )) : <p style={{ fontSize: "13px", color: "#64748b" }}>Add your certifications</p>}
      </div>
    </div>

    <div className="simple-section">
      <h4 style={{ color: primaryColor, fontSize: "16px", margin: "0 0 10px 0", borderLeft: `3px solid ${primaryColor}`, paddingLeft: "10px" }}>Languages</h4>
      <p style={{ fontSize: "13px", color: "#334155" }}>{user.languages || "Add languages"}</p>
    </div>
  </div>
);

// ==========================================
// TEMPLATE 2: SIDEBAR WITH PROFILE PIC
// ==========================================
const TemplateSidebar = ({ user, primaryColor, accentColor }) => (
  <div className="resume-preview template-sidebar">
    <div className="sidebar-layout">
      <div className="sidebar-left" style={{ backgroundColor: hexToRgba(primaryColor, 0.08), padding: "20px", borderRadius: "12px" }}>
        {user.profilePhoto && (
          <div className="sidebar-photo" style={{ width: "120px", height: "120px", borderRadius: "50%", overflow: "hidden", margin: "0 auto 15px", border: `3px solid ${primaryColor}` }}>
            <img src={user.profilePhoto} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        )}
        <h2 style={{ color: primaryColor, fontSize: "20px", textAlign: "center", margin: "0 0 5px 0" }}>{user.name || "Your Name"}</h2>
        <p className="sidebar-title" style={{ color: accentColor, fontSize: "12px", textAlign: "center", marginBottom: "20px" }}>{user.role || "Professional Title"}</p>
        
        <div className="sidebar-contact" style={{ marginBottom: "20px" }}>
          {user.email && <p style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", margin: "8px 0" }}><FiMail size={14} /> {user.email}</p>}
          {user.phone && <p style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", margin: "8px 0" }}><FiPhone size={14} /> {user.phone}</p>}
          {user.linkedin && <p style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", margin: "8px 0" }}><FiLinkedin size={14} /> {user.linkedin}</p>}
          {user.address && <p style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", margin: "8px 0" }}><FiMapPin size={14} /> {user.address}</p>}
        </div>
        
        <div className="sidebar-section" style={{ marginBottom: "20px" }}>
          <h4 style={{ color: primaryColor, fontSize: "14px", marginBottom: "10px" }}>Core Competencies</h4>
          <div className="sidebar-skills" style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {user.skills ? user.skills.split(',').slice(0, 6).map((skill, i) => skill.trim() && (
              <span key={i} className="skill-tag" style={{ backgroundColor: hexToRgba(primaryColor, 0.15), color: primaryColor, padding: "3px 10px", borderRadius: "15px", fontSize: "10px" }}>{skill.trim()}</span>
            )) : <p style={{ fontSize: "11px" }}>Add skills</p>}
          </div>
        </div>
        
        <div className="sidebar-section" style={{ marginBottom: "20px" }}>
          <h4 style={{ color: primaryColor, fontSize: "14px", marginBottom: "10px" }}>Languages</h4>
          <p style={{ fontSize: "11px" }}>{user.languages || "Add languages"}</p>
        </div>
        
        <div className="sidebar-section">
          <h4 style={{ color: primaryColor, fontSize: "14px", marginBottom: "10px" }}>Certifications</h4>
          <div className="sidebar-certifications">
            {user.certificates ? user.certificates.split('\n').slice(0, 3).map((cert, i) => cert.trim() && (
              <p key={i} style={{ fontSize: "11px", margin: "4px 0" }}>• {cert}</p>
            )) : <p style={{ fontSize: "11px" }}>Add certifications</p>}
          </div>
        </div>
      </div>
      
      <div className="sidebar-right" style={{ padding: "20px" }}>
        <div className="sidebar-section" style={{ marginBottom: "20px" }}>
          <h4 style={{ borderBottom: `2px solid ${accentColor}`, color: primaryColor, fontSize: "14px", marginBottom: "10px", paddingBottom: "5px" }}>Professional Summary</h4>
          <p style={{ fontSize: "12px", lineHeight: "1.5", color: "#334155" }}>{user.about || "Add your professional summary"}</p>
        </div>
        
        <div className="sidebar-section" style={{ marginBottom: "20px" }}>
          <h4 style={{ borderBottom: `2px solid ${accentColor}`, color: primaryColor, fontSize: "14px", marginBottom: "10px", paddingBottom: "5px" }}>Work Experience</h4>
          {user.experience ? user.experience.split('\n').map((exp, i) => exp.trim() && (
            <div key={i} className="exp-item" style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
              <div className="exp-bullet" style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: primaryColor, marginTop: "6px" }}></div>
              <p style={{ fontSize: "12px", margin: 0, color: "#334155" }}>{exp}</p>
            </div>
          )) : <p style={{ fontSize: "12px" }}>Add your work experience</p>}
        </div>
        
        <div className="sidebar-section" style={{ marginBottom: "20px" }}>
          <h4 style={{ borderBottom: `2px solid ${accentColor}`, color: primaryColor, fontSize: "14px", marginBottom: "10px", paddingBottom: "5px" }}>Projects</h4>
          {user.projects ? user.projects.split('\n').map((project, i) => project.trim() && (
            <div key={i} className="project-item" style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
              <div className="project-bullet" style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: accentColor, marginTop: "6px" }}></div>
              <p style={{ fontSize: "12px", margin: 0, color: "#334155" }}>{project}</p>
            </div>
          )) : <p style={{ fontSize: "12px" }}>Add your projects</p>}
        </div>
        
        <div className="sidebar-section">
          <h4 style={{ borderBottom: `2px solid ${accentColor}`, color: primaryColor, fontSize: "14px", marginBottom: "10px", paddingBottom: "5px" }}>Education</h4>
          {user.tenthSchool && <p style={{ fontSize: "12px", margin: "5px 0" }}><strong>10th:</strong> {user.tenthSchool} | {user.tenthPercentage}% | {user.tenthYear}</p>}
          {user.interCollege && <p style={{ fontSize: "12px", margin: "5px 0" }}><strong>12th:</strong> {user.interCollege} ({user.interCourse}) | {user.interPercentage}% | {user.interYear}</p>}
          {user.degreeCollege && <p style={{ fontSize: "12px", margin: "5px 0" }}><strong>Degree:</strong> {user.degreeCollege} ({user.degreeCourse}) | {user.degreePercentage} CGPA | {user.degreeYear}</p>}
        </div>
      </div>
    </div>
  </div>
);

// ==========================================
// TEMPLATE 3: SIMPLE TWO COLUMN
// ==========================================
const TemplateTwoColumn = ({ user, primaryColor, accentColor }) => (
  <div className="resume-preview template-two-column">
    <div className="twocolumn-header" style={{ textAlign: "center", borderBottom: `2px solid ${primaryColor}`, paddingBottom: "15px", marginBottom: "20px" }}>
      <h1 style={{ color: primaryColor, fontSize: "28px", margin: "0 0 5px 0" }}>{user.name || "Your Name"}</h1>
      <h3 style={{ color: accentColor, fontSize: "16px", margin: "0 0 10px 0", fontWeight: "500" }}>{user.role || "Professional Title"}</h3>
      <div className="twocolumn-contact" style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "15px", fontSize: "11px", color: "#64748b" }}>
        {user.email && <span>📧 {user.email}</span>}
        {user.phone && <span>📞 {user.phone}</span>}
        {user.linkedin && <span>🔗 {user.linkedin}</span>}
        {user.address && <span>📍 {user.address}</span>}
      </div>
    </div>

    <div className="twocolumn-grid" style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "30px" }}>
      <div className="twocolumn-left">
        <div className="twocolumn-section" style={{ marginBottom: "20px" }}>
          <h4 style={{ color: primaryColor, fontSize: "14px", margin: "0 0 10px 0", borderLeft: `3px solid ${primaryColor}`, paddingLeft: "8px" }}>Skills</h4>
          <div className="skills-tags" style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {user.skills ? user.skills.split(',').map((skill, i) => skill.trim() && (
              <span key={i} className="skill-tag" style={{ backgroundColor: hexToRgba(primaryColor, 0.1), color: primaryColor, padding: "3px 10px", borderRadius: "15px", fontSize: "11px" }}>{skill.trim()}</span>
            )) : <p style={{ fontSize: "12px" }}>Add skills</p>}
          </div>
        </div>

        <div className="twocolumn-section" style={{ marginBottom: "20px" }}>
          <h4 style={{ color: primaryColor, fontSize: "14px", margin: "0 0 10px 0", borderLeft: `3px solid ${primaryColor}`, paddingLeft: "8px" }}>Certifications</h4>
          {user.certificates ? user.certificates.split('\n').map((cert, i) => cert.trim() && (
            <p key={i} style={{ fontSize: "11px", margin: "5px 0" }}>• {cert}</p>
          )) : <p style={{ fontSize: "12px" }}>Add certifications</p>}
        </div>

        <div className="twocolumn-section">
          <h4 style={{ color: primaryColor, fontSize: "14px", margin: "0 0 10px 0", borderLeft: `3px solid ${primaryColor}`, paddingLeft: "8px" }}>Languages</h4>
          <p style={{ fontSize: "12px" }}>{user.languages || "Add languages"}</p>
        </div>
      </div>

      <div className="twocolumn-right">
        <div className="twocolumn-section" style={{ marginBottom: "20px" }}>
          <h4 style={{ color: primaryColor, fontSize: "14px", margin: "0 0 10px 0", borderLeft: `3px solid ${primaryColor}`, paddingLeft: "8px" }}>Summary</h4>
          <p style={{ fontSize: "12px", lineHeight: "1.5", color: "#334155" }}>{user.about || "Add your professional summary"}</p>
        </div>

        <div className="twocolumn-section" style={{ marginBottom: "20px" }}>
          <h4 style={{ color: primaryColor, fontSize: "14px", margin: "0 0 10px 0", borderLeft: `3px solid ${primaryColor}`, paddingLeft: "8px" }}>Experience</h4>
          {user.experience ? user.experience.split('\n').map((exp, i) => exp.trim() && (
            <p key={i} style={{ fontSize: "12px", margin: "5px 0" }}>• {exp}</p>
          )) : <p style={{ fontSize: "12px" }}>Add your work experience</p>}
        </div>

        <div className="twocolumn-section" style={{ marginBottom: "20px" }}>
          <h4 style={{ color: primaryColor, fontSize: "14px", margin: "0 0 10px 0", borderLeft: `3px solid ${primaryColor}`, paddingLeft: "8px" }}>Projects</h4>
          {user.projects ? user.projects.split('\n').map((project, i) => project.trim() && (
            <p key={i} style={{ fontSize: "12px", margin: "5px 0" }}>• {project}</p>
          )) : <p style={{ fontSize: "12px" }}>Add your projects</p>}
        </div>

        <div className="twocolumn-section">
          <h4 style={{ color: primaryColor, fontSize: "14px", margin: "0 0 10px 0", borderLeft: `3px solid ${primaryColor}`, paddingLeft: "8px" }}>Education</h4>
          {user.tenthSchool && <p style={{ fontSize: "12px", margin: "5px 0" }}><strong>10th:</strong> {user.tenthSchool} | {user.tenthPercentage}% | {user.tenthYear}</p>}
          {user.interCollege && <p style={{ fontSize: "12px", margin: "5px 0" }}><strong>12th:</strong> {user.interCollege} ({user.interCourse}) | {user.interPercentage}% | {user.interYear}</p>}
          {user.degreeCollege && <p style={{ fontSize: "12px", margin: "5px 0" }}><strong>Degree:</strong> {user.degreeCollege} ({user.degreeCourse}) | {user.degreePercentage} CGPA | {user.degreeYear}</p>}
        </div>
      </div>
    </div>
  </div>
);

// ==========================================
// TEMPLATE 4: MODERN NAVBAR STYLE (Unique)
// ==========================================
const TemplateModernNav = ({ user, primaryColor, accentColor }) => (
  <div className="resume-preview template-modern-nav">
    {/* Navigation Bar Style Header */}
    <div className="modern-nav-header" style={{ backgroundColor: primaryColor, padding: "15px 20px", borderRadius: "10px 10px 0 0", marginBottom: "20px" }}>
      <div className="nav-links" style={{ display: "flex", gap: "25px", marginBottom: "15px", flexWrap: "wrap" }}>
        <span style={{ color: "white", fontSize: "12px", fontWeight: "500" }}>🏠 HOME</span>
        <span style={{ color: "white", fontSize: "12px", fontWeight: "500" }}>📋 ABOUT</span>
        <span style={{ color: "white", fontSize: "12px", fontWeight: "500" }}>💼 WORK</span>
        <span style={{ color: "white", fontSize: "12px", fontWeight: "500" }}>🎓 EDUCATION</span>
        <span style={{ color: "white", fontSize: "12px", fontWeight: "500" }}>📞 CONTACT</span>
      </div>
      <div className="nav-profile" style={{ display: "flex", alignItems: "center", gap: "15px", flexWrap: "wrap" }}>
        {user.profilePhoto && (
          <div className="nav-photo" style={{ width: "50px", height: "50px", borderRadius: "50%", overflow: "hidden", border: "2px solid white" }}>
            <img src={user.profilePhoto} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        )}
        <div className="nav-title">
          <h1 style={{ color: "white", fontSize: "22px", margin: "0" }}>{user.name || "Your Name"}</h1>
          <p style={{ color: hexToRgba("white", 0.8), fontSize: "12px", margin: "5px 0 0 0" }}>{user.role || "Professional Title"}</p>
        </div>
      </div>
    </div>

    <div style={{ padding: "0 20px 20px 20px" }}>
      {/* Contact Bar */}
      <div className="modern-contact-bar" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", backgroundColor: hexToRgba(primaryColor, 0.05), padding: "12px", borderRadius: "8px", marginBottom: "20px" }}>
        {user.email && <span style={{ fontSize: "11px" }}>📧 {user.email}</span>}
        {user.phone && <span style={{ fontSize: "11px" }}>📞 {user.phone}</span>}
        {user.linkedin && <span style={{ fontSize: "11px" }}>🔗 {user.linkedin}</span>}
        {user.address && <span style={{ fontSize: "11px" }}>📍 {user.address}</span>}
      </div>

      {/* Two Column Content */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "25px" }}>
        <div className="modern-left">
          <div className="modern-card" style={{ backgroundColor: hexToRgba(primaryColor, 0.05), padding: "15px", borderRadius: "10px", marginBottom: "20px" }}>
            <h4 style={{ color: primaryColor, fontSize: "14px", margin: "0 0 10px 0", display: "flex", alignItems: "center", gap: "8px" }}><FiCpu size={16} /> Technical Skills</h4>
            <div className="skills-tags" style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {user.skills ? user.skills.split(',').slice(0, 8).map((skill, i) => skill.trim() && (
                <span key={i} className="skill-tag" style={{ backgroundColor: hexToRgba(primaryColor, 0.1), color: primaryColor, padding: "4px 10px", borderRadius: "15px", fontSize: "10px", fontWeight: "500" }}>{skill.trim()}</span>
              )) : <p style={{ fontSize: "12px" }}>Add skills</p>}
            </div>
          </div>

          <div className="modern-card" style={{ backgroundColor: hexToRgba(accentColor, 0.05), padding: "15px", borderRadius: "10px", marginBottom: "20px" }}>
            <h4 style={{ color: accentColor, fontSize: "14px", margin: "0 0 10px 0" }}><FiAward size={16} /> Certifications</h4>
            {user.certificates ? user.certificates.split('\n').slice(0, 4).map((cert, i) => cert.trim() && (
              <p key={i} style={{ fontSize: "11px", margin: "5px 0" }}>🎯 {cert}</p>
            )) : <p style={{ fontSize: "12px" }}>Add certifications</p>}
          </div>

          <div className="modern-card" style={{ backgroundColor: hexToRgba(primaryColor, 0.05), padding: "15px", borderRadius: "10px" }}>
            <h4 style={{ color: primaryColor, fontSize: "14px", margin: "0 0 10px 0" }}><FiGlobe size={16} /> Languages</h4>
            <p style={{ fontSize: "12px" }}>{user.languages || "Add languages"}</p>
          </div>
        </div>

        <div className="modern-right">
          <div className="modern-card" style={{ padding: "15px", borderRadius: "10px", border: `1px solid ${hexToRgba(primaryColor, 0.2)}`, marginBottom: "20px" }}>
            <h4 style={{ color: primaryColor, fontSize: "14px", margin: "0 0 10px 0" }}>📄 Professional Summary</h4>
            <p style={{ fontSize: "12px", lineHeight: "1.5" }}>{user.about || "Add your professional summary"}</p>
          </div>

          <div className="modern-card" style={{ padding: "15px", borderRadius: "10px", border: `1px solid ${hexToRgba(accentColor, 0.2)}`, marginBottom: "20px" }}>
            <h4 style={{ color: accentColor, fontSize: "14px", margin: "0 0 10px 0" }}>💼 Work Experience</h4>
            {user.experience ? user.experience.split('\n').map((exp, i) => exp.trim() && (
              <p key={i} style={{ fontSize: "12px", margin: "5px 0" }}>▹ {exp}</p>
            )) : <p style={{ fontSize: "12px" }}>Add your work experience</p>}
          </div>

          <div className="modern-card" style={{ padding: "15px", borderRadius: "10px", border: `1px solid ${hexToRgba(primaryColor, 0.2)}`, marginBottom: "20px" }}>
            <h4 style={{ color: primaryColor, fontSize: "14px", margin: "0 0 10px 0" }}>🚀 Projects</h4>
            {user.projects ? user.projects.split('\n').map((project, i) => project.trim() && (
              <p key={i} style={{ fontSize: "12px", margin: "5px 0" }}>▹ {project}</p>
            )) : <p style={{ fontSize: "12px" }}>Add your projects</p>}
          </div>

          <div className="modern-card" style={{ padding: "15px", borderRadius: "10px", border: `1px solid ${hexToRgba(accentColor, 0.2)}` }}>
            <h4 style={{ color: accentColor, fontSize: "14px", margin: "0 0 10px 0" }}>🎓 Education</h4>
            {user.tenthSchool && <p style={{ fontSize: "12px", margin: "5px 0" }}>📚 10th: {user.tenthSchool} | {user.tenthPercentage}% | {user.tenthYear}</p>}
            {user.interCollege && <p style={{ fontSize: "12px", margin: "5px 0" }}>📖 12th: {user.interCollege} ({user.interCourse}) | {user.interPercentage}% | {user.interYear}</p>}
            {user.degreeCollege && <p style={{ fontSize: "12px", margin: "5px 0" }}>🎓 Degree: {user.degreeCollege} ({user.degreeCourse}) | {user.degreePercentage} CGPA | {user.degreeYear}</p>}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ==========================================
// AI GENERATED TEMPLATE COMPONENT
// ==========================================
const TemplateAIGenerated = ({ user, styleManifest, primaryColor, accentColor }) => {
  if (!styleManifest) return null;

  const mergedStyles = {
    ...styleManifest.globalStyles,
    primaryColor: primaryColor || styleManifest.globalStyles?.primaryColor || "#2563eb",
    accentColor: accentColor || styleManifest.globalStyles?.accentColor || "#7c3aed"
  };

  const { layoutType, structuralSections, columnWidths } = styleManifest;

  const renderSection = (sectionKey, sectionData) => {
    if (!sectionData.visible) return null;

    const renderContentData = () => {
      switch(sectionKey) {
        case "summary":
          return <p style={{ fontSize: mergedStyles.bodyFontSize }}>{user.about || "Add your professional summary"}</p>;
        case "education":
          return (
            <div>
              {user.tenthSchool && <div><strong>10th:</strong> {user.tenthSchool} | {user.tenthPercentage}% | {user.tenthYear}</div>}
              {user.interCollege && <div><strong>12th:</strong> {user.interCollege} ({user.interCourse}) | {user.interPercentage}% | {user.interYear}</div>}
              {user.degreeCollege && <div><strong>Degree:</strong> {user.degreeCollege} ({user.degreeCourse}) | {user.degreePercentage} CGPA | {user.degreeYear}</div>}
            </div>
          );
        case "skills":
          return (
            <div className="skills-tags">
              {user.skills ? user.skills.split(',').map((s, i) => s.trim() && (
                <span key={i} className="skill-tag" style={{ backgroundColor: hexToRgba(mergedStyles.primaryColor, 0.1), color: mergedStyles.primaryColor }}>{s.trim()}</span>
              )) : <p>Add your skills</p>}
            </div>
          );
        case "experience":
          return user.experience ? user.experience.split('\n').map((exp, i) => exp.trim() && <p key={i}>• {exp}</p>) : <p>Add your work experience</p>;
        case "projects":
          return user.projects ? user.projects.split('\n').map((project, i) => project.trim() && <p key={i}>• {project}</p>) : <p>Add your projects</p>;
        case "certifications":
          return user.certificates ? user.certificates.split('\n').map((cert, i) => cert.trim() && <p key={i}>• {cert}</p>) : <p>Add your certifications</p>;
        case "languages":
          return <p>{user.languages || "Add your languages"}</p>;
        default:
          return <p>{user[sectionKey] || `Add your ${sectionKey}`}</p>;
      }
    };

    return (
      <div key={sectionKey} style={{ marginBottom: "20px" }}>
        <h4 style={{ color: mergedStyles.primaryColor, borderBottom: `2px solid ${mergedStyles.accentColor}`, paddingBottom: "5px", marginBottom: "10px" }}>
          {sectionData.customTitle || getSectionDisplayTitle(sectionKey)}
        </h4>
        {renderContentData()}
      </div>
    );
  };

  const getOrderedSections = () => {
    if (layoutType === "two-column") {
      const leftSections = [];
      const rightSections = [];
      Object.entries(structuralSections).forEach(([key, data]) => {
        if (data.visible) {
          if (data.column === "left" || data.column === "sidebar") leftSections.push([key, data]);
          else rightSections.push([key, data]);
        }
      });
      return { leftSections, rightSections };
    } else {
      const mainSections = Object.entries(structuralSections).filter(([_, data]) => data.visible);
      return { mainSections };
    }
  };

  const { leftSections, rightSections, mainSections } = getOrderedSections();

  return (
    <div className="resume-preview" style={{ fontFamily: mergedStyles.fontFamily, padding: "30px", backgroundColor: "white" }}>
      <div style={{ textAlign: "center", borderBottom: `3px solid ${mergedStyles.primaryColor}`, paddingBottom: "15px", marginBottom: "20px" }}>
        <h1 style={{ color: mergedStyles.primaryColor, margin: 0 }}>{user.name || "Your Name"}</h1>
        <h3 style={{ color: mergedStyles.accentColor, margin: "5px 0" }}>{user.role || "Professional Title"}</h3>
        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "15px", fontSize: "12px" }}>
          {user.email && <span>📧 {user.email}</span>}
          {user.phone && <span>📞 {user.phone}</span>}
          {user.linkedin && <span>🔗 {user.linkedin}</span>}
        </div>
      </div>

      {layoutType === "two-column" ? (
        <div style={{ display: "grid", gridTemplateColumns: columnWidths || "1fr 2fr", gap: "30px" }}>
          <div>{leftSections && leftSections.map(([key, data]) => renderSection(key, data))}</div>
          <div>{rightSections && rightSections.map(([key, data]) => renderSection(key, data))}</div>
        </div>
      ) : (
        <div>{mainSections && mainSections.map(([key, data]) => renderSection(key, data))}</div>
      )}
    </div>
  );
};

// ==========================================
// MAIN COMPONENT
// ==========================================
function CreateResume() {
  const [user, setUser] = useState({
    name: "P.G Nandhana",
    email: "ponnarasserynandhu@gmail.com",
    phone: "+91 7799673288",
    address: "Proddatur, 516-360",
    role: "Data Analyst",
    linkedin: "https://www.linkedin.com/in/nandhuponnarassery-a16206264",
    about: "Highly skilled Data Analyst with expertise in leveraging data insights to inform UX design decisions. Proficient in wireframing, visual design, interaction design, and user experience (UX) design principles to create user-centered solutions.",
    skills: "User experience design, wireframing, visual design, interaction design, prototypes, user research, accessibility design, usability testing",
    experience: "Machine Learning Intern - SkillDzire (April 2025 – June 2025)\n• Gained hands-on experience applying supervised machine learning techniques\n• Worked on data preprocessing, model training, and evaluation\n• Implemented classification algorithms using Python and Scikit-learn",
    projects: "Cyber Bullying Detection using Machine Learning\n• Developed text classification model using Python and Scikit-learn\n• Performed data preprocessing and feature extraction\n• Compared multiple algorithms for best accuracy",
    certificates: "Python Programming – Infosys Springboard\nR Programming Fundamentals – edX\nData Visualization with R – edX",
    languages: "English – Fluent, Tamil – Fluent, Telugu – Native",
    tenthSchool: "Gautam High School",
    tenthPercentage: "98",
    tenthYear: "2020",
    interCollege: "Deepthi Junior College",
    interCourse: "MPC",
    interPercentage: "54",
    interYear: "2022",
    degreeCollege: "Chaitanya Bharati Institute of Technology",
    degreeCourse: "CSE(AI&ML)",
    degreePercentage: "6.8",
    degreeYear: "2026",
    profilePhoto: ""
  });

  const [selectedTemplate, setSelectedTemplate] = useState("t1");
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [primaryColor, setPrimaryColor] = useState("#2563eb");
  const [accentColor, setAccentColor] = useState("#7c3aed");
  const [aiStyleManifest, setAiStyleManifest] = useState(null);
  const [usingAiTemplate, setUsingAiTemplate] = useState(false);
  const [showAiGenerator, setShowAiGenerator] = useState(true);
  const resumeRef = useRef();

  const templateComponents = {
    t1: TemplateSimple,
    t2: TemplateSidebar,
    t3: TemplateTwoColumn,
    t4: TemplateModernNav
  };

  const templates = [
    { id: "t1", name: "Simple", icon: FiFileText, color: "#4361ee", description: "Single column, clean layout" },
    { id: "t2", name: "Sidebar", icon: FiGrid, color: "#06d6a0", description: "Sidebar with profile photo" },
    { id: "t3", name: "Two Column", icon: FiLayout, color: "#f9c74f", description: "Balanced two column layout" },
    { id: "t4", name: "Modern Nav", icon: FiHome, color: "#9c89b8", description: "Unique navbar style design" }
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await axios.get("http://localhost:5000/api/profile/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success && res.data.profile) {
          setUser(prev => ({ ...prev, ...res.data.profile }));
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
  };

  const handleTemplateSelect = (templateId) => {
    setSelectedTemplate(templateId);
    setUsingAiTemplate(false);
    setAiStyleManifest(null);
    setShowAiGenerator(true);
    showNotification(`Switched to ${templates.find(t => t.id === templateId)?.name} template`, "success");
  };

  const handleAIStyleGenerated = (manifest) => {
    setAiStyleManifest(manifest);
    setUsingAiTemplate(true);
    setShowAiGenerator(false);
    showNotification(`✨ AI layout applied successfully!`, "success");
  };

  const closeAiGenerator = () => {
    setShowAiGenerator(false);
  };

  const resetToStandardTemplates = () => {
    setUsingAiTemplate(false);
    setAiStyleManifest(null);
    setShowAiGenerator(true);
    setSelectedTemplate("t1");
    showNotification("Switched back to standard templates", "info");
  };

  const exportPDF = async () => {
    if (!resumeRef.current) return;
    setIsExporting(true);
    showNotification("Generating PDF...", "info");
    try {
      const canvas = await html2canvas(resumeRef.current, { 
        scale: 2, 
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const imgWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`${user.name || "Resume"}.pdf`);
      showNotification("PDF exported successfully!", "success");
    } catch (error) {
      console.error("PDF export error:", error);
      showNotification("Failed to export PDF. Please try again.", "error");
    } finally {
      setIsExporting(false);
    }
  };

  const saveResume = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showNotification("Please login first.", "error");
        return;
      }
      await axios.post("http://localhost:5000/api/resume/save", {
        resumeData: user, 
        template: usingAiTemplate ? "ai-generated" : selectedTemplate, 
        colorSettings: { primaryColor, accentColor },
        aiManifest: usingAiTemplate ? aiStyleManifest : null
      }, { headers: { Authorization: `Bearer ${token}` } });
      setSaveSuccess(true);
      showNotification("Resume saved successfully!", "success");
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Save error:", err);
      showNotification("Error saving resume. Please try again.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const renderPreviewCanvas = () => {
    if (usingAiTemplate && aiStyleManifest) {
      return <TemplateAIGenerated user={user} styleManifest={aiStyleManifest} primaryColor={primaryColor} accentColor={accentColor} />;
    }
    const CurrentTemplate = templateComponents[selectedTemplate];
    return <CurrentTemplate user={user} primaryColor={primaryColor} accentColor={accentColor} />;
  };

  return (
    <div className="create-resume-container">
      <div className="resume-header-modern">
        <div className="header-content">
          <h1>Create Your Professional Resume</h1>
          <p>Design, customize, and download your ATS-friendly resume</p>
        </div>
        
        <div className="action-buttons-container">
          {usingAiTemplate && (
            <button onClick={resetToStandardTemplates} className="btn-action reset-btn">
              <FiRefreshCw /> Standard Templates
            </button>
          )}
          <button onClick={saveResume} disabled={isSaving} className="btn-action save-btn">
            {saveSuccess ? <FiCheck /> : <FiSave />} {isSaving ? "Saving..." : "Save"}
          </button>
          <button onClick={exportPDF} disabled={isExporting} className="btn-action download-btn">
            <FiDownload /> {isExporting ? "Processing..." : "PDF"}
          </button>
        </div>
      </div>

      {!usingAiTemplate && (
        <div className="template-selector-modern">
          <div className="section-header">
            <h2>Choose Your Template</h2>
            <p>Select from 4 professionally designed ATS-friendly layouts</p>
          </div>
          <div className="template-grid">
            {templates.map((template) => {
              const Icon = template.icon;
              return (
                <div
                  key={template.id}
                  className={`template-card ${selectedTemplate === template.id ? "active" : ""}`}
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <div className="template-icon" style={{ backgroundColor: hexToRgba(template.color, 0.15), color: template.color }}>
                    <Icon size={24} />
                  </div>
                  <div className="template-card-info">
                    <h4>{template.name}</h4>
                    <p>{template.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showAiGenerator && !usingAiTemplate && (
        <AIResumeGenerator 
          userProfile={user} 
          onAIStyleGenerated={handleAIStyleGenerated}
          onCancel={closeAiGenerator}
        />
      )}

      {usingAiTemplate && aiStyleManifest && (
        <div className="ai-template-info">
          <FiZap className="info-icon" />
          <div className="info-content">
            <strong>🤖 AI-Generated Template Active</strong>
            <p>Your resume is using an AI-analyzed layout</p>
            <small>Layout: {aiStyleManifest.layoutType === "two-column" ? "Two Column" : "Single Column"} | Analysis Time: {aiStyleManifest.processingTime}</small>
          </div>
          <button onClick={resetToStandardTemplates} className="info-close-btn">
            <FiX size={18} />
          </button>
        </div>
      )}

      <div className="color-presets-bar">
        <div className="section-header">
          <h2><FiDroplet /> Customize Colors</h2>
          <p>Personalize your resume with your brand colors</p>
        </div>
        <div className="presets-list">
          <div className="color-picker-item">
            <label>Primary Color</label>
            <div className="color-input-wrapper">
              <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="color-picker" />
              <span className="color-value">{primaryColor}</span>
            </div>
          </div>
          <div className="color-picker-item">
            <label>Accent Color</label>
            <div className="color-input-wrapper">
              <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="color-picker" />
              <span className="color-value">{accentColor}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="resume-workspace-split">
        <div className="editor-side-panel">
          <div className="form-section-card">
            <h3>Personal Information</h3>
            <div className="profile-form">
              <input type="text" name="name" placeholder="Full Name" value={user.name} onChange={handleInputChange} />
              <input type="text" name="role" placeholder="Professional Title" value={user.role} onChange={handleInputChange} />
              <div className="contact-grid">
                <div className="contact-field"><FiMail className="field-icon" /><input type="email" name="email" placeholder="Email" value={user.email} onChange={handleInputChange} /></div>
                <div className="contact-field"><FiPhone className="field-icon" /><input type="text" name="phone" placeholder="Phone" value={user.phone} onChange={handleInputChange} /></div>
                <div className="contact-field"><FiLinkedin className="field-icon" /><input type="text" name="linkedin" placeholder="LinkedIn" value={user.linkedin} onChange={handleInputChange} /></div>
                <div className="contact-field"><FiMapPin className="field-icon" /><input type="text" name="address" placeholder="Location" value={user.address} onChange={handleInputChange} /></div>
              </div>
            </div>
          </div>

          <div className="form-section-card">
            <h3>Profile Photo URL</h3>
            <input type="text" name="profilePhoto" placeholder="Enter image URL for profile photo" value={user.profilePhoto} onChange={handleInputChange} />
            <small style={{ color: "#6b7280", fontSize: "10px", display: "block", marginTop: "4px" }}>Enter a direct image URL (used in Sidebar template)</small>
          </div>

          <div className="form-section-card">
            <h3>Professional Summary</h3>
            <textarea name="about" placeholder="Write a compelling professional summary..." value={user.about} onChange={handleInputChange} rows="4" />
            <h3 style={{ marginTop: "20px" }}>Technical Skills</h3>
            <textarea name="skills" placeholder="Enter your skills (comma separated)" value={user.skills} onChange={handleInputChange} rows="3" />
          </div>

          <div className="form-section-card">
            <h3>Work Experience</h3>
            <textarea name="experience" placeholder="Describe your work experience..." value={user.experience} onChange={handleInputChange} rows="5" />
            <h3 style={{ marginTop: "20px" }}>Projects</h3>
            <textarea name="projects" placeholder="List your key projects..." value={user.projects} onChange={handleInputChange} rows="4" />
            <h3 style={{ marginTop: "20px" }}>Certifications</h3>
            <textarea name="certificates" placeholder="List your certifications..." value={user.certificates} onChange={handleInputChange} rows="3" />
            <h3 style={{ marginTop: "20px" }}>Languages</h3>
            <textarea name="languages" placeholder="List your languages..." value={user.languages} onChange={handleInputChange} rows="2" />
          </div>

          <div className="form-section-card">
            <h3>Education History</h3>
            <div className="education-group">
              <div className="edu-level">
                <label>📚 Secondary Education (10th)</label>
                <input type="text" name="tenthSchool" placeholder="School Name" value={user.tenthSchool} onChange={handleInputChange} />
                <div className="edu-details">
                  <div className="edu-field"><FiPercent className="field-icon-small" /><input type="text" name="tenthPercentage" placeholder="Percentage" value={user.tenthPercentage} onChange={handleInputChange} /></div>
                  <div className="edu-field"><FiCalendar className="field-icon-small" /><input type="text" name="tenthYear" placeholder="Year" value={user.tenthYear} onChange={handleInputChange} /></div>
                </div>
              </div>
              <div className="edu-level">
                <label>📖 Higher Secondary (Intermediate)</label>
                <input type="text" name="interCollege" placeholder="College Name" value={user.interCollege} onChange={handleInputChange} />
                <input type="text" name="interCourse" placeholder="Course" value={user.interCourse} onChange={handleInputChange} />
                <div className="edu-details">
                  <div className="edu-field"><FiPercent className="field-icon-small" /><input type="text" name="interPercentage" placeholder="Percentage" value={user.interPercentage} onChange={handleInputChange} /></div>
                  <div className="edu-field"><FiCalendar className="field-icon-small" /><input type="text" name="interYear" placeholder="Year" value={user.interYear} onChange={handleInputChange} /></div>
                </div>
              </div>
              <div className="edu-level">
                <label>🎓 Graduation (Degree)</label>
                <input type="text" name="degreeCollege" placeholder="College Name" value={user.degreeCollege} onChange={handleInputChange} />
                <input type="text" name="degreeCourse" placeholder="Degree" value={user.degreeCourse} onChange={handleInputChange} />
                <div className="edu-details">
                  <div className="edu-field"><FiPercent className="field-icon-small" /><input type="text" name="degreePercentage" placeholder="CGPA" value={user.degreePercentage} onChange={handleInputChange} /></div>
                  <div className="edu-field"><FiCalendar className="field-icon-small" /><input type="text" name="degreeYear" placeholder="Year" value={user.degreeYear} onChange={handleInputChange} /></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="preview-side-panel">
          <div className="zoom-container-sheet" ref={resumeRef}>
            {renderPreviewCanvas()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateResume;