import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';

@Component({
  selector: 'app-text-form',
  templateUrl: './text-form.component.html',
  styleUrls: ['./text-form.component.css']
})
export class TextFormComponent implements OnInit {
  sendForm: FormGroup;
  @Output() submitMessage: EventEmitter<any> = new EventEmitter<any>();
  
  constructor(public formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.sendForm = this.formBuilder.group({
      message: ['', Validators.required],
    });
  }

  onSendSubmit(): void {
    const localEmitter = this.submitMessage;
    localEmitter.emit(this.sendForm.value.message);
    this.sendForm.setValue({ message: '' });
  }
}
