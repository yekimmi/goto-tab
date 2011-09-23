function encodeSpecial(toEncode){
  var text = toEncode;
  text = text.replace(/&/g,"&amp;");
  text = text.replace(/</g,"&lt;");
  text = text.replace(/>/g,"&gt;");
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