"use client";

import { useRef, useMemo, memo, useState, useEffect } from 'react';
import { Canvas, useFrame, extend, ReactThreeFiber } from '@react-three/fiber';
import { Sphere, Stars, OrbitControls, shaderMaterial, RoundedBox, Billboard, Plane } from '@react-three/drei';
import * as THREE from 'three';

// --- Shaders ---

// Sun Material (Burning Plasma Shader)
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
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    
    void main() {
      vUv = uv;
      vPosition = position;
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
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
    varying vec3 vNormal;
    varying vec3 vViewPosition;

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
      float fresnel = dot(normalize(vViewPosition), vNormal);
      fresnel = clamp(fresnel, 0.0, 1.0);

      float noise1 = noise(vPosition * 2.0 + vec3(time * 0.5));
      float noise2 = noise(vPosition * 6.0 + vec3(time * 1.5));
      float noise3 = noise(vPosition * 12.0 + vec3(time * 2.0));
      
      float brightness = noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2;
      
      // Super bright core
      float core = smoothstep(0.4, 0.8, brightness);
      
      vec3 color = mix(colorDeep, colorMid, brightness);
      color = mix(color, colorHot, core);
      color += colorCore * smoothstep(0.8, 1.0, brightness) * 2.0;
      
      // Corona glow edge
      float rim = 1.0 - fresnel;
      color += colorHot * pow(rim, 2.0) * 1.5;

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
  return (
    <mesh>
      <sphereGeometry args={[50, 32, 32]} />
      <deepSpaceMaterial side={THREE.BackSide} />
    </mesh>
  );
}

// Improved Astronaut (Detailed & Articulated)
// function Astronaut() {
//   const group = useRef<THREE.Group>(null);
//   const leftArm = useRef<THREE.Group>(null);
//   const rightArm = useRef<THREE.Group>(null);
//   const leftLeg = useRef<THREE.Group>(null);
//   const rightLeg = useRef<THREE.Group>(null);
  
//   useFrame((state) => {
//     if (group.current) {
//       // Floating animation
//       const t = state.clock.getElapsedTime();
//       group.current.position.y = Math.sin(t * 0.5) * 0.5 + 3; // Float range
//       group.current.rotation.z = Math.sin(t * 0.2) * 0.1; // Gentle sway
//       group.current.rotation.y += 0.005; // Slow spin
      
//       // Limb movement (Spacewalking)
//       if (leftArm.current) leftArm.current.rotation.x = Math.sin(t * 0.5) * 0.3 - 0.5;
//       if (rightArm.current) rightArm.current.rotation.x = Math.cos(t * 0.5) * 0.3 - 0.5;
//       if (leftLeg.current) leftLeg.current.rotation.x = Math.cos(t * 0.5) * 0.2 + 0.2;
//       if (rightLeg.current) rightLeg.current.rotation.x = Math.sin(t * 0.5) * 0.2 + 0.2;
//     }
//   });

//   const suitMaterial = <meshStandardMaterial color="#eeeeee" roughness={0.6} metalness={0.1} />;
  
//   return (
//     <group ref={group} position={[-5, 3, 4]} rotation={[0.5, 0.5, 0]} scale={0.8}>
//       {/* Self-illumination for visibility */}
//       <pointLight position={[2, 2, 5]} intensity={3} distance={10} color="#ffffff" />
      
//       {/* --- Torso --- */}
//       <mesh position={[0, 0, 0]}>
//         <boxGeometry args={[1, 1.5, 0.8]} />
//         {suitMaterial}
//       </mesh>
//       {/* Chest Control Box */}
//       <mesh position={[0, 0.2, 0.45]}>
//         <boxGeometry args={[0.6, 0.4, 0.2]} />
//         <meshStandardMaterial color="#dddddd" roughness={0.4} metalness={0.3} />
//       </mesh>
      
//       {/* --- Head --- */}
//       <group position={[0, 1.1, 0]}>
//         <mesh>
//           <sphereGeometry args={[0.6, 32, 32]} />
//           {suitMaterial}
//         </mesh>
//         {/* Visor (Gold Reflection) */}
//         <mesh position={[0, 0.05, 0.35]}>
//           <sphereGeometry args={[0.45, 32, 32]} />
//           <meshStandardMaterial 
//             color="#ffd700" 
//             roughness={0.1} 
//             metalness={1.0} 
//             envMapIntensity={2}
//           />
//         </mesh>
//       </group>

//       {/* --- Backpack (PLSS) --- */}
//       <group position={[0, 0.2, -0.6]}>
//         <mesh>
//           <boxGeometry args={[1.2, 1.8, 0.5]} />
//           {suitMaterial}
//         </mesh>
//         {/* Details */}
//         <mesh position={[0.4, 0.5, 0.3]}>
//            <cylinderGeometry args={[0.1, 0.1, 0.6]} />
//            <meshStandardMaterial color="#999" />
//         </mesh>
//       </group>

//       {/* --- Left Arm --- */}
//       <group ref={leftArm} position={[-0.6, 0.6, 0]}>
//         <mesh position={[0, 0, 0]}>
//           <sphereGeometry args={[0.25]} />
//           {suitMaterial}
//         </mesh>
//         <mesh position={[-0.2, -0.3, 0]} rotation={[0, 0, 0.5]}>
//           <cylinderGeometry args={[0.15, 0.15, 0.6]} />
//           {suitMaterial}
//         </mesh>
//         <mesh position={[-0.35, -0.7, 0]}>
//           <sphereGeometry args={[0.2]} />
//           {suitMaterial}
//         </mesh>
//         <mesh position={[-0.4, -1.0, 0]} rotation={[0, 0, 0.5]}>
//           <cylinderGeometry args={[0.12, 0.12, 0.6]} />
//           {suitMaterial}
//         </mesh>
//         <mesh position={[-0.45, -1.4, 0]}>
//            <boxGeometry args={[0.2, 0.3, 0.2]} />
//            <meshStandardMaterial color="#aaaaaa" roughness={0.5} />
//         </mesh>
//       </group>

//       {/* --- Right Arm --- */}
//       <group ref={rightArm} position={[0.6, 0.6, 0]}>
//         <mesh position={[0, 0, 0]}>
//           <sphereGeometry args={[0.25]} />
//           {suitMaterial}
//         </mesh>
//         <mesh position={[0.2, -0.3, 0]} rotation={[0, 0, -0.5]}>
//           <cylinderGeometry args={[0.15, 0.15, 0.6]} />
//           {suitMaterial}
//         </mesh>
//         <mesh position={[0.35, -0.7, 0]}>
//           <sphereGeometry args={[0.2]} />
//           {suitMaterial}
//         </mesh>
//         <mesh position={[0.4, -1.0, 0]} rotation={[0, 0, -0.5]}>
//           <cylinderGeometry args={[0.12, 0.12, 0.6]} />
//           {suitMaterial}
//         </mesh>
//         <mesh position={[0.45, -1.4, 0]}>
//            <boxGeometry args={[0.2, 0.3, 0.2]} />
//            <meshStandardMaterial color="#aaaaaa" roughness={0.5} />
//         </mesh>
//       </group>

//       {/* --- Left Leg --- */}
//       <group ref={leftLeg} position={[-0.3, -0.8, 0]}>
//          <mesh position={[0, 0, 0]}>
//           <sphereGeometry args={[0.25]} />
//           {suitMaterial}
//         </mesh>
//         <mesh position={[0, -0.4, 0]}>
//           <cylinderGeometry args={[0.2, 0.2, 0.8]} />
//           {suitMaterial}
//         </mesh>
//          <mesh position={[0, -0.9, 0]}>
//           <sphereGeometry args={[0.22]} />
//           {suitMaterial}
//         </mesh>
//         <mesh position={[0, -1.4, 0]}>
//           <cylinderGeometry args={[0.18, 0.18, 0.8]} />
//           {suitMaterial}
//         </mesh>
//         <mesh position={[0, -1.9, 0.1]}>
//            <boxGeometry args={[0.25, 0.2, 0.4]} />
//            <meshStandardMaterial color="#aaaaaa" roughness={0.5} />
//         </mesh>
//       </group>

//       {/* --- Right Leg --- */}
//       <group ref={rightLeg} position={[0.3, -0.8, 0]}>
//          <mesh position={[0, 0, 0]}>
//           <sphereGeometry args={[0.25]} />
//           {suitMaterial}
//         </mesh>
//         <mesh position={[0, -0.4, 0]}>
//           <cylinderGeometry args={[0.2, 0.2, 0.8]} />
//           {suitMaterial}
//         </mesh>
//          <mesh position={[0, -0.9, 0]}>
//           <sphereGeometry args={[0.22]} />
//           {suitMaterial}
//         </mesh>
//         <mesh position={[0, -1.4, 0]}>
//           <cylinderGeometry args={[0.18, 0.18, 0.8]} />
//           {suitMaterial}
//         </mesh>
//         <mesh position={[0, -1.9, 0.1]}>
//            <boxGeometry args={[0.25, 0.2, 0.4]} />
//            <meshStandardMaterial color="#aaaaaa" roughness={0.5} />
//         </mesh>
//       </group>

//     </group>
//   );
// }

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

// Optimized Particles - Floating Stardust
const Particles = memo(({ count = 10000 }: { count?: number }) => {
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
    <group position={[15, 8, -20]}> {/* Further away to reduce perspective distortion */}
      {/* 1. Core - Solid 3D Sphere with Volumetric Shader */}
      <Sphere args={[5, 64, 64]}> 
        {/* @ts-ignore */}
        <sunMaterial 
          ref={sunMatRef}
        />
      </Sphere>
      
      {/* 2. Outer Glow (Removed as requested) */}
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
        
        <Particles count={10000} />
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
