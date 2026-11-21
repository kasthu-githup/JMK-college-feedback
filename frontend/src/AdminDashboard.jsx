
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ShieldCheck,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  LogOut,
  RefreshCw,
  Trash2,
  Search
} from 'lucide-react';

function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total_feedback: 0,
    pending_feedback: 0,
    approved_feedback: 0,
    rejected_feedback: 0
  });

  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const token = localStorage.getItem('jmkAdminToken');

  const api = axios.create({
    baseURL: 'http://localhost:5000/api/admin',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');

      const [statsResponse, feedbackResponse] = await Promise.all([
        api.get('/dashboard'),
        api.get('/feedback')
      ]);

      setStats(statsResponse.data);
      setFeedback(feedbackResponse.data);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Unable to load dashboard'
      );

      if (
        err.response?.status === 401 ||
        err.response?.status === 403
      ) {
        localStorage.removeItem('jmkAdminToken');
        localStorage.removeItem('jmkAdmin');
        navigate('/admin-login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    loadDashboard();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/feedback/${id}/status`, { status });
      await loadDashboard();
    } catch (err) {
      alert(
        err.response?.data?.message || 'Status update failed'
      );
    }
  };

  const deleteFeedback = async (id) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this feedback permanently?'
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/feedback/${id}`);
      alert('Feedback deleted successfully!');
      await loadDashboard();
    } catch (err) {
      alert(
        err.response?.data?.message || 'Unable to delete feedback'
      );
    }
  };

  const logout = () => {
    localStorage.removeItem('jmkAdminToken');
    localStorage.removeItem('jmkAdmin');
    navigate('/login');
  };

  const departments = [
    ...new Set(
      feedback
        .map((item) => item.department)
        .filter(Boolean)
    )
  ];

  const filteredFeedback = feedback.filter((item) => {
    const matchesName = (item.student_name || '')
      .toLowerCase()
      .includes(searchTerm.toLowerCase().trim());

    const matchesDepartment =
      departmentFilter === 'all' ||
      item.department === departmentFilter;

    const matchesStatus =
      statusFilter === 'all' ||
      item.status === statusFilter;

    return matchesName && matchesDepartment && matchesStatus;
  });

  if (loading) {
    return (
      <div style={styles.center}>
        Loading Admin Dashboard...
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.brand}>
          <ShieldCheck size={32} />
          <div>
            <h2 style={{ margin: 0, color: '#FFFFFF' }}>
              JMK Admin Panel
            </h2>
            <small>Student Feedback Management</small>
          </div>
        </div>

        <button style={styles.logout} onClick={logout}>
          <LogOut size={17} /> Logout
        </button>
      </header>

      <main style={styles.container}>
        <h1 style={styles.heading}>Dashboard Overview</h1>

        <p style={styles.subtitle}>
          Review and manage student feedback submissions.
        </p>

        {error && <p style={styles.error}>{error}</p>}

        <div style={styles.statsGrid}>
          <StatCard
            title="Total Feedback"
            value={stats.total_feedback}
            icon={<MessageSquare />}
          />

          <StatCard
            title="Pending"
            value={stats.pending_feedback}
            icon={<Clock />}
          />

          <StatCard
            title="Approved"
            value={stats.approved_feedback}
            icon={<CheckCircle />}
          />

          <StatCard
            title="Rejected"
            value={stats.rejected_feedback}
            icon={<XCircle />}
          />
        </div>

        <div style={styles.sectionHeader}>
          <h2>Student Feedback</h2>

          <button style={styles.refresh} onClick={loadDashboard}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {/* SEARCH AND FILTER */}
        <div style={styles.filterBox}>
          <div style={styles.searchBox}>
            <Search size={19} color="#159E9D" />

            <input
              type="text"
              placeholder="Search student name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">All Departments</option>

            {departments.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <p style={styles.resultCount}>
          Showing {filteredFeedback.length} of {feedback.length} feedback submissions
        </p>

        {filteredFeedback.length === 0 ? (
          <div style={styles.empty}>
            No matching feedback found.
          </div>
        ) : (
          filteredFeedback.map((item) => (
            <div key={item.id} style={styles.card}>
              <div style={styles.cardTop}>
                <div style={styles.studentInfo}>
                  {item.profile_image ? (
                    <img
                      src={item.profile_image}
                      alt={item.student_name}
                      style={styles.studentPhoto}
                    />
                  ) : (
                    <div style={styles.studentAvatar}>
                      {item.student_name?.charAt(0)?.toUpperCase()}
                    </div>
                  )}

                  <div>
                    <h3>{item.student_name}</h3>
                    <p style={styles.muted}>
                      {item.college_name}
                    </p>
                  </div>
                </div>

                <span
                  style={{
                    ...styles.status,
                    background:
                      item.status === 'approved'
                        ? '#dcfce7'
                        : item.status === 'rejected'
                        ? '#fee2e2'
                        : '#fef3c7',
                    color:
                      item.status === 'approved'
                        ? '#166534'
                        : item.status === 'rejected'
                        ? '#991b1b'
                        : '#92400e'
                  }}
                >
                  {item.status}
                </span>
              </div>

              <p><b>Department:</b> {item.department}</p>
              <p><b>Admission Year:</b> {item.admission_year}</p>
              <p><b>Agent:</b> {item.agent_name}</p>
              <p><b>Overall Rating:</b> {item.overall_rating}/5</p>
              <p><b>Guidance:</b> {item.guidance_rating}/5</p>
              <p><b>Communication:</b> {item.communication_rating}/5</p>
              <p><b>Support:</b> {item.support_rating}/5</p>

              <p style={styles.review}>
                {item.review}
              </p>

              <small style={styles.muted}>
                {new Date(item.created_at).toLocaleString()}
              </small>

              <div style={styles.actions}>
                {item.status === 'pending' && (
                  <>
                    <button
                      style={styles.approve}
                      onClick={() =>
                        updateStatus(item.id, 'approved')
                      }
                    >
                      <CheckCircle size={16} /> Approve
                    </button>

                    <button
                      style={styles.reject}
                      onClick={() =>
                        updateStatus(item.id, 'rejected')
                      }
                    >
                      <XCircle size={16} /> Reject
                    </button>
                  </>
                )}

                <button
                  style={styles.delete}
                  onClick={() => deleteFeedback(item.id)}
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statIcon}>{icon}</div>

      <div>
        <p style={styles.muted}>{title}</p>
        <h2>{value}</h2>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#F3EDE2',
    fontFamily: 'Arial, sans-serif',
    color: '#174F80'
  },

  header: {
    background: '#174F80',
    color: '#FFFFFF',
    padding: '20px 5%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '15px'
  },

  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: '#FF8045'
  },

  logout: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    border: 'none',
    borderRadius: '8px',
    background: '#FF8045',
    color: '#FFFFFF',
    cursor: 'pointer'
  },

  container: {
    maxWidth: '1100px',
    margin: 'auto',
    padding: '30px 20px'
  },

  heading: {
    color: '#174F80'
  },

  subtitle: {
    color: '#64748B'
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    margin: '25px 0 35px'
  },

  statCard: {
    background: '#FFFFFF',
    padding: '20px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    boxShadow: '0 2px 8px #174F8015',
    border: '1px solid #DCE8EF'
  },

  statIcon: {
    color: '#159E9D'
  },

  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px'
  },

  refresh: {
    display: 'flex',
    gap: '7px',
    alignItems: 'center',
    padding: '10px 14px',
    border: 'none',
    borderRadius: '8px',
    background: '#159E9D',
    color: '#FFFFFF',
    cursor: 'pointer'
  },

  filterBox: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
    background: '#FFFFFF',
    padding: '18px',
    borderRadius: '12px',
    marginTop: '18px',
    border: '1px solid #DCE8EF',
    boxShadow: '0 2px 8px #174F8010'
  },

  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '0 12px',
    border: '1px solid #DCE8EF',
    borderRadius: '8px',
    minHeight: '44px'
  },

  searchInput: {
    width: '100%',
    border: 'none',
    outline: 'none',
    fontSize: '14px',
    color: '#174F80',
    background: 'transparent'
  },

  filterSelect: {
    padding: '12px',
    border: '1px solid #DCE8EF',
    borderRadius: '8px',
    background: '#FFFFFF',
    color: '#174F80',
    fontSize: '14px',
    outline: 'none',
    cursor: 'pointer'
  },

  resultCount: {
    color: '#64748B',
    fontSize: '14px',
    marginTop: '15px'
  },

  card: {
    background: '#FFFFFF',
    padding: '22px',
    borderRadius: '12px',
    marginTop: '18px',
    boxShadow: '0 2px 8px #174F8015',
    border: '1px solid #DCE8EF',
    display: 'grid',
    gap: '10px'
  },

  studentInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px'
  },

  studentPhoto: {
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  objectFit: 'contain',
  border: '3px solid #159E9D',
  background: '#F3EDE2'
},

  studentAvatar: {
    width: '65px',
    height: '65px',
    borderRadius: '50%',
    background: '#159E9D',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '25px',
    fontWeight: 'bold'
  },

  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
    marginBottom: '8px'
  },

  status: {
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: 'bold'
  },

  muted: {
    color: '#64748B'
  },

  review: {
    background: '#F8F5EF',
    padding: '14px',
    borderRadius: '8px',
    lineHeight: 1.6,
    color: '#174F80'
  },

  actions: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px',
    flexWrap: 'wrap'
  },

  approve: {
    display: 'flex',
    gap: '7px',
    alignItems: 'center',
    padding: '10px 15px',
    border: 'none',
    borderRadius: '7px',
    background: '#159E9D',
    color: '#FFFFFF',
    cursor: 'pointer'
  },

  reject: {
    display: 'flex',
    gap: '7px',
    alignItems: 'center',
    padding: '10px 15px',
    border: 'none',
    borderRadius: '7px',
    background: '#FF8045',
    color: '#FFFFFF',
    cursor: 'pointer'
  },

  delete: {
    display: 'flex',
    gap: '7px',
    alignItems: 'center',
    padding: '10px 15px',
    border: 'none',
    borderRadius: '7px',
    background: '#C83D3D',
    color: '#FFFFFF',
    cursor: 'pointer'
  },

  empty: {
    background: '#FFFFFF',
    padding: '30px',
    textAlign: 'center',
    borderRadius: '12px',
    marginTop: '18px',
    color: '#174F80'
  },

  error: {
    color: '#DC2626'
  },

  center: {
    padding: '50px',
    textAlign: 'center',
    color: '#174F80'
  }
};

export default AdminDashboard;
