"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface BackButtonProps {
  href?: string;
  label?: string;
  variant?: "ghost" | "outline" | "default";
  useRouterBack?: boolean;
  className?: string;
}

export default function BackButton({
  href = "/dashboard",
  label = "Volver",
  variant = "ghost",
  useRouterBack = false,
  className = "",
}: Readonly<BackButtonProps>) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    if (useRouterBack) {
      e.preventDefault();
      router.back();
    }
  };

  const buttonClasses = `
    cursor-pointer
    group
    mb-4 sm:mb-6
    border
    border-border
    hover:border-primary/40
    dark:border-border/50
    dark:hover:border-primary/50
    bg-card
    hover:bg-accent/50
    dark:bg-card/50
    dark:hover:bg-accent/60
    backdrop-blur-sm
    shadow-sm
    hover:shadow
    transition-all 
    duration-200 
    hover:-translate-x-1
    active:scale-[0.98]
    ${className}
  `.trim();

  const content = (
    <Button variant={variant} className={buttonClasses} onClick={handleClick}>
      <ArrowLeft className="w-4 h-4 mr-2 text-muted-foreground group-hover:text-primary transition-all group-hover:-translate-x-0.5" />
      <span className="text-sm sm:text-base font-medium text-foreground">
        {label}
      </span>
    </Button>
  );

  if (useRouterBack) {
    return <div className="inline-block">{content}</div>;
  }

  return <Link href={href}>{content}</Link>;
}
