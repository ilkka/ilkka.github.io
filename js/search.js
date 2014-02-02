var $searchbox = $('#search-query'),
  $maincontent = $('#main-content'),
  $searchresults = $('#search-results'),
  $searchclosebutton = $('#sitesearch button.close'),
  $searchspinner = $searchresults.find('.spinner'),
  $resultlist = $searchresults.find('.resultlist');
$searchresults.search = function() {
  $searchresults.tapir({
    'token':'51d2e6a86854880100000415',
    'complete': function() {
      $searchspinner.addClass('hidden');
      $resultlist.empty();
      $searchresults.removeClass('hidden');
      $maincontent.addClass('hidden');
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
    $searchspinner.removeClass('hidden');
    $searchclosebutton.removeClass('hidden');
    History.pushState(null, null, "?query="+query);
    $searchresults.search();
  } else {
    History.pushState(null, null, "?");
    $searchresults.addClass('hidden');
    $maincontent.removeClass('hidden');
  }
}

$(function() {
  // check if we were loaded with a query param
  if (getURLParameter('query') != null) {
    $searchbox.val(getURLParameter('query'));
    $searchresults.search();
  }
  // handler for focusing search box
  $searchbox.focus(function() {
    // if there is a query, redisplay the results
    if ($(this).val()) {
      $searchresults.removeClass('hidden');
      $maincontent.addClass('hidden');
    } 
  });
  // handler for clearing search
  $searchclosebutton.on('click', function () {
    $searchbox.val('');
    updateSearch('');
    $(this).addClass('hidden');
  });
  // store old value and update search on change
  var query = $searchbox.val();
  setInterval(function() {
    var newquery = $searchbox.val();
    if (newquery != query) {
      query = newquery;
      updateSearch(query);
    }
  }, 400);
});

