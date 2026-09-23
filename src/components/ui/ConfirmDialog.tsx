import { Modal } from "./Modal";
import { Button } from "./Button";

type ConfirmDialogProps = {
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

// Generic confirm-before-destructive-action dialog — used for every irreversible
// click in the app (delete a kit, sign out) so nothing fires on a single accidental click.
export const ConfirmDialog = ({ title, message, confirmLabel = "Confirm", danger, onConfirm, onCancel }: ConfirmDialogProps) => (
  <Modal onClose={onCancel}>
    <h2 className="font-semibold text-foreground mb-2">{title}</h2>
    <p className="text-sm text-muted mb-6">{message}</p>
    <div className="flex justify-end gap-2">
      <Button variant="secondary" onClick={onCancel}>Cancel</Button>
      <Button variant={danger ? "danger" : "primary"} onClick={onConfirm}>{confirmLabel}</Button>
    </div>
  </Modal>
);
