function TabHistory() {
  this.removeCallback = function(tabId, removeInfo) {
    // this is because we are closing the tab we are viewing
    if (tabId == this.currentId) {
      // make the current the history one
      this.currentId = this.lastTabId;
    } else if (tabId == this.lastTabId) {
      delete this.lastTabId;
    }
  };
  this.changeCallback = function(tabId, selectInfo) {
    var self = this;
    chrome.tabs.get(tabId, function(tab) {
      var listPage = chrome.extension.getURL("page_select.html");
      // dont store the listPage
      if (listPage != tab.url) {
        if (self.currentId != null) {
          self.lastTabId = self.currentId;
        }
        self.currentId = tabId;
      }
    });
  };
  this.hasLast = function() {
    return this.lastTabId != undefined;
  };
  this.getLast = function() {
    return this.lastTabId;
  };
};
function TabManager() {
  this.history = new TabHistory();
};

var MANAGER = new TabManager();
// initialize the callbacks
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
  MANAGER.history.removeCallback(tabId, removeInfo);
});
chrome.tabs.onSelectionChanged.addListener(function(tabId, selectInfo) {
  MANAGER.history.changeCallback(tabId, selectInfo);
});
function encodeSpecial(toEncode) {
  var text = toEncode;
  text = text.replace(/&/g, "&amp;");
  text = text.replace(/</g, "&lt;");
  text = text.replace(/>/g, "&gt;");
  return text;
}
function findTabs(search, callback) {
  search = search.toLowerCase();
  chrome.windows.getAll({
    populate : true
  }, function(windows) {
    var tabs = [];
    for (index in windows) {
      var window = windows[index];
      for (tabIndex in window.tabs) {
        var tab = window.tabs[tabIndex];
        var title = tab.title.toLowerCase();
        var findIndex = title.indexOf(search);
        if (findIndex != -1) {
          tabs.push({
            tab : tab,
            index : findIndex
          });
        }
      }
    }
    callback(tabs);
  });
}