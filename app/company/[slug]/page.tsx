import { CompanyDetailContainer } from "@/features/company";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CompanyPage({ params }: PageProps) {
  const { slug } = await params;
  return <CompanyDetailContainer slug={slug} />;
}
