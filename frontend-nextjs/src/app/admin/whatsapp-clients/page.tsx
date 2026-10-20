import { requireUser } from "@/lib/crm/auth";
import Clients from "./clients";
import "./clients.css";
export default async function Page() {
  const user = await requireUser();
  return <Clients email={user.email} />;
}
