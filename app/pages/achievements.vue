<script setup lang="ts">
// Data Achievements
const { data: achievements } = await useAsyncData('public-achievements', async () => {
  const data = await $fetch<any[]>('/api/achievements')
  return data.map(item => ({
    id: item.id,
    title: item.title,
    organization: item.issuer,
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    description: item.description,
    image: item.image_url,
    type: item.type
  }))
})

useSeoMeta({
  title: 'Achievements - Marcellinus Yovian',
  description: 'A collection of awards, recognitions, and professional milestones.'
})
</script>

<template>
  <div class="min-h-screen pt-32 pb-20">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">

      <!-- Header -->
      <section class="mb-16 text-center">
        <div v-motion-slide-visible-once-bottom class="space-y-6">
          <div
            class="inline-flex items-center px-4 py-2 rounded-full border border-primary-500/20 bg-primary-500/5 text-primary-400 text-sm font-mono">
            <UIcon name="i-lucide-award" class="size-4 mr-2" />
            Milestones
          </div>

          <h1 class="text-4xl sm:text-5xl md:text-6xl font-bold text-white">
            Celebrating
            <span class="text-transparent bg-clip-text bg-linear-to-r from-primary-400 to-orange-300">
              Success
            </span>
          </h1>

          <p class="text-lg text-zinc-400 max-w-2xl mx-auto">
            A timeline of honors, awards, and professional certifications that mark my journey in the tech industry.
          </p>
        </div>
      </section>

      <!-- Achievements Grid -->
      <section class="mb-16">
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="(item, index) in achievements" :key="item.id" v-motion-slide-visible-once-bottom
            :delay="index * 100"
            class="group relative flex flex-col h-full bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden hover:border-primary-500/30 transition-all duration-300 hover:-translate-y-1">

            <!-- Image / Certificate Preview -->
            <div class="relative aspect-video w-full overflow-hidden bg-zinc-950 border-b border-zinc-800/50">
              <img :src="item.image" :alt="item.title" loading="lazy"
                class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100" />

              <!-- Overlay Gradient -->
              <div
                class="absolute inset-0 bg-linear-to-t from-zinc-900/80 via-transparent to-transparent pointer-events-none" />

              <!-- Date Badge on Image -->
              <div class="absolute top-4 right-4">
                <span
                  class="text-xs font-mono text-zinc-200 bg-zinc-950/80 border border-zinc-700/50 backdrop-blur-md px-3 py-1 rounded-full shadow-lg">
                  {{ item.date }}
                </span>
              </div>
            </div>

            <!-- Content -->
            <div class="p-6 flex-1 flex flex-col">
              <div class="mb-4">
                <p class="text-xs font-medium text-primary-400 mb-2 tracking-wide uppercase">
                  {{ item.organization }}
                </p>
                <h3 class="text-xl font-bold text-white group-hover:text-primary-100 transition-colors">
                  {{ item.title }}
                </h3>
              </div>

              <p class="text-zinc-400 text-sm leading-relaxed mb-4 flex-1">
                {{ item.description }}
              </p>

              <!-- Optional: View Certificate Action -->
              <!-- <div class="pt-4 border-t border-zinc-800/50 mt-auto">
                <button class="text-sm text-zinc-300 hover:text-primary-400 flex items-center gap-2 transition-colors">
                  View Credential <UIcon name="i-lucide-external-link" class="size-3" />
                </button>
              </div> -->
            </div>
          </div>
        </div>
      </section>

      <!-- Metrics/Stats Section (Optional decoration) -->
      <section v-motion-slide-visible-once-bottom :delay="300" class="mt-20 border-t border-zinc-800 pt-16">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div class="space-y-2">
            <h4 class="text-4xl font-bold text-white">12+</h4>
            <p class="text-zinc-500 text-sm">Awards Won</p>
          </div>
          <div class="space-y-2">
            <h4 class="text-4xl font-bold text-white">5+</h4>
            <p class="text-zinc-500 text-sm">Certifications</p>
          </div>
          <div class="space-y-2">
            <h4 class="text-4xl font-bold text-white">20+</h4>
            <p class="text-zinc-500 text-sm">Talks Given</p>
          </div>
          <div class="space-y-2">
            <h4 class="text-4xl font-bold text-white">100%</h4>
            <p class="text-zinc-500 text-sm">Dedication</p>
          </div>
        </div>
      </section>

    </div>
  </div>
</template>