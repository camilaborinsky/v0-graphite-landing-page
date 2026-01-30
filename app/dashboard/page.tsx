"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import useSWR from "swr";
import { useAuth } from "@/lib/auth-context";
import { getPortfolio } from "@/lib/demo-data";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { ForceGraph } from "@/components/force-graph";
import { RecommendationsPanel } from "@/components/recommendations-panel";
import { PersonModal } from "@/components/person-modal";
import { Input } from "@/components/ui/input";
import type { Event, GraphData, Recommendation, GraphNode } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Fetch events
  const { data: events } = useSWR<Event[]>("/api/events", fetcher);

  // Select first event by default
  useEffect(() => {
    if (events && events.length > 0 && !selectedEventId) {
      setSelectedEventId(events[0].id);
    }
  }, [events, selectedEventId]);

  // Fetch graph data
  const { data: graphData } = useSWR<GraphData>(
    selectedEventId && user ? `/api/events/${selectedEventId}/graph?vcId=${user.id}` : null,
    fetcher
  );

  // Fetch recommendations
  const { data: recommendations } = useSWR<Recommendation[]>(
    selectedEventId && user ? `/api/events/${selectedEventId}/recommendations?vcId=${user.id}` : null,
    fetcher
  );

  const portfolio = user ? getPortfolio(user.id) : [];
  const selectedEvent = events?.find((e) => e.id === selectedEventId);

  const handleNodeClick = useCallback((node: GraphNode) => {
    if (node.type === "person") {
      setSelectedPersonId(node.id);
    } else {
      setHighlightedNodeId((prev) => (prev === node.id ? null : node.id));
    }
  }, []);

  const handleRecommendationClick = useCallback((personId: string) => {
    setHighlightedNodeId(personId);
    setSelectedPersonId(personId);
  }, []);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-neutral-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <DashboardHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex overflow-hidden">
        <DashboardSidebar
          events={events || []}
          selectedEventId={selectedEventId}
          onSelectEvent={setSelectedEventId}
          portfolio={portfolio}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(false)}
        />

        {/* Main content */}
        <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Graph area */}
          <div className="flex-1 flex flex-col p-4 min-h-0">
            {/* Event title and search */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-xl font-semibold text-[#1A1A2E]">
                  {selectedEvent?.name || "Select an event"}
                </h2>
                {selectedEvent && (
                  <p className="text-sm text-neutral-500">
                    {selectedEvent.date} · {selectedEvent.attendeeCount} attendees
                  </p>
                )}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <Input
                  placeholder="Search people or companies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 border-neutral-200"
                />
              </div>
            </div>

            {/* Graph */}
            <div className="flex-1 min-h-[400px] rounded-lg border border-neutral-200 overflow-hidden">
              {graphData ? (
                <ForceGraph
                  data={graphData}
                  onNodeClick={handleNodeClick}
                  highlightedNodeId={highlightedNodeId}
                  searchQuery={searchQuery}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-400">
                  Select an event to view the network
                </div>
              )}
            </div>
          </div>

          {/* Recommendations panel */}
          <RecommendationsPanel
            recommendations={recommendations || []}
            eventName={selectedEvent?.name || ""}
            onPersonClick={handleRecommendationClick}
            highlightedPersonId={highlightedNodeId}
          />
        </main>
      </div>

      {/* Person modal */}
      <PersonModal
        personId={selectedPersonId}
        portfolio={portfolio}
        onClose={() => setSelectedPersonId(null)}
      />
    </div>
  );
}
