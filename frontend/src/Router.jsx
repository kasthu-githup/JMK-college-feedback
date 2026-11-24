
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import App from './App';
import Login from './Login';
import Signup from './Signup';
import Dashboard from './Dashboard';
import Feedback from './Feedback';
import MyFeedback from './MyFeedback';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        {/* HOME */}
        <Route path="/" element={<App />} />

        {/* AUTHENTICATION */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* STUDENT DASHBOARD */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/my-feedback" element={<MyFeedback />} />

        {/* FEEDBACK CATEGORIES */}
        <Route path="/submit-feedback" element={<Feedback />} />
        <Route path="/college-feedback" element={<Feedback />} />
        <Route path="/internship-job-feedback" element={<Feedback />} />
        <Route path="/projects-feedback" element={<Feedback />} />

        {/* ADMIN */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />

        {/* FALLBACK */}
        <Route path="*" element={<App />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Router;
