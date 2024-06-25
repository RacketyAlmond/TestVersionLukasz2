const pageTitle = "JS SPA Routing";

const routes = {
  404: "404.html",
  "/": "index.html",
  section_1: "empty.html",
  section_2: "empty.html",
  write: "write/write.html",
  workshop: "workshop.html",
  forum: "forum.html",
  howWrite: "how_to_write/how_to_write.html"
};

const loadScript = (url) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Script load error for ${url}`));
    document.body.appendChild(script);
  });
};

const locationHandler = async () => {
  const location = window.location.hash.replace("#", "") || "/";

  const route = routes[location] || routes[404];

  const html = await fetch(route).then((response) => response.text());
  document.getElementById("content").innerHTML = html;
  document.title = pageTitle; // Update title

  if (location === 'workshop') {
    initializeEditor();
    location.reload();

  } else if (location === 'forum') {
    await loadScript('forum.js');

    initializeForum(); // Ensure the forum initialization is called after the script is loaded
  }
};

window.addEventListener("hashchange", locationHandler);
locationHandler();
// Call this initially to load the current route

function initializeEditor() {
  // Editor initialization code (same as before)
  const textArea = document.querySelector("#editor");
  const toolbar = document.querySelector(".toolbar");
  const colorPicker = document.querySelector("#colorPicker");
  const fontSizePicker = document.querySelector("#fontSizePicker");
  const nameWritingType = document.querySelector(".name-writing-type");

  if (document.querySelector(".essayType")) {
    nameWritingType.textContent = document.querySelector(".essayType").textContent;
  }

  textArea.addEventListener('click', function () {
    if (textArea.textContent.length < 21) {
      textArea.textContent = "";
      textArea.removeAttribute("style");
    }
  });

  function formatText(command, value = null) {
    document.execCommand(command, false, value);
  }

  toolbar.querySelectorAll(".format-button").forEach((button) => {
    button.addEventListener("click", function () {
      const command = this.getAttribute("data-command");
      if (command === "insertImage") {
        const imageUrl = prompt("Enter image URL:");
        if (imageUrl) {
          formatText("insertImage", imageUrl);
        }
      } else {
        formatText(command);
      }
    });
  });

  colorPicker.addEventListener("change", function () {
    formatText("foreColor", this.value);
  });

  fontSizePicker.addEventListener("change", function () {
    formatText("fontSize", this.value);
  });

  document.querySelector(".save").addEventListener("click", function () {
    const content = textArea.innerHTML;
    saveEssayLocally(content);
  });

  document.querySelector(".check").addEventListener("click", function () {
    const content = textArea.innerHTML;
    checkEssay(content);
  });

  function saveEssayLocally(content) {
    const fileName = prompt("Enter a name for your essay:");
    const essay = {
      fileName: fileName,
      content: content
    };

    const savedEssays = JSON.parse(localStorage.getItem("savedEssays")) || [];
    savedEssays.push(essay);
    localStorage.setItem("savedEssays", JSON.stringify(savedEssays));
  }

  async function checkEssay(content) {
    const textContent = content.replace(/<\/?[^>]+(>|$)/g, ""); // Remove HTML tags
    const response = await fetch('http://localhost:8080/api/essays/correct', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sentences: [`<pl>${textContent}`] })
    });

    if (response.ok) {
      const result = await response.json();
      console.log("Received corrected text:", result.correctedText);
      displayCorrectedEssay(textContent, result.correctedText);
    } else {
      console.error('Failed to check essay');
    }
  }

  function displayCorrectedEssay(originalText, correctedText) {
    console.log("Corrected text:", correctedText);
    if (Array.isArray(correctedText) && correctedText.length > 0) {
      const correctedTextString = correctedText[0];
      textArea.innerHTML = `<span>${originalText}</span> <span style="color: red;">(${correctedTextString})</span>`;
    } else {
      textArea.innerHTML = `<span>${originalText}</span> <span style="color: red;">(No corrections needed or error in correction process)</span>`;
    }
  }
}

function initializeForum() {
  const savedList = document.getElementById("saved-list");

  const savedEssays = JSON.parse(localStorage.getItem("savedEssays")) || [];

  if (savedEssays.length === 0) {
    savedList.innerHTML = "<p>No essays saved yet.</p>";
  } else {
    const list = document.createElement("ul");
    savedEssays.forEach((essay, index) => {
      const listItem = document.createElement("li");

      const button = document.createElement("button");
      button.textContent = essay.fileName;
      button.addEventListener("click", () => {
        showPopup(essay.content, essay.fileName);
      });

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.addEventListener("click", () => {
        deleteEssay(index);
        location.reload();

      });

      listItem.appendChild(button);
      listItem.appendChild(deleteButton);
      list.appendChild(listItem);
    });
    savedList.appendChild(list);
  }
}

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

function deleteEssay(index) {
  const savedEssays = JSON.parse(localStorage.getItem("savedEssays")) || [];
  savedEssays.splice(index, 1);
  localStorage.setItem("savedEssays", JSON.stringify(savedEssays));
  initializeForum(); // Refresh the forum to reflect the changes
}
