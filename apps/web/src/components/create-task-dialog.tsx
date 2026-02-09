import { useState } from "react";
import { useCreateTask } from "../hooks/use-tasks";
import { useTaskTypes } from "../hooks/use-task-types";
import { TaskType } from "../lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Plus,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  AlertCircle,
  PlusCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Label } from "./ui/label";
import { getTaskTypeIcon } from "../lib/task-type-icons";
import { CreateTaskTypeDialog } from "./create-task-type-dialog";

interface CreateTaskDialogProps {
  columnId: string;
  order: number;
  trigger?: React.ReactNode;
  taskTypes?: TaskType[];
}

function formatTypeLabel(typeName: string) {
  return typeName
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function CreateTaskDialog({
  columnId,
  order,
  trigger,
  taskTypes,
}: CreateTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [createTypeOpen, setCreateTypeOpen] = useState(false);
  const createTask = useCreateTask();
  const { data: fetchedTaskTypes = [] } = useTaskTypes();
  const availableTaskTypes = (taskTypes ?? fetchedTaskTypes).filter(
    (taskType) => taskType.name.trim().length > 0,
  );

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("task");
  const [priority, setPriority] = useState("medium");
  const normalizedType = type.trim() || "task";
  const selectedTypeExists = availableTaskTypes.some(
    (taskType) => taskType.name === normalizedType,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await createTask.mutateAsync({
        columnId,
        title,
        description,
        type: normalizedType,
        priority,
        order,
      });
      toast.success("Task created");
      setOpen(false);
      // Reset form
      setTitle("");
      setDescription("");
      setType("task");
      setPriority("medium");
    } catch (error) {
      toast.error("Failed to create task");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground rounded-none"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-none">
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
          <DialogDescription>Add a new task to your board.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              className="rounded-none"
              autoFocus
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a more detailed description..."
              className="resize-none rounded-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="type">Type</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-7 rounded-none px-2"
                  onClick={() => setCreateTypeOpen(true)}
                >
                  <PlusCircle className="mr-1 h-3.5 w-3.5" />
                  Create
                </Button>
              </div>
              <Select
                value={normalizedType}
                onValueChange={(value) => setType(value || "task")}
              >
                <SelectTrigger id="type" className="rounded-none w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="rounded-none">
                  {!selectedTypeExists &&
                    (availableTaskTypes.length > 0 ||
                      normalizedType !== "task") && (
                      <SelectItem value={normalizedType}>
                        <div className="flex items-center">
                          <span>{formatTypeLabel(normalizedType)}</span>
                        </div>
                      </SelectItem>
                    )}

                  {availableTaskTypes.length === 0 && (
                    <SelectItem value="task">
                      <div className="flex items-center">
                        <span>Task</span>
                      </div>
                    </SelectItem>
                  )}

                  {availableTaskTypes.map((taskType) => {
                    const TypeIcon = getTaskTypeIcon(taskType.icon);

                    return (
                      <SelectItem key={taskType.id} value={taskType.name}>
                        <div className="flex items-center">
                          <TypeIcon className="mr-2 h-4 w-4" />
                          <span>{formatTypeLabel(taskType.name)}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="priority" className="h-7">
                Priority
              </Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger id="priority" className="rounded-none w-full">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent className="rounded-none">
                  <SelectItem value="low">
                    <div className="flex items-center">
                      <ArrowDown className="mr-2 h-4 w-4 text-slate-500" />
                      <span>Low</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center">
                      <ArrowRight className="mr-2 h-4 w-4 text-blue-500" />
                      <span>Medium</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center">
                      <ArrowUp className="mr-2 h-4 w-4 text-orange-500" />
                      <span>High</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="critical">
                    <div className="flex items-center">
                      <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
                      <span>Critical</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" className="rounded-none w-full">
              Create Task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      <CreateTaskTypeDialog
        open={createTypeOpen}
        onOpenChange={setCreateTypeOpen}
        onCreated={(newTaskType) => {
          setType(newTaskType.name.trim() || "task");
        }}
      />
    </Dialog>
  );
}
