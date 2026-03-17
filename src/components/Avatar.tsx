"use client";

import React, { useRef, useLayoutEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

export default function Avatar({ modelUrl, analyser, isSpeaking }: any) {
  const { scene, nodes } = useGLTF(modelUrl) as any;
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    // FIX: Map the specific node names to your variables
    const head = nodes.Wolf3D_Head;
    const neck = nodes.Neck;
    const leftArm = nodes.LeftArm; 
    const rightArm = nodes.RightArm;
    const teeth = nodes.Wolf3D_Teeth;

    const time = state.clock.elapsedTime;

    if (leftArm && rightArm) {
    
      const baseRotation = -0;
      const subtleSway = Math.sin(time * 0.8) * 0.02;

      leftArm.rotation.z = baseRotation + subtleSway;
      rightArm.rotation.z = -(baseRotation + subtleSway);

      leftArm.rotation.x = 1.2;
      rightArm.rotation.x = 1.2;
    }

    if (neck) {
      const headSwayX = Math.sin(time * 0.5) * 0.05;
      const headSwayY = Math.cos(time * 0.4) * 0.08;
      neck.rotation.x = 0.23 + headSwayX;
      neck.rotation.y = headSwayY;
    }

    // --- 2. MOUTH LOGIC ---
    if (!head || !head.morphTargetInfluences) return;
    const mouthIndex = head.morphTargetDictionary["mouthOpen"];

    if (isSpeaking && analyser && mouthIndex !== undefined) {
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      const mouthOpenValue = Math.min(average / 15, 1);

      head.morphTargetInfluences[mouthIndex] = THREE.MathUtils.lerp(
        head.morphTargetInfluences[mouthIndex],
        mouthOpenValue,
        0.4,
      );

      if (teeth?.morphTargetDictionary?.["mouthOpen"] !== undefined) {
        const teethIndex = teeth.morphTargetDictionary["mouthOpen"];
        teeth.morphTargetInfluences[teethIndex] =
          head.morphTargetInfluences[mouthIndex];
      }
    } else if (mouthIndex !== undefined) {
      head.morphTargetInfluences[mouthIndex] = THREE.MathUtils.lerp(
        head.morphTargetInfluences[mouthIndex],
        0,
        0.2,
      );
    }
  });
  // console.log(nodes);
  return (
    <primitive object={scene} ref={group} scale={1.8} position={[0, -2.8, 0]} />
  );
}
