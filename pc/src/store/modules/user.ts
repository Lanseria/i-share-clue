import { defineStore } from 'pinia';
// import { encryption } from "/@/utils/encrypt";
import { loginReq, smsLoginReq } from '/@/api/Auth';
import { setUserToken } from '/@/utils/auth';
import { userInfoReq } from '/@/api/Admin/Access/User';
import { getMenuListReq } from '/@/api/Admin/Access/Menu';
import { addRouteByMenu, resetRouter, router } from '/@/router';
import { RouteRecordRaw } from 'vue-router';
import { getDictAllMapReq } from '../../api/Admin/Access/Dict';

interface UserState {
  userLogin: boolean;
  userToken: Nullable<AuthTokenVO>;
  userInfoLogin: Nullable<UserInfoLoginVO>;
  // menu
  menus: Nullable<MenuTree[]>;
  modules: Nullable<MenuGroupItemVO[]>;
  menuComponentTreeMap: MenuComponentTreeMap;
  enableWorkbenchList: RouteRecordRaw[];
  // dict
  dataDict: Map<string, DictVO[]>;
}

export const useUserStore = defineStore({
  id: 'app-user',
  state: (): UserState => ({
    userLogin: false,
    userToken: null,
    userInfoLogin: null,
    menus: null,
    modules: null,
    menuComponentTreeMap: new Map(),
    enableWorkbenchList: [],
    dataDict: new Map(),
  }),
  getters: {
    getRoles(): RoleResponseVo[] {
      return this.userInfoLogin?.roles ?? [];
    },
    getUserInfo(): Nullable<UserInfoLoginVO> {
      return this.userInfoLogin ?? null;
    },
  },
  actions: {
    setUserToken(userToken: Nullable<AuthTokenVO>) {
      this.userToken = userToken;
      setUserToken(this.userToken);
    },
    setUserInfo(userInfoLogin: Nullable<UserInfoLoginVO>) {
      this.userInfoLogin = userInfoLogin;
      this.userLogin = !!userInfoLogin;
    },
    setMenusModules(data: Nullable<MenuModuleVO>) {
      if (data) {
        this.menus = data.menu;
        this.modules = data.module;
        // console.log("拿到路由, 构建路由, 返回可访问工作台列表");
        if (this.menus && this.modules) {
          const [enableWorkbenchList, menuComponentTreeMap] = addRouteByMenu(this.menus, this.modules);
          // 通过路由映射不同的菜单组
          this.menuComponentTreeMap = menuComponentTreeMap;
          // 全部可访问的工作台
          this.enableWorkbenchList = enableWorkbenchList;
        }
      } else {
        this.menus = null;
        this.modules = null;
        this.menuComponentTreeMap = new Map();
        this.enableWorkbenchList = [];
        resetRouter();
      }
    },
    setDataDict(dataDict: Nullable<DictDirectory>) {
      if (dataDict) {
        const dictEntries = Object.entries(dataDict);
        const dictMap = new Map(dictEntries);
        this.dataDict = dictMap;
      } else {
        this.dataDict = new Map();
      }
    },
    async login(data: LoginVO) {
      // const form = encryption<LoginVO>({
      //   data,
      //   param: ["password"]
      // });
      const body = await loginReq(data);
      this.setUserToken(body.payload.token);
      await router.push('/');
    },
    async smsLogin(data: SmsLoginVO) {
      const body = await smsLoginReq(data);
      this.setUserToken(body.payload.token);
      await router.push('/');
    },
    async logout(redirect?: string) {
      // 不管有没有请求成功都是清空用户数据
      this.removeAll();
      await router.push({
        name: 'Login',
        ...(redirect
          ? {
              query: {
                redirect,
              },
            }
          : {}),
      });
      return true;
    },
    async gSetUserInfo() {
      const body = await userInfoReq();
      this.setUserInfo(body.payload);
      this.userLogin = true;
    },
    // async gSetMenusModules() {
    //   const { data } = await getMenuListReq();
    //   this.setMenusModules(data);
    // },
    // async gSetDataDict() {
    //   const body = await getDictAllMapReq();
    //   this.setDataDict(body.data);
    // },
    async getAll() {
      await this.gSetUserInfo();
      // await this.gSetMenusModules();
      // await this.gSetDataDict();
    },
    removeAll() {
      this.setUserToken(null);
      this.setUserInfo(null);
      // this.setMenusModules(null);
      // this.setDataDict(null);
    },
  },
});
