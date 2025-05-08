const express = require('express');
const { Telegraf } = require('telegraf');
const axios = require('axios');
const ExcelJS = require('exceljs');
const multer = require('multer');
const FormData = require('form-data');
const path = require('path');
const app = express();

// Настройка Telegram-бота
const bot = new Telegraf('7358244891:AAHBfSxJkFNugJIfvq8-MgR6Z--aG0RevhI');

// Настройка загрузки файлов
const upload = multer({ storage: multer.memoryStorage() });

// Парсинг JSON и статические файлы с индексом
app.use(express.json());
app.use(express.static('../public', { index: 'index.html' }));

// Обработчик корневого пути для загрузки index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Запуск мини-приложения
bot.command('start', (ctx) => {
  console.log('Получена команда /start от:', ctx.from.id);
  ctx.reply('Открыть форму заказа:', {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Открыть форму', web_app: { url: process.env.APP_URL || 'https://project-wa0f.onrender.com' } }],
      ],
    },
  });
});

// Обработка данных формы
app.post('/submit', upload.array('photos'), async (req, res) => {
  try {
    console.log('Получены данные формы:', req.body);
    const { username, items } = JSON.parse(req.body.data);
    const photos = req.files;
    const chatId = req.body.chatId;

    // Загрузка фото на ImgBB
    const photoUrls = [];
    for (const photo of photos) {
      const formData = new FormData();
      formData.append('image', photo.buffer.toString('base64'));
      console.log('Загружаю фото на ImgBB...');
      const response = await axios.post('https://api.imgbb.com/1/upload?key=YOUR_NEW_IMGBB_API_KEY', formData, {
        headers: formData.getHeaders(),
      });
      photoUrls.push(response.data.data.url);
      console.log('Фото загружено:', response.data.data.url);
    }

    // Расчёт услуг в Китае
    const itemCount = items.length;
    let serviceFee;
    if (itemCount < 10) serviceFee = 30;
    else if (itemCount <= 20) serviceFee = 20;
    else serviceFee = 15;
    console.log('Количество товаров:', itemCount, 'Услуги в Китае:', serviceFee);

    // Создание Excel-файла
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Order');
    worksheet.columns = [
      { header: 'Номер позиции', key: 'position', width: 15 },
      { header: 'НАИМЕНОВАНИЕ ТОВАРА ОБЯЗАТЕЛЬНО!', key: 'name', width: 30 },
      { header: 'Ссылка', key: 'link', width: 40 },
      { header: 'Ссылка на фото', key: 'photo', width: 40 },
      { header: 'Цвет', key: 'color', width: 15 },
      { header: 'Размер', key: 'size', width: 15 },
      { header: 'Кол-во', key: 'quantity', width: 10 },
      { header: 'Цена за 1 ед. (юаней)', key: 'price', width: 15 },
      { header: 'Услуги в Китае', key: 'service', width: 15 },
      { header: 'Цена (Юани)', key: 'total', width: 15 },
      { header: 'Выкуплено', key: 'purchased', width: 15 },
      { header: 'Трек', key: 'track', width: 15 },
      { header: 'Возврат', key: 'return', width: 15 },
      { header: 'ГАО', key: 'gao', width: 15 },
    ];

    // Заполнение строк
    items.forEach((item, index) => {
      const photoUrl = photoUrls[index] || '';
      const totalPrice = (parseFloat(item.price) * parseInt(item.quantity)) + serviceFee;
      worksheet.addRow({
        position: index + 1,
        name: item.name,
        link: item.link,
        photo: photoUrl,
        color: item.color,
        size: item.size,
        quantity: parseInt(item.quantity),
        price: parseFloat(item.price),
        service: serviceFee,
        total: totalPrice,
        purchased: '',
        track: '',
        return: '',
        gao: '',
      });
    });

    // Сохранение файла
    console.log('Создаю Excel-файл...');
    const buffer = await workbook.xlsx.writeBuffer();

    // Отправка файла пользователю
    console.log('Отправляю Excel-файл пользователю:', chatId);
    await bot.telegram.sendDocument(chatId, {
      source: buffer,
      filename: `${username}_order.xlsx`,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Ошибка:', error.message);
    res.status(500).json({ error: 'Ошибка обработки' });
  }
});

// Запуск бота и сервера
bot.launch();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});