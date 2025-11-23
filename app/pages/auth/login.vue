<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
    layout: 'auth'
})

useSeoMeta({
    title: 'Login - MarcYovian',
    description: 'Sign in to your account'
})

const toast = useToast()
const isLoading = ref(false)
const supabase = useSupabaseClient()

// Validasi Form
const schema = z.object({
    email: z.string({ error: 'Email must be provided' })
        .min(1, 'Email must be provided') // Menangani string kosong
        .email('Email must be a valid email'),
    password: z.string({ error: 'Password must be provided' })
        .min(1, 'Password must be provided') // Menangani string kosong
        .min(8, 'Password must be at least 8 characters long')
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
    email: undefined,
    password: undefined
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
    isLoading.value = true

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: event.data.email,
            password: event.data.password,
        })

        if (error) throw error

        toast.add({
            title: 'Login Berhasil',
            description: 'Selamat datang kembali!',
            color: 'success',
            icon: 'i-lucide-check-circle'
        })

        setTimeout(() => {
            navigateTo('/admin')
        }, 2000)
    } catch (error: any) {
        toast.add({
            title: 'Gagal Login',
            description: error.message || 'Terjadi kesalahan, silakan coba lagi.',
            color: 'error',
            icon: 'i-lucide-alert-circle'
        })
    } finally {
        isLoading.value = false
    }
}

function onSocialLogin(provider: string) {
    toast.add({
        title: `Login with ${provider}`,
        description: 'Fitur ini belum tersedia.',
        icon: 'i-lucide-wrench',
        color: 'neutral'
    })
}
</script>

<template>
    <div class="space-y-6">
        <!-- Header Card -->
        <div class="text-center">
            <div
                class="inline-flex items-center justify-center p-3 bg-zinc-800/50 rounded-xl mb-4 ring-1 ring-zinc-700/50 shadow-inner">
                <UIcon name="i-lucide-lock" class="size-6 text-primary-400" />
            </div>
            <h1 class="text-2xl font-bold text-white mb-2">Welcome Back</h1>
            <p class="text-sm text-zinc-400">
                Enter your credentials to access your account
            </p>
        </div>

        <!-- Form -->
        <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
            <UFormField label="Email" name="email">
                <UInput v-model="state.email" type="email" placeholder="hello@example.com" icon="i-lucide-mail"
                    size="lg" class="w-full" autocomplete="email" />
            </UFormField>

            <UFormField label="Password" name="password">
                <UInput v-model="state.password" type="password" placeholder="••••••••" icon="i-lucide-key" size="lg"
                    class="w-full" autocomplete="current-password" />
                <template #help>
                    <div class="flex justify-end w-full pt-1">
                        <NuxtLink to="/auth/forgot-password"
                            class="text-xs text-zinc-400 hover:text-primary-400 transition-colors">
                            Forgot password?
                        </NuxtLink>
                    </div>
                </template>
            </UFormField>

            <UButton type="submit" size="lg" block :loading="isLoading" color="primary" variant="solid"
                class="font-bold">
                Sign In
            </UButton>
        </UForm>

        <!-- Social Login Divider -->
        <div class="relative">
            <div class="absolute inset-0 flex items-center">
                <span class="w-full border-t border-zinc-800" />
            </div>
            <div class="relative flex justify-center text-xs uppercase">
                <span class="bg-zinc-900 px-2 text-zinc-500">Or continue with</span>
            </div>
        </div>

        <!-- Social Buttons -->
        <div class="grid grid-cols-2 gap-3">
            <UButton color="neutral" variant="subtle" block icon="i-simple-icons-github" label="GitHub"
                @click="onSocialLogin('GitHub')" />
            <UButton color="neutral" variant="subtle" block icon="i-simple-icons-google" label="Google"
                @click="onSocialLogin('Google')" />
        </div>

        <div class="text-center mt-4">
            <p class="text-sm text-zinc-400">
                Don't have an account?
                <NuxtLink to="/auth/signup"
                    class="text-primary-400 hover:text-primary-300 transition-colors font-medium">
                    Sign Up
                </NuxtLink>
            </p>
        </div>
    </div>
</template>