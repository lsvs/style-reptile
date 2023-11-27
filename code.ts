const getScreenCollectionIds = () => {
  const collections = figma.variables.getLocalVariableCollections()
  const screenCollection = collections.filter((c) => c.name === 'screen')[0]
  if (!screenCollection) {
    return {}
  }
  const ids: { screenCollectionId?: string; desktopModeId?: string; mobileModeId?: string } = {}
  ids.screenCollectionId = screenCollection.id
  screenCollection.modes.forEach((el) => {
    if (el.name === 'd') {
      ids.desktopModeId = el.modeId
    }
    if (el.name === 'm') {
      ids.mobileModeId = el.modeId
    }
  }, {})
  return ids
}

const getSpaces = (screenCollectionId: string, desctopModeId: string, mobileModeId: string) => {
  const allVariables = figma.variables.getLocalVariables('FLOAT')

  const spaces = allVariables
    .filter(
      (variable) =>
        variable.variableCollectionId === screenCollectionId && variable.name.startsWith('space'),
    )
    .map((variable) => ({
      name: variable.name.replace(/^space-/, ''),
      d: parseInt(variable.valuesByMode[desctopModeId].toString()),
      m: parseInt(variable.valuesByMode[mobileModeId].toString()),
    }))
  return spaces
}

const main = () => {
  const { screenCollectionId, desktopModeId, mobileModeId } = getScreenCollectionIds()

  if (!screenCollectionId) {
    figma.notify('No "screen" collecton found')
    return
  }
  if (!desktopModeId) {
    figma.notify('No "d" (desktop) mode found in "screen" collecton')
    return
  }
  if (!mobileModeId) {
    figma.notify('No "m" (mobile) mode found in "screen" collecton')
    return
  }

  const spaces = getSpaces(screenCollectionId, desktopModeId, mobileModeId)

  if (!spaces.length) {
    figma.notify('No "space-*" variables found')
  }

  console.log(spaces)
}

main()

figma.closePlugin()
