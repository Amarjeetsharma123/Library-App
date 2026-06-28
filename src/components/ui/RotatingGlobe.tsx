'use client';

import React, { useEffect, useRef, useState } from 'react';

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface Node3D extends Point3D {
  label: string;
  size: number;
  color: string;
}

interface Connection {
  from: number;
  to: number;
  progress: number;
  speed: number;
}

interface GlobeDot {
  x: number;
  y: number;
  z: number;
  isCityLight: boolean;
  brightness: number;
}

// Bounding circles to approximate the Earth's continents mathematically
const LAND_CIRCLES = [
  { lat: 0.6, lon: 1.6, r: 0.85 },    // Asia (Large)
  { lat: 0.9, lon: 0.3, r: 0.5 },     // Europe
  { lat: 0.2, lon: 1.6, r: 0.35 },    // India / SE Asia
  { lat: 0.0, lon: 0.4, r: 0.7 },     // Africa
  { lat: 0.7, lon: -1.7, r: 0.75 },   // North America
  { lat: 1.2, lon: -0.7, r: 0.35 },   // Greenland
  { lat: -0.3, lon: -1.0, r: 0.6 },   // South America
  { lat: -0.45, lon: 2.3, r: 0.45 },  // Australia
  { lat: -1.4, lon: 0.0, r: 0.55 },   // Antarctica (Polar cap)
  { lat: 0.1, lon: 2.1, r: 0.3 },     // Indonesia / Islands
  { lat: 0.6, lon: 2.4, r: 0.2 },     // Japan
];

function isLand(lat: number, lon: number): boolean {
  let normLon = lon;
  while (normLon > Math.PI) normLon -= Math.PI * 2;
  while (normLon < -Math.PI) normLon += Math.PI * 2;

  for (const circle of LAND_CIRCLES) {
    let dLon = Math.abs(normLon - circle.lon);
    if (dLon > Math.PI) dLon = Math.PI * 2 - dLon;
    const dLat = lat - circle.lat;
    
    const dist = Math.sqrt(dLon * dLon + dLat * dLat);
    if (dist < circle.r) {
      return true;
    }
  }
  return false;
}

export default function RotatingGlobe() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Rotation angles matching user's image (slightly tilted)
  const angleX = useRef(0.35); // tilt angle
  const angleY = useRef(-1.0);  // Start rotated so India & Europe are front-and-center on load!
  const speedY = useRef(0.0018); // smooth slow rotation

  // Mouse drag interaction
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });

  // Pre-generated dots representing the Earth's continents and city lights
  const dots = useRef<GlobeDot[]>([]);

  // 3D Nodes representing library locations with mathematically accurate positions on continents
  const nodes = useRef<Node3D[]>([
    { x: -0.12, y: 0.63, z: 0.76, label: 'Portugal', size: 6, color: '#f97316' },             // Portugal
    { x: 0.85, y: 0.48, z: 0.19, label: 'India (Delhi Hub)', size: 7, color: '#f97316' },     // India (Delhi)
    { x: -0.73, y: 0.65, z: 0.21, label: 'New York Hub', size: 5, color: '#f97316' },         // US East Coast
    { x: -0.66, y: -0.40, z: 0.63, label: 'Brazil Depot', size: 4, color: '#f97316' },        // South America
    { x: 0.26, y: -0.56, z: 0.79, label: 'Cape Town Archives', size: 4, color: '#f97316' },   // South Africa
    { x: 0.53, y: 0.58, z: -0.62, label: 'Tokyo Node', size: 4, color: '#f97316' },           // Japan
    { x: 0.40, y: -0.56, z: -0.73, label: 'Sydney Branch', size: 4, color: '#f97316' },       // Australia
  ]);

  // Connections (communication lines) forming a global network loop
  const connections = useRef<Connection[]>([
    { from: 0, to: 2, progress: 0, speed: 0.005 },   // Portugal to India
    { from: 2, to: 5, progress: 0.2, speed: 0.004 },  // India to Tokyo
    { from: 5, to: 6, progress: 0.4, speed: 0.006 },  // Tokyo to Sydney
    { from: 6, to: 4, progress: 0.1, speed: 0.003 },  // Sydney to Cape Town
    { from: 4, to: 3, progress: 0.7, speed: 0.005 },  // Cape Town to Brazil
    { from: 3, to: 1, progress: 0.3, speed: 0.006 },  // Brazil to New York
    { from: 1, to: 0, progress: 0.8, speed: 0.005 },  // New York to Portugal
  ]);

  // Generate continent dots and city lights once on mount
  useEffect(() => {
    const tempDots: GlobeDot[] = [];
    const latSteps = 75; // high density
    const lonSteps = 150; // high density

    for (let i = 0; i < latSteps; i++) {
      const lat = -Math.PI / 2 + (Math.PI * i) / latSteps;
      const circumference = Math.cos(lat);
      const localLonSteps = Math.round(lonSteps * circumference);
      
      if (localLonSteps === 0) continue;

      for (let j = 0; j < localLonSteps; j++) {
        const lon = (Math.PI * 2 * j) / localLonSteps;
        
        if (isLand(lat, lon)) {
          const isNorthern = lat > 0;
          const cityProb = isNorthern ? 0.32 : 0.18;
          const isCity = Math.random() < cityProb;

          tempDots.push({
            x: Math.cos(lat) * Math.sin(lon),
            y: Math.sin(lat),
            z: Math.cos(lat) * Math.cos(lon),
            isCityLight: isCity,
            brightness: 0.4 + Math.random() * 0.6,
          });
        }
      }
    }
    dots.current = tempDots;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = 450; 
    let height = 450; 

    const resizeCanvas = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        width = Math.min(rect.width, 450); 
        height = width;
        canvas.width = width * window.devicePixelRatio;
        canvas.height = height * window.devicePixelRatio;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const rotateX = (point: Point3D, angle: number): Point3D => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      return {
        x: point.x,
        y: point.y * cos - point.z * sin,
        z: point.y * sin + point.z * cos,
      };
    };

    const rotateY = (point: Point3D, angle: number): Point3D => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      return {
        x: point.x * cos + point.z * sin,
        y: point.y,
        z: -point.x * sin + point.z * cos,
      };
    };

    const project = (point: Point3D, radius: number) => {
      const cx = width / 2;
      const cy = height / 2;
      return {
        x: cx + point.x * radius,
        y: cy + point.y * radius,
        depth: point.z,
      };
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const radius = width * 0.46; // scale globe to fill canvas
      const cx = width / 2;
      const cy = height / 2;

      // Rotate Y
      if (!isDragging.current) {
        angleY.current += speedY.current;
      }

      // 1. Red/Orange Atmosphere Backlight Glow (Matching user's reference image)
      const bgGlow = ctx.createRadialGradient(cx, cy, radius * 0.96, cx, cy, radius * 1.15);
      bgGlow.addColorStop(0, 'rgba(239, 68, 68, 0.16)'); // Reddish orange backlight
      bgGlow.addColorStop(0.4, 'rgba(249, 115, 22, 0.08)');
      bgGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = bgGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.15, 0, Math.PI * 2);
      ctx.fill();

      // 2. Base Dark Blue Oceans (Matching reference photo)
      ctx.fillStyle = '#050c1e'; // Deep space blue/black oceans
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      // 3. Draw Earth Continents & Glowing City Lights
      dots.current.forEach((dot) => {
        let p: Point3D = { x: dot.x, y: dot.y, z: dot.z };
        p = rotateY(p, angleY.current);
        p = rotateX(p, angleX.current);

        // Render dots only on front hemisphere
        if (p.z > 0) {
          const proj = project(p, radius);
          const edgeAlpha = Math.min(1, p.z * 1.8);
          
          if (dot.isCityLight) {
            // Draw Glowing Amber City Lights (Flickering effect)
            const flicker = 0.82 + Math.sin(Date.now() * 0.004 + dot.x * 120) * 0.18;
            ctx.fillStyle = `rgba(253, 186, 116, ${0.9 * edgeAlpha * dot.brightness * flicker})`;
            ctx.beginPath();
            ctx.arc(proj.x, proj.y, 0.8, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Draw Solid Dark Blue/Teal Continents (Tightly packed to overlap)
            ctx.fillStyle = `rgba(18, 38, 68, ${0.85 * edgeAlpha})`;
            ctx.beginPath();
            ctx.arc(proj.x, proj.y, 2.0, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });

      // Rotate and project all nodes
      const projectedNodes = nodes.current.map((node) => {
        let p: Point3D = { x: node.x, y: node.y, z: node.z };
        p = rotateY(p, angleY.current);
        p = rotateX(p, angleX.current);
        const proj = project(p, radius);
        return {
          ...node,
          projX: proj.x,
          projY: proj.y,
          projZ: proj.depth,
        };
      });

      // 4. Draw connection curves (Thin grey/silver communication lines)
      connections.current.forEach((conn) => {
        const fromNode = projectedNodes[conn.from];
        const toNode = projectedNodes[conn.to];

        conn.progress += conn.speed;
        if (conn.progress > 1) conn.progress = 0;

        const fromVisible = fromNode.projZ > -0.1;
        const toVisible = toNode.projZ > -0.1;

        if (fromVisible || toVisible) {
          const midX = (fromNode.projX + toNode.projX) / 2;
          const midY = (fromNode.projY + toNode.projY) / 2 - Math.abs(fromNode.projX - toNode.projX) * 0.22;

          ctx.beginPath();
          ctx.moveTo(fromNode.projX, fromNode.projY);
          ctx.quadraticCurveTo(midX, midY, toNode.projX, toNode.projY);
          ctx.lineWidth = 1;
          
          const avgDepth = (fromNode.projZ + toNode.projZ) / 2;
          const lineAlpha = avgDepth > 0 ? 0.25 : 0.08;
          ctx.strokeStyle = `rgba(229, 231, 235, ${lineAlpha})`; // Grey/silver curve
          ctx.stroke();

          // Data flow packet along connection
          const t = conn.progress;
          const px = (1 - t) * (1 - t) * fromNode.projX + 2 * (1 - t) * t * midX + t * t * toNode.projX;
          const py = (1 - t) * (1 - t) * fromNode.projY + 2 * (1 - t) * t * midY + t * t * toNode.projY;

          if (avgDepth > -0.05) {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(px, py, 1.8, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = 'rgba(251, 146, 60, 0.4)'; // orange glow
            ctx.beginPath();
            ctx.arc(px, py, 4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });

      // 5. Draw active hubs/targets (Target styling matching image)
      projectedNodes.forEach((node) => {
        if (node.projZ < 0) {
          // Render back nodes as subtle dim dots
          ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.beginPath();
          ctx.arc(node.projX, node.projY, 2.5, 0, Math.PI * 2);
          ctx.fill();
          return;
        }

        const isHovered = hoveredNode === node.label || node.label.includes('India') || node.label === 'Portugal';
        const scale = isHovered ? 1.4 : 1.0;

        // Concentric target rings (Orange/Amber)
        ctx.strokeStyle = 'rgba(249, 115, 22, 0.4)';
        ctx.lineWidth = 1.2;
        
        // Inner Ring
        ctx.beginPath();
        ctx.arc(node.projX, node.projY, node.size * 1.5 * scale, 0, Math.PI * 2);
        ctx.stroke();

        // Outer Ring
        ctx.strokeStyle = 'rgba(249, 115, 22, 0.2)';
        ctx.beginPath();
        ctx.arc(node.projX, node.projY, node.size * 3.0 * scale, 0, Math.PI * 2);
        ctx.stroke();

        // White core dot
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(node.projX, node.projY, 3, 0, Math.PI * 2);
        ctx.fill();

        // Label styled directly below node, matching image
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 4;
        ctx.fillText(node.label, node.projX, node.projY + node.size * 3.0 * scale + 10);
        
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
      });

      // 6. Ambient Shadow & 3D Shading sphere overlay (Creates day/night horizon style)
      const shading = ctx.createRadialGradient(
        cx - radius * 0.15,
        cy - radius * 0.3,
        radius * 0.55,
        cx,
        cy,
        radius
      );
      shading.addColorStop(0, 'rgba(255, 255, 255, 0.08)'); 
      shading.addColorStop(0.55, 'rgba(5, 12, 30, 0.05)');
      shading.addColorStop(0.85, 'rgba(5, 12, 30, 0.65)');
      shading.addColorStop(1, 'rgba(5, 12, 30, 0.95)'); 
      ctx.fillStyle = shading;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      // 7. Atmospheric Outer Rim Highlight
      const rim = ctx.createRadialGradient(cx, cy, radius * 0.95, cx, cy, radius * 1.03);
      rim.addColorStop(0, 'rgba(249, 115, 22, 0)');
      rim.addColorStop(0.5, 'rgba(249, 115, 22, 0.12)');
      rim.addColorStop(0.9, 'rgba(249, 115, 22, 0.22)');
      rim.addColorStop(1, 'rgba(249, 115, 22, 0)');
      ctx.fillStyle = rim;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.03, 0, Math.PI * 2);
      ctx.fill();

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [hoveredNode]);

  // Mouse interaction handling
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const radius = rect.width * 0.46;
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    if (isDragging.current) {
      const deltaX = e.clientX - previousMousePosition.current.x;
      const deltaY = e.clientY - previousMousePosition.current.y;
      angleY.current += deltaX * 0.004;
      angleX.current += deltaY * 0.004;
      angleX.current = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, angleX.current));
      
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
      return;
    }

    let nodeFound = null;
    const tempAngleY = angleY.current;
    const tempAngleX = angleX.current;

    const rotateXVal = (pt: Point3D, ang: number) => {
      const cos = Math.cos(ang);
      const sin = Math.sin(ang);
      return { x: pt.x, y: pt.y * cos - pt.z * sin, z: pt.y * sin + pt.z * cos };
    };

    const rotateYVal = (pt: Point3D, ang: number) => {
      const cos = Math.cos(ang);
      const sin = Math.sin(ang);
      return { x: pt.x * cos + pt.z * sin, y: pt.y, z: -pt.x * sin + pt.z * cos };
    };

    for (const node of nodes.current) {
      let p: Point3D = { x: node.x, y: node.y, z: node.z };
      p = rotateYVal(p, tempAngleY);
      p = rotateXVal(p, tempAngleX);

      if (p.z > 0) {
        const px = cx + p.x * radius;
        const py = cy + p.y * radius;
        const dist = Math.hypot(x - px, y - py);
        
        if (dist < 18) {
          nodeFound = node.label;
          break;
        }
      }
    }

    setHoveredNode(nodeFound);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDragging.current = true;
    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUpOrLeave = () => {
    isDragging.current = false;
  };

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center justify-center w-full max-w-[450px] mx-auto select-none group"
    >
      {/* Decorative Outer Rings */}
      <div className="absolute w-[108%] h-[108%] rounded-full border border-orange-500/5 animate-[spin_80s_linear_infinite] pointer-events-none" />
      <div className="absolute w-[116%] h-[116%] rounded-full border border-dashed border-orange-500/5 animate-[spin_150s_linear_infinite_reverse] pointer-events-none" />
      
      {/* 3D Canvas */}
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        className="cursor-grab active:cursor-grabbing relative z-10 filter drop-shadow-[0_0_25px_rgba(249,115,22,0.18)]"
      />
      
      {/* Interaction Help Overlay */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-950/80 border border-white/5 rounded-full px-4 py-1.5 text-[10px] text-slate-400 font-semibold tracking-wider uppercase z-20 backdrop-blur pointer-events-none transition-opacity opacity-0 group-hover:opacity-100 duration-300">
        Drag to rotate • Hover hubs
      </div>
    </div>
  );
}
