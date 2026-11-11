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
  Download,
  Loader2,
  PartyPopper,
  Share2,
  Smartphone,
  Zap,
} from "lucide-react";
import {
  QUICK_AMOUNTS,
  UPI_PAYEE_NAME,
  UPI_VPA,
  ZONES,
  ZONE_MAP,
  formatINR,
  wrapAreaCm2,
  zoneForAmount,
  type ZoneId,
} from "@/lib/tvs/constants";
import { TIER_ANCHOR } from "@/lib/tvs/psych";
import { downloadWrapPass } from "@/lib/tvs/shareCard";
import { badgeFor } from "@/lib/tvs/v3";
import { useClaimStore, useLiveStore } from "@/lib/tvs/store";
import { burstConfetti } from "@/lib/tvs/confetti";
import { VinylSticker } from "./VinylSticker";

type Step = "details" | "pay" | "success";

export function ClaimModal() {
  const { open, sessionId, closeClaim } = useClaimStore();

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? undefined : closeClaim())}>
      <DialogContent className="max-h-[92vh] overflow-y-auto p-0 sm:max-w-lg">
        <ClaimModalBody key={sessionId} />
      </DialogContent>
    </Dialog>
  );
}

function ClaimModalBody() {
  const {
    zoneId,
    amount: prefillAmount,
    startStep,
    previewName,
    previewHandle,
    setPreviewName,
    setPreviewHandle,
    closeClaim,
    setClaimedCode,
  } = useClaimStore();
  const refresh = useLiveStore((s) => s.refresh);

  const initialZone = zoneId ?? "BELLY";
  const initialAmount = prefillAmount ?? (zoneId ? ZONE_MAP[zoneId].price : 20);
  const initialIsQuick = QUICK_AMOUNTS.includes(
    initialAmount as (typeof QUICK_AMOUNTS)[number],
  );

  const [step, setStep] = useState<Step>(() =>
    startStep === "pay" && previewName.trim().length >= 2 ? "pay" : "details",
  );
  const [name, setName] = useState(() => previewName);
  const [handle, setHandle] = useState(() => previewHandle);
  const [zone, setZone] = useState<ZoneId>(initialZone);
  const [amount, setAmount] = useState<number>(initialAmount);
  const [customMode, setCustomMode] = useState(!initialIsQuick);
  const [customVal, setCustomVal] = useState(initialIsQuick ? "" : String(initialAmount));
  const [txId, setTxId] = useState("");
  const [qr, setQr] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [code, setCode] = useState<string>("");
  const [cm2, setCm2] = useState<number>(0);

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
    setPreviewName("");
    setPreviewHandle("");
  };

  return (
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
                  onChange={(e) => {
                    const v = e.target.value.slice(0, 25);
                    setName(v);
                    setPreviewName(v);
                  }}
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
                  onChange={(e) => {
                    const v = e.target.value.slice(0, 15);
                    setHandle(v);
                    setPreviewHandle(v);
                  }}
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
                <label className="mb-1.5 flex items-baseline justify-between text-xs font-semibold">
                  <span>Amount</span>
                  {TIER_ANCHOR[amount] ? (
                    <span className="font-mono text-[11px] font-medium text-muted-foreground">
                      {TIER_ANCHOR[amount]}
                    </span>
                  ) : null}
                </label>
                <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
                  {QUICK_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setAmount(amt);
                        setZone(zoneForAmount(amt));
                        setCustomMode(false);
                      }}
                      className={`tnum relative rounded-lg border py-2 text-sm font-bold transition-all ${
                        !customMode && amount === amt
                          ? "border-racing bg-racing text-white"
                          : "hover:border-racing/40"
                      }`}
                    >
                      ₹{amt}
                      {amt >= 1000 ? "+" : ""}
                      {amt === 20 && (
                        <span className="ml-1 rounded bg-white/20 px-1 text-[9px] font-bold uppercase">
                          2×
                        </span>
                      )}
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
              <VinylSticker name={name} handle={handle} zone={zone} amount={amount} className="w-full" />
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
                  className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-volt/40 bg-volt/10 text-sm font-bold text-volt transition-colors hover:bg-volt hover:text-white dark:text-volt-bright dark:border-volt-bright/40 dark:bg-volt-bright/10 lg:hidden"
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

              <p className="mt-4 rounded-xl bg-muted/70 p-4 text-sm leading-relaxed text-muted-foreground">
                Your name enters the live ticker and Hall of Fame within seconds. On wrap day, watch
                the 4K install film and find it on the actual RR 310 panel.
              </p>

              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    void downloadWrapPass({
                      name: name.trim(),
                      handle: handle.trim() || null,
                      zone,
                      amount,
                      code,
                      cm2,
                    });
                    toast.success("Story Pass PNG downloaded!");
                  }}
                  className="btn-racing flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-bold text-white active:scale-[0.98]"
                >
                  <Download className="h-4 w-4" /> Download Story Card
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const shareText = `I just claimed ${cm2} cm² on a real TVS Apache RR 310 wrap for ${formatINR(amount)} (Slot ${code})! Claim yours from ₹10: ${window.location.origin}`;
                    try {
                      if (navigator.share) {
                        await navigator.share({
                          title: "The People's Apache RR310",
                          text: shareText,
                          url: window.location.origin,
                        });
                      } else {
                        await navigator.clipboard.writeText(shareText);
                        toast.success("Invite message copied — paste on WhatsApp / IG!");
                      }
                    } catch {
                      /* cancelled */
                    }
                  }}
                  className="flex h-11 items-center justify-center gap-2 rounded-xl border border-racing/30 bg-racing/5 text-sm font-bold text-racing transition-colors hover:bg-racing hover:text-white active:scale-[0.98]"
                >
                  <Share2 className="h-4 w-4" /> Flex &amp; Invite Friends
                </button>
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={resetAll}
                  className="flex h-11 w-full items-center justify-center rounded-xl border text-sm font-bold transition-colors hover:bg-muted"
                >
                  Claim another slot
                </button>
                <button
                  type="button"
                  onClick={closeClaim}
                  className="h-11 w-full rounded-xl bg-foreground text-sm font-bold text-background transition-opacity hover:opacity-90 active:scale-[0.98]"
                >
                  See my name in the feed
                </button>
              </div>
        </div>
      )}
    </div>
  );
}
