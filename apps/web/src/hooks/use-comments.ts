import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, Comment } from "../lib/api";

export const commentKeys = {
  all: ["comments"] as const,
  list: (taskId: string) => [...commentKeys.all, "list", taskId] as const,
};

export function useComments(taskId: string) {
  return useQuery({
    queryKey: commentKeys.list(taskId),
    queryFn: () => api.getComments(taskId),
    enabled: !!taskId,
  });
}

export function useCreateComment(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (text: string) => api.createComment(taskId, text),
    onSuccess: (newComment) => {
      // Optimistic update or just invalidation
      queryClient.setQueryData(
        commentKeys.list(taskId),
        (old: Comment[] | undefined) => {
          if (!old) return [newComment];
          return [newComment, ...old];
        },
      );
      queryClient.invalidateQueries({ queryKey: commentKeys.list(taskId) });
    },
  });
}

export function useDeleteComment(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => api.deleteComment(commentId),
    onSuccess: (_, commentId) => {
      queryClient.setQueryData(
        commentKeys.list(taskId),
        (old: Comment[] | undefined) => {
          if (!old) return [];
          return old.filter((c) => c.id !== commentId);
        },
      );
      queryClient.invalidateQueries({ queryKey: commentKeys.list(taskId) });
    },
  });
}
