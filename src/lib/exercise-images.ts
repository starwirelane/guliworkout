// Maps exercise names to illustration paths.
// Place your image files in src/assets/ with these exact names.
const imgs = {
  pushup: new URL("../assets/ex-pushup.png", import.meta.url).href,
  squat: new URL("../assets/ex-squat.png", import.meta.url).href,
  lunge: new URL("../assets/ex-lunge.png", import.meta.url).href,
  plank: new URL("../assets/ex-plank.png", import.meta.url).href,
  cardio: new URL("../assets/ex-cardio.png", import.meta.url).href,
  run: new URL("../assets/ex-run.png", import.meta.url).href,
  stretch: new URL("../assets/ex-stretch.png", import.meta.url).href,
  dumbbell: new URL("../assets/ex-dumbbell.png", import.meta.url).href,
  core: new URL("../assets/ex-core.png", import.meta.url).href,
  rest: new URL("../assets/ex-rest.png", import.meta.url).href,
};

export function pickExerciseImage(name: string): string {
  const n = name.toLowerCase();
  if (/(rest|recover|sleep|meditat|breath)/.test(n)) return imgs.rest;
  if (/(push.?up|chest|bench|dip)/.test(n)) return imgs.pushup;
  if (/(squat|wall sit|glute bridge|hip thrust)/.test(n)) return imgs.squat;
  if (/(lunge|step.?up|split)/.test(n)) return imgs.lunge;
  if (/(plank|hollow|side.?plank)/.test(n)) return imgs.plank;
  if (/(jump|burpee|jack|skater|mountain climber|hiit)/.test(n)) return imgs.cardio;
  if (/(run|jog|sprint|walk|treadmill|cycle|bike|row)/.test(n)) return imgs.run;
  if (/(stretch|yoga|cobra|child|cat|cow|downward|pigeon|mobility|hamstring|hip)/.test(n)) return imgs.stretch;
  if (/(curl|press|row|deadlift|raise|fly|dumbbell|barbell|pull|chin)/.test(n)) return imgs.dumbbell;
  if (/(crunch|sit.?up|abs|leg raise|russian|bicycle|v.?up)/.test(n)) return imgs.core;
  return imgs.dumbbell;
}
