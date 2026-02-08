import { cn } from "@/lib/utils";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useBoards, useDeleteBoard } from "@/hooks/use-boards";
import { Button } from "@/components/ui/button";
import { Plus, Layout, Trash2, Settings } from "lucide-react";
import { useState } from "react";
import { CreateBoardDialog } from "./create-board-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export function DashboardSidebar() {
  const { data: boards, isLoading } = useBoards();
  const location = useLocation();
  const navigate = useNavigate();
  const deleteBoard = useDeleteBoard();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteBoardId, setDeleteBoardId] = useState<string | null>(null);

  const currentBoardId = location.pathname.startsWith("/dashboard/")
    ? location.pathname.split("/dashboard/")[1]
    : null;

  const handleDeleteConfirm = () => {
    if (deleteBoardId) {
      deleteBoard.mutate(deleteBoardId, {
        onSuccess: () => {
          toast.success("Board deleted");
          setDeleteBoardId(null);
          if (currentBoardId === deleteBoardId) {
            navigate("/dashboard");
          }
        },
        onError: () => {
          toast.error("Failed to delete board");
        },
      });
    }
  };

  return (
    <div className="w-64 min-h-[calc(100svh-7rem)] border-r bg-background flex flex-col h-full sticky top-0">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold tracking-tight mb-2 px-2">
          Your Boards
        </h2>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="w-full justify-start"
          variant="outline"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create New Board
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="px-2 py-4 text-sm text-muted-foreground">
            Loading boards...
          </div>
        ) : boards?.length === 0 ? (
          <div className="px-2 py-4 text-sm text-muted-foreground text-center">
            No boards yet
          </div>
        ) : (
          <div className="space-y-1">
            {boards?.map((board) => (
              <div
                key={board.id}
                className={cn(
                  "group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  currentBoardId === board.id
                    ? "bg-accent text-accent-foreground"
                    : "transparent",
                )}
              >
                <Link
                  to={`/dashboard/${board.id}`}
                  className="flex items-center flex-1 truncate"
                >
                  <Layout className="mr-2 h-4 w-4" />
                  <span className="truncate">{board.title}</span>
                </Link>
                <div className="hidden group-hover:flex items-center ml-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setDeleteBoardId(board.id)}
                  >
                    <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateBoardDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />

      <AlertDialog
        open={!!deleteBoardId}
        onOpenChange={(open) => !open && setDeleteBoardId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              board and all its contents.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
