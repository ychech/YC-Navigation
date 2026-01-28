"use client";

import { useRef, useMemo, memo, useState, useEffect } from 'react';
import { Canvas, useFrame, extend, ReactThreeFiber } from '@react-three/fiber';
import { Sphere, Stars, OrbitControls, shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';

// --- Shaders ---

// Sun Material with High-Def Texture & HDR Lighting
const SunMaterial = shaderMaterial(
  { 
    time: 0,
    colorCore: new THREE.Color("#fff7ed"), // Ultra Bright Core
    colorMid: new THREE.Color("#f59e0b"), // Vivid Orange
    colorEdge: new THREE.Color("#7c2d12"), // Deep Red-Brown Edge (Limb Darkening)
    intensity: 1.5 
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vViewPosition;
    
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  // Fragment Shader
  `
    uniform float time;
    uniform vec3 colorCore;
    uniform vec3 colorMid;
    uniform vec3 colorEdge;
    uniform float intensity;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vViewPosition;

    // Improved Noise Function (More detail)
    float hash(float n) { return fract(sin(n) * 1e4); }
    float noise(vec3 x) {
        const vec3 step = vec3(110, 241, 171);
        vec3 i = floor(x);
        vec3 f = fract(x);
        float n = dot(i, step);
        vec3 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(mix( hash(n + dot(step, vec3(0, 0, 0))), hash(n + dot(step, vec3(1, 0, 0))), u.x),
                       mix( hash(n + dot(step, vec3(0, 1, 0))), hash(n + dot(step, vec3(1, 1, 0))), u.x), u.y),
                   mix(mix( hash(n + dot(step, vec3(0, 0, 1))), hash(n + dot(step, vec3(1, 0, 1))), u.x),
                       mix( hash(n + dot(step, vec3(0, 1, 1))), hash(n + dot(step, vec3(1, 1, 1))), u.x), u.y), u.z);
    }

    // FBM for Granulation Detail
    float fbm(vec3 p) {
        float v = 0.0;
        float a = 0.5;
        vec3 shift = vec3(100.0);
        for (int i = 0; i < 4; ++i) {
            v += a * noise(p);
            p = p * 2.0 + shift;
            a *= 0.5;
        }
        return v;
    }

    void main() {
      vec3 viewDir = normalize(vViewPosition);
      float dotNV = dot(viewDir, vNormal);
      
      // 1. Sharp Limb Darkening (HDR Feel)
      float limb = pow(dotNV, 3.5); 
      
      // 2. Dynamic Granulation Texture
      // High frequency noise for surface detail
      float detail = fbm(vPosition * 8.0 + vec3(time * 0.1));
      
      // Low frequency noise for large convection cells
      float convection = noise(vPosition * 3.0 - vec3(time * 0.05));
      
      // Combine textures
      float solarActivity = detail * 0.6 + convection * 0.4;
      
      // 3. Color Grading
      // Mix from Edge (Dark) to Mid (Orange) based on Limb
      vec3 baseColor = mix(colorEdge, colorMid, smoothstep(0.0, 0.6, limb));
      
      // Add texture detail to the mid-tones
      baseColor += colorMid * solarActivity * 0.3;
      
      // Mix to Core (White) at the very center, blowing out detail
      float coreMask = smoothstep(0.5, 1.0, limb);
      baseColor = mix(baseColor, colorCore, coreMask * 0.9 + solarActivity * 0.1);

      gl_FragColor = vec4(baseColor * intensity, 1.0);
    }
  `
);

extend({ SunMaterial });

declare global {
  namespace JSX {
    interface IntrinsicElements {
      sunMaterial: any;
    }
  }
}

// --- Custom Hooks ---

// Hook to handle robust texture loading with error handling
function useEarthTextures() {
  const [textures, setTextures] = useState<{
    map: THREE.Texture | null;
    normal: THREE.Texture | null;
    specular: THREE.Texture | null;
    clouds: THREE.Texture | null;
  } | null>(null);
  
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    let isMounted = true;

    const loadTexture = (url: string) => {
      return new Promise<THREE.Texture | null>((resolve) => {
        loader.load(
          url,
          (tex) => resolve(tex),
          undefined,
          (err) => {
            console.warn(`Failed to load texture: ${url}`, err);
            resolve(null); // Resolve null instead of rejecting
          }
        );
      });
    };

    Promise.all([
      loadTexture('/textures/earth/map.jpg'),
      loadTexture('/textures/earth/normal.jpg'),
      loadTexture('/textures/earth/specular.jpg'),
      loadTexture('/textures/earth/clouds.png')
    ]).then(([map, normal, specular, clouds]) => {
      if (!isMounted) return;
      
      // Check if critical textures loaded (map is essential)
      if (!map) {
        console.error("Critical earth texture failed to load, falling back to wireframe.");
        setHasError(true);
        return;
      }

      setTextures({ map, normal, specular, clouds });
    }).catch(err => {
      console.error("Unexpected error loading textures:", err);
      if (isMounted) setHasError(true);
    });

    return () => { isMounted = false; };
  }, []);

  return { textures, hasError };
}

// --- Components ---

// Optimized Particles - Floating Stardust
const Particles = memo(({ count = 2000 }: { count?: number }) => {
  const points = useRef<THREE.Points>(null);

  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = THREE.MathUtils.randFloatSpread(360); 
      const phi = THREE.MathUtils.randFloatSpread(360); 
      const distance = 4 + Math.random() * 6; // Cloud around earth
      const x = distance * Math.sin(theta) * Math.cos(phi);
      const y = distance * Math.sin(theta) * Math.sin(phi);
      const z = distance * Math.cos(theta);
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }
    return positions;
  }, [count]);

  useFrame((state) => {
    if (points.current) {
      // Gentle floating rotation
      points.current.rotation.y += 0.0003;
      points.current.rotation.x += 0.0001;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particlesPosition, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#a5b4fc" // Soft Indigo/Blue
        size={0.02}
        sizeAttenuation
        transparent
        opacity={0.6}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
});

Particles.displayName = 'Stardust';

// Fallback Wireframe Earth
function FallbackEarth() {
  const groupRef = useRef<THREE.Group>(null);
  useFrame(() => {
    if (groupRef.current) groupRef.current.rotation.y += 0.001;
  });

  return (
    <group ref={groupRef} rotation={[0, 0, Math.PI / 6]}>
      <Sphere args={[2.2, 32, 32]}>
        <meshStandardMaterial 
          color="#1e1b4b" 
          emissive="#0f172a"
          wireframe 
          transparent
          opacity={0.3}
        />
      </Sphere>
      {/* Inner Core */}
      <Sphere args={[2.1, 32, 32]}>
         <meshBasicMaterial color="#000000" />
      </Sphere>
    </group>
  );
}

// Real Earth Component
function Earth({ textures, hasError }: { textures: any, hasError: boolean }) {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (earthRef.current) earthRef.current.rotation.y += 0.0005; 
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += 0.0007;
      cloudsRef.current.rotation.z += 0.0001;
    }
  });

  // Render fallback if error or still loading
  if (hasError || !textures) {
    return <FallbackEarth />;
  }

  return (
    <group rotation={[0, 0, Math.PI / 6]}>
      {/* 1. Atmosphere Glow (Removed) */}
      {/* <Sphere args={[2.35, 64, 64]}>
        <meshPhongMaterial 
          color="#ff4500" 
          transparent 
          opacity={0.1} 
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </Sphere> */}

      {/* Impact Shockwave Ring (Removed) */}
      {/* <mesh rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[3.0, 0.05, 16, 100]} />
        <meshBasicMaterial color="#ff4500" transparent opacity={0.4} />
      </mesh> */}

      {/* 2. Main Earth Body - Realistic Style */}
      <Sphere ref={earthRef} args={[2.2, 64, 64]}>
        <meshStandardMaterial
          map={textures.map!} 
          normalMap={textures.normal || undefined}
          roughness={0.7} 
          metalness={0.1}
          color="#ffffff" // Pure white base for natural color
        />
      </Sphere>

      {/* 3. Clouds Layer - Realistic */}
      {textures.clouds && (
        <Sphere ref={cloudsRef} args={[2.23, 64, 64]}>
          <meshPhongMaterial
            map={textures.clouds}
            transparent
            opacity={0.8} 
            color="#ffffff" // Pure white clouds
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </Sphere>
      )}
    </group>
  );
}

function StarField() {
  return <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={0.5} />;
}

// Realistic Sun Component - Volumetric Sphere
function RealisticSun() {
  const sunMatRef = useRef<any>(null);
  
  useFrame((state) => {
    if (sunMatRef.current) {
      sunMatRef.current.uniforms.time.value = state.clock.getElapsedTime();
    }
  });

  return (
    <group position={[12, 6, -10]}> {/* Positioned in the top-right background */}
      {/* 1. Core - Solid 3D Sphere with Limb Darkening */}
      <Sphere args={[1.5, 64, 64]}> 
        <sunMaterial 
          ref={sunMatRef}
          colorCore={new THREE.Color("#fff7ed")} 
          colorMid={new THREE.Color("#f59e0b")}
          colorEdge={new THREE.Color("#7c2d12")} 
          intensity={1.5}
        />
      </Sphere>
    </group>
  );
}

export default function WorldGlobe() {
  const { textures, hasError } = useEarthTextures();

  return (
    <div className="w-full h-full cursor-move">
      <Canvas 
        camera={{ position: [0, 0, 9], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.05} /> {/* Very dark space ambient */}
        
        {/* Main Light Source (Sun) - Warm Sunlight */}
        <directionalLight 
          position={[12, 6, -5]} // Matches sun direction but closer for lighting calculation
          intensity={2.5} 
          color="#fff7ed" // Warm white (Orange-50)
          castShadow 
        />
        
        {/* Subtle Fill Light from bottom left (Earth reflection) */}
        <pointLight position={[-10, -10, -5]} intensity={0.1} color="#1e3a8a" /> 
        
        <Earth textures={textures} hasError={hasError} />
        <RealisticSun />
        
        <Particles count={2000} />
        <StarField />
        
        <OrbitControls 
          enableZoom={true}
          enablePan={false} 
          enableRotate={true}
          autoRotate 
          autoRotateSpeed={0.5}
          minDistance={6}
          maxDistance={20}
        />
      </Canvas>
    </div>
  );
}
