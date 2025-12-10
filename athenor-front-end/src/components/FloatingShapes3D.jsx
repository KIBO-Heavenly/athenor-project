import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, MeshWobbleMaterial, Sphere, Box, Torus, Icosahedron, Octahedron } from '@react-three/drei';
import * as THREE from 'three';

// Animated floating sphere with distortion
function FloatingSphere({ position, color, speed = 1, distort = 0.3, size = 1 }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2 * speed;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3 * speed;
    }
  });

  return (
    <Float speed={2 * speed} rotationIntensity={1} floatIntensity={2}>
      <Sphere ref={meshRef} args={[size, 64, 64]} position={position}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={distort}
          speed={2}
          roughness={0.2}
          metalness={0.8}
          transparent
          opacity={0.7}
        />
      </Sphere>
    </Float>
  );
}

// Animated torus with wobble effect
function FloatingTorus({ position, color, speed = 1, size = 1 }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.4 * speed;
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.2 * speed;
    }
  });

  return (
    <Float speed={1.5 * speed} rotationIntensity={2} floatIntensity={1.5}>
      <Torus ref={meshRef} args={[size, size * 0.4, 32, 64]} position={position}>
        <MeshWobbleMaterial
          color={color}
          attach="material"
          factor={0.3}
          speed={2}
          roughness={0.3}
          metalness={0.7}
          transparent
          opacity={0.6}
        />
      </Torus>
    </Float>
  );
}

// Animated icosahedron (20-sided polyhedron)
function FloatingIcosahedron({ position, color, speed = 1, size = 1 }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.3 * speed;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5 * speed;
    }
  });

  return (
    <Float speed={2.5 * speed} rotationIntensity={1.5} floatIntensity={2}>
      <Icosahedron ref={meshRef} args={[size, 0]} position={position}>
        <meshStandardMaterial
          color={color}
          attach="material"
          roughness={0.2}
          metalness={0.9}
          transparent
          opacity={0.65}
          wireframe={false}
        />
      </Icosahedron>
    </Float>
  );
}

// Animated octahedron
function FloatingOctahedron({ position, color, speed = 1, size = 1 }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.6 * speed;
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.2 * speed;
    }
  });

  return (
    <Float speed={1.8 * speed} rotationIntensity={1} floatIntensity={1.8}>
      <Octahedron ref={meshRef} args={[size, 0]} position={position}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={0.2}
          speed={3}
          roughness={0.1}
          metalness={0.95}
          transparent
          opacity={0.55}
        />
      </Octahedron>
    </Float>
  );
}

// Floating animated box
function FloatingBox({ position, color, speed = 1, size = 1 }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.25 * speed;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.35 * speed;
    }
  });

  return (
    <Float speed={2 * speed} rotationIntensity={1.2} floatIntensity={1.5}>
      <Box ref={meshRef} args={[size, size, size]} position={position}>
        <MeshWobbleMaterial
          color={color}
          attach="material"
          factor={0.15}
          speed={1.5}
          roughness={0.25}
          metalness={0.85}
          transparent
          opacity={0.6}
        />
      </Box>
    </Float>
  );
}

// Particle field background
function ParticleField({ count = 100, isDarkMode }) {
  const points = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    return positions;
  }, [count]);

  const ref = useRef();
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.02;
      ref.current.rotation.x = state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={points}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color={isDarkMode ? '#10b981' : '#06b6d4'}
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

// Main 3D Background Component
export default function FloatingShapes3D({ isDarkMode, variant = 'default' }) {
  // Color schemes based on dark mode
  const colors = isDarkMode
    ? {
        primary: '#10b981',    // emerald
        secondary: '#06b6d4',  // cyan
        accent: '#8b5cf6',     // violet
        highlight: '#f59e0b',  // amber
      }
    : {
        primary: '#3b82f6',    // blue
        secondary: '#06b6d4',  // cyan
        accent: '#10b981',     // emerald
        highlight: '#8b5cf6',  // violet
      };

  // Different shape configurations for different pages
  const getShapeConfig = () => {
    switch (variant) {
      case 'login':
        return (
          <>
            <FloatingSphere position={[-3, 2, -5]} color={colors.primary} speed={0.8} distort={0.4} size={1.2} />
            <FloatingTorus position={[3, -1, -6]} color={colors.secondary} speed={1} size={0.8} />
            <FloatingIcosahedron position={[0, 3, -8]} color={colors.accent} speed={0.6} size={0.9} />
            <FloatingOctahedron position={[-2, -2, -4]} color={colors.highlight} speed={0.9} size={0.7} />
            <ParticleField count={80} isDarkMode={isDarkMode} />
          </>
        );
      case 'dashboard':
        return (
          <>
            <FloatingSphere position={[-4, 1, -6]} color={colors.primary} speed={0.7} distort={0.3} size={1.5} />
            <FloatingTorus position={[4, 2, -7]} color={colors.secondary} speed={0.9} size={1} />
            <FloatingBox position={[-2, -2, -5]} color={colors.accent} speed={0.5} size={0.9} />
            <FloatingIcosahedron position={[2, -1, -8]} color={colors.highlight} speed={0.8} size={1.1} />
            <FloatingOctahedron position={[0, 3, -6]} color={colors.primary} speed={0.6} size={0.8} />
            <ParticleField count={120} isDarkMode={isDarkMode} />
          </>
        );
      case 'schedule':
        return (
          <>
            <FloatingTorus position={[-3, 0, -5]} color={colors.primary} speed={1.1} size={1.2} />
            <FloatingSphere position={[3, 2, -7]} color={colors.secondary} speed={0.6} distort={0.25} size={1} />
            <FloatingIcosahedron position={[-1, -2, -6]} color={colors.accent} speed={0.7} size={0.8} />
            <ParticleField count={60} isDarkMode={isDarkMode} />
          </>
        );
      default:
        return (
          <>
            <FloatingSphere position={[-3, 1, -5]} color={colors.primary} speed={0.8} distort={0.35} size={1.3} />
            <FloatingTorus position={[3, -1, -6]} color={colors.secondary} speed={1} size={0.9} />
            <FloatingBox position={[0, 2, -7]} color={colors.accent} speed={0.6} size={0.8} />
            <FloatingOctahedron position={[-2, -2, -4]} color={colors.highlight} speed={0.7} size={0.6} />
            <ParticleField count={100} isDarkMode={isDarkMode} />
          </>
        );
    }
  };

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        style={{ background: 'transparent' }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color={colors.primary} />
        <pointLight position={[10, -10, 5]} intensity={0.3} color={colors.secondary} />
        {getShapeConfig()}
      </Canvas>
    </div>
  );
}
