"use client";

import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    id: "1",
    question: "Is my information confidential?",
    answer:
      "Yes. Your privacy matters to us. Any personal information you share when joining Lifeing is kept strictly confidential. Only our small, trusted support team has access to your account details for technical and administrative purposes. You are never required to use your real name or photo on your profile, in meetings, or in the Lifeing Lounge (our community forum). You are welcome to remain as anonymous as you need or want to be.",
  },
  {
    id: "2",
    question: "Do I have to turn on my camera or speak during meetings?",
    answer:
      "No, you are never required to turn on your camera or speak during meetings. You can participate in whatever way feels comfortable for you - whether that's listening, typing in the chat, or just being present. We believe in creating a space where you can show up exactly as you are.",
  },
  {
    id: "3",
    question: "What types of subscriptions are available?",
    answer:
      "We offer flexible subscription options to meet different needs and budgets. Our plans include access to daily meetings, resources, and community support. You can start with a 21-day free trial to explore what works best for you before committing to a subscription.",
  },
  {
    id: "4",
    question:
      "Is Lifeing only for people changing their relationship with alcohol?",
    answer:
      "No, Lifeing is for anyone seeking support with personal growth, wellness, and life changes. While some members are working on their relationship with alcohol, others are dealing with stress, relationships, emotional challenges, or simply want a supportive community for personal development.",
  },
  {
    id: "5",
    question: "Do I have to quit drinking to join the Lifeing community?",
    answer:
      "Absolutely not. Lifeing is not about requiring specific changes or following rigid rules. We meet you where you are and support whatever changes feel right for you. Whether you want to quit drinking, cut back, or just explore your relationship with alcohol, you're welcome here.",
  },
  {
    id: "6",
    question: "What types of support and services does Lifeing offer?",
    answer:
      "Lifeing offers a comprehensive support system including daily live meetings, one-on-one coaching sessions, a resource library with articles and tools, audio meditations and podcasts, and a community forum for connection and support. All designed to support your personal growth journey.",
  },
  {
    id: "7",
    question:
      "What makes Lifeing different from other wellness or recovery platforms?",
    answer:
      "Lifeing is built on the principle of compassionate presence rather than rigid rules or quick fixes. We focus on self-compassion, authentic connection, and meeting people where they are. Our approach is gentle, non-judgmental, and designed to support lasting change through understanding and support rather than willpower alone.",
  },
  {
    id: "8",
    question:
      "What if I need to pause or withdraw due to finances, travel, or life changes?",
    answer:
      "We understand that life circumstances change. You can pause or cancel your subscription at any time without penalty. We're here to support you through all of life's transitions, and you're always welcome to return when the time feels right.",
  },
  {
    id: "9",
    question: "What happens in a private coaching session?",
    answer:
      "Private coaching sessions are personalized one-on-one conversations with experienced coaches who provide compassionate support, practical tools, and guidance tailored to your specific needs and goals. Sessions are confidential and designed to help you move forward in your personal growth journey.",
  },
  {
    id: "10",
    question:
      "Do I need to be a Lifeing member to book individual coaching sessions?",
    answer:
      "While some coaching services are available to members, we also offer individual coaching sessions that can be booked separately. Contact us to learn more about our coaching options and how they might support your journey.",
  },
];

const FAQ = () => {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (itemId: string) => {
    setOpenItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-gilda text-4xl md:text-5xl text-[#18181B] mb-4">
            Lifeing Frequently Asked Questions
          </h2>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqData.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm"
            >
              {/* Question Header */}
              <button
                onClick={() => toggleItem(item.id)}
                className="w-full px-6 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
              >
                <h3 className="font-gilda text-xl text-[#18181B] pr-4">
                  {item.question}
                </h3>
                {openItems.includes(item.id) ? (
                  <Minus className="h-5 w-5 text-gray-500 flex-shrink-0" />
                ) : (
                  <Plus className="h-5 w-5 text-gray-500 flex-shrink-0" />
                )}
              </button>

              {/* Answer Content */}
              <div
                className={cn(
                  "overflow-hidden transition-all duration-300 ease-in-out",
                  openItems.includes(item.id)
                    ? "max-h-96 opacity-100"
                    : "max-h-0 opacity-0"
                )}
              >
                <div className="px-6 pb-6">
                  <p className="text-[#3F3F46] leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
