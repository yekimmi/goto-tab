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
      console.log("set first/last");
      this.first = item;
      this.last = this.first;
    } else {
      this.first.last = item;
      item.next = this.first;
      this.first = item;
    }
    console.log(this.first);
  };
  this.remove = function(obj) {
    console.log("remove < " + obj + " >");
    var item = this.first;
    while (item != null) {
      if (item.obj == obj) {
        console.log("found");
        if (item.last != null) {
          console.log("flip last");
          item.last.next = item.next;
        }
        if (item.next != null) {
          console.log("flip next");
          item.next.last = item.last;
        }
        if (this.first.obj == obj) {
          console.log("next first");
          this.first = this.first.next;
        }
        if (this.last.obj == obj) {
          console.log("last last");
          this.last = this.last.last;
        }
        break;
      }
      item = item.next;
    }
  };
  this.moveToFront = function(obj) {
    console.log("move to front < " + obj + " >");
    console.log("first < " + this.first.obj + " >");
    var item = this.first;
    while (item != null) {
      if (item.obj == obj) {
        if (item.last != null) {
          item.last.next = item.next;
        }
        if (item.next != null) {
          item.next.last = item.last;
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
}
function TabHistory() {
  this.history = new LinkedList();
  this.tabs = {};
  this.add = function(id, title) {
    console.log("add < " + id + ", " + title + " >");
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
    this.tabs[strId] = new Tab(strId);
    this.history.unshift(tab.id);
  };
  this.updatedCallback = function(tabId, changeInfo, tab) {
    if (tab.title != undefined) {
      var strId = "" + tabId;
      this.tabs[strId].title = tab.title;
    }
  };
  this.removeCallback = function(tabId, removeInfo) {
    this.remove(tabId);
  };
  this.changeCallback = function(tabId, selectInfo) {
    this.history.moveToFront(tabId);
  };
  this.hasLastViewed = function() {
    return this.history.first != null && this.history.first.next != null;
  };
  this.getLastViewed = function() {
    return this.history.first.next.obj;
  };
  this.findTabs = function(search, callback) {
    search = search.toLowerCase();
    var tabs = [];
    var self = this;
    console.log("start find");
    this.history.forEach(function(tabId) {
      console.log("tab id < " + tabId + " >");
      var strId = "" + tabId;
      var tab = self.tabs[strId];
      var title = tab.title.toLowerCase();
      console.log("check < " + tab.title + " >");
      var findIndex = title.indexOf(search);
      if (findIndex != -1) {
        tabs.push({
          tab : tab,
          index : findIndex
        });
      }
    });
    console.log("end find");
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