<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const props = defineProps<{
    item: any
}>()

const toast = useToast()
const emit = defineEmits(['success'])

const schema = z.object({
    description: z.string().optional(),
    value: z.string().refine((val) => {
        try {
            JSON.parse(val)
            return true
        } catch (e) {
            return false
        }
    }, 'Value must be valid JSON'),
    is_public: z.boolean().default(false)
})

type Schema = z.output<typeof schema>

const open = ref(false)
const loading = ref(false)

const state = reactive<Partial<Schema>>({
    description: undefined,
    value: undefined,
    is_public: false
})

watch(() => props.item, (newItem) => {
    if (newItem) {
        state.description = newItem.description
        state.is_public = newItem.is_public
        // Pretty print JSON for editing
        try {
            state.value = JSON.stringify(newItem.value, null, 2)
        } catch (e) {
            state.value = String(newItem.value)
        }
    }
}, { immediate: true })

async function onSubmit(event: FormSubmitEvent<Schema>) {
    loading.value = true
    try {
        const parsedValue = JSON.parse(event.data.value)

        await $fetch(`/api/site-settings/${props.item.key}`, {
            method: 'PUT',
            body: {
                description: event.data.description,
                value: parsedValue,
                is_public: event.data.is_public
            }
        })

        toast.add({
            title: 'Success',
            description: 'Setting updated successfully',
            color: 'success',
            icon: 'i-lucide-check-circle'
        })

        open.value = false
        emit('success')
    } catch (error: any) {
        toast.add({
            title: 'Error',
            description: error.data?.message || error.message || 'Failed to update setting',
            color: 'error',
            icon: 'i-lucide-alert-circle'
        })
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <UModal v-model:open="open" title="Edit Setting" :description="`Edit setting: ${props.item?.key}`"
        :ui="{ content: 'sm:max-w-2xl' }">
        
        <UButton icon="i-lucide-edit" color="neutral" variant="ghost" size="xs" />

        <template #body>
            <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
                <UFormField label="Key" name="key">
                    <UInput :model-value="props.item?.key" disabled class="w-full opacity-75" />
                </UFormField>

                <UFormField label="Description" name="description">
                    <UInput v-model="state.description" class="w-full" placeholder="What this setting controls..." />
                </UFormField>

                <UFormField label="Value (JSON)" name="value" required help="Must be valid JSON. Strings must be quoted.">
                    <UTextarea v-model="state.value" class="w-full font-mono text-sm" :rows="8" />
                </UFormField>

                <UFormField name="is_public">
                    <UCheckbox v-model="state.is_public" label="Is Public (Exposed to API)" />
                </UFormField>

                <div class="flex justify-end gap-2 pt-4 border-t border-zinc-800">
                    <UButton label="Cancel" color="neutral" variant="subtle" :disabled="loading"
                        @click="open = false" />
                    <UButton label="Save Changes" color="primary" variant="solid" type="submit"
                        :loading="loading" />
                </div>
            </UForm>
        </template>
    </UModal>
</template>
