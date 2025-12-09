import React, { Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { Vector3 } from 'three';
import { PlanetMesh } from './Planets';
import { Sun } from './Sun';
import { PLANETS } from '../constants';

interface SceneProps {
  activePlanetIndex: number;
  zoomLevel: number;
  speedMultiplier: number;
  isOverview: boolean;
}

const CameraRig: React.FC<SceneProps> = ({ activePlanetIndex, zoomLevel, isOverview }) => {
  const { camera, scene } = useThree();
  
  useFrame(({ clock }) => {
    let targetPos = new Vector3(0, 0, 0);
    let camPos = new Vector3(0, 100, 150); // Default overview position

    if (!isOverview) {
      // Focus on active planet
      const targetObj = scene.getObjectByName(`planet-${activePlanetIndex}`);
      
      if (targetObj) {
        targetObj.getWorldPosition(targetPos);
        
        // Calculate desired camera position relative to the planet
        // Zoom logic
        const distOffset = zoomLevel === 2 ? 3 : (zoomLevel === 0.5 ? 20 : 8);
        const heightOffset = zoomLevel === 2 ? 1 : 5;
        
        camPos = new Vector3(
          targetPos.x, 
          targetPos.y + heightOffset, 
          targetPos.z + distOffset
        );
      }
    } else {
      // Overview Mode: High angle, looking at center
      camPos = new Vector3(0, 90, 140);
      targetPos = new Vector3(0, 0, 0);
    }

    // Lerp Camera Position for smoothness
    camera.position.lerp(camPos, 0.04);
    
    // Look at target (smoothness handled by frame loop, though lookAt is instant, the position lerp makes it feel smooth)
    // We can't easily lerp lookAt without Quaternion slerp, but this is usually sufficient
    camera.lookAt(targetPos); 
  });

  return null;
};

export const Scene3D: React.FC<SceneProps> = ({ activePlanetIndex, zoomLevel, speedMultiplier, isOverview }) => {
  return (
    <Canvas camera={{ position: [0, 90, 140], fov: 60 }} dpr={[1, 2]}>
      <color attach="background" args={['#050510']} />
      
      {/* Lights - Ambient slightly increased as Sun now has internal light, but we need general scene fill */}
      <ambientLight intensity={0.1} />
      
      <Suspense fallback={null}>
        <Stars radius={200} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <CameraRig 
          activePlanetIndex={activePlanetIndex} 
          zoomLevel={zoomLevel} 
          speedMultiplier={speedMultiplier} 
          isOverview={isOverview}
        />
        
        {/* Render Sun */}
        <Sun />
        
        {/* Render Planets (Skipping index 0 which is Sun) */}
        {PLANETS.map((_, index) => {
            if (index === 0) return null;
            return (
                <PlanetMesh 
                    key={index} 
                    planetIndex={index} 
                    speedMultiplier={speedMultiplier}
                    isSelected={activePlanetIndex === index}
                />
            );
        })}
      </Suspense>
    </Canvas>
  );
};