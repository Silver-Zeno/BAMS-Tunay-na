"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Button, Card, CardBody, CardHeader, Field, Input } from "../components/UI"
import { Lock, Mail, ArrowRight } from "lucide-react"

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const onSubmit = (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError("Please fill in all fields")
      return
    }
    setError("")
    setLoading(true)
    login({ email: form.email, password: form.password })
      .then((u) => {
        const dest = u.role === "admin" ? "/admin" : "/resident"
        navigate(dest, { replace: true })
      })
      .catch((err) => {
        setError(err.message || "Login failed")
        setLoading(false)
      })
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center bg-gradient-to- br from-slate-50 to-slate-100 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Lock className="w-6 h-6 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Sign in to manage your appointments</p>
        </CardHeader>
        <CardBody>
          <form onSubmit={onSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive flex items-center gap-2">
                <span className="text-base">⚠️</span>
                {error}
              </div>
            )}

            <Field label="Email address">
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  placeholder="your@email.com"
                  className="pl-10"
                />
              </div>
            </Field>

            <Field label="Password">
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={onChange}
                  placeholder="••••••••"
                  className="pl-10"
                />
              </div>
            </Field>

            <Button type="submit" className="w-full mt-6 flex items-center justify-center gap-2" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </Button>

            <div className="pt-4 border-t text-center text-sm text-muted-foreground">
              No account?{" "}
              <Link className="text-primary font-medium hover:underline" to="/register">
                Create one
              </Link>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
