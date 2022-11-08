import { User, UserRoles } from "server/models/types";
import {prisma} from "server/models/db/prisma-client";

export class AuthenticatedUser {
  public readonly userData: User;

  constructor(userData: User) {
    this.userData = userData;
  }

  isSuperAdmin(): boolean {
    return (
      this.userData.jsonData?.roles?.includes(UserRoles.SuperAdmin) === true
    );
  }

  isListsCreator(): boolean {
    return (
      this.userData.jsonData?.roles?.includes(UserRoles.ListsCreator) === true
    );
  }

  async isListPublisher(listId: number): Promise<boolean> {
    const result = await prisma.list.findFirst({
      select: {
        id: true,
      },
      where: {
        id: listId,
        AND: {
          jsonData: {
            path: ['publishers'],
            array_contains: this.userData.email
          }
        }
      }
    })

    return !!result;

  }
}
