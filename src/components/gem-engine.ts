import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { brilliantVertices } from "@/lib/gem-geometry";
export type GemOptions = {
  dark: boolean;
  quiet: boolean;
  finish: "rose" | "ice";
};
export function mountGem(
  host: HTMLElement,
  initial: GemOptions,
  onFailure: () => void,
) {
  let options = initial,
    visible = true,
    disposed = false,
    dragging = false,
    lastX = 0,
    lastY = 0,
    targetY = 0.45,
    targetX = 0.24,
    turn = 0,
    previous = 0;
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setClearColor(0, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  const canvas = renderer.domElement;
  canvas.setAttribute("aria-hidden", "true");
  host.appendChild(canvas);
  const scene = new THREE.Scene(),
    camera = new THREE.PerspectiveCamera(36, 1, 0.1, 30);
  camera.position.set(0, 0.68, 5.15);
  camera.lookAt(0, -0.12, 0);
  const pmrem = new THREE.PMREMGenerator(renderer),
    room = new RoomEnvironment();
  // Studio light cards reflected across the cut faces, with no network HDR assets.
  const cardGeo = new THREE.PlaneGeometry(2, 5),
    cardMat = new THREE.MeshBasicMaterial({ color: 0xffe8d4 });
  const card = new THREE.Mesh(cardGeo, cardMat);
  card.position.set(-4, 1, 1);
  card.lookAt(0, 0, 0);
  room.add(card);
  const env = pmrem.fromScene(room, 0.025);
  scene.environment = env.texture;
  const geo = new THREE.BufferGeometry();
  geo.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(brilliantVertices(), 3),
  );
  geo.computeVertexNormals();
  const material = new THREE.MeshPhysicalMaterial({
    color: 0xe575a5,
    metalness: 0.48,
    roughness: 0.035,
    transmission: 0.2,
    thickness: 1.5,
    ior: 2.3,
    clearcoat: 1,
    clearcoatRoughness: 0.015,
    envMapIntensity: 1.7,
    dispersion: 0.12,
    attenuationColor: 0xee8aad,
    attenuationDistance: 1.8,
    flatShading: true,
  });
  const gem = new THREE.Mesh(geo, material),
    group = new THREE.Group();
  group.add(gem);
  group.rotation.set(targetX, targetY, -0.12);
  scene.add(group);
  const edgesGeo = new THREE.EdgesGeometry(geo, 12),
    edgeMat = new THREE.LineBasicMaterial({
      color: 0xffebf4,
      transparent: true,
      opacity: 0.12,
    });
  group.add(new THREE.LineSegments(edgesGeo, edgeMat));
  const key = new THREE.DirectionalLight(0xfff0dd, 1.4);
  key.position.set(-3, 4, 3);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xc5c9ff, 1.5);
  rim.position.set(3, 1, -2);
  scene.add(rim);
  const fill = new THREE.PointLight(0xff6f9e, 6, 10);
  fill.position.set(-2, -1, 2);
  scene.add(fill);
  scene.add(new THREE.AmbientLight(0xffffff, 0.25));
  const render = () => {
    if (!disposed && visible && !document.hidden)
      renderer.render(scene, camera);
  };
  const update = (next: GemOptions) => {
    if (next.quiet !== options.quiet) {
      targetY = group.rotation.y;
      targetX = group.rotation.x;
      turn = 0;
    }
    options = next;
    material.color.set(
      next.finish === "rose"
        ? next.dark
          ? 0xe575a5
          : 0xe575a5
        : next.dark
          ? 0x8eb9ed
          : 0x8eb9ed,
    );
    material.attenuationColor.set(next.finish === "rose" ? 0xee8aad : 0x88b9e9);
    material.envMapIntensity = next.dark ? 1.1 : 1.2;
    renderer.toneMappingExposure = next.dark ? 0.8 : 0.85;
    render();
  };
  const resize = () => {
    const r = host.getBoundingClientRect();
    if (!r.width || !r.height) return;
    camera.aspect = r.width / r.height;
    camera.updateProjectionMatrix();
    renderer.setSize(r.width, r.height, false);
    render();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  const intersection = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) render();
  });
  intersection.observe(host);
  const down = (e: PointerEvent) => {
    if (e.button !== 0) return;
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    host.setPointerCapture(e.pointerId);
    host.dataset.dragging = "true";
  };
  const move = (e: PointerEvent) => {
    if (!dragging) return;
    targetY += (e.clientX - lastX) * 0.012;
    targetX = THREE.MathUtils.clamp(
      targetX + (e.clientY - lastY) * 0.008,
      -0.65,
      0.85,
    );
    lastX = e.clientX;
    lastY = e.clientY;
    if (options.quiet) {
      group.rotation.set(targetX, targetY, -0.12);
      render();
    }
  };
  const up = () => {
    dragging = false;
    host.dataset.dragging = "false";
  };
  const keyboard = (e: KeyboardEvent) => {
    if (
      !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home"].includes(
        e.key,
      )
    )
      return;
    e.preventDefault();
    if (e.key === "Home") {
      targetX = 0.24;
      targetY = 0.45;
      turn = 0;
    } else if (e.key === "ArrowLeft") targetY -= 0.25;
    else if (e.key === "ArrowRight") targetY += 0.25;
    else
      targetX = THREE.MathUtils.clamp(
        targetX + (e.key === "ArrowUp" ? -0.15 : 0.15),
        -0.65,
        0.85,
      );
    group.rotation.set(targetX, targetY, -0.12);
    render();
  };
  const lost = (e: Event) => {
    e.preventDefault();
    renderer.setAnimationLoop(null);
    onFailure();
  };
  host.addEventListener("pointerdown", down);
  host.addEventListener("pointermove", move);
  host.addEventListener("pointerup", up);
  host.addEventListener("pointercancel", up);
  host.addEventListener("keydown", keyboard);
  canvas.addEventListener("webglcontextlost", lost);
  const visibility = () => {
    previous = 0;
    if (!document.hidden) render();
  };
  document.addEventListener("visibilitychange", visibility);
  renderer.setAnimationLoop((time: number) => {
    const dt = previous ? Math.min((time - previous) / 1000, 0.05) : 0;
    previous = time;
    if (options.quiet || !visible || document.hidden) return;
    if (!dragging) turn += dt * 0.16;
    const alpha = 1 - Math.exp(-dt * 8);
    group.rotation.y += (targetY + turn - group.rotation.y) * alpha;
    group.rotation.x += (targetX - group.rotation.x) * alpha;
    group.position.y = Math.sin(time * 0.0007) * 0.045;
    render();
  });
  update(initial);
  resize();
  return {
    update,
    reset() {
      targetX = 0.24;
      targetY = 0.45;
      turn = 0;
      group.rotation.set(targetX, targetY, -0.12);
      render();
    },
    dispose() {
      disposed = true;
      renderer.setAnimationLoop(null);
      observer.disconnect();
      intersection.disconnect();
      host.removeEventListener("pointerdown", down);
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerup", up);
      host.removeEventListener("pointercancel", up);
      host.removeEventListener("keydown", keyboard);
      canvas.removeEventListener("webglcontextlost", lost);
      document.removeEventListener("visibilitychange", visibility);
      geo.dispose();
      material.dispose();
      edgesGeo.dispose();
      edgeMat.dispose();
      env.dispose();
      pmrem.dispose();
      cardGeo.dispose();
      cardMat.dispose();
      room.dispose();
      renderer.dispose();
      canvas.remove();
    },
  };
}
