import { cn } from "@/lib/utils";
import { DotPattern } from "@/components/ui/dot-pattern";

const LoginHeroPanel = () => {
  return (
    <div className="flex items-center justify-center h-full w-full relative">
      <DotPattern
        glow={true}
        className={cn(
          "pt-2 pl-2 mask-[linear-gradient(to_bottom_right,white,transparent)]",
        )}
      />

      <div className="flex items-center justify-center lg:justify-end h-full w-full relative py-6 lg:py-0 px-4 lg:px-0">
        <img
          src="https://placehold.co/1000x1000"
          alt="Login Hero"
          width={1000}
          height={1000}
          className="max-w-md w-full object-contain shrink-0 dark:hidden z-20 border-t-2 border-l-2 border-neutral-300 rounded-sm"
        />
        <img
          src="https://placehold.co/1000x1000"
          alt="Login Hero"
          width={1000}
          height={1000}
          className="max-w-md w-full object-contain shrink-0 hidden dark:block z-20 border-t-2 border-l-2 border-neutral-700/70 rounded-sm"
        />
      </div>
      <div className="absolute bg-linear-to-b from-transparent to-accent dark:to-neutral-950 z-50 h-full w-full"></div>
      <div className="absolute bg-linear-to-r from-transparent to-accent dark:to-neutral-950 z-50 h-full w-full"></div>
    </div>
  );
};

export default LoginHeroPanel;
