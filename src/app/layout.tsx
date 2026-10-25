import type { Metadata } from "next";
import "./globals.css";
import "./experience.css";
import "./themes.css";
import { ExperienceProvider } from "@/components/experience";
import { ThemeProvider } from "@/components/theme-provider";
export const metadata: Metadata = {
  title: {
    default: "GemsOnChain — Find the signal",
    template: "%s · GemsOnChain",
  },
  description:
    "A more thoughtful way to discover crypto. Real market activity, curated communities, and transparent onchain signals.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('gems-theme');document.documentElement.dataset.theme=t==='dark'||t==='light'?t:matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}catch(e){document.documentElement.dataset.theme='light'}",
          }}
        />
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <ExperienceProvider>
          <ThemeProvider>
            <div id="main-content">{children}</div>
          </ThemeProvider>
        </ExperienceProvider>
      </body>
    </html>
  );
}
