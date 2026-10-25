import { Header } from "@/components/header";
import { Footer } from "@/components/brand";
import { rules } from "@/lib/market";
import { money } from "@/lib/utils";
export default function Methodology() {
  const r = rules();
  return (
    <>
      <Header />
      <main className="main prose-page">
        <div className="eyebrow">A LITTLE MORE TRANSPARENCY</div>
        <h1>
          Good discovery starts
          <br />
          with honest signals.
        </h1>
        <p className="intro">
          We connect real market activity with human perspective. Here’s what
          our data can tell you, and where it stops.
        </p>
        <section className="panel">
          <h2>One sample. Four perspectives.</h2>
          <p>
            Our discovery universe combines the latest DexScreener token
            profiles, a small set of established chain-and-address anchors, and
            active curator entries. Profiles are not a complete market census
            and may reflect promotional activity. Rankings cover only this
            sample.
          </p>
          <ul>
            <li>
              <strong>Top Cult Coins:</strong> manually selected by an
              administrator. Featured entries appear first, then display
              priority. Inclusion is editorial, not a safety rating.
            </li>
            <li>
              <strong>Trending:</strong> 0.45 × log10(1 + 24h USD volume) + 0.35
              × log10(1 + 24h transaction count) + 0.20 × log10(1 + USD
              liquidity). Price spikes alone do not improve this score.
            </li>
            <li>
              <strong>Potential Gems:</strong> eligible markets with a known
              pair age of {r.maxAgeDays} days or less, ordered by the same
              activity score. Pair age is not token creation age.
            </li>
            <li>
              <strong>Highest Volume:</strong> 24-hour USD volume, descending.
              This is selected-pair volume, not a token-wide estimate.
            </li>
          </ul>
          <p>
            Automated lists require at least {money(r.minLiquidity, true)}{" "}
            liquidity, {money(r.minVolume, true)} 24-hour volume, a positive USD
            price, and available 24-hour transaction counts. Administrators can
            configure these thresholds in server environment variables.
          </p>
        </section>
        <section className="panel">
          <h2>Every token has an address.</h2>
          <p>
            Tokens are identified by network and contract address. Ethereum
            addresses are normalized to lowercase; Solana addresses retain their
            case. We choose the highest-liquidity base-token pair for each token
            and never sum duplicate pairs. Search includes tokens below
            discovery thresholds. Search ranking comes from the provider.
          </p>
        </section>
        <section className="panel">
          <h2>The limits matter.</h2>
          <p>
            DexScreener supplies price, volume, liquidity, pair age and buy/sell
            transaction counts where available. Counts are not buy/sell volume.
            This integration does not supply historical candles, liquidity
            history, holder concentration, or a contract audit. Missing fields
            stay missing. Market cap and fully diluted valuation remain separate
            metrics.
          </p>
          <p>
            Solana and Ethereum are enabled. Robinhood Chain is reserved in the
            network model; market coverage has not been verified and is not
            claimed. A future provider can be added without changing token
            identity.
          </p>
        </section>
        <section className="panel">
          <h2>Freshness, with a fallback.</h2>
          <p>
            Server requests are cached for 60 seconds and concurrent requests
            are deduplicated. Requests time out after 8 seconds, with one retry
            for transient failures. Rate-limit responses create a short
            cooldown. A warm server can retain a snapshot for up to 15 minutes
            during an outage; snapshots older than 90 seconds are marked cached.
            Refresh the page for a new snapshot. A cold server may have no
            fallback.
          </p>
          <p>
            Sample statistics cover eligible tokens only and are not global
            market statistics. Provider values can be incomplete or inaccurate.
            Always verify token identity and source data independently.
          </p>
        </section>
        <section className="panel">
          <h2>Original sources</h2>
          <p>
            <a
              href="https://docs.dexscreener.com/api/reference"
              target="_blank"
              rel="noopener noreferrer"
            >
              DexScreener API documentation
            </a>
            <br />
            <a
              href="https://robinhood.com/us/en/newsroom/robinhood-chain-launches-public-testnet/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Robinhood Chain public testnet announcement
            </a>
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
