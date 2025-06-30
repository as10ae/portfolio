"use client";
import { cn } from "@/lib/utils";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import React, { useMemo } from "react";
import * as THREE from "three";

export const CanvasRevealEffect = ({
  animationSpeed = 0.4,
  opacities = [0.3, 0.3, 0.3, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 1],
  colors = [[0, 255, 255]],
  containerClassName,
  dotSize = 3,
  showGradient = true,
}: {
  animationSpeed?: number;
  opacities?: number[];
  colors?: number[][];
  containerClassName?: string;
  dotSize?: number;
  showGradient?: boolean;
}) => {
  return (
    <div className={cn("h-full relative bg-white w-full", containerClassName)}>
      <div className="h-full w-full">
        <Canvas
          gl={{ antialias: true }}
          camera={{ position: [0, 0, 5], fov: 25 }}
          style={{ width: "100%", height: "100%" }}
        >
          <DotMatrix
            colors={colors}
            dotSize={dotSize}
            opacities={opacities}
            animationSpeed={animationSpeed}
          />
        </Canvas>
      </div>
      {showGradient && (
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 to-[84%]" />
      )}
    </div>
  );
};

const DotMatrix: React.FC<{
  colors: number[][];
  opacities: number[];
  dotSize: number;
  animationSpeed: number;
}> = ({ colors, opacities, dotSize, animationSpeed }) => {
  const { size } = useThree();

  const uniforms = useMemo(() => {
    // Create colors array based on input
    let colorsArray = Array(6).fill(colors[0]);
    if (colors.length === 2) {
      colorsArray = [...Array(3).fill(colors[0]), ...Array(3).fill(colors[1])];
    } else if (colors.length === 3) {
      colorsArray = [
        ...Array(2).fill(colors[0]),
        ...Array(2).fill(colors[1]),
        ...Array(2).fill(colors[2]),
      ];
    }

    return {
      u_colors: {
        value: colorsArray.map((c) => [c[0] / 255, c[1] / 255, c[2] / 255]),
      },
      u_opacities: { value: opacities },
      u_dot_size: { value: dotSize },
      u_total_size: { value: 4 },
      u_resolution: {
        value: new THREE.Vector2(size.width, size.height),
      },
      u_time: { value: 0 },
      u_animation_speed: { value: animationSpeed },
    };
  }, [colors, opacities, dotSize, size, animationSpeed]);

  useFrame(({ clock }) => {
    uniforms.u_time.value = clock.getElapsedTime();
  });

  const fragmentShader = `
    uniform vec3 u_colors[6];
    uniform float u_opacities[10];
    uniform float u_dot_size;
    uniform float u_total_size;
    uniform vec2 u_resolution;
    uniform float u_time;
    uniform float u_animation_speed;
    
    varying vec2 vUv;
    
    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }
    
    void main() {
      vec2 st = gl_FragCoord.xy / u_resolution.xy;
      vec2 gridPos = vec2(
        floor(st.x * u_resolution.x / u_total_size),
        floor(st.y * u_resolution.y / u_total_size)
      );
      
      float opacity = u_opacities[int(random(gridPos) * 10.0)];
      opacity *= step(fract(st.x * u_resolution.x / u_total_size), u_dot_size / u_total_size);
      opacity *= step(fract(st.y * u_resolution.y / u_total_size), u_dot_size / u_total_size);
      
      // Animation effect
      float intro_offset = distance(u_resolution / 2.0 / u_total_size, gridPos) * 0.01 + (random(gridPos) * 0.15);
      opacity *= step(intro_offset, u_time * u_animation_speed);
      opacity *= clamp((1.0 - step(intro_offset + 0.1, u_time * u_animation_speed)) * 1.25, 1.0, 1.25);
      
      vec3 color = u_colors[int(random(gridPos) * 6.0)];
      gl_FragColor = vec4(color, opacity);
    }
  `;

  const vertexShader = `
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent={true}
      />
    </mesh>
  );
};
