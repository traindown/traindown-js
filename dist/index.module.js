var e=Object.freeze({EOF:-1,DateTimeToken:"DateTime",FailToken:"Fail",LoadToken:"Load",MetaKeyToken:"Meta Key",MetaValueToken:"Meta Value",MovementToken:"Movement",NoteToken:"Note",RepToken:"Rep",SetToken:"Set",SupersetMovementToken:"Superset Movement"}),t=function(e,t){this.chr=e,this.next=t||null},n=function(){function n(e){this.start=e||null}var a=n.prototype;return a.push=function(e){var n=new t(e);null==this.start||(n.next=this.start),this.start=n},a.pop=function(){if(null==this.start)return e.EOF;var t=this.start;return this.start=t.next,t.chr},a.clear=function(){this.start=null},n}(),a=function(){function e(e,t){this.type=e,this.value=t}return e.prototype.toString=function(){return"["+this.type+"] "+this.value},e}(),s=function(){function t(e,t){this.done=!1,this.errorHandler=function(e){throw e},this.position=0,this.src=e,this.start=0,this.state=t||function(){},this.tokens=[],this.vcr=new n,this._output={}}var s=t.prototype;return s.current=function(){return this.src.slice(this.start,this.position)},s.emit=function(e){var t=new a(e,this.current());this.tokens.push(t),this.start=this.position,this.vcr.clear()},s.error=function(e){this.errorHandler(e)},s.ignore=function(){this.vcr.clear(),this.start=this.position},s.next=function(){var t=e.EOF,n=this.src.slice(this.position,this.src.length);return 0!=n.length&&(t=n[0]),this.position+=1,this.vcr.push(t),t},s.nextToken=function(){return this.tokens.pop()},s.peek=function(){var e=this.next();return this.rewind(),e},s.rewind=function(){this.vcr.pop()!=e.EOF&&(this.position-=1,this.position<this.start&&(this.position=this.start))},s.run=function(e){for(;null!=this.state;)this.state=this.state.call(e,this);this.done=!0},s.take=function(e){for(var t=this.next();e.includes(t);)t=this.next();this.rewind()},t}(),r=function(){function t(e){this.done=!1,this.errors=[],this.tokens=e,this.output={date:null,metadata:{},movements:[],notes:[]},this._process()}var n=t.prototype;return n._process=function(){var t=null,n=0;e:for(var a=0;a<this.tokens.length;++a){var s=this.tokens[a];switch(s.type){case e.DateTimeToken:this.output.date=s.value;break;case e.MetaKeyToken:this.output.metadata[s.value]=null,t=s.value;break;case e.MetaValueToken:this.output.metadata[t]=s.value;break;case e.NoteToken:this.output.notes.push(s.value);break;default:n=a;break e}}if(n!=this.tokens.length-1){for(var r=[this.tokens[0]],i=1;i<this.tokens.length;++i){var o=this.tokens[i];o.type==e.MovementToken||o.type==e.SupersetMovementToken?(this._marshalMovement(r),r=[o]):r.push(o)}r.length>0&&this._marshalMovement(r),this.done=!0}else this.done=!0},n._marshalMovement=function(t){var n={metadata:{},name:"Unknown Movement",notes:[],performances:[],sequence:this.output.movements.length,superset:!1,touched:!1},a=null,s=0;e:for(var r=0;r<t.length;++r){var i=t[r];switch(i.type){case e.SupersetMovementToken:n.superset=!0,n.name=i.value;break;case e.MovementToken:n.name=i.value;break;case e.MetaKeyToken:n.metadata[i.value]=null,a=i.value;break;case e.MetaValueToken:n.metadata[a]=i.value;break;case e.NoteToken:n.notes.push(i.value);break;default:s=r;break e}n.touched=!0}n.touched&&(delete n.touched,n.performances=this._marshalPerformance(t.slice(s)),this.output.movements.push(n))},n._marshalPerformance=function(t){for(var n=[],a=null,s={fails:0,load:0,metadata:{},reps:0,notes:[],sets:1,touched:!1},r=function(e){delete s.touched,s.sequence=n.length,n.push(s),s={fails:0,load:0,metadata:{},reps:0,notes:[],sets:1,touched:!1}},i=0;i<t.length;++i){var o=t[i];if(o.type==e.LoadToken){s.touched&&(0==s.reps&&0==s.fails&&(s.reps=1),0!=s.load&&r());var u=parseFloat(o.value);s.load=isNaN(u)?o.value:u}else switch(o.type){case e.FailToken:s.fails=parseFloat(o.value);break;case e.MetaKeyToken:s.metadata[o.value]=null,a=o.value;break;case e.MetaValueToken:s.metadata[a]=o.value;break;case e.NoteToken:s.notes.push(o.value);break;case e.RepToken:s.reps=parseFloat(o.value);break;case e.SetToken:s.sets=parseInt(o.value,10)}s.touched=!0}return 0==s.reps&&0==s.fails&&(s.reps=1),s.fails>0&&0==s.reps&&(s.reps=s.fails),r(),n},t}(),i=function(){function t(e){this.lexer=new s(e,this.idleState)}var n=t.prototype;return n.parse=function(e){if(this.lexer.run(this),!e)return this.lexer.tokens;switch(e){case"json":var t=new r(this.lexer.tokens);return!t.done||t.errors.length>0?{error:!0}:t.output;default:return this.lexer.tokens}},n.idleState=function(t){var n=t.peek();if(n==e.EOF)return null;if(this._isWhitespace(n)||this._isLineTerminator(n))return t.next(),t.ignore(),this.idleState(t);switch(n){case"@":return this.dateTimeState(t);case"#":return this.metaKeyState(t);case"*":return this.noteState(t);default:return this.valueState(t)}},n.dateTimeState=function(t){t.take(["@"," "]),t.ignore();for(var n=t.next();!this._isLineTerminator(n);)n=t.next();return t.rewind(),t.emit(e.DateTimeToken),this.idleState},n.metaKeyState=function(t){t.take(["#"," "]),t.ignore();for(var n=t.next();!this._isColonTerminator(n);)n=t.next();return t.rewind(),t.emit(e.MetaKeyToken),this.metaValueState},n.metaValueState=function(t){t.take([":"," "]),t.ignore();for(var n=t.next();!this._isLineTerminator(n);)n=t.next();return t.rewind(),t.emit(e.MetaValueToken),this.idleState},n.movementState=function(t){var n=!1,a=t.next();for("+"==a&&(n=!0,t.take([" "]),t.ignore(),a=t.next()),"'"==a&&(t.ignore(),a=t.next());!this._isColonTerminator(a);)a=t.next();return t.rewind(),t.emit(n?e.SupersetMovementToken:e.MovementToken),t.take(":"),t.ignore(),this.idleState},n.noteState=function(t){t.take(["*"," "]),t.ignore();for(var n=t.next();!this._isLineTerminator(n);)n=t.next();return t.rewind(),t.emit(e.NoteToken),this.idleState},n.numberState=function(t){switch(t.take(["0","1","2","3","4","5","6","7","8","9","."]),t.peek()){case"f":case"F":t.emit(e.FailToken);break;case"r":case"R":t.emit(e.RepToken);break;case"s":case"S":t.emit(e.SetToken);break;default:t.emit(e.LoadToken)}return t.take(["f","F","r","R","s","S"]),t.ignore(),this.idleState},n.valueState=function(t){var n=t.next();if("+"==n||"'"==n)return t.rewind(),this.movementState(t);if(isNaN(n)){if("b"!=n&&"B"!=n)return t.rewind(),this.movementState(t);var a=t.peek();if("w"!=a&&"W"!=a)return t.rewind(),this.movementState(t);for(;!this._isWhitespace(n);)n=t.next();return t.rewind(),t.emit(e.LoadToken),this.idleState}return this.numberState(t)},n._isColonTerminator=function(t){return t==e.EOF||":"==t},n._isLineTerminator=function(t){return t==e.EOF||";"==t||"\n"==t||"\r"==t},n._isWhitespace=function(e){return/\s/.test(e)},t}();export default i;
//# sourceMappingURL=index.module.js.map
