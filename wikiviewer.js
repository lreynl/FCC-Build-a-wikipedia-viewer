//push enter to search
$(function() {
  $("#search input").keypress(function(key) {
    if (key.keyCode == 13) {
      search();
    }
  });
});

$("#clear").click(function() {
  $("#toFind").val('');
  $("#toFind").focus(); //put cursor in box
});

//wrapper for findIt() (user input)
function search() {
  var q = $("#toFind").val();
  if(q == "") return;
  findIt("https://en.wikipedia.org/w/api.php?action=opensearch&search=" + q + "&format=json&callback=?", q);
}

//wrapper for findIt() (random article)
function rndArticle() {
  findIt("https://en.wikipedia.org/w/api.php?action=query&list=random&rnnamespace=0&format=json&callback=?", 'RND');
}

//get suggested articles
function findIt(url, q) {
  console.log(url);
  $("#wiki").slideUp("slow");
  $("#results-outer").slideUp("slow");
  document.getElementById("wiki").innerHTML = "";
  $.ajax({
    url: url,
    type: 'GET',
    dataType:'json',
    success: function(data) {
      console.log(data);
      $("ul").empty();
      //if random article, call getIt() & return
      if(q == 'RND') {
        return getIt(data.query.random[0].title);
      }
      document.getElementById("wiki").style.padding = "0px";
      document.getElementById("results").style.padding = "30px";
      if(data[1].length == 0) {
        $("#results").append("<li><h4>(╯°□°）╯︵ ┻━┻</h4> (Nothing found)</li>");
        $("#results-outer").slideDown("slow");
        return;
      }
      var len = data[1].length;
      for(var i = 0; i < len; i++) {
        if(typeof data[1][i] != 'undefined') {
          //if it has a disambiguation page, open in new window
          if(data[2][i].includes("may refer to")) {
            $("#results").append("<li><h4>" + data[1][i] + "</h4><span>" + data[2][i] + "</span>..<a href='https://en.wikipedia.org/wiki/" + data[1][i] + "\' target='_blank'>Continue reading</a></li>");
          //else, add item to list
          } else {
            $("#results").append("<li><h4>" + data[1][i] + "</h4><span>" + data[2][i] + "</span>..<a href='#' onclick='return getIt(\"" + data[1][i] + "\")'>Continue reading</a></li>");
          }
        }
      }
      $("#results-outer").slideDown("slow");
    }
  });
}

//get specific article
function getIt(toGet) {
  if(toGet == "") return;
  $("#wiki").slideUp("slow");
  $("#results-outer").slideUp("slow");
  document.getElementById("results-outer").style.padding = "0px";

  $("ul").empty();
  $.ajax({
    type: "GET",
    url: "https://en.wikipedia.org/w/api.php?action=parse&format=json&prop=text&section=0&page=" + toGet + "&callback=?",
    contentType: "application/json; charset=utf-8",
    async: false,
    dataType: "json",
    success: function (data) {
      $("#toFind").val(toGet);
      var html = data.parse.text["*"];
      var text = $('<div></div>').html(html);
      //remove links
      text.find('a').each(function() {
        $(this).replaceWith($(this).html());
      });
      //remove references
      text.find('sup').remove();
      //remove cite error
      text.find('.mw-ext-cite-error').remove();
      $('#wiki').html($(text).find('p'));
      $("#wiki").append("<a href='https://en.wikipedia.org/wiki/" + toGet + "'  target=\'_blank\'>Read full article at Wikipedia</a>");
      document.getElementById("wiki").style.padding = "30px";
      $("#wiki").slideDown("slow");
    },
    error: function (errorMessage) {
      console.log("something went wrong");
    }
  });
}
