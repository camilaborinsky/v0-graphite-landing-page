"use client"

import { useEffect, useRef } from "react"

interface Node {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  type: "person" | "company"
  highlighted: boolean
}

interface Edge {
  from: number
  to: number
}

export function NetworkGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const nodesRef = useRef<Node[]>([])
  const edgesRef = useRef<Edge[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Initialize nodes
    const nodeCount = 18
    const nodes: Node[] = []
    const rect = canvas.getBoundingClientRect()

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: i < 5 ? 8 : 5,
        type: i < 5 ? "company" : "person",
        highlighted: i < 3,
      })
    }
    nodesRef.current = nodes

    // Initialize edges
    const edges: Edge[] = []
    for (let i = 0; i < nodeCount; i++) {
      const connectionCount = Math.floor(Math.random() * 2) + 1
      for (let j = 0; j < connectionCount; j++) {
        const target = Math.floor(Math.random() * nodeCount)
        if (target !== i) {
          edges.push({ from: i, to: target })
        }
      }
    }
    edgesRef.current = edges

    const animate = () => {
      const rect = canvas.getBoundingClientRect()
      ctx.clearRect(0, 0, rect.width, rect.height)

      // Update positions
      for (const node of nodes) {
        node.x += node.vx
        node.y += node.vy

        // Bounce off walls
        if (node.x < node.radius || node.x > rect.width - node.radius) {
          node.vx *= -1
        }
        if (node.y < node.radius || node.y > rect.height - node.radius) {
          node.vy *= -1
        }

        // Keep within bounds
        node.x = Math.max(node.radius, Math.min(rect.width - node.radius, node.x))
        node.y = Math.max(node.radius, Math.min(rect.height - node.radius, node.y))
      }

      // Draw edges
      ctx.strokeStyle = "#E5E5E5"
      ctx.lineWidth = 1
      for (const edge of edges) {
        const from = nodes[edge.from]
        const to = nodes[edge.to]
        ctx.beginPath()
        ctx.moveTo(from.x, from.y)
        ctx.lineTo(to.x, to.y)
        ctx.stroke()
      }

      // Draw highlighted edges
      ctx.strokeStyle = "#3B82F6"
      ctx.lineWidth = 1.5
      for (const edge of edges) {
        const from = nodes[edge.from]
        const to = nodes[edge.to]
        if (from.highlighted && to.highlighted) {
          ctx.beginPath()
          ctx.moveTo(from.x, from.y)
          ctx.lineTo(to.x, to.y)
          ctx.stroke()
        }
      }

      // Draw nodes
      for (const node of nodes) {
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)

        if (node.highlighted) {
          ctx.fillStyle = "#3B82F6"
        } else if (node.type === "company") {
          ctx.fillStyle = "#1A1A2E"
        } else {
          ctx.fillStyle = "#9CA3AF"
        }

        ctx.fill()
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationRef.current)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: "block" }}
    />
  )
}
