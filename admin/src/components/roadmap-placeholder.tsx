import { Construction } from "lucide-react";

type Props = {
  title: string;
  description: string;
};

export function RoadmapPlaceholder({ title, description }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
          <Construction className="size-7" aria-hidden />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">{title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
          <p className="mt-4 text-xs text-slate-500">
            Backend routes for this area are not exposed on the Urja Basket API yet. This shell stays isolated
            from the storefront and does not duplicate server logic.
          </p>
        </div>
      </div>
    </div>
  );
}
