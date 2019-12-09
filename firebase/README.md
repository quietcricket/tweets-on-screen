# Firebase Based solution

## Rational
To make it easier for vendors to deploy their own instance of this app. 
Setting up a python + SQL server is kind of troublesome


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
* Cloud Function: pull tweet details
    * Triggered when new tweet get shortlisted

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

## How to change Web ApiKey
* The web api key is exposed in the chrome extension
* In the event the key is compromised, replace it with a different key
* https://console.developers.google.com/apis/credentials