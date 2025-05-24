function handleAction() {
  addRow();
}

function addRow() {
  const tableBody = document.querySelector('#dataTable tbody');
  const newRow = document.createElement('tr');

  // Batch
  const batchCell = document.createElement('td');
  const batchSelect = document.createElement('select');
  window.batches.forEach(batch => {
    const opt = new Option(batch.batch_name, batch.batch_id);
    batchSelect.add(opt);
  });
  batchCell.appendChild(batchSelect);
  newRow.appendChild(batchCell);

  // Health
  const healthCell = document.createElement('td');
  const healthSelect = document.createElement('select');
  ['Good', 'Bad'].forEach(status => {
    healthSelect.add(new Option(status, status));
  });
  healthCell.appendChild(healthSelect);
  newRow.appendChild(healthCell);

  // Weight
  const weightCell = document.createElement('td');
  const weightInput = document.createElement('input');
  weightInput.type = 'number';
  weightInput.step = '0.01';
  weightCell.appendChild(weightInput);
  newRow.appendChild(weightCell);

  // Feed
  const feedCell = document.createElement('td');
  const feedSelect = document.createElement('select');
  feedSelect.add(new Option('N/A', ''));
  window.feeds.forEach(feed => {
    feedSelect.add(new Option(feed.feed_type, feed.feed_id));
  });
  feedCell.appendChild(feedSelect);
  newRow.appendChild(feedCell);

  // Medicine
  const medCell = document.createElement('td');
  const medSelect = document.createElement('select');
  medSelect.add(new Option('N/A', ''));
  window.medicines.forEach(med => {
    medSelect.add(new Option(med.medicine_name, med.medicine_id));
  });
  medCell.appendChild(medSelect);
  newRow.appendChild(medCell);

  // Date
  const dateCell = document.createElement('td');
  const dateInput = document.createElement('input');
  dateInput.type = 'date';
  dateCell.appendChild(dateInput);
  newRow.appendChild(dateCell);

  // Action
  const actionCell = document.createElement('td');
  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Save';
  saveBtn.onclick = () => saveNewRow(newRow);
  actionCell.appendChild(saveBtn);
  newRow.appendChild(actionCell);

  tableBody.appendChild(newRow);
}

document.querySelector('#dataTable').addEventListener('click', function (e) {
  if (e.target.tagName === 'TH') return;

  const rows = document.querySelectorAll('#dataTable tbody tr');
  rows.forEach(row => row.classList.remove('highlight'));

  const clickedRow = e.target.closest('tr');
  if (clickedRow) clickedRow.classList.add('highlight');
});

function getCSRFToken() {
  const name = "csrftoken";
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.startsWith(name + '=')) {
      return decodeURIComponent(cookie.substring(name.length + 1));
    }
  }
  return '';
}

function getBatchIdByName(name) {
  const match = window.batches.find(b => b.batch_name === name);
  return match ? match.batch_id : null;
}

function getFeedIdByName(name) {
  const match = window.feeds.find(f => f.feed_type === name);
  return match ? match.feed_id : null;
}

function getMedicineIdByName(name) {
  const match = window.medicines.find(m => m.medicine_name === name);
  return match ? match.medicine_id : null;
}

function editRow(button) {
  const row = button.closest('tr');
  const cells = row.querySelectorAll('td');
  const logId = row.dataset.logId;

  // Get current values
  const [batchCell, healthCell, weightCell, feedCell, medCell, dateCell, _] = cells;
  
  // Replace batch with dropdown
  const batchSelect = document.createElement('select');
  window.batches.forEach(batch => {
    const opt = new Option(batch.batch_name, batch.batch_id);
    if (batch.batch_name === batchCell.textContent) opt.selected = true;
    batchSelect.add(opt);
  });
  batchCell.innerHTML = '';
  batchCell.appendChild(batchSelect);

  // Replace health status
  const healthSelect = document.createElement('select');
  ['Good', 'Bad'].forEach(status => {
    const opt = new Option(status, status);
    if (status === healthCell.textContent) opt.selected = true;
    healthSelect.add(opt);
  });
  healthCell.innerHTML = '';
  healthCell.appendChild(healthSelect);

  // Replace weight with input
  const weightInput = document.createElement('input');
  weightInput.type = 'number';
  weightInput.step = '0.01';
  weightInput.value = weightCell.textContent;
  weightCell.innerHTML = '';
  weightCell.appendChild(weightInput);

  // Replace feed with dropdown
  const feedSelect = document.createElement('select');
  const currentFeed = feedCell.textContent;
  const noneOption = new Option('N/A', '');
  feedSelect.add(noneOption);
  window.feeds.forEach(feed => {
    const opt = new Option(feed.feed_type, feed.feed_id);
    if (feed.feed_type === currentFeed) opt.selected = true;
    feedSelect.add(opt);
  });
  feedCell.innerHTML = '';
  feedCell.appendChild(feedSelect);

  // Replace medicine with dropdown
  const medSelect = document.createElement('select');
  const currentMed = medCell.textContent;
  medSelect.add(new Option('N/A', ''));
  window.medicines.forEach(med => {
    const opt = new Option(med.medicine_name, med.medicine_id);
    if (med.medicine_name === currentMed) opt.selected = true;
    medSelect.add(opt);
  });
  medCell.innerHTML = '';
  medCell.appendChild(medSelect);

  // Replace date with input
  const dateInput = document.createElement('input');
  dateInput.type = 'date';
  dateInput.value = dateCell.textContent;
  dateCell.innerHTML = '';
  dateCell.appendChild(dateInput);

  // Replace Edit button with Save
  button.textContent = 'Save';
  button.onclick = () => saveRow(row, logId);
}

function saveRow(row, logId) {
  const cells = row.querySelectorAll('td');
  const [batchCell, healthCell, weightCell, feedCell, medCell, dateCell, actionCell] = cells;

  const payload = {
    log_id: logId,
    batch: batchCell.querySelector('select').value,
    isHealthGood: healthCell.querySelector('select').value === 'Good',
    weight: parseFloat(weightCell.querySelector('input').value),
    feed: feedCell.querySelector('select').value || null,
    medicine: medCell.querySelector('select').value || null,
    log_date: dateCell.querySelector('input').value,
  };

  fetch('/save-growthlog/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCSRFToken()
    },
    body: JSON.stringify(payload)
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      // Replace inputs with text
      batchCell.textContent = batchCell.querySelector('select').selectedOptions[0].textContent;
      healthCell.textContent = payload.isHealthGood ? 'Good' : 'Bad';
      weightCell.textContent = payload.weight;
      feedCell.textContent = feedCell.querySelector('select').selectedOptions[0].textContent;
      medCell.textContent = medCell.querySelector('select').selectedOptions[0].textContent;
      dateCell.textContent = payload.log_date;
      actionCell.querySelector('button').textContent = 'Edit';
      actionCell.querySelector('button').onclick = () => editRow(actionCell.querySelector('button'));
    } else {
      alert('Failed to save row.');
    }
  });
}

function getCSRFToken() {
  return document.cookie.split('; ')
    .find(row => row.startsWith('csrftoken='))
    .split('=')[1];
}


function saveNewRow(row) {
  const cells = row.querySelectorAll('td');
  const [batchCell, healthCell, weightCell, feedCell, medCell, dateCell] = cells;

  const payload = {
    batch: batchCell.querySelector('select').value,
    isHealthGood: healthCell.querySelector('select').value === 'Good',
    weight: parseFloat(weightCell.querySelector('input').value),
    feed: feedCell.querySelector('select').value || null,
    medicine: medCell.querySelector('select').value || null,
    log_date: dateCell.querySelector('input').value,
  };

  fetch('/add-growthlog/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCSRFToken()
    },
    body: JSON.stringify(payload)
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      // Replace the editable row with a static row
      const newRow = document.createElement('tr');

      const batch = window.batches.find(b => b.batch_id == payload.batch);
      const feed = window.feeds.find(f => f.feed_id == payload.feed);
      const medicine = window.medicines.find(m => m.medicine_id == payload.medicine);

      newRow.innerHTML = `
        <td>${batch ? batch.batch_name : 'N/A'}</td>
        <td>${payload.isHealthGood ? 'Good' : 'Bad'}</td>
        <td>${payload.weight}</td>
        <td>${feed ? feed.feed_type : 'N/A'}</td>
        <td>${medicine ? medicine.medicine_name : 'N/A'}</td>
        <td>${payload.log_date}</td>
      `;
      row.replaceWith(newRow);
    } else {
      alert('Error adding log: ' + data.error);
    }
  });
}

function deleteSelectedRow() {
  if (!confirm('Are you sure you want to delete this log?')) return;
  const row = document.querySelector('.highlight');

  if (!row) return;

  const logId = row.dataset.logId;
  if (!logId) return row.remove();

  fetch('/growthlog/delete/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie('csrftoken'),
    },
    body: JSON.stringify({ log_id: logId })
  })
  .then(response => response.json())
  .then(json => {
    if (json.success) {
      row.remove();
      alert("Deleted successfully!");
    } else {
      alert("Delete failed: " + json.error);
    }
  });
}

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.startsWith(name + '=')) {
        cookieValue = decodeURIComponent(cookie.slice(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}