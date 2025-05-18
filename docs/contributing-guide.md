# Contributing Guide

Thank you for your interest in contributing to the ChatGPT UI project! This guide will help you understand the contribution process and how to get started.

## Code of Conduct

Please be respectful and considerate of others when contributing to this project. We aim to foster an inclusive and welcoming community.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** to your local machine
3. **Set up the development environment** as described in the [Setup Guide](./setup-guide.md)

## Contribution Workflow

1. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```
   or
   ```bash
   git checkout -b fix/issue-you-are-fixing
   ```

2. **Make your changes** following the coding guidelines below

3. **Test your changes** by running the application locally

4. **Commit your changes** with a clear and descriptive commit message:
   ```bash
   git commit -m "Add feature: your feature description"
   ```

5. **Push your branch** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a pull request** from your fork to the main repository

## Coding Guidelines

### General

- Follow existing code style and patterns
- Write clean, readable, and maintainable code
- Keep changes focused and avoid scope creep
- Document your code appropriately

### Frontend (Vue.js)

- Follow Vue.js best practices and style guide
- Use composition API for new components
- Keep components focused on a single responsibility
- Use props and events for component communication
- Style components consistently with the existing design

### Backend (Express.js)

- Follow RESTful API design principles
- Validate input data appropriately
- Handle errors consistently
- Use ES modules syntax
- Document new API endpoints

### Commit Messages

Use clear and meaningful commit messages with a format like:
```
[Type]: Short description

Longer description if necessary
```

Where `[Type]` is one of:
- `Feature`: New functionality
- `Fix`: Bug fixes
- `Docs`: Documentation changes
- `Style`: Formatting, styling changes
- `Refactor`: Code restructuring without changing functionality
- `Test`: Adding or updating tests
- `Chore`: Maintenance tasks, dependencies, etc.

## Pull Request Process

1. Ensure your PR addresses a specific issue or adds a specific feature
2. Provide a clear description of the changes in your PR
3. Make sure all tests pass
4. Be open to feedback and be willing to make changes if requested
5. Be patient—maintainers will review your PR as soon as possible

## Reporting Issues

If you find a bug or have a feature request, please create an issue on GitHub:

1. Use a clear and descriptive title
2. Describe the issue in detail
3. Include steps to reproduce (for bugs)
4. Include expected behavior
5. Include screenshots if applicable
6. Specify your environment (browser, OS, etc.)

## Development Environment

### Required Tools

- Node.js (v14+)
- npm (v6+)
- Git

### Recommended Setup

- Visual Studio Code with the following extensions:
  - Volar (Vue.js support)
  - ESLint
  - Prettier
- Chrome or Firefox with Vue DevTools extension

## Project Structure

Understand the project structure before contributing:

```
chatgpt-ui/
├── src/                  # Frontend source code
│   ├── components/       # Vue components
│   ├── services/         # API and database services
│   └── assets/           # Static assets
├── server.js             # Express API server
├── dev.js                # Development script
└── docs/                 # Documentation
```

## Feature Ideas

If you're looking for ways to contribute, consider these potential enhancements:

- User authentication system
- Theme customization options
- Message formatting improvements
- Export/import functionality
- Integration with actual AI models
- Keyboard shortcuts
- Accessibility improvements
- Mobile app wrapper

Thank you for contributing to the ChatGPT UI project! 