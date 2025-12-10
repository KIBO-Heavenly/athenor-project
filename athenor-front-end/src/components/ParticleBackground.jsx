import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useDarkMode } from '../DarkModeContext';

// 3D Particle system
function Particles({ count = 200, isDarkMode }) {
  const mesh = useRef();
  const [positions] = useState(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  });

  const [velocities] = useState(() => {
    const vel = [];
    for (let i = 0; i < count; i++) {
      vel.push({
        x: (Math.random() - 0.5) * 0.01,
        y: (Math.random() - 0.5) * 0.01 + 0.005,
        z: (Math.random() - 0.5) * 0.005,
      });
    }
    return vel;
  });

  useFrame((state) => {
    if (mesh.current) {
      const positions = mesh.current.geometry.attributes.position.array;
      for (let i = 0; i < count; i++) {
        positions[i * 3] += velocities[i].x;
        positions[i * 3 + 1] += velocities[i].y;
        positions[i * 3 + 2] += velocities[i].z;

        // Reset particles that go too far
        if (positions[i * 3 + 1] > 10) {
          positions[i * 3 + 1] = -10;
          positions[i * 3] = (Math.random() - 0.5) * 20;
        }
        if (Math.abs(positions[i * 3]) > 10) {
          positions[i * 3] = -positions[i * 3] * 0.9;
        }
      }
      mesh.current.geometry.attributes.position.needsUpdate = true;
      mesh.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color={isDarkMode ? '#10b981' : '#06b6d4'}
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Floating orb with glow
function GlowingOrb({ position, color, size = 1 }) {
  const mesh = useRef();
  
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.5;
      mesh.current.position.x = position[0] + Math.cos(state.clock.elapsedTime * 0.3) * 0.3;
    }
  });

  return (
    <mesh ref={mesh} position={position}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.5}
        transparent
        opacity={0.6}
        roughness={0.2}
        metalness={0.8}
      />
    </mesh>
  );
}

// Main 3D Background Component
function ThreeScene({ isDarkMode }) {
  const colors = isDarkMode
    ? { primary: '#10b981', secondary: '#06b6d4', accent: '#8b5cf6' }
    : { primary: '#3b82f6', secondary: '#06b6d4', accent: '#10b981' };

  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 60 }}
      style={{ background: 'transparent' }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.5} color={colors.primary} />
      <pointLight position={[-10, -10, -10]} intensity={0.3} color={colors.secondary} />
      
      <Particles count={150} isDarkMode={isDarkMode} />
      
      <GlowingOrb position={[-4, 2, -3]} color={colors.primary} size={0.8} />
      <GlowingOrb position={[4, -1, -4]} color={colors.secondary} size={0.6} />
      <GlowingOrb position={[0, 3, -5]} color={colors.accent} size={0.5} />
      <GlowingOrb position={[-3, -2, -2]} color={colors.secondary} size={0.4} />
      <GlowingOrb position={[3, 1, -6]} color={colors.primary} size={0.7} />
    </Canvas>
  );
}

// CSS Particle fallback (always visible)
function CSSParticles({ isDarkMode }) {
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: Math.random() * 6 + 2,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className={`absolute rounded-full ${
            isDarkMode ? 'bg-emerald-400' : 'bg-cyan-400'
          }`}
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: 0.4,
            animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

// Combined background with both 3D and CSS particles
export default function ParticleBackground({ isDarkMode }) {
  const [show3D, setShow3D] = useState(true);
  const { disableEffects } = useDarkMode();

  useEffect(() => {
    // Check if WebGL is available
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      setShow3D(!!gl);
    } catch (e) {
      setShow3D(false);
    }
  }, []);

  // If effects are disabled, just show a simple gradient background
  if (disableEffects) {
    return (
      <div className="fixed inset-0 overflow-hidden" style={{ zIndex: -1 }}>
        <div 
          className={`absolute inset-0 ${
            isDarkMode 
              ? 'bg-gray-900' 
              : 'bg-gradient-to-b from-blue-50 via-cyan-50 to-emerald-50'
          }`}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ zIndex: -1 }}>
      {/* Gradient overlay */}
      <div 
        className={`absolute inset-0 ${
          isDarkMode 
            ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
            : 'bg-gradient-to-br from-blue-50 via-cyan-50 to-emerald-50'
        }`}
      />
      
      {/* CSS Particles (always show) */}
      <CSSParticles isDarkMode={isDarkMode} />
      
      {/* 3D Scene */}
      {show3D && (
        <div className="absolute inset-0">
          <ThreeScene isDarkMode={isDarkMode} />
        </div>
      )}
    </div>
  );
}
