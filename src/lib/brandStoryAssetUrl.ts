/** Figma 2898:5238 — PC brand story page assets under `public/assets/figma/brand_story/`. */
export function brandStoryAsset(filename: string): string {
  const name = filename.replace(/^\//, '').replace(/^brand_story\//, '')
  return `/assets/figma/brand_story/${name}`
}

/** Brand story lineup product thumbs under `public/assets/figma/brandstory/`. */
export function brandStoryProductAsset(filename: string): string {
  const name = filename.replace(/^\//, '').replace(/^brandstory\//, '')
  return `/assets/figma/brandstory/${name}`
}
