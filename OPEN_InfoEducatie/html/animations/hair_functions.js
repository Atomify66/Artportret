// Step 7 Functions - Hair Drawing
// Canvas variables are defined in main script.js

// Initialize Step 7 when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Setup Step 7 canvas
    step7Canvas = document.getElementById('drawing-canvas-step7');
    if (step7Canvas) {
        step7Ctx = step7Canvas.getContext('2d');
        step7Ctx.lineCap = 'round';
        step7Ctx.lineJoin = 'round';
    }
    
    // Initialize style canvases
    initializeStyleCanvases();
    initializeTechniqueCanvases();
});

function initializeStep7() {
    if (!step7Canvas) return;
    
    // Draw complete head with all features
    drawCompletePortrait(step7Ctx, step7Canvas);
    
    // Highlight first hair step
    document.querySelectorAll('.hair-step').forEach(step => {
        step.classList.remove('active');
    });
    document.querySelector('[data-step="hairline"]').classList.add('active');
}

function drawCompletePortrait(ctx, canvas) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const headWidth = 120;
    const headHeight = 160;
    
    // Draw basic head structure
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    
    // Head outline
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, headWidth, headHeight, 0, 0, 2 * Math.PI);
    ctx.stroke();
    
    ctx.globalAlpha = 0.7;
    
    // Draw all facial features from previous steps
    const eyeLine = centerY - headHeight * 0.1;
    const noseLine = centerY + headHeight * 0.3;
    const mouthLine = centerY + headHeight * 0.6;
    const eyeWidth = 25;
    const eyeSpacing = 30;
    
    // Eyes
    ctx.fillStyle = '#4f46e5';
    ctx.fillRect(centerX - eyeSpacing - eyeWidth/2, eyeLine - 8, eyeWidth, 16);
    ctx.fillRect(centerX + eyeSpacing - eyeWidth/2, eyeLine - 8, eyeWidth, 16);
    
    // Eye pupils
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(centerX - eyeSpacing, eyeLine, 8, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(centerX + eyeSpacing, eyeLine, 8, 0, 2 * Math.PI);
    ctx.fill();
    
    // Eyebrows
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX - eyeSpacing - 15, eyeLine - 20);
    ctx.lineTo(centerX - eyeSpacing + 15, eyeLine - 15);
    ctx.moveTo(centerX + eyeSpacing - 15, eyeLine - 15);
    ctx.lineTo(centerX + eyeSpacing + 15, eyeLine - 20);
    ctx.stroke();
    
    // Nose
    ctx.strokeStyle = '#7c3aed';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX - 10, noseLine - 15);
    ctx.lineTo(centerX + 10, noseLine - 15);
    ctx.lineTo(centerX + 15, noseLine + 10);
    ctx.lineTo(centerX - 15, noseLine + 10);
    ctx.closePath();
    ctx.stroke();
    
    // Nostrils
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.ellipse(centerX - 8, noseLine + 5, 3, 2, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(centerX + 8, noseLine + 5, 3, 2, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // Mouth
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX - 30, mouthLine);
    ctx.quadraticCurveTo(centerX, mouthLine + 2, centerX + 30, mouthLine);
    ctx.stroke();
    
    // Upper lip
    ctx.beginPath();
    ctx.moveTo(centerX - 25, mouthLine - 5);
    ctx.quadraticCurveTo(centerX - 8, mouthLine - 8, centerX, mouthLine - 6);
    ctx.quadraticCurveTo(centerX + 8, mouthLine - 8, centerX + 25, mouthLine - 5);
    ctx.stroke();
    
    // Ears (simplified)
    const earCenterY = (eyeLine + noseLine) / 2;
    const earHeight = noseLine - eyeLine;
    const earWidth = earHeight * 0.6;
    const leftEarX = centerX - headWidth - 5;
    const rightEarX = centerX + headWidth - 5;
    
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(leftEarX, earCenterY, earWidth/2, earHeight/2, 0, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(rightEarX, earCenterY, earWidth/2, earHeight/2, 0, 0, 2 * Math.PI);
    ctx.stroke();
    
    ctx.globalAlpha = 1;
}

function highlightHairStep(stepName) {
    // Update active step
    document.querySelectorAll('.hair-step').forEach(step => {
        step.classList.remove('active');
    });
    document.querySelector(`[data-step="${stepName}"]`).classList.add('active');
    
    // Show corresponding hair drawing stage
    drawHairStep(stepName);
}

function drawHairStep(stepName) {
    if (!step7Canvas) return;
    
    const centerX = step7Canvas.width / 2;
    const centerY = step7Canvas.height / 2;
    const headWidth = 120;
    const headHeight = 160;
    
    // Clear and redraw base
    step7Ctx.clearRect(0, 0, step7Canvas.width, step7Canvas.height);
    drawCompletePortrait(step7Ctx, step7Canvas);
    
    // Calculate hair positioning
    const crownY = centerY - headHeight;
    const hairlineY = centerY - headHeight * 0.75; // ¼ from crown
    const foreheadHeight = headHeight * 0.25;
    
    step7Ctx.strokeStyle = '#8b5cf6';
    step7Ctx.fillStyle = '#8b5cf6';
    step7Ctx.lineWidth = 2;
    
    switch(stepName) {
        case 'hairline':
            // Show hairline positioning
            step7Ctx.strokeStyle = '#a855f7';
            step7Ctx.lineWidth = 3;
            step7Ctx.globalAlpha = 0.8;
            step7Ctx.setLineDash([5, 5]);
            
            // Hairline
            step7Ctx.beginPath();
            step7Ctx.moveTo(centerX - headWidth + 20, hairlineY);
            step7Ctx.quadraticCurveTo(centerX, hairlineY - 10, centerX + headWidth - 20, hairlineY);
            step7Ctx.stroke();
            
            // Crown reference
            step7Ctx.strokeStyle = '#8b5cf6';
            step7Ctx.setLineDash([2, 2]);
            step7Ctx.beginPath();
            step7Ctx.moveTo(centerX - headWidth, crownY);
            step7Ctx.lineTo(centerX + headWidth, crownY);
            step7Ctx.stroke();
            
            step7Ctx.setLineDash([]);
            
            // Measurement arrows
            step7Ctx.strokeStyle = '#f59e0b';
            step7Ctx.lineWidth = 2;
            step7Ctx.beginPath();
            step7Ctx.moveTo(centerX + headWidth + 20, crownY);
            step7Ctx.lineTo(centerX + headWidth + 20, hairlineY);
            step7Ctx.stroke();
            
            // Labels
            step7Ctx.fillStyle = '#a855f7';
            step7Ctx.font = '12px Inter';
            step7Ctx.fillText('Linia părului', centerX + headWidth + 30, hairlineY);
            step7Ctx.fillStyle = '#f59e0b';
            step7Ctx.fillText('¼ din cap', centerX + headWidth + 30, (crownY + hairlineY) / 2);
            break;
            
        case 'volume':
            // Show hair volume above head
            step7Ctx.strokeStyle = '#8b5cf6';
            step7Ctx.fillStyle = 'rgba(139, 92, 246, 0.2)';
            step7Ctx.lineWidth = 2;
            
            // Hair volume outline
            step7Ctx.beginPath();
            step7Ctx.moveTo(centerX - headWidth - 10, hairlineY);
            step7Ctx.quadraticCurveTo(centerX - headWidth - 20, crownY - 20, centerX - 50, crownY - 25);
            step7Ctx.quadraticCurveTo(centerX, crownY - 35, centerX + 50, crownY - 25);
            step7Ctx.quadraticCurveTo(centerX + headWidth + 20, crownY - 20, centerX + headWidth + 10, hairlineY);
            step7Ctx.quadraticCurveTo(centerX, hairlineY - 10, centerX - headWidth - 10, hairlineY);
            step7Ctx.fill();
            step7Ctx.stroke();
            
            step7Ctx.fillStyle = '#8b5cf6';
            step7Ctx.font = '11px Inter';
            step7Ctx.fillText('Volum deasupra craniului', centerX - 80, crownY - 45);
            break;
            
        case 'direction':
            // Show hair direction flow
            drawHairDirectionGuides(step7Ctx, centerX, centerY, headWidth, headHeight);
            break;
            
        case 'strands':
            // Show hair strands technique
            drawHairStrands(step7Ctx, centerX, centerY, headWidth, headHeight, 'basic');
            break;
            
        case 'details':
            // Show hair details
            drawHairWithDetails(step7Ctx, centerX, centerY, headWidth, headHeight);
            break;
            
        case 'shading':
            // Show hair shading
            drawHairWithShading(step7Ctx, centerX, centerY, headWidth, headHeight);
            break;
    }
    
    step7Ctx.globalAlpha = 1;
}

function drawHairDirectionGuides(ctx, centerX, centerY, headWidth, headHeight) {
    const crownY = centerY - headHeight;
    const hairlineY = centerY - headHeight * 0.75;
    
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.7;
    
    // Direction arrows from crown
    const arrows = [
        // Center part
        {start: [centerX, crownY - 20], end: [centerX - 30, hairlineY + 30]},
        {start: [centerX, crownY - 20], end: [centerX + 30, hairlineY + 30]},
        // Left side
        {start: [centerX - 40, crownY - 15], end: [centerX - 80, centerY - 20]},
        {start: [centerX - 60, crownY - 10], end: [centerX - 100, centerY + 20]},
        // Right side
        {start: [centerX + 40, crownY - 15], end: [centerX + 80, centerY - 20]},
        {start: [centerX + 60, crownY - 10], end: [centerX + 100, centerY + 20]},
    ];
    
    arrows.forEach(arrow => {
        ctx.beginPath();
        ctx.moveTo(arrow.start[0], arrow.start[1]);
        ctx.lineTo(arrow.end[0], arrow.end[1]);
        ctx.stroke();
        
        // Arrow head
        const angle = Math.atan2(arrow.end[1] - arrow.start[1], arrow.end[0] - arrow.start[0]);
        ctx.beginPath();
        ctx.moveTo(arrow.end[0], arrow.end[1]);
        ctx.lineTo(arrow.end[0] - 8 * Math.cos(angle - Math.PI/6), arrow.end[1] - 8 * Math.sin(angle - Math.PI/6));
        ctx.moveTo(arrow.end[0], arrow.end[1]);
        ctx.lineTo(arrow.end[0] - 8 * Math.cos(angle + Math.PI/6), arrow.end[1] - 8 * Math.sin(angle + Math.PI/6));
        ctx.stroke();
    });
    
    ctx.fillStyle = '#8b5cf6';
    ctx.font = '11px Inter';
    ctx.fillText('Direcția firelor de păr', centerX - 60, crownY - 35);
}

function drawHairStrands(ctx, centerX, centerY, headWidth, headHeight, style = 'straight') {
    const crownY = centerY - headHeight;
    const hairlineY = centerY - headHeight * 0.75;
    
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.8;
    
    // Draw hair mass first
    ctx.fillStyle = 'rgba(100, 116, 139, 0.1)';
    ctx.beginPath();
    ctx.moveTo(centerX - headWidth - 15, hairlineY);
    ctx.quadraticCurveTo(centerX - headWidth - 25, crownY - 25, centerX - 60, crownY - 30);
    ctx.quadraticCurveTo(centerX, crownY - 40, centerX + 60, crownY - 30);
    ctx.quadraticCurveTo(centerX + headWidth + 25, crownY - 25, centerX + headWidth + 15, hairlineY);
    ctx.quadraticCurveTo(centerX, hairlineY - 15, centerX - headWidth - 15, hairlineY);
    ctx.fill();
    
    // Draw individual strands based on style
    switch(style) {
        case 'straight':
            drawStraightStrands(ctx, centerX, centerY, headWidth, headHeight);
            break;
        case 'wavy':
            drawWavyStrands(ctx, centerX, centerY, headWidth, headHeight);
            break;
        case 'curly':
            drawCurlyStrands(ctx, centerX, centerY, headWidth, headHeight);
            break;
        case 'short':
            drawShortStrands(ctx, centerX, centerY, headWidth, headHeight);
            break;
        default:
            drawStraightStrands(ctx, centerX, centerY, headWidth, headHeight);
    }
}

function drawStraightStrands(ctx, centerX, centerY, headWidth, headHeight) {
    const crownY = centerY - headHeight;
    const hairlineY = centerY - headHeight * 0.75;
    
    // Left side strands
    for (let i = 0; i < 8; i++) {
        const startX = centerX - 60 + i * 8;
        const startY = crownY - 25 + Math.random() * 10;
        const endX = startX - 20 + Math.random() * 40;
        const endY = centerY + 40 + Math.random() * 60;
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(startX - 10, (startY + endY) / 2, endX, endY);
        ctx.stroke();
    }
    
    // Right side strands
    for (let i = 0; i < 8; i++) {
        const startX = centerX - 4 + i * 8;
        const startY = crownY - 25 + Math.random() * 10;
        const endX = startX - 20 + Math.random() * 40;
        const endY = centerY + 40 + Math.random() * 60;
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(startX + 10, (startY + endY) / 2, endX, endY);
        ctx.stroke();
    }
}

function drawWavyStrands(ctx, centerX, centerY, headWidth, headHeight) {
    const crownY = centerY - headHeight;
    
    for (let i = 0; i < 12; i++) {
        const startX = centerX - 80 + i * 14;
        const startY = crownY - 20 + Math.random() * 15;
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        
        for (let j = 0; j < 6; j++) {
            const y = startY + j * 20;
            const waveX = startX + Math.sin(j * 0.8) * (8 + Math.random() * 4);
            ctx.lineTo(waveX, y);
        }
        ctx.stroke();
    }
}

function drawCurlyStrands(ctx, centerX, centerY, headWidth, headHeight) {
    const crownY = centerY - headHeight;
    
    for (let i = 0; i < 10; i++) {
        const startX = centerX - 70 + i * 14;
        const startY = crownY - 15 + Math.random() * 10;
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        
        let currentX = startX;
        let currentY = startY;
        
        for (let j = 0; j < 8; j++) {
            const radius = 4 + Math.random() * 3;
            const angle = j * Math.PI;
            currentX += Math.cos(angle) * radius;
            currentY += 8 + Math.random() * 4;
            
            ctx.quadraticCurveTo(
                currentX + Math.sin(angle) * radius,
                currentY - radius,
                currentX,
                currentY
            );
        }
        ctx.stroke();
    }
}

function drawShortStrands(ctx, centerX, centerY, headWidth, headHeight) {
    const crownY = centerY - headHeight;
    const hairlineY = centerY - headHeight * 0.75;
    
    // Short spiky strands
    for (let i = 0; i < 15; i++) {
        const startX = centerX - 75 + i * 10;
        const startY = hairlineY + Math.random() * 20;
        const endX = startX + (Math.random() - 0.5) * 20;
        const endY = startY - 15 - Math.random() * 10;
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
    }
}

function drawHairWithDetails(ctx, centerX, centerY, headWidth, headHeight) {
    // Draw basic hair shape first
    drawHairStrands(ctx, centerX, centerY, headWidth, headHeight, 'straight');
    
    const crownY = centerY - headHeight;
    const hairlineY = centerY - headHeight * 0.75;
    
    // Add hair part
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX, crownY - 25);
    ctx.lineTo(centerX, hairlineY);
    ctx.stroke();
    
    // Add flyaway strands
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
        const x = centerX - 40 + Math.random() * 80;
        const y = crownY - 20 + Math.random() * 30;
        const endX = x + (Math.random() - 0.5) * 30;
        const endY = y - 10 - Math.random() * 15;
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x + (Math.random() - 0.5) * 20, y - 5, endX, endY);
        ctx.stroke();
    }
    
    // Add hair layers
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.6;
    
    ctx.beginPath();
    ctx.moveTo(centerX - headWidth, hairlineY + 20);
    ctx.quadraticCurveTo(centerX - 20, hairlineY + 40, centerX + headWidth, hairlineY + 20);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(centerX - headWidth + 20, hairlineY + 40);
    ctx.quadraticCurveTo(centerX, hairlineY + 60, centerX + headWidth - 20, hairlineY + 40);
    ctx.stroke();
}

function drawHairWithShading(ctx, centerX, centerY, headWidth, headHeight) {
    // Draw hair with details first
    drawHairWithDetails(ctx, centerX, centerY, headWidth, headHeight);
    
    const crownY = centerY - headHeight;
    const hairlineY = centerY - headHeight * 0.75;
    
    // Add shadows
    ctx.fillStyle = 'rgba(30, 41, 59, 0.3)';
    
    // Shadow under hair layers
    ctx.beginPath();
    ctx.moveTo(centerX - headWidth + 10, hairlineY + 15);
    ctx.quadraticCurveTo(centerX - 30, hairlineY + 35, centerX - 10, hairlineY + 25);
    ctx.quadraticCurveTo(centerX + 30, hairlineY + 35, centerX + headWidth - 10, hairlineY + 15);
    ctx.lineTo(centerX + headWidth - 10, hairlineY + 30);
    ctx.quadraticCurveTo(centerX, hairlineY + 50, centerX - headWidth + 10, hairlineY + 30);
    ctx.closePath();
    ctx.fill();
    
    // Add highlights
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    
    // Top highlight
    ctx.beginPath();
    ctx.ellipse(centerX - 20, crownY - 20, 25, 8, -0.3, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.beginPath();
    ctx.ellipse(centerX + 30, crownY - 15, 20, 6, 0.3, 0, 2 * Math.PI);
    ctx.fill();
    
    // Side highlights
    ctx.beginPath();
    ctx.ellipse(centerX - 60, hairlineY + 30, 8, 20, 0.2, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.beginPath();
    ctx.ellipse(centerX + 55, hairlineY + 35, 8, 18, -0.2, 0, 2 * Math.PI);
    ctx.fill();
}

function showHairDemo() {
    const demoBtn = document.getElementById('show-hair-demo');
    if (!demoBtn) return;
    
    demoBtn.classList.add('active');
    demoBtn.innerHTML = '<i class="fas fa-pause"></i> Demonstrație în curs...';
    
    // Demo sequence
    const steps = ['hairline', 'volume', 'direction', 'strands', 'details', 'shading'];
    let currentStep = 0;
    
    const nextStep = () => {
        if (currentStep < steps.length) {
            highlightHairStep(steps[currentStep]);
            currentStep++;
            setTimeout(nextStep, 3000);
        } else {
            demoBtn.classList.remove('active');
            demoBtn.innerHTML = '<i class="fas fa-play"></i> Demonstrație Păr';
        }
    };
    
    setTimeout(nextStep, 500);
}

function showHairGrid() {
    const guidelines = document.getElementById('hair-guidelines');
    if (!guidelines) return;
    
    guidelines.classList.toggle('show');
    
    const btn = document.getElementById('show-hair-grid');
    if (!btn) return;
    
    btn.classList.toggle('active');
    
    if (guidelines.classList.contains('show')) {
        // Create hair positioning grid
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.style.position = 'absolute';
        svg.style.top = '0';
        svg.style.left = '0';
        
        const centerX = step7Canvas.width / 2;
        const centerY = step7Canvas.height / 2;
        const headHeight = 160;
        const crownY = centerY - headHeight;
        const hairlineY = centerY - headHeight * 0.75;
        
        // Crown line
        const crownLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        const crownYPercent = crownY / step7Canvas.height * 100;
        crownLine.setAttribute('x1', '15%');
        crownLine.setAttribute('y1', `${crownYPercent}%`);
        crownLine.setAttribute('x2', '85%');
        crownLine.setAttribute('y2', `${crownYPercent}%`);
        crownLine.setAttribute('stroke', '#8b5cf6');
        crownLine.setAttribute('stroke-width', '2');
        crownLine.setAttribute('stroke-dasharray', '5,5');
        crownLine.setAttribute('opacity', '0.7');
        svg.appendChild(crownLine);
        
        // Hairline
        const hairLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        const hairYPercent = hairlineY / step7Canvas.height * 100;
        hairLine.setAttribute('x1', '20%');
        hairLine.setAttribute('y1', `${hairYPercent}%`);
        hairLine.setAttribute('x2', '80%');
        hairLine.setAttribute('y2', `${hairYPercent}%`);
        hairLine.setAttribute('stroke', '#a855f7');
        hairLine.setAttribute('stroke-width', '3');
        hairLine.setAttribute('stroke-dasharray', '3,3');
        hairLine.setAttribute('opacity', '0.8');
        svg.appendChild(hairLine);
        
        // Volume area
        const volumeArea = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        volumeArea.setAttribute('x', '25%');
        volumeArea.setAttribute('y', `${crownYPercent - 3}%`);
        volumeArea.setAttribute('width', '50%');
        volumeArea.setAttribute('height', `${(hairlineY - crownY) / step7Canvas.height * 100 + 6}%`);
        volumeArea.setAttribute('fill', 'rgba(139, 92, 246, 0.15)');
        volumeArea.setAttribute('stroke', '#8b5cf6');
        volumeArea.setAttribute('stroke-width', '1');
        volumeArea.setAttribute('stroke-dasharray', '2,2');
        svg.appendChild(volumeArea);
        
        guidelines.appendChild(svg);
    } else {
        guidelines.innerHTML = '';
    }
}

function clearStep7Canvas() {
    if (!step7Canvas) return;
    step7Ctx.clearRect(0, 0, step7Canvas.width, step7Canvas.height);
    
    // Reset states
    document.querySelectorAll('.hair-step').forEach(step => {
        step.classList.remove('active');
    });
    
    // Reset style cards
    document.querySelectorAll('.style-card').forEach(card => {
        card.classList.remove('active');
    });
    const straightCard = document.querySelector('[data-style="straight"]');
    if (straightCard) {
        straightCard.classList.add('active');
    }
    
    // Tool buttons have been removed from the HTML
    
    // Reactivate first step
    const firstStep = document.querySelector('[data-step="hairline"]');
    if (firstStep) {
        firstStep.classList.add('active');
    }
    
    initializeStep7();
}

function initializeStyleCanvases() {
    const styles = ['straight', 'wavy', 'curly', 'short'];
    
    styles.forEach(style => {
        const canvas = document.querySelector(`[data-type="${style}"]`);
        if (canvas) {
            const ctx = canvas.getContext('2d');
            drawStyleDemo(ctx, canvas, style);
        }
    });
    
    // Add click handlers for style cards
    document.querySelectorAll('.style-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const style = e.currentTarget.dataset.style;
            selectHairStyle(style);
        });
    });
}

function drawStyleDemo(ctx, canvas, style) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const headWidth = 25;
    const headHeight = 35;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw simple head
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + 10, headWidth, headHeight, 0, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Draw hair based on style
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    
    switch(style) {
        case 'straight':
            // Straight hair
            for (let i = 0; i < 8; i++) {
                const x = centerX - 20 + i * 5;
                const startY = centerY - 15;
                const endY = centerY + 35;
                
                ctx.beginPath();
                ctx.moveTo(x, startY);
                ctx.lineTo(x + (Math.random() - 0.5) * 4, endY);
                ctx.stroke();
            }
            break;
            
        case 'wavy':
            // Wavy hair
            for (let i = 0; i < 6; i++) {
                const x = centerX - 15 + i * 5;
                const startY = centerY - 12;
                
                ctx.beginPath();
                ctx.moveTo(x, startY);
                for (let j = 0; j < 4; j++) {
                    const y = startY + j * 8;
                    const waveX = x + Math.sin(j) * 3;
                    ctx.lineTo(waveX, y);
                }
                ctx.stroke();
            }
            break;
            
        case 'curly':
            // Curly hair
            for (let i = 0; i < 5; i++) {
                const x = centerX - 12 + i * 6;
                const startY = centerY - 10;
                
                ctx.beginPath();
                ctx.moveTo(x, startY);
                
                let currentX = x;
                let currentY = startY;
                
                for (let j = 0; j < 4; j++) {
                    const radius = 2;
                    const angle = j * Math.PI;
                    currentX += Math.cos(angle) * radius;
                    currentY += 6;
                    
                    ctx.quadraticCurveTo(
                        currentX + Math.sin(angle) * radius,
                        currentY - radius,
                        currentX,
                        currentY
                    );
                }
                ctx.stroke();
            }
            break;
            
        case 'short':
            // Short hair
            for (let i = 0; i < 10; i++) {
                const x = centerX - 20 + i * 4;
                const startY = centerY - 5 + Math.random() * 10;
                const endY = startY - 8 - Math.random() * 5;
                
                ctx.beginPath();
                ctx.moveTo(x, startY);
                ctx.lineTo(x + (Math.random() - 0.5) * 6, endY);
                ctx.stroke();
            }
            break;
    }
}

function selectHairStyle(style) {
    // Update active style card
    document.querySelectorAll('.style-card').forEach(card => {
        card.classList.remove('active');
    });
    const selectedCard = document.querySelector(`[data-style="${style}"]`);
    if (selectedCard) {
        selectedCard.classList.add('active');
    }
    
    // Update main canvas with selected style
    if (step7Canvas) {
        step7Ctx.clearRect(0, 0, step7Canvas.width, step7Canvas.height);
        drawCompletePortrait(step7Ctx, step7Canvas);
        
        const centerX = step7Canvas.width / 2;
        const centerY = step7Canvas.height / 2;
        const headWidth = 120;
        const headHeight = 160;
        
        drawHairStrands(step7Ctx, centerX, centerY, headWidth, headHeight, style);
    }
}

function initializeTechniqueCanvases() {
    const techniques = ['strand', 'flow', 'volume', 'shading'];
    
    techniques.forEach(technique => {
        const canvas = document.querySelector(`[data-type="${technique}"]`);
        if (canvas) {
            const ctx = canvas.getContext('2d');
            drawTechniqueDemo(ctx, canvas, technique);
        }
    });
}

function drawTechniqueDemo(ctx, canvas, technique) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    
    switch(technique) {
        case 'strand':
            // Show strand grouping
            ctx.strokeStyle = '#8b5cf6';
            for (let i = 0; i < 3; i++) {
                const x = centerX - 30 + i * 30;
                for (let j = 0; j < 4; j++) {
                    const strandX = x - 6 + j * 4;
                    ctx.beginPath();
                    ctx.moveTo(strandX, 20);
                    ctx.lineTo(strandX + (Math.random() - 0.5) * 4, 80);
                    ctx.stroke();
                }
            }
            break;
            
        case 'flow':
            // Show natural flow
            ctx.strokeStyle = '#059669';
            const flowPaths = [
                {start: [40, 20], control: [60, 40], end: [80, 70]},
                {start: [60, 15], control: [80, 35], end: [100, 65]},
                {start: [80, 25], control: [100, 45], end: [120, 75]},
            ];
            
            flowPaths.forEach(path => {
                ctx.beginPath();
                ctx.moveTo(path.start[0], path.start[1]);
                ctx.quadraticCurveTo(path.control[0], path.control[1], path.end[0], path.end[1]);
                ctx.stroke();
            });
            break;
            
        case 'volume':
            // Show volume technique
            ctx.fillStyle = 'rgba(139, 92, 246, 0.2)';
            ctx.strokeStyle = '#8b5cf6';
            
            ctx.beginPath();
            ctx.moveTo(30, 60);
            ctx.quadraticCurveTo(75, 20, 120, 60);
            ctx.lineTo(110, 70);
            ctx.quadraticCurveTo(75, 35, 40, 70);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;
            
        case 'shading':
            // Show light and shadow
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.beginPath();
            ctx.ellipse(centerX - 20, centerY - 10, 15, 8, 0, 0, 2 * Math.PI);
            ctx.fill();
            
            ctx.fillStyle = 'rgba(30, 41, 59, 0.4)';
            ctx.beginPath();
            ctx.ellipse(centerX + 20, centerY + 10, 15, 8, 0, 0, 2 * Math.PI);
            ctx.fill();
            break;
    }
}

function applyHairTexture(texture) {
    // This function is now empty since we removed the hair texture tools
    console.log(`Hair texture ${texture} was requested, but hair tools have been removed`);
}

function applyHairHighlight(highlight) {
    // This function is now empty since we removed the hair highlight tools
    console.log(`Hair highlight ${highlight} was requested, but hair tools have been removed`);
}

function applyHairDetail(detail) {
    // This function is now empty since we removed the hair detail tools
    console.log(`Hair detail ${detail} was requested, but hair tools have been removed`);
}