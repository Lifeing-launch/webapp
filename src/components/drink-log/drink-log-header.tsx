"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import DrinkModal from "./drink-modal";
import GoalsModal from "./goals-modal";

interface DrinkLogHeaderProps {
  onDataChange?: () => void;
}

export default function DrinkLogHeader({ onDataChange }: DrinkLogHeaderProps) {
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);
  const [goals, setGoals] = useState(null);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const response = await fetch("/api/drink-log/goals");
        if (response.ok) {
          const data = await response.json();
          setGoals(data);
          // Open goals modal if user has no goals set
          if (!data) {
            setIsGoalsModalOpen(true);
          }
        }
      } catch (error) {
        console.error("Error fetching goals:", error);
      }
    };

    fetchGoals();
  }, []);

  return (
    <>
      <div className="flex items-center justify-between w-full">
        <div className="flex flex-col items-start justify-center w-full">
          <h2 className="text-2xl font-bold">Drink Log</h2>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsGoalsModalOpen(true)}>
            Edit Goals
          </Button>
          <Button onClick={() => setIsLogModalOpen(true)}>Log a drink</Button>
        </div>
      </div>

      <Separator className="mb-6" />

      <DrinkModal
        open={isLogModalOpen}
        onOpenChange={setIsLogModalOpen}
        onSuccess={onDataChange}
      />
      <GoalsModal
        open={isGoalsModalOpen}
        onClose={() => setIsGoalsModalOpen(false)}
        initialGoals={goals}
      />
    </>
  );
}
