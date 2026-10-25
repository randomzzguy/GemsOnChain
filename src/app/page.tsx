import { Discovery } from "@/components/discovery";
import { getCuration } from "@/lib/curation";
import { discovery, rules } from "@/lib/market";
export const dynamic = "force-dynamic";
export default async function Home() {
  const c = await getCuration();
  const market = await discovery(c.coins);
  return (
    <Discovery
      market={market}
      coins={c.coins}
      curationStatus={c.status}
      rules={rules()}
    />
  );
}
