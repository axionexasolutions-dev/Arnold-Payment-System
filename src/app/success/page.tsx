import Stripe from "stripe";
import { sendPaymentNotificationEmailAction } from "../actions";

interface PageProps {
  searchParams: Promise<{
    session_id?: string;
  }>;
}

export default async function SuccessPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const sessionId = params.session_id;

  let customerName = "Valued Client";
  let email = "";
  let phone = "";
  let amount = 0;
  let currency = "GBP";
  let errorMsg: string | null = null;
  let emailStatus: { success: boolean; error?: string } | null = null;

  if (sessionId) {
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (stripeSecret) {
      try {
        const stripe = new Stripe(stripeSecret);
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        
        customerName = session.customer_details?.name || session.metadata?.customerName || "Valued Client";
        email = session.customer_details?.email || "";
        phone = session.customer_details?.phone || "";
        amount = session.amount_total ? session.amount_total / 100 : 0;
        currency = session.currency?.toUpperCase() || "GBP";

        // Trigger email dispatch to stylist
        const emailRes = await sendPaymentNotificationEmailAction(sessionId);
        if (!emailRes.success && emailRes.error) {
          emailStatus = { success: false, error: emailRes.error };
        } else {
          emailStatus = { success: true };
        }
      } catch (err: any) {
        console.error("Error retrieving checkout session:", err);
        errorMsg = "Transaction details could not be loaded.";
      }
    } else {
      errorMsg = "Stripe API key is not configured.";
    }
  } else {
    errorMsg = "No transaction reference was provided.";
  }

  const currencySymbol = currency === "GBP" ? "£" : currency === "CAD" ? "C$" : "$";

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-[#050505] text-zinc-100 overflow-hidden font-sans">
      {/* Ambient luxury glows */}
      <div className="absolute top-1/4 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-emerald-500/5 to-amber-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 h-[300px] w-[300px] rounded-full bg-amber-500/[0.02] blur-3xl pointer-events-none" />

      {/* Decorative Grid Overlay */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"
        style={{
          maskImage: "radial-gradient(ellipse 60% 50% at 50% 50%, #000 60%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 60% 50% at 50% 50%, #000 60%, transparent 100%)"
        }}
      />

      <div className="relative z-10 w-full max-w-md p-4 animate-in fade-in duration-500">
        <div className="relative overflow-hidden rounded-3xl border border-emerald-500/25 bg-zinc-950/80 p-8 shadow-2xl backdrop-blur-xl">
          {/* Golden/Emerald Gradient Circle overlay */}
          <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          {/* Success Checkmark Circle */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 p-[1px] shadow-lg shadow-emerald-500/10">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-zinc-950">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="h-9 w-9 text-emerald-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m4.5 12.75 6 6 9-13.5"
                />
              </svg>
            </div>
          </div>

          {/* Success message */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-200 via-emerald-400 to-amber-200 bg-clip-text text-transparent">
              Payment Successful!
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              Thank you for booking with <strong className="text-amber-400">HaloAura Braids</strong>
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 rounded-xl border border-amber-500/10 bg-amber-500/5 p-3 text-xs text-amber-500 text-center">
              {errorMsg}
            </div>
          )}

          {/* Receipt Details Card */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-4 mb-6">
            <div className="flex justify-between items-center pb-3.5 border-b border-zinc-800/60">
              <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Client Name</span>
              <span className="text-sm font-bold text-zinc-200 text-right">{customerName}</span>
            </div>

            {email && (
              <div className="flex justify-between items-center pb-3.5 border-b border-zinc-800/60">
                <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Email</span>
                <span className="text-xs font-semibold text-zinc-300 text-right truncate max-w-[200px]">{email}</span>
              </div>
            )}

            {phone && (
              <div className="flex justify-between items-center pb-3.5 border-b border-zinc-800/60">
                <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Phone</span>
                <span className="text-xs font-semibold text-zinc-300 text-right">{phone}</span>
              </div>
            )}

            {amount > 0 && (
              <div className="flex justify-between items-center pb-3.5 border-b border-zinc-800/60">
                <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Amount Paid</span>
                <span className="text-sm font-black text-amber-400">
                  {currencySymbol}{amount.toFixed(2)} {currency}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center pb-3.5 border-b border-zinc-800/60">
              <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Status</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Completed
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Purpose</span>
              <span className="text-xs font-medium text-zinc-300 text-right">Booking Deposit Fee</span>
            </div>
          </div>

          {emailStatus && !emailStatus.success && (
            <p className="text-center text-[10px] text-amber-500/80 mb-4">
              Note: Could not email confirmation to stylist ({emailStatus.error}).
            </p>
          )}

          <p className="text-center text-xs text-zinc-500 leading-relaxed">
            Your appointment deposit has been secured. The stylist has been notified of your details. You can now close this tab.
          </p>
        </div>
      </div>
    </main>
  );
}
