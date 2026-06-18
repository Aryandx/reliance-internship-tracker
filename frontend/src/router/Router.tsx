import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { getDashboardRouteForRole, ROUTES } from './routeConfig';

import Layout from '../components/layout/Layout';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ManagerDashboard from '../pages/manager/ManagerDashboard';
import InternDashboard from '../pages/intern/InternDashboard';
import InternList from '../pages/interns/InternList';
import CreateIntern from '../pages/interns/CreateIntern';
import InternProfile from '../pages/interns/InternProfile';
import SubmitStandup from '../pages/standup/SubmitStandup';
import StandupFeed from '../pages/standup/StandupFeed';
import AssignManager from '../pages/assignments/AssignManager';
import HRDashboard from '../pages/hr/HRDashboard';
import BuddyDashboard from '../pages/buddy/BuddyDashboard';
import ProgressTracker from '../pages/progress/ProgressTracker';
import WriteReview from '../pages/reviews/WriteReview';
import ReviewInbox from '../pages/reviews/ReviewInbox';
import MyFeedback from '../pages/reviews/MyFeedback';
import SubmittedReviews from '../pages/reviews/SubmittedReviews';
import AttendanceCompliance from '../pages/attendance/AttendanceCompliance';
import AuditLog from '../pages/audit/AuditLog';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuthStore();
  if (!token) return <Navigate to={ROUTES.LOGIN} replace />;
  if (!user) return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-8 h-8 border-4 border-reliance-blue border-t-transparent rounded-full animate-spin" />
    </div>
  );
  return <>{children}</>;
}

export default function AppRouter() {
  const { token, user, fetchMe } = useAuthStore();

  useEffect(() => {
    if (token && !user) fetchMe();
  }, [token]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.REGISTER} element={<Register />} />
        <Route path="/" element={
          token ? <Navigate to={getDashboardRouteForRole(user?.role)} replace /> : <Navigate to={ROUTES.LOGIN} replace />
        } />

        {/* Protected */}
        <Route element={<RequireAuth><Layout /></RequireAuth>}>
          {/* Dashboards */}
          <Route path={ROUTES.WORKSPACE.STANDARD.DASHBOARDS.MANAGER} element={<ManagerDashboard />} />
          <Route path={ROUTES.WORKSPACE.STANDARD.DASHBOARDS.INTERN} element={<InternDashboard />} />
          <Route path={ROUTES.WORKSPACE.STANDARD.DASHBOARDS.HR} element={<HRDashboard />} />
          <Route path={ROUTES.WORKSPACE.STANDARD.DASHBOARDS.BUDDY} element={<BuddyDashboard />} />
          <Route path={ROUTES.WORKSPACE.STANDARD.DASHBOARDS.TECH_LEAD} element={<ManagerDashboard />} />

          {/* Interns */}
          <Route path={ROUTES.WORKSPACE.STANDARD.INTERNS} element={<InternList />} />
          <Route path={ROUTES.WORKSPACE.STANDARD.CREATE_INTERN} element={<CreateIntern />} />
          <Route path={ROUTES.WORKSPACE.STANDARD.PROFILE} element={<InternProfile />} />
          <Route path="/interns/:id/edit" element={<CreateIntern />} />

          {/* Standups */}
          <Route path={ROUTES.WORKSPACE.STANDARD.SUBMIT_STANDUP} element={<SubmitStandup />} />
          <Route path={ROUTES.WORKSPACE.STANDARD.STANDUP_FEED} element={<StandupFeed />} />

          {/* Assignments */}
          <Route path={ROUTES.WORKSPACE.STANDARD.MAP_MANAGER} element={<AssignManager />} />
          <Route path={ROUTES.WORKSPACE.STANDARD.MAP_TECH_LEAD} element={<AssignManager />} />
          <Route path={ROUTES.WORKSPACE.STANDARD.MAP_BUDDY} element={<AssignManager />} />

          {/* Progress / Milestones */}
          <Route path={ROUTES.WORKSPACE.STANDARD.PROGRESS} element={<ProgressTracker />} />
          <Route path="/progress/me" element={<ProgressTracker />} />
          <Route path="/progress/tracker" element={<InternList />} />

          {/* Reviews */}
          <Route path="/reviews/new" element={<WriteReview />} />
          <Route path="/reviews/inbox" element={<ReviewInbox />} />
          <Route path="/reviews/my" element={<MyFeedback />} />
          <Route path="/reviews/submitted" element={<SubmittedReviews />} />

          {/* Attendance */}
          <Route path="/attendance/me" element={<AttendanceCompliance />} />
          <Route path="/attendance/:id" element={<AttendanceCompliance />} />

          {/* Audit */}
          <Route path="/audit" element={<AuditLog />} />

          {/* Analytics / misc */}
          <Route path="/analytics" element={<ManagerDashboard />} />
          <Route path="/profile/me" element={<InternDashboard />} />
          <Route path="/workflow/buddy" element={<BuddyDashboard />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to={getDashboardRouteForRole(user?.role)} replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
