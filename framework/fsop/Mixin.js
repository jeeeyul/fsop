(function(context){
  function Mixin(qualifiedName, descriptor){
    var k, each;

    this.qualifiedName = qualifiedName;
    this.descriptor = descriptor;

    return this;
  }

  Mixin.prototype.getPackageName = function(){
    var segments = this.qualifiedName.split(/\./g);
    if(segments.length < 1){
      return undefined;
    }
    else{
      return segments.splice(0, segments.length - 1).join(".");
    }
  };

  Mixin.prototype.getSimpleName = function(){
    var segments = this.qualifiedName.split(/\./g);
    return segments[segments.length - 1];
  };

  Mixin.prototype.install = function(targetConstructor){
    var k;

    if(this.descriptor.extend){
      this.descriptor.extend.install(targetConstructor);
    }

    for(k in this.descriptor.members){
      targetConstructor.prototype[k] = this.descriptor.members[k];
    }
  };

  Mixin.prototype.initialize = function(newInstance){
    if(this.descriptor.extend){
      this.descriptor.extend.initialize(newInstance);
    }

    if(this.descriptor.construct){
      this.descriptor.construct.call(newInstance);
    }
  };

  Mixin.prototype.declare = function(){
    var finger = context;
    var packageName = this.getPackageName();
    if(packageName){
      packageName.split(/\./g).forEach(function(each){
        if(finger[each] == undefined){
          finger[each] = {};
        }
        finger = finger[each];
      });
    }
    finger[this.getSimpleName()] = this;
  };

  Mixin.define = function(qualifiedName, descriptor){
    var newMixin = new Mixin(qualifiedName, descriptor);
    newMixin.declare();
    return newMixin;
  };

  if(context.fsop == undefined){
    context.fsop = {};
  }
  context.fsop.Mixin = Mixin;
})(typeof window != "undefined" ? window : global);
