import { authClient } from "../lib/auth-client";
import { Navigate } from "react-router-dom";

export default function Dashboard() {
  const { data: session } = authClient.useSession();

  if (!session) {
    return <Navigate to="/login" />;
  }

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: 24 }}>
      <h1 style={{ margin: 0 }}>Team Boards (starter)</h1>
      <p style={{ maxWidth: 760, lineHeight: 1.4 }}>
        Welcome, {session.user.name}!
      </p>
      <button
        onClick={() => authClient.signOut()}
        style={{ marginTop: 16, padding: "8px 16px", cursor: "pointer" }}
      >
        Sign Out
      </button>
    </div>
  );
}
