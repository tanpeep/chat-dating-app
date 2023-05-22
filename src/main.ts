import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cors());
  app.enableCors();
  await app.listen(3000);

  const secondapp = await NestFactory.create(AppModule);
  secondapp.use(bodyParser.urlencoded({ extended: true}));
  secondapp.use(cors());
  secondapp.enableCors();
  await secondapp.listen(3010);
}
bootstrap();
