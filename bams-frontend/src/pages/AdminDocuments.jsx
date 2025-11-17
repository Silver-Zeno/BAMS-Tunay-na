"use client"

import { useEffect, useState } from "react"
import { api } from "../lib/api"
import { Button, Card, CardBody, CardHeader, Field, Input, Select, Textarea } from "../components/UI"
import { Link } from "react-router-dom"
import { Upload, FileText, Trash2, Edit, Eye } from "lucide-react"

export default function AdminDocuments() {
  const [formats, setFormats] = useState([])
  const [services, setServices] = useState([])
  const [form, setForm] = useState({ service_id: "", name: "", format_image_url: "", notes: "", is_active: 1 })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [loadError, setLoadError] = useState("")
  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState({ service_id: "", name: "", format_image_url: "", notes: "", is_active: 1 })

  const loadAll = async () => {
    setLoadError("")
    try {
      const [fRes, sRes] = await Promise.all([api.listDocumentFormats(), api.listServices()])
      setFormats(fRes.formats || [])
      setServices(sRes.services || [])
    } catch (e) {
      const msg = e?.message || "Failed to load data. Ensure you are logged in as admin and the backend is running."
      setLoadError(msg)
    }
  }

  const onFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError("")
    try {
      const res = await api.uploadImage(file)
      setForm((f) => ({ ...f, format_image_url: res.url }))
    } catch (err) {
      setError(err.message || "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  const onChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? (checked ? 1 : 0) : value }))
  }

  const submit = (e) => {
    e.preventDefault()
    if (!form.service_id || !form.name) {
      setError("Service and Name are required")
      return
    }
    if (!form.format_image_url) {
      setError("Please upload a format image before saving")
      return
    }
    setSaving(true)
    setError("")
    api
      .createDocumentFormat({
        service_id: Number(form.service_id),
        name: form.name,
        format_image_url: form.format_image_url || null,
        notes: form.notes || null,
        is_active: form.is_active ? 1 : 0,
      })
      .then(() => {
        setForm({ service_id: "", name: "", format_image_url: "", notes: "", is_active: 1 })
        loadAll()
      })
      .catch((err) => setError(err.message || "Failed to create"))
      .finally(() => setSaving(false))
  }

  const remove = (id) => {
    if (!window.confirm("Delete this format?")) return
    setSaving(true)
    api
      .deleteDocumentFormat(id)
      .then(loadAll)
      .finally(() => setSaving(false))
  }

  const startEdit = (f) => {
    setEditId(f.id)
    setEditForm({
      service_id: String(f.service_id),
      name: f.name || "",
      format_image_url: f.format_image_url || "",
      notes: f.notes || "",
      is_active: f.is_active ? 1 : 0,
    })
  }

  const cancelEdit = () => {
    setEditId(null)
  }

  const onEditChange = (e) => {
    const { name, value, type, checked } = e.target
    setEditForm((f) => ({ ...f, [name]: type === "checkbox" ? (checked ? 1 : 0) : value }))
  }

  const saveEdit = async () => {
    if (!editForm.service_id || !editForm.name) {
      setError("Service and Name are required")
      return
    }
    if (!editForm.format_image_url) {
      setError("Please upload a format image before saving")
      return
    }
    setSaving(true)
    setError("")
    try {
      await api.updateDocumentFormat(editId, {
        service_id: Number(editForm.service_id),
        name: editForm.name,
        format_image_url: editForm.format_image_url,
        notes: editForm.notes || null,
        is_active: editForm.is_active ? 1 : 0,
      })
      setEditId(null)
      loadAll()
    } catch (err) {
      setError(err.message || "Failed to update")
    } finally {
      setSaving(false)
    }
  }

  const onEditFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError("")
    try {
      const res = await api.uploadImage(file)
      setEditForm((f) => ({ ...f, format_image_url: res.url }))
    } catch (err) {
      setError(err.message || "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Documents</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Create and manage document formats for your services
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <h2 className="text-base font-semibold">Add Document Format</h2>
            </div>
          </CardHeader>
          <CardBody>
            {loadError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
                {loadError}
              </div>
            )}
            <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
              {error && (
                <div className="sm:col-span-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
                  {error}
                </div>
              )}
              <Field label="Service">
                <Select name="service_id" value={form.service_id} onChange={onChange}>
                  <option value="">Select service</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Name">
                <Input name="name" value={form.name} onChange={onChange} placeholder="e.g., Barangay Clearance" />
              </Field>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Upload Format Image
                </label>
                <div className="flex items-center gap-3 p-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <Upload className="h-5 w-5 text-slate-400" />
                  <div className="flex-1">
                    <input type="file" accept="image/*" onChange={onFile} className="block w-full text-sm" />
                    {uploading && (
                      <span className="text-sm text-slate-600 dark:text-slate-400 mt-1 block">Uploading...</span>
                    )}
                  </div>
                  {form.format_image_url && (
                    <img
                      src={form.format_image_url || "/placeholder.svg"}
                      alt="preview"
                      className="h-12 w-20 rounded border border-slate-200 object-cover dark:border-slate-600"
                    />
                  )}
                </div>
              </div>
              <Field label="Notes" className="sm:col-span-2">
                <Textarea name="notes" value={form.notes} onChange={onChange} />
              </Field>
              <div className="flex items-center gap-2">
                <input id="is_active" type="checkbox" name="is_active" checked={!!form.is_active} onChange={onChange} />
                <label htmlFor="is_active" className="text-sm font-medium">
                  Active
                </label>
              </div>
              <div className="sm:col-span-2">
                <Button disabled={saving} type="submit">
                  Save Format
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>

        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <h2 className="text-base font-semibold">Existing Formats ({formats.length})</h2>
            </div>
          </CardHeader>
          <CardBody>
            {formats.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-600 dark:text-slate-400">
                No formats yet. Create your first document format above.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {formats.map((f) => {
                  const serviceName = services.find((s) => s.id === f.service_id)?.name || `Service #${f.service_id}`
                  const isEditing = editId === f.id
                  if (isEditing) {
                    return (
                      <div key={f.id} className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                        <div className="grid gap-3">
                          <Field label="Service">
                            <Select name="service_id" value={editForm.service_id} onChange={onEditChange}>
                              <option value="">Select service</option>
                              {services.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.name}
                                </option>
                              ))}
                            </Select>
                          </Field>
                          <Field label="Name">
                            <Input name="name" value={editForm.name} onChange={onEditChange} />
                          </Field>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                              Upload Image
                            </label>
                            <input type="file" accept="image/*" onChange={onEditFile} />
                            {uploading && (
                              <span className="text-sm text-slate-600 dark:text-slate-400 mt-1 block">
                                Uploading...
                              </span>
                            )}
                            {editForm.format_image_url && (
                              <img
                                src={editForm.format_image_url || "/placeholder.svg"}
                                alt="preview"
                                className="h-12 w-20 rounded border mt-2 object-cover"
                              />
                            )}
                          </div>
                          <Field label="Notes">
                            <Textarea name="notes" value={editForm.notes} onChange={onEditChange} />
                          </Field>
                          <div className="flex items-center gap-2">
                            <input
                              id={`active-${f.id}`}
                              type="checkbox"
                              name="is_active"
                              checked={!!editForm.is_active}
                              onChange={onEditChange}
                            />
                            <label htmlFor={`active-${f.id}`} className="text-sm font-medium">
                              Active
                            </label>
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={saveEdit} disabled={saving}>
                              Save
                            </Button>
                            <button
                              type="button"
                              onClick={cancelEdit}
                              className="px-3 py-2 text-sm border rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  }
                  return (
                    <div
                      key={f.id}
                      className="rounded-lg border border-slate-200 p-4 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        {f.format_image_url && (
                          <img
                            src={f.format_image_url || "/placeholder.svg"}
                            alt={f.name}
                            className="h-16 w-24 rounded object-cover border border-slate-200 dark:border-slate-600"
                          />
                        )}
                        <div className="flex-1">
                          <div className="font-medium text-slate-900 dark:text-slate-50">{f.name}</div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">{serviceName}</div>
                          {f.notes && <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">{f.notes}</div>}
                          {!f.is_active && (
                            <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">Inactive</div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          to={`/admin/documents/${f.id}`}
                          className="flex items-center gap-1 px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        >
                          <Eye className="h-4 w-4" /> Open
                        </Link>
                        <button
                          onClick={() => startEdit(f)}
                          className="flex items-center gap-1 px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        >
                          <Edit className="h-4 w-4" /> Edit
                        </button>
                        <button
                          onClick={() => remove(f.id)}
                          className="flex items-center gap-1 px-2 py-1 text-xs rounded border border-red-300 dark:border-red-800 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition"
                        >
                          <Trash2 className="h-4 w-4" /> Delete
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
