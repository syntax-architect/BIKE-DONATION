"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Check, Download, Lock, RefreshCw, Shield, Trash2, XCircle } from "lucide-react";
import { formatINR, wrapAreaCm2 } from "@/lib/tvs/constants";
import { formatStickerTitle } from "@/lib/tvs/shareCard";

interface AdminRow {
  id: string;
  mode: string;
  name: string;
  partnerName: string | null;
  handle: string | null;
  linkUrl: string | null;
  city: string | null;
  zone: string;
  amount: number;
  isFounder: boolean;
  status: string;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  createdAt: string;
}

export default function AdminPage() {
  const [pin, setPin] = useState("");
  const [unlockedPin, setUnlockedPin] = useState<string | null>(null);
  const [rows, setRows] = useState<AdminRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRows = useCallback(async (activePin: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/claims", {
        headers: { "x-admin-pin": activePin },
        cache: "no-store",
      });
      if (res.status === 401) {
        setError("Incorrect Admin PIN.");
        setUnlockedPin(null);
        sessionStorage.removeItem("rr310_admin_pin");
        return;
      }
      const data = (await res.json()) as { rows: AdminRow[] };
      setRows(data.rows ?? []);
      setUnlockedPin(activePin);
      sessionStorage.setItem("rr310_admin_pin", activePin);
    } catch {
      setError("Failed to fetch ledger.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem("rr310_admin_pin");
    if (!saved) return;
    let cancelled = false;
    fetch("/api/admin/claims", {
      headers: { "x-admin-pin": saved },
      cache: "no-store",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { rows?: AdminRow[] } | null) => {
        if (!cancelled && data?.rows) {
          setRows(data.rows);
          setUnlockedPin(saved);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const updateStatus = async (id: string, status: "CONFIRMED" | "PENDING" | "REJECTED") => {
    if (!unlockedPin) return;
    await fetch("/api/admin/claims", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-pin": unlockedPin },
      body: JSON.stringify({ id, status }),
    });
    void loadRows(unlockedPin);
  };

  const removeRow = async (id: string) => {
    if (!unlockedPin) return;
    await fetch(`/api/admin/claims?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { "x-admin-pin": unlockedPin },
    });
    void loadRows(unlockedPin);
  };

  const downloadCsv = async () => {
    if (!unlockedPin) return;
    const res = await fetch("/api/admin/claims?format=csv", {
      headers: { "x-admin-pin": unlockedPin },
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rr310-wrap-confirmed.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!unlockedPin) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
        <div className="glass card-pop rounded-2xl p-6 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-racing/15 text-racing">
            <Lock className="h-5 w-5" />
          </div>
          <h1 className="mt-4 font-display text-xl font-bold">Owner Ledger &amp; Wrap Export</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Enter <code className="font-mono">ADMIN_PIN</code> from <code className="font-mono">.env</code> (default: 3100)
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void loadRows(pin);
            }}
            className="mt-5 space-y-3"
          >
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Admin PIN"
              className="h-11 w-full rounded-xl border bg-background px-4 text-center font-mono text-base tracking-widest outline-none focus:border-racing"
            />
            {error && <p className="text-xs font-semibold text-racing">{error}</p>}
            <button
              type="submit"
              disabled={loading || !pin}
              className="btn-racing h-11 w-full rounded-xl text-sm font-bold text-white disabled:opacity-50"
            >
              {loading ? "Checking…" : "Unlock Ledger"}
            </button>
          </form>
          <Link href="/" className="mt-4 inline-block text-xs text-muted-foreground hover:text-foreground">
            ← Back to site
          </Link>
        </div>
      </main>
    );
  }

  const confirmedRows = rows.filter((r) => r.status === "CONFIRMED");
  const confirmedSum = confirmedRows.reduce((s, r) => s + r.amount, 0);
  const pendingCount = rows.filter((r) => r.status === "PENDING").length;

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-racing">
            <Shield className="h-4 w-4" /> Owner Admin
          </div>
          <h1 className="mt-1 font-display text-2xl font-bold sm:text-3xl">
            Verified Razorpay Ledger &amp; Vinyl Export
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void loadRows(unlockedPin)}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border px-3.5 text-xs font-bold hover:bg-muted"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
          <button
            type="button"
            onClick={() => void downloadCsv()}
            className="btn-racing inline-flex h-10 items-center gap-1.5 rounded-xl px-4 text-xs font-bold text-white"
          >
            <Download className="h-3.5 w-3.5" /> Export Vinyl CSV
          </button>
          <Link
            href="/"
            className="inline-flex h-10 items-center rounded-xl border px-3.5 text-xs font-bold hover:bg-muted"
          >
            View Site
          </Link>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="glass rounded-2xl p-4">
          <div className="text-xs text-muted-foreground">Confirmed Raised</div>
          <div className="mt-1 font-display text-2xl font-bold text-racing">{formatINR(confirmedSum)}</div>
        </div>
        <div className="glass rounded-2xl p-4">
          <div className="text-xs text-muted-foreground">Confirmed Slots</div>
          <div className="mt-1 font-display text-2xl font-bold">{confirmedRows.length}</div>
        </div>
        <div className="glass rounded-2xl p-4">
          <div className="text-xs text-muted-foreground">Pending Orders</div>
          <div className="mt-1 font-display text-2xl font-bold text-vip-bright">{pendingCount}</div>
        </div>
      </div>

      <div className="glass mt-6 overflow-x-auto rounded-2xl border">
        <table className="w-full text-left text-xs">
          <thead className="border-b bg-muted/50 text-[10px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-3">Lock / Name</th>
              <th className="p-3">Mode / Link</th>
              <th className="p-3">City</th>
              <th className="p-3">Zone</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Razorpay ID</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-muted/30">
                <td className="p-3 font-semibold">
                  <div>{formatStickerTitle(r.name, r.partnerName, r.mode)}</div>
                  <div className="font-mono text-[10px] text-muted-foreground">
                    {r.handle || `RR31-${r.id.slice(-6).toUpperCase()}`}
                  </div>
                </td>
                <td className="p-3">
                  <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] font-bold">
                    {r.mode}
                  </span>
                  {r.linkUrl && (
                    <div className="mt-0.5 max-w-[160px] truncate text-[10px] text-[#E2E8F0]">
                      {r.linkUrl}
                    </div>
                  )}
                </td>
                <td className="p-3">{r.city || "—"}</td>
                <td className="p-3">
                  {r.zone} ({wrapAreaCm2(r.amount, r.isFounder)} cm²)
                </td>
                <td className="p-3 font-bold">{formatINR(r.amount)}</td>
                <td className="p-3 font-mono text-[10px]">
                  {r.razorpayPaymentId || r.razorpayOrderId || "—"}
                </td>
                <td className="p-3">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                      r.status === "CONFIRMED"
                        ? "border-white/[0.08] bg-white/[0.04] text-[#F8FAFC]"
                        : r.status === "REJECTED"
                          ? "border-racing/25 bg-racing/15 text-racing"
                          : "border-[#F59E0B]/25 bg-[#F59E0B]/15 text-[#F59E0B]"
                    }`}
                  >
                    {r.status === "CONFIRMED" && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" aria-hidden />
                    )}
                    {r.status}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <div className="inline-flex gap-1">
                    <button
                      type="button"
                      title="Mark Confirmed"
                      onClick={() => void updateStatus(r.id, "CONFIRMED")}
                      className="rounded-lg border border-white/[0.08] p-1.5 text-[#E2E8F0] hover:bg-white/10"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Mark Rejected"
                      onClick={() => void updateStatus(r.id, "REJECTED")}
                      className="rounded-lg border p-1.5 text-vip-bright hover:bg-vip/15"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Delete"
                      onClick={() => void removeRow(r.id)}
                      className="rounded-lg border p-1.5 text-racing hover:bg-racing/15"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="p-8 text-center text-muted-foreground">
                  No contributions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
