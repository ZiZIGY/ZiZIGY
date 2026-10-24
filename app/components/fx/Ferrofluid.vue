<script setup lang="ts">
import { gsap } from 'gsap'

/*
 * A drop of ferrofluid, ray-marched in a fragment shader (plain WebGL, no 3D library). The pointer is
 * the magnet: Rosensweig spikes rise all over the drop, tallest where they face the cursor, and the
 * body leans out towards it. With no pointer about, the field breathes slowly, so the spikes rise and
 * settle on their own; a click knocks them flat for a moment. Mirror-black, lit by a studio softbox
 * and a signal-orange kicker — the accent colour as a reflection, not as paint.
 *
 * Cheap where it can be: a bounding-sphere test sends most pixels home before any marching, the buffer
 * is drawn at ≤ 1.5× device pixels (lower if frames run long), and nothing renders off screen.
 */
const props = withDefaults(defineProps<{
  /** Centre of the drop inside the canvas, as fractions of its width and height. */
  x?: number
  y?: number
  /** Radius as a fraction of the canvas' shorter side. */
  size?: number
}>(), { x: 0.75, y: 0.42, size: 0.2 })

const canvas = useTemplateRef<HTMLCanvasElement>('canvas')
const failed = ref(false)
const colorMode = useColorMode()

const VERTEX = `
attribute vec2 aPosition;
void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }
`

const FRAGMENT = `
precision highp float;
uniform vec2 uCenter;   // drop centre in buffer pixels (origin bottom-left)
uniform float uRadius;  // buffer pixels per scene unit
uniform float uTime;
uniform vec3 uMagnet;   // where the magnet (the pointer) is, in scene units
uniform float uField;   // field strength: a slow breath at rest, up to 1 with the pointer close
uniform float uSplash;  // extra wobble after a click
uniform float uDark;

const vec3 INK = vec3(0.067, 0.067, 0.075);
const vec3 SIGNAL = vec3(1.0, 0.31, 0.102);
const float PI = 3.14159265;
const float PHI = 1.61803398875;
const float SPIKES = 72.0;

// Rosensweig spikes over a spherical Fibonacci lattice. The lattice cell holding the direction is
// found in constant time (Keinert et al. 2015) and its four corner points each raise a cone with
// concave flanks — tallest where it faces the magnet. Summing all four (rather than taking the
// nearest) keeps the valleys smooth: nearest-only leaves hard creases where the nearest point changes.
float spikes(vec3 dir, vec3 toward) {
  // the lattice's poles go to the top and bottom of the silhouette, seen edge-on: the cell lookup is
  // least exact at a pole, and a pole facing the camera showed as a seam in the middle of the drop
  vec3 p = dir.xzy;
  toward = toward.xzy;
  float m = 1.0 - 1.0 / SPIKES;
  float phi = min(atan(p.y, p.x), PI);
  float cosTheta = p.z;
  float k = max(2.0, floor(log(SPIKES * PI * sqrt(5.0) * (1.0 - cosTheta * cosTheta)) / log(PHI * PHI)));
  float Fk = pow(PHI, k) / sqrt(5.0);
  vec2 F = vec2(floor(Fk + 0.5), floor(Fk * PHI + 0.5));
  vec2 ka = 2.0 * F / SPIKES;
  vec2 kb = 2.0 * PI * (fract((F + 1.0) * PHI) - (PHI - 1.0));
  mat2 iB = mat2(ka.y, -ka.x, kb.y, -kb.x) / (ka.y * kb.x - ka.x * kb.y);
  vec2 c = floor(iB * vec2(phi, cosTheta - m));
  float total = 0.0;
  for (int s = 0; s < 4; s++) {
    vec2 uv = vec2(float(s - 2 * (s / 2)), float(s / 2));
    float i = dot(F, uv + c);
    // near a pole the cell's corners can fall off the lattice: skip them (clamping would count a point twice)
    if (i < 0.0 || i > SPIKES - 1.0) continue;
    float phi2 = 2.0 * PI * fract(i * PHI);
    float cosTheta2 = m - 2.0 * i / SPIKES;
    float sinTheta2 = sqrt(max(0.0, 1.0 - cosTheta2 * cosTheta2));
    vec3 q = vec3(cos(phi2) * sinTheta2, sin(phi2) * sinTheta2, cosTheta2);
    // almost nothing away from the field: real ferrofluid only spikes where the field is, and a uniform
    // base height made the resting drop look like a cut gem
    float facing = max(dot(q, toward), 0.0);
    float height = 0.012 + 0.5 * facing * facing * facing;
    total += height * pow(clamp(1.0 - length(q - p) / 0.4, 0.0, 1.0), 2.8);
  }
  return total;
}

float map(vec3 p) {
  float t = uTime;
  vec3 toward = normalize(uMagnet + vec3(0.0, 0.0, 0.001));
  // the body leans out towards the magnet: space is squeezed along the field on that side only
  float along = max(dot(p, toward), 0.0);
  vec3 q = p - toward * along * (0.3 * uField / (1.0 + 0.3 * uField));
  float r = length(q);
  vec3 dir = q / max(r, 1e-4);
  // a slow swell, so the drop is never quite still
  float swell = (0.03 + uSplash * 0.1) * sin(1.4 * dir.x + t * 0.8) * sin(1.3 * dir.y + t * 0.6) * sin(1.2 * dir.z + t);
  return r - (1.0 + swell + uField * spikes(dir, toward));
}

vec3 normalAt(vec3 p) {
  // tetrahedral differences: four samples instead of six
  const vec2 k = vec2(1.0, -1.0);
  const float e = 0.0015;
  return normalize(k.xyy * map(p + k.xyy * e) + k.yyx * map(p + k.yyx * e) + k.yxy * map(p + k.yxy * e) + k.xxx * map(p + k.xxx * e));
}

// a studio for a mirror-black liquid: an overhead softbox, a side strip, a warm signal kicker
vec3 environment(vec3 r) {
  float softbox = smoothstep(0.35, 0.95, r.y);
  float strip = pow(max(dot(r, normalize(vec3(-0.85, 0.25, 0.45))), 0.0), 22.0);
  float warm = pow(max(dot(r, normalize(vec3(0.7, -0.45, 0.45))), 0.0), 6.0);
  return vec3(0.04) + vec3(0.85) * softbox * 0.6 + vec3(1.0) * strip * 0.8 + SIGNAL * warm * 1.15;
}

void main() {
  // the z = 0 plane maps 1:1 onto the canvas around the centre; the camera sits in front of it
  vec2 uv = (gl_FragCoord.xy - uCenter) / uRadius;
  vec3 ro = vec3(0.0, 0.0, 4.5);
  vec3 rd = normalize(vec3(uv, 0.0) - ro);

  // bounding sphere (the drop, its lean and its tallest spikes): most pixels miss it and leave at once
  float bound = 2.6;
  float bb = dot(ro, rd);
  float disc = bb * bb - (dot(ro, ro) - bound * bound);
  if (disc < 0.0) { gl_FragColor = vec4(0.0); return; }
  float t = max(-bb - sqrt(disc), 0.0);
  float tEnd = -bb + sqrt(disc);

  // The spikes make the field far from a true distance near their flanks, so the march takes short
  // steps. The hit test is tight and absolute: a loose one stops at slightly different depths from
  // pixel to pixel, and the mirror shading turns those into contour rings.
  float closest = 1e3;
  vec3 p = ro;
  for (int i = 0; i < 110; i++) {
    p = ro + rd * t;
    float d = map(p);
    closest = min(closest, d);
    if (d < 0.00008 || t > tEnd) break;
    t += d * 0.42;
  }

  // soft silhouette: coverage from how close the ray came, about a pixel and a half wide
  float alpha = 1.0 - smoothstep(0.0, 1.5 / uRadius, closest);
  if (alpha <= 0.0) { gl_FragColor = vec4(0.0); return; }

  vec3 n = normalAt(p);
  vec3 v = -rd;
  vec3 r = reflect(rd, n);
  float fresnel = 0.08 + 0.92 * pow(1.0 - clamp(dot(n, v), 0.0, 1.0), 4.0);
  float key = pow(max(dot(r, normalize(vec3(-0.5, 0.75, 0.45))), 0.0), 90.0);

  vec3 col = INK * (0.35 + uDark * 0.6);
  col += environment(r) * mix(0.32, 1.0, fresnel) * (1.0 + uDark * 0.35);
  col += vec3(1.0) * key * 1.4;
  // a grain of noise below one 8-bit step: smooth dark gradients otherwise show bands
  col += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;
  gl_FragColor = vec4(col * alpha, alpha);
}
`

// springs, so the field and the magnet overshoot a little and settle like a liquid would
interface Spring { value: number, velocity: number, target: number }
const spring = (value = 0): Spring => ({ value, velocity: 0, target: value })
// at rest the magnet hangs above and in front of the drop, so the idle spikes point up and out
const REST = { x: 0.5, y: 1.1 }
const magnetX = spring(REST.x)
const magnetY = spring(REST.y)
const field = spring(0.3)
const splash = spring()

function step(s: Spring, dt: number, stiffness: number, damping: number) {
  s.velocity += ((s.target - s.value) * stiffness - s.velocity * damping) * dt
  s.value += s.velocity * dt
}

/** 0 with the pointer far away (or gone), 1 right at the drop. */
let near = 0
let gl: WebGLRenderingContext | null = null
let uniforms: Record<string, WebGLUniformLocation | null> = {}
let quality = 1
let time = 0
let visible = false
let slowFrames = 0

const radius = () => props.size * Math.min(gl!.drawingBufferWidth, gl!.drawingBufferHeight)

function compile(type: number, source: string) {
  const shader = gl!.createShader(type)!
  gl!.shaderSource(shader, source)
  gl!.compileShader(shader)
  if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) throw new Error(gl!.getShaderInfoLog(shader) ?? 'shader')
  return shader
}

function setup(el: HTMLCanvasElement) {
  gl = el.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, powerPreference: 'high-performance' })
  if (!gl) throw new Error('no webgl')
  const program = gl.createProgram()!
  gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX))
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT))
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? 'program')
  gl.useProgram(program)

  // one triangle that covers the whole viewport
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const position = gl.getAttribLocation(program, 'aPosition')
  gl.enableVertexAttribArray(position)
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

  for (const name of ['uCenter', 'uRadius', 'uTime', 'uMagnet', 'uField', 'uSplash', 'uDark']) {
    uniforms[name] = gl.getUniformLocation(program, name)
  }
}

function resize() {
  const el = canvas.value
  if (!el || !gl) return
  const scale = Math.min(devicePixelRatio || 1, 1.5) * quality
  el.width = Math.max(1, Math.round(el.clientWidth * scale))
  el.height = Math.max(1, Math.round(el.clientHeight * scale))
  gl.viewport(0, 0, el.width, el.height)
}

function draw() {
  if (!gl) return
  const w = gl.drawingBufferWidth
  const h = gl.drawingBufferHeight
  gl.uniform2f(uniforms.uCenter!, props.x * w, (1 - props.y) * h)
  gl.uniform1f(uniforms.uRadius!, radius())
  gl.uniform1f(uniforms.uTime!, time)
  gl.uniform3f(uniforms.uMagnet!, magnetX.value, magnetY.value, 1.6)
  gl.uniform1f(uniforms.uField!, gsap.utils.clamp(0, 1.2, field.value))
  gl.uniform1f(uniforms.uSplash!, Math.max(0, splash.value))
  gl.uniform1f(uniforms.uDark!, colorMode.value === 'dark' ? 1 : 0)
  gl.clearColor(0, 0, 0, 0)
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.drawArrays(gl.TRIANGLES, 0, 3)
}

function tick(_now: number, deltaMs: number) {
  // off screen, in a hidden tab, or not laid out at all (display: none on small screens): no frame
  if (!visible || document.hidden || !gl || !canvas.value?.offsetWidth) return
  const dt = Math.min(deltaMs, 50) / 1000
  time += dt
  // the resting field breathes; the pointer's closeness adds the rest of the way to full strength
  const breath = 0.28 + 0.08 * Math.sin(time * 0.6)
  field.target = breath + (1 - breath) * near
  step(magnetX, dt, 40, 9)
  step(magnetY, dt, 40, 9)
  step(field, dt, 30, 6)
  step(splash, dt, 40, 5)
  draw()
  // frames running long: draw fewer pixels rather than drop frames
  slowFrames = deltaMs > 24 ? slowFrames + 1 : Math.max(0, slowFrames - 1)
  if (slowFrames > 40 && quality > 0.5) {
    quality = Math.max(0.5, quality - 0.15)
    slowFrames = 0
    resize()
  }
}

// the pointer in scene units around the drop's centre (one unit = the drop's radius)
function local(event: PointerEvent) {
  const rect = canvas.value!.getBoundingClientRect()
  const unit = props.size * Math.min(rect.width, rect.height)
  return {
    x: (event.clientX - rect.left - props.x * rect.width) / unit,
    y: -(event.clientY - rect.top - props.y * rect.height) / unit,
  }
}

function onPointer(event: PointerEvent) {
  if (!canvas.value || !gl) return
  const { x, y } = local(event)
  const length = Math.hypot(x, y)
  // the magnet follows the pointer, but never farther than a few radii (spikes point at it either way)
  const cap = Math.min(length, 3) / (length || 1)
  magnetX.target = x * cap
  magnetY.target = y * cap
  near = 1 - gsap.utils.clamp(0, 1, (length - 1.2) / 3.2)
}

function release() {
  near = 0
  magnetX.target = REST.x
  magnetY.target = REST.y
}

// a click on the drop knocks the spikes flat for a moment and sets the surface rippling
function onDown(event: PointerEvent) {
  if (!canvas.value) return
  const { x, y } = local(event)
  if (Math.hypot(x, y) > 1.6) return
  field.velocity -= 5
  splash.velocity += 7
}

useGsap(({ reduceMotion }) => {
  const el = canvas.value
  if (!el) return
  try {
    setup(el)
  }
  catch {
    failed.value = true
    return
  }
  resize()
  el.addEventListener('webglcontextlost', () => {
    failed.value = true
    gl = null
  })

  if (reduceMotion) {
    // a still drop: one frame, redrawn only when something changes it
    visible = false
    draw()
    return
  }

  whileOnScreen(el, (onScreen) => {
    visible = onScreen
  })
  gsap.ticker.add(tick)
  return () => gsap.ticker.remove(tick)
}, canvas)

useResizeObserver(canvas, () => {
  resize()
  draw()
})
watch(() => colorMode.value, () => draw(), { flush: 'post' })
watch(() => [props.x, props.y, props.size], () => draw())
useEventListener('pointermove', onPointer, { passive: true })
useEventListener('pointerdown', onDown, { passive: true })
useEventListener(import.meta.client ? document.documentElement : undefined, 'pointerleave', release)

onBeforeUnmount(() => {
  gl?.getExtension('WEBGL_lose_context')?.loseContext()
  gl = null
  uniforms = {}
})
</script>

<template>
  <div
    class="pointer-events-none"
    aria-hidden="true"
  >
    <canvas
      v-if="!failed"
      ref="canvas"
      class="block size-full"
    />
    <!-- no WebGL: a still glossy drop in CSS, so the composition keeps its weight -->
    <span
      v-if="failed"
      class="drop-fallback"
      :style="{ 'left': `${x * 100}%`, 'top': `${y * 100}%`, '--size': `${size * 200}vmin` }"
    />
  </div>
</template>

<style scoped>
.drop-fallback {
  position: absolute;
  width: var(--size);
  height: var(--size);
  translate: -50% -50%;
  border-radius: 50%;
  background:
    radial-gradient(circle at 34% 28%, rgb(255 255 255 / 0.85), transparent 12%),
    radial-gradient(circle at 72% 78%, rgb(255 79 26 / 0.55), transparent 30%),
    radial-gradient(circle at 50% 50%, #26262b, #111113 70%);
}
</style>
