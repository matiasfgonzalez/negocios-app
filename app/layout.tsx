// src/app/layout.tsx
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";

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
            <header className="border-b border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-soft dark:shadow-soft-dark">
              <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
                <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">
                  NegociosApp
                </h1>
                <div className="flex items-center gap-4">
                  <nav className="flex gap-4">
                    <a
                      href="/"
                      className="text-neutral-700 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      Inicio
                    </a>
                    <a
                      href="/#negocios"
                      className="text-neutral-700 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      Negocios
                    </a>
                  </nav>
                  <ThemeToggle />
                </div>
              </div>
            </header>

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
