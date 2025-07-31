// Step 5 Functions - Mouth Drawing
// Canvas variables are defined in main script.js

// Initialize Step 5 when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Setup Step 5 canvas
    step5Canvas = document.getElementById('drawing-canvas-step5');
    if (step5Canvas) {
        step5Ctx = step5Canvas.getContext('2d');
        step5Ctx.lineCap = 'round';
        step5Ctx.lineJoin = 'round';
    }
    
    // Initialize expression canvases
    initializeExpressionCanvases();
});

function initializeStep5() {
    if (!step5Canvas) return;
    
    // Draw basic head with all previous features
    drawHeadWithAllFeatures(step5Ctx, step5Canvas);
    
    // Highlight first mouth step
    document.querySelectorAll('.mouth-step').forEach(step => {
        step.classList.remove('active');
    });
    document.querySelector('[data-step="positioning"]').classList.add('active');
}

function drawHeadWithAllFeatures(ctx, canvas) {
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
    
    // Eyes line
    ctx.strokeStyle = '#4f46e5';
    ctx.beginPath();
    ctx.moveTo(centerX - headWidth, centerY);
    ctx.lineTo(centerX + headWidth, centerY);
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
    
    // Draw simplified eyes
    const eyeWidth = 25;
    const eyeSpacing = 30;
    ctx.fillStyle = '#4f46e5';
    ctx.fillRect(centerX - eyeSpacing - eyeWidth/2, centerY - 8, eyeWidth, 16);
    ctx.fillRect(centerX + eyeSpacing - eyeWidth/2, centerY - 8, eyeWidth, 16);
    
    // Draw simplified nose
    ctx.strokeStyle = '#7c3aed';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX - 10, noseLine - 15);
    ctx.lineTo(centerX + 10, noseLine - 15);
    ctx.lineTo(centerX + 15, noseLine + 10);
    ctx.lineTo(centerX - 15, noseLine + 10);
    ctx.closePath();
    ctx.stroke();
    
    ctx.globalAlpha = 1;
}

function highlightMouthStep(stepName) {
    // Update active step
    document.querySelectorAll('.mouth-step').forEach(step => {
        step.classList.remove('active');
    });
    document.querySelector(`[data-step="${stepName}"]`).classList.add('active');
    
    // Show corresponding mouth drawing stage
    drawMouthStep(stepName);
}

function drawMouthStep(stepName) {
    if (!step5Canvas) return;
    
    const centerX = step5Canvas.width / 2;
    const centerY = step5Canvas.height / 2;
    const headHeight = 160;
    const noseLine = centerY + headHeight / 2;
    const mouthLine = centerY + headHeight * 3/4;
    const eyeSpacing = 30;
    
    // Clear and redraw base
    step5Ctx.clearRect(0, 0, step5Canvas.width, step5Canvas.height);
    drawHeadWithAllFeatures(step5Ctx, step5Canvas);
    
    step5Ctx.strokeStyle = '#4f46e5';
    step5Ctx.fillStyle = '#4f46e5';
    step5Ctx.lineWidth = 2;
    
    switch(stepName) {
        case 'positioning':
            // Show mouth line positioning
            step5Ctx.strokeStyle = '#dc2626';
            step5Ctx.lineWidth = 3;
            step5Ctx.globalAlpha = 0.8;
            step5Ctx.beginPath();
            step5Ctx.moveTo(centerX - 100, mouthLine);
            step5Ctx.lineTo(centerX + 100, mouthLine);
            step5Ctx.stroke();
            
            // Mark 1/3 distance from chin
            const chinY = centerY + headHeight;
            const distanceFromChin = chinY - mouthLine;
            
            step5Ctx.fillStyle = '#dc2626';
            step5Ctx.font = '12px Inter';
            step5Ctx.fillText(`1/3 de la bărbie`, centerX + 110, mouthLine - 5);
            step5Ctx.fillText(`${Math.round(distanceFromChin)}px`, centerX + 110, mouthLine + 15);
            
            // Show distance measurement
            step5Ctx.setLineDash([2, 2]);
            step5Ctx.beginPath();
            step5Ctx.moveTo(centerX + 90, noseLine);
            step5Ctx.lineTo(centerX + 90, chinY);
            step5Ctx.stroke();
            step5Ctx.setLineDash([]);
            break;
            
        case 'width':
            // Show alignment with eye centers
            step5Ctx.strokeStyle = '#f59e0b';
            step5Ctx.setLineDash([2, 2]);
            step5Ctx.lineWidth = 2;
            
            // Vertical lines from eye centers
            const leftEyeCenter = centerX - eyeSpacing;
            const rightEyeCenter = centerX + eyeSpacing;
            
            step5Ctx.beginPath();
            step5Ctx.moveTo(leftEyeCenter, centerY - 20);
            step5Ctx.lineTo(leftEyeCenter, mouthLine + 30);
            step5Ctx.stroke();
            
            step5Ctx.beginPath();
            step5Ctx.moveTo(rightEyeCenter, centerY - 20);
            step5Ctx.lineTo(rightEyeCenter, mouthLine + 30);
            step5Ctx.stroke();
            
            // Mark mouth corners
            step5Ctx.fillStyle = '#f59e0b';
            step5Ctx.beginPath();
            step5Ctx.arc(leftEyeCenter, mouthLine, 3, 0, 2 * Math.PI);
            step5Ctx.fill();
            
            step5Ctx.beginPath();
            step5Ctx.arc(rightEyeCenter, mouthLine, 3, 0, 2 * Math.PI);
            step5Ctx.fill();
            
            step5Ctx.setLineDash([]);
            break;
            
        case 'lipline':
            // Draw basic lip line (mouth closure)
            const mouthWidth = eyeSpacing * 2;
            step5Ctx.strokeStyle = '#dc2626';
            step5Ctx.lineWidth = 2;
            
            step5Ctx.beginPath();
            step5Ctx.moveTo(centerX - mouthWidth/2, mouthLine);
            step5Ctx.quadraticCurveTo(centerX, mouthLine + 2, centerX + mouthWidth/2, mouthLine);
            step5Ctx.stroke();
            
            step5Ctx.fillStyle = '#dc2626';
            step5Ctx.font = '12px Inter';
            step5Ctx.fillText('Linia buzelor', centerX + mouthWidth/2 + 10, mouthLine + 5);
            break;
            
        case 'upperlip':
            // Draw lip line first
            const mouthW = eyeSpacing * 2;
            step5Ctx.strokeStyle = '#e2e8f0';
            step5Ctx.lineWidth = 1;
            step5Ctx.beginPath();
            step5Ctx.moveTo(centerX - mouthW/2, mouthLine);
            step5Ctx.quadraticCurveTo(centerX, mouthLine + 2, centerX + mouthW/2, mouthLine);
            step5Ctx.stroke();
            
            // Draw upper lip with Cupid's bow
            step5Ctx.strokeStyle = '#7c3aed';
            step5Ctx.lineWidth = 2;
            
            step5Ctx.beginPath();
            // Left side of upper lip
            step5Ctx.moveTo(centerX - mouthW/2, mouthLine);
            step5Ctx.quadraticCurveTo(centerX - mouthW/4, mouthLine - 8, centerX - 8, mouthLine - 3);
            
            // Cupid's bow - left peak
            step5Ctx.lineTo(centerX - 4, mouthLine - 5);
            
            // Cupid's bow - center dip
            step5Ctx.quadraticCurveTo(centerX, mouthLine - 2, centerX + 4, mouthLine - 5);
            
            // Cupid's bow - right peak
            step5Ctx.lineTo(centerX + 8, mouthLine - 3);
            
            // Right side of upper lip
            step5Ctx.quadraticCurveTo(centerX + mouthW/4, mouthLine - 8, centerX + mouthW/2, mouthLine);
            step5Ctx.stroke();
            
            // Highlight Cupid's bow
            step5Ctx.fillStyle = '#7c3aed';
            step5Ctx.font = '11px Inter';
            step5Ctx.fillText('Arcul lui Cupidon', centerX - 40, mouthLine - 15);
            break;
            
        case 'lowerlip':
            // Draw upper lip (faded)
            const mouthWd = eyeSpacing * 2;
            step5Ctx.strokeStyle = '#e2e8f0';
            step5Ctx.lineWidth = 1;
            step5Ctx.globalAlpha = 0.5;
            
            step5Ctx.beginPath();
            step5Ctx.moveTo(centerX - mouthWd/2, mouthLine);
            step5Ctx.quadraticCurveTo(centerX - mouthWd/4, mouthLine - 8, centerX - 8, mouthLine - 3);
            step5Ctx.lineTo(centerX - 4, mouthLine - 5);
            step5Ctx.quadraticCurveTo(centerX, mouthLine - 2, centerX + 4, mouthLine - 5);
            step5Ctx.lineTo(centerX + 8, mouthLine - 3);
            step5Ctx.quadraticCurveTo(centerX + mouthWd/4, mouthLine - 8, centerX + mouthWd/2, mouthLine);
            step5Ctx.stroke();
            
            step5Ctx.globalAlpha = 1;
            
            // Draw lower lip
            step5Ctx.strokeStyle = '#059669';
            step5Ctx.lineWidth = 2;
            
            step5Ctx.beginPath();
            step5Ctx.moveTo(centerX - mouthWd/2, mouthLine);
            step5Ctx.quadraticCurveTo(centerX, mouthLine + 12, centerX + mouthWd/2, mouthLine);
            step5Ctx.stroke();
            
            step5Ctx.fillStyle = '#059669';
            step5Ctx.font = '11px Inter';
            step5Ctx.fillText('Buza inferioară', centerX + mouthWd/2 + 10, mouthLine + 8);
            step5Ctx.fillText('(mai plină)', centerX + mouthWd/2 + 10, mouthLine + 20);
            break;
            
        case 'details':
            // Draw complete mouth with details
            drawCompleteMouth(step5Ctx, centerX, mouthLine, eyeSpacing * 2, 'neutral');
            break;
    }
    
    step5Ctx.globalAlpha = 1;
}

function drawCompleteMouth(ctx, centerX, mouthLine, mouthWidth, expression = 'neutral') {
    // Adjust mouth shape based on expression
    let upperLipHeight = -8;
    let lowerLipHeight = 12;
    let cornerCurve = 2;
    let cupidsBowDepth = -5;
    
    switch(expression) {
        case 'smile':
            cornerCurve = -3;
            upperLipHeight = -6;
            lowerLipHeight = 10;
            break;
        case 'serious':
            cornerCurve = 0;
            upperLipHeight = -6;
            lowerLipHeight = 8;
            break;
        case 'pursed':
            mouthWidth *= 0.7;
            upperLipHeight = -5;
            lowerLipHeight = 8;
            cornerCurve = 1;
            break;
    }
    
    // Upper lip outline
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;
    
    ctx.beginPath();
    // Left side of upper lip
    ctx.moveTo(centerX - mouthWidth/2, mouthLine + cornerCurve);
    ctx.quadraticCurveTo(centerX - mouthWidth/4, mouthLine + upperLipHeight, centerX - 8, mouthLine - 3);
    
    // Cupid's bow
    ctx.lineTo(centerX - 4, mouthLine + cupidsBowDepth);
    ctx.quadraticCurveTo(centerX, mouthLine - 2, centerX + 4, mouthLine + cupidsBowDepth);
    ctx.lineTo(centerX + 8, mouthLine - 3);
    
    // Right side of upper lip
    ctx.quadraticCurveTo(centerX + mouthWidth/4, mouthLine + upperLipHeight, centerX + mouthWidth/2, mouthLine + cornerCurve);
    ctx.stroke();
    
    // Lower lip outline
    ctx.beginPath();
    ctx.moveTo(centerX - mouthWidth/2, mouthLine + cornerCurve);
    ctx.quadraticCurveTo(centerX, mouthLine + lowerLipHeight, centerX + mouthWidth/2, mouthLine + cornerCurve);
    ctx.stroke();
    
    // Lip line (mouth closure)
    ctx.strokeStyle = '#7c2d12';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX - mouthWidth/2, mouthLine + cornerCurve);
    ctx.quadraticCurveTo(centerX, mouthLine + cornerCurve/2, centerX + mouthWidth/2, mouthLine + cornerCurve);
    ctx.stroke();
    
    // Add subtle shading and highlights
    if (expression !== 'demo') {
        // Shadow under lower lip
        ctx.fillStyle = 'rgba(100, 116, 139, 0.3)';
        ctx.beginPath();
        ctx.ellipse(centerX, mouthLine + lowerLipHeight + 8, mouthWidth/2 - 5, 4, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Highlight on lower lip
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.ellipse(centerX, mouthLine + lowerLipHeight/2 + 2, mouthWidth/3, 3, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Small highlight on Cupid's bow
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.ellipse(centerX, mouthLine + cupidsBowDepth/2, 6, 2, 0, 0, 2 * Math.PI);
        ctx.fill();
    }
}

function showMouthDemo() {
    const demoBtn = document.getElementById('show-mouth-demo');
    if (!demoBtn) return;
    
    demoBtn.classList.add('active');
    demoBtn.innerHTML = '<i class="fas fa-pause"></i> Demonstrație în curs...';
    
    // Demo sequence
    const steps = ['positioning', 'width', 'lipline', 'upperlip', 'lowerlip', 'details'];
    let currentStep = 0;
    
    const nextStep = () => {
        if (currentStep < steps.length) {
            highlightMouthStep(steps[currentStep]);
            currentStep++;
            setTimeout(nextStep, 2200);
        } else {
            demoBtn.classList.remove('active');
            demoBtn.innerHTML = '<i class="fas fa-play"></i> Demonstrație Gură';
        }
    };
    
    setTimeout(nextStep, 500);
}

function showMouthGrid() {
    const guidelines = document.getElementById('mouth-guidelines');
    if (!guidelines) return;
    
    guidelines.classList.toggle('show');
    
    const btn = document.getElementById('show-mouth-grid');
    if (!btn) return;
    
    btn.classList.toggle('active');
    
    if (guidelines.classList.contains('show')) {
        // Create mouth positioning grid
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.style.position = 'absolute';
        svg.style.top = '0';
        svg.style.left = '0';
        
        const centerX = step5Canvas.width / 2;
        const centerY = step5Canvas.height / 2;
        const headHeight = 160;
        const mouthLine = centerY + headHeight * 3/4;
        const eyeSpacing = 30;
        
        // Vertical alignment lines from eye centers
        const leftLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        const leftX = (centerX - eyeSpacing) / step5Canvas.width * 100;
        leftLine.setAttribute('x1', `${leftX}%`);
        leftLine.setAttribute('y1', '25%');
        leftLine.setAttribute('x2', `${leftX}%`);
        leftLine.setAttribute('y2', '85%');
        leftLine.setAttribute('stroke', '#f59e0b');
        leftLine.setAttribute('stroke-width', '2');
        leftLine.setAttribute('stroke-dasharray', '5,5');
        leftLine.setAttribute('opacity', '0.7');
        svg.appendChild(leftLine);
        
        const rightLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        const rightX = (centerX + eyeSpacing) / step5Canvas.width * 100;
        rightLine.setAttribute('x1', `${rightX}%`);
        rightLine.setAttribute('y1', '25%');
        rightLine.setAttribute('x2', `${rightX}%`);
        rightLine.setAttribute('y2', '85%');
        rightLine.setAttribute('stroke', '#f59e0b');
        rightLine.setAttribute('stroke-width', '2');
        rightLine.setAttribute('stroke-dasharray', '5,5');
        rightLine.setAttribute('opacity', '0.7');
        svg.appendChild(rightLine);
        
        // Horizontal mouth line
        const mouthLn = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        const mouthY = mouthLine / step5Canvas.height * 100;
        mouthLn.setAttribute('x1', '15%');
        mouthLn.setAttribute('y1', `${mouthY}%`);
        mouthLn.setAttribute('x2', '85%');
        mouthLn.setAttribute('y2', `${mouthY}%`);
        mouthLn.setAttribute('stroke', '#dc2626');
        mouthLn.setAttribute('stroke-width', '2');
        mouthLn.setAttribute('stroke-dasharray', '3,3');
        mouthLn.setAttribute('opacity', '0.7');
        svg.appendChild(mouthLn);
        
        guidelines.appendChild(svg);
    } else {
        guidelines.innerHTML = '';
    }
}

function highlightMouthPart(partName) {
    console.log(`Highlighting mouth part: ${partName}`);
    
    if (!step5Canvas) return;
    
    const centerX = step5Canvas.width / 2;
    const centerY = step5Canvas.height / 2;
    const headHeight = 160;
    const mouthLine = centerY + headHeight * 3/4;
    const mouthWidth = 60;
    
    // Clear and redraw complete mouth
    step5Ctx.clearRect(0, 0, step5Canvas.width, step5Canvas.height);
    drawHeadWithAllFeatures(step5Ctx, step5Canvas);
    drawCompleteMouth(step5Ctx, centerX, mouthLine, mouthWidth);
    
    // Highlight specific part
    step5Ctx.strokeStyle = '#ef4444';
    step5Ctx.lineWidth = 3;
    step5Ctx.globalAlpha = 0.8;
    
    switch(partName) {
        case 'lipline':
            step5Ctx.beginPath();
            step5Ctx.moveTo(centerX - mouthWidth/2, mouthLine + 2);
            step5Ctx.quadraticCurveTo(centerX, mouthLine + 1, centerX + mouthWidth/2, mouthLine + 2);
            step5Ctx.stroke();
            break;
        case 'cupidsbow':
            step5Ctx.beginPath();
            step5Ctx.moveTo(centerX - 8, mouthLine - 3);
            step5Ctx.lineTo(centerX - 4, mouthLine - 5);
            step5Ctx.quadraticCurveTo(centerX, mouthLine - 2, centerX + 4, mouthLine - 5);
            step5Ctx.lineTo(centerX + 8, mouthLine - 3);
            step5Ctx.stroke();
            break;
        case 'upperlip':
            step5Ctx.beginPath();
            step5Ctx.moveTo(centerX - mouthWidth/2, mouthLine + 2);
            step5Ctx.quadraticCurveTo(centerX - mouthWidth/4, mouthLine - 8, centerX - 8, mouthLine - 3);
            step5Ctx.lineTo(centerX - 4, mouthLine - 5);
            step5Ctx.quadraticCurveTo(centerX, mouthLine - 2, centerX + 4, mouthLine - 5);
            step5Ctx.lineTo(centerX + 8, mouthLine - 3);
            step5Ctx.quadraticCurveTo(centerX + mouthWidth/4, mouthLine - 8, centerX + mouthWidth/2, mouthLine + 2);
            step5Ctx.stroke();
            break;
        case 'lowerlip':
            step5Ctx.beginPath();
            step5Ctx.moveTo(centerX - mouthWidth/2, mouthLine + 2);
            step5Ctx.quadraticCurveTo(centerX, mouthLine + 12, centerX + mouthWidth/2, mouthLine + 2);
            step5Ctx.stroke();
            break;
        case 'corners':
            step5Ctx.beginPath();
            step5Ctx.arc(centerX - mouthWidth/2, mouthLine + 2, 4, 0, 2 * Math.PI);
            step5Ctx.moveTo(centerX + mouthWidth/2 + 4, mouthLine + 2);
            step5Ctx.arc(centerX + mouthWidth/2, mouthLine + 2, 4, 0, 2 * Math.PI);
            step5Ctx.stroke();
            break;
    }
    
    step5Ctx.globalAlpha = 1;
}

function clearStep5Canvas() {
    if (!step5Canvas) return;
    step5Ctx.clearRect(0, 0, step5Canvas.width, step5Canvas.height);
    
    // Reset states
    document.querySelectorAll('.mouth-step').forEach(step => {
        step.classList.remove('active');
    });
    
    // Reset expression cards
    document.querySelectorAll('.expression-card').forEach(card => {
        card.classList.remove('active');
    });
    const neutralCard = document.querySelector('[data-expression="neutral"]');
    if (neutralCard) {
        neutralCard.classList.add('active');
    }
    
    // Reactivate first step
    const firstStep = document.querySelector('[data-step="positioning"]');
    if (firstStep) {
        firstStep.classList.add('active');
    }
    
    initializeStep5();
}

function initializeExpressionCanvases() {
    const expressions = ['neutral', 'smile', 'serious', 'pursed'];
    
    expressions.forEach(expression => {
        const canvas = document.querySelector(`[data-type="${expression}"]`);
        if (canvas) {
            const ctx = canvas.getContext('2d');
            drawExpressionDemo(ctx, canvas, expression);
        }
    });
    
    // Add click handlers for expression cards
    document.querySelectorAll('.expression-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const expression = e.currentTarget.dataset.expression;
            selectExpression(expression);
        });
    });
}

function drawExpressionDemo(ctx, canvas, expression) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const mouthWidth = 40;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw simple face outline
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, 35, 30, 0, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Draw eyes
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.ellipse(centerX - 12, centerY - 8, 3, 2, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(centerX + 12, centerY - 8, 3, 2, 0, 0, 2 * Math.PI);
    ctx.fill();
    
    // Draw nose
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX - 2, centerY);
    ctx.lineTo(centerX + 2, centerY);
    ctx.lineTo(centerX + 3, centerY + 5);
    ctx.lineTo(centerX - 3, centerY + 5);
    ctx.closePath();
    ctx.stroke();
    
    // Draw mouth based on expression
    drawCompleteMouth(ctx, centerX, centerY + 12, mouthWidth * 0.8, expression);
}

function selectExpression(expression) {
    // Update active expression card
    document.querySelectorAll('.expression-card').forEach(card => {
        card.classList.remove('active');
    });
    const selectedCard = document.querySelector(`[data-expression="${expression}"]`);
    if (selectedCard) {
        selectedCard.classList.add('active');
    }
    
    // Update main canvas with selected expression
    if (step5Canvas) {
        const centerX = step5Canvas.width / 2;
        const centerY = step5Canvas.height / 2;
        const headHeight = 160;
        const mouthLine = centerY + headHeight * 3/4;
        const mouthWidth = 60;
        
        step5Ctx.clearRect(0, 0, step5Canvas.width, step5Canvas.height);
        drawHeadWithAllFeatures(step5Ctx, step5Canvas);
        drawCompleteMouth(step5Ctx, centerX, mouthLine, mouthWidth, expression);
    }
}