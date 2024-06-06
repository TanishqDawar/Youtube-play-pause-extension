let previousTabId = null;

// Listen for tab activation (when a new tab is focused)
chrome.tabs.onActivated.addListener((activeInfo) => {
  handleTabChange(activeInfo.tabId);
});

// Listen for tab updates (like loading a new URL)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    handleTabChange(tabId);
  }
});

//Listen for window focus changes (like minimizing the window)
chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    pauseAllYouTubeTabs();
  } else {
    chrome.windows.get(windowId, { populate: true }, (window) => {
      const activeTab = window.tabs.find(tab => tab.active);
      if (activeTab) {
        handleTabChange(activeTab.id);
      }
    });
  }
});

// Handle tab change logic
function handleTabChange(activeTabId) {
  if (previousTabId !== null && previousTabId !== activeTabId) {
    chrome.scripting.executeScript({
      target: { tabId: previousTabId },
      function: pauseVideo
    });
  }

  chrome.tabs.get(activeTabId, (activeTab) => {
    if (activeTab.url.includes("youtube.com/watch")) {
      chrome.scripting.executeScript({
        target: { tabId: activeTab.id },
        function: playVideo
      });
    }
  });

  previousTabId = activeTabId;
}

// Pause all YouTube videos
function pauseAllYouTubeTabs() {
  chrome.tabs.query({ url: "*://www.youtube.com/*" }, (tabs) => {
    tabs.forEach((tab) => {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: pauseVideo
      });
    });
  });
}

function playVideo() {
  const video = document.querySelector('video');
  if (video) {
    video.play();
  }
}

function pauseVideo() {
  const video = document.querySelector('video');
  if (video) {
    video.pause();
  }
}