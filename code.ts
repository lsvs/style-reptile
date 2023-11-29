const COLLECTION_NAME = 'screen'
const DESKTOP_NAME = 'd'
const MOBILE_NAME = 'm'

type Space = {
  name: string
  d: number
  m: number
}

const getIds = () => {
  const collections = figma.variables.getLocalVariableCollections()
  const screenCollection = collections.filter((c) => c.name === COLLECTION_NAME)[0]
  if (!screenCollection) {
    return {}
  }
  const ids: { collectionId?: string; desktopModeId?: string; mobileModeId?: string } = {}
  ids.collectionId = screenCollection.id
  screenCollection.modes.forEach((el) => {
    if (el.name === DESKTOP_NAME) {
      ids.desktopModeId = el.modeId
    }
    if (el.name === MOBILE_NAME) {
      ids.mobileModeId = el.modeId
    }
  }, {})
  return ids
}

const getSpaces = (collectionId: string, desctopModeId: string, mobileModeId: string): Space[] => {
  const allVariables = figma.variables.getLocalVariables('FLOAT')

  const spaces = allVariables
    .filter(
      (variable) =>
        variable.variableCollectionId === collectionId && variable.name.startsWith('space'),
    )
    .map((variable) => ({
      name: variable.name.replace(/^space-/, ''),
      d: parseInt(variable.valuesByMode[desctopModeId].toString()),
      m: parseInt(variable.valuesByMode[mobileModeId].toString()),
    }))
  return spaces
}

const generateSpacesCSSVariables = (spaces: Space[]) => {
  const mobile = spaces.map((space) => `  --space-${space.name}: ${space.m / 10}rem`).join(';\n')
  const desktop = spaces.map((space) => `    --space-${space.name}: ${space.d / 10}rem`).join(';\n')

  return { mobile, desktop }
}
const generateConfigCSS = (spaces: Space[]) => {
  const spacesCSSVariables = generateSpacesCSSVariables(spaces)

  return encodeURIComponent(`:root {
${spacesCSSVariables.mobile}
}

@media (min-width: 640px) {
  :root {
${spacesCSSVariables.desktop}
  }
}
`)
}

const generateSpacesCSS = (spaces: Space[], type: 'padding' | 'margin') => {
  const classPrefix = type === 'margin' ? 'm' : 'p'
  const all = spaces
    .map(
      (space) => `.${classPrefix}-${space.name} {
  ${type}: var(--space-${space.name});
}`,
    )
    .join('\n')
  const x = spaces
    .map(
      (space) => `.${classPrefix}x-${space.name} {
  ${type}-left: var(--space-${space.name});
  ${type}-right: var(--space-${space.name});
}`,
    )
    .join('\n')
  const y = spaces
    .map(
      (space) => `.${classPrefix}y-${space.name} {
  ${type}-top: var(--space-${space.name});
  ${type}-bottom: var(--space-${space.name});
}`,
    )
    .join('\n')
  const top = spaces
    .map(
      (space) => `.${classPrefix}t-${space.name} {
  ${type}-top: var(--space-${space.name});
}`,
    )
    .join('\n')
  const right = spaces
    .map(
      (space) => `.${classPrefix}r-${space.name} {
  ${type}-right: var(--space-${space.name});
  }`,
    )
    .join('\n')
  const bottom = spaces
    .map(
      (space) => `.${classPrefix}b-${space.name} {
  ${type}-bottom: var(--space-${space.name});
}`,
    )
    .join('\n')
  const left = spaces
    .map(
      (space) => `.${classPrefix}l-${space.name} {
  ${type}-left: var(--space-${space.name});
}`,
    )
    .join('\n')

  return encodeURIComponent(
    `/* All */

${all}

/* X */

${x}

/* Y */

${y}

/* Top */

${top}

/* Right */

${right}

/* Bottom */

${bottom}

/* Left */

${left}
` +
      (type === 'margin'
        ? `
/* Auto */

.mx-auto {
  margin-left: auto;
  margin-right: auto;
}
`
        : ''),
  )
}

const generateMarginsCSS = (spaces: Space[]) => generateSpacesCSS(spaces, 'margin')
const generatePaddingsCSS = (spaces: Space[]) => generateSpacesCSS(spaces, 'padding')

const generateMainCSS = () =>
  encodeURIComponent(`@import 'config.css';
/* @import 'typography.css'; */
@import 'margins.css';
@import 'paddings.css';
`)

const main = () => {
  const { collectionId, desktopModeId, mobileModeId } = getIds()

  if (!collectionId) {
    figma.notify(`No "${COLLECTION_NAME}" collecton found`)
    return
  }
  if (!desktopModeId) {
    figma.notify(`No "${DESKTOP_NAME}" (desktop) mode found in "${COLLECTION_NAME}" collecton`)
    return
  }
  if (!mobileModeId) {
    figma.notify(`No "${MOBILE_NAME}" (mobile) mode found in "${COLLECTION_NAME}" collecton`)
    return
  }

  const spaces = getSpaces(collectionId, desktopModeId, mobileModeId)

  if (!spaces.length) {
    figma.notify('No "space-*" variables found')
  }

  figma.showUI(`
  <div style="display: grid">
    <a href="data:text/plain;charset=utf-8,${generateConfigCSS(
      spaces,
    )}" download="config.css">📄 config.css</a>
    
    <a href="data:text/plain;charset=utf-8,${generatePaddingsCSS(
      spaces,
    )}" download="paddings.css">📄 paddings.css</a>
    
    <a href="data:text/plain;charset=utf-8,${generateMarginsCSS(
      spaces,
    )}" download="margins.css">📄 margins.css</a>

    <a href="data:text/plain;charset=utf-8,${generateMainCSS()}" download="main.css">📄 main.css</a>
  </div>
  <style>
  a {
    text-decoration: none;
    color: inherit;
    font-family: monospace;
    display: flex;
    padding: 10px;
    justify-content: space-between;
    position: relative;
  }
  a:not(:last-child) {
    border-bottom: 1px solid color-mix(in srgb, currentColor 10%, transparent);
  }
  a::after {
    content: '↓';
    transition: transform 0.3s ease;
    transform-origin: bottom;
    transform: scaleY(0);
  }
  a:hover::after {
    transform: scaleY(1);
    transform-origin: top;
  }
  </style>
  `)
}

main()
