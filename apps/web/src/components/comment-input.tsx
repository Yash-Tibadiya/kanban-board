import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCreateComment } from "@/hooks/use-comments";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CommentInputProps {
  taskId: string;
}

export function CommentInput({ taskId }: CommentInputProps) {
  const [text, setText] = useState("");
  const createComment = useCreateComment(taskId);
  const { data: session } = authClient.useSession();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    createComment.mutate(text, {
      onSuccess: () => {
        setText("");
      },
      onError: () => {
        toast.error("Failed to post comment");
      },
    });
  };

  return (
    <div className="flex gap-3 items-start">
      <Avatar className="h-8 w-8 mt-1 rounded-none">
        <AvatarImage
          src={session?.user?.image || undefined}
          className="rounded-none"
        />
        <AvatarFallback className="rounded-none">
          {session?.user?.name?.charAt(0) || "U"}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <form onSubmit={handleSubmit} className="relative">
          <Textarea
            placeholder="Write a comment..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[80px] w-full resize-y bg-background focus-visible:ring-offset-0 pr-2 pb-10 rounded-none"
          />
          <div className="absolute bottom-2 right-2">
            <Button
              type="submit"
              size="sm"
              disabled={createComment.isPending || !text.trim()}
              className="h-7 px-3 text-xs rounded-none"
            >
              {createComment.isPending ? "Posting..." : "Comment"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
