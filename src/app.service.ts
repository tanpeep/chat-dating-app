import { Injectable } from '@nestjs/common';
import { firestore } from './firebase.service';

@Injectable()
export class AppService {
  getHello(): string {
    return "TES";
  }

  async tesFire(): Promise<string> {
    console.log('coba');
    const res = await firestore.collection('tes').doc('hello').get();
    console.log(res.data());
    return res.data().data;
  }
}
