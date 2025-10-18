import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS opsional (boleh nyala/mati karena FE pakai BFF)
  app.enableCors({ origin: [/^http:\/\/localhost:3000$/] });

  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port);
  console.log(`API listening on http://localhost:${port}`);
}
bootstrap();
