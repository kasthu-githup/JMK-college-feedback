
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  GraduationCap,
  User,
  Mail,
  Lock,
  Phone,
  ArrowRight,
  Camera
} from 'lucide-react';
import './Auth.css';

function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [profileImage, setProfileImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setMessage('Please select a JPG, PNG or WebP image');
      e.target.value = '';
      return;
    }

    if (file.size > 1024 * 1024) {
      setMessage('Image size must be less than 1 MB');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setProfileImage(reader.result);
      setMessage('');
    };

    reader.onerror = () => {
      setMessage('Unable to read selected image');
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (form.password !== form.confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        'http://localhost:5000/api/auth/signup',
        {
          ...form,
          profileImage
        }
      );

      setMessage(response.data.message);

      setTimeout(() => navigate('/login'), 1200);

    } catch (error) {
      setMessage(
        error.response?.data?.message || 'Unable to connect to server'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <GraduationCap size={35} />
          <h2>JMK Education Center</h2>
        </div>

        <h1>Create Account</h1>
        <p>Register to share your college admission experience.</p>

        {message && <div className="auth-message">{message}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ textAlign: 'center', margin: '20px 0' }}>
            <label
              htmlFor="profileImage"
              style={{
                display: 'inline-flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}
            >
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile preview"
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid #15558b'
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: '#eaf2fa',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Camera size={35} color="#15558b" />
                </div>
              )}
            </label>

            <input
              id="profileImage"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
          </div>

          <div className="auth-input">
            <User size={18} />
            <input
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-input">
            <Mail size={18} />
            <input
              name="email"
              type="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-input">
            <Phone size={18} />
            <input
              name="phone"
              placeholder="Phone Number"
              value={form.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-input">
            <Lock size={18} />
            <input
              name="password"
              type="password"
              placeholder="Password (minimum 8 characters)"
              value={form.password}
              onChange={handleChange}
              minLength={8}
              required
            />
          </div>

          <div className="auth-input">
            <Lock size={18} />
            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
            <ArrowRight size={18} />
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>

        <Link to="/" className="auth-back">Back to Home</Link>
      </div>
    </div>
  );
}

export default Signup;
