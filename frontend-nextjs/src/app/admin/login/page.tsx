import { session } from "@/lib/crm/auth";
import { redirect } from "next/navigation";
import Login from "./login";
export default async function LoginPage() {
  if (await session()) redirect("/admin");
  return <Login />;
}
