export const COLLECTION_NAME = 'screen'
export const DESKTOP_NAME = 'd'
export const MOBILE_NAME = 'm'
export const SPACE_PREFIX = 'space-'
export const DESKTOP_BREAKPOINT = '640px'
export const SCALES = `html {
  font-size: 9px;
}
@media (min-width: 375px) {
  html {
    font-size: 10px;
  }
}
@media (min-width: 520px) {
  html {
    font-size: 11px;
  }
}

@media (min-width: ${DESKTOP_BREAKPOINT}) {
  html {
    font-size: 8px;
  }
}
@media (min-width: 1200px) {
  html {
    font-size: 9px;
  }
}
@media (min-width: 1600px) {
  html {
    font-size: 10px;
  }
}
@media (min-width: 1900px) {
  html {
    font-size: 11px;
  }
}
`
