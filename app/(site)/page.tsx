import { HomeContainer } from "@/features/home";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-blue-100 selection:text-blue-900">
      <main className="pt-24 pb-20 px-4 md:px-6 max-w-3xl mx-auto flex flex-col items-center">
        <HomeContainer />
      </main>
    </div>
  );
}
