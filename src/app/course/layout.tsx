import DashboardLayout from "../dashboard/layout";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function CourseLayout({ children }: { children: React.ReactNode }) {
  await requireUser("/course");
  return <DashboardLayout params={Promise.resolve({})}>{children}</DashboardLayout>;
}
