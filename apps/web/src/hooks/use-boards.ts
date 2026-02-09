import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, Board, CreateBoardData, UpdateBoardData } from "../lib/api";

export const boardKeys = {
  all: ["boards"] as const,
  lists: () => [...boardKeys.all, "list"] as const,
  detail: (id: string) => [...boardKeys.all, "detail", id] as const,
};

export function useBoards() {
  return useQuery({
    queryKey: boardKeys.lists(),
    queryFn: async () => {
      try {
        return await api.get<Board[]>("/boards");
      } catch (error: any) {
        if (error.status === 404) {
          return [];
        }
        throw error;
      }
    },
  });
}

export function useBoard(id: string) {
  return useQuery({
    queryKey: boardKeys.detail(id),
    queryFn: () => api.get<Board>(`/boards/${id}`),
    enabled: !!id,
  });
}

export function useCreateBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBoardData) => api.post<Board>("/boards", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.lists() });
    },
  });
}

export function useUpdateBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBoardData }) =>
      api.patch<Board>(`/boards/${id}`, data),
    onSuccess: (updatedBoard) => {
      queryClient.setQueryData(boardKeys.detail(updatedBoard.id), updatedBoard);
      queryClient.invalidateQueries({ queryKey: boardKeys.lists() });
    },
  });
}

export function useDeleteBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete<Board>(`/boards/${id}`),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: boardKeys.lists() });
      queryClient.removeQueries({ queryKey: boardKeys.detail(id) });
    },
  });
}

export function useReorderBoards() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (boardIds: string[]) => api.reorderBoards(boardIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.lists() });
    },
  });
}
