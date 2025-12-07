// --- Pricing Catalog ---
const priceCatalog = {
    2:{12:{indoor:75,outdoor:90},9:{indoor:60,outdoor:75},6:{indoor:45,outdoor:60},3:{indoor:30,outdoor:45}},
    3:{12:{indoor:100,outdoor:120},9:{indoor:80,outdoor:100},6:{indoor:60,outdoor:80},3:{indoor:40,outdoor:40}},
    4:{12:{indoor:140,outdoor:165},9:{indoor:115,outdoor:140},6:{indoor:90,outdoor:115},3:{indoor:65,outdoor:90}},
    5:{12:{indoor:185,outdoor:215},9:{indoor:155,outdoor:185},6:{indoor:125,outdoor:155},3:{indoor:95,outdoor:125}},
    6:{12:{indoor:235,outdoor:270},9:{indoor:200,outdoor:235},6:{indoor:165,outdoor:200},3:{indoor:130,outdoor:165}},
    7:{12:{indoor:290,outdoor:330},9:{indoor:250,outdoor:290},6:{indoor:210,outdoor:250},3:{indoor:170,outdoor:210}},
    8:{12:{indoor:350,outdoor:395},9:{indoor:305,outdoor:350},6:{indoor:260,outdoor:305},3:{indoor:215,outdoor:260}},
    9:{12:{indoor:415,outdoor:465},9:{indoor:365,outdoor:415},6:{indoor:315,outdoor:365},3:{indoor:265,outdoor:315}},
    10:{12:{indoor:485,outdoor:540},9:{indoor:430,outdoor:485},6:{indoor:375,outdoor:430},3:{indoor:320,outdoor:375}},
    11:{12:{indoor:560,outdoor:620},9:{indoor:500,outdoor:560},6:{indoor:440,outdoor:500},3:{indoor:380,outdoor:440}},
    12:{12:{indoor:640,outdoor:705},9:{indoor:575,outdoor:640},6:{indoor:510,outdoor:575},3:{indoor:445,outdoor:510}}
};

// --- Lookup price ---
function lookupPrice(height, thickness, location) {
    if(!height||!thickness||!location) return 0;
    const h=priceCatalog[height];
    if(!h) return 0;
    const t=h[thickness];
    if(!t) return 0;
    return t[location]||0;
}

// --- Update single row ---
function updateRow(row){
    const word = row.querySelector(".word").value;
    const height = row.querySelector(".height").value;
    const thickness = row.querySelector(".thickness").value;
    const location = row.querySelector(".location").value;

    // Count all characters except whitespace
    const letters = word.replace(/\s+/g,'').length;

    const pricePerLetter = lookupPrice(height, thickness, location);
    const total = letters * pricePerLetter;

    row.querySelector(".letters").textContent = letters;
    row.querySelector(".price-per-letter").textContent = pricePerLetter;
    row.querySelector(".total-price").textContent = total;

    updateSummary();
}

// --- Update summary panel ---
function updateSummary(){
    let subtotal=0;
    document.querySelectorAll("#priceTable tbody tr").forEach(row=>{
        const total=parseFloat(row.querySelector(".total-price").textContent)||0;
        subtotal+=total;
    });
    const discount = Math.round(subtotal*0.02); // Example 2%
    const totalAfterDiscount = subtotal-discount;
    const dp = Math.round(totalAfterDiscount*0.4);
    const remaining = totalAfterDiscount-dp;

    document.getElementById("summary-subtotal").textContent=subtotal;
    document.getElementById("summary-discount").textContent=discount;
    document.getElementById("summary-total").textContent=totalAfterDiscount;
    document.getElementById("summary-dp").textContent=dp;
    document.getElementById("summary-balance").textContent=remaining;
}

// --- Add new row ---
function addRow(){
    const table=document.querySelector("#priceTable tbody");
    const newRow=document.createElement("tr");
    newRow.innerHTML=`
        <td><input type="text" class="word"></td>
        <td>
            <select class="height">
                <option value="">Select</option>
                <option>2</option><option>3</option><option>4</option><option>5</option>
                <option>6</option><option>7</option><option>8</option><option>9</option>
                <option>10</option><option>11</option><option>12</option>
            </select>
        </td>
        <td>
            <select class="thickness">
                <option value="">Select</option>
                <option>12</option><option>9</option><option>6</option><option>3</option>
            </select>
        </td>
        <td>
            <select class="location">
                <option value="indoor">Indoor</option>
                <option value="outdoor">Outdoor</option>
            </select>
        </td>
        <td class="letters">0</td>
        <td class="price-per-letter">0</td>
        <td class="total total-price">0</td>
    `;
    table.appendChild(newRow);
    attachEvents(newRow);
    updateSummary();
}

// --- Attach input/change events ---
function attachEvents(row){
    row.querySelectorAll("input, select").forEach(el=>{
        el.addEventListener("input",()=>updateRow(row));
        el.addEventListener("change",()=>updateRow(row));
    });
}

// Attach events to initial row
document.querySelectorAll("#priceTable tbody tr").forEach(row=>attachEvents(row));

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
