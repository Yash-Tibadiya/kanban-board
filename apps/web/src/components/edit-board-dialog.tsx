import { useState, useEffect } from "react";
import { useUpdateBoard } from "../hooks/use-boards";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner";
import { X } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md border bg-background p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Edit Board</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

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

          <div className="flex justify-end gap-2">
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
          </div>
        </form>
      </div>
    </div>
  );
}
