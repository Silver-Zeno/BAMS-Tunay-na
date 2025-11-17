"use client"

import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { LogOut, User } from "lucide-react"

export default function TopNav() {
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
            <span className="text-sm font-bold text-primary-foreground">B</span>
          </div>
          <span className="font-semibold tracking-tight text-lg text-foreground">BAMS</span>
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          {!user && (
            <div className="flex items-center gap-4">
              <Link className="text-muted-foreground hover:text-primary transition-colors font-medium" to="/login">
                Login
              </Link>
              <Link
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                to="/register"
              >
                Register
              </Link>
            </div>
          )}

          {user && (
            <div className="flex items-center gap-6">
              {user.role === "resident" && (
                <Link className="text-muted-foreground hover:text-primary transition-colors font-medium" to="/resident">
                  My Appointments
                </Link>
              )}
              {user.role === "admin" && (
                <div className="flex items-center gap-6">
                  <Link
                    className="text-muted-foreground hover:text-primary transition-colors font-medium"
                    to="/admin/appointments"
                  >
                    Appointments
                  </Link>
                  <Link
                    className="text-muted-foreground hover:text-primary transition-colors font-medium"
                    to="/admin/registrations"
                  >
                    Registrations
                  </Link>
                </div>
              )}

              <div className="h-8 w-px bg-border/40"></div>

              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <button className="p-2 hover:bg-muted rounded-lg transition-colors" onClick={logout} title="Logout">
                  <LogOut className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                </button>
              </div>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
