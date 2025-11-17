export function Card({ className = '', children }) {
  return (
    <div className={`rounded-xl border border-gray-200 bg-white shadow-sm ${className}`}>
      {children}
    </div>
  )
}

export function CardHeader({ className = '', children }) {
  return <div className={`border-b px-4 py-3 ${className}`}>{children}</div>
}

export function CardBody({ className = '', children }) {
  return <div className={`px-4 py-4 ${className}`}>{children}</div>
}

export function Button({ variant = 'primary', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors'
  const styles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-300 hover:bg-gray-50',
    ghost: 'hover:bg-gray-100',
    danger: 'bg-red-600 text-white hover:bg-red-700'
  }
  return <button className={`${base} ${styles[variant]} ${className}`} {...props} />
}

export function Input({ className = '', ...props }) {
  return <input className={`w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`} {...props} />
}

export function Select({ className = '', ...props }) {
  return <select className={`w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`} {...props} />
}

export function Label({ className = '', children }) {
  return <span className={`text-sm text-gray-700 ${className}`}>{children}</span>
}

export function Field({ label, children }) {
  return (
    <label className="grid gap-1">
      <Label>{label}</Label>
      {children}
    </label>
  )
}

export function Textarea({ className = '', ...props }) {
  return <textarea className={`w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`} {...props} />
}

export function Badge({ status }) {
  const map = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    declined: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800'
  }
  return <span className={`rounded px-2 py-1 text-xs font-medium ${map[status] || 'bg-gray-100 text-gray-800'}`}>{status}</span>
}

