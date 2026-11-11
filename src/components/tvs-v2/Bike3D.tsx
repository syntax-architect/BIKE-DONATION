"use client";

/**
 * The People's Apache RR 310 — full 3D hero bike.
 * A stylised-but-recognisable TVS Apache RR 310 (BTO Racing Edition):
 * Racing Red fairing, gold USD forks, carbon winglets, turntable plinth,
 * studio lightformers, interactive zone hotspots and LIVE contributor-name
 * decals on the side panels + tail (endowment preview).
 *
 * Side-view reference (metres): front axle x=0.65, rear axle x=-0.65,
 * wheel r=0.30, nose tip x≈0.97, screen top y≈1.06, tail tip y≈0.96.
 */

import { Suspense, useMemo, useRef, useState, type ComponentRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Billboard,
  ContactShadows,
  Environment,
  Lightformer,
  OrbitControls,
  RoundedBox,
} from "@react-three/drei";
import * as THREE from "three";
import { ZONES, type ZoneId } from "@/lib/tvs/constants";
import { useClaimStore } from "@/lib/tvs/store";

const PAINT = "#c9102e"; // Racing Red
const PAINT_DARK = "#9e0c23";
const CARBON = "#1a1d23";
const METAL = "#b9bec7";

/* ── helpers ─────────────────────────────────────────────────────────────── */

function useTextTexture(
  text: string,
  opts: { fill?: string; stroke?: string } = {},
) {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 256;
    const ctx = c.getContext("2d")!;
    const label = text.trim() || "YOUR NAME";
    const ghosted = !text.trim();
    ctx.clearRect(0, 0, c.width, c.height);
    // printed white label — readable on any panel colour
    ctx.globalAlpha = ghosted ? 0.55 : 0.94;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.roundRect(14, 18, 996, 220, 46);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.font = `italic 900 128px "Space Grotesk", "Inter", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = ghosted ? "rgba(11,12,16,0.45)" : "#c9102e";
    ctx.fillText(label.toUpperCase(), c.width / 2, c.height / 2 + 8);
    const tex = new THREE.CanvasTexture(c);
    tex.anisotropy = 4;
    tex.needsUpdate = true;
    return tex;
     
  }, [text, opts.fill, opts.stroke]);
}

function RacePlate({
  position,
  rotation,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
}) {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 320;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#f6f7f9";
    ctx.beginPath();
    ctx.roundRect(10, 10, 492, 300, 40);
    ctx.fill();
    ctx.strokeStyle = "#c9102e";
    ctx.lineWidth = 14;
    ctx.stroke();
    ctx.fillStyle = "#c9102e";
    ctx.font = `italic 900 126px "Space Grotesk", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("RR 310", 256, 146);
    ctx.fillStyle = "#0b0c10";
    ctx.font = `700 42px "JetBrains Mono", monospace`;
    ctx.fillText("RACING EDITION", 256, 244);
    const t = new THREE.CanvasTexture(c);
    t.anisotropy = 4;
    return t;
  }, []);
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[0.17, 0.106]} />
      <meshBasicMaterial map={tex} toneMapped={false} transparent depthWrite={false} />
    </mesh>
  );
}

function NameDecal({
  position,
  rotation,
  size,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  size: [number, number];
}) {
  const previewName = useClaimStore((s) => s.previewName);
  const tex = useTextTexture(previewName);
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={size} />
      <meshBasicMaterial map={tex} toneMapped={false} transparent depthWrite={false} />
    </mesh>
  );
}

/* ── bike parts ──────────────────────────────────────────────────────────── */

function Paint({ color = PAINT, roughness = 0.2 }: { color?: string; roughness?: number }) {
  return (
    <meshPhysicalMaterial
      color={color}
      metalness={0.6}
      roughness={roughness}
      clearcoat={1}
      clearcoatRoughness={0.08}
    />
  );
}

function Wheel({
  x,
  width = 0.1,
  discSide = -1,
}: {
  x: number;
  width?: number;
  discSide?: 1 | -1;
}) {
  const spokes = useMemo(() => [0, 1, 2, 3, 4].map((i) => (i * Math.PI * 2) / 5), []);
  return (
    <group position={[x, 0.3, 0]}>
      <mesh>
        <torusGeometry args={[0.222, 0.079, 18, 44]} />
        <meshStandardMaterial color="#15171c" roughness={0.94} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, width, 28]} />
        <meshStandardMaterial color="#22252c" metalness={0.85} roughness={0.32} />
      </mesh>
      <mesh>
        <torusGeometry args={[0.153, 0.009, 8, 48]} />
        <meshStandardMaterial color={PAINT} metalness={0.35} roughness={0.35} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.042, 0.042, width + 0.03, 16]} />
        <meshStandardMaterial color="#2b2f36" metalness={0.9} roughness={0.3} />
      </mesh>
      {spokes.map((a, i) => (
        <mesh key={i} rotation={[0, 0, a]}>
          <boxGeometry args={[0.034, 0.27, 0.05]} />
          <meshStandardMaterial color="#31353d" metalness={0.82} roughness={0.38} />
        </mesh>
      ))}
      <mesh position={[0, 0, discSide * (width / 2 + 0.008)]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.124, 0.124, 0.012, 32]} />
        <meshStandardMaterial color={METAL} metalness={0.95} roughness={0.24} />
      </mesh>
      <mesh position={[0.08, 0.05, discSide * (width / 2 + 0.02)]}>
        <boxGeometry args={[0.08, 0.066, 0.046]} />
        <meshStandardMaterial color={PAINT} metalness={0.4} roughness={0.4} />
      </mesh>
    </group>
  );
}

function Bike() {
  const openClaim = useClaimStore((s) => s.openClaim);
  const activeZone = useClaimStore((s) => s.zoneId);

  return (
    <group>
      {/* wheels */}
      <Wheel x={0.65} width={0.1} discSide={-1} />
      <Wheel x={-0.65} width={0.14} discSide={1} />

      {/* gold USD forks — steering head (0.50,0.84) → front axle (0.65,0.30) */}
      {[0.07, -0.07].map((z) => (
        <group key={z}>
          <mesh position={[0.575, 0.57, z]} rotation={[0, 0, 0.28]}>
            <cylinderGeometry args={[0.022, 0.022, 0.5, 14]} />
            <meshStandardMaterial color="#c8a44a" metalness={0.95} roughness={0.22} />
          </mesh>
          <mesh position={[0.62, 0.38, z]} rotation={[0, 0, 0.28]}>
            <cylinderGeometry args={[0.029, 0.029, 0.22, 14]} />
            <meshStandardMaterial color="#23262c" metalness={0.7} roughness={0.35} />
          </mesh>
        </group>
      ))}

      {/* handlebar + compact mirrors */}
      <mesh position={[0.42, 0.94, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.013, 0.013, 0.3, 12]} />
        <meshStandardMaterial color="#1a1d22" metalness={0.6} roughness={0.4} />
      </mesh>
      {[0.16, -0.16].map((z) => (
        <group key={z}>
          <mesh position={[0.4, 1.0, z * 1.05]} rotation={[0.45 * Math.sign(z), 0, 0]}>
            <cylinderGeometry args={[0.006, 0.006, 0.1, 8]} />
            <meshStandardMaterial color="#1a1d22" metalness={0.7} roughness={0.35} />
          </mesh>
          <mesh position={[0.39, 1.045, z * 1.14]} scale={[0.055, 0.018, 0.034]}>
            <sphereGeometry args={[1, 18, 12]} />
            <meshStandardMaterial color="#15171c" metalness={0.5} roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* nose fairing — tapered cowl */}
      <mesh position={[0.8, 0.72, 0]} scale={[0.17, 0.125, 0.125]}>
        <sphereGeometry args={[1, 28, 20]} />
        <Paint />
      </mesh>
      {/* beak / lower cowl */}
      <RoundedBox args={[0.3, 0.11, 0.17]} radius={0.04} position={[0.78, 0.55, 0]}>
        <meshStandardMaterial color={CARBON} metalness={0.35} roughness={0.45} />
      </RoundedBox>
      {/* signature twin-fang DRL + projector */}
      {[0.05, -0.05].map((z) => (
        <mesh key={z} position={[0.965, 0.75, z]} rotation={[0, 0, -0.4 * Math.sign(z)]}>
          <boxGeometry args={[0.09, 0.014, 0.014]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#dff3ff"
            emissiveIntensity={2.6}
            toneMapped={false}
          />
        </mesh>
      ))}
      <mesh position={[0.975, 0.68, 0]}>
        <sphereGeometry args={[0.026, 14, 12]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#cfeaff"
          emissiveIntensity={3}
          toneMapped={false}
        />
      </mesh>

      {/* windscreen — thin smoked blade, seated on the nose */}
      <RoundedBox
        args={[0.2, 0.13, 0.02]}
        radius={0.008}
        position={[0.53, 0.9, 0]}
        rotation={[0, 0, 0.55]}
      >
        <meshPhysicalMaterial
          color="#10141c"
          transparent
          opacity={0.55}
          roughness={0.05}
          metalness={0.2}
        />
      </RoundedBox>

      {/* front fender */}
      <mesh position={[0.65, 0.3, 0]} rotation={[0, 0, 0.55]} scale={[1, 1, 0.75]}>
        <torusGeometry args={[0.33, 0.04, 10, 26, 1.6]} />
        <Paint />
      </mesh>

      {/* tank — compact muscular hump */}
      <mesh position={[0.24, 0.78, 0]} scale={[0.19, 0.115, 0.155]}>
        <sphereGeometry args={[1, 28, 20]} />
        <Paint />
      </mesh>

      {/* tank shrouds sweeping from nose to tank */}
      {[0.135, -0.135].map((z) => (
        <RoundedBox
          key={z}
          args={[0.36, 0.13, 0.045]}
          radius={0.02}
          position={[0.38, 0.66, z]}
          rotation={[0, -0.28 * Math.sign(z), 0.12]}
        >
          <Paint />
        </RoundedBox>
      ))}

      {/* BTO aero winglets (donation zone) */}
      {[0.185, -0.185].map((z) => (
        <group key={z} position={[0.5, 0.75, z]}>
          <RoundedBox
            args={[0.14, 0.016, 0.1]}
            radius={0.007}
            rotation={[0, -0.3 * Math.sign(z), 0.2]}
          >
            <meshStandardMaterial color={CARBON} metalness={0.5} roughness={0.35} />
          </RoundedBox>
          <mesh position={[0, 0.011, 0]} rotation={[0, -0.3 * Math.sign(z), 0.2]}>
            <boxGeometry args={[0.13, 0.006, 0.013]} />
            <meshStandardMaterial color={PAINT} metalness={0.4} roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* side fairing panels (FAIRING zone) — tall carbon break closing the silhouette */}
      {[0.13, -0.13].map((z) => (
        <RoundedBox
          key={z}
          args={[0.4, 0.34, 0.03]}
          radius={0.035}
          position={[0.12, 0.62, z]}
          rotation={[0, 0, -0.06]}
        >
          <meshStandardMaterial color={CARBON} metalness={0.45} roughness={0.4} />
        </RoundedBox>
      ))}
      {/* rear side panels — connect tail down to the swingarm pivot */}
      {[0.1, -0.1].map((z) => (
        <RoundedBox
          key={z}
          args={[0.4, 0.2, 0.028]}
          radius={0.028}
          position={[-0.33, 0.71, z]}
          rotation={[0, 0, 0.28]}
        >
          <Paint />
        </RoundedBox>
      ))}
      <RoundedBox args={[0.34, 0.05, 0.18]} radius={0.02} position={[-0.08, 0.78, 0]}>
        <meshStandardMaterial color="#14161a" roughness={0.75} />
      </RoundedBox>
      <RoundedBox
        args={[0.42, 0.12, 0.16]}
        radius={0.045}
        position={[-0.44, 0.87, 0]}
        rotation={[0, 0, 0.33]}
      >
        <Paint />
      </RoundedBox>
      <RoundedBox
        args={[0.14, 0.045, 0.14]}
        radius={0.018}
        position={[-0.2, 0.83, 0]}
        rotation={[0, 0, 0.25]}
      >
        <Paint />
      </RoundedBox>
      <mesh position={[-0.655, 0.965, 0]} rotation={[0, 0, 0.33]}>
        <boxGeometry args={[0.014, 0.016, 0.09]} />
        <meshStandardMaterial
          color="#ff2d3f"
          emissive="#ff1130"
          emissiveIntensity={2.2}
          toneMapped={false}
        />
      </mesh>

      {/* frame spars */}
      {[0.062, -0.062].map((z) => (
        <mesh key={z} position={[0.15, 0.57, z]} rotation={[0, 0, -1.12]}>
          <cylinderGeometry args={[0.017, 0.017, 0.62, 10]} />
          <meshStandardMaterial color={PAINT} metalness={0.5} roughness={0.35} />
        </mesh>
      ))}

      {/* engine + radiator + clutch cover */}
      <RoundedBox args={[0.3, 0.22, 0.2]} radius={0.028} position={[0.03, 0.36, 0]}>
        <meshStandardMaterial color="#22262c" metalness={0.7} roughness={0.45} />
      </RoundedBox>
      <mesh position={[0.08, 0.35, 0.11]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.075, 0.075, 0.028, 20]} />
        <meshStandardMaterial color={METAL} metalness={0.9} roughness={0.3} />
      </mesh>
      <RoundedBox args={[0.055, 0.24, 0.18]} radius={0.018} position={[0.28, 0.46, 0]}>
        <meshStandardMaterial color="#17191d" metalness={0.4} roughness={0.6} />
      </RoundedBox>

      {/* exhaust — low right, upswept muffler */}
      <mesh position={[0.06, 0.26, 0.085]} rotation={[0, 0, 0.05]}>
        <cylinderGeometry args={[0.028, 0.03, 0.34, 12]} />
        <meshStandardMaterial color="#8f959e" metalness={0.9} roughness={0.35} />
      </mesh>
      <mesh position={[-0.32, 0.34, 0.1]} rotation={[0, 0, 1.35]}>
        <capsuleGeometry args={[0.046, 0.24, 6, 14]} />
        <meshStandardMaterial color="#c9ccd2" metalness={0.95} roughness={0.26} />
      </mesh>
      <mesh position={[-0.44, 0.385, 0.1]}>
        <sphereGeometry args={[0.038, 12, 10]} />
        <meshStandardMaterial color="#2b2f36" metalness={0.8} roughness={0.4} />
      </mesh>

      {/* swingarm */}
      {[0.09, -0.09].map((z) => (
        <mesh key={z} position={[-0.46, 0.34, z]} rotation={[0, 0, 0.12]}>
          <boxGeometry args={[0.4, 0.058, 0.03]} />
          <meshStandardMaterial color="#4a4f57" metalness={0.85} roughness={0.35} />
        </mesh>
      ))}

      {/* belly pan (The People's Grid zone) */}
      <RoundedBox args={[0.6, 0.1, 0.26]} radius={0.028} position={[0.12, 0.19, 0]}>
        <meshStandardMaterial color={CARBON} metalness={0.35} roughness={0.5} />
      </RoundedBox>
      <mesh position={[0.12, 0.242, 0]}>
        <boxGeometry args={[0.585, 0.012, 0.262]} />
        <meshStandardMaterial color={PAINT} metalness={0.4} roughness={0.35} />
      </mesh>

      {/* liveries: race plates + LIVE name decals on flat panels */}
      <RacePlate position={[0.38, 0.665, 0.16]} rotation={[0, -0.28, 0.12]} />
      <RacePlate position={[0.38, 0.665, -0.16]} rotation={[0, Math.PI + 0.28, -0.12]} />
      <NameDecal position={[0.13, 0.5, 0.148]} rotation={[0, 0.08, -0.06]} size={[0.32, 0.08]} />
      <NameDecal
        position={[0.13, 0.5, -0.148]}
        rotation={[0, Math.PI - 0.08, 0.06]}
        size={[0.32, 0.08]}
      />
      <group position={[-0.43, 0.94, 0]} rotation={[0, 0, 0.33]}>
        <NameDecal position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} size={[0.3, 0.08]} />
      </group>

      {/* interactive zone hotspots */}
      {ZONES.map((zone) => (
        <Hotspot
          key={zone.id}
          zoneId={zone.id}
          position={HOTSPOT_3D[zone.id]}
          active={activeZone === zone.id}
          onPick={() => openClaim(zone.id, zone.price)}
        />
      ))}
    </group>
  );
}

const HOTSPOT_3D: Record<ZoneId, [number, number, number]> = {
  WINGLETS: [0.52, 0.8, 0.22],
  TANK: [0.26, 0.95, 0.12],
  FAIRING: [0.18, 0.64, 0.17],
  BELLY: [0.12, 0.14, 0.16],
  COWL: [-0.44, 0.97, 0.11],
};

function useZoneLabelTexture(short: string, price: number, color: string) {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 128;
    const ctx = c.getContext("2d")!;
    // pill
    ctx.fillStyle = "rgba(255,255,255,0.94)";
    ctx.strokeStyle = "rgba(11,12,16,0.12)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(6, 24, 500, 80, 40);
    ctx.fill();
    ctx.stroke();
    // colour dot
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(52, 64, 17, 0, Math.PI * 2);
    ctx.fill();
    // text
    ctx.fillStyle = "#0b0c10";
    ctx.font = `800 44px "Space Grotesk", "Inter", sans-serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(`${short} \u00b7 \u20b9${price}`, 92, 66);
    const t = new THREE.CanvasTexture(c);
    t.anisotropy = 4;
    return t;
     
  }, [short, price, color]);
}

/** In-canvas AR-style marker — avoids drei <Html> (React 19 unmount bug). */
function Hotspot({
  zoneId,
  position,
  active,
  onPick,
}: {
  zoneId: ZoneId;
  position: [number, number, number];
  active: boolean;
  onPick: () => void;
}) {
  const zone = ZONES.find((z) => z.id === zoneId)!;
  const label = useZoneLabelTexture(zone.short, zone.price, zone.color);
  const ring = useRef<THREE.Mesh>(null);
  const core = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    const t = (state.clock.elapsedTime % 2.2) / 2.2;
    if (ring.current) {
      ring.current.scale.setScalar(1 + t * 1.9);
      const mat = ring.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.55 * (1 - t);
    }
    if (core.current) {
      const target = hovered || active ? 1.3 : 1;
      core.current.scale.lerp(new THREE.Vector3(target, target, target), 0.18);
    }
  });

  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); onPick(); }}>
      <Billboard>
        <group
          ref={core}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            setHovered(false);
            document.body.style.cursor = "";
          }}
        >
          {/* generous invisible hit area */}
          <mesh position={[0, 0.02, 0.001]}>
            <circleGeometry args={[0.075, 24]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
          {/* white halo + coloured dot */}
          <mesh position={[0, 0.02, 0.002]}>
            <circleGeometry args={[0.036, 28]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0, 0.02, 0.003]}>
            <circleGeometry args={[0.024, 28]} />
            <meshBasicMaterial color={zone.color} />
          </mesh>
          {/* pulsing ring */}
          <mesh ref={ring} position={[0, 0.02, 0.001]}>
            <ringGeometry args={[0.03, 0.042, 32]} />
            <meshBasicMaterial
              color={zone.color}
              transparent
              opacity={0.5}
              depthWrite={false}
            />
          </mesh>
          {/* price label pill */}
          <mesh position={[0, 0.12, 0.004]}>
            <planeGeometry args={[0.2, 0.05]} />
            <meshBasicMaterial
              map={label}
              transparent
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        </group>
      </Billboard>
    </group>
  );
}

/* ── scene ───────────────────────────────────────────────────────────────── */

function Turntable() {
  return (
    <group>
      <mesh position={[0, -0.026, 0]}>
        <cylinderGeometry args={[1.32, 1.4, 0.05, 56]} />
        <meshStandardMaterial color="#eef0f3" metalness={0.1} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.002, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.32, 0.014, 8, 72]} />
        <meshStandardMaterial color={PAINT} metalness={0.5} roughness={0.3} />
      </mesh>
    </group>
  );
}

function Rig() {
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const resume = useRef<ReturnType<typeof setTimeout> | null>(null);
  return (
    <>
      <ambientLight intensity={0.85} />
      <directionalLight position={[4, 6, 3]} intensity={1.5} />
      <directionalLight position={[-5, 3, -2]} intensity={0.5} color="#ffe9ec" />
      <Environment resolution={256} frames={1}>
        <color attach="background" args={["#eef0f4"]} />
        <Lightformer
          intensity={2.4}
          position={[0, 4, 0]}
          rotation-x={Math.PI / 2}
          scale={[8, 3, 1]}
          color="#ffffff"
        />
        <Lightformer
          intensity={1.4}
          position={[-4, 1.6, 2]}
          rotation-y={Math.PI / 2}
          scale={[5, 1.4, 1]}
          color="#fff3f4"
        />
        <Lightformer
          intensity={1.4}
          position={[4, 1.6, -2]}
          rotation-y={-Math.PI / 2}
          scale={[5, 1.4, 1]}
          color="#eaf6ff"
        />
        <Lightformer intensity={0.9} position={[0, 1.6, 5]} scale={[6, 1.2, 1]} color="#ffffff" />
      </Environment>
      <ContactShadows
        position={[0, 0.001, 0]}
        opacity={0.4}
        scale={6}
        blur={2.6}
        far={1.4}
        resolution={512}
        color="#26314a"
      />
      <OrbitControls
        ref={controls}
        target={[0, 0.52, 0]}
        autoRotate
        autoRotateSpeed={0.9}
        enableZoom={false}
        enablePan={false}
        minPolarAngle={0.85}
        maxPolarAngle={1.44}
        onStart={() => {
          if (controls.current) controls.current.autoRotate = false;
          if (resume.current) clearTimeout(resume.current);
        }}
        onEnd={() => {
          resume.current = setTimeout(() => {
            if (controls.current) controls.current.autoRotate = true;
          }, 4000);
        }}
      />
    </>
  );
}

export default function Bike3D() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [2.55, 1.05, 2.95], fov: 30 }}
      gl={{ antialias: true, alpha: true }}
      style={{ touchAction: "pan-y" }}
    >
      <Suspense fallback={null}>
        <group position={[0, 0.05, 0]}>
          <Turntable />
          <Bike />
        </group>
        <Rig />
      </Suspense>
    </Canvas>
  );
}
