"use server";

import crypto from "crypto";
import { cookies } from "next/headers";
import Stripe from "stripe";
import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";

const SESSION_SECRET = process.env.SESSION_SECRET || "default_session_secret_for_arnold_payment_link_1234567890";
const COOKIE_NAME = "halo_aura_session";
const PROCESSED_SESSIONS_FILE = path.join(process.cwd(), "processed_sessions.json");

// Helper to sign the session token
function signToken(username: string): string {
  const timestamp = Date.now();
  const payload = `${username}:${timestamp}`;
  const signature = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
  return `${payload}:${signature}`;
}

// Helper to verify the session token
async function verifyToken(token: string): Promise<boolean> {
  try {
    const parts = token.split(":");
    if (parts.length !== 3) return false;
    const [username, timestampStr, signature] = parts;

    // Check if it matches correct admin username
    const adminUser = process.env.ADMIN_USERNAME || "user@test.com";
    if (username !== adminUser) return false;

    const payload = `${username}:${timestampStr}`;
    const expectedSignature = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");

    const signatureBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expectedSignature, "hex");

    if (signatureBuffer.length !== expectedBuffer.length) return false;
    if (!crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) return false;

    // Session valid for 7 days
    const timestamp = parseInt(timestampStr, 10);
    const sessionAge = Date.now() - timestamp;
    if (sessionAge > 7 * 24 * 60 * 60 * 1000) return false;

    return true;
  } catch (e) {
    return false;
  }
}

// Action: Handle login verification
export async function loginAction(prevState: any, formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  const adminUser = process.env.ADMIN_USERNAME || "user@test.com";
  const adminPass = process.env.ADMIN_PASSWORD || "12345";

  if (username === adminUser && password === adminPass) {
    const token = signToken(username);
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });
    return { success: true, error: null };
  }

  return { success: false, error: "Invalid username or password" };
}

// Action: Handle logout
export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  return { success: true };
}

// Check session authentication status
export async function checkAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get(COOKIE_NAME);
  if (!tokenCookie) return false;
  return verifyToken(tokenCookie.value);
}

// Action: Generate Stripe payment link
export async function generatePaymentLinkAction(prevState: any, formData: FormData) {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    return { success: false, error: "Session expired. Please log in again." };
  }

  const customerName = formData.get("customerName") as string;
  const depositAmountStr = formData.get("depositAmount") as string;

  if (!customerName || !customerName.trim()) {
    return { success: false, error: "Customer name is required" };
  }

  const amount = parseFloat(depositAmountStr);
  if (isNaN(amount) || amount <= 0) {
    return { success: false, error: "Deposit amount must be a valid number greater than 0" };
  }

  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) {
    return {
      success: false,
      error: "Stripe Secret Key is missing in `.env`. Please add your STRIPE_SECRET_KEY.",
    };
  }

  try {
    const stripe = new Stripe(stripeSecret);
    const currency = (process.env.NEXT_PUBLIC_CURRENCY || "GBP").toLowerCase();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const amountInCents = Math.round(amount * 100);

    // Create a dynamic price associated with a newly created product inline
    const price = await stripe.prices.create({
      currency: currency,
      unit_amount: amountInCents,
      product_data: {
        name: `Deposit: ${customerName.trim()}`,
      },
    });

    // Pass CHECKOUT_SESSION_ID placeholder to resolve complete details on checkout success redirect
    const successUrl = `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`;

    // Create Stripe Payment Link redirecting to successUrl, gathering phone and restricting to single-use
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      phone_number_collection: {
        enabled: true,
      },
      restrictions: {
        completed_sessions: {
          limit: 1,
        },
      },
      after_completion: {
        type: "redirect",
        redirect: {
          url: successUrl,
        },
      },
      metadata: {
        customerName: customerName.trim(),
        depositAmount: depositAmountStr,
      },
    });

    return {
      success: true,
      error: null,
      paymentLink: paymentLink.url,
      customerName: customerName.trim(),
      amount: amount,
    };
  } catch (err: any) {
    console.error("Stripe API integration error:", err);
    return {
      success: false,
      error: err.message || "Failed to communicate with Stripe. Please check your credentials.",
    };
  }
}

// Action: Fetch dashboard list of successful payments
export async function getPaymentsDashboardAction() {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    return { success: false, error: "Unauthorized session", payments: [] };
  }

  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) {
    return { success: false, error: "Stripe credentials missing in .env", payments: [] };
  }

  try {
    const stripe = new Stripe(stripeSecret);
    
    // Fetch last 50 checkout sessions
    const sessions = await stripe.checkout.sessions.list({
      limit: 50,
    });

    // Map and filter completed payments
    const payments = sessions.data
      .filter((session) => session.payment_status === "paid")
      .map((session) => ({
        id: session.id,
        customerName: session.customer_details?.name || session.metadata?.customerName || "Valued Client",
        email: session.customer_details?.email || "No Email Provided",
        phone: session.customer_details?.phone || "No Phone Provided",
        amount: session.amount_total ? session.amount_total / 100 : 0,
        currency: session.currency?.toUpperCase() || "GBP",
        date: session.created ? new Date(session.created * 1000).toISOString() : new Date().toISOString(),
      }));

    return { success: true, error: null, payments };
  } catch (err: any) {
    console.error("Stripe payment dashboard list retrieval error:", err);
    return { success: false, error: err.message || "Failed to retrieve payments history", payments: [] };
  }
}

// Helper: Check if email has been already processed/sent to prevent duplicates on browser reload
function isEmailAlreadySent(sessionId: string): boolean {
  try {
    if (fs.existsSync(PROCESSED_SESSIONS_FILE)) {
      const fileContent = fs.readFileSync(PROCESSED_SESSIONS_FILE, "utf-8");
      const processed = JSON.parse(fileContent) as string[];
      return processed.includes(sessionId);
    }
  } catch (e) {
    console.error("Error reading session tracker file:", e);
  }
  return false;
}

// Helper: Mark session email notification as completed
function markEmailAsSent(sessionId: string) {
  try {
    let processed: string[] = [];
    if (fs.existsSync(PROCESSED_SESSIONS_FILE)) {
      const fileContent = fs.readFileSync(PROCESSED_SESSIONS_FILE, "utf-8");
      processed = JSON.parse(fileContent) as string[];
    }
    if (!processed.includes(sessionId)) {
      processed.push(sessionId);
      fs.writeFileSync(PROCESSED_SESSIONS_FILE, JSON.stringify(processed, null, 2), "utf-8");
    }
  } catch (e) {
    console.error("Error writing session tracker file:", e);
  }
}

// Action: Email notification dispatch to stylist on success
export async function sendPaymentNotificationEmailAction(sessionId: string) {
  if (!sessionId) {
    return { success: false, error: "Invalid Session ID provided" };
  }

  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) {
    return { success: false, error: "Stripe Secret Key missing" };
  }

  // 1. Return early if email already sent
  if (isEmailAlreadySent(sessionId)) {
    console.log(`Notification email already dispatched for checkout session ${sessionId}. Skipping duplicate.`);
    return { success: true, message: "Duplicate email suppressed successfully" };
  }

  try {
    const stripe = new Stripe(stripeSecret);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Verify session state is paid
    if (session.payment_status !== "paid") {
      return { success: false, error: "Stripe checkout session has not been marked as paid." };
    }

    const customerName = session.customer_details?.name || session.metadata?.customerName || "Valued Client";
    const email = session.customer_details?.email || "No Email";
    const phone = session.customer_details?.phone || "No Phone";
    const amount = session.amount_total ? session.amount_total / 100 : 0;
    const currency = session.currency?.toUpperCase() || "GBP";

    // SMTP settings verification
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPassword = process.env.SMTP_PASSWORD;
    const receiverEmail = process.env.CLIENT_RECEIVER_EMAIL;

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPassword || !receiverEmail) {
      console.warn("SMTP credentials are not fully configured in `.env`. Email dispatch skipped.");
      return {
        success: false,
        error: "SMTP configurations are incomplete in environment files. Email notification skipped.",
      };
    }

    // 2. Configure Node Mailer SMTP transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort, 10),
      secure: parseInt(smtpPort, 10) === 465, // SSL
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    });

    const currencySymbol = currency === "GBP" ? "£" : currency === "CAD" ? "C$" : "$";

    // 3. Setup stylized HTML content
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1e293b;">
        <div style="text-align: center; border-bottom: 2px solid #d97706; padding-bottom: 20px; margin-bottom: 25px;">
          <h2 style="color: #0f172a; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">HaloAura Braids</h2>
          <p style="color: #d97706; margin: 5px 0 0 0; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">Deposit Paid Confirmation</p>
        </div>
        
        <div style="margin-bottom: 25px;">
          <p style="font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">Hello Stylist,</p>
          <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">A new appointment deposit has been completed through your portal. Here are the client's booking details:</p>
          
          <table style="width: 100%; border-collapse: collapse; background-color: #f8fafc; border-radius: 12px; overflow: hidden;">
            <thead>
              <tr style="background-color: #f1f5f9; border-bottom: 1px solid #e2e8f0;">
                <th colspan="2" style="text-align: left; padding: 14px 18px; font-size: 14px; color: #475569; font-weight: bold; letter-spacing: 0.5px;">CLIENT & RECEIPT INFO</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #64748b; font-weight: 500;">Customer Name</td>
                <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #0f172a; font-weight: 700; text-align: right;">${customerName}</td>
              </tr>
              <tr>
                <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #64748b; font-weight: 500;">Email Address</td>
                <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #0f172a; text-align: right;"><a href="mailto:${email}" style="color: #2563eb; text-decoration: none; font-weight: 600;">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #64748b; font-weight: 500;">Phone Number</td>
                <td style="padding: 14px 18px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #0f172a; text-align: right;"><a href="tel:${phone}" style="color: #2563eb; text-decoration: none; font-weight: 600;">${phone}</a></td>
              </tr>
              <tr>
                <td style="padding: 14px 18px; font-size: 14px; color: #64748b; font-weight: 500;">Amount Paid</td>
                <td style="padding: 14px 18px; font-size: 18px; color: #d97706; font-weight: 900; text-align: right;">${currencySymbol}${amount.toFixed(2)} ${currency}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center;">
          <p style="font-size: 11px; color: #94a3b8; margin: 0; line-height: 1.5;">This email was automatically generated and sent by your HaloAura Braids Deposit Portal. To configure email templates, check your application settings.</p>
        </div>
      </div>
    `;

    // 4. Send email notification
    await transporter.sendMail({
      from: `"HaloAura Booking Portal" <${smtpUser}>`,
      to: receiverEmail,
      subject: `🎉 Deposit Paid: ${currencySymbol}${amount.toFixed(2)} from ${customerName}`,
      html: emailHtml,
    });

    // 5. Save session to duplicate cache list
    markEmailAsSent(sessionId);

    return { success: true, message: "Stylist email alert dispatched successfully." };
  } catch (err: any) {
    console.error("Nodemailer transporter error:", err);
    return { success: false, error: err.message || "Failed to send stylist confirmation email." };
  }
}
