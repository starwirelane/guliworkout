export type Goal = "lose_weight" | "build_muscle" | "endurance" | "flexibility";
export type FitnessLevel = "beginner" | "intermediate" | "advanced";
export type Equipment = "bodyweight only" | "dumbbells at home" | "full gym access";

export type Profile = {
  name: string;
  age?: number | null;
  weight_kg?: number | null;
  height_cm?: number | null;
  fitness_level: FitnessLevel;
  equipment: Equipment;
  goal: Goal;
  workout_time: string;
};

export type Exercise = {
  name: string;
  sets: number;
  reps: string;
  cue: string;
};

export type Session = {
  kind: "main" | "movement";
  title: string;
  suggested_time: string;
  exercises: Exercise[];
};

export type Day = {
  title: string;
  focus: string;
  motivation: string;
  sessions: Session[];
};

export type Plan = {
  id: string;
  profile: Profile;
  start_date: string;
  days: Day[];
};

const STORAGE_KEYS = {
  profile: "guliworkout_profile",
  plan: "guliworkout_plan",
  completed: "guliworkout_completed",
};

const BODYWEIGHT = {
  strength: [
    { name: "Push-ups", sets: 3, reps: "8-12", cue: "Keep your body straight and lower with control." },
    { name: "Bodyweight Squats", sets: 3, reps: "12-15", cue: "Sit your hips back and keep your chest tall." },
    { name: "Reverse Lunges", sets: 3, reps: "8 each leg", cue: "Step back softly and drive through the front foot." },
    { name: "Glute Bridges", sets: 3, reps: "12-15", cue: "Squeeze your glutes at the top." },
    { name: "Plank", sets: 3, reps: "30-45 sec", cue: "Brace your core and breathe slowly." },
  ],
  cardio: [
    { name: "Jumping Jacks", sets: 3, reps: "30 sec", cue: "Stay light on your feet." },
    { name: "Mountain Climbers", sets: 3, reps: "30 sec", cue: "Keep your hips low and move with control." },
    { name: "High Knees", sets: 3, reps: "30 sec", cue: "Drive your knees up and keep your rhythm steady." },
    { name: "Skater Steps", sets: 3, reps: "30 sec", cue: "Step side to side with soft knees." },
    { name: "Fast Bodyweight Squats", sets: 3, reps: "20", cue: "Move quickly while keeping clean form." },
  ],
  mobility: [
    { name: "Cat-Cow Stretch", sets: 1, reps: "60 sec", cue: "Move slowly through your spine." },
    { name: "World's Greatest Stretch", sets: 2, reps: "5 each side", cue: "Open your hips and rotate through your upper back." },
    { name: "Hamstring Walkouts", sets: 2, reps: "8", cue: "Keep your legs as straight as comfortable." },
    { name: "Child's Pose Breathing", sets: 1, reps: "60 sec", cue: "Breathe into your back and relax your shoulders." },
    { name: "Hip Flexor Stretch", sets: 2, reps: "30 sec each side", cue: "Tuck your hips under slightly." },
  ],
};

const DUMBBELLS = {
  strength: [
    { name: "Dumbbell Goblet Squat", sets: 3, reps: "10-12", cue: "Hold one dumbbell close and squat with control." },
    { name: "Dumbbell Row", sets: 3, reps: "10 each side", cue: "Pull your elbow back toward your hip." },
    { name: "Dumbbell Floor Press", sets: 3, reps: "8-12", cue: "Press up smoothly and control the way down." },
    { name: "Dumbbell Romanian Deadlift", sets: 3, reps: "10-12", cue: "Push your hips back and keep your back flat." },
    { name: "Dumbbell Shoulder Press", sets: 3, reps: "8-10", cue: "Brace your core before each press." },
  ],
  cardio: [
    { name: "Dumbbell Thrusters", sets: 3, reps: "10", cue: "Squat, then press overhead in one smooth move." },
    { name: "Farmer Carry", sets: 3, reps: "40 sec", cue: "Walk tall and keep your core tight." },
    { name: "Dumbbell Step-ups", sets: 3, reps: "10 each leg", cue: "Drive through the foot on the step." },
    { name: "Alternating Dumbbell Snatch", sets: 3, reps: "8 each side", cue: "Keep the dumbbell close to your body." },
    { name: "Dumbbell Squat to Press", sets: 3, reps: "10", cue: "Stand tall and press after each squat." },
  ],
  mobility: BODYWEIGHT.mobility,
};

const GYM = {
  strength: [
    { name: "Leg Press", sets: 3, reps: "10-12", cue: "Control the weight and avoid locking your knees." },
    { name: "Lat Pulldown", sets: 3, reps: "10-12", cue: "Pull your elbows down and squeeze your back." },
    { name: "Chest Press Machine", sets: 3, reps: "8-12", cue: "Press with control and keep shoulders down." },
    { name: "Seated Cable Row", sets: 3, reps: "10-12", cue: "Pull to your ribs and sit tall." },
    { name: "Leg Curl Machine", sets: 3, reps: "10-12", cue: "Pause briefly at the squeeze." },
  ],
  cardio: [
    { name: "Treadmill Intervals", sets: 6, reps: "30 sec fast / 60 sec easy", cue: "Keep the fast pace challenging but controlled." },
    { name: "Bike Sprint Intervals", sets: 6, reps: "20 sec fast / 70 sec easy", cue: "Push hard, then recover fully." },
    { name: "Rowing Machine", sets: 4, reps: "2 min", cue: "Drive with your legs before pulling with your arms." },
    { name: "Stair Climber", sets: 3, reps: "4 min", cue: "Stand tall and avoid leaning heavily." },
    { name: "Incline Walk", sets: 1, reps: "15 min", cue: "Keep your breathing steady." },
  ],
  mobility: BODYWEIGHT.mobility,
};

const MOTIVATION = [
  "Small effort repeated daily becomes real progress.",
  "Do the simple work today. Let it stack.",
  "You do not need perfect. You need consistent.",
  "Move first. Motivation usually shows up late.",
  "Today counts, even if it is not pretty.",
  "Finish the session you started.",
  "Your future self gets the receipt.",
];

function libraryFor(equipment: Equipment) {
  if (equipment === "dumbbells at home") return DUMBBELLS;
  if (equipment === "full gym access") return GYM;
  return BODYWEIGHT;
}

function intensity(level: FitnessLevel) {
  if (level === "advanced") return { addSets: 2, movementCount: 3 };
  if (level === "intermediate") return { addSets: 1, movementCount: 2 };
  return { addSets: 0, movementCount: 2 };
}

function cloneExercises(exercises: Exercise[], level: FitnessLevel, count = 4): Exercise[] {
  const settings = intensity(level);

  return exercises.slice(0, count).map((exercise) => ({
    ...exercise,
    sets: Math.max(1, exercise.sets + settings.addSets),
  }));
}

function mainPool(goal: Goal, equipment: Equipment) {
  const library = libraryFor(equipment);

  if (goal === "lose_weight") return library.cardio;
  if (goal === "endurance") return library.cardio;
  if (goal === "flexibility") return library.mobility;

  return library.strength;
}

function secondaryPool(goal: Goal, equipment: Equipment) {
  const library = libraryFor(equipment);

  if (goal === "build_muscle") return library.mobility;
  if (goal === "flexibility") return library.strength;

  return library.mobility;
}

function rotate<T>(items: T[], amount: number): T[] {
  return items.map((_, index) => items[(index + amount) % items.length]);
}

function focusFor(goal: Goal, day: number) {
  const focusMap: Record<Goal, string[]> = {
    lose_weight: ["cardio", "strength", "conditioning", "recovery"],
    build_muscle: ["upper body", "lower body", "full body", "recovery"],
    endurance: ["stamina", "intervals", "full body", "recovery"],
    flexibility: ["mobility", "core", "stretch", "recovery"],
  };

  return focusMap[goal][day % focusMap[goal].length];
}

function titleFor(goal: Goal, day: number) {
  const titles: Record<Goal, string[]> = {
    lose_weight: ["Burn and build", "Fast feet", "Strong sweat", "Reset day"],
    build_muscle: ["Build the base", "Strength stack", "Power practice", "Recovery reset"],
    endurance: ["Steady engine", "Interval push", "Longer effort", "Easy reset"],
    flexibility: ["Open up", "Move better", "Deep stretch", "Gentle reset"],
  };

  return `Day ${day + 1}: ${titles[goal][day % titles[goal].length]}`;
}

export function generateLocalPlan(profile: Profile): Plan {
  const main = mainPool(profile.goal, profile.equipment);
  const secondary = secondaryPool(profile.goal, profile.equipment);
  const movementCount = intensity(profile.fitness_level).movementCount;

  const days: Day[] = Array.from({ length: 14 }, (_, day) => {
    const recovery = day % 4 === 3;

    const mainExercises = recovery
      ? cloneExercises(rotate(secondary, day), profile.fitness_level, 4)
      : cloneExercises(
          rotate(main, day),
          profile.fitness_level,
          profile.fitness_level === "beginner" ? 4 : 5
        );

    const movementExercises = cloneExercises(
      rotate(secondary, day + 2),
      "beginner",
      movementCount
    );

    return {
      title: titleFor(profile.goal, day),
      focus: recovery ? "recovery" : focusFor(profile.goal, day),
      motivation: MOTIVATION[day % MOTIVATION.length],
      sessions: [
        {
          kind: "main",
          title: recovery ? "Recovery session" : "Main workout",
          suggested_time: profile.workout_time || "17:00",
          exercises: mainExercises,
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
  return raw ? (JSON.parse(raw) as Profile) : null;
}

export function savePlan(plan: Plan) {
  localStorage.setItem(STORAGE_KEYS.plan, JSON.stringify(plan));
  localStorage.setItem(STORAGE_KEYS.completed, JSON.stringify({}));
}

export function getPlan(): Plan | null {
  const raw = localStorage.getItem(STORAGE_KEYS.plan);
  return raw ? (JSON.parse(raw) as Plan) : null;
}

export function getCompleted(): Record<string, boolean> {
  const raw = localStorage.getItem(STORAGE_KEYS.completed);
  return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
}

export function saveCompleted(completed: Record<string, boolean>) {
  localStorage.setItem(STORAGE_KEYS.completed, JSON.stringify(completed));
}

export function clearLocalAppData() {
  localStorage.removeItem(STORAGE_KEYS.profile);
  localStorage.removeItem(STORAGE_KEYS.plan);
  localStorage.removeItem(STORAGE_KEYS.completed);
}
