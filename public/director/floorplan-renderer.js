import { compilePlan } from './floorplan-model.js';

/** The plan remains editable data; generated meshes never become loose set props. */
export function createFloorplanRenderer(scene) {
  const B = globalThis.BABYLON;
  let meshes = [], materials = [], signature = '', disposed = false;
  const originalBiases = new Map();
  function remove(currentMeshes, currentMaterials) {
    const removed = new Set(currentMeshes);
    for (const light of scene.lights) {
      const map = light.getShadowGenerator?.()?.getShadowMap?.();
      if (map?.renderList) map.renderList = map.renderList.filter(mesh => !removed.has(mesh));
    }
    for (const mesh of currentMeshes) {
      mesh.dispose();
    }
    currentMaterials.forEach(material => material.dispose());
  }
  function shadows() {
    const active = new Set(), visible = meshes.filter(mesh => mesh.isEnabled());
    for (const light of scene.lights) {
      const shadow = light.getShadowGenerator?.(), map = shadow?.getShadowMap?.();
      if (!map) continue;
      if (visible.length) {
        if (!originalBiases.has(shadow)) originalBiases.set(shadow, shadow.normalBias);
        // Broad blockout walls need more offset than the character-sized
        // stage. Restore the original value when no plan is visible.
        shadow.normalBias = Math.max(originalBiases.get(shadow), .05);
        active.add(shadow);
      }
      const current = new Set(map.renderList || []);
      for (const mesh of visible) if (!current.has(mesh)) { shadow.addShadowCaster(mesh, false); current.add(mesh); }
    }
    for (const [shadow, bias] of originalBiases) {
      if (!active.has(shadow)) { shadow.normalBias = bias; originalBiases.delete(shadow); }
    }
  }
  function restore(plan) {
    if (disposed) throw new Error('The floor-plan renderer was disposed.');
    const nextSignature = JSON.stringify(plan);
    if (nextSignature === signature) return;
    const geometry = plan ? compilePlan(plan) : null;
    const nextMeshes = [], nextMaterials = [], byColor = new Map();
    function material(color) {
      if (!byColor.has(color)) {
        const value = new B.StandardMaterial(`Plan material ${color}`, scene);
        value.diffuseColor = B.Color3.FromHexString(color); value.specularColor = new B.Color3(.035, .035, .035);
        value.backFaceCulling = false; byColor.set(color, value); nextMaterials.push(value);
      }
      return byColor.get(color);
    }
    function finish(mesh, item, kind) {
      mesh.material = material(item.color || '#8eae9b'); mesh.isPickable = false; mesh.receiveShadows = true;
      mesh.metadata = { directorStageId: `plan-${item.id}`, directorStageObject: true, directorFloorplan: true, floorplanId: item.id, levelId: item.levelId || item.fromLevelId, kind };
      mesh.enableEdgesRendering(.99); mesh.edgesWidth = 1.5; mesh.edgesColor = new B.Color4(.09, .13, .11, 1);
      // Upper floors would conceal the room under edit. The active level is
      // the preview; every level remains in the plan and portable export.
      mesh.setEnabled((item.levelId || item.fromLevelId) === plan.activeLevelId);
      nextMeshes.push(mesh);
    }
    function box(item, kind) {
      const mesh = B.MeshBuilder.CreateBox(`Plan ${kind} ${item.id}`, { width: item.size[0], height: item.size[1], depth: item.size[2] }, scene);
      mesh.position.copyFromFloats(...item.position); mesh.rotation.copyFromFloats(...item.rotation); finish(mesh, item, kind);
    }
    try {
      for (const item of geometry?.walls || []) box(item, 'wall');
      for (const item of geometry?.floors || []) {
        const mesh = new B.Mesh(`Plan floor ${item.id}`, scene), data = new B.VertexData();
        data.positions = item.vertices; data.indices = item.indices; data.normals = [];
        B.VertexData.ComputeNormals(data.positions, data.indices, data.normals); data.applyToMesh(mesh);
        finish(mesh, item, 'floor');
      }
      for (const item of geometry?.connectors || []) box(item, 'connection');
    } catch (error) { remove(nextMeshes, nextMaterials); throw error; }
    remove(meshes, materials); meshes = nextMeshes; materials = nextMaterials; signature = nextSignature; shadows();
  }
  const observer = scene.onBeforeRenderObservable.add(shadows);
  return { restore, meshes: () => [...meshes], dispose() { if (disposed) return; disposed = true; scene.onBeforeRenderObservable.remove(observer); remove(meshes, materials); meshes = []; materials = []; for (const [shadow, bias] of originalBiases) shadow.normalBias = bias; originalBiases.clear(); } };
}
