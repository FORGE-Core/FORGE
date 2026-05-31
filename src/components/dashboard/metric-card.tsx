"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  delay?: number;
}

export function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  trend = "neutral",
  delay = 0,
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-brand-muted-gray">
            {title}
          </CardTitle>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-champagne">
            <Icon className="h-5 w-5 text-brand-cobalt" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="font-heading text-3xl font-bold">{value}</p>
          {change && (
            <p
              className={cn(
                "mt-1 text-xs",
                trend === "up" && "text-emerald-600",
                trend === "down" && "text-red-500",
                trend === "neutral" && "text-brand-muted-gray"
              )}
            >
              {change}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
