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

  // SVG mask refs for direct, zero-overhead DOM updates
  const maskCircleRef = useRef(null);
  const highlightCircleRef = useRef(null);
  const specularGradRef = useRef(null);

  // Animation values
  const [isHovered, setIsHovered] = useState(false);
  const mousePosRef = useRef({ x: 0.5, y: 0.35 });
  const currentPosRef = useRef({ x: 0.5, y: 0.35 });

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

      // Small delay to ensure container layout sizes are calculated
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

      // Vertex shader passes normalized coordinates
      const vert = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

      // Fragment shader with volumetric cone, shifting fog, vignette and dust particles
      const frag = `precision highp float;

uniform float iTime;
uniform vec2  iResolution;
uniform vec2  iSpotlight;

uniform vec3  raysColor;
uniform float lightSpread;
uniform float rayLength;
uniform float noiseAmount;
uniform float distortion;

varying vec2 vUv;

// Pseudo-random noise
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

// Fractal Brownian Motion for shifting atmospheric fog
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  vec2 shift = vec2(100.0);
  mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
  for (int i = 0; i < 4; ++i) {
    v += a * noise(p);
    p = rot * p * 2.0 + shift;
    a *= 0.5;
  }
  return v;
}

// Volumetric Light Cone
float volumetricCone(vec2 rayPos, vec2 rayDir, vec2 coord, float spread, float len) {
  vec2 toCoord = coord - rayPos;
  float dist = length(toCoord);
  vec2 dir = toCoord / dist;
  
  float cosAngle = dot(dir, rayDir);
  float spreadFactor = pow(max(cosAngle, 0.0), 1.0 / max(spread, 0.001));
  
  float maxDist = iResolution.x * len;
  float falloff = clamp((maxDist - dist) / maxDist, 0.0, 1.0);
  
  float originGlow = exp(-dist / (iResolution.y * 0.12)) * 0.45;
  
  vec2 fogUv = coord * 0.002 - vec2(0.0, iTime * 0.08);
  float fog = fbm(fogUv + vec2(noise(fogUv * 1.5 + iTime * 0.03) * 0.15));
  
  float pulse = 0.96 + 0.04 * sin(iTime * 3.5);
  
  return (spreadFactor * falloff + originGlow) * (0.65 + 0.35 * fog) * pulse;
}

// Floating Dust Particles lit by the beam
float drawDust(vec2 coord, vec2 rayPos, vec2 rayDir, float spread, float len) {
  float dustGlow = 0.0;
  for (int i = 0; i < 35; i++) {
    float id = float(i);
    float randX = hash(vec2(id, 17.52));
    float randY = hash(vec2(id, 83.19));
    float randSpeed = 0.2 + 0.8 * hash(vec2(id, 41.38));
    float size = 0.8 + 2.5 * hash(vec2(id, 23.47));
    
    // Floating movement vector
    vec2 p = vec2(randX, randY) * iResolution.xy;
    p.x += sin(iTime * randSpeed + id) * 30.0;
    p.y -= iTime * 15.0 * randSpeed;
    
    // Wrap edges
    p.x = mod(p.x, iResolution.x);
    p.y = mod(p.y, iResolution.y);
    
    // Check if inside light cone
    vec2 toParticle = p - rayPos;
    float dist = length(toParticle);
    vec2 dir = toParticle / dist;
    float cosAngle = dot(dir, rayDir);
    float spreadFactor = pow(max(cosAngle, 0.0), 1.0 / max(spread, 0.001));
    float maxDist = iResolution.x * len;
    float falloff = clamp((maxDist - dist) / maxDist, 0.0, 1.0);
    
    float insideBeam = spreadFactor * falloff;
    
    if (insideBeam > 0.05) {
      float distToPixel = length(coord - p);
      float glow = exp(-distToPixel / (size * 1.5)) * insideBeam * 1.5;
      dustGlow += glow;
    }
  }
  return dustGlow;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 coord = vec2(fragCoord.x, iResolution.y - fragCoord.y);
  
  // Origin at bottom-center
  vec2 rayPos = vec2(iResolution.x * 0.5, iResolution.y * 1.08);
  vec2 targetPos = iSpotlight * iResolution.xy;
  vec2 rayDir = normalize(targetPos - rayPos);
  
  float beam = volumetricCone(rayPos, rayDir, coord, lightSpread, rayLength);
  float dust = drawDust(coord, rayPos, rayDir, lightSpread, rayLength);
  
  vec3 beamColor = raysColor * (beam + dust);
  
  // Muted cinematic background color
  vec3 bgColor = vec3(0.02, 0.02, 0.025) * (1.0 - coord.y / iResolution.y * 0.45);
  vec3 finalColor = bgColor + beamColor;
  
  // Spotlight hit glow
  float distToTarget = length(coord - targetPos);
  float spotHit = exp(-distToTarget / (iResolution.y * 0.16)) * 0.16;
  finalColor += raysColor * spotHit;
  
  // Vignette
  vec2 uv = fragCoord.xy / iResolution.xy;
  float vignette = uv.x * uv.y * (1.0 - uv.x) * (1.0 - uv.y);
  vignette = clamp(pow(16.0 * vignette, 0.28), 0.0, 1.0);
  finalColor *= vignette;
  
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
        iSpotlight: { value: [0.5, 0.35] },
        raysColor: { value: [1.0, 0.72, 0.0] }, // hexToRgb #ffb700 is roughly [1.0, 0.72, 0.0]
        lightSpread: { value: 0.48 },
        rayLength: { value: 1.6 },
        noiseAmount: { value: 0.06 },
        distortion: { value: 0.05 }
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

        // 1. Update uniforms time
        uniforms.iTime.value = time * 0.001;

        // 2. Physics interpolation (easing + inertia)
        let targetX, targetY;
        if (isHovered) {
          targetX = mousePosRef.current.x;
          targetY = mousePosRef.current.y;
        } else {
          // Automated smooth cinematic sweep
          targetX = 0.5 + 0.32 * Math.sin(time * 0.0004);
          targetY = 0.35 + 0.1 * Math.cos(time * 0.0007);
        }

        // Apply smooth interpolation
        currentPosRef.current.x += (targetX - currentPosRef.current.x) * 0.05;
        currentPosRef.current.y += (targetY - currentPosRef.current.y) * 0.05;

        // 3. Update WebGL uniforms
        uniforms.iSpotlight.value = [currentPosRef.current.x, currentPosRef.current.y];

        // 4. Update SVG masks directly via DOM refs (fast, bypasses React render cycles)
        const svgW = 1000;
        const svgH = 400;
        const cx = currentPosRef.current.x * svgW;
        const cy = currentPosRef.current.y * svgH;

        if (maskCircleRef.current) {
          maskCircleRef.current.setAttribute('cx', cx.toString());
          maskCircleRef.current.setAttribute('cy', cy.toString());
        }
        if (highlightCircleRef.current) {
          highlightCircleRef.current.setAttribute('cx', (cx + 8).toString()); // Shift highlight slightly for 3D depth
          highlightCircleRef.current.setAttribute('cy', cy.toString());
        }
        if (specularGradRef.current) {
          // Point specular gradient angle slightly towards center
          const gradX = currentPosRef.current.x * 100;
          specularGradRef.current.setAttribute('x1', `${gradX - 30}%`);
          specularGradRef.current.setAttribute('x2', `${gradX + 30}%`);
        }

        // 5. Render
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
  }, [isVisible, isHovered]);

  const handleMouseMove = e => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mousePosRef.current = { x, y };
  };

  return (
    <div
      ref={containerRef}
      className={`cinematic-spotlight-container ${className}`.trim()}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 3D Volumetric Beam & Dust Canvas */}
      <div ref={canvasContainerRef} className="spotlight-canvas-container" />

      {/* SVG Text A1 Mask Reveal Overlay */}
      <div className="spotlight-overlay">
        <svg
          className="spotlight-svg"
          viewBox="0 0 1000 400"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Primary soft reveal mask */}
            <mask id="spotlight-text-mask">
              <rect width="1000" height="400" fill="black" />
              <circle
                ref={maskCircleRef}
                cx="500"
                cy="200"
                r="140"
                fill="url(#spotlight-mask-grad)"
              />
            </mask>

            {/* Sharp mask for specular edge reflections */}
            <mask id="spotlight-highlight-mask">
              <rect width="1000" height="400" fill="black" />
              <circle
                ref={highlightCircleRef}
                cx="508"
                cy="200"
                r="110"
                fill="url(#spotlight-highlight-grad)"
              />
            </mask>

            {/* Radial gradient with soft falloff */}
            <radialGradient id="spotlight-mask-grad">
              <stop offset="0%" stopColor="white" stopOpacity="1.0" />
              <stop offset="55%" stopColor="white" stopOpacity="0.85" />
              <stop offset="100%" stopColor="white" stopOpacity="0.0" />
            </radialGradient>

            {/* Sharp gradient for specular edge highlight */}
            <radialGradient id="spotlight-highlight-grad">
              <stop offset="0%" stopColor="white" stopOpacity="0.75" />
              <stop offset="40%" stopColor="white" stopOpacity="0.30" />
              <stop offset="100%" stopColor="white" stopOpacity="0.0" />
            </radialGradient>

            {/* Premium chrome-silver display text gradient */}
            <linearGradient id="spotlight-metal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="30%" stopColor="#f2f2f5" />
              <stop offset="50%" stopColor="#e1e1e5" />
              <stop offset="70%" stopColor="#b6b6bc" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>

            {/* Specular golden edge highlight */}
            <linearGradient id="spotlight-specular-grad" ref={specularGradRef} x1="20%" y1="0%" x2="80%" y2="0%">
              <stop offset="0%" stopColor="#ffe680" stopOpacity="0.0" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="1.0" />
              <stop offset="100%" stopColor="#ffe680" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Main Masked Text (Visible ONLY inside the spotlight) */}
          <text
            x="50%"
            y="56%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="spotlight-text-base"
            mask="url(#spotlight-text-mask)"
          >
            A1
          </text>

          {/* Specular Highlight Stroke Layer (Glows on edges) */}
          <text
            x="50%"
            y="56%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="spotlight-text-specular"
            mask="url(#spotlight-highlight-mask)"
          >
            A1
          </text>
        </svg>
      </div>
    </div>
  );
};

export default CinematicSpotlight;
