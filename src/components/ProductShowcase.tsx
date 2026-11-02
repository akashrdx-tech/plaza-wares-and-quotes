import { Link } from "@tanstack/react-router";

import catalogue from "@/lib/graceware-products.json";
import type { GracewareProduct } from "@/lib/graceware";
import { formatPKR, type PublicItem } from "@/lib/stock-types";

const WP_CARD_COUNT = 14;
const GRACE_CARD_COUNT = 14;

/** Spread picks across categories so the shelf reads like a full store window. */
function spreadPick<T>(values: T[], count: number): T[] {
  if (values.length <= count) return values;
  const step = values.length / count;
  return Array.from({ length: count }, (_, index) => values[Math.floor(index * step)]);
}

function pickWestPoint(items: PublicItem[]): PublicItem[] {
  const byCategory = new Map<string, PublicItem[]>();
  for (const item of items) {
    if (!item.isWestPoint) continue;
    const list = byCategory.get(item.category) ?? [];
    list.push(item);
    byCategory.set(item.category, list);
  }
  // Round-robin one item per category, preferring stocked items, until filled.
  const categories = [...byCategory.values()].map((list) =>
    [...list].sort((a, b) => b.qty - a.qty),
  );
  const picks: PublicItem[] = [];
  let cursor = 0;
  while (picks.length < WP_CARD_COUNT && categories.length > 0) {
    const list = categories[cursor % categories.length];
    const next = list.shift();
    if (next) picks.push(next);
    if (list.length === 0) categories.splice(cursor % categories.length, 1);
    cursor += 1;
  }
  return picks;
}

function pickGraceware(): GracewareProduct[] {
  const byCategory = new Map<string, GracewareProduct[]>();
  for (const product of catalogue as GracewareProduct[]) {
    for (const category of product.categories) {
      const list = byCategory.get(category) ?? [];
      list.push(product);
      byCategory.set(category, list);
    }
  }
  const categories = [...byCategory.values()];
  const picks: GracewareProduct[] = [];
  let cursor = 0;
  while (picks.length < GRACE_CARD_COUNT && categories.length > 0) {
    const list = categories[cursor % categories.length];
    const next = list.shift();
    if (next && !picks.some((pick) => pick.id === next.id)) picks.push(next);
    if (list.length === 0) categories.splice(cursor % categories.length, 1);
    cursor += 1;
  }
  return picks;
}

function ShowcaseRow({
  title,
  subtitle,
  count,
  to,
  reverse = false,
  duration,
  children,
}: {
  title: string;
  subtitle: string;
  count: number;
  to: string;
  reverse?: boolean;
  duration: number;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-6 first:mt-0">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2 px-1">
        <div>
          <h3 className="font-display text-lg tracking-widest text-foreground sm:text-xl">
            {title}
          </h3>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{subtitle}</p>
        </div>
        <Link
          to={to}
          className="group inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-gold transition-colors hover:border-ring hover:text-gold-foreground"
        >
          Explore more
          <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
        </Link>
      </div>
      <div className="marquee-window">
        <div
          className="marquee-track"
          data-reverse={reverse || undefined}
          style={{ "--marquee-duration": `${duration}s` } as React.CSSProperties}
        >
          {children}
          {children}
        </div>
      </div>
      <p className="sr-only">{count} products in this showcase</p>
    </div>
  );
}

export function ProductShowcase({ items }: { items: PublicItem[] }) {
  const wpPicks = pickWestPoint(items);
  const gracePicks = pickGraceware();

  return (
    <section className="surface-panel shine-sweep mt-6 px-4 py-6">
      <div className="mb-1 text-center">
        <p className="text-[11px] uppercase tracking-[0.35em] text-gold">Store window</p>
        <h2 className="font-display text-2xl tracking-wide sm:text-3xl">
          <span className="text-chrome">EXPLORE</span>{" "}
          <span className="text-brand-gradient">OUR PRODUCTS</span>
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          West Point appliances and original Graceware crockery — tap a product to see the full
          collection.
        </p>
      </div>

      <ShowcaseRow
        title="WEST POINT"
        subtitle="Appliances · live rates & stock"
        count={wpPicks.length}
        to="/westpoint"
        duration={58}
      >
        {wpPicks.map((item) => (
          <Link
            key={`wp-${item.id}`}
            to="/westpoint"
            className="showcase-card flex w-52 shrink-0 flex-col gap-2 p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="rounded-md border border-border/70 bg-secondary px-2 py-0.5 text-[10px] font-semibold tracking-wider text-muted-foreground">
                {item.code}
              </span>
              <span
                className={
                  item.qty > 0
                    ? "rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success"
                    : "rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-semibold text-destructive"
                }
              >
                {item.qty > 0 ? `${formatPKR(item.qty)} in stock` : "Out of stock"}
              </span>
            </div>
            <p className="line-clamp-2 min-h-10 font-display text-sm leading-snug tracking-wide text-foreground">
              {item.name}
            </p>
            <p className="mt-auto font-display text-xl tracking-wide text-brand-gradient">
              Rs {formatPKR(item.rate)}
            </p>
          </Link>
        ))}
      </ShowcaseRow>

      <ShowcaseRow
        title="GRACEWARE"
        subtitle="Original crockery · photo collection"
        count={gracePicks.length}
        to="/graceware"
        reverse
        duration={66}
      >
        {gracePicks.map((product) => (
          <Link
            key={`gr-${product.id}`}
            to="/graceware"
            className="showcase-card flex w-48 shrink-0 flex-col overflow-hidden"
          >
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              className="h-36 w-full object-cover"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
            <div className="flex flex-1 flex-col gap-1 p-3">
              <span className="text-[10px] uppercase tracking-widest text-gold">
                {product.category}
              </span>
              <p className="line-clamp-2 font-display text-sm leading-snug tracking-wide text-foreground">
                {product.name}
              </p>
            </div>
          </Link>
        ))}
      </ShowcaseRow>
    </section>
  );
}
