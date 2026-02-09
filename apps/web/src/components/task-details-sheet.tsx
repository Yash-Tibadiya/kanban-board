import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Task, TaskType } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CommentInput } from "./comment-input";
import { CommentList } from "./comment-list";
import { getTaskTypeIcon } from "@/lib/task-type-icons";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TaskDetailsSheetProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  taskTypes?: TaskType[];
}

export function TaskDetailsSheet({
  task,
  isOpen,
  onClose,
  taskTypes = [],
}: TaskDetailsSheetProps) {
  const TypeIcon = getTaskTypeIcon(task.type);

  // Find full type object if possible to get custom icon
  const taskTypeObj = taskTypes.find((t) => t.name === task.type);
  const FinalTypeIcon = taskTypeObj
    ? getTaskTypeIcon(taskTypeObj.icon)
    : TypeIcon;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[700px] sm:p-0 rounded-none border-l-0 gap-0 flex flex-col h-full bg-background">
        <div className="flex-1 overflow-y-auto flex flex-col">
          <div className="px-2 py-2">
            <SheetHeader className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1.5 py-1 px-2 h-6 rounded-none"
                >
                  <FinalTypeIcon className="h-3.5 w-3.5" />
                  {task.type}
                </Badge>
                <Badge
                  variant={
                    task.priority === "critical" || task.priority === "high"
                      ? "destructive"
                      : "secondary"
                  }
                  className="text-[10px] uppercase tracking-wider font-semibold py-1 px-2 h-6 bg-opacity-10 hover:bg-opacity-20 rounded-none"
                >
                  {task.priority || "No Priority"}
                </Badge>
              </div>

              <SheetTitle className="text-2xl font-bold leading-tight tracking-tight">
                {task.title}
              </SheetTitle>

              <div className="space-y-4">
                {task.description ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/90">
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {task.description}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No description provided.
                  </p>
                )}
              </div>

              <div className="pt-4">
                <Separator className="mb-4" />
                <SheetDescription className="flex flex-col items-start text-sm text-foreground/80 gap-3">
                  {task.user && (
                    <span className="flex items-center gap-2 text-xs font-medium">
                      <span className="text-muted-foreground font-normal min-w-[80px]">
                        Assigned to:
                      </span>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5 border rounded-none">
                          <AvatarImage
                            src={task.user.image || undefined}
                            className="rounded-none"
                          />
                          <AvatarFallback className="text-[9px] rounded-none">
                            {task.user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-foreground">
                          {task.user.name}
                        </span>
                      </div>
                    </span>
                  )}
                  <span className="flex items-center gap-2 text-xs font-medium">
                    <span className="text-muted-foreground font-normal min-w-[80px]">
                      Created:
                    </span>
                    <span className="text-foreground">
                      {formatDistanceToNow(new Date(task.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </span>
                </SheetDescription>
              </div>
            </SheetHeader>
          </div>

          <div className="flex-1 bg-muted/50 p-6 border-t border-border min-h-[300px]">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2 text-foreground/90">
              Activity & Comments
            </h3>

            <div className="space-y-6">
              <CommentList taskId={task.id} />
              <CommentInput taskId={task.id} />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
