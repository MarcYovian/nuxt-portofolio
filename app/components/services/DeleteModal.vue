<script setup lang="ts">
const toast = useToast()
const emit = defineEmits(['success', 'update:open'])

const props = defineProps<{
    open: boolean
    items: any[]
}>()

const isOpen = computed({
    get: () => props.open,
    set: (value) => emit('update:open', value)
})

const loading = ref(false)

async function onDelete() {
    if (!props.items.length) return

    loading.value = true
    try {
        const ids = props.items.map(item => item.id)
        await $fetch('/api/services', {
            method: 'DELETE',
            body: { ids }
        })

        toast.add({
            title: 'Success',
            description: 'Services deleted successfully',
            color: 'success',
            icon: 'i-lucide-check-circle'
        })

        isOpen.value = false
        emit('success')
    } catch (error: any) {
        toast.add({
            title: 'Error',
            description: error.data?.message || error.message || 'Failed to delete services',
            color: 'error',
            icon: 'i-lucide-alert-circle'
        })
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <UModal v-model:open="isOpen" title="Delete services" description="Are you sure you want to delete these services?"
        :ui="{ content: 'z-9999 sm:max-w-lg' }">
        <template #body>
            <p class="text-sm text-zinc-500 mb-4">
                This action cannot be undone. This will permanently delete {{ items.length }} service(s).
            </p>

            <div class="flex justify-end gap-2">
                <UButton label="Cancel" color="neutral" variant="subtle" :disabled="loading" @click="isOpen = false" />
                <UButton label="Delete" color="error" variant="solid" :loading="loading" @click="onDelete" />
            </div>
        </template>
    </UModal>
</template>
