<template>
  <main class="relative overflow-hidden">
    <section
      class="flex flex-col justify-center antialiased bg-slate-900 text-gray-100 min-h-screen p-4"
    >
      <div class="h-full">
        <div class="max-w-[360px] mx-auto">
          <div class="bg-slate-800 shadow-lg rounded-lg mt-9">
            <header class="text-center px-5 pb-5">
              <h3 class="text-xl font-bold text-gray-100 mb-1">Reset your password</h3>
              <div
                class="bg-red-400 text-white py-2 px-1 border-l-8 border-red-700 rounded-lg"
                v-show="emailErrMsg"
              >
                {{ emailErrMsg }}
              </div>
            </header>

            <div class="bg-gray-700 text-center px-5 py-6">
              <form class="space-y-3" @submit.prevent="UpdatedUser">
                <div
                  class="flex shadow-sm rounded justify-center items-center mx-auto gap-y-2 flex-col"
                >
                  <div class=""></div>
                  <div class="">
                    <input
                      name="card-nr"
                      class="text-sm text-gray-800 bg-white rounded leading-5 py-2 px-3 placeholder-gray-400 w-full border border-transparent focus:border-indigo-300 focus:ring-0"
                      type="text"
                      placeholder=" new password.."
                      aria-label=" new password.."
                    />
                  </div>
                  <div class="">
                    <input
                      name="card-nr"
                      class="text-sm text-gray-800 bg-white rounded leading-5 py-2 px-3 placeholder-gray-400 w-full border border-transparent focus:border-indigo-300 focus:ring-0"
                      type="text"
                      placeholder="confirm password"
                      aria-label="confirm password"
                      v-model="confirmPassword"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  class="font-semibold text-sm inline-flex items-center justify-center text-white px-3 py-2 border border-transparent rounded leading-5 shadow transition duration-150 ease-in-out w-full bg-indigo-500 hover:bg-indigo-600 text-white focus:outline-none focus-visible:ring-2"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div
      x-show="open"
      class="fixed bottom-0 right-0 w-full md:bottom-8 md:right-12 md:w-auto z-60"
      x-data="{ open: true }"
    >
      <div
        class="bg-gray-800 text-gray-50 text-sm p-3 md:rounded shadow-lg flex justify-between"
      >
        <div>
          ????
          <nuxt-link to="/tasks" class="hover:underline ml-1 text-white">Tasks</nuxt-link>
        </div>
        <button class="text-gray-500 hover:text-gray-400 ml-5" @click="open = false">
          <span class="sr-only">Close</span>
          <svg class="w-4 h-4 flex-shrink-0 fill-current" viewBox="0 0 16 16">
            <path
              d="M12.72 3.293a1 1 0 00-1.415 0L8.012 6.586 4.72 3.293a1 1 0 00-1.414 1.414L6.598 8l-3.293 3.293a1 1 0 101.414 1.414l3.293-3.293 3.293 3.293a1 1 0 001.414-1.414L9.426 8l3.293-3.293a1 1 0 000-1.414z"
            />
          </svg>
        </button>
      </div>
    </div>
  </main>
</template>

<script>
import { ref } from "vue";
import { useRouter } from "vue-router";

export default {
  setup() {
    const router = useRouter();
    /*    const client = useSupabaseClient(); */
    const { auth } = useSupabaseClient();
    const user = useSupabaseUser();
    const confirmPassword = ref("");
    const emailErrMsg = ref("");

    const UpdatedUser = async () => {
      const { user, error } = await auth.updateUser({
        password: confirmPassword.value,
      });
      if (error) {
        emailErrMsg.value = error.message;
        setTimeout(() => {
          emailErrMsg.value = "";
        }, 5000);

        console.log(error);
      } else {
        console.log(user);
        router.push("/");
      }
    };
    return {
      user,
      UpdatedUser,
      confirmPassword,
      emailErrMsg,
    };
  },
};
</script>

<style>
.toggle-checkbox:checked {
  @apply: right-0 border-green-400;
  right: 0;
  border-color: #68d391;
}
.toggle-checkbox:checked + .toggle-label {
  @apply: bg-green-400;
  background-color: #68d391;
}
</style>
