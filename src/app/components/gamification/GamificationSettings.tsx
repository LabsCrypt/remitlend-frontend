"use client";

import { Volume2, VolumeX, Sparkles, Accessibility } from "lucide-react";
import { useGamificationStore } from "@/app/stores/useGamificationStore";
import { useUIStore } from "@/app/stores/useUIStore";
import { useSoundEffect } from "@/app/utils/soundManager";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { useEffect } from "react";

interface GamificationSettingsProps {
  className?: string;
}

export function GamificationSettings({ className }: GamificationSettingsProps) {
  const soundEnabled = useUIStore((state) => state.soundEnabled);
  const reducedMotion = useUIStore((state) => state.reducedMotion);
  const setSoundEnabled = useUIStore((state) => state.setSoundEnabled);
  const setReducedMotion = useUIStore((state) => state.setReducedMotion);

  const sound = useSoundEffect();

  // Sync sound manager with store
  useEffect(() => {
    sound.setEnabled(soundEnabled);
  }, [soundEnabled, sound]);

  const handleToggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    if (nextState) {
      // Play a test sound when enabling
      setTimeout(() => sound.play("success"), 100);
    }
  };

  const handleToggleReducedMotion = () => {
    setReducedMotion(!reducedMotion);
    if (soundEnabled && reducedMotion) {
      sound.play("click");
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Gamification Settings</CardTitle>
        <p className="text-sm text-gray-600 dark:text-zinc-400 mt-1">
          Customize your Kingdom experience
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sound toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {soundEnabled ? (
              <Volume2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            ) : (
              <VolumeX className="h-5 w-5 text-gray-400" />
            )}
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-zinc-100">Sound Effects</p>
              <p className="text-xs text-gray-600 dark:text-zinc-400">
                Play sounds for achievements and actions
              </p>
            </div>
          </div>
          <button
            onClick={handleToggleSound}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              soundEnabled ? "bg-blue-600" : "bg-gray-300 dark:bg-zinc-700"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                soundEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Reduced Motion toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Accessibility
              className={`h-5 w-5 ${
                reducedMotion ? "text-purple-600 dark:text-purple-400" : "text-gray-400"
              }`}
            />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-zinc-100">Reduced Motion</p>
              <p className="text-xs text-gray-600 dark:text-zinc-400">
                Disable or tone down non-essential animations
              </p>
            </div>
          </div>
          <button
            onClick={handleToggleReducedMotion}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              reducedMotion ? "bg-purple-600" : "bg-gray-300 dark:bg-zinc-700"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                reducedMotion ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Test buttons */}
        <div className="rounded-lg bg-gray-50 p-4 dark:bg-zinc-900">
          <p className="mb-3 text-sm font-medium text-gray-900 dark:text-zinc-100">Test Effects</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => sound.play("success")}
              disabled={!soundEnabled}
              className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Success
            </button>
            <button
              onClick={() => sound.play("achievement")}
              disabled={!soundEnabled}
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Achievement
            </button>
            <button
              onClick={() => sound.play("levelUp")}
              disabled={!soundEnabled}
              className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Level Up
            </button>
            <button
              onClick={() => sound.play("xpGain")}
              disabled={!soundEnabled}
              className="rounded-lg bg-yellow-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              XP Gain
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950/30">
          <p className="text-xs text-blue-900 dark:text-blue-300">
            💡 <strong>Tip:</strong> Animations and sounds enhance your experience but can be
            disabled for better performance or accessibility.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
