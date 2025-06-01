import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface IErrorTemplate {
  heading: string;
  description: string;
  returnUrl?: string;
  returnPrompt?: string;
  className?: string;
}

export default function ErrorTemplate({
  heading,
  description,
  returnUrl = "/",
  returnPrompt = "Return to home",
  className,
}: IErrorTemplate) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center min-h-screen w-full gap-4 text-center",
        className
      )}
    >
      <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">
        {heading}
      </h1>
      <p className="text-gray-500 max-w-md">{description}</p>

      <Button asChild>
        <Link href={returnUrl}>{returnPrompt}</Link>
      </Button>
    </div>
  );
}
