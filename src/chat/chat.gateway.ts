import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { HttpService } from '@nestjs/axios';

@WebSocketGateway()
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  httpService: HttpService = new HttpService;
  auth_url: string = "http://34.70.123.231:80/api/profile/get_my_profile";
  constructor(private readonly chatService: ChatService) { }

  @WebSocketServer() server: Server;

  private readonly activeSockets: Map<string, Socket> = new Map<string, Socket>();

  async joinChatRoom(client: Socket, chatRoomId: string) {
    console.log(`Client ${client.id} joining chat room: ${chatRoomId}`);
    client.join(chatRoomId);
  }

  @SubscribeMessage('message')
  async handleMessage(client: Socket, chat_room_id: number, content: string) {
    const headers = client.handshake.headers;
    const authToken : string = headers.authorization;

    const headerz = { 'Content-Type': 'application/json', Authorization: authToken }; // Replace with your desired headers
    const response = await this.httpService.get(this.auth_url, { headers:headerz }).toPromise();
    const userId = response.data.id;

    console.log(`Received message from client ${client.id}:`, content);

    await this.chatService.postChat(chat_room_id, content, userId);

    this.server.to(chat_room_id.toString()).emit('message', content);
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
