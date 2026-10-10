import { expect, it, vi } from "vitest";
import * as THREE from "three";
import { disposeScene } from "../../../src/features/graphics/pillar-runtime";
import { BUILD } from "../../../src/features/graphics/pillar-scene";

it("disposes shared geometry and each material once in the approved layer object", () => {
  const layers = BUILD.camadas();
  const geometryDisposals = new Map<THREE.BufferGeometry, ReturnType<typeof vi.fn>>();
  const materialDisposals: ReturnType<typeof vi.fn>[] = [];
  layers.traverse(object => {
    if (!(object instanceof THREE.Mesh)) return;
    if (!geometryDisposals.has(object.geometry)) geometryDisposals.set(object.geometry, vi.spyOn(object.geometry, "dispose"));
    materialDisposals.push(vi.spyOn(object.material, "dispose"));
  });
  disposeScene(layers);
  expect(geometryDisposals.size).toBe(1);
  geometryDisposals.forEach(spy => expect(spy).toHaveBeenCalledTimes(1));
  materialDisposals.forEach(spy => expect(spy).toHaveBeenCalledTimes(1));
});

it("disposes a mesh material array without duplicate disposal", () => {
  const material = new THREE.MeshBasicMaterial(), geometry = new THREE.BoxGeometry();
  const spy = vi.spyOn(material, "dispose");
  disposeScene(new THREE.Mesh(geometry, [material, material]));
  expect(spy).toHaveBeenCalledTimes(1);
});
