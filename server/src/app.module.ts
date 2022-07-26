import { Global, Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { WalletsModule } from "./wallets/wallets.module";
import { GuardianModule } from "./guardian/guardian.module";
import { NameModule } from "./name/name.module";
import * as IPFS from "ipfs";
import * as OrbitDB from "orbit-db";
import { Client, KeyInfo, ThreadID } from "@textile/hub";

export const OrbitProvider = {
  provide: "orbitDb",
  useFactory: async () => {
    const ipfs = await IPFS.create({
      repo: "./orbitdb/examples/ipfs",
      start: true,
    });
    const orbitdb = await OrbitDB.createInstance(ipfs, {
      directory: "./orbitdb/examples/keyvalue",
    });

    // Create / Open a database
    const nameService = await orbitdb.kvstore("solace-name-service", {
      overwrite: true,
    });
    const userData = await orbitdb.kvstore("solace-user", {
      overwrite: true,
    });

    console.log(userData.address.toString());
    console.log(nameService.address.toString());
    return await { nameService, userData };
  },
};

export const getThreadDBProvider = async () => {
  const keyInfo: KeyInfo = {
    key: "bptpczijup3rzdyj7zopdhk7jjm",
    secret: "b2y65p3bq4ccjk2mo4gdoqi4ds7qhqyalbyts57a",
  };
  const client = await Client.withKeyInfo(keyInfo);
  return {
    provide: "ThreadDB",
    useFactory: async () => {
      const threadId = ThreadID.fromString(
        "bafkwuip6fdr5m5o75lgtezpkzeuuach4gql4uemxa7yexophqw6wxcq",
      );
    },
  };
};

@Global()
@Module({
  imports: [WalletsModule, GuardianModule, NameModule],
  controllers: [AppController],
  providers: [AppService, OrbitProvider],
  exports: [OrbitProvider],
})
export class AppModule { }
