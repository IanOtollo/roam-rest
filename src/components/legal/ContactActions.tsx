import { Mail, Phone } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/WhatsAppButton";
import { brand } from "@/lib/property";

/**
 * Ready-to-use ways to reach the host from a document: WhatsApp (opens a chat with a
 * prefilled message), email (address shown underlined, subject prefilled) and a call button.
 */
export function ContactActions({ topic }: { topic: string }) {
  const whatsapp = `https://wa.me/${brand.whatsapp}?text=${encodeURIComponent(`Hello! I have a question about your ${topic}.`)}`;
  const mail = brand.email ? `mailto:${brand.email}?subject=${encodeURIComponent(topic)}` : null;
  const base =
    "inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm transition-colors active:scale-[0.98]";

  return (
    <div className="mt-5 flex flex-wrap gap-3 not-prose">
      <a
        href={whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className={`${base} bg-primary font-medium text-primary-foreground hover:opacity-90`}
      >
        <WhatsAppIcon className="h-4 w-4" /> Message on WhatsApp
      </a>
      {mail && (
        <a href={mail} className={`${base} border border-border bg-card hover:bg-muted`}>
          <Mail className="h-4 w-4" />
          <span className="underline underline-offset-4">{brand.email}</span>
        </a>
      )}
      <a href={`tel:${brand.phoneLink}`} className={`${base} border border-border bg-card hover:bg-muted`}>
        <Phone className="h-4 w-4" /> Call {brand.phone}
      </a>
    </div>
  );
}