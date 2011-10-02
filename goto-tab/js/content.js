var backdrop = $("<div id='backdrop'></div>");
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
  backdrop.css("opacity", 0);
  main.append(content);
  main.css("opacity", 0);
  $("body").append(main);
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
      backdrop.css("opacity", 0);
      backdrop.remove();
      main.hide("slide", {
        direction : "left"
      }, function() {
        main.css("opacity", 0);
        content.children().remove();
        main.show();
        started = false;
        setTimeout(animate, 30);
      });
    }
  } else if (lastAnimation.time.getTime() < animation.time.getTime() && started) {
    // first get it
    lastAnimation = animation;
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
        box.removeClass("gt_unselected");
        destination.prepend(box);
      }
      $("div[data-id]").each(function(index) {
        var ob = $(this);
        if (!suggested[ob.attr("data-tab-id")]) {
          ob.removeAttr("data-selected");
          ob.removeClass("gt_selected");
          ob.addClass("gt_unselected");
        }
      });
      if (main.css("opacity") == 0) {
        content.quicksand(destination.children(), {
          duration : 1,
          useOpacity : true
        }, function() {
          main.hide();
          main.css("opacity", 1);
          $("body").append(backdrop);
          backdrop.css("opacity", .2);
          main.show("slide", {
            direction : "left"
          }, function() {
            setTimeout(animate, 30);
          });
        });
      } else {
        content.quicksand(destination.children(), {
          duration : 300,
          useOpacity : true
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
  var box = $("<div></div>");
  var clear = $("<div style='clear:both'></div>");
  box.addClass("gt_choice");
  box.attr("data-id", "gt_tab_" + tab.id);
  box.attr("data-tab-id", tab.id);

  if (hasImg && hasIcon) {
    box.addClass("gt_all");
    box.addClass("gt_unselected");

    var icon = $("<div></div>")
    icon.addClass("gt_icon");
    icon.append($("<img></img>").attr("src", tab.icon));

    var title = $("<div></div>");
    title.addClass("gt_title");
    title.html(tab.title);

    var img = $("<div></div>")
    img.addClass("gt_img");
    img.append($("<img></img>").attr("src", tab.img));

    var col = $("<div></div>");
    col.addClass("gt_tab");
    col.append(icon);
    col.append(title);
    col.append(clear);
    box.append(col);
    box.append(img);
    return box;
  } else if (hasImg) {
    box.addClass("gt_all");
    box.addClass("gt_unselected");

    var title = $("<div></div>");
    title.addClass("gt_title");
    title.html(tab.title);

    var img = $("<div></div>")
    img.addClass("gt_img");
    img.append($("<img></img>").attr("src", tab.img));

    var col = $("<div></div>");
    col.addClass("gt_tab");
    col.append(title);
    col.append(clear);
    box.append(col);
    box.append(img);
    return box;
  } else if (hasIcon) {
    box.addClass("gt_mini");
    box.addClass("gt_unselected");

    var icon = $("<div></div>")
    icon.addClass("gt_icon");
    icon.append($("<img></img>").attr("src", tab.icon));

    var title = $("<div></div>");
    title.addClass("gt_title");
    title.html(tab.title);

    var col = $("<div></div>");
    col.addClass("gt_tab");
    col.append(icon);
    col.append(title);
    col.append(clear);
    box.append(col);
    return box;
  } else {
    box.addClass("gt_mini");
    box.addClass("gt_unselected");

    var title = $("<div></div>");
    title.addClass("gt_title");
    title.html(tab.title);

    var col = $("<div></div>");
    col.addClass("gt_tab");
    col.append(title);
    col.append(clear);
    box.append(col);
    return box;
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