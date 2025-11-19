<script setup lang="ts">
const selectedFilter = ref('all')

const filters = [
  { label: 'All Projects', value: 'all' },
  { label: 'Web Apps', value: 'web' },
  { label: 'Mobile Apps', value: 'mobile' },
  { label: 'Machine Learning', value: 'ml' },
  { label: 'UI/UX', value: 'design' }
]

const projects = ref([
  {
    id: 1,
    title: 'E-Commerce Platform',
    category: 'web',
    description: 'A full-featured e-commerce platform built with Nuxt 3, featuring real-time inventory, payment integration, and admin dashboard.',
    image: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=800&q=80',
    tags: ['Nuxt 3', 'Vue.js', 'Tailwind CSS', 'Supabase'],
    featured: true,
    link: '#',
    github: '#'
  },
  {
    id: 2,
    title: 'Fitness Tracking App',
    category: 'mobile',
    description: 'Cross-platform mobile app for tracking workouts, nutrition, and health metrics with beautiful data visualizations.',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80',
    tags: ['Flutter', 'Dart', 'Firebase', 'Charts'],
    featured: true,
    link: '#',
    github: '#'
  },
  {
    id: 3,
    title: 'AI Image Recognition',
    category: 'ml',
    description: 'Machine learning model for image classification and object detection using TensorFlow and Python.',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
    tags: ['Python', 'TensorFlow', 'OpenCV', 'FastAPI'],
    featured: false,
    link: '#',
    github: '#'
  },
  {
    id: 4,
    title: 'Design System',
    category: 'design',
    description: 'Comprehensive design system with reusable components, guidelines, and documentation for consistent UI/UX.',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80',
    tags: ['Figma', 'Vue.js', 'Storybook', 'Design Tokens'],
    featured: false,
    link: '#',
    github: '#'
  },
  {
    id: 5,
    title: 'Task Management System',
    category: 'web',
    description: 'Collaborative task management tool with real-time updates, team collaboration, and progress tracking.',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
    tags: ['Nuxt 3', 'TypeScript', 'WebSocket', 'PostgreSQL'],
    featured: false,
    link: '#',
    github: '#'
  },
  {
    id: 6,
    title: 'Weather Forecast App',
    category: 'mobile',
    description: 'Beautiful weather app with hourly and weekly forecasts, interactive maps, and weather alerts.',
    image: 'https://images.unsplash.com/photo-1592210454359-9043f067919b?w=800&q=80',
    tags: ['Flutter', 'Weather API', 'Maps', 'Animations'],
    featured: false,
    link: '#',
    github: '#'
  }
])

const filteredProjects = computed(() => {
  if (selectedFilter.value === 'all') {
    return projects.value
  }
  return projects.value.filter(project => project.category === selectedFilter.value)
})

const featuredProjects = computed(() => {
  return filteredProjects.value.filter(project => project.featured)
})

const regularProjects = computed(() => {
  return filteredProjects.value.filter(project => !project.featured)
})

useSeoMeta({
  title: 'Projects - Marcellinus Yovian',
  description: 'Explore my portfolio of web applications, mobile apps, and machine learning projects.'
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
            <UIcon name="i-lucide-folder" class="size-4 mr-2" />
            My Work
          </div>

          <h1 class="text-4xl sm:text-5xl md:text-6xl font-bold text-white">
            Featured
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-orange-300">
              Projects
            </span>
          </h1>

          <p class="text-lg text-zinc-400 max-w-2xl mx-auto">
            A collection of projects I've worked on, showcasing my skills in web development, mobile apps, and machine
            learning.
          </p>
        </div>
      </section>

      <!-- Filters -->
      <section class="mb-12">
        <div v-motion-slide-visible-once-bottom :delay="200" class="flex flex-wrap justify-center gap-2">
          <UButton v-for="filter in filters" :key="filter.value" :label="filter.label"
            :variant="selectedFilter === filter.value ? 'solid' : 'ghost'"
            :color="selectedFilter === filter.value ? 'primary' : 'neutral'" class="rounded-full"
            @click="selectedFilter = filter.value" />
        </div>
      </section>

      <!-- Featured Projects -->
      <section v-if="featuredProjects.length > 0" class="mb-16">
        <div class="grid lg:grid-cols-2 gap-8">
          <div v-for="(project, index) in featuredProjects" :key="project.id" v-motion-slide-visible-once-bottom
            :delay="index * 100"
            class="group relative overflow-hidden rounded-2xl bg-zinc-900/30 border border-zinc-800 hover:border-primary-500/30 transition-all duration-500">
            <!-- Image -->
            <div class="relative aspect-video overflow-hidden">
              <img :src="project.image" :alt="project.title"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div class="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/50 to-transparent opacity-60" />

              <!-- Featured Badge -->
              <div class="absolute top-4 right-4">
                <div class="px-3 py-1 rounded-full bg-primary-500 text-white text-xs font-bold">
                  Featured
                </div>
              </div>
            </div>

            <!-- Content -->
            <div class="p-6 space-y-4">
              <h3 class="text-2xl font-bold text-white group-hover:text-primary-400 transition-colors">
                {{ project.title }}
              </h3>

              <p class="text-zinc-400">
                {{ project.description }}
              </p>

              <!-- Tags -->
              <div class="flex flex-wrap gap-2">
                <span v-for="tag in project.tags" :key="tag"
                  class="px-3 py-1 text-xs rounded-lg bg-zinc-800/50 text-zinc-400 border border-zinc-700/50">
                  {{ tag }}
                </span>
              </div>

              <!-- Links -->
              <div class="flex gap-3 pt-2">
                <UButton :to="project.link" color="primary" variant="solid" size="sm" class="rounded-full"
                  trailing-icon="i-lucide-external-link">
                  View Project
                </UButton>
                <UButton :to="project.github" color="neutral" variant="ghost" size="sm" icon="i-lucide-github" square />
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Regular Projects -->
      <section v-if="regularProjects.length > 0">
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="(project, index) in regularProjects" :key="project.id" v-motion-slide-visible-once-bottom
            :delay="index * 100"
            class="group relative overflow-hidden rounded-2xl bg-zinc-900/30 border border-zinc-800 hover:border-primary-500/30 transition-all duration-500 flex flex-col">
            <!-- Image -->
            <div class="relative aspect-video overflow-hidden">
              <img :src="project.image" :alt="project.title"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div class="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/50 to-transparent opacity-60" />
            </div>

            <!-- Content -->
            <div class="p-6 space-y-4 flex-1 flex flex-col">
              <h3 class="text-xl font-bold text-white group-hover:text-primary-400 transition-colors">
                {{ project.title }}
              </h3>

              <p class="text-zinc-400 text-sm flex-1">
                {{ project.description }}
              </p>

              <!-- Tags -->
              <div class="flex flex-wrap gap-2">
                <span v-for="tag in project.tags.slice(0, 3)" :key="tag"
                  class="px-2 py-1 text-xs rounded-md bg-zinc-800/50 text-zinc-400 border border-zinc-700/50">
                  {{ tag }}
                </span>
              </div>

              <!-- Links -->
              <div class="flex gap-2">
                <UButton :to="project.link" color="neutral" variant="outline" size="sm" class="flex-1 rounded-full"
                  trailing-icon="i-lucide-arrow-right">
                  View
                </UButton>
                <UButton :to="project.github" color="neutral" variant="ghost" size="sm" icon="i-lucide-github" square />
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Empty State -->
      <section v-if="filteredProjects.length === 0" v-motion-slide-visible-once-bottom class="text-center py-20">
        <UIcon name="i-lucide-folder-x" class="size-20 text-zinc-700 mx-auto mb-4" />
        <p class="text-zinc-400 text-lg">No projects found in this category</p>
      </section>

      <!-- CTA -->
      <section v-motion-slide-visible-once-bottom
        class="mt-20 relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900/50 to-zinc-950/50">
        <div class="absolute inset-0 bg-grid-pattern opacity-20" />
        <div class="relative z-10 text-center py-16 px-8">
          <h2 class="text-3xl sm:text-4xl font-bold text-white mb-4">
            Have a project in mind?
          </h2>
          <p class="text-lg text-zinc-400 mb-8 max-w-xl mx-auto">
            Let's discuss how we can bring your ideas to life
          </p>
          <UButton to="/contacts" color="primary" variant="solid" size="xl" class="rounded-full"
            trailing-icon="i-lucide-send">
            Start a Conversation
          </UButton>
        </div>
      </section>

    </div>
  </div>
</template>