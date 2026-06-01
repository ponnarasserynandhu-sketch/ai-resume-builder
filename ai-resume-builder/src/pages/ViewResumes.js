import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ViewResumes.css";
import {
  FiEye,
  FiTrash2,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiFileText,
  FiMail,
  FiTarget,
  FiBriefcase,
  FiCalendar,
  FiMapPin,
  FiStar,
  FiAward,
  FiCpu,
  FiTrendingUp,
  FiDownload
} from "react-icons/fi";

function ViewResumes() {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [filteredResumes, setFilteredResumes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedResume, setSelectedResume] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchResumes = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await axios.get("http://localhost:5000/api/resume/all", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        const formatted = res.data.resumes.map(r => ({
          _id: r._id,
          template: r.template,
          updatedAt: r.updatedAt,
          ...r.data
        }));
        setResumes(formatted);
        setFilteredResumes(formatted);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const filterResumes = useCallback(() => {
    let filtered = resumes.filter(r =>
      (r.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.role || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.skills || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredResumes(filtered);
    setCurrentPage(1);
  }, [resumes, searchTerm]);

  useEffect(() => { fetchResumes(); }, []);
  useEffect(() => { filterResumes(); }, [filterResumes]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this resume?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/resume/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchResumes();
      if(selectedResume?._id === id) setSelectedResume(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadPDF = async (resume) => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      tempDiv.style.width = '800px';
      tempDiv.style.backgroundColor = 'white';
      tempDiv.style.padding = '40px';
      tempDiv.style.fontFamily = 'Inter, sans-serif';
      tempDiv.innerHTML = `
        <div style="text-align: center; border-bottom: 3px solid #4f46e5; padding-bottom: 20px; margin-bottom: 30px;">
          <h1 style="color: #4f46e5; margin: 0 0 8px 0;">${resume.name || 'Your Name'}</h1>
          <h3 style="color: #818cf8; margin: 0 0 12px 0;">${resume.role || 'Professional Title'}</h3>
          <div style="display: flex; justify-content: center; gap: 20px; font-size: 12px; color: #64748b;">
            ${resume.email ? `<span>📧 ${resume.email}</span>` : ''}
            ${resume.phone ? `<span>📞 ${resume.phone}</span>` : ''}
            ${resume.address ? `<span>📍 ${resume.address}</span>` : ''}
          </div>
        </div>
        <div style="margin-bottom: 20px;">
          <h4 style="color: #4f46e5; border-left: 3px solid #4f46e5; padding-left: 12px;">Professional Summary</h4>
          <p style="font-size: 13px; line-height: 1.5;">${resume.about || 'No summary provided'}</p>
        </div>
        <div style="margin-bottom: 20px;">
          <h4 style="color: #4f46e5; border-left: 3px solid #4f46e5; padding-left: 12px;">Core Competencies</h4>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${resume.skills ? resume.skills.split(',').map(skill => `<span style="background: #f1f5f9; padding: 4px 12px; border-radius: 20px; font-size: 12px;">${skill.trim()}</span>`).join('') : 'No skills listed'}
          </div>
        </div>
        <div style="margin-bottom: 20px;">
          <h4 style="color: #4f46e5; border-left: 3px solid #4f46e5; padding-left: 12px;">Work Experience</h4>
          <div style="font-size: 13px; line-height: 1.5;">${resume.experience ? resume.experience.replace(/\n/g, '<br>') : 'No experience listed'}</div>
        </div>
        <div style="margin-bottom: 20px;">
          <h4 style="color: #4f46e5; border-left: 3px solid #4f46e5; padding-left: 12px;">Education</h4>
          ${resume.degreeCollege ? `<div><strong>${resume.degreeCourse || 'Degree'}</strong><br>${resume.degreeCollege}<br>${resume.degreeYear} | ${resume.degreePercentage} CGPA</div><br>` : ''}
          ${resume.interCollege ? `<div><strong>${resume.interCourse || 'Intermediate'}</strong><br>${resume.interCollege}<br>${resume.interYear} | ${resume.interPercentage}%</div><br>` : ''}
          ${resume.tenthSchool ? `<div><strong>Secondary Education</strong><br>${resume.tenthSchool}<br>${resume.tenthYear} | ${resume.tenthPercentage}%</div>` : ''}
        </div>
      `;
      
      document.body.appendChild(tempDiv);
      const canvas = await html2canvas(tempDiv, { scale: 2, backgroundColor: '#ffffff', logging: false });
      document.body.removeChild(tempDiv);
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${resume.name || 'Resume'}.pdf`);
      
    } catch (error) {
      console.error('PDF download error:', error);
      alert('Failed to download PDF. Please try again.');
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getLightColor = (name) => {
    const colors = ["#f0f0ff", "#e8f4f8", "#e6f7e6", "#fff0e6", "#ffe6f0", "#e6f3ff", "#f5e6ff", "#e6fff0", "#fff5e6", "#ffe6f5"];
    const index = name ? name.length % colors.length : 0;
    return colors[index];
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const indexLast = currentPage * itemsPerPage;
  const indexFirst = indexLast - itemsPerPage;
  const currentItems = filteredResumes.slice(indexFirst, indexLast);
  const totalPages = Math.ceil(filteredResumes.length / itemsPerPage);

  return (
    <div className="vr-container">
      <div className={`vr-main-content ${selectedResume ? "shrink" : ""}`}>
        <div className="vr-header">
          <div className="vr-header-left">
            <div className="vr-header-badge">
              <FiFileText size={16} />
              <span>Resume Library</span>
            </div>
            <h1>Your Professional Portfolio</h1>
            <p>Manage, preview and organize all your resumes in one place</p>
          </div>
          <div className="vr-header-right">
            <div className="vr-stats-card">
              <div className="stat-item">
                <span className="stat-value">{resumes.length}</span>
                <span className="stat-label">Total Resumes</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-value">{filteredResumes.length}</span>
                <span className="stat-label">Active</span>
              </div>
            </div>
          </div>
        </div>

        <div className="vr-search-section">
          <div className="vr-search-wrapper">
            <FiSearch className="vr-search-icon" />
            <input
              type="text"
              placeholder="Search by name, role, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="vr-loader-container">
            <div className="vr-spinner"></div>
            <p>Loading your resumes...</p>
          </div>
        ) : filteredResumes.length === 0 ? (
          <div className="vr-empty-state">
            <div className="empty-icon">📄</div>
            <h3>No resumes found</h3>
            <p>Try adjusting your search or create a new resume</p>
          </div>
        ) : (
          <>
            <div className="vr-grid">
              {currentItems.map((resume, index) => (
                <div 
                  className={`vr-card ${selectedResume?._id === resume._id ? "active" : ""}`} 
                  key={resume._id}
                  onClick={() => setSelectedResume(resume)}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="vr-card-header">
                    <div className="vr-card-avatar" style={{ backgroundColor: getLightColor(resume.name), color: "#4b5563" }}>
                      {getInitials(resume.name)}
                    </div>
                    <div className="vr-card-actions">
                      <button 
                        className="vr-card-action-btn delete"
                        onClick={(e) => { e.stopPropagation(); handleDelete(resume._id); }}
                        title="Delete"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="vr-card-body">
                    <h3>{resume.name || "Untitled Profile"}</h3>
                    <div className="vr-role-badge">
                      <FiBriefcase size={12} />
                      <span>{resume.role || "Professional"}</span>
                    </div>
                    <div className="vr-skills-preview">
                      {resume.skills ? resume.skills.split(',').slice(0, 3).map((skill, i) => (
                        <span key={i} className="skill-tag">{skill.trim()}</span>
                      )) : <span className="skill-tag">No skills listed</span>}
                    </div>
                    <div className="vr-card-footer">
                      <div className="vr-update-date">
                        <FiCalendar size={12} />
                        <span>{formatDate(resume.updatedAt)}</span>
                      </div>
                      <button className="vr-view-btn" onClick={(e) => { e.stopPropagation(); setSelectedResume(resume); }}>
                        <FiEye size={14} />
                        Preview
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredResumes.length > itemsPerPage && (
              <div className="vr-pagination">
                <button className="vr-page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                  <FiChevronLeft size={16} />
                  Previous
                </button>
                <div className="vr-pagination-info">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button key={pageNum} className={`vr-page-num ${currentPage === pageNum ? "active" : ""}`} onClick={() => setCurrentPage(pageNum)}>
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button className="vr-page-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                  Next
                  <FiChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <aside className={`vr-side-panel ${selectedResume ? "open" : ""}`}>
        {selectedResume && (
          <div className="vr-panel-inner">
            <div className="vr-panel-header-section">
              <button className="vr-close-panel" onClick={() => setSelectedResume(null)}>
                <FiX size={20} />
              </button>
            </div>

            <div className="vr-panel-profile">
              <div className="vr-panel-avatar" style={{ backgroundColor: getLightColor(selectedResume.name), color: "#4b5563" }}>
                {getInitials(selectedResume.name)}
              </div>
              <h2>{selectedResume.name || "Professional Profile"}</h2>
              <div className="vr-panel-role">{selectedResume.role || "Professional"}</div>
              <div className="vr-panel-location">
                <FiMapPin size={14} />
                <span>{selectedResume.address || "Location not specified"}</span>
              </div>
            </div>

            <div className="vr-panel-contact">
              <div className="contact-item">
                <FiMail size={14} />
                <span>{selectedResume.email || "Email not provided"}</span>
              </div>
              <div className="contact-item">
                <FiTrendingUp size={14} />
                <span>{selectedResume.linkedin || "LinkedIn not linked"}</span>
              </div>
            </div>

            <div className="vr-panel-section">
              <h4><FiTarget size={14} /> Professional Summary</h4>
              <p>{selectedResume.about || "No professional summary provided."}</p>
            </div>

            <div className="vr-panel-section">
              <h4><FiCpu size={14} /> Core Competencies</h4>
              <div className="vr-panel-skills">
                {selectedResume.skills ? selectedResume.skills.split(',').map((skill, i) => (
                  <span key={i} className="panel-skill-tag">{skill.trim()}</span>
                )) : <span>No skills listed</span>}
              </div>
            </div>

            <div className="vr-panel-section">
              <h4><FiAward size={14} /> Education</h4>
              <div className="vr-panel-education">
                {selectedResume.degreeCollege && (
                  <div className="edu-item">
                    <strong>🎓 {selectedResume.degreeCourse || "Degree"}</strong>
                    <div>{selectedResume.degreeCollege}</div>
                    <small>{selectedResume.degreeYear} | {selectedResume.degreePercentage} CGPA</small>
                  </div>
                )}
                {selectedResume.interCollege && (
                  <div className="edu-item">
                    <strong>📖 {selectedResume.interCourse || "Intermediate"}</strong>
                    <div>{selectedResume.interCollege}</div>
                    <small>{selectedResume.interYear} | {selectedResume.interPercentage}%</small>
                  </div>
                )}
                {selectedResume.tenthSchool && (
                  <div className="edu-item">
                    <strong>📚 Secondary Education</strong>
                    <div>{selectedResume.tenthSchool}</div>
                    <small>{selectedResume.tenthYear} | {selectedResume.tenthPercentage}%</small>
                  </div>
                )}
              </div>
            </div>

            <div className="vr-panel-section">
              <h4><FiBriefcase size={14} /> Work Experience</h4>
              <div className="vr-panel-experience">
                {selectedResume.experience ? selectedResume.experience.split('\n').slice(0, 3).map((exp, i) => (
                  <div key={i} className="exp-item">
                    <div className="exp-bullet"></div>
                    <p>{exp}</p>
                  </div>
                )) : <p>No work experience listed</p>}
              </div>
            </div>

            <div className="vr-panel-section">
              <h4><FiStar size={14} /> Projects</h4>
              <div className="vr-panel-projects">
                {selectedResume.projects ? selectedResume.projects.split('\n').slice(0, 2).map((project, i) => (
                  <div key={i} className="project-item">
                    <div className="project-bullet"></div>
                    <p>{project}</p>
                  </div>
                )) : <p>No projects listed</p>}
              </div>
            </div>

            <div className="vr-panel-actions-bottom">
              <button className="vr-download-btn" onClick={() => handleDownloadPDF(selectedResume)}>
                <FiDownload size={16} />
                Download PDF
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

export default ViewResumes;