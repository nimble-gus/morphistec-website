"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useLang } from "@/components/lang";
import { Calendar } from "@/components/ui/calendar";

type BookCallModalProps = {
  triggerLabel: string;
};

const TIME_SLOTS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
];

function formatTimeLabel(time24: string) {
  const [hRaw, m] = time24.split(":");
  const h = Number(hRaw);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m} ${period}`;
}

export function BookCallModal({ triggerLabel }: BookCallModalProps) {
  const { t } = useLang();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const today = useMemo(() => new Date(), []);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(today);
  const [selectedTime, setSelectedTime] = useState("");
  const [takenSlots, setTakenSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const date = selectedDate
      ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(
          selectedDate.getDate()
        ).padStart(2, "0")}`
      : "";

    if (!date) {
      setTakenSlots([]);
      return;
    }

    let cancelled = false;
    async function loadSlots() {
      setLoadingSlots(true);
      try {
        const res = await fetch(`/api/book-call?date=${date}`);
        const data = (await res.json()) as { takenSlots?: string[] };
        if (!cancelled) {
          const slots = data.takenSlots ?? [];
          setTakenSlots(slots);
          if (selectedTime && slots.includes(selectedTime)) setSelectedTime("");
        }
      } catch {
        if (!cancelled) setTakenSlots([]);
      } finally {
        if (!cancelled) setLoadingSlots(false);
      }
    }
    loadSlots();

    return () => {
      cancelled = true;
    };
  }, [selectedDate]);

  function handleDateSelect(date: Date | undefined) {
    setSelectedDate(date);
    if (date) setIsCalendarOpen(false);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFeedback(null);
    setLoading(true);

    const payloadDate = selectedDate
      ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(
          selectedDate.getDate()
        ).padStart(2, "0")}`
      : "";

    if (!selectedTime) {
      setFeedback(t.book_modal_pick_time_error);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/book-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          company,
          phone,
          email,
          date: payloadDate,
          time: selectedTime,
          website: "",
        }),
      });

      const json = (await res.json()) as { message?: string };

      if (!res.ok) {
        setFeedback(json.message ?? t.book_modal_server_error);
        return;
      }

      setFeedback(t.book_modal_success);
      setName("");
      setCompany("");
      setPhone("");
      setEmail("");
      setSelectedDate(today);
      setSelectedTime("");
      setIsCalendarOpen(true);
    } catch {
      setFeedback(t.book_modal_network_error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button type="button" className="ok-btn ok-btn-primary" onClick={() => setOpen(true)}>
        {triggerLabel} <span className="font-mono">→</span>
      </button>

      {mounted &&
        open &&
        createPortal(
        <div className="fixed inset-0 z-[120] bg-black/75 p-3 sm:p-4">
          <div className="mx-auto flex h-full w-full max-w-md items-center justify-center">
            <div className="max-h-[92dvh] w-full overflow-y-auto rounded-2xl border border-ok-line-2 bg-ok-card p-4 shadow-[0_20px_80px_-20px_rgba(0,0,0,0.8)] sm:p-6">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold text-ok-text">{t.book_modal_title}</h3>
                <p className="mt-1 text-sm text-ok-mute">
                  {t.book_modal_subtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="shrink-0 rounded-full border border-ok-line px-2.5 py-1 text-[11px] text-ok-mute hover:text-ok-text sm:text-xs"
                aria-label="Cerrar modal"
              >
                {t.book_modal_close}
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-ok-dim">
                  {t.book_modal_date}
                </label>
                {!isCalendarOpen && (
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-ok-line-2 bg-black/30 px-3 py-2.5">
                    <span className="text-sm text-ok-text">
                      {selectedDate
                        ? selectedDate.toLocaleDateString()
                        : t.book_modal_no_date}
                    </span>
                    <button
                      type="button"
                      className="rounded-full border border-ok-line px-3 py-1 text-[11px] text-ok-mute hover:text-ok-text sm:text-xs"
                      onClick={() => setIsCalendarOpen(true)}
                    >
                      {t.book_modal_change_date}
                    </button>
                  </div>
                )}

                {isCalendarOpen && (
                  <div className="overflow-x-auto rounded-xl border border-ok-line-2 bg-black/30 p-2">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      defaultMonth={selectedDate ?? today}
                      disabled={(date) =>
                        date < new Date(today.getFullYear(), today.getMonth(), today.getDate())
                      }
                      className="text-ok-text"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-ok-dim">
                  {t.book_modal_time}
                </label>
                <p className="mb-2 text-xs text-ok-mute">{t.book_modal_time_help}</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {TIME_SLOTS.map((slot) => {
                    const taken = takenSlots.includes(slot);
                    const active = selectedTime === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={taken || loadingSlots}
                        onClick={() => setSelectedTime(slot)}
                        className="rounded-lg border px-2 py-2 text-[11px] transition disabled:cursor-not-allowed disabled:opacity-50 sm:text-xs"
                        style={{
                          borderColor: active ? "var(--ok-neon)" : "rgba(255,255,255,0.14)",
                          background: active ? "oklch(0.55 0.2 265 / 0.12)" : "rgba(0,0,0,0.2)",
                          color: active ? "var(--ok-neon)" : "#ededed",
                        }}
                      >
                        {taken ? `${formatTimeLabel(slot)} · ${t.book_modal_time_taken}` : formatTimeLabel(slot)}
                      </button>
                    );
                  })}
                </div>
                {!selectedTime && <p className="mt-2 text-xs text-ok-mute">{t.book_modal_no_time}</p>}
              </div>

              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-ok-dim">
                  {t.book_modal_name}
                </label>
                <input
                  required
                  type="text"
                  maxLength={80}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-ok-line-2 bg-black/30 px-3 py-2.5 text-ok-text outline-none focus:border-ok-neon"
                  placeholder={t.book_modal_name_placeholder}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-ok-dim">
                  {t.book_modal_company}
                </label>
                <input
                  required
                  type="text"
                  maxLength={100}
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full rounded-xl border border-ok-line-2 bg-black/30 px-3 py-2.5 text-ok-text outline-none focus:border-ok-neon"
                  placeholder={t.book_modal_company_placeholder}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-ok-dim">
                  {t.book_modal_phone}
                </label>
                <input
                  required
                  type="tel"
                  maxLength={25}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-ok-line-2 bg-black/30 px-3 py-2.5 text-ok-text outline-none focus:border-ok-neon"
                  placeholder={t.book_modal_phone_placeholder}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-ok-dim">
                  {t.book_modal_email}
                </label>
                <input
                  required
                  type="email"
                  maxLength={120}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-ok-line-2 bg-black/30 px-3 py-2.5 text-ok-text outline-none focus:border-ok-neon"
                  placeholder={t.book_modal_email_placeholder}
                />
              </div>

              <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />

              <button
                type="submit"
                disabled={loading}
                className="ok-btn ok-btn-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? t.book_modal_sending : t.book_modal_submit}
              </button>
            </form>

            {feedback && <p className="mt-3 text-sm text-ok-mute">{feedback}</p>}
          </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
