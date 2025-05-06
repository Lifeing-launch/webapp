"use client";

import { Star } from "lucide-react";
import React, { useEffect, useState } from "react";

const REVIEW_CHANGE_TIMEOUT = 3000; // 3 seconds

const REVIEWS = [
  {
    id: 1,
    name: "Caitlyn King",
    quote:
      "Joining Lifeing has been a game-changer for me. The daily support meetings, the incredible coaches, and the real sense of community helped me take control of my wellness journey in ways I never imagined.",
    stars: 5,
  },
  {
    id: 2,
    name: "Karen Okonkwo",
    quote:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliqut.",
    stars: 4,
  },
];

const Review: React.FC<{ review: (typeof REVIEWS)[number] }> = ({ review }) => {
  return (
    <div className="bg-black/30 backdrop-blur-lg flex flex-col gap-5 rounded-xl p-5 text-accent text-sm w-full">
      <p>
        {"“"}
        {review.quote}
        {"”"}
      </p>
      <div className="flex justify-between">
        <span className="font-bold">{review.name}</span>
        <div className="flex gap-1">
          {Array.from({ length: 5 }, (_, index) => (
            <Star
              key={index}
              className="text-accent h-4 w-4"
              fill={index < review.stars ? "currentColor" : "none"}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % REVIEWS.length);
    }, REVIEW_CHANGE_TIMEOUT);

    return () => clearInterval(interval); // Cleanup on component unmount
  }, []);

  return (
    <div className="hidden md:flex bg-[url(/testimonial.jpg)] bg-no-repeat bg-cover flex-col justify-end rounded-xl p-4 flex-1">
      <div key={currentIndex}>
        <Review review={REVIEWS[currentIndex]} />
      </div>
    </div>
  );
};

export default Testimonials;
