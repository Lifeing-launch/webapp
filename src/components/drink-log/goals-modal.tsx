"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface GoalsModalProps {
  open: boolean;
  onClose: () => void;
  initialGoals?: {
    id: string;
    daily_goal: number;
    weekly_goal: number;
    monthly_goal: number;
  } | null;
}

export default function GoalsModal({
  open,
  onClose,
  initialGoals,
}: GoalsModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [goals, setGoals] = useState({
    daily_goal: initialGoals?.daily_goal || 1,
    weekly_goal: initialGoals?.weekly_goal || 5,
    monthly_goal: initialGoals?.monthly_goal || 20,
  });

  // Auto-calculate weekly and monthly based on daily
  const handleDailyChange = (daily: number) => {
    setGoals({
      daily_goal: daily,
      weekly_goal: daily * 7,
      monthly_goal: daily * 30,
    });
  };

  // Manual change for weekly (no auto-calculation)
  const handleWeeklyChange = (weekly: number) => {
    setGoals((prev) => ({
      ...prev,
      weekly_goal: weekly,
    }));
  };

  // Manual change for monthly (no auto-calculation)
  const handleMonthlyChange = (monthly: number) => {
    setGoals((prev) => ({
      ...prev,
      monthly_goal: monthly,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/drink-log/goals", {
        method: "POST", // Always POST, API will handle upsert logic
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(goals),
      });

      if (response.ok) {
        onClose();
        router.refresh();
      }
    } catch (error) {
      console.error("Error saving goals:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogTitle>Set your drinking goals</DialogTitle>
        <Card className="p-6 border-0 shadow-none">
          <form onSubmit={handleSubmit} className="space-y-6">
            <p className="text-muted-foreground">
              Enter your personal goals for moderation
            </p>

            <div className="space-y-2">
              <Label htmlFor="daily">Daily Goal</Label>
              <Input
                id="daily"
                type="number"
                min="0"
                placeholder="e.g. 2 drinks"
                value={goals.daily_goal}
                onChange={(e) =>
                  handleDailyChange(parseInt(e.target.value) || 0)
                }
              />
              <p className="text-xs text-muted-foreground">
                Changing this will automatically update weekly and monthly goals
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="weekly">Weekly Goal</Label>
              <Input
                id="weekly"
                type="number"
                min="0"
                placeholder="e.g. 14 drinks"
                value={goals.weekly_goal}
                onChange={(e) =>
                  handleWeeklyChange(parseInt(e.target.value) || 0)
                }
              />
              <p className="text-xs text-muted-foreground">
                You can manually adjust this value
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthly">Monthly Goal</Label>
              <Input
                id="monthly"
                type="number"
                min="0"
                placeholder="e.g. 60 drinks"
                value={goals.monthly_goal}
                onChange={(e) =>
                  handleMonthlyChange(parseInt(e.target.value) || 0)
                }
              />
              <p className="text-xs text-muted-foreground">
                You can manually adjust this value
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Goals"}
            </Button>
          </form>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
