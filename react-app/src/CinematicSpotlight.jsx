import React, { useRef, useEffect, useState } from 'react';
import { Renderer, Program, Triangle, Mesh } from 'ogl';
import './CinematicSpotlight.css';

const CinematicSpotlight = ({ className = '' }) => {
  const containerRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const overlayRef = useRef(null);
  const rendererRef = useRef(null);
  const uniformsRef = useRef(null);
  const animationIdRef = useRef(null);
  const cleanupFunctionRef = useRef(null);

  // Use refs for hover/mouse to avoid re-creating WebGL on state change
  const isHoveredRef = useRef(false);
  const mousePosRef = useRef({ x: 0.72, y: 0.32 });
  const currentPosRef = useRef({ x: 0.72, y: 0.32 });
  const textRef = useRef(null);
  const textBasePos = useRef(
    typeof window !== 'undefined' && window.innerWidth <= 991
      ? { x: 0.5, y: 0.72 }
      : { x: 0.72, y: 0.45 }
  );
  const startTimeRef = useRef(null);
  const hasInteractedRef = useRef(false);
  const currentIntensityRef = useRef(0);

  // Monitor visibility
  const [isVisible, setIsVisible] = useState(true);
  const observerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    observerRef.current = new IntersectionObserver(
      entries => {
        setIsVisible(entries[0].isIntersecting);
      },
      { threshold: 0.1 }
    );
    observerRef.current.observe(containerRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible || !canvasContainerRef.current) return;

    if (cleanupFunctionRef.current) {
      cleanupFunctionRef.current();
    }

    const initWebGL = async () => {
      if (!canvasContainerRef.current) return;

      await new Promise(resolve => setTimeout(resolve, 50));
      if (!canvasContainerRef.current) return;

      const renderer = new Renderer({
        dpr: Math.min(window.devicePixelRatio, 2),
        alpha: true
      });
      rendererRef.current = renderer;

      const gl = renderer.gl;
      gl.canvas.style.width = '100%';
      gl.canvas.style.height = '100%';

      while (canvasContainerRef.current.firstChild) {
        canvasContainerRef.current.removeChild(canvasContainerRef.current.firstChild);
      }
      canvasContainerRef.current.appendChild(gl.canvas);

      const vert = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

      const frag = `precision highp float;

uniform float iTime;
uniform vec2  iResolution;
uniform vec2  iSpotlight;
uniform float iIntensity;

varying vec2 vUv;

// === Noise functions ===
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

// 5-octave FBM for atmospheric fog
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  vec2 shift = vec2(100.0);
  mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
  for (int i = 0; i < 5; ++i) {
    v += a * noise(p);
    p = rot * p * 2.0 + shift;
    a *= 0.5;
  }
  return v;
}

// === Cone beam: clean trapezoid shape, widens from source to target ===
float volumetricCone(vec2 origin, vec2 dir, vec2 coord, float radiusStart, float radiusEnd, float targetDist) {
  vec2 toCoord = coord - origin;
  float dist = length(toCoord);
  if (dist < 0.001) return 1.0;
  if (dist > targetDist * 1.02) return 0.0;

  // Projection of point onto beam axis
  float along = dot(toCoord, dir);
  if (along < 0.0) return 0.0;

  // Perpendicular distance from beam axis
  vec2 perp = toCoord - dir * along;
  float perpDist = length(perp);

  // Beam radius at this point along the axis (linear interpolation)
  float t = clamp(along / targetDist, 0.0, 1.0);
  float beamRadius = mix(radiusStart, radiusEnd, t);

  // Hard edge with slight feather — clean cone, not spherical
  float edge = smoothstep(beamRadius * 1.05, beamRadius * 0.9, perpDist);

  // Smooth brightness falloff along beam length
  float lengthFalloff = clamp(t * 0.5 + 0.5, 0.0, 1.0);

  // Subtle flicker
  float flicker = 0.97 + 0.03 * sin(iTime * 5.7 + dist * 0.003);

  return edge * lengthFalloff * flicker;
}

// === Dust particles ===
float drawDust(vec2 coord, vec2 origin, vec2 dir, float beamRadius, float maxDist) {
  float dustGlow = 0.0;
  for (int i = 0; i < 50; i++) {
    float id = float(i);
    float rx = hash(vec2(id, 17.52));
    float ry = hash(vec2(id, 83.19));
    float spd = 0.15 + 0.85 * hash(vec2(id, 41.38));
    float sz = 0.6 + 3.0 * hash(vec2(id, 23.47));
    float brightness = 0.5 + 0.5 * hash(vec2(id, 61.73));

    vec2 p = vec2(rx, ry) * iResolution.xy;
    p.x += sin(iTime * spd * 0.7 + id * 1.3) * 40.0;
    p.y += cos(iTime * spd * 0.5 + id * 0.9) * 25.0;
    p.y -= iTime * 12.0 * spd;

    p.x = mod(p.x, iResolution.x);
    p.y = mod(p.y, iResolution.y);

    vec2 toP = p - origin;
    float dist = length(toP);
    float along = dot(toP, dir);
    float t = clamp(along / maxDist, 0.0, 1.0);
    float r = mix(beamRadius * 0.05, beamRadius, t);
    vec2 perp = toP - dir * along;
    float perpDist = length(perp);
    float inside = smoothstep(r * 1.1, r * 0.9, perpDist);
    float fOff = clamp((maxDist - dist) / maxDist, 0.0, 1.0);
    inside *= fOff;

    if (inside > 0.03) {
      float distPx = length(coord - p);
      float glow = exp(-distPx / (sz * 1.3)) * inside * brightness * 2.0;
      glow *= 0.7 + 0.3 * sin(iTime * 4.0 * spd + id * 7.0);
      dustGlow += glow;
    }
  }
  return dustGlow;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 coord = vec2(fragCoord.x, iResolution.y - fragCoord.y);

  // Light source: bottom-right, outside viewport
  vec2 rayPos = vec2(iResolution.x * 1.05, iResolution.y * 1.12);
  vec2 targetPos = iSpotlight * iResolution.xy;
  vec2 rayDir = normalize(targetPos - rayPos);

  // Screen aspect ratio — smaller circle/beam on mobile
  float aspect = iResolution.x / iResolution.y;

  // Beam radii in pixels — narrow at source, wide at target (matches circle)
  float radiusStart = iResolution.y * 0.02;
  float spotRadius = aspect < 1.0 ? iResolution.y * 0.22 : iResolution.y * 0.38;
  float radiusEnd = spotRadius;

  // Distance from light source to target — beam ends exactly at the circle
  float targetDist = length(targetPos - rayPos);

  // Primary cone beam — clean trapezoid, widens to circle
  float beam = volumetricCone(rayPos, rayDir, coord, radiusStart, radiusEnd, targetDist);

  // Dust particles
  float dust = drawDust(coord, rayPos, rayDir, radiusEnd, targetDist);

  // Color: warm white with slight golden tint
  vec3 beamColor = vec3(1.0, 0.96, 0.88);
  vec3 coreColor = vec3(1.0, 0.98, 0.95);

  float coreIntensity = pow(beam, 2.0);
  vec3 lightColor = mix(beamColor, coreColor, coreIntensity) * (beam + dust * 0.15);

  // Apply ignition intensity
  lightColor *= iIntensity;

  // Very dark background
  vec2 uv = fragCoord.xy / iResolution.xy;
  vec3 bgColor = vec3(0.018, 0.018, 0.022) * (1.0 - uv.y * 0.35);

  vec3 finalColor = bgColor + lightColor;

  // Flat circular disk at beam target — no sphere shading
  float distToTarget = length(coord - targetPos);
  float spotFalloff = distToTarget / spotRadius;

  // Clean disk edge with soft feathering
  float spotDisk = 1.0 - smoothstep(0.88, 1.0, spotFalloff);

  // Even brightness across disk, slight hot center
  float spotCenter = (1.0 - smoothstep(0.0, 0.5, spotFalloff)) * 0.3;
  float spotGlow = exp(-spotFalloff * 3.0) * 0.2;

  // Subtle flicker for realism
  float spotFlicker = 0.93 + 0.07 * sin(iTime * 7.3) + 0.04 * sin(iTime * 3.7);

  float spotHit = (spotDisk * 0.8 + spotCenter + spotGlow) * spotFlicker * iIntensity;
  finalColor += beamColor * spotHit * 1.1;

  // Vignette
  float vignette = uv.x * uv.y * (1.0 - uv.x) * (1.0 - uv.y);
  vignette = clamp(pow(16.0 * vignette, 0.25), 0.0, 1.0);
  finalColor *= vignette;

  // Subtle chromatic aberration at beam edges
  float chromaShift = beam * 0.03 * (1.0 - beam);
  finalColor.r += chromaShift * 0.5;
  finalColor.b -= chromaShift * 0.3;

  fragColor = vec4(finalColor, 1.0);
}

void main() {
  vec4 color;
  mainImage(color, gl_FragCoord.xy);
  gl_FragColor = color;
}`;

      const uniforms = {
        iTime: { value: 0 },
        iResolution: { value: [1, 1] },
        iSpotlight: { value: [0.72, 0.32] },
        iIntensity: { value: 0 }
      };
      uniformsRef.current = uniforms;

      const geometry = new Triangle(gl);
      const program = new Program(gl, {
        vertex: vert,
        fragment: frag,
        uniforms
      });
      const mesh = new Mesh(gl, { geometry, program });

      const handleResize = () => {
        if (!canvasContainerRef.current || !renderer) return;
        renderer.dpr = Math.min(window.devicePixelRatio, 2);
        const { clientWidth, clientHeight } = canvasContainerRef.current;
        renderer.setSize(clientWidth, clientHeight);
        uniforms.iResolution.value = [clientWidth * renderer.dpr, clientHeight * renderer.dpr];

        // Measure text position relative to container
        if (textRef.current && containerRef.current) {
          const textRect = textRef.current.getBoundingClientRect();
          const containerRect = containerRef.current.getBoundingClientRect();
          if (textRect.width > 0 && textRect.height > 0) {
            textBasePos.current = {
              x: (textRect.left + textRect.width * 0.5 - containerRect.left) / containerRect.width,
              y: (textRect.top + textRect.height * 0.5 - containerRect.top) / containerRect.height
            };
          }
        }
      };

      window.addEventListener('resize', handleResize);
      handleResize();



      const animLoop = time => {
        if (!rendererRef.current || !uniformsRef.current) return;

        uniforms.iTime.value = time * 0.001;

        if (!startTimeRef.current) {
          startTimeRef.current = time;
        }

        const elapsed = time - startTimeRef.current;

        // Phase 1: Ignition flicker (0–1.2s) — beam struggles to light up like a real searchlight
        // Phase 2: Scanning search (1.2s–7s) — beam sweeps to find A1
        // Phase 3: Locked on target (7s+) — steady beam with live micro-jitter on A1
        const igniteDuration = 1200;
        const scanDuration = 7000;

        let intensity;
        let targetX, targetY;

        if (isHoveredRef.current) {
          // User interaction — full power, follow mouse
          intensity = 1.0;
          targetX = mousePosRef.current.x;
          targetY = mousePosRef.current.y;
          hasInteractedRef.current = true;
        } else if (elapsed < igniteDuration && !hasInteractedRef.current) {
          // === Ignition: flickering attempts to start ===
          const p = elapsed / igniteDuration;
          // Multiple flicker bursts building up to full intensity
          const flickerBase = p * p * (3.0 - 2.0 * p); // smooth ease-in
          const flickerNoise =
            0.35 * Math.sin(elapsed * 0.04) * Math.sin(elapsed * 0.027) +
            0.25 * Math.sin(elapsed * 0.07) +
            0.15 * (Math.random() - 0.5);
          // Random sputters — sometimes almost dies
          const sputter = elapsed < 700 ? (Math.random() > 0.6 ? 0.8 : 0.1) : 1.0;
          intensity = Math.max(0, Math.min(1, flickerBase + flickerNoise * (1 - p) * sputter));
          // Beam starts pointing roughly at target area
          targetX = textBasePos.current.x + 0.08 * Math.sin(elapsed * 0.005);
          targetY = textBasePos.current.y + 0.05 * Math.cos(elapsed * 0.004);
        } else if (elapsed < scanDuration && !hasInteractedRef.current) {
          // === Scanning search: sweeping to find A1 ===
          intensity = 0.92 + 0.08 * Math.sin(elapsed * 0.008); // gentle pulsing
          const progress = (elapsed - igniteDuration) / (scanDuration - igniteDuration);
          const amp = 1.0 - progress;
          targetX = textBasePos.current.x + 0.4 * Math.sin(time * 0.0016) * amp;
          targetY = textBasePos.current.y + 0.2 * Math.cos(time * 0.0011) * amp;
        } else {
          // === Locked on target: living micro-jitter ===
          intensity = 0.95 + 0.05 * Math.sin(time * 0.002) + 0.02 * Math.sin(time * 0.007);
          targetX = textBasePos.current.x + 0.006 * Math.sin(time * 0.001);
          targetY = textBasePos.current.y + 0.004 * Math.cos(time * 0.0007);
        }

        // Smooth intensity
        if (!currentIntensityRef.current) currentIntensityRef.current = 0;
        currentIntensityRef.current += (intensity - currentIntensityRef.current) * 0.15;
        uniforms.iIntensity.value = currentIntensityRef.current;

        // Smooth interpolation with inertia
        currentPosRef.current.x += (targetX - currentPosRef.current.x) * 0.03;
        currentPosRef.current.y += (targetY - currentPosRef.current.y) * 0.03;

        uniforms.iSpotlight.value = [currentPosRef.current.x, currentPosRef.current.y];

        // Update CSS mask position so A1 text is visible only inside the spotlight circle
        if (overlayRef.current) {
          overlayRef.current.style.setProperty('--spot-x', (currentPosRef.current.x * 100) + '%');
          overlayRef.current.style.setProperty('--spot-y', (currentPosRef.current.y * 100) + '%');
          overlayRef.current.style.setProperty('--spot-opacity', currentIntensityRef.current.toFixed(3));
        }

        try {
          renderer.render({ scene: mesh });
          animationIdRef.current = requestAnimationFrame(animLoop);
        } catch (e) {
          console.warn('WebGL render error:', e);
        }
      };

      animationIdRef.current = requestAnimationFrame(animLoop);

      cleanupFunctionRef.current = () => {
        if (animationIdRef.current) {
          cancelAnimationFrame(animationIdRef.current);
        }
        window.removeEventListener('resize', handleResize);

        try {
          const loseContext = gl.getExtension('WEBGL_lose_context');
          if (loseContext) loseContext.loseContext();
          if (gl.canvas && gl.canvas.parentNode) {
            gl.canvas.parentNode.removeChild(gl.canvas);
          }
        } catch (e) {
          console.warn('WebGL cleanup error:', e);
        }

        rendererRef.current = null;
        uniformsRef.current = null;
      };
    };

    initWebGL();

    return () => {
      if (cleanupFunctionRef.current) {
        cleanupFunctionRef.current();
        cleanupFunctionRef.current = null;
      }
    };
  }, [isVisible]); // Only isVisible — no isHovered to prevent flicker

  const handleMouseMove = e => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mousePosRef.current = {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height
    };
  };

  return (
    <div
      ref={containerRef}
      className={`cinematic-spotlight-container ${className}`.trim()}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => { isHoveredRef.current = true; }}
      onMouseLeave={() => { isHoveredRef.current = false; }}
    >
      {/* 3D Volumetric Beam & Dust Canvas */}
      <div ref={canvasContainerRef} className="spotlight-canvas-container" />

      {/* A1 text — visible only where the spotlight circle hits it */}
      <div ref={overlayRef} className="spotlight-text-overlay">
        <span ref={textRef} className="spotlight-a1-text">A1</span>
      </div>
    </div>
  );
};

export default CinematicSpotlight;
