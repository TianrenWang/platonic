Emailer README

Explanation:
Set the following environment variables, replacing [variableinclusive] with what's needed as input
sr=[ouremail@gmail.com] //email that will send 
pwd=[ourEmailPassword] 
rc=[example@gmail.com] //email that will receive
sjt=[examplesubject]
msg=["here's an update :)"] //note, that to add spaces, you need the quotes on either end of the text

NOTE:
//for futher extension, the code has an html type that can be sent from our email to the receiver 

STEPS:
1. npm install nodemailer
2. Run in the home project folder: 
sr='' pwd='' rc='' sjt='' msg='' node emailer.js
