"use client";

import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { type ClassValue } from "clsx";

export function Logo({ className }: { className?: ClassValue }) {
  const { resolvedTheme } = useTheme();
  return (
    <Link
      href="/"
      className={cn("flex items-center gap-2 font-semibold", className)}
    >
      <Image
        src={`/images/logo-${resolvedTheme === "dark" ? "dark" : "light"}.png`}
        alt="RNAdetector"
        width={157}
        height={24}
      />
      <span className="sr-only">RNAdetector</span>
    </Link>
  );
}
