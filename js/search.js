var searchbox = $('#search_query'),
  searchpopup = $('#search_results'),
  resultlist = searchpopup.find('.resultlist');
searchpopup.search = function() {
  resultlist.tapir({
    'token':'51d2e6a86854880100000415',
    'complete': function() {
      $('#spinner').hide();
      resultlist.empty();
      searchpopup.show('fast');
    }
  });
}

// http://stackoverflow.com/a/8764051/15064
function getURLParameter(name) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
}

// Update search according to query
function updateSearch(query) {
  if (query) {
    $('#spinner').show();
    History.pushState(null, null, "?query="+query);
    searchpopup.search();
  } else {
    History.pushState(null, null, "?");
    searchpopup.hide("fast");
  }
}

$(function() {
  // check if we were loaded with a query param
  if (getURLParameter('query') != null) {
    searchbox.val(getURLParameter('query'));
    searchpopup.search();
  }
  // handler for close button
  $('#search_results a.close').click(function() {
    searchpopup.hide('fast');
  });
  // handler for focusing search box
  searchbox.focus(function() {
    // if there is a query, redisplay the results
    if ($(this).val()) {
      searchpopup.show('fast');
    } 
  });
  var query = searchbox.val();
  setInterval(function() {
    var newquery = searchbox.val();
    if (newquery != query) {
      query = newquery;
      updateSearch(query);
    }
  }, 400);
});

