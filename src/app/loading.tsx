import { Brand } from "@/components/brand";
export default function Loading() {
  return (
    <main className="main loading-page">
      <Brand />
      <p className="eyebrow">FINDING THE SIGNAL</p>
      <div className="skeleton skeleton-hero" />
      <div className="discovery-grid">
        {[1, 2, 3, 4].map((i) => (
          <div className="skeleton skeleton-panel" key={i} />
        ))}
      </div>
    </main>
  );
}
