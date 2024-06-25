window.onload = function () {
  const savedList = document.getElementById("saved-list");

  // Retrieve the saved essays from localStorage
  const savedEssays = JSON.parse(localStorage.getItem("savedEssays")) || [];

  if (savedEssays.length === 0) {
    savedList.innerHTML = "<p>No essays saved yet.</p>";
  } else {
    const list = document.createElement("ul");
    savedEssays.forEach((essay) => {
      const listItem = document.createElement("li");
      const button = document.createElement("button");
      button.textContent = essay.fileName;
      button.addEventListener("click", () => {
        showPopup(essay.content, essay.fileName);
      });

      listItem.appendChild(button);
      list.appendChild(listItem);
    });
    savedList.appendChild(list);
  }
};

function showPopup(content, title) {
  const modal = document.createElement("div");
  modal.classList.add("modal");

  const modalContent = document.createElement("div");
  modalContent.classList.add("modal-content");

  const closeButton = document.createElement("span");
  closeButton.classList.add("close-button");
  closeButton.innerHTML = "&times;";
  closeButton.onclick = () => {
    modal.remove();
  };

  const titleElement = document.createElement("h2");
  titleElement.textContent = title;

  const contentElement = document.createElement("pre");
  contentElement.textContent = content;

  modalContent.appendChild(closeButton);
  modalContent.appendChild(titleElement);
  modalContent.appendChild(contentElement);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
}
