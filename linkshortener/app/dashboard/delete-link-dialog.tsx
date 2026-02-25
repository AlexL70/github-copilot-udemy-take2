"use client";

import { useState } from "react";
import { deleteLinkAction } from "./actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Link } from "@/db/schema";

interface DeleteLinkDialogProps {
  link: Link;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteLinkDialog({
  link,
  open,
  onOpenChange,
}: DeleteLinkDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    // Call server action to delete the link
    const result = await deleteLinkAction({
      linkId: link.id,
    });

    if (result.success) {
      onOpenChange(false);
      // Success - dialog will close and page will revalidate
    } else {
      // Handle error
      setError(result.error ?? null);
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-zinc-900 dark:text-zinc-50">
            Delete Link
          </DialogTitle>
          <DialogDescription className="text-zinc-600 dark:text-zinc-400">
            Are you sure you want to delete this link? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-4">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-1">
              Short code: <span className="font-mono">{link.shortCode}</span>
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 break-all">
              URL: {link.originalUrl}
            </p>
          </div>
        </div>
        {error && (
          <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
        )}
        <DialogFooter className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
          >
            {loading ? "Deleting..." : "Delete Link"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
