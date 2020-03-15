import { Component, ChangeDetectorRef, ElementRef, ViewChild, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, AbstractControl, ValidatorFn } from "@angular/forms";
import { FirebaseService } from './services/firebase.service';
import { Request, Equipment, Department } from './data-model';
import { AngularFireStorage } from '@angular/fire/storage';
import 'firebase/storage';

import $ from 'jquery';
import { finalize, publish } from 'rxjs/operators';
import { Observable } from 'rxjs/internal/Observable';

import { NotifierService } from 'angular-notifier';

import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { NgxImageCompressService } from 'ngx-image-compress';
import { DatePipe } from '@angular/common';
import { error } from '@angular/compiler/src/util';
//resize images 

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})




export class AppComponent {
  submitted = false;
  modalRef: BsModalRef;
  message: string;

  showIdRequest: string = 'hoangdeptrai';

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, Object.assign({}, { class: 'gray modal-sm mt-5 pt-5' }));
  }
  @ViewChild('template1') public template1: TemplateRef<any>;


  decline(): void {
    this.modalRef.hide();
  }


  // List depart
  department = Department;
  registrationForm: FormGroup;
  equipmentList: FormArray;

  constructor(
    public fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private fs: FirebaseService,
    private fileStore: AngularFireStorage,
    private notifier: NotifierService,
    private modalService: BsModalService
    , private imageCompress: NgxImageCompressService
  ) {
    this.createForm();
  }

  ngOnInit() {
    this.responsiveTable();
    // this.addTable();
  }
  public showNotification(type: string, message: string): void {
    this.notifier.notify(type, message);
  }

  // convenience getter for easy access to form fields
  get f() { return this.registrationForm; }
  createForm() {
    /*##################### Registration Form #####################*/
    this.registrationForm = this.fb.group({
      requestInfor: this.fb.group({
        IdRequest: ['FIH-' + new Date().getDate() + new Date().getHours() + new Date().getMilliseconds(), [Validators.required]],
        IncomingDate: ['', [Validators.required, ValidateCurrenDate]],
        OutgoingDate: ['', [Validators.required]],
        HostName: ['', [Validators.required, Validators.minLength(3)]],
        Department: this.department[0],
        Remark: [''],
      }, { validator: equalValueValidator('IncomingDate', 'OutgoingDate') }  // key is to validate on the form group
      ),
      requesterInfor: this.fb.group({
        Name: ['', [Validators.required, Validators.minLength(3)]],
        PhoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
        Company: ['', Validators.required],
        Address: ['', Validators.required],
        // Email: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$')]],
        Email: ['', [Validators.required]],
      }),
      equipmentList: this.fb.array([
        this.createItem(),
      ])
    })
  }

  createItem(): FormGroup {
    return this.fb.group({
      Name: ['', Validators.required],
      PartCode: ['', Validators.required],
      QuantityNumber: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      QuantityWord: [''],
      file: [null],
      EquipmentRemark: [''],
      // add more
      imageUrl: ['https://i.pinimg.com/originals/ed/eb/45/edeb456ee83829c5fa14f9484ffe7eac.png'],
      editFile: true,
      removeUpload: false
    });
  }

  public AddRow(index: number): void {
    const newRow = this.registrationForm.controls.equipmentList as FormArray;
    newRow.push(this.fb.group({
      Name: ['', Validators.required],
      PartCode: ['', Validators.required],
      QuantityNumber: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      QuantityWord: [''],
      file: [null],
      EquipmentRemark: [''],
      // add more
      imageUrl: ['https://i.pinimg.com/originals/ed/eb/45/edeb456ee83829c5fa14f9484ffe7eac.png'],
      editFile: true,
      removeUpload: false
    }));
  }


  public RemoveRow(index: number) {
    const thisFile = this.registrationForm.controls.equipmentList as FormArray;
    if (thisFile.at(index).get('imageUrl').value.toString() != 'https://i.pinimg.com/originals/ed/eb/45/edeb456ee83829c5fa14f9484ffe7eac.png') {
      this.fileStore.storage.refFromURL(thisFile.at(index).get('imageUrl').value.toString()).delete();
    }

    const removeRow = this.registrationForm.controls.equipmentList as FormArray;
    removeRow.removeAt(index);
  }

  get GetArrayControl() {
    const thatItem = this.registrationForm.get('equipmentList') as FormArray;
    return thatItem;
  }


  // For edit in form array (table)
  customTrackBy(index: number, obj: any): any {
    return index;
  }


  imgResultBeforeCompress: string;

  imgResultAfterCompress: string;

  compressFile(index: number, imageName: number) {

    const thisFile = this.registrationForm.controls.equipmentList as FormArray;
    this.imageCompress.uploadFile().then(({ image, orientation }) => {
      this.imgResultBeforeCompress = image;
      let downloadURL: string[] = [];
      $('#btnSubmit').attr('disabled', true);
      this.notifier.notify('info', 'Image uploading...');
      this.imageCompress.compressFile(image, orientation, 30, 30).then(
        result => {
          console.log('1');
          thisFile.at(index).patchValue({
            imageUrl: 'https://i.pinimg.com/originals/d7/1e/42/d71e42a4dde817b718d67c51ee40f8ae.gif',
            editFile: false,
            removeUpload: true
          });
          fetch(result)
            .then(res => res.blob())
            .then(blob => {
              var convertFile = new File([blob], "File name", { type: "image/png" })
              const path = imageName + `/Images` + index + `.png`;
              const fileRef = this.fileStore.ref(path);
              const task = this.fileStore.ref(path).put(convertFile);
              task
                .snapshotChanges()
                .pipe(finalize(() => {
                  fileRef.getDownloadURL().subscribe(profilePicture => {
                    downloadURL.push(profilePicture);
                    this.notifier.hideNewest();
                    $('#btnSubmit').attr('disabled', false);
                    console.log('2');
                    thisFile.at(index).patchValue({
                      imageUrl: downloadURL,
                      editFile: false,
                      removeUpload: true
                    });
                  });
                })
                )
                .subscribe();
            })


        }
      );
    });

  }
  /*########################## File Upload ########################*/


  @ViewChild('fileInput') el: ElementRef;

  uploadFile(event, index: number, imageName: number) {
    this.notifier.notify('info', 'Image uploading...');
    let reader = new FileReader(); // HTML5 FileReader API
    let file = event.target.files[0];

    $('#btnSubmit').attr('disabled', true);

    // Resize Image

    // Upload file
    let downloadURL: string[] = [];

    const path = imageName + `/Images` + index + `.jpg`;
    const fileRef = this.fileStore.ref(path);
    const task = this.fileStore.ref(path).put(file);
    task
      .snapshotChanges()
      .pipe(finalize(() => {
        fileRef.getDownloadURL().subscribe(profilePicture => {
          downloadURL.push(profilePicture);
          this.notifier.hideNewest();
          $('#btnSubmit').attr('disabled', false);
        });
      })
      )
      .subscribe();

    if (event.target.files && event.target.files[0]) {
      reader.readAsDataURL(file);
      // When file uploads set it to file formcontrol
      reader.onload = () => {
        const thisFile = this.registrationForm.controls.equipmentList as FormArray;
        thisFile.at(index).patchValue({
          imageUrl: downloadURL,
          editFile: false,
          removeUpload: true
        });
      }
      // ChangeDetectorRef since file is loading outside the zone
      this.cd.markForCheck();
    }
  }

  // Function to remove uploaded file
  removeUploadedFile(index: number) {
    const thisFile = this.registrationForm.controls.equipmentList as FormArray;
    // delete  old file on firebase
    this.fileStore.storage.refFromURL(thisFile.at(index).get('imageUrl').value.toString()).delete();

    thisFile.at(index).patchValue({
      imageUrl: 'https://i.pinimg.com/originals/ed/eb/45/edeb456ee83829c5fa14f9484ffe7eac.png',
      editFile: true,
      removeUpload: false
    });

    // Update in list 
    // let item = this.userTestStatus.find(x => x.id === index)
    // item.imageUrl = null,
    // item.removeUpload = false,
    // item.editFile = true


    // let newFileList = Array.from(this.el.nativeElement.files);
    // this.editFile = true;
    // this.removeUpload = false;
  }





  //======================================================================================================

  // Js Config
  // For table responsive
  responsiveTable() {
    $(document).ready(function () {
      // inspired by http://jsfiddle.net/arunpjohny/564Lxosz/1/
      // $('.table-responsive-stack').find("th").each(function (i) {
      //    $('.table-responsive-stack td:nth-child(' + (i + 1) + ')').prepend('<span class="table-responsive-stack-thead">'+ $(this).text() + ':</span> ');
      //    $('.table-responsive-stack-thead').hide();
      // });
      $('.table-responsive-stack').each(function () {
        var thCount = $(this).find("th").length;
        var rowGrow = 100 / thCount + '%';
        //console.log(rowGrow);
        $(this).find("th, td").css('flex-basis', rowGrow);
      });
      function flexTable() {
        if ($(window).width() < 768) {

          $(".table-responsive-stack").each(function (i) {
            $(this).find(".table-responsive-stack-thead").show();
            $(this).find('thead').hide();
          });
          // window is less than 768px
        } else {
          $(".table-responsive-stack").each(function (i) {
            $(this).find(".table-responsive-stack-thead").hide();
            $(this).find('thead').show();
          });
        }
        // flextable
      }
      flexTable();
      window.onresize = function (event) {
        flexTable();
      };
      // document ready
    });
  }

  addTable() {
    $(document).ready(function () {
      // inspired by http://jsfiddle.net/arunpjohny/564Lxosz/1/
      $("#add_row").on("click", function () {
        // Dynamic Rows Code
        // Get max row id and set new id
        var newid = 0;
        $.each($("#tableOne tr"), function () {
          if (parseInt($(this).data("id")) > newid) {
            newid = parseInt($(this).data("id"));
          }
        });
        newid++;

        // var hoang = $('#add_row').outerHTML.toString().substring($('#add_row').outerHTML.toString().indexOf('_'),$('#add_row').outerHTML.toString().indexOf('='))
        // var hoang = $('#add_row').outerHTML.toString().substr(4,$('h2').outerHTML.toString().indexOf('=')-4)
        console.log();

        var tr = $("<tr></tr>", {
          id: "addr" + newid, "data-id": newid
        });
        // loop through each td and create new elements with name of newid
        $.each($("#tableOne tbody tr:nth(0) td"), function () {
          var td;
          var cur_td = $(this);

          var children = cur_td.children();

          // add new td and element if it has a nane
          if ($(this).data("name") !== undefined) {
            td = $("<td></td>", {
              "data-name": $(cur_td).data("name")
            });

            var c = $(cur_td).find($(children[0]).prop('tagName')).clone().val("");
            var c1 = $(cur_td).find($(children[1]).prop('tagName')).clone().val("");

            c.attr("name", $(cur_td).data("name") + newid);
            c1.attr("name", $(cur_td).data("name") + newid);

            c.appendTo($(td));
            c1.appendTo($(td));

            td.appendTo($(tr));
          } else {
            td = $("<td></td>", {
              'text': $('#tableOne tr').length
            }).appendTo($(tr));
          }
        });

        this.focus();

        // add the new row
        $(tr).appendTo($('#tableOne'));

        $(tr).find("td button.row-remove").on("click", function () {
          $(this).closest("tr").remove();
        });
      });
      // Sortable Code
      var fixHelperModified = function (e, tr) {
        var $originals = tr.children();
        var $helper = tr.clone();

        $helper.children().each(function (index) {
          $(this).width($originals.eq(index).width())
        });
        return $helper;
      };
      // document ready
    });
  }

  onReset() {
    this.registrationForm.reset();
    this.createForm();
  }
   
  closeForm()
  {
    this.modalRef.hide();
  }
  
  

  // Submit Registration Form
  onSubmit() {
    // console.log(this.registrationForm.value);
    this.submitted = true;
    // // stop here if form is invalid
    if (this.registrationForm.invalid) {
      this.modalRef.hide();
      this.notifier.notify('error', 'Please re-check all information, Some field are required with (*)');
      return;
    }

    // delete  old file on firebase

    // Change datetime to store firebase
    const thisFile = this.registrationForm.get('requestInfor.IncomingDate');
    const thisFile1 = this.registrationForm.get('requestInfor.OutgoingDate');
    var datePipe = new DatePipe('en-US');
    var newDate = datePipe.transform(thisFile.value, 'dd/MM/yyyy');
    thisFile.setValue(newDate);
    var newDate1 = datePipe.transform(thisFile1.value, 'dd/MM/yyyy');
    thisFile1.setValue(newDate1);


    // Upload image
    this.fs.addItem('equipment', this.registrationForm.value)
      .then((success) => {
        this.showIdRequest = this.registrationForm.get('requestInfor.IdRequest').value;
        this.modalRef = this.modalService.show(this.template1, Object.assign({}, { class: 'gray modal-md mt-5 pt-5' }));
        this.registrationForm.reset();
        this.createForm();
      });
    this.submitted = false;
    this.modalRef.hide();
  }
}


// For custome validate
export function ValidateCurrenDate(control: AbstractControl) {
  if (control.value < new Date().setDate(new Date().getDate() - 1)) {
    return { dateIn: true };
  }
  return null;
}

export function equalValueValidator(targetKey: string, toMatchKey: string): ValidatorFn {
  return (group: FormGroup): { [key: string]: any } => {
    const target = group.controls[targetKey];
    const toMatch = group.controls[toMatchKey];
    if (target.touched && toMatch.touched) {
      const isMatch = target.value <= toMatch.value;
      // set equal value error on dirty controls
      if (!isMatch && target.valid && toMatch.valid) {
        toMatch.setErrors({ equalValue: targetKey });
        const message = targetKey + ' != ' + toMatchKey;
        return { 'equalValue': message };
      }
      if (isMatch && toMatch.hasError('equalValue')) {
        toMatch.setErrors(null);
      }
    }
    return null;
  };
}