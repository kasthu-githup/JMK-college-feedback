
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  MessageSquare,
  ClipboardList,
  LogOut,
  User
} from 'lucide-react';

function Dashboard() {
  const navigate = useNavigate();

  const student = JSON.parse(
    localStorage.getItem('jmkStudent') || '{}'
  );

  const handleLogout = () => {
    localStorage.removeItem('jmkToken');
    localStorage.removeItem('jmkStudent');
    navigate('/login');
  };

  const cardStyle = {
    background: '#FFFFFF',
    padding: '30px 24px',
    borderRadius: '16px',
    boxShadow: '0 8px 25px rgba(23, 79, 128, 0.10)',
    border: '1px solid #DCE5EC',
    textAlign: 'center',
    minWidth: 0
  };

  const buttonStyle = {
    background: 'linear-gradient(135deg, #159E9D, #174F80)',
    color: '#FFFFFF',
    border: 'none',
    padding: '12px 22px',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '12px'
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: '#F3EDE2',
      fontFamily: 'Arial, sans-serif'
    }}>
      <header style={{
        background: '#174F80',
        color: '#FFFFFF',
        padding: '20px 6%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '15px',
        boxShadow: '0 4px 15px rgba(23, 79, 128, 0.15)'
      }}>
        <h2 style={{
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          margin: 0
        }}>
          <GraduationCap size={28} color="#FF8045" />
          JMK Education Center
        </h2>

        <button onClick={handleLogout} style={buttonStyle}>
          <LogOut size={16} /> Logout
        </button>
      </header>

      <main style={{
        maxWidth: '1200px',
        margin: 'auto',
        padding: '55px 25px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '42px',
            color: '#174F80'
          }}>
            Welcome, {student.name || 'Student'}!
          </h1>
          <p style={{ fontSize: '19px', color: '#64748B' }}>
            Student Feedback Dashboard
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '25px'
        }}>
          <div style={cardStyle}>
            <User size={34} color="#159E9D" />
            <h3 style={{ color: '#174F80' }}>My Profile</h3>
            <p style={{
              color: '#64748B',
              overflowWrap: 'anywhere',
              lineHeight: 1.6
            }}>
              {student.email || 'Student Email'}
            </p>
          </div>

          <div style={cardStyle}>
            <MessageSquare size={34} color="#159E9D" />
            <h3 style={{ color: '#174F80' }}>Submit Feedback</h3>
            <p style={{ color: '#64748B', lineHeight: 1.6 }}>
              Share your college admission experience.
            </p>
            <button
              style={buttonStyle}
              onClick={() => navigate('/submit-feedback')}
            >
              Submit Now
            </button>
          </div>

          <div style={cardStyle}>
            <ClipboardList size={34} color="#FF8045" />
            <h3 style={{ color: '#174F80' }}>My Feedback</h3>
            <p style={{ color: '#64748B', lineHeight: 1.6 }}>
              View your submitted feedback and status.
            </p>
            <button
              style={buttonStyle}
              onClick={() => navigate('/my-feedback')}
            >
              View Feedback
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
