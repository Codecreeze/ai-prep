export const SectionHeading = ({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) => (
  <div className="flex items-center justify-between mb-3">
    <h2 className="font-semibold text-foreground text-lg">{children}</h2>
    {action}
  </div>
);
