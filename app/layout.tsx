// src/app/layout.tsx
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";

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
        <body className={`${inter.className} bg-gray-50 text-gray-900`}>
          <header className="border-b bg-white shadow-sm">
            <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
              <h1 className="text-xl font-bold text-primary">NegociosApp</h1>
              <nav className="flex gap-4">
                <a href="/" className="hover:underline">
                  Inicio
                </a>
                <a href="/#negocios" className="hover:underline">
                  Negocios
                </a>
              </nav>
            </div>
          </header>

          <main className="max-w-6xl mx-auto p-4">{children}</main>

          <footer className="text-center py-6 text-sm text-gray-500 border-t mt-10">
            © {new Date().getFullYear()} NegociosApp – Todos los derechos
            reservados.
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
