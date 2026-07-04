"use server";

import { createClient } from "./server";

function configured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
const NOT_CONFIGURED = { error: "ยังไม่ได้ตั้งค่า Supabase (ดู SUPABASE_SETUP.md)" };

/** ลงทะเบียนด้วยอีเมล — role เก็บใน user_metadata → trigger สร้าง profile */
export async function signUpWithEmail(input: {
  name: string;
  email: string;
  password: string;
  role: "seller" | "buyer";
}) {
  if (!configured()) return NOT_CONFIGURED;
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: { data: { name: input.name, role: input.role } },
  });
  return { error: error?.message ?? null };
}

export async function signInWithEmail(email: string, password: string) {
  if (!configured()) return NOT_CONFIGURED;
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error: error?.message ?? null };
}

/** เบอร์โทร OTP — ต้องเปิด Phone provider + SMS ใน Supabase */
export async function sendPhoneOtp(phone: string) {
  if (!configured()) return NOT_CONFIGURED;
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({ phone });
  return { error: error?.message ?? null };
}

export async function verifyPhoneOtp(phone: string, token: string) {
  if (!configured()) return NOT_CONFIGURED;
  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ phone, token, type: "sms" });
  return { error: error?.message ?? null };
}

export async function signOut() {
  if (!configured()) return { error: null };
  const supabase = await createClient();
  await supabase.auth.signOut();
  return { error: null };
}
