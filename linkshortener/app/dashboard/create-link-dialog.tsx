"use client";

import { useState } from "react";
import { createLinkAction } from "./actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateLinkDialog() {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [shortCode, setShortCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Call server action with typed data
    const result = await createLinkAction({
      originalUrl: url,
      shortCode: shortCode.trim() || undefined,
    });

    if (result.success) {
      setUrl("");
      setShortCode("");
      setOpen(false);
      // Success - dialog will close and page will revalidate
    } else {
      // Handle error
      setError(result.error ?? null);
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
          Create Link
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-zinc-900 dark:text-zinc-50">
            Create Short Link
          </DialogTitle>
          <DialogDescription className="text-zinc-600 dark:text-zinc-400">
            Enter a URL to generate a shortened link.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="url"
              className="text-sm font-medium text-zinc-900 dark:text-zinc-50"
            >
              URL
            </Label>
            <Input
              id="url"
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
              htmlFor="shortCode"
              className="text-sm font-medium text-zinc-900 dark:text-zinc-50"
            >
              Short Code (optional)
            </Label>
            <Input
              id="shortCode"
              type="text"
              placeholder="Leave empty to auto-generate"
              value={shortCode}
              onChange={(e) => setShortCode(e.target.value)}
              disabled={loading}
              maxLength={10}
              className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50"
            />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Custom short code (letters, numbers, hyphens, and underscores
              only)
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
              onClick={() => setOpen(false)}
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
              {loading ? "Creating..." : "Create Link"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
