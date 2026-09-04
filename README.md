# 🔍 Shiptrack - Realtime Live Search with Highlight (Challenge #63)

> **Submission for MemberFun Challenge #63 (Beplus Agency)**  
> **Score target**: 100/100 points  
> **Tech Stack**: Next.js 15, React 19, TypeScript, Tailwind CSS, Lucide Icons

---

## ✨ Features Implemented

### 1. Core Requirements (40%)
- **Realtime Filtering:** Instant filtering of data as user types.
- **Dynamic Regex Highlighting:** Non-destructive text matching highlighting characters using customized `<mark>` tags.
- **Safe Regex Matching:** Robust `escapeRegExp` protection against runtime crashes from special regex characters (`(`, `)`, `[`, `]`, `\`, `*`, `+`).

### 2. UI / UX Design & Architecture (40%)
- **Shiptrack Command Palette Design:** High-fidelity modal interface based directly on the official challenge screenshot.
- **Categorized Sections:** Clean separation into *Members*, *Fleet Assets*, and *Warehouse Network* with counter badges.
- **Filter Tabs:** Toggle between *All Results*, *Clients*, *Fleet*, and *Warehouse*.

### 3. Bonus Features (20%)
- **Debounced Search:** 200ms debounce timer preventing UI lag during fast typing.
- **Full Keyboard Navigation:** Full support for `↑` / `↓` arrow keys to highlight rows, and `↵ Enter` to select.
- **Escape Shortcut:** Quick dismiss with `Esc` or the interactive clear button.
- **Empty State UI:** Illustrated friendly fallback with helpful advice when no records match.
- **Zero InnerHTML Injection:** 100% type-safe React element parsing preventing XSS vulnerabilities.

---

## 🚀 Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
