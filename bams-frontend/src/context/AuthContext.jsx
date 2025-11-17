import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'

const AuthContext = createContext(null)

const STORAGE_KEY = 'bams_auth_user'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  // Hydrate session from backend if cookie exists
  useEffect(() => {
    api.me().then((res) => {
      if (res?.user) setUser({ ...res.user, name: res.user.full_name })
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    else localStorage.removeItem(STORAGE_KEY)
  }, [user])

  const login = async ({ email, password }) => {
    const res = await api.login(email, password)
    const u = { ...res.user, name: res.user.full_name }
    setUser(u)
    return u
  }
  const logout = async () => {
    try { await api.logout() } catch {}
    setUser(null)
  }

  const value = useMemo(() => ({ user, login, logout }), [user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

