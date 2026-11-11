"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  CheckCircle2,
  ChevronLeft,
  Copy,
  Loader2,
  QrCode,
  ScanLine,
  Smartphone,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { burstConfetti } from "@/lib/tvs/confetti";
import {
  UPI_PAYEE_NAME,
  UPI_VPA,
  ZONES,
  ZONE_MAP,
  formatINR,
  wrapAreaCm2,
  zoneForAmount,
  type ZoneId,
} from "@/lib/tvs/constants";
import { useClaimStore } from "@/lib/tvs/store";
import type { ClaimResponse } from "@/lib/tvs/types";

type Step = "details" | "pay" | "verify" | "done";
type AmountSel = number | "custom";

const TIER_AMOUNTS = [10, 50, 100, 500, 1000];
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function copyText(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  } catch {
    toast.error("Copy failed — select and copy manually");
  }
}

export function ClaimModal({ onClaimed }: { onClaimed: () => void }) {
  const open = useClaimStore((s) => s.open);
  const closeClaim = useClaimStore((s) => s.closeClaim);
  const setStoreZone = useClaimStore((s) => s.setZone);
  const storeZone = useClaimStore((s) => s.zoneId);
  const storeAmount = useClaimStore((s) => s.amount);

  const [step, setStep] = useState<Step>("details");
  const [zone, setZone] = useState<ZoneId>("TANK");
  const [sel, setSel] = useState<AmountSel>(100);
  const [customAmount, setCustomAmount] = useState("");
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [txId, setTxId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [qr, setQr] = useState<string | null>(null);
  const [result, setResult] = useState<ClaimResponse | null>(null);

  // hydrate from store every time the modal opens
  useEffect(() => {
    if (!open) return;
    setStep("details");
    setTxId("");
    setResult(null);
    setQr(null);
    const z = storeZone ?? "TANK";
    setZone(z);
    setSel(storeAmount ?? ZONE_MAP[z].price);
  }, [open]);

  const customNum = Math.max(0, Math.round(Number(customAmount) || 0));
  const amount: number = sel === "custom" ? customNum : sel;
  const zoneCfg = ZONE_MAP[zone];
  const detailsValid =
    name.trim().length >= 2 &&
    name.length <= 25 &&
    amount >= zoneCfg.price &&
    amount >= 10 &&
    amount <= 1000000;

  const selectZone = (z: ZoneId) => {
    setZone(z);
    setSel(ZONE_MAP[z].price);
    setStoreZone(z);
  };

  const selectAmount = (v: AmountSel) => {
    setSel(v);
    if (typeof v === "number") {
      const z = zoneForAmount(v);
      setZone(z);
      setStoreZone(z);
    }
  };

  const onCustomChange = (raw: string) => {
    const v = raw.replace(/[^0-9]/g, "").slice(0, 7);
    setCustomAmount(v);
    const n = Math.round(Number(v) || 0);
    if (n >= 10) {
      setZone(zoneForAmount(n));
      setStoreZone(zoneForAmount(n));
    }
  };

  const upiNote = `Slot-${name.trim().replace(/\s+/g, "_").slice(0, 25) || "Rider"}`;
  const upiLink = useMemo(() => {
    const params = new URLSearchParams({
      pa: UPI_VPA,
      pn: UPI_PAYEE_NAME,
      am: String(amount || 0),
      tn: upiNote,
      cu: "INR",
    });
    return `upi://pay?${params.toString()}`;
  }, [amount, name, step === "pay"]);

  // generate QR when entering the pay step
  useEffect(() => {
    if (step !== "pay") return;
    let cancelled = false;
    (async () => {
      try {
        const QRCode = (await import("qrcode")).default;
        const url = await QRCode.toDataURL(upiLink, {
          margin: 1,
          width: 512,
          color: { dark: "#0a0a0c", light: "#ffffff" },
        });
        if (!cancelled) setQr(url);
      } catch {
        if (!cancelled) setQr(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [step, upiLink]);

  const submit = async () => {
    if (!/^\d{12}$/.test(txId)) {
      toast.error("Enter the 12-digit UTR from your UPI app");
      return;
    }
    setSubmitting(true);
    try {
      await sleep(1300); // simulated ledger verification
      const res = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          handle: handle.trim(),
          zone,
          amount,
          txId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error ?? "Verification failed. Check the ID and retry.");
        return;
      }
      setResult(data as ClaimResponse);
      setStep("done");
      onClaimed();
      void burstConfetti();
      toast.success("Slot locked. You're on the bike!");
    } catch {
      toast.error("Network hiccup — try again");
    } finally {
      setSubmitting(false);
    }
  };

  const stepIndex = step === "details" ? 0 : step === "pay" ? 1 : step === "verify" ? 2 : 3;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && closeClaim()}>
      <DialogContent className="glass-strong max-w-[460px] md:max-w-lg rounded-2xl border-white/10 p-0 gap-0 overflow-hidden max-h-[92dvh]">
        <div className="overflow-y-auto max-h-[92dvh] p-6 md:p-7">
          {/* header */}
          <div className="flex items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2.5">
              {step !== "details" && step !== "done" && (
                <button
                  onClick={() => setStep(step === "verify" ? "pay" : "details")}
                  className="grid place-items-center w-7 h-7 rounded-md border border-white/10 text-zinc-400 hover:text-white hover:border-white/25 transition-colors"
                  aria-label="Go back"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
              <DialogTitle className="font-display text-lg font-bold text-zinc-50">
                {step === "done" ? "Slot Confirmed" : "Claim Your Slot"}
              </DialogTitle>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[9.5px] tracking-[0.2em] text-zinc-500">
                {["DETAILS", "PAY", "VERIFY", "DONE"][stepIndex]}
              </span>
              <button
                onClick={closeClaim}
                className="grid place-items-center w-7 h-7 rounded-md border border-white/10 text-zinc-400 hover:text-white hover:border-white/25 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* ───────────── STEP 1: DETAILS ───────────── */}
            {step === "details" && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                className="space-y-5"
              >
                {/* name */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="c-name" className="text-[12px] font-semibold text-zinc-300">
                      Contributor Name <span className="text-racing-soft">*</span>
                    </label>
                    <span className="font-mono text-[10px] text-zinc-600 tnum">{name.length}/25</span>
                  </div>
                  <input
                    id="c-name"
                    value={name}
                    maxLength={25}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ankit R."
                    className="w-full rounded-lg border border-white/12 bg-black/40 px-3.5 py-2.5 text-[14px] text-zinc-100 placeholder:text-zinc-700 focus:border-racing/60 focus:outline-none focus:ring-1 focus:ring-racing/40"
                  />
                  <p className="mt-1.5 font-mono text-[10px] text-zinc-600">PRINTED EXACTLY AS ENTERED</p>
                </div>

                {/* handle */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="c-handle" className="text-[12px] font-semibold text-zinc-300">
                      Social Handle / 15-char Punchline
                    </label>
                    <span className="font-mono text-[10px] text-zinc-600 tnum">{handle.length}/15</span>
                  </div>
                  <input
                    id="c-handle"
                    value={handle}
                    maxLength={15}
                    onChange={(e) => setHandle(e.target.value)}
                    placeholder="@insta or WHEELIE OR DIE"
                    className="w-full rounded-lg border border-white/12 bg-black/40 px-3.5 py-2.5 text-[14px] text-zinc-100 placeholder:text-zinc-700 focus:border-racing/60 focus:outline-none focus:ring-1 focus:ring-racing/40"
                  />
                </div>

                {/* zone chips */}
                <div>
                  <div className="mb-1.5 text-[12px] font-semibold text-zinc-300">Bike Section</div>
                  <div role="radiogroup" aria-label="Bike section" className="grid grid-cols-5 gap-1.5">
                    {ZONES.map((z) => {
                      const active = zone === z.id;
                      return (
                        <button
                          key={z.id}
                          role="radio"
                          aria-checked={active}
                          onClick={() => selectZone(z.id)}
                          className="rounded-lg border px-1 py-2 text-center transition-all"
                          style={{
                            borderColor: active ? z.color : "rgba(255,255,255,0.1)",
                            background: active ? `${z.color}1f` : "rgba(255,255,255,0.02)",
                          }}
                        >
                          <span
                            className="block text-[10px] font-semibold leading-tight"
                            style={{ color: active ? z.color : "#a1a1aa" }}
                          >
                            {z.short}
                          </span>
                          <span className="block mt-0.5 font-mono text-[10px] text-zinc-500 tnum">
                            ₹{z.price}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-2 text-[11.5px] leading-relaxed text-zinc-500">{zoneCfg.print}</p>
                </div>

                {/* amount radios */}
                <div>
                  <div className="mb-1.5 text-[12px] font-semibold text-zinc-300">Amount</div>
                  <div role="radiogroup" aria-label="Contribution amount" className="grid grid-cols-3 gap-2">
                    {TIER_AMOUNTS.map((a) => {
                      const active = sel === a;
                      return (
                        <button
                          key={a}
                          role="radio"
                          aria-checked={active}
                          onClick={() => selectAmount(a)}
                          className={`rounded-lg border px-2 py-2.5 font-mono text-[13.5px] font-bold tnum transition-all ${
                            active
                              ? "border-racing bg-racing/15 text-white shadow-[0_0_18px_rgba(225,29,72,0.25)]"
                              : "border-white/10 bg-white/[0.02] text-zinc-400 hover:border-white/25"
                          }`}
                        >
                          ₹{a}
                          {a === 1000 ? "+" : ""}
                        </button>
                      );
                    })}
                    <button
                      role="radio"
                      aria-checked={sel === "custom"}
                      onClick={() => setSel("custom")}
                      className={`rounded-lg border px-2 py-2.5 font-mono text-[11.5px] font-bold tracking-wider transition-all ${
                        sel === "custom"
                          ? "border-volt bg-volt/15 text-volt"
                          : "border-white/10 bg-white/[0.02] text-zinc-400 hover:border-white/25"
                      }`}
                    >
                      CUSTOM
                    </button>
                  </div>

                  {sel === "custom" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 flex items-center gap-3">
                        <div className="relative flex-1">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-zinc-500">₹</span>
                          <input
                            type="number"
                            inputMode="numeric"
                            min={10}
                            value={customAmount}
                            onChange={(e) => onCustomChange(e.target.value)}
                            placeholder="250"
                            aria-label="Custom amount, minimum 10 rupees"
                            className="w-full rounded-lg border border-white/12 bg-black/40 px-8 py-2.5 font-mono text-[15px] text-zinc-100 placeholder:text-zinc-700 focus:border-volt/60 focus:outline-none focus:ring-1 focus:ring-volt/40"
                          />
                        </div>
                        {customNum >= 10 && (
                          <span
                            className="rounded-md px-2.5 py-1.5 font-mono text-[10.5px]"
                            style={{
                              background: `${ZONE_MAP[zoneForAmount(customNum)].color}1a`,
                              color: ZONE_MAP[zoneForAmount(customNum)].color,
                            }}
                          >
                            → {ZONE_MAP[zoneForAmount(customNum)].short}
                          </span>
                        )}
                      </div>
                      {customNum > 0 && customNum < 10 && (
                        <p className="mt-1.5 font-mono text-[10.5px] text-racing-soft">MINIMUM ₹10</p>
                      )}
                    </motion.div>
                  )}
                </div>

                {/* summary + CTA */}
                <div className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 flex items-center justify-between">
                  <div className="font-mono text-[11px] text-zinc-400 leading-relaxed">
                    {formatINR(amount || 0)} → <span style={{ color: zoneCfg.color }}>{zoneCfg.short}</span>
                    <span className="block text-zinc-600 mt-0.5">
                      ≈ {wrapAreaCm2(amount || 0)} cm² OF WRAP REAL ESTATE
                    </span>
                  </div>
                  <Sparkles className="w-4 h-4 text-zinc-600" />
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  disabled={!detailsValid}
                  onClick={() => setStep("pay")}
                  className="w-full rounded-xl bg-racing py-3.5 text-[14.5px] font-bold text-white shadow-[0_0_32px_rgba(225,29,72,0.4)] hover:shadow-[0_0_48px_rgba(225,29,72,0.55)] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all"
                >
                  {detailsValid ? `Generate UPI QR for ${formatINR(amount)}` : "Fill the required fields"}
                </motion.button>
                <p className="text-center font-mono text-[9.5px] tracking-wider text-zinc-600">
                  SIMULATION DEMO • END-TO-END FLOW • NO REAL MONEY CHARGED
                </p>
              </motion.div>
            )}

            {/* ───────────── STEP 2: PAY ───────────── */}
            {step === "pay" && (
              <motion.div
                key="pay"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                className="space-y-5"
              >
                <div className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 flex items-center justify-between font-mono text-[12px]">
                  <span className="text-zinc-400">
                    {formatINR(amount)} → <span style={{ color: zoneCfg.color }}>{zoneCfg.label.split("—")[0]}</span>
                  </span>
                  <span className="text-zinc-500">{upiNote}</span>
                </div>

                {/* QR */}
                <div className="flex flex-col items-center gap-3 pt-1">
                  <div className="relative rounded-2xl bg-white p-3.5 shadow-[0_0_44px_rgba(255,255,255,0.09)]">
                    {qr ? (
                      <img src={qr} alt={`UPI QR code for ${formatINR(amount)}`} className="w-[168px] h-[168px]" />
                    ) : (
                      <div className="w-[168px] h-[168px] grid place-items-center bg-zinc-100 rounded-lg">
                        <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
                      </div>
                    )}
                    <ScanLine className="absolute -right-2.5 -top-2.5 w-6 h-6 text-volt" />
                  </div>
                  <div className="text-center">
                    <div className="inline-flex items-center gap-1.5 font-mono text-[10.5px] tracking-[0.2em] text-zinc-400">
                      <QrCode className="w-3.5 h-3.5" /> SCAN WITH ANY UPI APP
                    </div>
                    <div className="mt-1 font-mono text-[10px] text-zinc-600">
                      GPay • PhonePe • Paytm • BHIM
                    </div>
                  </div>
                </div>

                {/* link + vpa */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 rounded-lg border border-white/8 bg-black/40 px-3 py-2.5">
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-[9px] tracking-[0.2em] text-zinc-600">UPI INTENT LINK</div>
                      <div className="truncate font-mono text-[11px] text-zinc-300 mt-0.5">{upiLink}</div>
                    </div>
                    <button
                      onClick={() => copyText(upiLink, "UPI link")}
                      className="shrink-0 grid place-items-center w-8 h-8 rounded-md border border-white/10 text-zinc-400 hover:text-white hover:border-white/25 transition-colors"
                      aria-label="Copy UPI link"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-white/8 bg-black/40 px-3 py-2.5">
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-[9px] tracking-[0.2em] text-zinc-600">VIRTUAL PAYMENT ADDRESS</div>
                      <div className="font-mono text-[11.5px] text-zinc-300 mt-0.5">{UPI_VPA}</div>
                    </div>
                    <button
                      onClick={() => copyText(UPI_VPA, "VPA")}
                      className="shrink-0 grid place-items-center w-8 h-8 rounded-md border border-white/10 text-zinc-400 hover:text-white hover:border-white/25 transition-colors"
                      aria-label="Copy VPA"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <a
                  href={upiLink}
                  className="flex items-center justify-center gap-2 rounded-xl border border-volt/40 bg-volt/10 py-3 text-[13.5px] font-bold text-volt hover:bg-volt/15 transition-colors"
                >
                  <Smartphone className="w-4 h-4" /> Open in UPI App
                </a>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setStep("verify")}
                  className="w-full rounded-xl bg-racing py-3.5 text-[14.5px] font-bold text-white shadow-[0_0_32px_rgba(225,29,72,0.4)] hover:shadow-[0_0_48px_rgba(225,29,72,0.55)] transition-all"
                >
                  I&apos;ve Paid — Verify Transaction
                </motion.button>
              </motion.div>
            )}

            {/* ───────────── STEP 3: VERIFY ───────────── */}
            {step === "verify" && (
              <motion.div
                key="verify"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                className="space-y-5"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="c-txid" className="text-[12px] font-semibold text-zinc-300">
                      UPI Transaction ID (UTR)
                    </label>
                    <span
                      className={`font-mono text-[10px] tnum ${txId.length === 12 ? "text-volt" : "text-zinc-600"}`}
                    >
                      {txId.length}/12
                    </span>
                  </div>
                  <input
                    id="c-txid"
                    value={txId}
                    inputMode="numeric"
                    maxLength={12}
                    onChange={(e) => setTxId(e.target.value.replace(/[^0-9]/g, "").slice(0, 12))}
                    placeholder="e.g. 418293746501"
                    className="w-full rounded-lg border border-white/12 bg-black/40 px-3.5 py-3 font-mono text-[16px] tracking-[0.14em] text-zinc-100 placeholder:text-zinc-700 focus:border-volt/60 focus:outline-none focus:ring-1 focus:ring-volt/40"
                  />
                  <p className="mt-1.5 font-mono text-[10px] text-zinc-600">
                    12-DIGIT REFERENCE FROM YOUR UPI APP • ONE UTR = ONE SLOT
                  </p>
                </div>

                <div className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-volt shrink-0" />
                    <p className="text-[12px] leading-relaxed text-zinc-400">
                      On match, your name enters the ledger, the ticker and the wrap layout
                      instantly.
                    </p>
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  disabled={submitting || !/^\d{12}$/.test(txId)}
                  onClick={submit}
                  className="w-full inline-flex items-center justify-center gap-2.5 rounded-xl bg-volt py-3.5 text-[14.5px] font-bold text-black shadow-[0_0_32px_rgba(16,185,129,0.35)] hover:shadow-[0_0_48px_rgba(16,185,129,0.5)] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4.5 h-4.5 animate-spin" /> CHECKING LEDGER…
                    </>
                  ) : (
                    <>
                      <Check className="w-4.5 h-4.5" strokeWidth={3} /> Verify &amp; Lock My Slot
                    </>
                  )}
                </motion.button>
              </motion.div>
            )}

            {/* ───────────── STEP 4: DONE ───────────── */}
            {step === "done" && result && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="space-y-5 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 14, delay: 0.08 }}
                  className="mx-auto grid place-items-center w-16 h-16 rounded-full bg-volt/15 border border-volt/40"
                >
                  <Check className="w-8 h-8 text-volt" strokeWidth={3} />
                </motion.div>

                <div>
                  <div className="font-display text-2xl font-bold text-zinc-50">
                    You&apos;re on the bike, {result.claim.name.split(" ")[0]}.
                  </div>
                  <div className="mt-1 font-mono text-[11px] tracking-[0.2em] text-zinc-500">
                    SLOT CODE <span className="text-volt font-bold">{result.code}</span>
                  </div>
                </div>

                {/* wrap preview */}
                <div className="rounded-xl border border-white/10 overflow-hidden text-left">
                  <div className="px-3 py-1.5 bg-white/[0.04] font-mono text-[9px] tracking-[0.24em] text-zinc-500">
                    LIVE WRAP PREVIEW — {ZONE_MAP[result.claim.zone as ZoneId].label.toUpperCase()}
                  </div>
                  <div className="relative bg-gradient-to-br from-[#15151b] to-[#0c0c10] px-5 py-6">
                    <div className="absolute inset-y-0 left-0 w-1.5 bg-racing" />
                    <div className="absolute inset-y-0 right-0 w-1.5 bg-racing" />
                    <div className="text-center">
                      <div className="font-display italic font-bold text-[22px] text-zinc-50 tracking-tight">
                        {result.claim.name}
                      </div>
                      {result.claim.handle && (
                        <div className="mt-1 font-mono text-[12px] text-zinc-500">{result.claim.handle}</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 font-mono">
                  {[
                    ["CONTRIBUTION", formatINR(result.claim.amount)],
                    ["WRAP AREA", `≈ ${result.cm2} cm²`],
                    ["ZONE", ZONE_MAP[result.claim.zone as ZoneId].short.toUpperCase()],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-lg border border-white/8 bg-white/[0.03] px-2 py-2.5">
                      <div className="text-[8.5px] tracking-[0.18em] text-zinc-600">{k}</div>
                      <div className="mt-1 text-[12.5px] font-bold text-zinc-200 tnum">{v}</div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2.5">
                  <a
                    href="#hall"
                    onClick={closeClaim}
                    className="flex-1 rounded-xl border border-white/12 py-3 text-[13px] font-semibold text-zinc-200 hover:bg-white/5 transition-colors"
                  >
                    See Hall of Fame
                  </a>
                  <button
                    onClick={closeClaim}
                    className="flex-1 rounded-xl bg-racing py-3 text-[13px] font-bold text-white shadow-[0_0_28px_rgba(225,29,72,0.4)] hover:shadow-[0_0_44px_rgba(225,29,72,0.55)] transition-all"
                  >
                    Done
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
