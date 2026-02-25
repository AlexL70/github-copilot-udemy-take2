"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DeleteLinkDialog } from "./delete-link-dialog";
import type { Link } from "@/db/schema";

interface DeleteLinkButtonProps {
  link: Link;
}

export function DeleteLinkButton({ link }: DeleteLinkButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setDialogOpen(true)}
        className="border-zinc-200 dark:border-zinc-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
      >
        Delete
      </Button>

      <DeleteLinkDialog
        link={link}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}
