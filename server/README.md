# Twitter DOOH Solution

## Architecture

### Chrome extension
* Using the native twitter interface as search and advanced search for potential tweets to be displayed onto the screen. 
* Inserts a button "Feature This" in every tweet.
* Scrap HTML codes and image URI and send it to the server. 
    * Tweet copy (contains emojis)
    * Images or any preview image comes along with the tweet
    * Doesn't support GIF and video at the moment
    * User's display name (contains emojis)
    * Profile image (may change into automatically generating the URI path based on handle name)
* The logic of scraping is a quite fizzy. If twitter HTML structure changes, the scraping may fail.
* Needs constant monitor on HTML changes until we have better grasp of the stability
* Scraping HTML ensures twitter's emojis and custom emojis are correctly rendered
* Future development plans
    * Profanity(censorship) support
    * Recall a tweet: to remove it from the pending list if it is selected by mistake

### Admin module
* Moderate tweets into approved or rejected
* (Soon) Customize tweets display order
* (Later) Customize the output HTML
* (Later) User rights management


### Output HTML
* Decide how to display the tweets
* Handled by client's agency or 3rd party vendor


## Near TODO
* Re ordering of approved tweets
* Profanity support
* User register/login
* Permission management
* Change DB to MySQL