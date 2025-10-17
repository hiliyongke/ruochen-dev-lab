import { createRouter, createMemoryHistory, type RouteRecordRaw } from 'vue-router';
import Home from './Home.vue';
import About from './About.vue';

export const routes: RouteRecordRaw[] = [
  { path: '/', component: Home },
  { path: '/about', component: About },
];

export function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes,
  });
}