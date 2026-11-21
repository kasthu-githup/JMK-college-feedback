
import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  GraduationCap, Star, Users, Building2,
  MessageSquare, Search, Menu, X, ArrowRight,
  ShieldCheck, BookOpen, LogIn
} from 'lucide-react';
import './App.css';

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load approved feedback from backend
  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const response = await axios.get(
          'http://localhost:5000/api/feedback/approved'
        );

        setFeedbacks(response.data);
      } catch (err) {
        console.error('Feedback loading error:', err);
        setError('Unable to load student feedback.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  const collegesCount = new Set(
    feedbacks.map(item => item.college_name?.toLowerCase())
  ).size;

  const agentsCount = new Set(
    feedbacks.map(item => item.agent_name?.toLowerCase())
  ).size;

  const averageRating = feedbacks.length
    ? (
        feedbacks.reduce(
          (total, item) => total + Number(item.overall_rating),
          0
        ) / feedbacks.length
      ).toFixed(1)
    : '--';

  const filteredFeedbacks = feedbacks.filter(item => {
    const query = search.toLowerCase();

    return (
      item.college_name?.toLowerCase().includes(query) ||
      item.agent_name?.toLowerCase().includes(query) ||
      item.student_name?.toLowerCase().includes(query) ||
      item.department?.toLowerCase().includes(query)
    );
  });

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Feedback', href: '#feedback' },
    { name: 'Contact', href: '#contact' }
  ];

  return (
    <div className="app">

      {/* NAVBAR */}
      <header className="navbar">
        <a href="#home" className="brand">
          <img src="/jmk-logo.png" alt="JMK Logo" />
          <div>
            <h2>JMK</h2>
            <span>EDUCATION CENTER</span>
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
            YOUR EDUCATION JOURNEY STARTS HERE
          </span>

          <h1>
            Find Your Future.
            <br />
            <span>Trust Real Experiences.</span>
          </h1>

          <p>
            Explore genuine student experiences, college admission
            journeys and agent reviews. Make your college decision
            with confidence.
          </p>

          <div className="hero-buttons">
            <a href="#feedback" className="primary-btn">
              Explore Feedback <ArrowRight size={18} />
            </a>

            <a href="/signup" className="secondary-btn">
              Share Your Experience
            </a>
          </div>

          <div className="trust-note">
            <ShieldCheck size={19} />
            Real experiences from registered students
          </div>
        </div>

        <div className="hero-visual">
          <div className="visual-card">
            <div className="visual-icon">
              <GraduationCap size={65} />
            </div>
            <h2>Build Your Future</h2>
            <p>Choose your college with confidence.</p>
            <div className="visual-stars">★★★★★</div>
            <span>Student Experience Platform</span>
          </div>

          <div className="floating-icon icon-one">
            <BookOpen size={25} />
          </div>

          <div className="floating-icon icon-two">
            <Star size={25} />
          </div>
        </div>
      </section>

      {/* STATISTICS */}
      <section className="stats-section">
        <div className="stat-card">
          <Users />
          <h2>{feedbacks.length}</h2>
          <p>Student Reviews</p>
        </div>

        <div className="stat-card">
          <Building2 />
          <h2>{collegesCount}</h2>
          <p>Colleges Reviewed</p>
        </div>

        <div className="stat-card">
          <MessageSquare />
          <h2>{agentsCount}</h2>
          <p>Admission Agents</p>
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
          <h2>Making College Admission Decisions Easier</h2>
          <p>
            JMK Education Center provides a platform for students
            to share their college admission experiences and help
            other students make informed decisions.
          </p>
        </div>

        <div className="about-grid">
          <div className="about-card">
            <Users size={30} />
            <h3>Student Experiences</h3>
            <p>Discover experiences shared by students.</p>
          </div>

          <div className="about-card">
            <Star size={30} />
            <h3>Honest Reviews</h3>
            <p>Read ratings and feedback about admission support.</p>
          </div>

          <div className="about-card">
            <ShieldCheck size={30} />
            <h3>Trusted Platform</h3>
            <p>Feedback is reviewed before public publishing.</p>
          </div>
        </div>
      </section>

      {/* PUBLIC FEEDBACK */}
      <section className="feedback-section" id="feedback">
        <div className="section-heading">
          <span>STUDENT REVIEWS</span>
          <h2>Student Feedback & Experiences</h2>
          <p>
            Explore college admission experiences shared by students.
          </p>
        </div>

        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search college, student, department or agent..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="feedback-grid">

          {loading ? (
            <div className="empty-state">
              <p>Loading student feedback...</p>
            </div>
          ) : error ? (
            <div className="empty-state">
              <MessageSquare size={45} />
              <h3>Feedback unavailable</h3>
              <p>{error}</p>
            </div>
          ) : filteredFeedbacks.length === 0 ? (
            <div className="empty-state">
              <MessageSquare size={45} />
              <h3>
                {feedbacks.length === 0
                  ? 'No Feedback Published Yet'
                  : 'No Matching Feedback Found'}
              </h3>
              <p>
                {feedbacks.length === 0
                  ? 'Student reviews will appear here after admin approval.'
                  : 'Try searching with another name or college.'}
              </p>

              {feedbacks.length === 0 && (
                <a href="/signup" className="primary-btn">
                  Submit Your Feedback <ArrowRight size={17} />
                </a>
              )}
            </div>
          ) : (
            filteredFeedbacks.map(item => (
              <div className="review-card" key={item.id}>

                {item.profile_image ? (
                  <img
  className="student-photo"
  src={item.profile_image}
  alt={item.student_name}
/>
                ) : (
                  <div className="review-avatar">
                    {item.student_name?.charAt(0)?.toUpperCase()}
                  </div>
                )}

                <h3>{item.student_name}</h3>

                <p>{item.college_name}</p>

                <p>
                  <strong>Department:</strong> {item.department}
                </p>

                <p>
                  <strong>Admission Year:</strong> {item.admission_year}
                </p>

                <p>
                  <strong>Agent:</strong> {item.agent_name}
                </p>

                <div className="visual-stars">
                  {'★'.repeat(Number(item.overall_rating))}
                  {'☆'.repeat(5 - Number(item.overall_rating))}
                </div>

                <p>{item.review}</p>
              </div>
            ))
          )}

        </div>
      </section>

      {/* CONTACT */}
      <section className="contact-section" id="contact">
        <h2>Start Your College Journey With Confidence</h2>
        <p>
          Explore student experiences and share your own story.
        </p>

        <a href="/signup" className="primary-btn">
          Join Our Platform <ArrowRight size={18} />
        </a>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-brand">
          <img src="/jmk-logo.png" alt="JMK Logo" />
          <h3>JMK Education Center</h3>
        </div>

        <p>
          Connecting Students With Real Admission Experiences.
        </p>

        <p>© 2026 JMK Education Center. All Rights Reserved.</p>
      </footer>

    </div>
  );
}

export default App;
