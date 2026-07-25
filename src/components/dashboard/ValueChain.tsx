import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';

import ValueChainFallback from './ValueChainFallback';
import { useIsRenderable, useMediaQuery, usePrefersReducedMotion } from '@/hooks/useMotion';
import type { PipelineStage } from '@/lib/dashboardMetrics';

/**
 * Chaîne de valeur — unique scène WebGL du dashboard.
 *
 * Huit nœuds alignés en profondeur, reliés par des conduits. Tout ce qui bouge
 * est piloté par les compteurs réels du pipeline : un nœud vide reste mat et en
 * retrait, un segment sans matière reste sombre et vide.
 *
 * Les libellés et les compteurs sont en HTML au-dessus du canvas, jamais rendus
 * dans la scène.
 */

// Palette verrouillée sur les tokens de la charte. Aucune autre teinte
// n'entre dans la scène, ni par les matériaux ni par les lumières.
const COLOR_CARBON = 0x1f1f21;
const COLOR_DARK = 0x0d0d10;
const COLOR_EXEC = 0x7a6f67;
const COLOR_COPPER = 0xd67a2c;
const COLOR_COPPER_LIGHT = 0xef9f27;

const NODE_COUNT = 8;
const NODE_SPACING = 1.6;
const PARTICLE_CAPACITY = 320;
const IGNITION_STEP_MS = 90;
const IGNITION_DURATION_MS = 500;
const MAX_NODE_LIGHTS = 4;

type Particle = {
  segment: number;
  t: number;
  speed: number;
  lateral: number;
  phase: number;
};

type Engine = {
  start: () => void;
  stop: () => void;
  refresh: () => void;
};

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl'))
    );
  } catch {
    return false;
  }
}

export default function ValueChain({
  stages,
  ready,
  enterDelay = 0,
}: {
  stages: PipelineStage[];
  /** true dès que les compteurs reflètent une réponse de l'API. */
  ready: boolean;
  enterDelay?: number;
}) {
  const navigate = useNavigate();
  const wide = useMediaQuery('(min-width: 768px)');
  const reduced = usePrefersReducedMotion();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const labelRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const engineRef = useRef<Engine | null>(null);

  const renderable = useIsRenderable(containerRef);
  const [supported, setSupported] = useState<boolean | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  const stagesRef = useRef(stages);
  const readyRef = useRef(ready);
  const navigateRef = useRef(navigate);
  const hoveredRef = useRef<number | null>(null);

  useEffect(() => {
    stagesRef.current = stages;
  }, [stages]);
  useEffect(() => {
    readyRef.current = ready;
  }, [ready]);
  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);

  useEffect(() => {
    setSupported(detectWebGL());
  }, []);

  const useWebGL = supported === true && wide;

  useEffect(() => {
    if (!useWebGL) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // ── Renderer ────────────────────────────────────────────────
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    } catch (error) {
      console.warn('Contexte WebGL indisponible, repli SVG.', error);
      setSupported(false);
      return;
    }

    renderer.setClearAlpha(0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const scene = new THREE.Scene();
    // Tout le pipeline vit dans un groupe : il peut être recentré d'un bloc
    // sans toucher à la caméra, donc sans déformer la perspective.
    const chain = new THREE.Group();
    scene.add(chain);

    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
    const fog = new THREE.Fog(COLOR_DARK, 6, 16);
    scene.fog = fog;

    // ── Lumières : ambiance très basse, une directionnelle grise,
    //    puis des ponctuelles cuivrées portées par les nœuds actifs.
    const ambient = new THREE.AmbientLight(COLOR_EXEC, 0.35);
    const key = new THREE.DirectionalLight(COLOR_EXEC, 1.1);
    key.position.set(2.5, 3.5, 4);
    scene.add(ambient, key);

    const nodeLights: THREE.PointLight[] = [];
    for (let i = 0; i < MAX_NODE_LIGHTS; i += 1) {
      const light = new THREE.PointLight(COLOR_COPPER, 0, 5.5, 2);
      light.visible = false;
      chain.add(light);
      nodeLights.push(light);
    }

    // ── Géométries et matériaux mutualisés ──────────────────────
    const nodeGeometry = new THREE.IcosahedronGeometry(0.42, 0);
    const conduitGeometry = new THREE.CylinderGeometry(0.018, 0.018, 1, 6);
    conduitGeometry.rotateZ(Math.PI / 2);
    const particleGeometry = new THREE.SphereGeometry(0.045, 6, 6);

    const nodes: THREE.Mesh[] = [];
    const nodeMaterials: THREE.MeshStandardMaterial[] = [];
    const nodeTargets: number[] = new Array(NODE_COUNT).fill(0);

    for (let i = 0; i < NODE_COUNT; i += 1) {
      const material = new THREE.MeshStandardMaterial({
        color: COLOR_CARBON,
        metalness: 0.85,
        roughness: 0.42,
        emissive: COLOR_COPPER,
        emissiveIntensity: 0,
      });
      const mesh = new THREE.Mesh(nodeGeometry, material);
      mesh.position.set((i - (NODE_COUNT - 1) / 2) * NODE_SPACING, 0, 0);
      mesh.rotation.set(0.4, 0.6, 0);
      mesh.userData.index = i;
      chain.add(mesh);
      nodes.push(mesh);
      nodeMaterials.push(material);
    }

    const conduits: THREE.Mesh[] = [];
    const conduitMaterials: THREE.MeshStandardMaterial[] = [];

    for (let i = 0; i < NODE_COUNT - 1; i += 1) {
      const material = new THREE.MeshStandardMaterial({
        color: COLOR_EXEC,
        metalness: 0.6,
        roughness: 0.7,
        emissive: COLOR_COPPER,
        emissiveIntensity: 0,
        transparent: true,
        opacity: 0.35,
      });
      const mesh = new THREE.Mesh(conduitGeometry, material);
      chain.add(mesh);
      conduits.push(mesh);
      conduitMaterials.push(material);
    }

    const particleMaterial = new THREE.MeshBasicMaterial({
      color: COLOR_COPPER_LIGHT,
      transparent: true,
      opacity: 0.9,
    });
    const particleMesh = new THREE.InstancedMesh(particleGeometry, particleMaterial, PARTICLE_CAPACITY);
    particleMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    particleMesh.frustumCulled = false;
    particleMesh.count = 0;
    chain.add(particleMesh);

    // ── État de la boucle ───────────────────────────────────────
    const nodePositions: THREE.Vector3[] = nodes.map((n) => n.position.clone());
    const dummy = new THREE.Object3D();
    const projected = new THREE.Vector3();
    const raycaster = new THREE.Raycaster();
    const pointerNdc = new THREE.Vector2();

    let particles: Particle[] = [];
    let particleSignature = '';
    let lightSignature = '';
    const countBuffer: number[] = new Array(NODE_COUNT).fill(0);
    let pointerInside = false;
    let pointerDirty = false;
    let ignitionStart: number | null = null;
    let lastRecenter = 0;
    let lastFrame = performance.now();
    let raf = 0;
    let running = false;
    let width = 0;
    let height = 0;

    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    /** Compteurs réels, écrits dans un tampon réutilisé — rien n'est alloué dans la boucle. */
    function counts(): number[] {
      const list = stagesRef.current;
      for (let i = 0; i < NODE_COUNT; i += 1) {
        countBuffer[i] = Number(list?.[i]?.count || 0);
      }
      return countBuffer;
    }

    /** Progression d'allumage d'un nœud : 0 avant, 1 une fois allumé. */
    function ignition(index: number, now: number): number {
      if (!readyRef.current) return 0;
      if (reduced) return 1;
      if (ignitionStart === null) return 0;
      const elapsed = now - ignitionStart - index * IGNITION_STEP_MS;
      return THREE.MathUtils.clamp(elapsed / IGNITION_DURATION_MS, 0, 1);
    }

    /** Recalcule la répartition des particules quand les compteurs changent. */
    function syncParticles(values: number[]) {
      const signature = values.join(',');
      if (signature === particleSignature) return;
      particleSignature = signature;

      const next: Particle[] = [];
      for (let i = 0; i < NODE_COUNT - 1; i += 1) {
        const count = values[i];
        // Un segment mort reste vide : le vide est une information.
        if (count <= 0) continue;

        const density = THREE.MathUtils.clamp(3 + Math.round(Math.min(count, 12) * 2.2), 3, 34);
        const speed = 0.09 + Math.min(count, 12) * 0.011;

        for (let p = 0; p < density; p += 1) {
          if (next.length >= PARTICLE_CAPACITY) break;
          next.push({
            segment: i,
            t: p / density,
            speed,
            lateral: (p % 3) - 1,
            phase: p * 0.7,
          });
        }
      }

      particles = next;
      particleMesh.count = next.length;
      particleMesh.instanceMatrix.needsUpdate = true;
    }

    function assignLights(values: number[]) {
      const signature = values.join(',');
      if (signature === lightSignature) return;
      lightSignature = signature;

      const ranked = values
        .map((count, index) => ({ count, index }))
        .filter((entry) => entry.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, MAX_NODE_LIGHTS);

      nodeLights.forEach((light, slot) => {
        const entry = ranked[slot];
        if (!entry) {
          light.visible = false;
          light.intensity = 0;
          return;
        }
        light.visible = true;
        light.userData.node = entry.index;
      });
    }

    function frameCamera() {
      if (!width || !height) return;
      const aspect = width / height;
      camera.aspect = aspect;

      const halfChain = (NODE_SPACING * (NODE_COUNT - 1)) / 2;
      const vFov = THREE.MathUtils.degToRad(camera.fov);
      const distance = THREE.MathUtils.clamp((halfChain + 1.3) / (Math.tan(vFov / 2) * aspect), 5.5, 16);

      camera.userData.distance = distance;
      fog.near = distance - 2.5;
      fog.far = distance + 7;
      camera.updateProjectionMatrix();
      recenter(1);
    }

    /**
     * La chaîne fuit vers le fond : le dernier nœud se rapproche du point de
     * fuite et la composition se décale vers la gauche. On corrige le décalage
     * du groupe, mesuré sur une pose de caméra neutre — sans la dérive ni le
     * parallax, sinon la correction annulerait le mouvement qu'elle mesure.
     */
    function recenter(damping: number) {
      if (!width || !height) return;

      const aspect = width / height;
      const distance = Number(camera.userData.distance || 8);
      const vFov = THREE.MathUtils.degToRad(camera.fov);
      const worldHalfWidth = Math.tan(vFov / 2) * distance * aspect;

      camera.position.set(0, -0.8, distance);
      camera.lookAt(0, 0.15, -0.8);
      camera.updateMatrixWorld(true);

      const first = nodePositions[0];
      const last = nodePositions[NODE_COUNT - 1];

      projected.set(first.x + chain.position.x, first.y, first.z).project(camera);
      const firstNdc = projected.x;
      projected.set(last.x + chain.position.x, last.y, last.z).project(camera);
      const lastNdc = projected.x;

      const errorNdc = (firstNdc + lastNdc) / 2;
      if (Math.abs(errorNdc) < 0.004) return;

      chain.position.x -= errorNdc * worldHalfWidth * damping;
    }

    function resize() {
      const rect = container!.getBoundingClientRect();
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      renderer.setSize(width, height, false);
      frameCamera();
      if (!running) draw(performance.now(), 0);
    }

    function updateLabels() {
      const list = stagesRef.current;
      for (let i = 0; i < NODE_COUNT; i += 1) {
        const label = labelRefs.current[i];
        if (!label) continue;

        // nodePositions est local au groupe : on ajoute son décalage de recentrage.
        projected.set(
          nodePositions[i].x + chain.position.x,
          nodePositions[i].y - 0.95,
          nodePositions[i].z
        );
        projected.project(camera);

        const x = (projected.x * 0.5 + 0.5) * width;
        const y = (-projected.y * 0.5 + 0.5) * height;

        label.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, 0)`;
        label.style.opacity = Number(list?.[i]?.count || 0) > 0 ? '1' : '0.62';
      }
    }

    function draw(now: number, delta: number) {
      const values = counts();
      syncParticles(values);
      assignLights(values);

      if (ignitionStart === null && readyRef.current) ignitionStart = now;

      const elapsedSeconds = now / 1000;
      const hoveredIndex = hoveredRef.current;

      // ── Nœuds ────────────────────────────────────────────────
      for (let i = 0; i < NODE_COUNT; i += 1) {
        const count = values[i];
        const active = count > 0;
        const lit = ignition(i, now);

        // Un nœud actif avance vers le spectateur, un nœud vide reste en retrait.
        const baseZ = -i * 0.22;
        const targetZ = baseZ + (active ? 0.55 : -0.45) * lit;
        const node = nodes[i];
        node.position.z += (targetZ - node.position.z) * Math.min(1, delta * 4);

        const focus = hoveredIndex === null ? 1 : hoveredIndex === i ? 1 : 0.45;
        const pulseSpeed = 0.6 + Math.min(count, 12) * 0.08;
        const pulse = active && !reduced ? 0.88 + Math.sin(elapsedSeconds * pulseSpeed) * 0.12 : 1;

        const base = active ? 0.5 + Math.min(count, 12) / 12 * 0.45 : 0.04;
        const hoverBoost = hoveredIndex === i ? 1.5 : 1;
        nodeTargets[i] = base * lit * pulse * focus * hoverBoost;
        nodeMaterials[i].emissiveIntensity = nodeTargets[i];

        const targetScale = hoveredIndex === i ? 1.18 : 1;
        node.scale.setScalar(node.scale.x + (targetScale - node.scale.x) * Math.min(1, delta * 6));

        if (!reduced) node.rotation.y += delta * (active ? 0.12 : 0.03);

        nodePositions[i].copy(node.position);
      }

      // ── Conduits ─────────────────────────────────────────────
      for (let i = 0; i < NODE_COUNT - 1; i += 1) {
        const a = nodePositions[i];
        const b = nodePositions[i + 1];
        const mesh = conduits[i];

        mesh.position.set((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
        const length = a.distanceTo(b);
        mesh.scale.set(length, 1, 1);
        mesh.lookAt(b);
        mesh.rotateY(-Math.PI / 2);

        const alive = values[i] > 0 ? Math.min(ignition(i, now), ignition(i + 1, now)) : 0;
        conduitMaterials[i].emissiveIntensity = 0.35 * alive;
        conduitMaterials[i].opacity = 0.22 + 0.4 * alive;
      }

      // ── Lumières portées par les nœuds actifs ────────────────
      for (const light of nodeLights) {
        if (!light.visible) continue;
        const index = Number(light.userData.node ?? 0);
        light.position.copy(nodePositions[index]);
        light.position.z += 0.5;
        light.intensity = 2.4 * THREE.MathUtils.clamp(nodeTargets[index], 0, 1);
      }

      // ── Flux de particules ───────────────────────────────────
      if (particleMesh.count > 0) {
        const flowing = !reduced;
        for (let p = 0; p < particles.length; p += 1) {
          const particle = particles[p];
          if (flowing) {
            particle.t += particle.speed * delta;
            if (particle.t > 1) particle.t -= 1;
          }

          const a = nodePositions[particle.segment];
          const b = nodePositions[particle.segment + 1];
          const t = particle.t;

          dummy.position.set(
            a.x + (b.x - a.x) * t,
            a.y + (b.y - a.y) * t + Math.sin(particle.phase + t * 6) * 0.04,
            a.z + (b.z - a.z) * t + particle.lateral * 0.05
          );
          dummy.scale.setScalar(1);
          dummy.updateMatrix();
          particleMesh.setMatrixAt(p, dummy.matrix);
        }
        particleMesh.instanceMatrix.needsUpdate = true;
      }

      // Les nœuds avancent ou reculent selon l'activité : on revérifie le
      // cadrage à intervalle lent, avec un amortissement qui rend la
      // correction invisible.
      if (now - lastRecenter > 1000) {
        lastRecenter = now;
        recenter(0.4);
      }

      // ── Caméra : dérive lente, parallax amorti, jamais de rotation libre
      const distance = Number(camera.userData.distance || 8);
      mouse.x += (mouse.targetX - mouse.x) * Math.min(1, delta * 3);
      mouse.y += (mouse.targetY - mouse.y) * Math.min(1, delta * 3);

      const driftX = reduced ? 0 : Math.sin((elapsedSeconds * Math.PI * 2) / 25) * 0.3;
      const driftY = reduced ? 0 : Math.sin((elapsedSeconds * Math.PI * 2) / 31) * 0.12;

      camera.position.set(driftX + mouse.x * 0.35, -0.8 + driftY + mouse.y * 0.18, distance);
      camera.lookAt(0, 0.15, -0.8);

      // ── Survol ───────────────────────────────────────────────
      if (pointerInside && pointerDirty) {
        pointerDirty = false;
        raycaster.setFromCamera(pointerNdc, camera);
        const hits = raycaster.intersectObjects(nodes, false);
        const next = hits.length ? Number(hits[0].object.userData.index) : null;
        if (next !== hoveredRef.current) {
          hoveredRef.current = next;
          setHovered(next);
        }
      }

      renderer.render(scene, camera);
      updateLabels();
    }

    function loop(now: number) {
      raf = requestAnimationFrame(loop);
      const delta = Math.min((now - lastFrame) / 1000, 0.05);
      lastFrame = now;
      draw(now, delta);
    }

    function start() {
      if (running || reduced) return;
      running = true;
      lastFrame = performance.now();
      raf = requestAnimationFrame(loop);
    }

    function stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }

    // ── Pointeur ────────────────────────────────────────────────
    function onPointerMove(event: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      pointerNdc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointerNdc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      mouse.targetX = pointerNdc.x;
      mouse.targetY = pointerNdc.y;
      pointerInside = true;
      pointerDirty = true;
      if (reduced) draw(performance.now(), 0);
    }

    function onPointerLeave() {
      pointerInside = false;
      mouse.targetX = 0;
      mouse.targetY = 0;
      if (hoveredRef.current !== null) {
        hoveredRef.current = null;
        setHovered(null);
      }
      if (reduced) draw(performance.now(), 0);
    }

    function onClick() {
      const index = hoveredRef.current;
      if (index === null) return;
      const stage = stagesRef.current?.[index];
      if (stage) navigateRef.current(stage.route);
    }

    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerleave', onPointerLeave);
    canvas.addEventListener('click', onClick);

    const resizeObserver = new ResizeObserver(() => resize());
    resizeObserver.observe(container);
    resize();

    engineRef.current = {
      start,
      stop,
      refresh: () => draw(performance.now(), 0),
    };

    // ── Nettoyage strict : aucune dérive mémoire après des heures ──
    return () => {
      stop();
      engineRef.current = null;
      resizeObserver.disconnect();
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerleave', onPointerLeave);
      canvas.removeEventListener('click', onClick);

      nodeGeometry.dispose();
      conduitGeometry.dispose();
      particleGeometry.dispose();
      nodeMaterials.forEach((m) => m.dispose());
      conduitMaterials.forEach((m) => m.dispose());
      particleMaterial.dispose();
      particleMesh.dispose();
      scene.clear();
      renderer.dispose();
    };
  }, [useWebGL, reduced]);

  // Boucle suspendue hors viewport et onglet masqué.
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    if (renderable) engine.start();
    else engine.stop();
  }, [renderable, useWebGL]);

  // Sous prefers-reduced-motion il n'y a pas de boucle : on redessine
  // ponctuellement pour refléter l'arrivée des données.
  const countSignature = stages.map((s) => s.count).join(',');
  useEffect(() => {
    if (!reduced) return;
    engineRef.current?.refresh();
  }, [reduced, ready, countSignature, hovered]);

  if (supported === null) {
    return <div className="h-[280px]" aria-hidden="true" />;
  }

  if (!useWebGL) {
    return <ValueChainFallback stages={stages} />;
  }

  return (
    <div
      ref={containerRef}
      className="relative h-[280px] w-full mz-enter"
      style={{ '--enter-delay': `${enterDelay}ms` } as CSSProperties}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Libellés et compteurs : HTML au-dessus du canvas, jamais dans la scène. */}
      <div className="absolute inset-0">
        {stages.map((stage, index) => {
          const active = stage.count > 0;
          const isHovered = hovered === index;

          return (
            <button
              key={stage.key}
              type="button"
              ref={(node) => {
                labelRefs.current[index] = node;
              }}
              onClick={() => navigate(stage.route)}
              onFocus={() => {
                hoveredRef.current = index;
                setHovered(index);
              }}
              onBlur={() => {
                if (hoveredRef.current === index) hoveredRef.current = null;
                setHovered((current) => (current === index ? null : current));
              }}
              title={`${stage.label} — ${stage.count} ${stage.detail}`}
              className="absolute top-0 left-0 flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg min-w-[56px] min-h-[40px] transition-colors duration-200 hover:bg-deep/50"
            >
              <span
                className={`text-sm font-extrabold tabular-nums transition-colors duration-200 ${
                  active ? 'text-copper-light' : 'text-subtle'
                }`}
              >
                {stage.count}
              </span>
              <span
                className={`text-[10px] uppercase tracking-[0.12em] transition-colors duration-200 ${
                  isHovered ? 'text-ivory' : active ? 'text-muted' : 'text-subtle'
                }`}
              >
                {stage.label}
              </span>
              {isHovered && <span className="text-[10px] text-subtle whitespace-nowrap">{stage.detail}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
