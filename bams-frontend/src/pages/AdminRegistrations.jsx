"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardBody, CardHeader, Input, Select } from "../components/UI"
import { Link } from "react-router-dom"
import { api } from "../lib/api"
import { readUsers, writeUsers, deleteUser as storageDeleteUser } from "../lib/storage"
import { Search, Trash2, Eye, Users, CheckCircle2 } from "lucide-react"

export default function AdminRegistrations() {
  const [users, setUsers] = useState([])
  const [query, setQuery] = useState("")
  const [verifiedFilter, setVerifiedFilter] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setUsers(readUsers())
    const load = () =>
      api
        .listUsers()
        .then((res) => {
          const list = res.users || []
          setUsers(list)
          writeUsers(list)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    load()
    const id = setInterval(load, 3000)
    return () => clearInterval(id)
  }, [])

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return users.filter(
      (u) =>
        (u.full_name || "").toLowerCase().includes(q) ||
        String(u.id).toLowerCase().includes(q) ||
        (u.address || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q),
    )
  }, [users, query, verifiedFilter])

  const remove = (id) => {
    if (!window.confirm("Delete this account? This cannot be undone.")) return
    storageDeleteUser(id)
    api
      .deleteUser(id)
      .then(() =>
        api.listUsers().then((res) => {
          const list = res.users || []
          setUsers(list)
          writeUsers(list)
        }),
      )
      .catch((err) => alert(err.message || "Failed to delete user"))
  }

  return (
    <div className="min-h-[calc(100vh-56px)] bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Resident Management</h1>
          </div>
          <p className="text-muted-foreground">Manage and view all registered residents</p>
        </div>

        <Card className="shadow-md">
          <CardHeader className="border-b bg-muted/50">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span className="font-semibold text-foreground">All Residents ({filtered.length})</span>
              </div>
              <div className="flex flex-col md:flex-row gap-3 md:items-center">
                <div className="relative flex-1 md:flex-none md:w-64">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search name, email, ID..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={verifiedFilter} onChange={(e) => setVerifiedFilter(e.target.value)} className="md:w-32">
                  <option value="all">All Status</option>
                  <option value="verified">Verified</option>
                  <option value="unverified">Unverified</option>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            {loading ? (
              <div className="py-8 text-center text-muted-foreground">Loading residents...</div>
            ) : filtered.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">No residents found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/30 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Role</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Address</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((u) => (
                      <tr key={u.id} className="border-b hover:bg-muted/40 transition">
                        <td className="px-6 py-4 font-medium">{u.full_name}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{u.email}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              u.role === "admin" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground truncate max-w-xs">
                          {u.address || "—"}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <Link
                            to={`/admin/registrations/${encodeURIComponent(u.id)}`}
                            className="inline-flex items-center gap-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20 px-3 py-2 text-sm font-medium"
                          >
                            <Eye className="w-4 h-4" /> View
                          </Link>
                          <button
                            onClick={() => remove(u.id)}
                            className="inline-flex items-center gap-1 rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 px-3 py-2 text-sm font-medium"
                          >
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
