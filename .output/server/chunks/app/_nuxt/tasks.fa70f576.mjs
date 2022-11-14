import { _ as _export_sfc, u as useSupabaseClient, a as useSupabaseUser, c as __nuxt_component_0, b as __nuxt_component_0$1, d as __nuxt_component_2 } from '../server.mjs';
import { ref, mergeProps, withCtx, createTextVNode, createVNode, useSSRContext } from 'vue';
import { useRouter } from 'vue-router';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderStyle, ssrInterpolate, ssrRenderAttr, ssrRenderList, ssrRenderClass, ssrIncludeBooleanAttr, ssrLooseContain } from 'vue/server-renderer';
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
    const client = useSupabaseClient();
    const user = useSupabaseUser();
    ref(null);
    const newTask = ref([]);
    const addNewTask = ref("");
    const fetchAllData = async () => {
      const { data, error } = await client.from("tasks").select("*");
      if (error)
        throw Error;
      newTask.value = data;
    };
    const removeTask = async (task) => {
      newTask.value = newTask.value.filter((t) => t.id !== task);
      await client.from("tasks").delete().match({ id: task });
    };
    const createData = async () => {
      if (newTask.value.length === 0) {
        return;
      }
      const { data, error } = await client.from("tasks").insert({
        tasks: addNewTask.value,
        completed: false
      });
      if (error)
        throw Error;
      else {
        newTask.value.push(data);
        addNewTask.value = "";
        location.reload();
      }
    };
    const logout = async () => {
      await client.auth.signOut();
      router.push("/");
    };
    console.log(user);
    return {
      newTask,
      fetchAllData,
      user,
      addNewTask,
      createData,
      logout,
      removeTask
    };
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_solid_logout_icon = __nuxt_component_0;
  const _component_nuxt_link = __nuxt_component_0$1;
  const _component_solid_cog_icon = __nuxt_component_2;
  _push(`<main${ssrRenderAttrs(mergeProps({ class: "relative overflow-hidden bg-slate-900" }, _attrs))}><div class="text-white"><button class="absolute top-1 md:right-32 right-3 rounded-lg border-none ring-1 ring-white px-2 py-1 flex justify-center items-center m-auto flow-row"> Logout <span>`);
  _push(ssrRenderComponent(_component_solid_logout_icon, { class: "w-7 h-7" }, null, _parent));
  _push(`</span></button>`);
  _push(ssrRenderComponent(_component_nuxt_link, {
    to: "/Setting",
    class: "rounded-lg border-none ring-1 absolute top-1 md:left-32 left-3 ring-white px-2 py-1 flex justify-center items-center m-auto flow-row"
  }, {
    default: withCtx((_, _push2, _parent2, _scopeId) => {
      if (_push2) {
        _push2(` setting <span${_scopeId}>`);
        _push2(ssrRenderComponent(_component_solid_cog_icon, { class: "w-7 h-7" }, null, _parent2, _scopeId));
        _push2(`</span>`);
      } else {
        return [
          createTextVNode(" setting "),
          createVNode("span", null, [
            createVNode(_component_solid_cog_icon, { class: "w-7 h-7" })
          ])
        ];
      }
    }),
    _: 1
  }, _parent));
  _push(`</div><main class="bg-slate-900 min-h-screen pb-6 flex justify-center flex-col items-center gap-y-11 overflow-auto max-w-6xl mx-auto"><span class="flex justify-center items-center mx-auto flex-col mt-10" style="${ssrRenderStyle($setup.user ? null : { display: "none" })}"><h3 class="text-white"><span class="font-extrabold">Signed as </span><span class="border-b border-orange-700 text-orange-600" style="${ssrRenderStyle($setup.user.phone ? null : { display: "none" })}">${ssrInterpolate($setup.user.phone)}</span><span class="border-b border-orange-700 text-orange-600" style="${ssrRenderStyle($setup.user.email ? null : { display: "none" })}">${ssrInterpolate($setup.user.email)}</span></h3></span><h1 class="text-white text-2xl text-center">Supabase todo App</h1><div class="bg-slate-800 flex justify-center items-center mx-auto rounded-md flex-col p-10"><div class="flex mx-auto justify-center items-center gap-x-2"><input type="text"${ssrRenderAttr("value", $setup.addNewTask)} class="px-5 py-3 bg-yellow-100 rounded-lg text-black" placeholder="make something..."></div><button class="bg-indigo-600 rounded-md text-white font-mono py-3 px-32 m-2"> Enter. </button><div class="grid md:grid-cols-3 grid-cols-1 mt-10 gap-5"><!--[-->`);
  ssrRenderList($setup.newTask, (task) => {
    _push(`<div class="card w-full p-5 rounded-md bg-gray-800"><div class="wrapper-button w-full box-border mt-4"><div class="card sm:max-w-sm max-w-md rounded-lg border border-gray-200 shadow-md bg-gray-800 dark:border-gray-700"><a href="#"><img class="rounded-t-lg" alt=""></a><div class="p-5"><a href="#"><h5 class="${ssrRenderClass([`${task.completed ? "line-through text-gray-600 italic" : "text-gray-300 font-bold"}`, "mb-2 text-2xl tracking-tight text-gray-100"])}">${ssrInterpolate(task.tasks)}</h5></a>`);
    if (task.completed == true) {
      _push(`<p class="mb-3 font-normal dark:text-gray-200 bg-red-500 rounded-full p-1"> completed </p>`);
    } else {
      _push(`<p class="mb-3 font-normal dark:text-gray-200 bg-emerald-500 rounded-full p-1"> Incomplete </p>`);
    }
    _push(`<div class="flex justify-center items-center flex-row mx-auto gap-x-1"><div class="w-10 relative mr-2 align-middle select-none transition duration-200 ease-in"><input type="checkbox" name="toggle" id="toggle"${ssrIncludeBooleanAttr(Array.isArray(task.completed) ? ssrLooseContain(task.completed, null) : task.completed) ? " checked" : ""} class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"><label for="toggle" class="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label></div><button><svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="30" height="30" viewBox="0,0,256,256" style="${ssrRenderStyle({ "fill": "#000000" })}"><g fill="#fbf5f5" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="${ssrRenderStyle({ "mix-blend-mode": "normal" })}"><g transform="scale(5.33333,5.33333)"><path d="M24,4c-3.29586,0 -6,2.70413 -6,6h-10.5c-0.54095,-0.00765 -1.04412,0.27656 -1.31683,0.74381c-0.27271,0.46725 -0.27271,1.04514 0,1.51238c0.27271,0.46725 0.77588,0.75146 1.31683,0.74381h2.5v25.5c0,3.033 2.467,5.5 5.5,5.5h17c3.033,0 5.5,-2.467 5.5,-5.5v-25.5h2.5c0.54095,0.00765 1.04412,-0.27656 1.31683,-0.74381c0.27271,-0.46725 0.27271,-1.04514 0,-1.51238c-0.27271,-0.46725 -0.77588,-0.75146 -1.31683,-0.74381h-10.5c0,-3.29587 -2.70414,-6 -6,-6zM24,7c1.67413,0 3,1.32587 3,3h-6c0,-1.67413 1.32587,-3 3,-3zM19.5,18c0.828,0 1.5,0.672 1.5,1.5v15c0,0.828 -0.672,1.5 -1.5,1.5c-0.828,0 -1.5,-0.672 -1.5,-1.5v-15c0,-0.828 0.672,-1.5 1.5,-1.5zM28.5,18c0.828,0 1.5,0.672 1.5,1.5v15c0,0.828 -0.672,1.5 -1.5,1.5c-0.828,0 -1.5,-0.672 -1.5,-1.5v-15c0,-0.828 0.672,-1.5 1.5,-1.5z"></path></g></g></svg></button></div></div></div></div></div>`);
  });
  _push(`<!--]--></div></div></main></main>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/tasks.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const tasks = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);

export { tasks as default };
//# sourceMappingURL=tasks.fa70f576.mjs.map
