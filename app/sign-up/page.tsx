"use client";

import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { Store } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header con logo */}
        <div className="text-center space-y-4">
          <Link href="/" className="inline-flex items-center space-x-3 group">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white dark:bg-white rounded-2xl overflow-hidden shadow-md group-hover:shadow-lg transition-all p-2">
              <Image
                src="/logo.PNG"
                alt="BarrioMarket Logo"
                width={64}
                height={64}
                className="object-contain w-full h-full"
                priority
              />
            </div>
            <div className="text-left">
              <span className="text-xl sm:text-2xl font-bold text-foreground">
                BarrioMarket
              </span>
              <div className="text-xs text-muted-foreground font-medium">
                Tu barrio, tu comercio
              </div>
            </div>
          </Link>
        </div>

        <SignUp
          appearance={{
            elements: {
              // UI improved: Enhanced card styling
              card: "shadow-xl border border-border bg-card/95 backdrop-blur-sm",
              headerTitle: "text-xl sm:text-2xl font-bold text-foreground",
              headerSubtitle: "text-sm sm:text-base text-muted-foreground",

              // UI improved: Enhanced buttons
              socialButtonsBlockButton:
                "bg-primary hover:bg-primary/90 text-primary-foreground border-0 shadow-md hover:shadow-lg transition-all",
              formButtonPrimary:
                "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all",

              // UI improved: Enhanced links and inputs
              footerActionLink:
                "text-primary hover:text-primary/80 transition-colors",
              formFieldInput:
                "border-border focus:border-primary bg-background text-foreground placeholder:text-muted-foreground",
              formFieldLabel: "text-sm font-medium text-foreground",
              identityPreviewText: "text-muted-foreground",
              formHeaderTitle:
                "text-lg sm:text-xl font-semibold text-foreground",
              formHeaderSubtitle: "text-sm text-muted-foreground",

              // UI improved: Enhanced divider and text
              dividerLine: "bg-border",
              dividerText: "text-muted-foreground",
              footerActionText: "text-muted-foreground",
            },
            variables: {
              colorPrimary: "hsl(var(--primary))",
              colorBackground: "hsl(var(--card))",
              colorText: "hsl(var(--foreground))",
              colorInputText: "hsl(var(--foreground))",
              colorInputBackground: "hsl(var(--background))",
              borderRadius: "0.75rem",
            },
          }}
        />

        {/* Back Link */}
        <div className="text-center">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
