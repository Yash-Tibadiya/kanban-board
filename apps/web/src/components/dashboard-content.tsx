import { useBoard } from "../hooks/use-boards";
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
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import { useQueryClient } from "@tanstack/react-query";
import { taskKeys, useReorderTasks } from "../hooks/use-tasks";
import { Task } from "../lib/api";

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
  const reorderTasks = useReorderTasks();
  const queryClient = useQueryClient();

  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");

  // Optimistic state for reordering columns
  const [orderedColumns, setOrderedColumns] = useState<typeof columns>([]);

  useEffect(() => {
    if (columns) {
      setOrderedColumns(columns);
    }
  }, [columns]);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, type, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (type === "COLUMN") {
      const newOrderedColumns = Array.from(orderedColumns || []);
      const [removed] = newOrderedColumns.splice(source.index, 1);
      newOrderedColumns.splice(destination.index, 0, removed);

      setOrderedColumns(newOrderedColumns);

      const newOrderIds = newOrderedColumns.map((c) => c.id);
      reorderColumns.mutate({
        boardId,
        columnIds: newOrderIds,
      });
      return;
    }

    if (type === "TASK") {
      const sourceColumnId = source.droppableId;
      const destColumnId = destination.droppableId;

      const sourceTasks = queryClient.getQueryData<Task[]>(
        taskKeys.list(sourceColumnId),
      );
      const destTasks =
        sourceColumnId === destColumnId
          ? sourceTasks
          : queryClient.getQueryData<Task[]>(taskKeys.list(destColumnId));

      if (!sourceTasks || !destTasks) return;

      const newSourceTasks = Array.from(sourceTasks);
      const newDestTasks =
        sourceColumnId === destColumnId
          ? newSourceTasks
          : Array.from(destTasks);

      // Remove from source
      const [movedTask] = newSourceTasks.splice(source.index, 1);

      // Add to destination
      newDestTasks.splice(destination.index, 0, {
        ...movedTask,
        columnId: destColumnId,
      });

      // Optimistic update
      queryClient.setQueryData(taskKeys.list(sourceColumnId), newSourceTasks);
      if (sourceColumnId !== destColumnId) {
        queryClient.setQueryData(taskKeys.list(destColumnId), newDestTasks);
      }

      // API Call
      // We only strictly NEED to update the destination column order on server
      // The server endpoint `reorderTasks` takes list of task IDs and sets them to that column and order.
      // It effectively moves the task from source to dest.
      const newTaskIds = newDestTasks.map((t) => t.id);
      reorderTasks.mutate(
        {
          columnId: destColumnId,
          taskIds: newTaskIds,
        },
        {
          onError: () => {
            toast.error("Failed to move task");
            queryClient.invalidateQueries({ queryKey: taskKeys.all });
          },
        },
      );
    }
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
    <DragDropContext onDragEnd={onDragEnd}>
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
                <Droppable
                  droppableId="board"
                  type="COLUMN"
                  direction="horizontal"
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="flex gap-4 h-full items-start list-none p-0"
                    >
                      {orderedColumns?.map((column, index) => (
                        <BoardColumn
                          key={column.id}
                          column={column}
                          index={index}
                        />
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>

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
    </DragDropContext>
  );
}
