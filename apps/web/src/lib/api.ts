export const API_URL = "http://localhost:4000/api";

export type Board = {
  id: string;
  title: string;
  description: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateBoardData = {
  title: string;
  description?: string;
};

export type UpdateBoardData = {
  title?: string;
  description?: string;
};

export type Column = {
  id: string;
  title: string;
  order: number;
  boardId: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateColumnData = {
  title: string;
  order?: number;
  boardId: string;
};

export type UpdateColumnData = {
  title?: string;
  order?: number;
};

export type Task = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  priority: string | null;
  order: number;
  columnId: string;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    name: string;
    image: string | null;
  } | null;
};

export type CreateTaskData = {
  title: string;
  description?: string;
  type?: string;
  priority?: string;
  order?: number;
  columnId: string;
};

export type UpdateTaskData = {
  title?: string;
  description?: string;
  type?: string;
  priority?: string;
  columnId?: string;
  order?: number;
};

export type TaskType = {
  id: string;
  name: string;
  icon: string;
  color: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateTaskTypeData = {
  name: string;
  icon: string;
  color?: string | null;
};

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    public message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = errorData.error || {};
    throw new ApiError(
      response.status,
      error.code || "UNKNOWN",
      error.message || "An unexpected error occurred",
      error.details,
    );
  }
  return response.json();
}

export const api = {
  get: async <T>(endpoint: string): Promise<T> => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    return handleResponse<T>(response);
  },

  post: async <T>(endpoint: string, data: unknown): Promise<T> => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });
    return handleResponse<T>(response);
  },

  patch: async <T>(endpoint: string, data: unknown): Promise<T> => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });
    return handleResponse<T>(response);
  },

  delete: async <T>(endpoint: string): Promise<T> => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    return handleResponse<T>(response);
  },

  put: async <T>(endpoint: string, data: unknown): Promise<T> => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });
    return handleResponse<T>(response);
  },
};
