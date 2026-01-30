"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import useSWR from "swr";
import { useAuth } from "@/lib/auth-context";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { ForceGraph } from "@/components/force-graph";
import { RecommendationsPanel } from "@/components/recommendations-panel";
import { PersonModal } from "@/components/person-modal";
import { UploadPortfolioModal } from "@/components/upload-portfolio-modal";
import { CreateEventModal } from "@/components/create-event-modal";
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
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Fetch events
  const { data: events, mutate: mutateEvents } = useSWR<Event[]>("/api/events", fetcher);

  // Fetch portfolio
  const { data: portfolio, mutate: mutatePortfolio } = useSWR<string[]>(
    user ? `/api/portfolio?userId=${user.id}` : null,
    fetcher
  );

  // Select first event by default
  useEffect(() => {
    if (events && events.length > 0 && !selectedEventId) {
      setSelectedEventId(events[0].id);
    }
  }, [events, selectedEventId]);

  // Fetch graph data
  const { data: graphData, mutate: mutateGraph } = useSWR<GraphData>(
    selectedEventId && user ? `/api/events/${selectedEventId}/graph?vcId=${user.id}` : null,
    fetcher
  );

  // Fetch recommendations
  const { data: recommendations, mutate: mutateRecommendations } = useSWR<Recommendation[]>(
    selectedEventId && user ? `/api/events/${selectedEventId}/recommendations?vcId=${user.id}` : null,
    fetcher
  );

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

  const handlePortfolioSuccess = useCallback(() => {
    setShowPortfolioModal(false);
    mutatePortfolio();
    mutateGraph();
    mutateRecommendations();
  }, [mutatePortfolio, mutateGraph, mutateRecommendations]);

  const handleEventSuccess = useCallback(() => {
    setShowEventModal(false);
    mutateEvents().then((newEvents) => {
      if (newEvents && newEvents.length > 0) {
        setSelectedEventId(newEvents[newEvents.length - 1].id);
      }
    });
  }, [mutateEvents]);

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
          portfolio={portfolio || []}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(false)}
          onCreateEvent={() => setShowEventModal(true)}
          onUploadPortfolio={() => setShowPortfolioModal(true)}
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

            {/* Graph or empty state */}
            <div className="flex-1 min-h-[400px] rounded-lg border border-neutral-200 overflow-hidden bg-white">
              {graphData && graphData.nodes.length > 0 ? (
                <ForceGraph
                  data={graphData}
                  onNodeClick={handleNodeClick}
                  highlightedNodeId={highlightedNodeId}
                  searchQuery={searchQuery}
                />
              ) : selectedEvent ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 p-8">
                  <p className="text-lg mb-2">No attendees in this event yet</p>
                  <p className="text-sm">Upload attendees to see the network graph</p>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 p-8">
                  <p className="text-lg mb-2">No events yet</p>
                  <p className="text-sm">Create an event and upload attendees to get started</p>
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
        portfolio={portfolio || []}
        onClose={() => setSelectedPersonId(null)}
      />

      {/* Upload portfolio modal */}
      <UploadPortfolioModal
        open={showPortfolioModal}
        onClose={() => setShowPortfolioModal(false)}
        userId={user.id}
        onSuccess={handlePortfolioSuccess}
      />

      {/* Create event modal */}
      <CreateEventModal
        open={showEventModal}
        onClose={() => setShowEventModal(false)}
        onSuccess={handleEventSuccess}
      />
    </div>
  );
}
