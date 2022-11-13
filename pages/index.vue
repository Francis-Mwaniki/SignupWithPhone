<template>
  <section class="bg-gray-900">
    <section class="flex flex-col h-screen items-center relative">
      <div
        class="bg-slate-900 flex-col gap-y-3 min-h-screen px-2 text-white flex justify-center items-center mx-auto"
      >
        <h3 class="flex justify-center items-center mx-auto text-white">
          SignUp with phone.
        </h3>
        <div
          class="bg-red-600 text-white border-l-8 border-red-700 rounded-lg"
          v-show="errMsg"
        >
          {{ errMsg }}
        </div>
        <form
          @submit.prevent="signInWithPhone"
          class="flex justify-center gap-y-2 items-center mx-auto flex-col bg-slate-800 p-3 rounded-md"
        >
          <label for="phone" class="text-white">Enter your phone.</label>
          <input
            type="number"
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
        >
          <h1 class="text-2xl font-bold">OTP Verification</h1>
          <div class="flex flex-col mt-4">
            <span>Enter the OTP you received</span>
          </div>

          <input
            type="number"
            v-model="phone"
            class="border-none ring-2 ring-indigo-600 rounded-md text-black px-7 py-2"
            placeholder="phone.."
          />
          <input
            type="number"
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

    const token = ref("");
    let errMsg = ref("");

    watchEffect(() => {
      if (user.value) {
        navigateTo("/tasks");
      }
    });

    const signInWithPhone = async () => {
      const { user, error } = await auth.signInWithOtp({
        phone: `+254${phone.value}`,
      });
      if (error) {
        errMsg.value = error.message;
        console.log(error);
      } else {
        console.log(user);
      }
    };
    const verifyPhoneWithToken = async () => {
      const { data, error } = await auth.verifyOtp({
        phone: `+254${phone.value}`,
        token: token.value,
        type: "sms",
      });
      if (error) {
        errMsg.value = error.message;
        console.log(error);
      } else {
        console.log(data);
      }
    };

    return {
      user,
      auth,
      signInWithPhone,
      verifyPhoneWithToken,
      token,
      open,
      phone,
    };
  },
};
</script>

<style></style>
