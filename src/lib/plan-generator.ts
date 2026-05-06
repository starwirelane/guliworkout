// src/lib/plan-generator.ts
// Local workout plan generator - no backend required

export interface Profile {
  name: string;
  age?: number;
  weight_kg?: number;
  height_cm?: number;
  fitness_level: "beginner" | "intermediate" | "advanced";
  equipment: "bodyweight only" | "dumbbells at home" | "full gym access";
  goal: "lose_weight" | "build_muscle" | "endurance" | "flexibility";
  workout_time: string;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  cue: string;
}

export interface Session {
  kind: "main" | "movement";
  title: string;
  suggested_time: string;
  exercises: Exercise[];
}

export interface Day {
  title: string;
  focus: string;
  motivation: string;
  sessions: Session[];
}

export interface Plan {
  days: Day[];
  goal: string;
  start_date: string;
  id: string;
}

// ─── localStorage helpers ────────────────────────────────────────────────────

export function saveProfile(profile: Profile) {
  localStorage.setItem("tw_profile", JSON.stringify(profile));
}

export function loadProfile(): Profile | null {
  try {
    const raw = localStorage.getItem("tw_profile");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function savePlan(plan: Plan) {
  localStorage.setItem("tw_plan", JSON.stringify(plan));
}

export function loadPlan(): Plan | null {
  try {
    const raw = localStorage.getItem("tw_plan");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function saveCompletions(completions: Record<string, boolean>) {
  localStorage.setItem("tw_completions", JSON.stringify(completions));
}

export function loadCompletions(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem("tw_completions");
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export function clearAll() {
  localStorage.removeItem("tw_profile");
  localStorage.removeItem("tw_plan");
  localStorage.removeItem("tw_completions");
}

// ─── Morning Wake-Up exercises ───────────────────────────────────────────────

const MORNING_WAKEUP: Exercise[] = [
  { name: "Deep Breathing", sets: 1, reps: "2 min", cue: "Inhale 4 counts, hold 4, exhale 4 — wake up your nervous system." },
  { name: "Cat-Cow", sets: 1, reps: "10 reps", cue: "Inhale to arch, exhale to round — slow and gentle." },
  { name: "Child's Pose", sets: 1, reps: "45 sec", cue: "Arms extended, breathe into your back, let everything soften." },
  { name: "Downward Dog", sets: 1, reps: "30 sec", cue: "Press heels toward floor, pedal feet gently to warm up calves." },
  { name: "Low Lunge Stretch", sets: 1, reps: "30 sec each side", cue: "Sink hips forward, keep torso tall — open the hip flexors." },
  { name: "Seated Forward Fold", sets: 1, reps: "45 sec", cue: "Reach toward your toes, breathe into the hamstrings." },
  { name: "Neck Rolls", sets: 1, reps: "30 sec each direction", cue: "Slow and controlled — never force it." },
  { name: "Shoulder Rolls", sets: 1, reps: "30 sec each direction", cue: "Big slow rolls, release any overnight tension." },
  { name: "Hip Circles", sets: 1, reps: "30 sec each direction", cue: "Hands on hips, big slow circles to wake up the hip joints." },
  { name: "Standing Side Bend", sets: 1, reps: "30 sec each side", cue: "Reach overhead and over, feel the entire side body open." },
  { name: "World's Greatest Stretch", sets: 1, reps: "4 each side", cue: "Lunge, rotate, reach — opens hips, thoracic spine, and hamstrings." },
  { name: "Sun Salutation Flow", sets: 1, reps: "3 rounds", cue: "Breathe through each pose — inhale to extend, exhale to fold." },
  { name: "Lying Spinal Twist", sets: 1, reps: "30 sec each side", cue: "Both shoulders on the floor, breathe and relax into the twist." },
  { name: "Wrist and Ankle Circles", sets: 1, reps: "20 sec each", cue: "Wake up your joints — full slow circles in both directions." },
  { name: "Standing Forward Fold", sets: 1, reps: "45 sec", cue: "Soft bend in knees, hang heavy, let gravity do the work." },
];

function pickMorningWakeup(): Exercise[] {
  const shuffled = [...MORNING_WAKEUP].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 5);
}

// ─── Warm-up and cooldown ────────────────────────────────────────────────────

const WARMUP: Exercise[] = [
  { name: "Jumping Jacks", sets: 1, reps: "2 min", cue: "Get your heart rate up and warm your joints." },
  { name: "Arm Circles", sets: 1, reps: "30 sec each direction", cue: "Big controlled circles to open the shoulders." },
  { name: "Hip Circles", sets: 1, reps: "30 sec each direction", cue: "Hands on hips, loosen up the hip joints." },
  { name: "Leg Swings", sets: 1, reps: "10 each leg", cue: "Hold a wall, swing forward and back to warm up hamstrings." },
  { name: "Inchworm Walk", sets: 1, reps: "8 reps", cue: "Walk hands out to plank, walk feet in — slow and controlled." },
  { name: "High Knees", sets: 1, reps: "30 sec", cue: "Drive knees up to hip height, stay light on your feet." },
  { name: "World's Greatest Stretch", sets: 1, reps: "5 each side", cue: "Lunge, rotate, reach — open the whole body." },
];

const COOLDOWN: Exercise[] = [
  { name: "Standing Quad Stretch", sets: 1, reps: "30 sec each leg", cue: "Hold ankle behind you, keep knees together." },
  { name: "Seated Hamstring Stretch", sets: 1, reps: "30 sec each leg", cue: "Reach toward your toes, keep your back flat." },
  { name: "Child's Pose", sets: 1, reps: "60 sec", cue: "Arms extended, breathe deep, let your hips sink." },
  { name: "Cat-Cow Stretch", sets: 1, reps: "10 reps", cue: "Inhale to arch, exhale to round — slow rhythm." },
  { name: "Chest Opener Stretch", sets: 1, reps: "30 sec", cue: "Clasp hands behind back, lift chest, breathe." },
  { name: "Hip Flexor Stretch", sets: 1, reps: "30 sec each side", cue: "Low lunge, sink hips forward, keep torso tall." },
  { name: "Deep Breathing", sets: 1, reps: "2 min", cue: "4 counts in, 4 counts out — bring your heart rate down." },
];

function pickWarmup(): Exercise[] {
  return [...WARMUP].sort(() => Math.random() - 0.5).slice(0, 4);
}

function pickCooldown(): Exercise[] {
  return [...COOLDOWN].sort(() => Math.random() - 0.5).slice(0, 3);
}

// ─── Core ────────────────────────────────────────────────────────────────────

const CORE: Exercise[] = [
  { name: "Plank", sets: 3, reps: "45 sec", cue: "Hips level, brace your belly button to your spine." },
  { name: "Dead Bug", sets: 3, reps: "10 each side", cue: "Lower arm and opposite leg slowly, keep lower back pressed down." },
  { name: "Bicycle Crunches", sets: 3, reps: "20 reps", cue: "Elbow to opposite knee, slow and controlled." },
  { name: "Hollow Body Hold", sets: 3, reps: "30 sec", cue: "Lower back pressed flat, arms and legs long and low." },
  { name: "Russian Twists", sets: 3, reps: "20 reps", cue: "Lean back 45 degrees, rotate side to side from the core." },
  { name: "Leg Raises", sets: 3, reps: "12 reps", cue: "Lower back stays down, lower legs slowly." },
  { name: "Side Plank", sets: 3, reps: "30 sec each side", cue: "Hips stacked, don't let them sag." },
  { name: "Ab Wheel Rollout", sets: 3, reps: "8-10 reps", cue: "Roll out slow, pull back with lats and core." },
];

function pickCore(count = 2): Exercise[] {
  return [...CORE].sort(() => Math.random() - 0.5).slice(0, count);
}

// ─── Main exercise library ────────────────────────────────────────────────────

const BW_STRENGTH = {
  lose_weight: [
    { name: "Burpees", sets: 3, reps: "12 reps", cue: "Explosive jump up, controlled drop down." },
    { name: "Jump Squats", sets: 3, reps: "15 reps", cue: "Land soft, sink into squat immediately." },
    { name: "Push-Up to T Rotation", sets: 3, reps: "10 reps", cue: "Push up, rotate to side plank — control the twist." },
    { name: "Alternating Reverse Lunges", sets: 3, reps: "12 each leg", cue: "Step back, knee hovers above floor." },
    { name: "Mountain Climbers", sets: 3, reps: "40 sec", cue: "Drive knees to chest fast, keep hips level." },
    { name: "Squat to Overhead Reach", sets: 3, reps: "15 reps", cue: "Squat deep, explode up reaching overhead." },
    { name: "Plank to Downward Dog", sets: 3, reps: "10 reps", cue: "Push hips up and back, press heels toward floor." },
    { name: "Skater Hops", sets: 3, reps: "12 each side", cue: "Leap side to side, land on one foot, balance." },
  ],
  build_muscle: [
    { name: "Diamond Push-Ups", sets: 4, reps: "10-12 reps", cue: "Hands close together, elbows brush your sides." },
    { name: "Pike Push-Ups", sets: 4, reps: "10 reps", cue: "Hips high, lower head toward floor — targets shoulders." },
    { name: "Bulgarian Split Squats", sets: 4, reps: "10 each leg", cue: "Rear foot elevated, drop straight down." },
    { name: "Wide Push-Ups", sets: 4, reps: "12 reps", cue: "Hands wide, feel the chest stretch at the bottom." },
    { name: "Glute Bridge Hold", sets: 4, reps: "30 sec hold", cue: "Squeeze glutes at the top, don't let hips drop." },
    { name: "Tricep Dips (Chair)", sets: 4, reps: "12-15 reps", cue: "Elbows straight back, lower until 90 degrees." },
    { name: "Single Leg Glute Bridge", sets: 3, reps: "12 each leg", cue: "One leg extended, drive through the heel." },
    { name: "Archer Push-Ups", sets: 3, reps: "8 each side", cue: "Shift weight to one arm — harder than standard push-ups." },
  ],
  endurance: [
    { name: "High Knees Sprint", sets: 4, reps: "45 sec", cue: "Max effort — pump arms, drive knees high." },
    { name: "Lateral Shuffles", sets: 4, reps: "40 sec", cue: "Stay low, quick feet side to side." },
    { name: "Jump Rope (or simulate)", sets: 4, reps: "60 sec", cue: "Light on your feet, wrists do the work." },
    { name: "Box Step-Ups", sets: 3, reps: "15 each leg", cue: "Drive through the heel, stand fully at the top." },
    { name: "Broad Jumps", sets: 3, reps: "10 reps", cue: "Swing arms, explode forward, land soft." },
    { name: "Plank Jacks", sets: 3, reps: "30 sec", cue: "Core tight, jump feet out and in like a jumping jack." },
    { name: "Bear Crawl", sets: 3, reps: "20 meters", cue: "Knees hover 2 inches off floor — slow and controlled." },
    { name: "Tuck Jumps", sets: 3, reps: "10 reps", cue: "Pull knees to chest at the peak of each jump." },
  ],
  flexibility: [
    { name: "Sun Salutation Flow", sets: 3, reps: "5 rounds", cue: "Breathe through each pose — inhale to extend, exhale to fold." },
    { name: "Low Lunge to Hamstring Stretch", sets: 3, reps: "45 sec each side", cue: "From low lunge, straighten front leg and fold." },
    { name: "Pigeon Pose", sets: 3, reps: "60 sec each side", cue: "Keep hips square, breathe into the stretch." },
    { name: "Thoracic Rotation", sets: 3, reps: "10 each side", cue: "Hand behind head, rotate open — keep hips still." },
    { name: "Deep Squat Hold", sets: 3, reps: "45 sec", cue: "Heels down, elbows push knees open." },
    { name: "Shoulder Cross Stretch", sets: 3, reps: "30 sec each", cue: "Pull arm across chest, keep shoulder down." },
    { name: "Lying Spinal Twist", sets: 3, reps: "45 sec each side", cue: "Both shoulders on floor, breathe and relax into the twist." },
    { name: "Standing Side Bend", sets: 3, reps: "30 sec each side", cue: "Reach overhead and over, feel the entire side body stretch." },
  ],
};

const DB_STRENGTH = {
  lose_weight: [
    { name: "Dumbbell Thrusters", sets: 3, reps: "12 reps", cue: "Squat deep, press overhead in one explosive movement." },
    { name: "Dumbbell Romanian Deadlift", sets: 3, reps: "12 reps", cue: "Hinge at hips, feel the hamstring stretch, drive hips forward." },
    { name: "Renegade Rows", sets: 3, reps: "8 each arm", cue: "Plank position, row one dumbbell — don't rotate." },
    { name: "Dumbbell Lateral Lunges", sets: 3, reps: "10 each side", cue: "Step wide, sit into the side lunge, keep chest up." },
    { name: "Dumbbell Swing", sets: 3, reps: "15 reps", cue: "Hip hinge power — not a squat, it's a swing." },
    { name: "Dumbbell Push Press", sets: 3, reps: "12 reps", cue: "Slight knee dip, drive dumbbells overhead with leg power." },
    { name: "Goblet Squat", sets: 3, reps: "15 reps", cue: "Hold dumbbell at chest, squat deep, elbows inside knees." },
    { name: "Dumbbell Burpee", sets: 3, reps: "10 reps", cue: "Drop to floor with dumbbells in hands, jump up with them." },
  ],
  build_muscle: [
    { name: "Dumbbell Bench Press", sets: 4, reps: "10-12 reps", cue: "Full range — touch chest, lock out at top." },
    { name: "Dumbbell Bent Over Row", sets: 4, reps: "10-12 reps", cue: "Chest parallel to floor, pull to hip — not armpit." },
    { name: "Dumbbell Shoulder Press", sets: 4, reps: "10-12 reps", cue: "Press straight up, don't flare elbows forward." },
    { name: "Dumbbell Bicep Curls", sets: 4, reps: "12-15 reps", cue: "Slow on the way down — control the negative." },
    { name: "Dumbbell Tricep Kickbacks", sets: 4, reps: "12 reps", cue: "Upper arm parallel to floor, extend fully." },
    { name: "Dumbbell Lateral Raises", sets: 3, reps: "15 reps", cue: "Slight bend in elbow, raise to shoulder height only." },
    { name: "Dumbbell Goblet Squat", sets: 4, reps: "12 reps", cue: "Chest up, depth past parallel, pause at bottom." },
    { name: "Dumbbell Romanian Deadlift", sets: 4, reps: "10 reps", cue: "Feel the hamstring load, drive through heels to stand." },
  ],
  endurance: [
    { name: "Dumbbell Man Makers", sets: 3, reps: "8 reps", cue: "Push-up, row each arm, squat, press — one fluid movement." },
    { name: "Dumbbell Step-Ups", sets: 3, reps: "15 each leg", cue: "Drive through the heel on the box, stand tall." },
    { name: "Dumbbell Squat to Press", sets: 4, reps: "12 reps", cue: "Squat, stand, press — keep the pace up." },
    { name: "Dumbbell Walking Lunges", sets: 3, reps: "20 steps", cue: "Stay upright, big steps, keep moving." },
    { name: "Dumbbell High Pulls", sets: 3, reps: "12 reps", cue: "Pull to chin level, elbows lead the movement." },
    { name: "Dumbbell Plank Row", sets: 3, reps: "10 each arm", cue: "Stay square, controlled row, no hip rotation." },
    { name: "Dumbbell Reverse Lunge to Curl", sets: 3, reps: "10 each leg", cue: "Lunge back, curl at the bottom, stand to finish." },
    { name: "Dumbbell Deadlift to Row", sets: 3, reps: "12 reps", cue: "Deadlift, hinge, row — targets the whole posterior chain." },
  ],
  flexibility: [
    { name: "Dumbbell Overhead Reach Stretch", sets: 3, reps: "30 sec each side", cue: "Hold light dumbbell, reach overhead and lean." },
    { name: "Dumbbell Good Mornings", sets: 3, reps: "12 reps", cue: "Dumbbell on back, hinge from hips — feel the hamstrings." },
    { name: "Dumbbell Side Bend", sets: 3, reps: "12 each side", cue: "Slow and controlled, feel the oblique stretch." },
    { name: "Dumbbell Chest Fly", sets: 3, reps: "12 reps", cue: "Wide arc, feel the chest open at the bottom." },
    { name: "Dumbbell Pullover", sets: 3, reps: "12 reps", cue: "Lower behind head slowly, feel the lat and chest stretch." },
    { name: "Dumbbell Romanian Deadlift", sets: 3, reps: "12 reps", cue: "Slow hinge, max hamstring stretch, controlled return." },
    { name: "Dumbbell Cuban Press", sets: 3, reps: "10 reps", cue: "External rotation then press — opens the shoulder complex." },
    { name: "Dumbbell Wrist Circles", sets: 2, reps: "30 sec each direction", cue: "Light weight, full circle — wrist and forearm mobility." },
  ],
};

const GYM_STRENGTH = {
  lose_weight: [
    { name: "Barbell Back Squat", sets: 4, reps: "12 reps", cue: "Bar on traps, squat to parallel, drive through heels." },
    { name: "Cable Rope Face Pulls", sets: 3, reps: "15 reps", cue: "Pull to forehead, elbows flare out — rear delts." },
    { name: "Leg Press", sets: 3, reps: "15 reps", cue: "Feet hip-width, press through full range, don't lock knees." },
    { name: "Cable Woodchops", sets: 3, reps: "12 each side", cue: "Rotate from core, arms stay relatively straight." },
    { name: "Treadmill Sprint Intervals", sets: 5, reps: "30 sec on / 30 sec off", cue: "Push pace on the on, walk to recover." },
    { name: "Lat Pulldown", sets: 3, reps: "12 reps", cue: "Pull to upper chest, squeeze shoulder blades together." },
    { name: "Seated Cable Row", sets: 3, reps: "12 reps", cue: "Pull to lower chest, hold 1 sec, slow return." },
    { name: "Battle Rope Slams", sets: 3, reps: "30 sec", cue: "Full body — slam hard, keep moving." },
  ],
  build_muscle: [
    { name: "Barbell Bench Press", sets: 4, reps: "8-10 reps", cue: "Arch back slightly, bar to lower chest, full press." },
    { name: "Barbell Deadlift", sets: 4, reps: "6-8 reps", cue: "Bar over mid-foot, drive floor away, hips and chest rise together." },
    { name: "Pull-Ups / Lat Pulldown", sets: 4, reps: "8-10 reps", cue: "Full hang, pull chest to bar — don't kip." },
    { name: "Barbell Overhead Press", sets: 4, reps: "8-10 reps", cue: "Bar at collarbone, press straight up, squeeze at top." },
    { name: "Incline Dumbbell Press", sets: 3, reps: "10-12 reps", cue: "45 degree incline, full range, feel upper chest." },
    { name: "Cable Bicep Curl", sets: 3, reps: "12-15 reps", cue: "Constant tension from cable — slow negative." },
    { name: "Tricep Rope Pushdown", sets: 3, reps: "12-15 reps", cue: "Elbows fixed at sides, full extension, squeeze." },
    { name: "Leg Curl Machine", sets: 3, reps: "12 reps", cue: "Curl all the way, hold 1 sec, slow return." },
  ],
  endurance: [
    { name: "Rowing Machine", sets: 4, reps: "3 min at 80% effort", cue: "Legs, hips, arms — drive with the legs first." },
    { name: "Barbell Thrusters", sets: 4, reps: "10 reps", cue: "Front squat into overhead press — one movement." },
    { name: "Box Jumps", sets: 4, reps: "10 reps", cue: "Land softly, step down — don't jump down." },
    { name: "Sled Push", sets: 4, reps: "20 meters", cue: "Low hips, drive hard with legs, short powerful steps." },
    { name: "Jump Rope", sets: 5, reps: "2 min", cue: "Stay light, consistent rhythm, breathe through nose." },
    { name: "Assault Bike", sets: 4, reps: "45 sec all-out", cue: "Arms and legs together — push and pull simultaneously." },
    { name: "Kettlebell Swings", sets: 4, reps: "20 reps", cue: "Hip hinge power — snap hips forward, bell floats up." },
    { name: "Stair Climber", sets: 1, reps: "10 min steady", cue: "Don't hold the rails — stay upright, full steps." },
  ],
  flexibility: [
    { name: "Cable Hip Flexor Stretch", sets: 3, reps: "45 sec each side", cue: "Lunge with cable pulling forward — deep hip stretch." },
    { name: "Foam Roll — Quads", sets: 1, reps: "90 sec each leg", cue: "Roll slowly, pause on tight spots." },
    { name: "Foam Roll — Thoracic Spine", sets: 1, reps: "90 sec", cue: "Hands behind head, extend over the roller." },
    { name: "Lat Stretch on Cable", sets: 3, reps: "45 sec each side", cue: "Hold cable, lean away — feel the lat lengthen." },
    { name: "Hip 90/90 Stretch", sets: 3, reps: "60 sec each side", cue: "Both legs at 90 degrees, sit tall, lean forward." },
    { name: "Doorway Chest Stretch", sets: 3, reps: "30 sec", cue: "Arms on frame, lean forward — open the pecs." },
    { name: "Overhead Tricep Stretch", sets: 2, reps: "30 sec each arm", cue: "Elbow behind head, gently press it back." },
    { name: "Seated Piriformis Stretch", sets: 3, reps: "45 sec each side", cue: "Ankle on opposite knee, lean forward — deep glute stretch." },
  ],
};

const LIGHT_EXERCISES: Record<string, Exercise[]> = {
  lose_weight: [
    { name: "Brisk Walk", sets: 1, reps: "10 min", cue: "Arms swinging, pace just above comfortable." },
    { name: "Bodyweight Squats", sets: 2, reps: "15 reps", cue: "Full depth, controlled tempo — no jumping." },
    { name: "Walking Lunges", sets: 2, reps: "10 each leg", cue: "Slow and steady, focus on balance." },
    { name: "Push-Ups (knee or full)", sets: 2, reps: "10 reps", cue: "Pick the version that keeps form perfect." },
    { name: "Standing Core Twists", sets: 2, reps: "20 reps", cue: "Hands on hips, rotate from the waist." },
    { name: "Hip Circles", sets: 1, reps: "30 sec each way", cue: "Big slow circles to loosen the hip joint." },
    { name: "Cat-Cow", sets: 1, reps: "10 reps", cue: "Slow breath — inhale to arch, exhale to round." },
  ],
  build_muscle: [
    { name: "Light Dumbbell Rows", sets: 2, reps: "12 reps", cue: "Light weight, focus on feeling the back squeeze." },
    { name: "Wall Push-Ups", sets: 2, reps: "15 reps", cue: "Easy on the joints — warm the chest and shoulders." },
    { name: "Glute Bridges", sets: 2, reps: "15 reps", cue: "Slow and controlled, squeeze at the top." },
    { name: "Band Pull-Aparts", sets: 2, reps: "15 reps", cue: "Or substitute: arms wide and squeeze shoulder blades." },
    { name: "Calf Raises", sets: 2, reps: "20 reps", cue: "Slow up, slow down — feel the stretch at the bottom." },
    { name: "Shoulder Rolls", sets: 1, reps: "30 sec each direction", cue: "Big slow rolls, release any upper back tension." },
    { name: "Pigeon Pose", sets: 1, reps: "45 sec each side", cue: "Breathe and relax deeper with each exhale." },
  ],
  endurance: [
    { name: "Easy Jog or Brisk Walk", sets: 1, reps: "12 min", cue: "Conversational pace — you should be able to talk." },
    { name: "Jumping Jacks", sets: 2, reps: "30 sec", cue: "Easy pace, stay light on your feet." },
    { name: "Step Touch Side to Side", sets: 2, reps: "45 sec", cue: "Low impact — tap foot out to the side each time." },
    { name: "Standing Bicycle", sets: 2, reps: "20 reps", cue: "Standing crunch — knee to elbow, controlled." },
    { name: "Slow Mountain Climbers", sets: 2, reps: "10 each leg", cue: "Step one foot at a time — no rush." },
    { name: "Hamstring Curls (standing)", sets: 2, reps: "15 each leg", cue: "Curl heel to glute — hold 1 sec." },
    { name: "Standing Forward Fold", sets: 1, reps: "45 sec", cue: "Soft bend in knees, hang heavy, breathe out tension." },
  ],
  flexibility: [
    { name: "Gentle Neck Rolls", sets: 1, reps: "30 sec each direction", cue: "Slow and controlled — never force it." },
    { name: "Doorway Chest Stretch", sets: 2, reps: "30 sec", cue: "Arms on frame, lean through — open the chest." },
    { name: "Standing Hip Flexor Stretch", sets: 2, reps: "45 sec each side", cue: "Lunge position, sink forward, hips square." },
    { name: "Seated Forward Fold", sets: 2, reps: "45 sec", cue: "Reach forward, breathe into the hamstrings." },
    { name: "Lying Spinal Twist", sets: 2, reps: "45 sec each side", cue: "Let gravity do the work — don't force the rotation." },
    { name: "Figure Four Stretch", sets: 2, reps: "45 sec each side", cue: "Ankle on opposite knee, flex foot, pull toward you." },
    { name: "Child's Pose", sets: 1, reps: "60 sec", cue: "Arms extended, breathe into your back body." },
  ],
};

const DAY_STRUCTURES = [
  { focus: "full body", titles: ["The Opening Chapter", "Full Throttle", "Every Muscle, Every Rep", "Total Body Reset", "All In"] },
  { focus: "strength", titles: ["Built Different", "Iron Will", "Strength Day", "The Grind", "Heavy & Hard"] },
  { focus: "cardio", titles: ["Breathe Through It", "Heart On Fire", "Cardio Surge", "The Burn", "Push The Pace"] },
  { focus: "hiit", titles: ["No Mercy", "Interval Warfare", "HIIT Hard", "The Circuit", "All Out Effort"] },
  { focus: "mobility", titles: ["Fluid Motion", "Move Better", "Open Up", "Flexibility First", "Body Reset"] },
  { focus: "strength", titles: ["Upper Body Day", "Push & Pull", "Chest & Back", "Arm Day", "Shoulder Strong"] },
  { focus: "strength", titles: ["Lower Body Day", "Leg Day", "Quads & Glutes", "The Foundation", "Build From Below"] },
  { focus: "full body", titles: ["Halfway Hero", "Day Eight Rising", "Still Standing", "The Second Week Begins", "Momentum"] },
  { focus: "cardio", titles: ["Cardio Comeback", "Second Wind", "Keep Moving", "The Long Game", "Stay The Course"] },
  { focus: "hiit", titles: ["Intensity Spike", "The Circuit Returns", "Sweat Factory", "No Rest Day", "Burn It Down"] },
  { focus: "strength", titles: ["Power Session", "Strength Surge", "The Heavy Day", "Max Effort", "Iron Again"] },
  { focus: "full body", titles: ["Full Send", "Complete Package", "Nothing Left Out", "Top To Bottom", "Full Effort"] },
  { focus: "cardio", titles: ["Final Cardio Push", "Almost There", "Last Big Burn", "The Home Stretch", "Penultimate Push"] },
  { focus: "full body", titles: ["The Final Chapter", "Day Fourteen", "You Made It", "The Last Rep", "Full Circle"] },
];

const MOTIVATIONS = [
  "Every rep brings you closer to the version of yourself you're working toward.",
  "You don't have to be perfect — you just have to show up.",
  "The hardest part is starting. You've already won.",
  "Trust the process. The results are coming.",
  "Progress isn't always visible, but it's always happening.",
  "One more rep. One more set. One more day.",
  "Strength isn't built in a day — but it's built day by day.",
  "Your future self is cheering you on from the finish line.",
  "Pain is temporary. The pride of finishing lasts forever.",
  "You are stronger than any excuse your mind makes.",
  "Champions aren't born. They're built — exactly like this.",
  "Halfway there. The second half is where legends are made.",
  "Don't count the days. Make the days count.",
  "The body achieves what the mind believes.",
  "Two weeks of discipline. A lifetime of results.",
];

function getMainExercises(profile: Profile, dayIndex: number): Exercise[] {
  const { goal, equipment, fitness_level: level } = profile;

  let pool: Exercise[];
  if (equipment === "full gym access") pool = GYM_STRENGTH[goal];
  else if (equipment === "dumbbells at home") pool = DB_STRENGTH[goal];
  else pool = BW_STRENGTH[goal];

  const scale = (exercises: Exercise[]): Exercise[] => exercises.map(ex => ({
    ...ex,
    sets: level === "advanced" ? ex.sets + 1 : level === "beginner" ? Math.max(ex.sets - 1, 2) : ex.sets,
  }));

  const offset = (dayIndex * 3) % pool.length;
  const rotated = [...pool.slice(offset), ...pool.slice(0, offset)];
  return scale(rotated.slice(0, 6));
}

function getLightExercises(profile: Profile): Exercise[] {
  const pool = LIGHT_EXERCISES[profile.goal];
  return [...pool].sort(() => Math.random() - 0.5).slice(0, 5);
}

export function generateLocalPlan(profile: Profile): Plan {
  const workoutTimeLabel = (() => {
    const [h, m] = profile.workout_time.split(":").map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  })();

  const days: Day[] = DAY_STRUCTURES.map((structure, i) => {
    const isRestDay = i === 6 || i === 13;

    const morningExercises = pickMorningWakeup();

    const mainExercises: Exercise[] = isRestDay
      ? [
          { name: "Easy Walk", sets: 1, reps: "20 min", cue: "Comfortable pace — this is active recovery, not a workout." },
          { name: "Full Body Stretch", sets: 1, reps: "10 min", cue: "Hold each stretch 30-45 seconds, breathe deeply." },
          { name: "Foam Rolling", sets: 1, reps: "10 min", cue: "Spend extra time on sore spots." },
        ]
      : [
          ...pickWarmup(),
          ...getMainExercises(profile, i),
          ...pickCore(2),
          ...pickCooldown(),
        ];

    const lightExercises: Exercise[] = isRestDay
      ? [
          { name: "Gentle Yoga Flow", sets: 1, reps: "15 min", cue: "Follow any beginner yoga video — just move gently." },
          { name: "Deep Breathing", sets: 1, reps: "5 min", cue: "Box breathing — 4 in, 4 hold, 4 out, 4 hold." },
          { name: "Legs Up The Wall", sets: 1, reps: "5 min", cue: "Lie on back, legs vertical against wall — pure recovery." },
        ]
      : getLightExercises(profile);

    const title = structure.titles[i % structure.titles.length];
    const motivation = MOTIVATIONS[i % MOTIVATIONS.length];

    return {
      title,
      focus: isRestDay ? "rest" : structure.focus,
      motivation,
      sessions: [
        {
          kind: "movement",
          title: "Morning Wake-Up · 10-15 min",
          suggested_time: "Morning",
          exercises: morningExercises,
        },
        {
          kind: "main",
          title: isRestDay ? "Active Recovery · 40 min" : "Main Workout · 60-90 min",
          suggested_time: workoutTimeLabel,
          exercises: mainExercises,
        },
        {
          kind: "movement",
          title: isRestDay ? "Rest & Restore · 20 min" : "Light Workout · 30 min",
          suggested_time: "Anytime",
          exercises: lightExercises,
        },
      ],
    };
  });

  return {
    days,
    goal: profile.goal,
    start_date: new Date().toISOString().split("T")[0],
    id: crypto.randomUUID(),
  };
}
