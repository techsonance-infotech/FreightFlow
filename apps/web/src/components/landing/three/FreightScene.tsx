'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// India freight city nodes: [name, lat, lng]
const CITIES: [string, number, number][] = [
  ['Mumbai',    19.076, 72.877],
  ['Surat',     21.170, 72.831],
  ['Delhi',     28.679, 77.069],
  ['Chennai',   13.082, 80.270],
  ['Kolkata',   22.572, 88.363],
  ['Hyderabad', 17.385, 78.486],
  ['Bangalore', 12.971, 77.594],
  ['Ahmedabad', 23.022, 72.571],
  ['Pune',      18.520, 73.856],
  ['Jaipur',    26.912, 75.787],
  ['Nagpur',    21.145, 79.082],
  ['Lucknow',   26.846, 80.946],
  ['Indore',    22.719, 75.857],
  ['Vadodara',  22.307, 73.181],
];

// Route pairs (indices into CITIES)
const ROUTES: [number, number][] = [
  [0, 1], [1, 7], [7, 13], [0, 8], [0, 6],
  [0, 11], [2, 9], [2, 11], [2, 10], [10, 3],
  [3, 4], [4, 11], [5, 3], [5, 6], [6, 8],
  [12, 7], [12, 2], [9, 2], [10, 11],
];

function latLngToVec3(lat: number, lng: number, radius: number): THREE.Vector3 {
  // Map India bounding box to screen space
  // India: lat 8–37, lng 68–97
  const normalizedX = (lng - 68) / (97 - 68); // 0..1
  const normalizedY = (lat - 8) / (37 - 8);   // 0..1

  // Map to canvas coordinates centered at 0
  const x = (normalizedX - 0.5) * radius * 2.2;
  const y = (normalizedY - 0.5) * radius * 1.5;
  return new THREE.Vector3(x, y, 0);
}

export default function FreightScene() {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 });
  const cameraTargetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!mountRef.current) return;
    const mount = mountRef.current;

    // Scene setup
    const scene = new THREE.Scene();
    const width = mount.clientWidth || window.innerWidth;
    const height = mount.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const RADIUS = 3.5;

    // City node positions
    const cityPositions = CITIES.map(([, lat, lng]) => latLngToVec3(lat, lng, RADIUS));

    // --- Particle field (800 points) ---
    const particleGeo = new THREE.BufferGeometry();
    const pCount = 800;
    const positions = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 18;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4 - 1;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x2563eb,
      size: 0.025,
      transparent: true,
      opacity: 0.4,
      sizeAttenuation: true,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // --- Route lines (bezier curves) ---
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x2563eb,
      transparent: true,
      opacity: 0.25,
    });

    ROUTES.forEach(([a, b]) => {
      const pA = cityPositions[a];
      const pB = cityPositions[b];
      const mid = new THREE.Vector3(
        (pA.x + pB.x) / 2 + (Math.random() - 0.5) * 0.3,
        (pA.y + pB.y) / 2 + (Math.random() - 0.5) * 0.3,
        0.1
      );
      const curve = new THREE.QuadraticBezierCurve3(pA, mid, pB);
      const points = curve.getPoints(40);
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geo, lineMaterial.clone());
      scene.add(line);
    });

    // --- City nodes ---
    const cityNodeGroup = new THREE.Group();
    const nodeGeo = new THREE.SphereGeometry(0.045, 12, 12);
    const nodeMat = new THREE.MeshBasicMaterial({ color: 0xFFB300 });
    const ringMeshes: THREE.Mesh[] = [];

    cityPositions.forEach((pos) => {
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat.clone());
      nodeMesh.position.copy(pos);
      cityNodeGroup.add(nodeMesh);

      // Pulsing ring
      const ringGeo = new THREE.RingGeometry(0.07, 0.1, 20);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xFFB300,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(pos);
      ring.position.z += 0.01;
      cityNodeGroup.add(ring);
      ringMeshes.push(ring);
    });
    scene.add(cityNodeGroup);

    // --- Trucks (animated spheres along routes) ---
    const truckGroup = new THREE.Group();
    const truckGeo = new THREE.SphereGeometry(0.03, 8, 8);

    const truckData: {
      mesh: THREE.Mesh;
      curve: THREE.QuadraticBezierCurve3;
      t: number;
      speed: number;
      color: number;
    }[] = [];

    // Pick 8 random routes for trucks
    const routeSubset = ROUTES.slice(0, 8);
    routeSubset.forEach(([a, b], i) => {
      const pA = cityPositions[a];
      const pB = cityPositions[b];
      const mid = new THREE.Vector3(
        (pA.x + pB.x) / 2,
        (pA.y + pB.y) / 2,
        0.15
      );
      const curve = new THREE.QuadraticBezierCurve3(pA, mid, pB);
      const color = i % 3 === 0 ? 0xFFB300 : 0x42A5F5;
      const mat = new THREE.MeshBasicMaterial({ color });
      const mesh = new THREE.Mesh(truckGeo, mat);
      truckGroup.add(mesh);
      truckData.push({ mesh, curve, t: Math.random(), speed: 0.0008 + Math.random() * 0.0006, color });
    });
    scene.add(truckGroup);

    // --- Glow overlay (ambient blue sphere in center) ---
    const glowGeo = new THREE.SphereGeometry(1.5, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x1E4D8C,
      transparent: true,
      opacity: 0.06,
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.set(0, -0.2, -0.5);
    scene.add(glow);

    // Mouse parallax
    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouseMove);

    let time = 0;

    // Animation loop
    function animate() {
      animFrameRef.current = requestAnimationFrame(animate);
      time += 0.016;

      // Smooth camera parallax
      cameraTargetRef.current.x += (mouseRef.current.x * 0.3 - cameraTargetRef.current.x) * 0.05;
      cameraTargetRef.current.y += (mouseRef.current.y * 0.2 - cameraTargetRef.current.y) * 0.05;
      camera.position.x = cameraTargetRef.current.x;
      camera.position.y = cameraTargetRef.current.y;
      camera.lookAt(0, 0, 0);

      // Particle slow rotation
      particles.rotation.z += 0.0003;

      // Pulse rings
      ringMeshes.forEach((ring, i) => {
        const scale = 1 + 0.4 * Math.sin(time * 1.5 + i * 0.7);
        ring.scale.set(scale, scale, 1);
        (ring.material as THREE.MeshBasicMaterial).opacity = 0.4 + 0.3 * Math.sin(time * 1.5 + i * 0.7);
      });

      // Animate trucks
      truckData.forEach((truck) => {
        truck.t += truck.speed;
        if (truck.t > 1) truck.t = 0;
        const pos = truck.curve.getPoint(truck.t);
        truck.mesh.position.copy(pos);
        truck.mesh.position.z = 0.2;
      });

      renderer.render(scene, camera);
    }
    animate();

    // Handle resize
    const handleResize = () => {
      const w = mount.clientWidth || window.innerWidth;
      const h = mount.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    />
  );
}
