import { HttpModule, HttpService } from '@nestjs/axios';
import {
    SubscribeMessage,
    WebSocketGateway,
    OnGatewayInit,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat/chat.service';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    httpService: HttpService = new HttpService;
    chatService: ChatService = new ChatService;
    auth_url: string = "http://34.70.123.231:80/api/profile/get_my_profile";

    @WebSocketServer() server: Server;

    private readonly activeSockets: Map<string, Socket> = new Map<string, Socket>();

    @SubscribeMessage('joinRoom')
    async joinChatRoom(
        @MessageBody('chat_room_id') chatRoomId: number,
        @ConnectedSocket() client: Socket,) {
        console.log(`Client ${client.id} joining chat room: ${chatRoomId}`);
        client.join(chatRoomId.toString());
    }

    @SubscribeMessage('message')
    async handleMessage(@ConnectedSocket() client: Socket,
        @MessageBody('chat_room_id') chat_room_id: number,
        @MessageBody('content') content: string) {
        const headers = client.handshake.headers;
        const authToken: string = headers.authorization;

        const headerz = { 'Content-Type': 'application/json', Authorization: authToken }; // Replace with your desired headers
        const response = await this.httpService.get(this.auth_url, { headers: headerz }).toPromise();
        const userId = response.data.id;

        console.log(authToken, content, chat_room_id, userId);

        await this.chatService.postChat(chat_room_id, content, userId);

        this.server.to(chat_room_id.toString()).emit('newMessage', content);
    }

    afterInit(server: Server) {
        console.log(server);
        //Do stuffs
    }

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
        this.activeSockets.set(client.id, client);
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
        this.activeSockets.delete(client.id);
    }
}