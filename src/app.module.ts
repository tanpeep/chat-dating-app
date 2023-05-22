import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule } from './chat/chat.module';
import { HelperService } from './helper.service';
import{ HttpModule } from '@nestjs/axios';
import { AppGateway } from './app.gateway';

@Module({
  imports: [ChatModule, HttpModule],
  controllers: [AppController],
  providers: [AppService, HelperService, AppGateway],
})
export class AppModule {}
