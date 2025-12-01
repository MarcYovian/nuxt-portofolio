<script setup lang="ts">
import { format, isToday } from 'date-fns'
import type { IMessage } from '../../types/messages'
import { MessageStatus } from '../../types/messages'

const props = defineProps<{
  mails: IMessage[]
}>()

const mailsRefs = ref<Element[]>([])

const selectedMail = defineModel<IMessage | null>()

watch(selectedMail, () => {
  if (!selectedMail.value) {
    return
  }
  const ref = mailsRefs.value[selectedMail.value.id]
  if (ref) {
    ref.scrollIntoView({ block: 'nearest' })
  }
})

defineShortcuts({
  arrowdown: () => {
    const index = props.mails.findIndex(mail => mail.id === selectedMail.value?.id)

    if (index === -1) {
      selectedMail.value = props.mails[0]
    } else if (index < props.mails.length - 1) {
      selectedMail.value = props.mails[index + 1]
    }
  },
  arrowup: () => {
    const index = props.mails.findIndex(mail => mail.id === selectedMail.value?.id)

    if (index === -1) {
      selectedMail.value = props.mails[props.mails.length - 1]
    } else if (index > 0) {
      selectedMail.value = props.mails[index - 1]
    }
  }
})

async function onSelectMail(mail: IMessage) {
  selectedMail.value = mail

  if (mail.status === MessageStatus.UNREAD) {
    mail.status = MessageStatus.READ

    try {
      await $fetch(`/api/messages/${mail.id}`, {
        method: 'PUT',
        body: { status: MessageStatus.READ }
      })
      // Refresh global data if needed, e.g. unread count
      refreshNuxtData()
    } catch (error) {
      console.error('Failed to mark as read', error)
    }
  }
}
</script>

<template>
  <div class="overflow-y-auto divide-y divide-default">
    <div v-for="(mail, index) in mails" :key="index" :ref="el => { mailsRefs[mail.id] = el as Element }">
      <div class="p-4 sm:px-6 text-sm cursor-pointer border-l-2 transition-colors" :class="[
        mail.status === MessageStatus.UNREAD ? 'text-highlighted' : 'text-toned',
        selectedMail && selectedMail.id === mail.id
          ? 'border-primary bg-primary/10'
          : 'border-bg hover:border-primary hover:bg-primary/5'
      ]" @click="onSelectMail(mail)">
        <div class="flex items-center justify-between"
          :class="[mail.status === MessageStatus.UNREAD && 'font-semibold']">
          <div class="flex items-center gap-3">
            {{ mail.name }}

            <UChip v-if="mail.status === MessageStatus.UNREAD" />
            <UBadge v-if="mail.status === MessageStatus.REPLIED" label="Replied" variant="subtle" size="xs"
              color="success" />
            <UBadge v-if="mail.status === MessageStatus.ARCHIVED" label="Archived" variant="subtle" size="xs"
              color="neutral" />
            <UBadge v-if="mail.status === MessageStatus.SPAM" label="Spam" variant="subtle" size="xs" color="error" />
          </div>

          <span v-if="mail.created_at">{{ isToday(new Date(mail.created_at)) ? format(new Date(mail.created_at),
            'HH:mm') : format(new Date(mail.created_at), 'dd MMM') }}</span>
        </div>
        <p class="truncate" :class="[mail.status === MessageStatus.UNREAD && 'font-semibold']">
          {{ mail.subject }}
        </p>
        <p class="text-dimmed line-clamp-1">
          {{ mail.message }}
        </p>
      </div>
    </div>
  </div>
</template>
