import { hasDb } from "@/lib/db";
import { stripe } from "@/lib/stripe";

export function DemoBanner() {
  if (hasDb && stripe) return null;
  const missing = [!hasDb && "database (in-memory, resets on restart)", !stripe && "Stripe (plan changes apply instantly)"].filter(Boolean).join(" · ");
  return (
    <div className="bg-amber-100 px-4 py-1.5 text-center text-xs font-medium text-amber-900" role="status">
      Demo mode: {missing}. Add keys from .env.example to go live.
    </div>
  );
}
