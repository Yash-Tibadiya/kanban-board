import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bell,
  BookOpen,
  Briefcase,
  Bug,
  Calendar,
  CheckSquare,
  ClipboardList,
  Clock,
  Code,
  Cpu,
  Database,
  FileText,
  Flag,
  FolderOpen,
  GitBranch,
  GitPullRequest,
  Globe,
  Layers,
  Lightbulb,
  Lock,
  Megaphone,
  MessageSquare,
  Monitor,
  Package,
  Palette,
  PencilRuler,
  PenTool,
  Rocket,
  Search,
  Settings,
  Shield,
  Smartphone,
  Sparkles,
  Star,
  Target,
  Users,
  Workflow,
  Wrench,
  Zap,
} from "lucide-react";

export type TaskTypeIconOption = {
  name: string;
  label: string;
  icon: LucideIcon;
};

export const TASK_TYPE_ICON_OPTIONS: TaskTypeIconOption[] = [
  { name: "FileText", label: "File Text", icon: FileText },
  { name: "Bug", label: "Bug", icon: Bug },
  { name: "Star", label: "Star", icon: Star },
  { name: "CheckSquare", label: "Check Square", icon: CheckSquare },
  { name: "ClipboardList", label: "Clipboard List", icon: ClipboardList },
  { name: "Lightbulb", label: "Lightbulb", icon: Lightbulb },
  { name: "Wrench", label: "Wrench", icon: Wrench },
  { name: "Rocket", label: "Rocket", icon: Rocket },
  { name: "Code", label: "Code", icon: Code },
  { name: "Palette", label: "Palette", icon: Palette },
  { name: "Megaphone", label: "Megaphone", icon: Megaphone },
  { name: "Shield", label: "Shield", icon: Shield },
  { name: "Lock", label: "Lock", icon: Lock },
  { name: "Database", label: "Database", icon: Database },
  { name: "Globe", label: "Globe", icon: Globe },
  { name: "BarChart3", label: "Bar Chart", icon: BarChart3 },
  { name: "Users", label: "Users", icon: Users },
  { name: "Calendar", label: "Calendar", icon: Calendar },
  { name: "Clock", label: "Clock", icon: Clock },
  { name: "Target", label: "Target", icon: Target },
  { name: "Flag", label: "Flag", icon: Flag },
  { name: "BookOpen", label: "Book Open", icon: BookOpen },
  { name: "MessageSquare", label: "Message Square", icon: MessageSquare },
  { name: "Bell", label: "Bell", icon: Bell },
  { name: "Search", label: "Search", icon: Search },
  { name: "Settings", label: "Settings", icon: Settings },
  { name: "GitBranch", label: "Git Branch", icon: GitBranch },
  { name: "GitPullRequest", label: "Pull Request", icon: GitPullRequest },
  { name: "Package", label: "Package", icon: Package },
  { name: "Zap", label: "Zap", icon: Zap },
  { name: "Cpu", label: "CPU", icon: Cpu },
  { name: "Smartphone", label: "Smartphone", icon: Smartphone },
  { name: "Monitor", label: "Monitor", icon: Monitor },
  { name: "PenTool", label: "Pen Tool", icon: PenTool },
  { name: "PencilRuler", label: "Pencil Ruler", icon: PencilRuler },
  { name: "Layers", label: "Layers", icon: Layers },
  { name: "Workflow", label: "Workflow", icon: Workflow },
  { name: "Sparkles", label: "Sparkles", icon: Sparkles },
  { name: "FolderOpen", label: "Folder Open", icon: FolderOpen },
  { name: "Briefcase", label: "Briefcase", icon: Briefcase },
];

const TASK_TYPE_ICON_MAP = TASK_TYPE_ICON_OPTIONS.reduce<
  Record<string, LucideIcon>
>((acc, option) => {
  acc[option.name] = option.icon;
  return acc;
}, {});

export function getTaskTypeIcon(iconName: string | null | undefined): LucideIcon {
  if (!iconName) {
    return FileText;
  }

  return TASK_TYPE_ICON_MAP[iconName] ?? FileText;
}
