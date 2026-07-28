import Image from "next/image";

const heroAlt =
  "Urja Basket — Welcome. Order now and enjoy great offers.";

export function HomeHero() {
  return (
    <section className="relative w-full min-w-0" aria-label="Urja Basket">
      <Image
        src="/home/bgBanner.png"
        alt={heroAlt}
        width={1531}
        height={518}
        sizes="100vw"
        className="block h-auto w-full object-center"
        priority
        unoptimized
      />
    </section>
  );
}
