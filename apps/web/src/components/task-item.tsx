import { Task } from "../lib/api";
import { Reorder } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Pencil,
  Trash2,
  GripVertical,
  Check,
  X,
  FileText,
  Bug,
  Star,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  AlertCircle,
} from "lucide-react";
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

  const priorityConfig: Record<
    string,
    {
      icon: React.ElementType;
      text: string;
      bg: string;
      border: string;
      label: string;
    }
  > = {
    low: {
      icon: ArrowDown,
      text: "text-slate-500",
      bg: "bg-slate-500/10",
      border: "rgb(100, 116, 139)",
      label: "Low",
    },
    medium: {
      icon: ArrowRight,
      text: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "rgb(59, 130, 246)",
      label: "Medium",
    },
    high: {
      icon: ArrowUp,
      text: "text-orange-500",
      bg: "bg-orange-500/10",
      border: "rgb(249, 115, 22)",
      label: "High",
    },
    critical: {
      icon: AlertCircle,
      text: "text-red-500",
      bg: "bg-red-500/10",
      border: "rgb(239, 68, 68)",
      label: "Critical",
    },
  };

  const typeConfig: Record<string, { icon: React.ElementType; label: string }> =
    {
      task: { icon: FileText, label: "Task" },
      bug: { icon: Bug, label: "Bug" },
      feature: { icon: Star, label: "Feature" },
    };

  const currentPriority =
    priorityConfig[task.priority || "medium"] || priorityConfig.medium;
  const PriorityIcon = currentPriority.icon;
  const TypeIcon = typeConfig[task.type || "task"]?.icon || FileText;

  return (
    <Reorder.Item value={task} id={task.id} className="mb-3 relative group">
      <Card
        className={`rounded-none hover:shadow-md transition-all duration-200 border-l-[3px] ${
          isEditing ? "ring-2 ring-primary/20" : ""
        }`}
        style={{
          borderLeftColor: isEditing ? undefined : currentPriority.border,
        }}
      >
        {isEditing ? (
          <div className="p-3 flex flex-col gap-3">
            <div className="flex gap-2">
              <Select value={editType} onValueChange={setEditType}>
                <SelectTrigger className="h-7 text-xs w-[100px] rounded-none">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="rounded-none">
                  <SelectItem value="task">
                    <div className="flex items-center gap-2">
                      <FileText className="h-3 w-3" /> Task
                    </div>
                  </SelectItem>
                  <SelectItem value="bug">
                    <div className="flex items-center gap-2">
                      <Bug className="h-3 w-3" /> Bug
                    </div>
                  </SelectItem>
                  <SelectItem value="feature">
                    <div className="flex items-center gap-2">
                      <Star className="h-3 w-3" /> Feature
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select value={editPriority} onValueChange={setEditPriority}>
                <SelectTrigger className="h-7 text-xs w-[100px] rounded-none">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent className="rounded-none">
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <ArrowDown className="h-3 w-3 text-slate-500" /> Low
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <ArrowRight className="h-3 w-3 text-blue-500" /> Medium
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <ArrowUp className="h-3 w-3 text-orange-500" /> High
                    </div>
                  </SelectItem>
                  <SelectItem value="critical">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-3 w-3 text-red-500" /> Critical
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <input
              className="w-full border-b pb-1 text-sm font-semibold bg-transparent focus:outline-none focus:border-primary rounded-none"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Task title"
              autoFocus
            />
            <Textarea
              className="min-h-[60px] text-xs resize-none rounded-none"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Add a description..."
            />

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs rounded-none"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="h-7 px-2 text-xs rounded-none"
                onClick={handleUpdate}
              >
                Save
              </Button>
            </div>
          </div>
        ) : (
          <CardContent className="p-3">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Badge
                  variant="secondary"
                  className="text-[10px] px-1.5 h-5 font-normal bg-muted rounded-none"
                >
                  #{task.id.slice(-4)}
                </Badge>
                <TypeIcon className="h-3.5 w-3.5" />
              </div>
              <div
                className={`flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-none ${currentPriority.bg} ${currentPriority.text}`}
              >
                <PriorityIcon className="h-3 w-3" />
                <span className="uppercase">{task.priority}</span>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10 bg-background/95 backdrop-blur shadow-sm rounded-none border p-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-none"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="h-3 w-3 text-muted-foreground" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 hover:text-destructive rounded-none"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>

              <h3 className="font-medium text-sm leading-tight mb-1 pr-6">
                {task.title}
              </h3>
              {task.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {task.description}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-dashed">
              {task.user ? (
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full overflow-hidden bg-muted border flex items-center justify-center shrink-0">
                    {task.user.image ? (
                      <img
                        src={task.user.image}
                        alt={task.user.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-[9px] font-bold text-muted-foreground">
                        {task.user.name.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">
                    {task.user.name}
                  </span>
                </div>
              ) : (
                <div />
              )}

              <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                {/*  Use a date formatter if available, for now simple string */}
                {new Date(task.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </Reorder.Item>
  );
}
