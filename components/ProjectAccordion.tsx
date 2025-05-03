"use client"

import React from "react";

import { CheckCircle2, XCircle } from "lucide-react";
import StatusTracker from "@/components/StatusTracker";
import { DeploymentProps } from "@/types/deployments";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ChartContainer } from "@/components/ui/chart";
import { Line, LineChart, Tooltip, XAxis } from "recharts";
import { type ChartConfig } from "@/components/ui/chart"

const chartConfig = {
  buildTime: {
    label: "Build time",
    color: "#2563eb",
  }
} satisfies ChartConfig


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
    <AccordionItem value={name} className="bg-neutral-50 dark:bg-neutral-900 rounded-lg w-full border-1 border-neutral-200 dark:border-neutral-800">
      <AccordionTrigger className="p-4">
        <div className="flex w-full justify-between items-center">
          <div className="flex flex-col items-start gap-1">
            <strong>{name}</strong>
            <span className="text-sm text-neutral-500">
              Last deployed: {format(new Date(deployments[0].ready), 'MMM d, yyyy')}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-neutral-600">
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
        <StatusTracker deployments={deployments} uptime={uptime} />
        <ChartContainer config={chartConfig} className="h-[100px] w-full">
          <LineChart accessibilityLayer data={deployments.map((deployment) => ({
            date: format(new Date(deployment.buildingAt), 'MMM d, yyyy'),
            buildTime: deployment.ready - deployment.buildingAt,
          }))}>
            <Line type="monotone" dataKey="buildTime" stroke="#8884d8" />
            <XAxis dataKey="date" />
            <Tooltip content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const buildTimeMs = payload[0].value;
                if (typeof buildTimeMs === 'number') {
                  const buildTimeSec = (buildTimeMs / 1000).toFixed(2);
                  return (
                    <div className="rounded-lg bg-background p-2 shadow-md">
                      <div className="flex flex-col gap-1">
                         <span className="text-sm text-muted-foreground">{payload[0].payload.date}</span>
                         <span className="font-semibold">Build time: {buildTimeSec}s</span>
                      </div>
                    </div>
                  );
                }
              }
              return null;
            }} />
          </LineChart>
        </ChartContainer>
      </AccordionContent>
    </AccordionItem>
  );
} 