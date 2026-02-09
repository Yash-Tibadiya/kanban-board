import { useState } from "react";
import { useComments, useDeleteComment } from "@/hooks/use-comments";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { authClient } from "@/lib/auth-client";

interface CommentListProps {
  taskId: string;
}

export function CommentList({ taskId }: CommentListProps) {
  const { data: comments, isLoading } = useComments(taskId);
  const deleteComment = useDeleteComment(taskId);
  const { data: session } = authClient.useSession();

  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground animate-pulse">
        Loading comments...
      </div>
    );
  }

  if (!comments?.length) {
    return (
      <div className="text-sm text-muted-foreground/50 italic py-4">
        No comments yet. Be the first to add one.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <div key={comment.id} className="flex gap-3 group">
          <Avatar className="h-8 w-8 mt-1 border border-transparent group-hover:border-border transition-colors rounded-none">
            <AvatarImage
              src={comment.user.image || undefined}
              alt={comment.user.name}
              className="rounded-none"
            />
            <AvatarFallback className="text-xs rounded-none">
              {comment.user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-foreground/90">
                  {comment.user.name}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>

              {session?.user?.id === comment.userId && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity rounded-none"
                  onClick={() => deleteComment.mutate(comment.id)}
                  disabled={deleteComment.isPending}
                  title="Delete comment"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>

            <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
              {comment.text}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
