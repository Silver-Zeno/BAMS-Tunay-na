"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Button, Card, CardBody, CardHeader, Field, Input } from "../components/UI"
import { CheckCircle2, Upload, User, Mail, Lock, MapPin, Calendar, Phone, Shield } from "lucide-react"

export default function Register() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    birthDate: "",
    phone: "",
    barangayId: "",
    idPhotoDataUrl: "",
    role: "resident",
  })
  const [error, setError] = useState("")
  const [preview, setPreview] = useState("")
  const [success, setSuccess] = useState(null)
  const [loading, setLoading] = useState(false)

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const onFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const url = String(reader.result)
      setForm((f) => ({ ...f, idPhotoDataUrl: url }))
      setPreview(url)
    }
    reader.readAsDataURL(file)
  }

  const onSubmit = (e) => {
    e.preventDefault()
    if (!form.email || !form.password || !form.name || !form.address || !form.birthDate) {
      setError("Please fill in all required fields")
      return
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }
    setError("")
    setLoading(true)

    const payload = { full_name: form.name, email: form.email, password: form.password, role: form.role }

    setTimeout(() => {
      setSuccess({ name: form.name, email: form.email, role: form.role })
      setForm({
        name: "",
        email: "",
        password: "",
        address: "",
        birthDate: "",
        phone: "",
        barangayId: "",
        idPhotoDataUrl: "",
        role: "resident",
      })
      setPreview("")
      setLoading(false)
    }, 500)
  }

  if (success) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center bg-gradient-to -br from-green-50 to-emerald-50 px-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardBody className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Account created!</h2>
              <p className="text-sm text-muted-foreground mt-1">Welcome to BAMS</p>
            </div>
            <div className="space-y-2 bg-muted/50 rounded-lg p-4 text-left text-sm">
              <div>
                <span className="text-muted-foreground">Name:</span> <span className="font-medium">{success.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Email:</span>{" "}
                <span className="font-medium">{success.email}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Role:</span>{" "}
                <span className="font-medium capitalize">{success.role}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <Link
                to="/login"
                className="w-full rounded-lg bg-primary text-primary-foreground py-2 text-center font-medium hover:bg-primary/90"
              >
                Go to Login
              </Link>
              {success.role === "admin" && (
                <Link
                  to="/admin/appointments"
                  className="w-full rounded-lg border text-foreground py-2 text-center font-medium hover:bg-muted"
                >
                  Admin Dashboard
                </Link>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-56px)] bg-gradient-to- br from-slate-50 to-slate-100 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <Card className="shadow-lg">
          <CardHeader className="space-y-2 text-center border-b">
            <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
            <p className="text-sm text-muted-foreground">Join BAMS to book appointments</p>
          </CardHeader>
          <CardBody>
            <form onSubmit={onSubmit} className="space-y-5">
              {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Full name *">
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input name="name" value={form.name} onChange={onChange} className="pl-10" />
                  </div>
                </Field>
                <Field label="Email *">
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input type="email" name="email" value={form.email} onChange={onChange} className="pl-10" />
                  </div>
                </Field>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Password *">
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={onChange}
                      className="pl-10"
                    />
                  </div>
                </Field>
                <Field label="Birth date *">
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input type="date" name="birthDate" value={form.birthDate} onChange={onChange} className="pl-10" />
                  </div>
                </Field>
              </div>

              <Field label="Address *">
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    name="address"
                    value={form.address}
                    onChange={onChange}
                    placeholder="House No., Street, Purok/Sitio, Barangay"
                    className="pl-10"
                  />
                </div>
              </Field>

              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Phone number">
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      name="phone"
                      value={form.phone}
                      onChange={onChange}
                      placeholder="09XXXXXXXXX"
                      className="pl-10"
                    />
                  </div>
                </Field>
                <Field label="Barangay ID / Household No.">
                  <Input name="barangayId" value={form.barangayId} onChange={onChange} placeholder="e.g. BRGY-XXXX" />
                </Field>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Upload className="w-4 h-4" /> ID Photo (optional)
                </label>
                <input accept="image/*" type="file" onChange={onFile} className="block w-full text-sm" />
                {preview && (
                  <div className="mt-2">
                    <img
                      alt="ID preview"
                      src={preview || "/placeholder.svg"}
                      className="h-24 w-24 rounded-lg object-cover border"
                    />
                  </div>
                )}
              </div>

              <Field label="Account type *">
                <div className="relative">
                  <Shield className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <select
                    name="role"
                    value={form.role}
                    onChange={onChange}
                    className="w-full rounded-lg border pl-10 pr-4 py-2"
                  >
                    <option value="resident">Resident</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </Field>

              <Button type="submit" className="w-full mt-6" disabled={loading}>
                {loading ? "Creating account..." : "Create account"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
