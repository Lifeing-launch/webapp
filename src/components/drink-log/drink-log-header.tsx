"use client";

import { Button } from "@/components/ui/button";
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
      <div className="flex items-center justify-end w-full">
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsGoalsModalOpen(true)}>
            Edit Goals
          </Button>
          <Button onClick={() => setIsLogModalOpen(true)}>Log a drink</Button>
        </div>
      </div>

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
