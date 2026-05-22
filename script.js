// Custom Cursor
document.addEventListener('DOMContentLoaded', () => {
    const cursor = document.querySelector('.custom-cursor');
    const cursorDot = document.querySelector('.custom-cursor-dot');

    if (cursor && cursorDot) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';

            cursorDot.style.left = e.clientX + 'px';
            cursorDot.style.top = e.clientY + 'px';
        });

        // Add hover effect to interactive elements
        const interactiveElements = document.querySelectorAll('a, button, .btn, input, textarea, .team-card, .kol-twitter');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.classList.add('hover');
            });
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('hover');
            });
        });
    }
});

// Loader animation
const counter = document.querySelector('.counter');
let count = 0;

function updateLoader() {
    count += Math.floor(Math.random() * 15) + 1;
    if (count > 100) count = 100;
    counter.innerText = count < 10 ? `0${count}` : count;

    if (count < 100) {
        requestAnimationFrame(updateLoader);
    } else {
        setTimeout(() => {
            gsap.to('#loader', {
                yPercent: -100,
                duration: 1,
                ease: "power4.inOut",
                onComplete: initInteractions
            });
        }, 200);
    }
}

requestAnimationFrame(updateLoader);

// WebGL 3D Background
const initWebGL = () => {
    const container = document.getElementById('canvas-container');
    if (!container) return;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 15;
    camera.position.y = 5;
    camera.rotation.x = -0.2;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Reduced for performance
    container.appendChild(renderer.domElement);

    const geometry = new THREE.PlaneGeometry(60, 60, 32, 32); // Reduced segments for performance
    geometry.rotateX(-Math.PI / 2);

    const positions = geometry.attributes.position;
    const originalY = new Float32Array(positions.count);
    for (let i = 0; i < positions.count; i++) {
        originalY[i] = positions.getY(i);
    }

    const vertexShader = `
        varying vec2 vUv;
        varying float vElevation;
        uniform float uTime;
        
        void main() {
            vUv = uv;
            vec3 pos = position;
            
            float elevation = sin(pos.x * 0.2 + uTime * 0.5) * 
                              cos(pos.z * 0.2 + uTime * 0.3) * 2.0;
            
            elevation += sin(pos.x * 0.5 - uTime * 0.2) * 
                         cos(pos.z * 0.5 + uTime * 0.4) * 0.5;

            pos.y += elevation;
            vElevation = pos.y;

            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
    `;

    const fragmentShader = `
        varying float vElevation;
        
        void main() {
            float mixStrength = (vElevation + 2.0) / 4.0;
            mixStrength = clamp(mixStrength, 0.0, 1.0);
            
            vec3 white = vec3(1.0, 1.0, 1.0); 
            vec3 black = vec3(0.0, 0.0, 0.0); 
            
            vec3 color = mix(black, white, mixStrength);
            
            float alpha = smoothstep(-1.0, 2.0, vElevation) * 0.8;
            
            gl_FragColor = vec4(color, alpha);
        }
    `;

    const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
            uTime: { value: 0 }
        },
        wireframe: true,
        transparent: true
    });

    const plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX) * 0.001;
        mouseY = (event.clientY - windowHalfY) * 0.001;
    });

    const clock = new THREE.Clock();

    const animate = () => {
        requestAnimationFrame(animate);

        const elapsedTime = clock.getElapsedTime();
        material.uniforms.uTime.value = elapsedTime;

        targetX = mouseX * 0.5;
        targetY = mouseY * 0.5;
        plane.rotation.y += 0.0015;
        camera.position.x += (mouseX * 25 - camera.position.x) * 0.05;
        camera.position.y += (-mouseY * 20 + 5 - camera.position.y) * 0.05;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
    };

    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
};

// Roadmap timeline animation
ScrollTrigger.matchMedia({
    "(min-width: 993px)": function () {
        gsap.to(".timeline-progress", {
            scaleX: 1,
            scrollTrigger: {
                trigger: ".roadmap-timeline",
                start: "top center",
                end: "bottom center",
                scrub: true
            }
        });
    },
    "(max-width: 992px)": function () {
        gsap.to(".timeline-progress", {
            scaleY: 1,
            scrollTrigger: {
                trigger: ".roadmap-timeline",
                start: "top center",
                end: "bottom center",
                scrub: true
            }
        });
    }
});

// GSAP Scroll Animations
function initInteractions() {
    gsap.registerPlugin(ScrollTrigger);

    const reveals = document.querySelectorAll('.reveal');
    reveals.forEach((reveal, index) => {
        gsap.fromTo(reveal,
            {
                opacity: 0,
                y: 100
            },
            {
                scrollTrigger: {
                    trigger: reveal,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                },
                opacity: 1,
                y: 0,
                duration: 1,
                ease: "power3.out",
                delay: index * 0.1 // Stagger animations
            }
        );
    });

    // Animated loading for each section content
    const sectionHeadings = document.querySelectorAll('.section-heading');
    sectionHeadings.forEach(heading => {
        gsap.fromTo(heading,
            {
                opacity: 0,
                y: -50,
                scaleX: 0.8
            },
            {
                scrollTrigger: {
                    trigger: heading,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                },
                opacity: 1,
                y: 0,
                scaleX: 1,
                duration: 0.8,
                ease: "back.out(1.7)"
            }
        );
    });

    // Animate cards within sections
    const cards = document.querySelectorAll('.panel, .service-item, .tech-card, .kol-card, .team-card');
    cards.forEach((card, index) => {
        gsap.fromTo(card,
            {
                opacity: 0,
                y: 50,
                scale: 0.9
            },
            {
                scrollTrigger: {
                    trigger: card,
                    start: "top 90%",
                    toggleActions: "play none none reverse"
                },
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.6,
                ease: "power2.out",
                delay: (index % 4) * 0.1 // Stagger within groups of 4
            }
        );
    });

    // Scroll Indicator
    const sections = document.querySelectorAll('section[id]');
    const scrollDots = document.querySelectorAll('.scroll-dot');

    sections.forEach(section => {
        ScrollTrigger.create({
            trigger: section,
            start: "top center",
            end: "bottom center",
            onEnter: () => updateActiveDot(section.id),
            onEnterBack: () => updateActiveDot(section.id)
        });
    });

    function updateActiveDot(sectionId) {
        scrollDots.forEach(dot => {
            dot.classList.remove('active');
            if (dot.getAttribute('data-section') === sectionId) {
                dot.classList.add('active');
            }
        });
    }

    gsap.to('.monumental-vertical', {
        scrollTrigger: {
            trigger: '.hero',
            start: "top top",
            end: "bottom top",
            scrub: 1
        },
        y: 200,
        opacity: 0
    });

    gsap.to('#marquee', {
        xPercent: -50,
        ease: "none",
        duration: 20,
        repeat: -1
    });

    initWebGL();

    const serviceItems = document.querySelectorAll('.service-item');
    serviceItems.forEach(item => {
        item.addEventListener('mouseover', () => {
            serviceItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });
}
