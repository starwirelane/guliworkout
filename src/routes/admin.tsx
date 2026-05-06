import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD ?? "admin123";

interface UserProfile {
  id: string;
  name: string;
  goal: string;
  fitness_level: string;
  is_active: boolean;
  last_active_at: string | null;
  created_at: string;
}

interface Plan {
  id: string;
  user_id: string;
  days: any[];
  goal: string;
  start_date: string;
}

interface Message {
  id: string;
  message: string;
  created_at: string;
  read_at: string | null;
}

function timeAgo(ts: string | null): string {
  if (!ts) return "Never";
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function getProgress(plan: Plan | null): { day: number; percent: number } {
  if (!plan) return { day: 0, percent: 0 };
  const start = new Date(plan.start_date + "T00:00:00");
  const day = Math.max(0, Math.min(13, Math.floor((Date.now() - start.getTime()) / 86400000)));
  return { day: day + 1, percent: Math.round(((day + 1) / 14) * 100) };
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [plans, setPlans] = useState<Record<string, Plan>>({});
  const [selected, setSelected] = useState<UserProfile | null>(null);
  const [userMessages, setUserMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthed(true);
      setError("");
    } else {
      setError("Wrong password.");
    }
  }

  async function loadUsers() {
    if (!supabase) return;
    setLoading(true);
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("*")
      .order("last_active_at", { ascending: false, nullsFirst: false });

    const { data: plansData } = await supabase
      .from("plans")
      .select("*");

    setUsers(profilesData ?? []);

    const planMap: Record<string, Plan> = {};
    (plansData ?? []).forEach((p: Plan) => { planMap[p.user_id] = p; });
    setPlans(planMap);
    setLoading(false);
  }

  async function loadUserMessages(userId: string) {
    if (!supabase) return;
    const { data } = await supabase
      .from("admin_messages")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    setUserMessages(data ?? []);
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || !selected || !newMessage.trim()) return;
    setSending(true);
    await supabase.from("admin_messages").insert({
      user_id: selected.id,
      message: newMessage.trim(),
      sent_by: "admin",
    });
    setNewMessage("");
    await loadUserMessages(selected.id);
    setSending(false);
  }

  useEffect(() => {
    if (authed) loadUsers();
  }, [authed]);

  // Auto-refresh users every 30 seconds
  useEffect(() => {
    if (!authed) return;
    const interval = setInterval(loadUsers, 30000);
    return () => clearInterval(interval);
  }, [authed]);

  useEffect(() => {
    if (selected) loadUserMessages(selected.id);
  }, [selected]);

  if (!supabase) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="serif text-2xl font-bold">Supabase not configured.</p>
          <p className="mt-2 text-foreground/60">Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to your environment.</p>
        </div>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-background paper flex items-center justify-center">
        <div className="blob top-[-100px] right-[-100px] h-[400px] w-[400px] bg-primary/40" />
        <div className="blob bottom-[-100px] left-[-100px] h-[400px] w-[400px] bg-accent/50" />
        <div className="relative z-10 w-full max-w-sm px-6">
          <Link to="/" className="serif text-2xl font-bold">Two<span className="italic-accent">week</span></Link>
          <h1 className="mt-8 serif text-4xl font-bold">Admin panel.</h1>
          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Password" autoFocus
              className="w-full rounded-2xl border-2 border-foreground/15 bg-card px-5 py-4 text-xl outline-none focus:border-primary" />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <button type="submit"
              className="w-full rounded-full bg-primary px-6 py-4 font-semibold text-primary-foreground hover:scale-[1.01]">
              Enter →
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background paper">
      <div className="blob top-[-100px] right-[-100px] h-[400px] w-[400px] bg-primary/20" />

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 border-b border-foreground/10">
        <Link to="/" className="serif text-2xl font-bold">Two<span className="italic-accent">week</span></Link>
        <div className="flex items-center gap-4">
          <button onClick={loadUsers} className="text-sm text-foreground/60 hover:text-foreground">↻ Refresh</button>
          <span className="rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">Admin</span>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-6 py-8">
        {!selected ? (
          <>
            <div className="mb-8">
              <h1 className="serif text-4xl font-bold">All Users</h1>
              <p className="mt-1 text-foreground/60">{users.length} total · updates every 30 seconds</p>
            </div>

            {loading ? (
              <div className="serif text-2xl text-foreground/40">Loading...</div>
            ) : users.length === 0 ? (
              <div className="rounded-2xl border-2 border-foreground/10 bg-card p-8 text-center">
                <p className="serif text-xl text-foreground/50">No users yet.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {users.map(user => {
                  const plan = plans[user.id];
                  const { day, percent } = getProgress(plan ?? null);
                  const isActive = user.is_active &&
                    user.last_active_at &&
                    Date.now() - new Date(user.last_active_at).getTime() < 60000;

                  return (
                    <button key={user.id} onClick={() => setSelected(user)}
                      className="rounded-2xl border-2 border-foreground/10 bg-card p-6 text-left hover:border-primary/40 transition">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="serif text-xl font-bold">{user.name || "Unknown"}</p>
                          <p className="text-sm text-foreground/60 capitalize">{user.goal?.replace("_", " ")} · {user.fitness_level}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${isActive ? "bg-green-500/20 text-green-600" : "bg-foreground/10 text-foreground/50"}`}>
                          {isActive ? "● Active" : timeAgo(user.last_active_at)}
                        </span>
                      </div>
                      {plan && (
                        <div className="mt-4">
                          <div className="flex justify-between text-xs font-semibold text-foreground/60 mb-1">
                            <span>Day {day} of 14</span>
                            <span>{percent}%</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-foreground/10">
                            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${percent}%` }} />
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <>
            <button onClick={() => setSelected(null)}
              className="mb-6 flex items-center gap-2 text-sm font-semibold text-foreground/60 hover:text-foreground">
              ← Back to all users
            </button>

            <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
              {/* User info */}
              <div>
                <div className="rounded-2xl border-2 border-foreground/10 bg-card p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="serif text-3xl font-bold">{selected.name}</h2>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                      selected.is_active ? "bg-green-500/20 text-green-600" : "bg-foreground/10 text-foreground/50"
                    }`}>
                      {selected.is_active ? "● Active now" : `Last seen ${timeAgo(selected.last_active_at)}`}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-foreground/50">Goal</span><p className="font-semibold capitalize">{selected.goal?.replace("_", " ")}</p></div>
                    <div><span className="text-foreground/50">Level</span><p className="font-semibold capitalize">{selected.fitness_level}</p></div>
                    <div><span className="text-foreground/50">Joined</span><p className="font-semibold">{new Date(selected.created_at).toLocaleDateString()}</p></div>
                    <div><span className="text-foreground/50">Plan day</span><p className="font-semibold">{getProgress(plans[selected.id] ?? null).day} of 14</p></div>
                  </div>
                </div>

                {/* Message history */}
                <div className="rounded-2xl border-2 border-foreground/10 bg-card p-6">
                  <h3 className="serif text-xl font-bold mb-4">Message history</h3>
                  {userMessages.length === 0 ? (
                    <p className="text-foreground/50 text-sm">No messages sent yet.</p>
                  ) : (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {userMessages.map(m => (
                        <div key={m.id} className="rounded-xl bg-background p-4">
                          <p className="text-sm">{m.message}</p>
                          <div className="mt-1 flex items-center gap-3 text-xs text-foreground/40">
                            <span>{new Date(m.created_at).toLocaleString()}</span>
                            <span>{m.read_at ? "✓ Read" : "Unread"}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Send message */}
              <div className="rounded-2xl border-2 border-primary/20 bg-card p-6 h-fit">
                <h3 className="serif text-xl font-bold mb-2">Send a message</h3>
                <p className="text-sm text-foreground/60 mb-4">
                  {selected.is_active ? "User is active — they'll see this immediately." : "User is offline — they'll see it next time they open the app."}
                </p>
                <form onSubmit={sendMessage} className="space-y-3">
                  <textarea
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    rows={4}
                    className="w-full rounded-2xl border-2 border-foreground/15 bg-background px-4 py-3 text-sm outline-none focus:border-primary resize-none"
                  />
                  <button type="submit" disabled={sending || !newMessage.trim()}
                    className="w-full rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground hover:scale-[1.01] disabled:opacity-50">
                    {sending ? "Sending..." : "Send message →"}
                  </button>
                </form>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
