import { supabase } from "@/integrations/supabase/client";
import { loadProfile, loadPlan, loadCompletions } from "@/lib/plan-generator";

const USER_ID_KEY = "tw_user_id";

export function getUserId(): string {
  let id = localStorage.getItem(USER_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(USER_ID_KEY, id);
  }
  return id;
}

export async function syncProfileToSupabase() {
  if (!supabase) return;
  const profile = loadProfile();
  if (!profile) return;
  const userId = getUserId();
  try {
    await supabase.from("profiles").upsert({
      id: userId,
      name: profile.name,
      age: profile.age ?? null,
      weight_kg: profile.weight_kg ?? null,
      height_cm: profile.height_cm ?? null,
      fitness_level: profile.fitness_level,
      equipment: profile.equipment,
      goal: profile.goal,
      workout_time: profile.workout_time,
    }, { onConflict: "id" });
  } catch (e) {
    console.warn("Supabase sync failed:", e);
  }
}

export async function syncPlanToSupabase() {
  if (!supabase) return;
  const plan = loadPlan();
  if (!plan) return;
  const userId = getUserId();
  try {
    await supabase.from("plans").upsert({
      id: plan.id,
      user_id: userId,
      days: plan.days,
      goal: plan.goal,
      start_date: plan.start_date,
    }, { onConflict: "id" });
  } catch (e) {
    console.warn("Supabase plan sync failed:", e);
  }
}

export async function markUserActive() {
  if (!supabase) return;
  const userId = getUserId();
  try {
    await supabase.from("profiles").update({
      is_active: true,
      last_active_at: new Date().toISOString(),
    }).eq("id", userId);
  } catch (e) {
    console.warn("Failed to mark active:", e);
  }
}

export async function markUserInactive() {
  if (!supabase) return;
  const userId = getUserId();
  try {
    await supabase.from("profiles").update({
      is_active: false,
      last_active_at: new Date().toISOString(),
    }).eq("id", userId);
  } catch (e) {
    console.warn("Failed to mark inactive:", e);
  }
}

export async function fetchUnreadMessages() {
  if (!supabase) return [];
  const userId = getUserId();
  try {
    const { data } = await supabase
      .from("admin_messages")
      .select("*")
      .eq("user_id", userId)
      .is("read_at", null)
      .order("created_at", { ascending: true });
    return data ?? [];
  } catch {
    return [];
  }
}

export async function markMessageRead(messageId: string) {
  if (!supabase) return;
  try {
    await supabase.from("admin_messages")
      .update({ read_at: new Date().toISOString() })
      .eq("id", messageId);
  } catch (e) {
    console.warn("Failed to mark message read:", e);
  }
}
