import { Link } from "react-router-dom";
import HomeLayout from "@/layouts/HomeLayout";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <HomeLayout>
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-linear-to-b from-neutral-200 to-neutral-500">
          Welcome to KBT
        </h1>
        <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mb-10">
          Streamline your workflow with our collaborative Kanban board. Manage
          tasks, track progress, and achieve your team goals efficiently.
        </p>
        <div className="flex gap-4">
          <Button asChild variant="default" size="lg">
            <Link to="/login">Get Started</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    </HomeLayout>
  );
}
