import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFirestore } from '@angular/fire/firestore';

import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable()
export class FirebaseService {

  constructor(
      private af: AngularFireDatabase,
      private fs: AngularFirestore
    ) { }

  addItem(itemType: string, newItem: any) {
    return this.af.list(itemType)
    .push(newItem)
    .then((ref) => {
      ref.update({id: ref.key});
    });
  }

  getList(path: string) {
    return this.af.list(path);
  }

  deleteItem(itemType: string, path: string, itemId: string) {
    this.af.object(path).remove();
  }

  updateItem(itemType: string, itemId: string, updatedItem: any){
    this.af.object(itemType + '/' + itemId).update(updatedItem);
  }
  deleteAll()
  {
    this.af.object('equipment').remove();
  }

  // For upload images
  tests: Observable<any[]>;
  getTests() {
    this.tests = this.fs.collection('test').valueChanges();
    return this.tests;
  }

}


// profomal-invoice.firebaseio.com/equipment.json?auth=A9lyETzeAsl29bBF6nJwwaG0UWDj6urwJgNumIGV