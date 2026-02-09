import { useBoard } from "../hooks/use-boards";
import { Reorder } from "motion/react";
import { useEffect, useState } from "react";
import {
  useColumns,
  useCreateColumn,
  useReorderColumns,
} from "../hooks/use-columns";
import { Button } from "./ui/button";
import { Plus, X, PanelRightOpen, PanelRightClose } from "lucide-react";
import { toast } from "sonner";
import { BoardColumn } from "./board-column";

interface DashboardContentProps {
  boardId: string;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function DashboardContent({
  boardId,
  isSidebarOpen,
  onToggleSidebar,
}: DashboardContentProps) {
  const {
    data: board,
    isLoading: isBoardLoading,
    error: boardError,
  } = useBoard(boardId);
  const { data: columns, isLoading: isColumnsLoading } = useColumns(boardId);
  const createColumn = useCreateColumn();
  const reorderColumns = useReorderColumns();

  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");

  // Optimistic state for reordering
  const [orderedColumns, setOrderedColumns] = useState<typeof columns>([]);

  useEffect(() => {
    if (columns) {
      setOrderedColumns(columns);
    }
  }, [columns]);

  const handleReorder = (newOrder: typeof columns) => {
    if (!newOrder) return;

    setOrderedColumns(newOrder);

    const newOrderIds = newOrder.map((c) => c.id);
    reorderColumns.mutate({
      boardId,
      columnIds: newOrderIds,
    });
  };

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
      <header className="border-b px-6 py-4 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          {!isSidebarOpen && (
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-none border-dashed mr-2"
              onClick={onToggleSidebar}
              title="Open Sidebar"
            >
              <PanelRightClose className="h-5! w-5! shrink-0" />
            </Button>
          )}
          {isSidebarOpen && (
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-none border-dashed mr-2"
              onClick={onToggleSidebar}
              title="Close Sidebar"
            >
              <PanelRightOpen className="h-5! w-5! shrink-0" />
            </Button>
          )}
          <h1 className="text-2xl font-bold">{board.title}</h1>
        </div>
        {board.description && (
          <p className="text-muted-foreground">{board.description}</p>
        )}
      </header>
      <main className="flex-1 overflow-x-auto px-6 pt-6 pb-4 bg-muted/10 ">
        <div className="flex gap-4 h-full items-start">
          {isColumnsLoading ? (
            <div className="w-80 p-4">Loading columns...</div>
          ) : (
            <>
              <Reorder.Group
                axis="x"
                values={orderedColumns || []}
                onReorder={handleReorder}
                className="flex gap-4 h-full items-start list-none p-0"
              >
                {orderedColumns?.map((column) => (
                  <Reorder.Item
                    key={column.id}
                    value={column}
                    className="flex h-full max-h-full w-80 shrink-0 flex-col bg-transparent"
                    whileDrag={{
                      scale: 1.02,
                      boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
                      cursor: "grabbing",
                    }}
                    style={{ position: "relative" }}
                  >
                    <BoardColumn column={column} />
                  </Reorder.Item>
                ))}
              </Reorder.Group>

              {/* Add Column */}
              <div className="w-80 shrink-0">
                {isAddingColumn ? (
                  <form
                    onSubmit={handleAddColumn}
                    className="flex w-full items-center gap-2 rounded-none border bg-background p-4 shadow-sm mr-6"
                  >
                    <input
                      autoFocus
                      type="text"
                      placeholder="Column title..."
                      className="w-full rounded-none border px-3 py-[5px]! text-sm outline-none focus:border-primary"
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
            </>
          )}
        </div>
      </main>
    </div>
  );
}
