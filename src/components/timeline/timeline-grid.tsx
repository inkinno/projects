'use client';

import * as React from 'react';
import {
  format,
  subWeeks,
  addWeeks,
  eachDayOfInterval,
  startOfWeek,
  isSameWeek,
  addDays,
  subMonths,
  addMonths,
} from 'date-fns';
import { PlusCircle, ChevronLeft, ChevronRight, Loader2, Trash2, Save } from 'lucide-react';

import type { Service, TimelineEvent } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  addService,
  getServices,
  getEvents,
  deleteService,
  updateService,
} from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { EventCard } from './event-card';
import { AddEventModal } from './add-event-modal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const getWeekOfMonthWithOrdinal = (date: Date): string => {
  const dayOfMonth = date.getDate();
  const weekNumber = Math.ceil(dayOfMonth / 7);
  let suffix = 'th';
  if (weekNumber === 1) suffix = 'st';
  else if (weekNumber === 2) suffix = 'nd';
  else if (weekNumber === 3) suffix = 'rd';
  return `${weekNumber}${suffix} week of ${format(date, 'MMMM, yyyy')}`;
};

function ServiceColumnHeader({ service, onUpdate, onDelete }: { service: Service; onUpdate: () => void; onDelete: () => void; }) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = React.useState(false);
  const [name, setName] = React.useState(service.name);
  const [emoji, setEmoji] = React.useState(service.emoji);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    const result = await updateService(service.id, { name, emoji });
    if (result.success) {
      toast({ title: 'Service Updated' });
      onUpdate();
    } else {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update service.' });
    }
    setIsSaving(false);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteService(service.id);
    if (result.success) {
      toast({ title: 'Service Deleted' });
      onDelete();
    } else {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete service.' });
    }
    setIsDeleting(false);
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <div className="p-2 h-full flex flex-col items-center justify-between border-b border-r" onDoubleClick={() => setIsEditing(true)}>
        {isEditing ? (
          <div className="flex flex-col gap-2 w-full">
            <Input value={emoji} onChange={(e) => setEmoji(e.target.value)} className="text-center" />
            <Input value={name} onChange={(e) => setName(e.target.value)} className="text-center" />
            <div className="flex justify-center gap-2">
              <Button onClick={handleSave} size="sm" disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              </Button>
              <Button onClick={() => setShowDeleteConfirm(true)} size="sm" variant="destructive" disabled={isDeleting}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center font-semibold">
            <div className="text-2xl">{service.emoji}</div>
            <div>{service.name}</div>
          </div>
        )}
      </div>
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the "{service.name}" project and all its events.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}


export default function TimelineGrid({ initialServices }: { initialServices: Service[] }) {
  const { toast } = useToast();
  const [services, setServices] = React.useState(initialServices);
  const [events, setEvents] = React.useState<TimelineEvent[]>([]);
  const [isFetching, setIsFetching] = React.useState(true);
  const [modalState, setModalState] = React.useState<{ isOpen: boolean; date: string; serviceId: string }>({ isOpen: false, date: '', serviceId: '' });
  const today = new Date();
  const currentWeekRef = React.useRef<HTMLTableRowElement>(null);

  const [currentDateRange, setCurrentDateRange] = React.useState<{ start: Date; end: Date }>(() => {
    return { start: subWeeks(today, 6), end: addWeeks(today, 6) };
  });

  const fetchAndSetServices = async () => {
    const updatedServices = await getServices();
    setServices(updatedServices);
  };

  const handleAddService = async () => {
    const result = await addService();
    if (result.success) {
      toast({ title: 'Service Added' });
      await fetchAndSetServices();
    } else {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to add a new service.' });
    }
  };

  const handleUpdateService = () => fetchAndSetServices();
  const handleDeleteService = () => fetchAndSetServices();

  React.useEffect(() => {
    const fetchEvents = async () => {
      setIsFetching(true);
      const fetchedEvents = await getEvents(currentDateRange.start, currentDateRange.end);
      setEvents(fetchedEvents);
      setIsFetching(false);
    };
    fetchEvents();
  }, [currentDateRange]);

  React.useEffect(() => {
    if (!isFetching && currentWeekRef.current) {
      currentWeekRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [isFetching, events]);

  const weeksToRender = React.useMemo(() => {
    const weeks: { startDate: Date }[] = [];
    let currentDate = startOfWeek(currentDateRange.start, { weekStartsOn: 1 });
    while (currentDate <= currentDateRange.end) {
      weeks.push({ startDate: currentDate });
      currentDate = addDays(currentDate, 7);
    }
    return weeks;
  }, [currentDateRange]);
  
  const eventsByDateAndService: Record<string, TimelineEvent[]> = React.useMemo(() => {
    const grouped: Record<string, TimelineEvent[]> = {};
    events.forEach((event) => {
        const key = `${event.date}_${event.serviceId}`;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(event);
    });
    return grouped;
  }, [events]);

  const openModal = (date: string, serviceId: string) => setModalState({ isOpen: true, date, serviceId });
  
  const handleLoadPeriod = (direction: 'prev' | 'next') => {
    setCurrentDateRange(prevRange => ({
      start: direction === 'prev' ? subMonths(prevRange.start, 3) : prevRange.start,
      end: direction === 'next' ? addMonths(prevRange.end, 3) : prevRange.end,
    }));
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="p-2 bg-card border-b flex-shrink-0 flex justify-center items-center space-x-4">
        <Button onClick={() => handleLoadPeriod('prev')} variant="outline" size="sm" disabled={isFetching}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        <span className="text-sm font-medium text-muted-foreground">
          {format(currentDateRange.start, 'MMM yyyy')} - {format(currentDateRange.end, 'MMM yyyy')}
        </span>
        <Button onClick={() => handleLoadPeriod('next')} variant="outline" size="sm" disabled={isFetching}>
          Next <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Grid */}
      <div className="flex-grow flex w-full overflow-auto">
        {/* Week Column */}
        <div className="flex-shrink-0" style={{ flexBasis: '150px' }}>
          <div className="h-24 p-2 flex items-center justify-center font-semibold border-b border-r sticky top-0 bg-card z-20">Week</div>
          {weeksToRender.map((week) => {
            const isCurrentWeek = isSameWeek(today, week.startDate, { weekStartsOn: 1 });
            return (
              <div
                key={week.startDate.toISOString()}
                ref={isCurrentWeek ? currentWeekRef : null}
                className={cn('h-24 p-2 flex items-center justify-center text-center font-semibold border-b border-r', isCurrentWeek && 'bg-green-100/50 dark:bg-green-900/30')}
              >
                {getWeekOfMonthWithOrdinal(week.startDate)}
              </div>
            );
          })}
        </div>

        {/* Services Area */}
        <div className="flex-grow flex">
          {services.map((service) => (
            <div key={service.id} className="flex flex-col" style={{ flex: 1, minWidth: '150px' }}>
              <div className="h-24 sticky top-0 bg-card z-10">
                <ServiceColumnHeader service={service} onUpdate={handleUpdateService} onDelete={handleDeleteService} />
              </div>
              {weeksToRender.map((week) => {
                const weekDates = eachDayOfInterval({start: week.startDate, end: addDays(week.startDate, 6)});
                const cellEvents = weekDates.flatMap(date => {
                    const dateString = format(date, 'yyyy-MM-dd');
                    const key = `${dateString}_${service.id}`;
                    return eventsByDateAndService[key] || [];
                });
                return (
                  <div
                    key={week.startDate.toISOString()}
                    className="h-24 p-1 border-b border-r cursor-pointer hover:bg-primary/5"
                    onClick={() => openModal(format(week.startDate, 'yyyy-MM-dd'), service.id)}
                  >
                    {cellEvents.map(event => <EventCard key={event.id} event={event} />)}
                  </div>
                );
              })}
            </div>
          ))}

          {/* Add Service Column */}
          <div className="flex-shrink-0 flex flex-col" style={{ flexBasis: '80px' }}>
            <div className="h-24 p-2 flex items-center justify-center sticky top-0 bg-card z-10 border-b">
              <Button variant="ghost" size="sm" onClick={handleAddService} className="w-full h-full">
                <PlusCircle className="h-6 w-6" />
              </Button>
            </div>
            {weeksToRender.map((week) => (
              <div key={week.startDate.toISOString()} className="h-24 border-b"></div>
            ))}
          </div>
        </div>
      </div>
      <AddEventModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        date={modalState.date}
        serviceId={modalState.serviceId}
        services={services}
      />
    </div>
  );
}
