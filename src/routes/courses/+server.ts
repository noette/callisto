import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { parse } from "node-html-parser";
import type { SeatsInfo } from "$lib/scheduler";

export const config = {
  isr: {
    expiration: 60 * 60,
    allowQuery: ["code"],
  },
};

const TERM = "202601";

export const GET: RequestHandler = async ({ url }) => {
  const department = url.searchParams.get("department");

  if (!department) {
    error(400, "No course code provided");
  }
};
