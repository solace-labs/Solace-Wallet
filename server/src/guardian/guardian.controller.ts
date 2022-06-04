import { Body, Controller, Get, Post, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ResponseInterceptor } from '../common/interceptors/response.interceptor';
import { AddGuardianDto, GuardianDataRequestDto } from './dto/guardian.dto';
import { GuardainService } from './guardian.service';

@UseInterceptors(ResponseInterceptor)
@Controller('guardian')
@ApiTags('Guardian')
export class GuardianController {
  constructor(private readonly guardianService: GuardainService) {}

  @Post('/data')
  getGuardianData(@Body() data: GuardianDataRequestDto) {
    return this.guardianService.getGuardianData(data.userAddress);
  }

  @Post('/add')
  addGuardian(@Body() data: AddGuardianDto) {
    console.log(data);
    return this.guardianService.addGuardian(
      data.userAddress,
      data.guardianAddress,
    );
  }

  @Post('/remove')
  removeGuardian(@Body() data: AddGuardianDto) {
    return this.guardianService.removeGuardian(
      data.userAddress,
      data.guardianAddress,
    );
  }
}
