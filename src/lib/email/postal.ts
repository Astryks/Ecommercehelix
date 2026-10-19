/**
 * Postal address for the footer of every marketing email.
 * CAN-SPAM requires a valid physical postal address (a street address, or a PO box or private mailbox
 * registered with the postal service) in commercial emails to US recipients:
 * https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business
 *
 * Read from BUSINESS_POSTAL_ADDRESS (one line, or new lines that are joined with commas).
 * When it is not set, nothing is shown (we never invent an address) and a warning is logged once per process.
 */
let warned = false;

export function postalAddress(env: Record<string, string | undefined> = process.env): string | null {
  const v = (env.BUSINESS_POSTAL_ADDRESS ?? "").split(/\r?\n|\\n/).map((l) => l.trim()).filter(Boolean).join(", ");
  if (v) return v;
  if (!warned) {
    warned = true;
    console.warn("[email] BUSINESS_POSTAL_ADDRESS is not set, so marketing emails are sent without a postal address. CAN-SPAM requires one for US recipients: set it in Vercel to a street address or PO box (see README).");
  }
  return null;
}
