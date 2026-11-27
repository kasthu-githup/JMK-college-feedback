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
  Search,
  Briefcase,
  GraduationCap,
  Code,
  Video,
  Pencil,
  X
} from 'lucide-react';

const API_URL = 'https://jmk-college-feedback.onrender.com/api';

function AdminDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem('jmkAdminToken');

  const api = axios.create({
    baseURL: API_URL,
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const [stats, setStats] = useState({
    total_feedback: 0,
    college_feedback: 0,
    internship_feedback: 0,
    project_feedback: 0,
    pending_feedback: 0,
    approved_feedback: 0,
    rejected_feedback: 0
  });

  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);

  // LOAD DASHBOARD
  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');

      const [statsResponse, feedbackResponse] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/feedback')
      ]);

      setStats(statsResponse.data);

      setFeedback(
        Array.isArray(feedbackResponse.data)
          ? feedbackResponse.data
          : []
      );

    } catch (err) {
      console.error('Admin Dashboard Error:', err);

      setError(
        err.response?.data?.message ||
        'Unable to load dashboard'
      );

      if ([401, 403].includes(err.response?.status)) {
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
      navigate('/admin-login');
      return;
    }

    loadDashboard();
  }, []);

  // APPROVE OR REJECT
  const updateStatus = async (id, status) => {
    try {
      await api.patch(
        `/admin/feedback/${id}/status`,
        { status }
      );

      alert(`Feedback ${status} successfully!`);
      await loadDashboard();

    } catch (err) {
      console.error('Status Update Error:', err);
      alert(
        err.response?.data?.message ||
        'Status update failed'
      );
    }
  };

  // DELETE FEEDBACK
  const deleteFeedback = async (item) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this feedback permanently?'
    );

    if (!confirmDelete) return;

    try {
      await api.delete(
        `/admin/feedback/${item.category}/${item.id}`
      );

      alert('Feedback deleted successfully!');
      await loadDashboard();

    } catch (err) {
      console.error('Delete Feedback Error:', err);
      alert(
        err.response?.data?.message ||
        'Unable to delete feedback'
      );
    }
  };


  // OPEN EDIT FORM
  const startEdit = (item) => {
    setEditingItem(item);
    let values = {};

    if (item.category === 'college') {
      values = {
        college_name: item.college_name || item.primary_title || '',
        school_name: item.school_name || '',
        department: item.department || item.secondary_title || '',
        admission_year: item.admission_year || item.detail_one || '',
        agent_name: item.agent_name || item.detail_two || '',
        guidance_rating: item.guidance_rating ?? 3,
        communication_rating: item.communication_rating ?? 3,
        support_rating: item.support_rating ?? 3,
        overall_rating: item.overall_rating ?? 3,
        review: item.review || ''
      };
    } else if (item.category === 'internship') {
      values = {
        company_name: item.company_name || item.primary_title || '',
        job_role: item.job_role || item.secondary_title || '',
        duration: item.duration || item.detail_one || '',
        stipend: item.stipend || item.detail_two || '',
        overall_rating: item.overall_rating ?? 3,
        review: item.review || ''
      };
    } else if (item.category === 'project') {
      values = {
        project_title: item.project_title || item.primary_title || '',
        domain: item.domain || item.secondary_title || '',
        technologies: item.technologies || item.detail_one || '',
        guide_name: item.guide_name || item.detail_two || '',
        overall_rating: item.overall_rating ?? 3,
        review: item.review || ''
      };
    }

    setEditForm(values);
  };

  const closeEdit = () => {
    if (savingEdit) return;
    setEditingItem(null);
    setEditForm({});
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  // SAVE EDITED FEEDBACK
  const saveEdit = async (event) => {
    event.preventDefault();
    if (!editingItem || savingEdit) return;

    try {
      setSavingEdit(true);

      await api.put(
        `/admin/feedback/${editingItem.category}/${editingItem.id}`,
        editForm
      );

      alert('Feedback updated successfully!');
      setEditingItem(null);
      setEditForm({});
      await loadDashboard();
    } catch (err) {
      console.error('Edit Feedback Error:', err);
      alert(
        err.response?.data?.message ||
        'Unable to update feedback'
      );
    } finally {
      setSavingEdit(false);
    }
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem('jmkAdminToken');
    localStorage.removeItem('jmkAdmin');
    navigate('/admin-login');
  };

  // SEARCH AND FILTER
  const filteredFeedback = feedback.filter((item) => {
    const search = searchTerm.toLowerCase().trim();

    const searchableText = [
      item.student_name,
      item.primary_title,
      item.secondary_title,
      item.detail_one,
      item.detail_two,
      item.department,
      item.college_name,
      item.school_name,
      item.company_name,
      item.project_title,
      item.review
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    const matchesSearch = searchableText.includes(search);

    const matchesCategory =
      categoryFilter === 'all' ||
      item.category === categoryFilter;

    const matchesStatus =
      statusFilter === 'all' ||
      (
        item.category === 'college' &&
        (item.status || 'pending') === statusFilter
      );

    return matchesSearch && matchesCategory && matchesStatus;
  });
    // CATEGORY NAME
  const getCategoryName = (category) => {
    if (category === 'college') return 'College Feedback';
    if (category === 'internship') return 'Internship & Job Feedback';
    if (category === 'project') return 'Projects Work Feedback';
    return 'Feedback';
  };

  // CATEGORY ICON
  const getCategoryIcon = (category) => {
    if (category === 'college') return <GraduationCap size={17} />;
    if (category === 'internship') return <Briefcase size={17} />;
    if (category === 'project') return <Code size={17} />;
    return <MessageSquare size={17} />;
  };

  if (loading) {
    return (
      <div style={styles.center}>
        Loading Admin Dashboard...
      </div>
    );
  }

  return (
    <div style={styles.page}>

      {/* HEADER */}
      <header style={styles.header}>
        <div style={styles.brand}>
          <ShieldCheck size={32} />

          <div>
            <h2 style={styles.brandTitle}>
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

        <h1 style={styles.heading}>
          Dashboard Overview
        </h1>

        <p style={styles.subtitle}>
          Manage college, internship and project feedback submissions.
        </p>

        {error && (
          <p style={styles.error}>{error}</p>
        )}

        {/* STATISTICS */}
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

        {/* FEEDBACK SECTION */}
        <div style={styles.sectionHeader}>
          <h2>All Student Feedback</h2>

          <button
            style={styles.refresh}
            onClick={loadDashboard}
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {/* CATEGORY SUMMARY */}
        <div style={styles.categorySummary}>
          <div style={styles.categorySummaryItem}>
            <GraduationCap size={20} />
            <span>
              College: {feedback.filter(
                x => x.category === 'college'
              ).length}
            </span>
          </div>

          <div style={styles.categorySummaryItem}>
            <Briefcase size={20} />
            <span>
              Internship: {feedback.filter(
                x => x.category === 'internship'
              ).length}
            </span>
          </div>

          <div style={styles.categorySummaryItem}>
            <Code size={20} />
            <span>
              Projects: {feedback.filter(
                x => x.category === 'project'
              ).length}
            </span>
          </div>
        </div>

        {/* SEARCH AND FILTER */}
        <div style={styles.filterBox}>
          <div style={styles.searchBox}>
            <Search size={19} color="#159E9D" />

            <input
              type="text"
              placeholder="Search student, company, project..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">All Categories</option>
            <option value="college">College Feedback</option>
            <option value="internship">Internship & Job</option>
            <option value="project">Projects Work</option>
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
          Showing {filteredFeedback.length} of {feedback.length} submissions
        </p>

        {/* FEEDBACK CARDS */}
        {filteredFeedback.length === 0 ? (
          <div style={styles.empty}>
            No matching feedback found.
          </div>
        ) : (
          filteredFeedback.map((item) => (
            <div
              key={`${item.category}-${item.id}`}
              style={styles.card}
            >

              <div style={styles.cardTop}>
                <div style={styles.studentInfo}>

                  {item.profile_image ? (
                    <img
                      src={item.profile_image}
                      alt="Student"
                      style={styles.studentPhoto}
                    />
                  ) : (
                    <div style={styles.studentAvatar}>
                      {item.student_name?.charAt(0)?.toUpperCase() || 'S'}
                    </div>
                  )}

                  <div>
                    <h3 style={styles.studentName}>
                      {item.student_name || 'Student'}
                    </h3>

                    <p style={styles.muted}>
                      {getCategoryName(item.category)}
                    </p>
                  </div>
                </div>

                {item.category === 'college' && (
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
                    {item.status || 'pending'}
                  </span>
                )}
              </div>

              <div style={styles.categoryLabel}>
                {getCategoryIcon(item.category)}
                <strong>
                  {getCategoryName(item.category)}
                </strong>
              </div>

              {/* COLLEGE */}
              {item.category === 'college' && (
                <>
                  <p>
                    <b>College:</b>{' '}
                    {item.primary_title || item.college_name || '-'}
                  </p>

                  <p>
                    <b>Department:</b>{' '}
                    {item.secondary_title || item.department || '-'}
                  </p>

                  <p>
                    <b>Admission Year:</b>{' '}
                    {item.detail_one || item.admission_year || '-'}
                  </p>

                  <p>
                    <b>Agent / Faculty:</b>{' '}
                    {item.detail_two || item.agent_name || '-'}
                  </p>

                  <p>
                    <b>Guidance:</b>{' '}
                    {item.guidance_rating ?? '-'}/5
                  </p>

                  <p>
                    <b>Communication:</b>{' '}
                    {item.communication_rating ?? '-'}/5
                  </p>

                  <p>
                    <b>Support:</b>{' '}
                    {item.support_rating ?? '-'}/5
                  </p>
                </>
              )}

              {/* INTERNSHIP */}
              {item.category === 'internship' && (
                <>
                  <p>
                    <b>Company:</b> {item.primary_title || '-'}
                  </p>

                  <p>
                    <b>Job Role:</b> {item.secondary_title || '-'}
                  </p>

                  <p>
                    <b>Duration:</b> {item.detail_one || '-'}
                  </p>

                  <p>
                    <b>Stipend / Salary:</b> {item.detail_two || '-'}
                  </p>
                </>
              )}

              {/* PROJECT */}
              {item.category === 'project' && (
                <>
                  <p>
                    <b>Project Title:</b> {item.primary_title || '-'}
                  </p>

                  <p>
                    <b>Domain:</b> {item.secondary_title || '-'}
                  </p>

                  <p>
                    <b>Technologies:</b> {item.detail_one || '-'}
                  </p>

                  <p>
                    <b>Guide / Organization:</b> {item.detail_two || '-'}
                  </p>
                </>
              )}

              <p style={styles.rating}>
                <b>Overall Rating:</b>{' '}
                {item.overall_rating ?? '-'}/5
              </p>

              <div style={styles.review}>
                <b>Student Review</b>
                <p>{item.review || 'No review provided.'}</p>
              </div>

              {item.video_url && (
                <div style={styles.videoSection}>
                  <p>
                    <Video size={17} /> Feedback Video
                  </p>

                  <video
                    src={item.video_url}
                    controls
                    style={styles.video}
                  />
                </div>
              )}

              <small style={styles.muted}>
                Submitted:{' '}
                {item.created_at
                  ? new Date(item.created_at).toLocaleString()
                  : '-'}
              </small>

              {/* ACTIONS */}
              <div style={styles.actions}>

                <button
                  style={styles.edit}
                  onClick={() => startEdit(item)}
                >
                  <Pencil size={16} /> Edit
                </button>

                {item.category === 'college' &&
                  (item.status || 'pending') === 'pending' && (
                    <>
                      <button
                        style={styles.approve}
                        onClick={() => updateStatus(item.id, 'approved')}
                      >
                        <CheckCircle size={16} /> Approve
                      </button>

                      <button
                        style={styles.reject}
                        onClick={() => updateStatus(item.id, 'rejected')}
                      >
                        <XCircle size={16} /> Reject
                      </button>
                    </>
                  )}

                <button
                  style={styles.delete}
                  onClick={() => deleteFeedback(item)}
                >
                  <Trash2 size={16} /> Delete
                </button>

              </div>
            </div>
          ))
        )}
                {/* EDIT FEEDBACK MODAL */}
        {editingItem && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>

              <div style={styles.modalHeader}>
                <h2>Edit Student Feedback</h2>

                <button
                  type="button"
                  style={styles.closeButton}
                  onClick={closeEdit}
                  disabled={savingEdit}
                >
                  <X size={22} />
                </button>
              </div>

              <p style={styles.modalSubtitle}>
                {getCategoryName(editingItem.category)}
              </p>

              <form onSubmit={saveEdit}>

                {Object.entries(editForm).map(([key, value]) => {
                  const label = key
                    .replace(/_/g, ' ')
                    .replace(/\b\w/g, letter => letter.toUpperCase());

                  if (key.includes('rating')) {
                    return (
                      <div style={styles.formGroup} key={key}>
                        <label style={styles.formLabel}>
                          {label}
                        </label>

                        <select
                          name={key}
                          value={value}
                          onChange={handleEditChange}
                          style={styles.formInput}
                          required
                        >
                          <option value="1">1 - Poor</option>
                          <option value="2">2 - Fair</option>
                          <option value="3">3 - Good</option>
                          <option value="4">4 - Very Good</option>
                          <option value="5">5 - Excellent</option>
                        </select>
                      </div>
                    );
                  }

                  if (key === 'review') {
                    return (
                      <div style={styles.formGroup} key={key}>
                        <label style={styles.formLabel}>
                          Student Review
                        </label>

                        <textarea
                          name={key}
                          value={value}
                          onChange={handleEditChange}
                          style={styles.formTextarea}
                          rows={5}
                          placeholder="Enter student review"
                        />
                      </div>
                    );
                  }

                  return (
                    <div style={styles.formGroup} key={key}>
                      <label style={styles.formLabel}>
                        {label}
                      </label>

                      <input
                        type="text"
                        name={key}
                        value={value ?? ''}
                        onChange={handleEditChange}
                        style={styles.formInput}
                      />
                    </div>
                  );
                })}

                <div style={styles.modalActions}>
                  <button
                    type="button"
                    style={styles.cancelButton}
                    onClick={closeEdit}
                    disabled={savingEdit}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    style={styles.saveButton}
                    disabled={savingEdit}
                  >
                    {savingEdit ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

// STAT CARD
function StatCard({ title, value, icon }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statIcon}>
        {icon}
      </div>

      <div>
        <p style={styles.muted}>{title}</p>
        <h2>{value ?? 0}</h2>
      </div>
    </div>
  );
}

// STYLES
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

  brandTitle: {
    margin: 0,
    color: '#FFFFFF'
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

  categorySummary: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
    gap: '12px',
    marginTop: '18px'
  },

  categorySummaryItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#FFFFFF',
    padding: '15px',
    borderRadius: '9px',
    border: '1px solid #DCE8EF'
  },

  filterBox: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
    background: '#FFFFFF',
    padding: '18px',
    borderRadius: '12px',
    marginTop: '18px',
    border: '1px solid #DCE8EF'
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
    gap: '10px',
    overflowWrap: 'anywhere'
  },

  studentInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px'
  },

  studentPhoto: {
    width: '65px',
    height: '65px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid #159E9D'
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

  studentName: {
    margin: '0 0 5px'
  },

  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap'
  },

  categoryLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#159E9D',
    marginTop: '8px'
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

  rating: {
    color: '#174F80'
  },

  review: {
    background: '#F8F5EF',
    padding: '14px',
    borderRadius: '8px',
    lineHeight: 1.6,
    color: '#174F80',
    whiteSpace: 'pre-wrap'
  },

  videoSection: {
    display: 'grid',
    gap: '8px'
  },

  video: {
    width: '100%',
    maxWidth: '500px',
    maxHeight: '300px',
    borderRadius: '10px',
    background: '#000000'
  },

  actions: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px',
    flexWrap: 'wrap'
  },

  edit: {
    display: 'flex',
    gap: '7px',
    alignItems: 'center',
    padding: '10px 15px',
    border: 'none',
    borderRadius: '7px',
    background: '#174F80',
    color: '#FFFFFF',
    cursor: 'pointer'
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
    color: '#DC2626',
    background: '#FEE2E2',
    padding: '12px',
    borderRadius: '8px'
  },

  center: {
    padding: '50px',
    textAlign: 'center',
    color: '#174F80'
  },
    // EDIT MODAL STYLES
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15, 23, 42, 0.65)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '16px',
    zIndex: 1000,
    overflowY: 'auto'
  },

  modal: {
    width: '100%',
    maxWidth: '650px',
    maxHeight: '90vh',
    overflowY: 'auto',
    background: '#FFFFFF',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 15px 40px rgba(0,0,0,0.2)',
    boxSizing: 'border-box'
  },

  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px',
    color: '#174F80'
  },

  closeButton: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#174F80'
  },

  modalSubtitle: {
    color: '#159E9D',
    marginBottom: '20px',
    fontWeight: 'bold'
  },

  formGroup: {
    display: 'grid',
    gap: '6px',
    marginBottom: '14px'
  },

  formLabel: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#174F80',
    textTransform: 'capitalize'
  },

  formInput: {
    width: '100%',
    padding: '12px',
    border: '1px solid #DCE8EF',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#174F80',
    background: '#FFFFFF',
    boxSizing: 'border-box'
  },

  formTextarea: {
    width: '100%',
    minHeight: '110px',
    padding: '12px',
    border: '1px solid #DCE8EF',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#174F80',
    resize: 'vertical',
    boxSizing: 'border-box',
    fontFamily: 'Arial, sans-serif'
  },

  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    flexWrap: 'wrap',
    marginTop: '20px'
  },

  saveButton: {
    padding: '11px 18px',
    border: 'none',
    borderRadius: '8px',
    background: '#159E9D',
    color: '#FFFFFF',
    fontWeight: 'bold',
    cursor: 'pointer'
  },

  cancelButton: {
    padding: '11px 18px',
    border: 'none',
    borderRadius: '8px',
    background: '#E2E8F0',
    color: '#174F80',
    fontWeight: 'bold',
    cursor: 'pointer'
  }
  };

export default AdminDashboard;