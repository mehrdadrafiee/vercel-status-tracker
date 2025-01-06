import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DeploymentProps } from "@/types/deployments";
import { differenceInMinutes, format, formatDistanceToNow } from "date-fns";
import { CheckCircle2, XCircle, AlertTriangle, Clock, GitBranch, UserIcon } from "lucide-react";
import React from "react";

type StatusTrackerProps = {
  deployments: DeploymentProps[];
  uptime: number | null;
}

export default function StatusTracker({ deployments, uptime }: StatusTrackerProps) {
  const [timeRange, setTimeRange] = React.useState<'7d' | '30d' | '90d'>('7d');

  const StatusMessage = (deployment: DeploymentProps) => {
    if (!deployment.ready || !deployment.createdAt) return null;

    const downtime = differenceInMinutes(deployment.ready, deployment.createdAt);
    if (downtime < 1) {
      return <small className="text-gray-500">Down for less than a minute</small>;
    }
    return <small className="text-gray-500">Down for {downtime} minute(s)</small>;
  };
  
  const generateUptimeColor = (uptime: number) => {
    if (uptime <= 50) return "text-red-700";
    if (uptime <= 70) return "text-orange-700";
    if (uptime <= 90) return "text-yellow-700";
    return "text-emerald-700";
  };

  const getDeploymentStats = (deployment: DeploymentProps) => ({
    buildTime: ((deployment.ready - deployment.buildingAt) / 1000).toFixed(1),
    source: deployment.source || 'Unknown',
    branch: deployment.meta?.githubCommitRef || 'Unknown',
    author: deployment.meta?.githubCommitAuthorName || 'Unknown',
    commitSHA: deployment.meta?.githubCommitSha ? deployment.meta.githubCommitSha.slice(0, 7) : 'Unknown'
  });

  const getStatusIcon = (state: string) => {
    switch (state) {
      case "READY":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "ERROR":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
  };

  if (!deployments.length) {
    return <p className="text-gray-500">No deployment data available</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        {uptime !== null && (
          <div className="flex items-center gap-2">
            <p className={`text-2xl font-bold ${generateUptimeColor(uptime)}`}>
              {uptime}%
            </p>
            <sub className="text-sm text-gray-500">Uptime</sub>
          </div>
        )}
        <div className="flex gap-2">
          {['7d', '30d', '90d'].map((range) => (
            <Button
              key={range}
              variant="outline"
              size="sm"
              onClick={() => setTimeRange(range as any)}
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex gap-[2px]">
          {deployments.map((deployment, index) => (
            <TooltipProvider key={`${deployment.name}-${index}`}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    className={`rounded-none first:rounded-l-md last:rounded-r-md w-full h-10 border-none 
                      ${deployment.state === "READY" 
                        ? "bg-emerald-500 hover:bg-emerald-600" 
                        : "bg-red-500 hover:bg-red-600"}`}
                  />
                </TooltipTrigger>
                <TooltipContent 
                  className="p-4 bg-white border-none shadow-md space-y-3 w-64"
                  sideOffset={5}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(deployment.state)}
                      <span className="font-medium">
                        {deployment.state === "READY" ? "Operational" : "Downtime"}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(deployment.ready, { addSuffix: true })}
                    </span>
                  </div>

                  {deployment.state !== "READY" && (
                    <div className="py-2">
                      {StatusMessage(deployment)}
                    </div>
                  )}

                  <Separator />

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>Build: {getDeploymentStats(deployment).buildTime}s</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GitBranch className="w-4 h-4 text-gray-500" />
                      <span>Branch: {getDeploymentStats(deployment).branch}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-gray-500" />
                      <span>Author: {getDeploymentStats(deployment).author}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="text-xs text-gray-500">
                    Deployed: {format(deployment.ready, "PPP 'at' pp")}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>

        <div className="flex justify-between text-sm text-gray-500">
          <span>Last {deployments.length} deployments</span>
          <span>{format(deployments[0].ready, "MMM d, yyyy")}</span>
        </div>
      </div>
    </div>
  );
}