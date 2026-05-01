import { useState, useCallback, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { Save, BarChart3, Compass } from 'lucide-react';
import Header from '../components/Header';
import FileUpload from '../components/FileUpload';
import ResumeForm from '../components/ResumeForm';
import ResumePreview from '../components/ResumePreview';
import ActionButtons from '../components/ActionButtons';
import GradeResults from '../components/GradeResults';
import JobSuggestions from '../components/JobSuggestions';
import AuthModal from '../components/AuthModal';
import Modal from '../components/Modal';
import { parseResume, generateResume, gradeResume, suggestJobs } from '../api/resumeApi';
import { useAuth } from '../contexts/AuthContext';
import { saveResume, getResume } from '../firebase/resumeService';
import '../App.css';

const INITIAL_RESUME = {
  personalInfo: { name: '', email: '', phone: '', linkedin: '', location: '' },
  summary: '',
  skills: [],
  experience: [],
  education: [],
  projects: [],
  certifications: [],
};

export default function BuilderPage() {
  const { user }                = useAuth();
  const { resumeId }            = useParams();
  const [searchParams]          = useSearchParams();
  const navigate                = useNavigate();

  const [resumeData, setResumeData]   = useState(INITIAL_RESUME);
  const [currentId,  setCurrentId]    = useState(resumeId || null);
  const [gradeData,  setGradeData]    = useState(null);
  const [jobData,    setJobData]      = useState(null);
  const [isParsing,  setIsParsing]    = useState(false);
  const [isSaving,   setIsSaving]     = useState(false);
  const [activeModal,setActiveModal]  = useState(null); // 'grade'|'jobs'|'auth'
  const [loading, setLoading] = useState({ generate: false, grade: false, suggest: false });

  // Load existing resume when editing (/builder/:resumeId)
  useEffect(() => {
    if (!resumeId) return;
    (async () => {
      try {
        const data = await getResume(resumeId);
        if (data?.resumeData) {
          setResumeData(data.resumeData);
          setCurrentId(resumeId);
        } else {
          toast.error('Resume not found');
          navigate('/dashboard');
        }
      } catch {
        toast.error('Could not load resume');
      }
    })();
  }, [resumeId, navigate]);

  const hasContent =
    resumeData.personalInfo.name ||
    resumeData.experience.length > 0 ||
    resumeData.skills.length > 0;

  // Deep update helper
  const update = useCallback((path, value) => {
    setResumeData(prev => {
      const keys = path.split('.');
      const next = { ...prev };
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) {
        obj[keys[i]] = { ...obj[keys[i]] };
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  }, []);

  // File upload → parse resume
  const handleFileUpload = useCallback(async (file) => {
    setIsParsing(true);
    toast.loading('Parsing your resume…', { id: 'parse' });
    try {
      const result = await parseResume(file);
      setResumeData(result);
      toast.success('Resume imported!', { id: 'parse' });
    } catch (err) {
      toast.error(err.message || 'Failed to parse resume', { id: 'parse' });
    } finally {
      setIsParsing(false);
    }
  }, []);

  // Save to Firestore
  const handleSave = useCallback(async () => {
    if (!user) { setActiveModal('auth'); return; }
    if (!hasContent) return toast.error('Add some content first');
    setIsSaving(true);
    toast.loading('Saving…', { id: 'save' });
    try {
      const id = await saveResume(user.uid, resumeData, resumeData.personalInfo.name, currentId);
      setCurrentId(id);
      if (!resumeId) navigate(`/builder/${id}`, { replace: true });
      toast.success('Resume saved!', { id: 'save' });
    } catch (err) {
      toast.error('Could not save resume', { id: 'save' });
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }, [user, resumeData, currentId, resumeId, hasContent, navigate]);

  // AI: Generate / enhance
  const handleGenerate = useCallback(async () => {
    if (!hasContent) return toast.error('Add some resume content first');
    setLoading(l => ({ ...l, generate: true }));
    toast.loading('Enhancing with AI…', { id: 'generate' });
    try {
      const result = await generateResume(resumeData);
      setResumeData(result);
      toast.success('Resume enhanced!', { id: 'generate' });
    } catch (err) {
      toast.error(err.message || 'Failed to generate resume', { id: 'generate' });
    } finally {
      setLoading(l => ({ ...l, generate: false }));
    }
  }, [resumeData, hasContent]);

  // AI: Grade
  const handleGrade = useCallback(async () => {
    if (!hasContent) return toast.error('Add some resume content first');
    setLoading(l => ({ ...l, grade: true }));
    toast.loading('Grading your resume…', { id: 'grade' });
    try {
      const result = await gradeResume(resumeData);
      setGradeData(result);
      setActiveModal('grade');
      toast.success(`ATS Score: ${result.atsScore}/100`, { id: 'grade' });
    } catch (err) {
      toast.error(err.message || 'Failed to grade resume', { id: 'grade' });
    } finally {
      setLoading(l => ({ ...l, grade: false }));
    }
  }, [resumeData, hasContent]);

  // AI: Job suggestions
  const handleSuggestJobs = useCallback(async () => {
    if (!hasContent) return toast.error('Add some resume content first');
    setLoading(l => ({ ...l, suggest: true }));
    toast.loading('Finding best-fit roles…', { id: 'suggest' });
    try {
      const result = await suggestJobs(resumeData);
      setJobData(result);
      setActiveModal('jobs');
      toast.success('Job matches found!', { id: 'suggest' });
    } catch (err) {
      toast.error(err.message || 'Failed to suggest jobs', { id: 'suggest' });
    } finally {
      setLoading(l => ({ ...l, suggest: false }));
    }
  }, [resumeData, hasContent]);

  // PDF download — requires auth
  const handleDownload = useCallback(async () => {
    if (!user) { setActiveModal('auth'); return; }
    if (!hasContent) return toast.error('Add resume content before downloading');
    toast.loading('Generating PDF…', { id: 'pdf' });

    let clone = null;
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const original = document.querySelector('.preview-page');
      if (!original) throw new Error('Preview element not found');

      clone = original.cloneNode(true);
      Object.assign(clone.style, {
        position: 'fixed', top: '0', left: '0',
        width: original.scrollWidth + 'px',
        zIndex: '-9999', opacity: '0.01', pointerEvents: 'none',
      });
      document.body.appendChild(clone);
      await new Promise(r => setTimeout(r, 150));

      await html2pdf().set({
        margin: 0,
        filename: `${resumeData.personalInfo.name || 'resume'}.pdf`,
        image:       { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, scrollY: 0, scrollX: 0, windowHeight: clone.scrollHeight },
        jsPDF:       { unit: 'mm', format: 'a4', orientation: 'portrait' },
      }).from(clone).save();

      toast.success('PDF downloaded!', { id: 'pdf' });
    } catch (err) {
      toast.error('Failed to generate PDF', { id: 'pdf' });
      console.error('PDF error:', err);
    } finally {
      if (clone?.parentNode) clone.parentNode.removeChild(clone);
    }
  }, [user, resumeData.personalInfo.name, hasContent]);

  const closeModal = () => setActiveModal(null);

  return (
    <div className="app">
      <Toaster position="top-right" toastOptions={{
        style: { background: '#12122a', color: '#f0f0fa', border: '1px solid rgba(168,85,247,0.22)', borderRadius: '12px', fontSize: '0.875rem', fontFamily: 'var(--font-family)', boxShadow: '0 8px 32px rgba(0,0,0,0.45)' },
      }} />

      <Header />

      <main className="app-main">
        {/* Left sidebar */}
        <aside className="app-sidebar">
          <FileUpload
            onFileParsed={handleFileUpload}
            isLoading={isParsing}
            autoOpen={searchParams.get('upload') === '1'}
          />
          <ResumeForm resumeData={resumeData} setResumeData={setResumeData} />

          {/* Save button */}
          {user && (
            <button
              className="btn btn-secondary btn-lg"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={handleSave}
              disabled={isSaving || !hasContent}
              id="btn-save"
            >
              <Save size={16} />
              {isSaving ? 'Saving…' : currentId ? 'Save Changes' : 'Save Resume'}
            </button>
          )}

          <ActionButtons
            onGenerate={handleGenerate}
            onGrade={handleGrade}
            onSuggestJobs={handleSuggestJobs}
            onDownload={handleDownload}
            loading={loading}
            hasPreview={!!hasContent}
          />
        </aside>

        {/* Preview */}
        <section className="app-content">
          <ResumePreview resumeData={resumeData} />
        </section>
      </main>

      {/* Grade modal */}
      <Modal isOpen={activeModal === 'grade'} onClose={closeModal} title="ATS Resume Grade" icon={BarChart3}>
        <GradeResults gradeData={gradeData} />
      </Modal>

      {/* Jobs modal */}
      <Modal isOpen={activeModal === 'jobs'} onClose={closeModal} title="Job Match Analysis" icon={Compass}>
        <JobSuggestions jobData={jobData} />
      </Modal>

      {/* Auth gate modal — triggered when guest tries to download/save */}
      <AuthModal isOpen={activeModal === 'auth'} onClose={closeModal} />
    </div>
  );
}
