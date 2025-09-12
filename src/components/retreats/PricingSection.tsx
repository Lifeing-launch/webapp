"use client";

import React from "react";
import { PricingItem } from "@/typing/retreats";

interface PricingSectionProps {
  data: PricingItem[];
  onBookingClick?: () => void;
}

const statusConfig = {
  available: {
    label: "Available",
    className: "bg-[#8FBF4D] text-white text-xs px-3 py-1 rounded-full",
  },
  "coming-soon": {
    label: "Coming Soon",
    className: "bg-[#FFA500] text-white text-xs px-3 py-1 rounded-full",
  },
  booked: {
    label: "Booked",
    className: "bg-[#FF6B6B] text-white text-xs px-3 py-1 rounded-full",
  },
};

export default function PricingSection({
  data,
  onBookingClick,
}: PricingSectionProps) {
  return (
    <section id="pricing" className="py-16 px-4">
      <div className="mx-auto">
        <div className="bg-stone-100 rounded-[20px] p-6 flex flex-col gap-6">
          {data.map((item, index) => (
            <React.Fragment key={item.id}>
              <div className="flex flex-col gap-4">
                <div className="flex justify-start items-start gap-6">
                  {/* Room Info Section */}
                  <div className="flex-1 flex flex-col justify-center items-start">
                    <span className={statusConfig[item.status].className}>
                      {statusConfig[item.status].label}
                    </span>
                    <h3 className="self-stretch font-gilda font-normal text-3xl text-[#1C1C1C] leading-[48px]">
                      {item.title || item.subtitle}
                    </h3>
                    {item.description && (
                      <p className="self-stretch font-schibsted font-normal text-base text-gray-700 leading-normal">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Double Occupancy Card */}
                  <div className="w-48 p-3 bg-white rounded-2xl flex flex-col justify-center items-center gap-2.5">
                    <div className="self-stretch text-center font-schibsted font-normal text-sm text-gray-700 leading-tight">
                      Double Occupancy
                      <br />
                      (per person)
                    </div>
                    <div className="self-stretch text-center font-gilda font-normal text-3xl text-[#1C1C1C] leading-[48px]">
                      {item.price1.value}
                    </div>
                  </div>

                  {/* Single Occupancy Card */}
                  <div className="w-48 p-3 bg-white rounded-2xl flex flex-col justify-center items-center gap-2.5">
                    <div className="self-stretch text-center font-schibsted font-normal text-sm text-gray-700 leading-tight">
                      Single Occupancy
                      <br />
                      (Total)
                    </div>
                    <div className="self-stretch text-center font-gilda font-normal text-3xl text-[#1C1C1C] leading-[48px]">
                      {item.price2.value}
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider line between rooms except for last item */}
              {index < data.length - 1 && (
                <div className="self-stretch h-0 border-t border-gray-300"></div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Request to book button */}
        <div className="flex justify-center mt-20">
          <button
            onClick={onBookingClick}
            className="px-6 py-4 bg-[#7C8E5A] hover:bg-[#6b7a4d] rounded-[10px] inline-flex justify-center items-center transition-colors"
          >
            <span className="text-white font-schibsted font-bold text-base leading-normal">
              Request to book
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
