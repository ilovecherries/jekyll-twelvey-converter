const jsdom = require("jsdom")
const { JSDOM } = jsdom

const { window } = new JSDOM('<body></body>', {
    url: "http://localhost",
})
const { document } = window
var Highlight = {lang:{}}

;(function(){
	//keywords that don't have an expression after them
	var keywords=[
		"BREAK","COMMON","CONTINUE","ELSE","END","ENDIF","REM","REPEAT","THEN","WEND",
	]
	var keywords_sb3=[
		"STOP"	
	]
	var keywords_sb4=[
		"OTHERWISE","ENDCASE","LOOP","ENDLOOP"
	]
	//keywords w/ expression after them (or other special thing)
	var argKeywords=[
		"CALL","DATA","DEC","DIM","ELSEIF","EXEC","FOR","GOSUB","GOTO","IF","INC","INPUT","LINPUT","NEXT","ON","OUT","PRINT","READ","RESTORE","RETURN","SWAP","UNTIL","USE","VAR","WHILE",
	]
	var argKeywords_sb4=[
		"CASE","WHEN","DEFOUT","TPRINT","CONST","ENUM",
	]
	var builtinFunctions=[
		"ABS","ACCEL","ACLS","ACOS","ARYOP","ASC","ASIN","ATAN","ATTR","BACKCOLOR","BEEP","BGMCHK","BGMCLEAR","BGMCONT","BGMPAUSE","BGMPLAY","BGMSET","BGMSETD","BGMSTOP","BGMVAR","BGMVOL","BIN$","BIQUAD","BQPARAM","BREPEAT","BUTTON","CEIL","CHKCALL","CHKCHR","CHKFILE","CHKLABEL","CHKMML","CHKVAR","CHR$","CLASSIFY","CLIPBOARD","CLS","COLOR","CONTROLLER","COPY","COS","COSH","DEG","DELETE","DIALOG","DTREAD","EFCSET","EFCWET","EXP","FADE","FADECHK","FFT","FFTWFN","FILES","FILL","FLOOR","FORMAT$","GBOX","GCIRCLE","GCLIP","GCLS","GCOLOR","GCOPY","GFILL","GLINE","GLOAD","GPAINT","GPSET","GPUTCHR","GSAVE","GTRI","GYROA","GYROSYNC","GYROV","HEX$","IFFT","INKEY$","INSTR","KEY","LEFT$","LEN","LOAD","LOCATE","LOG","MAX","MID$","MIN","OPTION","PCMCONT","PCMSTOP","PCMSTREAM","PCMVOL","POP","POW","PRGDEL","PRGEDIT","PRGGET$","PRGINS","PRGNAME$","PRGSET","PRGSIZE","PROJECT","PUSH","RAD","RANDOMIZE","RENAME","RGB","RIGHT$","RINGCOPY","RND","RNDF","ROUND","RSORT","SAVE","SCROLL","SGN","SHIFT","SIN","SINH","SNDSTOP","SORT","SPANIM","SPCHK","SPCHR","SPCLR","SPCOL","SPCOLOR","SPCOLVEC","SPDEF","SPFUNC","SPHIDE","SPHITINFO","SPHITRC","SPHITSP","SPHOME","SPLINK","SPOFS","SPPAGE","SPROT","SPSCALE","SPSET","SPSHOW","SPSTART","SPSTOP","SPUNLINK","SPUSED","SPVAR","SQR","STICK","STR$","SUBST$","TALK","TALKCHK","TALKSTOP","TAN","TANH","TMREAD","TOUCH","UNSHIFT","VAL","VSYNC","WAIT","WAVSET","WAVSETA","XSCREEN",
		//BIG+SB4
		"VIBRATE",
	]
	var builtinFunctions_sb3=[
		"BACKTRACE","BGANIM","BGCHK","BGCLIP","BGCLR","BGCOLOR","BGCOORD","BGCOPY","BGFILL","BGFUNC","BGGET","BGHIDE","BGHOME","BGLOAD","BGOFS","BGPAGE","BGPUT","BGROT","BGSAVE","BGSCALE","BGSCREEN","BGSHOW","BGSTART","BGSTOP","BGVAR","BGMPRG","BGMPRGA","DISPLAY","DLCOPEN","EFCOFF","EFCON","FONTDEF","GOFS","GPAGE","GPRIO","GSPOIT","MICDATA","MICSAVE","MICSTART","MICSTOP","MPEND","MPGET","MPNAME$","MPRECV","MPSEND","MPSET","MPSTART","MPSTAT","STICKEX","RGBREAD","SPCLIP","VISIBLE","WIDTH","XOFF","XON",
		//BIG
		"GPUTCHR16",
	]
	var builtinFunctions_sb4=[
		"PCMPOS","TYPEOF","ARRAY#","ARRAY%","ARRAY$","RESIZE","INSERT","REMOVE","INSPECT","DEFARGC","DEFARG","DEFOUTC","INT","FLOAT","LAST","FONTINFO","PERFBEGIN","PERFEND","SYSPARAM","METAEDIT","METALOAD","METASAVE","XCTRLSTYLE","MOUSE","MBUTTON","IRSTART","IRSTOP","IRSTATE","IRREAD","IRSPRITE","KEYBOARD","TCPIANO","TCHOUSE","TCROBOT","TCFISHING","TCBIKE","TCVISOR","LOADG","LOADV","SAVEG","SAVEV","ANIMDEF","TSCREEN","TPAGE","TCOLOR","TLAYER","TPUT","TFILL","THOME","TOFS","TROT","TSCALE","TSHOW","THIDE","TBLEND","TANIM","TSTOP","TSTART","TCHK","TVAR","TCOPY","TSAVE","TLOAD","TARRAY","TUPDATE","TFUNC","GTARGET","RGBF","HSV","GPGET","GARRAY","GUPDATE","GSAMPLE","SPLAYER","STOP","LAYER","LMATRIX","LFILTER","LCLIP","BEEPPIT","BEEPPAN","BEEPVOL","BEEPSTOP","BGMPITCH","BGMWET","EFCEN","SNDMSBAL","SNDMVOL","PRGSEEK","XSUBSCREEN","ENVSTAT","ENVTYPE","ENVLOAD","ENVSAVE","ENVINPUT$","ENVFOCUS","ENVPROJECT","ENVLOCATE","PUSHKEY","HELPGET","HELPINFO","UISTATE","UIMASK","UIPUSHCMPL","DATE$","TIME$","RESULT","CALLIDX","FREEMEM","MILLISEC","MAINCNT",
	]
	//SB3 only
	var systemVariables=[
		"CALLIDX","CSRX","CSRY","CSRZ","DATE$","ERRLINE","ERRNUM","ERRPRG","EXTFEATURE","FREEMEM","HARDWARE","MAINCNT","MICPOS","MICSIZE","MILLISEC","MPCOUNT","MPHOST","MPLOCAL","PCMPOS","PRGSLOT","RESULT","SYSBEEP","TABSTEP","TIME$","VERSION"
	]
	
	function isAlpha(c){
		return c>='A'&&c<='Z'||c>='a'&&c<='z'
	}
	
	function isDigit(c){
		return c>='0'&&c<='9'
	}
	
	//token types:
	//"linebreak"  - line break
	//"function"   - function call
	//"operator"   - operators, including word operators
	//"name"       - function name (after DEF keyword)
	//"equals"     - = assignment operator
	//"expr"       - ; or , or ( or [
	//"noexpr"     - : or ) or ]
	//"whitespace" - space or tab
	//"variable"   - variable
	//"number"     - number literal (including TRUE/FALSE)
	//"def"        - DEF keyword
	//"string"     - strings (including label strings)
	//"word"       - unknown word (resolved to "function", "operator", "name", "variable", "def", "argkeyword", or "keyword")
	//"label"      - unknown label/labelstring (resolved to "label" or "string"), or label (not label string)
	//"argkeyword" - keyword with expression after it
	//"keyword"    - keyword that doesn't have an expression after it
	
	function isInExpr(type){
		return type=="argkeyword"||type=="function"||type=="operator"||type=="name"||type=="equals"||type=="expr"
	}
	
	function main(code, callback, sb4){
		var i=-1,c
		function next(){
			i++
			c=code.charAt(i)
		}

		function jump(pos){
			i=pos-1
			next()
		}
		
		var prev=0
		var prevType="start"
		
		//=================//
		// Process a token //
		//=================//
		function push(type, cssType){
			var word=code.substring(prev,i)
			prev=i
			//Check words
			if(type=="word"){
				var upper=word.toUpperCase()
				//True/False
				if(sb4!=true && (upper=="TRUE"||upper=="FALSE")){
					type="number"
					cssType="true-false number"
				//operators
				}else if(upper=="DIV"||upper=="MOD"||upper=="AND"||upper=="OR"||upper=="XOR"||upper=="NOT"){
					type="operator"
					cssType="word-operator operator"
				//DEF
				}else if(upper=="DEF"){
					type="def"
					cssType="def keyword"
				//T? TPRINT
				}else if(sb4!=false && (upper=="T" && c=='?')){
					word+=c
					next()
					prev=i
					type="keyword"
					cssType="keyword"
				//keywords without an expression after them
				}else if(keywords.indexOf(upper)>=0 || sb4==false && keywords_sb3.indexOf(upper)>=0 || sb4!=false && keywords_sb4.indexOf(upper)>=0){
					type="keyword"
					cssType="keyword"
				//keywords w/ and expression after
				}else if(argKeywords.indexOf(upper)>=0 || sb4!=false && argKeywords_sb4.indexOf(upper)>=0){
					type="argkeyword"
					cssType="keyword"
				//User-defined function name
				}else if(prevType=="def"){
					type="name"
					cssType="name"
				//Variable, function, TO/STEP, etc.
				}else{
					var fPos=i
					while(c==' ' || c=='\t')
						next()
					var isFunc=false
					if(isInExpr(prevType)){
						if(c=="(")
							isFunc=true
					}else{
						isFunc=true
						if(c=="["){
							isFunc=false
						}else if(c=="="){
							next()
							if(c!="=")
								isFunc=false
						}
					}
					if(isFunc){
						type="function"
						if(builtinFunctions.indexOf(upper)!=-1 || sb4!=true && builtinFunctions_sb3.indexOf(upper)!=-1 || sb4!=false && builtinFunctions_sb4.indexOf(upper)!=-1)
							cssType="statement function"
						else if(upper=="TO" || upper=="STEP")
							cssType="to-step keyword"
						else
							cssType="statement"
					}else{
						type="variable"
						if(sb4!=true && systemVariables.indexOf(upper)!=-1)
							cssType="variable function"
						else
							cssType="variable"
					}
					jump(fPos)
				}
			//Check labels
			}else if(type=="label"){
				if(isInExpr(prevType)){
					type="string"
					cssType="label-string string"
				}else{
					cssType="label"
				}
			//Use type as csstype if not specified
			}else{
				if(cssType==undefined)
					cssType=type
			}
			//pass to callback function
			callback(word,cssType)
			//store previous non-whitespace token type
			if(type!="whitespace")
				prevType=type
		}
		
		next()
		
		//loop until the end of the string
		while(c){
			//
			//keywords, functions, variables
			//
			if(isAlpha(c)||c=='_'){
				next()
				//read name
				while(isAlpha(c)||isDigit(c)||c=='_')
					next()
				//read type suffix
				if(c=='#'||c=='%'||c=='$')
					next()
				//push word type
				push("word")
			//
			//numbers
			//
			}else if(isDigit(c)||c=='.'){
				//if digit was found, read all of them
				while(isDigit(c))
					next()
				//if there's a decimal point
				if(c=='.'){
					next()
					//read digits after
					if(isDigit(c)){
						next()
						while(isDigit(c))
							next()
					}else{
						//if GOTO is available: GOTO @skip_e
						if(c=='#')
							next()
						push("number")
						continue
					}
				}
				//E notation
				if(c=='E'||c=='e'){
					var ePos=i
					next()
					//check for + or -
					if(c=='+'||c=='-')
						next()
					//read digits
					if(isDigit(c)){
						next()
						while(isDigit(c))
							next()
					//no digits (invalid)
					}else{
						jump(ePos)
						push()
						continue
					}
				}
				//(if GOTO is available: @skip_e)
				//read float suffix
				if(c=='#')
					next()
				push("number")
			//
			//strings
			//
			}else switch(c){
			case '"':
				next()
				//read characters until another quote, line ending, or end of input
				while(c && c!='"' && c!='\n' && c!='\r')
					next()
				//read closing quote
				if(c=='"')
					next()
				push("string")
			//
			//comments
			//
			break;case '\'':
				next()
				//read characters until line ending or end of input
				while(c && c!='\n' && c!='\r')
					next()
				push("comment")
			//
			//logical AND, hexadecimal, binary
			//
			break;case '&':
				next()
				switch(c){
				//logical and
				case '&':
					next()
					push("operator")
				//hexadecimal
				break;case 'H':case 'h':
					var hPos=i
					next()
					//read hexadecimal digits
					if(isDigit(c)||c>='A'&&c<='F'||c>='a'&&c<='f'|| (c=='_'&&sb4!=false)){
						next()
						while(isDigit(c)||c>='A'&&c<='F'||c>='a'&&c<='f'|| (c=='_'&&sb4!=false))
							next()
						push("number")
					}else{
						jump(hPos)
						push()
					}
				//binary
				break;case 'B':case 'b':
					var bPos=i
					next()
					//read hexadecimal digits
					if(c=='0'||c=='1'|| (c=='_'&&sb4!=false)){
						next()
						while(c=='0'||c=='1'|| (c=='_'&&sb4!=false))
							next()
						push("number")
					}else{
						jump(bPos)
						push()
					}
				//invalid &
				break;default:
					push()
				}
			//
			//labels
			//
			break;case '@':
				next()
				//read name
				while(isDigit(c)||isAlpha(c)||c=='_')
					next()
				//ok
				push("label")
			//
			//constants
			//
			break;case '#':
				next()
				//read name
				if(isDigit(c)||isAlpha(c)||c=='_'){
					next()
					while(isDigit(c)||isAlpha(c)||c=='_')
						next()
					//read type suffix
					if(c=='#'||c=='%'||c=='$')
						next()
					push("number","constant number")
				}else{
					//read type suffix
					if(c=='#'||c=='%'||c=='$'){
						next()
						push("number","constant number")
					}else{
						push()
					}
				}
			//
			//logical or
			//
			break;case '|':
				next()
				//logical or
				if(c=='|'){
					next()
					push("operator")
				//invalid
				}else{
					push()
				}
			//
			//less than, less than or equal, left shift
			//
			break;case '<':
				next()
				if(c=='='||c=='<') //<= <<
					next()
				push("operator")
			//
			//greater than, greater than or equal, right shift
			//
			break;case '>':
				next()
				if(c=='='||c=='>') //>= >>
					next()
				push("operator")
			//
			//equal, equal more
			//
			break;case '=':
				next()
				//==
				if(c=='='){
					next()
					push("operator")
				}else{
					push("equals")
				}
			//
			//logical not, not equal
			//
			break;case '!':
				next()
				if(c=='=') // !=
					next()
				push("operator")
			//
			//add, subtract, multiply, divide
			//
			break;case '+':case '-':case '*':case '/':
				next()
				push("operator")
			//
			// Line continuation (SB4)
			//
			break;case '\\':
				next()
				if (sb4==false) {
					push(undefined,false)
				} else {
					while (c && c!='\n' && c!='\r')
						next()
					next()
					push("whitespace")
				}
			
			//
			//other
			//
			
			break;case ';':case ',':case '[':case '(':
				next()
				push("expr",false)
			break;case '\n':
				next()
				push("linebreak",false)
			break;case ":":case ")":case "]":
				next()
				push("noexpr",false)
			break;case " ":case "\t":
				next()
				push("whitespace",false)
			break;case '?':
				next()
				push("argkeyword","question keyword")
			break;default:
				next()
				push(undefined,false)
			}
		}
		push("eof")
	}

	Highlight.lang.sb = function(code, callback) { return main(code, callback) }
	Highlight.lang.sb3 = function(code, callback) { return main(code, callback, false) }
	Highlight.lang.sb4 = function(code, callback) { return main(code, callback, true) }
})()

// todo: optimize this so longer sequences of unhighlighted chars are handled more efficiently

Highlight.none = function(code, callback) {
	callback(code)
}

Highlight.cLike = function(code, callback) {
	var i=-1,c
	var prev=0
	
	function next(){
		i++
		c=code.charAt(i)
	}
	function push(type) {
		var word=code.substring(prev,i)
		prev=i
		if (type=='word') {
			if (['if','while','for','switch','case','return','do','break','continue','else'].indexOf(word) >= 0)
				type = 'keyword'
			else
				type = 'variable'
		}
		callback(word, type)
	}
	
	next()
	while(c){
		if (c=="/") {
			next()
			if (c=="/") {
				next()
				while (c && c!="\n")
					next()
				push('comment')
			} else {
				push()
			}
		} else if (c=='"') {
			next()
			while (c && c!="\n" && c!='"')
				next()
			if (c=='"')
				next()
			push('string')
		} else if (c=="'") {
			next()
			while (c && c!="\n" && c!="'")
				next()
			if (c=="'")
				next()
			push('string')
		} else if (isAlpha(c) || c=="_" || c=="$") {
			next()
			while (isAlphaNum(c) || c=="_" || c=="$")
				next()
			push('word')
		} else {
			next()
			push()
		}
	}

	function isAlpha(c) {
		return c>="A" && c<="Z" || c>="a" && c<="z"
	}
	function isAlphaNum(c) {
		return c>="A" && c<="Z" || c>="a" && c<="z" || c>="0" && c<="9"
	}
}

// list of every programming language
;['c','js','javascript'].forEach(function(lang){
	Highlight.lang[lang] = Highlight.cLike
})

Highlight.highlight = function(text, lang) {
	if (lang)
		var hl = Highlight.lang[lang.toLowerCase()]
	
	hl = hl || Highlight.none
	
	var doc = document.createDocumentFragment()
	
	var prev = NaN
	var buffer = ""
	function callback(word, cls) {
		if (cls == prev) {
			buffer += word
			return
		}
		var element = document.createElement('span')
		element.textContent = buffer
		if (prev)
			element.className = prev
		doc.appendChild(element)
		prev = cls
		buffer = word
	}
	
	hl(text, callback)
	callback("", NaN)
	
	return doc
}
// TODO:
// the system for handling resizes (for autoscroll) is a big mess
// maybe try creating a custom event that gets triggered whenever
// an element's height will be changed (when clicking an image, activating a youtube player, etc.)
// and listen for it on the root element externally
// see: document.createEvent

var Parse = {
	lang:{}
}

// so normally our path structure will look like
// url#path?query#fragment
// with #s in the path and query escaped with %
// however, some browsers escape duplicate #s automatically, so this has to be dealt with somehow
// I'm not sure of a good way which still allows # to be used in the path+query, though
// may need to use a different character...

Parse.BLOCKS = {
	text: {},
	lineBreak: {},
	line: {block: true}, // now we can remove the hack
	invalid: {},
	code: {block:true},
	icode: {},
	audio: {block:true},
	video: {block:true},
	youtube: {block:true},
	bg: {},
	root: {},
	bold: {},
	italic: {},
	underline: {},
	strikethrough: {},
	heading: {block:true},
	quote: {block:true},
	list: {block:true},
	item: {block:true},
	simpleLink: {},
	customLink: {},
	table: {block:true},
	row: {block:true},//not sure, only used internally so block may not matter
	cell: {},
	image: {block:true},
	error: {block:true},
	align: {block:true},
	superscript: {},
	subscript: {},
	anchor: {},
	spoiler: {block:true},
	ruby: {},
	bg: {},
}

;(function(){
	/***********
	 ** STATE **
    ***********/
	var c,i,cache = null,code
	var editorCache = {video:{},audio:{},youtube:{}}
	var skipNextLineBreak
	var textBuffer
	var curr, output
	var openBlocks
	var stack
	var startOfLine
	var leadingSpaces
	var blocks
	function scan(){}

	function init(scanFunc, text) {
		scan = scanFunc
		code = text
		if (cache)
			for (type in cache)
				for (arg in cache[type])
					cache[type][arg].forEach(function(x){
						x.used = false
					})
		blocks = options//myBlocks
		openBlocks = 0
		leadingSpaces = 0
		startOfLine = true
		skipNextLineBreak = false
		textBuffer = ""
		output = curr = options.root()
		stack = [{node:curr, type:'root'}]
		stack.top = function() {
			return stack[stack.length-1]
		}
		restore(0)
	}
	// move to pos
	function restore(pos) {
		i = pos-1
		scan()
	}

	//try to read a char
	function eatChar(chr) {
		if (c == chr) {
			scan()
			return true
		}
	}

	function matchNext(str) {
		return code.substr(i, str.length) == str
	}
	
	// read a url
	// if `allow` is true, url is only ended by end of file or ]] or ][ (TODO)
	function readUrl(allow) {
		var start = i
		var depth = 0
		if (allow)
			while (c) {
				if (eatChar("[")) {
					depth++
				} else if (c=="]") {
					depth--
					if (depth<0)
						break
					scan()
				} else
					scan()
			}
		else {
			while (c) {
				if ((/[-\w\$\.+!*',;/\?:@=&#%~]/).test(c)) {
					scan()
				} else if (eatChar("(")) {
					depth++
				} else if (c==")") {
					depth--
					if (depth < 0)
						break
					scan()
				} else
					break
			}
			var last = code[i-1]
			if (/[,\.?!:]/.test(last)) {
				i-=2
				scan()
			}
		}
		return code.substring(start, i)
	}
	
	/***********
    ** stack **
    ***********/
	function stackContains(type) {
		for (var i=0; i<stack.length; i++) {
			if (stack[i].type == type) {
				return true
			}
		}
		return false
	}
	function top_is(type) {
		var top = stack.top()
		return top && top.type == type
	}
	
	/****************
    ** outputting **
    ****************/
	function endBlock() {
		flushText()
		var item = stack.pop()
		if (item.node && item.isBlock)
			skipNextLineBreak = true

		if (stack.length) {
			var i=stack.length-1
			// this skips {} fake nodes
			// it will always find at least the root <div> element I hope
			while (!stack[i].node){
				i--
			}
			curr = stack[i].node
			openBlocks--
		} else {
			curr = null
		}
	}
	


	// output contents of text buffer
	function flushText() {
		if (textBuffer) {
			options.append(curr, options.text(textBuffer))
			textBuffer = ""
		}
	}

	// add linebreak to output
	// todo: skipping linebreaks should skip / *\n? */ (spaces before/after!)
	// so like [h1]test[/h1] [h2]test[/h2]
	// no extra linebreak there
	function addLineBreak() {
		if (skipNextLineBreak) {
			skipNextLineBreak = false
		} else {
			flushText()
			addBlock('lineBreak')
		}
	}

	// add text to output (buffered)
	function addText(text) {
		if (text) {
			textBuffer += text
			skipNextLineBreak = false
		}
	}
	
	// call at end of parsing to flush output
	function endAll() {
		flushText()
		while (stack.length)
			endBlock()
	}
	
	/*****************
    ** cache stuff **
    *****************/
	function findUnusedCached(cache, type, arg) {
		var list = cache[type][arg]
		if (!list)
			return null
		for (var i=0;i<list.length;i++) {
			if (!list[i].used)
				return list[i]
		}
		return null
	}
	
	// add simple block with no children
	function addBlock(type, arg, ext1, ext2) {
		flushText()
		var node = tryGetCached(cache, type, arg && arg[""], function() {
			return blocks[type](arg, ext1, ext2)
		})
		options.append(curr, node)
		if (Parse.BLOCKS[type].block)
			skipNextLineBreak = true
		else
			skipNextLineBreak = false
	}
	
	function startBlock(type, data, arg) {
		data.type = type
		if (type) {
			data.isBlock = Parse.BLOCKS[type].block
			openBlocks++
			if (openBlocks > options.maxDepth)
				throw "too deep nestted blocks"
			var node = tryGetCached(cache, type, arg && arg[""], function() {
				return blocks[type](arg)
			})
			data.node = node
			if (data.isBlock)
				skipNextLineBreak = true
			
			flushText()
			options.append(curr, node)
			curr = node
		}
		stack.push(data)
		return data
	}
	// check for /\b(http://|https://|sbs:)/ basically
	function isUrlStart() {
		if (code[i-1] && /\w/.test(code[i-1]))
			return false
		return matchNext("http://") || matchNext("https://") || matchNext("sbs:")
	}
	
	// try to get a node from cache.
	// will get nodes where `type` and `arg` matches
	// if not found, returns make(), and adds to cache
	function tryGetCached(cache, type, arg, make) {
		var node
		if (cache && type && cache[type]) {
			var item = findUnusedCached(cache, type, arg)
			if (item) {
				item.used = true
				node = item.node
			}
		}
		if (!node && type) {
			node = make()
			if (cache && cache[type]) {
				if (!cache[type][arg])
					cache[type][arg] = []
				cache[type][arg].push({node:node, used:true})
			}
		}
		return node
	}

	var options = Parse.options
	
	Parse.lang['html'] = function(codeInput) {
		var x = document.createElement('iframe')
		x.sandbox = "allow-same-origin"
		if (x.sandbox instanceof DOMTokenList) {
			x.src = "javascript:undefined"
			x.srcdoc = "<style>body{margin:0;}</style> "+codeInput
			x.onload = function() {
				this.style.height = this.contentWindow.document.documentElement.offsetHeight+'px';
			}
		}
		return x
	}
	
	Parse.lang['12y'] = function(codeInput) {
		// so what happens here is
		// when a video needs to be generated
		// first, check the cache. if it exists there, insert it
		// (remember that a node can only exist in one place in the DOM though)
		// now, if the video needs to be created, and preview mode is enabled,
		// a place holder is generated (and not stored in the cache)
		// if preview is disabled (and cache is passed), the video is generated
		// and stored in the cache, to be reused later
		
		// in the editor, this should be called normally with preview mode enabled
		// then maybe after a delay of no typing, call it with preview off,
		// to generate any new videos
		// or don't use preview at all! maybe it's fine!

		init(function() {
			if (c == "\n" || !c)
				lineStart()
			else if (c != " ")
				startOfLine = false
			else if (startOfLine)
				leadingSpaces++
			i++
			c = code.charAt(i)
		}, codeInput)
		
		var tags = {
			spoiler: "spoiler",
			ruby: "ruby",
			align: "align",
			sub: "subscript",
			sup: "superscript",
			anchor: "anchor",
			bg: "bg"
		}
		
		while (c) {
			if (eatChar("\n")) {
				endLine()
				//==========
				// \ escape
			} else if (eatChar("\\")) {
				if (c == "\n") {
					flushText()
					addBlock('lineBreak')
				} else
					addText(c)
				scan()
				//===============
				// { group start (why did I call these "groups"?)
			} else if (c == "{") {
				readEnv()
				//=============
				// } group end
			} else if (eatChar("}")) {
				if (stackContains(null)) {
					closeAll(false)
				} else {
					addText("}")
				}
				//================
				// * heading/bold
			} else if (c == "*") {
				if (startOfLine && (code[i+1] == "*" || code[i+1] == " ")) {
					var headingLevel = 0
					while (eatChar("*"))
						headingLevel++
					if (headingLevel > 3)
						headingLevel = 3
					
					if (eatChar(" "))
						startBlock('heading', {}, headingLevel)
					else
						addMulti('*', headingLevel)
				} else {
					doMarkup('bold', options.bold)
				}
			} else if (c == "/") {
				doMarkup('italic', options.italic)
			} else if (c == "_") {
				doMarkup('underline', options.underline)
			} else if (c == "~") {
				doMarkup('strikethrough', options.strikethrough)
				//============
				// >... quote
			} else if (startOfLine && eatChar(">")) {
				// todo: maybe >text should be a quote without author... 
				// need to add a way to add information to quotes:
				// - user ID
				// - post ID
				/*start = i
				while (eatChar(" "))
					
				while (c && !char_in(c, " \n{:"))
					scan()
				var name = code.substring(start, i).trim()
				eatChar(":")
				while (eatChar(" "))*/
				
				startBlock('quote', {}, {/*"":name*/})
				//==============
				// -... list/hr
			} else if (startOfLine && eatChar("-")) {
				textBuffer = "" //hack:
				//----------
				// --... hr
				if (eatChar("-")) {
					var count = 2
					while (eatChar("-"))
						count++
					//-------------
					// ---<EOL> hr
					if (c == "\n" || !c) { //this is kind of bad
						addBlock('line')
						//----------
						// ---... normal text
					} else {
						addMulti("-", count)
					}
					//------------
					// - ... list
				} else if (eatChar(" ")) {
					startBlock('list', {level:leadingSpaces}, {})
					startBlock('item', {level:leadingSpaces})
					//---------------
					// - normal char
				} else
					addText("-")
				//==========================
				// ] end link if inside one
			} else if (c == "]" && stack.top().inBrackets){ //this might break if it assumes .top() exists. needs more testing
				scan()
				if (stack.top().big) {
					if (eatChar("]"))
						endBlock()
					else
						addText("]")
				} else
					endBlock()
				//============
				// |... table
			} else if (c == "|") {
				var top = stack.top()
				// continuation
				if (top.type == 'cell') {
					scan()
					var row = top.row
					var table = top.row.table
					var eaten = eatChar("\n")
					//--------------
					// | | next row
					if (eaten && eatChar("|")) {
						// number of cells in first row
						// determines number of columns in table
						if (table.columns == null)
							table.columns = row.cells
						// end blocks
						endBlock() //cell
						if (top_is('row')) //always
							endBlock()
						// start row
						// calculate number of cells in row which will be
						// already filled due to previous row-spanning cells
						var cells = 0
						table.rowspans = table.rowspans.map(function(span){
							cells++
							return span-1
						}).filter(function(span){return span > 0})
						var row = startBlock('row', {table:table, cells:cells})
						row.header = eatChar("*")
						// start cell
						startCell(row)
						//--------------------------
						// | next cell or table end
					} else {
						row.cells++
						textBuffer = textBuffer.replace(/ *$/,"") //strip trailing spaces (TODO: allow \<space>)
						// end of table
						// table ends when number of cells in current row = number of cells in first row
						// single-row tables are not easily possible ..
						// TODO: fix single row tables
						if (table.columns != null && row.cells > table.columns) {
							endBlock() //end cell
							if (top_is('row')) //always
								endBlock() //row
							if (top_is('table')) //always
								endBlock() //table
							if (eaten)
								addLineBreak()
						} else { // next cell
							endBlock() //cell
							startCell(row)
						}
					}
					// start of new table (must be at beginning of line)
				} else if (startOfLine) {
					scan()
					table = startBlock('table', {
						columns: null,
						rowspans: []
					}, {})
					row = startBlock('row', {
						table: table,
						cells: 0
					})
					row.header = eatChar("*")
					startCell(row)
				} else {
					scan()
					addText("|")
				}
				//===========
				// `... code
			} else if (eatChar("`")) {
				//---------------
				// ``...
				if (eatChar("`")) {
					//----------------
					// ``` code block
					if (eatChar("`")) {
						// read lang name
						start = i
						while (c && c!="\n" && c!="`")
							scan()
						//treat first line as language name, if it matches the pattern. otherwise it's code
						var language = code.substring(start, i)
						var eaten = false
						if (/^\s*\w*\s*$/.test(language)) {
							language = language.trim().toLowerCase()
							eaten = eatChar("\n")
							start = i
						}
						
						i = code.indexOf("```", i)
						addBlock('code', {"": language}, code.substring(start, i!=-1 ? i : code.length))
						skipNextLineBreak = eaten
						if (i != -1) {
							restore(i + 3)
						} else {
							restore(code.length)
						}
						//------------
						// `` invalid
					} else {
						addText("``")
					}
					// --------------
					// ` inline code
				} else {
					start = i
					var codeText = ""
					while (c) {
						if (c=="`") {
							if (code[i+1] == "`") {
								if (i == start+1 && codeText[0] == " ")
									codeText = codeText.substr(1)
								scan()
							} else
								break
						}
						codeText += c
						scan()
					}
					addBlock('icode',{},codeText)
					scan()
				}
				//
				//================
				// link
			} else if (readLink()) {
				//
				//=============
				// normal char
			} else {
				addText(c)
				scan()
			}
		}
		// END
		endAll()
		return output.node

		function endAll() {
			flushText()
			while (stack.length) {
				/*var top = stack.top()
				if (top.type == "bold") {
					options.kill(curr.node, options.text("*").node)
				} else if (top.type == "italic") {
					options.kill(curr.node, options.text("/").node)
				}*/
				endBlock()
			}
		}
		
		// ###################################
		
		function readBracketedLink(embed) {
			if (eatChar("[")) {
				if (eatChar("[")) {
					// read url:
					var start = i
					var after = false
					var url = readUrl(true)
					if (eatChar("]")) {
						if (eatChar("]")){
						}else if (eatChar("["))
							after = true
					}
					if (embed) {
						var type = urlType(url)
						var altText = null
						if (after) {
							altText = ""
							while (c) { //TODO: should this break on newline too?
								if (c==']' && code[i+1]==']') { //messy
									scan()
									scan()
									break
								}
								eatChar("\\")
								altText += c
								scan()
							}
						}
						addBlock(type, {"":url}, altText)
					} else {
						if (after)
							startBlock('customLink', {big: true, inBrackets: true}, {"":url})
						else
							addBlock('simpleLink', {"":url})
					}
					return true
				} else {
					addText("[")
				}
			}
			return false
		}
		
		function readEnv() {
			if (!eatChar("{"))
				return false
			startBlock(null, {})
			lineStart()
			
			var start = i
			if (eatChar("#")){
				var name = readTagName()
				var props = readProps()
				// todo: make this better lol
				var func = tags[name]
				if (func && !(name=="spoiler" && stackContains("spoiler"))) {
					startBlock(func, {}, props)
				} else {
					addBlock('invalid', code.substring(start, i), "invalid tag")
				}
				/*if (displayBlock({type:name}))
				  skipNextLineBreak = true //what does this even do?*/
			}
			lineStart()
			//	eatChar("\n")
			return true
		}
		
		// read table cell properties and start cell block, and eat whitespace
		// assumed to be called when pointing to char after |
		function startCell(row) {
			var props = {}
			if (eatChar("#"))
				Object.assign(props, readProps())
			
			if (props.rs)
				row.table.rowspans.push(props.rs-1)
			if (props.cs)
				row.cells += props.cs-1
			
			if (row.header)
				props.h = true
			
			startBlock('cell', {row: row}, props)
			while (eatChar(" ")){
			}
		}

		// split string on first occurance
		function split1(string, sep) {
			var n = string.indexOf(sep)
			if (n == -1)
				return [string, null]
			else
				return [string.substr(0,n), string.substr(n+sep.length)]
		}
		
		function readTagName() {
			var start = i
			while (c>="a" && c<="z") {
				scan()
			}
			if (i > start)
				return code.substring(start, i)
		}
		
		// read properties key=value,key=value... ended by a space or \n or } or {
		// =value is optional and defaults to `true`
		function readProps() {
			var start = i
			var end = code.indexOf(" ", i)
			if (end < 0)
				end = code.length
			var end2 = code.indexOf("\n", i)
			if (end2 >= 0 && end2 < end)
				end = end2
			end2 = code.indexOf("}", i)
			if (end2 >= 0 && end2 < end)
				end = end2
			end2 = code.indexOf("{", i)
			if (end2 >= 0 && end2 < end)
				end = end2
			
			restore(end)
			eatChar(" ")
			
			var propst = code.substring(start, end)
			var props = {}
			propst.split(",").forEach(function(x){
				var pair = split1(x, "=")
				if (pair[1] == null)
					pair[1] = true
				props[pair[0]] = pair[1]
			})
			return props
		}

		// string.repeat doesn't exist
		function addMulti(text, count) {
			while (count --> 0)
				addText(text)
		}

		function readLink() {
			var embed = eatChar("!")
			if (readBracketedLink(embed) || readPlainLink(embed))
				return true
			else if (embed) {
				addText("!")
				return true
				//lesson: if anything is eaten, you must return true if it's in the top level if switch block
			}
		}

		function readPlainLink(embed) {
			if (isUrlStart()) {
				var url = readUrl()
				var after = eatChar("[")
				
				if (embed) {
					var type = urlType(url)
					var altText = null
					if (after) {
						altText = ""
						while (c && c!=']' && c!="\n") {
							eatChar("\\")
							altText += c
							scan()
						}
						scan()
					}
					addBlock(type, {"":url}, altText)
				} else {
					if (after)
						startBlock('customLink', {inBrackets: true}, {"":url})
					else
						addBlock('simpleLink', {"":url})
				}
				return true
			}
		}
	
		// closeAll(true) - called at end of document
		// closeAll(false) - called at end of {} block
		function closeAll(force) {
			while(stack.length) {
				var top = stack.top()
				if (top.type == 'root') {
					break
				}
				if (!force && top.type == null) {
					endBlock()
					break
				}
				endBlock()
			}
		}

		// called at the end of a line (unescaped newline)
		function endLine() {
			while (1) {
				var top = stack.top()
				if (top.type == 'heading' || top.type == 'quote') {
					endBlock()
				} else if (top.type == 'item') {
					if (top.type == 'item')
						endBlock()
					var indent = 0
					while (eatChar(" "))
						indent++
					// OPTION 1:
					// no next item; end list
					if (c != "-") {
						while (top_is('list')) //should ALWAYS happen at least once
							endBlock()
						addMulti(" ", indent)
					} else {
						scan()
						while (eatChar(" ")) {}
						// OPTION 2:
						// next item has same indent level; add item to list
						if (indent == top.level) {
							startBlock('item', {level: indent})
							// OPTION 3:
							// next item has larger indent; start nested list	
						} else if (indent > top.level) {
							startBlock('list', {level: indent}, {})
							startBlock('item', {level: indent}) // then made the first item of the new list
							// OPTION 4:
							// next item has less indent; try to exist 1 or more layers of nested lists
							// if this fails, fall back to just creating a new item in the current list
						} else {
							// TODO: currently this will just fail completely 
							while(1) {
								top = stack.top()
								if (top && top.type == 'list') {
									if (top.level <= indent) {
										break
									} else {
										endBlock()
									}
								} else {
									// no suitable list was found :(
									// so just create a new one
									startBlock('list', {level: indent}, {})
									break
								}
							}
							startBlock('item', {level: indent})
						}
						break //really?
					}
				} else {
					addLineBreak()
					break
				}
			}
		}

		// audio, video, image, youtube
		//todo: improve this lol
		function urlType(url) {
			if (/(\.mp3(?!\w)|\.ogg(?!\w)|\.wav(?!\w)|#audio$)/.test(url))
				return "audio"
			if (/(\.mp4(?!\w)|\.mkv(?!\w)|\.mov(?!\w)|#video$)/.test(url))
				return "video"
			if (/^(?:https?:\/\/)?(?:www\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w\-_]+)\&?/.test(url))
				return "youtube"
			return "image"
		}

		// common code for all text styling tags (bold etc.)
		function doMarkup(type, create) {
			var symbol = c
			scan()
			if (canStartMarkup(type)) {
				startBlock(type, {})
			} else if (canEndMarkup(type)) {
				endBlock()
			} else {
				addText(symbol)
			}
		}
		// todo: maybe have support for non-ASCII punctuation/whitespace?
		function canStartMarkup(type) {
			return (
				(!code[i-2] || char_in(code[i-2], " \t\n({'\"")) && //prev char is one of these (or start of text)
				(c && !char_in(c, " \t\n,'\"")) && //next char is not one of these
				!stackContains(type)
			)
		}
		function canEndMarkup(type) {
			return (
				top_is(type) && //there is an item to close
				!char_in(code[i-2], " \t\n,'\"") && //prev char is not one of these
				(!c || char_in(c, " \t\n-.,:!?')}\"")) //next char is one of these (or end of text)
			)
		}
		function char_in(chr, list) {
			return chr && list.indexOf(chr) != -1
		}
		
		function lineStart() {
			startOfLine = true
			leadingSpaces = 0
		}
		
	}

	Parse.lang.bbcode = function(codeArg) {
		var noNesting = {
			spoiler:true
		}
		// this translates bbcode tag names into
		// the standard block names, + arg, + contents for special blocks
		// to be passed to startblock or functions to addblock
		var blockNames = {'b':true,'i':true,'u':true,'s':true,'sup':true,'sub':true,'table':true,'tr':true,'td':true,'align':true,'list':true,'spoiler':true,'quote':true,'anchor':true,'item':true,'h1':true,'h2':true,'h3':true,'th':true,'code':2,'url':2,'youtube':2,'audio':2,'video':2,'img':2,ruby:true}
		function blockTranslate(name, args, contents) {
			// direct translations:
			var name2 = {
				b: 'bold',
				i: 'italic',
				u: 'underline',
				s: 'strikethrough',
				sup: 'superscript',
				sub: 'subscript',
				table: 'table',
				tr: 'row',
				td: 'cell',
				align: 'align',
				list: 'list',
				spoiler: 'spoiler',
				ruby: 'ruby',
				quote: 'quote',
				anchor: 'anchor',
				item: 'item',
			}[name]
			if (name2)
				return [name2, args, contents]
			// other simple translations
			if (name == 'h1')
				return ['heading', 1]
			if (name == 'h2')
				return ['heading', 2]
			if (name == 'h3')
				return ['heading', 3]
			if (name == 'th')
				return ['cell', Object.assign({h:true}, args)]
			
			if (name == 'code') {
				var inline = args[""] == 'inline'
				args[""] = args.lang
				if (inline)
					return ['icode', args, contents]
				if (contents[0]=="\n")
					contents = contents.substr(1)
				return ['code', args, contents]
			}

			//todo: maybe these should have args mapped over uh
			if (name == 'url') {
				if (contents != undefined)
					return ['simpleLink', {"":contents}]
				else
					return ['customLink', args]
			}
			
			if (name == 'youtube')
				return ['youtube', {"":contents}, args.alt]
			if (name == 'audio')
				return ['audio', {"":contents}, args.alt]
			if (name == 'video')
				return ['video', {"":contents}, args.alt]
			if (name == 'img')
				return ['image', {"":contents}, args.alt]
		}
		
		init(function() {
			i++
			c = code.charAt(i)
		}, codeArg)
		
		var point = 0
		
		while (c) {
			//===========
			// [... tag?
			if (eatChar("[")) {
				point = i-1
				// [/... end tag?
				if(eatChar("/")) {
					var name = readTagName()
					// invalid end tag
					if (!eatChar("]") || !name) {
						cancel()
					// valid end tag
					} else {
						// end last item in lists (mostly unnecessary now with greedy closing)
						if (name == "list" && stack.top().type == "item")
							endBlock(point)
						if (greedyCloseTag(name)) {
							// eat whitespace between table cells
							if (name == 'td' || name == 'th' || name == 'tr')
								while(eatChar(' ')||eatChar('\n')){
								}
						} else {
							// ignore invalid block
							//addBlock('invalid', code.substring(point, i), "unexpected closing tag")
						}
					}
				// [... start tag?
				} else {
					var name = readTagName()
					if (!name || !blockNames[name]) {
						// special case [*] list item
						if (eatChar("*") && eatChar("]")) {
							if (stack.top().type == "item")
								endBlock(point)
							var top = stack.top()
							if (top.type == "list")
								startBlock('item', {bbcode:'item'}, {})
							else
								cancel()
						} else
							cancel()
					} else {
						// [tag=...
						var arg = true, args = {}
						if (eatChar("=")) {
							var start=i
							if (eatChar('"')) {
								start++
								while (c && c!='"')
									scan()
								if (c == '"') {
									scan()
									arg = code.substring(start, i-1)
								}
							} else {
								while (c && c!="]" && c!=" ")
									scan()
								if (c == "]" || c == " ")
									arg = code.substring(start, i)
							}
						}
						if (eatChar(" ")) {
							args = readArgList() || {}
						}
						if (arg !== true)
							args[""] = arg
						if (eatChar("]")) {
							if (blockNames[name]==2 && !(name=="url" && arg!==true)) {
								var endTag = "[/"+name+"]"
								var end = code.indexOf(endTag, i)
								if (end < 0)
									cancel()
								else {
									var contents = code.substring(i, end)
									restore(end + endTag.length)
									
									var tx = blockTranslate(name, args, contents)
									addBlock(tx[0], tx[1], tx[2])
								}
							} else if (name!="item" && blockNames[name] && !(noNesting[name] && stackContains(name))) {
								if (name == 'tr' || name == 'table')
									while(eatChar(' ')||eatChar('\n')){
									}
								var tx = blockTranslate(name, args)
								startBlock(tx[0], {bbcode:name}, tx[1])
							} else
								addBlock('invalid', code.substring(point, i), "invalid tag")
						} else
							cancel()
					}
				}
			} else if (readPlainLink()) {
			} else if (eatChar('\n')) {
				addLineBreak()
			} else {
				addText(c)
				scan()
			}
		}
		endAll()
		return output.node
		
		function cancel() {
			restore(point)
			addText(c)
			scan()
		}

		function greedyCloseTag(name) {
			for (var j=0; j<stack.length; j++)
				if (stack[j].bbcode == name) {
					while (stack.top().bbcode != name)//scary
						endBlock()
					endBlock()
					return true
				}
			return false
		}

		function readPlainLink() {
			if (isUrlStart()) {
				var url = readUrl()
				addBlock('simpleLink', {"":url})
				return true
			}
		}

		function readArgList() {
			var args = {}
			while (1) {
				// read key
				var start = i
				while (isTagChar(c))
					scan()
				var key = code.substring(start, i)
				// key=...
				if (eatChar("=")) {
					// key="...
					if (eatChar('"')) {
						start = i
						while (c && c!='"' && c!="\n")
							scan()
						if (eatChar('"'))
							args[key] = code.substring(start, i-2)
						else
							return null
						// key=...
					} else {
						start = i
						while (c && c!=" " && c!="]" && c!="\n")
							scan()
						if (c == "]") {
							args[key] = code.substring(start, i)
							return args
						} else if (eatChar(" "))
							args[key] = code.substring(start, i-1)
						else
							return null
					}
					// key ...
				} else if (eatChar(" ")) {
					args[key] = true
					// key]...
				} else if (c == "]") {
					args[key] = true
					return args
					// key<other char> (error)
				} else
					return null
			}
		}
		
		function readTagName() {
			var start = i
			while (isTagChar(c))
				scan()
			return code.substring(start, i)
		}

		function isTagChar(c) {
			return c>="a" && c<="z" || c>="A"&&c<="Z" || c>="0"&&c<="9"
		}
	}
	
	// "plain text" (with autolinker)
	Parse.fallback = function(text) {
		var options = Parse.options
		var root = options.root()
		i = 0
		code = text
		output = root
		
		var linkRegex = /\b(?:https?:\/\/|sbs:)[-\w\$\.+!*'(),;/\?:@=&#%]*/g
		var result
		var out = "", last = 0
		while (result = linkRegex.exec(text)) {
			// text before link
			options.append(root, options.text(text.substring(last, result.index)))
			// generate link
			var link = options.simpleLink({"": result[0]})
			options.append(root, link)
			
			last = result.index + result[0].length
		}
		// text after last link (or entire message if no links were found)
		options.append(root, options.text(text.substr(last)))
		
		return root.node
	}
	
	Parse.parseLang = function(text, lang, preview) {
		//var start = performance.now()
		options = Parse.options //temp
		i=0
		code = text
		if (code == undefined || code == "") // "" is... debatable
			return options.root().node
		if (preview) {
			cache = editorCache
		} else {
			cache = null
		}
		try {
			var parser = Parse.lang[lang] || Parse.fallback
			return parser(text)
		} catch(e) {
			try {
				if (!output) {
					output = options.root()
				}
				options.append(output, options.error(e, e.stack))
				options.append(output, options.text(code.substr(i)))
				return output.node
			} catch (e) {
				alert("Unrecoverable parser error! please report this!\n"+e+"\n"+e.stack)
			}
		}/* finally {
			console.log("time:", performance.now() - start)
		}*/
	}
})()
Parse.options = Object.create(null)
<!--/* trick indenter
with (Parse.options) (function($) { "use strict"
Object.assign(Parse.options, { //*/

createLink: function(url) {
	// important, do not remove, prevents script injection
	if (/^ *javascript:/i.test(url))
		url = ""
	
	var protocol = urlProtocol(url)
	if (protocol[0] == "sbs:") {
		// put your custom local url handling code here
		var node = Nav.link(protocol[1])
	} else {
		var node = document.createElement('a')
		if (url[0] != "#")
			node.setAttribute('target', "_blank")
		if (!protocol[0]) {
			if (url[0] == "#") {
				// put your fragment link handling code here
				/*var hash1 = Nav.getPath()
				  var name = url.substr(1)
				  hash = "#"+hash1[0]+"#"+name
				  url = hash
				  node.onclick = function(e) {
				  var hash2 = Nav.getPath()
				  if (hash1[0]==hash2[0] && hash2[1]==name) {
				  var n = document.getElementsByName("_anchor_"+name)
				  if (n[0])
				  n[0].scrollIntoView()
				  e.preventDefault()
				  } else {
				  window.location.hash = hash
				  }
				  }*/
			} else {
				// urls without protocol get https:// or http:// added
				url = defaultProtocol+"//"+url
			}
		} else {
			// unchanged
		}
		node.href = url
	}
	
	return node
},

newEvent: function(name) {
	var event = document.createEvent("Event")
	event.initEvent(name, true, true)
	return event
},
ytk: "\x41\x49\x7A\x61\x53\x79\x43\x4E\x6D\x33\x56\x79\x41\x4D\x49\x35\x44\x36\x56\x58\x48\x39\x62\x39\x48\x37\x44\x31\x36\x63\x6D\x76\x39\x4E\x34\x7A\x70\x68\x63",
getYoutube: function(id, callback) {
	var x = new XMLHttpRequest
	x.open("GET", "https://www.googleapis.com/youtube/v3/videos?part=snippet&id="+id+"&k\x65y\x3D"+ytk)
	x.onload = function() {
		if (x.status != 200)
			return
		try {
			var json = JSON.parse(x.responseText)
			var video = json.items[0]
			callback(video)
		} catch(e){}
	}
	x.send()
},
getYoutubeID: function(url) {
	var match = url.match(/(?:https?:\/\/)?(?:www\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w\-_]+)\&?/)
	if (match)
		return match[1]
	return null
},
// returns [protocol, rest of url] or [null, url]
urlProtocol: function(url) {
	var match = url.match(/^([-\w]+:)([^]*)$/)
	if (match)
		return [match[1].toLowerCase(), match[2]]
	return [null, url]
},
maxDepth: 10,
append: function (parent, child) {
	parent = parent.branch || parent.node
	parent.appendChild(child.node)
},
//sorry
// removes all of `node`'s children and inserts them in its place
// and inserts `before` before them
kill: function(node, before) {
	var parent = node.parentNode
	parent.insertBefore(before, node)
	while (node.childNodes.length)
		parent.insertBefore(node.firstChild, node)
	parent.removeChild(node)
},
filterURL: function(url, type) {
	return url
},
defaultProtocol: window.location.protocol == "http:" ? "http:" : "https:",
//========================
// nodes without children:
text: function(text) {
	return {node: document.createTextNode(text)}
},
lineBreak: creator('br'),
line: creator('hr'),
// used for displaying invalid markup
// reason is currently unused
invalid: function(text, reason) {
	var node = document.createElement('span')
	node.className = 'invalid'
	node.title = reason
	node.textContent = text
	return {node:node}
},
// code block
code: function(args, contents) {
	var language = args[""] || 'sb'
	var node = document.createElement('pre')
	node.setAttribute('data-lang', language)
	node.appendChild(Highlight.highlight(contents, language))
	return {node:node}
},
// inline code
icode: function(args, contents) {
	var node = document.createElement('code')
	node.textContent = contents
	return {node:node}
},
audio: function(args, contents) {
	var url = args[""]
	url = filterURL(url, 'audio')
	if (url == null)
		return simpleLink(args)
	
	var node = document.createElement('audio')
	node.setAttribute('controls', "")
	node.setAttribute('src', url)
	if (contents != null)
		node.appendChild(document.createTextNode(contents))
	return {node:node}
},
video: function(args, contents) {
	var url = args[""]
	url = filterURL(url, 'video')
	if (url == null)
		return simpleLink(args)
	
	var node = document.createElement('video')
	node.setAttribute('controls', "")
	node.setAttribute('src', url)
	node.setAttribute('shrink', "")
	if (contents != null)
		node.appendChild(document.createTextNode(contents))
	node.onplaying = function() {
		node.dispatchEvent(newEvent('videoclicked'))
	}
	return {node:node}
},
youtube: function(args, contents, preview) { //todo: use contents?
	var url = args[""]
	url = filterURL(url, 'youtube')
	if (url == null)
		return simpleLink(args)
	
	var match = getYoutubeID(url)
	var link = document.createElement('a')
	var div = document.createElement('div')
	div.className = "youtube"
	div.appendChild(link)
	link.href = url
	
	if (match) {
		link.style.backgroundImage = 'url("'+defaultProtocol+"//i.ytimg.com/vi/"+match+"/mqdefault.jpg"+'")'
		var time = url.match(/[&?](?:t|start)=(\w+)/)
		var end = url.match(/[&?](?:end)=(\w+)/)
		var loop = url.match(/[&?]loop(=|&|$)/)
		if (!preview)
			getYoutube(match, function(data) {
				var title = document.createElement('div')
				title.className = 'pre videoTitle'
				title.textContent = data.snippet.title
				link.appendChild(title)
				link.appendChild(document.createElement('br'))
				title = document.createElement('div')
				title.className = 'pre videoAuthor'
				title.textContent = data.snippet.channelTitle
				link.appendChild(title)
			})
		var ifc = document.createElement('span')
		link.appendChild(ifc)
		link.onclick = function(e) {
			e.preventDefault()
			div.dispatchEvent(newEvent("beforeSizeChange"))
			var iframe = document.createElement('iframe')
			var src = "https://www.youtube-nocookie.com/embed/"+match+"?autoplay=1"
			if (time)
				src += "&start="+time[1]
			if (end)
				src += "&end="+end[1]
			if (loop)
				src += "&loop=1&playlist="+match
			iframe.src = src
			ifc.appendChild(iframe)
			div.className = "youtube playingYoutube"
			div.dispatchEvent(newEvent("afterSizeChange"))
		}
		var stop = document.createElement('button')
		stop.textContent = "x"
		stop.onclick = function(e) {
			e.preventDefault()
			div.dispatchEvent(newEvent("beforeSizeChange"))
			ifc.textContent = ""
			div.className = "youtube"
			div.dispatchEvent(newEvent("afterSizeChange"))
		}
		div.appendChild(stop)
	}
	return {node:div}
},

//=====================
// nodes with children
root: function() {
	var node = document.createElement('div')
	return {node:node}
},
bold: creator('b'),
italic: creator('i'),
underline: creator('u'),
strikethrough: creator('s'),
heading: function(level) { // input: 1, 2, or 3
	// output: h2-h4
	return {node:document.createElement('h'+(level+1))}
},

quote: function(args) {
	// <blockquote><cite> arg </cite><br> ... </blockquote>
	var name = args[""]
	var node = document.createElement('blockquote')
	if (name) {
		var cite = document.createElement('cite')
		cite.textContent = name
		node.appendChild(cite)
		node.appendChild(document.createElement('br'))
	}
	return {node:node}
},
list: function(args) {
	// <ul> ... </ul>
	if (args[""]!=undefined) {
		var list = document.createElement('ol')
		list.style.listStyleType = args[""]
	} else
		list = document.createElement('ul')
	return {node:list}
},
item: function(index) {
	return {node:document.createElement('li')}
},
//creator('li'), // (list item)

simpleLink: function(args) {
	var node = createLink(args[""])
	node.textContent = args[""]
	return {node:node}
},

customLink: function(args) {
	var node = createLink(args[""])
	node.className += " customLink"
	return {node:node}
},

table: function(opts) {
	// <div class="tableContainer"><table> ... </table></div>
	var container = document.createElement('div')
	container.className = "tableContainer"
	var node = document.createElement('table')
	container.appendChild(node)
	return {
		node: container,
		branch: node
	}
},

row: creator('tr'),

cell: function (opt) {
	// <td> ... </td> etc.
	var node = opt.h ?
		 document.createElement('th') :
		 document.createElement('td')
	if (opt.rs)
		node.rowSpan = opt.rs
	if (opt.cs)
		node.colSpan = opt.cs
	if (opt.c) {
		if (opt.c[0] == "#")
			node.style.backgroundColor = opt.c
		node.setAttribute("data-bgcolor", opt.c)
	}
	if (opt.a) {
		node.style.textAlign = opt.a
	}
	node.className = "cell"
	return {node:node}
},

image: function(args, alt) {
	var url = args[""]
	url = filterURL(url, 'image')
	if (url == null)
		return simpleLink(args)
	
	var node = document.createElement('img')
	node.setAttribute('src', url)
	node.setAttribute('tabindex', "-1")
	node.setAttribute('shrink', "")
	node.setAttribute('loading', "")
	if (alt != null)
		node.setAttribute('alt', alt)
	node.onerror = node.onload = function() {
		node.removeAttribute('loading')
	}
	// todo: add events for size change ??
	return {node:node}
},

// parser error message
error: function(e, stack) {
	// <div class="error">Error while parsing:<pre> stack trace </pre>Please report this</div>
	var node = document.createElement('div')
	node.className = "error"
	node.appendChild(document.createTextNode("Markup parsing error: "))
	var err = document.createElement('code')
	err.textContent = e
	node.appendChild(err)
	node.appendChild(document.createTextNode("\nPlease report this!"))
	if (stack) {
		var pre = document.createElement('pre')
		pre.textContent = stack
		node.appendChild(pre)
	}
	return {node:node}
},

align: function(args) {
	var node = document.createElement('div')
	var arg = args[""]
	if (arg == 'left' || arg == 'right' || arg == 'center')
		node.style.textAlign = arg
	return {node:node}
},
superscript: creator('sup'),
subscript: creator('sub'),
anchor: function(args) {
	var name = args[""]
	var node = document.createElement('a')
	// put your anchor name handler here
	// I prefix the names to avoid collision with node ids
	// which use the same namespace as name
	node.name = "_anchor_"+name
	return {node:node}
},
ruby: function(args) {
	var elem = document.createElement('ruby')
	
	var first = document.createElement('span')
	elem.appendChild(first)
	
	var x = document.createElement('rp')
	x.textContent = "("
	elem.appendChild(x)
	
	x = document.createElement('rt')
	x.textContent = args[""]
	elem.appendChild(x)
	
	var x = document.createElement('rp')
	x.textContent = ")"
	elem.appendChild(x)
	
	return {
		node: elem,
		branch: first,
	}
},
spoiler: function(args) {
	// <button> arg </button><div class="spoiler"> ... </div>
	// I'd use <summary>/<details> but it's not widely supported
	// and impossible to style with css
	// this probably needs some aria attribute or whatever
	var button = document.createElement('button')
	button.onclick = function() {
		if (this.getAttribute('data-show') == null)
			this.setAttribute('data-show',"")
		else
			this.removeAttribute('data-show')
	}
	button.className = 'spoilerButton'
	var name = args[""]
	if (name === true)
		name = "spoiler"
	button.textContent = name
	
	var box = document.createElement('div')
	box.className = "spoiler"

	var node = document.createElement('div')
	node.appendChild(button)
	node.appendChild(box)
	
	return {
		node: node,
		branch: box
	}
},
bg: function(opt) {
	var node=document.createElement("span")
	var color = opt[""]
	if (color) {
		node.setAttribute("data-bgcolor", color)
	}
	return {node:node}
},
<!--/* 
}) //*/

function creator(tag) {
	return function() {
		return {node:document.createElement(tag)}
	}
}

<!--/*
}(window)) //*/
const fs = require('fs')
const { stdout } = require('process')

var stdin = fs.readFileSync(process.stdin.fd).toString()

const element = Parse.parseLang(stdin, '12y')

stdout.write(element.innerHTML)
