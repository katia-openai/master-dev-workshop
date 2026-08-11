import type { MotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { chapters } from "../data/journey";

type WebGLLandscapeProps = {
  activeChapter: number;
  progress: MotionValue<number>;
  reducedMotion: boolean;
};

const vertexSource = `
  attribute vec2 a_position;
  varying vec2 v_uv;

  void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const fragmentSource = `
  precision highp float;

  varying vec2 v_uv;

  uniform vec2 u_resolution;
  uniform float u_progress;
  uniform float u_time;
  uniform float u_motion;
  uniform vec3 u_accent;
  uniform vec3 u_glow;
  uniform vec2 u_focus0;
  uniform vec2 u_focus1;
  uniform vec2 u_focus2;
  uniform vec2 u_focus3;
  uniform vec2 u_focus4;
  uniform vec2 u_travel0;
  uniform vec2 u_travel1;
  uniform vec2 u_travel2;
  uniform vec2 u_travel3;
  uniform sampler2D u_scene0;
  uniform sampler2D u_scene1;
  uniform sampler2D u_scene2;
  uniform sampler2D u_scene3;
  uniform sampler2D u_scene4;

  float random(vec2 value) {
    return fract(sin(dot(value, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 point) {
    vec2 cell = floor(point);
    vec2 fraction = fract(point);
    fraction = fraction * fraction * (3.0 - 2.0 * fraction);

    return mix(
      mix(random(cell), random(cell + vec2(1.0, 0.0)), fraction.x),
      mix(random(cell + vec2(0.0, 1.0)), random(cell + vec2(1.0)), fraction.x),
      fraction.y
    );
  }

  vec2 cinematicUv(float scene, vec2 focus) {
    float scenePosition = scene * 0.25;
    float local = clamp((u_progress - scenePosition) * 4.0 + 0.5, 0.0, 1.0);
    float advance = smoothstep(0.0, 1.0, local);
    float zoom = mix(1.035, 1.46, advance * u_motion);
    float screenAspect = u_resolution.x / max(u_resolution.y, 1.0);
    float imageAspect = 1.5;
    vec2 cover = screenAspect > imageAspect
      ? vec2(1.0, imageAspect / screenAspect)
      : vec2(screenAspect / imageAspect, 1.0);
    vec2 textureFocus = vec2(focus.x, 1.0 - focus.y);
    vec2 halfFrame = cover * 0.5 / zoom;
    vec2 safeFocus = clamp(
      textureFocus,
      halfFrame + vec2(0.006),
      vec2(1.0) - halfFrame - vec2(0.006)
    );
    vec2 camera = mix(vec2(0.5), safeFocus, advance * 0.92 * u_motion);
    vec2 breathing = vec2(
      sin(u_time * 0.16 + scene * 1.31) * 0.0019,
      cos(u_time * 0.12 + scene * 0.73) * 0.0014
    ) * u_motion;

    return clamp(
      (v_uv - 0.5) * cover / zoom + camera + breathing,
      vec2(0.002),
      vec2(0.998)
    );
  }

  vec4 trackingScene(
    sampler2D image,
    float scene,
    vec2 focus,
    vec2 enteringDirection,
    vec2 leavingDirection,
    float entering,
    float leaving
  ) {
    vec2 tracking = vec2(
      leavingDirection.x * leaving * 0.16
        - enteringDirection.x * (1.0 - entering) * 0.13,
      leavingDirection.y * leaving * 0.09
        - enteringDirection.y * (1.0 - entering) * 0.07
    ) * u_motion;

    return texture2D(
      image,
      clamp(cinematicUv(scene, focus) + tracking, vec2(0.003), vec2(0.997))
    );
  }

  vec4 travelReveal(vec4 departing, vec4 arriving, float travel, vec2 direction) {
    float horizontal = direction.x < 0.0 ? 1.0 - v_uv.x : v_uv.x;
    float perspective = (v_uv.y - 0.5) * direction.y * 0.22;
    float leadingEdge = mix(1.035, -0.035, travel) + perspective;
    float revealed = smoothstep(
      leadingEdge - 0.008,
      leadingEdge + 0.008,
      horizontal
    );

    return mix(departing, arriving, revealed);
  }

  void main() {
    float t01 = smoothstep(0.07, 0.18, u_progress);
    float t12 = smoothstep(0.32, 0.43, u_progress);
    float t23 = smoothstep(0.57, 0.68, u_progress);
    float t34 = smoothstep(0.82, 0.93, u_progress);

    vec4 scene0 = trackingScene(
      u_scene0, 0.0, u_focus0, vec2(0.0), u_travel0, 1.0, t01
    );
    vec4 scene1 = trackingScene(
      u_scene1, 1.0, u_focus1, u_travel0, u_travel1, t01, t12
    );
    vec4 scene2 = trackingScene(
      u_scene2, 2.0, u_focus2, u_travel1, u_travel2, t12, t23
    );
    vec4 scene3 = trackingScene(
      u_scene3, 3.0, u_focus3, u_travel2, u_travel3, t23, t34
    );
    vec4 scene4 = trackingScene(
      u_scene4, 4.0, u_focus4, u_travel3, vec2(0.0), t34, 0.0
    );

    vec4 world = travelReveal(scene0, scene1, t01, u_travel0);
    world = travelReveal(world, scene2, t12, u_travel1);
    world = travelReveal(world, scene3, t23, u_travel2);
    world = travelReveal(world, scene4, t34, u_travel3);

    float clock = u_time * u_motion;
    float mist = noise(v_uv * vec2(3.8, 2.2) + vec2(clock * 0.035, -clock * 0.014));
    mist += noise(v_uv * vec2(8.5, 4.5) + vec2(-clock * 0.018, clock * 0.011)) * 0.38;
    float edge = smoothstep(0.84, 0.08, v_uv.y);
    vec3 atmosphere = mix(u_glow, u_accent, smoothstep(0.12, 0.84, v_uv.y));
    world.rgb += atmosphere * mist * 0.055 * edge;

    float ray = pow(max(0.0, sin(v_uv.x * 5.6 + v_uv.y * 1.8 + clock * 0.07)), 12.0);
    world.rgb += atmosphere * ray * (1.0 - v_uv.y) * 0.027;

    float grain = random(v_uv * u_resolution + floor(clock * 8.0)) - 0.5;
    world.rgb += grain * 0.016;

    gl_FragColor = vec4(clamp(world.rgb, 0.0, 1.0), 1.0);
  }
`;

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader | null {
  const shader = gl.createShader(type);

  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function rgb(hex: string): [number, number, number] {
  const value = hex.replace("#", "");

  return [
    Number.parseInt(value.slice(0, 2), 16) / 255,
    Number.parseInt(value.slice(2, 4), 16) / 255,
    Number.parseInt(value.slice(4, 6), 16) / 255,
  ];
}

export function WebGLLandscape({
  activeChapter,
  progress,
  reducedMotion,
}: WebGLLandscapeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const chapter = chapters[activeChapter];

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    setReady(false);
    canvas.dataset.webglRenderer = "loading";
    canvas.dataset.loadedTextures = "0";

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: true,
      depth: false,
      powerPreference: "high-performance",
      premultipliedAlpha: false,
    });

    if (!gl || gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS) < 5) return;

    const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

    if (!vertex || !fragment) return;

    const program = gl.createProgram();

    if (!program) return;

    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      return;
    }

    gl.useProgram(program);

    const geometry = gl.createBuffer();

    if (!geometry) {
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, geometry);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const position = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const resolutionUniform = gl.getUniformLocation(program, "u_resolution");
    const progressUniform = gl.getUniformLocation(program, "u_progress");
    const timeUniform = gl.getUniformLocation(program, "u_time");
    const motionUniform = gl.getUniformLocation(program, "u_motion");
    const accentUniform = gl.getUniformLocation(program, "u_accent");
    const glowUniform = gl.getUniformLocation(program, "u_glow");
    const accent = rgb(chapter.accent);
    const glow = rgb(chapter.glow);

    gl.uniform3f(accentUniform, accent[0], accent[1], accent[2]);
    gl.uniform3f(glowUniform, glow[0], glow[1], glow[2]);
    gl.uniform1f(motionUniform, reducedMotion ? 0 : 1);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

    let disposed = false;
    let loaded = 0;
    let frame = 0;
    let frameId = 0;
    const images: HTMLImageElement[] = [];
    const textures: WebGLTexture[] = [];

    chapter.moments.forEach((moment, index) => {
      gl.uniform2f(
        gl.getUniformLocation(program, `u_focus${index}`),
        moment.focus[0],
        moment.focus[1],
      );

      if (index < chapter.moments.length - 1) {
        gl.uniform2f(
          gl.getUniformLocation(program, `u_travel${index}`),
          moment.travel[0],
          moment.travel[1],
        );
      }

      const texture = gl.createTexture();

      if (!texture) return;

      textures.push(texture);
      gl.activeTexture(gl.TEXTURE0 + index);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        1,
        1,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        new Uint8Array([12, 14, 22, 255]),
      );
      gl.uniform1i(gl.getUniformLocation(program, `u_scene${index}`), index);

      const image = new Image();
      images.push(image);
      image.decoding = "async";
      image.onload = () => {
        if (disposed) return;

        gl.activeTexture(gl.TEXTURE0 + index);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          image,
        );

        loaded += 1;

        if (loaded === chapter.moments.length) {
          canvas.dataset.webglRenderer = "active";
          canvas.dataset.loadedTextures = String(loaded);
          setReady(true);
        }
      };
      image.src = moment.image;
    });

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 1.6);
      const width = Math.max(1, Math.round(bounds.width * ratio));
      const height = Math.max(1, Math.round(bounds.height * ratio));

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      gl.viewport(0, 0, width, height);
      gl.uniform2f(resolutionUniform, width, height);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    const updateCameraMetadata = (value: number) => {
      const momentIndex = Math.min(
        chapter.moments.length - 1,
        Math.max(0, Math.round(value * (chapter.moments.length - 1))),
      );
      const focus = chapter.moments[momentIndex].focus;
      const local = Math.max(0, Math.min(1, (value - momentIndex * 0.25) * 4 + 0.5));
      const advance = local * local * (3 - 2 * local);

      canvas.dataset.sceneProgress = value.toFixed(4);
      canvas.dataset.focalLandmark = chapter.moments[momentIndex].landmark;
      canvas.dataset.focalPointX = focus[0].toFixed(3);
      canvas.dataset.focalPointY = focus[1].toFixed(3);
      canvas.dataset.travelDirectionX =
        chapter.moments[momentIndex].travel[0].toFixed(2);
      canvas.dataset.travelDirectionY =
        chapter.moments[momentIndex].travel[1].toFixed(2);
      canvas.dataset.cameraFocusX = (
        0.5 + (focus[0] - 0.5) * advance * 0.92
      ).toFixed(4);
      canvas.dataset.cameraFocusY = (
        0.5 + (focus[1] - 0.5) * advance * 0.92
      ).toFixed(4);
    };

    updateCameraMetadata(progress.get());

    const unsubscribeProgress = progress.on("change", (value) => {
      updateCameraMetadata(value);
    });

    const render = (timestamp: number) => {
      if (disposed) return;

      const value = progress.get();
      gl.useProgram(program);
      gl.uniform1f(progressUniform, value);
      gl.uniform1f(timeUniform, reducedMotion ? 0 : timestamp * 0.001);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      if (frame % 8 === 0) {
        updateCameraMetadata(value);
        canvas.dataset.animationFrame = String(frame);
      }

      frame += 1;
      frameId = window.requestAnimationFrame(render);
    };

    frameId = window.requestAnimationFrame(render);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      unsubscribeProgress();
      observer.disconnect();
      images.forEach((image) => {
        image.onload = null;
      });
      textures.forEach((texture) => gl.deleteTexture(texture));
      gl.deleteBuffer(geometry);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
    };
  }, [activeChapter, chapter, progress, reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className={`landscape__webgl${ready ? " landscape__webgl--ready" : ""}`}
      data-testid="webgl-landscape"
      data-rendered-city={chapter.id}
      data-webgl-renderer="loading"
      data-transition-mode="spatial-tracking"
      aria-hidden="true"
    />
  );
}
