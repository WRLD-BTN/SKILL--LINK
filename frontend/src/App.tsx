// App routes separate the public auth screen from the private client, tradesperson, and admin experiences.
import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedLayout } from './components/ProtectedLayout'
import { useAuth } from './context/AuthContext'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { AdminRequestDetailPage } from './pages/AdminRequestDetailPage'
import { AdminRequestsPage } from './pages/AdminRequestsPage'
import { AuthPage } from './pages/AuthPage'
import { DashboardPage } from './pages/DashboardPage'
import { JobsPage } from './pages/JobsPage'
import { OverviewPage } from './pages/OverviewPage'
import { ProfilePage } from './pages/ProfilePage'
import { TradespersonStatusPage } from './pages/TradespersonStatusPage'
import { TradespeoplePage } from './pages/TradespeoplePage'

export default function App() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route
        element={<Navigate replace to={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/auth'} />}
        path="/"
      />
      <Route element={<AuthPage />} path="/auth" />
      <Route element={<TradespersonStatusPage />} path="/tradesperson-status" />
      <Route element={<ProtectedLayout />} path="/">
        <Route element={<OverviewPage />} path="overview" />
        <Route element={<TradespeoplePage />} path="tradespeople" />
        <Route element={<JobsPage />} path="jobs" />
        <Route element={<DashboardPage />} path="dashboard" />
        <Route element={<AdminDashboardPage />} path="admin" />
        <Route element={<AdminRequestsPage />} path="admin/requests" />
        <Route element={<AdminRequestDetailPage />} path="admin/requests/:requestId" />
        <Route element={<ProfilePage />} path="profile" />
      </Route>
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  )
}
