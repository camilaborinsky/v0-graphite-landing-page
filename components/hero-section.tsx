import Link from "next/link"
import { Button } from "@/components/ui/button"
import { NetworkGraph } from "@/components/network-graph"

export function HeroSection() {
  return (
    <section className="relative bg-[#FAFAFA] py-20 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          <div className="flex flex-col justify-center space-y-6">
            <h1 className="text-4xl font-bold tracking-tight text-[#1A1A2E] sm:text-5xl md:text-6xl text-balance">
              Know exactly who to talk to before you walk in the door.
            </h1>
            <p className="max-w-[600px] text-lg text-[#555555] md:text-xl text-pretty">
              Graphite maps the hidden connections between event attendees and your target companies — so you never miss a valuable conversation again.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button asChild className="bg-[#1A1A2E] text-[#FAFAFA] hover:bg-[#2A2A3E] px-8 py-6 text-base">
                <Link href="/login">Log in</Link>
              </Button>
            </div>
          </div>
          <div className="relative h-[300px] md:h-[400px] lg:h-[450px] rounded-lg overflow-hidden border border-[#E5E5E5] bg-[#FAFAFA]">
            <NetworkGraph />
          </div>
        </div>
      </div>
    </section>
  )
}
