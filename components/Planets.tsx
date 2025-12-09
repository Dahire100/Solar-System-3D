import React, { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Mesh, TextureLoader, CanvasTexture, DoubleSide, Color, ShaderMaterial, BackSide, AdditiveBlending } from 'three';
import { PLANETS } from '../constants';
import { PlanetConfig } from '../services/types';

interface PlanetMeshProps {
  planetIndex?: number;
  config?: PlanetConfig;
  speedMultiplier: number;
  isSelected?: boolean;
  isMoon?: boolean;
}

// --- Procedural Texture Generators ---

// Enhanced Mercury texture with craters
const createMercuryTexture = (baseColor: string) => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Base rocky surface
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 1024, 1024);
    
    // Add surface variation
    for (let i = 0; i < 5000; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 1024;
      const shade = Math.random() * 40 - 20;
      const size = Math.random() * 3;
      ctx.fillStyle = `rgba(140, 120, 83, ${0.3 + Math.random() * 0.3})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Add craters
    for (let i = 0; i < 150; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 1024;
      const radius = 10 + Math.random() * 40;
      
      // Crater rim
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, 'rgba(100, 90, 70, 0.4)');
      gradient.addColorStop(0.7, 'rgba(80, 70, 50, 0.6)');
      gradient.addColorStop(1, 'rgba(60, 50, 40, 0.3)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  return new CanvasTexture(canvas);
};

// Enhanced Venus texture with swirling clouds
const createVenusTexture = (baseColor: string) => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Base sulfuric atmosphere
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 1024, 1024);
    
    // Create swirling cloud patterns
    const colors = ['#FFC649', '#FFD87A', '#FFE4A0', '#F5B342', '#E8A53A'];
    
    for (let layer = 0; layer < 3; layer++) {
      for (let i = 0; i < 1024; i++) {
        const yNorm = i / 1024;
        const swirl = Math.sin(yNorm * Math.PI * 8 + layer) * 30;
        const colorIdx = Math.floor((yNorm + layer * 0.2) * colors.length) % colors.length;
        
        ctx.globalAlpha = 0.3 + Math.random() * 0.2;
        ctx.strokeStyle = colors[colorIdx];
        ctx.lineWidth = 2 + Math.random();
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.quadraticCurveTo(512 + swirl, i, 1024, i + Math.random() * 5 - 2.5);
        ctx.stroke();
      }
    }
    
    // Add atmospheric vortices
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 1024;
      const radius = 30 + Math.random() * 60;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, 'rgba(255, 230, 160, 0.3)');
      gradient.addColorStop(1, 'rgba(255, 198, 73, 0)');
      ctx.fillStyle = gradient;
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  return new CanvasTexture(canvas);
};

// Enhanced Mars texture with polar caps and features
const createMarsTexture = (baseColor: string) => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Base red/orange surface
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 1024, 1024);
    
    // Add varied terrain colors
    const terrainColors = ['#CD5C5C', '#B85450', '#A04844', '#D87060', '#C86858'];
    for (let i = 0; i < 8000; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 1024;
      const color = terrainColors[Math.floor(Math.random() * terrainColors.length)];
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.3 + Math.random() * 0.3;
      ctx.beginPath();
      ctx.arc(x, y, 2 + Math.random() * 3, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Polar ice caps
    const polarGradient1 = ctx.createRadialGradient(512, 50, 0, 512, 50, 150);
    polarGradient1.addColorStop(0, 'rgba(255, 250, 250, 0.8)');
    polarGradient1.addColorStop(1, 'rgba(255, 250, 250, 0)');
    ctx.fillStyle = polarGradient1;
    ctx.globalAlpha = 0.7;
    ctx.fillRect(0, 0, 1024, 150);
    
    const polarGradient2 = ctx.createRadialGradient(512, 974, 0, 512, 974, 150);
    polarGradient2.addColorStop(0, 'rgba(255, 250, 250, 0.8)');
    polarGradient2.addColorStop(1, 'rgba(255, 250, 250, 0)');
    ctx.fillStyle = polarGradient2;
    ctx.fillRect(0, 874, 1024, 150);
    
    // Olympus Mons and Valles Marineris-like features
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = 'rgba(160, 72, 68, 0.6)';
    ctx.beginPath();
    ctx.arc(700, 400, 80, 0, Math.PI * 2);
    ctx.fill();
  }
  return new CanvasTexture(canvas);
};

const createJupiterTexture = (baseColor: string) => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Fill background
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 1024, 1024);

    const colors = ["#C88B3A", "#B87D32", "#A67028", "#D4984A", "#E5A860", "#8F6226"];
    
    // Generate turbulent bands with more variation
    for (let i = 0; i < 1024; i++) {
        const yNorm = i / 1024;
        const bandIndex = Math.floor(yNorm * 25); // More bands
        
        const colorIdx = (bandIndex % colors.length);
        const color = colors[colorIdx];
        
        ctx.fillStyle = color;
        
        // Multiple sine waves for turbulence
        const amplitude1 = 40 * Math.sin(yNorm * Math.PI * 2);
        const amplitude2 = 20 * Math.sin(yNorm * Math.PI * 5);
        const frequency = 0.015;
        const shift = Math.sin(i * frequency) * (amplitude1 + amplitude2);
        
        ctx.globalAlpha = 0.7 + Math.random() * 0.3;
        
        // Wavy horizontal lines
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(1024, i);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }

    // Great Red Spot with better definition
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.ellipse(650, 650, 140, 80, 0.1, 0, Math.PI * 2);
    ctx.fillStyle = "#A84A3A";
    ctx.fill();
    
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.ellipse(650, 650, 120, 70, 0.1, 0, Math.PI * 2);
    ctx.fillStyle = "#C85C48";
    ctx.fill();
    
    // Inner vortex
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.ellipse(650, 650, 90, 50, 0.1, 0, Math.PI * 2);
    ctx.fillStyle = "#D87060";
    ctx.fill();
  }
  return new CanvasTexture(canvas);
};

const createSaturnRingTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        const centerX = 256;
        const centerY = 256;
        const outerRadius = 256;
        
        // Clear
        ctx.clearRect(0, 0, 512, 512);

        // Draw hundreds of thin rings to simulate "ringlets"
        for (let r = 100; r < outerRadius; r += 0.5) {
             const dist = (r - 100) / (outerRadius - 100); // 0 to 1
             
             // Base Alpha pattern (Cassini division around 0.7)
             let alpha = 0.8;
             if (dist > 0.65 && dist < 0.72) alpha = 0.05; // Cassini division
             else if (dist < 0.1) alpha = 0.2; // Inner faint ring
             
             // Add high frequency noise to alpha for texture
             alpha *= 0.5 + Math.random() * 0.5;
             
             // Color variation - more beige/tan tones
             const colorVal = Math.floor(220 + Math.random() * 35);
             const color = `rgba(${colorVal}, ${colorVal - 25}, ${colorVal - 50}, ${alpha})`;

             ctx.beginPath();
             ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
             ctx.strokeStyle = color;
             ctx.lineWidth = 0.7; // Overlap slightly
             ctx.stroke();
        }
    }
    const tex = new CanvasTexture(canvas);
    tex.rotation = -Math.PI / 2;
    return tex;
}

// Enhanced Saturn texture with subtle bands
const createSaturnTexture = (baseColor: string) => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 1024, 1024);
    
    const colors = ['#FAD5A5', '#F0C896', '#E6BC87', '#DDB078', '#F5E0B8'];
    
    // Subtle horizontal bands
    for (let i = 0; i < 1024; i++) {
      const yNorm = i / 1024;
      const bandIndex = Math.floor(yNorm * 30);
      const colorIdx = bandIndex % colors.length;
      
      ctx.strokeStyle = colors[colorIdx];
      ctx.globalAlpha = 0.5 + Math.random() * 0.3;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(1024, i);
      ctx.stroke();
    }
  }
  return new CanvasTexture(canvas);
};

// Uranus - icy blue with subtle features
const createUranusTexture = (baseColor: string) => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 1024, 1024);
    
    // Add subtle icy texture
    for (let i = 0; i < 3000; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 1024;
      ctx.fillStyle = `rgba(79, 208, 231, ${0.1 + Math.random() * 0.2})`;
      ctx.beginPath();
      ctx.arc(x, y, 1 + Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Very faint bands
    const colors = ['#4FD0E7', '#5DD8EF', '#6BE0F7', '#45C8DF'];
    for (let i = 0; i < 1024; i += 2) {
      const colorIdx = Math.floor((i / 1024) * colors.length) % colors.length;
      ctx.strokeStyle = colors[colorIdx];
      ctx.globalAlpha = 0.15;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(1024, i);
      ctx.stroke();
    }
  }
  return new CanvasTexture(canvas);
};

// Neptune - deep blue with storm features
const createNeptuneTexture = (baseColor: string) => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 1024, 1024);
    
    // Dynamic swirling bands
    const colors = ['#4169E1', '#3A5FD8', '#2F4FBF', '#5179EA', '#6189F3'];
    for (let i = 0; i < 1024; i++) {
      const yNorm = i / 1024;
      const swirl = Math.sin(yNorm * Math.PI * 6) * 20;
      const colorIdx = Math.floor(yNorm * colors.length) % colors.length;
      
      ctx.strokeStyle = colors[colorIdx];
      ctx.globalAlpha = 0.6 + Math.random() * 0.2;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.quadraticCurveTo(512 + swirl, i, 1024, i);
      ctx.stroke();
    }
    
    // Great Dark Spot
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.ellipse(600, 500, 100, 70, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#2A3F9F';
    ctx.fill();
  }
  return new CanvasTexture(canvas);
};

// --- Shaders ---

const AtmosphereShader = {
  vertexShader: `
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec3 vNormal;
    void main() {
      // Fresnel effect: higher intensity at the edges
      float intensity = pow(0.7 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
      gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity * 1.5;
    }
  `
};

// --- Sub-components ---

const EarthAssembly: React.FC<{ config: PlanetConfig }> = ({ config }) => {
  // Load both surface and clouds
  // Note: We use ! because this component is only rendered if textureType === 'earth', implying urls exist in constants
  const [colorMap, cloudMap] = useLoader(TextureLoader, [config.textureUrl!, config.cloudTextureUrl!]);

  const cloudsRef = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.02; // Clouds move slightly faster/independent
    }
  });

  return (
    <group>
      {/* 1. Base Earth Sphere */}
      <mesh name="earth-surface">
        <sphereGeometry args={[config.radius, 64, 64]} />
        <meshStandardMaterial 
          map={colorMap} 
          roughness={0.6} 
          metalness={0.1} 
        />
      </mesh>

      {/* 2. Cloud Layer (Slightly larger) */}
      <mesh ref={cloudsRef} name="earth-clouds" scale={[1.01, 1.01, 1.01]}>
        <sphereGeometry args={[config.radius, 64, 64]} />
        <meshStandardMaterial 
          map={cloudMap} 
          transparent 
          opacity={0.8} 
          side={DoubleSide}
          blending={AdditiveBlending}
          depthWrite={false} // Prevents z-fighting with atmosphere
        />
      </mesh>

      {/* 3. Atmosphere Glow (Fresnel Shader) */}
      <mesh name="earth-atmosphere" scale={[1.2, 1.2, 1.2]}>
        <sphereGeometry args={[config.radius, 64, 64]} />
        <shaderMaterial 
          attach="material" 
          args={[AtmosphereShader]} 
          side={BackSide} 
          transparent 
          blending={AdditiveBlending}
        />
      </mesh>
    </group>
  );
};

const TexturedSphere: React.FC<{ config: PlanetConfig }> = ({ config }) => {
  const texture = useLoader(TextureLoader, config.textureUrl!);
  return (
    <meshStandardMaterial 
      map={texture} 
      color="white" 
      roughness={0.8}
      metalness={0.1} 
    />
  );
};

const ProceduralSphere: React.FC<{ config: PlanetConfig }> = ({ config }) => {
  const texture = useMemo(() => {
    switch(config.name) {
      case 'MERCURY': return createMercuryTexture(config.color);
      case 'VENUS': return createVenusTexture(config.color);
      case 'MARS': return createMarsTexture(config.color);
      case 'JUPITER': return createJupiterTexture(config.color);
      case 'SATURN': return createSaturnTexture(config.color);
      case 'URANUS': return createUranusTexture(config.color);
      case 'NEPTUNE': return createNeptuneTexture(config.color);
      default:
        if (config.textureType === 'striped') return createJupiterTexture(config.color);
        return null;
    }
  }, [config.color, config.textureType, config.name]);

  return (
    <meshStandardMaterial 
      map={texture} 
      color={texture ? "white" : config.color}
      roughness={0.6}
      metalness={0.15}
    />
  );
};

const BasicSphere: React.FC<{ config: PlanetConfig }> = ({ config }) => {
  // Use procedural textures for named planets
  if (['MERCURY', 'VENUS', 'MARS', 'JUPITER', 'SATURN', 'URANUS', 'NEPTUNE'].includes(config.name)) {
    return <ProceduralSphere config={config} />;
  }
  
  return (
    <meshStandardMaterial 
      color={config.color} 
      roughness={0.7} 
      metalness={0.2}
      emissive={config.name === 'SUN' ? config.color : undefined}
      emissiveIntensity={config.name === 'SUN' ? 0.8 : 0}
    />
  );
};

const PlanetBody: React.FC<{ config: PlanetConfig }> = ({ config }) => {
  // If Earth, return the complex assembly
  if (config.textureType === 'earth') {
    return <EarthAssembly config={config} />;
  }

  // Otherwise return a single mesh with appropriate material
  return (
    <mesh name="mesh-body">
      <sphereGeometry args={[config.radius, 64, 64]} />
      
      {config.textureUrl && config.textureType === 'moon' ? (
        <TexturedSphere config={config} />
      ) : config.textureType === 'striped' ? (
        <ProceduralSphere config={config} />
      ) : (
        <BasicSphere config={config} />
      )}

      {/* Rings Overlay attached to the body mesh if needed, or handled in parent */}
      {config.textureType === 'ringed' && <SaturnRings config={config} />}
    </mesh>
  );
};

const SaturnRings: React.FC<{ config: PlanetConfig }> = ({ config }) => {
    const texture = useMemo(() => createSaturnRingTexture(), []);
    
    return (
        <mesh rotation={[Math.PI / 2.2, 0, 0]}>
            <ringGeometry args={[config.radius * 1.4, config.radius * 2.5, 128]} />
            <meshStandardMaterial 
                map={texture}
                color={config.ringColor || "#C5B595"} 
                side={DoubleSide} 
                transparent 
                opacity={0.9} 
            />
        </mesh>
    )
}

// --- Main Component ---

export const PlanetMesh: React.FC<PlanetMeshProps> = ({ planetIndex, config: propConfig, speedMultiplier, isSelected, isMoon }) => {
  const meshRef = useRef<Mesh>(null);
  const angleRef = useRef(0);
  
  const config = propConfig || (planetIndex !== undefined ? PLANETS[planetIndex] : null);

  useFrame((state, delta) => {
    if (meshRef.current && config) {
        // Orbit Logic
        const currentSpeed = (config.speed || 0.1) * speedMultiplier;
        angleRef.current += delta * currentSpeed;

        const offset = isMoon ? 0 : (planetIndex || 0) * 2; 
        const effectiveAngle = angleRef.current + offset;

        const distance = config.distance;
        const x = Math.cos(effectiveAngle) * distance;
        const z = Math.sin(effectiveAngle) * distance;

        meshRef.current.position.set(x, 0, z);

        // Self Rotation 
        if (!isMoon) {
           const body = meshRef.current.children.find(c => c.name === "mesh-body" || c.name === "earth-surface" || c.type === "Group");
           if (body) {
             body.rotation.y += delta * (config.rotationSpeed || 0.5);
             if (meshRef.current.children[0]) {
                 meshRef.current.children[0].rotation.y += delta * (config.rotationSpeed || 0.5);
             }
           }
        }

        // Selection Pulse
        if (isSelected && !isMoon) {
            const s = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.02;
            meshRef.current.scale.set(s, s, s);
        } else {
             meshRef.current.scale.set(1, 1, 1);
        }
    }
  });

  if (!config || config.name === "SUN") return null; // Sun is handled separately now

  return (
    <group>
      {/* Orbit Trail */}
      {!isMoon && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[config.distance - 0.15, config.distance + 0.15, 128]} />
            <meshBasicMaterial color="#ffffff" opacity={0.08} transparent side={DoubleSide} />
        </mesh>
      )}

      {/* The Planet Group */}
      <group ref={meshRef} name={!isMoon ? `planet-${planetIndex}` : undefined}>
          
          <PlanetBody config={config} />

          {/* Moons */}
          {config.moons && config.moons.map((moonConfig, idx) => (
             <PlanetMesh 
                key={`moon-${idx}`} 
                config={moonConfig} 
                speedMultiplier={speedMultiplier} 
                isMoon={true}
             />
          ))}
      </group>
    </group>
  );
};