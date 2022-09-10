import { ItemType } from 'golden-layout'

const HOME = {
  componentType: 'Home',
  title: 'Home',
}

const CONFIG = {
  title: 'Settings',
  componentType: 'Settings',
}

const COUNTER = {
  componentType: 'Counter',
  title: 'Counter',
}

const miniRowLayout = {
  root: {
    type: ItemType.row,
    content: [
      {
        type: 'component',
        header: { show: 'top' },
        isClosable: false,
        width: 40,
        componentState: undefined,
        ...HOME
      },
      {
        type: 'component',
        header: { show: 'top', popout: false },
        width: 40,
        componentState: { abc: 123 },
        ...CONFIG
      },
    ],
  },
}

export { miniRowLayout, HOME, CONFIG, COUNTER }
