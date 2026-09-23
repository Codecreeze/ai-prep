export const AuthLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex-1 grid lg:grid-cols-2">
    <div className="hidden lg:flex flex-col justify-between bg-primary text-white p-10">
      <span className="font-semibold text-lg">AI Interview Prep Kit</span>
      <div>
        <p className="text-2xl font-semibold leading-snug mb-3">
          Paste a job description. Get a research-backed prep kit in minutes.
        </p>
        <p className="text-indigo-100 text-sm max-w-sm">
          Company brief, role breakdown, question bank, flashcards, and a day-by-day
          schedule — built from the actual job posting and company site.
        </p>
      </div>
      <p className="text-indigo-200 text-xs">Built for the Trao engineering assessment</p>
    </div>
    <div className="flex items-center justify-center p-6 sm:p-10">{children}</div>
  </div>
);
