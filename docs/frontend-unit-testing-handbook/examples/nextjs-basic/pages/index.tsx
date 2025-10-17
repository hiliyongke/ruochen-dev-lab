import React from 'react';

type User = { id: string; name: string };

type Props = { user: User };

export default function Home({ user }: Props) {
  return (
    <main>
      <h1>Home</h1>
      <p aria-label="user">User: {user.name}</p>
    </main>
  );
}

export async function getServerSideProps() {
  // 外部接口，测试中用 MSW 拦截
  const res = await fetch('https://api.example.com/users/1');
  if (!res.ok) {
    return { notFound: true };
  }
  const user = (await res.json()) as User;
  return { props: { user } as Props };
}