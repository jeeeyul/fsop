require("./Class");
require("./Mixin");

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


fsop.Mixin.define("MTest", {
  construct : function(){
    this.__mtest = true;
  },
  members : {
    "hello" : function(){
      console.log("hello " + this.name);
    }
  }
});

fsop.Mixin.define("MTest2", {
  extend : MTest,
  construct : function(){
    this.__mtest2 = true;
  },
  members : {
    "hello2" : function(){
      console.log("hello " + this.name);
    }
  }
});

fsop.Class.define("Person", {
  extend : fsop.Object,
  properties : {
    name : {
      check : "string",
      defaultValue : "Hello"
    },
    age : "number"
  },

  members : {
    test : function(){
      console.log(this);
    }
  }
});

fsop.Class.define("Student", {
  extend : Person,
  mixins : [MTest2, MTest],
  properties : {
    sn : "number"
  }
});

var p = new Student();
p.setSn(1202);
p.setName("Jeeeyul");
p.hello();
p.set({
  name : "지율",
  age  : 34
});
console.log(p);
