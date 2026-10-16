import { session } from "@/lib/crm/auth";
import { redirect } from "next/navigation";
import Login from "./login";
export default async function LoginPage() {
  const user = await session();
  if (user)
    redirect(user.must_change_password ? "/admin/change-password" : "/admin");
  return <Login />;
}
