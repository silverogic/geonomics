import { PIXEL_MAP_COLS, PIXEL_MAP_ROWS } from '../data/pixelMapData'

export interface GpuLandDotInput {
  x: number
  y: number
  z: number
  countryId: string
  isEdge: boolean
  c: number
  r: number
}

export interface GpuVec3 {
  x: number
  y: number
  z: number
}

export interface GlobeGpuRenderParams {
  width: number
  height: number
  dpr: number
  cx: number
  cy: number
  radius: number
  rotLonRad: number
  rotLatRad: number
  morph: number
  globeBgAlpha: number
  mapLeft: number
  mapTop: number
  mapW: number
  mapH: number
  isGdpMode: boolean
  activeMode: 'gdp' | 'stocks' | 'fx' | 'news'
}

export interface GlobeGpuStyleUpdateParams {
  activeMode: 'gdp' | 'stocks' | 'fx' | 'news'
  gdpMap: Map<
    string,
    {
      colorTier: number
      terrainElev: number
    }
  >
  stockBucketMap: Map<string, number>
  fxBucketMap: Map<string, number>
  newsBucketMap: Map<string, number>
}

export interface GlobeGpuRenderer {
  readonly gpuName: string
  readonly isContextLost: () => boolean
  updateDotStyles: (params: GlobeGpuStyleUpdateParams) => void
  renderFrame: (params: GlobeGpuRenderParams) => boolean
  clear: (width: number, height: number, dpr: number) => void
  dispose: () => void
}

// RGBA [0..1] palettes matching FinancialGlobeView.tsx
// GDP_VOXEL_STYLES (7 tiers: 0..6)
const GDP_SIDE_WALL_RGBA: Array<[number, number, number, number]> = [
  [6 / 255, 78 / 255, 59 / 255, 0.32],
  [6 / 255, 95 / 255, 70 / 255, 0.55],
  [4 / 255, 120 / 255, 87 / 255, 0.68],
  [5 / 255, 150 / 255, 105 / 255, 0.78],
  [16 / 255, 185 / 255, 129 / 255, 0.85],
  [202 / 255, 138 / 255, 4 / 255, 0.55],
  [217 / 255, 119 / 255, 6 / 255, 0.85],
]

const GDP_TOP_MID_RGBA: Array<[number, number, number, number]> = [
  [16 / 255, 185 / 255, 129 / 255, 0.34],
  [16 / 255, 185 / 255, 129 / 255, 0.52],
  [52 / 255, 211 / 255, 153 / 255, 0.68],
  [110 / 255, 231 / 255, 183 / 255, 0.8],
  [167 / 255, 243 / 255, 208 / 255, 0.9],
  [253 / 255, 230 / 255, 138 / 255, 0.78],
  [251 / 255, 191 / 255, 36 / 255, 0.9],
]

const GDP_TOP_FRONT_RGBA: Array<[number, number, number, number]> = [
  [52 / 255, 211 / 255, 153 / 255, 0.52],
  [52 / 255, 211 / 255, 153 / 255, 0.72],
  [110 / 255, 231 / 255, 183 / 255, 0.88],
  [167 / 255, 243 / 255, 208 / 255, 0.95],
  [209 / 255, 250 / 255, 229 / 255, 1.0],
  [254 / 255, 243 / 255, 199 / 255, 0.95],
  [252 / 255, 211 / 255, 77 / 255, 1.0],
]

// STOCK_DOT_STYLES (8 buckets: 0..7)
const STOCK_MID_RGBA: Array<[number, number, number, number]> = [
  [51 / 255, 65 / 255, 85 / 255, 0.38],
  [190 / 255, 18 / 255, 60 / 255, 0.78],
  [225 / 255, 29 / 255, 72 / 255, 0.68],
  [244 / 255, 63 / 255, 94 / 255, 0.55],
  [100 / 255, 116 / 255, 139 / 255, 0.52],
  [16 / 255, 185 / 255, 129 / 255, 0.58],
  [16 / 255, 185 / 255, 129 / 255, 0.72],
  [52 / 255, 211 / 255, 153 / 255, 0.85],
]

const STOCK_FRONT_RGBA: Array<[number, number, number, number]> = [
  [71 / 255, 85 / 255, 105 / 255, 0.55],
  [244 / 255, 63 / 255, 94 / 255, 0.96],
  [251 / 255, 113 / 255, 133 / 255, 0.88],
  [253 / 255, 164 / 255, 175 / 255, 0.78],
  [148 / 255, 163 / 255, 184 / 255, 0.72],
  [52 / 255, 211 / 255, 153 / 255, 0.8],
  [110 / 255, 231 / 255, 183 / 255, 0.92],
  [167 / 255, 243 / 255, 208 / 255, 1.0],
]

// NEWS_DOT_STYLES (8 buckets: 0..7)
const NEWS_MID_RGBA: Array<[number, number, number, number]> = [
  [51 / 255, 65 / 255, 85 / 255, 0.34],
  [120 / 255, 53 / 255, 15 / 255, 0.5],
  [146 / 255, 64 / 255, 14 / 255, 0.56],
  [180 / 255, 83 / 255, 9 / 255, 0.62],
  [217 / 255, 119 / 255, 6 / 255, 0.68],
  [245 / 255, 158 / 255, 11 / 255, 0.76],
  [251 / 255, 191 / 255, 36 / 255, 0.84],
  [252 / 255, 211 / 255, 77 / 255, 0.92],
]

const NEWS_FRONT_RGBA: Array<[number, number, number, number]> = [
  [71 / 255, 85 / 255, 105 / 255, 0.5],
  [146 / 255, 64 / 255, 14 / 255, 0.68],
  [180 / 255, 83 / 255, 9 / 255, 0.75],
  [217 / 255, 119 / 255, 6 / 255, 0.82],
  [245 / 255, 158 / 255, 11 / 255, 0.88],
  [251 / 255, 191 / 255, 36 / 255, 0.94],
  [252 / 255, 211 / 255, 77 / 255, 0.98],
  [254 / 255, 243 / 255, 199 / 255, 1.0],
]

function getGdpStructTier(colorTier: number): number {
  if (colorTier === 6) return 4
  if (colorTier === 5) return 3
  return colorTier
}

function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string
): WebGLShader | null {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader)
    return null
  }
  return shader
}

function createProgram(
  gl: WebGL2RenderingContext,
  vsSource: string,
  fsSource: string
): WebGLProgram | null {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vsSource)
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fsSource)
  if (!vs || !fs) {
    if (vs) gl.deleteShader(vs)
    if (fs) gl.deleteShader(fs)
    return null
  }
  const program = gl.createProgram()
  if (!program) return null
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  gl.deleteShader(vs)
  gl.deleteShader(fs)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program)
    return null
  }
  return program
}

// 1. Sphere & Atmospheric Halo Shader
const SPHERE_VS = `#version 300 es
precision highp float;
in vec2 aQuadPos;
uniform vec2 uViewport;
uniform vec2 uCenter;
uniform float uRadius;
out vec2 vScreenPos;

void main() {
  float extent = uRadius * 1.36;
  vec2 pos = uCenter + aQuadPos * extent;
  vScreenPos = pos;
  vec2 ndc = vec2(
    (pos.x / uViewport.x) * 2.0 - 1.0,
    1.0 - (pos.y / uViewport.y) * 2.0
  );
  gl_Position = vec4(ndc, 0.0, 1.0);
}
`

const SPHERE_FS = `#version 300 es
precision highp float;
in vec2 vScreenPos;
uniform vec2 uCenter;
uniform float uRadius;
uniform float uBgAlpha;
out vec4 fragColor;

void main() {
  vec2 dVec = vScreenPos - uCenter;
  float dist = length(dVec);
  float rNorm = dist / max(1.0, uRadius);

  if (rNorm > 1.34) {
    discard;
  }

  // 1. Outer Atmospheric Halo Radial Gradient (0.72R -> 1.34R)
  float haloT = clamp((rNorm - 0.72) / (1.34 - 0.72), 0.0, 1.0);
  vec4 haloC0 = vec4(16.0 / 255.0, 185.0 / 255.0, 129.0 / 255.0, 0.16);
  vec4 haloC1 = vec4(79.0 / 255.0, 70.0 / 255.0, 229.0 / 255.0, 0.16);
  vec4 haloC2 = vec4(2.0 / 255.0, 6.0 / 255.0, 23.0 / 255.0, 0.0);
  vec4 haloColor = haloT < 0.45
    ? mix(haloC0, haloC1, haloT / 0.45)
    : mix(haloC1, haloC2, (haloT - 0.45) / 0.55);

  // Smooth anti-aliased sphere coverage
  float aa = 1.1 / max(1.0, uRadius);
  float sphereCov = 1.0 - smoothstep(1.0 - aa, 1.0 + aa, rNorm);

  vec4 outColor = vec4(haloColor.rgb * haloColor.a, haloColor.a);

  if (sphereCov > 0.001) {
    // 2. 3D Sphere Ocean Body with Specular Highlight offset at (-0.28R, -0.28R)
    vec2 specFocus = uCenter - vec2(uRadius * 0.28);
    float specDist = length(vScreenPos - specFocus);
    float r0 = uRadius * 0.08;
    float r1 = uRadius;
    float specT = clamp((specDist - r0) / max(1.0, r1 - r0), 0.0, 1.0);

    vec3 col0 = vec3(19.0 / 255.0, 32.0 / 255.0, 70.0 / 255.0); // #132046
    vec3 col1 = vec3(9.0 / 255.0, 17.0 / 255.0, 40.0 / 255.0);  // #091128
    vec3 col2 = vec3(4.0 / 255.0, 8.0 / 255.0, 23.0 / 255.0);   // #040817
    vec3 bodyRgb = specT < 0.65
      ? mix(col0, col1, specT / 0.65)
      : mix(col1, col2, (specT - 0.65) / 0.35);

    // Crisp Atmospheric Rim Ring at rNorm == 1.0
    float rimDist = abs(dist - uRadius);
    float rimCov = 1.0 - smoothstep(0.0, 1.35, rimDist);
    vec3 rimRgb = vec3(52.0 / 255.0, 211.0 / 255.0, 153.0 / 255.0);
    float rimAlpha = 0.30 * rimCov;

    vec3 combinedSphereRgb = mix(bodyRgb, rimRgb, rimAlpha);
    vec4 spherePre = vec4(combinedSphereRgb * sphereCov, sphereCov);

    // Composite sphere over halo (premultiplied alpha)
    outColor = spherePre + outColor * (1.0 - spherePre.a);
  }

  fragColor = outColor * uBgAlpha;
}
`

// 2. Graticule Wireframe Lines Shader
const GRATICULE_VS = `#version 300 es
precision highp float;
in vec3 aPos;
uniform vec2 uViewport;
uniform vec2 uCenter;
uniform float uRadius;
uniform vec2 uRotLon; // (cosLon, sinLon)
uniform vec2 uRotLat; // (cosLat, sinLat)
out float vZ;

void main() {
  float x1 = aPos.x * uRotLon.x + aPos.z * uRotLon.y;
  float z1 = -aPos.x * uRotLon.y + aPos.z * uRotLon.x;
  float y1 = aPos.y;

  float y2 = y1 * uRotLat.x - z1 * uRotLat.y;
  float z2 = y1 * uRotLat.y + z1 * uRotLat.x;

  vZ = z2;
  vec2 screenPos = uCenter + vec2(x1, y2) * uRadius;
  vec2 ndc = vec2(
    (screenPos.x / uViewport.x) * 2.0 - 1.0,
    1.0 - (screenPos.y / uViewport.y) * 2.0
  );
  gl_Position = vec4(ndc, 0.0, 1.0);
}
`

const GRATICULE_FS = `#version 300 es
precision highp float;
in float vZ;
uniform float uBgAlpha;
out vec4 fragColor;

void main() {
  if (vZ < -0.15) {
    discard;
  }
  float a = 0.13 * uBgAlpha;
  vec3 rgb = vec3(99.0 / 255.0, 102.0 / 255.0, 241.0 / 255.0);
  fragColor = vec4(rgb * a, a);
}
`

// 3. Instanced Continent & 3D Voxel Dots Shader
const DOTS_VS = `#version 300 es
precision highp float;

// Per-vertex quad corner [-1..1, -1..1]
in vec2 aCorner;

// Static per-instance attributes
in vec3 aUnitVec;
in vec2 aGridCR;
in float aIsEdge;

// Dynamic per-instance style attributes
in float aTerrainElev;
in float aMaxLayers;
in float aStructTier;
in vec4 aSideColor;
in vec4 aMidColor;
in vec4 aFrontColor;

uniform vec2 uViewport;
uniform vec2 uCenter;
uniform float uRadius;
uniform vec2 uRotLon; // (cosLon, sinLon)
uniform vec2 uRotLat; // (cosLat, sinLat)
uniform float uMorph;
uniform vec4 uMapRect; // (mapLeft, mapTop, mapW, mapH)
uniform float uDotSizeBack;
uniform float uDotSizeFront;
uniform float uTarget2dRadius;
uniform float uCanvasDotFade;
uniform int uIsGdpMode;
uniform int uPass; // 0 = back dots, 1 = GDP voxel side wall layer, 2 = front top cap
uniform float uLayerIndex;
uniform float uActiveTier; // -1.0 = all tiers, 0..6 = filter by GDP colorTier

out vec2 vCorner;
out vec4 vColor;

void main() {
  if (uActiveTier >= 0.0 && abs(aStructTier - uActiveTier) > 0.1) {
    gl_Position = vec4(2.0, 2.0, 0.0, 1.0);
    return;
  }
  // Rotate unit vector on sphere
  float x1 = aUnitVec.x * uRotLon.x + aUnitVec.z * uRotLon.y;
  float z1 = -aUnitVec.x * uRotLon.y + aUnitVec.z * uRotLon.x;
  float y1 = aUnitVec.y;

  float y2 = y1 * uRotLat.x - z1 * uRotLat.y;
  float z2 = y1 * uRotLat.y + z1 * uRotLat.x;

  bool isMorphing = uMorph >= 0.001;
  float elevMultiplier = 1.25;

  vec2 centerPos = vec2(-9999.0);
  float dotRadius = 0.0;
  vec4 color = vec4(0.0);

  if (uPass == 0) {
    // Back hemisphere dots (z2 < 0.0)
    if (z2 >= 0.0) {
      gl_Position = vec4(2.0, 2.0, 0.0, 1.0);
      return;
    }
    vec2 pos3d = uCenter + vec2(x1, y2) * uRadius;
    if (!isMorphing) {
      centerPos = pos3d;
      dotRadius = uDotSizeBack;
      color = vec4(71.0 / 255.0, 85.0 / 255.0, 105.0 / 255.0, 0.14);
    } else {
      vec2 pos2d = uMapRect.xy + vec2(
        ((aGridCR.x + 0.5) / ${PIXEL_MAP_COLS.toFixed(1)}) * uMapRect.z,
        ((aGridCR.y + 0.5) / ${PIXEL_MAP_ROWS.toFixed(1)}) * uMapRect.w
      );
      centerPos = mix(pos3d, pos2d, uMorph);
      dotRadius = mix(uDotSizeFront, uTarget2dRadius, uMorph);
      float backAlpha = uCanvasDotFade * min(1.0, 0.14 + uMorph * 1.9);
      color = vec4(aMidColor.rgb, aMidColor.a * backAlpha);
    }
  } else if (uPass == 1) {
    // 3D GDP Voxel Side Wall Layer (only when !isMorphing and uIsGdpMode == 1)
    if (z2 < 0.0 || uLayerIndex >= aMaxLayers - 1.0) {
      gl_Position = vec4(2.0, 2.0, 0.0, 1.0);
      return;
    }
    if (aIsEdge < 0.5 && z2 > 0.72) {
      gl_Position = vec4(2.0, 2.0, 0.0, 1.0);
      return;
    }
    float layerFrac = uLayerIndex / max(1.0, aMaxLayers - 1.0);
    float rawDelta = aTerrainElev - 1.0;
    float elev = 1.0 + rawDelta * elevMultiplier * layerFrac;
    centerPos = uCenter + vec2(x1, y2) * (uRadius * elev);
    dotRadius = uDotSizeFront * 0.96;
    color = aSideColor;
  } else {
    // Front Top Cap (z2 >= 0.0)
    if (z2 < 0.0) {
      gl_Position = vec4(2.0, 2.0, 0.0, 1.0);
      return;
    }
    float rawDelta = aTerrainElev - 1.0;
    float elev = uIsGdpMode == 1
      ? 1.0 + rawDelta * elevMultiplier * (1.0 - uMorph)
      : 1.0;
    vec2 pos3d = uCenter + vec2(x1, y2) * (uRadius * elev);

    if (!isMorphing) {
      centerPos = pos3d;
      if (z2 < 0.5) {
        dotRadius = uIsGdpMode == 1
          ? uDotSizeFront * (0.88 + aStructTier * 0.025)
          : uDotSizeFront * 0.90;
        color = aMidColor;
      } else {
        dotRadius = uIsGdpMode == 1
          ? uDotSizeFront * (0.94 + aStructTier * 0.03)
          : uDotSizeFront * 0.98;
        color = aFrontColor;
      }
    } else {
      vec2 pos2d = uMapRect.xy + vec2(
        ((aGridCR.x + 0.5) / ${PIXEL_MAP_COLS.toFixed(1)}) * uMapRect.z,
        ((aGridCR.y + 0.5) / ${PIXEL_MAP_ROWS.toFixed(1)}) * uMapRect.w
      );
      centerPos = mix(pos3d, pos2d, uMorph);
      dotRadius = mix(uDotSizeFront, uTarget2dRadius, uMorph);
      color = vec4(aFrontColor.rgb, aFrontColor.a * uCanvasDotFade);
    }
  }

  vCorner = aCorner;
  vColor = color;

  // Expand quad slightly by 0.65px for smooth anti-aliased circle edge
  float quadRadius = dotRadius + 0.65;
  vec2 finalScreen = centerPos + aCorner * quadRadius;
  vec2 ndc = vec2(
    (finalScreen.x / uViewport.x) * 2.0 - 1.0,
    1.0 - (finalScreen.y / uViewport.y) * 2.0
  );
  gl_Position = vec4(ndc, 0.0, 1.0);
}
`

const DOTS_FS = `#version 300 es
precision highp float;
in vec2 vCorner;
in vec4 vColor;
out vec4 fragColor;

void main() {
  float r = length(vCorner);
  if (r > 1.0) {
    discard;
  }
  // Crisp anti-aliased circular dot matching Canvas 2D arc()
  float edgeAlpha = 1.0 - smoothstep(0.78, 1.0, r);
  float a = vColor.a * edgeAlpha;
  fragColor = vec4(vColor.rgb * a, a);
}
`

export function createGlobeGpuRenderer(
  canvas: HTMLCanvasElement,
  landDots: GpuLandDotInput[],
  graticuleLines: GpuVec3[][],
  onContextLost?: () => void
): GlobeGpuRenderer | null {
  let gl: WebGL2RenderingContext | null = null
  try {
    gl = canvas.getContext('webgl2', {
      alpha: true,
      antialias: true,
      depth: false,
      stencil: false,
      premultipliedAlpha: true,
      powerPreference: 'high-performance',
      failIfMajorPerformanceCaveat: true,
    })
  } catch {
    return null
  }

  if (!gl) return null

  // Verify it is not a software emulation renderer
  let gpuName = 'WebGL2 Hardware GPU'
  try {
    const dbgExt = gl.getExtension('WEBGL_debug_renderer_info')
    if (dbgExt) {
      const unmasked = gl.getParameter(dbgExt.UNMASKED_RENDERER_WEBGL)
      if (typeof unmasked === 'string' && unmasked.trim().length > 0) {
        if (/swiftshader|llvmpipe|software|microsoft basic render/i.test(unmasked)) {
          return null
        }
        gpuName = unmasked
          .replace(/^ANGLE \((.+)\)$/i, '$1')
          .split(',')[1]
          ?.trim() || unmasked.trim()
      }
    }
  } catch {
    // Ignore extension query errors
  }

  const sphereProg = createProgram(gl, SPHERE_VS, SPHERE_FS)
  const graticuleProg = createProgram(gl, GRATICULE_VS, GRATICULE_FS)
  const dotsProg = createProgram(gl, DOTS_VS, DOTS_FS)

  if (!sphereProg || !graticuleProg || !dotsProg) {
    if (sphereProg) gl.deleteProgram(sphereProg)
    if (graticuleProg) gl.deleteProgram(graticuleProg)
    if (dotsProg) gl.deleteProgram(dotsProg)
    return null
  }

  let contextLost = false
  const handleContextLost = (e: Event) => {
    e.preventDefault()
    contextLost = true
    onContextLost?.()
  }
  canvas.addEventListener('webglcontextlost', handleContextLost, false)

  // --- 1. Sphere Quad VAO ---
  const sphereVao = gl.createVertexArray()
  const quadCornerBuffer = gl.createBuffer()
  const quadCorners = new Float32Array([
    -1, -1,
     1, -1,
    -1,  1,
    -1,  1,
     1, -1,
     1,  1,
  ])
  gl.bindVertexArray(sphereVao)
  gl.bindBuffer(gl.ARRAY_BUFFER, quadCornerBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, quadCorners, gl.STATIC_DRAW)
  const spherePosLoc = gl.getAttribLocation(sphereProg, 'aQuadPos')
  gl.enableVertexAttribArray(spherePosLoc)
  gl.vertexAttribPointer(spherePosLoc, 2, gl.FLOAT, false, 0, 0)
  gl.bindVertexArray(null)

  // --- 2. Graticule Lines VAO ---
  const graticuleVao = gl.createVertexArray()
  const graticuleBuffer = gl.createBuffer()
  const graticuleDraws: Array<{ first: number; count: number }> = []
  const graticuleFloats: number[] = []
  let vertexCursor = 0
  for (const line of graticuleLines) {
    if (line.length < 2) continue
    const first = vertexCursor
    for (const pt of line) {
      graticuleFloats.push(pt.x, pt.y, pt.z)
      vertexCursor++
    }
    graticuleDraws.push({ first, count: line.length })
  }
  gl.bindVertexArray(graticuleVao)
  gl.bindBuffer(gl.ARRAY_BUFFER, graticuleBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(graticuleFloats), gl.STATIC_DRAW)
  const gratPosLoc = gl.getAttribLocation(graticuleProg, 'aPos')
  gl.enableVertexAttribArray(gratPosLoc)
  gl.vertexAttribPointer(gratPosLoc, 3, gl.FLOAT, false, 0, 0)
  gl.bindVertexArray(null)

  // --- 3. Instanced Land Dots VAO ---
  const dotCount = landDots.length
  const dotsVao = gl.createVertexArray()
  const staticDotBuffer = gl.createBuffer()
  const dynamicDotBuffer = gl.createBuffer()

  // Static per-dot attributes: [x, y, z, c, r, isEdge] = 6 floats per dot
  const staticDotData = new Float32Array(dotCount * 6)
  for (let i = 0; i < dotCount; i++) {
    const d = landDots[i]
    const base = i * 6
    staticDotData[base + 0] = d.x
    staticDotData[base + 1] = d.y
    staticDotData[base + 2] = d.z
    staticDotData[base + 3] = d.c
    staticDotData[base + 4] = d.r
    staticDotData[base + 5] = d.isEdge ? 1.0 : 0.0
  }

  // Dynamic per-dot style attributes:
  // [terrainElev, maxLayers, structTier, sideR, sideG, sideB, sideA, midR, midG, midB, midA, frontR, frontG, frontB, frontA] = 15 floats per dot
  const DYNAMIC_STRIDE_FLOATS = 15
  const DYNAMIC_STRIDE_BYTES = DYNAMIC_STRIDE_FLOATS * 4
  const dynamicDotData = new Float32Array(dotCount * DYNAMIC_STRIDE_FLOATS)

  gl.bindVertexArray(dotsVao)

  // Quad corner attribute (divisor = 0)
  gl.bindBuffer(gl.ARRAY_BUFFER, quadCornerBuffer)
  const cornerLoc = gl.getAttribLocation(dotsProg, 'aCorner')
  gl.enableVertexAttribArray(cornerLoc)
  gl.vertexAttribPointer(cornerLoc, 2, gl.FLOAT, false, 0, 0)
  gl.vertexAttribDivisor(cornerLoc, 0)

  // Static instance attributes (divisor = 1)
  gl.bindBuffer(gl.ARRAY_BUFFER, staticDotBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, staticDotData, gl.STATIC_DRAW)
  const STATIC_STRIDE_BYTES = 6 * 4

  const unitVecLoc = gl.getAttribLocation(dotsProg, 'aUnitVec')
  if (unitVecLoc >= 0) {
    gl.enableVertexAttribArray(unitVecLoc)
    gl.vertexAttribPointer(unitVecLoc, 3, gl.FLOAT, false, STATIC_STRIDE_BYTES, 0)
    gl.vertexAttribDivisor(unitVecLoc, 1)
  }

  const gridCrLoc = gl.getAttribLocation(dotsProg, 'aGridCR')
  if (gridCrLoc >= 0) {
    gl.enableVertexAttribArray(gridCrLoc)
    gl.vertexAttribPointer(gridCrLoc, 2, gl.FLOAT, false, STATIC_STRIDE_BYTES, 3 * 4)
    gl.vertexAttribDivisor(gridCrLoc, 1)
  }

  const isEdgeLoc = gl.getAttribLocation(dotsProg, 'aIsEdge')
  if (isEdgeLoc >= 0) {
    gl.enableVertexAttribArray(isEdgeLoc)
    gl.vertexAttribPointer(isEdgeLoc, 1, gl.FLOAT, false, STATIC_STRIDE_BYTES, 5 * 4)
    gl.vertexAttribDivisor(isEdgeLoc, 1)
  }

  // Dynamic instance attributes (divisor = 1)
  gl.bindBuffer(gl.ARRAY_BUFFER, dynamicDotBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, dynamicDotData.byteLength, gl.DYNAMIC_DRAW)

  const bindDynAttr = (name: string, size: number, offsetFloats: number) => {
    const loc = gl!.getAttribLocation(dotsProg, name)
    if (loc >= 0) {
      gl!.enableVertexAttribArray(loc)
      gl!.vertexAttribPointer(loc, size, gl!.FLOAT, false, DYNAMIC_STRIDE_BYTES, offsetFloats * 4)
      gl!.vertexAttribDivisor(loc, 1)
    }
  }

  bindDynAttr('aTerrainElev', 1, 0)
  bindDynAttr('aMaxLayers', 1, 1)
  bindDynAttr('aStructTier', 1, 2)
  bindDynAttr('aSideColor', 4, 3)
  bindDynAttr('aMidColor', 4, 7)
  bindDynAttr('aFrontColor', 4, 11)

  gl.bindVertexArray(null)

  // Uniform locations cache
  const sphereUniforms = {
    uViewport: gl.getUniformLocation(sphereProg, 'uViewport'),
    uCenter: gl.getUniformLocation(sphereProg, 'uCenter'),
    uRadius: gl.getUniformLocation(sphereProg, 'uRadius'),
    uBgAlpha: gl.getUniformLocation(sphereProg, 'uBgAlpha'),
  }

  const gratUniforms = {
    uViewport: gl.getUniformLocation(graticuleProg, 'uViewport'),
    uCenter: gl.getUniformLocation(graticuleProg, 'uCenter'),
    uRadius: gl.getUniformLocation(graticuleProg, 'uRadius'),
    uRotLon: gl.getUniformLocation(graticuleProg, 'uRotLon'),
    uRotLat: gl.getUniformLocation(graticuleProg, 'uRotLat'),
    uBgAlpha: gl.getUniformLocation(graticuleProg, 'uBgAlpha'),
  }

  const dotsUniforms = {
    uViewport: gl.getUniformLocation(dotsProg, 'uViewport'),
    uCenter: gl.getUniformLocation(dotsProg, 'uCenter'),
    uRadius: gl.getUniformLocation(dotsProg, 'uRadius'),
    uRotLon: gl.getUniformLocation(dotsProg, 'uRotLon'),
    uRotLat: gl.getUniformLocation(dotsProg, 'uRotLat'),
    uMorph: gl.getUniformLocation(dotsProg, 'uMorph'),
    uMapRect: gl.getUniformLocation(dotsProg, 'uMapRect'),
    uDotSizeBack: gl.getUniformLocation(dotsProg, 'uDotSizeBack'),
    uDotSizeFront: gl.getUniformLocation(dotsProg, 'uDotSizeFront'),
    uTarget2dRadius: gl.getUniformLocation(dotsProg, 'uTarget2dRadius'),
    uCanvasDotFade: gl.getUniformLocation(dotsProg, 'uCanvasDotFade'),
    uIsGdpMode: gl.getUniformLocation(dotsProg, 'uIsGdpMode'),
    uPass: gl.getUniformLocation(dotsProg, 'uPass'),
    uLayerIndex: gl.getUniformLocation(dotsProg, 'uLayerIndex'),
    uActiveTier: gl.getUniformLocation(dotsProg, 'uActiveTier'),
  }

  const updateDotStyles = (params: GlobeGpuStyleUpdateParams) => {
    if (contextLost || !gl) return
    const { activeMode, gdpMap, stockBucketMap, fxBucketMap, newsBucketMap } = params
    const isGdp = activeMode === 'gdp'

    for (let i = 0; i < dotCount; i++) {
      const cid = landDots[i].countryId
      const base = i * DYNAMIC_STRIDE_FLOATS

      if (isGdp) {
        const info = gdpMap.get(cid)
        const tier = Math.min(6, Math.max(0, info?.colorTier ?? 0))
        const structTier = getGdpStructTier(tier)
        const maxLayers =
          structTier === 4
            ? 7
            : structTier === 3
              ? 5
              : structTier === 2
                ? 4
                : structTier === 1
                  ? 2
                  : 1
        const terrainElev = info?.terrainElev ?? 1.004
        const side = GDP_SIDE_WALL_RGBA[tier]
        const mid = GDP_TOP_MID_RGBA[tier]
        const front = GDP_TOP_FRONT_RGBA[tier]

        dynamicDotData[base + 0] = terrainElev
        dynamicDotData[base + 1] = maxLayers
        dynamicDotData[base + 2] = structTier
        dynamicDotData[base + 3] = side[0]
        dynamicDotData[base + 4] = side[1]
        dynamicDotData[base + 5] = side[2]
        dynamicDotData[base + 6] = side[3]
        dynamicDotData[base + 7] = mid[0]
        dynamicDotData[base + 8] = mid[1]
        dynamicDotData[base + 9] = mid[2]
        dynamicDotData[base + 10] = mid[3]
        dynamicDotData[base + 11] = front[0]
        dynamicDotData[base + 12] = front[1]
        dynamicDotData[base + 13] = front[2]
        dynamicDotData[base + 14] = front[3]
      } else {
        const bucketMap =
          activeMode === 'stocks'
            ? stockBucketMap
            : activeMode === 'fx'
              ? fxBucketMap
              : newsBucketMap
        const bucket = Math.min(7, Math.max(0, bucketMap.get(cid) ?? 0))
        const midPalette = activeMode === 'news' ? NEWS_MID_RGBA : STOCK_MID_RGBA
        const frontPalette = activeMode === 'news' ? NEWS_FRONT_RGBA : STOCK_FRONT_RGBA
        const mid = midPalette[bucket]
        const front = frontPalette[bucket]

        dynamicDotData[base + 0] = 1.0
        dynamicDotData[base + 1] = 1.0
        dynamicDotData[base + 2] = 0.0
        dynamicDotData[base + 3] = 0.0
        dynamicDotData[base + 4] = 0.0
        dynamicDotData[base + 5] = 0.0
        dynamicDotData[base + 6] = 0.0
        dynamicDotData[base + 7] = mid[0]
        dynamicDotData[base + 8] = mid[1]
        dynamicDotData[base + 9] = mid[2]
        dynamicDotData[base + 10] = mid[3]
        dynamicDotData[base + 11] = front[0]
        dynamicDotData[base + 12] = front[1]
        dynamicDotData[base + 13] = front[2]
        dynamicDotData[base + 14] = front[3]
      }
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, dynamicDotBuffer)
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, dynamicDotData)
  }

  const clear = (width: number, height: number, dpr: number) => {
    if (contextLost || !gl) return
    const pw = Math.round(width * dpr)
    const ph = Math.round(height * dpr)
    if (canvas.width !== pw || canvas.height !== ph) {
      canvas.width = pw
      canvas.height = ph
    }
    gl.viewport(0, 0, pw, ph)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
  }

  const renderFrame = (params: GlobeGpuRenderParams): boolean => {
    if (contextLost || !gl || gl.isContextLost()) {
      contextLost = true
      return false
    }

    const {
      width,
      height,
      dpr,
      cx,
      cy,
      radius,
      rotLonRad,
      rotLatRad,
      morph,
      globeBgAlpha,
      mapLeft,
      mapTop,
      mapW,
      mapH,
      isGdpMode,
    } = params

    const pw = Math.round(width * dpr)
    const ph = Math.round(height * dpr)
    if (canvas.width !== pw || canvas.height !== ph) {
      canvas.width = pw
      canvas.height = ph
    }

    gl.viewport(0, 0, pw, ph)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

    const cosLon = Math.cos(rotLonRad)
    const sinLon = Math.sin(rotLonRad)
    const cosLat = Math.cos(rotLatRad)
    const sinLat = Math.sin(rotLatRad)

    // 1. Sphere Body + Atmospheric Halo + Rim Ring + Graticule Lines
    if (globeBgAlpha > 0.01) {
      gl.useProgram(sphereProg)
      gl.bindVertexArray(sphereVao)
      gl.uniform2f(sphereUniforms.uViewport, width, height)
      gl.uniform2f(sphereUniforms.uCenter, cx, cy)
      gl.uniform1f(sphereUniforms.uRadius, radius)
      gl.uniform1f(sphereUniforms.uBgAlpha, globeBgAlpha)
      gl.drawArrays(gl.TRIANGLES, 0, 6)

      gl.useProgram(graticuleProg)
      gl.bindVertexArray(graticuleVao)
      gl.uniform2f(gratUniforms.uViewport, width, height)
      gl.uniform2f(gratUniforms.uCenter, cx, cy)
      gl.uniform1f(gratUniforms.uRadius, radius)
      gl.uniform2f(gratUniforms.uRotLon, cosLon, sinLon)
      gl.uniform2f(gratUniforms.uRotLat, cosLat, sinLat)
      gl.uniform1f(gratUniforms.uBgAlpha, globeBgAlpha)
      for (let i = 0; i < graticuleDraws.length; i++) {
        const seg = graticuleDraws[i]
        gl.drawArrays(gl.LINE_STRIP, seg.first, seg.count)
      }
    }

    // 2. Continent & 3D Voxel Dots
    const canvasDotFade = morph > 0.85 ? Math.max(0, 1 - (morph - 0.85) / 0.15) : 1
    if (canvasDotFade > 0.01) {
      const dotSizeBack = Math.max(0.88, radius * 0.0052)
      const dotSizeFront = Math.max(1.38, radius * 0.0082)
      const target2dRadius = Math.max(dotSizeFront, (mapW / PIXEL_MAP_COLS) * 0.19)

      gl.useProgram(dotsProg)
      gl.bindVertexArray(dotsVao)
      gl.uniform2f(dotsUniforms.uViewport, width, height)
      gl.uniform2f(dotsUniforms.uCenter, cx, cy)
      gl.uniform1f(dotsUniforms.uRadius, radius)
      gl.uniform2f(dotsUniforms.uRotLon, cosLon, sinLon)
      gl.uniform2f(dotsUniforms.uRotLat, cosLat, sinLat)
      gl.uniform1f(dotsUniforms.uMorph, morph)
      gl.uniform4f(dotsUniforms.uMapRect, mapLeft, mapTop, mapW, mapH)
      gl.uniform1f(dotsUniforms.uDotSizeBack, dotSizeBack)
      gl.uniform1f(dotsUniforms.uDotSizeFront, dotSizeFront)
      gl.uniform1f(dotsUniforms.uTarget2dRadius, target2dRadius)
      gl.uniform1f(dotsUniforms.uCanvasDotFade, canvasDotFade)
      gl.uniform1i(dotsUniforms.uIsGdpMode, isGdpMode ? 1 : 0)

      // Pass 0: Back hemisphere dots
      gl.uniform1i(dotsUniforms.uPass, 0)
      gl.uniform1f(dotsUniforms.uLayerIndex, 0)
      gl.uniform1f(dotsUniforms.uActiveTier, -1.0)
      gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, dotCount)

      if (isGdpMode && morph < 0.001) {
        // Render 3D GDP Voxel Continents ordered by structural height tier (0..4)
        for (let st = 0; st <= 4; st++) {
          gl.uniform1f(dotsUniforms.uActiveTier, st)
          const maxLayers = st === 4 ? 7 : st === 3 ? 5 : st === 2 ? 4 : st === 1 ? 2 : 1
          if (maxLayers > 1) {
            gl.uniform1i(dotsUniforms.uPass, 1)
            for (let layer = 0; layer < maxLayers - 1; layer++) {
              gl.uniform1f(dotsUniforms.uLayerIndex, layer)
              gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, dotCount)
            }
          }
          gl.uniform1i(dotsUniforms.uPass, 2)
          gl.uniform1f(dotsUniforms.uLayerIndex, 0)
          gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, dotCount)
        }
      } else {
        // Pass 2: Front Top Cap (Stocks / FX / News or 3D->2D morphing)
        gl.uniform1i(dotsUniforms.uPass, 2)
        gl.uniform1f(dotsUniforms.uLayerIndex, 0)
        gl.uniform1f(dotsUniforms.uActiveTier, -1.0)
        gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, dotCount)
      }
    }

    gl.bindVertexArray(null)
    return true
  }

  const dispose = () => {
    canvas.removeEventListener('webglcontextlost', handleContextLost, false)
    if (!gl) return
    gl.deleteVertexArray(sphereVao)
    gl.deleteVertexArray(graticuleVao)
    gl.deleteVertexArray(dotsVao)
    gl.deleteBuffer(quadCornerBuffer)
    gl.deleteBuffer(graticuleBuffer)
    gl.deleteBuffer(staticDotBuffer)
    gl.deleteBuffer(dynamicDotBuffer)
    gl.deleteProgram(sphereProg)
    gl.deleteProgram(graticuleProg)
    gl.deleteProgram(dotsProg)
  }

  return {
    gpuName,
    isContextLost: () => contextLost,
    updateDotStyles,
    renderFrame,
    clear,
    dispose,
  }
}
