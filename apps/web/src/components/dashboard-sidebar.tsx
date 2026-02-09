import { cn } from "@/lib/utils";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  useBoards,
  useDeleteBoard,
  useReorderBoards,
  boardKeys,
} from "@/hooks/use-boards";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Layout, Trash2, Pencil, Search } from "lucide-react";
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

interface DashboardSidebarProps {
  isOpen?: boolean;
}

export function DashboardSidebar({ isOpen = true }: DashboardSidebarProps) {
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

  const { mutate: reorderBoards } = useReorderBoards();
  const queryClient = useQueryClient();

  const onDragEnd = (result: DropResult) => {
    const { destination, source } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Determine if we are reordering the full list or filtered list
    // If search query is active, we probably shouldn't allow reordering or should be careful.
    // For simplicity, let's disable reordering when searching, or just apply it effectively if possible.
    // If we reorder filtered list, we need to map back to original indices?
    // It is safer to disable DnD when searching.
    if (searchQuery) return;

    const currentBoards = boards || [];
    const reorderedBoards = Array.from(currentBoards);
    const [movedBoard] = reorderedBoards.splice(source.index, 1);
    reorderedBoards.splice(destination.index, 0, movedBoard);

    // Optimistic update
    queryClient.setQueryData(boardKeys.lists(), reorderedBoards);

    // API call
    reorderBoards(reorderedBoards.map((b) => b.id));
  };

  if (!isOpen) return null;

  return (
    <div className="w-64 min-h-[calc(100svh-7rem)] border-r bg-background flex flex-col h-full sticky top-0 transition-all duration-300">
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
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable
              droppableId="boards"
              type="BOARD"
              isDropDisabled={!!searchQuery}
            >
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-1"
                >
                  {filteredBoards?.map((board, index) => (
                    <Draggable
                      key={board.id}
                      draggableId={board.id}
                      index={index}
                      isDragDisabled={!!searchQuery}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            ...provided.draggableProps.style,
                            opacity: snapshot.isDragging ? 0.5 : 1,
                          }}
                          className={cn(
                            "group flex items-center justify-between pl-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground border border-edge",
                            currentBoardId === board.id
                              ? "bg-accent text-accent-foreground"
                              : "transparent",
                          )}
                        >
                          <Link
                            to={`/dashboard/${board.id}`}
                            className="flex items-center flex-1 truncate py-2"
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
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
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
