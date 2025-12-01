<script setup lang="ts">
import { format } from 'date-fns'
import type { IMessage } from '../../types/messages'
import { MessageStatus } from '../../types/messages'

const props = defineProps<{
  mail: IMessage
}>()

const emits = defineEmits(['close', 'refresh'])

const toast = useToast()
const reply = ref('')
const loading = ref(false)

const dropdownItems = computed(() => [
  [{
    label: props.mail.status === MessageStatus.UNREAD ? 'Mark as read' : 'Mark as unread',
    icon: props.mail.status === MessageStatus.UNREAD ? 'i-lucide-check-circle' : 'i-lucide-circle',
    onSelect: () => updateStatus(props.mail.status === MessageStatus.UNREAD ? MessageStatus.READ : MessageStatus.UNREAD)
  }],
  [{
    label: 'Archive',
    icon: 'i-lucide-archive',
    disabled: props.mail.status === MessageStatus.ARCHIVED,
    onSelect: () => updateStatus(MessageStatus.ARCHIVED)
  }, {
    label: 'Mark as Spam',
    icon: 'i-lucide-alert-triangle',
    disabled: props.mail.status === MessageStatus.SPAM,
    onSelect: () => updateStatus(MessageStatus.SPAM)
  }]
])

async function updateStatus(status: string) {
  try {
    await $fetch(`/api/messages/${props.mail.id}`, {
      method: 'PUT',
      body: { status }
    })
    toast.add({ title: 'Status updated', color: 'success' })
    emits('refresh')
  } catch (error) {
    toast.add({ title: 'Failed to update status', color: 'error' })
  }
}

async function onSubmit() {
  if (!reply.value.trim()) return

  loading.value = true
  try {
    await $fetch(`/api/messages/${props.mail.id}/reply`, {
      method: 'POST',
      body: { reply_body: reply.value }
    })

    toast.add({
      title: 'Reply sent',
      description: 'Your reply has been sent successfully',
      icon: 'i-lucide-check-circle',
      color: 'success'
    })
    reply.value = ''
    emits('refresh')
  } catch (error: any) {
    toast.add({
      title: 'Failed to send reply',
      description: error.message || 'An error occurred',
      icon: 'i-lucide-alert-circle',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UDashboardPanel id="inbox-2">
    <UDashboardNavbar :title="mail.subject" :toggle="false">
      <template #leading>
        <UButton icon="i-lucide-x" color="neutral" variant="ghost" class="-ms-1.5" @click="emits('close')" />
      </template>

      <template #right>
        <UTooltip text="Archive">
          <UButton icon="i-lucide-archive" color="neutral" variant="ghost"
            @click="updateStatus(MessageStatus.ARCHIVED)" />
        </UTooltip>

        <UDropdownMenu :items="dropdownItems">
          <UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost" />
        </UDropdownMenu>
      </template>
    </UDashboardNavbar>

    <div class="flex flex-col sm:flex-row justify-between gap-1 p-4 sm:px-6 border-b border-default">
      <div class="flex items-start gap-4 sm:my-1.5">
        <UAvatar :alt="mail.name" size="3xl" />

        <div class="min-w-0">
          <p class="font-semibold text-highlighted">
            {{ mail.name }}
          </p>
          <p class="text-muted">
            {{ mail.email }}
          </p>
        </div>
      </div>

      <p v-if="mail.created_at" class="max-sm:pl-16 text-muted text-sm sm:mt-2">
        {{ format(new Date(mail.created_at), 'dd MMM HH:mm') }}
      </p>
    </div>

    <div class="flex-1 p-4 sm:p-6 overflow-y-auto">
      <p class="whitespace-pre-wrap">
        {{ mail.message }}
      </p>

      <div v-if="mail.status === MessageStatus.REPLIED || mail.replied_at" class="mt-8 pt-8 border-t border-default">
        <p class="text-sm font-semibold text-muted mb-4">Reply History</p>
        <div class="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-lg">
          <div class="flex justify-between items-center mb-2">
            <span class="font-semibold text-sm">You replied:</span>
            <span v-if="mail.replied_at" class="text-xs text-muted">{{ format(new Date(mail.replied_at), 'dd MMM HH:mm')
              }}</span>
          </div>
          <p class="text-sm whitespace-pre-wrap">{{ mail.reply_message }}</p>
        </div>
      </div>
    </div>

    <div v-if="mail.status !== MessageStatus.REPLIED" class="pb-4 px-4 sm:px-6 shrink-0">
      <UCard variant="subtle" class="mt-auto" :ui="{ header: 'flex items-center gap-1.5 text-dimmed' }">
        <template #header>
          <UIcon name="i-lucide-reply" class="size-5" />

          <span class="text-sm truncate">
            Reply to {{ mail.name }} ({{ mail.email }})
          </span>
        </template>

        <form @submit.prevent="onSubmit">
          <UTextarea v-model="reply" color="neutral" variant="none" required autoresize
            placeholder="Write your reply..." :rows="4" :disabled="loading" class="w-full"
            :ui="{ base: 'p-0 resize-none' }" />

          <div class="flex items-center justify-between">
            <div class="flex items-center justify-end gap-2 ml-auto">
              <UButton type="submit" color="neutral" :loading="loading" label="Send Reply" icon="i-lucide-send" />
            </div>
          </div>
        </form>
      </UCard>
    </div>
  </UDashboardPanel>
</template>
