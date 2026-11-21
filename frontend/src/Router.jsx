
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
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/submit-feedback" element={<Feedback />} />
        <Route path="/my-feedback" element={<MyFeedback />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Router;
