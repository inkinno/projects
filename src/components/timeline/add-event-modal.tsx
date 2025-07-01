'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

import type { Service } from '@/lib/types';
import { addEvent } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string; // This is the date determined by the grid cell click
  serviceId: string;
  services: Service[];
}

// The schema no longer needs to validate the date, as it's not an input.
const eventSchema = z.object({
  title: z.string().min(1, 'Event title is required.'),
  content: z.string().min(3, 'Event details must be at least 3 characters.'),
});

export function AddEventModal({
  isOpen,
  onClose,
  date,
  serviceId,
  services,
}: AddEventModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();
  const form = useForm<z.infer<typeof eventSchema>>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      content: '',
    },
  });

  // Reset form when the modal opens
  React.useEffect(() => {
    if (isOpen) {
      form.reset({
        title: '',
        content: '',
      });
    }
  }, [isOpen, form]);

  const service = services.find((s) => s.id === serviceId);

  const onSubmit = async (values: z.infer<typeof eventSchema>) => {
    setIsSubmitting(true);
    try {
      // The 'date' is now passed directly from the props, not the form values.
      const result = await addEvent({
        serviceId,
        date: date,
        title: values.title,
        content: values.content,
      });

      if (result.success) {
        toast({
          title: 'Event Added',
          description: 'Your new event has been saved.',
        });
        form.reset();
        onClose();
      } else {
        throw new Error(result.error || 'An unknown error occurred.');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to add event: ${(error as Error).message}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Event</DialogTitle>
          <DialogDescription>
            Adding an event for{' '}
            <span className="font-semibold text-primary">{service?.name}</span>{' '}
            on{' '}
            <span className="font-semibold text-primary">
              {format(new Date(date), 'MMMM d, yyyy')}
            </span>
            .
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter event title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* The date input FormField has been removed */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Details</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the milestone, update, or issue..."
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Event
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
