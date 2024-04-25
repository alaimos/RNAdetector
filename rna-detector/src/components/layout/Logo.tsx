"use client";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { type ClassValue } from "clsx";
import { useEffect, useState } from "react";

export function Logo({ className }: { className?: ClassValue }) {
  const [isFirstRender, setIsFirstRender] = useState(true);
  const { resolvedTheme } = useTheme();
  useEffect(() => {
    setIsFirstRender(false);
  }, []);
  if (isFirstRender) return null;
  return (
    <Link
      href="/"
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
    </Link>
  );
}
