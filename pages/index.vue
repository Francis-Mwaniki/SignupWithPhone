<template>
  <section class="bg-gray-900">
    <section class="flex flex-col h-screen items-center relative">
      <div
        class="bg-slate-900 flex-col gap-y-3 min-h-screen px-2 text-white flex justify-center items-center mx-auto"
      >
        <h3 class="flex justify-center items-center mx-auto text-white">
          SignUp with phone.
        </h3>
        <form
          @submit.prevent="signInWithPhone"
          class="flex justify-center gap-y-2 items-center mx-auto flex-col bg-slate-800 p-3 rounded-md"
        >
          <label for="phone" class="text-white">Enter your phone.</label>
          <input
            type="text"
            v-model="phone"
            class="border-none ring-2 ring-indigo-600 rounded-md text-black px-7 py-2"
            placeholder="phone.."
          />
          <input
            type="submit"
            value="Send"
            class="bg-indigo-600 text-white px-14 py-2 rounded-md"
          />
        </form>
        <form
          @submit.prevent="verifyPhoneWithToken"
          class="flex justify-center gap-y-2 items-center mx-auto flex-col bg-slate-800 p-3 rounded-md"
          v-show="user"
        >
          <label for="phone" class="text-white"
            >Enter your phone to verify.</label
          >
          <input
            type="text"
            v-model="phoneVerify"
            class="border-none ring-2 ring-indigo-600 rounded-md text-black px-7 py-2"
            placeholder="phone.."
          />
          <input
            type="text"
            v-model="token"
            class="border-none ring-2 ring-indigo-600 rounded-md text-black px-7 py-2"
            placeholder="your token."
          />
          <input
            type="submit"
            value="Verify"
            class="bg-indigo-600 text-white px-14 py-2 rounded-md"
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
    const phoneVerify = ref("");
    const token = ref("");

    watchEffect(() => {
      if (user.value) {
        navigateTo("/tasks");
      }
    });

    const signInWithPhone = async () => {
      const { error, data } = await auth.signInWithOtp({
        phone: phone.value,
      });
      if (error) throw Error;
      console.log(data);
    };
    const verifyPhoneWithToken = async () => {
      const { error, data } = await auth.verifyOtp({
        phone: phoneVerify.value,
        token: token.value,
      });
      if (error) throw Error;
      console.log(data);
    };

    return {
      user,
      auth,
      signInWithPhone,
      verifyPhoneWithToken,
      token,
      open,
      phone,
      phoneVerify,
    };
  },
};
</script>

<style></style>
