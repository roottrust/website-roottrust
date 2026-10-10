(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,168632,519364,e=>{"use strict";let t=new Map;async function o(e){if("function"==typeof e.decode)try{await e.decode()}catch{}}e.s(["loadVisualImage",0,function(e,{crossOrigin:i,label:a="visual image"}={}){let r=JSON.stringify({crossOrigin:i??null,imageUrl:e}),l=t.get(r);if(l)return l;let n=new Promise((t,r)=>{let l=new Image;l.decoding="async",void 0!==i&&(l.crossOrigin=i),l.addEventListener("load",()=>{o(l).then(()=>t(l))}),l.addEventListener("error",()=>{r(Error(`Failed to load ${a}: ${e}`))}),l.src=e}).catch(e=>{throw t.delete(r),e});return t.set(r,n),n}],168632);var i=e.i(53343);e.s(["useAsyncImage",0,function(e){return(0,i.useAsyncResource)(e)}],519364)},53343,e=>{"use strict";e.i(242243);var t=e.i(386993),o=e.i(203708);e.s(["useAsyncResource",0,function(e,i){let a,r,l=(0,t.c)(4),[n,s]=(0,o.useState)(null),v=i?.dispose;return l[0]!==v||l[1]!==e?(a=()=>{if(null===e)return void s(null);let t=!1,o=null;return s(null),Promise.resolve().then(()=>e()).then(e=>{t?v?.(e):(o=e,s(e))},e=>{}),()=>{t=!0,null!==o&&v?.(o)}},r=[e,v],l[0]=v,l[1]=e,l[2]=a,l[3]=r):(a=l[2],r=l[3]),(0,o.useEffect)(a,r),n}])},849825,e=>{"use strict";var t=e.i(203708),o=e.i(397778);e.s(["useVisualRuntime",0,function(){return(0,t.useContext)(o.VisualRuntimeContext)}])},387218,e=>{"use strict";var t=e.i(26645),o=e.i(779419),i=e.i(203708),a=e.i(168632),r=e.i(519364),l=e.i(849825),n=e.i(190072),s=e.i(54268),v=e.i(575268),c=e.i(763114),u=e.i(681576),f=e.i(639257),h=e.i(393568),m=e.i(878707);let d={fragment:`
  precision highp float;

  uniform sampler2D tImage;
  uniform vec2 imageSize;
  uniform vec2 viewportSize;
  uniform float zoom;
  uniform float contrast;
  uniform float imageFit;
  uniform float verticalAnchor;
  uniform float verticalPixelOffset;
  uniform float horizontalPixelOffset;

  varying vec2 vUv;

  void main() {
    float imageAspect = imageSize.x / imageSize.y;
    float viewAspect = viewportSize.x / viewportSize.y;

    vec2 uv = vUv;

    if (imageFit > 1.5) {
      uv.y =
        (uv.y - verticalAnchor) * (imageAspect / viewAspect) + verticalAnchor;
    } else if (imageAspect > viewAspect) {
      float scale = viewAspect / imageAspect;
      if (imageFit > 0.5) {
        uv.x = (uv.x - 0.5) * scale + 0.5;
      } else {
        uv.y = (uv.y - 0.5) / scale + 0.5;
      }
    } else {
      float scale = imageAspect / viewAspect;
      if (imageFit > 0.5) {
        uv.y = (uv.y - 0.5) * scale + 0.5;
      } else {
        uv.x = (uv.x - 0.5) / scale + 0.5;
      }
    }

    uv = (uv - 0.5) / zoom + 0.5;
    uv.y += verticalPixelOffset / max(viewportSize.y, 1.0);
    uv.x -= horizontalPixelOffset / max(viewportSize.x, 1.0);

    float inBounds = step(0.0, uv.x) * step(uv.x, 1.0)
                   * step(0.0, uv.y) * step(uv.y, 1.0);

    vec4 color = texture2D(tImage, clamp(uv, 0.0, 1.0));
    vec3 contrastColor = clamp((color.rgb - 0.5) * contrast + 0.5, 0.0, 1.0);

    gl_FragColor = vec4(contrastColor, inBounds);
  }
`},g=f.HALFTONE_CONSTANTS.referencePreviewDistance,p=f.HALFTONE_CONSTANTS.minFootprintScale;function S({imageFit:e,imageWidth:t,imageHeight:o,viewportWidth:i,viewportHeight:a,zoom:r}){if(t<=0||o<=0||i<=0||a<=0)return null;let l=t/o,n=i,s=a;l>i/a?"cover"===e||"width"===e?n=a*l:s=i/l:"cover"===e||"width"===e?s=i/l:n=a*l;let v=n*r,c=s*r,u=Math.max((i-v)*.5,0),f=Math.max((a-c)*.5,0),h=Math.min((i-v)*.5+v,i),m=Math.min((a-c)*.5+c,a);return h<=u||m<=f?null:{width:h-u,height:m-f}}function w({imageFit:e,imageWidth:t,imageHeight:o,viewportWidth:i,viewportHeight:a,previewDistance:r}){let l=S({imageFit:e,imageWidth:t,imageHeight:o,viewportWidth:i,viewportHeight:a,zoom:g/Math.max(r,.001)}),n=S({imageFit:e,imageWidth:t,imageHeight:o,viewportWidth:i,viewportHeight:a,zoom:1}),s=l?l.width*l.height:0,v=n?n.width*n.height:0;return s<=0||v<=0?1:Math.max(Math.sqrt(s/v),p)}let x=(0,o.styled)("div")({name:"SceneContainer",class:"s2ibsvk",propsAsIs:!1});e.s(["HalftoneImageScene",0,function({imageUrl:e,settings:o,pointerRootSelector:f,onFirstFrame:R}){let y=(0,i.useRef)(null),{reducedMotion:D}=(0,l.useVisualRuntime)(),A=(0,i.useCallback)(()=>(0,a.loadVisualImage)(e),[e]),F=(0,r.useAsyncImage)(A);return(0,i.useEffect)(()=>{let e=y.current;if(null===e||null===F)return;let t=function({container:e,image:t,settings:o,pointerRootSelector:i,reducedMotion:a=!1,onFirstFrame:r}){let{getVirtualWidth:l,getVirtualHeight:f}=(0,h.createVirtualSize)(e),x=(0,v.createVisualRenderer)({antialias:!1,alpha:!0});if(null===x)return null;x.outputColorSpace=n.SRGBColorSpace,x.setPixelRatio(1),x.setClearColor(0,0),x.setSize(l(),f(),!1);let R=x.domElement;R.style.display="block",R.style.height="100%",R.style.width="100%",e.appendChild(R);let y=new n.Texture(t);y.wrapS=n.ClampToEdgeWrapping,y.wrapT=n.ClampToEdgeWrapping,y.generateMipmaps=!1,y.minFilter=n.LinearFilter,y.magFilter=n.LinearFilter,y.colorSpace=n.SRGBColorSpace,y.needsUpdate=!0;let D=g/Math.max(o.previewDistance,.001),A=(0,u.createRenderTarget)(l(),f()),F=new n.PlaneGeometry(2,2),C=new n.OrthographicCamera(-1,1,1,-1,0,1),H=new n.ShaderMaterial({uniforms:{tImage:{value:y},imageSize:{value:new n.Vector2(t.naturalWidth,t.naturalHeight)},viewportSize:{value:new n.Vector2(l(),f())},zoom:{value:D},contrast:{value:o.contrast},imageFit:{value:"width"===o.imageFit?2:+("cover"===o.imageFit)},verticalAnchor:{value:o.verticalAnchor??.5},verticalPixelOffset:{value:0},horizontalPixelOffset:{value:0}},vertexShader:c.BLUR_PASS_SHADERS.vertex,fragmentShader:d.fragment}),M=new n.ShaderMaterial({transparent:!0,uniforms:{tScene:{value:A.texture},tGlow:{value:A.texture},effectResolution:{value:new n.Vector2(l(),f())},logicalResolution:{value:new n.Vector2(l(),f())},tile:{value:o.halftone.scale},s_3:{value:o.halftone.power},s_4:{value:o.halftone.width},applyToDarkAreas:{value:+!!o.applyToDarkAreas},hoverLightVerticalFade:{value:o.hover.lightVerticalFade??0},minimumTone:{value:o.halftone.minimumTone},dashColor:{value:new n.Color(o.halftone.dashColor)},hoverDashColor:{value:new n.Color(o.halftone.hoverDashColor)},time:{value:0},waveAmount:{value:o.wave.enabled?o.wave.amount:0},waveSpeed:{value:o.wave.speed},footprintScale:{value:1},interactionUv:{value:new n.Vector2(.5,.5)},interactionVelocity:{value:new n.Vector2(0,0)},dragOffset:{value:new n.Vector2(0,0)},hoverHalftoneActive:{value:0},hoverHalftonePowerShift:{value:0},hoverHalftoneRadius:{value:o.hover.halftoneRadius},hoverHalftoneWidthShift:{value:0},hoverLightStrength:{value:0},hoverLightRadius:{value:o.hover.lightRadius},hoverFlowStrength:{value:0},hoverFlowRadius:{value:.18},dragFlowStrength:{value:0},cropToBounds:{value:1}},vertexShader:c.BLUR_PASS_SHADERS.vertex,fragmentShader:m.HALFTONE_PASS_SHADER.fragment}),P=new n.Scene;P.add(new n.Mesh(F,H));let z=new n.Scene;z.add(new n.Mesh(F,M));let b={inside:!1,mouseX:.5,mouseY:.5,smoothedX:.5,smoothedY:.5,velocityX:0,velocityY:0,hoverStrength:0},T=()=>{M.uniforms.footprintScale.value=w({imageFit:"contain",imageWidth:t.naturalWidth,imageHeight:t.naturalHeight,viewportWidth:l(),viewportHeight:f(),previewDistance:o.previewDistance})},L=()=>{let e=l(),t=f();x.setSize(e,t,!1),A.setSize(e,t),H.uniforms.viewportSize.value.set(e,t),M.uniforms.effectResolution.value.set(e,t),M.uniforms.logicalResolution.value.set(e,t),T()};T();let O=(i?e.closest(i):null)??e,E=e=>{if(o.pointerExcludeSelector&&e.target instanceof Element&&e.target.closest(o.pointerExcludeSelector)){b.inside=!1;return}let t=O.getBoundingClientRect(),i=!b.inside,a=n.MathUtils.clamp((e.clientX-t.left)/Math.max(t.width,1),0,1),r=n.MathUtils.clamp((e.clientY-t.top)/Math.max(t.height,1),0,1),l=a-b.mouseX,s=r-b.mouseY;if(b.mouseX=a,b.mouseY=r,b.inside=e.clientX>=t.left&&e.clientX<=t.right&&e.clientY>=t.top&&e.clientY<=t.bottom,i){b.velocityX=0,b.velocityY=0,b.smoothedX=a,b.smoothedY=r;return}b.velocityX=l,b.velocityY=s},V=()=>{b.inside=!1,b.velocityX=0,b.velocityY=0},k="window"===o.pointerScope?window:O;a||(k.addEventListener("pointermove",E),k.addEventListener("pointerleave",V));let U=!1,_=({deltaSeconds:e,elapsedSeconds:i})=>{M.uniforms.time.value=i;let a=1-Math.exp(-e*(b.inside?o.hover.fadeIn:o.hover.fadeOut));b.hoverStrength+=(!!b.inside-b.hoverStrength)*a,b.smoothedX+=(b.mouseX-b.smoothedX)*o.pointer.follow,b.smoothedY+=(b.mouseY-b.smoothedY)*o.pointer.follow,b.velocityX*=o.pointer.velocityDamping,b.velocityY*=o.pointer.velocityDamping;let n=l(),s=f();if(M.uniforms.interactionUv.value.set(b.smoothedX,1-b.smoothedY),M.uniforms.interactionVelocity.value.set(b.velocityX*n,-b.velocityY*s),M.uniforms.hoverHalftoneActive.value=o.hover.halftoneEnabled?b.hoverStrength:0,M.uniforms.hoverHalftonePowerShift.value=o.hover.halftoneEnabled?o.hover.halftonePowerShift:0,M.uniforms.hoverHalftoneWidthShift.value=o.hover.halftoneEnabled?o.hover.halftoneWidthShift:0,M.uniforms.hoverLightStrength.value=o.hover.lightEnabled?o.hover.lightIntensity*b.hoverStrength:0,void 0!==o.hover.radiusReferenceDistance){let e=function({imageWidth:e,imageHeight:t,viewportWidth:o,viewportHeight:i,previewDistance:a,referencePreviewDistance:r}){let l=S({imageFit:"contain",imageWidth:e,imageHeight:t,viewportWidth:o,viewportHeight:i,zoom:g/Math.max(a,.001)}),n=S({imageFit:"contain",imageWidth:e,imageHeight:t,viewportWidth:o,viewportHeight:i,zoom:g/Math.max(r,.001)}),s=l?l.width*l.height:0,v=n?n.width*n.height:0;return s<=0||v<=0?1:Math.max(Math.sqrt(s/v),p)}({imageWidth:t.naturalWidth,imageHeight:t.naturalHeight,viewportWidth:l(),viewportHeight:f(),previewDistance:o.previewDistance,referencePreviewDistance:o.hover.radiusReferenceDistance});M.uniforms.hoverHalftoneRadius.value=o.hover.halftoneRadius*e,M.uniforms.hoverLightRadius.value=o.hover.lightRadius*e}if(o.responsiveFrame){let e=o.responsiveFrame();H.uniforms.zoom.value=g/Math.max(e.previewDistance,.001),H.uniforms.verticalAnchor.value=e.verticalAnchor,H.uniforms.verticalPixelOffset.value=e.verticalOffsetPx,H.uniforms.horizontalPixelOffset.value=e.horizontalOffsetPx,M.uniforms.footprintScale.value=w({imageFit:"contain",imageHeight:t.naturalHeight,imageWidth:t.naturalWidth,previewDistance:e.previewDistance,viewportHeight:f(),viewportWidth:l()})}x.setRenderTarget(A),x.render(P,C),x.setRenderTarget(null),x.clear(),x.render(z,C),U||(U=!0,r?.())},W="u"<typeof ResizeObserver?null:new ResizeObserver(L);function B(){H.dispose(),M.dispose(),F.dispose(),y.dispose(),A.dispose(),x?.dispose(),R.parentNode===e&&e.removeChild(R)}if(W?.observe(e),a){_({deltaSeconds:0,elapsedSeconds:0,timestamp:0});let t="u"<typeof ResizeObserver?null:new ResizeObserver(()=>{L(),_({deltaSeconds:0,elapsedSeconds:0,timestamp:0})});return t?.observe(e),W?.disconnect(),{dispose(){t?.disconnect(),B()}}}let I=(0,s.createVisualFrameLoop)({renderFrame:_,target:e,targetVisibilityOptions:{rootMargin:"100px"}});return I.start(),{dispose(){I.dispose(),W?.disconnect(),k.removeEventListener("pointermove",E),k.removeEventListener("pointerleave",V),B()}}}({container:e,image:F,settings:o,pointerRootSelector:f,reducedMotion:D,onFirstFrame:R});return()=>{t?.dispose()}},[F,D]),(0,t.jsx)(x,{ref:y})}],387218)},894023,function(e){e.n(e.i(387218))},763114,e=>{"use strict";let t={vertex:`
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`,fragment:`
  precision highp float;

  uniform sampler2D tInput;
  uniform vec2 dir;
  uniform vec2 res;

  varying vec2 vUv;

  void main() {
    vec4 sum = vec4(0.0);
    vec2 px = dir / res;

    float w[5];
    w[0] = 0.227027;
    w[1] = 0.1945946;
    w[2] = 0.1216216;
    w[3] = 0.054054;
    w[4] = 0.016216;

    sum += texture2D(tInput, vUv) * w[0];

    for (int i = 1; i < 5; i++) {
      float fi = float(i) * 3.0;
      sum += texture2D(tInput, vUv + px * fi) * w[i];
      sum += texture2D(tInput, vUv - px * fi) * w[i];
    }

    gl_FragColor = sum;
  }
`};e.s(["BLUR_PASS_SHADERS",0,t])},681576,639257,393568,e=>{"use strict";var t=e.i(190072);e.s(["createRenderTarget",0,function(e,o){return new t.WebGLRenderTarget(e,o,{format:t.RGBAFormat,magFilter:t.LinearFilter,minFilter:t.LinearFilter})}],681576);let o={virtualRenderHeightPx:768,referencePreviewDistance:4,minFootprintScale:.001,pointerEasingDefault:.12,pointerEasingAutorotateDrag:.08,autorotateVelocityDecay:.92};e.s(["HALFTONE_CONSTANTS",0,o],639257),e.s(["createVirtualSize",0,function(e){let t=()=>Math.max(e.clientWidth,1),i=()=>Math.max(e.clientHeight,1),a=()=>Math.max(o.virtualRenderHeightPx,i());return{getWidth:t,getHeight:i,getVirtualWidth:()=>Math.max(Math.round(a()*(t()/Math.max(i(),1))),1),getVirtualHeight:a}}],393568)},878707,e=>{"use strict";let t={fragment:`
  precision highp float;

  uniform sampler2D tScene;
  uniform sampler2D tGlow;
  uniform vec2 effectResolution;
  uniform vec2 logicalResolution;
  uniform float tile;
  uniform float s_3;
  uniform float s_4;
  uniform float applyToDarkAreas;
  uniform float minimumTone;
  uniform vec3 dashColor;
  uniform vec3 hoverDashColor;
  uniform float time;
  uniform float waveAmount;
  uniform float waveSpeed;
  uniform float footprintScale;
  uniform vec2 interactionUv;
  uniform vec2 interactionVelocity;
  uniform vec2 dragOffset;
  uniform float hoverHalftoneActive;
  uniform float hoverHalftonePowerShift;
  uniform float hoverHalftoneRadius;
  uniform float hoverHalftoneWidthShift;
  uniform float hoverLightStrength;
  uniform float hoverLightRadius;
  uniform float hoverLightVerticalFade;
  uniform float hoverFlowStrength;
  uniform float hoverFlowRadius;
  uniform float dragFlowStrength;
  uniform float cropToBounds;

  varying vec2 vUv;

  float distSegment(in vec2 p, in vec2 a, in vec2 b) {
    vec2 pa = p - a;
    vec2 ba = b - a;
    float denom = max(dot(ba, ba), 0.000001);
    float h = clamp(dot(pa, ba) / denom, 0.0, 1.0);
    return length(pa - ba * h);
  }

  float lineSimpleEt(in vec2 p, in float r, in float thickness) {
    vec2 a = vec2(0.5) + vec2(-r, 0.0);
    vec2 b = vec2(0.5) + vec2(r, 0.0);
    float distToSegment = distSegment(p, a, b);
    float halfThickness = thickness * r;
    return distToSegment - halfThickness;
  }

  void main() {
    if (cropToBounds > 0.5) {
      vec4 boundsCheck = texture2D(tScene, vUv);
      if (boundsCheck.a < 0.01) {
        gl_FragColor = vec4(0.0);
        return;
      }
    }

    vec2 fragCoord =
      (gl_FragCoord.xy / max(effectResolution, vec2(1.0))) * logicalResolution;
    float halftoneSize = max(tile * max(footprintScale, 0.001), 1.0);
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
      float fadeRange = max(hoverLightVerticalFade, 0.0001);
      hoverLightMask *=
        smoothstep(0.0, fadeRange, vUv.y) *
        smoothstep(0.0, fadeRange, 1.0 - vUv.y);
    }

    float hoverHalftoneMask = 0.0;
    if (hoverHalftoneActive > 0.0) {
      float hoverHalftoneRadiusPx = hoverHalftoneRadius * logicalResolution.y;
      hoverHalftoneMask =
        smoothstep(hoverHalftoneRadiusPx, 0.0, fragDist) *
        clamp(hoverHalftoneActive, 0.0, 1.0);
    }

    float hoverFlowMask = 0.0;
    if (hoverFlowStrength > 0.0) {
      float hoverRadiusPx = hoverFlowRadius * logicalResolution.y;
      hoverFlowMask = smoothstep(hoverRadiusPx, 0.0, fragDist);
    }

    vec2 hoverDisplacement =
      radialDir * hoverFlowStrength * hoverFlowMask * halftoneSize * 0.55 +
      motionDir * hoverFlowStrength * hoverFlowMask * (0.4 + motionBias) * halftoneSize * 1.15;
    vec2 travelDisplacement = dragOffset * dragFlowStrength * 0.45;
    vec2 effectCoord = fragCoord + hoverDisplacement + travelDisplacement;

    float bandRow = floor(effectCoord.y / halftoneSize);
    float waveOffset =
      waveAmount * sin(time * waveSpeed + bandRow * 0.5) * halftoneSize;
    effectCoord.x += waveOffset;

    vec2 cellIndex = floor(effectCoord / halftoneSize);
    vec2 sampleUv = clamp(
      (cellIndex + 0.5) * halftoneSize / logicalResolution,
      vec2(0.0),
      vec2(1.0)
    );
    vec2 cellUv = fract(effectCoord / halftoneSize);

    vec4 sceneSample = texture2D(tScene, sampleUv);
    float mask = smoothstep(0.02, 0.08, sceneSample.a);
    float localPower = clamp(
      s_3 + hoverHalftonePowerShift * hoverHalftoneMask,
      -1.5,
      1.5
    );
    float localWidth = clamp(
      s_4 + hoverHalftoneWidthShift * hoverHalftoneMask,
      0.05,
      1.4
    );
    float lightLift =
      hoverLightStrength * hoverLightMask * mix(0.78, 1.18, motionBias) * 0.22;
    float toneValue =
      (sceneSample.r + sceneSample.g + sceneSample.b) * (1.0 / 3.0);
    if (applyToDarkAreas > 0.5) {
      toneValue = 1.0 - toneValue;
    }
    // Preserve the pre-toneTarget light-mode response by keeping the power
    // bias inside the averaged tone calculation.
    float powerBias = localPower * length(vec2(0.5)) * (1.0 / 3.0);
    float bandRadius = clamp(
      max(toneValue + powerBias + lightLift, minimumTone),
      0.0,
      1.0
    ) * 1.86 * 0.5;

    float alpha = 0.0;
    if (bandRadius > 0.0001) {
      float signedDistance = lineSimpleEt(cellUv, bandRadius, localWidth);
      float edge = 0.02;
      alpha = (1.0 - smoothstep(0.0, edge, signedDistance)) * mask;
    }

    vec3 activeDashColor = mix(dashColor, hoverDashColor, hoverHalftoneMask);
    vec3 color = activeDashColor * alpha;
    gl_FragColor = vec4(color, alpha);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`};e.s(["HALFTONE_PASS_SHADER",0,t])}]);