import { COLLECTION_NAME, DESKTOP_NAME, MOBILE_NAME, SPACE_PREFIX } from './constrants'

export type Space = {
  name: string
  d: number
  m: number
}

export const getIds = () => {
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

export const getSpaces = (
  collectionId: string,
  desctopModeId: string,
  mobileModeId: string,
): Space[] => {
  const allVariables = figma.variables.getLocalVariables('FLOAT')

  const spaces = allVariables
    .filter(
      (variable) =>
        variable.variableCollectionId === collectionId && variable.name.startsWith(SPACE_PREFIX),
    )
    .map((variable) => ({
      name: variable.name.replace(new RegExp(`^${SPACE_PREFIX}`), ''),
      d: parseInt(variable.valuesByMode[desctopModeId].toString()),
      m: parseInt(variable.valuesByMode[mobileModeId].toString()),
    }))
  return spaces
}

export const generateSpacesCSSVariables = (spaces: Space[]) => {
  const mobile = spaces
    .map((space) => `  --${SPACE_PREFIX}${space.name}: ${space.m / 10}rem;`)
    .join('\n')
  const desktop = spaces
    .map((space) => `    --${SPACE_PREFIX}${space.name}: ${space.d / 10}rem;`)
    .join('\n')

  return { mobile, desktop }
}

const generateSpacesCSS = (spaces: Space[], type: 'padding' | 'margin') => {
  const classPrefix = type === 'margin' ? 'm' : 'p'
  const all = spaces
    .map(
      (space) => `.${classPrefix}-${space.name} {
  ${type}: var(--${SPACE_PREFIX}${space.name});
}`,
    )
    .join('\n')
  const x = spaces
    .map(
      (space) => `.${classPrefix}x-${space.name} {
  ${type}-left: var(--${SPACE_PREFIX}${space.name});
  ${type}-right: var(--${SPACE_PREFIX}${space.name});
}`,
    )
    .join('\n')
  const y = spaces
    .map(
      (space) => `.${classPrefix}y-${space.name} {
  ${type}-top: var(--${SPACE_PREFIX}${space.name});
  ${type}-bottom: var(--${SPACE_PREFIX}${space.name});
}`,
    )
    .join('\n')
  const top = spaces
    .map(
      (space) => `.${classPrefix}t-${space.name} {
  ${type}-top: var(--${SPACE_PREFIX}${space.name});
}`,
    )
    .join('\n')
  const right = spaces
    .map(
      (space) => `.${classPrefix}r-${space.name} {
  ${type}-right: var(--${SPACE_PREFIX}${space.name});
}`,
    )
    .join('\n')
  const bottom = spaces
    .map(
      (space) => `.${classPrefix}b-${space.name} {
  ${type}-bottom: var(--${SPACE_PREFIX}${space.name});
}`,
    )
    .join('\n')
  const left = spaces
    .map(
      (space) => `.${classPrefix}l-${space.name} {
  ${type}-left: var(--${SPACE_PREFIX}${space.name});
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

export const generateMarginsCSS = (spaces: Space[]) => generateSpacesCSS(spaces, 'margin')
export const generatePaddingsCSS = (spaces: Space[]) => generateSpacesCSS(spaces, 'padding')
