const ITEMS = [
  "★ FREE FOREVER",
  "NO ADS",
  "✦ AI-PERSONALIZED",
  "14-DAY PLANS",
  "★ NO PAYMENTS",
  "BUILT WITH LOVE",
  "✦ TRAIN ANYWHERE",
];

export function Marquee() {
  const row = [...ITEMS, ...ITEMS];
  return (
    <div className="relative overflow-hidden bg-foreground py-4 text-background">
      <div className="marquee-track gap-12 whitespace-nowrap">
        {row.map((t, i) => (
          <span key={i} className="serif text-xl font-bold tracking-wider">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
