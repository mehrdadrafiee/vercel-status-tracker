import React from "react";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { ArrowUpRightIcon, StarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  const [starsCount, setStarsCount] = React.useState<number>(0);

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
          <a href="https://github.com/mehrdadrafiee">@mehrdadrafiee</a>
        </Button>
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" className="bg-white hover:shadow-md" asChild>
            <a href="https://github.com/mehrdadrafiee/vercel-status-tracker" className="flex items-center">
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

