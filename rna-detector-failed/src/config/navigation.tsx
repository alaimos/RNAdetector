import { ReactNode } from "react";
import { Database, Home, LucideIcon } from "lucide-react";
import { DatasetList, HomePage } from "@/routes";
import { RouteBuilder } from "@/routes/makeRoute";

export type NavigationItem =
  | {
      key: string;
      href: string;
      icon: LucideIcon;
      label: ReactNode;
      exact?: boolean;
    }
  | {
      key: string;
      component: RouteBuilder<any, any>;
      icon: LucideIcon;
      label: ReactNode;
      exact?: boolean;
    };

const navigation: NavigationItem[] = [
  {
    key: "dashboard",
    component: HomePage,
    icon: Home,
    label: "Dashboard",
    exact: true,
  },
  {
    key: "datasets",
    component: DatasetList,
    icon: Database,
    label: "Datasets",
  },
];

export default navigation;
