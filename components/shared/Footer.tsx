import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="flex gap-4 flex-wrap items-center justify-center mt-8">
      <p className="text-sm text-gray-500">Built with:</p>
      <Button variant="link" asChild>
        <Link href="https://nextjs.org">
          Next.js
        </Link>
      </Button>
      <Button variant="link" asChild>
        <Link href="https://tailwindcss.com">
          TailwindCSS
        </Link>
      </Button>
      <Button variant="link" asChild>
        <Link href="https://ui.shadcn.com">
          Shadcn/UI
        </Link>
      </Button>
    </footer>
  );
}