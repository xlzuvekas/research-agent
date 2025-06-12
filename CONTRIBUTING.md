# Contributing to Research Agent

We're excited that you're interested in contributing to Research Agent! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Set up the development environment following the README
4. Create a new branch for your feature/fix

## Development Setup

```bash
# Clone the repo
git clone https://github.com/xlzuvekas/research-agent.git
cd research-agent

# Set up the agent
cd agent
cp .env.example .env  # Add your API keys
pip install -r requirements.txt

# Set up the frontend
cd ../frontend
pnpm install
cp .env.example .env  # Add your API keys
```

## Code Style

### Python (Agent)
- Follow PEP 8
- Use type hints where possible
- Add docstrings to functions and classes
- Keep functions focused and small

### TypeScript/React (Frontend)
- Use TypeScript for all new code
- Follow the existing component patterns
- Use functional components with hooks
- Keep components focused and reusable

## Making Changes

1. **Create a branch**: `git checkout -b feature/your-feature-name`
2. **Make your changes**: Follow the code style guidelines
3. **Test your changes**: Ensure existing tests pass and add new ones
4. **Commit your changes**: Use clear, descriptive commit messages
5. **Push to your fork**: `git push origin feature/your-feature-name`
6. **Create a Pull Request**: Provide a clear description of the changes

## Commit Message Guidelines

Follow the conventional commits specification:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Test additions or modifications
- `chore:` Maintenance tasks

Example: `feat: add support for PDF export`

## Pull Request Process

1. Ensure your PR description clearly describes the problem and solution
2. Include the relevant issue number if applicable
3. Update documentation if needed
4. Add tests for new functionality
5. Ensure all tests pass
6. Request review from maintainers

## Testing

### Agent Tests
```bash
cd agent
pytest  # Run all tests
pytest tests/test_specific.py  # Run specific test
```

### Frontend Tests
```bash
cd frontend
pnpm test  # Run all tests
pnpm test:watch  # Run tests in watch mode
```

## Reporting Issues

- Use the GitHub issue tracker
- Check if the issue already exists
- Provide clear reproduction steps
- Include system information
- Add relevant logs or screenshots

## Feature Requests

- Check the ROADMAP.md for planned features
- Open an issue with the "enhancement" label
- Clearly describe the use case
- Discuss implementation approach if you have ideas

## Questions?

- Check existing issues and discussions
- Join our community discussions
- Reach out to maintainers

Thank you for contributing to Research Agent! 🚀