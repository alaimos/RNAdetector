import { FetchDataFunctionState } from "@/components/ui/data-table/remote-data-table";
import { useRef } from "react";

export type PayloadData =
  | Array<PayloadData>
  | {
      [key: string]: PayloadData;
    }
  | number
  | string;
export type TableStatePayload = Record<string, PayloadData>;

export function convertToPayload(state: FetchDataFunctionState) {
  const payload = {
    page: state.pagination.pageIndex + 1,
    per_page: state.pagination.pageSize,
  } as TableStatePayload;
  if (state.globalFilter) {
    payload.global_filter = state.globalFilter;
  }
  if (state.sorting && state.sorting.length) {
    payload.sorting = state.sorting.reduce(
      (acc, sort) => {
        acc[sort.id] = sort.desc ? "desc" : "asc";
        return acc;
      },
      {} as Record<string, string>,
    );
  }
  if (state.columnFilters && state.columnFilters.length) {
    payload.column_filters = state.columnFilters.reduce(
      (acc, filter) => {
        const value = (
          Array.isArray(filter.value)
            ? filter.value.map(String)
            : [String(filter.value)]
        ).filter((value) => !!value);
        if (value.length === 1) {
          acc[filter.id] = value[0];
        } else if (value.length > 1) {
          acc[filter.id] = value;
        }
        return acc;
      },
      {} as Record<string, string | string[]>,
    );
  }
  return payload;
}

export function convertFromPayload(
  payload?: TableStatePayload,
): FetchDataFunctionState | undefined {
  if (!payload) return undefined;
  const state: FetchDataFunctionState = {
    pagination: {
      pageIndex: +(payload.page ?? 0) - 1,
      pageSize: +(payload.per_page ?? 10),
    },
    sorting: [],
    columnFilters: [],
    globalFilter: String(payload.global_filter ?? ""),
  };
  if (payload.sorting) {
    state.sorting = Object.entries(payload.sorting).map(([id, direction]) => ({
      id,
      desc: direction === "desc",
    }));
  }
  if (payload.column_filters) {
    state.columnFilters = Object.entries(payload.column_filters).map(
      ([id, value]) => ({
        id,
        value: Array.isArray(value) ? value : [value],
      }),
    );
  }
  return state;
}

export function useTableStateFromPayload(
  payload: TableStatePayload | undefined,
) {
  const payloadRef = useRef(convertFromPayload(payload));
  return payloadRef.current;
}
