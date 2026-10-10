(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,168632,519364,e=>{"use strict";let t=new Map;async function o(e){if("function"==typeof e.decode)try{await e.decode()}catch{}}e.s(["loadVisualImage",0,function(e,{crossOrigin:i,label:a="visual image"}={}){let l=JSON.stringify({crossOrigin:i??null,imageUrl:e}),n=t.get(l);if(n)return n;let r=new Promise((t,l)=>{let n=new Image;n.decoding="async",void 0!==i&&(n.crossOrigin=i),n.addEventListener("load",()=>{o(n).then(()=>t(n))}),n.addEventListener("error",()=>{l(Error(`Failed to load ${a}: ${e}`))}),n.src=e}).catch(e=>{throw t.delete(l),e});return t.set(l,r),r}],168632);var i=e.i(53343);e.s(["useAsyncImage",0,function(e){return(0,i.useAsyncResource)(e)}],519364)},53343,e=>{"use strict";e.i(242243);var t=e.i(386993),o=e.i(203708);e.s(["useAsyncResource",0,function(e,i){let a,l,n=(0,t.c)(4),[r,s]=(0,o.useState)(null),c=i?.dispose;return n[0]!==c||n[1]!==e?(a=()=>{if(null===e)return void s(null);let t=!1,o=null;return s(null),Promise.resolve().then(()=>e()).then(e=>{t?c?.(e):(o=e,s(e))},e=>{}),()=>{t=!0,null!==o&&c?.(o)}},l=[e,c],n[0]=c,n[1]=e,n[2]=a,n[3]=l):(a=n[2],l=n[3]),(0,o.useEffect)(a,l),r}])},145510,e=>{"use strict";var t=e.i(26645),o=e.i(779419),i=e.i(203708),a=e.i(168632),l=e.i(519364),n=e.i(190072);e.i(956606);var r=e.i(49),s=e.i(54268),c=e.i(575268);let u=`
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`,v=`
  precision highp float;

  uniform sampler2D tImage;
  uniform vec2 imageSize;
  uniform vec2 logicalResolution;
  uniform float halftoneCellPx;
  uniform float halftonePower;
  uniform float halftoneWidth;
  uniform float imageContrast;
  uniform float imageZoom;
  uniform float imageFlipY;
  uniform vec3 dashColor;
  uniform vec3 hoverDashColor;
  uniform vec2 interactionUv;
  uniform vec2 interactionVelocity;
  uniform float hoverLightStrength;
  uniform float hoverLightRadius;

  varying vec2 vUv;

  float distanceToSegment(in vec2 point, in vec2 a, in vec2 b) {
    vec2 pa = point - a;
    vec2 ba = b - a;
    float denom = max(dot(ba, ba), 0.000001);
    float t = clamp(dot(pa, ba) / denom, 0.0, 1.0);
    return length(pa - ba * t);
  }

  float dashSdf(in vec2 cellUv, in float radius, in float thickness) {
    vec2 a = vec2(0.5) + vec2(-radius, 0.0);
    vec2 b = vec2(0.5) + vec2(radius, 0.0);
    float halfThickness = thickness * radius;
    return distanceToSegment(cellUv, a, b) - halfThickness;
  }

  vec2 mapToImageUv(in vec2 fragmentUv) {
    float imageAspect = imageSize.x / max(imageSize.y, 1.0);
    float viewAspect = logicalResolution.x / max(logicalResolution.y, 1.0);

    vec2 uv = fragmentUv;
    if (imageAspect > viewAspect) {
      float scale = viewAspect / imageAspect;
      uv.x = (uv.x - 0.5) * scale + 0.5;
    } else {
      float scale = imageAspect / viewAspect;
      uv.y = (uv.y - 0.5) * scale + 0.5;
    }

    uv = (uv - 0.5) / max(imageZoom, 0.001) + 0.5;
    uv.y = mix(uv.y, 1.0 - uv.y, imageFlipY);
    return uv;
  }

  void main() {
    vec2 fragCoord = gl_FragCoord.xy;
    float cellSize = max(halftoneCellPx, 1.0);

    vec2 cellIndex = floor(fragCoord / cellSize);
    vec2 cellCenterFrag = (cellIndex + 0.5) * cellSize;
    vec2 cellUv = fract(fragCoord / cellSize);

    vec2 sampleFragmentUv = clamp(
      cellCenterFrag / max(logicalResolution, vec2(1.0)),
      vec2(0.0),
      vec2(1.0)
    );
    vec2 imageUv = mapToImageUv(sampleFragmentUv);

    float inImageBounds = step(0.0, imageUv.x) * step(imageUv.x, 1.0)
                        * step(0.0, imageUv.y) * step(imageUv.y, 1.0);

    vec3 imageColor = texture2D(tImage, clamp(imageUv, 0.0, 1.0)).rgb;
    imageColor = clamp((imageColor - 0.5) * imageContrast + 0.5, 0.0, 1.0);

    vec2 pointerPx = interactionUv * logicalResolution;
    vec2 fragDelta = fragCoord - pointerPx;
    float fragDist = length(fragDelta);
    vec2 radialDir = fragDist > 0.001 ? fragDelta / fragDist : vec2(0.0, 1.0);
    float velocityMagnitude = length(interactionVelocity);
    vec2 motionDir = velocityMagnitude > 0.001
      ? interactionVelocity / velocityMagnitude
      : vec2(0.0, 0.0);
    float motionBias = velocityMagnitude > 0.001
      ? dot(-radialDir, motionDir) * 0.5 + 0.5
      : 0.5;

    float hoverLightMask = 0.0;
    if (hoverLightStrength > 0.0) {
      float lightRadiusPx = hoverLightRadius * logicalResolution.y;
      hoverLightMask = smoothstep(lightRadiusPx, 0.0, fragDist);
    }

    float lightLift = hoverLightStrength * hoverLightMask
                    * mix(0.78, 1.18, motionBias) * 0.22;

    float averageLuminance = (imageColor.r + imageColor.g + imageColor.b) / 3.0;
    float bandRadius = clamp(
      averageLuminance + halftonePower * length(vec2(0.5)) / 3.0 + lightLift,
      0.0,
      1.0
    ) * 0.93;

    float alpha = 0.0;
    if (bandRadius > 0.0001) {
      float signedDistance = dashSdf(cellUv, bandRadius, halftoneWidth);
      alpha = (1.0 - smoothstep(0.0, 0.02, signedDistance)) * inImageBounds;
    }

    float hoverStrength = clamp(hoverLightMask * hoverLightStrength, 0.0, 1.0);
    vec3 activeDashColor = mix(dashColor, hoverDashColor, hoverStrength);

    gl_FragColor = vec4(activeDashColor, alpha);
  }
`;function h(e){return 4/Math.max(e,.001)}let m=(0,o.styled)("div")({name:"SceneContainer",class:"s1fw6a2x",propsAsIs:!1});e.s(["CardHalftoneScene",0,function({imageUrl:e,config:o,active:g=!1,pointerTargetRef:d,onFirstFrame:f}){let p=(0,i.useRef)(null),y=(0,i.useRef)(g);y.current=g;let x=(0,i.useRef)(null),C=(0,i.useCallback)(()=>(0,a.loadVisualImage)(e),[e]),M=(0,l.useAsyncImage)(C);return(0,i.useEffect)(()=>{let e=p.current;if(null===e||null===M)return;let t=function({config:e,container:t,image:o,isExternallyActive:i,pointerTarget:a,onFirstFrame:l}){let m=(0,c.createVisualRenderer)({alpha:!0,antialias:!1,premultipliedAlpha:!1});if(null===m)return null;m.setClearColor(0,0);let g=Math.min(window.devicePixelRatio||1,2);m.setPixelRatio(g);let d=m.domElement;d.style.cursor="default",d.style.display="block",d.style.height="100%",d.style.touchAction="none",d.style.width="100%",t.appendChild(d);let f=a??d,p=new n.Texture(o);p.colorSpace=n.SRGBColorSpace,p.minFilter=n.LinearFilter,p.magFilter=n.LinearFilter,p.generateMipmaps=!1,p.needsUpdate=!0;let y=new n.PlaneGeometry(2,2),x=new n.OrthographicCamera(-1,1,1,-1,0,1),C=new n.ShaderMaterial({fragmentShader:v,transparent:!0,uniforms:{dashColor:{value:new n.Color(e.dashColor)},halftoneCellPx:{value:Math.max(e.halftoneScalePx*g,1)},halftonePower:{value:e.halftonePower},halftoneWidth:{value:e.halftoneWidth},hoverDashColor:{value:new n.Color(e.hoverDashColor)},hoverLightRadius:{value:e.hoverLightRadius},hoverLightStrength:{value:0},imageContrast:{value:e.imageContrast},imageFlipY:{value:+!!e.flipImageY},imageSize:{value:new n.Vector2(o.width,o.height)},imageZoom:{value:h(e.previewDistance)},interactionUv:{value:new n.Vector2(.5,.5)},interactionVelocity:{value:new n.Vector2(0,0)},logicalResolution:{value:new n.Vector2(1,1)},tImage:{value:p}},vertexShader:u}),M=new n.Mesh(y,C),S=new n.Scene;S.add(M);let w={hoverStrength:0,mouseX:.5,mouseY:.5,pointerInside:!1,pointerVelocityX:0,pointerVelocityY:0,smoothedMouseX:.5,smoothedMouseY:.5},R=!1,V=t=>{let o=i(),a=o||w.pointerInside,n=+!!a,r=1-Math.exp(-t*(a?18:7));w.hoverStrength+=(n-w.hoverStrength)*r,.001>=Math.abs(n-w.hoverStrength)&&(w.hoverStrength=n);let s=o&&!w.pointerInside?e.activeHoverX:w.mouseX,c=o&&!w.pointerInside?e.activeHoverY:w.mouseY;w.smoothedMouseX+=(s-w.smoothedMouseX)*.38,w.smoothedMouseY+=(c-w.smoothedMouseY)*.38,.001>=Math.abs(s-w.smoothedMouseX)&&(w.smoothedMouseX=s),.001>=Math.abs(c-w.smoothedMouseY)&&(w.smoothedMouseY=c),w.pointerVelocityX*=.82,w.pointerVelocityY*=.82,1e-4>=Math.abs(w.pointerVelocityX)&&(w.pointerVelocityX=0),1e-4>=Math.abs(w.pointerVelocityY)&&(w.pointerVelocityY=0);let u=C.uniforms.logicalResolution.value;return C.uniforms.interactionUv.value.set(w.smoothedMouseX,1-w.smoothedMouseY),C.uniforms.interactionVelocity.value.set(w.pointerVelocityX*u.x,-w.pointerVelocityY*u.y),C.uniforms.hoverLightStrength.value=e.hoverLightIntensity*w.hoverStrength,C.uniforms.hoverLightRadius.value=e.hoverHalftoneRadius+.5*e.hoverLightRadius,C.uniforms.imageZoom.value=h(e.previewDistance),m.render(S,x),R||(R=!0,l?.()),a||w.hoverStrength!==n||w.smoothedMouseX!==s||w.smoothedMouseY!==c||0!==w.pointerVelocityX||0!==w.pointerVelocityY},L=(0,s.createVisualFrameLoop)({renderFrame:e=>V(e.deltaSeconds),target:t,targetVisibilityOptions:{rootMargin:"100px"}}),Y=()=>{L.start()},U=()=>{let o=Math.max(t.clientWidth,1),i=Math.max(t.clientHeight,1);m.setSize(o,i,!1),C.uniforms.logicalResolution.value.set(o*g,i*g),C.uniforms.halftoneCellPx.value=Math.max(e.halftoneScalePx*g,1),L.isRunning()||V(0)},b=(0,r.observeElementSize)(t,U);U();let X=e=>{((e,t)=>{let o=f.getBoundingClientRect(),i=Math.max(o.width,1),a=Math.max(o.height,1),l=n.MathUtils.clamp((e.clientX-o.left)/i,0,1),r=n.MathUtils.clamp((e.clientY-o.top)/a,0,1),s=l-w.mouseX,c=r-w.mouseY;if(w.mouseX=l,w.mouseY=r,w.pointerInside=e.clientX>=o.left&&e.clientX<=o.right&&e.clientY>=o.top&&e.clientY<=o.bottom,t?.resetVelocity){w.pointerVelocityX=0,w.pointerVelocityY=0,w.smoothedMouseX=l,w.smoothedMouseY=r;return}w.pointerVelocityX=s,w.pointerVelocityY=c})(e,w.pointerInside?void 0:{resetVelocity:!0}),Y()},I=()=>{w.pointerInside=!1,w.pointerVelocityX=0,w.pointerVelocityY=0,Y()};return f.addEventListener("pointermove",X),f.addEventListener("pointerleave",I),i()&&Y(),{dispose:()=>{L.dispose(),b(),f.removeEventListener("pointermove",X),f.removeEventListener("pointerleave",I),C.dispose(),p.dispose(),y.dispose(),m.dispose(),d.parentNode===t&&t.removeChild(d)},wake:Y}}({config:o,container:e,image:M,isExternallyActive:()=>y.current,pointerTarget:d?.current,onFirstFrame:f});return x.current=t?.wake??null,()=>{x.current=null,t?.dispose()}},[M]),(0,i.useEffect)(()=>{x.current?.()},[g]),(0,t.jsx)(m,{ref:p})}],145510)},369397,function(e){e.n(e.i(145510))}]);