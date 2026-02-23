import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserLinks } from "@/data/links";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreateLinkDialog } from "./create-link-dialog";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const userLinks = await getUserLinks(userId);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
            Your Links
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Manage and track your shortened links
          </p>
        </div>
        <CreateLinkDialog />
      </div>

      {userLinks.length === 0 ? (
        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <CardTitle>No links yet</CardTitle>
            <CardDescription>
              Create your first shortened link to get started
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4">
          {userLinks.map((link) => (
            <Card
              key={link.id}
              className="border-zinc-200 dark:border-zinc-800"
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg mb-2 truncate">
                      {link.originalUrl}
                    </CardTitle>
                    <CardDescription>
                      Short code:{" "}
                      <Badge
                        variant="outline"
                        className="font-mono text-xs ml-1"
                      >
                        {link.shortCode}
                      </Badge>
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    Copy
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
                  <span>
                    Created: {new Date(link.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
