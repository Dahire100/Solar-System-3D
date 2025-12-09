import React, { useEffect, useRef, useState } from 'react';
import { Scene3D } from '../components/Scene3D';
import { UIOverlay } from '../components/UIOverlay';
import { gestureService } from './gestureService';
import { GestureType } from './types';
import { PLANETS, ORBITING_PLANET_INDICES, GESTURE_COOLDOWN_MS } from '../constants';

const App: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // App State - Start at Earth (Index 3)
  const [activePlanetIndex, setActivePlanetIndex] = useState(3);
  const [zoomLevel, setZoomLevel] = useState(1); // 1 = Normal, 2 = Close, 0.5 = Far
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [isOverview, setIsOverview] = useState(false);
  const [lastGesture, setLastGesture] = useState<GestureType>(GestureType.NONE);
  const [isLoading, setIsLoading] = useState(true);

  // Cooldown ref to prevent rapid firing of "Next Planet"
  const lastActionTime = useRef<number>(0);

  useEffect(() => {
    let animationFrameId: number;

    const setupCamera = async () => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: "user",
              width: 640,
              height: 480
            },
          });
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadeddata = () => {
              videoRef.current?.play();
              initMediaPipe();
            };
          }
        } catch (error) {
          console.error("Camera access denied:", error);
          alert("Camera access is required for gesture control.");
          setIsLoading(false);
        }
      }
    };

    const initMediaPipe = async () => {
      try {
        await gestureService.initialize();
        setIsLoading(false);
        detectLoop();
      } catch (e) {
        console.error("Failed to init MediaPipe", e);
        setIsLoading(false);
      }
    };

    const detectLoop = () => {
      if (videoRef.current) {
        const gesture = gestureService.detect(videoRef.current);
        handleGesture(gesture);
      }
      animationFrameId = requestAnimationFrame(detectLoop);
    };

    setupCamera();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleGesture = (gesture: GestureType) => {
    setLastGesture(gesture);
    const now = Date.now();

    // Debounce fast triggering actions for Open Hand and Victory
    if (now - lastActionTime.current < GESTURE_COOLDOWN_MS) {
      if (gesture === GestureType.OPEN_HAND || gesture === GestureType.VICTORY) return; 
    }

    switch (gesture) {
      case GestureType.OPEN_HAND:
        if (now - lastActionTime.current > GESTURE_COOLDOWN_MS) {
          // If in overview, selecting next planet enters planet view
          if (isOverview) setIsOverview(false);
          cyclePlanet();
          lastActionTime.current = now;
        }
        break;
        
      case GestureType.CLOSED_FIST:
        // Set state to fast/zoomed
        if (isOverview) setIsOverview(false); // Zooming in exits overview
        if (zoomLevel !== 2) setZoomLevel(2);
        if (speedMultiplier !== 3) setSpeedMultiplier(3);
        break;

      case GestureType.VICTORY:
        // Toggle Overview Mode
        if (now - lastActionTime.current > GESTURE_COOLDOWN_MS) {
            setIsOverview(prev => !prev);
            // Reset modifiers when toggling
            setZoomLevel(1);
            setSpeedMultiplier(1);
            lastActionTime.current = now;
        }
        break;
        
      case GestureType.NONE:
        break;
    }
  };

  const cyclePlanet = () => {
    setActivePlanetIndex((prevIndex) => {
      const currentOrbitIndex = ORBITING_PLANET_INDICES.indexOf(prevIndex);
      const nextOrbitIndex = (currentOrbitIndex + 1) % ORBITING_PLANET_INDICES.length;
      return ORBITING_PLANET_INDICES[nextOrbitIndex];
    });
    // Reset view props on change
    setZoomLevel(1);
    setSpeedMultiplier(1);
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden select-none">
      
      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-0">
        <Scene3D 
          activePlanetIndex={activePlanetIndex} 
          zoomLevel={zoomLevel}
          speedMultiplier={speedMultiplier}
          isOverview={isOverview}
        />
      </div>

      {/* UI Layer */}
      <UIOverlay 
        currentPlanet={PLANETS[activePlanetIndex]} 
        lastGesture={lastGesture} 
        isLoading={isLoading}
        isOverview={isOverview}
      />

      {/* Webcam Feed (Hidden/Miniaturized for Debug) */}
      <div className="absolute top-4 right-4 z-50 opacity-30 hover:opacity-100 transition-opacity duration-300 pointer-events-auto">
        <video 
          ref={videoRef} 
          className="w-32 h-24 object-cover rounded-lg border border-gray-600 transform scale-x-[-1]" 
          playsInline 
          muted 
        />
        <div className="text-[10px] text-center text-gray-500 mt-1">Camera Feed</div>
      </div>

    </div>
  );
};

export default App;