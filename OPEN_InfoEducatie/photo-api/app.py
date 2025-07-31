#!/usr/bin/env python3
"""
Photo to Coloring Book API
Converts uploaded photos into coloring book style sketches
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import cv2
import numpy as np
from PIL import Image
import os
import uuid
import logging
from werkzeug.utils import secure_filename
import tempfile
from scipy.interpolate import splprep, splev

# Configure logging first
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    import mediapipe as mp
    MEDIAPIPE_AVAILABLE = True
    logger.info("MediaPipe imported successfully")
except ImportError:
    MEDIAPIPE_AVAILABLE = False
    logger.warning("MediaPipe not available")

# Initialize global variables
OPENCV_DETECTION_AVAILABLE = False
MEDIAPIPE_DETECTION_AVAILABLE = False
face_cascade = None
eye_cascade = None
nose_cascade = None
mouth_cascade = None
face_mesh = None

# Initialize MediaPipe Face Mesh if available
if MEDIAPIPE_AVAILABLE:
    try:
        mp_face_mesh = mp.solutions.face_mesh
        face_mesh = mp_face_mesh.FaceMesh(
            static_image_mode=True,
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5
        )
        MEDIAPIPE_DETECTION_AVAILABLE = True
        logger.info("MediaPipe Face Mesh initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize MediaPipe Face Mesh: {e}")
        MEDIAPIPE_DETECTION_AVAILABLE = False

# Initialize OpenCV cascades
try:
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')
    
    # Test if cascades loaded successfully
    if not face_cascade.empty() and not eye_cascade.empty():
        OPENCV_DETECTION_AVAILABLE = True
        logger.info("OpenCV face detection cascades loaded successfully")
    else:
        logger.warning("OpenCV cascade files could not be loaded")
        OPENCV_DETECTION_AVAILABLE = False
        
except Exception as e:
    logger.error(f"Failed to load OpenCV cascades: {e}")
    OPENCV_DETECTION_AVAILABLE = False

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'output'
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}

# Ensure upload and output directories exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

def smooth_curve(pts, smoothing=2.0, num_pts=100):
    """
    Fit a spline through pts and return num_pts evenly spaced points.
    - pts: list of (x,y)
    - smoothing: higher → smoother
    - num_pts: how many output verts
    """
    pts = np.array(pts)
    if len(pts) < 3:
        return pts
    x, y = pts[:,0], pts[:,1]
    try:
        tck, u = splprep([x, y], s=smoothing)
        u_new = np.linspace(0, 1, num_pts)
        x_new, y_new = splev(u_new, tck)
        return np.vstack((x_new, y_new)).T.astype(int)
    except Exception as e:
        logger.warning(f"Spline smoothing failed: {e}, returning original points")
        return pts

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def detect_face_features_mediapipe(image):
    """
    Detect facial features using MediaPipe Face Mesh
    Returns detailed facial landmarks
    """
    if not MEDIAPIPE_DETECTION_AVAILABLE:
        return None, None
    
    try:
        # Convert BGR to RGB for MediaPipe
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Process image with MediaPipe
        results = face_mesh.process(rgb_image)
        
        if not results.multi_face_landmarks:
            return None, None
        
        # Get first face landmarks
        face_landmarks = results.multi_face_landmarks[0]
        
        # Convert normalized landmarks to pixel coordinates
        h, w, _ = image.shape
        landmarks = []
        for landmark in face_landmarks.landmark:
            x = int(landmark.x * w)
            y = int(landmark.y * h)
            landmarks.append((x, y))
        
        # CORRECTED MediaPipe Face Mesh landmark indices (468 total landmarks)
        features = {
            # Face outline (jawline and forehead)
            'face_oval': [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109],
            
            # Eyes (accurate MediaPipe indices)
            'left_eye': [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246],
            'right_eye': [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398],
            
            # Eyebrows
            'left_eyebrow': [46, 53, 52, 51, 48, 115, 131, 134, 102, 49, 220, 305, 292, 334, 293, 300],
            'right_eyebrow': [276, 283, 282, 295, 285, 336, 296, 334, 293, 300, 441, 442, 443, 444, 445],
            
            # Nose (simplified but accurate)
            'nose_bridge': [6, 168, 8, 9, 10, 151, 195, 197, 196, 3],
            'nose_tip': [1, 2, 5, 4, 19, 20, 94, 125],
            'nose_wings': [131, 134, 102, 49, 220, 305, 292, 331, 279, 278, 294, 457],
            
            # Mouth (accurate lip contours)
            'mouth_outer': [61, 84, 17, 314, 405, 320, 307, 375, 321, 308, 324, 318],
            'upper_lip': [61, 84, 17, 314, 405, 320, 307, 375, 78, 95, 88, 178, 87, 14, 317, 402, 318, 324],
            'lower_lip': [146, 91, 181, 84, 17, 314, 405, 320, 307, 375, 321, 308, 324, 318, 317, 14, 87, 178, 88, 95],
            
            # Additional details
            'chin': [18, 175, 199, 200, 9, 10, 151],
            'jaw_left': [172, 136, 150, 149, 176, 148, 152, 377, 400, 378, 379, 365, 397, 288, 361, 323],
            'jaw_right': [397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93]
        }
        
        # Convert to pixel coordinates for each feature group
        feature_coords = {}
        for feature_name, indices in features.items():
            coords = []
            for idx in indices:
                if idx < len(landmarks):
                    coords.append(landmarks[idx])
            if coords:
                feature_coords[feature_name] = coords
        
        # Calculate bounding box for face
        if landmarks:
            x_coords = [pt[0] for pt in landmarks]
            y_coords = [pt[1] for pt in landmarks]
            face_bbox = (min(x_coords), min(y_coords), 
                        max(x_coords) - min(x_coords), 
                        max(y_coords) - min(y_coords))
        else:
            face_bbox = None
        
        return feature_coords, face_bbox
        
    except Exception as e:
        logger.error(f"Error in MediaPipe face detection: {str(e)}")
        return None, None

def detect_face_features_opencv(image):
    """
    Detect facial features using OpenCV cascade classifiers
    Returns detected features and face region
    """
    if not OPENCV_DETECTION_AVAILABLE:
        return None, None
    
    try:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Detect faces
        faces = face_cascade.detectMultiScale(gray, 1.1, 4)
        
        if len(faces) == 0:
            return None, None
        
        # Use the largest face
        x, y, w, h = max(faces, key=lambda face: face[2] * face[3])
        face_region = (x, y, w, h)
        
        # Detect features within the face region
        face_gray = gray[y:y+h, x:x+w]
        
        features = {}
        
        # Detect eyes
        eyes = eye_cascade.detectMultiScale(face_gray, 1.1, 5)
        if len(eyes) >= 2:
            # Sort eyes by x position (left, right)
            eyes = sorted(eyes, key=lambda e: e[0])
            features['left_eye'] = (x + eyes[0][0], y + eyes[0][1], eyes[0][2], eyes[0][3])
            features['right_eye'] = (x + eyes[1][0], y + eyes[1][1], eyes[1][2], eyes[1][3])
        elif len(eyes) == 1:
            eye_x, eye_y, eye_w, eye_h = eyes[0]
            features['eye'] = (x + eye_x, y + eye_y, eye_w, eye_h)
        
        # Detect nose (if cascade is available)
        if nose_cascade is not None:
            noses = nose_cascade.detectMultiScale(face_gray, 1.1, 5)
            if len(noses) > 0:
                nose_x, nose_y, nose_w, nose_h = noses[0]
                features['nose'] = (x + nose_x, y + nose_y, nose_w, nose_h)
        
        # Detect mouth (if cascade is available)
        if mouth_cascade is not None:
            mouths = mouth_cascade.detectMultiScale(face_gray, 1.1, 5)
            if len(mouths) > 0:
                mouth_x, mouth_y, mouth_w, mouth_h = mouths[0]
                features['mouth'] = (x + mouth_x, y + mouth_y, mouth_w, mouth_h)
        
        # If no nose/mouth cascades, estimate positions based on face and eyes
        if 'nose' not in features and ('left_eye' in features and 'right_eye' in features):
            # Estimate nose position between and below eyes
            ex1, ey1, ew1, eh1 = features['left_eye']
            ex2, ey2, ew2, eh2 = features['right_eye']
            
            nose_x = (ex1 + ex2 + ew2) // 2 - w//8
            nose_y = max(ey1, ey2) + max(eh1, eh2)
            nose_w = w // 4
            nose_h = h // 5
            features['nose'] = (nose_x, nose_y, nose_w, nose_h)
        
        if 'mouth' not in features and 'nose' in features:
            # Estimate mouth position below nose
            nx, ny, nw, nh = features['nose']
            mouth_x = nx - nw//4
            mouth_y = ny + nh + h//12
            mouth_w = nw + nw//2
            mouth_h = h//8
            features['mouth'] = (mouth_x, mouth_y, mouth_w, mouth_h)
        
        return features, face_region
    
    except Exception as e:
        logger.error(f"Error in OpenCV face detection: {str(e)}")
        return None, None

def draw_face_outline_opencv(image, features, face_location):
    """
    Draw clean facial feature outlines using OpenCV detected features
    """
    height, width = image.shape[:2]
    sketch = np.ones((height, width), dtype=np.uint8) * 255  # White background
    
    # Line thickness
    thick_line = 3
    medium_line = 2
    thin_line = 1
    
    # Draw face outline
    x, y, w, h = face_location
    
    # Draw face oval (more natural than rectangle)
    center_x = x + w // 2
    center_y = y + h // 2
    cv2.ellipse(sketch, (center_x, center_y), 
                (w//2, h//2), 
                0, 0, 360, 0, medium_line)
    
    # Draw detected features
    if 'left_eye' in features and 'right_eye' in features:
        # Draw both eyes
        ex1, ey1, ew1, eh1 = features['left_eye']
        ex2, ey2, ew2, eh2 = features['right_eye']
        
        # Draw eye shapes (ovals)
        cv2.ellipse(sketch, (ex1 + ew1//2, ey1 + eh1//2), 
                   (ew1//2, eh1//2), 0, 0, 360, 0, thin_line)
        cv2.ellipse(sketch, (ex2 + ew2//2, ey2 + eh2//2), 
                   (ew2//2, eh2//2), 0, 0, 360, 0, thin_line)
        
        # Draw eyebrows (lines above eyes)
        brow_y1 = ey1 - eh1//4
        brow_y2 = ey2 - eh2//4
        cv2.line(sketch, (ex1, brow_y1), (ex1 + ew1, brow_y1), 0, thin_line)
        cv2.line(sketch, (ex2, brow_y2), (ex2 + ew2, brow_y2), 0, thin_line)
    
    elif 'eye' in features:
        # Single eye detected
        ex, ey, ew, eh = features['eye']
        cv2.ellipse(sketch, (ex + ew//2, ey + eh//2), 
                   (ew//2, eh//2), 0, 0, 360, 0, thin_line)
    
    if 'nose' in features:
        # Draw nose
        nx, ny, nw, nh = features['nose']
        
        # Draw nose bridge (line down the middle)
        nose_center_x = nx + nw // 2
        cv2.line(sketch, (nose_center_x, ny), (nose_center_x, ny + nh), 0, thin_line)
        
        # Draw nose base/nostrils (small oval)
        cv2.ellipse(sketch, (nose_center_x, ny + nh - nh//4), 
                   (nw//3, nh//4), 0, 0, 360, 0, thin_line)
    
    if 'mouth' in features:
        # Draw mouth
        mx, my, mw, mh = features['mouth']
        
        # Draw mouth line
        mouth_y = my + mh // 2
        cv2.line(sketch, (mx, mouth_y), (mx + mw, mouth_y), 0, thin_line)
        
        # Draw upper and lower lip curves
        cv2.ellipse(sketch, (mx + mw//2, my + mh//3), 
                   (mw//2, mh//4), 0, 0, 180, 0, thin_line)  # Upper lip
        cv2.ellipse(sketch, (mx + mw//2, my + 2*mh//3), 
                   (mw//2, mh//4), 0, 180, 360, 0, thin_line)  # Lower lip
    
    return sketch

def draw_face_outline_mediapipe(image, features, face_bbox):
    """
    Draw HIGHLY DETAILED facial features using CORRECTED MediaPipe landmarks
    """
    height, width = image.shape[:2]
    sketch = np.ones((height, width), dtype=np.uint8) * 255  # White background
    
    # Professional line thickness
    thick_line = 5
    medium_line = 4
    thin_line = 3
    detail_line = 2
    
    # 1. Draw face outline (jawline)
    if 'face_oval' in features:
        face_points = np.array(features['face_oval'], np.int32)
        cv2.polylines(sketch, [face_points], True, 0, thick_line)
    
    # 2. Draw jaw details
    if 'jaw_left' in features:
        jaw_points = np.array(features['jaw_left'], np.int32)
        cv2.polylines(sketch, [jaw_points], False, 0, medium_line)
    
    if 'jaw_right' in features:
        jaw_points = np.array(features['jaw_right'], np.int32)
        cv2.polylines(sketch, [jaw_points], False, 0, medium_line)
    
    # 3. Draw detailed eyes
    if 'left_eye' in features:
        eye_points = np.array(features['left_eye'], np.int32)
        cv2.polylines(sketch, [eye_points], True, 0, medium_line)
        
        # Add iris and pupil
        if len(eye_points) > 4:
            eye_center = np.mean(eye_points, axis=0).astype(int)
            cv2.circle(sketch, tuple(eye_center), 12, 0, medium_line)  # Iris
            cv2.circle(sketch, tuple(eye_center), 5, 0, -1)  # Pupil (filled)
    
    if 'right_eye' in features:
        eye_points = np.array(features['right_eye'], np.int32)
        cv2.polylines(sketch, [eye_points], True, 0, medium_line)
        
        # Add iris and pupil
        if len(eye_points) > 4:
            eye_center = np.mean(eye_points, axis=0).astype(int)
            cv2.circle(sketch, tuple(eye_center), 12, 0, medium_line)  # Iris
            cv2.circle(sketch, tuple(eye_center), 5, 0, -1)  # Pupil (filled)
    
    # 4. Draw eyebrows with thickness
    if 'left_eyebrow' in features:
        brow_points = np.array(features['left_eyebrow'], np.int32)
        cv2.polylines(sketch, [brow_points], False, 0, thick_line)
        
        # Add eyebrow hair texture
        for i in range(0, len(brow_points)-1, 3):
            if i < len(brow_points):
                start = brow_points[i]
                end = (start[0], start[1] + 10)
                cv2.line(sketch, tuple(start), tuple(end), 0, detail_line)
    
    if 'right_eyebrow' in features:
        brow_points = np.array(features['right_eyebrow'], np.int32)
        cv2.polylines(sketch, [brow_points], False, 0, thick_line)
        
        # Add eyebrow hair texture
        for i in range(0, len(brow_points)-1, 3):
            if i < len(brow_points):
                start = brow_points[i]
                end = (start[0], start[1] + 10)
                cv2.line(sketch, tuple(start), tuple(end), 0, detail_line)
    
    # 5. Draw nose with ALL details
    if 'nose_bridge' in features:
        nose_points = np.array(features['nose_bridge'], np.int32)
        cv2.polylines(sketch, [nose_points], False, 0, medium_line)
    
    if 'nose_tip' in features:
        nose_tip_points = np.array(features['nose_tip'], np.int32)
        cv2.polylines(sketch, [nose_tip_points], False, 0, medium_line)
    
    if 'nose_wings' in features:
        wings_points = np.array(features['nose_wings'], np.int32)
        cv2.polylines(sketch, [wings_points], False, 0, thin_line)
    
    # 6. Draw detailed mouth and lips
    if 'mouth_outer' in features:
        mouth_points = np.array(features['mouth_outer'], np.int32)
        cv2.polylines(sketch, [mouth_points], True, 0, thick_line)
    
    if 'upper_lip' in features:
        upper_lip = np.array(features['upper_lip'], np.int32)
        cv2.polylines(sketch, [upper_lip], False, 0, medium_line)
    
    if 'lower_lip' in features:
        lower_lip = np.array(features['lower_lip'], np.int32)
        cv2.polylines(sketch, [lower_lip], False, 0, medium_line)
    
    # 7. Draw chin definition
    if 'chin' in features:
        chin_points = np.array(features['chin'], np.int32)
        cv2.polylines(sketch, [chin_points], False, 0, medium_line)
    
    # 8. Add professional shading for depth
    if 'face_oval' in features:
        face_points = np.array(features['face_oval'], np.int32)
        if len(face_points) > 0:
            x_min, y_min = np.min(face_points, axis=0)
            x_max, y_max = np.max(face_points, axis=0)
            
            # Add shadow under nose
            if 'nose_tip' in features:
                nose_points = np.array(features['nose_tip'], np.int32)
                if len(nose_points) > 0:
                    nose_bottom = np.max(nose_points, axis=0)
                    shadow_y = nose_bottom[1] + 5
                    cv2.line(sketch, (nose_bottom[0] - 15, shadow_y), (nose_bottom[0] + 15, shadow_y), 0, detail_line)
            
            # Add cheek contours
            cheek_x_left = x_min + (x_max - x_min) // 4
            cheek_x_right = x_max - (x_max - x_min) // 4
            cheek_y = y_min + (y_max - y_min) // 2
            
            cv2.ellipse(sketch, (cheek_x_left, cheek_y), (8, 15), 0, 0, 180, 0, detail_line)
            cv2.ellipse(sketch, (cheek_x_right, cheek_y), (8, 15), 0, 0, 180, 0, detail_line)
    
    return sketch

def fallback_edge_detection(gray):
    """
    Advanced fallback edge detection with professional quality output
    """
    # Step 1: Enhanced preprocessing with multiple techniques
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8,8))
    enhanced = clahe.apply(gray)
    
    # Step 2: Multi-scale bilateral filtering for different detail levels
    smooth_fine = cv2.bilateralFilter(enhanced, 5, 30, 30)
    smooth_medium = cv2.bilateralFilter(enhanced, 9, 60, 60)
    smooth_coarse = cv2.bilateralFilter(enhanced, 13, 100, 100)
    
    # Step 3: Multi-threshold edge detection
    # Fine details (hair, facial texture)
    edges_fine = cv2.Canny(smooth_fine, 20, 60)
    
    # Medium details (facial features)
    edges_medium = cv2.Canny(smooth_medium, 40, 120)
    
    # Coarse details (face outline, major features)
    edges_coarse = cv2.Canny(smooth_coarse, 60, 180)
    
    # Step 4: Adaptive thresholding for capturing subtle features
    adaptive_fine = cv2.adaptiveThreshold(smooth_fine, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                         cv2.THRESH_BINARY_INV, 9, 3)
    adaptive_medium = cv2.adaptiveThreshold(smooth_medium, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                           cv2.THRESH_BINARY_INV, 15, 5)
    
    # Step 5: Combine all edge maps with weights
    edges_combined = cv2.addWeighted(edges_fine, 0.3, edges_medium, 0.4, 0)
    edges_combined = cv2.addWeighted(edges_combined, 1.0, edges_coarse, 0.3, 0)
    
    # Add adaptive threshold edges (thinned for better integration)
    kernel_thin = np.ones((1,1), np.uint8)
    adaptive_thin = cv2.erode(adaptive_fine, kernel_thin, iterations=1)
    edges_combined = cv2.bitwise_or(edges_combined, adaptive_thin)
    
    # Step 6: Advanced morphological operations
    # Close gaps in contours
    kernel_close = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3,3))
    edges_combined = cv2.morphologyEx(edges_combined, cv2.MORPH_CLOSE, kernel_close)
    
    # Strengthen main lines
    kernel_dilate = np.ones((2,2), np.uint8)
    edges_combined = cv2.dilate(edges_combined, kernel_dilate, iterations=1)
    
    # Step 7: Intelligent noise removal with size and shape filtering
    num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(edges_combined, connectivity=8)
    clean_edges = np.zeros_like(edges_combined)
    
    for i in range(1, num_labels):
        area = stats[i, cv2.CC_STAT_AREA]
        width = stats[i, cv2.CC_STAT_WIDTH]
        height = stats[i, cv2.CC_STAT_HEIGHT]
        aspect_ratio = max(width, height) / max(min(width, height), 1)
        
        # Keep components based on size and shape
        if area >= 15 and (area >= 50 or aspect_ratio > 2):
            clean_edges[labels == i] = 255
    
    # Step 8: Final enhancement - add artistic touches
    sketch = np.ones_like(gray) * 255
    sketch[clean_edges > 0] = 0
    
    # Add subtle texture for artistic effect
    height, width = sketch.shape
    
    # Add cross-hatching in darker regions
    for y in range(20, height-20, 12):
        for x in range(20, width-20, 12):
            local_region = gray[y-10:y+10, x-10:x+10]
            if local_region.size > 0 and np.mean(local_region) < 120:  # Darker regions
                # Add subtle diagonal lines
                cv2.line(sketch, (x-3, y-3), (x+3, y+3), 0, 1)
    
    return sketch

def create_outline_sketch(image, style='outline'):
    """
    Convert image to coloring book style sketch
    
    Args:
        image: OpenCV image (BGR format)
        style: 'outline', 'detailed', 'artistic'
    
    Returns:
        OpenCV image (grayscale sketch)
    """
    try:
        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Apply different processing based on style
        
        # =====================================================================================
        # === START: MODIFIED BLOCK FOR 'Contur Facial Detaliat' =======================================
        # =====================================================================================
        if style == 'outline':
            logger.info("Generating 'Contur Facial Detaliat' using the new advanced sketching algorithm.")
            
            # Step 1: Create a base sketch using the Color Dodge blending technique.
            # This professional method creates a natural, hand-drawn look from a photo.
            inverted_gray = 255 - gray
            
            # A larger blur kernel creates thicker, more defined lines suitable for coloring.
            blurred = cv2.GaussianBlur(inverted_gray, (51, 51), 0)
            dodged_sketch = cv2.divide(gray, 255 - blurred, scale=256)
            
            # Step 2: Convert to a clean black-and-white image.
            # A threshold cleans up noise and ensures solid lines for coloring.
            _, sketch = cv2.threshold(dodged_sketch, 190, 255, cv2.THRESH_BINARY)

            # Step 3: Intelligently enhance facial features using MediaPipe for sharpness.
            features, _ = detect_face_features_mediapipe(image)
            if features:
                logger.info("MediaPipe detected a face. Refining feature details...")
                # Create a more detailed edge map using Canny detector for the face region.
                face_edges = cv2.Canny(gray, 60, 120)
                
                # Create a mask covering only the core facial features.
                feature_mask = np.zeros_like(gray)
                keys_to_draw = ['left_eye', 'right_eye', 'left_eyebrow', 'right_eyebrow', 'mouth_outer', 'nose_tip']
                
                for key in keys_to_draw:
                    if key in features:
                        points = np.array(features[key], np.int32)
                        # A convex hull creates a solid shape over the feature points.
                        if len(points) > 2:
                            hull = cv2.convexHull(points)
                            cv2.drawContours(feature_mask, [hull], -1, 255, -1) # -1 fills the shape
                
                # Dilate the mask to create a soft "glow" or blending area around the features.
                mask_dilated = cv2.dilate(feature_mask, np.ones((25, 25), np.uint8), iterations=1)
                
                # The final composition: where the mask is white, use the sharp Canny edges;
                # everywhere else, use the beautiful and soft dodged sketch.
                sketch = np.where(mask_dilated == 255, (255 - face_edges), sketch)

            else:
                logger.warning("MediaPipe did not detect a face. Returning the base sketch without enhancement.")

            logger.info("Advanced outline completed.")
        # =====================================================================================
        # === END: MODIFIED BLOCK =============================================================
        # =====================================================================================

        elif style == 'detailed':
            # Enhanced detailed coloring book style for facial features
            # Step 1: Preprocessing for better edge detection
            # Apply CLAHE for better contrast in facial features
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
            enhanced = clahe.apply(gray)
            
            # Step 2: Multi-scale edge detection
            # Smooth with different parameters to capture different details
            smooth_fine = cv2.bilateralFilter(enhanced, 5, 20, 20)
            smooth_medium = cv2.bilateralFilter(enhanced, 9, 40, 40)
            smooth_coarse = cv2.bilateralFilter(enhanced, 13, 60, 60)
            
            # Fine details (eyes, mouth details)
            edges_fine = cv2.Canny(smooth_fine, 30, 70)
            
            # Medium details (nose, face contours)
            edges_medium = cv2.Canny(smooth_medium, 40, 100)
            
            # Coarse details (hair, face outline)
            edges_coarse = cv2.Canny(smooth_coarse, 50, 150)
            
            # Step 3: Use adaptive threshold for additional detail capture
            adaptive = cv2.adaptiveThreshold(smooth_fine, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                           cv2.THRESH_BINARY_INV, 11, 2)
            
            # Step 4: Combine all edge maps
            edges = cv2.bitwise_or(edges_fine, edges_medium)
            edges = cv2.bitwise_or(edges, edges_coarse)
            
            # Add adaptive threshold edges for extra detail
            kernel_small = np.ones((1,1), np.uint8)
            adaptive_thin = cv2.erode(adaptive, kernel_small, iterations=1)
            edges = cv2.bitwise_or(edges, adaptive_thin)
            
            # Step 5: Clean up and connect lines
            # Use morphological operations to clean up the sketch
            kernel_cleanup = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2,2))
            edges = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, kernel_cleanup)
            
            # Dilate slightly for visibility
            kernel_dilate = np.ones((2,2), np.uint8)
            edges = cv2.dilate(edges, kernel_dilate, iterations=1)
            
            # Step 6: Create the final sketch
            sketch = np.ones_like(gray) * 255  # White background
            sketch[edges > 0] = 0  # Black lines
            
            # Optional: Reduce noise by removing very small components
            num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(edges, connectivity=8)
            min_size = 10  # Minimum component size in pixels
            for i in range(1, num_labels):
                if stats[i, cv2.CC_STAT_AREA] < min_size:
                    sketch[labels == i] = 255
            
        elif style == 'artistic':
            # Artistic coloring book style with varied line weights
            smooth = cv2.bilateralFilter(gray, 20, 100, 100)
            
            # Create artistic edges with different intensities
            edges1 = cv2.Canny(smooth, 40, 120)
            edges2 = cv2.Canny(smooth, 100, 250)
            
            # Combine with different weights
            edges = cv2.addWeighted(edges1, 0.7, edges2, 0.3, 0)
            
            # Artistic thick lines
            kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3,3))
            edges = cv2.dilate(edges, kernel, iterations=1)
            
            # White background with black lines
            sketch = np.ones_like(gray) * 255
            sketch[edges > 0] = 0
            
        else:
            # Default to outline
            smooth = cv2.bilateralFilter(gray, 15, 80, 80)
            edges = cv2.Canny(smooth, 50, 150)
            kernel = np.ones((2,2), np.uint8)
            edges = cv2.dilate(edges, kernel, iterations=1)
            sketch = np.ones_like(gray) * 255
            sketch[edges > 0] = 0
        
        return sketch
        
    except Exception as e:
        logger.error(f"Error in create_outline_sketch: {str(e)}")
        raise

def resize_image(image, max_size=1024):
    """Resize image if it's too large while maintaining aspect ratio"""
    height, width = image.shape[:2]
    
    if max(height, width) <= max_size:
        return image
    
    if width > height:
        new_width = max_size
        new_height = int(height * (max_size / width))
    else:
        new_height = max_size
        new_width = int(width * (max_size / height))
    
    return cv2.resize(image, (new_width, new_height), interpolation=cv2.INTER_AREA)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'version': '1.0.0'})

@app.route('/convert', methods=['POST'])
def convert_photo():
    """Main endpoint to convert photo to coloring sketch"""
    try:
        # Check if file was uploaded
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        file = request.files['image']
        style = request.form.get('style', 'outline')
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'File type not allowed. Use JPG, PNG, or WEBP'}), 400
        
        # Check file size
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)
        
        if file_size > MAX_FILE_SIZE:
            return jsonify({'error': 'File too large. Maximum size is 10MB'}), 400
        
        # Generate unique filename
        file_id = str(uuid.uuid4())
        filename = secure_filename(file.filename)
        file_extension = filename.rsplit('.', 1)[1].lower()
        
        # Save uploaded file
        upload_path = os.path.join(UPLOAD_FOLDER, f"{file_id}.{file_extension}")
        file.save(upload_path)
        
        logger.info(f"Processing image: {upload_path} with style: {style}")
        
        # Load and process image
        image = cv2.imread(upload_path)
        if image is None:
            os.remove(upload_path)
            return jsonify({'error': 'Invalid image file'}), 400
        
        # Resize if too large
        image = resize_image(image, max_size=1024)
        
        # Convert to sketch
        sketch = create_outline_sketch(image, style)
        
        # Save result
        output_path = os.path.join(OUTPUT_FOLDER, f"{file_id}_sketch.png")
        cv2.imwrite(output_path, sketch)
        
        # Clean up uploaded file
        os.remove(upload_path)
        
        logger.info(f"Successfully processed image. Output: {output_path}")
        
        return jsonify({
            'success': True,
            'file_id': file_id,
            'download_url': f'/download/{file_id}',
            'style': style
        })
        
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/download/<file_id>', methods=['GET'])
def download_sketch(file_id):
    """Download the generated sketch"""
    try:
        output_path = os.path.join(OUTPUT_FOLDER, f"{file_id}_sketch.png")
        
        if not os.path.exists(output_path):
            return jsonify({'error': 'File not found'}), 404
        
        return send_file(output_path, 
                        as_attachment=True, 
                        download_name=f'coloring_sketch_{file_id}.png',
                        mimetype='image/png')
    
    except Exception as e:
        logger.error(f"Error downloading file: {str(e)}")
        return jsonify({'error': 'Error downloading file'}), 500

@app.route('/styles', methods=['GET'])
def get_styles():
    """Get available conversion styles"""
    styles = {
        'outline': {
            'name': 'Contur Facial Detaliat',
            'description': 'Linii clare cu accent pe trăsăturile feței',
            'icon': '📝'
        },
        'detailed': {
            'name': 'Contur Îngroșat',
            'description': 'Linii mai groase și accentuate pentru colorat',
            'icon': '✏️'
        },
        'artistic': {
            'name': 'Contur Cap',
            'description': 'Contur simplu al formei capului',
            'icon': '🎨'
        }
    }
    return jsonify(styles)

# Cleanup old files periodically (simple version)
def cleanup_old_files():
    """Remove files older than 1 hour"""
    import time
    current_time = time.time()
    
    for folder in [UPLOAD_FOLDER, OUTPUT_FOLDER]:
        for filename in os.listdir(folder):
            file_path = os.path.join(folder, filename)
            if os.path.isfile(file_path):
                file_age = current_time - os.path.getctime(file_path)
                if file_age > 3600:  # 1 hour
                    try:
                        os.remove(file_path)
                        logger.info(f"Cleaned up old file: {file_path}")
                    except Exception as e:
                        logger.error(f"Error cleaning up file {file_path}: {e}")

if __name__ == '__main__':
    # Clean up old files on startup
    cleanup_old_files()
    
    # Run the app. Use a production-grade WSGI server like Gunicorn instead of this for production.
    # Example: gunicorn --bind 0.0.0.0:5000 --workers 4 app:app
    app.run(host='0.0.0.0', port=5000, debug=True)