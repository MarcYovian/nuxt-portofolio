<script setup lang="ts">
const props = defineProps<{
    items: any[]
}>()

const toast = useToast()
const emit = defineEmits(['success'])
const open = defineModel<boolean>('open')

const loading = ref(false)

async function onDelete() {
    if (!props.items.length) return

    loading.value = true
    try {
        const ids = props.items.map(item => item.id)
        await $fetch('/api/educations', {
            method: 'DELETE',
            body: { ids }
        })

        toast.add({
            title: 'Success',
            description: 'Education deleted successfully',
            color: 'success',
            icon: 'i-lucide-check-circle'
        })

        open.value = false
        emit('success')
    } catch (error: any) {
        toast.add({
            title: 'Error',
            description: error.data?.message || error.message || 'Failed to delete education',
            color: 'error',
            icon: 'i-lucide-alert-circle'
        })
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <UModal v-model:open="open" title="Delete education"
        description="Are you sure you want to delete these education records? This action cannot be undone.">
        <template #body>
            <div class="space-y-4">
                <p class="text-sm text-muted">
                    You are about to delete <span class="font-medium text-foreground">{{ items.length }}</span>
                    education record(s).
                </p>

                <div class="flex justify-end gap-2">
                    <UButton label="Cancel" color="neutral" variant="subtle" :disabled="loading"
                        @click="open = false" />
                    <UButton label="Delete" color="error" variant="solid" :loading="loading" @click="onDelete" />
                </div>
            </div>
        </template>
    </UModal>
</template>
