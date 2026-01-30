import { Upload, Search, Sparkles } from "lucide-react"

const steps = [
  {
    icon: Upload,
    title: "Import your event",
    description: "Drop a guest list from Luma, Eventbrite, or CSV.",
  },
  {
    icon: Search,
    title: "We map the network",
    description: "Graphite enriches every attendee with work history, connections, and company affiliations.",
  },
  {
    icon: Sparkles,
    title: "Get your briefing",
    description: "See exactly who to meet and why they matter to your portfolio.",
  },
]

export function SolutionSection() {
  return (
    <section className="bg-[#FAFAFA] py-20 md:py-28">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center text-center mb-12 md:mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-[#1A1A2E] sm:text-4xl">
            How Graphite works
          </h2>
        </div>
        <div className="relative">
          {/* Connecting line - hidden on mobile */}
          <div className="absolute top-12 left-[16.67%] right-[16.67%] h-0.5 bg-[#E5E5E5] hidden md:block" />
          
          <div className="grid gap-8 md:grid-cols-3 md:gap-12">
            {steps.map((step, index) => (
              <div key={step.title} className="relative flex flex-col items-center text-center">
                <div className="relative z-10 mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#FAFAFA] border-2 border-[#E5E5E5]">
                  <step.icon className="h-10 w-10 text-[#3B82F6]" />
                </div>
                <span className="mb-2 text-sm font-medium text-[#3B82F6]">Step {index + 1}</span>
                <h3 className="mb-3 text-xl font-semibold text-[#1A1A2E]">{step.title}</h3>
                <p className="max-w-[280px] text-[#555555]">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
