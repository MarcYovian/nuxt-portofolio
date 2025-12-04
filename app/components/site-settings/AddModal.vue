<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const toast = useToast()
const emit = defineEmits(['success'])

const schema = z.object({
    key: z.string().min(1, 'Key is required').regex(/^[a-zA-Z0-9_]+$/, 'Key must only contain letters, numbers, and underscores'),
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
    key: undefined,
    description: undefined,
    value: undefined,
    is_public: false
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
    loading.value = true
    try {
        const parsedValue = JSON.parse(event.data.value)

        await $fetch('/api/site-settings', {
            method: 'POST',
            body: {
                key: event.data.key,
                description: event.data.description,
                value: parsedValue,
                is_public: event.data.is_public
            }
        })

        toast.add({
            title: 'Success',
            description: 'Setting created successfully',
            color: 'success',
            icon: 'i-lucide-check-circle'
        })

        open.value = false
        emit('success')

        // Reset form
        Object.assign(state, {
            key: undefined,
            description: undefined,
            value: undefined,
            is_public: false
        })
    } catch (error: any) {
        toast.add({
            title: 'Error',
            description: error.data?.message || error.message || 'Failed to create setting',
            color: 'error',
            icon: 'i-lucide-alert-circle'
        })
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <UModal v-model:open="open" title="New Setting" description="Add a new site setting"
        :ui="{ content: 'sm:max-w-2xl' }">
        <UButton label="New Setting" icon="i-lucide-plus" />

        <template #body>
            <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
                <UFormField label="Key" name="key" required help="Unique identifier (e.g. site_title)">
                    <UInput v-model="state.key" class="w-full" placeholder="site_key" />
                </UFormField>

                <UFormField label="Description" name="description">
                    <UInput v-model="state.description" class="w-full" placeholder="What this setting controls..." />
                </UFormField>

                <UFormField label="Value (JSON)" name="value" required help="Must be valid JSON. Strings must be quoted.">
                    <UTextarea v-model="state.value" class="w-full font-mono text-sm" :rows="5" placeholder='e.g. "My Site" or {"theme": "dark"}' />
                </UFormField>

                <UFormField name="is_public">
                    <UCheckbox v-model="state.is_public" label="Is Public (Exposed to API)" />
                </UFormField>

                <div class="flex justify-end gap-2 pt-4 border-t border-zinc-800">
                    <UButton label="Cancel" color="neutral" variant="subtle" :disabled="loading"
                        @click="open = false" />
                    <UButton label="Create Setting" color="primary" variant="solid" type="submit"
                        :loading="loading" />
                </div>
            </UForm>
        </template>
    </UModal>
</template>
