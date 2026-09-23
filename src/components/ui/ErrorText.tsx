export const ErrorText = ({ children }: { children: React.ReactNode }) => (
  <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 dark:bg-red-900/20 dark:border-red-900/40 dark:text-red-400">
    {children}
  </p>
);
