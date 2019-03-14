var n = null;
var v = null;
var gCtx = null;
// 缓存每次的二维码信息
let tempString = '';
// 缓存表格 [{code:123, msg:233}]
let list = [];

// 获取dom
let allList = $('#allList');
let tempResult = $('#result');

// 以下是新加方法
// 刷新list表格显示方法
function refreshList(list) {
  let nodeArr = list.map((v, i) => {
    // return `<p><span> ${i}. ${v} </span> <button class="delete-item" data-index="${i}" onclick="deleteByIndex(event)">删除</button></p>`;
    return `<tr>
              <td class="table-num">${i}</td>
              <td class="table-code">${v.code!==undefined?v.code:''}</td>
              <td><input class="table-msg" data-index="${i}" onblur="addMessage(event)" value="${v.msg!==undefined?v.msg:''}"></td>
              <td class="table-func"><button class="delete-item" data-index="${i}" onclick="deleteByIndex(event)">删除</button></td>
            </tr>`
  });
  // 自定义表头
  let tableHead = `<tr><th>序号</th><th>二维码信息</th><th>备注信息</th><th>操作</th></tr>`
  allList.html(tableHead + nodeArr.join(''));
}
// list表格清空方法
function emptyList() {
  list = [];
  refreshList(list)
}
// tempResult清空方法
function emptyTempResult() {
  tempResult.html('');
}
// 正确的保存方法，并清空，错误直接清空
function confirm(isSave) {
  let qrcodeResult = tempResult.text();
  if (isSave) list.push({code:qrcodeResult,msg:''});
  emptyTempResult();
  refreshList(list);
}
// 处理添加备注的情况，以输入框失去焦点为触发条件
function addMessage(e) {
  let index = e.target.getAttribute('data-index');
  list[index].msg = e.target.value;
}
// 单独删除某条信息
function deleteByIndex(e) {
  let index = e.target.getAttribute('data-index');
  list.splice(index, 1);
  refreshList(list);
}

// 生成excel表格
function createExcel() {
  // 组装用于生成sheet的数组
  // 定义表头
  var tab = [['序号', '二维码信息','备注信息']]
  var excelArr = list.map((v,i) => {
    return new Array(i, v.code, v.msg)
  })
  // var aoa = [
  //   ['主要信息', null, null, '其它信息'], // 特别注意合并的地方后面预留2个null
  //   ['姓名', '性别', '年龄', '注册时间'],
  //   ['张三', '男', 18, new Date()],
  //   ['李四', '女', 22, new Date()],
  // ];
  var sheet = XLSX.utils.aoa_to_sheet(tab.concat(excelArr));
  // sheet['!merges'] = [
  //   // 设置A1-C1的单元格合并
  //   { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } },
  // ];
  var curDate = new Date().toString().substring(0,24)
  openDownloadDialog(sheet2blob(sheet), `二维码信息 ${curDate}.xlsx`);
}
// 将一个sheet转成最终的excel文件的blob对象，然后利用URL.createObjectURL下载
function sheet2blob(sheet, sheetName) {
  sheetName = sheetName || 'sheet1';
  var workbook = {
      SheetNames: [sheetName],
      Sheets: {}
  };
  workbook.Sheets[sheetName] = sheet;
  // 生成excel的配置项
  var wopts = {
      bookType: 'xlsx', // 要生成的文件类型
      bookSST: false, // 是否生成Shared String Table，官方解释是，如果开启生成速度会下降，但在低版本IOS设备上有更好的兼容性
      type: 'binary'
  };
  var wbout = XLSX.write(workbook, wopts);
  var blob = new Blob([s2ab(wbout)], {type:"application/octet-stream"});
  // 字符串转ArrayBuffer
  function s2ab(s) {
      var buf = new ArrayBuffer(s.length);
      var view = new Uint8Array(buf);
      for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
      return buf;
  }
  return blob;
}
// 通用的打开下载对话框方法，没有测试过具体兼容性
function openDownloadDialog(url, saveName)
{
    if(typeof url == 'object' && url instanceof Blob)
    {
        url = URL.createObjectURL(url); // 创建blob地址
    }
    var aLink = document.createElement('a');
    aLink.href = url;
    aLink.download = saveName || ''; // HTML5新增的属性，指定保存文件名，可以不要后缀，注意，file:///模式下不会生效
    var event;
    if(window.MouseEvent) event = new MouseEvent('click');
    else
    {
        event = document.createEvent('MouseEvents');
        event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    }
    aLink.dispatchEvent(event);
}

function captureToCanvas() {
  try {
    gCtx.drawImage(v, 0, 0); //在canvas元素中绘出video的某一帧
    try {
      qrcode.decode(); //扫描二维码
      setTimeout(captureToCanvas, 1000); //500ms之后再重绘canvas
      //console.log(qrcode.decode());//扫描成功输出二维码的信息
      // document.getElementById('loading').style.display = 'none'; //隐藏掉加载动画
    } catch (e) {
      console.log(e); //未扫描出二维码，输出错误信息
      setTimeout(captureToCanvas, 1000); //500ms之后再重绘canvas
      // document.getElementById('loading').style.display = 'block';
    }
  } catch (e) {
    console.log(e); //若失败，输出错误信息
    setTimeout(captureToCanvas, 1000); //500ms再重绘canvas
  }
}
//初始化canvas元素，形成一个矩形框
function initCanvas(w, h) {
  n = navigator;
  v = document.getElementById('v');
  var gCanvas = document.getElementById('qr-canvas');
  gCanvas.style.width = w + 'px';
  gCanvas.style.height = h + 'px';
  gCanvas.width = w;
  gCanvas.height = h;
  gCtx = gCanvas.getContext('2d');
  gCtx.clearRect(0, 0, w, h);
}

function setwebcam() {
  var options = true;
  if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
    try {
      navigator.mediaDevices.enumerateDevices().then(function(devices) {
        devices.forEach(function(device) {
          if (device.kind === 'videoinput') {
            if (device.label.toLowerCase().search('back') > -1)
              options = {
                deviceId: { exact: device.deviceId },
                facingMode: 'environment',
              };
          }

          console.log(
            device.kind + ': ' + device.label + ' id = ' + device.deviceId,
          );
        });
        setwebcam2(options);
      });
    } catch (e) {
      console.log(e);
    }
  } else {
    console.log('no navigator.mediaDevices.enumerateDevices');
  }
}

function setwebcam2(options) {
  var p = n.mediaDevices.getUserMedia({ video: options, audio: false });
  p.then(success, error);
  // setTimeout(captureToCanvas, 1000);
}
function success(stream) {
  v.srcObject = stream;
  setTimeout(captureToCanvas(), 1000);
}
function error(error) {
  console.log(error);
}
function load() {
  initCanvas(800, 600);
  qrcode.callback = read;
  setwebcam();
}
function read(a) {
  document.getElementById('result').innerHTML = a.toString();
  console.log('qrcode info:' + a); //输出扫描后的信息
}

// 开始执行
load();
