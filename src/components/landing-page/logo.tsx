import React from "react";
import Image from "next/image";

const Logo = ({ className }: { className?: string }) => {
  return (
    <div className={`relative w-24 h-12 md:w-[146.82px] md:h-16 ${className}`}>
      <Image
        src="/images/landing/lifeing-logo-white.svg"
        alt="Lifeing Logo"
        width={147}
        height={64}
        className="w-full h-full"
        priority
      />
    </div>
  );
};

export default Logo;
