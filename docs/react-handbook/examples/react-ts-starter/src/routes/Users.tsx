import React from "react"
import { Link } from "react-router-dom"

export default function Users() {
  const users = [
    { id: 1, name: "Ada" },
    { id: 2, name: "Grace" },
    { id: 3, name: "Linus" },
  ]
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Users</h3>
      <ul className="list-disc pl-5">
        {users.map((u) => (
          <li key={u.id}>
            <Link className="text-blue-600 hover:underline" to={`/users/${u.id}?tab=profile`}>
              {u.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}