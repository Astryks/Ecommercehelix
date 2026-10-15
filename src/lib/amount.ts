/** Read a typed money or number value. Pure and client-safe. */
/** "$60", "1,75" or "1,234.50" to a number; blank or not a number gives null (left unchanged). */
export const readAmount = (v: unknown): number | null => {
  let t = String(v ?? "").trim().replace(/[$\s]/g, "");
  if (/^\d+,\d{1,2}$/.test(t)) t = t.replace(",", "."); // decimal comma, e.g. 1,75
  t = t.replace(/,/g, "");
  if (!/^-?\d*\.?\d+$/.test(t)) return null;
  return Number(t);
};
