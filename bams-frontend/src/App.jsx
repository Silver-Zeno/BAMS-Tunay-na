"use client"

import { Link, Route, Routes, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./context/AuthContext"
import TopNav from "./components/TopNav"
import Footer from "./components/Footer"
import Login from "./pages/Login"
import Register from "./pages/Register"
import ResidentDashboard from "./pages/ResidentDashboard"
import AdminRegistrations from "./pages/AdminRegistrations"
import AdminResidentDetails from "./pages/AdminResidentDetails"
import AdminAppointmentDetails from "./pages/AdminAppointmentDetails"
import AdminAppointments from "./pages/AdminAppointments"
import AttachmentViewer from "./pages/AttachmentViewer"
import AdminDocuments from "./pages/AdminDocuments"
import AdminDocumentEditor from "./pages/AdminDocumentEditor"
import AdminIDCard from "./pages/AdminIDCard"
import { CheckCircle2, Users, Clock, FileText } from "lucide-react"

function Home() {
  return (
    <div className="min-h-[calc(100vh-56px)] bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:py-32">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-slate-900 leading-tight">
                Barangay Appointment Management
              </h1>
              <p className="text-xl text-slate-600 max-w-lg leading-relaxed">
                Streamline document requests, schedule appointments, and manage resident services with a modern,
                efficient platform.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-6 py-3 border-2 border-slate-200 text-slate-900 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid gap-4">
            <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-100">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">For Residents</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Request documents and track application status in real-time.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-emerald-100">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">For Administrators</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Approve requests, manage appointments, and issue documents efficiently.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-purple-100">
                    <Clock className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Real-time Updates</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Instant notifications and status changes for all transactions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-white border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-16 md:py-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Why BAMS?</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              A complete solution for modern barangay administration
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: FileText,
                title: "Document Management",
                description: "Request and manage barangay documents with transparent tracking.",
              },
              {
                icon: Clock,
                title: "Appointment Scheduling",
                description: "Book and manage appointments with automated reminders and updates.",
              },
              {
                icon: Users,
                title: "Resident Management",
                description: "Maintain comprehensive resident records and communication history.",
              },
            ].map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <div
                  key={index}
                  className="rounded-lg p-8 border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-100 mb-4">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{benefit.title}</h3>
                  <p className="text-slate-600">{benefit.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}

function Placeholder({ title }) {
  return (
    <div className="min-h-screen grid place-items-center bg-gray-50">
      <div className="rounded-xl border bg-white p-8 shadow-sm">
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="text-gray-600">This page will be implemented next.</p>
        <div className="mt-6">
          <Link className="text-blue-600 hover:underline" to="/">
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}

function ProtectedRoute({ role, children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <TopNav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/resident"
          element={
            <ProtectedRoute role="resident">
              <ResidentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <Navigate to="/admin/appointments" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/appointments"
          element={
            <ProtectedRoute role="admin">
              <AdminAppointments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/registrations"
          element={
            <ProtectedRoute role="admin">
              <AdminRegistrations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/registrations/:id"
          element={
            <ProtectedRoute role="admin">
              <AdminResidentDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/appointments/:id"
          element={
            <ProtectedRoute role="admin">
              <AdminAppointmentDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/documents"
          element={
            <ProtectedRoute role="admin">
              <AdminDocuments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/documents/:id"
          element={
            <ProtectedRoute role="admin">
              <AdminDocumentEditor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/appointments/:id/id-card"
          element={
            <ProtectedRoute role="admin">
              <AdminIDCard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/resident/attachment/:id"
          element={
            <ProtectedRoute role="resident">
              <AttachmentViewer />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </AuthProvider>
  )
}
