This is a chrome extension that uses the omnibox to navigate between tabs.


Releases:

v1.1 (unreleased)

* Popout drawer on page with options page to toggle off or on
* 2 versions of extension for different permissions. One with pop out drawer and one without

v1.0.6

* Major bug fix with handling instant load pages or omnibox pages

v1.0.5

* Search also through URL of tabs

v1.0.4

* Fixed issue with title not being updated for suggestions
* Fixed issue with manual window change not updating history

v1.0.3

* Suggestions are now ordered by last viewed
* The tab the user is moved to is the top suggestion for the given search

v1.0.2

* Removed permissions for data

v1.0.1

* Fix for suggestion break when a page title has "<","&", or ">" : https://github.com/mikeyfujihara/goto-tab/issues/5 


v1.0.0

* "gt" then tab : search through tabs using title match
* "gt" then - : goes to the last tab


Known Issues

* When toggling through suggestions in omnibox, the overlay on page disappears. This is due to Chromes event sequence for omnibox events.
* Only http/https pages have page suggestions because Chromes Extension API doesn't allow content scripts in those pages
* Only "gt" can be used as the keyword due to Chrome Extension API restrictions
