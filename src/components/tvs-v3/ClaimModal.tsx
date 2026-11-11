"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Download,
  Heart,
  Link2,
  Loader2,
  Lock,
  PartyPopper,
  Share2,
  User,
  Zap,
} from "lucide-react";
import {
  CLAN_CITIES,
  FOUNDER_LIMIT,
  QUICK_AMOUNTS,
  ZONES,
  ZONE_MAP,
  formatINR,
  sanitizePromoUrl,
  wrapAreaCm2,
  zoneForAmount,
  type ClaimMode,
  type ZoneId,
} from "@/lib/tvs/constants";
import { TIER_ANCHOR } from "@/lib/tvs/psych";
import { downloadWrapPass, formatStickerTitle } from "@/lib/tvs/shareCard";
import { badgeFor } from "@/lib/tvs/v3";
import { totalBackers, useClaimStore, useLiveStore } from "@/lib/tvs/store";
import { burstConfetti } from "@/lib/tvs/confetti";
import type { ClaimResponse } from "@/lib/tvs/types";
import { VinylSticker } from "./VinylSticker";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, cb: (res: unknown) => void) => void;
    };
  }
}

type Step = "details" | "pay" | "success";

interface OrderInit {
  flow: "razorpay" | "sandbox";
  contributionId: string;
  orderId: string;
  amountPaise: number;
  currency: string;
  keyId?: string;
}

function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const MODES: Array<{ id: ClaimMode; label: string; icon: typeof Heart }> = [
  { id: "SOLO", label: "Solo Rider", icon: User },
  { id: "COUPLE", label: "Bro / Couple", icon: Heart },
  { id: "PROMO", label: "Promote @Page", icon: Link2 },
];

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

function StoryPassPreview({
  name,
  partnerName,
  handle,
  city,
  mode,
  zone,
  amount,
  isFounder,
}: {
  name: string;
  partnerName: string;
  handle: string;
  city: string;
  mode: ClaimMode;
  zone: ZoneId;
  amount: number;
  isFounder: boolean;
}) {
  const z = ZONE_MAP[zone];
  const cm2 = wrapAreaCm2(amount, isFounder);
  const title =
    mode === "COUPLE" && !name.trim() && !partnerName.trim()
      ? "ROHAN × PRIYA"
      : formatStickerTitle(name, partnerName, mode);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#11131A] p-3.5 text-[#F8FAFC] shadow-lg">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-[#EF4444]" />
      <div className="flex items-center gap-3">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-white/[0.08] bg-[#090A0F]">
          <Image
            src="/bike/studio-dyna-clean.png"
            alt="RR 310 Story Certificate preview"
            fill
            sizes="80px"
            className="object-contain p-1"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2 text-[9px] font-bold uppercase tracking-wider text-racing">
            <span>Story Certificate Preview</span>
            <span className="rounded border border-white/[0.08] bg-[#090A0F] px-1.5 py-0.5 font-mono text-[#F8FAFC]">
              {z.short} • {cm2} cm²
            </span>
          </div>
          <div className="mt-1 truncate font-display text-base font-bold">{title}</div>
          <div className="truncate font-mono text-[10px] text-[#94A3B8]">
            {handle.trim() || `${city || "India"} • ${formatINR(amount)}`}
          </div>
          <div className="mt-1.5 inline-flex items-center gap-1 rounded bg-racing/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#F87171]">
            <Lock className="h-2.5 w-2.5" /> Watermarked — unlocks instant PNG after pay
          </div>
        </div>
      </div>
    </div>
  );
}

function ClaimModalBody() {
  const {
    zoneId,
    amount: prefillAmount,
    startStep,
    mode: storeMode,
    previewName,
    partnerName: storePartner,
    previewHandle,
    city: storeCity,
    setMode: syncMode,
    setPreviewName,
    setPartnerName: syncPartner,
    setPreviewHandle,
    setCity: syncCity,
    closeClaim,
    setClaimedCode,
  } = useClaimStore();
  const refresh = useLiveStore((s) => s.refresh);
  const stats = useLiveStore((s) => s.stats);

  const backers = totalBackers(stats);
  const isFounderOffer = (stats?.foundersRemaining ?? Math.max(0, FOUNDER_LIMIT - backers)) > 0;

  const resolvedAmount =
    prefillAmount ?? (zoneId ? ZONE_MAP[zoneId].price : storeMode === "PROMO" ? 50 : 20);
  const resolvedZone = zoneId ?? zoneForAmount(resolvedAmount);
  const initialIsQuick = QUICK_AMOUNTS.includes(
    resolvedAmount as (typeof QUICK_AMOUNTS)[number],
  );

  const [mode, setMode] = useState<ClaimMode>(storeMode);
  const [name, setName] = useState(() => previewName);
  const [partnerName, setPartnerName] = useState(() => storePartner);
  const [handle, setHandle] = useState(() => previewHandle);
  const [city, setCity] = useState(() => storeCity || "Mumbai");
  const [customCityMode, setCustomCityMode] = useState(
    () => Boolean(storeCity && !CLAN_CITIES.includes(storeCity as (typeof CLAN_CITIES)[number])),
  );
  const [zone, setZone] = useState<ZoneId>(resolvedZone);
  const [amount, setAmount] = useState<number>(resolvedAmount);
  const [customMode, setCustomMode] = useState(!initialIsQuick);
  const [customVal, setCustomVal] = useState(initialIsQuick ? "" : String(resolvedAmount));

  const detailsInitiallyValid =
    previewName.trim().length >= 2 &&
    (storeMode !== "COUPLE" || storePartner.trim().length >= 2) &&
    (storeMode !== "PROMO" || Boolean(sanitizePromoUrl(previewHandle, previewHandle)));

  const [step, setStep] = useState<Step>(() =>
    startStep === "pay" && detailsInitiallyValid ? "pay" : "details",
  );

  const [order, setOrder] = useState<OrderInit | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [waitingWebhook, setWaitingWebhook] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [code, setCode] = useState<string>("");
  const [cm2, setCm2] = useState<number>(0);
  const [confirmedFounder, setConfirmedFounder] = useState<boolean>(isFounderOffer);

  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const zoneCfg = ZONE_MAP[zone];

  const applyAmount = useCallback(
    (v: number) => {
      const val = Math.max(10, Math.round(v || 0));
      setAmount(val);
      setZone(zoneForAmount(val));
    },
    [],
  );

  const detailsValid =
    name.trim().length >= 2 &&
    (mode !== "COUPLE" || partnerName.trim().length >= 2) &&
    (mode !== "PROMO" || Boolean(sanitizePromoUrl(handle, handle))) &&
    amount >= 10 &&
    amount >= zoneCfg.price;

  const finishConfirmed = useCallback(
    (res: ClaimResponse) => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
      setWaitingWebhook(false);
      setCode(res.code);
      setCm2(res.cm2);
      setConfirmedFounder(Boolean(res.claim.isFounder));
      setClaimedCode(res.code);
      setStep("success");
      void refresh();
      void burstConfetti();
      toast.success("Razorpay Webhook Confirmed! Your Story Certificate is unlocked.");
    },
    [refresh, setClaimedCode],
  );

  const startWebhookPolling = useCallback(
    (contributionId: string) => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      setWaitingWebhook(true);
      pollTimerRef.current = setInterval(async () => {
        try {
          const r = await fetch(`/api/claims/${contributionId}`, { cache: "no-store" });
          if (!r.ok) return;
          const d = (await r.json()) as { status: string } & Partial<ClaimResponse>;
          if (d.status === "CONFIRMED" && d.code && d.claim && typeof d.cm2 === "number") {
            finishConfirmed({ claim: d.claim, code: d.code, cm2: d.cm2 });
          }
        } catch {
          /* keep polling */
        }
      }, 1500);
    },
    [finishConfirmed],
  );

  useEffect(() => {
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, []);

  const launchRazorpayCheckout = useCallback(
    async (ord: OrderInit) => {
      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay || !ord.keyId) {
        toast.error("Could not load Razorpay Checkout script. Check your network.");
        return;
      }

      const rzp = new window.Razorpay({
        key: ord.keyId,
        amount: ord.amountPaise,
        currency: ord.currency,
        name: "The People's Apache RR 310",
        description: `${zoneCfg.short} (${wrapAreaCm2(amount, isFounderOffer)} cm²)`,
        order_id: ord.orderId,
        prefill: { name: name.trim() },
        notes: { contributionId: ord.contributionId, zone, mode, city },
        theme: { color: "#EF4444" },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          setWaitingWebhook(true);
          try {
            const res = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ contributionId: ord.contributionId, ...response }),
            });
            if (res.ok) {
              finishConfirmed((await res.json()) as ClaimResponse);
            } else {
              startWebhookPolling(ord.contributionId);
            }
          } catch {
            startWebhookPolling(ord.contributionId);
          }
        },
        modal: {
          ondismiss: () => {
            startWebhookPolling(ord.contributionId);
          },
        },
      });

      rzp.open();
      startWebhookPolling(ord.contributionId);
    },
    [amount, city, finishConfirmed, isFounderOffer, mode, name, startWebhookPolling, zone, zoneCfg.short],
  );

  const createOrderAndProceed = useCallback(async () => {
    setLoadingOrder(true);
    setOrderError(null);
    try {
      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          name: name.trim(),
          partnerName: mode === "COUPLE" ? partnerName.trim() : null,
          handle: handle.trim() || null,
          linkUrl: handle.trim() || null,
          city: city.trim() || null,
          zone,
          amount,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setOrderError(data.error ?? "Could not create Razorpay order.");
        return;
      }
      const ord = data as OrderInit;
      setOrder(ord);
      if (ord.flow === "razorpay") {
        await launchRazorpayCheckout(ord);
      }
    } catch {
      setOrderError("Network error while creating payment order.");
    } finally {
      setLoadingOrder(false);
    }
  }, [amount, city, handle, launchRazorpayCheckout, mode, name, partnerName, zone]);

  const autoStartedRef = useRef(false);
  useEffect(() => {
    if (step === "pay" && !order && !loadingOrder && !autoStartedRef.current) {
      autoStartedRef.current = true;
      void createOrderAndProceed();
    }
  }, [createOrderAndProceed, loadingOrder, order, step]);

  const gotoPay = () => {
    if (!detailsValid) {
      toast.error(
        name.trim().length < 2
          ? "Add a name (2–25 chars)."
          : mode === "COUPLE" && partnerName.trim().length < 2
            ? "Add your partner or best bro's name."
            : mode === "PROMO"
              ? "Add your @Instagram, YouTube, X, or website URL."
              : `Minimum for ${zoneCfg.short} is ${formatINR(zoneCfg.price)}.`,
      );
      return;
    }
    autoStartedRef.current = true;
    setOrder(null);
    setStep("pay");
    void createOrderAndProceed();
  };

  const simulateWebhookPayment = async () => {
    if (!order) return;
    setWaitingWebhook(true);
    try {
      const res = await fetch("/api/razorpay/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contributionId: order.contributionId,
          orderId: order.orderId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Sandbox simulation failed.");
        setWaitingWebhook(false);
        return;
      }
      finishConfirmed(data as ClaimResponse);
    } catch {
      toast.error("Network hiccup during simulation.");
      setWaitingWebhook(false);
    }
  };

  const resetAll = () => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    autoStartedRef.current = false;
    setOrder(null);
    setOrderError(null);
    setWaitingWebhook(false);
    setStep("details");
    setName("");
    setPartnerName("");
    setHandle("");
    setPreviewName("");
    syncPartner("");
    setPreviewHandle("");
  };

  return (
    <div className="px-5 pb-6 pt-5 sm:px-7">
      <DialogHeader className="pb-1 text-left">
        <DialogTitle className="font-display text-xl font-bold tracking-tight">
          {step === "details" && "Customize your slot & Story Certificate"}
          {step === "pay" && `Razorpay Checkout — ${formatINR(amount)}`}
          {step === "success" && "Unlocked & Printed on the Bike!"}
        </DialogTitle>
        {step !== "success" && (
          <p className="text-xs text-muted-foreground">
            {isFounderOffer
              ? "Founder Batch #01: 2× wrap area FREE + clickable link. Zero UTR typing."
              : "1-tap Razorpay UPI payment. Confirmed automatically via webhook."}
          </p>
        )}
      </DialogHeader>

      {step === "details" && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-3 gap-1.5 rounded-xl bg-muted p-1">
            {MODES.map((m) => {
              const Icon = m.icon;
              const active = mode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setMode(m.id);
                    syncMode(m.id);
                    if (m.id === "PROMO" && amount < 50) {
                      setAmount(50);
                      setZone("FAIRING");
                      setCustomMode(false);
                    }
                  }}
                  className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all ${
                    active ? "bg-racing text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {m.label}
                </button>
              );
            })}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 flex items-baseline justify-between text-xs font-semibold">
                <span>
                  {mode === "COUPLE"
                    ? "Your name"
                    : mode === "PROMO"
                      ? "Creator / Brand name"
                      : "Printed name"}
                </span>
                <span className="tnum text-[10px] text-muted-foreground">{name.length}/25</span>
              </label>
              <Input
                value={name}
                onChange={(e) => {
                  const v = e.target.value.slice(0, 25);
                  setName(v);
                  setPreviewName(v);
                }}
                placeholder={mode === "PROMO" ? "e.g. Apex Moto" : "e.g. Rohan"}
                maxLength={25}
                autoFocus
              />
            </div>

            {mode === "COUPLE" ? (
              <div>
                <label className="mb-1 flex items-baseline justify-between text-xs font-semibold">
                  <span>Partner / Best Bro&rsquo;s name</span>
                  <span className="tnum text-[10px] text-muted-foreground">
                    {partnerName.length}/25
                  </span>
                </label>
                <Input
                  value={partnerName}
                  onChange={(e) => {
                    const v = e.target.value.slice(0, 25);
                    setPartnerName(v);
                    syncPartner(v);
                  }}
                  placeholder="e.g. Priya or Kabir"
                  maxLength={25}
                />
              </div>
            ) : (
              <div>
                <label className="mb-1 flex items-baseline justify-between text-xs font-semibold">
                  <span>
                    {mode === "PROMO"
                      ? "@IG, YouTube, X or URL"
                      : "Social @handle / URL (clickable)"}
                  </span>
                  <span className="tnum text-[10px] text-muted-foreground">{handle.length}/24</span>
                </label>
                <Input
                  value={handle}
                  onChange={(e) => {
                    const v = e.target.value.slice(0, 24);
                    setHandle(v);
                    setPreviewHandle(v);
                  }}
                  placeholder="@handle or https://..."
                  maxLength={24}
                />
              </div>
            )}
          </div>

          {mode === "COUPLE" && (
            <div>
              <label className="mb-1 block text-xs font-semibold">
                Optional @handle or URL (makes your tile clickable on Wrap Wall)
              </label>
              <Input
                value={handle}
                onChange={(e) => {
                  const v = e.target.value.slice(0, 24);
                  setHandle(v);
                  setPreviewHandle(v);
                }}
                placeholder="@yourhandle or https://..."
                maxLength={24}
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold">
              City / College / Clan (Turf War scoreboard)
            </label>
            <div className="flex gap-2">
              <select
                value={customCityMode ? "__CUSTOM__" : city}
                onChange={(e) => {
                  if (e.target.value === "__CUSTOM__") {
                    setCustomCityMode(true);
                    setCity("");
                    syncCity("");
                  } else {
                    setCustomCityMode(false);
                    setCity(e.target.value);
                    syncCity(e.target.value);
                  }
                }}
                className="h-10 rounded-xl border bg-background px-3 text-xs font-semibold outline-none focus:border-racing"
              >
                {CLAN_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                <option value="__CUSTOM__">Custom City / College…</option>
              </select>
              {customCityMode && (
                <Input
                  value={city}
                  onChange={(e) => {
                    const v = e.target.value.slice(0, 24);
                    setCity(v);
                    syncCity(v);
                  }}
                  placeholder="e.g. IIT Delhi / Surat"
                  maxLength={24}
                />
              )}
            </div>
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
                      setCustomMode(!QUICK_AMOUNTS.includes(z.price as (typeof QUICK_AMOUNTS)[number]));
                      setCustomVal("");
                    }
                  }}
                  className={`flex items-center justify-between rounded-xl border px-3.5 py-2 text-left transition-all ${
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
          </div>

          <StoryPassPreview
            name={name}
            partnerName={partnerName}
            handle={handle}
            city={city}
            mode={mode}
            zone={zone}
            amount={amount}
            isFounder={isFounderOffer}
          />

          <button
            type="button"
            onClick={gotoPay}
            disabled={!detailsValid}
            className="btn-racing flex h-12 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold text-white transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 sm:text-base"
          >
            <Zap className="h-4.5 w-4.5 shrink-0" />
            Unlock Unwatermarked Story Pass + Print ({formatINR(amount)})
          </button>
        </div>
      )}

      {step === "pay" && (
        <div className="mt-4 space-y-4">
          <VinylSticker
            name={name}
            partnerName={partnerName}
            handle={handle}
            city={city}
            mode={mode}
            zone={zone}
            amount={amount}
            isFounder={isFounderOffer}
            watermarked
            className="w-full"
          />

          <div className="rounded-2xl border bg-card p-5 text-center">
            {loadingOrder ? (
              <div className="flex flex-col items-center py-6">
                <Loader2 className="h-8 w-8 animate-spin text-racing" />
                <p className="mt-3 text-sm font-semibold">Creating Razorpay order…</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Preparing 1-tap UPI checkout (zero UTR typing)
                </p>
              </div>
            ) : orderError ? (
              <div className="py-4">
                <p className="text-sm font-semibold text-racing">{orderError}</p>
                <button
                  type="button"
                  onClick={() => void createOrderAndProceed()}
                  className="btn-racing mt-4 h-10 rounded-xl px-5 text-xs font-bold text-white"
                >
                  Retry Order
                </button>
              </div>
            ) : order?.flow === "razorpay" ? (
              <div className="space-y-3 py-2">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-racing/15 text-racing">
                  {waitingWebhook ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <CreditCard className="h-6 w-6" />
                  )}
                </div>
                <div>
                  <h4 className="font-display text-base font-bold">
                    {waitingWebhook
                      ? "Waiting for Razorpay webhook confirmation…"
                      : "Complete payment in Razorpay"}
                  </h4>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Order <span className="font-mono">{order.orderId}</span> • Pay via GPay,
                    PhonePe, Paytm, or UPI. Success happens automatically when the webhook arrives.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void launchRazorpayCheckout(order)}
                  className="btn-racing flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-white"
                >
                  <Zap className="h-4 w-4" /> Open Razorpay Payment Page
                </button>
              </div>
            ) : order?.flow === "sandbox" ? (
              <div className="space-y-3 py-1">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-vip/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-vip-bright">
                  <Lock className="h-3 w-3" /> Localhost Razorpay Sandbox
                </div>
                <div className="font-display text-2xl font-bold">{formatINR(amount)}</div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Order <span className="font-mono text-foreground">{order.orderId}</span> is saved
                  as <code className="font-mono">PENDING</code>. Add Razorpay keys in{" "}
                  <code className="font-mono">.env</code> for real UPI payments—or test the webhook
                  flow now:
                </p>
                <button
                  type="button"
                  disabled={waitingWebhook}
                  onClick={simulateWebhookPayment}
                  className="btn-racing flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-white transition-transform active:scale-[0.98] disabled:opacity-60"
                >
                  {waitingWebhook ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Firing Webhook…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" /> Pay {formatINR(amount)} &amp; Trigger Webhook
                    </>
                  )}
                </button>
              </div>
            ) : null}

            <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#22C55E]" aria-hidden />
              Secured by Razorpay HMAC-SHA256 Webhook Verification
            </div>
          </div>

          <button
            type="button"
            onClick={() => setStep("details")}
            className="flex h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-white/[0.08] text-sm font-bold transition-colors hover:bg-white/[0.05]"
          >
            <ArrowLeft className="h-4 w-4" /> Edit Name / Zone / Amount
          </button>
        </div>
      )}

      {step === "success" && (
        <div className="mt-2 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-racing/30 bg-racing/15 text-racing">
            <PartyPopper className="h-7 w-7" />
          </div>
          <h3 className="mt-3 font-display text-2xl font-bold">
            {confirmedFounder ? "Founder Batch Pass Unlocked! (2×)" : `Welcome, ${badgeFor(amount).title}`}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Razorpay webhook verified • Live on the Wrap Wall &amp; Public Ledger
          </p>

          <div className="mt-4">
            <VinylSticker
              name={name}
              partnerName={partnerName}
              handle={handle}
              city={city}
              mode={mode}
              zone={zone}
              amount={amount}
              isFounder={confirmedFounder}
              className="w-full"
            />
          </div>

          <div className="mx-auto mt-3 grid max-w-sm grid-cols-2 gap-2.5">
            <div className="rounded-xl border bg-card p-3">
              <div className="font-mono text-sm font-bold text-racing">{code}</div>
              <div className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                Official pass code
              </div>
            </div>
            <div className="rounded-xl border bg-card p-3">
              <div className="font-display text-sm font-bold">
                {cm2} cm² {confirmedFounder ? "(2×)" : ""}
              </div>
              <div className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                Wrap real estate
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                void downloadWrapPass({
                  name: name.trim(),
                  partnerName: mode === "COUPLE" ? partnerName.trim() : null,
                  handle: handle.trim() || null,
                  city: city.trim() || null,
                  mode,
                  zone,
                  amount,
                  code,
                  cm2,
                  isFounder: confirmedFounder,
                });
                toast.success("Unwatermarked Story Pass PNG downloaded!");
              }}
              className="btn-racing flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-bold text-white active:scale-[0.98]"
            >
              <Download className="h-4 w-4" /> Download Story Pass
            </button>
            <button
              type="button"
              onClick={async () => {
                const refUrl = `${window.location.origin}/?by=${encodeURIComponent(name.trim())}`;
                const shareText =
                  mode === "COUPLE" && partnerName.trim()
                    ? `I locked "${name.trim().toUpperCase()} × ${partnerName.trim().toUpperCase()}" on a real 38 HP Apache RR 310! Lock yours for ₹10–₹20: ${refUrl}`
                    : `I claimed ${cm2} cm² on a real Apache RR 310 (Pass ${code})! Lock yours from ₹10: ${refUrl}`;
                try {
                  if (navigator.share) {
                    await navigator.share({
                      title: "The People's Apache RR 310",
                      text: shareText,
                      url: refUrl,
                    });
                  } else {
                    await navigator.clipboard.writeText(shareText);
                    toast.success("Invite link copied — send it on WhatsApp or IG!");
                  }
                } catch {
                  /* cancelled */
                }
              }}
              className="flex h-11 items-center justify-center gap-2 rounded-xl border border-racing/30 bg-racing/5 text-sm font-bold text-racing transition-colors hover:bg-racing hover:text-white active:scale-[0.98]"
            >
              <Share2 className="h-4 w-4" /> Send to Partner / Friends
            </button>
          </div>

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={resetAll}
              className="flex h-10 w-full items-center justify-center rounded-xl border text-xs font-bold transition-colors hover:bg-muted"
            >
              Lock another spot
            </button>
            <button
              type="button"
              onClick={closeClaim}
              className="h-10 w-full rounded-xl bg-foreground text-xs font-bold text-background transition-opacity hover:opacity-90 active:scale-[0.98]"
            >
              View on Wrap Wall
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
