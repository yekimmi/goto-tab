var GET_HISTORY = "getHistory";
var GET_SUGGESTIONS = "getSuggestions";
var SUCCESS = "success";
var ERROR = "error";

function LinkedItem(obj) {
  this.obj = obj;
  this.next = null;
  this.last = null;
}
function LinkedList() {
  this.first = null;
  this.last = null;
  this.push = function(obj) {
    var item = new LinkedItem(obj);
    if (this.first == null) {
      this.first = item;
      this.last = this.first;
    } else {
      this.last.next = item;
      item.last = this.last;
      this.last = item;
    }
  };
  this.unshift = function(obj) {
    var item = new LinkedItem(obj);
    if (this.first == null) {
      this.first = item;
      this.last = this.first;
    } else {
      this.first.last = item;
      item.next = this.first;
      this.first = item;
    }
  };
  this.remove = function(obj) {
    var item = this.first;
    while (item != null) {
      if (item.obj == obj) {
        if (item.last != null) {
          item.last.next = item.next;
        }
        if (item.next != null) {
          item.next.last = item.last;
        }
        if (this.first.obj == obj) {
          this.first = this.first.next;
        }
        if (this.last.obj == obj) {
          this.last = this.last.last;
        }
        break;
      }
      item = item.next;
    }
  };
  this.moveToFront = function(obj) {
    var item = this.first;
    while (item != null) {
      if (item.obj == obj) {
        if (item.last != null) {
          item.last.next = item.next;
        }
        if (item.next != null) {
          item.next.last = item.last;
        }
        if (this.first.obj == obj) {
          this.first = this.first.next;
        }
        if (this.last.obj == obj) {
          this.last = this.last.last;
        }
        this.unshift(obj);
        break;
      }
      item = item.next;
    }
  };
  this.forEach = function(callback) {
    var item = this.first;
    while (item != null) {
      var go = callback(item.obj);
      if (go != undefined && !go) {
        break;
      }
      item = item.next;
    }
  }
}
function Tab(id, title, imgUrl, icon) {
  this.id = id;
  this.title = (!title) ? "" : title;
  this.img = (!imgUrl) ? "" : imgUrl;
  this.searchable = this.title.toLowerCase() + ":" + this.id;
  this.icon = (!icon) ? "" : icon;
}
function TabHistory() {
  this.history = new LinkedList();
  this.tabs = {};
  this.lastSuggestions = [];
  this.add = function(id, title, icon) {
    var strId = "" + id;
    this.tabs[strId] = new Tab(id, title, undefined, icon);
    this.history.unshift(id);
  };
  this.startCallback = function() {
    var self = this;
    chrome.windows.getAll({
      populate : true
    },
        function(windows) {
          var tabs = [];
          for (index in windows) {
            var window = windows[index];
            for (tabIndex in window.tabs) {
              var tab = window.tabs[tabIndex];
              var strId = "" + tab.id;
              var old = self.tabs[strId];
              self.tabs[strId] = new Tab(tab.id, tab.title, old.img,
                  tab.favIconUrl);
            }
          }
        });
  };
  this.remove = function(id) {
    this.history.remove(id);
    var strId = "" + id;
    delete this.tabs[strId];
  };
  this.createdCallback = function(tab) {
    var strId = "" + tab.id;
    this.tabs[strId] = new Tab(tab.id);
    this.history.push(tab.id);
  };
  this.updatedCallback = function(tabId, changeInfo, tab) {
    if (tab.title != undefined) {
      var strId = "" + tabId;
      var old = this.tabs[strId];
      this.tabs[strId] = new Tab(tabId, tab.title, old.img, tab.favIconUrl);
    }
  };
  this.removeCallback = function(tabId, removeInfo) {
    this.remove(tabId);
  };
  this.changeCallback = function(tabId, selectInfo) {
    this.history.moveToFront(tabId);
    var self = this;
    chrome.tabs.getSelected(null, function(tab) {
      if (tab.url.indexOf("http") == 0) {
        chrome.tabs.captureVisibleTab(null, function(dataUrl) {
          var strId = "" + tabId;
          var tabInfo = self.tabs[strId];
          self.tabs[strId] = new Tab(tabInfo.id, tabInfo.title, dataUrl,
              tab.favIconUrl);
        });
      }
    });
  };
  this.windowChangeCallback = function(windowId) {
    if (windowId == chrome.windows.WINDOW_ID_NONE) {
      return;
    }
    var self = this;
    chrome.tabs.getSelected(windowId, function(tab) {
      if (tab.url.indexOf("http") == 0) {
        chrome.tabs.captureVisibleTab(null, null,
            function(dataUrl) {
              var strId = "" + tab.id;
              self.tabs[strId] = new Tab(tab.id, tab.title, dataUrl,
                  tab.favIconUrl);
            });
      }
      self.history.moveToFront(tab.id);
    });
  };
  this.hasLastViewed = function() {
    return this.history.first != null && this.history.first.next != null;
  };
  this.getLastViewed = function() {
    var strId = this.history.first.next.obj + "";
    return this.tabs[strId];
  };
  this.getHistory = function() {
    var tabs = [];
    var self = this;
    this.history.forEach(function(tabId) {
      var strId = "" + tabId;
      var tab = self.tabs[strId];
      tabs.push(tab);
    });
    return tabs;
  };
  this.findTabs = function(search, callback) {
    search = search.toLowerCase();
    var tabs = [];
    var self = this;
    this.history.forEach(function(tabId) {
      var strId = "" + tabId;
      var tab = self.tabs[strId];
      var findIndex = tab.searchable.indexOf(search);
      if (findIndex != -1) {
        tabs.push({
          tab : tab,
          index : findIndex,
          searchable : tab.searchable
        });
      }
    });
    this.lastSuggestions = tabs;
    callback(tabs);
  }
};
function TabManager() {
  this.history = new TabHistory();
  this.startCallback = function() {
    this.history.startCallback();
    chrome.tabs.executeScript(null, {
      "code" : "run();"
    });
  };
  this.updatedCallback = function(tabId, changeInfo, tab) {
    this.history.updatedCallback(tabId, changeInfo, tab);
  };
  this.createdCallback = function(tab) {
    this.history.createdCallback(tab);
  };
  this.windowChangeCallback = function(windowId) {
    this.history.windowChangeCallback(windowId);
  };
  this.changeCallback = function(tabId, selectInfo) {
    this.history.changeCallback(tabId, selectInfo);
  }
  this.removeCallback = function(tabId, removeInfo) {
    this.history.removeCallback(tabId, removeInfo);
  }
  this.stopCallback = function(callback) {
    if (!callback) {
      callback = function() {
      };
    }
    chrome.tabs.executeScript(null, {
      "code" : "stop();"
    }, callback);
  };
  this.getLastViewed = function() {
    return this.history.getLastViewed();
  };
  this.hasLastViewed = function(){
    return this.history.hasLastViewed();
  };
  this.goTo = function(text) {
    var self = this;
    this.stopCallback(function() {
      self.updateSuggestions(text, function(tabs) {
        if (tabs.length > 0) {
          var tabInfo = tabs[0];
          chrome.tabs.update(tabInfo.tab.id, {
            selected : true
          });
        }
      });
    });
  }
  this.updateSuggestions = function(search, callback) {
    this.history.findTabs(search, function(tabs) {
      callback(tabs);
    });
    chrome.tabs.executeScript(null, {
      "code" : "update();"
    });
  };
  this.getHistory = function() {
    return this.history.getHistory();
  };
  this.getLastSuggestions = function() {
    return this.history.lastSuggestions;
  };
};
function encodeSpecial(toEncode) {
  var text = toEncode;
  text = text.replace(/&/g, "&amp;");
  text = text.replace(/</g, "&lt;");
  text = text.replace(/>/g, "&gt;");
  return text;
}