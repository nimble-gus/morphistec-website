import { requireUser } from "@/lib/crm/auth";
import Crm from "./crm";
export default async function Admin() {
  const user = await requireUser();
  return (
    <Crm
      email={user.email}
      paymentReady={Boolean(process.env.RECURRENTE_SECRET_KEY)}
      webhookReady={Boolean(process.env.RECURRENTE_WEBHOOK_SECRET)}
      environment={
        process.env.RECURRENTE_SECRET_KEY?.startsWith("sk_test_")
          ? "test"
          : "live"
      }
    />
  );
}
