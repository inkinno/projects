'use client';

import * as React from 'react';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { PlusCircle } from 'lucide-react';

import type { Service, TimelineEvent } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { addService } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { ServiceHeader } from './service-header';
import { EventCard } from './event-card';
import { AddEventModal } from './add-event-modal';

interface TimelineGridProps {
  initialServices: Service[];
  initialEvents: TimelineEvent[];
}

export function TimelineGrid({
  initialServices,
  initialEvents,
}: TimelineGridProps) {
  const [services, setServices] = React.useState(initialServices);
  const [events, setEvents] = React.useState(initialEvents);
  const [modalState, setModalState] = React.useState<{
    isOpen: boolean;
    date: string;
    serviceId: string;
  }>({ isOpen: false, date: '', serviceId: '' });

  const { toast } = useToast();

  React.useEffect(() => setServices(initialServices), [initialServices]);
  React.useEffect(() => setEvents(initialEvents), [initialEvents]);

  const handleAddService = async () => {
    const result = await addService();
    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add a new service.',
      });
    }
  };

  const today = new Date();
  const dateRange = eachDayOfInterval({
    start: subDays(today, 30),
    end: today,
  }).reverse();

  const eventsByDateAndService: Record<string, TimelineEvent[]> =
    React.useMemo(() => {
      const grouped: Record<string, TimelineEvent[]> = {};
      events.forEach((event) => {
        const key = `${event.date}_${event.serviceId}`;
        if (!grouped[key]) {
          grouped[key] = [];
        }
        grouped[key].push(event);
      });
      return grouped;
    }, [events]);

  const openModal = (date: string, serviceId: string) => {
    setModalState({ isOpen: true, date, serviceId });
  };

  return (
    <>
      <div className="h-full w-full overflow-auto rounded-lg border bg-card shadow-sm">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-20 bg-card">
            <tr>
              <th className="sticky left-0 top-0 z-30 w-32 min-w-32 border-b border-r bg-card p-2 text-sm font-semibold">
                <div className="flex items-center justify-center">Date</div>
              </th>
              {services.map((service) => (
                <ServiceHeader key={service.id} service={service} />
              ))}
              <th className="sticky top-0 z-10 w-20 min-w-20 border-b p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAddService}
                  className="w-full"
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Add
                </Button>
              </th>
            </tr>
          </thead>
          <tbody>
            {dateRange.map((date, index) => {
              const dateString = format(date, 'yyyy-MM-dd');
              const isToday = format(date, 'MM-dd') === format(today, 'MM-dd');
              return (
                <tr key={dateString} className="h-24">
                  <th
                    className={cn(
                      'sticky left-0 z-10 w-32 min-w-32 border-r bg-card/80 p-2 text-sm font-medium text-muted-foreground backdrop-blur-sm transition-colors',
                      isToday && 'bg-primary/10 text-primary',
                      index % 2 !== 0 && 'bg-muted/50'
                    )}
                  >
                    <div className="flex flex-col items-center">
                      <span>{format(date, 'EEE')}</span>
                      <span className="text-lg font-semibold text-foreground">
                        {format(date, 'd')}
                      </span>
                      <span>{format(date, 'MMM')}</span>
                    </div>
                  </th>
                  {services.map((service) => {
                    const cellKey = `${dateString}_${service.id}`;
                    const cellEvents = eventsByDateAndService[cellKey] || [];
                    return (
                      <td
                        key={cellKey}
                        className={cn(
                          'min-w-48 border-b align-top transition-colors hover:bg-primary/5',
                          index % 2 !== 0 && 'bg-muted/30 hover:bg-primary/10'
                        )}
                        onClick={() => openModal(dateString, service.id)}
                      >
                        <div className="flex h-full w-full cursor-pointer flex-col gap-1 p-1">
                          {cellEvents.map((event) => (
                            <EventCard key={event.id} event={event} />
                          ))}
                        </div>
                      </td>
                    );
                  })}
                  <td className={cn('border-b', index % 2 !== 0 && 'bg-muted/30')}></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <AddEventModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        date={modalState.date}
        serviceId={modalState.serviceId}
        services={services}
      />
    </>
  );
}
