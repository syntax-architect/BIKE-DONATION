"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  Copy,
  Flame,
  Loader2,
  Lock,
  PartyPopper,
  QrCode,
  Smartphone,
  Sparkles,
  X,
} from "lucide-react";
import {
  TIERS,
  UPI_PAYEE_NAME,
  UPI_VPA,
  ZONES,
  ZONE_MAP,
  formatINR,
  wrapAreaCm2,
  zoneForAmount,
  type ZoneId,
} from "@/lib/tvs/constants";
import { IDENTITY_LINE, ZONE_ANCHOR } from "@/lib/tvs/psych";
import { useClaimStore } from "@/lib/tvs/store";
import { burstConfetti } from "@/lib/tvs/confetti";
import type { ClaimResponse } from "@/lib/tvs/types";

type Step = 1 | 2 | 3 | 4;

const STEP_LABELS = ["Details", "Pay", "Verify", "Done"] as const;

export function ClaimModal({ onClaimed }: { onClaimed: () => void }) {
  const {
    open,
    zoneId: storeZone,
    amount: storeAmount,
    closeClaim,
    setPreviewName,
    setClaimedCode,
  } = useClaimStore();

  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [zone, setZoneLocal] = useState<ZoneId>("TANK");
  const [tierAmount, setTierAmount] = useState<number>(100);
  const [customOn, setCustomOn] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const [txId, setTxId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ClaimResponse | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const amount = customOn
    ? Math.max(0, Math.round(Number(customValue) || 0))
    : tierAmount;

  // effective zone: auto-remap if the amount no longer covers the picked zone
  const effZone: ZoneId = useMemo(() => {
    const picked = ZONE_MAP[zone];
    if (amount >= picked.price) return zone;
    return zoneForAmount(Math.max(10, amount));
  }, [zone, amount]);

  const remapped = effZone !== zone;

  // seed the sheet whenever it opens
  useEffect(() => {
    if (!open) return;
    setStep(1);
    setError(null);
    setResult(null);
    setTxId("");
    setCopied(null);
    if (storeZone) {
      setZoneLocal(storeZone);
      const t = TIERS.find((x) => x.zone === storeZone);
      if (storeAmount != null) {
        setTierAmount(storeAmount);
        setCustomOn(storeAmount < Math.max(...TIERS.map((x) => x.amount)) && !TIERS.some((x) => x.amount === storeAmount));
      } else if (t) {
        setTierAmount(t.amount);
        setCustomOn(false);
      }
    } else if (storeAmount != null) {
      setTierAmount(storeAmount);
      setZoneLocal(zoneForAmount(storeAmount));
    }
     
  }, [open, storeZone, storeAmount]);

  const upiNote = `Slot-${name.trim().replace(/\s+/g, "_").slice(0, 25) || "Rider"}`;
  const upiLink = useMemo(() => {
    const params = new URLSearchParams({
      pa: UPI_VPA,
      pn: UPI_PAYEE_NAME,
      am: String(Math.max(10, amount)),
      cu: "INR",
      tn: upiNote,
    });
    return `upi://pay?${params.toString()}`;
  }, [amount, upiNote]);

  const [qrData, setQrData] = useState<string | null>(null);
  useEffect(() => {
    if (step !== 2) return;
    let alive = true;
    (async () => {
      try {
        const QRCode = (await import("qrcode")).default;
        const url = await QRCode.toDataURL(upiLink, {
          margin: 1,
          width: 300,
          color: { dark: "#0b0c10", light: "#ffffff" },
        });
        if (alive) setQrData(url);
      } catch {
        if (alive) setQrData(null);
      }
    })();
    return () => {
      alive = false;
    };
  }, [step, upiLink]);

  const copyText = async (text: string, tag: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(tag);
      setTimeout(() => setCopied((c) => (c === tag ? null : c)), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          handle: handle.trim() || null,
          zone: effZone,
          amount: Math.max(10, amount),
          txId: txId.trim(),
        }),
      });
      const data = (await res.json()) as ClaimResponse | { error: string };
      if (!res.ok) {
        setError("error" in data ? data.error : "Something went wrong.");
        return;
      }
      setResult(data as ClaimResponse);
      setClaimedCode((data as ClaimResponse).code);
      setStep(4);
      void burstConfetti();
      onClaimed();
    } catch {
      setError("Network hiccup — check your connection and retry.");
    } finally {
      setBusy(false);
    }
  };

  const zoneCfg = ZONE_MAP[effZone];

  const canPay = name.trim().length >= 2 && amount >= 10;
  const cm2 = wrapAreaCm2(Math.max(10, amount));

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/45 backdrop-blur-sm sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Claim your slot on the bike"
        >
          <motion.div
            initial={{ y: 80, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 200, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
            className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[1.75rem] bg-white shadow-2xl sm:rounded-[1.75rem]"
          >
            {/* header */}
            <div className="relative shrink-0 border-b border-black/[0.06] bg-[linear-gradient(120deg,#fff5f6,#ffffff)] px-5 pb-4 pt-5 sm:px-6">
              <div className="racing-stripes absolute inset-x-0 top-0 h-1.5" />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-mono text-[10px] font-bold tracking-[0.18em] text-racing">
                    {step === 4 ? "WELCOME TO THE CREW" : "CLAIM YOUR REAL ESTATE"}
                  </div>
                  <h3 className="mt-0.5 font-display text-xl font-bold tracking-tight text-ink">
                    {step === 4
                      ? `${result?.claim.name ?? name.trim()} is on the bike!`
                      : "The People's Apache RR 310"}
                  </h3>
                </div>
                <button
                  onClick={closeClaim}
                  aria-label="Close"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white text-muted-foreground transition hover:bg-secondary hover:text-ink"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* step rail */}
              {step !== 4 ? (
                <div className="mt-4 flex items-center gap-1.5">
                  {STEP_LABELS.map((l, i) => {
                    const n = (i + 1) as Step;
                    const done = n < step;
                    const active = n === step;
                    return (
                      <div key={l} className="flex flex-1 items-center gap-1.5">
                        <div
                          className={`flex h-6 flex-1 items-center justify-center gap-1.5 rounded-full font-mono text-[9.5px] font-bold tracking-[0.1em] ${
                            done
                              ? "bg-volt/15 text-volt"
                              : active
                                ? "btn-racing text-white"
                                : "bg-secondary text-muted-foreground"
                          }`}
                        >
                          {done ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
                          {l.toUpperCase()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>

            {/* body */}
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
              {step === 1 ? (
                <StepDetails
                  name={name}
                  setName={(v) => {
                    setName(v);
                    setPreviewName(v);
                  }}
                  handle={handle}
                  setHandle={setHandle}
                  zone={zone}
                  setZone={(z) => {
                    setZoneLocal(z);
                    const min = ZONE_MAP[z].price;
                    if (!customOn && tierAmount < min) {
                      const t = TIERS.find((x) => x.zone === z);
                      if (t) setTierAmount(t.amount);
                    }
                  }}
                  tierAmount={tierAmount}
                  setTierAmount={(a) => {
                    setTierAmount(a);
                    setCustomOn(false);
                  }}
                  customOn={customOn}
                  setCustomOn={setCustomOn}
                  customValue={customValue}
                  setCustomValue={setCustomValue}
                  effZone={effZone}
                  remapped={remapped}
                />
              ) : null}

              {step === 2 ? (
                <StepPay
                  amount={Math.max(10, amount)}
                  upiLink={upiLink}
                  upiNote={upiNote}
                  qrData={qrData}
                  copied={copied}
                  copyText={copyText}
                  zoneCfg={zoneCfg}
                  cm2={cm2}
                  name={name}
                  handle={handle}
                />
              ) : null}

              {step === 3 ? (
                <div>
                  <div className="rounded-2xl border border-black/[0.07] bg-secondary/50 p-4">
                    <div className="flex items-center gap-2 font-mono text-[10.5px] font-bold tracking-[0.14em] text-muted-foreground">
                      <Lock className="h-3.5 w-3.5 text-volt" /> LAST STEP — PROVE THE PAYMENT
                    </div>
                    <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                      Paste the <strong className="font-semibold text-ink">12-digit UPI
                      transaction ID (UTR)</strong> from your payment app (GPay: tap the
                      transaction → UTR; PhonePe: History → transaction ID).
                    </p>
                    <input
                      value={txId}
                      onChange={(e) => setTxId(e.target.value.replace(/\D/g, "").slice(0, 12))}
                      inputMode="numeric"
                      placeholder="e.g. 4023XXXXXXXX"
                      aria-label="12-digit UPI transaction ID"
                      className="tnum mt-3 h-12 w-full rounded-xl border border-black/10 bg-white px-4 font-mono text-[15px] font-bold tracking-[0.2em] text-ink outline-none transition placeholder:font-normal placeholder:tracking-normal placeholder:text-muted-foreground/60 focus:border-racing/50 focus:ring-4 focus:ring-racing/10"
                    />
                  </div>
                  {error ? (
                    <p className="mt-3 rounded-xl border border-racing/25 bg-accent px-4 py-2.5 text-[13px] font-semibold text-racing">
                      {error}
                    </p>
                  ) : null}
                  <div className="mt-4 flex items-center gap-2 rounded-2xl bg-volt-bright/10 px-4 py-3 text-[12px] text-volt">
                    <BadgeCheck className="h-4 w-4 shrink-0" />
                    The moment it matches the ledger, your slot lights up and your name enters the
                    ticker.
                  </div>
                </div>
              ) : null}

              {step === 4 && result ? (
                <StepDone
                  code={result.code}
                  cm2={result.cm2}
                  zone={result.claim.zone as ZoneId}
                  name={result.claim.name}
                  amount={result.claim.amount}
                  onClose={closeClaim}
                />
              ) : null}
            </div>

            {/* footer actions */}
            {step !== 4 ? (
              <div className="shrink-0 border-t border-black/[0.06] bg-white px-5 pb-safe py-4 sm:px-6">
                {error && step === 1 ? (
                  <p className="mb-3 rounded-xl border border-racing/25 bg-accent px-4 py-2.5 text-[13px] font-semibold text-racing">
                    {error}
                  </p>
                ) : null}
                <div className="flex items-center gap-3">
                  {step > 1 ? (
                    <button
                      onClick={() => setStep((s) => (s - 1) as Step)}
                      className="inline-flex h-12 items-center gap-1.5 rounded-xl border border-black/10 bg-white px-4 text-[14px] font-semibold text-ink transition hover:bg-secondary"
                    >
                      <ArrowLeft className="h-4 w-4" /> Back
                    </button>
                  ) : null}
                  {step === 1 ? (
                    <button
                      disabled={!canPay}
                      onClick={() => {
                        setError(null);
                        setStep(2);
                      }}
                      className="btn-racing inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl px-4 text-[15px] font-bold text-white transition-transform duration-200 enabled:hover:scale-[1.02] enabled:active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Generate UPI QR · {formatINR(Math.max(10, amount))}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : null}
                  {step === 2 ? (
                    <button
                      onClick={() => setStep(3)}
                      className="btn-racing inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl px-4 text-[15px] font-bold text-white transition-transform duration-200 hover:scale-[1.02] active:scale-95"
                    >
                      I&apos;ve paid — verify now
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : null}
                  {step === 3 ? (
                    <button
                      onClick={submit}
                      disabled={busy || txId.length !== 12}
                      className="btn-racing inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl px-4 text-[15px] font-bold text-white transition-transform duration-200 enabled:hover:scale-[1.02] enabled:active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {busy ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Checking the ledger…
                        </>
                      ) : (
                        <>
                          Lock my name on the bike
                          <BadgeCheck className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  ) : null}
                </div>
                <p className="mt-2.5 text-center text-[11px] text-muted-foreground">
                  {step === 1
                    ? "No account needed. 30 seconds, one UPI payment."
                    : step === 2
                      ? "Pay from any UPI app — GPay, PhonePe, Paytm, BHIM."
                      : "One UTR = one slot. Duplicates are auto-rejected by the ledger."}
                </p>
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/* ── step 1: details ─────────────────────────────────────────────────────── */

function StepDetails({
  name,
  setName,
  handle,
  setHandle,
  zone,
  setZone,
  tierAmount,
  setTierAmount,
  customOn,
  setCustomOn,
  customValue,
  setCustomValue,
  effZone,
  remapped,
}: {
  name: string;
  setName: (v: string) => void;
  handle: string;
  setHandle: (v: string) => void;
  zone: ZoneId;
  setZone: (z: ZoneId) => void;
  tierAmount: number;
  setTierAmount: (a: number) => void;
  customOn: boolean;
  setCustomOn: (v: boolean) => void;
  customValue: string;
  setCustomValue: (v: string) => void;
  effZone: ZoneId;
  remapped: boolean;
}) {
  const eff = ZONE_MAP[effZone];
  return (
    <div className="space-y-5">
      <div>
        <Label>1 · Contributor name</Label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 25))}
          maxLength={25}
          placeholder="e.g. Arjun Mehta"
          aria-label="Contributor name (max 25 characters)"
          className="h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-[15px] font-semibold text-ink outline-none transition placeholder:font-normal placeholder:text-muted-foreground/60 focus:border-racing/50 focus:ring-4 focus:ring-racing/10"
        />
        <p className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-racing" /> This exact name goes on the wrap.
          </span>
          <span className="tnum font-mono">{name.length}/25</span>
        </p>
      </div>

      <div>
        <Label>2 · Social handle or 15-char punchline (optional)</Label>
        <input
          value={handle}
          onChange={(e) => setHandle(e.target.value.slice(0, 15))}
          maxLength={15}
          placeholder="@yourhandle"
          aria-label="Social handle or punchline (max 15 characters)"
          className="h-12 w-full rounded-xl border border-black/10 bg-white px-4 font-mono text-[15px] font-semibold text-ink outline-none transition placeholder:font-normal placeholder:font-sans placeholder:text-muted-foreground/60 focus:border-racing/50 focus:ring-4 focus:ring-racing/10"
        />
      </div>

      <div>
        <Label>3 · Pick your bike section</Label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {ZONES.map((z) => {
            const active = zone === z.id;
            return (
              <button
                key={z.id}
                onClick={() => setZone(z.id)}
                className={`flex items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-left transition ${
                  active
                    ? "border-racing/50 bg-accent ring-2 ring-racing/15"
                    : "border-black/10 bg-white hover:border-black/25"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: z.color }} />
                  <span className="text-[13px] font-bold text-ink">{z.short}</span>
                </span>
                <span className="tnum font-mono text-[12px] font-bold text-muted-foreground">
                  ₹{z.price}
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-[11.5px] text-muted-foreground">{ZONE_ANCHOR[effZone]}</p>
      </div>

      <div>
        <Label>4 · Your contribution</Label>
        <div className="grid grid-cols-5 gap-1.5">
          {TIERS.map((t) => {
            const active = !customOn && tierAmount === t.amount;
            return (
              <button
                key={t.amount}
                onClick={() => setTierAmount(t.amount)}
                className={`tnum rounded-xl border py-2.5 font-mono text-[13px] font-bold transition ${
                  active
                    ? "border-racing/50 bg-accent text-racing ring-2 ring-racing/15"
                    : "border-black/10 bg-white text-ink hover:border-black/25"
                }`}
              >
                ₹{t.amount >= 1000 ? `${t.amount / 1000}k` : t.amount}
              </button>
            );
          })}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <button
            onClick={() => setCustomOn(true)}
            className={`shrink-0 rounded-lg px-3 py-1.5 font-mono text-[11px] font-bold transition ${
              customOn ? "bg-ink text-white" : "bg-secondary text-ink hover:bg-black/10"
            }`}
          >
            CUSTOM
          </button>
          {customOn ? (
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-[14px] font-bold text-muted-foreground">
                ₹
              </span>
              <input
                autoFocus
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value.replace(/[^\d]/g, "").slice(0, 7))}
                inputMode="numeric"
                placeholder="Min ₹10"
                aria-label="Custom amount (minimum ₹10)"
                className="tnum h-11 w-full rounded-xl border border-black/10 bg-white pl-8 pr-3 font-mono text-[15px] font-bold text-ink outline-none transition placeholder:font-normal placeholder:text-muted-foreground/60 focus:border-racing/50 focus:ring-4 focus:ring-racing/10"
              />
            </div>
          ) : (
            <span className="text-[11.5px] text-muted-foreground">
              or add any amount — the ledger auto-maps it upward
            </span>
          )}
        </div>
      </div>

      {/* live wrap preview */}
      <div className="overflow-hidden rounded-2xl border border-black/[0.07]">
        <div className="flex items-center justify-between bg-ink px-4 py-2">
          <span className="font-mono text-[9.5px] font-bold tracking-[0.16em] text-zinc-300">
            LIVE WRAP PREVIEW — {eff.label.toUpperCase()}
          </span>
          <span className="font-mono text-[9.5px] font-bold tracking-[0.16em] text-racing-soft">
            {IDENTITY_LINE[effZone]}
          </span>
        </div>
        <div
          className="relative flex h-24 items-center justify-center overflow-hidden"
          style={{
            background: `linear-gradient(120deg, ${eff.color}22, #ffffff 70%)`,
          }}
        >
          <div className="racing-stripes absolute -left-6 top-2 h-2 w-24 -rotate-6 rounded-full opacity-70" />
          <div className="text-center">
            <div
              className="font-display text-xl font-bold italic tracking-tight text-ink sm:text-2xl"
              style={{ textShadow: "0 1px 0 rgba(255,255,255,0.6)" }}
            >
              {(name.trim() || "YOUR NAME").toUpperCase()}
            </div>
            {handle.trim() ? (
              <div className="mt-0.5 font-mono text-[11px] font-semibold text-muted-foreground">
                {handle.trim()}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {remapped ? (
        <p className="rounded-xl border border-volt/25 bg-volt-bright/10 px-4 py-2.5 text-[12px] font-semibold text-volt">
          Heads up: ₹{Math.max(10, tierAmount)} unlocks <strong>{eff.short}</strong> — your section
          was auto-mapped to the best zone your amount covers.
        </p>
      ) : null}
    </div>
  );
}

/* ── step 2: pay ─────────────────────────────────────────────────────────── */

function StepPay({
  amount,
  upiLink,
  upiNote,
  qrData,
  copied,
  copyText,
  zoneCfg,
  cm2,
  name,
  handle,
}: {
  amount: number;
  upiLink: string;
  upiNote: string;
  qrData: string | null;
  copied: string | null;
  copyText: (t: string, tag: string) => void;
  zoneCfg: (typeof ZONES)[number];
  cm2: number;
  name: string;
  handle: string;
}) {
  return (
    <div>
      <div className="flex items-stretch gap-4 rounded-2xl border border-black/[0.07] bg-secondary/40 p-4">
        <div className="flex shrink-0 flex-col items-center gap-2">
          <div className="rounded-xl border border-black/10 bg-white p-2">
            {qrData ? (
               
              <img src={qrData} alt={`UPI QR code for ${formatINR(amount)}`} className="h-36 w-36" />
            ) : (
              <div className="flex h-36 w-36 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
          <span className="inline-flex items-center gap-1 font-mono text-[9px] font-bold tracking-[0.12em] text-muted-foreground">
            <QrCode className="h-3 w-3" /> SCAN WITH ANY UPI APP
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="font-mono text-[10px] font-bold tracking-[0.16em] text-muted-foreground">
            PAY EXACTLY
          </div>
          <div className="tnum font-display text-3xl font-bold tracking-tight text-ink">
            {formatINR(amount)}
          </div>
          <div className="mt-2 space-y-1.5 text-[12px]">
            <Row k="Pay to" v={UPI_VPA} copy tag="vpa" copied={copied} onCopy={copyText} />
            <Row k="Note" v={upiNote} />
            <Row
              k="On the wrap"
              v={`${name.trim().toUpperCase() || "—"}${handle.trim() ? ` · ${handle.trim()}` : ""}`}
            />
          </div>
          <a
            href={upiLink}
            className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-ink px-4 text-[13px] font-bold text-white transition hover:bg-black"
          >
            <Smartphone className="h-4 w-4" /> Open UPI app
          </a>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <MiniStat icon="cm" label="WRAP REAL ESTATE" value={`${cm2} cm²`} />
        <MiniStat icon="zone" label="ZONE UNLOCKED" value={zoneCfg.short} color={zoneCfg.color} />
        <MiniStat icon="film" label="4K WRAP FILM" value="Included" />
      </div>

      <div className="mt-4 flex items-start gap-2.5 rounded-2xl bg-[linear-gradient(120deg,#fff1f3,#f8fafc)] p-4">
        <Flame className="mt-0.5 h-4 w-4 shrink-0 text-racing" />
        <p className="text-[12.5px] leading-relaxed text-ink">
          <strong className="font-bold">{zoneCfg.print}</strong>
        </p>
      </div>

      <details className="mt-3 rounded-xl border border-black/[0.07] bg-white px-4 py-3">
        <summary className="cursor-pointer font-mono text-[10.5px] font-bold tracking-[0.14em] text-muted-foreground">
          CAN&apos;T SCAN? COPY THE UPI LINK
        </summary>
        <div className="mt-2 flex items-center gap-2">
          <code className="min-w-0 flex-1 truncate rounded-lg bg-secondary px-3 py-2 font-mono text-[11px] text-ink">
            {upiLink}
          </code>
          <button
            onClick={() => copyText(upiLink, "link")}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-black/10 bg-white transition hover:bg-secondary"
            aria-label="Copy UPI link"
          >
            {copied === "link" ? (
              <Check className="h-4 w-4 text-volt" />
            ) : (
              <Copy className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </div>
      </details>
    </div>
  );
}

/* ── step 4: done ────────────────────────────────────────────────────────── */

function StepDone({
  code,
  cm2,
  zone,
  name,
  amount,
  onClose,
}: {
  code: string;
  cm2: number;
  zone: ZoneId;
  name: string;
  amount: number;
  onClose: () => void;
}) {
  const z = ZONE_MAP[zone];
  return (
    <div className="text-center">
      <motion.div
        initial={{ scale: 0.6, rotate: -8 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 14 }}
        className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-volt text-white shadow-[0_12px_30px_-10px_rgba(5,150,105,0.6)]"
      >
        <PartyPopper className="h-8 w-8" />
      </motion.div>

      <h4 className="mt-4 font-display text-2xl font-bold tracking-tight text-ink">
        You&apos;re on the bike, {name.split(" ")[0]}.
      </h4>
      <p className="mx-auto mt-2 max-w-sm text-[13.5px] leading-relaxed text-muted-foreground">
        {formatINR(amount)} locked in the public ledger. Your name now owns{" "}
        <strong className="font-semibold text-ink">{cm2} cm²</strong> of the{" "}
        <strong className="font-semibold text-ink">{z.short}</strong> zone — watch it appear on the
        3D bike the moment you close this.
      </p>

      <div className="mx-auto mt-5 w-full max-w-xs rounded-2xl border border-black/[0.07] bg-secondary/50 p-4">
        <div className="font-mono text-[9.5px] font-bold tracking-[0.16em] text-muted-foreground">
          YOUR CLAIM CODE
        </div>
        <div className="tnum mt-1 font-mono text-2xl font-bold tracking-[0.1em] text-racing">
          {code}
        </div>
        <div className="mt-1 text-[11px] text-muted-foreground">
          Keep it — it&apos;s your receipt on the ledger.
        </div>
      </div>

      <button
        onClick={onClose}
        className="btn-racing mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[15px] font-bold text-white transition-transform duration-200 hover:scale-[1.02] active:scale-95"
      >
        See my name on the 3D bike
        <ArrowRight className="h-4 w-4" />
      </button>
      <p className="mt-3 text-[11px] text-muted-foreground">
        Delivery day is livestreamed — your name goes on the wrap in 4K, on camera, forever.
      </p>
    </div>
  );
}

/* ── atoms ───────────────────────────────────────────────────────────────── */

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-1.5 font-mono text-[10px] font-bold tracking-[0.16em] text-muted-foreground">
      {children.toUpperCase()}
    </div>
  );
}

function Row({
  k,
  v,
  copy,
  tag,
  copied,
  onCopy,
}: {
  k: string;
  v: string;
  copy?: boolean;
  tag?: string;
  copied?: string | null;
  onCopy?: (t: string, tag: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="shrink-0 text-muted-foreground">{k}</span>
      <span className="flex min-w-0 items-center gap-1.5">
        <span className="tnum truncate font-mono text-[12px] font-bold text-ink">{v}</span>
        {copy && onCopy ? (
          <button
            onClick={() => onCopy(v, tag ?? k)}
            aria-label={`Copy ${k}`}
            className="shrink-0 text-muted-foreground transition hover:text-ink"
          >
            {copied === tag ? (
              <Check className="h-3.5 w-3.5 text-volt" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        ) : null}
      </span>
    </div>
  );
}

function MiniStat({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="rounded-xl border border-black/[0.07] bg-white px-3 py-2.5 text-center">
      <div className="font-mono text-[8.5px] font-bold tracking-[0.12em] text-muted-foreground">
        {label}
      </div>
      <div
        className="tnum mt-0.5 font-display text-[15px] font-bold"
        style={{ color: color ?? "#0b0c10" }}
      >
        {icon === "cm" ? "" : icon === "film" ? "🎬 " : ""}
        {value}
      </div>
    </div>
  );
}

