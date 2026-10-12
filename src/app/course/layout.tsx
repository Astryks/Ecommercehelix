import DashboardLayout from "../dashboard/layout";

export const dynamic = "force-dynamic";

export default function CourseLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout params={Promise.resolve({})}>{children}</DashboardLayout>;
}
