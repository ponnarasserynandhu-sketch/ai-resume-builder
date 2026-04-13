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
  FiCheck,
  FiDroplet,
  FiAward,
  FiStar,
  FiGlobe,
  FiTrendingUp,
  FiCode
} from "react-icons/fi";

// Template components with full color support
const TemplateClassic = ({ user, primaryColor, accentColor }) => (
  <div className="resume-preview template-classic">
    <div className="resume-header" style={{ borderBottomColor: primaryColor }}>
      <h1 className="resume-name" style={{ color: primaryColor }}>{user.name || "Your Name"}</h1>
      <h3 className="resume-title" style={{ color: accentColor }}>{user.role || "Professional Title"}</h3>
      <div className="resume-contact">
        {user.email && <span><FiMail size={14} /> {user.email}</span>}
        {user.phone && <span><FiPhone size={14} /> {user.phone}</span>}
        {user.linkedin && <span><FiLinkedin size={14} /> {user.linkedin}</span>}
        {user.address && <span><FiMapPin size={14} /> {user.address}</span>}
      </div>
    </div>

    <div className="resume-section">
      <h4 className="section-title" style={{ borderLeftColor: primaryColor, color: primaryColor }}>Professional Summary</h4>
      <p className="section-content">{user.about || "Add your professional summary"}</p>
    </div>

    <div className="resume-section">
      <h4 className="section-title" style={{ borderLeftColor: primaryColor, color: primaryColor }}>Skills & Expertise</h4>
      <p className="section-content">{user.skills || "Add your skills"}</p>
    </div>

    <div className="resume-section">
      <h4 className="section-title" style={{ borderLeftColor: primaryColor, color: primaryColor }}>Education</h4>
      <div className="education-entry">
        {user.tenthSchool && <p><strong>10th:</strong> {user.tenthSchool}, {user.tenthPercentage}%, {user.tenthYear}</p>}
        {user.interCollege && <p><strong>Intermediate:</strong> {user.interCollege}, {user.interCourse}, {user.interPercentage}%, {user.interYear}</p>}
        {user.degreeCollege && <p><strong>Degree:</strong> {user.degreeCollege}, {user.degreeCourse}, {user.degreePercentage}%, {user.degreeYear}</p>}
      </div>
    </div>

    <div className="resume-section">
      <h4 className="section-title" style={{ borderLeftColor: primaryColor, color: primaryColor }}>Work Experience</h4>
      <p className="section-content">{user.experience || "Add your work experience"}</p>
    </div>

    <div className="resume-section">
      <h4 className="section-title" style={{ borderLeftColor: primaryColor, color: primaryColor }}>Projects</h4>
      <p className="section-content">{user.projects || "Add your projects"}</p>
    </div>

    <div className="resume-section">
      <h4 className="section-title" style={{ borderLeftColor: primaryColor, color: primaryColor }}>Certifications</h4>
      <p className="section-content">{user.certificates || "Add your certifications"}</p>
    </div>

    <div className="resume-section">
      <h4 className="section-title" style={{ borderLeftColor: primaryColor, color: primaryColor }}>Languages</h4>
      <p className="section-content">{user.languages || "Add languages"}</p>
    </div>
  </div>
);

const TemplateModern = ({ user, primaryColor, accentColor }) => (
  <div className="resume-preview template-modern">
    <div className="modern-two-column">
      <div className="modern-left" style={{ background: `${primaryColor}08` }}>
        <h1 className="modern-name" style={{ color: primaryColor }}>{user.name || "Your Name"}</h1>
        <h3 className="modern-title" style={{ color: accentColor }}>{user.role || "Professional Title"}</h3>
        <div className="modern-contact">
          {user.email && <p><FiMail size={14} /> {user.email}</p>}
          {user.phone && <p><FiPhone size={14} /> {user.phone}</p>}
          {user.linkedin && <p><FiLinkedin size={14} /> {user.linkedin}</p>}
          {user.address && <p><FiMapPin size={14} /> {user.address}</p>}
        </div>
        <div className="modern-skills">
          <h4 style={{ color: primaryColor }}>Skills</h4>
          <p>{user.skills || "Add your skills"}</p>
        </div>
        <div className="modern-languages">
          <h4 style={{ color: primaryColor }}>Languages</h4>
          <p>{user.languages || "Add languages"}</p>
        </div>
      </div>
      <div className="modern-right">
        <div className="modern-summary">
          <h4 style={{ borderBottomColor: accentColor, color: primaryColor }}>Professional Summary</h4>
          <p>{user.about || "Add your professional summary"}</p>
        </div>
        <div className="modern-education">
          <h4 style={{ borderBottomColor: accentColor, color: primaryColor }}>Education</h4>
          {user.tenthSchool && <p><strong>10th:</strong> {user.tenthSchool}, {user.tenthPercentage}%, {user.tenthYear}</p>}
          {user.interCollege && <p><strong>Intermediate:</strong> {user.interCollege}, {user.interCourse}, {user.interPercentage}%, {user.interYear}</p>}
          {user.degreeCollege && <p><strong>Degree:</strong> {user.degreeCollege}, {user.degreeCourse}, {user.degreePercentage}%, {user.degreeYear}</p>}
        </div>
        <div className="modern-experience">
          <h4 style={{ borderBottomColor: accentColor, color: primaryColor }}>Work Experience</h4>
          <p>{user.experience || "Add your work experience"}</p>
        </div>
        <div className="modern-projects">
          <h4 style={{ borderBottomColor: accentColor, color: primaryColor }}>Projects</h4>
          <p>{user.projects || "Add your projects"}</p>
        </div>
        <div className="modern-certificates">
          <h4 style={{ borderBottomColor: accentColor, color: primaryColor }}>Certifications</h4>
          <p>{user.certificates || "Add your certifications"}</p>
        </div>
      </div>
    </div>
  </div>
);

const TemplateElegant = ({ user, primaryColor, accentColor }) => (
  <div className="resume-preview template-elegant">
    <div className="elegant-header" style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)` }}>
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
        <h4 style={{ color: primaryColor }}>About Me</h4>
        <p>{user.about || "Add your professional summary"}</p>
      </div>
      <div className="elegant-skills">
        <h4 style={{ color: primaryColor }}>Core Skills</h4>
        <div className="skills-tags">
          {user.skills?.split(',').map((skill, i) => (
            <span key={i} className="skill-tag" style={{ background: `${primaryColor}15`, color: primaryColor }}>{skill.trim()}</span>
          ))}
        </div>
      </div>
      <div className="elegant-education">
        <h4 style={{ color: primaryColor }}>Education Background</h4>
        {user.tenthSchool && <p><strong>Secondary:</strong> {user.tenthSchool} ({user.tenthPercentage}%)</p>}
        {user.interCollege && <p><strong>Higher Secondary:</strong> {user.interCollege}, {user.interCourse}</p>}
        {user.degreeCollege && <p><strong>Graduation:</strong> {user.degreeCollege}, {user.degreeCourse}</p>}
      </div>
      <div className="elegant-experience">
        <h4 style={{ color: primaryColor }}>Professional Experience</h4>
        <p>{user.experience || "Add your work experience"}</p>
      </div>
      <div className="elegant-projects">
        <h4 style={{ color: primaryColor }}>Key Projects</h4>
        <p>{user.projects || "Add your projects"}</p>
      </div>
    </div>
  </div>
);

const TemplateCreative = ({ user, primaryColor, accentColor }) => (
  <div className="resume-preview template-creative">
    <div className="creative-sidebar" style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)` }}>
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
        <h4 style={{ color: accentColor }}>Skills</h4>
        <p>{user.skills || "Add your skills"}</p>
      </div>
      <div className="creative-languages">
        <h4 style={{ color: accentColor }}>Languages</h4>
        <p>{user.languages || "Add languages"}</p>
      </div>
    </div>
    <div className="creative-main">
      <div className="creative-summary">
        <h3 style={{ borderLeftColor: primaryColor, color: primaryColor }}>About Me</h3>
        <p>{user.about || "Add your professional summary"}</p>
      </div>
      <div className="creative-education">
        <h3 style={{ borderLeftColor: primaryColor, color: primaryColor }}>Education</h3>
        {user.tenthSchool && <p>✓ {user.tenthSchool} - {user.tenthPercentage}% ({user.tenthYear})</p>}
        {user.interCollege && <p>✓ {user.interCollege}, {user.interCourse} - {user.interPercentage}% ({user.interYear})</p>}
        {user.degreeCollege && <p>✓ {user.degreeCollege}, {user.degreeCourse} - {user.degreePercentage}% ({user.degreeYear})</p>}
      </div>
      <div className="creative-experience">
        <h3 style={{ borderLeftColor: primaryColor, color: primaryColor }}>Experience</h3>
        <p>{user.experience || "Add your work experience"}</p>
      </div>
      <div className="creative-projects">
        <h3 style={{ borderLeftColor: primaryColor, color: primaryColor }}>Projects</h3>
        <p>{user.projects || "Add your projects"}</p>
      </div>
    </div>
  </div>
);

// Template 5 - PRESTIGE (Modern Executive Layout with Timeline)
const TemplatePrestige = ({ user, primaryColor, accentColor }) => (
  <div className="resume-preview template-prestige">
    <div className="prestige-container">
      <div className="prestige-header">
        <div className="prestige-name-title">
          <h1 className="prestige-name" style={{ color: primaryColor }}>{user.name || "Your Name"}</h1>
          <div className="prestige-role" style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}>
            {user.role || "Professional Title"}
          </div>
        </div>
        <div className="prestige-quick-info">
          {user.email && <div><FiMail size={13} /> {user.email}</div>}
          {user.phone && <div><FiPhone size={13} /> {user.phone}</div>}
          {user.linkedin && <div><FiLinkedin size={13} /> {user.linkedin}</div>}
          {user.address && <div><FiMapPin size={13} /> {user.address}</div>}
        </div>
      </div>

      <div className="prestige-summary">
        <p>{user.about || "Add your professional summary"}</p>
      </div>

      <div className="prestige-main">
        <div className="prestige-left">
          <div className="prestige-section">
            <h3 style={{ color: primaryColor }}>
              <FiCpu size={16} /> Core Competencies
            </h3>
            <div className="prestige-skills">
              {user.skills ? user.skills.split(',').map((skill, idx) => (
                <div key={idx} className="prestige-skill">{skill.trim()}</div>
              )) : <div>Add your skills</div>}
            </div>
          </div>

          <div className="prestige-section">
            <h3 style={{ color: primaryColor }}>
              <FiGlobe size={16} /> Languages
            </h3>
            <p>{user.languages || "Add languages"}</p>
          </div>

          <div className="prestige-section">
            <h3 style={{ color: primaryColor }}>
              <FiAward size={16} /> Certifications
            </h3>
            <p>{user.certificates || "Add certifications"}</p>
          </div>
        </div>

        <div className="prestige-right">
          <div className="prestige-section">
            <h3 style={{ color: primaryColor }}>
              <FiBriefcase size={16} /> Professional Experience
            </h3>
            <div className="prestige-experience">
              {user.experience ? user.experience.split('\n').map((exp, idx) => (
                <div key={idx} className="prestige-exp-item">
                  <div className="prestige-exp-dot" style={{ backgroundColor: primaryColor }}></div>
                  <p>{exp}</p>
                </div>
              )) : <p>Add your work experience</p>}
            </div>
          </div>

          <div className="prestige-section">
            <h3 style={{ color: primaryColor }}>
              <FiStar size={16} /> Featured Projects
            </h3>
            <div className="prestige-projects">
              {user.projects ? user.projects.split('\n').map((project, idx) => (
                <div key={idx} className="prestige-project-item">
                  <div className="prestige-project-bullet" style={{ backgroundColor: accentColor }}></div>
                  <p>{project}</p>
                </div>
              )) : <p>Add your projects</p>}
            </div>
          </div>

          <div className="prestige-section">
            <h3 style={{ color: primaryColor }}>
              <FiBookOpen size={16} /> Education
            </h3>
            {user.degreeCollege && (
              <div className="prestige-edu">
                <div className="prestige-edu-degree">{user.degreeCourse}</div>
                <div className="prestige-edu-school">{user.degreeCollege}</div>
                <div className="prestige-edu-year">{user.degreeYear} | {user.degreePercentage}%</div>
              </div>
            )}
            {user.interCollege && (
              <div className="prestige-edu">
                <div className="prestige-edu-degree">{user.interCourse}</div>
                <div className="prestige-edu-school">{user.interCollege}</div>
                <div className="prestige-edu-year">{user.interYear} | {user.interPercentage}%</div>
              </div>
            )}
            {user.tenthSchool && (
              <div className="prestige-edu">
                <div className="prestige-edu-degree">Secondary Education</div>
                <div className="prestige-edu-school">{user.tenthSchool}</div>
                <div className="prestige-edu-year">{user.tenthYear} | {user.tenthPercentage}%</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Template 6 - FINANCIAL ANALYST STYLE (Clean Professional with Education First)
const TemplateFinancial = ({ user, primaryColor, accentColor }) => (
  <div className="resume-preview template-financial">
    <div className="financial-container">
      <div className="financial-header">
        <h1 className="financial-name" style={{ color: primaryColor }}>{user.name?.toUpperCase() || "YOUR NAME"}</h1>
        <h3 className="financial-title" style={{ color: accentColor }}>{user.role?.toUpperCase() || "PROFESSIONAL TITLE"}</h3>
      </div>

      <div className="financial-content">
        <div className="financial-section">
          <h3 style={{ color: primaryColor, borderBottomColor: primaryColor }}>Education:</h3>
          <div className="financial-education">
            {user.degreeCollege && (
              <p><strong>• {user.degreeCourse}</strong>, {user.degreeCollege} ({user.degreeYear})</p>
            )}
            {user.interCollege && (
              <p><strong>• {user.interCourse}</strong>, {user.interCollege} ({user.interYear})</p>
            )}
            {user.tenthSchool && (
              <p><strong>• Secondary Education</strong>, {user.tenthSchool} ({user.tenthYear})</p>
            )}
            {user.certificates && (
              <p><strong>• {user.certificates}</strong></p>
            )}
          </div>
        </div>

        <div className="financial-section">
          <h3 style={{ color: primaryColor, borderBottomColor: primaryColor }}>Professional Experience:</h3>
          <div className="financial-experience">
            {user.experience ? user.experience.split('\n').map((exp, idx) => (
              <p key={idx}>{exp}</p>
            )) : <p>Add your work experience</p>}
          </div>
        </div>

        <div className="financial-section">
          <h3 style={{ color: primaryColor, borderBottomColor: primaryColor }}>Skills:</h3>
          <div className="financial-skills">
            <p>{user.skills || "Add your skills"}</p>
          </div>
        </div>

        <div className="financial-section">
          <h3 style={{ color: primaryColor, borderBottomColor: primaryColor }}>Certifications:</h3>
          <p>{user.certificates || "Add your certifications"}</p>
        </div>

        <div className="financial-section">
          <h3 style={{ color: primaryColor, borderBottomColor: primaryColor }}>Publications:</h3>
          <p>{user.projects || "Add your publications or projects"}</p>
        </div>

        <div className="financial-section">
          <h3 style={{ color: primaryColor, borderBottomColor: primaryColor }}>Languages:</h3>
          <p>{user.languages || "Add languages"}</p>
        </div>
      </div>
    </div>
  </div>
);

// Template 7 - FULL STACK DEVELOPER STYLE (Tech-focused with Contact Bar)
const TemplateTechStack = ({ user, primaryColor, accentColor }) => (
  <div className="resume-preview template-techstack">
    <div className="techstack-container">
      <div className="techstack-header">
        <h1 className="techstack-name" style={{ color: primaryColor }}>{user.name?.toUpperCase() || "YOUR NAME"}</h1>
        <h3 className="techstack-title" style={{ color: accentColor }}>{user.role || "Professional Title"}</h3>
        <div className="techstack-contact">
          {user.phone && <span>{user.phone}</span>}
          {user.email && <span>• {user.email}</span>}
          {user.linkedin && <span>• {user.linkedin}</span>}
          {user.address && <span>• {user.address}</span>}
        </div>
      </div>

      <div className="techstack-summary">
        <p>{user.about || "Add your professional summary"}</p>
      </div>

      <div className="techstack-experience">
        <h3 style={{ color: primaryColor, borderBottomColor: primaryColor }}>Experience</h3>
        {user.experience ? user.experience.split('\n').map((exp, idx) => {
          if (exp.includes(' - ')) {
            const parts = exp.split(' - ');
            return (
              <div key={idx} className="techstack-exp-item">
                <div className="techstack-exp-header">
                  <strong>{parts[0]}</strong>
                  <span className="techstack-exp-date">{parts[1]}</span>
                </div>
                <p>{exp.replace(parts[0] + ' - ', '').replace(parts[1], '')}</p>
              </div>
            );
          }
          return <p key={idx}>{exp}</p>;
        }) : <p>Add your work experience</p>}
      </div>

      <div className="techstack-education">
        <h3 style={{ color: primaryColor, borderBottomColor: primaryColor }}>Education</h3>
        {user.degreeCollege && (
          <div className="techstack-edu-item">
            <strong>{user.degreeCollege}</strong>
            <div>{user.degreeCourse}</div>
            <div className="techstack-edu-date">{user.degreeYear}</div>
          </div>
        )}
        {user.interCollege && (
          <div className="techstack-edu-item">
            <strong>{user.interCollege}</strong>
            <div>{user.interCourse}</div>
            <div className="techstack-edu-date">{user.interYear}</div>
          </div>
        )}
      </div>

      <div className="techstack-skills">
        <h3 style={{ color: primaryColor, borderBottomColor: primaryColor }}>Skills</h3>
        <div className="techstack-skills-grid">
          {user.skills ? user.skills.split(',').map((skill, idx) => (
            <span key={idx} className="techstack-skill">{skill.trim()}</span>
          )) : <span>Add your skills</span>}
        </div>
      </div>
    </div>
  </div>
);

// Template 8 - EDUCATOR STYLE (Curriculum/Teaching Focused with Achievements)
const TemplateEducator = ({ user, primaryColor, accentColor }) => (
  <div className="resume-preview template-educator">
    <div className="educator-container">
      <div className="educator-sidebar" style={{ backgroundColor: `${primaryColor}05` }}>
        <div className="educator-summary">
          <h3 style={{ color: primaryColor }}>SUMMARY</h3>
          <p>{user.about || "Add your professional summary"}</p>
        </div>

        <div className="educator-education">
          <h3 style={{ color: primaryColor }}>EDUCATION</h3>
          {user.degreeCollege && (
            <div className="educator-edu-item">
              <strong>{user.degreeCourse}</strong>
              <div>{user.degreeCollege}</div>
              <div className="educator-edu-date">{user.degreeYear}</div>
            </div>
          )}
          {user.interCollege && (
            <div className="educator-edu-item">
              <strong>{user.interCourse}</strong>
              <div>{user.interCollege}</div>
              <div className="educator-edu-date">{user.interYear}</div>
            </div>
          )}
        </div>

        <div className="educator-skills">
          <h3 style={{ color: primaryColor }}>SKILLS</h3>
          <div className="educator-skills-list">
            {user.skills ? user.skills.split(',').map((skill, idx) => (
              <span key={idx} className="educator-skill">{skill.trim()}</span>
            )) : <span>Add your skills</span>}
          </div>
        </div>

        <div className="educator-languages">
          <h3 style={{ color: primaryColor }}>LANGUAGES</h3>
          <p>{user.languages || "Add languages"}</p>
        </div>

        <div className="educator-courses">
          <h3 style={{ color: primaryColor }}>COURSES</h3>
          <p>{user.certificates || "Add certifications and courses"}</p>
        </div>

        <div className="educator-passions">
          <h3 style={{ color: primaryColor }}>PASSIONS</h3>
          <p>• Continuous Professional Development</p>
          <p>• Educational Technology</p>
          <p>• Student Mentorship</p>
        </div>
      </div>

      <div className="educator-main">
        <div className="educator-header">
          <h1 className="educator-name" style={{ color: primaryColor }}>{user.name?.toUpperCase() || "YOUR NAME"}</h1>
          <h3 className="educator-title">{user.role || "Professional Title"}</h3>
        </div>

        <div className="educator-experience">
          <h3 style={{ color: primaryColor, borderBottomColor: primaryColor }}>EXPERIENCE</h3>
          {user.experience ? user.experience.split('\n').map((exp, idx) => {
            if (exp.includes(' - ')) {
              const parts = exp.split(' - ');
              return (
                <div key={idx} className="educator-exp-item">
                  <div className="educator-exp-header">
                    <strong>{parts[0]}</strong>
                    <span className="educator-exp-date">{parts[1]}</span>
                  </div>
                  <p>{exp.replace(parts[0] + ' - ', '').replace(parts[1], '')}</p>
                </div>
              );
            }
            return <p key={idx}>{exp}</p>;
          }) : <p>Add your work experience</p>}
        </div>

        <div className="educator-achievements">
          <h3 style={{ color: primaryColor, borderBottomColor: primaryColor }}>KEY ACHIEVEMENTS</h3>
          <div className="educator-achievements-list">
            {user.projects ? user.projects.split('\n').map((achievement, idx) => (
              <div key={idx} className="educator-achievement-item">
                <div className="educator-achievement-title">{achievement.split(':')[0]}</div>
                <p>{achievement}</p>
              </div>
            )) : <p>Add your key achievements</p>}
          </div>
        </div>
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
  const [primaryColor, setPrimaryColor] = useState("#2563eb");
  const [accentColor, setAccentColor] = useState("#7c3aed");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const resumeRef = useRef();

  // Color presets
  const colorPresets = [
    { name: "Blue", primary: "#2563eb", accent: "#3b82f6" },
    { name: "Green", primary: "#059669", accent: "#10b981" },
    { name: "Purple", primary: "#7c3aed", accent: "#a855f7" },
    { name: "Red", primary: "#dc2626", accent: "#ef4444" },
    { name: "Orange", primary: "#ea580c", accent: "#f97316" },
    { name: "Teal", primary: "#0d9488", accent: "#14b8a6" },
    { name: "Indigo", primary: "#4f46e5", accent: "#6366f1" },
    { name: "Rose", primary: "#e11d48", accent: "#f43f5e" },
    { name: "Cyan", primary: "#0891b2", accent: "#06b6d4" },
    { name: "Emerald", primary: "#047857", accent: "#10b981" }
  ];

  // Template mapping
  const templateComponents = {
    t1: TemplateClassic,
    t2: TemplateModern,
    t3: TemplateElegant,
    t4: TemplateCreative,
    t5: TemplatePrestige,
    t6: TemplateFinancial,
    t7: TemplateTechStack,
    t8: TemplateEducator
  };

  const templates = [
    { id: "t1", name: "Classic", icon: FiFileText, color: "#4361ee", description: "Traditional professional layout" },
    { id: "t2", name: "Modern", icon: FiGrid, color: "#06d6a0", description: "Two-column modern design" },
    { id: "t3", name: "Elegant", icon: FiEye, color: "#f9c74f", description: "Clean and minimalistic" },
    { id: "t4", name: "Creative", icon: FiUser, color: "#f9844a", description: "Sidebar with profile photo" },
    { id: "t5", name: "Prestige", icon: FiTrendingUp, color: "#9c89b8", description: "Modern executive with timeline" },
    { id: "t6", name: "Financial Pro", icon: FiBriefcase, color: "#48bb78", description: "Clean financial/accounting style" },
    { id: "t7", name: "TechStack", icon: FiCode, color: "#e53e3e", description: "Developer-focused layout" },
    { id: "t8", name: "Educator", icon: FiBookOpen, color: "#ed64a6", description: "Teaching & education style" }
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

  const applyColorPreset = (primary, accent) => {
    setPrimaryColor(primary);
    setAccentColor(accent);
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
        colorSettings: { primaryColor, accentColor },
        lastModified: new Date().toISOString()
      };

      const response = await axios.post(
        "http://localhost:5000/api/resume/save",
        { resumeData, template: selectedTemplate, colorSettings: { primaryColor, accentColor } },
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
              <p>Choose a template and customize colors to match your style</p>
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

        {/* Color Customization */}
        <div className="color-customizer">
          <button 
            className="color-toggle-btn"
            onClick={() => setShowColorPicker(!showColorPicker)}
            style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}
          >
            <FiDroplet size={20} />
            Customize Colors
          </button>
          
          {showColorPicker && (
            <div className="color-picker-panel">
              <div className="color-presets">
                <h4>Color Presets</h4>
                <div className="preset-grid">
                  {colorPresets.map((preset, index) => (
                    <button
                      key={index}
                      className="preset-btn"
                      onClick={() => applyColorPreset(preset.primary, preset.accent)}
                      style={{ background: `linear-gradient(135deg, ${preset.primary}, ${preset.accent})` }}
                      title={preset.name}
                    />
                  ))}
                </div>
              </div>
              
              <div className="custom-colors">
                <div className="color-input-group">
                  <label>Primary Color</label>
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="color-input"
                  />
                  <span className="color-value">{primaryColor}</span>
                </div>
                <div className="color-input-group">
                  <label>Accent Color</label>
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="color-input"
                  />
                  <span className="color-value">{accentColor}</span>
                </div>
              </div>
            </div>
          )}
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
              <CurrentTemplate user={user} primaryColor={primaryColor} accentColor={accentColor} />
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