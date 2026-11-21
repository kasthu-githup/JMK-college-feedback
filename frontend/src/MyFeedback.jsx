
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, ClipboardList, Star } from 'lucide-react';

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
        const response = await axios.get(
          'http://localhost:5000/api/feedback/my',
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setFeedbacks(response.data);
      } catch (error) {
        setMessage(
          error.response?.data?.message ||
          'Unable to load feedback'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [navigate]);

  const statusStyle = (status) => ({
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

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F3EDE2',
      padding: '35px 16px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ maxWidth: '950px', margin: 'auto' }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={buttonStyle}
        >
          <ArrowLeft size={17} /> Back to Dashboard
        </button>

        <h1 style={{
          color: '#174F80',
          marginTop: '25px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <ClipboardList size={28} color="#159E9D" />
          My Feedback
        </h1>

        <p style={{ color: '#64748B' }}>
          View your submitted college admission feedback.
        </p>

        {loading && (
          <p style={{ color: '#174F80' }}>Loading feedback...</p>
        )}

        {message && (
          <p style={{
            background: '#FCE4E4',
            color: '#991B1B',
            padding: '12px',
            borderRadius: '8px'
          }}>
            {message}
          </p>
        )}

        {!loading && !message && feedbacks.length === 0 && (
          <div style={emptyStyle}>
            <ClipboardList size={45} color="#159E9D" />
            <h3 style={{ color: '#174F80' }}>
              No Feedback Submitted Yet
            </h3>
            <p style={{ color: '#64748B' }}>
              Your submitted feedback will appear here.
            </p>
            <button
              style={buttonStyle}
              onClick={() => navigate('/submit-feedback')}
            >
              Submit Feedback
            </button>
          </div>
        )}

        <div style={{
          display: 'grid',
          gap: '20px',
          marginTop: '25px'
        }}>
          {feedbacks.map((item) => (
            <div key={item.id} style={cardStyle}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <h2 style={{ color: '#174F80', margin: 0 }}>
                  {item.college_name}
                </h2>

                <span style={statusStyle(item.status)}>
                  {item.status}
                </span>
              </div>

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
                <Star size={17} color="#FF8045" />
                <strong> Overall Rating:</strong> {item.overall_rating}/5
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

              <div style={{
                background: '#F0F7F8',
                padding: '15px',
                borderRadius: '9px',
                marginTop: '15px',
                borderLeft: '4px solid #159E9D'
              }}>
                <strong style={{ color: '#174F80' }}>
                  Your Review
                </strong>
                <p style={{
                  color: '#475569',
                  lineHeight: 1.6,
                  marginTop: '8px'
                }}>
                  {item.review}
                </p>
              </div>

              <small style={{ color: '#64748B' }}>
                Submitted: {new Date(item.created_at).toLocaleDateString()}
              </small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const detailStyle = {
  color: '#475569',
  lineHeight: 1.6
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

const emptyStyle = {
  background: '#FFFFFF',
  padding: '40px 20px',
  marginTop: '25px',
  borderRadius: '14px',
  border: '1px solid #DCE5EC',
  textAlign: 'center'
};

export default MyFeedback;
