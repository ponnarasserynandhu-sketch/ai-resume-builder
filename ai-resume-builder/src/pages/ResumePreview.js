import React from "react";
import "./ResumePreview.css";

function ResumePreview({ data, template }) {
  return (
    <div className={`resume-preview ${template}`}>

      {/*  HEADER / PERSONAL INFO  */}
      <div className="resume-header">
        <h1>{data.name}</h1>
        <p>{data.role}</p>
        <div className="contact-info">
          {data.email && <span>Email: {data.email}</span>}
          {data.phone && <span>Phone: {data.phone}</span>}
          {data.address && <span>Address: {data.address}</span>}
          {data.linkedin && <span>LinkedIn: {data.linkedin}</span>}
        </div>
      </div>

      {/* CAREER SUMMARY  */}
      {data.summary && (
        <div className="resume-section">
          <h3>Career Summary</h3>
          <p>{data.summary}</p>
        </div>
      )}

      {/*  SKILLS  */}
      {data.skills && (
        <div className="resume-section">
          <h3>Skills</h3>
          <p>{data.skills}</p>
        </div>
      )}

      {/*  EDUCATION  */}
      <div className="resume-section">
        <h3>Education</h3>

        {/* 10th */}
        {(data.tenthSchool || data.tenthPercentage || data.tenthYear) && (
          <div className="education-item">
            <strong>10th:</strong> {data.tenthSchool} | {data.tenthPercentage} | {data.tenthYear}
          </div>
        )}

        {/* Intermediate / Diploma */}
        {(data.interCollege || data.interCourse || data.interPercentage || data.interYear) && (
          <div className="education-item">
            <strong>Intermediate / Diploma:</strong> {data.interCollege} | {data.interCourse} | {data.interPercentage} | {data.interYear}
          </div>
        )}

        {/* Degree */}
        {(data.degreeCollege || data.degreeCourse || data.degreePercentage || data.degreeYear) && (
          <div className="education-item">
            <strong>Degree:</strong> {data.degreeCollege} | {data.degreeCourse} | {data.degreePercentage} | {data.degreeYear}
          </div>
        )}
      </div>

      {/*  EXPERIENCE  */}
      {data.experience && (
        <div className="resume-section">
          <h3>Experience</h3>
          <p>{data.experience}</p>
        </div>
      )}

      {/*  PROJECTS  */}
      {data.projects && (
        <div className="resume-section">
          <h3>Projects</h3>
          <p>{data.projects}</p>
        </div>
      )}

      {/*  CERTIFICATES  */}
      {data.certificates && (
        <div className="resume-section">
          <h3>Certificates</h3>
          <p>{data.certificates}</p>
        </div>
      )}

      {/*  LANGUAGES  */}
      {data.languages && (
        <div className="resume-section">
          <h3>Languages</h3>
          <p>{data.languages}</p>
        </div>
      )}

    </div>
  );
}

export default ResumePreview;