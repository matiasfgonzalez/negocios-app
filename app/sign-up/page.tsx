"use client";

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
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
      </div>
    </div>
  );
}
