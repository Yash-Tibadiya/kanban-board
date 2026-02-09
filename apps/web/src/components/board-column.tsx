import { Column } from "../lib/api";
import { useDeleteColumn, useUpdateColumn } from "../hooks/use-columns";
import { useCreateTask, useTasks } from "../hooks/use-tasks";
import { useState, useEffect } from "react";
import { Reorder } from "motion/react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
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
import { Plus, Ellipsis, Pencil, Trash2 } from "lucide-react";
import { TaskItem } from "./task-item";
import { toast } from "sonner";
import { ScrollArea } from "./ui/scroll-area";

interface BoardColumnProps {
  column: Column;
}

export function BoardColumn({ column }: BoardColumnProps) {
  const { data: tasks, isLoading } = useTasks(column.id);
  const createTask = useCreateTask();
  const updateColumn = useUpdateColumn();
  const deleteColumn = useDeleteColumn();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(column.title);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Task creation state
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");

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

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      await createTask.mutateAsync({
        columnId: column.id,
        title: newTaskTitle,
        order: tasks?.length || 0,
        type: "task", // Default
        priority: "medium", // Default
      });
      setNewTaskTitle("");
      setIsAddingTask(false);
      toast.success("Task created");
    } catch (error) {
      toast.error("Failed to create task");
    }
  };

  const handleReorderTasks = (newOrder: typeof orderedTasks) => {
    setOrderedTasks(newOrder);
    // Here we would implement the API call to reorder tasks
    // For now, we update local state.
    // Ideally we call a useReorderTasks hook similar to columns.
    // But we haven't implemented that API yet.
    // The user requirement says "move task between columns (DnD or dropdown)".
    // Sorting within column is "nice to have" but maybe not strict "move between columns".
    // I'll stick to basic rendering for now.
  };

  return (
    <div className="flex h-full max-h-full w-80 shrink-0 flex-col border bg-background shadow-sm rounded-none">
      <div className="flex items-center justify-between p-3 border-b drag-handle cursor-move">
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
            autoFocus
            className="h-8 text-sm font-semibold p-1 rounded-none"
          />
        ) : (
          <h3 className="font-semibold text-sm truncate flex-1 px-1">
            {column.title}
          </h3>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-none"
            >
              <Ellipsis className="h-4 w-4 text-muted-foreground" />
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
              className="text-destructive rounded-none"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete Column
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ScrollArea className="flex-1 p-3 bg-muted/20">
        {/* Using Reorder.Group for tasks */}
        <Reorder.Group
          axis="y"
          values={orderedTasks}
          onReorder={handleReorderTasks}
          className="list-none space-y-2"
        >
          {orderedTasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </Reorder.Group>
        {orderedTasks.length === 0 && !isLoading && (
          <div className="text-center py-8 text-xs text-muted-foreground bg-muted/30 border border-dashed rounded-none">
            No tasks
          </div>
        )}
      </ScrollArea>

      <div className="p-3 border-t bg-background">
        {isAddingTask ? (
          <form onSubmit={handleCreateTask} className="flex flex-col gap-2">
            <Input
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Task title..."
              autoFocus
              className="rounded-none text-sm"
            />
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsAddingTask(false)}
                className="rounded-none"
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="rounded-none">
                Add
              </Button>
            </div>
          </form>
        ) : (
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground rounded-none"
            onClick={() => setIsAddingTask(true)}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Task
          </Button>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
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
  );
}
