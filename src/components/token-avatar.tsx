"use client";
import Image from "next/image";
import { useState } from "react";
export function TokenAvatar({
  src,
  symbol,
}: {
  src?: string | null;
  symbol: string;
}) {
  const [failed, setFailed] = useState(false);
  let allowed = false;
  try {
    allowed =
      new URL(src || "").hostname === "cdn.dexscreener.com" &&
      src!.startsWith("https://");
  } catch {}
  return (
    <span className="token-avatar">
      {allowed && !failed ? (
        <Image
          src={src!}
          width={40}
          height={40}
          alt=""
          onError={() => setFailed(true)}
        />
      ) : (
        symbol.slice(0, 2).toUpperCase()
      )}
    </span>
  );
}
