<script setup lang="ts">
import type { Database } from '~/types/database'

const props = defineProps<{
    items: { id: number }[]
}>()

const supabase = useSupabaseClient<Database>()
const toast = useToast()
const emit = defineEmits(['success', 'update:open'])

const open = defineModel<boolean>('open')
const loading = ref(false)

async function onDelete() {
    if (!props.items.length) return

    loading.value = true
    try {
        const ids = props.items.map(i => i.id)
        const { error } = await supabase.from('skill_categories')
            .delete()
            .in('id', ids)

        if (error) throw error

        toast.add({ title: 'Success', description: 'Skill categories deleted successfully', color: 'success' })
        open.value = false
        emit('success')
    } catch (error: any) {
        toast.add({ title: 'Error', description: error.message, color: 'error' })
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <UModal v-model:open="open" title="Delete categories"
        description="Are you sure you want to delete these categories?">
        <template #body>
            <p>This action cannot be undone.</p>
            <div class="flex justify-end gap-2 mt-4">
                <UButton label="Cancel" color="neutral" variant="subtle" @click="open = false" />
                <UButton label="Delete" color="error" variant="solid" :loading="loading" @click="onDelete" />
            </div>
        </template>
    </UModal>
</template>
