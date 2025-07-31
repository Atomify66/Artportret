// Step 4 Functions - Nose Drawing
function initializeStep4() {
    if (!step4Canvas) return;
    
    // Draw basic head with facial guidelines and eyes
    drawHeadWithFeaturesForNose(step4Ctx, step4Canvas);
    
    // Highlight first nose step
    document.querySelectorAll('.nose-step').forEach(step => {
        step.classList.remove('active');
    });
    document.querySelector('[data-step="positioning"]').classList.add('active');
}

function drawHeadWithFeaturesForNose(ctx, canvas) {
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
    ctx.strokeStyle = '#e2e8f0';
    
    // Draw simplified eyes
    const eyeWidth = 25;
    const eyeSpacing = 30;
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#4f46e5';
    ctx.fillRect(centerX - eyeSpacing - eyeWidth/2, centerY - 8, eyeWidth, 16);
    ctx.fillRect(centerX + eyeSpacing - eyeWidth/2, centerY - 8, eyeWidth, 16);
    
    ctx.globalAlpha = 1;
}

function highlightNoseStep(stepName) {
    // Update active step
    document.querySelectorAll('.nose-step').forEach(step => {
        step.classList.remove('active');
    });
    document.querySelector(`[data-step="${stepName}"]`).classList.add('active');
    
    // Show corresponding nose drawing stage
    drawNoseStep(stepName);
}

function drawNoseStep(stepName) {
    if (!step4Canvas) return;
    
    const centerX = step4Canvas.width / 2;
    const centerY = step4Canvas.height / 2;
    const headHeight = 160;
    const noseLine = centerY + headHeight / 2;
    const eyeSpacing = 30;
    
    // Clear and redraw base
    step4Ctx.clearRect(0, 0, step4Canvas.width, step4Canvas.height);
    drawHeadWithFeaturesForNose(step4Ctx, step4Canvas);
    
    step4Ctx.strokeStyle = '#4f46e5';
    step4Ctx.fillStyle = '#4f46e5';
    step4Ctx.lineWidth = 2;
    
    switch(stepName) {
        case 'positioning':
            // Show nose line and positioning mark
            step4Ctx.strokeStyle = '#059669';
            step4Ctx.lineWidth = 3;
            step4Ctx.globalAlpha = 0.8;
            step4Ctx.beginPath();
            step4Ctx.moveTo(centerX - 100, noseLine);
            step4Ctx.lineTo(centerX + 100, noseLine);
            step4Ctx.stroke();
            
            // Mark nose tip position
            step4Ctx.fillStyle = '#059669';
            step4Ctx.beginPath();
            step4Ctx.arc(centerX, noseLine, 4, 0, 2 * Math.PI);
            step4Ctx.fill();
            
            step4Ctx.fillStyle = '#059669';
            step4Ctx.font = '14px Inter';
            step4Ctx.fillText('Vârful nasului', centerX + 20, noseLine - 10);
            break;
            
        case 'width':
            // Show alignment with inner eye corners
            step4Ctx.strokeStyle = '#7c3aed';
            step4Ctx.setLineDash([2, 2]);
            step4Ctx.lineWidth = 2;
            
            // Vertical lines from inner eye corners
            const leftEyeInner = centerX - eyeSpacing/2;
            const rightEyeInner = centerX + eyeSpacing/2;
            
            step4Ctx.beginPath();
            step4Ctx.moveTo(leftEyeInner, centerY - 20);
            step4Ctx.lineTo(leftEyeInner, noseLine + 30);
            step4Ctx.stroke();
            
            step4Ctx.beginPath();
            step4Ctx.moveTo(rightEyeInner, centerY - 20);
            step4Ctx.lineTo(rightEyeInner, noseLine + 30);
            step4Ctx.stroke();
            
            // Show nose width
            step4Ctx.fillStyle = '#7c3aed';
            step4Ctx.fillRect(leftEyeInner - 2, noseLine - 2, 4, 4);
            step4Ctx.fillRect(rightEyeInner - 2, noseLine - 2, 4, 4);
            
            step4Ctx.setLineDash([]);
            break;
            
        case 'base':
            // Draw trapezoidal base of nose
            const noseWidth = eyeSpacing;
            step4Ctx.strokeStyle = '#dc2626';
            step4Ctx.fillStyle = 'rgba(220, 38, 38, 0.2)';
            step4Ctx.lineWidth = 2;
            
            step4Ctx.beginPath();
            step4Ctx.moveTo(centerX - noseWidth/3, noseLine - 15); // Top left
            step4Ctx.lineTo(centerX + noseWidth/3, noseLine - 15); // Top right
            step4Ctx.lineTo(centerX + noseWidth/2, noseLine + 10); // Bottom right
            step4Ctx.lineTo(centerX - noseWidth/2, noseLine + 10); // Bottom left
            step4Ctx.closePath();
            step4Ctx.fill();
            step4Ctx.stroke();
            
            // Draw nostrils
            step4Ctx.strokeStyle = '#7c3aed';
            step4Ctx.lineWidth = 1;
            
            // Left nostril
            step4Ctx.beginPath();
            step4Ctx.arc(centerX - noseWidth/4, noseLine + 5, 3, 0, Math.PI);
            step4Ctx.stroke();
            
            // Right nostril
            step4Ctx.beginPath();
            step4Ctx.arc(centerX + noseWidth/4, noseLine + 5, 3, 0, Math.PI);
            step4Ctx.stroke();
            break;
            
        case 'bridge':
            // Draw nose base first
            step4Ctx.strokeStyle = '#dc2626';
            step4Ctx.lineWidth = 1;
            step4Ctx.globalAlpha = 0.5;
            
            step4Ctx.beginPath();
            step4Ctx.moveTo(centerX - eyeSpacing/3, noseLine - 15);
            step4Ctx.lineTo(centerX + eyeSpacing/3, noseLine - 15);
            step4Ctx.lineTo(centerX + eyeSpacing/2, noseLine + 10);
            step4Ctx.lineTo(centerX - eyeSpacing/2, noseLine + 10);
            step4Ctx.closePath();
            step4Ctx.stroke();
            
            // Draw nose bridge
            step4Ctx.strokeStyle = '#4f46e5';
            step4Ctx.lineWidth = 2;
            step4Ctx.globalAlpha = 0.8;
            
            // Left side of bridge
            step4Ctx.beginPath();
            step4Ctx.moveTo(centerX - eyeSpacing/2, centerY + 5);
            step4Ctx.quadraticCurveTo(centerX - eyeSpacing/3, noseLine - 10, centerX - eyeSpacing/3, noseLine - 15);
            step4Ctx.stroke();
            
            // Right side of bridge
            step4Ctx.beginPath();
            step4Ctx.moveTo(centerX + eyeSpacing/2, centerY + 5);
            step4Ctx.quadraticCurveTo(centerX + eyeSpacing/3, noseLine - 10, centerX + eyeSpacing/3, noseLine - 15);
            step4Ctx.stroke();
            break;
            
        case 'details':
            // Draw complete nose with all details
            drawCompleteNose(step4Ctx, centerX, noseLine, eyeSpacing);
            break;
    }
    
    step4Ctx.globalAlpha = 1;
}

function drawCompleteNose(ctx, centerX, noseLine, eyeSpacing) {
    const noseWidth = eyeSpacing;
    
    // Nose base - trapezoid
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.moveTo(centerX - noseWidth/3, noseLine - 15);
    ctx.lineTo(centerX + noseWidth/3, noseLine - 15);
    ctx.lineTo(centerX + noseWidth/2, noseLine + 10);
    ctx.lineTo(centerX - noseWidth/2, noseLine + 10);
    ctx.closePath();
    ctx.stroke();
    
    // Nose bridge
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1.5;
    
    // Left bridge line
    ctx.beginPath();
    ctx.moveTo(centerX - eyeSpacing/2, noseLine - 50);
    ctx.quadraticCurveTo(centerX - noseWidth/3, noseLine - 25, centerX - noseWidth/3, noseLine - 15);
    ctx.stroke();
    
    // Right bridge line
    ctx.beginPath();
    ctx.moveTo(centerX + eyeSpacing/2, noseLine - 50);
    ctx.quadraticCurveTo(centerX + noseWidth/3, noseLine - 25, centerX + noseWidth/3, noseLine - 15);
    ctx.stroke();
    
    // Nostrils
    ctx.strokeStyle = '#1e293b';
    ctx.fillStyle = 'rgba(30, 41, 59, 0.3)';
    ctx.lineWidth = 1;
    
    // Left nostril
    ctx.beginPath();
    ctx.ellipse(centerX - noseWidth/4, noseLine + 5, 4, 6, 0, 0, Math.PI);
    ctx.fill();
    ctx.stroke();
    
    // Right nostril
    ctx.beginPath();
    ctx.ellipse(centerX + noseWidth/4, noseLine + 5, 4, 6, 0, 0, Math.PI);
    ctx.fill();
    ctx.stroke();
    
    // Nose tip highlight
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(centerX, noseLine + 2, 3, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Subtle shadow under nose
    ctx.fillStyle = 'rgba(100, 116, 139, 0.2)';
    ctx.beginPath();
    ctx.ellipse(centerX, noseLine + 15, noseWidth/2 + 5, 8, 0, 0, 2 * Math.PI);
    ctx.fill();
}

function showNoseDemo() {
    console.log("Starting nose demo animation...");
    const demoBtn = document.getElementById('show-nose-demo');
    if (demoBtn) {
        demoBtn.classList.add('active');
        demoBtn.innerHTML = '<i class="fas fa-pause"></i> Demonstrație în curs...';
    }
    
    // Make sure we have the canvas
    if (!step4Canvas || !step4Ctx) {
        console.error("Nose canvas or context not found!");
        return;
    }
    
    // Demo sequence - make sure these match the data-step attributes in the HTML
    const steps = ['positioning', 'width', 'base', 'bridge', 'details'];
    let currentStep = 0;
    
    // Clear any existing timeouts
    if (window.noseAnimationTimeout) {
        clearTimeout(window.noseAnimationTimeout);
    }
    
    const runNextStep = () => {
        if (currentStep < steps.length) {
            console.log(`Running nose demo step ${currentStep + 1}/${steps.length}: ${steps[currentStep]}`);
            
            try {
                highlightNoseStep(steps[currentStep]);
            } catch (error) {
                console.error(`Error in nose demo step ${steps[currentStep]}:`, error);
            }
            
            currentStep++;
            window.noseAnimationTimeout = setTimeout(runNextStep, 2500);
        } else {
            console.log("Nose demo completed");
            if (demoBtn) {
                demoBtn.classList.remove('active');
                demoBtn.innerHTML = '<i class="fas fa-play"></i> Demonstrație Nas';
            }
        }
    };
    
    // Start the animation sequence after a short delay
    window.noseAnimationTimeout = setTimeout(runNextStep, 500);
}

function showNoseGrid() {
    const guidelines = document.getElementById('nose-guidelines');
    guidelines.classList.toggle('show');
    
    const btn = document.getElementById('show-nose-grid');
    btn.classList.toggle('active');
    
    if (guidelines.classList.contains('show')) {
        // Create nose positioning grid
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.style.position = 'absolute';
        svg.style.top = '0';
        svg.style.left = '0';
        
        const centerX = step4Canvas.width / 2;
        const centerY = step4Canvas.height / 2;
        const headHeight = 160;
        const noseLine = centerY + headHeight / 2;
        const eyeSpacing = 30;
        
        // Vertical alignment lines from inner eye corners
        const leftLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        const leftX = (centerX - eyeSpacing/2) / step4Canvas.width * 100;
        leftLine.setAttribute('x1', `${leftX}%`);
        leftLine.setAttribute('y1', '25%');
        leftLine.setAttribute('x2', `${leftX}%`);
        leftLine.setAttribute('y2', '75%');
        leftLine.setAttribute('stroke', '#7c3aed');
        leftLine.setAttribute('stroke-width', '2');
        leftLine.setAttribute('stroke-dasharray', '5,5');
        leftLine.setAttribute('opacity', '0.7');
        svg.appendChild(leftLine);
        
        const rightLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        const rightX = (centerX + eyeSpacing/2) / step4Canvas.width * 100;
        rightLine.setAttribute('x1', `${rightX}%`);
        rightLine.setAttribute('y1', '25%');
        rightLine.setAttribute('x2', `${rightX}%`);
        rightLine.setAttribute('y2', '75%');
        rightLine.setAttribute('stroke', '#7c3aed');
        rightLine.setAttribute('stroke-width', '2');
        rightLine.setAttribute('stroke-dasharray', '5,5');
        rightLine.setAttribute('opacity', '0.7');
        svg.appendChild(rightLine);
        
        // Horizontal nose line
        const noseLn = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        const noseY = noseLine / step4Canvas.height * 100;
        noseLn.setAttribute('x1', '20%');
        noseLn.setAttribute('y1', `${noseY}%`);
        noseLn.setAttribute('x2', '80%');
        noseLn.setAttribute('y2', `${noseY}%`);
        noseLn.setAttribute('stroke', '#059669');
        noseLn.setAttribute('stroke-width', '2');
        noseLn.setAttribute('stroke-dasharray', '3,3');
        noseLn.setAttribute('opacity', '0.7');
        svg.appendChild(noseLn);
        
        guidelines.appendChild(svg);
    } else {
        guidelines.innerHTML = '';
    }
}

function highlightNosePart(partName) {
    console.log(`Highlighting nose part: ${partName}`);
    
    if (!step4Canvas) return;
    
    const centerX = step4Canvas.width / 2;
    const centerY = step4Canvas.height / 2;
    const headHeight = 160;
    const noseLine = centerY + headHeight / 2;
    const eyeSpacing = 30;
    
    // Clear and redraw complete nose
    step4Ctx.clearRect(0, 0, step4Canvas.width, step4Canvas.height);
    drawHeadWithFeaturesForNose(step4Ctx, step4Canvas);
    drawCompleteNose(step4Ctx, centerX, noseLine, eyeSpacing);
    
    // Highlight specific part
    step4Ctx.strokeStyle = '#ef4444';
    step4Ctx.lineWidth = 3;
    step4Ctx.globalAlpha = 0.8;
    
    switch(partName) {
        case 'bridge':
            step4Ctx.beginPath();
            step4Ctx.moveTo(centerX - eyeSpacing/2, noseLine - 50);
            step4Ctx.quadraticCurveTo(centerX - eyeSpacing/3, noseLine - 25, centerX - eyeSpacing/3, noseLine - 15);
            step4Ctx.moveTo(centerX + eyeSpacing/2, noseLine - 50);
            step4Ctx.quadraticCurveTo(centerX + eyeSpacing/3, noseLine - 25, centerX + eyeSpacing/3, noseLine - 15);
            step4Ctx.stroke();
            break;
        case 'tip':
            step4Ctx.beginPath();
            step4Ctx.arc(centerX, noseLine + 2, 6, 0, 2 * Math.PI);
            step4Ctx.stroke();
            break;
        case 'base':
            step4Ctx.beginPath();
            step4Ctx.moveTo(centerX - eyeSpacing/3, noseLine - 15);
            step4Ctx.lineTo(centerX + eyeSpacing/3, noseLine - 15);
            step4Ctx.lineTo(centerX + eyeSpacing/2, noseLine + 10);
            step4Ctx.lineTo(centerX - eyeSpacing/2, noseLine + 10);
            step4Ctx.closePath();
            step4Ctx.stroke();
            break;
        case 'nostrils':
            step4Ctx.beginPath();
            step4Ctx.ellipse(centerX - eyeSpacing/4, noseLine + 5, 6, 8, 0, 0, Math.PI);
            step4Ctx.moveTo(centerX + eyeSpacing/4 + 6, noseLine + 5);
            step4Ctx.ellipse(centerX + eyeSpacing/4, noseLine + 5, 6, 8, 0, 0, Math.PI);
            step4Ctx.stroke();
            break;
    }
    
    step4Ctx.globalAlpha = 1;
}

function clearStep4Canvas() {
    if (!step4Canvas) return;
    step4Ctx.clearRect(0, 0, step4Canvas.width, step4Canvas.height);
    
    // Reset states
    document.querySelectorAll('.nose-step').forEach(step => {
        step.classList.remove('active');
    });
    
    // Reactivate first step
    document.querySelector('[data-step="positioning"]').classList.add('active');
    initializeStep4();
}