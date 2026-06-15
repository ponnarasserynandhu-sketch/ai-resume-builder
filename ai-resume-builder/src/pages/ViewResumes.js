// ViewResumes.js (final version with deduplication and unique keys)
import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import API_URL from '../config';
import { useNavigate } from "react-router-dom";
import "./ViewResumes.css";
import {
  FiEye, FiTrash2, FiSearch, FiChevronLeft, FiChevronRight, FiX,
  FiFileText, FiMail, FiTarget, FiBriefcase, FiCalendar, FiMapPin,
  FiStar, FiAward, FiCpu, FiTrendingUp, FiDownload, FiPlus, FiAlertCircle,
  FiEdit2, FiLinkedin, FiGlobe, FiBookOpen, FiClock
} from "react-icons/fi";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { createRoot } from "react-dom/client";
import {
  TemplateSimple,
  TemplateSidebar,
  TemplateTwoColumn,
  TemplateMinimalist,
  TemplateCreative,
  TemplateExecutive,
  TemplateAIGenerated
} from "../components/ResumeTemplates";

const showNotification = (message, type = 'info') => {
  const notification = document.createElement('div');
  notification.className = `vr-notification ${type}`;
  notification.innerHTML = `<div class="notification-content"><span class="notification-icon">${type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ'}</span><span class="notification-message">${message}</span></div>`;
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
};

function ViewResumes() {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [filteredResumes, setFilteredResumes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedResume, setSelectedResume] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pdfLoadingMap, setPdfLoadingMap] = useState({});
  const [deleteModal, setDeleteModal] = useState({ show: false, resumeId: null, resumeName: "" });
  const [mobileOverlay, setMobileOverlay] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [deletingId, setDeletingId] = useState(null);
  const itemsPerPage = 8;
  const searchTimeoutRef = useRef(null);
  const sidePanelRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    if (mobileOverlay) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOverlay]);

  const fetchResumes = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await axios.get(`${API_URL}/api/resume/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success && isMountedRef.current) {
        const formatted = res.data.resumes.map(r => ({
          _id: r._id,
          template: r.template,
          updatedAt: r.updatedAt,
          colorSettings: r.colorSettings || { primaryColor: "#4f46e5", accentColor: "#818cf8" },
          aiManifest: r.aiManifest || null,
          ...r.data
        }));
        // Deduplicate by _id (keep first occurrence)
        const uniqueResumes = formatted.filter((resume, index, self) =>
          index === self.findIndex(r => r._id === resume._id)
        );
        setResumes(uniqueResumes);
        if (selectedResume && !uniqueResumes.find(r => r._id === selectedResume._id)) {
          setSelectedResume(null);
          setMobileOverlay(false);
        }
      }
    } catch (err) {
      console.error(err);
      showNotification("Failed to load resumes", "error");
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  };

  const applySortAndFilter = useCallback(() => {
    let filtered = [...resumes];
    if (searchTerm.trim()) {
      filtered = filtered.filter(r =>
        (r.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.role || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.skills || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    switch (sortBy) {
      case "newest": filtered.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)); break;
      case "oldest": filtered.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt)); break;
      case "nameAsc": filtered.sort((a, b) => (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: 'base' })); break;
      case "nameDesc": filtered.sort((a, b) => (b.name || "").localeCompare(a.name || "", undefined, { sensitivity: 'base' })); break;
      default: break;
    }
    if (isMountedRef.current) {
      setFilteredResumes(filtered);
      const newTotalPages = Math.ceil(filtered.length / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) setCurrentPage(newTotalPages);
      else if (newTotalPages === 0) setCurrentPage(1);
      if (selectedResume && !filtered.find(r => r._id === selectedResume._id)) {
        setSelectedResume(null);
        setMobileOverlay(false);
      }
    }
  }, [resumes, searchTerm, sortBy, currentPage, selectedResume]);

  useEffect(() => {
    applySortAndFilter();
  }, [applySortAndFilter]);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setCurrentPage(1);
      applySortAndFilter();
    }, 300);
    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
  }, [searchTerm, applySortAndFilter]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchResumes();
    return () => { isMountedRef.current = false; };
  }, []);

  const confirmDelete = (id, name, role) => {
    const displayName = name || role || "Untitled Resume";
    setDeleteModal({ show: true, resumeId: id, resumeName: displayName });
  };

  const handleDelete = async () => {
    const { resumeId } = deleteModal;
    if (!resumeId) return;
    setDeletingId(resumeId);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showNotification("You are not logged in", "error");
        return;
      }
      await axios.delete(`${API_URL}/api/resume/${resumeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeleteModal({ show: false, resumeId: null, resumeName: "" });
      if (selectedResume?._id === resumeId) {
        setSelectedResume(null);
        setMobileOverlay(false);
      }
      await fetchResumes(); // refresh the list
      showNotification("Resume deleted successfully", "success");
    } catch (err) {
      console.error("Delete error:", err);
      const errorMsg = err.response?.data?.message || err.message || "Failed to delete resume";
      showNotification(errorMsg, "error");
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (resumeId) => {
    navigate(`/edit/${resumeId}`);
  };

  const handleDownloadPDF = async (resume) => {
    if (pdfLoadingMap[resume._id]) return;
    setPdfLoadingMap(prev => ({ ...prev, [resume._id]: true }));

    let container = null;
    let root = null;
    let isCancelled = false;

    try {
      container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '-9999px';
      container.style.width = '800px';
      container.style.backgroundColor = '#ffffff';
      container.style.padding = '40px';
      container.style.boxSizing = 'border-box';
      container.style.height = 'auto';
      container.style.overflow = 'visible';
      document.body.appendChild(container);

      const primary = resume.colorSettings?.primaryColor || "#4f46e5";
      const accent = resume.colorSettings?.accentColor || "#818cf8";

      let Component;
      if (resume.template === "ai-generated" && resume.aiManifest) {
        Component = () => <TemplateAIGenerated user={resume} styleManifest={resume.aiManifest} primaryColor={primary} accentColor={accent} />;
      } else {
        switch (resume.template) {
          case "t1": Component = () => <TemplateSimple user={resume} primaryColor={primary} accentColor={accent} />; break;
          case "t2": Component = () => <TemplateSidebar user={resume} primaryColor={primary} accentColor={accent} />; break;
          case "t3": Component = () => <TemplateTwoColumn user={resume} primaryColor={primary} accentColor={accent} />; break;
          case "t4": Component = () => <TemplateMinimalist user={resume} primaryColor={primary} accentColor={accent} />; break;
          case "t5": Component = () => <TemplateCreative user={resume} primaryColor={primary} accentColor={accent} />; break;
          case "t6": Component = () => <TemplateExecutive user={resume} primaryColor={primary} accentColor={accent} />; break;
          default: Component = () => <TemplateSimple user={resume} primaryColor={primary} accentColor={accent} />;
        }
      }

      root = createRoot(container);
      root.render(<Component />);

      await new Promise(resolve => setTimeout(resolve, 500));
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      if (isCancelled) return;

      const canvas = await html2canvas(container, {
        scale: 3,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        windowWidth: container.scrollWidth,
        windowHeight: container.scrollHeight,
        width: container.scrollWidth,
        height: container.scrollHeight
      });

      if (isCancelled) return;

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = 210;
      const pdfHeight = 297;
      const margin = 5;
      const contentWidth = pdfWidth - 2 * margin;
      const contentHeight = pdfHeight - 2 * margin;
      const aspectRatio = canvas.height / canvas.width;

      let finalWidth = contentWidth;
      let finalHeight = finalWidth * aspectRatio;
      if (finalHeight > contentHeight) {
        finalHeight = contentHeight;
        finalWidth = finalHeight / aspectRatio;
      }

      const x = (pdfWidth - finalWidth) / 2;
      const y = (pdfHeight - finalHeight) / 2;

      pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);
      pdf.save(`${resume.name || 'Resume'}.pdf`);
      showNotification("PDF exported successfully!", "success");
    } catch (error) {
      console.error("PDF generation error:", error);
      showNotification("Failed to generate PDF. Please try again.", "error");
    } finally {
      if (root) {
        try { root.unmount(); } catch (e) { console.warn("Root unmount failed", e); }
      }
      if (container && container.parentNode) {
        document.body.removeChild(container);
      }
      if (isMountedRef.current) {
        setPdfLoadingMap(prev => ({ ...prev, [resume._id]: false }));
      }
    }
  };

  const closePanel = () => {
    setSelectedResume(null);
    setMobileOverlay(false);
  };

  const handleCardClick = (resume) => {
    setSelectedResume(resume);
    if (window.innerWidth < 1024) setMobileOverlay(true);
  };

  useEffect(() => {
    if (selectedResume && sidePanelRef.current) {
      sidePanelRef.current.scrollTop = 0;
    }
  }, [selectedResume]);

  useEffect(() => {
    if (!selectedResume || filteredResumes.length === 0) return;
    const currentIndex = filteredResumes.findIndex(r => r._id === selectedResume._id);
    if (currentIndex === -1) return;
    const handleKeyDown = (e) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % filteredResumes.length;
        setSelectedResume(filteredResumes[nextIndex]);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex = (currentIndex - 1 + filteredResumes.length) % filteredResumes.length;
        setSelectedResume(filteredResumes[prevIndex]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredResumes, selectedResume]);

  const cardRefs = useRef({});
  useEffect(() => {
    if (selectedResume && cardRefs.current[selectedResume._id]) {
      cardRefs.current[selectedResume._id].scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [selectedResume]);

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getColorFromId = (id) => {
    if (!id) return "#f0f0ff";
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = ((hash << 5) - hash) + id.charCodeAt(i);
      hash |= 0;
    }
    const colors = ["#f0f0ff", "#e8f4f8", "#e6f7e6", "#fff0e6", "#ffe6f0", "#e6f3ff", "#f5e6ff", "#e6fff0", "#fff5e6", "#ffe6f5"];
    return colors[Math.abs(hash) % colors.length];
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil((now - date) / (1000 * 60 * 60 * 24));
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
            <button className="vr-create-btn" onClick={() => navigate("/create-resume")}>
              <FiPlus size={16} /> Create New Resume
            </button>
            <div className="vr-stats-card">
              <div className="stat-item">
                <span className="stat-value">{resumes.length}</span>
                <span className="stat-label">Total</span>
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
          <div className="vr-sort-wrapper">
            <FiClock className="vr-sort-icon" />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="vr-sort-select">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="nameAsc">Name (A-Z)</option>
              <option value="nameDesc">Name (Z-A)</option>
            </select>
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
            <button className="vr-empty-create-btn" onClick={() => navigate("/create-resume")}>
              Create New Resume
            </button>
          </div>
        ) : (
          <>
            <div className="vr-grid">
              {currentItems.map((resume, index) => (
                <div
                  className={`vr-card ${selectedResume?._id === resume._id ? "active" : ""}`}
                  key={`${resume._id}-${index}`} // ✅ Unique composite key
                  ref={el => cardRefs.current[resume._id] = el}
                  onClick={() => handleCardClick(resume)}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="vr-card-header">
                    <div
                      className="vr-card-avatar"
                      style={{ backgroundColor: getColorFromId(resume._id), color: "#4b5563" }}
                    >
                      {getInitials(resume.name)}
                    </div>
                    <div className="vr-card-actions">
                      <button
                        className="vr-card-action-btn edit"
                        onClick={(e) => { e.stopPropagation(); handleEdit(resume._id); }}
                        title="Edit Resume"
                      >
                        <FiEdit2 size={14} />
                      </button>
                      <button
                        className="vr-card-action-btn delete"
                        onClick={(e) => { e.stopPropagation(); confirmDelete(resume._id, resume.name, resume.role); }}
                        title="Delete Resume"
                        disabled={deletingId === resume._id}
                      >
                        {deletingId === resume._id ? <div className="vr-spinner-small"></div> : <FiTrash2 size={14} />}
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
                      {resume.skills ? (
                        resume.skills.split(',').slice(0, 3).map((skill, i) => (
                          <span key={i} className="skill-tag">{skill.trim()}</span>
                        ))
                      ) : (
                        <span className="skill-tag">No skills listed</span>
                      )}
                    </div>
                    <div className="vr-card-footer">
                      <div className="vr-update-date">
                        <FiCalendar size={12} />
                        <span>{formatDate(resume.updatedAt)}</span>
                      </div>
                      <button
                        className="vr-view-btn"
                        onClick={(e) => { e.stopPropagation(); handleCardClick(resume); }}
                      >
                        <FiEye size={14} /> Preview
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredResumes.length > itemsPerPage && (
              <div className="vr-pagination">
                <button className="vr-page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                  <FiChevronLeft size={16} /> Previous
                </button>
                <div className="vr-pagination-info">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (currentPage <= 3) pageNum = i + 1;
                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = currentPage - 2 + i;
                    return (
                      <button key={pageNum} className={`vr-page-num ${currentPage === pageNum ? "active" : ""}`} onClick={() => setCurrentPage(pageNum)}>
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button className="vr-page-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                  Next <FiChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {mobileOverlay && <div className="vr-mobile-overlay" onClick={closePanel} />}

      <aside className={`vr-side-panel ${selectedResume ? "open" : ""}`} ref={sidePanelRef}>
        {selectedResume && (
          <div className="vr-panel-inner">
            <div className="vr-panel-header-section">
              <button className="vr-close-panel" onClick={closePanel}>
                <FiX size={20} />
              </button>
            </div>

            <div className="vr-panel-profile">
              <div
                className="vr-panel-avatar"
                style={{ backgroundColor: getColorFromId(selectedResume._id), color: "#4b5563" }}
              >
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
                <FiLinkedin size={14} />
                {selectedResume.linkedin ? (
                  <a href={selectedResume.linkedin} target="_blank" rel="noopener noreferrer">
                    {selectedResume.linkedin}
                  </a>
                ) : (
                  <span>LinkedIn not linked</span>
                )}
              </div>
              <div className="contact-item">
                <FiGlobe size={14} />
                {selectedResume.github ? (
                  <a href={selectedResume.github} target="_blank" rel="noopener noreferrer">
                    {selectedResume.github}
                  </a>
                ) : (
                  <span>GitHub not provided</span>
                )}
              </div>
            </div>

            <div className="vr-panel-section">
              <h4><FiTarget size={14} /> Professional Summary</h4>
              <p>{selectedResume.about || "No professional summary provided."}</p>
            </div>

            <div className="vr-panel-section">
              <h4><FiCpu size={14} /> Core Competencies</h4>
              <div className="vr-panel-skills">
                {selectedResume.skills ? (
                  selectedResume.skills.split(',').map((skill, i) => (
                    <span key={i} className="panel-skill-tag">{skill.trim()}</span>
                  ))
                ) : (
                  <span>No skills listed</span>
                )}
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
                {selectedResume.experience ? (
                  selectedResume.experience.split('\n').slice(0, 3).map((exp, i) => (
                    <div key={i} className="exp-item">
                      <div className="exp-bullet"></div>
                      <p>{exp}</p>
                    </div>
                  ))
                ) : (
                  <p>No work experience listed</p>
                )}
              </div>
            </div>

            <div className="vr-panel-section">
              <h4><FiStar size={14} /> Projects</h4>
              <div className="vr-panel-projects">
                {selectedResume.projects ? (
                  selectedResume.projects.split('\n').slice(0, 2).map((project, i) => (
                    <div key={i} className="project-item">
                      <div className="project-bullet"></div>
                      <p>{project}</p>
                    </div>
                  ))
                ) : (
                  <p>No projects listed</p>
                )}
              </div>
            </div>

            <div className="vr-panel-section">
              <h4><FiAward size={14} /> Certifications</h4>
              <div className="vr-panel-certifications">
                {selectedResume.certificates ? (
                  selectedResume.certificates.split('\n').map((cert, i) => (
                    <div key={i} className="cert-item">
                      <div className="cert-bullet">🏅</div>
                      <p>{cert}</p>
                    </div>
                  ))
                ) : (
                  <p>No certifications listed</p>
                )}
              </div>
            </div>

            <div className="vr-panel-section">
              <h4><FiBookOpen size={14} /> Languages</h4>
              <div className="vr-panel-languages">
                {selectedResume.languages ? (
                  <div className="languages-list">
                    {selectedResume.languages.split(',').map((lang, i) => (
                      <span key={i} className="lang-tag">{lang.trim()}</span>
                    ))}
                  </div>
                ) : (
                  <p>No languages listed</p>
                )}
              </div>
            </div>

            <div className="vr-panel-actions-bottom">
              <button
                className="vr-download-btn"
                onClick={() => handleDownloadPDF(selectedResume)}
                disabled={pdfLoadingMap[selectedResume._id]}
              >
                {pdfLoadingMap[selectedResume._id] ? (
                  <>
                    <div className="vr-spinner-small"></div> Generating...
                  </>
                ) : (
                  <>
                    <FiDownload size={16} /> Download PDF
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </aside>

      {deleteModal.show && (
        <div className="vr-modal-overlay">
          <div className="vr-modal">
            <div className="vr-modal-header">
              <FiAlertCircle size={24} />
              <h3>Delete Resume</h3>
            </div>
            <p>Are you sure you want to delete <strong>{deleteModal.resumeName}</strong>? This action cannot be undone.</p>
            <div className="vr-modal-actions">
              <button className="vr-modal-cancel" onClick={() => setDeleteModal({ show: false, resumeId: null, resumeName: "" })}>
                Cancel
              </button>
              <button className="vr-modal-confirm" onClick={handleDelete} disabled={deletingId === deleteModal.resumeId}>
                {deletingId === deleteModal.resumeId ? <div className="vr-spinner-small"></div> : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewResumes;