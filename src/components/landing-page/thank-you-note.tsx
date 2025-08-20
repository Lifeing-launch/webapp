"use client";

import { Heart } from "lucide-react";

const ThankYouNote = () => {
  return (
    <section>
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-3xl p-16 shadow-lg">
          {/* Top Row of Hearts */}
          <div className="flex justify-center gap-2 mb-8">
            <Heart className="w-10 h-10 text-[#F6F0ED]" fill="#F6F0ED" />
            <Heart className="w-10 h-10 text-[#F6F0ED]" fill="#F6F0ED" />
            <Heart className="w-10 h-10 text-[#F6F0ED]" fill="#F6F0ED" />
          </div>

          {/* Main Content */}
          <div className="text-center max-w-4xl mx-auto mb-8">
            <h2 className="text-4xl font-gilda text-[#18181B] mb-8 leading-tight">
              A Heartfelt Thank You to Our Board of Directors
            </h2>
            <p className="text-xl text-[#3F3F46] leading-relaxed">
              Launching Lifeing, a dream rooted in compassion and growth, was
              made possible by the unwavering belief and support of very special
              individuals. We extend our deepest gratitude to Karl Rogers and
              Leigh Holman, our &ldquo;Board of Directors.&rdquo;
              <br />
              <br />
              Karl and Leigh have generously given their time, wisdom, and
              friendship. Karl&apos;s invaluable financial support, Leigh&apos;s
              consistent commitment to the daily work, combined with their
              constant guidance and encouragement, has been incredible. Their
              partnership has truly helped turn our vision into a reality.
            </p>
          </div>

          {/* Divider Line */}
          <div className="w-80 h-px bg-[#F6F0ED] mx-auto mb-8"></div>

          {/* Second Section */}
          <div className="text-center max-w-4xl mx-auto mb-8">
            <h2 className="text-4xl font-gilda text-[#18181B] mb-6 leading-tight">
              And to Our Incredible Community Members
            </h2>
            <p className="text-xl text-[#3F3F46] leading-relaxed">
              Beyond our foundational supporters, we owe an immeasurable debt of
              gratitude to our Community Members. We truly could not have done
              this without you. On a pivotal day, you joined us for one meeting
              that launched the movement that has become Lifeing. You put your
              money behind us when we had only two meetings, a testament to your
              foresight and trust. Month after month, you have stayed with us,
              showing incredible patience, kind understanding, and unwavering
              belief as we have grown and strengthened together. Your support is
              both humbling and profound.
              <br />
              <br />
              To Karl and Leigh, and to every cherished member of our community,
              our deepest thanks. Your trust, belief, and active presence are
              eternally appreciated.
              <br />
              <br />
              We Love You All,
              <br />
              Heidi & Lisa Marie
            </p>
          </div>

          {/* Bottom Row of Hearts */}
          <div className="flex justify-center gap-2">
            <Heart className="w-10 h-10 text-[#F6F0ED]" fill="#F6F0ED" />
            <Heart className="w-10 h-10 text-[#F6F0ED]" fill="#F6F0ED" />
            <Heart className="w-10 h-10 text-[#F6F0ED]" fill="#F6F0ED" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ThankYouNote;
