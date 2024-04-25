"use server";

type Payment = {
  id: string;
  amount: number;
  status: "pending" | "processing" | "success" | "failed";
  email: string;
};

const payments: Payment[] = [
  {
    id: "728ed52f",
    amount: 100,
    status: "pending",
    email: "m@example.com",
  },
  {
    id: "489e1d42",
    amount: 125,
    status: "processing",
    email: "example@gmail.com",
  },
  {
    id: "728ed52f",
    amount: 101,
    status: "pending",
    email: "m@example.com",
  },
  {
    id: "489e1d42",
    amount: 126,
    status: "processing",
    email: "example@gmail.com",
  },
  {
    id: "728ed52f",
    amount: 102,
    status: "pending",
    email: "m@example.com",
  },
  {
    id: "489e1d42",
    amount: 127,
    status: "processing",
    email: "example@gmail.com",
  },
  {
    id: "728ed52f",
    amount: 103,
    status: "pending",
    email: "m@example.com",
  },
  {
    id: "489e1d42",
    amount: 128,
    status: "processing",
    email: "example@gmail.com",
  },
  {
    id: "728ed52f",
    amount: 104,
    status: "pending",
    email: "m@example.com",
  },
  {
    id: "489e1d42",
    amount: 129,
    status: "processing",
    email: "example@gmail.com",
  },
  {
    id: "728ed52f",
    amount: 105,
    status: "pending",
    email: "m@example.com",
  },
  {
    id: "489e1d42",
    amount: 130,
    status: "processing",
    email: "example@gmail.com",
  },
  {
    id: "728ed52f",
    amount: 100,
    status: "pending",
    email: "m@example.com",
  },
  {
    id: "489e1d42",
    amount: 125,
    status: "processing",
    email: "example@gmail.com",
  },
  {
    id: "728ed52f",
    amount: 100,
    status: "pending",
    email: "m@example.com",
  },
  {
    id: "489e1d42",
    amount: 125,
    status: "processing",
    email: "example@gmail.com",
  },
  {
    id: "728ed52f",
    amount: 100,
    status: "pending",
    email: "m@example.com",
  },
  {
    id: "489e1d42",
    amount: 125,
    status: "processing",
    email: "example@gmail.com",
  },
];

export async function getData() {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return payments;
}
