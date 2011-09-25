var MANAGER = new TabManager();
// initialize the callbacks
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
  MANAGER.history.removeCallback(tabId, removeInfo);
});
chrome.tabs.onSelectionChanged.addListener(function(tabId, selectInfo) {
  MANAGER.history.changeCallback(tabId, selectInfo);
});
chrome.tabs.onCreated.addListener(function(tab) {
  MANAGER.history.createdCallback(tab);
});
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  MANAGER.history.updatedCallback(tabId, changeInfo, tab);
});
// initialize the history
chrome.windows.getAll({
  populate : true
}, function(windows) {
  for (index in windows) {
    var window = windows[index];
    for (tabIndex in window.tabs) {
      var tab = window.tabs[tabIndex];
      MANAGER.history.add(tab.id, tab.title);
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
  var id = null;
  if (text == "-" || text == "-last") {
    // go to last if exists
    id = MANAGER.history.getLastViewed();
  } else {
    id = parseInt(text);
  }
  if (id != null && !isNaN(id)) {
    chrome.tabs.update(id, {
      selected : true
    });
  } else {
    MANAGER.history.findTabs(text, function(tabs) {
      if (tabs.length == 1) {
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
  if (search == "-" && MANAGER.history.hasLastViewed()) {
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
  MANAGER.history.findTabs(search, function(tabs) {
    for (tabIndex in tabs) {
      var tabInfo = tabs[tabIndex];
      var tab = tabInfo.tab;
      var findIndex = tabInfo.index;
      suggestions.push({
        content : tab.id + "",
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