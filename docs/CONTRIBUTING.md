# Contributing to Seantral

Thank you for your interest in contributing to Seantral! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

Please read and follow our [Code of Conduct](./CODE_OF_CONDUCT.md).

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Install dependencies**:

```bash
# Install pnpm if you don't have it
npm install -g pnpm

# Install dependencies
pnpm install
```

## Development Workflow

### Branch Naming Convention

- `feat/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `chore/` - Maintenance tasks
- `refactor/` - Code changes that neither fix bugs nor add features
- `test/` - Adding or updating tests

Example: `feat/add-buoy-markers`

### Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Examples:
- `feat(map): add buoy markers to MapLibre layer`
- `fix(api): resolve CORS issues with timeseries endpoint`
- `docs: update architecture diagram`

### Pull Request Process

1. Create a new branch for your feature or fix
2. Make your changes, adhering to the code style guidelines
3. Add tests for your changes
4. Ensure all tests pass
5. Update documentation as needed
6. Submit a pull request against the `main` branch
7. Include screenshots for UI changes

## Project Structure

```
/ (root)
├─ apps/
│   ├─ web/                 # Next.js 15 frontend
│   └─ api/                 # FastAPI or Next API handlers
├─ packages/
│   ├─ ui/                  # Shared React components
│   ├─ data-pipeline/       # Python ingestion & ETL libs
│   └─ models/              # ML model code & notebooks
├─ infra/                   # IaC (Pulumi/Terraform)
└─ docs/                    # Documentation
```

## Development Setup

### Frontend (Next.js)

```bash
# Start the development server
pnpm dev
```

This will start the Next.js development server at `http://localhost:3000`.

### API (FastAPI)

```bash
# Navigate to the API directory
cd apps/api

# Start the development server
pnpm dev
```

This will start the FastAPI development server at `http://localhost:3001`.

## Testing

### Frontend Tests

```bash
# Run frontend tests
pnpm test
```

### API Tests

```bash
# Run API tests
cd apps/api
pytest
```

## Linting and Formatting

### TypeScript/JavaScript

```bash
# Run ESLint
pnpm lint

# Run Prettier
pnpm format
```

### Python

```bash
# Run Ruff for linting
cd apps/api  # or packages/data-pipeline
ruff check .

# Run Black for formatting
black .
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the required values:

```bash
cp .env.example .env.local
```

## Documentation

We use Markdown for documentation, stored in the `docs/` directory. Please update the documentation when you make changes to the codebase.

## License

By contributing to Seantral, you agree that your contributions will be licensed under the project's [MIT License](../LICENSE).

## Getting Help

If you have questions or need help, please:

1. Check the [documentation](./README.md)
2. Open an issue on GitHub
3. Reach out to the maintainers via email

Thank you for your contributions! 