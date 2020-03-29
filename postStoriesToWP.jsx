// Utility IndexOF array
Array.prototype.indexOf = function ( item ) {
	var index = 0, length = this.length;
	for ( ; index < length; index++ ) {
		if ( this[index] === item ) return index;
	}
	return -1;
};

// Utility Object with keys
var getKeysWithoutObjectKeysSupport = function(associativeArrayObject) {
    var arrayWithKeys=[], associativeArrayObject;
    for (key in associativeArrayObject) {
      // Avoid returning these keys from the Associative Array that are stored in it for some reason
      if (key !== undefined && key !== "toJSONString" && key !== "parseJSON" ) {
        arrayWithKeys.push(key);
      }
    }
    return arrayWithKeys;
}

// Utility encodes string to base 64
var base64Encode = function(/*str*/s){
	var ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'+
		'abcdefghijklmnopqrstuvwxyz0123456789+/=';

	var n = s.length,
		a = [], z = 0, c = 0,
		b, b0, b1, b2;

	while( c < n )
		{
		b0 = s.charCodeAt(c++);
		b1 = s.charCodeAt(c++);
		b2 = s.charCodeAt(c++);

		var b = (b0 << 16) + ((b1 || 0) << 8) + (b2 || 0);

		a[z++] = ALPHA.charAt((b & (63 << 18)) >> 18);
		a[z++] = ALPHA.charAt((b & (63 << 12)) >> 12);
		a[z++] = ALPHA.charAt(isNaN(b1) ? 64 : ((b & (63 << 6)) >> 6));
		a[z++] = ALPHA.charAt(isNaN(b2) ? 64 : (b & 63));
		}

	s = a.join('');
	a.length = 0;
	a = null;
	return s;
};

var fileToBase64 = function(/*File|str*/f){
	var s = null;

	if( f && (f = new File(f)) && (f.encoding='BINARY') && f.open('r') ){
		s = f.read();
		f.close();
	}

	return s && base64Encode(s);
};
  
// Utility Http connection VIA sockets
function httpconn(method,ssl){
	this._coveredMethods = ["GET","POST"];
	this.method = (method == undefined)?"GET":method;
	this.port = (ssl == undefined || !ssl)? "80": "443";
	this.init();
}

httpconn.prototype.setUrl = function(url){
	this.url = url;
	this._configureSocket();
	return this;
}

httpconn.prototype.init = function(){
	this.socket = new Socket;
	this.socket.timeout = 65;
	this._parsedparam = new Object();
	this.params = new Object();
	this.contentType = "Content-Type: application/x-www-form-urlencoded; charset=UTF-8";
	// this._boundary = "--"+ Date.now();
	// this.contentType = "Content-Type: multipart/form-data; boundary="+ this._boundary +"\n\n";//charset=UTF-8;"
	this.extraHeader = "";
}
httpconn.prototype.clean = httpconn.prototype.init;

httpconn.prototype._configureSocket = function(){
	var _urlsplit = this.url.replace(/[http|https]*/,"").replace("://","");
	var _urlsplit = _urlsplit.split("/");
	this.host = _urlsplit[0];

	if (_urlsplit[1] != undefined ){
		_urlsplit.shift();
		if(_urlsplit[0][0] != '/' && this.host[this.host.length - 1] != '/'){
			this.path = "/"+ _urlsplit.join("/");
		}else{
			this.path = _urlsplit.join("/");
		}
	}else{
		this.path = "/";
	}
	return this;
}

httpconn.prototype._parseParam = function(){
	var _parsedparam = "";
	for (i in this.params){
		if(_parsedparam.length!=0){
		_parsedparam += "&";
		}else{
		_parsedparam += ""
		} 
		_parsedparam += i + "=" + String( this.params[i]);
	}
	this._parsedparam.str = _parsedparam;
	this._parsedparam.length = _parsedparam.length;
	return this;
}

httpconn.prototype.addParam = function(name, value){
	this.params[name] = value;
	return this;
}

httpconn.prototype.setContentType=function(ct){
	this.contentType = ct+"\n";
}

httpconn.prototype.addHeader=function(headerLine){
	this.extraHeader+=headerLine+"";
	return this;
}

httpconn.prototype.request = function(){
	var reply = "";
	var _request = this.method;
	if (this.method=="POST"){
		_request +=" "+this.path+" HTTP/1.1\n";
	} else{
		_request +=" "+this.path+"?"+this._parsedparam.str+" HTTP/1.1\n";
	}
	
	_request += "Host: "+this.host+":"+this.port+" \n"; 
	_request += this.extraHeader + "\n";

	if (this.method=="POST"){
		_request+="Content-Length: "+this._parsedparam.length+"\n";
	}
	
	_request+="Connection: keep-alive\n";
	_request+=this.contentType +"\n\n";
	_request += this._parsedparam.str;
	
	// alert("host:"+this.host+"\n method:"+this.method+"\n port:"+this.port + "\n dados:"+this._parsedparam.str);
	// alert("request:" + _request);

	if (this.socket.open (this.host+":"+this.port, "UTF-8")) {
		var result = this.socket.writeln(_request);
		reply = this.socket.read(999999);
		var close = this.socket.close();
	}

	return reply;
}
 
	
// constants
var HTML_TAGS = ['None','-','Author Name',  'Title', 'Excerpt', 'Published Date', '-','Text Content', 'Headline 1', 'Headline 2', '-','Image caption', 'Image credit'];

// Functions
function addFolderPath(container){

	var folder = container.add("group");
	folder.orientation = 'row';
	folder.add("statictext", undefined,  "Folder" );
	folder.path = folder.add("edittext", undefined, "",{readonly:true});
	folder.path.characters = 20;

	folder.btn = folder.add( "button", undefined, "Choose", { 
		name: "openFolderDialog" ,
	} );

	// Open Folder Dialog
	folder.btn.onClick = function(){
		// Pre-defined starting point
		var folderObj = Folder.myDocuments;
		var f = folderObj.selectDlg("Choose a folder to place your XML");
		folder.path.text = f;
	}
	
	return folder;

}

function addTextEdit(container, label, defaultVal, charactersLength){
	if(!defaultVal) {
		defaultVal = '';
	}
	var group = container.add("group")
	group.orientation = 'row';
	group.add("statictext", undefined,  label );
	group.field = group.add("edittext", undefined, "")
	group.field.characters = charactersLength;

	return group;
}

function addFileName(container){
	var currentFileName = app.activeDocument.name.split('.indd')[0];
	var file = container.add("group");
	file.orientation = 'row';
	file.alignChildren = 'fill';
	file.add("statictext", undefined,  "File Name" );
	var text_field = file.add("edittext", undefined, currentFileName + '.xml');
	text_field.characters = 30;
	return file;
}

function addDropDownTags(paragraph_styles, styleName){
	var select = paragraph_styles.add( "dropdownlist", undefined, HTML_TAGS);
	switch (styleName) {
		case "כותרת":
			select.selection = 4;
			break;
		
		case "משנה":
			select.selection = HTML_TAGS.indexOf("Excrept");
			break;
		
		case "ביניים":
			select.selection = HTML_TAGS.indexOf("Headline 1");
			break;
		
		case "מאת":
			select.selection = HTML_TAGS.indexOf("Author");
			break;
		
		// case "שאלה":
		// 	select.selection = HTML_TAGS.indexOf("blockqoute");
		// 	break;
		
		// case "טיזר":
		// 	select.selection = HTML_TAGS.indexOf("blockqoute");
		// 	break;

		// case "אפוק לינק":
		// 	select.selection = HTML_TAGS.indexOf("a");
		// 	break;

		// case "כיתוב לתמונה":
		// 	select.selection = HTML_TAGS.indexOf("caption");
		// 	break;
		
		// case "כרדיט":
		// 	select.selection = HTML_TAGS.indexOf("credit");
		// 	break;
		
		// case "[No Paragraph Style]":
		// 	select.selection = HTML_TAGS.indexOf('None');
		// 	break;
		
		// case "[Basic Paragraph]":
		// 	select.selection = HTML_TAGS.indexOf('p');
		// 	break;
		
		// case "Normal":
		// 	select.selection = HTML_TAGS.indexOf('p');
		// 	break;

		case "טקסט מרווח":
			select.selection = HTML_TAGS.indexOf("Text Content");
			break;
	
		default:
			select.selection = HTML_TAGS.indexOf('None');
			break;
	}
	if(styleName == "כותרת"){
		alert(select.selection);
	}
	return select;
}

function addParagraphStylesMatch(dialog){
	var doc = app.activeDocument;
	var paragraph_styles = dialog.add( "panel", undefined, "Match Paragraph styles to HTML tags" );
	
	for(var i = 0; i < doc.allParagraphStyles.length; i++){
		var currentStyle = doc.allParagraphStyles[i];
		var group = paragraph_styles.add("group");
		group.margins = 0;
		group.id = currentStyle.id;
		group.orientation = 'row';
		group.styleName = group.add("statictext", undefined, currentStyle.name );
		group.styleName.characters = 20;
		group.styleName.margins = 0;
		group.tag = addDropDownTags(group,currentStyle.name);
	}
	return paragraph_styles;
}

function tagByParagraphStyleName(styleName,dialog){

	for(var s = 0; s < dialog.paragraph_styles.children.length; s++){
		var currentStyle = dialog.paragraph_styles.children[s];
		if(currentStyle.styleName.text == styleName){
			// alert("current style in loop :" + currentStyle.styleName.text);
			// alert("style in query :" + styleName);
			// alert("selection: " + currentStyle.tag.selection);
			// alert("HTML TAG: " + HTML_TAGS[Number(currentStyle.tag.selection)]);
			return HTML_TAGS[Number(currentStyle.tag.selection)];
		}
	}
	return false
}

function exportToXMLFile(){

}

function postAction(dialog){
	var url = dialog.wp.url.field.text;
	var token = dialog.wp.appToken.field.text;
	var userName = dialog.wp.userName.field.text;
	
	

	if(!url || !token || !userName){
		alert("You need to fill all fields before Posting!");
		return;
	}else{
		var newPost = wpNewPost(url, userName, token, dialog);
		alert("newPost response:" + newPost.toString());
		alert(newPost.split('status:')[1]);

		// var postImages = wpNewMedia(url, userName, token, dialog);
		// alert("postImages response:" + postImages);

	}
}

function addButtons(container, dialog){
	var buttons = container.add( "group", undefined, "Build it" );
	buttons.alignment = 'left';

	// buttons.buildBtn = buttons.add( "button", undefined, "Build", { name: "buildForExport" } );
	// buttons.buildBtn.onClick = function(){
	// 	exportToXMLFile(dialog);
	// };

	buttons.sendBtn = buttons.add( "button", undefined, "Post", { name: "postToWp" } );
	buttons.sendBtn.onClick = function(){
		postAction(dialog);
	};
	buttons.cancelBtn = buttons.add( "button", undefined, "Cancel", { name: "cancel" } );	
	buttons.cancelBtn.alignment = "right";

	return buttons;
}

function buildDialog(){
	
	var dialog = new Window( "dialog", "Style To Xml Tags" );
	dialog.orientation = 'row';
	var firstCol = dialog.add("group");
	firstCol.orientation = 'column';

	// Matching tag panel
	dialog.paragraph_styles = addParagraphStylesMatch(firstCol);

	var secondCol = dialog.add("group");
	secondCol.orientation = 'column';

	// Export Panel settings
	// dialog.export = secondCol.add('panel');
	// dialog.export.orientation = 'column';
	// dialog.export.alignChildren = 'right';
	// dialog.export.text = 'Export details';

	// dialog.export.folder = addFolderPath(dialog.export); // Folder Path
	// dialog.export.file = addFileName(dialog.export); // File Path
	
	// WP Panel settings
	dialog.wp = secondCol.add('panel');
	dialog.wp.orientation = 'column';
	dialog.wp.alignChildren = 'right';
	dialog.wp.text = 'WP details';
	
	dialog.wp.url = addTextEdit(dialog.wp, "Url", "", 30); // WP url endpoint
	dialog.wp.userName = addTextEdit(dialog.wp, "User Name", "", 30); // WP user name
	dialog.wp.appToken = addTextEdit(dialog.wp, "App Token", "", 30); // Wp password as app token

	
	dialog.actionButtons = addButtons(secondCol, dialog); // Add buttons
		
	return dialog;
}

function buildContent(dialog){
	var doc = app.activeDocument;
	var content = "";
	var title = "";
	var authorName = "";
	var excerpt = ""
	var none = "";

	var paras = doc.stories[2].paragraphs.everyItem().getElements();

	for(var a = 0; a < doc.stories.length; a++){
		var story = doc.stories[a];
	
		// Get every paragraph in `story` (using `everyItem().getElements()` is more efficient)
		var paras = story.paragraphs.everyItem().getElements();

		for (var i = 0; i < paras.length; i++) {
			var para = paras[i];
			var tagMatched = tagByParagraphStyleName(para.appliedParagraphStyle.name, dialog);

			switch( tagMatched ){
				case "Author Name":
					authorName += para.contents;
					break;
				case "Text Content":
					if(para.contents != ''){
						content += '<p>' +para.contents + '</p>';
					}
					break;
				case "Headline 1":
					content += '<h1>' + para.contents + '</h1>';
					break;
				case "Headline 2":
					content += '<h2>' + para.contents + '</h2>';
					break;
				case "Title":
					title += para.contents;
					break;
				case "Excerpt":
					excerpt += para.contents;
					break;
				case "Published Date":
					excerpt += para.contents;
					break;
				default:
					none += para.contents;
					break;					
			}
			
		}
	}
	
	// alert("Title: \n" + title);
	// alert("Excerpt: \n" + excerpt);
	// alert("Aouter Name: \n" + authorName);
	// alert("Content: \n" +content);
	// alert("None: \n" +none);
	
	var body = {
		// "date": Date.now(), //published
		"status": "draft",
		"title": title, //title
		"content": content,
		"excerpt": excerpt,
		"authorName": authorName
	}
	return body;
}

function buildImages(dialog){
	var doc = app.activeDocument;
	var links = doc.links;
	var images = [];
	var captions = [];
	var credits = [];

    for (var i = 0; i<links.length; i++) {
        if (links[i].status != LinkStatus.LINK_MISSING) {
			var image = links[i];
			if(image.status == LinkStatus.NORMAL|| image.status == LinkStatus.LINK_EMBEDDED){
				alert("filePath :" + image.filePath);
				alert("linkType :" + image.linkType);
				alert("linkXmp :" + image.linkXmp.documentTitle);
				alert("size :" + image.size);
				alert("size border:" + Number(image.size) < 10000000);
				if(Number(image.size) < 10000000){
					alert(fileToBase64(File(image.filePath)));
					images.push({
						name: image.linkXmp.documentTitle + "." + image.linkType,
						content: fileToBase64(image.filePath.replace(':','/'))
					});	
				}
			}
        }
	}
	
	var paras = doc.stories[2].paragraphs.everyItem().getElements();
	for(var a = 0; a < doc.stories.length; a++){
		var story = doc.stories[a];
	
		var paras = story.paragraphs.everyItem().getElements();
		for (var i = 0; i < paras.length; i++) {
			var para = paras[i];
			var tagMatched = tagByParagraphStyleName(para.appliedParagraphStyle.name, dialog);

			switch( tagMatched ){
				case "Image caption":
					captions.push(para.contents);
					break;
				case "Image credit":
					credits.push(para.contents);
					break;
				default:
					break;					
			}
		}
	}

	var data = {
		images: images,
		captions: captions,
		credits: credits
	}

	return data;
}

function setPostConnection(url, userName, token, requestBody){
	var ssl = false;
	if(url.indexOf('https://') == 0){
		ssl = true;
	}
	var http = new httpconn("POST", ssl);
	var pass = base64Encode(userName + ':' + token);

	var reqHeaders = http.setUrl(url + 'wp-json/wp/v2/posts').addHeader("Authorization: Basic " + pass);

	if(requestBody != undefined){
		var bodyKeys = getKeysWithoutObjectKeysSupport(requestBody);
		if(bodyKeys != undefined && bodyKeys.length > 0){
			for(var i = 0; i < bodyKeys.length; i++){
				if(requestBody[bodyKeys[i]] != ''){
					reqHeaders.addParam(bodyKeys[i],encodeURI(requestBody[bodyKeys[i]]));
				}
			}
		}
	}

	return reqHeaders._parseParam();
}

function wpNewPost(url, userName, token,dialog){
	var requestBody = buildContent(dialog);
	var request = setPostConnection(url, userName, token, requestBody);
	var res = request.request();
	
	return res;
}

function wpNewMedia(url, userName, token, dialog){
	var requestBody = buildImages(dialog);
	alert(requestBody);
	
	for(var i = 0; i < requestBody.image.length; i++){
		var currentImage = requestBody.image[i];
		var imageCaption = requestBody.captions[i];
		var credit = requestBody.credits[i];

		var request = setPostConnection(url, userName, token, {
			"bla": "blue"
		}).addHeader("Content-Disposition: form-data; filename=" + currentImage.name + '\n\n' + currentImage.content);
		var res = request.request();
		alert(res.toString());
	}	
}

// Initializing
if( app.documents.length == 0){
	alert("You need an open document" );
}
var dialog = buildDialog();
dialog.show();



