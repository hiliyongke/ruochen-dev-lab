import { defineConfig } from 'vitepress';
import fs from 'fs';
import path from 'path';

const DOCS_ROOT = path.resolve(__dirname, '..');

function getHandbookDirs(): string[] {
  return fs
    .readdirSync(DOCS_ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((name) => name !== '.vitepress' && name !== 'node_modules');
}

type SidebarItem = { text: string; link: string };
type SidebarGroup = { text: string; items: SidebarItem[]; collapsed?: boolean };
type SidebarConfig = Record<string, SidebarGroup[]>;

// 手册中文名映射
const HANDBOOK_NAME_ZH: Record<string, string> = {
  'frontend-engineering-handbook': '前端工程化',
  'frontend-debugging-handbook': '前端调试手册',
  'frontend-unit-testing-handbook': '前端单元测试手册',
  'react-handbook': 'React 手册',
  'vue-handbook': 'Vue 手册',
  'ecmascript-handbook': 'EcmaScript 手册',
  'tailwindcss-handbook': 'TailwindCSS 手册',
  'linux-basics-ops-for-frontend': '前端适用的 Linux 基础运维',
  'code-smells-handbook': '代码的坏味道',
  'senior-frontend-engineer-interview-handbook': '资深前端工程师面试手册',
};

// 常见顶层分组中文名映射
const GROUP_NAME_ZH: Record<string, string> = {
  'docs': '文档',
  'guide': '指南',
  'chapters': '章节',
  'debugging-guides': '调试指南',
  'examples': '示例',
  'appendix': '附录',
  'publish': '发布',
};

function humanize(name: string): string {
  if (HANDBOOK_NAME_ZH[name]) return HANDBOOK_NAME_ZH[name];
  if (GROUP_NAME_ZH[name]) return GROUP_NAME_ZH[name];
  // 默认：kebab 转空格并首字母大写
  return name.replace(/[-_]+/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}

// 从 Markdown 提取标题（优先首个 H1）
function extractTitleFromMarkdown(absPath: string): string | null {
  try {
    const content = fs.readFileSync(absPath, 'utf8');
    const lines = content.split(/\r?\n/);
    for (const raw of lines) {
      const line = raw.trim();
      if (!line) continue;
      // 匹配 "# 标题" 或 frontmatter 后第一个一级标题
      const m = /^#\s+(.+)$/.exec(line);
      if (m) return m[1].trim();
      // 兼容 VitePress docs 中常见 "标题" 行（不建议但尽量处理）
    }
    // 兜底：尝试 frontmatter title
    const fm = /^---[\s\S]*?---/.exec(content);
    if (fm) {
      const titleMatch = /(?:^|\n)\s*title:\s*(.+)\s*(?:\n|$)/.exec(fm[0]);
      if (titleMatch) return titleMatch[1].trim().replace(/^["']|["']$/g, '');
    }
  } catch {}
  return null;
}

function toLinkPath(handbook: string, relFilePath: string): string {
  const withoutExt = relFilePath.replace(/\.md$/i, '');
  // 如果是 index 文件，返回目录路径
  if (withoutExt === 'index' || withoutExt.endsWith('/index')) {
    return `/${handbook}/`;
  }
  return `/${handbook}/${withoutExt}`;
}

function listMarkdownFiles(rootDir: string): string[] {
  const results: string[] = [];
  const walk = (dir: string, base: string = '') => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      // 跳过 node_modules 与 .vitepress 子目录
      if (e.isDirectory() && (e.name === 'node_modules' || e.name === '.vitepress')) {
        continue;
      }
      const full = path.join(dir, e.name);
      const rel = path.posix.join(base, e.name.replace(/\\/g, '/'));
      if (e.isDirectory()) {
        walk(full, rel);
      } else if (e.isFile() && e.name.toLowerCase().endsWith('.md')) {
        results.push(rel);
      }
    }
  };
  walk(rootDir);
  return results.sort((a, b) => a.localeCompare(b));
}

function groupByTopFolder(files: string[]): Record<string, string[]> {
  const groups: Record<string, string[]> = {};
  for (const f of files) {
    const seg = f.includes('/') ? f.split('/')[0] : '';
    const key = seg; // '' means root
    if (!groups[key]) groups[key] = [];
    groups[key].push(f);
  }
  return groups;
}

function makeSidebarForHandbook(handbook: string): SidebarGroup[] {
  const handbookRoot = path.join(DOCS_ROOT, handbook);
  const mdFiles = listMarkdownFiles(handbookRoot)
    .filter((f) => !/(^|\/)_template\.md$/i.test(f))
    .filter((f) => !/(^|\/)SUMMARY\.md$/i.test(f));

  const hasReadme = mdFiles.find((f) => /(^|\/)README\.md$/i.test(f));
  const hasIndex = mdFiles.find((f) => /(^|\/)index\.md$/i.test(f));

  const groupsMap = groupByTopFolder(mdFiles);
  const groups: SidebarGroup[] = [];

  // 根分组（概览/快速开始）
  const rootItems: SidebarItem[] = [];
  if (hasReadme) {
    rootItems.push({
      text: '概览',
      link: toLinkPath(handbook, hasReadme),
    });
  } else if (hasIndex) {
    rootItems.push({
      text: '概览',
      link: toLinkPath(handbook, hasIndex),
    });
  }

  for (const [top, files] of Object.entries(groupsMap)) {
    if (top === '') {
      const others = files.filter((f) => !/(^|\/)(README|index)\.md$/i.test(f));
      if (others.length) {
        rootItems.push(
          ...others.map((rel) => {
            const abs = path.join(handbookRoot, rel);
            const title =
              extractTitleFromMarkdown(abs) ||
              humanize(path.basename(rel, '.md'));
            return {
              text: title,
              link: toLinkPath(handbook, rel),
            };
          }),
        );
      }
    } else {
      const items: SidebarItem[] = files.map((rel) => {
        const abs = path.join(handbookRoot, rel);
        const title =
          extractTitleFromMarkdown(abs) ||
          humanize(path.basename(rel, '.md'));
        return {
          text: title,
          link: toLinkPath(handbook, rel),
        };
      });
      groups.push({
        text: humanize(top),
        items,
        collapsed: false,
      });
    }
  }

  if (rootItems.length) {
    groups.unshift({
      text: '快速开始',
      items: rootItems,
      collapsed: false,
    });
  }

  return groups;
}

function buildSidebar(): SidebarConfig {
  const config: SidebarConfig = {};
  for (const dir of getHandbookDirs()) {
    config[`/${dir}/`] = makeSidebarForHandbook(dir);
  }
  return config;
}

function buildNav(): { text: string; link: string }[] {
  return getHandbookDirs().map((d) => ({
    text: HANDBOOK_NAME_ZH[d] || humanize(d),
    link: `/${d}/`,
  }));
}

export default defineConfig({
  lang: 'zh-CN',
  title: 'Ruochen Dev Lab',
  description: '前端工程与实践小册合集',
  // GitHub Pages 部署配置
  base: process.env.NODE_ENV === 'production' ? '/ruochen-dev-lab/' : '/',
  themeConfig: {
    nav: buildNav(),
    sidebar: buildSidebar(),
    socialLinks: [{ icon: 'github', link: 'https://github.com/' }],
    outline: [2, 6],
  },
  srcExclude: ['**/node_modules/**', '**/.vitepress/**'],
  ignoreDeadLinks: [
    // 忽略 localhost 链接（用于示例代码）
    /^http:\/\/localhost/,
    /^https:\/\/localhost/,
  ],
});