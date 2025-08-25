"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useDrinkCatalog } from "@/hooks/use-drink-catalog";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

interface DrinkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function DrinkModal({
  open,
  onOpenChange,
  onSuccess,
}: DrinkModalProps) {
  const router = useRouter();
  const { catalog, isLoading } = useDrinkCatalog();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isQuickLogging, setIsQuickLogging] = useState(false);
  const [selectedDrinkType, setSelectedDrinkType] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const getLocalDateTime = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offset).toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState({
    drank_at: getLocalDateTime(),
    drink_type_id: "",
    drink_brand_id: "",
    quantity: "0",
    volume_ml: "",
    mood_id: "",
    trigger_id: "",
    location_id: "",
    notes: "",
  });

  // Zod schema to enforce required fields
  const schema = z.object({
    drank_at: z.string().min(1, "When is required"),
    drink_type_id: z.string().min(1, "Drink type is required"),
    drink_brand_id: z.string().optional(),
    quantity: z
      .string()
      .min(1, "Quantity is required")
      .refine((v) => Number(v) >= 0, "Quantity must be at least 0"),
    volume_ml: z.string().optional(),
    mood_id: z.string().optional(),
    trigger_id: z.string().optional(),
    location_id: z.string().optional(),
    notes: z.string().optional(),
  });

  const setField = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    // Clear field error on change
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  };

  const RequiredMark = () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          aria-label="Required"
          className="rounded self-center text-sm text-primary font-bold cursor-help select-none"
        >
          *
        </span>
      </TooltipTrigger>
      <TooltipContent>This field is required</TooltipContent>
    </Tooltip>
  );

  const handleDrinkTypeChange = (value: string) => {
    setFormData({
      ...formData,
      drink_type_id: value,
      drink_brand_id: "",
    });
    setSelectedDrinkType(value);
  };

  const handleQuickLog = async () => {
    setIsQuickLogging(true);

    try {
      // Find "Other" drink type
      const otherDrinkType = catalog?.drinkTypes.find(
        (type) => type.name === "Other" || type.name === "None"
      );

      if (!otherDrinkType) {
        throw new Error("'Other' drink type not found");
      }

      // Get current datetime in local timezone
      const now = new Date();
      const offset = now.getTimezoneOffset() * 60000;
      const localDateTime = new Date(now.getTime() - offset)
        .toISOString()
        .slice(0, 16);

      // Create zero drink entry
      const response = await fetch("/api/drink-log/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          drank_at: localDateTime,
          drink_type_id: otherDrinkType.id,
          quantity: 0,
          notes: "No drinks today",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to log entry");
      }

      toast.success("No drinks logged for today");
      onOpenChange(false);
      router.refresh();
      onSuccess?.();
    } catch (error) {
      console.error("Quick log error:", error);
      toast.error("Failed to log entry");
    } finally {
      setIsQuickLogging(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Validate with Zod before submitting
      const result = schema.safeParse(formData);
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        for (const issue of result.error.issues) {
          const key = issue.path[0] as string;
          if (!fieldErrors[key]) fieldErrors[key] = issue.message;
        }
        setErrors(fieldErrors);
        return;
      }

      const response = await fetch("/api/drink-log/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          quantity: parseInt(formData.quantity),
          volume_ml: formData.volume_ml
            ? Math.round(parseFloat(formData.volume_ml) * 29.5735) // Convert oz to ml
            : undefined,
        }),
      });

      if (response.ok) {
        onOpenChange(false);
        router.refresh();
        onSuccess?.(); // Call the refresh callback
        setFormData({
          drank_at: getLocalDateTime(),
          drink_type_id: "",
          drink_brand_id: "",
          quantity: "1",
          volume_ml: "",
          mood_id: "",
          trigger_id: "",
          location_id: "",
          notes: "",
        });
        setErrors({});
      }
    } catch (error) {
      console.error("Error logging drink:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredBrands = catalog?.drinkBrands.filter(
    (brand) => brand.drink_type_id === parseInt(selectedDrinkType)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Log a drink</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-hidden flex flex-col"
        >
          <div className="flex-1 overflow-y-auto px-1 space-y-4">
            {/* Full width fields */}
            <div className="space-y-2">
              <Label htmlFor="when">
                When?
                <RequiredMark />
              </Label>
              <Input
                id="when"
                type="datetime-local"
                value={formData.drank_at}
                onChange={(e) => setField("drank_at", e.target.value)}
                className={cn(errors.drank_at && "border-destructive")}
              />
              {errors.drank_at && (
                <p className="text-xs text-destructive mt-1">
                  {errors.drank_at}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="drinkType">
                Drink Type
                <RequiredMark />
              </Label>
              <Select
                value={formData.drink_type_id}
                onValueChange={handleDrinkTypeChange}
              >
                <SelectTrigger
                  id="drinkType"
                  className={cn(
                    "w-full",
                    errors.drink_type_id && "border-destructive"
                  )}
                >
                  <SelectValue placeholder="Drink Type" />
                </SelectTrigger>
                <SelectContent>
                  {catalog?.drinkTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.drink_type_id && (
                <p className="text-xs text-destructive mt-1">
                  {errors.drink_type_id}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Specific Drink/Brand (Optional)</Label>
              <Select
                value={formData.drink_brand_id}
                onValueChange={(value) => setField("drink_brand_id", value)}
                disabled={!selectedDrinkType}
              >
                <SelectTrigger id="brand" className="w-full">
                  <SelectValue placeholder="Drink Type" />
                </SelectTrigger>
                <SelectContent>
                  {filteredBrands?.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id.toString()}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Two column layout for smaller fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">
                  Quantity
                  <RequiredMark />
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  value={formData.quantity}
                  onChange={(e) => setField("quantity", e.target.value)}
                  className={cn(errors.quantity && "border-destructive")}
                />
                {errors.quantity && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.quantity}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="volume">Volume (oz)</Label>
                <Input
                  id="volume"
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.volume_ml}
                  onChange={(e) =>
                    setFormData({ ...formData, volume_ml: e.target.value })
                  }
                  placeholder="e.g., 12 (optional)"
                />
                <p className="text-xs text-muted-foreground">
                  Optional: Volume in fluid ounces
                </p>
              </div>
            </div>

            {/* Two column layout for mood and trigger */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mood">Mood (Optional)</Label>
                <Select
                  value={formData.mood_id}
                  onValueChange={(value) => setField("mood_id", value)}
                >
                  <SelectTrigger
                    id="mood"
                    className={cn(
                      "w-full",
                      errors.mood_id && "border-destructive"
                    )}
                  >
                    <SelectValue placeholder="Mood" />
                  </SelectTrigger>
                  <SelectContent>
                    {catalog?.moods.map((mood) => (
                      <SelectItem key={mood.id} value={mood.id.toString()}>
                        {mood.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.mood_id && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.mood_id}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="trigger">Cue (Optional)</Label>
                <Select
                  value={formData.trigger_id}
                  onValueChange={(value) => setField("trigger_id", value)}
                >
                  <SelectTrigger
                    id="trigger"
                    className={cn(
                      "w-full",
                      errors.trigger_id && "border-destructive"
                    )}
                  >
                    <SelectValue placeholder="Cue" />
                  </SelectTrigger>
                  <SelectContent>
                    {catalog?.triggers.map((trigger) => (
                      <SelectItem
                        key={trigger.id}
                        value={trigger.id.toString()}
                      >
                        {trigger.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.trigger_id && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.trigger_id}
                  </p>
                )}
              </div>
            </div>

            {/* Full width location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location (Optional)</Label>
              <Select
                value={formData.location_id}
                onValueChange={(value) => setField("location_id", value)}
              >
                <SelectTrigger
                  id="location"
                  className={cn(
                    "w-full",
                    errors.location_id && "border-destructive"
                  )}
                >
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  {catalog?.locations.map((location) => (
                    <SelectItem
                      key={location.id}
                      value={location.id.toString()}
                    >
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.location_id && (
                <p className="text-xs text-destructive mt-1">
                  {errors.location_id}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Description"
                value={formData.notes}
                onChange={(e) => setField("notes", e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div className="pt-4 space-y-2">
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting ? "Logging..." : "Log Drink"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={handleQuickLog}
              disabled={isQuickLogging || isLoading}
            >
              {isQuickLogging ? "Logging..." : "No Drinks Today"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
