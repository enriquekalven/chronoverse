#!/bin/zsh
# Decimate ultra-high-poly Poly Haven photogrammetry scans to real-time budgets (meshoptimizer via gltf-transform).
# Output: assets/polyhaven/models/<id>/<id>_lod.glb (textures embedded)
set -u
ROOT="/Users/enriq/.gemini/jetski/scratch/timeline-of-everything-3d"
cd "$ROOT/assets/polyhaven/models" || exit 1
simplify() {
  local id="$1" ratio="$2" err="${3:-0.02}"
  local in="$id/${id}_1k.gltf" out="$id/${id}_lod.glb"
  if [[ -f "$out" ]]; then echo "skip $id"; return; fi
  if [[ ! -f "$in" ]]; then echo "missing $in"; return; fi
  echo "== $id ratio=$ratio"
  npx -y @gltf-transform/cli simplify "$in" "$out" --ratio "$ratio" --error "$err" 2>&1 | tail -3
  ls -la "$out" 2>/dev/null
}
simplify jacaranda_tree 0.02 0.03
simplify tree_small_02 0.03 0.03
simplify island_tree_01 0.04 0.03
simplify island_tree_02 0.05 0.03
simplify fir_sapling_medium 0.05 0.03
simplify coast_rocks_02 0.05 0.02
simplify coast_rocks_05 0.08 0.02
simplify searsia_burchellii 0.1 0.03
simplify coastal_cliff_01 0.15 0.02
simplify wooden_candlestick 0.3 0.01
simplify ship_pinnace 0.5 0.01
simplify pine_roots 0.4 0.02
simplify mountainside 0.5 0.02
simplify quiver_tree_01 0.5 0.02
echo "ALL DONE"
