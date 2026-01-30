"use client";

import { useState } from "react";
import { Calendar, Building2, ChevronDown, ChevronRight, Plus, Upload } from "lucide-react";
import type { Event } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DashboardSidebarProps {
  events: Event[];
  selectedEventId: string | null;
  onSelectEvent: (eventId: string) => void;
  portfolio: string[];
  isOpen: boolean;
  onToggle: () => void;
  onCreateEvent: () => void;
  onUploadPortfolio: () => void;
}

export function DashboardSidebar({
  events,
  selectedEventId,
  onSelectEvent,
  portfolio,
  isOpen,
  onToggle,
  onCreateEvent,
  onUploadPortfolio,
}: DashboardSidebarProps) {
  const [eventsExpanded, setEventsExpanded] = useState(true);
  const [portfolioExpanded, setPortfolioExpanded] = useState(true);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-neutral-200 transform transition-transform duration-200 ease-in-out flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex-1 overflow-y-auto p-4">
          {/* Events Section */}
          <div className="mb-6">
            <button
              onClick={() => setEventsExpanded(!eventsExpanded)}
              className="flex items-center justify-between w-full text-sm font-medium text-neutral-500 uppercase tracking-wide mb-2 hover:text-neutral-700"
            >
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Events
              </span>
              {eventsExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>

            {eventsExpanded && (
              <div className="space-y-1">
                {events.length === 0 ? (
                  <p className="text-sm text-neutral-400 px-3 py-2">No events yet</p>
                ) : (
                  events.map((event) => (
                    <button
                      key={event.id}
                      onClick={() => onSelectEvent(event.id)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                        selectedEventId === event.id
                          ? "bg-[#3B82F6]/10 text-[#3B82F6] font-medium"
                          : "text-neutral-700 hover:bg-neutral-100"
                      )}
                    >
                      <p className="font-medium truncate">{event.name}</p>
                      <p className="text-xs text-neutral-500">
                        {event.date} · {event.attendeeCount} attendees
                      </p>
                    </button>
                  ))
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onCreateEvent}
                  className="w-full justify-start text-[#3B82F6] hover:text-[#2563EB] hover:bg-[#3B82F6]/5 mt-2"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </Button>
              </div>
            )}
          </div>

          {/* Portfolio Section */}
          <div>
            <button
              onClick={() => setPortfolioExpanded(!portfolioExpanded)}
              className="flex items-center justify-between w-full text-sm font-medium text-neutral-500 uppercase tracking-wide mb-2 hover:text-neutral-700"
            >
              <span className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                My Portfolio
              </span>
              {portfolioExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>

            {portfolioExpanded && (
              <div className="space-y-1">
                {portfolio.length === 0 ? (
                  <p className="text-sm text-neutral-400 px-3 py-2">No companies yet</p>
                ) : (
                  portfolio.map((company) => (
                    <div
                      key={company}
                      className="px-3 py-2 text-sm text-neutral-700 flex items-center gap-2"
                    >
                      <div className="w-2 h-2 rounded-sm bg-[#10B981]" />
                      {company}
                    </div>
                  ))
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onUploadPortfolio}
                  className="w-full justify-start text-[#3B82F6] hover:text-[#2563EB] hover:bg-[#3B82F6]/5 mt-2"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Portfolio
                </Button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
