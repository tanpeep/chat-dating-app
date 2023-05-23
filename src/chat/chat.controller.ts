import { Body, Controller, Delete, Get, Param, Post, Headers, Res, HttpStatus } from '@nestjs/common';
import { firestore } from 'src/firebase.service';
import { Timestamp } from '@google-cloud/firestore';
import { ChatService } from './chat.service';
import { HelperService } from 'src/helper.service';
import { HttpService } from '@nestjs/axios';
import { Response } from 'express';

@Controller('api/chat')
export class ChatController {
    httpService: HttpService = new HttpService;
    auth_url: string = "http://34.70.123.231:80/api/profile/get_my_profile";
    constructor(private readonly chatService: ChatService) { }


    @Get('list')
    async listRoom(@Headers('Authorization') authToken: string): Promise<any> {
        const userData = await this.getUser(authToken);
        const userId = userData[0];
        return this.chatService.listRoom(userId);
    }

    @Get(':id')
    async getChat(@Headers('Authorization') authToken: string,
        @Param('id') id: number): Promise<any> {
        try {
            const userData = await this.getUser(authToken);
            const userId = userData[0];
            return this.chatService.getChat(id, userId);
        } catch (error) {
            return { message: "Chat room unavailable for this user" };
        }
    }

    @Post('post')
    async postChat(@Headers('Authorization') authToken: string,
        @Body('chat_room_id') chat_room_id: number,
        @Body('message') content: string): Promise<any> {
        try {
            const userData = await this.getUser(authToken);
            const userId = userData[0];

            return this.chatService.postChat(chat_room_id, content, userId);
        } catch(error){
            return { message: "Chat room unavailable for this user" };
        }
    }

    @Post('create')
    async createRoom(@Headers('Authorization') authToken: string,
        @Body('agent_id') agent_id: number,
        @Body('agent_username') agent_username: string): Promise<any> {
        try {
            const userData = await this.getUser(authToken);
            const userId = userData[0];
            const username = userData[1];

            return this.chatService.createRoom(agent_id, agent_username, userId, username);
        } catch (error) {
            return { message: "Agent not found" };
        }
    }

    @Delete(':id')
    async deleteRoom(@Headers('Authorization') authToken: string,
        @Param('id') id: number, @Res() res: Response): Promise<any> {
        try {
            return this.chatService.deleteRoom(id);
        } catch (error) {
            return { message: "Chat room unavailable for this user" };
        }
    }

    async getUser(token: string) {
        var response;
        try {
            const headers = { 'Content-Type': 'application/json', Authorization: token }; // Replace with your desired headers
            response = await this.httpService.get(this.auth_url, { headers }).toPromise();
        } catch (error) {
            throw new Error('Failed to authenticate')
        }

        return [response.data.id, response.data.user.username]
    }
}
