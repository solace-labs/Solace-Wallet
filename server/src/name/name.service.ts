import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class NameService {
  nameService: any;
  userData: any;
  constructor(@Inject('orbitDb') private readonly orbitDb) {
    const { nameService, userData } = this.orbitDb;
    this.nameService = nameService;
    this.userData = userData;
  }

  async setName(name: string, address: string) {
    await this.nameService.put(name, address);
    const data = this.userData.get(address);
    await this.userData.put(
      address,
      {
        ...data,
        name,
      },
      { pin: true },
    );
  }

  getAddress(name: string) {
    return this.nameService.get(name);
  }

  async getName(address: string) {
    const data = await this.userData.get(address);
    return data;
  }
}
