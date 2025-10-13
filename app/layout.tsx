// src/app/layout.tsx
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Negocios App",
  description: "Conectá con negocios cerca tuyo y hacé pedidos online",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="es">
        <body
          className={`${inter.className} bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50 transition-colors`}
        >
          <ThemeProvider>
            <Navbar />

            <main className="max-w-6xl mx-auto p-4">{children}</main>

            <footer className="text-center py-6 text-sm text-neutral-500 dark:text-neutral-400 border-t border-neutral-200 dark:border-neutral-700 mt-10">
              © {new Date().getFullYear()} NegociosApp – Todos los derechos
              reservados.
            </footer>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
