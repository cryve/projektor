Template.search.helpers({
  getPackages() {
    return PackageSearch.getData({
      transform(matchText, regExp) {
        return matchText.replace(regExp, '<b>$&</b>');
      },
      sort: { isoScore: -1 },
    });
  },

  isLoading() {
    return PackageSearch.getStatus().loading;
  },
});

Template.search.events({
  'keyup #search-box': _.throttle(function(e) {
    const text = $(e.target).val().trim();
    PackageSearch.search(text);
  }, 200),
});
