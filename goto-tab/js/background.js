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
    id = MANAGER.history.getLast();
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
  if (search == "-" && MANAGER.history.hasLast()) {
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
  findTabs(search, function(tabs) {
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