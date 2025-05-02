import { AlertTriangleIcon, CheckCircle2Icon, GitCommitIcon, XCircleIcon } from "lucide-react";

import { GitBranchIcon, UserIcon } from "lucide-react";

import { DeploymentProps } from "@/types/deployments";
import { TooltipContent } from "@radix-ui/react-tooltip";
import { ClockIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { differenceInMinutes, format, formatDistanceToNow } from "date-fns";

import { getDeploymentStats } from "./StatusTracker";

const getStatusIcon = (state: string) => {
  switch (state) {
    case "READY":
      return <CheckCircle2Icon className="w-4 h-4 text-emerald-500" />;
    case "ERROR":
      return <XCircleIcon className="w-4 h-4 text-red-500" />;
    default:
      return <AlertTriangleIcon className="w-4 h-4 text-yellow-500" />;
  }
};

const StatusMessage = ({ deployment }: { deployment: DeploymentProps }) => {
  if (!deployment.ready || !deployment.createdAt || deployment.state === "READY") return null;

  const downtime = differenceInMinutes(deployment.ready, deployment.createdAt);
  if (downtime < 1) {
    return <small className="text-neutral-500">Down for less than a minute</small>;
  }
  return <small className="text-neutral-500">Down for {downtime} minute{downtime !== 1 ? 's' : ''}</small>;
};

type DeploymentTooltipContentProps = {
  deployment: DeploymentProps;
  deploymentStats: ReturnType<typeof getDeploymentStats>;
}

export default function DeploymentTooltipContent({ deployment, deploymentStats }: DeploymentTooltipContentProps) {
  const isReady = deployment.state === "READY";

  return (
    <TooltipContent className="p-4 bg-white dark:bg-black shadow-md space-y-3" sideOffset={5}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getStatusIcon(deployment.state)}
          <span className="font-medium">
            {isReady ? "Operational" : "Downtime"}
          </span>
        </div>
        <span className="text-xs text-neutral-500">
          {deployment.ready ? formatDistanceToNow(deployment.ready, { addSuffix: true }) : 'N/A'}
        </span>
      </div>

      {!isReady && (
        <div className="py-2">
          <StatusMessage deployment={deployment} />
        </div>
      )}

      <Separator />

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <ClockIcon size={16} />
          <span>Build: {deploymentStats.buildTime}s</span>
        </div>
        <div className="flex items-center gap-2">
          <GitBranchIcon size={16} />
          <span>Branch: {deploymentStats.branch}</span>
        </div>
        <div className="flex items-center gap-2">
          <UserIcon size={16} />
          <span>Author: {deploymentStats.author}</span>
        </div>
        <div className="flex items-center gap-2">
          <GitCommitIcon size={16} />
          <span>Commit: {deploymentStats.commitSHA}</span>
        </div>
      </div>

      <Separator />

      <div className="text-xs text-neutral-500">
        {deployment.ready ? `Deployed: ${format(deployment.ready, "PPP 'at' pp")}` : 'Deployment time not available'}
      </div>
    </TooltipContent>
  );
};