// Smooth scrolling pentru link-urile din meniu și navigarea laterală
document.addEventListener('DOMContentLoaded', function() {
    // Optimizări pentru performanță și responsivitate
    let isScrolling = false;
    let scrollTimeout;
    
    // Funcție pentru debounce scroll events
    function debounceScroll(func, wait) {
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(scrollTimeout);
                func(...args);
            };
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(later, wait);
        };
    }
    
    // Detectează tipul de dispozitiv
    const isMobile = window.innerWidth <= 768;
    const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
    const isDesktop = window.innerWidth > 1024;
    
    // Ajustează animațiile în funcție de dispozitiv
    function adjustAnimationsForDevice() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion || isMobile) {
            // Reduce animațiile pe mobile pentru performanță
            document.documentElement.style.setProperty('--animation-duration', '0.3s');
        } else {
            document.documentElement.style.setProperty('--animation-duration', '0.6s');
        }
    }
    
    // Aplică ajustările la încărcare și la redimensionare
    adjustAnimationsForDevice();
    window.addEventListener('resize', debounceScroll(adjustAnimationsForDevice, 250));
    // Smooth scrolling pentru link-urile din meniu
    const menuLinks = document.querySelectorAll('.menu-card, .menu-icon-item');
    menuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Funcționalitatea barei de navigare laterală
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Setează imediat link-ul ca activ
            navLinksArray.forEach(navLink => {
                navLink.classList.remove('active');
            });
            this.classList.add('active');
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Actualizează link-ul activ în bara de navigare în funcție de secțiunea vizibilă
    const sections = document.querySelectorAll('section[id]');
    const navLinksArray = Array.from(navLinks);
    
    function updateActiveNavLink() {
        if (isScrolling) return;
        
        const scrollPosition = window.scrollY + (isMobile ? 50 : 100);
        const windowHeight = window.innerHeight;
        let activeSection = null;
        let maxVisibility = 0;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionBottom = sectionTop + sectionHeight;
            
            // Calculează cât de vizibilă este secțiunea
            const visibleTop = Math.max(scrollPosition, sectionTop);
            const visibleBottom = Math.min(scrollPosition + windowHeight, sectionBottom);
            const visibleHeight = Math.max(0, visibleBottom - visibleTop);
            const visibility = visibleHeight / Math.min(sectionHeight, windowHeight);
            
            // Găsește secțiunea cu cea mai mare vizibilitate
            if (visibility > maxVisibility) {
                maxVisibility = visibility;
                activeSection = section;
            }
        });
        
        // Actualizează link-ul activ
        if (activeSection) {
            const activeSectionId = activeSection.getAttribute('id');
            navLinksArray.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${activeSectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    }
    
    // Adaugă event listener pentru scroll cu debounce
    window.addEventListener('scroll', debounceScroll(() => {
        isScrolling = true;
        // Actualizează imediat pentru feedback vizual
        updateActiveNavLink();
        // Resetează flag-ul după un scurt delay
        setTimeout(() => {
            isScrolling = false;
            // Actualizează din nou după ce scroll-ul s-a oprit
            updateActiveNavLink();
        }, 150);
    }, 16)); // ~60fps
    
    // Inițializează link-ul activ
    updateActiveNavLink();
    
    // Asigură-te că link-ul activ este setat corect la încărcarea paginii
    window.addEventListener('load', () => {
        setTimeout(() => {
            updateActiveNavLink();
        }, 100);
    });
    
    // Optimizări pentru loading și caching
    if ('serviceWorker' in navigator && isMobile) {
        // Cache pentru resurse statice pe mobile
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('/sw.js').catch(function(err) {
                console.log('ServiceWorker registration failed: ', err);
            });
        });
    }
    
    // Preload pentru performanță
    if (isDesktop) {
        const preloadLinks = [
            { rel: 'preload', href: 'styles.css', as: 'style' },
            { rel: 'preload', href: 'script.js', as: 'script' }
        ];
        
        preloadLinks.forEach(link => {
            const linkElement = document.createElement('link');
            Object.assign(linkElement, link);
            document.head.appendChild(linkElement);
        });
    }
    
    // Lazy loading pentru imagini și resurse grele
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    // Animații îmbunătățite pentru secțiuni când devin vizibile
    const observerOptions = {
        threshold: isMobile ? 0.05 : 0.1,
        rootMargin: isMobile ? '0px 0px -50px 0px' : '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Animație cu întârziere pentru fiecare element
                const delay = isMobile ? index * 50 : index * 100;
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    
                    // Aplică animația corespunzătoare în funcție de tipul elementului
                    if (entry.target.classList.contains('content-section')) {
                        entry.target.style.animation = `sectionSlideIn ${isMobile ? '0.4s' : '0.8s'} ease-out`;
                    } else if (entry.target.classList.contains('trait-item')) {
                        entry.target.style.animation = `elementSlideIn ${isMobile ? '0.3s' : '0.6s'} ease-out`;
                    } else if (entry.target.classList.contains('hair-type') || 
                               entry.target.classList.contains('eye-type') || 
                               entry.target.classList.contains('face-type') || 
                               entry.target.classList.contains('freckles-type')) {
                        entry.target.style.animation = `elementScaleIn ${isMobile ? '0.25s' : '0.5s'} ease-out`;
                    }
                }, delay);
            }
        });
    }, observerOptions);

    // Observă toate secțiunile de conținut și elementele din ele
    const contentSections = document.querySelectorAll('.content-section');
    const traitItems = document.querySelectorAll('.trait-item');
    const visualElements = document.querySelectorAll('.hair-type, .eye-type, .face-type, .freckles-type');
    
    // Optimizări pentru touch events pe mobile
    if (isMobile) {
        // Adaugă touch feedback pentru elementele interactive
        const touchElements = document.querySelectorAll('.menu-card, .menu-icon-item, .nav-link, .generate-button, .trait-item');
        
        touchElements.forEach(element => {
            element.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.95)';
            });
            
            element.addEventListener('touchend', function() {
                this.style.transform = 'scale(1)';
            });
            
            element.addEventListener('touchcancel', function() {
                this.style.transform = 'scale(1)';
            });
        });
        
        // Optimizează scroll pentru mobile
        let touchStartY = 0;
        let touchEndY = 0;
        
        document.addEventListener('touchstart', function(e) {
            touchStartY = e.touches[0].clientY;
        }, { passive: true });
        
        document.addEventListener('touchend', function(e) {
            touchEndY = e.changedTouches[0].clientY;
            const diff = touchStartY - touchEndY;
            
            // Detectează swipe gestures pentru navigare rapidă
            if (Math.abs(diff) > 50) {
                const currentSection = getCurrentVisibleSection();
                if (diff > 0 && currentSection < sections.length - 1) {
                    // Swipe up - merge la următoarea secțiune
                    sections[currentSection + 1].scrollIntoView({ behavior: 'smooth' });
                } else if (diff < 0 && currentSection > 0) {
                    // Swipe down - merge la secțiunea anterioară
                    sections[currentSection - 1].scrollIntoView({ behavior: 'smooth' });
                }
            }
        }, { passive: true });
    }
    
    // Funcție helper pentru a găsi secțiunea curentă vizibilă
    function getCurrentVisibleSection() {
        const scrollPosition = window.scrollY + 100;
        for (let i = 0; i < sections.length; i++) {
            const sectionTop = sections[i].offsetTop;
            const sectionHeight = sections[i].offsetHeight;
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                return i;
            }
        }
        return 0;
    }
    
    // Animații pentru secțiuni
    contentSections.forEach((section, index) => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(50px)';
        section.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
        observer.observe(section);
    });
    
    // Animații pentru elementele din secțiuni
    traitItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-30px)';
        item.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(item);
    });
    
    visualElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'scale(0.8)';
        element.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
        observer.observe(element);
    });
    
    // Animații pentru iconițele din meniul principal
    const menuIconItems = document.querySelectorAll('.menu-icon-item');
    menuIconItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px) scale(0.8)';
        item.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(item);
    });

    // Funcționalitatea simulatorului genetic
    const generateBtn = document.getElementById('generate-btn');
    if (generateBtn) {
        // Optimizează pentru touch events pe mobile
        if (isMobile) {
            generateBtn.addEventListener('touchstart', function(e) {
                e.preventDefault();
                this.style.transform = 'scale(0.95)';
            });
            
            generateBtn.addEventListener('touchend', function(e) {
                e.preventDefault();
                this.style.transform = 'scale(1)';
                generateCharacter();
            });
        } else {
            generateBtn.addEventListener('click', generateCharacter);
        }
    }

    // Inițializează personajul la încărcarea paginii
    generateCharacter();

    // Funcționalitatea simulatorului părinți
    const predictChildBtn = document.getElementById('predict-child-btn');
    if (predictChildBtn) {
        // Optimizează pentru touch events pe mobile
        if (isMobile) {
            predictChildBtn.addEventListener('touchstart', function(e) {
                e.preventDefault();
                this.style.transform = 'scale(0.95)';
            });
            
            predictChildBtn.addEventListener('touchend', function(e) {
                e.preventDefault();
                this.style.transform = 'scale(1)';
                predictChild();
            });
        } else {
            predictChildBtn.addEventListener('click', predictChild);
        }
    }

    // Inițializează personajele părinților la încărcarea paginii
    updateParentCharacters();
});

// Funcția principală pentru generarea personajului
function generateCharacter() {
    const hairType = document.getElementById('sim-hair').value;
    const eyeColor = document.getElementById('sim-eyes').value;
    const faceShape = document.getElementById('sim-face').value;
    const freckles = document.getElementById('sim-freckles').value;
    
    const character = document.getElementById('character');
    const geneticDetails = document.getElementById('genetic-details');
    
    // Animație de loading
    character.style.opacity = '0.5';
    character.style.transform = 'scale(0.9)';
    
    setTimeout(() => {
        updateCharacterAppearance(character, hairType, eyeColor, faceShape, freckles);
        const geneticInfo = generateGeneticInfo(hairType, eyeColor, faceShape, freckles);
        geneticDetails.innerHTML = geneticInfo;
        
        // Animație de apariție
        character.style.opacity = '1';
        character.style.transform = 'scale(1)';
        character.style.animation = 'characterAppear 0.5s ease-out';
        
        setTimeout(() => {
            character.style.animation = '';
        }, 500);
    }, 300);
}

// Actualizează aspectul personajului
function updateCharacterAppearance(character, hairType, eyeColor, faceShape, freckles) {
    const characterFace = character.querySelector('.character-face');
    const characterHair = character.querySelector('.character-hair');
    const characterEyes = character.querySelector('.character-eyes');
    const characterFreckles = character.querySelector('.character-freckles');
    
    // Actualizează forma feței
    characterFace.className = 'character-face';
    characterFace.classList.add(faceShape + '-face');
    
    // Actualizează părul
    characterHair.className = 'character-hair';
    characterHair.classList.add(hairType + '-hair');
    
    // Actualizează ochii
    characterEyes.className = 'character-eyes';
    characterEyes.classList.add(eyeColor + '-eyes');
    
    // Adaugă pupila pentru al doilea ochi dacă nu există
    let rightPupil = characterEyes.querySelector('.pupil-right');
    if (!rightPupil) {
        rightPupil = document.createElement('div');
        rightPupil.className = 'pupil-right';
        rightPupil.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: #333;
            z-index: 11;
        `;
        characterEyes.appendChild(rightPupil);
    }
    
    // Actualizează pistruii
    characterFreckles.className = 'character-freckles';
    characterFreckles.classList.add(freckles + '-freckles');
    
    // Aplică stiluri CSS dinamice
    applyCharacterStyles(character, hairType, eyeColor, faceShape, freckles);
}

// Aplică stiluri CSS dinamice pentru personaj
function applyCharacterStyles(character, hairType, eyeColor, faceShape, freckles) {
    const characterFace = character.querySelector('.character-face');
    const characterHair = character.querySelector('.character-hair');
    const characterEyes = character.querySelector('.character-eyes');
    const characterFreckles = character.querySelector('.character-freckles');
    const rightPupil = characterEyes.querySelector('.pupil-right');
    
    // Curăță stilurile inline pentru a permite CSS-ul să funcționeze
    characterFace.style = '';
    characterHair.style = '';
    characterEyes.style = '';
    characterFreckles.style = '';
    
    // Aplică culorile ochilor pentru ambele ochi
    const eyeColors = {
        blue: {
            primary: '#87CEEB',
            secondary: '#4682B4',
            tertiary: '#1E90FF'
        },
        green: {
            primary: '#90EE90',
            secondary: '#228B22',
            tertiary: '#006400'
        },
        brown: {
            primary: '#D2691E',
            secondary: '#8B4513',
            tertiary: '#654321'
        }
    };
    
    if (eyeColors[eyeColor] && rightPupil) {
        const colors = eyeColors[eyeColor];
        rightPupil.style.background = `radial-gradient(circle, ${colors.primary} 0%, ${colors.secondary} 70%, ${colors.tertiary} 100%)`;
        rightPupil.style.boxShadow = `0 0 5px rgba(${eyeColor === 'blue' ? '135, 206, 235' : eyeColor === 'green' ? '144, 238, 144' : '210, 105, 30'}, 0.5)`;
    }
    
    // Aplică culorile părului
    const hairColors = {
        straight: '#8B4513',
        wavy: '#A0522D',
        curly: '#CD853F'
    };
    
    if (hairColors[hairType]) {
        characterHair.style.setProperty('--hair-color', hairColors[hairType]);
    }
    
    // Adaugă animații specifice
    if (hairType === 'wavy') {
        characterHair.style.animation = 'hairWave 3s ease-in-out infinite';
    } else if (hairType === 'curly') {
        characterHair.style.animation = 'hairCurl 3s ease-in-out infinite';
    }
    
    if (freckles === 'light') {
        characterFreckles.style.animation = 'freckleFade 3s ease-in-out infinite';
    } else if (freckles === 'heavy') {
        characterFreckles.style.animation = 'frecklePulse 2s ease-in-out infinite';
    }
}

// Generează informațiile genetice
function generateGeneticInfo(hairType, eyeColor, faceShape, freckles) {
    const geneticData = {
        hair: {
            straight: {
                dominance: 'Recesiv',
                genes: 'TCHH, TCHHL1, WNT10A (homozigot recesiv)',
                description: 'Părul drept este o trăsătură recesivă controlată de multiple gene. Pentru a avea păr drept, trebuie să moștenești genele recesive de la ambii părinți.',
                probability: '30% în populația europeană, 15% în populația asiatică'
            },
            wavy: {
                dominance: 'Intermediar',
                genes: 'TCHH, TCHHL1 (heterozigot)',
                description: 'Părul ondulat este o trăsătură intermediară, rezultată din combinația între genele pentru păr drept și cele pentru păr creț. Este influențat de genele EDAR și FGFR2.',
                probability: '45% în populația europeană, 25% în populația asiatică'
            },
            curly: {
                dominance: 'Dominant',
                genes: 'TCHH, TCHHL1, EDAR, FGFR2 (dominant)',
                description: 'Părul creț este o trăsătură dominantă controlată de multiple gene. O singură copie a genei dominante este suficientă pentru a avea păr creț.',
                probability: '25% în populația europeană, 60% în populația africană'
            }
        },
        eyes: {
            blue: {
                dominance: 'Recesiv',
                genes: 'OCA2, HERC2 (homozigot recesiv)',
                description: 'Ochii albaștri sunt o trăsătură recesivă controlată de genele OCA2 și HERC2. Pentru ochi albaștri, trebuie să moștenești genele recesive de la ambii părinți.',
                probability: '8% în populația mondială, 27% în Europa de Nord'
            },
            green: {
                dominance: 'Intermediar',
                genes: 'OCA2, HERC2, SLC24A4 (heterozigot)',
                description: 'Ochii verzi sunt o trăsătură intermediară, rezultată din combinația între genele pentru ochi albaștri și căprui. Este influențat de cel puțin 16 gene diferite.',
                probability: '2% în populația mondială, 9% în Europa'
            },
            brown: {
                dominance: 'Dominant',
                genes: 'OCA2, HERC2, SLC24A4, TYR (dominant)',
                description: 'Ochii căprui sunt o trăsătură dominantă controlată de multiple gene. O singură copie a genei dominante este suficientă pentru ochi căprui.',
                probability: '90% în populația mondială, 64% în Europa'
            }
        },
        face: {
            oval: {
                dominance: 'Complex (Poligenic)',
                genes: 'BMP4, FGFR2, PAX3, MSX1, ALX4 (200+ gene)',
                description: 'Forma ovală a feței este influențată de sute de gene care controlează dezvoltarea craniofacială. Este considerată cea mai comună și "ideală" din punct de vedere estetic.',
                probability: '40% în populația mondială, 45% în Europa'
            },
            round: {
                dominance: 'Complex (Poligenic)',
                genes: 'BMP4, FGFR2, PAX3, MSX1 (200+ gene)',
                description: 'Fața rotundă este caracterizată prin linii moi și unghiuri rotunjite, cu lungimea și lățimea aproape egale. Este influențată de genele craniofaciale.',
                probability: '30% în populația mondială, 25% în Europa'
            },
            square: {
                dominance: 'Complex (Poligenic)',
                genes: 'BMP4, FGFR2, PAX3, ALX4 (200+ gene)',
                description: 'Fața pătrată are un maxilar pronunțat și unghiuri clare, dând un aspect puternic și decisiv. Este influențată de genele de dezvoltare craniofacială.',
                probability: '30% în populația mondială, 30% în Europa'
            }
        },
        freckles: {
            none: {
                dominance: 'Recesiv',
                genes: 'MC1R, IRF4 (homozigot recesiv)',
                description: 'Majoritatea oamenilor nu au pistrui genetici. Pistruii pot apărea din cauza expunerii la soare (ephelides) sau pot fi genetici (lentigines).',
                probability: '70% în populația mondială, 60% în Europa'
            },
            light: {
                dominance: 'Intermediar',
                genes: 'MC1R, IRF4 (heterozigot)',
                description: 'Pistrui discreți care pot fi mai vizibili în anotimpurile calde sau după expunerea la soare. Sunt influențați de genele MC1R și IRF4.',
                probability: '20% în populația mondială, 25% în Europa'
            },
            heavy: {
                dominance: 'Dominant',
                genes: 'MC1R, IRF4, ASIP (dominant)',
                description: 'Pistrui vizibili tot timpul, moșteniți genetic și distribuiți pe față, brațe și umeri. Sunt controlați de genele MC1R și IRF4.',
                probability: '10% în populația mondială, 15% în Europa'
            }
        }
    };
    
    const hairInfo = geneticData.hair[hairType];
    const eyeInfo = geneticData.eyes[eyeColor];
    const faceInfo = geneticData.face[faceShape];
    const frecklesInfo = geneticData.freckles[freckles];
    
    // Traducerea valorilor în română
    const hairTypeRomanian = {
        straight: 'Drept',
        wavy: 'Ondulat',
        curly: 'Creț'
    };
    
    const eyeColorRomanian = {
        blue: 'Albaștri',
        green: 'Verzi',
        brown: 'Căprui'
    };
    
    const faceShapeRomanian = {
        oval: 'Ovală',
        round: 'Rotundă',
        square: 'Pătrată'
    };
    
    const frecklesRomanian = {
        none: 'Fără Pistrui',
        light: 'Ușori',
        heavy: 'Pronunțați'
    };
    
    return `
        <h4>Informații Genetice Detaliate</h4>
        <div class="genetic-grid">
            <div class="genetic-item">
                <h5>🧬 Părul (${hairTypeRomanian[hairType]})</h5>
                <p><strong>Dominanță:</strong> ${hairInfo.dominance}</p>
                <p><strong>Gene:</strong> ${hairInfo.genes}</p>
                <p><strong>Probabilitate:</strong> ${hairInfo.probability}</p>
                <p>${hairInfo.description}</p>
            </div>
            <div class="genetic-item">
                <h5>👁️ Ochii (${eyeColorRomanian[eyeColor]})</h5>
                <p><strong>Dominanță:</strong> ${eyeInfo.dominance}</p>
                <p><strong>Gene:</strong> ${eyeInfo.genes}</p>
                <p><strong>Probabilitate:</strong> ${eyeInfo.probability}</p>
                <p>${eyeInfo.description}</p>
            </div>
            <div class="genetic-item">
                <h5>👤 Fața (${faceShapeRomanian[faceShape]})</h5>
                <p><strong>Dominanță:</strong> ${faceInfo.dominance}</p>
                <p><strong>Gene:</strong> ${faceInfo.genes}</p>
                <p><strong>Probabilitate:</strong> ${faceInfo.probability}</p>
                <p>${faceInfo.description}</p>
            </div>
            <div class="genetic-item">
                <h5>✨ Pistruii (${frecklesRomanian[freckles]})</h5>
                <p><strong>Dominanță:</strong> ${frecklesInfo.dominance}</p>
                <p><strong>Gene:</strong> ${frecklesInfo.genes}</p>
                <p><strong>Probabilitate:</strong> ${frecklesInfo.probability}</p>
                <p>${frecklesInfo.description}</p>
            </div>
        </div>
    `;
}

// Adaugă stiluri CSS pentru animații suplimentare
const additionalStyles = `
    @keyframes characterAppear {
        0% {
            opacity: 0;
            transform: scale(0.8) rotate(-5deg);
        }
        50% {
            opacity: 0.7;
            transform: scale(1.05) rotate(2deg);
        }
        100% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
        }
    }
    
    .genetic-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
        margin-top: 1rem;
    }
    
    .genetic-item {
        background: var(--gradient-card);
        padding: 1.5rem;
        border-radius: var(--border-radius);
        box-shadow: var(--shadow);
        border-left: 4px solid var(--secondary-color);
        transition: var(--transition);
        border: 1px solid rgba(139, 115, 85, 0.1);
    }
    
    .genetic-item:hover {
        transform: translateY(-5px);
        box-shadow: var(--shadow-hover);
    }
    
    .genetic-item h5 {
        color: var(--primary-color);
        margin-bottom: 1rem;
        font-weight: 600;
        font-size: 1.1rem;
    }
    
    .genetic-item p {
        margin-bottom: 0.5rem;
        color: var(--text-secondary);
        font-size: 0.9rem;
        line-height: 1.5;
    }
    
    .genetic-item strong {
        color: var(--primary-color);
        font-weight: 600;
    }
    
    /* Animații pentru elementele vizuale */
    .hair-visual,
    .eye-visual,
    .face-visual,
    .freckles-visual {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .hair-type:hover .hair-visual,
    .eye-type:hover .eye-visual,
    .face-type:hover .face-visual,
    .freckles-type:hover .freckles-visual {
        transform: scale(1.1);
    }
    
    /* Animație pentru meniul principal */
    .menu-card {
        animation: fadeInUp 0.6s ease-out;
    }
    
    .menu-card:nth-child(1) { animation-delay: 0.1s; }
    .menu-card:nth-child(2) { animation-delay: 0.2s; }
    .menu-card:nth-child(3) { animation-delay: 0.3s; }
    .menu-card:nth-child(4) { animation-delay: 0.4s; }
    .menu-card:nth-child(5) { animation-delay: 0.5s; }
    
    /* Efecte hover îmbunătățite */
    .trait-item {
        position: relative;
        overflow: hidden;
    }
    
    .trait-item::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(52, 152, 219, 0.1), transparent);
        transition: left 0.5s;
    }
    
    .trait-item:hover::before {
        left: 100%;
    }
    
    /* Animație pentru controalele simulatorului */
    .control-select {
        position: relative;
        overflow: hidden;
    }
    
    .control-select:focus {
        animation: selectFocus 0.3s ease-out;
    }
    
    @keyframes selectFocus {
        0% { transform: scale(1); }
        50% { transform: scale(1.02); }
        100% { transform: scale(1); }
    }
    
    /* Animație pentru butonul de generare */
    .generate-button {
        position: relative;
        overflow: hidden;
    }
    
    .generate-button::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
        transition: left 0.5s;
    }
    
    .generate-button:hover::before {
        left: 100%;
    }
    
    .generate-button:active {
        transform: translateY(0) scale(0.98);
    }
`;

// Adaugă stilurile la document
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Funcție îmbunătățită pentru animații la scroll
function animateOnScroll() {
    const menuCards = document.querySelectorAll('.menu-card');
    const geneticItems = document.querySelectorAll('.genetic-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    
                    if (entry.target.classList.contains('menu-card')) {
                        entry.target.style.animation = 'fadeInUp 0.6s ease-out';
                    } else if (entry.target.classList.contains('genetic-item')) {
                        entry.target.style.animation = 'elementSlideIn 0.5s ease-out';
                    }
                }, index * 150);
            }
        });
    }, { threshold: 0.1 });
    
    // Animații pentru meniul principal
    menuCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(card);
    });
    
    // Animații pentru elementele genetice
    geneticItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-20px)';
        item.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
        observer.observe(item);
    });
}

// Inițializează animațiile la scroll
document.addEventListener('DOMContentLoaded', animateOnScroll);

// Funcții pentru simulatorul părinți
function updateParentCharacters() {
    // Actualizează personajul părinte 1
    const parent1Hair = document.getElementById('parent1-hair').value;
    const parent1Eyes = document.getElementById('parent1-eyes').value;
    const parent1Face = document.getElementById('parent1-face').value;
    const parent1Freckles = document.getElementById('parent1-freckles').value;
    
    const parent1Character = document.getElementById('parent1-character').querySelector('.character');
    updateCharacterAppearance(parent1Character, parent1Hair, parent1Eyes, parent1Face, parent1Freckles);
    
    // Actualizează personajul părinte 2
    const parent2Hair = document.getElementById('parent2-hair').value;
    const parent2Eyes = document.getElementById('parent2-eyes').value;
    const parent2Face = document.getElementById('parent2-face').value;
    const parent2Freckles = document.getElementById('parent2-freckles').value;
    
    const parent2Character = document.getElementById('parent2-character').querySelector('.character');
    updateCharacterAppearance(parent2Character, parent2Hair, parent2Eyes, parent2Face, parent2Freckles);
}

function predictChild() {
    // Obține trăsăturile părinților
    const parent1Hair = document.getElementById('parent1-hair').value;
    const parent1Eyes = document.getElementById('parent1-eyes').value;
    const parent1Face = document.getElementById('parent1-face').value;
    const parent1Freckles = document.getElementById('parent1-freckles').value;
    
    const parent2Hair = document.getElementById('parent2-hair').value;
    const parent2Eyes = document.getElementById('parent2-eyes').value;
    const parent2Face = document.getElementById('parent2-face').value;
    const parent2Freckles = document.getElementById('parent2-freckles').value;
    
    // Simulează moștenirea genetică
    const childHair = simulateInheritance(parent1Hair, parent2Hair, 'hair');
    const childEyes = simulateInheritance(parent1Eyes, parent2Eyes, 'eyes');
    const childFace = simulateInheritance(parent1Face, parent2Face, 'face');
    const childFreckles = simulateInheritance(parent1Freckles, parent2Freckles, 'freckles');
    
    // Actualizează personajul copilului
    const childCharacter = document.getElementById('child-character').querySelector('.character');
    const inheritanceDetails = document.getElementById('inheritance-details');
    
    // Animație de loading
    childCharacter.style.opacity = '0.5';
    childCharacter.style.transform = 'scale(0.9)';
    
    setTimeout(() => {
        updateCharacterAppearance(childCharacter, childHair, childEyes, childFace, childFreckles);
        const inheritanceInfo = generateInheritanceInfo(parent1Hair, parent1Eyes, parent1Face, parent1Freckles, 
                                                      parent2Hair, parent2Eyes, parent2Face, parent2Freckles,
                                                      childHair, childEyes, childFace, childFreckles);
        inheritanceDetails.innerHTML = inheritanceInfo;
        
        // Animație de apariție
        childCharacter.style.opacity = '1';
        childCharacter.style.transform = 'scale(1)';
        childCharacter.style.animation = 'characterAppear 0.5s ease-out';
        
        setTimeout(() => {
            childCharacter.style.animation = '';
        }, 500);
    }, 300);
}

function simulateInheritance(trait1, trait2, traitType) {
    // Simulează moștenirea genetică cu probabilități științifice
    const random = Math.random();
    
    switch(traitType) {
        case 'hair':
            // Părul: creț dominant, ondulat intermediar, drept recesiv
            if (trait1 === 'curly' && trait2 === 'curly') {
                // Ambii părinți cu păr creț: 85% creț, 15% ondulat
                return random < 0.85 ? 'curly' : 'wavy';
            } else if ((trait1 === 'curly' && trait2 === 'wavy') || (trait1 === 'wavy' && trait2 === 'curly')) {
                // Un părinte creț, altul ondulat: 60% creț, 35% ondulat, 5% drept
                if (random < 0.60) return 'curly';
                else if (random < 0.95) return 'wavy';
                else return 'straight';
            } else if ((trait1 === 'curly' && trait2 === 'straight') || (trait1 === 'straight' && trait2 === 'curly')) {
                // Un părinte creț, altul drept: 70% creț, 25% ondulat, 5% drept
                if (random < 0.70) return 'curly';
                else if (random < 0.95) return 'wavy';
                else return 'straight';
            } else if (trait1 === 'wavy' && trait2 === 'wavy') {
                // Ambii părinți cu păr ondulat: 25% creț, 50% ondulat, 25% drept
                if (random < 0.25) return 'curly';
                else if (random < 0.75) return 'wavy';
                else return 'straight';
            } else if ((trait1 === 'wavy' && trait2 === 'straight') || (trait1 === 'straight' && trait2 === 'wavy')) {
                // Un părinte ondulat, altul drept: 10% creț, 60% ondulat, 30% drept
                if (random < 0.10) return 'curly';
                else if (random < 0.70) return 'wavy';
                else return 'straight';
            } else {
                // Ambii părinți cu păr drept: 100% drept
                return 'straight';
            }
            
        case 'eyes':
            // Ochii: căprui dominant, verzi intermediari, albaștri recesivi
            if (trait1 === 'brown' && trait2 === 'brown') {
                // Ambii părinți cu ochi căprui: 75% căprui, 20% verzi, 5% albaștri
                if (random < 0.75) return 'brown';
                else if (random < 0.95) return 'green';
                else return 'blue';
            } else if ((trait1 === 'brown' && trait2 === 'green') || (trait1 === 'green' && trait2 === 'brown')) {
                // Un părinte căprui, altul verde: 60% căprui, 35% verzi, 5% albaștri
                if (random < 0.60) return 'brown';
                else if (random < 0.95) return 'green';
                else return 'blue';
            } else if ((trait1 === 'brown' && trait2 === 'blue') || (trait1 === 'blue' && trait2 === 'brown')) {
                // Un părinte căprui, altul albastru: 50% căprui, 40% verzi, 10% albaștri
                if (random < 0.50) return 'brown';
                else if (random < 0.90) return 'green';
                else return 'blue';
            } else if (trait1 === 'green' && trait2 === 'green') {
                // Ambii părinți cu ochi verzi: 25% căprui, 50% verzi, 25% albaștri
                if (random < 0.25) return 'brown';
                else if (random < 0.75) return 'green';
                else return 'blue';
            } else if ((trait1 === 'green' && trait2 === 'blue') || (trait1 === 'blue' && trait2 === 'green')) {
                // Un părinte verde, altul albastru: 10% căprui, 60% verzi, 30% albaștri
                if (random < 0.10) return 'brown';
                else if (random < 0.70) return 'green';
                else return 'blue';
            } else {
                // Ambii părinți cu ochi albaștri: 100% albaștri
                return 'blue';
            }
            
        case 'face':
            // Forma feței: moștenire poligenică complexă
            if (trait1 === trait2) {
                // Ambii părinți cu aceeași formă: 70% aceeași formă, 30% alte forme
                if (random < 0.70) {
                    return trait1;
                } else {
                    // Distribuție bazată pe frecvența în populație
                    const shapes = ['oval', 'round', 'square'];
                    const weights = [0.40, 0.30, 0.30]; // Frecvențe în populație
                    const randomShape = Math.random();
                    if (randomShape < weights[0]) return 'oval';
                    else if (randomShape < weights[0] + weights[1]) return 'round';
                    else return 'square';
                }
            } else {
                // Părinți cu forme diferite: influențat de frecvența în populație
                const shapes = [trait1, trait2];
                const weights = [];
                
                // Calculează probabilitățile bazate pe frecvența în populație
                shapes.forEach(shape => {
                    switch(shape) {
                        case 'oval': weights.push(0.40); break;
                        case 'round': weights.push(0.30); break;
                        case 'square': weights.push(0.30); break;
                    }
                });
                
                // Normalizează probabilitățile
                const totalWeight = weights.reduce((a, b) => a + b, 0);
                const normalizedWeights = weights.map(w => w / totalWeight);
                
                if (random < normalizedWeights[0]) return shapes[0];
                else return shapes[1];
            }
            
        case 'freckles':
            // Pistruii: pronunțați dominanți, ușori intermediari, fără recesivi
            if (trait1 === 'heavy' && trait2 === 'heavy') {
                // Ambii părinți cu pistrui pronunțați: 80% pronunțați, 20% ușori
                return random < 0.80 ? 'heavy' : 'light';
            } else if ((trait1 === 'heavy' && trait2 === 'light') || (trait1 === 'light' && trait2 === 'heavy')) {
                // Un părinte cu pistrui pronunțați, altul ușori: 60% pronunțați, 35% ușori, 5% fără
                if (random < 0.60) return 'heavy';
                else if (random < 0.95) return 'light';
                else return 'none';
            } else if ((trait1 === 'heavy' && trait2 === 'none') || (trait1 === 'none' && trait2 === 'heavy')) {
                // Un părinte cu pistrui pronunțați, altul fără: 50% pronunțați, 40% ușori, 10% fără
                if (random < 0.50) return 'heavy';
                else if (random < 0.90) return 'light';
                else return 'none';
            } else if (trait1 === 'light' && trait2 === 'light') {
                // Ambii părinți cu pistrui ușori: 25% pronunțați, 50% ușori, 25% fără
                if (random < 0.25) return 'heavy';
                else if (random < 0.75) return 'light';
                else return 'none';
            } else if ((trait1 === 'light' && trait2 === 'none') || (trait1 === 'none' && trait2 === 'light')) {
                // Un părinte cu pistrui ușori, altul fără: 10% pronunțați, 60% ușori, 30% fără
                if (random < 0.10) return 'heavy';
                else if (random < 0.70) return 'light';
                else return 'none';
            } else {
                // Ambii părinți fără pistrui: 100% fără
                return 'none';
            }
            
        default:
            return random < 0.5 ? trait1 : trait2;
    }
}

function generateInheritanceInfo(parent1Hair, parent1Eyes, parent1Face, parent1Freckles,
                                parent2Hair, parent2Eyes, parent2Face, parent2Freckles,
                                childHair, childEyes, childFace, childFreckles) {
    
    const traitNames = {
        hair: {
            straight: 'Drept',
            wavy: 'Ondulat',
            curly: 'Creț'
        },
        eyes: {
            blue: 'Albaștri',
            green: 'Verzi',
            brown: 'Căprui'
        },
        face: {
            oval: 'Ovală',
            round: 'Rotundă',
            square: 'Pătrată'
        },
        freckles: {
            none: 'Fără Pistrui',
            light: 'Ușori',
            heavy: 'Pronunțați'
        }
    };

    // Funcție pentru calcularea probabilităților de moștenire
    function calculateInheritanceProbability(parent1, parent2, child, traitType) {
        const combinations = {
            hair: {
                'curly-curly-curly': '85%',
                'curly-curly-wavy': '15%',
                'curly-wavy-curly': '60%',
                'curly-wavy-wavy': '35%',
                'curly-wavy-straight': '5%',
                'curly-straight-curly': '70%',
                'curly-straight-wavy': '25%',
                'curly-straight-straight': '5%',
                'wavy-wavy-curly': '25%',
                'wavy-wavy-wavy': '50%',
                'wavy-wavy-straight': '25%',
                'wavy-straight-curly': '10%',
                'wavy-straight-wavy': '60%',
                'wavy-straight-straight': '30%',
                'straight-straight-straight': '100%'
            },
            eyes: {
                'brown-brown-brown': '75%',
                'brown-brown-green': '20%',
                'brown-brown-blue': '5%',
                'brown-green-brown': '60%',
                'brown-green-green': '35%',
                'brown-green-blue': '5%',
                'brown-blue-brown': '50%',
                'brown-blue-green': '40%',
                'brown-blue-blue': '10%',
                'green-green-brown': '25%',
                'green-green-green': '50%',
                'green-green-blue': '25%',
                'green-blue-brown': '10%',
                'green-blue-green': '60%',
                'green-blue-blue': '30%',
                'blue-blue-blue': '100%'
            },
            freckles: {
                'heavy-heavy-heavy': '80%',
                'heavy-heavy-light': '20%',
                'heavy-light-heavy': '60%',
                'heavy-light-light': '35%',
                'heavy-light-none': '5%',
                'heavy-none-heavy': '50%',
                'heavy-none-light': '40%',
                'heavy-none-none': '10%',
                'light-light-heavy': '25%',
                'light-light-light': '50%',
                'light-light-none': '25%',
                'light-none-heavy': '10%',
                'light-none-light': '60%',
                'light-none-none': '30%',
                'none-none-none': '100%'
            }
        };

        const key = `${parent1}-${parent2}-${child}`;
        const reverseKey = `${parent2}-${parent1}-${child}`;
        
        if (combinations[traitType] && (combinations[traitType][key] || combinations[traitType][reverseKey])) {
            return combinations[traitType][key] || combinations[traitType][reverseKey];
        }
        
        // Pentru forma feței (poligenică)
        if (traitType === 'face') {
            if (parent1 === parent2 && parent1 === child) return '70%';
            if (parent1 === child || parent2 === child) return '35%';
            return '15%';
        }
        
        return 'Variabilă';
    }

    const hairProb = calculateInheritanceProbability(parent1Hair, parent2Hair, childHair, 'hair');
    const eyesProb = calculateInheritanceProbability(parent1Eyes, parent2Eyes, childEyes, 'eyes');
    const faceProb = calculateInheritanceProbability(parent1Face, parent2Face, childFace, 'face');
    const frecklesProb = calculateInheritanceProbability(parent1Freckles, parent2Freckles, childFreckles, 'freckles');
    
    return `
        <h4>Detalii Moștenire Genetică</h4>
        <div class="inheritance-breakdown">
            <div class="inheritance-trait">
                <strong>Părul:</strong> ${traitNames.hair[parent1Hair]} + ${traitNames.hair[parent2Hair]} = ${traitNames.hair[childHair]}
                <br><small>Probabilitate: ${hairProb} | Gene: TCHH, TCHHL1, EDAR, FGFR2</small>
            </div>
            <div class="inheritance-trait">
                <strong>Ochii:</strong> ${traitNames.eyes[parent1Eyes]} + ${traitNames.eyes[parent2Eyes]} = ${traitNames.eyes[childEyes]}
                <br><small>Probabilitate: ${eyesProb} | Gene: OCA2, HERC2, SLC24A4, TYR</small>
            </div>
            <div class="inheritance-trait">
                <strong>Fața:</strong> ${traitNames.face[parent1Face]} + ${traitNames.face[parent2Face]} = ${traitNames.face[childFace]}
                <br><small>Probabilitate: ${faceProb} | Gene: BMP4, FGFR2, PAX3, MSX1, ALX4 (200+ gene)</small>
            </div>
            <div class="inheritance-trait">
                <strong>Pistruii:</strong> ${traitNames.freckles[parent1Freckles]} + ${traitNames.freckles[parent2Freckles]} = ${traitNames.freckles[childFreckles]}
                <br><small>Probabilitate: ${frecklesProb} | Gene: MC1R, IRF4, ASIP</small>
            </div>
        </div>
        
        <div class="inheritance-science">
            <h5>🔬 Explicație Științifică</h5>
            <ul>
                <li><strong>Părul:</strong> Moștenirea este controlată de genele TCHH și TCHHL1. Părul creț este dominant, ondulat este intermediar, iar dreptul este recesiv.</li>
                <li><strong>Ochii:</strong> Culoarea este influențată de cel puțin 16 gene diferite. Ochii căprui sunt dominanți, verzi sunt intermediari, iar albaștrii sunt recesivi.</li>
                <li><strong>Fața:</strong> Forma feței este o trăsătură poligenică complexă, influențată de sute de gene care controlează dezvoltarea craniofacială.</li>
                <li><strong>Pistruii:</strong> Sunt controlați de genele MC1R și IRF4. Pistruii pronunțați sunt dominanți, ușorii sunt intermediari, iar absența lor este recesivă.</li>
            </ul>
        </div>
        
        <p><em>Notă: Aceasta este o simulare simplificată a moștenirii genetice. În realitate, moștenirea genetică este mult mai complexă și implică multe gene care lucrează împreună. De exemplu, culoarea ochilor este influențată de cel puțin 16 gene diferite, iar forma feței de sute de gene. De asemenea, factorii de mediu și epigenetica pot influența expresia genelor.</em></p>
    `;
}

// Adaugă event listeners pentru actualizarea personajelor părinților
document.addEventListener('DOMContentLoaded', function() {
    const parentSelects = document.querySelectorAll('#parent1-hair, #parent1-eyes, #parent1-face, #parent1-freckles, #parent2-hair, #parent2-eyes, #parent2-face, #parent2-freckles');
    parentSelects.forEach(select => {
        select.addEventListener('change', updateParentCharacters);
    });
});
