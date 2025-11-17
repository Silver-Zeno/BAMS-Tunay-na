"use client"

import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Badge, Button, Card, CardBody, CardHeader, Field, Input, Select } from "../components/UI"
import { api } from "../lib/api"
import { Upload, FileText, Send } from "lucide-react"

export default function ResidentDashboardUpgraded() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [services, setServices] = useState([])
  const [form, setForm] = useState({ service_id: "", preferred_datetime: "", purpose: "" })
  const [applicant, setApplicant] = useState({
    address: "",
    birthdate: "",
    sex: "",
    civil_status: "",
    contact_no: "",
    guardian_name: "",
    photo_url: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api
      .listServices()
      .then((res) => setServices(res.services || []))
      .catch(() => setServices([]))
    const load = () =>
      api
        .listAppointments()
        .then((res) => setItems(res.appointments || []))
        .catch(() => setItems([]))
    load()
    const id = setInterval(load, 3000)
    return () => clearInterval(id)
  }, [])

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  const onApplicantChange = (e) => setApplicant((a) => ({ ...a, [e.target.name]: e.target.value }))
  const onPhoto = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const res = await api.uploadImage(file)
      setApplicant((a) => ({ ...a, photo_url: res.url }))
    } catch (err) {
      setError(err.message || "Photo upload failed")
    }
  }

  const submit = (e) => {
    e.preventDefault()
    if (user?.role !== "resident") {
      setError("Only residents can submit appointment requests.")
      return
    }
    if (!form.service_id) {
      setError("Please select a service.")
      return
    }
    if (!form.purpose.trim()) {
      setError("Please enter the purpose of your request.")
      return
    }
    setError("")
    setLoading(true)
    const selected = services.find((s) => String(s.id) === String(form.service_id))
    const isBarangayId = selected?.name?.toLowerCase().includes("id")
    const details = isBarangayId
      ? {
          address: applicant.address || null,
          birthdate: applicant.birthdate || null,
          sex: applicant.sex || null,
          civil_status: applicant.civil_status || null,
          contact_no: applicant.contact_no || null,
          guardian_name: applicant.guardian_name || null,
          photo_url: applicant.photo_url || null,
        }
      : undefined
    api
      .createAppointment({
        service_id: Number(form.service_id) || 0,
        preferred_datetime: form.preferred_datetime || null,
        purpose: form.purpose || null,
        details,
      })
      .then(() => {
        setForm({ service_id: "", preferred_datetime: "", purpose: "" })
        setApplicant({
          address: "",
          birthdate: "",
          sex: "",
          civil_status: "",
          contact_no: "",
          guardian_name: "",
          photo_url: "",
        })
        return api.listAppointments().then((res) => setItems(res.appointments || []))
      })
      .catch((err) => setError(err.message || "Failed to create appointment"))
      .finally(() => setLoading(false))
  }

  if (user?.role !== "resident") return <Navigate to="/" replace />

  const requestCount = items.length
  const approvedCount = items.filter((i) => i.status === "approved").length
  const pendingCount = items.filter((i) => i.status === "pending").length

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Your Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome, <span className="font-semibold">{user?.name}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="rounded-lg border border-border bg-card p-4 text-center hover:shadow-md transition-shadow">
            <div className="text-2xl font-bold text-foreground mb-1">{requestCount}</div>
            <div className="text-xs text-muted-foreground">Total Requests</div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4 text-center hover:shadow-md transition-shadow">
            <div className="text-2xl font-bold text-primary mb-1">{approvedCount}</div>
            <div className="text-xs text-muted-foreground">Approved</div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4 text-center hover:shadow-md transition-shadow">
            <div className="text-2xl font-bold text-yellow-600 mb-1">{pendingCount}</div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </div>
        </div>

        <div className="grid gap-6">
          <Card className="border-border shadow-sm">
            <CardHeader className="border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <Send className="h-5 w-5 text-primary" />
                <h2 className="text-base font-semibold text-foreground">Request New Appointment</h2>
              </div>
            </CardHeader>
            <CardBody>
              <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
                {error && (
                  <div className="sm:col-span-2 rounded-lg border border-red-300/50 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                  </div>
                )}
                <Field label="Service *">
                  <Select name="service_id" value={form.service_id} onChange={onChange} required>
                    <option value="">Select a service</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Purpose *">
                  <Input
                    required
                    type="text"
                    name="purpose"
                    value={form.purpose}
                    onChange={onChange}
                    placeholder="e.g., Job application, Scholarship"
                  />
                </Field>
                <Field label="Preferred Date/Time">
                  <Input
                    type="datetime-local"
                    name="preferred_datetime"
                    value={form.preferred_datetime}
                    onChange={onChange}
                  />
                </Field>

                {(() => {
                  const sel = services.find((s) => String(s.id) === String(form.service_id))
                  return sel?.name?.toLowerCase().includes("id")
                })() && (
                  <>
                    <div className="sm:col-span-2 mt-4 pt-4 border-t border-border">
                      <div className="flex items-center gap-2 mb-4">
                        <FileText className="h-5 w-5 text-secondary" />
                        <h3 className="font-semibold text-foreground">Additional Information</h3>
                      </div>
                    </div>
                    <Field label="Address">
                      <Input type="text" name="address" value={applicant.address} onChange={onApplicantChange} />
                    </Field>
                    <Field label="Birthdate">
                      <Input type="date" name="birthdate" value={applicant.birthdate} onChange={onApplicantChange} />
                    </Field>
                    <Field label="Sex">
                      <Input
                        type="text"
                        name="sex"
                        value={applicant.sex}
                        onChange={onApplicantChange}
                        placeholder="M/F"
                      />
                    </Field>
                    <Field label="Civil Status">
                      <Input
                        type="text"
                        name="civil_status"
                        value={applicant.civil_status}
                        onChange={onApplicantChange}
                      />
                    </Field>
                    <Field label="Contact No.">
                      <Input type="text" name="contact_no" value={applicant.contact_no} onChange={onApplicantChange} />
                    </Field>
                    <Field label="Guardian Name (if minor)">
                      <Input
                        type="text"
                        name="guardian_name"
                        value={applicant.guardian_name}
                        onChange={onApplicantChange}
                      />
                    </Field>
                    <div className="sm:col-span-2 flex items-center gap-3 p-3 border border-border rounded-lg bg-muted/30">
                      <Upload className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <input type="file" accept="image/*" onChange={onPhoto} className="flex-1 text-sm" />
                      {applicant.photo_url && (
                        <img
                          src={applicant.photo_url || "/placeholder.svg"}
                          alt="photo"
                          className="h-10 w-10 rounded-full border border-border object-cover"
                        />
                      )}
                    </div>
                  </>
                )}

                <div className="sm:col-span-2">
                  <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                    {loading ? "Submitting..." : "Submit Request"}
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader className="border-b border-border pb-4">
              <h2 className="text-base font-semibold text-foreground">My Appointments</h2>
            </CardHeader>
            <CardBody className="p-0">
              <div className="divide-y divide-border">
                {items.length === 0 && (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No appointments yet. Create one above to get started.
                  </div>
                )}
                {items.map((it) => (
                  <div key={it.id} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-foreground mb-1">{it.service}</div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div>Reference: {it.reference_no}</div>
                          <div>Requested: {new Date(it.created_at).toLocaleString()}</div>
                          {it.notes && <div>Purpose: {it.notes}</div>}
                        </div>
                      </div>
                      <Badge status={it.status} />
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
