import { Navigate } from "react-router-dom";
import { authClient } from "../lib/auth-client";
import DashboardLayout from "@/layouts/DashboardLayout";

export default function Dashboard() {
  const { data: session } = authClient.useSession();

  if (!session) {
    return <Navigate to="/login" />;
  }

  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Team Boards (starter)
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground mt-4">
          Welcome back,{" "}
          <span className="font-semibold text-foreground">
            {session.user.name}
          </span>
          !
        </p>
      </div>
    </DashboardLayout>
  );
}
