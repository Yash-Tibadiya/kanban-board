import { useBoard } from "../hooks/use-boards";

interface DashboardContentProps {
  boardId: string;
}

export function DashboardContent({ boardId }: DashboardContentProps) {
  const { data: board, isLoading, error } = useBoard(boardId);

  if (isLoading) {
    return <div className="p-8">Loading board details...</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-destructive">
        Failed to load board: {error.message}
      </div>
    );
  }

  if (!board) {
    return <div className="p-8">Board not found</div>;
  }

  return (
    <div className="flex h-full min-h-[calc(100svh-7rem)] flex-col">
      <header className="border-b px-6 py-4">
        <h1 className="text-2xl font-bold">{board.title}</h1>
        {board.description && (
          <p className="text-muted-foreground">{board.description}</p>
        )}
      </header>
      <main className="flex-1 overflow-x-auto p-6 bg-muted/10">
        <div className="mb-4 rounded-md bg-yellow-50 p-4 text-sm text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
          Note: Columns and tasks backend endpoints are not yet implemented.
          This is a frontend-only placeholder for the board detail view.
        </div>
        <div className="flex gap-4 h-full">
          {/* Placeholder Columns */}
          {["To Do", "In Progress", "Done"].map((col) => (
            <div
              key={col}
              className="flex h-full w-80 flex-col rounded-lg border bg-muted/50 p-4"
            >
              <h3 className="font-semibold mb-4">{col}</h3>
              <div className="flex-1 rounded border border-dashed border-muted-foreground/25 flex items-center justify-center text-sm text-muted-foreground">
                No tasks
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
