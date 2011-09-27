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
function Tab(id, title) {
  this.id = id;
  this.title = (!title) ? "" : title;
  this.searchable = this.title.toLowerCase() + ":" + this.id;
}
function TabHistory() {
  this.history = new LinkedList();
  this.tabs = {};
  this.add = function(id, title) {
    var strId = "" + id;
    this.tabs[strId] = new Tab(id, title);
    this.history.unshift(id);
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
      this.tabs[strId] = new Tab(tabId, tab.title);
    }
  };
  this.removeCallback = function(tabId, removeInfo) {
    this.remove(tabId);
  };
  this.changeCallback = function(tabId, selectInfo) {
    this.history.moveToFront(tabId);
  };
  this.windowChangeCallback = function(windowId) {
    if (windowId == chrome.windows.WINDOW_ID_NONE){
      return;
    }
    var self = this;
    chrome.tabs.getSelected(windowId, function(tab) {
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