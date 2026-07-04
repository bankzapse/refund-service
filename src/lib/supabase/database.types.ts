/**
 * Database types สำหรับ Supabase client (type-safe)
 * เขียนให้ตรง supabase/schema.sql — production ควร regenerate ด้วย:
 *   npx supabase gen types typescript --project-id <id> > src/lib/supabase/database.types.ts
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type UserRole = "seller" | "buyer" | "admin";
type JobStatus = "submitted" | "confirmed" | "en_route" | "completed" | "cancelled";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; role: UserRole; name: string; phone: string | null; email: string | null; line_user_id: string | null; line_connected: boolean; base_lat: number | null; base_lng: number | null; status: string; created_at: string };
        Insert: { id: string; role?: UserRole; name: string; phone?: string | null; email?: string | null; line_user_id?: string | null; line_connected?: boolean; base_lat?: number | null; base_lng?: number | null; status?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      material_prices: {
        Row: { id: string; name: string; unit: string; price_per_unit: number; emoji: string | null; category: string | null; updated_at: string };
        Insert: { id: string; name: string; unit: string; price_per_unit: number; emoji?: string | null; category?: string | null; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["material_prices"]["Insert"]>;
        Relationships: [];
      };
      buyer_prices: {
        Row: { buyer_id: string; material_id: string; price: number };
        Insert: { buyer_id: string; material_id: string; price: number };
        Update: Partial<{ buyer_id: string; material_id: string; price: number }>;
        Relationships: [];
      };
      schedule_slots: {
        Row: { id: string; buyer_id: string; date: string; area: string | null; capacity: number; booked: number; created_at: string };
        Insert: { id?: string; buyer_id: string; date: string; area?: string | null; capacity?: number; booked?: number; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["schedule_slots"]["Insert"]>;
        Relationships: [];
      };
      jobs: {
        Row: { id: string; code: string; seller_id: string; buyer_id: string | null; slot_id: string | null; status: JobStatus; lat: number | null; lng: number | null; address: string | null; house_no: string | null; landmark: string | null; contact_name: string | null; contact_phone: string | null; scheduled_date: string | null; note: string | null; estimated_total: number; final_amount: number | null; created_at: string };
        Insert: { id?: string; code: string; seller_id: string; buyer_id?: string | null; slot_id?: string | null; status?: JobStatus; lat?: number | null; lng?: number | null; address?: string | null; house_no?: string | null; landmark?: string | null; contact_name?: string | null; contact_phone?: string | null; scheduled_date?: string | null; note?: string | null; estimated_total?: number; final_amount?: number | null; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["jobs"]["Insert"]>;
        Relationships: [];
      };
      job_items: {
        Row: { id: string; job_id: string; material_id: string; name: string; unit: string | null; price_per_unit: number; qty: number };
        Insert: { id?: string; job_id: string; material_id: string; name: string; unit?: string | null; price_per_unit: number; qty: number };
        Update: Partial<Database["public"]["Tables"]["job_items"]["Insert"]>;
        Relationships: [];
      };
      job_status_history: {
        Row: { id: string; job_id: string; status: JobStatus; note: string | null; at: string };
        Insert: { id?: string; job_id: string; status: JobStatus; note?: string | null; at?: string };
        Update: Partial<Database["public"]["Tables"]["job_status_history"]["Insert"]>;
        Relationships: [];
      };
      bills: {
        Row: { id: string; code: string; buyer_id: string; source: string; job_id: string | null; seller_name: string | null; seller_phone: string | null; goods_total: number; fee: number; net_paid: number; payment_method: string; status: string; created_at: string };
        Insert: { id?: string; code: string; buyer_id: string; source: string; job_id?: string | null; seller_name?: string | null; seller_phone?: string | null; goods_total: number; fee: number; net_paid: number; payment_method?: string; status?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["bills"]["Insert"]>;
        Relationships: [];
      };
      bill_items: {
        Row: { id: string; bill_id: string; material_id: string | null; name: string; unit: string | null; qty: number; price_per_unit: number; subtotal: number };
        Insert: { id?: string; bill_id: string; material_id?: string | null; name: string; unit?: string | null; qty: number; price_per_unit: number; subtotal: number };
        Update: Partial<Database["public"]["Tables"]["bill_items"]["Insert"]>;
        Relationships: [];
      };
      expenses: {
        Row: { id: string; buyer_id: string; category: string; amount: number; date: string; note: string | null; created_at: string };
        Insert: { id?: string; buyer_id: string; category: string; amount: number; date?: string; note?: string | null; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["expenses"]["Insert"]>;
        Relationships: [];
      };
      reward_tickets: {
        Row: { id: string; number: string; user_id: string; month: string; from_job_id: string | null; created_at: string };
        Insert: { id?: string; number: string; user_id: string; month: string; from_job_id?: string | null; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["reward_tickets"]["Insert"]>;
        Relationships: [];
      };
      reward_draws: {
        Row: { month: string; prize_name: string; prize_value: number | null; winning_number: string | null; winner_name: string | null; status: string; announced_at: string | null };
        Insert: { month: string; prize_name?: string; prize_value?: number | null; winning_number?: string | null; winner_name?: string | null; status?: string; announced_at?: string | null };
        Update: Partial<Database["public"]["Tables"]["reward_draws"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
      settle_bill: {
        Args: { p_source: string; p_job_id: string | null; p_seller_name: string; p_seller_phone: string; p_items: Json; p_payment: string };
        Returns: string;
      };
      draw_reward_winner: { Args: { p_month: string }; Returns: undefined };
      set_user_status: { Args: { p_user: string; p_status: string }; Returns: undefined };
    };
    Enums: { user_role: UserRole; job_status: JobStatus };
    CompositeTypes: Record<string, never>;
  };
}
