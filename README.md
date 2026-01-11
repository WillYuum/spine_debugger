# Spine Debugger

**Spine Debugger** is a simple web tool for displaying and logging Spine animation data.  
Main goal is to help developers and non-animators alike to easily inspect Spine output — without needing the Spine Program.

It currently supports only Spine 4.x but planning to have support for older versions.

---

## Getting Started

### Development

To start working on the project locally:

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run the development server:

   ```bash
   npm run dev
   ```

3. For a quick build test (uses rsbuild bundler):

   ```bash
   npm run build
   ```

> **Note:** I use **rsbuild** as the bundler — it’s fast, lightweight, and great for quick development cycles + I like to test out anything made with rust ㋛.

---

### Production Build

To create a production-ready build, run:

```bash
npm run build:prod
```

---

### RsDoctor: Real-Time Build Output Viewer

Rspack provides a cool tool called **RsDoctor** to preview build output as it happened.

Start a production build with RsDoctor enabled by running:

```bash
npx cross-env RSDOCTOR=true npm run build:prod
```

This will launch a development server showing the build output process — super helpful for debugging build issues.

---

## Next Goal:

- [ ] Add changelog to UI + add a framework to always add changelog with version
- [ ] Display slot names somwhere & add UI.
- [ ] Add feature to load previous animation
- [ ] Add feature to clear current animation add new one