import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { User, Address, states } from '../data-model';


@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.css']
})
export class UserDetailComponent implements OnInit {
  
  // Khai bao sử dụng trong user detail
  states = states;
  // Trong form group chứa nhiều form control
  userFormGroup: FormGroup;


  // đối tượng form builder tạo ra các control sử dụng trong validate
  constructor(private formBuilder: FormBuilder) { 
    this.createForm();
  }
  createForm() {
    this.userFormGroup = this.formBuilder.group({
      name: ['Hoang', [Validators.required, Validators.minLength(4)]],  
      // email: ['', [Validators.required, emailValidator()]],    
      email: ['', [Validators.required]],        
      addresses: this.formBuilder.group({ //the child FormGroup        
        street: ['', [Validators.required]],
        city: '',
        state: this.states[0],                 
      }),
    });
  }

  ngOnInit(): void {
  }

}
