# Telegram Order App

Мини-приложение в Telegram для заказа товаров из Китая.

## Требования
- Аккаунт на [Render](https://render.com).
- Аккаунт на [GitHub](https://github.com).
- API-ключ ImgBB (уже настроен: `12f37e73339d58d7b6894b9a0c932c6a`).
- Telegram-бот (токен: `7358244891:AAHBfSxJkFNugJIfvq8-MgR6Z--aG0RevhI`).

## Установка
1. **Клонируйте репозиторий**:
   ```bash
   git clone <your-repo-url>
   cd telegram-order-app
   ```

2. **Установите зависимости**:
   ```bash
   npm install
   ```

3. **Настройте переменные окружения**:
   - Создайте файл `.env` в корне проекта.
   - Добавьте:
     ```
     APP_URL=https://your-render-url.com
     PORT=3000
     ```

4. **Разверните на Render**:
   - Создайте новый сервис Web Service на Render.
   - Выберите репозиторий GitHub.
   - Укажите:
     - Runtime: Node
     - Build Command: `npm install`
     - Start Command: `npm start`
   - Добавьте переменные окружения в настройках Render:
     - `APP_URL`: URL вашего сервиса (например, `https://your-app.onrender.com`).
     - `PORT`: 3000.

5. **Настройте Telegram-бот**:
   - Откройте Telegram, найдите `@BotFather`.
   - Отправьте `/setwebapp` и выберите ваш бот.
   - Укажите URL: `https://your-render-url.com`.

6. **Запустите приложение**:
   - Перейдите к вашему боту, отправьте `/start`.
   - Нажмите "Открыть форму".

## Использование
- Введите ник/имя.
- Заполните данные о товарах (наименование обязательно).
- Добавляйте/удаляйте товары.
- Нажмите "Предпросмотр" для просмотра таблицы.
- Нажмите "Сформировать бланк" для получения Excel-файла.

## Поддержка
Если возникнут вопросы, пишите в Telegram: @your-telegram.