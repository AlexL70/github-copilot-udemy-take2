"use client";

import { useState } from "react";
import { updateLinkAction } from "./actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Link } from "@/db/schema";

interface EditLinkDialogProps {
  link: Link;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditLinkDialog({
  link,
  open,
  onOpenChange,
}: EditLinkDialogProps) {
  const [url, setUrl] = useState(link.originalUrl);
  const [shortCode, setShortCode] = useState(link.shortCode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      // Reset form when opening
      setUrl(link.originalUrl);
      setShortCode(link.shortCode);
      setError(null);
    }
    onOpenChange(newOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Call server action with typed data
    const result = await updateLinkAction({
      linkId: link.id,
      originalUrl: url,
      shortCode: shortCode.trim(),
    });

    if (result.success) {
      handleOpenChange(false);
      // Success - dialog will close and page will revalidate
    } else {
      // Handle error
      setError(result.error ?? null);
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-106.25 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-zinc-900 dark:text-zinc-50">
            Edit Link
          </DialogTitle>
          <DialogDescription className="text-zinc-600 dark:text-zinc-400">
            Update your shortened link details.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="edit-url"
              className="text-sm font-medium text-zinc-900 dark:text-zinc-50"
            >
              URL
            </Label>
            <Input
              id="edit-url"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              disabled={loading}
              className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="edit-shortCode"
              className="text-sm font-medium text-zinc-900 dark:text-zinc-50"
            >
              Short Code
            </Label>
            <Input
              id="edit-shortCode"
              type="text"
              placeholder="my-link"
              value={shortCode}
              onChange={(e) => setShortCode(e.target.value)}
              required
              disabled={loading}
              maxLength={10}
              className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50"
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Short code (letters, numbers, hyphens, and underscores only)
            </p>
          </div>
          {error && (
            <div className="text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
              className="border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {loading ? "Updating..." : "Update Link"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
