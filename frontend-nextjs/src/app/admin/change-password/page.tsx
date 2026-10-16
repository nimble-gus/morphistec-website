import { requireUser } from "@/lib/crm/auth";
import ChangePassword from "./change-password";
export default async function Page() {
  const user = await requireUser(true);
  return <ChangePassword firstLogin={user.must_change_password} />;
}
