import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found">
      <div>
        <p className="kicker">Signal lost</p>
        <h1>404</h1>
        <p>The requested frame is outside this sequence.</p>
        <Link className="arrow-link" href="/">Return to the experience <span>↗</span></Link>
      </div>
    </main>
  );
}
