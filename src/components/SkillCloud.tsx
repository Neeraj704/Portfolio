"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import skillsData from "@/data/skills.json";

const allSkills = skillsData.skills.flatMap((c) => c.items);
const heroSkills = ["TypeScript", "React", "Next.js", "Node.js", "Flutter"];

interface Node {
  id: number;
  name: string;
  slug: string;
  isHero: boolean;
  baseX: number;
  baseY: number;
  x: number;
  y: number;
  floatOffsetX: number;
  floatOffsetY: number;
  floatSpeed: number;
  floatRadius: number;
  connections: number[];
  pillW?: number;
  pillH?: number;
}

export default function SkillCloud({ iconStyle = "colored" }: { iconStyle?: "colored" | "mono" }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const isDark = resolvedTheme === "dark";
    const ctx = canvas.getContext("2d")!;

    // Logo Preloading
    const logoImgs: Record<string, HTMLImageElement> = {};
    allSkills.forEach((skill) => {
      const img = new Image();
      img.crossOrigin = "anonymous";

      const s = skill as { slug: string; logoDark?: string; logoLight?: string };

      if (iconStyle === "mono") {
        // Monochrome mode: force white in dark, near-black in light
        img.src = `https://cdn.simpleicons.org/${s.slug}/${isDark ? "ffffff" : "111111"}`;
      } else if (isDark && s.logoDark) {
        // Colored mode: use manual dark override if this icon has one (e.g. Express, VS Code)
        img.src = s.logoDark;
      } else if (!isDark && s.logoLight) {
        // Colored mode: use manual light override if this icon has one
        img.src = s.logoLight;
      } else {
        // Colored mode default: brand color (no color in URL = SimpleIcons brand color)
        img.src = `https://cdn.simpleicons.org/${s.slug}`;
      }

      logoImgs[s.slug] = img;
    });

    let W = 0;
    let H = 0;
    let nodes: Node[] = [];

    const initNodes = () => {
      const N = allSkills.length;
      const cols = Math.ceil(Math.sqrt(N * (W / H)));
      const rows = Math.ceil(N / cols);
      const cellW = W / cols;
      const cellH = H / rows;

      nodes = allSkills.map((skill, i) => {
        return {
          id: i,
          name: skill.name,
          slug: skill.slug,
          isHero: heroSkills.includes(skill.name),
          baseX: (i % cols) * cellW + cellW / 2 + (Math.random() - 0.5) * cellW * 0.6,
          baseY: Math.floor(i / cols) * cellH + cellH / 2 + (Math.random() - 0.5) * cellH * 0.6,
          x: 0,
          y: 0,
          floatOffsetX: Math.random() * Math.PI * 2,
          floatOffsetY: Math.random() * Math.PI * 2,
          floatSpeed: 0.4 + Math.random() * 0.4,
          floatRadius: 6 + Math.random() * 8,
          connections: [],
        };
      });

      // Compute nearest neighbors
      nodes.forEach((node) => {
        const dist = (a: Node, b: Node) => Math.hypot(a.baseX - b.baseX, a.baseY - b.baseY);
        node.connections = nodes
          .filter((other) => other !== node)
          .sort((a, b) => dist(node, a) - dist(node, b))
          .slice(0, 3)
          .map((n) => n.id);
      });
    };

    const handleResize = () => {
      W = canvas.clientWidth;
      H = canvas.clientHeight;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.scale(dpr, dpr);

      initNodes();
    };

    // Initial sizing
    handleResize();

    const resizeObserver = new ResizeObserver(() => handleResize());
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    let mouse = { x: -1000, y: -1000 };
    let isMouseInCanvas = false;
    let hoveredNodeId: number | null = null;

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      isMouseInCanvas = true;
    };
    const onMouseLeave = () => {
      isMouseInCanvas = false;
      mouse.x = -1000;
      mouse.y = -1000;
      hoveredNodeId = null;
    };

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);

    const drawPill = (node: Node, isHovered: boolean) => {
      const padding = { x: 10, y: 6 };
      const logoSize = 14;
      const gap = 6;
      const fontSize = node.isHero ? 13 : 11;

      ctx.font = `${node.isHero ? "600" : "500"} ${fontSize}px Inter, sans-serif`;
      const textW = ctx.measureText(node.name).width;
      const pillW = logoSize + gap + textW + padding.x * 2;
      const pillH = Math.max(logoSize, fontSize) + padding.y * 2;

      node.pillW = pillW;
      node.pillH = pillH;

      const x0 = node.x - pillW / 2;
      const y0 = node.y - pillH / 2;
      const r = pillH / 2;

      // Fill
      ctx.fillStyle = isHovered
        ? isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)"
        : isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";

      // Border
      ctx.strokeStyle = isHovered
        ? isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)"
        : isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)";
      ctx.lineWidth = isHovered ? 1.5 : 1;

      // Rounded rect path
      ctx.beginPath();
      ctx.roundRect(x0, y0, pillW, pillH, r);
      ctx.fill();
      ctx.stroke();

      // Logo image
      const img = logoImgs[node.slug];
      if (img?.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, x0 + padding.x, node.y - logoSize / 2, logoSize, logoSize);
      }

      // Text
      ctx.fillStyle = isDark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.8)";
      ctx.fillText(node.name, x0 + padding.x + logoSize + gap, node.y + fontSize * 0.35);
    };

    let rafId: number;
    const loop = () => {
      ctx.clearRect(0, 0, W, H);

      const t = Date.now() / 1000;
      hoveredNodeId = null;

      // Update positions
      nodes.forEach((node) => {
        // Base float
        node.x = node.baseX + Math.sin(t * node.floatSpeed + node.floatOffsetX) * node.floatRadius;
        node.y = node.baseY + Math.cos(t * node.floatSpeed + node.floatOffsetY) * node.floatRadius;

        // Mouse repulsion
        if (isMouseInCanvas) {
          const dx = node.x - mouse.x;
          const dy = node.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const repelRadius = 100;
          const repelStrength = 40;

          if (dist < repelRadius && dist > 0) {
            const force = (repelRadius - dist) / repelRadius;
            node.x += (dx / dist) * force * repelStrength;
            node.y += (dy / dist) * force * repelStrength;
          }

          // Hover detection
          if (node.pillW && node.pillH) {
            if (
              Math.abs(mouse.x - node.x) < node.pillW / 2 &&
              Math.abs(mouse.y - node.y) < node.pillH / 2
            ) {
              hoveredNodeId = node.id;
            }
          }
        }
      });

      // Draw lines
      ctx.lineWidth = 1;
      nodes.forEach((node) => {
        node.connections.forEach((targetId) => {
          const target = nodes[targetId];
          const dx = target.x - node.x;
          const dy = target.y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const alpha = Math.max(0, 1 - dist / 250);

          if (alpha > 0) {
            ctx.strokeStyle = isDark
              ? `rgba(255,255,255,${alpha * 0.12})`
              : `rgba(0,0,0,${alpha * 0.08})`;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(target.x, target.y);
            ctx.stroke();
          }
        });
      });

      // Draw cursor connections
      if (isMouseInCanvas) {
        const sortedByDist = [...nodes]
          .sort((a, b) => Math.hypot(a.x - mouse.x, a.y - mouse.y) - Math.hypot(b.x - mouse.x, b.y - mouse.y))
          .slice(0, 3);

        sortedByDist.forEach((node) => {
          const dist = Math.hypot(node.x - mouse.x, node.y - mouse.y);
          const alpha = Math.max(0, 1 - dist / 250);
          if (alpha > 0) {
            ctx.strokeStyle = isDark
              ? `rgba(255,255,255,${alpha * 0.3})`
              : `rgba(0,0,0,${alpha * 0.2})`;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        });
      }

      // Draw nodes
      nodes.forEach((node) => {
        drawPill(node, hoveredNodeId === node.id);
      });

      // Change cursor on hover
      canvas.style.cursor = hoveredNodeId !== null ? "pointer" : "crosshair";

      rafId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [mounted, resolvedTheme, iconStyle]);

  if (!mounted) {
    return <div className="w-full h-[260px] sm:h-[380px] rounded-xl bg-muted/30 animate-pulse" />;
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      <canvas
        ref={canvasRef}
        className="w-full h-[260px] sm:h-[380px] rounded-xl outline-none"
        style={{ display: "block", cursor: "crosshair" }}
      />
      <p className="text-center text-xs text-muted-foreground -mt-2">
        move cursor to interact
      </p>
    </div>
  );
}
