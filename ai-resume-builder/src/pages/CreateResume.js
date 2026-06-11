import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import axios from "axios";
import API_URL from '../config';
import "./CreateResume.css";
import {
  FiDownload, FiSave, FiCheck, FiDroplet, FiUploadCloud, FiZap, FiX,
  FiCalendar, FiPercent, FiRefreshCw, FiMail, FiPhone, FiMapPin,
  FiLinkedin, FiGithub, FiTwitter, FiAward, FiGrid, FiFileText,
  FiLayout, FiImage, FiTrash2, FiUser, FiCode, FiLoader
} from "react-icons/fi";

const hexToRgba = (hex, opacity) => {
  if (!hex) return "rgba(0,0,0,0.05)";
  let c = hex.substring(1);
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const showNotification = (message, type = 'info') => {
  const notification = document.createElement('div');
  notification.className = `ai-notification ${type}`;
  notification.innerHTML = `<div class="notification-content"><span class="notification-icon">${type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ'}</span><span class="notification-message">${message}</span></div>`;
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
};

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

// ========== AI RESUME GENERATOR ==========
function AIResumeGenerator({ userProfile, onAIStyleGenerated, onCancel }) {
  const [dragActive, setDragActive] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisStatus, setAnalysisStatus] = useState("");
  const fileInputRef = useRef();

  const processFile = (file) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Max 10MB");
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError(null);
  };

  const clearFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImageFile(null);
    setPreviewUrl(null);
    setError(null);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const transformBackendResponse = (aiResponse) => {
    const layout = aiResponse.layout || {};
    const layoutType = (layout.layoutType === "two-column") ? "two-column" : "single-column";
    const columnRatio = layout.columnRatio || (layoutType === "two-column" ? "30/70" : "1fr");
    
    let columnWidths = "1fr 2fr";
    if (columnRatio.includes('/')) {
      const parts = columnRatio.split('/');
      columnWidths = `${parts[0]}fr ${parts[1]}fr`;
    } else if (columnRatio.includes('-')) {
      const parts = columnRatio.split('-');
      columnWidths = `${parts[0]}fr ${parts[1]}fr`;
    } else {
      const percent = parseInt(columnRatio);
      if (!isNaN(percent)) {
        columnWidths = `${percent}fr ${100 - percent}fr`;
      }
    }

    const globalStyles = {
      fontFamily: layout.globalStyles?.fontFamily || "Inter, system-ui, sans-serif",
      primaryColor: aiResponse.primaryColor || layout.globalStyles?.primaryColor || "#2563eb",
      accentColor: aiResponse.accentColor || layout.globalStyles?.accentColor || "#7c3aed",
      pagePadding: layout.globalStyles?.pagePadding || "40px",
      lineHeight: layout.globalStyles?.lineHeight || "1.5",
      headerAlignment: layout.globalStyles?.headerAlignment || "left",
      backgroundColor: layout.globalStyles?.backgroundColor || "#ffffff",
      titleFontSize: layout.globalStyles?.titleFontSize || "18px",
      bodyFontSize: layout.globalStyles?.bodyFontSize || "14px"
    };

    const sections = layout.sections || {};
    const structuralSections = {};

    const standardSections = ["summary", "skills", "experience", "education", "projects", "certifications", "languages"];
    
    standardSections.forEach(section => {
      const secData = sections[section] || {};
      structuralSections[section] = {
        visible: secData.visible !== false,
        column: secData.column || (layoutType === "two-column" ? 
          (section === "skills" || section === "certifications" || section === "languages" ? "left" : "right") : "main"),
        customTitle: secData.customTitle || getSectionDisplayTitle(section),
        hasBottomBorder: secData.hasBottomBorder || false,
        hasLeftBorder: secData.hasLeftBorder || false,
        spacingBelow: secData.spacingBelow || "20px",
        innerPadding: secData.innerPadding || "0px",
        titleFontSize: secData.titleFontSize || globalStyles.titleFontSize,
        uppercaseTitle: false
      };
    });

    return {
      layoutType,
      columnWidths,
      globalStyles,
      structuralSections,
      analyzedAt: aiResponse.analyzedAt,
      processingTime: aiResponse.processingTime,
      imageAnalyzed: aiResponse.imageAnalyzed
    };
  };

  const triggerGeneration = async () => {
    if (!imageFile) return;
    setLoading(true);
    setError(null);
    setUploadProgress(0);
    setAnalysisStatus("Uploading image...");
    
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("layoutImage", imageFile);
      formData.append("profileData", JSON.stringify(userProfile));
      
      const response = await axios.post(`${API_URL}/api/ai/clone-layout`, formData, {
        headers: { 
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        },
        timeout: 90000,
        onUploadProgress: (e) => {
          if (e.total) setUploadProgress(Math.round((e.loaded * 100) / e.total));
        }
      });
      
      setAnalysisStatus("AI analyzing layout...");
      
      if (response.data.success) {
        const transformedManifest = transformBackendResponse(response.data);
        showNotification(`✅ AI analysis complete! Layout: ${transformedManifest.layoutType}`, "success");
        if (onAIStyleGenerated) onAIStyleGenerated(transformedManifest);
        clearFile();
      } else {
        throw new Error(response.data.message || "AI processing failed");
      }
    } catch (err) {
      console.error("AI processing error:", err);
      let errorMessage = "Failed to analyze layout. ";
      if (err.code === "ECONNABORTED") {
        errorMessage += "Request timeout - try a smaller image.";
      } else if (err.code === "ERR_NETWORK") {
        errorMessage += "Cannot connect to server. Please check if backend is running.";
      } else if (err.response) {
        errorMessage += err.response.data?.message || `Server error: ${err.response.status}`;
      } else if (err.request) {
        errorMessage += "No response from server. Check backend connection.";
      } else {
        errorMessage += err.message;
      }
      setError(errorMessage);
      showNotification(errorMessage, "error");
    } finally {
      setLoading(false);
      setAnalysisStatus("");
    }
  };

  return (
    <div className="ai-generator-card">
      <div className="ai-card-header">
        <FiZap className="sparkle-icon" />
        <h3>AI Resume Layout Analyzer</h3>
        <span className="badge-new">AI</span>
        {onCancel && <button onClick={onCancel} className="ai-cancel-btn"><FiX size={18} /></button>}
      </div>
      <p className="ai-card-instruction">Upload a resume image – AI will clone its layout, colors, and structure.</p>
      <div className={`drag-drop-zone ${dragActive ? "drag-active" : ""}`}
        onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]); }}
        onClick={() => fileInputRef.current.click()}>
        <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={(e) => e.target.files[0] && processFile(e.target.files[0])} />
        {previewUrl ? (
          <div className="preview-container">
            <img src={previewUrl} alt="Resume preview for AI analysis" className="upload-thumbnail" />
            <button onClick={(e) => { e.stopPropagation(); clearFile(); }} className="clear-preview-btn"><FiX /></button>
          </div>
        ) : (
          <div className="dropzone-prompt">
            <FiUploadCloud size={48} />
            <p>Drag & drop or click to upload</p>
            <small>JPG/PNG max 10MB</small>
          </div>
        )}
      </div>
      {loading && uploadProgress > 0 && (
        <div className="ai-progress-bar">
          <div className="ai-progress-fill" style={{ width: `${uploadProgress}%` }}></div>
          <span>{uploadProgress}% Uploading...</span>
        </div>
      )}
      {loading && analysisStatus && (
        <div className="ai-analyzing-status">
          <FiLoader className="spinning-loader" />
          <span>{analysisStatus}</span>
        </div>
      )}
      {error && <div className="ai-error-message"><FiX size={16} /> {error}</div>}
      {imageFile && !loading && (
        <button className="ai-generate-submit-btn" onClick={triggerGeneration}>
          <FiZap /> Analyze & Generate Template
        </button>
      )}
    </div>
  );
}

// ========== TEMPLATE COMPONENTS ==========
const SectionMinimalist = ({ title, content, color, isList, commaSeparated }) => {
  if (!content) return null;
  return (
    <div style={{ marginBottom: "20px" }}>
      <h3 style={{ fontSize: "18px", color: color, margin: "0 0 8px 0", borderBottom: `2px solid ${hexToRgba(color, 0.3)}`, display: "inline-block" }}>{title}</h3>
      <div style={{ marginTop: "8px" }}>
        {commaSeparated ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>{content.split(',').map((c, i) => c.trim() && <span key={i} style={{ background: hexToRgba(color, 0.1), padding: "2px 8px", borderRadius: "12px", fontSize: "12px" }}>{c.trim()}</span>)}</div>
        ) : isList ? (
          content.split('\n').map((line, i) => line.trim() && <p key={i} style={{ margin: "4px 0", fontSize: "13px" }}>• {line}</p>)
        ) : (
          <p style={{ fontSize: "13px", lineHeight: "1.5" }}>{content}</p>
        )}
      </div>
    </div>
  );
};

const ExecutiveSection = ({ title, content, isList, isSkills, primaryColor }) => {
  if (!content) return null;
  return (
    <div style={{ marginBottom: "16px" }}>
      <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#1e293b", textTransform: "uppercase", letterSpacing: "1px", borderBottom: "1px solid #e2e8f0", paddingBottom: "4px", marginBottom: "8px" }}>{title}</h3>
      {isSkills ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>{content.split(',').map((s,i)=>s.trim()&&<span key={i} style={{background:"#f1f5f9",padding:"2px 8px",borderRadius:"4px",fontSize:"11px"}}>{s.trim()}</span>)}</div>
      ) : isList ? (
        content.split('\n').map((line,i)=>line.trim()&&<p key={i} style={{fontSize:"12px",margin:"3px 0"}}>• {line}</p>)
      ) : (
        <p style={{ fontSize: "12px", lineHeight: "1.5" }}>{content}</p>
      )}
    </div>
  );
};

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
        {user.skills ? user.skills.split(',').map((skill, i) => skill.trim() && (<span key={i} className="skill-tag" style={{ backgroundColor: hexToRgba(primaryColor, 0.1), color: primaryColor, padding: "4px 12px", borderRadius: "20px", fontSize: "12px" }}>{skill.trim()}</span>)) : <p style={{ fontSize: "13px", color: "#64748b" }}>Add your skills</p>}
      </div>
    </div>
    <div className="simple-section" style={{ marginBottom: "20px" }}>
      <h4 style={{ color: primaryColor, fontSize: "16px", margin: "0 0 10px 0", borderLeft: `3px solid ${primaryColor}`, paddingLeft: "10px" }}>Work Experience</h4>
      {user.experience ? user.experience.split('\n').map((exp, i) => exp.trim() && <p key={i} style={{ fontSize: "13px", margin: "5px 0", color: "#334155" }}>• {exp}</p>) : <p style={{ fontSize: "13px", color: "#64748b" }}>Add your work experience</p>}
    </div>
    <div className="simple-section" style={{ marginBottom: "20px" }}>
      <h4 style={{ color: primaryColor, fontSize: "16px", margin: "0 0 10px 0", borderLeft: `3px solid ${primaryColor}`, paddingLeft: "10px" }}>Projects</h4>
      {user.projects ? user.projects.split('\n').map((proj, i) => proj.trim() && <p key={i} style={{ fontSize: "13px", margin: "5px 0", color: "#334155" }}>• {proj}</p>) : <p style={{ fontSize: "13px", color: "#64748b" }}>Add your projects</p>}
    </div>
    <div className="simple-section" style={{ marginBottom: "20px" }}>
      <h4 style={{ color: primaryColor, fontSize: "16px", margin: "0 0 10px 0", borderLeft: `3px solid ${primaryColor}`, paddingLeft: "10px" }}>Education</h4>
      {user.tenthSchool && <p><strong>10th:</strong> {user.tenthSchool} | {user.tenthPercentage}% | {user.tenthYear}</p>}
      {user.interCollege && <p><strong>12th:</strong> {user.interCollege} ({user.interCourse}) | {user.interPercentage}% | {user.interYear}</p>}
      {user.degreeCollege && <p><strong>Degree:</strong> {user.degreeCollege} ({user.degreeCourse}) | {user.degreePercentage} CGPA | {user.degreeYear}</p>}
    </div>
    <div className="simple-section" style={{ marginBottom: "20px" }}>
      <h4 style={{ color: primaryColor, fontSize: "16px", margin: "0 0 10px 0", borderLeft: `3px solid ${primaryColor}`, paddingLeft: "10px" }}>Certifications</h4>
      {user.certificates ? user.certificates.split('\n').map((cert, i) => cert.trim() && <p key={i} style={{ fontSize: "13px", margin: "5px 0" }}>• {cert}</p>) : <p>Add certifications</p>}
    </div>
    <div className="simple-section">
      <h4 style={{ color: primaryColor, fontSize: "16px", margin: "0 0 10px 0", borderLeft: `3px solid ${primaryColor}`, paddingLeft: "10px" }}>Languages</h4>
      <p>{user.languages || "Add languages"}</p>
    </div>
  </div>
);

const TemplateSidebar = ({ user, primaryColor, accentColor }) => (
  <div className="resume-preview template-sidebar">
    <div className="sidebar-layout">
      <div className="sidebar-left" style={{ backgroundColor: hexToRgba(primaryColor, 0.08), padding: "20px", borderRadius: "12px" }}>
        {user.profilePhoto && (<div className="sidebar-photo" style={{ width: "120px", height: "120px", borderRadius: "50%", overflow: "hidden", margin: "0 auto 15px", border: `3px solid ${primaryColor}` }}><img src={user.profilePhoto} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>)}
        <h2 style={{ color: primaryColor, fontSize: "20px", textAlign: "center", margin: "0 0 5px 0" }}>{user.name || "Your Name"}</h2>
        <p className="sidebar-title" style={{ color: accentColor, fontSize: "12px", textAlign: "center", marginBottom: "20px" }}>{user.role || "Professional Title"}</p>
        <div className="sidebar-contact" style={{ marginBottom: "20px" }}>
          {user.email && <p style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", margin: "8px 0" }}><FiMail size={14} /> {user.email}</p>}
          {user.phone && <p style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", margin: "8px 0" }}><FiPhone size={14} /> {user.phone}</p>}
          {user.linkedin && <p style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", margin: "8px 0" }}><FiLinkedin size={14} /> {user.linkedin}</p>}
          {user.address && <p style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", margin: "8px 0" }}><FiMapPin size={14} /> {user.address}</p>}
        </div>
        <div className="sidebar-section" style={{ marginBottom: "20px" }}><h4 style={{ color: primaryColor, fontSize: "14px", marginBottom: "10px" }}>Core Competencies</h4><div className="sidebar-skills" style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>{user.skills ? user.skills.split(',').slice(0,6).map((s,i)=>s.trim()&&<span key={i} style={{backgroundColor:hexToRgba(primaryColor,0.15),color:primaryColor,padding:"3px 10px",borderRadius:"15px",fontSize:"10px"}}>{s.trim()}</span>):<p>Add skills</p>}</div></div>
        <div className="sidebar-section" style={{ marginBottom: "20px" }}><h4 style={{ color: primaryColor, fontSize: "14px", marginBottom: "10px" }}>Languages</h4><p style={{ fontSize: "11px" }}>{user.languages || "Add languages"}</p></div>
        <div className="sidebar-section"><h4 style={{ color: primaryColor, fontSize: "14px", marginBottom: "10px" }}>Certifications</h4><div>{user.certificates ? user.certificates.split('\n').slice(0,3).map((c,i)=>c.trim()&&<p key={i} style={{fontSize:"11px",margin:"4px 0"}}>• {c}</p>):<p>Add certifications</p>}</div></div>
      </div>
      <div className="sidebar-right" style={{ padding: "20px" }}>
        <div className="sidebar-section" style={{ marginBottom: "20px" }}><h4 style={{ borderBottom: `2px solid ${accentColor}`, color: primaryColor, fontSize: "14px", marginBottom: "10px", paddingBottom: "5px" }}>Professional Summary</h4><p style={{ fontSize: "12px", lineHeight: "1.5", color: "#334155" }}>{user.about || "Add your professional summary"}</p></div>
        <div className="sidebar-section" style={{ marginBottom: "20px" }}><h4 style={{ borderBottom: `2px solid ${accentColor}`, color: primaryColor, fontSize: "14px", marginBottom: "10px", paddingBottom: "5px" }}>Work Experience</h4>{user.experience ? user.experience.split('\n').map((exp,i)=>exp.trim()&&<div key={i} className="exp-item" style={{display:"flex",gap:"8px",marginBottom:"10px"}}><div className="exp-bullet" style={{width:"6px",height:"6px",borderRadius:"50%",backgroundColor:primaryColor,marginTop:"6px"}}></div><p style={{fontSize:"12px",margin:0}}>{exp}</p></div>):<p>Add experience</p>}</div>
        <div className="sidebar-section" style={{ marginBottom: "20px" }}><h4 style={{ borderBottom: `2px solid ${accentColor}`, color: primaryColor, fontSize: "14px", marginBottom: "10px", paddingBottom: "5px" }}>Projects</h4>{user.projects ? user.projects.split('\n').map((p,i)=>p.trim()&&<div key={i} className="project-item" style={{display:"flex",gap:"8px",marginBottom:"10px"}}><div className="project-bullet" style={{width:"6px",height:"6px",borderRadius:"50%",backgroundColor:accentColor,marginTop:"6px"}}></div><p style={{fontSize:"12px",margin:0}}>{p}</p></div>):<p>Add projects</p>}</div>
        <div className="sidebar-section"><h4 style={{ borderBottom: `2px solid ${accentColor}`, color: primaryColor, fontSize: "14px", marginBottom: "10px", paddingBottom: "5px" }}>Education</h4>{user.tenthSchool && <p><strong>10th:</strong> {user.tenthSchool} | {user.tenthPercentage}% | {user.tenthYear}</p>}{user.interCollege && <p><strong>12th:</strong> {user.interCollege} ({user.interCourse}) | {user.interPercentage}% | {user.interYear}</p>}{user.degreeCollege && <p><strong>Degree:</strong> {user.degreeCollege} ({user.degreeCourse}) | {user.degreePercentage} CGPA | {user.degreeYear}</p>}</div>
      </div>
    </div>
  </div>
);

const TemplateTwoColumn = ({ user, primaryColor, accentColor }) => (
  <div className="resume-preview template-two-column">
    <div className="twocolumn-header" style={{ textAlign: "center", borderBottom: `2px solid ${primaryColor}`, paddingBottom: "15px", marginBottom: "20px" }}>
      <h1 style={{ color: primaryColor, fontSize: "28px", margin: "0 0 5px 0" }}>{user.name || "Your Name"}</h1>
      <h3 style={{ color: accentColor, fontSize: "16px", margin: "0 0 10px 0", fontWeight: "500" }}>{user.role || "Professional Title"}</h3>
      <div className="twocolumn-contact" style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "15px", fontSize: "11px", color: "#64748b" }}>
        {user.email && <span>📧 {user.email}</span>}{user.phone && <span>📞 {user.phone}</span>}{user.linkedin && <span>🔗 {user.linkedin}</span>}{user.address && <span>📍 {user.address}</span>}
      </div>
    </div>
    <div className="twocolumn-grid" style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "30px" }}>
      <div className="twocolumn-left">
        <div className="twocolumn-section" style={{ marginBottom: "20px" }}><h4 style={{ color: primaryColor, fontSize: "14px", margin: "0 0 10px 0", borderLeft: `3px solid ${primaryColor}`, paddingLeft: "8px" }}>Skills</h4><div className="skills-tags" style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>{user.skills ? user.skills.split(',').map((s,i)=>s.trim()&&<span key={i} style={{backgroundColor:hexToRgba(primaryColor,0.1),color:primaryColor,padding:"3px 10px",borderRadius:"15px",fontSize:"11px"}}>{s.trim()}</span>):<p>Add skills</p>}</div></div>
        <div className="twocolumn-section" style={{ marginBottom: "20px" }}><h4 style={{ color: primaryColor, fontSize: "14px", margin: "0 0 10px 0", borderLeft: `3px solid ${primaryColor}`, paddingLeft: "8px" }}>Certifications</h4>{user.certificates ? user.certificates.split('\n').map((c,i)=>c.trim()&&<p key={i} style={{fontSize:"11px",margin:"5px 0"}}>• {c}</p>):<p>Add certifications</p>}</div>
        <div className="twocolumn-section"><h4 style={{ color: primaryColor, fontSize: "14px", margin: "0 0 10px 0", borderLeft: `3px solid ${primaryColor}`, paddingLeft: "8px" }}>Languages</h4><p>{user.languages || "Add languages"}</p></div>
      </div>
      <div className="twocolumn-right">
        <div className="twocolumn-section"><h4 style={{ color: primaryColor, fontSize: "14px", margin: "0 0 10px 0", borderLeft: `3px solid ${primaryColor}`, paddingLeft: "8px" }}>Summary</h4><p style={{ fontSize: "12px", lineHeight: "1.5" }}>{user.about || "Add summary"}</p></div>
        <div className="twocolumn-section"><h4 style={{ color: primaryColor, fontSize: "14px", margin: "0 0 10px 0", borderLeft: `3px solid ${primaryColor}`, paddingLeft: "8px" }}>Experience</h4>{user.experience ? user.experience.split('\n').map((e,i)=>e.trim()&&<p key={i} style={{fontSize:"12px",margin:"5px 0"}}>• {e}</p>):<p>Add experience</p>}</div>
        <div className="twocolumn-section"><h4 style={{ color: primaryColor, fontSize: "14px", margin: "0 0 10px 0", borderLeft: `3px solid ${primaryColor}`, paddingLeft: "8px" }}>Projects</h4>{user.projects ? user.projects.split('\n').map((p,i)=>p.trim()&&<p key={i} style={{fontSize:"12px",margin:"5px 0"}}>• {p}</p>):<p>Add projects</p>}</div>
        <div className="twocolumn-section"><h4 style={{ color: primaryColor, fontSize: "14px", margin: "0 0 10px 0", borderLeft: `3px solid ${primaryColor}`, paddingLeft: "8px" }}>Education</h4>{user.tenthSchool && <p><strong>10th:</strong> {user.tenthSchool} | {user.tenthPercentage}% | {user.tenthYear}</p>}{user.interCollege && <p><strong>12th:</strong> {user.interCollege} ({user.interCourse}) | {user.interPercentage}% | {user.interYear}</p>}{user.degreeCollege && <p><strong>Degree:</strong> {user.degreeCollege} ({user.degreeCourse}) | {user.degreePercentage} CGPA | {user.degreeYear}</p>}</div>
      </div>
    </div>
  </div>
);

const TemplateMinimalist = ({ user, primaryColor, accentColor }) => (
  <div className="resume-preview template-minimalist" style={{ maxWidth: "700px", margin: "0 auto", textAlign: "center" }}>
    <div style={{ marginBottom: "30px" }}>
      <h1 style={{ fontSize: "32px", margin: "0 0 8px", color: "#1f2937" }}>{user.name || "Your Name"}</h1>
      <p style={{ fontSize: "16px", color: primaryColor, fontWeight: "500", margin: "0 0 12px" }}>{user.role || "Professional Title"}</p>
      <div style={{ display: "flex", justifyContent: "center", gap: "16px", fontSize: "12px", color: "#6b7280", flexWrap: "wrap" }}>
        {user.email && <span>{user.email}</span>}
        {user.phone && <span>{user.phone}</span>}
        {user.linkedin && <span>{user.linkedin}</span>}
        {user.address && <span>{user.address}</span>}
      </div>
    </div>
    <hr style={{ border: `1px solid ${hexToRgba(primaryColor, 0.3)}`, margin: "20px 0" }} />
    <div style={{ textAlign: "left" }}>
      <SectionMinimalist title="Summary" content={user.about} color={primaryColor} />
      <SectionMinimalist title="Skills" content={user.skills} color={primaryColor} isList commaSeparated />
      <SectionMinimalist title="Experience" content={user.experience} color={primaryColor} isList />
      <SectionMinimalist title="Projects" content={user.projects} color={primaryColor} isList />
      <SectionMinimalist title="Education" content={(() => {
        let edu = "";
        if (user.tenthSchool) edu += `10th: ${user.tenthSchool} | ${user.tenthPercentage}% | ${user.tenthYear}\n`;
        if (user.interCollege) edu += `12th: ${user.interCollege} (${user.interCourse}) | ${user.interPercentage}% | ${user.interYear}\n`;
        if (user.degreeCollege) edu += `Degree: ${user.degreeCollege} (${user.degreeCourse}) | ${user.degreePercentage} CGPA | ${user.degreeYear}`;
        return edu;
      })()} color={primaryColor} isList />
      <SectionMinimalist title="Certifications" content={user.certificates} color={primaryColor} isList />
      <SectionMinimalist title="Languages" content={user.languages} color={primaryColor} />
    </div>
  </div>
);

const TemplateCreative = ({ user, primaryColor, accentColor }) => (
  <div className="resume-preview template-creative" style={{ background: "white", borderRadius: "24px", padding: "30px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
    <div style={{ textAlign: "center", marginBottom: "30px", background: `linear-gradient(135deg, ${hexToRgba(primaryColor, 0.1)}, ${hexToRgba(accentColor, 0.05)})`, padding: "20px", borderRadius: "20px" }}>
      {user.profilePhoto && <img src={user.profilePhoto} alt="" style={{ width: "100px", height: "100px", borderRadius: "50%", objectFit: "cover", marginBottom: "15px", border: `3px solid ${primaryColor}` }} />}
      <h1 style={{ fontSize: "28px", margin: "0", color: "#1f2937" }}>{user.name || "Your Name"}</h1>
      <p style={{ fontSize: "14px", color: primaryColor, fontWeight: "500" }}>{user.role || "Professional Title"}</p>
      <div style={{ display: "flex", justifyContent: "center", gap: "12px", fontSize: "11px", flexWrap: "wrap", marginTop: "10px" }}>{user.email && <span>{user.email}</span>}{user.phone && <span>{user.phone}</span>}{user.linkedin && <span>{user.linkedin}</span>}</div>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "20px" }}>
      <div>
        <div style={{ background: hexToRgba(accentColor, 0.05), padding: "15px", borderRadius: "16px", marginBottom: "20px" }}><h3 style={{ color: primaryColor }}>Skills</h3><div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>{user.skills ? user.skills.split(',').map((s,i)=>s.trim()&&<span key={i} style={{backgroundColor:hexToRgba(primaryColor,0.1),padding:"4px 10px",borderRadius:"20px",fontSize:"11px"}}>{s.trim()}</span>):<p>Add skills</p>}</div></div>
        <div style={{ background: hexToRgba(accentColor, 0.05), padding: "15px", borderRadius: "16px", marginBottom: "20px" }}><h3 style={{ color: primaryColor }}>Certifications</h3>{user.certificates ? user.certificates.split('\n').map((c,i)=>c.trim()&&<p key={i} style={{fontSize:"12px",margin:"4px 0"}}>🏅 {c}</p>):<p>Add certifications</p>}</div>
        <div style={{ background: hexToRgba(accentColor, 0.05), padding: "15px", borderRadius: "16px" }}><h3 style={{ color: primaryColor }}>Languages</h3><p>{user.languages || "Add languages"}</p></div>
      </div>
      <div>
        <div style={{ marginBottom: "20px" }}><h3 style={{ color: primaryColor }}>Summary</h3><p style={{ fontSize: "13px", lineHeight: "1.5" }}>{user.about || "Add summary"}</p></div>
        <div style={{ marginBottom: "20px" }}><h3 style={{ color: primaryColor }}>Experience</h3>{user.experience ? user.experience.split('\n').map((e,i)=>e.trim()&&<div key={i} style={{background:"#f9fafb",padding:"8px",borderRadius:"12px",marginBottom:"8px"}}><p style={{margin:0}}>• {e}</p></div>):<p>Add experience</p>}</div>
        <div style={{ marginBottom: "20px" }}><h3 style={{ color: primaryColor }}>Projects</h3>{user.projects ? user.projects.split('\n').map((p,i)=>p.trim()&&<div key={i} style={{background:"#f9fafb",padding:"8px",borderRadius:"12px",marginBottom:"8px"}}><p style={{margin:0}}>• {p}</p></div>):<p>Add projects</p>}</div>
        <div><h3 style={{ color: primaryColor }}>Education</h3>{user.tenthSchool && <p><strong>10th:</strong> {user.tenthSchool} | {user.tenthPercentage}% | {user.tenthYear}</p>}{user.interCollege && <p><strong>12th:</strong> {user.interCollege} ({user.interCourse}) | {user.interPercentage}% | {user.interYear}</p>}{user.degreeCollege && <p><strong>Degree:</strong> {user.degreeCollege} ({user.degreeCourse}) | {user.degreePercentage} CGPA | {user.degreeYear}</p>}</div>
      </div>
    </div>
  </div>
);

const TemplateExecutive = ({ user, primaryColor, accentColor }) => (
  <div className="resume-preview template-executive" style={{ borderTop: `5px solid ${primaryColor}`, padding: "20px 30px", background: "#fff" }}>
    <div style={{ marginBottom: "20px" }}>
      <h1 style={{ fontSize: "34px", margin: "0", letterSpacing: "-0.5px", color: "#1e293b" }}>{user.name || "Your Name"}</h1>
      <p style={{ fontSize: "18px", color: primaryColor, fontWeight: "600", margin: "5px 0" }}>{user.role || "Professional Title"}</p>
      <hr style={{ border: `1px solid ${hexToRgba(primaryColor, 0.3)}`, margin: "12px 0" }} />
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", fontSize: "12px", color: "#475569" }}>{user.email && <span>📧 {user.email}</span>}{user.phone && <span>📞 {user.phone}</span>}{user.linkedin && <span>🔗 {user.linkedin}</span>}{user.address && <span>📍 {user.address}</span>}</div>
    </div>
    <div>
      <ExecutiveSection title="PROFESSIONAL SUMMARY" content={user.about} primaryColor={primaryColor} />
      <ExecutiveSection title="CORE COMPETENCIES" content={user.skills} isSkills primaryColor={primaryColor} />
      <ExecutiveSection title="WORK EXPERIENCE" content={user.experience} isList primaryColor={primaryColor} />
      <ExecutiveSection title="KEY PROJECTS" content={user.projects} isList primaryColor={primaryColor} />
      <ExecutiveSection title="EDUCATION" content={(()=>{let e="";if(user.tenthSchool)e+=`10th: ${user.tenthSchool} | ${user.tenthPercentage}% | ${user.tenthYear}\n`;if(user.interCollege)e+=`12th: ${user.interCollege} (${user.interCourse}) | ${user.interPercentage}% | ${user.interYear}\n`;if(user.degreeCollege)e+=`Degree: ${user.degreeCollege} (${user.degreeCourse}) | ${user.degreePercentage} CGPA | ${user.degreeYear}`;return e;})()} isList primaryColor={primaryColor} />
      <ExecutiveSection title="CERTIFICATIONS" content={user.certificates} isList primaryColor={primaryColor} />
      <ExecutiveSection title="LANGUAGES" content={user.languages} primaryColor={primaryColor} />
    </div>
  </div>
);

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
    
    const renderContent = () => {
      switch(sectionKey) {
        case "summary": return <p style={{ fontSize: mergedStyles.bodyFontSize }}>{user.about || "Add your professional summary"}</p>;
        case "education": return (
          <div>
            {user.tenthSchool && <div><strong>10th:</strong> {user.tenthSchool} | {user.tenthPercentage}% | {user.tenthYear}</div>}
            {user.interCollege && <div><strong>12th:</strong> {user.interCollege} ({user.interCourse}) | {user.interPercentage}% | {user.interYear}</div>}
            {user.degreeCollege && <div><strong>Degree:</strong> {user.degreeCollege} ({user.degreeCourse}) | {user.degreePercentage} CGPA | {user.degreeYear}</div>}
          </div>
        );
        case "skills": return (
          <div className="skills-tags">
            {user.skills ? user.skills.split(',').map((s,i)=>s.trim()&&<span key={i} className="skill-tag" style={{backgroundColor:hexToRgba(mergedStyles.primaryColor,0.1),color:mergedStyles.primaryColor}}>{s.trim()}</span>):<p>Add skills</p>}
          </div>
        );
        case "experience": return user.experience ? user.experience.split('\n').map((e,i)=>e.trim()&&<p key={i}>• {e}</p>) : <p>Add experience</p>;
        case "projects": return user.projects ? user.projects.split('\n').map((p,i)=>p.trim()&&<p key={i}>• {p}</p>) : <p>Add projects</p>;
        case "certifications": return user.certificates ? user.certificates.split('\n').map((c,i)=>c.trim()&&<p key={i}>• {c}</p>) : <p>Add certifications</p>;
        case "languages": return <p>{user.languages || "Add languages"}</p>;
        default: return <p>{user[sectionKey] || `Add ${sectionKey}`}</p>;
      }
    };
    
    return (
      <div key={sectionKey} style={{ marginBottom: "20px" }}>
        <h4 style={{ color: mergedStyles.primaryColor, borderBottom: `2px solid ${mergedStyles.accentColor}`, paddingBottom: "5px", marginBottom: "10px" }}>
          {sectionData.customTitle || getSectionDisplayTitle(sectionKey)}
        </h4>
        {renderContent()}
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
        <h1 style={{ color: mergedStyles.primaryColor, margin:0 }}>{user.name || "Your Name"}</h1>
        <h3 style={{ color: mergedStyles.accentColor, margin:"5px 0" }}>{user.role || "Professional Title"}</h3>
        <div style={{ display:"flex", justifyContent:"center", flexWrap:"wrap", gap:"15px", fontSize:"12px" }}>{user.email && <span>📧 {user.email}</span>}{user.phone && <span>📞 {user.phone}</span>}{user.linkedin && <span>🔗 {user.linkedin}</span>}</div>
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

// ========== MAIN COMPONENT ==========
function CreateResume({ onResumeCreated }) {
  const [user, setUser] = useState({
    name: "", email: "", phone: "", address: "", role: "", linkedin: "", github: "", twitter: "",
    about: "", skills: "", experience: "", projects: "", certificates: "", languages: "",
    tenthSchool: "", tenthPercentage: "", tenthYear: "",
    interCollege: "", interCourse: "", interPercentage: "", interYear: "",
    degreeCollege: "", degreeCourse: "", degreePercentage: "", degreeYear: "",
    profilePhoto: ""
  });
  const [profileLoading, setProfileLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState("t1");
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [primaryColor, setPrimaryColor] = useState("#2563eb");
  const [accentColor, setAccentColor] = useState("#7c3aed");
  const [aiStyleManifest, setAiStyleManifest] = useState(null);
  const [usingAiTemplate, setUsingAiTemplate] = useState(false);
  const [showAiGenerator, setShowAiGenerator] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoUrlError, setPhotoUrlError] = useState("");
  const resumeRef = useRef();

  const templateComponents = useMemo(() => ({
    t1: TemplateSimple,
    t2: TemplateSidebar,
    t3: TemplateTwoColumn,
    t4: TemplateMinimalist,
    t5: TemplateCreative,
    t6: TemplateExecutive
  }), []);

  const templates = [
    { id: "t1", name: "Simple", icon: FiFileText, color: "#4361ee", description: "Single column, clean" },
    { id: "t2", name: "Sidebar", icon: FiGrid, color: "#06d6a0", description: "Sidebar with photo" },
    { id: "t3", name: "Two Column", icon: FiLayout, color: "#f9c74f", description: "Balanced columns" },
    { id: "t4", name: "Minimalist", icon: FiUser, color: "#8b5cf6", description: "Centered, ultra-clean" },
    { id: "t5", name: "Creative", icon: FiCode, color: "#ec4899", description: "Rounded cards, gradient" },
    { id: "t6", name: "Executive", icon: FiAward, color: "#0f172a", description: "Formal, dark accents" }
  ];

  const fetchProfile = async () => {
    setProfileLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) { setProfileLoading(false); return; }
      const res = await axios.get(`${API_URL}/api/profile/me`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success && res.data.profile) setUser(prev => ({ ...prev, ...res.data.profile }));
    } catch (err) { console.error(err); showNotification("Could not load profile data", "error"); }
    finally { setProfileLoading(false); }
  };
  
  useEffect(() => { fetchProfile(); }, []);

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
          canvas.toBlob((blob) => {
            resolve(blob);
          }, file.type, 0.8);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const validateImageUrl = (url) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  };

  const uploadProfilePhoto = async (file) => {
    setUploadingPhoto(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");
      const compressed = await compressImage(file, 400);
      const formData = new FormData();
      formData.append("profilePhoto", compressed, file.name);
      const res = await axios.post(`${API_URL}/api/profile/upload-photo`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
      });
      if (res.data.success) {
        const photoUrl = res.data.photoUrl;
        setUser(prev => ({ ...prev, profilePhoto: photoUrl }));
        showNotification("Profile photo updated", "success");
        return photoUrl;
      } else {
        throw new Error(res.data.message || "Upload failed");
      }
    } catch (err) {
      console.error(err);
      showNotification("Failed to upload photo", "error");
      return null;
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleProfilePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { showNotification("Please select an image file", "error"); return; }
    if (file.size > 2 * 1024 * 1024) { showNotification("Image size should be less than 2MB", "error"); return; }
    await uploadProfilePhoto(file);
  };

  const handleProfilePhotoUrlChange = async (e) => {
    const url = e.target.value;
    setUser(prev => ({ ...prev, profilePhoto: url }));
    if (url.trim() === "") {
      setPhotoUrlError("");
      return;
    }
    const isValid = await validateImageUrl(url);
    if (!isValid) {
      setPhotoUrlError("Invalid image URL or image cannot be loaded");
    } else {
      setPhotoUrlError("");
    }
  };

  const clearProfilePhoto = () => {
    setUser(prev => ({ ...prev, profilePhoto: "" }));
    setPhotoUrlError("");
    showNotification("Profile photo removed", "info");
  };

  const handleInputChange = (e) => { const { name, value } = e.target; setUser(prev => ({ ...prev, [name]: value })); };
  const handleTemplateSelect = (id) => { setSelectedTemplate(id); setUsingAiTemplate(false); setAiStyleManifest(null); setShowAiGenerator(true); showNotification(`Template changed`, "success"); };
  const handleAIStyleGenerated = (manifest) => { setAiStyleManifest(manifest); setUsingAiTemplate(true); setShowAiGenerator(false); showNotification(`AI layout applied!`, "success"); };
  const closeAiGenerator = () => setShowAiGenerator(false);
  const resetToStandardTemplates = () => { setUsingAiTemplate(false); setAiStyleManifest(null); setShowAiGenerator(true); setSelectedTemplate("t1"); showNotification("Back to standard templates", "info"); };
  const refreshFromProfile = () => { fetchProfile(); showNotification("Profile reloaded", "info"); };

  // ================== FIXED PDF EXPORT – CAPTURES FULL CONTENT ==================
  const exportPDF = async () => {
    if (!resumeRef.current) return;
    setIsExporting(true);
    showNotification("Generating PDF...", "info");

    try {
      const originalElement = resumeRef.current;
      // Clone the element to avoid affecting the live DOM
      const clone = originalElement.cloneNode(true);
      // Apply styles to ensure the clone shows all content without scrollbars
      clone.style.position = "absolute";
      clone.style.top = "-9999px";
      clone.style.left = "-9999px";
      clone.style.width = originalElement.scrollWidth + "px";
      clone.style.height = "auto";
      clone.style.overflow = "visible";
      document.body.appendChild(clone);

      // Use html2canvas on the clone with high resolution
      const canvas = await html2canvas(clone, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff"
      });

      // Remove clone
      document.body.removeChild(clone);

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 10; // mm margin on all sides
      const availableWidth = pdfWidth - 2 * margin;
      const imgAspect = canvas.width / canvas.height;
      let finalWidth = availableWidth;
      let finalHeight = finalWidth / imgAspect;

      // If the image is taller than available height, scale down to fit
      if (finalHeight > pdfHeight - 2 * margin) {
        finalHeight = pdfHeight - 2 * margin;
        finalWidth = finalHeight * imgAspect;
      }

      const x = (pdfWidth - finalWidth) / 2;
      const y = (pdfHeight - finalHeight) / 2;

      pdf.addImage(imgData, "PNG", x, y, finalWidth, finalHeight);
      pdf.save(`${user.name || "Resume"}.pdf`);
      showNotification("PDF exported successfully!", "success");
    } catch (error) {
      console.error("PDF export error:", error);
      showNotification("Failed to generate PDF. Please try again.", "error");
    } finally {
      setIsExporting(false);
    }
  };
  // =========================================================

  const saveResume = useCallback(async () => {
    if (!user.name || !user.email) { showNotification("Please fill name and email before saving.", "error"); return; }
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) { showNotification("Please login first.", "error"); setIsSaving(false); return; }
      await axios.post(`${API_URL}/api/resume/save`, {
        resumeData: user,
        template: usingAiTemplate ? "ai-generated" : selectedTemplate,
        colorSettings: { primaryColor, accentColor },
        aiManifest: usingAiTemplate ? aiStyleManifest : null
      }, { headers: { Authorization: `Bearer ${token}` } });
      setSaveSuccess(true);
      showNotification("Resume saved!", "success");
      if (onResumeCreated) {
        onResumeCreated();
      }
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) { 
      console.error(err); 
      showNotification("Error saving resume.", "error"); 
    } finally { 
      setIsSaving(false); 
    }
  }, [user, usingAiTemplate, selectedTemplate, primaryColor, accentColor, aiStyleManifest, onResumeCreated]);

  const renderPreview = useMemo(() => {
    if (usingAiTemplate && aiStyleManifest) return <TemplateAIGenerated user={user} styleManifest={aiStyleManifest} primaryColor={primaryColor} accentColor={accentColor} />;
    const Comp = templateComponents[selectedTemplate];
    return <Comp user={user} primaryColor={primaryColor} accentColor={accentColor} />;
  }, [user, selectedTemplate, usingAiTemplate, aiStyleManifest, primaryColor, accentColor, templateComponents]);

  if (profileLoading) return (<div className="create-resume-container"><div className="resume-header-modern" style={{ textAlign: "center", padding: "40px" }}><div className="loading-spinner-small"></div><p>Loading your profile...</p></div></div>);

  return (
    <div className="create-resume-container">
      <div className="resume-header-modern">
        <div className="header-content"><h1>Create Your Professional Resume</h1><p>Design, customize, and download your ATS-friendly resume</p></div>
        <div className="action-buttons-container">
          <button onClick={refreshFromProfile} className="btn-action refresh-btn"><FiRefreshCw /> Refresh</button>
          {usingAiTemplate && <button onClick={resetToStandardTemplates} className="btn-action reset-btn"><FiRefreshCw /> Standard</button>}
          <button onClick={saveResume} disabled={isSaving} className="btn-action save-btn">{saveSuccess ? <FiCheck /> : <FiSave />} {isSaving ? "Saving..." : "Save"}</button>
          <button onClick={exportPDF} disabled={isExporting} className="btn-action download-btn"><FiDownload /> {isExporting ? "..." : "PDF"}</button>
        </div>
      </div>

      {!usingAiTemplate && (
        <div className="template-selector-modern">
          <div className="section-header"><h2>Choose Your Template</h2><p>6 professionally designed layouts</p></div>
          <div className="template-grid">{templates.map(t => {
            const Icon = t.icon;
            return (<div key={t.id} className={`template-card ${selectedTemplate === t.id ? "active" : ""}`} onClick={() => handleTemplateSelect(t.id)}><div className="template-icon" style={{ backgroundColor: hexToRgba(t.color, 0.15), color: t.color }}><Icon size={24} /></div><div className="template-card-info"><h4>{t.name}</h4><p>{t.description}</p></div></div>);
          })}</div>
        </div>
      )}

      {showAiGenerator && !usingAiTemplate && <AIResumeGenerator userProfile={user} onAIStyleGenerated={handleAIStyleGenerated} onCancel={closeAiGenerator} />}
      {usingAiTemplate && aiStyleManifest && (<div className="ai-template-info"><FiZap className="info-icon" /><div className="info-content"><strong>AI-Generated Template Active</strong><p>Your resume is using an AI-analyzed layout</p></div><button onClick={resetToStandardTemplates} className="info-close-btn"><FiX size={18} /></button></div>)}

      <div className="color-presets-bar"><div className="section-header"><h2><FiDroplet /> Customize Colors</h2></div><div className="presets-list"><div className="color-picker-item"><label>Primary</label><input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="color-picker" /><span className="color-value">{primaryColor}</span></div><div className="color-picker-item"><label>Accent</label><input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="color-picker" /><span className="color-value">{accentColor}</span></div></div></div>

      <div className="resume-workspace-split">
        <div className="editor-side-panel">
          <div className="form-section-card"><h3>Personal Information</h3><input type="text" name="name" placeholder="Full Name" value={user.name} onChange={handleInputChange} /><input type="text" name="role" placeholder="Professional Title" value={user.role} onChange={handleInputChange} /><div className="contact-grid"><div className="contact-field"><FiMail className="field-icon" /><input type="email" name="email" placeholder="Email" value={user.email} onChange={handleInputChange} /></div><div className="contact-field"><FiPhone className="field-icon" /><input type="text" name="phone" placeholder="Phone" value={user.phone} onChange={handleInputChange} /></div><div className="contact-field"><FiLinkedin className="field-icon" /><input type="text" name="linkedin" placeholder="LinkedIn URL" value={user.linkedin} onChange={handleInputChange} /></div><div className="contact-field"><FiGithub className="field-icon" /><input type="text" name="github" placeholder="GitHub URL" value={user.github} onChange={handleInputChange} /></div><div className="contact-field"><FiTwitter className="field-icon" /><input type="text" name="twitter" placeholder="Twitter URL" value={user.twitter} onChange={handleInputChange} /></div><div className="contact-field"><FiMapPin className="field-icon" /><input type="text" name="address" placeholder="Location" value={user.address} onChange={handleInputChange} /></div></div></div>

          <div className="form-section-card"><h3><FiImage /> Profile Photo</h3><div className="profile-photo-upload"><div className="photo-preview">{user.profilePhoto ? (<div className="photo-preview-img"><img src={user.profilePhoto} alt="Profile" /><button className="clear-photo-btn" onClick={clearProfilePhoto}><FiTrash2 /></button></div>) : (<div className="photo-placeholder"><FiImage size={32} /><span>No photo</span></div>)}</div><div className="photo-upload-buttons"><label className="upload-photo-btn" disabled={uploadingPhoto}><FiUploadCloud /> {uploadingPhoto ? "Uploading..." : "Upload Image"}<input type="file" accept="image/*" onChange={handleProfilePhotoUpload} hidden /></label><input type="text" name="profilePhoto" placeholder="Or enter image URL" value={user.profilePhoto} onChange={handleProfilePhotoUrlChange} className="photo-url-input" /></div>{photoUrlError && <small className="error-message">{photoUrlError}</small>}<small>Upload a square image (max 2MB) or provide a direct URL</small></div></div>

          <div className="form-section-card"><h3>Professional Summary</h3><textarea name="about" placeholder="Write a compelling professional summary..." value={user.about} onChange={handleInputChange} rows="4" /><h3>Technical Skills</h3><textarea name="skills" placeholder="Enter your skills (comma separated)" value={user.skills} onChange={handleInputChange} rows="3" /></div>
          <div className="form-section-card"><h3>Work Experience</h3><textarea name="experience" placeholder="Describe your work experience..." value={user.experience} onChange={handleInputChange} rows="5" /><h3>Projects</h3><textarea name="projects" placeholder="List your key projects..." value={user.projects} onChange={handleInputChange} rows="4" /><h3>Certifications</h3><textarea name="certificates" placeholder="List your certifications..." value={user.certificates} onChange={handleInputChange} rows="3" /><h3>Languages</h3><textarea name="languages" placeholder="List your languages..." value={user.languages} onChange={handleInputChange} rows="2" /></div>
          <div className="form-section-card"><h3>Education History</h3><div className="education-group"><div className="edu-level"><label>10th</label><input type="text" name="tenthSchool" placeholder="School" value={user.tenthSchool} onChange={handleInputChange} /><div className="edu-details"><div className="edu-field"><FiPercent /><input type="text" name="tenthPercentage" placeholder="%" value={user.tenthPercentage} onChange={handleInputChange} /></div><div className="edu-field"><FiCalendar /><input type="text" name="tenthYear" placeholder="Year" value={user.tenthYear} onChange={handleInputChange} /></div></div></div><div className="edu-level"><label>12th / Intermediate</label><input type="text" name="interCollege" placeholder="College" value={user.interCollege} onChange={handleInputChange} /><input type="text" name="interCourse" placeholder="Course" value={user.interCourse} onChange={handleInputChange} /><div className="edu-details"><div className="edu-field"><FiPercent /><input type="text" name="interPercentage" placeholder="%" value={user.interPercentage} onChange={handleInputChange} /></div><div className="edu-field"><FiCalendar /><input type="text" name="interYear" placeholder="Year" value={user.interYear} onChange={handleInputChange} /></div></div></div><div className="edu-level"><label>Graduation</label><input type="text" name="degreeCollege" placeholder="College" value={user.degreeCollege} onChange={handleInputChange} /><input type="text" name="degreeCourse" placeholder="Degree" value={user.degreeCourse} onChange={handleInputChange} /><div className="edu-details"><div className="edu-field"><FiPercent /><input type="text" name="degreePercentage" placeholder="CGPA/%" value={user.degreePercentage} onChange={handleInputChange} /></div><div className="edu-field"><FiCalendar /><input type="text" name="degreeYear" placeholder="Year" value={user.degreeYear} onChange={handleInputChange} /></div></div></div></div></div>
        </div>

        <div className="preview-side-panel"><div className="zoom-container-sheet" ref={resumeRef}>{renderPreview}</div></div>
      </div>
    </div>
  );
}

export default CreateResume;