type Props = { params: Promise<{ slug: string }> };

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const title = slug.replace(/-/g, " ");

  return (
    <div className="text-urja-forest mx-auto max-w-7xl px-4 py-10 capitalize">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
    </div>
  );
}
