# Contributing to apix

Thank you for your interest in contributing!

## Development Setup

```bash
git clone https://github.com/devaloi/apix.git
cd apix
npm install
```

### Prerequisites

- Node.js 20+
- PostgreSQL (or use Docker Compose: `docker-compose up -d`)

## Running Tests

```bash
npm test
npm run lint
npm run lint && npm test
```

## Pull Request Guidelines

- One feature or fix per PR
- Run `npm run lint && npm test` before submitting
- Add tests for new functionality
- Update README if adding a new feature

## Reporting Issues

Open a GitHub issue with your language/runtime version, steps to reproduce, and expected vs actual behavior.
