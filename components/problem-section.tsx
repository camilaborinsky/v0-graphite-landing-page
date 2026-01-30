import { Clock, Shuffle, Target } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const problems = [
  {
    icon: Clock,
    title: "Hours of research",
    description: "You spend hours LinkedIn-stalking attendees before every event.",
  },
  {
    icon: Shuffle,
    title: "Missed connections",
    description: "You find out *after* the event that the perfect intro was standing right next to you.",
  },
  {
    icon: Target,
    title: "No prioritization",
    description: "200 attendees, 2 hours — who do you actually talk to?",
  },
]

export function ProblemSection() {
  return (
    <section className="bg-[#F5F5F5] py-20 md:py-28">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center text-center mb-12 md:mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-[#1A1A2E] sm:text-4xl">
            The problem with events
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3 md:gap-8">
          {problems.map((problem) => (
            <Card key={problem.title} className="bg-[#FAFAFA] border-[#E5E5E5] shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="flex flex-col items-center text-center p-8">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#F5F5F5]">
                  <problem.icon className="h-7 w-7 text-[#1A1A2E]" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-[#1A1A2E]">{problem.title}</h3>
                <p className="text-[#555555]">{problem.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
