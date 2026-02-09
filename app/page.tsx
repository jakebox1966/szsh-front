import { Header, Footer } from "@/components/layout";
import { HomeContainer } from "@/features/home";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-[#1a1a1a] font-sans selection:bg-blue-100 selection:text-blue-900">
      <Header />

      <main className="pt-32 pb-20 px-4 md:px-6 max-w-3xl mx-auto flex flex-col items-center">
        <HomeContainer />
      </main>

      <Footer />
    </div>
  );
}
