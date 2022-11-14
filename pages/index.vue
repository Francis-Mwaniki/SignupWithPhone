<template>
  <section class="bg-gray-900 flex justify-center flex-col items-center mx-auto">
    <section class="flex flex-col items-center justify-center relative">
      <div
        class="bg-slate-900 flex-col gap-y-3 min-h-screen px-2 text-white flex mx-auto"
      >
        <h1
          class="text-2xl font-bold text-white mt-1 flex justify-center items-center mx-auto"
        >
          SignUp with phone.
        </h1>
        <div
          class="bg-red-400 text-white py-2 px-1 border-l-8 border-red-700 rounded-lg"
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
            class="bg-indigo-600 cursor-pointer text-white px-14 py-2 rounded-md"
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
            class="bg-indigo-600 cursor-pointer text-white px-14 py-2 rounded-md"
          />
        </form>
        <!-- EMAIL AUTH -->
        <section class="flex flex-col items-center justify-center mx-auto bg-slate-900">
          <div
            class="bg-slate-900 flex-col gap-y-3 min-h-screen px-2 text-white flex mx-auto"
          >
            <h1
              class="text-2xl font-bold text-white mt-1 flex justify-center items-center mx-auto"
            >
              OR
            </h1>
            <h1
              class="text-2xl font-bold text-white mt-1 flex justify-center items-center mx-auto"
            >
              SignUp with Email.
            </h1>
            <div
              class="bg-red-400 text-white py-2 px-1 border-l-8 border-red-700 rounded-lg"
              v-show="emailErrMsg"
            >
              {{ emailErrMsg }}
            </div>
            <div
              class="bg-blue-400 text-white py-2 px-1 border-l-8 border-indigo-700 rounded-lg"
              v-show="emailSuccess"
            >
              {{ emailSuccess }}
            </div>
            <form
              @submit.prevent="signInWithEmail"
              class="flex justify-center gap-y-2 items-center mx-auto flex-col bg-slate-800 p-3 rounded-md"
            >
              <label for="phone" class="text-white">Enter your email.</label>
              <input
                type="email"
                v-model="email"
                autocomplete
                class="border-none ring-2 ring-indigo-600 rounded-md text-black px-7 py-2"
                placeholder="email.."
              />
              <label for="password" class="text-white">Enter your password.</label>
              <input
                type="password"
                v-model="password"
                class="border-none ring-2 ring-indigo-600 rounded-md text-black px-7 py-2"
                placeholder="password.."
              />
              <input
                type="submit"
                value="Send"
                class="bg-indigo-600 text-white cursor-pointer px-14 py-2 rounded-md"
              />
            </form>
            <form
              @submit.prevent="verifyEmail"
              class="flex justify-center gap-y-2 items-center mx-auto flex-col bg-slate-800 p-3 rounded-md"
            >
              <h1 class="text-2xl font-bold">Email Verification</h1>

              <input
                type="email"
                v-model="confirmEmail"
                class="border-none ring-2 ring-indigo-600 rounded-md text-black px-7 py-2"
                placeholder="email.."
              />
              <input
                type="password"
                v-model="confirmPassword"
                class="border-none ring-2 ring-indigo-600 rounded-md text-black px-7 py-2"
                placeholder="your password."
              />
              <input
                type="submit"
                value="Verify"
                class="bg-indigo-600 cursor-pointer text-white px-14 py-2 rounded-md"
              />
            </form>
            <div
              class="bg-gray-800 flex-col p-2 rounded-sm text-white flex justify-center mb-3 items-center mx-auto"
            >
              <h1
                class="text-lg font-bold text-white mt-1 flex justify-center items-center mx-auto"
              >
                forgot password? reset.
                <span class="text-sm italic">(coming soon!)</span>
              </h1>
              <div
                class="bg-red-400 text-white py-2 px-1 border-l-8 border-red-700 rounded-lg"
                v-show="emailErrMsg"
              >
                {{ emailErrMsg }}
              </div>
              <form
                @submit.prevent="resetPasswordWithMail"
                class="flex justify-center gap-y-2 items-center mx-auto flex-col bg-slate-800 p-3 rounded-md"
              >
                <input
                  type="email"
                  v-model="emailReset"
                  class="border-none ring-2 ring-indigo-600 rounded-md text-black px-7 py-2"
                  placeholder="email.."
                />

                <input
                  type="submit"
                  value="Reset"
                  class="no-underline px-7 py-2 cursor-pointer bg-indigo-600 rounded-lg text-indigo-100"
                />
              </form>
            </div>
          </div>
        </section>
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
    let emailSuccess = ref("");
    const newPassword = ref("");
    const loading = ref(false);
    const phoneVerify = ref("");
    const emailReset = ref("");
    const emailErrMsg = ref("");
    const email = ref("");
    const confirmEmail = ref("");
    const password = ref("");
    let confirmPassword = ref("");

    watchEffect(() => {
      if (user.value) {
        navigateTo("/tasks");
      }
    });

    const signInWithPhone = async () => {
      loading.value = true;
      const { data, error } = await auth.signInWithOtp({
        phone: `+254${phone.value}`,
      });
      if (error) {
        loading.value = false;
        errMsg.value = error.message;
        setTimeout(() => {
          errMsg.value = "";
        }, 5000);

        console.log(error);
      } else {
        console.log(data);
      }
    };
    const signInWithEmail = async () => {
      loading.value = true;
      const { user, error } = await auth.signUp({
        email: email.value,
        password: password.value,
      });
      if (error) {
        loading.value = false;
        emailErrMsg.value = error.message;
        setTimeout(() => {
          emailErrMsg.value = "";
        }, 5000);

        console.log(error);
      } else {
        loading.value = false;
        emailSuccess.value = "VERIFY! your email to continue to login!";
        email.value = "";
        password.value = "";
        console.log(user);
      }
    };
    const verifyEmail = async () => {
      loading.value = true;
      const { user, error } = await auth.signInWithPassword({
        email: confirmEmail.value,
        password: confirmPassword.value,
      });
      if (error) {
        loading.value = false;
        emailErrMsg.value = error.message;
        setTimeout(() => {
          emailErrMsg.value = "";
        }, 5000);

        console.log(error);
      } else {
        console.log(user);
      }
    };
    const verifyPhoneWithToken = async () => {
      const { data, error } = await auth.verifyOtp({
        phone,
        token,
        type: "sms",
      });
      if (error) {
        console.log(error);
      } else {
        console.log(data);
      }
    };
    const resetPasswordWithMail = async () => {
      loading.value = true;
      /*  const { data, error } = await auth.resetPasswordForEmail(emailReset.value, {
        redirectTo: "https://google.com",
      });
      if (error) {
        emailErrMsg.value = error.message;
        setTimeout(() => {
          emailErrMsg.value = "";
        }, 5000);
        console.log(error);
      } else {
        auth.onAuthStateChange((event, session) => {
          if (event == "PASSWORD_RECOVERY") console.log("PASSWORD_RECOVERY", session);
        });
      } */
      /**
       * Step 1: Send the user an email to get a password reset token.
       * This email contains a link which sends the user back to your application.
       */
      const { data, error } = await auth.resetPasswordForEmail(emailReset.value, {
        redirectTo:
          "https://bcpxyrcfxzdmxjqggixm.supabase.co/auth/v1/callback/ResetPassword/",
      });
      if (error) {
        loading.value = false;
        emailErrMsg.value = error.message;
        setTimeout(() => {
          emailErrMsg.value = "";
        }, 5000);
        console.log(error);
      }

      console.log(data);
      /**
       * Step 2: Once the user is redirected back to your application,
       * ask the user to reset their password.
       */
    };

    return {
      user,
      auth,
      newPassword,
      signInWithPhone,
      verifyPhoneWithToken,
      token,
      open,
      emailSuccess,
      emailErrMsg,
      emailReset,
      loading,
      phone,
      phoneVerify,
      errMsg,
      email,
      signInWithEmail,
      verifyEmail,
      confirmEmail,
      password,
      confirmPassword,
      resetPasswordWithMail,
    };
  },
};
</script>

<style></style>
