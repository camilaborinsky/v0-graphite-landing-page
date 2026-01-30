"use client";

import { useState, useEffect } from "react";
import { X, Linkedin, Plus, Check, Briefcase, Users } from "lucide-react";
import useSWR from "swr";
import type { PersonWithHistory } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PersonModalProps {
  personId: string | null;
  portfolio: string[];
  onClose: () => void;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function PersonModal({ personId, portfolio, onClose }: PersonModalProps) {
  const [savedToList, setSavedToList] = useState(false);

  const { data: person } = useSWR<PersonWithHistory>(
    personId ? `/api/person/${personId}` : null,
    fetcher
  );

  // Check if saved
  useEffect(() => {
    if (personId) {
      const saved = localStorage.getItem("graphite_my_list");
      if (saved) {
        const list = JSON.parse(saved) as string[];
        setSavedToList(list.includes(personId));
      } else {
        setSavedToList(false);
      }
    }
  }, [personId]);

  const handleSaveToList = () => {
    if (!personId) return;
    const saved = localStorage.getItem("graphite_my_list");
    const list = saved ? (JSON.parse(saved) as string[]) : [];

    if (savedToList) {
      const newList = list.filter((id) => id !== personId);
      localStorage.setItem("graphite_my_list", JSON.stringify(newList));
      setSavedToList(false);
    } else {
      list.push(personId);
      localStorage.setItem("graphite_my_list", JSON.stringify(list));
      setSavedToList(true);
    }
  };

  // Generate "Why Meet Them" text
  const generateWhyMeet = () => {
    if (!person) return null;

    const targetCurrentCompany = portfolio.includes(person.currentCompany);
    const targetPastCompanies = person.workHistory
      .filter((w) => !w.isCurrent && portfolio.includes(w.company))
      .map((w) => w.company);
    const connectionsAtTarget = person.connections.filter((c) =>
      portfolio.includes(c.currentCompany)
    );

    const reasons: string[] = [];

    if (targetCurrentCompany) {
      reasons.push(`${person.name} currently works at ${person.currentCompany}, one of your target companies.`);
    }

    if (targetPastCompanies.length > 0) {
      reasons.push(
        `They previously worked at ${targetPastCompanies.join(" and ")}, giving them valuable insider perspective.`
      );
    }

    if (connectionsAtTarget.length > 0) {
      const names = connectionsAtTarget.map((c) => `${c.name} at ${c.currentCompany}`).join(", ");
      reasons.push(`They know ${names} and could facilitate introductions.`);
    }

    if (reasons.length === 0) {
      reasons.push(
        `${person.name} is a ${person.title} at ${person.currentCompany} attending this event.`
      );
    }

    return reasons.join(" ");
  };

  return (
    <Dialog open={!!personId} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Person Details</DialogTitle>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1 rounded-lg hover:bg-neutral-100"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </DialogHeader>

        {person ? (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start gap-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="bg-[#3B82F6]/10 text-[#3B82F6] text-xl font-medium">
                  {person.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <h2 className="text-xl font-semibold text-[#1A1A2E]">
                  {person.name}
                </h2>
                <p className="text-neutral-600">
                  {person.title} @ {person.currentCompany}
                </p>
                {portfolio.includes(person.currentCompany) && (
                  <Badge className="mt-2 bg-[#10B981]/10 text-[#10B981]">
                    Works at Target Company
                  </Badge>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={handleSaveToList}
                variant={savedToList ? "default" : "outline"}
                className={cn(
                  savedToList
                    ? "bg-[#10B981] hover:bg-[#059669]"
                    : "border-neutral-200"
                )}
              >
                {savedToList ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Saved to List
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add to My List
                  </>
                )}
              </Button>

              {person.linkedinUrl && (
                <Button
                  variant="outline"
                  className="border-neutral-200 bg-transparent"
                  asChild
                >
                  <a
                    href={person.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Linkedin className="w-4 h-4 mr-2" />
                    LinkedIn
                  </a>
                </Button>
              )}
            </div>

            {/* Why Meet Them */}
            <div className="bg-[#3B82F6]/5 rounded-lg p-4">
              <h3 className="text-sm font-medium text-[#1A1A2E] mb-2">
                Why Meet Them
              </h3>
              <p className="text-sm text-neutral-600 leading-relaxed">
                {generateWhyMeet()}
              </p>
            </div>

            {/* Work History */}
            <div>
              <h3 className="text-sm font-medium text-[#1A1A2E] mb-3 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-neutral-400" />
                Work History
              </h3>
              <div className="space-y-3">
                {person.workHistory.map((work, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg",
                      portfolio.includes(work.company)
                        ? "bg-[#10B981]/5 border border-[#10B981]/20"
                        : "bg-neutral-50"
                    )}
                  >
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full mt-1.5 shrink-0",
                        work.isCurrent ? "bg-[#10B981]" : "bg-neutral-300"
                      )}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm text-[#1A1A2E]">
                        {work.title}
                      </p>
                      <p className="text-sm text-neutral-600 flex items-center gap-2">
                        {work.company}
                        {portfolio.includes(work.company) && (
                          <Badge className="text-xs bg-[#10B981]/10 text-[#10B981]">
                            Target
                          </Badge>
                        )}
                      </p>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {work.from} - {work.isCurrent ? "Present" : work.to}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Connections */}
            {person.connections.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-[#1A1A2E] mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-neutral-400" />
                  Connections at this Event
                </h3>
                <div className="space-y-2">
                  {person.connections.map((conn) => (
                    <div
                      key={conn.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50"
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-neutral-100 text-neutral-600 text-xs">
                          {conn.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-[#1A1A2E]">
                          {conn.name}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {conn.title} @ {conn.currentCompany}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center text-neutral-400">Loading...</div>
        )}
      </DialogContent>
    </Dialog>
  );
}
