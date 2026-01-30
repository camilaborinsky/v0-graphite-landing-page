import Link from "next/link"
import { Button } from "@/components/ui/button"

export function CTASection() {
  return (
    <section className="bg-[#1A1A2E] py-20 md:py-28">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[#FAFAFA] sm:text-4xl mb-4">
            Stop hoping for serendipity.
          </h2>
          <p className="max-w-[500px] text-lg text-[#A0A0A0] mb-8">
            Walk into your next event with a plan.
          </p>
          <Button asChild className="bg-[#FAFAFA] text-[#1A1A2E] hover:bg-[#E5E5E5] px-8 py-6 text-base font-medium">
            <Link href="/login">Log in</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
