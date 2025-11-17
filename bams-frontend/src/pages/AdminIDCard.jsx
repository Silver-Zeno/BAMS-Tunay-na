"use client"

import { useEffect, useState, useRef } from "react"
import { Link, useParams } from "react-router-dom"
import { api } from "../lib/api"
import { Button, Card, CardBody, CardHeader } from "../components/UI"
import { Upload, FileText, PrinterIcon, CheckCircle, AlertCircle } from "lucide-react"

export default function AdminIDCard() {
  const { id } = useParams()
  const [appt, setAppt] = useState(null)
  const [meta, setMeta] = useState(null)
  const [error, setError] = useState("")
  const printRef = useRef(null)
  const [issuing, setIssuing] = useState(false)
  const [idNo, setIdNo] = useState("")
  const [uploading, setUploading] = useState(false)
  const [photoFailed, setPhotoFailed] = useState(false)

  const resolveUrl = (u) => {
    if (!u) return ""
    try {
      return new URL(u, window.location.origin).href
    } catch {
      return u
    }
  }

  useEffect(() => {
    let alive = true
    const load = async () => {
      try {
        const res = await api.getAppointment(id)
        if (!alive) return
        const a = res.appointment || null
        setAppt(a)
        if (a?.notes) {
          try {
            setMeta(JSON.parse(a.notes))
          } catch {
            setMeta(null)
          }
        } else setMeta(null)
        setIdNo("")
      } catch (e) {
        if (!alive) return
        setError(e?.message || "Failed to load appointment")
      }
    }
    load()
    return () => {
      alive = false
    }
  }, [id])

  useEffect(() => {
    setPhotoFailed(false)
  }, [meta?.details?.photo_url])

  const printCard = () => window.print()

  const issueId = async () => {
    if (!appt) return
    if (!(meta && meta.details && meta.details.photo_url)) {
      setError("Photo is required before issuing the ID.")
      return
    }
    try {
      setIssuing(true)
      const payload = {
        service_id: appt.service_id,
        format_id: 0,
        requester_full_name: appt.resident_name,
        issued_at: "Barangay Hall",
        issued_on: new Date().toISOString().slice(0, 10),
        details: meta?.details || {},
      }
      const res = await api.issueDocument(payload)
      setIdNo(res.control_no)
    } finally {
      setIssuing(false)
    }
  }

  const onPhoto = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setUploading(true)
      const res = await api.uploadImage(file)
      setMeta((m) => ({ ...(m || {}), details: { ...(m?.details || {}), photo_url: res.url } }))
      setError("")
    } catch (err) {
      setError(err?.message || "Photo upload failed")
    } finally {
      setUploading(false)
    }
  }

  if (!appt) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
        <Card className="w-full max-w-md">
          <CardBody className="flex flex-col items-center gap-4 text-center">
            <AlertCircle className="w-8 h-8 text-blue-600" />
            <p className="text-sm text-gray-600">{error || "Loading appointment data..."}</p>
            <Link to={`/admin/appointments/${id}`}>
              <Button variant="outline" className="w-full bg-transparent">
                ← Back to Appointments
              </Button>
            </Link>
          </CardBody>
        </Card>
      </div>
    )
  }

  const d = meta?.details || {}
  const fullName = appt?.resident_name || "—"
  const address = d.address || "—"
  const birthdate = d.birthdate || "—"
  const sex = d.sex || "—"
  const civilStatus = d.civil_status || "—"
  const contact = d.contact_no || "—"
  const guardian = d.guardian_name || "—"
  const photoUrl = resolveUrl(d.photo_url || "")
  const issuedOn = new Date().toISOString().slice(0, 10)
  const expiry = (() => {
    const base = issuedOn
    const dt = new Date(base)
    dt.setFullYear(dt.getFullYear() + 3)
    return dt.toISOString().slice(0, 10)
  })()
  const controlNo = idNo || appt.reference_no

  return (
    <div className="min-h-[calc(100vh-56px)] bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8 flex items-center justify-between print:hidden">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Barangay ID Card</h1>
            <p className="text-sm text-gray-500 mt-1">Create and issue official ID cards</p>
          </div>
          <Link to={`/admin/appointments/${id}`}>
            <Button variant="outline">← Back to Appointments</Button>
          </Link>
        </div>

        <Card className="print:hidden mb-8">
          <CardHeader className="border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Photo & Issuance</h2>
                <p className="text-sm text-gray-500 mt-1">Upload photo and issue ID number</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={issueId} disabled={issuing || !photoUrl} className="gap-2">
                  {idNo ? "Re-Issue ID" : "Issue ID No."}
                </Button>
                <Button onClick={printCard} variant="secondary" className="gap-2">
                  <PrinterIcon className="w-4 h-4" />
                  Print
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="sm:col-span-1">
                <label className="block mb-2 text-sm font-medium text-gray-700">Photo</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onPhoto}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div
                    className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                      photoUrl ? "border-green-300 bg-green-50" : "border-gray-300 bg-gray-50 hover:border-blue-400"
                    }`}
                  >
                    {uploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm text-gray-600">Uploading...</span>
                      </div>
                    ) : photoUrl && !photoFailed ? (
                      <div className="flex flex-col items-center gap-2">
                        <img
                          src={photoUrl || "/placeholder.svg"}
                          alt="photo"
                          className="w-20 h-20 rounded-lg object-cover"
                          onError={() => setPhotoFailed(true)}
                        />
                        <span className="text-xs text-green-600 font-medium">✓ Photo uploaded</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="w-6 h-6 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">Upload Photo</span>
                        <span className="text-xs text-gray-500">or drag and drop</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="sm:col-span-2 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Service</p>
                    <p className="text-sm font-medium text-gray-900">{appt.service_name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">Reference No.</p>
                    <p className="text-sm font-medium text-gray-900">{appt.reference_no}</p>
                  </div>
                </div>
                {idNo && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-green-900 uppercase">Issued ID No.</p>
                      <p className="text-sm font-semibold text-green-900">{idNo}</p>
                    </div>
                  </div>
                )}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}
              </div>
            </div>
          </CardBody>
        </Card>

        <div ref={printRef} className="mt-8">
          <div
            id="idcard-canvas"
            className="mx-auto max-w-2xl rounded-2xl border-8 border-gray-200 bg-white shadow-2xl print:shadow-none overflow-hidden"
          >
            <div className="p-8 space-y-6">
              <div className="border-b-4 border-blue-600 pb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">BARANGAY ID</h3>
                    <p className="text-xs text-gray-500">Official Identification</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Reference</p>
                  <p className="text-sm font-bold text-gray-900">{controlNo}</p>
                </div>
              </div>

              <div className="grid grid-cols-[180px_1fr] gap-6">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-full aspect-square rounded-lg border-2 border-gray-300 bg-gray-100 overflow-hidden flex items-center justify-center text-gray-500 text-sm font-medium">
                    {photoUrl && !photoFailed ? (
                      <img
                        src={photoUrl || "/placeholder.svg"}
                        alt="Photo"
                        className="w-full h-full object-cover"
                        onError={() => setPhotoFailed(true)}
                      />
                    ) : (
                      "Photo"
                    )}
                  </div>
                  <div className="text-center text-xs text-gray-600 w-full border-t pt-2">
                    <p className="font-medium">4x6 Photo</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Full Name</p>
                      <p className="text-base font-bold text-gray-900">{fullName}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Sex</p>
                      <p className="text-base font-bold text-gray-900">{sex}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Address</p>
                    <p className="text-sm text-gray-900">{address}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Birthdate</p>
                      <p className="text-sm font-medium text-gray-900">{birthdate}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Civil Status</p>
                      <p className="text-sm font-medium text-gray-900">{civilStatus}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Contact</p>
                      <p className="text-sm font-medium text-gray-900">{contact}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t-2 border-gray-200 pt-4 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Issued On</p>
                  <p className="font-bold text-gray-900">{issuedOn}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Valid Until</p>
                  <p className="font-bold text-gray-900">{expiry}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Guardian</p>
                  <p className="font-bold text-gray-900">{guardian}</p>
                </div>
              </div>

              <div className="border-t-2 border-gray-200 pt-4 grid grid-cols-2 gap-6 text-center">
                <div>
                  <div className="h-12 border-b border-gray-400 mb-2" />
                  <p className="text-xs font-medium text-gray-600">Signature of Bearer</p>
                </div>
                <div>
                  <div className="h-12 border-b border-gray-400 mb-2" />
                  <p className="text-xs font-medium text-gray-600">Official Seal</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #idcard-canvas, #idcard-canvas * { visibility: visible !important; }
          #idcard-canvas { position: absolute; inset: 0; margin: 0; border: none; box-shadow: none !important; }
        }
      `}</style>
    </div>
  )
}
