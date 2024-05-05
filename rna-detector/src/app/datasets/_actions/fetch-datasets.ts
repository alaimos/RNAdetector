"use server";
import db from "@/db/db";
import { getCurrentUserServer } from "@/lib/utils";
import { JobStatus } from "@prisma/client";
import { FetchDataFunctionState } from "@/components/ui/data-table/remote-data-table";

type QueryArgs = Parameters<typeof db.dataset.findMany>[0];

export async function fetchDatasets(state: FetchDataFunctionState<any>) {
  const AND = [];
  if (state.globalFilter && state.globalFilter.trim().length > 0) {
    AND.push({
      name: {
        contains: state.globalFilter.trim(),
      },
    });
  }
  if (state.columnFilters && state.columnFilters.length > 0) {
    for (const filter of state.columnFilters) {
      let value = filter.value;
      if (!value) continue;
      if (filter.id === "tags") {
        const tags = (value as string[])
          .map((t) => t.trim())
          .filter((t) => t.length > 0);
        if (tags.length === 0) continue;
        value = {
          some: {
            tag: {
              name: {
                in: tags,
              },
            },
          },
        };
      }
      AND.push({
        [filter.id]: value,
      });
    }
  }
  const args: QueryArgs = {
    where: {
      AND: [
        {
          OR: [
            { public: true },
            { createdBy: (await getCurrentUserServer())?.id },
          ],
        },
        ...AND,
      ],
    },
    orderBy: {
      name: "asc",
    },
  };
  if (state.sorting && state.sorting.length > 0) {
    args.orderBy = state.sorting.map((s) => {
      if (s.id === "tags" || s.id === "count" || s.id === "_count") {
        return {
          tags: {
            _count: s.desc ? "desc" : "asc",
          },
        };
      }
      return {
        [s.id]: s.desc ? "desc" : "asc",
      };
    });
  }
  if (state.pagination.pageSize && state.pagination.pageIndex != null) {
    args.skip = state.pagination.pageIndex * state.pagination.pageSize;
    args.take = state.pagination.pageSize;
  }
  const rowCount = await db.dataset.count({
    where: args.where,
  });
  const dbData = await db.dataset.findMany({
    ...args,
    select: {
      id: true,
      name: true,
      tags: {
        select: {
          tag: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      data: {
        select: {
          status: true,
        },
      },
      _count: {
        select: { data: true },
      },
    },
  });
  const data = dbData.map((dataset) => ({
    ...dataset,
    data: Object.entries(Object.groupBy(dataset.data, (d) => d.status)).reduce(
      (acc, [status, data]) => {
        acc[status as JobStatus] = data.length;
        return acc;
      },
      {} as Record<JobStatus, number>,
    ),
  }));
  return { data, rowCount };
}
