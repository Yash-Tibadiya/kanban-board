import { Link } from "react-router-dom";
import { useBoards } from "../hooks/use-boards";

export function BoardList() {
  const { data: boards, isLoading, error } = useBoards();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-lg border bg-muted"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
        Failed to load boards: {error.message}
      </div>
    );
  }

  if (!boards?.length) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed text-center">
        <h3 className="text-lg font-semibold">No boards yet</h3>
        <p className="text-sm text-muted-foreground">
          Create your first board to get started
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {boards.map((board) => (
        <Link
          key={board.id}
          to={`/boards/${board.id}`}
          className="group block rounded-lg border p-4 transition-colors hover:border-primary hover:bg-muted/50"
        >
          <h3 className="mb-2 text-lg font-semibold group-hover:text-primary">
            {board.title}
          </h3>
          <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
            {board.description || "No description"}
          </p>
          <div className="text-xs text-muted-foreground">
            Updated {new Date(board.updatedAt).toLocaleDateString()}
          </div>
        </Link>
      ))}
    </div>
  );
}
