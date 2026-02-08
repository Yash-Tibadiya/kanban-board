import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, Column, CreateColumnData, UpdateColumnData } from "../lib/api";

export const columnKeys = {
  all: ["columns"] as const,
  lists: (boardId: string) => [...columnKeys.all, "list", boardId] as const,
};

export function useColumns(boardId: string) {
  return useQuery({
    queryKey: columnKeys.lists(boardId),
    queryFn: () => api.get<Column[]>(`/boards/${boardId}/columns`),
    enabled: !!boardId,
  });
}

export function useCreateColumn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateColumnData) =>
      api.post<Column>(`/boards/${data.boardId}/columns`, data),
    onSuccess: (newColumn) => {
      queryClient.invalidateQueries({
        queryKey: columnKeys.lists(newColumn.boardId),
      });
    },
  });
}

export function useUpdateColumn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateColumnData }) =>
      api.patch<Column>(`/columns/${id}`, data),
    onSuccess: (updatedColumn) => {
      queryClient.invalidateQueries({
        queryKey: columnKeys.lists(updatedColumn.boardId),
      });
    },
  });
}

export function useDeleteColumn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete<Column>(`/columns/${id}`),
    onSuccess: (deletedColumn) => {
      queryClient.invalidateQueries({
        queryKey: columnKeys.lists(deletedColumn.boardId),
      });
    },
  });
}
