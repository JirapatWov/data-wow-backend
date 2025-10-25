import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppDataSource } from 'dbConfig';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TransformInterceptor } from './interceptor/transform.interceptor';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        ...AppDataSource.options,
      }),
    }),
    AdminModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
