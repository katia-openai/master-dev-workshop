# One Turning World

An immersive, scroll-driven editorial journey through Tokyo, Cairo, Paris, New York, and Ushuaia in Argentine Patagonia.

## Run locally

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:4173`.

## Production build

```bash
npm run build
```

The experience uses React, TypeScript, Vite, Motion, and Three.js. The page is one full-viewport spatial composition: a textured, draggable WebGL globe stays at the center, the sun follows a continuous path along the bottom of the viewport, and a separate Three.js choreography moves through the foreground and background.

Each city has a distinct movement language and material system. Tokyo spirals lacquered arcs, paper light, chrome needles, and sakura petals. Cairo radiates glass bubbles, lantern light, minarets, weathered Giza stone, and the Great Sphinx. Paris loops iron latticework around the Eiffel Tower and Pont Alexandre III while autumn fragments move through the depth field. New York stages an Art Deco sunrise, the Empire State Building, the Statue of Liberty, Brooklyn Bridge, late-autumn leaves, and the first snow. Ushuaia drifts the Les Éclaireurs lighthouse and End of the World Train through glacial prisms, a polar aurora, and a full field of windblown snow.

One continuous scroll moves through 25 states: five landmark movements in each of the five cities. The current group moves toward the viewer and around the world, completes its exit, and the next city's assets begin only after its city boundary. Landmark cutouts use time-damped, frame-rate-independent motion: they emerge from behind the globe, cross the foreground, and return to a real rear compositing layer before reducing opacity at the hidden back of the orbit. Tokyo and Ushuaia's native 3D motifs use synchronized rear and foreground WebGL layers, switching only at the globe's outer limb. City boundaries advance automatically after that exit movement, and only the active city's asset root is rendered. The persistent globe recenters on the current city, changes its light, atmosphere, and surface treatment for every destination, keeps every city marker visible, and lets any marker jump directly to that city’s section. Clickable points on the solar arc provide the same city-level navigation. City names remain visible at all times; each stop reveals its season on hover or keyboard focus, with the active season retained on touch layouts. Tokyo sits at sunrise, Paris at the solar zenith, and Ushuaia at sunset, with the active sun continuously travelling between them.

Tokyo moves from Mount Fuji to Sensō-ji, blossom-filled streets, Shibuya Crossing, and reflective waters. Cairo follows the Nile through Khan el-Khalili and the Citadel to the Giza pyramids and Great Sphinx. Paris visits the Eiffel Tower, the Seine, Notre-Dame, the Louvre, and autumn gardens. New York moves from the Empire State Building through Brooklyn Bridge, Grand Central, and Central Park before the Statue of Liberty takes the harbor foreground. Ushuaia follows the Martial Mountains, the End of the World Train, Fuegian forests, Magellanic penguins, and the Beagle Channel lighthouse in Patagonia, Argentina.

On mobile, the globe remains the hero rather than collapsing into a drawer. The compact solar path stays overlaid at the bottom with generous tap targets and a single active season label; the animation carries the landmark story without scene names, counters, or descriptive cards.

## Visual assets

The weathered Giza and Sphinx groups, Eiffel Tower, Pont Alexandre III, Empire
State Building, Brooklyn Bridge, Statue of Liberty, Les Éclaireurs lighthouse,
and End of the World Train cutouts in `public/sprites` were generated for this
experience with OpenAI ImageGen and optimized as transparent WebP assets.
They are composited on physical front and rear depth layers around the globe,
so their scale, position, and visibility follow the same orbital choreography
as the native 3D objects without a screen-space cutout mask.

The Earth day, normal, specular, city-lights, and cloud textures in
`public/textures/earth` come from the official
[Three.js example texture set](https://github.com/mrdoob/three.js/tree/dev/examples/textures/planets)
and are used under the repository's MIT license.
