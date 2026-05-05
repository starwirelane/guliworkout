import pushup from "@/assets/ex-pushup.png";
import squat from "@/assets/ex-squat.png";
import lunge from "@/assets/ex-lunge.png";
import plank from "@/assets/ex-plank.png";
import cardio from "@/assets/ex-cardio.png";
import run from "@/assets/ex-run.png";
import stretch from "@/assets/ex-stretch.png";
import dumbbell from "@/assets/ex-dumbbell.png";
import core from "@/assets/ex-core.png";
import rest from "@/assets/ex-rest.png";

// Match an exercise name → an illustration.
export function pickExerciseImage(name: string): string {
  const n = name.toLowerCase();
  if (/(rest|recover|sleep|meditat|breath)/.test(n)) return rest;
  if (/(push.?up|chest|bench|dip)/.test(n)) return pushup;
  if (/(squat|wall sit|glute bridge|hip thrust)/.test(n)) return squat;
  if (/(lunge|step.?up|split)/.test(n)) return lunge;
  if (/(plank|hollow|side.?plank)/.test(n)) return plank;
  if (/(jump|burpee|jack|skater|mountain climber|hiit)/.test(n)) return cardio;
  if (/(run|jog|sprint|walk|treadmill|cycle|bike|row)/.test(n)) return run;
  if (/(stretch|yoga|cobra|child|cat|cow|downward|pigeon|mobility|hamstring|hip)/.test(n))
    return stretch;
  if (/(curl|press|row|deadlift|raise|fly|dumbbell|barbell|pull|chin)/.test(n))
    return dumbbell;
  if (/(crunch|sit.?up|abs|leg raise|russian|bicycle|v.?up)/.test(n)) return core;
  return dumbbell;
}
