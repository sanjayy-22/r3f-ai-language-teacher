"use client";
import { useAITeacher } from "@/hooks/useAITeacher";
import {
  CameraControls,
  Environment,
  Float,
  Gltf,
  Html,
  Loader,
  useGLTF,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Leva, button, useControls } from "leva";
import { Suspense, useEffect, useRef } from "react";
import { degToRad } from "three/src/math/MathUtils";
import { BoardSettings } from "./BoardSettings";
import { MessagesList } from "./MessagesList";
import { Teacher } from "./Teacher";
import { TypingBox } from "./TypingBox";
import { modelConfig } from "@/config/models";

export const Experience = () => {
  const teacher = useAITeacher((state) => state.teacher);
  const classroom = useAITeacher((state) => state.classroom);

  // Get configurations from model config
  const teacherConfig = modelConfig.teachers[teacher];
  const classroomConfig = modelConfig.classrooms[classroom];

  return (
    <>
      <div className="z-10 md:justify-center fixed bottom-4 left-4 right-4 flex gap-3 flex-wrap justify-stretch">
        <TypingBox />
      </div>
      <Leva hidden />
      <Loader />
      <Canvas
        camera={{
          position: [0, 0, 0.0001],
        }}
      >
        <CameraManager />

        <Suspense>
          <Float speed={0.5} floatIntensity={0.2} rotationIntensity={0.1}>
            {/* Board with messages and settings */}
            <Html
              transform
              position={classroomConfig.board.position}
              rotation={classroomConfig.board.rotation}
              scale={classroomConfig.board.scale}
              distanceFactor={1}
            >
              <MessagesList />
              <BoardSettings />
            </Html>

            {/* Environment and lighting */}
            <Environment preset="sunset" />
            <ambientLight intensity={0.8} color="pink" />

            {/* Classroom model */}
            <Gltf
              src={classroomConfig.modelPath}
              position={classroomConfig.position}
              rotation={classroomConfig.rotation}
              scale={classroomConfig.scale}
            />

            {/* Teacher positioned near the board */}
            <Teacher
              teacher={teacher}
              key={teacher}
              position={teacherConfig.positions[classroom]}
              rotation={teacherConfig.rotation}
              scale={teacherConfig.scale}
            />
          </Float>
        </Suspense>
      </Canvas>
    </>
  );
};

const CAMERA_POSITIONS = {
  default: [0, 6.123233995736766e-21, 0.0001],
  loading: [
    0.00002621880610890309, 0.00000515037441056466, 0.00009636414192870058,
  ],
  speaking: [0, -1.6481333940859815e-7, 0.00009999846226827279],
};

const CAMERA_ZOOMS = {
  default: 1,
  loading: 1.3,
  speaking: 2.1204819420055387,
};

const CameraManager = () => {
  const controls = useRef();
  const loading = useAITeacher((state) => state.loading);
  const currentMessage = useAITeacher((state) => state.currentMessage);

  useEffect(() => {
    if (loading) {
      controls.current?.setPosition(...CAMERA_POSITIONS.loading, true);
      controls.current?.zoomTo(CAMERA_ZOOMS.loading, true);
    } else if (currentMessage) {
      controls.current?.setPosition(...CAMERA_POSITIONS.speaking, true);
      controls.current?.zoomTo(CAMERA_ZOOMS.speaking, true);
    }
  }, [loading]);

  useControls("Helper", {
    getCameraPosition: button(() => {
      const position = controls.current.getPosition();
      const zoom = controls.current.camera.zoom;
      console.log([...position], zoom);
    }),
  });

  return (
    <CameraControls
      ref={controls}
      minZoom={1}
      maxZoom={3}
      polarRotateSpeed={-0.3}
      azimuthRotateSpeed={-0.3}
      mouseButtons={{
        left: 1,
        wheel: 16,
      }}
      touches={{
        one: 32,
        two: 512,
      }}
    />
  );
};

// Preload models based on configuration
Object.values(modelConfig.teachers).forEach((teacher) => {
  useGLTF.preload(teacher.modelPath);
  useGLTF.preload(teacher.animationPath);
});

Object.values(modelConfig.classrooms).forEach((classroom) => {
  useGLTF.preload(classroom.modelPath);
});