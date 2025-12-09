import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Color, AdditiveBlending, ShaderMaterial, Vector3, BufferAttribute, BufferGeometry, Points } from 'three';
import { PLANETS } from '../constants';

const SUN_CONFIG = PLANETS[0];

// --- Shaders for Corona ---
const coronaVertexShader = `
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const coronaFragmentShader = `
varying vec3 vNormal;
varying vec3 vPosition;
uniform float uTime;
uniform vec3 uColor;

// Simplex noise function (simplified)
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) {
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 = v - i + dot(i, C.xxx) ;
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
  vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y
  i = mod289(i);
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
  float n_ = 0.142857142857; // 1.0/7.0
  vec3  ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                dot(p2,x2), dot(p3,x3) ) );
}

void main() {
  // Fresnel glow
  float intensity = pow(0.6 - dot(vNormal, vec3(0, 0, 1.0)), 2.5);
  
  // Dynamic noise for surface turbulence
  float noise = snoise(vPosition * 0.4 + uTime * 0.5) * 0.3;
  
  vec3 finalColor = uColor * (intensity + noise + 0.5);
  gl_FragColor = vec4(finalColor, 0.8 * intensity);
}
`;

// --- Shaders for Solar Flares (Particles) ---
const flareVertexShader = `
uniform float uTime;
attribute float size;
attribute float speed;
attribute vec3 direction;
attribute float phase;

varying float vAlpha;

void main() {
  // Animate position along direction vector
  // Cycle repeats
  float t = mod(uTime * speed + phase, 1.0); 
  
  // Easing: Start fast, slow down
  vec3 newPos = position + direction * (t * 5.0); 
  
  // Fade out as it gets further
  vAlpha = 1.0 - t; 

  vec4 mvPosition = modelViewMatrix * vec4(newPos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  
  // Scale by perspective
  gl_PointSize = size * (300.0 / -mvPosition.z);
}
`;

const flareFragmentShader = `
uniform vec3 uColor;
varying float vAlpha;

void main() {
  // Circular particle
  float r = distance(gl_PointCoord, vec2(0.5));
  if (r > 0.5) discard;
  
  // Soft glow edge
  float glow = 1.0 - (r * 2.0);
  glow = pow(glow, 1.5);

  gl_FragColor = vec4(uColor, vAlpha * glow);
}
`;

const SolarFlares = () => {
    const particlesRef = useRef<Points>(null);
    const count = 300; // Number of flare particles

    const { positions, directions, sizes, speeds, phases } = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const directions = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        const speeds = new Float32Array(count);
        const phases = new Float32Array(count);

        const r = SUN_CONFIG.radius;

        for (let i = 0; i < count; i++) {
            // Spawn point on surface (random spherical)
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);
            
            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            // Direction is normal to surface (outwards)
            const v = new Vector3(x, y, z).normalize();
            directions[i * 3] = v.x;
            directions[i * 3 + 1] = v.y;
            directions[i * 3 + 2] = v.z;

            sizes[i] = Math.random() * 2 + 1;
            speeds[i] = Math.random() * 0.5 + 0.2;
            phases[i] = Math.random();
        }

        return { positions, directions, sizes, speeds, phases };
    }, []);

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uColor: { value: new Color(0xffaa00) } // Orange/Gold
    }), []);

    useFrame((state) => {
        if (particlesRef.current) {
            const mat = particlesRef.current.material as ShaderMaterial;
            // Robust null check for material uniforms using optional chaining
            if (mat?.uniforms?.uTime) {
                mat.uniforms.uTime.value = state.clock.getElapsedTime();
            }
        }
    });

    return (
        <points ref={particlesRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
                <bufferAttribute attach="attributes-direction" count={count} array={directions} itemSize={3} />
                <bufferAttribute attach="attributes-size" count={count} array={sizes} itemSize={1} />
                <bufferAttribute attach="attributes-speed" count={count} array={speeds} itemSize={1} />
                <bufferAttribute attach="attributes-phase" count={count} array={phases} itemSize={1} />
            </bufferGeometry>
            <shaderMaterial 
                vertexShader={flareVertexShader}
                fragmentShader={flareFragmentShader}
                uniforms={uniforms}
                transparent
                depthWrite={false}
                blending={AdditiveBlending}
            />
        </points>
    );
};

export const Sun = () => {
  const meshRef = useRef<Mesh>(null);
  const coronaRef = useRef<Mesh>(null);
  
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColor: { value: new Color("#ff8800") }
  }), []);

  useFrame((state) => {
    // Rotate core
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
    }

    // Update corona shader
    if (coronaRef.current) {
        const mat = coronaRef.current.material as ShaderMaterial;
        // Robust null check for material uniforms using optional chaining
        if (mat?.uniforms?.uTime) {
            mat.uniforms.uTime.value = state.clock.getElapsedTime();
        }
    }
  });

  return (
    <group>
        {/* Core Sun Body */}
        <mesh ref={meshRef}>
            <sphereGeometry args={[SUN_CONFIG.radius, 64, 64]} />
            <meshBasicMaterial color="#ffdd00" />
        </mesh>

        {/* Dynamic Corona / Atmosphere */}
        <mesh ref={coronaRef} scale={[1.2, 1.2, 1.2]}>
            <sphereGeometry args={[SUN_CONFIG.radius, 64, 64]} />
            <shaderMaterial 
                vertexShader={coronaVertexShader}
                fragmentShader={coronaFragmentShader}
                uniforms={uniforms}
                transparent
                side={2} // DoubleSide
                blending={AdditiveBlending}
                depthWrite={false}
            />
        </mesh>
        
        {/* Particle System for Solar Flares */}
        <SolarFlares />

        {/* Light Source */}
        <pointLight intensity={3} distance={500} decay={1} color="#ffeedd" />
        <ambientLight intensity={0.4} /> 
    </group>
  );
};
