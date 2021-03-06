import { mergeProperties } from "/@/utils/common";

export class MultipleContactDTO {
  orgs: IObj[] = [];
  users: IObj[] = [];
}

export class CommonDTO {
  mergeProperties(obj?: IObj) {
    if (obj) {
      Object.assign(this, mergeProperties(this, obj));
    }
  }
}
