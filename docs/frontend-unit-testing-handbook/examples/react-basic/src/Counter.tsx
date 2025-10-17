import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <h1>Count: {count}</h1>
      <button aria-label="add" onClick={() => setCount((c) => c + 1)}>
        Add
      </button>
    </div>
  );
}