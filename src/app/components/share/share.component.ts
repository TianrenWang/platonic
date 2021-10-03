import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Message } from 'src/app/models/message.model';
import { DialogueAPIService } from 'src/app/services/dialogue-api.service';
import { SaveDialogueComponent } from '../save-dialogue/save-dialogue.component';

const whatsappDate = RegExp('[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9], [0-9]*:[0-9][0-9]:[0-9][0-9] [A|P]M');
const timeToday = RegExp('[0-9]*:[0-9][0-9] [A|P]M');
const recentDate = RegExp('/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)$/ [0-9]*:[0-9][0-9] [A|P]M');

@Component({
  selector: 'app-share',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.css']
})
export class ShareComponent implements OnInit {
  rawTextMessages: string = "";
  previewMessages: Array<Message> = []
  exampleFormat: string = "";

  constructor(
    private dialog: MatDialog,
    private dialogueService: DialogueAPIService,
  ) { }

  ngOnInit(): void {
    let exampleFormatLines = [];
    exampleFormatLines.push("Example Format\n");
    exampleFormatLines.push("Fri 7:15 PM");
    exampleFormatLines.push("Daenerys");
    exampleFormatLines.push("Thank you for travelling so far my lord.");
    exampleFormatLines.push("Daenerys");
    exampleFormatLines.push("Daenerys Targaryen");
    exampleFormatLines.push("I hope the sea wasn't too rough.");
    exampleFormatLines.push("Jon");
    exampleFormatLines.push("The winds were kind your grace.");
    exampleFormatLines.push("Jon");
    exampleFormatLines.push("Jon Snow");
    exampleFormatLines.push("I am the king of the north.");
    this.exampleFormat = exampleFormatLines.join("\n");
  }

  // getTextAsMessages(text: string): any {
  //   let messageList: Array<Message> = [];
  //   let match = date.exec(text);
  //   if (!match){
  //     return null
  //   }
  //   let nextMatch = null;
  //   while (match) {
  //     let messageDate = new Date(match[0])
  //     text = text.substring(match.index + match[0].length + 2)
  //     let username = text.substring(0, text.indexOf(":"));
  //     nextMatch = date.exec(text);
  //     let message = text.substring(text.indexOf(":") + 2);
  //     if (nextMatch){
  //       message = text.substring(text.indexOf(":") + 2, nextMatch.index - 2)
  //     }
  //     let newMessage: Message = {
  //       created: messageDate,
  //       from: username,
  //       text: message,
  //       channelId: null,
  //       inChatRoom: false,
  //       index: messageList.length,
  //       mine: false,
  //       sid: null,
  //       attributes: null,
  //       _id: null
  //     };
  //     messageList.push(newMessage)
  //     match = nextMatch;
  //     nextMatch = null;
  //   }
  //   return messageList
  // }

  getTextAsMessagesOnFacebook() {
    let lines = this.rawTextMessages.split('\n');
    let possibleSenderNames = {};
    this.previewMessages = [];

    // Determine the names of the participants of the texts
    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];
      if (line === "You sent" && index - 2 > 0){
        let previousSenderName = lines[index - 2];
        if (previousSenderName !== "You sent"){
          if (!possibleSenderNames[previousSenderName]){
            possibleSenderNames[previousSenderName] = 0;
          }
          possibleSenderNames[lines[index - 2]] += 1;
        }
      }
      if (index > 20){
        break;
      }
    }

    let totalAppearances = 0;
    let actualSenderNames: Array<string> = [];
    let actualSenderFullnames: Array<string> = [];
    Object.keys(possibleSenderNames).forEach(name => {
      totalAppearances += possibleSenderNames[name]
    });
    Object.keys(possibleSenderNames).forEach(name => {
      if (possibleSenderNames[name] * 1.0 / totalAppearances > 0.3){
        actualSenderNames.push(name.split(' ')[0]);
        actualSenderFullnames.push(name);
      }
    });

    // Create the messages
    let currentTime: Date = this.getProperDate(lines[0]);
    let currentUser: string = actualSenderNames[0];
    let indexOfReplyString = -1;

    for (let index = 1; index < lines.length; index++) {
      let line = lines[index];
      let date = this.getProperDate(line);
      if (actualSenderNames.includes(line)){
        currentUser = line;
      } else if ((indexOfReplyString = line.indexOf(" replied to you")) > -1){
        let replier = line.substring(0, indexOfReplyString);
        if (actualSenderNames.includes(replier)){
          currentUser = replier;
        }
      } else if ((indexOfReplyString = line.indexOf("You replied to ")) > -1){
        currentUser = "Me";
      } else if (line === "You sent"){
        currentUser = "Me";
      } else if (date){
        currentTime = date;
      } else if (!actualSenderFullnames.includes(line)){
        if (line === "Original message:"){
          index += 1;
          line = "Replied to original message: \"" + lines[index] + "\"";
        }
        this.previewMessages.push({
          created: currentTime,
          from: currentUser,
          text: line,
          dialogue: null,
          attributes: null,
          _id: null
        });
        currentTime = new Date(currentTime.getTime() + 1000);
      }
    }
  }

  getProperDate(text: string): Date{
    if (!isNaN(Date.parse(text))){
      return new Date(text);
    }
    let timeTodayMatch = timeToday.exec(text);
    if (timeTodayMatch){
      return new Date(new Date().toDateString() + " " + timeTodayMatch[0])
    }
    let recentDateMatch = recentDate.exec(text);
    if (recentDateMatch){
      let dayString = recentDateMatch[0].substring(0, 3);
      let day;
      if (dayString === "Mon") day = 1;
      if (dayString === "Tue") day = 2;
      if (dayString === "Wed") day = 3;
      if (dayString === "Thu") day = 4;
      if (dayString === "Fri") day = 5;
      if (dayString === "Sat") day = 6;
      if (dayString === "Sun") day = 7;
      let today = new Date();
      let dayDifference = today.getDay() - day;
      if (dayDifference <= 0) dayDifference += 7;
      let date = new Date();
      date.setDate(date.getDate() - 2);
      return new Date(date.toDateString() + " " + timeTodayMatch[0].substring(4))
    }
    return null;
  }

  archiveChat() {
    let defaultDialogueData = {
      title: `Text messages submitted on ${new Date().toString()}`,
      description: "A pleasant conversation to go down in history."
    }

    const dialogRef = this.dialog.open(SaveDialogueComponent, {
      width: '40%',
      minWidth: '400px',
      data: defaultDialogueData
    });

    dialogRef.afterClosed().subscribe((dialogueData: any) => {
      if (dialogueData){
        this.dialogueService.createDialogue(
          dialogueData.title,
          dialogueData.description,
          this.previewMessages,
        ).subscribe((dialogue) => {
          console.log(dialogue)
        })
      }
    });
  }
}
