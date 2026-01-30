import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full bg-[#FAFAFA]/80 backdrop-blur-sm border-b border-[#E5E5E5]">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center">
          <span className="text-xl font-bold text-[#1A1A2E]">Graphite</span>
        </Link>
        <Button variant="outline" asChild className="border-[#1A1A2E] text-[#1A1A2E] hover:bg-[#1A1A2E] hover:text-[#FAFAFA] bg-transparent">
          <Link href="/login">Log in</Link>
        </Button>
      </div>
    </header>
  )
}
