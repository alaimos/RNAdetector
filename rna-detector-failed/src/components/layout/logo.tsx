"use client";
import { type ClassValue } from "clsx";
import dynamic from "next/dynamic";
import { HomePage } from "@/routes";

const NoSSRLogo = dynamic(() => import("./no-ssr-logo"), {
  ssr: false,
  loading: () => (
    <HomePage.Link className="flex items-center gap-2 font-semibold">
      <span className="">RNAdetector</span>
    </HomePage.Link>
  ),
});

export function Logo({ className }: { className?: ClassValue }) {
  return <NoSSRLogo className={className} />;
}
