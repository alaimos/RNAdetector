"use client";
import Image from "next/image";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { type ClassValue } from "clsx";
import { HomePage } from "@/routes";

export default function NoSSRLogo({ className }: { className?: ClassValue }) {
  const { resolvedTheme } = useTheme();
  return (
    <HomePage.Link
      className={cn("flex items-center gap-2 font-semibold", className)}
    >
      {resolvedTheme === "light" ? (
        <Image
          src="/images/logo-light.png"
          alt="RNAdetector"
          width={157}
          height={24}
          priority
        />
      ) : (
        <Image
          src="/images/logo-dark.png"
          alt="RNAdetector"
          width={157}
          height={24}
          priority
        />
      )}
      <span className="sr-only">RNAdetector</span>
    </HomePage.Link>
  );
}
