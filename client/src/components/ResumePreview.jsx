import { Mail, Phone, Link2, MapPin, ExternalLink } from 'lucide-react';
import './ResumePreview.css';

export default function ResumePreview({ resumeData }) {
  const { personalInfo, summary, skills, experience, education, projects, certifications } = resumeData;
  const hasContent = personalInfo.name || summary || skills.length > 0 || experience.length > 0;

  if (!hasContent) {
    return (
      <div className="preview-empty">
        <div className="preview-empty-icon">📄</div>
        <h3>Resume Preview</h3>
        <p>Fill in the form or upload a resume to see a live preview here.</p>
      </div>
    );
  }

  return (
    <div className="resume-preview" id="resume-preview">
      <div className="preview-page">
        {/* Header */}
        <div className="preview-header">
          <h1 className="preview-name">{personalInfo.name || 'Your Name'}</h1>
          <div className="preview-contact">
            {personalInfo.email && (
              <span className="preview-contact-item">
                <Mail size={12} /> {personalInfo.email}
              </span>
            )}
            {personalInfo.phone && (
              <span className="preview-contact-item">
                <Phone size={12} /> {personalInfo.phone}
              </span>
            )}
            {personalInfo.linkedin && (
              <span className="preview-contact-item">
                <Link2 size={12} /> {personalInfo.linkedin}
              </span>
            )}
            {personalInfo.location && (
              <span className="preview-contact-item">
                <MapPin size={12} /> {personalInfo.location}
              </span>
            )}
          </div>
        </div>

        {/* Summary */}
        {summary && (
          <div className="preview-section">
            <h2 className="preview-section-title">Professional Summary</h2>
            <p className="preview-summary-text">{summary}</p>
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="preview-section">
            <h2 className="preview-section-title">Skills</h2>
            <div className="preview-skills">
              {skills.map((skill, i) => (
                <span className="preview-skill-tag" key={i}>{skill}</span>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && experience.some(e => e.title || e.company) && (
          <div className="preview-section">
            <h2 className="preview-section-title">Experience</h2>
            {experience.map((exp, i) => (
              (exp.title || exp.company) && (
                <div className="preview-entry" key={i}>
                  <div className="preview-entry-header">
                    <div>
                      <h3 className="preview-entry-title">{exp.title}</h3>
                      <p className="preview-entry-subtitle">{exp.company}</p>
                    </div>
                    <span className="preview-entry-date">
                      {exp.startDate}{exp.startDate && (exp.endDate || exp.current) ? ' — ' : ''}
                      {exp.current ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  {exp.bullets.filter(Boolean).length > 0 && (
                    <ul className="preview-bullets">
                      {exp.bullets.filter(Boolean).map((bullet, bi) => (
                        <li key={bi}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            ))}
          </div>
        )}

        {/* Education */}
        {education.length > 0 && education.some(e => e.degree || e.institution) && (
          <div className="preview-section">
            <h2 className="preview-section-title">Education</h2>
            {education.map((edu, i) => (
              (edu.degree || edu.institution) && (
                <div className="preview-entry" key={i}>
                  <div className="preview-entry-header">
                    <div>
                      <h3 className="preview-entry-title">{edu.degree}</h3>
                      <p className="preview-entry-subtitle">{edu.institution}</p>
                    </div>
                    <span className="preview-entry-date">
                      {edu.year}{edu.gpa ? ` • GPA: ${edu.gpa}` : ''}
                    </span>
                  </div>
                </div>
              )
            ))}
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && projects.some(p => p.name) && (
          <div className="preview-section">
            <h2 className="preview-section-title">Projects</h2>
            {projects.map((proj, i) => (
              proj.name && (
                <div className="preview-entry" key={i}>
                  <div className="preview-entry-header">
                    <h3 className="preview-entry-title">
                      {proj.name}
                      {proj.link && (
                        <a href={proj.link} target="_blank" rel="noreferrer" className="preview-link">
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </h3>
                  </div>
                  {proj.description && <p className="preview-description">{proj.description}</p>}
                  {proj.technologies.length > 0 && (
                    <div className="preview-tech">
                      {proj.technologies.map((tech, ti) => (
                        <span className="preview-tech-tag" key={ti}>{tech}</span>
                      ))}
                    </div>
                  )}
                </div>
              )
            ))}
          </div>
        )}

        {/* Certifications */}
        {certifications.length > 0 && certifications.some(c => c.name) && (
          <div className="preview-section">
            <h2 className="preview-section-title">Certifications</h2>
            {certifications.map((cert, i) => (
              cert.name && (
                <div className="preview-cert" key={i}>
                  <span className="preview-cert-name">{cert.name}</span>
                  {cert.issuer && <span className="preview-cert-issuer"> — {cert.issuer}</span>}
                  {cert.year && <span className="preview-cert-year"> ({cert.year})</span>}
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
