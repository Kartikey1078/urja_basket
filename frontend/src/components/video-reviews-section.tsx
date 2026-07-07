import { Play, Star, Video } from "lucide-react";
import Image from "next/image";

import { cn } from "@/lib/utils";

type VideoReview = {
  id: string;
  name: string;
  place: string;
  quote: string;
  rating: number;
  /** Poster frame for the “video review” card (replace with real video stills later). */
  poster: string;
};

const REVIEWS: VideoReview[] = [
  {
    id: "1",
    name: "Priya Sharma",
    place: "Delhi",
    quote: "Unboxing felt premium—nuts were crunchy and exactly as shown.",
    rating: 5,
    poster:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&w=720&h=720&fit=crop&q=80",
  },
  {
    id: "2",
    name: "Rahul Verma",
    place: "Gurugram",
    quote: "Ordered for parents. They loved the freshness and quick delivery.",
    rating: 5,
    poster:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&w=720&h=720&fit=crop&q=80",
  },
  {
    id: "3",
    name: "Ananya Iyer",
    place: "Bengaluru",
    quote: "Honest packaging and taste. This is now our monthly refill.",
    rating: 5,
    poster:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&w=720&h=720&fit=crop&q=80",
  },
  {
    id: "4",
    name: "Kunal Mehta",
    place: "Mumbai",
    quote: "Short video said it all—same quality in the box. Highly recommend.",
    rating: 4,
    poster:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&w=720&h=720&fit=crop&q=80",
  },
];

function Stars({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            "size-3.5 sm:size-4",
            i < value
              ? "fill-amber-400 text-amber-400"
              : "fill-muted/30 text-muted/40"
          )}
          strokeWidth={1.25}
          aria-hidden
        />
      ))}
    </span>
  );
}

function ReviewCard({ review }: { review: VideoReview }) {
  return (
    <article
      className={cn(
        "border-urja-forest/15 bg-card shrink-0 grow-0 snap-start snap-always overflow-hidden rounded-2xl border shadow-lg shadow-black/10 ring-1 ring-black/[0.06] transition-[box-shadow,transform] duration-200",
        "hover:shadow-xl hover:shadow-black/15 hover:ring-urja-forest/20",
        "w-[11.5rem] min-w-[11.5rem] max-w-[11.5rem]",
        "sm:w-[12.5rem] sm:min-w-[12.5rem] sm:max-w-[12.5rem]",
        "md:w-[min(20.5rem,calc((min(100vw,80rem)-5rem)/3.15))] md:max-w-[20.5rem] md:min-w-0"
      )}
    >
      <div className="bg-muted/50 relative aspect-square w-full overflow-hidden">
        <Image
          src={review.poster}
          alt=""
          fill
          sizes="(max-width: 768px) 42vw, 328px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            type="button"
            className="focus-visible:ring-urja-forest inline-flex size-14 items-center justify-center rounded-full bg-white text-urja-forest shadow-lg shadow-black/25 ring-2 ring-white transition hover:scale-105 hover:bg-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none sm:size-16"
            aria-label={`Play video review from ${review.name}`}
          >
            <Play className="size-7 translate-x-0.5 fill-current sm:size-8" strokeWidth={0} />
          </button>
        </div>
        <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 rounded-md bg-black/55 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm sm:bottom-3 sm:left-3 sm:text-xs">
          <Video className="size-3 shrink-0" strokeWidth={2} aria-hidden />
          Video review
        </span>
      </div>
      <div className="flex flex-col gap-2 border-t border-black/[0.06] p-3 sm:gap-2 sm:p-3.5">
        <Stars value={review.rating} />
        <p className="text-foreground text-sm leading-snug font-medium sm:text-base">
          &ldquo;{review.quote}&rdquo;
        </p>
        <p className="text-muted-foreground text-xs sm:text-sm">
          <span className="text-foreground font-semibold">{review.name}</span>
          <span className="mx-1.5 text-border">·</span>
          {review.place}
        </p>
      </div>
    </article>
  );
}

/**
 * Video reviews: horizontal scroll; each card is sized like an IG feed post (square media + caption block).
 */
export function VideoReviewsSection() {
  return (
    <section
      className="border-urja-forest/12 from-urja-cream/40 via-background to-urja-cream/25 mt-8 w-full min-w-0 bg-gradient-to-b sm:mt-10 md:mt-12 lg:mt-14"
      aria-labelledby="video-reviews-heading"
    >
      <div className="mx-auto w-full min-w-0 max-w-7xl overflow-hidden px-3 pt-7 pb-9 sm:px-4 sm:pt-8 sm:pb-10 lg:px-6 lg:pt-9 lg:pb-11 xl:px-10">
        <div className="mb-3 sm:mb-4">
          <div className="flex items-center gap-2.5">
            <span className="bg-urja-forest/10 text-urja-forest inline-flex size-10 items-center justify-center rounded-xl sm:size-11">
              <Video className="size-5 sm:size-5" strokeWidth={2} aria-hidden />
            </span>
            <div>
              <h2
                id="video-reviews-heading"
                className="text-foreground text-xl font-bold tracking-tight sm:text-2xl md:text-3xl"
              >
                Video reviews
              </h2>
              <p className="text-muted-foreground mt-0.5 max-w-2xl text-sm leading-snug sm:text-base">
                Real customers — tap play on any card to hear their story.
              </p>
            </div>
          </div>
        </div>

        <div
          className="no-scrollbar scroll-x-rail flex w-full min-w-0 flex-nowrap snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-2 sm:gap-4 md:gap-5"
          style={{
            scrollPaddingLeft: "max(0.75rem, env(safe-area-inset-left, 0px))",
            scrollPaddingRight: "max(0.75rem, env(safe-area-inset-right, 0px))",
          }}
        >
          {REVIEWS.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </div>
    </section>
  );
}
