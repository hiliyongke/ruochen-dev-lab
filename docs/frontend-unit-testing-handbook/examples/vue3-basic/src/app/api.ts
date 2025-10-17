export async function fetchUser(id: string) {
  const res = await fetch(`https://api.example.com/users/${id}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<{ id: string; name: string }>;
}

export async function fetchWithRetry(url: string, { retries = 2, base = 50 }: { retries?: number; base?: number } = {}) {
  let attempt = 0;
  while (true) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res;
    } catch (e) {
      if (attempt++ >= retries) throw e;
      const delay = base * 2 ** (attempt - 1);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

export async function fetchWithTimeout(url: string, timeout = 200) {
  const ac = new AbortController();
  const id = setTimeout(() => ac.abort(), timeout);
  try {
    return await fetch(url, { signal: ac.signal });
  } finally {
    clearTimeout(id);
  }
}