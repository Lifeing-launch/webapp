import { Button } from "@/components/ui/button";
import Link from "next/link";

interface IErrorTemplate {
  heading: string;
  description: string;
  returnUrl?: string;
  returnPrompt?: string;
}

export default function ErrorTemplate({
  heading,
  description,
  returnUrl = "/",
  returnPrompt = "Return to home",
}: IErrorTemplate) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center bg-lime-100">
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
