import { useTheme } from "@/Layouts/components/theme-provider";
import { Link } from "@inertiajs/react";
import { ComponentProps, useMemo } from "react";

type LogoProps = Omit<ComponentProps<typeof Link>, "href">;

export default function Logo(props: LogoProps) {
  const { resolvedTheme } = useTheme();
  const image = useMemo(() => {
    return resolvedTheme === "dark"
      ? "/images/logo-dark.png"
      : "/images/logo-light.png";
  }, [resolvedTheme]);
  return (
    <Link {...props} href="/">
      <img src={image} alt="RNAdetector" className="h-6" />
      <span className="sr-only">RNAdetector</span>
    </Link>
  );
}
