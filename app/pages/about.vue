<script setup lang="ts">
import { useWindowScroll } from '@vueuse/core'

const { y: scrollY } = useWindowScroll()
const parallaxOffset = computed(() => scrollY.value * 0.3)

const stats = [
  { value: '50+', label: 'Projects Completed', icon: 'i-lucide-briefcase' },
  { value: '3+', label: 'Years Experience', icon: 'i-lucide-calendar' },
  { value: '15+', label: 'Technologies', icon: 'i-lucide-code-2' },
  { value: '100%', label: 'Client Satisfaction', icon: 'i-lucide-heart' }
]

const timeline = [
  {
    year: '2024',
    title: 'Senior Full-Stack Developer',
    company: 'Tech Company',
    description: 'Leading development of enterprise applications using modern web technologies.'
  },
  {
    year: '2023',
    title: 'Full-Stack Developer',
    company: 'Startup Inc',
    description: 'Built scalable web applications and mobile apps from scratch.'
  },
  {
    year: '2022',
    title: 'Junior Developer',
    company: 'Digital Agency',
    description: 'Started professional career working on various client projects.'
  }
]

const educations = [
  {
    degree: 'Bachelor of Computer Science',
    institution: 'University Name',
    period: '2018 - 2022',
    description: 'Focused on Software Engineering, Data Structures, and Algorithm Design. Graduated with honors.',
    achievements: [
      'GPA: 3.8/4.0',
      'Best Capstone Project Award',
      'Dean\'s List (All Semesters)'
    ],
    icon: 'i-lucide-graduation-cap'
  },
  {
    degree: 'High School - Science Major',
    institution: 'High School Name',
    period: '2015 - 2018',
    description: 'Specialized in Mathematics and Computer Science. Active in programming competitions.',
    achievements: [
      'Top 10 Graduate',
      'Programming Competition Winner',
      'Science Olympiad Participant'
    ],
    icon: 'i-lucide-school'
  }
]

const certifications = [
  {
    name: 'AWS Certified Developer',
    issuer: 'Amazon Web Services',
    year: '2023',
    icon: 'i-lucide-award'
  },
  {
    name: 'Google Cloud Professional',
    issuer: 'Google Cloud',
    year: '2023',
    icon: 'i-lucide-cloud'
  },
  {
    name: 'Machine Learning Specialization',
    issuer: 'Coursera',
    year: '2022',
    icon: 'i-lucide-brain'
  },
  {
    name: 'Advanced React & Vue.js',
    issuer: 'Udemy',
    year: '2022',
    icon: 'i-lucide-code-2'
  }
]

useSeoMeta({
  title: 'About - Marcellinus Yovian',
  description: 'Learn more about my journey, skills, and experience in software development.'
})
</script>

<template>
  <div class="min-h-screen pt-32 pb-20">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">

      <!-- Hero Section -->
      <section class="mb-24">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <!-- Text Content -->
          <div v-motion-slide-visible-once-left class="space-y-6">
            <div
              class="inline-flex items-center px-4 py-2 rounded-full border border-primary-500/20 bg-primary-500/5 text-primary-400 text-sm font-mono">
              <UIcon name="i-lucide-user" class="size-4 mr-2" />
              About Me
            </div>

            <h1 class="text-4xl sm:text-5xl md:text-6xl font-bold text-white">
              Passionate about
              <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-orange-300">
                creating impact
              </span>
            </h1>

            <div class="space-y-4 text-lg text-zinc-400 leading-relaxed">
              <p>
                I'm a full-stack developer with a passion for building beautiful, functional, and user-centered digital
                experiences. With over 3 years of experience in web and mobile development, I've had the privilege of
                working on diverse projects that challenge me to grow and innovate.
              </p>
              <p>
                My approach combines technical expertise with creative problem-solving, always focusing on delivering
                solutions that make a real difference for users and businesses alike.
              </p>
            </div>

            <div class="flex gap-4 pt-4">
              <UButton to="/projects" color="primary" variant="solid" size="lg" class="rounded-full">
                View Projects
              </UButton>
              <UButton to="/contacts" color="neutral" variant="outline" size="lg" class="rounded-full">
                Get in Touch
              </UButton>
            </div>
          </div>

          <!-- Image/Visual -->
          <div v-motion-slide-visible-once-right class="relative"
            :style="{ transform: `translateY(${parallaxOffset * 0.5}px)` }">
            <div class="relative aspect-square rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800">
              <!-- Placeholder for profile image -->
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="text-center space-y-4">
                  <UIcon name="i-lucide-user-circle" class="size-32 text-zinc-700 mx-auto" />
                  <p class="text-zinc-600 text-sm">Profile Image</p>
                </div>
              </div>

              <!-- Decorative elements -->
              <div class="absolute -top-4 -right-4 w-24 h-24 bg-primary-500/20 rounded-full blur-3xl" />
              <div class="absolute -bottom-4 -left-4 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      <!-- Stats Section -->
      <section class="mb-24">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="(stat, index) in stats" :key="index" v-motion-slide-visible-once-bottom :delay="index * 100"
            class="relative group">
            <div
              class="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800 hover:border-primary-500/30 transition-all duration-300 text-center h-full">
              <div class="mb-4">
                <div class="w-12 h-12 mx-auto bg-primary-500/10 rounded-xl flex items-center justify-center">
                  <UIcon :name="stat.icon" class="size-6 text-primary-400" />
                </div>
              </div>
              <div class="text-3xl font-bold text-white mb-2">{{ stat.value }}</div>
              <div class="text-sm text-zinc-400">{{ stat.label }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Timeline Section -->
      <section class="mb-24">
        <div v-motion-slide-visible-once-bottom class="text-center mb-12 space-y-4">
          <h2 class="text-3xl sm:text-4xl font-bold text-white">My Journey</h2>
          <p class="text-lg text-zinc-400 max-w-2xl mx-auto">
            A timeline of my professional growth and achievements
          </p>
        </div>

        <div class="relative">
          <!-- Timeline line -->
          <div class="absolute left-0 lg:left-1/2 top-0 bottom-0 w-0.5 bg-zinc-800 transform lg:-translate-x-1/2" />

          <!-- Timeline items -->
          <div class="space-y-12">
            <div v-for="(item, index) in timeline" :key="index" v-motion-slide-visible-once-bottom :delay="index * 150"
              class="relative">
              <div class="grid lg:grid-cols-2 gap-8" :class="index % 2 === 0 ? 'lg:gap-8' : 'lg:gap-8'">
                <!-- Left side (or top on mobile) -->
                <div :class="[
                  'lg:text-right',
                  index % 2 === 0 ? 'lg:order-1' : 'lg:order-2'
                ]">
                  <div class="inline-block lg:block">
                    <div
                      class="inline-flex items-center px-4 py-2 rounded-full bg-primary-500/10 text-primary-400 text-sm font-bold mb-4">
                      {{ item.year }}
                    </div>
                  </div>
                </div>

                <!-- Timeline dot -->
                <div class="absolute left-0 lg:left-1/2 transform lg:-translate-x-1/2 -translate-y-1">
                  <div class="w-4 h-4 rounded-full bg-primary-500 ring-4 ring-zinc-950" />
                </div>

                <!-- Right side (or bottom on mobile) -->
                <div :class="[
                  index % 2 === 0 ? 'lg:order-2 pl-8 lg:pl-0' : 'lg:order-1 pl-8 lg:pl-0 lg:text-right'
                ]">
                  <div
                    class="p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800 hover:border-primary-500/30 transition-colors duration-300">
                    <h3 class="text-xl font-bold text-white mb-2">{{ item.title }}</h3>
                    <p class="text-primary-400 mb-3">{{ item.company }}</p>
                    <p class="text-zinc-400">{{ item.description }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Education Section -->
      <section class="mb-24">
        <div v-motion-slide-visible-once-bottom class="text-center mb-12 space-y-4">
          <h2 class="text-3xl sm:text-4xl font-bold text-white">Education</h2>
          <p class="text-lg text-zinc-400 max-w-2xl mx-auto">
            Academic background and continuous learning journey
          </p>
        </div>

        <div class="space-y-8">
          <!-- Education Cards -->
          <div v-for="(edu, index) in educations" :key="index" v-motion-slide-visible-once-bottom :delay="index * 150"
            class="relative group">
            <div
              class="p-8 rounded-2xl bg-zinc-900/30 border border-zinc-800 hover:border-primary-500/30 transition-all duration-300">
              <div class="flex flex-col lg:flex-row gap-6">
                <!-- Icon & Period -->
                <div class="flex-shrink-0">
                  <div class="relative">
                    <div
                      class="absolute inset-0 bg-primary-500/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div
                      class="relative w-16 h-16 bg-zinc-950 rounded-2xl flex items-center justify-center border border-zinc-800 group-hover:border-primary-500/30 transition-colors">
                      <UIcon :name="edu.icon" class="size-8 text-primary-400" />
                    </div>
                  </div>
                  <div class="mt-4 text-center lg:text-left">
                    <div
                      class="inline-flex items-center px-3 py-1 rounded-full bg-zinc-800/50 text-zinc-400 text-xs font-mono">
                      {{ edu.period }}
                    </div>
                  </div>
                </div>

                <!-- Content -->
                <div class="flex-1 space-y-4">
                  <div>
                    <h3 class="text-2xl font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">
                      {{ edu.degree }}
                    </h3>
                    <p class="text-primary-400 font-medium">{{ edu.institution }}</p>
                  </div>

                  <p class="text-zinc-400 leading-relaxed">
                    {{ edu.description }}
                  </p>

                  <!-- Achievements -->
                  <div class="space-y-2">
                    <p class="text-sm font-semibold text-zinc-300">Key Achievements:</p>
                    <ul class="grid sm:grid-cols-2 gap-2">
                      <li v-for="(achievement, achIndex) in edu.achievements" :key="achIndex"
                        class="flex items-start gap-2 text-sm text-zinc-400">
                        <UIcon name="i-lucide-check-circle" class="size-4 text-primary-400 mt-0.5 flex-shrink-0" />
                        <span>{{ achievement }}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Certifications -->
        <div class="mt-12">
          <div v-motion-slide-visible-once-bottom class="text-center mb-8">
            <h3 class="text-2xl font-bold text-white mb-2">Certifications & Courses</h3>
            <p class="text-zinc-400">Professional development and continuous learning</p>
          </div>

          <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div v-for="(cert, index) in certifications" :key="index" v-motion-slide-visible-once-bottom
              :delay="index * 100" class="group relative">
              <div
                class="p-6 rounded-xl bg-zinc-900/20 border border-zinc-800 hover:border-primary-500/30 transition-all duration-300 text-center h-full flex flex-col">
                <div class="mb-4">
                  <div
                    class="w-12 h-12 mx-auto bg-primary-500/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <UIcon :name="cert.icon" class="size-6 text-primary-400" />
                  </div>
                </div>
                <h4 class="font-semibold text-white mb-2 flex-1">{{ cert.name }}</h4>
                <p class="text-sm text-zinc-400 mb-2">{{ cert.issuer }}</p>
                <div
                  class="inline-flex items-center px-3 py-1 rounded-full bg-zinc-800/50 text-zinc-400 text-xs mx-auto">
                  {{ cert.year }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section v-motion-slide-visible-once-bottom
        class="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900/50 to-zinc-950/50">
        <div class="absolute inset-0 bg-grid-pattern opacity-20" />
        <div class="relative z-10 text-center py-16 px-8">
          <h2 class="text-3xl sm:text-4xl font-bold text-white mb-4">
            Let's work together
          </h2>
          <p class="text-lg text-zinc-400 mb-8 max-w-xl mx-auto">
            I'm always open to discussing new projects and opportunities
          </p>
          <UButton to="/contacts" color="primary" variant="solid" size="xl" class="rounded-full"
            trailing-icon="i-lucide-arrow-right">
            Get in Touch
          </UButton>
        </div>
      </section>

    </div>
  </div>
</template>