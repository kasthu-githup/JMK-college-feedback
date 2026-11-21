
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  ShieldCheck,
  Lock,
  User,
  ArrowRight,
  GraduationCap
} from 'lucide-react';
import './AdminLogin.css';

function AdminLogin() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/admin/login',
        {
          username: username.trim(),
          password
        }
      );

      localStorage.setItem('jmkAdminToken', response.data.token);
      localStorage.setItem(
        'jmkAdmin',
        JSON.stringify(response.data.admin)
      );

      navigate('/admin-dashboard');

    } catch (err) {
      setError(
        err.response?.data?.message || 'Unable to connect to server'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">

        <Link to="/" className="admin-brand">
          <GraduationCap size={27} />
          <span>JMK <small>EDUCATION CENTER</small></span>
        </Link>

        <div className="admin-shield">
          <ShieldCheck size={42} />
        </div>

        <h1>Welcome Back</h1>
        <p className="admin-subtitle">
          Sign in to your JMK Admin Dashboard
        </p>

        <div className="admin-security">
          <Lock size={15} />
          Secure Administrator Access
        </div>

        <form onSubmit={handleLogin}>
          <label>Admin Username</label>
          <div className="admin-input">
            <User size={19} />
            <input
              type="email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your admin email"
              autoComplete="username"
              required
            />
          </div>

          <label>Admin Password</label>
          <div className="admin-input">
            <Lock size={19} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div className="admin-error">{error}</div>
          )}

          <button
            type="submit"
            className="admin-login-button"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In to Dashboard'}
            {!loading && <ArrowRight size={19} />}
          </button>
        </form>

        <div className="admin-footer">
          <ShieldCheck size={16} />
          Authorized administrators only
        </div>

        <Link to="/" className="admin-back">
          Back to Home
        </Link>

      </div>
    </div>
  );
}

export default AdminLogin;
