// Three.js 3D Background & Spatial Journey Visuals
class ThreeJourneyScene {
  constructor() {
    this.container = document.getElementById('three-canvas-container');
    if (!this.container || typeof THREE === 'undefined') {
      console.warn("Three.js container or library missing");
      return;
    }

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.currentStationIndex = 0;
    this.shapes = [];

    this.initLights();
    this.initParticles();
    this.initStationShapes();
    this.setupCamera();
    this.addEvents();
    this.animate();
  }

  initLights() {
    const ambientLight = new THREE.AmbientLight(0x1a1e36, 1.5);
    this.scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00f0ff, 3, 100);
    pointLight1.position.set(10, 20, 15);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x7000ff, 3, 100);
    pointLight2.position.set(-10, -20, -10);
    this.scene.add(pointLight2);
  }

  initParticles() {
    const particleCount = 1800;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const color1 = new THREE.Color(0x00f0ff);
    const color2 = new THREE.Color(0x7000ff);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 120;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 120;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 120;

      const mixedColor = color1.clone().lerp(color2, Math.random());
      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.25,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });

    this.particleSystem = new THREE.Points(geometry, material);
    this.scene.add(this.particleSystem);
  }

  initStationShapes() {
    const totalStations = 11;
    const radius = 12;

    const materials = [
      new THREE.MeshStandardMaterial({ color: 0x00f0ff, wireframe: true, roughness: 0.2, metalness: 0.8 }),
      new THREE.MeshStandardMaterial({ color: 0x7000ff, wireframe: true, roughness: 0.2, metalness: 0.8 }),
      new THREE.MeshStandardMaterial({ color: 0xff0055, wireframe: true, roughness: 0.2, metalness: 0.8 }),
      new THREE.MeshStandardMaterial({ color: 0x00ffaa, wireframe: true, roughness: 0.2, metalness: 0.8 })
    ];

    const geometries = [
      new THREE.IcosahedronGeometry(2.5, 0),
      new THREE.BoxGeometry(3, 3, 3),
      new THREE.OctahedronGeometry(2.8, 0),
      new THREE.TorusKnotGeometry(2, 0.6, 64, 8),
      new THREE.CylinderGeometry(2, 2, 4, 8),
      new THREE.DodecahedronGeometry(2.5, 0),
      new THREE.SphereGeometry(2.5, 16, 16),
      new THREE.TorusGeometry(2.5, 0.8, 16, 32),
      new THREE.IcosahedronGeometry(3, 1),
      new THREE.TetrahedronGeometry(3, 0),
      new THREE.RingGeometry(1, 3, 32)
    ];

    for (let i = 0; i < totalStations; i++) {
      const geom = geometries[i % geometries.length];
      const mat = materials[i % materials.length].clone();
      const mesh = new THREE.Mesh(geom, mat);

      // Position shapes along a 3D winding helix journey path
      const angle = (i / totalStations) * Math.PI * 4;
      mesh.position.x = Math.cos(angle) * radius;
      mesh.position.y = (i - totalStations / 2) * 8;
      mesh.position.z = Math.sin(angle) * radius - 15;

      this.scene.add(mesh);
      this.shapes.push({ mesh, initialY: mesh.position.y, rotSpeedX: (Math.random() - 0.5) * 0.02, rotSpeedY: (Math.random() - 0.5) * 0.02 });
    }
  }

  setupCamera() {
    this.camera.position.set(0, 0, 15);
  }

  goToStation(index) {
    this.currentStationIndex = index;
    if (this.shapes[index]) {
      const targetMesh = this.shapes[index].mesh;
      const targetPos = {
        x: targetMesh.position.x * 0.3,
        y: targetMesh.position.y,
        z: targetMesh.position.z + 12
      };

      // Smooth camera transition animation
      if (typeof gsap !== 'undefined') {
        gsap.to(this.camera.position, {
          x: targetPos.x,
          y: targetPos.y,
          z: targetPos.z,
          duration: 1.2,
          ease: "power2.inOut"
        });
      } else {
        this.camera.position.set(targetPos.x, targetPos.y, targetPos.z);
      }
    }
  }

  addEvents() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    window.addEventListener('mousemove', (e) => {
      this.mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      this.mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // Smooth mouse parallax
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    this.scene.rotation.y = this.mouse.x * 0.15;
    this.scene.rotation.x = -this.mouse.y * 0.15;

    // Rotate particles
    if (this.particleSystem) {
      this.particleSystem.rotation.y += 0.0008;
      this.particleSystem.rotation.x += 0.0004;
    }

    // Rotate station shapes
    const time = Date.now() * 0.001;
    this.shapes.forEach((item, idx) => {
      item.mesh.rotation.x += item.rotSpeedX || 0.01;
      item.mesh.rotation.y += item.rotSpeedY || 0.01;
      item.mesh.position.y = item.initialY + Math.sin(time + idx) * 0.6;
    });

    this.renderer.render(this.scene, this.camera);
  }
}

window.initThreeScene = () => {
  window.threeJourney = new ThreeJourneyScene();
};
