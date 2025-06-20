import React, { ReactNode } from "react";
import Image from "next/image";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex flex-col justify-center items-center gap-10 p-6 min-h-svh bg-sidebar">
      <a href="#" className="w-[120]">
        <Image
          src="/lifeing-logo.svg"
          alt="Lifeing Logo"
          width={200}
          height={50}
        />
      </a>

      {children}

      <p className="text-xs text-muted-foreground text-center">
        Copyright © {new Date().getFullYear()}. Lifeing Services.{" "}
        <a href="#" className="underline">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="underline">
          Privacy Policy
        </a>
      </p>
    </div>
  );
};

export default Layout;
