# Руководство разработчика - AutoRent API

Подробное руководство для разработчиков, работающих с проектом AutoRent API.

## 🏗 Архитектура проекта

### Структура модулей

```
src/
├── app.ts              # Основное Express приложение
├── server.ts           # Точка входа сервера
├── swagger.ts          # Конфигурация API документации
├── connectdb.ts        # Подключение к MongoDB
├── middleware.ts       # Общие middleware функции
├── utils.ts            # Утилиты и вспомогательные функции
├── constants.ts        # Константы приложения
├── routes.ts           # Основные маршруты
├── telegrambot.ts      # Telegram бот интеграция
├── users/              # Модуль пользователей
│   ├── userModel.ts    # Mongoose модель
│   ├── userService.ts  # Бизнес-логика
│   └── userRoutes.ts   # HTTP маршруты
├── vehicle/            # Модуль автомобилей
│   ├── vehicleModel.ts
│   ├── vehicleService.ts
│   └── vehicleRoutes.ts
└── reservations/       # Модуль бронирований
    ├── reservationsModel.ts
    ├── reservationsService.ts
    └── reservationsRoutes.ts
```

### Паттерны проектирования

1. **MVC (Model-View-Controller)**

    - Model: Mongoose схемы в `*Model.ts`
    - Controller: HTTP обработчики в `*Routes.ts`
    - Service: Бизнес-логика в `*Service.ts`

2. **Dependency Injection**

    - Сервисы инжектируются в контроллеры
    - Модели инжектируются в сервисы

3. **Middleware Pattern**
    - Авторизация, валидация, логирование

## 🛠 Настройка среды разработки

### Требования

-   Node.js >= 16.0.0
-   MongoDB >= 4.4
-   TypeScript >= 4.5
-   Git

### Установка

```bash
# Клонирование репозитория
git clone <repository-url>
cd autoRent

# Установка зависимостей
npm install

# Настройка окружения
cp .env.template .env
# Отредактируйте .env файл с вашими настройками

# Запуск в режиме разработки
npm run dev
```

### Настройка IDE

#### VS Code

Рекомендуемые расширения:

```json
{
    "recommendations": [
        "ms-vscode.vscode-typescript-next",
        "bradlc.vscode-tailwindcss",
        "esbenp.prettier-vscode",
        "ms-vscode.vscode-json",
        "mongodb.mongodb-vscode"
    ]
}
```

Настройки проекта (`.vscode/settings.json`):

```json
{
    "typescript.preferences.importModuleSpecifier": "relative",
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "typescript.updateImportsOnFileMove.enabled": "always"
}
```

## 📝 Стандарты кодирования

### TypeScript

```typescript
// Используйте строгую типизацию
interface User {
    _id: string;
    username: string;
    email: string;
    password: string;
    licens: License[];
    isAdmin: boolean;
}

// Используйте enum для констант
enum ReservationStatus {
    DONE = "Done",
    CANCELED = "Canceled",
    COMPLETED = "Completed",
}

// Используйте generic типы
interface ApiResponse<T> {
    data: T;
    message?: string;
    error?: string;
}
```

### Именование

```typescript
// Переменные и функции - camelCase
const userName = "john_doe";
const getUserById = (id: string) => {
    /* ... */
};

// Классы и интерфейсы - PascalCase
class UserService {
    /* ... */
}
interface VehicleData {
    /* ... */
}

// Константы - UPPER_SNAKE_CASE
const MAX_RENTAL_DAYS = 28;
const DEFAULT_PORT = 3200;

// Файлы - camelCase с суффиксом типа
userService.ts;
vehicleModel.ts;
reservationsRoutes.ts;
```

### Структура функций

```typescript
/**
 * Создает нового пользователя в системе
 * @param userData - данные пользователя
 * @returns Promise с созданным пользователем
 * @throws ValidationError если данные невалидны
 */
export const createUser = async (userData: CreateUserData): Promise<User> => {
    // 1. Валидация входных данных
    if (!userData.email || !userData.username) {
        throw new ValidationError("Email and username are required");
    }

    // 2. Бизнес-логика
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
        throw new ConflictError("User already exists");
    }

    // 3. Создание и сохранение
    const user = new User(userData);
    await user.save();

    // 4. Возврат результата
    return user.toObject();
};
```

## 🧪 Тестирование

### Структура тестов

```
__tests__/
├── unit/                   # Unit тесты
│   ├── userService.test.ts
│   ├── vehicleService.test.ts
│   └── middleware.test.ts
├── integration/            # Integration тесты
│   ├── users.test.ts
│   ├── vehicle.test.ts
│   └── reservations.test.ts
└── performance/            # Performance тесты
    ├── autocannon.users.test.ts
    ├── autocannon.vehicle.test.ts
    └── autocannon.reservations.test.ts
```

### Написание тестов

#### Unit тесты

```typescript
import { createUser } from "../src/users/userService";
import { User } from "../src/users/userModel";

// Мокирование зависимостей
jest.mock("../src/users/userModel");
const mockUser = User as jest.Mocked<typeof User>;

describe("UserService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("createUser", () => {
        it("should create user with valid data", async () => {
            // Arrange
            const userData = {
                username: "testuser",
                email: "test@example.com",
                password: "password123",
            };

            mockUser.findOne.mockResolvedValue(null);
            mockUser.prototype.save.mockResolvedValue(userData);

            // Act
            const result = await createUser(userData);

            // Assert
            expect(result).toEqual(userData);
            expect(mockUser.findOne).toHaveBeenCalledWith({
                email: userData.email,
            });
        });

        it("should throw error for duplicate email", async () => {
            // Arrange
            const userData = {
                /* ... */
            };
            mockUser.findOne.mockResolvedValue({ email: userData.email });

            // Act & Assert
            await expect(createUser(userData)).rejects.toThrow(
                "User already exists"
            );
        });
    });
});
```

#### Integration тесты

```typescript
import request from "supertest";
import { app } from "../src/app";
import { connectDb } from "../src/connectdb";

describe("Users API", () => {
    beforeAll(async () => {
        await connectDb();
    });

    afterEach(async () => {
        // Очистка тестовых данных
        await User.deleteMany({});
    });

    describe("POST /users", () => {
        it("should create new user", async () => {
            const userData = {
                username: "testuser",
                email: "test@example.com",
                password: "password123",
            };

            const response = await request(app)
                .post("/users")
                .send(userData)
                .expect(201);

            expect(response.body).toHaveProperty("_id");
            expect(response.body.username).toBe(userData.username);
            expect(response.body.email).toBe(userData.email);
        });
    });
});
```

### Запуск тестов

```bash
# Все тесты
npm test

# Только unit тесты
npm run test:unit

# Только integration тесты
npm run test:integration

# С покрытием кода
npm run test:cov

# В watch режиме
npm test -- --watch

# Конкретный тест
npm test -- --testNamePattern="createUser"
```

## 🔧 Добавление новых функций

### Создание нового модуля

1. **Создайте директорию модуля:**

    ```bash
    mkdir src/newModule
    ```

2. **Создайте файлы модуля:**

    ```bash
    touch src/newModule/newModuleModel.ts
    touch src/newModule/newModuleService.ts
    touch src/newModule/newModuleRoutes.ts
    ```

3. **Определите модель:**

    ```typescript
    // newModuleModel.ts
    import mongoose from "mongoose";

    interface INewModule {
        name: string;
        description: string;
        createdAt: Date;
    }

    const newModuleSchema = new mongoose.Schema<INewModule>({
        name: { type: String, required: true },
        description: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
    });

    export const NewModule = mongoose.model<INewModule>(
        "NewModule",
        newModuleSchema
    );
    export type { INewModule };
    ```

4. **Создайте сервис:**

    ```typescript
    // newModuleService.ts
    import { NewModule, INewModule } from "./newModuleModel";

    export const createNewModule = async (
        data: Partial<INewModule>
    ): Promise<INewModule> => {
        const newModule = new NewModule(data);
        return await newModule.save();
    };

    export const getAllNewModules = async (): Promise<INewModule[]> => {
        return await NewModule.find();
    };
    ```

5. **Создайте маршруты:**

    ```typescript
    // newModuleRoutes.ts
    import { Router } from "express";
    import { body, validationResult } from "express-validator";
    import { createNewModule, getAllNewModules } from "./newModuleService";

    const router = Router();

    /**
     * @swagger
     * /newmodule:
     *   post:
     *     summary: Create new module
     *     tags: [NewModule]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *               description:
     *                 type: string
     *     responses:
     *       201:
     *         description: Module created successfully
     */
    router.post(
        "/",
        [
            body("name").notEmpty().withMessage("Name is required"),
            body("description")
                .notEmpty()
                .withMessage("Description is required"),
        ],
        async (req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            try {
                const newModule = await createNewModule(req.body);
                res.status(201).json(newModule);
            } catch (error) {
                res.status(500).json({ error: "Internal server error" });
            }
        }
    );

    export { router as newModuleRoutes };
    ```

6. **Подключите маршруты в app.ts:**

    ```typescript
    import { newModuleRoutes } from "./newModule/newModuleRoutes";

    app.use("/newmodule", newModuleRoutes);
    ```

### Добавление middleware

```typescript
// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import { User } from "../users/userModel";

export const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res
                .status(401)
                .json({ error: "Authorization header is required" });
        }

        const user = await User.findById(authHeader);
        if (!user) {
            return res.status(401).json({ error: "Invalid user ID" });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

// Использование
router.get("/protected", authMiddleware, (req, res) => {
    res.json({ message: "Protected route", user: req.user });
});
```

## 📊 Мониторинг и логирование

### Настройка логирования

```typescript
// src/utils/logger.ts
import winston from "winston";

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: "autorent-api" },
    transports: [
        new winston.transports.File({
            filename: "logs/error.log",
            level: "error",
        }),
        new winston.transports.File({ filename: "logs/combined.log" }),
    ],
});

if (process.env.NODE_ENV !== "production") {
    logger.add(
        new winston.transports.Console({
            format: winston.format.simple(),
        })
    );
}

export { logger };
```

### Использование логгера

```typescript
import { logger } from "../utils/logger";

export const createUser = async (userData: CreateUserData): Promise<User> => {
    logger.info("Creating new user", { email: userData.email });

    try {
        const user = await User.create(userData);
        logger.info("User created successfully", { userId: user._id });
        return user;
    } catch (error) {
        logger.error("Failed to create user", {
            error: error.message,
            userData,
        });
        throw error;
    }
};
```

## 🚀 Деплой и CI/CD

### Docker

```dockerfile
# Dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3200

CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: "3.8"
services:
    app:
        build: .
        ports:
            - "3200:3200"
        environment:
            - NODE_ENV=production
            - DB_CONNECTION_STRING=mongodb://mongo:27017/auto
        depends_on:
            - mongo

    mongo:
        image: mongo:4.4
        ports:
            - "27017:27017"
        volumes:
            - mongo_data:/data/db

volumes:
    mongo_data:
```

### GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI/CD

on:
    push:
        branches: [main, develop]
    pull_request:
        branches: [main]

jobs:
    test:
        runs-on: ubuntu-latest

        services:
            mongodb:
                image: mongo:4.4
                ports:
                    - 27017:27017

        steps:
            - uses: actions/checkout@v2

            - name: Setup Node.js
              uses: actions/setup-node@v2
              with:
                  node-version: "16"
                  cache: "npm"

            - name: Install dependencies
              run: npm ci

            - name: Run linter
              run: npm run lint

            - name: Run tests
              run: npm test
              env:
                  DB_CONNECTION_STRING: mongodb://localhost:27017/auto_test

            - name: Run performance tests
              run: npm run test:performance

    deploy:
        needs: test
        runs-on: ubuntu-latest
        if: github.ref == 'refs/heads/main'

        steps:
            - name: Deploy to production
              run: echo "Deploy to production"
```

## 🔒 Безопасность

### Валидация входных данных

```typescript
import { body, param, query } from "express-validator";

// Валидация для создания пользователя
export const validateCreateUser = [
    body("username")
        .isLength({ min: 3, max: 50 })
        .withMessage("Username must be between 3 and 50 characters")
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage(
            "Username can only contain letters, numbers, and underscores"
        ),

    body("email")
        .isEmail()
        .withMessage("Must be a valid email")
        .normalizeEmail(),

    body("password")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage(
            "Password must contain at least one lowercase letter, one uppercase letter, and one number"
        ),
];

// Валидация MongoDB ObjectId
export const validateObjectId = param("id")
    .isMongoId()
    .withMessage("Invalid ID format");
```

### Санитизация данных

```typescript
import mongoSanitize from "express-mongo-sanitize";
import helmet from "helmet";

// Защита от NoSQL инъекций
app.use(mongoSanitize());

// Базовая защита заголовков
app.use(helmet());

// Ограничение размера запроса
app.use(express.json({ limit: "10mb" }));
```

## 📈 Оптимизация производительности

### Индексы базы данных

```javascript
// Создание индексов в MongoDB
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 });
db.vehicles.createIndex({ make: 1, model: 1 });
db.vehicles.createIndex({ price: 1 });
db.vehicles.createIndex({ year: 1 });
db.reservations.createIndex({ userId: 1 });
db.reservations.createIndex({ vehicleId: 1 });
db.reservations.createIndex({ leaseStart: 1, leaseEnd: 1 });
```

### Кэширование

```typescript
import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 600 }); // 10 минут

export const getCachedVehicles = async (filters: any): Promise<Vehicle[]> => {
    const cacheKey = `vehicles_${JSON.stringify(filters)}`;

    let vehicles = cache.get<Vehicle[]>(cacheKey);
    if (!vehicles) {
        vehicles = await Vehicle.find(filters);
        cache.set(cacheKey, vehicles);
    }

    return vehicles;
};
```

### Пагинация

```typescript
export const getVehiclesPaginated = async (
    page: number = 1,
    limit: number = 20,
    filters: any = {}
): Promise<{ vehicles: Vehicle[]; total: number; pages: number }> => {
    const skip = (page - 1) * limit;

    const [vehicles, total] = await Promise.all([
        Vehicle.find(filters).skip(skip).limit(limit),
        Vehicle.countDocuments(filters),
    ]);

    return {
        vehicles,
        total,
        pages: Math.ceil(total / limit),
    };
};
```

## 🤝 Вклад в проект

### Git workflow

1. **Создайте feature branch:**

    ```bash
    git checkout -b feature/new-feature
    ```

2. **Внесите изменения и коммиты:**

    ```bash
    git add .
    git commit -m "feat: add new feature"
    ```

3. **Пушьте изменения:**

    ```bash
    git push origin feature/new-feature
    ```

4. **Создайте Pull Request**

### Стандарты коммитов

Используйте [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: добавить новую функцию
fix: исправить баг
docs: обновить документацию
style: изменения форматирования
refactor: рефакторинг кода
test: добавить или изменить тесты
chore: изменения в сборке или вспомогательных инструментах
```

### Code Review

Перед мержем убедитесь, что:

-   [ ] Все тесты проходят
-   [ ] Код покрыт тестами
-   [ ] Документация обновлена
-   [ ] Нет конфликтов с main веткой
-   [ ] Код соответствует стандартам проекта

## 📚 Полезные ресурсы

-   [Express.js Documentation](https://expressjs.com/)
-   [Mongoose Documentation](https://mongoosejs.com/)
-   [TypeScript Handbook](https://www.typescriptlang.org/docs/)
-   [Jest Documentation](https://jestjs.io/docs/getting-started)
-   [Swagger/OpenAPI Specification](https://swagger.io/specification/)
-   [MongoDB Best Practices](https://docs.mongodb.com/manual/administration/production-notes/)

---

Этот документ является живым руководством и должен обновляться по мере развития проекта.
