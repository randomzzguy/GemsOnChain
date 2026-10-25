"use client";
import { Button } from "@/components/ui/button";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="main unavailable">
      <h1>A small interruption.</h1>
      <p>We couldn’t load this page. Please try again.</p>
      <Button onClick={reset}>Try again</Button>
    </main>
  );
}
