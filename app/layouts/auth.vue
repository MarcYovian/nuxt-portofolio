<script setup lang="ts">
// Layout ini khusus untuk halaman autentikasi (Login/Register)
// Fokus: Centering content & Background estetik
</script>

<template>
    <div class="min-h-screen bg-zinc-950 flex flex-col items-center justify-center relative overflow-hidden p-4">

        <!-- Background Effects -->
        <SpotlightEffect />
        <div class="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />

        <!-- Decorative Orbs (Glow di belakang card) -->
        <div
            class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-500/5 rounded-full blur-3xl pointer-events-none" />

        <!-- Back Button (Pojok Kiri Atas) -->
        <div class="absolute top-6 left-6 z-20">
            <UButton to="/" icon="i-lucide-arrow-left" color="neutral" variant="ghost" label="Back to Home"
                class="text-zinc-400 hover:text-white" />
        </div>

        <!-- Main Card Wrapper -->
        <div class="w-full max-w-sm relative z-10">
            <!-- Efek Glassmorphism pada Card -->
            <div
                class="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl p-8 relative overflow-hidden group">

                <!-- Border Top Highlight (Aksen kecil) -->
                <div
                    class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary-500/50 to-transparent opacity-50" />

                <!-- Slot untuk konten Login/Register -->
                <slot />

            </div>

            <!-- Footer Text (Copyright/Links) -->
            <div class="text-center mt-6 text-xs text-zinc-500">
                &copy; {{ new Date().getFullYear() }} MarcellinusYovian. All rights reserved.
            </div>
        </div>

    </div>
</template>