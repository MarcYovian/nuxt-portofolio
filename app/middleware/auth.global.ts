export default defineNuxtRouteMiddleware((to, from) => {
  const user = useSupabaseUser();

  // Jika belum login dan mencoba akses route /admin
  if (!user.value && to.path.startsWith("/admin")) {
    return navigateTo("/auth/login");
  }

  // Jika sudah login dan mencoba akses halaman auth (login/signup)
  if (
    user.value &&
    to.path.startsWith("/auth/") &&
    to.path !== "/auth/forgot-password"
  ) {
    return navigateTo("/admin");
  }
});
