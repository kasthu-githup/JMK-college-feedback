
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  GraduationCap,
  Mail,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeClosed
} from 'lucide-react';
import './Auth.css';

function Login() {
  const navigate = useNavigate();

  const [role, setRole] = useState('student');
  const [form, setForm] = useState({
    email: '',
    username: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      setLoading(true);
const endpoint = role === 'student'
  ? 'https://jmk-college-feedback.onrender.com/api/auth/login'
  : 'https://jmk-college-feedback.onrender.com/api/admin/login';

const payload = role === 'student'
  ? { email: form.email.trim(), password: form.password }
  : { username: form.username.trim(), password: form.password };

const response = await axios.post(endpoint, payload);
      if (role === 'student') {
        localStorage.setItem('jmkToken', response.data.token);
        localStorage.setItem(
          'jmkStudent',
          JSON.stringify(response.data.student)
        );
        localStorage.removeItem('jmkAdminToken');
        navigate('/dashboard');
      } else {
        localStorage.setItem('jmkAdminToken', response.data.token);
        localStorage.setItem(
          'jmkAdmin',
          JSON.stringify(response.data.admin)
        );
        localStorage.removeItem('jmkToken');
        localStorage.removeItem('jmkStudent');
        navigate('/admin-dashboard');
      }

    } catch (error) {
      setMessage(
        error.response?.data?.message || 'Unable to connect to server'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (nextRole) => {
    setRole(nextRole);
    setForm({ email: '', username: '', password: '' });
    setShowPassword(false);
    setMessage('');
  };

  const smallIconStyle = {
    width: 16,
    height: 16,
    minWidth: 16,
    color: '#718096',
    strokeWidth: 1.8
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-logo">
          <GraduationCap size={42} />
          <h2>JMK Education Center</h2>
        </div>

        <h1>Welcome Back</h1>
        <p>Login to your JMK account</p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
          margin: '25px 0'
        }}>
          <button
            type="button"
            onClick={() => handleRoleChange('student')}
            style={{
              padding: 13,
              borderRadius: 9,
              border: role === 'student' ? '2px solid #174A7B' : '1px solid #ddd',
              background: role === 'student' ? '#eaf3fb' : '#fff',
              color: '#174A7B',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <GraduationCap size={19} /> Student
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange('admin')}
            style={{
              padding: 13,
              borderRadius: 9,
              border: role === 'admin' ? '2px solid #119E9D' : '1px solid #ddd',
              background: role === 'admin' ? '#e8f8f7' : '#fff',
              color: '#087e8b',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <ShieldCheck size={19} /> Admin
          </button>
        </div>

        {message && (
          <div className="auth-message">{message}</div>
        )}

        <form onSubmit={handleSubmit}>

          {role === 'student' ? (
            <div className="auth-input">
              <Mail style={smallIconStyle} />
              <input
                type="email"
                placeholder="Student Email Address"
                value={form.email}
                onChange={(e) => setForm({
                  ...form,
                  email: e.target.value
                })}
                required
              />
            </div>
          ) : (
            <div className="auth-input">
              <User style={smallIconStyle} />
              <input
                type="text"
                placeholder="Admin Username"
                value={form.username}
                onChange={(e) => setForm({
                  ...form,
                  username: e.target.value
                })}
                required
              />
            </div>
          )}

          <div className="auth-input">
            <Lock style={smallIconStyle} />

            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({
                ...form,
                password: e.target.value
              })}
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              style={{
                background: 'none',
                border: 'none',
                outline: 'none',
                boxShadow: 'none',
                padding: '4px',
                margin: 0,
                color: '#718096',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 'auto'
              }}
            >
              {showPassword
                ? <Eye size={17} strokeWidth={1.8} />
                : <EyeClosed size={17} strokeWidth={1.8} />
              }
            </button>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : `Login as ${role === 'student' ? 'Student' : 'Admin'}`}
            <ArrowRight size={18} />
          </button>
        </form>

        {role === 'student' && (
          <p className="auth-switch">
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </p>
        )}

        <Link to="/" className="auth-back">Back to Home</Link>
      </div>
    </div>
  );
}

export default Login;
