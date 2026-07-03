import React, { useRef, useEffect, useState } from 'react';
import { Renderer, Program, Triangle, Mesh } from 'ogl';
import './CinematicSpotlight.css';

const CinematicSpotlight = ({ className = '' }) => {
  const containerRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const rendererRef = useRef(null);
  const uniformsRef = useRef(null);
  const animationIdRef = useRef(null);
  const cleanupFunctionRef = useRef(null);

  // Use refs for hover/mouse to avoid re-creating WebGL on state change
  const isHoveredRef = useRef(false);
  const mousePosRef = useRef({ x: 0.72, y: 0.32 });
  const currentPosRef = useRef({ x: 0.72, y: 0.32 });

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

// === Tight volumetric cone ===
float volumetricCone(vec2 origin, vec2 dir, vec2 coord, float spread, float len) {
  vec2 toCoord = coord - origin;
  float dist = length(toCoord);
  if (dist < 0.001) return 1.0;
  vec2 d = toCoord / dist;

  float cosAngle = dot(d, dir);

  // Physically-based inverse-square falloff
  float maxDist = iResolution.x * len;
  float t = dist / maxDist;
  float invSq = 1.0 / (1.0 + t * t * 6.0);
  float linear = clamp(1.0 - t, 0.0, 1.0);
  float falloff = mix(invSq, linear, 0.3);

  // Tight angular spread
  float angleFactor = pow(max(cosAngle, 0.0), 1.0 / max(spread, 0.001));

  // Soft edge feathering
  float edgeSoftness = smoothstep(0.0, 0.08, cosAngle);

  // Origin glow
  float originGlow = exp(-dist / (iResolution.y * 0.06)) * 0.5;

  // Atmospheric fog
  vec2 fogUv = coord * 0.0015 + vec2(iTime * 0.02, -iTime * 0.015);
  float fog = fbm(fogUv);
  float fogDetail = fbm(fogUv * 3.0 + vec2(iTime * 0.05));
  float atmosphere = 0.55 + 0.45 * mix(fog, fogDetail, 0.3);

  // Subtle flicker
  float flicker = 0.97 + 0.03 * sin(iTime * 5.7 + dist * 0.003)
                       + 0.02 * sin(iTime * 3.1);

  return (angleFactor * edgeSoftness * falloff + originGlow) * atmosphere * flicker;
}

// === Dust particles ===
float drawDust(vec2 coord, vec2 origin, vec2 dir, float spread, float len) {
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
    vec2 d = toP / max(dist, 0.001);
    float cosA = dot(d, dir);
    float sFact = pow(max(cosA, 0.0), 1.0 / max(spread, 0.001));
    float maxD = iResolution.x * len;
    float fOff = clamp((maxD - dist) / maxD, 0.0, 1.0);

    float inside = sFact * fOff;

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

  // Tight spread = 0.18 for a narrow focused beam
  float spread = 0.18;
  float len = 1.8;

  // Primary volumetric cone
  float beam = volumetricCone(rayPos, rayDir, coord, spread, len);

  // Dust particles
  float dust = drawDust(coord, rayPos, rayDir, spread, len);

  // Color: warm golden white
  vec3 beamColor = vec3(1.0, 0.88, 0.55);
  vec3 coreColor = vec3(1.0, 0.95, 0.85);

  float coreIntensity = pow(beam, 2.0);
  vec3 lightColor = mix(beamColor, coreColor, coreIntensity) * (beam + dust * 0.5);

  // Very dark background
  vec2 uv = fragCoord.xy / iResolution.xy;
  vec3 bgColor = vec3(0.018, 0.018, 0.022) * (1.0 - uv.y * 0.35);

  vec3 finalColor = bgColor + lightColor;

  // Spot glow where beam hits
  float distToTarget = length(coord - targetPos);
  float spotHit = exp(-distToTarget / (iResolution.y * 0.18)) * 0.1;
  finalColor += beamColor * spotHit;

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
        iSpotlight: { value: [0.72, 0.32] }
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
      };

      window.addEventListener('resize', handleResize);
      handleResize();

      const animLoop = time => {
        if (!rendererRef.current || !uniformsRef.current) return;

        uniforms.iTime.value = time * 0.001;

        // Read hover state from ref (no re-render)
        let targetX, targetY;
        if (isHoveredRef.current) {
          targetX = mousePosRef.current.x;
          targetY = mousePosRef.current.y;
        } else {
          // Slow cinematic sweep
          targetX = 0.55 + 0.22 * Math.sin(time * 0.00025);
          targetY = 0.32 + 0.12 * Math.cos(time * 0.00045);
        }

        // Smooth interpolation with inertia
        currentPosRef.current.x += (targetX - currentPosRef.current.x) * 0.03;
        currentPosRef.current.y += (targetY - currentPosRef.current.y) * 0.03;

        uniforms.iSpotlight.value = [currentPosRef.current.x, currentPosRef.current.y];

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

      {/* Dark blurred A1 text — shifted right */}
      <div className="spotlight-text-overlay">
        <span className="spotlight-a1-text">A1</span>
      </div>
    </div>
  );
};

export default CinematicSpotlight;
