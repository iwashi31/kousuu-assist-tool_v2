declare module '*.vue' {
  import Vue from 'vue'

  module 'vue/types/vue' {
    interface VueConstructor<V extends Vue> {
      ls: VueLs;
    }
  }

  const _default: Vue
  export default _default
}

interface VueLs {
  set: (name: string, object: object, expire?: number) => void;
  get: (name: string, def?: unknown) => unknown;
}