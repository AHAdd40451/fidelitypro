import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/lib/AuthContext'

export default function RequireAuth() {
  const { isLoadingAuth, isAuthenticated } = useAuth()

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-500">Chargement…</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/connexion" replace />
  }

  return <Outlet />
}
