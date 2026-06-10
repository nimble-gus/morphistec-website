import { WHATSAPP_URL } from "@/lib/contact";

type WhatsAppButtonProps = {
  children: React.ReactNode;
  className?: string;
  showArrow?: boolean;
};

export function WhatsAppButton({
  children,
  className = "ok-btn ok-btn-primary",
  showArrow = true,
}: WhatsAppButtonProps) {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
      {showArrow ? <span className="font-mono">→</span> : null}
    </a>
  );
}
