import { Window } from '@/types'
declare const window: Window
export function loadGeetest() {
  return new Promise((resolve, reject) => {
    if (typeof window.initGeetest4 === 'function') {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = '/js/gt.js'; // 使用官方CDN
    script.async = true;
    script.crossOrigin = 'anonymous'; // 添加跨域属性
    script.onload = () => {
      // 增加延迟确保极验库完全加载
      setTimeout(() => {
        if (typeof window.initGeetest4 === 'function') {
          resolve(true);
        } else {
          reject(new Error('极验库未正确加载'));
        }
      }, 500);
    };
    script.onerror = () => {
      reject(new Error('验证码脚本加载失败'));
    };
    document.head.appendChild(script);
  });
}

export class GeetestService {
  private captchaObj: any = null;
  // 验证码对象

  // 构造函数，传入验证码ID
  constructor(private captchaId: string) {}

  // 初始化并显示验证码
  public initAndShowCaptchaForBind(): Promise<GeetestResult | null> {
    return new Promise((resolve) => {
      window.initGeetest4(
        {
          product: "bind",
          captchaId: this.captchaId,
          width: '100%',
        },
        (captchaObj: any) => {
          this.captchaObj = captchaObj;
          this.captchaObj.showCaptcha();

          this.captchaObj.onClose(() => {
            console.warn('验证码被关闭');
            window.$message?.warning(`验证码被关闭`);
            resolve(null);
          });

          this.captchaObj.onSuccess(() => {
            const result = this.captchaObj.getValidate();
            if (result) {
              console.log('Geetest 验证成功:', result);
              window.$message?.success(`验证码验证成功`);
              resolve(result);
            }
          });
        }
      );
    });
  }

  // // 修改initAndShowCaptchaForFloat方法类型声明
  // public initAndShowCaptchaForFloat(): Promise<GeetestResult | null> {
  //   return new Promise((resolve) => {
  //     window.initGeetest4(
  //       {
  //         product: 'float',
  //         captchaId: this.captchaId,
  //         width: '100%',
  //       },
  //       (captchaObj: any) => { // 临时使用any类型，建议定义CaptchaObj接口
  //         this.captchaObj = captchaObj; // 保存实例引用
  //         captchaObj.onNextReady(() => { // 使用箭头函数保持this指向
  //           captchaObj.appendTo(document.getElementById('geetest-wrap'));
  //           captchaObj.showCaptcha(); // 移动到onNextReady内部确保容器已准备

  //           // 添加关闭事件处理
  //           captchaObj.onClose(() => {
  //             console.warn('验证码被关闭');
  //             window.$message?.warning(`验证码被关闭`);
  //             resolve(null);
  //           });

  //           captchaObj.onSuccess(() => {
  //             const result = captchaObj.getValidate();
  //             if (result) {
  //               console.log('Geetest 验证成功:', result);
  //               window.$message?.success(`验证码验证成功`);
  //               resolve(result);
  //             }
  //           });
  //         });
  //       }
  //     );
  //   });
  // }
}