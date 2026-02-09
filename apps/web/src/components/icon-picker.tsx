import { ScrollArea } from "./ui/scroll-area";
import { cn } from "../lib/utils";
import {
  TASK_TYPE_ICON_OPTIONS,
  getTaskTypeIcon,
} from "../lib/task-type-icons";

interface IconPickerProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function IconPicker({ value, onValueChange }: IconPickerProps) {
  return (
    <ScrollArea className="h-56 w-full border rounded-none">
      <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 p-3">
        {TASK_TYPE_ICON_OPTIONS.map((option) => {
          const Icon = getTaskTypeIcon(option.name);
          const isSelected = option.name === value;

          return (
            <button
              key={option.name}
              type="button"
              title={option.label}
              onClick={() => onValueChange(option.name)}
              className={cn(
                "h-10 w-10 border rounded-none flex items-center justify-center transition-colors",
                isSelected
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background hover:bg-muted",
              )}
            >
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
}
