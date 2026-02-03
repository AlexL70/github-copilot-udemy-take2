import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SignUpButton } from "@clerk/nextjs";
import { Link2, Zap, Shield, BarChart3, Clock, Sparkles } from "lucide-react";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-black dark:to-zinc-950">
      <main className="container mx-auto px-4 py-16 md:py-24">
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center mb-24">
          <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 dark:bg-primary/20">
            <Sparkles className="mr-1 h-3 w-3" />
            Simple. Fast. Secure.
          </Badge>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-6 max-w-4xl">
            Shorten Links,
            <span className="text-primary"> Amplify Impact</span>
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 mb-10 max-w-2xl">
            Create short, memorable links in seconds. Track clicks, manage your URLs, 
            and share with confidence. Built for professionals who value simplicity and security.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <SignUpButton mode="modal">
              <Button size="lg" className="text-base">
                Get Started Free
              </Button>
            </SignUpButton>
            <Button size="lg" variant="outline" className="text-base">
              See How It Works
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              Powerful features designed to make link management effortless
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-zinc-200 dark:border-zinc-800">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4">
                  <Link2 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Instant Short Links</CardTitle>
                <CardDescription>
                  Create short, branded links in milliseconds. No hassle, no complexity.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-zinc-200 dark:border-zinc-800">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Lightning Fast</CardTitle>
                <CardDescription>
                  Built on modern infrastructure for blazing-fast redirects and zero downtime.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-zinc-200 dark:border-zinc-800">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Secure & Private</CardTitle>
                <CardDescription>
                  Your data is encrypted and protected. We never share your links or analytics.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-zinc-200 dark:border-zinc-800">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Click Analytics</CardTitle>
                <CardDescription>
                  Track link performance with real-time click counts and engagement metrics.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-zinc-200 dark:border-zinc-800">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Link Management</CardTitle>
                <CardDescription>
                  Organize, edit, and manage all your links from a single, intuitive dashboard.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-zinc-200 dark:border-zinc-800">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Clean Experience</CardTitle>
                <CardDescription>
                  Beautiful, modern interface that works seamlessly in light and dark mode.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="mb-24">
          <Card className="border-zinc-200 dark:border-zinc-800 bg-gradient-to-br from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-950">
            <CardContent className="p-8 md:p-12">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                  Perfect For Every Use Case
                </h2>
                <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
                  Whether you&apos;re a marketer, developer, or content creator
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-5xl mb-4">🚀</div>
                  <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                    Marketing Campaigns
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    Track campaign performance with clean, shareable links
                  </p>
                </div>

                <div className="text-center">
                  <div className="text-5xl mb-4">📱</div>
                  <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                    Social Media
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    Share beautiful short links that fit perfectly in your posts
                  </p>
                </div>

                <div className="text-center">
                  <div className="text-5xl mb-4">💼</div>
                  <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                    Professional Use
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    Maintain a professional image with custom branded links
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <div className="inline-block rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8 max-w-xl mx-auto">
              Join thousands of users who trust Linkshortener for their link management needs.
            </p>
            <SignUpButton mode="modal">
              <Button size="lg" className="text-base">
                Create Your Free Account
              </Button>
            </SignUpButton>
          </div>
        </section>
      </main>
    </div>
  );
}
