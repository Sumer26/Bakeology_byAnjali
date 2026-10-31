import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';



export function createCakeScene(
  host,
  onPlace,
  onMove,
  onReject = () => {}
) {

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
    // Separate material lets piping contrast with the cake icing.
        const piping = icing.clone();
        piping.roughness = 0.68;
        piping.bumpScale = 0.012;

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

  const pearlMaterial = new THREE.MeshPhysicalMaterial({
  color: '#fff2db',
  roughness: 0.24,
  metalness: 0.12,
  clearcoat: 0.6
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
    let messageKey = '';
    let decorationKey = '';
    let pointerStart = null;

    const defaultSprinkleColours = [
    '#fff2d8',
    '#cc7894',
    '#b5bb8d',
    '#cdb4d4',
    '#7a4932'
    ];

    // Only accept full hexadecimal colours from saved/shared designs.
    function validColour(value, fallback) {
    return typeof value === 'string' &&
        /^#[0-9a-f]{6}$/i.test(value)
        ? value
        : fallback;
    }

    function appearanceSettings() {
    const value = state?.appearance;

    return value && typeof value === 'object' &&
        !Array.isArray(value)
        ? value
        : {};
    }

    function messageColour() {
    const appearance = appearanceSettings();

    // Default lettering contrasts with the actual visible cake top.
    const topColour = state.finish.toLowerCase().includes('drip')
        ? chocolate.color
        : icing.color;

    const brightness =
        topColour.r * 0.2126 +
        topColour.g * 0.7152 +
        topColour.b * 0.0722;

    return validColour(
        appearance.messageColour,
        brightness < 0.35 ? '#fff1ce' : '#653a2b'
    );
    }

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

  function addTier(shape, base, height, tier, radius) {
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

  const metadata = { tier, radius, base, height };

  const body = mesh(geometry, icing);
  body.position.y = base + 0.04;
  body.userData.surface = metadata;

  if (state.finish === 'Piping') {
    shape.getSpacedPoints(58).slice(0, -1).forEach(point => {
      const pip = mesh(
        new THREE.SphereGeometry(0.078, 16, 12),
        piping
        );

      pip.position.set(
        point.x,
        base + height + 0.035,
        -point.y
      );

      pip.scale.y = 0.68;

      const lower = mesh(
        new THREE.SphereGeometry(0.055, 12, 10),
        piping
        );

      lower.position.set(point.x, base + 0.05, -point.y);
      lower.scale.y = 0.7;
    });
  }

  if (state.finish.toLowerCase().includes('drip')) {
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
    cap.userData.surface = metadata;
    cap.userData.cap = true;

    shape.getSpacedPoints(24).slice(0, -1).forEach((point, index) => {
      const length = 0.09 + (Math.sin(index * 8.7) + 1) * 0.075;

      const drip = mesh(
        new THREE.CapsuleGeometry(0.035, length, 6, 12),
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

    addTier(outline(state.shape, 1.5), 0.07, tierHeight, 0, 1.5);

    topY = 0.07 + tierHeight;
    topRadius = 1.5;

    if (state.tiers === 'Two') {
      topRadius = 1.02;
      addTier(
        outline(state.shape, topRadius),
        topY,
        0.78,
        1,
        topRadius
        );
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

    context.fillStyle = messageColour();

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
      const placement = placementWorld(item);

        group.position.copy(placement.point);

        if (item.surface === 'side') {
        group.quaternion.setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            placement.normal
        );
        }

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
        } else if (item.type === 'Pearls') {
        const pearl = mesh(
            new THREE.SphereGeometry(0.035, 18, 14),
            pearlMaterial,
            group
        );

        pearl.position.y = 0.025;

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

  const appearance = appearanceSettings();

  const icingColour = validColour(
    appearance.icingColour,
    validColour(colour, '#f1e2c8')
  );

  const dripColours = {
    'Chocolate drip': '#381c13',
    'White chocolate drip': '#f3dfb6',
    'Caramel drip': '#b66b2e'
  };

  icing.color.set(icingColour);

  piping.color.set(
    validColour(appearance.pipingColour, icingColour)
  );

  chocolate.color.set(
    validColour(
      appearance.dripColour,
      dripColours[state.finish] || '#381c13'
    )
  );

  cherryMaterial.color.set(
    validColour(appearance.cherryColour, '#8f1223')
  );

  waxMaterial.color.set(
    validColour(appearance.candleColour, '#fff0cf')
  );

  pearlMaterial.color.set(
    validColour(appearance.pearlColour, '#fff2db')
  );

  // No custom colour means the original multicolour sprinkle mix.
  const sprinkleColour = validColour(
    appearance.sprinkleColour,
    null
  );

  sprinkleMaterials.forEach((material, index) => {
    material.color.set(
      sprinkleColour || defaultSprinkleColours[index]
    );
  });

  const nextGeometryKey = JSON.stringify([
    state.shape,
    state.tiers,
    state.finish
  ]);

  const geometryChanged = nextGeometryKey !== geometryKey;

  if (geometryChanged) {
    rebuildCake();
    geometryKey = nextGeometryKey;
  }

  const nextMessageKey = JSON.stringify([
    state.message,
    topY,
    topRadius,
    messageColour()
  ]);

  if (geometryChanged || nextMessageKey !== messageKey) {
    rebuildMessage();
    messageKey = nextMessageKey;
  }

  const nextDecorationKey = JSON.stringify([
    state.shape,
    state.tiers,
    state.finish,
    state.placements || []
  ]);

  if (geometryChanged || nextDecorationKey !== decorationKey) {
    rebuildDecorations();
    decorationKey = nextDecorationKey;
  }
}

  function view(nextMode = 'rotate') {
  const sideView = nextMode === 'side';

  mode = sideView ? 'decorate' : nextMode;
  host.dataset.mode = mode;

  const target = new THREE.Vector3(
    0,
    sideView ? topY * 0.45 : mode === 'rotate' ? topY * 0.48 : topY,
    0
  );

  let position;

  if (sideView) {
    const direction = camera.position.clone().sub(controls.target);
    direction.y = 0;

    if (direction.lengthSq() < 0.01) direction.set(0, 0, 1);

    direction.normalize().multiplyScalar(5.8);
    position = target.clone().add(direction);
    position.y += 0.7;
  } else if (mode === 'rotate') {
    position = new THREE.Vector3(3.7, 4.2, 6.4);
    position.sub(target).normalize().multiplyScalar(8.2).add(target);
  } else {
    position = new THREE.Vector3(
      0,
      target.y + (mode === 'write' ? 4.1 : 5.3),
      0.8
    );
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

  function tierInfo(tier) {
  const lowerHeight = state.tiers === 'Two' ? 0.82 : 1.05;

  return tier === 1 && state.tiers === 'Two'
    ? { radius: 1.02, base: 0.07 + lowerHeight, height: 0.78 }
    : { radius: 1.5, base: 0.07, height: lowerHeight };
}

function placementWorld(item) {
  // Older saved decorations belong to the uppermost tier.
  const tier = item.tier ?? (state.tiers === 'Two' ? 1 : 0);
  const info = tierInfo(tier);
  const side = item.surface === 'side';

  const normal = side
    ? new THREE.Vector3(item.nx, 0, item.nz).normalize()
    : new THREE.Vector3(0, 1, 0);

  const point = new THREE.Vector3(
    item.x * info.radius,
    side
      ? info.base + item.y * info.height
      : info.base + info.height + 0.045,
    item.z * info.radius
  );

  if (side) point.addScaledVector(normal, 0.012);

  return { point, normal };
}

function decorationRadius(type) {
  return {
    Cherries: 0.11,
    Candles: 0.05,
    Pearls: 0.045,
    Sprinkles: 0.075
  }[type] || 0.08;
}

function distanceToEdge(point, shape) {
  const points = shape.getPoints(80);
  let closest = Infinity;

  const p = new THREE.Vector2(point.x, -point.z);

  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    const ab = b.clone().sub(a);
    const denominator = ab.lengthSq();

    const t = denominator
      ? THREE.MathUtils.clamp(p.clone().sub(a).dot(ab) / denominator, 0, 1)
      : 0;

    closest = Math.min(
      closest,
      p.distanceTo(a.clone().addScaledVector(ab, t))
    );
  }

  return closest;
}

function hitSurface(event, type, ignoreIndex) {
  setRay(event);
  scene.updateMatrixWorld(true);

  // First visible cake surface wins. Piping and hanging drips
  // intentionally have no placement metadata.
  const hit = raycaster.intersectObjects(cake.children, true)[0];

  if (!hit) return { error: 'Place the decoration on the cake.' };

  const info = hit.object.userData.surface;

  if (!info) {
    return { error: 'Leave the piping and hanging drips clear.' };
  }

  const normal = hit.face.normal.clone()
    .transformDirection(hit.object.matrixWorld);

  const isTop = normal.y > 0.9;
  const isSide = Math.abs(normal.y) < 0.15;

  if (!isTop && !isSide) {
    return { error: 'Move a little away from the rounded edge.' };
  }

  if (isSide && !['Pearls', 'Sprinkles'].includes(type)) {
    return { error: 'Cherries and candles need a flat top. Use pearls or sprinkles on the sides.' };
  }

  if (isSide && hit.object.userData.cap) {
    return { error: 'Keep the edge of the drip coating clear.' };
  }

  const radius = decorationRadius(type);
  const localHeight = hit.point.y - info.base;

  if (isTop) {
    const border = state.finish === 'Piping' ? 0.11 : 0.035;

    if (
      distanceToEdge(
        hit.point,
        outline(state.shape, info.radius)
      ) < radius + border
    ) {
      return { error: 'Move inward so the decoration clears the edge and border.' };
    }

    // Reserve space around the upper tier when placing on the lower tier.
    if (info.tier === 0 && state.tiers === 'Two') {
      if (
        distanceToEdge(
          hit.point,
          outline(state.shape, 1.02)
        ) < radius + 0.1
      ) {
        return { error: 'Leave a little space around the upper tier.' };
      }
    }

    // Keep the message area clear on the uppermost tier.
    const highestTier = state.tiers === 'Two' ? 1 : 0;

    if (
      state.message.trim() &&
      info.tier === highestTier &&
      Math.abs(hit.point.x) < info.radius * 0.7 + radius &&
      Math.abs(hit.point.z) < info.radius * 0.263 + radius
    ) {
      return { error: 'This space is reserved for your message.' };
    }
  } else {
    const topClearance = state.finish.toLowerCase().includes('drip')
      ? 0.33
      : state.finish === 'Piping' ? 0.14 : 0.07;

    if (
      localHeight < radius + 0.09 ||
      localHeight > info.height - topClearance - radius
    ) {
      return { error: 'Place side decorations between the bottom border and the top finish.' };
    }
  }

  const horizontalNormal = new THREE.Vector3(normal.x, 0, normal.z);

  if (horizontalNormal.lengthSq()) horizontalNormal.normalize();

  const placement = {
    type,
    tier: info.tier,
    surface: isTop ? 'top' : 'side',
    x: hit.point.x / info.radius,
    z: hit.point.z / info.radius,
    y: isTop ? 1 : localHeight / info.height,
    nx: isTop ? 0 : horizontalNormal.x,
    nz: isTop ? 0 : horizontalNormal.z
  };

  const world = placementWorld(placement);

  const overlaps = state.placements.some((item, index) => {
    if (index === ignoreIndex) return false;

    return placementWorld(item).point.distanceTo(world.point) <
      radius + decorationRadius(item.type);
  });

  if (overlaps) {
    return { error: 'Leave a little space between decorations.' };
  }

  return { placement, world };
}

renderer.domElement.addEventListener('pointerdown', event => {
  if (mode !== 'decorate' || transition || !event.isPrimary) return;

  setRay(event);
  scene.updateMatrixWorld(true);

  const decorationHit =
    raycaster.intersectObjects(decorations.children, true)[0];

  const cakeHit = raycaster.intersectObjects(cake.children, true)[0];

  let object = decorationHit &&
    (!cakeHit || decorationHit.distance <= cakeHit.distance + 0.02)
      ? decorationHit.object
      : null;

  while (object && object.parent !== decorations) {
    object = object.parent;
  }

  pointerStart = {
    id: event.pointerId,
    x: event.clientX,
    y: event.clientY,
    index: object?.userData.index,
    result: null
  };

  renderer.domElement.setPointerCapture(event.pointerId);
});

renderer.domElement.addEventListener('pointermove', event => {
  if (!pointerStart || pointerStart.id !== event.pointerId) return;
  if (pointerStart.index === undefined) return;

  const item = state.placements[pointerStart.index];

  const result = hitSurface(
    event,
    item.type,
    pointerStart.index
  );

  pointerStart.result = result;

  if (!result.placement) return;

  const object = decorations.children[pointerStart.index];

  object.position.copy(result.world.point);
  object.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    result.world.normal
  );
});

renderer.domElement.addEventListener('pointerup', event => {
  if (!pointerStart || pointerStart.id !== event.pointerId) return;

  const start = pointerStart;
  pointerStart = null;

  if (renderer.domElement.hasPointerCapture(event.pointerId)) {
    renderer.domElement.releasePointerCapture(event.pointerId);
  }

  if (start.index !== undefined) {
    if (start.result?.placement) {
      const p = start.result.placement;
      onMove(start.index, p.x, p.z, p);
    } else {
      rebuildDecorations();
      if (start.result?.error) onReject?.(start.result.error);
    }
    return;
  }

  if (
    Math.hypot(event.clientX - start.x, event.clientY - start.y) > 10
  ) return;

  if (!['Cherries', 'Candles', 'Sprinkles', 'Pearls'].includes(state.topping)) {
    onReject?.('Choose a topping first.');
    return;
  }

  const result = hitSurface(event, state.topping);

  if (!result.placement) {
    onReject?.(result.error);
    return;
  }

  const p = result.placement;
  onPlace(p.x, p.z, p);
});

renderer.domElement.addEventListener('pointercancel', () => {
  pointerStart = null;
  rebuildDecorations();
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

  function capture() {
  // Render immediately before copying the WebGL canvas.
  renderer.render(scene, camera);

  const canvas = document.createElement('canvas');
  canvas.width = renderer.domElement.width;
  canvas.height = renderer.domElement.height;

  const context = canvas.getContext('2d');

  context.fillStyle = '#eee7dc';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(renderer.domElement, 0, 0);

  return canvas.toDataURL('image/png');
}

return { update, view, capture };

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