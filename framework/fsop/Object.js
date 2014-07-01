fsop.Class.define("fsop.Object", {
  members : {
    "get" : function(key){
      return this[key];
    },
    "set" : function(arg1, arg2){
      var properties = undefined;
      var k;
      var me = this;

      if((typeof arg1) == "string"){
        properties = {};
        properties[arg1] = arg2;
      }
      else if(typeof arg1 == "object"){
        properties = arg1;
      }

      for(k in properties){
        (function(key){
          var setterName = "set" + key.substr(0, 1).toUpperCase() + key.substr(1);
          if(typeof me[setterName] == "function"){
            me[setterName].call(me, properties[key]);
          }else{
            me[key] = properties[key];
          }
        })(k);
      }
      delete me;
    }
  }
});
