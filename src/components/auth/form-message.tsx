import { AlertCircle, CircleCheck } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";

export type Message = { success: string } | { error: string };

export function FormMessage({ message }: { message: Message }) {
  if ("success" in message) {
    return (
      <div className="grid gap-2">
        <Alert className="border-primary text-primary">
          <CircleCheck className="h-4 w-4" />
          <AlertDescription className="text-primary">
            {message.success}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if ("error" in message) {
    return (
      <div className="grid gap-2">
        <Alert variant="destructive" className="border-destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{message.error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return null;
}
