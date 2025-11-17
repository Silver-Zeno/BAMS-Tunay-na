"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardBody, CardHeader, Input, Select } from "../components/UI"
import { Link } from "react-router-dom"
import { api } from "../lib/api"
import { Search, Filter, Calendar, Users, CheckCircle, Clock, AlertCircle, Trash2 } from "lucide-react"

export default function AdminAppointments() {
  const [items, setItems] = useState([])
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [savingId, setSavingId] = useState(null)

  useEffect(() => {
    const load = () =>
      api
        .listAppointments()
        .then((res) => setItems(res.appointments || []))
        .catch(() => setItems([]))
    load()
    const id = setInterval(load, 3000)
    return () => clearInterval(id)
  }, [])

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return items
      .filter((it) => {
        const resident = String(it.resident || "").toLowerCase()
        const service = String(it.service || "").toLowerCase()
        const ref = String(it.reference_no || "").toLowerCase()
        return resident.includes(q) || service.includes(q) || ref.includes(q)
      })
      .filter((it) => (statusFilter === "all" ? true : it.status === statusFilter))
  }, [items, query, statusFilter])

  const setStatus = (id, status) => {
    setSavingId(id)
    api
      .updateAppointmentStatus(id, status)
      .then(() => api.listAppointments().then((res) => setItems(res.appointments || [])))
      .finally(() => setSavingId(null))
  }

  const remove = (id) => {
    if (!window.confirm("Delete this appointment? This cannot be undone.")) return
    setSavingId(id)
    api
      .deleteAppointment(id)
      .then(() => api.listAppointments().then((res) => setItems(res.appointments || [])))
      .finally(() => setSavingId(null))
  }

  const getStatusStyle = (status) => {
    const styles = {
      pending: "bg-yellow-50 text-yellow-700 border-yellow-200 ring-1 ring-yellow-100",
      approved: "bg-green-50 text-green-700 border-green-200 ring-1 ring-green-100",
      rejected: "bg-red-50 text-red-700 border-red-200 ring-1 ring-red-100",
      completed: "bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-100",
    }
    return styles[status] || styles.pending
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />
      case "approved":
        return <CheckCircle className="w-4 h-4" />
      case "rejected":
        return <AlertCircle className="w-4 h-4" />
      case "completed":
        return <CheckCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] bg-gradient-to- br from-slate-50 to-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Appointments</h1>
          </div>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to- br from-slate-50 to-slate-100 border-b">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-slate-600" />
                <span className="font-semibold text-slate-900">All Appointments</span>
              </div>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-3">
                <div className="relative flex-1 lg:max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search requester, service, reference..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="lg:w-40">
                  <option value="all">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="completed">Completed</option>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            <div className="divide-y">
              {filtered.length === 0 && (
                <div className="py-12 text-center text-slate-500">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No matching appointments found</p>
                </div>
              )}
              {filtered.map((it) => (
                <div
                  key={it.id}
                  className="flex flex-col gap-4 p-4 hover:bg-slate-50 transition-colors lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900">{it.service}</div>
                    <div className="flex items-center gap-1 text-sm text-slate-600 mt-1">
                      <Users className="w-4 h-4" />
                      {it.resident}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                      <Clock className="w-3 h-3" />
                      {new Date(it.created_at).toLocaleString()}
                      <span className="text-slate-400">•</span>
                      <span>Ref: {it.reference_no}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold border ${getStatusStyle(it.status)}`}
                    >
                      {getStatusIcon(it.status)}
                      {it.status.charAt(0).toUpperCase() + it.status.slice(1)}
                    </span>

                    <Link
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                      to={`/admin/appointments/${encodeURIComponent(it.id)}`}
                    >
                      View
                    </Link>

                    <Select
                      value=""
                      onChange={(e) => e.target.value && setStatus(it.id, e.target.value)}
                      className="text-xs"
                    >
                      <option value="">Update</option>
                      <option value="approved">Approve</option>
                      <option value="rejected">Reject</option>
                      <option value="completed">Complete</option>
                      <option value="cancelled">Cancel</option>
                    </Select>

                    <button
                      onClick={() => remove(it.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete appointment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {savingId === it.id && <span className="text-xs text-slate-500 whitespace-nowrap">Saving…</span>}
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
