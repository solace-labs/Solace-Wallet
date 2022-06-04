import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ResponseInterceptor } from '../common/interceptors/response.interceptor';
import {
  GetAddressFromNameDto,
  GetNameFromAddressDto,
  SetNameFromAddressDto,
} from './dto/name.dto';
import { NameService } from './name.service';

@UseInterceptors(ResponseInterceptor)
@Controller('name')
@ApiTags('name')
export class NameController {
  constructor(private readonly nameService: NameService) {}

  @Post('/set')
  setName(@Body() data: SetNameFromAddressDto) {
    return this.nameService.setName(data.name, data.address);
  }

  @Post('/get/name')
  getName(@Body() data: GetNameFromAddressDto) {
    return this.nameService.getName(data.address);
  }

  @Post('/get/address')
  getAddress(@Body() data: GetAddressFromNameDto) {
    return this.nameService.getAddress(data.name);
  }
}
