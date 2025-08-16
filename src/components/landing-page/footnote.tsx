"use client";

import { Button } from "@/components/ui/button";

const Footnote = () => {
  return (
    <section className="bg-[#42104C] py-20 px-6">
      <div className="max-w-5xl mx-auto text-center">
        <div className="text-white space-y-8">
          <div className="space-y-6 text-xl md:text-2xl lg:text-3xl leading-tight font-gilda font-serif">
            <p>
              Connection is a basic human need, and in a time where we have
              become disconnected by the digital world, it makes sense that we
              now use this virtual ecosystem to regain what&apos;s been lost and
              can now be accessible to all.
            </p>
            <p>
              And science backs this up: In essence, our brains are wired for
              connection, and while face-to-face interaction offers the richest
              array of cues (body language, tone, etc.), online communities can
              effectively tap into these innate needs, triggering the release of
              beneficial neurochemicals and contributing to our overall mental
              and emotional well-being.
            </p>
            <p>
              We are a community where true connection is happening everyday,
              where we are free, safe, learning and growing as individuals, and
              even as friends. Come as you are ~ Grow as you are ready
            </p>
          </div>

          <div className="pt-4">
            <Button className="bg-white hover:bg-gray-100 text-[#42104C] font-schibsted font-bold text-base px-8 py-6 rounded-lg transition-colors duration-300">
              Start your 21-day free trial
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Footnote;
