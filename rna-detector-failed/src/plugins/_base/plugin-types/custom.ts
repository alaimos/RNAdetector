import { ArrayPath as RHArrayPath, Path as RHPath } from "react-hook-form";

export type Path<T> = RHPath<T> | RHArrayPath<T>;

export type FirstElement<T> = T extends any[] ? T[0] : never;
