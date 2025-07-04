import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import * as Collapsible from "@radix-ui/react-collapsible";
import { cn } from "@/lib/utils";

export interface ISidebarSection {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function SidebarSection({
  title,
  children,
  defaultOpen = true,
}: ISidebarSection) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible.Root
      open={isOpen}
      onOpenChange={setIsOpen}
      className="flex flex-col items-start border-b border-gray-300"
    >
      <Collapsible.Trigger asChild>
        <button className="flex flex-row items-center gap-1.5 w-full text-left hover:opacity-70 transition-opacity py-2">
          <ChevronDown
            className={cn(
              "w-3.5 h-3.5 text-zinc-900 transition-transform duration-200",
              isOpen ? "rotate-0" : "rotate-90"
            )}
          />
          <h3 className="text-xs font-normal leading-none text-zinc-900">
            {title}
          </h3>
        </button>
      </Collapsible.Trigger>

      <Collapsible.Content className="flex flex-col items-start px-5 gap-3 w-full pb-6 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden">
        {children}
      </Collapsible.Content>
    </Collapsible.Root>
  );
}

export default SidebarSection;
