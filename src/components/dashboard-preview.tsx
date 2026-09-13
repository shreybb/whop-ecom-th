export function DashboardPreview() {
  return (
    <section className="section-padding gradient-bg">
      <div className="container mx-auto">
        <div className="glass-card mx-auto max-w-3xl overflow-hidden rounded-2xl">
          <div className="flex items-center gap-2 border-b border-border/50 px-4 py-3">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <div className="h-3 w-3 rounded-full bg-yellow-500" />
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <span className="ml-2 text-xs text-muted-foreground">Northstar Member Dashboard</span>
          </div>
          <div className="grid gap-4 p-6 sm:grid-cols-3">
            <div className="glass-card rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-primary">Wk 7</p>
              <p className="mt-1 text-xs text-muted-foreground">Current Week</p>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-primary">-14lb</p>
              <p className="mt-1 text-xs text-muted-foreground">Total Change</p>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-primary">28/28</p>
              <p className="mt-1 text-xs text-muted-foreground">Workouts Done</p>
            </div>
          </div>
          <div className="px-6 pb-6">
            <div className="rounded-xl bg-secondary p-4">
              <p className="mb-2 text-sm font-semibold">This Week: Intensity Phase</p>
              <div className="space-y-2">
                {["Monday — Lower Body (Squat Focus)", "Wednesday — Upper Body (Press Focus)", "Friday — Lower Body (Hinge Focus)", "Saturday — Upper Body (Pull Focus)"].map((s) => (
                  <div key={s} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    {s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
