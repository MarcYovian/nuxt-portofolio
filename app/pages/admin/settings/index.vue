<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { Database } from '~/types/database.types'

const supabase = useSupabaseClient<Database>()
const user = useSupabaseUser()
const toast = useToast()
const isLoading = ref(false)
const fileRef = ref<HTMLInputElement>()
const selectedFile = ref<File | null>(null)

const schema = z.object({
  full_name: z.string().min(2, 'Nama terlalu pendek'),
  email: z.string().email().optional(), // Read-only
  bio: z.string().max(500, 'Bio maksimal 500 karakter').optional().or(z.literal('')),
  location: z.string().max(100).optional().or(z.literal('')),
  phone: z.string().max(20).optional().or(z.literal('')),
  website: z.string().url('URL tidak valid').optional().or(z.literal('')),
  github_url: z.string().url('URL tidak valid').optional().or(z.literal('')),
  linkedin_url: z.string().url('URL tidak valid').optional().or(z.literal('')),
  twitter_url: z.string().url('URL tidak valid').optional().or(z.literal('')),
  avatar_url: z.string().optional()
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  full_name: '',
  email: '',
  bio: '',
  location: '',
  phone: '',
  website: '',
  github_url: '',
  linkedin_url: '',
  twitter_url: '',
  avatar_url: ''
})

async function getProfile() {
  try {
    isLoading.value = true
    if (!user.value) return

    const { data, error } = await supabase
      .from('profiles')
      .select(`full_name, avatar_url, bio, website, linkedin_url, github_url, twitter_url, phone, location`)
      .eq('id', user.value.id)
      .single()

    if (error && error.code !== 'PGRST116') throw error

    if (data) {
      state.full_name = data.full_name ?? ''
      state.avatar_url = data.avatar_url ?? undefined
      state.bio = data.bio ?? ''
      state.website = data.website ?? ''
      state.linkedin_url = data.linkedin_url ?? ''
      state.github_url = data.github_url ?? ''
      state.twitter_url = data.twitter_url ?? ''
      state.phone = data.phone ?? ''
      state.location = data.location ?? ''
    }

    state.email = user.value.email

  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message,
      icon: 'i-lucide-alert-octagon',
      color: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

watch(() => user.value, (newUser) => {
  console.log(newUser)
  if (newUser) getProfile()
}, { immediate: true })


function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  selectedFile.value = file

  state.avatar_url = URL.createObjectURL(file)
}

function onFileClick() {
  fileRef.value?.click()
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    isLoading.value = true
    let avatarUrl = state.avatar_url

    // A. Upload Avatar jika ada file baru
    if (selectedFile.value) {
      const fileExt = selectedFile.value.name.split('.').pop()
      const fileName = `${user.value!.id}-${Date.now()}.${fileExt}`

      // Pastikan bucket 'avatars' sudah dibuat di Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, selectedFile.value, { upsert: true })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      avatarUrl = urlData.publicUrl
    }

    // B. Update Tabel Profiles
    const updates = {
      id: user.value!.id,
      full_name: event.data.full_name,
      bio: event.data.bio,
      website: event.data.website,
      linkedin_url: event.data.linkedin_url,
      github_url: event.data.github_url,
      twitter_url: event.data.twitter_url,
      phone: event.data.phone,
      location: event.data.location,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase.from('profiles').upsert(updates)
    if (error) throw error

    // C. Sinkronisasi ke Auth Metadata (agar UserMenu update)
    await supabase.auth.updateUser({
      data: {
        full_name: updates.full_name,
        avatar_url: avatarUrl
      }
    })

    toast.add({
      title: 'Berhasil disimpan',
      description: 'Profil Anda telah diperbarui.',
      icon: 'i-lucide-check',
      color: 'success'
    })

    selectedFile.value = null // Reset file selection

  } catch (error: any) {
    toast.add({
      title: 'Gagal menyimpan',
      description: error.message,
      color: 'error',
      icon: 'i-lucide-alert-circle'
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <UForm :schema="schema" :state="state" @submit="onSubmit">
    <UPageCard title="Profile" description="These informations will be displayed publicly." variant="naked"
      orientation="horizontal" class="mb-4">
      <UButton label="Save Changes" color="neutral" type="submit" :loading="isLoading" class="w-fit lg:ms-auto" />
    </UPageCard>

    <UPageCard variant="subtle">
      <!-- Avatar Upload -->
      <UFormField name="avatar_url" label="Avatar" description="Klik untuk mengganti foto profil."
        class="flex max-sm:flex-col justify-between sm:items-center gap-4">
        <div class="flex flex-wrap items-center gap-3">
          <UAvatar :src="state.avatar_url" :alt="state.full_name" size="lg" icon="i-lucide-user" />
          <UButton label="Pilih Foto" color="neutral" variant="outline" @click="onFileClick" />
          <input ref="fileRef" type="file" class="hidden" accept=".jpg, .jpeg, .png, .gif" @change="onFileChange">
        </div>
      </UFormField>
      <USeparator />

      <!-- Basic Info -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UFormField name="full_name" label="Nama Lengkap" required class="w-full">
          <UInput v-model="state.full_name" autocomplete="name" />
        </UFormField>

        <UFormField name="email" label="Email" description="This email is managed through login provider."
          class="w-full">
          <UInput v-model="state.email" type="email" disabled :ui="{ base: 'cursor-not-allowed opacity-75' }" />
        </UFormField>
      </div>

      <USeparator />

      <!-- Contact Info -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UFormField name="phone" label="No. Telepon">
          <UInput v-model="state.phone" icon="i-lucide-phone" />
        </UFormField>
        <UFormField name="location" label="Lokasi">
          <UInput v-model="state.location" icon="i-lucide-map-pin" />
        </UFormField>
      </div>

      <USeparator />

      <!-- Social Links -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UFormField name="website" label="Website">
          <UInput v-model="state.website" icon="i-lucide-globe" placeholder="https://..." />
        </UFormField>
        <UFormField name="github_url" label="GitHub">
          <UInput v-model="state.github_url" icon="i-simple-icons-github" placeholder="https://github.com/..." />
        </UFormField>
        <UFormField name="linkedin_url" label="LinkedIn">
          <UInput v-model="state.linkedin_url" icon="i-simple-icons-linkedin"
            placeholder="https://linkedin.com/in/..." />
        </UFormField>
        <UFormField name="twitter_url" label="Twitter / X">
          <UInput v-model="state.twitter_url" icon="i-simple-icons-x" placeholder="https://twitter.com/..." />
        </UFormField>
      </div>

      <USeparator />

      <!-- Bio -->
      <UFormField name="bio" label="Bio" description="Short description about yourself." class="w-full">
        <UTextarea v-model="state.bio" :rows="4" autoresize class="w-full" />
      </UFormField>
    </UPageCard>
  </UForm>
</template>
