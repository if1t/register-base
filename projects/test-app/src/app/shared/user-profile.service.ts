import { Injectable } from '@angular/core';
import { IUserProfile, IUserProfileLoader } from 'ngx-register-base';

@Injectable()
export class UserProfileService implements IUserProfileLoader<IUserProfile, any> {
  public getUserProfile(): IUserProfile {
    return <IUserProfile>{ id: 'test' };
  }

  public checkPermissions(permissions: any[], every?: boolean): boolean {
    const userPermissions = this.getUserProfile()?.permissions ?? [];
    if (every) {
      return permissions.every((permission) => userPermissions.includes(permission));
    }

    return permissions.some((permission) => userPermissions.includes(permission));
  }
}
