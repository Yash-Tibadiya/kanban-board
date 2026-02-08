import { cn } from "@/lib/utils";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useBoards, useDeleteBoard } from "@/hooks/use-boards";
import { Button } from "@/components/ui/button";
import { Plus, Layout, Trash2, Settings, Pencil } from "lucide-react";
import { useState } from "react";
import { CreateBoardDialog } from "./create-board-dialog";
import { EditBoardDialog } from "./edit-board-dialog";
import { Board } from "@/lib/api";
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Search } from "lucide-react";

export function DashboardSidebar() {
  const { data: boards, isLoading } = useBoards();
  const location = useLocation();
  const navigate = useNavigate();
  const deleteBoard = useDeleteBoard();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);
  const [deleteBoardId, setDeleteBoardId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBoards = boards?.filter((board) =>
    board.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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
      <div className="p-2 border-b space-y-2">
        <h2 className="text-lg font-semibold tracking-tight">Your Boards</h2>
        <div className="flex w-full items-center gap-2">
          <InputGroup className="flex-1">
            <InputGroupAddon>
              <Search className="h-4 w-4 text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search boards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9"
            />
          </InputGroup>
          <Button
            onClick={() => setIsCreateOpen(true)}
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0 rounded-none border-dashed"
            title="Create New Board"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="px-2 py-4 text-sm text-muted-foreground">
            Loading boards...
          </div>
        ) : filteredBoards?.length === 0 ? (
          <div className="px-2 py-8 flex flex-col items-center justify-center text-center">
            <p className="text-sm text-muted-foreground mb-4">
              No boards found
            </p>
            <Button
              onClick={() => setIsCreateOpen(true)}
              size="sm"
              variant="outline"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create New
            </Button>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredBoards?.map((board) => (
              <div
                key={board.id}
                className={cn(
                  "group flex items-center justify-between pl-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground border border-edge",
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
                <div className="flex items-center ml-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-none min-w-8 w-6 text-muted-foreground hover:text-blue-500 hover:bg-transparent border-x  border-edge"
                    onClick={() => setEditingBoard(board)}
                    title="Edit Board"
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-none min-w-8 w-6 text-muted-foreground hover:text-destructive hover:bg-transparent border-r border-edge"
                    onClick={() => setDeleteBoardId(board.id)}
                    title="Delete Board"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateBoardDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />

      <EditBoardDialog
        open={!!editingBoard}
        onOpenChange={(open) => !open && setEditingBoard(null)}
        board={editingBoard}
      />

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
