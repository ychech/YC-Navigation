"use client";

import { useRef, useMemo, memo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Stars, useTexture, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const Particles = memo(({ count = 4000 }: { count?: number }) => {
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
        color="#6366f1"
        size={0.012}
        sizeAttenuation
        transparent
        opacity={0.3}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
});

Particles.displayName = 'Particles';

function Earth() {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  
  // High quality textures (2K resolution)
  const [colorMap, normalMap, specularMap, cloudsMap] = useTexture([
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png'
  ]);

  useFrame(() => {
    if (earthRef.current) earthRef.current.rotation.y += 0.0008;
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += 0.001;
      cloudsRef.current.rotation.z += 0.0001;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 8]}>
      {/* Atmosphere Glow Layer - Indigo/Blue */}
      <Sphere args={[2.35, 64, 64]}>
        <meshPhongMaterial 
          color="#4f46e5"
          transparent 
          opacity={0.12} 
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </Sphere>

      {/* Main Earth Body */}
      <Sphere ref={earthRef} args={[2.2, 64, 64]}>
        <meshPhongMaterial
          map={colorMap}
          normalMap={normalMap}
          specularMap={specularMap}
          shininess={10}
        />
      </Sphere>

      {/* Clouds Layer */}
      <Sphere ref={cloudsRef} args={[2.22, 64, 64]}>
        <meshPhongMaterial
          map={cloudsMap}
          transparent
          opacity={0.35}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Sphere>

      {/* Digital Grid Overlay - Ultra faint cyan */}
      <Sphere args={[2.26, 40, 40]}>
        <meshBasicMaterial
          color="#6ee7b7"
          wireframe
          transparent
          opacity={0.04}
        />
      </Sphere>
    </group>
  );
}

function StarField() {
  return <Stars radius={100} depth={50} count={6000} factor={4} saturation={0} fade speed={1} />;
}

export default function WorldGlobe() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 9], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 5, 5]} intensity={2.5} color="#ffffff" />
        <pointLight position={[-10, -5, -5]} intensity={1.5} color="#6366f1" />
        
        <Earth />
        <Particles count={4000} />
        <StarField />
        
        <OrbitControls 
          enableZoom={false} 
          enablePan={false} 
          autoRotate 
          autoRotateSpeed={0.3}
        />
      </Canvas>
    </div>
  );
}
