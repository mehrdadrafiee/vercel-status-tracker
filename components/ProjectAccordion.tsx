import { CheckCircle2, GitBranch, GitCommit, Clock, User, XCircle } from "lucide-react";
import StatusTracker from "./StatusTracker";
import { DeploymentProps } from "@/types/deployments";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import React from "react";

type ProjectAccordionProps = {
  name: string;
  deployments: DeploymentProps[];
};

const statusConfig = {
  READY: {
    bgColor: "bg-emerald-500/10",
    icon: <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" />,
    label: "Operational",
    labelColor: "text-emerald-600",
  },
  ERROR: {
    bgColor: "bg-red-500/10",
    icon: <XCircle className="w-4 h-4 mr-2 text-red-600" />,
    label: "Down",
    labelColor: "text-red-600",
  },
};

export default function ProjectAccordion({ name, deployments }: ProjectAccordionProps) {
  const [uptime, setUptime] = React.useState<number | null>(null);
  const latestDeployment = deployments[0];
  const { bgColor, icon, label, labelColor } = statusConfig[latestDeployment.state as keyof typeof statusConfig] || {};

  
  React.useEffect(() => {
    if (!deployments.length) {
      setUptime(0);
      return;
    }

    const readyCount = deployments.filter((deployment) => deployment.state === "READY").length;

    const uptimePercentage = (readyCount / deployments.length) * 100;
    setUptime(Number(uptimePercentage.toFixed(2)));
  }, [deployments]);

  return (
    <AccordionItem value={name} className="bg-white rounded-lg w-full">
      <AccordionTrigger className="p-4">
        <div className="flex w-full justify-between items-center">
          <div className="flex flex-col items-start gap-1">
            <strong>{name}</strong>
            <span className="text-sm text-gray-500">
              Last deployed: {format(new Date(deployments[0].ready), 'MMM d, yyyy')}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              {deployments.length} deployments
            </div>
            <Badge className={`border-none ${bgColor}`}>
              {icon && (
                <>
                  {icon}
                  <span className={labelColor}>{label}</span>
                </>
              )}
            </Badge>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="p-4">
        <div className="mb-6 grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-gray-500" />
            <span className="text-sm">
              Branch: {latestDeployment.meta?.githubCommitRef || 'Unknown'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <GitCommit className="w-4 h-4 text-gray-500" />
            <span className="text-sm truncate" title={latestDeployment.meta?.githubCommitMessage}>
              Latest commit: {latestDeployment.meta?.githubCommitMessage || 'No commit message'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-500" />
            <span className="text-sm">
              Author: {latestDeployment.meta?.githubCommitAuthorName || 'Unknown'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm">
              Average build time: {((deployments.reduce((acc, deployment) => acc + (deployment.ready - deployment.buildingAt), 0) / deployments.length / 1000).toFixed(1))}s
            </span>
          </div>
        </div>
        <StatusTracker deployments={deployments} uptime={uptime} />
      </AccordionContent>
    </AccordionItem>
  );
} 