//访问地址 http://localhost:3000/ajax_then.html
const getJSON = function(url,type, data) {
  const promise = new Promise(function(resolve, reject){
    const handler = function() {
      if (this.readyState !== 4) {
        return;
      };
      if (this.status === 200) {
        resolve(this.response);
      } else {
        reject(new Error(this.statusText));
      }
    };
    const client = new XMLHttpRequest();
    client.open(type, url);
    client.onreadystatechange = handler;
    client.responseType = "json";
    if(type =='get'){
    	client.send();
    }else {
    	client.setRequestHeader("Content-Type", "application/json");
    	client.send(JSON.stringify(data));
    }
  });
  return promise;
}; 

$(function() {
	//添加留言
	$(".submit").click(() => {
		submit(true);
	});
	//修改留言
	$(".update").click(()=>{
		submit(false);
	});
	//删除留言
	$(".deleteAll").click(() => {
		getJSON("/map/delAll",'delete')
		.then(function(json) {
		  $(".messageList").html('全部数据已经清除');
		}, function(error) {
		  console.error('出错了', error);
		});
		 
	});
	//查看留言
	$(".viewMes").click(()=> listShow());
	//提交
	let submit = (isAdd) =>{
		let _name = $(".name").val(),
			_message = $(".message").val();
		if(_name =='' || _message =='') {
			alert('请输入信息！');
			return false;
		}
		$(".name,.message").val("");
		isAdd ? add(_name, _message) : upd(_name, _message);
	};
	//添加数据
	let  add = (name, message) => {
		getJSON("/map/add",'post', {name: name, message: message})
		.then(function(json) {
			if(json.code == '200'){
				listShow();
			}
		}, function(error) {
		  console.error('出错了', error);
		});
	};
	//删除数据
	let del = (name) =>{
		getJSON("/map/del",'delete', {name:name})
		.then(function(json) {
		  listShow();
		}, function(error) {
		  console.error('出错了', error);
		}); 
	};
	//编辑数据
	let upd = (name, message) =>{
		getJSON("/map/upd",'put', {name: name, message: message})
		.then(function(json) {
		    $("#inputEmail3").attr('disabled',false);
			listShow();
		}, function(error) {
		  console.error('出错了', error);
		});
	};
	//绑定未来元素
	$(".messageList").on('click', '.del', (e)=>{
		del($(e.target).attr('name'));
	});
	$(".messageList").on('click', '.upd', (e) =>{
		let value = $(e.target).val();
		$("#inputEmail3").attr('disabled',true);
		$(".name").val(value.split(',')[0]);
		$(".message").val(value.split(',')[1]);
	});
	//列表显示
	let  listShow = () => {
		//原生promise
		/*getJSON("/map/get",'get').then(function(d) {
			_showList(d);
		}, function(error) {
		  console.error('出错了', error);
		});*/

		//$.ajax() 低于1.5.0版本的jQuery，返回的是XHR对象，高于1.5.0版本，返回的是deferred对象，可以进行链式操作。
		// 链式写法
		let list = $(".messageList"),str = "";
		//传参 http://localhost:3000/map/get?name=123&id=1
		//$.ajax({url:"/map/get",dataType:"json",type:"get",data:{name:123,id:1}})

		$.ajax({url:"/map/get",dataType:"json",type:"get"})
	　　.done(function(d){
			for (let i=0; i<d.length; i++) {
				str += `<li class="list-group-item"><span class="key">${d[i].key}</span><span>说：</span><span class="value">${d[i].value}</span>
			    <span style="float:right;"><button class="del" name="${d[i].key}">删除</button>
			    <button class="upd"  value="${d[i].key},${d[i].value}">更新</button></span></li>`;
			}
			list.html(str);
		})
	　　.fail(function(){ alert("出错啦！"); });
	};

	let _showList = (d) =>{
		let list = $(".messageList"),str = "";
		for (let i=0; i<d.length; i++) {
			str += `<li class="list-group-item"><span class="key">${d[i].key}</span><span>说：</span><span class="value">${d[i].value}</span>
			    <span style="float:right;"><button class="del" name="${d[i].key}">删除</button>
			    <button class="upd" value="${d[i].key},${d[i].value}">更新</button></span></li>`;
		}
		list.html(str);
	};
	//查询数据
	//链式写法  串行
	$(".queryThen").click(()=> queryThen());
	let queryThen = ()=> {
		$.ajax({url:"/map/add1",dataType:"json",type:"get"})
	　　.then(data => {
			 return $.get("/map/add2", data.result.id);
		})
	    .then(data => {
			alert(data);
		}, () => { alert("出错啦！"); });
	};

	let addPromise1 = new Promise((resolve,reject) => {
		getJSON("/map/add1",'get').then(function(d) {
			resolve(d);
		}, function(error) {
		  console.error('出错了', error);
		});
	});
	let addPromise2 = new Promise((resolve,reject) => {
		getJSON("/map/add2",'get').then(function(d) {
			resolve(d);
		}, function(error) {
		  console.error('出错了', error);
		});
	});
	// 并行  when 多个请求完成后返回
	$(".queryWhen").click(()=> queryWhen());
	let queryWhen = ()=> {
		/*$.when($.ajax({url:"/map/add1",dataType:"json",type:"get"}), $.ajax({url:"/map/add2",dataType:"json",type:"get"}))
		.then((data1,data2) => {
			console.log(data1[0]);
			console.log(data2[0]);
		}, () => { alert("出错啦！"); });*/

		Promise.all([
		  addPromise1,
		  addPromise2
		]).then(([add1,add2])=>{
			console.log(add1);
			console.log(add2);
		}, function(error) {
		  console.error('出错了', error);
		});
	};
})