import { Module } from '@nestjs/common';
import { GuardainService as GuardianService } from './guardian.service';
import { GuardianController } from './guardian.controller';
import { OrbitProvider } from '../app.module';

@Module({
  controllers: [GuardianController],
  providers: [GuardianService],
})
export class GuardianModule {}
