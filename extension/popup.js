// chrome.storage.local.get(["selectedText", "username"], (data) => {
//   const textDisplay = document.getElementById("textDisplay");

//   if (data.selectedText) {
//     textDisplay.innerText = data.selectedText;

//     // if (data.username) {
//     //   alert(`${data.selectedText} + ${data.username}`);
//     // } else {
//     //   alert(`${data.selectedText} + No username found`);
//     // }
//   }
// });
document.addEventListener("DOMContentLoaded", () => {
  const textDisplay = document.getElementById("textDisplay");

  chrome.storage.local.get(["selectedText"], async (data) => {
    if (!data.selectedText) {
      textDisplay.innerText = "No text selected.";
      return;
    }

    // Show processing message
    textDisplay.innerText = `Processing...\n\n"${data.selectedText}"`;

    // Send request to Flask backend
    try {
      const response = await fetch("http://127.0.0.1:5000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: data.selectedText }),
      });

      const result = await response.json();
      textDisplay.innerText = result.result || "Error getting AI response.";

    } catch (error) {
      console.error("Request error:", error);
      textDisplay.innerText = "Server error. Make sure Flask is running.";
    }
  });
});
