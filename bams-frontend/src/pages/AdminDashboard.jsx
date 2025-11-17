"use client"

import { useEffect, useState } from "react"
import { useAuth } from "../context/AuthContext"
import { Badge, Button, Card, CardBody, CardHeader } from "../components/UI"
import { readUsers } from "../lib/storage"
import { Users, Calendar, CheckCircle, Clock } from "lucide-react"

const APPTS_KEY = "bams_appointments"

function readAppointments() {
  try {
    const raw = localStorage.getItem(APPTS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeAppointments(items) {
  localStorage.setItem(APPTS_KEY, JSON.stringify(items))
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [items, setItems] = useState(() => readAppointments())
  const [users, setUsers] = useState(() => readUsers())

  useEffect(() => {
    const id = setInterval(() => setItems(readAppointments()), 1500)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const id = setInterval(() => setUsers(readUsers()), 2000)
    return () => clearInterval(id)
  }, [])

  const updateStatus = (id, status) => {
    const next = readAppointments().map((it) => (it.id === id ? { ...it, status } : it))
    writeAppointments(next)
    setItems(next)
  }

  const stats = {
    totalAppointments: items.length,
    pending: items.filter((i) => i.status === "pending").length,
    approved: items.filter((i) => i.status === "approved").length,
    completed: items.filter((i) => i.status === "completed").length,
    newRegistrations: users.length,
  }

  return (
    <div className="min-h-[calc(100vh-56px)] bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Admin Dashboard</h1>
              <p className="mt-1 text-slate-600 dark:text-slate-400">
                Welcome back, <span className="font-medium text-slate-900 dark:text-slate-200">{user?.name}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Appointments</p>
                <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50">{stats.totalAppointments}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Pending</p>
                <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Approved</p>
                <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50">{stats.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Completed</p>
                <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-500" />
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">New Users</p>
                <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50">{stats.newRegistrations}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <h2 className="text-base font-semibold">New Registrations</h2>
            </div>
          </CardHeader>
          <CardBody>
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {users.length === 0 && (
                <div className="py-6 text-sm text-slate-600 dark:text-slate-400">No registrations yet.</div>
              )}
              {users.map((u) => (
                <div key={u.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    {u.profile?.idPhotoDataUrl ? (
                      <img
                        src={u.profile.idPhotoDataUrl || "/placeholder.svg"}
                        alt={u.name}
                        className="h-12 w-12 rounded-lg border border-slate-200 object-cover dark:border-slate-600"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-lg border border-slate-200 bg-slate-100 grid place-items-center text-xs text-slate-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-400">
                        ID
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-50">
                        {u.name} <span className="text-slate-500 dark:text-slate-400">• {u.role}</span>
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">{u.id}</div>
                      {u.profile && (
                        <div className="text-xs text-slate-500 dark:text-slate-500">
                          {u.profile.address} • {u.profile.birthDate}
                          {u.profile.phone ? ` • ${u.profile.phone}` : ""}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <h2 className="text-base font-semibold">All Appointments</h2>
            </div>
          </CardHeader>
          <CardBody>
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {items.length === 0 && (
                <div className="py-6 text-sm text-slate-600 dark:text-slate-400">No appointments yet.</div>
              )}
              {items.map((it) => (
                <div key={it.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-slate-900 dark:text-slate-50">
                      {it.docType} <span className="text-slate-500 dark:text-slate-400">• {it.requester}</span>
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Purpose: {it.purpose}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-500">
                      Requested: {new Date(it.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge status={it.status} />
                    <Button size="sm" variant="outline" onClick={() => updateStatus(it.id, "approved")}>
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => updateStatus(it.id, "declined")}>
                      Decline
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => updateStatus(it.id, "completed")}>
                      Complete
                    </Button>
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
