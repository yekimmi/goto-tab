var cache = {
  key : "tab_last_id",
  update : function(id) {
    localStorage.setItem(this.key, id);
  },
  get : function() {
    var id = localStorage.getItem(this.key);
    if (id != null) {
      return parseInt(id);
    }
  },
  has : function() {
    return localStorage.getItem(this.key) != null;
  }
};
var currentId;
chrome.tabs.onSelectionChanged.addListener(function(tabId, selectInfo) {
  if (currentId != null) {
    cache.update(currentId);
  }
  currentId = tabId;
});
chrome.omnibox.onInputEntered.addListener(function(text) {
  var id = null;
  if (text == "-" || text == "_last_tab") {
    // go to last if exists
    id = cache.get();
  } else {
    id = parseInt(text);
  }
  if (id != null && !isNaN(id)) {
    chrome.tabs.update(id, {
      selected : true
    });
  } else {
    findTabs(text, function(tabs) {
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
  if (search == "-" && cache.has()) {
    console.log("here");
    suggestions.push({
      content : "_last_tab",
      description : "<match>goto last tab</match>"
    });
  }
  findTabs(search, function(tabs) {
    for (tabIndex in tabs) {
      var tabInfo = tabs[tabIndex];
      var tab = tabInfo.tab;
      var findIndex = tabInfo.index;
      suggestions.push({
        content : tab.id + "",
        description : "<dim>" + tab.title.substring(0, findIndex)
            + "</dim><match>"
            + tab.title.substring(findIndex, findIndex + search.length)
            + "</match><dim>" + tab.title.substring(findIndex + search.length)
            + "</dim>"
      });
    }
    suggest(suggestions);
  });
});