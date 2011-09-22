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
  clear : function() {
    localStorage.removeItem(this.key);
  },
  has : function() {
    return localStorage.getItem(this.key) != null;
  }
};
// update current
var currentId;
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
  // this is because we are closing the tab we are viewing
  if (tabId == currentId) {
    // make the current the history one
    currentId = cache.get();
  }
  else if (tabId == cache.get()){
    cache.clear();
  }
});
chrome.tabs.onSelectionChanged.addListener(function(tabId, selectInfo) {
  chrome.tabs.get(tabId, function(tab) {
    var listPage = chrome.extension.getURL("page_select.html");
    // dont store the listPage
    if (listPage != tab.url) {
      if (currentId != null) {
        cache.update(currentId);
      }
      currentId = tabId;
    }
  });
});
chrome.omnibox.onInputEntered.addListener(function(text) {
  text = text.trim();
  // show page list
  // experimental
//  if (text == "" || text == "_grid_view") {
//    var listPage = chrome.extension.getURL("page_select.html");
//    chrome.tabs.create({
//      url : listPage
//    });
//    return;
//  }
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
  search = search.trim();
  if (search == "-" && cache.has()) {
    suggestions.push({
      content : "_last_tab",
      description : "last viewed tab"
    });
  }
  // this was just experimental grid stuff
//  if (search == "") {
//    suggestions.push({
//      content : "_grid_view",
//      description : "show grid view"
//    });
//  }
  findTabs(search, function(tabs) {
    for (tabIndex in tabs) {
      var tabInfo = tabs[tabIndex];
      var tab = tabInfo.tab;
      var findIndex = tabInfo.index;
      suggestions.push({
        content : tab.id + "",
        description : "<dim>" + htmlEncode(tab.title.substring(0, findIndex))
            + "</dim><match>"
            + htmlEncode(tab.title.substring(findIndex, findIndex + search.length))
            + "</match><dim>" + htmlEncode(tab.title.substring(findIndex + search.length))
            + "</dim>"
      });
    }
    suggest(suggestions);
  });
});