"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EditLinkDialog } from "./edit-link-dialog";
import type { Link } from "@/db/schema";

interface EditLinkButtonProps {
  link: Link;
}

export function EditLinkButton({ link }: EditLinkButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setDialogOpen(true)}
        className="border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50"
      >
        Edit
      </Button>

      <EditLinkDialog
        link={link}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}
