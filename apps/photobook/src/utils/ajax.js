/**
 * 上传图片
 * @param  {object} obj
 * obj = {
 *   url: 上传接口地址,
 *   method: get/post,
 *   progress: progress处理函数,
 *   success: success处理函数
 *   error: error处理函数
 *   readyStateChange: state change处理函数
 *  }
 */
const request = (obj) => {
  const defaultSetting = {'method':'get','async':true};
  const param = Object.assign({}, defaultSetting ,obj);
  const xhr = createXHR();

  // 上传进度
  xhr.upload.onprogress = function(event){
    param.progress && param.progress(event);
  }

  // 接口请求成功
  xhr.onload = function(){
    clearTimeout(timeout);
    param.success && param.success(this.responseText);
  }

  // 接口请求错误
  xhr.onerror = function(err){
    param.error && param.error(err);
  }

  // 请求状态改变
  xhr.onreadystatechange = function() {
    param.readyStateChange && param.readyStateChange(this.readyState, this.status);
  }

  // 请求接口
  xhr.open(param.method,param.url,param.async);

  // 防止响应超时
  var timeout = setTimeout(()=>{
    param.timeout && param.timeout();
    xhr.abort();
  },120*1000);

  // 发送数据
  if (param.method.toLowerCase()==='post') {
    xhr.send(param.data);
  } else {
    xhr.send(null);
  }

  return xhr;
}

/**
 * 创建xhr对象
 */
const createXHR = () => {
  if (window.XMLHttpRequest) {
    return new XMLHttpRequest();
  } else if(window.ActiveXObject) {
    var versions = ['MSXML2.XMLHttp','Microsoft.XMLHTTP'];
    for (var i=0,len=versions.length;i<len;i++) {
      try {
        return new ActiveXObject(version[i]);
        break;
      } catch (e){
      }
    }
  } else {
    throw new Error("xhr not support");
  }
}

export default request;
