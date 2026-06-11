"use client";

import { AccessibilitySettings } from "@/components/alae/accessibility-settings";
import { LearningProfileCard } from "@/components/alae/learning-profile-card";
import { SignGlossary } from "@/components/alae/sign-glossary";
import { PushToggle } from "@/components/notifications/push-toggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AccessibilityPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-8">
      <div>
        <h1 className="font-heading text-3xl font-bold">Accesibilidad ALAE</h1>
        <p className="mt-1 text-brand-muted-gray">
          Personaliza cómo FORGE se adapta a tu forma de aprender y comunicarte.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AccessibilitySettings />
        <div className="space-y-6">
          <LearningProfileCard />
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notificaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <PushToggle />
            </CardContent>
          </Card>
        </div>
      </div>

      <SignGlossary />
    </div>
  );
}
