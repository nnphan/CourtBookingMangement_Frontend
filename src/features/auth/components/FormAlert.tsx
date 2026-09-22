export const FormAlert = ({ message }: { message?: string }) =>
  message ? (
    <p
      role="alert"
      className="mb-4 rounded-[var(--radius-field)] border border-danger/30 bg-danger/5 px-4 py-3 text-sm font-medium text-danger"
    >
      {message}
    </p>
  ) : null;
