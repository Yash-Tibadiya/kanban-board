import { LoaderCircle } from "lucide-react";

const Loader = () => {
  return (
    <div className="flex min-h-[calc(100svh-11rem)] flex-col items-center justify-center p-6 md:p-10 dark:bg-black">
      <LoaderCircle className="animate-spin size-10" />
    </div>
  );
};

export default Loader;
