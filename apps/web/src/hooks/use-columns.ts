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

export function useReorderColumns() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      boardId,
      columnIds,
    }: {
      boardId: string;
      columnIds: string[];
    }) =>
      api.put<{ success: boolean }>(`/boards/${boardId}/columns/reorder`, {
        columnIds,
      }),
    onMutate: async ({ boardId, columnIds }) => {
      await queryClient.cancelQueries({ queryKey: columnKeys.lists(boardId) });

      const previousColumns = queryClient.getQueryData<Column[]>(
        columnKeys.lists(boardId),
      );

      queryClient.setQueryData<Column[]>(columnKeys.lists(boardId), (old) => {
        if (!old) return [];
        const newColumns = [...old];
        newColumns.sort((a, b) => {
          return columnIds.indexOf(a.id) - columnIds.indexOf(b.id);
        });
        return newColumns;
      });

      return { previousColumns };
    },
    onError: (_err, { boardId }, context) => {
      if (context?.previousColumns) {
        queryClient.setQueryData(
          columnKeys.lists(boardId),
          context.previousColumns,
        );
      }
    },
    onSettled: (_data, _error, { boardId }) => {
      queryClient.invalidateQueries({ queryKey: columnKeys.lists(boardId) });
    },
  });
}
