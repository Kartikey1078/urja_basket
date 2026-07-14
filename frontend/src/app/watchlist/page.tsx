import { WatchlistScreen } from "@/features/watchlist/watchlist-screen";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Watchlist",
  description: "Your saved Urja Basket favourites on this device.",
  path: "/watchlist",
  noindex: true,
});

export default function WatchlistPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <h1
        className="text-urja-forest text-2xl font-bold tracking-tight sm:text-3xl"
        style={{ fontFamily: "var(--font-urja-serif), ui-serif, Georgia, serif" }}
      >
        Watchlist
      </h1>
      <p className="text-muted-foreground mt-2 text-sm">
        Saved on this device — no account required.
      </p>
      <WatchlistScreen />
    </div>
  );
}
