import React from 'react';
import { PlanetConfig, GestureType } from '../services/types';
import { Hand, Grab, Sparkles, Ruler, Thermometer, Clock, RotateCw, Weight, Gauge, Moon, Lightbulb } from 'lucide-react';

interface UIOverlayProps {
  currentPlanet: PlanetConfig;
  lastGesture: GestureType;
  isLoading: boolean;
  isOverview: boolean;
}

export const UIOverlay: React.FC<UIOverlayProps> = ({ currentPlanet, lastGesture, isLoading, isOverview }) => {
  
  const getGestureIcon = (type: GestureType) => {
    switch (type) {
      case GestureType.OPEN_HAND: return <Hand className="w-8 h-8 text-green-400" />;
      case GestureType.CLOSED_FIST: return <Grab className="w-8 h-8 text-red-400" />;
      case GestureType.VICTORY: return <Sparkles className="w-8 h-8 text-blue-400" />;
      default: return <div className="w-8 h-8 rounded-full border-2 border-gray-600" />;
    }
  };

  const getGestureText = (type: GestureType) => {
    switch (type) {
      case GestureType.OPEN_HAND: return "Next Planet";
      case GestureType.CLOSED_FIST: return "Zoom In & Fast";
      case GestureType.VICTORY: return "Overview Toggle";
      default: return "No Gesture";
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-6">
      
      {/* Top Bar: Planet Info */}
      <div className="flex flex-col items-center mt-4">
        <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 tracking-widest drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
          {isOverview ? "SOLAR SYSTEM" : currentPlanet.name}
        </h1>
        <p className="text-gray-300 text-xl font-light tracking-wide mt-2 uppercase">
          {isOverview ? "Overview Mode" : currentPlanet.description}
        </p>
      </div>

      {/* Stats Panel (Right Side) - Only show in Planet View */}
      {!isOverview && currentPlanet.stats && (
        <div className="absolute top-1/2 right-6 transform -translate-y-1/2 bg-gray-900/70 backdrop-blur-md border border-gray-700 p-6 rounded-xl text-white w-80 max-h-[80vh] overflow-y-auto">
           <h3 className="text-sm uppercase text-gray-400 font-bold mb-4 tracking-wider border-b border-gray-700 pb-2">
            Planetary Data
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Ruler className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <div className="flex-1">
                <span className="text-xs text-gray-400 block">Diameter</span>
                <span className="font-mono text-sm">{currentPlanet.stats.diameter}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Thermometer className="w-5 h-5 text-red-400 flex-shrink-0" />
              <div className="flex-1">
                <span className="text-xs text-gray-400 block">Temperature</span>
                <span className="font-mono text-sm">{currentPlanet.stats.temperature}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <RotateCw className="w-5 h-5 text-yellow-400 flex-shrink-0" />
              <div className="flex-1">
                <span className="text-xs text-gray-400 block">Day Length</span>
                <span className="font-mono text-sm">{currentPlanet.stats.dayLength}</span>
              </div>
            </div>
             <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-purple-400 flex-shrink-0" />
              <div className="flex-1">
                <span className="text-xs text-gray-400 block">Orbit Period</span>
                <span className="font-mono text-sm">{currentPlanet.stats.orbitPeriod}</span>
              </div>
            </div>
            {currentPlanet.stats.mass && (
              <div className="flex items-center gap-3">
                <Weight className="w-5 h-5 text-green-400 flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-xs text-gray-400 block">Mass</span>
                  <span className="font-mono text-xs">{currentPlanet.stats.mass}</span>
                </div>
              </div>
            )}
            {currentPlanet.stats.gravity && (
              <div className="flex items-center gap-3">
                <Gauge className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-xs text-gray-400 block">Gravity</span>
                  <span className="font-mono text-sm">{currentPlanet.stats.gravity}</span>
                </div>
              </div>
            )}
            {currentPlanet.stats.moons && (
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-xs text-gray-400 block">Natural Satellites</span>
                  <span className="font-mono text-sm">{currentPlanet.stats.moons}</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Fun Fact Section */}
          {currentPlanet.stats.funFact && (
            <div className="mt-6 pt-4 border-t border-gray-700">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-xs uppercase text-gray-400 font-bold mb-2">Did You Know?</h4>
                  <p className="text-sm text-gray-200 leading-relaxed">{currentPlanet.stats.funFact}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg font-mono">Initializing Neural Network...</p>
            <p className="text-gray-400 text-sm mt-2">Please allow camera access</p>
          </div>
        </div>
      )}

      {/* Bottom Bar: Controls & Status */}
      <div className="flex justify-between items-end w-full">
        
        {/* Gesture Guide */}
        <div className="bg-gray-900/80 backdrop-blur-md border border-gray-700 p-4 rounded-xl text-white max-w-sm">
          <h3 className="text-sm uppercase text-gray-400 font-bold mb-3 tracking-wider border-b border-gray-700 pb-2">
            Gesture Controls
          </h3>
          <div className="space-y-3">
            <div className={`flex items-center gap-3 ${lastGesture === GestureType.OPEN_HAND ? 'bg-white/10 p-2 rounded' : 'p-2'}`}>
              <Hand className="w-5 h-5 text-green-400" />
              <div>
                <span className="font-bold text-sm block">Open Hand</span>
                <span className="text-xs text-gray-400">Next Planet</span>
              </div>
            </div>
            <div className={`flex items-center gap-3 ${lastGesture === GestureType.CLOSED_FIST ? 'bg-white/10 p-2 rounded' : 'p-2'}`}>
              <Grab className="w-5 h-5 text-red-400" />
              <div>
                <span className="font-bold text-sm block">Closed Fist</span>
                <span className="text-xs text-gray-400">Zoom In + Speed Up</span>
              </div>
            </div>
            <div className={`flex items-center gap-3 ${lastGesture === GestureType.VICTORY ? 'bg-white/10 p-2 rounded' : 'p-2'}`}>
              <Sparkles className="w-5 h-5 text-blue-400" />
              <div>
                <span className="font-bold text-sm block">Peace Sign</span>
                <span className="text-xs text-gray-400">Toggle System View</span>
              </div>
            </div>
          </div>
        </div>

        {/* Current Detection Status */}
        <div className="bg-gray-900/80 backdrop-blur-md border border-gray-700 p-4 rounded-xl text-white flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-xs text-gray-400 uppercase">Detected</span>
            <span className="font-bold text-lg text-blue-300">{getGestureText(lastGesture)}</span>
          </div>
          <div className="bg-gray-800 p-2 rounded-lg border border-gray-600">
             {getGestureIcon(lastGesture)}
          </div>
        </div>
      </div>
    </div>
  );
};