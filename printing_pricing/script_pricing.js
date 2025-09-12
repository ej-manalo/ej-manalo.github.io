async function loadPricingData() {
  const response = await fetch("print_pricing.json");
  return await response.json();
}

function populateOptions(id, options, placeholder) {
  const select = document.getElementById(id);
  select.innerHTML = "";
  
  // Add placeholder option
  const placeholderOption = document.createElement("option");
  placeholderOption.value = "";
  placeholderOption.textContent = placeholder;
  placeholderOption.disabled = true;
  placeholderOption.selected = true;
  select.appendChild(placeholderOption);

  options.forEach(opt => {
    const option = document.createElement("option");
    option.value = opt;
    option.textContent = opt;
    select.appendChild(option);
  });
}


function updatePrice(pricingData) {
  const h = parseInt(document.getElementById("height").value);
  const t = parseInt(document.getElementById("thickness").value);
  const l = document.getElementById("location").value;

  const match = pricingData.find(item =>
    item["height(in)"] === h &&
    item["thickness(mm)"] === t &&
    item["location(indoor/outdoor)"] === l
  );

  const priceDiv = document.getElementById("price");
  priceDiv.textContent = match ? `Price: ₱${match["price(Php)"]}` : "No matching price found.";
}

loadPricingData().then(pricingData => {
  const heights = [...new Set(pricingData.map(item => item["height(in)"]))];
  const thicknesses = [...new Set(pricingData.map(item => item["thickness(mm)"]))];
  const locations = [...new Set(pricingData.map(item => item["location(indoor/outdoor)"]))];

  populateOptions("height", heights, "-- Select Height --");
  populateOptions("thickness", thicknesses, "-- Select Thickness --");
  populateOptions("location", locations, "-- Select Location --");

  document.querySelectorAll("select").forEach(select => {
    select.addEventListener("change", () => updatePrice(pricingData));
  });
});
