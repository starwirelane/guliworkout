import { useEffect, useState } from "react";
            <div className="mb-4 flex items-center justify-between">
              <h2 className="serif text-2xl font-bold">{currentSession?.title}</h2>
              <span className="text-sm font-semibold text-foreground/50">
                {currentExercises.filter((_, i) => completed[`${todayIndex}-${activeSession}-${i}`]).length}/{currentExercises.length}
              </span>
            </div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-foreground/40">
              {currentSession?.kind === "main" ? "Goal-focused session" : currentSession?.suggested_time}
            </div>
            <div className="mb-6 h-2 overflow-hidden rounded-full bg-foreground/10">
              <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${currentExercises.length ? (currentExercises.filter((_, i) => completed[`${todayIndex}-${activeSession}-${i}`]).length / currentExercises.length) * 100 : 0}%` }} />
            </div>

            <ul className="space-y-2">
              {currentExercises.map((ex, i) => {
                const done = completed[`${todayIndex}-${activeSession}-${i}`];
                const active = i === activeExIdx;
                return (
                  <li key={i}>
                    <div className={`flex items-start gap-3 rounded-2xl border-2 p-4 transition ${active ? "border-primary bg-primary/5" : done ? "border-foreground/5 bg-transparent" : "border-foreground/10 bg-background/50 hover:border-foreground/25"}`}>
                      <button onClick={(e) => { e.stopPropagation(); toggle(activeSession, i); }} className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition ${done ? "border-primary bg-primary text-primary-foreground" : "border-foreground/30 hover:border-primary"}`}>
                        {done && <span className="text-sm">✓</span>}
                      </button>
                      <button onClick={() => setActiveExIdx(i)} className="flex-1 text-left">
                        <div className="flex items-baseline justify-between gap-2">
                          <div className={`serif text-lg font-bold transition ${done ? "text-foreground/40 line-through" : "text-foreground"}`}>{ex.name}</div>
                          <div className="shrink-0 text-xs font-semibold text-primary">{ex.sets > 1 ? `${ex.sets} ×` : ""} {ex.reps}</div>
                        </div>
                        {active && !done && <p className="mt-1 text-sm text-foreground/60">{ex.cue}</p>}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="relative overflow-hidden rounded-3xl border-2 border-foreground/10 bg-gradient-to-br from-blush/40 via-card to-accent/30 p-6 md:p-10">
            <div className="absolute inset-0 paper opacity-40" />
            {activeEx ? (
              <div className="relative z-10 flex h-full flex-col">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-widest text-foreground/50">Exercise {activeExIdx + 1} of {currentExercises.length}</span>
                  <span className="rounded-full bg-foreground px-3 py-1 text-xs font-bold uppercase tracking-wider text-background">{activeEx.sets > 1 ? `${activeEx.sets} × ` : ""}{activeEx.reps}</span>
                </div>
                <div className="my-4 flex flex-1 items-center justify-center">
                  <img key={activeEx.name + activeExIdx} src={activeImg} alt={activeEx.name} className="floaty max-h-[400px] w-auto object-contain" width={768} height={768} loading="lazy" />
                </div>
                <div>
                  <h3 className="serif text-3xl font-bold leading-tight md:text-4xl">{activeEx.name}</h3>
                  <p className="mt-2 text-base text-foreground/70">{activeEx.cue}</p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button onClick={() => toggle(activeSession, activeExIdx)} className={`rounded-full px-6 py-3 text-sm font-semibold transition ${completed[`${todayIndex}-${activeSession}-${activeExIdx}`] ? "border-2 border-foreground/20 bg-transparent hover:bg-foreground/5" : "bg-primary text-primary-foreground hover:scale-[1.02]"}`}>
                      {completed[`${todayIndex}-${activeSession}-${activeExIdx}`] ? "↺ Mark undone" : "✓ Mark done"}
                    </button>
                    {activeExIdx < currentExercises.length - 1 && (
                      <button onClick={() => setActiveExIdx(activeExIdx + 1)} className="rounded-full border-2 border-foreground/20 px-6 py-3 text-sm font-semibold hover:bg-foreground/5">
                        Next →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative z-10 flex h-full items-center justify-center">
                <p className="serif text-2xl text-foreground/40">Select an exercise</p>
              </div>
            )}
          </section>
        </div>

        <div className="mt-6 rounded-2xl border-2 border-foreground/10 bg-card px-6 py-4">
          <div className="flex items-center justify-between text-sm font-semibold">
            <span className="text-foreground/60">Today's overall progress</span>
            <span className="text-primary">{doneAll}/{totalAll} exercises</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-foreground/10">
            <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${totalAll ? (doneAll / totalAll) * 100 : 0}%` }} />
          </div>
        </div>

        {allDone && (
          <div className="mt-6 rounded-2xl bg-primary/10 p-5 text-center">
            <p className="serif text-xl font-bold">All sessions complete. ✦</p>
            <p className="mt-1 text-sm text-foreground/60">Nice work. See you tomorrow.</p>
          </div>
        )}
      </main>
    </div>
  );
}
