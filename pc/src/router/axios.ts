import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import qs from 'qs';
import { getUserToken } from '/@/utils/auth';
import { requestTimeout, requestBaseURL, requestSanicURL } from './config';
import { useUserStore } from '../store/modules/user';
import { router } from './index';

const commonConfig = {
  timeout: requestTimeout,
  baseURL: requestBaseURL,
  withCredentials: true,
  validateStatus: (status: number) => {
    return status >= 200 && status <= 600; // 全部允许, 不会遇到错误就停止
  },
};

const sanicConfig = {
  ...commonConfig,
  baseURL: requestSanicURL,
};

const requestInterceptors = (config: AxiosRequestConfig) => {
  // 请求之前处理config
  const userToken = getUserToken();
  if (userToken?.accessToken) {
    config.headers['Authorization'] = userToken.tokenType + ' ' + userToken.accessToken; // token
  }
  if (config.method === 'get') {
    config.paramsSerializer = function (params) {
      return qs.stringify(params, { arrayFormat: 'brackets' });
    };
  }
  return config;
};

const errorInterceptors = (error: any) => {
  return Promise.reject(error);
};

const responseInterceptors = (res: AxiosResponse<any>) => {
  const userStore = useUserStore();
  const showNotification = (title: string, content?: string) => {
    try {
      window.$notification.warning({
        content: title,
        meta: content,
        duration: 2000,
      });
    } catch (err) {
      console.warn(title, err);
    }
  };
  const clearInfoToLogin = () => {
    userStore.logout(router.currentRoute.value.fullPath);
  };
  const build500ErrorMsg = (msg: string) => {
    if (msg === undefined) {
      console.log('发生空指针');
      return '服务器出了点小差';
    } else if (msg.includes('###')) {
      console.log(msg);
      return '数据库查询发生错误, 请查看控制台';
    } else {
      console.log(msg);
      return msg;
    }
  };
  const status = res.status.toString();
  const resData = res.data;
  const msgContent = resData.message ? (typeof resData.message === 'string' ? resData.message : resData.message.join(',')) : '';
  const errorCode = {
    // 4dd
    '400': '请求内容错误',
    '401': '当前操作没有权限或者登入过期',
    '403': '当前操作没有权限',
    '417': '未绑定登录账号，请使用密码登录后绑定',
    '426': '用户名不存在或密码错误',
    '428': '验证码错误,请重新输入',
    '429': '请求过频繁',
    // 5dd
    // "500": "服务器启动中",
    '501': '服务器启动中',
    '502': '服务器维护中',
    '503': '服务器维护中',
  };

  type ErrorCode = typeof errorCode;

  type ErrorCodeKey = keyof ErrorCode;

  function getErrorCode(name: string, msg = ''): string {
    return errorCode[name as ErrorCodeKey] || msg;
  }
  // debugger;
  if (/4\d\d/.test(status)) {
    const msgTitle = getErrorCode(status);
    // 除了验证400以外的全部报错
    if (status === '401') {
      clearInfoToLogin();
      showNotification(msgTitle, msgContent);
      throw Error(msgTitle);
    } else {
      if (status == '404') {
        // TODO: 暂时处理
        // clearInfoToLogin();
        showNotification('接口不存在');
      } else {
        // 显示验证错误信息
        showNotification(msgTitle, msgContent);
      }
      return resData;
    }
  } else if (/5\d\d/.test(status)) {
    const msg = getErrorCode(status);
    // 除了验证500以外的全部报错
    if (msg) {
      showNotification(msg);
      if (process.env.NODE_ENV !== 'development') {
        clearInfoToLogin();
      }
    } else {
      showNotification(build500ErrorMsg(resData.message));
    }
    throw Error(msg);
  } else {
    return resData;
  }
};

const requestWithRes = axios.create(commonConfig);
const requestWithSanic = axios.create(sanicConfig);

const request = axios.create(commonConfig);

request.interceptors.request.use(requestInterceptors, errorInterceptors);

request.interceptors.response.use(responseInterceptors, errorInterceptors);

requestWithRes.interceptors.request.use(requestInterceptors, errorInterceptors);

export default request;

export { requestWithRes, requestWithSanic };
