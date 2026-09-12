var StarmusTranscript = (function (exports) {
	'use strict';

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	var es_array_includes = {};

	var globalThis_1;
	var hasRequiredGlobalThis;

	function requireGlobalThis () {
		if (hasRequiredGlobalThis) return globalThis_1;
		hasRequiredGlobalThis = 1;
		var check = function (it) {
		  return it && it.Math === Math && it;
		};

		// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
		globalThis_1 =
		  // eslint-disable-next-line es/no-global-this -- safe
		  check(typeof globalThis == 'object' && globalThis) ||
		  check(typeof window == 'object' && window) ||
		  // eslint-disable-next-line no-restricted-globals -- safe
		  check(typeof self == 'object' && self) ||
		  check(typeof commonjsGlobal == 'object' && commonjsGlobal) ||
		  check(typeof globalThis_1 == 'object' && globalThis_1) ||
		  // eslint-disable-next-line no-new-func -- fallback
		  (function () { return this; })() || Function('return this')();
		return globalThis_1;
	}

	var objectGetOwnPropertyDescriptor = {};

	var fails;
	var hasRequiredFails;

	function requireFails () {
		if (hasRequiredFails) return fails;
		hasRequiredFails = 1;
		fails = function (exec) {
		  try {
		    return !!exec();
		  } catch (error) {
		    return true;
		  }
		};
		return fails;
	}

	var descriptors;
	var hasRequiredDescriptors;

	function requireDescriptors () {
		if (hasRequiredDescriptors) return descriptors;
		hasRequiredDescriptors = 1;
		var fails = requireFails();

		// Detect IE8's incomplete defineProperty implementation
		descriptors = !fails(function () {
		  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
		  return Object.defineProperty({}, 1, { get: function () { return 7; } })[1] !== 7;
		});
		return descriptors;
	}

	var functionBindNative;
	var hasRequiredFunctionBindNative;

	function requireFunctionBindNative () {
		if (hasRequiredFunctionBindNative) return functionBindNative;
		hasRequiredFunctionBindNative = 1;
		var fails = requireFails();

		functionBindNative = !fails(function () {
		  // eslint-disable-next-line es/no-function-prototype-bind -- safe
		  var test = function () { /* empty */ }.bind();
		  // eslint-disable-next-line no-prototype-builtins -- safe
		  return typeof test != 'function' || test.hasOwnProperty('prototype');
		});
		return functionBindNative;
	}

	var functionCall;
	var hasRequiredFunctionCall;

	function requireFunctionCall () {
		if (hasRequiredFunctionCall) return functionCall;
		hasRequiredFunctionCall = 1;
		var NATIVE_BIND = requireFunctionBindNative();

		var call = Function.prototype.call;
		// eslint-disable-next-line es/no-function-prototype-bind -- safe
		functionCall = NATIVE_BIND ? call.bind(call) : function () {
		  return call.apply(call, arguments);
		};
		return functionCall;
	}

	var objectPropertyIsEnumerable = {};

	var hasRequiredObjectPropertyIsEnumerable;

	function requireObjectPropertyIsEnumerable () {
		if (hasRequiredObjectPropertyIsEnumerable) return objectPropertyIsEnumerable;
		hasRequiredObjectPropertyIsEnumerable = 1;
		var $propertyIsEnumerable = {}.propertyIsEnumerable;
		// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
		var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

		// Nashorn ~ JDK8 bug
		var NASHORN_BUG = getOwnPropertyDescriptor && !$propertyIsEnumerable.call({ 1: 2 }, 1);

		// `Object.prototype.propertyIsEnumerable` method implementation
		// https://tc39.es/ecma262/#sec-object.prototype.propertyisenumerable
		objectPropertyIsEnumerable.f = NASHORN_BUG ? function propertyIsEnumerable(V) {
		  var descriptor = getOwnPropertyDescriptor(this, V);
		  return !!descriptor && descriptor.enumerable;
		} : $propertyIsEnumerable;
		return objectPropertyIsEnumerable;
	}

	var createPropertyDescriptor;
	var hasRequiredCreatePropertyDescriptor;

	function requireCreatePropertyDescriptor () {
		if (hasRequiredCreatePropertyDescriptor) return createPropertyDescriptor;
		hasRequiredCreatePropertyDescriptor = 1;
		createPropertyDescriptor = function (bitmap, value) {
		  return {
		    enumerable: !(bitmap & 1),
		    configurable: !(bitmap & 2),
		    writable: !(bitmap & 4),
		    value: value
		  };
		};
		return createPropertyDescriptor;
	}

	var functionUncurryThis;
	var hasRequiredFunctionUncurryThis;

	function requireFunctionUncurryThis () {
		if (hasRequiredFunctionUncurryThis) return functionUncurryThis;
		hasRequiredFunctionUncurryThis = 1;
		var NATIVE_BIND = requireFunctionBindNative();

		var FunctionPrototype = Function.prototype;
		var call = FunctionPrototype.call;
		// eslint-disable-next-line es/no-function-prototype-bind -- safe
		var uncurryThisWithBind = NATIVE_BIND && FunctionPrototype.bind.bind(call, call);

		functionUncurryThis = NATIVE_BIND ? uncurryThisWithBind : function (fn) {
		  return function () {
		    return call.apply(fn, arguments);
		  };
		};
		return functionUncurryThis;
	}

	var classofRaw;
	var hasRequiredClassofRaw;

	function requireClassofRaw () {
		if (hasRequiredClassofRaw) return classofRaw;
		hasRequiredClassofRaw = 1;
		var uncurryThis = requireFunctionUncurryThis();

		var toString = uncurryThis({}.toString);
		var stringSlice = uncurryThis(''.slice);

		classofRaw = function (it) {
		  return stringSlice(toString(it), 8, -1);
		};
		return classofRaw;
	}

	var indexedObject;
	var hasRequiredIndexedObject;

	function requireIndexedObject () {
		if (hasRequiredIndexedObject) return indexedObject;
		hasRequiredIndexedObject = 1;
		var uncurryThis = requireFunctionUncurryThis();
		var fails = requireFails();
		var classof = requireClassofRaw();

		var $Object = Object;
		var split = uncurryThis(''.split);

		// fallback for non-array-like ES3 and non-enumerable old V8 strings
		indexedObject = fails(function () {
		  // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
		  // eslint-disable-next-line no-prototype-builtins -- safe
		  return !$Object('z').propertyIsEnumerable(0);
		}) ? function (it) {
		  return classof(it) === 'String' ? split(it, '') : $Object(it);
		} : $Object;
		return indexedObject;
	}

	var isNullOrUndefined;
	var hasRequiredIsNullOrUndefined;

	function requireIsNullOrUndefined () {
		if (hasRequiredIsNullOrUndefined) return isNullOrUndefined;
		hasRequiredIsNullOrUndefined = 1;
		// we can't use just `it == null` since of `document.all` special case
		// https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot-aec
		isNullOrUndefined = function (it) {
		  return it === null || it === undefined;
		};
		return isNullOrUndefined;
	}

	var requireObjectCoercible;
	var hasRequiredRequireObjectCoercible;

	function requireRequireObjectCoercible () {
		if (hasRequiredRequireObjectCoercible) return requireObjectCoercible;
		hasRequiredRequireObjectCoercible = 1;
		var isNullOrUndefined = requireIsNullOrUndefined();

		var $TypeError = TypeError;

		// `RequireObjectCoercible` abstract operation
		// https://tc39.es/ecma262/#sec-requireobjectcoercible
		requireObjectCoercible = function (it) {
		  if (isNullOrUndefined(it)) throw new $TypeError("Can't call method on " + it);
		  return it;
		};
		return requireObjectCoercible;
	}

	var toIndexedObject;
	var hasRequiredToIndexedObject;

	function requireToIndexedObject () {
		if (hasRequiredToIndexedObject) return toIndexedObject;
		hasRequiredToIndexedObject = 1;
		// toObject with fallback for non-array-like ES3 strings
		var IndexedObject = requireIndexedObject();
		var requireObjectCoercible = requireRequireObjectCoercible();

		toIndexedObject = function (it) {
		  return IndexedObject(requireObjectCoercible(it));
		};
		return toIndexedObject;
	}

	var isCallable;
	var hasRequiredIsCallable;

	function requireIsCallable () {
		if (hasRequiredIsCallable) return isCallable;
		hasRequiredIsCallable = 1;
		// https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot
		var documentAll = typeof document == 'object' && document.all;

		// `IsCallable` abstract operation
		// https://tc39.es/ecma262/#sec-iscallable
		// eslint-disable-next-line unicorn/no-typeof-undefined -- required for testing
		isCallable = typeof documentAll == 'undefined' && documentAll !== undefined ? function (argument) {
		  return typeof argument == 'function' || argument === documentAll;
		} : function (argument) {
		  return typeof argument == 'function';
		};
		return isCallable;
	}

	var isObject;
	var hasRequiredIsObject;

	function requireIsObject () {
		if (hasRequiredIsObject) return isObject;
		hasRequiredIsObject = 1;
		var isCallable = requireIsCallable();

		isObject = function (it) {
		  return typeof it == 'object' ? it !== null : isCallable(it);
		};
		return isObject;
	}

	var getBuiltIn;
	var hasRequiredGetBuiltIn;

	function requireGetBuiltIn () {
		if (hasRequiredGetBuiltIn) return getBuiltIn;
		hasRequiredGetBuiltIn = 1;
		var globalThis = requireGlobalThis();
		var isCallable = requireIsCallable();

		var aFunction = function (argument) {
		  return isCallable(argument) ? argument : undefined;
		};

		getBuiltIn = function (namespace, method) {
		  return arguments.length < 2 ? aFunction(globalThis[namespace]) : globalThis[namespace] && globalThis[namespace][method];
		};
		return getBuiltIn;
	}

	var objectIsPrototypeOf;
	var hasRequiredObjectIsPrototypeOf;

	function requireObjectIsPrototypeOf () {
		if (hasRequiredObjectIsPrototypeOf) return objectIsPrototypeOf;
		hasRequiredObjectIsPrototypeOf = 1;
		var uncurryThis = requireFunctionUncurryThis();

		objectIsPrototypeOf = uncurryThis({}.isPrototypeOf);
		return objectIsPrototypeOf;
	}

	var environmentUserAgent;
	var hasRequiredEnvironmentUserAgent;

	function requireEnvironmentUserAgent () {
		if (hasRequiredEnvironmentUserAgent) return environmentUserAgent;
		hasRequiredEnvironmentUserAgent = 1;
		var globalThis = requireGlobalThis();

		var navigator = globalThis.navigator;
		var userAgent = navigator && navigator.userAgent;

		environmentUserAgent = userAgent ? String(userAgent) : '';
		return environmentUserAgent;
	}

	var environmentV8Version;
	var hasRequiredEnvironmentV8Version;

	function requireEnvironmentV8Version () {
		if (hasRequiredEnvironmentV8Version) return environmentV8Version;
		hasRequiredEnvironmentV8Version = 1;
		var globalThis = requireGlobalThis();
		var userAgent = requireEnvironmentUserAgent();

		var process = globalThis.process;
		var Deno = globalThis.Deno;
		var versions = process && process.versions || Deno && Deno.version;
		var v8 = versions && versions.v8;
		var match, version;

		if (v8) {
		  match = v8.split('.');
		  // in old Chrome, versions of V8 isn't V8 = Chrome / 10
		  // but their correct versions are not interesting for us
		  version = match[0] > 0 && match[0] < 4 ? 1 : +(match[0] + match[1]);
		}

		// BrowserFS NodeJS `process` polyfill incorrectly set `.v8` to `0.0`
		// so check `userAgent` even if `.v8` exists, but 0
		if (!version && userAgent) {
		  match = userAgent.match(/Edge\/(\d+)/);
		  if (!match || match[1] >= 74) {
		    match = userAgent.match(/Chrome\/(\d+)/);
		    if (match) version = +match[1];
		  }
		}

		environmentV8Version = version;
		return environmentV8Version;
	}

	var symbolConstructorDetection;
	var hasRequiredSymbolConstructorDetection;

	function requireSymbolConstructorDetection () {
		if (hasRequiredSymbolConstructorDetection) return symbolConstructorDetection;
		hasRequiredSymbolConstructorDetection = 1;
		/* eslint-disable es/no-symbol -- required for testing */
		var V8_VERSION = requireEnvironmentV8Version();
		var fails = requireFails();
		var globalThis = requireGlobalThis();

		var $String = globalThis.String;

		// eslint-disable-next-line es/no-object-getownpropertysymbols -- required for testing
		symbolConstructorDetection = !!Object.getOwnPropertySymbols && !fails(function () {
		  var symbol = Symbol('symbol detection');
		  // Chrome 38 Symbol has incorrect toString conversion
		  // `get-own-property-symbols` polyfill symbols converted to object are not Symbol instances
		  // nb: Do not call `String` directly to avoid this being optimized out to `symbol+''` which will,
		  // of course, fail.
		  return !$String(symbol) || !(Object(symbol) instanceof Symbol) ||
		    // Chrome 38-40 symbols are not inherited from DOM collections prototypes to instances
		    !Symbol.sham && V8_VERSION && V8_VERSION < 41;
		});
		return symbolConstructorDetection;
	}

	var useSymbolAsUid;
	var hasRequiredUseSymbolAsUid;

	function requireUseSymbolAsUid () {
		if (hasRequiredUseSymbolAsUid) return useSymbolAsUid;
		hasRequiredUseSymbolAsUid = 1;
		/* eslint-disable es/no-symbol -- required for testing */
		var NATIVE_SYMBOL = requireSymbolConstructorDetection();

		useSymbolAsUid = NATIVE_SYMBOL &&
		  !Symbol.sham &&
		  typeof Symbol.iterator == 'symbol';
		return useSymbolAsUid;
	}

	var isSymbol;
	var hasRequiredIsSymbol;

	function requireIsSymbol () {
		if (hasRequiredIsSymbol) return isSymbol;
		hasRequiredIsSymbol = 1;
		var getBuiltIn = requireGetBuiltIn();
		var isCallable = requireIsCallable();
		var isPrototypeOf = requireObjectIsPrototypeOf();
		var USE_SYMBOL_AS_UID = requireUseSymbolAsUid();

		var $Object = Object;

		isSymbol = USE_SYMBOL_AS_UID ? function (it) {
		  return typeof it == 'symbol';
		} : function (it) {
		  var $Symbol = getBuiltIn('Symbol');
		  return isCallable($Symbol) && isPrototypeOf($Symbol.prototype, $Object(it));
		};
		return isSymbol;
	}

	var tryToString;
	var hasRequiredTryToString;

	function requireTryToString () {
		if (hasRequiredTryToString) return tryToString;
		hasRequiredTryToString = 1;
		var $String = String;

		tryToString = function (argument) {
		  try {
		    return $String(argument);
		  } catch (error) {
		    return 'Object';
		  }
		};
		return tryToString;
	}

	var aCallable;
	var hasRequiredACallable;

	function requireACallable () {
		if (hasRequiredACallable) return aCallable;
		hasRequiredACallable = 1;
		var isCallable = requireIsCallable();
		var tryToString = requireTryToString();

		var $TypeError = TypeError;

		// `Assert: IsCallable(argument) is true`
		aCallable = function (argument) {
		  if (isCallable(argument)) return argument;
		  throw new $TypeError(tryToString(argument) + ' is not a function');
		};
		return aCallable;
	}

	var getMethod;
	var hasRequiredGetMethod;

	function requireGetMethod () {
		if (hasRequiredGetMethod) return getMethod;
		hasRequiredGetMethod = 1;
		var aCallable = requireACallable();
		var isNullOrUndefined = requireIsNullOrUndefined();

		// `GetMethod` abstract operation
		// https://tc39.es/ecma262/#sec-getmethod
		getMethod = function (V, P) {
		  var func = V[P];
		  return isNullOrUndefined(func) ? undefined : aCallable(func);
		};
		return getMethod;
	}

	var ordinaryToPrimitive;
	var hasRequiredOrdinaryToPrimitive;

	function requireOrdinaryToPrimitive () {
		if (hasRequiredOrdinaryToPrimitive) return ordinaryToPrimitive;
		hasRequiredOrdinaryToPrimitive = 1;
		var call = requireFunctionCall();
		var isCallable = requireIsCallable();
		var isObject = requireIsObject();

		var $TypeError = TypeError;

		// `OrdinaryToPrimitive` abstract operation
		// https://tc39.es/ecma262/#sec-ordinarytoprimitive
		ordinaryToPrimitive = function (input, pref) {
		  var fn, val;
		  if (pref === 'string' && isCallable(fn = input.toString) && !isObject(val = call(fn, input))) return val;
		  if (isCallable(fn = input.valueOf) && !isObject(val = call(fn, input))) return val;
		  if (pref !== 'string' && isCallable(fn = input.toString) && !isObject(val = call(fn, input))) return val;
		  throw new $TypeError("Can't convert object to primitive value");
		};
		return ordinaryToPrimitive;
	}

	var sharedStore = {exports: {}};

	var isPure;
	var hasRequiredIsPure;

	function requireIsPure () {
		if (hasRequiredIsPure) return isPure;
		hasRequiredIsPure = 1;
		isPure = false;
		return isPure;
	}

	var defineGlobalProperty;
	var hasRequiredDefineGlobalProperty;

	function requireDefineGlobalProperty () {
		if (hasRequiredDefineGlobalProperty) return defineGlobalProperty;
		hasRequiredDefineGlobalProperty = 1;
		var globalThis = requireGlobalThis();

		// eslint-disable-next-line es/no-object-defineproperty -- safe
		var defineProperty = Object.defineProperty;

		defineGlobalProperty = function (key, value) {
		  try {
		    defineProperty(globalThis, key, { value: value, configurable: true, writable: true });
		  } catch (error) {
		    globalThis[key] = value;
		  } return value;
		};
		return defineGlobalProperty;
	}

	var hasRequiredSharedStore;

	function requireSharedStore () {
		if (hasRequiredSharedStore) return sharedStore.exports;
		hasRequiredSharedStore = 1;
		var IS_PURE = requireIsPure();
		var globalThis = requireGlobalThis();
		var defineGlobalProperty = requireDefineGlobalProperty();

		var SHARED = '__core-js_shared__';
		var store = sharedStore.exports = globalThis[SHARED] || defineGlobalProperty(SHARED, {});

		(store.versions || (store.versions = [])).push({
		  version: '3.49.0',
		  mode: IS_PURE ? 'pure' : 'global',
		  copyright: '© 2013–2025 Denis Pushkarev (zloirock.ru), 2025–2026 CoreJS Company (core-js.io). All rights reserved.',
		  license: 'https://github.com/zloirock/core-js/blob/v3.49.0/LICENSE',
		  source: 'https://github.com/zloirock/core-js'
		});
		return sharedStore.exports;
	}

	var shared;
	var hasRequiredShared;

	function requireShared () {
		if (hasRequiredShared) return shared;
		hasRequiredShared = 1;
		var store = requireSharedStore();

		shared = function (key, value) {
		  return store[key] || (store[key] = value || {});
		};
		return shared;
	}

	var toObject;
	var hasRequiredToObject;

	function requireToObject () {
		if (hasRequiredToObject) return toObject;
		hasRequiredToObject = 1;
		var requireObjectCoercible = requireRequireObjectCoercible();

		var $Object = Object;

		// `ToObject` abstract operation
		// https://tc39.es/ecma262/#sec-toobject
		toObject = function (argument) {
		  return $Object(requireObjectCoercible(argument));
		};
		return toObject;
	}

	var hasOwnProperty_1;
	var hasRequiredHasOwnProperty;

	function requireHasOwnProperty () {
		if (hasRequiredHasOwnProperty) return hasOwnProperty_1;
		hasRequiredHasOwnProperty = 1;
		var uncurryThis = requireFunctionUncurryThis();
		var toObject = requireToObject();

		var hasOwnProperty = uncurryThis({}.hasOwnProperty);

		// `HasOwnProperty` abstract operation
		// https://tc39.es/ecma262/#sec-hasownproperty
		// eslint-disable-next-line es/no-object-hasown -- safe
		hasOwnProperty_1 = Object.hasOwn || function hasOwn(it, key) {
		  return hasOwnProperty(toObject(it), key);
		};
		return hasOwnProperty_1;
	}

	var uid;
	var hasRequiredUid;

	function requireUid () {
		if (hasRequiredUid) return uid;
		hasRequiredUid = 1;
		var uncurryThis = requireFunctionUncurryThis();

		var id = 0;
		var postfix = Math.random();
		var toString = uncurryThis(1.1.toString);

		uid = function (key) {
		  return 'Symbol(' + (key === undefined ? '' : key) + ')_' + toString(++id + postfix, 36);
		};
		return uid;
	}

	var wellKnownSymbol;
	var hasRequiredWellKnownSymbol;

	function requireWellKnownSymbol () {
		if (hasRequiredWellKnownSymbol) return wellKnownSymbol;
		hasRequiredWellKnownSymbol = 1;
		var globalThis = requireGlobalThis();
		var shared = requireShared();
		var hasOwn = requireHasOwnProperty();
		var uid = requireUid();
		var NATIVE_SYMBOL = requireSymbolConstructorDetection();
		var USE_SYMBOL_AS_UID = requireUseSymbolAsUid();

		var Symbol = globalThis.Symbol;
		var WellKnownSymbolsStore = shared('wks');
		var createWellKnownSymbol = USE_SYMBOL_AS_UID ? Symbol['for'] || Symbol : Symbol && Symbol.withoutSetter || uid;

		wellKnownSymbol = function (name) {
		  if (!hasOwn(WellKnownSymbolsStore, name)) {
		    WellKnownSymbolsStore[name] = NATIVE_SYMBOL && hasOwn(Symbol, name)
		      ? Symbol[name]
		      : createWellKnownSymbol('Symbol.' + name);
		  } return WellKnownSymbolsStore[name];
		};
		return wellKnownSymbol;
	}

	var toPrimitive;
	var hasRequiredToPrimitive;

	function requireToPrimitive () {
		if (hasRequiredToPrimitive) return toPrimitive;
		hasRequiredToPrimitive = 1;
		var call = requireFunctionCall();
		var isObject = requireIsObject();
		var isSymbol = requireIsSymbol();
		var getMethod = requireGetMethod();
		var ordinaryToPrimitive = requireOrdinaryToPrimitive();
		var wellKnownSymbol = requireWellKnownSymbol();

		var $TypeError = TypeError;
		var TO_PRIMITIVE = wellKnownSymbol('toPrimitive');

		// `ToPrimitive` abstract operation
		// https://tc39.es/ecma262/#sec-toprimitive
		toPrimitive = function (input, pref) {
		  if (!isObject(input) || isSymbol(input)) return input;
		  var exoticToPrim = getMethod(input, TO_PRIMITIVE);
		  var result;
		  if (exoticToPrim) {
		    if (pref === undefined) pref = 'default';
		    result = call(exoticToPrim, input, pref);
		    if (!isObject(result) || isSymbol(result)) return result;
		    throw new $TypeError("Can't convert object to primitive value");
		  }
		  if (pref === undefined) pref = 'number';
		  return ordinaryToPrimitive(input, pref);
		};
		return toPrimitive;
	}

	var toPropertyKey;
	var hasRequiredToPropertyKey;

	function requireToPropertyKey () {
		if (hasRequiredToPropertyKey) return toPropertyKey;
		hasRequiredToPropertyKey = 1;
		var toPrimitive = requireToPrimitive();
		var isSymbol = requireIsSymbol();

		// `ToPropertyKey` abstract operation
		// https://tc39.es/ecma262/#sec-topropertykey
		toPropertyKey = function (argument) {
		  var key = toPrimitive(argument, 'string');
		  return isSymbol(key) ? key : key + '';
		};
		return toPropertyKey;
	}

	var documentCreateElement;
	var hasRequiredDocumentCreateElement;

	function requireDocumentCreateElement () {
		if (hasRequiredDocumentCreateElement) return documentCreateElement;
		hasRequiredDocumentCreateElement = 1;
		var globalThis = requireGlobalThis();
		var isObject = requireIsObject();

		var document = globalThis.document;
		// typeof document.createElement is 'object' in old IE
		var EXISTS = isObject(document) && isObject(document.createElement);

		documentCreateElement = function (it) {
		  return EXISTS ? document.createElement(it) : {};
		};
		return documentCreateElement;
	}

	var ie8DomDefine;
	var hasRequiredIe8DomDefine;

	function requireIe8DomDefine () {
		if (hasRequiredIe8DomDefine) return ie8DomDefine;
		hasRequiredIe8DomDefine = 1;
		var DESCRIPTORS = requireDescriptors();
		var fails = requireFails();
		var createElement = requireDocumentCreateElement();

		// Thanks to IE8 for its funny defineProperty
		ie8DomDefine = !DESCRIPTORS && !fails(function () {
		  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
		  return Object.defineProperty(createElement('div'), 'a', {
		    get: function () { return 7; }
		  }).a !== 7;
		});
		return ie8DomDefine;
	}

	var hasRequiredObjectGetOwnPropertyDescriptor;

	function requireObjectGetOwnPropertyDescriptor () {
		if (hasRequiredObjectGetOwnPropertyDescriptor) return objectGetOwnPropertyDescriptor;
		hasRequiredObjectGetOwnPropertyDescriptor = 1;
		var DESCRIPTORS = requireDescriptors();
		var call = requireFunctionCall();
		var propertyIsEnumerableModule = requireObjectPropertyIsEnumerable();
		var createPropertyDescriptor = requireCreatePropertyDescriptor();
		var toIndexedObject = requireToIndexedObject();
		var toPropertyKey = requireToPropertyKey();
		var hasOwn = requireHasOwnProperty();
		var IE8_DOM_DEFINE = requireIe8DomDefine();

		// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
		var $getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

		// `Object.getOwnPropertyDescriptor` method
		// https://tc39.es/ecma262/#sec-object.getownpropertydescriptor
		objectGetOwnPropertyDescriptor.f = DESCRIPTORS ? $getOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
		  O = toIndexedObject(O);
		  P = toPropertyKey(P);
		  if (IE8_DOM_DEFINE) try {
		    return $getOwnPropertyDescriptor(O, P);
		  } catch (error) { /* empty */ }
		  if (hasOwn(O, P)) return createPropertyDescriptor(!call(propertyIsEnumerableModule.f, O, P), O[P]);
		};
		return objectGetOwnPropertyDescriptor;
	}

	var objectDefineProperty = {};

	var v8PrototypeDefineBug;
	var hasRequiredV8PrototypeDefineBug;

	function requireV8PrototypeDefineBug () {
		if (hasRequiredV8PrototypeDefineBug) return v8PrototypeDefineBug;
		hasRequiredV8PrototypeDefineBug = 1;
		var DESCRIPTORS = requireDescriptors();
		var fails = requireFails();

		// V8 ~ Chrome 36-
		// https://bugs.chromium.org/p/v8/issues/detail?id=3334
		v8PrototypeDefineBug = DESCRIPTORS && fails(function () {
		  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
		  return Object.defineProperty(function () { /* empty */ }, 'prototype', {
		    value: 42,
		    writable: false
		  }).prototype !== 42;
		});
		return v8PrototypeDefineBug;
	}

	var anObject;
	var hasRequiredAnObject;

	function requireAnObject () {
		if (hasRequiredAnObject) return anObject;
		hasRequiredAnObject = 1;
		var isObject = requireIsObject();

		var $String = String;
		var $TypeError = TypeError;

		// `Assert: Type(argument) is Object`
		anObject = function (argument) {
		  if (isObject(argument)) return argument;
		  throw new $TypeError($String(argument) + ' is not an object');
		};
		return anObject;
	}

	var hasRequiredObjectDefineProperty;

	function requireObjectDefineProperty () {
		if (hasRequiredObjectDefineProperty) return objectDefineProperty;
		hasRequiredObjectDefineProperty = 1;
		var DESCRIPTORS = requireDescriptors();
		var IE8_DOM_DEFINE = requireIe8DomDefine();
		var V8_PROTOTYPE_DEFINE_BUG = requireV8PrototypeDefineBug();
		var anObject = requireAnObject();
		var toPropertyKey = requireToPropertyKey();

		var $TypeError = TypeError;
		// eslint-disable-next-line es/no-object-defineproperty -- safe
		var $defineProperty = Object.defineProperty;
		// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
		var $getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
		var ENUMERABLE = 'enumerable';
		var CONFIGURABLE = 'configurable';
		var WRITABLE = 'writable';

		// `Object.defineProperty` method
		// https://tc39.es/ecma262/#sec-object.defineproperty
		objectDefineProperty.f = DESCRIPTORS ? V8_PROTOTYPE_DEFINE_BUG ? function defineProperty(O, P, Attributes) {
		  anObject(O);
		  P = toPropertyKey(P);
		  anObject(Attributes);
		  if (typeof O === 'function' && P === 'prototype' && 'value' in Attributes && WRITABLE in Attributes && !Attributes[WRITABLE]) {
		    var current = $getOwnPropertyDescriptor(O, P);
		    if (current && current[WRITABLE]) {
		      O[P] = Attributes.value;
		      Attributes = {
		        configurable: CONFIGURABLE in Attributes ? Attributes[CONFIGURABLE] : current[CONFIGURABLE],
		        enumerable: ENUMERABLE in Attributes ? Attributes[ENUMERABLE] : current[ENUMERABLE],
		        writable: false
		      };
		    }
		  } return $defineProperty(O, P, Attributes);
		} : $defineProperty : function defineProperty(O, P, Attributes) {
		  anObject(O);
		  P = toPropertyKey(P);
		  anObject(Attributes);
		  if (IE8_DOM_DEFINE) try {
		    return $defineProperty(O, P, Attributes);
		  } catch (error) { /* empty */ }
		  if ('get' in Attributes || 'set' in Attributes) throw new $TypeError('Accessors not supported');
		  if ('value' in Attributes) O[P] = Attributes.value;
		  return O;
		};
		return objectDefineProperty;
	}

	var createNonEnumerableProperty;
	var hasRequiredCreateNonEnumerableProperty;

	function requireCreateNonEnumerableProperty () {
		if (hasRequiredCreateNonEnumerableProperty) return createNonEnumerableProperty;
		hasRequiredCreateNonEnumerableProperty = 1;
		var DESCRIPTORS = requireDescriptors();
		var definePropertyModule = requireObjectDefineProperty();
		var createPropertyDescriptor = requireCreatePropertyDescriptor();

		createNonEnumerableProperty = DESCRIPTORS ? function (object, key, value) {
		  return definePropertyModule.f(object, key, createPropertyDescriptor(1, value));
		} : function (object, key, value) {
		  object[key] = value;
		  return object;
		};
		return createNonEnumerableProperty;
	}

	var makeBuiltIn = {exports: {}};

	var functionName;
	var hasRequiredFunctionName;

	function requireFunctionName () {
		if (hasRequiredFunctionName) return functionName;
		hasRequiredFunctionName = 1;
		var DESCRIPTORS = requireDescriptors();
		var hasOwn = requireHasOwnProperty();

		var FunctionPrototype = Function.prototype;
		// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
		var getDescriptor = DESCRIPTORS && Object.getOwnPropertyDescriptor;

		var EXISTS = hasOwn(FunctionPrototype, 'name');
		// additional protection from minified / mangled / dropped function names
		var PROPER = EXISTS && function something() { /* empty */ }.name === 'something';
		var CONFIGURABLE = EXISTS && (!DESCRIPTORS || (DESCRIPTORS && getDescriptor(FunctionPrototype, 'name').configurable));

		functionName = {
		  EXISTS: EXISTS,
		  PROPER: PROPER,
		  CONFIGURABLE: CONFIGURABLE
		};
		return functionName;
	}

	var inspectSource;
	var hasRequiredInspectSource;

	function requireInspectSource () {
		if (hasRequiredInspectSource) return inspectSource;
		hasRequiredInspectSource = 1;
		var uncurryThis = requireFunctionUncurryThis();
		var isCallable = requireIsCallable();
		var store = requireSharedStore();

		var functionToString = uncurryThis(Function.toString);

		// this helper broken in `core-js@3.4.1-3.4.4`, so we can't use `shared` helper
		if (!isCallable(store.inspectSource)) {
		  store.inspectSource = function (it) {
		    return functionToString(it);
		  };
		}

		inspectSource = store.inspectSource;
		return inspectSource;
	}

	var weakMapBasicDetection;
	var hasRequiredWeakMapBasicDetection;

	function requireWeakMapBasicDetection () {
		if (hasRequiredWeakMapBasicDetection) return weakMapBasicDetection;
		hasRequiredWeakMapBasicDetection = 1;
		var globalThis = requireGlobalThis();
		var isCallable = requireIsCallable();

		var WeakMap = globalThis.WeakMap;

		weakMapBasicDetection = isCallable(WeakMap) && /native code/.test(String(WeakMap));
		return weakMapBasicDetection;
	}

	var sharedKey;
	var hasRequiredSharedKey;

	function requireSharedKey () {
		if (hasRequiredSharedKey) return sharedKey;
		hasRequiredSharedKey = 1;
		var shared = requireShared();
		var uid = requireUid();

		var keys = shared('keys');

		sharedKey = function (key) {
		  return keys[key] || (keys[key] = uid(key));
		};
		return sharedKey;
	}

	var hiddenKeys;
	var hasRequiredHiddenKeys;

	function requireHiddenKeys () {
		if (hasRequiredHiddenKeys) return hiddenKeys;
		hasRequiredHiddenKeys = 1;
		hiddenKeys = {};
		return hiddenKeys;
	}

	var internalState;
	var hasRequiredInternalState;

	function requireInternalState () {
		if (hasRequiredInternalState) return internalState;
		hasRequiredInternalState = 1;
		var NATIVE_WEAK_MAP = requireWeakMapBasicDetection();
		var globalThis = requireGlobalThis();
		var isObject = requireIsObject();
		var createNonEnumerableProperty = requireCreateNonEnumerableProperty();
		var hasOwn = requireHasOwnProperty();
		var shared = requireSharedStore();
		var sharedKey = requireSharedKey();
		var hiddenKeys = requireHiddenKeys();

		var OBJECT_ALREADY_INITIALIZED = 'Object already initialized';
		var TypeError = globalThis.TypeError;
		var WeakMap = globalThis.WeakMap;
		var set, get, has;

		var enforce = function (it) {
		  return has(it) ? get(it) : set(it, {});
		};

		var getterFor = function (TYPE) {
		  return function (it) {
		    var state;
		    if (!isObject(it) || (state = get(it)).type !== TYPE) {
		      throw new TypeError('Incompatible receiver, ' + TYPE + ' required');
		    } return state;
		  };
		};

		if (NATIVE_WEAK_MAP || shared.state) {
		  var store = shared.state || (shared.state = new WeakMap());
		  /* eslint-disable no-self-assign -- prototype methods protection */
		  store.get = store.get;
		  store.has = store.has;
		  store.set = store.set;
		  /* eslint-enable no-self-assign -- prototype methods protection */
		  set = function (it, metadata) {
		    if (store.has(it)) throw new TypeError(OBJECT_ALREADY_INITIALIZED);
		    metadata.facade = it;
		    store.set(it, metadata);
		    return metadata;
		  };
		  get = function (it) {
		    return store.get(it) || {};
		  };
		  has = function (it) {
		    return store.has(it);
		  };
		} else {
		  var STATE = sharedKey('state');
		  hiddenKeys[STATE] = true;
		  set = function (it, metadata) {
		    if (hasOwn(it, STATE)) throw new TypeError(OBJECT_ALREADY_INITIALIZED);
		    metadata.facade = it;
		    createNonEnumerableProperty(it, STATE, metadata);
		    return metadata;
		  };
		  get = function (it) {
		    return hasOwn(it, STATE) ? it[STATE] : {};
		  };
		  has = function (it) {
		    return hasOwn(it, STATE);
		  };
		}

		internalState = {
		  set: set,
		  get: get,
		  has: has,
		  enforce: enforce,
		  getterFor: getterFor
		};
		return internalState;
	}

	var hasRequiredMakeBuiltIn;

	function requireMakeBuiltIn () {
		if (hasRequiredMakeBuiltIn) return makeBuiltIn.exports;
		hasRequiredMakeBuiltIn = 1;
		var uncurryThis = requireFunctionUncurryThis();
		var fails = requireFails();
		var isCallable = requireIsCallable();
		var hasOwn = requireHasOwnProperty();
		var DESCRIPTORS = requireDescriptors();
		var CONFIGURABLE_FUNCTION_NAME = requireFunctionName().CONFIGURABLE;
		var inspectSource = requireInspectSource();
		var InternalStateModule = requireInternalState();

		var enforceInternalState = InternalStateModule.enforce;
		var getInternalState = InternalStateModule.get;
		var $String = String;
		// eslint-disable-next-line es/no-object-defineproperty -- safe
		var defineProperty = Object.defineProperty;
		var stringSlice = uncurryThis(''.slice);
		var replace = uncurryThis(''.replace);
		var join = uncurryThis([].join);

		var CONFIGURABLE_LENGTH = DESCRIPTORS && !fails(function () {
		  return defineProperty(function () { /* empty */ }, 'length', { value: 8 }).length !== 8;
		});

		var TEMPLATE = String(String).split('String');

		var makeBuiltIn$1 = makeBuiltIn.exports = function (value, name, options) {
		  if (stringSlice($String(name), 0, 7) === 'Symbol(') {
		    name = '[' + replace($String(name), /^Symbol\(([^)]*)\).*$/, '$1') + ']';
		  }
		  if (options && options.getter) name = 'get ' + name;
		  if (options && options.setter) name = 'set ' + name;
		  if (!hasOwn(value, 'name') || (CONFIGURABLE_FUNCTION_NAME && value.name !== name)) {
		    if (DESCRIPTORS) defineProperty(value, 'name', { value: name, configurable: true });
		    else value.name = name;
		  }
		  if (CONFIGURABLE_LENGTH && options && hasOwn(options, 'arity') && value.length !== options.arity) {
		    defineProperty(value, 'length', { value: options.arity });
		  }
		  try {
		    if (options && hasOwn(options, 'constructor') && options.constructor) {
		      if (DESCRIPTORS) defineProperty(value, 'prototype', { writable: false });
		    // in V8 ~ Chrome 53, prototypes of some methods, like `Array.prototype.values`, are non-writable
		    } else if (value.prototype) value.prototype = undefined;
		  } catch (error) { /* empty */ }
		  var state = enforceInternalState(value);
		  if (!hasOwn(state, 'source')) {
		    state.source = join(TEMPLATE, typeof name == 'string' ? name : '');
		  } return value;
		};

		// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
		// eslint-disable-next-line no-extend-native -- required
		Function.prototype.toString = makeBuiltIn$1(function toString() {
		  return isCallable(this) && getInternalState(this).source || inspectSource(this);
		}, 'toString');
		return makeBuiltIn.exports;
	}

	var defineBuiltIn;
	var hasRequiredDefineBuiltIn;

	function requireDefineBuiltIn () {
		if (hasRequiredDefineBuiltIn) return defineBuiltIn;
		hasRequiredDefineBuiltIn = 1;
		var isCallable = requireIsCallable();
		var definePropertyModule = requireObjectDefineProperty();
		var makeBuiltIn = requireMakeBuiltIn();
		var defineGlobalProperty = requireDefineGlobalProperty();

		defineBuiltIn = function (O, key, value, options) {
		  if (!options) options = {};
		  var simple = options.enumerable;
		  var name = options.name !== undefined ? options.name : key;
		  if (isCallable(value)) makeBuiltIn(value, name, options);
		  if (options.global) {
		    if (simple) O[key] = value;
		    else defineGlobalProperty(key, value);
		  } else {
		    try {
		      if (!options.unsafe) delete O[key];
		      else if (O[key]) simple = true;
		    } catch (error) { /* empty */ }
		    if (simple) O[key] = value;
		    else definePropertyModule.f(O, key, {
		      value: value,
		      enumerable: false,
		      configurable: !options.nonConfigurable,
		      writable: !options.nonWritable
		    });
		  } return O;
		};
		return defineBuiltIn;
	}

	var objectGetOwnPropertyNames = {};

	var mathTrunc;
	var hasRequiredMathTrunc;

	function requireMathTrunc () {
		if (hasRequiredMathTrunc) return mathTrunc;
		hasRequiredMathTrunc = 1;
		var ceil = Math.ceil;
		var floor = Math.floor;

		// `Math.trunc` method
		// https://tc39.es/ecma262/#sec-math.trunc
		// eslint-disable-next-line es/no-math-trunc -- safe
		mathTrunc = Math.trunc || function trunc(x) {
		  var n = +x;
		  return (n > 0 ? floor : ceil)(n);
		};
		return mathTrunc;
	}

	var toIntegerOrInfinity;
	var hasRequiredToIntegerOrInfinity;

	function requireToIntegerOrInfinity () {
		if (hasRequiredToIntegerOrInfinity) return toIntegerOrInfinity;
		hasRequiredToIntegerOrInfinity = 1;
		var trunc = requireMathTrunc();

		// `ToIntegerOrInfinity` abstract operation
		// https://tc39.es/ecma262/#sec-tointegerorinfinity
		toIntegerOrInfinity = function (argument) {
		  var number = +argument;
		  // eslint-disable-next-line no-self-compare -- NaN check
		  return number !== number || number === 0 ? 0 : trunc(number);
		};
		return toIntegerOrInfinity;
	}

	var toAbsoluteIndex;
	var hasRequiredToAbsoluteIndex;

	function requireToAbsoluteIndex () {
		if (hasRequiredToAbsoluteIndex) return toAbsoluteIndex;
		hasRequiredToAbsoluteIndex = 1;
		var toIntegerOrInfinity = requireToIntegerOrInfinity();

		var max = Math.max;
		var min = Math.min;

		// Helper for a popular repeating case of the spec:
		// Let integer be ? ToInteger(index).
		// If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).
		toAbsoluteIndex = function (index, length) {
		  var integer = toIntegerOrInfinity(index);
		  return integer < 0 ? max(integer + length, 0) : min(integer, length);
		};
		return toAbsoluteIndex;
	}

	var toLength;
	var hasRequiredToLength;

	function requireToLength () {
		if (hasRequiredToLength) return toLength;
		hasRequiredToLength = 1;
		var toIntegerOrInfinity = requireToIntegerOrInfinity();

		var min = Math.min;

		// `ToLength` abstract operation
		// https://tc39.es/ecma262/#sec-tolength
		toLength = function (argument) {
		  var len = toIntegerOrInfinity(argument);
		  return len > 0 ? min(len, 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
		};
		return toLength;
	}

	var lengthOfArrayLike;
	var hasRequiredLengthOfArrayLike;

	function requireLengthOfArrayLike () {
		if (hasRequiredLengthOfArrayLike) return lengthOfArrayLike;
		hasRequiredLengthOfArrayLike = 1;
		var toLength = requireToLength();

		// `LengthOfArrayLike` abstract operation
		// https://tc39.es/ecma262/#sec-lengthofarraylike
		lengthOfArrayLike = function (obj) {
		  return toLength(obj.length);
		};
		return lengthOfArrayLike;
	}

	var arrayIncludes;
	var hasRequiredArrayIncludes;

	function requireArrayIncludes () {
		if (hasRequiredArrayIncludes) return arrayIncludes;
		hasRequiredArrayIncludes = 1;
		var toIndexedObject = requireToIndexedObject();
		var toAbsoluteIndex = requireToAbsoluteIndex();
		var lengthOfArrayLike = requireLengthOfArrayLike();

		// `Array.prototype.{ indexOf, includes }` methods implementation
		var createMethod = function (IS_INCLUDES) {
		  return function ($this, el, fromIndex) {
		    var O = toIndexedObject($this);
		    var length = lengthOfArrayLike(O);
		    if (length === 0) return !IS_INCLUDES && -1;
		    var index = toAbsoluteIndex(fromIndex, length);
		    var value;
		    // Array#includes uses SameValueZero equality algorithm
		    // eslint-disable-next-line no-self-compare -- NaN check
		    if (IS_INCLUDES && el !== el) while (length > index) {
		      value = O[index++];
		      // eslint-disable-next-line no-self-compare -- NaN check
		      if (value !== value) return true;
		    // Array#indexOf ignores holes, Array#includes - not
		    } else for (;length > index; index++) {
		      if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
		    } return !IS_INCLUDES && -1;
		  };
		};

		arrayIncludes = {
		  // `Array.prototype.includes` method
		  // https://tc39.es/ecma262/#sec-array.prototype.includes
		  includes: createMethod(true),
		  // `Array.prototype.indexOf` method
		  // https://tc39.es/ecma262/#sec-array.prototype.indexof
		  indexOf: createMethod(false)
		};
		return arrayIncludes;
	}

	var objectKeysInternal;
	var hasRequiredObjectKeysInternal;

	function requireObjectKeysInternal () {
		if (hasRequiredObjectKeysInternal) return objectKeysInternal;
		hasRequiredObjectKeysInternal = 1;
		var uncurryThis = requireFunctionUncurryThis();
		var hasOwn = requireHasOwnProperty();
		var toIndexedObject = requireToIndexedObject();
		var indexOf = requireArrayIncludes().indexOf;
		var hiddenKeys = requireHiddenKeys();

		var push = uncurryThis([].push);

		objectKeysInternal = function (object, names) {
		  var O = toIndexedObject(object);
		  var i = 0;
		  var result = [];
		  var key;
		  for (key in O) !hasOwn(hiddenKeys, key) && hasOwn(O, key) && push(result, key);
		  // Don't enum bug & hidden keys
		  while (names.length > i) if (hasOwn(O, key = names[i++])) {
		    ~indexOf(result, key) || push(result, key);
		  }
		  return result;
		};
		return objectKeysInternal;
	}

	var enumBugKeys;
	var hasRequiredEnumBugKeys;

	function requireEnumBugKeys () {
		if (hasRequiredEnumBugKeys) return enumBugKeys;
		hasRequiredEnumBugKeys = 1;
		// IE8- don't enum bug keys
		enumBugKeys = [
		  'constructor',
		  'hasOwnProperty',
		  'isPrototypeOf',
		  'propertyIsEnumerable',
		  'toLocaleString',
		  'toString',
		  'valueOf'
		];
		return enumBugKeys;
	}

	var hasRequiredObjectGetOwnPropertyNames;

	function requireObjectGetOwnPropertyNames () {
		if (hasRequiredObjectGetOwnPropertyNames) return objectGetOwnPropertyNames;
		hasRequiredObjectGetOwnPropertyNames = 1;
		var internalObjectKeys = requireObjectKeysInternal();
		var enumBugKeys = requireEnumBugKeys();

		var hiddenKeys = enumBugKeys.concat('length', 'prototype');

		// `Object.getOwnPropertyNames` method
		// https://tc39.es/ecma262/#sec-object.getownpropertynames
		// eslint-disable-next-line es/no-object-getownpropertynames -- safe
		objectGetOwnPropertyNames.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
		  return internalObjectKeys(O, hiddenKeys);
		};
		return objectGetOwnPropertyNames;
	}

	var objectGetOwnPropertySymbols = {};

	var hasRequiredObjectGetOwnPropertySymbols;

	function requireObjectGetOwnPropertySymbols () {
		if (hasRequiredObjectGetOwnPropertySymbols) return objectGetOwnPropertySymbols;
		hasRequiredObjectGetOwnPropertySymbols = 1;
		// eslint-disable-next-line es/no-object-getownpropertysymbols -- safe
		objectGetOwnPropertySymbols.f = Object.getOwnPropertySymbols;
		return objectGetOwnPropertySymbols;
	}

	var ownKeys;
	var hasRequiredOwnKeys;

	function requireOwnKeys () {
		if (hasRequiredOwnKeys) return ownKeys;
		hasRequiredOwnKeys = 1;
		var getBuiltIn = requireGetBuiltIn();
		var uncurryThis = requireFunctionUncurryThis();
		var getOwnPropertyNamesModule = requireObjectGetOwnPropertyNames();
		var getOwnPropertySymbolsModule = requireObjectGetOwnPropertySymbols();
		var anObject = requireAnObject();

		var concat = uncurryThis([].concat);

		// all object keys, includes non-enumerable and symbols
		ownKeys = getBuiltIn('Reflect', 'ownKeys') || function ownKeys(it) {
		  var keys = getOwnPropertyNamesModule.f(anObject(it));
		  var getOwnPropertySymbols = getOwnPropertySymbolsModule.f;
		  return getOwnPropertySymbols ? concat(keys, getOwnPropertySymbols(it)) : keys;
		};
		return ownKeys;
	}

	var copyConstructorProperties;
	var hasRequiredCopyConstructorProperties;

	function requireCopyConstructorProperties () {
		if (hasRequiredCopyConstructorProperties) return copyConstructorProperties;
		hasRequiredCopyConstructorProperties = 1;
		var hasOwn = requireHasOwnProperty();
		var ownKeys = requireOwnKeys();
		var getOwnPropertyDescriptorModule = requireObjectGetOwnPropertyDescriptor();
		var definePropertyModule = requireObjectDefineProperty();

		copyConstructorProperties = function (target, source, exceptions) {
		  var keys = ownKeys(source);
		  var defineProperty = definePropertyModule.f;
		  var getOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;
		  for (var i = 0; i < keys.length; i++) {
		    var key = keys[i];
		    if (!hasOwn(target, key) && !(exceptions && hasOwn(exceptions, key))) {
		      defineProperty(target, key, getOwnPropertyDescriptor(source, key));
		    }
		  }
		};
		return copyConstructorProperties;
	}

	var isForced_1;
	var hasRequiredIsForced;

	function requireIsForced () {
		if (hasRequiredIsForced) return isForced_1;
		hasRequiredIsForced = 1;
		var fails = requireFails();
		var isCallable = requireIsCallable();

		var replacement = /#|\.prototype\./;

		var isForced = function (feature, detection) {
		  var value = data[normalize(feature)];
		  return value === POLYFILL ? true
		    : value === NATIVE ? false
		    : isCallable(detection) ? fails(detection)
		    : !!detection;
		};

		var normalize = isForced.normalize = function (string) {
		  return String(string).replace(replacement, '.').toLowerCase();
		};

		var data = isForced.data = {};
		var NATIVE = isForced.NATIVE = 'N';
		var POLYFILL = isForced.POLYFILL = 'P';

		isForced_1 = isForced;
		return isForced_1;
	}

	var _export;
	var hasRequired_export;

	function require_export () {
		if (hasRequired_export) return _export;
		hasRequired_export = 1;
		var globalThis = requireGlobalThis();
		var getOwnPropertyDescriptor = requireObjectGetOwnPropertyDescriptor().f;
		var createNonEnumerableProperty = requireCreateNonEnumerableProperty();
		var defineBuiltIn = requireDefineBuiltIn();
		var defineGlobalProperty = requireDefineGlobalProperty();
		var copyConstructorProperties = requireCopyConstructorProperties();
		var isForced = requireIsForced();

		/*
		  options.target         - name of the target object
		  options.global         - target is the global object
		  options.stat           - export as static methods of target
		  options.proto          - export as prototype methods of target
		  options.real           - real prototype method for the `pure` version
		  options.forced         - export even if the native feature is available
		  options.bind           - bind methods to the target, required for the `pure` version
		  options.wrap           - wrap constructors to preventing global pollution, required for the `pure` version
		  options.unsafe         - use the simple assignment of property instead of delete + defineProperty
		  options.sham           - add a flag to not completely full polyfills
		  options.enumerable     - export as enumerable property
		  options.dontCallGetSet - prevent calling a getter on target
		  options.name           - the .name of the function if it does not match the key
		*/
		_export = function (options, source) {
		  var TARGET = options.target;
		  var GLOBAL = options.global;
		  var STATIC = options.stat;
		  var FORCED, target, key, targetProperty, sourceProperty, descriptor;
		  if (GLOBAL) {
		    target = globalThis;
		  } else if (STATIC) {
		    target = globalThis[TARGET] || defineGlobalProperty(TARGET, {});
		  } else {
		    target = globalThis[TARGET] && globalThis[TARGET].prototype;
		  }
		  if (target) for (key in source) {
		    sourceProperty = source[key];
		    if (options.dontCallGetSet) {
		      descriptor = getOwnPropertyDescriptor(target, key);
		      targetProperty = descriptor && descriptor.value;
		    } else targetProperty = target[key];
		    FORCED = isForced(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced);
		    // contained in target
		    if (!FORCED && targetProperty !== undefined) {
		      if (typeof sourceProperty == typeof targetProperty) continue;
		      copyConstructorProperties(sourceProperty, targetProperty);
		    }
		    // add a flag to not completely full polyfills
		    if (options.sham || (targetProperty && targetProperty.sham)) {
		      createNonEnumerableProperty(sourceProperty, 'sham', true);
		    }
		    defineBuiltIn(target, key, sourceProperty, options);
		  }
		};
		return _export;
	}

	var objectDefineProperties = {};

	var objectKeys;
	var hasRequiredObjectKeys;

	function requireObjectKeys () {
		if (hasRequiredObjectKeys) return objectKeys;
		hasRequiredObjectKeys = 1;
		var internalObjectKeys = requireObjectKeysInternal();
		var enumBugKeys = requireEnumBugKeys();

		// `Object.keys` method
		// https://tc39.es/ecma262/#sec-object.keys
		// eslint-disable-next-line es/no-object-keys -- safe
		objectKeys = Object.keys || function keys(O) {
		  return internalObjectKeys(O, enumBugKeys);
		};
		return objectKeys;
	}

	var hasRequiredObjectDefineProperties;

	function requireObjectDefineProperties () {
		if (hasRequiredObjectDefineProperties) return objectDefineProperties;
		hasRequiredObjectDefineProperties = 1;
		var DESCRIPTORS = requireDescriptors();
		var V8_PROTOTYPE_DEFINE_BUG = requireV8PrototypeDefineBug();
		var definePropertyModule = requireObjectDefineProperty();
		var anObject = requireAnObject();
		var toIndexedObject = requireToIndexedObject();
		var objectKeys = requireObjectKeys();

		// `Object.defineProperties` method
		// https://tc39.es/ecma262/#sec-object.defineproperties
		// eslint-disable-next-line es/no-object-defineproperties -- safe
		objectDefineProperties.f = DESCRIPTORS && !V8_PROTOTYPE_DEFINE_BUG ? Object.defineProperties : function defineProperties(O, Properties) {
		  anObject(O);
		  var props = toIndexedObject(Properties);
		  var keys = objectKeys(Properties);
		  var length = keys.length;
		  var index = 0;
		  var key;
		  while (length > index) definePropertyModule.f(O, key = keys[index++], props[key]);
		  return O;
		};
		return objectDefineProperties;
	}

	var html;
	var hasRequiredHtml;

	function requireHtml () {
		if (hasRequiredHtml) return html;
		hasRequiredHtml = 1;
		var getBuiltIn = requireGetBuiltIn();

		html = getBuiltIn('document', 'documentElement');
		return html;
	}

	var objectCreate;
	var hasRequiredObjectCreate;

	function requireObjectCreate () {
		if (hasRequiredObjectCreate) return objectCreate;
		hasRequiredObjectCreate = 1;
		/* global ActiveXObject -- old IE, WSH */
		var anObject = requireAnObject();
		var definePropertiesModule = requireObjectDefineProperties();
		var enumBugKeys = requireEnumBugKeys();
		var hiddenKeys = requireHiddenKeys();
		var html = requireHtml();
		var documentCreateElement = requireDocumentCreateElement();
		var sharedKey = requireSharedKey();

		var GT = '>';
		var LT = '<';
		var PROTOTYPE = 'prototype';
		var SCRIPT = 'script';
		var IE_PROTO = sharedKey('IE_PROTO');

		var EmptyConstructor = function () { /* empty */ };

		var scriptTag = function (content) {
		  return LT + SCRIPT + GT + content + LT + '/' + SCRIPT + GT;
		};

		// Create object with fake `null` prototype: use ActiveX Object with cleared prototype
		var NullProtoObjectViaActiveX = function (activeXDocument) {
		  activeXDocument.write(scriptTag(''));
		  activeXDocument.close();
		  var temp = activeXDocument.parentWindow.Object;
		  // eslint-disable-next-line no-useless-assignment -- avoid memory leak
		  activeXDocument = null;
		  return temp;
		};

		// Create object with fake `null` prototype: use iframe Object with cleared prototype
		var NullProtoObjectViaIFrame = function () {
		  // Thrash, waste and sodomy: IE GC bug
		  var iframe = documentCreateElement('iframe');
		  var JS = 'java' + SCRIPT + ':';
		  var iframeDocument;
		  iframe.style.display = 'none';
		  html.appendChild(iframe);
		  // https://github.com/zloirock/core-js/issues/475
		  iframe.src = String(JS);
		  iframeDocument = iframe.contentWindow.document;
		  iframeDocument.open();
		  iframeDocument.write(scriptTag('document.F=Object'));
		  iframeDocument.close();
		  return iframeDocument.F;
		};

		// Check for document.domain and active x support
		// No need to use active x approach when document.domain is not set
		// see https://github.com/es-shims/es5-shim/issues/150
		// variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
		// avoid IE GC bug
		var activeXDocument;
		var NullProtoObject = function () {
		  try {
		    activeXDocument = new ActiveXObject('htmlfile');
		  } catch (error) { /* ignore */ }
		  NullProtoObject = typeof document != 'undefined'
		    ? document.domain && activeXDocument
		      ? NullProtoObjectViaActiveX(activeXDocument) // old IE
		      : NullProtoObjectViaIFrame()
		    : NullProtoObjectViaActiveX(activeXDocument); // WSH
		  var length = enumBugKeys.length;
		  while (length--) delete NullProtoObject[PROTOTYPE][enumBugKeys[length]];
		  return NullProtoObject();
		};

		hiddenKeys[IE_PROTO] = true;

		// `Object.create` method
		// https://tc39.es/ecma262/#sec-object.create
		// eslint-disable-next-line es/no-object-create -- safe
		objectCreate = Object.create || function create(O, Properties) {
		  var result;
		  if (O !== null) {
		    EmptyConstructor[PROTOTYPE] = anObject(O);
		    result = new EmptyConstructor();
		    EmptyConstructor[PROTOTYPE] = null;
		    // add "__proto__" for Object.getPrototypeOf polyfill
		    result[IE_PROTO] = O;
		  } else result = NullProtoObject();
		  return Properties === undefined ? result : definePropertiesModule.f(result, Properties);
		};
		return objectCreate;
	}

	var addToUnscopables;
	var hasRequiredAddToUnscopables;

	function requireAddToUnscopables () {
		if (hasRequiredAddToUnscopables) return addToUnscopables;
		hasRequiredAddToUnscopables = 1;
		var wellKnownSymbol = requireWellKnownSymbol();
		var create = requireObjectCreate();
		var defineProperty = requireObjectDefineProperty().f;

		var UNSCOPABLES = wellKnownSymbol('unscopables');
		var ArrayPrototype = Array.prototype;

		// Array.prototype[@@unscopables]
		// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
		if (ArrayPrototype[UNSCOPABLES] === undefined) {
		  defineProperty(ArrayPrototype, UNSCOPABLES, {
		    configurable: true,
		    value: create(null)
		  });
		}

		// add a key to Array.prototype[@@unscopables]
		addToUnscopables = function (key) {
		  ArrayPrototype[UNSCOPABLES][key] = true;
		};
		return addToUnscopables;
	}

	var hasRequiredEs_array_includes;

	function requireEs_array_includes () {
		if (hasRequiredEs_array_includes) return es_array_includes;
		hasRequiredEs_array_includes = 1;
		var $ = require_export();
		var $includes = requireArrayIncludes().includes;
		var fails = requireFails();
		var addToUnscopables = requireAddToUnscopables();

		// FF99+ bug
		var BROKEN_ON_SPARSE = fails(function () {
		  // eslint-disable-next-line es/no-array-prototype-includes -- detection
		  return !Array(1).includes();
		});

		// Safari 26.4- bug
		var BROKEN_ON_SPARSE_WITH_FROM_INDEX = fails(function () {
		  // eslint-disable-next-line no-sparse-arrays, es/no-array-prototype-includes -- detection
		  return [, 1].includes(undefined, 1);
		});

		// `Array.prototype.includes` method
		// https://tc39.es/ecma262/#sec-array.prototype.includes
		$({ target: 'Array', proto: true, forced: BROKEN_ON_SPARSE || BROKEN_ON_SPARSE_WITH_FROM_INDEX }, {
		  includes: function includes(el /* , fromIndex = 0 */) {
		    return $includes(this, el, arguments.length > 1 ? arguments[1] : undefined);
		  }
		});

		// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
		addToUnscopables('includes');
		return es_array_includes;
	}

	requireEs_array_includes();

	/**
	 * @file starmus-transcript-provider.js
	 * @summary The live-transcript slot: provider-agnostic, one output contract.
	 *
	 * Governed by ADR-038. The capture UI does not own a transcription engine — it
	 * owns a *slot* with a fixed output shape, so that swapping the engine behind
	 * it is not a UI change. Browser speech recognition is the first provider
	 * (Tier A, content in SR-supported languages); a future Yahura live provider
	 * for African languages fills the same slot without rework here.
	 *
	 * Three things the output always carries, per ADR-038:
	 *
	 *   1. tokens;
	 *   2. timestamps on the **original timeline** — there is exactly one timeline,
	 *      the recording's own, and every downstream result maps to it (ADR-039);
	 *   3. provenance naming the engine and the model version.
	 *
	 * And three things it is not:
	 *
	 *   - **Not the boundary mechanism of record.** Speech/silence boundaries are
	 *     computed server-side by the Spoken Audio Node's VAD, for every recording,
	 *     language and device tier. No provider here ever replaces that, and a
	 *     provider being unavailable never means a recording has no boundaries.
	 *   - **Not word-level alignment of record.** That is ESU's, from Yahura.
	 *   - **Not acoustic analysis.** No pitch, formant, intensity or duration
	 *     measurement happens in this package (ADR-036).
	 *
	 * What leaves here is a **lowest-authority machine draft**. It is a starting
	 * point for human correction in ESU and is never treated as the transcript.
	 *
	 * The field names below are this package's own output shape, which ADR-038
	 * assigns to the capture UI. They are not the Starmus<->ESU wire schema: that
	 * seam's key names are owed jointly by both builders and are not guessed here.
	 */

	const TRANSCRIPT_AUTHORITY = "machine-draft";

	/**
	 * Default auto-disable bound for a running provider, in milliseconds.
	 *
	 * This is a sensor-safety bound — a provider left running because `stop()` was
	 * never reached must not hold the microphone pipeline open indefinitely. It is
	 * not an audio constraint and answers nothing in OQ-021.
	 *
	 * @type {number}
	 */
	const DEFAULT_MAX_PROVIDER_MS = 3600000;

	/**
	 * How many times the slot restarts an engine that ended on its own.
	 *
	 * Browser speech recognition ends spontaneously, so some restarting is
	 * ordinary. An unbounded loop against an engine that will never work is not:
	 * it holds the microphone pipeline open and produces nothing. After this many
	 * the draft settles and says so.
	 *
	 * @type {number}
	 */
	const MAX_PROVIDER_RESTARTS = 5;

	/**
	 * The device tiers this package knows.
	 *
	 * A value outside this set is a caller error, not a tier to interpret.
	 *
	 * @type {readonly string[]}
	 */
	const SUPPORTED_TIERS = Object.freeze(["A", "B", "C"]);

	/**
	 * How long `stop()` waits for the engine's closing result before settling.
	 *
	 * The engine delivers a final result for audio it already heard after being
	 * asked to stop. This bounds the wait so an engine that never reports ending
	 * does not hold the draft open.
	 *
	 * @type {number}
	 */
	const SETTLE_GRACE_MS = 2000;

	/**
	 * Registered provider factories, in preference order.
	 *
	 * @type {Array<{name: string, create: Function}>}
	 */
	const providerFactories = [];

	/**
	 * Register a live-transcript provider.
	 *
	 * A factory returns a provider object:
	 *
	 *   {
	 *     engine: string,          // e.g. 'browser-speech-recognition'
	 *     model: string|null,      // engine's model/version identifier, or null
	 *                              // when the engine does not expose one
	 *     tokenGranularity?: 'word'|'utterance',  // defaults to 'utterance'
	 *     start(context): void,    // context.emit(segment)
	 *                              // context.fail(error)
	 *                              // context.ended(reason) — the engine stopped
	 *                              //   producing, whether asked to or not
	 *     stop(): void,            // ask the engine to finish; it may still
	 *                              //   deliver one last final result afterwards
	 *   }
	 *
	 * The factory returns `null` when it cannot run in the current environment.
	 * Registering does not start anything.
	 *
	 * @param {string} name
	 * @param {function(Object): (Object|null)} create
	 * @returns {void}
	 */
	function registerTranscriptProvider(name, create) {
	  if (typeof create !== "function") {
	    throw new Error("TRANSCRIPT_PROVIDER_INVALID: create must be a function");
	  }
	  const existing = providerFactories.findIndex(entry => entry.name === name);
	  if (existing >= 0) {
	    providerFactories.splice(existing, 1);
	  }
	  providerFactories.unshift({
	    name,
	    create
	  });
	}

	/**
	 * Remove every registered provider. Test and host-teardown helper.
	 *
	 * @returns {void}
	 */
	function clearTranscriptProviders() {
	  providerFactories.length = 0;
	}

	/* ---- Built-in provider: browser speech recognition (Tier A) ---- */

	/**
	 * Build a provider backed by the browser's SpeechRecognition API.
	 *
	 * The API reports no word timings, so this provider does not invent any. Each
	 * segment is stamped from the recorder clock at the moment the result arrived
	 * and marked `timing: 'approximate'`. Precise word boundaries are ESU's
	 * (alignment) and speech/silence boundaries are the Node's (VAD); a plausible
	 * looking number written here would be read downstream as measurement.
	 *
	 * @param {Object} options
	 * @param {string} [options.language] BCP-47 tag passed to the engine.
	 * @returns {Object|null} null when the API is unavailable.
	 */
	function createBrowserSpeechProvider() {
	  let {
	    language
	  } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	  if (typeof window === "undefined") {
	    return null;
	  }
	  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
	  if (!Recognition) {
	    return null;
	  }
	  let recognition = null;
	  let stopping = false;
	  return {
	    engine: "browser-speech-recognition",
	    // The Web Speech API exposes no model identifier. Reporting null is the
	    // honest answer; a placeholder string would read as provenance.
	    model: null,
	    // The engine emits whole utterances, not words.
	    tokenGranularity: "utterance",
	    start(context) {
	      stopping = false;
	      recognition = new Recognition();
	      recognition.continuous = true;
	      recognition.interimResults = true;
	      if (language) {
	        recognition.lang = language;
	      }
	      recognition.addEventListener("result", event => {
	        for (let i = event.resultIndex; i < event.results.length; i += 1) {
	          const result = event.results[i];
	          const alternative = result[0];
	          if (!alternative || !alternative.transcript) {
	            continue;
	          }
	          context.emit({
	            text: alternative.transcript.trim(),
	            confidence: typeof alternative.confidence === "number" && Number.isFinite(alternative.confidence) ? alternative.confidence : null,
	            isFinal: !!result.isFinal
	          });
	        }
	      });
	      recognition.addEventListener("error", event => {
	        // `no-speech` and `aborted` are ordinary during a recording and
	        // are not failures of the slot. The `end` that follows them is
	        // handled below, so the slot is never left believing a dead
	        // engine is still listening.
	        if (event.error === "no-speech" || event.error === "aborted") {
	          return;
	        }
	        context.fail(new Error(`SPEECH_RECOGNITION_ERROR: ${event.error}`));
	      });

	      // The engine ends on its own — after a silence, after an error it
	      // recovered from, and on some platforms simply after a while. It
	      // also ends because we asked. Only the slot can tell those apart,
	      // so both are reported and it decides.
	      recognition.addEventListener("end", () => {
	        context.ended(stopping ? "stopped" : "engine-ended");
	      });
	      recognition.start();
	    },
	    stop() {
	      if (!recognition) {
	        return;
	      }
	      stopping = true;
	      try {
	        // `stop()` rather than `abort()`: it asks the engine to finish
	        // and deliver a final result for what it has already heard.
	        // `abort()` would discard the last utterance of the recording.
	        recognition.stop();
	      } catch {
	        // Already stopped by the engine; nothing to undo.
	      }
	      recognition = null;
	    }
	  };
	}
	registerTranscriptProvider("browser-speech-recognition", createBrowserSpeechProvider);

	/* ---- The slot ---- */

	/**
	 * Open a live-transcript slot for one recording.
	 *
	 * @param {Object} options
	 * @param {string} options.sessionId          Recorder instance id.
	 * @param {function(): number} options.getElapsedMs
	 *        Milliseconds since recording start — the original timeline. The slot
	 *        never reads a wall clock: a client-supplied absolute timestamp is not
	 *        an ordering authority, and the only timeline that exists here is the
	 *        recording's own.
	 * @param {string} options.tier              Resolved device tier. Required, and
	 *        deliberately without a default: `'C'` would silently deny the slot to
	 *        a caller that forgot to pass one, and `'A'` would silently open the
	 *        microphone pipeline for one. The tier is resolved at initialization
	 *        and the caller knows it.
	 * @param {string} [options.language]         BCP-47 tag.
	 * @param {number} [options.maxDurationMs]    Provider auto-disable bound.
	 * @param {function(Object): void} [options.onUpdate] Called with the draft
	 *        after every segment.
	 * @returns {Object|null} The slot, or null when no provider can run — which is
	 *          not an error: a recording without a live draft is complete.
	 */
	function openTranscriptSlot(_ref) {
	  let {
	    sessionId,
	    getElapsedMs,
	    tier,
	    language,
	    maxDurationMs = DEFAULT_MAX_PROVIDER_MS,
	    onUpdate
	  } = _ref;
	  // Validated against the model, not merely checked for emptiness. Rejecting
	  // only `""` let `'c'` or `'D'` past the Tier C guard below and open a
	  // provider for a tier that does not exist — failing open on the one
	  // decision that says whether a microphone surface is permitted at all.
	  if (!SUPPORTED_TIERS.includes(tier)) {
	    throw new Error(`TRANSCRIPT_SLOT_BAD_TIER: tier must be one of ${SUPPORTED_TIERS.join(", ")}; received ${JSON.stringify(tier)}. ` + "It decides whether a microphone surface exists at all, and this slot does not guess it.");
	  }
	  // Tier C is file upload only — no microphone, and so no live transcript.
	  if (tier === "C") {
	    return null;
	  }
	  if (typeof getElapsedMs !== "function") {
	    throw new Error("TRANSCRIPT_SLOT_NO_CLOCK: getElapsedMs is required");
	  }
	  let provider = null;
	  for (const factory of providerFactories) {
	    provider = factory.create({
	      language,
	      tier,
	      sessionId
	    });
	    if (provider) {
	      break;
	    }
	  }
	  if (!provider) {
	    return null;
	  }

	  // ADR-038 says the output carries tokens. What a token *is* depends on the
	  // engine: browser speech recognition emits whole utterances, and a future
	  // Yahura live provider is expected to emit words. Calling an utterance a
	  // word token would misdescribe it, and dropping the field would leave a
	  // consumer unable to tell which it received — so the granularity travels
	  // with the draft and defaults to the weaker claim.
	  const tokenGranularity = provider.tokenGranularity === "word" ? "word" : "utterance";
	  const segments = [];
	  let stopTimer = null;
	  let settleTimer = null;
	  let running = false;
	  let stopping = false;
	  let restarts = 0;
	  let lastStartMs = 0;
	  /** @type {Function|null} Resolves the promise `stop()` handed out. */
	  let resolveSettled = null;
	  /** @type {Promise<Object>|null} The one promise every `stop()` caller gets. */
	  let pendingStop = null;

	  /**
	   * @returns {Object} The draft in its current state.
	   */
	  function draft() {
	    return {
	      sessionId,
	      authority: TRANSCRIPT_AUTHORITY,
	      // Timestamps are offsets into the recording, never wall-clock.
	      timeline: "original",
	      language: language || null,
	      provenance: {
	        engine: provider.engine,
	        model: provider.model
	      },
	      tokenGranularity,
	      segments: segments.slice()
	    };
	  }
	  const context = {
	    emit(segment) {
	      var _segment$confidence;
	      // Accepted while stopping as well as while running: the engine
	      // delivers a final result for the audio it already heard *after*
	      // being asked to stop, and refusing it here dropped the last
	      // utterance of every recording.
	      if (!running && !stopping) {
	        return;
	      }
	      const endMs = Math.max(0, Math.round(getElapsedMs()));
	      const tail = segments[segments.length - 1];
	      // A trailing interim is provisional text for the utterance still
	      // being spoken. Both a revised interim and the final result for
	      // that same utterance replace it — appending instead would leave
	      // the draft holding two readings of one stretch of speech, and the
	      // interim one would carry a start time the final one needs.
	      const supersedesInterim = !!tail && !tail.isFinal;
	      const entry = {
	        text: String(segment.text || ""),
	        startMs: supersedesInterim ? tail.startMs : Math.min(lastStartMs, endMs),
	        endMs,
	        // The browser engine reports no word timings; the Node's VAD
	        // holds boundaries of record and ESU holds alignment.
	        timing: "approximate",
	        confidence: (_segment$confidence = segment.confidence) !== null && _segment$confidence !== void 0 ? _segment$confidence : null,
	        isFinal: !!segment.isFinal
	      };
	      if (supersedesInterim) {
	        segments[segments.length - 1] = entry;
	      } else {
	        segments.push(entry);
	      }
	      if (entry.isFinal) {
	        lastStartMs = endMs;
	      }
	      if (onUpdate) {
	        onUpdate(draft());
	      }
	    },
	    fail(error) {
	      // A provider failure ends the draft and nothing else. The recording
	      // continues, and the Node still produces boundaries and — through
	      // ESU — a transcript of record.
	      console.warn("[Transcript] Provider failed:", error.message);
	      void stop();
	    },
	    /**
	     * The engine stopped producing.
	     *
	     * @param {string} reason 'stopped' when it was asked to, anything else
	     *        when it ended on its own.
	     */
	    ended(reason) {
	      if (stopping) {
	        // The final result, if there was one, has arrived by now.
	        settle();
	        return;
	      }
	      if (!running) {
	        return;
	      }

	      // Browser speech recognition ends by itself — after a silence,
	      // after a recovered error, or just after a while. Left unhandled
	      // the slot sat marked running with nothing arriving until the
	      // one-hour sensor bound fired, which looks exactly like a
	      // recording with no speech in it.
	      if (restarts < MAX_PROVIDER_RESTARTS) {
	        restarts += 1;
	        try {
	          provider.start(context);
	          return;
	        } catch (error) {
	          console.warn("[Transcript] Provider would not restart:", error.message);
	        }
	      }
	      console.warn(`[Transcript] Provider ended (${reason}) and will not be restarted; settling the draft.`);
	      stopping = true;
	      settle();
	    }
	  };

	  /**
	   * Finish: drop any trailing interim, and hand the draft to whoever is
	   * waiting on `stop()`.
	   *
	   * @returns {void}
	   */
	  function settle() {
	    if (settleTimer) {
	      clearTimeout(settleTimer);
	      settleTimer = null;
	    }
	    // The auto-disable timer as well. `settle()` is reachable from
	    // `ended()` without going through `stop()`, and a timer left armed
	    // there outlives the run: start the slot again and the old callback
	    // stops the new provider and clears the new timer.
	    if (stopTimer) {
	      clearTimeout(stopTimer);
	      stopTimer = null;
	    }
	    running = false;
	    stopping = false;
	    // Interim text is not a draft; drop a trailing interim on settle.
	    while (segments.length > 0 && !segments[segments.length - 1].isFinal) {
	      segments.pop();
	    }
	    if (resolveSettled) {
	      const resolve = resolveSettled;
	      resolveSettled = null;
	      pendingStop = null;
	      resolve(draft());
	    }
	  }

	  /**
	   * Stop the provider and settle the draft.
	   *
	   * Asynchronous because the engine's last final result arrives after it is
	   * asked to stop. Settling synchronously discarded the closing utterance of
	   * every recording. The wait is bounded: an engine that never reports it has
	   * ended does not hold the draft open.
	   *
	   * @returns {Promise<Object>} The final draft.
	   */
	  function stop() {
	    if (stopTimer) {
	      clearTimeout(stopTimer);
	      stopTimer = null;
	    }
	    if (!running && !stopping) {
	      return Promise.resolve(draft());
	    }

	    // One promise for however many callers ask to stop. Minting a new one
	    // per call overwrote `resolveSettled`, so an earlier caller — the
	    // auto-disable timer racing a host's stop, say — was left holding a
	    // promise nothing would ever resolve.
	    if (pendingStop) {
	      // A stop is already in flight. Hand back the same promise and do
	      // not ask the provider to stop twice: a second `stop()` on a
	      // browser engine mid-shutdown is at best ignored and at worst
	      // discards the closing result the first one is waiting for.
	      return pendingStop;
	    }
	    pendingStop = new Promise(resolve => {
	      resolveSettled = resolve;
	    });
	    const settled = pendingStop;
	    stopping = true;
	    running = false;
	    try {
	      provider.stop();
	    } catch (error) {
	      console.warn("[Transcript] Provider would not stop cleanly:", error.message);
	      settle();
	      return settled;
	    }

	    // Only if the provider has not already settled us. A provider may call
	    // `context.ended()` synchronously from `stop()`, and arming the grace
	    // timer afterwards left a stale timer that would settle the *next* run.
	    if (resolveSettled !== null && settleTimer === null) {
	      settleTimer = setTimeout(settle, SETTLE_GRACE_MS);
	    }
	    return settled;
	  }
	  return {
	    /**
	     * Start the provider.
	     *
	     * @returns {void}
	     */
	    start() {
	      if (running) {
	        return;
	      }
	      running = true;
	      stopping = false;
	      restarts = 0;
	      pendingStop = null;
	      resolveSettled = null;
	      lastStartMs = Math.max(0, Math.round(getElapsedMs()));
	      stopTimer = setTimeout(() => void stop(), maxDurationMs);
	      try {
	        provider.start(context);
	      } catch (error) {
	        // A provider that throws on the way up would otherwise leave
	        // the slot marked running with its auto-disable timer armed:
	        // every later start() would no-op and the sensor bound would
	        // fire against a provider that never started.
	        void stop();
	        console.warn("[Transcript] Provider failed to start:", error.message);
	      }
	    },
	    stop,
	    draft,
	    /**
	     * @returns {string} The concatenated final text, for display.
	     */
	    text() {
	      return segments.filter(segment => segment.isFinal).map(segment => segment.text).join(" ").trim();
	    }
	  };
	}

	/* ---- Browser global (separate bundle entry) ---- */

	if (typeof window !== "undefined") {
	  window.StarmusTranscript = {
	    openTranscriptSlot,
	    registerTranscriptProvider,
	    clearTranscriptProviders,
	    createBrowserSpeechProvider,
	    TRANSCRIPT_AUTHORITY
	  };
	}

	exports.DEFAULT_MAX_PROVIDER_MS = DEFAULT_MAX_PROVIDER_MS;
	exports.MAX_PROVIDER_RESTARTS = MAX_PROVIDER_RESTARTS;
	exports.SETTLE_GRACE_MS = SETTLE_GRACE_MS;
	exports.SUPPORTED_TIERS = SUPPORTED_TIERS;
	exports.TRANSCRIPT_AUTHORITY = TRANSCRIPT_AUTHORITY;
	exports.clearTranscriptProviders = clearTranscriptProviders;
	exports.createBrowserSpeechProvider = createBrowserSpeechProvider;
	exports.openTranscriptSlot = openTranscriptSlot;
	exports.registerTranscriptProvider = registerTranscriptProvider;

	return exports;

})({});
