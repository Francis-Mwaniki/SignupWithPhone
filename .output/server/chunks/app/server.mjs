import { computed, defineComponent, inject, provide, h, Suspense, Transition, reactive, getCurrentInstance, toRef, isRef, ref, resolveComponent, watchEffect, markRaw, mergeProps, useSSRContext, shallowRef, createApp, defineAsyncComponent, onErrorCaptured, unref } from 'vue';
import { $fetch } from 'ohmyfetch';
import { hasProtocol, parseURL, joinURL, isEqual } from 'ufo';
import { createHooks } from 'hookable';
import { getContext, executeAsync } from 'unctx';
import { RouterView, createMemoryHistory, createRouter } from 'vue-router';
import destr from 'destr';
import { sendRedirect, createError as createError$1, appendHeader } from 'h3';
import defu$1, { defuFn, defu } from 'defu';
import { isFunction } from '@vue/shared';
import { ssrRenderAttrs, ssrRenderSuspense, ssrRenderComponent } from 'vue/server-renderer';
import { parse, serialize } from 'cookie-es';
import { isEqual as isEqual$1 } from 'ohash';
import crossFetch, { Headers as Headers$1 } from 'unenv/runtime/npm/cross-fetch';
import require$$2 from 'events';
import require$$1 from 'unenv/runtime/npm/debug';
import require$$1$1 from 'util';
import require$$0$3 from 'crypto';
import require$$2$1 from 'url';
import require$$0$1 from 'bufferutil';
import require$$0$2 from 'buffer';
import require$$5 from 'utf-8-validate';
import require$$3 from 'http';
import require$$4 from 'https';
import require$$1$2 from 'typedarray-to-buffer';
import require$$2$2 from 'yaeti';
import { a as useRuntimeConfig$1 } from '../nitro/node-server.mjs';
import 'node-fetch-native/polyfill';
import 'radix3';
import 'unenv/runtime/fetch/index';
import 'scule';
import 'unstorage';
import 'fs';
import 'pathe';

const appConfig = useRuntimeConfig$1().app;
const baseURL = () => appConfig.baseURL;
const buildAssetsDir = () => appConfig.buildAssetsDir;
const buildAssetsURL = (...path) => joinURL(publicAssetsURL(), buildAssetsDir(), ...path);
const publicAssetsURL = (...path) => {
  const publicBase = appConfig.cdnURL || appConfig.baseURL;
  return path.length ? joinURL(publicBase, ...path) : publicBase;
};
globalThis.__buildAssetsURL = buildAssetsURL;
globalThis.__publicAssetsURL = publicAssetsURL;
const nuxtAppCtx = getContext("nuxt-app");
const NuxtPluginIndicator = "__nuxt_plugin";
function createNuxtApp(options) {
  const nuxtApp = {
    provide: void 0,
    globalName: "nuxt",
    payload: reactive({
      data: {},
      state: {},
      _errors: {},
      ...{ serverRendered: true }
    }),
    isHydrating: false,
    _asyncDataPromises: {},
    _asyncData: {},
    ...options
  };
  nuxtApp.hooks = createHooks();
  nuxtApp.hook = nuxtApp.hooks.hook;
  nuxtApp.callHook = nuxtApp.hooks.callHook;
  nuxtApp.provide = (name2, value) => {
    const $name = "$" + name2;
    defineGetter(nuxtApp, $name, value);
    defineGetter(nuxtApp.vueApp.config.globalProperties, $name, value);
  };
  defineGetter(nuxtApp.vueApp, "$nuxt", nuxtApp);
  defineGetter(nuxtApp.vueApp.config.globalProperties, "$nuxt", nuxtApp);
  {
    if (nuxtApp.ssrContext) {
      nuxtApp.ssrContext.nuxt = nuxtApp;
    }
    nuxtApp.ssrContext = nuxtApp.ssrContext || {};
    if (nuxtApp.ssrContext.payload) {
      Object.assign(nuxtApp.payload, nuxtApp.ssrContext.payload);
    }
    nuxtApp.ssrContext.payload = nuxtApp.payload;
    nuxtApp.payload.config = {
      public: options.ssrContext.runtimeConfig.public,
      app: options.ssrContext.runtimeConfig.app
    };
  }
  const runtimeConfig = options.ssrContext.runtimeConfig;
  const compatibilityConfig = new Proxy(runtimeConfig, {
    get(target, prop) {
      var _a;
      if (prop === "public") {
        return target.public;
      }
      return (_a = target[prop]) != null ? _a : target.public[prop];
    },
    set(target, prop, value) {
      {
        return false;
      }
    }
  });
  nuxtApp.provide("config", compatibilityConfig);
  return nuxtApp;
}
async function applyPlugin(nuxtApp, plugin) {
  if (typeof plugin !== "function") {
    return;
  }
  const { provide: provide2 } = await callWithNuxt(nuxtApp, plugin, [nuxtApp]) || {};
  if (provide2 && typeof provide2 === "object") {
    for (const key in provide2) {
      nuxtApp.provide(key, provide2[key]);
    }
  }
}
async function applyPlugins(nuxtApp, plugins2) {
  for (const plugin of plugins2) {
    await applyPlugin(nuxtApp, plugin);
  }
}
function normalizePlugins(_plugins2) {
  const plugins2 = _plugins2.map((plugin) => {
    if (typeof plugin !== "function") {
      return null;
    }
    if (plugin.length > 1) {
      return (nuxtApp) => plugin(nuxtApp, nuxtApp.provide);
    }
    return plugin;
  }).filter(Boolean);
  return plugins2;
}
function defineNuxtPlugin(plugin) {
  plugin[NuxtPluginIndicator] = true;
  return plugin;
}
function callWithNuxt(nuxt, setup, args) {
  const fn = () => args ? setup(...args) : setup();
  {
    return nuxtAppCtx.callAsync(nuxt, fn);
  }
}
function useNuxtApp() {
  const nuxtAppInstance = nuxtAppCtx.tryUse();
  if (!nuxtAppInstance) {
    const vm = getCurrentInstance();
    if (!vm) {
      throw new Error("nuxt instance unavailable");
    }
    return vm.appContext.app.$nuxt;
  }
  return nuxtAppInstance;
}
function useRuntimeConfig() {
  return useNuxtApp().$config;
}
function defineGetter(obj, key, val) {
  Object.defineProperty(obj, key, { get: () => val });
}
function useState(...args) {
  const autoKey = typeof args[args.length - 1] === "string" ? args.pop() : void 0;
  if (typeof args[0] !== "string") {
    args.unshift(autoKey);
  }
  const [_key, init] = args;
  if (!_key || typeof _key !== "string") {
    throw new TypeError("[nuxt] [useState] key must be a string: " + _key);
  }
  if (init !== void 0 && typeof init !== "function") {
    throw new Error("[nuxt] [useState] init must be a function: " + init);
  }
  const key = "$s" + _key;
  const nuxt = useNuxtApp();
  const state = toRef(nuxt.payload.state, key);
  if (state.value === void 0 && init) {
    const initialValue = init();
    if (isRef(initialValue)) {
      nuxt.payload.state[key] = initialValue;
      return initialValue;
    }
    state.value = initialValue;
  }
  return state;
}
const useError = () => toRef(useNuxtApp().payload, "error");
const showError = (_err) => {
  const err = createError(_err);
  try {
    const nuxtApp = useNuxtApp();
    nuxtApp.callHook("app:error", err);
    const error = useError();
    error.value = error.value || err;
  } catch {
    throw err;
  }
  return err;
};
const createError = (err) => {
  const _err = createError$1(err);
  _err.__nuxt_error = true;
  return _err;
};
function useRequestEvent(nuxtApp = useNuxtApp()) {
  var _a;
  return (_a = nuxtApp.ssrContext) == null ? void 0 : _a.event;
}
const CookieDefaults = {
  path: "/",
  decode: (val) => destr(decodeURIComponent(val)),
  encode: (val) => encodeURIComponent(typeof val === "string" ? val : JSON.stringify(val))
};
function useCookie(name2, _opts) {
  var _a, _b;
  const opts = { ...CookieDefaults, ..._opts };
  const cookies = readRawCookies(opts) || {};
  const cookie = ref((_b = cookies[name2]) != null ? _b : (_a = opts.default) == null ? void 0 : _a.call(opts));
  {
    const nuxtApp = useNuxtApp();
    const writeFinalCookieValue = () => {
      if (!isEqual$1(cookie.value, cookies[name2])) {
        writeServerCookie(useRequestEvent(nuxtApp), name2, cookie.value, opts);
      }
    };
    const unhook = nuxtApp.hooks.hookOnce("app:rendered", writeFinalCookieValue);
    nuxtApp.hooks.hookOnce("app:redirected", () => {
      unhook();
      return writeFinalCookieValue();
    });
  }
  return cookie;
}
function readRawCookies(opts = {}) {
  var _a;
  {
    return parse(((_a = useRequestEvent()) == null ? void 0 : _a.req.headers.cookie) || "", opts);
  }
}
function serializeCookie(name2, value, opts = {}) {
  if (value === null || value === void 0) {
    return serialize(name2, value, { ...opts, maxAge: -1 });
  }
  return serialize(name2, value, opts);
}
function writeServerCookie(event, name2, value, opts = {}) {
  if (event) {
    appendHeader(event, "Set-Cookie", serializeCookie(name2, value, opts));
  }
}
const useRouter = () => {
  var _a;
  return (_a = useNuxtApp()) == null ? void 0 : _a.$router;
};
const useRoute = () => {
  if (getCurrentInstance()) {
    return inject("_route", useNuxtApp()._route);
  }
  return useNuxtApp()._route;
};
const defineNuxtRouteMiddleware = (middleware) => middleware;
const addRouteMiddleware = (name2, middleware, options = {}) => {
  const nuxtApp = useNuxtApp();
  if (options.global || typeof name2 === "function") {
    nuxtApp._middleware.global.push(typeof name2 === "function" ? name2 : middleware);
  } else {
    nuxtApp._middleware.named[name2] = middleware;
  }
};
const isProcessingMiddleware = () => {
  try {
    if (useNuxtApp()._processingMiddleware) {
      return true;
    }
  } catch {
    return true;
  }
  return false;
};
const navigateTo = (to, options) => {
  if (!to) {
    to = "/";
  }
  const toPath = typeof to === "string" ? to : to.path || "/";
  const isExternal = hasProtocol(toPath, true);
  if (isExternal && !(options == null ? void 0 : options.external)) {
    throw new Error("Navigating to external URL is not allowed by default. Use `nagivateTo (url, { external: true })`.");
  }
  if (isExternal && parseURL(toPath).protocol === "script:") {
    throw new Error("Cannot navigate to an URL with script protocol.");
  }
  if (!isExternal && isProcessingMiddleware()) {
    return to;
  }
  const router = useRouter();
  {
    const nuxtApp = useNuxtApp();
    if (nuxtApp.ssrContext && nuxtApp.ssrContext.event) {
      const redirectLocation = isExternal ? toPath : joinURL(useRuntimeConfig().app.baseURL, router.resolve(to).fullPath || "/");
      return nuxtApp.callHook("app:redirected").then(() => sendRedirect(nuxtApp.ssrContext.event, redirectLocation, (options == null ? void 0 : options.redirectCode) || 302));
    }
  }
  if (isExternal) {
    if (options == null ? void 0 : options.replace) {
      location.replace(toPath);
    } else {
      location.href = toPath;
    }
    return Promise.resolve();
  }
  return (options == null ? void 0 : options.replace) ? router.replace(to) : router.push(to);
};
const firstNonUndefined = (...args) => args.find((arg) => arg !== void 0);
const DEFAULT_EXTERNAL_REL_ATTRIBUTE = "noopener noreferrer";
function defineNuxtLink(options) {
  const componentName = options.componentName || "NuxtLink";
  return defineComponent({
    name: componentName,
    props: {
      to: {
        type: [String, Object],
        default: void 0,
        required: false
      },
      href: {
        type: [String, Object],
        default: void 0,
        required: false
      },
      target: {
        type: String,
        default: void 0,
        required: false
      },
      rel: {
        type: String,
        default: void 0,
        required: false
      },
      noRel: {
        type: Boolean,
        default: void 0,
        required: false
      },
      prefetch: {
        type: Boolean,
        default: void 0,
        required: false
      },
      noPrefetch: {
        type: Boolean,
        default: void 0,
        required: false
      },
      activeClass: {
        type: String,
        default: void 0,
        required: false
      },
      exactActiveClass: {
        type: String,
        default: void 0,
        required: false
      },
      prefetchedClass: {
        type: String,
        default: void 0,
        required: false
      },
      replace: {
        type: Boolean,
        default: void 0,
        required: false
      },
      ariaCurrentValue: {
        type: String,
        default: void 0,
        required: false
      },
      external: {
        type: Boolean,
        default: void 0,
        required: false
      },
      custom: {
        type: Boolean,
        default: void 0,
        required: false
      }
    },
    setup(props, { slots }) {
      const router = useRouter();
      const to = computed(() => {
        return props.to || props.href || "";
      });
      const isExternal = computed(() => {
        if (props.external) {
          return true;
        }
        if (props.target && props.target !== "_self") {
          return true;
        }
        if (typeof to.value === "object") {
          return false;
        }
        return to.value === "" || hasProtocol(to.value, true);
      });
      const prefetched = ref(false);
      return () => {
        var _a, _b, _c;
        if (!isExternal.value) {
          return h(
            resolveComponent("RouterLink"),
            {
              ref: void 0,
              to: to.value,
              class: prefetched.value && (props.prefetchedClass || options.prefetchedClass),
              activeClass: props.activeClass || options.activeClass,
              exactActiveClass: props.exactActiveClass || options.exactActiveClass,
              replace: props.replace,
              ariaCurrentValue: props.ariaCurrentValue,
              custom: props.custom
            },
            slots.default
          );
        }
        const href = typeof to.value === "object" ? (_b = (_a = router.resolve(to.value)) == null ? void 0 : _a.href) != null ? _b : null : to.value || null;
        const target = props.target || null;
        const rel = props.noRel ? null : firstNonUndefined(props.rel, options.externalRelAttribute, href ? DEFAULT_EXTERNAL_REL_ATTRIBUTE : "") || null;
        const navigate = () => navigateTo(href, { replace: props.replace });
        if (props.custom) {
          if (!slots.default) {
            return null;
          }
          return slots.default({
            href,
            navigate,
            route: router.resolve(href),
            rel,
            target,
            isActive: false,
            isExactActive: false
          });
        }
        return h("a", { href, rel, target }, (_c = slots.default) == null ? void 0 : _c.call(slots));
      };
    }
  });
}
const __nuxt_component_0$1 = defineNuxtLink({ componentName: "NuxtLink" });
const inlineConfig = {};
defuFn(inlineConfig);
function useHead(meta2) {
  const resolvedMeta = isFunction(meta2) ? computed(meta2) : meta2;
  useNuxtApp()._useHead(resolvedMeta);
}
const components = {};
const _nuxt_components_plugin_mjs_KR1HBZs4kY = defineNuxtPlugin((nuxtApp) => {
  for (const name2 in components) {
    nuxtApp.vueApp.component(name2, components[name2]);
    nuxtApp.vueApp.component("Lazy" + name2, components[name2]);
  }
});
var PROVIDE_KEY = `usehead`;
var HEAD_COUNT_KEY = `head:count`;
var HEAD_ATTRS_KEY = `data-head-attrs`;
var SELF_CLOSING_TAGS = ["meta", "link", "base"];
var BODY_TAG_ATTR_NAME = `data-meta-body`;
var createElement = (tag, attrs, document) => {
  const el = document.createElement(tag);
  for (const key of Object.keys(attrs)) {
    if (key === "body" && attrs.body === true) {
      el.setAttribute(BODY_TAG_ATTR_NAME, "true");
    } else {
      let value = attrs[key];
      if (key === "renderPriority" || key === "key" || value === false) {
        continue;
      }
      if (key === "children") {
        el.textContent = value;
      } else {
        el.setAttribute(key, value);
      }
    }
  }
  return el;
};
var stringifyAttrName = (str) => str.replace(/[\s"'><\/=]/g, "").replace(/[^a-zA-Z0-9_-]/g, "");
var stringifyAttrValue = (str) => str.replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
var stringifyAttrs = (attributes) => {
  const handledAttributes = [];
  for (let [key, value] of Object.entries(attributes)) {
    if (key === "children" || key === "key") {
      continue;
    }
    if (value === false || value == null) {
      continue;
    }
    let attribute = stringifyAttrName(key);
    if (value !== true) {
      attribute += `="${stringifyAttrValue(String(value))}"`;
    }
    handledAttributes.push(attribute);
  }
  return handledAttributes.length > 0 ? " " + handledAttributes.join(" ") : "";
};
function isEqualNode(oldTag, newTag) {
  if (oldTag instanceof HTMLElement && newTag instanceof HTMLElement) {
    const nonce = newTag.getAttribute("nonce");
    if (nonce && !oldTag.getAttribute("nonce")) {
      const cloneTag = newTag.cloneNode(true);
      cloneTag.setAttribute("nonce", "");
      cloneTag.nonce = nonce;
      return nonce === oldTag.nonce && oldTag.isEqualNode(cloneTag);
    }
  }
  return oldTag.isEqualNode(newTag);
}
var tagDedupeKey = (tag) => {
  if (!["meta", "base", "script", "link"].includes(tag.tag)) {
    return false;
  }
  const { props, tag: tagName } = tag;
  if (tagName === "base") {
    return "base";
  }
  if (tagName === "link" && props.rel === "canonical") {
    return "canonical";
  }
  if (props.charset) {
    return "charset";
  }
  const name2 = ["key", "id", "name", "property", "http-equiv"];
  for (const n of name2) {
    let value = void 0;
    if (typeof props.getAttribute === "function" && props.hasAttribute(n)) {
      value = props.getAttribute(n);
    } else {
      value = props[n];
    }
    if (value !== void 0) {
      return `${tagName}-${n}-${value}`;
    }
  }
  return false;
};
var acceptFields = [
  "title",
  "meta",
  "link",
  "base",
  "style",
  "script",
  "noscript",
  "htmlAttrs",
  "bodyAttrs"
];
var renderTemplate = (template, title) => {
  if (template == null)
    return "";
  if (typeof template === "string") {
    return template.replace("%s", title != null ? title : "");
  }
  return template(unref(title));
};
var headObjToTags = (obj) => {
  const tags = [];
  const keys = Object.keys(obj);
  for (const key of keys) {
    if (obj[key] == null)
      continue;
    switch (key) {
      case "title":
        tags.push({ tag: key, props: { children: obj[key] } });
        break;
      case "titleTemplate":
        break;
      case "base":
        tags.push({ tag: key, props: { key: "default", ...obj[key] } });
        break;
      default:
        if (acceptFields.includes(key)) {
          const value = obj[key];
          if (Array.isArray(value)) {
            value.forEach((item) => {
              tags.push({ tag: key, props: unref(item) });
            });
          } else if (value) {
            tags.push({ tag: key, props: value });
          }
        }
        break;
    }
  }
  return tags;
};
var setAttrs = (el, attrs) => {
  const existingAttrs = el.getAttribute(HEAD_ATTRS_KEY);
  if (existingAttrs) {
    for (const key of existingAttrs.split(",")) {
      if (!(key in attrs)) {
        el.removeAttribute(key);
      }
    }
  }
  const keys = [];
  for (const key in attrs) {
    const value = attrs[key];
    if (value == null)
      continue;
    if (value === false) {
      el.removeAttribute(key);
    } else {
      el.setAttribute(key, value);
    }
    keys.push(key);
  }
  if (keys.length) {
    el.setAttribute(HEAD_ATTRS_KEY, keys.join(","));
  } else {
    el.removeAttribute(HEAD_ATTRS_KEY);
  }
};
var updateElements = (document = window.document, type, tags) => {
  var _a, _b;
  const head = document.head;
  const body = document.body;
  let headCountEl = head.querySelector(`meta[name="${HEAD_COUNT_KEY}"]`);
  let bodyMetaElements = body.querySelectorAll(`[${BODY_TAG_ATTR_NAME}]`);
  const headCount = headCountEl ? Number(headCountEl.getAttribute("content")) : 0;
  const oldHeadElements = [];
  const oldBodyElements = [];
  if (bodyMetaElements) {
    for (let i = 0; i < bodyMetaElements.length; i++) {
      if (bodyMetaElements[i] && ((_a = bodyMetaElements[i].tagName) == null ? void 0 : _a.toLowerCase()) === type) {
        oldBodyElements.push(bodyMetaElements[i]);
      }
    }
  }
  if (headCountEl) {
    for (let i = 0, j = headCountEl.previousElementSibling; i < headCount; i++, j = (j == null ? void 0 : j.previousElementSibling) || null) {
      if (((_b = j == null ? void 0 : j.tagName) == null ? void 0 : _b.toLowerCase()) === type) {
        oldHeadElements.push(j);
      }
    }
  } else {
    headCountEl = document.createElement("meta");
    headCountEl.setAttribute("name", HEAD_COUNT_KEY);
    headCountEl.setAttribute("content", "0");
    head.append(headCountEl);
  }
  let newElements = tags.map((tag) => {
    var _a2;
    return {
      element: createElement(tag.tag, tag.props, document),
      body: (_a2 = tag.props.body) != null ? _a2 : false
    };
  });
  newElements = newElements.filter((newEl) => {
    for (let i = 0; i < oldHeadElements.length; i++) {
      const oldEl = oldHeadElements[i];
      if (isEqualNode(oldEl, newEl.element)) {
        oldHeadElements.splice(i, 1);
        return false;
      }
    }
    for (let i = 0; i < oldBodyElements.length; i++) {
      const oldEl = oldBodyElements[i];
      if (isEqualNode(oldEl, newEl.element)) {
        oldBodyElements.splice(i, 1);
        return false;
      }
    }
    return true;
  });
  oldBodyElements.forEach((t) => {
    var _a2;
    return (_a2 = t.parentNode) == null ? void 0 : _a2.removeChild(t);
  });
  oldHeadElements.forEach((t) => {
    var _a2;
    return (_a2 = t.parentNode) == null ? void 0 : _a2.removeChild(t);
  });
  newElements.forEach((t) => {
    if (t.body === true) {
      body.insertAdjacentElement("beforeend", t.element);
    } else {
      head.insertBefore(t.element, headCountEl);
    }
  });
  headCountEl.setAttribute(
    "content",
    "" + (headCount - oldHeadElements.length + newElements.filter((t) => !t.body).length)
  );
};
var createHead = (initHeadObject) => {
  let allHeadObjs = [];
  let previousTags = /* @__PURE__ */ new Set();
  if (initHeadObject) {
    allHeadObjs.push(shallowRef(initHeadObject));
  }
  const head = {
    install(app) {
      app.config.globalProperties.$head = head;
      app.provide(PROVIDE_KEY, head);
    },
    get headTags() {
      const deduped = [];
      const deduping = {};
      const titleTemplate = allHeadObjs.map((i) => unref(i).titleTemplate).reverse().find((i) => i != null);
      allHeadObjs.forEach((objs, headObjectIdx) => {
        const tags = headObjToTags(unref(objs));
        tags.forEach((tag, tagIdx) => {
          tag._position = headObjectIdx * 1e4 + tagIdx;
          if (titleTemplate && tag.tag === "title") {
            tag.props.children = renderTemplate(
              titleTemplate,
              tag.props.children
            );
          }
          const dedupeKey = tagDedupeKey(tag);
          if (dedupeKey) {
            deduping[dedupeKey] = tag;
          } else {
            deduped.push(tag);
          }
        });
      });
      deduped.push(...Object.values(deduping));
      return deduped.sort((a, b) => a._position - b._position);
    },
    addHeadObjs(objs) {
      allHeadObjs.push(objs);
    },
    removeHeadObjs(objs) {
      allHeadObjs = allHeadObjs.filter((_objs) => _objs !== objs);
    },
    updateDOM(document = window.document) {
      let title;
      let htmlAttrs = {};
      let bodyAttrs = {};
      const actualTags = {};
      for (const tag of head.headTags.sort(sortTags)) {
        if (tag.tag === "title") {
          title = tag.props.children;
          continue;
        }
        if (tag.tag === "htmlAttrs") {
          Object.assign(htmlAttrs, tag.props);
          continue;
        }
        if (tag.tag === "bodyAttrs") {
          Object.assign(bodyAttrs, tag.props);
          continue;
        }
        actualTags[tag.tag] = actualTags[tag.tag] || [];
        actualTags[tag.tag].push(tag);
      }
      if (title !== void 0) {
        document.title = title;
      }
      setAttrs(document.documentElement, htmlAttrs);
      setAttrs(document.body, bodyAttrs);
      const tags = /* @__PURE__ */ new Set([...Object.keys(actualTags), ...previousTags]);
      for (const tag of tags) {
        updateElements(document, tag, actualTags[tag] || []);
      }
      previousTags.clear();
      Object.keys(actualTags).forEach((i) => previousTags.add(i));
    }
  };
  return head;
};
var tagToString = (tag) => {
  let isBodyTag = false;
  if (tag.props.body) {
    isBodyTag = true;
    delete tag.props.body;
  }
  if (tag.props.renderPriority) {
    delete tag.props.renderPriority;
  }
  let attrs = stringifyAttrs(tag.props);
  if (SELF_CLOSING_TAGS.includes(tag.tag)) {
    return `<${tag.tag}${attrs}${isBodyTag ? `  ${BODY_TAG_ATTR_NAME}="true"` : ""}>`;
  }
  return `<${tag.tag}${attrs}${isBodyTag ? ` ${BODY_TAG_ATTR_NAME}="true"` : ""}>${tag.props.children || ""}</${tag.tag}>`;
};
var sortTags = (aTag, bTag) => {
  const tagWeight = (tag) => {
    if (tag.props.renderPriority) {
      return tag.props.renderPriority;
    }
    switch (tag.tag) {
      case "base":
        return -1;
      case "meta":
        if (tag.props.charset) {
          return -2;
        }
        if (tag.props["http-equiv"] === "content-security-policy") {
          return 0;
        }
        return 10;
      default:
        return 10;
    }
  };
  return tagWeight(aTag) - tagWeight(bTag);
};
var renderHeadToString = (head) => {
  const tags = [];
  let titleTag = "";
  let htmlAttrs = {};
  let bodyAttrs = {};
  let bodyTags = [];
  for (const tag of head.headTags.sort(sortTags)) {
    if (tag.tag === "title") {
      titleTag = tagToString(tag);
    } else if (tag.tag === "htmlAttrs") {
      Object.assign(htmlAttrs, tag.props);
    } else if (tag.tag === "bodyAttrs") {
      Object.assign(bodyAttrs, tag.props);
    } else if (tag.props.body) {
      bodyTags.push(tagToString(tag));
    } else {
      tags.push(tagToString(tag));
    }
  }
  tags.push(`<meta name="${HEAD_COUNT_KEY}" content="${tags.length}">`);
  return {
    get headTags() {
      return titleTag + tags.join("");
    },
    get htmlAttrs() {
      return stringifyAttrs({
        ...htmlAttrs,
        [HEAD_ATTRS_KEY]: Object.keys(htmlAttrs).join(",")
      });
    },
    get bodyAttrs() {
      return stringifyAttrs({
        ...bodyAttrs,
        [HEAD_ATTRS_KEY]: Object.keys(bodyAttrs).join(",")
      });
    },
    get bodyTags() {
      return bodyTags.join("");
    }
  };
};
const node_modules_nuxt_dist_head_runtime_lib_vueuse_head_plugin_mjs_D7WGfuP1A0 = defineNuxtPlugin((nuxtApp) => {
  const head = createHead();
  nuxtApp.vueApp.use(head);
  nuxtApp.hooks.hookOnce("app:mounted", () => {
    watchEffect(() => {
      head.updateDOM();
    });
  });
  nuxtApp._useHead = (_meta) => {
    const meta2 = ref(_meta);
    const headObj = computed(() => {
      const overrides = { meta: [] };
      if (meta2.value.charset) {
        overrides.meta.push({ key: "charset", charset: meta2.value.charset });
      }
      if (meta2.value.viewport) {
        overrides.meta.push({ name: "viewport", content: meta2.value.viewport });
      }
      return defu$1(overrides, meta2.value);
    });
    head.addHeadObjs(headObj);
    {
      return;
    }
  };
  {
    nuxtApp.ssrContext.renderMeta = () => {
      const meta2 = renderHeadToString(head);
      return {
        ...meta2,
        bodyScripts: meta2.bodyTags
      };
    };
  }
});
const removeUndefinedProps = (props) => Object.fromEntries(Object.entries(props).filter(([, value]) => value !== void 0));
const setupForUseMeta = (metaFactory, renderChild) => (props, ctx) => {
  useHead(() => metaFactory({ ...removeUndefinedProps(props), ...ctx.attrs }, ctx));
  return () => {
    var _a, _b;
    return renderChild ? (_b = (_a = ctx.slots).default) == null ? void 0 : _b.call(_a) : null;
  };
};
const globalProps = {
  accesskey: String,
  autocapitalize: String,
  autofocus: {
    type: Boolean,
    default: void 0
  },
  class: String,
  contenteditable: {
    type: Boolean,
    default: void 0
  },
  contextmenu: String,
  dir: String,
  draggable: {
    type: Boolean,
    default: void 0
  },
  enterkeyhint: String,
  exportparts: String,
  hidden: {
    type: Boolean,
    default: void 0
  },
  id: String,
  inputmode: String,
  is: String,
  itemid: String,
  itemprop: String,
  itemref: String,
  itemscope: String,
  itemtype: String,
  lang: String,
  nonce: String,
  part: String,
  slot: String,
  spellcheck: {
    type: Boolean,
    default: void 0
  },
  style: String,
  tabindex: String,
  title: String,
  translate: String
};
const Script = defineComponent({
  name: "Script",
  inheritAttrs: false,
  props: {
    ...globalProps,
    async: Boolean,
    crossorigin: {
      type: [Boolean, String],
      default: void 0
    },
    defer: Boolean,
    fetchpriority: String,
    integrity: String,
    nomodule: Boolean,
    nonce: String,
    referrerpolicy: String,
    src: String,
    type: String,
    charset: String,
    language: String
  },
  setup: setupForUseMeta((script) => ({
    script: [script]
  }))
});
const NoScript = defineComponent({
  name: "NoScript",
  inheritAttrs: false,
  props: {
    ...globalProps,
    title: String
  },
  setup: setupForUseMeta((props, { slots }) => {
    var _a;
    const noscript = { ...props };
    const textContent = (((_a = slots.default) == null ? void 0 : _a.call(slots)) || []).filter(({ children }) => children).map(({ children }) => children).join("");
    if (textContent) {
      noscript.children = textContent;
    }
    return {
      noscript: [noscript]
    };
  })
});
const Link = defineComponent({
  name: "Link",
  inheritAttrs: false,
  props: {
    ...globalProps,
    as: String,
    crossorigin: String,
    disabled: Boolean,
    fetchpriority: String,
    href: String,
    hreflang: String,
    imagesizes: String,
    imagesrcset: String,
    integrity: String,
    media: String,
    prefetch: {
      type: Boolean,
      default: void 0
    },
    referrerpolicy: String,
    rel: String,
    sizes: String,
    title: String,
    type: String,
    methods: String,
    target: String
  },
  setup: setupForUseMeta((link) => ({
    link: [link]
  }))
});
const Base = defineComponent({
  name: "Base",
  inheritAttrs: false,
  props: {
    ...globalProps,
    href: String,
    target: String
  },
  setup: setupForUseMeta((base) => ({
    base
  }))
});
const Title = defineComponent({
  name: "Title",
  inheritAttrs: false,
  setup: setupForUseMeta((_, { slots }) => {
    var _a, _b, _c;
    const title = ((_c = (_b = (_a = slots.default) == null ? void 0 : _a.call(slots)) == null ? void 0 : _b[0]) == null ? void 0 : _c.children) || null;
    return {
      title
    };
  })
});
const Meta = defineComponent({
  name: "Meta",
  inheritAttrs: false,
  props: {
    ...globalProps,
    charset: String,
    content: String,
    httpEquiv: String,
    name: String
  },
  setup: setupForUseMeta((props) => {
    const meta2 = { ...props };
    if (meta2.httpEquiv) {
      meta2["http-equiv"] = meta2.httpEquiv;
      delete meta2.httpEquiv;
    }
    return {
      meta: [meta2]
    };
  })
});
const Style = defineComponent({
  name: "Style",
  inheritAttrs: false,
  props: {
    ...globalProps,
    type: String,
    media: String,
    nonce: String,
    title: String,
    scoped: {
      type: Boolean,
      default: void 0
    }
  },
  setup: setupForUseMeta((props, { slots }) => {
    var _a, _b, _c;
    const style = { ...props };
    const textContent = (_c = (_b = (_a = slots.default) == null ? void 0 : _a.call(slots)) == null ? void 0 : _b[0]) == null ? void 0 : _c.children;
    if (textContent) {
      style.children = textContent;
    }
    return {
      style: [style]
    };
  })
});
const Head = defineComponent({
  name: "Head",
  inheritAttrs: false,
  setup: (_props, ctx) => () => {
    var _a, _b;
    return (_b = (_a = ctx.slots).default) == null ? void 0 : _b.call(_a);
  }
});
const Html = defineComponent({
  name: "Html",
  inheritAttrs: false,
  props: {
    ...globalProps,
    manifest: String,
    version: String,
    xmlns: String
  },
  setup: setupForUseMeta((htmlAttrs) => ({ htmlAttrs }), true)
});
const Body = defineComponent({
  name: "Body",
  inheritAttrs: false,
  props: globalProps,
  setup: setupForUseMeta((bodyAttrs) => ({ bodyAttrs }), true)
});
const Components = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Script,
  NoScript,
  Link,
  Base,
  Title,
  Meta,
  Style,
  Head,
  Html,
  Body
}, Symbol.toStringTag, { value: "Module" }));
const appHead = { "meta": [], "link": [], "style": [], "script": [], "noscript": [], "charset": "utf-8", "viewport": "width=device-width, initial-scale=1" };
const appPageTransition = { "name": "page", "mode": "out-in" };
const appKeepalive = false;
const metaMixin = {
  created() {
    const instance = getCurrentInstance();
    if (!instance) {
      return;
    }
    const options = instance.type;
    if (!options || !("head" in options)) {
      return;
    }
    const nuxtApp = useNuxtApp();
    const source = typeof options.head === "function" ? computed(() => options.head(nuxtApp)) : options.head;
    useHead(source);
  }
};
const node_modules_nuxt_dist_head_runtime_plugin_mjs_1QO0gqa6n2 = defineNuxtPlugin((nuxtApp) => {
  useHead(markRaw({ title: "", ...appHead }));
  nuxtApp.vueApp.mixin(metaMixin);
  for (const name2 in Components) {
    nuxtApp.vueApp.component(name2, Components[name2]);
  }
});
const interpolatePath = (route, match) => {
  return match.path.replace(/(:\w+)\([^)]+\)/g, "$1").replace(/(:\w+)[?+*]/g, "$1").replace(/:\w+/g, (r) => {
    var _a;
    return ((_a = route.params[r.slice(1)]) == null ? void 0 : _a.toString()) || "";
  });
};
const generateRouteKey = (override, routeProps) => {
  var _a;
  const matchedRoute = routeProps.route.matched.find((m) => {
    var _a2;
    return ((_a2 = m.components) == null ? void 0 : _a2.default) === routeProps.Component.type;
  });
  const source = (_a = override != null ? override : matchedRoute == null ? void 0 : matchedRoute.meta.key) != null ? _a : matchedRoute && interpolatePath(routeProps.route, matchedRoute);
  return typeof source === "function" ? source(routeProps.route) : source;
};
const wrapInKeepAlive = (props, children) => {
  return { default: () => children };
};
const Fragment = defineComponent({
  setup(_props, { slots }) {
    return () => {
      var _a;
      return (_a = slots.default) == null ? void 0 : _a.call(slots);
    };
  }
});
const _wrapIf = (component, props, slots) => {
  return { default: () => props ? h(component, props === true ? {} : props, slots) : h(Fragment, {}, slots) };
};
const isNestedKey = Symbol("isNested");
const NuxtPage = defineComponent({
  name: "NuxtPage",
  inheritAttrs: false,
  props: {
    name: {
      type: String
    },
    transition: {
      type: [Boolean, Object],
      default: void 0
    },
    keepalive: {
      type: [Boolean, Object],
      default: void 0
    },
    route: {
      type: Object
    },
    pageKey: {
      type: [Function, String],
      default: null
    }
  },
  setup(props, { attrs }) {
    const nuxtApp = useNuxtApp();
    const isNested = inject(isNestedKey, false);
    provide(isNestedKey, true);
    return () => {
      return h(RouterView, { name: props.name, route: props.route, ...attrs }, {
        default: (routeProps) => {
          var _a, _b, _c, _d;
          if (!routeProps.Component) {
            return;
          }
          const key = generateRouteKey(props.pageKey, routeProps);
          const transitionProps = (_b = (_a = props.transition) != null ? _a : routeProps.route.meta.pageTransition) != null ? _b : appPageTransition;
          return _wrapIf(
            Transition,
            transitionProps,
            wrapInKeepAlive(
              (_d = (_c = props.keepalive) != null ? _c : routeProps.route.meta.keepalive) != null ? _d : appKeepalive,
              isNested && nuxtApp.isHydrating ? h(Component, { key, routeProps, pageKey: key, hasTransition: !!transitionProps }) : h(Suspense, {
                onPending: () => nuxtApp.callHook("page:start", routeProps.Component),
                onResolve: () => nuxtApp.callHook("page:finish", routeProps.Component)
              }, { default: () => h(Component, { key, routeProps, pageKey: key, hasTransition: !!transitionProps }) })
            )
          ).default();
        }
      });
    };
  }
});
const Component = defineComponent({
  props: ["routeProps", "pageKey", "hasTransition"],
  setup(props) {
    const previousKey = props.pageKey;
    const previousRoute = props.routeProps.route;
    const route = {};
    for (const key in props.routeProps.route) {
      route[key] = computed(() => previousKey === props.pageKey ? props.routeProps.route[key] : previousRoute[key]);
    }
    provide("_route", reactive(route));
    return () => {
      return h(props.routeProps.Component);
    };
  }
});
var __awaiter$e = globalThis && globalThis.__awaiter || function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
const resolveFetch$3 = (customFetch) => {
  let _fetch;
  if (customFetch) {
    _fetch = customFetch;
  } else if (typeof fetch === "undefined") {
    _fetch = (...args) => __awaiter$e(void 0, void 0, void 0, function* () {
      return yield (yield import('unenv/runtime/npm/cross-fetch')).fetch(...args);
    });
  } else {
    _fetch = fetch;
  }
  return (...args) => _fetch(...args);
};
class FunctionsError extends Error {
  constructor(message, name2 = "FunctionsError", context) {
    super(message);
    super.name = name2;
    this.context = context;
  }
}
class FunctionsFetchError extends FunctionsError {
  constructor(context) {
    super("Failed to send a request to the Edge Function", "FunctionsFetchError", context);
  }
}
class FunctionsRelayError extends FunctionsError {
  constructor(context) {
    super("Relay Error invoking the Edge Function", "FunctionsRelayError", context);
  }
}
class FunctionsHttpError extends FunctionsError {
  constructor(context) {
    super("Edge Function returned a non-2xx status code", "FunctionsHttpError", context);
  }
}
var __awaiter$d = globalThis && globalThis.__awaiter || function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
class FunctionsClient {
  constructor(url2, { headers = {}, customFetch } = {}) {
    this.url = url2;
    this.headers = headers;
    this.fetch = resolveFetch$3(customFetch);
  }
  setAuth(token) {
    this.headers.Authorization = `Bearer ${token}`;
  }
  invoke(functionName, invokeOptions = {}) {
    var _a;
    return __awaiter$d(this, void 0, void 0, function* () {
      try {
        const { headers, body: functionArgs } = invokeOptions;
        let _headers = {};
        let body;
        if (functionArgs && (headers && !Object.prototype.hasOwnProperty.call(headers, "Content-Type") || !headers)) {
          if (typeof Blob !== "undefined" && functionArgs instanceof Blob || functionArgs instanceof ArrayBuffer) {
            _headers["Content-Type"] = "application/octet-stream";
            body = functionArgs;
          } else if (typeof functionArgs === "string") {
            _headers["Content-Type"] = "text/plain";
            body = functionArgs;
          } else if (typeof FormData !== "undefined" && functionArgs instanceof FormData) {
            body = functionArgs;
          } else {
            _headers["Content-Type"] = "application/json";
            body = JSON.stringify(functionArgs);
          }
        }
        const response = yield this.fetch(`${this.url}/${functionName}`, {
          method: "POST",
          headers: Object.assign(Object.assign(Object.assign({}, _headers), this.headers), headers),
          body
        }).catch((fetchError) => {
          throw new FunctionsFetchError(fetchError);
        });
        const isRelayError = response.headers.get("x-relay-error");
        if (isRelayError && isRelayError === "true") {
          throw new FunctionsRelayError(response);
        }
        if (!response.ok) {
          throw new FunctionsHttpError(response);
        }
        let responseType = ((_a = response.headers.get("Content-Type")) !== null && _a !== void 0 ? _a : "text/plain").split(";")[0].trim();
        let data;
        if (responseType === "application/json") {
          data = yield response.json();
        } else if (responseType === "application/octet-stream") {
          data = yield response.blob();
        } else if (responseType === "multipart/form-data") {
          data = yield response.formData();
        } else {
          data = yield response.text();
        }
        return { data, error: null };
      } catch (error) {
        return { data: null, error };
      }
    });
  }
}
var __awaiter$c = globalThis && globalThis.__awaiter || function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
class PostgrestBuilder {
  constructor(builder) {
    this.shouldThrowOnError = false;
    this.method = builder.method;
    this.url = builder.url;
    this.headers = builder.headers;
    this.schema = builder.schema;
    this.body = builder.body;
    this.shouldThrowOnError = builder.shouldThrowOnError;
    this.signal = builder.signal;
    this.allowEmpty = builder.allowEmpty;
    if (builder.fetch) {
      this.fetch = builder.fetch;
    } else if (typeof fetch === "undefined") {
      this.fetch = crossFetch;
    } else {
      this.fetch = fetch;
    }
  }
  throwOnError() {
    this.shouldThrowOnError = true;
    return this;
  }
  then(onfulfilled, onrejected) {
    if (this.schema === void 0)
      ;
    else if (["GET", "HEAD"].includes(this.method)) {
      this.headers["Accept-Profile"] = this.schema;
    } else {
      this.headers["Content-Profile"] = this.schema;
    }
    if (this.method !== "GET" && this.method !== "HEAD") {
      this.headers["Content-Type"] = "application/json";
    }
    const _fetch = this.fetch;
    let res = _fetch(this.url.toString(), {
      method: this.method,
      headers: this.headers,
      body: JSON.stringify(this.body),
      signal: this.signal
    }).then((res2) => __awaiter$c(this, void 0, void 0, function* () {
      var _a, _b, _c;
      let error = null;
      let data = null;
      let count = null;
      let status = res2.status;
      let statusText = res2.statusText;
      if (res2.ok) {
        if (this.method !== "HEAD") {
          const body = yield res2.text();
          if (body === "")
            ;
          else if (this.headers["Accept"] === "text/csv") {
            data = body;
          } else if (this.headers["Accept"] && this.headers["Accept"].includes("application/vnd.pgrst.plan+text")) {
            data = body;
          } else {
            data = JSON.parse(body);
          }
        }
        const countHeader = (_a = this.headers["Prefer"]) === null || _a === void 0 ? void 0 : _a.match(/count=(exact|planned|estimated)/);
        const contentRange = (_b = res2.headers.get("content-range")) === null || _b === void 0 ? void 0 : _b.split("/");
        if (countHeader && contentRange && contentRange.length > 1) {
          count = parseInt(contentRange[1]);
        }
      } else {
        const body = yield res2.text();
        try {
          error = JSON.parse(body);
        } catch (_d) {
          error = {
            message: body
          };
        }
        if (error && this.allowEmpty && ((_c = error === null || error === void 0 ? void 0 : error.details) === null || _c === void 0 ? void 0 : _c.includes("Results contain 0 rows"))) {
          error = null;
          status = 200;
          statusText = "OK";
        }
        if (error && this.shouldThrowOnError) {
          throw error;
        }
      }
      const postgrestResponse = {
        error,
        data,
        count,
        status,
        statusText
      };
      return postgrestResponse;
    }));
    if (!this.shouldThrowOnError) {
      res = res.catch((fetchError) => ({
        error: {
          message: `FetchError: ${fetchError.message}`,
          details: "",
          hint: "",
          code: fetchError.code || ""
        },
        data: null,
        count: null,
        status: 0,
        statusText: ""
      }));
    }
    return res.then(onfulfilled, onrejected);
  }
}
class PostgrestTransformBuilder extends PostgrestBuilder {
  select(columns) {
    let quoted = false;
    const cleanedColumns = (columns !== null && columns !== void 0 ? columns : "*").split("").map((c) => {
      if (/\s/.test(c) && !quoted) {
        return "";
      }
      if (c === '"') {
        quoted = !quoted;
      }
      return c;
    }).join("");
    this.url.searchParams.set("select", cleanedColumns);
    if (this.headers["Prefer"]) {
      this.headers["Prefer"] += ",";
    }
    this.headers["Prefer"] += "return=representation";
    return this;
  }
  order(column, { ascending = true, nullsFirst, foreignTable } = {}) {
    const key = foreignTable ? `${foreignTable}.order` : "order";
    const existingOrder = this.url.searchParams.get(key);
    this.url.searchParams.set(key, `${existingOrder ? `${existingOrder},` : ""}${column}.${ascending ? "asc" : "desc"}${nullsFirst === void 0 ? "" : nullsFirst ? ".nullsfirst" : ".nullslast"}`);
    return this;
  }
  limit(count, { foreignTable } = {}) {
    const key = typeof foreignTable === "undefined" ? "limit" : `${foreignTable}.limit`;
    this.url.searchParams.set(key, `${count}`);
    return this;
  }
  range(from, to, { foreignTable } = {}) {
    const keyOffset = typeof foreignTable === "undefined" ? "offset" : `${foreignTable}.offset`;
    const keyLimit = typeof foreignTable === "undefined" ? "limit" : `${foreignTable}.limit`;
    this.url.searchParams.set(keyOffset, `${from}`);
    this.url.searchParams.set(keyLimit, `${to - from + 1}`);
    return this;
  }
  abortSignal(signal) {
    this.signal = signal;
    return this;
  }
  single() {
    this.headers["Accept"] = "application/vnd.pgrst.object+json";
    return this;
  }
  maybeSingle() {
    this.headers["Accept"] = "application/vnd.pgrst.object+json";
    this.allowEmpty = true;
    return this;
  }
  csv() {
    this.headers["Accept"] = "text/csv";
    return this;
  }
  geojson() {
    this.headers["Accept"] = "application/geo+json";
    return this;
  }
  explain({ analyze = false, verbose = false, settings = false, buffers = false, wal = false, format = "text" } = {}) {
    const options = [
      analyze ? "analyze" : null,
      verbose ? "verbose" : null,
      settings ? "settings" : null,
      buffers ? "buffers" : null,
      wal ? "wal" : null
    ].filter(Boolean).join("|");
    const forMediatype = this.headers["Accept"];
    this.headers["Accept"] = `application/vnd.pgrst.plan+${format}; for="${forMediatype}"; options=${options};`;
    if (format === "json")
      return this;
    else
      return this;
  }
  rollback() {
    var _a;
    if (((_a = this.headers["Prefer"]) !== null && _a !== void 0 ? _a : "").trim().length > 0) {
      this.headers["Prefer"] += ",tx=rollback";
    } else {
      this.headers["Prefer"] = "tx=rollback";
    }
    return this;
  }
  returns() {
    return this;
  }
}
class PostgrestFilterBuilder extends PostgrestTransformBuilder {
  eq(column, value) {
    this.url.searchParams.append(column, `eq.${value}`);
    return this;
  }
  neq(column, value) {
    this.url.searchParams.append(column, `neq.${value}`);
    return this;
  }
  gt(column, value) {
    this.url.searchParams.append(column, `gt.${value}`);
    return this;
  }
  gte(column, value) {
    this.url.searchParams.append(column, `gte.${value}`);
    return this;
  }
  lt(column, value) {
    this.url.searchParams.append(column, `lt.${value}`);
    return this;
  }
  lte(column, value) {
    this.url.searchParams.append(column, `lte.${value}`);
    return this;
  }
  like(column, pattern) {
    this.url.searchParams.append(column, `like.${pattern}`);
    return this;
  }
  ilike(column, pattern) {
    this.url.searchParams.append(column, `ilike.${pattern}`);
    return this;
  }
  is(column, value) {
    this.url.searchParams.append(column, `is.${value}`);
    return this;
  }
  in(column, values) {
    const cleanedValues = values.map((s) => {
      if (typeof s === "string" && new RegExp("[,()]").test(s))
        return `"${s}"`;
      else
        return `${s}`;
    }).join(",");
    this.url.searchParams.append(column, `in.(${cleanedValues})`);
    return this;
  }
  contains(column, value) {
    if (typeof value === "string") {
      this.url.searchParams.append(column, `cs.${value}`);
    } else if (Array.isArray(value)) {
      this.url.searchParams.append(column, `cs.{${value.join(",")}}`);
    } else {
      this.url.searchParams.append(column, `cs.${JSON.stringify(value)}`);
    }
    return this;
  }
  containedBy(column, value) {
    if (typeof value === "string") {
      this.url.searchParams.append(column, `cd.${value}`);
    } else if (Array.isArray(value)) {
      this.url.searchParams.append(column, `cd.{${value.join(",")}}`);
    } else {
      this.url.searchParams.append(column, `cd.${JSON.stringify(value)}`);
    }
    return this;
  }
  rangeGt(column, range) {
    this.url.searchParams.append(column, `sr.${range}`);
    return this;
  }
  rangeGte(column, range) {
    this.url.searchParams.append(column, `nxl.${range}`);
    return this;
  }
  rangeLt(column, range) {
    this.url.searchParams.append(column, `sl.${range}`);
    return this;
  }
  rangeLte(column, range) {
    this.url.searchParams.append(column, `nxr.${range}`);
    return this;
  }
  rangeAdjacent(column, range) {
    this.url.searchParams.append(column, `adj.${range}`);
    return this;
  }
  overlaps(column, value) {
    if (typeof value === "string") {
      this.url.searchParams.append(column, `ov.${value}`);
    } else {
      this.url.searchParams.append(column, `ov.{${value.join(",")}}`);
    }
    return this;
  }
  textSearch(column, query, { config: config2, type } = {}) {
    let typePart = "";
    if (type === "plain") {
      typePart = "pl";
    } else if (type === "phrase") {
      typePart = "ph";
    } else if (type === "websearch") {
      typePart = "w";
    }
    const configPart = config2 === void 0 ? "" : `(${config2})`;
    this.url.searchParams.append(column, `${typePart}fts${configPart}.${query}`);
    return this;
  }
  match(query) {
    Object.entries(query).forEach(([column, value]) => {
      this.url.searchParams.append(column, `eq.${value}`);
    });
    return this;
  }
  not(column, operator, value) {
    this.url.searchParams.append(column, `not.${operator}.${value}`);
    return this;
  }
  or(filters, { foreignTable } = {}) {
    const key = foreignTable ? `${foreignTable}.or` : "or";
    this.url.searchParams.append(key, `(${filters})`);
    return this;
  }
  filter(column, operator, value) {
    this.url.searchParams.append(column, `${operator}.${value}`);
    return this;
  }
}
class PostgrestQueryBuilder {
  constructor(url2, { headers = {}, schema, fetch: fetch2 }) {
    this.url = url2;
    this.headers = headers;
    this.schema = schema;
    this.fetch = fetch2;
  }
  select(columns, { head = false, count } = {}) {
    const method = head ? "HEAD" : "GET";
    let quoted = false;
    const cleanedColumns = (columns !== null && columns !== void 0 ? columns : "*").split("").map((c) => {
      if (/\s/.test(c) && !quoted) {
        return "";
      }
      if (c === '"') {
        quoted = !quoted;
      }
      return c;
    }).join("");
    this.url.searchParams.set("select", cleanedColumns);
    if (count) {
      this.headers["Prefer"] = `count=${count}`;
    }
    return new PostgrestFilterBuilder({
      method,
      url: this.url,
      headers: this.headers,
      schema: this.schema,
      fetch: this.fetch,
      allowEmpty: false
    });
  }
  insert(values, { count } = {}) {
    const method = "POST";
    const prefersHeaders = [];
    const body = values;
    if (count) {
      prefersHeaders.push(`count=${count}`);
    }
    if (this.headers["Prefer"]) {
      prefersHeaders.unshift(this.headers["Prefer"]);
    }
    this.headers["Prefer"] = prefersHeaders.join(",");
    if (Array.isArray(values)) {
      const columns = values.reduce((acc, x) => acc.concat(Object.keys(x)), []);
      if (columns.length > 0) {
        const uniqueColumns = [...new Set(columns)].map((column) => `"${column}"`);
        this.url.searchParams.set("columns", uniqueColumns.join(","));
      }
    }
    return new PostgrestFilterBuilder({
      method,
      url: this.url,
      headers: this.headers,
      schema: this.schema,
      body,
      fetch: this.fetch,
      allowEmpty: false
    });
  }
  upsert(values, { onConflict, ignoreDuplicates = false, count } = {}) {
    const method = "POST";
    const prefersHeaders = [`resolution=${ignoreDuplicates ? "ignore" : "merge"}-duplicates`];
    if (onConflict !== void 0)
      this.url.searchParams.set("on_conflict", onConflict);
    const body = values;
    if (count) {
      prefersHeaders.push(`count=${count}`);
    }
    if (this.headers["Prefer"]) {
      prefersHeaders.unshift(this.headers["Prefer"]);
    }
    this.headers["Prefer"] = prefersHeaders.join(",");
    return new PostgrestFilterBuilder({
      method,
      url: this.url,
      headers: this.headers,
      schema: this.schema,
      body,
      fetch: this.fetch,
      allowEmpty: false
    });
  }
  update(values, { count } = {}) {
    const method = "PATCH";
    const prefersHeaders = [];
    const body = values;
    if (count) {
      prefersHeaders.push(`count=${count}`);
    }
    if (this.headers["Prefer"]) {
      prefersHeaders.unshift(this.headers["Prefer"]);
    }
    this.headers["Prefer"] = prefersHeaders.join(",");
    return new PostgrestFilterBuilder({
      method,
      url: this.url,
      headers: this.headers,
      schema: this.schema,
      body,
      fetch: this.fetch,
      allowEmpty: false
    });
  }
  delete({ count } = {}) {
    const method = "DELETE";
    const prefersHeaders = [];
    if (count) {
      prefersHeaders.push(`count=${count}`);
    }
    if (this.headers["Prefer"]) {
      prefersHeaders.unshift(this.headers["Prefer"]);
    }
    this.headers["Prefer"] = prefersHeaders.join(",");
    return new PostgrestFilterBuilder({
      method,
      url: this.url,
      headers: this.headers,
      schema: this.schema,
      fetch: this.fetch,
      allowEmpty: false
    });
  }
}
const version$6 = "1.1.0";
const DEFAULT_HEADERS$4 = { "X-Client-Info": `postgrest-js/${version$6}` };
class PostgrestClient {
  constructor(url2, { headers = {}, schema, fetch: fetch2 } = {}) {
    this.url = url2;
    this.headers = Object.assign(Object.assign({}, DEFAULT_HEADERS$4), headers);
    this.schema = schema;
    this.fetch = fetch2;
  }
  from(relation) {
    const url2 = new URL(`${this.url}/${relation}`);
    return new PostgrestQueryBuilder(url2, {
      headers: Object.assign({}, this.headers),
      schema: this.schema,
      fetch: this.fetch
    });
  }
  rpc(fn, args = {}, { head = false, count } = {}) {
    let method;
    const url2 = new URL(`${this.url}/rpc/${fn}`);
    let body;
    if (head) {
      method = "HEAD";
      Object.entries(args).forEach(([name2, value]) => {
        url2.searchParams.append(name2, `${value}`);
      });
    } else {
      method = "POST";
      body = args;
    }
    const headers = Object.assign({}, this.headers);
    if (count) {
      headers["Prefer"] = `count=${count}`;
    }
    return new PostgrestFilterBuilder({
      method,
      url: url2,
      headers,
      schema: this.schema,
      body,
      fetch: this.fetch,
      allowEmpty: false
    });
  }
}
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
var websocket$1 = { exports: {} };
var utils$3 = {};
var noop$2 = utils$3.noop = function() {
};
utils$3.extend = function extend(dest, source) {
  for (var prop in source) {
    dest[prop] = source[prop];
  }
};
utils$3.eventEmitterListenerCount = require$$2.EventEmitter.listenerCount || function(emitter, type) {
  return emitter.listeners(type).length;
};
utils$3.bufferAllocUnsafe = Buffer.allocUnsafe ? Buffer.allocUnsafe : function oldBufferAllocUnsafe(size) {
  return new Buffer(size);
};
utils$3.bufferFromString = Buffer.from ? Buffer.from : function oldBufferFromString(string, encoding) {
  return new Buffer(string, encoding);
};
utils$3.BufferingLogger = function createBufferingLogger(identifier, uniqueID) {
  var logFunction = require$$1(identifier);
  if (logFunction.enabled) {
    var logger = new BufferingLogger(identifier, uniqueID, logFunction);
    var debug2 = logger.log.bind(logger);
    debug2.printOutput = logger.printOutput.bind(logger);
    debug2.enabled = logFunction.enabled;
    return debug2;
  }
  logFunction.printOutput = noop$2;
  return logFunction;
};
function BufferingLogger(identifier, uniqueID, logFunction) {
  this.logFunction = logFunction;
  this.identifier = identifier;
  this.uniqueID = uniqueID;
  this.buffer = [];
}
BufferingLogger.prototype.log = function() {
  this.buffer.push([new Date(), Array.prototype.slice.call(arguments)]);
  return this;
};
BufferingLogger.prototype.clear = function() {
  this.buffer = [];
  return this;
};
BufferingLogger.prototype.printOutput = function(logFunction) {
  if (!logFunction) {
    logFunction = this.logFunction;
  }
  var uniqueID = this.uniqueID;
  this.buffer.forEach(function(entry2) {
    var date = entry2[0].toLocaleString();
    var args = entry2[1].slice();
    var formatString = args[0];
    if (formatString !== void 0 && formatString !== null) {
      formatString = "%s - %s - " + formatString.toString();
      args.splice(0, 1, formatString, date, uniqueID);
      logFunction.apply(commonjsGlobal, args);
    }
  });
};
var bufferUtil = require$$0$1;
var bufferAllocUnsafe$3 = utils$3.bufferAllocUnsafe;
const DECODE_HEADER = 1;
const WAITING_FOR_16_BIT_LENGTH = 2;
const WAITING_FOR_64_BIT_LENGTH = 3;
const WAITING_FOR_MASK_KEY = 4;
const WAITING_FOR_PAYLOAD = 5;
const COMPLETE = 6;
function WebSocketFrame$1(maskBytes, frameHeader, config2) {
  this.maskBytes = maskBytes;
  this.frameHeader = frameHeader;
  this.config = config2;
  this.maxReceivedFrameSize = config2.maxReceivedFrameSize;
  this.protocolError = false;
  this.frameTooLarge = false;
  this.invalidCloseFrameLength = false;
  this.parseState = DECODE_HEADER;
  this.closeStatus = -1;
}
WebSocketFrame$1.prototype.addData = function(bufferList) {
  if (this.parseState === DECODE_HEADER) {
    if (bufferList.length >= 2) {
      bufferList.joinInto(this.frameHeader, 0, 0, 2);
      bufferList.advance(2);
      var firstByte = this.frameHeader[0];
      var secondByte = this.frameHeader[1];
      this.fin = Boolean(firstByte & 128);
      this.rsv1 = Boolean(firstByte & 64);
      this.rsv2 = Boolean(firstByte & 32);
      this.rsv3 = Boolean(firstByte & 16);
      this.mask = Boolean(secondByte & 128);
      this.opcode = firstByte & 15;
      this.length = secondByte & 127;
      if (this.opcode >= 8) {
        if (this.length > 125) {
          this.protocolError = true;
          this.dropReason = "Illegal control frame longer than 125 bytes.";
          return true;
        }
        if (!this.fin) {
          this.protocolError = true;
          this.dropReason = "Control frames must not be fragmented.";
          return true;
        }
      }
      if (this.length === 126) {
        this.parseState = WAITING_FOR_16_BIT_LENGTH;
      } else if (this.length === 127) {
        this.parseState = WAITING_FOR_64_BIT_LENGTH;
      } else {
        this.parseState = WAITING_FOR_MASK_KEY;
      }
    }
  }
  if (this.parseState === WAITING_FOR_16_BIT_LENGTH) {
    if (bufferList.length >= 2) {
      bufferList.joinInto(this.frameHeader, 2, 0, 2);
      bufferList.advance(2);
      this.length = this.frameHeader.readUInt16BE(2);
      this.parseState = WAITING_FOR_MASK_KEY;
    }
  } else if (this.parseState === WAITING_FOR_64_BIT_LENGTH) {
    if (bufferList.length >= 8) {
      bufferList.joinInto(this.frameHeader, 2, 0, 8);
      bufferList.advance(8);
      var lengthPair = [
        this.frameHeader.readUInt32BE(2),
        this.frameHeader.readUInt32BE(2 + 4)
      ];
      if (lengthPair[0] !== 0) {
        this.protocolError = true;
        this.dropReason = "Unsupported 64-bit length frame received";
        return true;
      }
      this.length = lengthPair[1];
      this.parseState = WAITING_FOR_MASK_KEY;
    }
  }
  if (this.parseState === WAITING_FOR_MASK_KEY) {
    if (this.mask) {
      if (bufferList.length >= 4) {
        bufferList.joinInto(this.maskBytes, 0, 0, 4);
        bufferList.advance(4);
        this.parseState = WAITING_FOR_PAYLOAD;
      }
    } else {
      this.parseState = WAITING_FOR_PAYLOAD;
    }
  }
  if (this.parseState === WAITING_FOR_PAYLOAD) {
    if (this.length > this.maxReceivedFrameSize) {
      this.frameTooLarge = true;
      this.dropReason = "Frame size of " + this.length.toString(10) + " bytes exceeds maximum accepted frame size";
      return true;
    }
    if (this.length === 0) {
      this.binaryPayload = bufferAllocUnsafe$3(0);
      this.parseState = COMPLETE;
      return true;
    }
    if (bufferList.length >= this.length) {
      this.binaryPayload = bufferList.take(this.length);
      bufferList.advance(this.length);
      if (this.mask) {
        bufferUtil.unmask(this.binaryPayload, this.maskBytes);
      }
      if (this.opcode === 8) {
        if (this.length === 1) {
          this.binaryPayload = bufferAllocUnsafe$3(0);
          this.invalidCloseFrameLength = true;
        }
        if (this.length >= 2) {
          this.closeStatus = this.binaryPayload.readUInt16BE(0);
          this.binaryPayload = this.binaryPayload.slice(2);
        }
      }
      this.parseState = COMPLETE;
      return true;
    }
  }
  return false;
};
WebSocketFrame$1.prototype.throwAwayPayload = function(bufferList) {
  if (bufferList.length >= this.length) {
    bufferList.advance(this.length);
    this.parseState = COMPLETE;
    return true;
  }
  return false;
};
WebSocketFrame$1.prototype.toBuffer = function(nullMask) {
  var maskKey;
  var headerLength = 2;
  var data;
  var outputPos;
  var firstByte = 0;
  var secondByte = 0;
  if (this.fin) {
    firstByte |= 128;
  }
  if (this.rsv1) {
    firstByte |= 64;
  }
  if (this.rsv2) {
    firstByte |= 32;
  }
  if (this.rsv3) {
    firstByte |= 16;
  }
  if (this.mask) {
    secondByte |= 128;
  }
  firstByte |= this.opcode & 15;
  if (this.opcode === 8) {
    this.length = 2;
    if (this.binaryPayload) {
      this.length += this.binaryPayload.length;
    }
    data = bufferAllocUnsafe$3(this.length);
    data.writeUInt16BE(this.closeStatus, 0);
    if (this.length > 2) {
      this.binaryPayload.copy(data, 2);
    }
  } else if (this.binaryPayload) {
    data = this.binaryPayload;
    this.length = data.length;
  } else {
    this.length = 0;
  }
  if (this.length <= 125) {
    secondByte |= this.length & 127;
  } else if (this.length > 125 && this.length <= 65535) {
    secondByte |= 126;
    headerLength += 2;
  } else if (this.length > 65535) {
    secondByte |= 127;
    headerLength += 8;
  }
  var output = bufferAllocUnsafe$3(this.length + headerLength + (this.mask ? 4 : 0));
  output[0] = firstByte;
  output[1] = secondByte;
  outputPos = 2;
  if (this.length > 125 && this.length <= 65535) {
    output.writeUInt16BE(this.length, outputPos);
    outputPos += 2;
  } else if (this.length > 65535) {
    output.writeUInt32BE(0, outputPos);
    output.writeUInt32BE(this.length, outputPos + 4);
    outputPos += 8;
  }
  if (this.mask) {
    maskKey = nullMask ? 0 : Math.random() * 4294967295 >>> 0;
    this.maskBytes.writeUInt32BE(maskKey, 0);
    this.maskBytes.copy(output, outputPos);
    outputPos += 4;
    if (data) {
      bufferUtil.mask(data, this.maskBytes, output, outputPos, this.length);
    }
  } else if (data) {
    data.copy(output, outputPos);
  }
  return output;
};
WebSocketFrame$1.prototype.toString = function() {
  return "Opcode: " + this.opcode + ", fin: " + this.fin + ", length: " + this.length + ", hasPayload: " + Boolean(this.binaryPayload) + ", masked: " + this.mask;
};
var WebSocketFrame_1 = WebSocketFrame$1;
var FastBufferList = { exports: {} };
var Buffer$1 = require$$0$2.Buffer;
var EventEmitter$6 = require$$2.EventEmitter;
var bufferAllocUnsafe$2 = utils$3.bufferAllocUnsafe;
FastBufferList.exports = BufferList$1;
FastBufferList.exports.BufferList = BufferList$1;
function BufferList$1(opts) {
  if (!(this instanceof BufferList$1))
    return new BufferList$1(opts);
  EventEmitter$6.call(this);
  var self2 = this;
  if (typeof opts == "undefined")
    opts = {};
  self2.encoding = opts.encoding;
  var head = { next: null, buffer: null };
  var last = { next: null, buffer: null };
  var length = 0;
  self2.__defineGetter__("length", function() {
    return length;
  });
  var offset = 0;
  self2.write = function(buf) {
    if (!head.buffer) {
      head.buffer = buf;
      last = head;
    } else {
      last.next = { next: null, buffer: buf };
      last = last.next;
    }
    length += buf.length;
    self2.emit("write", buf);
    return true;
  };
  self2.end = function(buf) {
    if (Buffer$1.isBuffer(buf))
      self2.write(buf);
  };
  self2.push = function() {
    var args = [].concat.apply([], arguments);
    args.forEach(self2.write);
    return self2;
  };
  self2.forEach = function(fn) {
    if (!head.buffer)
      return bufferAllocUnsafe$2(0);
    if (head.buffer.length - offset <= 0)
      return self2;
    var firstBuf = head.buffer.slice(offset);
    var b = { buffer: firstBuf, next: head.next };
    while (b && b.buffer) {
      var r = fn(b.buffer);
      if (r)
        break;
      b = b.next;
    }
    return self2;
  };
  self2.join = function(start, end) {
    if (!head.buffer)
      return bufferAllocUnsafe$2(0);
    if (start == void 0)
      start = 0;
    if (end == void 0)
      end = self2.length;
    var big = bufferAllocUnsafe$2(end - start);
    var ix = 0;
    self2.forEach(function(buffer) {
      if (start < ix + buffer.length && ix < end) {
        buffer.copy(
          big,
          Math.max(0, ix - start),
          Math.max(0, start - ix),
          Math.min(buffer.length, end - ix)
        );
      }
      ix += buffer.length;
      if (ix > end)
        return true;
    });
    return big;
  };
  self2.joinInto = function(targetBuffer, targetStart, sourceStart, sourceEnd) {
    if (!head.buffer)
      return new bufferAllocUnsafe$2(0);
    if (sourceStart == void 0)
      sourceStart = 0;
    if (sourceEnd == void 0)
      sourceEnd = self2.length;
    var big = targetBuffer;
    if (big.length - targetStart < sourceEnd - sourceStart) {
      throw new Error("Insufficient space available in target Buffer.");
    }
    var ix = 0;
    self2.forEach(function(buffer) {
      if (sourceStart < ix + buffer.length && ix < sourceEnd) {
        buffer.copy(
          big,
          Math.max(targetStart, targetStart + ix - sourceStart),
          Math.max(0, sourceStart - ix),
          Math.min(buffer.length, sourceEnd - ix)
        );
      }
      ix += buffer.length;
      if (ix > sourceEnd)
        return true;
    });
    return big;
  };
  self2.advance = function(n) {
    offset += n;
    length -= n;
    while (head.buffer && offset >= head.buffer.length) {
      offset -= head.buffer.length;
      head = head.next ? head.next : { buffer: null, next: null };
    }
    if (head.buffer === null)
      last = { next: null, buffer: null };
    self2.emit("advance", n);
    return self2;
  };
  self2.take = function(n, encoding) {
    if (n == void 0)
      n = self2.length;
    else if (typeof n !== "number") {
      encoding = n;
      n = self2.length;
    }
    if (!encoding)
      encoding = self2.encoding;
    if (encoding) {
      var acc = "";
      self2.forEach(function(buffer) {
        if (n <= 0)
          return true;
        acc += buffer.toString(
          encoding,
          0,
          Math.min(n, buffer.length)
        );
        n -= buffer.length;
      });
      return acc;
    } else {
      return self2.join(0, n);
    }
  };
  self2.toString = function() {
    return self2.take("binary");
  };
}
require$$1$1.inherits(BufferList$1, EventEmitter$6);
var util$5 = require$$1$1;
var utils$2 = utils$3;
var EventEmitter$5 = require$$2.EventEmitter;
var WebSocketFrame = WebSocketFrame_1;
var BufferList = FastBufferList.exports;
var isValidUTF8 = require$$5;
var bufferAllocUnsafe$1 = utils$2.bufferAllocUnsafe;
var bufferFromString = utils$2.bufferFromString;
const STATE_OPEN = "open";
const STATE_PEER_REQUESTED_CLOSE = "peer_requested_close";
const STATE_ENDING = "ending";
const STATE_CLOSED = "closed";
var setImmediateImpl = "setImmediate" in commonjsGlobal ? commonjsGlobal.setImmediate.bind(commonjsGlobal) : process.nextTick.bind(process);
var idCounter = 0;
function WebSocketConnection$2(socket, extensions, protocol, maskOutgoingPackets, config2) {
  this._debug = utils$2.BufferingLogger("websocket:connection", ++idCounter);
  this._debug("constructor");
  if (this._debug.enabled) {
    instrumentSocketForDebugging(this, socket);
  }
  EventEmitter$5.call(this);
  this._pingListenerCount = 0;
  this.on("newListener", function(ev) {
    if (ev === "ping") {
      this._pingListenerCount++;
    }
  }).on("removeListener", function(ev) {
    if (ev === "ping") {
      this._pingListenerCount--;
    }
  });
  this.config = config2;
  this.socket = socket;
  this.protocol = protocol;
  this.extensions = extensions;
  this.remoteAddress = socket.remoteAddress;
  this.closeReasonCode = -1;
  this.closeDescription = null;
  this.closeEventEmitted = false;
  this.maskOutgoingPackets = maskOutgoingPackets;
  this.maskBytes = bufferAllocUnsafe$1(4);
  this.frameHeader = bufferAllocUnsafe$1(10);
  this.bufferList = new BufferList();
  this.currentFrame = new WebSocketFrame(this.maskBytes, this.frameHeader, this.config);
  this.fragmentationSize = 0;
  this.frameQueue = [];
  this.connected = true;
  this.state = STATE_OPEN;
  this.waitingForCloseResponse = false;
  this.receivedEnd = false;
  this.closeTimeout = this.config.closeTimeout;
  this.assembleFragments = this.config.assembleFragments;
  this.maxReceivedMessageSize = this.config.maxReceivedMessageSize;
  this.outputBufferFull = false;
  this.inputPaused = false;
  this.receivedDataHandler = this.processReceivedData.bind(this);
  this._closeTimerHandler = this.handleCloseTimer.bind(this);
  this.socket.setNoDelay(this.config.disableNagleAlgorithm);
  this.socket.setTimeout(0);
  if (this.config.keepalive && !this.config.useNativeKeepalive) {
    if (typeof this.config.keepaliveInterval !== "number") {
      throw new Error("keepaliveInterval must be specified and numeric if keepalive is true.");
    }
    this._keepaliveTimerHandler = this.handleKeepaliveTimer.bind(this);
    this.setKeepaliveTimer();
    if (this.config.dropConnectionOnKeepaliveTimeout) {
      if (typeof this.config.keepaliveGracePeriod !== "number") {
        throw new Error("keepaliveGracePeriod  must be specified and numeric if dropConnectionOnKeepaliveTimeout is true.");
      }
      this._gracePeriodTimerHandler = this.handleGracePeriodTimer.bind(this);
    }
  } else if (this.config.keepalive && this.config.useNativeKeepalive) {
    if (!("setKeepAlive" in this.socket)) {
      throw new Error("Unable to use native keepalive: unsupported by this version of Node.");
    }
    this.socket.setKeepAlive(true, this.config.keepaliveInterval);
  }
  this.socket.removeAllListeners("error");
}
WebSocketConnection$2.CLOSE_REASON_NORMAL = 1e3;
WebSocketConnection$2.CLOSE_REASON_GOING_AWAY = 1001;
WebSocketConnection$2.CLOSE_REASON_PROTOCOL_ERROR = 1002;
WebSocketConnection$2.CLOSE_REASON_UNPROCESSABLE_INPUT = 1003;
WebSocketConnection$2.CLOSE_REASON_RESERVED = 1004;
WebSocketConnection$2.CLOSE_REASON_NOT_PROVIDED = 1005;
WebSocketConnection$2.CLOSE_REASON_ABNORMAL = 1006;
WebSocketConnection$2.CLOSE_REASON_INVALID_DATA = 1007;
WebSocketConnection$2.CLOSE_REASON_POLICY_VIOLATION = 1008;
WebSocketConnection$2.CLOSE_REASON_MESSAGE_TOO_BIG = 1009;
WebSocketConnection$2.CLOSE_REASON_EXTENSION_REQUIRED = 1010;
WebSocketConnection$2.CLOSE_REASON_INTERNAL_SERVER_ERROR = 1011;
WebSocketConnection$2.CLOSE_REASON_TLS_HANDSHAKE_FAILED = 1015;
WebSocketConnection$2.CLOSE_DESCRIPTIONS = {
  1e3: "Normal connection closure",
  1001: "Remote peer is going away",
  1002: "Protocol error",
  1003: "Unprocessable input",
  1004: "Reserved",
  1005: "Reason not provided",
  1006: "Abnormal closure, no further detail available",
  1007: "Invalid data received",
  1008: "Policy violation",
  1009: "Message too big",
  1010: "Extension requested by client is required",
  1011: "Internal Server Error",
  1015: "TLS Handshake Failed"
};
function validateCloseReason(code) {
  if (code < 1e3) {
    return false;
  }
  if (code >= 1e3 && code <= 2999) {
    return [1e3, 1001, 1002, 1003, 1007, 1008, 1009, 1010, 1011, 1012, 1013, 1014, 1015].indexOf(code) !== -1;
  }
  if (code >= 3e3 && code <= 3999) {
    return true;
  }
  if (code >= 4e3 && code <= 4999) {
    return true;
  }
  if (code >= 5e3) {
    return false;
  }
}
util$5.inherits(WebSocketConnection$2, EventEmitter$5);
WebSocketConnection$2.prototype._addSocketEventListeners = function() {
  this.socket.on("error", this.handleSocketError.bind(this));
  this.socket.on("end", this.handleSocketEnd.bind(this));
  this.socket.on("close", this.handleSocketClose.bind(this));
  this.socket.on("drain", this.handleSocketDrain.bind(this));
  this.socket.on("pause", this.handleSocketPause.bind(this));
  this.socket.on("resume", this.handleSocketResume.bind(this));
  this.socket.on("data", this.handleSocketData.bind(this));
};
WebSocketConnection$2.prototype.setKeepaliveTimer = function() {
  this._debug("setKeepaliveTimer");
  if (!this.config.keepalive || this.config.useNativeKeepalive) {
    return;
  }
  this.clearKeepaliveTimer();
  this.clearGracePeriodTimer();
  this._keepaliveTimeoutID = setTimeout(this._keepaliveTimerHandler, this.config.keepaliveInterval);
};
WebSocketConnection$2.prototype.clearKeepaliveTimer = function() {
  if (this._keepaliveTimeoutID) {
    clearTimeout(this._keepaliveTimeoutID);
  }
};
WebSocketConnection$2.prototype.handleKeepaliveTimer = function() {
  this._debug("handleKeepaliveTimer");
  this._keepaliveTimeoutID = null;
  this.ping();
  if (this.config.dropConnectionOnKeepaliveTimeout) {
    this.setGracePeriodTimer();
  } else {
    this.setKeepaliveTimer();
  }
};
WebSocketConnection$2.prototype.setGracePeriodTimer = function() {
  this._debug("setGracePeriodTimer");
  this.clearGracePeriodTimer();
  this._gracePeriodTimeoutID = setTimeout(this._gracePeriodTimerHandler, this.config.keepaliveGracePeriod);
};
WebSocketConnection$2.prototype.clearGracePeriodTimer = function() {
  if (this._gracePeriodTimeoutID) {
    clearTimeout(this._gracePeriodTimeoutID);
  }
};
WebSocketConnection$2.prototype.handleGracePeriodTimer = function() {
  this._debug("handleGracePeriodTimer");
  this._gracePeriodTimeoutID = null;
  this.drop(WebSocketConnection$2.CLOSE_REASON_ABNORMAL, "Peer not responding.", true);
};
WebSocketConnection$2.prototype.handleSocketData = function(data) {
  this._debug("handleSocketData");
  this.setKeepaliveTimer();
  this.bufferList.write(data);
  this.processReceivedData();
};
WebSocketConnection$2.prototype.processReceivedData = function() {
  this._debug("processReceivedData");
  if (!this.connected) {
    return;
  }
  if (this.inputPaused) {
    return;
  }
  var frame = this.currentFrame;
  if (!frame.addData(this.bufferList)) {
    this._debug("-- insufficient data for frame");
    return;
  }
  var self2 = this;
  if (frame.protocolError) {
    this._debug("-- protocol error");
    process.nextTick(function() {
      self2.drop(WebSocketConnection$2.CLOSE_REASON_PROTOCOL_ERROR, frame.dropReason);
    });
    return;
  } else if (frame.frameTooLarge) {
    this._debug("-- frame too large");
    process.nextTick(function() {
      self2.drop(WebSocketConnection$2.CLOSE_REASON_MESSAGE_TOO_BIG, frame.dropReason);
    });
    return;
  }
  if (frame.rsv1 || frame.rsv2 || frame.rsv3) {
    this._debug("-- illegal rsv flag");
    process.nextTick(function() {
      self2.drop(
        WebSocketConnection$2.CLOSE_REASON_PROTOCOL_ERROR,
        "Unsupported usage of rsv bits without negotiated extension."
      );
    });
    return;
  }
  if (!this.assembleFragments) {
    this._debug("-- emitting frame");
    process.nextTick(function() {
      self2.emit("frame", frame);
    });
  }
  process.nextTick(function() {
    self2.processFrame(frame);
  });
  this.currentFrame = new WebSocketFrame(this.maskBytes, this.frameHeader, this.config);
  if (this.bufferList.length > 0) {
    setImmediateImpl(this.receivedDataHandler);
  }
};
WebSocketConnection$2.prototype.handleSocketError = function(error) {
  this._debug("handleSocketError: %j", error);
  if (this.state === STATE_CLOSED) {
    this._debug("  --- Socket 'error' after 'close'");
    return;
  }
  this.closeReasonCode = WebSocketConnection$2.CLOSE_REASON_ABNORMAL;
  this.closeDescription = "Socket Error: " + error.syscall + " " + error.code;
  this.connected = false;
  this.state = STATE_CLOSED;
  this.fragmentationSize = 0;
  if (utils$2.eventEmitterListenerCount(this, "error") > 0) {
    this.emit("error", error);
  }
  this.socket.destroy();
  this._debug.printOutput();
};
WebSocketConnection$2.prototype.handleSocketEnd = function() {
  this._debug("handleSocketEnd: received socket end.  state = %s", this.state);
  this.receivedEnd = true;
  if (this.state === STATE_CLOSED) {
    this._debug("  --- Socket 'end' after 'close'");
    return;
  }
  if (this.state !== STATE_PEER_REQUESTED_CLOSE && this.state !== STATE_ENDING) {
    this._debug("  --- UNEXPECTED socket end.");
    this.socket.end();
  }
};
WebSocketConnection$2.prototype.handleSocketClose = function(hadError) {
  this._debug("handleSocketClose: received socket close");
  this.socketHadError = hadError;
  this.connected = false;
  this.state = STATE_CLOSED;
  if (this.closeReasonCode === -1) {
    this.closeReasonCode = WebSocketConnection$2.CLOSE_REASON_ABNORMAL;
    this.closeDescription = "Connection dropped by remote peer.";
  }
  this.clearCloseTimer();
  this.clearKeepaliveTimer();
  this.clearGracePeriodTimer();
  if (!this.closeEventEmitted) {
    this.closeEventEmitted = true;
    this._debug("-- Emitting WebSocketConnection close event");
    this.emit("close", this.closeReasonCode, this.closeDescription);
  }
};
WebSocketConnection$2.prototype.handleSocketDrain = function() {
  this._debug("handleSocketDrain: socket drain event");
  this.outputBufferFull = false;
  this.emit("drain");
};
WebSocketConnection$2.prototype.handleSocketPause = function() {
  this._debug("handleSocketPause: socket pause event");
  this.inputPaused = true;
  this.emit("pause");
};
WebSocketConnection$2.prototype.handleSocketResume = function() {
  this._debug("handleSocketResume: socket resume event");
  this.inputPaused = false;
  this.emit("resume");
  this.processReceivedData();
};
WebSocketConnection$2.prototype.pause = function() {
  this._debug("pause: pause requested");
  this.socket.pause();
};
WebSocketConnection$2.prototype.resume = function() {
  this._debug("resume: resume requested");
  this.socket.resume();
};
WebSocketConnection$2.prototype.close = function(reasonCode, description2) {
  if (this.connected) {
    this._debug("close: Initating clean WebSocket close sequence.");
    if ("number" !== typeof reasonCode) {
      reasonCode = WebSocketConnection$2.CLOSE_REASON_NORMAL;
    }
    if (!validateCloseReason(reasonCode)) {
      throw new Error("Close code " + reasonCode + " is not valid.");
    }
    if ("string" !== typeof description2) {
      description2 = WebSocketConnection$2.CLOSE_DESCRIPTIONS[reasonCode];
    }
    this.closeReasonCode = reasonCode;
    this.closeDescription = description2;
    this.setCloseTimer();
    this.sendCloseFrame(this.closeReasonCode, this.closeDescription);
    this.state = STATE_ENDING;
    this.connected = false;
  }
};
WebSocketConnection$2.prototype.drop = function(reasonCode, description2, skipCloseFrame) {
  this._debug("drop");
  if (typeof reasonCode !== "number") {
    reasonCode = WebSocketConnection$2.CLOSE_REASON_PROTOCOL_ERROR;
  }
  if (typeof description2 !== "string") {
    description2 = WebSocketConnection$2.CLOSE_DESCRIPTIONS[reasonCode];
  }
  this._debug(
    "Forcefully dropping connection. skipCloseFrame: %s, code: %d, description: %s",
    skipCloseFrame,
    reasonCode,
    description2
  );
  this.closeReasonCode = reasonCode;
  this.closeDescription = description2;
  this.frameQueue = [];
  this.fragmentationSize = 0;
  if (!skipCloseFrame) {
    this.sendCloseFrame(reasonCode, description2);
  }
  this.connected = false;
  this.state = STATE_CLOSED;
  this.clearCloseTimer();
  this.clearKeepaliveTimer();
  this.clearGracePeriodTimer();
  if (!this.closeEventEmitted) {
    this.closeEventEmitted = true;
    this._debug("Emitting WebSocketConnection close event");
    this.emit("close", this.closeReasonCode, this.closeDescription);
  }
  this._debug("Drop: destroying socket");
  this.socket.destroy();
};
WebSocketConnection$2.prototype.setCloseTimer = function() {
  this._debug("setCloseTimer");
  this.clearCloseTimer();
  this._debug("Setting close timer");
  this.waitingForCloseResponse = true;
  this.closeTimer = setTimeout(this._closeTimerHandler, this.closeTimeout);
};
WebSocketConnection$2.prototype.clearCloseTimer = function() {
  this._debug("clearCloseTimer");
  if (this.closeTimer) {
    this._debug("Clearing close timer");
    clearTimeout(this.closeTimer);
    this.waitingForCloseResponse = false;
    this.closeTimer = null;
  }
};
WebSocketConnection$2.prototype.handleCloseTimer = function() {
  this._debug("handleCloseTimer");
  this.closeTimer = null;
  if (this.waitingForCloseResponse) {
    this._debug("Close response not received from client.  Forcing socket end.");
    this.waitingForCloseResponse = false;
    this.state = STATE_CLOSED;
    this.socket.end();
  }
};
WebSocketConnection$2.prototype.processFrame = function(frame) {
  this._debug("processFrame");
  this._debug(" -- frame: %s", frame);
  if (this.frameQueue.length !== 0 && (frame.opcode > 0 && frame.opcode < 8)) {
    this.drop(
      WebSocketConnection$2.CLOSE_REASON_PROTOCOL_ERROR,
      "Illegal frame opcode 0x" + frame.opcode.toString(16) + " received in middle of fragmented message."
    );
    return;
  }
  switch (frame.opcode) {
    case 2:
      this._debug("-- Binary Frame");
      if (this.assembleFragments) {
        if (frame.fin) {
          this._debug("---- Emitting 'message' event");
          this.emit("message", {
            type: "binary",
            binaryData: frame.binaryPayload
          });
        } else {
          this.frameQueue.push(frame);
          this.fragmentationSize = frame.length;
        }
      }
      break;
    case 1:
      this._debug("-- Text Frame");
      if (this.assembleFragments) {
        if (frame.fin) {
          if (!isValidUTF8(frame.binaryPayload)) {
            this.drop(
              WebSocketConnection$2.CLOSE_REASON_INVALID_DATA,
              "Invalid UTF-8 Data Received"
            );
            return;
          }
          this._debug("---- Emitting 'message' event");
          this.emit("message", {
            type: "utf8",
            utf8Data: frame.binaryPayload.toString("utf8")
          });
        } else {
          this.frameQueue.push(frame);
          this.fragmentationSize = frame.length;
        }
      }
      break;
    case 0:
      this._debug("-- Continuation Frame");
      if (this.assembleFragments) {
        if (this.frameQueue.length === 0) {
          this.drop(
            WebSocketConnection$2.CLOSE_REASON_PROTOCOL_ERROR,
            "Unexpected Continuation Frame"
          );
          return;
        }
        this.fragmentationSize += frame.length;
        if (this.fragmentationSize > this.maxReceivedMessageSize) {
          this.drop(
            WebSocketConnection$2.CLOSE_REASON_MESSAGE_TOO_BIG,
            "Maximum message size exceeded."
          );
          return;
        }
        this.frameQueue.push(frame);
        if (frame.fin) {
          var bytesCopied = 0;
          var binaryPayload = bufferAllocUnsafe$1(this.fragmentationSize);
          var opcode = this.frameQueue[0].opcode;
          this.frameQueue.forEach(function(currentFrame) {
            currentFrame.binaryPayload.copy(binaryPayload, bytesCopied);
            bytesCopied += currentFrame.binaryPayload.length;
          });
          this.frameQueue = [];
          this.fragmentationSize = 0;
          switch (opcode) {
            case 2:
              this.emit("message", {
                type: "binary",
                binaryData: binaryPayload
              });
              break;
            case 1:
              if (!isValidUTF8(binaryPayload)) {
                this.drop(
                  WebSocketConnection$2.CLOSE_REASON_INVALID_DATA,
                  "Invalid UTF-8 Data Received"
                );
                return;
              }
              this.emit("message", {
                type: "utf8",
                utf8Data: binaryPayload.toString("utf8")
              });
              break;
            default:
              this.drop(
                WebSocketConnection$2.CLOSE_REASON_PROTOCOL_ERROR,
                "Unexpected first opcode in fragmentation sequence: 0x" + opcode.toString(16)
              );
              return;
          }
        }
      }
      break;
    case 9:
      this._debug("-- Ping Frame");
      if (this._pingListenerCount > 0) {
        var cancelled = false;
        var cancel = function() {
          cancelled = true;
        };
        this.emit("ping", cancel, frame.binaryPayload);
        if (!cancelled) {
          this.pong(frame.binaryPayload);
        }
      } else {
        this.pong(frame.binaryPayload);
      }
      break;
    case 10:
      this._debug("-- Pong Frame");
      this.emit("pong", frame.binaryPayload);
      break;
    case 8:
      this._debug("-- Close Frame");
      if (this.waitingForCloseResponse) {
        this._debug("---- Got close response from peer.  Completing closing handshake.");
        this.clearCloseTimer();
        this.waitingForCloseResponse = false;
        this.state = STATE_CLOSED;
        this.socket.end();
        return;
      }
      this._debug("---- Closing handshake initiated by peer.");
      this.state = STATE_PEER_REQUESTED_CLOSE;
      var respondCloseReasonCode;
      if (frame.invalidCloseFrameLength) {
        this.closeReasonCode = 1005;
        respondCloseReasonCode = WebSocketConnection$2.CLOSE_REASON_PROTOCOL_ERROR;
      } else if (frame.closeStatus === -1 || validateCloseReason(frame.closeStatus)) {
        this.closeReasonCode = frame.closeStatus;
        respondCloseReasonCode = WebSocketConnection$2.CLOSE_REASON_NORMAL;
      } else {
        this.closeReasonCode = frame.closeStatus;
        respondCloseReasonCode = WebSocketConnection$2.CLOSE_REASON_PROTOCOL_ERROR;
      }
      if (frame.binaryPayload.length > 1) {
        if (!isValidUTF8(frame.binaryPayload)) {
          this.drop(
            WebSocketConnection$2.CLOSE_REASON_INVALID_DATA,
            "Invalid UTF-8 Data Received"
          );
          return;
        }
        this.closeDescription = frame.binaryPayload.toString("utf8");
      } else {
        this.closeDescription = WebSocketConnection$2.CLOSE_DESCRIPTIONS[this.closeReasonCode];
      }
      this._debug(
        "------ Remote peer %s - code: %d - %s - close frame payload length: %d",
        this.remoteAddress,
        this.closeReasonCode,
        this.closeDescription,
        frame.length
      );
      this._debug("------ responding to remote peer's close request.");
      this.sendCloseFrame(respondCloseReasonCode, null);
      this.connected = false;
      break;
    default:
      this._debug("-- Unrecognized Opcode %d", frame.opcode);
      this.drop(
        WebSocketConnection$2.CLOSE_REASON_PROTOCOL_ERROR,
        "Unrecognized Opcode: 0x" + frame.opcode.toString(16)
      );
      break;
  }
};
WebSocketConnection$2.prototype.send = function(data, cb) {
  this._debug("send");
  if (Buffer.isBuffer(data)) {
    this.sendBytes(data, cb);
  } else if (typeof data["toString"] === "function") {
    this.sendUTF(data, cb);
  } else {
    throw new Error("Data provided must either be a Node Buffer or implement toString()");
  }
};
WebSocketConnection$2.prototype.sendUTF = function(data, cb) {
  data = bufferFromString(data.toString(), "utf8");
  this._debug("sendUTF: %d bytes", data.length);
  var frame = new WebSocketFrame(this.maskBytes, this.frameHeader, this.config);
  frame.opcode = 1;
  frame.binaryPayload = data;
  this.fragmentAndSend(frame, cb);
};
WebSocketConnection$2.prototype.sendBytes = function(data, cb) {
  this._debug("sendBytes");
  if (!Buffer.isBuffer(data)) {
    throw new Error("You must pass a Node Buffer object to WebSocketConnection.prototype.sendBytes()");
  }
  var frame = new WebSocketFrame(this.maskBytes, this.frameHeader, this.config);
  frame.opcode = 2;
  frame.binaryPayload = data;
  this.fragmentAndSend(frame, cb);
};
WebSocketConnection$2.prototype.ping = function(data) {
  this._debug("ping");
  var frame = new WebSocketFrame(this.maskBytes, this.frameHeader, this.config);
  frame.opcode = 9;
  frame.fin = true;
  if (data) {
    if (!Buffer.isBuffer(data)) {
      data = bufferFromString(data.toString(), "utf8");
    }
    if (data.length > 125) {
      this._debug("WebSocket: Data for ping is longer than 125 bytes.  Truncating.");
      data = data.slice(0, 124);
    }
    frame.binaryPayload = data;
  }
  this.sendFrame(frame);
};
WebSocketConnection$2.prototype.pong = function(binaryPayload) {
  this._debug("pong");
  var frame = new WebSocketFrame(this.maskBytes, this.frameHeader, this.config);
  frame.opcode = 10;
  if (Buffer.isBuffer(binaryPayload) && binaryPayload.length > 125) {
    this._debug("WebSocket: Data for pong is longer than 125 bytes.  Truncating.");
    binaryPayload = binaryPayload.slice(0, 124);
  }
  frame.binaryPayload = binaryPayload;
  frame.fin = true;
  this.sendFrame(frame);
};
WebSocketConnection$2.prototype.fragmentAndSend = function(frame, cb) {
  this._debug("fragmentAndSend");
  if (frame.opcode > 7) {
    throw new Error("You cannot fragment control frames.");
  }
  var threshold = this.config.fragmentationThreshold;
  var length = frame.binaryPayload.length;
  if (!this.config.fragmentOutgoingMessages || frame.binaryPayload && length <= threshold) {
    frame.fin = true;
    this.sendFrame(frame, cb);
    return;
  }
  var numFragments = Math.ceil(length / threshold);
  var sentFragments = 0;
  var sentCallback = function fragmentSentCallback(err) {
    if (err) {
      if (typeof cb === "function") {
        cb(err);
        cb = null;
      }
      return;
    }
    ++sentFragments;
    if (sentFragments === numFragments && typeof cb === "function") {
      cb();
    }
  };
  for (var i = 1; i <= numFragments; i++) {
    var currentFrame = new WebSocketFrame(this.maskBytes, this.frameHeader, this.config);
    currentFrame.opcode = i === 1 ? frame.opcode : 0;
    currentFrame.fin = i === numFragments;
    var currentLength = i === numFragments ? length - threshold * (i - 1) : threshold;
    var sliceStart = threshold * (i - 1);
    currentFrame.binaryPayload = frame.binaryPayload.slice(sliceStart, sliceStart + currentLength);
    this.sendFrame(currentFrame, sentCallback);
  }
};
WebSocketConnection$2.prototype.sendCloseFrame = function(reasonCode, description2, cb) {
  if (typeof reasonCode !== "number") {
    reasonCode = WebSocketConnection$2.CLOSE_REASON_NORMAL;
  }
  this._debug("sendCloseFrame state: %s, reasonCode: %d, description: %s", this.state, reasonCode, description2);
  if (this.state !== STATE_OPEN && this.state !== STATE_PEER_REQUESTED_CLOSE) {
    return;
  }
  var frame = new WebSocketFrame(this.maskBytes, this.frameHeader, this.config);
  frame.fin = true;
  frame.opcode = 8;
  frame.closeStatus = reasonCode;
  if (typeof description2 === "string") {
    frame.binaryPayload = bufferFromString(description2, "utf8");
  }
  this.sendFrame(frame, cb);
  this.socket.end();
};
WebSocketConnection$2.prototype.sendFrame = function(frame, cb) {
  this._debug("sendFrame");
  frame.mask = this.maskOutgoingPackets;
  var flushed = this.socket.write(frame.toBuffer(), cb);
  this.outputBufferFull = !flushed;
  return flushed;
};
var WebSocketConnection_1 = WebSocketConnection$2;
function instrumentSocketForDebugging(connection, socket) {
  if (!connection._debug.enabled) {
    return;
  }
  var originalSocketEmit = socket.emit;
  socket.emit = function(event) {
    connection._debug("||| Socket Event  '%s'", event);
    originalSocketEmit.apply(this, arguments);
  };
  for (var key in socket) {
    if ("function" !== typeof socket[key]) {
      continue;
    }
    if (["emit"].indexOf(key) !== -1) {
      continue;
    }
    (function(key2) {
      var original = socket[key2];
      if (key2 === "on") {
        socket[key2] = function proxyMethod__EventEmitter__On() {
          connection._debug("||| Socket method called:  %s (%s)", key2, arguments[0]);
          return original.apply(this, arguments);
        };
        return;
      }
      socket[key2] = function proxyMethod() {
        connection._debug("||| Socket method called:  %s", key2);
        return original.apply(this, arguments);
      };
    })(key);
  }
}
var crypto$1 = require$$0$3;
var util$4 = require$$1$1;
var url$1 = require$$2$1;
var EventEmitter$4 = require$$2.EventEmitter;
var WebSocketConnection$1 = WebSocketConnection_1;
var headerValueSplitRegExp = /,\s*/;
var headerParamSplitRegExp = /;\s*/;
var headerSanitizeRegExp = /[\r\n]/g;
var xForwardedForSeparatorRegExp = /,\s*/;
var separators = [
  "(",
  ")",
  "<",
  ">",
  "@",
  ",",
  ";",
  ":",
  "\\",
  '"',
  "/",
  "[",
  "]",
  "?",
  "=",
  "{",
  "}",
  " ",
  String.fromCharCode(9)
];
var cookieNameValidateRegEx = /([\x00-\x20\x22\x28\x29\x2c\x2f\x3a-\x3f\x40\x5b-\x5e\x7b\x7d\x7f])/;
var cookieValueValidateRegEx = /[^\x21\x23-\x2b\x2d-\x3a\x3c-\x5b\x5d-\x7e]/;
var cookieValueDQuoteValidateRegEx = /^"[^"]*"$/;
var controlCharsAndSemicolonRegEx = /[\x00-\x20\x3b]/g;
var cookieSeparatorRegEx = /[;,] */;
var httpStatusDescriptions = {
  100: "Continue",
  101: "Switching Protocols",
  200: "OK",
  201: "Created",
  203: "Non-Authoritative Information",
  204: "No Content",
  205: "Reset Content",
  206: "Partial Content",
  300: "Multiple Choices",
  301: "Moved Permanently",
  302: "Found",
  303: "See Other",
  304: "Not Modified",
  305: "Use Proxy",
  307: "Temporary Redirect",
  400: "Bad Request",
  401: "Unauthorized",
  402: "Payment Required",
  403: "Forbidden",
  404: "Not Found",
  406: "Not Acceptable",
  407: "Proxy Authorization Required",
  408: "Request Timeout",
  409: "Conflict",
  410: "Gone",
  411: "Length Required",
  412: "Precondition Failed",
  413: "Request Entity Too Long",
  414: "Request-URI Too Long",
  415: "Unsupported Media Type",
  416: "Requested Range Not Satisfiable",
  417: "Expectation Failed",
  426: "Upgrade Required",
  500: "Internal Server Error",
  501: "Not Implemented",
  502: "Bad Gateway",
  503: "Service Unavailable",
  504: "Gateway Timeout",
  505: "HTTP Version Not Supported"
};
function WebSocketRequest$1(socket, httpRequest, serverConfig) {
  EventEmitter$4.call(this);
  this.socket = socket;
  this.httpRequest = httpRequest;
  this.resource = httpRequest.url;
  this.remoteAddress = socket.remoteAddress;
  this.remoteAddresses = [this.remoteAddress];
  this.serverConfig = serverConfig;
  this._socketIsClosing = false;
  this._socketCloseHandler = this._handleSocketCloseBeforeAccept.bind(this);
  this.socket.on("end", this._socketCloseHandler);
  this.socket.on("close", this._socketCloseHandler);
  this._resolved = false;
}
util$4.inherits(WebSocketRequest$1, EventEmitter$4);
WebSocketRequest$1.prototype.readHandshake = function() {
  var self2 = this;
  var request = this.httpRequest;
  this.resourceURL = url$1.parse(this.resource, true);
  this.host = request.headers["host"];
  if (!this.host) {
    throw new Error("Client must provide a Host header.");
  }
  this.key = request.headers["sec-websocket-key"];
  if (!this.key) {
    throw new Error("Client must provide a value for Sec-WebSocket-Key.");
  }
  this.webSocketVersion = parseInt(request.headers["sec-websocket-version"], 10);
  if (!this.webSocketVersion || isNaN(this.webSocketVersion)) {
    throw new Error("Client must provide a value for Sec-WebSocket-Version.");
  }
  switch (this.webSocketVersion) {
    case 8:
    case 13:
      break;
    default:
      var e = new Error("Unsupported websocket client version: " + this.webSocketVersion + "Only versions 8 and 13 are supported.");
      e.httpCode = 426;
      e.headers = {
        "Sec-WebSocket-Version": "13"
      };
      throw e;
  }
  if (this.webSocketVersion === 13) {
    this.origin = request.headers["origin"];
  } else if (this.webSocketVersion === 8) {
    this.origin = request.headers["sec-websocket-origin"];
  }
  var protocolString = request.headers["sec-websocket-protocol"];
  this.protocolFullCaseMap = {};
  this.requestedProtocols = [];
  if (protocolString) {
    var requestedProtocolsFullCase = protocolString.split(headerValueSplitRegExp);
    requestedProtocolsFullCase.forEach(function(protocol) {
      var lcProtocol = protocol.toLocaleLowerCase();
      self2.requestedProtocols.push(lcProtocol);
      self2.protocolFullCaseMap[lcProtocol] = protocol;
    });
  }
  if (!this.serverConfig.ignoreXForwardedFor && request.headers["x-forwarded-for"]) {
    var immediatePeerIP = this.remoteAddress;
    this.remoteAddresses = request.headers["x-forwarded-for"].split(xForwardedForSeparatorRegExp);
    this.remoteAddresses.push(immediatePeerIP);
    this.remoteAddress = this.remoteAddresses[0];
  }
  if (this.serverConfig.parseExtensions) {
    var extensionsString = request.headers["sec-websocket-extensions"];
    this.requestedExtensions = this.parseExtensions(extensionsString);
  } else {
    this.requestedExtensions = [];
  }
  if (this.serverConfig.parseCookies) {
    var cookieString = request.headers["cookie"];
    this.cookies = this.parseCookies(cookieString);
  } else {
    this.cookies = [];
  }
};
WebSocketRequest$1.prototype.parseExtensions = function(extensionsString) {
  if (!extensionsString || extensionsString.length === 0) {
    return [];
  }
  var extensions = extensionsString.toLocaleLowerCase().split(headerValueSplitRegExp);
  extensions.forEach(function(extension, index, array) {
    var params = extension.split(headerParamSplitRegExp);
    var extensionName = params[0];
    var extensionParams = params.slice(1);
    extensionParams.forEach(function(rawParam, index2, array2) {
      var arr = rawParam.split("=");
      var obj2 = {
        name: arr[0],
        value: arr[1]
      };
      array2.splice(index2, 1, obj2);
    });
    var obj = {
      name: extensionName,
      params: extensionParams
    };
    array.splice(index, 1, obj);
  });
  return extensions;
};
WebSocketRequest$1.prototype.parseCookies = function(str) {
  if (!str || typeof str !== "string") {
    return [];
  }
  var cookies = [];
  var pairs = str.split(cookieSeparatorRegEx);
  pairs.forEach(function(pair) {
    var eq_idx = pair.indexOf("=");
    if (eq_idx === -1) {
      cookies.push({
        name: pair,
        value: null
      });
      return;
    }
    var key = pair.substr(0, eq_idx).trim();
    var val = pair.substr(++eq_idx, pair.length).trim();
    if ('"' === val[0]) {
      val = val.slice(1, -1);
    }
    cookies.push({
      name: key,
      value: decodeURIComponent(val)
    });
  });
  return cookies;
};
WebSocketRequest$1.prototype.accept = function(acceptedProtocol, allowedOrigin, cookies) {
  this._verifyResolution();
  var protocolFullCase;
  if (acceptedProtocol) {
    protocolFullCase = this.protocolFullCaseMap[acceptedProtocol.toLocaleLowerCase()];
    if (typeof protocolFullCase === "undefined") {
      protocolFullCase = acceptedProtocol;
    }
  } else {
    protocolFullCase = acceptedProtocol;
  }
  this.protocolFullCaseMap = null;
  var sha1 = crypto$1.createHash("sha1");
  sha1.update(this.key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11");
  var acceptKey = sha1.digest("base64");
  var response = "HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: " + acceptKey + "\r\n";
  if (protocolFullCase) {
    for (var i = 0; i < protocolFullCase.length; i++) {
      var charCode = protocolFullCase.charCodeAt(i);
      var character = protocolFullCase.charAt(i);
      if (charCode < 33 || charCode > 126 || separators.indexOf(character) !== -1) {
        this.reject(500);
        throw new Error('Illegal character "' + String.fromCharCode(character) + '" in subprotocol.');
      }
    }
    if (this.requestedProtocols.indexOf(acceptedProtocol) === -1) {
      this.reject(500);
      throw new Error("Specified protocol was not requested by the client.");
    }
    protocolFullCase = protocolFullCase.replace(headerSanitizeRegExp, "");
    response += "Sec-WebSocket-Protocol: " + protocolFullCase + "\r\n";
  }
  this.requestedProtocols = null;
  if (allowedOrigin) {
    allowedOrigin = allowedOrigin.replace(headerSanitizeRegExp, "");
    if (this.webSocketVersion === 13) {
      response += "Origin: " + allowedOrigin + "\r\n";
    } else if (this.webSocketVersion === 8) {
      response += "Sec-WebSocket-Origin: " + allowedOrigin + "\r\n";
    }
  }
  if (cookies) {
    if (!Array.isArray(cookies)) {
      this.reject(500);
      throw new Error('Value supplied for "cookies" argument must be an array.');
    }
    var seenCookies = {};
    cookies.forEach(function(cookie) {
      if (!cookie.name || !cookie.value) {
        this.reject(500);
        throw new Error('Each cookie to set must at least provide a "name" and "value"');
      }
      cookie.name = cookie.name.replace(controlCharsAndSemicolonRegEx, "");
      cookie.value = cookie.value.replace(controlCharsAndSemicolonRegEx, "");
      if (seenCookies[cookie.name]) {
        this.reject(500);
        throw new Error("You may not specify the same cookie name twice.");
      }
      seenCookies[cookie.name] = true;
      var invalidChar = cookie.name.match(cookieNameValidateRegEx);
      if (invalidChar) {
        this.reject(500);
        throw new Error("Illegal character " + invalidChar[0] + " in cookie name");
      }
      if (cookie.value.match(cookieValueDQuoteValidateRegEx)) {
        invalidChar = cookie.value.slice(1, -1).match(cookieValueValidateRegEx);
      } else {
        invalidChar = cookie.value.match(cookieValueValidateRegEx);
      }
      if (invalidChar) {
        this.reject(500);
        throw new Error("Illegal character " + invalidChar[0] + " in cookie value");
      }
      var cookieParts = [cookie.name + "=" + cookie.value];
      if (cookie.path) {
        invalidChar = cookie.path.match(controlCharsAndSemicolonRegEx);
        if (invalidChar) {
          this.reject(500);
          throw new Error("Illegal character " + invalidChar[0] + " in cookie path");
        }
        cookieParts.push("Path=" + cookie.path);
      }
      if (cookie.domain) {
        if (typeof cookie.domain !== "string") {
          this.reject(500);
          throw new Error("Domain must be specified and must be a string.");
        }
        invalidChar = cookie.domain.match(controlCharsAndSemicolonRegEx);
        if (invalidChar) {
          this.reject(500);
          throw new Error("Illegal character " + invalidChar[0] + " in cookie domain");
        }
        cookieParts.push("Domain=" + cookie.domain.toLowerCase());
      }
      if (cookie.expires) {
        if (!(cookie.expires instanceof Date)) {
          this.reject(500);
          throw new Error('Value supplied for cookie "expires" must be a vaild date object');
        }
        cookieParts.push("Expires=" + cookie.expires.toGMTString());
      }
      if (cookie.maxage) {
        var maxage = cookie.maxage;
        if (typeof maxage === "string") {
          maxage = parseInt(maxage, 10);
        }
        if (isNaN(maxage) || maxage <= 0) {
          this.reject(500);
          throw new Error('Value supplied for cookie "maxage" must be a non-zero number');
        }
        maxage = Math.round(maxage);
        cookieParts.push("Max-Age=" + maxage.toString(10));
      }
      if (cookie.secure) {
        if (typeof cookie.secure !== "boolean") {
          this.reject(500);
          throw new Error('Value supplied for cookie "secure" must be of type boolean');
        }
        cookieParts.push("Secure");
      }
      if (cookie.httponly) {
        if (typeof cookie.httponly !== "boolean") {
          this.reject(500);
          throw new Error('Value supplied for cookie "httponly" must be of type boolean');
        }
        cookieParts.push("HttpOnly");
      }
      response += "Set-Cookie: " + cookieParts.join(";") + "\r\n";
    }.bind(this));
  }
  this._resolved = true;
  this.emit("requestResolved", this);
  response += "\r\n";
  var connection = new WebSocketConnection$1(this.socket, [], acceptedProtocol, false, this.serverConfig);
  connection.webSocketVersion = this.webSocketVersion;
  connection.remoteAddress = this.remoteAddress;
  connection.remoteAddresses = this.remoteAddresses;
  var self2 = this;
  if (this._socketIsClosing) {
    cleanupFailedConnection(connection);
  } else {
    this.socket.write(response, "ascii", function(error) {
      if (error) {
        cleanupFailedConnection(connection);
        return;
      }
      self2._removeSocketCloseListeners();
      connection._addSocketEventListeners();
    });
  }
  this.emit("requestAccepted", connection);
  return connection;
};
WebSocketRequest$1.prototype.reject = function(status, reason, extraHeaders) {
  this._verifyResolution();
  this._resolved = true;
  this.emit("requestResolved", this);
  if (typeof status !== "number") {
    status = 403;
  }
  var response = "HTTP/1.1 " + status + " " + httpStatusDescriptions[status] + "\r\nConnection: close\r\n";
  if (reason) {
    reason = reason.replace(headerSanitizeRegExp, "");
    response += "X-WebSocket-Reject-Reason: " + reason + "\r\n";
  }
  if (extraHeaders) {
    for (var key in extraHeaders) {
      var sanitizedValue = extraHeaders[key].toString().replace(headerSanitizeRegExp, "");
      var sanitizedKey = key.replace(headerSanitizeRegExp, "");
      response += sanitizedKey + ": " + sanitizedValue + "\r\n";
    }
  }
  response += "\r\n";
  this.socket.end(response, "ascii");
  this.emit("requestRejected", this);
};
WebSocketRequest$1.prototype._handleSocketCloseBeforeAccept = function() {
  this._socketIsClosing = true;
  this._removeSocketCloseListeners();
};
WebSocketRequest$1.prototype._removeSocketCloseListeners = function() {
  this.socket.removeListener("end", this._socketCloseHandler);
  this.socket.removeListener("close", this._socketCloseHandler);
};
WebSocketRequest$1.prototype._verifyResolution = function() {
  if (this._resolved) {
    throw new Error("WebSocketRequest may only be accepted or rejected one time.");
  }
};
function cleanupFailedConnection(connection) {
  process.nextTick(function() {
    connection.drop(1006, "TCP connection lost before handshake completed.", true);
  });
}
var WebSocketRequest_1 = WebSocketRequest$1;
var extend$2 = utils$3.extend;
var utils$1 = utils$3;
var util$3 = require$$1$1;
var debug = require$$1("websocket:server");
var EventEmitter$3 = require$$2.EventEmitter;
var WebSocketRequest = WebSocketRequest_1;
var WebSocketServer = function WebSocketServer2(config2) {
  EventEmitter$3.call(this);
  this._handlers = {
    upgrade: this.handleUpgrade.bind(this),
    requestAccepted: this.handleRequestAccepted.bind(this),
    requestResolved: this.handleRequestResolved.bind(this)
  };
  this.connections = [];
  this.pendingRequests = [];
  if (config2) {
    this.mount(config2);
  }
};
util$3.inherits(WebSocketServer, EventEmitter$3);
WebSocketServer.prototype.mount = function(config2) {
  this.config = {
    httpServer: null,
    maxReceivedFrameSize: 65536,
    maxReceivedMessageSize: 1048576,
    fragmentOutgoingMessages: true,
    fragmentationThreshold: 16384,
    keepalive: true,
    keepaliveInterval: 2e4,
    dropConnectionOnKeepaliveTimeout: true,
    keepaliveGracePeriod: 1e4,
    useNativeKeepalive: false,
    assembleFragments: true,
    autoAcceptConnections: false,
    ignoreXForwardedFor: false,
    parseCookies: true,
    parseExtensions: true,
    disableNagleAlgorithm: true,
    closeTimeout: 5e3
  };
  extend$2(this.config, config2);
  if (this.config.httpServer) {
    if (!Array.isArray(this.config.httpServer)) {
      this.config.httpServer = [this.config.httpServer];
    }
    var upgradeHandler = this._handlers.upgrade;
    this.config.httpServer.forEach(function(httpServer) {
      httpServer.on("upgrade", upgradeHandler);
    });
  } else {
    throw new Error("You must specify an httpServer on which to mount the WebSocket server.");
  }
};
WebSocketServer.prototype.unmount = function() {
  var upgradeHandler = this._handlers.upgrade;
  this.config.httpServer.forEach(function(httpServer) {
    httpServer.removeListener("upgrade", upgradeHandler);
  });
};
WebSocketServer.prototype.closeAllConnections = function() {
  this.connections.forEach(function(connection) {
    connection.close();
  });
  this.pendingRequests.forEach(function(request) {
    process.nextTick(function() {
      request.reject(503);
    });
  });
};
WebSocketServer.prototype.broadcast = function(data) {
  if (Buffer.isBuffer(data)) {
    this.broadcastBytes(data);
  } else if (typeof data.toString === "function") {
    this.broadcastUTF(data);
  }
};
WebSocketServer.prototype.broadcastUTF = function(utfData) {
  this.connections.forEach(function(connection) {
    connection.sendUTF(utfData);
  });
};
WebSocketServer.prototype.broadcastBytes = function(binaryData) {
  this.connections.forEach(function(connection) {
    connection.sendBytes(binaryData);
  });
};
WebSocketServer.prototype.shutDown = function() {
  this.unmount();
  this.closeAllConnections();
};
WebSocketServer.prototype.handleUpgrade = function(request, socket) {
  var self2 = this;
  var wsRequest = new WebSocketRequest(socket, request, this.config);
  try {
    wsRequest.readHandshake();
  } catch (e) {
    wsRequest.reject(
      e.httpCode ? e.httpCode : 400,
      e.message,
      e.headers
    );
    debug("Invalid handshake: %s", e.message);
    this.emit("upgradeError", e);
    return;
  }
  this.pendingRequests.push(wsRequest);
  wsRequest.once("requestAccepted", this._handlers.requestAccepted);
  wsRequest.once("requestResolved", this._handlers.requestResolved);
  socket.once("close", function() {
    self2._handlers.requestResolved(wsRequest);
  });
  if (!this.config.autoAcceptConnections && utils$1.eventEmitterListenerCount(this, "request") > 0) {
    this.emit("request", wsRequest);
  } else if (this.config.autoAcceptConnections) {
    wsRequest.accept(wsRequest.requestedProtocols[0], wsRequest.origin);
  } else {
    wsRequest.reject(404, "No handler is configured to accept the connection.");
  }
};
WebSocketServer.prototype.handleRequestAccepted = function(connection) {
  var self2 = this;
  connection.once("close", function(closeReason, description2) {
    self2.handleConnectionClose(connection, closeReason, description2);
  });
  this.connections.push(connection);
  this.emit("connect", connection);
};
WebSocketServer.prototype.handleConnectionClose = function(connection, closeReason, description2) {
  var index = this.connections.indexOf(connection);
  if (index !== -1) {
    this.connections.splice(index, 1);
  }
  this.emit("close", connection, closeReason, description2);
};
WebSocketServer.prototype.handleRequestResolved = function(request) {
  var index = this.pendingRequests.indexOf(request);
  if (index !== -1) {
    this.pendingRequests.splice(index, 1);
  }
};
var WebSocketServer_1 = WebSocketServer;
var utils = utils$3;
var extend$1 = utils.extend;
var util$2 = require$$1$1;
var EventEmitter$2 = require$$2.EventEmitter;
var http = require$$3;
var https = require$$4;
var url = require$$2$1;
var crypto = require$$0$3;
var WebSocketConnection = WebSocketConnection_1;
var bufferAllocUnsafe = utils.bufferAllocUnsafe;
var protocolSeparators = [
  "(",
  ")",
  "<",
  ">",
  "@",
  ",",
  ";",
  ":",
  "\\",
  '"',
  "/",
  "[",
  "]",
  "?",
  "=",
  "{",
  "}",
  " ",
  String.fromCharCode(9)
];
var excludedTlsOptions = ["hostname", "port", "method", "path", "headers"];
function WebSocketClient$1(config2) {
  EventEmitter$2.call(this);
  this.config = {
    maxReceivedFrameSize: 1048576,
    maxReceivedMessageSize: 8388608,
    fragmentOutgoingMessages: true,
    fragmentationThreshold: 16384,
    webSocketVersion: 13,
    assembleFragments: true,
    disableNagleAlgorithm: true,
    closeTimeout: 5e3,
    tlsOptions: {}
  };
  if (config2) {
    var tlsOptions;
    if (config2.tlsOptions) {
      tlsOptions = config2.tlsOptions;
      delete config2.tlsOptions;
    } else {
      tlsOptions = {};
    }
    extend$1(this.config, config2);
    extend$1(this.config.tlsOptions, tlsOptions);
  }
  this._req = null;
  switch (this.config.webSocketVersion) {
    case 8:
    case 13:
      break;
    default:
      throw new Error("Requested webSocketVersion is not supported. Allowed values are 8 and 13.");
  }
}
util$2.inherits(WebSocketClient$1, EventEmitter$2);
WebSocketClient$1.prototype.connect = function(requestUrl, protocols, origin, headers, extraRequestOptions) {
  var self2 = this;
  if (typeof protocols === "string") {
    if (protocols.length > 0) {
      protocols = [protocols];
    } else {
      protocols = [];
    }
  }
  if (!(protocols instanceof Array)) {
    protocols = [];
  }
  this.protocols = protocols;
  this.origin = origin;
  if (typeof requestUrl === "string") {
    this.url = url.parse(requestUrl);
  } else {
    this.url = requestUrl;
  }
  if (!this.url.protocol) {
    throw new Error("You must specify a full WebSocket URL, including protocol.");
  }
  if (!this.url.host) {
    throw new Error("You must specify a full WebSocket URL, including hostname. Relative URLs are not supported.");
  }
  this.secure = this.url.protocol === "wss:";
  this.protocols.forEach(function(protocol) {
    for (var i2 = 0; i2 < protocol.length; i2++) {
      var charCode = protocol.charCodeAt(i2);
      var character = protocol.charAt(i2);
      if (charCode < 33 || charCode > 126 || protocolSeparators.indexOf(character) !== -1) {
        throw new Error('Protocol list contains invalid character "' + String.fromCharCode(charCode) + '"');
      }
    }
  });
  var defaultPorts = {
    "ws:": "80",
    "wss:": "443"
  };
  if (!this.url.port) {
    this.url.port = defaultPorts[this.url.protocol];
  }
  var nonce = bufferAllocUnsafe(16);
  for (var i = 0; i < 16; i++) {
    nonce[i] = Math.round(Math.random() * 255);
  }
  this.base64nonce = nonce.toString("base64");
  var hostHeaderValue = this.url.hostname;
  if (this.url.protocol === "ws:" && this.url.port !== "80" || this.url.protocol === "wss:" && this.url.port !== "443") {
    hostHeaderValue += ":" + this.url.port;
  }
  var reqHeaders = {};
  if (this.secure && this.config.tlsOptions.hasOwnProperty("headers")) {
    extend$1(reqHeaders, this.config.tlsOptions.headers);
  }
  if (headers) {
    extend$1(reqHeaders, headers);
  }
  extend$1(reqHeaders, {
    "Upgrade": "websocket",
    "Connection": "Upgrade",
    "Sec-WebSocket-Version": this.config.webSocketVersion.toString(10),
    "Sec-WebSocket-Key": this.base64nonce,
    "Host": reqHeaders.Host || hostHeaderValue
  });
  if (this.protocols.length > 0) {
    reqHeaders["Sec-WebSocket-Protocol"] = this.protocols.join(", ");
  }
  if (this.origin) {
    if (this.config.webSocketVersion === 13) {
      reqHeaders["Origin"] = this.origin;
    } else if (this.config.webSocketVersion === 8) {
      reqHeaders["Sec-WebSocket-Origin"] = this.origin;
    }
  }
  var pathAndQuery;
  if (this.url.pathname) {
    pathAndQuery = this.url.path;
  } else if (this.url.path) {
    pathAndQuery = "/" + this.url.path;
  } else {
    pathAndQuery = "/";
  }
  function handleRequestError(error) {
    self2._req = null;
    self2.emit("connectFailed", error);
  }
  var requestOptions = {
    agent: false
  };
  if (extraRequestOptions) {
    extend$1(requestOptions, extraRequestOptions);
  }
  extend$1(requestOptions, {
    hostname: this.url.hostname,
    port: this.url.port,
    method: "GET",
    path: pathAndQuery,
    headers: reqHeaders
  });
  if (this.secure) {
    var tlsOptions = this.config.tlsOptions;
    for (var key in tlsOptions) {
      if (tlsOptions.hasOwnProperty(key) && excludedTlsOptions.indexOf(key) === -1) {
        requestOptions[key] = tlsOptions[key];
      }
    }
  }
  var req = this._req = (this.secure ? https : http).request(requestOptions);
  req.on("upgrade", function handleRequestUpgrade(response, socket, head) {
    self2._req = null;
    req.removeListener("error", handleRequestError);
    self2.socket = socket;
    self2.response = response;
    self2.firstDataChunk = head;
    self2.validateHandshake();
  });
  req.on("error", handleRequestError);
  req.on("response", function(response) {
    self2._req = null;
    if (utils.eventEmitterListenerCount(self2, "httpResponse") > 0) {
      self2.emit("httpResponse", response, self2);
      if (response.socket) {
        response.socket.end();
      }
    } else {
      var headerDumpParts = [];
      for (var headerName in response.headers) {
        headerDumpParts.push(headerName + ": " + response.headers[headerName]);
      }
      self2.failHandshake(
        "Server responded with a non-101 status: " + response.statusCode + " " + response.statusMessage + "\nResponse Headers Follow:\n" + headerDumpParts.join("\n") + "\n"
      );
    }
  });
  req.end();
};
WebSocketClient$1.prototype.validateHandshake = function() {
  var headers = this.response.headers;
  if (this.protocols.length > 0) {
    this.protocol = headers["sec-websocket-protocol"];
    if (this.protocol) {
      if (this.protocols.indexOf(this.protocol) === -1) {
        this.failHandshake("Server did not respond with a requested protocol.");
        return;
      }
    } else {
      this.failHandshake("Expected a Sec-WebSocket-Protocol header.");
      return;
    }
  }
  if (!(headers["connection"] && headers["connection"].toLocaleLowerCase() === "upgrade")) {
    this.failHandshake("Expected a Connection: Upgrade header from the server");
    return;
  }
  if (!(headers["upgrade"] && headers["upgrade"].toLocaleLowerCase() === "websocket")) {
    this.failHandshake("Expected an Upgrade: websocket header from the server");
    return;
  }
  var sha1 = crypto.createHash("sha1");
  sha1.update(this.base64nonce + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11");
  var expectedKey = sha1.digest("base64");
  if (!headers["sec-websocket-accept"]) {
    this.failHandshake("Expected Sec-WebSocket-Accept header from server");
    return;
  }
  if (headers["sec-websocket-accept"] !== expectedKey) {
    this.failHandshake("Sec-WebSocket-Accept header from server didn't match expected value of " + expectedKey);
    return;
  }
  this.succeedHandshake();
};
WebSocketClient$1.prototype.failHandshake = function(errorDescription) {
  if (this.socket && this.socket.writable) {
    this.socket.end();
  }
  this.emit("connectFailed", new Error(errorDescription));
};
WebSocketClient$1.prototype.succeedHandshake = function() {
  var connection = new WebSocketConnection(this.socket, [], this.protocol, true, this.config);
  connection.webSocketVersion = this.config.webSocketVersion;
  connection._addSocketEventListeners();
  this.emit("connect", connection);
  if (this.firstDataChunk.length > 0) {
    connection.handleSocketData(this.firstDataChunk);
  }
  this.firstDataChunk = null;
};
WebSocketClient$1.prototype.abort = function() {
  if (this._req) {
    this._req.abort();
  }
};
var WebSocketClient_1 = WebSocketClient$1;
var util$1 = require$$1$1;
var EventEmitter$1 = require$$2.EventEmitter;
function WebSocketRouterRequest$1(webSocketRequest, resolvedProtocol) {
  EventEmitter$1.call(this);
  this.webSocketRequest = webSocketRequest;
  if (resolvedProtocol === "____no_protocol____") {
    this.protocol = null;
  } else {
    this.protocol = resolvedProtocol;
  }
  this.origin = webSocketRequest.origin;
  this.resource = webSocketRequest.resource;
  this.resourceURL = webSocketRequest.resourceURL;
  this.httpRequest = webSocketRequest.httpRequest;
  this.remoteAddress = webSocketRequest.remoteAddress;
  this.webSocketVersion = webSocketRequest.webSocketVersion;
  this.requestedExtensions = webSocketRequest.requestedExtensions;
  this.cookies = webSocketRequest.cookies;
}
util$1.inherits(WebSocketRouterRequest$1, EventEmitter$1);
WebSocketRouterRequest$1.prototype.accept = function(origin, cookies) {
  var connection = this.webSocketRequest.accept(this.protocol, origin, cookies);
  this.emit("requestAccepted", connection);
  return connection;
};
WebSocketRouterRequest$1.prototype.reject = function(status, reason, extraHeaders) {
  this.webSocketRequest.reject(status, reason, extraHeaders);
  this.emit("requestRejected", this);
};
var WebSocketRouterRequest_1 = WebSocketRouterRequest$1;
var extend2 = utils$3.extend;
var util = require$$1$1;
var EventEmitter = require$$2.EventEmitter;
var WebSocketRouterRequest = WebSocketRouterRequest_1;
function WebSocketRouter(config2) {
  EventEmitter.call(this);
  this.config = {
    server: null
  };
  if (config2) {
    extend2(this.config, config2);
  }
  this.handlers = [];
  this._requestHandler = this.handleRequest.bind(this);
  if (this.config.server) {
    this.attachServer(this.config.server);
  }
}
util.inherits(WebSocketRouter, EventEmitter);
WebSocketRouter.prototype.attachServer = function(server) {
  if (server) {
    this.server = server;
    this.server.on("request", this._requestHandler);
  } else {
    throw new Error("You must specify a WebSocketServer instance to attach to.");
  }
};
WebSocketRouter.prototype.detachServer = function() {
  if (this.server) {
    this.server.removeListener("request", this._requestHandler);
    this.server = null;
  } else {
    throw new Error("Cannot detach from server: not attached.");
  }
};
WebSocketRouter.prototype.mount = function(path, protocol, callback) {
  if (!path) {
    throw new Error("You must specify a path for this handler.");
  }
  if (!protocol) {
    protocol = "____no_protocol____";
  }
  if (!callback) {
    throw new Error("You must specify a callback for this handler.");
  }
  path = this.pathToRegExp(path);
  if (!(path instanceof RegExp)) {
    throw new Error("Path must be specified as either a string or a RegExp.");
  }
  var pathString = path.toString();
  protocol = protocol.toLocaleLowerCase();
  if (this.findHandlerIndex(pathString, protocol) !== -1) {
    throw new Error("You may only mount one handler per path/protocol combination.");
  }
  this.handlers.push({
    "path": path,
    "pathString": pathString,
    "protocol": protocol,
    "callback": callback
  });
};
WebSocketRouter.prototype.unmount = function(path, protocol) {
  var index = this.findHandlerIndex(this.pathToRegExp(path).toString(), protocol);
  if (index !== -1) {
    this.handlers.splice(index, 1);
  } else {
    throw new Error("Unable to find a route matching the specified path and protocol.");
  }
};
WebSocketRouter.prototype.findHandlerIndex = function(pathString, protocol) {
  protocol = protocol.toLocaleLowerCase();
  for (var i = 0, len = this.handlers.length; i < len; i++) {
    var handler = this.handlers[i];
    if (handler.pathString === pathString && handler.protocol === protocol) {
      return i;
    }
  }
  return -1;
};
WebSocketRouter.prototype.pathToRegExp = function(path) {
  if (typeof path === "string") {
    if (path === "*") {
      path = /^.*$/;
    } else {
      path = path.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
      path = new RegExp("^" + path + "$");
    }
  }
  return path;
};
WebSocketRouter.prototype.handleRequest = function(request) {
  var requestedProtocols = request.requestedProtocols;
  if (requestedProtocols.length === 0) {
    requestedProtocols = ["____no_protocol____"];
  }
  for (var i = 0; i < requestedProtocols.length; i++) {
    var requestedProtocol = requestedProtocols[i].toLocaleLowerCase();
    for (var j = 0, len = this.handlers.length; j < len; j++) {
      var handler = this.handlers[j];
      if (handler.path.test(request.resourceURL.pathname)) {
        if (requestedProtocol === handler.protocol || handler.protocol === "*") {
          var routerRequest = new WebSocketRouterRequest(request, requestedProtocol);
          handler.callback(routerRequest);
          return;
        }
      }
    }
  }
  request.reject(404, "No handler is available for the given request.");
};
var WebSocketRouter_1 = WebSocketRouter;
var WebSocketClient = WebSocketClient_1;
var toBuffer = require$$1$2;
var yaeti = require$$2$2;
const CONNECTING = 0;
const OPEN = 1;
const CLOSING = 2;
const CLOSED = 3;
var W3CWebSocket_1 = W3CWebSocket;
function W3CWebSocket(url2, protocols, origin, headers, requestOptions, clientConfig) {
  yaeti.EventTarget.call(this);
  clientConfig = clientConfig || {};
  clientConfig.assembleFragments = true;
  var self2 = this;
  this._url = url2;
  this._readyState = CONNECTING;
  this._protocol = void 0;
  this._extensions = "";
  this._bufferedAmount = 0;
  this._binaryType = "arraybuffer";
  this._connection = void 0;
  this._client = new WebSocketClient(clientConfig);
  this._client.on("connect", function(connection) {
    onConnect.call(self2, connection);
  });
  this._client.on("connectFailed", function() {
    onConnectFailed.call(self2);
  });
  this._client.connect(url2, protocols, origin, headers, requestOptions);
}
Object.defineProperties(W3CWebSocket.prototype, {
  url: { get: function() {
    return this._url;
  } },
  readyState: { get: function() {
    return this._readyState;
  } },
  protocol: { get: function() {
    return this._protocol;
  } },
  extensions: { get: function() {
    return this._extensions;
  } },
  bufferedAmount: { get: function() {
    return this._bufferedAmount;
  } }
});
Object.defineProperties(W3CWebSocket.prototype, {
  binaryType: {
    get: function() {
      return this._binaryType;
    },
    set: function(type) {
      if (type !== "arraybuffer") {
        throw new SyntaxError('just "arraybuffer" type allowed for "binaryType" attribute');
      }
      this._binaryType = type;
    }
  }
});
[["CONNECTING", CONNECTING], ["OPEN", OPEN], ["CLOSING", CLOSING], ["CLOSED", CLOSED]].forEach(function(property) {
  Object.defineProperty(W3CWebSocket.prototype, property[0], {
    get: function() {
      return property[1];
    }
  });
});
[["CONNECTING", CONNECTING], ["OPEN", OPEN], ["CLOSING", CLOSING], ["CLOSED", CLOSED]].forEach(function(property) {
  Object.defineProperty(W3CWebSocket, property[0], {
    get: function() {
      return property[1];
    }
  });
});
W3CWebSocket.prototype.send = function(data) {
  if (this._readyState !== OPEN) {
    throw new Error("cannot call send() while not connected");
  }
  if (typeof data === "string" || data instanceof String) {
    this._connection.sendUTF(data);
  } else {
    if (data instanceof Buffer) {
      this._connection.sendBytes(data);
    } else if (data.byteLength || data.byteLength === 0) {
      data = toBuffer(data);
      this._connection.sendBytes(data);
    } else {
      throw new Error("unknown binary data:", data);
    }
  }
};
W3CWebSocket.prototype.close = function(code, reason) {
  switch (this._readyState) {
    case CONNECTING:
      onConnectFailed.call(this);
      this._client.on("connect", function(connection) {
        if (code) {
          connection.close(code, reason);
        } else {
          connection.close();
        }
      });
      break;
    case OPEN:
      this._readyState = CLOSING;
      if (code) {
        this._connection.close(code, reason);
      } else {
        this._connection.close();
      }
      break;
  }
};
function createCloseEvent(code, reason) {
  var event = new yaeti.Event("close");
  event.code = code;
  event.reason = reason;
  event.wasClean = typeof code === "undefined" || code === 1e3;
  return event;
}
function createMessageEvent(data) {
  var event = new yaeti.Event("message");
  event.data = data;
  return event;
}
function onConnect(connection) {
  var self2 = this;
  this._readyState = OPEN;
  this._connection = connection;
  this._protocol = connection.protocol;
  this._extensions = connection.extensions;
  this._connection.on("close", function(code, reason) {
    onClose.call(self2, code, reason);
  });
  this._connection.on("message", function(msg) {
    onMessage.call(self2, msg);
  });
  this.dispatchEvent(new yaeti.Event("open"));
}
function onConnectFailed() {
  destroy.call(this);
  this._readyState = CLOSED;
  try {
    this.dispatchEvent(new yaeti.Event("error"));
  } finally {
    this.dispatchEvent(createCloseEvent(1006, "connection failed"));
  }
}
function onClose(code, reason) {
  destroy.call(this);
  this._readyState = CLOSED;
  this.dispatchEvent(createCloseEvent(code, reason || ""));
}
function onMessage(message) {
  if (message.utf8Data) {
    this.dispatchEvent(createMessageEvent(message.utf8Data));
  } else if (message.binaryData) {
    if (this.binaryType === "arraybuffer") {
      var buffer = message.binaryData;
      var arraybuffer = new ArrayBuffer(buffer.length);
      var view = new Uint8Array(arraybuffer);
      for (var i = 0, len = buffer.length; i < len; ++i) {
        view[i] = buffer[i];
      }
      this.dispatchEvent(createMessageEvent(arraybuffer));
    }
  }
}
function destroy() {
  this._client.removeAllListeners();
  if (this._connection) {
    this._connection.removeAllListeners();
  }
}
var Deprecation = {
  disableWarnings: false,
  deprecationWarningMap: {},
  warn: function(deprecationName) {
    if (!this.disableWarnings && this.deprecationWarningMap[deprecationName]) {
      console.warn("DEPRECATION WARNING: " + this.deprecationWarningMap[deprecationName]);
      this.deprecationWarningMap[deprecationName] = false;
    }
  }
};
var Deprecation_1 = Deprecation;
const name = "websocket";
const description = "Websocket Client & Server Library implementing the WebSocket protocol as specified in RFC 6455.";
const keywords = [
  "websocket",
  "websockets",
  "socket",
  "networking",
  "comet",
  "push",
  "RFC-6455",
  "realtime",
  "server",
  "client"
];
const author = "Brian McKelvey <theturtle32@gmail.com> (https://github.com/theturtle32)";
const contributors = [
  "I\xF1aki Baz Castillo <ibc@aliax.net> (http://dev.sipdoc.net)"
];
const version$5 = "1.0.34";
const repository = {
  type: "git",
  url: "https://github.com/theturtle32/WebSocket-Node.git"
};
const homepage = "https://github.com/theturtle32/WebSocket-Node";
const engines = {
  node: ">=4.0.0"
};
const dependencies = {
  bufferutil: "^4.0.1",
  debug: "^2.2.0",
  "es5-ext": "^0.10.50",
  "typedarray-to-buffer": "^3.1.5",
  "utf-8-validate": "^5.0.2",
  yaeti: "^0.0.6"
};
const devDependencies = {
  "buffer-equal": "^1.0.0",
  gulp: "^4.0.2",
  "gulp-jshint": "^2.0.4",
  "jshint-stylish": "^2.2.1",
  jshint: "^2.0.0",
  tape: "^4.9.1"
};
const config = {
  verbose: false
};
const scripts = {
  test: "tape test/unit/*.js",
  gulp: "gulp"
};
const main = "index";
const directories = {
  lib: "./lib"
};
const browser = "lib/browser.js";
const license = "Apache-2.0";
const require$$0 = {
  name,
  description,
  keywords,
  author,
  contributors,
  version: version$5,
  repository,
  homepage,
  engines,
  dependencies,
  devDependencies,
  config,
  scripts,
  main,
  directories,
  browser,
  license
};
var version$4 = require$$0.version;
var websocket = {
  "server": WebSocketServer_1,
  "client": WebSocketClient_1,
  "router": WebSocketRouter_1,
  "frame": WebSocketFrame_1,
  "request": WebSocketRequest_1,
  "connection": WebSocketConnection_1,
  "w3cwebsocket": W3CWebSocket_1,
  "deprecation": Deprecation_1,
  "version": version$4
};
(function(module) {
  module.exports = websocket;
})(websocket$1);
const version$3 = "2.1.0";
const DEFAULT_HEADERS$3 = { "X-Client-Info": `realtime-js/${version$3}` };
const VSN = "1.0.0";
const DEFAULT_TIMEOUT = 1e4;
const WS_CLOSE_NORMAL = 1e3;
var SOCKET_STATES;
(function(SOCKET_STATES2) {
  SOCKET_STATES2[SOCKET_STATES2["connecting"] = 0] = "connecting";
  SOCKET_STATES2[SOCKET_STATES2["open"] = 1] = "open";
  SOCKET_STATES2[SOCKET_STATES2["closing"] = 2] = "closing";
  SOCKET_STATES2[SOCKET_STATES2["closed"] = 3] = "closed";
})(SOCKET_STATES || (SOCKET_STATES = {}));
var CHANNEL_STATES;
(function(CHANNEL_STATES2) {
  CHANNEL_STATES2["closed"] = "closed";
  CHANNEL_STATES2["errored"] = "errored";
  CHANNEL_STATES2["joined"] = "joined";
  CHANNEL_STATES2["joining"] = "joining";
  CHANNEL_STATES2["leaving"] = "leaving";
})(CHANNEL_STATES || (CHANNEL_STATES = {}));
var CHANNEL_EVENTS;
(function(CHANNEL_EVENTS2) {
  CHANNEL_EVENTS2["close"] = "phx_close";
  CHANNEL_EVENTS2["error"] = "phx_error";
  CHANNEL_EVENTS2["join"] = "phx_join";
  CHANNEL_EVENTS2["reply"] = "phx_reply";
  CHANNEL_EVENTS2["leave"] = "phx_leave";
  CHANNEL_EVENTS2["access_token"] = "access_token";
})(CHANNEL_EVENTS || (CHANNEL_EVENTS = {}));
var TRANSPORTS;
(function(TRANSPORTS2) {
  TRANSPORTS2["websocket"] = "websocket";
})(TRANSPORTS || (TRANSPORTS = {}));
var CONNECTION_STATE;
(function(CONNECTION_STATE2) {
  CONNECTION_STATE2["Connecting"] = "connecting";
  CONNECTION_STATE2["Open"] = "open";
  CONNECTION_STATE2["Closing"] = "closing";
  CONNECTION_STATE2["Closed"] = "closed";
})(CONNECTION_STATE || (CONNECTION_STATE = {}));
class Timer {
  constructor(callback, timerCalc) {
    this.callback = callback;
    this.timerCalc = timerCalc;
    this.timer = void 0;
    this.tries = 0;
    this.callback = callback;
    this.timerCalc = timerCalc;
  }
  reset() {
    this.tries = 0;
    clearTimeout(this.timer);
  }
  scheduleTimeout() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.tries = this.tries + 1;
      this.callback();
    }, this.timerCalc(this.tries + 1));
  }
}
class Serializer {
  constructor() {
    this.HEADER_LENGTH = 1;
  }
  decode(rawPayload, callback) {
    if (rawPayload.constructor === ArrayBuffer) {
      return callback(this._binaryDecode(rawPayload));
    }
    if (typeof rawPayload === "string") {
      return callback(JSON.parse(rawPayload));
    }
    return callback({});
  }
  _binaryDecode(buffer) {
    const view = new DataView(buffer);
    const decoder = new TextDecoder();
    return this._decodeBroadcast(buffer, view, decoder);
  }
  _decodeBroadcast(buffer, view, decoder) {
    const topicSize = view.getUint8(1);
    const eventSize = view.getUint8(2);
    let offset = this.HEADER_LENGTH + 2;
    const topic = decoder.decode(buffer.slice(offset, offset + topicSize));
    offset = offset + topicSize;
    const event = decoder.decode(buffer.slice(offset, offset + eventSize));
    offset = offset + eventSize;
    const data = JSON.parse(decoder.decode(buffer.slice(offset, buffer.byteLength)));
    return { ref: null, topic, event, payload: data };
  }
}
class Push {
  constructor(channel, event, payload = {}, timeout = DEFAULT_TIMEOUT) {
    this.channel = channel;
    this.event = event;
    this.payload = payload;
    this.timeout = timeout;
    this.sent = false;
    this.timeoutTimer = void 0;
    this.ref = "";
    this.receivedResp = null;
    this.recHooks = [];
    this.refEvent = null;
    this.rateLimited = false;
  }
  resend(timeout) {
    this.timeout = timeout;
    this._cancelRefEvent();
    this.ref = "";
    this.refEvent = null;
    this.receivedResp = null;
    this.sent = false;
    this.send();
  }
  send() {
    if (this._hasReceived("timeout")) {
      return;
    }
    this.startTimeout();
    this.sent = true;
    const status = this.channel.socket.push({
      topic: this.channel.topic,
      event: this.event,
      payload: this.payload,
      ref: this.ref,
      join_ref: this.channel._joinRef()
    });
    if (status === "rate limited") {
      this.rateLimited = true;
    }
  }
  updatePayload(payload) {
    this.payload = Object.assign(Object.assign({}, this.payload), payload);
  }
  receive(status, callback) {
    var _a;
    if (this._hasReceived(status)) {
      callback((_a = this.receivedResp) === null || _a === void 0 ? void 0 : _a.response);
    }
    this.recHooks.push({ status, callback });
    return this;
  }
  startTimeout() {
    if (this.timeoutTimer) {
      return;
    }
    this.ref = this.channel.socket._makeRef();
    this.refEvent = this.channel._replyEventName(this.ref);
    const callback = (payload) => {
      this._cancelRefEvent();
      this._cancelTimeout();
      this.receivedResp = payload;
      this._matchReceive(payload);
    };
    this.channel._on(this.refEvent, {}, callback);
    this.timeoutTimer = setTimeout(() => {
      this.trigger("timeout", {});
    }, this.timeout);
  }
  trigger(status, response) {
    if (this.refEvent)
      this.channel._trigger(this.refEvent, { status, response });
  }
  destroy() {
    this._cancelRefEvent();
    this._cancelTimeout();
  }
  _cancelRefEvent() {
    if (!this.refEvent) {
      return;
    }
    this.channel._off(this.refEvent, {});
  }
  _cancelTimeout() {
    clearTimeout(this.timeoutTimer);
    this.timeoutTimer = void 0;
  }
  _matchReceive({ status, response }) {
    this.recHooks.filter((h2) => h2.status === status).forEach((h2) => h2.callback(response));
  }
  _hasReceived(status) {
    return this.receivedResp && this.receivedResp.status === status;
  }
}
var REALTIME_PRESENCE_LISTEN_EVENTS;
(function(REALTIME_PRESENCE_LISTEN_EVENTS2) {
  REALTIME_PRESENCE_LISTEN_EVENTS2["SYNC"] = "sync";
  REALTIME_PRESENCE_LISTEN_EVENTS2["JOIN"] = "join";
  REALTIME_PRESENCE_LISTEN_EVENTS2["LEAVE"] = "leave";
})(REALTIME_PRESENCE_LISTEN_EVENTS || (REALTIME_PRESENCE_LISTEN_EVENTS = {}));
class RealtimePresence {
  constructor(channel, opts) {
    this.channel = channel;
    this.state = {};
    this.pendingDiffs = [];
    this.joinRef = null;
    this.caller = {
      onJoin: () => {
      },
      onLeave: () => {
      },
      onSync: () => {
      }
    };
    const events = (opts === null || opts === void 0 ? void 0 : opts.events) || {
      state: "presence_state",
      diff: "presence_diff"
    };
    this.channel._on(events.state, {}, (newState) => {
      const { onJoin, onLeave, onSync } = this.caller;
      this.joinRef = this.channel._joinRef();
      this.state = RealtimePresence.syncState(this.state, newState, onJoin, onLeave);
      this.pendingDiffs.forEach((diff) => {
        this.state = RealtimePresence.syncDiff(this.state, diff, onJoin, onLeave);
      });
      this.pendingDiffs = [];
      onSync();
    });
    this.channel._on(events.diff, {}, (diff) => {
      const { onJoin, onLeave, onSync } = this.caller;
      if (this.inPendingSyncState()) {
        this.pendingDiffs.push(diff);
      } else {
        this.state = RealtimePresence.syncDiff(this.state, diff, onJoin, onLeave);
        onSync();
      }
    });
    this.onJoin((key, currentPresences, newPresences) => {
      this.channel._trigger("presence", {
        event: "join",
        key,
        currentPresences,
        newPresences
      });
    });
    this.onLeave((key, currentPresences, leftPresences) => {
      this.channel._trigger("presence", {
        event: "leave",
        key,
        currentPresences,
        leftPresences
      });
    });
    this.onSync(() => {
      this.channel._trigger("presence", { event: "sync" });
    });
  }
  static syncState(currentState, newState, onJoin, onLeave) {
    const state = this.cloneDeep(currentState);
    const transformedState = this.transformState(newState);
    const joins = {};
    const leaves = {};
    this.map(state, (key, presences) => {
      if (!transformedState[key]) {
        leaves[key] = presences;
      }
    });
    this.map(transformedState, (key, newPresences) => {
      const currentPresences = state[key];
      if (currentPresences) {
        const newPresenceRefs = newPresences.map((m) => m.presence_ref);
        const curPresenceRefs = currentPresences.map((m) => m.presence_ref);
        const joinedPresences = newPresences.filter((m) => curPresenceRefs.indexOf(m.presence_ref) < 0);
        const leftPresences = currentPresences.filter((m) => newPresenceRefs.indexOf(m.presence_ref) < 0);
        if (joinedPresences.length > 0) {
          joins[key] = joinedPresences;
        }
        if (leftPresences.length > 0) {
          leaves[key] = leftPresences;
        }
      } else {
        joins[key] = newPresences;
      }
    });
    return this.syncDiff(state, { joins, leaves }, onJoin, onLeave);
  }
  static syncDiff(state, diff, onJoin, onLeave) {
    const { joins, leaves } = {
      joins: this.transformState(diff.joins),
      leaves: this.transformState(diff.leaves)
    };
    if (!onJoin) {
      onJoin = () => {
      };
    }
    if (!onLeave) {
      onLeave = () => {
      };
    }
    this.map(joins, (key, newPresences) => {
      var _a;
      const currentPresences = (_a = state[key]) !== null && _a !== void 0 ? _a : [];
      state[key] = this.cloneDeep(newPresences);
      if (currentPresences.length > 0) {
        const joinedPresenceRefs = state[key].map((m) => m.presence_ref);
        const curPresences = currentPresences.filter((m) => joinedPresenceRefs.indexOf(m.presence_ref) < 0);
        state[key].unshift(...curPresences);
      }
      onJoin(key, currentPresences, newPresences);
    });
    this.map(leaves, (key, leftPresences) => {
      let currentPresences = state[key];
      if (!currentPresences)
        return;
      const presenceRefsToRemove = leftPresences.map((m) => m.presence_ref);
      currentPresences = currentPresences.filter((m) => presenceRefsToRemove.indexOf(m.presence_ref) < 0);
      state[key] = currentPresences;
      onLeave(key, currentPresences, leftPresences);
      if (currentPresences.length === 0)
        delete state[key];
    });
    return state;
  }
  static map(obj, func) {
    return Object.getOwnPropertyNames(obj).map((key) => func(key, obj[key]));
  }
  static transformState(state) {
    state = this.cloneDeep(state);
    return Object.getOwnPropertyNames(state).reduce((newState, key) => {
      const presences = state[key];
      if ("metas" in presences) {
        newState[key] = presences.metas.map((presence) => {
          presence["presence_ref"] = presence["phx_ref"];
          delete presence["phx_ref"];
          delete presence["phx_ref_prev"];
          return presence;
        });
      } else {
        newState[key] = presences;
      }
      return newState;
    }, {});
  }
  static cloneDeep(obj) {
    return JSON.parse(JSON.stringify(obj));
  }
  onJoin(callback) {
    this.caller.onJoin = callback;
  }
  onLeave(callback) {
    this.caller.onLeave = callback;
  }
  onSync(callback) {
    this.caller.onSync = callback;
  }
  inPendingSyncState() {
    return !this.joinRef || this.joinRef !== this.channel._joinRef();
  }
}
var PostgresTypes;
(function(PostgresTypes2) {
  PostgresTypes2["abstime"] = "abstime";
  PostgresTypes2["bool"] = "bool";
  PostgresTypes2["date"] = "date";
  PostgresTypes2["daterange"] = "daterange";
  PostgresTypes2["float4"] = "float4";
  PostgresTypes2["float8"] = "float8";
  PostgresTypes2["int2"] = "int2";
  PostgresTypes2["int4"] = "int4";
  PostgresTypes2["int4range"] = "int4range";
  PostgresTypes2["int8"] = "int8";
  PostgresTypes2["int8range"] = "int8range";
  PostgresTypes2["json"] = "json";
  PostgresTypes2["jsonb"] = "jsonb";
  PostgresTypes2["money"] = "money";
  PostgresTypes2["numeric"] = "numeric";
  PostgresTypes2["oid"] = "oid";
  PostgresTypes2["reltime"] = "reltime";
  PostgresTypes2["text"] = "text";
  PostgresTypes2["time"] = "time";
  PostgresTypes2["timestamp"] = "timestamp";
  PostgresTypes2["timestamptz"] = "timestamptz";
  PostgresTypes2["timetz"] = "timetz";
  PostgresTypes2["tsrange"] = "tsrange";
  PostgresTypes2["tstzrange"] = "tstzrange";
})(PostgresTypes || (PostgresTypes = {}));
const convertChangeData = (columns, record, options = {}) => {
  var _a;
  const skipTypes = (_a = options.skipTypes) !== null && _a !== void 0 ? _a : [];
  return Object.keys(record).reduce((acc, rec_key) => {
    acc[rec_key] = convertColumn(rec_key, columns, record, skipTypes);
    return acc;
  }, {});
};
const convertColumn = (columnName, columns, record, skipTypes) => {
  const column = columns.find((x) => x.name === columnName);
  const colType = column === null || column === void 0 ? void 0 : column.type;
  const value = record[columnName];
  if (colType && !skipTypes.includes(colType)) {
    return convertCell(colType, value);
  }
  return noop$1(value);
};
const convertCell = (type, value) => {
  if (type.charAt(0) === "_") {
    const dataType = type.slice(1, type.length);
    return toArray(value, dataType);
  }
  switch (type) {
    case PostgresTypes.bool:
      return toBoolean(value);
    case PostgresTypes.float4:
    case PostgresTypes.float8:
    case PostgresTypes.int2:
    case PostgresTypes.int4:
    case PostgresTypes.int8:
    case PostgresTypes.numeric:
    case PostgresTypes.oid:
      return toNumber(value);
    case PostgresTypes.json:
    case PostgresTypes.jsonb:
      return toJson(value);
    case PostgresTypes.timestamp:
      return toTimestampString(value);
    case PostgresTypes.abstime:
    case PostgresTypes.date:
    case PostgresTypes.daterange:
    case PostgresTypes.int4range:
    case PostgresTypes.int8range:
    case PostgresTypes.money:
    case PostgresTypes.reltime:
    case PostgresTypes.text:
    case PostgresTypes.time:
    case PostgresTypes.timestamptz:
    case PostgresTypes.timetz:
    case PostgresTypes.tsrange:
    case PostgresTypes.tstzrange:
      return noop$1(value);
    default:
      return noop$1(value);
  }
};
const noop$1 = (value) => {
  return value;
};
const toBoolean = (value) => {
  switch (value) {
    case "t":
      return true;
    case "f":
      return false;
    default:
      return value;
  }
};
const toNumber = (value) => {
  if (typeof value === "string") {
    const parsedValue = parseFloat(value);
    if (!Number.isNaN(parsedValue)) {
      return parsedValue;
    }
  }
  return value;
};
const toJson = (value) => {
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch (error) {
      console.log(`JSON parse error: ${error}`);
      return value;
    }
  }
  return value;
};
const toArray = (value, type) => {
  if (typeof value !== "string") {
    return value;
  }
  const lastIdx = value.length - 1;
  const closeBrace = value[lastIdx];
  const openBrace = value[0];
  if (openBrace === "{" && closeBrace === "}") {
    let arr;
    const valTrim = value.slice(1, lastIdx);
    try {
      arr = JSON.parse("[" + valTrim + "]");
    } catch (_) {
      arr = valTrim ? valTrim.split(",") : [];
    }
    return arr.map((val) => convertCell(type, val));
  }
  return value;
};
const toTimestampString = (value) => {
  if (typeof value === "string") {
    return value.replace(" ", "T");
  }
  return value;
};
var __awaiter$b = globalThis && globalThis.__awaiter || function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var REALTIME_POSTGRES_CHANGES_LISTEN_EVENT;
(function(REALTIME_POSTGRES_CHANGES_LISTEN_EVENT2) {
  REALTIME_POSTGRES_CHANGES_LISTEN_EVENT2["ALL"] = "*";
  REALTIME_POSTGRES_CHANGES_LISTEN_EVENT2["INSERT"] = "INSERT";
  REALTIME_POSTGRES_CHANGES_LISTEN_EVENT2["UPDATE"] = "UPDATE";
  REALTIME_POSTGRES_CHANGES_LISTEN_EVENT2["DELETE"] = "DELETE";
})(REALTIME_POSTGRES_CHANGES_LISTEN_EVENT || (REALTIME_POSTGRES_CHANGES_LISTEN_EVENT = {}));
var REALTIME_LISTEN_TYPES;
(function(REALTIME_LISTEN_TYPES2) {
  REALTIME_LISTEN_TYPES2["BROADCAST"] = "broadcast";
  REALTIME_LISTEN_TYPES2["PRESENCE"] = "presence";
  REALTIME_LISTEN_TYPES2["POSTGRES_CHANGES"] = "postgres_changes";
})(REALTIME_LISTEN_TYPES || (REALTIME_LISTEN_TYPES = {}));
var REALTIME_SUBSCRIBE_STATES;
(function(REALTIME_SUBSCRIBE_STATES2) {
  REALTIME_SUBSCRIBE_STATES2["SUBSCRIBED"] = "SUBSCRIBED";
  REALTIME_SUBSCRIBE_STATES2["TIMED_OUT"] = "TIMED_OUT";
  REALTIME_SUBSCRIBE_STATES2["CLOSED"] = "CLOSED";
  REALTIME_SUBSCRIBE_STATES2["CHANNEL_ERROR"] = "CHANNEL_ERROR";
})(REALTIME_SUBSCRIBE_STATES || (REALTIME_SUBSCRIBE_STATES = {}));
class RealtimeChannel {
  constructor(topic, params = { config: {} }, socket) {
    this.topic = topic;
    this.params = params;
    this.socket = socket;
    this.bindings = {};
    this.state = CHANNEL_STATES.closed;
    this.joinedOnce = false;
    this.pushBuffer = [];
    this.params.config = Object.assign({
      broadcast: { ack: false, self: false },
      presence: { key: "" }
    }, params.config);
    this.timeout = this.socket.timeout;
    this.joinPush = new Push(this, CHANNEL_EVENTS.join, this.params, this.timeout);
    this.rejoinTimer = new Timer(() => this._rejoinUntilConnected(), this.socket.reconnectAfterMs);
    this.joinPush.receive("ok", () => {
      this.state = CHANNEL_STATES.joined;
      this.rejoinTimer.reset();
      this.pushBuffer.forEach((pushEvent) => pushEvent.send());
      this.pushBuffer = [];
    });
    this._onClose(() => {
      this.rejoinTimer.reset();
      this.socket.log("channel", `close ${this.topic} ${this._joinRef()}`);
      this.state = CHANNEL_STATES.closed;
      this.socket._remove(this);
    });
    this._onError((reason) => {
      if (this._isLeaving() || this._isClosed()) {
        return;
      }
      this.socket.log("channel", `error ${this.topic}`, reason);
      this.state = CHANNEL_STATES.errored;
      this.rejoinTimer.scheduleTimeout();
    });
    this.joinPush.receive("timeout", () => {
      if (!this._isJoining()) {
        return;
      }
      this.socket.log("channel", `timeout ${this.topic}`, this.joinPush.timeout);
      this.state = CHANNEL_STATES.errored;
      this.rejoinTimer.scheduleTimeout();
    });
    this._on(CHANNEL_EVENTS.reply, {}, (payload, ref2) => {
      this._trigger(this._replyEventName(ref2), payload);
    });
    this.presence = new RealtimePresence(this);
  }
  subscribe(callback, timeout = this.timeout) {
    var _a, _b;
    if (this.joinedOnce) {
      throw `tried to subscribe multiple times. 'subscribe' can only be called a single time per channel instance`;
    } else {
      const { config: { broadcast, presence } } = this.params;
      this._onError((e) => callback && callback("CHANNEL_ERROR", e));
      this._onClose(() => callback && callback("CLOSED"));
      const accessTokenPayload = {};
      const config2 = {
        broadcast,
        presence,
        postgres_changes: (_b = (_a = this.bindings.postgres_changes) === null || _a === void 0 ? void 0 : _a.map((r) => r.filter)) !== null && _b !== void 0 ? _b : []
      };
      if (this.socket.accessToken) {
        accessTokenPayload.access_token = this.socket.accessToken;
      }
      this.updateJoinPayload(Object.assign({ config: config2 }, accessTokenPayload));
      this.joinedOnce = true;
      this._rejoin(timeout);
      this.joinPush.receive("ok", ({ postgres_changes: serverPostgresFilters }) => {
        var _a2;
        this.socket.accessToken && this.socket.setAuth(this.socket.accessToken);
        if (serverPostgresFilters === void 0) {
          callback && callback("SUBSCRIBED");
          return;
        } else {
          const clientPostgresBindings = this.bindings.postgres_changes;
          const bindingsLen = (_a2 = clientPostgresBindings === null || clientPostgresBindings === void 0 ? void 0 : clientPostgresBindings.length) !== null && _a2 !== void 0 ? _a2 : 0;
          const newPostgresBindings = [];
          for (let i = 0; i < bindingsLen; i++) {
            const clientPostgresBinding = clientPostgresBindings[i];
            const { filter: { event, schema, table, filter } } = clientPostgresBinding;
            const serverPostgresFilter = serverPostgresFilters && serverPostgresFilters[i];
            if (serverPostgresFilter && serverPostgresFilter.event === event && serverPostgresFilter.schema === schema && serverPostgresFilter.table === table && serverPostgresFilter.filter === filter) {
              newPostgresBindings.push(Object.assign(Object.assign({}, clientPostgresBinding), { id: serverPostgresFilter.id }));
            } else {
              this.unsubscribe();
              callback && callback("CHANNEL_ERROR", new Error("mismatch between server and client bindings for postgres changes"));
              return;
            }
          }
          this.bindings.postgres_changes = newPostgresBindings;
          callback && callback("SUBSCRIBED");
          return;
        }
      }).receive("error", (error) => {
        callback && callback("CHANNEL_ERROR", new Error(JSON.stringify(Object.values(error).join(", ") || "error")));
        return;
      }).receive("timeout", () => {
        callback && callback("TIMED_OUT");
        return;
      });
    }
    return this;
  }
  presenceState() {
    return this.presence.state;
  }
  track(payload, opts = {}) {
    return __awaiter$b(this, void 0, void 0, function* () {
      return yield this.send({
        type: "presence",
        event: "track",
        payload
      }, opts.timeout || this.timeout);
    });
  }
  untrack(opts = {}) {
    return __awaiter$b(this, void 0, void 0, function* () {
      return yield this.send({
        type: "presence",
        event: "untrack"
      }, opts);
    });
  }
  on(type, filter, callback) {
    return this._on(type, filter, callback);
  }
  send(payload, opts = {}) {
    return new Promise((resolve) => {
      var _a, _b, _c;
      const push = this._push(payload.type, payload, opts.timeout || this.timeout);
      if (push.rateLimited) {
        resolve("rate limited");
      }
      if (payload.type === "broadcast" && !((_c = (_b = (_a = this.params) === null || _a === void 0 ? void 0 : _a.config) === null || _b === void 0 ? void 0 : _b.broadcast) === null || _c === void 0 ? void 0 : _c.ack)) {
        resolve("ok");
      }
      push.receive("ok", () => resolve("ok"));
      push.receive("timeout", () => resolve("timed out"));
    });
  }
  updateJoinPayload(payload) {
    this.joinPush.updatePayload(payload);
  }
  unsubscribe(timeout = this.timeout) {
    this.state = CHANNEL_STATES.leaving;
    const onClose2 = () => {
      this.socket.log("channel", `leave ${this.topic}`);
      this._trigger(CHANNEL_EVENTS.close, "leave", this._joinRef());
    };
    this.rejoinTimer.reset();
    this.joinPush.destroy();
    return new Promise((resolve) => {
      const leavePush = new Push(this, CHANNEL_EVENTS.leave, {}, timeout);
      leavePush.receive("ok", () => {
        onClose2();
        resolve("ok");
      }).receive("timeout", () => {
        onClose2();
        resolve("timed out");
      }).receive("error", () => {
        resolve("error");
      });
      leavePush.send();
      if (!this._canPush()) {
        leavePush.trigger("ok", {});
      }
    });
  }
  _push(event, payload, timeout = this.timeout) {
    if (!this.joinedOnce) {
      throw `tried to push '${event}' to '${this.topic}' before joining. Use channel.subscribe() before pushing events`;
    }
    let pushEvent = new Push(this, event, payload, timeout);
    if (this._canPush()) {
      pushEvent.send();
    } else {
      pushEvent.startTimeout();
      this.pushBuffer.push(pushEvent);
    }
    return pushEvent;
  }
  _onMessage(_event, payload, _ref) {
    return payload;
  }
  _isMember(topic) {
    return this.topic === topic;
  }
  _joinRef() {
    return this.joinPush.ref;
  }
  _trigger(type, payload, ref2) {
    var _a, _b;
    const typeLower = type.toLocaleLowerCase();
    const { close, error, leave, join } = CHANNEL_EVENTS;
    const events = [close, error, leave, join];
    if (ref2 && events.indexOf(typeLower) >= 0 && ref2 !== this._joinRef()) {
      return;
    }
    let handledPayload = this._onMessage(typeLower, payload, ref2);
    if (payload && !handledPayload) {
      throw "channel onMessage callbacks must return the payload, modified or unmodified";
    }
    if (["insert", "update", "delete"].includes(typeLower)) {
      (_a = this.bindings.postgres_changes) === null || _a === void 0 ? void 0 : _a.filter((bind) => {
        var _a2, _b2, _c;
        return ((_a2 = bind.filter) === null || _a2 === void 0 ? void 0 : _a2.event) === "*" || ((_c = (_b2 = bind.filter) === null || _b2 === void 0 ? void 0 : _b2.event) === null || _c === void 0 ? void 0 : _c.toLocaleLowerCase()) === typeLower;
      }).map((bind) => bind.callback(handledPayload, ref2));
    } else {
      (_b = this.bindings[typeLower]) === null || _b === void 0 ? void 0 : _b.filter((bind) => {
        var _a2, _b2, _c, _d, _e, _f;
        if (["broadcast", "presence", "postgres_changes"].includes(typeLower)) {
          if ("id" in bind) {
            const bindId = bind.id;
            const bindEvent = (_a2 = bind.filter) === null || _a2 === void 0 ? void 0 : _a2.event;
            return bindId && ((_b2 = payload.ids) === null || _b2 === void 0 ? void 0 : _b2.includes(bindId)) && (bindEvent === "*" || (bindEvent === null || bindEvent === void 0 ? void 0 : bindEvent.toLocaleLowerCase()) === ((_c = payload.data) === null || _c === void 0 ? void 0 : _c.type.toLocaleLowerCase()));
          } else {
            const bindEvent = (_e = (_d = bind === null || bind === void 0 ? void 0 : bind.filter) === null || _d === void 0 ? void 0 : _d.event) === null || _e === void 0 ? void 0 : _e.toLocaleLowerCase();
            return bindEvent === "*" || bindEvent === ((_f = payload === null || payload === void 0 ? void 0 : payload.event) === null || _f === void 0 ? void 0 : _f.toLocaleLowerCase());
          }
        } else {
          return bind.type.toLocaleLowerCase() === typeLower;
        }
      }).map((bind) => {
        if (typeof handledPayload === "object" && "ids" in handledPayload) {
          const postgresChanges = handledPayload.data;
          const { schema, table, commit_timestamp, type: type2, errors } = postgresChanges;
          const enrichedPayload = {
            schema,
            table,
            commit_timestamp,
            eventType: type2,
            new: {},
            old: {},
            errors
          };
          handledPayload = Object.assign(Object.assign({}, enrichedPayload), this._getPayloadRecords(postgresChanges));
        }
        bind.callback(handledPayload, ref2);
      });
    }
  }
  _isClosed() {
    return this.state === CHANNEL_STATES.closed;
  }
  _isJoined() {
    return this.state === CHANNEL_STATES.joined;
  }
  _isJoining() {
    return this.state === CHANNEL_STATES.joining;
  }
  _isLeaving() {
    return this.state === CHANNEL_STATES.leaving;
  }
  _replyEventName(ref2) {
    return `chan_reply_${ref2}`;
  }
  _on(type, filter, callback) {
    const typeLower = type.toLocaleLowerCase();
    const binding = {
      type: typeLower,
      filter,
      callback
    };
    if (this.bindings[typeLower]) {
      this.bindings[typeLower].push(binding);
    } else {
      this.bindings[typeLower] = [binding];
    }
    return this;
  }
  _off(type, filter) {
    const typeLower = type.toLocaleLowerCase();
    this.bindings[typeLower] = this.bindings[typeLower].filter((bind) => {
      var _a;
      return !(((_a = bind.type) === null || _a === void 0 ? void 0 : _a.toLocaleLowerCase()) === typeLower && RealtimeChannel.isEqual(bind.filter, filter));
    });
    return this;
  }
  static isEqual(obj1, obj2) {
    if (Object.keys(obj1).length !== Object.keys(obj2).length) {
      return false;
    }
    for (const k in obj1) {
      if (obj1[k] !== obj2[k]) {
        return false;
      }
    }
    return true;
  }
  _rejoinUntilConnected() {
    this.rejoinTimer.scheduleTimeout();
    if (this.socket.isConnected()) {
      this._rejoin();
    }
  }
  _onClose(callback) {
    this._on(CHANNEL_EVENTS.close, {}, callback);
  }
  _onError(callback) {
    this._on(CHANNEL_EVENTS.error, {}, (reason) => callback(reason));
  }
  _canPush() {
    return this.socket.isConnected() && this._isJoined();
  }
  _rejoin(timeout = this.timeout) {
    if (this._isLeaving()) {
      return;
    }
    this.socket._leaveOpenTopic(this.topic);
    this.state = CHANNEL_STATES.joining;
    this.joinPush.resend(timeout);
  }
  _getPayloadRecords(payload) {
    const records = {
      new: {},
      old: {}
    };
    if (payload.type === "INSERT" || payload.type === "UPDATE") {
      records.new = convertChangeData(payload.columns, payload.record);
    }
    if (payload.type === "UPDATE" || payload.type === "DELETE") {
      records.old = convertChangeData(payload.columns, payload.old_record);
    }
    return records;
  }
}
var __awaiter$a = globalThis && globalThis.__awaiter || function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
const noop = () => {
};
class RealtimeClient {
  constructor(endPoint, options) {
    var _a;
    this.accessToken = null;
    this.channels = [];
    this.endPoint = "";
    this.headers = DEFAULT_HEADERS$3;
    this.params = {};
    this.timeout = DEFAULT_TIMEOUT;
    this.transport = websocket$1.exports.w3cwebsocket;
    this.heartbeatIntervalMs = 3e4;
    this.heartbeatTimer = void 0;
    this.pendingHeartbeatRef = null;
    this.ref = 0;
    this.logger = noop;
    this.conn = null;
    this.sendBuffer = [];
    this.serializer = new Serializer();
    this.stateChangeCallbacks = {
      open: [],
      close: [],
      error: [],
      message: []
    };
    this.eventsPerSecondLimitMs = 100;
    this.inThrottle = false;
    this.endPoint = `${endPoint}/${TRANSPORTS.websocket}`;
    if (options === null || options === void 0 ? void 0 : options.params)
      this.params = options.params;
    if (options === null || options === void 0 ? void 0 : options.headers)
      this.headers = Object.assign(Object.assign({}, this.headers), options.headers);
    if (options === null || options === void 0 ? void 0 : options.timeout)
      this.timeout = options.timeout;
    if (options === null || options === void 0 ? void 0 : options.logger)
      this.logger = options.logger;
    if (options === null || options === void 0 ? void 0 : options.transport)
      this.transport = options.transport;
    if (options === null || options === void 0 ? void 0 : options.heartbeatIntervalMs)
      this.heartbeatIntervalMs = options.heartbeatIntervalMs;
    const eventsPerSecond = (_a = options === null || options === void 0 ? void 0 : options.params) === null || _a === void 0 ? void 0 : _a.eventsPerSecond;
    if (eventsPerSecond)
      this.eventsPerSecondLimitMs = Math.floor(1e3 / eventsPerSecond);
    this.reconnectAfterMs = (options === null || options === void 0 ? void 0 : options.reconnectAfterMs) ? options.reconnectAfterMs : (tries) => {
      return [1e3, 2e3, 5e3, 1e4][tries - 1] || 1e4;
    };
    this.encode = (options === null || options === void 0 ? void 0 : options.encode) ? options.encode : (payload, callback) => {
      return callback(JSON.stringify(payload));
    };
    this.decode = (options === null || options === void 0 ? void 0 : options.decode) ? options.decode : this.serializer.decode.bind(this.serializer);
    this.reconnectTimer = new Timer(() => __awaiter$a(this, void 0, void 0, function* () {
      this.disconnect();
      this.connect();
    }), this.reconnectAfterMs);
  }
  connect() {
    if (this.conn) {
      return;
    }
    this.conn = new this.transport(this._endPointURL(), [], null, this.headers);
    if (this.conn) {
      this.conn.binaryType = "arraybuffer";
      this.conn.onopen = () => this._onConnOpen();
      this.conn.onerror = (error) => this._onConnError(error);
      this.conn.onmessage = (event) => this._onConnMessage(event);
      this.conn.onclose = (event) => this._onConnClose(event);
    }
  }
  disconnect(code, reason) {
    if (this.conn) {
      this.conn.onclose = function() {
      };
      if (code) {
        this.conn.close(code, reason !== null && reason !== void 0 ? reason : "");
      } else {
        this.conn.close();
      }
      this.conn = null;
      this.heartbeatTimer && clearInterval(this.heartbeatTimer);
      this.reconnectTimer.reset();
    }
  }
  getChannels() {
    return this.channels;
  }
  removeChannel(channel) {
    return channel.unsubscribe().then((status) => {
      if (this.channels.length === 0) {
        this.disconnect();
      }
      return status;
    });
  }
  removeAllChannels() {
    return Promise.all(this.channels.map((channel) => channel.unsubscribe())).then((values) => {
      this.disconnect();
      return values;
    });
  }
  log(kind, msg, data) {
    this.logger(kind, msg, data);
  }
  connectionState() {
    switch (this.conn && this.conn.readyState) {
      case SOCKET_STATES.connecting:
        return CONNECTION_STATE.Connecting;
      case SOCKET_STATES.open:
        return CONNECTION_STATE.Open;
      case SOCKET_STATES.closing:
        return CONNECTION_STATE.Closing;
      default:
        return CONNECTION_STATE.Closed;
    }
  }
  isConnected() {
    return this.connectionState() === CONNECTION_STATE.Open;
  }
  channel(topic, params = { config: {} }) {
    if (!this.isConnected()) {
      this.connect();
    }
    const chan = new RealtimeChannel(`realtime:${topic}`, params, this);
    this.channels.push(chan);
    return chan;
  }
  push(data) {
    const { topic, event, payload, ref: ref2 } = data;
    let callback = () => {
      this.encode(data, (result) => {
        var _a;
        (_a = this.conn) === null || _a === void 0 ? void 0 : _a.send(result);
      });
    };
    this.log("push", `${topic} ${event} (${ref2})`, payload);
    if (this.isConnected()) {
      if (["broadcast", "presence", "postgres_changes"].includes(event)) {
        const isThrottled = this._throttle(callback)();
        if (isThrottled) {
          return "rate limited";
        }
      } else {
        callback();
      }
    } else {
      this.sendBuffer.push(callback);
    }
  }
  setAuth(token) {
    this.accessToken = token;
    this.channels.forEach((channel) => {
      token && channel.updateJoinPayload({ access_token: token });
      if (channel.joinedOnce && channel._isJoined()) {
        channel._push(CHANNEL_EVENTS.access_token, { access_token: token });
      }
    });
  }
  _makeRef() {
    let newRef = this.ref + 1;
    if (newRef === this.ref) {
      this.ref = 0;
    } else {
      this.ref = newRef;
    }
    return this.ref.toString();
  }
  _leaveOpenTopic(topic) {
    let dupChannel = this.channels.find((c) => c.topic === topic && (c._isJoined() || c._isJoining()));
    if (dupChannel) {
      this.log("transport", `leaving duplicate topic "${topic}"`);
      dupChannel.unsubscribe();
    }
  }
  _remove(channel) {
    this.channels = this.channels.filter((c) => c._joinRef() !== channel._joinRef());
  }
  _endPointURL() {
    return this._appendParams(this.endPoint, Object.assign({}, this.params, { vsn: VSN }));
  }
  _onConnMessage(rawMessage) {
    this.decode(rawMessage.data, (msg) => {
      let { topic, event, payload, ref: ref2 } = msg;
      if (ref2 && ref2 === this.pendingHeartbeatRef || event === (payload === null || payload === void 0 ? void 0 : payload.type)) {
        this.pendingHeartbeatRef = null;
      }
      this.log("receive", `${payload.status || ""} ${topic} ${event} ${ref2 && "(" + ref2 + ")" || ""}`, payload);
      this.channels.filter((channel) => channel._isMember(topic)).forEach((channel) => channel._trigger(event, payload, ref2));
      this.stateChangeCallbacks.message.forEach((callback) => callback(msg));
    });
  }
  _onConnOpen() {
    this.log("transport", `connected to ${this._endPointURL()}`);
    this._flushSendBuffer();
    this.reconnectTimer.reset();
    this.heartbeatTimer && clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = setInterval(() => this._sendHeartbeat(), this.heartbeatIntervalMs);
    this.stateChangeCallbacks.open.forEach((callback) => callback());
  }
  _onConnClose(event) {
    this.log("transport", "close", event);
    this._triggerChanError();
    this.heartbeatTimer && clearInterval(this.heartbeatTimer);
    this.reconnectTimer.scheduleTimeout();
    this.stateChangeCallbacks.close.forEach((callback) => callback(event));
  }
  _onConnError(error) {
    this.log("transport", error.message);
    this._triggerChanError();
    this.stateChangeCallbacks.error.forEach((callback) => callback(error));
  }
  _triggerChanError() {
    this.channels.forEach((channel) => channel._trigger(CHANNEL_EVENTS.error));
  }
  _appendParams(url2, params) {
    if (Object.keys(params).length === 0) {
      return url2;
    }
    const prefix = url2.match(/\?/) ? "&" : "?";
    const query = new URLSearchParams(params);
    return `${url2}${prefix}${query}`;
  }
  _flushSendBuffer() {
    if (this.isConnected() && this.sendBuffer.length > 0) {
      this.sendBuffer.forEach((callback) => callback());
      this.sendBuffer = [];
    }
  }
  _sendHeartbeat() {
    var _a;
    if (!this.isConnected()) {
      return;
    }
    if (this.pendingHeartbeatRef) {
      this.pendingHeartbeatRef = null;
      this.log("transport", "heartbeat timeout. Attempting to re-establish connection");
      (_a = this.conn) === null || _a === void 0 ? void 0 : _a.close(WS_CLOSE_NORMAL, "hearbeat timeout");
      return;
    }
    this.pendingHeartbeatRef = this._makeRef();
    this.push({
      topic: "phoenix",
      event: "heartbeat",
      payload: {},
      ref: this.pendingHeartbeatRef
    });
    this.setAuth(this.accessToken);
  }
  _throttle(callback, eventsPerSecondLimit = this.eventsPerSecondLimitMs) {
    return () => {
      if (this.inThrottle)
        return true;
      callback();
      this.inThrottle = true;
      setTimeout(() => {
        this.inThrottle = false;
      }, eventsPerSecondLimit);
      return false;
    };
  }
}
class StorageError extends Error {
  constructor(message) {
    super(message);
    this.__isStorageError = true;
    this.name = "StorageError";
  }
}
function isStorageError(error) {
  return typeof error === "object" && error !== null && "__isStorageError" in error;
}
class StorageApiError extends StorageError {
  constructor(message, status) {
    super(message);
    this.name = "StorageApiError";
    this.status = status;
  }
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status
    };
  }
}
class StorageUnknownError extends StorageError {
  constructor(message, originalError) {
    super(message);
    this.name = "StorageUnknownError";
    this.originalError = originalError;
  }
}
var __awaiter$9 = globalThis && globalThis.__awaiter || function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
const resolveFetch$2 = (customFetch) => {
  let _fetch;
  if (customFetch) {
    _fetch = customFetch;
  } else if (typeof fetch === "undefined") {
    _fetch = (...args) => __awaiter$9(void 0, void 0, void 0, function* () {
      return yield (yield import('unenv/runtime/npm/cross-fetch')).fetch(...args);
    });
  } else {
    _fetch = fetch;
  }
  return (...args) => _fetch(...args);
};
const resolveResponse = () => __awaiter$9(void 0, void 0, void 0, function* () {
  if (typeof Response === "undefined") {
    return (yield import('unenv/runtime/npm/cross-fetch')).Response;
  }
  return Response;
});
var __awaiter$8 = globalThis && globalThis.__awaiter || function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
const _getErrorMessage$1 = (err) => err.msg || err.message || err.error_description || err.error || JSON.stringify(err);
const handleError$1 = (error, reject) => __awaiter$8(void 0, void 0, void 0, function* () {
  const Res = yield resolveResponse();
  if (error instanceof Res) {
    error.json().then((err) => {
      reject(new StorageApiError(_getErrorMessage$1(err), error.status || 500));
    });
  } else {
    reject(new StorageUnknownError(_getErrorMessage$1(error), error));
  }
});
const _getRequestParams$1 = (method, options, parameters, body) => {
  const params = { method, headers: (options === null || options === void 0 ? void 0 : options.headers) || {} };
  if (method === "GET") {
    return params;
  }
  params.headers = Object.assign({ "Content-Type": "application/json" }, options === null || options === void 0 ? void 0 : options.headers);
  params.body = JSON.stringify(body);
  return Object.assign(Object.assign({}, params), parameters);
};
function _handleRequest$1(fetcher, method, url2, options, parameters, body) {
  return __awaiter$8(this, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
      fetcher(url2, _getRequestParams$1(method, options, parameters, body)).then((result) => {
        if (!result.ok)
          throw result;
        if (options === null || options === void 0 ? void 0 : options.noResolveJson)
          return result;
        return result.json();
      }).then((data) => resolve(data)).catch((error) => handleError$1(error, reject));
    });
  });
}
function get(fetcher, url2, options, parameters) {
  return __awaiter$8(this, void 0, void 0, function* () {
    return _handleRequest$1(fetcher, "GET", url2, options, parameters);
  });
}
function post(fetcher, url2, body, options, parameters) {
  return __awaiter$8(this, void 0, void 0, function* () {
    return _handleRequest$1(fetcher, "POST", url2, options, parameters, body);
  });
}
function put(fetcher, url2, body, options, parameters) {
  return __awaiter$8(this, void 0, void 0, function* () {
    return _handleRequest$1(fetcher, "PUT", url2, options, parameters, body);
  });
}
function remove(fetcher, url2, body, options, parameters) {
  return __awaiter$8(this, void 0, void 0, function* () {
    return _handleRequest$1(fetcher, "DELETE", url2, options, parameters, body);
  });
}
var __awaiter$7 = globalThis && globalThis.__awaiter || function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
const DEFAULT_SEARCH_OPTIONS = {
  limit: 100,
  offset: 0,
  sortBy: {
    column: "name",
    order: "asc"
  }
};
const DEFAULT_FILE_OPTIONS = {
  cacheControl: "3600",
  contentType: "text/plain;charset=UTF-8",
  upsert: false
};
class StorageFileApi {
  constructor(url2, headers = {}, bucketId, fetch2) {
    this.url = url2;
    this.headers = headers;
    this.bucketId = bucketId;
    this.fetch = resolveFetch$2(fetch2);
  }
  uploadOrUpdate(method, path, fileBody, fileOptions) {
    return __awaiter$7(this, void 0, void 0, function* () {
      try {
        let body;
        const options = Object.assign(Object.assign({}, DEFAULT_FILE_OPTIONS), fileOptions);
        const headers = Object.assign(Object.assign({}, this.headers), method === "POST" && { "x-upsert": String(options.upsert) });
        if (typeof Blob !== "undefined" && fileBody instanceof Blob) {
          body = new FormData();
          body.append("cacheControl", options.cacheControl);
          body.append("", fileBody);
        } else if (typeof FormData !== "undefined" && fileBody instanceof FormData) {
          body = fileBody;
          body.append("cacheControl", options.cacheControl);
        } else {
          body = fileBody;
          headers["cache-control"] = `max-age=${options.cacheControl}`;
          headers["content-type"] = options.contentType;
        }
        const cleanPath = this._removeEmptyFolders(path);
        const _path = this._getFinalPath(cleanPath);
        const res = yield this.fetch(`${this.url}/object/${_path}`, {
          method,
          body,
          headers
        });
        if (res.ok) {
          return {
            data: { path: cleanPath },
            error: null
          };
        } else {
          const error = yield res.json();
          return { data: null, error };
        }
      } catch (error) {
        if (isStorageError(error)) {
          return { data: null, error };
        }
        throw error;
      }
    });
  }
  upload(path, fileBody, fileOptions) {
    return __awaiter$7(this, void 0, void 0, function* () {
      return this.uploadOrUpdate("POST", path, fileBody, fileOptions);
    });
  }
  update(path, fileBody, fileOptions) {
    return __awaiter$7(this, void 0, void 0, function* () {
      return this.uploadOrUpdate("PUT", path, fileBody, fileOptions);
    });
  }
  move(fromPath, toPath) {
    return __awaiter$7(this, void 0, void 0, function* () {
      try {
        const data = yield post(this.fetch, `${this.url}/object/move`, { bucketId: this.bucketId, sourceKey: fromPath, destinationKey: toPath }, { headers: this.headers });
        return { data, error: null };
      } catch (error) {
        if (isStorageError(error)) {
          return { data: null, error };
        }
        throw error;
      }
    });
  }
  copy(fromPath, toPath) {
    return __awaiter$7(this, void 0, void 0, function* () {
      try {
        const data = yield post(this.fetch, `${this.url}/object/copy`, { bucketId: this.bucketId, sourceKey: fromPath, destinationKey: toPath }, { headers: this.headers });
        return { data: { path: data.Key }, error: null };
      } catch (error) {
        if (isStorageError(error)) {
          return { data: null, error };
        }
        throw error;
      }
    });
  }
  createSignedUrl(path, expiresIn, options) {
    return __awaiter$7(this, void 0, void 0, function* () {
      try {
        const _path = this._getFinalPath(path);
        let data = yield post(this.fetch, `${this.url}/object/sign/${_path}`, { expiresIn }, { headers: this.headers });
        const downloadQueryParam = (options === null || options === void 0 ? void 0 : options.download) ? `&download=${options.download === true ? "" : options.download}` : "";
        const signedUrl = encodeURI(`${this.url}${data.signedURL}${downloadQueryParam}`);
        data = { signedUrl };
        return { data, error: null };
      } catch (error) {
        if (isStorageError(error)) {
          return { data: null, error };
        }
        throw error;
      }
    });
  }
  createSignedUrls(paths, expiresIn, options) {
    return __awaiter$7(this, void 0, void 0, function* () {
      try {
        const data = yield post(this.fetch, `${this.url}/object/sign/${this.bucketId}`, { expiresIn, paths }, { headers: this.headers });
        const downloadQueryParam = (options === null || options === void 0 ? void 0 : options.download) ? `&download=${options.download === true ? "" : options.download}` : "";
        return {
          data: data.map((datum) => Object.assign(Object.assign({}, datum), { signedUrl: datum.signedURL ? encodeURI(`${this.url}${datum.signedURL}${downloadQueryParam}`) : null })),
          error: null
        };
      } catch (error) {
        if (isStorageError(error)) {
          return { data: null, error };
        }
        throw error;
      }
    });
  }
  download(path) {
    return __awaiter$7(this, void 0, void 0, function* () {
      try {
        const _path = this._getFinalPath(path);
        const res = yield get(this.fetch, `${this.url}/object/${_path}`, {
          headers: this.headers,
          noResolveJson: true
        });
        const data = yield res.blob();
        return { data, error: null };
      } catch (error) {
        if (isStorageError(error)) {
          return { data: null, error };
        }
        throw error;
      }
    });
  }
  getPublicUrl(path, options) {
    const _path = this._getFinalPath(path);
    const downloadQueryParam = (options === null || options === void 0 ? void 0 : options.download) ? `?download=${options.download === true ? "" : options.download}` : "";
    return {
      data: { publicUrl: encodeURI(`${this.url}/object/public/${_path}${downloadQueryParam}`) }
    };
  }
  remove(paths) {
    return __awaiter$7(this, void 0, void 0, function* () {
      try {
        const data = yield remove(this.fetch, `${this.url}/object/${this.bucketId}`, { prefixes: paths }, { headers: this.headers });
        return { data, error: null };
      } catch (error) {
        if (isStorageError(error)) {
          return { data: null, error };
        }
        throw error;
      }
    });
  }
  list(path, options, parameters) {
    return __awaiter$7(this, void 0, void 0, function* () {
      try {
        const body = Object.assign(Object.assign(Object.assign({}, DEFAULT_SEARCH_OPTIONS), options), { prefix: path || "" });
        const data = yield post(this.fetch, `${this.url}/object/list/${this.bucketId}`, body, { headers: this.headers }, parameters);
        return { data, error: null };
      } catch (error) {
        if (isStorageError(error)) {
          return { data: null, error };
        }
        throw error;
      }
    });
  }
  _getFinalPath(path) {
    return `${this.bucketId}/${path}`;
  }
  _removeEmptyFolders(path) {
    return path.replace(/^\/|\/$/g, "").replace(/\/+/g, "/");
  }
}
const version$2 = "2.0.0";
const DEFAULT_HEADERS$2 = { "X-Client-Info": `storage-js/${version$2}` };
var __awaiter$6 = globalThis && globalThis.__awaiter || function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
class StorageBucketApi {
  constructor(url2, headers = {}, fetch2) {
    this.url = url2;
    this.headers = Object.assign(Object.assign({}, DEFAULT_HEADERS$2), headers);
    this.fetch = resolveFetch$2(fetch2);
  }
  listBuckets() {
    return __awaiter$6(this, void 0, void 0, function* () {
      try {
        const data = yield get(this.fetch, `${this.url}/bucket`, { headers: this.headers });
        return { data, error: null };
      } catch (error) {
        if (isStorageError(error)) {
          return { data: null, error };
        }
        throw error;
      }
    });
  }
  getBucket(id) {
    return __awaiter$6(this, void 0, void 0, function* () {
      try {
        const data = yield get(this.fetch, `${this.url}/bucket/${id}`, { headers: this.headers });
        return { data, error: null };
      } catch (error) {
        if (isStorageError(error)) {
          return { data: null, error };
        }
        throw error;
      }
    });
  }
  createBucket(id, options = { public: false }) {
    return __awaiter$6(this, void 0, void 0, function* () {
      try {
        const data = yield post(this.fetch, `${this.url}/bucket`, { id, name: id, public: options.public }, { headers: this.headers });
        return { data, error: null };
      } catch (error) {
        if (isStorageError(error)) {
          return { data: null, error };
        }
        throw error;
      }
    });
  }
  updateBucket(id, options) {
    return __awaiter$6(this, void 0, void 0, function* () {
      try {
        const data = yield put(this.fetch, `${this.url}/bucket/${id}`, { id, name: id, public: options.public }, { headers: this.headers });
        return { data, error: null };
      } catch (error) {
        if (isStorageError(error)) {
          return { data: null, error };
        }
        throw error;
      }
    });
  }
  emptyBucket(id) {
    return __awaiter$6(this, void 0, void 0, function* () {
      try {
        const data = yield post(this.fetch, `${this.url}/bucket/${id}/empty`, {}, { headers: this.headers });
        return { data, error: null };
      } catch (error) {
        if (isStorageError(error)) {
          return { data: null, error };
        }
        throw error;
      }
    });
  }
  deleteBucket(id) {
    return __awaiter$6(this, void 0, void 0, function* () {
      try {
        const data = yield remove(this.fetch, `${this.url}/bucket/${id}`, {}, { headers: this.headers });
        return { data, error: null };
      } catch (error) {
        if (isStorageError(error)) {
          return { data: null, error };
        }
        throw error;
      }
    });
  }
}
class StorageClient extends StorageBucketApi {
  constructor(url2, headers = {}, fetch2) {
    super(url2, headers, fetch2);
  }
  from(id) {
    return new StorageFileApi(this.url, this.headers, id, this.fetch);
  }
}
const version$1 = "2.0.6";
const DEFAULT_HEADERS$1 = { "X-Client-Info": `supabase-js/${version$1}` };
var __awaiter$5 = globalThis && globalThis.__awaiter || function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
const resolveFetch$1 = (customFetch) => {
  let _fetch;
  if (customFetch) {
    _fetch = customFetch;
  } else if (typeof fetch === "undefined") {
    _fetch = crossFetch;
  } else {
    _fetch = fetch;
  }
  return (...args) => _fetch(...args);
};
const resolveHeadersConstructor = () => {
  if (typeof Headers === "undefined") {
    return Headers$1;
  }
  return Headers;
};
const fetchWithAuth = (supabaseKey, getAccessToken, customFetch) => {
  const fetch2 = resolveFetch$1(customFetch);
  const HeadersConstructor = resolveHeadersConstructor();
  return (input, init) => __awaiter$5(void 0, void 0, void 0, function* () {
    var _a;
    const accessToken = (_a = yield getAccessToken()) !== null && _a !== void 0 ? _a : supabaseKey;
    let headers = new HeadersConstructor(init === null || init === void 0 ? void 0 : init.headers);
    if (!headers.has("apikey")) {
      headers.set("apikey", supabaseKey);
    }
    if (!headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
    return fetch2(input, Object.assign(Object.assign({}, init), { headers }));
  });
};
function stripTrailingSlash(url2) {
  return url2.replace(/\/$/, "");
}
function applySettingDefaults(options, defaults) {
  const { db: dbOptions, auth: authOptions, realtime: realtimeOptions, global: globalOptions } = options;
  const { db: DEFAULT_DB_OPTIONS2, auth: DEFAULT_AUTH_OPTIONS2, realtime: DEFAULT_REALTIME_OPTIONS2, global: DEFAULT_GLOBAL_OPTIONS2 } = defaults;
  return {
    db: Object.assign(Object.assign({}, DEFAULT_DB_OPTIONS2), dbOptions),
    auth: Object.assign(Object.assign({}, DEFAULT_AUTH_OPTIONS2), authOptions),
    realtime: Object.assign(Object.assign({}, DEFAULT_REALTIME_OPTIONS2), realtimeOptions),
    global: Object.assign(Object.assign({}, DEFAULT_GLOBAL_OPTIONS2), globalOptions)
  };
}
var __awaiter$4 = globalThis && globalThis.__awaiter || function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
function expiresAt(expiresIn) {
  const timeNow = Math.round(Date.now() / 1e3);
  return timeNow + expiresIn;
}
function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == "x" ? r : r & 3 | 8;
    return v.toString(16);
  });
}
const isBrowser = () => false;
function getParameterByName(name2, url2) {
  var _a;
  if (!url2)
    url2 = ((_a = window === null || window === void 0 ? void 0 : window.location) === null || _a === void 0 ? void 0 : _a.href) || "";
  name2 = name2.replace(/[\[\]]/g, "\\$&");
  const regex = new RegExp("[?&#]" + name2 + "(=([^&#]*)|&|#|$)"), results = regex.exec(url2);
  if (!results)
    return null;
  if (!results[2])
    return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}
const resolveFetch = (customFetch) => {
  let _fetch;
  if (customFetch) {
    _fetch = customFetch;
  } else if (typeof fetch === "undefined") {
    _fetch = (...args) => __awaiter$4(void 0, void 0, void 0, function* () {
      return yield (yield import('unenv/runtime/npm/cross-fetch')).fetch(...args);
    });
  } else {
    _fetch = fetch;
  }
  return (...args) => _fetch(...args);
};
const looksLikeFetchResponse = (maybeResponse) => {
  return typeof maybeResponse === "object" && maybeResponse !== null && "status" in maybeResponse && "ok" in maybeResponse && "json" in maybeResponse && typeof maybeResponse.json === "function";
};
const setItemAsync = (storage, key, data) => __awaiter$4(void 0, void 0, void 0, function* () {
  yield storage.setItem(key, JSON.stringify(data));
});
const getItemAsync = (storage, key) => __awaiter$4(void 0, void 0, void 0, function* () {
  const value = yield storage.getItem(key);
  if (!value) {
    return null;
  }
  try {
    return JSON.parse(value);
  } catch (_a) {
    return value;
  }
});
const removeItemAsync = (storage, key) => __awaiter$4(void 0, void 0, void 0, function* () {
  yield storage.removeItem(key);
});
const decodeBase64URL = (value) => {
  try {
    return decodeURIComponent(atob(value.replace(/[-]/g, "+").replace(/[_]/g, "/")).split("").map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join(""));
  } catch (e) {
    if (e instanceof ReferenceError) {
      return Buffer.from(value, "base64").toString("utf-8");
    } else {
      throw e;
    }
  }
};
class Deferred {
  constructor() {
    this.promise = new Deferred.promiseConstructor((res, rej) => {
      this.resolve = res;
      this.reject = rej;
    });
  }
}
Deferred.promiseConstructor = Promise;
function decodeJWTPayload(token) {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("JWT is not valid: not a JWT structure");
  }
  const base64Url = parts[1];
  return JSON.parse(decodeBase64URL(base64Url));
}
class AuthError extends Error {
  constructor(message) {
    super(message);
    this.__isAuthError = true;
    this.name = "AuthError";
  }
}
function isAuthError(error) {
  return typeof error === "object" && error !== null && "__isAuthError" in error;
}
class AuthApiError extends AuthError {
  constructor(message, status) {
    super(message);
    this.name = "AuthApiError";
    this.status = status;
  }
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status
    };
  }
}
class AuthUnknownError extends AuthError {
  constructor(message, originalError) {
    super(message);
    this.name = "AuthUnknownError";
    this.originalError = originalError;
  }
}
class CustomAuthError extends AuthError {
  constructor(message, name2, status) {
    super(message);
    this.name = name2;
    this.status = status;
  }
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status
    };
  }
}
class AuthSessionMissingError extends CustomAuthError {
  constructor() {
    super("Auth session missing!", "AuthSessionMissingError", 400);
  }
}
class AuthInvalidCredentialsError extends CustomAuthError {
  constructor(message) {
    super(message, "AuthInvalidCredentialsError", 400);
  }
}
class AuthImplicitGrantRedirectError extends CustomAuthError {
  constructor(message, details = null) {
    super(message, "AuthImplicitGrantRedirectError", 500);
    this.details = null;
    this.details = details;
  }
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      details: this.details
    };
  }
}
class AuthRetryableFetchError extends CustomAuthError {
  constructor(message, status) {
    super(message, "AuthRetryableFetchError", status);
  }
}
var __awaiter$3 = globalThis && globalThis.__awaiter || function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var __rest$1 = globalThis && globalThis.__rest || function(s, e) {
  var t = {};
  for (var p in s)
    if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
        t[p[i]] = s[p[i]];
    }
  return t;
};
const _getErrorMessage = (err) => err.msg || err.message || err.error_description || err.error || JSON.stringify(err);
const handleError = (error, reject) => __awaiter$3(void 0, void 0, void 0, function* () {
  const NETWORK_ERROR_CODES = [502, 503, 504];
  if (!looksLikeFetchResponse(error)) {
    reject(new AuthRetryableFetchError(_getErrorMessage(error), 0));
  } else if (NETWORK_ERROR_CODES.includes(error.status)) {
    reject(new AuthRetryableFetchError(_getErrorMessage(error), error.status));
  } else {
    error.json().then((err) => {
      reject(new AuthApiError(_getErrorMessage(err), error.status || 500));
    }).catch((e) => {
      reject(new AuthUnknownError(_getErrorMessage(e), e));
    });
  }
});
const _getRequestParams = (method, options, parameters, body) => {
  const params = { method, headers: (options === null || options === void 0 ? void 0 : options.headers) || {} };
  if (method === "GET") {
    return params;
  }
  params.headers = Object.assign({ "Content-Type": "application/json;charset=UTF-8" }, options === null || options === void 0 ? void 0 : options.headers);
  params.body = JSON.stringify(body);
  return Object.assign(Object.assign({}, params), parameters);
};
function _request(fetcher, method, url2, options) {
  var _a, _b;
  return __awaiter$3(this, void 0, void 0, function* () {
    const headers = (_a = options === null || options === void 0 ? void 0 : options.headers) !== null && _a !== void 0 ? _a : {};
    if (options === null || options === void 0 ? void 0 : options.jwt) {
      headers["Authorization"] = `Bearer ${options.jwt}`;
    }
    const qs = (_b = options === null || options === void 0 ? void 0 : options.query) !== null && _b !== void 0 ? _b : {};
    if (options === null || options === void 0 ? void 0 : options.redirectTo) {
      qs["redirect_to"] = options.redirectTo;
    }
    const queryString = Object.keys(qs).length ? "?" + new URLSearchParams(qs).toString() : "";
    const data = yield _handleRequest(fetcher, method, url2 + queryString, { headers, noResolveJson: options === null || options === void 0 ? void 0 : options.noResolveJson }, {}, options === null || options === void 0 ? void 0 : options.body);
    return (options === null || options === void 0 ? void 0 : options.xform) ? options === null || options === void 0 ? void 0 : options.xform(data) : { data: Object.assign({}, data), error: null };
  });
}
function _handleRequest(fetcher, method, url2, options, parameters, body) {
  return __awaiter$3(this, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
      fetcher(url2, _getRequestParams(method, options, parameters, body)).then((result) => {
        if (!result.ok)
          throw result;
        if (options === null || options === void 0 ? void 0 : options.noResolveJson)
          return result;
        return result.json();
      }).then((data) => resolve(data)).catch((error) => handleError(error, reject));
    });
  });
}
function _sessionResponse(data) {
  var _a;
  let session = null;
  if (hasSession(data)) {
    session = Object.assign({}, data);
    session.expires_at = expiresAt(data.expires_in);
  }
  const user = (_a = data.user) !== null && _a !== void 0 ? _a : data;
  return { data: { session, user }, error: null };
}
function _userResponse(data) {
  var _a;
  const user = (_a = data.user) !== null && _a !== void 0 ? _a : data;
  return { data: { user }, error: null };
}
function _ssoResponse(data) {
  return { data, error: null };
}
function _generateLinkResponse(data) {
  const { action_link, email_otp, hashed_token, redirect_to, verification_type } = data, rest = __rest$1(data, ["action_link", "email_otp", "hashed_token", "redirect_to", "verification_type"]);
  const properties = {
    action_link,
    email_otp,
    hashed_token,
    redirect_to,
    verification_type
  };
  const user = Object.assign({}, rest);
  return {
    data: {
      properties,
      user
    },
    error: null
  };
}
function hasSession(data) {
  return data.access_token && data.refresh_token && data.expires_in;
}
var __awaiter$2 = globalThis && globalThis.__awaiter || function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var __rest = globalThis && globalThis.__rest || function(s, e) {
  var t = {};
  for (var p in s)
    if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
        t[p[i]] = s[p[i]];
    }
  return t;
};
class GoTrueAdminApi {
  constructor({ url: url2 = "", headers = {}, fetch: fetch2 }) {
    this.url = url2;
    this.headers = headers;
    this.fetch = resolveFetch(fetch2);
    this.mfa = {
      listFactors: this._listFactors.bind(this),
      deleteFactor: this._deleteFactor.bind(this)
    };
  }
  signOut(jwt) {
    return __awaiter$2(this, void 0, void 0, function* () {
      try {
        yield _request(this.fetch, "POST", `${this.url}/logout`, {
          headers: this.headers,
          jwt,
          noResolveJson: true
        });
        return { data: null, error: null };
      } catch (error) {
        if (isAuthError(error)) {
          return { data: null, error };
        }
        throw error;
      }
    });
  }
  inviteUserByEmail(email, options = {}) {
    return __awaiter$2(this, void 0, void 0, function* () {
      try {
        return yield _request(this.fetch, "POST", `${this.url}/invite`, {
          body: { email, data: options.data },
          headers: this.headers,
          redirectTo: options.redirectTo,
          xform: _userResponse
        });
      } catch (error) {
        if (isAuthError(error)) {
          return { data: { user: null }, error };
        }
        throw error;
      }
    });
  }
  generateLink(params) {
    return __awaiter$2(this, void 0, void 0, function* () {
      try {
        const { options } = params, rest = __rest(params, ["options"]);
        const body = Object.assign(Object.assign({}, rest), options);
        if ("newEmail" in rest) {
          body.new_email = rest === null || rest === void 0 ? void 0 : rest.newEmail;
          delete body["newEmail"];
        }
        return yield _request(this.fetch, "POST", `${this.url}/admin/generate_link`, {
          body,
          headers: this.headers,
          xform: _generateLinkResponse,
          redirectTo: options === null || options === void 0 ? void 0 : options.redirectTo
        });
      } catch (error) {
        if (isAuthError(error)) {
          return {
            data: {
              properties: null,
              user: null
            },
            error
          };
        }
        throw error;
      }
    });
  }
  createUser(attributes) {
    return __awaiter$2(this, void 0, void 0, function* () {
      try {
        return yield _request(this.fetch, "POST", `${this.url}/admin/users`, {
          body: attributes,
          headers: this.headers,
          xform: _userResponse
        });
      } catch (error) {
        if (isAuthError(error)) {
          return { data: { user: null }, error };
        }
        throw error;
      }
    });
  }
  listUsers() {
    return __awaiter$2(this, void 0, void 0, function* () {
      try {
        const { data, error } = yield _request(this.fetch, "GET", `${this.url}/admin/users`, {
          headers: this.headers
        });
        if (error)
          throw error;
        return { data: Object.assign({}, data), error: null };
      } catch (error) {
        if (isAuthError(error)) {
          return { data: { users: [] }, error };
        }
        throw error;
      }
    });
  }
  getUserById(uid) {
    return __awaiter$2(this, void 0, void 0, function* () {
      try {
        return yield _request(this.fetch, "GET", `${this.url}/admin/users/${uid}`, {
          headers: this.headers,
          xform: _userResponse
        });
      } catch (error) {
        if (isAuthError(error)) {
          return { data: { user: null }, error };
        }
        throw error;
      }
    });
  }
  updateUserById(uid, attributes) {
    return __awaiter$2(this, void 0, void 0, function* () {
      try {
        return yield _request(this.fetch, "PUT", `${this.url}/admin/users/${uid}`, {
          body: attributes,
          headers: this.headers,
          xform: _userResponse
        });
      } catch (error) {
        if (isAuthError(error)) {
          return { data: { user: null }, error };
        }
        throw error;
      }
    });
  }
  deleteUser(id) {
    return __awaiter$2(this, void 0, void 0, function* () {
      try {
        return yield _request(this.fetch, "DELETE", `${this.url}/admin/users/${id}`, {
          headers: this.headers,
          xform: _userResponse
        });
      } catch (error) {
        if (isAuthError(error)) {
          return { data: { user: null }, error };
        }
        throw error;
      }
    });
  }
  _listFactors(params) {
    return __awaiter$2(this, void 0, void 0, function* () {
      try {
        const data = yield _request(this.fetch, "GET", `${this.url}/admin/users/${params.userId}/factors`, {
          headers: this.headers
        });
        return { data, error: null };
      } catch (error) {
        if (isAuthError(error)) {
          return { data: null, error };
        }
        throw error;
      }
    });
  }
  _deleteFactor(params) {
    return __awaiter$2(this, void 0, void 0, function* () {
      try {
        const data = yield _request(this.fetch, "DELETE", `${this.url}/admin/users/${params.userId}/factors/${params.id}`, {
          headers: this.headers
        });
        return { data, error: null };
      } catch (error) {
        if (isAuthError(error)) {
          return { data: null, error };
        }
        throw error;
      }
    });
  }
}
const version = "2.3.0";
const GOTRUE_URL = "http://localhost:9999";
const STORAGE_KEY = "supabase.auth.token";
const DEFAULT_HEADERS = { "X-Client-Info": `gotrue-js/${version}` };
const EXPIRY_MARGIN = 10;
const NETWORK_FAILURE = {
  MAX_RETRIES: 10,
  RETRY_INTERVAL: 2
};
const localStorageAdapter = {
  getItem: (key) => {
    {
      return null;
    }
  },
  setItem: (key, value) => {
    {
      return;
    }
  },
  removeItem: (key) => {
    {
      return;
    }
  }
};
function polyfillGlobalThis() {
  if (typeof globalThis === "object")
    return;
  try {
    Object.defineProperty(Object.prototype, "__magic__", {
      get: function() {
        return this;
      },
      configurable: true
    });
    __magic__.globalThis = __magic__;
    delete Object.prototype.__magic__;
  } catch (e) {
    if (typeof self !== "undefined") {
      self.globalThis = self;
    }
  }
}
var __awaiter$1 = globalThis && globalThis.__awaiter || function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
polyfillGlobalThis();
const DEFAULT_OPTIONS = {
  url: GOTRUE_URL,
  storageKey: STORAGE_KEY,
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: true,
  headers: DEFAULT_HEADERS
};
class GoTrueClient {
  constructor(options) {
    this.stateChangeEmitters = /* @__PURE__ */ new Map();
    this.networkRetries = 0;
    this.refreshingDeferred = null;
    this.initializePromise = null;
    this.detectSessionInUrl = true;
    const settings = Object.assign(Object.assign({}, DEFAULT_OPTIONS), options);
    this.inMemorySession = null;
    this.storageKey = settings.storageKey;
    this.autoRefreshToken = settings.autoRefreshToken;
    this.persistSession = settings.persistSession;
    this.storage = settings.storage || localStorageAdapter;
    this.admin = new GoTrueAdminApi({
      url: settings.url,
      headers: settings.headers,
      fetch: settings.fetch
    });
    this.url = settings.url;
    this.headers = settings.headers;
    this.fetch = resolveFetch(settings.fetch);
    this.detectSessionInUrl = settings.detectSessionInUrl;
    this.initialize();
    this.mfa = {
      verify: this._verify.bind(this),
      enroll: this._enroll.bind(this),
      unenroll: this._unenroll.bind(this),
      challenge: this._challenge.bind(this),
      listFactors: this._listFactors.bind(this),
      challengeAndVerify: this._challengeAndVerify.bind(this),
      getAuthenticatorAssuranceLevel: this._getAuthenticatorAssuranceLevel.bind(this)
    };
  }
  initialize() {
    if (!this.initializePromise) {
      this.initializePromise = this._initialize();
    }
    return this.initializePromise;
  }
  _initialize() {
    return __awaiter$1(this, void 0, void 0, function* () {
      if (this.initializePromise) {
        return this.initializePromise;
      }
      try {
        if (this.detectSessionInUrl && this._isImplicitGrantFlow()) {
          const { data, error } = yield this._getSessionFromUrl();
          if (error) {
            yield this._removeSession();
            return { error };
          }
          const { session, redirectType } = data;
          yield this._saveSession(session);
          this._notifyAllSubscribers("SIGNED_IN", session);
          if (redirectType === "recovery") {
            this._notifyAllSubscribers("PASSWORD_RECOVERY", session);
          }
          return { error: null };
        }
        yield this._recoverAndRefresh();
        return { error: null };
      } catch (error) {
        if (isAuthError(error)) {
          return { error };
        }
        return {
          error: new AuthUnknownError("Unexpected error during initialization", error)
        };
      } finally {
        this._handleVisibilityChange();
      }
    });
  }
  signUp(credentials) {
    var _a, _b;
    return __awaiter$1(this, void 0, void 0, function* () {
      try {
        yield this._removeSession();
        let res;
        if ("email" in credentials) {
          const { email, password, options } = credentials;
          res = yield _request(this.fetch, "POST", `${this.url}/signup`, {
            headers: this.headers,
            redirectTo: options === null || options === void 0 ? void 0 : options.emailRedirectTo,
            body: {
              email,
              password,
              data: (_a = options === null || options === void 0 ? void 0 : options.data) !== null && _a !== void 0 ? _a : {},
              gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken }
            },
            xform: _sessionResponse
          });
        } else if ("phone" in credentials) {
          const { phone, password, options } = credentials;
          res = yield _request(this.fetch, "POST", `${this.url}/signup`, {
            headers: this.headers,
            body: {
              phone,
              password,
              data: (_b = options === null || options === void 0 ? void 0 : options.data) !== null && _b !== void 0 ? _b : {},
              gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken }
            },
            xform: _sessionResponse
          });
        } else {
          throw new AuthInvalidCredentialsError("You must provide either an email or phone number and a password");
        }
        const { data, error } = res;
        if (error || !data) {
          return { data: { user: null, session: null }, error };
        }
        const session = data.session;
        const user = data.user;
        if (data.session) {
          yield this._saveSession(data.session);
          this._notifyAllSubscribers("SIGNED_IN", session);
        }
        return { data: { user, session }, error: null };
      } catch (error) {
        if (isAuthError(error)) {
          return { data: { user: null, session: null }, error };
        }
        throw error;
      }
    });
  }
  signInWithPassword(credentials) {
    var _a, _b;
    return __awaiter$1(this, void 0, void 0, function* () {
      try {
        yield this._removeSession();
        let res;
        if ("email" in credentials) {
          const { email, password, options } = credentials;
          res = yield _request(this.fetch, "POST", `${this.url}/token?grant_type=password`, {
            headers: this.headers,
            body: {
              email,
              password,
              data: (_a = options === null || options === void 0 ? void 0 : options.data) !== null && _a !== void 0 ? _a : {},
              gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken }
            },
            xform: _sessionResponse
          });
        } else if ("phone" in credentials) {
          const { phone, password, options } = credentials;
          res = yield _request(this.fetch, "POST", `${this.url}/token?grant_type=password`, {
            headers: this.headers,
            body: {
              phone,
              password,
              data: (_b = options === null || options === void 0 ? void 0 : options.data) !== null && _b !== void 0 ? _b : {},
              gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken }
            },
            xform: _sessionResponse
          });
        } else {
          throw new AuthInvalidCredentialsError("You must provide either an email or phone number and a password");
        }
        const { data, error } = res;
        if (error || !data)
          return { data: { user: null, session: null }, error };
        if (data.session) {
          yield this._saveSession(data.session);
          this._notifyAllSubscribers("SIGNED_IN", data.session);
        }
        return { data, error };
      } catch (error) {
        if (isAuthError(error)) {
          return { data: { user: null, session: null }, error };
        }
        throw error;
      }
    });
  }
  signInWithOAuth(credentials) {
    var _a, _b, _c;
    return __awaiter$1(this, void 0, void 0, function* () {
      yield this._removeSession();
      return this._handleProviderSignIn(credentials.provider, {
        redirectTo: (_a = credentials.options) === null || _a === void 0 ? void 0 : _a.redirectTo,
        scopes: (_b = credentials.options) === null || _b === void 0 ? void 0 : _b.scopes,
        queryParams: (_c = credentials.options) === null || _c === void 0 ? void 0 : _c.queryParams
      });
    });
  }
  signInWithOtp(credentials) {
    var _a, _b, _c, _d;
    return __awaiter$1(this, void 0, void 0, function* () {
      try {
        yield this._removeSession();
        if ("email" in credentials) {
          const { email, options } = credentials;
          const { error } = yield _request(this.fetch, "POST", `${this.url}/otp`, {
            headers: this.headers,
            body: {
              email,
              data: (_a = options === null || options === void 0 ? void 0 : options.data) !== null && _a !== void 0 ? _a : {},
              create_user: (_b = options === null || options === void 0 ? void 0 : options.shouldCreateUser) !== null && _b !== void 0 ? _b : true,
              gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken }
            },
            redirectTo: options === null || options === void 0 ? void 0 : options.emailRedirectTo
          });
          return { data: { user: null, session: null }, error };
        }
        if ("phone" in credentials) {
          const { phone, options } = credentials;
          const { error } = yield _request(this.fetch, "POST", `${this.url}/otp`, {
            headers: this.headers,
            body: {
              phone,
              data: (_c = options === null || options === void 0 ? void 0 : options.data) !== null && _c !== void 0 ? _c : {},
              create_user: (_d = options === null || options === void 0 ? void 0 : options.shouldCreateUser) !== null && _d !== void 0 ? _d : true,
              gotrue_meta_security: { captcha_token: options === null || options === void 0 ? void 0 : options.captchaToken }
            }
          });
          return { data: { user: null, session: null }, error };
        }
        throw new AuthInvalidCredentialsError("You must provide either an email or phone number.");
      } catch (error) {
        if (isAuthError(error)) {
          return { data: { user: null, session: null }, error };
        }
        throw error;
      }
    });
  }
  verifyOtp(params) {
    var _a, _b;
    return __awaiter$1(this, void 0, void 0, function* () {
      try {
        yield this._removeSession();
        const { data, error } = yield _request(this.fetch, "POST", `${this.url}/verify`, {
          headers: this.headers,
          body: Object.assign(Object.assign({}, params), { gotrue_meta_security: { captcha_token: (_a = params.options) === null || _a === void 0 ? void 0 : _a.captchaToken } }),
          redirectTo: (_b = params.options) === null || _b === void 0 ? void 0 : _b.redirectTo,
          xform: _sessionResponse
        });
        if (error) {
          throw error;
        }
        if (!data) {
          throw "An error occurred on token verification.";
        }
        const session = data.session;
        const user = data.user;
        if (session === null || session === void 0 ? void 0 : session.access_token) {
          yield this._saveSession(session);
          this._notifyAllSubscribers("SIGNED_IN", session);
        }
        return { data: { user, session }, error: null };
      } catch (error) {
        if (isAuthError(error)) {
          return { data: { user: null, session: null }, error };
        }
        throw error;
      }
    });
  }
  signInWithSSO(params) {
    var _a, _b, _c;
    return __awaiter$1(this, void 0, void 0, function* () {
      try {
        yield this._removeSession();
        return yield _request(this.fetch, "POST", `${this.url}/sso`, {
          body: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, "providerId" in params ? { provider_id: params.providerId } : null), "domain" in params ? { domain: params.domain } : null), { redirect_to: (_b = (_a = params.options) === null || _a === void 0 ? void 0 : _a.redirectTo) !== null && _b !== void 0 ? _b : void 0 }), ((_c = params === null || params === void 0 ? void 0 : params.options) === null || _c === void 0 ? void 0 : _c.captchaToken) ? { gotrue_meta_security: { captcha_token: params.options.captchaToken } } : null), { skip_http_redirect: true }),
          headers: this.headers,
          xform: _ssoResponse
        });
      } catch (error) {
        if (isAuthError(error)) {
          return { data: null, error };
        }
        throw error;
      }
    });
  }
  getSession() {
    return __awaiter$1(this, void 0, void 0, function* () {
      yield this.initializePromise;
      let currentSession = null;
      if (this.persistSession) {
        const maybeSession = yield getItemAsync(this.storage, this.storageKey);
        if (maybeSession !== null) {
          if (this._isValidSession(maybeSession)) {
            currentSession = maybeSession;
          } else {
            yield this._removeSession();
          }
        }
      } else {
        currentSession = this.inMemorySession;
      }
      if (!currentSession) {
        return { data: { session: null }, error: null };
      }
      const hasExpired = currentSession.expires_at ? currentSession.expires_at <= Date.now() / 1e3 : false;
      if (!hasExpired) {
        return { data: { session: currentSession }, error: null };
      }
      const { session, error } = yield this._callRefreshToken(currentSession.refresh_token);
      if (error) {
        return { data: { session: null }, error };
      }
      return { data: { session }, error: null };
    });
  }
  getUser(jwt) {
    var _a, _b;
    return __awaiter$1(this, void 0, void 0, function* () {
      try {
        if (!jwt) {
          const { data, error } = yield this.getSession();
          if (error) {
            throw error;
          }
          jwt = (_b = (_a = data.session) === null || _a === void 0 ? void 0 : _a.access_token) !== null && _b !== void 0 ? _b : void 0;
        }
        return yield _request(this.fetch, "GET", `${this.url}/user`, {
          headers: this.headers,
          jwt,
          xform: _userResponse
        });
      } catch (error) {
        if (isAuthError(error)) {
          return { data: { user: null }, error };
        }
        throw error;
      }
    });
  }
  updateUser(attributes) {
    return __awaiter$1(this, void 0, void 0, function* () {
      try {
        const { data: sessionData, error: sessionError } = yield this.getSession();
        if (sessionError) {
          throw sessionError;
        }
        if (!sessionData.session) {
          throw new AuthSessionMissingError();
        }
        const session = sessionData.session;
        const { data, error: userError } = yield _request(this.fetch, "PUT", `${this.url}/user`, {
          headers: this.headers,
          body: attributes,
          jwt: session.access_token,
          xform: _userResponse
        });
        if (userError)
          throw userError;
        session.user = data.user;
        yield this._saveSession(session);
        this._notifyAllSubscribers("USER_UPDATED", session);
        return { data: { user: session.user }, error: null };
      } catch (error) {
        if (isAuthError(error)) {
          return { data: { user: null }, error };
        }
        throw error;
      }
    });
  }
  _decodeJWT(jwt) {
    return decodeJWTPayload(jwt);
  }
  setSession(currentSession) {
    return __awaiter$1(this, void 0, void 0, function* () {
      try {
        const timeNow = Date.now() / 1e3;
        let expiresAt2 = timeNow;
        let hasExpired = true;
        let session = null;
        if (currentSession.access_token && currentSession.access_token.split(".")[1]) {
          const payload = this._decodeJWT(currentSession.access_token);
          if (payload.exp) {
            expiresAt2 = payload.exp;
            hasExpired = expiresAt2 <= timeNow;
          }
        }
        if (hasExpired) {
          if (!currentSession.refresh_token) {
            throw new AuthSessionMissingError();
          }
          const { data, error } = yield this._refreshAccessToken(currentSession.refresh_token);
          if (error) {
            return { data: { session: null, user: null }, error };
          }
          if (!data.session) {
            return { data: { session: null, user: null }, error: null };
          }
          session = data.session;
        } else {
          const { data, error } = yield this.getUser(currentSession.access_token);
          if (error) {
            throw error;
          }
          session = {
            access_token: currentSession.access_token,
            refresh_token: currentSession.refresh_token,
            user: data.user,
            token_type: "bearer",
            expires_in: expiresAt2 - timeNow,
            expires_at: expiresAt2
          };
        }
        yield this._saveSession(session);
        this._notifyAllSubscribers("TOKEN_REFRESHED", session);
        return { data: { session, user: session.user }, error: null };
      } catch (error) {
        if (isAuthError(error)) {
          return { data: { session: null, user: null }, error };
        }
        throw error;
      }
    });
  }
  refreshSession(currentSession) {
    var _a;
    return __awaiter$1(this, void 0, void 0, function* () {
      try {
        if (!currentSession) {
          const { data, error: error2 } = yield this.getSession();
          if (error2) {
            throw error2;
          }
          currentSession = (_a = data.session) !== null && _a !== void 0 ? _a : void 0;
        }
        if (!(currentSession === null || currentSession === void 0 ? void 0 : currentSession.refresh_token)) {
          throw new AuthSessionMissingError();
        }
        const { session, error } = yield this._callRefreshToken(currentSession.refresh_token);
        if (error) {
          return { data: { user: null, session: null }, error };
        }
        if (!session) {
          return { data: { user: null, session: null }, error: null };
        }
        return { data: { user: session.user, session }, error: null };
      } catch (error) {
        if (isAuthError(error)) {
          return { data: { user: null, session: null }, error };
        }
        throw error;
      }
    });
  }
  _getSessionFromUrl() {
    return __awaiter$1(this, void 0, void 0, function* () {
      try {
        if (!isBrowser())
          throw new AuthImplicitGrantRedirectError("No browser detected.");
        if (!this._isImplicitGrantFlow()) {
          throw new AuthImplicitGrantRedirectError("Not a valid implicit grant flow url.");
        }
        const error_description = getParameterByName("error_description");
        if (error_description) {
          const error_code = getParameterByName("error_code");
          if (!error_code)
            throw new AuthImplicitGrantRedirectError("No error_code detected.");
          const error2 = getParameterByName("error");
          if (!error2)
            throw new AuthImplicitGrantRedirectError("No error detected.");
          throw new AuthImplicitGrantRedirectError(error_description, { error: error2, code: error_code });
        }
        const provider_token = getParameterByName("provider_token");
        const provider_refresh_token = getParameterByName("provider_refresh_token");
        const access_token = getParameterByName("access_token");
        if (!access_token)
          throw new AuthImplicitGrantRedirectError("No access_token detected.");
        const expires_in = getParameterByName("expires_in");
        if (!expires_in)
          throw new AuthImplicitGrantRedirectError("No expires_in detected.");
        const refresh_token = getParameterByName("refresh_token");
        if (!refresh_token)
          throw new AuthImplicitGrantRedirectError("No refresh_token detected.");
        const token_type = getParameterByName("token_type");
        if (!token_type)
          throw new AuthImplicitGrantRedirectError("No token_type detected.");
        const timeNow = Math.round(Date.now() / 1e3);
        const expires_at = timeNow + parseInt(expires_in);
        const { data, error } = yield this.getUser(access_token);
        if (error)
          throw error;
        const user = data.user;
        const session = {
          provider_token,
          provider_refresh_token,
          access_token,
          expires_in: parseInt(expires_in),
          expires_at,
          refresh_token,
          token_type,
          user
        };
        const redirectType = getParameterByName("type");
        window.location.hash = "";
        return { data: { session, redirectType }, error: null };
      } catch (error) {
        if (isAuthError(error)) {
          return { data: { session: null, redirectType: null }, error };
        }
        throw error;
      }
    });
  }
  _isImplicitGrantFlow() {
    return isBrowser();
  }
  signOut() {
    var _a;
    return __awaiter$1(this, void 0, void 0, function* () {
      const { data, error: sessionError } = yield this.getSession();
      if (sessionError) {
        return { error: sessionError };
      }
      const accessToken = (_a = data.session) === null || _a === void 0 ? void 0 : _a.access_token;
      if (accessToken) {
        const { error } = yield this.admin.signOut(accessToken);
        if (error)
          return { error };
      }
      yield this._removeSession();
      this._notifyAllSubscribers("SIGNED_OUT", null);
      return { error: null };
    });
  }
  onAuthStateChange(callback) {
    const id = uuid();
    const subscription = {
      id,
      callback,
      unsubscribe: () => {
        this.stateChangeEmitters.delete(id);
      }
    };
    this.stateChangeEmitters.set(id, subscription);
    return { data: { subscription } };
  }
  resetPasswordForEmail(email, options = {}) {
    return __awaiter$1(this, void 0, void 0, function* () {
      try {
        return yield _request(this.fetch, "POST", `${this.url}/recover`, {
          body: { email, gotrue_meta_security: { captcha_token: options.captchaToken } },
          headers: this.headers,
          redirectTo: options.redirectTo
        });
      } catch (error) {
        if (isAuthError(error)) {
          return { data: null, error };
        }
        throw error;
      }
    });
  }
  _refreshAccessToken(refreshToken) {
    return __awaiter$1(this, void 0, void 0, function* () {
      try {
        return yield _request(this.fetch, "POST", `${this.url}/token?grant_type=refresh_token`, {
          body: { refresh_token: refreshToken },
          headers: this.headers,
          xform: _sessionResponse
        });
      } catch (error) {
        if (isAuthError(error)) {
          return { data: { session: null, user: null }, error };
        }
        throw error;
      }
    });
  }
  _isValidSession(maybeSession) {
    const isValidSession = typeof maybeSession === "object" && maybeSession !== null && "access_token" in maybeSession && "refresh_token" in maybeSession && "expires_at" in maybeSession;
    return isValidSession;
  }
  _handleProviderSignIn(provider, options = {}) {
    const url2 = this._getUrlForProvider(provider, {
      redirectTo: options.redirectTo,
      scopes: options.scopes,
      queryParams: options.queryParams
    });
    return { data: { provider, url: url2 }, error: null };
  }
  _recoverAndRefresh() {
    var _a;
    return __awaiter$1(this, void 0, void 0, function* () {
      try {
        const currentSession = yield getItemAsync(this.storage, this.storageKey);
        if (!this._isValidSession(currentSession)) {
          if (currentSession !== null) {
            yield this._removeSession();
          }
          return;
        }
        const timeNow = Math.round(Date.now() / 1e3);
        if (((_a = currentSession.expires_at) !== null && _a !== void 0 ? _a : Infinity) < timeNow + EXPIRY_MARGIN) {
          if (this.autoRefreshToken && currentSession.refresh_token) {
            this.networkRetries++;
            const { error } = yield this._callRefreshToken(currentSession.refresh_token);
            if (error) {
              console.log(error.message);
              if (error instanceof AuthRetryableFetchError && this.networkRetries < NETWORK_FAILURE.MAX_RETRIES) {
                if (this.refreshTokenTimer)
                  clearTimeout(this.refreshTokenTimer);
                this.refreshTokenTimer = setTimeout(
                  () => this._recoverAndRefresh(),
                  Math.pow(NETWORK_FAILURE.RETRY_INTERVAL, this.networkRetries) * 100
                );
                return;
              }
              yield this._removeSession();
            }
            this.networkRetries = 0;
          } else {
            yield this._removeSession();
          }
        } else {
          if (this.persistSession) {
            yield this._saveSession(currentSession);
          }
          this._notifyAllSubscribers("SIGNED_IN", currentSession);
        }
      } catch (err) {
        console.error(err);
        return;
      }
    });
  }
  _callRefreshToken(refreshToken) {
    var _a, _b;
    return __awaiter$1(this, void 0, void 0, function* () {
      if (this.refreshingDeferred) {
        return this.refreshingDeferred.promise;
      }
      try {
        this.refreshingDeferred = new Deferred();
        if (!refreshToken) {
          throw new AuthSessionMissingError();
        }
        const { data, error } = yield this._refreshAccessToken(refreshToken);
        if (error)
          throw error;
        if (!data.session)
          throw new AuthSessionMissingError();
        yield this._saveSession(data.session);
        this._notifyAllSubscribers("TOKEN_REFRESHED", data.session);
        const result = { session: data.session, error: null };
        this.refreshingDeferred.resolve(result);
        return result;
      } catch (error) {
        if (isAuthError(error)) {
          const result = { session: null, error };
          (_a = this.refreshingDeferred) === null || _a === void 0 ? void 0 : _a.resolve(result);
          return result;
        }
        (_b = this.refreshingDeferred) === null || _b === void 0 ? void 0 : _b.reject(error);
        throw error;
      } finally {
        this.refreshingDeferred = null;
      }
    });
  }
  _notifyAllSubscribers(event, session) {
    this.stateChangeEmitters.forEach((x) => x.callback(event, session));
  }
  _saveSession(session) {
    return __awaiter$1(this, void 0, void 0, function* () {
      if (!this.persistSession) {
        this.inMemorySession = session;
      }
      const expiresAt2 = session.expires_at;
      if (expiresAt2) {
        const timeNow = Math.round(Date.now() / 1e3);
        const expiresIn = expiresAt2 - timeNow;
        const refreshDurationBeforeExpires = expiresIn > EXPIRY_MARGIN ? EXPIRY_MARGIN : 0.5;
        this._startAutoRefreshToken((expiresIn - refreshDurationBeforeExpires) * 1e3);
      }
      if (this.persistSession && session.expires_at) {
        yield this._persistSession(session);
      }
    });
  }
  _persistSession(currentSession) {
    return setItemAsync(this.storage, this.storageKey, currentSession);
  }
  _removeSession() {
    return __awaiter$1(this, void 0, void 0, function* () {
      if (this.persistSession) {
        yield removeItemAsync(this.storage, this.storageKey);
      } else {
        this.inMemorySession = null;
      }
      if (this.refreshTokenTimer) {
        clearTimeout(this.refreshTokenTimer);
      }
    });
  }
  _startAutoRefreshToken(value) {
    if (this.refreshTokenTimer)
      clearTimeout(this.refreshTokenTimer);
    if (value <= 0 || !this.autoRefreshToken)
      return;
    this.refreshTokenTimer = setTimeout(() => __awaiter$1(this, void 0, void 0, function* () {
      this.networkRetries++;
      const { data: { session }, error: sessionError } = yield this.getSession();
      if (!sessionError && session) {
        const { error } = yield this._callRefreshToken(session.refresh_token);
        if (!error)
          this.networkRetries = 0;
        if (error instanceof AuthRetryableFetchError && this.networkRetries < NETWORK_FAILURE.MAX_RETRIES)
          this._startAutoRefreshToken(Math.pow(NETWORK_FAILURE.RETRY_INTERVAL, this.networkRetries) * 100);
      }
    }), value);
    if (typeof this.refreshTokenTimer.unref === "function")
      this.refreshTokenTimer.unref();
  }
  _handleVisibilityChange() {
    {
      return false;
    }
  }
  _getUrlForProvider(provider, options) {
    const urlParams = [`provider=${encodeURIComponent(provider)}`];
    if (options === null || options === void 0 ? void 0 : options.redirectTo) {
      urlParams.push(`redirect_to=${encodeURIComponent(options.redirectTo)}`);
    }
    if (options === null || options === void 0 ? void 0 : options.scopes) {
      urlParams.push(`scopes=${encodeURIComponent(options.scopes)}`);
    }
    if (options === null || options === void 0 ? void 0 : options.queryParams) {
      const query = new URLSearchParams(options.queryParams);
      urlParams.push(query.toString());
    }
    return `${this.url}/authorize?${urlParams.join("&")}`;
  }
  _unenroll(params) {
    var _a;
    return __awaiter$1(this, void 0, void 0, function* () {
      const { data: sessionData, error: sessionError } = yield this.getSession();
      if (sessionError) {
        return { data: null, error: sessionError };
      }
      return yield _request(this.fetch, "DELETE", `${this.url}/factors/${params.factorId}`, {
        headers: this.headers,
        jwt: (_a = sessionData === null || sessionData === void 0 ? void 0 : sessionData.session) === null || _a === void 0 ? void 0 : _a.access_token
      });
    });
  }
  _enroll(params) {
    var _a, _b;
    return __awaiter$1(this, void 0, void 0, function* () {
      const { data: sessionData, error: sessionError } = yield this.getSession();
      if (sessionError) {
        return { data: null, error: sessionError };
      }
      const { data, error } = yield _request(this.fetch, "POST", `${this.url}/factors`, {
        body: {
          friendly_name: params.friendlyName,
          factor_type: params.factorType,
          issuer: params.issuer
        },
        headers: this.headers,
        jwt: (_a = sessionData === null || sessionData === void 0 ? void 0 : sessionData.session) === null || _a === void 0 ? void 0 : _a.access_token
      });
      if (error) {
        return { data: null, error };
      }
      if ((_b = data === null || data === void 0 ? void 0 : data.totp) === null || _b === void 0 ? void 0 : _b.qr_code) {
        data.totp.qr_code = `data:image/svg+xml;utf-8,${data.totp.qr_code}`;
      }
      return { data, error: null };
    });
  }
  _verify(params) {
    var _a;
    return __awaiter$1(this, void 0, void 0, function* () {
      const { data: sessionData, error: sessionError } = yield this.getSession();
      if (sessionError) {
        return { data: null, error: sessionError };
      }
      const { data, error } = yield _request(this.fetch, "POST", `${this.url}/factors/${params.factorId}/verify`, {
        body: { code: params.code, challenge_id: params.challengeId },
        headers: this.headers,
        jwt: (_a = sessionData === null || sessionData === void 0 ? void 0 : sessionData.session) === null || _a === void 0 ? void 0 : _a.access_token
      });
      if (error) {
        return { data: null, error };
      }
      yield this._saveSession(Object.assign({ expires_at: Math.round(Date.now() / 1e3) + data.expires_in }, data));
      this._notifyAllSubscribers("MFA_CHALLENGE_VERIFIED", data);
      return { data, error };
    });
  }
  _challenge(params) {
    var _a;
    return __awaiter$1(this, void 0, void 0, function* () {
      const { data: sessionData, error: sessionError } = yield this.getSession();
      if (sessionError) {
        return { data: null, error: sessionError };
      }
      return yield _request(this.fetch, "POST", `${this.url}/factors/${params.factorId}/challenge`, {
        headers: this.headers,
        jwt: (_a = sessionData === null || sessionData === void 0 ? void 0 : sessionData.session) === null || _a === void 0 ? void 0 : _a.access_token
      });
    });
  }
  _challengeAndVerify(params) {
    return __awaiter$1(this, void 0, void 0, function* () {
      const { data: challengeData, error: challengeError } = yield this._challenge({
        factorId: params.factorId
      });
      if (challengeError) {
        return { data: null, error: challengeError };
      }
      return yield this._verify({
        factorId: params.factorId,
        challengeId: challengeData.id,
        code: params.code
      });
    });
  }
  _listFactors() {
    return __awaiter$1(this, void 0, void 0, function* () {
      const { data: { user }, error: userError } = yield this.getUser();
      if (userError) {
        return { data: null, error: userError };
      }
      const factors = (user === null || user === void 0 ? void 0 : user.factors) || [];
      const totp = factors.filter((factor) => factor.factor_type === "totp" && factor.status === "verified");
      return {
        data: {
          all: factors,
          totp
        },
        error: null
      };
    });
  }
  _getAuthenticatorAssuranceLevel() {
    var _a, _b;
    return __awaiter$1(this, void 0, void 0, function* () {
      const { data: { session }, error: sessionError } = yield this.getSession();
      if (sessionError) {
        return { data: null, error: sessionError };
      }
      if (!session) {
        return {
          data: { currentLevel: null, nextLevel: null, currentAuthenticationMethods: [] },
          error: null
        };
      }
      const payload = this._decodeJWT(session.access_token);
      let currentLevel = null;
      if (payload.aal) {
        currentLevel = payload.aal;
      }
      let nextLevel = currentLevel;
      const verifiedFactors = (_b = (_a = session.user.factors) === null || _a === void 0 ? void 0 : _a.filter((factor) => factor.status === "verified")) !== null && _b !== void 0 ? _b : [];
      if (verifiedFactors.length > 0) {
        nextLevel = "aal2";
      }
      const currentAuthenticationMethods = payload.amr || [];
      return { data: { currentLevel, nextLevel, currentAuthenticationMethods }, error: null };
    });
  }
}
class SupabaseAuthClient extends GoTrueClient {
  constructor(options) {
    super(options);
  }
}
var __awaiter = globalThis && globalThis.__awaiter || function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
const DEFAULT_GLOBAL_OPTIONS = {
  headers: DEFAULT_HEADERS$1
};
const DEFAULT_DB_OPTIONS = {
  schema: "public"
};
const DEFAULT_AUTH_OPTIONS = {
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: true
};
const DEFAULT_REALTIME_OPTIONS = {};
class SupabaseClient {
  constructor(supabaseUrl, supabaseKey, options) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    this.supabaseUrl = supabaseUrl;
    this.supabaseKey = supabaseKey;
    if (!supabaseUrl)
      throw new Error("supabaseUrl is required.");
    if (!supabaseKey)
      throw new Error("supabaseKey is required.");
    const _supabaseUrl = stripTrailingSlash(supabaseUrl);
    this.realtimeUrl = `${_supabaseUrl}/realtime/v1`.replace(/^http/i, "ws");
    this.authUrl = `${_supabaseUrl}/auth/v1`;
    this.storageUrl = `${_supabaseUrl}/storage/v1`;
    const isPlatform = _supabaseUrl.match(/(supabase\.co)|(supabase\.in)/);
    if (isPlatform) {
      const urlParts = _supabaseUrl.split(".");
      this.functionsUrl = `${urlParts[0]}.functions.${urlParts[1]}.${urlParts[2]}`;
    } else {
      this.functionsUrl = `${_supabaseUrl}/functions/v1`;
    }
    const defaultStorageKey = `sb-${new URL(this.authUrl).hostname.split(".")[0]}-auth-token`;
    const DEFAULTS = {
      db: DEFAULT_DB_OPTIONS,
      realtime: DEFAULT_REALTIME_OPTIONS,
      auth: Object.assign(Object.assign({}, DEFAULT_AUTH_OPTIONS), { storageKey: defaultStorageKey }),
      global: DEFAULT_GLOBAL_OPTIONS
    };
    const settings = applySettingDefaults(options !== null && options !== void 0 ? options : {}, DEFAULTS);
    this.storageKey = (_b = (_a = settings.auth) === null || _a === void 0 ? void 0 : _a.storageKey) !== null && _b !== void 0 ? _b : "";
    this.headers = (_d = (_c = settings.global) === null || _c === void 0 ? void 0 : _c.headers) !== null && _d !== void 0 ? _d : {};
    this.auth = this._initSupabaseAuthClient((_e = settings.auth) !== null && _e !== void 0 ? _e : {}, this.headers, (_f = settings.global) === null || _f === void 0 ? void 0 : _f.fetch);
    this.fetch = fetchWithAuth(supabaseKey, this._getAccessToken.bind(this), (_g = settings.global) === null || _g === void 0 ? void 0 : _g.fetch);
    this.realtime = this._initRealtimeClient(Object.assign({ headers: this.headers }, settings.realtime));
    this.rest = new PostgrestClient(`${_supabaseUrl}/rest/v1`, {
      headers: this.headers,
      schema: (_h = settings.db) === null || _h === void 0 ? void 0 : _h.schema,
      fetch: this.fetch
    });
    this._listenForAuthEvents();
  }
  get functions() {
    return new FunctionsClient(this.functionsUrl, {
      headers: this.headers,
      customFetch: this.fetch
    });
  }
  get storage() {
    return new StorageClient(this.storageUrl, this.headers, this.fetch);
  }
  from(relation) {
    return this.rest.from(relation);
  }
  rpc(fn, args = {}, options) {
    return this.rest.rpc(fn, args, options);
  }
  channel(name2, opts = { config: {} }) {
    return this.realtime.channel(name2, opts);
  }
  getChannels() {
    return this.realtime.getChannels();
  }
  removeChannel(channel) {
    return this.realtime.removeChannel(channel);
  }
  removeAllChannels() {
    return this.realtime.removeAllChannels();
  }
  _getAccessToken() {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
      const { data } = yield this.auth.getSession();
      return (_b = (_a = data.session) === null || _a === void 0 ? void 0 : _a.access_token) !== null && _b !== void 0 ? _b : null;
    });
  }
  _initSupabaseAuthClient({ autoRefreshToken, persistSession, detectSessionInUrl, storage, storageKey }, headers, fetch2) {
    const authHeaders = {
      Authorization: `Bearer ${this.supabaseKey}`,
      apikey: `${this.supabaseKey}`
    };
    return new SupabaseAuthClient({
      url: this.authUrl,
      headers: Object.assign(Object.assign({}, authHeaders), headers),
      storageKey,
      autoRefreshToken,
      persistSession,
      detectSessionInUrl,
      storage,
      fetch: fetch2
    });
  }
  _initRealtimeClient(options) {
    return new RealtimeClient(this.realtimeUrl, Object.assign(Object.assign({}, options), { params: Object.assign({ apikey: this.supabaseKey }, options === null || options === void 0 ? void 0 : options.params) }));
  }
  _listenForAuthEvents() {
    let data = this.auth.onAuthStateChange((event, session) => {
      this._handleTokenChanged(event, session === null || session === void 0 ? void 0 : session.access_token, "CLIENT");
    });
    return data;
  }
  _handleTokenChanged(event, token, source) {
    if ((event === "TOKEN_REFRESHED" || event === "SIGNED_IN") && this.changedAccessToken !== token) {
      this.realtime.setAuth(token !== null && token !== void 0 ? token : null);
      this.changedAccessToken = token;
    } else if (event === "SIGNED_OUT" || event === "USER_DELETED") {
      this.realtime.setAuth(this.supabaseKey);
      if (source == "STORAGE")
        this.auth.signOut();
    }
  }
}
const createClient = (supabaseUrl, supabaseKey, options) => {
  return new SupabaseClient(supabaseUrl, supabaseKey, options);
};
const useSupabaseToken = () => {
  const { supabase: { cookies: cookieOptions } } = useRuntimeConfig().public;
  const cookieName = `${cookieOptions.name}-access-token`;
  return useCookie(cookieName);
};
const useSupabaseClient = () => {
  var _a;
  const nuxtApp = useNuxtApp();
  const token = useSupabaseToken();
  const Authorization = token.value ? `Bearer ${token.value}` : void 0;
  const { supabase: { url: url2, key, client: clientOptions } } = useRuntimeConfig().public;
  const options = defu(clientOptions, { global: { headers: { Authorization } } });
  const recreateClient = ((_a = nuxtApp._supabaseClient) == null ? void 0 : _a.headers.Authorization) !== Authorization;
  if (!nuxtApp._supabaseClient || recreateClient) {
    nuxtApp._supabaseClient = createClient(url2, key, options);
  }
  return nuxtApp._supabaseClient;
};
const useSupabaseUser = () => {
  const user = useState("supabase_user", "$YyD8TAML4r");
  const token = useSupabaseToken();
  if (!token.value) {
    user.value = null;
  }
  return user;
};
const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
const meta$3 = void 0;
const meta$2 = {
  middleware: "auth"
};
const meta$1 = void 0;
const _sfc_main$3 = {};
function _sfc_ssrRender$2(_ctx, _push, _parent, _attrs) {
  _push(`<svg${ssrRenderAttrs(mergeProps({
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 20 20",
    fill: "currentColor"
  }, _attrs))}><path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clip-rule="evenodd"></path></svg>`);
}
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/@nuxt-hero-icons/solid/src/components/LogoutIcon.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["ssrRender", _sfc_ssrRender$2]]);
const _sfc_main$2 = {};
function _sfc_ssrRender$1(_ctx, _push, _parent, _attrs) {
  _push(`<svg${ssrRenderAttrs(mergeProps({
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 20 20",
    fill: "currentColor"
  }, _attrs))}><path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"></path></svg>`);
}
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/@nuxt-hero-icons/solid/src/components/CogIcon.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_2 = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["ssrRender", _sfc_ssrRender$1]]);
const meta = {
  middleware: "auth"
};
const _routes = [
  {
    name: "ResetPassword",
    path: "/ResetPassword",
    file: "/home/francis/Documents/supabase/Email-phone-auth/pages/ResetPassword.vue",
    children: [],
    meta: meta$3,
    alias: [],
    component: () => import('./_nuxt/ResetPassword.21b9ccb3.mjs').then((m) => m.default || m)
  },
  {
    name: "Setting",
    path: "/Setting",
    file: "/home/francis/Documents/supabase/Email-phone-auth/pages/Setting.vue",
    children: [],
    meta: meta$2,
    alias: (meta$2 == null ? void 0 : meta$2.alias) || [],
    component: () => import('./_nuxt/Setting.1479d7fb.mjs').then((m) => m.default || m)
  },
  {
    name: "index",
    path: "/",
    file: "/home/francis/Documents/supabase/Email-phone-auth/pages/index.vue",
    children: [],
    meta: meta$1,
    alias: [],
    component: () => import('./_nuxt/index.c8a1358c.mjs').then((m) => m.default || m)
  },
  {
    name: "tasks",
    path: "/tasks",
    file: "/home/francis/Documents/supabase/Email-phone-auth/pages/tasks.vue",
    children: [],
    meta,
    alias: (meta == null ? void 0 : meta.alias) || [],
    component: () => import('./_nuxt/tasks.fa70f576.mjs').then((m) => m.default || m)
  }
];
const configRouterOptions = {};
const routerOptions = {
  ...configRouterOptions
};
const globalMiddleware = [];
const namedMiddleware = {
  auth: () => import('./_nuxt/auth.85bc3dbb.mjs')
};
const node_modules_nuxt_dist_pages_runtime_router_mjs_qNv5Ky2ZmB = defineNuxtPlugin(async (nuxtApp) => {
  var _a, _b, _c, _d;
  let __temp, __restore;
  nuxtApp.vueApp.component("NuxtPage", NuxtPage);
  nuxtApp.vueApp.component("NuxtNestedPage", NuxtPage);
  nuxtApp.vueApp.component("NuxtChild", NuxtPage);
  let routerBase = useRuntimeConfig().app.baseURL;
  if (routerOptions.hashMode && !routerBase.includes("#")) {
    routerBase += "#";
  }
  const history = (_b = (_a = routerOptions.history) == null ? void 0 : _a.call(routerOptions, routerBase)) != null ? _b : createMemoryHistory(routerBase);
  const routes = (_d = (_c = routerOptions.routes) == null ? void 0 : _c.call(routerOptions, _routes)) != null ? _d : _routes;
  const initialURL = nuxtApp.ssrContext.url;
  const router = createRouter({
    ...routerOptions,
    history,
    routes
  });
  nuxtApp.vueApp.use(router);
  const previousRoute = shallowRef(router.currentRoute.value);
  router.afterEach((_to, from) => {
    previousRoute.value = from;
  });
  Object.defineProperty(nuxtApp.vueApp.config.globalProperties, "previousRoute", {
    get: () => previousRoute.value
  });
  const _route = shallowRef(router.resolve(initialURL));
  const syncCurrentRoute = () => {
    _route.value = router.currentRoute.value;
  };
  nuxtApp.hook("page:finish", syncCurrentRoute);
  router.afterEach((to, from) => {
    var _a2, _b2, _c2, _d2;
    if (((_b2 = (_a2 = to.matched[0]) == null ? void 0 : _a2.components) == null ? void 0 : _b2.default) === ((_d2 = (_c2 = from.matched[0]) == null ? void 0 : _c2.components) == null ? void 0 : _d2.default)) {
      syncCurrentRoute();
    }
  });
  const route = {};
  for (const key in _route.value) {
    route[key] = computed(() => _route.value[key]);
  }
  nuxtApp._route = reactive(route);
  nuxtApp._middleware = nuxtApp._middleware || {
    global: [],
    named: {}
  };
  useError();
  try {
    if (true) {
      ;
      [__temp, __restore] = executeAsync(() => router.push(initialURL)), await __temp, __restore();
      ;
    }
    ;
    [__temp, __restore] = executeAsync(() => router.isReady()), await __temp, __restore();
    ;
  } catch (error2) {
    callWithNuxt(nuxtApp, showError, [error2]);
  }
  const initialLayout = useState("_layout", "$0JR5xvAX5a");
  router.beforeEach(async (to, from) => {
    var _a2, _b2;
    to.meta = reactive(to.meta);
    if (nuxtApp.isHydrating) {
      to.meta.layout = (_a2 = initialLayout.value) != null ? _a2 : to.meta.layout;
    }
    nuxtApp._processingMiddleware = true;
    const middlewareEntries = /* @__PURE__ */ new Set([...globalMiddleware, ...nuxtApp._middleware.global]);
    for (const component of to.matched) {
      const componentMiddleware = component.meta.middleware;
      if (!componentMiddleware) {
        continue;
      }
      if (Array.isArray(componentMiddleware)) {
        for (const entry2 of componentMiddleware) {
          middlewareEntries.add(entry2);
        }
      } else {
        middlewareEntries.add(componentMiddleware);
      }
    }
    for (const entry2 of middlewareEntries) {
      const middleware = typeof entry2 === "string" ? nuxtApp._middleware.named[entry2] || await ((_b2 = namedMiddleware[entry2]) == null ? void 0 : _b2.call(namedMiddleware).then((r) => r.default || r)) : entry2;
      if (!middleware) {
        throw new Error(`Unknown route middleware: '${entry2}'.`);
      }
      const result = await callWithNuxt(nuxtApp, middleware, [to, from]);
      {
        if (result === false || result instanceof Error) {
          const error2 = result || createError$1({
            statusMessage: `Route navigation aborted: ${initialURL}`
          });
          return callWithNuxt(nuxtApp, showError, [error2]);
        }
      }
      if (result || result === false) {
        return result;
      }
    }
  });
  router.afterEach(async (to) => {
    delete nuxtApp._processingMiddleware;
    if (to.matched.length === 0) {
      callWithNuxt(nuxtApp, showError, [createError$1({
        statusCode: 404,
        fatal: false,
        statusMessage: `Page not found: ${to.fullPath}`
      })]);
    } else if (to.matched[0].name === "404" && nuxtApp.ssrContext) {
      nuxtApp.ssrContext.event.res.statusCode = 404;
    } else {
      const currentURL = to.fullPath || "/";
      if (!isEqual(currentURL, initialURL)) {
        await callWithNuxt(nuxtApp, navigateTo, [currentURL]);
      }
    }
  });
  nuxtApp.hooks.hookOnce("app:created", async () => {
    try {
      await router.replace({
        ...router.resolve(initialURL),
        name: void 0,
        force: true
      });
    } catch (error2) {
      callWithNuxt(nuxtApp, showError, [error2]);
    }
  });
  return { provide: { router } };
});
const redirectToLogin = (toPath) => {
  const router = useRouter();
  const redirect = useRuntimeConfig().public.supabase.redirect;
  if (redirect && redirect.login) {
    if ([redirect.login, redirect.callback].includes(toPath)) {
      return;
    }
    if (!router.resolve(toPath).name) {
      return;
    }
    return navigateTo(redirect.login);
  }
};
const node_modules__64nuxtjs_supabase_dist_runtime_plugins_auth_redirect_mjs_hxxEaFfrIx = defineNuxtPlugin(() => {
  addRouteMiddleware("global-auth", (to) => {
    const user = useSupabaseUser();
    if (!user.value) {
      return redirectToLogin(to.path);
    }
  }, { global: true });
});
const node_modules__64nuxtjs_supabase_dist_runtime_plugins_supabase_server_mjs_6VOknHCOlQ = defineNuxtPlugin(async () => {
  let __temp, __restore;
  const user = useSupabaseUser();
  const client = useSupabaseClient();
  const token = useSupabaseToken();
  const route = useRoute();
  if (!token.value) {
    return;
  }
  const { data: { user: supabaseUser }, error } = ([__temp, __restore] = executeAsync(() => client.auth.getUser(token.value)), __temp = await __temp, __restore(), __temp);
  if (error) {
    token.value = null;
    user.value = null;
    [__temp, __restore] = executeAsync(() => redirectToLogin(route.path)), await __temp, __restore();
  } else {
    user.value = supabaseUser;
  }
});
const _plugins = [
  _nuxt_components_plugin_mjs_KR1HBZs4kY,
  node_modules_nuxt_dist_head_runtime_lib_vueuse_head_plugin_mjs_D7WGfuP1A0,
  node_modules_nuxt_dist_head_runtime_plugin_mjs_1QO0gqa6n2,
  node_modules_nuxt_dist_pages_runtime_router_mjs_qNv5Ky2ZmB,
  node_modules__64nuxtjs_supabase_dist_runtime_plugins_auth_redirect_mjs_hxxEaFfrIx,
  node_modules__64nuxtjs_supabase_dist_runtime_plugins_supabase_server_mjs_6VOknHCOlQ
];
const _sfc_main$1 = {
  __name: "nuxt-root",
  __ssrInlineRender: true,
  setup(__props) {
    const ErrorComponent = defineAsyncComponent(() => import('./_nuxt/error-component.ec1717bb.mjs').then((r) => r.default || r));
    const nuxtApp = useNuxtApp();
    provide("_route", useRoute());
    nuxtApp.hooks.callHookWith((hooks) => hooks.map((hook) => hook()), "vue:setup");
    const error = useError();
    onErrorCaptured((err, target, info) => {
      nuxtApp.hooks.callHook("vue:error", err, target, info).catch((hookError) => console.error("[nuxt] Error in `vue:error` hook", hookError));
      {
        callWithNuxt(nuxtApp, showError, [err]);
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_App = resolveComponent("App");
      ssrRenderSuspense(_push, {
        default: () => {
          if (unref(error)) {
            _push(ssrRenderComponent(unref(ErrorComponent), { error: unref(error) }, null, _parent));
          } else {
            _push(ssrRenderComponent(_component_App, null, null, _parent));
          }
        },
        _: 1
      });
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/nuxt/dist/app/components/nuxt-root.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = {
  components: {},
  watch: {
    $route() {
      location.reload();
    }
  }
};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  const _component_NuxtPage = resolveComponent("NuxtPage");
  _push(`<div${ssrRenderAttrs(mergeProps({ class: "" }, _attrs))}>`);
  _push(ssrRenderComponent(_component_NuxtPage, null, null, _parent));
  _push(`</div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("app.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const AppComponent = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
if (!globalThis.$fetch) {
  globalThis.$fetch = $fetch.create({
    baseURL: baseURL()
  });
}
let entry;
const plugins = normalizePlugins(_plugins);
{
  entry = async function createNuxtAppServer(ssrContext) {
    const vueApp = createApp(_sfc_main$1);
    vueApp.component("App", AppComponent);
    const nuxt = createNuxtApp({ vueApp, ssrContext });
    try {
      await applyPlugins(nuxt, plugins);
      await nuxt.hooks.callHook("app:created", vueApp);
    } catch (err) {
      await nuxt.callHook("app:error", err);
      nuxt.payload.error = nuxt.payload.error || err;
    }
    return vueApp;
  };
}
const entry$1 = (ctx) => entry(ctx);

export { _export_sfc as _, useSupabaseUser as a, __nuxt_component_0$1 as b, __nuxt_component_0 as c, __nuxt_component_2 as d, entry$1 as default, defineNuxtRouteMiddleware as e, useHead as f, navigateTo as n, useSupabaseClient as u };
//# sourceMappingURL=server.mjs.map
