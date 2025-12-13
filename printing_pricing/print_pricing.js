

/* ================= item order js ================= */
const addItemBtn = document.getElementById('addItemBtn');
const modalOverlay = document.getElementById('modalOverlay');
const cancelBtn = document.getElementById('cancelBtn');
const confirmAddBtn = document.getElementById('confirmAddBtn');
const deleteBtn = document.getElementById('deleteBtn');
const itemTableBody = document.getElementById('itemTableBody');

const itemName = document.getElementById('itemName');
const itemHeight = document.getElementById('itemHeight');
const itemThickness = document.getElementById('itemThickness');
const itemLocation = document.getElementById('itemLocation');
const itemPrice = document.getElementById('itemPrice');

let editingRow = null;

addItemBtn.onclick = () => {
  editingRow = null;
  modalOverlay.style.display = 'flex';
  itemName.value = '';
  itemHeight.value = '';
  itemThickness.value = '';
  itemLocation.value = '';
  itemPrice.value = '';
  confirmAddBtn.textContent = 'Add';
  deleteBtn.style.display = 'none';
  modalOverlay.style.display = 'flex';
  document.body.classList.add('modal-open');
  calcInfo.style.display = 'none';  // <-- hide calculated info


};

cancelBtn.onclick = () => {
  modalOverlay.style.display = 'none';
  document.body.classList.remove('modal-open');
  
  // Hide calculated info
  calcInfo.style.display = 'none';  

};

confirmAddBtn.onclick = () => {
  // if (!itemName.value || !itemHeight.value || !itemThickness.value || !itemLocation.value || !itemPrice.value) {
  //   alert('Please fill in all fields');
  //   return;
  // }

  if (editingRow) {
    editingRow.cells[0].textContent = itemName.value;
    editingRow.cells[1].textContent = itemHeight.value;
    editingRow.cells[2].textContent = itemThickness.value;
    editingRow.cells[3].textContent = itemLocation.value;
    editingRow.cells[4].textContent = `₱${Number(itemPrice.value).toLocaleString()}`;
    editingRow.cells[4].classList.add('row-price');
    updateSummary();
  } else {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${itemName.value}</td>
      <td>${itemHeight.value}</td>
      <td>${itemThickness.value}</td>
      <td>${itemLocation.value}</td>
      <td class="row-price">₱${Number(itemPrice.value).toLocaleString()}</td>
    `;
    row.onclick = () => openEdit(row);
    itemTableBody.appendChild(row);
    updateSummary();
  }

  modalOverlay.style.display = 'none';
  document.body.classList.remove('modal-open');
  calcInfo.style.display = 'none';
};

deleteBtn.onclick = () => {
  if (editingRow && confirm('Are you sure you want to delete this item?')) {
    editingRow.remove();
    editingRow = null;
    modalOverlay.style.display = 'none';
    updateSummary();
  }
};

function openEdit(row) {
  editingRow = row;
  modalOverlay.style.display = 'flex';

  itemName.value = row.cells[0].textContent;
  itemHeight.value = row.cells[1].textContent;
  itemThickness.value = row.cells[2].textContent;
  itemLocation.value = row.cells[3].textContent;
  itemPrice.value = row.cells[4].textContent.replace('₱', '').replace(/,/g, '');

  confirmAddBtn.textContent = 'Save';
  deleteBtn.style.display = 'inline-block';
}



// --- Update summary panel ---
function updateSummary() {
  let subtotal = 0;

  document.querySelectorAll('#itemTableBody tr').forEach(row => {
    const priceCell = row.querySelector('.row-price');
    if (priceCell) {
      // Remove ₱ and commas, then convert to number
      const price = parseFloat(priceCell.textContent.replace('₱','').replace(/,/g,'')) || 0;
      subtotal += price;
    }
  });

  const discount = Math.round(subtotal * 0.02); // example 2% discount
  const totalAfterDiscount = subtotal - discount;
  const dp = Math.round(totalAfterDiscount * 0.4);
  const remaining = totalAfterDiscount - dp;

  document.getElementById('summary-subtotal').textContent = "₱ " + subtotal.toLocaleString();
  document.getElementById('summary-adhesive').textContent = "₱ 0";
  document.getElementById('summary-discount').textContent = "₱ " + discount.toLocaleString();
  document.getElementById('summary-total').textContent = "₱ " + totalAfterDiscount.toLocaleString();
  document.getElementById('summary-dp').textContent = "₱ " + dp.toLocaleString();
  document.getElementById('summary-balance').textContent = "₱ " + remaining.toLocaleString();
}



// --- Drag & Drop Image Upload ---
const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");
const previewImage = document.getElementById("previewImage");
const maxFileSizeMB = 5;

dropZone.addEventListener("dragover", e=>{e.preventDefault(); dropZone.style.backgroundColor="#fefce8";});
dropZone.addEventListener("dragleave", e=>{dropZone.style.backgroundColor="";});
dropZone.addEventListener("drop", e=>{e.preventDefault(); dropZone.style.backgroundColor=""; handleFiles(e.dataTransfer.files);});
fileInput.addEventListener("change", e=>handleFiles(fileInput.files));

function handleFiles(files){
    if(files.length===0) return;
    const file = files[0];
    if(!file.type.startsWith("image/")){ alert("Please upload an image file."); return; }
    if(file.size>maxFileSizeMB*1024*1024){ alert(`File too large! Max ${maxFileSizeMB} MB.`); return; }
    const reader = new FileReader();
    reader.onload = e=>{
        previewImage.src=e.target.result;
        previewImage.style.display="block";
        dropZone.querySelector(".drop-text").style.display="none";
    };
    reader.readAsDataURL(file);
}

// --- Fetching from google sheet ---
const calculateBtn = document.getElementById('calculateBtn');

let pricingTable = [];

async function loadPricingTable() {
  const response = await fetch(
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vSUdrhhZfDaFeIcTGi4uU8ImO2yyUMrAxu_Xn-9tBiFk0DC4AQzfRWjiuUJjoyFiN0XcDc4TyyPcGhf/pub?gid=0&single=true&output=csv'
  );

  const csv = await response.text();
  const rows = csv.trim().split('\n').slice(1); // skip header

  pricingTable = rows.map(row => {
    const [height, thickness, location, price] = row.split(',');
    return {
      height: Number(height),
      thickness: Number(thickness),
      location: location.trim(),
      price: Number(price)
    };
  });

  console.log('Pricing table loaded:', pricingTable);
}

// Load once when page opens
loadPricingTable();

// Price lookup function
function calculatePrice(height, thickness, location) {
  const match = pricingTable.find(row =>
    row.height === Number(height) &&
    row.thickness === Number(thickness) &&
    row.location.toLowerCase() === location.toLowerCase()
  );

  return match ? match.price : null;
}

function countCharacters(text) {
  return text.replace(/\s/g, '').length;
}


// Price Calculation
const calcInfo = document.getElementById('calcInfo');
const charCountSpan = document.getElementById('charCount');
const pricePerCharSpan = document.getElementById('pricePerChar');
const calculatedPriceSpan = document.getElementById('calculatedPrice');

calculateBtn.onclick = () => {
  if (!itemName.value || !itemLocation.value || !itemHeight.value || !itemThickness.value) {
    alert('Unfilled information in the form.');
    return;
  }

  // Count characters
  const chars = countCharacters(itemName.value);

  // Get price per character based on the pricing catalog
  const pricePerChar = calculatePrice( itemHeight.value,itemThickness.value,itemLocation.value );

  if (pricePerChar === null) {
    // No match found: alert, hide extra info, do NOT autofill price
    alert('No pricing rule found for this combination of height, thickness, and location.');
    calcInfo.style.display = 'none';
    return;
  }
  const totalPrice = chars * pricePerChar;

  // Update the read-only info
  charCountSpan.textContent = chars;
  pricePerCharSpan.textContent = pricePerChar;
  calculatedPriceSpan.textContent = totalPrice;

  // Reveal the block
  calcInfo.style.display = 'block';

  // Optionally auto-fill the Price input (still editable)
  itemPrice.value = totalPrice;
};
