import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const Logo = ({ className }: { className?: string }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push("/");
  };

  return (
    <div
      className={`relative w-24 h-12 md:w-[146.82px] md:h-16 ${className}`}
      onClick={handleClick}
    >
      <Image
        src="/images/logo/lifeing-white.svg"
        alt="Lifeing"
        width={147}
        height={64}
        className="w-full h-full cursor-pointer"
        priority
      />
    </div>
  );
};

export default Logo;
