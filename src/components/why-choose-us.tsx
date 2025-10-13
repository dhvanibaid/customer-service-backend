"use client";

import { Card } from '@/components/ui/card';
import { Shield, Clock, Users, ThumbsUp } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: "Verified Professionals",
    description: "All service providers are background-checked and certified"
  },
  {
    icon: Clock,
    title: "Quick Response",
    description: "Average response time under 30 minutes"
  },
  {
    icon: Users,
    title: "10,000+ Customers",
    description: "Trusted by thousands across India"
  },
  {
    icon: ThumbsUp,
    title: "Quality Guaranteed",
    description: "100% satisfaction or we redo the work"
  }
];

export function WhyChooseUs() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-teal-400 text-center">
        Why Choose Snapfix?
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card
              key={index}
              className="p-4 bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800 transition-all duration-300"
            >
              <Icon className="h-8 w-8 text-teal-400 mb-2" />
              <h4 className="font-semibold text-slate-200 text-sm mb-1">
                {feature.title}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}