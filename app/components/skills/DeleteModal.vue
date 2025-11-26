<script setup lang="ts">
import type { Database } from '~/types/database'

const props = defineProps<{
    items: { id: number }[]
}>()

const supabase = useSupabaseClient<Database>()
const toast = useToast()
const emit = defineEmits(['success'])

// Gunakan v-model untuk open state
const open = defineModel<boolean>('open', { default: false })
const loading = ref(false)

async function onDelete() {
    if (!props.items.length) return

    loading.value = true
    try {
        const ids = props.items.map(i => i.id)

        await $fetch('/api/skills', {
            method: 'DELETE',
            body: { ids }
        })

        toast.add({
            title: 'Success',
            description: `${props.items.length} item(s) deleted successfully`,
            color: 'success',
            icon: 'i-lucide-check-circle'
        })

        open.value = false
        emit('success')
    } catch (error: any) {
        toast.add({
            title: 'Error',
            description: error.message || 'Failed to delete items',
            color: 'error',
            icon: 'i-lucide-alert-circle'
        })
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <UModal v-model:open="open" :title="`Delete ${items.length} item${items.length > 1 ? 's' : ''}`"
        description="Are you sure you want to delete these items? This action cannot be undone.">
        <template #body>
            <div class="flex justify-end gap-2 mt-4">
                <UButton label="Cancel" color="neutral" variant="subtle" :disabled="loading" @click="open = false" />
                <UButton label="Delete" color="error" variant="solid" :loading="loading" @click="onDelete" />
            </div>
        </template>
    </UModal>
</template>