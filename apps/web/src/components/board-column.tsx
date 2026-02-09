import { Column } from "../lib/api";
import { useDeleteColumn, useUpdateColumn } from "../hooks/use-columns";
import { useTasks } from "../hooks/use-tasks";
import { useTaskTypes } from "../hooks/use-task-types";
import { useState, useEffect } from "react";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Ellipsis, Pencil, Plus, Trash2 } from "lucide-react";
import { TaskItem } from "./task-item";
import { toast } from "sonner";
import { ScrollArea } from "./ui/scroll-area";
import { CreateTaskDialog } from "./create-task-dialog";
import { Input } from "./ui/input"; // Re-adding Input as it's used in JSX

interface BoardColumnProps {
  column: Column;
  index: number;
}

export function BoardColumn({ column, index }: BoardColumnProps) {
  const { data: tasks, isLoading } = useTasks(column.id);
  const { data: taskTypes = [] } = useTaskTypes();

  const updateColumn = useUpdateColumn();
  const deleteColumn = useDeleteColumn();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(column.title);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Task creation state
  // Reorder state for tasks
  const [orderedTasks, setOrderedTasks] = useState(tasks || []);

  useEffect(() => {
    if (tasks) {
      setOrderedTasks(tasks);
    }
  }, [tasks]);

  const handleUpdateTitle = async () => {
    if (!title.trim() || title === column.title) {
      setIsEditingTitle(false);
      setTitle(column.title);
      return;
    }

    try {
      await updateColumn.mutateAsync({ id: column.id, data: { title } });
      toast.success("Column updated");
      setIsEditingTitle(false);
    } catch (error) {
      toast.error("Failed to update column");
    }
  };

  const handleDeleteColumn = async () => {
    try {
      await deleteColumn.mutateAsync(column.id);
      toast.success("Column deleted");
    } catch (error) {
      toast.error("Failed to delete column");
    }
  };

  // No need for local reorder state since DnD context handles it via optimistic updates in parent
  // But we still need orderedTasks for rendering, initialized from query data
  // When dragging, standard practice is to use the data from props if parent manages all state
  // But here we fetch tasks inside the component.
  // For `react-beautiful-dnd`, it's best if we just render `tasks` directly or `orderedTasks`
  // and let `onDragEnd` in parent handle re-fetching or optimistic updates.
  // However, since `DashboardContent` manages the `onDragEnd` for tasks, it needs access to SET the tasks in the query cache?
  // Or we just invalidate.
  // Actually, standard `react-beautiful-dnd` pattern:
  // Draggable key MUST match the ID.
  // We need to render the list.
  // If we move a task visually, we need the local state to update immediately.
  // `useTasks` gives us `tasks`.
  // If we want optimistic updates across columns, the PARENT (Dashboard) should probably know about all tasks?
  // Or at least `onDragEnd` (in Dashboard) will update the server.
  // The local jitter might happen if we don't update local state.
  // BUT `useQuery` + `invalidate` is fast.
  // Let's implement `orderedTasks` state synced with `tasks`, but we might need to expose a setter or rely on parent?
  // Actually, `orderedTasks` is local. If I move a task OUT, `orderedTasks` here won't know unless parent updates it?
  // Wait, `tasks` from `useTasks` will change when we invalidate.
  // So we rely on invalidation for now.
  // `react-beautiful-dnd` needs the `Draggable` to be removed/added to DOM to animate.
  // If we just wait for server, it snaps back then moves.
  // Ideally: `DashboardContent` holds the layout state? No, tasks are fetched per column.
  // OPTION: We use `orderedTasks` but `onDragEnd` logic will trigger invalidation.
  // There will be a split second snap-back if we don't handle optimistic UI.
  // For V1, snap-back is acceptable for "Cross Column" if hard to fix.
  // But for "Same Column", we can update `orderedTasks`.
  // Let's keep `orderedTasks` and update it if we detect changes or if passing new order?
  // Actually, if we use `tasks` directly, it's easier.
  // Let's use `tasks` directly and rely on fast refetch.

  return (
    <Draggable draggableId={column.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`flex h-full max-h-full w-80 shrink-0 flex-col bg-transparent relative ${
            snapshot.isDragging ? "opacity-75" : ""
          }`}
          style={{ ...provided.draggableProps.style }}
        >
          <div className="flex h-full max-h-full w-full flex-col border bg-background shadow-sm rounded-none">
            <div
              className="flex items-center justify-between p-3 border-b drag-handle cursor-move touch-none"
              {...provided.dragHandleProps}
            >
              {isEditingTitle ? (
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleUpdateTitle}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleUpdateTitle();
                    if (e.key === "Escape") {
                      setIsEditingTitle(false);
                      setTitle(column.title);
                    }
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                  autoFocus
                  className="h-8 text-sm font-semibold p-1 rounded-none"
                />
              ) : (
                <h3 className="font-semibold text-sm truncate flex-1 px-1 select-none">
                  {column.title}
                </h3>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-none"
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <Ellipsis className="h-4 w-4 text-blue-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-none">
                  <DropdownMenuItem
                    onClick={() => setIsEditingTitle(true)}
                    className="rounded-none"
                  >
                    <Pencil className="mr-2 h-4 w-4" /> Edit Title
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive rounded-none hover:text-destructive!"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4 text-destructive" /> Delete
                    Column
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <CreateTaskDialog
                columnId={column.id}
                order={tasks?.length || 0}
                taskTypes={taskTypes}
                trigger={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-none"
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <Plus className="h-4 w-4 text-green-500" />
                  </Button>
                }
              />
            </div>

            <ScrollArea className="flex-1 p-3 bg-muted/20">
              <Droppable droppableId={column.id} type="TASK">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex flex-col gap-2 min-h-[100px] ${
                      snapshot.isDraggingOver ? "bg-muted/30" : ""
                    }`}
                  >
                    {tasks?.map((task, index) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        taskTypes={taskTypes}
                        index={index}
                      />
                    ))}
                    {provided.placeholder}

                    {(!tasks || tasks.length === 0) && !isLoading && (
                      <div className="text-center py-8 text-xs text-muted-foreground bg-muted/30 border border-dashed rounded-none mt-2">
                        No tasks
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </ScrollArea>

            <div className="p-3 border-t bg-background">
              <CreateTaskDialog
                columnId={column.id}
                order={tasks?.length || 0}
                taskTypes={taskTypes}
              />
            </div>

            <AlertDialog
              open={deleteDialogOpen}
              onOpenChange={setDeleteDialogOpen}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Column</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the column and all its tasks.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteColumn}
                    className="bg-destructive text-destructive-foreground"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}
    </Draggable>
  );
}
