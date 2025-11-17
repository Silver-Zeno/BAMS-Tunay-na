"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { api } from "../lib/api"
import { Button, Card, CardBody, CardHeader, Field, Input } from "../components/UI"
import { ChevronLeft, Printer, Edit3, Save, RotateCcw } from "lucide-react"

export default function AdminDocumentEditor() {
  const { id } = useParams()
  const [format, setFormat] = useState(null)
  const [error, setError] = useState("")
  const [requester, setRequester] = useState("")
  const [address, setAddress] = useState("")
  const [purpose, setPurpose] = useState("")
  const [birthdate, setBirthdate] = useState("")
  const [sex, setSex] = useState("")
  const [civilStatus, setCivilStatus] = useState("")
  const [contact, setContact] = useState("")
  const [controlNo, setControlNo] = useState("")
  const [issuedAt, setIssuedAt] = useState("")
  const [issuedOn, setIssuedOn] = useState("")
  const [signatureName, setSignatureName] = useState("")
  const printRef = useRef(null)
  const imgWrapRef = useRef(null)
  const [editing, setEditing] = useState(false)
  const [positions, setPositions] = useState({
    name: { x: 40, y: 40 },
    date: { x: 40, y: 70 },
    address: { x: 40, y: 100 },
    purpose: { x: 40, y: 130 },
    birthdate: { x: 40, y: 160 },
    sex: { x: 40, y: 190 },
    civilStatus: { x: 40, y: 220 },
    contact: { x: 40, y: 250 },
    controlNo: { x: 40, y: 280 },
    issuedAt: { x: 40, y: 310 },
    issuedOn: { x: 40, y: 340 },
    signature: { x: 480, y: 760 },
  })
  const [saving, setSaving] = useState(false)
  const dragRef = useRef({ key: null, offsetX: 0, offsetY: 0 })

  useEffect(() => {
    let alive = true
    setError("")
    api
      .getDocumentFormat(id)
      .then((res) => {
        if (!alive) return
        const f = res.format || null
        setFormat(f)
        try {
          const meta = f?.notes ? JSON.parse(f.notes) : null
          if (meta?.positions) {
            setPositions((p) => ({ ...p, ...meta.positions }))
          }
        } catch {}
      })
      .catch((e) => alive && setError(e?.message || "Failed to load format"))
    return () => {
      alive = false
    }
  }, [id])

  const printDoc = () => {
    window.print()
  }

  const startDrag = (key, e) => {
    if (!editing) return
    const wrap = imgWrapRef.current
    if (!wrap) return
    const rect = wrap.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    dragRef.current = { key, offsetX: x - positions[key].x, offsetY: y - positions[key].y }
    window.addEventListener("mousemove", onDrag)
    window.addEventListener("mouseup", endDrag)
  }

  const onDrag = (e) => {
    const wrap = imgWrapRef.current
    const { key, offsetX, offsetY } = dragRef.current
    if (!wrap || !key) return
    const rect = wrap.getBoundingClientRect()
    let x = e.clientX - rect.left - offsetX
    let y = e.clientY - rect.top - offsetY
    x = Math.max(0, Math.min(rect.width - 10, x))
    y = Math.max(0, Math.min(rect.height - 10, y))
    setPositions((p) => ({ ...p, [key]: { x, y } }))
  }

  const endDrag = () => {
    dragRef.current = { key: null, offsetX: 0, offsetY: 0 }
    window.removeEventListener("mousemove", onDrag)
    window.removeEventListener("mouseup", endDrag)
  }

  const saveLayout = async () => {
    try {
      await api.updateDocumentFormat(id, { notes: JSON.stringify({ positions }) })
      setEditing(false)
    } catch (e) {
      setError(e?.message || "Failed to save layout")
    }
  }

  const issue = async () => {
    if (!requester.trim()) {
      setError("Requester name is required")
      return
    }
    try {
      setSaving(true)
      setError("")
      const payload = {
        service_id: format?.service_id || 0,
        format_id: format?.id,
        requester_full_name: requester,
        issued_at: issuedAt || null,
        issued_on: issuedOn || null,
        details: {
          address,
          purpose,
          birthdate,
          sex,
          civilStatus,
          contact,
          controlNo: controlNo || undefined,
          signatureName,
          positions,
        },
        control_no: controlNo || undefined,
      }
      const res = await api.issueDocument(payload)
      setControlNo(res.control_no)
    } catch (e) {
      setError(e?.message || "Failed to issue document")
    } finally {
      setSaving(false)
    }
  }

  if (!format) {
    return (
      <div className="min-h-[calc(100vh-56px)] grid place-items-center bg-slate-50 dark:bg-slate-950 px-4">
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 text-center">
          {error ? (
            <div className="text-red-600 dark:text-red-400 font-medium">{error}</div>
          ) : (
            <div className="text-slate-600 dark:text-slate-400">Loading...</div>
          )}
          <Link
            to="/admin/documents"
            className="mt-4 inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-56px)] bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-5xl px-4 py-8 print:hidden">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Edit Document</h1>
            <p className="mt-1 text-slate-600 dark:text-slate-400">{format.name}</p>
          </div>
          <Link
            to="/admin/documents"
            className="inline-flex items-center gap-2 px-4 py-2 rounded border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </Link>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold">Document Details</h2>
          </CardHeader>
          <CardBody>
            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
                {error}
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Document Format</div>
                <div className="mt-1 font-medium text-slate-900 dark:text-slate-50">{format.name}</div>
              </div>
              <Field label="Requester Name">
                <Input
                  value={requester}
                  onChange={(e) => setRequester(e.target.value)}
                  placeholder="Enter requester's full name"
                />
              </Field>
              <Field label="Requester Address">
                <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Enter address" />
              </Field>
              <Field label="Purpose">
                <Input value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="Enter purpose" />
              </Field>
              <Field label="Birthdate">
                <Input type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} />
              </Field>
              <Field label="Sex">
                <Input value={sex} onChange={(e) => setSex(e.target.value)} placeholder="M/F" />
              </Field>
              <Field label="Civil Status">
                <Input
                  value={civilStatus}
                  onChange={(e) => setCivilStatus(e.target.value)}
                  placeholder="Single/Married/etc"
                />
              </Field>
              <Field label="Contact No.">
                <Input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="e.g., 09xxxxxxxxx" />
              </Field>
              <Field label="Control/Reference No.">
                <Input
                  value={controlNo}
                  onChange={(e) => setControlNo(e.target.value)}
                  placeholder="Auto/Manual number"
                />
              </Field>
              <Field label="Issued At">
                <Input
                  value={issuedAt}
                  onChange={(e) => setIssuedAt(e.target.value)}
                  placeholder="Barangay Hall / City"
                />
              </Field>
              <Field label="Issued On">
                <Input type="date" value={issuedOn} onChange={(e) => setIssuedOn(e.target.value)} />
              </Field>
              <Field label="Signature Name (for line)">
                <Input
                  value={signatureName}
                  onChange={(e) => setSignatureName(e.target.value)}
                  placeholder="Barangay Captain / Requester"
                />
              </Field>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button onClick={printDoc} variant="outline" className="flex items-center gap-2 bg-transparent">
                <Printer className="h-4 w-4" /> Print
              </Button>
              <button
                type="button"
                onClick={() => setEditing((v) => !v)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <Edit3 className="h-4 w-4" /> {editing ? "Stop Editing" : "Edit Layout"}
              </button>
              {editing && (
                <Button onClick={saveLayout} className="flex items-center gap-2">
                  <Save className="h-4 w-4" /> Save Layout
                </Button>
              )}
              <Button
                onClick={issue}
                disabled={saving}
                variant="outline"
                className="flex items-center gap-2 bg-transparent"
              >
                <RotateCcw className="h-4 w-4" /> {saving ? "Saving..." : "Save/Issue"}
              </Button>
            </div>
          </CardBody>
        </Card>

        <div ref={printRef} className="mt-8 bg-white rounded-lg border border-slate-200 dark:border-slate-700 p-4">
          <div id="print-canvas" ref={imgWrapRef} className={`relative mx-auto max-w-4xl`}>
            {format.format_image_url && (
              <img
                src={format.format_image_url || "/placeholder.svg"}
                alt={format.name}
                className="mx-auto w-full max-w-3xl object-contain"
              />
            )}
            <div
              onMouseDown={(e) => startDrag("name", e)}
              className={`${editing ? "cursor-move ring-2 ring-blue-400" : ""} absolute select-none text-[16px] font-medium`}
              style={{ left: positions.name.x, top: positions.name.y }}
            >
              {requester || "________________"}
            </div>
            {controlNo && (
              <div
                className={`${editing ? "cursor-move ring-2 ring-blue-400" : ""} absolute select-none text-[14px]`}
                style={{ left: positions.controlNo?.x ?? 40, top: positions.controlNo?.y ?? 10 }}
              >
                {controlNo}
              </div>
            )}
            <div
              onMouseDown={(e) => startDrag("date", e)}
              className={`${editing ? "cursor-move ring-2 ring-blue-400" : ""} absolute select-none text-[14px]`}
              style={{ left: positions.date.x, top: positions.date.y }}
            >
              {new Date().toLocaleDateString()}
            </div>
            <div
              onMouseDown={(e) => startDrag("address", e)}
              className={`${editing ? "cursor-move ring-2 ring-blue-400" : ""} absolute select-none text-[14px]`}
              style={{ left: positions.address.x, top: positions.address.y }}
            >
              {address || "________________"}
            </div>
            <div
              onMouseDown={(e) => startDrag("purpose", e)}
              className={`${editing ? "cursor-move ring-2 ring-blue-400" : ""} absolute select-none text-[14px]`}
              style={{ left: positions.purpose.x, top: positions.purpose.y }}
            >
              {purpose || "________________"}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #print-canvas, #print-canvas * { visibility: visible !important; }
          #print-canvas { position: absolute; inset: 0; margin: 0; border: none; max-width: 100% !important; }
          body { background: #ffffff !important; }
        }
      `}</style>
    </div>
  )
}
