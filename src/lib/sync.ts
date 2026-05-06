import { supabase } from "@/integrations/supabase/client";
import { loadProfile, loadPlan, loadCompletions } from "@/lib/plan-generator";

const USER_ID_KEY = "tw_user_id";

export type AdminMessage = {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  read_at: string | null;
  sent_by?: string | null;
};

export function getUserId() {
  let userId = localStorage.getItem(USER_ID_KEY);

  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem(USER_ID_KEY, userId);
  }

  return userId;
}

export async function syncProfileAndPlan() {
  if (!supabase) return;

  const profile = loadProfile();
  const plan = loadPlan();
  const userId = getUserId();

  if (!profile) return;

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
    last_active_at: new Date().toISOString(),
    is_active: true,
  });

  if (plan) {
    await supabase.from("plans").upsert({
      id: plan.id,
      user_id: userId,
      days: plan.days,
      goal: plan.goal,
      start_date: plan.start_date,
    });
  }
}

export async function syncCompletions() {
  if (!supabase) return;

  const plan = loadPlan();
  const completions = loadCompletions();
  const userId = getUserId();

  if (!plan) return;

  const rows = Object.entries(completions).map(([key, completed]) => {
    const [dayIndex, sessionIndex, exerciseIndex] = key.split("-").map(Number);

    return {
      user_id: userId,
      plan_id: plan.id,
      day_index: dayIndex,
      session_index: sessionIndex,
      exercise_index: exerciseIndex,
      completed,
      updated_at: new Date().toISOString(),
    };
  });

  if (rows.length === 0) return;

  await supabase.from("completions").upsert(rows, {
    onConflict: "user_id,plan_id,day_index,session_index,exercise_index",
  });
}

export async function markUserActive() {
  if (!supabase) return;

  const profile = loadProfile();
  const userId = getUserId();

  await supabase.from("profiles").upsert({
    id: userId,
    name: profile?.name ?? "Friend",
    age: profile?.age ?? null,
    weight_kg: profile?.weight_kg ?? null,
    height_cm: profile?.height_cm ?? null,
    fitness_level: profile?.fitness_level ?? "beginner",
    equipment: profile?.equipment ?? "bodyweight only",
    goal: profile?.goal ?? "lose_weight",
    workout_time: profile?.workout_time ?? "17:00",
    last_active_at: new Date().toISOString(),
    is_active: true,
  });
}

export async function markUserInactive() {
  if (!supabase) return;

  const userId = getUserId();

  await supabase
    .from("profiles")
    .update({
      last_active_at: new Date().toISOString(),
      is_active: false,
    })
    .eq("id", userId);
}

export async function fetchUnreadMessages(): Promise<AdminMessage[]> {
  if (!supabase) return [];

  const userId = getUserId();

  const { data, error } = await supabase
    .from("admin_messages")
    .select("*")
    .eq("user_id", userId)
    .is("read_at", null)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Could not fetch messages:", error);
    return [];
  }

  return data ?? [];
}

export async function markMessageRead(messageId: string) {
  if (!supabase) return;

  await supabase
    .from("admin_messages")
    .update({ read_at: new Date().toISOString() })
    .eq("id", messageId);
}
