# Platonic

This project was originally copied from https://github.com/petr166/mean-chat-app.

# SEG 4105 Deliverable #0 Details

## Team Members With Student IDs
Cheryl Jean Tollola		8317298
Amin Dhouib				300025259
Frank Wang 				6040795
Shaafici Ali			8666419

## Software Project Description
We are currently creating a Conversation Management Platform in a form of a web application. In this platform, users can debate and address specific topics civilly and directly. This app mainly targets users who want to make intelligent conversations about very critical matters.

## Tools Used For Project Management
To manage our project, **GitHub** and **Basecamp** will be used. GitHub will host all of the source code files for our Conversation Management Platform. The new feature that we will add will be shown in our GitHub project. Basecamp will host all of the other project details such as Hill Charts, Project Tasks, and Team Details & Roles. 

Link to the GitHub Repository: 
> https://github.com/TianrenWang/platonic

Link To The Basecamp Project:
> https://3.basecamp.com/4858499/projects/18938892

# Setup Instruction
1. From https://nodejs.org/en/download/, download the latest version that is most appropriate for you.
2. Go to your command line and do `sudo npm install -g @angular/cli`
3. From https://www.mongodb.com/try/download/community, download the latest version of community that is the most appropriate for you.
4. Unpack the MongoDB zip/tar.gz file, and you will end up with a folder. Rename that folder as “mongodb”. Put that folder somewhere safe, like your Desktop or Document. In that safe location, create another folder called “mongodb-data” that will store all MongoDB data on your local server.
5. Depending on where you put these folders, later you are going to need this command `/<safe_location>/mongodb/bin/mongod --dbpath=/<safe_location>/mongodb-data`. Remember this command.
6. Perform `git clone` on the Platonic repository. `cd` to that repository and run `npm i`.
7. Run `cp .env.example .env`
8. Run `/<safe_location>/mongodb/bin/mongod --dbpath=/<safe_location>/mongodb-data`
9. Open up a new command line/terminal in platonic repository, and run `npm run dev`.
10. Open up a new command line/terminal in platonic repository, and run `ng serve`.

At the end of this, you should be able to access http://localhost:4200/ and see the Platonic homepage.
