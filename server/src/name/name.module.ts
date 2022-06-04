import { Module } from '@nestjs/common';
import { NameService } from './name.service';
import { NameController } from './name.controller';

@Module({
  controllers: [NameController],
  providers: [NameService]
})
export class NameModule {}
