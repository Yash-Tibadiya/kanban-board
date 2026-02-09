import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = authClient.useSession();

  return (
    <div className="flex min-h-svh max-w-screen flex-col overflow-x-hidden">
      <div
        className={cn(
          "sticky top-0 max-w-screen bg-background px-2 pt-2",
          "data-[affix=true]:shadow-[0_0_16px_0_black]/8 dark:data-[affix=true]:shadow-[0_0_16px_0_black]",
          "not-dark:data-[affix=true]:**:data-header-container:after:bg-border",
          "transition-shadow duration-300",
          "z-50",
        )}
      >
        <div
          className="screen-line-before screen-line-after mx-auto flex h-12 items-center justify-between gap-2 border-x border-edge pl-2 after:z-1 after:transition-[background-color] sm:gap-4 md:max-w-[calc(100svw-7rem)] relative"
          data-header-container
        >
          {/* Logo */}
          <Link to="/">
            <img
              src="/logos/black-logo.png"
              alt="Logo"
              width={32}
              height={32}
              className="h-8 w-auto cursor-pointer dark:invert"
            />
          </Link>

          <div className="flex-1" />

          <div className="flex items-center justify-center">
            {session && (
              <span className="hidden sm:flex items-center justify-center px-4 h-12 text-base font-medium border-l border-edge">
                Hello, {session.user.name}
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="rounded-none h-12 min-w-12 px-4 hover:bg-accent/50 transition-colors border-l border-edge"
              onClick={() => authClient.signOut()}
            >
              <LogOut className="sm:mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
            <span className="flex h-12 w-px bg-border" />
            <ThemeToggle />
          </div>

          <span className="border-primary/20 bg-muted absolute top-12 left-0 size-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-xs border z-20"></span>
          <span className="border-primary/20 bg-muted absolute top-12 right-0 size-2.5 translate-x-1/2 -translate-y-1/2 rotate-45 rounded-xs border z-20"></span>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto px-2 overflow-x-hidden">
        <div className="relative mx-auto min-h-[calc(100svh-7rem)] md:max-w-[calc(100svw-7rem)] border-x border-edge max-w-screen">
          {children}
        </div>
      </main>

      <div
        className={cn(
          "sticky top-0 z-50 max-w-screen bg-background px-2 pb-2",
          "data-[affix=true]:shadow-[0_0_16px_0_black]/8 dark:data-[affix=true]:shadow-[0_0_16px_0_black]",
          "not-dark:data-[affix=true]:**:data-header-container:before:bg-border",
          "transition-shadow duration-300",
        )}
      >
        <div
          className="screen-line-before screen-line-after mx-auto flex h-12 items-center justify-between gap-2 border-x border-edge px-2 before:z-1 before:transition-[background-color] sm:gap-4 md:max-w-[calc(100svw-7rem)]"
          data-header-container
        >
          <span className="border-primary/20 bg-muted absolute top-0 left-0 size-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-xs border z-20"></span>
          <span className="border-primary/20 bg-muted absolute top-0 right-0 size-2.5 translate-x-1/2 -translate-y-1/2 rotate-45 rounded-xs border z-20"></span>
        </div>
      </div>
    </div>
  );
}
