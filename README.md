# DevHelper

A modern, lightweight Dev & Scripting Utilities web application focused on daily-use tools for developers and IT engineers.

## Features

### Core Tools
- **JSON Tools**: Formatter, minifier, validator, and diff
- **XML Tools**: Formatter, minifier, validator, and XPath tester
- **YAML Tools**: Formatter, validator, and YAML→JSON converter
- **Encoding & Hashing**: Base64, URL encode/decode, MD5, SHA-1, SHA-256
- **Regex Tester**: Pattern testing with match highlighting

### SQL Formatter (Primary Feature)
- Format and minify SQL queries
- Support for SELECT, INSERT, UPDATE, DELETE
- JOINs, subqueries, CTEs
- Customizable indentation and keyword casing

## Tech Stack

- React + TypeScript
- Vite
- Monaco Editor
- Tailwind CSS
- sql-formatter, fast-xml-parser, js-yaml

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Deployment

This app is configured for Railway.com deployment.

### Railway Deployment Steps:

1. **Push to GitHub**: Ensure your code is in a GitHub repository
2. **Connect to Railway**: 
   - Go to [Railway](https://railway.app)
   - Create a new project
   - Connect your GitHub repository
3. **Configure Build**:
   - Railway will automatically detect the project
   - Build command: `npm run build`
   - Start command: `npm start`
   - The app will be served on the PORT environment variable (Railway sets this automatically)
4. **Deploy**: Railway will automatically build and deploy your app

The app uses Express to serve static files from the `dist` directory after building with Vite.

## License

MIT

