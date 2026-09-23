"use client";

import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { setCompletedKitNotice } from "@/lib/uiSlice";

export const KitCompletionModal = () => {
  const notice = useAppSelector((s) => s.ui.completedKitNotice);
  const dispatch = useAppDispatch();
  const router = useRouter();

  if (!notice) return null;

  const dismiss = () => dispatch(setCompletedKitNotice(null));
  const isReady = notice.status === "ready";

  return (
    <Modal onClose={dismiss}>
      <h2 className="font-semibold text-foreground mb-2">{isReady ? "Kit is ready" : "Generation failed"}</h2>
      <p className="text-sm text-muted mb-6">
        {isReady
          ? `"${notice.role}" at ${notice.company} finished generating.`
          : `"${notice.role}" at ${notice.company} couldn't be generated. You can try creating it again.`}
      </p>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={dismiss}>Later</Button>
        <Button
          onClick={() => {
            dismiss();
            router.push(`/dashboard/kits/${notice.id}`);
          }}
        >
          Open
        </Button>
      </div>
    </Modal>
  );
};
