"use client";

import Image from "next/image";

const FoundersMessage = () => {
  return (
    <section className="bg-[#F6F7F6] py-20 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8">
        {/* Text Content */}
        <div className="flex-1 text-center">
          <blockquote className="font-gilda font-serif text-2xl text-[#18181B] mb-6 leading-snug">
            &ldquo;We have created Lifeing from a deep, shared need for a
            different kind of space. This is where the pressure to hustle, hide,
            or perform simply melts away. It&apos;s a gentle invitation to
            simply be, to connect, and to practice being authentically human,
            together.&rdquo;
          </blockquote>
          <div className="font-schibsted text-lg text-[#3F3F46]">
            Co-Founders
          </div>
          <div className="font-schibsted text-lg text-[#3F3F46]">
            Dr. Lisa Marie Jones and Heidi Blair, CPCC
          </div>
        </div>
        {/* Image */}
        <div className="flex-1 flex justify-center">
          <div className="w-80 h-80 rounded-full overflow-hidden">
            <Image
              src="/images/landing/founders.png"
              alt="Founders of Lifeing"
              width={320}
              height={320}
              className="object-cover w-full h-full"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default FoundersMessage;
