(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,543820,e=>{"use strict";var t=e.i(26645),a=e.i(779419),n=e.i(203708),o=e.i(53343),i=e.i(849825),r=e.i(190072),s=e.i(223490),l=e.i(723917);let u=new Map,c=(0,l.createBoundedFailureCache)(32);var d=e.i(54268),m=e.i(575268),f=e.i(681576),g=e.i(639257),p=e.i(393568),h=e.i(763114);let v=e=>({activePointerId:null,autoElapsed:e?.autoElapsed??0,dragging:!1,hoverStrength:0,mouseX:.5,mouseY:.5,pointerInside:!1,pointerVelocityX:0,pointerVelocityY:0,pointerX:0,pointerY:0,rotateElapsed:e?.rotateElapsed??0,rotationVelocityX:0,rotationVelocityY:0,rotationVelocityZ:0,rotationX:e?.rotationX??0,rotationY:e?.rotationY??0,rotationZ:e?.rotationZ??0,smoothedMouseX:.5,smoothedMouseY:.5,targetRotationX:e?.targetRotationX??0,targetRotationY:e?.targetRotationY??0,velocityX:0,velocityY:0}),w=({current:e,damping:t,strength:a,target:n,velocity:o})=>{let i=(o+(n-e)*a)*t;return{value:e+i,velocity:i}};var x=r,S=e.i(408560),y=e.i(331935);function b(e){let t=new S.PMREMGenerator(e),a=t.fromScene(new y.RoomEnvironment,.04).texture;return t.dispose(),a}let M=1/320,R=new x.Color(197379);class E extends x.MeshPhysicalMaterial{halftoneUniforms;constructor(e=10){super(),this.halftoneUniforms={chromaticAberration:{value:.05},transmission:{value:0},_transmission:{value:1},transmissionMap:{value:null},refractionEnvMap:{value:null},useEnvMapRefraction:{value:0},roughness:{value:0},thickness:{value:0},thicknessMap:{value:null},attenuationDistance:{value:1/0},attenuationColor:{value:new x.Color("white")},anisotropicBlur:{value:.1},time:{value:0},distortion:{value:0},distortionScale:{value:.5},temporalDistortion:{value:0},buffer:{value:null}},this.customProgramCacheKey=()=>`halftone-transmission-${e}`,this.onBeforeCompile=t=>{t.uniforms={...t.uniforms,...this.halftoneUniforms},t.defines??={},this.anisotropy>0&&(t.defines.USE_ANISOTROPY=""),t.defines.USE_TRANSMISSION="",t.fragmentShader=`
        uniform float chromaticAberration;
        uniform float anisotropicBlur;
        uniform float time;
        uniform float distortion;
        uniform float distortionScale;
        uniform float temporalDistortion;
        uniform sampler2D buffer;

        vec3 random3(vec3 c) {
          float j = 4096.0 * sin(dot(c, vec3(17.0, 59.4, 15.0)));
          vec3 r;
          r.z = fract(512.0 * j);
          j *= 0.125;
          r.x = fract(512.0 * j);
          j *= 0.125;
          r.y = fract(512.0 * j);
          return r - 0.5;
        }

        uint hash(uint x) {
          x += (x << 10u);
          x ^= (x >> 6u);
          x += (x << 3u);
          x ^= (x >> 11u);
          x += (x << 15u);
          return x;
        }

        uint hash(uvec2 v) { return hash(v.x ^ hash(v.y)); }
        uint hash(uvec3 v) { return hash(v.x ^ hash(v.y) ^ hash(v.z)); }
        uint hash(uvec4 v) {
          return hash(v.x ^ hash(v.y) ^ hash(v.z) ^ hash(v.w));
        }

        float floatConstruct(uint m) {
          const uint ieeeMantissa = 0x007FFFFFu;
          const uint ieeeOne = 0x3F800000u;
          m &= ieeeMantissa;
          m |= ieeeOne;
          float f = uintBitsToFloat(m);
          return f - 1.0;
        }

        float randomBase(float x) {
          return floatConstruct(hash(floatBitsToUint(x)));
        }
        float randomBase(vec2 v) {
          return floatConstruct(hash(floatBitsToUint(v)));
        }
        float randomBase(vec3 v) {
          return floatConstruct(hash(floatBitsToUint(v)));
        }
        float randomBase(vec4 v) {
          return floatConstruct(hash(floatBitsToUint(v)));
        }

        float rand(float seed) {
          return randomBase(vec3(gl_FragCoord.xy, seed));
        }

        const float F3 = 0.3333333;
        const float G3 = 0.1666667;

        float snoise(vec3 p) {
          vec3 s = floor(p + dot(p, vec3(F3)));
          vec3 x = p - s + dot(s, vec3(G3));
          vec3 e = step(vec3(0.0), x - x.yzx);
          vec3 i1 = e * (1.0 - e.zxy);
          vec3 i2 = 1.0 - e.zxy * (1.0 - e);
          vec3 x1 = x - i1 + G3;
          vec3 x2 = x - i2 + 2.0 * G3;
          vec3 x3 = x - 1.0 + 3.0 * G3;
          vec4 w;
          vec4 d;
          w.x = dot(x, x);
          w.y = dot(x1, x1);
          w.z = dot(x2, x2);
          w.w = dot(x3, x3);
          w = max(0.6 - w, 0.0);
          d.x = dot(random3(s), x);
          d.y = dot(random3(s + i1), x1);
          d.z = dot(random3(s + i2), x2);
          d.w = dot(random3(s + 1.0), x3);
          w *= w;
          w *= w;
          d *= w;
          return dot(d, vec4(52.0));
        }

        float snoiseFractal(vec3 m) {
          return 0.5333333 * snoise(m)
            + 0.2666667 * snoise(2.0 * m)
            + 0.1333333 * snoise(4.0 * m)
            + 0.0666667 * snoise(8.0 * m);
        }
      `+t.fragmentShader,t.fragmentShader=t.fragmentShader.replace("#include <transmission_pars_fragment>",`
          #ifdef USE_TRANSMISSION
            uniform float _transmission;
            uniform float thickness;
            uniform float attenuationDistance;
            uniform vec3 attenuationColor;
            uniform sampler2D refractionEnvMap;
            uniform float useEnvMapRefraction;
            #ifdef USE_TRANSMISSIONMAP
              uniform sampler2D transmissionMap;
            #endif
            #ifdef USE_THICKNESSMAP
              uniform sampler2D thicknessMap;
            #endif
            uniform vec2 transmissionSamplerSize;
            uniform sampler2D transmissionSamplerMap;
            uniform mat4 modelMatrix;
            uniform mat4 projectionMatrix;
            varying vec3 vWorldPosition;

            vec3 getVolumeTransmissionRay(
              const in vec3 n,
              const in vec3 v,
              const in float thicknessValue,
              const in float ior,
              const in mat4 modelMatrix
            ) {
              vec3 refractionVector = refract(-v, normalize(n), 1.0 / ior);
              vec3 modelScale;
              modelScale.x = length(vec3(modelMatrix[0].xyz));
              modelScale.y = length(vec3(modelMatrix[1].xyz));
              modelScale.z = length(vec3(modelMatrix[2].xyz));
              return normalize(refractionVector) * thicknessValue * modelScale;
            }

            float applyIorToRoughness(
              const in float roughnessValue,
              const in float ior
            ) {
              return roughnessValue * clamp(ior * 2.0 - 2.0, 0.0, 1.0);
            }

            vec2 directionToEquirectUv(const in vec3 direction) {
              vec3 dir = normalize(direction);
              vec2 uv = vec2(
                atan(dir.z, dir.x) * 0.15915494309189535 + 0.5,
                asin(clamp(dir.y, -1.0, 1.0)) * 0.3183098861837907 + 0.5
              );

              return vec2(fract(uv.x), 1.0 - clamp(uv.y, 0.0, 1.0));
            }

            vec4 getTransmissionSample(
              const in vec2 fragCoord,
              const in vec3 transmissionDirection,
              const in float roughnessValue,
              const in float ior
            ) {
              if (useEnvMapRefraction > 0.5) {
                return texture2D(
                  refractionEnvMap,
                  directionToEquirectUv(transmissionDirection)
                );
              }

              float framebufferLod =
                log2(transmissionSamplerSize.x) *
                applyIorToRoughness(roughnessValue, ior);
              return texture2D(buffer, fragCoord.xy);
            }

            vec3 applyVolumeAttenuation(
              const in vec3 radiance,
              const in float transmissionDistance,
              const in vec3 attenuationColorValue,
              const in float attenuationDistanceValue
            ) {
              if (isinf(attenuationDistanceValue)) {
                return radiance;
              }

              vec3 attenuationCoefficient =
                -log(attenuationColorValue) / attenuationDistanceValue;
              vec3 transmittance =
                exp(-attenuationCoefficient * transmissionDistance);

              return transmittance * radiance;
            }

            vec4 getIBLVolumeRefraction(
              const in vec3 n,
              const in vec3 v,
              const in float roughnessValue,
              const in vec3 diffuseColor,
              const in vec3 specularColor,
              const in float specularF90,
              const in vec3 position,
              const in mat4 modelMatrix,
              const in mat4 viewMatrix,
              const in mat4 projMatrix,
              const in float ior,
              const in float thicknessValue,
              const in vec3 attenuationColorValue,
              const in float attenuationDistanceValue
            ) {
              vec3 transmissionRay = getVolumeTransmissionRay(
                n,
                v,
                thicknessValue,
                ior,
                modelMatrix
              );
              vec3 refractedRayExit = position + transmissionRay;
              vec4 ndcPos =
                projMatrix * viewMatrix * vec4(refractedRayExit, 1.0);
              vec2 refractionCoords = ndcPos.xy / ndcPos.w;
              refractionCoords += 1.0;
              refractionCoords /= 2.0;
              vec3 transmissionDirection = normalize(transmissionRay);
              vec4 transmittedLight = getTransmissionSample(
                refractionCoords,
                transmissionDirection,
                roughnessValue,
                ior
              );
              vec3 attenuatedColor = applyVolumeAttenuation(
                transmittedLight.rgb,
                length(transmissionRay),
                attenuationColorValue,
                attenuationDistanceValue
              );
              vec3 F = EnvironmentBRDF(
                n,
                v,
                specularColor,
                specularF90,
                roughnessValue
              );
              return vec4(
                (1.0 - F) * attenuatedColor * diffuseColor,
                transmittedLight.a
              );
            }
          #endif
        `),t.fragmentShader=t.fragmentShader.replace("#include <transmission_fragment>",`
          material.transmission = _transmission;
          material.transmissionAlpha = 1.0;
          material.thickness = thickness;
          material.attenuationDistance = attenuationDistance;
          material.attenuationColor = attenuationColor;
          #ifdef USE_TRANSMISSIONMAP
            material.transmission *= texture2D(transmissionMap, vUv).r;
          #endif
          #ifdef USE_THICKNESSMAP
            material.thickness *= texture2D(thicknessMap, vUv).g;
          #endif

          vec3 pos = vWorldPosition;
          float runningSeed = 0.0;
          vec3 v = normalize(cameraPosition - pos);
          vec3 n = inverseTransformDirection(normal, viewMatrix);
          vec3 transmission = vec3(0.0);
          float transmissionR;
          float transmissionG;
          float transmissionB;
          float randomCoords = rand(runningSeed++);
          float thicknessSmear =
            thickness * max(pow(roughnessFactor, 0.33), anisotropicBlur);
          vec3 distortionNormal = vec3(0.0);
          vec3 temporalOffset = vec3(time, -time, -time) * temporalDistortion;

          if (distortion > 0.0) {
            distortionNormal = distortion * vec3(
              snoiseFractal(vec3(pos * distortionScale + temporalOffset)),
              snoiseFractal(vec3(pos.zxy * distortionScale - temporalOffset)),
              snoiseFractal(vec3(pos.yxz * distortionScale + temporalOffset))
            );
          }

          for (float i = 0.0; i < ${e}.0; i++) {
            vec3 sampleNorm = normalize(
              n +
              roughnessFactor * roughnessFactor * 2.0 *
              normalize(
                vec3(
                  rand(runningSeed++) - 0.5,
                  rand(runningSeed++) - 0.5,
                  rand(runningSeed++) - 0.5
                )
              ) *
              pow(rand(runningSeed++), 0.33) +
              distortionNormal
            );

            transmissionR = getIBLVolumeRefraction(
              sampleNorm,
              v,
              material.roughness,
              material.diffuseColor,
              material.specularColor,
              material.specularF90,
              pos,
              modelMatrix,
              viewMatrix,
              projectionMatrix,
              material.ior,
              material.thickness + thicknessSmear * (i + randomCoords) / float(${e}),
              material.attenuationColor,
              material.attenuationDistance
            ).r;

            transmissionG = getIBLVolumeRefraction(
              sampleNorm,
              v,
              material.roughness,
              material.diffuseColor,
              material.specularColor,
              material.specularF90,
              pos,
              modelMatrix,
              viewMatrix,
              projectionMatrix,
              material.ior * (1.0 + chromaticAberration * (i + randomCoords) / float(${e})),
              material.thickness + thicknessSmear * (i + randomCoords) / float(${e}),
              material.attenuationColor,
              material.attenuationDistance
            ).g;

            transmissionB = getIBLVolumeRefraction(
              sampleNorm,
              v,
              material.roughness,
              material.diffuseColor,
              material.specularColor,
              material.specularF90,
              pos,
              modelMatrix,
              viewMatrix,
              projectionMatrix,
              material.ior * (1.0 + 2.0 * chromaticAberration * (i + randomCoords) / float(${e})),
              material.thickness + thicknessSmear * (i + randomCoords) / float(${e}),
              material.attenuationColor,
              material.attenuationDistance
            ).b;

            transmission.r += transmissionR;
            transmission.g += transmissionG;
            transmission.b += transmissionB;
          }

          transmission /= ${e}.0;
          totalDiffuse = mix(totalDiffuse, transmission.rgb, material.transmission);
        `)},Object.keys(this.halftoneUniforms).forEach(e=>{Object.defineProperty(this,e,{configurable:!0,enumerable:!0,get:()=>this.halftoneUniforms[e]?.value,set:t=>{this.halftoneUniforms[e].value=t}})})}}function C(e,t){e.generateMipmaps=!0,e.magFilter=x.LinearFilter,e.minFilter=x.LinearMipmapLinearFilter,e.anisotropy=Math.min(t.capabilities.getMaxAnisotropy(),8)}function A(e){let t=new x.Scene;return t.background=e??R,t.backgroundIntensity=e?1:.4,t}function D(e,t){let a=new S.PMREMGenerator(e),n=t?a.fromEquirectangular(t).texture:a.fromScene(new y.RoomEnvironment,.04).texture;return a.dispose(),n}async function T(e){var t;let a,n=await (t=x.SRGBColorSpace,a=new x.TextureLoader,new Promise((n,o)=>{a.load("/images/halftone/environment.jpg",a=>{a.colorSpace=t,C(a,e),n(a)},void 0,o)})),o=function(e,t){let a,{width:n,height:o}=(a=e.image,{width:a?.naturalWidth??a?.width??void 0,height:a?.naturalHeight??a?.height??void 0});if(!n||!o)return e;let i=document.createElement("canvas");i.width=n,i.height=o;let r=i.getContext("2d");if(!r)return e;let s=n/1.55,l=o/1.55;r.drawImage(e.image,(n-s)/2,(o-l)/2,s,l,0,0,n,o);let u=new x.CanvasTexture(i);return u.colorSpace=e.colorSpace,u.wrapS=x.ClampToEdgeWrapping,u.wrapT=x.ClampToEdgeWrapping,C(u,t),u.needsUpdate=!0,u}(n,e);return o!==n&&n.dispose(),o.mapping=x.EquirectangularReflectionMapping,o.wrapS=x.ClampToEdgeWrapping,o.wrapT=x.ClampToEdgeWrapping,o.needsUpdate=!0,{backgroundTexture:o,environmentTexture:D(e,o),glassTransmissionScene:A(o)}}async function k(e){let t=b(e);try{let a=await T(e);return{glassBackgroundTexture:a.backgroundTexture,glassEnvironmentTexture:a.environmentTexture,glassTransmissionScene:a.glassTransmissionScene,solidEnvironmentTexture:t}}catch{let a;return{glassBackgroundTexture:((a=new x.DataTexture(new Uint8Array([3,3,3,255]),1,1,x.RGBAFormat)).colorSpace=x.SRGBColorSpace,a.wrapS=x.ClampToEdgeWrapping,a.wrapT=x.ClampToEdgeWrapping,a.mapping=x.EquirectangularReflectionMapping,C(a,e),a.needsUpdate=!0,a),glassEnvironmentTexture:D(e),glassTransmissionScene:A(),solidEnvironmentTexture:t}}}let B=function(e,t,a){let n="glass"===t.surface,o=t.thickness*M,i=.18+.12*t.environmentPower,r=Math.max(4*o,.12);e.color.set(n?0xffffff:t.color),e.roughness=t.roughness,e.metalness=t.metalness,e.envMap=n?a.glassEnvironmentTexture:a.solidEnvironmentTexture,e.envMapIntensity=n?i:.25,e.clearcoat=+!!n,e.clearcoatRoughness=n?Math.max(.25*t.roughness,.01):.08,e.reflectivity=n?.98:.5,e.transmission=0,e._transmission=+!!n,e.refractionEnvMap=n?a.glassBackgroundTexture:null,e.useEnvMapRefraction=+!!n,e.thickness=n?o:0,e.ior=n?t.refraction:1.5,e.buffer=null,e.bumpMap=null,e.bumpScale=0,e.roughnessMap=null,e.side=x.FrontSide,e.transparent=!1,e.opacity=1,e.depthWrite=!0,e.attenuationColor.set(n?t.color:0xffffff),e.attenuationDistance=n?r:1/0,e.anisotropicBlur=n?x.MathUtils.lerp(.03,.12,t.roughness):.1,e.chromaticAberration=.05*!n,e.distortion=0,e.distortionScale=.5,e.temporalDistortion=0,e.userData.halftoneIsGlass=n,e.userData.halftoneGlassBacksideThickness=n?2*o:0,e.userData.halftoneGlassBacksideEnvIntensity=n?2.8*i:0,e.userData.halftoneUseEnvironmentRefraction=n,e.needsUpdate=!0},P=function(e){let{camera:t,elapsedTime:a,material:n,mesh:o,outputTarget:i,renderer:r,scene:s,transmissionBacksideTarget:l,transmissionTarget:u,transmissionScene:c}=e,d=!0===n.userData.halftoneIsGlass;if(n.time=a,!d){r.setRenderTarget(i),r.clear(),r.render(s,t);return}if(!0===n.userData.halftoneUseEnvironmentRefraction){n.buffer=null,r.setRenderTarget(i),r.clear(),r.render(s,t);return}let m=r.toneMapping,f=o.visible,g=s.background,p=s.backgroundIntensity,h=n.side,v=n.thickness,w=n.envMapIntensity,S=n.userData.halftoneGlassBacksideThickness??v,y=n.userData.halftoneGlassBacksideEnvIntensity??w;r.toneMapping=x.NoToneMapping,c?(r.setRenderTarget(l),r.clear(),r.render(c,t)):(s.background=R,s.backgroundIntensity=1,o.visible=!1,r.setRenderTarget(l),r.clear(),r.render(s,t),o.visible=f),n.buffer=l.texture,n.thickness=S,n.side=x.BackSide,n.envMapIntensity=y,r.setRenderTarget(u),r.clear(),r.render(s,t),n.buffer=u.texture,n.thickness=v,n.side=h,n.envMapIntensity=w,c||(s.background=g,s.backgroundIntensity=p),r.setRenderTarget(i),r.clear(),r.render(s,t),r.toneMapping=m},Y=function(e){e.glassBackgroundTexture.dispose(),e.glassEnvironmentTexture!==e.glassBackgroundTexture&&e.glassEnvironmentTexture.dispose(),e.glassTransmissionScene.traverse(e=>{(e.geometry&&e.geometry.dispose(),Array.isArray(e.material))?e.material.forEach(e=>e.dispose()):e.material?.dispose?.()}),e.solidEnvironmentTexture.dispose()};var V=e.i(878707);let L=g.HALFTONE_CONSTANTS.referencePreviewDistance,F=g.HALFTONE_CONSTANTS.minFootprintScale;function I(e,t,a){let n=t*Math.PI/180;e.position.set(5*Math.cos(n),a,5*Math.sin(n))}function X(e){return e?Math.max(e.width,0)*Math.max(e.height,0):0}function z({camera:e,localBounds:t,meshMatrixWorld:a,viewportWidth:n,viewportHeight:o}){var i;let s,l,u,c;if(t.isEmpty()||n<=0||o<=0)return null;let d=1/0,m=1/0,f=-1/0,g=-1/0,p=!1;for(let i of function(e){let{min:t,max:a}=e;return[new r.Vector3(t.x,t.y,t.z),new r.Vector3(t.x,t.y,a.z),new r.Vector3(t.x,a.y,t.z),new r.Vector3(t.x,a.y,a.z),new r.Vector3(a.x,t.y,t.z),new r.Vector3(a.x,t.y,a.z),new r.Vector3(a.x,a.y,t.z),new r.Vector3(a.x,a.y,a.z)]}(t)){if(i.applyMatrix4(a).project(e),!Number.isFinite(i.x)||!Number.isFinite(i.y)||!Number.isFinite(i.z))continue;p=!0;let t=(.5*i.x+.5)*n,r=(1-(.5*i.y+.5))*o;d=Math.min(d,t),m=Math.min(m,r),f=Math.max(f,t),g=Math.max(g,r)}return p?(s=Math.max((i={x:d,y:m,width:f-d,height:g-m}).x,0),l=Math.max(i.y,0),u=Math.min(i.x+i.width,n),c=Math.min(i.y+i.height,o),u<=s||c<=l?null:{x:s,y:l,width:u-s,height:c-l}):null}async function O({container:e,geometry:t,settings:a,initialPose:n,reducedMotion:o=!1,onFirstFrame:i}){if("band"!==a.halftone.variant)throw Error("createBandSession: settings must use the band variant.");let s=a.halftone,l=a.animation,{getWidth:u,getHeight:c,getVirtualWidth:g,getVirtualHeight:x}=(0,p.createVirtualSize)(e),S=(0,m.createVisualRenderer)({antialias:!1,alpha:!0});if(null===S)return null;S.outputColorSpace=r.SRGBColorSpace,S.setPixelRatio(1),S.setClearColor(0,0),S.setSize(g(),x(),!1);let y=S.domElement;y.style.cursor=o?"default":"grab",y.style.display="block",y.style.height="100%",y.style.touchAction="none",y.style.width="100%",e.appendChild(y);let b=await k(S),M=new r.Scene;M.background=null;let R=new r.PerspectiveCamera(45,u()/c(),.1,100);R.position.z=a.previewDistance;let C=new r.DirectionalLight(0xffffff,a.lighting.intensity);I(C,a.lighting.angleDegrees,a.lighting.height),M.add(C);let A=new r.DirectionalLight(0xffffff,a.lighting.fillIntensity);A.position.set(-3,-1,1),M.add(A),M.add(new r.AmbientLight(0xffffff,a.lighting.ambientIntensity));let D=new E;B(D,a.material,b);let T=new r.Mesh(t,D);M.add(T);let H=(0,f.createRenderTarget)(g(),x()),U=(0,f.createRenderTarget)(g(),x()),N=(0,f.createRenderTarget)(g(),x()),G=new r.PlaneGeometry(2,2),_=new r.OrthographicCamera(-1,1,1,-1,0,1),W=new r.ShaderMaterial({transparent:!0,uniforms:{tScene:{value:H.texture},tGlow:{value:H.texture},effectResolution:{value:new r.Vector2(g(),x())},logicalResolution:{value:new r.Vector2(g(),x())},tile:{value:s.scale},s_3:{value:s.power},s_4:{value:s.width},applyToDarkAreas:{value:+("dark"===s.toneTarget)},dashColor:{value:new r.Color(s.dashColor)},hoverDashColor:{value:new r.Color(s.hoverDashColor)},time:{value:0},waveAmount:{value:0},waveSpeed:{value:1},footprintScale:{value:1},interactionUv:{value:new r.Vector2(.5,.5)},interactionVelocity:{value:new r.Vector2(0,0)},dragOffset:{value:new r.Vector2(0,0)},hoverHalftoneActive:{value:0},hoverHalftonePowerShift:{value:0},hoverHalftoneRadius:{value:.2},hoverHalftoneWidthShift:{value:0},hoverLightStrength:{value:0},hoverLightRadius:{value:.2},hoverFlowStrength:{value:0},hoverFlowRadius:{value:.18},dragFlowStrength:{value:0},cropToBounds:{value:0}},vertexShader:h.BLUR_PASS_SHADERS.vertex,fragmentShader:V.HALFTONE_PASS_SHADER.fragment}),j=new r.Scene;j.add(new r.Mesh(G,W));let Z=v(n),$=e=>{let t=y.getBoundingClientRect();Z.mouseX=r.MathUtils.clamp((e.clientX-t.left)/Math.max(t.width,1),0,1),Z.mouseY=r.MathUtils.clamp((e.clientY-t.top)/Math.max(t.height,1),0,1)},q=()=>{null!==Z.activePointerId&&(y.releasePointerCapture?.(Z.activePointerId),Z.activePointerId=null),Z.dragging=!1,y.style.cursor="grab"},K=e=>{$(e),(l.followDragEnabled||l.autoRotateEnabled)&&(Z.dragging=!0,Z.activePointerId=e.pointerId,y.setPointerCapture?.(e.pointerId),Z.pointerX=e.clientX,Z.pointerY=e.clientY,Z.velocityX=0,Z.velocityY=0,y.style.cursor="grabbing")},Q=e=>{if($(e),Z.pointerInside=!0,!Z.dragging)return;let t=(e.clientX-Z.pointerX)*l.dragSens,a=(e.clientY-Z.pointerY)*l.dragSens;Z.velocityX=a,Z.velocityY=t,Z.targetRotationY+=t,Z.targetRotationX+=a,Z.pointerX=e.clientX,Z.pointerY=e.clientY},J=()=>{Z.pointerInside=!1,Z.mouseX=.5,Z.mouseY=.5};o||(y.addEventListener("pointerdown",K),y.addEventListener("pointermove",Q),y.addEventListener("pointerleave",J),y.addEventListener("pointerup",q),y.addEventListener("pointercancel",q),window.addEventListener("blur",q));let ee=!1,et=({deltaSeconds:e,elapsedSeconds:t})=>{let o,u=(n?.timeElapsed??0)+t;W.uniforms.time.value=u,W.uniforms.waveAmount.value=l.waveEnabled?l.waveAmount:0,W.uniforms.waveSpeed.value=l.waveSpeed;let c=n?.rotationX??0,d=n?.rotationY??0,m=n?.rotationZ??0,f=0,p=1,h=a.lighting.angleDegrees,v=a.lighting.height;if(l.autoRotateEnabled&&(Z.autoElapsed+=e,d+=Z.autoElapsed*l.autoSpeed,c+=Math.sin(.2*Z.autoElapsed)*l.autoWobble),l.floatEnabled){let e=u*l.floatSpeed,t=l.driftAmount*Math.PI/180;f+=Math.sin(e)*l.floatAmplitude,c+=Math.sin(.72*e)*t*.45,m+=Math.cos(.93*e)*t*.3}if(l.breatheEnabled&&(p*=1+Math.sin(u*l.breatheSpeed)*l.breatheAmount),l.rotateEnabled){Z.rotateElapsed+=e;let t=l.rotatePingPong?Math.sin(Z.rotateElapsed*l.rotateSpeed)*Math.PI:Z.rotateElapsed*l.rotateSpeed;if("axis"===l.rotatePreset){let e=t*(l.rotateAxis.startsWith("-")?-1:1),a=l.rotateAxis;("x"===a||"xy"===a||"-x"===a||"-xy"===a)&&(c+=e),("y"===a||"xy"===a||"-y"===a||"-xy"===a)&&(d+=e),("z"===a||"-z"===a)&&(m+=e)}else"lissajous"===l.rotatePreset?(c+=.65*Math.sin(.85*t),d+=1.05*Math.sin(1.35*t+.8),m+=.32*Math.sin(.55*t+1.6)):"orbit"===l.rotatePreset?(c+=.42*Math.sin(.75*t),d+=1.2*Math.cos(t),m+=.24*Math.sin(1.25*t)):"tumble"===l.rotatePreset&&(c+=.55*t,d+=.9*Math.sin(.8*t),m+=.38*Math.cos(1.1*t))}if(l.lightSweepEnabled){let e=u*l.lightSweepSpeed;h+=Math.sin(e)*l.lightSweepRange,v+=Math.cos(.85*e)*l.lightSweepHeightRange}let y=c,E=d,A=.12;if(l.followHoverEnabled){let e=l.hoverRange*Math.PI/180;(l.hoverReturn||.5!==Z.mouseX||.5!==Z.mouseY)&&(y+=(Z.mouseY-.5)*e,E+=(Z.mouseX-.5)*e),A=l.hoverEase}if(l.followDragEnabled&&(!Z.dragging&&l.dragMomentum&&(Z.targetRotationX+=Z.velocityX,Z.targetRotationY+=Z.velocityY,Z.velocityX*=1-l.dragFriction,Z.velocityY*=1-l.dragFriction),y+=Z.targetRotationX,E+=Z.targetRotationY,A=l.dragFriction),!l.autoRotateEnabled||l.followHoverEnabled||l.followDragEnabled||(y=c+Z.targetRotationX,E=d+Z.targetRotationY,Z.dragging&&(y=Z.targetRotationX,E=Z.targetRotationY),A=.08),l.springReturnEnabled){let e=w({current:Z.rotationX,damping:l.springDamping,strength:l.springStrength,target:y,velocity:Z.rotationVelocityX}),t=w({current:Z.rotationY,damping:l.springDamping,strength:l.springStrength,target:E,velocity:Z.rotationVelocityY}),a=w({current:Z.rotationZ,damping:l.springDamping,strength:l.springStrength,target:m,velocity:Z.rotationVelocityZ});Z.rotationX=e.value,Z.rotationY=t.value,Z.rotationZ=a.value,Z.rotationVelocityX=e.velocity,Z.rotationVelocityY=t.velocity,Z.rotationVelocityZ=a.velocity}else Z.rotationX+=(y-Z.rotationX)*A,Z.rotationY+=(E-Z.rotationY)*A,Z.rotationZ+=(m-Z.rotationZ)*(l.rotatePingPong?.18:.12);if(T.rotation.set(Z.rotationX,Z.rotationY,Z.rotationZ),T.position.y=f,T.scale.setScalar(p),l.cameraParallaxEnabled){let e=l.cameraParallaxAmount,t=l.cameraParallaxEase,n=(Z.mouseX-.5)*2,o=(.5-Z.mouseY)*2,i=n*e,r=o*e*.7,s=Math.cos(r)*a.previewDistance;R.position.x+=(Math.sin(i)*s-R.position.x)*t,R.position.y+=(Math.sin(r)*a.previewDistance*.85-R.position.y)*t,R.position.z+=(Math.cos(i)*s-R.position.z)*t}else R.position.x+=(0-R.position.x)*.12,R.position.y+=(0-R.position.y)*.12,R.position.z+=(a.previewDistance-R.position.z)*.12;let k=new r.Vector3(0,.2*f,0);R.lookAt(k),I(C,h,v),(W.uniforms.footprintScale.value=(T.geometry.boundingBox||T.geometry.computeBoundingBox(),(o=T.geometry.boundingBox)?(T.updateMatrixWorld(),R.updateMatrixWorld(),function({camera:e,localBounds:t,lookAtTarget:a,meshMatrixWorld:n,viewportWidth:o,viewportHeight:i}){let s=z({camera:e,localBounds:t,meshMatrixWorld:n,viewportWidth:o,viewportHeight:i}),l=e.clone(),u=l.position.clone().sub(a),c=u.lengthSq()>0?u.setLength(L):new r.Vector3(0,0,L);l.position.copy(a).add(c),l.lookAt(a),l.updateProjectionMatrix(),l.updateMatrixWorld(!0);let d=z({camera:l,localBounds:t,meshMatrixWorld:n,viewportWidth:o,viewportHeight:i}),m=X(s),f=X(d);return m<=0||f<=0?1:Math.max(Math.sqrt(m/f),F)}({camera:R,localBounds:o,lookAtTarget:k,meshMatrixWorld:T.matrixWorld,viewportWidth:g(),viewportHeight:x()})):1),s.enabled)?(P({camera:R,elapsedTime:u,material:D,mesh:T,outputTarget:H,renderer:S,scene:M,transmissionBacksideTarget:U,transmissionTarget:N,transmissionScene:b.glassTransmissionScene}),S.setRenderTarget(null),S.clear(),S.render(j,_),ee||(ee=!0,i?.())):P({camera:R,elapsedTime:u,material:D,mesh:T,outputTarget:null,renderer:S,scene:M,transmissionBacksideTarget:U,transmissionTarget:N,transmissionScene:b.glassTransmissionScene})},ea="u"<typeof ResizeObserver?null:new ResizeObserver(()=>{let e=g(),t=x();S.setSize(e,t,!1),R.aspect=u()/c(),R.updateProjectionMatrix(),H.setSize(e,t),U.setSize(e,t),N.setSize(e,t),W.uniforms.effectResolution.value.set(e,t),W.uniforms.logicalResolution.value.set(e,t)});function en(){W.dispose(),G.dispose(),D.dispose(),H.dispose(),U.dispose(),N.dispose(),Y(b),S?.dispose(),y.parentNode===e&&e.removeChild(y)}if(ea?.observe(e),o)return et({deltaSeconds:0,elapsedSeconds:0,timestamp:0}),{dispose(){ea?.disconnect(),en()}};let eo=(0,d.createVisualFrameLoop)({renderFrame:et,target:e,targetVisibilityOptions:{rootMargin:"100px"}});return eo.start(),{dispose(){eo.dispose(),ea?.disconnect(),y.removeEventListener("pointerdown",K),y.removeEventListener("pointermove",Q),y.removeEventListener("pointerleave",J),y.removeEventListener("pointerup",q),y.removeEventListener("pointercancel",q),window.removeEventListener("blur",q),en()}}}let H={fragment:`
  precision highp float;

  uniform sampler2D tScene;
  uniform sampler2D tGlow;
  uniform vec2 resolution;
  uniform float numRows;
  uniform float glowStr;
  uniform float contrast;
  uniform float power;
  uniform float shading;
  uniform float baseInk;
  uniform float maxBar;
  uniform float rowMerge;
  uniform float cellRatio;
  uniform float cutoff;
  uniform float highlightOpen;
  uniform float shadowGrouping;
  uniform float shadowCrush;
  uniform vec3 dashColor;
  uniform float time;
  uniform float waveAmount;
  uniform float waveSpeed;
  uniform float distanceScale;

  varying vec2 vUv;

  void main() {
    float rowH = resolution.y / (numRows * distanceScale);
    float row = floor(gl_FragCoord.y / rowH);
    float rowFrac = gl_FragCoord.y / rowH - row;
    float rowV = (row + 0.5) * rowH / resolution.y;
    float dy = abs(rowFrac - 0.5);

    float waveOffset = waveAmount * sin(time * waveSpeed + row * 0.5) * rowH;
    float effectiveX = gl_FragCoord.x + waveOffset;
    float cellW = rowH * cellRatio;
    float cellIdx = floor(effectiveX / cellW);
    float cellFrac = (effectiveX - cellIdx * cellW) / cellW;
    float cellU = (cellIdx + 0.5) * cellW / resolution.x;

    vec2 sampleUv = vec2(
      clamp(cellU, 0.0, 1.0),
      clamp(rowV, 0.0, 1.0)
    );

    vec4 sceneSample = texture2D(tScene, sampleUv);
    vec4 glowCell = texture2D(tGlow, sampleUv);

    float mask = smoothstep(0.02, 0.08, sceneSample.a);
    float lum = dot(sceneSample.rgb, vec3(0.299, 0.587, 0.114));
    float avgLum = dot(glowCell.rgb, vec3(0.299, 0.587, 0.114));
    float detail = lum - avgLum;

    float litLum = lum + max(detail, 0.0) * shading
      - max(-detail, 0.0) * shading * 0.55;
    litLum = clamp((litLum - cutoff) / max(1.0 - cutoff, 0.001), 0.0, 1.0);
    litLum = pow(litLum, max(contrast, 0.25));

    float darkness = 1.0 - litLum;
    float groupedLum = clamp((avgLum - cutoff) / max(1.0 - cutoff, 0.001), 0.0, 1.0);
    groupedLum = pow(groupedLum, max(contrast * 0.9, 0.25));
    float groupedDarkness = 1.0 - groupedLum;
    darkness = mix(darkness, max(darkness, groupedDarkness), shadowGrouping);
    darkness = clamp(
      (darkness - highlightOpen) / max(1.0 - highlightOpen, 0.001),
      0.0,
      1.0
    );

    float shadowMask = smoothstep(0.42, 0.96, darkness);
    darkness = mix(darkness, mix(darkness, 1.0, shadowMask), shadowCrush);

    float inkBase = baseInk * smoothstep(0.03, 0.24, darkness);
    float ink = mix(inkBase, 1.0, darkness);
    float fill = pow(ink, 1.05) * power;
    fill = clamp(fill, 0.0, 1.0) * mask;

    float dynamicBarHalf = mix(0.08, maxBar, smoothstep(0.03, 0.85, ink));
    float dynamicBarHalfY = min(
      dynamicBarHalf + rowMerge * smoothstep(0.42, 0.98, ink),
      0.78
    );
    float dx2 = abs(cellFrac - 0.5);
    float halfFill = fill * 0.5;
    float bodyHalfW = max(halfFill - dynamicBarHalf * (rowH / cellW), 0.0);
    float capRX = dynamicBarHalf * rowH;
    float capRY = dynamicBarHalfY * rowH;

    float inDash = 0.0;
    if (dx2 <= bodyHalfW) {
      float edgeDist = dynamicBarHalfY - dy;
      inDash = smoothstep(-0.03, 0.03, edgeDist);
    } else {
      float cdx = (dx2 - bodyHalfW) * cellW;
      float cdy = dy * rowH;
      float ellipseDist = sqrt(
        (cdx * cdx) / max(capRX * capRX, 0.0001) +
        (cdy * cdy) / max(capRY * capRY, 0.0001)
      );
      inDash = 1.0 - smoothstep(1.0 - 0.08, 1.0 + 0.08, ellipseDist);
    }

    inDash *= step(0.001, ink) * mask;
    inDash *= 1.0 + 0.03 * sin(time * 0.8 + row * 0.1);

    vec4 glow = texture2D(tGlow, vUv);
    float glowLum = dot(glow.rgb, vec3(0.299, 0.587, 0.114));
    float halo = glowLum * glowStr * 0.25 * (1.0 - inDash);
    float sharp = smoothstep(0.3, 0.5, inDash + halo);
    vec3 color = dashColor * sharp;

    gl_FragColor = vec4(color, sharp);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`},U=g.HALFTONE_CONSTANTS.pointerEasingDefault,N=g.HALFTONE_CONSTANTS.pointerEasingAutorotateDrag,G=g.HALFTONE_CONSTANTS.autorotateVelocityDecay,_={intensity:1.5,fillIntensity:.15,ambientIntensity:.08,angleDegrees:45,height:2},W={intensity:3,fillIntensity:0,ambientIntensity:.3,angleDegrees:53,height:2},j={surface:"solid",color:0xd4d0c8,roughness:.42,metalness:.16,thickness:150,refraction:2,environmentPower:5},Z={surface:"glass",color:8224125,roughness:0,metalness:0,thickness:15.58,refraction:2,environmentPower:5},$={variant:"band",enabled:!0,scale:24.72,power:-.07,toneTarget:"light",width:.46,dashColor:4864245,hoverDashColor:4864245},q={variant:"rows",enabled:!0,numRows:150,glowStrength:0,contrast:1.2,power:1.1,shading:3,baseInk:.19,maxBar:.35,rowMerge:.08,cellRatio:2.2,cutoff:.02,highlightOpen:.04,shadowGrouping:.18,shadowCrush:.14,dashColor:4864245},K={autoRotateEnabled:!0,breatheEnabled:!1,breatheAmount:.04,breatheSpeed:.8,floatEnabled:!1,floatAmplitude:.16,floatSpeed:.8,driftAmount:8,cameraParallaxEnabled:!1,cameraParallaxAmount:.3,cameraParallaxEase:.08,lightSweepEnabled:!1,lightSweepRange:28,lightSweepHeightRange:.5,lightSweepSpeed:.7,followHoverEnabled:!1,followDragEnabled:!1,hoverHalftoneEnabled:!1,hoverLightEnabled:!1,dragFlowEnabled:!1,rotateEnabled:!1,autoSpeed:.2,autoWobble:.3,hoverRange:25,hoverEase:.08,hoverReturn:!0,dragSens:.008,dragFriction:.08,dragMomentum:!0,rotateAxis:"y",rotatePreset:"axis",rotateSpeed:.2,rotatePingPong:!1,springDamping:.72,springReturnEnabled:!1,springStrength:.18,hoverHalftonePowerShift:.42,hoverHalftoneRadius:.2,hoverHalftoneWidthShift:-.18,hoverLightIntensity:.8,hoverLightRadius:.2,dragFlowDecay:.08,dragFlowRadius:.24,dragFlowStrength:1.8,waveEnabled:!1,waveSpeed:1,waveAmount:2},Q={...K,followDragEnabled:!0,autoSpeed:.15,rotateSpeed:.1},J=(0,a.styled)("div")({name:"SceneContainer",class:"slwus6m",propsAsIs:!1});e.s(["HalftoneModelScene",0,function({modelUrl:e,settings:a,initialPose:l,geometryOptions:w}){let x=(0,n.useRef)(null),{reducedMotion:S}=(0,i.useVisualRuntime)(),y=(0,n.useCallback)(()=>(function(e,t={}){let a=`${e}#${JSON.stringify(t)}`;if(c.has(a))return Promise.reject(Error(`GLB previously failed: ${e}`));let n=u.get(a);if(n)return n;let o=new r.LoadingManager;o.setURLModifier(e=>/\.(png|jpe?g|webp|gif|bmp)$/i.test(e)?"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO8B7Q8AAAAASUVORK5CYII=":e);let i=new s.GLTFLoader(o).loadAsync(e).then(a=>{a.scene.updateMatrixWorld(!0);let n=[];if(a.scene.traverse(e=>{if(!(e instanceof r.Mesh)||!e.geometry)return;let t=e.geometry.clone();t.attributes.normal||t.computeVertexNormals(),t.applyMatrix4(e.matrixWorld),n.push(t)}),0===n.length)throw Error(`GLB contains no mesh geometry: ${e}`);return function(e,{scaleTarget:t,legacyNormalization:a=!1,postRotateZ:n=0}){e.computeBoundingBox();let o=new r.Vector3,i=new r.Vector3;if(e.boundingBox?.getCenter(o),e.boundingBox?.getSize(i),e.translate(-o.x,-o.y,-o.z),!a){let t=[i.x,i.y,i.z],a=t.indexOf(Math.min(...t));0===a?e.applyMatrix4(new r.Matrix4().makeRotationY(Math.PI/2)):1===a&&e.applyMatrix4(new r.Matrix4().makeRotationX(Math.PI/2))}e.computeBoundingBox(),e.computeBoundingSphere();let s=e.boundingSphere?.radius||1,l=a?(t??2.75)/Math.max(i.x,i.y,i.z,.001):(t??1.6)/s;e.scale(l,l,l),e.computeBoundingBox();let u=new r.Vector3;return e.boundingBox?.getCenter(u),e.translate(-u.x,-u.y,-u.z),0!==n&&e.rotateZ(n),e.computeVertexNormals(),e.computeBoundingBox(),e.computeBoundingSphere(),e}(function(e){if(1===e.length)return e[0];let t=0,a=0,n=!1,o=e.map(e=>{let o=e.attributes.position,i=e.attributes.normal,r=e.attributes.uv??null,s=e.index,l=s?s.count:o.count;return t+=o.count,a+=l,n=n||null!==r,{index:s,indexCount:l,normal:i,position:o,uv:r,vertexCount:o.count}}),i=new Float32Array(3*t),s=new Float32Array(3*t),l=n?new Float32Array(2*t):null,u=new Uint32Array(a),c=0,d=0;for(let e of o){for(let t=0;t<e.vertexCount;t+=1){let a=(c+t)*3;if(i[a]=e.position.getX(t),i[a+1]=e.position.getY(t),i[a+2]=e.position.getZ(t),s[a]=e.normal.getX(t),s[a+1]=e.normal.getY(t),s[a+2]=e.normal.getZ(t),null!==l){let a=(c+t)*2;l[a]=e.uv?.getX(t)??0,l[a+1]=e.uv?.getY(t)??0}}if(e.index)for(let t=0;t<e.indexCount;t+=1)u[d+t]=e.index.getX(t)+c;else for(let t=0;t<e.indexCount;t+=1)u[d+t]=t+c;c+=e.vertexCount,d+=e.indexCount}let m=new r.BufferGeometry;return m.setAttribute("position",new r.BufferAttribute(i,3)),m.setAttribute("normal",new r.BufferAttribute(s,3)),null!==l&&m.setAttribute("uv",new r.BufferAttribute(l,2)),m.setIndex(new r.BufferAttribute(u,1)),m}(n),t)}).catch(e=>{throw u.delete(a),c.add(a),e});return u.set(a,i),i})(e,w),[e]),M=(0,o.useAsyncResource)(y);return(0,n.useEffect)(()=>{let e=x.current;if(null===e||null===M)return;let t=function(e={}){let t=e.material?.surface==="glass"?"glass":"solid",a=e.halftone?.variant==="rows"?{...q,...e.halftone}:{...$,...e.halftone,variant:"band"};return{previewDistance:e.previewDistance??4,modelOffsetY:e.modelOffsetY??0,lighting:{..."glass"===t?W:_,...e.lighting},material:{..."glass"===t?Z:j,...e.material,surface:t},halftone:a,animation:{..."glass"===t?Q:K,...e.animation}}}(a),n=!1,o=null;return Promise.resolve("rows"===t.halftone.variant?function({container:e,geometry:t,settings:a,initialPose:n,reducedMotion:o=!1,onFirstFrame:i}){var s,l,u,c;let w,x,S,y,M,R,E,C,A,D;if("rows"!==a.halftone.variant)throw Error("createHalftoneSession: only the rows variant is ported.");let T=a.halftone,{getWidth:k,getHeight:B,getVirtualWidth:P,getVirtualHeight:Y}=(0,p.createVirtualSize)(e),V=a.animation.followDragEnabled||a.animation.autoRotateEnabled,L=(0,m.createVisualRenderer)({antialias:!1,alpha:!0});if(null===L)return null;L.outputColorSpace=r.SRGBColorSpace,L.setPixelRatio(1),L.setClearColor(0,0),L.setSize(P(),Y(),!1);let F=L.domElement;F.style.cursor=!o&&V?"grab":"default",F.style.display="block",F.style.height="100%",F.style.touchAction="none",F.style.width="100%",e.appendChild(F);let I=b(L),X=new r.Scene;X.background=null;let z=new r.PerspectiveCamera(45,k()/B(),.1,100);z.position.z=a.previewDistance;let O=new r.DirectionalLight(0xffffff,a.lighting.intensity);s=a.lighting.angleDegrees,l=a.lighting.height,w=s*Math.PI/180,O.position.set(5*Math.cos(w),l,5*Math.sin(w)),X.add(O);let _=new r.DirectionalLight(0xffffff,a.lighting.fillIntensity);_.position.set(-3,-1,1),X.add(_),X.add(new r.AmbientLight(0xffffff,a.lighting.ambientIntensity));let W=new r.MeshPhysicalMaterial({clearcoat:0,clearcoatRoughness:.08,color:a.material.color,envMap:I,envMapIntensity:.25,metalness:a.material.metalness,reflectivity:.5,roughness:a.material.roughness,transmission:0}),j=new r.Mesh(t,W);j.position.y=a.modelOffsetY,X.add(j),z.lookAt(0,.2*a.modelOffsetY,0);let Z=(0,f.createRenderTarget)(P(),Y()),$=(u=P(),c=Y(),S=(x=(e,t)=>new r.WebGLRenderTarget(e,t,{format:r.RGBAFormat,magFilter:r.LinearFilter,minFilter:r.LinearFilter}))(u,c),y=x(u,c),R=(M=(e,t)=>new r.ShaderMaterial({uniforms:{dir:{value:new r.Vector2(e,t)},res:{value:new r.Vector2(u,c)},tInput:{value:null}},vertexShader:h.BLUR_PASS_SHADERS.vertex,fragmentShader:h.BLUR_PASS_SHADERS.fragment}))(1,0),E=M(0,1),C=new r.PlaneGeometry(2,2),(A=new r.Scene).add(new r.Mesh(C,R)),(D=new r.Scene).add(new r.Mesh(C,E)),{setSize:(e,t)=>{S.setSize(e,t),y.setSize(e,t),R.uniforms.res.value.set(e,t),E.uniforms.res.value.set(e,t)},render:(e,t,a)=>{R.uniforms.tInput.value=t,e.setRenderTarget(S),e.render(A,a),E.uniforms.tInput.value=S.texture,e.setRenderTarget(y),e.render(D,a),R.uniforms.tInput.value=y.texture,e.setRenderTarget(S),e.render(A,a),E.uniforms.tInput.value=S.texture,e.setRenderTarget(y),e.render(D,a)},targetB:y,dispose:()=>{R.dispose(),E.dispose(),C.dispose(),S.dispose(),y.dispose()}}),q=new r.PlaneGeometry(2,2),K=new r.OrthographicCamera(-1,1,1,-1,0,1),Q=new r.ShaderMaterial({transparent:!0,uniforms:{baseInk:{value:T.baseInk},cellRatio:{value:T.cellRatio},contrast:{value:T.contrast},cutoff:{value:T.cutoff},dashColor:{value:new r.Color(T.dashColor)},distanceScale:{value:a.previewDistance/g.HALFTONE_CONSTANTS.referencePreviewDistance},glowStr:{value:T.glowStrength},highlightOpen:{value:T.highlightOpen},maxBar:{value:T.maxBar},numRows:{value:T.numRows},power:{value:T.power},resolution:{value:new r.Vector2(P(),Y())},rowMerge:{value:T.rowMerge},shading:{value:T.shading},shadowCrush:{value:T.shadowCrush},shadowGrouping:{value:T.shadowGrouping},tGlow:{value:$.targetB.texture},tScene:{value:Z.texture},time:{value:0},waveAmount:{value:a.animation.waveEnabled?a.animation.waveAmount:0},waveSpeed:{value:a.animation.waveSpeed}},vertexShader:h.BLUR_PASS_SHADERS.vertex,fragmentShader:H.fragment}),J=new r.Scene;J.add(new r.Mesh(q,Q));let ee=v(n),et=()=>{let e=k(),t=B(),a=P(),n=Y();L.setSize(a,n,!1),z.aspect=e/t,z.updateProjectionMatrix(),Z.setSize(a,n),$.setSize(a,n),Q.uniforms.resolution.value.set(a,n)},ea="u"<typeof ResizeObserver?null:new ResizeObserver(et);ea?.observe(e);let en=e=>{let t=F.getBoundingClientRect();ee.mouseX=r.MathUtils.clamp((e.clientX-t.left)/Math.max(t.width,1),0,1),ee.mouseY=r.MathUtils.clamp((e.clientY-t.top)/Math.max(t.height,1),0,1)},eo=e=>{en(e),ee.dragging=!0,ee.pointerX=e.clientX,ee.pointerY=e.clientY,ee.velocityX=0,ee.velocityY=0,F.style.cursor="grabbing"},ei=e=>{if(en(e),!ee.dragging||!a.animation.followDragEnabled&&!a.animation.autoRotateEnabled)return;let t=(e.clientX-ee.pointerX)*a.animation.dragSens,n=(e.clientY-ee.pointerY)*a.animation.dragSens;ee.velocityX=n,ee.velocityY=t,ee.targetRotationY+=t,ee.targetRotationX+=n,ee.pointerX=e.clientX,ee.pointerY=e.clientY},er=()=>{ee.dragging=!1,F.style.cursor="grab"};!o&&V&&(window.addEventListener("pointermove",ei),window.addEventListener("pointerup",er),F.addEventListener("pointerdown",eo));let es=!1,el=({deltaSeconds:e,elapsedSeconds:t})=>{let o=(n?.timeElapsed??0)+t;Q.uniforms.time.value=o;let r=0,s=0,l=0,u=1;if(a.animation.breatheEnabled&&(u*=1+Math.sin(o*a.animation.breatheSpeed)*a.animation.breatheAmount),a.animation.autoRotateEnabled&&(ee.dragging||(ee.autoElapsed+=e,ee.targetRotationX+=ee.velocityX,ee.targetRotationY+=ee.velocityY,ee.velocityX*=G,ee.velocityY*=G),s+=ee.autoElapsed*a.animation.autoSpeed,r+=Math.sin(.2*ee.autoElapsed)*a.animation.autoWobble),a.animation.rotateEnabled){ee.rotateElapsed+=e;let t=a.animation.rotatePingPong?Math.sin(ee.rotateElapsed*a.animation.rotateSpeed)*Math.PI:ee.rotateElapsed*a.animation.rotateSpeed;if("axis"===a.animation.rotatePreset){let e=t*(a.animation.rotateAxis.startsWith("-")?-1:1),n=a.animation.rotateAxis;("x"===n||"xy"===n||"-x"===n||"-xy"===n)&&(r+=e),("y"===n||"xy"===n||"-y"===n||"-xy"===n)&&(s+=e),("z"===n||"-z"===n)&&(l+=e)}}let c=r,d=s,m=U;if(a.animation.followHoverEnabled){let e=a.animation.hoverRange*Math.PI/180;(a.animation.hoverReturn||.5!==ee.mouseX||.5!==ee.mouseY)&&(c+=(ee.mouseY-.5)*e,d+=(ee.mouseX-.5)*e),m=a.animation.hoverEase}if(a.animation.followDragEnabled&&(!ee.dragging&&a.animation.dragMomentum&&(ee.targetRotationX+=ee.velocityX,ee.targetRotationY+=ee.velocityY,ee.velocityX*=1-a.animation.dragFriction,ee.velocityY*=1-a.animation.dragFriction),c+=ee.targetRotationX,d+=ee.targetRotationY,m=a.animation.dragFriction),a.animation.autoRotateEnabled||a.animation.followHoverEnabled||a.animation.followDragEnabled||a.animation.rotateEnabled||(c=ee.targetRotationX,d=ee.targetRotationY),!a.animation.autoRotateEnabled||a.animation.followHoverEnabled||a.animation.followDragEnabled||(c=r+ee.targetRotationX,d=s+ee.targetRotationY,ee.dragging&&(c=ee.targetRotationX,d=ee.targetRotationY),m=N),ee.rotationX+=(c-ee.rotationX)*m,ee.rotationY+=(d-ee.rotationY)*m,ee.rotationZ+=(l-ee.rotationZ)*(a.animation.rotatePingPong?.18:.12),j.rotation.set(ee.rotationX,ee.rotationY,ee.rotationZ),j.scale.setScalar(u),!T.enabled){L.setRenderTarget(null),L.clear(),L.render(X,z);return}L.setRenderTarget(Z),L.render(X,z),$.render(L,Z.texture,K),L.setRenderTarget(null),L.clear(),L.render(J,K),es||(es=!0,i?.())},eu=null;if(o){el({deltaSeconds:0,elapsedSeconds:0,timestamp:0}),ea?.disconnect();let t="u"<typeof ResizeObserver?null:new ResizeObserver(()=>{et(),el({deltaSeconds:0,elapsedSeconds:0,timestamp:0})});return t?.observe(e),{dispose(){t?.disconnect(),ec()}}}function ec(){$.dispose(),Q.dispose(),q.dispose(),W.dispose(),Z.dispose(),I.dispose(),L?.dispose(),F.parentNode===e&&e.removeChild(F)}return(eu=(0,d.createVisualFrameLoop)({renderFrame:el,target:e,targetVisibilityOptions:{rootMargin:"100px"}})).start(),{dispose(){eu?.dispose(),ea?.disconnect(),window.removeEventListener("pointermove",ei),window.removeEventListener("pointerup",er),F.removeEventListener("pointerdown",eo),ec()}}}({container:e,geometry:M,settings:t,initialPose:l,reducedMotion:S}):O({container:e,geometry:M,settings:t,initialPose:l,reducedMotion:S})).then(e=>{n?e?.dispose():o=e}),()=>{n=!0,o?.dispose()}},[M,S]),(0,t.jsx)(J,{ref:x})}],543820)},540741,function(e){e.n(e.i(543820))}]);