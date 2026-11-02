import { describe, expect, it } from "vitest";

import { cleanQtyInput, formatQty, lineAmount, parseQty, roundQty } from "./estimate-store";

describe("estimate bill quantity", () => {
  it("accepts decimal quantities like 0.500, 0.5, 1.25 and 2.750", () => {
    expect(parseQty("0.500")).toBe(0.5);
    expect(parseQty("0.5")).toBe(0.5);
    expect(parseQty("1.25")).toBe(1.25);
    expect(parseQty("2.750")).toBe(2.75);
  });

  it("lets the default 1 be deleted and 0 be typed while typing", () => {
    expect(cleanQtyInput("")).toBe("");
    expect(cleanQtyInput("0")).toBe("0");
    expect(cleanQtyInput("0.")).toBe("0.");
    expect(cleanQtyInput("0.5")).toBe("0.5");
  });

  it("treats an empty quantity as 0, not NaN", () => {
    expect(parseQty("")).toBe(0);
    expect(lineAmount(parseQty(""), 250)).toBe(0);
  });

  it("keeps at most 3 decimals in the quantity", () => {
    expect(cleanQtyInput("1.23456")).toBe("1.234");
    expect(roundQty(0.1 + 0.2)).toBe(0.3);
  });

  it("rounds the line amount to 2 decimals without float noise", () => {
    expect(lineAmount(0.5, 1250)).toBe(625);
    expect(lineAmount(1.25, 99.99)).toBe(124.99);
    expect(lineAmount(0.1, 3)).toBe(0.3);
  });

  it("+ / − buttons work with decimal quantities", () => {
    expect(roundQty(0.5 + 1)).toBe(1.5);
    expect(roundQty(Math.max(0, 0.5 - 1))).toBe(0);
    expect(formatQty(2.75)).toBe("2.75");
  });
});
