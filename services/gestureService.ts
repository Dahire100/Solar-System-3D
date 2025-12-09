import { FilesetResolver, HandLandmarker, NormalizedLandmark } from "@mediapipe/tasks-vision";
import { GestureType } from "./types";

export class GestureService {
  private handLandmarker: HandLandmarker | null = null;
  private lastVideoTime = -1;

  async initialize() {
    try {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
      );
      
      this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numHands: 1
      });
      console.log("HandLandmarker initialized");
    } catch (error) {
      console.error("Error initializing HandLandmarker:", error);
      throw error;
    }
  }

  detect(videoElement: HTMLVideoElement): GestureType {
    if (!this.handLandmarker) return GestureType.NONE;

    const nowInMs = Date.now();
    if (videoElement.currentTime !== this.lastVideoTime) {
      this.lastVideoTime = videoElement.currentTime;
      
      const results = this.handLandmarker.detectForVideo(videoElement, nowInMs);
      
      if (results.landmarks && results.landmarks.length > 0) {
        return this.classifyGesture(results.landmarks[0]);
      }
    }
    return GestureType.NONE;
  }

  private classifyGesture(landmarks: NormalizedLandmark[]): GestureType {
    // Finger indices
    // Thumb: 1-4, Index: 5-8, Middle: 9-12, Ring: 13-16, Pinky: 17-20
    
    // Helper to check if finger is extended (Tip is higher/farther than PIP joint)
    // Note: In screen coords, Y increases downwards. So extended upwards means y_tip < y_pip.
    // However, robust check uses distance from wrist (0).
    
    const isExtended = (tipIdx: number, pipIdx: number) => {
      // Simple check: Is the tip further from the wrist (0) than the PIP joint?
      // Using simple Euclidean distance squared for performance
      const wrist = landmarks[0];
      const tip = landmarks[tipIdx];
      const pip = landmarks[pipIdx];

      const distTip = Math.pow(tip.x - wrist.x, 2) + Math.pow(tip.y - wrist.y, 2);
      const distPip = Math.pow(pip.x - wrist.x, 2) + Math.pow(pip.y - wrist.y, 2);

      return distTip > distPip;
    };

    const thumbExtended = isExtended(4, 2);
    const indexExtended = isExtended(8, 6);
    const middleExtended = isExtended(12, 10);
    const ringExtended = isExtended(16, 14);
    const pinkyExtended = isExtended(20, 18);

    // Logic Tree
    if (indexExtended && middleExtended && !ringExtended && !pinkyExtended) {
      // Peace Sign
      return GestureType.VICTORY;
    }

    if (!thumbExtended && !indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
      // Fist (All curled) - Thumb can be tricky, sometimes it's not tucked in fully, but other 4 are key.
      return GestureType.CLOSED_FIST;
    }
    
    // Relaxed fist check (if thumb is sticking out but others are closed)
    if (!indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
        return GestureType.CLOSED_FIST;
    }

    if (thumbExtended && indexExtended && middleExtended && ringExtended && pinkyExtended) {
      // Open Hand
      return GestureType.OPEN_HAND;
    }

    // Default
    return GestureType.NONE;
  }
}

export const gestureService = new GestureService();