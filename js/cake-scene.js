import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function createCakeScene(host, onPlace, onMove) {
  const scene = new THREE.Scene();

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });

  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  host.replaceChildren(renderer.domElement);

  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 60);
  const controls = new OrbitControls(camera, renderer.domElement);

  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.minPolarAngle = 0.08;
  controls.maxPolarAngle = Math.PI / 2 - 0.08;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

  scene.add(new THREE.HemisphereLight('#fff6e7', '#8a7464', 2.2));

  const key = new THREE.DirectionalLight('#fff6e8', 4);
  key.position.set(-3, 7, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -4;
  key.shadow.camera.right = 4;
  key.shadow.camera.top = 5;
  key.shadow.camera.bottom = -4;
  key.shadow.normalBias = 0.025;
  key.shadow.bias = -0.0002;
  key.shadow.radius = 4;
  scene.add(key);

  const fill = new THREE.DirectionalLight('#e3ebff', 1.5);
  fill.position.set(4, 3, -3);
  scene.add(fill);

  const cake = new THREE.Group();
  const decorations = new THREE.Group();
  scene.add(cake, decorations);

  const icingTexture = makeIcingTexture();

  const icing = new THREE.MeshPhysicalMaterial({
    color: '#f1e2c8',
    roughness: 0.77,
    bumpMap: icingTexture,
    bumpScale: 0.018,
    clearcoat: 0.05
  });

  const chocolate = new THREE.MeshPhysicalMaterial({
    color: '#381c13',
    roughness: 0.3,
    clearcoat: 0.4,
    clearcoatRoughness: 0.3
  });

  const cherryMaterial = new THREE.MeshPhysicalMaterial({
    color: '#8f1223',
    roughness: 0.25,
    clearcoat: 0.7,
    clearcoatRoughness: 0.2
  });

  const stemMaterial = new THREE.MeshStandardMaterial({
    color: '#4b4220',
    roughness: 0.85
  });

  const waxMaterial = new THREE.MeshPhysicalMaterial({
    color: '#fff0cf',
    roughness: 0.5
  });

  const wickMaterial = new THREE.MeshStandardMaterial({
    color: '#33271f'
  });

  const sprinkleMaterials = [
    '#fff2d8', '#cc7894', '#b5bb8d', '#cdb4d4', '#7a4932'
  ].map(color => new THREE.MeshStandardMaterial({
    color,
    roughness: 0.5
  }));

  const plate = new THREE.Mesh(
    new THREE.CylinderGeometry(2.18, 2.12, 0.1, 96),
    new THREE.MeshPhysicalMaterial({
      color: '#f8f0df',
      roughness: 0.3,
      clearcoat: 0.3
    })
  );

  plate.position.y = 0.01;
  plate.receiveShadow = true;
  plate.castShadow = true;
  scene.add(plate);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 30),
    new THREE.ShadowMaterial({ opacity: 0.15 })
  );

  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.05;
  floor.receiveShadow = true;
  scene.add(floor);

  let state;
  let surface;
  let lettering;
  let topY = 1.1;
  let topRadius = 1.5;
  let mode = 'rotate';
  let transition = null;
  let geometryKey = '';
  let pointerStart = null;

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  function mesh(geometry, material, parent = cake) {
    const object = new THREE.Mesh(geometry, material);
    object.castShadow = true;
    object.receiveShadow = true;
    parent.add(object);
    return object;
  }

  function clearGroup(group) {
    group.traverse(object => {
      if (object.isMesh) object.geometry.dispose();
    });
    group.clear();
  }

  function outline(type, radius) {
    const shape = new THREE.Shape();

    if (type === 'Heart') {
      shape.moveTo(0, -radius);
      shape.bezierCurveTo(
        -0.3 * radius, -0.65 * radius,
        -radius, -0.15 * radius,
        -radius, 0.38 * radius
      );
      shape.bezierCurveTo(
        -radius, radius,
        -0.25 * radius, 1.13 * radius,
        0, 0.58 * radius
      );
      shape.bezierCurveTo(
        0.25 * radius, 1.13 * radius,
        radius, radius,
        radius, 0.38 * radius
      );
      shape.bezierCurveTo(
        radius, -0.15 * radius,
        0.3 * radius, -0.65 * radius,
        0, -radius
      );
    } else if (type === 'Square') {
      const r = radius * 0.82;
      const corner = radius * 0.14;

      shape.moveTo(-r + corner, -r);
      shape.lineTo(r - corner, -r);
      shape.quadraticCurveTo(r, -r, r, -r + corner);
      shape.lineTo(r, r - corner);
      shape.quadraticCurveTo(r, r, r - corner, r);
      shape.lineTo(-r + corner, r);
      shape.quadraticCurveTo(-r, r, -r, r - corner);
      shape.lineTo(-r, -r + corner);
      shape.quadraticCurveTo(-r, -r, -r + corner, -r);
    } else {
      shape.absarc(0, 0, radius, 0, Math.PI * 2, false);
    }

    return shape;
  }

  function addTier(shape, base, height) {
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: height - 0.08,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.035,
      bevelSegments: 4,
      steps: 1,
      curveSegments: 40
    });

    geometry.rotateX(-Math.PI / 2);

    const body = mesh(geometry, icing);
    body.position.y = base + 0.04;

    if (state.finish === 'Piping') {
      const points = shape.getSpacedPoints(58);

      points.slice(0, -1).forEach((point, index) => {
        const pip = mesh(
          new THREE.SphereGeometry(0.078, 12, 8),
          icing
        );

        pip.position.set(point.x, base + height + 0.035, -point.y);
        pip.scale.set(1, 0.68, 1);
        pip.rotation.y = index * 0.8;

        const lower = mesh(
          new THREE.SphereGeometry(0.055, 10, 8),
          icing
        );

        lower.position.set(point.x, base + 0.05, -point.y);
        lower.scale.y = 0.7;
      });
    }

    if (state.finish === 'Chocolate drip') {
      const capGeometry = new THREE.ExtrudeGeometry(shape, {
        depth: 0.025,
        bevelEnabled: true,
        bevelThickness: 0.015,
        bevelSize: 0.025,
        bevelSegments: 3,
        curveSegments: 40
      });

      capGeometry.rotateX(-Math.PI / 2);

      const cap = mesh(capGeometry, chocolate);
      cap.position.y = base + height;

      const edge = shape.getSpacedPoints(24);

      edge.slice(0, -1).forEach((point, index) => {
        const length = 0.09 + (Math.sin(index * 8.7) + 1) * 0.075;

        const drip = mesh(
          new THREE.CapsuleGeometry(0.035, length, 4, 8),
          chocolate
        );

        drip.position.set(
          point.x * 1.012,
          base + height - length / 2,
          -point.y * 1.012
        );
      });
    }
  }

  function rebuildCake() {
    clearGroup(cake);

    const tierHeight = state.tiers === 'Two' ? 0.82 : 1.05;

    addTier(outline(state.shape, 1.5), 0.07, tierHeight);

    topY = 0.07 + tierHeight;
    topRadius = 1.5;

    if (state.tiers === 'Two') {
      topRadius = 1.02;
      addTier(outline(state.shape, topRadius), topY, 0.78);
      topY += 0.78;
    }

    const surfaceGeometry = new THREE.ShapeGeometry(
      outline(state.shape, topRadius * 0.91),
      40
    );

    surfaceGeometry.rotateX(-Math.PI / 2);

    if (surface) {
      scene.remove(surface);
      surface.geometry.dispose();
      surface.material.dispose();
    }

    surface = new THREE.Mesh(
      surfaceGeometry,
      new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthWrite: false,
        side: THREE.DoubleSide
      })
    );

    surface.position.y = topY + 0.045;
    scene.add(surface);
  }

  function rebuildMessage() {
    if (lettering) {
      scene.remove(lettering);
      lettering.geometry.dispose();
      lettering.material.map.dispose();
      lettering.material.dispose();
      lettering = null;
    }

    if (!state.message.trim()) return;

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 384;

    const context = canvas.getContext('2d');
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    let size = 90;

    do {
      context.font = `italic ${size}px Georgia, serif`;
      if (context.measureText(state.message).width < 900) break;
      size -= 2;
    } while (size > 24);

    context.shadowColor = 'rgba(45, 25, 15, 0.35)';
    context.shadowBlur = 5;
    context.shadowOffsetY = 3;

    context.fillStyle =
      state.finish === 'Chocolate drip' || state.colour === 'Cocoa'
        ? '#fff1ce'
        : '#653a2b';

    context.fillText(state.message, 512, 192);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;

    lettering = new THREE.Mesh(
      new THREE.PlaneGeometry(topRadius * 1.4, topRadius * 0.525),
      new THREE.MeshStandardMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
        roughness: 0.7,
        polygonOffset: true,
        polygonOffsetFactor: -2
      })
    );

    lettering.rotation.x = -Math.PI / 2;
    lettering.position.y = topY + 0.052;
    scene.add(lettering);
  }

  function rebuildDecorations() {
    clearGroup(decorations);

    (state.placements || []).forEach((item, index) => {
      const group = new THREE.Group();
      group.userData.index = index;
      group.position.set(
        item.x * topRadius,
        topY + 0.045,
        item.z * topRadius
      );

      decorations.add(group);

      if (item.type === 'Cherries') {
        const fruit = mesh(
          new THREE.SphereGeometry(0.095, 20, 14),
          cherryMaterial,
          group
        );

        fruit.position.y = 0.085;
        fruit.scale.y = 0.9;

        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(0, 0.16, 0),
          new THREE.Vector3(0.025, 0.26, 0),
          new THREE.Vector3(0.075, 0.32, 0.015)
        ]);

        mesh(
          new THREE.TubeGeometry(curve, 12, 0.009, 6, false),
          stemMaterial,
          group
        );
      } else if (item.type === 'Candles') {
        const candle = mesh(
          new THREE.CylinderGeometry(0.027, 0.03, 0.42, 14),
          waxMaterial,
          group
        );

        candle.position.y = 0.21;

        const wick = mesh(
          new THREE.CylinderGeometry(0.004, 0.004, 0.04, 6),
          wickMaterial,
          group
        );

        wick.position.y = 0.44;
      } else if (item.type === 'Sprinkles') {
        // A repeatable little scatter; it does not jump when redrawn.
        for (let i = 0; i < 9; i++) {
          const angle = i * 2.399;
          const radius = 0.015 * Math.sqrt(i);

          const sprinkle = mesh(
            new THREE.CapsuleGeometry(0.009, 0.034, 2, 6),
            sprinkleMaterials[i % sprinkleMaterials.length],
            group
          );

          sprinkle.position.set(
            Math.cos(angle) * radius,
            0.014,
            Math.sin(angle) * radius
          );

          sprinkle.rotation.set(Math.PI / 2, 0, angle);
        }
      }
    });
  }

  function update(nextState, colour) {
    state = nextState;
    icing.color.set(colour);

    const nextKey = [
      state.shape, state.tiers, state.finish
    ].join('|');

    if (nextKey !== geometryKey) {
      geometryKey = nextKey;
      rebuildCake();
    }

    rebuildMessage();
    rebuildDecorations();
  }

  function view(nextMode = 'rotate') {
    mode = nextMode;
    host.dataset.mode = mode;

    const target = new THREE.Vector3(
      0,
      mode === 'rotate' ? topY * 0.48 : topY,
      0
    );

    const distance = mode === 'rotate'
      ? 8.2
      : mode === 'write' ? 4.1 : 4.9;

    const position = mode === 'rotate'
      ? new THREE.Vector3(3.7, 4.2, 6.4)
      : new THREE.Vector3(0, target.y + distance, 0.8);

    if (mode === 'rotate') {
      position.sub(target).normalize().multiplyScalar(distance).add(target);
    }

    transition = {
      start: performance.now(),
      position: camera.position.clone(),
      target: controls.target.clone(),
      endPosition: position,
      endTarget: target
    };

    controls.enabled = false;
  }

  function setRay(event) {
    const bounds = renderer.domElement.getBoundingClientRect();

    pointer.set(
      ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
      -((event.clientY - bounds.top) / bounds.height) * 2 + 1
    );

    raycaster.setFromCamera(pointer, camera);
  }

  function hitSurface(event) {
    setRay(event);
    return raycaster.intersectObject(surface)[0]?.point;
  }

  renderer.domElement.addEventListener('pointerdown', event => {
    if (mode !== 'decorate' || transition || !event.isPrimary) return;

    setRay(event);

    const hit = raycaster.intersectObjects(decorations.children, true)[0];
    let object = hit?.object;

    while (object && object.parent !== decorations) {
      object = object.parent;
    }

    pointerStart = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      index: object?.userData.index,
      point: null
    };

    renderer.domElement.setPointerCapture(event.pointerId);
  });

  renderer.domElement.addEventListener('pointermove', event => {
    if (!pointerStart || pointerStart.id !== event.pointerId) return;
    if (pointerStart.index === undefined) return;

    const point = hitSurface(event);
    if (!point) return;

    pointerStart.point = point;

    const decoration = decorations.children[pointerStart.index];
    decoration.position.x = point.x;
    decoration.position.z = point.z;
  });

  renderer.domElement.addEventListener('pointerup', event => {
    if (!pointerStart || pointerStart.id !== event.pointerId) return;

    const start = pointerStart;
    pointerStart = null;

    if (renderer.domElement.hasPointerCapture(event.pointerId)) {
      renderer.domElement.releasePointerCapture(event.pointerId);
    }

    if (start.index !== undefined && start.point) {
      onMove(
        start.index,
        start.point.x / topRadius,
        start.point.z / topRadius
      );
      return;
    }

    if (start.index !== undefined) return;

    const moved = Math.hypot(
      event.clientX - start.x,
      event.clientY - start.y
    );

    if (moved > 10) return;

    const point = hitSurface(event);

    if (point) {
      onPlace(point.x / topRadius, point.z / topRadius);
    }
  });

  renderer.domElement.addEventListener('pointercancel', () => {
    pointerStart = null;
    if (state) rebuildDecorations();
  });

  function resize() {
    const width = host.clientWidth;
    const height = host.clientHeight;

    if (!width || !height) return;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }

  const observer = new ResizeObserver(resize);
  observer.observe(host);

  camera.position.set(3.7, 4.2, 6.4);
  controls.target.set(0, 0.6, 0);
  controls.update();
  resize();

  renderer.setAnimationLoop(() => {
    if (transition) {
      const elapsed = performance.now() - transition.start;
      const t = reducedMotion.matches ? 1 : Math.min(elapsed / 850, 1);
      const eased = t * t * (3 - 2 * t);

      camera.position.lerpVectors(
        transition.position,
        transition.endPosition,
        eased
      );

      controls.target.lerpVectors(
        transition.target,
        transition.endTarget,
        eased
      );

      if (t === 1) {
        transition = null;
        controls.enabled = mode === 'rotate';
      }
    }

    controls.update();
    renderer.render(scene, camera);
  });

  return { update, view };
}

function makeIcingTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;

  const context = canvas.getContext('2d');
  const pixels = context.createImageData(256, 256);

  for (let y = 0; y < 256; y++) {
    for (let x = 0; x < 256; x++) {
      const index = (y * 256 + x) * 4;
      const grain = Math.random() * 18;
      const streak = Math.sin(y * 0.65 + Math.sin(x * 0.03)) * 7;
      const value = 128 + grain + streak;

      pixels.data[index] = value;
      pixels.data[index + 1] = value;
      pixels.data[index + 2] = value;
      pixels.data[index + 3] = 255;
    }
  }

  context.putImageData(pixels, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

  return texture;
}