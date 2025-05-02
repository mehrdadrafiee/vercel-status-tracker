import React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DeploymentProps } from "@/types/deployments";
import { format, subDays } from "date-fns";
import DeploymentTooltipContent from "@/components/DeploymentTooltipContent";

const generateUptimeColor = (uptime: number) => {
  if (uptime <= 50) return "text-red-700";
  if (uptime <= 70) return "text-orange-700";
  if (uptime <= 90) return "text-yellow-700";
  return "text-emerald-700";
};

export const getDeploymentStats = (deployment: DeploymentProps) => ({
  buildTime: deployment.ready && deployment.buildingAt ? ((deployment.ready - deployment.buildingAt) / 1000).toFixed(1) : 'N/A',
  source: deployment.source || 'Unknown',
  branch: deployment.meta?.githubCommitRef || 'Unknown',
  author: deployment.meta?.githubCommitAuthorName || 'Unknown',
  commitSHA: deployment.meta?.githubCommitSha ? deployment.meta.githubCommitSha.slice(0, 7) : 'Unknown'
});

type StatusTrackerProps = {
  deployments: DeploymentProps[];
  uptime: number | null;
}

type TimeRange = '7d' | '30d' | '90d';

export default function StatusTracker({ deployments, uptime }: StatusTrackerProps) {
  const [timeRange, setTimeRange] = React.useState<TimeRange>('7d');

  if (!deployments || deployments.length === 0) {
    return <p className="text-neutral-500">No deployment data available</p>;
  }
  
  const filteredDeployments = React.useMemo(() => {
    const now = new Date();
    let daysToSubtract = 7;
    if (timeRange === '30d') daysToSubtract = 30;
    if (timeRange === '90d') daysToSubtract = 90;
    const cutoffDate = subDays(now, daysToSubtract);
    return deployments.filter(d => d.ready && new Date(d.ready) >= cutoffDate);
  }, [deployments, timeRange]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        {uptime !== null ? (
          <div className="flex items-center gap-2">
            <p className={`text-2xl font-bold ${generateUptimeColor(uptime)}`}>
              {uptime.toFixed(2)}%
            </p>
            <sub className="text-sm text-neutral-500">Uptime ({timeRange})</sub>
          </div>
        ) : (
          <div />
        )}
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as TimeRange[]).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(range)}
              className="transition-colors duration-150 ease-in-out"
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex gap-[2px] items-stretch">
          {deployments.map((deployment, index) => {
              const deploymentStats = getDeploymentStats(deployment);
              const isReady = deployment.state === "READY";
              const barColor = isReady
                ? "bg-emerald-500 hover:bg-emerald-600"
                : "bg-red-500 hover:bg-red-600";

              return (
                <TooltipProvider key={`${deployment.name || 'deployment'}-${deployment.uid || index}`}>
                  <Tooltip delayDuration={100}>
                    <TooltipTrigger asChild>
                      <Button className={`rounded-none first:rounded-l-md last:rounded-r-md flex-1 h-10 transition-colors duration-150 ease-in-out ${barColor}`} />
                    </TooltipTrigger>
                    <DeploymentTooltipContent deployment={deployment} deploymentStats={deploymentStats} />
                  </Tooltip>
                </TooltipProvider>
              );
          })}
        </div>

        {deployments.length > 0 && deployments[0].ready && (
           <div className="flex justify-between text-sm text-neutral-500 pt-1">
             <span>{format(deployments[deployments.length - 1].ready, "MMM d")} - {format(deployments[0].ready, "MMM d, yyyy")}</span>
             <span>Last {deployments.length} deployments</span>
           </div>
        )}
      </div>
    </div>
  );
}