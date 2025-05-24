function toggleForm() {
  const menu = document.getElementById('actionMenu');
  menu.style.display = (menu.style.display === 'flex') ? 'none' : 'flex';
}

function handleAction(action) {
  if (action === 'update') {
    enableEditing();
  } else if (action === 'add') {
    addRow();
  } else if (action === 'delete') {
    deleteRow();
  }
}

function enableEditing() {
  const rows = document.querySelectorAll('#dataTable tbody tr');
  rows.forEach(row => {
    row.querySelectorAll('td').forEach((cell, index) => {
      if (index > 0) {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = cell.textContent;
        cell.innerHTML = '';
        cell.appendChild(input);
      }
    });
  });

  if (!document.getElementById('saveBtn')) {
    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save';
    saveBtn.id = 'saveBtn';
    saveBtn.className = 'save-btn';
    saveBtn.onclick = saveUpdates;
    document.querySelector('.main-content').appendChild(saveBtn);
  }
}

function saveUpdates() {
  const rows = document.querySelectorAll('#dataTable tbody tr');
  rows.forEach(row => {
    const batchId = row.children[0].textContent;
    const batchAge = row.children[1].querySelector('input')?.value || row.children[1].textContent;
    const isHealthGoodText = row.children[2].querySelector('input')?.value || row.children[2].textContent;
    const isHealthGood = isHealthGoodText.toLowerCase() === 'healthy';

    sendUpdateRequest(batchId, batchAge, isHealthGood);

    row.children[1].textContent = batchAge;
    row.children[2].textContent = isHealthGood ? 'Healthy' : 'Sick';
  });

  const saveBtn = document.getElementById('saveBtn');
  if (saveBtn) saveBtn.remove();
}

function addRow() {
  const tableBody = document.querySelector('#dataTable tbody');
  const newRow = document.createElement('tr');

  // Batch ID (static)
  const batchID = document.createElement('td');
  batchID.textContent = 'TBD';
  newRow.appendChild(batchID);

  // Batch Name
  const nameCell = document.createElement('td');
  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.placeholder = 'e.g., New Batch';
  nameCell.appendChild(nameInput);
  newRow.appendChild(nameCell);

  // Batch Age (weeks)
  const ageCell = document.createElement('td');
  const ageInput = document.createElement('input');
  ageInput.type = 'text';
  ageInput.placeholder = 'e.g., 2 weeks';
  ageCell.appendChild(ageInput);
  newRow.appendChild(ageCell);

  // Weight
  const weightCell = document.createElement('td');
  const weightInput = document.createElement('input');
  weightInput.type = 'number';
  weightInput.placeholder = 'e.g., 1.5';
  weightCell.appendChild(weightInput);
  newRow.appendChild(weightCell);

  // Health Status
  const healthCell = document.createElement('td');
  const healthInput = document.createElement('input');
  healthInput.type = 'text';
  healthInput.placeholder = 'Healthy/Sick';
  healthCell.appendChild(healthInput);
  newRow.appendChild(healthCell);

  // Date Arrived
  const dateArrivedCell = document.createElement('td');
  const dateArrivedInput = document.createElement('input');
  dateArrivedInput.type = 'date';
  dateArrivedInput.value = new Date().toISOString().split('T')[0];
  dateArrivedCell.appendChild(dateArrivedInput);
  newRow.appendChild(dateArrivedCell);

  // Date Released
  const dateReleasedCell = document.createElement('td');
  const dateReleasedInput = document.createElement('input');
  dateReleasedInput.type = 'date';
  dateReleasedCell.appendChild(dateReleasedInput);
  newRow.appendChild(dateReleasedCell);

  // Breed (dropdown)
  const breedCell = document.createElement('td');
  const breedSelect = document.createElement('select');
  fetch('/batchlog/breeds/')
    .then(response => response.json())
    .then(data => {
      data.breeds.forEach(b => {
        const opt = document.createElement('option');
        opt.value = b.breed_id;
        opt.textContent = b.breed_name;
        breedSelect.appendChild(opt);
      });
    });
  breedCell.appendChild(breedSelect);
  newRow.appendChild(breedCell);

  tableBody.appendChild(newRow);

  // Save button
  if (!document.getElementById('saveBtn')) {
    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save';
    saveBtn.id = 'saveBtn';
    saveBtn.className = 'save-btn';
    saveBtn.onclick = () => {
      sendAddRequest(
        nameInput.value,
        ageInput.value,
        parseFloat(weightInput.value) || 0,
        healthInput.value.toLowerCase() === 'healthy',
        dateArrivedInput.value,
        dateReleasedInput.value || null,
        breedSelect.value
      );

      nameCell.textContent = nameInput.value;
      ageCell.textContent = ageInput.value;
      weightCell.textContent = weightInput.value;
      healthCell.textContent = healthInput.value.toLowerCase() === 'healthy' ? 'Healthy' : 'Sick';
      dateArrivedCell.textContent = dateArrivedInput.value;
      dateReleasedCell.textContent = dateReleasedInput.value;
      breedCell.textContent = breedSelect.options[breedSelect.selectedIndex].text;
      batchID.textContent = 'Added';
      saveBtn.remove();
    };
    document.querySelector('.main-content').appendChild(saveBtn);
  }
}

function deleteRow() {
  const selectedRow = document.querySelector('.highlight');
  if (selectedRow) {
    const batchId = selectedRow.children[0].textContent;
    sendDeleteRequest(batchId);
    selectedRow.remove();
  }
}

document.querySelector('#dataTable').addEventListener('click', function (e) {
  if (e.target.tagName === 'TH') return;

  const rows = document.querySelectorAll('#dataTable tbody tr');
  rows.forEach(row => row.classList.remove('highlight'));

  const clickedRow = e.target.closest('tr');
  if (clickedRow) clickedRow.classList.add('highlight');
});

// AJAX functions
function sendAddRequest(batchName, batchAge, weight, isHealthGood, dateArrived, dateReleased, breedId) {
  fetch('/batchlog/add/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCSRFToken()
    },
    body: JSON.stringify({
      batch_name: batchName,
      batch_age: batchAge,
      weight: weight,
      isHealthGood: isHealthGood,
      Date_Arrived: dateArrived,
      Date_Released: dateReleased,
      breed_id: breedId
    })
  })
  .then(res => res.json())
  .then(data => console.log('Added:', data));
}


function sendUpdateRequest(batchId, batchAge, isHealthGood) {
  fetch('/batchlog/update/' + batchId + '/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCSRFToken() },
    body: JSON.stringify({
      batch_age: batchAge,
      isHealthGood: isHealthGood
    })
  })
  .then(res => res.json())
  .then(data => console.log('Updated:', data));
}

function sendDeleteRequest(batchId) {
  fetch('/batchlog/delete/' + batchId + '/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCSRFToken() },
    body: JSON.stringify({})
  })
  .then(res => res.json())
  .then(data => console.log('Deleted:', data));
}

function getCSRFToken() {
  const cookieValue = document.cookie.split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1];
  return cookieValue || '';
}
