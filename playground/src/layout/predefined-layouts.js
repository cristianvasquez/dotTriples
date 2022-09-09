import { ItemType } from 'golden-layout'

const miniRowLayout = {
  root: {
    type: ItemType.row,
    content: [
      {
        type: 'component',
        title: 'Layout Config',
        header: { show: 'top' },
        isClosable: false,
        componentType: 'LayoutConfig',
        width: 40,
        componentState: undefined,
      },
      {
        type: 'component',
        title: 'Content 2',
        header: { show: 'top', popout: false },
        componentType: 'Content2',
        width: 40,
        componentState: { abc: 123 },
      },
    ],
  },
}

export { miniRowLayout }
