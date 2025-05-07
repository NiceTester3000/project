let itemCount = 1;

// Добавление нового товара
document.getElementById('add-item').addEventListener('click', () => {
  itemCount++;
  const itemDiv = document.createElement('div');
  itemDiv.className = 'item mb-4 p-4 bg-gray-800 rounded';
  itemDiv.innerHTML = `
    <h2 class="text-lg font-semibold text-red-600">Товар ${itemCount}</h2>
    <div class="grid grid-cols-1 gap-4">
      <div>
        <label class="block text-sm font-medium">Наименование (обязательно)</label>
        <input type="text" name="name" class="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white" required>
      </div>
      <div>
        <label class="block text-sm font-medium">Ссылка на товар/контакт</label>
        <input type="text" name="link" class="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white">
      </div>
      <div>
        <label class="block text-sm font-medium">Фото товара</label>
        <input type="file" name="photo" accept="image/*" class="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white">
      </div>
      <div>
        <label class="block text-sm font-medium">Цвет</label>
        <input type="text" name="color" class="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white">
      </div>
      <div>
        <label class="block text-sm font-medium">Размер</label>
        <input type="text" name="size" class="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white">
      </div>
      <div>
        <label class="block text-sm font-medium">Количество</label>
        <input type="number" name="quantity" min="1" class="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white" required>
      </div>
      <div>
        <label class="block text-sm font-medium">Цена за 1 ед. (юаней)</label>
        <input type="number" name="price" min="0" step="0.01" class="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white" required>
      </div>
      ${itemCount > 2 ? '<button class="remove-item bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Удалить товар</button>' : ''}
    </div>
  `;
  document.getElementById('items').appendChild(itemDiv);

  // Обновление кнопок удаления
  updateRemoveButtons();
});

// Удаление товара
function updateRemoveButtons() {
  const items = document.querySelectorAll('.item');
  items.forEach((item, index) => {
    const removeButton = item.querySelector('.remove-item');
    if (items.length > 2 && !removeButton) {
      const button = document.createElement('button');
      button.className = 'remove-item bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700';
      button.textContent = 'Удалить товар';
      item.querySelector('.grid').appendChild(button);
    } else if (items.length <= 2 && removeButton) {
      removeButton.remove();
    }
  });

  document.querySelectorAll('.remove-item').forEach(button => {
    button.addEventListener('click', () => {
      button.closest('.item').remove();
      itemCount--;
      updateItemNumbers();
      updateRemoveButtons();
    });
  });
}

// Обновление номеров товаров
function updateItemNumbers() {
  document.querySelectorAll('.item').forEach((item, index) => {
    item.querySelector('h2').textContent = `Товар ${index + 1}`;
  });
}

// Предпросмотр
document.getElementById('preview').addEventListener('click', () => {
  const items = collectItems();
  const previewTable = document.getElementById('preview-table');
  previewTable.innerHTML = '';
  const serviceFee = items.length < 10 ? 30 : items.length <= 20 ? 20 : 15;

  items.forEach((item, index) => {
    const totalPrice = (parseFloat(item.price) * parseInt(item.quantity)) + serviceFee;
    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="p-2">${index + 1}</td>
      <td class="p-2">${item.name}</td>
      <td class="p-2"><a href="${item.link}" class="text-blue-400">${item.link}</a></td>
      <td class="p-2">${item.photo ? 'Фото загружено' : ''}</td>
      <td class="p-2">${item.color}</td>
      <td class="p-2">${item.size}</td>
      <td class="p-2">${item.quantity}</td>
      <td class="p-2">${item.price}</td>
      <td class="p-2">${serviceFee}</td>
      <td class="p-2">${totalPrice.toFixed(2)}</td>
    `;
    previewTable.appendChild(row);
  });

  document.getElementById('preview-section').classList.remove('hidden');
});

// Сбор данных формы
function collectItems() {
  const items = [];
  document.querySelectorAll('.item').forEach(item => {
    const inputs = item.querySelectorAll('input');
    items.push({
      name: inputs[0].value,
      link: inputs[1].value,
      photo: inputs[2].files[0],
      color: inputs[3].value,
      size: inputs[4].value,
      quantity: inputs[5].value,
      price: inputs[6].value,
    });
  });
  return items;
}

// Отправка формы
document.getElementById('submit').addEventListener('click', () => {
  const username = document.getElementById('username').value;
  const items = collectItems();

  if (!username || items.some(item => !item.name || !item.quantity || !item.price)) {
    alert('Заполните все обязательные поля!');
    return;
  }

  const formData = new FormData();
  items.forEach(item => {
    if (item.photo) {
      formData.append('photos', item.photo);
    }
  });
  formData.append('data', JSON.stringify({ username, items }));
  formData.append('chatId', window.Telegram.WebApp.initDataUnsafe.user.id);

  fetch('/submit', {
    method: 'POST',
    body: formData,
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        window.Telegram.WebApp.close();
      } else {
        alert('Ошибка при отправке');
      }
    })
    .catch(() => alert('Ошибка сервера'));
});

// Инициализация Telegram Web App
window.Telegram.WebApp.ready();