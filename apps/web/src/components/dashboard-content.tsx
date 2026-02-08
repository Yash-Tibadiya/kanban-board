import { useState } from "react";
import { useBoard } from "../hooks/use-boards";
import {
  useColumns,
  useCreateColumn,
  useUpdateColumn,
  useDeleteColumn,
} from "../hooks/use-columns";
import { Button } from "./ui/button";
import { Plus, X, Pencil, Trash2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
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

interface DashboardContentProps {
  boardId: string;
}

export function DashboardContent({ boardId }: DashboardContentProps) {
  const {
    data: board,
    isLoading: isBoardLoading,
    error: boardError,
  } = useBoard(boardId);
  const { data: columns, isLoading: isColumnsLoading } = useColumns(boardId);
  const createColumn = useCreateColumn();
  const updateColumn = useUpdateColumn();
  const deleteColumn = useDeleteColumn();

  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");

  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [deleteColumnId, setDeleteColumnId] = useState<string | null>(null);

  const handleAddColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColumnTitle.trim()) return;

    try {
      await createColumn.mutateAsync({
        boardId,
        title: newColumnTitle,
        order: columns?.length || 0,
      });
      setNewColumnTitle("");
      setIsAddingColumn(false);
      toast.success("Column created");
    } catch (error) {
      toast.error("Failed to create column");
    }
  };

  const handleUpdateColumn = async (id: string) => {
    if (!editTitle.trim()) return;
    if (editTitle === columns?.find((c) => c.id === id)?.title) {
      setEditingColumnId(null);
      return;
    }

    try {
      await updateColumn.mutateAsync({
        id,
        data: { title: editTitle },
      });
      setEditingColumnId(null);
      toast.success("Column updated");
    } catch (error) {
      toast.error("Failed to update column");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteColumnId) return;

    try {
      await deleteColumn.mutateAsync(deleteColumnId);
      setDeleteColumnId(null);
      toast.success("Column deleted");
    } catch (error) {
      toast.error("Failed to delete column");
    }
  };

  if (isBoardLoading) {
    return <div className="p-8">Loading board details...</div>;
  }

  if (boardError) {
    return (
      <div className="p-8 text-destructive">
        Failed to load board: {boardError.message}
      </div>
    );
  }

  if (!board) {
    return <div className="p-8">Board not found</div>;
  }

  return (
    <div className="flex h-full min-h-[calc(100svh-7rem)] flex-col">
      <header className="border-b px-6 py-4">
        <h1 className="text-2xl font-bold">{board.title}</h1>
        {board.description && (
          <p className="text-muted-foreground">{board.description}</p>
        )}
      </header>
      <main className="flex-1 overflow-x-auto px-6 pt-6 pb-4 bg-muted/10">
        <div className="flex gap-4 h-full items-start">
          {isColumnsLoading ? (
            <div className="w-80 p-4">Loading columns...</div>
          ) : (
            columns?.map((column) => (
              <>
                <div
                  key={column.id}
                  className="flex h-full max-h-full w-80 shrink-0 flex-col border bg-background shadow-sm"
                >
                  <div className="flex items-center justify-between min-h-[40px]">
                    {editingColumnId === column.id ? (
                      <form
                        className="flex items-center gap-2 flex-1 px-4 py-2"
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleUpdateColumn(column.id);
                        }}
                      >
                        <input
                          autoFocus
                          type="text"
                          className="w-full rounded-none border px-2 py-1 text-sm outline-none focus:border-primary font-semibold"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onBlur={() => handleUpdateColumn(column.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Escape") {
                              setEditingColumnId(null);
                            }
                          }}
                        />
                        <Button
                          type="submit"
                          variant="ghost"
                          size="icon"
                          className="rounded-none h-8 w-8 text-muted-foreground hover:text-blue-500 bg-accent!"
                          title="Update Column"
                        >
                          <ArrowRight />
                        </Button>
                      </form>
                    ) : (
                      <>
                        <h3 className="font-semibold text-sm truncate flex-1 px-4 py-2">
                          {column.title}
                        </h3>
                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          {/* Hover effect to show buttons? No, user didn't ask for hover. */}
                        </div>
                        <div className="flex items-center ml-2 px-4 py-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-none h-8 w-8 text-muted-foreground hover:text-blue-500 hover:bg-transparent"
                            onClick={() => {
                              setEditingColumnId(column.id);
                              setEditTitle(column.title);
                            }}
                            title="Edit Column"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-none h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-transparent"
                            onClick={() => setDeleteColumnId(column.id)}
                            title="Delete Column"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="h-px border-b border-edge"></div>
                  <div className="px-4 py-2">
                    <div className="flex-1 rounded-none border border-dashed border-muted-foreground/25 flex items-center justify-center text-sm text-muted-foreground">
                      No tasks
                    </div>
                  </div>
                </div>
                <div className="w-px h-full min-h-[calc(100svh-16rem)] border-r border-edge"></div>
              </>
            ))
          )}

          {/* Add Column */}
          <div className="w-80 shrink-0">
            {isAddingColumn ? (
              <form
                onSubmit={handleAddColumn}
                className="flex items-center gap-2 rounded-none border bg-background p-4 shadow-sm mr-6"
              >
                <input
                  autoFocus
                  type="text"
                  placeholder="Column title..."
                  className="w-full rounded-none border px-3 py-1.5 text-sm outline-none focus:border-primary"
                  value={newColumnTitle}
                  onChange={(e) => setNewColumnTitle(e.target.value)}
                  disabled={createColumn.isPending}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="rounded-none hover:cursor-pointer"
                  disabled={createColumn.isPending}
                  onClick={handleAddColumn}
                >
                  Add
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="rounded-none hover:cursor-pointer"
                  onClick={() => {
                    setIsAddingColumn(false);
                    setNewColumnTitle("");
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </form>
            ) : (
              <Button
                variant="outline"
                className="h-auto w-full justify-start gap-2 p-4 text-muted-foreground hover:bg-background hover:text-foreground rounded-none border-dashed mr-6!"
                onClick={() => setIsAddingColumn(true)}
              >
                <Plus className="h-4 w-4" />
                Add Column
              </Button>
            )}
          </div>
        </div>
      </main>

      <AlertDialog
        open={!!deleteColumnId}
        onOpenChange={(open) => !open && setDeleteColumnId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Column</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this column? All tasks in this
              column will be permanently deleted.
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
