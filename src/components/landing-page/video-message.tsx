"use client";

import Image from "next/image";

const VideoMessage = () => {
  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-[#46611E] rounded-3xl p-12 md:p-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="text-white">
              <div className="space-y-6 text-lg leading-relaxed">
                <p>
                  We meet people where they are. We walk beside them. And we
                  support change that lasts because it&apos;s built on
                  self-compassion, not willpower.
                </p>
                <p>
                  Lifeing exists because health behavior change isn&apos;t about
                  fixing people, it&apos;s about walking with them. Most people
                  struggling with unhealthy coping strategies, alcohol,
                  relationships, or emotional pain don&apos;t need more
                  discipline, they need more compassionate presence,
                  understanding, and support.
                </p>
                <p>
                  We believe people can rewrite their stories not by following
                  rigid rules, but by reconnecting to themselves, others, and
                  the deeper &ldquo;why&rdquo; behind their choices.
                </p>
              </div>
            </div>

            {/* Video Placeholder */}
            <div className="relative">
              <div className="aspect-video rounded-2xl overflow-hidden bg-gray-800">
                <Image
                  src="/images/landing/video-placeholder.jpg"
                  alt="Video Message Placeholder"
                  width={640}
                  height={360}
                  className="object-cover w-full h-full"
                  priority
                />
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <div className="w-0 h-0 border-l-[12px] border-l-white border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ml-1"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoMessage;
