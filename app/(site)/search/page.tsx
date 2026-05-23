import { SearchResultsContainer } from "@/features/search";

type PageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: PageProps) {
  const { q = "" } = await searchParams;
  return (
    <div className="min-h-screen bg-white text-[#1a1a1a] font-sans selection:bg-blue-100 selection:text-blue-900">
      <main className="pt-32 pb-20 px-4 md:px-6 max-w-3xl mx-auto flex flex-col items-center">
        <SearchResultsContainer query={q} />
      </main>
    </div>
  );
}
