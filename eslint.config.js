import fs from 'node:fs'
import path from 'node:path'
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

// ---------------------------------------------------------------------------
// Gallery token guard — STRICT: NO hardcoded design values.
//
// The dev gallery + its components are a strict token zone. This rule reads
// src/new-design-system.css and forbids ANY hardcoded design value in those
// files — every colour, size, spacing, radius and shadow must come from a
// token. Specifically it flags:
//   1. `var(--x)` that isn't a token defined there (an old token, typo, or
//      Tailwind var).
//   2. Any Tailwind spacing / size / radius / shadow class whose value MATCHES
//      a token — it must be written as the token (`gap-3` → `gap-[var(--space-md)]`).
//   3. Any Tailwind spacing (`gap-8`, `px-2.5`) or height/width/size
//      (`h-9`, `w-12`, `size-10`) class with NO matching token — a hardcoded
//      value. Add a token, or use one that fits. (0 and fractions are allowed.)
//   4. Any arbitrary bracket literal — `min-w-[92px]`, `text-[14px]`, `[#fff]`,
//      `[rgb(...)]`. Design values must be `-[var(--token)]`, never a raw value.
//   5. Any bare Tailwind / shadcn colour class (`bg-white`, `text-muted`).
// Structural utilities (flex, w-full, min-w-0, positioning, etc.) are untouched.
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
const sizePx = {} // icon + control footprints
const radiusNamed = {} // sm|md|lg|full -> token
const shadowNamed = {} // sm|md|lg|... -> token
for (const [name, val] of tokenDefs) {
  const px = /^(\d+)px$/.exec(val)?.[1]
  if (name.startsWith('--space-') && px) spacePx[px] = name
  if ((name.startsWith('--icon-') || name.startsWith('--control-')) && px) sizePx[px] = name
  if (name.startsWith('--radius-')) radiusNamed[name.slice('--radius-'.length)] = name
  if (name.startsWith('--shadow-')) shadowNamed[name.slice('--shadow-'.length)] = name
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
// Height / width / square footprint — numeric Tailwind sizes (h-9, w-12, size-10,
// min-w-8…). `full`/`screen`/`fit`/`max`/`min`/`auto` and fractions (w-1/2) are
// NOT numeric so they don't match; 0 is allowed (a reset, not a design value).
const WH_RE =
  /(?<![\w-])(h|w|min-w|max-w|min-h|max-h|size)-(\d+(?:\.\d+)?)(?![\w./-])/g
// Position offsets — numeric inset/top/right/bottom/left (left-3.5 = 14px…).
// Fractions (left-1/2, used for centering) are relative, not design values, so
// the fraction lookahead excludes them; 0 is allowed.
const POS_RE =
  /(?<![\w-])(inset|top|right|bottom|left|start|end)-(\d+(?:\.\d+)?)(?![\w./-])/g
// Border width — numeric `border-2` / `border-t-2` (a raw px width).
const BORDER_RE =
  /(?<![\w-])border(?:-[xytblrse]{1,2})?-(\d+)(?![\w./-])/g
// An arbitrary bracket value: `prefix-[inner]`, or a standalone `[--x:…]` custom
// property. A hardcoded literal (a raw length, hex or rgb/hsl) is forbidden even
// when mixed with var() inside a calc() — `calc(var(--x) + 16px)` still throws.
const ARBITRARY_RE = /(?<![\w-])[\w-]+-\[([^\]]+)\]/g
const STANDALONE_RE = /(?<![\w-])\[([^\]]+)\]/g
// Any raw colour in a string (inline-style scrims like rgb(0 0 0 / 0.6), hex).
const RAWCOLOR_RE = /#[0-9a-fA-F]{3,8}(?![0-9a-fA-F])|\b(?:rgb|hsl)a?\([^)]*\)/g
const isHardLiteral = (inner) => {
  const v = inner.replace(/^(length|color|image|font|number|percentage|url):/, '')
  if (/(?<![\w.])-?\d*\.?\d+(?:px|rem|em|vh|vw|ch)\b/.test(v)) return true
  if (/#[0-9a-fA-F]{3,8}(?![0-9a-fA-F])/.test(v)) return true
  if (/\b(?:rgb|hsl)a?\(/.test(v)) return true
  return false
}
const RADIUS_RE =
  /(?<![\w-])(rounded(?:-(?:t|b|l|r|tl|tr|bl|br|ss|se|es|ee|s|e))?)-(sm|md|lg|full)(?![\w-])/g
const SHADOW_RE = /(?<![\w-])shadow-(sm|md|lg|xl|2xl|inner|none)(?![\w-])/g

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
    // `hardcode: true` (real ds components) adds the strict no-raw-value checks:
    // every size, spacing and bracket literal must be a token. Off (the dev
    // gallery harness) keeps only the token / colour checks.
    schema: [
      { type: 'object', properties: { hardcode: { type: 'boolean' } }, additionalProperties: false },
    ],
    messages: {
      unknownToken:
        "'{{name}}' is not a token in new-design-system.css. The gallery may only use new design system tokens.",
      tailwindClass:
        "'{{cls}}' maps to a design token — use '{{fix}}' instead of a Tailwind class.",
      hardcodedSize:
        "'{{cls}}' is a hardcoded size — use a size token (e.g. var(--control-sm) / var(--icon-sm)), or add one if none fits. Raw sizes aren't allowed.",
      hardcodedSpace:
        "'{{cls}}' is a hardcoded spacing value with no matching token — use a --space token, or add one if none fits.",
      arbitraryValue:
        "'{{cls}}' hardcodes a raw value — design values must come from a token: write -[var(--token)] and add the token if it doesn't exist.",
      colorClass:
        "'{{cls}}' is a Tailwind/shadcn colour class — use a new-design-system colour token, e.g. bg-[var(--surface)] / style color: var(--text-primary).",
    },
  },
  create(context) {
    const strict = context.options[0]?.hardcode === true
    const check = (node, text) => {
      // 1. var(--x) must be defined
      for (const m of text.matchAll(/var\(\s*(--[\w-]+)/g)) {
        const name = m[1]
        if (name.startsWith('--tw-')) continue
        if (definedTokens.has(name) || allowedLocalVars.has(name)) continue
        context.report({ node, messageId: 'unknownToken', data: { name } })
      }
      // 2. Tailwind spacing — on-token maps to the token; off-token is a
      //    hardcoded value (flagged only in strict / real-component files).
      for (const m of text.matchAll(SPACING_RE)) {
        if (m[2] === '0') continue
        const px = String(parseFloat(m[2]) * 4)
        if (spacePx[px]) {
          context.report({
            node,
            messageId: 'tailwindClass',
            data: { cls: m[0], px, fix: `${m[1]}-[var(${spacePx[px]})]` },
          })
        } else if (strict) {
          context.report({ node, messageId: 'hardcodedSpace', data: { cls: m[0] } })
        }
      }
      // 2b. Height / width / square size. Non-strict keeps the original
      //     behaviour (only `size-N` that maps to a token); strict flags every
      //     numeric h / w / min / max / size.
      for (const m of text.matchAll(WH_RE)) {
        if (m[2] === '0') continue
        if (!strict && m[1] !== 'size') continue
        const px = String(parseFloat(m[2]) * 4)
        if (sizePx[px]) {
          context.report({
            node,
            messageId: 'tailwindClass',
            data: { cls: m[0], px, fix: `${m[1]}-[var(${sizePx[px]})]` },
          })
        } else if (strict) {
          context.report({ node, messageId: 'hardcodedSize', data: { cls: m[0] } })
        }
      }
      // The strict-only checks: positions, bracket literals and raw colours.
      if (strict) {
        // 2c. Numeric position offsets + border widths.
        for (const m of text.matchAll(POS_RE)) {
          if (m[2] === '0') continue
          context.report({ node, messageId: 'hardcodedSize', data: { cls: m[0] } })
        }
        for (const m of text.matchAll(BORDER_RE)) {
          if (m[1] === '0') continue
          context.report({ node, messageId: 'hardcodedSize', data: { cls: m[0] } })
        }
        // 2d. Arbitrary bracket literals + standalone custom-prop brackets —
        //     a raw length / hex / rgb, even inside a calc() alongside a var().
        for (const m of text.matchAll(ARBITRARY_RE)) {
          if (isHardLiteral(m[1])) {
            context.report({ node, messageId: 'arbitraryValue', data: { cls: m[0] } })
          }
        }
        for (const m of text.matchAll(STANDALONE_RE)) {
          if (isHardLiteral(m[1])) {
            context.report({ node, messageId: 'arbitraryValue', data: { cls: m[0] } })
          }
        }
        // 2e. Any raw colour in a string (inline-style scrims, hex).
        for (const m of text.matchAll(RAWCOLOR_RE)) {
          context.report({ node, messageId: 'arbitraryValue', data: { cls: m[0] } })
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
      for (const m of text.matchAll(SHADOW_RE)) {
        const token = shadowNamed[m[1]]
        if (token) {
          context.report({
            node,
            messageId: 'tailwindClass',
            data: { cls: m[0], px: m[1], fix: `boxShadow: var(${token})` },
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
  // Real design-system components — STRICT: no raw values at all, every size /
  // spacing / colour must be a token.
  {
    files: ['src/components/ds/**/*.{ts,tsx}'],
    plugins: {
      'design-tokens': { rules: { 'only-defined-tokens': galleryTokenRule } },
    },
    rules: { 'design-tokens/only-defined-tokens': ['error', { hardcode: true }] },
  },
  // The dev gallery harness — token + colour checks only. Its own layout
  // spacing on the "wall" is not product UI, so raw sizes/spacing are allowed.
  {
    files: [
      'src/gallery/**/*.{ts,tsx}',
      'src/components/gallery/**/*.{ts,tsx}',
      'src/hooks/useGalleryControls.ts',
    ],
    plugins: {
      'design-tokens': { rules: { 'only-defined-tokens': galleryTokenRule } },
    },
    rules: { 'design-tokens/only-defined-tokens': ['error', { hardcode: false }] },
  },
])
