import {
  COLLECTION_NAME,
  DESKTOP_NAME,
  MOBILE_NAME,
  DESKTOP_BREAKPOINT,
  SPACE_PREFIX,
} from './constrants'

import {
  Space,
  getIds,
  generateSpacesCSSVariables,
  getSpaces,
  generateMarginsCSS,
  generatePaddingsCSS,
} from './spaces'

import {
  ConvertedTextStyle,
  getTextStyles,
  generateTextCSSVariables,
  generateTypographyCSS,
} from './text'

type File = { fileName: string; css: string }

const generateConfigCSS = (
  spaces?: Space[],
  textStyles?: { mobile: ConvertedTextStyle[]; desktop: ConvertedTextStyle[] },
) => {
  const spacesCSSVariables = spaces && generateSpacesCSSVariables(spaces)
  const textCSSVariables = textStyles && generateTextCSSVariables(textStyles)

  const mobileVariablesString = [
    spacesCSSVariables && spacesCSSVariables.mobile,
    textCSSVariables && textCSSVariables.mobile,
  ]
    .filter((el) => el)
    .join('\n\n')

  const desktopVariablesString = [
    spacesCSSVariables && spacesCSSVariables.desktop,
    textCSSVariables && textCSSVariables.desktop,
  ]
    .filter((el) => el)
    .join('\n\n')

  return encodeURIComponent(
    [
      mobileVariablesString && `:root {\n${mobileVariablesString}\n}\n`,
      desktopVariablesString &&
        `@media (min-width: ${DESKTOP_BREAKPOINT}) {\n  :root {\n${desktopVariablesString}\n  }\n}\n`,
    ]
      .filter((el) => el)
      .join('\n'),
  )
}

const generateMainCSS = (results: File[]) =>
  encodeURIComponent(results.map((result) => `@import '${result.fileName}';`).join('\n'))

const main = async () => {
  const { collectionId, desktopModeId, mobileModeId } = getIds()

  const warnings: string[] = []
  const results: File[] = []
  let spaces: Space[] | undefined

  if (!collectionId) {
    warnings.push(`No "${COLLECTION_NAME}" collecton found`)
  } else if (!desktopModeId) {
    warnings.push(`No "${DESKTOP_NAME}" (desktop) mode found in "${COLLECTION_NAME}" collecton`)
  } else if (!mobileModeId) {
    warnings.push(`No "${MOBILE_NAME}" (mobile) mode found in "${COLLECTION_NAME}" collecton`)
  } else {
    spaces = getSpaces(collectionId, desktopModeId, mobileModeId)
    if (!spaces.length) {
      warnings.push(`No "${SPACE_PREFIX}*" variables found`)
      spaces = undefined
    }
  }

  const textStyles = getTextStyles()
  if (!textStyles) warnings.push(`No "${DESKTOP_NAME}/*", "${MOBILE_NAME}/*" text styles found`)
  else {
    if (!textStyles.desktop.length)
      warnings.push(`No "${DESKTOP_NAME}/*" (desktop) text styles found`)
    if (!textStyles.mobile.length) warnings.push(`No "${MOBILE_NAME}/*" (mobile) text styles found`)
    if (textStyles.mobile.length !== textStyles.desktop.length)
      warnings.push(
        `There is a different number of text styles for mobile (${textStyles.mobile.length}) and desktop (${textStyles.desktop.length})`,
      )
  }

  results.push({ fileName: 'config.css', css: generateConfigCSS(spaces, textStyles) })
  spaces && results.push({ fileName: 'paddings.css', css: generatePaddingsCSS(spaces) })
  spaces && results.push({ fileName: 'margins.css', css: generateMarginsCSS(spaces) })
  textStyles &&
    results.push({ fileName: 'typography.css', css: await generateTypographyCSS(textStyles) })
  results.push({ fileName: 'main.css', css: generateMainCSS(results) })

  figma.showUI(
    `
  <div style="display: grid">
    ${results
      .map(
        (el) =>
          `<a href="data:text/plain;charset=utf-8,${el.css}" download="${el.fileName}">📄 ${el.fileName}</a>`,
      )
      .join('')}
  </div>
  ${
    warnings.length
      ? `
  <div class="warnings">Warnings:
  <ul>
      ${warnings.map((el) => `<li>${el}</li>`).join('')}
  </ul></div>
  `
      : ''
  }
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
  .warnings {
    padding: 30px 10px 0 10px;
    opacity: 0.5;
    font-family: monospace;
  }
  ul {
    padding-left: 20px;
  }
  </style>
  `,
    {
      height: (warnings.length + results.length + (warnings.length ? 1 : 0)) * 40 + 20,
    },
  )
}

main()
