# Tauri + Svelte 3D Visualization App

This is a desktop application built with [Tauri](https://tauri.app/) and [Svelte](https://svelte.dev/), featuring 3D visualization using [Three.js](https://threejs.org/).

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or later)
- [Yarn](https://yarnpkg.com/) (or npm/pnpm)
- [Rust](https://www.rust-lang.org/tools/install)
- Additional Tauri dependencies:

## Getting Started

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Install dependencies
   ```bash
   cd test
   bun install
   ```

3. Run the development server
   ```bash
   bun tauri dev
   ```
   This will start both the Svelte development server and the Tauri application.

## Building for Production

To create a production build:

```bash
bun tauri build
```

This will create executable files for your platform in the `src-tauri/target/release` directory.

## Project Structure

- `src/` - Svelte frontend code
  - `App.svelte` - Main application component with Three.js visualization
  - `lib/` - Reusable Svelte components
  - `styles.css` - Global styles

- `src-tauri/` - Rust backend code
  - `src/` - Rust source files
  - `Cargo.toml` - Rust dependencies
  - `tauri.conf.json` - Tauri configuration

## Development
