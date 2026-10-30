import type { Metadata } from "next";
import localFont from "next/font/local";
import { Header } from "@/components/shell/Header";
import { Footer } from "@/components/shell/Footer";
import { themeBootstrapScript } from "@/components/theme/theme";
import { GraphicsProvider, PauseMotionButton } from "@/features/graphics/GraphicsProvider";
import "./globals.css";

const baloo = localFont({ src: "../assets/fonts/baloo-2/baloo-2-latin-variable.woff2", variable: "--font-baloo", display: "swap", weight: "400 800" });
const archivo = localFont({ src: "../assets/fonts/archivo/archivo-latin-variable.woff2", variable: "--font-archivo", display: "swap", weight: "100 900" });

export const metadata: Metadata = {
  title: { default: "Root Trust · A base que sustenta o crescimento", template: "%s · Root Trust" },
  description: "Cibersegurança, infraestrutura em nuvem e software para operações críticas.",
  robots: { index: false, follow: false },
  icons: { icon: "/assets/simbolo-negativo.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // suppressHydrationWarning só neste <html>: o script do head define data-theme/data-theme-pref antes da hidratação; não cobre filhos.
  return <html lang="pt-BR" className={`${baloo.variable} ${archivo.variable}`} suppressHydrationWarning><head>
    <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
  </head><body>
    <a className="skipLink" href="#conteudo">Pular para o conteúdo</a>
    <GraphicsProvider><Header />{children}<Footer /><PauseMotionButton /></GraphicsProvider>
  </body></html>;
}
