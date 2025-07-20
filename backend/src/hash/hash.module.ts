import { Module } from '@nestjs/common';
import { HashService } from './hash.service';

@Module({
  providers: [HashService],
  controllers: [],
  exports: [HashService],
})
export class HashModule {}
