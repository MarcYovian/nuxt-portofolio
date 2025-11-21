<script setup lang="ts">
import { useMouse, useWindowScroll } from '@vueuse/core'

const { data: page } = await useAsyncData('index', () => queryCollection('index').first())

const { x: mouseX, y: mouseY } = useMouse()
const { y: scrollY } = useWindowScroll()

const parallaxOffset = computed(() => scrollY.value * 0.5)
const glowX = computed(() => mouseX.value)
const glowY = computed(() => mouseY.value)

useSeoMeta({
  title: page.value?.title,
  description: page.value?.description
})

const getProjectCategory = (title: string) => {
  const map: Record<string, string> = {
    'Web Development': 'web',
    'Mobile Development': 'mobile',
    'Machine Learning': 'ml',
    'UI/UX Design': 'design',
    'Backend Systems': 'web', // Fallback ke web
    'Cloud Integration': 'web' // Fallback ke web
  }
  // Jika tidak ada di map, default ke 'all'
  return map[title] || 'all'
}
</script>

<template>
  <div v-if="page" class="relative">
    <!-- Hero Section with Parallax -->
    <section class="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <!-- Animated Background -->
      <div class="absolute inset-0 pointer-events-none">
        <!-- Grid Pattern -->
        <div class="absolute inset-0 bg-grid-pattern" :style="{
          transform: `translateY(${parallaxOffset}px)`
        }" />

        <!-- Mouse Glow Effect -->
        <div class="absolute w-96 h-96 rounded-full opacity-20 transition-opacity duration-300 blur-3xl" :style="{
          background: 'radial-gradient(circle, rgba(251, 191, 36, 0.4), transparent 70%)',
          left: `${glowX - 192}px`,
          top: `${glowY - 192}px`,
        }" />

        <!-- Gradient Orbs -->
        <div class="absolute top-20 -left-20 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl"
          v-motion-slide-visible-once-left />
        <div class="absolute bottom-20 -right-20 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"
          v-motion-slide-visible-once-right />
      </div>

      <!-- Content -->
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl relative z-10">
        <div class="max-w-4xl mx-auto text-center space-y-8">
          <!-- Badge -->
          <div v-motion-slide-visible-once-bottom
            class="inline-flex items-center px-4 py-2 rounded-full border border-primary-500/20 bg-primary-500/5 backdrop-blur-sm text-primary-400 text-sm font-mono mx-auto">
            <span class="relative flex h-2 w-2 mr-3">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
              <span class="relative inline-flex rounded-full h-2 w-2 bg-primary-500" />
            </span>
            Available for projects
          </div>

          <!-- Main Heading -->
          <div v-motion-fade class="space-y-4">
            <h1 class="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight">
              <span class="block text-zinc-400 text-2xl sm:text-3xl md:text-4xl mb-4 font-normal">
                Hi, I'm Marcellinus Yovian
              </span>
              <span class="block">
                I craft
                <span class="relative inline-block">
                  <span class="absolute inset-0 bg-gradient-to-r from-primary-400 to-orange-300 blur-2xl opacity-50" />
                  <span class="relative text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-orange-300">
                    digital
                  </span>
                </span>
              </span>
              <span class="block">experiences</span>
            </h1>

            <p class="text-lg sm:text-xl text-zinc-400 leading-relaxed max-w-2xl mx-auto">
              {{ page.description }}
            </p>
          </div>

          <!-- CTA Buttons -->
          <div v-motion-slide-visible-once-bottom :delay="200" class="flex flex-wrap gap-4 justify-center pt-4">
            <UButton to="/projects" size="xl" color="primary" variant="solid" class="rounded-full px-8 group"
              trailing-icon="i-lucide-arrow-right">
              View Work
              <template #trailing>
                <UIcon name="i-lucide-arrow-right" class="group-hover:translate-x-1 transition-transform" />
              </template>
            </UButton>
            <UButton to="/contacts" size="xl" color="neutral" variant="ghost"
              class="rounded-full px-8 hover:bg-zinc-800/50">
              Contact Me
            </UButton>
          </div>

          <!-- Scroll Indicator -->
          <div v-motion-slide-visible-once-bottom :delay="400" class="pt-16 animate-bounce">
            <UIcon name="i-lucide-chevron-down" class="size-6 text-zinc-600" />
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section v-if="page.features" class="py-24 relative">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <div v-motion-slide-visible-once-bottom class="text-center mb-16 space-y-4">
          <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
            {{ page.features.title }}
          </h2>
          <p class="text-lg text-zinc-400 max-w-2xl mx-auto">
            {{ page.features.description }}
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="(item, index) in page.features.items" :key="index" v-motion-slide-visible-once-bottom
            :delay="index * 100" class="group relative">
            <div
              class="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <NuxtLink :to="{ path: '/projects', query: { category: getProjectCategory(item.title) } }"
              class="block relative p-8 rounded-2xl bg-zinc-900/30 border border-zinc-800 hover:border-primary-500/30 transition-all duration-300 h-full group cursor-pointer">
              <!-- Icon -->
              <div class="mb-6 relative">
                <div
                  class="absolute inset-0 bg-primary-500/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <div
                  class="relative w-14 h-14 bg-zinc-950 rounded-xl flex items-center justify-center border border-zinc-800 group-hover:border-primary-500/30 transition-colors">
                  <UIcon :name="item.icon"
                    class="w-7 h-7 text-primary-400 group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>

              <!-- Content -->
              <h3 class="text-xl font-semibold text-white mb-3 group-hover:text-primary-400 transition-colors">
                {{ item.title }}
              </h3>
              <p class="text-zinc-400 leading-relaxed">
                {{ item.description }}
              </p>

              <div
                class="mt-6 flex items-center gap-2 text-primary-400 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-2">
                <span class="text-sm font-medium">View related projects</span>
                <UIcon name="i-lucide-arrow-right" class="w-4 h-4" />
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Skills Section -->
    <section v-if="page.skills" class="py-24 relative overflow-hidden">
      <!-- Background decoration -->
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute top-1/2 left-0 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl -translate-y-1/2" />
        <div class="absolute top-1/2 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl -translate-y-1/2" />
      </div>

      <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl relative z-10">
        <div v-motion-slide-visible-once-bottom class="text-center mb-16 space-y-4">
          <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
            {{ page.skills.title }}
          </h2>
          <p class="text-lg text-zinc-400 max-w-2xl mx-auto">
            {{ page.skills.description }}
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div v-for="(group, index) in page.skills.groups" :key="index" v-motion-slide-visible-once-bottom
            :delay="index * 150" class="relative group">
            <!-- Card -->
            <div
              class="relative p-8 rounded-2xl bg-zinc-900/20 border border-zinc-800 hover:border-primary-500/30 transition-all duration-500 h-full backdrop-blur-sm">
              <!-- Corner decoration -->
              <div
                class="absolute -top-px -left-px w-16 h-16 border-t-2 border-l-2 border-primary-500/20 rounded-tl-2xl group-hover:border-primary-500/50 transition-colors" />
              <div
                class="absolute -bottom-px -right-px w-16 h-16 border-b-2 border-r-2 border-primary-500/20 rounded-br-2xl group-hover:border-primary-500/50 transition-colors" />

              <!-- Title -->
              <h3 class="text-2xl font-semibold text-zinc-200 mb-8 flex items-center gap-3">
                <span class="w-2 h-2 rounded-full bg-primary-500 group-hover:animate-pulse" />
                {{ group.title }}
              </h3>

              <!-- Skills -->
              <div class="flex flex-wrap gap-3">
                <span v-for="(tech, techIndex) in group.items" :key="tech"
                  class="px-4 py-2 text-sm rounded-lg bg-zinc-800/30 text-zinc-400 border border-zinc-700/50 hover:text-white hover:border-primary-500/40 hover:bg-primary-500/5 transition-all duration-300 cursor-default transform hover:scale-105"
                  :style="{
                    transitionDelay: `${techIndex * 50}ms`
                  }">
                  {{ tech }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-32 relative">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <div v-motion-slide-visible-once-bottom
          class="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900/50 to-zinc-950/50 backdrop-blur-sm">
          <!-- Background Pattern -->
          <div class="absolute inset-0 bg-grid-pattern opacity-20" />

          <!-- Content -->
          <div class="relative z-10 text-center py-20 px-8">
            <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to start a project?
            </h2>
            <p class="text-lg text-zinc-400 mb-10 max-w-xl mx-auto">
              Let's turn your ideas into reality. I'm currently available for freelance work.
            </p>
            <UButton to="/contacts" size="xl" color="primary" variant="solid" class="rounded-full px-12 group"
              trailing-icon="i-lucide-send">
              Let's Talk
              <template #trailing>
                <UIcon name="i-lucide-send"
                  class="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </template>
            </UButton>
          </div>

          <!-- Decorative Elements -->
          <div class="absolute top-0 left-0 w-32 h-32 bg-primary-500/20 rounded-full blur-3xl" />
          <div class="absolute bottom-0 right-0 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl" />
        </div>
      </div>
    </section>
  </div>
</template>