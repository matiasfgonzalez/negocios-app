// src/app/layout.tsx
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/Navbar";
import UserSync from "@/components/UserSync";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "BarrioMarket - Tu barrio, tu comercio",
  description:
    "Conectá con negocios de tu barrio y hacé pedidos online. La plataforma argentina que une comerciantes locales con clientes. Comprá fácil, rápido y cerca de casa.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="es" suppressHydrationWarning>
        <body
          className={`${inter.className} bg-background text-foreground antialiased transition-colors duration-200`}
        >
          <ThemeProvider>
            {/* Sincronización automática de usuario con la base de datos */}
            <UserSync />

            {/* UI improved: Added gradient background overlay */}
            <div className="fixed inset-0 -z-10 bg-gradient-to-br from-background via-background to-muted/20 dark:from-background dark:via-background dark:to-muted/10" />

            <Navbar />

            {/* UI improved: Enhanced main container with better spacing and max-width */}
            <main className="relative min-h-[calc(100vh-16rem)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>

            {/* UI improved: Enhanced footer with better styling and dark mode support */}
            <footer className="relative border-t border-border bg-card/50 backdrop-blur-sm mt-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    BarrioMarket
                  </p>
                  <p className="text-xs text-muted-foreground">
                    © {new Date().getFullYear()} Todos los derechos reservados ·
                    Tu barrio, tu comercio
                  </p>
                </div>
              </div>
            </footer>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
