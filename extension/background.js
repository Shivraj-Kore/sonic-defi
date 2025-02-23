chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "openWithExtension",
    title: "use 0x",
    contexts: ["selection"]
  });
  chrome.storage.local.get("username", (data) => {
    if (!data.username) {
      chrome.storage.local.set({ username: "GuestUser" });
    }
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "openWithExtension") {
    chrome.storage.local.set({ selectedText: info.selectionText }, () => {
      chrome.action.openPopup();
    });
  }
});
