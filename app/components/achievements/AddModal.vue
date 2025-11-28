<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const toast = useToast()
const emit = defineEmits(['success'])

const MAX_FILE_SIZE = 1024 * 1024 // 1MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

const schema = z.object({
    title: z.string().min(1, 'Title is required'),
    issuer: z.string().min(1, 'Issuer is required'),
    date: z.string().min(1, 'Date is required'),
    description: z.string().optional(),
    credential_id: z.string().optional().nullable(),
    credential_url: z.string().optional().nullable(),
    type: z.string().optional(),
    is_active: z.boolean().default(true),
    is_featured: z.boolean().default(false),
    display_order: z.number().optional(),
    image: z.instanceof(File, {
        message: 'Please select an image file.'
    })
        .refine((file) => file.size <= MAX_FILE_SIZE, {
            message: `The image is to large. Please choose an image smaller than ${formatBytes(MAX_FILE_SIZE)}`
        })
        .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
            message: `Please upload a valid image file (${ACCEPTED_IMAGE_TYPES.join(', ')}).`
        }),
    tags: z.array(z.number()).default([])
})

type Schema = z.output<typeof schema>

const open = ref(false)
const loading = ref(false)
const selectedFile = ref<File | null>(null)
const tags = ref<{ value: number; label: string; color: string }[]>([])
const loadingTags = ref(false)
const tagModal = ref<{ open: boolean } | null>(null)

async function fetchTags() {
    loadingTags.value = true
    try {
        const data = await $fetch<{ id: number; name: string; color: string }[]>('/api/tags')

        tags.value = data?.map(tag => ({
            value: tag.id,
            label: tag.name,
            color: tag.color
        })) || []
    } catch (error: any) {
        toast.add({
            title: 'Error',
            description: 'Failed to load tags',
            color: 'error',
            icon: 'i-lucide-alert-circle'
        })
        tags.value = []
    } finally {
        loadingTags.value = false
    }
}

watch(open, (isOpen) => {
    if (isOpen) {
        fetchTags()
    }
})

async function onTagCreated(newTag: any) {
    await fetchTags()
    // Auto-select the newly created tag if possible, but for now just refresh list
}

const state = reactive<Partial<Schema>>({
    title: undefined,
    issuer: undefined,
    date: undefined,
    description: undefined,
    credential_id: undefined,
    credential_url: undefined,
    type: undefined,
    is_active: true,
    is_featured: false,
    display_order: 0,
    image: undefined,
    tags: []
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
    loading.value = true
    try {
        const formData = new FormData()

        if (event.data.image) {
            formData.append('image', event.data.image)
        }

        formData.append('title', event.data.title)
        formData.append('issuer', event.data.issuer)
        formData.append('date', event.data.date)
        formData.append('is_active', String(event.data.is_active))
        formData.append('is_featured', String(event.data.is_featured))

        if (event.data.description) formData.append('description', event.data.description)
        if (event.data.credential_id) formData.append('credential_id', event.data.credential_id)
        if (event.data.credential_url) formData.append('credential_url', event.data.credential_url)
        if (event.data.type) formData.append('type', event.data.type)
        if (event.data.display_order) formData.append('display_order', String(event.data.display_order))

        if (event.data.tags && event.data.tags.length > 0) {
            formData.append('tags', JSON.stringify(event.data.tags))
        }

        await $fetch('/api/achievements', {
            method: 'POST',
            body: formData
        })

        toast.add({
            title: 'Success',
            description: 'Achievement created successfully',
            color: 'success',
            icon: 'i-lucide-check-circle'
        })

        open.value = false
        emit('success')

        // Reset form
        Object.assign(state, {
            title: undefined,
            issuer: undefined,
            date: undefined,
            description: undefined,
            credential_id: undefined,
            credential_url: undefined,
            type: 'certification',
            is_active: true,
            is_featured: false,
            display_order: 0,
            image: undefined,
            tags: []
        })
        selectedFile.value = null
    } catch (error: any) {
        toast.add({
            title: 'Error',
            description: error.data?.message || error.message || 'Failed to create achievement',
            color: 'error',
            icon: 'i-lucide-alert-circle'
        })
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <UModal v-model:open="open" title="New achievement" description="Add a new achievement"
        :ui="{ content: 'sm:max-w-3xl' }">
        <UButton label="New achievement" icon="i-lucide-plus" />

        <template #body>
            <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <UFormField label="Title" name="title" required>
                        <UInput v-model="state.title" class="w-full" placeholder="Achievement Title" />
                    </UFormField>

                    <UFormField label="Issuer" name="issuer" required>
                        <UInput v-model="state.issuer" class="w-full" placeholder="Issuer Name" />
                    </UFormField>

                    <UFormField label="Date" name="date" required>
                        <UInput v-model="state.date" type="date" class="w-full" />
                    </UFormField>

                    <UFormField label="Type" name="type">
                        <USelectMenu v-model="state.type" :items="[
                            { value: 'certification', label: 'Certification' },
                            { value: 'award', label: 'Award' },
                            { value: 'publication', label: 'Publication' },
                            { value: 'patent', label: 'Patent' },
                            { value: 'course', label: 'Course' },
                            { value: 'other', label: 'Other' }
                        ]" value-key="value" option-key="label" class="w-full" />
                    </UFormField>

                    <UFormField label="Tags" name="tags" class="col-span-full">
                        <USelectMenu v-model="state.tags" value-key="value" option-key="label" :items="tags"
                            :loading="loadingTags" placeholder="Select tags" multiple searchable class="w-full">
                            <template #empty="{ searchTerm }">
                                <div class="text-center py-4 text-sm text-zinc-400 flex flex-col items-center gap-2">
                                    <span>No tags found</span>
                                    <UButton v-if="searchTerm" size="xs" color="primary" variant="soft"
                                        label="Create tag" @click="() => { if (tagModal) tagModal.open = true }" />
                                </div>
                            </template>
                            <template #item="{ item }">
                                <div class="flex items-center gap-2">
                                    <div class="h-3 w-3 rounded-full" :style="{ backgroundColor: item.color }"></div>
                                    <span>{{ item.label }}</span>
                                </div>
                            </template>
                        </USelectMenu>
                    </UFormField>

                    <UFormField label="Description" name="description" class="col-span-full">
                        <UTextarea v-model="state.description" class="w-full" placeholder="Short description..." />
                    </UFormField>

                    <!-- Image Upload -->
                    <UFormField label="Image" name="image" class="col-span-full">
                        <UFileUpload icon="i-lucide-image" label="Drop your image here"
                            description="PNG, JPG or GIF. 1MB max." accept="image/*" class="w-full"
                            v-model="state.image" />
                    </UFormField>

                    <UFormField label="Credential ID" name="credential_id">
                        <UInput v-model="state.credential_id" class="w-full" />
                    </UFormField>

                    <UFormField label="Credential URL" name="credential_url">
                        <UInput v-model="state.credential_url" icon="i-lucide-link" class="w-full" />
                    </UFormField>

                    <UFormField label="Display Order" name="display_order">
                        <UInput v-model="state.display_order" type="number" class="w-full" />
                    </UFormField>

                    <div class="col-span-full flex gap-4">
                        <UFormField name="is_active">
                            <UCheckbox v-model="state.is_active" label="Is Active" />
                        </UFormField>
                        <UFormField name="is_featured">
                            <UCheckbox v-model="state.is_featured" label="Is Featured" />
                        </UFormField>
                    </div>
                </div>

                <div class="flex justify-end gap-2 pt-4 border-t border-zinc-800">
                    <UButton label="Cancel" color="neutral" variant="subtle" :disabled="loading"
                        @click="open = false" />
                    <UButton label="Create Achievement" color="primary" variant="solid" type="submit"
                        :loading="loading" />
                </div>
            </UForm>
        </template>

        <!-- Tags Add Modal (Reused) -->
        <TagsAddModal ref="tagModal" hide-trigger @success="onTagCreated" />
    </UModal>
</template>
