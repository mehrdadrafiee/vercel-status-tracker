"use client";

import ProjectAccordion from "@/components/ProjectAccordion";
import { Accordion } from "@/components/ui/accordion";
import { DeploymentProps } from "@/types/deployments";
import React from "react";
import { ArrowUpRightIcon, RefreshCw, StarIcon } from "lucide-react";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast"
import Link from "next/link";
export default function Home() {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [starsCount, setStarsCount] = React.useState<number>(0);
  const [deployments, setDeployments] = React.useState<DeploymentProps[]>([]);
  const [groupedDeployments, setGroupedDeployments] = React.useState<{ [key: string]: DeploymentProps[] }>({});
  const [teamIdValue, setTeamIdValue] = React.useState<string>("");
  const [apiTokenValue, setApiTokenValue] = React.useState<string>("");

  const groupDeploymentsByName = (deployments: DeploymentProps[]) => {
    return deployments.reduce((acc: { [key: string]: DeploymentProps[] }, deployment) => {
      acc[deployment.name] = acc[deployment.name] || [];
      acc[deployment.name].push(deployment);
      return acc;
    }, {});
  };

  const fetchDeployments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!teamIdValue && !process.env.NEXT_PUBLIC_VERCEL_TEAM_ID) {
        throw new Error("Team ID is required");
      }
      
      if (!apiTokenValue && !process.env.NEXT_PUBLIC_VERCEL_API_TOKEN) {
        throw new Error("API Token is required");
      }

      const response = await fetch("/api/vercel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teamId: teamIdValue || process.env.NEXT_PUBLIC_VERCEL_TEAM_ID,
          apiToken: apiTokenValue || process.env.NEXT_PUBLIC_VERCEL_API_TOKEN
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch deployments");
      }
      
      const deployments = data.deployments.reverse();

      setDeployments(deployments);
      setGroupedDeployments(groupDeploymentsByName(deployments));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to fetch deployments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStarsCount = async () => {
    const res = await fetch("https://api.github.com/repos/mehrdadrafiee/vercel-status-tracker");
    const data = await res.json();
    setStarsCount(data.stargazers_count);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchDeployments();
    setIsRefreshing(false);
  };

  React.useEffect(() => {
    fetchDeployments();
    fetchStarsCount();
  }, []);

  const getProjectStats = () => {
    const stats = {
      totalDeployments: deployments.length || 0,
      successfulDeployments: deployments.filter(d => d.state === "READY").length || 0,
      averageBuildTime: deployments.reduce((acc, d) => acc + (d.ready - d.buildingAt), 0) / deployments.length / 1000 || 0,
      mostActiveProject: Object.entries(groupedDeployments)
        .sort(([,a], [,b]) => b.length - a.length)[0]?.[0] || "None",
      recentActivity: deployments.slice(0, 5)
    };
    return stats;
  };

  return (
    <div className="flex flex-col min-h-screen p-4 gap-4 sm:p-4 font-[family-name:var(--font-geist-sans)] bg-gray-100">
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
      
      <div className="flex flex-col sm:flex-row justify-around items-center gap-2 w-full max-w-4xl mx-auto mb-8">
        <div className="space-y-2 flex-1">
          <Input
            value={teamIdValue}
            className="bg-white"
            placeholder="Vercel team id: team_xxxxxx"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTeamIdValue(e.target.value)}
          />
        </div>
        <div className="space-y-2 flex-1">
          <Input
            type="password"
            value={apiTokenValue}
            className="bg-white"
            placeholder="Vercel API Token"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setApiTokenValue(e.target.value)}
          />
        </div>
        <Button variant="outline" className="bg-white hover:shadow-md" onClick={handleRefresh}>Fetch Deployments</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 w-full max-w-4xl mx-auto mb-8">
        <div className="flex-1 bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-sm text-gray-500">Total Deployments</h3>
          <p className="text-2xl font-bold">{getProjectStats().totalDeployments}</p>
        </div>
        <div className="flex-1 bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-sm text-gray-500">Success Rate</h3>
          <p className="text-2xl font-bold">
            {((getProjectStats().successfulDeployments / getProjectStats().totalDeployments) * 100).toFixed(1)}%
          </p>
        </div>
        <div className="flex-1 bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-sm text-gray-500">Avg Build Time</h3>
          <p className="text-2xl font-bold">{getProjectStats().averageBuildTime.toFixed(1)}s</p>
        </div>
        <div className="flex-1 bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-sm text-gray-500">Most Active</h3>
          <p className="text-2xl font-bold truncate">{getProjectStats().mostActiveProject}</p>
        </div>
      </div>

      <div className="flex justify-between items-center mx-auto w-full max-w-4xl mb-8">
        <h1 className="text-2xl font-bold">Vercel Deployments | {deployments.length}</h1>
        <Button 
          variant="outline"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="gap-2 bg-white hover:shadow-md"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      <main className="flex flex-col flex-wrap gap-2 justify-center items-center w-full max-w-4xl mx-auto">  
        {loading ? (
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <p className="text-lg text-gray-700">Loading deployments...</p>
          </div>
        ) : error ? (
          <div className="text-center space-y-2">
            <p>Please enter valid Vercel Team ID and API Token.</p>
            <small className="text-sm text-gray-500">
              Get your {' '}
              <span className="font-bold text-blue-500">
                <Link href="https://vercel.com/docs/accounts/create-a-team#find-your-team-id">Team ID</Link>
              </span> and {' '}
              <span className="font-bold text-blue-500">
                <Link href="https://vercel.com/guides/how-do-i-use-a-vercel-api-access-token">API Token</Link>
              </span> from Vercel.
            </small>
          </div>
         ) : (
           Object.entries(groupedDeployments).map(([name, deployments]) => (
             <Accordion key={name} type="single" collapsible className="w-full max-w-4xl">
               <ProjectAccordion name={name} deployments={deployments} />
             </Accordion>
           ))
         )}
      </main>
      
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
    </div>
  );
}
