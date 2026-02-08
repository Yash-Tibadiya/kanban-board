import { useState, useEffect } from "react";
import { useUpdateBoard } from "../hooks/use-boards";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Board } from "@/lib/api";

interface EditBoardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  board: Board | null;
}

export function EditBoardDialog({
  open,
  onOpenChange,
  board,
}: EditBoardDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const updateBoard = useUpdateBoard();

  useEffect(() => {
    if (board) {
      setTitle(board.title);
      setDescription(board.description || "");
    }
  }, [board]);

  if (!open || !board) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    updateBoard.mutate(
      { id: board.id, data: { title, description } },
      {
        onSuccess: () => {
          toast.success("Board updated successfully");
          onOpenChange(false);
        },
        onError: (error: any) => {
          toast.error(error.message || "Failed to update board");
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Board</DialogTitle>
          <DialogDescription>
            Update the details of your board.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Product Roadmap"
              required
              className="rounded-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              className="rounded-none"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-none"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateBoard.isPending}
              className="rounded-none"
            >
              {updateBoard.isPending ? "Updating..." : "Update Board"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
