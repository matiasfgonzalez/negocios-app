"use client";

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <SignUp
          appearance={{
            elements: {
              card: "shadow-xl border-2 border-gray-100 dark:border-gray-700 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm",
              headerTitle: "text-2xl font-bold text-gray-900 dark:text-white",
              headerSubtitle: "text-gray-600 dark:text-gray-300",
              socialButtonsBlockButton:
                "bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200",
              formButtonPrimary:
                "bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white shadow-lg hover:shadow-xl transition-all duration-200",
              footerActionLink:
                "text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300",
              formFieldInput:
                "border-gray-200 dark:border-gray-600 focus:border-primary-500 dark:focus:border-primary-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white",
              formFieldLabel: "text-gray-700 dark:text-gray-300",
              identityPreviewText: "text-gray-600 dark:text-gray-400",
              formHeaderTitle:
                "text-xl font-semibold text-gray-900 dark:text-white",
              formHeaderSubtitle: "text-gray-600 dark:text-gray-300",
            },
            variables: {
              colorPrimary: "#3b82f6",
              colorBackground: "transparent",
              borderRadius: "0.75rem",
            },
          }}
        />
      </div>
    </div>
  );
}
