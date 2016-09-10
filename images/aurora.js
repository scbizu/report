//<!--
//向url发出ajax请求，传送argObj，用返回数据更新updateArea

function check24Hour(str) {
	var pattern = /^(([0-1]?[0-9])|(2[0-3])):[0-5]?[0-9]$/;

	if (str.exec(pattern)) {
		return true;
	} else {
		return false;
	}
}


function checkNum(value, start, end) {
	var pattern = /^[1-9]?[0-9]+$/;
	if ( end <= start) {
		if (pattern.exec(value)) {
			return true;
		} else {
			return false;
		}
	} else {
		if (pattern.exec(value) && (value >= start && value <= end)) {
			return true;
		} else {
			return false;
		}
	}
}


function sendRequest(url,argObj,updateArea){
	var queryString = null;
	if(typeof argObj == "string") queryString = argObj; // like 'a=1&b=2'
	else if(typeof argObj == "object") queryString = $H(argObj).toQueryString();
	
	var myAjax = new Ajax.Updater(updateArea, url,{
		method     		: 	'post', //HTTP请求的方法,get or post 
		parameters		: 	queryString,
		asynchronous	:	true,
		onLoading  		: 	_ajaxLoading,
		onSuccess 		: 	_ajaxSuccess
	});
}
function ajaxAction(url, argObj, ajaxCbFunc){
	var queryString = null;
	if(typeof argObj == "string") queryString = argObj; // like 'a=1&b=2'
	else if(typeof argObj == "object") queryString = $H(argObj).toQueryString();
	new Ajax.Request(url, {
		method : 'post',
		parameters : queryString,
		asynchronous : true,
		onLoading : _ajaxLoading,
		onSuccess : _ajaxSuccess,
		onComplete : ajaxCbFunc
	});
}
function _ajaxLoading(){
    try{
    	$('statusInformation').show();
    }catch(e){}
}
function _ajaxSuccess(){
    try{
	    if ($('statusInformation')) setTimeout("$('statusInformation').hide();", 2000);
    }catch(e){}
}



function showByDialog(container, url){
	//TODO. show info in a dialog.
	var frameName = 'dialogFrame';
	if(window.name == frameName){
		//alert(frameName);
		window.parent.historyBar.push(url);
		window.location.href = url;
		return;
	}
	//container.style.paddingTop = "27px";
	//var html = '<div class="frameHistory" id="frameHistory" style="display:none"><input class="backbutton disable" type="button" id="backButton" title="后退" onclick="historyBar.back()"/><input type="button" id="forwardButton" title="前进" onclick="historyBar.forward()" class="forwardButton disable2"/> </div>';
	var html = '<div id="frameHistory" class="frameHistory"><h1><a class="backbutton disable" onfocus="this.blur()" href="javascript:;" onclick="historyBar.back()"  title="后退"></a> <a class="forwardbutton disable2" onfocus="this.blur()" href="javascript:;" onclick="historyBar.forward()" title="前进"></a></h1></div>';
	html += '<iframe name="'+frameName+'" src="'+url+'" width="100%" height="100%" scrolling="auto" frameborder="0"></iframe>';
	container.fillByHtml(html);
	container.show();
	$$('.dialog .dialog-tbl .body')[0].style.paddingTop = "27px";
	//window.parent.historyBar.init();
	//alert(typeof(historyBar));
	if(typeof(historyBar) == 'object'){
		historyBar.init();
		//window.parent.historyBar.push(url);
		historyBar.push(url);
	}
}

// 配合js中的nmenu等操作
function unselect(menu, item) {
    var items = menu.getElementsByTagName('DIV');
    for (var i=0; i<items.length; i++) {
        if (items[i].className == 'selected'){
            items[i].className = 'unselected';
        }
    }
    item.className = 'selected';
}
function checkItem(item, flag) {
    if (flag==null) {
        if (item.length==undefined) {
            item.disabled = (item.disabled)?false:true;
        } else {
            for (var i=0; i<item.length; i++) {
                item[i].disabled=(item[i].disabled)?false:true; 
            }
        }
    } else {
        item.disabled = flag;
    }
}

function folderItem(item, flag) { 
	if(typeof item != 'object') return;
	
	if(typeof item.length == 'undefined'){
		// not an array?
		item.style.display = (item.style.display=='')?'none':''; 
	}else{
		// is an array?
		for (var i=0; i<item.length; i++) {
            if (flag!=null)
			    item[i].style.display=flag;
            else
			    item[i].style.display=(item[i].style.display=='')?'none':''; 
    	}
	}	
	if(!flag || typeof flag != 'object'){
		return;
	}
	for (var i=0; i<flag.length; i++) {
		flag[i].style.display='none';
		item.style.display = '';
	}
}
//-->
//<!-- 选择
var GNewItemQueue = new Array(); // 增加
var GDecItemQueue = new Array(); // 减少

function checkedInit() {
    GNewItemQueue = new Array(); 
    GDecItemQueue = new Array();
    document.cookie = ''; // TODO: 可能需要更改，适应认证
}

function ifMultiSelected(selectItem, cb) {
    for (var i=0; i<selectItem.length; i++) {
        var o = selectItem.options[i];
        var id = o.value;
        if (o.selected) {
            if (!GNewItemQueue.inArray(id)) {
                GNewItemQueue[GNewItemQueue.length] = id; 
            }
        } else {
            if (GNewItemQueue.inArray(id)) {
                GNewItemQueue = GNewItemQueue.remove(id);
            }
        }
    }
    if (cb!=null) { 
        cb();
    }
}
function ifChecked(checkItem, id, cb) {
    if (checkItem.checked) {
        if (GDecItemQueue.inArray(id)) {
            GDecItemQueue = GDecItemQueue.remove(id);
        } else if (!GNewItemQueue.inArray(id)) {
            GNewItemQueue[GNewItemQueue.length] = id; 
        }
    } else {
        if (GNewItemQueue.inArray(id)) {
        	
            GNewItemQueue = GNewItemQueue.remove(id);
        } else if (!GDecItemQueue.inArray(id)) { // 增加
            GDecItemQueue[GDecItemQueue.length] = id; 
        }
        
    }
    // callback 函数
    if (cb!=null) { 
        cb();
    }/**/
}

function imageSwap(ob, fileName1, fileName2) { 
    if (ob.src.match(fileName1)==null) {
        ob.src = fileName1;
        return false;
    } else {
        ob.src = fileName2; 
        return true;
    }
}
//-->
//<!--cookie operation
function setCookie (name, value) {  //设置名称为name,值为value的Cookie 
        var argc = arguments.length; 
        var argv = arguments;     
        var path = (argc > 2) ? argv[2] : '/';   
        var domain = (argc > 3) ? argv[3] : null;   
        var secure = (argc > 4) ? argv[4] : false;   
		str = name + "=" + value +  
        ((path == null) ? "" : ("; path=" + path)) +   
        ((domain == null) ? "" : ("; domain=" + domain)) +     
        ((secure == true) ? "; secure" : "");
        document.cookie = str;
}
function getCookie(c_name) {
    if (document.cookie.length>0) {
        c_start=document.cookie.indexOf(c_name + "=");
        if (c_start != -1) { 
            c_start = c_start + c_name.length + 1; 
            c_end = document.cookie.indexOf(";",c_start);
            if (c_end == -1) c_end = document.cookie.length;
            return unescape(document.cookie.substring(c_start,c_end));
        } 
    }
    return "";
}
//-->
//<!--
Array.prototype.insertAt = function(index, value) {
    var part1 = this.slice(0, index);
    var part2 = this.slice(index);
    part1.push(value);
    return(part1.concat(part2));
};
  
Array.prototype.removeAt = function(index) {
    var part1 = this.slice(0, index);
    var part2 = this.slice(index+1);
    
    return (this.length==1 && index==0)?part1:part1.concat( part2 );
};

Array.prototype.indexOf = function(val) {
    for (var i=0; i<this.length; i++) {
        if (this[i] == val) {
            return i;
        }
    }
    return -1;
};

Array.prototype.remove = function (val) {
    if (this.inArray(val)){
    	//alert(this.indexOf(val));
        return this.removeAt(this.indexOf(val));
    }
};

Array.prototype.inArray = function (value) {
    var i;
    for (i=0; i < this.length; i++) {
        if (this[i] == value) {
            return true;
        }
    }
    return false;
}; 
// -->

function jsRequrestUploadFile(elemId, action, cbFunc) {
    JsHttpRequest.query(action,
        {'file':$(elemId)},
        function(resjs, errors) {
            cbFunc(resjs);
        },
        false
    );

}

function pop(url) { window.open(url, '_blank', 'toolbar=no,resizable=yes,width=640,height=480,scrollbars=yes'); }
//}}}

//by wxh. used to show the history button.
function HistoryBar(){	
	this.inUrl = [];
	this.popUrl = [];
	this.check = function(){
		if(this.inUrl.length == 1 && this.popUrl.length == 0) return;
		var b = $$('.backbutton')[0];
		var f = $$('.forwardbutton')[0];
		if(this.inUrl.length == 2 && this.popUrl.length == 0){
			$('frameHistory').show();
			b.className = 'backbutton';
			f.className = 'forwardbutton disable2';
			return;
		}
		f.className = this.popUrl.length == 0 ? 'forwardbutton disable2' : 'forwardbutton';
		b.className = this.inUrl.length == 1 ? 'backbutton disable' : 'backbutton';
	}
	this.push = function(nowUrl){
		this.popUrl = [];
		this.inUrl.push(nowUrl);
		this.check();
	}
	this.back  = function(){
		if($$('.backbutton')[0].hasClassName('disable')) return;
		this.popUrl.push(this.inUrl.pop());
		this.check();
		history.go(-1);		
	}
	this.forward = function(){
		if($$('.forwardbutton')[0].hasClassName('disable2')) return;
		
		this.inUrl.push(this.popUrl.pop());
		this.check();
		history.go(1);		
	}
	this.init = function(){
		this.inUrl = [];
		this.popUrl = [];
	}
}

/**Add an attribute 'isSortAble="true"' to the table you want to sort. 
*  Add an attribute 'isSortAble="false"' to the col you don't want to sort. 
*  Add an attribute 'dataType="..."' to set the data type of the cols you want to sort. support: int, float, date
* @param options {'oTable':[object],'iCol':[int],'sDataType':[string]}
*/
function _convert(sValue, sDataType) {
	switch(sDataType) {
		case "ip":
			var arr = sValue.split('.');
			if(arr.length != 4) return 1;
			for(var i=0; i<4; i++){
				if(arr[i].length == 2) arr[i] = '0'+arr[i];
				else if(arr[i].length == 1) arr[i] = '00'+arr[i];
			}
			return arr.toString();
		case "int":
			return parseInt(sValue);
		case "float":
			return parseFloat(sValue);
		case "date":
			return new Date(Date.parse(sValue));
		default:
			return sValue.toString();
	}
}

function _generateCompareTRs(iCol, sDataType) {
	return  function compareTRs(oTR1, oTR2) {
		if (oTR1.cells[iCol].getAttribute("dataType")) {
			vValue1 = _convert(oTR1.cells[iCol].getAttribute("dataType"), sDataType);
			vValue2 = _convert(oTR2.cells[iCol].getAttribute("dataType"), sDataType);
		} else {
			vValue1 = _convert(oTR1.cells[iCol].innerHTML.stripScripts().stripTags().strip(), sDataType);
			vValue2 = _convert(oTR2.cells[iCol].innerHTML.stripScripts().stripTags().strip(), sDataType);
		}
		if (vValue1 < vValue2) {
			return -1;
		} else if (vValue1 > vValue2) {
			return 1;
		} else {
			return 0;
		}
	};
}

function sortTable(oTable, iCol, sDataType) {
	var oTBody = oTable.tBodies[0];
	var colDataRows = oTBody.rows;
	var aTRs = new Array;

	for (var i=0; i < colDataRows.length; i++) {
		aTRs[i] = colDataRows[i];
	}

	if (oTable.sortCol == iCol) {
		aTRs.reverse();
	} else {
		aTRs.sort(_generateCompareTRs(iCol, sDataType));
	}

	var oFragment = document.createDocumentFragment();
	for (var i=0; i < aTRs.length; i++) {
		/* addClassName removeClassName doesn't work in ie6, so*/
		var c = aTRs[i].className.replace(/odd|even/,'').strip();
		aTRs[i].className = c + (i%2 == 0 ? ' odd' : ' even');
		oFragment.appendChild(aTRs[i]);
	}

	oTBody.appendChild(oFragment);
	oTable.sortCol = iCol;
}


/* 端口校验函数，校验输入的端口（或多个端口是否在合法端口范围内） */
/* TODO: 不知道为什么，input为 0 时此处始终接收不到 input ，只有在调用该函数之前处理*/
function portCheck(input) {
    var argc = arguments.length; 
    var argv = arguments;     
    var botLimit = (argc >= 1) ? parseInt(argv[1]) : 1;
    var topLimit = (argc >= 2) ? parseInt(argv[2]) : 65535;

    var strArr = input.split(",");
    var numLen = strArr.length;
    for(var i=0; i < numLen; i++) {
        if(strArr[i] == "") {
            return false;
        }
        var sepArr = strArr[i].split("-");
        for(var temp=0; temp<sepArr.length; temp++){
            sepArr[temp] = parseInt(sepArr[temp]);
        }
        var numSep = sepArr.length;
        if (numSep == 1) { /*单个端口需要在范围内*/
            if(isNaN(strArr[i])) {
                return false;
            }
            if(strArr[i] > topLimit || strArr[i] < botLimit) {
                return false;
            }
        }
        else {
            if (numSep > 2){  /*输入格式错误*/
                return false;
            }
            if (isNaN(sepArr[0]) || isNaN(sepArr[1])) {
                return false;
            }
            if (sepArr[0] > sepArr[1]){  /*范围输入错误*/
                return false;
            }
            if (sepArr[0] > topLimit || sepArr[0] < botLimit) {
                return false;
            }
            if (sepArr[1] > topLimit || sepArr[1] < botLimit) {
                return false;
            }
        }
    }
    return true;
}

//更改主界面连接
function GetLeftUrl (url) {
	window.parent.frames["mainFrame"].window.location.href = url;
}
/*function hideAndShow (showID, hideID) {
	document.getElementById(showID).style.display = '';
	document.getElementById(hideID).style.display = 'none';
}*/
/*function hideOrShow (itemID) {
	var Item = document.getElementById(itemID);
	if (Item.style.display == "") {
		Item.style.display = "none";
	}else {
		Item.style.display = "";
	}
}*/
function hideBodyImg (hide_id, imgID, hide_image, show_image) {
	var hide_item = document.getElementById(hide_id);
	var img = document.getElementById(imgID);
	if (hide_item.style.display == "") {
		hide_item.style.display = "none";
		img.src = hide_image;
	}else {
		hide_item.style.display = "";
		img.src = show_image;
	}
}
/*function DisableBody (edit_id) {
	var edit_item = document.getElementById(edit_id);
	if (edit_item.disabled == true) {
		edit_item.disabled = false;
	}else {
		edit_item.disabled = true;
	}
}*/
/*function CreateNewWindow (openUrl, windowName, widthNum, heightNum) {
	var winObj = window.open(openUrl, windowName, "width=" + widthNum + ", height=" + heightNum + ",toolbar=no, directories=no, status=no, scrollbars=yes");
}*/
/*function FullScreen (item_id) {
	if (item_id.value == "全屏显示") {
		item_id.value = "取消全屏";
		window.parent.leftMenu.style.display = "none";
		window.parent.topMenu.style.display = "none";
	}else {
		item_id.value = "全屏显示";
		window.parent.leftMenu.style.display = "";
		window.parent.topMenu.style.display = "";
	}
}*/
