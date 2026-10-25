import { NextRequest, NextResponse } from "next/server";
import { searchMarket } from "@/lib/market";
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() || "";
  if (q.length < 2 || q.length > 100)
    return NextResponse.json(
      { error: "Search must be 2–100 characters.", pairs: [] },
      { status: 400 },
    );
  return NextResponse.json(await searchMarket(q), {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
    },
  });
}
