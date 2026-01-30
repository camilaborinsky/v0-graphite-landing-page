"use client";

import { useState } from "react";
import { ChevronRight, Users } from "lucide-react";
import type { Recommendation } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface RecommendationsPanelProps {
  recommendations: Recommendation[];
  eventName: string;
  onPersonClick: (personId: string) => void;
  highlightedPersonId: string | null;
}

export function RecommendationsPanel({
  recommendations,
  eventName,
  onPersonClick,
  highlightedPersonId,
}: RecommendationsPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getBadgeVariant = (type: Recommendation["reasonType"]) => {
    switch (type) {
      case "works_at_target":
        return "bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/20";
      case "former_target":
        return "bg-[#3B82F6]/10 text-[#3B82F6] hover:bg-[#3B82F6]/20";
      case "connected_to_target":
        return "bg-neutral-100 text-neutral-600 hover:bg-neutral-200";
    }
  };

  return (
    <>
      {/* Collapse toggle for mobile */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="lg:hidden fixed bottom-4 right-4 z-20 bg-[#1A1A2E] text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2"
      >
        <Users className="w-4 h-4" />
        Who to Meet
        <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
          {recommendations.length}
        </span>
      </button>

      {/* Panel */}
      <aside
        className={cn(
          "w-full lg:w-80 bg-white border-l border-neutral-200 flex flex-col transition-transform duration-200",
          "fixed lg:static inset-x-0 bottom-0 lg:inset-auto z-30 lg:z-auto",
          "rounded-t-xl lg:rounded-none shadow-lg lg:shadow-none",
          "max-h-[60vh] lg:max-h-none",
          isCollapsed ? "translate-y-full lg:translate-y-0" : "translate-y-0"
        )}
      >
        {/* Mobile handle */}
        <div className="lg:hidden flex justify-center py-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-12 h-1 bg-neutral-300 rounded-full"
          />
        </div>

        {/* Header */}
        <div className="p-4 border-b border-neutral-100">
          <h3 className="font-semibold text-[#1A1A2E] flex items-center gap-2">
            <Users className="w-4 h-4 text-[#3B82F6]" />
            Who to Meet
          </h3>
          {eventName && (
            <p className="text-xs text-neutral-500 mt-1">at {eventName}</p>
          )}
        </div>

        {/* Recommendations list */}
        <div className="flex-1 overflow-y-auto p-2">
          {recommendations.length === 0 ? (
            <div className="text-center text-neutral-400 py-8 text-sm">
              No recommendations for this event
            </div>
          ) : (
            <div className="space-y-1">
              {recommendations.map((rec) => (
                <button
                  key={rec.person.id}
                  onClick={() => onPersonClick(rec.person.id)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg transition-colors flex items-start gap-3",
                    highlightedPersonId === rec.person.id
                      ? "bg-[#3B82F6]/10"
                      : "hover:bg-neutral-50"
                  )}
                >
                  <Avatar className="w-10 h-10 shrink-0">
                    <AvatarFallback className="bg-[#3B82F6]/10 text-[#3B82F6] text-sm font-medium">
                      {rec.person.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-[#1A1A2E] truncate">
                      {rec.person.name}
                    </p>
                    <p className="text-xs text-neutral-500 truncate">
                      {rec.person.title} @ {rec.person.currentCompany}
                    </p>
                    <Badge
                      className={cn(
                        "mt-1.5 text-xs font-normal",
                        getBadgeVariant(rec.reasonType)
                      )}
                    >
                      {rec.reason}
                    </Badge>
                  </div>

                  <ChevronRight className="w-4 h-4 text-neutral-300 shrink-0 mt-1" />
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
