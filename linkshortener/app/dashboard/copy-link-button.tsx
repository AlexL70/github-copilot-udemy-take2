"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Link } from "@/db/schema";

interface CopyLinkButtonProps {
  link: Link;
}

export function CopyLinkButton({ link }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const shortUrl = `${window.location.origin}/${link.shortCode}`;
    await navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className="border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50"
    >
      {copied ? "Copied!" : "Copy"}
    </Button>
  );
}
