"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { FileText, Download, X, File } from "lucide-react"

const APPTS_KEY = "bams_appointments"

function readAppointments() {
  try {
    const raw = localStorage.getItem(APPTS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export default function AttachmentViewer() {
  const { id } = useParams()
  const [items, setItems] = useState(() => readAppointments())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setItems(readAppointments())
    setLoading(false)
  }, [])

  const appt = useMemo(() => items.find((a) => a.id === id), [items, id])
  const att = appt?.attachment

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-56px)] bg-slate-50 flex items-center justify-center">
        <div className="text-muted-foreground">Loading attachment...</div>
      </div>
    )
  }

  if (!appt || !att) {
    return (
      <div className="min-h-[calc(100vh-56px)] bg-slate-50 flex items-center justify-center px-4">
        <div className="rounded-lg border bg-white p-8 text-center space-y-4">
          <File className="w-12 h-12 text-muted-foreground mx-auto" />
          <div>
            <p className="text-lg font-semibold text-foreground">Attachment not found</p>
            <p className="text-sm text-muted-foreground mt-2">
              This attachment doesn't exist or may have been removed.
            </p>
          </div>
          <Link
            to="/resident"
            className="inline-block rounded-lg bg-primary text-primary-foreground px-4 py-2 font-medium hover:bg-primary/90"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const isImage = (att.type || "").startsWith("image/")
  const isPdf = att.type === "application/pdf" || (att.name || "").toLowerCase().endsWith(".pdf")

  return (
    <div className="min-h-[calc(100vh-56px)] bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Reference ID</p>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" />
              {att.name}
            </h1>
            <p className="text-sm text-muted-foreground mt-2">{appt.id}</p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={att.dataUrl}
              download={att.name}
              className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 font-medium hover:bg-primary/90"
            >
              <Download className="w-4 h-4" /> Download
            </a>
            <Link
              to="/resident"
              className="inline-flex items-center justify-center rounded-lg border bg-background hover:bg-muted p-2"
            >
              <X className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Viewer */}
        <div className="rounded-xl border bg-white shadow-md overflow-hidden">
          {isImage && (
            <div className="flex items-center justify-center bg-muted/20 py-12">
              <img
                src={att.dataUrl || "/placeholder.svg"}
                alt={att.name}
                className="max-h-[70vh] max-w-full object-contain"
              />
            </div>
          )}
          {isPdf && <iframe title={att.name} src={att.dataUrl} className="w-full" style={{ height: "70vh" }} />}
          {!isImage && !isPdf && (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <File className="w-16 h-16 text-muted-foreground" />
              <div>
                <p className="font-semibold text-foreground">Preview not available</p>
                <p className="text-sm text-muted-foreground mt-1">This file type cannot be previewed in the browser.</p>
                <p className="text-sm text-muted-foreground">Use the Download button to open it.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
