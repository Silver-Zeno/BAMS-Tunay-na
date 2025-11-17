const API_BASE = '/api'

async function request(path, { method = 'GET', body, headers } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(headers || {}) },
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = data?.error || `Request failed: ${res.status}`
    throw new Error(msg)
  }
  return data
}

export const api = {
  me: () => request('/me'),
  login: (email, password) => request('/login', { method: 'POST', body: { email, password } }),
  register: (payload) => request('/register', { method: 'POST', body: payload }),
  logout: () => request('/logout', { method: 'POST' }),

  listServices: () => request('/services'),

  listAppointments: () => request('/appointments'),
  createAppointment: ({ service_id, preferred_datetime, slot_id, purpose, details }) =>
    request('/appointments', { method: 'POST', body: { service_id, preferred_datetime, slot_id, purpose, details } }),
  updateAppointmentStatus: (id, status) =>
    request(`/appointments/${id}`, { method: 'PATCH', body: { status } }),
  deleteAppointment: (id) => request(`/appointments/${id}`, { method: 'DELETE' }),
  getAppointment: (id) => request(`/appointments/${id}`),

  // Admin: users
  listUsers: () => request('/users'),
  getUser: (id) => request(`/users/${id}`),
  deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE' }),

  // Admin: document formats
  listDocumentFormats: () => request('/document-formats'),
  createDocumentFormat: (payload) => request('/document-formats', { method: 'POST', body: payload }),
  updateDocumentFormat: (id, payload) => request(`/document-formats/${id}`, { method: 'PATCH', body: payload }),
  deleteDocumentFormat: (id) => request(`/document-formats/${id}`, { method: 'DELETE' }),
  getDocumentFormat: (id) => request(`/document-formats/${id}`),

  // Issued documents
  issueDocument: (payload) => request('/issued-documents', { method: 'POST', body: payload }),
  getIssuedDocument: (id) => request(`/issued-documents/${id}`),

  // Uploads
  uploadImage: async (file) => {
    const form = new FormData()
    form.append('file', file)
    const res = await fetch(`${API_BASE}/upload/image`, {
      method: 'POST',
      body: form,
      credentials: 'include',
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data?.error || 'Upload failed')
    return data
  },
}
