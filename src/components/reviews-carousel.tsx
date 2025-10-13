"use client";

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const reviews = [
  {
    id: 1,
    name: "Priya Sharma",
    rating: 5,
    comment: "Excellent service! The electrician was punctual and professional. Fixed my wiring issue in no time.",
    service: "Electrician",
    location: "Mumbai"
  },
  {
    id: 2,
    name: "Rahul Verma",
    rating: 5,
    comment: "Best home service platform! Got my plumbing fixed within 2 hours of booking. Highly recommend!",
    service: "Plumber",
    location: "Delhi"
  },
  {
    id: 3,
    name: "Anjali Patel",
    rating: 5,
    comment: "Amazing experience! The painter did a fantastic job. My home looks brand new now.",
    service: "Painter",
    location: "Bangalore"
  },
  {
    id: 4,
    name: "Vikram Singh",
    rating: 4,
    comment: "Quick response and quality work. The carpenter crafted beautiful shelves for my office.",
    service: "Carpenter",
    location: "Pune"
  },
  {
    id: 5,
    name: "Sneha Reddy",
    rating: 5,
    comment: "Professional and courteous staff. Deep cleaning service was thorough and affordable.",
    service: "House Help",
    location: "Hyderabad"
  }
];

export function ReviewsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden h-48">
      {reviews.map((review, index) => (
        <Card
          key={review.id}
          className={cn(
            "absolute inset-0 p-6 bg-slate-800/50 border-slate-700 backdrop-blur-sm transition-all duration-500",
            index === currentIndex
              ? "opacity-100 translate-x-0"
              : index < currentIndex
              ? "opacity-0 -translate-x-full"
              : "opacity-0 translate-x-full"
          )}
        >
          <div className="flex items-start gap-4 h-full">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              {review.name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold text-slate-200">{review.name}</h4>
                <span className="text-xs text-slate-500">• {review.location}</span>
              </div>
              <div className="flex items-center gap-1 mb-2">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-xs text-slate-400 ml-2">{review.service}</span>
              </div>
              <p className="text-sm text-slate-400 line-clamp-2">{review.comment}</p>
            </div>
          </div>
        </Card>
      ))}
      
      {/* Dots Indicator */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
        {reviews.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              index === currentIndex
                ? "bg-teal-400 w-6"
                : "bg-slate-600 hover:bg-slate-500"
            )}
          />
        ))}
      </div>
    </div>
  );
}