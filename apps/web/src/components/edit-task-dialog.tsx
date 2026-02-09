import { useState, useEffect } from "react";
import { useUpdateTask } from "../hooks/use-tasks";
import { useTaskTypes } from "../hooks/use-task-types";
import { Task, TaskType } from "../lib/api";
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

interface EditTaskDialogProps {
  task: Task;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  taskTypes?: TaskType[];
}

function formatTypeLabel(typeName: string) {
  return typeName
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function EditTaskDialog({
  task,
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  taskTypes,
}: EditTaskDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const [createTypeOpen, setCreateTypeOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = isControlled ? setControlledOpen : setUncontrolledOpen;

  const updateTask = useUpdateTask();
  const { data: fetchedTaskTypes = [] } = useTaskTypes();
  const availableTaskTypes = (taskTypes ?? fetchedTaskTypes).filter(
    (taskType) => taskType.name.trim().length > 0,
  );

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [type, setType] = useState(task.type.trim() || "task");
  const [priority, setPriority] = useState(task.priority || "medium");

  useEffect(() => {
    if (open) {
      setTitle(task.title);
      setDescription(task.description || "");
      setType(task.type.trim() || "task");
      setPriority(task.priority || "medium");
    }
  }, [open, task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const normalizedType = type.trim() || "task";

    try {
      await updateTask.mutateAsync({
        id: task.id,
        data: {
          title,
          description,
          type: normalizedType,
          priority,
        },
      });
      toast.success("Task updated");
      if (setOpen) setOpen(false);
    } catch (error) {
      toast.error("Failed to update task");
    }
  };

  const normalizedType = type.trim() || "task";
  const selectedTypeExists = availableTaskTypes.some(
    (t) => t.name === normalizedType,
  );
  const UnknownTypeIcon = selectedTypeExists
    ? null
    : getTaskTypeIcon("FileText");
  const knownTaskType = availableTaskTypes.find(
    (t) => t.name === normalizedType,
  );
  const customTypeLabel = knownTaskType?.name ?? normalizedType;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px] rounded-none">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription>
            Make changes to your task here. Click save when you're done.
          </DialogDescription>
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
                  {!selectedTypeExists && UnknownTypeIcon && (
                    <SelectItem value={normalizedType}>
                      <div className="flex items-center">
                        <UnknownTypeIcon className="mr-2 h-4 w-4" />
                        <span>{formatTypeLabel(customTypeLabel)}</span>
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
              Save Changes
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
