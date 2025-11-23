<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
    layout: 'auth'
})

useSeoMeta({
    title: 'Sign Up - MarcYovian',
    description: 'Create your account'
})

const toast = useToast()
const isLoading = ref(false)
const supabase = useSupabaseClient()

const items = [{
    label: 'Account',
    icon: 'i-lucide-user-plus',
    slot: 'account'
}, {
    label: 'Profile',
    icon: 'i-lucide-contact',
    slot: 'profile'
}, {
    label: 'Socials',
    icon: 'i-lucide-share-2',
    slot: 'socials'
}]

const schema = z.object({
    // Account Info (Wajib untuk Auth Supabase)
    email: z.string({ error: 'Email wajib diisi' })
        .min(1, 'Email wajib diisi')
        .email('Format email tidak valid'),
    password: z.string({ error: 'Password wajib diisi' })
        .min(8, 'Password minimal 8 karakter'),
    confirmPassword: z.string({ error: 'Konfirmasi password wajib diisi' })
        .min(1, 'Konfirmasi password wajib diisi'),

    // Profile Info (Tabel public.profiles)
    full_name: z.string().min(1, 'Nama lengkap wajib diisi'),
    phone: z.string().optional(),
    location: z.string().optional(),
    bio: z.string().max(500, 'Bio maksimal 500 karakter').optional(),

    // Social/Web Info
    website: z.string().url('URL tidak valid').optional().or(z.literal('')),
    linkedin_url: z.string().url('URL tidak valid').optional().or(z.literal('')),
    github_url: z.string().url('URL tidak valid').optional().or(z.literal('')),
    twitter_url: z.string().url('URL tidak valid').optional().or(z.literal(''))
}).refine((data) => data.password === data.confirmPassword, {
    message: "Password tidak sama",
    path: ["confirmPassword"],
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    phone: '',
    location: '',
    bio: '',
    website: '',
    linkedin_url: '',
    github_url: '',
    twitter_url: ''
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
    isLoading.value = true

    try {
        const { data, error } = await supabase.auth.signUp({
            email: event.data.email,
            password: event.data.password,
            options: {
                data: {
                    full_name: event.data.full_name,
                    phone: event.data.phone,
                    location: event.data.location,
                    bio: event.data.bio,
                    website: event.data.website,
                    linkedin_url: event.data.linkedin_url,
                    github_url: event.data.github_url,
                    twitter_url: event.data.twitter_url,
                    avatar_url: ''
                }
            }
        })

        if (error) throw error

        toast.add({
            title: 'Akun Berhasil Dibuat',
            description: 'Silakan cek email Anda untuk verifikasi.',
            color: 'success',
            icon: 'i-lucide-check-circle'
        })

        setTimeout(() => {
            navigateTo('/auth/login')
        }, 2000)

    } catch (error: any) {
        toast.add({
            title: 'Gagal Mendaftar',
            description: error.message || 'Terjadi kesalahan, silakan coba lagi.',
            color: 'error',
            icon: 'i-lucide-alert-circle'
        })
    } finally {
        isLoading.value = false
    }
}
</script>

<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="text-center">
            <h1 class="text-2xl font-bold text-white mb-2">Create Account</h1>
            <p class="text-sm text-zinc-400">
                Join us and start building your profile.
            </p>
        </div>

        <UForm :schema="schema" :state="state" class="space-y-6" @submit="onSubmit">

            <!-- Tabs Navigation -->
            <UTabs :items="items" class="w-full">

                <!-- TAB 1: Account Info -->
                <template #account>
                    <div class="space-y-4 py-4">
                        <UFormField label="Email" name="email" required>
                            <UInput v-model="state.email" type="email" placeholder="john@example.com"
                                icon="i-lucide-mail" size="lg" class="w-full" />
                        </UFormField>

                        <UFormField label="Password" name="password" required>
                            <UInput v-model="state.password" type="password" placeholder="••••••••" icon="i-lucide-lock"
                                size="lg" class="w-full" />
                        </UFormField>

                        <UFormField label="Confirm Password" name="confirmPassword" required>
                            <UInput v-model="state.confirmPassword" type="password" placeholder="••••••••"
                                icon="i-lucide-check-check" size="lg" class="w-full" />
                        </UFormField>
                    </div>
                </template>

                <!-- TAB 2: Profile Info -->
                <template #profile>
                    <div class="space-y-4 py-4">
                        <UFormField label="Full Name" name="full_name" required>
                            <UInput v-model="state.full_name" placeholder="John Doe" icon="i-lucide-user" size="lg"
                                class="w-full" />
                        </UFormField>

                        <div class="grid grid-cols-2 gap-4">
                            <UFormField label="Phone" name="phone">
                                <UInput v-model="state.phone" placeholder="+62..." icon="i-lucide-phone" size="lg"
                                    class="w-full" />
                            </UFormField>
                            <UFormField label="Location" name="location">
                                <UInput v-model="state.location" placeholder="Jakarta, ID" icon="i-lucide-map-pin"
                                    size="lg" class="w-full" />
                            </UFormField>
                        </div>

                        <UFormField label="Bio" name="bio">
                            <UTextarea v-model="state.bio" placeholder="Tell us a bit about yourself..." :rows="3"
                                class="w-full" />
                        </UFormField>
                    </div>
                </template>

                <!-- TAB 3: Socials -->
                <template #socials>
                    <div class="space-y-4 py-4">
                        <UFormField label="Website" name="website">
                            <UInput v-model="state.website" placeholder="https://yoursite.com" icon="i-lucide-globe"
                                size="lg" class="w-full" />
                        </UFormField>

                        <UFormField label="GitHub" name="github_url">
                            <UInput v-model="state.github_url" placeholder="https://github.com/username"
                                icon="i-simple-icons-github" size="lg" class="w-full" />
                        </UFormField>

                        <UFormField label="LinkedIn" name="linkedin_url">
                            <UInput v-model="state.linkedin_url" placeholder="https://linkedin.com/in/username"
                                icon="i-simple-icons-linkedin" size="lg" class="w-full" />
                        </UFormField>

                        <UFormField label="Twitter (X)" name="twitter_url">
                            <UInput v-model="state.twitter_url" placeholder="https://twitter.com/username"
                                icon="i-simple-icons-x" size="lg" class="w-full" />
                        </UFormField>
                    </div>
                </template>

            </UTabs>

            <!-- Submit Button -->
            <div class="pt-2">
                <UButton type="submit" size="lg" block :loading="isLoading" color="primary" variant="solid"
                    class="font-bold">
                    Create Account
                    <template #trailing>
                        <UIcon name="i-lucide-arrow-right" />
                    </template>
                </UButton>
            </div>

        </UForm>

        <!-- Footer -->
        <div class="text-center text-sm text-zinc-500">
            Already have an account?
            <NuxtLink to="/auth/login"
                class="text-primary-400 hover:text-primary-300 font-medium transition-colors hover:underline">
                Log in
            </NuxtLink>
        </div>
    </div>
</template>