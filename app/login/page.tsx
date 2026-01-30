"use client";

import React from "react"

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const result = login(username, password);
    
    if (result.success) {
      router.push("/dashboard");
    } else {
      setError(result.error || "Login failed");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-neutral-200 shadow-sm">
        <CardHeader className="text-center pb-2">
          <Link href="/" className="inline-block">
            <h1 className="text-2xl font-semibold text-[#1A1A2E] tracking-tight">
              Graphite
            </h1>
          </Link>
          <p className="text-sm text-neutral-500 mt-1">
            Sign in to access your network insights
          </p>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-neutral-700">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="border-neutral-200 focus:border-[#3B82F6] focus:ring-[#3B82F6]"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-neutral-700">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="border-neutral-200 focus:border-[#3B82F6] focus:ring-[#3B82F6]"
                required
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#1A1A2E] hover:bg-[#2A2A3E] text-white"
            >
              {isSubmitting ? "Signing in..." : "Log in"}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-neutral-100">
            <p className="text-xs text-neutral-400 text-center">
              Demo accounts: sarah, marcus, or elena (password: demo123)
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link
              href="/"
              className="text-sm text-[#3B82F6] hover:underline"
            >
              Back to home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
