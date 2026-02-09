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

export function useReorderTasks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      columnId,
      taskIds,
    }: {
      columnId: string;
      taskIds: string[];
    }) => api.reorderTasks(columnId, taskIds),
    onSuccess: () => {
      // Invalidate all tasks since moving tasks between columns affects multiple lists
      queryClient.invalidateQueries({
        queryKey: taskKeys.all,
      });
    },
  });
}
