//@include './json.jsx';
//target indesign

// Should be saved with UTF-16 BE encoding for proper Hebrew display.

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

// Utility For Http Response
var resultGet = function(res, what){
	var val;
	switch(what){
		case "status":
			var splited = res.toString().split("HTTP/1.1 ");
			val = Number(splited[1].substring(0, 3));
			break;
		case "data":
			var splited = res.toString().split("\n\n")[1].split("HTTP/1.1 ")[0];
            // alert("subs : \n\n" + splited.substring(0,5));
            if(splited.substring(0,4) == "fbf7"){
                splited = splited.substring(5,splited.length);
            }
            if(splited[0] == "{"){
                splited = "[" + splited + "]";
            }
            // alert("splited : \n\n" + splited);
            // alert("json splited : \n\n" + JSON.parse(splited));

			val = JSON.parse(splited);
		default:

			break;
	}
	return val;

};

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
	
	_request += "Connection: keep-alive\n";
	_request += this.contentType +"\n\n";
	_request += this._parsedparam.str;
	
	// alert("host:"+this.host+"\n method:"+this.method+"\n port:"+this.port + "\n dados:"+this._parsedparam.str);
	// alert("request:" + _request);

	if (this.socket.open(this.host+":"+this.port, "UTF-8")) {
		var result = this.socket.writeln(_request);
		reply = this.socket.read(999999);
		var close = this.socket.close();
	}else{
        alert("not open");
    }

	return reply;
}
 
	
// constants
var HTML_TAGS = ['None','-','Author Name',  'Title', 'Excerpt', 'Published Date', '-','Text Content', 'Blockquote', 'Headline 1', 'Headline 2', '-','Image caption', 'Image credit'];

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
			select.selection = HTML_TAGS.indexOf("Title");
			break;
		
		case "משנה":
			select.selection = HTML_TAGS.indexOf("Excerpt");
			break;
		
		case "ביניים":
			select.selection = HTML_TAGS.indexOf("Headline 2");
			break;
		
		case "מאת":
			select.selection = HTML_TAGS.indexOf("Author Name");
			break;
		
		case "טיזר":
			select.selection = HTML_TAGS.indexOf("Blockquote");
			break;
		
		case "כיתוב לתמונה":
			select.selection = HTML_TAGS.indexOf("Image caption");
			break;
		
		case "כרדיט":
			select.selection = HTML_TAGS.indexOf("Image credit");
			break;
		
		case "[Basic Paragraph]":
			select.selection = HTML_TAGS.indexOf('Text Content');
			break;
		
		case "Normal":
			select.selection = HTML_TAGS.indexOf('Text Content');
			break;

		case "טקסט מרווח":
			select.selection = HTML_TAGS.indexOf("Text Content");
			break;
	
		default:
			select.selection = HTML_TAGS.indexOf('None');
			break;
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
		group.tag = addDropDownTags(group,String(currentStyle.name));
	}
	return paragraph_styles;
}

function tagByParagraphStyleName(styleName,dialog){

	for(var s = 0; s < dialog.paragraph_styles.children.length; s++){
		var currentStyle = dialog.paragraph_styles.children[s];
		if(String(currentStyle.styleName.text) == String(styleName)){
			return HTML_TAGS[Number(currentStyle.tag.selection)];
		}
	}
	return false
}

function exportToXMLFile(){
    // TODO: add xml support
}

function getUrlFromDialog(dialog){
    var url = dialog.wp.url.field.text;
	var token = dialog.wp.appToken.field.text;
	var userName = dialog.wp.userName.field.text;
    	
    var requestBody = buildContent(dialog);
    var obj = {
        "url" : url, 
        "token": token, 
        "userName": userName, 
        "requestBody":requestBody
    }
    return obj;
}

function postAction(dialog){
	var objs = getUrlFromDialog(dialog);

	if(!objs.url || !objs.token || !objs.userName){
		alert("You need to fill all fields before Posting!");
		return;
	}else{
		return ConfirmPostContent(objs.requestBody, dialog);
	}
}

function addButtons(container, dialog, postActionFunction){
	var buttons = container.add( "group", undefined, "Build it" );
	buttons.alignment = 'left';

	// buttons.buildBtn = buttons.add( "button", undefined, "Build", { name: "buildForExport" } );
	// buttons.buildBtn.onClick = function(){
	// 	exportToXMLFile(dialog);
	// };

	buttons.sendBtn = buttons.add( "button", undefined, "Post", { name: "postToWp" } );
	buttons.sendBtn.onClick = function(){
		postActionFunction(dialog);
	};
    // TODO: cancel button on review dosent work
	buttons.cancelBtn = buttons.add( "button", undefined, "Cancel", { name: "cancel" } );	
	buttons.cancelBtn.alignment = "right";

	return buttons;
}

function buildDialogDetails(tab, dialog){
	tab.orientation = 'row';
	var firstCol = tab.add("group");
	firstCol.orientation = 'column';

	// Matching tag panel
	dialog.paragraph_styles = addParagraphStylesMatch(firstCol);

	var secondCol = tab.add("group");
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
	//Test only
	dialog.wp.url.field.text = "http://epochstage1.wpengine.com/";
	dialog.wp.userName = addTextEdit(dialog.wp, "User Name", "", 30); // WP user name
	dialog.wp.appToken = addTextEdit(dialog.wp, "App Token", "", 30); // Wp password as app token

	
	dialog.actionButtons = addButtons(secondCol, dialog, postAction); // Add buttons
}

function loadMeta(url, type, params){
	var ssl = false;
	if(url.indexOf('https://') == 0){
		ssl = true;
	}
	var http = new httpconn("GET", ssl);

	var reqHeaders = http.setUrl(url + 'wp-json/wp/v2/'+type+'/');
	if(params != undefined){
		paramsKeys = getKeysWithoutObjectKeysSupport(params)
		for(var i=0; i < paramsKeys.length; i++){
			alert(params[paramsKeys[i]]);
			reqHeaders.addParam(paramsKeys[i], params[paramsKeys[i]]);
		}
		reqHeaders._parseParam();
	}

	return reqHeaders.request();
}

function buildDialogConfirm(tab, dialog){
    // Setup continer
	tab.orientation = 'row';
    tab.scrollable = true;

    // Top level Layout
    var rightCol = tab.add("group");
    	rightCol.orientation = 'column';
        rightCol.maximumSize[0] = 500;
        rightCol.scrollable = true;
        rightCol.alignment = 'left';
        rightCol.alignChildren = 'left';
        rightCol.margins = [0,0,0,0];
    var leftCol = tab.add("group");
	    leftCol.orientation = 'column';
        leftCol.alignment = 'left';
        leftCol.maximumSize[0] = 500;
        leftCol.scrollable = true;
        leftCol.alignChildren = 'left';
        leftCol.margins = [0,0,0,0];
    
    // Genral
	var general = rightCol.add("panel", undefined, "General");
		general.orientation = 'row';
		general.alignChildren = 'right';

		general.add("statictext", undefined,"Status");
		dialog["status"] = general.add("dropdownlist", undefined, ['draft','published']);
		dialog["status"].size = [150, 30];
		dialog["status"].selection = 0;

		general.add("statictext", undefined,"Title");
		dialog["title"] = general.add("edittext", undefined, "title");
		dialog["title"].size = [150, 30];

    // Excerpt edit
    var excerpt = rightCol.add("panel", undefined, "Excerpt");
		excerpt.orientation = 'column';
		excerpt.alignChildren = 'left';

        dialog["excerpt"] = excerpt.add("edittext", undefined, "Excerpt",{
			multiline: true,
			scrollable: true
		});
		dialog["excerpt"].size = [450, 90];
        

    // Content edit
	var content = rightCol.add("panel", undefined, "Content");
		content.orientation = 'column';
		content.alignChildren = 'left';

		dialog["content"] = content .add("edittext", undefined, "Content",{
			multiline: true,
			scrollable: true
		});
		dialog["content"].size = [450, 300];

    // Send to WP Buttons
    dialog.postToWPButton = addButtons(rightCol, dialog, wpNewPost);
    dialog.postExsits = rightCol.add("statictext", undefined, "Post has been created");
    dialog.postExsits.hide();

    // TODO: Author
    // var authorLabel = leftCol.add("panel", undefined, "Author");
	// 	authorLabel.size = [450,80];
	// 	authorLabel.orientation = "row";

	// 	dialog.authorACF = authorLabel.add("radiobutton", undefined, "Acf Field" );
	// 	dialog.authorLoad = authorLabel.add("radiobutton", undefined, "Load Existing Author");

	// 	dialog.authorACFName = authorLabel.add("edittext", undefined, "Acf Field Name" );
	// 	dialog.authorACFName.size = [150, 30];
	// 	dialog.authorACFName.hide();

	// 	dialog["authorName"] = authorLabel.add("edittext", undefined, "Author");
	// 	dialog["authorName"].size = [150, 30];
	// 	dialog["authorName"].hide();

	// 	var loadAuthorsButton = authorLabel.add("button", undefined, "Load Authors");
	// 	loadAuthorsButton.hide();
		
	// 	dialog.authorID = authorLabel.add("dropdownlist", undefined, [] );
	// 	dialog.authorID.hide();
		
    // // Author Functions 
	// 	dialog.authorACF.onClick = function(){
	// 		loadAuthorsButton.hide();
	// 		if(dialog.authorID != undefined){
	// 			dialog.authorID.hide();
	// 		}
	// 		dialog.authorACFName.show();
	// 	}

	// 	dialog.authorLoad.onClick = function(){
	// 		dialog.authorACFName.hide();
	// 		if(dialog.authorID != undefined){
	// 			dialog.authorID.show();
	// 		}
	// 		loadAuthorsButton.show();
	// 	}

	// 	loadAuthorsButton.onClick = function(){
	// 		var res = loadMeta(dialog.wp.url.field.text, "users");
	// 		var status = resultGet(res,"status");
	// 		if(status == 200){
	// 			var items = dialog.authorID.items;
	// 			var data = resultGet(res,"data");
	// 			for(var i =0; i<data.length; i++){
	// 				items.add("item",data[i].name);
	// 				// [i] = {
	// 				// 	text: data[i].name,
	// 				// 	index:data[i].id
	// 				// };
	// 				// alert(dialog.authorID.items);

	// 				// items[i] = data[i].name;
	// 			}
	// 			// dialog.authorID.items = items;
	// 			alert(dialog.authorID);
	// 			alert( getKeysWithoutObjectKeysSupport(dialog.authorID));
	// 			alert("visible: " + dialog.authorID.visible);
	// 			alert("location :" + dialog.authorID.location);
	// 			alert("items :" + dialog.authorID.items);

	// 		}
	// 	}

    // TODO: Categories
        // var res = loadMeta(dialog.wp.url.field.text, "categories");
        // if(resultGet(res,"status") == 200){
        // var categoryLabel = leftCol.add("panel", undefined,"Category");
        // categoryLabel.maximumSize[0] = 500;
        //     var items = resultGet(res,"data");
        //     var group = categoryLabel.add("group");
        //         group.orientation = "column";
        //         // group.alignChildren = "fill";
        //         group.scrollable = true;
        //         group.maximumSize[0] = 500;
            
        //     dialog.category= [];
        //     var threesomes = group.add("group");
        //     for(var i=0;i<items.length; i++){
        //         dialog.category[items[i].id] = threesomes.add("checkbox", undefined, items[i].name);
        //         dialog.category[items[i].id].justify = "left";
        //         if(i%3 == 0){
        //             threesomes = group.add("group");
        //         }
        //     }
        // }	
    
    // Images 
    if(BridgeTalk.getStatus("photoshop") != 'ISNOTINSTALLED' || BridgeTalk.getStatus("photoshop") != 'UNDEFINED'){
        var imagesPanel = leftCol.add("panel", undefined,"Images");
    	var doc = app.activeDocument;
        var links = doc.links;
        var needToCompress = [];
        var goodForWeb = [];
        var validImages = [];

         // -- Loop over Links
        for (var i = 0; i<links.length; i=i+1) {

            if (links[i].status != LinkStatus.LINK_MISSING) {
                var image = links[i];
                if(image.status == LinkStatus.NORMAL|| image.status == LinkStatus.LINK_EMBEDDED){
                    // Vars
                    var selfFolder = Folder(app.activeDocument.filePath);
                        selfFolder = Folder.encode(selfFolder.fullName);

                    // alert("selfPath: " +selfFolder +  "\n\nExsits: " + Folder(selfFolder).exists);
                    var converted = new File( selfFolder + "/" + image.name.substring(0,image.name.length - 4) + '-web.png');
                    // alert("converted: " +converted.fullName +  "\n\nExsits: " + converted.exists);
                    var name = converted.exists? converted.name :image.name;
                    var sizeInKb = Number(converted.exists? converted.length/1000000:image.size/1000000);
                    var sizedForWeb = sizeInKb < 1;
                    var typedForWeb = image.linkType == ("png"||"PNG"|| "JPEG"|| "jpg");
                    var readyForWeb = converted.exists || (sizedForWeb && typedForWeb);
                    var link = converted.exists?converted.path + converted.name :image.linkResourceURI;
                    var shortName = name.length > 17? "..." + name.substring(name.length -17): name;

                    validImages.push(links[i]);

                    if(!readyForWeb){
                        needToCompress.push({
                            "link":link,
                            "shortName": shortName,
                            "sizedForWeb": sizedForWeb
                        });
                    }else{
                        goodForWeb.push({
                            "link":link,
                            "shortName": shortName,
                            "sizedForWeb": sizedForWeb
                        });
                    }        
                   
                }
            }
        }


        // Stracture And Text
        if(needToCompress.length > 0 ){

            imagesPanel.add("statictext", undefined, "Images to compress: \n");
            for(idx in needToCompress){
                if(needToCompress[idx].shortName!= undefined){
                    imagesPanel.add("statictext", undefined, needToCompress[idx].shortName + "\n");
                }
            }
        }

        if(goodForWeb.length == validImages.length){
            imagesPanel.add("statictext", undefined, "\n");
            imagesPanel.add("statictext", undefined, "All Images ready for web and exsits as .png at:\n");
            var folderPath = Folder.decode(app.activeDocument.filePath);
            var splited = folderPath.split('/');
            for(idx in splited){
                if(idx != splited.length && splited[idx].reflect.name == "String"){
                    imagesPanel.add("statictext", undefined, splited[idx] + " -> \n");
                }
            }

        }else if(goodForWeb.length > 0){
            imagesPanel.add("statictext", undefined, "\n");
            imagesPanel.add("statictext", undefined, "Images ready for web: \n");
            for(idx in goodForWeb){
                if(goodForWeb[idx].shortName!= undefined){
                    imagesPanel.add("statictext", undefined, goodForWeb[idx].shortName + "\n");
                }
            }
        }
        
        // Resize Button
        if(needToCompress.length > 0 ){
             var imagesConvertButton = imagesPanel.add("button",undefined,"Resize and compress Images");

            imagesConvertButton.onClick = function(){
                for(idx in needToCompress){
                    var link = needToCompress[idx].link;
                    sendScriptToPhotoshop(link, app.activeDocument.filePath,saveNewImageInPhotoshop);
                }
                sendScriptToPhotoshop(undefined,undefined, photoshopStop);
            }
        }
    }
}

function photoshopStop(){
    var doc = app.activeDocument;
    app.displayDialogs = DialogModes.NO; 

    for(doc in app.documents){
        doc.activeHistoryState = doc.historyStates[doc.historyStates.length-1];
        doc.close(SaveOptions.DONOTSAVECHANGES);

    }

    app.purge(PurgeTarget.HISTORYCACHES);
}

function saveNewImageInPhotoshop(currentFolderPath, destFolderPath, imageName, currenExt) {
    app.open( File(currentFolderPath + imageName + currenExt) );
     if (app.documents.length == 0) ErrorExit("Please open a document and try again.", true);
    var doc = app.activeDocument;
    app.displayDialogs = DialogModes.NO; 

    var pngFile = new File(destFolderPath + "/" + imageName + "-web" ); 
    if(pngFile.exists) {
        pngFile.remove();
    }

    var width = Number(doc.width);
    var height = Number(doc.height);
    if( !doc.width.convert("px")){
        alert("Please update Doc to pixels and comeback to proceed!");
        return;
    }

    var horizontal = width >= height;
    var ratio = horizontal? width/height : height/width;
    var needShrink = horizontal?  width > 992 : height > 992;
    
    if(needShrink){
        var newWidth = horizontal? new UnitValue(992,"px"): new UnitValue(width,"px");
        var newHeight = horizontal? new UnitValue(newWidth / ratio,"px") : new UnitValue(992, "px");
        if(!horizontal){
            newWidth = new UnitValue(newHeight / ratio, "px");
        }
        doc.resizeImage(newWidth, newHeight, doc.resolution, ResampleMethod.BICUBIC);
        doc.resizeCanvas(newWidth, newHeight);
    }

    var pngSaveOptions = new PNGSaveOptions();
    pngSaveOptions.compression = 9;
    pngSaveOptions.interlaced = false;
    doc.saveAs(pngFile, pngSaveOptions, true, Extension.LOWERCASE);

    return destFolderPath + "/" + imageName + "-web.png";
}

function sendScriptToPhotoshop(link, folderPath, functionToExecute){
    if(!BridgeTalk.isRunning("photoshop")){
        alert("Lunching Photoshop");
        BridgeTalk.launch("photoshop" , "background");
        return sendScriptToPhotoshop(link, folderPath, functionToExecute);
    }

    if(functionToExecute == saveNewImageInPhotoshop){
        var imagePath = link.substring(5, link.length);
            imagePath = File.decode(imagePath);
        var imageName = imagePath.split('/');
            imageName = imageName[imageName.length -1].substring(0, imageName[imageName.length -1].length - 4);
        var currentExt = imagePath.substring(imagePath.length - 4);

        var currentFolderPath = imagePath.replace(imageName + currentExt,"");

        if(!File(imagePath).exists){
            alert("There is some kind of a problem with the file on this location: \n" + imagePath  + "\n You can check promissions or rename it.")
            return;
        }
    }

	var bt = new BridgeTalk;
	    bt.target = "photoshop";
        bt.body = functionToExecute.toSource();
        if(functionToExecute == saveNewImageInPhotoshop){
            bt.body += "('" + currentFolderPath + "' , '" + app.activeDocument.filePath  + "', '" + imageName + "' , '"+ currentExt+"');";
        }
        bt.onError = function(e) {
            alert("photoshop running? " + BridgeTalk.isRunning("photoshop"));
            if(e.body == "ERROR: TARGET COULD NOT BE LAUNCHED"){
                alert("Try open photoshop and comeback");
            }else{
                alert("Error: " + e.body);
            }
        }

    bt.onResult = function(resObj){
        return resObj.body
    };

    alert(bt);

    bt.send();
}

function compressPressed(i,desc,caption, title, postMediaButton, dialog){
    dialog.images[i] = sendScriptToPhotoshop(dialog.images[i]);

    if(dialog.images[i]){
        desc.hide();
        caption.show();
        title.show();
        postMediaButton.show();
    }
}

function buildDialogImages(tab, dialog){

    // (window).update() -- https://estk.aenhancers.com/4%20-%20User-Interface%20Tools/window-object.html#update
	tab.orientation = 'row';

	var doc = app.activeDocument;
	var links = doc.links;
	var images = [];
	var captions = [];
	var credits = [];
        dialog.images = [];

    // -- Loop over text and get captions and credits
    // var paras = doc.stories[7].paragraphs.everyItem().getElements();
	for(var a = 0; a < doc.stories.length; a++){
		var story = doc.stories[a];
	
		var paras = story.paragraphs.everyItem().getElements();
		for (var i = 0; i < paras.length; i++) {
			var para = paras[i];
			var tagMatched = tagByParagraphStyleName(para.appliedParagraphStyle.name, dialog);
            // alert("tagMatched, name: " + String(tagMatched) + " " + para.appliedParagraphStyle.name);
            // alert("match Excerpt: " + String(tagMatched) == "Excerpt"? "yes":"no");
            // alert(String(tagMatched).valueOf());
            
			switch( String(tagMatched).valueOf() ){
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


    var leftColImages = tab.add("panel");
        leftColImages.orientation = "column";
        leftColImages.alignment = "top";
        leftColImages.margins = [0,0,0,0];
    var rightColImages = tab.add("panel");
        rightColImages.orientation = "column";
        rightColImages.alignment = "top";
        rightColImages.margins = [0,0,0,0];

    var validImageCounter = 0;

    // -- Loop over text and get captions and credits
    // for (var i = 0; i<links.length; i=i+1) {

    //     if (links[i].status != LinkStatus.LINK_MISSING) {
	// 		var image = links[i];
	// 		dialog.resizeImage = [];
    //         dialog.images = [];

	// 		if(image.status == LinkStatus.NORMAL|| image.status == LinkStatus.LINK_EMBEDDED){
    //             // Vars
	// 			var converted = new File(image.linkResourceURI.substring(5,image.linkResourceURI.length - 4) + '-web.png');
    //             var name = converted.exists? converted.name :image.name;
    //             var sizeInKb = Number(converted.exists? converted.length/1000000:image.size/1000000);
    //             var sizedForWeb = sizeInKb < 1;
    //             var typedForWeb = image.linkType == ("png"||"PNG"|| "JPEG"|| "jpg");
    //             var readyForWeb = converted.exists || (sizedForWeb && typedForWeb);
    //             var link = converted.exists?converted.path + converted.name :image.linkResourceURI;
    //             var shortName = name.length > 10? "..." + name.substring(name.length -17): name;

    //             // Stracture
    //             var columnToAdd = validImageCounter%2 == 0? leftColImages:rightColImages;
    //                 validImageCounter++;
	// 			var panel = columnToAdd.add("panel", undefined, shortName);
	// 				panel.orientation = 'row';
	// 				panel.alignChildren = 'left';
	// 			var leftCol = panel.add("group");
	// 				leftCol.orientation = "column";
	// 			var rightCol = panel.add("group");
	// 				rightCol.orientation = "column";
				

    //             // Data
	// 			leftCol.add("statictext", undefined, "name :" + shortName + "\n");
	// 			leftCol.add("statictext", undefined, "linkType :" + converted.exists?image.linkType:converted.type+ "\n");
	// 			leftCol.add("statictext", undefined, "size :" + sizeInKb + " KB \n");
	// 			leftCol.add("statictext", undefined, "is ready for web :" +( !converted.exists? "Nope.":"Yep."));

    //             // Edit title
    //             var titleG = rightCol.add("group");
    //                 titleG.add("statictext", undefined, "Title");
    //                 titleG.alignment = "left";
    //             var title = titleG.add("edittext",undefined, image.name, {"text": "Title"});
    //                 title.maximumSize[0] = 200;
    //                 title.minimumSize[0] = 200;

    //             // Edit credit
    //             var descG = rightCol.add("group");
    //                 descG.add("statictext", undefined, "Credit");
    //                 descG.alignment = "left";
	// 			var desc = descG.add("edittext", undefined,"Credit", {"text": credits[i]});
    //                 desc.maximumSize[0] = 200;
    //                 desc.minimumSize[0] = 200;

    //             // Edit caption
    //             var captionG = rightCol.add("group");
    //                 captionG.add("statictext", undefined, "Caption");
    //                 captionG.alignment = "left";
	// 			var caption = captionG.add("edittext",undefined,"Caption", {"text": captions[i]});
    //                 caption.maximumSize[0] = 200;
    //                 caption.minimumSize[0] = 200;

    //             // Dispaly image
    //             if((converted.exists)){
    //                 leftCol.add("statictext", undefined, "Display Image, " + converted.type);
    //             }
    //             if((converted.exists && converted.type == ( "png"|| "pngf" || "PNG" || "PNGf"))|| (!converted.exists && image.linkType == "png")){
    //                 var shortedPath = link.substring(5,link.length);
	// 				leftCol.add("image", undefined, shortedPath);
	// 			}

    //             // Post Button
    //             var postMediaButton = rightCol.add("button",undefined,"Post Image");
    //             dialog.images[i] = link;
                
	// 			if( !readyForWeb ){				
	// 				dialog.resizeImage[i] = rightCol.add("button",undefined,"Resize and compress Images");
    //                 var x = i;
	// 				dialog.resizeImage[i].addEventListener("click", function(){
    //                     compressPressed(x,desc,caption, title, postMediaButton, dialog);
    //                 });
    //                 descG.hide();
    //                 captionG.hide();
    //                 titleG.hide();
    //                 postMediaButton.hide();
	// 			}else{
    //                 descG.show();
    //                 captionG.show();
    //                 titleG.show();
    //                 postMediaButton.show();
    //                 dialog.images[i] = converted.linkResourceURI;
    //             }


    //             postMediaButton.onClick = function(){
    //                 alert(i);
    //                 alert(name);
    //                 alert( converted.exists? converted: link);
    //                 wpNewMedia(dialog, name, converted.exists? converted: link,  'credit', 'caption.text');
    //             }


                
	// 		}
    //     }
	// }
}

function buildDialog(){
	var dialog = new Window( "dialog", "Style To Xml Tags" );
	var tabs = dialog.add("tabbedpanel");
	tabs.add("tab", undefined, "First Step - Details");
	tabs.add("tab", undefined, "Second Step - Confirm post content");

	buildDialogDetails(tabs.children[0], dialog);
	buildDialogConfirm(tabs.children[1],dialog);
    
    // if(BridgeTalk.getStatus("photoshop") != 'ISNOTINSTALLED' || BridgeTalk.getStatus("photoshop") != 'UNDEFINED'){
	//  tabs.add("tab", undefined, "Step Three - Send images");
    // 	buildDialogImages(tabs.children[2],dialog);
    // }
		
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
				case "Blockquote":
					content += "<blockquote>" + para.contents + "</blockquote>";
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


function setPostConnection(url, userName, token, requestBody){
	var ssl = false;
	if(url.indexOf('https://') == 0){
		ssl = true;
	}
	var http = new httpconn("POST", ssl);
	var pass = base64Encode(userName + ':' + token);

	var reqHeaders = http.setUrl(url + 'wp-json/wp/v2/posts').addHeader("Authorization: Basic " + pass);
        reqHeaders.addHeader('Accept',"application/json");

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

function ConfirmPostContent(content, dialog){
	var content_keys = getKeysWithoutObjectKeysSupport(content);
	for(var i = 0; i < content_keys.length; i++){
		dialog[content_keys[i]].orientation = "column";
		dialog[content_keys[i]].text = content[content_keys[i]];
	}
	
	dialog.children[0].selection = 1;
}

function wpNewPost(dialog){
    var connObj = getUrlFromDialog(dialog); 
	var content_keys = getKeysWithoutObjectKeysSupport(connObj.requestBody);    
	for(var i = 0; i < content_keys.length; i++){
        switch(dialog[content_keys[i]].type){
            case "dropdownlist":
                connObj.requestBody[content_keys[i]] = dialog[content_keys[i]].selection;
                break;
            default:
                connObj.requestBody[content_keys[i]] = dialog[content_keys[i]].text;
                break;
        }
	}
    var request = setPostConnection(connObj.url, connObj.userName, connObj.token, connObj.requestBody);

    var res = request.request();
        status = Number(resultGet(res,"status"));
    if( status == 201){
        // var data = resultGet(res,"data");
        dialog.postId = res.toString().split('"id":')[1].split(',')[0];
        dialog.postToWPButton.hide();
        dialog.postExsits.show();
    }
}

function wpNewMedia(dialog, imageName, filePath, credit, caption){
    var connObj = getUrlFromDialog(dialog);
    alert("wp new media");
    alert(fileToBase64(filePath));

    // var currentImage = {
    //     name : imageName,
    //     content: fileToBase64(filePath)
    // }
    // var request = setPostConnection(connObj.url, connObj.userName, connObj.token, {
    //     "bla": "blue"
    // }).addHeader("Content-Disposition: form-data; filename=" + currentImage.name + '\n\n' + currentImage.content);
    // var res = request.request();
}

// Initializing
if( app.documents.length == 0){
	alert("You need an open document" );
}
var dialog = buildDialog();
dialog.show();



