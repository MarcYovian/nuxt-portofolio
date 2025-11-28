<script setup lang="ts">
const props = defineProps<{
    items: any[]
}>()

const open = defineModel<boolean>('open')
const emit = defineEmits(['success'])
const toast = useToast()

const loading = ref(false)

async function onDelete() {
    if (!props.items.length) return

    loading.value = true
    try {
        // Delete sequentially
        for (const item of props.items) {
            await $fetch(`/api/achievements/${item.id}`, {
                method: 'DELETE'
            })
        }

        toast.add({
            title: 'Success',
            description: `${props.items.length} achievement(s) deleted successfully`,
            color: 'success',
            icon: 'i-lucide-check-circle'
        })

        open.value = false
        emit('success')
    } catch (error: any) {
        toast.add({
            title: 'Error',
            description: error.data?.message || error.message || 'Failed to delete achievements',
            color: 'error',
            icon: 'i-lucide-alert-circle'
        })
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <UModal v-model:open="open" title="Delete achievements"
        description="Are you sure you want to delete these achievements?" :ui="{ content: 'sm:max-w-md' }">
        <template #body>
            <div class="space-y-4">
                <p class="text-sm text-zinc-400">
                    This action cannot be undone. This will permanently delete
                    <span class="font-medium text-white">{{ items.length }}</span> achievement(s) and their associated
                    images.
                </p>

                <div class="flex justify-end gap-2 pt-4 border-t border-zinc-800">
                    <UButton label="Cancel" color="neutral" variant="subtle" :disabled="loading"
                        @click="open = false" />
                    <UButton label="Delete" color="error" variant="solid" :loading="loading" @click="onDelete" />
                </div>
            </div>
        </template>
    </UModal>
</template>
