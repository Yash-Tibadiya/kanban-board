import { useState } from "react";
import { useBoard } from "../hooks/use-boards";
import { useColumns, useCreateColumn } from "../hooks/use-columns";
import { Button } from "./ui/button";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";

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

  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");

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
      <main className="flex-1 overflow-x-auto p-6 bg-muted/10">
        <div className="flex gap-4 h-full items-start">
          {isColumnsLoading ? (
            <div className="w-80 p-4">Loading columns...</div>
          ) : (
            columns?.map((column) => (
              <>
                <div
                  key={column.id}
                  className="flex h-full max-h-full w-80 shrink-0 flex-col border bg-background p-4 shadow-sm"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-semibold">{column.title}</h3>
                  </div>
                  <div className="flex-1 rounded-none border border-dashed border-muted-foreground/25 flex items-center justify-center text-sm text-muted-foreground">
                    No tasks
                  </div>
                </div>
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
    </div>
  );
}
