import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Construction, Home } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Skills (Under Construction)",
  description: "My technical skills and technology stack",
};

export default function Skills() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-8 text-center">
      <Card className="flex w-full max-w-md flex-col items-center gap-6 p-8 shadow-lg">
        <div className="rounded-full bg-primary/10 p-4">
          <Construction className="size-12 text-primary animate-pulse" />
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold sm:text-3xl">Work in Progress</h1>
          <p className="text-muted-foreground text-balance">
            I&apos;m currently crafting this section to showcase my technical arsenal.
            Check back soon for a detailed breakdown!
          </p>
        </div>

        <Link href="/">
          <Button variant="default" className="gap-2">
            <Home className="size-4" />
            Return Home
          </Button>
        </Link>
      </Card>
    </div>
  );
}
