import Link from "next/link";
export default function NotFound() {
  return (
    <main className="main unavailable">
      <h1>This gem hasn’t been found.</h1>
      <p>Check the token address and network, or return to discovery.</p>
      <Link className="button button-primary" href="/">
        Back to discovery
      </Link>
    </main>
  );
}
