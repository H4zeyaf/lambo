import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { animate, stagger } from 'animejs';

import './style.css';

gsap.registerPlugin(ScrollTrigger);

// ========================================
// ANIME.JS ANIMATIONS
// ========================================

// Animate numbers when they come into view
function initNumberAnimations() {
    const numberElements = document.querySelectorAll('.animate-number');

    numberElements.forEach(el => {
        const target = parseFloat(el.dataset.target);
        const decimals = parseInt(el.dataset.decimals) || 0;
        let current = { value: 0 };

        // Create intersection observer to trigger animation when visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animate(current, {
                        value: target,
                        duration: 2000,
                        easing: 'outExpo',
                        onUpdate: () => {
                            el.textContent = current.value.toFixed(decimals);
                        }
                    });
                    observer.unobserve(el); // Only animate once
                }
            });
        }, { threshold: 0.5 });

        observer.observe(el);
    });
}

// Animate hero content on page load
function initHeroAnimations() {
    // Watermark letters sliding in from sides - IMMEDIATE
    // Left letters (R, E, V, U) slide in from left
    animate('.wm-left', {
        opacity: [0, 1],
        translateX: [-300, 0],
        duration: 1500,
        easing: 'outExpo',
        delay: stagger(100, { start: 0 })
    });

    // Right letters (E, L, T, O) slide in from right
    animate('.wm-right', {
        opacity: [0, 1],
        translateX: [300, 0],
        duration: 1500,
        easing: 'outExpo',
        delay: stagger(100, { start: 0 })
    });

    // Add pulse animation class after letters animate in
    setTimeout(() => {
        document.querySelector('.watermark')?.classList.add('animated');
    }, 2000);

    // Hero content stagger animation - immediate
    animate('.hero-content > *', {
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 800,
        easing: 'outExpo',
        delay: stagger(100, { start: 0 })
    });

    // Stats container animation - immediate
    animate('.stat-item', {
        opacity: [0, 1],
        translateY: [40, 0],
        scale: [0.9, 1],
        duration: 600,
        easing: 'outExpo',
        delay: stagger(80, { start: 200 })
    });

    // Nav animation - immediate
    animate('.nav', {
        opacity: [0, 1],
        translateY: [-20, 0],
        duration: 600,
        easing: 'outExpo',
        delay: 0
    });
}

// Animate feature cards on hover
function initCardAnimations() {
    document.querySelectorAll('.feature-card, .perf-card, .split-side').forEach(card => {
        card.addEventListener('mouseenter', () => {
            animate(card, {
                scale: 1.02,
                duration: 300,
                easing: 'outExpo'
            });
        });

        card.addEventListener('mouseleave', () => {
            animate(card, {
                scale: 1,
                duration: 300,
                easing: 'outExpo'
            });
        });
    });
}

// Floating animation for icon elements - DISABLED for performance
// function initIconAnimations() {
//     animate('.stat-icon', {
//         translateY: [-5, 5],
//         duration: 2000,
//         loop: true,
//         alternate: true,
//         easing: 'inOutSine',
//         delay: stagger(200)
//     });
// }

// Initialize all anime.js animations after loader hides
function initAnimeAnimations() {
    initHeroAnimations();
    initNumberAnimations();
    initCardAnimations();
    // initIconAnimations(); // Disabled for performance
}

// ========================================
// 3D SCENE SETUP
// ========================================
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
});
const container = document.getElementById('canvas-container');

// Renderer configs - full resolution
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Full resolution
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // High quality shadows
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
container.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
keyLight.position.set(5, 5, 5);
keyLight.castShadow = true;
keyLight.shadow.mapSize.width = 2048; // Full resolution shadows
keyLight.shadow.mapSize.height = 2048;
keyLight.shadow.camera.near = 0.5;
keyLight.shadow.camera.far = 50;
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0x3b82f6, 0.8);
fillLight.position.set(-5, 3, 3);
scene.add(fillLight);

const rimLight = new THREE.DirectionalLight(0xff6b00, 1);
rimLight.position.set(0, 4, -5);
scene.add(rimLight);

// Ground
const groundGeometry = new THREE.PlaneGeometry(20, 20);
const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.3 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.5;
ground.receiveShadow = true;
scene.add(ground);

// Camera Initial Position
camera.position.set(2, 2, 4);

// DEBUG: Red Box removed

// ========================================
// LOADER FAILSAFE
// ========================================
setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader && !loader.classList.contains('hidden')) {
        console.warn('Force hiding loader due to timeout');
        loader.classList.add('hidden');
    }
}, 5000);

// ========================================
// MODEL LOADING
// ========================================
let car;
const loader = new GLTFLoader();

loader.load(
    `${import.meta.env.BASE_URL}2024_lamborghini_revuelto/scene.gltf`,
    function (gltf) {
        car = gltf.scene;

        // Normalize Scale & Position
        const box = new THREE.Box3().setFromObject(car);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 3.5 / maxDim;

        car.scale.setScalar(scale);
        car.position.x = -center.x * scale;
        car.position.y = -0.5; // On ground
        car.position.z = -center.z * scale;

        // Shadow casting & GPU optimizations
        car.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;

                // GPU performance optimizations
                child.frustumCulled = true; // Don't render if off-screen
                child.matrixAutoUpdate = false; // We'll manually update during animation

                // Material optimizations
                if (child.material) {
                    child.material.precision = 'lowp'; // Lower shader precision
                    child.material.needsUpdate = true;
                }
            }
        });

        // Add a parent wrapper for easier animation handling
        // We'll actually animate the car root directly for this
        scene.add(car);

        // Car appears instantly (no animation for best performance)

        // Hide Loader
        const loaderEl = document.getElementById('loader');
        if (loaderEl) {
            loaderEl.classList.add('hidden');
        }

        // Initialize Scroll Animations
        initScrollAnimations();

        // Start UI animations immediately
        setTimeout(() => {
            initAnimeAnimations();
        }, 100);
    },
    undefined,
    function (error) {
        console.error('Error loading model:', error);
        alert('Failed to load 3D model.');
    }
);

// ========================================
// SCROLL ANIMATIONS (MASTER TIMELINE)
// ========================================
function initScrollAnimations() {
    // Optimize ScrollTrigger for performance
    ScrollTrigger.config({
        limitCallbacks: true, // Limit callback frequency
        ignoreMobileResize: true
    });

    // Master Timeline linked to body scroll
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: 'body',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.5, // Lower = more responsive
            fastScrollEnd: true, // Optimize for fast scrolling
            preventOverlaps: true
        }
    });

    // --- Initial State Setup ---
    gsap.set('.hero-content, .stats-container', { opacity: 1, y: 0 });
    gsap.set('#features .reveal', { opacity: 0, x: -100 });
    gsap.set('#design .split-side.left', { opacity: 0, x: -100 });
    gsap.set('#design .split-side.right', { opacity: 0, x: 100 });
    gsap.set('#specs .reveal', { opacity: 0, x: 100 });
    gsap.set('#performance .reveal, #cta .reveal', { opacity: 0, y: 50 });

    // =============================================
    // KEYFRAME-BASED 3D ANIMATIONS
    // Using keyframes ensures smooth interpolation between ALL states
    // =============================================

    // CAMERA POSITION - Smooth path through all positions
    tl.to(camera.position, {
        keyframes: [
            { x: 2, y: 2, z: 4, duration: 0 },           // Start (Home)
            { x: 6, y: 0.5, z: 2, duration: 1 },         // Features (camera lower to frame car higher)
            { x: 0, y: 3.5, z: 1, duration: 1 },         // Design (slightly off from pure top-down)
            { x: -1, y: 0, z: 4, duration: 1 },          // Specs (side view)
            { x: 0, y: 2.5, z: -4, duration: 1 },        // Performance (rear)
            { x: 0, y: 3, z: -6, duration: 1 }           // CTA
        ],
        ease: "none"
    }, 0);

    // CAR ROTATION - Strictly monotonic Y rotation (no X or Z to avoid gimbal issues)
    tl.to(car.rotation, {
        keyframes: [
            { y: 0, duration: 0 },                       // Start
            { y: 0.2, duration: 1 },                    // Features (-57deg, more left-facing)
            { y: -1.57, duration: 1 },                   // Design (-90deg)
            { y: -2.36, duration: 1 },                   // Specs (-135deg)
            { y: -3.14, duration: 1 },                   // Performance (-180deg)
            { y: -3.5, duration: 1 }                     // CTA (continue slightly)
        ],
        ease: "none"
    }, 0);

    // CAR POSITION - Keep Y consistent to avoid jumps
    tl.to(car.position, {
        keyframes: [
            { x: 0, y: -0.5, z: 0, duration: 0 },        // Start
            { x: 2, y: -0.5, z: -1, duration: 1 },       // Features (shifted right)
            { x: 0, y: -0.5, z: 0, duration: 1 },        // Design (center)
            { x: -0.9, y: -0.5, z: 0, duration: 1 },     // Specs (shifted left)
            { x: 0, y: -0.5, z: 0, duration: 1 },        // Performance (center)
            { x: 0, y: -0.5, z: 0, duration: 1 }         // CTA
        ],
        ease: "none"
    }, 0);

    // =============================================
    // TEXT CONTENT ANIMATIONS (synchronized with 3D)
    // =============================================
    const textDur = 0.8; // Slightly faster for snappier text

    // Phase 1: Home -> Features
    tl.to('.hero-content, .stats-container', { opacity: 0, y: -50, duration: textDur }, 0.2)
        .to('#features .reveal', { opacity: 1, x: 0, stagger: 0.05, duration: textDur }, 0.4);

    // Phase 2: Features -> Design
    tl.to('#features .reveal', { opacity: 0, x: -100, duration: textDur }, 1.2)
        .to('#design .split-side.left', { opacity: 1, x: 0, duration: textDur }, 1.4)
        .to('#design .split-side.right', { opacity: 1, x: 0, duration: textDur }, 1.4);

    // Phase 3: Design -> Specs
    tl.to('#design .split-side.left', { opacity: 0, x: -100, duration: textDur }, 2.2)
        .to('#design .split-side.right', { opacity: 0, x: 100, duration: textDur }, 2.2)
        .to('#specs .reveal', { opacity: 1, x: 0, stagger: 0.05, duration: textDur }, 2.4);

    // Phase 4: Specs -> Performance
    tl.to('#specs .reveal', { opacity: 0, x: 100, duration: textDur }, 3.2)
        .to('#performance .reveal', { opacity: 1, y: 0, stagger: 0.05, duration: textDur }, 3.4);

    // Phase 5: Performance -> CTA
    tl.to('#performance .reveal', { opacity: 0, y: -30, duration: textDur }, 4.2)
        .to('#cta .reveal', { opacity: 1, y: 0, stagger: 0.05, duration: textDur }, 4.4);

}

// ========================================
// RENDER LOOP
// ========================================
function renderLoop() {
    requestAnimationFrame(renderLoop);

    // Update car matrices since we disabled auto-update for performance
    if (car) {
        car.updateMatrixWorld(true);
    }

    // Always look at center
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
}

// Resize Request
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

renderLoop();
