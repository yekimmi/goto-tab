// need to add this because functions may be called elsewhere
var win = window;
function SelectItem(item, tabId) {
  this.item = item;
  this.tabId = tabId;
  this.goTo = function() {
    chrome.tabs.update(this.tabId, {
      selected : true
    });
  };
  this.xIndex = 0;
  this.yIndex = 0;
};
function SelectionNav(items, selected) {
  this.yItems = [];
  this.xItems = [];
  this.xSorter = function(a, b) {
    return a.item.position().left - b.item.position().left;
  };
  this.ySorter = function(a, b) {
    return a.item.position().top - b.item.position().top;
  };
  this.updateSelected = function(selected) {
    if (this.selected != null) {
      this.selected.item.removeClass("selected");
    }
    this.selected = selected;
    this.selected.item.addClass("selected");
  };
  this.updateSorts = function() {
    this.xItems.sort(this.xSorter);
    this.yItems.sort(this.ySorter);
    // initialize indices
    for (xIndex in this.xItems) {
      var xItem = this.xItems[xIndex];
      xItem.xIndex = parseInt(xIndex);
    }
    for (yIndex in this.yItems) {
      var yItem = this.yItems[yIndex];
      yItem.yIndex = parseInt(yIndex);
    }
    // this.updateSelected(this.selected);
  };
  this.moveRight = function() {
    var start = this.selected.xIndex + 1;
    var slice = this.xItems.slice(start);
    var next = null;
    var lastDistance = 0;
    while (slice.length > 0) {
      var item = slice[0];
      if (item.item.position().left > this.selected.item.position().left) {
        if (next == null) {
          next = item;
          lastDistance = Math.abs(this.selected.item.position().top
              - next.item.position().top);

        } else {
          if (Math.abs(this.selected.item.position().top
              - item.item.position().top) < lastDistance) {
            next = item;
            lastDistance = Math.abs(this.selected.item.position().top
                - next.item.position().top);
          }
        }
      }
      // update
      start = start + 1;
      slice = this.xItems.slice(start);
    }
    if (next != null) {
      this.updateSelected(next);
    }
  };
  this.moveLeft = function() {
    var start = this.selected.xIndex;
    var slice = this.xItems.slice(0, start);
    var next = null;
    var lastDistance = 0;
    while (slice.length > 0) {
      var item = slice[slice.length - 1];
      if (item.item.position().left < this.selected.item.position().left) {
        if (next == null) {
          next = item;
          lastDistance = Math.abs(this.selected.item.position().top
              - next.item.position().top);
        } else {
          if (Math.abs(this.selected.item.position().top
              - item.item.position().top) < lastDistance) {
            next = item;
            lastDistance = Math.abs(this.selected.item.position().top
                - next.item.position().top);
          }
        }
      }
      // update
      start = start - 1;
      slice = this.xItems.slice(0, start);
    }
    if (next != null) {
      this.updateSelected(next);
    }
  };
  this.moveDown = function() {
    var start = this.selected.yIndex + 1;
    var slice = this.yItems.slice(start);
    var next = null;
    var lastDistance = 0;
    while (slice.length > 0) {
      var item = slice[0];
      if (item.item.position().top > this.selected.item.position().top) {
        if (next == null) {
          next = item;
          lastDistance = Math.abs(this.selected.item.position().left
              - next.item.position().left);

        } else {
          if (Math.abs(this.selected.item.position().left
              - item.item.position().left) < lastDistance) {
            next = item;
            lastDistance = Math.abs(this.selected.item.position().left
                - next.item.position().left);
          }
        }
      }
      // update
      start = start + 1;
      slice = this.yItems.slice(start);
    }
    if (next != null) {
      this.updateSelected(next);
    }
  };
  this.moveUp = function() {
    var start = this.selected.yIndex;
    var slice = this.yItems.slice(0, start);
    var next = null;
    var lastDistance = 0;
    while (slice.length > 0) {
      var item = slice[slice.length - 1];
      if (item.item.position().top < this.selected.item.position().top) {
        if (next == null) {
          next = item;
          lastDistance = Math.abs(this.selected.item.position().left
              - next.item.position().left);

        } else {
          if (Math.abs(this.selected.item.position().left
              - item.item.position().left) < lastDistance) {
            next = item;
            lastDistance = Math.abs(this.selected.item.position().left
                - next.item.position().left);
          }
        }
      }
      // update
      start = start - 1;
      slice = this.yItems.slice(0, start);
    }
    if (next != null) {
      this.updateSelected(next);
    }
  };

  // init
  for (index in items) {
    this.xItems.push(items[index]);
    this.yItems.push(items[index]);
  }
  this.xItems.sort(this.xSorter);
  this.yItems.sort(this.ySorter);
  // initialize indices
  for (xIndex in this.xItems) {
    var xItem = this.xItems[xIndex];
    xItem.xIndex = parseInt(xIndex);
  }
  for (yIndex in this.yItems) {
    var yItem = this.yItems[yIndex];
    yItem.yIndex = parseInt(yIndex);
  }
  this.updateSelected(selected);
};
$(function() {
  chrome.extension
      .sendRequest(
          {
            method : GET_HISTORY
          },
          function(result) {
            if (result.type == undefined || result.type == ERROR){
              return;
            }
            var history = result.data;
            var items = [];
            var selected = {};
            var first = true;
            var container = $(".grid");
            container.masonry({
              // options
              itemSelector : '.grid_element',
              columnWidth : 100,
              isAnimated : false,
              isFitWidth : true
            });
            for ( var index in history) {
              var item = history[index];
              var box = $('<div class="grid_element"><div><table><tr><td><img src="' + item.info.icon + '"/><span style="font-size:12px;padding:10px"></td><td>'
                  + item.info.title
                  + '</td></tr></table></div><div><img style="height:300px" src="'
                  + item.info.img + '"/></div></div>');
              var item = new SelectItem(box, item.info.id);
              items.push(item);
              container.append(box).masonry("appended", box);
              if (first) {
                selected = item;
                first = false;
              }
            }
            if (items.length == 0) {
              return;
            }
            var nav = new SelectionNav(items, items[0]);
            $(win).resize(function() {
              container.masonry("layout", [], function() {
                nav.updateSorts();
              });
            });
            container.masonry("layout", [], function() {
              $(document).bind('keydown', 'k', function() {
                nav.moveUp();
              });
              $(document).bind('keydown', 'j', function() {
                nav.moveDown();
              });
              $(document).bind('keydown', 'h', function() {
                nav.moveLeft();
              });
              $(document).bind('keydown', 'l', function() {
                nav.moveRight();
              });
              $(document).bind("keydown", 'return', function() {
                chrome.tabs.getSelected(null, function(current) {
                  nav.selected.goTo();
                  chrome.tabs.remove(current.id);
                });
              });
            });
          });
});