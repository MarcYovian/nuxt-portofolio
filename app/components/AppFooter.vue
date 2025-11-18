<template>
  <UFooter>
    <template #left>
      <p class="text-muted text-sm">
        Built with ❤️ by Marcellinus Yovian • © {{ new Date().getFullYear() }}
      </p>
    </template>

    <template #right>
      <UButton
        to="https://github.com/MarcYovian"
        target="_blank"
        icon="i-simple-icons-discord"
        aria-label="MarcYovian on Discord"
        color="neutral"
        variant="ghost"
      />
      <UButton
        to="https://www.linkedin.com/in/marcellinus-yovian-indrastata/"
        target="_blank"
        icon="i-simple-icons-linkedin"
        aria-label="MarcYovian on LinkedIn"
        color="neutral"
        variant="ghost"
      />
    </template>
  </UFooter>
</template>
