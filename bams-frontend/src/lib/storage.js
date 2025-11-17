const USERS_KEY = 'bams_users'

export function readUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function writeUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function setUserVerified(userId, verified) {
  const users = readUsers()
  const next = users.map((u) => u.id === userId ? { ...u, verified: Boolean(verified) } : u)
  writeUsers(next)
  return next
}

export function deleteUser(userId) {
  const users = readUsers().filter((u) => u.id !== userId)
  writeUsers(users)
  return users
}

