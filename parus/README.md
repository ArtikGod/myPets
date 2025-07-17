# Product Categories API

A professional REST API for managing products and categories with TypeScript, Express.js, and PostgreSQL.

## Features

-   Category management with 3-level hierarchy support
-   Product CRUD operations
-   Active categories with product counts
-   Products grouped by category hierarchy
-   Full test coverage
-   OpenAPI/Swagger documentation

## Tech Stack

-   Node.js with TypeScript
-   Express.js
-   PostgreSQL with Knex.js
-   Jest for testing
-   OpenAPI/Swagger for documentation

## Prerequisites

-   Node.js 20.x
-   PostgreSQL 14.x
-   Docker and Docker Compose (optional)

## Setup

### Local Development

1. Install dependencies:

    ```bash
    npm install
    ```

2. Set up environment variables:

    ```bash
    cp .env.example .env
    # Edit .env with your database credentials
    ```

3. Initialize the database:

    ```bash
    npm run db:migrate
    ```

4. Start the development server:
    ```bash
    npm run dev
    ```

### Docker Setup

1. Build and start containers:

    ```bash
    docker-compose up -d
    ```

2. Run database migrations:
    ```bash
    docker-compose exec app npm run db:migrate
    ```

## API Documentation

Access the Swagger documentation at: http://localhost:3000/docs

## Testing

Run the test suite:

```bash
npm test
```

Run tests with coverage:

```bash
npm run test:coverage
```

## API Endpoints

### Categories

-   `GET /categories` - List all active categories with product counts
-   `POST /categories` - Create a new category
-   `PUT /categories/:id` - Update a category
-   `DELETE /categories/:id` - Delete a category
-   `GET /categories/hierarchy` - Get category hierarchy with products

### Products

-   `GET /products` - List all products
-   `POST /products` - Create a new product
-   `PUT /products/:id` - Update a product
-   `DELETE /products/:id` - Delete a product
-   `GET /products/by-category/:categoryId` - Get products in a category

## Database Schema

### Categories Table

```sql
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  parent_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
  level INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Products Table

```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Project Structure

```
.
├── src/
│   ├── constants/      # Configuration and constants
│   ├── controllers/    # Route handlers
│   ├── database/       # Database setup and migrations
│   ├── services/       # Business logic
│   ├── types/         # TypeScript type definitions
│   ├── index.ts       # Application entry point
│   └── routes.ts      # Route definitions
├── tests/             # Test files
├── Dockerfile         # Docker configuration
├── docker-compose.yml # Docker Compose configuration
└── package.json       # Project dependencies
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT
