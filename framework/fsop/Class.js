(function(context){
	function Class(qualifiedName, descriptor){
		var k, each;

		this.qualifiedName = qualifiedName;
		this.descriptor = descriptor;
		this.__constructor = undefined;

		for(k in this.descriptor.properties){
			each = this.descriptor.properties[k];
			if((typeof each) == "string"){
				this.descriptor.properties[k] = {
					"check" : each
				};
			}
		}

		return this;
	};

	Class.prototype.getPackageName = function(){
		var segments = this.qualifiedName.split(/\./g);
		if(segments.length < 1){
			return undefined;
		}
		else{
			return segments.splice(0, segments.length - 1).join(".");
		}
	};

	Class.prototype.getSimpleName = function(){
		var segments = this.qualifiedName.split(/\./g);
		return segments[segments.length - 1];
	};

	Class.prototype.getConstructor = function(){
		if(this.__constructor == undefined){
			this.__constructor = this.__createConstructor();
		}
		return this.__constructor;
	};

	Class.prototype._generateStaticProperties = function(targetConstructor){
		var k;

		if(this.descriptor.extend && this.descriptor.extend.clazz){
			this.descriptor.extend.clazz._generateStaticProperties(targetConstructor);
		}

		for(k in this.descriptor.statics){
			targetConstructor[k] = me.descriptor.statics[k];
		}
	};

	Class.prototype._generateProperties = function(targetConstructor){
		var me = this;
		for(k in me.descriptor.properties){
			(function(key){
				var propDesc = me.descriptor.properties[key];

				var firstUpperName = key.substr(0, 1).toUpperCase() + key.substr(1);
				var getterName = "get" + firstUpperName;
				var setterName = "set" + firstUpperName;

				Object.defineProperty(targetConstructor.prototype, getterName, {
					value : function(){
						return this[key];
					}
				});
				Object.defineProperty(targetConstructor.prototype, setterName, {
					value : function(newValue){
						if((typeof propDesc.check) == "string"){
							if((typeof newValue) != propDesc.check){
								throw new Error("Illegal Argument.");
							}
						}
						else if((typeof propDesc.check) == "function"){
							var evaluate = propDesc.check.call(newValue);
							if(evaluate == false){
								throw new Error("Illegal Argument.");
							}
						}
						return this[key] = newValue;
					}
				});
			})(k);
		}
		delete me;
	};

	Class.prototype.__createConstructor = function(){
		var me = this;
		var k, each;
		var constructor = function(){
			var args = Array.prototype.splice.call(arguments, 0);

			for(k in me.descriptor.mixins){
				me.descriptor.mixins[k].initialize(this);
			}

			for(k in me.descriptor.properties){
				Object.defineProperty(this, k, {
					value : me.descriptor.properties[k].defaultValue,
					writable : true,
					enumerable : true
				});
			}

			if(me.descriptor.extend){
				me.descriptor.extend.apply(this, args);
				Object.defineProperty(this, "constructor", {
					value : constructor,
					writable : true,
					enumerable : false
				});
			}

			if(me.descriptor.construct){
				me.descriptor.construct.apply(this, args);
			}

			return this;
		};

		/******************************
		 * Generates Static Propeties
		 ******************************/
		this._generateStaticProperties(constructor);

		Object.defineProperty(constructor, "clazz", {
			value: this,
			writable: false,
			configurable : false
		});

		/***********************
		 * Generate Prototype
		 ***********************/
		if(me.descriptor.extend){
			constructor.prototype = Object.create(me.descriptor.extend.prototype);
		}

		// Generates accessors for properties.
		this._generateProperties(constructor);

		// Generates clazz reference
		Object.defineProperty(constructor.prototype, "clazz", {
			value: this,
			writable: false,
			configurable : false
		});


		for(k in me.descriptor.mixins){
			each = me.descriptor.mixins[k];
			each.install(constructor);
		}

		// Generates member functions
		for(k in me.descriptor.members){
			constructor.prototype[k] = me.descriptor.members[k];
		}

		delete me;
		return constructor;
	};

	Class.prototype.declare = function(){
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
		finger[this.getSimpleName()] = this.getConstructor();
	};

	Class.define = function(qualifiedName, descriptor){
		var newClass = new Class(qualifiedName, descriptor);
		newClass.declare();
		return newClass.getConstructor();
	};

	if(context.fsop == undefined){
		context.fsop = {};
	}
	context.fsop.Class = Class;
})(typeof window != "undefined" ? window : global);
