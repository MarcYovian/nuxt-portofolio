<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const props = defineProps<{
    item: any
}>()

const toast = useToast()
const emit = defineEmits(['success'])
const open = defineModel<boolean>('open')

const schema = z.object({
    title: z.string().min(1, 'Title is required'),
    slug: z.string().min(1, 'Slug is required'),
    description: z.string().min(1, 'Description is required'),
    content: z.string().optional().nullable(),
    category_id: z.number(),
    demo_url: z.string().optional().nullable(),
    github_url: z.string().optional().nullable(),
    is_active: z.boolean().default(true),
    is_featured: z.boolean().default(false),
    status: z.string().optional().nullable(),
    published_at: z.string().optional().nullable(),
    started_at: z.string().optional().nullable(),
    completed_at: z.string().optional().nullable()
})

type Schema = z.output<typeof schema>

const loading = ref(false)
const selectedFile = ref<File | null>(null)
const previewUrl = ref<string | null>(null)

// Fetch categories for select
const { data: categories } = await useAsyncData('project_categories_modal_edit', () => $fetch('/api/project-categories'))

const state = reactive<Partial<Schema>>({})

watch(() => props.item, (newItem) => {
    if (newItem) {
        Object.assign(state, {
            title: newItem.title,
            slug: newItem.slug,
            description: newItem.description,
            content: newItem.content,
            category_id: newItem.category_id,
            demo_url: newItem.demo_url,
            github_url: newItem.github_url,
            is_active: newItem.is_active,
            is_featured: newItem.is_featured,
            status: newItem.status,
            published_at: newItem.published_at ? newItem.published_at.split('T')[0] : undefined,
            started_at: newItem.started_at ? newItem.started_at.split('T')[0] : undefined,
            completed_at: newItem.completed_at ? newItem.completed_at.split('T')[0] : undefined
        })
        previewUrl.value = newItem.image_url
    }
}, { immediate: true })

// Auto-generate slug from title if slug is empty
// Auto-generate slug from title
watch(() => state.title, (newTitle) => {
    if (newTitle) {
        state.slug = newTitle.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
    } else {
        state.slug = undefined
    }
})

function onImageSelect(event: any) {
    const file = event instanceof File ? event : event?.[0] instanceof File ? event[0] : event?.target?.files?.[0]
    if (!file) return

    selectedFile.value = file
    previewUrl.value = URL.createObjectURL(file)
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
    if (!props.item?.id) return

    loading.value = true
    try {
        const formData = new FormData()

        // Append all fields
        Object.entries(event.data).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                formData.append(key, String(value))
            }
        })

        // Append file if selected
        if (selectedFile.value) {
            formData.append('image', selectedFile.value)
        }

        await $fetch(`/api/projects/${props.item.id}`, {
            method: 'PUT',
            body: formData
        })

        toast.add({
            title: 'Success',
            description: 'Project updated successfully',
            color: 'success',
            icon: 'i-lucide-check-circle'
        })

        open.value = false
        emit('success')
    } catch (error: any) {
        toast.add({
            title: 'Error',
            description: error.data?.message || error.message || 'Failed to update project',
            color: 'error',
            icon: 'i-lucide-alert-circle'
        })
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <UModal v-model:open="open" title="Edit project" description="Update project details"
        :ui="{ content: 'sm:max-w-5xl' }">
        <template #body>
            <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <UFormField label="Title" name="title" required>
                        <UInput v-model="state.title" class="w-full" placeholder="Project Title" />
                    </UFormField>

                    <UFormField label="Slug" name="slug" required>
                        <UInput v-model="state.slug" class="w-full" placeholder="project-slug" />
                    </UFormField>

                    <UFormField label="Category" name="category_id" required>
                        <USelectMenu v-model="state.category_id" :options="categories || []" value-attribute="id"
                            option-attribute="name" placeholder="Select category" class="w-full" />
                    </UFormField>

                    <UFormField label="Status" name="status">
                        <USelectMenu v-model="state.status" :options="['published', 'draft', 'archived']"
                            class="w-full" />
                    </UFormField>

                    <UFormField label="Description" name="description" class="col-span-full">
                        <UTextarea v-model="state.description" class="w-full" placeholder="Short description..." />
                    </UFormField>

                    <UFormField label="Content" name="content" class="col-span-full">
                        <UTextarea v-model="state.content" class="w-full"
                            placeholder="Full content (Markdown supported)..." :rows="5" />
                    </UFormField>

                    <!-- Image Upload -->
                    <UFormField label="Project Image" name="image">
                        <div class="flex items-start gap-4">
                            <UFileUpload icon="i-lucide-image" label="Drop your image here"
                                description="SVG, PNG, JPG or GIF (max. 2MB)" accept="image/*" class="w-full"
                                @change="onImageSelect" />
                            <div v-if="previewUrl"
                                class="relative h-24 w-24 shrink-0 rounded overflow-hidden border border-zinc-800">
                                <img :src="previewUrl" alt="Preview" class="h-full w-full object-cover" />
                            </div>
                        </div>
                    </UFormField>

                    <UFormField label="Demo URL" name="demo_url">
                        <UInput v-model="state.demo_url" icon="i-lucide-link" class="w-full" />
                    </UFormField>

                    <UFormField label="GitHub URL" name="github_url">
                        <UInput v-model="state.github_url" icon="i-lucide-github" class="w-full" />
                    </UFormField>

                    <UFormField label="Started At" name="started_at">
                        <UInput v-model="state.started_at" type="date" class="w-full" />
                    </UFormField>

                    <UFormField label="Completed At" name="completed_at">
                        <UInput v-model="state.completed_at" type="date" class="w-full" />
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
                    <UButton label="Save changes" color="primary" variant="solid" type="submit" :loading="loading" />
                </div>
            </UForm>
        </template>
    </UModal>
</template>
