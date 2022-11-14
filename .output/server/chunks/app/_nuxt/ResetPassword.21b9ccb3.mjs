import { _ as _export_sfc, u as useSupabaseClient, a as useSupabaseUser, b as __nuxt_component_0$1 } from '../server.mjs';
import { ref, mergeProps, withCtx, createTextVNode, useSSRContext } from 'vue';
import { useRouter } from 'vue-router';
import { ssrRenderAttrs, ssrRenderStyle, ssrInterpolate, ssrRenderAttr, ssrRenderComponent } from 'vue/server-renderer';
import 'ohmyfetch';
import 'ufo';
import 'hookable';
import 'unctx';
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
    const router = useRouter();
    const { auth } = useSupabaseClient();
    const user = useSupabaseUser();
    const confirmPassword = ref("");
    const emailErrMsg = ref("");
    const UpdatedUser = async () => {
      const { user: user2, error } = await auth.updateUser({
        password: confirmPassword.value
      });
      if (error) {
        emailErrMsg.value = error.message;
        setTimeout(() => {
          emailErrMsg.value = "";
        }, 5e3);
        console.log(error);
      } else {
        console.log(user2);
        router.push("/");
      }
    };
    return {
      user,
      UpdatedUser,
      confirmPassword,
      emailErrMsg
    };
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_nuxt_link = __nuxt_component_0$1;
  _push(`<main${ssrRenderAttrs(mergeProps({ class: "relative overflow-hidden" }, _attrs))}><section class="flex flex-col justify-center antialiased bg-slate-900 text-gray-100 min-h-screen p-4"><div class="h-full"><div class="max-w-[360px] mx-auto"><div class="bg-slate-800 shadow-lg rounded-lg mt-9"><header class="text-center px-5 pb-5"><h3 class="text-xl font-bold text-gray-100 mb-1">Reset your password</h3><div class="bg-red-400 text-white py-2 px-1 border-l-8 border-red-700 rounded-lg" style="${ssrRenderStyle($setup.emailErrMsg ? null : { display: "none" })}">${ssrInterpolate($setup.emailErrMsg)}</div></header><div class="bg-gray-700 text-center px-5 py-6"><form class="space-y-3"><div class="flex shadow-sm rounded justify-center items-center mx-auto gap-y-2 flex-col"><div class=""></div><div class=""><input name="card-nr" class="text-sm text-gray-800 bg-white rounded leading-5 py-2 px-3 placeholder-gray-400 w-full border border-transparent focus:border-indigo-300 focus:ring-0" type="text" placeholder=" new password.." aria-label=" new password.."></div><div class=""><input name="card-nr" class="text-sm text-gray-800 bg-white rounded leading-5 py-2 px-3 placeholder-gray-400 w-full border border-transparent focus:border-indigo-300 focus:ring-0" type="text" placeholder="confirm password" aria-label="confirm password"${ssrRenderAttr("value", $setup.confirmPassword)}></div></div><button type="submit" class="font-semibold text-sm inline-flex items-center justify-center text-white px-3 py-2 border border-transparent rounded leading-5 shadow transition duration-150 ease-in-out w-full bg-indigo-500 hover:bg-indigo-600 text-white focus:outline-none focus-visible:ring-2"> Send </button></form></div></div></div></div></section><div x-show="open" class="fixed bottom-0 right-0 w-full md:bottom-8 md:right-12 md:w-auto z-60" x-data="{ open: true }"><div class="bg-gray-800 text-gray-50 text-sm p-3 md:rounded shadow-lg flex justify-between"><div> \u{1F449} `);
  _push(ssrRenderComponent(_component_nuxt_link, {
    to: "/tasks",
    class: "hover:underline ml-1 text-white"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(`Tasks`);
      } else {
        return [
          createTextVNode("Tasks")
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div><button class="text-gray-500 hover:text-gray-400 ml-5"><span class="sr-only">Close</span><svg class="w-4 h-4 flex-shrink-0 fill-current" viewBox="0 0 16 16"><path d="M12.72 3.293a1 1 0 00-1.415 0L8.012 6.586 4.72 3.293a1 1 0 00-1.414 1.414L6.598 8l-3.293 3.293a1 1 0 101.414 1.414l3.293-3.293 3.293 3.293a1 1 0 001.414-1.414L9.426 8l3.293-3.293a1 1 0 000-1.414z"></path></svg></button></div></div></main>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/ResetPassword.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const ResetPassword = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);

export { ResetPassword as default };
//# sourceMappingURL=ResetPassword.21b9ccb3.mjs.map
