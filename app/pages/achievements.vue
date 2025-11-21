<script setup lang="ts">
// Data Achievements
// Gunakan URL gambar sertifikat asli Anda di sini.
// Untuk saat ini saya menggunakan placeholder dari Unsplash yang relevan dengan teknologi/sertifikat.
const achievements = [
  {
    id: 1,
    title: 'Winner of National Hackathon 2023',
    organization: 'Tech Ministry Indonesia',
    date: 'November 2023',
    description: 'Secured 1st place out of 500+ teams by building an AI-powered disaster response application using Nuxt and Python.',
    image: 'https://images.unsplash.com/photo-1561489413-985b06da5bee?w=800&q=80' // Placeholder: Trophy/Certificate vibe
  },
  {
    id: 2,
    title: 'Best UI/UX Design Award',
    organization: 'Dribbble Meetup Jakarta',
    date: 'August 2023',
    description: 'Awarded for the most innovative and accessible mobile app interface design for a fintech startup case study.',
    image: 'https://images.unsplash.com/photo-1576267423445-b2e0074d68a4?w=800&q=80' // Placeholder: Design award vibe
  },
  {
    id: 3,
    title: 'Open Source Contributor',
    organization: 'Nuxt Framework',
    date: '2022 - Present',
    description: 'Active contributor to the Nuxt ecosystem, creating modules and fixing bugs to help the community grow.',
    image: 'https://images.unsplash.com/photo-1607799275518-d58665d099db?w=800&q=80' // Placeholder: Coding/GitHub vibe
  },
  {
    id: 4,
    title: 'Top Rated Freelancer',
    organization: 'Upwork',
    date: '2022',
    description: 'Achieved Top Rated status with 100% Job Success Score, delivering high-quality full-stack solutions to global clients.',
    image: 'https://images.unsplash.com/photo-1553877602-b9c10e66862d?w=800&q=80' // Placeholder: Professional success
  },
  {
    id: 5,
    title: 'Speaker at VueConf ID',
    organization: 'Vue.js Indonesia',
    date: 'June 2022',
    description: 'Delivered a talk on "Optimizing Performance in Large Scale Vue Applications" to an audience of 300+ developers.',
    image: 'https://images.unsplash.com/photo-1544531586-fde5298cdd40?w=800&q=80' // Placeholder: Speaker/Conference
  },
  {
    id: 6,
    title: 'Google Cloud Certified',
    organization: 'Google',
    date: 'January 2022',
    description: 'Earned the Professional Cloud Architect certification, demonstrating expertise in designing and managing robust cloud solutions.',
    image: 'https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?w=800&q=80' // Placeholder: Tech/Cloud
  }
]

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
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-orange-300">
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
                class="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-transparent to-transparent pointer-events-none" />

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