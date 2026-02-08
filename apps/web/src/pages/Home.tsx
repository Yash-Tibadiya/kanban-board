import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: 24 }}>
      <h1 style={{ margin: 0 }}>Welcome to Team Boards</h1>
      <p style={{ maxWidth: 760, lineHeight: 1.4 }}>
        A simple kanban board for your team.
      </p>
      <div style={{ marginTop: 16 }}>
        <Link to="/login" style={{ marginRight: 16 }}>
          Login
        </Link>
        <Link to="/dashboard">Dashboard</Link>
      </div>
    </div>
  );
}
