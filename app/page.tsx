"use client";

import ProjectAccordion from "@/components/ProjectAccordion";
import { Accordion } from "@/components/ui/accordion";
import { DeploymentProps } from "@/types/deployments";
import React from "react";
import { ArrowUpRightIcon, RefreshCw, StarIcon, GithubIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast"

export default function Home() {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [starsCount, setStarsCount] = React.useState<number>(0);
  const [deployments, setDeployments] = React.useState<DeploymentProps[]>([]);
  const [groupedDeployments, setGroupedDeployments] = React.useState<{ [key: string]: DeploymentProps[] }>({});
  // const [teamId, setTeamId] = React.useState<string>("");
  // const [apiToken, setApiToken] = React.useState<string>("");

  const groupDeploymentsByName = (deployments: DeploymentProps[]) => {
    return deployments.reduce((acc: { [key: string]: DeploymentProps[] }, deployment) => {
      acc[deployment.name] = acc[deployment.name] || [];
      acc[deployment.name].push(deployment);
      return acc;
    }, {});
  };

  const fetchDeployments = async () => {
    // if (!teamId || !apiToken) {
    //   toast({
    //     title: "Missing credentials",
    //     description: "Please provide both Team ID and API Token",
    //     variant: "destructive",
    //   });
    //   return;
    // }

    try {
      setLoading(true);
      const response = await fetch("/api/vercel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // body: JSON.stringify({ teamId, apiToken }),
      });
      
      if (!response.ok) {
        throw new Error("Invalid credentials or API error");
      }
      
      const data = await response.json();
      const deployments = data.deployments;
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
    <div className="flex flex-col min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-gray-100">
      {/* <div className="flex justify-around items-center gap-2 w-1/2 mx-auto">
        <div className="space-y-2 flex-1">
          <Input
            placeholder="Vercel team id: team_xxxxxx"
            value={teamId}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTeamId(e.target.value)}
          />
        </div>
        <div className="space-y-2 flex-1">
          <Input
            type="password"
            placeholder="Vercel API Token"
            value={apiToken}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setApiToken(e.target.value)}
          />
        </div>
        <Button variant="outline" onClick={handleRefresh}>Fetch Deployments</Button>
      </div> */}
      <header className="flex justify-between w-1/2 mx-auto font-mono">
        <Button className="p-0" variant="link" asChild>
          <a href="https://github.com/mehrdadrafiee">@mehrdadrafiee</a>
        </Button>
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" asChild>
            <a href="https://github.com/mehrdadrafiee/vercel-status-tracker" className="flex items-center">
              <GithubIcon className="fill-current h-4 w-4 mr-4" />
              <StarIcon fill="currentColor" className="h-3 w-3 text-yellow-500 mr-1" />
              <span className="font-semibold">{starsCount}</span>
              <ArrowUpRightIcon className="h-4 w-4 ml-4" />
            </a>
          </Button>
        </div>
      </header>
      <div className="flex gap-4 w-1/2 mx-auto">
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

      <div className="flex justify-between items-center mx-auto w-1/2">
        <h1 className="text-2xl font-bold">Vercel Deployments | {deployments.length}</h1>
        <Button 
          variant="outline"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      <main className="flex flex-col flex-wrap gap-2 justify-center items-center">
        {/* {!(teamId && apiToken) ? (
          <p className="text-lg text-gray-700">Please provide both Team ID and API Token.</p>
        ) : ( */}
        {
          loading ? (
            <p className="text-lg text-gray-700">Loading...</p>
          ) : error ? (
            <p className="text-lg text-red-500">Error: {error}</p>
          ) : (
            Object.entries(groupedDeployments).map(([name, deployments]) => (
              <Accordion key={name} type="single" collapsible className="w-1/2">
                <ProjectAccordion name={name} deployments={deployments} />
              </Accordion>
            ))
          )
        }
        {/* )} */}
      </main>
      <footer className="flex gap-6 flex-wrap items-center justify-center mt-8">
        
      </footer>
    </div>
  );
}
