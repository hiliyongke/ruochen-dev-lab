import { defineComponent, provide, inject, ref, type Ref, type InjectionKey } from 'vue';

type Ctx = { count: Ref<number>; inc: () => void };
const StateKey: InjectionKey<Ctx> = Symbol('app-state');

export const StateProvider = defineComponent({
  name: 'StateProvider',
  setup(_, { slots }) {
    const count = ref(0);
    const inc = () => { count.value += 1; };
    provide(StateKey, { count, inc });
    return () => slots.default?.();
  },
});

export function useAppState(): Ctx {
  const ctx = inject(StateKey);
  if (!ctx) throw new Error('StateProvider is missing');
  return ctx;
}