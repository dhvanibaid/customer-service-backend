"use client";

import { Check, Circle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TimelineStage = 
  | 'registration' 
  | 'address' 
  | 'booking' 
  | 'confirmed'
  | 'payment' 
  | 'completed' 
  | 'feedback';

interface BookingTimelineProps {
  currentStage: TimelineStage;
  className?: string;
}

const stages = [
  { id: 'registration', label: 'Registration', icon: '📱' },
  { id: 'address', label: 'Address', icon: '📍' },
  { id: 'booking', label: 'Book Service', icon: '🛠️' },
  { id: 'confirmed', label: 'Confirmed', icon: '✅' },
  { id: 'payment', label: 'Payment', icon: '💳' },
  { id: 'completed', label: 'Completed', icon: '🎉' },
  { id: 'feedback', label: 'Feedback', icon: '⭐' },
];

export function BookingTimeline({ currentStage, className }: BookingTimelineProps) {
  const currentIndex = stages.findIndex(s => s.id === currentStage);

  const getStageStatus = (index: number) => {
    if (index < currentIndex) return 'completed';
    if (index === currentIndex) return 'current';
    return 'pending';
  };

  return (
    <div className={cn("w-full py-6 px-4", className)}>
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-8 left-0 right-0 h-0.5 bg-slate-700">
          <div
            className="h-full bg-teal-500 transition-all duration-500"
            style={{
              width: `${(currentIndex / (stages.length - 1)) * 100}%`,
            }}
          />
        </div>

        {/* Stages */}
        <div className="relative flex justify-between">
          {stages.map((stage, index) => {
            const status = getStageStatus(index);
            return (
              <div key={stage.id} className="flex flex-col items-center gap-2 z-10">
                {/* Icon Circle */}
                <div
                  className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all duration-300",
                    status === 'completed' && "bg-teal-600 scale-100",
                    status === 'current' && "bg-teal-500 scale-110 animate-pulse",
                    status === 'pending' && "bg-slate-700 scale-90 opacity-60"
                  )}
                >
                  {status === 'completed' ? (
                    <Check className="h-6 w-6 text-white" />
                  ) : status === 'current' ? (
                    <Clock className="h-6 w-6 text-white animate-spin" />
                  ) : (
                    <span>{stage.icon}</span>
                  )}
                </div>

                {/* Label */}
                <span
                  className={cn(
                    "text-xs font-medium text-center transition-all duration-300 max-w-[80px]",
                    status === 'completed' && "text-teal-400",
                    status === 'current' && "text-teal-300 font-bold",
                    status === 'pending' && "text-slate-500"
                  )}
                >
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}