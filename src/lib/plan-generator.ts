export type Goal = "lose_weight" | "build_muscle" | "endurance" | "flexibility";
        },
        {
          kind: "movement",
          title: "Light movement",
          suggested_time: "Anytime",
          exercises: movementExercises,
        },
      ],
    };
  });

  return {
    id: `local-${Date.now()}`,
    profile,
    start_date: new Date().toISOString().slice(0, 10),
    days,
  };
}

export function saveProfile(profile: Profile) {
  localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile));
}

export function getProfile(): Profile | null {
  const raw = localStorage.getItem(STORAGE_KEYS.profile);
  return raw ? JSON.parse(raw) as Profile : null;
}

export function savePlan(plan: Plan) {
  localStorage.setItem(STORAGE_KEYS.plan, JSON.stringify(plan));
  localStorage.setItem(STORAGE_KEYS.completed, JSON.stringify({}));
}

export function getPlan(): Plan | null {
  const raw = localStorage.getItem(STORAGE_KEYS.plan);
  return raw ? JSON.parse(raw) as Plan : null;
}

export function getCompleted(): Record<string, boolean> {
  const raw = localStorage.getItem(STORAGE_KEYS.completed);
  return raw ? JSON.parse(raw) as Record<string, boolean> : {};
}

export function saveCompleted(completed: Record<string, boolean>) {
  localStorage.setItem(STORAGE_KEYS.completed, JSON.stringify(completed));
}

export function clearLocalAppData() {
  localStorage.removeItem(STORAGE_KEYS.profile);
  localStorage.removeItem(STORAGE_KEYS.plan);
  localStorage.removeItem(STORAGE_KEYS.completed);
}
