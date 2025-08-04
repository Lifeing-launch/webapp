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
  const [selectedDrinkType, setSelectedDrinkType] = useState<string>("");

  const getLocalDateTime = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offset).toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState({
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

  const handleDrinkTypeChange = (value: string) => {
    setFormData({
      ...formData,
      drink_type_id: value,
      drink_brand_id: "",
    });
    setSelectedDrinkType(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/drink-log/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          quantity: parseInt(formData.quantity),
          volume_ml: formData.volume_ml
            ? parseInt(formData.volume_ml)
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Log a drink</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="when">When?</Label>
            <Input
              id="when"
              type="datetime-local"
              value={formData.drank_at}
              onChange={(e) =>
                setFormData({ ...formData, drank_at: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="drinkType">Drink Type</Label>
            <Select
              value={formData.drink_type_id}
              onValueChange={handleDrinkTypeChange}
              required
            >
              <SelectTrigger id="drinkType" className="w-full">
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand">Specific Drink/Brand (Optional)</Label>
            <Select
              value={formData.drink_brand_id}
              onValueChange={(value) =>
                setFormData({ ...formData, drink_brand_id: value })
              }
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

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="volume">Volume (ml)</Label>
            <Input
              id="volume"
              type="number"
              min="0"
              value={formData.volume_ml}
              onChange={(e) =>
                setFormData({ ...formData, volume_ml: e.target.value })
              }
              placeholder="e.g., 250"
            />
            <p className="text-xs text-muted-foreground">
              Optional: Enter the actual volume consumed for more accurate
              standard drink calculations
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mood">Mood</Label>
            <Select
              value={formData.mood_id}
              onValueChange={(value) =>
                setFormData({ ...formData, mood_id: value })
              }
            >
              <SelectTrigger id="mood" className="w-full">
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="trigger">Trigger</Label>
            <Select
              value={formData.trigger_id}
              onValueChange={(value) =>
                setFormData({ ...formData, trigger_id: value })
              }
            >
              <SelectTrigger id="trigger" className="w-full">
                <SelectValue placeholder="Trigger" />
              </SelectTrigger>
              <SelectContent>
                {catalog?.triggers.map((trigger) => (
                  <SelectItem key={trigger.id} value={trigger.id.toString()}>
                    {trigger.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Select
              value={formData.location_id}
              onValueChange={(value) =>
                setFormData({ ...formData, location_id: value })
              }
            >
              <SelectTrigger id="location" className="w-full">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                {catalog?.locations.map((location) => (
                  <SelectItem key={location.id} value={location.id.toString()}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Description"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={4}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting ? "Logging..." : "Log Drink"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
