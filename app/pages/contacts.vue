<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

// Schema Validation
const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters')
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  name: undefined,
  email: undefined,
  subject: undefined,
  message: undefined
})

const isLoading = ref(false)
const toast = useToast()

async function onSubmit(event: FormSubmitEvent<Schema>) {
  isLoading.value = true
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1500))

  console.log(event.data)
  isLoading.value = false

  toast.add({
    title: 'Message Sent!',
    description: 'Thanks for reaching out. I will get back to you soon.',
    icon: 'i-lucide-check-circle',
    color: 'success'
  })

  // Reset form
  state.name = undefined
  state.email = undefined
  state.subject = undefined
  state.message = undefined
}

const contactInfo = [
  {
    label: 'Email',
    value: 'hello@marcyovian.dev',
    icon: 'i-lucide-mail',
    href: 'mailto:hello@marcyovian.dev'
  },
  {
    label: 'LinkedIn',
    value: 'Marcellinus Yovian',
    icon: 'i-simple-icons-linkedin',
    href: 'https://www.linkedin.com/in/marcellinus-yovian-indrastata/'
  },
  {
    label: 'GitHub',
    value: 'MarcYovian',
    icon: 'i-simple-icons-github',
    href: 'https://github.com/MarcYovian'
  },
  {
    label: 'Location',
    value: 'Indonesia',
    icon: 'i-lucide-map-pin',
    href: null
  }
]

useSeoMeta({
  title: 'Contact - Marcellinus Yovian',
  description: 'Get in touch for collaborations, freelance work, or just to say hi.'
})
</script>

<template>
  <div class="min-h-screen pt-32 pb-20 relative">
    <!-- Background Decorations -->
    <div
      class="absolute top-1/4 left-0 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl -translate-x-1/2 pointer-events-none" />
    <div
      class="absolute bottom-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl translate-x-1/2 pointer-events-none" />

    <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">

      <!-- Header -->
      <section class="mb-16 text-center">
        <div v-motion-slide-visible-once-bottom class="space-y-6">
          <div
            class="inline-flex items-center px-4 py-2 rounded-full border border-primary-500/20 bg-primary-500/5 text-primary-400 text-sm font-mono">
            <UIcon name="i-lucide-send" class="size-4 mr-2" />
            Get in Touch
          </div>

          <h1 class="text-4xl sm:text-5xl md:text-6xl font-bold text-white">
            Let's work
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-orange-300">
              Together
            </span>
          </h1>

          <p class="text-lg text-zinc-400 max-w-2xl mx-auto">
            Have a project in mind or want to discuss a potential partnership?
            Fill out the form below or reach out directly via social media.
          </p>
        </div>
      </section>

      <div class="grid lg:grid-cols-3 gap-8 lg:gap-12">
        <!-- Contact Info (Left Column) -->
        <div v-motion-slide-visible-once-left class="space-y-8">
          <div class="p-8 rounded-2xl bg-zinc-900/30 border border-zinc-800 backdrop-blur-sm">
            <h3 class="text-xl font-bold text-white mb-6">Contact Information</h3>
            <div class="space-y-6">
              <div v-for="(item, index) in contactInfo" :key="index" class="flex items-start gap-4 group">
                <div
                  class="p-3 rounded-lg bg-zinc-800/50 text-primary-400 group-hover:bg-primary-500/10 group-hover:scale-110 transition-all duration-300">
                  <UIcon :name="item.icon" class="size-5" />
                </div>
                <div>
                  <p class="text-sm text-zinc-500 mb-0.5">{{ item.label }}</p>
                  <component :is="item.href ? 'a' : 'p'" :href="item.href" target="_blank"
                    class="text-zinc-200 font-medium"
                    :class="item.href ? 'hover:text-primary-400 transition-colors' : ''">
                    {{ item.value }}
                  </component>
                </div>
              </div>
            </div>
          </div>

          <!-- Availability Card -->
          <div class="p-6 rounded-2xl border border-primary-500/20 bg-primary-500/5">
            <div class="flex items-center gap-3 mb-3">
              <span class="relative flex h-3 w-3">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
                <span class="relative inline-flex rounded-full h-3 w-3 bg-primary-500" />
              </span>
              <h4 class="font-bold text-white">Available for Freelance</h4>
            </div>
            <p class="text-sm text-zinc-400">
              Currently accepting new projects starting from next month. Let's schedule a call to discuss your
              requirements.
            </p>
          </div>
        </div>

        <!-- Contact Form (Right Column - Spans 2 cols) -->
        <div v-motion-slide-visible-once-right class="lg:col-span-2">
          <div class="p-8 rounded-2xl bg-zinc-900/30 border border-zinc-800 backdrop-blur-sm relative overflow-hidden">
            <!-- Form Background Glow -->
            <div
              class="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <UForm :schema="schema" :state="state" class="space-y-6 relative z-10" @submit="onSubmit">
              <div class="grid md:grid-cols-2 gap-6">
                <UFormField label="Name" name="name" required>
                  <UInput v-model="state.name" placeholder="John Doe" size="lg" icon="i-lucide-user" class="w-full" />
                </UFormField>

                <UFormField label="Email" name="email" required>
                  <UInput v-model="state.email" type="email" placeholder="john@example.com" size="lg"
                    icon="i-lucide-mail" class="w-full" />
                </UFormField>
              </div>

              <UFormField label="Subject" name="subject" required>
                <UInput v-model="state.subject" placeholder="Project Collaboration" size="lg" icon="i-lucide-tag"
                  class="w-full" />
              </UFormField>

              <UFormField label="Message" name="message" required>
                <UTextarea v-model="state.message" placeholder="Tell me about your project..." :rows="6" size="lg"
                  class="w-full" />
              </UFormField>

              <div class="pt-2">
                <UButton type="submit" size="xl" block :loading="isLoading" color="primary" variant="solid"
                  class="font-bold transition-all hover:scale-[1.01]">
                  Send Message
                  <template #trailing>
                    <UIcon name="i-lucide-send" />
                  </template>
                </UButton>
              </div>
            </UForm>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>