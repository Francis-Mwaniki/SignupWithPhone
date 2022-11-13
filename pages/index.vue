<template>
  <section class="bg-gray-900">
    <section class="flex flex-col md:flex-row h-screen items-center relative">
      <div
        class="bg-slate-900 min-h-screen text-white flex justify-center items-center mx-auto"
      >
        <form
          class="flex justify-center items-center mx-auto flex-col bg-slate-800 p-3 rounded-md"
        >
          <label for="phone" class="text-white">Enter your phone.</label>
          <input
            type="text"
            v-model="phone"
            class="border-none ring-2 ring-indigo-600 rounded-md px-7 py-2"
            placeholder="phone.."
          />
          <input
            type="submit"
            value="Send"
            class="bg-indigo-600 text-white px-8 py-2 rounded-md"
          />
        </form>
      </div>
    </section>
  </section>
</template>

<script>
export default {
  setup() {
    const user = useSupabaseUser();
    const { auth } = useSupabaseClient();
    const open = ref(true);
    const phone = ref("");

    /*     watchEffect(() => {
      if (user.value) {
        navigateTo("/tasks");
      }
    }); */

    const signInWithPhone = async () => {
      const { error } = await auth.signInWithOtp({
        phone: phone.value,
      });
      if (error) throw Error;
    };

    return { user, auth, signInWithPhone, open, phone };
  },
};
</script>

<style></style>
