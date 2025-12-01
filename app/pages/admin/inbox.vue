<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { breakpointsTailwind, useDebounceFn } from '@vueuse/core'
import type { IMessage } from '../../types/messages'
import { MessageStatus } from '../../types/messages'

definePageMeta({
  layout: false
})

const tabItems = [{
  label: 'Inbox',
  value: 'inbox',
  chip: 'blue'
}, {
  label: 'Replied',
  value: MessageStatus.REPLIED,
  chip: 'green'
}, {
  label: 'Archived',
  value: MessageStatus.ARCHIVED,
  chip: 'neutral'
}, {
  label: 'Spam',
  value: MessageStatus.SPAM,
  chip: 'red'
}]

const selectedTab = ref('inbox')
const search = ref('')
const page = ref(1)
const limit = ref(20)

// Debounce search to avoid too many requests
const debouncedSearch = ref('')
const updateSearch = useDebounceFn((val: string) => {
  debouncedSearch.value = val
  page.value = 1 // Reset to first page on search
}, 500)

watch(search, (val) => {
  updateSearch(val)
})

watch(selectedTab, () => {
  page.value = 1
  selectedMail.value = null
})

const { data, refresh, status } = await useFetch('/api/messages', {
  query: computed(() => ({
    status: selectedTab.value,
    search: debouncedSearch.value,
    page: page.value,
    limit: limit.value
  })),
  watch: [selectedTab, debouncedSearch, page]
})

const mails = computed(() => (data.value?.data || []).map(message => ({
  ...message,
  status: message.status || MessageStatus.UNREAD
})) as IMessage[])
const total = computed(() => data.value?.total || 0)

const selectedMail = ref<IMessage | null>(null)

const isMailPanelOpen = computed({
  get() {
    return !!selectedMail.value
  },
  set(value: boolean) {
    if (!value) {
      selectedMail.value = null
    }
  }
})

// Update selected mail when data refreshes if it still exists, otherwise deselect
watch(mails, () => {
  if (selectedMail.value) {
    const found = mails.value.find(m => m.id === selectedMail.value?.id)
    if (found) {
      selectedMail.value = found
    } else {
      // Keep it selected if it was just moved to another tab? 
      // Maybe better to deselect to avoid confusion, or keep it if we want to show "moved" state.
      // For now, let's deselect if not in current list, unless we are on mobile where it might be confusing.
      // Actually, if I reply and it moves to "Replied", it disappears from "Inbox".
      // So deselecting is probably correct behavior for this UI.
      selectedMail.value = null
    }
  }
})

const breakpoints = useBreakpoints(breakpointsTailwind)
const isMobile = breakpoints.smaller('lg')

function onRefresh() {
  refresh()
}
</script>

<template>
  <NuxtLayout name="admin">
    <UDashboardPanel id="inbox-1" :default-size="30" :min-size="20" :max-size="40" resizable>
      <UDashboardNavbar title="Inbox">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #trailing>
          <UButton icon="i-lucide-rotate-cw" color="neutral" variant="ghost" :loading="status === 'pending'"
            @click="() => refresh()" />
        </template>

        <template #right>
          <div class="flex gap-2">
            <UInput v-model="search" icon="i-lucide-search" placeholder="Search..." size="xs"
              :ui="{ trailing: 'pointer-events-auto' }">
              <template #trailing>
                <UButton v-show="search !== ''" color="neutral" variant="link" icon="i-lucide-x" :padded="false"
                  @click="search = ''" />
              </template>
            </UInput>
          </div>
        </template>
      </UDashboardNavbar>

      <div class="px-4 py-2 border-b border-default">
        <UTabs v-model="selectedTab" :items="tabItems" :content="false" size="xs" class="w-full" />
      </div>

      <div v-if="status === 'pending'" class="divide-y divide-default">
        <div v-for="i in 4" :key="i" class="p-4 sm:px-6 border-l-2 border-transparent">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-3">
              <USkeleton class="h-4 w-24" />
              <USkeleton class="h-4 w-12" />
            </div>
            <USkeleton class="h-4 w-12" />
          </div>
          <USkeleton class="h-4 w-3/4 mb-1" />
          <USkeleton class="h-4 w-1/2" />
        </div>
      </div>
      <InboxList v-else v-model="selectedMail" :mails="mails" />

      <div v-if="mails.length === 0 && status !== 'pending'" class="p-8 text-center text-muted">
        No messages found.
      </div>
    </UDashboardPanel>

    <InboxMail v-if="selectedMail" :mail="selectedMail" @close="selectedMail = null" @refresh="onRefresh" />
    <div v-else class="hidden lg:flex flex-1 items-center justify-center">
      <UIcon name="i-lucide-inbox" class="size-32 text-dimmed" />
    </div>

    <ClientOnly>
      <USlideover v-if="isMobile" v-model:open="isMailPanelOpen">
        <template #content>
          <InboxMail v-if="selectedMail" :mail="selectedMail" @close="selectedMail = null" @refresh="onRefresh" />
        </template>
      </USlideover>
    </ClientOnly>
  </NuxtLayout>
</template>
