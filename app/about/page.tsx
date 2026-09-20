import { site } from "@/lib/site";

export default function AboutPage() {
  return (
    <div className="page-overlay text-overlay">
      <div className="glass-panel">
        <p className="page-subtitle">{site.tagline}</p>
        <h2 className="page-title">About Us</h2>
        <div className="page-body">
          <p>
            Kian Dwells is a professionally managed serviced apartment offering the
            comfort of home with the convenience of a premium stay. Designed for
            both short and extended stays, each space combines modern comfort,
            practical amenities and a warm, welcoming atmosphere.
          </p>
          <p>
            Located in the royal city of Mysore, it provides an ideal base to
            experience the city&apos;s rich heritage, culture and modern
            conveniences — while enjoying a comfortable place to live, work and
            unwind.
          </p>
        </div>
      </div>
    </div>
  );
}
