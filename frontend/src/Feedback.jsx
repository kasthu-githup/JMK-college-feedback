
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft, Send, Star, Camera, CheckCircle,
  Video, GraduationCap, BriefcaseBusiness, FolderKanban
} from 'lucide-react';

const API = 'https://jmk-college-feedback.onrender.com/api';

function Feedback() {
  const navigate = useNavigate();
  const location = useLocation();

  const path = location.pathname;

  const category = path === '/internship-job-feedback'
    ? 'internship'
    : path === '/projects-feedback'
      ? 'project'
      : 'college';

  const [profileLoading, setProfileLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [newPhoto, setNewPhoto] = useState(null);
  const [video, setVideo] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    college_name: '',
    school_name: '',
    department: '',
    admission_year: '',
    agent_name: '',
    guidance_rating: 5,
    communication_rating: 5,
    support_rating: 5,
    company_name: '',
    job_role: '',
    duration: '',
    stipend: '',
    project_title: '',
    domain: '',
    technologies: '',
    guide_name: '',
    overall_rating: 5,
    review: ''
  });

  const titles = {
    college: 'College Feedback',
    internship: 'Internship & Job Feedback',
    project: 'Projects Work Feedback'
  };

  useEffect(() => {
    const token = localStorage.getItem('jmkToken');

    if (!token) {
      navigate('/login');
      return;
    }

    const loadStudent = async () => {
      try {
        const response = await axios.get(`${API}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const student = response.data.student || response.data;
        setSelectedImage(student.profile_image || '');
      } catch (error) {
        console.error('Profile loading error:', error);
        setMessage('Unable to load student profile.');
      } finally {
        setProfileLoading(false);
      }
    };

    loadStudent();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowed.includes(file.type)) {
      setMessage('Select JPG, PNG or WEBP image.');
      e.target.value = '';
      return;
    }

    if (file.size > 1800 * 1024) {
      setMessage('Image size must be below 1.8 MB.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setSelectedImage(reader.result);
      setNewPhoto(reader.result);
      setMessage('');
    };

    reader.readAsDataURL(file);
  };

  const handleVideoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['video/mp4', 'video/webm'];

    if (!allowed.includes(file.type)) {
      setMessage('Select MP4 or WebM video.');
      e.target.value = '';
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setMessage('Video size must be below 20 MB.');
      e.target.value = '';
      return;
    }

    setVideo(file);
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const token = localStorage.getItem('jmkToken');

    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);

      const data = new FormData();

      if (category === 'college') {
        data.append('college_name', form.college_name);
        data.append('school_name', form.school_name);
        data.append('department', form.department);
        data.append('admission_year', form.admission_year);
        data.append('agent_name', form.agent_name);
        data.append('overall_rating', form.overall_rating);
        data.append('guidance_rating', form.guidance_rating);
        data.append('communication_rating', form.communication_rating);
        data.append('support_rating', form.support_rating);
        data.append('review', form.review);

        if (newPhoto) {
          data.append('profile_image', newPhoto);
        }
      }

      if (category === 'internship') {
        data.append('company_name', form.company_name);
        data.append('job_role', form.job_role);
        data.append('duration', form.duration);
        data.append('stipend', form.stipend);
        data.append('overall_rating', form.overall_rating);
        data.append('review', form.review);
      }

      if (category === 'project') {
        data.append('project_title', form.project_title);
        data.append('domain', form.domain);
        data.append('technologies', form.technologies);
        data.append('guide_name', form.guide_name);
        data.append('overall_rating', form.overall_rating);
        data.append('review', form.review);
      }

      if (video) {
        data.append('video', video);
      }

      const endpoint = category === 'college'
        ? '/feedback'
        : category === 'internship'
          ? '/internship'
          : '/projects';

      const response = await axios.post(
        `${API}${endpoint}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setMessage(
        response.data.message || 'Feedback submitted successfully!'
      );

      setSuccess(true);

      setTimeout(() => {
        navigate('/');
      }, 2500);

    } catch (error) {
      console.error('Feedback submission error:', error.response?.data || error);

      setMessage(
        error.response?.data?.message ||
        'Unable to submit feedback. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (profileLoading) {
    return <div style={centerStyle}>Loading student profile...</div>;
  }

  const ratingFields = category === 'college'
    ? [
        ['overall_rating', 'Overall Rating'],
        ['guidance_rating', 'Guidance Rating'],
        ['communication_rating', 'Communication Rating'],
        ['support_rating', 'Support Rating']
      ]
    : [['overall_rating', 'Overall Rating']];

  const CategoryIcon = category === 'college'
    ? GraduationCap
    : category === 'internship'
      ? BriefcaseBusiness
      : FolderKanban;

  return (
    <div style={pageStyle}>
      {success && (
        <div style={successPopupStyle}>
          <CheckCircle size={48} color="#159E9D" />
          <h2 style={{ color: '#174F80' }}>Thank You!</h2>
          <p>Your feedback has been submitted successfully.</p>
          <p style={{ color: '#159E9D' }}>
            Redirecting to Home Page...
          </p>
        </div>
      )}

      <div style={containerStyle}>
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          style={backButtonStyle}
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </button>

        <div style={{ textAlign: 'center', marginTop: 25 }}>
          <CategoryIcon size={42} color="#159E9D" />
          <h1 style={headingStyle}>{titles[category]}</h1>
          <p style={subtitleStyle}>
            Share your genuine experience with other students.
          </p>
        </div>

        {message && <p style={messageStyle}>{message}</p>}

        <form onSubmit={handleSubmit}>
          {category === 'college' && (
            <>
              <label style={labelStyle}>
                <Camera size={17} />
                Upload Student Photo
              </label>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoChange}
                style={inputStyle}
              />

              {selectedImage && (
                <div style={previewStyle}>
                  <img
                    src={selectedImage}
                    alt="Student"
                    style={photoStyle}
                  />
                  <span>Photo Preview</span>
                </div>
              )}

              <label style={labelStyle}>College Name *</label>
              <input
                style={inputStyle}
                name="college_name"
                value={form.college_name}
                onChange={handleChange}
                placeholder="Enter college name"
                required
              />

              <label style={labelStyle}>School Name *</label>
              <input
                style={inputStyle}
                name="school_name"
                value={form.school_name}
                onChange={handleChange}
                placeholder="Enter school name"
                required
              />

              <label style={labelStyle}>Department / Course *</label>
              <input
                style={inputStyle}
                name="department"
                value={form.department}
                onChange={handleChange}
                placeholder="Enter department"
                required
              />

              <label style={labelStyle}>Admission Year *</label>
              <input
                style={inputStyle}
                type="number"
                name="admission_year"
                value={form.admission_year}
                onChange={handleChange}
                min="2000"
                max={new Date().getFullYear()}
                placeholder="Enter admission year"
                required
              />

              <label style={labelStyle}>Admission Agent Name *</label>
              <input
                style={inputStyle}
                name="agent_name"
                value={form.agent_name}
                onChange={handleChange}
                placeholder="Enter agent name"
                required
              />
            </>
          )}

          {category === 'internship' && (
            <>
              <label style={labelStyle}>Company Name *</label>
              <input
                style={inputStyle}
                name="company_name"
                value={form.company_name}
                onChange={handleChange}
                placeholder="Enter company name"
                required
              />

              <label style={labelStyle}>Job Role / Internship Role</label>
              <input
                style={inputStyle}
                name="job_role"
                value={form.job_role}
                onChange={handleChange}
                placeholder="Example: Web Developer Intern"
              />

              <label style={labelStyle}>Duration</label>
              <input
                style={inputStyle}
                name="duration"
                value={form.duration}
                onChange={handleChange}
                placeholder="Example: 1 month"
              />

              <label style={labelStyle}>Stipend / Salary (Optional)</label>
              <input
                style={inputStyle}
                name="stipend"
                value={form.stipend}
                onChange={handleChange}
                placeholder="Optional"
              />
            </>
          )}

          {category === 'project' && (
            <>
              <label style={labelStyle}>Project Title *</label>
              <input
                style={inputStyle}
                name="project_title"
                value={form.project_title}
                onChange={handleChange}
                placeholder="Enter project title"
                required
              />

              <label style={labelStyle}>Project Domain</label>
              <input
                style={inputStyle}
                name="domain"
                value={form.domain}
                onChange={handleChange}
                placeholder="Example: Web Development"
              />

              <label style={labelStyle}>Technologies Used</label>
              <input
                style={inputStyle}
                name="technologies"
                value={form.technologies}
                onChange={handleChange}
                placeholder="Example: React, Node.js, PostgreSQL"
              />

              <label style={labelStyle}>Guide / Organization Name</label>
              <input
                style={inputStyle}
                name="guide_name"
                value={form.guide_name}
                onChange={handleChange}
                placeholder="Enter guide name"
              />
            </>
          )}

          <h3 style={sectionHeadingStyle}>Rate Your Experience</h3>

          {ratingFields.map(([name, label]) => (
            <div key={name}>
              <label style={labelStyle}>
                <Star size={17} color="#FF8045" />
                {label}
              </label>

              <select
                style={inputStyle}
                name={name}
                value={form[name]}
                onChange={handleChange}
              >
                {[5, 4, 3, 2, 1].map(rating => (
                  <option key={rating} value={rating}>
                    {rating} / 5
                  </option>
                ))}
              </select>
            </div>
          ))}

          <label style={labelStyle}>
            <Video size={17} />
            Upload Experience Video (Optional)
          </label>

          <input
            type="file"
            accept="video/mp4,video/webm"
            onChange={handleVideoChange}
            style={inputStyle}
          />

          <small style={helperStyle}>
            MP4 or WebM. Maximum size: 20 MB.
          </small>

          {video && (
            <p style={{ color: '#159E9D' }}>
              Selected video: {video.name}
            </p>
          )}

          <label style={labelStyle}>Your Written Feedback *</label>

          <textarea
            style={textareaStyle}
            name="review"
            value={form.review}
            onChange={handleChange}
            placeholder="Write about your experience..."
            minLength={5}
            required
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              ...submitButtonStyle,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            <Send size={17} />
            {loading ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: '100vh',
  background: '#F3EDE2',
  padding: '35px 16px',
  fontFamily: 'Arial, sans-serif'
};

const containerStyle = {
  maxWidth: '750px',
  margin: 'auto',
  background: '#FFFFFF',
  padding: '30px',
  borderRadius: '16px',
  border: '1px solid #DCE5EC',
  boxShadow: '0 8px 25px rgba(23, 79, 128, 0.10)'
};

const centerStyle = {
  padding: '40px',
  textAlign: 'center',
  color: '#174F80',
  background: '#F3EDE2',
  minHeight: '100vh'
};

const headingStyle = {
  color: '#174F80',
  marginBottom: '8px'
};

const subtitleStyle = {
  color: '#64748B'
};

const labelStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '7px',
  fontWeight: '600',
  color: '#174F80',
  marginTop: '18px',
  marginBottom: '8px'
};

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '13px',
  border: '1px solid #DCE5EC',
  borderRadius: '8px',
  fontSize: '15px',
  color: '#263B50',
  background: '#FFFFFF'
};

const textareaStyle = {
  ...inputStyle,
  minHeight: '120px',
  resize: 'vertical'
};

const backButtonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '11px 18px',
  border: 'none',
  borderRadius: '8px',
  background: '#174F80',
  color: '#FFFFFF',
  cursor: 'pointer'
};

const submitButtonStyle = {
  ...backButtonStyle,
  width: '100%',
  marginTop: '22px',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #159E9D, #174F80)',
  fontWeight: '600',
  fontSize: '15px'
};

const photoStyle = {
  width: '75px',
  height: '75px',
  borderRadius: '50%',
  objectFit: 'cover',
  border: '3px solid #159E9D'
};

const previewStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
  padding: '12px',
  marginTop: '12px',
  background: '#F0F7F8',
  borderRadius: '10px',
  color: '#159E9D'
};

const helperStyle = {
  display: 'block',
  color: '#64748B',
  marginTop: '7px'
};

const messageStyle = {
  background: '#E5F5F2',
  color: '#117C79',
  padding: '12px',
  borderRadius: '8px',
  marginTop: '15px'
};

const sectionHeadingStyle = {
  color: '#174F80',
  marginTop: '25px'
};

const successPopupStyle = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  background: '#FFFFFF',
  padding: '28px',
  borderRadius: '18px',
  boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
  textAlign: 'center',
  width: 'min(330px, 80vw)',
  zIndex: 1001
};

export default Feedback;
