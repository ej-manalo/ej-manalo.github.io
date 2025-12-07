const entries = document.getElementById("entries");
const input = document.getElementById("entryInput");
const sendBtn = document.getElementById("sendBtn");

// Add entry
function addEntry(text) {
  if (text.trim() === "") return; // ignore empty input
  const entry = document.createElement("div");
  entry.classList.add("entry");
  entry.textContent = text;
  entries.appendChild(entry);
  entries.scrollTop = entries.scrollHeight; // auto-scroll to bottom
  input.value = "";
}

// Send on button click
sendBtn.addEventListener("click", () => {
  addEntry(input.value);
});

// Send on Enter key
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    addEntry(input.value);
  }
});
