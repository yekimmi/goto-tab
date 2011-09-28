var MANAGER = new TabManager();
// initialize the callbacks
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
  MANAGER.removeCallback(tabId, removeInfo);
});
chrome.tabs.onSelectionChanged.addListener(function(tabId, selectInfo) {
  // bug this thing doesnt fire across all tabs
  // so have to add a window focus change listener
  // to handle the cross window tab change
  MANAGER.changeCallback(tabId, selectInfo);
});
chrome.windows.onFocusChanged.addListener(function(windowId) {
  MANAGER.windowChangeCallback(windowId);
});
chrome.tabs.onCreated.addListener(function(tab) {
  MANAGER.createdCallback(tab);
});
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  MANAGER.updatedCallback(tabId, changeInfo, tab);
});
chrome.omnibox.onInputStarted.addListener(function() {
  MANAGER.startCallback();
});
chrome.omnibox.onInputCancelled.addListener(function() {
  MANAGER.stopCallback();
});
// initialize the history
chrome.windows.getAll({
  populate : true
}, function(windows) {
  for (index in windows) {
    var window = windows[index];
    for (tabIndex in window.tabs) {
      var tab = window.tabs[tabIndex];
      MANAGER.history.add(tab.id, tab.title, tab.favIconUrl);
    }
  }
});
chrome.omnibox.onInputEntered.addListener(function(text) {
  text = text.trim();
  // show page list
  // experimental
  // if (text == "" || text == "_grid_view") {
  // var listPage = chrome.extension.getURL("page_select.html");
  // chrome.tabs.create({
  // url : listPage
  // });
  // return;
  // }

  if (text == "-" || text == "-last") {
    // go to last if exists
    chrome.tabs.update(MANAGER.history.getLastViewed().id, {
      selected : true
    });
  } else {
    MANAGER.updateSuggestions(text, function(tabs) {
      if (tabs.length > 0) {
        var tabInfo = tabs[0];
        chrome.tabs.update(tabInfo.tab.id, {
          selected : true
        });
      }
    });
  }
});
chrome.omnibox.onInputChanged.addListener(function(search, suggest) {
  var suggestions = [];
  search = search.trim();
  if (search == "-" && MANAGER.hasLastViewed()) {
    suggestions.push({
      content : "-last",
      description : "last viewed tab"
    });
  }
  // this was just experimental grid stuff
  // if (search == "") {
  // suggestions.push({
  // content : "_grid_view",
  // description : "show grid view"
  // });
  // }
  MANAGER.updateSuggestions(search, function(tabs) {
    for (tabIndex in tabs) {
      var tabInfo = tabs[tabIndex];
      var tab = tabInfo.tab;
      var findIndex = tabInfo.index;
      suggestions.push({
        content : tab.searchable,
        description : "<dim>"
            + encodeSpecial(tab.title.substring(0, findIndex))
            + "</dim><match>"
            + encodeSpecial(tab.title.substring(findIndex, findIndex
                + search.length)) + "</match><dim>"
            + encodeSpecial(tab.title.substring(findIndex + search.length))
            + "</dim>"
      });
    }
    suggest(suggestions);
  });
});
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
  if (request.method == GET_HISTORY) {
    sendResponse({
      type : SUCCESS,
      data : MANAGER.getHistory()
    });
  } else if (request.method == GET_SUGGESTIONS) {
    sendResponse({
      type : SUCCESS,
      data : MANAGER.getLastSuggestions()
    });
  } else {
    sendResponse({
      type : ERROR
    });
  }
});
