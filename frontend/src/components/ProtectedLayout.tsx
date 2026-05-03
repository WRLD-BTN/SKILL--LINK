import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Layout } from './Layout'

export function ProtectedLayout() {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate replace state={{ from: location.pathname }} to="/auth" />
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}
