"use client";

import { useEffect, useState } from "react";
import { CoachingProgramData } from "@/app/api/coaching-program/route";
import { Button } from "../ui/button";

export default function CoachingProgramSection() {
  const [data, setData] = useState<CoachingProgramData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/coaching-program");
        if (!response.ok) {
          throw new Error("Failed to fetch coaching program data");
        }
        const result = await response.json();
        setData(result.data);
      } catch (err) {
        console.error("Error fetching coaching program data:", err);
        setError("Failed to load coaching program data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="text-center space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !data) {
    return (
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-red-500">
            {error || "Failed to load coaching program"}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-6 sm:py-12 px-4 sm:px-6 lg:px-9 bg-white">
      <div className="w-full max-w-7xl mx-auto">
        {/* Intro Section */}
        <div className="flex flex-col gap-6 sm:gap-8 items-center justify-start mb-8 sm:mb-12">
          <div className="flex flex-col gap-4 sm:gap-6 items-center text-center max-w-[560px] px-2">
            <h2 className="text-lg sm:text-[20px] font-bold leading-6 sm:leading-7 text-zinc-950">
              {data.intro.title}
            </h2>
            <h3 className="text-sm sm:text-base font-medium leading-tight sm:leading-none text-zinc-950">
              Supportive Team of Coaches. One Centered You.
            </h3>
            <p className="text-xs sm:text-sm font-normal leading-4 sm:leading-5 text-zinc-950 whitespace-pre-line">
              {data.intro.description}
            </p>
          </div>
        </div>

        {/* Packages Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {data.packages.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-gray-50 border border-gray-300 rounded-[10px] p-4 sm:p-6 flex flex-col min-h-[280px] sm:min-h-[320px]"
            >
              <div className="flex flex-col gap-4 sm:gap-6 h-full">
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-sm sm:text-base font-medium leading-5 sm:leading-6 text-zinc-900">
                    {pkg.title}
                  </h3>
                  <h4 className="text-xl sm:text-2xl font-semibold leading-7 sm:leading-8 text-zinc-950">
                    {pkg.sessions}
                  </h4>
                </div>
                <p className="text-xs sm:text-sm font-normal leading-4 sm:leading-5 text-zinc-700 flex-grow">
                  {pkg.description}
                </p>
                <Button
                  className=" text-neutral-50 font-medium text-xs sm:text-sm leading-4 sm:leading-5 h-8 sm:h-9 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md shadow-sm w-fit"
                  onClick={() => window.open(pkg.stripeUrl, "_blank")}
                >
                  Buy Package
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Section */}
        <div className="flex flex-col gap-4 sm:gap-6 items-center px-2">
          <div className="w-full max-w-4xl">
            <ul className="text-xs sm:text-sm font-normal leading-4 sm:leading-5 text-zinc-950 list-disc list-inside space-y-1 sm:space-y-0">
              {data.footer.bullets.map((bullet, index) => (
                <li key={index} className="mb-0 sm:mb-0">
                  {bullet}
                </li>
              ))}
            </ul>
            <p className="text-xs font-normal leading-4 text-zinc-950 italic mt-4 sm:mt-6">
              <span className="font-medium">Note:</span> {data.footer.note}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
