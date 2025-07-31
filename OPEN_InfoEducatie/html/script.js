// App state - Progressive Drawing System
let appState = {
    currentSection: 'materials',
    materialsChecked: new Set(),
    currentTool: 'pencil',
    brushSize: 2,
    opacity: 1.0,
    isDrawing: false,
    showGuidelines: false,
    currentStep: 1,
    drawingPath: [],
    isAnimationRunning: false,
    // Real-time tool state
    rulerVisible: false,
    rulerPosition: { x: 0, y: 0 },
    rulerDragging: false,
    rulerCanvas: null,
    rulerCtx: null,
    realTimePreview: true,
    // Touch and Apple Pencil support
    currentTouch: null,
    // Progressive drawing state
    drawingData: {
        headOutline: null,
        guidelines: null,
        eyes: null,
        eyebrows: null,
        nose: null,
        mouth: null,
        ears: null,
        hair: null,
        shading: null,
        highlights: null,
        signature: null
    },
    completedSteps: new Set(),
    masterCanvas: null,
    masterCtx: null,
    // User drawing layers (separate from animations)
    userCanvases: {},
    userContexts: {},
    // Portrait progress tracking
    portraitProgress: {
        totalSteps: 8,
        completedStepsCount: 0,
        stepMapping: {
            'step1': 'headOutline',
            'step2': 'guidelines',
            'step3': 'eyes',
            'step4': 'nose',
            'step5': 'mouth',
            'step6': 'ears',
            'step7': 'hair',
            'step8': 'shading'
        }
    }
};

// Canvas setup - Progressive System
let canvas, ctx, proportionsCanvas, proportionsCtx;
let step2Canvas, step2Ctx, step3Canvas, step3Ctx, step4Canvas, step4Ctx;
let step5Canvas, step5Ctx, step6Canvas, step6Ctx, step7Canvas, step7Ctx, step8Canvas, step8Ctx;

// Master progressive drawing functions
const ProgressiveDrawing = {
    // Save current step drawing data
    saveStepData(stepName, drawingFunction) {
        if (!appState.masterCanvas) return;
        
        // Create a temporary canvas to capture the drawing
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = appState.masterCanvas.width;
        tempCanvas.height = appState.masterCanvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        
        // Execute the drawing function on temp canvas
        drawingFunction(tempCtx, tempCanvas);
        
        // Save the image data
        appState.drawingData[stepName] = tempCanvas.toDataURL();
        appState.completedSteps.add(stepName);
        
        // Update progress tracking
        this.updateProgressTracker();
    },
    
    // Load all previous step data onto current canvas
    async loadPreviousSteps(currentCtx, currentCanvas, upToStep) {
        if (!currentCtx || !currentCanvas) return;
        
        // Clear canvas first
        currentCtx.clearRect(0, 0, currentCanvas.width, currentCanvas.height);
        
        // Define step order
        const stepOrder = ['headOutline', 'guidelines', 'eyes', 'eyebrows', 'nose', 'mouth', 'ears', 'hair', 'shading', 'highlights'];
        const stopIndex = stepOrder.indexOf(upToStep);
        
        // Load each completed step in order (await each one)
        for (const stepName of stepOrder.slice(0, stopIndex + 1)) {
            if (appState.drawingData[stepName]) {
                await new Promise((resolve) => {
                    const img = new Image();
                    img.onload = () => {
                        currentCtx.globalAlpha = stepName === 'guidelines' ? 0.3 : 1;
                        currentCtx.drawImage(img, 0, 0);
                        currentCtx.globalAlpha = 1;
                        resolve();
                    };
                    img.onerror = () => resolve(); // Continue even if image fails
                    img.src = appState.drawingData[stepName];
                });
            }
        }
        
        // Add progress indicator
        this.addProgressIndicator(currentCanvas, upToStep);
    },
    
    // Initialize master canvas (hidden canvas for state management)
    initializeMasterCanvas() {
        if (!appState.masterCanvas) {
            appState.masterCanvas = document.createElement('canvas');
            appState.masterCanvas.width = 600;
            appState.masterCanvas.height = 800;
            appState.masterCtx = appState.masterCanvas.getContext('2d');
            appState.masterCtx.lineCap = 'round';
            appState.masterCtx.lineJoin = 'round';
        }
    },
    
    // Update visual progress tracker
    updateProgressTracker() {
        const steps = ['step1', 'step2', 'step3', 'step4', 'step5', 'step6', 'step7', 'step8'];
        steps.forEach((step, index) => {
            const navTab = document.querySelector(`[data-section="${step}"]`);
            if (navTab) {
                if (appState.completedSteps.has(this.getStepDrawingName(step))) {
                    navTab.classList.add('completed');
                } else {
                    navTab.classList.remove('completed');
                }
            }
        });
    },
    
    // Map step sections to drawing data names
    getStepDrawingName(stepSection) {
        const mapping = {
            'step1': 'headOutline',
            'step2': 'guidelines', 
            'step3': 'eyes',
            'step4': 'nose',
            'step5': 'mouth',
            'step6': 'ears',
            'step7': 'hair',
            'step8': 'shading'
        };
        return mapping[stepSection] || stepSection;
    },
    
    // Get current step context
    getCurrentStepCanvas() {
        const canvasMap = {
            'step1': {canvas, ctx},
            'step2': {canvas: step2Canvas, ctx: step2Ctx},
            'step3': {canvas: step3Canvas, ctx: step3Ctx},
            'step4': {canvas: step4Canvas, ctx: step4Ctx},
            'step5': {canvas: step5Canvas, ctx: step5Ctx},
            'step6': {canvas: step6Canvas, ctx: step6Ctx},
            'step7': {canvas: step7Canvas, ctx: step7Ctx},
            'step8': {canvas: step8Canvas, ctx: step8Ctx}
        };
        return canvasMap[appState.currentSection] || {canvas: null, ctx: null};
    },
    
    // Add progress indicator to canvas
    addProgressIndicator(canvas, currentStep) {
        // Progress indicator removed as requested - no longer showing step text
        return;
    },
    
    // Get display name for step
    getStepDisplayName(stepName) {
        const displayNames = {
            'headOutline': 'Conturul capului',
            'guidelines': 'Liniile ghid',
            'eyes': 'Ochii',
            'eyebrows': 'Sprâncenele',
            'nose': 'Nasul',
            'mouth': 'Gura',
            'ears': 'Urechile',
            'hair': 'Părul',
            'shading': 'Umbrirea',
            'highlights': 'Luminile'
        };
        return displayNames[stepName] || stepName;
    },
    
    // Show step guidance - disabled as requested
    showStepGuidance(canvas, message) {
        // Function disabled - no notifications will be shown
        return;
    },
    
    // Mark step as completed with animation
    markStepCompleted(stepSection) {
        const stepData = this.getStepDrawingName(stepSection);
        appState.completedSteps.add(stepData);
        
        // Update navigation
        this.updateProgressTracker();
        
        // Update portrait progress
        updatePortraitProgress();
        
        // Show completion animation
        const navTab = document.querySelector(`[data-section="${stepSection}"]`);
        if (navTab) {
            navTab.classList.add('step-complete-animation');
            setTimeout(() => {
                navTab.classList.remove('step-complete-animation');
            }, 600);
        }
        
        // Show completion message
        const canvas = this.getCurrentStepCanvas().canvas;
        if (canvas) {
            this.showStepGuidance(canvas, `✅ ${this.getStepDisplayName(stepData)} finalizat!`);
        }
    }
};

// Enhanced Universal Toolbox System
function createEnhancedUniversalToolbox() {
    return `
        <div class="enhanced-toolbox">
            <div class="toolbox-header">
                <h3 class="toolbox-title">Instrumente de Desen</h3>
            </div>
            
                <div class="tool-group">
                <button class="tool-btn active" data-tool="pencil">
                        <i class="fas fa-pencil-alt"></i>
                        <span>Creion</span>
                    </button>
                <button class="tool-btn" data-tool="eraser">
                        <i class="fas fa-eraser"></i>
                        <span>Radieră</span>
                    </button>
                <button class="tool-btn" data-tool="ruler">
                        <i class="fas fa-ruler"></i>
                        <span>Riglă</span>
                    </button>
            </div>

            <div class="tool-settings">
                <label>
                    <i class="fas fa-expand-arrows-alt"></i>
                    Grosime:
                </label>
                <input type="range" class="brush-size-input" min="1" max="10" value="2">
                    <span class="brush-size-value">2px</span>
                </div>

            <div class="tool-settings opacity-setting">
                <label>
                    <i class="fas fa-adjust"></i>
                    Opacitate:
                </label>
                <input type="range" class="opacity-input" min="0.1" max="1" step="0.1" value="0.5">
                    <span class="opacity-value">50%</span>
            </div>

            <div class="tool-actions">
                <button class="demo-btn" data-action="demo">
                    <i class="fas fa-play"></i>
                    Demonstrație
                </button>
                <button class="disappear-btn" data-action="hide-animation" style="display: none;">
                    <i class="fas fa-eye-slash"></i>
                    Ascunde Animația
                </button>
                <button class="guide-btn" data-action="guidelines">
                    <i class="fas fa-grid"></i>
                    Grid
                </button>
                <button class="clear-btn" data-action="clear">
                    <i class="fas fa-trash"></i>
                    Curăță
                </button>
            </div>
        </div>
    `;
}

// Initialize Enhanced Universal Toolbox for all steps
function initializeEnhancedUniversalToolbox() {
    console.log('Initializing Enhanced Universal Toolbox...');
    const stepsWithCanvases = ['step1', 'step2', 'step3', 'step4', 'step5', 'step6', 'step7', 'step8'];
    
    let toolboxesAdded = 0;
    
    stepsWithCanvases.forEach(stepId => {
        const section = document.getElementById(stepId);
        console.log(`Checking ${stepId}:`, section);
        
        if (section) {
            const drawingContainer = section.querySelector('.drawing-container');
            console.log(`Drawing container for ${stepId}:`, drawingContainer);
            
            if (drawingContainer) {
                const controlsArea = drawingContainer.querySelector('.drawing-controls');
                console.log(`Controls area for ${stepId}:`, controlsArea);
                
                if (controlsArea) {
                    // Remove any existing enhanced-toolbox to avoid duplicates
                    const existingToolbox = controlsArea.querySelector('.enhanced-toolbox');
                    if (existingToolbox) {
                        console.log(`Removing existing toolbox from ${stepId}`);
                        existingToolbox.remove();
                    }
                    
                    // Remove any old tools-panel
                    const oldToolsPanel = controlsArea.querySelector('.tools-panel');
                    if (oldToolsPanel) {
                        console.log(`Removing old tools panel from ${stepId}`);
                        oldToolsPanel.remove();
                    }
                    
                    // Insert the enhanced toolbox at the beginning
                    controlsArea.insertAdjacentHTML('afterbegin', createEnhancedUniversalToolbox());
                    toolboxesAdded++;
                    console.log(`✅ Enhanced toolbox added to ${stepId} (Total: ${toolboxesAdded})`);
                } else {
                    console.log(`❌ No controls area found in ${stepId}`);
                }
            } else {
                console.log(`❌ No drawing container found in ${stepId}`);
            }
        } else {
            console.log(`❌ Section ${stepId} not found`);
        }
    });
    
    console.log(`Toolbox initialization complete. Added ${toolboxesAdded} toolboxes.`);
    
    // Setup event handlers for all toolboxes
    setupUniversalToolboxHandlers();
}

// Setup event handlers for universal toolboxes
function setupUniversalToolboxHandlers() {
    // Tool button handlers
    document.addEventListener('click', function(e) {
        const toolBtn = e.target.closest('.tool-btn');
        if (toolBtn && toolBtn.dataset.tool) {
            // Update all toolboxes to show active state
            document.querySelectorAll('.tool-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.tool === toolBtn.dataset.tool) {
                    btn.classList.add('active');
                }
            });
            
            RealTimeTools.switchTool(toolBtn.dataset.tool);
        }
    });
    
    // Action button handlers
    document.addEventListener('click', function(e) {
        const actionBtn = e.target.closest('[data-action]');
        if (actionBtn) {
            const action = actionBtn.dataset.action;
            handleToolboxAction(action, actionBtn);
        }
    });
    
    // Range input handlers
    document.addEventListener('input', function(e) {
        if (e.target.classList.contains('brush-size-input')) {
            const value = parseInt(e.target.value);
            RealTimeTools.updateBrushSize(value);
            
            // Update all brush size displays
            document.querySelectorAll('.brush-size-value').forEach(display => {
                display.textContent = value + 'px';
            });
        }
        
        if (e.target.classList.contains('opacity-input')) {
            const value = parseFloat(e.target.value);
            RealTimeTools.updateOpacity(value);
            
            // Update all opacity displays
            const percentage = Math.round(value * 100);
            document.querySelectorAll('.opacity-value').forEach(display => {
                display.textContent = percentage + '%';
            });
        }
    });
}

// Handle toolbox actions
function handleToolboxAction(action, button) {
    switch(action) {
        case 'demo':
            // Add active state animation
            button.classList.add('active');
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Rulează...';
            
            // Trigger demo for current step
            triggerStepDemo();
            
            // Reset button after demo
            setTimeout(() => {
                button.classList.remove('active');
                button.innerHTML = '<i class="fas fa-play"></i> Demonstrație';
            }, 3000);
            break;
            
        case 'hide-animation':
            // Add active state animation
            button.classList.add('active');
            
            // Hide the animation
            hideCurrentStepAnimation();
            
            // Reset button after hiding
            setTimeout(() => {
                button.classList.remove('active');
            }, 500);
            break;
            
        case 'guidelines':
            // Don't toggle here, let toggleGuidelines handle the state
            toggleGuidelines();
            break;
            
        case 'clear':
            // Add shake animation
            button.style.animation = 'shake 0.5s ease-in-out';
            setTimeout(() => {
                button.style.animation = '';
            }, 500);
            
            clearCurrentCanvas();
            break;
    }
}

// Helper functions for actions
function triggerStepDemo() {
    // This will trigger the appropriate demo based on current step
    const currentStep = getCurrentStep();
    console.log(`Triggering demo for ${currentStep}`);
    
    // Call the appropriate demo function based on step
    switch(currentStep) {
        case 'step1':
            if (typeof showDrawingDemo === 'function') {
                showDrawingDemo();
            }
            break;
        case 'step2':
            if (typeof showFacialDemo === 'function') {
                showFacialDemo();
            }
            break;
        case 'step3':
            if (typeof showEyeDemo === 'function') {
                showEyeDemo();
            }
            break;
        case 'step4':
            if (typeof showNoseDemo === 'function') {
                showNoseDemo();
            }
            break;
        case 'step5':
            if (typeof showMouthDemo === 'function') {
                showMouthDemo();
            }
            break;
        case 'step6':
            if (typeof showEarDemo === 'function') {
                showEarDemo();
            }
            break;
        case 'step7':
            if (typeof showHairDemo === 'function') {
                showHairDemo();
            }
            break;
        case 'step8':
            if (typeof showFinishingDemo === 'function') {
                showFinishingDemo();
            }
            break;
    }
}

// Removed duplicate toggleGuidelines function - using the comprehensive one below

function clearCurrentCanvas() {
    console.log('Clearing user drawings only...');
    const currentStep = getCurrentStep();
    console.log('Current step:', currentStep);
    
    // Clear USER drawing canvas (not the animation canvas)
    const userCanvas = appState.userCanvases[currentStep];
    const userCtx = appState.userContexts[currentStep];
    
    if (userCanvas && userCtx) {
        console.log('Found user canvas to clear for step:', currentStep);
        
        // Clear the user drawing canvas
        userCtx.clearRect(0, 0, userCanvas.width, userCanvas.height);
        
        // Add visual feedback to the user canvas
        userCanvas.style.opacity = '0.5';
        setTimeout(() => {
            userCanvas.style.opacity = '1';
        }, 200);
        
        console.log('User drawings cleared successfully');
    } else {
        console.warn('No user canvas found for current step:', currentStep);
        console.log('Available user canvases:', Object.keys(appState.userCanvases));
        
        // Fallback: try to find any canvas with user drawings
        const allUserCanvases = Object.values(appState.userCanvases);
        if (allUserCanvases.length > 0) {
            allUserCanvases.forEach((canvas, index) => {
                if (canvas) {
                    const ctx = canvas.getContext('2d');
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    console.log(`Cleared user canvas ${index}`);
                }
            });
        }
    }
    
    // Visual feedback on the button
    const clearBtn = document.querySelector('.clear-btn');
    if (clearBtn) {
        clearBtn.classList.add('active');
        setTimeout(() => {
            clearBtn.classList.remove('active');
        }, 300);
    }
}

function getCurrentStep() {
    const activeSection = document.querySelector('.content-section.active');
    return activeSection ? activeSection.id : 'step1';
}

// Manual function to force toolbox initialization (for debugging)
window.forceInitToolbox = function() {
    console.log('🔧 Force initializing toolbox...');
    initializeEnhancedUniversalToolbox();
    console.log('🔧 Toolbox force initialization complete!');
};

// Also make the toolbox creation function available globally for testing
window.testToolbox = function() {
    const testDiv = document.createElement('div');
    testDiv.innerHTML = createEnhancedUniversalToolbox();
    document.body.appendChild(testDiv);
    console.log('🧪 Test toolbox added to body');
};

// Enhanced real-time tool functions
const RealTimeTools = {
    // Update tool appearance and functionality in real-time
    switchTool(toolName) {
        appState.currentTool = toolName;
        
        // Update tool buttons with enhanced animations
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tool === toolName) {
                btn.classList.add('active');
                // Add bounce effect
                btn.style.animation = 'toolActivate 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
                setTimeout(() => {
                    btn.style.animation = '';
                }, 400);
            }
        });
        
        // Update cursor style and canvas behavior
        this.updateCanvasInteraction(toolName);
        this.showToolFeedback(toolName);
    },
    
    updateCanvasInteraction(toolName) {
        const canvases = document.querySelectorAll('canvas[id^="drawing-canvas"]');
        canvases.forEach(canvas => {
            switch(toolName) {
                case 'pencil':
                    canvas.style.cursor = 'crosshair';
                    canvas.style.filter = 'none';
                    break;
                case 'eraser':
                    canvas.style.cursor = 'grab';
                    canvas.style.filter = 'brightness(1.1)';
                    break;
                case 'ruler':
                    canvas.style.cursor = 'pointer';
                    canvas.style.filter = 'contrast(1.1)';
                    break;
            }
        });
    },
    
    showToolFeedback(toolName) {
        const toolboxTitle = document.querySelector('.toolbox-title');
        if (toolboxTitle) {
            // Add glowing effect to title
            toolboxTitle.style.animation = 'titleGlow 0.5s ease-out';
            setTimeout(() => {
                toolboxTitle.style.animation = '';
            }, 500);
            
            // Update title text with icon
            switch(toolName) {
                case 'pencil':
                    toolboxTitle.innerHTML = '<i class="fas fa-pencil-alt"></i> Mod Creion Activ';
                    break;
                case 'eraser':
                    toolboxTitle.innerHTML = '<i class="fas fa-eraser"></i> Mod Radieră Activ';
                    break;
                case 'ruler':
                    toolboxTitle.innerHTML = '<i class="fas fa-ruler"></i> Mod Riglă Activ';
                    break;
            }
        }
    },
    
    // Real-time value updates with visual feedback
    updateBrushSize(value) {
        appState.brushSize = value;
        const display = document.getElementById('brush-size-value');
        if (display) {
            display.textContent = value + 'px';
            display.style.animation = 'valueUpdate 0.3s ease-out';
            setTimeout(() => {
                display.style.animation = '';
            }, 300);
        }
    },
    
    updateOpacity(value) {
        appState.opacity = value;
        const percentage = Math.round(value * 100);
        const display = document.getElementById('opacity-value');
        if (display) {
            display.textContent = percentage + '%';
            display.style.animation = 'valueUpdate 0.3s ease-out';
            setTimeout(() => {
                display.style.animation = '';
            }, 300);
        }
    }
};

// Setup enhanced tool handlers
function setupEnhancedToolHandlers() {
    // Enhanced tool button interactions
    document.addEventListener('click', function(e) {
        const toolBtn = e.target.closest('.tool-btn');
        if (toolBtn && toolBtn.dataset.tool) {
            RealTimeTools.switchTool(toolBtn.dataset.tool);
        }
    });
    
    // Real-time range input handlers
    const brushSizeInput = document.getElementById('brush-size');
    
    if (brushSizeInput) {
        brushSizeInput.addEventListener('input', function(e) {
            RealTimeTools.updateBrushSize(parseInt(e.target.value));
        });
    }
}

// Add enhanced CSS animations
const enhancedStyles = document.createElement('style');
enhancedStyles.textContent = `
    @keyframes toolActivate {
        0% { transform: scale(1); }
        50% { transform: scale(1.15) rotate(5deg); }
        100% { transform: scale(1.05); }
    }
    
    @keyframes titleGlow {
        0% { transform: scale(1); filter: brightness(1); }
        50% { transform: scale(1.05); filter: brightness(1.2); }
        100% { transform: scale(1); filter: brightness(1); }
    }
    
    @keyframes valueUpdate {
        0% { transform: scale(1); background: rgba(79, 70, 229, 0.1); }
        50% { transform: scale(1.2); background: rgba(79, 70, 229, 0.2); }
        100% { transform: scale(1); background: rgba(79, 70, 229, 0.1); }
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;
document.head.appendChild(enhancedStyles);

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Starting app initialization...');
    
    initializeApp();
    setupEventListeners();
    setupCanvas();
    setupProportionsCanvas();
    updateMaterialsProgress();
    
    // Delay toolbox initialization to ensure DOM is ready
    setTimeout(() => {
        console.log('⏰ Delayed toolbox initialization...');
        initializeEnhancedUniversalToolbox();
        setupEnhancedToolHandlers();
    }, 100);
    
    // Auto-switch to step1 for testing the new tools panel
    setTimeout(() => {
        console.log('📍 Switching to step1...');
        switchSection('step1');
        
        // Reinitialize toolbox after section switch to ensure it's visible
        setTimeout(() => {
            console.log('🔄 Reinitializing toolbox after section switch...');
            initializeEnhancedUniversalToolbox();
            RealTimeTools.switchTool('pencil');
            
            // Force check if toolbox exists
            const toolboxes = document.querySelectorAll('.enhanced-toolbox');
            console.log(`✅ Found ${toolboxes.length} toolboxes on page`);
            
            // If no toolboxes found, force create one on current step
            if (toolboxes.length === 0) {
                console.log('⚠️ No toolboxes found! Force creating...');
                window.forceInitToolbox();
            }
        }, 300);
    }, 600);
});

function initializeApp() {
    // Setup core systems
    setupCanvas();
    
    // Initialize progressive drawing system
    ProgressiveDrawing.initializeMasterCanvas();
    addProgressiveEventListeners();
    
    // Initialize portrait progress tracking
    updatePortraitProgress();
    
    // Add entrance animation delay for elements
    const animatedElements = document.querySelectorAll('.material-card, .nav-tab');
    animatedElements.forEach((el, index) => {
        el.style.animationDelay = `${index * 0.1}s`;
        el.classList.add('fadeInUp');
    });
    
    // Show welcome guidance
    setTimeout(() => {
        const canvas = document.querySelector('#drawing-canvas');
        if (canvas && appState.currentSection === 'materials') {
            ProgressiveDrawing.showStepGuidance(
                canvas,
                '🎨 Bun venit la cursul de portret! Fiecare pas contribuie la portretul final.'
            );
        }
    }, 2000);
}

function setupEventListeners() {
    // Navigation tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const section = e.currentTarget.dataset.section;
            if (!isAllowedToSwitchTo(section)) {
                // Show feedback to user
                const feedback = document.createElement('div');
                feedback.className = 'section-locked-feedback';
                feedback.textContent = 'Finalizează mai întâi pașii anteriori!';
                feedback.style.position = 'fixed';
                feedback.style.top = '20px';
                feedback.style.left = '50%';
                feedback.style.transform = 'translateX(-50%)';
                feedback.style.backgroundColor = '#ef4444';
                feedback.style.color = 'white';
                feedback.style.padding = '10px 20px';
                feedback.style.borderRadius = '5px';
                feedback.style.zIndex = '1000';
                document.body.appendChild(feedback);
                
                setTimeout(() => {
                    feedback.style.opacity = '0';
                    setTimeout(() => feedback.remove(), 300);
                }, 2000);
                
                return;
            }
            switchSection(section);
        });
    });

    // Materials checkboxes
    document.querySelectorAll('.material-check input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', handleMaterialCheck);
    });

    // Continue buttons
    document.getElementById('materials-continue').addEventListener('click', () => {
        switchSection('proportions');
    });

    document.getElementById('proportions-continue').addEventListener('click', () => {
        switchSection('step1');
    });

    document.getElementById('step2-continue').addEventListener('click', () => {
        // Save current step drawing before moving to next
        saveCurrentStepDrawing('step2');
        ProgressiveDrawing.markStepCompleted('step2');
        switchSection('step3');
    });

    document.getElementById('step4-continue').addEventListener('click', () => {
        // Save current step drawing before moving to next
        saveCurrentStepDrawing('step4');
        ProgressiveDrawing.markStepCompleted('step4');
        switchSection('step5');
    });

    document.getElementById('step5-continue').addEventListener('click', () => {
        // Save current step drawing before moving to next
        saveCurrentStepDrawing('step5');
        ProgressiveDrawing.markStepCompleted('step5');
        switchSection('step6');
    });

    document.getElementById('step6-continue').addEventListener('click', () => {
        // Save current step drawing before moving to next
        saveCurrentStepDrawing('step6');
        ProgressiveDrawing.markStepCompleted('step6');
        switchSection('step7');
    });

    document.getElementById('step7-continue').addEventListener('click', () => {
        // Save current step drawing before moving to next
        saveCurrentStepDrawing('step7');
        ProgressiveDrawing.markStepCompleted('step7');
        switchSection('step8');
    });

    document.getElementById('step8-continue').addEventListener('click', () => {
        // Save final step drawing
        saveCurrentStepDrawing('step8');
        // Mark final step as completed
        ProgressiveDrawing.markStepCompleted('step8');
        // Portrait is complete!
        setTimeout(() => showUltimateCelebration(), 1000);
    });

    // Proportions controls
    document.querySelectorAll('.proportion-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const guide = e.currentTarget.dataset.guide;
            showProportionGuide(guide);
        });
    });

    // Universal Drawing tools for all steps
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('tool-btn') || e.target.closest('.tool-btn')) {
            const btn = e.target.classList.contains('tool-btn') ? e.target : e.target.closest('.tool-btn');
            const tool = btn.dataset.tool;
            selectTool(tool);
        }
    });

    // Universal tool settings for all steps
    document.addEventListener('input', (e) => {
        if (e.target.classList.contains('brush-size-control')) {
            appState.brushSize = parseInt(e.target.value);
            // Update all brush size displays
            document.querySelectorAll('.brush-size-value').forEach(el => {
                el.textContent = `${appState.brushSize}px`;
            });
            // Update eraser cursor if eraser is selected
            if (appState.currentTool === 'eraser') {
                // We only need to update the cursor for the current canvas
                const currentUserCanvas = getCurrentCanvas();
                if (currentUserCanvas) {
                    createEraserCursor(currentUserCanvas);
                }
            }
        }
        

    });

    // Universal control buttons for all steps
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('control-btn') || e.target.closest('.control-btn')) {
            const btn = e.target.classList.contains('control-btn') ? e.target : e.target.closest('.control-btn');
            const action = btn.dataset.action;
            
            switch(action) {
                case 'demo':
                    showCurrentStepDemo();
                    break;
                case 'disappear':
                    hideCurrentStepAnimation();
                    break;
                case 'guidelines':
                    toggleCurrentStepGuidelines();
                    break;
                case 'clear':
                    clearCurrentStepOnly();
                    break;
            }
        }
    });

    // Drawing controls - now handled by universal toolbox
    // Old individual controls removed - using universal system instead

    // Step 2 event listeners
    document.querySelectorAll('.show-line-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const line = e.currentTarget.dataset.line;
            showFacialLine(line);
        });
    });

    // Safe event listener attachment helper
    function safeAddEventListener(id, event, handler) {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener(event, handler);
        }
    }
    
    // Step 2 specific controls (if they exist)
    safeAddEventListener('show-facial-demo', 'click', showFacialDemo);
    safeAddEventListener('show-all-lines', 'click', showAllFacialLines);
    safeAddEventListener('clear-step2', 'click', clearStep2Canvas);

    // Step 3 event listeners
    safeAddEventListener('show-eye-demo', 'click', showEyeDemo);
    safeAddEventListener('show-eye-grid', 'click', showEyeGrid);
    safeAddEventListener('clear-step3', 'click', clearStep3Canvas);


    // Eye step progression
    document.querySelectorAll('.eye-step').forEach(step => {
        step.addEventListener('click', (e) => {
            const stepName = e.currentTarget.dataset.step;
            highlightEyeStep(stepName);
        });
    });

    // Eye anatomy highlighting
    document.querySelectorAll('.eye-part').forEach(part => {
        part.addEventListener('click', (e) => {
            const partName = e.currentTarget.dataset.part;
            highlightEyePart(partName);
        });
    });

    // Step 4 event listeners
    safeAddEventListener('show-nose-demo', 'click', showNoseDemo);
    safeAddEventListener('show-nose-grid', 'click', showNoseGrid);
    safeAddEventListener('clear-step4', 'click', clearStep4Canvas);

    // Nose step progression
    document.querySelectorAll('.nose-step').forEach(step => {
        step.addEventListener('click', (e) => {
            const stepName = e.currentTarget.dataset.step;
            highlightNoseStep(stepName);
        });
    });

    // Nose anatomy highlighting
    document.querySelectorAll('.nose-part').forEach(part => {
        part.addEventListener('click', (e) => {
            const partName = e.currentTarget.dataset.part;
            highlightNosePart(partName);
        });
    });

    // Step 5 event listeners
    safeAddEventListener('show-mouth-demo', 'click', showMouthDemo);
    safeAddEventListener('show-mouth-grid', 'click', showMouthGrid);
    safeAddEventListener('clear-step5', 'click', clearStep5Canvas);

    // Mouth step progression
    document.querySelectorAll('.mouth-step').forEach(step => {
        step.addEventListener('click', (e) => {
            const stepName = e.currentTarget.dataset.step;
            highlightMouthStep(stepName);
        });
    });

    // Mouth anatomy highlighting
    document.querySelectorAll('.mouth-part').forEach(part => {
        part.addEventListener('click', (e) => {
            const partName = e.currentTarget.dataset.part;
            highlightMouthPart(partName);
        });
    });

    // Step 6 event listeners
    safeAddEventListener('show-ear-demo', 'click', showEarDemo);
    safeAddEventListener('show-ear-grid', 'click', showEarGrid);
    safeAddEventListener('clear-step6', 'click', clearStep6Canvas);

    // Ear step progression
    document.querySelectorAll('.ear-step').forEach(step => {
        step.addEventListener('click', (e) => {
            const stepName = e.currentTarget.dataset.step;
            highlightEarStep(stepName);
        });
    });

    // Ear anatomy highlighting
    document.querySelectorAll('.ear-part').forEach(part => {
        part.addEventListener('click', (e) => {
            const partName = e.currentTarget.dataset.part;
            highlightEarPart(partName);
        });
    });

    // Step 7 event listeners
    safeAddEventListener('show-hair-demo', 'click', showHairDemo);
    safeAddEventListener('show-hair-grid', 'click', showHairGrid);
    safeAddEventListener('clear-step7', 'click', clearStep7Canvas);

    // Hair step progression
    document.querySelectorAll('.hair-step').forEach(step => {
        step.addEventListener('click', (e) => {
            const stepName = e.currentTarget.dataset.step;
            highlightHairStep(stepName);
        });
    });

    // Hair tool interactions
    document.querySelectorAll('.texture-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const texture = e.currentTarget.dataset.texture;
            applyHairTexture(texture);
        });
    });

    document.querySelectorAll('.highlight-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const highlight = e.currentTarget.dataset.highlight;
            applyHairHighlight(highlight);
        });
    });

    document.querySelectorAll('.detail-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const detail = e.currentTarget.dataset.detail;
            applyHairDetail(detail);
        });
    });

    // Step 8 event listeners
    safeAddEventListener('show-finishing-demo', 'click', showFinishingDemo);
    safeAddEventListener('show-symmetry-grid', 'click', showSymmetryGrid);
    safeAddEventListener('clear-step8', 'click', clearStep8Canvas);

    // Finishing step progression
    document.querySelectorAll('.finishing-step').forEach(step => {
        step.addEventListener('click', (e) => {
            const stepName = e.currentTarget.dataset.step;
            highlightFinishingStep(stepName);
        });
    });

    // Finishing tool interactions
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tool = e.currentTarget.dataset.tool;
            applyTool(tool);
        });
    });

    // Symmetry check interactions
    document.querySelectorAll('.check-item input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const checkName = e.currentTarget.closest('.check-item').dataset.check;
            checkSymmetry(checkName);
        });
    });

    // Signature functionality
    safeAddEventListener('add-signature', 'click', addSignature);
}

function setupCanvas() {
    // Initialize all canvases for progressive drawing system
    canvas = document.getElementById('drawing-canvas');
    step2Canvas = document.getElementById('drawing-canvas-step2');
    step3Canvas = document.getElementById('drawing-canvas-step3');
    step4Canvas = document.getElementById('drawing-canvas-step4');
    step5Canvas = document.getElementById('drawing-canvas-step5');
    step6Canvas = document.getElementById('drawing-canvas-step6');
    step7Canvas = document.getElementById('drawing-canvas-step7');
    step8Canvas = document.getElementById('drawing-canvas-step8');
    
    // Setup main canvas
    if (canvas) {
        ctx = canvas.getContext('2d');
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    }
    
    // Setup all step canvases with progressive drawing capability
    const stepCanvases = [
        {canvas: step2Canvas, varName: 'step2Ctx'},
        {canvas: step3Canvas, varName: 'step3Ctx'},
        {canvas: step4Canvas, varName: 'step4Ctx'},
        {canvas: step5Canvas, varName: 'step5Ctx'},
        {canvas: step6Canvas, varName: 'step6Ctx'},
        {canvas: step7Canvas, varName: 'step7Ctx'},
        {canvas: step8Canvas, varName: 'step8Ctx'}
    ];
    
    stepCanvases.forEach(({canvas, varName}) => {
        if (canvas) {
            const context = canvas.getContext('2d');
            context.lineCap = 'round';
            context.lineJoin = 'round';
            
            // Assign to global variables
            switch(varName) {
                case 'step2Ctx': step2Ctx = context; break;
                case 'step3Ctx': step3Ctx = context; break;
                case 'step4Ctx': step4Ctx = context; break;
                case 'step5Ctx': step5Ctx = context; break;
                case 'step6Ctx': step6Ctx = context; break;
                case 'step7Ctx': step7Ctx = context; break;
                case 'step8Ctx': step8Ctx = context; break;
            }
        }
    });
    
    // Initialize progressive drawing system
    ProgressiveDrawing.initializeMasterCanvas();
    
    // Create user drawing layer canvases
    createUserDrawingLayers();
    
    // Debug: Log created user canvases
    console.log('User canvases created:', Object.keys(appState.userCanvases));
    console.log('Current step user canvas exists:', !!appState.userCanvases[appState.currentSection]);
    
    // Add universal drawing event listeners to user canvases only
    setupUserCanvasEvents();
}

function createUserDrawingLayers() {
    console.log('Creating user drawing layers...');
    const stepIds = ['step1', 'step2', 'step3', 'step4', 'step5', 'step6', 'step7', 'step8'];
    
    stepIds.forEach(stepId => {
        const section = document.getElementById(stepId);
        if (section) {
            const mainCanvas = section.querySelector('canvas');
            if (mainCanvas) {
                console.log(`Creating user canvas for ${stepId}`);
                // Create user drawing canvas overlay
                const userCanvas = document.createElement('canvas');
                userCanvas.width = mainCanvas.width;
                userCanvas.height = mainCanvas.height;
                userCanvas.style.position = 'absolute';
                userCanvas.style.pointerEvents = 'all';
                userCanvas.style.zIndex = '10';
                userCanvas.id = `${stepId}-user-canvas`;
                
                // Position the user canvas to align exactly over the main canvas
                const canvasArea = mainCanvas.parentElement;
                canvasArea.style.position = 'relative';
                
                userCanvas.style.border = 'none';
                userCanvas.style.background = 'transparent';
                userCanvas.style.top = mainCanvas.offsetTop + 'px';
                userCanvas.style.left = mainCanvas.offsetLeft + 'px';
                
                // Ensure pointer alignment on resize
                function align() {
                    userCanvas.style.top = mainCanvas.offsetTop + 'px';
                    userCanvas.style.left = mainCanvas.offsetLeft + 'px';
                    userCanvas.width = mainCanvas.width;
                    userCanvas.height = mainCanvas.height;
                }
                align();
                // Observe size/position changes
                const resizeObserver = new ResizeObserver(align);
                resizeObserver.observe(canvasArea);
                window.addEventListener('resize', align);
                
                canvasArea.appendChild(userCanvas);
                
                // Store references
                const userCtx = userCanvas.getContext('2d');
                userCtx.lineCap = 'round';
                userCtx.lineJoin = 'round';
                
                appState.userCanvases[stepId] = userCanvas;
                appState.userContexts[stepId] = userCtx;
            }
        }
    });
}

function setupUserCanvasEvents() {
    Object.keys(appState.userCanvases).forEach(stepId => {
        const userCanvas = appState.userCanvases[stepId];
        if (userCanvas) {
            // Mouse events
            userCanvas.addEventListener('mousedown', startDrawing);
            userCanvas.addEventListener('mousemove', draw);
            userCanvas.addEventListener('mouseup', stopDrawing);
            userCanvas.addEventListener('mouseout', stopDrawing);
            
            // Add mouse enter/leave events for cursor management
            userCanvas.addEventListener('mouseenter', handleCanvasMouseEnter);
            userCanvas.addEventListener('mouseleave', handleCanvasMouseLeave);
            userCanvas.addEventListener('mousemove', handleCanvasMouseMove);

            // Enhanced touch events for iPad and Apple Pencil
            userCanvas.addEventListener('touchstart', handleTouch, { passive: false });
            userCanvas.addEventListener('touchmove', handleTouch, { passive: false });
            userCanvas.addEventListener('touchend', stopDrawing, { passive: false });
            userCanvas.addEventListener('touchcancel', stopDrawing, { passive: false });
            
            // Apple Pencil specific events
            if (window.PointerEvent) {
                userCanvas.addEventListener('pointerdown', handlePointer, { passive: false });
                userCanvas.addEventListener('pointermove', handlePointer, { passive: false });
                userCanvas.addEventListener('pointerup', stopDrawing, { passive: false });
                userCanvas.addEventListener('pointercancel', stopDrawing, { passive: false });
            }
        }
    });
}

function setupProportionsCanvas() {
    proportionsCanvas = document.getElementById('proportions-canvas');
    proportionsCtx = proportionsCanvas.getContext('2d');
    
    // Draw initial proportions guide
    drawProportionsGuide('all');
}

// Helper function to determine if a section can be accessed
// Helper function to get the next section name
function getNextSection(currentSection) {
    const sections = [
        'materials',
        'proportions',
        'step1',
        'step2',
        'step3',
        'step4',
        'step5',
        'step6',
        'step7',
        'step8'
    ];
    
    const currentIndex = sections.indexOf(currentSection);
    if (currentIndex === -1 || currentIndex === sections.length - 1) return null;
    return sections[currentIndex + 1];
}

function isAllowedToSwitchTo(sectionName) {
    const sections = [
        'materials',
        'proportions',
        'step1',
        'step2',
        'step3',
        'step4',
        'step5',
        'step6',
        'step7',
        'step8'
    ];

    // Always allow switching to materials section
    if (sectionName === 'materials') return true;

    const currentIndex = sections.indexOf(appState.currentSection);
    const targetIndex = sections.indexOf(sectionName);

    // Allow switching to the next section or any completed section
    return targetIndex <= currentIndex + 1 || appState.completedSteps.has(ProgressiveDrawing.getStepDrawingName(sectionName));
}

// Function to add next task button and portrait button to a section
function addNextTaskButton(section) {
    // Remove any existing next task button and portrait button
    const existingBtn = section.querySelector('.next-task-btn');
    if (existingBtn) existingBtn.remove();
    
    const existingPortraitBtn = section.querySelector('.portrait-btn');
    if (existingPortraitBtn) existingPortraitBtn.remove();

    let controlsContainer = section.querySelector('.step-controls');
    
    // If no step-controls container exists (like in step1), create one
    if (!controlsContainer) {
        controlsContainer = document.createElement('div');
        controlsContainer.className = 'step-controls';
        controlsContainer.style.cssText = `
            margin-top: 20px;
            padding: 20px;
            border-top: 1px solid #e5e7eb;
        `;
        
        // For step1, add it after the dimensions-info section
        if (section.id === 'step1') {
            const dimensionsInfo = section.querySelector('.dimensions-info');
            if (dimensionsInfo) {
                dimensionsInfo.appendChild(controlsContainer);
            } else {
                section.appendChild(controlsContainer);
            }
        } else {
            section.appendChild(controlsContainer);
        }
    }
    
    // Create button container
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'step-buttons-container';
    buttonContainer.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-top: 20px;
        width: 100%;
    `;
    
    // Create portrait button
    const portraitBtn = document.createElement('button');
    portraitBtn.className = 'portrait-btn';
    portraitBtn.innerHTML = `
        <i class="fas fa-portrait"></i>
        Vezi Portretul Complet
    `;
    portraitBtn.style.cssText = `
        background-color: #10b981;
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        justify-content: center;
        font-weight: bold;
        transition: background-color 0.3s;
    `;
    
    portraitBtn.addEventListener('mouseover', () => {
        portraitBtn.style.backgroundColor = '#059669';
    });
    
    portraitBtn.addEventListener('mouseout', () => {
        portraitBtn.style.backgroundColor = '#10b981';
    });

    portraitBtn.addEventListener('click', () => {
        // Update portrait progress before showing
        updatePortraitProgress();
        showCompletePortrait();
    });
    
    // Add portrait button
    buttonContainer.appendChild(portraitBtn);

    // Add next section button if there is a next section
    const nextSection = getNextSection(section.id);
    if (nextSection) {
        const nextTaskBtn = document.createElement('button');
        nextTaskBtn.className = 'next-task-btn';
        nextTaskBtn.innerHTML = `
            <i class="fas fa-arrow-right"></i>
            ${nextSection.startsWith('step') ? 'Mergi la Pasul ' + nextSection.slice(4) : 
              nextSection === 'proportions' ? 'Mergi la Proporții' : 
              nextSection === 'materials' ? 'Mergi la Materiale' : 'Următorul pas'}
        `;
        nextTaskBtn.style.cssText = `
            background-color: #4f46e5;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            justify-content: center;
            font-weight: bold;
            transition: background-color 0.3s;
        `;
        
        nextTaskBtn.addEventListener('mouseover', () => {
            nextTaskBtn.style.backgroundColor = '#4338ca';
        });
        
        nextTaskBtn.addEventListener('mouseout', () => {
            nextTaskBtn.style.backgroundColor = '#4f46e5';
        });

        nextTaskBtn.addEventListener('click', () => {
            if (isAllowedToSwitchTo(nextSection)) {
                // Save current step drawing before switching
                if (section.id.startsWith('step')) {
                    saveCurrentStepDrawing(section.id);
                }
                switchSection(nextSection);
            }
        });
        
        buttonContainer.appendChild(nextTaskBtn);
    }

    controlsContainer.appendChild(buttonContainer);
}

// Function to save current step drawing
function saveCurrentStepDrawing(stepSection) {
    const stepData = ProgressiveDrawing.getStepDrawingName(stepSection);
    
    // Get canvas for specific step section
    const canvasMap = {
        'step1': {canvas, ctx},
        'step2': {canvas: step2Canvas, ctx: step2Ctx},
        'step3': {canvas: step3Canvas, ctx: step3Ctx},
        'step4': {canvas: step4Canvas, ctx: step4Ctx},
        'step5': {canvas: step5Canvas, ctx: step5Ctx},
        'step6': {canvas: step6Canvas, ctx: step6Ctx},
        'step7': {canvas: step7Canvas, ctx: step7Ctx},
        'step8': {canvas: step8Canvas, ctx: step8Ctx}
    };
    
    const targetCanvas = canvasMap[stepSection];
    
    console.log(`Manually saving step data for ${stepSection} -> ${stepData}`);
    
    if (targetCanvas && targetCanvas.canvas && targetCanvas.ctx) {
        // Create a composite canvas to merge main canvas and user canvas (if exists)
        const compositeCanvas = document.createElement('canvas');
        compositeCanvas.width = targetCanvas.canvas.width;
        compositeCanvas.height = targetCanvas.canvas.height;
        const compositeCtx = compositeCanvas.getContext('2d');
        
        // First draw the main canvas
        compositeCtx.drawImage(targetCanvas.canvas, 0, 0);
        
        // Then draw the user canvas overlay if it exists
        const userCanvas = appState.userCanvases[stepSection];
        if (userCanvas) {
            console.log(`Found user canvas for ${stepSection}, merging...`);
            compositeCtx.drawImage(userCanvas, 0, 0);
        }
        
        // Check if the composite canvas has any drawing data
        const imageData = compositeCtx.getImageData(0, 0, compositeCanvas.width, compositeCanvas.height);
        const hasDrawing = imageData.data.some((pixel, index) => {
            // Check if any pixel is not transparent (alpha channel)
            return index % 4 === 3 && pixel > 0;
        });
        
        if (hasDrawing) {
            // Save the composite drawing
            appState.drawingData[stepData] = compositeCanvas.toDataURL();
            appState.completedSteps.add(stepData);
            console.log(`✅ Manually saved drawing data for ${stepData}`);
            
            // Update progress tracking
            updatePortraitProgress();
        } else {
            console.log(`❌ No drawing found on canvas for ${stepData}`);
        }
    } else {
        console.log(`❌ Canvas or context not found for ${stepSection}`);
    }
}

function switchSection(sectionName) {
    // Check if the requested section is allowed
    if (!isAllowedToSwitchTo(sectionName)) {
        console.log(`Cannot switch to ${sectionName} - complete previous steps first`);
        return;
    }

    // Save current step data before switching (if we're leaving a step)
    if (appState.currentSection.startsWith('step') && appState.currentSection !== sectionName) {
        const currentStepData = ProgressiveDrawing.getStepDrawingName(appState.currentSection);
        const currentCanvas = ProgressiveDrawing.getCurrentStepCanvas();
        
        console.log(`Saving step data for ${appState.currentSection} -> ${currentStepData}`);
        console.log('Current canvas:', currentCanvas);
        
        if (currentCanvas.canvas && currentCanvas.ctx) {
            // Create a composite canvas to merge main canvas and user canvas (if exists)
            const compositeCanvas = document.createElement('canvas');
            compositeCanvas.width = currentCanvas.canvas.width;
            compositeCanvas.height = currentCanvas.canvas.height;
            const compositeCtx = compositeCanvas.getContext('2d');
            
            // First draw the main canvas
            compositeCtx.drawImage(currentCanvas.canvas, 0, 0);
            
            // Then draw the user canvas overlay if it exists
            const userCanvas = appState.userCanvases[appState.currentSection];
            if (userCanvas) {
                console.log(`Found user canvas for ${appState.currentSection}, merging...`);
                compositeCtx.drawImage(userCanvas, 0, 0);
            }
            
            // Check if the composite canvas has any drawing data
            const imageData = compositeCtx.getImageData(0, 0, compositeCanvas.width, compositeCanvas.height);
            const hasDrawing = imageData.data.some((pixel, index) => {
                // Check if any pixel is not transparent (alpha channel)
                return index % 4 === 3 && pixel > 0;
            });
            
            if (hasDrawing) {
                // Save the composite drawing
                appState.drawingData[currentStepData] = compositeCanvas.toDataURL();
                appState.completedSteps.add(currentStepData);
                console.log(`✅ Saved drawing data for ${currentStepData}`);
                
                // Update progress tracking
                ProgressiveDrawing.updateProgressTracker();
                updatePortraitProgress();
            } else {
                console.log(`❌ No drawing found on canvas for ${currentStepData}`);
            }
        } else {
            console.log(`❌ Canvas or context not found for ${appState.currentSection}`);
        }
    }
    
    // Update navigation with progress indicators
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

    // Update content
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionName).classList.add('active');

    // Update current section in app state
    appState.currentSection = sectionName;
    console.log(`Current section updated to: ${sectionName}`);

    // Update current step number in universal tools panels
    updateCurrentStepDisplay(sectionName);
    
    // Initialize universal tools for this section if it's a step section
    if (sectionName.startsWith('step')) {
        setTimeout(() => {
            const section = document.getElementById(sectionName);
            if (section) {
                const drawingContainer = section.querySelector('.drawing-container');
                if (drawingContainer) {
                    const controlsArea = drawingContainer.querySelector('.drawing-controls');
                    if (controlsArea) {
                        // Remove old tools panel if exists
                        const oldToolsPanel = controlsArea.querySelector('.tools-panel');
                        if (oldToolsPanel) {
                            oldToolsPanel.remove();
                        }
                        
                        // Enhanced toolbox is now added by initializeEnhancedUniversalToolbox()
                        // No need to add it here as it's handled globally
                    }
                }
            }
        }, 100);
    }

    // Progressive step initialization with previous drawings
    setTimeout(() => {
        if (sectionName === 'step1') {
            highlightCurrentStep();
            initializeProgressiveStep1();
        } else if (sectionName === 'step2') {
            initializeProgressiveStep2();
        } else if (sectionName === 'step3') {
            initializeProgressiveStep3();
        } else if (sectionName === 'step4') {
            initializeProgressiveStep4();
        } else if (sectionName === 'step5') {
            initializeProgressiveStep5();
        } else if (sectionName === 'step6') {
            initializeProgressiveStep6();
        } else if (sectionName === 'step7') {
            initializeProgressiveStep7();
        } else if (sectionName === 'step8') {
            initializeProgressiveStep8();
        }
        
            // After switching section, ensure the cursor is correct for the current tool
    selectTool(appState.currentTool);

    // Add next task button to the current section
    const currentSection = document.getElementById(sectionName);
    if (currentSection) {
        addNextTaskButton(currentSection);
    }
    
    // Ruler visibility is maintained - no need to redraw
}, 300);
}

// Update current step display in universal tools panels
function updateCurrentStepDisplay(sectionName) {
    const stepNumbers = {
        'materials': 'Materiale',
        'proportions': 'Proporții',
        'step1': '1',
        'step2': '2', 
        'step3': '3',
        'step4': '4',
        'step5': '5',
        'step6': '6',
        'step7': '7',
        'step8': '8'
    };
    
    const stepNumber = stepNumbers[sectionName] || '?';
    document.querySelectorAll('.current-step-number').forEach(el => {
        el.textContent = stepNumber;
    });
}

// Progressive Step Initialization Functions
// Function to load all previous completed steps for a specific canvas
async function loadAllPreviousStepsForCanvas(targetCtx, targetCanvas, currentStep) {
    if (!targetCtx || !targetCanvas) return;
    
    console.log(`Loading all previous steps for ${currentStep}`);
    
    // Clear canvas first
    targetCtx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
    
    // Map steps to their data keys
    const stepToDataKey = {
        'step1': 'headOutline',
        'step2': 'guidelines', 
        'step3': 'eyes',
        'step4': 'nose',
        'step5': 'mouth',
        'step6': 'ears',
        'step7': 'hair',
        'step8': 'shading'
    };
    
    // Get the order of steps up to and including current step
    const stepOrder = ['step1', 'step2', 'step3', 'step4', 'step5', 'step6', 'step7', 'step8'];
    const currentStepIndex = stepOrder.indexOf(currentStep);
    const stepsToLoad = stepOrder.slice(0, currentStepIndex + 1);
    
    // Load each completed step in order
    for (const stepName of stepsToLoad) {
        const dataKey = stepToDataKey[stepName];
        if (appState.drawingData[dataKey]) {
            console.log(`Loading ${stepName} (${dataKey}) data`);
            await new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                    console.log(`Drawing ${dataKey} - Image dimensions: ${img.width}x${img.height}, Canvas dimensions: ${targetCanvas.width}x${targetCanvas.height}`);
                    targetCtx.globalAlpha = dataKey === 'guidelines' ? 0.3 : 1;
                    // Draw image to fit canvas dimensions
                    targetCtx.drawImage(img, 0, 0, targetCanvas.width, targetCanvas.height);
                    targetCtx.globalAlpha = 1;
                    console.log(`Successfully drew ${dataKey}`);
                    resolve();
                };
                img.onerror = () => {
                    console.log(`Failed to load image for ${dataKey}`);
                    resolve(); // Continue even if image fails
                };
                img.src = appState.drawingData[dataKey];
            });
        } else {
            console.log(`No data found for ${stepName} (${dataKey})`);
        }
    }
    
    console.log(`Finished loading all steps for ${currentStep}`);
}

function initializeProgressiveStep1() {
    if (!canvas || !ctx) return;
    
    // Load any existing head outline
    loadAllPreviousStepsForCanvas(ctx, canvas, 'step1');
    
    // Show guides for head drawing
    showHeadGuides();
}

function initializeProgressiveStep2() {
    if (!step2Canvas || !step2Ctx) return;
    
    // Load ALL previous completed steps plus current step if it exists
    loadAllPreviousStepsForCanvas(step2Ctx, step2Canvas, 'step2');
    
    // Initialize original step2 functionality
    initializeStep2();
}

function initializeProgressiveStep3() {
    if (!step3Canvas || !step3Ctx) return;
    
    // Load ALL previous completed steps plus current step if it exists  
    loadAllPreviousStepsForCanvas(step3Ctx, step3Canvas, 'step3');
    
    // Initialize original step3 functionality
    initializeStep3();
}

function initializeProgressiveStep4() {
    if (!step4Canvas || !step4Ctx) return;
    
    // Load ALL previous completed steps plus current step if it exists
    loadAllPreviousStepsForCanvas(step4Ctx, step4Canvas, 'step4');
    
    // Initialize original step4 functionality
    initializeStep4();
}

function initializeProgressiveStep5() {
    if (!step5Canvas || !step5Ctx) return;
    
    // Load ALL previous completed steps plus current step if it exists
    loadAllPreviousStepsForCanvas(step5Ctx, step5Canvas, 'step5');
    
    // Initialize original step5 functionality
    initializeStep5();
}

function initializeProgressiveStep6() {
    if (!step6Canvas || !step6Ctx) return;
    
    // Load ALL previous completed steps plus current step if it exists
    loadAllPreviousStepsForCanvas(step6Ctx, step6Canvas, 'step6');
    
    // Initialize original step6 functionality
    initializeStep6();
}

function initializeProgressiveStep7() {
    if (!step7Canvas || !step7Ctx) return;
    
    // Load ALL previous completed steps plus current step if it exists
    loadAllPreviousStepsForCanvas(step7Ctx, step7Canvas, 'step7');
    
    // Initialize original step7 functionality
    initializeStep7();
}

function initializeProgressiveStep8() {
    if (!step8Canvas || !step8Ctx) return;
    
    // Load ALL previous completed steps plus current step if it exists
    loadAllPreviousStepsForCanvas(step8Ctx, step8Canvas, 'step8');
    
    // Initialize original step8 functionality
    initializeStep8();
}

function showHeadGuides() {
    if (!canvas || !ctx) return;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Draw light construction guides
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.4;
    ctx.setLineDash([5, 5]);
    
    // Vertical center line
    ctx.beginPath();
    ctx.moveTo(centerX, 50);
    ctx.lineTo(centerX, canvas.height - 50);
    ctx.stroke();
    
    // Horizontal center line
    ctx.beginPath();
    ctx.moveTo(50, centerY);
    ctx.lineTo(canvas.width - 50, centerY);
    ctx.stroke();
    
    // Head proportion guidelines
    const headHeight = 160;
    const headTop = centerY - headHeight;
    const headBottom = centerY + headHeight;
    
    // Head boundaries
    ctx.strokeStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(centerX - 200, headTop);
    ctx.lineTo(centerX + 200, headTop);
    ctx.moveTo(centerX - 200, headBottom);
    ctx.lineTo(centerX + 200, headBottom);
    ctx.stroke();
    
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
}

// Quick Demo Drawing Functions for Testing Progressive System
function drawSampleHead() {
    if (!canvas || !ctx) return;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const headWidth = 120;
    const headHeight = 160;
    
    // Draw basic head outline
    ctx.strokeStyle = '#2d3748';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, headWidth, headHeight, 0, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Save to progressive system
    ProgressiveDrawing.saveStepData('headOutline', (ctx, canvas) => {
        ctx.strokeStyle = '#2d3748';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, headWidth, headHeight, 0, 0, 2 * Math.PI);
        ctx.stroke();
    });
    
    ProgressiveDrawing.markStepCompleted('step1');
}

function addProgressiveEventListeners() {
    // Add demo functionality for testing
    if (canvas) {
        canvas.addEventListener('dblclick', () => {
            if (appState.currentSection === 'step1') {
                drawSampleHead();
                ProgressiveDrawing.showStepGuidance(canvas, '👍 Cap desenat! Poți trece la următorul pas.');
            }
        });
    }
}

function showCompletionIndicator(stepName) {
    // Add visual indicator that step is completed
    const navTab = document.querySelector(`[data-section="${stepName}"]`);
    if (navTab) {
        navTab.classList.add('completed');
        
        // Add checkmark icon
        const icon = navTab.querySelector('i');
        if (icon && !navTab.querySelector('.completion-check')) {
            const check = document.createElement('i');
            check.className = 'fas fa-check completion-check';
            check.style.cssText = `
                position: absolute;
                top: -5px;
                right: -5px;
                background: #22c55e;
                color: white;
                border-radius: 50%;
                width: 18px;
                height: 18px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
            `;
            navTab.style.position = 'relative';
            navTab.appendChild(check);
        }
    }
}

// Function to check if the user has drawn on a specific step's canvas
function hasUserDrawnOnStep(stepSection) {
    // Get the user canvas for the step
    const userCanvas = appState.userCanvases[stepSection];
    if (!userCanvas) return false;
    
    const userCtx = appState.userContexts[stepSection];
    if (!userCtx) return false;
    
    // Get the image data from the user canvas
    const imageData = userCtx.getImageData(0, 0, userCanvas.width, userCanvas.height);
    
    // Check if any pixel is not transparent (alpha channel)
    return imageData.data.some((pixel, index) => {
        return index % 4 === 3 && pixel > 0;
    });
}

// Function to generate and display the complete portrait
function showCompletePortrait() {
    // Update the progress count based on user drawings
    const stepMapping = appState.portraitProgress.stepMapping;
    let userCompletedCount = 0;
    
    for (const [section, dataKey] of Object.entries(stepMapping)) {
        // Check if user has drawn on this step or if there's already data saved for this step
        if (hasUserDrawnOnStep(section) || appState.drawingData[dataKey]) {
            userCompletedCount++;
            // Make sure the step is marked as completed in appState
            appState.completedSteps.add(dataKey);
            // Save the user's drawing if they've drawn on this step but it wasn't saved before
            if (hasUserDrawnOnStep(section) && !appState.drawingData[dataKey]) {
                saveCurrentStepDrawing(section);
            }
        }
    }
    
    // Update the progress count
    appState.portraitProgress.completedStepsCount = userCompletedCount;
    
    // Create a modal to display the complete portrait
    const modal = document.createElement('div');
    modal.className = 'portrait-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.8);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        padding: 20px;
    `;

    // Create container for portrait and info
    const container = document.createElement('div');
    container.style.cssText = `
        background-color: white;
        border-radius: 10px;
        padding: 30px;
        max-width: 90%;
        max-height: 90%;
        display: flex;
        flex-direction: column;
        align-items: center;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        position: relative;
        overflow: auto;
    `;

    // Add header
    const header = document.createElement('div');
    header.style.cssText = `
        width: 100%;
        text-align: center;
        margin-bottom: 20px;
    `;
    header.innerHTML = `
        <h2 style="font-size: 24px; color: #4f46e5; margin: 0;">Portretul tău complet</h2>
        <p style="margin: 10px 0 0; color: #6b7280;">Progres: ${userCompletedCount} din ${appState.portraitProgress.totalSteps} pași</p>
    `;

    // Create canvas for the complete portrait
    const portraitCanvas = document.createElement('canvas');
    portraitCanvas.width = 600;
    portraitCanvas.height = 800;
    portraitCanvas.style.cssText = `
        border: 1px solid #e5e7eb;
        background-color: white;
        margin-bottom: 20px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    `;

    // Capture the COMPLETE PORTRAIT as seen on canvas (PROGRESSIVE)
    captureCompletePortrait(portraitCanvas);

    // Add step indicators
    const stepsContainer = document.createElement('div');
    stepsContainer.style.cssText = `
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 10px;
        margin: 20px 0;
        width: 100%;
    `;

    // Define steps and their status
    const steps = [
        { section: 'step1', name: 'headOutline', label: 'Contur cap', icon: '✏️' },
        { section: 'step2', name: 'guidelines', label: 'Linii ghidaj', icon: '📏' },
        { section: 'step3', name: 'eyes', label: 'Ochi', icon: '👁️' },
        { section: 'step4', name: 'nose', label: 'Nas', icon: '👃' },
        { section: 'step5', name: 'mouth', label: 'Gură', icon: '👄' },
        { section: 'step6', name: 'ears', label: 'Urechi', icon: '👂' },
        { section: 'step7', name: 'hair', label: 'Păr', icon: '💇' },
        { section: 'step8', name: 'shading', label: 'Umbre', icon: '🎨' }
    ];

    steps.forEach(step => {
        const isCompleted = hasUserDrawnOnStep(step.section) || appState.drawingData[step.name];
        const stepIndicator = document.createElement('div');
        stepIndicator.style.cssText = `
            padding: 8px 15px;
            border-radius: 20px;
            background-color: ${isCompleted ? '#10b981' : '#e5e7eb'};
            color: ${isCompleted ? 'white' : '#6b7280'};
            font-weight: ${isCompleted ? 'bold' : 'normal'};
            display: flex;
            align-items: center;
            gap: 5px;
        `;
        stepIndicator.innerHTML = `
            <span>${step.icon}</span>
            <span>${step.label}</span>
            ${isCompleted ? '<span>✓</span>' : ''}
        `;
        stepsContainer.appendChild(stepIndicator);
    });

    // Add close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Închide';
    closeButton.style.cssText = `
        background-color: #4f46e5;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        font-weight: bold;
        margin-top: 20px;
    `;
    closeButton.addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    // Add download button if all steps are completed (either by drawing or from previous sessions)
    if (userCompletedCount === appState.portraitProgress.totalSteps) {
        const downloadButton = document.createElement('a');
        downloadButton.textContent = 'Descarcă portretul';
        downloadButton.style.cssText = `
            background-color: #10b981;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            margin-top: 20px;
            margin-left: 10px;
            text-decoration: none;
        `;
        downloadButton.href = portraitCanvas.toDataURL('image/png');
        downloadButton.download = 'portret.png';
        
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            gap: 10px;
        `;
        buttonContainer.appendChild(closeButton);
        buttonContainer.appendChild(downloadButton);
        container.appendChild(header);
        container.appendChild(portraitCanvas);
        container.appendChild(stepsContainer);
        container.appendChild(buttonContainer);
    } else {
        container.appendChild(header);
        container.appendChild(portraitCanvas);
        container.appendChild(stepsContainer);
        container.appendChild(closeButton);
    }

    modal.appendChild(container);
    document.body.appendChild(modal);
}

// Function to generate the complete portrait by combining all user drawings
function generateCompletePortraitFromUserDrawings(targetCanvas) {
    const ctx = targetCanvas.getContext('2d');
    ctx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, targetCanvas.width, targetCanvas.height);
    
    // Get the size from the first available user canvas
    const firstUserCanvas = Object.values(appState.userCanvases).find(canvas => canvas);
    if (!firstUserCanvas) {
        // Add watermark if no drawings
        ctx.font = '14px Arial';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillText('Nu există desene salvate', 10, targetCanvas.height - 20);
        return;
    }
    
    // Combine all user drawings from each step
    const stepOrder = ['step1', 'step2', 'step3', 'step4', 'step5', 'step6', 'step7', 'step8'];
    
    stepOrder.forEach(stepId => {
        const userCanvas = appState.userCanvases[stepId];
        if (userCanvas && hasUserDrawnOnStep(stepId)) {
            // Draw the user's drawing onto the portrait canvas
            ctx.drawImage(userCanvas, 0, 0, targetCanvas.width, targetCanvas.height);
        }
    });
    
    // Add watermark
    ctx.font = '14px Arial';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillText('Portret realizat pas cu pas', 10, targetCanvas.height - 20);
}

// Function to capture the COMPLETE PORTRAIT as seen on canvas (PROGRESSIVE)
function captureCompletePortrait(targetCanvas) {
    const ctx = targetCanvas.getContext('2d');
    ctx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, targetCanvas.width, targetCanvas.height);
    
    // Get the size from the first available user canvas
    const firstUserCanvas = Object.values(appState.userCanvases).find(canvas => canvas);
    if (!firstUserCanvas) {
        // Add watermark if no drawings
        ctx.font = '14px Arial';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillText('Nu există desene salvate', 10, targetCanvas.height - 20);
        return;
    }
    
    // Combine ALL canvases from each step (USER + TUTORIAL) to show progressive portrait
    const stepOrder = ['step1', 'step2', 'step3', 'step4', 'step5', 'step6', 'step7', 'step8'];
    
    stepOrder.forEach(stepId => {
        // Get the canvas container for this step
        const stepContainer = document.querySelector(`#${stepId} .canvas-area`);
        if (stepContainer) {
            // Get ALL canvases in this step (tutorial + user)
            const canvases = stepContainer.querySelectorAll('canvas');
            canvases.forEach(canvas => {
                if (canvas.width > 0 && canvas.height > 0) {
                    // Draw each canvas onto the portrait canvas (this includes tutorial + user drawings)
                    ctx.drawImage(canvas, 0, 0, targetCanvas.width, targetCanvas.height);
                }
            });
        }
    });
    
    // Add watermark
    ctx.font = '14px Arial';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillText('Portret realizat pas cu pas', 10, targetCanvas.height - 20);
}

// Function to generate the complete portrait by combining all steps (legacy)
function generateCompletePortrait(targetCanvas) {
    const ctx = targetCanvas.getContext('2d');
    ctx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, targetCanvas.width, targetCanvas.height);
    
    // Define step order for layering
    const stepOrder = ['headOutline', 'guidelines', 'eyes', 'eyebrows', 'nose', 'mouth', 'ears', 'hair', 'shading', 'highlights'];
    
    // Draw each completed step
    const drawSteps = async () => {
        for (const stepName of stepOrder) {
            if (appState.drawingData[stepName]) {
                await new Promise((resolve) => {
                    const img = new Image();
                    img.onload = () => {
                        ctx.globalAlpha = stepName === 'guidelines' ? 0.3 : 1;
                        ctx.drawImage(img, 0, 0, targetCanvas.width, targetCanvas.height);
                        ctx.globalAlpha = 1;
                        resolve();
                    };
                    img.onerror = () => resolve(); // Continue even if image fails
                    img.src = appState.drawingData[stepName];
                });
            }
        }
        
        // Add watermark
        ctx.font = '14px Arial';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillText('Portret realizat pas cu pas', 10, targetCanvas.height - 20);
    };
    
    drawSteps();
}

// Function to update portrait progress
function updatePortraitProgress() {
    let completedCount = 0;
    const stepMapping = appState.portraitProgress.stepMapping;
    
    for (const [section, dataKey] of Object.entries(stepMapping)) {
        if (appState.drawingData[dataKey]) {
            completedCount++;
        }
    }
    
    appState.portraitProgress.completedStepsCount = completedCount;
}

function showUltimateCelebration() {
    // Function disabled - no celebration will be shown
    // Instead, just trigger the portrait download
    showCompletePortrait();
}

function showCompletionCelebration() {
    // Function disabled - no celebration will be shown
    // Instead, just trigger the portrait download
    showCompletePortrait();
}

function handleMaterialCheck(e) {
    const materialId = e.target.id;
    const card = e.target.closest('.material-card');
    
    if (e.target.checked) {
        appState.materialsChecked.add(materialId);
        card.classList.add('checked');
        
        // Add check animation
        card.style.transform = 'scale(1.05)';
        setTimeout(() => {
            card.style.transform = '';
        }, 200);
    } else {
        appState.materialsChecked.delete(materialId);
        card.classList.remove('checked');
    }
    
    updateMaterialsProgress();
}

function updateMaterialsProgress() {
    const totalRequired = 4; // Not counting optional
    const checkedCount = Array.from(appState.materialsChecked).filter(id => id !== 'optional').length;
    const progressPercentage = (checkedCount / totalRequired) * 100;
    
    const progressFill = document.getElementById('materials-progress');
    if (progressFill) {
      progressFill.style.width = `${progressPercentage}%`;
    }
    
    const checkedCountEl = document.getElementById('checked-count');
    if(checkedCountEl) {
        checkedCountEl.textContent = checkedCount;
    }
    
    const continueBtn = document.getElementById('materials-continue');
    if(continueBtn) {
        continueBtn.disabled = checkedCount < totalRequired;
    
        if (checkedCount === totalRequired) {
            continueBtn.style.animation = 'pulse 1s infinite';
            setTimeout(() => {
                continueBtn.style.animation = '';
            }, 3000);
        }
    }
}

function showProportionGuide(guide) {
    // Update active button
    document.querySelectorAll('.proportion-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-guide="${guide}"]`).classList.add('active');
    
    // Draw the specific guide
    drawProportionsGuide(guide);
}

function drawProportionsGuide(guide) {
    const canvas = proportionsCanvas;
    const ctx = proportionsCtx;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set drawing properties
    ctx.strokeStyle = '#4f46e5';
    ctx.lineWidth = 2;
    ctx.fillStyle = 'rgba(79, 70, 229, 0.1)';
    
    const centerX = canvas.width / 2;
    const headTop = 50;
    const headBottom = 550;
    const headHeight = headBottom - headTop;
    const headWidth = headHeight * 0.75;
    
    // Draw head outline
    ctx.beginPath();
    ctx.ellipse(centerX, headTop + headHeight/2, headWidth/2, headHeight/2, 0, 0, 2 * Math.PI);
    ctx.stroke();
    
    if (guide === 'all' || guide === 'symmetry') {
        // Vertical symmetry line
        ctx.beginPath();
        ctx.setLineDash([5, 5]);
        ctx.moveTo(centerX, headTop);
        ctx.lineTo(centerX, headBottom);
        ctx.stroke();
        
        // Horizontal center line (eyes)
        const eyeLine = headTop + headHeight / 2;
        ctx.beginPath();
        ctx.moveTo(centerX - headWidth/2, eyeLine);
        ctx.lineTo(centerX + headWidth/2, eyeLine);
        ctx.stroke();
        ctx.setLineDash([]);
    }
    
    if (guide === 'all' || guide === 'eyes') {
        // Eye positions
        const eyeLine = headTop + headHeight / 2;
        const eyeWidth = headWidth / 5;
        const eyeSpacing = eyeWidth;
        
        // Left eye
        ctx.fillRect(centerX - eyeSpacing/2 - eyeWidth, eyeLine - 10, eyeWidth, 20);
        // Right eye
        ctx.fillRect(centerX + eyeSpacing/2, eyeLine - 10, eyeWidth, 20);
        
        // Eye spacing markers
        ctx.strokeStyle = '#7c3aed';
        ctx.beginPath();
        ctx.moveTo(centerX - eyeSpacing/2, eyeLine - 20);
        ctx.lineTo(centerX + eyeSpacing/2, eyeLine - 20);
        ctx.stroke();
    }
    
    if (guide === 'all' || guide === 'nose') {
        // Nose line
        const noseLine = headTop + headHeight * 2/3;
        ctx.strokeStyle = '#059669';
        ctx.beginPath();
        ctx.setLineDash([3, 3]);
        ctx.moveTo(centerX - headWidth/2, noseLine);
        ctx.lineTo(centerX + headWidth/2, noseLine);
        ctx.stroke();
        ctx.setLineDash([]);
    }
    
    if (guide === 'all' || guide === 'mouth') {
        // Mouth line
        const mouthLine = headTop + headHeight * 5/6;
        ctx.strokeStyle = '#dc2626';
        ctx.beginPath();
        ctx.setLineDash([2, 2]);
        ctx.moveTo(centerX - headWidth/2, mouthLine);
        ctx.lineTo(centerX + headWidth/2, mouthLine);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Mouth width markers
        const mouthWidth = headWidth / 3;
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(centerX - mouthWidth/2, mouthLine - 5, mouthWidth, 10);
    }
    
    // Add third divisions
    if (guide === 'all') {
        ctx.strokeStyle = '#f59e0b';
        ctx.setLineDash([1, 4]);
        
        // Hairline
        const hairLine = headTop + headHeight / 6;
        ctx.beginPath();
        ctx.moveTo(centerX - headWidth/2, hairLine);
        ctx.lineTo(centerX + headWidth/2, hairLine);
        ctx.stroke();
        
        // Eyebrow line
        const eyebrowLine = headTop + headHeight / 3;
        ctx.beginPath();
        ctx.moveTo(centerX - headWidth/2, eyebrowLine);
        ctx.lineTo(centerX + headWidth/2, eyebrowLine);
        ctx.stroke();
        
        ctx.setLineDash([]);
    }
}

// ====================================================================
// ===== REFACTORED AND CORRECTED FUNCTION ============================
// ====================================================================
function toggleRuler() {
    const currentCanvas = getCurrentCanvas();
    if (!currentCanvas) return;
    
    // Toggle ruler visibility
    appState.rulerVisible = !appState.rulerVisible;
    
    if (appState.rulerVisible) {
        // Position ruler in the middle of the canvas
        appState.rulerPosition = { x: currentCanvas.width / 2 - 17.5, y: 0 }; // -17.5 to center the 35px wide ruler
        
        // Force immediate ruler display
        showRulerOverlay({ x: 0, y: 0 });
    } else {
        // To hide the ruler, we need to save the drawings first
        const currentCtx = getCurrentContext();
        if (currentCtx) {
            // Create a temporary canvas to save all drawings EXCEPT the ruler
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = currentCanvas.width;
            tempCanvas.height = currentCanvas.height;
            const tempCtx = tempCanvas.getContext('2d');
            
            // Get the current canvas content
            const imageData = currentCtx.getImageData(0, 0, currentCanvas.width, currentCanvas.height);
            
            // Put the image data on temp canvas
            tempCtx.putImageData(imageData, 0, 0);
            
            // Clear only the ruler area from the temp canvas
            const rulerWidth = 35;
            const rulerX = appState.rulerPosition.x;
            
            // We'll clear the ruler by drawing over it with the background
            // First, check what's behind the ruler
            const behindRuler = currentCtx.getImageData(rulerX - 5, 0, 1, currentCanvas.height);
            
            // Clear the entire canvas
            currentCtx.clearRect(0, 0, currentCanvas.width, currentCanvas.height);
            
            // Draw everything back except the ruler area
            currentCtx.drawImage(tempCanvas, 0, 0);
            
            // Fill the ruler area with transparent pixels
            currentCtx.clearRect(rulerX - 2, 0, rulerWidth + 4, currentCanvas.height);
        }
    }
}

function selectTool(tool) {
    // Special handling for ruler tool - it only toggles ruler visibility
    if (tool === 'ruler') {
        toggleRuler();
        
        // Keep the current tool active - don't switch to pencil
        // Update UI to reflect the current tool is still active
        document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll(`[data-tool="${appState.currentTool}"]`).forEach(btn => btn.classList.add('active'));
        return;
    }
    
    // Store previous tool for reference
    const previousTool = appState.currentTool;

    // 1. Update app state
    appState.currentTool = tool;

    // 2. Update UI elements (buttons, labels, etc.)
    document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll(`[data-tool="${tool}"]`).forEach(btn => btn.classList.add('active'));

    const toolNames = { 'pencil': 'Creion', 'eraser': 'Radieră', 'ruler': 'Riglă' };
    document.querySelectorAll('.current-tool-display').forEach(display => {
        display.textContent = toolNames[tool] || tool;
    });

    // Show/hide opacity setting based on tool
    document.querySelectorAll('.opacity-setting').forEach(setting => {
        setting.style.display = (tool === 'eraser') ? 'none' : 'flex';
    });
    
    document.querySelectorAll('.setting-group').forEach(group => {
        const label = group.querySelector('label');
        if (label && (label.textContent.includes('Grosime') || label.textContent.includes('Marime'))) {
            label.textContent = (tool === 'eraser') ? 'Mărime radieră:' : 'Grosime creion:';
        }
    });

    // 3. Reset all canvas cursors to ensure a clean state
    resetCanvasCursors();

    // 4. Set the appropriate cursor on the currently active user canvas
    const currentUserCanvas = getCurrentCanvas();
    if (currentUserCanvas) {
        if (tool === 'pencil') {
            currentUserCanvas.style.cursor = 'crosshair';
        } else if (tool === 'eraser') {
            createEraserCursor(currentUserCanvas);
        } else {
            currentUserCanvas.style.cursor = 'default';
        }
    }
    
    // Ruler is already drawn on canvas - no need to redraw it
}
// ====================================================================
// ====================================================================

function createEraserCursor(canvasEl) {
    if (!canvasEl) return;
    const size = Math.min(appState.brushSize * 2, 32); // Eraser is larger but cap at 32px for cursor
    const cursor = `url("data:image/svg+xml;charset=utf8,<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'><circle cx='${size/2}' cy='${size/2}' r='${(size-2)/2}' fill='none' stroke='%23ef4444' stroke-width='2' stroke-dasharray='4,2'/></svg>") ${size/2} ${size/2}, auto`;
    
    // Apply only to the canvas itself for precise boundary control
    canvasEl.style.cursor = cursor;
}

function resetCanvasCursors() {
    // Reset all canvas and canvas area cursors to default
    const allCanvases = [
        canvas, step2Canvas, step3Canvas, step4Canvas, step5Canvas, step6Canvas, step7Canvas, step8Canvas, proportionsCanvas,
        ...Object.values(appState.userCanvases)
    ];
    
    allCanvases.forEach(canvasEl => {
        if (canvasEl) {
            canvasEl.style.cursor = 'default';
            // Also reset parent container (.canvas-area)
            if (canvasEl.parentElement && (canvasEl.parentElement.classList.contains('canvas-area') || canvasEl.parentElement.classList.contains('proportions-visual'))) {
                canvasEl.parentElement.style.cursor = 'default';
            }
        }
    });
}


// Universal step functions for flowless experience
function showCurrentStepDemo() {
    const currentStep = appState.currentSection;
    
    // Update all demo buttons to show loading state
    document.querySelectorAll('.demo-btn').forEach(btn => {
        btn.classList.add('active');
        btn.innerHTML = '<i class="fas fa-pause"></i><span>Animație în curs...</span>';
    });
    
    // Call appropriate demo function based on current step
    switch(currentStep) {
        case 'step1':
            showDrawingDemo();
            break;
        case 'step2':
            showFacialDemo();
            break;
        case 'step3':
            showEyeDemo();
            break;
        case 'step4':
            showNoseDemo();
            break;
        case 'step5':
            showMouthDemo();
            break;
        case 'step6':
            showEarDemo();
            break;
        case 'step7':
            showHairDemo();
            break;
        case 'step8':
            showFinishingDemo();
            break;
        default:
            // Generic demo
            setTimeout(() => {
                document.querySelectorAll('.demo-btn').forEach(btn => {
                    btn.classList.remove('active');
                    btn.innerHTML = '<i class="fas fa-play"></i><span>Animație</span>';
                });
            }, 2000);
    }
}

function toggleCurrentStepGuidelines() {
    const currentStep = appState.currentSection;
    const guideButtons = document.querySelectorAll('.guide-btn');
    
    // Toggle all guide buttons
    guideButtons.forEach(btn => {
        btn.classList.toggle('active');
    });
    
    // Show/hide guidelines based on current step
    switch(currentStep) {
        case 'step1':
            toggleGuidelines();
            break;
        case 'step2':
            showAllFacialLines();
            break;
        case 'step3':
            showEyeGrid();
            break;
        case 'step4':
            showNoseGrid();
            break;
        case 'step5':
            showMouthGrid();
            break;
        case 'step6':
            showEarGrid();
            break;
        case 'step7':
            showHairGrid();
            break;
        case 'step8':
            showSymmetryGrid();
            break;
    }
}

function clearCurrentStepOnly() {
    const currentUserCanvas = getCurrentCanvas();
    const currentUserCtx = getCurrentContext();
    
    if (!currentUserCanvas || !currentUserCtx) return;
    
    // Clear only the user drawing layer (animations stay on the background layer)
    currentUserCtx.clearRect(0, 0, currentUserCanvas.width, currentUserCanvas.height);
    
    // Clear the current step's saved user data
    const currentStep = appState.currentSection;
    const stepDataName = ProgressiveDrawing.getStepDrawingName(currentStep);
    appState.drawingData[stepDataName] = null;
    
    // Show feedback
    ProgressiveDrawing.showStepGuidance(currentUserCanvas, '🗑️ Desenul tău șters! Animația și pașii anteriori păstrați.');
    
    // Add clear animation
    currentUserCanvas.style.opacity = '0.5';
    setTimeout(() => {
        currentUserCanvas.style.opacity = '1';
    }, 300);
}

function startDrawing(e) {
    // Don't allow drawing during animation
    if (appState.isAnimationRunning) {
        return;
    }
    
    // Get current canvas and context based on active section
    const currentCanvas = getCurrentCanvas();
    const currentCtx = getCurrentContext();
    
    if (!currentCanvas || !currentCtx) return;
    
    // Get coordinates relative to the animation canvas
    const coords = getCanvasCoordinates(e, currentCanvas);
    if (!coords || !coords.isValid) {
        return; // Don't start drawing if outside canvas boundaries
    }
    
    // Check if clicking on ruler to drag it
    if (appState.rulerVisible && isClickingOnRuler(coords.x, coords.y)) {
        appState.rulerDragging = true;
        return;
    }
    
    // Apply snapping to ruler edges
    const snappedCoords = snapToRuler(coords.x, coords.y);
    
    appState.isDrawing = true;
    
    currentCtx.beginPath();
    currentCtx.moveTo(snappedCoords.x, snappedCoords.y);
    
    appState.drawingPath = [{x: snappedCoords.x, y: snappedCoords.y}];
    
    // Configure tool settings
    if (appState.currentTool === 'eraser') {
        currentCtx.globalCompositeOperation = 'destination-out';
        currentCtx.lineWidth = appState.brushSize * 2; // Eraser is larger
        currentCtx.globalAlpha = 1.0; // Always use full opacity for eraser
    } else {
        currentCtx.globalCompositeOperation = 'source-over';
        currentCtx.lineWidth = appState.brushSize;
        currentCtx.globalAlpha = appState.opacity; // Use the opacity setting for pencil
        currentCtx.strokeStyle = '#2d3748';
    }
}

function isClickingOnRuler(x, y) {
    if (!appState.rulerVisible) return false;
    
    const rulerWidth = 35; // Updated to match enhanced ruler
    const rulerX = appState.rulerPosition.x;
    
    // Check if click is within ruler bounds
    return x >= rulerX && x <= rulerX + rulerWidth;
}

function snapToRuler(x, y) {
    if (!appState.rulerVisible) return { x, y };
    
    const rulerWidth = 35;
    const rulerX = appState.rulerPosition.x;
    const snapDistance = 15; // Distance to snap to ruler edge
    
    // Check if close to left edge of ruler
    if (Math.abs(x - rulerX) <= snapDistance) {
        return { x: rulerX, y };
    }
    
    // Check if close to right edge of ruler
    if (Math.abs(x - (rulerX + rulerWidth)) <= snapDistance) {
        return { x: rulerX + rulerWidth, y };
    }
    
    return { x, y };
}

function getCurrentCanvas() {
    // Return user canvas for drawing
    return appState.userCanvases[appState.currentSection] || null;
}

function getCurrentContext() {
    // Return user context for drawing
    return appState.userContexts[appState.currentSection] || null;
}

function getAnimationCanvas() {
    // Return main canvas for animations
    const canvasMap = {
        'materials': null,
        'proportions': null,
        'step1': canvas,
        'step2': step2Canvas,
        'step3': step3Canvas,
        'step4': step4Canvas,
        'step5': step5Canvas,
        'step6': step6Canvas,
        'step7': step7Canvas,
        'step8': step8Canvas
    };
    return canvasMap[appState.currentSection];
}

function getAnimationContext() {
    // Return main context for animations
    const ctxMap = {
        'materials': null,
        'proportions': null,
        'step1': ctx,
        'step2': step2Ctx,
        'step3': step3Ctx,
        'step4': step4Ctx,
        'step5': step5Ctx,
        'step6': step6Ctx,
        'step7': step7Ctx,
        'step8': step8Ctx
    };
    return ctxMap[appState.currentSection];
}

function draw(e) {
    // Get coordinates first for both drawing and ruler dragging
    const currentCanvas = getCurrentCanvas();
    const coords = getCanvasCoordinates(e, currentCanvas);
    
    // Handle ruler dragging
    if (appState.rulerDragging && coords && coords.isValid) {
        const rulerWidth = 35; // Updated to match enhanced ruler
        // Keep ruler within canvas bounds
        const newX = Math.max(0, Math.min(coords.x - rulerWidth/2, currentCanvas.width - rulerWidth));
        appState.rulerPosition.x = newX;
        
        // Redraw ruler at new position
        showRulerOverlay(coords);
        return;
    }
    
    if (!appState.isDrawing) return;
    
    // Get current context
    const currentCtx = getCurrentContext();
    
    if (!currentCanvas || !currentCtx) return;
    
    if (!coords || !coords.isValid) {
        // If we move outside the canvas, stop the current drawing stroke
        stopDrawing();
        return;
    }
    
    // Apply snapping to ruler edges while drawing
    const snappedCoords = snapToRuler(coords.x, coords.y);
    
    // Enhanced drawing with pressure sensitivity for Apple Pencil
    if (appState.currentTouch && appState.currentTouch.isPencil) {
        // Use pressure-sensitive line width for Apple Pencil
        const baseBrushSize = appState.currentTool === 'eraser' ? appState.brushSize * 2 : appState.brushSize;
        const pressureBrushSize = baseBrushSize * (0.5 + appState.currentTouch.pressure * 0.5);
        currentCtx.lineWidth = pressureBrushSize;
        
        // Adjust opacity based on pressure for more natural drawing
        if (appState.currentTool !== 'eraser') {
            const pressureOpacity = appState.opacity * (0.3 + appState.currentTouch.pressure * 0.7);
            currentCtx.globalAlpha = pressureOpacity;
        }
    }
    
    currentCtx.lineTo(snappedCoords.x, snappedCoords.y);
    currentCtx.stroke();
    
    appState.drawingPath.push({
        x: snappedCoords.x, 
        y: snappedCoords.y,
        pressure: appState.currentTouch ? appState.currentTouch.pressure : 1.0
    });
}

function stopDrawing(cancelRuler = false) {
    // Handle ruler visibility cancellation
    if (cancelRuler && appState.rulerVisible) {
        appState.rulerVisible = false;
        
        // Refresh the canvas to remove any ruler overlay
        const currentCanvas = getCurrentCanvas();
        const currentCtx = getCurrentContext();
        
        if (currentCanvas && currentCtx) {
            // Redraw the canvas without the ruler overlay
            currentCtx.clearRect(0, 0, currentCanvas.width, currentCanvas.height);
        }
        
        return;
    }
    
    // Stop ruler dragging
    if (appState.rulerDragging) {
        appState.rulerDragging = false;
        
        // Don't redraw ruler here - it's already on the canvas
        return;
    }
    
    if (appState.isDrawing) {
        appState.isDrawing = false;
        
        // Get current context and reset to safe defaults
        const currentCtx = getCurrentContext();
        if (currentCtx) {
            currentCtx.beginPath();
            // Always reset to safe drawing mode after any drawing operation
            currentCtx.globalCompositeOperation = 'source-over';
            currentCtx.globalAlpha = appState.opacity; // Use the opacity setting
            currentCtx.lineWidth = appState.brushSize;
            currentCtx.strokeStyle = '#2d3748';
            currentCtx.setLineDash([]); // Reset any dashed lines
        }
        
        // Don't redraw ruler here - it's already on the canvas
        
        // Save drawing state for undo functionality
        // This would be expanded in a full implementation
    }
}

// Utility function to check if coordinates are within canvas boundaries
function isWithinCanvasBounds(x, y, canvas) {
    if (!canvas) return false;
    return x >= 0 && x <= canvas.width && y >= 0 && y <= canvas.height;
}

// Enhanced function to get canvas-relative coordinates
function getCanvasCoordinates(event, canvas) {
    if (!canvas) return null;
    
    // Get the animation canvas for this step to align coordinates properly
    const animationCanvas = getAnimationCanvas();
    if (!animationCanvas) return null;
    
    const rect = animationCanvas.getBoundingClientRect();
    const scaleX = animationCanvas.width / rect.width;
    const scaleY = animationCanvas.height / rect.height;
    
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    
    return { x, y, isValid: isWithinCanvasBounds(x, y, animationCanvas) };
}

function handleTouch(e) {
    e.preventDefault();
    
    // Apple Pencil and stylus support
    const touch = e.touches[0] || e.changedTouches[0];
    const targetCanvas = getCurrentCanvas();
    if(!targetCanvas) return;
    
    // Enhanced touch detection for Apple Pencil
    const isPencil = touch.touchType === 'stylus' || 
                     (touch.force !== undefined && touch.force > 0) ||
                     (touch.radiusX !== undefined && touch.radiusX < 5);
    
    // Palm rejection: ignore touches that are too large (likely palm)
    const isPalm = !isPencil && 
                   touch.radiusX > 20 && 
                   touch.radiusY > 20 && 
                   e.touches.length > 1;
    
    if (isPalm) {
        return; // Ignore palm touches
    }
    
    // Check if touch is within canvas boundaries before processing
    const coords = getCanvasCoordinates(touch, targetCanvas);
    if (!coords || !coords.isValid) {
        // If outside boundaries, stop any current drawing
        if (appState.isDrawing) {
            stopDrawing();
        }
        return;
    }
    
    // Enhanced touch properties for Apple Pencil
    let pressure = 1.0;
    let tiltX = 0;
    let tiltY = 0;
    
    if (touch.force !== undefined) {
        pressure = Math.max(0.1, Math.min(1.0, touch.force * 2)); // Normalize pressure
    }
    
    if (touch.altitudeAngle !== undefined) {
        // Convert altitude angle to tilt (Apple Pencil specific)
        const altitude = touch.altitudeAngle;
        tiltX = touch.azimuthAngle ? Math.sin(touch.azimuthAngle) * Math.cos(altitude) : 0;
        tiltY = touch.azimuthAngle ? Math.cos(touch.azimuthAngle) * Math.cos(altitude) : 0;
    }
    
    // Store enhanced touch data for drawing
    appState.currentTouch = {
        isPencil: isPencil,
        pressure: pressure,
        tiltX: tiltX,
        tiltY: tiltY,
        x: coords.x,
        y: coords.y
    };
    
    // Create enhanced mouse event with touch properties
    const mouseEvent = new MouseEvent(e.type === 'touchstart' ? 'mousedown' : 
                                     e.type === 'touchmove' ? 'mousemove' : 'mouseup', {
        clientX: touch.clientX,
        clientY: touch.clientY,
        pressure: pressure,
        tiltX: tiltX,
        tiltY: tiltY
    });
    
    // Add custom properties for our enhanced drawing
    mouseEvent.isPencil = isPencil;
    mouseEvent.touchPressure = pressure;
    
    targetCanvas.dispatchEvent(mouseEvent);
}

// Enhanced Pointer Events handler for Apple Pencil
function handlePointer(e) {
    e.preventDefault();
    
    const targetCanvas = getCurrentCanvas();
    if (!targetCanvas) return;
    
    // Enhanced pointer detection
    const isPencil = e.pointerType === 'pen';
    const isTouch = e.pointerType === 'touch';
    const isMouse = e.pointerType === 'mouse';
    
    // Palm rejection for touch events
    if (isTouch && e.width > 20 && e.height > 20) {
        return; // Likely palm, ignore
    }
    
    // Get coordinates
    const coords = getCanvasCoordinates(e, targetCanvas);
    if (!coords || !coords.isValid) {
        if (appState.isDrawing) {
            stopDrawing();
        }
        return;
    }
    
    // Enhanced pointer properties
    let pressure = e.pressure || 1.0;
    let tiltX = e.tiltX || 0;
    let tiltY = e.tiltY || 0;
    
    // Store enhanced pointer data
    appState.currentTouch = {
        isPencil: isPencil,
        pressure: pressure,
        tiltX: tiltX,
        tiltY: tiltY,
        x: coords.x,
        y: coords.y,
        pointerType: e.pointerType
    };
    
    // Create mouse event for compatibility
    const mouseEvent = new MouseEvent(
        e.type === 'pointerdown' ? 'mousedown' : 
        e.type === 'pointermove' ? 'mousemove' : 'mouseup', 
        {
            clientX: e.clientX,
            clientY: e.clientY,
            pressure: pressure,
            tiltX: tiltX,
            tiltY: tiltY
        }
    );
    
    mouseEvent.isPencil = isPencil;
    mouseEvent.touchPressure = pressure;
    
    targetCanvas.dispatchEvent(mouseEvent);
}

// Canvas cursor management functions
function handleCanvasMouseEnter(e) {
    const canvas = e.target;
    updateCanvasCursor(canvas);
}

function handleCanvasMouseLeave(e) {
    const canvas = e.target;
    // Reset cursor to default when leaving canvas
    canvas.style.cursor = 'default';
    
    // Also stop drawing if user moves mouse outside canvas
    if (appState.isDrawing) {
        stopDrawing();
    }
}

function handleCanvasMouseMove(e) {
    const canvas = e.target;
    const coords = getCanvasCoordinates(e, canvas);
    
    if (!coords || !coords.isValid) {
        // Outside canvas bounds - use default cursor
        canvas.style.cursor = 'default';
        if (appState.isDrawing) {
            stopDrawing();
        }
    } else {
        // Check if hovering over ruler
        if (appState.rulerVisible && isClickingOnRuler(coords.x, coords.y)) {
            canvas.style.cursor = 'move';
        } else {
            // Inside canvas bounds - use tool cursor
            updateCanvasCursor(canvas);
        }
        
        // If ruler is visible and being dragged, update its position
        if (appState.rulerVisible && appState.rulerDragging) {
            showRulerOverlay(coords);
        }
    }
}

function showRulerOverlay(coords) {
    // Get current canvas and context
    const currentCanvas = getCurrentCanvas();
    const currentCtx = getCurrentContext();
    
    if (!currentCanvas || !currentCtx) return;
    
    // Simply draw the ruler on top of existing content
    // Don't clear anything - just add the ruler
    drawEnhancedRuler(currentCtx, appState.rulerPosition.x, currentCanvas.height);
}

function drawEnhancedRuler(ctx, xPosition, canvasHeight) {
    // Save context state
    ctx.save();
    
    // Enhanced ruler appearance
    const rulerWidth = 35;
    const rulerColor = '#f8fafc'; // Light background
    const rulerBorderColor = '#334155'; // Dark border
    const tickColor = '#475569';
    const textColor = '#1e293b';
    const shadowColor = 'rgba(0, 0, 0, 0.25)';
    const highlightColor = '#ffffff';
    
    // Draw shadow for depth
    ctx.fillStyle = shadowColor;
    ctx.fillRect(xPosition + 3, 3, rulerWidth, canvasHeight);
    
    // Draw main ruler body with gradient effect
    const gradient = ctx.createLinearGradient(xPosition, 0, xPosition + rulerWidth, 0);
    gradient.addColorStop(0, highlightColor);
    gradient.addColorStop(0.5, rulerColor);
    gradient.addColorStop(1, '#e2e8f0');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(xPosition, 0, rulerWidth, canvasHeight);
    
    // Draw border with rounded corners effect
    ctx.strokeStyle = rulerBorderColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(xPosition, 0, rulerWidth, canvasHeight);
    
    // Draw inner highlight line
    ctx.strokeStyle = highlightColor;
    ctx.lineWidth = 1;
    ctx.strokeRect(xPosition + 1, 1, rulerWidth - 2, canvasHeight - 2);
    
    // Draw tick marks and measurements
    const tickSpacing = 10; // Every 10 pixels
    const majorTickInterval = 5; // Every 50 pixels is a major tick
    const numTicks = Math.floor(canvasHeight / tickSpacing);
    
    for (let i = 0; i <= numTicks; i++) {
        const isMajorTick = i % majorTickInterval === 0;
        const tickLength = isMajorTick ? rulerWidth * 0.7 : rulerWidth * 0.3;
        const yPosition = i * tickSpacing;
        
        // Draw tick mark with better styling
        ctx.beginPath();
        ctx.moveTo(xPosition + 2, yPosition);
        ctx.lineTo(xPosition + 2 + tickLength, yPosition);
        ctx.strokeStyle = isMajorTick ? rulerBorderColor : tickColor;
        ctx.lineWidth = isMajorTick ? 2 : 1;
        ctx.stroke();
        
        // Add measurement numbers for major ticks
        if (isMajorTick && i > 0) {
            const measurement = i * tickSpacing;
            ctx.font = 'bold 9px Arial';
            ctx.fillStyle = textColor;
            ctx.textAlign = 'left';
            ctx.fillText(measurement.toString(), xPosition + tickLength + 4, yPosition + 3);
        }
    }
    
    // Add professional ruler branding
    ctx.save();
    ctx.translate(xPosition + rulerWidth/2, 25);
    ctx.rotate(-Math.PI/2);
    ctx.font = 'bold 11px Arial';
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.fillText('RULER', 0, 0);
    ctx.restore();
    
    // Add grip texture at top and bottom
    for (let i = 0; i < 3; i++) {
        const y1 = 8 + i * 4;
        const y2 = canvasHeight - 20 + i * 4;
        
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;
        
        // Top grip
        ctx.beginPath();
        ctx.moveTo(xPosition + 5, y1);
        ctx.lineTo(xPosition + rulerWidth - 5, y1);
        ctx.stroke();
        
        // Bottom grip
        ctx.beginPath();
        ctx.moveTo(xPosition + 5, y2);
        ctx.lineTo(xPosition + rulerWidth - 5, y2);
        ctx.stroke();
    }
    
    // Restore context state
    ctx.restore();
}

function updateCanvasCursor(canvas) {
    if (!canvas) return;
    
    switch (appState.currentTool) {
        case 'pencil':
        case 'ruler':
            canvas.style.cursor = 'crosshair';
            break;
        case 'eraser':
            createEraserCursor(canvas);
            break;
        default:
            canvas.style.cursor = 'default';
    }
}


function showDrawingDemo() {
    console.log('Starting drawing demo...');
    appState.isAnimationRunning = true;
    
    // Update all demo buttons to show loading state
    document.querySelectorAll('.demo-btn').forEach(btn => {
        btn.classList.add('active');
        btn.innerHTML = '<i class="fas fa-pause"></i><span>Animație în curs...</span>';
    });
    
    // Show disappear button and hide demo button
    document.querySelectorAll('.demo-btn').forEach(btn => {
        btn.style.display = 'none';
        console.log('Hiding demo button');
    });
    document.querySelectorAll('.disappear-btn').forEach(btn => {
        btn.style.display = 'flex';
        console.log('Showing disappear button');
    });
    
    // Demo animation sequence - don't clear the canvas, draw over it
    setTimeout(() => {
        animateStep1Demo();
    }, 500);
    
    setTimeout(() => {
        appState.isAnimationRunning = false;
        console.log('Animation finished, keeping visible');
        
        // Make sure disappear button is still visible
        document.querySelectorAll('.disappear-btn').forEach(btn => {
            btn.style.display = 'flex';
            btn.innerHTML = '<i class="fas fa-eye-slash"></i><span>Ascunde Animația</span>';
        });
    }, 8000);
}

// Hide current step animation
function hideCurrentStepAnimation() {
    const animationCanvas = getAnimationCanvas();
    const animationCtx = getAnimationContext();
    
    if (!animationCanvas || !animationCtx) return;
    
    // Clear the animation canvas completely
    animationCtx.clearRect(0, 0, animationCanvas.width, animationCanvas.height);
    
    // Reload all previous steps onto the animation canvas
    const currentStep = appState.currentSection;
    const stepDataName = ProgressiveDrawing.getStepDrawingName(currentStep);
    
    // Define the full order of drawing steps
    const stepOrder = ['headOutline', 'guidelines', 'eyes', 'eyebrows', 'nose', 'mouth', 'ears', 'hair', 'shading', 'highlights'];
    const currentIndex = stepOrder.indexOf(stepDataName);
    
    if (currentIndex > 0) {
        // Load all steps *before* the current one.
        const upToStep = stepOrder[currentIndex - 1];
        ProgressiveDrawing.loadPreviousSteps(animationCtx, animationCanvas, upToStep);
    }
    
    // Show demo button and hide disappear button
    document.querySelectorAll('.demo-btn').forEach(btn => {
        btn.style.display = 'flex';
        btn.classList.remove('active');
        btn.innerHTML = '<i class="fas fa-play"></i><span>Animație</span>';
    });
    document.querySelectorAll('.disappear-btn').forEach(btn => btn.style.display = 'none');
    
    appState.isAnimationRunning = false;
}


function animateStep1Demo() {
    const animationCanvas = getAnimationCanvas();
    const animationCtx = getAnimationContext();
    
    console.log('Animate Step1 Demo:', {
        canvas: animationCanvas,
        ctx: animationCtx,
        currentSection: appState.currentSection
    });
    
    if (!animationCanvas || !animationCtx) {
        console.error('Canvas or context not found!');
        return;
    }
    
    const centerX = animationCanvas.width / 2;
    const centerY = animationCanvas.height / 2;
    
    animationCtx.strokeStyle = '#4f46e5';
    animationCtx.lineWidth = 2;
    animationCtx.globalAlpha = 0.7;
    
    // Step 1: Draw symmetry axes
    setTimeout(() => {
        drawAnimatedLine(animationCtx, centerX, 50, centerX, animationCanvas.height - 50, 1000);
    }, 500);
    
    setTimeout(() => {
        drawAnimatedLine(animationCtx, 100, centerY, animationCanvas.width - 100, centerY, 1000);
    }, 1500);
    
    // Step 2: Draw head outline
    setTimeout(() => {
        drawAnimatedOval(animationCtx, centerX, centerY, 150, 200, 2000);
    }, 3000);
    
    // Step 3: Draw neck
    setTimeout(() => {
        drawAnimatedLine(animationCtx, centerX - 40, centerY + 200, centerX - 40, centerY + 280, 800);
        drawAnimatedLine(animationCtx, centerX + 40, centerY + 200, centerX + 40, centerY + 280, 800);
    }, 5500);
    
    // Step 4: Draw shoulders
    setTimeout(() => {
        drawAnimatedLine(animationCtx, centerX - 120, centerY + 280, centerX + 120, centerY + 280, 1000);
    }, 6500);
}

function drawAnimatedLine(context, x1, y1, x2, y2, duration) {
    const steps = 60;
    const stepDuration = duration / steps;
    let currentStep = 0;
    
    const animate = () => {
        if (currentStep <= steps) {
            const progress = currentStep / steps;
            const currentX = x1 + (x2 - x1) * progress;
            const currentY = y1 + (y2 - y1) * progress;
            
            if (currentStep === 0) {
                context.beginPath();
                context.moveTo(x1, y1);
            } else {
                context.lineTo(currentX, currentY);
                context.stroke();
            }
            
            currentStep++;
            setTimeout(animate, stepDuration);
        }
    };
    
    animate();
}

function drawAnimatedOval(context, centerX, centerY, radiusX, radiusY, duration) {
    const steps = 120;
    const stepDuration = duration / steps;
    let currentStep = 0;
    
    context.beginPath();
    
    const animate = () => {
        if (currentStep <= steps) {
            const angle = (currentStep / steps) * 2 * Math.PI;
            const x = centerX + radiusX * Math.cos(angle);
            const y = centerY + radiusY * Math.sin(angle);
            
            if (currentStep === 0) {
                context.moveTo(x, y);
            } else {
                context.lineTo(x, y);
                context.stroke();
            }
            
            currentStep++;
            setTimeout(animate, stepDuration);
        }
    };
    
    animate();
}

// Debounce function to prevent multiple rapid calls
let guidelinesToggleTimeout = null;

function toggleGuidelines() {
    // Prevent rapid multiple calls
    if (guidelinesToggleTimeout) {
        clearTimeout(guidelinesToggleTimeout);
    }
    
    guidelinesToggleTimeout = setTimeout(() => {
        console.log('Toggling guidelines...');
        appState.showGuidelines = !appState.showGuidelines;
        
        // Update all guide buttons in all toolboxes
        const guideButtons = document.querySelectorAll('.guide-btn');
        console.log(`Found ${guideButtons.length} guide buttons`);
        
        guideButtons.forEach((btn, index) => {
            if (appState.showGuidelines) {
                btn.classList.add('active');
                if (index === 0) console.log('Guide buttons activated');
            } else {
                btn.classList.remove('active');
                if (index === 0) console.log('Guide buttons deactivated');
            }
        });
        
        // Get current step
        const currentStep = getCurrentStep();
        console.log(`Current step: ${currentStep}`);
        
        // Create or find guidelines container for current step
        const currentSection = document.getElementById(currentStep);
        if (!currentSection) {
            console.error(`Section for ${currentStep} not found!`);
            return;
        }
        
        // Find canvas overlay in current section
        const canvasOverlay = currentSection.querySelector('.canvas-overlay');
        if (!canvasOverlay) {
            console.error(`Canvas overlay for ${currentStep} not found!`);
            return;
        }
        
        // Create guidelines div if it doesn't exist
        let guidelines = canvasOverlay.querySelector('.guidelines');
        if (!guidelines) {
            guidelines = document.createElement('div');
            guidelines.className = 'guidelines';
            guidelines.id = `guidelines-${currentStep}`;
            canvasOverlay.appendChild(guidelines);
            console.log(`Created guidelines div for ${currentStep}`);
        }
        
        if (appState.showGuidelines) {
            console.log(`Showing guidelines for ${currentStep}...`);
            guidelines.style.display = 'block';
            guidelines.style.opacity = '1';
            guidelines.style.zIndex = '50';
            guidelines.style.pointerEvents = 'none';
            
            // Create grid directly
            guidelines.innerHTML = '';
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', '100%');
            svg.setAttribute('height', '100%');
            svg.style.position = 'absolute';
            svg.style.top = '0';
            svg.style.left = '0';
            
            // Create pattern
            const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            const pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
            pattern.setAttribute('id', `guideline-grid-${currentStep}`);
            // Set base unit for A4 proportions (1:√2)
            const baseUnit = 30;
            const heightUnit = Math.floor(baseUnit * Math.sqrt(2));
            pattern.setAttribute('width', baseUnit.toString());
            pattern.setAttribute('height', heightUnit.toString());
            pattern.setAttribute('patternUnits', 'userSpaceOnUse');

            // Horizontal line
            const hLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            hLine.setAttribute('x1', '0');
            hLine.setAttribute('y1', '0');
            hLine.setAttribute('x2', baseUnit.toString());
            hLine.setAttribute('y2', '0');
            hLine.setAttribute('stroke', '#4f46e5');
            hLine.setAttribute('stroke-width', '1');
            hLine.setAttribute('opacity', '0.3');

            // Vertical line
            const vLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            vLine.setAttribute('x1', '0');
            vLine.setAttribute('y1', '0');
            vLine.setAttribute('x2', '0');
            vLine.setAttribute('y2', heightUnit.toString());
            vLine.setAttribute('stroke', '#4f46e5');
            vLine.setAttribute('stroke-width', '1');
            vLine.setAttribute('opacity', '0.3');
            
            pattern.appendChild(hLine);
            pattern.appendChild(vLine);
            defs.appendChild(pattern);
            svg.appendChild(defs);
            
            // Create rect with pattern fill
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('width', '100%');
            rect.setAttribute('height', '100%');
            rect.setAttribute('fill', `url(#guideline-grid-${currentStep})`);
            
            svg.appendChild(rect);
            guidelines.appendChild(svg);
            console.log(`Grid created and added to ${currentStep}`);
        } else {
            console.log(`Hiding guidelines for ${currentStep}...`);
            guidelines.style.opacity = '0';
            guidelines.style.display = 'none';
            guidelines.innerHTML = '';
        }
        
        guidelinesToggleTimeout = null;
    }, 100); // 100ms debounce
}

// showGuidelines and hideGuidelines functions are now integrated into toggleGuidelines


function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Add clear animation
    canvas.style.opacity = '0.5';
    setTimeout(() => {
        canvas.style.opacity = '1';
    }, 200);
}

function highlightCurrentStep() {
    document.querySelectorAll('.instruction').forEach(instruction => {
        instruction.classList.remove('active');
    });
    
    const currentInstruction = document.querySelector(`#step1 .instruction[data-step="${appState.currentStep}"]`);
    if (currentInstruction) {
        currentInstruction.classList.add('active');
        currentInstruction.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}




// Utility functions for smooth animations
function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}

function lerp(start, end, t) {
    return start + (end - start) * t;
}

// Initialize tooltips and help system
function initializeTooltips() {
    // This would be expanded to add helpful tooltips throughout the interface
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    // Implementation would go here
}

// Auto-save functionality
function autoSave() {
    const canvasData = canvas.toDataURL();
    localStorage.setItem('portrait-drawing-progress', JSON.stringify({
        canvasData: canvasData,
        currentStep: appState.currentStep,
        materialsChecked: Array.from(appState.materialsChecked),
        timestamp: Date.now()
    }));
}

// Load saved progress
function loadProgress() {
    const saved = localStorage.getItem('portrait-drawing-progress');
    if (saved) {
        const data = JSON.parse(saved);
        // Restore canvas and state
        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, 0, 0);
        };
        img.src = data.canvasData;
        
        appState.currentStep = data.currentStep;
        appState.materialsChecked = new Set(data.materialsChecked);
        
        // Update UI to reflect loaded state
        updateMaterialsProgress();
        highlightCurrentStep();
    }
}

// Performance optimization: Debounce drawing operations
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimized drawing with requestAnimationFrame
const optimizedDraw = debounce(draw, 16); // ~60fps

// Step 2 Functions - Facial Guidelines
function initializeStep2() {
    if (!step2Canvas) return;
    
    // This function will now be called by the progressive system, 
    // which has already drawn the head outline. We just need to manage the UI.
    
    // Highlight first guideline
    const firstGuidelineItem = document.querySelector('#step2 .guideline-item');
    if (firstGuidelineItem) {
        document.querySelectorAll('#step2 .guideline-item').forEach(item => item.classList.remove('active'));
        firstGuidelineItem.classList.add('active');
    }
}

function drawHeadOutline(ctx, canvas) {
    if (!ctx || !canvas) return;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const headWidth = 120;
    const headHeight = 160;
    
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.5;
    
    // Draw head oval
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, headWidth, headHeight, 0, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Draw symmetry lines
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - headHeight);
    ctx.lineTo(centerX, centerY + headHeight);
    ctx.stroke();
    ctx.setLineDash([]);
    
    ctx.globalAlpha = 1;
}

function showFacialLine(lineType) {
    if (!step2Ctx || !step2Canvas) return;

    // Clear previous dynamic drawings from animation context
    step2Ctx.clearRect(0, 0, step2Canvas.width, step2Canvas.height);
    
    // Reload previous work (the head outline)
    ProgressiveDrawing.loadPreviousSteps(step2Ctx, step2Canvas, 'headOutline');

    // Draw the new line on top
    setTimeout(() => { // Use timeout to ensure head is drawn first
        drawSpecificFacialLine(lineType);

        // Update active guideline UI
        document.querySelectorAll('#step2 .guideline-item').forEach(item => {
            item.classList.remove('active');
            item.querySelector('.show-line-btn').classList.remove('active');
        });
        const activeItem = document.querySelector(`#step2 [data-line="${lineType}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
            activeItem.querySelector('.show-line-btn').classList.add('active');
        }
    }, 50); 
}


function drawSpecificFacialLine(lineType) {
    if (!step2Ctx || !step2Canvas) return;

    const centerX = step2Canvas.width / 2;
    const centerY = step2Canvas.height / 2;
    const headWidth = 150; 
    const headHeight = 200; 

    const lines = {
        'eyes': { color: '#4f46e5', y: centerY, label: 'Linia Ochilor' },
        'nose': { color: '#059669', y: centerY + (headHeight / 3), label: 'Linia Nasului' },
        'mouth': { color: '#dc2626', y: centerY + (headHeight / 1.8), label: 'Linia Gurii' },
        'eyebrows': { color: '#f59e0b', y: centerY - (headHeight / 5), label: 'Linia Sprâncenelor' }
    };

    const line = lines[lineType];
    if (!line) return;

    step2Ctx.save();
    step2Ctx.strokeStyle = line.color;
    step2Ctx.lineWidth = 3;
    step2Ctx.globalAlpha = 0.8;
    if(lineType === 'eyebrows') step2Ctx.setLineDash([3, 3]);

    step2Ctx.beginPath();
    step2Ctx.moveTo(centerX - headWidth, line.y);
    step2Ctx.lineTo(centerX + headWidth, line.y);
    step2Ctx.stroke();
    
    step2Ctx.fillStyle = line.color;
    step2Ctx.font = 'bold 14px Inter';
    step2Ctx.textAlign = 'left';
    step2Ctx.fillText(line.label, centerX + headWidth + 10, line.y + 5);

    step2Ctx.restore();
}

function showAllFacialLines() {
    if (!step2Ctx || !step2Canvas) return;
    
    // Clear previous lines
    step2Ctx.clearRect(0, 0, step2Canvas.width, step2Canvas.height);
    ProgressiveDrawing.loadPreviousSteps(step2Ctx, step2Canvas, 'headOutline');

    // Draw all lines with animation
    const allLines = ['eyes', 'nose', 'mouth', 'eyebrows'];
    setTimeout(() => { // Delay to ensure canvas is ready
        allLines.forEach((line, index) => {
            setTimeout(() => {
                drawSpecificFacialLine(line);
            }, index * 400);
        });
    }, 100);
}

function showFacialDemo() {
    appState.isAnimationRunning = true;
    document.querySelectorAll('#step2 .demo-btn').forEach(btn => {
        btn.classList.add('active');
        btn.innerHTML = '<i class="fas fa-pause"></i> Demonstrație...';
        btn.style.display = 'none';
    });
     document.querySelectorAll('#step2 .disappear-btn').forEach(btn => btn.style.display = 'flex');

    showAllFacialLines();

    setTimeout(() => {
        appState.isAnimationRunning = false;
        // Don't hide, let the user click the hide button
    }, 2000);
}


function clearStep2Canvas() {
    if (!step2Canvas || !step2Ctx) return;

    step2Ctx.clearRect(0, 0, step2Canvas.width, step2Canvas.height);
    // Reload the foundational head drawing
    ProgressiveDrawing.loadPreviousSteps(step2Ctx, step2Canvas, 'headOutline');

    // Reset active states in the UI
    document.querySelectorAll('#step2 .guideline-item').forEach(item => item.classList.remove('active'));
    document.querySelectorAll('#step2 .show-line-btn').forEach(btn => btn.classList.remove('active'));
    
    // Reactivate the first guideline UI
    const firstGuideline = document.querySelector('#step2 [data-line="eyes"]');
    if (firstGuideline) {
        firstGuideline.classList.add('active');
    }
}


// Step 3 Functions - Eye Drawing
function initializeStep3() {
    if (!step3Canvas) return;
    
    // UI setup is handled by progressive loader now
    // Just ensure the first step is highlighted
    const firstStep = document.querySelector('#step3 .eye-step');
    if(firstStep) {
        document.querySelectorAll('#step3 .eye-step').forEach(step => step.classList.remove('active'));
        firstStep.classList.add('active');
    }
}

function drawHeadWithGuidelines(ctx, canvas) {
    if(!ctx || !canvas) return;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const headWidth = 150;
    const headHeight = 200;
    
    ctx.save();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;
    
    // Head outline (already drawn by progressive load, but good for isolated calls)
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, headWidth, headHeight, 0, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Facial guidelines
    ctx.setLineDash([3, 3]);
    const eyeLineY = centerY;
    ctx.beginPath();
    ctx.moveTo(centerX - headWidth, eyeLineY);
    ctx.lineTo(centerX + headWidth, eyeLineY);
    ctx.stroke();
    
    ctx.restore();
}

function highlightEyeStep(stepName) {
    // Update active step UI
    document.querySelectorAll('#step3 .eye-step').forEach(step => step.classList.remove('active'));
    const activeStep = document.querySelector(`#step3 [data-step="${stepName}"]`);
    if (activeStep) activeStep.classList.add('active');
    
    // Show corresponding eye drawing stage on animation canvas
    drawEyeStep(stepName);
}

function drawEyeStep(stepName) {
    if (!step3Ctx || !step3Canvas) return;

    // Clear only animations, keep user's drawing
    step3Ctx.clearRect(0, 0, step3Canvas.width, step3Canvas.height);
    // Reload previous work up to the facial guidelines
    ProgressiveDrawing.loadPreviousSteps(step3Ctx, step3Canvas, 'guidelines');
    
    setTimeout(() => { // Ensure background is drawn
        const centerX = step3Canvas.width / 2;
        const centerY = step3Canvas.height / 2; // This is the eye line
        const faceWidth = 300;
        const eyeWidth = faceWidth / 5;
        const eyeHeight = 20;
        
        step3Ctx.save();
        step3Ctx.strokeStyle = '#4f46e5';
        step3Ctx.fillStyle = 'rgba(79, 70, 229, 0.2)';
        step3Ctx.lineWidth = 2;
        
        switch(stepName) {
            case 'positioning':
                const spacing = eyeWidth;
                step3Ctx.fillRect(centerX - spacing/2 - eyeWidth - 2, centerY - 2, 4, 4);
                step3Ctx.fillRect(centerX + spacing/2 + eyeWidth- 2, centerY - 2, 4, 4);
                break;
                
            case 'spacing':
                step3Ctx.strokeStyle = '#059669';
                step3Ctx.setLineDash([1, 3]);
                for (let i = -2; i <= 2; i++) {
                    const x = centerX + i * eyeWidth;
                    step3Ctx.beginPath();
                    step3Ctx.moveTo(x, centerY - 30);
                    step3Ctx.lineTo(x, centerY + 30);
                    step3Ctx.stroke();
                }
                step3Ctx.fillRect(centerX - eyeWidth, centerY - eyeHeight, eyeWidth, eyeHeight * 2);
                step3Ctx.fillRect(centerX + eyeWidth, centerY - eyeHeight, eyeWidth, eyeHeight * 2);
                break;
                
            case 'shape':
                // Use the same coordinates and dimensions as the details step
                const leftEyeX = centerX - eyeWidth * 1.5;
                const rightEyeX = centerX + eyeWidth * 1.5;
                const eyeHeightForBoth = 25;
                
                drawEyeShape(step3Ctx, leftEyeX, centerY, eyeWidth, eyeHeightForBoth);
                drawEyeShape(step3Ctx, rightEyeX, centerY, eyeWidth, eyeHeightForBoth);
                break;
                
            case 'details':
                // Use the same coordinates as shape step
                const leftEyeXDetails = centerX - eyeWidth * 1.5;
                const rightEyeXDetails = centerX + eyeWidth * 1.5;
                const eyeHeightDetails = 25;
                
                drawCompleteEye(step3Ctx, leftEyeXDetails, centerY, eyeWidth, eyeHeightDetails);
                drawCompleteEye(step3Ctx, rightEyeXDetails, centerY, eyeWidth, eyeHeightDetails);
                drawEyebrow(step3Ctx, leftEyeXDetails, centerY - 30, eyeWidth + 10);
                drawEyebrow(step3Ctx, rightEyeXDetails, centerY - 30, eyeWidth + 10);
                break;
        }
        step3Ctx.restore();
    }, 50);
}


function drawEyeShape(ctx, centerX, centerY, width, height) {
    ctx.strokeStyle = '#4f46e5';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX - width / 2, centerY);
    ctx.quadraticCurveTo(centerX, centerY - height, centerX + width / 2, centerY);
    ctx.quadraticCurveTo(centerX, centerY + height * 0.8, centerX - width / 2, centerY);
    ctx.closePath();
    ctx.stroke();
}

function drawCompleteEye(ctx, centerX, centerY, width, height) {
    // Eye outline
    ctx.strokeStyle = '#1e293b';
    ctx.fillStyle = 'white';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(centerX - width / 2, centerY);
    ctx.quadraticCurveTo(centerX, centerY - height, centerX + width / 2, centerY);
    ctx.quadraticCurveTo(centerX, centerY + height * 0.8, centerX - width / 2, centerY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Iris
    const irisRadius = (height / 2) * 0.9;
    ctx.strokeStyle = '#4f46e5';
    ctx.fillStyle = 'rgba(79, 70, 229, 0.3)';
    ctx.beginPath();
    ctx.arc(centerX, centerY, irisRadius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    
    // Pupil
    const pupilRadius = irisRadius * 0.5;
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(centerX, centerY, pupilRadius, 0, 2 * Math.PI);
    ctx.fill();
    
    // Light reflection
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(centerX - pupilRadius/2, centerY - pupilRadius/2, pupilRadius/2, 0, 2 * Math.PI);
    ctx.fill();
}


function drawEyebrow(ctx, centerX, centerY, width) {
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(centerX - width/2, centerY + 5);
    ctx.quadraticCurveTo(centerX, centerY - 10, centerX + width/2, centerY);
    ctx.stroke();
}


function showEyeDemo() {
    appState.isAnimationRunning = true;
    document.querySelectorAll('#step3 .demo-btn').forEach(btn => {
        btn.classList.add('active');
        btn.innerHTML = '<i class="fas fa-pause"></i> Demonstrație...';
        btn.style.display = 'none';
    });
    document.querySelectorAll('#step3 .disappear-btn').forEach(btn => btn.style.display = 'flex');

    const steps = ['positioning', 'spacing', 'shape', 'details'];
    let currentStep = 0;
    
    const nextStep = () => {
        if (currentStep < steps.length) {
            highlightEyeStep(steps[currentStep]);
            currentStep++;
            setTimeout(nextStep, 1500);
        } else {
            appState.isAnimationRunning = false;
        }
    };
    
    nextStep();
}


function showEyeGrid() {
    const btn = document.querySelector('#step3 .guide-btn');
    appState.showGuidelines = !appState.showGuidelines;

    if (appState.showGuidelines) {
        btn.classList.add('active');
        const animationCtx = getAnimationContext();
        const animationCanvas = getAnimationCanvas();
        if(!animationCtx || !animationCanvas) return;
        
        const centerX = animationCanvas.width / 2;
        const centerY = animationCanvas.height / 2;
        const faceWidth = 300;
        const partWidth = faceWidth / 5;
        
        animationCtx.save();
        animationCtx.strokeStyle = 'rgba(255, 100, 100, 0.7)';
        animationCtx.setLineDash([2, 4]);
        animationCtx.lineWidth = 1;

        for (let i = -2; i <= 2; i++) {
            const x = centerX + i * partWidth;
            animationCtx.beginPath();
            animationCtx.moveTo(x, centerY - 80);
            animationCtx.lineTo(x, centerY + 80);
            animationCtx.stroke();
        }
        animationCtx.restore();

    } else {
        btn.classList.remove('active');
        // The clear and reload will handle removing the grid
        hideCurrentStepAnimation();
    }
}





function highlightEyePart(partName) {
    const canvas = getAnimationCanvas();
    if(canvas) {
        ProgressiveDrawing.showStepGuidance(canvas, `Anatomie: ${partName}`);
    }
}

function clearStep3Canvas() {
    clearCurrentStepOnly();
    // Also clear the animation layer and redraw the base
    hideCurrentStepAnimation();
}


// Canvas boundary testing function
function testCanvasBoundaries() {
    console.log('🧪 Testing canvas boundary detection...');
    
    const testCanvas = document.createElement('canvas');
    testCanvas.width = 600;
    testCanvas.height = 800;
    
    // Test various coordinates
    const testCases = [
        { x: 300, y: 400, expected: true, desc: 'Center of canvas' },
        { x: 0, y: 0, expected: true, desc: 'Top-left corner' },
        { x: 600, y: 800, expected: true, desc: 'Bottom-right corner' },
        { x: -10, y: 400, expected: false, desc: 'Outside left boundary' },
        { x: 610, y: 400, expected: false, desc: 'Outside right boundary' },
        { x: 300, y: -10, expected: false, desc: 'Outside top boundary' },
        { x: 300, y: 810, expected: false, desc: 'Outside bottom boundary' }
    ];
    
    let passed = 0;
    testCases.forEach(test => {
        const result = isWithinCanvasBounds(test.x, test.y, testCanvas);
        if (result === test.expected) {
            console.log(`✅ ${test.desc}: PASS`);
            passed++;
        } else {
            console.log(`❌ ${test.desc}: FAIL (expected ${test.expected}, got ${result})`);
        }
    });
    
    console.log(`🏁 Boundary tests: ${passed}/${testCases.length} passed`);
    return passed === testCases.length;
}

// Test coordinate alignment between animation and user canvases
function testCoordinateAlignment() {
    console.log('🧪 Testing coordinate alignment...');
    
    // Wait for DOM to be ready
    setTimeout(() => {
        const currentAnimationCanvas = getAnimationCanvas();
        const currentUserCanvas = getCurrentCanvas();
        
        if (currentAnimationCanvas && currentUserCanvas) {
            const animRect = currentAnimationCanvas.getBoundingClientRect();
            const userRect = currentUserCanvas.getBoundingClientRect();
            
            console.log('Animation canvas position:', {
                left: animRect.left,
                top: animRect.top,
                width: animRect.width,
                height: animRect.height
            });
            
            console.log('User canvas position:', {
                left: userRect.left,
                top: userRect.top,
                width: userRect.width,
                height: userRect.height
            });
            
            // Check if canvases are aligned
            const aligned = Math.abs(animRect.left - userRect.left) < 2 && 
                           Math.abs(animRect.top - userRect.top) < 2 &&
                           Math.abs(animRect.width - userRect.width) < 2 &&
                           Math.abs(animRect.height - userRect.height) < 2;
            
            if (aligned) {
                console.log('✅ Canvas coordinates aligned correctly');
            } else {
                console.log('❌ Canvas coordinates misaligned');
            }
            
            return aligned;
        } else {
            console.log('⚠️ Could not find canvases for alignment test');
            return false;
        }
    }, 1000);
}

// Update TODO progress
document.addEventListener('DOMContentLoaded', function() {
    // Mark setup as complete
    console.log('✅ Project structure created with HTML, CSS, and JavaScript files');
    
    // Test canvas boundaries
    if (testCanvasBoundaries()) {
        console.log('✅ Canvas boundary detection working correctly');
    } else {
        console.log('❌ Canvas boundary detection has issues');
    }
    
    // Test coordinate alignment
    testCoordinateAlignment();
});