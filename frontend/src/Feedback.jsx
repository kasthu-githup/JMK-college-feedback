
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Send, Star, Camera, CheckCircle } from 'lucide-react';

function Feedback() {
  const navigate = useNavigate();

  const [profileLoading, setProfileLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [newPhoto, setNewPhoto] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!success) return;

    const colors = ['#FF8045', '#159E9D', '#174F80', '#FFD166', '#E879F9'];

    const pieces = Array.from({ length: 90 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 2.5 + Math.random() * 2,
      color: colors[i % colors.length],
      rotation: Math.random() * 360
    }));

    setConfetti(pieces);

    const timer = setTimeout(() => {
      setSuccess(false);
      setConfetti([]);
    }, 5500);

    return () => clearTimeout(timer);
  }, [success]);

  const [confetti, setConfetti] = useState([]);

  const [form, setForm] = useState({
    college_name: '',
    department: '',
    admission_year: '',
    agent_name: '',
    overall_rating: 5,
    guidance_rating: 5,
    communication_rating: 5,
    support_rating: 5,
    review: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('jmkToken');

    if (!token) {
      navigate('/login');
      return;
    }

    const loadStudent = async () => {
      try {
        const response = await axios.get(
          'https://jmk-college-feedback.onrender.com/api/auth/me',
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const studentData = response.data.student || response.data;
        setSelectedImage(studentData.profile_image || '');
      } catch (error) {
        console.error('Student profile loading error:', error);
        setMessage('Unable to load student profile.');
      } finally {
        setProfileLoading(false);
      }
    };

    loadStudent();
  }, [navigate]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      setMessage('Please select JPG, PNG or WEBP image.');
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

    reader.onerror = () => {
      setMessage('Unable to read selected image.');
    };

    reader.readAsDataURL(file);
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

      const response = await axios.post(
        'https://jmk-college-feedback.onrender.com/api/feedback',
        {
          ...form,
          admission_year: Number(form.admission_year),
          overall_rating: Number(form.overall_rating),
          guidance_rating: Number(form.guidance_rating),
          communication_rating: Number(form.communication_rating),
          support_rating: Number(form.support_rating),
          profile_image: newPhoto || null
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setMessage(
        response.data.message || 'Feedback submitted successfully.'
      );

      setSuccess(true);
      setNewPhoto('');

      setForm({
        college_name: '',
        department: '',
        admission_year: '',
        agent_name: '',
        overall_rating: 5,
        guidance_rating: 5,
        communication_rating: 5,
        support_rating: 5,
        review: ''
      });

    } catch (error) {
      setMessage(
        error.response?.data?.message || 'Unable to submit feedback'
      );
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    ['overall_rating', 'Overall Rating'],
    ['guidance_rating', 'Guidance Rating'],
    ['communication_rating', 'Communication Rating'],
    ['support_rating', 'Support Rating']
  ];

  if (profileLoading) {
    return <div style={centerStyle}>Loading student profile...</div>;
  }

  return (
    <div style={pageStyle}>

      {success && (
        <>
          <style>
            {`
              @keyframes confettiFall {
                0% {
                  transform: translateY(-10vh) rotate(0deg);
                  opacity: 1;
                }
                100% {
                  transform: translateY(110vh) rotate(720deg);
                  opacity: 0;
                }
              }
              @keyframes successPop {
                0% { transform: scale(0.5); opacity: 0; }
                70% { transform: scale(1.08); opacity: 1; }
                100% { transform: scale(1); opacity: 1; }
              }
            `}
          </style>

          <div style={confettiLayerStyle}>
            {confetti.map((piece) => (
              <span
                key={piece.id}
                style={{
                  position: 'absolute',
                  left: `${piece.left}%`,
                  top: '-20px',
                  width: '10px',
                  height: '15px',
                  background: piece.color,
                  borderRadius: '2px',
                  transform: `rotate(${piece.rotation}deg)`,
                  animation: `confettiFall ${piece.duration}s ${piece.delay}s linear forwards`
                }}
              />
            ))}
          </div>

          <div style={successPopupStyle}>
            <CheckCircle size={48} color="#159E9D" />
            <h2 style={{ color: '#174F80', margin: '12px 0 5px' }}>
              Thank You!
            </h2>
            <p style={{ color: '#64748B', margin: 0 }}>
              Your feedback has been submitted successfully.
            </p>
            <div style={{ fontSize: 26, marginTop: 12 }}>🎉 🎊 ✨</div>
          </div>
        </>
      )}

      <div style={containerStyle}>

        <button
          onClick={() => navigate('/dashboard')}
          style={buttonStyle}
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </button>

        <h1 style={headingStyle}>Student Feedback Form</h1>

        <p style={subtitleStyle}>
          Share your college admission experience with us.
        </p>

        {message && (
          <p style={messageStyle}>{message}</p>
        )}

        <form onSubmit={handleSubmit}>

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

          <small style={helperStyle}>
            JPG, PNG or WEBP. Maximum size: 1.8 MB.
          </small>

          {selectedImage && (
            <div style={previewBoxStyle}>
              <img
                src={selectedImage}
                alt="Student photo preview"
                style={photoStyle}
              />
              <span style={{ color: '#159E9D', fontWeight: '600' }}>
                Photo Preview
              </span>
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

          <label style={labelStyle}>Department / Course *</label>
          <input
            style={inputStyle}
            name="department"
            value={form.department}
            onChange={handleChange}
            placeholder="Enter department or course name"
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

          <h3 style={sectionHeadingStyle}>Rate Your Experience</h3>

          {fields.map(([name, label]) => (
            <div key={name} style={{ marginBottom: '18px' }}>
              <label style={labelStyle}>{label}</label>

              <div style={ratingRowStyle}>
                <Star size={19} color="#FF8045" />

                <select
                  style={inputStyle}
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                >
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <option key={rating} value={rating}>
                      {rating} / 5
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}

          <label style={labelStyle}>Your Written Feedback *</label>
          <textarea
            style={textareaStyle}
            name="review"
            value={form.review}
            onChange={handleChange}
            placeholder="Write about your admission experience..."
            required
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              ...buttonStyle,
              width: '100%',
              marginTop: '20px',
              justifyContent: 'center',
              opacity: loading ? 0.6 : 1
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
  marginTop: '25px'
};

const subtitleStyle = { color: '#64748B' };

const photoStyle = {
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  objectFit: 'contain',
  border: '3px solid #159E9D',
  background: '#F3EDE2'
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
  outline: 'none',
  color: '#263B50',
  background: '#FFFFFF'
};

const textareaStyle = {
  ...inputStyle,
  minHeight: '120px',
  resize: 'vertical'
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

const helperStyle = {
  display: 'block',
  color: '#64748B',
  marginTop: '7px'
};

const previewBoxStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
  background: '#F0F7F8',
  padding: '14px',
  borderRadius: '10px',
  marginTop: '12px'
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

const ratingRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px'
};

const confettiLayerStyle = {
  position: 'fixed',
  inset: 0,
  pointerEvents: 'none',
  overflow: 'hidden',
  zIndex: 1000
};

const successPopupStyle = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  animation: 'successPop 0.5s ease-out',
  background: '#FFFFFF',
  padding: '28px',
  borderRadius: '18px',
  boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
  textAlign: 'center',
  width: 'min(330px, 80vw)',
  zIndex: 1001
};

export default Feedback;
