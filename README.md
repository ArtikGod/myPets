# myPets# URL Shortener Service

A URL shortener service with REST API and React/Vue frontend, built with TypeScript and Docker.

## Features

### Backend

-   Create short URLs with optional expiration and custom alias
-   Redirect to original URLs
-   View URL info (original URL, creation date, click count)
-   Delete short URLs
-   Track click statistics (count and last 5 IP addresses)

### Frontend

-   Create short URLs
-   View URL information
-   Delete URLs
-   View statistics

## Technologies

-   **Backend**: Express.js/NestJS with TypeScript
-   **Database**: PostgreSQL/MySQL/MariaDB with ORM (TypeORM/Prisma/Sequelize)
-   **Frontend**: React/Vue with TypeScript
-   **Containerization**: Docker with docker-compose

## Prerequisites

-   Docker
-   Docker Compose

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/url-shortener.git
    cd url-shortener
    Build and run the containers:
    ```

bash
docker-compose up --build
The services will be available at:

Backend: http://localhost:3000

Frontend: http://localhost:8080

Database: configured in docker-compose

API Endpoints
Method Endpoint Description
POST /shorten Create a short URL
GET /{shortUrl} Redirect to original URL
GET /info/{shortUrl} Get information about a short URL
DELETE /delete/{shortUrl} Delete a short URL
GET /analytics/{shortUrl} Get analytics for a short URL
Example Request
Create a short URL:

bash
curl -X POST -H "Content-Type: application/json" -d '{
"originalUrl": "https://example.com",
"expiresAt": "2023-12-31",
"alias": "example"
}' http://localhost:3000/shorten

Testing
To run tests:

bash
docker-compose run backend npm test
Development
Backend
Located in backend/ directory

Uses Express.js/NestJS with TypeScript

Database configured via ORM

Frontend
Located in frontend/ directory

Uses React/Vue with TypeScript

Connects to backend API

Environment Variables
Backend requires these environment variables (set in docker-compose):

DB_HOST: Database host

DB_PORT: Database port

DB_USER: Database username

DB_PASSWORD: Database password

DB_NAME: Database name

License
MIT

This README provides:

1. Clear project description
2. Installation instructions
3. API documentation
4. Development setup
5. Environment configuration
6. License information

The actual implementation would need to match this structure, with appropriate Dockerfiles and docker-compose.yml configuration.
