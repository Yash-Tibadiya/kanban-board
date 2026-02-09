import { Task } from "../lib/api";
import { Reorder } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Pencil, Trash2, GripVertical, Check, X } from "lucide-react";
import { useState } from "react";
import { useDeleteTask, useUpdateTask } from "../hooks/use-tasks";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(
    task.description || "",
  );
  const [editType, setEditType] = useState(task.type);
  const [editPriority, setEditPriority] = useState(task.priority || "medium");

  const handleUpdate = async () => {
    if (!editTitle.trim()) return;

    try {
      await updateTask.mutateAsync({
        id: task.id,
        data: {
          title: editTitle,
          description: editDescription,
          type: editType,
          priority: editPriority,
        },
      });
      setIsEditing(false);
      toast.success("Task updated");
    } catch (error) {
      toast.error("Failed to update task");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTask.mutateAsync({ id: task.id, columnId: task.columnId });
      toast.success("Task deleted");
    } catch (error) {
      toast.error("Failed to delete task");
    }
  };

  const priorityColors: Record<string, string> = {
    low: "bg-slate-500",
    medium: "bg-blue-500",
    high: "bg-orange-500",
    critical: "bg-red-500",
  };

  return (
    <Reorder.Item value={task} id={task.id} className="mb-2 relative">
      <Card
        className="rounded-none border-l-4 group"
        style={{
          borderLeftColor: priorityColors[task.priority || "medium"] || "gray",
        }}
      >
        {isEditing ? (
          <div className="p-3 gap-2 flex flex-col">
            <input
              className="w-full border p-1 text-sm font-semibold rounded-none"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Task title"
              autoFocus
            />
            <Textarea
              className="min-h-[60px] text-xs resize-none rounded-none"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Description"
            />
            <div className="flex gap-2">
              <Select value={editType} onValueChange={setEditType}>
                <SelectTrigger className="h-7 text-xs rounded-none">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="task">Task</SelectItem>
                  <SelectItem value="bug">Bug</SelectItem>
                  <SelectItem value="feature">Feature</SelectItem>
                </SelectContent>
              </Select>
              <Select value={editPriority} onValueChange={setEditPriority}>
                <SelectTrigger className="h-7 text-xs rounded-none">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 mt-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 rounded-none"
                onClick={() => setIsEditing(false)}
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                className="h-7 w-7 rounded-none"
                onClick={handleUpdate}
              >
                <Check className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <CardContent className="p-3 text-left">
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10 bg-background/80 rounded-sm">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="h-3 w-3 text-muted-foreground" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 hover:text-destructive"
                onClick={handleDelete}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>

            <div className="flex flex-col gap-1">
              <span className="font-medium text-sm pr-6 leading-tight break-words">
                {task.title}
              </span>
              {task.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {task.description}
                </p>
              )}

              <div className="flex gap-2 mt-2 items-center">
                <Badge
                  variant="outline"
                  className="text-[10px] px-1 py-0 h-4 rounded-sm uppercase tracking-wider text-muted-foreground border-transparent bg-muted"
                >
                  {task.type}
                </Badge>
                {/* Priority dot if needed, but border header covers it */}
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </Reorder.Item>
  );
}
