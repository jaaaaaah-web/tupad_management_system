import { auth } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }) {
  const session = await auth();

  if (!session) {
    redirect("/login"); // Redirect if not logged in
  }

  return <>{children}</>;
}
