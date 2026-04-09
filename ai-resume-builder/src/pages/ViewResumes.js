import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
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
  FiUser,
  FiTarget
} from "react-icons/fi";

function ViewResumes() {
  const [resumes, setResumes] = useState([]);
  const [filteredResumes, setFilteredResumes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedResume, setSelectedResume] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

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

  const indexLast = currentPage * itemsPerPage;
  const indexFirst = indexLast - itemsPerPage;
  const currentItems = filteredResumes.slice(indexFirst, indexLast);
  const totalPages = Math.ceil(filteredResumes.length / itemsPerPage);

  return (
    <div className="vr-container">
      <div className={`vr-main-content ${selectedResume ? "shrink" : ""}`}>
        <header className="vr-header">
          <div>
            <h1>Document Library</h1>
            <p>Manage and review your professional profiles</p>
          </div>
          <div className="vr-search-wrapper">
            <FiSearch className="vr-search-icon" />
            <input
              type="text"
              placeholder="Filter by name, role or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        {isLoading ? (
          <div className="vr-loader-container">
            <div className="vr-spinner"></div>
            <p>Syncing your library...</p>
          </div>
        ) : (
          <div className="vr-table-section">
            <div className="vr-grid">
              {currentItems.map((resume) => (
                <div 
                  className={`vr-card ${selectedResume?._id === resume._id ? "active" : ""}`} 
                  key={resume._id}
                  onClick={() => setSelectedResume(resume)}
                >
                  <div className="vr-card-icon">
                    <FiFileText />
                  </div>
                  <div className="vr-card-body">
                    <h3>{resume.name || "Unnamed Profile"}</h3>
                    <span className="vr-role-badge">{resume.role || "General"}</span>
                    <p className="vr-skills-preview">{resume.skills || "No skills listed"}</p>
                  </div>
                  <div className="vr-card-actions">
                    <button className="vr-btn-view"><FiEye /></button>
                    <button 
                      className="vr-btn-delete" 
                      onClick={(e) => { e.stopPropagation(); handleDelete(resume._id); }}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredResumes.length > itemsPerPage && (
              <div className="vr-pagination">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                  <FiChevronLeft />
                </button>
                <div className="vr-page-indicator">
                  Page <b>{currentPage}</b> of {totalPages}
                </div>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                  <FiChevronRight />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SIDE PREVIEW PANEL */}
      <aside className={`vr-side-panel ${selectedResume ? "open" : ""}`}>
        {selectedResume && (
          <div className="vr-panel-inner">
            <button className="vr-close-panel" onClick={() => setSelectedResume(null)}>
              <FiX />
            </button>
            <div className="vr-panel-header">
              <div className="vr-avatar-large">
                {selectedResume.name ? selectedResume.name[0] : "?"}
              </div>
              <h2>{selectedResume.name}</h2>
              <p>{selectedResume.role}</p>
            </div>

            <div className="vr-panel-details">
              <div className="vr-detail-item">
                <FiMail />
                <div>
                  <label>Email Address</label>
                  <p>{selectedResume.email || "N/A"}</p>
                </div>
              </div>
              <div className="vr-detail-item">
                <FiTarget />
                <div>
                  <label>Top Skills</label>
                  <p>{selectedResume.skills || "N/A"}</p>
                </div>
              </div>
              <div className="vr-detail-item">
                <FiUser />
                <div>
                  <label>Biography</label>
                  <p className="vr-about-text">{selectedResume.about || "No description provided."}</p>
                </div>
              </div>
            </div>
            
            <button className="vr-full-edit-btn" onClick={() => window.location.href=`/edit/${selectedResume._id}`}>
              Full Edit Mode
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}

export default ViewResumes;