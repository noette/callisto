import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { parse } from "node-html-parser";

export const config = {
  isr: {
    expiration: 60 * 60,
  },
};

const TERM = "202508";

export const GET: RequestHandler = async ({ url }) => {
  const code = url.searchParams.get("code");

  if (!code) {
    error(400, "No course code provided");
  }

  const resp = await fetch(
    `https://app.testudo.umd.edu/soc/${TERM}/sections?courseIds=${code}`,
  );
  const html = parse(await resp.text());

  let ret: {
    [id: string]: { seats: number; open_seats: number; waitlist: number };
  } = {};
  const divs = html.querySelectorAll(`#${code} .section`);
  for (const div of divs) {
    const id = div.querySelector(".section-id")!.innerText.trim();
    const seats = {
      seats: parseInt(
        div.querySelector(".total-seats-count")!.innerText.trim(),
      ),
      open_seats: parseInt(
        div.querySelector(".open-seats-count")!.innerText.trim(),
      ),
      waitlist: parseInt(
        div.querySelector(".waitlist-count")!.innerText.trim(),
      ),
    };
    ret[id] = seats;
  }

  return json(ret);
};
