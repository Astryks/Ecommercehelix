import { requireUser } from "@/lib/session";
import { ContactForm } from "@/components/ContactForm";
import { sendContact } from "@/app/contact/actions";

export default async function DashboardContact({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const u = await requireUser("/dashboard/contact");
  const sp = await searchParams;
  const topic = typeof sp.topic === "string" ? sp.topic : "";
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="page-title">Contact us</h1>
      <p className="page-lead">Send the Helix team a message. We include your account details so we can help faster. A real person replies, usually within one business day.</p>
      <div className="relative mt-6"><ContactForm action={sendContact} name={u.name} email={u.email} topic={topic} /></div>
    </div>
  );
}
