# 🍽️ Lunch Order App

A modern, user-friendly web application for managing lunch orders built with Next.js, React, and TypeScript. Streamline your team's lunch ordering process with this efficient and scalable solution.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Development](#development)
- [Project Structure](#project-structure)
- [Scripts](#scripts)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

- **Modern UI/UX**: Built with React 19 and Tailwind CSS for a responsive, beautiful interface
- **Type Safety**: Full TypeScript implementation for robust code
- **Performance Optimized**: Leverages Next.js 15 with Turbopack for lightning-fast builds and hot reloading
- **Font Optimization**: Automatic font optimization using Next.js font system with Geist fonts
- **Dark Mode Support**: Built-in dark mode capabilities
- **SEO Friendly**: Server-side rendering and metadata management for better search engine optimization
- **Scalable Architecture**: App Router structure for modern Next.js applications

## 🛠️ Tech Stack

- **Framework**: [Next.js 15.5.3](https://nextjs.org/) - React framework with server-side rendering
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- **UI Library**: [React 19.1.0](https://react.dev/) - Component-based UI library
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) - Utility-first CSS framework
- **Build Tool**: [Turbopack](https://turbo.build/pack) - Next-generation bundler
- **Linting**: [ESLint 9](https://eslint.org/) - Code quality and consistency
- **Font**: [Geist](https://vercel.com/font) - Optimized font family by Vercel

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 20 or higher ([Download](https://nodejs.org/))
- **npm**: Usually comes with Node.js (or use yarn/pnpm/bun)
- **Git**: For version control ([Download](https://git-scm.com/))

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/brakower/Lunch-Order-App.git
cd Lunch-Order-App
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

The page will automatically reload when you make changes to the code.

## 💻 Development

### File Structure

```
Lunch-Order-App/
├── src/
│   └── app/
│       ├── layout.tsx      # Root layout component
│       ├── page.tsx        # Home page
│       ├── globals.css     # Global styles
│       └── favicon.ico     # App icon
├── public/                 # Static assets
├── package.json           # Project dependencies
├── tsconfig.json          # TypeScript configuration
├── next.config.ts         # Next.js configuration
├── tailwind.config.ts     # Tailwind CSS configuration
└── eslint.config.mjs      # ESLint configuration
```

### Editing Pages

Start by editing `src/app/page.tsx`. The page will auto-update as you save your changes.

### Adding New Routes

Create new folders and `page.tsx` files in the `src/app` directory:

```
src/app/orders/page.tsx     → /orders route
src/app/menu/page.tsx       → /menu route
```

### Styling

This project uses Tailwind CSS for styling. Add utility classes directly to your components:

```tsx
<div className="flex items-center justify-center min-h-screen">
  <h1 className="text-4xl font-bold">Hello World</h1>
</div>
```

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server with Turbopack |
| `npm run build` | Build the application for production |
| `npm start` | Start the production server |
| `npm run lint` | Run ESLint to check code quality |

## 🌐 Deployment

### Deploy on Vercel (Recommended)

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app).

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com/new)
3. Vercel will automatically detect Next.js and configure the build settings
4. Click "Deploy"

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/brakower/Lunch-Order-App)

### Other Deployment Options

- **Self-Hosted**: Build with `npm run build` and deploy the `.next` folder
- **Docker**: Create a Dockerfile for containerized deployment
- **Static Export**: Configure for static site generation if needed

For more details, check the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Run `npm run lint` before committing
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 📞 Support

If you have any questions or run into issues:

- Open an [Issue](https://github.com/brakower/Lunch-Order-App/issues)
- Check the [Next.js Documentation](https://nextjs.org/docs)
- Visit the [Next.js GitHub Repository](https://github.com/vercel/next.js)

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Fonts by [Vercel](https://vercel.com/font)

---

**Made with ❤️ for better lunch ordering experiences**
