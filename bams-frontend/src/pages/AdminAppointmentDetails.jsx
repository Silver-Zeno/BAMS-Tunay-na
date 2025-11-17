"use client"

import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { api } from "../lib/api"
import {
  ArrowLeft,
  Mail,
  Calendar,
  FileText,
  User,
  MapPin,
  Airplay as Birthday,
  Users,
  Phone,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Edit3,
} from "lucide-react"

export default function AdminAppointmentDetails() {
  const { id } = useParams()
  const [appt, setAppt] = useState(null)
  const [saving, setSaving] = useState(false)
  const [meta, setMeta] = useState(null)

  useEffect(() => {
    let alive = true
    const load = () =>
      api
        .getAppointment(id)
        .then((res) => {
          if (!alive) return
          const a = res.appointment || null
          setAppt(a)
          if (a?.notes) {
            try {
              const j = JSON.parse(a.notes)
              setMeta(j)
            } catch {
              setMeta(null)
            }
          } else {
            setMeta(null)
          }
        })
        .catch(() => {
          if (alive) {
            setAppt(null)
            setMeta(null)
          }
        })
    load()
    const t = setInterval(load, 3000)
    return () => {
      alive = false
      clearInterval(t)
    }
  }, [id])

  if (!appt) {
    return (
      <div className="min-h-[calc(100vh-56px)] bg-gradient-to- br from-slate-50 to-slate-100 grid place-items-center px-4">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-slate-600 mb-4">Appointment not found.</p>
          <Link
            className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
            to="/admin/appointments"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Appointments
          </Link>
        </div>
      </div>
    )
  }

  const setStatus = (status) => {
    setSaving(true)
    api
      .updateAppointmentStatus(appt.id, status)
      .then(() => api.getAppointment(id).then((res) => setAppt(res.appointment || appt)))
      .finally(() => setSaving(false))
  }

  const remove = () => {
    if (!window.confirm("Delete this appointment? This cannot be undone.")) return
    setSaving(true)
    api
      .deleteAppointment(appt.id)
      .then(() => window.location.assign("/admin/appointments"))
      .finally(() => setSaving(false))
  }

  const getStatusDisplay = (status) => {
    const displays = {
      pending: { color: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: Clock },
      approved: { color: "bg-green-50 text-green-700 border-green-200", icon: CheckCircle },
      rejected: { color: "bg-red-50 text-red-700 border-red-200", icon: XCircle },
      completed: { color: "bg-blue-50 text-blue-700 border-blue-200", icon: CheckCircle },
    }
    return displays[status] || displays.pending
  }

  const statusDisplay = getStatusDisplay(appt.status)
  const StatusIcon = statusDisplay.icon

  return (
    <div className="min-h-[calc(100vh-56px)] bg-gradient-to- br from-slate-50 to-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/admin/appointments" className="text-slate-600 hover:text-slate-900 transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-3xl font-bold text-foreground">Appointment Details</h1>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-lg mb-6">
          {/* Header with status badge */}
          <div className="flex items-start justify-between mb-6 pb-6 border-b border-slate-200">
            <div>
              <p className="text-sm text-slate-600 mb-2">Service Request</p>
              <h2 className="text-2xl font-semibold text-slate-900">{appt.service_name}</h2>
            </div>
            <div
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border font-semibold text-sm ${statusDisplay.color}`}
            >
              <StatusIcon className="w-4 h-4" />
              {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
            </div>
          </div>

          {/* Main information grid */}
          <div className="grid gap-6 md:grid-cols-2 mb-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Resident Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-600 uppercase tracking-wide">Name</p>
                  <p className="text-sm font-medium text-slate-900">{appt.resident_name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <a href={`mailto:${appt.resident_email}`} className="text-sm text-primary hover:underline">
                    {appt.resident_email}
                  </a>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Request Details
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-600 uppercase tracking-wide">Reference Number</p>
                  <p className="text-sm font-mono font-medium text-slate-900">{appt.reference_no}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 uppercase tracking-wide">Requested</p>
                  <p className="text-sm text-slate-900">{new Date(appt.created_at).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {appt.preferred_datetime && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-sm font-medium text-blue-900">
                <Calendar className="w-4 h-4" />
                Preferred Appointment: {new Date(appt.preferred_datetime).toLocaleString()}
              </div>
            </div>
          )}

          {(meta?.purpose || appt.notes) && (
            <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <p className="text-xs text-slate-600 uppercase tracking-wide mb-2">Purpose</p>
              <p className="text-sm text-slate-900">{meta?.purpose || appt.notes}</p>
            </div>
          )}

          {meta?.details && (
            <div className="mb-6">
              <h3 className="font-semibold text-slate-900 mb-4">Applicant Details</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {meta.details.address && (
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <MapPin className="w-4 h-4 text-primary flex-shrink- 0 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-600 uppercase tracking-wide">Address</p>
                      <p className="text-sm text-slate-900">{meta.details.address}</p>
                    </div>
                  </div>
                )}
                {meta.details.birthdate && (
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <Birthday className="w-4 h-4 text-primary flex-shrink- 0 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-600 uppercase tracking-wide">Birthdate</p>
                      <p className="text-sm text-slate-900">{meta.details.birthdate}</p>
                    </div>
                  </div>
                )}
                {meta.details.sex && (
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <Users className="w-4 h-4 text-primary flex-shrink- 0 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-600 uppercase tracking-wide">Sex</p>
                      <p className="text-sm text-slate-900">{meta.details.sex}</p>
                    </div>
                  </div>
                )}
                {meta.details.civil_status && (
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <Users className="w-4 h-4 text-primary flex-shrink- 0 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-600 uppercase tracking-wide">Civil Status</p>
                      <p className="text-sm text-slate-900">{meta.details.civil_status}</p>
                    </div>
                  </div>
                )}
                {meta.details.contact_no && (
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <Phone className="w-4 h-4 text-primary flex-shrink- 0 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-600 uppercase tracking-wide">Contact Number</p>
                      <p className="text-sm text-slate-900">{meta.details.contact_no}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          {appt.service_name?.toLowerCase().includes("id") && meta?.details && (
            <Link
              to={`/admin/appointments/${appt.id}/id-card`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-primary bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              Open ID Card
            </Link>
          )}

          <button
            disabled={saving}
            onClick={() => setStatus("approved")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-green-300 bg-green-50 text-green-700 font-medium hover:bg-green-100 transition-colors disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4" />
            Approve
          </button>

          <button
            disabled={saving}
            onClick={() => setStatus("rejected")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-red-300 bg-red-50 text-red-700 font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            <XCircle className="w-4 h-4" />
            Reject
          </button>

          <button
            disabled={saving}
            onClick={() => setStatus("completed")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-blue-300 bg-blue-50 text-blue-700 font-medium hover:bg-blue-100 transition-colors disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4" />
            Complete
          </button>

          <button
            disabled={saving}
            onClick={remove}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-red-200 bg-white text-red-600 font-medium hover:bg-red-50 transition-colors disabled:opacity-50 ml-auto"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
