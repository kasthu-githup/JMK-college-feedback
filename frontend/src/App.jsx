
import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  GraduationCap, Star, Users, Building2,
  MessageSquare, Search, Menu, X, ArrowRight,
  ShieldCheck, LogIn, BriefcaseBusiness, FolderKanban
} from 'lucide-react';
import './App.css';

const API = 'https://jmk-college-feedback.onrender.com/api';

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [collegeFeedbacks, setCollegeFeedbacks] = useState([]);
  const [internshipFeedbacks, setInternshipFeedbacks] = useState([]);
  const [projectFeedbacks, setProjectFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAllFeedback = async () => {
      try {
        const results = await Promise.allSettled([
          axios.get(`${API}/feedback/approved`),
          axios.get(`${API}/internship/public`),
          axios.get(`${API}/projects/public`)
        ]);

        if (results[0].status === 'fulfilled') {
          setCollegeFeedbacks(results[0].value.data);
        } else {
          console.error('College feedback error:', results[0].reason);
        }

        if (results[1].status === 'fulfilled') {
          setInternshipFeedbacks(results[1].value.data);
        } else {
          console.error('Internship feedback error:', results[1].reason);
        }

        if (results[2].status === 'fulfilled') {
          setProjectFeedbacks(results[2].value.data);
        } else {
          console.error('Project feedback error:', results[2].reason);
        }

        const allFailed = results.every(
          result => result.status === 'rejected'
        );

        setError(
          allFailed
            ? 'Unable to load feedback. Please try again later.'
            : ''
        );

      } catch (err) {
        console.error('Feedback loading error:', err);
        setError('Unable to load feedback. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllFeedback();
  }, []);

  const allFeedbacks = [
    ...collegeFeedbacks,
    ...internshipFeedbacks,
    ...projectFeedbacks
  ];

  const averageRating = allFeedbacks.length
    ? (
        allFeedbacks.reduce(
          (total, item) => total + Number(item.overall_rating || 0),
          0
        ) / allFeedbacks.length
      ).toFixed(1)
    : '--';

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'College Feedback', href: '#college-feedback' },
    { name: 'Internship & Job Feedback', href: '#internship-feedback' },
    { name: 'Projects Work Feedback', href: '#project-feedback' },
    { name: 'Contact', href: '#contact' }
  ];

  const filterItems = (items, fields) => {
    const query = search.toLowerCase().trim();
    if (!query) return items;

    return items.filter(item =>
      fields.some(field =>
        String(item[field] || '').toLowerCase().includes(query)
      ) ||
      String(item.student_name || '').toLowerCase().includes(query)
    );
  };

  const renderRating = rating => {
    const value = Math.max(0, Math.min(5, Number(rating) || 0));

    return (
      <div className="visual-stars">
        {'★'.repeat(value)}
        {'☆'.repeat(5 - value)}
      </div>
    );
  };

  const renderEmpty = title => (
    <div className="empty-state">
      <MessageSquare size={40} />
      <h3>{title}</h3>
      <p>Be the first student to share your experience!</p>
      <a href="/signup" className="primary-btn">
        Share Your Experience <ArrowRight size={17} />
      </a>
    </div>
  );

  const renderStudent = item => (
    <div className="review-avatar">
      {item.student_name?.charAt(0)?.toUpperCase() || 'S'}
    </div>
  );

  return (
    <div className="app">

      {/* NAVBAR */}
      <header className="navbar">
        <a href="#home" className="brand">
          <img src="/jmk-logo.png" alt="JMK Logo" />
          <div>
            <h2>JMK</h2>
            <span>STUDENT SERVICE HUB</span>
          </div>
        </a>

        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          {menuOpen ? <X /> : <Menu />}
        </button>

        <nav className={menuOpen ? 'nav-links active' : 'nav-links'}>
          {navLinks.map(link => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setMenuOpen(false)}
            >
              {link.name}
            </a>
          ))}

          <a href="/login" className="login-btn">
            <LogIn size={17} /> Login / Signup
          </a>
        </nav>
      </header>

      {/* HERO */}
      <section className="hero-section" id="home">
        <div className="hero-content">
          <span className="hero-tag">
            <GraduationCap size={18} />
            YOUR VOICE. YOUR EXPERIENCE. YOUR CAMPUS.
          </span>

          <h1>
            Find Your Future.
            <br />
            <span>Trust Real Experiences.</span>
          </h1>

          <p>
            Explore genuine student experiences about colleges,
            internships, jobs and project work. Make confident
            decisions through real student feedback.
          </p>

          <div className="hero-buttons">
            <a href="#college-feedback" className="primary-btn">
              Explore Feedback <ArrowRight size={18} />
            </a>

            <a href="/signup" className="secondary-btn">
              Share Your Experience
            </a>
          </div>

          <div className="trust-note">
            <ShieldCheck size={19} />
            Experiences shared by registered students
          </div>
        </div>

        <div className="hero-visual">
          <div className="future-image">
            <img src="/student-boy.png" alt="Student holding books" />
          </div>
        </div>
      </section>

      {/* STATISTICS */}
      <section className="stats-section">
        <div className="stat-card">
          <Users />
          <h2>{allFeedbacks.length}</h2>
          <p>Total Reviews</p>
        </div>

        <div className="stat-card">
          <Building2 />
          <h2>{collegeFeedbacks.length}</h2>
          <p>College Reviews</p>
        </div>

        <div className="stat-card">
          <BriefcaseBusiness />
          <h2>{internshipFeedbacks.length}</h2>
          <p>Internship & Job Reviews</p>
        </div>

        <div className="stat-card">
          <Star />
          <h2>{averageRating}</h2>
          <p>Average Rating</p>
        </div>
      </section>

      {/* ABOUT */}
      <section className="about-section" id="about">
        <div className="section-heading">
          <span>ABOUT OUR PLATFORM</span>
          <h2>One Platform. Three Experiences.</h2>
          <p>
            JMK Student Service Hub helps students share their
            experiences about college admissions, internships,
            jobs and academic projects.
          </p>
        </div>

        <div className="about-grid">
          <div className="about-card">
            <Users size={30} />
            <h3>Student Experiences</h3>
            <p>Discover experiences shared by other students.</p>
          </div>

          <div className="about-card">
            <Star size={30} />
            <h3>Honest Reviews</h3>
            <p>Explore ratings and written feedback.</p>
          </div>

          <div className="about-card">
            <ShieldCheck size={30} />
            <h3>Instant Feedback</h3>
            <p>New submissions appear in the feedback sections.</p>
          </div>
        </div>
      </section>

      {/* SAME BOOK BACKGROUND START */}
      <div className="book-background-area">

        {/* CATEGORY CARDS */}
        <section className="feedback-categories-section">
          <div className="section-heading">
            <span>EXPLORE CATEGORIES</span>
            <h2>Choose Your Feedback Category</h2>
            <p>Select a category to explore student experiences.</p>
          </div>

          <div className="about-grid">
            <a href="#college-feedback" className="about-card category-pop-card">
              <GraduationCap size={38} />
              <h3>College Feedback</h3>
              <p>College admission, departments and student experiences.</p>
              <strong>Explore Reviews →</strong>
            </a>

            <a href="#internship-feedback" className="about-card category-pop-card">
              <BriefcaseBusiness size={38} />
              <h3>Internship & Job Feedback</h3>
              <p>Company, job role and internship experiences.</p>
              <strong>Explore Reviews →</strong>
            </a>

            <a href="#project-feedback" className="about-card category-pop-card">
              <FolderKanban size={38} />
              <h3>Projects Work Feedback</h3>
              <p>Academic projects, technologies and guide experiences.</p>
              <strong>Explore Reviews →</strong>
            </a>
          </div>
        </section>

        {/* SEARCH */}
        <section className="feedback-section">
          <div className="section-heading">
            <span>SEARCH EXPERIENCES</span>
            <h2>Find Student Reviews</h2>
          </div>

          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search student, college, company or project..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </section>

        {/* COLLEGE FEEDBACK */}
        <section className="feedback-section" id="college-feedback">
          <div className="section-heading">
            <span>COLLEGE EXPERIENCES</span>
            <h2>College Feedback</h2>
            <p>College admissions and student experiences.</p>
            <a href="/submit-feedback" className="primary-btn">
              Submit College Feedback <ArrowRight size={17} />
            </a>
          </div>

          <div className="feedback-grid">
            {loading ? (
              <div className="empty-state">Loading college feedback...</div>
            ) : error ? (
              <div className="empty-state">{error}</div>
            ) : filterItems(collegeFeedbacks, [
              'college_name', 'school_name', 'department', 'agent_name'
            ]).length === 0 ? (
              renderEmpty('No College Feedback Yet')
            ) : (
              filterItems(collegeFeedbacks, [
                'college_name', 'school_name', 'department', 'agent_name'
              ]).map(item => (
                <div className="review-card" key={item.id}>
                  {item.profile_image ? (
                    <img
                      className="student-photo"
                      src={item.profile_image}
                      alt={item.student_name || 'Student'}
                    />
                  ) : renderStudent(item)}

                  <h3>{item.student_name}</h3>
                  <p>{item.college_name}</p>
                  <p>
                    <strong>School Name:</strong>{' '}
                    {item.school_name || 'Not specified'}
                  </p>
                  <p><strong>Department:</strong> {item.department}</p>
                  <p><strong>Admission Year:</strong> {item.admission_year}</p>
                  <p><strong>Agent:</strong> {item.agent_name}</p>

                  {renderRating(item.overall_rating)}
                  <p>{item.review}</p>

                  {item.video_url && (
                    <video controls width="100%" src={item.video_url} />
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* INTERNSHIP FEEDBACK */}
        <section className="feedback-section" id="internship-feedback">
          <div className="section-heading">
            <span>CAREER EXPERIENCES</span>
            <h2>Internship & Job Feedback</h2>
            <p>
              Read real experiences about companies and job opportunities.
            </p>
            <a href="/internship-job-feedback" className="primary-btn">
              Submit Internship / Job Feedback <ArrowRight size={17} />
            </a>
          </div>

          <div className="feedback-grid">
            {loading ? (
              <div className="empty-state">Loading internship feedback...</div>
            ) : error ? (
              <div className="empty-state">{error}</div>
            ) : filterItems(internshipFeedbacks, [
              'company_name', 'job_role', 'duration'
            ]).length === 0 ? (
              renderEmpty('No Internship or Job Feedback Yet')
            ) : (
              filterItems(internshipFeedbacks, [
                'company_name', 'job_role', 'duration'
              ]).map(item => (
                <div className="review-card" key={item.id}>
                  {renderStudent(item)}
                  <h3>{item.student_name}</h3>
                  <p><strong>Company:</strong> {item.company_name}</p>
                  <p><strong>Role:</strong> {item.job_role || 'Not specified'}</p>
                  <p><strong>Duration:</strong> {item.duration || 'Not specified'}</p>
                  <p><strong>Stipend:</strong> {item.stipend || 'Not specified'}</p>

                  {renderRating(item.overall_rating)}
                  <p>{item.review}</p>

                  {item.video_url && (
                    <video controls width="100%" src={item.video_url} />
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* PROJECT FEEDBACK */}
        <section className="feedback-section" id="project-feedback">
          <div className="section-heading">
            <span>PROJECT EXPERIENCES</span>
            <h2>Projects Work Feedback</h2>
            <p>
              Explore student project work and learning experiences.
            </p>
            <a href="/projects-feedback" className="primary-btn">
              Submit Project Feedback <ArrowRight size={17} />
            </a>
          </div>

          <div className="feedback-grid">
            {loading ? (
              <div className="empty-state">Loading project feedback...</div>
            ) : error ? (
              <div className="empty-state">{error}</div>
            ) : filterItems(projectFeedbacks, [
              'project_title', 'domain', 'technologies', 'guide_name'
            ]).length === 0 ? (
              renderEmpty('No Project Feedback Yet')
            ) : (
              filterItems(projectFeedbacks, [
                'project_title', 'domain', 'technologies', 'guide_name'
              ]).map(item => (
                <div className="review-card" key={item.id}>
                  {renderStudent(item)}
                  <h3>{item.student_name}</h3>
                  <p><strong>Project:</strong> {item.project_title}</p>
                  <p><strong>Domain:</strong> {item.domain || 'Not specified'}</p>
                  <p><strong>Technologies:</strong> {item.technologies || 'Not specified'}</p>
                  <p><strong>Guide:</strong> {item.guide_name || 'Not specified'}</p>

                  {renderRating(item.overall_rating)}
                  <p>{item.review}</p>

                  {item.video_url && (
                    <video controls width="100%" src={item.video_url} />
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* CONTACT */}
        <section className="jmk-contact-section" id="contact">
          <div className="jmk-contact-heading">
            <span className="jmk-contact-tag">GET IN TOUCH</span>
            <h2>Let's Connect!</h2>
            <p>Have questions? We're here to help you.</p>
          </div>

          <div className="jmk-contact-card">
            <div className="jmk-contact-info">
              <div className="jmk-contact-icon">📞</div>

              <div>
                <h3>Call Us</h3>
                <a href="tel:+919578755237">+91 9578755237</a>
                <p>Available for enquiries</p>
              </div>
            </div>

            <div className="jmk-contact-buttons">
              <a href="tel:+919578755237" className="jmk-call-btn">
                📞 Call Now
              </a>
            </div>
          </div>
        </section>

      </div>
      {/* SAME BOOK BACKGROUND END */}

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-brand">
          <img src="/jmk-logo.png" alt="JMK Logo" />
          <h3>JMK Student Service Hub</h3>
        </div>

        <p>Connecting Students With Real Experiences.</p>
        <p>© 2026 JMK Student Service Hub. All Rights Reserved.</p>
      </footer>

    </div>
  );
}

export default App;
