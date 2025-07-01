import { getServices } from '@/app/actions';
import TimelineContainer from '@/components/timeline/timeline-grid'; // Updated import

export default async function Home() {
  const initialServices = await getServices();

  return (
    <main className="h-screen w-screen overflow-hidden bg-background font-sans text-foreground flex flex-col">
      <h1 className="text-2xl font-bold p-4 flex-shrink-0">PROJECTs</h1>
      {/* The container now handles its own toolbar and data fetching */}
      <div className="flex-grow overflow-hidden">
        <TimelineContainer initialServices={initialServices} />
      </div>
    </main>
  );
}
