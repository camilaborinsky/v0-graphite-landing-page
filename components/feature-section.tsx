"use client"

import { useEffect, useRef } from "react"

function DashboardMockup() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const width = rect.width
    const height = rect.height

    // Node data for dashboard visualization
    const nodes = [
      { x: width * 0.5, y: height * 0.35, r: 16, label: "Target Co", type: "target", highlighted: true },
      { x: width * 0.25, y: height * 0.25, r: 10, label: "Sarah K.", type: "person", highlighted: true },
      { x: width * 0.75, y: height * 0.25, r: 10, label: "Mike R.", type: "person", highlighted: true },
      { x: width * 0.35, y: height * 0.55, r: 10, label: "Lisa M.", type: "person", highlighted: false },
      { x: width * 0.65, y: height * 0.55, r: 10, label: "John D.", type: "person", highlighted: false },
      { x: width * 0.2, y: height * 0.5, r: 8, label: "", type: "company", highlighted: false },
      { x: width * 0.8, y: height * 0.5, r: 8, label: "", type: "company", highlighted: false },
      { x: width * 0.5, y: height * 0.7, r: 8, label: "", type: "person", highlighted: false },
      { x: width * 0.15, y: height * 0.35, r: 6, label: "", type: "person", highlighted: false },
      { x: width * 0.85, y: height * 0.35, r: 6, label: "", type: "person", highlighted: false },
    ]

    const edges = [
      [0, 1], [0, 2], [0, 3], [0, 4],
      [1, 5], [2, 6], [3, 7], [4, 7],
      [1, 8], [2, 9], [5, 8], [6, 9],
    ]

    let pulse = 0

    const draw = () => {
      ctx.clearRect(0, 0, width, height)

      // Draw edges
      for (const [fromIdx, toIdx] of edges) {
        const from = nodes[fromIdx]
        const to = nodes[toIdx]
        const isHighlighted = from.highlighted && to.highlighted

        ctx.beginPath()
        ctx.moveTo(from.x, from.y)
        ctx.lineTo(to.x, to.y)
        ctx.strokeStyle = isHighlighted ? "#3B82F6" : "#E5E5E5"
        ctx.lineWidth = isHighlighted ? 2 : 1
        ctx.stroke()
      }

      // Draw nodes
      for (const node of nodes) {
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2)

        if (node.type === "target") {
          ctx.fillStyle = "#3B82F6"
        } else if (node.highlighted) {
          const pulseOpacity = 0.3 + Math.sin(pulse) * 0.1
          ctx.fillStyle = `rgba(59, 130, 246, ${0.8 + pulseOpacity})`
        } else if (node.type === "company") {
          ctx.fillStyle = "#1A1A2E"
        } else {
          ctx.fillStyle = "#9CA3AF"
        }

        ctx.fill()

        // Draw labels
        if (node.label) {
          ctx.fillStyle = "#1A1A2E"
          ctx.font = "11px Inter, sans-serif"
          ctx.textAlign = "center"
          ctx.fillText(node.label, node.x, node.y + node.r + 14)
        }
      }

      pulse += 0.03
      animationRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animationRef.current)
    }
  }, [])

  return (
    <div className="relative w-full rounded-lg border border-[#E5E5E5] bg-[#FAFAFA] shadow-lg overflow-hidden">
      {/* Mock header */}
      <div className="flex items-center gap-2 border-b border-[#E5E5E5] bg-[#F5F5F5] px-4 py-3">
        <div className="h-3 w-3 rounded-full bg-[#E5E5E5]" />
        <div className="h-3 w-3 rounded-full bg-[#E5E5E5]" />
        <div className="h-3 w-3 rounded-full bg-[#E5E5E5]" />
        <span className="ml-4 text-xs text-[#888888]">Network View — TechCrunch Disrupt 2026</span>
      </div>
      {/* Canvas */}
      <div className="h-[280px] md:h-[320px]">
        <canvas ref={canvasRef} className="w-full h-full" style={{ display: "block" }} />
      </div>
      {/* Mock sidebar hint */}
      <div className="absolute right-4 top-16 w-40 rounded-md border border-[#E5E5E5] bg-[#FAFAFA] p-3 shadow-md">
        <div className="text-xs font-semibold text-[#3B82F6] mb-1">Priority Contact</div>
        <div className="text-sm font-medium text-[#1A1A2E]">Sarah K.</div>
        <div className="text-xs text-[#888888] mt-1">Ex-CTO at Target Co</div>
        <div className="text-xs text-[#888888]">2nd connection via Mike R.</div>
      </div>
    </div>
  )
}

export function FeatureSection() {
  return (
    <section className="bg-[#F5F5F5] py-20 md:py-28">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          <div className="order-2 lg:order-1">
            <DashboardMockup />
          </div>
          <div className="order-1 lg:order-2 flex flex-col justify-center">
            <span className="mb-3 text-sm font-medium text-[#3B82F6] uppercase tracking-wide">
              Personalized insights
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-[#1A1A2E] sm:text-4xl mb-6">
              Your portfolio. Your targets. Your briefing.
            </h2>
            <p className="text-lg text-[#555555] leading-relaxed">
              Graphite knows the companies you care about. When you attend an event, it surfaces the people with direct and indirect connections to your investment thesis — former employees, co-founders, advisors, and friends-of-friends.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
