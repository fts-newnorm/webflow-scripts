import React, { useState, useEffect, useLayoutEffect, useMemo, Suspense, useCallback } from 'https://esm.sh/react@18.2.0';
import { createRoot } from 'https://esm.sh/react-dom@18.2.0/client';
import * as THREE from 'https://esm.sh/three@0.160.0';
import { Canvas } from 'https://esm.sh/@react-three/fiber@8.15.16?external=react,react-dom,three';
import { OrbitControls, Environment, Center, Bounds, useBounds, useGLTF, Html, useProgress, Decal, useTexture } from 'https://esm.sh/@react-three/drei@9.99.0?external=react,react-dom,three,@react-three/fiber';

// --- INJECT CSS ---
const style = document.createElement('style');
style.textContent = `
  #viewer-topbar-steps, #viewer-botbar-steps, #viewer-botbar-done, #viewer-topbar-done, #summary, #intro, #steps { z-index: 100; }
  #steps { scroll-behavior: smooth; }
  @media (min-width: 992px) { #steps { overflow-y: auto; overflow-x: hidden; scroll-snap-type: y mandatory; } #steps > div { scroll-snap-align: center; } }
  @media (max-width: 991px) { #steps { overflow-x: auto; overflow-y: hidden; scroll-snap-type: x mandatory; } #steps > div { scroll-snap-align: center; } }
  .active-swatch { outline: 0.5px solid #000000 !important; outline-offset: 6px; z-index: 10; }
  .color-btn, .w-button, [role="button"] { -webkit-touch-callout: none !important; -webkit-user-select: none !important; user-select: none !important; }
  .fade-element { transition: opacity 0.5s ease; opacity: 1; }
  .fade-out { opacity: 0 !important; pointer-events: none; }
  .hidden-display { display: none !important; }
`;
document.head.appendChild(style);

const MODEL_SCALE = 150; 
const CAMERA_POSITION = [0, 5, 35]; 
const e = React.createElement; 

// --- DATABASE (Updated from your Supabase List) ---
const FILE_DATABASE = {
  "Boom - Nylon": "https://bkcoeqkdrclqeabqwodu.supabase.co/storage/v1/object/public/models/Boom%20-%20Nylon.glb",
  "Boom - Polished Gold": "https://bkcoeqkdrclqeabqwodu.supabase.co/storage/v1/object/public/models/Boom%20-%20Polished%20Gold.glb",
  "Boom - Polished Stainless Steel": "https://bkcoeqkdrclqeabqwodu.supabase.co/storage/v1/object/public/models/Boom%20-%20Polished%20Stainless%20Steel.glb",
  "Bud Compute - Left - Nylon": "https://bkcoeqkdrclqeabqwodu.supabase.co/storage/v1/object/public/models/Bud%20Compute%20-%20Left%20-%20Nylon.glb",
  "Bud Compute - Left - Polished Gold": "https://bkcoeqkdrclqeabqwodu.supabase.co/storage/v1/object/public/models/Bud%20Compute%20-%20Left%20-%20Polished%20Gold.glb",
  "Bud Compute - Left - Polished Stainless Steel Engravable": "https://bkcoeqkdrclqeabqwodu.supabase.co/storage/v1/object/public/models/Bud%20Compute%20-%20Left%20-%20Polished%20Stainless%20Steel%20Engravable.glb",
  "Bud Compute - Left - Polished Stainless Steel": "https://bkcoeqkdrclqeabqwodu.supabase.co/storage/v1/object/public/models/Bud%20Compute%20-%20Left%20-%20Polished%20Stainless%20Steel.glb",
  "Bud Compute - Right - Nylon": "https://bkcoeqkdrclqeabqwodu.supabase.co/storage/v1/object/public/models/Bud%20Compute%20-%20Right%20-%20Nylon.glb",
  "Bud Compute - Right - Polished Gold": "https://bkcoeqkdrclqeabqwodu.supabase.co/storage/v1/object/public/models/Bud%20Compute%20-%20Right%20-%20Polished%20Gold.glb",
  "Bud Compute - Right - Polished Stainless Steel Engravable": "https://bkcoeqkdrclqeabqwodu.supabase.co/storage/v1/object/public/models/Bud%20Compute%20-%20Right%20-%20Polished%20Stainless%20Steel%20Engravable.glb",
  "Bud Compute - Right - Polished Stainless Steel": "https://bkcoeqkdrclqeabqwodu.supabase.co/storage/v1/object/public/models/Bud%20Compute%20-%20Right%20-%20Polished%20Stainless%20Steel.glb",
  "Bud Peripheral - Left - Clear": "https://bkcoeqkdrclqeabqwodu.supabase.co/storage/v1/object/public/models/Bud%20Peripheral%20-%20Left%20-%20Clear.glb",
  "Bud Peripheral - Left - Nylon": "https://bkcoeqkdrclqeabqwodu.supabase.co/storage/v1/object/public/models/Bud%20Peripheral%20-%20Left%20-%20Nylon.glb",
  "Bud Peripheral - Left - Polished Stainless Steel": "https://bkcoeqkdrclqeabqwodu.supabase.co/storage/v1/object/public/models/Bud%20Peripheral%20-%20Left%20-%20Polished%20Stainless%20Steel.glb",
  "Bud Peripheral - Right - Clear": "https://bkcoeqkdrclqeabqwodu.supabase.co/storage/v1/object/public/models/Bud%20Peripheral%20-%20Right%20-%20Clear.glb",
  "Bud Peripheral - Right - Nylon": "https://bkcoeqkdrclqeabqwodu.supabase.co/storage/v1/object/public/models/Bud%20Peripheral%20-%20Right%20-%20Nylon.glb",
  "Bud Peripheral - Right - Polished Stainless Steel": "https://bkcoeqkdrclqeabqwodu.supabase.co/storage/v1/object/public/models/Bud%20Peripheral%20-%20Right%20-%20Polished%20Stainless%20Steel.glb",
  "Bud Power - Left - Nylon": "https://bkcoeqkdrclqeabqwodu.supabase.co/storage/v1/object/public/models/Bud%20Power%20-%20Left%20-%20Nylon.glb",
  "Bud Power - Left - Polished Gold": "https://bkcoeqkdrclqeabqwodu.supabase.co/storage/v1/object/public/models/Bud%20Power%20-%20Left%20-%20Polished%20Gold.glb",
  "Bud Power - Left - Polished Stainless Steel": "https://bkcoeqkdrclqeabqwodu.supabase.co/storage/v1/object/public/models/Bud%20Power%20-%20Left%20-%20Polished%20Stainless%20Steel.glb",
  "Bud Power - Left (Spare) - Nylon": "https://bkcoeqkdrclqeabqwodu.supabase.co/storage/v1/object/public/models/Bud%20Power%20-%20Left%20(Spare)%20-%20Nylon.glb",
  "Bud Power - Left (Spare) - Polished Gold": "https://bkcoeqkdrclqeabqwodu.supabase.co/storage/v1/object/public/models/Bud%20Power%20-%20Left%20(Spare)%20-%20Polished%20Gold.glb",
  "Bud Power - Left (Spare) - Polished Stainless Steel": "https://bkcoeqkdrclqeabqwodu.supabase.co/storage/v1/object/public/models/Bud%20Power%20-%20Left%20(Spare)%20-%20Polished%20Stainless%20Steel.glb",
  "Bud Power - Right - Nylon": "https://bkcoeqkdrclqeabqwodu.supabase.co/storage/v1/object/public/models/Bud%20Power%20-%20Right%20-%20Nylon.glb",
  "Bud Power - Right - Polished Gold": "https://bkcoeqkdrclqeabqwodu.supabase.co/storage/v1/object/public/models/Bud%20Power%20-%20Right%20-%20Polished%20Gold.glb",
  "Bud Power - Right - Polished Stainless Steel": "https://bkcoeqkdrclqeabqwodu.supabase.co/storage/v1/object/public/models/Bud%20Power%20-%20Right%20-%20Polished%20Stainless%20Steel.glb",
  "Bud Power - Right (Spare) - Nylon": "https://bkcoeqkdrclqeabqwodu.supabase.co/storage/v1/object/public/models/Bud%20Power%20-%20Right%20(Spare)%20-%20Nylon.glb",
  "Bud Power - Right (Spare) - Polished Gold": "https://bkcoeqkdrclqeabqwodu.supabase.co/storage/v1/object/public/models/Bud%20Power%20-%20Right%20(Spare)%20-%20Polished%20Gold.glb",
  "Bud Power - Right (Spare) - Polished Stainless Steel": "https://bkcoeqkdrclqeabqwodu.supabase.co/storage/v1/object/public/models/Bud%20Power%20-%20Right%20(Spare)%20-%20Polished%20Stainless%20Steel.glb",
  "Hub Compute - Nylon": "https://bkcoeqkdrclqeabqwodu.supabase.co/storage/v1/object/public/models/Hub%20Compute%20-%20Nylon.glb",
  "Hub Compute - Polished Gold": "https://bkcoeqkdrclqeabqwodu.supabase.co/storage/v1/object/public/models/Hub%20Compute%20-%20Polished%20Gold.glb",
  "Hub Compute - Polished Stainless Steel": "https://bkcoeqkdrclqeabqwodu.supabase.co/storage/v1/object/public/models/Hub%20Compute%20-%20Polished%20Stainless%20Steel.glb",
  "Hub Peripheral Boom - Clear": "https://bkcoeqkdrclqeabqwodu.supabase.co/storage/v1/object/public/models/Hub%20Peripheral%20Boom%20-%20Clear.glb",
  "Hub Peripheral Boom - Grill Left - Polished Stainless Steel": "https://bkcoeqkdrclqeabqwodu.supabase.co/storage/v1/object/public/models/Hub%20Peripheral%20Boom%20-%20Grill%20Left%20-%20Polished%20Stainless%20Steel.glb",
  "Hub Peripheral Boom - Grill Right - Polished Stainless Steel": "https://bkcoeqkdrclqeabqwodu.supabase.co/storage/v1/object/public/models/Hub%20Peripheral%20Boom%20-%20Grill%20Right%20-%20Polished%20Stainless%20Steel.glb",
  "Hub Peripheral Boom - Nylon Embossable": "https://bkcoeqkdrclqeabqwodu.supabase.co/storage/v1/object/public/models/Hub%20Peripheral%20Boom%20-%20Nylon%20Embossable.glb",
  "Hub Peripheral Boom - Nylon": "https://bkcoeqkdrclqeabqwodu.supabase.co/storage/v1/object/public/models/Hub%20Peripheral%20Boom%20-%20Nylon.glb",
  "Hub Peripheral Boom - Polished Stainless Steel": "https://bkcoeqkdrclqeabqwodu.supabase.co/storage/v1/object/public/models/Hub%20Peripheral%20Boom%20-%20Polished%20Stainless%20Steel.glb",
  "Hub Power - Nylon": "https://bkcoeqkdrclqeabqwodu.supabase.co/storage/v1/object/public/models/Hub%20Power%20-%20Nylon.glb",
  "Hub Power - Polished Gold": "https://bkcoeqkdrclqeabqwodu.supabase.co/storage/v1/object/public/models/Hub%20Power%20-%20Polished%20Gold.glb",
  "Hub Power - Polished Stainless Steel": "https://bkcoeqkdrclqeabqwodu.supabase.co/storage/v1/object/public/models/Hub%20Power%20-%20Polished%20Stainless%20Steel.glb",
  "Hub Power (Spare) - Nylon": "https://bkcoeqkdrclqeabqwodu.supabase.co/storage/v1/object/public/models/Hub%20Power%20(Spare)%20-%20Nylon.glb",
  "Hub Power (Spare) - Polished Gold": "https://bkcoeqkdrclqeabqwodu.supabase.co/storage/v1/object/public/models/Hub%20Power%20(Spare)%20-%20Polished%20Gold.glb",
  "Hub Power (Spare) - Polished Stainless Steel": "https://bkcoeqkdrclqeabqwodu.supabase.co/storage/v1/object/public/models/Hub%20Power%20(Spare)%20-%20Polished%20Stainless%20Steel.glb"
};

const MODULE_NAMES = ["Bud Power - Right", "Bud Power - Left", "Bud Compute - Right", "Bud Compute - Left", "Bud Peripheral - Right", "Bud Peripheral - Left", "Hub Power", "Hub Compute", "Hub Peripheral Boom", "Bud Power - Right (Spare)", "Bud Power - Left (Spare)", "Hub Power (Spare)", "Boom"];
const COLORS = { Light: '#dbdbdb', Dark: '#000000', Red: '#f4020b', Blue: '#3b7de1', Yellow: '#f8c441', Green: '#3e623b', Purple: '#a72eae' };
const INITIAL_CONFIG = MODULE_NAMES.reduce((acc, name) => { acc[name] = COLORS.Light; return acc; }, {});

// --- MJF NYLON TEXTURE ---
const useGrainTexture = () => {
  return useMemo(() => {
    const width = 512, height = 512;
    const canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#808080'; ctx.fillRect(0, 0, width, height);
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 120;
      data[i] += noise; data[i + 1] += noise; data[i + 2] += noise;
    }
    ctx.putImageData(imgData, 0, 0);
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(50, 50);
    return texture;
  }, []);
};

function Loader() {
  const { progress } = useProgress();
  return e(Html, { center: true }, e("div", { className: "Paragraph - Center" }, Math.round(progress), "%"));
}

const Rig = ({ visibility, setIsZooming }) => {
  const api = useBounds();
  useEffect(() => {
      setIsZooming(true); 
      const t1 = setTimeout(() => { api.refresh().clip().fit(); }, 10);
      const t2 = setTimeout(() => { setIsZooming(false); }, 1000); 
      return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [visibility, api, setIsZooming]);
  return null;
};

// --- MESH SCANNER ---
function getLocalSurfaceData(mesh) {
    if (!mesh) return null;
    const geometry = mesh.geometry;
    geometry.computeBoundingBox();
    const bbox = geometry.boundingBox;
    const center = new THREE.Vector3();
    bbox.getCenter(center);
    const size = new THREE.Vector3();
    bbox.getSize(size);
    const width = Math.max(size.x, size.y, size.z);
    const normalAttribute = geometry.attributes.normal;
    const avgNormal = new THREE.Vector3();
    if (normalAttribute) {
        for(let i = 0; i < Math.min(normalAttribute.count, 50); i++) { 
            avgNormal.x += normalAttribute.getX(i);
            avgNormal.y += normalAttribute.getY(i);
            avgNormal.z += normalAttribute.getZ(i);
        }
        avgNormal.normalize();
    } else { avgNormal.set(0, 1, 0); }
    const dummy = new THREE.Object3D();
    dummy.position.copy(center);
    dummy.lookAt(center.clone().add(avgNormal)); 
    const rotation = dummy.rotation.clone();
    return { center, rotation, width };
}

// --- GRAPHIC COMPONENT ---
const GraphicDecal = ({ textureUrl, type, baseColor, isSelected, localSurfaceData, targetMesh, initialTransform, onTransformChange }) => {
  const texture = useTexture(textureUrl);
  const [state, setState] = useState(initialTransform || { x: 0, y: 0, rotation: 0, scale: 1.0 });

  useEffect(() => { 
      if(!initialTransform) setState({ x:0, y:0, rotation:0, scale:1.0 }); 
  }, [textureUrl]);

  const updateState = (newState) => {
      setState(newState);
      if (onTransformChange) onTransformChange(newState);
  };

  const config = useMemo(() => {
      if(!localSurfaceData) return null;
      const targetWidth = localSurfaceData.width * 0.6 * state.scale;
      const aspectRatio = texture.image.height / texture.image.width;
      const baseEuler = new THREE.Euler(localSurfaceData.rotation.x, localSurfaceData.rotation.y, localSurfaceData.rotation.z);
      const finalRotation = baseEuler.clone();
      finalRotation.z += state.rotation * (Math.PI / 180);
      return { 
          pos: [ localSurfaceData.center.x + state.x, localSurfaceData.center.y + state.y, localSurfaceData.center.z ], 
          rot: finalRotation,
          scale: [targetWidth, targetWidth * aspectRatio, 1] 
      };
  }, [localSurfaceData, texture, state]);

  if (!config) return null;

  const materialProps = type === 'engrave' 
      ? { color: '#1a1a1a', roughness: 0.9, metalness: 0.1, transparent: true, opacity: 0.9, bumpMap: texture, bumpScale: 0.05, polygonOffset: true, polygonOffsetFactor: -4 }
      : { color: baseColor, roughness: 0.4, metalness: 0.1, transparent: true, opacity: 1.0, alphaTest: 0.5, alphaMap: texture, map: null, bumpMap: texture, bumpScale: -0.2, polygonOffset: true, polygonOffsetFactor: -10, depthTest: true };

  return e(React.Fragment, null,
    e(Decal, { mesh: targetMesh, position: config.pos, rotation: config.rot, scale: config.scale },
      e("meshStandardMaterial", materialProps)
    ),
    isSelected && e(Html, { position: [0, 0, 0], center: true, style: { pointerEvents: 'none', width: '300px' } },
      e("div", { style: { pointerEvents: 'auto', background: 'rgba(255,255,255,0.95)', padding: '15px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', gap: '12px', transform: 'translateY(140px)', fontFamily: 'sans-serif' } },
        e("div", { style: { fontSize: '11px', fontWeight: 'bold', color: '#333', textTransform: 'uppercase', borderBottom: '1px solid #eee', paddingBottom: '5px' } }, "Graphic Controls"),
        e("label", { style: { fontSize: '10px', display: 'flex', flexDirection: 'column', gap: '4px' } }, e("span", { style: { display: 'flex', justifyContent: 'space-between' } }, "Move X ", e("span", { style: { color: '#888' } }, state.x.toFixed(3))), e("input", { type: "range", min: "-0.15", max: "0.15", step: "0.001", value: state.x, onInput: (e) => updateState({ ...state, x: parseFloat(e.target.value) }), style: { width: '100%' } })),
        e("label", { style: { fontSize: '10px', display: 'flex', flexDirection: 'column', gap: '4px' } }, e("span", { style: { display: 'flex', justifyContent: 'space-between' } }, "Move Y ", e("span", { style: { color: '#888' } }, state.y.toFixed(3))), e("input", { type: "range", min: "-0.15", max: "0.15", step: "0.001", value: state.y, onInput: (e) => updateState({ ...state, y: parseFloat(e.target.value) }), style: { width: '100%' } })),
        e("label", { style: { fontSize: '10px', display: 'flex', flexDirection: 'column', gap: '4px' } }, e("span", { style: { display: 'flex', justifyContent: 'space-between' } }, "Rotation ", e("span", { style: { color: '#888' } }, state.rotation + "°")), e("input", { type: "range", min: "-180", max: "180", step: "1", value: state.rotation, onInput: (e) => updateState({ ...state, rotation: parseFloat(e.target.value) }), style: { width: '100%' } })),
        e("label", { style: { fontSize: '10px', display: 'flex', flexDirection: 'column', gap: '4px' } }, e("span", { style: { display: 'flex', justifyContent: 'space-between' } }, "Scale ", e("span", { style: { color: '#888' } }, state.scale.toFixed(2) + "x")), e("input", { type: "range", min: "0.1", max: "2.0", step: "0.01", value: state.scale, onInput: (e) => updateState({ ...state, scale: parseFloat(e.target.value) }), style: { width: '100%' } }))
      )
    )
  );
};

const SubPart = ({ name, url, materialSetting, color, onClick, grainTexture, uploads, activeModule, onTransformChange }) => {
  const { scene } = useGLTF(url);
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  const [targetData, setTargetData] = useState({ mesh: null, localSurfaceData: null });
  const isLandingZone = url.toLowerCase().includes("engravable") || url.toLowerCase().includes("embossable");

  useLayoutEffect(() => {
    let foundMesh = null;
    clonedScene.traverse((child) => {
      if (child.isMesh) {
        if (!foundMesh) foundMesh = child;
        child.material = child.material.clone();
        if (materialSetting.includes("Nylon")) {
          child.material.color.set(color); 
          child.material.roughness = 1.0; 
          child.material.metalness = 0.0;
          if (grainTexture) { child.material.bumpMap = grainTexture; child.material.bumpScale = 0.4; }
        } else if (materialSetting.includes("Gold")) {
          child.material.color.set("#d4af37"); child.material.roughness = 0.25; child.material.metalness = 1.0;
        } else if (materialSetting.includes("Stainless Steel")) {
          child.material.color.set("#e0e0e0"); child.material.roughness = 0.25; child.material.metalness = 1.0;
        } else if (materialSetting.includes("Clear")) {
           if (name === "Hub Peripheral Boom") {
             child.material.color.set("#101010"); child.material.roughness = 0.1; child.material.metalness = 0.5; child.material.opacity = 0.5; child.material.transparent = true;
          } else {
             child.material.color.set("#ffffff"); child.material.roughness = 0.0; child.material.opacity = 0.25; child.material.transparent = true;
          }
        }
        child.name = name; 
      }
    });
    if (foundMesh && isLandingZone) {
        const localSurfaceData = getLocalSurfaceData(foundMesh);
        setTargetData({ mesh: foundMesh, localSurfaceData });
    }
  }, [clonedScene, materialSetting, color, grainTexture, name]);

  const graphicData = uploads ? uploads[name] : null;
  const textureUrl = graphicData ? (typeof graphicData === 'string' ? graphicData : graphicData.url) : null;
  const initialTransform = graphicData && typeof graphicData === 'object' ? graphicData.transform : null;
  const isTarget = activeModule === name; 
  const decalType = name.includes("Boom") ? "emboss" : "engrave";

  return e("group", { onClick: (e) => { e.stopPropagation(); onClick(name); } },
    e("primitive", { object: clonedScene }),
    isLandingZone && textureUrl && targetData.mesh && targetData.localSurfaceData && e(GraphicDecal, {
        textureUrl: textureUrl, type: decalType, baseColor: color, isSelected: isTarget, isInteractive: isTarget,
        localSurfaceData: targetData.localSurfaceData, targetMesh: targetData.mesh, initialTransform: initialTransform,
        onTransformChange: (t) => onTransformChange(name, t)
    })
  );
};

const Assembly = ({ config, onModuleClick, visibility, uploads, activeModule, onTransformChange }) => {
  const grainTexture = useGrainTexture();
  return e("group", null,
    MODULE_NAMES.map((name) => {
        let isVisible = true;
        if (name === "Boom") isVisible = visibility.Boom; else if (name.includes("Hub")) isVisible = visibility.Hub;
        if (!isVisible) return null;
        const moduleFiles = Object.keys(FILE_DATABASE).filter(filename => filename.startsWith(name + " - "));
        return e("group", { key: name },
           moduleFiles.map((filename) => {
              const url = FILE_DATABASE[filename];
              const suffix = filename.substring(name.length + 3); 
              return e(SubPart, {
                  key: filename, name: name, url: url, materialSetting: suffix, color: config[name],
                  onClick: onModuleClick, grainTexture: grainTexture, uploads: uploads, activeModule: activeModule,
                  onTransformChange: onTransformChange
              });
           })
        );
    })
  );
};

Object.values(FILE_DATABASE).forEach(url => useGLTF.preload(url));

const App = () => {
  const [config, setConfig] = useState(INITIAL_CONFIG);
  const [visibility, setVisibility] = useState({ Boom: true, Hub: true });
  const [uploads, setUploads] = useState({}); 
  const [activeModule, setActiveModule] = useState(null);
  const [configId, setConfigId] = useState(null);
  const [configName, setConfigName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isAppActive, setIsAppActive] = useState(true); 
  const [isZooming, setIsZooming] = useState(false);    

  useEffect(() => {
      const checkMobile = () => setIsMobile(window.innerWidth < 992);
      checkMobile(); window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
  }, []);
  const boundsMargin = isMobile ? 1.2 : 1.5;

  const saveToDB = async (id, currentConfig, name, currentUploads, userId) => {
      if (!window.supabase) return;
      const finalUploads = { ...currentUploads };
      let hasChanges = false;
      for (const [moduleName, data] of Object.entries(currentUploads)) {
          if (data.url && data.url.startsWith('blob:')) {
              try {
                  const blob = await fetch(data.url).then(r => r.blob());
                  const fileName = `${userId}/${Date.now()}_${moduleName.replace(/\s/g,'-')}.png`;
                  const { data: uploadData, error } = await window.supabase.storage.from('config-uploads').upload(fileName, blob);
                  if (!error) {
                      const { data: { publicUrl } } = window.supabase.storage.from('config-uploads').getPublicUrl(fileName);
                      finalUploads[moduleName] = { ...data, url: publicUrl };
                      hasChanges = true;
                  }
              } catch(e) { console.error("Upload failed", e); }
          }
      }
      if (hasChanges) setUploads(finalUploads);
      await window.supabase.from('configs').upsert({ id: id, user_id: userId, json_data: { colors: currentConfig, uploads: finalUploads }, name: name, status: 'inactive' });
  };

  useEffect(() => {
    const init = async () => {
        if (!window.supabase) return;
        const params = new URLSearchParams(window.location.search);
        const urlId = params.get('id');
        const { data: { session } } = await window.supabase.auth.getSession();
        if (!session) return; 
        if (urlId) {
            const { data } = await window.supabase.from('configs').select('*').eq('id', urlId).single();
            if (data) {
                setConfigId(data.id); setConfigName(data.name || "");
                const loadedData = data.json_data;
                if (loadedData.colors) setConfig(loadedData.colors); else setConfig(loadedData); 
                if (loadedData.uploads) setUploads(loadedData.uploads);
                window.dispatchEvent(new CustomEvent('config-loaded', { detail: { config: loadedData.colors || loadedData } }));
            }
        } else {
            const newId = 'NEW-' + Math.random().toString(36).substr(2, 9);
            setConfigId(newId); window.history.replaceState(null, '', `?id=${newId}`);
            saveToDB(newId, INITIAL_CONFIG, "", {}, session.user.id);
        }
    };
    init();
  }, []);

  useEffect(() => {
      if(configId) {
          const timer = setTimeout(async () => {
              const { data: { session } } = await window.supabase.auth.getSession();
              if(session) saveToDB(configId, config, configName, uploads, session.user.id);
          }, 2000);
          return () => clearTimeout(timer);
      }
  }, [config, configName, uploads]);

  const handleTransformChange = useCallback((moduleName, newTransform) => {
      setUploads(prev => ({ ...prev, [moduleName]: { ...prev[moduleName], transform: newTransform } }));
  }, []);

  useEffect(() => {
    const handleWebflowUpdate = (e) => { if (e.detail.moduleName) setConfig(prev => ({ ...prev, [e.detail.moduleName]: e.detail.color })); };
    const handleVisibilityToggle = (e) => { if (e.detail.group) setVisibility(prev => ({ ...prev, [e.detail.group]: e.detail.isVisible })); };
    const handleConfigState = (event) => setIsAppActive(event.detail.isActive); 
    const handleApplyAll = (e) => { if (e.detail.color) setConfig(prev => { const n={}; MODULE_NAMES.forEach(m=>n[m]=e.detail.color); return n; }); };
    const handleUpload = (e) => {
      const { moduleName, file } = e.detail;
      if(file) {
          const objectUrl = URL.createObjectURL(file);
          setUploads(prev => ({ ...prev, [moduleName]: { url: objectUrl, transform: {x:0, y:0, rotation:0, scale:1.0} } }));
          setActiveModule(moduleName); 
      }
    };
    const handleRemove = (e) => { setUploads(prev => { const n={...prev}; delete n[e.detail.moduleName]; return n; }); };
    const handleSelection = (e) => setActiveModule(e.detail.moduleName);

    window.addEventListener('update-module-color', handleWebflowUpdate);
    window.addEventListener('toggle-module-visibility', handleVisibilityToggle);
    window.addEventListener('toggle-configurator-state', handleConfigState);
    window.addEventListener('apply-color-to-all', handleApplyAll);
    window.addEventListener('upload-graphic', handleUpload);
    window.addEventListener('remove-graphic', handleRemove);
    window.addEventListener('module-selected', handleSelection);
    
    const nameInput = document.getElementById('input-config-name');
    if(nameInput) nameInput.addEventListener('input', (e) => setConfigName(e.target.value));

    return () => {
        window.removeEventListener('update-module-color', handleWebflowUpdate);
        window.removeEventListener('toggle-module-visibility', handleVisibilityToggle);
        window.removeEventListener('toggle-configurator-state', handleConfigState);
        window.removeEventListener('apply-color-to-all', handleApplyAll);
        window.removeEventListener('upload-graphic', handleUpload);
        window.removeEventListener('remove-graphic', handleRemove);
        window.removeEventListener('module-selected', handleSelection);
    };
  }, []);

  const handleModuleClick = (moduleName) => { window.dispatchEvent(new CustomEvent('module-selected', { detail: { moduleName } })); };

  return e("div", { style: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#F5F5F5' } },
    e(Canvas, { shadows: false, frameloop: 'always', dpr: [1, 2], gl: { toneMapping: THREE.NoToneMapping }, camera: { position: CAMERA_POSITION, fov: 45, near: 0.1, far: 1000 }, style: { touchAction: 'none' } },
      e(Environment, { preset: "warehouse", environmentIntensity: 0.5 }),
      e("ambientLight", { intensity: 0.5, color: "#ffffff" }),
      e("directionalLight", { position: [10, 20, 10], intensity: 2.5, color: "#fff0dd" }),
      e("directionalLight", { position: [-10, 5, -10], intensity: 3.0, color: "#ffffff" }),
      e("directionalLight", { position: [-10, 0, 10], intensity: 1.0, color: "#ffffff" }),
      e(OrbitControls, { makeDefault: true, enablePan: false, enableZoom: false, enabled: !isZooming }),
      e(Suspense, { fallback: e(Loader, null) },
        e(Bounds, { fit: true, clip: true, observe: true, margin: boundsMargin, damping: 4 },
          e(Center, null,
            e("group", { scale: [MODEL_SCALE, MODEL_SCALE, MODEL_SCALE], rotation: [-Math.PI / 2, 0, 0] },
              e(Assembly, {
                config: config, onModuleClick: handleModuleClick, visibility: visibility, uploads: uploads, activeModule: activeModule, onTransformChange: handleTransformChange
              })
            )
          ),
          e(Rig, { visibility: visibility, setIsZooming: setIsZooming })
        )
      )
    )
  );
};

const rootElement = document.getElementById('root');
if (rootElement) { const root = createRoot(rootElement); root.render(e(App, null)); }

// --- CONTROLLER SCRIPT ---
document.addEventListener('DOMContentLoaded', async () => {
  if (window.supabase) {
    const { data: { session } } = await window.supabase.auth.getSession();
    if (!session) {
      const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `/sign-in?redirectTo=${returnUrl}`;
      return; 
    }
  }

  const displayTypes = { 'intro': 'grid', 'steps': 'grid', 'viewer-topbar-steps': 'grid', 'viewer-botbar-steps': 'grid', 'viewer-botbar-done': 'grid', 'viewer-topbar-done': 'grid', 'summary': 'grid' };
  const setElementVisibility = (id, isVisible) => {
      const el = document.getElementById(id); if(!el) return;
      if (isVisible) { el.classList.remove('hidden-display'); el.style.display = displayTypes[id] || 'block'; setTimeout(() => el.classList.remove('fade-out'), 10); } 
      else { el.classList.add('fade-out'); setTimeout(() => { el.classList.add('hidden-display'); el.style.display = 'none'; }, 500); }
  };

  const goToPhase = (phaseNum) => {
      const phases = {
          1: { show: ['intro'], hide: ['steps', 'viewer-topbar-steps', 'viewer-botbar-steps', 'viewer-botbar-done', 'viewer-topbar-done', 'summary'] },
          2: { show: ['steps', 'viewer-topbar-steps', 'viewer-botbar-steps'], hide: ['intro', 'viewer-topbar-done', 'viewer-botbar-done', 'summary'] },
          3: { show: ['viewer-topbar-done', 'viewer-botbar-done', 'summary'], hide: ['intro', 'steps', 'viewer-topbar-steps', 'viewer-botbar-steps'] }
      };
      const p = phases[phaseNum];
      p.hide.forEach(id => setElementVisibility(id, false));
      setTimeout(() => { p.show.forEach(id => setElementVisibility(id, true)); }, 500);
  };

  const btnStart = document.getElementById('start-button'); if(btnStart) btnStart.addEventListener('click', () => goToPhase(2));
  const btnIntro = document.getElementById('intro-button'); if(btnIntro) btnIntro.addEventListener('click', () => goToPhase(1));
  const btnDone = document.getElementById('done-button'); if(btnDone) btnDone.addEventListener('click', () => goToPhase(3));
  const btnEdit = document.getElementById('edit-config'); if(btnEdit) btnEdit.addEventListener('click', () => goToPhase(2));
  window.addEventListener('transition-to-phase', (e) => { goToPhase(e.detail.phase); });

  const allIds = ['intro', 'steps', 'viewer-topbar-steps', 'viewer-botbar-steps', 'viewer-botbar-done', 'viewer-topbar-done', 'summary'];
  allIds.forEach(id => { const el = document.getElementById(id); if(el) { el.classList.add('fade-element'); if(id !== 'intro') { el.classList.add('fade-out', 'hidden-display'); el.style.display = 'none'; } } });

  const COLORS = { 'Light': '#dbdbdb', 'Dark': '#000000', 'Red': '#f4020b', 'Blue': '#3b7de1', 'Yellow': '#f8c441', 'Green': '#3e623b', 'Purple': '#a72eae', 'Nylon': '#1e1e1e', 'Polished Gold': '#FFD700', 'Polished Stainless Steel': '#E0E0E0', 'Clear': '#ffffff' };
  const MODULE_MAP = { 'group-boom': 'Boom', 'group-bud-comp-left': 'Bud Compute - Left', 'group-bud-comp-right': 'Bud Compute - Right', 'group-bud-periph-left': 'Bud Peripheral - Left', 'group-bud-periph-right': 'Bud Peripheral - Right', 'group-bud-power-left': 'Bud Power - Left', 'group-bud-power-right': 'Bud Power - Right', 'group-hub-compute': 'Hub Compute', 'group-hub-power': 'Hub Power', 'group-hub-boom': 'Hub Peripheral Boom', 'group-bud-power-left-spare': 'Bud Power - Left (Spare)', 'group-bud-power-right-spare': 'Bud Power - Right (Spare)', 'group-hub-power-spare': 'Hub Power (Spare)' };
  const REVERSE_MODULE_MAP = Object.fromEntries(Object.entries(MODULE_MAP).map(([id, name]) => [name, id]));

  const updateActiveButtonVisuals = (container, clickedBtn) => { const allBtns = container.querySelectorAll('.color-btn, .w-button, [role="button"]'); allBtns.forEach(b => b.classList.remove('active-swatch')); clickedBtn.classList.add('active-swatch'); };
  const updateAllButtonsToColor = (colorName) => { Object.keys(MODULE_MAP).forEach(groupID => { const container = document.getElementById(groupID); if(container) { const buttons = container.querySelectorAll('.color-btn, .w-button, [role="button"]'); buttons.forEach(btn => { if (btn.innerText.trim() === colorName) { updateActiveButtonVisuals(container, btn); } }); } }); };
  const scrollToStep = (stepID) => { const target = document.getElementById(stepID); if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' }); };

  const syncButtonsWithConfig = (loadedConfig) => {
      const hexToColorName = {}; Object.entries(COLORS).forEach(([name, hex]) => { hexToColorName[hex.toLowerCase()] = name; });
      Object.entries(MODULE_MAP).forEach(([groupID, moduleName]) => {
          const container = document.getElementById(groupID); if (!container) return;
          const moduleColor = loadedConfig[moduleName]; if (!moduleColor) return;
          const colorName = hexToColorName[moduleColor.toLowerCase()]; if (!colorName) return;
          const buttons = container.querySelectorAll('.color-btn, .w-button, [role="button"]');
          buttons.forEach(btn => { if (btn.innerText.trim() === colorName) { updateActiveButtonVisuals(container, btn); } });
      });
  };

  window.addEventListener('config-loaded', (event) => {
      const { config } = event.detail;
      if (config) {
          syncButtonsWithConfig(config);
          if (config.uploads) {
              const uploadMap = { 'Bud Compute - Right': 'btn-upload-bud-comp-right', 'Bud Compute - Left': 'btn-upload-bud-comp-left', 'Hub Peripheral Boom': 'btn-upload-hub-boom' };
              Object.keys(config.uploads).forEach(modName => { const btnId = uploadMap[modName]; const btn = document.getElementById(btnId); if(btn) btn.innerText = modName.includes("Boom") ? "Remove Embossing" : "Remove Engraving"; });
          }
      }
  });

  Object.keys(MODULE_MAP).forEach(groupID => {
    const container = document.getElementById(groupID); 
    const moduleName = MODULE_MAP[groupID];
    if (!container) return;
    const buttons = container.querySelectorAll('.color-btn, .w-button, [role="button"]');
    buttons.forEach(btn => {
      btn.addEventListener('contextmenu', (e) => { e.preventDefault(); e.stopPropagation(); return false; });
      const btnText = btn.innerText.trim();
      if (COLORS[btnText] !== undefined) {
        let pressTimer; let isLongPress = false;
        const startPress = (e) => { isLongPress = false; pressTimer = setTimeout(() => { isLongPress = true; window.dispatchEvent(new CustomEvent('apply-color-to-all', { detail: { color: COLORS[btnText] } })); updateAllButtonsToColor(btnText); }, 3000); };
        const cancelPress = (e) => { clearTimeout(pressTimer); };
        const handleClick = (e) => { e.preventDefault(); if (isLongPress) return; const event = new CustomEvent('update-module-color', { detail: { moduleName: moduleName, color: COLORS[btnText] } }); window.dispatchEvent(event); updateActiveButtonVisuals(container, btn); };
        btn.addEventListener('mousedown', startPress); btn.addEventListener('touchstart', startPress); btn.addEventListener('mouseup', cancelPress); btn.addEventListener('mouseleave', cancelPress); btn.addEventListener('touchend', cancelPress); btn.addEventListener('click', handleClick);
      }
    });
  });

  window.addEventListener('module-selected', (event) => { const selectedModule = event.detail.moduleName; const groupID = REVERSE_MODULE_MAP[selectedModule]; if (groupID) { const targetStepID = groupID.replace('group-', ''); scrollToStep(targetStepID); } });

  const setupToggle = (groupName) => {
      const suffixes = ['', '-mobile'];
      suffixes.forEach(suffix => {
          const showBtn = document.getElementById(`show-${groupName.toLowerCase()}${suffix}`); const hideBtn = document.getElementById(`hide-${groupName.toLowerCase()}${suffix}`);
          if (showBtn && hideBtn) {
              showBtn.style.display = 'none'; hideBtn.style.display = 'block';
              showBtn.addEventListener('click', (e) => { e.preventDefault(); showBtn.style.display = 'none'; hideBtn.style.display = 'block'; window.dispatchEvent(new CustomEvent('toggle-module-visibility', { detail: { group: groupName, isVisible: true } })); });
              hideBtn.addEventListener('click', (e) => { e.preventDefault(); showBtn.style.display = 'block'; hideBtn.style.display = 'none'; window.dispatchEvent(new CustomEvent('toggle-module-visibility', { detail: { group: groupName, isVisible: false } })); });
          }
      });
  };
  setupToggle('Hub'); setupToggle('Boom');
  
  const setupGraphicUpload = (btnId, moduleName) => {
      const btn = document.getElementById(btnId); if (!btn) return;
      const fileInput = document.createElement('input'); fileInput.type = 'file'; fileInput.accept = 'image/png'; fileInput.style.display = 'none'; document.body.appendChild(fileInput);
      const defaultText = moduleName.includes("Boom") ? "Emboss" : "Engrave";
      const activeText = moduleName.includes("Boom") ? "Remove Embossing" : "Remove Engraving";

      btn.addEventListener('click', (e) => {
          e.preventDefault();
          if (btn.innerText === activeText) { window.dispatchEvent(new CustomEvent('remove-graphic', { detail: { moduleName } })); btn.innerText = defaultText; fileInput.value = ''; } 
          else { fileInput.click(); }
      });

      fileInput.addEventListener('change', (e) => {
          const file = e.target.files[0];
          if (file) { window.dispatchEvent(new CustomEvent('upload-graphic', { detail: { moduleName, file } })); btn.innerText = activeText; window.dispatchEvent(new CustomEvent('module-selected', { detail: { moduleName } })); }
      });
  };

  setupGraphicUpload('btn-upload-bud-comp-right', 'Bud Compute - Right');
  setupGraphicUpload('btn-upload-bud-comp-left', 'Bud Compute - Left');
  setupGraphicUpload('btn-upload-hub-boom', 'Hub Peripheral Boom');

  const btnClose = document.getElementById('btn-close-config'); const btnCloseMobile = document.getElementById('btn-close-config-mobile');
  if (btnClose) btnClose.addEventListener('click', () => { window.dispatchEvent(new CustomEvent('toggle-configurator-state', { detail: { isActive: false } })); });
  if (btnCloseMobile) btnCloseMobile.addEventListener('click', () => { window.dispatchEvent(new CustomEvent('toggle-configurator-state', { detail: { isActive: false } })); });
});