"use client";

import React from "react"

import { useEffect, useRef, useCallback, useState } from "react";
import type { GraphData, GraphNode, GraphLink } from "@/lib/types";

interface ForceGraphProps {
  data: GraphData;
  onNodeClick?: (node: GraphNode) => void;
  highlightedNodeId?: string | null;
  searchQuery?: string;
}

interface SimNode extends GraphNode {
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

interface SimLink extends GraphLink {
  source: SimNode | string;
  target: SimNode | string;
}

export function ForceGraph({ data, onNodeClick, highlightedNodeId, searchQuery }: ForceGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [hoveredNode, setHoveredNode] = useState<SimNode | null>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const nodesRef = useRef<SimNode[]>([]);
  const linksRef = useRef<SimLink[]>([]);
  const dragNodeRef = useRef<SimNode | null>(null);
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number>();

  // Initialize nodes and links
  useEffect(() => {
    nodesRef.current = data.nodes.map((node) => ({
      ...node,
      x: Math.random() * dimensions.width,
      y: Math.random() * dimensions.height,
      vx: 0,
      vy: 0,
    }));

    linksRef.current = data.links.map((link) => ({
      ...link,
      source: nodesRef.current.find((n) => n.id === link.source) || link.source,
      target: nodesRef.current.find((n) => n.id === link.target) || link.target,
    }));
  }, [data, dimensions]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Force simulation
  const simulate = useCallback(() => {
    const nodes = nodesRef.current;
    const links = linksRef.current;
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;

    // Apply forces
    for (const node of nodes) {
      if (node.fx !== null && node.fx !== undefined) continue;

      // Center gravity
      node.vx = (node.vx || 0) + (centerX - (node.x || 0)) * 0.001;
      node.vy = (node.vy || 0) + (centerY - (node.y || 0)) * 0.001;

      // Stronger pull for target companies
      if (node.type === "company" && node.isTarget) {
        node.vx = (node.vx || 0) + (centerX - (node.x || 0)) * 0.005;
        node.vy = (node.vy || 0) + (centerY - (node.y || 0)) * 0.005;
      }

      // Repulsion between nodes
      for (const other of nodes) {
        if (node === other) continue;
        const dx = (node.x || 0) - (other.x || 0);
        const dy = (node.y || 0) - (other.y || 0);
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = 500 / (dist * dist);
        node.vx = (node.vx || 0) + (dx / dist) * force;
        node.vy = (node.vy || 0) + (dy / dist) * force;
      }
    }

    // Link forces
    for (const link of links) {
      const source = link.source as SimNode;
      const target = link.target as SimNode;
      if (!source.x || !target.x) continue;

      const dx = target.x - source.x;
      const dy = (target.y || 0) - (source.y || 0);
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const targetDist = 100;
      const force = (dist - targetDist) * 0.01;

      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;

      if (source.fx === null || source.fx === undefined) {
        source.vx = (source.vx || 0) + fx;
        source.vy = (source.vy || 0) + fy;
      }
      if (target.fx === null || target.fx === undefined) {
        target.vx = (target.vx || 0) - fx;
        target.vy = (target.vy || 0) - fy;
      }
    }

    // Apply velocity with damping
    for (const node of nodes) {
      if (node.fx !== null && node.fx !== undefined) {
        node.x = node.fx;
        node.y = node.fy || 0;
      } else {
        node.vx = (node.vx || 0) * 0.9;
        node.vy = (node.vy || 0) * 0.9;
        node.x = (node.x || 0) + (node.vx || 0);
        node.y = (node.y || 0) + (node.vy || 0);
      }
    }
  }, [dimensions]);

  // Draw function
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, dimensions.width, dimensions.height);
    ctx.save();
    ctx.translate(transform.x + dimensions.width / 2, transform.y + dimensions.height / 2);
    ctx.scale(transform.scale, transform.scale);
    ctx.translate(-dimensions.width / 2, -dimensions.height / 2);

    const nodes = nodesRef.current;
    const links = linksRef.current;

    // Draw links
    for (const link of links) {
      const source = link.source as SimNode;
      const target = link.target as SimNode;
      if (!source.x || !target.x) continue;

      ctx.beginPath();
      ctx.moveTo(source.x, source.y || 0);
      ctx.lineTo(target.x, target.y || 0);

      if (link.type === "WORKS_AT") {
        ctx.strokeStyle = "#94a3b8";
        ctx.setLineDash([]);
        ctx.lineWidth = 1.5;
      } else if (link.type === "WORKED_AT") {
        ctx.strokeStyle = "#cbd5e1";
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1;
      } else {
        ctx.strokeStyle = "#e2e8f0";
        ctx.setLineDash([2, 2]);
        ctx.lineWidth = 0.5;
      }

      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw nodes
    for (const node of nodes) {
      if (!node.x) continue;
      const x = node.x;
      const y = node.y || 0;

      const isHighlighted = node.id === highlightedNodeId;
      const isHovered = node === hoveredNode;
      const matchesSearch = searchQuery && node.name.toLowerCase().includes(searchQuery.toLowerCase());

      let radius = node.type === "person" ? 12 : 16;
      if (isHighlighted || isHovered || matchesSearch) radius += 4;

      ctx.beginPath();

      if (node.type === "person") {
        // Circle for people
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = isHighlighted || matchesSearch ? "#2563eb" : "#3B82F6";
      } else {
        // Rounded rectangle for companies
        const size = radius * 1.5;
        const r = 4;
        ctx.roundRect(x - size / 2, y - size / 2, size, size, r);
        ctx.fillStyle = node.isTarget
          ? isHighlighted || matchesSearch
            ? "#059669"
            : "#10B981"
          : "#6B7280";
      }

      if (isHighlighted || isHovered) {
        ctx.shadowColor = node.type === "person" ? "#3B82F6" : node.isTarget ? "#10B981" : "#6B7280";
        ctx.shadowBlur = 15;
      }

      ctx.fill();
      ctx.shadowBlur = 0;

      // Node label
      ctx.fillStyle = "#1A1A2E";
      ctx.font = isHighlighted || isHovered ? "bold 11px Inter, sans-serif" : "10px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(node.name, x, y + radius + 14);
    }

    ctx.restore();
  }, [dimensions, transform, hoveredNode, highlightedNodeId, searchQuery]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      simulate();
      draw();
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [simulate, draw]);

  // Get node at position
  const getNodeAtPosition = useCallback(
    (clientX: number, clientY: number): SimNode | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      const rect = canvas.getBoundingClientRect();
      const x = (clientX - rect.left - transform.x - dimensions.width / 2) / transform.scale + dimensions.width / 2;
      const y = (clientY - rect.top - transform.y - dimensions.height / 2) / transform.scale + dimensions.height / 2;

      for (const node of nodesRef.current) {
        if (!node.x) continue;
        const dx = x - node.x;
        const dy = y - (node.y || 0);
        const dist = Math.sqrt(dx * dx + dy * dy);
        const radius = node.type === "person" ? 16 : 20;
        if (dist < radius) return node;
      }
      return null;
    },
    [transform, dimensions]
  );

  // Mouse handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const node = getNodeAtPosition(e.clientX, e.clientY);
      if (node) {
        dragNodeRef.current = node;
        node.fx = node.x;
        node.fy = node.y;
      } else {
        isDraggingRef.current = true;
      }
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
    },
    [getNodeAtPosition]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const dx = e.clientX - lastMouseRef.current.x;
      const dy = e.clientY - lastMouseRef.current.y;

      if (dragNodeRef.current) {
        dragNodeRef.current.fx = (dragNodeRef.current.fx || 0) + dx / transform.scale;
        dragNodeRef.current.fy = (dragNodeRef.current.fy || 0) + dy / transform.scale;
      } else if (isDraggingRef.current) {
        setTransform((t) => ({ ...t, x: t.x + dx, y: t.y + dy }));
      } else {
        const node = getNodeAtPosition(e.clientX, e.clientY);
        setHoveredNode(node);
        if (canvasRef.current) {
          canvasRef.current.style.cursor = node ? "pointer" : "grab";
        }
      }

      lastMouseRef.current = { x: e.clientX, y: e.clientY };
    },
    [transform.scale, getNodeAtPosition]
  );

  const handleMouseUp = useCallback(() => {
    if (dragNodeRef.current) {
      dragNodeRef.current.fx = null;
      dragNodeRef.current.fy = null;
      dragNodeRef.current = null;
    }
    isDraggingRef.current = false;
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      const node = getNodeAtPosition(e.clientX, e.clientY);
      if (node && onNodeClick) {
        onNodeClick(node);
      }
    },
    [getNodeAtPosition, onNodeClick]
  );

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform((t) => ({
      ...t,
      scale: Math.min(Math.max(t.scale * scaleFactor, 0.2), 3),
    }));
  }, []);

  // Center on highlighted node
  useEffect(() => {
    if (highlightedNodeId) {
      const node = nodesRef.current.find((n) => n.id === highlightedNodeId);
      if (node && node.x) {
        setTransform((t) => ({
          ...t,
          x: dimensions.width / 2 - node.x! * t.scale,
          y: dimensions.height / 2 - (node.y || 0) * t.scale,
        }));
      }
    }
  }, [highlightedNodeId, dimensions]);

  return (
    <div ref={containerRef} className="w-full h-full relative bg-[#FAFAFA] rounded-lg overflow-hidden">
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick}
        onWheel={handleWheel}
        className="cursor-grab"
      />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 text-xs space-y-2 border border-neutral-200">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#3B82F6]" />
          <span className="text-neutral-600">Person</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-[#6B7280]" />
          <span className="text-neutral-600">Company</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-[#10B981]" />
          <span className="text-neutral-600">Target Company</span>
        </div>
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-1">
        <button
          onClick={() => setTransform((t) => ({ ...t, scale: Math.min(t.scale * 1.2, 3) }))}
          className="w-8 h-8 bg-white rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-50"
        >
          +
        </button>
        <button
          onClick={() => setTransform((t) => ({ ...t, scale: Math.max(t.scale * 0.8, 0.2) }))}
          className="w-8 h-8 bg-white rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-50"
        >
          -
        </button>
        <button
          onClick={() => setTransform({ x: 0, y: 0, scale: 1 })}
          className="w-8 h-8 bg-white rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 text-xs"
        >
          R
        </button>
      </div>

      {/* Tooltip */}
      {hoveredNode && (
        <div
          className="absolute pointer-events-none bg-white rounded-lg shadow-lg border border-neutral-200 px-3 py-2 text-sm"
          style={{
            left: lastMouseRef.current.x - (containerRef.current?.getBoundingClientRect().left || 0) + 10,
            top: lastMouseRef.current.y - (containerRef.current?.getBoundingClientRect().top || 0) + 10,
          }}
        >
          <p className="font-medium text-[#1A1A2E]">{hoveredNode.name}</p>
          {hoveredNode.type === "person" && hoveredNode.title && (
            <p className="text-neutral-500 text-xs">{hoveredNode.title}</p>
          )}
          {hoveredNode.type === "company" && hoveredNode.isTarget && (
            <p className="text-[#10B981] text-xs font-medium">Target Company</p>
          )}
        </div>
      )}
    </div>
  );
}
