"use client";

import ProjectAccordion from "@/components/ProjectAccordion";
import { Accordion } from "@/components/ui/accordion";
import { DeploymentProps } from "@/types/deployments";
import React from "react";
import { RefreshCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast"
import Link from "next/link";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";

export default function Home() {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchDeployments();
    setIsRefreshing(false);
  };

  React.useEffect(() => {
    fetchDeployments();
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
    <div className="flex flex-col min-h-screen p-4 gap-4 sm:p-4 font-(family-name:--font-geist-sans)">
      <Header />
      {process.env.NODE_ENV !== "development" && (
        <div className="flex flex-col sm:flex-row justify-around items-center gap-2 w-full max-w-4xl mx-auto mb-8">
          <div className="space-y-2 flex-1">
            <Input
            value={teamIdValue}
            placeholder="Vercel team id: team_xxxxxx"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTeamIdValue(e.target.value)}
          />
        </div>
        <div className="space-y-2 flex-1">
          <Input
            type="password"
            value={apiTokenValue}
            placeholder="Vercel API Token"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setApiTokenValue(e.target.value)}
          />
        </div>
          <Button onClick={handleRefresh} disabled={isRefreshing}>Fetch Deployments</Button>
        </div>
      )}

      <div className="flex justify-between items-center mx-auto w-full max-w-4xl mb-8">
        <h1 className="text-2xl font-bold">Vercel Deployments | {deployments.length}</h1>
        <Button onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCwIcon className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 w-full max-w-4xl mx-auto mb-8">
        <Card>
          <CardHeader>
            <CardDescription>Total Deployments</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold font-mono">{getProjectStats().totalDeployments}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Success Rate</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold font-mono">
            {((getProjectStats().successfulDeployments / getProjectStats().totalDeployments) * 100).toFixed(1)}%
          </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Avg Build Time</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold font-mono">{getProjectStats().averageBuildTime.toFixed(1)}s</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Most Active</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold font-mono truncate">{getProjectStats().mostActiveProject}</p>
          </CardContent>
        </Card>
      </div>
      <main className="flex flex-col flex-wrap gap-2 justify-center items-center w-full max-w-4xl mx-auto">  
        {loading ? (
          <div className="flex items-center gap-2">
            <RefreshCwIcon className="h-4 w-4 animate-spin" />
            <p className="text-lg text-neutral-700">Loading deployments...</p>
          </div>
        ) : error ? (
          <div className="text-center space-y-2">
            <p>Please enter valid Vercel Team ID and API Token.</p>
            <small className="text-sm text-neutral-500">
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
          <div className="w-full max-w-4xl">
            {Object.entries(groupedDeployments).map(([name, deployments]) => (
              <Accordion key={name} type="single" collapsible>
                <ProjectAccordion name={name} deployments={deployments} />
              </Accordion>
            ))}
          </div>
         )}
      </main>
      <Footer />
    </div>
  );
}
