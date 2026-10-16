import type { Metadata } from "next";
import "./admin.css";
export const metadata: Metadata = {
  title: "Oktae · CRM privado",
  robots: { index: false, follow: false, nocache: true },
  alternates: { canonical: null },
};
export const dynamic = "force-dynamic";
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="ok-admin">{children}</div>;
}
