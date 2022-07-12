import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class GuardainService {
  nameService: any;
  userDataDb: any;
  constructor(@Inject('orbitDb') private readonly orbitDb) {
    const { nameSerivce, userData } = this.orbitDb;
    this.nameService = nameSerivce;
    this.userDataDb = userData;
  }

  /**
   * Add a guardian to the current user, based on the user id
   * A bluk of the logic exists in making sure these users exist
   * TODO: Ensuring authenticity by the way of using signatures
   */
  async addGuardian(user: string, guardian: string) {
    console.log(user, guardian);
    let userData = await this.getGuardianData(user);
    if (!userData) userData = { name: '', guardians: [], guarding: [] };
    if (!userData.guardians) userData.guardians = [];
    if (!userData.guardian) userData.guarding = [];
    const res = await this.userDataDb.put(
      user,
      {
        ...userData,
        guardians: [...userData.guardians, guardian],
      },
      { pin: true },
    );
    console.log(res);
    let guardianData = await this.getGuardianData(guardian);
    if (!guardianData) guardianData = { name: '', guardians: [], guarding: [] };
    if (!guardianData.guardians) userData.guardians = [];
    if (!guardianData.guardian) userData.guarding = [];
    let { guardians, guarding } = guardianData;
    await this.userDataDb.put(
      guardian,
      {
        ...guardianData,
        guarding: [...guarding, guardian],
      },
      { pin: true },
    );
  }

  /** Get all the guardian data of the user */
  async getGuardianData(user: string) {
    return await this.userDataDb.get(user);
  }

  async removeGuardian(user: string, guardian: string) {
    let userData = await this.getGuardianData(user);
    if (!userData) userData = { guardians: [], guarding: [] };
    if (!userData.guardians) userData.guardians = [];
    if (!userData.guardian) userData.guarding = [];
    userData.guardians = userData.guardians.filter((g) => g !== guardian);
    await this.userDataDb.put(user, {
      guardians: [...userData.guardians],
      guarding: userData.guarding,
    });
    let guardianData = await this.getGuardianData(guardian);
    if (!guardianData) guardianData = { guardians: [], guarding: [] };
    if (!guardianData.guardians) userData.guardians = [];
    if (!guardianData.guardian) userData.guarding = [];
    guardianData.guarding = guardianData.guarding.filter((g) => g !== user);
    let { guardians, guarding } = guardianData;
    await this.userDataDb.put(
      guardian,
      {
        guardians,
        guarding: [...guardianData.guarding],
      },
      { pin: true },
    );
  }
}
