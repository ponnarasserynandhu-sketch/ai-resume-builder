// src/components/ResumeTemplates.js
import React from "react";
import { FiMail, FiPhone, FiMapPin, FiLinkedin } from "react-icons/fi";

export const hexToRgba = (hex, opacity) => {
  if (!hex) return "rgba(0,0,0,0.05)";
  let c = hex.substring(1);
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Template: Simple
export const TemplateSimple = ({ user, primaryColor, accentColor }) => (
  <div className="resume-preview template-simple" style={{ padding: "30px" }}>
    <div style={{ borderBottom: `3px solid ${primaryColor}`, paddingBottom: "15px", marginBottom: "20px" }}>
      <h1 style={{ color: primaryColor, fontSize: "28px", margin: "0 0 5px 0" }}>{user.name || "Your Name"}</h1>
      <h3 style={{ color: accentColor, fontSize: "16px", margin: "0 0 10px 0" }}>{user.role || "Professional Title"}</h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "15px", fontSize: "12px", color: "#64748b" }}>
        {user.email && <span>📧 {user.email}</span>}
        {user.phone && <span>📞 {user.phone}</span>}
        {user.address && <span>📍 {user.address}</span>}
      </div>
    </div>
    <div style={{ marginBottom: "20px" }}>
      <h4 style={{ color: primaryColor, borderLeft: `3px solid ${primaryColor}`, paddingLeft: "10px" }}>Professional Summary</h4>
      <p style={{ fontSize: "13px" }}>{user.about || "Add your summary"}</p>
    </div>
    <div style={{ marginBottom: "20px" }}>
      <h4 style={{ color: primaryColor, borderLeft: `3px solid ${primaryColor}`, paddingLeft: "10px" }}>Core Competencies</h4>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {user.skills ? user.skills.split(',').map((s,i) => s.trim() && <span key={i} style={{ background: hexToRgba(primaryColor,0.1), padding: "4px 12px", borderRadius: "20px", fontSize:"12px" }}>{s.trim()}</span>) : "No skills"}
      </div>
    </div>
    <div style={{ marginBottom: "20px" }}>
      <h4 style={{ color: primaryColor, borderLeft: `3px solid ${primaryColor}`, paddingLeft: "10px" }}>Work Experience</h4>
      {user.experience ? user.experience.split('\n').map((e,i) => e.trim() && <p key={i} style={{ fontSize: "13px", margin: "5px 0" }}>• {e}</p>) : <p>No experience listed</p>}
    </div>
    <div style={{ marginBottom: "20px" }}>
      <h4 style={{ color: primaryColor, borderLeft: `3px solid ${primaryColor}`, paddingLeft: "10px" }}>Projects</h4>
      {user.projects ? user.projects.split('\n').map((p,i) => p.trim() && <p key={i} style={{ fontSize: "13px", margin: "5px 0" }}>• {p}</p>) : <p>No projects listed</p>}
    </div>
    <div style={{ marginBottom: "20px" }}>
      <h4 style={{ color: primaryColor, borderLeft: `3px solid ${primaryColor}`, paddingLeft: "10px" }}>Education</h4>
      {user.degreeCollege && <p><strong>Degree:</strong> {user.degreeCollege} ({user.degreeCourse}) | {user.degreePercentage} CGPA | {user.degreeYear}</p>}
      {user.interCollege && <p><strong>12th:</strong> {user.interCollege} ({user.interCourse}) | {user.interPercentage}% | {user.interYear}</p>}
      {user.tenthSchool && <p><strong>10th:</strong> {user.tenthSchool} | {user.tenthPercentage}% | {user.tenthYear}</p>}
    </div>
    <div>
      <h4 style={{ color: primaryColor, borderLeft: `3px solid ${primaryColor}`, paddingLeft: "10px" }}>Certifications & Languages</h4>
      {user.certificates && <p>🏅 {user.certificates}</p>}
      {user.languages && <p>🗣️ {user.languages}</p>}
    </div>
  </div>
);

// Template: Sidebar
export const TemplateSidebar = ({ user, primaryColor, accentColor }) => (
  <div className="resume-preview template-sidebar" style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "20px", padding: "30px" }}>
    <div style={{ backgroundColor: hexToRgba(primaryColor, 0.08), padding: "20px", borderRadius: "12px" }}>
      {user.profilePhoto && <img src={user.profilePhoto} alt="profile" style={{ width: "100px", height: "100px", borderRadius: "50%", margin: "0 auto 15px", display: "block", border: `3px solid ${primaryColor}` }} />}
      <h2 style={{ color: primaryColor, fontSize: "20px", textAlign: "center" }}>{user.name || "Your Name"}</h2>
      <p style={{ color: accentColor, textAlign: "center", fontSize: "12px" }}>{user.role || "Professional"}</p>
      <div style={{ margin: "20px 0" }}>
        {user.email && <p><FiMail size={14} /> {user.email}</p>}
        {user.phone && <p><FiPhone size={14} /> {user.phone}</p>}
        {user.address && <p><FiMapPin size={14} /> {user.address}</p>}
      </div>
      <h4 style={{ color: primaryColor }}>Skills</h4>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {user.skills ? user.skills.split(',').map((s,i) => s.trim() && <span key={i} style={{ background: hexToRgba(primaryColor,0.15), padding: "3px 10px", borderRadius: "15px", fontSize: "11px" }}>{s.trim()}</span>) : "Add skills"}
      </div>
    </div>
    <div>
      <div><h4 style={{ borderBottom: `2px solid ${accentColor}`, color: primaryColor }}>Summary</h4><p>{user.about || "Add summary"}</p></div>
      <div><h4 style={{ borderBottom: `2px solid ${accentColor}`, color: primaryColor }}>Experience</h4>{user.experience ? user.experience.split('\n').map((e,i) => <p key={i}>• {e}</p>) : "None"}</div>
      <div><h4 style={{ borderBottom: `2px solid ${accentColor}`, color: primaryColor }}>Projects</h4>{user.projects ? user.projects.split('\n').map((p,i) => <p key={i}>• {p}</p>) : "None"}</div>
      <div><h4 style={{ borderBottom: `2px solid ${accentColor}`, color: primaryColor }}>Education</h4>{user.degreeCollege && <p>{user.degreeCourse} - {user.degreeCollege}</p>}</div>
    </div>
  </div>
);

// Template: TwoColumn
export const TemplateTwoColumn = ({ user, primaryColor, accentColor }) => (
  <div className="resume-preview template-two-column" style={{ padding: "30px" }}>
    <div style={{ textAlign: "center", borderBottom: `2px solid ${primaryColor}`, marginBottom: "20px", paddingBottom: "15px" }}>
      <h1 style={{ color: primaryColor }}>{user.name || "Your Name"}</h1>
      <h3 style={{ color: accentColor }}>{user.role || "Professional"}</h3>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "30px" }}>
      <div>
        <h4 style={{ color: primaryColor, borderLeft: `3px solid ${primaryColor}`, paddingLeft: "8px" }}>Skills</h4>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {user.skills ? user.skills.split(',').map((s,i) => <span key={i} style={{ background: hexToRgba(primaryColor,0.1), padding: "3px 10px", borderRadius: "15px" }}>{s.trim()}</span>) : "None"}
        </div>
        <h4 style={{ marginTop: "20px", color: primaryColor, borderLeft: `3px solid ${primaryColor}`, paddingLeft: "8px" }}>Languages</h4>
        <p>{user.languages || "None"}</p>
      </div>
      <div>
        <h4 style={{ color: primaryColor, borderLeft: `3px solid ${primaryColor}`, paddingLeft: "8px" }}>Summary</h4>
        <p>{user.about || "Add summary"}</p>
        <h4 style={{ color: primaryColor, borderLeft: `3px solid ${primaryColor}`, paddingLeft: "8px" }}>Experience</h4>
        {user.experience ? user.experience.split('\n').map((e,i) => <p key={i}>• {e}</p>) : "None"}
        <h4 style={{ color: primaryColor, borderLeft: `3px solid ${primaryColor}`, paddingLeft: "8px" }}>Projects</h4>
        {user.projects ? user.projects.split('\n').map((p,i) => <p key={i}>• {p}</p>) : "None"}
      </div>
    </div>
  </div>
);

// Template: Minimalist
export const TemplateMinimalist = ({ user, primaryColor, accentColor }) => (
  <div className="resume-preview template-minimalist" style={{ maxWidth: "700px", margin: "0 auto", padding: "30px", textAlign: "center" }}>
    <h1 style={{ fontSize: "32px", marginBottom: "8px" }}>{user.name || "Your Name"}</h1>
    <p style={{ color: primaryColor, fontWeight: "500" }}>{user.role || "Professional"}</p>
    <hr style={{ margin: "20px 0" }} />
    <div style={{ textAlign: "left" }}>
      <div><h4 style={{ color: primaryColor }}>Summary</h4><p>{user.about || "Add summary"}</p></div>
      <div><h4 style={{ color: primaryColor }}>Skills</h4><div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>{user.skills ? user.skills.split(',').map((s,i) => <span key={i} style={{ background: "#f1f5f9", padding: "4px 12px", borderRadius: "20px" }}>{s.trim()}</span>) : "None"}</div></div>
      <div><h4 style={{ color: primaryColor }}>Experience</h4>{user.experience ? user.experience.split('\n').map((e,i) => <p key={i}>• {e}</p>) : "None"}</div>
    </div>
  </div>
);

// Template: Creative
export const TemplateCreative = ({ user, primaryColor, accentColor }) => (
  <div className="resume-preview template-creative" style={{ background: "white", borderRadius: "24px", padding: "30px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
    <div style={{ textAlign: "center", marginBottom: "30px", background: `linear-gradient(135deg, ${hexToRgba(primaryColor,0.1)}, ${hexToRgba(accentColor,0.05)})`, padding: "20px", borderRadius: "20px" }}>
      <h1>{user.name || "Your Name"}</h1>
      <p style={{ color: primaryColor }}>{user.role || "Professional"}</p>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "20px" }}>
      <div><h3 style={{ color: primaryColor }}>Skills</h3><div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>{user.skills ? user.skills.split(',').map((s,i) => <span key={i} style={{ background: hexToRgba(primaryColor,0.1), padding: "4px 10px", borderRadius: "20px" }}>{s.trim()}</span>) : "None"}</div></div>
      <div><h3 style={{ color: primaryColor }}>Summary</h3><p>{user.about || "Add summary"}</p></div>
    </div>
  </div>
);

// Template: Executive
export const TemplateExecutive = ({ user, primaryColor, accentColor }) => (
  <div className="resume-preview template-executive" style={{ borderTop: `5px solid ${primaryColor}`, padding: "30px" }}>
    <h1 style={{ fontSize: "34px", margin: "0 0 5px 0" }}>{user.name || "Your Name"}</h1>
    <p style={{ fontSize: "18px", color: primaryColor, fontWeight: "600" }}>{user.role || "Professional"}</p>
    <hr style={{ margin: "12px 0" }} />
    <div><h4 style={{ color: primaryColor }}>Summary</h4><p>{user.about || "Add summary"}</p></div>
    <div><h4 style={{ color: primaryColor }}>Core Competencies</h4><div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>{user.skills ? user.skills.split(',').map((s,i) => <span key={i} style={{ background: "#f1f5f9", padding: "4px 12px", borderRadius: "4px" }}>{s.trim()}</span>) : "None"}</div></div>
    <div><h4 style={{ color: primaryColor }}>Experience</h4>{user.experience ? user.experience.split('\n').map((e,i) => <p key={i}>• {e}</p>) : "None"}</div>
  </div>
);

// Template: AI Generated
export const TemplateAIGenerated = ({ user, styleManifest, primaryColor, accentColor }) => {
  if (!styleManifest) return <TemplateSimple user={user} primaryColor={primaryColor} accentColor={accentColor} />;
  const merged = { ...styleManifest.globalStyles, primaryColor, accentColor };
  const { layoutType, structuralSections = {}, columnWidths = "1fr 2fr" } = styleManifest;
  const sectionsArray = Object.entries(structuralSections).filter(([_, data]) => data.visible);
  const left = sectionsArray.filter(([_, data]) => data.column === "left");
  const right = sectionsArray.filter(([_, data]) => data.column === "right");
  return (
    <div style={{ fontFamily: merged.fontFamily, padding: "30px" }}>
      <div style={{ textAlign: "center", borderBottom: `2px solid ${merged.primaryColor}`, marginBottom: "20px" }}>
        <h1 style={{ color: merged.primaryColor }}>{user.name || "Your Name"}</h1>
        <h3 style={{ color: merged.accentColor }}>{user.role || "Professional"}</h3>
      </div>
      {layoutType === "two-column" ? (
        <div style={{ display: "grid", gridTemplateColumns: columnWidths, gap: "30px" }}>
          <div>{left.map(([key, data]) => <div key={key}><h4 style={{ color: merged.primaryColor }}>{data.customTitle}</h4><p>{user[key] || `Add ${key}`}</p></div>)}</div>
          <div>{right.map(([key, data]) => <div key={key}><h4 style={{ color: merged.primaryColor }}>{data.customTitle}</h4><p>{user[key] || `Add ${key}`}</p></div>)}</div>
        </div>
      ) : (
        sectionsArray.map(([key, data]) => <div key={key}><h4 style={{ color: merged.primaryColor }}>{data.customTitle}</h4><p>{user[key] || `Add ${key}`}</p></div>)
      )}
    </div>
  );
};