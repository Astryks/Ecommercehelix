import { describe, expect, it } from "vitest";
import { COUNTRIES, countryName, regionOf, toCountry, upcomingEvents, mothersDay } from "@/lib/seasons";
import { taxLabel, taxNeedsChoice, taxRate } from "@/lib/tax";
import { adminDates } from "@/lib/business";

describe("countries", () => {
  it("keeps any valid code", () => {
    expect(toCountry("DE")).toBe("DE");
    expect(toCountry("uk")).toBe("GB");
    expect(toCountry("US")).toBe("US");
    expect(toCountry("ZZ")).toBe("AU");
    expect(COUNTRIES.length).toBeGreaterThan(200);
    expect(countryName("NZ")).toBe("New Zealand");
    expect(regionOf("FR")).toBe("GLOBAL");
  });
  it("gives other countries the worldwide date set", () => {
    const names = upcomingEvents("2026-10-13", "DE", 365).map((e) => e.name);
    expect(names).toContain("Black Friday");
    expect(names).toContain("Cyber Monday");
    expect(names).not.toContain("Click Frenzy");
    expect(names).not.toContain("Thanksgiving");
  });
  it("moves Mother's Day by country", () => {
    expect(mothersDay("GB", 2027)).toBe("2027-03-07");
    expect(mothersDay("DE", 2027)).toBe("2027-05-09");
    expect(mothersDay("KE", 2027)).toBeNull();
  });
  it("has no tax-date list outside AU and US", () => {
    expect(adminDates("2026-10-13", "DE")).toEqual([]);
    expect(adminDates("2026-10-13", "AU").length).toBeGreaterThan(0);
  });
});

describe("tax defaults", () => {
  it("uses the country rate on auto", () => {
    expect(taxRate("auto", "NZ")).toBe(0.15);
    expect(taxRate("auto", "GB")).toBe(0.2);
    expect(taxLabel("auto", "DE")).toBe("VAT (19%)");
    expect(taxRate("auto", "CA")).toBe(0);
    expect(taxRate("auto", "KE")).toBe(0);
    expect(taxNeedsChoice("auto", "KE")).toBe(true);
    expect(taxNeedsChoice("auto", "US")).toBe(false);
  });
});
