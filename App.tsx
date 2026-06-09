import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedLayout } from './components/ProtectedLayout'
import { useAuth } from './context/AuthContext'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { AuthPage } from './pages/AuthPage'
import { DashboardPage } from './pages/DashboardPage'
import { JobsPage } from './pages/JobsPage'
import { OverviewPage } from './pages/OverviewPage'
import { ProfilePage } from './pages/ProfilePage'
import { RequestsPage } from './pages/RequestsPage'
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
      <Route element={<ProtectedLayout />} path="/">
        <Route element={<OverviewPage />} path="overview" />
        <Route element={<TradespeoplePage />} path="tradespeople" />
        <Route element={<JobsPage />} path="jobs" />
        <Route element={<RequestsPage />} path="requests" />
        <Route element={<DashboardPage />} path="dashboard" />
        <Route element={<AdminDashboardPage />} path="admin" />
        <Route element={<ProfilePage />} path="profile" />
      </Route>
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  )
}
