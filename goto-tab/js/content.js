var main = $("<div id='gt_main'></div>");
var content = $("<div id='gt_choices'></div>");
var destination = $("<div id='destination' style='display:none'></div>");
var SHOW_CONTENT = "showContent";
var HIDE_CONTENT = "hideContent";
var UPDATE_SUGGESTIONS = "updateSuggestions";
var enders = [];
var started = false;
var animation = {
  time : new Date()
};
var lastAnimation = animation;
$(function() {
  $("body").append(main);
  main.append(content);
  main.css("opacity", 0);
  $("body").append(destination);
  setTimeout(animate, 30);
});
var animate = function() {
  if (enders.length > 0) {
    var next = enders.pop();
    if (SHOW_CONTENT == next.type) {
      started = true;
      setTimeout(animate, 30);
    } else if (HIDE_CONTENT == next.type) {
      console.log("hide");
      main.hide("slide", {
        direction : "left"
      }, function() {
        main.css("opacity", 0);
        main.show(); // make sure its ready to be layed out
        started = false;
        setTimeout(animate, 30);
      });
    }
  } else if (lastAnimation.time.getTime() < animation.time.getTime() && started) {
    // first get it
    lastAnimation = animation;
    console.log("do " + lastAnimation.time.getTime());
    var next = lastAnimation.todo;
    // then timestamp when i do it
    animationLastTime = new Date();
    if (UPDATE_SUGGESTIONS == next.type) {
      var suggestions = next.data;
      var suggested = {};
      for ( var index = suggestions.length - 1; index >= 0; index--) {
        var sug = suggestions[index];
        var box = destination.find("div[data-id='gt_tab_" + sug.tab.id + "']");
        suggested[sug.tab.id + ""] = true;
        box.attr("data-selected", "selected");
        box.addClass("gt_selected");
        destination.prepend(box);
      }
      $("div[data-id]").each(function(index) {
        var ob = $(this);
        console.log("remove < " + !suggested[ob.attr("data-tab-id") + ""]);
        if (!suggested[ob.attr("data-tab-id")]) {
          ob.removeAttr("data-selected");
          ob.removeClass("gt_selected");
        }
      });
      if (main.css("opacity") == 0) {
        content.quicksand(destination.children(), {
          duration : 1
        }, function() {
          main.hide();
          main.css("opacity", 1);
          main.show("slide", {
            direction : "left"
          }, function() {
            setTimeout(animate, 30);
          });
        });
      } else {
        content.quicksand(destination.children(), {
          duration : 300
        }, function() {
          setTimeout(animate, 30);
        });
      }
    }
  } else {
    setTimeout(animate, 30);
  }
}
var waitForAnimate = function(suggestions) {
  return function() {
    if (suggestions.length > 0) {
      setTimeout(waitForAnimate(suggestions), 10);
    } else {
      setTimeout(animate, 30);
    }
  }
};
var run = function() {
  content.html("");
  destination.html("");
  chrome.extension.sendRequest({
    method : GET_HISTORY
  }, function(result) {
    if (result.type == undefined || result.type == ERROR) {
      return;
    }
    var history = result.data;
    for ( var index in history) {
      var tab = history[index];
      content.append(createBox(tab));
      destination.append(createBox(tab));
    }
    enders.unshift({
      type : SHOW_CONTENT
    });
  });
};
var createBox = function(tab, selected) {
  if (!selected) {
    selected = false;
  }
  var hasImg = tab.img != "";
  var hasIcon = tab.icon != "";
  if (hasImg && hasIcon) {
    return $('<div class="gt_choice '
        + (selected ? "gt_selected" : "gt_all")
        + '" data-id="gt_tab_'
        + tab.id
        + '" data-tab-id="'
        + tab.id
        + '"><div><div class="gt_icon"><img src="'
        + tab.icon
        + '"/></div><div class="gt_title">'
        + tab.title
        + '</div><div style="clear:both"></div></div><div style="gt_img"><img src="'
        + tab.img + '"/></div></div>');
  } else if (hasImg) {
    return $('<div class="gt_choice '
        + (selected ? "gt_selected" : "gt_all")
        + '" data-id="gt_tab_'
        + tab.id
        + '" data-tab-id="'
        + tab.id
        + '"><div><div class="gt_title">'
        + tab.title
        + '</div><div style="clear:both"></div></div><div style="gt_img"><img src="'
        + tab.img + '"/></div></div>');
  } else if (hasIcon) {
    return $('<div class="gt_choice ' + (selected ? "gt_selected" : "gt_mini")
        + '" data-id="gt_tab_' + tab.id + '" data-tab-id="' + tab.id
        + '"><div><div class="gt_icon"><img src="' + tab.icon
        + '"/></div><div class="gt_title">' + tab.title
        + '</div><div style="clear:both;width:100%"></div></div></div>');
  } else {
    return $('<div class="gt_choice ' + (selected ? "gt_selected" : "gt_mini")
        + '" data-id="gt_tab_' + tab.id + '" data-tab-id="' + tab.id
        + '"><div><div class="gt_title">' + tab.title
        + '</div><div style="clear:both"></div></div></div>');
  }
};
var update = function() {
  chrome.extension.sendRequest({
    method : GET_SUGGESTIONS
  }, function(result) {
    if (result.type == undefined || result.type == ERROR) {
      return;
    }
    var suggestions = result.data;
    var nextAnimation = {
      time : new Date(),
      todo : {
        type : UPDATE_SUGGESTIONS,
        data : suggestions
      }
    };
    animation = nextAnimation;
  });
}
var stop = function() {
   enders.unshift({
    type : HIDE_CONTENT
  });
};