![Video Thumbnail](https://img.youtube.com/vi/_bi4Ol0QEL4/maxresdefault.jpg)

[Video tutorial](https://youtu.be/_bi4Ol0QEL4)

# AI Japanese Language Teacher

An interactive 3D Japanese language learning application with AI-powered conversation and text-to-speech.

## Model Swapping Guide

### Easy Model Replacement

To replace the 3D models with your own:

1. **Teacher Models**: Place your new teacher models in `/public/models/` and update the paths in `/src/config/models.js`
2. **Classroom Models**: Place your new classroom models in `/public/models/` and update the paths in `/src/config/models.js`

### Recommended Model Sources

**Free 3D Models:**
- **Mixamo**: Free rigged characters with animations
- **Sketchfab**: Search for "teacher" or "classroom" with CC license
- **Ready Player Me**: Customizable avatars
- **Poly Haven**: High-quality 3D assets

**Teacher Model Requirements:**
- Format: GLB/GLTF
- Rigged for animation
- Facial blend shapes for lip sync (optional)
- Animations: Idle, Talking, Thinking

**Classroom Model Requirements:**
- Format: GLB/GLTF
- Optimized for web (under 10MB recommended)
- Proper lighting setup

### Model Configuration

Edit `/src/config/models.js` to:
- Update model file paths
- Adjust positioning near the board
- Configure scale and rotation
- Set teacher voice names

### Teacher Positioning

Teachers are automatically positioned near the board in both classroom layouts:
- **Default classroom**: Teacher stands to the left of the board
- **Alternative classroom**: Teacher positioned appropriately for the rotated layout

## Deploy on Elestio

The easiest way to deploy your Next.js app is to use the [Elestio Platform](https://ellest.io).