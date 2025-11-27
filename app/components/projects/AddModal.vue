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
    slug: z.string().min(1, 'Slug is required'),
    description: z.string().min(1, 'Description is required'),
    content: z.string().optional(),
    category_id: z.number(),
    demo_url: z.string().optional().nullable(),
    github_url: z.string().optional().nullable(),
    is_active: z.boolean().default(true),
    is_featured: z.boolean().default(false),
    status: z.string().optional().nullable(),
    published_at: z.string().optional().nullable(),
    started_at: z.string().optional().nullable(),
    completed_at: z.string().optional().nullable(),
    image: z.instanceof(File, {
        message: 'Please select an image file.'
    })
        .refine((file) => file.size <= MAX_FILE_SIZE, {
            message: `The image is to large. Please choose an image smaller than ${formatBytes(MAX_FILE_SIZE)}`
        })
        .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
            message: `Please upload a valid image file (${ACCEPTED_IMAGE_TYPES.join(', ')}).`
        }),
    skills: z.array(z.number()).default([])
})

type Schema = z.output<typeof schema>

const open = ref(false)
const loading = ref(false)
const loadingCategories = ref(false)
const selectedFile = ref<File | null>(null)
const previewUrl = ref<string | null>(null)
const categories = ref<{ value: number; label: string }[]>([])
const skills = ref<{ value: number; label: string; icon?: string }[]>([])
const loadingSkills = ref(false)
const skillModal = ref() // Template ref for SkillsAddModal

async function fetchCategories() {
    loadingCategories.value = true
    try {
        const { data: projectCategories, status } = await useFetch('/api/project-categories', {
            key: 'project-categories',
            transform: (data: { id: number; name: string }[]) => {
                return data?.map(category => ({
                    value: category.id,
                    label: category.name
                }))
            }
        })

        categories.value = projectCategories.value || []
    } catch (error: any) {
        toast.add({
            title: 'Error',
            description: 'Failed to load categories',
            color: 'error',
            icon: 'i-lucide-alert-circle'
        })
        categories.value = []
    } finally {
        loadingCategories.value = false
    }
}

async function fetchSkills() {
    loadingSkills.value = true
    try {
        const { data: skillList } = await useFetch('/api/skills', {
            key: 'skills-list',
            transform: (data: { id: number; name: string; icon: string }[]) => {
                return data?.map(skill => ({
                    value: skill.id,
                    label: skill.name,
                    icon: skill.icon
                }))
            }
        })

        skills.value = skillList.value || []
    } catch (error: any) {
        toast.add({
            title: 'Error',
            description: 'Failed to load skills',
            color: 'error',
            icon: 'i-lucide-alert-circle'
        })
        skills.value = []
    } finally {
        loadingSkills.value = false
    }
}

watch(open, (isOpen) => {
    if (isOpen) {
        fetchCategories()
        fetchSkills()
    }
})

const state = reactive<Partial<Schema>>({
    title: undefined,
    slug: undefined,
    description: undefined,
    content: undefined,
    category_id: undefined,
    demo_url: undefined,
    github_url: undefined,
    is_active: true,
    is_featured: false,
    status: 'published',
    published_at: undefined,
    started_at: undefined,
    completed_at: undefined,
    image: undefined,
    skills: []
})

watch(() => state.title, (newTitle) => {
    if (newTitle) {
        state.slug = newTitle.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
    } else {
        state.slug = undefined
    }
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
    loading.value = true
    try {

        const formData = new FormData()

        if (event.data.image) {
            formData.append('image', event.data.image)
        }

        formData.append('title', event.data.title)
        formData.append('slug', event.data.slug)
        formData.append('description', event.data.description)
        formData.append('category_id', String(event.data.category_id)) // Convert ke String
        formData.append('is_active', String(event.data.is_active))     // "true" / "false"
        formData.append('is_featured', String(event.data.is_featured))

        // Handle Optional Fields (Cek ada isinya atau tidak)
        if (event.data.content) formData.append('content', event.data.content)
        if (event.data.demo_url) formData.append('demo_url', event.data.demo_url)
        if (event.data.github_url) formData.append('github_url', event.data.github_url)
        if (event.data.status) formData.append('status', event.data.status)
        if (event.data.started_at) formData.append('started_at', event.data.started_at)
        if (event.data.completed_at) formData.append('completed_at', event.data.completed_at)

        // Append Skills
        if (event.data.skills && event.data.skills.length > 0) {
            formData.append('skills', JSON.stringify(event.data.skills))
        }

        await $fetch('/api/projects', {
            method: 'POST',
            body: formData
        })

        toast.add({
            title: 'Success',
            description: 'Project created successfully',
            color: 'success',
            icon: 'i-lucide-check-circle'
        })

        open.value = false
        emit('success')

        // Reset form
        Object.assign(state, {
            title: undefined,
            slug: undefined,
            description: undefined,
            content: undefined,
            category_id: undefined,
            demo_url: undefined,
            github_url: undefined,
            is_active: true,
            is_featured: false,
            status: 'published',
            published_at: undefined,
            started_at: undefined,
            completed_at: undefined,
            skills: []
        })

        selectedFile.value = null
        previewUrl.value = null
    } catch (error: any) {
        toast.add({
            title: 'Error',
            description: error.data?.message || error.message || 'Failed to create project',
            color: 'error',
            icon: 'i-lucide-alert-circle'
        })
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <UModal v-model:open="open" title="New project" description="Add a new project" :ui="{ content: 'sm:max-w-5xl' }">
        <UButton label="New project" icon="i-lucide-plus" />

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
                        <USelectMenu v-model="state.category_id" value-key="value" option-key="label"
                            :items="categories" :loading="loadingCategories" placeholder="Select a category"
                            class="w-full" />
                        <template #empty>
                            <div class="text-center py-4 text-sm text-zinc-400">
                                {{ loadingCategories ? 'Loading categories...' : 'No categories found' }}
                            </div>
                        </template>
                    </UFormField>

                    <UFormField label="Tech Stack / Skills" name="skills">
                        <USelectMenu v-model="state.skills" value-key="value" option-key="label" :items="skills"
                            :loading="loadingSkills" placeholder="Select skills" multiple searchable class="w-full">
                            <template #empty="{ searchTerm }">
                                <div class="text-center py-4 text-sm text-zinc-400 flex flex-col items-center gap-2">
                                    <span>No skills found</span>
                                    <UButton v-if="searchTerm" size="xs" color="primary" variant="soft"
                                        label="Create skill" @click="skillModal.open = true" />
                                </div>
                            </template>
                        </USelectMenu>
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
                        <UFileUpload icon="i-lucide-image" label="Drop your image here"
                            description="PNG, JPG or GIF. 1MB max." accept="image/*" class="w-full"
                            v-model="state.image" />
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
                    <UButton label="Create Project" color="primary" variant="solid" type="submit" :loading="loading" />
                </div>
            </UForm>
        </template>

        <!-- Skills Modal -->
        <SkillsAddModal ref="skillModal" hide-trigger @success="fetchSkills" />
    </UModal>
</template>
