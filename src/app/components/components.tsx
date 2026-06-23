"use client";

import { useActionState, useState, useEffect } from "react";
import { loginAction, logoutAction, generatePaymentLinkAction, getPaymentsDashboardAction } from "../actions";

// Types for the action state outputs
interface FormState {
  success?: boolean;
  error?: string | null;
  paymentLink?: string;
  customerName?: string;
  amount?: number;
}

// Payment record structure returned by Stripe
interface PaymentRecord {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  amount: number;
  currency: string;
  date: string;
}

// Helper to format date
function formatDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch (e) {
    return "Date unavailable";
  }
}

// ----------------------------------------------------
// LOGIN FORM COMPONENT
// ----------------------------------------------------
export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    async (prevState: FormState | null, formData: FormData) => {
      const res = await loginAction(prevState, formData);
      if (res.success) {
        window.location.reload();
      }
      return res;
    },
    null
  );

  return (
    <div className="w-full max-w-md p-6">
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-zinc-950/80 p-8 shadow-2xl backdrop-blur-xl transition-all hover:border-amber-500/35">
        {/* Soft Golden Background Glows */}
        <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-yellow-600/10 blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 p-[1px] shadow-lg shadow-amber-500/10">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-zinc-950">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-6 w-6 text-amber-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-200 bg-clip-text text-transparent">
            HaloAura Braids
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Deposit Portal &bull; Staff Authentication
          </p>
        </div>

        {/* Login Form */}
        <form action={formAction} className="space-y-5">
          {state?.error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-5 w-5 shrink-0"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                />
              </svg>
              <span>{state.error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-amber-400/80">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-5 w-5 text-zinc-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                  />
                </svg>
              </div>
              <input
                type="email"
                name="username"
                required
                defaultValue="user@test.com"
                placeholder="email@example.com"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-3 pl-11 pr-4 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-amber-400 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-amber-400 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-amber-400/80">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-5 w-5 text-zinc-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z"
                  />
                </svg>
              </div>
              <input
                type="password"
                name="password"
                required
                defaultValue="12345"
                placeholder="••••••••"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-3 pl-11 pr-4 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-amber-400 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-amber-400 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 py-3 text-center text-sm font-bold text-zinc-950 shadow-lg shadow-amber-500/20 active:scale-[0.98] disabled:opacity-50 transition-all hover:brightness-110 cursor-pointer"
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-zinc-950"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Logging in...
              </span>
            ) : (
              "Log In"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// DASHBOARD COMPONENT
// ----------------------------------------------------
export function Dashboard() {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"generator" | "history">("generator");
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [paymentsError, setPaymentsError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Action state for payment link generation
  const [state, formAction, isPending] = useActionState(
    async (prevState: FormState | null, formData: FormData) => {
      setCopied(false);
      return await generatePaymentLinkAction(prevState, formData);
    },
    null
  );

  // Fetch recent payments from Stripe
  const loadPaymentsHistory = async () => {
    setLoadingPayments(true);
    setPaymentsError(null);
    try {
      const res = await getPaymentsDashboardAction();
      if (res.success && res.payments) {
        setPayments(res.payments);
      } else {
        setPaymentsError(res.error || "Failed to load recent payments.");
      }
    } catch (err: any) {
      setPaymentsError("Could not retrieve transaction history.");
    } finally {
      setLoadingPayments(false);
    }
  };

  // Trigger payments load on mount and when new link is successfully created
  useEffect(() => {
    loadPaymentsHistory();
  }, [state?.success]);

  const handleLogout = async () => {
    await logoutAction();
    window.location.reload();
  };

  const handleCopyLink = () => {
    if (state?.paymentLink) {
      navigator.clipboard.writeText(state.paymentLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  // Search filter
  const filteredPayments = payments.filter((record) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      record.customerName.toLowerCase().includes(searchLower) ||
      record.email.toLowerCase().includes(searchLower) ||
      record.phone.toLowerCase().includes(searchLower)
    );
  });

  // Math sum
  const totalCollectedGBP = filteredPayments.reduce((sum, record) => sum + record.amount, 0);

  return (
    <div className="w-full max-w-2xl px-4 py-6 space-y-5">
      {/* Upper Navigation Card */}
      <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
            HaloAura Booking Admin
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:border-red-500/30 hover:bg-red-950/10 hover:text-red-400 transition-all cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.8}
            stroke="currentColor"
            className="h-3.5 w-3.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
            />
          </svg>
          Sign Out
        </button>
      </div>

      {/* Pill Switcher Tabs */}
      <div className="grid grid-cols-2 gap-1.5 p-1 bg-zinc-950/60 border border-zinc-900 rounded-2xl shadow-inner">
        <button
          onClick={() => setActiveTab("generator")}
          className={`py-3 text-xs font-bold rounded-xl transition-all cursor-pointer text-center ${
            activeTab === "generator"
              ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-zinc-950 shadow-lg font-extrabold"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/20"
          }`}
        >
          Generate Payment Link
        </button>
        <button
          onClick={() => {
            setActiveTab("history");
            loadPaymentsHistory();
          }}
          className={`py-3 text-xs font-bold rounded-xl transition-all cursor-pointer text-center ${
            activeTab === "history"
              ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-zinc-950 shadow-lg font-extrabold"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/20"
          }`}
        >
          Payment History
        </button>
      </div>

      {/* Conditional views */}
      {activeTab === "generator" ? (
        /* Main Action Panel: Link Generator */
        <div className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-zinc-950/80 p-6 md:p-8 shadow-2xl backdrop-blur-xl animate-in fade-in duration-300">
          <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
          
          {/* Generator Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-200 bg-clip-text text-transparent">
              Generate Deposit Link
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Create a Stripe Payment Link with name, email, and phone collection.
            </p>
          </div>

          {/* Generate Payment Form */}
          <form action={formAction} className="space-y-4">
            {state?.error && (
              <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-5 w-5 shrink-0 mt-0.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                  />
                </svg>
                <span>{state.error}</span>
              </div>
            )}

            {/* Customer Name Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-amber-400/80">
                Customer Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-5 w-5 text-zinc-500"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  name="customerName"
                  required
                  placeholder="Sarah Jenkins"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-3.5 pl-11 pr-4 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-amber-400 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-amber-400 transition-all"
                />
              </div>
            </div>

            {/* Deposit Amount Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-amber-400/80">
                Deposit Amount (GBP £)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                  <span className="text-sm font-semibold text-zinc-500">£</span>
                </div>
                <input
                  type="number"
                  name="depositAmount"
                  required
                  min="1"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-3.5 pl-11 pr-4 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-amber-400 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-amber-400 transition-all"
                />
              </div>
            </div>

            {/* Submit Trigger */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full overflow-hidden rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 py-3.5 text-center text-sm font-bold text-zinc-950 shadow-lg shadow-amber-500/10 active:scale-[0.98] disabled:opacity-50 transition-all hover:brightness-110 cursor-pointer"
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-zinc-950"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Creating Stripe Session...
                </span>
              ) : (
                "Generate Payment Link"
              )}
            </button>
          </form>

          {/* Generated Stripe Link Display */}
          {state?.success && state?.paymentLink && (
            <div className="mt-6 rounded-2xl border border-amber-400/25 bg-amber-400/5 p-4 md:p-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h3 className="text-sm font-bold text-amber-400 mb-1">
                Payment Link Ready
              </h3>
              <p className="text-xs text-zinc-400 mb-3">
                Copy this link and send it to{" "}
                <strong className="text-zinc-200">{state.customerName}</strong> for a deposit of{" "}
                <strong className="text-zinc-200">£{state.amount?.toFixed(2)}</strong>.
              </p>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  readOnly
                  value={state.paymentLink}
                  className="flex-1 rounded-xl border border-zinc-800 bg-zinc-950/80 px-3.5 py-2.5 text-xs text-zinc-300 outline-none select-all"
                />
                <button
                  onClick={handleCopyLink}
                  className={`flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold transition-all active:scale-[0.97] shrink-0 cursor-pointer ${
                    copied
                      ? "bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20"
                      : "bg-amber-400 text-zinc-950 hover:bg-amber-300"
                  }`}
                >
                  {copied ? (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2.5}
                        stroke="currentColor"
                        className="h-4 w-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m4.5 12.75 6 6 9-13.5"
                        />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="h-4 w-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0A2.25 2.25 0 0 1 13.5 5.25h-3a2.25 2.25 0 0 1-2.166-1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.005.049.008.1.008.152v13.5a2.25 2.25 0 0 1-2.25 2.25h-6a2.25 2.25 0 0 1-2.25-2.25V4.04c0-.05.003-.102.008-.152m7.332 0c-.017.065-.025.133-.025.203V6.75a.75.75 0 0 1-.75.75h-3a.75.75 0 0 1-.75-.75V4.09c0-.07-.008-.138-.025-.203"
                      />
                    </svg>
                    Copy Link
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
      ) : (
        /* Payment History Panel */
        <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 md:p-8 shadow-2xl backdrop-blur-xl animate-in fade-in duration-300">
          <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

          {/* Dashboard Title & Quick Stats */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl font-extrabold text-zinc-100">
                Completed Deposits
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Real-time payment records fetched from Stripe.
              </p>
            </div>
            <button
              onClick={loadPaymentsHistory}
              disabled={loadingPayments}
              className="self-start sm:self-center flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.8 text-xs font-semibold text-zinc-300 hover:border-amber-500/40 hover:bg-zinc-900 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className={`h-3.5 w-3.5 ${loadingPayments ? "animate-spin text-amber-400" : ""}`}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                />
              </svg>
              Refresh
            </button>
          </div>

          {/* Quick Search & Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            <div className="sm:col-span-2 relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                  className="h-4 w-4 text-zinc-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637Z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by client name, email, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-zinc-800/80 bg-zinc-900/40 py-2.5 pl-9 pr-4 text-xs text-zinc-200 outline-none focus:border-amber-500/40 focus:bg-zinc-900 transition-all"
              />
            </div>
            
            <div className="rounded-xl border border-amber-500/10 bg-amber-500/5 px-4 py-2 flex-col items-start justify-center">
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-500/80 block">
                Total Sum ({filteredPayments.length})
              </span>
              <span className="text-sm font-black text-amber-400 mt-0.5 block">
                £{totalCollectedGBP.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Payments list container */}
          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {loadingPayments ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-2">
                <svg
                  className="animate-spin h-6 w-6 text-amber-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span className="text-xs text-zinc-500 font-medium">
                  Fetching sessions...
                </span>
              </div>
            ) : paymentsError ? (
              <div className="text-center py-8 border border-zinc-800 bg-zinc-900/10 rounded-2xl p-4">
                <p className="text-xs text-red-400 mb-2">{paymentsError}</p>
                <button
                  onClick={loadPaymentsHistory}
                  className="text-xs font-semibold text-amber-400 underline hover:text-amber-300"
                >
                  Try Again
                </button>
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-zinc-800 rounded-2xl">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="mx-auto h-8 w-8 text-zinc-700"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5h.007m-.007 3h.007m-.007 3h.007m-3.75 3h15M19.5 3.75c.9 0 1.62.72 1.62 1.62v13.5c0 .9-.72 1.62-1.62 1.62h-15c-.9 0-1.62-.72-1.62-1.62V5.37c0-.9.72-1.62 1.62-1.62h15ZM2.25 9h19.5"
                  />
                </svg>
                <p className="mt-3 text-xs text-zinc-500 font-medium">
                  {searchQuery ? "No matching payments found." : "No successful deposits recorded."}
                </p>
              </div>
            ) : (
              filteredPayments.map((record) => (
                <div
                  key={record.id}
                  className="group relative rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-4 transition-all hover:border-zinc-800 hover:bg-zinc-900/60"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-bold text-zinc-200 group-hover:text-zinc-50 transition-colors">
                        {record.customerName}
                      </h4>
                      <span className="text-[10px] text-zinc-500 block mt-0.5">
                        {formatDate(record.date)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-amber-400">
                        £{record.amount.toFixed(2)}
                      </span>
                      <span className="text-[9px] uppercase font-bold text-emerald-500 block mt-0.5 bg-emerald-500/10 rounded-full px-1.5 py-0.2 shrink-0">
                        Paid
                      </span>
                    </div>
                  </div>

                  {/* Sub details shown as links for easy tapping on mobile */}
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2.5 border-t border-zinc-900">
                    <a
                      href={`mailto:${record.email}`}
                      className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-amber-300 transition-all truncate"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.8}
                        stroke="currentColor"
                        className="h-3.5 w-3.5 text-zinc-600 shrink-0"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                        />
                      </svg>
                      {record.email}
                    </a>

                    <a
                      href={`tel:${record.phone}`}
                      className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-amber-300 transition-all"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.8}
                        stroke="currentColor"
                        className="h-3.5 w-3.5 text-zinc-600 shrink-0"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.824-1.802-5.186-4.168-7.987-7.002l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
                        />
                      </svg>
                      {record.phone}
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
