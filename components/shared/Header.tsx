import React from "react";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { ArrowUpRightIcon, MoonIcon, StarIcon, SunIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import Link from "next/link";

export default function Header() {
  const [starsCount, setStarsCount] = React.useState<number>(0);
  const { theme, setTheme } = useTheme();

  const fetchStarsCount = async () => {
    const response = await fetch("https://api.github.com/repos/mehrdadrafiee/vercel-status-tracker");
    const data = await response.json();
    setStarsCount(data.stargazers_count || 0);
  };

  React.useEffect(() => {
    fetchStarsCount();
  }, []);

  return (
    <header className="flex justify-between w-full max-w-4xl mx-auto font-mono mb-8">
      <Button className="p-0" variant="link" asChild>
        <Link href="https://github.com/mehrdadrafiee">@mehrdadrafiee</Link>
      </Button>
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {theme === "dark" ? <SunIcon size={16} /> : <MoonIcon size={16} />}
        </Button>
        <Button variant="outline">
          <a href="https://github.com/mehrdadrafiee/vercel-status-tracker" className="flex items-center" target="_blank" rel="noopener noreferrer">
            <GitHubLogoIcon className="fill-current h-4 w-4 mr-4" />
            <StarIcon fill="currentColor" className="h-3 w-3 text-yellow-500 mr-1" />
            <span className="font-semibold">{starsCount}</span>
            <ArrowUpRightIcon className="h-4 w-4 ml-4" />
          </a>
        </Button>
      </div>
    </header>
  );
}

