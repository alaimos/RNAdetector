export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string;
  avatar: string;
}

type NavItem = {
  title: string;
  url: string;
  icon?: string;
  exact?: boolean;
};

type NavItemWithSubItems = NavItem & {
  items?: NavItem[];
};

export type PageProps<
  T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
  auth: {
    enabled: boolean;
    user: User;
  };
  navigation?: {
    main?: NavItemWithSubItems[];
    secondary?: NavItem[];
    analyses?: NavItem[];
  };
};
