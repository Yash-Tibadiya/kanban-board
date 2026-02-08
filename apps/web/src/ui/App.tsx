import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import { authClient } from "../lib/auth-client";

function Home() {
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

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}
