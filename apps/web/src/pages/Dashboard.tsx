import { Navigate, useParams } from "react-router-dom";
import { authClient } from "../lib/auth-client";
import DashboardLayout from "@/layouts/DashboardLayout";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { DashboardContent } from "@/components/dashboard-content";

export default function Dashboard() {
  const { data: session } = authClient.useSession();
  const { boardId } = useParams<{ boardId: string }>();

  if (!session) {
    return <Navigate to="/login" />;
  }

  return (
    <DashboardLayout>
      <div className="flex h-full w-full">
        <DashboardSidebar />
        <main className="flex-1 overflow-hidden h-full">
          {boardId ? (
            <DashboardContent boardId={boardId} />
          ) : (
            <div className="flex h-full min-h-[calc(100svh-7rem)] flex-col items-center justify-center p-8 text-center bg-muted/5">
              <div className="max-w-md space-y-4">
                <h2 className="text-2xl font-bold tracking-tight">
                  Welcome to Team Boards
                </h2>
                <p className="text-muted-foreground">
                  Select a board from the sidebar to view its tasks, or create a
                  new board to get started.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </DashboardLayout>
  );
}
