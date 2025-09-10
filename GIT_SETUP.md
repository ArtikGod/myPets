# Настройка Git репозитория

## Текущее состояние

-   ✅ Локальный Git репозиторий инициализирован
-   ✅ Создана ветка `demlabs`
-   ✅ Все файлы закоммичены
-   ❌ Удаленный репозиторий не настроен

## Варианты настройки удаленного репозитория

### Вариант 1: GitHub

1. Создайте новый репозиторий на GitHub
2. Добавьте удаленный репозиторий:
    ```bash
    git remote add origin https://github.com/artikgod/mypets.git
    ```
3. Запушьте ветку demlabs:
    ```bash
    git push -u origin demlabs
    ```

### Вариант 2: GitLab

1. Создайте новый проект на GitLab
2. Добавьте удаленный репозиторий:
    ```bash
    git remote add origin https://gitlab.com/ваш-username/название-репозитория.git
    ```
3. Запушьте ветку demlabs:
    ```bash
    git push -u origin demlabs
    ```

### Вариант 3: Bitbucket

1. Создайте новый репозиторий на Bitbucket
2. Добавьте удаленный репозиторий:
    ```bash
    git remote add origin https://bitbucket.org/ваш-username/название-репозитория.git
    ```
3. Запушьте ветку demlabs:
    ```bash
    git push -u origin demlabs
    ```

## Полезные команды

### Проверить текущие ветки:

```bash
git branch -a
```

### Проверить удаленные репозитории:

```bash
git remote -v
```

### Переключиться на главную ветку:

```bash
git checkout main
```

### Переключиться обратно на ветку demlabs:

```bash
git checkout demlabs
```

### Запушить все ветки:

```bash
git push origin --all
```

## Примечание

После настройки удаленного репозитория вы сможете:

-   Пушить изменения: `git push origin demlabs`
-   Пуллить изменения: `git pull origin demlabs`
-   Создавать Pull Request/Merge Request для слияния веток
