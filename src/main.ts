/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { allowedDomains } from './settings/corsWhitelist';
import { AllExceptionsFilter } from './common/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use((req, res, next) => {
    console.log('Incoming headers:', req.headers);
    next();
  });

  // Enable CORS
  app.enableCors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedDomains.includes(origin) ||
        origin.endsWith('.martinnotaryfl.com')
      ) {
        callback(null, true);
      } else {
        console.log("ORIGIN NOT ALLOWED :", origin);
        
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Enable global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(process.env.APP_PORT);
  console.log(`🚀 APP running on port ${process.env.APP_PORT}`);
}
bootstrap();
