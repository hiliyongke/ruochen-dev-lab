export async function retryFetch(url: string, { retries = 3, base = 20 } = {}) {
  let attempt = 0;
  // 真实实现用 setTimeout，测试中用 fake timers 推进
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('bad');
      return res;
    } catch (e) {
      if (attempt++ >= retries) throw e;
      const delay = base * 2 ** (attempt - 1);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}