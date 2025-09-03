"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wine } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import { DrinkEntryWithRelations } from "@/typing/drink-log";

interface DrinkCardProps {
  entry: DrinkEntryWithRelations;
  onDelete: (id: string) => void;
}

export default function DrinkCard({ entry, onDelete }: DrinkCardProps) {
  const formattedDate = format(new Date(entry.drank_at), "MMMM d, yyyy");

  const handleDelete = () => {
    onDelete(entry.id);
  };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex gap-4">
          <div>
            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Wine className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold">{entry.drink_type.name}</h3>
            <p className="text-sm text-muted-foreground">
              {entry.quantity} {entry.quantity === 1 ? "drink" : "drinks"} •{" "}
              {formattedDate}
            </p>
            {entry.notes && <p className="text-sm mt-2">{entry.notes}</p>}
            <div className="flex gap-2 mt-2 flex-wrap">
              {entry.mood && (
                <Badge variant="secondary">{entry.mood.name}</Badge>
              )}
              {entry.trigger && (
                <Badge variant="secondary">{entry.trigger.name}</Badge>
              )}
              {entry.location && (
                <Badge variant="secondary">{entry.location.name}</Badge>
              )}
            </div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="text-destructive"
              onClick={handleDelete}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}
