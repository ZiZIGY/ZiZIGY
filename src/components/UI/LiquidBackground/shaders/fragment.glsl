precision highp float;

uniform float uTime;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uIntensity;
uniform vec3 uResolution;

varying vec2 vUv;

void main() {
    float mr = min(uResolution.x, uResolution.y);
    vec2 uv = (vUv.xy * 2.0 - 1.0) * uResolution.xy / mr;

    float d = -uTime * 1.2;
    float a = 0.0;
    for (float i = 0.0; i < 8.0; ++i) {
        a += cos(i - d - a * uv.x);
        d += sin(uv.y * i + a);
    }
    d += uTime * 1.0;
    
    // Используем два цвета для создания градиента
    vec3 col = vec3(cos(uv * vec2(d, a)) * 0.6 + 0.4, cos(a + d) * 0.5 + 0.5);
    col = cos(col * cos(vec3(d, a, 2.5)) * 0.5 + 0.5);
    
    // Используем только зеленый Vue цвет без переливания между цветами
    vec3 vueGreen = vec3(0.33, 0.68, 0.54);
    vec3 finalColor = col * vueGreen * uIntensity;
    
    gl_FragColor = vec4(finalColor, 1.0);
} 