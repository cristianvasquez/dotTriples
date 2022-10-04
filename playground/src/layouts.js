import { ItemType } from 'golden-layout'
import { CONTENT, CONTAINERS, SETTINGS, QUADS } from './components.js'

const baseLayout = {
  root: {
    type: ItemType.row,
    content: [
      {
        type: 'component',
        header: { show: 'top' },
        isClosable: false,
        width: 40,
        componentState: undefined,
        ...CONTAINERS,
      },
      {
        type: 'component',
        header: { show: 'top', popout: false },
        width: 40,
        componentState: { abc: 123 },
        ...SETTINGS,
      },
    ],
  },
}

const contentLayout = {
  root: {
    type: ItemType.row,
    content: [
      {
        type: ItemType.column,
        width: 20,
        content: [
          {
            type: 'component',
            header: { show: 'top' },
            isClosable: false,
            height: 60,
            componentState: undefined,
            ...CONTAINERS,
          },
          {
            type: 'component',
            header: { show: 'top' },
            isClosable: true,
            height: 30,
            componentState: undefined,
            ...SETTINGS,
          },
        ],

      },
      {
        type: 'component',
        header: { show: 'top', popout: false },
        width: 30,
        componentState: undefined,
        ...CONTENT,
      },
      {
        type: 'component',
        header: { show: 'top', popout: false },
        width: 30,
        componentState: undefined,
        ...QUADS,
      },
    ],
  },
}
export { baseLayout, contentLayout }
