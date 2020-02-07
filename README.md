# Project CPT: **C**urate and **P**resent **T**weets

## Problem

Advertisers often want to present tweets in custom ways, customized designs, animations or even as prints or audio. Moderation is required to ensure the safety of the content. Most of the existing solutions in the market offer moderation and API for further implementation. However, they do not provide software development services to customize the presentation layer. Advertisers need to engage another software vendor who knows how to integrate with the API. Many advertisers gave up because there are too many parties involved. 

## Solution
Project CPT aims to provide a turnkey solution for advertisers to curate and present tweets. It is an open source based solution for any agency partner to download, deploy and customize. There are 3 components in CPT.

### Curation (Chrome Extension)
A Chrome extension is developed for the curators to shortlist tweets. The extension tweaks twitter.com by adding a “shortlist button” for each tweet. That button will send the tweet for final moderation, the approval panel.

### Approval (Web)
A web page is provided for advertisers to make a final decision which curated tweets should be featured. The 2 step (curate then approve) process is designed to tackle projects with high volume of content. Advertisers can engage multiple curators to look through more content. The process also reduces human errors.

### Presentation (Web and beyond)
Most projects use HTML as output format. At the moment, the project includes 2 default layouts implemented in JavaScript and CSS. It also offers a JavaScript library to build further customizations. Because of its open source nature, presentation implementations will grow by community’s contribution.

## Technical specifications
CPT uses JavaScript as the main programming language and Firebase for database, user authentication and hosting. There are also some python scripts to facilitate development but it is optional to use them.

### About Firebase
Firebase is product of Google Cloud Platform. Originally known for its push notification and analytics services. CPT uses Firebase for its the cloud computing services. 

#### Firestore
Firestore is a database as service product. It serves as the database layer without the need to setup any traditional hosting enviroment like PHP or Python etc. Firestore can be accessed using JavaScript in a normal HTML page. Access rights are configured via Firestore's rules. (I often mix up `Firebase` with `Firestore` when Googling about them. I hope you won't have the same problem)

#### Hosting
Web pages are hosted via Firebase's static site hosting services, which offers a secure certificate and a individual domain like `project-cpt.web.app`. You attach a custom domain but I feel it is not necessary unless the project is meant to be permenant. 

#### Fees
All projects are created under the free tier pricing model. The free tier is very generous and it should be able to handle most of the use cases. You can switch to "pay as you go" tier if you foresee heavy usage or just want to enjoy peace of mind.  


## User Guide
* Sign up a Firebase account at https://firebase.google.com/
* Download or check out the project. Create a separate fork if needed.
* Install nodejs
  * [Download installer](https://nodejs.org/en/download/) from the office nodejs website  
  * Run the installer
* Install firebase command line tool: `sudo npm install -g firebase-tools`
* In terminal, change to `firebase` folder of the downloaded project
* Run `firebase login` and follow the instruction to store the credentials into the folder
* Run `firebase init` to create a new project
* Choose not to overwrite existing `rules` and `indexes`
* Run `firebase serve` to run the local development server
* Alternative, you can use `python server.py`
  * The python scripts has livereload built in, which automatically reloads your browser when files are changed
  * However, this requires python 3 and livereload library
  * You need to run `pip install livereload` to fulfill the requirements
* To deploy the project, run `firebase deploy`
