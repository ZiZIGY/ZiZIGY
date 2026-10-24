<script setup lang="ts">
/**
 * SVG filter behind the `liquid-glass` utility (main.css). Mount once, near the app root.
 *
 * The lens refracts only at the rim, like a thick piece of glass: two displacement maps (x from the red
 * channel, y from the green) are neutral grey in the middle and ramp towards the edges, so the backdrop
 * is pulled inwards there and stays undistorted in the centre. The maps are stretched over each element,
 * which keeps a thin rim on short pills and a wide one at their rounded ends.
 *
 * `liquid-lens` is a magnifier: the same ramps without the neutral centre, so every point samples a bit
 * closer to the middle and the whole backdrop under it is enlarged.
 */
const map = (axis: 'x' | 'y', rim: boolean) => {
  const [from, to] = axis === 'x' ? ['rgb(0,128,0)', 'rgb(255,128,0)'] : ['rgb(128,0,0)', 'rgb(128,255,0)']
  const direction = axis === 'x' ? 'x2="1" y2="0"' : 'x2="0" y2="1"'
  const centre = rim ? '<rect x="9" y="9" width="82" height="82" rx="16" fill="rgb(128,128,0)" filter="url(#b)"/>' : ''
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">
    <defs>
      <linearGradient id="g" x1="0" y1="0" ${direction}><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient>
      <filter id="b" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5"/></filter>
    </defs>
    <rect width="100" height="100" fill="url(#g)"/>
    ${centre}
  </svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

const rimX = map('x', true)
const rimY = map('y', true)
const lensX = map('x', false)
const lensY = map('y', false)

// Only Chromium renders SVG filters inside backdrop-filter; everywhere else the glass stays frosted.
// navigator.userAgentData (UA Client Hints) exists in Chromium only, which makes it a cheap engine check.
onMounted(() => {
  if ('userAgentData' in navigator || 'chrome' in window) {
    document.documentElement.classList.add('has-liquid-glass')
  }
})
</script>

<template>
  <svg
    class="pointer-events-none absolute size-0 overflow-hidden"
    aria-hidden="true"
    focusable="false"
  >
    <defs>
      <filter
        id="liquid-glass"
        x="0%"
        y="0%"
        width="100%"
        height="100%"
        color-interpolation-filters="sRGB"
      >
        <feImage
          :href="rimX"
          preserveAspectRatio="none"
          result="mapX"
        />
        <feImage
          :href="rimY"
          preserveAspectRatio="none"
          result="mapY"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="mapX"
          scale="-56"
          xChannelSelector="R"
          yChannelSelector="G"
          result="refractX"
        />
        <feDisplacementMap
          in="refractX"
          in2="mapY"
          scale="-22"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>

      <filter
        id="liquid-lens"
        x="0%"
        y="0%"
        width="100%"
        height="100%"
        color-interpolation-filters="sRGB"
      >
        <feImage
          :href="lensX"
          preserveAspectRatio="none"
          result="mapX"
        />
        <feImage
          :href="lensY"
          preserveAspectRatio="none"
          result="mapY"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="mapX"
          scale="-48"
          xChannelSelector="R"
          yChannelSelector="G"
          result="zoomX"
        />
        <feDisplacementMap
          in="zoomX"
          in2="mapY"
          scale="-48"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </defs>
  </svg>
</template>
