import fs from 'node:fs'
import path from 'node:path'
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

// ---------------------------------------------------------------------------
// Gallery token guard.
//
// The dev gallery + its components are a STRICT token zone. This rule reads
// src/new-design-system.css and enforces two things in those files:
//   1. Every `var(--x)` must be a token defined there (or a known runtime-local
//      var) — an old token, typo, or Tailwind var throws.
//   2. Any Tailwind spacing / icon-size / radius class whose value MATCHES a
//      defined token must be written as the token instead — e.g. `gap-3`
//      (12px) → `gap-[var(--space-md)]`, `size-4` → `size-[var(--icon-sm)]`,
//      `rounded-full` → `rounded-[var(--radius-full)]`. Tailwind classes for
//      values that have NO token (36px controls, 24px, etc.) are left alone
//      until those tokens are added.
// See the gallery-strict-tokens memory.
// ---------------------------------------------------------------------------
const dsCss = fs.readFileSync(
  path.join(import.meta.dirname, 'src/new-design-system.css'),
  'utf8'
)
const tokenDefs = [...dsCss.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map((m) => [
  m[1],
  m[2].trim(),
])
const definedTokens = new Set(tokenDefs.map(([name]) => name))
// px value -> token name, per category (Tailwind value * 4 = px for the scale).
const spacePx = {}
const iconPx = {}
const radiusNamed = {} // sm|md|lg|full -> token
for (const [name, val] of tokenDefs) {
  const px = /^(\d+)px$/.exec(val)?.[1]
  if (name.startsWith('--space-') && px) spacePx[px] = name
  if (name.startsWith('--icon-') && px) iconPx[px] = name
  if (name.startsWith('--radius-')) radiusNamed[name.slice('--radius-'.length)] = name
}
// runtime / component-local vars set in code, not design tokens.
const allowedLocalVars = new Set([
  '--specimen-size',
  '--specimen-leading',
  '--specimen-weight',
  '--node-y',
  '--cell-radius',
  '--cell-size',
])

const SPACING_RE =
  /(?<![\w-])(gap-x|gap-y|gap|space-x|space-y|px|py|pt|pb|pl|pr|p|mx|my|mt|mb|ml|mr|m)-(\d+(?:\.\d+)?)(?![\w.-])/g
const SIZE_RE = /(?<![\w-])size-(\d+(?:\.\d+)?)(?![\w.-])/g
const RADIUS_RE =
  /(?<![\w-])(rounded(?:-(?:t|b|l|r|tl|tr|bl|br|ss|se|es|ee|s|e))?)-(sm|md|lg|full)(?![\w-])/g

// Bare Tailwind COLOR utilities: a colour utility prefix + a named colour value.
// Colour must come from a new-design-system token (`bg-[var(--surface)]`), never
// a Tailwind/shadcn colour class. Arbitrary `[var(--x)]` values don't match (the
// value must start with a letter), and keyword non-colours are excluded below.
const COLOR_RE =
  /(?<![\w-])(?:bg|text|border|ring|fill|stroke|outline|divide|placeholder|caret|decoration|from|via|to)-([a-z][a-z-]*?)(?:-\d{1,3})?(?:\/\d{1,3})?(?![\w-])/g
const COLOR_WORDS = new Set([
  // shadcn semantic names (bridge/old palette)
  'primary', 'secondary', 'muted', 'accent', 'popover', 'card', 'foreground',
  'background', 'destructive', 'input', 'ring', 'sidebar', 'chart', 'brand',
  // Tailwind palette families
  'slate', 'gray', 'grey', 'zinc', 'neutral', 'stone', 'red', 'orange', 'amber',
  'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo',
  'violet', 'purple', 'fuchsia', 'pink', 'rose', 'white', 'black',
])
// keyword values that aren't palette colours — allowed.
const COLOR_ALLOWED = new Set(['transparent', 'current', 'inherit', 'none', 'auto'])

const galleryTokenRule = {
  meta: {
    type: 'problem',
    docs: { description: 'Gallery must use only new-design-system tokens.' },
    schema: [],
    messages: {
      unknownToken:
        "'{{name}}' is not a token in new-design-system.css. The gallery may only use new design system tokens.",
      tailwindClass:
        "'{{cls}}' maps to a design token — use '{{fix}}' instead of a Tailwind class.",
      colorClass:
        "'{{cls}}' is a Tailwind/shadcn colour class — use a new-design-system colour token, e.g. bg-[var(--surface)] / style color: var(--text-primary).",
    },
  },
  create(context) {
    const check = (node, text) => {
      // 1. var(--x) must be defined
      for (const m of text.matchAll(/var\(\s*(--[\w-]+)/g)) {
        const name = m[1]
        if (name.startsWith('--tw-')) continue
        if (definedTokens.has(name) || allowedLocalVars.has(name)) continue
        context.report({ node, messageId: 'unknownToken', data: { name } })
      }
      // 2. Tailwind classes whose value maps to a token
      for (const m of text.matchAll(SPACING_RE)) {
        const px = String(parseFloat(m[2]) * 4)
        if (spacePx[px]) {
          context.report({
            node,
            messageId: 'tailwindClass',
            data: { cls: m[0], px, fix: `${m[1]}-[var(${spacePx[px]})]` },
          })
        }
      }
      for (const m of text.matchAll(SIZE_RE)) {
        const px = String(parseFloat(m[1]) * 4)
        if (iconPx[px]) {
          context.report({
            node,
            messageId: 'tailwindClass',
            data: { cls: m[0], px, fix: `size-[var(${iconPx[px]})]` },
          })
        }
      }
      for (const m of text.matchAll(RADIUS_RE)) {
        const token = radiusNamed[m[2]]
        if (token) {
          context.report({
            node,
            messageId: 'tailwindClass',
            data: { cls: m[0], px: m[2], fix: `${m[1]}-[var(${token})]` },
          })
        }
      }
      // 3. bare Tailwind/shadcn colour classes
      for (const m of text.matchAll(COLOR_RE)) {
        const value = m[1]
        if (COLOR_ALLOWED.has(value)) continue
        const base = value.split('-')[0] // muted-foreground -> muted, sidebar-accent -> sidebar
        if (COLOR_WORDS.has(value) || COLOR_WORDS.has(base)) {
          context.report({ node, messageId: 'colorClass', data: { cls: m[0] } })
        }
      }
    }
    return {
      Literal(node) {
        if (typeof node.value === 'string') check(node, node.value)
      },
      TemplateElement(node) {
        check(node, node.value.raw)
      },
    }
  },
}

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { tsconfigRootDir: import.meta.dirname },
    },
  },
  // Strict token guard — only the gallery and its components.
  {
    files: [
      'src/Gallery.tsx',
      'src/components/gallery/**/*.{ts,tsx}',
      'src/components/ds/**/*.{ts,tsx}',
      'src/hooks/useGalleryControls.ts',
    ],
    plugins: {
      'design-tokens': { rules: { 'only-defined-tokens': galleryTokenRule } },
    },
    rules: { 'design-tokens/only-defined-tokens': 'error' },
  },
])
