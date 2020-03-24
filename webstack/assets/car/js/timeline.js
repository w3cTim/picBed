// JavaScript Document
var Timeline = function( option  ){
  this.config( option );
};
Timeline.prototype = {
  EVENT_ENTER_FRAME : "enterFrame",

  option:{
    fps:30
  },
  tid:null,
  active:false,
  
  config:function( option ){
    if( isNaN( option ) ){
      this.option = $.extend( {}, this.option, option );
    } else {
      this.option.fps = option;
    }
    return this;
  },
  start:function(){
    this.active = true;
    this._enterFrame();
    return this;
  },
  _enterFrame:function(){
    if( this.active ){
      $(this).trigger( this.EVENT_ENTER_FRAME );
      this.tid = setTimeout(
        $.proxy( this._enterFrame, this ),
        Math.floor( 1000 / this.option.fps )
      );
    }
  },
  stop:function(){
    this.active = false;
    clearTimeout( this.tid );
    return this;
  },
  bind:function( name, func ){
    $(this).bind( name, func );
    return this;
  },
  unbind:function( name, func ){
    $(this).unbind( name, func );
    return this;
  }
};