import { _ as _export_sfc, a as useSupabaseUser, u as useSupabaseClient, n as navigateTo } from '../server.mjs';
import { ref, watchEffect, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderStyle, ssrInterpolate, ssrRenderAttr, ssrRenderClass, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import 'ohmyfetch';
import 'ufo';
import 'hookable';
import 'unctx';
import 'vue-router';
import 'destr';
import 'h3';
import 'defu';
import '@vue/shared';
import 'cookie-es';
import 'ohash';
import 'unenv/runtime/npm/cross-fetch';
import 'events';
import 'unenv/runtime/npm/debug';
import 'util';
import 'crypto';
import 'url';
import 'bufferutil';
import 'buffer';
import 'utf-8-validate';
import 'http';
import 'https';
import 'typedarray-to-buffer';
import 'yaeti';
import '../../nitro/node-server.mjs';
import 'node-fetch-native/polyfill';
import 'radix3';
import 'unenv/runtime/fetch/index';
import 'scule';
import 'unstorage';
import 'fs';
import 'pathe';

const _sfc_main = {
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
      const { user: user2, error } = await auth.signInWithOtp({
        phone: `+254${phone.value}`
      });
      if (error) {
        loading.value = false;
        errMsg.value = error.message;
        setTimeout(() => {
          errMsg.value = "";
        }, 5e3);
        console.log(error);
      } else {
        console.log(user2);
      }
    };
    const signInWithEmail = async () => {
      loading.value = true;
      const { user: user2, error } = await auth.signUp({
        email: email.value,
        password: password.value
      });
      if (error) {
        loading.value = false;
        emailErrMsg.value = error.message;
        setTimeout(() => {
          emailErrMsg.value = "";
        }, 5e3);
        console.log(error);
      } else {
        loading.value = false;
        emailSuccess.value = "VERIFY! your email to continue to login!";
        email.value = "";
        password.value = "";
        console.log(user2);
      }
    };
    const verifyEmail = async () => {
      loading.value = true;
      const { user: user2, error } = await auth.signInWithPassword({
        email: confirmEmail.value,
        password: confirmPassword.value
      });
      if (error) {
        loading.value = false;
        emailErrMsg.value = error.message;
        setTimeout(() => {
          emailErrMsg.value = "";
        }, 5e3);
        console.log(error);
      } else {
        console.log(user2);
      }
    };
    const verifyPhoneWithToken = async () => {
      loading.value = true;
      const { data, error } = await auth.verifyOtp({
        phone: `+254${phone.value}`,
        token: token.value,
        type: "sms"
      });
      if (error) {
        loading.value = false;
        errMsg.value = error.message;
        setTimeout(() => {
          errMsg.value = "";
        }, 5e3);
        console.log(error);
      } else {
        console.log(data);
      }
    };
    const resetPasswordWithMail = async () => {
      loading.value = true;
      const { data, error } = await auth.resetPasswordForEmail(emailReset.value, {
        redirectTo: "https://bcpxyrcfxzdmxjqggixm.supabase.co/auth/v1/callback/ResetPassword/"
      });
      if (error) {
        loading.value = false;
        emailErrMsg.value = error.message;
        setTimeout(() => {
          emailErrMsg.value = "";
        }, 5e3);
        console.log(error);
      }
      console.log(data);
    };
    watchEffect(() => {
      auth.onAuthStateChange(async (event, session) => {
        if (event == "PASSWORD_RECOVERY") {
          const newPassword2 = prompt("What would you like your new password to be?");
          const { data, error } = await auth.updateUser({
            password: newPassword2
          });
          if (data)
            alert("Password updated successfully!");
          if (error)
            alert("There was an error updating your password.");
        }
      });
    }, []);
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
      errMsg,
      email,
      signInWithEmail,
      verifyEmail,
      confirmEmail,
      password,
      confirmPassword,
      resetPasswordWithMail
    };
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<section${ssrRenderAttrs(mergeProps({ class: "bg-gray-900 flex justify-center flex-col items-center mx-auto" }, _attrs))}><section class="flex flex-col items-center justify-center relative"><div class="bg-slate-900 flex-col gap-y-3 min-h-screen px-2 text-white flex mx-auto"><h1 class="text-2xl font-bold text-white mt-1 flex justify-center items-center mx-auto"> SignUp with phone. </h1><div class="bg-red-400 text-white py-2 px-1 border-l-8 border-red-700 rounded-lg" style="${ssrRenderStyle($setup.errMsg ? null : { display: "none" })}">${ssrInterpolate($setup.errMsg)}</div><form class="flex justify-center gap-y-2 items-center mx-auto flex-col bg-slate-800 p-3 rounded-md"><label for="phone" class="text-white">Enter your phone.</label><input type="number"${ssrRenderAttr("value", $setup.phone)} class="border-none ring-2 ring-indigo-600 rounded-md text-black px-7 py-2" placeholder="phone.."><input type="submit" value="Send" class="${ssrRenderClass([[$setup.loading ? "submitting.." : "submit"], "bg-indigo-600 text-white px-14 py-2 rounded-md"])}"${ssrIncludeBooleanAttr($setup.loading) ? " disabled" : ""}></form><form class="flex justify-center gap-y-2 items-center mx-auto flex-col bg-slate-800 p-3 rounded-md"><h1 class="text-2xl font-bold">OTP Verification</h1><div class="flex flex-col mt-4"><span>Enter the OTP you received</span></div><input type="number"${ssrRenderAttr("value", $setup.phone)} class="border-none ring-2 ring-indigo-600 rounded-md text-black px-7 py-2" placeholder="phone.."><input type="number"${ssrRenderAttr("value", $setup.token)} class="border-none ring-2 ring-indigo-600 rounded-md text-black px-7 py-2" placeholder="your token."><input type="submit" value="Verify" class="${ssrRenderClass([[$setup.loading ? "verifying.." : "submit"], "bg-indigo-600 text-white px-14 py-2 rounded-md"])}"${ssrIncludeBooleanAttr($setup.loading) ? " disabled" : ""}></form><section class="flex flex-col items-center justify-center mx-auto bg-slate-900"><div class="bg-slate-900 flex-col gap-y-3 min-h-screen px-2 text-white flex mx-auto"><h1 class="text-2xl font-bold text-white mt-1 flex justify-center items-center mx-auto"> OR </h1><h1 class="text-2xl font-bold text-white mt-1 flex justify-center items-center mx-auto"> SignUp with Email. </h1><div class="bg-red-400 text-white py-2 px-1 border-l-8 border-red-700 rounded-lg" style="${ssrRenderStyle($setup.emailErrMsg ? null : { display: "none" })}">${ssrInterpolate($setup.emailErrMsg)}</div><div class="bg-blue-400 text-white py-2 px-1 border-l-8 border-indigo-700 rounded-lg" style="${ssrRenderStyle($setup.emailSuccess ? null : { display: "none" })}">${ssrInterpolate($setup.emailSuccess)}</div><form class="flex justify-center gap-y-2 items-center mx-auto flex-col bg-slate-800 p-3 rounded-md"><label for="phone" class="text-white">Enter your email.</label><input type="email"${ssrRenderAttr("value", $setup.email)} autocomplete class="border-none ring-2 ring-indigo-600 rounded-md text-black px-7 py-2" placeholder="email.."><label for="password" class="text-white">Enter your password.</label><input type="password"${ssrRenderAttr("value", $setup.password)} class="border-none ring-2 ring-indigo-600 rounded-md text-black px-7 py-2" placeholder="password.."><input type="submit" value="Send"${ssrIncludeBooleanAttr($setup.loading) ? " disabled" : ""} class="${ssrRenderClass([[$setup.loading ? "submitting.." : "submit"], "bg-indigo-600 text-white px-14 py-2 rounded-md"])}"></form><form class="flex justify-center gap-y-2 items-center mx-auto flex-col bg-slate-800 p-3 rounded-md"><h1 class="text-2xl font-bold">Email Verification</h1><input type="email"${ssrRenderAttr("value", $setup.confirmEmail)} class="border-none ring-2 ring-indigo-600 rounded-md text-black px-7 py-2" placeholder="email.."><input type="password"${ssrRenderAttr("value", $setup.confirmPassword)} class="border-none ring-2 ring-indigo-600 rounded-md text-black px-7 py-2" placeholder="your password."><input type="submit" value="Verify"${ssrIncludeBooleanAttr($setup.loading) ? " disabled" : ""} class="${ssrRenderClass([[$setup.loading ? "verifying.." : "submit"], "bg-indigo-600 text-white px-14 py-2 rounded-md"])}"></form><div class="bg-gray-800 flex-col p-2 rounded-sm text-white flex justify-center mb-3 items-center mx-auto"><h1 class="text-lg font-bold text-white mt-1 flex justify-center items-center mx-auto"> forgot password? reset. <span class="text-sm italic">(coming soon!)</span></h1><div class="bg-red-400 text-white py-2 px-1 border-l-8 border-red-700 rounded-lg" style="${ssrRenderStyle($setup.emailErrMsg ? null : { display: "none" })}">${ssrInterpolate($setup.emailErrMsg)}</div><form class="flex justify-center gap-y-2 items-center mx-auto flex-col bg-slate-800 p-3 rounded-md"><input type="email"${ssrRenderAttr("value", $setup.emailReset)} class="border-none ring-2 ring-indigo-600 rounded-md text-black px-7 py-2" placeholder="email.."><input type="submit" value="Reset" class="${ssrRenderClass([[$setup.loading ? "resetting" : "Reset"], "no-underline px-7 py-2 bg-indigo-600 rounded-lg text-indigo-100"])}"${ssrIncludeBooleanAttr($setup.loading) ? " disabled" : ""}></form></div></div></section></div></section></section>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);

export { index as default };
//# sourceMappingURL=index.c8a1358c.mjs.map
