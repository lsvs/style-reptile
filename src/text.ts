import { DESKTOP_NAME, MOBILE_NAME } from './constrants'
import { SANS_FONTS, SERIF_FONTS, MONO_FONTS } from './googleFonts'

export type ConvertedTextStyle = {
  name: string
  fontStyle: string
  fontWeight: number
  fontSize: string
  lineHeight: string
  fontFamily: string
  letterSpacing: string
}

const parseFontStyle = (fontStyle: string) =>
  fontStyle.toLowerCase().includes('italic') ? 'italic' : 'normal'

const parseFontWeight = (fontStyle: string): number => {
  const fontStyleSimplified = fontStyle.toLowerCase().replace(/[^a-z0-9]/gi, '')
  if (
    fontStyleSimplified.includes('thin') ||
    fontStyleSimplified.includes('hairline') ||
    fontStyleSimplified.includes('100')
  )
    return 100

  if (
    fontStyleSimplified.includes('extralight') ||
    fontStyleSimplified.includes('ultralight') ||
    fontStyleSimplified.includes('200')
  )
    return 200

  if (fontStyleSimplified.includes('semilight') || fontStyleSimplified.includes('350')) return 350

  if (fontStyleSimplified.includes('light') || fontStyleSimplified.includes('300')) return 300

  if (
    fontStyleSimplified.includes('normal') ||
    fontStyleSimplified.includes('regular') ||
    fontStyleSimplified.includes('400')
  )
    return 400

  if (fontStyleSimplified.includes('medium') || fontStyleSimplified.includes('500')) return 500

  if (
    fontStyleSimplified.includes('semibold') ||
    fontStyleSimplified.includes('demibold') ||
    fontStyleSimplified.includes('600')
  )
    return 600

  if (
    fontStyleSimplified.includes('extrabold') ||
    fontStyleSimplified.includes('ultrabold') ||
    fontStyleSimplified.includes('800')
  )
    return 800

  if (fontStyleSimplified.includes('bold') || fontStyleSimplified.includes('700')) return 700

  if (
    fontStyleSimplified.includes('extrablack') ||
    fontStyleSimplified.includes('ultrablack') ||
    fontStyleSimplified.includes('950')
  )
    return 950

  if (
    fontStyleSimplified.includes('black') ||
    fontStyleSimplified.includes('heavy') ||
    fontStyleSimplified.includes('900')
  )
    return 900

  return 400
}

const parseLineHeight = (style: TextStyle): string => {
  switch (style.lineHeight.unit) {
    case 'PERCENT':
      return (Math.round(style.lineHeight.value * 100) / 10000).toString()
    case 'PIXELS':
      return (Math.round((style.lineHeight.value / style.fontSize) * 1000) / 1000).toString()
    default:
      return 'normal'
  }
}

const parseLetterSpacing = (style: TextStyle): string => {
  switch (style.letterSpacing.unit) {
    case 'PERCENT':
      return `${Math.round(style.letterSpacing.value * 100) / 10000}em`
    case 'PIXELS':
      return `${Math.round((style.letterSpacing.value / style.fontSize) * 100) / 100}em`
    default:
      return '0em'
  }
}

const parseFontFamily = (fontFamily: string) => {
  if (fontFamily.toLowerCase().includes(' mono') || MONO_FONTS.includes(fontFamily))
    return `'${fontFamily}', monospace`
  if (fontFamily.toLowerCase().includes(' serif') || SERIF_FONTS.includes(fontFamily))
    return `'${fontFamily}', serif`
  if (fontFamily.toLowerCase().includes(' sans') || SANS_FONTS.includes(fontFamily))
    return `'${fontFamily}', sans-serif`
  return `'${fontFamily}'`
}

const convertStyle = (style: TextStyle, namePrefix: string): ConvertedTextStyle => ({
  name: style.name.slice(namePrefix.length).replace(/[^a-z0-9-_]/gi, ''),
  fontStyle: parseFontStyle(style.fontName.style),
  fontWeight: parseFontWeight(style.fontName.style),
  fontSize: `${style.fontSize / 10}rem`,
  lineHeight: parseLineHeight(style),
  fontFamily: parseFontFamily(style.fontName.family),
  letterSpacing: parseLetterSpacing(style),
})

export const getTextStyles = () => {
  const textStyles = figma.getLocalTextStyles()

  const mobile: ConvertedTextStyle[] = textStyles
    .filter((style) => style.name.startsWith(`${MOBILE_NAME}/`))
    .map((style) => convertStyle(style, MOBILE_NAME))

  const desktop: ConvertedTextStyle[] = textStyles
    .filter((style) => style.name.startsWith(`${DESKTOP_NAME}/`))
    .map((style) => convertStyle(style, DESKTOP_NAME))

  if (!mobile.length && !desktop.length) return

  return { mobile, desktop }
}

export const generateTextCSSVariables = (textStyles: {
  mobile: ConvertedTextStyle[]
  desktop: ConvertedTextStyle[]
}) => {
  const generateFontVariableValue = (style: ConvertedTextStyle): string =>
    `${style.fontStyle} ${style.fontWeight} ${style.fontSize} / ${style.lineHeight} ${style.fontFamily}`

  return {
    mobile: textStyles.mobile
      .map((style) =>
        [
          `  --font-${style.name}: ${generateFontVariableValue(style)};`,
          `  --letter-spacing-${style.name}: ${style.letterSpacing};`,
        ].join('\n'),
      )
      .join('\n'),
    desktop: textStyles.desktop
      .map((style) =>
        [
          `    --font-${style.name}: ${generateFontVariableValue(style)};`,
          `    --letter-spacing-${style.name}: ${style.letterSpacing};`,
        ]
          .filter((el) => el)
          .join('\n'),
      )
      .join('\n'),
  }
}

export const generateTypographyCSS = (textStyles: {
  mobile: ConvertedTextStyle[]
  desktop: ConvertedTextStyle[]
}) =>
  Array.from(new Set([...textStyles.desktop, ...textStyles.mobile].map((el) => el.name)))
    .map(
      (el) =>
        `.text-${el} {\n  font: var(--font-${el});\n  letter-spacing: var(--letter-spacing-${el});\n}`,
    )
    .join('\n')
