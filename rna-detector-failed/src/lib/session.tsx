"use client";
import { createContext, ReactNode, use } from "react";
import { User } from "@prisma/client";

const currentUserContext = createContext<User | null>(null);

const CurrentUserProvider = ({
  user,
  children,
}: {
  user?: User | null;
  children: ReactNode;
}) => {
  return (
    <currentUserContext.Provider value={user ?? null}>
      {children}
    </currentUserContext.Provider>
  );
};
CurrentUserProvider.displayName = "CurrentUserProvider";

const useCurrentUser = () => {
  return use(currentUserContext);
};

export { currentUserContext, useCurrentUser, CurrentUserProvider };
