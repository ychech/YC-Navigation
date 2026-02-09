"use client";

import { useRef, useMemo, memo, useState, useEffect } from 'react';
import { Canvas, useFrame, extend, ReactThreeFiber } from '@react-three/fiber';
import { Sphere, Stars, OrbitControls, shaderMaterial, Billboard, Plane } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from 'next-themes';

// --- Shaders ---

// Sun Material (Burning Plasma Shader) - Optimized for 2D Billboard
const SunMaterial = shaderMaterial(
  { 
    time: 0,
    colorDeep: new THREE.Color("#440000"), // Deepest Dark Red (Cooler spots)
    colorMid: new THREE.Color("#ff0000"),  // Vibrant Red (Main body)
    colorHot: new THREE.Color("#ffaa00"),  // Bright Orange-Yellow (Hot spots)
    colorCore: new THREE.Color("#ffffff"), // Blinding White (Eruption centers)
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    varying vec3 vPosition;
    
    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform float time;
    uniform vec3 colorDeep;
    uniform vec3 colorMid;
    uniform vec3 colorHot;
    uniform vec3 colorCore;
    
    varying vec2 vUv;
    varying vec3 vPosition;

    // Cube Noise Function
    float mod289(float x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
    vec4 mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
    vec4 perm(vec4 x){return mod289(((x * 34.0) + 1.0) * x);}
    
    float noise(vec3 p){
        vec3 a = floor(p);
        vec3 d = p - a;
        d = d * d * (3.0 - 2.0 * d);
    
        vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);
        vec4 k1 = perm(b.xyxy);
        vec4 k2 = perm(k1.xyxy + b.zzww);
    
        vec4 c = k2 + a.zzzz;
        vec4 k3 = perm(c);
        vec4 k4 = perm(c + 1.0);
    
        vec4 o1 = fract(k3 * (1.0 / 41.0));
        vec4 o2 = fract(k4 * (1.0 / 41.0));
    
        vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);
        vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);
    
        return o4.y * d.y + o4.x * (1.0 - d.y);
    }

    void main() {
      // 1. Circular Mask (Make Plane look like Sphere)
      vec2 center = vec2(0.5);
      float dist = distance(vUv, center);
      if (dist > 0.5) discard;
      
      // 2. Simulate 3D Sphere Geometry from 2D UV
      // Map UV (0..1) to (-1..1)
      vec2 uvCentered = (vUv - 0.5) * 2.0;
      float r = length(uvCentered);
      // Calculate Z depth based on sphere equation: x^2 + y^2 + z^2 = 1
      float z = sqrt(1.0 - clamp(r * r, 0.0, 1.0));
      
      // Virtual Normal (since it's a sphere, normal = position on unit sphere)
      vec3 sphereNormal = vec3(uvCentered, z);
      
      // 3. Fresnel Effect
      // On a sphere looking down -Z, fresnel is related to the Z component of the normal
      // Center (z=1) -> Facing camera -> Fresnel = 0
      // Edge (z=0) -> Perpendicular -> Fresnel = 1
      float fresnel = 1.0 - z; 
      fresnel = clamp(fresnel, 0.0, 1.0);

      // 4. Noise Mapping
      // Use the spherical coordinate to sample 3D noise so it wraps correctly
      vec3 noisePos = sphereNormal * 3.0; // Scale noise
      
      float noise1 = noise(noisePos * 2.0 + vec3(time * 0.5));
      float noise2 = noise(noisePos * 6.0 + vec3(time * 1.5));
      float noise3 = noise(noisePos * 12.0 + vec3(time * 2.0));
      
      float brightness = noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2;
      
      // Super bright core
      float core = smoothstep(0.4, 0.8, brightness);
      
      vec3 color = mix(colorDeep, colorMid, brightness);
      color = mix(color, colorHot, core);
      color += colorCore * smoothstep(0.8, 1.0, brightness) * 2.0;
      
      // Corona glow edge
      color += colorHot * pow(fresnel, 3.0) * 1.5;

      gl_FragColor = vec4(color, 1.0);
    }
  `
);

// Deep Space Background (Clean Gradient)
const DeepSpaceMaterial = shaderMaterial(
  { 
    colorTop: new THREE.Color("#000000"), 
    colorBottom: new THREE.Color("#020617") // Very dark slate/blue
  },
  // Vertex
  `
    varying vec3 vPosition;
    void main() {
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment
  `
    uniform vec3 colorTop;
    uniform vec3 colorBottom;
    varying vec3 vPosition;

    void main() {
      vec3 dir = normalize(vPosition);
      // Vertical gradient from bottom (blueish) to top (black)
      float t = smoothstep(-1.0, 1.0, dir.y);
      vec3 color = mix(colorBottom, colorTop, t);
      gl_FragColor = vec4(color, 1.0);
    }
  `
);

extend({ SunMaterial, DeepSpaceMaterial });

declare global {
  namespace JSX {
    interface IntrinsicElements {
      sunMaterial: any;
      deepSpaceMaterial: any;
    }
  }
}

// --- Components ---

// Background Gradient
function DeepSpace() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  if (!isDark) {
    // Light Mode: Clean light gradient
    return (
      <mesh>
        <sphereGeometry args={[50, 32, 32]} />
        <meshBasicMaterial 
          color="#f8fafc" 
          side={THREE.BackSide} 
        />
      </mesh>
    );
  }
  
  // Dark Mode: Deep space
  return (
    <mesh>
      <sphereGeometry args={[50, 32, 32]} />
      {/* @ts-ignore */}
      <deepSpaceMaterial side={THREE.BackSide} />
    </mesh>
  );
}

// Shooting Star
function ShootingStar() {
  const ref = useRef<THREE.Mesh>(null);
  const [active, setActive] = useState(false);
  
  // Random start position logic
  const reset = () => {
    if (!ref.current) return;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    const r = 30;
    ref.current.position.set(
      r * Math.sin(theta) * Math.cos(phi),
      r * Math.sin(theta) * Math.sin(phi),
      r * Math.cos(theta)
    );
    // Aim somewhat towards center but offset
    ref.current.lookAt(new THREE.Vector3(Math.random()*5, Math.random()*5, Math.random()*5));
    setActive(true);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      if (Math.random() > 0.7) reset(); // 30% chance every 2s
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  useFrame(() => {
    if (!active || !ref.current) return;
    ref.current.translateZ(0.8); // Speed
    if (ref.current.position.length() > 40) setActive(false); // Out of bounds
  });

  if (!active) return null;

  return (
    <mesh ref={ref}>
      <cylinderGeometry args={[0, 0.1, 8, 8]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
    </mesh>
  );
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

// Optimized Particles - Floating Stardust (Reduced count for performance)
const Particles = memo(({ count = 3000 }: { count?: number }) => {
  const points = useRef<THREE.Points>(null);

  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = THREE.MathUtils.randFloatSpread(360); 
      const phi = THREE.MathUtils.randFloatSpread(360); 
      // Distribute stars far away to form a background field
      const distance = 20 + Math.random() * 25; 
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
      // Very slow rotation for the whole starfield
      points.current.rotation.y += 0.0001;
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
        color="#ffffff"
        size={0.03}
        sizeAttenuation
        transparent
        opacity={0.8}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
});

Particles.displayName = 'StarFieldParticles';

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
  const wireframeRef = useRef<THREE.Mesh>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  useFrame(() => {
    if (earthRef.current) earthRef.current.rotation.y += 0.0005; 
    if (wireframeRef.current) wireframeRef.current.rotation.y += 0.0005;
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += 0.0007;
      cloudsRef.current.rotation.z += 0.0001;
    }
  });

  // Light Mode: Wireframe Grid Sphere
  if (!isDark) {
    return (
      <group ref={wireframeRef} rotation={[0, 0, Math.PI / 6]}>
        <Sphere args={[2.2, 32, 32]}>
          <meshStandardMaterial 
            color="#6366f1" 
            emissive="#4338ca"
            emissiveIntensity={0.2}
            wireframe 
            transparent
            opacity={0.4}
          />
        </Sphere>
        {/* Inner Core */}
        <Sphere args={[2.1, 32, 32]}>
           <meshBasicMaterial color="#f8fafc" />
        </Sphere>
      </group>
    );
  }

  // Render fallback if error or still loading
  if (hasError || !textures) {
    return <FallbackEarth />;
  }

  // Dark Mode: Realistic Style
  return (
    <group rotation={[0, 0, Math.PI / 6]}>
      {/* Main Earth Body - Realistic Style */}
      <Sphere ref={earthRef} args={[2.2, 64, 64]}>
        <meshStandardMaterial
          map={textures.map!} 
          normalMap={textures.normal || undefined}
          roughness={0.7} 
          metalness={0.1}
          color="#ffffff" // Pure white base for natural color
        />
      </Sphere>

      {/* Clouds Layer - Realistic */}
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

// Realistic Sun Component - Volumetric Billboard
function RealisticSun() {
  const sunMatRef = useRef<any>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  // 白天模式不显示太阳
  if (!isDark) return null;
  
  useFrame((state) => {
    if (sunMatRef.current) {
      sunMatRef.current.uniforms.time.value = state.clock.getElapsedTime();
    }
  });

  return (
    <group position={[15, 8, -20]}> {/* Further away to reduce perspective distortion */}
      {/* Billboard ensures the plane always faces the camera */}
      <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
        {/* Plane Geometry serves as the canvas for the 2D shader that simulates a sphere */}
        <Plane args={[10, 10]}> 
          {/* @ts-ignore */}
          <sunMaterial 
            ref={sunMatRef} 
            transparent={true} 
          />
        </Plane>
      </Billboard>
    </group>
  );
}

export default function WorldGlobe() {
  const { textures, hasError } = useEarthTextures();
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
    // 延迟加载 3D 场景，等页面其他内容渲染完成
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // 避免 SSR 渲染 Three.js Canvas
  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-2xl" />
      </div>
    );
  }

  // 延迟显示 3D 场景
  if (!isVisible) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-40 h-40 rounded-full bg-gradient-to-br from-indigo-500/30 via-purple-500/20 to-cyan-500/30 blur-3xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="w-full h-full cursor-move outline-none">
      <Canvas 
        camera={{ position: [0, 0, 9], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ outline: 'none' }}
      >
        <ambientLight intensity={0.05} />
        
        <directionalLight 
          position={[12, 6, -5]}
          intensity={2.5} 
          color="#fff7ed"
          castShadow 
        />
        
        <pointLight position={[-10, -10, -5]} intensity={0.1} color="#1e3a8a" /> 
        
        <Earth textures={textures} hasError={hasError} />
        <RealisticSun />
        
        <Particles count={3000} />
        <ShootingStar />
        <DeepSpace />
        
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
