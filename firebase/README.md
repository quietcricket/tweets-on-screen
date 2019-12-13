# Firebase Based solution

## Rational
To make it easier for vendors to deploy their own instance of this app. 
Leverage Firestore real time synchronization function to push changes to end pages


## Components
* Chrome Plugin: for curators to shortlist tweets
    * Stack: static hosting of HTML & JS
    * Access rights: insert only to 'tweets' collection
    * Authentication: shared api_secret authentication
* Admin page: approve/reject tweets
    * Stack: static hosting of HTML & JS
    * Access rights: read/write access to 'tweets' collection
    * Authentication: Email authentication, predefined by firebase-cli
* Display page: display tweets in desired format
    * Stack: static hosting of HTML & JS
    * Access rights: read only to tweets collection

## Setup project
* http://console.firebase.google.com/
* Create project and specify region
* Run firebase init and follow the instructions prompt
    * Choose services: Firestore, Functions and Hosting for the first step
* Config settings.json
    * Project ID
    * API Key
    * Admin emails

## Local HTML server
* python3 server.py

## Allow video autoplay
* Only works on safari now, https://www.howtogeek.com/326532/safari-now-disables-auto-playing-videos.-heres-how-to-allow-them-for-certain-sites/

## How to change Web ApiKey
* The web api key is exposed in the chrome extension
* In the event the key is compromised, replace it with a different key
* https://console.developers.google.com/apis/credentials