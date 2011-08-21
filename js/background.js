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
chrome.omnibox.onInputEntered.addListener(function(text) {
  var id = parseInt(text);
  if (!isNaN(id)) {
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
  findTabs(search, function(tabs) {
    var suggestions = [];
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