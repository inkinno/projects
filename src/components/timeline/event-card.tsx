'use client';

import {
  Milestone,
  AlertTriangle,
  FileText,
  Info,
  Sparkles,
} from 'lucide-react';
import type { TimelineEvent } from '@/lib/types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import * as React from 'react';

interface EventCardProps {
  event: TimelineEvent;
}

const categoryStyles: Record<
  string,
  { icon: React.ElementType; className: string }
> = {
  'critical milestone': {
    icon: Milestone,
    className: 'bg-accent/20 border-accent text-accent-foreground/80',
  },
  'potential issue': {
    icon: AlertTriangle,
    className:
      'bg-destructive/20 border-destructive text-destructive-foreground/80',
  },
  'normal update': {
    icon: FileText,
    className: 'bg-primary/10 border-primary/80 text-primary-foreground/80',
  },
  default: {
    icon: Info,
    className: 'bg-secondary border-secondary-foreground/20 text-secondary-foreground',
  },
};

export function EventCard({ event }: EventCardProps) {
  const { icon: Icon, className } =
    categoryStyles[event.category.toLowerCase()] || categoryStyles.default;

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'flex w-full cursor-default items-start gap-2 rounded-md border p-2 text-xs shadow-sm transition-all',
              className,
              event.highlight && 'shadow-md shadow-amber-400/50'
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <Icon className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
            <p className="flex-grow text-foreground">{event.content}</p>
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          align="start"
          className="max-w-xs"
        >
          <div className="flex items-start gap-2 p-1">
            <Sparkles className="h-4 w-4 flex-shrink-0 text-amber-500" />
            <div>
              <p className="font-semibold">AI Analysis</p>
              <p className="text-muted-foreground">{event.reason}</p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
