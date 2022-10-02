import { ItemType } from 'golden-layout'
import { CONTENT, FILES, SETTINGS } from './components.js'

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
        ...FILES,
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
        width: 40,
        content: [
          {
            type: 'component',
            header: { show: 'top' },
            isClosable: false,
            height: 60,
            componentState: undefined,
            ...FILES,
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
        width: 40,
        componentState: { abc: 123 },
        ...CONTENT,
      },
    ],
  },
}
export { baseLayout, contentLayout }
