function initializeEditor() {
  const textArea = document.querySelector("#editor");
  const toolbar = document.querySelector(".toolbar");
  const colorPicker = document.querySelector("#colorPicker");
  const fontSizePicker = document.querySelector("#fontSizePicker");
  const nameWritingType = document.querySelector(".name-writing-type");

  if (document.querySelector(".essayType")) {
    nameWritingType.textContent = document.querySelector(".essayType").textContent;
  }

  textArea.addEventListener('click', function (){
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

  async function checkEssay(content) {
    const textContent = content.replace(/<\/?[^>]+(>|$)/g, ""); // Remove HTML tags
    const response = await fetch('http://localhost:8080/api/essays/correct', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sentences: [textContent] })
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
      const correctedTextString = correctedText.join(" ");
      textArea.innerHTML = `<span style="background-color: yellow">${originalText}</span> <span style="color: red;">(${correctedTextString})</span>`;
    } else {
      textArea.innerHTML = `<span style="background-color: yellow">${originalText}</span> <span style="color: red;">(No corrections needed or error in correction process)</span>`;
    }
  }

  function saveEssayLocally(content) {
    // Create a Blob from the content
    const blob = new Blob([content], { type: 'text/plain' });

    // Retrieve the saved essays from localStorage
    const savedEssays = JSON.parse(localStorage.getItem("savedEssays")) || [];
    const fileName = `essay(${savedEssays.length}).txt`;

    // Create a URL for the Blob and set it as the href attribute of the link
    const url = URL.createObjectURL(blob);

    // Save the file information in localStorage
    savedEssays.push({ fileName, url });
    localStorage.setItem("savedEssays", JSON.stringify(savedEssays));
    console.log(savedEssays);
    // Create a link element
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;

    // Append the link to the body
    document.body.appendChild(a);

    // Programmatically click the link to trigger the download
    a.click();

    // Remove the link from the document
    document.body.removeChild(a);
  }
}
