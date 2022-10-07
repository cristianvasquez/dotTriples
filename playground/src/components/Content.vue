<script setup>
import '@rdfjs-elements/rdf-editor'
import { storeToRefs } from 'pinia'
import { watch } from 'vue'
import { useWorkspaceState } from '../store/workspaceState.js'
import Markdown from 'vue3-markdown-it';
import { NCard, NCode, darkTheme, NConfigProvider, NCollapse, NCollapseItem } from 'naive-ui'

const store = useWorkspaceState()
const {
  currentFocus,
  currentFocusContents,
} = storeToRefs(store)

watch(currentFocus, () => store.doRetrieveContents({ uri:currentFocus.value }))

// https://github.com/JanGuillermo/vue3-markdown-it
</script>

<template>
  <n-config-provider :theme="darkTheme">
  <div>
    <template v-for="{ uri, markdown} of currentFocusContents">
      <div>
          <n-card :title="uri">
            <template #cover>
<!--              <img src="https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg">-->
            </template>
            <Markdown :source="markdown" />
            <template #footer>
              <n-collapse>
                <n-collapse-item title="markdown" name="1">
                  <n-code
                      :code="markdown"
                      language="markdown"
                  />
                </n-collapse-item>
              </n-collapse>
            </template>

          </n-card>
      </div>



    </template>
  </div>
  </n-config-provider>
</template>
