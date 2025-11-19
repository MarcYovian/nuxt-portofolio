<script setup lang="ts">
const { data: page } = await useAsyncData('index', () => queryCollection('index').first())

if (page.value) {
  const title = page.value.seo?.title || page.value.title
  const description = page.value.seo?.description || page.value.description

  useSeoMeta({
    title,
    description
  })
}

// Typing animation words
const roles = ['Back-end Developer', 'Mobile Developer', 'Full-Stack Developer', 'ML Enthusiast']
const currentRole = ref(0)
const displayText = ref('')
const isDeleting = ref(false)

/**
 * Typing animation effect for the role text.
 * It will either delete the current role text or append the next character to it.
 * If the role text is fully deleted, it will move to the next role text.
 * If the role text is fully appended, it will start deleting it after a short delay.
 */
const typeEffect = () => {
  const current = roles[currentRole.value]

  if (isDeleting.value) {
    displayText.value = current?.substring(0, displayText.value.length - 1) ?? ''

    if (displayText.value === '') {
      isDeleting.value = false
      currentRole.value = (currentRole.value + 1) % roles.length
      setTimeout(typeEffect, 200)
    } else {
      setTimeout(typeEffect, 50)
    }
  } else {
    displayText.value = current?.substring(0, displayText.value.length + 1) ?? ''

    if (displayText.value === current) {
      isDeleting.value = true
      setTimeout(typeEffect, 2000)
    } else {
      setTimeout(typeEffect, 100)
    }
  }
}

onMounted(() => {
  typeEffect()
})

// Skills data
const skillCategories = [
  {
    name: 'Backend Development',
    icon: 'i-lucide-server',
    skills: ['PHP', 'Laravel', 'Node.js', 'Python', 'REST API']
  },
  {
    name: 'Mobile Development',
    icon: 'i-lucide-smartphone',
    skills: ['Flutter', 'React Native', 'iOS', 'Android']
  },
  {
    name: 'Frontend Development',
    icon: 'i-lucide-layout',
    skills: ['Vue.js', 'Nuxt', 'React', 'Tailwind CSS']
  },
  {
    name: 'Machine Learning',
    icon: 'i-lucide-brain',
    skills: ['TensorFlow', 'PyTorch', 'Scikit-learn', 'Computer Vision']
  }
]

// Services data
const services = [
  {
    icon: 'i-lucide-code-2',
    title: 'Web Development',
    description: 'Building responsive and performant web applications using modern frameworks and best practices.',
    features: ['Custom web applications', 'API development', 'Database design', 'Performance optimization']
  },
  {
    icon: 'i-lucide-smartphone',
    title: 'Mobile Development',
    description: 'Creating cross-platform mobile apps that deliver native-like experiences on iOS and Android.',
    features: ['Cross-platform apps', 'Native performance', 'Offline support', 'Push notifications']
  },
  {
    icon: 'i-lucide-brain',
    title: 'Machine Learning',
    description: 'Implementing AI solutions to solve complex problems and automate intelligent decision-making.',
    features: ['Model development', 'Data analysis', 'Computer vision', 'Predictive analytics']
  }
]

// Stats data
const stats = [
  { label: 'Years Experience', value: '1+', icon: 'i-lucide-calendar' },
  { label: 'Projects Completed', value: '5+', icon: 'i-lucide-folder-check' },
  { label: 'Happy Clients', value: '2', icon: 'i-lucide-users' },
  { label: 'Code Commits', value: '500+', icon: 'i-lucide-git-commit' }
]
</script>

<template>
  <div v-if="page" class="min-h-screen">
    <!-- Hero Section -->
    <section class="relative overflow-hidden bg-liner-to-b from-primary/5 via-transparent to-transparent">
      <div class="absolute inset-0 bg-grid-white/5 mask-[linear-gradient(0deg,white,rgba(255,255,255,0.5))]" />

      <UContainer class="py-20 lg:py-32">
        <div class="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <!-- Text Content -->
          <div class="space-y-8 order-2 lg:order-1">
            <div class="space-y-4">
              <UBadge color="primary" variant="subtle" size="lg">
                <UIcon name="i-lucide-sparkles" class="w-4 h-4" />
                Available for Projects
              </UBadge>

              <div>
                <span class="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
                  {{ page.title }}

                  <ClientOnly>
                    <TypingEffect
                      v-if="page.roles"
                      :words="page.roles"
                      class="text-primary-500 dark:text-primary-400"
                    />
                  </ClientOnly>
                </span>
              </div>

              <p class="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                {{ page.description }}
              </p>
            </div>

            <!-- CTA Buttons -->
            <div class="flex flex-wrap gap-4">
              <UButton
                v-for="link in page.hero?.links"
                :key="link.label"
                :to="link.to"
                :color="link.color"
                :variant="link.variant"
                :size="link.size"
                :icon="link.icon"
                :trailing="link.trailing"
              >
                {{ link.label }}
              </UButton>
            </div>

            <!-- Social Links -->
            <div class="flex items-center gap-4 pt-4">
              <span class="text-sm text-gray-500 dark:text-gray-400">Connect with me:</span>
              <div class="flex gap-2">
                <UButton
                  to="https://github.com/MarcYovian"
                  target="_blank"
                  icon="i-lucide-github"
                  color="neutral"
                  variant="ghost"
                  square
                />
                <UButton
                  to="https://linkedin.com/in/marcellinus-yovian-indrastata"
                  target="_blank"
                  icon="i-lucide-linkedin"
                  color="neutral"
                  variant="ghost"
                  square
                />
              </div>
            </div>
          </div>

          <!-- Profile Image -->
          <div class="order-1 lg:order-2 flex justify-center lg:justify-end">
            <div class="relative">
              <!-- Decorative Elements -->
              <div class="absolute -top-4 -left-4 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
              <div class="absolute -bottom-4 -right-4 w-72 h-72 bg-warning/10 rounded-full blur-3xl" />

              <!-- Image Container -->
              <div class="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96">
                <div class="absolute inset-0 rounded-full bg-liner-to-br from-primary/20 to-warning/20 blur-lg" />
                <img
                  src="/images/IMG_0114.jpg"
                  alt="Profile Picture"
                  class="relative w-full h-full object-cover rounded-full border-8 border-white dark:border-gray-900 shadow-2xl"
                >

                <!-- Floating Badge -->
                <div class="absolute -bottom-4 left-1/2 -translate-x-1/2">
                  <UBadge
                    color="success"
                    variant="solid"
                    size="lg"
                    class="shadow-lg"
                  >
                    <UIcon name="i-lucide-check-circle" class="w-4 h-4" />
                    Open to Work
                  </UBadge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- Stats Section -->
    <section class="py-16 bg-gray-50 dark:bg-gray-900/50">
      <UContainer>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-8">
          <div
            v-for="stat in stats"
            :key="stat.label"
            class="text-center"
          >
            <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
              <UIcon :name="stat.icon" class="w-6 h-6 text-primary" />
            </div>
            <div class="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {{ stat.value }}
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              {{ stat.label }}
            </div>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- Skills Section -->
    <section class="py-20 lg:py-32">
      <UContainer>
        <div class="text-center mb-16">
          <UBadge
            color="primary"
            variant="subtle"
            size="lg"
            class="mb-4"
          >
            Technical Expertise
          </UBadge>
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Skills & Technologies
          </h2>
          <p class="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            A comprehensive set of modern technologies and frameworks I work with
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <UCard
            v-for="category in skillCategories"
            :key="category.name"
            :ui="{
              body: 'space-y-4'
            }"
          >
            <div class="flex items-center gap-3">
              <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                <UIcon :name="category.icon" class="w-5 h-5 text-primary" />
              </div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ category.name }}
              </h3>
            </div>

            <div class="flex flex-wrap gap-2">
              <UBadge
                v-for="skill in category.skills"
                :key="skill"
                color="neutral"
                variant="subtle"
              >
                {{ skill }}
              </UBadge>
            </div>
          </UCard>
        </div>
      </UContainer>
    </section>

    <!-- Services Section -->
    <section class="py-20 lg:py-32 bg-gray-50 dark:bg-gray-900/50">
      <UContainer>
        <div class="text-center mb-16">
          <UBadge color="primary" variant="subtle" size="lg">
            What I Offer
          </UBadge>
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Services
          </h2>
          <p class="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Comprehensive development solutions tailored to your needs
          </p>
        </div>

        <div class="grid lg:grid-cols-3 gap-8">
          <UCard
            v-for="service in services"
            :key="service.title"
            :ui="{
              body: 'space-y-6'
            }"
          >
            <div class="space-y-4">
              <div class="flex items-center justify-center w-14 h-14 rounded-xl bg-linear-to-br from-primary/20 to-primary/5">
                <UIcon :name="service.icon" class="w-7 h-7 text-primary" />
              </div>

              <div>
                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {{ service.title }}
                </h3>
                <p class="text-gray-600 dark:text-gray-300">
                  {{ service.description }}
                </p>
              </div>
            </div>

            <ul class="space-y-2">
              <li
                v-for="feature in service.features"
                :key="feature"
                class="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
              >
                <UIcon name="i-lucide-check" class="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>{{ feature }}</span>
              </li>
            </ul>
          </UCard>
        </div>
      </UContainer>
    </section>

    <!-- CTA Section -->
    <section class="py-20 lg:py-32">
      <UContainer>
        <UCard
          :ui="{
            body: 'p-12 sm:p-16'
          }"
        >
          <div class="text-center space-y-6">
            <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
              Let's Work Together
            </h2>
            <p class="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Have a project in mind? Let's discuss how I can help bring your ideas to life
            </p>
            <div class="flex flex-wrap justify-center gap-4 pt-4">
              <UButton
                to="/contacts"
                color="primary"
                size="xl"
                icon="i-lucide-send"
                trailing
              >
                Get in Touch
              </UButton>
              <UButton
                to="/projects"
                color="neutral"
                variant="outline"
                size="xl"
                icon="i-lucide-briefcase"
              >
                View Projects
              </UButton>
            </div>
          </div>
        </UCard>
      </UContainer>
    </section>
  </div>
</template>
