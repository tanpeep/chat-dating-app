import{ HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

@Injectable()
export class HelperService {
    constructor(private readonly httpService: HttpService) {}

    async makeGetRequest(url: string, token:string): Promise<any>{
        try {
            const headers = { 'Content-Type': 'application/json', Authorization: token }; // Replace with your desired headers
            const response = await this.httpService.get(url, { headers }).toPromise();
            console.log(response.data);
            return response.data
            // Process the response data
          } catch (error) {
            console.error(error);
          }
    }
}