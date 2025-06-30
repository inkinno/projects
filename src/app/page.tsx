import { getServices, getEvents } from '@/app/actions';
import { TimelineGrid } from '@/components/timeline/timeline-grid';

export default async function Home() {
  const initialServices = await getServices();
  const initialEvents = await getEvents();

  return (
    <main className="h-screen w-screen overflow-hidden bg-background font-sans text-foreground">
      <TimelineGrid
        initialServices={initialServices}
        initialEvents={initialEvents}
      />
    </main>
  );
}
