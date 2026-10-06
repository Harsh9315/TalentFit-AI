import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [currentView, setCurrentView] = useState('candidate');
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pdfExtracting, setPdfExtracting] = useState(false);
  const [result, setResult] = useState(null);

  const [applications, setApplications] = useState([]);
  const [fetchingApps, setFetchingApps] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const API_BASE = "http://localhost:8080/api";


  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (currentView === 'hr') {
      fetchApplications();
    }
  }, [currentView]);

  const fetchJobs = async () => {
    try {
      const response = await axios.get(`${API_BASE}/jobs`);
      setJobs(response.data);
      if (response.data.length > 0) {
        setSelectedJob(response.data[0]);
      }
    } catch (err) {
      console.error("Error fetching jobs:", err);
    }
  };

  const fetchApplications = async () => {
    setFetchingApps(true);
    try {
      const response = await axios.get(`${API_BASE}/applications`);
      setApplications(response.data);
    } catch (err) {
      console.error("Error fetching applications:", err);
    } finally {
      setFetchingApps(false);
    }
  };

  const handlePdfUpload = async () => {
    if (!selectedFile) {
      alert("Please select a PDF file first!");
      return;
    }
    setPdfExtracting(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await axios.post(`${API_BASE}/analyze-pdf`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data && response.data.extractedText) {
        setResumeText(response.data.extractedText);
      } else {
        alert("Could not extract text from PDF.");
      }
    } catch (err) {
      console.error("PDF Processing Error:", err);
      alert("Failed to read PDF file.");
    } finally {
      setPdfExtracting(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!selectedJob || !resumeText.trim()) {
      alert("Please enter or extract your resume content!");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const payload = {
        jobId: selectedJob.id,
        candidateId: 2,
        resumeText: resumeText
      };

      const response = await axios.post(`${API_BASE}/applications/apply`, payload);
      setResult(response.data);
    } catch (err) {
      alert("Failed to evaluate resume. Make sure Spring Boot backend is running!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter(app => {
    if (statusFilter === 'ALL') return true;
    return app.status === statusFilter;
  });

  const totalApps = applications.length;
  const shortlistedCount = applications.filter(a => a.status === 'SHORTLISTED').length;
  const rejectedCount = applications.filter(a => a.status === 'REJECTED').length;

  return (
    <div style={styles.pageWrapper}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
          background: linear-gradient(135deg, #064e3b 0%, #047857 40%, #0284c7 100%);
          font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif; 
          min-height: 100vh;
        }
        button, input, select, textarea {
          transition: all 0.2s ease-in-out;
        }
        button:hover {
          opacity: 0.95;
        }
      `}</style>

      {/* Header Bar */}
      <header style={styles.navbar}>
        <div style={styles.navContainer}>
          <div style={styles.brandGroup}>
            <div style={styles.logoBadge}>TF</div>
            <div>
              <h1 style={styles.brandTitle}>TalentFit<span style={{ color: '#38bdf8' }}>-AI</span></h1>
              <span style={styles.brandSubtitle}>Smart ATS Screening & HR Analytics Platform</span>
            </div>
          </div>

          <div style={styles.tabGroup}>
            <button
              onClick={() => setCurrentView('candidate')}
              style={currentView === 'candidate' ? styles.activeTab : styles.inactiveTab}
            >
              Candidate Portal
            </button>
            <button
              onClick={() => setCurrentView('hr')}
              style={currentView === 'hr' ? styles.activeTab : styles.inactiveTab}
            >
              HR Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main style={styles.mainContent}>
        {currentView === 'candidate' && (
          <div style={styles.gridTwoColumn}>
            
            {/* Left Glass Panel */}
            <div style={styles.glassCard}>
              
              <div style={styles.sectionHeader}>
                <span style={styles.stepIndicator}>1</span>
                <div>
                  <h2 style={styles.sectionTitle}>Select Target Position</h2>
                  <p style={styles.sectionSubtitle}>Choose the role you want to evaluate against</p>
                </div>
              </div>

              {jobs.length === 0 ? (
                <div style={styles.infoBox}>Connecting to live backend services...</div>
              ) : (
                <div style={{ marginBottom: '28px' }}>
                  <div style={styles.dropdownWrapper}>
                    <select
                      value={selectedJob?.id || ''}
                      onChange={(e) => {
                        const job = jobs.find(j => j.id === parseInt(e.target.value));
                        setSelectedJob(job);
                      }}
                      style={styles.dropdownSelect}
                    >
                      {jobs.map((job) => (
                        <option key={job.id} value={job.id}>
                          {job.title}
                        </option>
                      ))}
                    </select>
                    <span style={styles.dropdownArrow}>▼</span>
                  </div>

                  {selectedJob && (
                    <div style={styles.jobPreviewCard}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={styles.jobBadgeTitle}>{selectedJob.title}</span>
                        <span style={styles.statusPill}>● ACTIVE ROLE</span>
                      </div>
                      <p style={styles.jobSkillsText}>
                        <strong style={{ color: '#0f172a' }}>Required Skills:</strong> {selectedJob.requiredSkills}
                      </p>
                      <p style={styles.jobDescText}>{selectedJob.description}</p>
                    </div>
                  )}
                </div>
              )}

              <div style={styles.sectionHeader}>
                <span style={styles.stepIndicator}>2</span>
                <div>
                  <h2 style={styles.sectionTitle}>Resume Processing</h2>
                  <p style={styles.sectionSubtitle}>Extract data from PDF or input plain text</p>
                </div>
              </div>

              {/* Polished Subtle Upload Box */}
              <div style={styles.uploadDropzone}>
                <div style={{ marginBottom: '8px' }}>
                  <label style={styles.primaryUploadBtn}>
                    📁 Choose PDF Resume
                    <input 
                      type="file" 
                      accept=".pdf" 
                      onChange={(e) => setSelectedFile(e.target.files[0])} 
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>

                <div style={styles.fileNameText}>
                  {selectedFile ? `Selected: ${selectedFile.name}` : "No PDF document attached"}
                </div>
                
                <button
                  type="button"
                  onClick={handlePdfUpload}
                  disabled={pdfExtracting}
                  style={styles.secondaryActionBtn}
                >
                  {pdfExtracting ? 'Extracting Resume Data...' : 'Parse & Process PDF'}
                </button>
              </div>

              <form onSubmit={handleApply} style={{ marginTop: '20px' }}>
                <textarea
                  rows="6"
                  style={styles.textInputArea}
                  placeholder="Parsed resume text will appear here automatically or type manually..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  style={loading ? styles.btnDisabled : styles.btnSubmit}
                >
                  {loading ? 'Evaluating Application...' : 'Run Candidate Analysis'}
                </button>
              </form>
            </div>

            {/* Right Glass Panel */}
            <div style={styles.glassCard}>
              <div style={styles.sectionHeader}>
                <div>
                  <h2 style={styles.sectionTitle}>Screening & Evaluation Report</h2>
                  <p style={styles.sectionSubtitle}>Real-time ATS match scoring and skill verification</p>
                </div>
              </div>

              {!result && !loading && (
                <div style={styles.emptyStateWrapper}>
                  <div style={styles.emptyIconBox}>📊</div>
                  <h3 style={styles.emptyStateTitle}>Awaiting Candidate Data</h3>
                  <p style={styles.emptyStateDescription}>
                    Select a target job position and supply candidate resume details on the left to compute alignment matrix.
                  </p>
                </div>
              )}

              {loading && (
                <div style={styles.emptyStateWrapper}>
                  <div style={styles.loadingSpinner}></div>
                  <h3 style={styles.emptyStateTitle}>Analyzing Compatibility...</h3>
                  <p style={styles.emptyStateDescription}>Comparing candidate skills against database requirements.</p>
                </div>
              )}

              {result && (
                <div style={result.status === 'SHORTLISTED' ? styles.resultCardSuccess : styles.resultCardDanger}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={result.status === 'SHORTLISTED' ? styles.statusBadgeGreen : styles.statusBadgeRed}>
                        {result.status}
                      </span>
                      <h3 style={styles.resultTitleText}>
                        {result.status === 'SHORTLISTED' ? 'Accepted' : 'Application Status'}
                      </h3>
                    </div>
                    <div style={styles.scoreGaugeCircle}>
                      <span style={styles.scoreNumberText}>{result.matchScore}%</span>
                      <span style={styles.scoreLabelText}>Match Score</span>
                    </div>
                  </div>

                  <div style={styles.skillsAnalysisBox}>
                    <h4 style={styles.skillsAnalysisHeader}>Recommended / Missing Skills:</h4>
                    <p style={styles.skillsAnalysisContent}>
                      {result.missingSkills || 'Target skill matrix completely satisfied.'}
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* HR Dashboard View */}
        {currentView === 'hr' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={styles.metricsGrid}>
              <div style={styles.metricCard}>
                <span style={styles.metricTitle}>Total Applications</span>
                <span style={styles.metricNumber}>{totalApps}</span>
              </div>
              <div style={styles.metricCard}>
                <span style={styles.metricTitle}>Shortlisted Candidates</span>
                <span style={{ ...styles.metricNumber, color: '#16a34a' }}>{shortlistedCount}</span>
              </div>
              <div style={styles.metricCard}>
                <span style={styles.metricTitle}>Rejected Candidates</span>
                <span style={{ ...styles.metricNumber, color: '#dc2626' }}>{rejectedCount}</span>
              </div>
            </div>

            <div style={styles.glassCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h2 style={styles.sectionTitle}>Application Records Database</h2>
                  <p style={styles.sectionSubtitle}>Real-time evaluation results from database</p>
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={styles.filterDropdownSelect}
                >
                  <option value="ALL">Filter: All Candidates</option>
                  <option value="SHORTLISTED">Shortlisted Only</option>
                  <option value="REJECTED">Rejected Only</option>
                </select>
              </div>

              {fetchingApps ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Fetching records...</div>
              ) : filteredApplications.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No matching application logs found.</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={styles.tableElement}>
                    <thead>
                      <tr>
                        <th style={styles.thElement}>ID</th>
                        <th style={styles.thElement}>Candidate Name</th>
                        <th style={styles.thElement}>Target Position</th>
                        <th style={styles.thElement}>Score</th>
                        <th style={styles.thElement}>Status</th>
                        <th style={styles.thElement}>Missing Skills / Feedback</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredApplications.map((app) => (
                        <tr key={app.id} style={styles.trElement}>
                          <td style={styles.tdElement}>#{app.id}</td>
                          <td style={{ ...styles.tdElement, fontWeight: '600', color: '#0f172a' }}>
                            {app.candidate?.name || 'Harsh Srivastav'}
                          </td>
                          <td style={styles.tdElement}>{app.job?.title || 'Developer'}</td>
                          <td style={styles.tdElement}>
                            <span style={{
                              ...styles.inlineScoreTag,
                              background: app.matchScore >= 60 ? '#dcfce7' : '#fee2e2',
                              color: app.matchScore >= 60 ? '#15803d' : '#b91c1c'
                            }}>
                              {app.matchScore}%
                            </span>
                          </td>
                          <td style={styles.tdElement}>
                            <span style={{
                              ...styles.inlineStatusTag,
                              background: app.status === 'SHORTLISTED' ? '#16a34a' : '#dc2626'
                            }}>
                              {app.status}
                            </span>
                          </td>
                          <td style={{ ...styles.tdElement, color: '#475569', fontSize: '13px' }}>
                            {app.missingSkills || 'None'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// 🎯 CLEAN & PROFESSIONAL HUMAN-DESIGN STYLES
const styles = {
  pageWrapper: {
    minHeight: '100vh',
    color: '#0f172a'
  },
  navbar: {
    background: 'rgba(15, 23, 42, 0.8)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
    padding: '14px 0',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
  },
  navContainer: {
    maxWidth: '1240px',
    margin: '0 auto',
    padding: '0 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  brandGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  logoBadge: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #10b981 0%, #0284c7 100%)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '15px',
    boxShadow: '0 2px 10px rgba(16, 185, 129, 0.3)'
  },
  brandTitle: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: '-0.3px'
  },
  brandSubtitle: {
    fontSize: '11px',
    color: '#94a3b8',
    fontWeight: '500'
  },
  tabGroup: {
    display: 'flex',
    gap: '4px',
    background: 'rgba(255, 255, 255, 0.08)',
    padding: '4px',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  },
  activeTab: {
    padding: '8px 16px',
    background: '#ffffff',
    color: '#0f172a',
    border: 'none',
    borderRadius: '7px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  },
  inactiveTab: {
    padding: '8px 16px',
    background: 'transparent',
    color: '#cbd5e1',
    border: 'none',
    borderRadius: '7px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  mainContent: {
    maxWidth: '1240px',
    margin: '32px auto',
    padding: '0 24px'
  },
  gridTwoColumn: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px'
  },
  glassCard: {
    background: 'rgba(255, 255, 255, 0.92)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.8)',
    padding: '28px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)'
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px'
  },
  stepIndicator: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    background: '#047857',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '13px'
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#0f172a'
  },
  sectionSubtitle: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '2px'
  },
  infoBox: {
    padding: '14px',
    background: '#f8fafc',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#64748b',
    border: '1px solid #e2e8f0'
  },
  dropdownWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  dropdownSelect: {
    width: '100%',
    padding: '11px 14px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    background: '#ffffff',
    color: '#0f172a',
    fontSize: '14px',
    fontWeight: '600',
    outline: 'none',
    appearance: 'none',
    cursor: 'pointer'
  },
  dropdownArrow: {
    position: 'absolute',
    right: '14px',
    fontSize: '10px',
    color: '#64748b',
    pointerEvents: 'none'
  },
  jobPreviewCard: {
    marginTop: '12px',
    padding: '16px',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '10px'
  },
  jobBadgeTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#0f172a'
  },
  statusPill: {
    fontSize: '10px',
    color: '#047857',
    fontWeight: '700',
    background: '#d1fae5',
    padding: '3px 8px',
    borderRadius: '6px'
  },
  jobSkillsText: {
    fontSize: '13px',
    margin: '8px 0 6px 0',
    color: '#475569'
  },
  jobDescText: {
    fontSize: '12px',
    color: '#64748b',
    lineHeight: '1.5'
  },
  // Fixed Subtle Border
  uploadDropzone: {
    padding: '20px',
    background: '#f8fafc',
    border: '1px dashed #cbd5e1',
    borderRadius: '10px',
    textAlign: 'center'
  },
  primaryUploadBtn: {
    display: 'inline-block',
    padding: '9px 18px',
    background: '#047857',
    color: '#ffffff',
    borderRadius: '7px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  fileNameText: {
    fontSize: '12px',
    color: '#64748b',
    marginBottom: '10px'
  },
  secondaryActionBtn: {
    width: '100%',
    padding: '9px',
    background: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '7px',
    color: '#334155',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  textInputArea: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    background: '#ffffff',
    fontSize: '13px',
    color: '#0f172a',
    outline: 'none',
    lineHeight: '1.5',
    resize: 'vertical'
  },
  btnSubmit: {
    width: '100%',
    padding: '12px',
    marginTop: '12px',
    background: '#047857',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(4, 120, 87, 0.2)'
  },
  btnDisabled: {
    width: '100%',
    padding: '12px',
    marginTop: '12px',
    background: '#94a3b8',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'not-allowed'
  },
  emptyStateWrapper: {
    textAlign: 'center',
    padding: '70px 20px'
  },
  emptyIconBox: {
    fontSize: '38px',
    marginBottom: '12px'
  },
  emptyStateTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '6px'
  },
  emptyStateDescription: {
    fontSize: '13px',
    color: '#64748b',
    lineHeight: '1.5'
  },
  loadingSpinner: {
    width: '32px',
    height: '32px',
    border: '3px solid #cbd5e1',
    borderTop: '3px solid #047857',
    borderRadius: '50%',
    margin: '0 auto 16px auto',
    animation: 'spin 1s linear infinite'
  },
  resultCardSuccess: {
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '12px',
    padding: '24px'
  },
  resultCardDanger: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '12px',
    padding: '24px'
  },
  statusBadgeGreen: {
    background: '#16a34a',
    color: '#ffffff',
    padding: '3px 8px',
    borderRadius: '5px',
    fontSize: '11px',
    fontWeight: '700'
  },
  statusBadgeRed: {
    background: '#dc2626',
    color: '#ffffff',
    padding: '3px 8px',
    borderRadius: '5px',
    fontSize: '11px',
    fontWeight: '700'
  },
  resultTitleText: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#0f172a',
    marginTop: '10px'
  },
  scoreGaugeCircle: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: '#ffffff',
    border: '1px solid #cbd5e1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
  },
  scoreNumberText: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#0f172a'
  },
  scoreLabelText: {
    fontSize: '9px',
    color: '#64748b',
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  skillsAnalysisBox: {
    marginTop: '20px',
    paddingTop: '16px',
    borderTop: '1px solid rgba(0,0,0,0.06)'
  },
  skillsAnalysisHeader: {
    fontSize: '11px',
    color: '#64748b',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: '6px'
  },
  skillsAnalysisContent: {
    fontSize: '13px',
    color: '#334155',
    lineHeight: '1.6'
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px'
  },
  metricCard: {
    background: 'rgba(255, 255, 255, 0.92)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.8)',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 10px 20px rgba(0,0,0,0.08)'
  },
  metricTitle: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#64748b',
    display: 'block',
    marginBottom: '6px'
  },
  metricNumber: {
    fontSize: '30px',
    fontWeight: '800',
    color: '#0f172a'
  },
  filterDropdownSelect: {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    background: '#ffffff',
    fontSize: '13px',
    fontWeight: '600',
    color: '#0f172a'
  },
  tableElement: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  thElement: {
    textAlign: 'left',
    padding: '12px',
    fontSize: '11px',
    color: '#64748b',
    borderBottom: '1px solid #cbd5e1',
    textTransform: 'uppercase',
    fontWeight: '700'
  },
  trElement: {
    borderBottom: '1px solid #f1f5f9'
  },
  tdElement: {
    padding: '14px 12px',
    fontSize: '13px',
    color: '#334155'
  },
  inlineScoreTag: {
    padding: '3px 8px',
    borderRadius: '5px',
    fontWeight: '700',
    fontSize: '12px'
  },
  inlineStatusTag: {
    color: '#ffffff',
    padding: '3px 8px',
    borderRadius: '5px',
    fontWeight: '700',
    fontSize: '11px'
  }
};

export default App;
