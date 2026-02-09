import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, CreateTaskTypeData, TaskType } from "../lib/api";

export const taskTypeKeys = {
  all: ["task-types"] as const,
};

export function useTaskTypes() {
  return useQuery({
    queryKey: taskTypeKeys.all,
    queryFn: () => api.get<TaskType[]>("/task-types"),
  });
}

export function useCreateTaskType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskTypeData) =>
      api.post<TaskType>("/task-types", data),
    onSuccess: (newTaskType) => {
      queryClient.setQueryData<TaskType[]>(taskTypeKeys.all, (currentTypes) => {
        if (!currentTypes) {
          return [newTaskType];
        }

        const exists = currentTypes.some((type) => type.id === newTaskType.id);
        if (exists) {
          return currentTypes;
        }

        return [...currentTypes, newTaskType];
      });

      queryClient.invalidateQueries({ queryKey: taskTypeKeys.all });
    },
  });
}
