import { ReactNode } from "react";
import { Home, LucideIcon } from "lucide-react";
import { ReactComponentLike } from "prop-types";
import { HomePage } from "@/routes";

export type NavigationItem =
  | {
      key: string;
      href: string;
      icon: LucideIcon;
      label: ReactNode;
    }
  | {
      key: string;
      component: ReactComponentLike;
      icon: LucideIcon;
      label: ReactNode;
    };

const navigation: NavigationItem[] = [
  {
    key: "dashboard",
    component: HomePage.Link,
    icon: Home,
    label: "Dashboard",
  },
];

export default navigation;
