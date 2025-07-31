// Step 8 Functions - Finishing Touches
// Canvas variables are defined in main script.js
let currentLightDirection = 'top-left';
let lightIntensity = 70;

// Initialize Step 8 when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Setup Step 8 canvas
    step8Canvas = document.getElementById('drawing-canvas-step8');
    if (step8Canvas) {
        step8Ctx = step8Canvas.getContext('2d');
        step8Ctx.lineCap = 'round';
        step8Ctx.lineJoin = 'round';
    }
    
    // Initialize light controls
    initializeLightControls();
});

function initializeStep8() {
    if (!step8Canvas) return;
    
    // Draw complete portrait with all features
    drawFinalPortrait(step8Ctx, step8Canvas);
    
    // Highlight first finishing step
    document.querySelectorAll('.finishing-step').forEach(step => {
        step.classList.remove('active');
    });
    document.querySelector('[data-step="cleanup"]').classList.add('active');
    
    // Initialize light source position
    updateLightSource();
}

function drawFinalPortrait(ctx, canvas) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const headWidth = 120;
    const headHeight = 160;
    
    // Draw complete head with all features from previous steps
    ctx.strokeStyle = '#2d3748';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 1;
    
    // Head outline
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, headWidth, headHeight, 0, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Facial features positioning
    const eyeLine = centerY - headHeight * 0.1;
    const noseLine = centerY + headHeight * 0.3;
    const mouthLine = centerY + headHeight * 0.6;
    const eyeWidth = 30;
    const eyeSpacing = 35;
    
    // Eyes (detailed)
    drawDetailedEyes(ctx, centerX, eyeLine, eyeSpacing, eyeWidth);
    
    // Eyebrows
    ctx.strokeStyle = '#4a5568';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX - eyeSpacing - 18, eyeLine - 25);
    ctx.quadraticCurveTo(centerX - eyeSpacing, eyeLine - 20, centerX - eyeSpacing + 18, eyeLine - 25);
    ctx.moveTo(centerX + eyeSpacing - 18, eyeLine - 25);
    ctx.quadraticCurveTo(centerX + eyeSpacing, eyeLine - 20, centerX + eyeSpacing + 18, eyeLine - 25);
    ctx.stroke();
    
    // Nose (detailed)
    drawDetailedNose(ctx, centerX, noseLine);
    
    // Mouth (detailed)
    drawDetailedMouth(ctx, centerX, mouthLine);
    
    // Ears (detailed)
    const earCenterY = (eyeLine + noseLine) / 2;
    const earHeight = noseLine - eyeLine;
    const earWidth = earHeight * 0.6;
    const leftEarX = centerX - headWidth - 5;
    const rightEarX = centerX + headWidth - 5;
    
    drawDetailedEars(ctx, leftEarX, rightEarX, earCenterY, earWidth, earHeight);
    
    // Hair (basic)
    drawBasicHair(ctx, centerX, centerY, headWidth, headHeight);
    
    // Construction lines (light)
    drawConstructionLines(ctx, centerX, centerY, headWidth, headHeight);
    
    ctx.globalAlpha = 1;
}

function drawDetailedEyes(ctx, centerX, eyeLine, eyeSpacing, eyeWidth) {
    // Eye shapes
    ctx.strokeStyle = '#2d3748';
    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = 2;
    
    // Left eye
    ctx.beginPath();
    ctx.ellipse(centerX - eyeSpacing, eyeLine, eyeWidth/2, 12, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    
    // Right eye
    ctx.beginPath();
    ctx.ellipse(centerX + eyeSpacing, eyeLine, eyeWidth/2, 12, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    
    // Irises
    ctx.fillStyle = '#4a90e2';
    ctx.beginPath();
    ctx.arc(centerX - eyeSpacing, eyeLine, 8, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + eyeSpacing, eyeLine, 8, 0, 2 * Math.PI);
    ctx.fill();
    
    // Pupils
    ctx.fillStyle = '#1a202c';
    ctx.beginPath();
    ctx.arc(centerX - eyeSpacing, eyeLine, 4, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + eyeSpacing, eyeLine, 4, 0, 2 * Math.PI);
    ctx.fill();
    
    // Eye highlights
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(centerX - eyeSpacing - 1, eyeLine - 1, 1.5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + eyeSpacing - 1, eyeLine - 1, 1.5, 0, 2 * Math.PI);
    ctx.fill();
    
    // Eyelashes
    ctx.strokeStyle = '#2d3748';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
        const leftX = centerX - eyeSpacing - 10 + i * 5;
        const rightX = centerX + eyeSpacing - 10 + i * 5;
        
        ctx.beginPath();
        ctx.moveTo(leftX, eyeLine - 8);
        ctx.lineTo(leftX + Math.random() * 2 - 1, eyeLine - 12);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(rightX, eyeLine - 8);
        ctx.lineTo(rightX + Math.random() * 2 - 1, eyeLine - 12);
        ctx.stroke();
    }
}

function drawDetailedNose(ctx, centerX, noseLine) {
    ctx.strokeStyle = '#4a5568';
    ctx.lineWidth = 2;
    
    // Nose bridge
    ctx.beginPath();
    ctx.moveTo(centerX - 3, noseLine - 30);
    ctx.lineTo(centerX - 8, noseLine - 5);
    ctx.moveTo(centerX + 3, noseLine - 30);
    ctx.lineTo(centerX + 8, noseLine - 5);
    ctx.stroke();
    
    // Nose tip
    ctx.beginPath();
    ctx.moveTo(centerX - 8, noseLine - 5);
    ctx.quadraticCurveTo(centerX, noseLine + 5, centerX + 8, noseLine - 5);
    ctx.stroke();
    
    // Nostrils
    ctx.fillStyle = '#4a5568';
    ctx.beginPath();
    ctx.ellipse(centerX - 6, noseLine, 2, 4, 0.3, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(centerX + 6, noseLine, 2, 4, -0.3, 0, 2 * Math.PI);
    ctx.fill();
}

function drawDetailedMouth(ctx, centerX, mouthLine) {
    ctx.strokeStyle = '#d53f8c';
    ctx.lineWidth = 2;
    
    // Mouth line
    ctx.beginPath();
    ctx.moveTo(centerX - 25, mouthLine);
    ctx.quadraticCurveTo(centerX, mouthLine + 1, centerX + 25, mouthLine);
    ctx.stroke();
    
    // Upper lip
    ctx.beginPath();
    ctx.moveTo(centerX - 20, mouthLine - 3);
    ctx.quadraticCurveTo(centerX - 6, mouthLine - 8, centerX, mouthLine - 5);
    ctx.quadraticCurveTo(centerX + 6, mouthLine - 8, centerX + 20, mouthLine - 3);
    ctx.stroke();
    
    // Lower lip
    ctx.beginPath();
    ctx.moveTo(centerX - 20, mouthLine + 2);
    ctx.quadraticCurveTo(centerX, mouthLine + 8, centerX + 20, mouthLine + 2);
    ctx.stroke();
}

function drawDetailedEars(ctx, leftEarX, rightEarX, earCenterY, earWidth, earHeight) {
    ctx.strokeStyle = '#e53e3e';
    ctx.lineWidth = 1.5;
    
    // Ear outlines
    ctx.beginPath();
    ctx.ellipse(leftEarX, earCenterY, earWidth/2, earHeight/2, 0, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(rightEarX, earCenterY, earWidth/2, earHeight/2, 0, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Inner ear details
    ctx.strokeStyle = '#a0aec0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(leftEarX + 2, earCenterY, earWidth/3, earHeight/3, 0, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(rightEarX - 2, earCenterY, earWidth/3, earHeight/3, 0, 0, 2 * Math.PI);
    ctx.stroke();
}

function drawBasicHair(ctx, centerX, centerY, headWidth, headHeight) {
    const crownY = centerY - headHeight;
    const hairlineY = centerY - headHeight * 0.75;
    
    ctx.strokeStyle = '#8b4513';
    ctx.fillStyle = 'rgba(139, 69, 19, 0.3)';
    ctx.lineWidth = 1.5;
    
    // Hair mass
    ctx.beginPath();
    ctx.moveTo(centerX - headWidth - 15, hairlineY);
    ctx.quadraticCurveTo(centerX - headWidth - 25, crownY - 25, centerX - 60, crownY - 30);
    ctx.quadraticCurveTo(centerX, crownY - 40, centerX + 60, crownY - 30);
    ctx.quadraticCurveTo(centerX + headWidth + 25, crownY - 25, centerX + headWidth + 15, hairlineY);
    ctx.quadraticCurveTo(centerX, hairlineY - 15, centerX - headWidth - 15, hairlineY);
    ctx.fill();
    ctx.stroke();
    
    // Hair strands
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 1;
    for (let i = 0; i < 10; i++) {
        const x = centerX - 60 + i * 12;
        const startY = crownY - 20 + Math.random() * 10;
        const endY = centerY + 40 + Math.random() * 60;
        
        ctx.beginPath();
        ctx.moveTo(x, startY);
        ctx.quadraticCurveTo(x + (Math.random() - 0.5) * 20, (startY + endY) / 2, x + (Math.random() - 0.5) * 30, endY);
        ctx.stroke();
    }
}

function drawConstructionLines(ctx, centerX, centerY, headWidth, headHeight) {
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    ctx.setLineDash([3, 3]);
    
    // Vertical symmetry line
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - headHeight - 20);
    ctx.lineTo(centerX, centerY + headHeight + 20);
    ctx.stroke();
    
    // Horizontal guidelines
    const eyeLine = centerY - headHeight * 0.1;
    const noseLine = centerY + headHeight * 0.3;
    const mouthLine = centerY + headHeight * 0.6;
    
    // Eye line
    ctx.beginPath();
    ctx.moveTo(centerX - headWidth - 20, eyeLine);
    ctx.lineTo(centerX + headWidth + 20, eyeLine);
    ctx.stroke();
    
    // Nose line
    ctx.beginPath();
    ctx.moveTo(centerX - headWidth - 20, noseLine);
    ctx.lineTo(centerX + headWidth + 20, noseLine);
    ctx.stroke();
    
    // Mouth line
    ctx.beginPath();
    ctx.moveTo(centerX - headWidth - 20, mouthLine);
    ctx.lineTo(centerX + headWidth + 20, mouthLine);
    ctx.stroke();
    
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
}

function highlightFinishingStep(stepName) {
    // Update active step
    document.querySelectorAll('.finishing-step').forEach(step => {
        step.classList.remove('active');
    });
    document.querySelector(`[data-step="${stepName}"]`).classList.add('active');
    
    // Apply corresponding finishing technique
    applyFinishingStep(stepName);
}

function applyFinishingStep(stepName) {
    if (!step8Canvas) return;
    
    step8Ctx.clearRect(0, 0, step8Canvas.width, step8Canvas.height);
    drawFinalPortrait(step8Ctx, step8Canvas);
    
    switch(stepName) {
        case 'cleanup':
            fadeConstructionLines();
            break;
        case 'symmetry':
            showSymmetryCheck();
            break;
        case 'emphasis':
            emphasizeMainLines();
            break;
        case 'shading':
            addBasicShading();
            break;
        case 'highlights':
            addHighlights();
            break;
        case 'signature':
            showSignatureArea();
            break;
    }
}

function fadeConstructionLines() {
    // Gradually fade construction lines
    const centerX = step8Canvas.width / 2;
    const centerY = step8Canvas.height / 2;
    const headWidth = 120;
    const headHeight = 160;
    
    step8Ctx.strokeStyle = '#f7fafc';
    step8Ctx.lineWidth = 1;
    step8Ctx.globalAlpha = 0.1;
    step8Ctx.setLineDash([3, 3]);
    
    // Very faint construction lines
    step8Ctx.beginPath();
    step8Ctx.moveTo(centerX, centerY - headHeight - 20);
    step8Ctx.lineTo(centerX, centerY + headHeight + 20);
    step8Ctx.stroke();
    
    step8Ctx.globalAlpha = 1;
    step8Ctx.setLineDash([]);
}

function showSymmetryCheck() {
    const centerX = step8Canvas.width / 2;
    const centerY = step8Canvas.height / 2;
    const headHeight = 160;
    const eyeLine = centerY - headHeight * 0.1;
    const noseLine = centerY + headHeight * 0.3;
    
    // Show symmetry grid
    step8Ctx.strokeStyle = '#22c55e';
    step8Ctx.lineWidth = 2;
    step8Ctx.globalAlpha = 0.7;
    step8Ctx.setLineDash([5, 5]);
    
    // Vertical center line
    step8Ctx.beginPath();
    step8Ctx.moveTo(centerX, eyeLine - 30);
    step8Ctx.lineTo(centerX, noseLine + 30);
    step8Ctx.stroke();
    
    // Horizontal alignment lines
    step8Ctx.beginPath();
    step8Ctx.moveTo(centerX - 60, eyeLine);
    step8Ctx.lineTo(centerX + 60, eyeLine);
    step8Ctx.stroke();
    
    step8Ctx.setLineDash([]);
    step8Ctx.globalAlpha = 1;
    
    // Mark symmetry points
    step8Ctx.fillStyle = '#22c55e';
    const points = [
        [centerX - 35, eyeLine], [centerX + 35, eyeLine], // Eyes
        [centerX, noseLine], // Nose center
    ];
    
    points.forEach(point => {
        step8Ctx.beginPath();
        step8Ctx.arc(point[0], point[1], 3, 0, 2 * Math.PI);
        step8Ctx.fill();
    });
}

function emphasizeMainLines() {
    const centerX = step8Canvas.width / 2;
    const centerY = step8Canvas.height / 2;
    const headWidth = 120;
    const headHeight = 160;
    const eyeLine = centerY - headHeight * 0.1;
    const noseLine = centerY + headHeight * 0.3;
    const mouthLine = centerY + headHeight * 0.6;
    const eyeSpacing = 35;
    
    // Emphasize important lines
    step8Ctx.strokeStyle = '#1a202c';
    step8Ctx.lineWidth = 3;
    step8Ctx.globalAlpha = 0.9;
    
    // Eye contours
    step8Ctx.beginPath();
    step8Ctx.ellipse(centerX - eyeSpacing, eyeLine, 15, 12, 0, 0, 2 * Math.PI);
    step8Ctx.moveTo(centerX + eyeSpacing + 15, eyeLine);
    step8Ctx.ellipse(centerX + eyeSpacing, eyeLine, 15, 12, 0, 0, 2 * Math.PI);
    step8Ctx.stroke();
    
    // Nose outline
    step8Ctx.beginPath();
    step8Ctx.moveTo(centerX - 8, noseLine - 5);
    step8Ctx.quadraticCurveTo(centerX, noseLine + 5, centerX + 8, noseLine - 5);
    step8Ctx.stroke();
    
    // Mouth line
    step8Ctx.beginPath();
    step8Ctx.moveTo(centerX - 25, mouthLine);
    step8Ctx.quadraticCurveTo(centerX, mouthLine + 1, centerX + 25, mouthLine);
    step8Ctx.stroke();
    
    // Face outline
    step8Ctx.lineWidth = 2.5;
    step8Ctx.beginPath();
    step8Ctx.ellipse(centerX, centerY, headWidth, headHeight, 0, 0, 2 * Math.PI);
    step8Ctx.stroke();
    
    step8Ctx.globalAlpha = 1;
}

function addBasicShading() {
    const centerX = step8Canvas.width / 2;
    const centerY = step8Canvas.height / 2;
    const headWidth = 120;
    const headHeight = 160;
    const eyeLine = centerY - headHeight * 0.1;
    const noseLine = centerY + headHeight * 0.3;
    const mouthLine = centerY + headHeight * 0.6;
    
    // Calculate light direction offset
    const lightOffset = getLightOffset();
    
    step8Ctx.fillStyle = `rgba(30, 41, 59, ${0.2 * lightIntensity / 100})`;
    
    // Eye socket shadows
    step8Ctx.beginPath();
    step8Ctx.ellipse(centerX - 35 + lightOffset.x * 5, eyeLine - 8 + lightOffset.y * 3, 18, 8, 0, 0, 2 * Math.PI);
    step8Ctx.fill();
    
    step8Ctx.beginPath();
    step8Ctx.ellipse(centerX + 35 + lightOffset.x * 5, eyeLine - 8 + lightOffset.y * 3, 18, 8, 0, 0, 2 * Math.PI);
    step8Ctx.fill();
    
    // Nose shadow
    step8Ctx.beginPath();
    step8Ctx.ellipse(centerX + lightOffset.x * 8, noseLine + 8 + lightOffset.y * 5, 12, 6, 0, 0, 2 * Math.PI);
    step8Ctx.fill();
    
    // Under lip shadow
    step8Ctx.beginPath();
    step8Ctx.ellipse(centerX + lightOffset.x * 3, mouthLine + 12 + lightOffset.y * 4, 20, 5, 0, 0, 2 * Math.PI);
    step8Ctx.fill();
    
    // Side face shadow (if light is from side)
    if (Math.abs(lightOffset.x) > 0.3) {
        const shadowSide = lightOffset.x > 0 ? -1 : 1;
        const shadowX = centerX + shadowSide * headWidth * 0.7;
        
        step8Ctx.fillStyle = `rgba(30, 41, 59, ${0.15 * lightIntensity / 100})`;
        step8Ctx.beginPath();
        step8Ctx.ellipse(shadowX, centerY, headWidth * 0.3, headHeight * 0.8, 0, 0, 2 * Math.PI);
        step8Ctx.fill();
    }
}

function addHighlights() {
    const centerX = step8Canvas.width / 2;
    const centerY = step8Canvas.height / 2;
    const headHeight = 160;
    const eyeLine = centerY - headHeight * 0.1;
    const noseLine = centerY + headHeight * 0.3;
    
    // Calculate light direction offset
    const lightOffset = getLightOffset();
    const highlightIntensity = lightIntensity / 100;
    
    step8Ctx.fillStyle = `rgba(255, 255, 255, ${0.6 * highlightIntensity})`;
    
    // Forehead highlight
    step8Ctx.beginPath();
    step8Ctx.ellipse(
        centerX - lightOffset.x * 15, 
        centerY - headHeight * 0.6 - lightOffset.y * 10, 
        25, 12, 0, 0, 2 * Math.PI
    );
    step8Ctx.fill();
    
    // Nose tip highlight
    step8Ctx.beginPath();
    step8Ctx.ellipse(
        centerX - lightOffset.x * 3, 
        noseLine - 3 - lightOffset.y * 2, 
        4, 3, 0, 0, 2 * Math.PI
    );
    step8Ctx.fill();
    
    // Cheek highlight
    step8Ctx.beginPath();
    step8Ctx.ellipse(
        centerX - lightOffset.x * 40, 
        eyeLine + 20 - lightOffset.y * 5, 
        15, 8, 0, 0, 2 * Math.PI
    );
    step8Ctx.fill();
    
    step8Ctx.beginPath();
    step8Ctx.ellipse(
        centerX + lightOffset.x * 40, 
        eyeLine + 20 - lightOffset.y * 5, 
        15, 8, 0, 0, 2 * Math.PI
    );
    step8Ctx.fill();
    
    // Hair highlights
    const crownY = centerY - headHeight;
    step8Ctx.fillStyle = `rgba(255, 255, 255, ${0.4 * highlightIntensity})`;
    step8Ctx.beginPath();
    step8Ctx.ellipse(
        centerX - lightOffset.x * 20, 
        crownY - 20 - lightOffset.y * 8, 
        30, 8, -lightOffset.x * 0.3, 0, 2 * Math.PI
    );
    step8Ctx.fill();
}

function showSignatureArea() {
    const centerX = step8Canvas.width / 2;
    const centerY = step8Canvas.height / 2;
    const headHeight = 160;
    
    // Show signature area
    step8Ctx.strokeStyle = '#22c55e';
    step8Ctx.lineWidth = 2;
    step8Ctx.globalAlpha = 0.5;
    step8Ctx.setLineDash([5, 5]);
    
    const sigX = centerX + 150;
    const sigY = centerY + headHeight + 50;
    
    step8Ctx.strokeRect(sigX - 40, sigY - 10, 80, 20);
    
    step8Ctx.setLineDash([]);
    step8Ctx.fillStyle = '#22c55e';
    step8Ctx.font = '12px Inter';
    step8Ctx.fillText('Zona semnăturii', sigX - 35, sigY + 30);
    
    step8Ctx.globalAlpha = 1;
}

function getLightOffset() {
    const directions = {
        'top-left': {x: -0.7, y: -0.7},
        'top': {x: 0, y: -1},
        'top-right': {x: 0.7, y: -0.7},
        'left': {x: -1, y: 0},
        'center': {x: 0, y: 0},
        'right': {x: 1, y: 0},
        'bottom-left': {x: -0.7, y: 0.7},
        'bottom': {x: 0, y: 1},
        'bottom-right': {x: 0.7, y: 0.7}
    };
    
    return directions[currentLightDirection] || {x: -0.7, y: -0.7};
}

function initializeLightControls() {
    // This function is now empty since we removed the light controls
    console.log('Light controls initialization skipped - controls have been removed');
}

function setLightDirection(direction) {
    // This function is now empty since we removed the light controls
    console.log(`Light direction ${direction} was set, but light controls have been removed`);
}

function updateLightSource() {
    // This function is now empty since we removed the light source indicator
    console.log('Light source update skipped - light controls have been removed');
}

function showFinishingDemo() {
    const demoBtn = document.getElementById('show-finishing-demo');
    if (!demoBtn) return;
    
    demoBtn.classList.add('active');
    demoBtn.innerHTML = '<i class="fas fa-pause"></i> Demonstrație în curs...';
    
    // Demo sequence
    const steps = ['cleanup', 'symmetry', 'emphasis', 'shading', 'highlights', 'signature'];
    let currentStep = 0;
    
    const nextStep = () => {
        if (currentStep < steps.length) {
            highlightFinishingStep(steps[currentStep]);
            currentStep++;
            setTimeout(nextStep, 3000);
        } else {
            demoBtn.classList.remove('active');
            demoBtn.innerHTML = '<i class="fas fa-play"></i> Demonstrație Finalizare';
        }
    };
    
    setTimeout(nextStep, 500);
}

function showSymmetryGrid() {
    const guidelines = document.getElementById('finishing-guidelines');
    if (!guidelines) return;
    
    guidelines.classList.toggle('show');
    
    const btn = document.getElementById('show-symmetry-grid');
    if (!btn) return;
    
    btn.classList.toggle('active');
    
    if (guidelines.classList.contains('show')) {
        // Create symmetry grid
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.style.position = 'absolute';
        svg.style.top = '0';
        svg.style.left = '0';
        
        const centerX = step8Canvas.width / 2;
        const centerY = step8Canvas.height / 2;
        const headHeight = 160;
        
        // Vertical center line
        const centerLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        centerLine.setAttribute('x1', '50%');
        centerLine.setAttribute('y1', '20%');
        centerLine.setAttribute('x2', '50%');
        centerLine.setAttribute('y2', '80%');
        centerLine.setAttribute('stroke', '#22c55e');
        centerLine.setAttribute('stroke-width', '2');
        centerLine.setAttribute('stroke-dasharray', '5,5');
        centerLine.setAttribute('opacity', '0.7');
        svg.appendChild(centerLine);
        
        // Horizontal symmetry lines
        const eyeLineY = (centerY - headHeight * 0.1) / step8Canvas.height * 100;
        const eyeLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        eyeLine.setAttribute('x1', '30%');
        eyeLine.setAttribute('y1', `${eyeLineY}%`);
        eyeLine.setAttribute('x2', '70%');
        eyeLine.setAttribute('y2', `${eyeLineY}%`);
        eyeLine.setAttribute('stroke', '#3b82f6');
        eyeLine.setAttribute('stroke-width', '2');
        eyeLine.setAttribute('stroke-dasharray', '3,3');
        eyeLine.setAttribute('opacity', '0.6');
        svg.appendChild(eyeLine);
        
        guidelines.appendChild(svg);
    } else {
        guidelines.innerHTML = '';
    }
}

function clearStep8Canvas() {
    if (!step8Canvas) return;
    step8Ctx.clearRect(0, 0, step8Canvas.width, step8Canvas.height);
    
    // Reset states
    document.querySelectorAll('.finishing-step').forEach(step => {
        step.classList.remove('active');
    });
    
    // Reset tool buttons
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const lightShadowBtn = document.querySelector('[data-tool="light-shadow"]');
    if (lightShadowBtn) {
        lightShadowBtn.classList.add('active');
    }
    
    // Reset checkboxes
    document.querySelectorAll('.check-item input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Reactivate first step
    const firstStep = document.querySelector('[data-step="cleanup"]');
    if (firstStep) {
        firstStep.classList.add('active');
    }
    
    initializeStep8();
}

function applyTool(toolName) {
    // This function is now empty since we removed the finishing tools
    console.log(`Tool ${toolName} was clicked, but finishing tools have been removed`);
}

function checkSymmetry(featureName) {
    const checkbox = document.getElementById(`check-${featureName}`);
    if (checkbox && checkbox.checked) {
        console.log(`Verified symmetry for: ${featureName}`);
        
        // Visual feedback
        showSymmetryCheck();
        setTimeout(() => {
            const activeStep = document.querySelector('.finishing-step.active');
            if (activeStep) {
                applyFinishingStep(activeStep.dataset.step);
            }
        }, 1500);
    }
}

function addSignature() {
    const nameInput = document.getElementById('artist-name');
    const name = nameInput ? nameInput.value.trim() : '';
    
    if (!name) {
        alert('Te rog să introduci numele pentru semnătură!');
        return;
    }
    
    if (!step8Canvas) return;
    
    const centerX = step8Canvas.width / 2;
    const centerY = step8Canvas.height / 2;
    const headHeight = 160;
    
    // Add signature to canvas
    step8Ctx.fillStyle = '#4a5568';
    step8Ctx.font = 'italic 14px serif';
    step8Ctx.textAlign = 'right';
    
    const sigX = centerX + 180;
    const sigY = centerY + headHeight + 60;
    
    step8Ctx.fillText(name, sigX, sigY);
    
    // Visual feedback
    step8Ctx.strokeStyle = '#22c55e';
    step8Ctx.lineWidth = 1;
    step8Ctx.setLineDash([2, 2]);
    step8Ctx.strokeRect(sigX - 60, sigY - 15, 65, 20);
    
    setTimeout(() => {
        step8Ctx.setLineDash([]);
        step8Ctx.clearRect(sigX - 61, sigY - 16, 67, 22);
        step8Ctx.fillStyle = '#4a5568';
        step8Ctx.fillText(name, sigX, sigY);
    }, 2000);
    
    step8Ctx.textAlign = 'left';
    step8Ctx.setLineDash([]);
    
    // Clear input
    if (nameInput) {
        nameInput.value = '';
    }
    
    console.log(`Added signature: ${name}`);
}