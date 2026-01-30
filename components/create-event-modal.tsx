"use client";

import React from "react";

import { useState, useCallback, useEffect } from "react";
import { Upload, X, Check, AlertCircle, Calendar, Users, Lock, Sparkles } from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface CreateEventModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type Step = "details" | "attendees" | "uploading" | "searching" | "results" | "success" | "error";

interface AttendeeRow {
  name: string;
  title?: string;
  currentCompany?: string;
  linkedinUrl?: string;
  workHistory?: string;
}

interface MatchedPerson {
  name: string;
  title: string;
  company: string;
  matchReason: string;
}

export function CreateEventModal({ open, onClose, onSuccess }: CreateEventModalProps) {
  const [step, setStep] = useState<Step>("details");
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventId, setEventId] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [attendees, setAttendees] = useState<AttendeeRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchProgress, setSearchProgress] = useState(0);
  const [searchingPerson, setSearchingPerson] = useState("");
  const [matchedPeople, setMatchedPeople] = useState<MatchedPerson[]>([]);

  const parseCSV = useCallback((text: string): AttendeeRow[] => {
    const lines = text.split("\n").filter((line) => line.trim());
    const attendees: AttendeeRow[] = [];
    
    // Detect headers
    const headers = lines[0]?.toLowerCase().split(",").map((h) => h.trim().replace(/^["']|["']$/g, "")) || [];
    const nameIdx = headers.findIndex((h) => h === "name" || h === "full name" || h === "attendee");
    const titleIdx = headers.findIndex((h) => h === "title" || h === "role" || h === "position");
    const companyIdx = headers.findIndex((h) => h === "company" || h === "currentcompany" || h === "organization");
    const linkedinIdx = headers.findIndex((h) => h === "linkedin" || h === "linkedinurl" || h === "linkedin url");
    const historyIdx = headers.findIndex((h) => h === "workhistory" || h === "work history" || h === "history");
    
    const startIdx = nameIdx >= 0 ? 1 : 0; // Skip header if detected
    
    for (let i = startIdx; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim().replace(/^["']|["']$/g, ""));
      
      const name = nameIdx >= 0 ? values[nameIdx] : values[0];
      if (!name || name.length === 0) continue;
      
      attendees.push({
        name,
        title: titleIdx >= 0 ? values[titleIdx] : values[1],
        currentCompany: companyIdx >= 0 ? values[companyIdx] : values[2],
        linkedinUrl: linkedinIdx >= 0 ? values[linkedinIdx] : undefined,
        workHistory: historyIdx >= 0 ? values[historyIdx] : undefined,
      });
    }
    
    return attendees;
  }, []);

  const handleCreateEvent = async () => {
    if (!eventName.trim() || !eventDate.trim()) {
      setError("Please fill in all fields");
      return;
    }
    
    setStep("uploading");
    setError(null);
    
    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: eventName, 
          date: new Date(eventDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        }),
      });
      
      if (!response.ok) throw new Error("Failed to create event");
      
      const event = await response.json();
      setEventId(event.id);
      setStep("attendees");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create event");
      setStep("error");
    }
  };

  // Simulate searching animation
  useEffect(() => {
    if (step === "searching" && attendees.length > 0) {
      let currentIdx = 0;
      const totalTime = 4000; // 4 seconds total
      const interval = totalTime / attendees.length;
      
      const timer = setInterval(() => {
        currentIdx++;
        setSearchProgress((currentIdx / attendees.length) * 100);
        if (currentIdx < attendees.length) {
          setSearchingPerson(attendees[currentIdx].name);
        }
        
        if (currentIdx >= attendees.length) {
          clearInterval(timer);
          // Generate fake matches from last 2 companies in portfolio
          setTimeout(() => {
            setMatchedPeople([
              {
                name: "Alex Rodriguez",
                title: "Senior Engineer",
                company: "TechVentures Inc",
                matchReason: "Works at portfolio company"
              },
              {
                name: "Sarah Chen",
                title: "Product Manager",
                company: "InnovateCo",
                matchReason: "Former employee of portfolio company"
              }
            ]);
            setStep("results");
          }, 500);
        }
      }, interval);
      
      setSearchingPerson(attendees[0].name);
      
      return () => clearInterval(timer);
    }
  }, [step, attendees]);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    
    try {
      const text = await file.text();
      const parsed = parseCSV(text);
      
      if (parsed.length === 0) {
        setError("No attendees found in file");
        return;
      }
      
      setAttendees(parsed);
      setSearchProgress(0);
      setStep("searching");
      
      // Upload in background while showing search animation
      fetch(`/api/events/${eventId}/attendees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendees: parsed }),
      }).catch(console.error);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process file");
      setStep("error");
    }
  }, [parseCSV, eventId]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file && (file.type === "text/csv" || file.name.endsWith(".csv"))) {
      handleFile(file);
    } else {
      setError("Please upload a CSV file");
    }
  }, [handleFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleReset = useCallback(() => {
    setStep("details");
    setEventName("");
    setEventDate("");
    setEventId(null);
    setAttendees([]);
    setError(null);
    setSearchProgress(0);
    setSearchingPerson("");
    setMatchedPeople([]);
  }, []);

  const handleClose = useCallback(() => {
    handleReset();
    onClose();
  }, [handleReset, onClose]);

  const handleSkipAttendees = useCallback(() => {
    setStep("success");
    setTimeout(() => {
      onSuccess();
      handleReset();
    }, 1500);
  }, [onSuccess, handleReset]);

  const handleContinueToDashboard = useCallback(() => {
    onSuccess();
    handleReset();
  }, [onSuccess, handleReset]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={cn(
        "sm:max-w-md",
        (step === "searching" || step === "results") && "sm:max-w-lg"
      )}>
        <DialogHeader>
          <DialogTitle>
            {step === "details" && "Create New Event"}
            {step === "attendees" && "Upload Attendees"}
            {step === "uploading" && "Processing..."}
            {step === "searching" && "Searching Attendees"}
            {step === "results" && "Matches Found!"}
            {step === "success" && "Event Created"}
            {step === "error" && "Error"}
          </DialogTitle>
          <DialogDescription>
            {step === "details" && "Enter the event details to get started."}
            {step === "attendees" && "Upload a CSV with attendee information."}
            {step === "searching" && "Finding connections to your portfolio companies..."}
            {step === "results" && "We found people connected to your portfolio."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {step === "details" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="event-name">Event Name</Label>
                <Input
                  id="event-name"
                  placeholder="e.g., YC Demo Day"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-date">Date</Label>
                <Input
                  id="event-date"
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                />
              </div>
              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
              <Button onClick={handleCreateEvent} className="w-full bg-[#3B82F6] hover:bg-[#2563EB]">
                <Calendar className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </>
          )}

          {step === "attendees" && (
            <>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                  dragActive ? "border-[#3B82F6] bg-[#3B82F6]/5" : "border-neutral-200 hover:border-neutral-300"
                )}
              >
                <Users className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
                <p className="text-sm text-neutral-600 mb-2">
                  Drag and drop your attendees CSV, or
                </p>
                <label>
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                  <span className="text-sm font-medium text-[#3B82F6] hover:text-[#2563EB] cursor-pointer">
                    browse to upload
                  </span>
                </label>
              </div>

              <div className="bg-neutral-50 rounded-lg p-3">
                <p className="text-xs text-neutral-500 font-medium mb-1">Expected format:</p>
                <code className="text-xs text-neutral-600 block">
                  name,title,company<br />
                  Alex Rivera,Engineer,Stripe<br />
                  Jordan Lee,PM,Figma
                </code>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button variant="ghost" onClick={handleSkipAttendees} className="w-full">
                Skip for now
              </Button>
            </>
          )}

          {step === "uploading" && (
            <div className="py-8 text-center">
              <div className="w-10 h-10 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-neutral-600">Processing...</p>
            </div>
          )}

          {step === "searching" && (
            <div className="py-6">
              {/* Exa Logo with animation */}
              <div className="flex items-center justify-center mb-6">
                <div className="relative">
                  <Image
                    src="/exa-logo.png"
                    alt="Exa Search"
                    width={120}
                    height={40}
                    className="animate-pulse"
                  />
                  <div className="absolute -top-1 -right-1">
                    <span className="flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3B82F6] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-[#3B82F6]"></span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-neutral-100 rounded-full h-2 mb-4">
                <div 
                  className="bg-[#3B82F6] h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${searchProgress}%` }}
                />
              </div>

              {/* Currently searching */}
              <div className="text-center space-y-2">
                <p className="text-sm text-neutral-500">Searching profiles...</p>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-[#3B82F6] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-[#3B82F6] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-[#3B82F6] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <p className="text-xs text-neutral-400 font-mono truncate max-w-[250px] mx-auto">
                  {searchingPerson}
                </p>
              </div>

              {/* Stats */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="bg-neutral-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-semibold text-neutral-900">{attendees.length}</p>
                  <p className="text-xs text-neutral-500">Attendees</p>
                </div>
                <div className="bg-neutral-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-semibold text-neutral-900">{Math.round(searchProgress)}%</p>
                  <p className="text-xs text-neutral-500">Complete</p>
                </div>
              </div>
            </div>
          )}

          {step === "results" && (
            <div className="py-4">
              {/* Success indicator */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="w-8 h-8 bg-[#10B981]/10 rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#10B981]" />
                </div>
                <p className="text-lg font-semibold text-neutral-900">
                  Found {matchedPeople.length} matches!
                </p>
              </div>

              {/* Blurred matches */}
              <div className="space-y-3 mb-6">
                {matchedPeople.map((person, idx) => (
                  <div 
                    key={idx}
                    className="relative bg-neutral-50 rounded-lg p-4 overflow-hidden"
                  >
                    {/* Blur overlay */}
                    <div className="absolute inset-0 backdrop-blur-md bg-white/60 z-10 flex items-center justify-center">
                      <Lock className="w-5 h-5 text-neutral-400" />
                    </div>
                    
                    {/* Blurred content */}
                    <div className="flex items-start gap-3 select-none">
                      <div className="w-10 h-10 bg-neutral-200 rounded-full flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-neutral-900 blur-[6px]">{person.name}</p>
                        <p className="text-sm text-neutral-600 blur-[6px]">{person.title} at {person.company}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-[#10B981]/10 text-[#10B981] text-xs rounded-full blur-[4px]">
                          {person.matchReason}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Premium upsell */}
              <div className="bg-gradient-to-br from-[#1A1A2E] to-[#2D2D44] rounded-xl p-5 text-center">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-5 h-5 text-[#3B82F6]" />
                </div>
                <h4 className="text-white font-semibold mb-1">Unlock Premium</h4>
                <p className="text-neutral-400 text-sm mb-4">
                  Upgrade to see who you should meet at this event
                </p>
                <Button className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white">
                  Upgrade to Premium
                </Button>
              </div>

              {/* Continue button */}
              <Button 
                variant="ghost" 
                onClick={handleContinueToDashboard} 
                className="w-full mt-3"
              >
                Continue to Dashboard
              </Button>
            </div>
          )}

          {step === "success" && (
            <div className="py-8 text-center">
              <div className="w-12 h-12 bg-[#10B981]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6 text-[#10B981]" />
              </div>
              <p className="text-sm font-medium text-neutral-900 mb-1">
                Event created successfully!
              </p>
              {attendees.length > 0 && (
                <p className="text-xs text-neutral-500">
                  {attendees.length} attendees added
                </p>
              )}
            </div>
          )}

          {step === "error" && (
            <div className="py-6">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <p className="text-sm text-red-600 text-center mb-4">{error}</p>
              <Button onClick={handleReset} variant="outline" className="w-full bg-transparent">
                Try Again
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
