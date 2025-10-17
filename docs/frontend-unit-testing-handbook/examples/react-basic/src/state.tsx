import { createContext, useContext, useReducer, ReactNode } from 'react';

type State = { count: number };
type Action = { type: 'inc' } | { type: 'dec' };
const initial: State = { count: 0 };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'inc': return { count: state.count + 1 };
    case 'dec': return { count: state.count - 1 };
    default: return state;
  }
}

const Ctx = createContext<{ state: State; dispatch: (a: Action) => void } | null>(null);

export function StateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);
  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>;
}

export function useAppState() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('StateProvider missing');
  return ctx;
}