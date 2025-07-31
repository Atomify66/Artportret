// Step 6 Functions - Ear Drawing
// Canvas variables are defined in main script.js

// Initialize Step 6 when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Setup Step 6 canvas
    step6Canvas = document.getElementById('drawing-canvas-step6');
    if (step6Canvas) {
        step6Ctx = step6Canvas.getContext('2d');
        step6Ctx.lineCap = 'round';
        step6Ctx.lineJoin = 'round';
    }
    
    // Initialize view canvases
    initializeViewCanvases();
});

function initializeStep6() {
    if (!step6Canvas) return;
    
    // Draw basic head with all previous features
    drawCompleteHead(step6Ctx, step6Canvas);
    
    // Highlight first ear step
    document.querySelectorAll('.ear-step').forEach(step => {
        step.classList.remove('active');
    });
    document.querySelector('[data-step="positioning"]').classList.add('active');
}

function drawCompleteHead(ctx, canvas) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const headWidth = 120;
    const headHeight = 160;
    
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    
    // Head outline
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, headWidth, headHeight, 0, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Facial guidelines
    ctx.setLineDash([3, 3]);
    
    // Eyes line (eyebrow line)
    const eyeLine = centerY;
    ctx.strokeStyle = '#4f46e5';
    ctx.beginPath();
    ctx.moveTo(centerX - headWidth, eyeLine);
    ctx.lineTo(centerX + headWidth, eyeLine);
    ctx.stroke();
    
    // Nose line
    const noseLine = centerY + headHeight / 2;
    ctx.strokeStyle = '#059669';
    ctx.beginPath();
    ctx.moveTo(centerX - headWidth, noseLine);
    ctx.lineTo(centerX + headWidth, noseLine);
    ctx.stroke();
    
    // Mouth line
    const mouthLine = centerY + headHeight * 3/4;
    ctx.strokeStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(centerX - headWidth, mouthLine);
    ctx.lineTo(centerX + headWidth, mouthLine);
    ctx.stroke();
    
    ctx.setLineDash([]);
    ctx.globalAlpha = 0.5;
    
    // Draw simplified facial features
    const eyeWidth = 25;
    const eyeSpacing = 30;
    
    // Eyes
    ctx.fillStyle = '#4f46e5';
    ctx.fillRect(centerX - eyeSpacing - eyeWidth/2, eyeLine - 8, eyeWidth, 16);
    ctx.fillRect(centerX + eyeSpacing - eyeWidth/2, eyeLine - 8, eyeWidth, 16);
    
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
    
    // Mouth (simplified)
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX - 30, mouthLine);
    ctx.quadraticCurveTo(centerX, mouthLine + 2, centerX + 30, mouthLine);
    ctx.stroke();
    
    ctx.globalAlpha = 1;
}

function highlightEarStep(stepName) {
    // Update active step
    document.querySelectorAll('.ear-step').forEach(step => {
        step.classList.remove('active');
    });
    document.querySelector(`[data-step="${stepName}"]`).classList.add('active');
    
    // Show corresponding ear drawing stage
    drawEarStep(stepName);
}

function drawEarStep(stepName) {
    if (!step6Canvas) return;
    
    const centerX = step6Canvas.width / 2;
    const centerY = step6Canvas.height / 2;
    const headWidth = 120;
    const headHeight = 160;
    const eyeLine = centerY;
    const noseLine = centerY + headHeight / 2;
    
    // Clear and redraw base
    step6Ctx.clearRect(0, 0, step6Canvas.width, step6Canvas.height);
    drawCompleteHead(step6Ctx, step6Canvas);
    
    step6Ctx.strokeStyle = '#4f46e5';
    step6Ctx.fillStyle = '#4f46e5';
    step6Ctx.lineWidth = 2;
    
    // Calculate ear positioning
    const earTop = eyeLine;
    const earBottom = noseLine;
    const earHeight = earBottom - earTop;
    const earWidth = earHeight * 0.6;
    const leftEarX = centerX - headWidth + 5;
    const rightEarX = centerX + headWidth - 5;
    const earCenterY = (earTop + earBottom) / 2;
    
    switch(stepName) {
        case 'positioning':
            // Show ear positioning area
            step6Ctx.strokeStyle = '#f59e0b';
            step6Ctx.lineWidth = 3;
            step6Ctx.globalAlpha = 0.8;
            step6Ctx.setLineDash([5, 5]);
            
            // Left ear area
            step6Ctx.strokeRect(leftEarX - earWidth/2, earTop, earWidth, earHeight);
            
            // Right ear area
            step6Ctx.strokeRect(rightEarX - earWidth/2, earTop, earWidth, earHeight);
            
            step6Ctx.setLineDash([]);
            
            step6Ctx.fillStyle = '#f59e0b';
            step6Ctx.font = '12px Inter';
            step6Ctx.fillText('Zona urechilor', centerX + headWidth + 20, earCenterY);
            break;
            
        case 'alignment':
            // Show alignment lines
            step6Ctx.strokeStyle = '#7c3aed';
            step6Ctx.setLineDash([2, 2]);
            step6Ctx.lineWidth = 2;
            
            // Highlight eyebrow/eye line
            step6Ctx.beginPath();
            step6Ctx.moveTo(centerX - headWidth - 20, eyeLine);
            step6Ctx.lineTo(centerX + headWidth + 20, eyeLine);
            step6Ctx.stroke();
            
            // Highlight nose base line
            step6Ctx.beginPath();
            step6Ctx.moveTo(centerX - headWidth - 20, noseLine);
            step6Ctx.lineTo(centerX + headWidth + 20, noseLine);
            step6Ctx.stroke();
            
            // Mark alignment points
            step6Ctx.fillStyle = '#7c3aed';
            step6Ctx.beginPath();
            step6Ctx.arc(leftEarX, eyeLine, 4, 0, 2 * Math.PI);
            step6Ctx.fill();
            step6Ctx.beginPath();
            step6Ctx.arc(leftEarX, noseLine, 4, 0, 2 * Math.PI);
            step6Ctx.fill();
            
            step6Ctx.beginPath();
            step6Ctx.arc(rightEarX, eyeLine, 4, 0, 2 * Math.PI);
            step6Ctx.fill();
            step6Ctx.beginPath();
            step6Ctx.arc(rightEarX, noseLine, 4, 0, 2 * Math.PI);
            step6Ctx.fill();
            
            step6Ctx.setLineDash([]);
            
            step6Ctx.font = '11px Inter';
            step6Ctx.fillText('Vârf = sprâncene', centerX + headWidth + 10, eyeLine - 10);
            step6Ctx.fillText('Lob = baza nasului', centerX + headWidth + 10, noseLine + 15);
            break;
            
        case 'shape':
            // Draw basic ear shape (oval)
            step6Ctx.strokeStyle = '#059669';
            step6Ctx.lineWidth = 2;
            
            // Left ear outline
            step6Ctx.beginPath();
            step6Ctx.ellipse(leftEarX, earCenterY, earWidth/2, earHeight/2, 0, 0, 2 * Math.PI);
            step6Ctx.stroke();
            
            // Right ear outline
            step6Ctx.beginPath();
            step6Ctx.ellipse(rightEarX, earCenterY, earWidth/2, earHeight/2, 0, 0, 2 * Math.PI);
            step6Ctx.stroke();
            
            step6Ctx.fillStyle = '#059669';
            step6Ctx.font = '11px Inter';
            step6Ctx.fillText('Oval alungit vertical', centerX + headWidth + 10, earCenterY);
            break;
            
        case 'size':
            // Show size measurements
            step6Ctx.strokeStyle = '#dc2626';
            step6Ctx.lineWidth = 1;
            step6Ctx.globalAlpha = 0.7;
            
            // Draw ear outlines
            step6Ctx.beginPath();
            step6Ctx.ellipse(leftEarX, earCenterY, earWidth/2, earHeight/2, 0, 0, 2 * Math.PI);
            step6Ctx.stroke();
            
            step6Ctx.beginPath();
            step6Ctx.ellipse(rightEarX, earCenterY, earWidth/2, earHeight/2, 0, 0, 2 * Math.PI);
            step6Ctx.stroke();
            
            // Show measurements
            step6Ctx.strokeStyle = '#dc2626';
            step6Ctx.lineWidth = 2;
            step6Ctx.setLineDash([3, 3]);
            
            // Height measurement
            step6Ctx.beginPath();
            step6Ctx.moveTo(rightEarX + earWidth/2 + 10, earTop);
            step6Ctx.lineTo(rightEarX + earWidth/2 + 10, earBottom);
            step6Ctx.stroke();
            
            // Width measurement
            step6Ctx.beginPath();
            step6Ctx.moveTo(rightEarX - earWidth/2, earBottom + 10);
            step6Ctx.lineTo(rightEarX + earWidth/2, earBottom + 10);
            step6Ctx.stroke();
            
            step6Ctx.setLineDash([]);
            
            step6Ctx.fillStyle = '#dc2626';
            step6Ctx.font = '10px Inter';
            step6Ctx.fillText(`${Math.round(earHeight)}px`, rightEarX + earWidth/2 + 15, earCenterY);
            step6Ctx.fillText(`${Math.round(earWidth)}px`, rightEarX - earWidth/4, earBottom + 25);
            break;
            
        case 'details':
            // Draw ears with internal details
            drawDetailedEar(step6Ctx, leftEarX, earCenterY, earWidth, earHeight, 'left');
            drawDetailedEar(step6Ctx, rightEarX, earCenterY, earWidth, earHeight, 'right');
            break;
            
        case 'perspective':
            // Draw ears from frontal perspective
            drawFrontalEar(step6Ctx, leftEarX, earCenterY, earWidth, earHeight, 'left');
            drawFrontalEar(step6Ctx, rightEarX, earCenterY, earWidth, earHeight, 'right');
            
            step6Ctx.fillStyle = '#4f46e5';
            step6Ctx.font = '11px Inter';
            step6Ctx.fillText('Perspectivă frontală', centerX + headWidth + 10, earCenterY - 20);
            step6Ctx.fillText('Pavilion parțial vizibil', centerX + headWidth + 10, earCenterY - 5);
            break;
    }
    
    step6Ctx.globalAlpha = 1;
}

function drawDetailedEar(ctx, centerX, centerY, width, height, side) {
    const w = width / 2;
    const h = height / 2;
    
    // Outer ear outline (helix)
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, w, h, 0, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Inner ear details
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    
    // Concha (inner bowl)
    ctx.beginPath();
    ctx.ellipse(centerX + (side === 'left' ? 2 : -2), centerY, w * 0.6, h * 0.7, 0, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Antihelix (inner ridge)
    ctx.beginPath();
    if (side === 'left') {
        ctx.arc(centerX + w * 0.3, centerY - h * 0.3, w * 0.4, Math.PI * 0.3, Math.PI * 1.2);
    } else {
        ctx.arc(centerX - w * 0.3, centerY - h * 0.3, w * 0.4, Math.PI * 1.8, Math.PI * 0.7);
    }
    ctx.stroke();
    
    // Tragus (front projection)
    ctx.beginPath();
    if (side === 'left') {
        ctx.ellipse(centerX + w * 0.6, centerY + h * 0.2, w * 0.15, h * 0.2, 0, 0, 2 * Math.PI);
    } else {
        ctx.ellipse(centerX - w * 0.6, centerY + h * 0.2, w * 0.15, h * 0.2, 0, 0, 2 * Math.PI);
    }
    ctx.stroke();
    
    // Earlobe
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + h * 0.7, w * 0.4, h * 0.3, 0, 0, 2 * Math.PI);
    ctx.stroke();
}

function drawFrontalEar(ctx, centerX, centerY, width, height, side) {
    const w = width / 2;
    const h = height / 2;
    
    // Adjust for frontal perspective - ears appear more narrow
    const perspectiveWidth = w * 0.7;
    
    // Outer rim visible from front
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    if (side === 'left') {
        // Left ear - only right edge visible
        ctx.arc(centerX, centerY, perspectiveWidth, -Math.PI * 0.3, Math.PI * 0.3);
        ctx.arc(centerX, centerY + h * 0.6, perspectiveWidth * 0.5, Math.PI * 0.3, Math.PI * 0.7);
    } else {
        // Right ear - only left edge visible
        ctx.arc(centerX, centerY, perspectiveWidth, Math.PI * 0.7, Math.PI * 1.3);
        ctx.arc(centerX, centerY + h * 0.6, perspectiveWidth * 0.5, Math.PI * 0.3, Math.PI * 0.7);
    }
    ctx.stroke();
    
    // Minimal inner details visible from front
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (side === 'left') {
        ctx.arc(centerX - perspectiveWidth * 0.3, centerY, perspectiveWidth * 0.4, 0, Math.PI);
    } else {
        ctx.arc(centerX + perspectiveWidth * 0.3, centerY, perspectiveWidth * 0.4, 0, Math.PI);
    }
    ctx.stroke();
}

function showEarDemo() {
    const demoBtn = document.getElementById('show-ear-demo');
    if (!demoBtn) return;
    
    demoBtn.classList.add('active');
    demoBtn.innerHTML = '<i class="fas fa-pause"></i> Demonstrație în curs...';
    
    // Demo sequence
    const steps = ['positioning', 'alignment', 'shape', 'size', 'details', 'perspective'];
    let currentStep = 0;
    
    const nextStep = () => {
        if (currentStep < steps.length) {
            highlightEarStep(steps[currentStep]);
            currentStep++;
            setTimeout(nextStep, 2500);
        } else {
            demoBtn.classList.remove('active');
            demoBtn.innerHTML = '<i class="fas fa-play"></i> Demonstrație Urechi';
        }
    };
    
    setTimeout(nextStep, 500);
}

function showEarGrid() {
    const guidelines = document.getElementById('ear-guidelines');
    if (!guidelines) return;
    
    guidelines.classList.toggle('show');
    
    const btn = document.getElementById('show-ear-grid');
    if (!btn) return;
    
    btn.classList.toggle('active');
    
    if (guidelines.classList.contains('show')) {
        // Create ear positioning grid
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.style.position = 'absolute';
        svg.style.top = '0';
        svg.style.left = '0';
        
        const centerX = step6Canvas.width / 2;
        const centerY = step6Canvas.height / 2;
        const headWidth = 120;
        const headHeight = 160;
        const eyeLine = centerY;
        const noseLine = centerY + headHeight / 2;
        
        // Horizontal alignment lines
        const eyeLineSvg = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        const eyeY = eyeLine / step6Canvas.height * 100;
        eyeLineSvg.setAttribute('x1', '10%');
        eyeLineSvg.setAttribute('y1', `${eyeY}%`);
        eyeLineSvg.setAttribute('x2', '90%');
        eyeLineSvg.setAttribute('y2', `${eyeY}%`);
        eyeLineSvg.setAttribute('stroke', '#4f46e5');
        eyeLineSvg.setAttribute('stroke-width', '2');
        eyeLineSvg.setAttribute('stroke-dasharray', '5,5');
        eyeLineSvg.setAttribute('opacity', '0.7');
        svg.appendChild(eyeLineSvg);
        
        const noseLineSvg = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        const noseY = noseLine / step6Canvas.height * 100;
        noseLineSvg.setAttribute('x1', '10%');
        noseLineSvg.setAttribute('y1', `${noseY}%`);
        noseLineSvg.setAttribute('x2', '90%');
        noseLineSvg.setAttribute('y2', `${noseY}%`);
        noseLineSvg.setAttribute('stroke', '#059669');
        noseLineSvg.setAttribute('stroke-width', '2');
        noseLineSvg.setAttribute('stroke-dasharray', '5,5');
        noseLineSvg.setAttribute('opacity', '0.7');
        svg.appendChild(noseLineSvg);
        
        // Vertical ear position lines
        const leftEarX = (centerX - headWidth + 5) / step6Canvas.width * 100;
        const leftEarLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        leftEarLine.setAttribute('x1', `${leftEarX}%`);
        leftEarLine.setAttribute('y1', `${eyeY - 5}%`);
        leftEarLine.setAttribute('x2', `${leftEarX}%`);
        leftEarLine.setAttribute('y2', `${noseY + 5}%`);
        leftEarLine.setAttribute('stroke', '#f59e0b');
        leftEarLine.setAttribute('stroke-width', '2');
        leftEarLine.setAttribute('stroke-dasharray', '3,3');
        leftEarLine.setAttribute('opacity', '0.7');
        svg.appendChild(leftEarLine);
        
        const rightEarX = (centerX + headWidth - 5) / step6Canvas.width * 100;
        const rightEarLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        rightEarLine.setAttribute('x1', `${rightEarX}%`);
        rightEarLine.setAttribute('y1', `${eyeY - 5}%`);
        rightEarLine.setAttribute('x2', `${rightEarX}%`);
        rightEarLine.setAttribute('y2', `${noseY + 5}%`);
        rightEarLine.setAttribute('stroke', '#f59e0b');
        rightEarLine.setAttribute('stroke-width', '2');
        rightEarLine.setAttribute('stroke-dasharray', '3,3');
        rightEarLine.setAttribute('opacity', '0.7');
        svg.appendChild(rightEarLine);
        
        guidelines.appendChild(svg);
    } else {
        guidelines.innerHTML = '';
    }
}

function highlightEarPart(partName) {
    console.log(`Highlighting ear part: ${partName}`);
    
    if (!step6Canvas) return;
    
    const centerX = step6Canvas.width / 2;
    const centerY = step6Canvas.height / 2;
    const headWidth = 120;
    const headHeight = 160;
    const eyeLine = centerY;
    const noseLine = centerY + headHeight / 2;
    const earCenterY = (eyeLine + noseLine) / 2;
    const earHeight = noseLine - eyeLine;
    const earWidth = earHeight * 0.6;
    const leftEarX = centerX - headWidth + 5;
    const rightEarX = centerX + headWidth - 5;
    
    // Clear and redraw complete head with ears
    step6Ctx.clearRect(0, 0, step6Canvas.width, step6Canvas.height);
    drawCompleteHead(step6Ctx, step6Canvas);
    drawDetailedEar(step6Ctx, leftEarX, earCenterY, earWidth, earHeight, 'left');
    drawDetailedEar(step6Ctx, rightEarX, earCenterY, earWidth, earHeight, 'right');
    
    // Highlight specific part
    step6Ctx.strokeStyle = '#ef4444';
    step6Ctx.lineWidth = 3;
    step6Ctx.globalAlpha = 0.8;
    
    const w = earWidth / 2;
    const h = earHeight / 2;
    
    switch(partName) {
        case 'helix':
            // Highlight outer rim
            step6Ctx.beginPath();
            step6Ctx.ellipse(leftEarX, earCenterY, w, h, 0, 0, 2 * Math.PI);
            step6Ctx.moveTo(rightEarX + w, earCenterY);
            step6Ctx.ellipse(rightEarX, earCenterY, w, h, 0, 0, 2 * Math.PI);
            step6Ctx.stroke();
            break;
        case 'concha':
            // Highlight inner bowl
            step6Ctx.beginPath();
            step6Ctx.ellipse(leftEarX + 2, earCenterY, w * 0.6, h * 0.7, 0, 0, 2 * Math.PI);
            step6Ctx.moveTo(rightEarX - 2 + w * 0.6, earCenterY);
            step6Ctx.ellipse(rightEarX - 2, earCenterY, w * 0.6, h * 0.7, 0, 0, 2 * Math.PI);
            step6Ctx.stroke();
            break;
        case 'lobe':
            // Highlight earlobes
            step6Ctx.beginPath();
            step6Ctx.ellipse(leftEarX, earCenterY + h * 0.7, w * 0.4, h * 0.3, 0, 0, 2 * Math.PI);
            step6Ctx.moveTo(rightEarX + w * 0.4, earCenterY + h * 0.7);
            step6Ctx.ellipse(rightEarX, earCenterY + h * 0.7, w * 0.4, h * 0.3, 0, 0, 2 * Math.PI);
            step6Ctx.stroke();
            break;
        case 'antihelix':
            // Highlight inner ridges
            step6Ctx.beginPath();
            step6Ctx.arc(leftEarX + w * 0.3, earCenterY - h * 0.3, w * 0.4, Math.PI * 0.3, Math.PI * 1.2);
            step6Ctx.moveTo(rightEarX - w * 0.3 + w * 0.4, earCenterY - h * 0.3);
            step6Ctx.arc(rightEarX - w * 0.3, earCenterY - h * 0.3, w * 0.4, Math.PI * 1.8, Math.PI * 0.7);
            step6Ctx.stroke();
            break;
        case 'tragus':
            // Highlight front projections
            step6Ctx.beginPath();
            step6Ctx.ellipse(leftEarX + w * 0.6, earCenterY + h * 0.2, w * 0.15, h * 0.2, 0, 0, 2 * Math.PI);
            step6Ctx.moveTo(rightEarX - w * 0.6 + w * 0.15, earCenterY + h * 0.2);
            step6Ctx.ellipse(rightEarX - w * 0.6, earCenterY + h * 0.2, w * 0.15, h * 0.2, 0, 0, 2 * Math.PI);
            step6Ctx.stroke();
            break;
    }
    
    step6Ctx.globalAlpha = 1;
}

function clearStep6Canvas() {
    if (!step6Canvas) return;
    step6Ctx.clearRect(0, 0, step6Canvas.width, step6Canvas.height);
    
    // Reset states
    document.querySelectorAll('.ear-step').forEach(step => {
        step.classList.remove('active');
    });
    
    // Reset view cards
    document.querySelectorAll('.view-card').forEach(card => {
        card.classList.remove('active');
    });
    const frontCard = document.querySelector('[data-view="front"]');
    if (frontCard) {
        frontCard.classList.add('active');
    }
    
    // Reactivate first step
    const firstStep = document.querySelector('[data-step="positioning"]');
    if (firstStep) {
        firstStep.classList.add('active');
    }
    
    initializeStep6();
}

function initializeViewCanvases() {
    const views = ['front', 'quarter', 'profile', 'covered'];
    
    views.forEach(view => {
        const canvas = document.querySelector(`[data-type="${view}"]`);
        if (canvas) {
            const ctx = canvas.getContext('2d');
            drawViewDemo(ctx, canvas, view);
        }
    });
    
    // Add click handlers for view cards
    document.querySelectorAll('.view-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const view = e.currentTarget.dataset.view;
            selectView(view);
        });
    });
}

function drawViewDemo(ctx, canvas, view) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const headWidth = 35;
    const headHeight = 45;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw head outline based on view
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    
    switch(view) {
        case 'front':
            ctx.ellipse(centerX, centerY, headWidth, headHeight, 0, 0, 2 * Math.PI);
            break;
        case 'quarter':
            // 3/4 view - slightly rotated
            ctx.ellipse(centerX - 5, centerY, headWidth * 0.9, headHeight, 0, 0, 2 * Math.PI);
            break;
        case 'profile':
            // Profile view
            ctx.ellipse(centerX, centerY, headWidth * 0.7, headHeight, 0, 0, 2 * Math.PI);
            break;
        case 'covered':
            ctx.ellipse(centerX, centerY, headWidth, headHeight, 0, 0, 2 * Math.PI);
            break;
    }
    ctx.stroke();
    
    // Draw facial features
    ctx.fillStyle = '#64748b';
    
    // Eyes
    if (view !== 'profile') {
        ctx.beginPath();
        ctx.ellipse(centerX - 10, centerY - 8, 2, 1, 0, 0, 2 * Math.PI);
        ctx.fill();
        if (view !== 'quarter') {
            ctx.beginPath();
            ctx.ellipse(centerX + 10, centerY - 8, 2, 1, 0, 0, 2 * Math.PI);
            ctx.fill();
        }
    } else {
        ctx.beginPath();
        ctx.ellipse(centerX + 8, centerY - 8, 2, 1, 0, 0, 2 * Math.PI);
        ctx.fill();
    }
    
    // Nose
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (view === 'profile') {
        ctx.moveTo(centerX + 15, centerY - 5);
        ctx.lineTo(centerX + 20, centerY + 5);
        ctx.lineTo(centerX + 15, centerY + 8);
    } else {
        ctx.moveTo(centerX - 1, centerY);
        ctx.lineTo(centerX + 1, centerY);
        ctx.lineTo(centerX + 2, centerY + 3);
        ctx.lineTo(centerX - 2, centerY + 3);
        ctx.closePath();
    }
    ctx.stroke();
    
    // Draw ears based on view
    drawEarsForView(ctx, centerX, centerY, headWidth, headHeight, view);
    
    // Draw hair for covered view
    if (view === 'covered') {
        ctx.fillStyle = '#8b5cf6';
        ctx.beginPath();
        ctx.ellipse(centerX, centerY - headHeight * 0.3, headWidth * 1.1, headHeight * 0.6, 0, 0, Math.PI, true);
        ctx.fill();
    }
}

function drawEarsForView(ctx, centerX, centerY, headWidth, headHeight, view) {
    const earHeight = headHeight * 0.4;
    const earWidth = earHeight * 0.4;
    
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    
    switch(view) {
        case 'front':
            // Minimal ear visibility from front
            ctx.beginPath();
            ctx.arc(centerX - headWidth - 2, centerY, earWidth * 0.5, -Math.PI * 0.3, Math.PI * 0.3);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(centerX + headWidth + 2, centerY, earWidth * 0.5, Math.PI * 0.7, Math.PI * 1.3);
            ctx.stroke();
            break;
        case 'quarter':
            // More ear visible in 3/4 view
            ctx.beginPath();
            ctx.ellipse(centerX + headWidth + 2, centerY, earWidth, earHeight, 0, 0, 2 * Math.PI);
            ctx.stroke();
            break;
        case 'profile':
            // Full ear visible in profile
            ctx.beginPath();
            ctx.ellipse(centerX + headWidth - 5, centerY, earWidth * 1.2, earHeight, 0, 0, 2 * Math.PI);
            ctx.stroke();
            // Add inner ear details
            ctx.strokeStyle = '#64748b';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.ellipse(centerX + headWidth - 3, centerY, earWidth * 0.7, earHeight * 0.8, 0, 0, 2 * Math.PI);
            ctx.stroke();
            break;
        case 'covered':
            // Ears mostly hidden by hair
            ctx.globalAlpha = 0.3;
            ctx.beginPath();
            ctx.arc(centerX - headWidth - 2, centerY + 5, earWidth * 0.3, 0, Math.PI);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(centerX + headWidth + 2, centerY + 5, earWidth * 0.3, 0, Math.PI);
            ctx.stroke();
            ctx.globalAlpha = 1;
            break;
    }
}

function selectView(view) {
    // Update active view card
    document.querySelectorAll('.view-card').forEach(card => {
        card.classList.remove('active');
    });
    const selectedCard = document.querySelector(`[data-view="${view}"]`);
    if (selectedCard) {
        selectedCard.classList.add('active');
    }
    
    // Update main canvas with selected view
    if (step6Canvas) {
        step6Ctx.clearRect(0, 0, step6Canvas.width, step6Canvas.height);
        
        // Draw head based on selected view
        if (view === 'front') {
            drawCompleteHead(step6Ctx, step6Canvas);
            drawEarStep('perspective');
        } else if (view === 'quarter') {
            // Draw 3/4 view
            drawQuarterView();
        } else if (view === 'profile') {
            // Draw profile view
            drawProfileView();
        } else if (view === 'covered') {
            // Draw with hair covering ears
            drawCoveredView();
        }
    }
}

function drawQuarterView() {
    // Implementation for 3/4 view would go here
    drawCompleteHead(step6Ctx, step6Canvas);
    // Adjust ear visibility for 3/4 view
    const centerX = step6Canvas.width / 2;
    const centerY = step6Canvas.height / 2;
    const headHeight = 160;
    const eyeLine = centerY;
    const noseLine = centerY + headHeight / 2;
    const earCenterY = (eyeLine + noseLine) / 2;
    const earHeight = noseLine - eyeLine;
    const earWidth = earHeight * 0.6;
    const rightEarX = centerX + 120 - 5;
    
    // Only show right ear in 3/4 view
    drawDetailedEar(step6Ctx, rightEarX, earCenterY, earWidth, earHeight, 'right');
}

function drawProfileView() {
    // Implementation for profile view would go here
    drawCompleteHead(step6Ctx, step6Canvas);
    // Show full ear in profile
    const centerX = step6Canvas.width / 2;
    const centerY = step6Canvas.height / 2;
    const headHeight = 160;
    const eyeLine = centerY;
    const noseLine = centerY + headHeight / 2;
    const earCenterY = (eyeLine + noseLine) / 2;
    const earHeight = noseLine - eyeLine;
    const earWidth = earHeight * 0.8; // Wider in profile
    const earX = centerX + 110;
    
    drawDetailedEar(step6Ctx, earX, earCenterY, earWidth, earHeight, 'right');
}

function drawCoveredView() {
    // Draw head with hair covering ears
    drawCompleteHead(step6Ctx, step6Canvas);
    
    const centerX = step6Canvas.width / 2;
    const centerY = step6Canvas.height / 2;
    const headWidth = 120;
    const headHeight = 160;
    
    // Draw hair covering ears
    step6Ctx.fillStyle = 'rgba(139, 92, 246, 0.6)';
    step6Ctx.beginPath();
    step6Ctx.ellipse(centerX, centerY - headHeight * 0.3, headWidth * 1.2, headHeight * 0.7, 0, 0, Math.PI, true);
    step6Ctx.fill();
    
    // Show only earlobes peeking out
    const eyeLine = centerY;
    const noseLine = centerY + headHeight / 2;
    const earCenterY = (eyeLine + noseLine) / 2;
    const earHeight = noseLine - eyeLine;
    const earWidth = earHeight * 0.6;
    const leftEarX = centerX - headWidth + 5;
    const rightEarX = centerX + headWidth - 5;
    
    step6Ctx.strokeStyle = '#f59e0b';
    step6Ctx.lineWidth = 2;
    step6Ctx.globalAlpha = 0.7;
    
    // Show partial earlobes
    step6Ctx.beginPath();
    step6Ctx.arc(leftEarX, earCenterY + earHeight * 0.4, earWidth * 0.2, 0, Math.PI);
    step6Ctx.stroke();
    
    step6Ctx.beginPath();
    step6Ctx.arc(rightEarX, earCenterY + earHeight * 0.4, earWidth * 0.2, 0, Math.PI);
    step6Ctx.stroke();
    
    step6Ctx.globalAlpha = 1;
}