var GET_HISTORY = "getHistory";

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
  console.log(icon);
}
function TabHistory() {
  this.history = new LinkedList();
  this.tabs = {};
  this.add = function(id, title, icon) {
    var strId = "" + id;
    this.tabs[strId] = new Tab(id, title, undefined, icon);
    this.history.unshift(id);
  };
  this.startCallback = function() {
    var self = this;
    chrome.windows.getAll({
      populate : true
    }, function(windows) {
      var tabs = [];
      for (index in windows) {
        var window = windows[index];
        for (tabIndex in window.tabs) {
          var tab = window.tabs[tabIndex];
          var strId = "" + tab.id;
          var old = self.tabs[strId];
          self.tabs[strId] = new Tab(tab.id, tab.title, tab.img, tab.icon);
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
          console.log(tab);
          self.tabs[strId] = new Tab(tabInfo.id, tabInfo.title, dataUrl, tab.favIconUrl);
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
        chrome.tabs.captureVisibleTab(null, null, function(dataUrl) {
          var strId = "" + tab.id;
          self.tabs[strId] = new Tab(tab.id, tab.title, dataUrl, tab.faviconUrl);
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
    callback(tabs);
  }
};
function TabManager() {
  this.history = new TabHistory();
};
function encodeSpecial(toEncode) {
  var text = toEncode;
  text = text.replace(/&/g, "&amp;");
  text = text.replace(/</g, "&lt;");
  text = text.replace(/>/g, "&gt;");
  return text;
}