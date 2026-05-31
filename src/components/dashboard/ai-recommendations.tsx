"use client";

import { motion } from "framer-motion";
import { Brain, ChevronRight } from "lucide-react";
import Link from "next/link";
import { aiRecommendations } from "@/data/mock-content";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AIRecommendations() {
  return (
    <Card className="border-brand-lavender/20 bg-gradient-to-br from-white to-brand-champagne/40">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-brand">
            <Brain className="h-4 w-4 text-white" />
          </div>
          <CardTitle>Recomendaciones Inteligentes</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-brand-muted-gray">
          La IA detectó oportunidades de mejora en los siguientes temas:
        </p>
        <ul className="space-y-3">
          {aiRecommendations.map((rec, i) => (
            <motion.li
              key={rec.topic}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border border-black/5 bg-white px-4 py-3"
            >
              <p className="font-medium text-sm">{rec.topic}</p>
              <p className="mt-1 text-xs text-brand-muted-gray">{rec.reason}</p>
            </motion.li>
          ))}
        </ul>
        <Button className="w-full" asChild>
          <Link href="/dashboard/modules">
            Reforzar conocimientos
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
