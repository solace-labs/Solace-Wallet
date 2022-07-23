import { Body, Controller, Get, Post } from "@nestjs/common";
import { CreateWalletDto } from "./dto/wallet.dto";
import { WalletsService } from "./wallets.service";

@Controller("wallets")
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) { }

  /**
   * Request an airdrop for creating a wallet (Usually 0.01 SOL, but more for testing currently)
   **/
  @Post("request-airdrop")
  requestAirdrop(@Body() data: CreateWalletDto) {
    return this.walletsService.requestAirdrop(data.publicAddress);
  }

  @Get("health")
  walletHealthCheck() {
    return "HEALTH CHECK";
  }
}
