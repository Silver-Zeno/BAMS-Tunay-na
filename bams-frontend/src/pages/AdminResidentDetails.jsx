"use client"

import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { Card, CardBody, CardHeader } from "../components/UI"
import { api } from "../lib/api"
import { ArrowLeft, User, Mail, MapPin, Phone, Calendar, Bird as ID } from "lucide-react"

export default function AdminResidentDetails() {
  const { id } = useParams()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    const load = () =>
      api
        .getUser(id)
        .then((res) => alive && (setUser(res.user || null), setLoading(false)))
        .catch(() => alive && (setUser(null), setLoading(false)))
    load()
    const t = setInterval(load, 5000)
    return () => {
      alive = false
      clearInterval(t)
    }
  }, [id])

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-56px)] bg-slate-50 flex items-center justify-center">
        <div className="text-muted-foreground">Loading resident details...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-56px)] bg-slate-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardBody className="text-center space-y-4">
            <div className="text-lg font-semibold">Resident not found</div>
            <p className="text-sm text-muted-foreground">The resident you're looking for doesn't exist.</p>
            <Link
              to="/admin/registrations"
              className="inline-block rounded-lg bg-primary text-primary-foreground px-4 py-2 font-medium hover:bg-primary/90"
            >
              ← Back to Residents
            </Link>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-56px)] bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Link
          to="/admin/registrations"
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-6 font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Residents
        </Link>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="md:col-span-1 shadow-md">
            <CardBody className="text-center space-y-4">
              <div className="h-32 w-32 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-16 h-16 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">{user.full_name}</h2>
                <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary capitalize">
                  {user.role}
                </span>
              </div>
            </CardBody>
          </Card>

          {/* Details Card */}
          <Card className="md:col-span-2 shadow-md">
            <CardHeader className="border-b bg-muted/50">
              <h3 className="text-lg font-semibold text-foreground">Resident Information</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    <ID className="w-4 h-4" /> Resident ID
                  </label>
                  <p className="text-foreground font-medium">{user.id}</p>
                </div>
                <div className="space-y-1">
                  <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    <Mail className="w-4 h-4" /> Email Address
                  </label>
                  <p className="text-foreground font-medium break-all">{user.email}</p>
                </div>
              </div>

              {user.address && (
                <div className="space-y-1 pt-4 border-t">
                  <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    <MapPin className="w-4 h-4" /> Address
                  </label>
                  <p className="text-foreground">{user.address}</p>
                </div>
              )}

              {user.phone && (
                <div className="space-y-1 pt-4 border-t">
                  <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    <Phone className="w-4 h-4" /> Phone Number
                  </label>
                  <p className="text-foreground font-medium">{user.phone}</p>
                </div>
              )}

              {user.birth_date && (
                <div className="space-y-1 pt-4 border-t">
                  <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    <Calendar className="w-4 h-4" /> Birth Date
                  </label>
                  <p className="text-foreground font-medium">{user.birth_date}</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
