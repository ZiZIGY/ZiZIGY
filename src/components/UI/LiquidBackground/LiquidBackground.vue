<template>
  <div
    ref="ctnDom"
    :class="cn('block size-full', props?.class)"
  ></div>
</template>

<script lang="ts" setup>
  import {
    onMounted,
    onUnmounted,
    ref,
    type HTMLAttributes,
    computed,
  } from 'vue';
  import {
    Renderer,
    Program,
    Mesh,
    Color,
    Triangle,
    type OGLRenderingContext,
  } from 'ogl';
  import { cn } from '@/lib/utils';
  import { hexToRgb } from './utils';
  import { shaders } from './shaders';

  const props = defineProps<{
    class?: HTMLAttributes['class'];
    intensity?: number;
  }>();

  const intensityFactor = computed(() => props.intensity || 1.0);

  const ctnDom = ref<HTMLDivElement | null>(null);

  let animateId: number;
  let renderer: Renderer;
  let gl: OGLRenderingContext;
  let mesh: Mesh;

  function resize() {
    if (!ctnDom.value) return;
    const scale = 1;
    renderer.setSize(
      ctnDom.value.offsetWidth * scale,
      ctnDom.value.offsetHeight * scale
    );
    if (mesh) {
      mesh.program.uniforms.uResolution.value = [
        gl.canvas.width,
        gl.canvas.height,
        gl.canvas.width / gl.canvas.height,
      ];
    }
  }

  function update(t: number) {
    animateId = requestAnimationFrame(update);
    if (mesh) {
      mesh.program.uniforms.uTime.value = t * 0.001;
      renderer.render({ scene: mesh });
    }
  }

  onMounted(() => {
    if (!ctnDom.value) return;

    renderer = new Renderer();
    gl = renderer.gl;
    gl.clearColor(1, 1, 1, 1);

    window.addEventListener('resize', resize, false);
    resize();

    const geometry = new Triangle(gl);

    const program = new Program(gl, {
      vertex: shaders.vert,
      fragment: shaders.frag,
      uniforms: {
        uTime: { value: 0 },
        uIntensity: { value: intensityFactor.value },
        uResolution: {
          value: [
            gl.canvas.width,
            gl.canvas.height,
            gl.canvas.width / gl.canvas.height,
          ],
        },
      },
    });

    mesh = new Mesh(gl, { geometry, program });
    animateId = requestAnimationFrame(update);

    ctnDom.value.appendChild(gl.canvas);
  });

  onUnmounted(() => {
    cancelAnimationFrame(animateId);
    window.removeEventListener('resize', resize);
    if (ctnDom.value && gl?.canvas) {
      ctnDom.value.removeChild(gl.canvas);
    }
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
  });
</script>
