import { Task, TaskType } from "../lib/api";
import { Reorder } from "motion/react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Pencil,
  Trash2,
  FileText,
  Bug,
  Star,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  AlertCircle,
} from "lucide-react";
import { useDeleteTask } from "../hooks/use-tasks";
import { toast } from "sonner";
import { EditTaskDialog } from "./edit-task-dialog";
import { getTaskTypeIcon } from "../lib/task-type-icons";

interface TaskItemProps {
  task: Task;
  taskTypes?: TaskType[];
}

function formatTypeLabel(typeName: string) {
  return typeName
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function TaskItem({ task, taskTypes = [] }: TaskItemProps) {
  const deleteTask = useDeleteTask();

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

  const fallbackTypeConfig: Record<
    string,
    { icon: React.ElementType; label: string }
  > = {
    task: { icon: FileText, label: "task" },
    bug: { icon: Bug, label: "bug" },
    feature: { icon: Star, label: "feature" },
  };

  const currentPriority =
    priorityConfig[task.priority || "medium"] || priorityConfig.medium;
  const taskTypeDefinition = taskTypes.find((type) => type.name === task.type);
  const currentType = taskTypeDefinition
    ? {
        icon: getTaskTypeIcon(taskTypeDefinition.icon),
        label: taskTypeDefinition.name,
      }
    : fallbackTypeConfig[task.type] || {
        icon: FileText,
        label: task.type,
      };

  const PriorityIcon = currentPriority.icon;
  const TypeIcon = currentType.icon;

  return (
    <Reorder.Item value={task} id={task.id} className="mb-3 relative group">
      <Card
        className="rounded-none hover:shadow-md transition-all duration-200 border-l-[3px] py-0!"
        style={{
          borderLeftColor: currentPriority.border,
        }}
      >
        <CardContent className="p-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 h-5 font-normal bg-muted rounded-none"
              >
                #{task.id.slice(-4)}
              </Badge>
              <div className="flex justify-center items-center gap-1">
                <TypeIcon className="h-3.5 w-3.5 shrink-0" />
                <span className="text-[10px] uppercase font-medium flex justify-center items-center">
                  {formatTypeLabel(currentType.label)}
                </span>
              </div>
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
              <EditTaskDialog
                task={task}
                taskTypes={taskTypes}
                trigger={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-none"
                  >
                    <Pencil className="h-3 w-3 text-muted-foreground" />
                  </Button>
                }
              />
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
      </Card>
    </Reorder.Item>
  );
}
