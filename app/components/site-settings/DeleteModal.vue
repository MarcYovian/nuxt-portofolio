<script setup lang="ts">
const props = defineProps<{
    item: any
}>()

const emit = defineEmits(['success'])
const toast = useToast()

const open = ref(false)
const loading = ref(false)

async function onDelete() {
    loading.value = true
    try {
        await $fetch(`/api/site-settings/${props.item.key}`, {
            method: 'DELETE'
        })

        toast.add({
            title: 'Success',
            description: 'Setting deleted successfully',
            color: 'success',
            icon: 'i-lucide-check-circle'
        })

        open.value = false
        emit('success')
    } catch (error: any) {
        toast.add({
            title: 'Error',
            description: error.data?.message || error.message || 'Failed to delete setting',
            color: 'error',
            icon: 'i-lucide-alert-circle'
        })
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <UModal v-model:open="open" title="Delete Setting" description="Are you sure you want to delete this setting?"
        :ui="{ content: 'sm:max-w-md' }">
        
        <UButton icon="i-lucide-trash" color="error" variant="ghost" size="xs" />

        <template #body>
            <div class="space-y-4">
                <p class="text-sm text-zinc-400">
                    This action cannot be undone. This will permanently delete the
                    <span class="font-medium text-white">{{ props.item?.key }}</span> setting.
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
