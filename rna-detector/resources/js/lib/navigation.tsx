import { usePage } from "@inertiajs/react";
import {
  Database,
  FolderCog,
  Home,
  icons,
  LucideIcon,
  ServerCog,
} from "lucide-react";
import { useMemo } from "react";

export type NavigationSubItem = {
  title: string;
  url: string;
  exact?: boolean;
  visible?: boolean;
};

export type NavigationItemBase = NavigationSubItem & {
  icon?: LucideIcon;
};

export type NavigationItem = NavigationItemBase & {
  items?: NavigationSubItem[];
};

export type NavigationContent = {
  main: NavigationItem[];
  secondary: NavigationItemBase[];
};

export function isSubItemActive(subItem: NavigationSubItem, url: string) {
  if (subItem.exact && subItem.url === url) return true;
  return !subItem.exact && url.startsWith(subItem.url);
}

export function isActive(
  item: NavigationItemBase | NavigationItem,
  url: string,
) {
  if (item.exact && item.url === url) return true;
  if (!item.exact && url.startsWith(item.url)) return true;
  const navItem = item as NavigationItem;
  if (navItem.items)
    return navItem.items.some((subItem) => isSubItemActive(subItem, url));
  return false;
}

const navigation: NavigationContent = {
  main: [
    {
      title: "Dashboard",
      url: route("dashboard", undefined, false),
      icon: Home,
      exact: true,
    },
    {
      title: "Datasets",
      url: "/datasets",
      icon: Database,
    },
    {
      title: "Analyses",
      url: "/analyses",
      icon: FolderCog,
      items: [],
    },
    {
      title: "Jobs",
      url: "/jobs",
      icon: ServerCog,
    },
  ],
  secondary: [],
};

function changeIconField<
  T extends { icon?: string },
  U extends T & { icon?: LucideIcon },
>(item: T): U {
  const { icon, ...rest } = item;
  return {
    ...rest,
    icon: icon ? icons[icon as keyof typeof icons] : undefined,
  } as U;
}

export function useNavigationContent(): NavigationContent {
  const {
    props: { navigation: appNav },
  } = usePage();
  return useMemo(() => {
    if (!appNav) return navigation;
    const { main, secondary, analyses } = appNav;
    return {
      main: [
        ...navigation.main.map((item) => {
          if (item.title === "Analyses" && analyses) {
            return {
              ...item,
              items: analyses.map((analysis) => ({
                title: analysis.title,
                url: analysis.url,
                exact: analysis.exact,
              })),
            };
          }
          return item;
        }),
        ...(main || []).map((item) => {
          const tmp = changeIconField(item);
          if (tmp.items) {
            tmp.items = tmp.items.map(changeIconField);
          }
          return tmp;
        }),
      ],
      secondary: [
        ...navigation.secondary,
        ...(secondary || []).map(changeIconField),
      ],
    };
  }, [appNav]);
}
