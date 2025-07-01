import TimelineContainer from '@/components/timeline/timeline-grid';

export default function Home() {
  // Initial data fetching will now be handled client-side
  return (
    <main className="h-screen w-screen overflow-hidden bg-background font-sans text-foreground flex flex-col">
      <h1 className="text-2xl font-bold p-4 flex-shrink-0">PROJECTs</h1>
      <div className="flex-grow overflow-hidden">
        {/* Pass an empty array initially */}
        <TimelineContainer initialServices={[]} />
      </div>
    </main>
  );
}
