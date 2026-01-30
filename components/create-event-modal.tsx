"use client";

import React from "react"

import { useState, useCallback } from "react";
import { Upload, X, Check, AlertCircle, Calendar, Users } from "lucide-react";
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

type Step = "details" | "attendees" | "uploading" | "success" | "error";

interface AttendeeRow {
  name: string;
  title?: string;
  currentCompany?: string;
  linkedinUrl?: string;
  workHistory?: string;
}

export function CreateEventModal({ open, onClose, onSuccess }: CreateEventModalProps) {
  const [step, setStep] = useState<Step>("details");
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventId, setEventId] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [attendees, setAttendees] = useState<AttendeeRow[]>([]);
  const [error, setError] = useState<string | null>(null);

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
      setStep("uploading");
      
      const response = await fetch(`/api/events/${eventId}/attendees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendees: parsed }),
      });
      
      if (!response.ok) throw new Error("Failed to upload attendees");
      
      setStep("success");
      setTimeout(() => {
        onSuccess();
        handleReset();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process file");
      setStep("error");
    }
  }, [parseCSV, eventId, onSuccess]);

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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === "details" && "Create New Event"}
            {step === "attendees" && "Upload Attendees"}
            {step === "uploading" && "Processing..."}
            {step === "success" && "Event Created"}
            {step === "error" && "Error"}
          </DialogTitle>
          <DialogDescription>
            {step === "details" && "Enter the event details to get started."}
            {step === "attendees" && "Upload a CSV with attendee information."}
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
