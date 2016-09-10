/*
 * Cavy Framework
 *
 * (C) 1999-2006 NSFOCUS Corporation. All rights Reserved
 *  
 * Information:
 * 
 *   $Id: cavy.js 3314 2008-12-04 03:57:03Z jiangxiaodong $
 * 
 */
function timestamp() {
	return Date.parse(new Date());
}

var ASSERT = function(comment,exp) {
        if (!exp) {
                alert(comment + ", in function:" + arguments.callee.caller);
                throw comment;
        }
};

var Cavy = {};
Cavy.util = {};
Cavy.widgets = {};

Cavy.tables = {}; // hash of {id=>Cavy.Table}
Cavy.Table = Class.create();
Cavy.Table.prototype = {
	/**
	 * @param options {'paginal':[boolean],'pageSize':[int],'sortable':[boolean],'optionalPageSizes':[optional page size array]}
	 */
	initialize: function(tableId, url, options) {
		this.table = $(tableId);
		this.url = url;
		this.sortMethod = 'desc';
		this.options = options;
		this.currentColumn = null;
		if (this.options.paginal) {
			this.header = $(tableId + '-header');
			this.footer = $(tableId + '-footer');
			this.page = {
				num:1,
				end:false,
				total:-1
			};
			this.page.size = this.options.pageSize;
			this.page.SIZES = this.options.optionalPageSizes;
		}
		if (this.options.sortable) {
			this.orders = {};
		}
	},
	/**
	 * @param params hash of {'column', 'order', 'pageNumber', 'pageSize'}
	 */
	load: function() {
	
		var params = {};
		if (this.options.sortable && this.currentColumn != null) {
			params.column = this.currentColumn;
			if (this.orders[this.currentColumn] != null) {
				params.order = this.orders[this.currentColumn];
			}
		}
		if (this.options.paginal) {
			params.pageNumber = this.page.num;
			params.pageSize = this.page.size;
			this._fillBar(this.header);
			this._fillBar(this.footer);
		}
		
		var pars = '';
		for (var par in params) {
			if (params[par] == null) continue;
			if (pars != '') pars += '&';
			pars += par + '=' + params[par];
		}
		var url = this.url;
		var failure = false;
		var table = this;
		new Ajax.Request(url,{
			parameters: pars,
			onComplete: function(xhr) {
				if (failure) return;
				if (xhr.responseXML == null) {
                    //why alert ?
					//alert('Cavy cannot get xml from "' + url + '?' + pars + '"\n with html:' + xhr.responseText + "\n");
					return;
				}
				try {
					table._show(xhr.responseXML);
					if (table.options.paginal) {
						table._setPageButtons(table.header);
						table._setPageButtons(table.footer);
					}
				}
				catch (e) {
					//alert('show table error:\n' + e + '\n with xml:\n' + xhr.responseText);
				}
			},
			onFailure: function(xhr,object) {
				//alert('Resource not found:' + url);
				failure = true;
			},
			onSuccess: function(xhr,object) {
			}
		});
	},
	changePageSize: function(size) {
		this.page.size = parseInt(size);
		this.page.num = 1;
		this.load();
	},
	_fillPageCountInBar: function(bar) {
		$(bar.id + '-count').innerHTML = parseInt((this.page.total + this.page.size - 1) / this.page.size);
	},
	_fillBar: function(bar) {
		//@yc@nsfocus
		//修正总页数为0时的当前页为0
		_total = parseInt((this.page.total + this.page.size - 1) / this.page.size)
		if (_total <= 0 && this.page.total != -1)
			this.page.num = 0;
		// fill page number
		$(bar.id + '-num').innerHTML = this.page.num;
		// fill page size
		var select = $(bar.id + '-size');
		var options = select.options;
		if (options.length == 0) {
			// init
			for (var i=0; i<this.page.SIZES.length; i++ ) {
				var option = new Option(this.page.SIZES[i]);
				if (this.page.SIZES[i] == this.page.size) {
					option.selected = true;
				}
				options[options.length] = option;
			}
			var table = this;
			select.onchange = function() {
				table.changePageSize($F(select));
			}
		}
		
		// fill buttons
		var table = this;
		$(bar.id + '-first').onclick = function() {
			table._goFirst(bar.id);
		}
		$(bar.id + '-next').onclick = function() {
			table._goNext(bar.id);
		}
		$(bar.id + '-last').onclick = function() {
			table._goLast(bar.id);
		}
		$(bar.id + '-prev').onclick = function() {
			table._goPrev(bar.id);
		}
		// fill goto button
		var f = function() {
			var number = $F(bar.id + '-goto-text');
      // isNaN("   ") equal false, so add "number.trim().length == 0"
      // IE not "trim", so use "replace"
			if (isNaN(number) || number.replace(/^\s+|\s+$/g, '').length == 0) {
				$(bar.id + '-goto-text').select();
				return;
			}
			var page = parseInt(number);
			if (!table._goto(page)) {
				$(bar.id + '-goto-text').select();
				return;
			}
		};
		$(bar.id + '-goto').onclick = f;
		$(bar.id + '-goto-text').onkeydown = function(evt) {
			evt = evt || window.event;
			if (evt.keyCode == Event.KEY_RETURN) {
				f();
			}
		};
	},
	_setPageButtons: function(bar) {
		if (this.page.num != 1) {
			this._enablePageButton($(bar.id + '-first'));
			this._enablePageButton($(bar.id + '-prev'));
		}
		else {
			this._disablePageButton($(bar.id + '-first'));
			this._disablePageButton($(bar.id + '-prev'));
		}
		var lastNum = this._getLastNum();
		if (this.page.num >= lastNum) {
			this._disablePageButton($(bar.id + '-last'));
			this._disablePageButton($(bar.id + '-next'));
		}
		else {
			this._enablePageButton($(bar.id + '-last'));
			this._enablePageButton($(bar.id + '-next'));
		}
	},
	_getLastNum: function() {
		return parseInt((this.page.total + this.page.size - 1) / this.page.size);
	},
	_enablePageButton: function(button) {
/*		var img = button.getElementsByTagName('img')[0];
		var fn = img.src.substr(img.src.lastIndexOf('/') + 1);
		if (fn.indexOf('d_') == 0) {
			// enable it
			var tmp = img.src;
			img.src = img.getAttribute('d-src');
			img.setAttribute('d-src',tmp);
		}*/
	},
	_disablePageButton: function(button) {
/*		var img = button.getElementsByTagName('img')[0];
		var fn = img.src.substr(img.src.lastIndexOf('/') + 1);
		if (fn.indexOf('d_') < 0) {
			// disable it
			var tmp = img.src;
			img.src = img.getAttribute('d-src');
			img.setAttribute('d-src',tmp);
		}
		button.onclick = null;*/
	},
	_goto: function(page) {
		if (page <= 0 || page > this._getLastNum()) {
			return false;
		}
		this.page.num = page;
		this.load();
		return true;
	},
	_goFirst: function(barid) {
		this.page.num = 1;
		this.load();
	},
	_goNext: function(barid) {
		if (this.page.num ++ >= parseInt((this.page.total + this.page.size - 1) / this.page.size)) {
			this.page.num = parseInt((this.page.total + this.page.size - 1) / this.page.size);
			return;
		}
		this.load();
	},
	_goPrev: function(barid) {
		if (this.page.num -- <= 1 ) {
			this.page.num = 1;
			return;
		}
		this.load();
	},
	_goLast: function(barid) {
		this.page.num = parseInt((this.page.total + this.page.size - 1) / this.page.size);
		this.load();
	},
	_show: function(xmldom) {
		this._cleanTable();
		var total = parseInt(xmldom.documentElement.getAttribute('total'));
		if (this.page != null && total != null) {
			this.page.total = total;
		}
		// set page count label
		if (this.options.paginal) {
			this._fillPageCountInBar(this.header);
			this._fillPageCountInBar(this.footer);
			//@yc@nsfocus
			this._fillBar(this.header);
			this._fillBar(this.footer);
		}
		
		var xmlhead = xmldom.getElementsByTagName('thead')[0];
		var thead = this.table.insertRow(-1);
		var cellNodes = xmlhead.getElementsByTagName('th');
		for (var i=0; i<cellNodes.length; i++) {
			var xmlcell = cellNodes[i];
			var th = document.createElement('th');
			if (xmlcell.getAttribute('width') != null) {
				th.width = xmlcell.getAttribute('width');
			}
			var col = xmlcell.getAttribute('column');
			if (col != null) th.setAttribute('column',col);
			var isSortable = xmlcell.getAttribute('isSortable');
			th.setAttribute('isSortable',isSortable == null ? false : isSortable);
			th.innerHTML = '<label>' + xmlcell.childNodes[0].nodeValue + '</label>';
			thead.appendChild(th);

			if (isSortable != 'true') continue;

			if (this.options.sortable) { 
				// init order
				var order = this.orders[col];
				if (order == null) {
					if (xmlcell.getAttribute('order') != null) {
						order = xmlcell.getAttribute('order');
					}
					else {
						order = 'desc';
					}
					// save sort status
					this.orders[col] = order;
				}
				else if (col == this.currentColumn) {
					// add order flag
					th.innerHTML += '<img class="sort" src="' + this.options.images[order] + '" />';
				}
				// add sort function
				th.onclick = this._sortColumn.bindAsEventListener(this);
				th.onmouseover = function() {
					this.className = 'light';
				}
				th.onmouseout = function() {
					this.className = '';
				}
	
			}
		}
		var xmlbody = xmldom.getElementsByTagName('tbody')[0];
		var rowNodes = xmlbody.getElementsByTagName('tr');
		for (var i=0; i<rowNodes.length; i++) {
			var xmlrow = rowNodes[i];
			var row = this.table.insertRow(-1);
			if (i % 2 == 0) row.className = 'even';
			else row.className = 'odd';
			var cellNodes = xmlrow.getElementsByTagName('td');
			for (var j=0; j<cellNodes.length; j++) {
				var cell = row.insertCell(-1);
				if (!cellNodes[j].hasChildNodes()) {
					continue;
				}
				var textNode = cellNodes[j].childNodes[0];
				if (textNode.nodeName == '#text' || textNode.nodeName == '#cdata-section') {
					cell.innerHTML = textNode.nodeValue;
				}
				else {
					alert('invalid element:' + textNode);
					return;
				}
			}
		}
	},
	_sortColumn: function(evt) {
		var target = document.all ? evt.srcElement : evt.target;
		if (target.nodeName != 'TH') target = target.parentNode;
		var tableId = target.parentNode.parentNode.parentNode.id;
		var table = Cavy.tables[tableId];
		var col = target.getAttribute('column');
		var order = this.orders[col];
		order = (order == 'asc' ? 'desc' : 'asc');
		table.currentColumn = col;
		this.orders[col] = order;
		table.load({'column':col,'order':order});
	},
	_cleanTable: function() {
		while (this.table.rows.length > 0) {
			this.table.deleteRow(-1);
		}
	}
}

var browser = {};
(function() {
	var dua = browser.UA = navigator.userAgent;
	var dav = browser.AV = navigator.appVersion;
	browser.opera = dua.indexOf("Opera") >= 0;
	browser.khtml = (dav.indexOf("Konqueror") >= 0)||(dav.indexOf("Safari") >= 0);
	browser.safari = dav.indexOf("Safari") >= 0;
	var geckoPos = dua.indexOf("Gecko");
	browser.mozilla = browser.moz = (geckoPos >= 0)&&(!browser.khtml);
	if (browser.mozilla) {
		// gecko version is YYYYMMDD
		browser.geckoVersion = dua.substring(geckoPos + 6, geckoPos + 14);
	}
	browser.ie = (document.all)&&(!browser.opera);
	browser.ie50 = browser.ie && dav.indexOf("MSIE 5.0")>=0;
	browser.ie55 = browser.ie && dav.indexOf("MSIE 5.5")>=0;
	browser.ie60 = browser.ie && dav.indexOf("MSIE 6.0")>=0;
})();

Cavy.Style = {

	/* float between 0.0 (transparent) and 1.0 (opaque) */
	setOpacity: function(node, opacity, dontFixOpacity) {
		node = $(node);
		if(!dontFixOpacity){
			if( opacity >= 1.0){
				if(browser.ie){
					ds.clearOpacity(node);
					return;
				}else{
					opacity = 0.999999;
				}
			}else if( opacity < 0.0){ opacity = 0; }
		}
		if(browser.ie){
			if(node.nodeName.toLowerCase() == "tr"){
				// FIXME: is this too naive? will we get more than we want?
				var tds = node.getElementsByTagName("td");
				for(var x=0; x<tds.length; x++){
					tds[x].style.filter = "Alpha(Opacity="+opacity*100+")";
				}
			}
			node.style.filter = "Alpha(Opacity="+opacity*100+")";
		}else if(browser.moz){
			node.style.opacity = opacity; // ffox 1.0 directly supports "opacity"
			node.style.MozOpacity = opacity;
		}else if(browser.safari){
			node.style.opacity = opacity; // 1.3 directly supports "opacity"
			node.style.KhtmlOpacity = opacity;
		}else{
			node.style.opacity = opacity;
		}
	},
	getOpacity: function(node) {
		node = $(node);
		if(browser.ie){
			var opac = (node.filters && node.filters.alpha &&
				typeof node.filters.alpha.opacity == "number"
				? node.filters.alpha.opacity : 100) / 100;
		}else{
			var opac = node.style.opacity || node.style.MozOpacity ||
				node.style.KhtmlOpacity || 1;
		}
		return opac >= 0.999999 ? 1.0 : Number(opac);
	},
	clearOpacity: function(node) {
		node = $(node);
		var ns = node.style;
		if(browser.ie){
			try {
				if( node.filters && node.filters.alpha ){
					ns.filter = ""; // FIXME: may get rid of other filter effects
				}
			} catch(e) {
				/*
				 * IE7 gives error if node.filters not set;
				 * don't know why or how to workaround (other than this)
				 */
			}
		}else if(browser.moz){
			ns.opacity = 1;
			ns.MozOpacity = 1;
		}else if(browser.safari){
			ns.opacity = 1;
			ns.KhtmlOpacity = 1;
		}else{
			ns.opacity = 1;
		}
	}

}

Cavy.Screen = {
//	getViewWidth: function() {
//		return document.documentElement.clientWidth || window.innerWidth || 0;
//	},
//	getHeight: function() {
//		return document.documentElement.clientHeight || window.innerHeight || 0;
//	},
//	getPageWidth: function() {
//		//return document.body.offsetWidth + document.body.style.marginLeft + document.body.style.marginRight;
//		//return document.body.offsetWidth;// + window.screenLeft;
//		//return window.screen.width;
//		return this.getViewPortWidth();
//	},
	getViewportWidth:function() {
		var w = 0;
	
		if(window.innerWidth){
			w = window.innerWidth;
		}
	
		if(this.exists(document, "documentElement.clientWidth")){
			// IE6 Strict
			var w2 = document.documentElement.clientWidth;
			// this lets us account for scrollbars
			if(!w || w2 && w2 < w) {
				w = w2;
			}
			return w;
		}
	
		if(document.body){
			// IE
			return document.body.clientWidth;
		}
	
		return 0;	
	},
//	getPageHeight: function() {
////		return document.body.offsetHeight + document.body.style.marginTop + document.body.style.marginBottom;
////		alert(window.screenTop);
//		//return document.body.offsetHeight;// + window.screenTop;
////		return document.body.offsetWidth + document.body.scrollTop ;
////		return window.screen.height;
//		return this.getViewPortHeight();
//	},
	getViewportHeight: function() {
		if (window.innerHeight){
			return window.innerHeight;
		}
	
		if (this.exists(document, "documentElement.clientHeight")){
			// IE6 Strict
			return document.documentElement.clientHeight;
		}
	
		if (document.body){
			// IE
			return document.body.clientHeight;
		}
	
		return 0;
	},
	exists: function(obj, name){
		var p = name.split(".");
		for(var i = 0; i < p.length; i++){
		if(!(obj[p[i]])) return false;
			obj = obj[p[i]];
		}
		return true;
	},
	getScrollLeft: function() {
		return window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
	},
	getScrollTop: function() {
		return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
	}
	//getPageSize: function(){
//	
//	var xScroll, yScroll;
//	
//	if (window.innerHeight && window.scrollMaxY) {
//	xScroll = document.body.scrollWidth;
//	yScroll = window.innerHeight + window.scrollMaxY;
//	} else if (document.body.scrollHeight > document.body.offsetHeight){ // all but Explorer Mac
//	xScroll = document.body.scrollWidth;
//	yScroll = document.body.scrollHeight;
//	} else { // Explorer Mac...would also work in Explorer 6 Strict, Mozilla and Safari
//	xScroll = document.body.offsetWidth;
//	yScroll = document.body.offsetHeight;
//	}
//	
//	var windowWidth, windowHeight;
//	if (self.innerHeight) { // all except Explorer
//	windowWidth = self.innerWidth;
//	windowHeight = self.innerHeight;
//	} else if (document.documentElement && document.documentElement.clientHeight) { // Explorer 6 Strict Mode
//	windowWidth = document.documentElement.clientWidth;
//	windowHeight = document.documentElement.clientHeight;
//	} else if (document.body) { // other Explorers
//	windowWidth = document.body.clientWidth;
//	windowHeight = document.body.clientHeight;
//	}
//	
//	// for small pages with total height less then height of the viewport
//	if(yScroll < windowHeight){
//	pageHeight = windowHeight;
//	} else {
//	pageHeight = yScroll;
//	}
//	
//	// for small pages with total width less then width of the viewport
//	if(xScroll < windowWidth){
//	pageWidth = windowWidth;
//	} else {
//	pageWidth = xScroll;
//	}
//	
//	
//	arrayPageSize = new Array(pageWidth,pageHeight,windowWidth,windowHeight)
//	return arrayPageSize;
//	}
	 	
};
Cavy.Dialog = Class.create();
Cavy.Dialog._current = null;
Cavy.Dialog.getCurrent = function() {
	return Cavy.Dialog._current;
};
Cavy.Dialog.resources = {
	'loading.text': '...'
};
Cavy.Dialog.prototype = {
	dlgEl:null,
	dlgBg:null,
	options:null,
	tpl:null,
	title:null,
	keyObserver:null,
	scrollObserver: null,
	isVisible:false,
	shim: null,
	name : 'dialogCavy',//UI.Dialog's Name
	/**
	 * @params options {width:[integer],height:[integer],context:[cavy app context path],'blank-page':[blank page path, used by iframe src attribute]}
	 */
	initialize: function(title,templateUrl, options) {
		this.name = 'dialogCavy_' + new Date().getTime();
		
		this.title = title;
		this.tpl = templateUrl;
		this.options = options == null ? {} : options;
		if (typeof this.options.width == 'undefined') {
			this.options.width = 320;
		}
		if (typeof this.options.height == 'undefined') {
			this.options.height = 480;
		}
		if (!top.window[this.name]) {
			top.window[this.name] = new top.UI.Dialog({name:this.name,title:this.title,width:this.options.width,height:this.options.height});
		}
		Cavy.Dialog._current = this;
		//this._createWnd();
	},
	fillByHtml: function(innerHTML) {
		/*var container = this.getContainer();
		container.innerHTML = innerHTML;*/
		this._show({html:innerHTML,title:this.title,width:this.options.width,height:this.options.height});
		this._hide_loading();
	},
	fill: function(el) {
		/*var container = this.getContainer();
		container.innerHTML = '';*/
		el = $(el);
		var new_node = el.cloneNode(true);
		//container.appendChild(new_node);
		if (new_node.style.display != null && new_node.style.display == 'none') {
			new_node.style.display = '';
		}
		this._show({html:new_node,title:this.title,width:this.options.width,height:this.options.height});
		this._hide_loading();
	},
	fillByAjax: function(url,mtd) {
		/*var container = this.getContainer();
		container.innerHTML = 'Loading...';
		this._toWaitingStatus();
		var dialog = this;
		new Ajax.Updater(container,url,{
			method: ( mtd == null ? 'get' : mtd ),
			evalScripts: true,
			onComplete: function(xhr) {
				dialog._toNormalStatus();
			}
		});*/
		var dialog = this;
		this._show_loading();
		new Ajax.Request(url, {
			method: ( mtd == null ? 'get' : mtd ),
			onSuccess: function(transport) {
				dialog._show({html:transport.responseText,title:dialog.title,width:dialog.options.width,height:dialog.options.height});
			}
		});

	},
	fillByUrl: function(url) {
		this._show({url:url,title:this.title,width:this.options.width,height:this.options.height});
	},
	show: function() {
		/*this.dlgBg.style.display = 'block';
		this.dlgBg.style.zIndex = 99;
		if (this.shim != null) {
			with (this.shim.style) {
				position = 'absolute';
				border = "0px";
			}
		}
		this._placeDialog();

		Element.observe(document,'keydown',this.keyObserver);
		Element.observe(window,'scroll',this.scrollObserver);
	
		*/
		Cavy.Dialog._current = this;
		this.isVisible = true;
		//top.window[this.name].show();
	},
	close: function() {
		if (this.isVisible) {
			/*Element.stopObserving(document,'keydown',this.keyObserver);
			Element.stopObserving(window,'scroll',this.scrollObserver);
			this.dlgEl.style.display = 'none';
			this.dlgBg.style.display = 'none';*/
			this.isVisible = false;
		}
		top.window[this.name].hide();
		Cavy.Dialog._current = null;
	},
	submitInnerForm: function(frm) {
		var url = frm.action;
		var pars = Form.serialize(frm);
		/*this._toWaitingStatus();
		var dialog = this;*/
		var dialog = top.window[this.name];
		new Ajax.Updater(dialog._data,url,{
			method:'post',parameters: pars,
			evalScripts: true,
			onComplete: function(xhr) {
				dialog._toNormalStatus();
			}
		});
	},
	_placeDialog: function() {
		var left = Cavy.Screen.getScrollLeft() + (Cavy.Screen.getViewportWidth() - this.options.width ) / 2;
		var top = Cavy.Screen.getScrollTop() + (Cavy.Screen.getViewportHeight() - this.options.height ) / 2;
		if (top <= 0) top = 0;
		if (left <= 0) left = 0;

		this.dlgBg.style.width = Cavy.Screen.getScrollLeft() + Cavy.Screen.getViewportWidth() + 'px';
		this.dlgBg.style.height = Cavy.Screen.getScrollTop() + Cavy.Screen.getViewportHeight() + 'px';
		
		// set shim size and position
		if (this.shim != null) {
			this.shim.style.left = left + 'px';
			this.shim.style.top = top + 'px';
		}
		
		this.dlgEl.style.left = left + 'px';
		this.dlgEl.style.top = top + 'px';
		this.dlgEl.style.display = 'block';
		this.dlgEl.style.zIndex = 100;
	
		var container = this.getContainer();
		with(container.style) {
			width = this.options.width + 'px';
			height = this.options.height + 'px';
		}
		this._getTable().width = this.getContainer().scrollWidth + 'px';
		if (this.shim != null) {
			this.shim.style.width = this.dlgEl.offsetWidth + 'px';
			this.shim.style.height = this.dlgEl.offsetHeight + 'px';
		}
//	
//		var scroll_left = Cavy.Screen.getScrollLeft();
//		var scroll_top = Cavy.Screen.getScrollTop();
//		var vw = Cavy.Screen.getViewportWidth();
//		var vh = Cavy.Screen.getViewportHeight();
//
//		var w = Element.getWidth(this.dlgEl);
//		var h = Element.getHeight(this.dlgEl);
//		with (this.dlgEl.style) {
//			left = scroll_left + (vw - w ) / 2 + 'px';
//			top = scroll_top + (vh - h) / 2 + 'px';
//		}
//		
//		var w = Element.getWidth(this.dlgBg);
//		var h = Element.getHeight(this.dlgBg);
//		with (this.dlgBg.style) {
//			left = scroll_left + (vw - w ) / 2 + 'px';
//			top = scroll_top + (vh - h) / 2 + 'px';
//		}
//		
//		var w = Element.getWidth(this.shim);
//		var h = Element.getHeight(this.shim);
//		with (this.shim.style) {
//			left = scroll_left + (vw - w ) / 2 + 'px';
//			top = scroll_top + (vh - h) / 2 + 'px';
//		}
		
	},
	/**
	 * Create an iframe shim that prevents selects from showing through
	 */
	_createShim: function() {
		var shim = document.createElement("IFRAME");
		if (this.options['context'] == null && this.options['blank-page']) {
			alert("Dialog options has no 'context' or 'blank.page' property so iframe src attribute will be blank.\n Please use Ajax Helper to set context automatically");
		}
		else {
			shim.src = this.options['blank-page'] == null ? 
				(this.options['context'] + '/__sys_blank__')
				: this.options['blank-page'];
		}
		shim.className = 'dialog-shim';
		shim.frameBorder = 0;
		return shim;
	},
	_createWnd: function() {
		this.dlgBg = document.createElement("DIV");
		this.dlgBg.className = 'dialog-bg';
		with(this.dlgBg.style) {
			left = '0px';
			top = '0px';
			display = 'none';
			position = 'absolute';
		}
		Cavy.Style.setOpacity(this.dlgBg,0.5);
		document.body.appendChild(this.dlgBg);
		if (Prototype.Browser.IE) {
			this.shim = this._createShim();
			this.dlgBg.appendChild(this.shim);
		}

		this.dlgEl = document.createElement("DIV");
		this.dlgEl.className = 'dialog';
		with(this.dlgEl.style) {
			position = 'absolute';
			display = 'none';
		}
		new Ajax.Updater(this.dlgEl,this.tpl,{asynchronous:false});
		document.body.appendChild(this.dlgEl);
		this._getDom();

		// set title
		this._getTitleCell().innerHTML = this.title;


		this.getContainer().style.width = this.options.width + 'px';
		this.getContainer().style.height = this.options.height + 'px';

		// set windowClose event
		this._getCloseButtonCell().onclick = this.close.bindAsEventListener(this);

		// set key observer
		var dlg = this;
		this.keyObserver = function(evt) {
			if (evt.keyCode == Event.KEY_ESC) {
				dlg.close();
			}
		};
		this.scrollObserver = function(evt) {
			dlg._placeDialog();
		};
	},
	getContainer: function() {
		return this._getTable().rows[1].cells[0].getElementsByTagName('DIV')[0];
	},
	_toWaitingStatus: function() {
		var cell = this._getTitleCell();
		Element.removeClassName(cell,'status-normal');
		Element.addClassName(cell,'status-waiting');
		cell.innerHTML = Cavy.Dialog.resources['loading.text'];
	},
	_toNormalStatus: function() {
		var cell = this._getTitleCell();
		Element.removeClassName(cell,'status-waiting');
		Element.addClassName(cell,'status-normal');
		cell.innerHTML = this.title;
	},
	_getTitleCell: function() {
		return this._getTable().rows[0].cells[0];
	},
	_getCloseButtonCell: function() {
		return this._getTable().rows[0].cells[1];
	},
	_getTable: function() {
		return this.dlgEl.getElementsByTagName('TABLE')[0];
	},
	setWidth:function(width){
		/*this.dlgEl.style.width=width+'px';
		if (this.shim != null) {
			this.shim.style.width=width+'px';
		}*/
		this.options.width = width;
	},
	setHeight:function(height){
		this.options.height = height;
	},
	_show : function(o) { //Show UI Dialog
		top.window[this.name].show(o);
	},
	_show_loading : function() {
		top.window[this.name]._loading.style.display = 'block';
	},
	_hide_loading : function() {
		top.window[this.name]._loading.style.display = 'none';
	}
}

/**
 * Abstract box
 */
Cavy.Box = Class.create();
Cavy.Box.prototype = {
	_initForms: function(el) {
		var form_nodes = $A(el.getElementsByTagName('FORM'));
		if (form_nodes == null) return;
		var pane = this;
		form_nodes.each(function(form_node) {
			if (form_node.onsubmit != null) {
				alert('onsubmit must be empty');
				throw $break;
			}
			form_node.onsubmit = pane._submitForm.bindAsEventListener(pane,el,form_node);
		});
	},
	_submitForm: function(event,el,form_node) {
		var pane = this;
		var params = Form.serialize(form_node);
		new Ajax.Request(form_node.action,{
			method: 'post',
			parameters: params,
			onComplete: function(transport) {
				pane.processResult(transport.responseText,el);
			}
		});
		return false;
	},
	processResult: function(responseText,container) {
		var html = responseText.stripScripts();
		var script = responseText.extractScripts();
		container.innerHTML = html;
		this._initForms(container);
		var paneObj = {onLoad:null,'container':container};
		eval("var pane = paneObj;");
		try {
        	if (typeof(script) == 'string') {
            	eval(script);
			}
            else {
            	for (var i=0; i<script.length; i++) {
                	eval(script[i]);
                }
            }
            if (paneObj.onload != null) {
            	paneObj.onload();
            }
            else if (paneObj.onLoad != null) {
				paneObj.onLoad();
            }
        }
        catch(e) {
        	alert('Pane script error:' + e);
		}		
	}
};

Cavy.Pane = Class.create();
Object.extend(Cavy.Pane.prototype,Cavy.Box.prototype); 
Object.extend(Cavy.Pane.prototype, {
	url: null,
	buttons: null,
	body : null,
	container: null,
	status: null,
	options: {},
	initialize: function(url,buttons,container,options) {
		this.url = url;
		this.buttons = buttons;
		this.container = container;
		this.body = container.parentNode;
		this.options = Object.extend({
			status: 'max'
		},options);
		this._initActions();
		this.status = this.options.status;
		this._setStatus();
		if (this.status == 'max') {
			this.load();
		}
		//Set Max Width && Content (add by lvxuhui)
		if (options.content) {
			if (typeof options.content == 'string') {
				options.content = $(options.content);
			}
			this.container.appendChild(options.content);
		}
		if (options.maxWidth) {
			var body = this.body;
			function checkWidth() {
				var w_window = UI.windowWidth(),hack = parseInt($(body.parentNode).getStyle('paddingRight')) * 2;
				body.style.width = (w_window < options.maxWidth ? w_window : options.maxWidth) - hack + 'px';
			}
			checkWidth();
			Event.observe(window, 'resize',checkWidth);
		}
	},
	_initActions: function() {
		this.buttons['resize'].onclick = this.onResize.bindAsEventListener(this);
		this.buttons['refresh'].onclick = this.onReload.bindAsEventListener(this);
	},
	load: function() {
		if (this.url) {
			this.container.innerHTML = 'Loading...';
			var paneObj = this;
			new Ajax.Request(this.url,{
				method: 'get',
				onComplete: function(transport) {
					paneObj.processResult(transport.responseText,paneObj.container);
				}
			});
		}
		else {
			if (this.buttons.refresh) this.buttons.refresh.style.display = 'none';
		}
	},
	onReload: function(event) {
		this.load();
		this.status = 'max';
		this._setStatus();
		this.container.style.display = 'block';
	},
	_setStatus: function() {
		if (this.status == 'min') {
			this.buttons['resize'].addClassName('min');
		}
		else {
			this.buttons['resize'].removeClassName('min');
		}
	},
	onResize: function(event) {
		if (this.status == 'min') {
			this.maximize();
		}
		else {
			this.minimize();
		}
	},
	maximize: function() {
		if (this.container.innerHTML == '') {
			this.load();
		}
		else this.container.style.display = 'block';
		this.status = 'max';
		this._setStatus();
	},
	minimize: function() {
		this.container.style.display = 'none';
		this.status = 'min';
		this._setStatus();
	}
});

/**
 * ShrinkablePane
 */
var Shrinkable_contents = {};
function Shrinkable_switchImg(img,path) {
	if (img.src.indexOf('up.gif') > 0) {
		img.src = path + '/down.gif';
	}
	else {
		img.src = path + '/up.gif';
	}
}
Cavy.ShrinkablePane = Class.create();
Object.extend(Cavy.ShrinkablePane.prototype, Cavy.Box.prototype);
Object.extend(Cavy.ShrinkablePane.prototype,{
	elmt:null,
	min:null,
	duration:null,
	go_times:null,
	isExtended:null,
	options:{},
	initialize: function(el,min,duration,options) {
		this.elmt = $(el);
		this.min = min;
		this.duration = duration;
		this.go_times = 0;
		this.isExtended = true;
		if (options != null) this.options = options;
		this._initStatus();
		this._initForms(this.elmt);
	},
	_set_height: function(height) {
		if (height == '') {
			this.elmt.parentNode.style.height = '';
			this.elmt.style.height = '';
		}
		else {
			this.elmt.parentNode.style.height = height + 'px';
			this.elmt.style.height = height + 'px';
		}
	},
	_initStatus: function() {
		if (this.elmt.style.height == '') {
			this.max = parseInt(this.elmt.offsetHeight);
			//this.elmt.style.height = this.max + 'px';
			//this._set_height(this.max);
		}
		else {
			this.max = parseInt(this.elmt.style.height);
		}
		this.max = this.elmt.offsetHeight;
		if (this.options.min) {
		    this._to_min_status();
		}
	},
	_to_min_status: function() {
		Shrinkable_contents[this.elmt.id] = this.elmt.innerHTML; 
		this.elmt.innerHTML = ' ';
//	    this.elmt.style.height = this.min + 'px';
		this._set_height(this.min);
	    this.isExtended = false;
	},
	resize: function(callback) {
		if (this.isExtended) {
			this.shrink(callback);
		}
		else {
			this.spread(callback);
		}
	},
	shrink: function(callback) {
		if (window.resizeOptions != null) return;
		var times = parseInt(this.duration /10);
		var step = (this.max - this.min) / times;
		step = parseInt(step + 0.5);
		this.go_times = 0; 
		window.resizeOptions = {
			'panel':this,
			'step':step,
			'callback': function(panel, elmt, isExtended) {
				elmt.innerHTML = ' ';
				if (callback != null) callback(elmt,isExtended);
				elmt.style.position = 'relative';
			}
		};
		Shrinkable_contents[this.elmt.id] = this.elmt.innerHTML; 
		this.elmt.style.position = 'absolute';
		this._set_height(this.max);
		this._set_clip_box();
		this.elmt.innerHTML = Shrinkable_contents[this.elmt.id];
		this._enter_timer(this.on_timer_shrink);
	},
	spread: function (callback) {
		if (window.resizeOptions != null) return;
		var times = parseInt(this.duration /10);
		var step = (this.max - this.min) / times;
		step = parseInt(step + 0.5);
		this.go_times = 0; 
		window.resizeOptions = {
			'panel':this,
			'step':step,
			'callback': function(panel, elmt, isExtended) {
				if (callback != null) callback(elmt,isExtended);			
				elmt.style.position = 'relative';
			}
		};
		this.elmt.style.position = 'absolute';
		this._set_height(this.min);
		this._set_clip_box();
		if (browser.mozilla) {
			/* patch for firefox for firefox process clip box on delay. */
			this._set_clip_box();
		}
		this.elmt.innerHTML = Shrinkable_contents[this.elmt.id];
		this._enter_timer(this.on_timer_spread);
	},
	_set_clip_box: function() {
		var right = parseInt(this.elmt.offsetWidth);
		var bottom = parseInt(this.elmt.offsetHeight);
		this.elmt.style.clip = 'rect(0px,' + right + 'px,' + bottom + 'px,0px)';
	},
	_enter_timer: function(handler) {
		this.interval_handle = window.setInterval(handler,10);
	},
	on_timer_shrink: function() {
		var panel = window.resizeOptions['panel'];
		var step = window.resizeOptions['step'];
		var callback = window.resizeOptions['callback'];
		var h = parseInt(panel.elmt.style.height) - step;
		if (h <= panel.min) {
			window.clearInterval(panel.interval_handle);
			panel._set_height(panel.min);
			panel.elmt.style.clip = 'rect(auto auto auto auto)';
			panel.isExtended = !(panel.isExtended);
			window.resizeOptions = null; 
			if (callback != null) callback(panel,panel.elmt,panel.isExtended);
		}
		else {
			panel._set_height(h);
			panel._set_clip_box();
		}
	},
	on_timer_spread: function() {
		var panel = window.resizeOptions['panel'];
		var step = window.resizeOptions['step'];
		var callback = window.resizeOptions['callback'];
		var h = parseInt(panel.elmt.style.height) + step;
		if (h >= panel.max) {
			window.clearInterval(panel.interval_handle);
			panel._set_height('');
			panel.elmt.style.clip = 'rect(auto auto auto auto)';
			panel.isExtended = !(panel.isExtended);
			window.resizeOptions = null; 
			if (callback != null) callback(panel,panel.elmt,panel.isExtended);
		}
		else {
			panel._set_height(h);
			panel._set_clip_box();
		}
	}
});

Cavy.Slidebar = Class.create();
Cavy.Slidebar.prototype = {
	onChange: null,
	onDrag: null,
	dom: null,
	upHandle: null,
	moveHandle: null,
	offset: 8,
	start: {
		x:0,
		y:0
	},
	/**
	 * @param container dom element
	 * @param size size in px
	 * @param value int value between 0,100
	 * @param position 'horizontal' | 'vertical'
	 * @param onChange js callback function
	 * @param onDrag js callback function
	 */
	initialize: function(container,size,value,position,onChange,onDrag) {
		this.dom = new Cavy.Slidebar.Dom(container);
		this.hor = (position == 'horizontal');
		this.size = size;
		this.value = value;
		this.onChange = onChange;
		this.onDrag = onDrag;
		var btn = this.dom.getButton();
		btn.onmousedown = this.onMouseDown.bindAsEventListener(this);
	},
	setValue: function(value) {
		if (isNaN(value)) {
			alert(value + ' is not number');
			return;
		}
		value = parseInt(value);
		if (value > 100) value = 100;
		if (value < 0) value = 0;
		this.value = value;
		var now_pos = this.offset + (value * this.size / 100); 
		this.dom.moveButton(now_pos + "px",this.hor);
		this.onChange(value);
	},
	onMouseDown: function(event) {
		this.upHandle = this.onMouseUp.bindAsEventListener(this);
		Event.observe(window,'mouseup',this.upHandle);
		this.moveHandle = this.onMouseMove.bindAsEventListener(this)
		Event.observe(window,'mousemove',this.moveHandle);
		var slidebar = this;
		this.start = {x:event.clientX,y:event.clientY};
	},
	onMouseMove: function(event) {
		var now_value = this._queryNowValue(event);
		var now_pos = this.offset + (now_value * this.size / 100); 
		this.dom.moveButton(now_pos + "px",this.hor);
		this.onDrag(now_value);
	},
	_queryNowValue: function(event) {
		var distance = event.clientX - this.start.x;
		var now_value = parseInt(this.value + (distance * 100 / this.size) + 0.5);
		if (now_value > 100) now_value = 100;
		if (now_value < 0) now_value = 0;
		return now_value;
	},
	onMouseUp: function(event) {
		Event.stopObserving(window,'mousemove',this.moveHandle);
		Event.stopObserving(window,'mouseup',this.upHandle);
		this.value = this._queryNowValue(event);
		this.start = {x:null,y:null};
		this.onChange(this.value);
	}
};
Cavy.Slidebar.Dom = Class.create();
Cavy.Slidebar.Dom.prototype = {
	container: null,
	initialize: function(container) {
		this.container = $(container);
	},
	getButton: function() {
		return this.container.getElementsBySelector('P')[0];
	},
	moveButton: function(offset,hor) {
		if (hor)
			this.getButton().style.marginLeft = offset;
		else
			this.getButton().style.marginTop = offset;
	}
};

/**********************************************************
 * Browser Extensions
 **********************************************************/
Cavy.Window = {}
Cavy.Window.stop = function() {
	if (browser.ie) {
		document.execCommand('Stop')
	}
	else {
		window.stop();
	}
}

Cavy.util.DateResource = {};
Cavy.util.DateResource.MonthNames = {
    en: ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'],
    en_US: ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'],
    zh_CN: ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'],
    zh_TW: ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月']
};
Cavy.util.DateResource.WeekNames = {
    en: ['S','M','T','W','T','F','S'],
    en_US: ['S','M','T','W','T','F','S'],
    zh_CN: ['日','一','二','三','四','五','六'],
    zh_TW: ['日','一','二','三','四','五','六']
};
Cavy.util.DateResource.MonthDays = [31,28,31,30,31,30,31,31,30,31,30,31];
Cavy.util.DateResource.MonthDaysInLeapYear = [31,29,31,30,31,30,31,31,30,31,30,31];

Cavy.util.DateFormatter = {
    /**
     * @param format 'dd/mm/yyyy', 'mm/dd/yyyy' or 'yyyy-mm-dd'
     * @param dateStr date text
     */
    parse: function(format,dateStr) {
        switch (format) {
        case 'dd/mm/yyyy':
            var nums = dateStr.split('/');
            if (this._invalid(nums)) return null;
            return new Date(parseInt(nums[2]),parseInt(nums[1]-1),parseInt(nums[0]));
        case 'mm/dd/yyyy':
            var nums = dateStr.split('/');
            if (this._invalid(nums)) return null;
            return new Date(parseInt(nums[2]),parseInt(nums[0]-1),parseInt(nums[1]));
        case 'yyyy-mm-dd':
            var nums = dateStr.split('-');
            if (this._invalid(nums)) return null;
            return new Date(parseInt(nums[0]),parseInt(nums[1]-1),parseInt(nums[2]));
        }
    },
    /**
     * @param format 'dd/mm/yyyy', 'mm/dd/yyyy' or 'yyyy-mm-dd'
     * @param date Date object
     */
    format: function(format,date) {
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var day = date.getDate();
        if (day < 10) day = "0" + day;
        if (month < 10) month = "0" + month;
        if (year < 10) year = "000" + year;
        else if (year < 100) year = "00" + year;
        else if (year < 1000) year = "0" + year;
        switch (format) {
        case 'dd/mm/yyyy':
            return "" + day + "/" + month + "/" + year;
        case 'mm/dd/yyyy':
            return "" + month + "/" + day + "/" + year;
        case 'yyyy-mm-dd':
            return "" + year + "-" + month + "-" + day;
        }
    },
    isFormatStr: function(str) {
        return (str == 'dd/mm/yyyy' || str == 'mm/dd/yyyy' || str == 'yyyy-mm-dd')
    },
    _invalid: function(nums) {
    	for(var k=0;k<3;k++) {
    		if (isNaN(parseInt(nums[k]))) {
    		    return true;
    		}
    	}
    	return false;
    }
};

Cavy.widgets.DatePickerDom = {
    wnd: 'date-picker',
    rowtpl: 'date-picker-row-tpl',
    textbar: 'date-picker-text',
    shim: null,
    options: {},
    showOn: function(textbox) {
        var pos = Position.cumulativeOffset(textbox);
        $(this.wnd).style.left = pos[0] + 'px';
        $(this.wnd).style.top = pos[1] + Element.getHeight(textbox) + 'px';
        $(this.wnd).style.zIndex = 3;
        Element.show($(this.wnd));
        if (this.shim == null && Prototype.Browser.IE) {
	        this.shim = this._createShim();
			document.body.appendChild(this.shim);
        }
        if (this.shim != null) {
	        // move
	        var wnd = $(this.wnd);
			with(this.shim.style) {
				left = pos[0] + 'px';
				top = pos[1] + Element.getHeight(textbox) + 'px';
				width = wnd.offsetWidth + 'px';
				height = wnd.offsetHeight + 'px';
			}
	        Element.show(this.shim);
        }
    },
	_createShim: function() {
		var shim = document.createElement("IFRAME");
		shim.src = this.options['context'] + '/__sys_blank__';
		shim.frameBorder = 0;
		shim.style.position = 'absolute';
		shim.style.zIndex = 2;
		return shim;
	},
    hide: function() {
        Element.hide($(this.wnd));
        if (this.shim != null) Element.hide(this.shim);
    },
    getGrid: function(row,clm) {
        var rownode = $(this.wnd).rows[2+row];
        // check last row
        if (row == 5 && rownode == null) {
        	rownode = $(this.wnd).insertRow(-1);
        	var i=0;
        	cells = $(this.rowtpl).rows[0].cells;
        	for (i=0;i<cells.length;i++) {
				cell = cells[i];
				newcell = rownode.insertCell(-1);
				newcell.className = cell.className;
				newcell.innerHTML = cell.innerHTML;
        	}
        }
        if (rownode == null) alert('row:' + row + ';clm:' + clm);
        var grid = rownode.cells[clm];
        return grid;
    },
    fillWeekNames: function(weekNames) {
        var nameRow = $(this.wnd).rows[1];
        for (var i = 0; i < 7; i++ ) {
            nameRow.cells[i].innerHTML = weekNames[i];
        }
    },
    setText: function(text) {
        $(this.textbar).innerHTML = text;
    },
    inWnd: function(x,y) {
        var wnd = $(this.wnd);
        var pos = Position.cumulativeOffset(wnd);
        return (x >= pos[0] && x < pos[0] + wnd.getWidth()
            && y >= pos[1] && y < pos[1] + wnd.getHeight());
    },
    removeLastRow: function() {
    	var lastrow = $(this.wnd).rows[2+5];
    	if (lastrow == null) return;
    	$(this.wnd).deleteRow(2+5);
    }
};

Cavy.widgets.DatePicker = {
    textbox: null,
    curDate: null,
    dom: null,
    overGrid: null,
    formatStr: null,
    evtHandler: null,
    closed: true,
    oldTextBoxHandler: null,
    onOpen: function(event,textbox,formatStr,locale,options) {
        var event = event || window.event;
       	ASSERT(event != null,'event is null');
       	event.cancelBubble = true;
        if (!this.closed && Event.element(event) != this.textbox) {
        	this.close();
        }
        this.open(textbox,formatStr,locale,options);
    },
    onWndClick: function(event) {
        var event = event || window.event;
       	event.cancelBubble = true;
    },
    open: function(textbox,formatStr,locale,options) {
        this.dom = Cavy.widgets.DatePickerDom;
        if (options != null) this.dom.options = options;
        this.locale = locale;
        this.formatStr = formatStr;
        this.textbox = textbox;
        if (!this._genCurrentDate()) return;

        this.dom.showOn(this.textbox);
        this.dom.fillWeekNames(Cavy.util.DateResource.WeekNames[this.locale]);
        this._fillData();
        this.closed = false;

        this.oldTextBoxHandler = this.textbox.onfocus;
		this.textbox.onfocus = null;
        this.evtHandler = this.onClose.bindAsEventListener(this);
        Event.observe(document,'click',this.evtHandler);
    },
    close: function() {
		if (this.evtHandler != null) {
	        Event.stopObserving(document,'click',this.evtHandler);
        }
        this.evtHandler = null;
        this.locale = null;
        this.formatStr = null;
        this.textbox.onfocus = this.oldTextBoxHandler;
        this.textbox = null;
        this.oldTextBoxHandler = null;
        this.dom.hide();
        
		for (var row = 0; row < 6; row++ ) {
            for (var clm = 0; clm < 7; clm ++ ) {
                var grid = this.dom.getGrid(row,clm);
       			grid.onmouseover=null;
       			grid.onmouseout=null;
       			grid.onclick = null;
            }
        }
        this.closed = true;
    },
    onClose: function(event) {
    	if (this.closed) {
    		return;
    	}
    	if (!this.closed && Event.element(event) == this.textbox) {
			// leave current wnd
			return;
        }
        if (!this.closed) {
	        var pos = Position.cumulativeOffset(this.textbox);
	        if (!this.dom.inWnd(event.clientX,event.clientY)) {
	            this.close();
	        }
        }
    },
    subMonth: function() {
        var new_month = this.curDate.getMonth() - 1;
        if (new_month < 0) {
            this.curDate.setFullYear(this.curDate.getFullYear() -1);
            this.curDate.setMonth(11);
        }
        else {
            this.curDate.setMonth(new_month);
        }
        this._fillData();
    },
    incMonth: function() {
        var new_month = this.curDate.getMonth() + 1;
        if (new_month >= 12) {
            this.curDate.setFullYear(this.curDate.getFullYear() + 1);
            this.curDate.setMonth(0);
        }
        else {
            this.curDate.setMonth(new_month);
        }
        this._fillData();
    },
    _genCurrentDate: function() {
        var curDate = null;
        if (Cavy.util.DateFormatter.isFormatStr(this.textbox.value))
            curDate = new Date();
        else
            curDate = Cavy.util.DateFormatter.parse(this.formatStr,this.textbox.value);
        if (curDate == null) {
            curDate = new Date();
        }
        this.curDate = curDate;
        return true;
    },
    _setMonthText: function() {
        this.dom.setText(this.curDate.getFullYear() + ' ' + Cavy.util.DateResource.MonthNames[this.locale][this.curDate.getMonth()]);
    },
    onGridOver: function(event,grid) {
        Element.addClassName(grid,'over');
        this.overGrid = grid;
    },
    onGridOut: function(event,grid) {
        Element.removeClassName(this.overGrid,'over');
        this.overGrid = null;
    },
    /**
     * @param day start from 1
     */
    onDaySelected: function(event,day) {
        var dt = new Date();
        dt.setFullYear(this.curDate.getFullYear());
        dt.setMonth(this.curDate.getMonth());
        dt.setDate(day);
        this.textbox.value = Cavy.util.DateFormatter.format(this.formatStr,dt);
        this.close();
    },
    /**
     * echo days in window
     */
    _fillData: function() {
        this._setMonthText();
    	now = new Date();
    	sd = now.getDate();
    	
    	var begin = new Date();
    	begin.setDate(1);
    	begin.setFullYear(this.curDate.getFullYear());
    	begin.setMonth(this.curDate.getMonth());
        
    	var isLeapYear = ((this.curDate.getFullYear() % 4 ) == 0);
    	var days = isLeapYear ? Cavy.util.DateResource.MonthDaysInLeapYear : Cavy.util.DateResource.MonthDays;
    	
    	var start_num = begin.getDay();
    	var end_num = begin.getDay() + days[begin.getMonth()];
        for (var row = 0; row < 6; row++ ) {
            for (var clm = 0; clm < 7; clm ++ ) {
                var grid = this.dom.getGrid(row,clm);
                var number = row * 7 + clm;
       		    grid.innerHTML = number - begin.getDay() + 1;
        		if (number >= start_num && number < end_num) {
        		    var day = number - begin.getDay() + 1;
        		    if (day == this.curDate.getDate()) {
            		    grid.className = 'grid-curday';
        		    }
        		    else {
            		    grid.className = 'grid-day';
        		    }
        			grid.onmouseover = this.onGridOver.bindAsEventListener(this,grid);
        			grid.onmouseout = this.onGridOut.bindAsEventListener(this,grid);
        			grid.onclick = this.onDaySelected.bindAsEventListener(this,number - begin.getDay() + 1);
        		}
        		else {
        			grid.innerHTML = '&nbsp;';
        		    grid.className = 'grid'; 
        			grid.onmouseover=null;
        			grid.onmouseout=null;
        			grid.onclick = null;
        		}
            }
            // is the 6 row useless? 
            var begin_number = row * 7;
            if (begin_number >= end_num) {
            	this.dom.removeLastRow();
            }
        }
    }
    
};

Cavy.widgets.TabbedPane = Class.create();
Cavy.widgets.TabbedPane.prototype = {
	dom: null,
	titles: null,
	options: null,
	cbFuncs: null,
	tabs: null,
	actions: null,
	currTab: null,
	texts: null,
	refreshFlag: true,
	initialize: function(titles,options,actions,cbFuncs,texts) {
		this.tabs = [];
		this.currTab = null;
		this.titles = titles;
		this.texts = Object.extend({
			'delete.confirm': 'do you confirm to delete this tab'
		},texts);
		this.options = Object.extend({
			'useIcon': false,
			'autoRefresh': 0,
			'cookieId': null // save on cookie if set
		},options);
		if (this.options.expandable) {
			this.actions = actions;
			// default includes remove, rename, refresh buttons
			this.actions.push('refresh');
			this.actions.push('rename');
			this.actions.push('delete');
			this.actions = this.actions.uniq().reverse();
		}
		this.cbFuncs = Object.extend({
			'onTabAdd':function(tabObj){
				alert('Please listen to onTabAdd event');
			},
			'onTabInit':function(tabObj){
				// do nothing
			},
			'onTabDelete': function(tabObj) {
				alert('Please listen to onTabRemove event');
				return true;
			},
			'onTabRename': function(tabObj) {
				alert('Please listen to onTabRename event');
				return true;
			}
		},cbFuncs);
		this.dom = new Cavy.widgets.TabbedPane.Dom(this.options);
		this._bindListeners();
		this._initTabs();
		this._initMenuItems();

		if (this.options.autoRefresh > 0) {
			var dom = this.dom;
			var pane = this;
			var interval = this.options.autoRefresh;
			new PeriodicalExecuter(function(pe) {
				if (pane.currTab != null) {
					if (pane.refreshFlag) {
						dom.refreshContent(pane.currTab.url);
					}
				}
			},interval);
		}
	},
	_initTabs: function() {
		var activeTab = null;
		if (this.options.expandable) {
			var i;
			var keys = Object.keys(this.titles);
			var pane = this;
			keys.each(function(key) {
				var tabObj = pane.dom.addTab(pane.tabs.length +1,key);
				tabObj.url = pane.titles[key];
				pane.addTab(tabObj,false);
				if (activeTab == null) activeTab = tabObj;
			});
		}
		else {
			var i;
			// only active first tab
			var pane = this;
			var keys = Object.keys(this.titles);
			keys.each(function(key) {
				var tabObj = pane.dom.addTab(pane.tabs.length +1,key);
				tabObj.url = pane.titles[key];
				pane.addTab(tabObj,false);
				
				var isActive = false;
				if (pane.options.cookieId) {
					var value = Cavy.Cookie.getCookie(pane.options.cookieId);
					if (value == null) {
						isActive = (pane.options.activeTabs.indexOf(key) >= 0);
					}
					else {
						// get from cookie
						var urls = value.split(',');
						var decodeUrls = [];
						var i;
						for (i=0; i<urls.length; i++) {
							decodeUrls.push(Cavy.Base64.decode(urls[i]));
						}
						isActive = (decodeUrls.indexOf(tabObj.url) >= 0);
					}
				}
				
				if (isActive) {
					tabObj.active = true;
					if (activeTab == null) activeTab = tabObj;
				}
				else {
					tabObj.enabledNode.style.display = 'none';
					tabObj.disabledNode.style.display = 'none';
					tabObj.active = false;
				}
			});
		}
		this.dom.refreshBlank();
		if (activeTab != null) {
			this.loadTab(activeTab);
		}
		this._checkCommentNode();
	},
	_initMenuItems: function() {
		var dom = this.dom;
		var tabbedpane = this;
		if (this.options.expandable) {
			this.actions.each(function(action) {
				var cbfunc = action;
				ASSERT('action.length must be more than 1',action.length > 1);
				var f = cbfunc.charAt(0).toUpperCase();
				cbfunc = f + cbfunc.substr(1,cbfunc.length - 1);
				var func = null;
				if (tabbedpane['_onTab' + cbfunc]) {
					func = eval('tabbedpane._onTab' + cbfunc + '.bindAsEventListener(tabbedpane)');
				}
				else if (tabbedpane.cbFuncs['onTab' + cbfunc]){
					func = tabbedpane._onTabCustomeEvent.bindAsEventListener(tabbedpane,action);
				}
				else {
					alert('onTab' + cbfunc + " undefined");
				}
				dom.addTabMenuItem(action,func);
			}); 
		}
	},
	_bindListeners: function() {
		if (this.options.expandable) {
			var addBtn = this.dom.getAddButton();
			addBtn.onclick = this._onTabAdd.bindAsEventListener(this);
		}
		if (this.options.selectable) {
			var selectBtn = this.dom.getSelectButton();
			ASSERT('select button is null', selectBtn != null);
			selectBtn.onclick = this._onSelectMenuButtonClicked.bindAsEventListener(this);
		}
		if (this.options.autoRefresh > 0) {
			var checkbox = this.dom.getAutoRefreshButton();
			checkbox.onclick = this._onRefreshChanged.bindAsEventListener(this);
		}
	},
	_onRefreshChanged: function(event) {
		var checkbox = this.dom.getAutoRefreshButton();
		this.refreshFlag = (checkbox.checked == true ? true : false);
	},
	_saveOnCookie: function() {
		if (this.options.cookieId == null || !this.options.selectable) return;
		var value = '';
		this.tabs.each(function(tab){
			if (!tab.active) return;
			value += Cavy.Base64.encode(tab.url) + ",";
			//value += tab.url + ",";
		});
		Cavy.Cookie.setCookie(this.options.cookieId,value,60);
	},
	addTab: function(tabObj,cbFlag) {
		var tabbedPane = this;
		var titleNode = this.dom.getTitleNode(tabObj.enabledNode);
		var title = tabObj.title;
		if (this.options.expandable) {
			var inplaceEditor = new Cavy.widgets.InplaceEditor(titleNode,title.length,function(text) {
				if (tabbedPane.cbFuncs.onTabRename(tabObj,text)) {
					tabbedPane.renameTab(tabObj,text);
				}
				else {
					tabbedPane.renameTab(tabObj,tabObj.title);
				}
			},{'notnull':false});
			tabObj.inplaceEditor = inplaceEditor;
		}
		if (cbFlag) {
			this.cbFuncs.onTabAdd(tabObj);
		}
		else {
			this.cbFuncs.onTabInit(tabObj);
		}
		this.tabs.push(tabObj);
		var lisn = this._onTabClicked.bindAsEventListener(this,tabObj);
		tabObj.disabledNode.onclick = lisn;
		this._checkCommentNode();
	},
	loadBlank: function() {
		this.dom.refreshBlank();
	},
	loadTab: function(tabObj) {
		this.dom.activate(this.tabs,tabObj);
		this.dom.refreshContent(tabObj.url,true);
		this.currTab = tabObj;
	},
	renameTab: function(tabObj,title) {
		tabObj.title = title;
		this.dom.setTabTitle(tabObj.disabledNode,title);
		this.dom.setTabTitle(tabObj.enabledNode,title);
		return true;
	},
	_onTabClicked: function(event,tabObj) {
		this.loadTab(tabObj);
	},
	_onTabCustomeEvent: function(event,action) {
		this.dom.hideTabMenu(this.currTab);
		var cbfunc = action;
		var f = cbfunc.charAt(0).toUpperCase();
		cbfunc = f + cbfunc.substr(1,cbfunc.length - 1);
		eval('this.cbFuncs.onTab' + cbfunc + '(this.currTab)');
	},
	_onTabRename: function(event) {
		var tabObj = this.currTab;
		tabObj.inplaceEditor.enable();
		this.dom.hideTabMenu(tabObj);
		event.cancelBubble = true;
	},
	_onTabRefresh: function(event) {
		var tabObj = this.currTab;
		var pane = this.dom.getContentPane();
		this.dom.hideTabMenu(tabObj);
		this.dom.refreshContent(tabObj.url);
		/*
		new Ajax.Updater(pane,tabObj.url,{
			parameters: 'ts=' + timestamp()
		});
		*/
	},
	_onTabDelete: function(event) {
		var tabObj = this.currTab;
		this.dom.hideTabMenu(tabObj);
		var res = this.cbFuncs.onTabDelete(tabObj);
		if (res) {
			this.dom.deleteTab(tabObj);
			// activate last tab
			var index = this.tabs.indexOf(tabObj);
			this.tabs.splice(index,1);
			this._autoSwitchTab(index);
			this._checkCommentNode();
		}
//		else {
//			alert('Tab cannot be deleted');
//		}
		event.cancelBubble = true;
	},
	_checkCommentNode: function() {
		var activeCount = 0;
		if (this.options.expandable) activeCount = this.tabs.length;
		else {
			var i;
			for (i=0; i<this.tabs.length;i++) {
				if (this.tabs[i].active) activeCount ++;
			}
		}
		if (activeCount == 0) {
			this.dom.addComment();
		}
		else {
			this.dom.removeComment();
		}
	},
	_autoSwitchTab: function(index) {
			if (this.options.expandable) {
				if (index == 0 && this.tabs.length > 0) {
					var lastTab = this.tabs[0];
					this.loadTab(lastTab);
				}
				else if (this.tabs.length > index-1 && index-1 >=0) {
					var lastTab = this.tabs[index-1];
					this.loadTab(lastTab);
				}
				else {
					this.loadBlank();
				}
			}
			else {
				// search ahead
				var lastTab = null;
				var i;
				for (i=index;i>=0;i--) {
					var tab = this.tabs[i];
					if (tab.active) {
						lastTab = tab;
					}
				}
				// search 
				for (i=index;i<this.tabs.length;i++) {
					var tab = this.tabs[i];
					if (tab.active) {
						lastTab = tab;
					}
				}
				if (lastTab)
					this.loadTab(lastTab);
				else
					this.loadBlank();
			
			}
	},
	_onTabAdd: function(event) {
		var num = this.tabs.length + 1;
		var tabObj = this.dom.addTab(num);
		this.addTab(tabObj,true);
		this.loadTab(tabObj);
	},
	_onSelectMenuButtonClicked: function(event) {
		if (this.dom.isSelectMenuPoped()) {
			this.dom.hideSelectMenu();
		}
		else {
			this.dom.showSelectMenu();
			this._fillSelectMenuItems();
		}
	},
	_onSelectItemClicked: function(checked,title) {
		if (checked) {
			var activeTab;
			this.tabs.each(function(tab) {
				if (tab.title == title && !tab.active) {
					activeTab = tab;
					throw $break;
				}
			});
			// activate
			//activeTab.enabledNode.style.display = 'none';
			activeTab.disabledNode.style.display = '';
			activeTab.active = true;
			if (this.currTab == null) {
				this.loadTab(activeTab);
			}
		}
		else {
			var inactiveTab;
			this.tabs.each(function(tab) {
				if (tab.title == title && tab.active) {
					inactiveTab = tab;
					throw $break;
				}
			});
			// inactivate
			inactiveTab.enabledNode.style.display = 'none';
			inactiveTab.disabledNode.style.display = 'none';
			inactiveTab.active = false;
			if (inactiveTab == this.currTab) {
				this.currTab = null;
				var i=0;
				var index = 0;
				for (i=0;i<this.tabs;i++) {
					if (this.tabs[i].active) {
						index ++;
					}
				}
				this._autoSwitchTab(index);
//				this.dom.refreshBlank();
			}
		}
		this._checkCommentNode();
		this._saveOnCookie();
		this.dom.hideSelectMenu();
	},
	_fillSelectMenuItems: function() {
		//this.selectMenuNode.innerHTML = '';
		checkList = {};
		var tabbedpane = this;
		Object.keys(this.titles).each(function(title) {
			var i;
			found = false;
			for (i=0; i<tabbedpane.tabs.length;i++) {
				var tab = tabbedpane.tabs[i];
				if (tab.active && title == tab.title) {
					found = true;
				}
			}
			checkList[title] = found;
		});
		var checkLisn = function(checked,title) {
			tabbedpane._onSelectItemClicked(checked,title);
		};
		//this._onSelectItemClicked.bindAsEventListener(this);
		this.dom.fillSelectMenuItems(checkList,checkLisn);
	}
};
Cavy.widgets.TabbedPane.Dom = Class.create();
Cavy.widgets.TabbedPane.Dom.prototype = {
	pane: null,
	options: null,
	cont: null,
	tabMenuNode: null,
	contentPane: null,
	currTab: null,
	selectBtn: null,
	selectShim: null,
	selectMenuPoped: false,
	initialize: function(options) {
		this.options = options;
		this.tpl = $('__tabbed-pane-tpl');
		var tplPane = this.tpl.getElementsByClassName('_pane')[0];
		this.pane = tplPane.cloneNode(true);
		document.body.appendChild(this.pane);
		this.cont = this.pane.getElementsByClassName('_container')[0];
		ASSERT('cont is null',this.cont != null);
		if (this.options.expandable) {
			this._insertAddButton();
			this._createTabMenu();
		}
		if (this.options.selectable) {
			this._createSelectButton();
			//this._createSelectMenu();
		}
		if (this.options.autoRefresh > 0) {
			this._insertRefreshButton();
		}
		var div = this.pane.getElementsByClassName('content')[0];
		var iframe = this.pane.getElementsByClassName('content')[1];
		if (this.options.iframe) {
			this.contentPane = iframe;
			div.parentNode.removeChild(div);
		}
		else {
			this.contentPane = div;
			iframe.parentNode.removeChild(iframe);
		}
	},
	addComment: function() {
		if (this._getCommentNode() != null) return;
		var cls = this.options.expandable ? '_comment-node-add' : '_comment-node-select';
		var tplnode = this.tpl.getElementsByClassName(cls)[0].rows[0].cells[0];
		var last_cell = this.cont.getElementsByClassName('_border')[0];
		//var node = tplnode.cloneNode(true);
		var node = last_cell.parentNode.insertCell(-1);
		node.className = tplnode.className;
		node.innerHTML = tplnode.innerHTML;
		last_cell.parentNode.insertBefore(node,last_cell);
		//node.getElementsByTagName('DIV').item(0).innerHTML = text;
	},
	removeComment:function() {
		var node = this._getCommentNode();
		if (node != null)
			node.parentNode.removeChild(node);
	},
	_getCommentNode:function() {
		var nodes = this.cont.getElementsByClassName('_comment-cell');
		if (nodes != null && nodes.length > 0) {
			return nodes[0];
		}
		else
			return null;
	},
	refreshBlank: function() {
		if (this.options.iframe) {
			this.contentPane.src = this.options.blankPage;
		}
		else {
			this.contentPane.innerHTML = '';
		}
	},
	refreshContent: function(url,sync) {
		if (this.options.iframe) {
			this.contentPane.src = url;
		}
		else {
			if (sync == null) sync = false;
			new Ajax.Updater(this.contentPane,url,{evalScripts:true,asynchronous:!sync});
		}
	},
	deleteTab: function(tabObj) {
		this.cont.removeChild(tabObj.enabledNode);
		this.cont.removeChild(tabObj.disabledNode);
	},
	addTab: function(num,title) {
		var enabledNode = null;
		var disabledNode = null;
		enabledNodeTpl = this.tpl.getElementsByClassName('_enabled-tab')[0].getElementsByTagName('TD').item(0);
		disabledNodeTpl = this.tpl.getElementsByClassName('_disabled-tab')[0].getElementsByTagName('TD').item(0);
		ASSERT('enabledNode create failed',enabledNodeTpl != null);
		ASSERT('disabledNode create failed',disabledNodeTpl != null);
		
		var enabledNode = this._newTabNode();
		enabledNode.innerHTML = enabledNodeTpl.innerHTML;
		enabledNode.className = enabledNodeTpl.className;
		enabledNode.style.display = 'none';
		
		var disabledNode = this._newTabNode();
		disabledNode.innerHTML = disabledNodeTpl.innerHTML;
		disabledNode.className = disabledNodeTpl.className;
		disabledNode.style.display = '';

		var contNode = null;
		if (Prototype.Browser.IE) {
			contNode = Element.getElementsByClassName(enabledNode,'current')[0];
		}
		else {
			contNode = enabledNode.getElementsByClassName('current')[0];
		}
		var beforeNode = contNode.getElementsByTagName('IMG').item(0);
		ASSERT('beforeNode is null', beforeNode != null);
		var tabNode = null;
		if (this.options.useIcon) {
			tabNode = this.tpl.getElementsByClassName('_icon-tab')[0].cloneNode(true);
		}
		else {
			tabNode = this.tpl.getElementsByClassName('_noicon-tab')[0].cloneNode(true);
		}
		
		beforeNode.parentNode.insertBefore(tabNode,beforeNode);
		if (title == null) {
			title = this.getTabTitle(enabledNode) + " " + num;
		}
		this.setTabTitle(enabledNode,title);
		this.setTabTitle(disabledNode,title);

		var tabObj = {'enabledNode':enabledNode,'disabledNode':disabledNode,'title':title,'menuPoped':false};
		if (this.options.expandable) {
			var menuBtn = enabledNode.getElementsByTagName('IMG').item(0);
			menuBtn.onclick = this._onTabMenuClicked.bindAsEventListener(this,tabObj);
		}
		else {
			var menuBtn = enabledNode.getElementsByTagName('IMG').item(0);
//			menuBtn.parentNode.removeChild(menuBtn);
			// hide down icon
			Element.addClassName(menuBtn.parentNode,'hidden');
		}
		tabObj.menuBtn = menuBtn;
		return tabObj;
	},
	hideTabMenu: function(tabObj) {
		var parent = this.tabMenuNode.parentNode;
		//var menuCont = tabObj.enabledNode.getElementsByClassName('current')[0];
		this.tabMenuNode.style.display = 'none';

		if (this.tabMenuShim != null) {
			//this.tabMenuShim.className = '';
			parent.removeChild(this.tabMenuShim);
			document.body.appendChild(this.tabMenuShim);
		}

		parent.removeChild(this.tabMenuNode);
		document.body.appendChild(this.tabMenuNode);
		
		if (this.tabMenuShim) this.tabMenuShim.style.display = 'none';
		tabObj.menuPoped = false;
	},
	showTabMenu: function(tabObj) {
		var parent = this.tabMenuNode.parentNode;
		var menuCont = tabObj.enabledNode.getElementsByClassName('current')[0].parentNode;

		parent.removeChild(this.tabMenuNode);
		menuCont.appendChild(this.tabMenuNode);

		if (this.tabMenuShim != null) {
			parent.removeChild(this.tabMenuShim);
			this.tabMenuShim.style.display = '';
			menuCont.insertBefore(this.tabMenuShim,this.tabMenuNode);
			//this.tabMenuShim.className = this.tabMenuShim.getAttribute('classbak');
			//with(this.tabMenuShim.style) {
//				position = absolute;
//				zIndex = 50;
//				width = this.nextSibling.offsetWidth;
//				height = this.nextSibling.offsetHeight;
//			}
		}

		
		this.tabMenuNode.style.display = '';
		/* 
		var btn_pos = Position.cumulativeOffset(tabObj.menuBtn);
		var setPos = {
			'x': btn_pos[0] + 10,
			'y': btn_pos[1] + 24
		};
		with(this.tabMenuNode) {
			style.zIndex = 100;
			style.top = setPos.y;
			style.left = setPos.x;
		}
		var pos = Position.cumulativeOffset(this.tabMenuNode);
		var menunode = this.tabMenuNode;
		if (this.tabMenuShim) this.tabMenuShim.style.display = '';
		if (this.tabMenuShim) {
			with(this.tabMenuShim) {
				style.position = 'absolute';
				style.zIndex = 50;
				style.width = menunode.offsetWidth;
				style.height = menunode.offsetHeight;
				style.top = setPos.y;
				style.left = setPos.x;
				style.display = '';
			}
		}
		 */

		tabObj.menuPoped = true;
	},
	_onTabMenuClicked: function(event,tabObj) {
		var parent = this.tabMenuNode.parentNode;
		var menuCont = tabObj.enabledNode.getElementsByClassName('current')[0];
		if (tabObj.menuPoped) {
			// hide
			this.hideTabMenu(tabObj);
		}
		else {
			// show
			this.showTabMenu(tabObj);
		}
		event.cancelBubble = true;
	},
	getContentPane: function() {
		return this.contentPane;
	},
	_createTabMenu: function() {
		var shimtpl = this.tpl.getElementsByClassName('_enabled-tab-menu-shim')[0].getElementsByTagName('IFRAME').item(0);
		if (browser.ie) {
			this.tabMenuShim = document.createElement('IFRAME');
			//this.tabMenuShim.setAttribute('classbak',shimtpl.getAttribute('classbak'));
			this.tabMenuShim.src = this.options.blankPage;
			this.tabMenuShim.style.display = 'none';
			document.body.appendChild(this.tabMenuShim);
		}
		var menutpl = this.tpl.getElementsByClassName('_enabled-tab-menu')[0];
		var menunode = menutpl.cloneNode(true);
		menunode.innerHTML = '';
		document.body.appendChild(menunode);
		this.tabMenuNode = menunode;
		
		if (browser.ie) {
			this.tabMenuShim.className = shimtpl.getAttribute('classbak');
		}
	},
	_createSelectButton: function() {
		var cont = this.tpl.getElementsByClassName('_select-tab-btn')[0];
		var btntpl = cont.getElementsByTagName('TD').item(0);
		var cell = this._insertCell();
		cell.className = btntpl.className;
		cell.innerHTML = btntpl.innerHTML;
		if (browser.ie) {
			this.selectShim = cell.getElementsByTagName('IFRAME').item(0);
		}
		else {
			var shim = cell.getElementsByTagName('IFRAME').item(0);
			shim.parentNode.removeChild(shim);
		}
		this.selectBtn = cell.getElementsByTagName('IMG').item(0);
		ASSERT('select btn is null', this.selectBtn != null);
		
//		var menutpl = this.tpl.getElementsByClassName('_select-menu')[0];
//		var menunode = menutpl.cloneNode(true);
		this.selectMenuNode = cell.getElementsByTagName('DIV').item(0);
		this.selectMenuNode.innerHTML = '';
//		menunode.innerHTML = '';
//		document.body.appendChild(menunode);
		//cell.appendChild(menunode);
//		this.selectMenuNode = menunode;
		if (this.selectShim != null) {
			this.selectShim.className = this.selectShim.getAttribute('classbak');
			this.selectShim.style.display = 'none';
		}
	},
		/*
	_createSelectMenu: function() {
		var menutpl = this.tpl.getElementsByClassName('_select-menu')[0];
		var menunode = menutpl.cloneNode(true);
		menunode.innerHTML = '';
		document.body.appendChild(menunode);
		this.selectMenuNode = menunode;
	},
		*/
	isSelectMenuPoped: function() {
		return this.selectMenuPoped;
	},
	hideSelectMenu: function() {
		if (this.selectShim != null) this.selectShim.style.display = 'none';
		this.selectMenuNode.style.display = 'none';
		//document.body.appendChild(this.selectMenuNode);
		this.selectMenuPoped = false;
	},
	showSelectMenu: function(tabObj) {
		if (this.selectShim != null) {
			ASSERT("shim is error",this.selectShim.nextSibling.nodeName == 'DIV');
		}
		if (this.selectShim != null) {
			this.selectShim.style.display = '';
//			this.selectShim.className = this.selectShim.className;
		}
		this.selectMenuNode.style.display = '';
		this.selectMenuPoped = true;
	},
	fillSelectMenuItems: function(checkList,checkLisn) {
		this.selectMenuNode.innerHTML = '';
		var keys = Object.keys(checkList);
		var dom = this;
		keys.each(function(key) {
			dom._insertSelectMenuItem(key,checkList[key],checkLisn);
		});
	},
	_insertSelectMenuItem: function(title,checked,checkLisn) {
		var itemtpl = this.tpl.getElementsByClassName('_select-menu-item')[0].getElementsByTagName('A').item(0);
		var menuitem = itemtpl.cloneNode(true);
		var label = menuitem.getElementsByTagName('LABEL').item(0);
		label.innerHTML = title;
		this.selectMenuNode.appendChild(menuitem);

		var checkbox = menuitem.getElementsByTagName('INPUT').item(0);
		checkbox.name = title;
		var dom = this;
		checkbox.onclick = function() {
			checkLisn.call(null,checkbox.checked,title);
		};
		checkbox.checked = checked;
		return menuitem;
	},
	addTabMenuItem: function(type,cbFunc) {
		var menutpl = this.tpl.getElementsByClassName('_enabled-tab-menu')[0];
		var itemTpl = menutpl.getElementsByClassName(type)[0];
		var item = itemTpl.cloneNode(true);
		this.tabMenuNode.appendChild(item);
		item.onclick = cbFunc;
	},
	_insertAddButton: function() {
		var cont = this.tpl.getElementsByClassName('_add-tab-btn')[0];
		var btntpl = cont.getElementsByTagName('TD').item(0);
		var cell = this._insertCell();
		cell.className = btntpl.className;
		cell.innerHTML = btntpl.innerHTML;
		return cell;
	},
	_insertRefreshButton: function() {
		var cont = this.tpl.getElementsByClassName('_refresh-tab-btn')[0];
		var btntpl = cont.getElementsByTagName('TD').item(0);
		var cell = this._appendCell();
		cell.className = btntpl.className;
		cell.innerHTML = btntpl.innerHTML;
		checkbox = cell.getElementsByTagName('INPUT').item(0);
		checkbox.checked = true;
		return cell;
	},
	_appendCell: function() {
		return this.cont.insertCell(-1);
	},
	_insertCell: function() {
		var comment_cell = this._getCommentNode();
		if (comment_cell == null) {
			comment_cell = this.cont.getElementsByClassName('_border')[0];
		}
		var cell = this.cont.insertCell(comment_cell.cellIndex);
		return cell;
	},
	_newTabNode: function() {
		var last_btn = this.options.selectable ? this.getSelectButton() : this.getAddButton();
		var last_cell = last_btn.parentNode;
		ASSERT('index >= 0',last_cell.cellIndex >= 0);
		var cell = this.cont.insertCell(last_cell.cellIndex);
		return cell;
	},
	getAddButton: function() {
		if (this.options.expandable)
			return this.pane.getElementsByClassName('__add-tab-btn')[0];
		return null;
	},
	getAutoRefreshButton: function() {
		nodes = this.pane.getElementsByClassName('__autorefresh-btn');
		if (nodes.length > 0) return nodes[0];
		return null;
	},
	getSelectButton: function() {
		return this.selectBtn;
	},
	activate: function(tabs,tab) {
		var i=0;
		for(i=0; i<tabs.length; i++) {
			if (this.options.selectable) {
				if (!tabs[i].active) continue;
			}
			if (tabs[i].enabledNode == tab.enabledNode) {
				// active
				tabs[i].enabledNode.style.display = '';
				tabs[i].disabledNode.style.display = 'none';
			}
			else {
				// inactive
				tabs[i].enabledNode.style.display = 'none';
				tabs[i].disabledNode.style.display = '';
			}
		}
		var e_tabs = this.cont.getElementsByClassName('__enabled-tab');
		var d_tabs = this.cont.getElementsByClassName('__disabled-tab');
	},
	getTabTitle: function(tabNode) {
		var titleNode = this.getTitleNode(tabNode);
		return titleNode.innerHTML;
	},
	setTabTitle: function(tabNode,title) {
		var titleNode = this.getTitleNode(tabNode);
		titleNode.innerHTML = title;
	},
	getTitleNode: function(tabNode) {
		var titleNode = null;
		if (Element.hasClassName(tabNode,'__enabled-tab')) {
			titleNode = tabNode.getElementsByTagName('B').item(0); 
		}
		else {
			titleNode = tabNode;
		}
		if (titleNode == null) {
			alert(tabNode.innerHTML);
		}
		ASSERT('titleNode is null',titleNode != null);
		return titleNode;
	}
};

Cavy.widgets.InplaceEditor = Class.create();
Cavy.widgets.InplaceEditor.prototype = {
	text: null,
	ctrl: null,
	size: 20,
	el: null,
	onComplete: null,
	options: null,
	initialize: function(el,size,onComplete) {
		this.el = $(el);
		this.text = this.el.childNodes[0].nodeValue;
		this.size = size;
		this.onComplete = onComplete;
		this._createControl();
		this.el.onclick = this.enable.bindAsEventListener(this);
	},
	enable: function() {
		Element.show(this.ctrl);
		Element.hide(this.el);
		this.ctrl.value = this.text;
		this.ctrl.select();
		this.ctrl.focus();
	},
	focus: function() {
		this.ctrl.select();
		this.ctrl.focus();
	},
	disable: function() {
		Element.hide(this.ctrl);
		Element.show(this.el);
	},
	_onComplete: function(event) {
		event.cancelBubble = true;
		this.text = this.ctrl.value;
		this.el.childNodes[0].nodeValue = this.text;
		this.onComplete(this.text);
		this.disable();
	},
	_createControl: function() {
		var parent = this.el.parentNode;
		var ctrl = document.createElement('INPUT');
		with(ctrl) {
			type = 'text';
			className = 'inplace-editor';
			size = this.size;
		}
		if (this.el.nextSibling == null) {
			parent.appendChild(ctrl);
		}
		else {
			parent.insertBefore(ctrl,this.el);
		}
		this.ctrl = ctrl;

		var onComplete = this.onComplete;
		ctrl.onblur = this._onComplete.bindAsEventListener(this);
		ctrl.onkeypress = function(event) {
			event = event || window.event;
			if (event.keyCode == Event.KEY_RETURN) {
				ctrl.blur();
			}
		};
		this.disable();
	}
};

Cavy.Base64 = {
    /**
     * 此变量为编码的key，每个字符的下标相对应于它所代表的编码。
     */
    enKey: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
    /**
     * 此变量为解码的key，是一个数组，BASE64的字符的ASCII值做下标，所对应的就是该字符所代表的编码值。
     */
    deKey: new Array(
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63,
        52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1,
        -1,  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14,
        15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1,
        -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
        41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1
    ),
    /**
     * 编码
     */
    encode: function(src){
        //用一个数组来存放编码后的字符，效率比用字符串相加高很多。
        var str=new Array();
        var ch1, ch2, ch3;
        var pos=0;
       //每三个字符进行编码。
        while(pos+3<=src.length){
            ch1=src.charCodeAt(pos++);
            ch2=src.charCodeAt(pos++);
            ch3=src.charCodeAt(pos++);
            str.push(this.enKey.charAt(ch1>>2), this.enKey.charAt(((ch1<<4)+(ch2>>4))&0x3f));
            str.push(this.enKey.charAt(((ch2<<2)+(ch3>>6))&0x3f), this.enKey.charAt(ch3&0x3f));
        }
        //给剩下的字符进行编码。
        if(pos<src.length){
            ch1=src.charCodeAt(pos++);
            str.push(this.enKey.charAt(ch1>>2));
            if(pos<src.length){
                ch2=src.charCodeAt(pos);
                str.push(this.enKey.charAt(((ch1<<4)+(ch2>>4))&0x3f));
                str.push(this.enKey.charAt(ch2<<2&0x3f), '=');
            }else{
                str.push(this.enKey.charAt(ch1<<4&0x3f), '==');
            }
        }
       //组合各编码后的字符，连成一个字符串。
        return str.join('');
    },
    /**
     * 解码。
     */
    decode: function(src){
        //用一个数组来存放解码后的字符。
        var str=new Array();
        var ch1, ch2, ch3, ch4;
        var pos=0;
       //过滤非法字符，并去掉'='。
        src=src.replace(/[^A-Za-z0-9\+\/]/g, '');
        //decode the source string in partition of per four characters.
        while(pos+4<=src.length){
            ch1=this.deKey[src.charCodeAt(pos++)];
            ch2=this.deKey[src.charCodeAt(pos++)];
            ch3=this.deKey[src.charCodeAt(pos++)];
            ch4=this.deKey[src.charCodeAt(pos++)];
            str.push(String.fromCharCode(
                (ch1<<2&0xff)+(ch2>>4), (ch2<<4&0xff)+(ch3>>2), (ch3<<6&0xff)+ch4));
        }
        //给剩下的字符进行解码。
        if(pos+1<src.length){
            ch1=this.deKey[src.charCodeAt(pos++)];
            ch2=this.deKey[src.charCodeAt(pos++)];
            if(pos<src.length){
                ch3=this.deKey[src.charCodeAt(pos)];
                str.push(String.fromCharCode((ch1<<2&0xff)+(ch2>>4), (ch2<<4&0xff)+(ch3>>2)));
            }else{
                str.push(String.fromCharCode((ch1<<2&0xff)+(ch2>>4)));
            }
        }
       //组合各解码后的字符，连成一个字符串。
        return str.join('');
    }
};

Cavy.Encoder = {
	utf16to8: function(str) {
	    var out, i, len, c;

	    out = "";
	    len = str.length;
	    for(i = 0; i < len; i++) {
	        c = str.charCodeAt(i);
	        if ((c >= 0x0001) && (c <= 0x007F)) {
	            out += str.charAt(i);
	        } else if (c > 0x07FF) {
	            out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
	            out += String.fromCharCode(0x80 | ((c >>  6) & 0x3F));
	            out += String.fromCharCode(0x80 | ((c >>  0) & 0x3F));
	        } else {
	            out += String.fromCharCode(0xC0 | ((c >>  6) & 0x1F));
	            out += String.fromCharCode(0x80 | ((c >>  0) & 0x3F));
	        }
	    }
	    return out;
	},
	utf8to16: function(str) {
	    var out, i, len, c;
	    var char2, char3;

	    out = "";
	    len = str.length;
	    i = 0;
	    while(i < len) {
	        c = str.charCodeAt(i++);
	        switch(c >> 4){
	          case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
	            // 0xxxxxxx
	            out += str.charAt(i-1);
	            break;
	          case 12: case 13:
	            // 110x xxxx   10xx xxxx
	            char2 = str.charCodeAt(i++);
	            out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
	            break;
	          case 14:
	            // 1110 xxxx  10xx xxxx  10xx xxxx
	            char2 = str.charCodeAt(i++);
	            char3 = str.charCodeAt(i++);
	            out += String.fromCharCode(((c & 0x0F) << 12) |
	                                           ((char2 & 0x3F) << 6) |
	                                           ((char3 & 0x3F) << 0));
	            break;
	        }
	    }
	
	    return out;
	}
};

Cavy.Cookie = {
	
	getCookie: function( name ) {
		var start = document.cookie.indexOf( name + "=" );
		var len = start + name.length + 1;
		if ( ( !start ) && ( name != document.cookie.substring( 0, name.length ) ) ) {
			return null;
		}
		if ( start == -1 ) return null;
		var end = document.cookie.indexOf( ';', len );
		if ( end == -1 ) end = document.cookie.length;
		return unescape( document.cookie.substring( len, end ) );
	},
	
	setCookie: function( name, value, expires, path, domain, secure ) {
		var today = new Date();
		today.setTime( today.getTime() );
		if ( expires ) {
			expires = expires * 1000 * 60 * 60 * 24;
		}
		var expires_date = new Date( today.getTime() + (expires) );
		document.cookie = name + '=' + escape( value ) +
			( ( expires ) ? ';expires=' + expires_date.toGMTString() : '' ) + //expires.toGMTString()
			( ( path ) ? ';path=' + path : '' ) +
			( ( domain ) ? ';domain=' + domain : '' ) +
			( ( secure ) ? ';secure' : '' );
	},
	
	deleteCookie: function ( name, path, domain ) {
		if ( getCookie(name)) {
			document.cookie = name + '=' +
			( ( path ) ? ';path=' + path : '') +
			( ( domain ) ? ';domain=' + domain : '' ) +
			';expires=Thu, 01-Jan-1970 00:00:01 GMT';
		}
	}
};



if (!UI) {
String.prototype.hasString = function(o) { //If Has String
	if (typeof o == 'object') {
		for (var i=0,n = o.length;i < n;i++) {
			if (!this.hasString(o[i])) return false;
		}
		return true;
	}
	else if (this.indexOf(o) != -1) return true;
};
String.prototype.breakWord = function(n,s) {
	if (!s) s = '<wbr/>';
	return this.replace(RegExp('(\\w{' + (n ? n : 0) + '})(\\w)','g'),function(all,str,char){
		return str + s + char;
	});
};
var UI = {
	tip : function() {
		this.Tip.build();
	},
	tipBox : function(o,n) {
		if (UI.isString(o)) {
			n = o;
			o = document.documentElement;
		}
		if(!o) o = document.documentElement;

		var n = '.' + (n ? n : 'tipBox');
		var name = '__tipBox';
		var tag = 'tipbox';
		var delay;

		UI.each(UI.GC(o,n),function(o){
			UI.A(o,tag,o.title);
			o.title = '';
			var open = function(e){
				var t = UI.E(e).target,html = UI.A(t,tag);
				if (!html) {
					var parents = UI.parents(t,n.slice(1));
					if (parents.length > 0) {
						t = parents[0];
						html = UI.A(t,tag);
					}
					else return false;
				}
				delay = setTimeout(function(){
					var o = {html:html,target:t};//.breakWord(5)
					if (html.length > 500) o.large = true;
					UI[name].show(o);
				},300);
				//alert(delay + 'add');//连续被触发？
			}
			UI.EA(o,'mouseover',open);
			UI.EA(o,'focus',open);
			UI.EA(o,'mouseout',function(e){
				clearTimeout(delay);
				//alert(delay);
			});
		});
		if (!UI[name]) {
			UI.ready(function(){
				UI[name] = new UI.TipBox({name:'UI.' + name});
			});
		}
	},
	select : function(n) {
		this.Select.build(n);
	},
	selectMulti : function(o,n) {
		if (UI.isString(o)) {
			n = o;
			o = document.documentElement;
		}
		if(!o) o = document.documentElement;

		var n = '.' + (n ? n : 'selectMulti');
		
		UI.each(UI.GC(o,n),function(o,i){
			var name = 'selectMulti_' + new Date().getTime() + i;
			o.name = name;
			window[name] = new UI.SelectMulti(o);
		});
	},
	resize : function(n,config) {
		var arr = UI.isObject(n) ? [n] : UI.GC(n);
		UI.each(arr,function(o){
			if('TEXTAREA,SELECT'.hasString(o.nodeName)) UI.wrap('<span class="resize_box"><b class="ico"></b><span></span></span>',o);
			else {
				var B = UI.html('<b class="ico"></b>')[0];
				o.appendChild(B);
			}
			new UI.Resize(o,config);
		});
	},
	gotop : function(n) {
		this.Gotop.build(n);
	},
	ajax : function(o) { // UI.ajax({type:'',url:'json.html',data:'',success:''})
	},
	get : function(url,o,f) { // UI.get('json.html',{name:''},function(data){ alert(data); })
		if (window.ActiveXObject){
			var xmlHttp = new ActiveXObject('Microsoft.XMLHTTP');
		}else if (window.XMLHttpRequest){
			var xmlHttp = new XMLHttpRequest();
		}
		xmlHttp.onreadystatechange = function(){
			if (xmlHttp.readyState == 4){// && xmlHttp.status == 200
				f(xmlHttp.responseText);
			}else{
				return false;
			}
		}
		if (o != undefined) {
			url += '?' + o;
		}
		xmlHttp.open('GET',url,true)
		xmlHttp.send(null);
	},
	url : {
		encode : function (string) {
			return escape(this._utf8_encode(string));
		},
		decode : function (string) {
			return this._utf8_decode(unescape(string));
		},
		_utf8_encode : function (string) {
			string = string.replace(/\r\n/g,"\n");
			var utftext = "";
			for (var n = 0; n < string.length; n++) {
				var c = string.charCodeAt(n);
				if (c < 128) {
					utftext += String.fromCharCode(c);
				}
				else if((c > 127) && (c < 2048)) {
					utftext += String.fromCharCode((c >> 6) | 192);
					utftext += String.fromCharCode((c & 63) | 128);
				}
				else {
					utftext += String.fromCharCode((c >> 12) | 224);
					utftext += String.fromCharCode(((c >> 6) & 63) | 128);
					utftext += String.fromCharCode((c & 63) | 128);
				}
	 
			}
			return utftext;
		},
		_utf8_decode : function (utftext) {
			var string = "";
			var i = 0;
			var c = c1 = c2 = 0;
			while ( i < utftext.length ) {
				c = utftext.charCodeAt(i);
				if (c < 128) {
					string += String.fromCharCode(c);
					i++;
				}
				else if((c > 191) && (c < 224)) {
					c2 = utftext.charCodeAt(i+1);
					string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
					i += 2;
				}
				else {
					c2 = utftext.charCodeAt(i+1);
					c3 = utftext.charCodeAt(i+2);
					string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
					i += 3;
				}
			}
			return string;
		}
	},
	parseUrl : function() {
		var url = document.location.href,v = {};
		if (!url.hasString('?')) return v;
		var str = url.split('?')[1].split('&');
		for (var i=0;i<str.length;i++) {
			var value = str[i].split('=');
			//v[value[0]] = value[1];
			v[value[0]] = UI.Browser.ie ? value[1] : UI.url.decode(value[1]);
		}
		return v;
	},
	cookie : function(n,v,d) { //Cookie
		if (v == undefined) {
			var N = n + '=',C = document.cookie.split(';');
			for(var i=0;i<C.length;i++) {
				var c = C[i];
				while (c.charAt(0)==' ') c = c.substring(1,c.length);
				if (c.indexOf(N) == 0) return decodeURIComponent(c.substring(N.length,c.length));
			}
			return null;
		}
		else {
			var k = '';
			if (d) {
				var D = new Date();
				D.setTime(D.getTime() + d * 24 * 60 * 60 * 1000);
				k = '; expires=' + D.toGMTString();
			}
			document.cookie = n + '=' + v + k + '; path=/';
		}
	},
	drag : function(o,f,captrue) {
		var D = document,captrue = captrue != undefined ? captrue : true;
		UI.EA(o,'mousedown',function(e){
			if (f.start) f.start(e);//start

			if (captrue) {
				if(o.setCapture) o.setCapture();
				else if(window.captureEvents) window.captureEvents(Event.MOUSEMOVE|Event.MOUSEUP);
			}

			if (f.drag) D.onmousemove = f.drag; //drag
			D.onmouseup = function(){
				if (captrue) {
					if(o.releaseCapture) o.releaseCapture();
					else if(window.captureEvents) window.captureEvents(Event.MOUSEMOVE|Event.MOUSEUP);
				}

				if (f.stop) f.stop(e); //stop
				D.onmousemove = null;
				D.onmouseup = null;
				if (f.call) f.call(e); //call
			}
		})
	},
	animate : function(o,name,num,call) { // UI.animate(UI.G('news_bar'),'width',100)
		var delay = setInterval(function(){
			var cur = UI.C(o,name);
			if (name == 'opacity') {
				cur = cur*100;
				num *= 100;
			}
			else cur = ( cur=='auto' ? 0 : Number(cur.slice(0,-2)) );
			if (Math.abs(num - cur) < 3) {
				cur = num;
				clearInterval(delay);
				eval(call);
			}
			UI.C(o,name,(name != 'opacity' ? (cur + (num-cur)*0.4 ) + 'px' : (cur + (num-cur)*0.4 )/100 + ''));
		},40);
		return delay;
	},
	getX : function(o) {
		return o.offsetParent ? o.offsetLeft + UI.getX(o.offsetParent) : o.offsetLeft;
	},
	getY : function(o) {
		return o.offsetParent ? o.offsetTop + UI.getY(o.offsetParent) : o.offsetTop;
	},
	width : function(o) {
		return parseInt(o.offsetWidth);
	},
	height : function(o) {
		return parseInt(o.offsetHeight);
	},
	pageWidth : function() {
		return document.body.scrollWidth || document.documentElement.scrollWidth;
	},
	pageHeight : function() {
		return document.body.scrollHeight || document.documentElement.scrollHeight;
	},
	windowWidth : function() {
		var E = document.documentElement;
		return self.innerWidth || (E && E.clientWidth) || document.body.clientWidth;
	},
	windowHeight : function() {
		var E = document.documentElement;
		return self.innerHeight || (E && E.clientHeight) || document.body.clientHeight;
	},
	scrollX : function(o) {
		var E = document.documentElement;
		if (o) {
			var P = o.parentNode,X = o.scrollLeft || 0;
			if (o == E) X = UI.scrollX();
			return P ? X + UI.scrollX(P) : X;
		}
		return self.pageXOffset || (E && E.scrollLeft) || document.body.scrollLeft;
	},
	scrollY : function(o) {
		var E = document.documentElement;
		if (o) {
			var P = o.parentNode,Y = o.scrollTop || 0;
			if (o == E) Y = UI.scrollY();
			return P ? Y + UI.scrollY(P) : Y;
		}
		return self.pageYOffset || (E && E.scrollTop) || document.body.scrollTop;
	},
	scrollTo : function(o,x,y) {
		if (o == document.documentElement || o == document.body) {
			return window.scrollTo(x,y);
		}

	},
	hide : function(o) {
		if (UI.isString(o)) o = this.G(o);
		o.style.display = 'none';
	},
	show : function(o) {
		if (UI.isString(o)) o = this.G(o);
		o.style.display = 'block';
	},
	toggle : function(o) {
		if (UI.isString(o)) o = this.G(o);
		if (this.C(o,'display') == 'none') {
			this.show(o);
		}
		else this.hide(o);
	},
	hasClass : function(o,n){
		return o.className != o.className.replace(new RegExp('\\b' + n + '\\b'),'');
	},
	addClass : function(o,n){
		if (!o.className) {
			o.className = n;
		}
		else if (this.hasClass(o,n)) {
			return false;
		}
		else o.className += ' ' + n;
	},
	removeClass : function(o,n){
		o.className = o.className.replace(new RegExp('\\b' + n + '\\b'),'');
	},
	toggleClass : function(o,n){
		if (this.hasClass(o,n)) this.removeClass(o,n);
		else this.addClass(o,n);
	},
	node : {
		ELEMENT : 1,
		ATTRIBUTE : 2,
		TEXT : 3,
		CDATA_SECTION : 4,
		ENTITY : 6,
		COMMENT : 8,
		DOCUMENT : 9,
		DOCUMENT_TYPE : 10
	},
	next : function(o) {
		var n = o.nextSibling;
		if (n == null) return false;
		return UI.isElement(n) ? n : this.next(n);
	},
	prev : function(o) {
		var n = o.previousSibling;
		if (n == null) return false;
		return UI.isElement(n) ? n : this.prev(n);
	},
	append : function(o,t) {
		t.appendChild(o);
	},
	prepend : function(o,t) {
		var first = t.firstChild;
		if (first) UI.before(o,first);
		else UI.append(o,t);
	},
	after : function(o,t) {
		var P = t.parentNode;
		if(P.lastChild == o) P.appendChild(o);
		else P.insertBefore(o,t.nextSibling);
	},
	before : function(o,t) {
		t.parentNode.insertBefore(o,t);
	},
	replace : function(o,t) {
		var P = t.parentNode;
		P.replaceChild(o,t);
	},
	swap : function(o,t) {
		
	},
	wrap : function(o,t) {
		if (UI.isString(o)) {
			var reg = o.match(/(<[^\/][^<]*>)/g),name = 'wrapObject___';
			var last = RegExp.lastMatch;
			o = o.replace(last,last + '<pre class="' + name + '"></pre>');
			var tmp = UI.html(o)[0];
			UI.before(tmp,t);
			UI.replace(t,UI.GC(tmp,'pre.' + name)[0]);
		}
		else {
			UI.before(o,t);
			t.appendChild(t);
		}
	},
	html : function(s) {
		var wrap = UI.DC('div'),tmp = [];
		wrap.innerHTML = s;
		UI.each(wrap.childNodes,function(o){
			tmp.push(o);
		});
		return tmp;
	},
	parent : function(o,n) {
		if (UI.isArray(o)) {
			var tmp = [];
			UI.each(o,function(o){
				if ((n && UI.hasClass(o.parentNode,n)) || !n) tmp.push(o.parentNode);
			});
			return tmp;
		}
		return o.parentNode;
	},
	parents : function(o,n) {
		if (n) {
			var tmp = [],arr = UI.parents(o);
			UI.each(arr,function(o){
				if (UI.hasClass(o,n)) {
					tmp.push(o);
				}
			});
			return tmp;
		}
		var P = o.parentNode;
		return P.nodeName == 'HTML' ? [P] : [P].concat(UI.parents(P));
	},
	children : function(o,n) {
		var tmp = [];
		UI.each(o.childNodes,function(o){
			if (UI.isElement(o) && (!n || UI.hasClass(o,n))) tmp.push(o);
		});
		return tmp;
	},
	A : function(o,n,v) {
		if (v==undefined) {
			return o.getAttribute(n);
		}
		else o.setAttribute(n,v);
	},
	C : function(o,n,v) { //CSS
		if (v==undefined) { //Get Style
			if (o.currentStyle) {
				if (n=='opacity') {
					return o.style.filter.indexOf('opacity=') >= 0 ? (parseFloat( o.style.filter.match(/opacity=([^)]*)/)[1] )/100):'1';
				}
				return o.currentStyle[n];
			}
			else if (window.getComputedStyle) {
				n = n.replace (/([A-Z])/g, '-$1');
				n = n.toLowerCase ();
				return window.getComputedStyle (o, null).getPropertyValue(n);
			}
		}
		else {
			if (n=='opacity' && UI.Browser.ie) {
				o.style.filter = (o.filter || '').replace( /alpha\([^)]*\)/, '') + 'alpha(opacity=' + v * 100 + ')';
			}
			else o.style[n] = v;
		}
	},
	DC : function(n) { //Dom Create Element
		return document.createElement(n);
	},
	E : function(e) {
		e = window.event || e;
		return {
			stop : function() {
				if (e && e.stopPropagation) e.stopPropagation();
				else e.cancelBubble = true;
			},
			prevent : function(){
				if (e && e.preventDefault) e.preventDefault();
				else e.returnValue = false;
			},
			target : e.target || e.srcElement,
			x : e.clientX || e.pageX,
			y : e.clientY || e.pageY,
			button : e.button,
			key : e.keyCode,
			shift : e.shiftKey,
			alt : e.altKey,
			ctrl : e.ctrlKey,
			type : e.type
		};
	},
	EA : function (o,n,f,capture) {
		if (UI.isString(o)) {
			var tmp = f;
			f = function(e) {
				eval(tmp);
			}
		}
		if(o.addEventListener) {
			o.addEventListener(n,f,capture);
			return true;
		}
		else if(o.attachEvent) {
			var r = o.attachEvent('on'+n,f);
			//UI.EventCache.add(o,evType,fn);
			return r;
		}
		else return false;
	},
	ER : function (o,n,f) {
		if(o.removeEventListener) {
			o.removeEventListener(n,f,false);
			return true;
		}
		else if(o.detachEvent) {
			var r=o.detachEvent('on'+n,f);
			return r;
		}
		else return false;
	},
	ET : function(e) { //Event Target
		return e.target||e.srcElement;
	},
	G : function(n) {
		return document.getElementById(n);
	},
	GT : function(o,n) {
		return o.getElementsByTagName(n);
	},
	GC : function (o,n) { //getElementByClassName -> UI.GC('a.hide.red')
		var arr,t,l,el = [];
		if (arguments.length == 1) {
			arr = o.split('.');
			o = document;
		}
		else arr = n.split('.');
		t = arr[0] == '' ? '*' : arr[0];
		arr.shift();
		l = this.GT(o,t);
		for (var i=0 in arr) {
			arr[i] = '&' + arr[i] + '&';
		}
		for(var i = 0,n = l.length;i < n;i++) {
			var c = '&' + l[i].className.replace(/ /g,'& &') + '&';
			if(c.hasString(arr)) el.push(l[i]);
		}
		/* //Another Method (Spend More Time)
		for(var i = 0,n = l.length;i < n;i++) {
			var m = l[i].className.match(new RegExp('\\b' + arr.join('\\b|\\b') + '\\b','g'));
			if(m && m.length == arr.length) el.push(l[i]);
		}
		*/
		return el.length > 0 ? el : false;
	},
	isArray : function(o) {
		return o !== null && UI.isObject(o) && 'splice' in o && 'join' in o;
	},
	isElement : function(o) {
		return o && o.nodeType == 1;
	},
	isFunction : function(o) {
		return typeof o == 'function';
	},
	isNumber : function(o) {
		return typeof o == 'number';
	},
	isObject : function(o) {
		return typeof o == 'object';
	},
	isString : function(o) {
		return typeof o == 'string';
	},
	isUndefined : function(o) {
		return typeof o == 'undefined';
	},
	trim : function(o) {
		return o.replace(/^\s+|\s+$/g,'');
	},
	random : function(a,b) {
		if (a == undefined) a = 0;
		if (b == undefined) b = 9;
		return Math.floor(Math.random() * (b - a + 1) + a);
	},
	has : function(o,v) {
		for (var i = 0,n = o.length;i < n;i++) {
			if (o[i] == v) return true;
		}
		return false;
	},
	each : function(o,f) {
		if(UI.isUndefined(o[0])){
			for (var key in o){
				if(!UI.isFunction(o[key])) f(key,o[key]);
			}
		}
		else{
			for(var i = 0,n = o.length;i < n;i++){
				if(!UI.isFunction(o[i])) f(o[i],i);
			}
		}
	},
	map : function(o,f) {
		if (UI.isString(f)) f = eval('(function(a,i) { return ' + f + '})');
		var tmp = [];
		UI.each(o,function(o,i){
			var v = f(o,i);
			if (UI.isArray(v)) {
				tmp = tmp.concat(v);
			}
			else tmp.push(v);
		});
		return tmp;
	},
	grep : function(o,f) {
		if (UI.isString(f)) f = eval('(function(a,i) { return ' + f + '})');
		var tmp = [];
		UI.each(o,function(o,i){
			if (f(o,i)) tmp.push(o);
		});
		return tmp;
	},
	merge : function(A,B) {
		var tmp = [];
		if (B) { //Merge A + B
			UI.each(B,function(o,i){
				if (!UI.has(A,o)) tmp.push(o);
			});
			return A.concat(tmp);
		}
		else { //Merge Same Value For A
			UI.each(A,function(o,i){
				if (!UI.has(tmp,o)) tmp.push(o);
			});
			return tmp;
		}
	},
	sort : {
		number : function(a,b) {
			return a - b;
		},
		numberDesc : function(a,b) {
			return b - a;
		},
		string : function(a,b) {
			return a.localeCompare(b);
		},
		stringDesc : function(a,b) {
			return b.localeCompare(a);
		}
	},
	ready : function(f) {
		if (UI.ready.done) return f();
		if (UI.ready.timer) {
			UI.ready.ready.push(f);
		}
		else {
			//UI.EA(window,'load',UI.isReady);
			UI.ready.ready = [f];
			UI.ready.timer = setInterval(UI.isReady,13);
		}
	},
	isReady : function() {
		if (UI.ready.done) return false;
		if (document && document.getElementsByTagName && document.getElementById && document.body) {
			clearInterval(UI.ready.timer);
			UI.ready.timer = null;
			for (var i = 0;i < UI.ready.ready.length;i++)
				UI.ready.ready[i]();
			UI.ready.ready = null;
			UI.ready.done = true;
		}
	},
	Browser : (function(){
		var b = {},i = navigator.userAgent;
		b.ie6 = i.hasString('MSIE 6') && !i.hasString('MSIE 7') && !i.hasString('MSIE 8');
		b.ie = i.hasString('MSIE');
		b.opera = i.hasString('Opera');
		b.safari = i.hasString('WebKit');
		return b;
	})()
};
UI.SelectMulti = function(o) {
	this.name = o.name;
	this.body = o;
	this.cont = UI.GC(o,'.cont')[0];
	this.input = o.firstChild;
	this.checkbox = UI.GT(this.cont,'input');
	this.tools = UI.GC(o,'div.tools')[0];
	this.value = this.input.value;
	this.display = false;
	this.click = false; //If Click The Menu

	var cont = this.cont,input = this.input,name = this.name,checkbox = this.checkbox;

	new UI.resize(this.cont,{min:{x:100,y:30}});
	UI.EA(UI.GC(this.body,'b.ico')[0],'click',function(e){
		UI.E(e).stop();
	})

	if (UI.Browser.ie6) {
		var iframe = UI.html('<iframe src="javascript:false;" style="display:none;"></iframe>')[0];
		UI.before(iframe,this.cont);
		setInterval(function(){
			iframe.style.cssText = 'position:absolute;filter:alpha(opacity=0);z-index:-1;top:' + cont.offsetTop + ';left:' + cont.offsetLeft + ';width:' + cont.offsetWidth + 'px;height:' + cont.offsetHeight + 'px;';
		},200);
	}
	if (this.checkbox.length > 10) {
		this.cont.style.height = '230px';
	}
	if (!this.tools) {
		this.cont.style.padding = '0';
	}
	else {
		var button = UI.GT(this.tools,'input');
		UI.each(button,function(o){
			UI.EA(o,'click',function(e){
				var T = UI.E(e).target;
				if (UI.hasClass(T,'SelectAll')) {
					UI.each(checkbox,function(o){
						o.checked = true;
					});
				}
				if (UI.hasClass(T,'SelectReverse')) {
					UI.each(checkbox,function(o){
						o.checked = o.checked ? false : true;
					});
				}
			});
		});
	}

	UI.EA(document,'click',function(e){
		var E = UI.E(e);
		if (E.target != input) {
			window[name].hide();
		}
	});
	UI.EA(this.input,'click',function(){
		if (window[name].display) window[name].hide();
		else window[name].show();
	});
	UI.EA(this.cont,'click',function(e){
		UI.E(e).stop();
		var num = 0,cur = 0;
		UI.each(checkbox,function(o,i){
			if (o.checked) {
				cur = i
				num++;
			}
		});
		if (num == 0) {
			input.value = '';
		}
		else if (num == 1) {
			var P = checkbox[cur].parentNode;
			input.value = P.innerText || P.textContent;
		}
		else {
			input.value = UI.A(input,'rel') + ' x ' + num;
		}
		window[name].click = true;
	});

	//Hide
	var delay;
	UI.EA(this.cont,'mouseout',function(e){
		delay = setTimeout(function(){
			if (window[name].click) window[name].hide();
		},50);
	});
	UI.EA(this.cont,'mouseover',function(e){
		clearTimeout(delay);
	});

	this.hide = function(){
		UI.removeClass(this.body,'on');
		this.cont.style.display = 'none';
		UI.removeClass(this.body,'top');
		this.display = false;
		this.click = false;
	}
	this.show = function(){
		UI.addClass(this.body,'on');
		this.cont.style.display = 'block';
		var h_cont = UI.height(this.cont),h_input = UI.height(this.input),h_window = UI.windowHeight(),h_page = UI.pageHeight(),y_input = UI.getY(this.input),y_scroll = UI.scrollY();
		var h_hack = (this.tools && !UI.Browser.ie && document.compatMode == 'BackCompat') ? UI.height(this.tools) : 0; //CSS Hack
		if (h_cont + h_input + y_input - y_scroll > h_window) {
			UI.addClass(this.body,'top');
			if (UI.height(this.cont) >= y_input - y_scroll) {
				UI.C(this.cont,'height',y_input - y_scroll - 20 - h_hack + 'px');
			}
			if (UI.height(this.cont) > y_input) {
				UI.C(this.cont,'height',y_input - h_hack + 'px');
			}
		}
		else if (h_cont + h_input + y_input > h_window) {
			UI.C(this.cont,'height',h_window - h_input - y_input + 'px');
		}
		this.display = true;
	}
}
UI.Menu = function(o) {
	this.name = o.name;
	this.id = o.id;
	this.sub_id = o.sub_id;
	this.location_id = o.location_id;
	this.main = UI.G(o.id);
	this.body = UI.G(o.sub_id);
	this.wrap = UI.GC(this.body,'.sub_menu_wrap')[0];
	this.bar = UI.GC(this.body,'a.bar')[0];
	this.target = o.target; //Target Iframe
	this.cache = (o.cache == undefined ? true : o.cache); //Cache Menu Status
	this.large = o.large; //Large Icon For Menu Title
	this.extend = []; //Extend Menu
	this.data = o.data;

	//Show Location Information
	this.location = {
		data : [],
		rel : null,
		build : function() {
			for (var n=0;n<this.data.length;n++) {
				var h = UI.G(this.id);
				if (!n) h.innerHTML = '';
				if (n!=this.data.length-1) h.innerHTML += (n ? '<b class="dot"></b>' : '') + '<a href="' + this.data[n].url + '" target="' + this.target + '" ' + (!n && this.cache ? 'class="unlink" onclick="this.blur();return false;' : 'onclick="') + this.name + (this.data[n].fake ? '.location.show(' + n +');' : '.show(\'' + this.rel.slice(0,n+1) + '\');') + '" title="' + this.data[n].name + '">' + this.data[n].name + '</a>';
				else h.innerHTML += (n ? '<b class="dot"></b>' : '') + this.data[n].name;
			}
		},
		rebuild : function(o) {
			var o = eval('[' + o + ']');
			this.rel = o;
			this.data = [];
			for (var i=0;i<o.length;i++) {
				if (!i) this.data.push({name:this.tmp[o[i]].name,url:this.tmp[o[i]].url});
				try{
					if (i==1) this.data.push({name:this.tmp[o[i-1]].data[o[i]].name,url:(this.tmp[o[i-1]].data[o[i]].url ? this.tmp[o[i-1]].data[o[i]].url : this.tmp[o[i-1]].data[o[i]].data[0][1])});
					if (i==2) this.data.push({name:this.tmp[o[i-2]].data[o[i-1]].data[o[i]][0],url:this.tmp[o[i-2]].data[o[i-1]].data[o[i]][1]});
				}catch(e){}
			}
			this.build();
		},
		edit : function(n,u) {
			this.data.pop();
			this.data.push({name:n,url:u,fake:true});
			this.build();
		},
		add : function(n,u) {
			if (n != this.data[this.data.length - 1].name) {
				this.data.push({name:n,url:u,fake:true});
				this.build();
			}
		},
		show : function(n) {
			this.data.splice(n +1,50);
			this.build();
		}
	}
	this.location.name = this.name;
	this.location.id = this.location_id;
	this.location.target = this.target;
	this.location.cache = this.cache;
	this.location.tmp = o.data;

	this.show = function(o,load) { //Show Menu
		if (UI.isArray(o)) { //Search By Menu Name
			var tmp = [],url;
			for (var i=0;i<o.length;i++) {
				if (i == 0) {
					for (var j=0;j<this.data.length;j++) {
						if (o[i] == this.data[j].name) {
							tmp.push(j);
							break;
						}
					}
				}
				if (i == 1) {
					for (var j=0;j<this.data[tmp[0]].data.length;j++) {
						if (o[i] == this.data[tmp[0]].data[j].name) {
							tmp.push(j);
							break;
						}
					}
				}
				if (i == 2) {
					for (var j=0;j<this.data[tmp[0]].data[tmp[1]].data.length;j++) {
						if (o[i] == this.data[tmp[0]].data[tmp[1]].data[j][0]) {
							tmp.push(j);
							break;
						}
					}
				}
			}
			o = tmp;
		}
		else var o = o.split(',');
		if (o.length <= 2) {
			o.push(0);
			if (o.length == 2 && this.location.tmp[o[0]].data.length) o.push(0);
		}
		if (load) {
			url = this.data[o[0]].data[o[1]].url || this.data[o[0]].url;
			try {
				url = this.data[o[0]].data[o[1]].data[o[2]][1];
			}catch(e){};
		}

		//List & Main Menu
		this.menu_list[this.cur_list].className = 'wrap hide';
		this.menu_list[o[0]].className = 'wrap show';
		UI.removeClass(this.main_menu[this.cur_list],'on');
		UI.addClass(this.main_menu[o[0]],'on');
		if (this.cache) this.main_menu[o[0]].setAttribute('rel',o)
		this.cur_list = o[0];

		try{
			UI.removeClass(UI.GC(this.menu_list[o[0]],'.on')[0],'on');
		}catch(e){};
		for (var i=1;i<o.length;i++) {
			if (i==1 && !this.location.tmp[o[0]].data[o[1]].data.length) {
				UI.addClass(UI.GC(UI.GC(this.body,'.wrap.show')[0],'.title')[o[1]],'on');
				this.main_menu[o[0]].href = this.location.tmp[o[0]].data[o[1]].url;
			}
			if (i==2 && !this.location.tmp[o[0]].data[o[1]].extend) {
				var menu_title = this.menu_title[o[0]][o[1]],menu_content = menu_title.nextSibling;
				UI.removeClass(menu_title,'off');
				UI.removeClass(menu_content,'hide');
				if (this.location.tmp[o[0]].data[o[1]].data.length) {
					UI.addClass(menu_content.getElementsByTagName('a')[o[2]],'on');
					if (this.cache) this.main_menu[o[0]].href = this.location.tmp[o[0]].data[o[1]].data[o[2]][1];
				}
				else if (this.cache) this.main_menu[o[0]].href = this.location.tmp[o[0]].data[o[1]].url;
			}
		}
		this.location.rebuild(o);
		if (url) window[this.target].location.href = url;
	}
	this.go = function(o) {
		this.show(o,true);
	}

	this.refresh = function(o) {
		for (var i=0;i<this.extend.length;i++) {
			if (this.extend[i].rel == o) {
				var o = eval('[' + o + ']');
				var _extend = this.menu_title[o[0]][o[1]].nextSibling,_call = this.extend[i].call;
				_extend.innerHTML = '<div class="extend"><span class="content">loading...</span></div>';
				UI.get(this.extend[i].url,{},function(data){
					setTimeout(function(){
						_extend.innerHTML = '<div class="extend">' + data + '</div>';//.replace( /(?:\r\n|\n|\r)/g, '' )
						eval(_call);
					},200);
				})
			}
		}
	}
	var name = this.name;
	this.tree = function(n,m) {
		var o = UI.isString(n) ? UI.G(n) : n;
		var a = UI.GT(o,'a');
		var b = UI.GC(o,'b.arrow');
		for (var i=0;i<a.length;i++) {
			UI.A(a[i],'target',window[name].target);
			a[i].onfocus = function(){
				this.blur();
			}
			a[i].onclick = function() {
				try{
					UI.removeClass(UI.GC(window[name].menu_list[m],'.on')[0],'on');
				}catch(e){};
				UI.addClass(this,'on');
				/*UI.toggleClass(this,'unfold');
				UI.toggleClass(UI.next(this),'hide');
				if (UI.hasClass(this,'extend')) {
					var o = this;
					UI.next(o).innerHTML = '<div class="extend"><span class="content">loading...</span></div>';
					UI.get(this.getAttribute('href'),'',function(data){
						setTimeout(function(){
							UI.next(o).innerHTML = data;
							TreeClick(UI.next(o));
						},100);
						UI.removeClass(o,'extend');
					});
				}*/
			}
		}
		UI.each(b,function(o,i){
			b[i].onclick = function(e) {
				var parent = this.parentNode.parentNode;
				var next = UI.next(parent);
				UI.toggleClass(parent,'unfold');
				UI.toggleClass(next,'hide');
				if (UI.hasClass(parent,'extend')) {
					next.innerHTML = '<div class="extend"><span class="content">loading...</span></div>';
					UI.get(parent.getAttribute('rel'),'',function(data){
						setTimeout(function(){
							next.innerHTML = data;
							window[name].tree(next,m);
						},100);
						UI.removeClass(parent,'extend');
					});
				}
				UI.E(e).stop();
				return false;
			}
		});
	}

	/* Sub Menu & Main Menu */
	var html = [],html_main = [],rel = [];
	for(var i=0;i < o.data.length;i++) {
		//Location
		if (!i) rel = 0;

		html.push('<div class="wrap' + (!i ? ' show' : ' hide') + '">');
		for(var j=0;j < o.data[i].data.length;j++) {
			var off = title_large = arrow_empty = title_on = hide = cont_hide = '',title_url = '#';
			if (o.data[i].data[j].close) {
				off = ' off';
				hide = ' hide';
			}
			if (!o.data[i].data[j].data.length && !o.data[i].data[j].extend) {
				cont_hide = ' style="display:none"';
				arrow_empty = ' empty';
				if (this.large) title_large = ' large';
				if (!j) title_on = ' on';
			}
			if (!o.data[i].data[j].extend) {
				title_url = o.data[i].data[j].url ? o.data[i].data[j].url : o.data[i].data[j].data[0][1];
			}
			html.push('<div class="title' + title_large  + off + title_on + ' " onmouseover="UI.addClass(this,\'hover\')" onmouseout="UI.removeClass(this,\'hover\')"><a href="javascript:void(0)" onfocus="this.blur()" class="arrow' + arrow_empty + '" onclick="UI.toggleClass(this.parentNode,\'off\');UI.toggleClass(this.parentNode.nextSibling,\'hide\')"></a><a href="' + title_url + '" target="' + this.target + '" onfocus="this.blur()" onclick="' + (o.data[i].data[j].extend ? this.name + '.refresh(this.getAttribute(\'rel\'));UI.removeClass(this.parentNode,\'off\');UI.removeClass(this.parentNode.nextSibling,\'hide\');return false;': '') + this.name + '.show(this.getAttribute(\'rel\'));UI.removeClass(this.parentNode,\'hover\');" rel="' + i + ',' + j + (o.data[i].data[j].data.length ? ',0' : '') +'" title="' + o.data[i].data[j].name + '"><span>' + (o.data[i].data[j].ico ? '<b class="ico ' + o.data[i].data[j].ico + '"></b>' : '') + '<em>' + o.data[i].data[j].name + '</em></span></a></div><div class="content' + hide + '"' + cont_hide + '><span>');
			if (o.data[i].data[j].extend) this.extend.push({rel:[i,j],url:o.data[i].data[j].extend.url,call:o.data[i].data[j].extend.call});
			else {
				for (var m=0;m<o.data[i].data[j].data.length;m++) {
					html.push('<a href="' + o.data[i].data[j].data[m][1] + '" target="' + this.target + '" onfocus="this.blur()" onclick="' + this.name + '.show(this.getAttribute(\'rel\'));"' + ((!title_on && !j && !m) ? ' class="on"' : '') + ' rel="' + i + ',' + j + ',' + m + '" title="' + o.data[i].data[j].data[m][0] + '"><span><b class="icon dot"></b>' + o.data[i].data[j].data[m][0] + '</span></a>');
				}
			}
			html.push('</span></div>');

			//Location
			if (!i && !j) {
				rel = '0,0' + (o.data[0].data[0].data.length ? ',0' : '');
			}
		}
		html.push('</div>');

		html_main.push('<a href="' + o.data[i].url + '" target="' + this.target + '" class="' + (i == 0 ? 'first on' :'') + (i == o.data.length - 1 ? 'last' : '') + '" title="' + o.data[i].name + '" onfocus="this.blur()" onclick="' + this.name + '.show(this.getAttribute(\'rel\'));" rel="' + i + ',0' + (o.data[i].data[0].data.length ? ',0' : '') + '" title="' + o.data[i].name + '"><span>' + o.data[i].name + '</span></a>');
	}
	this.wrap.innerHTML = html.join('');
	this.main.innerHTML = html_main.join('');
	if (o.data.length == 1) UI.addClass(this.main,'hide'); //Hide Main Menu

	//Menu list
	this.main_menu = UI.GT(this.main,'a');
	this.menu_list = UI.GC(this.body,'.wrap');
	this.menu_title = [];
	for (var i=0;i<this.menu_list.length;i++) {
		this.menu_title.push(UI.GC(this.menu_list[i],'.title'));
	}
	this.cur_list = 0;
	if (this.extend.length) { //Load Extend Menu
		for (var i=0;i<this.extend.length;i++) {
			this.refresh(this.extend[i].rel);
		}
	}

	//Hide Bar
	this.bar.onclick = function() {
		UI.toggleClass(this.parentNode,'close');
		UI.removeClass(this.parentNode,'open');
	}
	this.bar.onfocus = function() {
		this.blur();
	}
	var _name = this.name,_delay;
	this.body.onmouseover = function() {
		clearTimeout(_delay);
		_delay = setTimeout(function() {
			if (UI.hasClass(window[_name].body,'close')) {
				UI.addClass(window[_name].body,'open');
			}
		},250);
	}
	this.body.onmouseout = function() {
		clearTimeout(_delay);
		_delay = setTimeout(function() {
			if (UI.hasClass(window[_name].body,'close')) {
				UI.removeClass(window[_name].body,'open');
			}
		},250);
	}
	if (UI.Browser.ie6) { //IE6 Hack
		this.bg_iframe = UI.html('<iframe src="javascript:false;" class="bg"></iframe>')[0];
		this.bg_div = UI.html('<div class="bg"></div>')[0];
		this.wrap.appendChild(this.bg_iframe);
		this.wrap.appendChild(this.bg_div);
	}

	//List Auto Height
	document.documentElement.style.overflow = 'hidden';
	var _menu_height = UI.GC('td.header')[0].scrollHeight + UI.GC('a.bar')[0].scrollHeight;
	var _footer = UI.GC('td.footer');
	if (_footer) _menu_height += _footer[0].scrollHeight;
	this.autoHeight = function() {
		this.wrap.style.height = (UI.Browser.ie ? document.documentElement.scrollHeight - _menu_height - 4 : window.innerHeight - _menu_height) + 'px';
	};
	this.autoHeight();
	(function(n){
		UI.EA(window,'resize',function(){
			window[n].autoHeight();
		});
	})(this.name);

	//Default Show
	this.show(rel);
	window[this.target].document.location.href = o.data[0].url;
}
UI.Dialog = function(o) {
	//Default Size
	size.call(this,o);

	//Dom
	this._body = UI.DC('div');
	this._body.className = 'dialog2';
	this._body.innerHTML = (UI.Browser.ie6 ? '<iframe src="javascript:false;" class="cover_select"></iframe>' : '') + '<div class="bg"></div><div style="margin:-' + o.height/2 + 'px 0 0 -' + o.width/2 + 'px;width:' + o.width + 'px;height:' + o.height + 'px;" class="wrap"><div class="title">' + o.title + '</div><a class="close ' + (o.close!=false ? '' : 'hide') + '" href="javascript:' + o.name + '.hide();" onfocus="this.blur();" title="Close" tabindex="-1"></a><div class="cont"><div class="loading"><span>loading...</span></div><iframe allowtransparency="true" src="' + o.url + '" style="height:' + o.height + 'px;display:none;" scrolling="auto" frameborder="no" onload="if (UI.A(this,\'src\') != \'undefined\') { this.style.display=\'block\';this.previousSibling.style.display=\'none\';UI.EA(' + o.name + '._iframe.contentWindow.document,\'keyup\',top.' + o.name + '.key); }" class="iframe"></iframe><div class="data"></div></div><b class="cor_1"></b><b class="cor_2"></b><b class="cor_3"></b><b class="cor_4"></b><div class="resize"></div></div><div class="border"></div>';
	this._bg = UI.GC(this._body,'div.bg')[0];
	this._wrap = UI.GC(this._body,'div.wrap')[0];
	this._title = UI.GC(this._body,'div.title')[0];
	this._close = UI.GC(this._body,'a.close')[0];
	this._cont = UI.GC(this._body,'div.cont')[0];
	this._iframe = UI.GC(this._body,'iframe.iframe')[0];
	this._data = UI.GC(this._body,'div.data')[0];
	this._resize = UI.GC(this._body,'div.resize')[0];
	this._border = UI.GC(this._body,'div.border')[0];
	this._loading = UI.GC(this._body,'div.loading')[0];
	
	//Status
	this.checkStaus = function(o) {
		if (!this._titleHeight) {
			this._titleHeight = this._title.offsetHeight;
			if (UI.Browser.ie && document.compatMode == 'CSS1Compat') { //For Standards Mode
				var padding = parseInt(UI.C(this._title,'paddingTop')) + parseInt(UI.C(this._title,'paddingBottom'))
				this._titleHeight -= padding;
				this._title.style.height = this._titleHeight - padding + 'px';
			}
		}
		try{
			this._cont.style.height = this._iframe.style.height = o.height - this._titleHeight + 'px';
		}catch(e){};
		if (o.move == false) {
			this.__move = false;
			this._title.style.cursor = 'default';
		}
		else if (this.__move == undefined || o.move) {
			this.__move = true;
			this._title.style.cursor = '';
		}
		if (o.resize == false) {
			this.__resize = false;
			this._resize.style.display = 'none';
		}
		else if (this.__resize == undefined || o.resize) {
			this.__resize = true;
			this._resize.style.display = '';
		}
	}
	this.__name = o.name;
	this._cache = []; //Dialog Cache
	this.__close = o.close == undefined ? true : o.close;

	if (o.url) {
		document.body.appendChild(this._body);
		this.__display = true;
		this.checkStaus.call(this,o);
		this._cache.push(o);
	}

	//Event
	var wrap = this._wrap,border = this._border,name = o.name;
	this.key = function(e) {
		switch(UI.E(e).key) {
			case 27:
				if (window[name].__display) window[name].hide();
				break;
		}
	}
	UI.EA(document,'keyup',this.key);
	this._title.onmousedown = function(e) { //Move
		if (window[name].__move) {
			var event = window.event || e;
			var _x = event.clientX - parseInt(wrap.style.marginLeft);
			var _y = event.clientY - parseInt(wrap.style.marginTop);
			var w = UI.windowWidth(),h = UI.windowHeight(); //Kill Bug
			if(event.preventDefault){
				event.preventDefault();
			}
			UI.addClass(wrap,'move');
			document.onmousemove = function(e) {
				var event = window.event || e;
				var E = UI.E(e);
				if (!UI.Browser.ie && (E.x < 0 || E.y < 0 || E.x > w || E.y > h)) return false;
				wrap.style.marginTop = event.clientY - _y + 'px';
				wrap.style.marginLeft = event.clientX - _x + 'px';
				return false;
			}
			document.onmouseup = function() {
				this.onmousemove = null;
				document.onmouseup = null;
				UI.removeClass(wrap,'move');
			}
			return false;
		}
	};
	this._title.ondblclick = function(e) { //Restore
		var o = window[name]._cache[window[name]._cache.length - 1];
		window[name].reset(o);
	}
	this._resize.onmousedown = function(e) { //Resize
		if (window[name].__resize) {
			var width = parseInt(UI.C(wrap,'width')),height = parseInt(UI.C(wrap,'height')),top = parseInt(UI.getY(wrap)),left = parseInt(UI.getX(wrap));
			if (!UI.Browser.ie || document.compatMode == 'CSS1Compat') {
				width -= 2;
				height -= 2;
			}
			border.style.cssText = 'top:' + top + 'px;left:' + left + 'px;width:' + width + 'px;height:' + height + 'px;display:block;';
			window[name]._body.style.cursor = 'se-resize';
			var event = window.event || e;
			var _x = event.clientX;
			var _y = event.clientY;
			if(event.preventDefault){
				event.preventDefault();
			}
			UI.addClass(wrap,'move');
			document.onmousemove = function(e) {
				var event = window.event || e,_Y = event.clientY - _y,_X = event.clientX - _x;
				var min_X = (150 - width)/2,min_Y = (100 - height)/2;
				if (_Y < min_Y) _Y = min_Y;
				if (_X < min_X) _X = min_X;
				var css = 'height:' + (_Y*2 + height) + 'px;width:' + (_X*2 + width) + 'px;top:' + (top - _Y) + 'px;left:' + (left - _X) + 'px;display:block;';
				if (UI.Browser.ie6 && document.compatMode == 'BackCompat') { //Delay To Kill IE6 Bug
					setTimeout(function(){
						border.style.cssText = css;
					},10);
				}
				else border.style.cssText = css;
				return false;
			}
			document.onmouseup = function() {
				window[name]._wrap.style.cssText = 'margin:0;left:' + border.style.left + ';top:' + border.style.top + ';width:' + border.offsetWidth + 'px;height:' + border.offsetHeight + 'px;';
				window[name].checkStaus({height:border.offsetHeight});
				setTimeout(function(){ //Delay To Kill IE6 Bug
					border.style.display = 'none';
				},15);
				window[name]._body.style.cursor = '';
				this.onmousemove = null;
				document.onmouseup = null;
				UI.removeClass(wrap,'move');
			}
			return false;
		}
	};

	//Method
	this.hide = function() {
		var cache = UI.Dialog.cache;
		if (!this.__close || (cache[cache.length - 1] != this.__name && cache.length > 0)) return false;
		var length = this._cache.length;
		if (length > 1) {
			this.reset(this._cache[length - 2]);
			if (this._cache[length - 1].call) eval(this._cache[length - 1].call);
		}
		else {
			document.body.removeChild(this._body);
			if (this._cache[0].call) eval(this._cache[0].call);
			this.__display = false;
		}
		this.__title = this._cache[0].title; //Save Last Title
		this._cache.pop();

		//Dialogs Cache
		if (this._cache.length < 1 && cache[cache.length - 1] == this.__name) {
			cache.pop();
			if (cache.length > 0) {
				window[cache[cache.length - 1]]._bg.style.display = 'block';
			}
		}
		
		this.title();
	}
	this.show = function(o) {
		if (!this.__display) {
			document.body.appendChild(this._body);
			this.__display = true;
		}
		if (o) {
			if (o.url || o.html) {
				this._cache.push(o);

				//Dialogs Cache
				var cache = UI.Dialog.cache;
				if (cache[cache.length - 1] != this.__name) {
					cache.push(this.__name);
					for (var i = 0,n = cache.length - 1;i < n;i++) {
						window[cache[i]]._bg.style.display = 'none';
					}
				}

				if (o.url) this._cont.style.overflow = 'hidden';
				else this._cont.style.overflow = '';
			}
			else {
				if (o.title) this._cache[this._cache.length - 1].title = o.title;
			}
			this.reset(o);

		}
		
	}
	this.reset = function(o) {
		if (o.title) this.title();
		if (o.size) {
			size.call(this,o);
		}

		//Check Postion
		this._wrap.style.top = '50%';
		this._wrap.style.left = '50%';
		this._wrap.style.margin = -parseInt(UI.C(this._wrap,'height'))/2 + UI.scrollY() + 'px 0 0 ' + (-parseInt(UI.C(this._wrap,'width'))/2 + UI.scrollX()) + 'px';

		if (o.width) {
			if (o.width%2) o.width += 1; //Kill IE Bug
			this._wrap.style.width = o.width + 'px';
			this._wrap.style.marginLeft = -o.width/2 + UI.scrollX() + 'px';
		}
		if (o.height) {
			if (o.height%2) o.height += 1; //Kill IE Bug
			this._wrap.style.height = o.height + 'px';
			this._wrap.style.marginTop = -o.height/2 + UI.scrollY() + 'px';
		}
		if (o.close) this._close.className = 'close' + (o.close!=false ? '' : 'hide');
		if (o.url) {
			this._iframe.style.display = 'none';
			this._loading.style.display = 'block';
			this._iframe.setAttribute('src',o.url);
		}
		else if (o.html) {
			if (UI.isString(o.html)) {
				this._loading.style.display = 'none';
				this._data.innerHTML = o.html;
			}
			else {
				this._data.appendChild(o.html);
			}
		}
		//alert('x');
		this.checkStaus.call(this,o);
	}
	this.title = function() {
		var title=[];
		for (var i=0;i<this._cache.length;i++) {
			if (this._cache[i].title) {
				title.push(this._cache[i].title);
			}
		}
		if (title.length == 0) title.push(this.__title);
		this._title.innerHTML = '<span>' + title.join('<b class="dot"></b>') + '</span>';
	}
	function size(o){
		switch(o.size) {
			case 'small':
				if(!o.width) o.width = 380;
				if(!o.height) o.height = 220;
				break;
			case 'medium':
				if(!o.width) o.width = 530;
				if(!o.height) o.height = 420;
				break;
			case 'big':
				if(!o.width) o.width = 760;
				if(!o.height) o.height = 540;
				break;
		}
	}
}
UI.Dialog.cache = [];
UI.TipBox = function(o) {
	//Dom
	this._body = UI.DC('div');
	this._body.className = 'tip_box';
	this._body.innerHTML = '<a class="fix" href="javascript:void(0)" title="Fix" onclick="' + o.name + '.__fix = !' + o.name + '.__fix;UI.toggleClass(this,\'on\');return false;" onfocus="this.blur()" tabindex="-1"></a><a class="close" href="javascript:void(0)" title="Close" onclick="' + o.name + '.hide();" tabindex="-1"></a><b class="arrow"></b><b class="shadow"></b><div class="wrap"><div class="cont"></div></div>' + (UI.Browser.ie6 ? '<iframe src="javascript:false;" class="cover"></iframe>' : '');
	this._close = UI.GC(this._body,'a.close')[0];
	this._arrow = UI.GC(this._body,'b.arrow')[0];
	this._shadow = UI.GC(this._body,'b.shadow')[0];
	this._wrap = UI.GC(this._body,'div.wrap')[0];
	this._cont = UI.GC(this._body,'div.cont')[0];
	this._cover = UI.GC(this._body,'iframe.cover')[0];

	//Status
	this.__display = false;
	this.__large = o.__large;
	this.__fix = false;
	this._body.style.display = 'none';
	document.body.appendChild(this._body);
	if (o.html) {
		this.show(o);
	}

	//Event
	var name = o.name,body = this._body,wrap = this._wrap,shadow = this._shadow,close = this._close,cover = this._cover,self = this;
	this.key = function(e) {
		switch(UI.E(e).key) {
			case 27:
				if (self.__display) self.hide();
				break;
		}
	}
	UI.EA(document,'keyup',this.key);
	UI.EA(document,'click',function(e){
		if (!self.__fix && UI.E(e).target != self._target) {
			self.hide();
		}
	});
	UI.EA(body,'click',function(e){
		UI.E(e).stop();
	});
	if (UI.Browser.ie6) { //Kill IE6 Select Scroll Bug
		setInterval(function(){
			cover.style.zoom = cover.style.zoom == '1' ? '0' : '1';
		},200);
	};
	(function(){
		var x,y,_x,_y,h_wrap,top,left,move;
		UI.drag(wrap,{
			start : function(e){
				var P = wrap.parentNode;
				var E = UI.E(e);
				E.prevent();
				x = E.x;
				y = E.y;

				//if (self.__large) {
					UI.hide(self._arrow);
					left = parseInt(UI.C(body,'marginLeft'));
					top = parseInt(UI.C(body,'marginTop'));
				/*}
				if (!(UI.hasClass(P,'top') || UI.hasClass(P,'bottom'))) {
					move = true;
					_y = E.y - parseInt(wrap.style.marginTop);
					h_wrap = UI.height(wrap) - 18;
				}
				else move = false;*/
			},
			drag : function(e){
				var E = UI.E(e);
				//if (self.__large) {
					E.prevent();
					body.style.marginLeft = left + E.x - x + 'px';
					body.style.marginTop = top + E.y - y + 'px';
				/*}
				else if (move) {
					var num = E.y - _y;
					if (num > -2) num = -2;
					else if (num < - h_wrap) {
						num = - h_wrap;
					}
					wrap.style.marginTop = shadow.style.marginTop = close.style.marginTop = num + 'px';
					if (cover) cover.style.marginTop = num + 'px';
					return false;
				}*/
			}
		},false);
	})();
	/*this._wrap.onmousedown = function(e) { //Move
		else if (!(UI.hasClass(P,'top') || UI.hasClass(P,'bottom'))) {
			var event = window.event || e;
			if(event.preventDefault){
				event.preventDefault();
			}

			document.onmousemove = function(e) {
				var event = window.event || e;
				var num = event.clientY - _y;
				if (num > -2) num = -2;
				else if (num < - h_wrap) {
					num = - h_wrap;
				}
				wrap.style.marginTop = shadow.style.marginTop = close.style.marginTop = num + 'px';
				if (cover) cover.style.marginTop = num + 'px';
				return false;
			}
			document.onmouseup = function() {
				this.onmousemove = null;
				document.onmouseup = null;
			}
			return false;
		}
	};*/
	this._body.onmouseover = this._cont.onmousedown = function(e) {
		UI.E(e).stop();
	};

	//Method
	this.show = function(o) {
		if (this.__display && this._target != o.target) {
			this.hide();
		}
		if (this.__display) return false;

		UI.show(this._arrow);
		this.__large = o.large;
		if (o.large) {
			wrap.style.cursor = 'move';
			body.style.width = '400px';
			wrap.style.height = '200px';
		}
		else wrap.style.cursor = '';

		this._target = o.target;
		this.__html = this._cont.innerHTML = o.html;

		var pt = 0,pr = 0,pb = 0,pl = 0; //Padding Value
		switch ('TH,TD,DT,DD,LI'.hasString(this._target.nodeName)) {
			case true:
				UI.prepend(this._body,this._target);
				pl = parseInt(UI.C(this._target,'paddingLeft'));
				if (pl == NaN) pl = 0;
				break;
			default:
				UI.before(this._body,this._target);
				break;
		}
		this._body.style.display = '';
		
		//Value
		var h_window = UI.windowHeight(),h_wrap = UI.height(this._wrap),h_target = UI.height(this._target),w_window = UI.windowWidth(),w_wrap = UI.width(this._wrap),w_target = UI.width(this._target),x_target = UI.getX(this._target),y_target = UI.getY(this._target);
		var w_arrow = 7,h_arrow = 17;
		var space = UI.scrollY(this._target) + h_window - y_target - h_wrap;

		this._body.style.margin = '0 0 0 ' + (w_target + w_arrow - pl) + 'px;';

		if (((w_window < w_wrap + w_target + x_target) && (1)) || w_window < w_wrap) { //Right Arrow
			UI.addClass(this._body,'right');
			this._body.style.marginLeft = - (w_wrap + w_arrow + pl) + 'px';
			this.__right = true;
		}
		else {
			UI.removeClass(this._body,'right');
			this.__right = false;
		}

		if (((!this.__right && (w_target >= w_window - w_wrap)) || w_target > w_wrap || (w_window - x_target - w_target < w_wrap)) && (w_window > w_wrap) && (w_window > x_target + w_wrap)) { //Top && Bottom Arrow (w_target > w_wrap) && 
			w_arrow = 16;
			h_arrow = 9;
			pt = parseInt(UI.C(this._target,'paddingTop'));
			pb = parseInt(UI.C(this._target,'paddingBottom'));
			if (pt == NaN) pt = 0;
			if (pb == NaN) pb = 0;

			this._wrap.style.marginTop = this._close.style.marginTop = this._shadow.style.marginTop = '0';

			if (space - h_arrow < 0) {
				this._body.className = 'tip_box top';
				this._body.style.marginLeft = '';
				this._body.style.marginTop = - h_wrap - h_arrow - pt - pb + 2 + 'px';
			}
			else {
				this._body.className = 'tip_box bottom';
				this._body.style.marginLeft = '';
				this._body.style.marginTop = h_target + h_arrow - pt - pb + 2 + 'px';
			}
		}
		else {
			UI.removeClass(this._body,'top');
			UI.removeClass(this._body,'bottom');
			if (space < 0) {
				if (space > -23)  space = -23;
				if (h_window < h_wrap) {
					space = h_window - h_wrap;
				}
				if (h_wrap - 22 < - space) {
					space = 22 - h_wrap;
				}
				this._wrap.style.marginTop = this._close.style.marginTop = this._shadow.style.marginTop = space - 4 + 'px';
			}
			else {
				this._wrap.style.marginTop = this._close.style.marginTop = this._shadow.style.marginTop = - 2 + 'px';
			}
		}

		if (this._cover) { //Select Cover For IE6
			if (!(UI.hasClass(this._body,'top') || UI.hasClass(this._body,'bottom'))) {
				this._cover.style.cssText = 'width:' + (w_wrap + 9) + 'px;height:' + (h_wrap + 3) + 'px;margin-top:' + this._wrap.style.marginTop;
			}
			else this._cover.style.cssText = 'width:' + (w_wrap + 4) + 'px;height:' + (h_wrap + 11) + 'px;';
		}

		this._shadow.style.height = UI.height(this._wrap) + 'px';
		this.__display = true;
	}
	this.hide = function() {
		UI.hide(this._body);
		this.__large = null;
		this.__display = false;
	}
}
UI.Resize = function(o,option) {
	var P = o.parentNode.parentNode;
	var ico = UI.GC(P,'.ico')[0];
	var w,h,x,y,action,padding_y = 0,padding_x = 0;

	if (!option) option = {
		min : {
			x : 20,
			y : 15
		},
		max : {
			x : Infinity,
			y : Infinity
		}
	}
	else {
		if (!option.min) option.min = {
			x : 20,
			y : 15
		}
		if (!option.max) option.max = {
			x : Infinity,
			y : Infinity
		}
	}

	UI.drag(ico,{
		start : function(e) {
			var E = UI.E(e);
			x = E.x;
			y = E.y;
			w = UI.width(o);
			h = UI.height(o);
			action = UI.C(ico,'cursor');
			if (!UI.Browser.ie && document.compatMode == 'BackCompat') {
				var self = ico.parentNode;
				padding_x = parseInt(UI.C(self,'paddingLeft')) + parseInt(UI.C(self,'paddingRight'));
				padding_y = parseInt(UI.C(self,'paddingBottom')) + parseInt(UI.C(self,'paddingTop'));
			}
		},
		drag : function(e) {
			var E = UI.E(e),W,H;
			switch (action) {
				case 'ne-resize':
					W = w + E.x - x - padding_x;
					H = h - E.y + y - padding_y;
					break;
				case 'se-resize':
					W = w + E.x - x - padding_x;
					H = h + E.y - y - padding_y;
					break;
				case 'nw-resize':
					W = w - E.x + x - padding_x;
					H = h - E.y + y - padding_y;
					break;
				case 'sw-resize':
					W = w - E.x + x - padding_x;
					H = h + E.y - y - padding_y;
					break;
				case 'e-resize':
					W = w - E.x + x - padding_x;
					break;
				case 's-resize':
					H = h + E.y - y - padding_y;
					break;
			}
			if (W < option.min.x) W = option.min.x;
			if (W > option.max.x) W = option.max.x;
			if (H < option.min.y) H = option.min.y;
			if (H > option.max.y) H = option.max.y;
			try{
				UI.C(o,'width',W + 'px');
				UI.C(o,'height',H + 'px');
			}catch(e){};
		}
	},UI.isUndefined(option.capture) ? true : option.capture);
}
}
