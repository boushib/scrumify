import Link from "next/link"

const NotFound = () => (
  <div style={{ height: "100vh", display: "grid", placeItems: "center", textAlign: "center" }}>
    <div>
      <h1 style={{ fontSize: 48 }}>404</h1>
      <p style={{ color: "var(--text-muted)", margin: "8px 0 16px" }}>This page wandered off the board.</p>
      <Link href="/projects" style={{ color: "var(--primary)", fontWeight: 600 }}>
        Back to projects
      </Link>
    </div>
  </div>
)

export default NotFound
