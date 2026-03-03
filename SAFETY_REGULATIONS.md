# 🛡️ Sellfast Safety Regulations (دستور الأمان)

This document outlines **MANDATORY** coding standards to maintain the "Self-Healing Agent" architecture. Failure to follow these rules results in runtime crashes which are **NOT ACCEPTABLE**.

## 1. String Safety (القاعدة الذهبية للنصوص)
**RULE**: Never call `.slice()`, `.split()`, `.trim()`, or `.toLowerCase()` on a raw variable.
- **BAD**: `text.slice(0, 10)`
- **GOOD**: `String(text || '').slice(0, 10)`

> [!IMPORTANT]
> Always assume values from APIs, Databases, or Environment Variables can be `null`, `undefined`, or a `number`.

## 2. Array Protection (حماية المصفوفات)
**RULE**: Never call `.map()`, `.filter()`, or `.reduce()` without an array guard.
- **BAD**: `data.hooks.map(...)`
- **GOOD**: `(data?.hooks || []).map(...)` or `Array.isArray(data?.hooks) ? data.hooks.map(...) : []`

## 3. Object Resilience (الوصول الآمن للبيانات)
**RULE**: Always use Optional Chaining (`?.`) for nested properties.
- **BAD**: `user.profile.settings.theme`
- **GOOD**: `user?.profile?.settings?.theme || 'dark'`

## 4. AI Service Standards (معايير الذكاء الاصطناعي)
- **Safe Wrapper**: All AI calls **MUST** be wrapped in `safeAI` from `utils/aiAgent.ts`.
- **Robust Parsing**: Use `parseRobustJSON` instead of `JSON.parse` for any AI output.
- **Fallbacks**: Every service function **MUST** return a valid fallback object on failure, never `null` or `undefined`.

## 5. UI Stability (استقرار الواجهة)
- **ErrorBoundary**: Use the global `ErrorBoundary` for all major "Studio" sections.
- **Null Checks in Render**: Ensure all dynamic data is checked before rendering.
- **Loading States**: Always provide a loading state or skeleton while waiting for data.

---
**Compliance is mandatory for all commits.** 🚀
