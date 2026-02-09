import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, Task, CreateTaskData, UpdateTaskData } from "../lib/api";

export const taskKeys = {
  all: ["tasks"] as const,
  list: (columnId: string) => [...taskKeys.all, "list", columnId] as const,
};

export function useTasks(columnId: string) {
  return useQuery({
    queryKey: taskKeys.list(columnId),
    queryFn: () => api.get<Task[]>(`/columns/${columnId}/tasks`),
    enabled: !!columnId,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskData) =>
      api.post<Task>(`/columns/${data.columnId}/tasks`, data),
    onSuccess: (newTask) => {
      queryClient.invalidateQueries({
        queryKey: taskKeys.list(newTask.columnId),
      });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskData }) =>
      api.patch<Task>(`/tasks/${id}`, data),
    onSuccess: (updatedTask) => {
      queryClient.invalidateQueries({
        queryKey: taskKeys.list(updatedTask.columnId),
      });
      // If the task was moved from another column, we might need to invalidate that column too.
      // But purely based on response, we only know current columnId.
      // Optimistic updates or broader invalidation might be needed for moves.
      // For now, let's invalidate all tasks if columnId is in dataset?
      // Actually, if we move a task, the `columnId` in `updatedTask` is the new one.
      // We don't easily know the old one unless we passed it.
      // For simplicity/correctness, we might want to invalidate all tasks lists for the board?
      // But we don't have boardId easily here without passing it.
      // Let's stick to invalidating the target column for now.
      // If we move, the UI might be stale on source column.
      // We can invalidate "tasks" generally? careful with perf.
      // Better: The UI driving the move (drag & drop) usually handles optimistic updates locally,
      // so immediate consistency might be less critical or handled there.
      // Let's just invalidate "tasks" generally for now to be safe on moves?
      // No, that invalidates all columns.
      // For `useUpdateTask`, let's accept `oldColumnId` in context if needed, or just invalidate all tasks.
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, columnId }: { id: string; columnId: string }) =>
      api.delete<Task>(`/tasks/${id}`),
    onSuccess: (_deletedTask, variables) => {
      queryClient.invalidateQueries({
        queryKey: taskKeys.list(variables.columnId),
      });
    },
  });
}
