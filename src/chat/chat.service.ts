import { Timestamp } from '@google-cloud/firestore';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firestore } from 'src/firebase.service';

@Injectable()
export class ChatService {
    httpService: HttpService = new HttpService;
    auth_url: string = "http://34.70.123.231:80/api/profile/get_my_profile";
    
    async listRoom(userId: number): Promise<any> {

        const querySnapshot = await firestore.collection('chat').get();
        const room_list = [];

        querySnapshot.forEach((doc) => {
            if (doc.data().agents[0].id == userId || doc.data().agents[1].id == userId) {
                room_list.push({ id: doc.id, ...doc.data() });
            };
        });

        return room_list;
    }

    async getChat(id:number): Promise<any> {
        const data = await firestore.collection('chatroom').doc(id.toString()).get();
        const messages = data.data().messages;
        return messages;
    }

    async postChat(chat_room_id: number, content: string, userId: number): Promise<any> {
        const docRef = firestore.collection('chatroom').doc(chat_room_id.toString());
        const chatRef = firestore.collection('chat').doc(chat_room_id.toString());
        const documentSnapshot = await docRef.get();
        const chatSnapshot = await chatRef.get();
        var recipient_id = -1;

        if(chatSnapshot.data().agents[0].id == userId){
            recipient_id = chatSnapshot.data().agents[1].id;
        } else {
            recipient_id = chatSnapshot.data().agents[0].id;
        }

        if (documentSnapshot.exists) {
            const existingMessages: any[] = documentSnapshot.data().messages || [];

            const message: any = {
                id: existingMessages.length,
                sender_id: userId,
                recipient_id: recipient_id,
                message: content,
                timestamp: Timestamp.fromMillis(new Date().getTime())
            }

            existingMessages.push(message);
            await docRef.update({ messages: existingMessages });
            await chatRef.update({ last_chat: content });
        } else {
            throw new Error('Document not found');
        }
        return "Add message success";
    }

    async createRoom(agent_id: number, agent_username: string, userId: number, username: string): Promise<any> {
        const cntRef = firestore.collection('tes').doc('counter');
        const counter = (await cntRef.get()).data().chat + 1;

        const chat = {
            agents: [
                {
                    id: userId,
                    username: username
                },
                {
                    id: agent_id,
                    username: agent_username
                }
            ],
            last_chat: ""
        }

        const chatRef = firestore.collection('chat').doc(counter.toString());
        await chatRef.set(chat);

        const chatroomRef = firestore.collection('chatroom').doc(counter.toString());
        await chatroomRef.set({ messages: [] });

        await cntRef.update({ chat: counter });

        return "Create room success";
    }

    async deleteRoom(chat_room_id): Promise<any> {
        await firestore.collection('chatroom').doc(chat_room_id.toString()).delete();
        await firestore.collection('chat').doc(chat_room_id.toString()).delete();
        return "Delete chat room success";
    }
}
