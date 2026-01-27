"use client";

import { useRef, useMemo, memo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Stars, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Optimized Particles
const Particles = memo(({ count = 2000 }: { count?: number }) => {
  const points = useRef<THREE.Points>(null);

  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = THREE.MathUtils.randFloatSpread(360); 
      const phi = THREE.MathUtils.randFloatSpread(360); 
      const distance = 5 + Math.random() * 5; 
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
      points.current.rotation.y += 0.0005;
      points.current.rotation.x += 0.0002;
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
        color="#6366f1"
        size={0.015}
        sizeAttenuation
        transparent
        opacity={0.4}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
});

Particles.displayName = 'Particles';

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

// Real Earth with Manual Texture Loading
function Earth() {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  
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
      
      // Check if critical textures loaded
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
      {/* 1. Atmosphere Glow (Natural) */}
      <Sphere args={[2.35, 64, 64]}>
        <meshPhongMaterial 
          color="#0044ff"
          transparent 
          opacity={0.15} 
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </Sphere>

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

export default function WorldGlobe() {
  return (
    <div className="w-full h-full cursor-move">
      <Canvas 
        camera={{ position: [0, 0, 9], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.2} /> {/* Natural dark space ambient */}
        <directionalLight position={[10, 5, 5]} intensity={3} color="#ffffff" /> {/* Bright Sun */}
        <pointLight position={[-10, -5, -5]} intensity={0.5} color="#ffffff" /> {/* Subtle fill */}
        
        <Earth />
        <Particles count={1000} />
        <StarField />
        
        <OrbitControls 
          enableZoom={true}
          enablePan={false} 
          enableRotate={true}
          autoRotate 
          autoRotateSpeed={0.5}
          minDistance={6}
          maxDistance={15}
        />
      </Canvas>
    </div>
  );
}
