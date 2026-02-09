import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useCreateTaskType } from "../hooks/use-task-types";
import { ApiError, TaskType } from "../lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { IconPicker } from "./icon-picker";

interface CreateTaskTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (taskType: TaskType) => void;
}

export function CreateTaskTypeDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateTaskTypeDialogProps) {
  const createTaskType = useCreateTaskType();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("FileText");

  useEffect(() => {
    if (!open) {
      setName("");
      setIcon("FileText");
    }
  }, [open]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedName = name.trim();

    if (!normalizedName) {
      return;
    }

    try {
      const newTaskType = await createTaskType.mutateAsync({
        name: normalizedName,
        icon,
      });

      toast.success("Task type created");
      onCreated?.(newTaskType);
      onOpenChange(false);
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        toast.error("Task type already exists");
        return;
      }

      toast.error("Failed to create task type");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] rounded-none">
        <DialogHeader>
          <DialogTitle>Create Task Type</DialogTitle>
          <DialogDescription>
            Add a custom task type with an icon.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreate} className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="task-type-name">Type Name</Label>
            <Input
              id="task-type-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Design Review"
              maxLength={40}
              className="rounded-none"
              autoFocus
            />
          </div>

          <div className="grid gap-2">
            <Label>Choose Icon</Label>
            <IconPicker value={icon} onValueChange={setIcon} />
          </div>

          <DialogFooter>
            <Button
              type="submit"
              className="rounded-none w-full"
              disabled={createTaskType.isPending || !name.trim()}
            >
              {createTaskType.isPending ? "Creating..." : "Create Type"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
