import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft,
  ClipboardList,
  Star,
  GraduationCap,
  BriefcaseBusiness,
  FolderKanban
} from 'lucide-react';

const API = 'https://jmk-college-feedback.onrender.com/api';

function MyFeedback() {
  const navigate = useNavigate();

  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchFeedback = async () => {
      const token = localStorage.getItem('jmkToken');

      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const headers = {
          Authorization: `Bearer ${token}`
        };

        const [college, internship, projects] = await Promise.all([
          axios.get(`${API}/api/feedback/my`, { headers }),
          axios.get(`${API}/api/internship/my`, { headers }),
          axios.get(`${API}/api/projects/my`, { headers })
        ]);

        const allFeedbacks = [
          ...college.data.map(item => ({
            ...item,
            category: 'college'
          })),
          ...internship.data.map(item => ({
            ...item,
            category: 'internship'
          })),
          ...projects.data.map(item => ({
            ...item,
            category: 'project'
          }))
        ];

        allFeedbacks.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );

        setFeedbacks(allFeedbacks);
      } catch (error) {
        console.error('My Feedback Error:', error);

        setMessage(
          error.response?.data?.message ||
          'Unable to load feedback. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [navigate]);

  const categoryInfo = {
    college: {
      title: 'College Feedback',
      icon: GraduationCap,
      color: '#174F80'
    },
    internship: {
      title: 'Internship & Job Feedback',
      icon: BriefcaseBusiness,
      color: '#159E9D'
    },
    project: {
      title: 'Projects Work Feedback',
      icon: FolderKanban,
      color: '#8B5CF6'
    }
  };

  const statusStyle = status => ({
    display: 'inline-block',
    padding: '6px 13px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
    textTransform: 'capitalize',
    background:
      status === 'approved' ? '#DDF4E5' :
      status === 'rejected' ? '#FCE4E4' : '#FFF0D5',
    color:
      status === 'approved' ? '#166534' :
      status === 'rejected' ? '#991B1B' : '#92400E'
  });

  const detailStyle = {
    color: '#475569',
    lineHeight: 1.7,
    margin: '8px 0'
  };

  const renderFeedback = item => {
    const info = categoryInfo[item.category];
    const CategoryIcon = info.icon;

    return (
      <div key={`${item.category}-${item.id}`} style={cardStyle}>

        <div style={headerStyle}>
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '9px',
              color: info.color
            }}>
              <CategoryIcon size={25} />
              <strong>{info.title}</strong>
            </div>

            <h2 style={{
              color: '#174F80',
              marginTop: '12px'
            }}>
              {item.category === 'college'
                ? item.college_name
                : item.category === 'internship'
                  ? item.company_name
                  : item.project_title}
            </h2>
          </div>

          {item.category === 'college' && item.status && (
            <span style={statusStyle(item.status)}>
              {item.status}
            </span>
          )}
        </div>

        {item.category === 'college' && (
          <>
            <p style={detailStyle}>
              <strong>Department:</strong> {item.department}
            </p>
            <p style={detailStyle}>
              <strong>Admission Year:</strong> {item.admission_year}
            </p>
            <p style={detailStyle}>
              <strong>Agent Name:</strong> {item.agent_name}
            </p>
            <p style={detailStyle}>
              <strong>Guidance:</strong> {item.guidance_rating}/5
            </p>
            <p style={detailStyle}>
              <strong>Communication:</strong> {item.communication_rating}/5
            </p>
            <p style={detailStyle}>
              <strong>Support:</strong> {item.support_rating}/5
            </p>
          </>
        )}

        {item.category === 'internship' && (
          <>
            <p style={detailStyle}>
              <strong>Company:</strong> {item.company_name}
            </p>
            <p style={detailStyle}>
              <strong>Job Role:</strong> {item.job_role || 'Not specified'}
            </p>
            <p style={detailStyle}>
              <strong>Duration:</strong> {item.duration || 'Not specified'}
            </p>
            <p style={detailStyle}>
              <strong>Stipend / Salary:</strong> {item.stipend || 'Not specified'}
            </p>
          </>
        )}

        {item.category === 'project' && (
          <>
            <p style={detailStyle}>
              <strong>Domain:</strong> {item.domain || 'Not specified'}
            </p>
            <p style={detailStyle}>
              <strong>Technologies:</strong> {item.technologies || 'Not specified'}
            </p>
            <p style={detailStyle}>
              <strong>Guide:</strong> {item.guide_name || 'Not specified'}
            </p>
          </>
        )}

        <p style={{
          ...detailStyle,
          display: 'flex',
          alignItems: 'center',
          gap: '7px'
        }}>
          <Star size={18} color="#FF8045" />
          <strong>Overall Rating:</strong> {item.overall_rating}/5
        </p>

        <div style={reviewStyle}>
          <strong style={{ color: '#174F80' }}>
            Your Review
          </strong>

          <p style={{
            color: '#475569',
            lineHeight: 1.7,
            marginTop: '8px'
          }}>
            {item.review}
          </p>
        </div>

        {item.video_url && (
          <div style={{ marginTop: '15px' }}>
            <strong style={{ color: '#174F80' }}>
              Experience Video
            </strong>
            <video
              controls
              src={item.video_url}
              style={{
                width: '100%',
                maxHeight: '300px',
                marginTop: '10px',
                borderRadius: '10px'
              }}
            />
          </div>
        )}

        <small style={{
          color: '#64748B',
          display: 'block',
          marginTop: '18px'
        }}>
          Submitted: {new Date(item.created_at).toLocaleDateString()}
        </small>

      </div>
    );
  };

  return (
    <div style={pageStyle}>
      <div style={{ maxWidth: '950px', margin: 'auto' }}>

        <button
          onClick={() => navigate('/dashboard')}
          style={buttonStyle}
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </button>

        <h1 style={titleStyle}>
          <ClipboardList size={30} color="#159E9D" />
          My Feedback
        </h1>

        <p style={{ color: '#64748B' }}>
          View all your submitted College, Internship and Project Feedback.
        </p>

        {!loading && !message && (
          <div style={statsStyle}>
            <div>
              <h2>{feedbacks.length}</h2>
              <span>Total Submissions</span>
            </div>
            <div>
              <h2>{feedbacks.filter(x => x.category === 'college').length}</h2>
              <span>College</span>
            </div>
            <div>
              <h2>{feedbacks.filter(x => x.category === 'internship').length}</h2>
              <span>Internship</span>
            </div>
            <div>
              <h2>{feedbacks.filter(x => x.category === 'project').length}</h2>
              <span>Projects</span>
            </div>
          </div>
        )}

        {loading && <p>Loading your feedback...</p>}

        {message && (
          <p style={errorStyle}>{message}</p>
        )}

        {!loading && !message && feedbacks.length === 0 && (
          <div style={emptyStyle}>
            <ClipboardList size={45} color="#159E9D" />
            <h3>No Feedback Submitted Yet</h3>
            <p>Your submitted feedback will appear here.</p>
            <button
              style={buttonStyle}
              onClick={() => navigate('/submit-feedback')}
            >
              Submit College Feedback
            </button>
          </div>
        )}

        <div style={{
          display: 'grid',
          gap: '20px',
          marginTop: '25px'
        }}>
          {feedbacks.map(renderFeedback)}
        </div>

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

const titleStyle = {
  color: '#174F80',
  marginTop: '25px',
  display: 'flex',
  alignItems: 'center',
  gap: '10px'
};

const buttonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '11px 18px',
  border: 'none',
  borderRadius: '8px',
  background: 'linear-gradient(135deg, #159E9D, #174F80)',
  color: '#FFFFFF',
  fontWeight: '600',
  cursor: 'pointer'
};

const cardStyle = {
  background: '#FFFFFF',
  padding: '25px',
  borderRadius: '14px',
  border: '1px solid #DCE5EC',
  boxShadow: '0 8px 25px rgba(23, 79, 128, 0.10)'
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '12px'
};

const reviewStyle = {
  background: '#F0F7F8',
  padding: '15px',
  borderRadius: '9px',
  marginTop: '15px',
  borderLeft: '4px solid #159E9D'
};

const statsStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
  gap: '12px',
  marginTop: '25px'
};

const emptyStyle = {
  background: '#FFFFFF',
  padding: '40px 20px',
  marginTop: '25px',
  borderRadius: '14px',
  textAlign: 'center'
};

const errorStyle = {
  background: '#FCE4E4',
  color: '#991B1B',
  padding: '12px',
  borderRadius: '8px'
};

export default MyFeedback;