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
        <!-- <form
          
          class="flex justify-center gap-y-2 items-center mx-auto flex-col bg-slate-800 p-3 rounded-md"
        >
          <label for="phone" class="text-white"
            >Enter your phone to verify.</label
          >
          
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
        </form> -->
        <div class="container mx-auto">
          <div class="max-w-sm mx-auto md:max-w-lg">
            <div class="w-full">
              <div class="bg-slate-800 h-64 py-3 rounded text-center">
                <h1 class="text-2xl font-bold">OTP Verification</h1>
                <div class="flex flex-col mt-4">
                  <span>Enter the OTP you received</span>
                </div>

                <div id="otp" class="">
                  <form
                    class="flex justify-center items-center mx-auto flex-col mt-2"
                    @submit.prevent="verifyPhoneWithToken"
                  >
                    <input
                      type="number"
                      v-model="phoneVerify"
                      class="border-none ring-2 ring-indigo-600 rounded-md text-black px-7 py-2"
                      placeholder="phone.."
                    />
                    <div
                      class="flex flex-row justify-center text-center px-2 mt-5"
                    >
                      <input
                        class="m-2 border h-10 w-10 text-black text-center form-control rounded"
                        type="text"
                        id="first"
                        v-model="first"
                        maxlength="1"
                      />
                      <input
                        class="m-2 border h-10 w-10 text-black text-center form-control rounded"
                        type="text"
                        v-model="second"
                        id="second"
                        maxlength="1"
                      />
                      <input
                        class="m-2 border h-10 w-10 text-black text-center form-control rounded"
                        type="text"
                        id="third"
                        v-model="third"
                        maxlength="1"
                      />
                      <input
                        class="m-2 border h-10 w-10 text-black text-center form-control rounded"
                        type="text"
                        id="fourth"
                        v-model="fourth"
                        maxlength="1"
                      />
                      <input
                        class="m-2 border h-10 w-10 text-black text-center form-control rounded"
                        type="text"
                        v-model="fifth"
                        id="fifth"
                        maxlength="1"
                      />
                      <input
                        class="m-2 border h-10 w-10 text-black text-center form-control rounded"
                        type="text"
                        v-model="sixth"
                        id="sixth"
                        maxlength="1"
                      />
                    </div>
                    <input
                      type="submit"
                      value="Verify"
                      class="bg-indigo-600 text-white px-14 py-2 rounded-md"
                    />
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
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
    const first = ref("");
    const second = ref("");
    const third = ref("");
    const fourth = ref("");
    const fifth = ref("");
    const sixth = ref("");
    const token = ref(first + second + third + fourth + fifth + sixth);
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
        alert(error.message);
        console.log(error);
      }

      console.log(user, phone.value);
    };
    const verifyPhoneWithToken = async () => {
      const { error, data } = await auth.verifyOtp({
        phone: `+254${phoneVerify.value}`,
        token: token.value,
        type: "sms",
      });
      if (error) {
        alert(error.message);
        console.log(error);
      }
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
      first,
      second,
      third,
      fourth,
      fifth,
      sixth,
    };
  },
};
</script>

<style></style>
