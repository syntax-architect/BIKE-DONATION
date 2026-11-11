"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  ArrowLeft,
  BadgeCheck,
  Copy,
  Loader2,
  PartyPopper,
  Smartphone,
  Zap,
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
import { badgeFor } from "@/lib/tvs/v3";
import { useClaimStore, useLiveStore } from "@/lib/tvs/store";
import { burstConfetti } from "@/lib/tvs/confetti";

type Step = "details" | "pay" | "success";

export function ClaimModal() {
  const { open, zoneId, amount: prefillAmount, closeClaim, setClaimedCode } = useClaimStore();
  const refresh = useLiveStore((s) => s.refresh);

  const [step, setStep] = useState<Step>("details");
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [zone, setZone] = useState<ZoneId>("TANK");
  const [amount, setAmount] = useState<number>(100);
  const [customMode, setCustomMode] = useState(false);
  const [customVal, setCustomVal] = useState("");
  const [txId, setTxId] = useState("");
  const [qr, setQr] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [code, setCode] = useState<string>("");
  const [cm2, setCm2] = useState<number>(0);

  /* reset / prefill on open */
  useEffect(() => {
    if (open) {
      setStep("details");
      setTxId("");
      setQr("");
      if (zoneId) setZone(zoneId);
      if (prefillAmount) {
        setAmount(prefillAmount);
        setCustomMode(false);
      }
    }
  }, [open, zoneId, prefillAmount]);

  const zoneCfg = ZONE_MAP[zone];

  /* keep zone & amount consistent */
  const applyAmount = useCallback(
    (v: number) => {
      const val = Math.max(10, Math.round(v || 0));
      setAmount(val);
      if (val < ZONE_MAP[zone].price) setZone(zoneForAmount(val));
    },
    [zone],
  );

  const upiUri = useMemo(() => {
    const p = new URLSearchParams({
      pa: UPI_VPA,
      pn: UPI_PAYEE_NAME,
      am: String(amount),
      cu: "INR",
      tn: `Slot-${name.trim() || "RR310"}-${zone}`,
    });
    return `upi://pay?${p.toString()}`;
  }, [amount, name, zone]);

  /* QR generation when entering pay step */
  useEffect(() => {
    if (step === "pay") {
      QRCode.toDataURL(upiUri, {
        width: 320,
        margin: 1,
        color: { dark: "#0b0c10", light: "#ffffff" },
      })
        .then(setQr)
        .catch(() => setQr(""));
    }
  }, [step, upiUri]);

  const detailsValid = name.trim().length >= 2 && amount >= 10 && amount >= zoneCfg.price;

  const gotoPay = () => {
    if (!detailsValid) {
      toast.error(
        name.trim().length < 2
          ? "Add your name (2-25 characters) — it gets printed."
          : `Minimum for ${zoneCfg.short} is ${formatINR(zoneCfg.price)}.`,
      );
      return;
    }
    setStep("pay");
  };

  const submit = async () => {
    if (!/^\d{12}$/.test(txId)) {
      toast.error("Paste the 12-digit UPI transaction ID (UTR) from your payment app.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          handle: handle.trim() || null,
          zone,
          amount,
          txId: txId.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Verification failed. Check the UTR and try again.");
        return;
      }
      setCode(data.code);
      setCm2(data.cm2 ?? wrapAreaCm2(amount));
      setClaimedCode(data.code);
      setStep("success");
      void refresh();
      void burstConfetti();
      toast.success("Slot locked. Your name enters the ticker within seconds.");
    } catch {
      toast.error("Network hiccup — try once more.");
    } finally {
      setSubmitting(false);
    }
  };

  const copyVpa = async () => {
    try {
      await navigator.clipboard.writeText(UPI_VPA);
      toast.success("UPI ID copied");
    } catch {
      /* clipboard blocked */
    }
  };

  const resetAll = () => {
    setStep("details");
    setTxId("");
    setName("");
    setHandle("");
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? undefined : closeClaim())}>
      <DialogContent className="max-h-[92vh] overflow-y-auto p-0 sm:max-w-lg">
        <div className="px-5 pb-6 pt-5 sm:px-7">
          <DialogHeader className="pb-1 text-left">
            <DialogTitle className="font-display text-xl font-bold tracking-tight">
              {step === "details" && "Claim your slot on the bike"}
              {step === "pay" && `Pay ${formatINR(amount)} over UPI`}
              {step === "success" && "You're on the bike!"}
            </DialogTitle>
            {step !== "success" && (
              <p className="text-xs text-muted-foreground">
                Real bike. Real wrap. Your name printed permanently & filmed in 4K.
              </p>
            )}
          </DialogHeader>

          {/* ── STEP 1: details ── */}
          {step === "details" && (
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1.5 flex items-baseline justify-between text-xs font-semibold">
                  <span>Contributor name (what gets printed)</span>
                  <span className={`tnum ${name.length >= 25 ? "text-racing" : "text-muted-foreground"}`}>
                    {name.length}/25
                  </span>
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value.slice(0, 25))}
                  placeholder="e.g. Arjun Mehta"
                  maxLength={25}
                  autoFocus
                />
              </div>

              <div>
                <label className="mb-1.5 flex items-baseline justify-between text-xs font-semibold">
                  <span>Social handle / 15-char call sign (optional)</span>
                  <span className={`tnum ${handle.length >= 15 ? "text-racing" : "text-muted-foreground"}`}>
                    {handle.length}/15
                  </span>
                </label>
                <Input
                  value={handle}
                  onChange={(e) => setHandle(e.target.value.slice(0, 15))}
                  placeholder="@yourhandle or a punchline"
                  maxLength={15}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold">Bike section</label>
                <div className="grid grid-cols-1 gap-1.5">
                  {ZONES.map((z) => (
                    <button
                      key={z.id}
                      type="button"
                      onClick={() => {
                        setZone(z.id);
                        if (amount < z.price) {
                          setAmount(z.price);
                          setCustomMode(false);
                          setCustomVal("");
                        }
                      }}
                      className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-left transition-all ${
                        zone === z.id
                          ? "border-racing bg-racing/5 ring-1 ring-racing"
                          : "hover:border-racing/40"
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-2.5">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: z.color }} />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold">{z.label}</span>
                          <span className="block truncate text-[10px] uppercase tracking-wider text-muted-foreground">
                            {z.tierName}
                          </span>
                        </span>
                      </span>
                      <span className="tnum shrink-0 text-sm font-bold text-racing">
                        {formatINR(z.price)}+
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold">Amount</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {TIERS.map((t) => (
                    <button
                      key={t.amount}
                      type="button"
                      onClick={() => {
                        setAmount(t.amount);
                        setZone(t.zone);
                        setCustomMode(false);
                      }}
                      className={`tnum rounded-lg border py-2 text-sm font-bold transition-all ${
                        !customMode && amount === t.amount
                          ? "border-racing bg-racing text-white"
                          : "hover:border-racing/40"
                      }`}
                    >
                      ₹{t.amount}
                      {t.amount >= 1000 ? "+" : ""}
                    </button>
                  ))}
                </div>
                <div
                  className={`mt-1.5 flex items-center gap-2 rounded-xl border px-3 py-2 transition-colors ${
                    customMode ? "border-racing ring-1 ring-racing" : ""
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setCustomMode(true)}
                    className={`shrink-0 text-sm font-bold ${customMode ? "text-racing" : ""}`}
                  >
                    Custom
                  </button>
                  <span className="text-muted-foreground">₹</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={10}
                    value={customMode ? customVal : String(amount)}
                    onFocus={() => setCustomMode(true)}
                    onChange={(e) => {
                      setCustomMode(true);
                      setCustomVal(e.target.value);
                      applyAmount(Number(e.target.value));
                    }}
                    className="tnum w-full bg-transparent text-sm font-bold outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    placeholder="100"
                    aria-label="Custom amount"
                  />
                  <span className="shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground">
                    min ₹10
                  </span>
                </div>
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  {formatINR(amount)} unlocks <strong className="text-foreground">{zoneCfg.short}</strong>{" "}
                  ({zoneCfg.tierName}) • {wrapAreaCm2(amount)} cm² of wrap
                </p>
              </div>

              <button
                type="button"
                onClick={gotoPay}
                disabled={!detailsValid}
                className="btn-racing flex h-12 w-full items-center justify-center gap-2 rounded-xl text-base font-bold text-white transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Zap className="h-4.5 w-4.5" /> Continue to UPI payment
              </button>
            </div>
          )}

          {/* ── STEP 2: pay ── */}
          {step === "pay" && (
            <div className="mt-4 space-y-4">
              <div className="flex flex-col items-center rounded-2xl border bg-card p-4">
                {qr ? (
                  <Image src={qr} alt="UPI QR code" width={180} height={180} className="rounded-lg" unoptimized />
                ) : (
                  <div className="grid h-[180px] w-[180px] place-items-center rounded-lg bg-muted">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                )}
                <div className="mt-3 text-center">
                  <div className="font-display text-2xl font-bold">{formatINR(amount)}</div>
                  <div className="text-xs text-muted-foreground">
                    to {ZONE_MAP[zone].short} • {ZONE_MAP[zone].tierName}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={copyVpa}
                  className="mt-3 flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 font-mono text-xs font-semibold transition-colors hover:bg-accent"
                >
                  {UPI_VPA} <Copy className="h-3 w-3" />
                </button>
                <a
                  href={upiUri}
                  className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-volt/40 bg-volt/10 text-sm font-bold text-volt transition-colors hover:bg-volt hover:text-white dark:text-volt-bright dark:border-volt-bright/40 dark:bg-volt-bright/10 sm:hidden"
                >
                  <Smartphone className="h-4 w-4" /> Open UPI app instead
                </a>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold">
                  12-digit UPI transaction ID (UTR)
                </label>
                <Input
                  value={txId}
                  onChange={(e) => setTxId(e.target.value.replace(/\D/g, "").slice(0, 12))}
                  placeholder="e.g. 402113567890"
                  inputMode="numeric"
                  className="tnum font-mono tracking-[0.14em]"
                />
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  Find it in your UPI app under transaction details. One UTR = one slot — the ledger
                  rejects duplicates.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep("details")}
                  className="flex h-12 shrink-0 items-center justify-center gap-1.5 rounded-xl border px-4 text-sm font-bold transition-colors hover:bg-muted"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={submit}
                  disabled={submitting}
                  className="btn-racing flex h-12 w-full items-center justify-center gap-2 rounded-xl text-base font-bold text-white transition-transform active:scale-[0.98] disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4.5 w-4.5 animate-spin" /> Verifying…
                    </>
                  ) : (
                    <>
                      <BadgeCheck className="h-4.5 w-4.5" /> I&rsquo;ve paid — verify my slot
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: success ── */}
          {step === "success" && (
            <div className="mt-2 text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-volt/15 text-volt dark:text-volt-bright">
                <PartyPopper className="h-8 w-8" />
              </div>
              <h3 className="mt-4 font-display text-2xl font-bold">
                Welcome, {badgeFor(amount).title}
              </h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {name.trim()} {handle.trim()} • {formatINR(amount)} to{" "}
                <strong className="text-foreground">{ZONE_MAP[zone].short}</strong>
              </p>

              <div className="mx-auto mt-5 grid max-w-sm grid-cols-2 gap-2.5">
                <div className="rounded-xl border bg-card p-3.5">
                  <div className="font-mono text-sm font-bold text-racing">{code}</div>
                  <div className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                    Your slot code
                  </div>
                </div>
                <div className="rounded-xl border bg-card p-3.5">
                  <div className="font-display text-sm font-bold">{cm2} cm²</div>
                  <div className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                    Wrap real estate
                  </div>
                </div>
              </div>

              <p className="mt-5 rounded-xl bg-muted/70 p-4 text-sm leading-relaxed text-muted-foreground">
                Your name enters the live ticker and Hall of Fame within seconds. On wrap day, watch
                the 4K install film and find it on the actual panel.
              </p>

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={resetAll}
                  className="flex h-12 w-full items-center justify-center rounded-xl border text-sm font-bold transition-colors hover:bg-muted"
                >
                  Claim another slot
                </button>
                <button
                  type="button"
                  onClick={closeClaim}
                  className="btn-racing h-12 w-full rounded-xl text-sm font-bold text-white active:scale-[0.98]"
                >
                  See my name in the feed
                </button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
