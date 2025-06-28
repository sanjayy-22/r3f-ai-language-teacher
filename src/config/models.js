// Model configuration for easy swapping
export const modelConfig = {
  teachers: {
    Nanami: {
      modelPath: "/models/Teacher_Nanami.glb",
      animationPath: "/models/animations_Nanami.glb",
      imagePath: "/images/Nanami.jpg",
      scale: 1.5,
      // Position relative to board for each classroom
      positions: {
        default: [-0.5, -1.7, -5.5], // Near the board
        alternative: [0.8, -1.7, -7.5] // Near the board in alternative layout
      },
      rotation: [0, 0.35, 0], // Slight angle toward students
      voiceName: "Nanami"
    },
    Naoki: {
      modelPath: "/models/Teacher_Naoki.glb", 
      animationPath: "/models/animations_Naoki.glb",
      imagePath: "/images/Naoki.jpg",
      scale: 1.5,
      positions: {
        default: [-0.5, -1.7, -5.5],
        alternative: [0.8, -1.7, -7.5]
      },
      rotation: [0, 0.35, 0],
      voiceName: "Naoki"
    }
  },
  classrooms: {
    default: {
      modelPath: "/models/classroom_default.glb",
      position: [0.2, -1.7, -2],
      rotation: [0, 0, 0],
      scale: 1,
      board: {
        position: [0.45, 0.382, -6],
        rotation: [0, 0, 0],
        scale: 1
      }
    },
    alternative: {
      modelPath: "/models/classroom_alternative.glb", 
      position: [0.3, -1.7, -1.5],
      rotation: [0, -1.57, 0], // -90 degrees
      scale: 0.4,
      board: {
        position: [1.4, 0.84, -8],
        rotation: [0, 0, 0],
        scale: 1
      }
    }
  }
};

// Easy model swapping - just update these paths to use new models
export const swapModels = {
  // To swap teacher models, update these paths:
  newTeacher: {
    modelPath: "/models/NewTeacher.glb", // Replace with your new teacher model
    animationPath: "/models/NewTeacher_animations.glb", // Replace with animations
    imagePath: "/images/NewTeacher.jpg" // Replace with teacher image
  },
  
  // To swap classroom models, update these paths:
  newClassroom: {
    modelPath: "/models/NewClassroom.glb" // Replace with your new classroom model
  }
};