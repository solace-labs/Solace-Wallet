import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WalletsModule } from './wallets/wallets.module';
import { GuardianModule } from './guardian/guardian.module';
import { NameModule } from './name/name.module';
import * as IPFS from 'ipfs';
import * as OrbitDB from 'orbit-db';

export const OrbitProvider = {
  provide: 'orbitDb',
  useFactory: async () => {
    const ipfs = await IPFS.create({
      repo: './orbitdb/examples/ipfs',
      start: true,
    });
    const orbitdb = await OrbitDB.createInstance(ipfs, {
      directory: './orbitdb/examples/keyvalue',
    });

    // Create / Open a database
    const nameService = await orbitdb.kvstore('solace-name-service', {
      overwrite: true,
    });
    const userData = await orbitdb.kvstore('solace-user', {
      overwrite: true,
    });

    console.log(userData.address.toString());
    console.log(nameService.address.toString());
    return await { nameService, userData };
  },
};

@Global()
@Module({
  imports: [WalletsModule, GuardianModule, NameModule],
  controllers: [AppController],
  providers: [AppService, OrbitProvider],
  exports: [OrbitProvider],
})
export class AppModule {}
