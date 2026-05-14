(function () {
	'use strict';

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function getDefaultExportFromCjs (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	var es_array_indexOf = {};

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

	var ownKeys$3;
	var hasRequiredOwnKeys;

	function requireOwnKeys () {
		if (hasRequiredOwnKeys) return ownKeys$3;
		hasRequiredOwnKeys = 1;
		var getBuiltIn = requireGetBuiltIn();
		var uncurryThis = requireFunctionUncurryThis();
		var getOwnPropertyNamesModule = requireObjectGetOwnPropertyNames();
		var getOwnPropertySymbolsModule = requireObjectGetOwnPropertySymbols();
		var anObject = requireAnObject();

		var concat = uncurryThis([].concat);

		// all object keys, includes non-enumerable and symbols
		ownKeys$3 = getBuiltIn('Reflect', 'ownKeys') || function ownKeys(it) {
		  var keys = getOwnPropertyNamesModule.f(anObject(it));
		  var getOwnPropertySymbols = getOwnPropertySymbolsModule.f;
		  return getOwnPropertySymbols ? concat(keys, getOwnPropertySymbols(it)) : keys;
		};
		return ownKeys$3;
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

	var functionUncurryThisClause;
	var hasRequiredFunctionUncurryThisClause;

	function requireFunctionUncurryThisClause () {
		if (hasRequiredFunctionUncurryThisClause) return functionUncurryThisClause;
		hasRequiredFunctionUncurryThisClause = 1;
		var classofRaw = requireClassofRaw();
		var uncurryThis = requireFunctionUncurryThis();

		functionUncurryThisClause = function (fn) {
		  // Nashorn bug:
		  //   https://github.com/zloirock/core-js/issues/1128
		  //   https://github.com/zloirock/core-js/issues/1130
		  if (classofRaw(fn) === 'Function') return uncurryThis(fn);
		};
		return functionUncurryThisClause;
	}

	var arrayMethodIsStrict;
	var hasRequiredArrayMethodIsStrict;

	function requireArrayMethodIsStrict () {
		if (hasRequiredArrayMethodIsStrict) return arrayMethodIsStrict;
		hasRequiredArrayMethodIsStrict = 1;
		var fails = requireFails();

		arrayMethodIsStrict = function (METHOD_NAME, argument) {
		  var method = [][METHOD_NAME];
		  return !!method && fails(function () {
		    // eslint-disable-next-line no-useless-call -- required for testing
		    method.call(null, argument || function () { return 1; }, 1);
		  });
		};
		return arrayMethodIsStrict;
	}

	var hasRequiredEs_array_indexOf;

	function requireEs_array_indexOf () {
		if (hasRequiredEs_array_indexOf) return es_array_indexOf;
		hasRequiredEs_array_indexOf = 1;
		/* eslint-disable es/no-array-prototype-indexof -- required for testing */
		var $ = require_export();
		var uncurryThis = requireFunctionUncurryThisClause();
		var $indexOf = requireArrayIncludes().indexOf;
		var arrayMethodIsStrict = requireArrayMethodIsStrict();

		var nativeIndexOf = uncurryThis([].indexOf);

		var NEGATIVE_ZERO = !!nativeIndexOf && 1 / nativeIndexOf([1], 1, -0) < 0;
		var FORCED = NEGATIVE_ZERO || !arrayMethodIsStrict('indexOf');

		// `Array.prototype.indexOf` method
		// https://tc39.es/ecma262/#sec-array.prototype.indexof
		$({ target: 'Array', proto: true, forced: FORCED }, {
		  indexOf: function indexOf(searchElement /* , fromIndex = 0 */) {
		    var fromIndex = arguments.length > 1 ? arguments[1] : undefined;
		    return NEGATIVE_ZERO
		      // convert -0 to +0
		      ? nativeIndexOf(this, searchElement, fromIndex) || 0
		      : $indexOf(this, searchElement, fromIndex);
		  }
		});
		return es_array_indexOf;
	}

	requireEs_array_indexOf();

	var es_array_splice = {};

	var isArray;
	var hasRequiredIsArray;

	function requireIsArray () {
		if (hasRequiredIsArray) return isArray;
		hasRequiredIsArray = 1;
		var classof = requireClassofRaw();

		// `IsArray` abstract operation
		// https://tc39.es/ecma262/#sec-isarray
		// eslint-disable-next-line es/no-array-isarray -- safe
		isArray = Array.isArray || function isArray(argument) {
		  return classof(argument) === 'Array';
		};
		return isArray;
	}

	var arraySetLength;
	var hasRequiredArraySetLength;

	function requireArraySetLength () {
		if (hasRequiredArraySetLength) return arraySetLength;
		hasRequiredArraySetLength = 1;
		var DESCRIPTORS = requireDescriptors();
		var isArray = requireIsArray();

		var $TypeError = TypeError;
		// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
		var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

		// Safari < 13 does not throw an error in this case
		var SILENT_ON_NON_WRITABLE_LENGTH_SET = DESCRIPTORS && !function () {
		  // makes no sense without proper strict mode support
		  if (this !== undefined) return true;
		  try {
		    // eslint-disable-next-line es/no-object-defineproperty -- safe
		    Object.defineProperty([], 'length', { writable: false }).length = 1;
		  } catch (error) {
		    return error instanceof TypeError;
		  }
		}();

		arraySetLength = SILENT_ON_NON_WRITABLE_LENGTH_SET ? function (O, length) {
		  if (isArray(O) && !getOwnPropertyDescriptor(O, 'length').writable) {
		    throw new $TypeError('Cannot set read only .length');
		  } return O.length = length;
		} : function (O, length) {
		  return O.length = length;
		};
		return arraySetLength;
	}

	var doesNotExceedSafeInteger;
	var hasRequiredDoesNotExceedSafeInteger;

	function requireDoesNotExceedSafeInteger () {
		if (hasRequiredDoesNotExceedSafeInteger) return doesNotExceedSafeInteger;
		hasRequiredDoesNotExceedSafeInteger = 1;
		var $TypeError = TypeError;
		var MAX_SAFE_INTEGER = 0x1FFFFFFFFFFFFF; // 2 ** 53 - 1 == 9007199254740991

		doesNotExceedSafeInteger = function (it) {
		  if (it > MAX_SAFE_INTEGER) throw new $TypeError('Maximum allowed index exceeded');
		  return it;
		};
		return doesNotExceedSafeInteger;
	}

	var toStringTagSupport;
	var hasRequiredToStringTagSupport;

	function requireToStringTagSupport () {
		if (hasRequiredToStringTagSupport) return toStringTagSupport;
		hasRequiredToStringTagSupport = 1;
		var wellKnownSymbol = requireWellKnownSymbol();

		var TO_STRING_TAG = wellKnownSymbol('toStringTag');
		var test = {};
		// eslint-disable-next-line unicorn/no-immediate-mutation -- ES3 syntax limitation
		test[TO_STRING_TAG] = 'z';

		toStringTagSupport = String(test) === '[object z]';
		return toStringTagSupport;
	}

	var classof;
	var hasRequiredClassof;

	function requireClassof () {
		if (hasRequiredClassof) return classof;
		hasRequiredClassof = 1;
		var TO_STRING_TAG_SUPPORT = requireToStringTagSupport();
		var isCallable = requireIsCallable();
		var classofRaw = requireClassofRaw();
		var wellKnownSymbol = requireWellKnownSymbol();

		var TO_STRING_TAG = wellKnownSymbol('toStringTag');
		var $Object = Object;

		// ES3 wrong here
		var CORRECT_ARGUMENTS = classofRaw(function () { return arguments; }()) === 'Arguments';

		// fallback for IE11 Script Access Denied error
		var tryGet = function (it, key) {
		  try {
		    return it[key];
		  } catch (error) { /* empty */ }
		};

		// getting tag from ES6+ `Object.prototype.toString`
		classof = TO_STRING_TAG_SUPPORT ? classofRaw : function (it) {
		  var O, tag, result;
		  return it === undefined ? 'Undefined' : it === null ? 'Null'
		    // @@toStringTag case
		    : typeof (tag = tryGet(O = $Object(it), TO_STRING_TAG)) == 'string' ? tag
		    // builtinTag case
		    : CORRECT_ARGUMENTS ? classofRaw(O)
		    // ES3 arguments fallback
		    : (result = classofRaw(O)) === 'Object' && isCallable(O.callee) ? 'Arguments' : result;
		};
		return classof;
	}

	var isConstructor;
	var hasRequiredIsConstructor;

	function requireIsConstructor () {
		if (hasRequiredIsConstructor) return isConstructor;
		hasRequiredIsConstructor = 1;
		var uncurryThis = requireFunctionUncurryThis();
		var fails = requireFails();
		var isCallable = requireIsCallable();
		var classof = requireClassof();
		var getBuiltIn = requireGetBuiltIn();
		var inspectSource = requireInspectSource();

		var noop = function () { /* empty */ };
		var construct = getBuiltIn('Reflect', 'construct');
		var constructorRegExp = /^\s*(?:class|function)\b/;
		var exec = uncurryThis(constructorRegExp.exec);
		var INCORRECT_TO_STRING = !constructorRegExp.test(noop);

		var isConstructorModern = function isConstructor(argument) {
		  if (!isCallable(argument)) return false;
		  try {
		    construct(noop, [], argument);
		    return true;
		  } catch (error) {
		    return false;
		  }
		};

		var isConstructorLegacy = function isConstructor(argument) {
		  if (!isCallable(argument)) return false;
		  switch (classof(argument)) {
		    case 'AsyncFunction':
		    case 'GeneratorFunction':
		    case 'AsyncGeneratorFunction': return false;
		  }
		  try {
		    // we can't check .prototype since constructors produced by .bind haven't it
		    // `Function#toString` throws on some built-it function in some legacy engines
		    // (for example, `DOMQuad` and similar in FF41-)
		    return INCORRECT_TO_STRING || !!exec(constructorRegExp, inspectSource(argument));
		  } catch (error) {
		    return true;
		  }
		};

		isConstructorLegacy.sham = true;

		// `IsConstructor` abstract operation
		// https://tc39.es/ecma262/#sec-isconstructor
		isConstructor = !construct || fails(function () {
		  var called;
		  return isConstructorModern(isConstructorModern.call)
		    || !isConstructorModern(Object)
		    || !isConstructorModern(function () { called = true; })
		    || called;
		}) ? isConstructorLegacy : isConstructorModern;
		return isConstructor;
	}

	var arraySpeciesConstructor;
	var hasRequiredArraySpeciesConstructor;

	function requireArraySpeciesConstructor () {
		if (hasRequiredArraySpeciesConstructor) return arraySpeciesConstructor;
		hasRequiredArraySpeciesConstructor = 1;
		var isArray = requireIsArray();
		var isConstructor = requireIsConstructor();
		var isObject = requireIsObject();
		var wellKnownSymbol = requireWellKnownSymbol();

		var SPECIES = wellKnownSymbol('species');
		var $Array = Array;

		// a part of `ArraySpeciesCreate` abstract operation
		// https://tc39.es/ecma262/#sec-arrayspeciescreate
		arraySpeciesConstructor = function (originalArray) {
		  var C;
		  if (isArray(originalArray)) {
		    C = originalArray.constructor;
		    // cross-realm fallback
		    if (isConstructor(C) && (C === $Array || isArray(C.prototype))) C = undefined;
		    else if (isObject(C)) {
		      C = C[SPECIES];
		      if (C === null) C = undefined;
		    }
		  } return C === undefined ? $Array : C;
		};
		return arraySpeciesConstructor;
	}

	var arraySpeciesCreate;
	var hasRequiredArraySpeciesCreate;

	function requireArraySpeciesCreate () {
		if (hasRequiredArraySpeciesCreate) return arraySpeciesCreate;
		hasRequiredArraySpeciesCreate = 1;
		var arraySpeciesConstructor = requireArraySpeciesConstructor();

		// `ArraySpeciesCreate` abstract operation
		// https://tc39.es/ecma262/#sec-arrayspeciescreate
		arraySpeciesCreate = function (originalArray, length) {
		  return new (arraySpeciesConstructor(originalArray))(length === 0 ? 0 : length);
		};
		return arraySpeciesCreate;
	}

	var createProperty;
	var hasRequiredCreateProperty;

	function requireCreateProperty () {
		if (hasRequiredCreateProperty) return createProperty;
		hasRequiredCreateProperty = 1;
		var DESCRIPTORS = requireDescriptors();
		var definePropertyModule = requireObjectDefineProperty();
		var createPropertyDescriptor = requireCreatePropertyDescriptor();

		createProperty = function (object, key, value) {
		  if (DESCRIPTORS) definePropertyModule.f(object, key, createPropertyDescriptor(0, value));
		  else object[key] = value;
		};
		return createProperty;
	}

	var deletePropertyOrThrow;
	var hasRequiredDeletePropertyOrThrow;

	function requireDeletePropertyOrThrow () {
		if (hasRequiredDeletePropertyOrThrow) return deletePropertyOrThrow;
		hasRequiredDeletePropertyOrThrow = 1;
		var tryToString = requireTryToString();

		var $TypeError = TypeError;

		deletePropertyOrThrow = function (O, P) {
		  if (!delete O[P]) throw new $TypeError('Cannot delete property ' + tryToString(P) + ' of ' + tryToString(O));
		};
		return deletePropertyOrThrow;
	}

	var arrayMethodHasSpeciesSupport;
	var hasRequiredArrayMethodHasSpeciesSupport;

	function requireArrayMethodHasSpeciesSupport () {
		if (hasRequiredArrayMethodHasSpeciesSupport) return arrayMethodHasSpeciesSupport;
		hasRequiredArrayMethodHasSpeciesSupport = 1;
		var fails = requireFails();
		var wellKnownSymbol = requireWellKnownSymbol();
		var V8_VERSION = requireEnvironmentV8Version();

		var SPECIES = wellKnownSymbol('species');

		arrayMethodHasSpeciesSupport = function (METHOD_NAME) {
		  // We can't use this feature detection in V8 since it causes
		  // deoptimization and serious performance degradation
		  // https://github.com/zloirock/core-js/issues/677
		  return V8_VERSION >= 51 || !fails(function () {
		    var array = [];
		    var constructor = array.constructor = {};
		    constructor[SPECIES] = function () {
		      return { foo: 1 };
		    };
		    return array[METHOD_NAME](Boolean).foo !== 1;
		  });
		};
		return arrayMethodHasSpeciesSupport;
	}

	var hasRequiredEs_array_splice;

	function requireEs_array_splice () {
		if (hasRequiredEs_array_splice) return es_array_splice;
		hasRequiredEs_array_splice = 1;
		var $ = require_export();
		var toObject = requireToObject();
		var toAbsoluteIndex = requireToAbsoluteIndex();
		var toIntegerOrInfinity = requireToIntegerOrInfinity();
		var lengthOfArrayLike = requireLengthOfArrayLike();
		var setArrayLength = requireArraySetLength();
		var doesNotExceedSafeInteger = requireDoesNotExceedSafeInteger();
		var arraySpeciesCreate = requireArraySpeciesCreate();
		var createProperty = requireCreateProperty();
		var deletePropertyOrThrow = requireDeletePropertyOrThrow();
		var arrayMethodHasSpeciesSupport = requireArrayMethodHasSpeciesSupport();

		var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('splice');

		var max = Math.max;
		var min = Math.min;

		// `Array.prototype.splice` method
		// https://tc39.es/ecma262/#sec-array.prototype.splice
		// with adding support of @@species
		$({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT }, {
		  splice: function splice(start, deleteCount /* , ...items */) {
		    var O = toObject(this);
		    var len = lengthOfArrayLike(O);
		    var actualStart = toAbsoluteIndex(start, len);
		    var argumentsLength = arguments.length;
		    var insertCount, actualDeleteCount, A, k, from, to;
		    if (argumentsLength === 0) {
		      insertCount = actualDeleteCount = 0;
		    } else if (argumentsLength === 1) {
		      insertCount = 0;
		      actualDeleteCount = len - actualStart;
		    } else {
		      insertCount = argumentsLength - 2;
		      actualDeleteCount = min(max(toIntegerOrInfinity(deleteCount), 0), len - actualStart);
		    }
		    doesNotExceedSafeInteger(len + insertCount - actualDeleteCount);
		    A = arraySpeciesCreate(O, actualDeleteCount);
		    for (k = 0; k < actualDeleteCount; k++) {
		      from = actualStart + k;
		      if (from in O) createProperty(A, k, O[from]);
		    }
		    setArrayLength(A, actualDeleteCount);
		    if (insertCount < actualDeleteCount) {
		      for (k = actualStart; k < len - actualDeleteCount; k++) {
		        from = k + actualDeleteCount;
		        to = k + insertCount;
		        if (from in O) O[to] = O[from];
		        else deletePropertyOrThrow(O, to);
		      }
		      for (k = len; k > len - actualDeleteCount + insertCount; k--) deletePropertyOrThrow(O, k - 1);
		    } else if (insertCount > actualDeleteCount) {
		      for (k = len - actualDeleteCount; k > actualStart; k--) {
		        from = k + actualDeleteCount - 1;
		        to = k + insertCount - 1;
		        if (from in O) O[to] = O[from];
		        else deletePropertyOrThrow(O, to);
		      }
		    }
		    for (k = 0; k < insertCount; k++) {
		      O[k + actualStart] = arguments[k + 2];
		    }
		    setArrayLength(O, len - actualDeleteCount + insertCount);
		    return A;
		  }
		});
		return es_array_splice;
	}

	requireEs_array_splice();

	var es_object_toString = {};

	var objectToString;
	var hasRequiredObjectToString;

	function requireObjectToString () {
		if (hasRequiredObjectToString) return objectToString;
		hasRequiredObjectToString = 1;
		var TO_STRING_TAG_SUPPORT = requireToStringTagSupport();
		var classof = requireClassof();

		// `Object.prototype.toString` method implementation
		// https://tc39.es/ecma262/#sec-object.prototype.tostring
		objectToString = TO_STRING_TAG_SUPPORT ? {}.toString : function toString() {
		  return '[object ' + classof(this) + ']';
		};
		return objectToString;
	}

	var hasRequiredEs_object_toString;

	function requireEs_object_toString () {
		if (hasRequiredEs_object_toString) return es_object_toString;
		hasRequiredEs_object_toString = 1;
		var TO_STRING_TAG_SUPPORT = requireToStringTagSupport();
		var defineBuiltIn = requireDefineBuiltIn();
		var toString = requireObjectToString();

		// `Object.prototype.toString` method
		// https://tc39.es/ecma262/#sec-object.prototype.tostring
		if (!TO_STRING_TAG_SUPPORT) {
		  defineBuiltIn(Object.prototype, 'toString', toString, { unsafe: true });
		}
		return es_object_toString;
	}

	requireEs_object_toString();

	var esnext_globalThis = {};

	var es_globalThis = {};

	var hasRequiredEs_globalThis;

	function requireEs_globalThis () {
		if (hasRequiredEs_globalThis) return es_globalThis;
		hasRequiredEs_globalThis = 1;
		var $ = require_export();
		var globalThis = requireGlobalThis();

		// `globalThis` object
		// https://tc39.es/ecma262/#sec-globalthis
		$({ global: true, forced: globalThis.globalThis !== globalThis }, {
		  globalThis: globalThis
		});
		return es_globalThis;
	}

	var hasRequiredEsnext_globalThis;

	function requireEsnext_globalThis () {
		if (hasRequiredEsnext_globalThis) return esnext_globalThis;
		hasRequiredEsnext_globalThis = 1;
		// TODO: Remove from `core-js@4`
		requireEs_globalThis();
		return esnext_globalThis;
	}

	requireEsnext_globalThis();

	var web_domCollections_forEach = {};

	var domIterables;
	var hasRequiredDomIterables;

	function requireDomIterables () {
		if (hasRequiredDomIterables) return domIterables;
		hasRequiredDomIterables = 1;
		// iterable DOM collections
		// flag - `iterable` interface - 'entries', 'keys', 'values', 'forEach' methods
		domIterables = {
		  CSSRuleList: 0,
		  CSSStyleDeclaration: 0,
		  CSSValueList: 0,
		  ClientRectList: 0,
		  DOMRectList: 0,
		  DOMStringList: 0,
		  DOMTokenList: 1,
		  DataTransferItemList: 0,
		  FileList: 0,
		  HTMLAllCollection: 0,
		  HTMLCollection: 0,
		  HTMLFormElement: 0,
		  HTMLSelectElement: 0,
		  MediaList: 0,
		  MimeTypeArray: 0,
		  NamedNodeMap: 0,
		  NodeList: 1,
		  PaintRequestList: 0,
		  Plugin: 0,
		  PluginArray: 0,
		  SVGLengthList: 0,
		  SVGNumberList: 0,
		  SVGPathSegList: 0,
		  SVGPointList: 0,
		  SVGStringList: 0,
		  SVGTransformList: 0,
		  SourceBufferList: 0,
		  StyleSheetList: 0,
		  TextTrackCueList: 0,
		  TextTrackList: 0,
		  TouchList: 0
		};
		return domIterables;
	}

	var domTokenListPrototype;
	var hasRequiredDomTokenListPrototype;

	function requireDomTokenListPrototype () {
		if (hasRequiredDomTokenListPrototype) return domTokenListPrototype;
		hasRequiredDomTokenListPrototype = 1;
		// in old WebKit versions, `element.classList` is not an instance of global `DOMTokenList`
		var documentCreateElement = requireDocumentCreateElement();

		var classList = documentCreateElement('span').classList;
		var DOMTokenListPrototype = classList && classList.constructor && classList.constructor.prototype;

		domTokenListPrototype = DOMTokenListPrototype === Object.prototype ? undefined : DOMTokenListPrototype;
		return domTokenListPrototype;
	}

	var functionBindContext;
	var hasRequiredFunctionBindContext;

	function requireFunctionBindContext () {
		if (hasRequiredFunctionBindContext) return functionBindContext;
		hasRequiredFunctionBindContext = 1;
		var uncurryThis = requireFunctionUncurryThisClause();
		var aCallable = requireACallable();
		var NATIVE_BIND = requireFunctionBindNative();

		var bind = uncurryThis(uncurryThis.bind);

		// optional / simple context binding
		functionBindContext = function (fn, that) {
		  aCallable(fn);
		  return that === undefined ? fn : NATIVE_BIND ? bind(fn, that) : function (/* ...args */) {
		    return fn.apply(that, arguments);
		  };
		};
		return functionBindContext;
	}

	var arrayIteration;
	var hasRequiredArrayIteration;

	function requireArrayIteration () {
		if (hasRequiredArrayIteration) return arrayIteration;
		hasRequiredArrayIteration = 1;
		var bind = requireFunctionBindContext();
		var IndexedObject = requireIndexedObject();
		var toObject = requireToObject();
		var lengthOfArrayLike = requireLengthOfArrayLike();
		var arraySpeciesCreate = requireArraySpeciesCreate();
		var createProperty = requireCreateProperty();

		// `Array.prototype.{ forEach, map, filter, some, every, find, findIndex, filterReject }` methods implementation
		var createMethod = function (TYPE) {
		  var IS_MAP = TYPE === 1;
		  var IS_FILTER = TYPE === 2;
		  var IS_SOME = TYPE === 3;
		  var IS_EVERY = TYPE === 4;
		  var IS_FIND_INDEX = TYPE === 6;
		  var IS_FILTER_REJECT = TYPE === 7;
		  var NO_HOLES = TYPE === 5 || IS_FIND_INDEX;
		  return function ($this, callbackfn, that) {
		    var O = toObject($this);
		    var self = IndexedObject(O);
		    var length = lengthOfArrayLike(self);
		    var boundFunction = bind(callbackfn, that);
		    var index = 0;
		    var resIndex = 0;
		    var target = IS_MAP ? arraySpeciesCreate($this, length) : IS_FILTER || IS_FILTER_REJECT ? arraySpeciesCreate($this, 0) : undefined;
		    var value, result;
		    for (;length > index; index++) if (NO_HOLES || index in self) {
		      value = self[index];
		      result = boundFunction(value, index, O);
		      if (TYPE) {
		        if (IS_MAP) createProperty(target, index, result);    // map
		        else if (result) switch (TYPE) {
		          case 3: return true;                                // some
		          case 5: return value;                               // find
		          case 6: return index;                               // findIndex
		          case 2: createProperty(target, resIndex++, value);  // filter
		        } else switch (TYPE) {
		          case 4: return false;                               // every
		          case 7: createProperty(target, resIndex++, value);  // filterReject
		        }
		      }
		    }
		    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : target;
		  };
		};

		arrayIteration = {
		  // `Array.prototype.forEach` method
		  // https://tc39.es/ecma262/#sec-array.prototype.foreach
		  forEach: createMethod(0),
		  // `Array.prototype.map` method
		  // https://tc39.es/ecma262/#sec-array.prototype.map
		  map: createMethod(1),
		  // `Array.prototype.filter` method
		  // https://tc39.es/ecma262/#sec-array.prototype.filter
		  filter: createMethod(2),
		  // `Array.prototype.some` method
		  // https://tc39.es/ecma262/#sec-array.prototype.some
		  some: createMethod(3),
		  // `Array.prototype.every` method
		  // https://tc39.es/ecma262/#sec-array.prototype.every
		  every: createMethod(4),
		  // `Array.prototype.find` method
		  // https://tc39.es/ecma262/#sec-array.prototype.find
		  find: createMethod(5),
		  // `Array.prototype.findIndex` method
		  // https://tc39.es/ecma262/#sec-array.prototype.findIndex
		  findIndex: createMethod(6),
		  // `Array.prototype.filterReject` method
		  // https://github.com/tc39/proposal-array-filtering
		  filterReject: createMethod(7)
		};
		return arrayIteration;
	}

	var arrayForEach;
	var hasRequiredArrayForEach;

	function requireArrayForEach () {
		if (hasRequiredArrayForEach) return arrayForEach;
		hasRequiredArrayForEach = 1;
		var $forEach = requireArrayIteration().forEach;
		var arrayMethodIsStrict = requireArrayMethodIsStrict();

		var STRICT_METHOD = arrayMethodIsStrict('forEach');

		// `Array.prototype.forEach` method implementation
		// https://tc39.es/ecma262/#sec-array.prototype.foreach
		arrayForEach = !STRICT_METHOD ? function forEach(callbackfn /* , thisArg */) {
		  return $forEach(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
		// eslint-disable-next-line es/no-array-prototype-foreach -- safe
		} : [].forEach;
		return arrayForEach;
	}

	var hasRequiredWeb_domCollections_forEach;

	function requireWeb_domCollections_forEach () {
		if (hasRequiredWeb_domCollections_forEach) return web_domCollections_forEach;
		hasRequiredWeb_domCollections_forEach = 1;
		var globalThis = requireGlobalThis();
		var DOMIterables = requireDomIterables();
		var DOMTokenListPrototype = requireDomTokenListPrototype();
		var forEach = requireArrayForEach();
		var createNonEnumerableProperty = requireCreateNonEnumerableProperty();

		var handlePrototype = function (CollectionPrototype) {
		  // some Chrome versions have non-configurable methods on DOMTokenList
		  if (CollectionPrototype && CollectionPrototype.forEach !== forEach) try {
		    createNonEnumerableProperty(CollectionPrototype, 'forEach', forEach);
		  } catch (error) {
		    CollectionPrototype.forEach = forEach;
		  }
		};

		for (var COLLECTION_NAME in DOMIterables) {
		  if (DOMIterables[COLLECTION_NAME]) {
		    handlePrototype(globalThis[COLLECTION_NAME] && globalThis[COLLECTION_NAME].prototype);
		  }
		}

		handlePrototype(DOMTokenListPrototype);
		return web_domCollections_forEach;
	}

	requireWeb_domCollections_forEach();

	/**
	 * Copyright (c) Starisian Technologies. All rights reserved.
	 *
	 * This file is part of the SPARXSTAR platform and is proprietary and confidential.
	 * Unauthorized copying, modification, distribution, or use of this file, via any medium,
	 * is strictly prohibited except as expressly permitted in writing by Starisian Technologies.
	 *
	 * License: Business Source License 1.1
	 * Change Date: January 1, 2036
	 * Change License: Starisian Community License
	 *
	 * See the LICENSE file in the repository root for full license terms.
	 */

	var globalScope = typeof window !== "undefined" ? window : globalThis;
	if (!globalScope.StarmusRegistry) {
	  globalScope.StarmusRegistry = {};
	}
	var registry = globalScope.StarmusRegistry;

	/**
	 * Subscribes a handler to a named command.
	 *
	 * @param {string} command - Command name to listen for
	 * @param {function} handler - Handler called with (payload, meta)
	 * @returns {function} Unsubscribe function
	 */
	function subscribe$1(command, handler) {
	  if (!registry[command]) {
	    registry[command] = [];
	  }
	  registry[command].push(handler);
	  return function unsubscribe() {
	    var idx = registry[command].indexOf(handler);
	    if (idx > -1) {
	      registry[command].splice(idx, 1);
	    }
	  };
	}

	/**
	 * Dispatches a command to all subscribed handlers.
	 *
	 * @param {string} command - Command name to dispatch
	 * @param {object} [payload={}] - Data payload for handlers
	 * @param {object} [meta={}] - Metadata (instanceId, source, etc.)
	 * @returns {void}
	 */
	function dispatch(command) {
	  var payload = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	  var meta = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
	  var handlers = registry[command];
	  if (!handlers || handlers.length === 0) {
	    console.warn("[Bus] Dispatched '".concat(command, "' but nobody is listening."));
	    return;
	  }
	  handlers.forEach(function (fn) {
	    try {
	      fn(payload, meta);
	    } catch (e) {
	      console.error("[Bus] Handler error for command '" + command + "':", e);
	    }
	  });
	}

	/**
	 * No-op debug logger (enable locally as needed).
	 *
	 * @param {...*} _args - Arguments to log
	 * @returns {void}
	 */
	function debugLog() {
	  /* console.log(..._args); */
	}
	var Bus = {
	  subscribe: subscribe$1,
	  dispatch: dispatch,
	  debugLog: debugLog
	};
	globalScope.CommandBus = Bus;
	globalScope.StarmusHooks = Bus;

	var es_array_slice = {};

	var arraySlice;
	var hasRequiredArraySlice;

	function requireArraySlice () {
		if (hasRequiredArraySlice) return arraySlice;
		hasRequiredArraySlice = 1;
		var uncurryThis = requireFunctionUncurryThis();

		arraySlice = uncurryThis([].slice);
		return arraySlice;
	}

	var hasRequiredEs_array_slice;

	function requireEs_array_slice () {
		if (hasRequiredEs_array_slice) return es_array_slice;
		hasRequiredEs_array_slice = 1;
		var $ = require_export();
		var isArray = requireIsArray();
		var isConstructor = requireIsConstructor();
		var isObject = requireIsObject();
		var toAbsoluteIndex = requireToAbsoluteIndex();
		var lengthOfArrayLike = requireLengthOfArrayLike();
		var toIndexedObject = requireToIndexedObject();
		var createProperty = requireCreateProperty();
		var setArrayLength = requireArraySetLength();
		var wellKnownSymbol = requireWellKnownSymbol();
		var arrayMethodHasSpeciesSupport = requireArrayMethodHasSpeciesSupport();
		var nativeSlice = requireArraySlice();

		var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('slice');

		var SPECIES = wellKnownSymbol('species');
		var $Array = Array;
		var max = Math.max;

		// `Array.prototype.slice` method
		// https://tc39.es/ecma262/#sec-array.prototype.slice
		// fallback for not array-like ES3 strings and DOM objects
		$({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT }, {
		  slice: function slice(start, end) {
		    var O = toIndexedObject(this);
		    var length = lengthOfArrayLike(O);
		    var k = toAbsoluteIndex(start, length);
		    var fin = toAbsoluteIndex(end === undefined ? length : end, length);
		    // inline `ArraySpeciesCreate` for usage native `Array#slice` where it's possible
		    var Constructor, result, n;
		    if (isArray(O)) {
		      Constructor = O.constructor;
		      // cross-realm fallback
		      if (isConstructor(Constructor) && (Constructor === $Array || isArray(Constructor.prototype))) {
		        Constructor = undefined;
		      } else if (isObject(Constructor)) {
		        Constructor = Constructor[SPECIES];
		        if (Constructor === null) Constructor = undefined;
		      }
		      if (Constructor === $Array || Constructor === undefined) {
		        return nativeSlice(O, k, fin);
		      }
		    }
		    result = new (Constructor === undefined ? $Array : Constructor)(max(fin - k, 0));
		    for (n = 0; k < fin; k++, n++) if (k in O) createProperty(result, n, O[k]);
		    setArrayLength(result, n);
		    return result;
		  }
		});
		return es_array_slice;
	}

	requireEs_array_slice();

	/**
	 * Copyright (c) Starisian Technologies. All rights reserved.
	 *
	 * This file is part of the SPARXSTAR platform and is proprietary and confidential.
	 * Unauthorized copying, modification, distribution, or use of this file, via any medium,
	 * is strictly prohibited except as expressly permitted in writing by Starisian Technologies.
	 *
	 * License: Business Source License 1.1
	 * Change Date: January 1, 2036
	 * Change License: Starisian Community License
	 *
	 * See the LICENSE file in the repository root for full license terms.
	 */

	/**
	 * @file starmus-state-store.js
	 * @version 6.1.0
	 * @description Redux-style state store for the Starmus audio recorder.
	 * Manages complete application state: recording, calibration, submission, environment.
	 */

	(function (global) {

	  /**
	   * Default initial state for new store instances.
	   * @type {Object}
	   */
	  var DEFAULT_INITIAL_STATE = {
	    instanceId: null,
	    tier: null,
	    status: "uninitialized",
	    step: 1,
	    error: null,
	    env: {
	      device: {},
	      browser: {},
	      network: {},
	      identifiers: {},
	      errors: []
	    },
	    source: {
	      kind: null,
	      blob: null,
	      file: null,
	      fileName: "",
	      title: "",
	      language: "",
	      recording_type: "",
	      transcript: "",
	      interimTranscript: "",
	      metadata: {
	        duration: 0,
	        mimeType: "",
	        fileSize: 0
	      }
	    },
	    calibration: {
	      phase: null,
	      message: "",
	      volumePercent: 0,
	      complete: false,
	      gain: 1.0,
	      speechLevel: 0
	    },
	    recorder: {
	      duration: 0,
	      amplitude: 0,
	      isPlaying: false,
	      isPaused: false
	    },
	    submission: {
	      progress: 0,
	      isQueued: false
	    }
	  };
	  function shallowClone(obj) {
	    var out = {};
	    for (var k in obj) {
	      if (Object.prototype.hasOwnProperty.call(obj, k)) {
	        out[k] = obj[k];
	      }
	    }
	    return out;
	  }
	  function merge(a, b) {
	    var out = shallowClone(a);
	    for (var k in b) {
	      if (Object.prototype.hasOwnProperty.call(b, k)) {
	        out[k] = b[k];
	      }
	    }
	    return out;
	  }
	  function reducer(state, action) {
	    if (!action || !action.type) {
	      return state;
	    }
	    if (!state.instanceId && action.payload && action.payload.instanceId) {
	      state = merge(state, {
	        instanceId: action.payload.instanceId
	      });
	    }
	    switch (action.type) {
	      case "starmus/init":
	        return merge(state, merge(action.payload || {}, {
	          status: "idle",
	          error: null
	        }));
	      case "starmus/env-update":
	        {
	          var newEnv = merge(state.env, action.payload || {});
	          if (!newEnv.errors) {
	            newEnv.errors = state.env.errors || [];
	          }
	          return merge(state, {
	            env: newEnv
	          });
	        }
	      case "starmus/error":
	        {
	          var errObj = action.error || action.payload;
	          var currentErrors = state.env && state.env.errors ? state.env.errors.slice() : [];
	          currentErrors.push({
	            code: errObj.code || "RUNTIME_ERROR",
	            message: errObj.message || "Unknown",
	            timestamp: Date.now(),
	            severity: errObj.retryable === false ? "hard" : "soft"
	          });
	          return merge(state, {
	            error: errObj,
	            env: merge(state.env, {
	              errors: currentErrors
	            })
	          });
	        }
	      case "starmus/tier-ready":
	        return merge(state, {
	          tier: action.payload.tier || state.tier
	        });
	      case "starmus/ui/step-continue":
	        return merge(state, {
	          step: 2,
	          status: "idle",
	          error: null
	        });
	      case "starmus/calibration-start":
	        return merge(state, {
	          status: "calibrating"
	        });
	      case "starmus/calibration-update":
	        return merge(state, {
	          calibration: merge(state.calibration, {
	            message: action.message,
	            volumePercent: action.volumePercent
	          })
	        });
	      case "starmus/calibration-complete":
	        return merge(state, {
	          status: "ready",
	          calibration: merge(state.calibration, merge(action.payload.calibration || {}, {
	            complete: true
	          }))
	        });
	      case "starmus/mic-start":
	        return merge(state, {
	          status: "recording",
	          error: null,
	          recorder: merge(state.recorder, {
	            duration: 0,
	            isPaused: false
	          })
	        });
	      case "starmus/mic-pause":
	        return merge(state, {
	          status: "paused",
	          recorder: merge(state.recorder, {
	            isPaused: true
	          })
	        });
	      case "starmus/mic-resume":
	        return merge(state, {
	          status: "recording",
	          recorder: merge(state.recorder, {
	            isPaused: false
	          })
	        });
	      case "starmus/mic-stop":
	        return merge(state, {
	          status: "ready_to_submit"
	        });
	      case "starmus/recorder-tick":
	        return merge(state, {
	          recorder: merge(state.recorder, {
	            duration: action.duration,
	            amplitude: action.amplitude
	          })
	        });
	      case "starmus/recording-available":
	        return merge(state, {
	          status: "ready_to_submit",
	          source: merge(state.source, {
	            kind: "blob",
	            blob: action.payload.blob,
	            fileName: action.payload.fileName,
	            metadata: {
	              duration: state.recorder.duration || 0,
	              mimeType: action.payload.blob.type || "audio/webm",
	              fileSize: action.payload.blob.size || 0
	            }
	          })
	        });
	      case "starmus/transcript-update":
	        return merge(state, {
	          source: merge(state.source, {
	            transcript: action.transcript
	          })
	        });
	      case "starmus/transcript-interim":
	        return merge(state, {
	          source: merge(state.source, {
	            interimTranscript: action.interim
	          })
	        });
	      case "starmus/file-attached":
	        return merge(state, {
	          status: "ready_to_submit",
	          source: merge(state.source, {
	            kind: "file",
	            file: action.file,
	            fileName: action.file.name,
	            metadata: {
	              duration: 0,
	              mimeType: action.file.type,
	              fileSize: action.file.size
	            }
	          })
	        });
	      case "starmus/submit-start":
	        return merge(state, {
	          status: "submitting",
	          error: null
	        });
	      case "starmus/submit-progress":
	        return merge(state, {
	          submission: merge(state.submission, {
	            progress: action.progress
	          })
	        });
	      case "starmus/submit-complete":
	        return merge(state, {
	          status: "complete",
	          submission: {
	            progress: 1,
	            isQueued: false
	          }
	        });
	      case "starmus/submit-queued":
	        return merge(state, {
	          status: "complete",
	          submission: {
	            progress: 0,
	            isQueued: true
	          }
	        });
	      case "starmus/reset":
	        return merge(shallowClone(DEFAULT_INITIAL_STATE), {
	          instanceId: state.instanceId,
	          env: state.env,
	          tier: state.tier,
	          status: "idle"
	        });
	      default:
	        return state;
	    }
	  }

	  /**
	   * Creates a new Redux-style store instance.
	   *
	   * @param {Object} [initial={}] - Initial state to merge with defaults
	   * @returns {Object} Store with getState, dispatch, subscribe
	   */
	  function createStore(initial) {
	    var state = merge(DEFAULT_INITIAL_STATE, initial || {});
	    var listeners = [];
	    return {
	      getState: function getState() {
	        return state;
	      },
	      dispatch: function dispatch(action) {
	        state = reducer(state, action);
	        for (var i = 0; i < listeners.length; i++) {
	          listeners[i](state);
	        }
	      },
	      subscribe: function subscribe(fn) {
	        listeners.push(fn);
	        return function () {
	          listeners.splice(listeners.indexOf(fn), 1);
	        };
	      }
	    };
	  }
	  global.StarmusStore = global.StarmusStore || {};
	  global.StarmusStore.createStore = createStore;
	  global.StarmusStore.DEFAULT_INITIAL_STATE = DEFAULT_INITIAL_STATE;
	  if (typeof module !== "undefined" && module.exports) {
	    module.exports = {
	      createStore: createStore,
	      DEFAULT_INITIAL_STATE: DEFAULT_INITIAL_STATE
	    };
	  }
	})(typeof window !== "undefined" ? window : globalThis);
	var runtimeGlobal = typeof window !== "undefined" ? window : globalThis;

	/**
	 * @exports createStore
	 */
	function createStore(initial) {
	  return runtimeGlobal.StarmusStore.createStore(initial);
	}

	/**
	 * Default initial state exported for testing and schema validation.
	 * @exports DEFAULT_INITIAL_STATE
	 */
	runtimeGlobal.StarmusStore.DEFAULT_INITIAL_STATE;

	function _arrayLikeToArray$1(r, a) {
	  (null == a || a > r.length) && (a = r.length);
	  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
	  return n;
	}
	function _arrayWithHoles$1(r) {
	  if (Array.isArray(r)) return r;
	}
	function asyncGeneratorStep$2(n, t, e, r, o, a, c) {
	  try {
	    var i = n[a](c),
	      u = i.value;
	  } catch (n) {
	    return void e(n);
	  }
	  i.done ? t(u) : Promise.resolve(u).then(r, o);
	}
	function _asyncToGenerator$2(n) {
	  return function () {
	    var t = this,
	      e = arguments;
	    return new Promise(function (r, o) {
	      var a = n.apply(t, e);
	      function _next(n) {
	        asyncGeneratorStep$2(a, r, o, _next, _throw, "next", n);
	      }
	      function _throw(n) {
	        asyncGeneratorStep$2(a, r, o, _next, _throw, "throw", n);
	      }
	      _next(void 0);
	    });
	  };
	}
	function _classCallCheck$9(a, n) {
	  if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function");
	}
	function _defineProperties$8(e, r) {
	  for (var t = 0; t < r.length; t++) {
	    var o = r[t];
	    o.enumerable = o.enumerable || false, o.configurable = true, "value" in o && (o.writable = true), Object.defineProperty(e, _toPropertyKey$8(o.key), o);
	  }
	}
	function _createClass$9(e, r, t) {
	  return r && _defineProperties$8(e.prototype, r), Object.defineProperty(e, "prototype", {
	    writable: false
	  }), e;
	}
	function _createForOfIteratorHelper$1(r, e) {
	  var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
	  if (!t) {
	    if (Array.isArray(r) || (t = _unsupportedIterableToArray$1(r)) || e) {
	      t && (r = t);
	      var n = 0,
	        F = function () {};
	      return {
	        s: F,
	        n: function () {
	          return n >= r.length ? {
	            done: true
	          } : {
	            done: false,
	            value: r[n++]
	          };
	        },
	        e: function (r) {
	          throw r;
	        },
	        f: F
	      };
	    }
	    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
	  }
	  var o,
	    a = true,
	    u = false;
	  return {
	    s: function () {
	      t = t.call(r);
	    },
	    n: function () {
	      var r = t.next();
	      return a = r.done, r;
	    },
	    e: function (r) {
	      u = true, o = r;
	    },
	    f: function () {
	      try {
	        a || null == t.return || t.return();
	      } finally {
	        if (u) throw o;
	      }
	    }
	  };
	}
	function _defineProperty$2(e, r, t) {
	  return (r = _toPropertyKey$8(r)) in e ? Object.defineProperty(e, r, {
	    value: t,
	    enumerable: true,
	    configurable: true,
	    writable: true
	  }) : e[r] = t, e;
	}
	function _iterableToArrayLimit$1(r, l) {
	  var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
	  if (null != t) {
	    var e,
	      n,
	      i,
	      u,
	      a = [],
	      f = true,
	      o = false;
	    try {
	      if (i = (t = t.call(r)).next, 0 === l) ; else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
	    } catch (r) {
	      o = true, n = r;
	    } finally {
	      try {
	        if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
	      } finally {
	        if (o) throw n;
	      }
	    }
	    return a;
	  }
	}
	function _nonIterableRest$1() {
	  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
	}
	function ownKeys$2(e, r) {
	  var t = Object.keys(e);
	  if (Object.getOwnPropertySymbols) {
	    var o = Object.getOwnPropertySymbols(e);
	    r && (o = o.filter(function (r) {
	      return Object.getOwnPropertyDescriptor(e, r).enumerable;
	    })), t.push.apply(t, o);
	  }
	  return t;
	}
	function _objectSpread2(e) {
	  for (var r = 1; r < arguments.length; r++) {
	    var t = null != arguments[r] ? arguments[r] : {};
	    r % 2 ? ownKeys$2(Object(t), true).forEach(function (r) {
	      _defineProperty$2(e, r, t[r]);
	    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$2(Object(t)).forEach(function (r) {
	      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
	    });
	  }
	  return e;
	}
	function _regenerator() {
	  /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */
	  var e,
	    t,
	    r = "function" == typeof Symbol ? Symbol : {},
	    n = r.iterator || "@@iterator",
	    o = r.toStringTag || "@@toStringTag";
	  function i(r, n, o, i) {
	    var c = n && n.prototype instanceof Generator ? n : Generator,
	      u = Object.create(c.prototype);
	    return _regeneratorDefine(u, "_invoke", function (r, n, o) {
	      var i,
	        c,
	        u,
	        f = 0,
	        p = o || [],
	        y = false,
	        G = {
	          p: 0,
	          n: 0,
	          v: e,
	          a: d,
	          f: d.bind(e, 4),
	          d: function (t, r) {
	            return i = t, c = 0, u = e, G.n = r, a;
	          }
	        };
	      function d(r, n) {
	        for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) {
	          var o,
	            i = p[t],
	            d = G.p,
	            l = i[2];
	          r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0));
	        }
	        if (o || r > 1) return a;
	        throw y = true, n;
	      }
	      return function (o, p, l) {
	        if (f > 1) throw TypeError("Generator is already running");
	        for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) {
	          i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u);
	          try {
	            if (f = 2, i) {
	              if (c || (o = "next"), t = i[o]) {
	                if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object");
	                if (!t.done) return t;
	                u = t.value, c < 2 && (c = 0);
	              } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1);
	              i = e;
	            } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break;
	          } catch (t) {
	            i = e, c = 1, u = t;
	          } finally {
	            f = 1;
	          }
	        }
	        return {
	          value: t,
	          done: y
	        };
	      };
	    }(r, o, i), true), u;
	  }
	  var a = {};
	  function Generator() {}
	  function GeneratorFunction() {}
	  function GeneratorFunctionPrototype() {}
	  t = Object.getPrototypeOf;
	  var c = [][n] ? t(t([][n]())) : (_regeneratorDefine(t = {}, n, function () {
	      return this;
	    }), t),
	    u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c);
	  function f(e) {
	    return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e;
	  }
	  return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine(u), _regeneratorDefine(u, o, "Generator"), _regeneratorDefine(u, n, function () {
	    return this;
	  }), _regeneratorDefine(u, "toString", function () {
	    return "[object Generator]";
	  }), (_regenerator = function () {
	    return {
	      w: i,
	      m: f
	    };
	  })();
	}
	function _regeneratorDefine(e, r, n, t) {
	  var i = Object.defineProperty;
	  try {
	    i({}, "", {});
	  } catch (e) {
	    i = 0;
	  }
	  _regeneratorDefine = function (e, r, n, t) {
	    function o(r, n) {
	      _regeneratorDefine(e, r, function (e) {
	        return this._invoke(r, n, e);
	      });
	    }
	    r ? i ? i(e, r, {
	      value: n,
	      enumerable: !t,
	      configurable: !t,
	      writable: !t
	    }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2));
	  }, _regeneratorDefine(e, r, n, t);
	}
	function _slicedToArray$1(r, e) {
	  return _arrayWithHoles$1(r) || _iterableToArrayLimit$1(r, e) || _unsupportedIterableToArray$1(r, e) || _nonIterableRest$1();
	}
	function _toPrimitive$8(t, r) {
	  if ("object" != typeof t || !t) return t;
	  var e = t[Symbol.toPrimitive];
	  if (void 0 !== e) {
	    var i = e.call(t, r);
	    if ("object" != typeof i) return i;
	    throw new TypeError("@@toPrimitive must return a primitive value.");
	  }
	  return (String )(t);
	}
	function _toPropertyKey$8(t) {
	  var i = _toPrimitive$8(t, "string");
	  return "symbol" == typeof i ? i : i + "";
	}
	function _typeof$9(o) {
	  "@babel/helpers - typeof";

	  return _typeof$9 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
	    return typeof o;
	  } : function (o) {
	    return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
	  }, _typeof$9(o);
	}
	function _unsupportedIterableToArray$1(r, a) {
	  if (r) {
	    if ("string" == typeof r) return _arrayLikeToArray$1(r, a);
	    var t = {}.toString.call(r).slice(8, -1);
	    return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray$1(r, a) : void 0;
	  }
	}

	var es_string_trim = {};

	var toString;
	var hasRequiredToString;

	function requireToString () {
		if (hasRequiredToString) return toString;
		hasRequiredToString = 1;
		var classof = requireClassof();

		var $String = String;

		toString = function (argument) {
		  if (classof(argument) === 'Symbol') throw new TypeError('Cannot convert a Symbol value to a string');
		  return $String(argument);
		};
		return toString;
	}

	var whitespaces;
	var hasRequiredWhitespaces;

	function requireWhitespaces () {
		if (hasRequiredWhitespaces) return whitespaces;
		hasRequiredWhitespaces = 1;
		// a string of all valid unicode whitespaces
		whitespaces = '\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u2000\u2001\u2002' +
		  '\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';
		return whitespaces;
	}

	var stringTrim;
	var hasRequiredStringTrim;

	function requireStringTrim () {
		if (hasRequiredStringTrim) return stringTrim;
		hasRequiredStringTrim = 1;
		var uncurryThis = requireFunctionUncurryThis();
		var requireObjectCoercible = requireRequireObjectCoercible();
		var toString = requireToString();
		var whitespaces = requireWhitespaces();

		var replace = uncurryThis(''.replace);
		var ltrim = RegExp('^[' + whitespaces + ']+');
		var rtrim = RegExp('(^|[^' + whitespaces + '])[' + whitespaces + ']+$');

		// `String.prototype.{ trim, trimStart, trimEnd, trimLeft, trimRight }` methods implementation
		var createMethod = function (TYPE) {
		  return function ($this) {
		    var string = toString(requireObjectCoercible($this));
		    if (TYPE & 1) string = replace(string, ltrim, '');
		    if (TYPE & 2) string = replace(string, rtrim, '$1');
		    return string;
		  };
		};

		stringTrim = {
		  // `String.prototype.{ trimLeft, trimStart }` methods
		  // https://tc39.es/ecma262/#sec-string.prototype.trimstart
		  start: createMethod(1),
		  // `String.prototype.{ trimRight, trimEnd }` methods
		  // https://tc39.es/ecma262/#sec-string.prototype.trimend
		  end: createMethod(2),
		  // `String.prototype.trim` method
		  // https://tc39.es/ecma262/#sec-string.prototype.trim
		  trim: createMethod(3)
		};
		return stringTrim;
	}

	var stringTrimForced;
	var hasRequiredStringTrimForced;

	function requireStringTrimForced () {
		if (hasRequiredStringTrimForced) return stringTrimForced;
		hasRequiredStringTrimForced = 1;
		var PROPER_FUNCTION_NAME = requireFunctionName().PROPER;
		var fails = requireFails();
		var whitespaces = requireWhitespaces();

		var non = '\u200B\u0085\u180E';

		// check that a method works with the correct list
		// of whitespaces and has a correct name
		stringTrimForced = function (METHOD_NAME) {
		  return fails(function () {
		    return !!whitespaces[METHOD_NAME]()
		      || non[METHOD_NAME]() !== non
		      || (PROPER_FUNCTION_NAME && whitespaces[METHOD_NAME].name !== METHOD_NAME);
		  });
		};
		return stringTrimForced;
	}

	var hasRequiredEs_string_trim;

	function requireEs_string_trim () {
		if (hasRequiredEs_string_trim) return es_string_trim;
		hasRequiredEs_string_trim = 1;
		var $ = require_export();
		var $trim = requireStringTrim().trim;
		var forcedStringTrimMethod = requireStringTrimForced();

		// `String.prototype.trim` method
		// https://tc39.es/ecma262/#sec-string.prototype.trim
		$({ target: 'String', proto: true, forced: forcedStringTrimMethod('trim') }, {
		  trim: function trim() {
		    return $trim(this);
		  }
		});
		return es_string_trim;
	}

	requireEs_string_trim();

	var es_array_concat = {};

	var hasRequiredEs_array_concat;

	function requireEs_array_concat () {
		if (hasRequiredEs_array_concat) return es_array_concat;
		hasRequiredEs_array_concat = 1;
		var $ = require_export();
		var fails = requireFails();
		var isArray = requireIsArray();
		var isObject = requireIsObject();
		var toObject = requireToObject();
		var lengthOfArrayLike = requireLengthOfArrayLike();
		var doesNotExceedSafeInteger = requireDoesNotExceedSafeInteger();
		var createProperty = requireCreateProperty();
		var setArrayLength = requireArraySetLength();
		var arraySpeciesCreate = requireArraySpeciesCreate();
		var arrayMethodHasSpeciesSupport = requireArrayMethodHasSpeciesSupport();
		var wellKnownSymbol = requireWellKnownSymbol();
		var V8_VERSION = requireEnvironmentV8Version();

		var IS_CONCAT_SPREADABLE = wellKnownSymbol('isConcatSpreadable');

		// We can't use this feature detection in V8 since it causes
		// deoptimization and serious performance degradation
		// https://github.com/zloirock/core-js/issues/679
		var IS_CONCAT_SPREADABLE_SUPPORT = V8_VERSION >= 51 || !fails(function () {
		  var array = [];
		  array[IS_CONCAT_SPREADABLE] = false;
		  return array.concat()[0] !== array;
		});

		var isConcatSpreadable = function (O) {
		  if (!isObject(O)) return false;
		  var spreadable = O[IS_CONCAT_SPREADABLE];
		  return spreadable !== undefined ? !!spreadable : isArray(O);
		};

		var FORCED = !IS_CONCAT_SPREADABLE_SUPPORT || !arrayMethodHasSpeciesSupport('concat');

		// `Array.prototype.concat` method
		// https://tc39.es/ecma262/#sec-array.prototype.concat
		// with adding support of @@isConcatSpreadable and @@species
		$({ target: 'Array', proto: true, arity: 1, forced: FORCED }, {
		  // eslint-disable-next-line no-unused-vars -- required for `.length`
		  concat: function concat(arg) {
		    var O = toObject(this);
		    var A = arraySpeciesCreate(O, 0);
		    var n = 0;
		    var i, k, length, len, E;
		    for (i = -1, length = arguments.length; i < length; i++) {
		      E = i === -1 ? O : arguments[i];
		      if (isConcatSpreadable(E)) {
		        len = lengthOfArrayLike(E);
		        doesNotExceedSafeInteger(n + len);
		        for (k = 0; k < len; k++, n++) if (k in E) createProperty(A, n, E[k]);
		      } else {
		        doesNotExceedSafeInteger(n + 1);
		        createProperty(A, n++, E);
		      }
		    }
		    setArrayLength(A, n);
		    return A;
		  }
		});
		return es_array_concat;
	}

	requireEs_array_concat();

	var es_array_from = {};

	var iteratorClose;
	var hasRequiredIteratorClose;

	function requireIteratorClose () {
		if (hasRequiredIteratorClose) return iteratorClose;
		hasRequiredIteratorClose = 1;
		var call = requireFunctionCall();
		var anObject = requireAnObject();
		var getMethod = requireGetMethod();

		iteratorClose = function (iterator, kind, value) {
		  var innerResult, innerError;
		  anObject(iterator);
		  try {
		    innerResult = getMethod(iterator, 'return');
		    if (!innerResult) {
		      if (kind === 'throw') throw value;
		      return value;
		    }
		    innerResult = call(innerResult, iterator);
		  } catch (error) {
		    innerError = true;
		    innerResult = error;
		  }
		  if (kind === 'throw') throw value;
		  if (innerError) throw innerResult;
		  anObject(innerResult);
		  return value;
		};
		return iteratorClose;
	}

	var callWithSafeIterationClosing;
	var hasRequiredCallWithSafeIterationClosing;

	function requireCallWithSafeIterationClosing () {
		if (hasRequiredCallWithSafeIterationClosing) return callWithSafeIterationClosing;
		hasRequiredCallWithSafeIterationClosing = 1;
		var anObject = requireAnObject();
		var iteratorClose = requireIteratorClose();

		// call something on iterator step with safe closing on error
		callWithSafeIterationClosing = function (iterator, fn, value, ENTRIES) {
		  try {
		    return ENTRIES ? fn(anObject(value)[0], value[1]) : fn(value);
		  } catch (error) {
		    iteratorClose(iterator, 'throw', error);
		  }
		};
		return callWithSafeIterationClosing;
	}

	var iterators;
	var hasRequiredIterators;

	function requireIterators () {
		if (hasRequiredIterators) return iterators;
		hasRequiredIterators = 1;
		iterators = {};
		return iterators;
	}

	var isArrayIteratorMethod;
	var hasRequiredIsArrayIteratorMethod;

	function requireIsArrayIteratorMethod () {
		if (hasRequiredIsArrayIteratorMethod) return isArrayIteratorMethod;
		hasRequiredIsArrayIteratorMethod = 1;
		var wellKnownSymbol = requireWellKnownSymbol();
		var Iterators = requireIterators();

		var ITERATOR = wellKnownSymbol('iterator');
		var ArrayPrototype = Array.prototype;

		// check on default Array iterator
		isArrayIteratorMethod = function (it) {
		  return it !== undefined && (Iterators.Array === it || ArrayPrototype[ITERATOR] === it);
		};
		return isArrayIteratorMethod;
	}

	var getIteratorMethod;
	var hasRequiredGetIteratorMethod;

	function requireGetIteratorMethod () {
		if (hasRequiredGetIteratorMethod) return getIteratorMethod;
		hasRequiredGetIteratorMethod = 1;
		var classof = requireClassof();
		var getMethod = requireGetMethod();
		var isNullOrUndefined = requireIsNullOrUndefined();
		var Iterators = requireIterators();
		var wellKnownSymbol = requireWellKnownSymbol();

		var ITERATOR = wellKnownSymbol('iterator');

		getIteratorMethod = function (it) {
		  if (!isNullOrUndefined(it)) return getMethod(it, ITERATOR)
		    || getMethod(it, '@@iterator')
		    || Iterators[classof(it)];
		};
		return getIteratorMethod;
	}

	var getIterator;
	var hasRequiredGetIterator;

	function requireGetIterator () {
		if (hasRequiredGetIterator) return getIterator;
		hasRequiredGetIterator = 1;
		var call = requireFunctionCall();
		var aCallable = requireACallable();
		var anObject = requireAnObject();
		var tryToString = requireTryToString();
		var getIteratorMethod = requireGetIteratorMethod();

		var $TypeError = TypeError;

		getIterator = function (argument, usingIterator) {
		  var iteratorMethod = arguments.length < 2 ? getIteratorMethod(argument) : usingIterator;
		  if (aCallable(iteratorMethod)) return anObject(call(iteratorMethod, argument));
		  throw new $TypeError(tryToString(argument) + ' is not iterable');
		};
		return getIterator;
	}

	var arrayFrom;
	var hasRequiredArrayFrom;

	function requireArrayFrom () {
		if (hasRequiredArrayFrom) return arrayFrom;
		hasRequiredArrayFrom = 1;
		var bind = requireFunctionBindContext();
		var call = requireFunctionCall();
		var toObject = requireToObject();
		var callWithSafeIterationClosing = requireCallWithSafeIterationClosing();
		var isArrayIteratorMethod = requireIsArrayIteratorMethod();
		var isConstructor = requireIsConstructor();
		var lengthOfArrayLike = requireLengthOfArrayLike();
		var createProperty = requireCreateProperty();
		var setArrayLength = requireArraySetLength();
		var getIterator = requireGetIterator();
		var getIteratorMethod = requireGetIteratorMethod();
		var iteratorClose = requireIteratorClose();

		var $Array = Array;

		// `Array.from` method implementation
		// https://tc39.es/ecma262/#sec-array.from
		arrayFrom = function from(arrayLike /* , mapfn = undefined, thisArg = undefined */) {
		  var IS_CONSTRUCTOR = isConstructor(this);
		  var argumentsLength = arguments.length;
		  var mapfn = argumentsLength > 1 ? arguments[1] : undefined;
		  var mapping = mapfn !== undefined;
		  if (mapping) mapfn = bind(mapfn, argumentsLength > 2 ? arguments[2] : undefined);
		  var O = toObject(arrayLike);
		  var iteratorMethod = getIteratorMethod(O);
		  var index = 0;
		  var length, result, step, iterator, next, value;
		  // if the target is not iterable or it's an array with the default iterator - use a simple case
		  if (iteratorMethod && !(this === $Array && isArrayIteratorMethod(iteratorMethod))) {
		    result = IS_CONSTRUCTOR ? new this() : [];
		    iterator = getIterator(O, iteratorMethod);
		    next = iterator.next;
		    for (;!(step = call(next, iterator)).done; index++) {
		      value = mapping ? callWithSafeIterationClosing(iterator, mapfn, [step.value, index], true) : step.value;
		      try {
		        createProperty(result, index, value);
		      } catch (error) {
		        iteratorClose(iterator, 'throw', error);
		      }
		    }
		  } else {
		    length = lengthOfArrayLike(O);
		    result = IS_CONSTRUCTOR ? new this(length) : $Array(length);
		    for (;length > index; index++) {
		      value = mapping ? mapfn(O[index], index) : O[index];
		      createProperty(result, index, value);
		    }
		  }
		  setArrayLength(result, index);
		  return result;
		};
		return arrayFrom;
	}

	var checkCorrectnessOfIteration;
	var hasRequiredCheckCorrectnessOfIteration;

	function requireCheckCorrectnessOfIteration () {
		if (hasRequiredCheckCorrectnessOfIteration) return checkCorrectnessOfIteration;
		hasRequiredCheckCorrectnessOfIteration = 1;
		var wellKnownSymbol = requireWellKnownSymbol();

		var ITERATOR = wellKnownSymbol('iterator');
		var SAFE_CLOSING = false;

		try {
		  var called = 0;
		  var iteratorWithReturn = {
		    next: function () {
		      return { done: !!called++ };
		    },
		    'return': function () {
		      SAFE_CLOSING = true;
		    }
		  };
		  // eslint-disable-next-line unicorn/no-immediate-mutation -- ES3 syntax limitation
		  iteratorWithReturn[ITERATOR] = function () {
		    return this;
		  };
		  // eslint-disable-next-line es/no-array-from, no-throw-literal -- required for testing
		  Array.from(iteratorWithReturn, function () { throw 2; });
		} catch (error) { /* empty */ }

		checkCorrectnessOfIteration = function (exec, SKIP_CLOSING) {
		  try {
		    if (!SKIP_CLOSING && !SAFE_CLOSING) return false;
		  } catch (error) { return false; } // workaround of old WebKit + `eval` bug
		  var ITERATION_SUPPORT = false;
		  try {
		    var object = {};
		    // eslint-disable-next-line unicorn/no-immediate-mutation -- ES3 syntax limitation
		    object[ITERATOR] = function () {
		      return {
		        next: function () {
		          return { done: ITERATION_SUPPORT = true };
		        }
		      };
		    };
		    exec(object);
		  } catch (error) { /* empty */ }
		  return ITERATION_SUPPORT;
		};
		return checkCorrectnessOfIteration;
	}

	var hasRequiredEs_array_from;

	function requireEs_array_from () {
		if (hasRequiredEs_array_from) return es_array_from;
		hasRequiredEs_array_from = 1;
		var $ = require_export();
		var from = requireArrayFrom();
		var checkCorrectnessOfIteration = requireCheckCorrectnessOfIteration();

		var INCORRECT_ITERATION = !checkCorrectnessOfIteration(function (iterable) {
		  // eslint-disable-next-line es/no-array-from -- required for testing
		  Array.from(iterable);
		});

		// `Array.from` method
		// https://tc39.es/ecma262/#sec-array.from
		$({ target: 'Array', stat: true, forced: INCORRECT_ITERATION }, {
		  from: from
		});
		return es_array_from;
	}

	requireEs_array_from();

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

	var correctPrototypeGetter;
	var hasRequiredCorrectPrototypeGetter;

	function requireCorrectPrototypeGetter () {
		if (hasRequiredCorrectPrototypeGetter) return correctPrototypeGetter;
		hasRequiredCorrectPrototypeGetter = 1;
		var fails = requireFails();

		correctPrototypeGetter = !fails(function () {
		  function F() { /* empty */ }
		  F.prototype.constructor = null;
		  // eslint-disable-next-line es/no-object-getprototypeof -- required for testing
		  return Object.getPrototypeOf(new F()) !== F.prototype;
		});
		return correctPrototypeGetter;
	}

	var objectGetPrototypeOf;
	var hasRequiredObjectGetPrototypeOf;

	function requireObjectGetPrototypeOf () {
		if (hasRequiredObjectGetPrototypeOf) return objectGetPrototypeOf;
		hasRequiredObjectGetPrototypeOf = 1;
		var hasOwn = requireHasOwnProperty();
		var isCallable = requireIsCallable();
		var toObject = requireToObject();
		var sharedKey = requireSharedKey();
		var CORRECT_PROTOTYPE_GETTER = requireCorrectPrototypeGetter();

		var IE_PROTO = sharedKey('IE_PROTO');
		var $Object = Object;
		var ObjectPrototype = $Object.prototype;

		// `Object.getPrototypeOf` method
		// https://tc39.es/ecma262/#sec-object.getprototypeof
		// eslint-disable-next-line es/no-object-getprototypeof -- safe
		objectGetPrototypeOf = CORRECT_PROTOTYPE_GETTER ? $Object.getPrototypeOf : function (O) {
		  var object = toObject(O);
		  if (hasOwn(object, IE_PROTO)) return object[IE_PROTO];
		  var constructor = object.constructor;
		  if (isCallable(constructor) && object instanceof constructor) {
		    return constructor.prototype;
		  } return object instanceof $Object ? ObjectPrototype : null;
		};
		return objectGetPrototypeOf;
	}

	var iteratorsCore;
	var hasRequiredIteratorsCore;

	function requireIteratorsCore () {
		if (hasRequiredIteratorsCore) return iteratorsCore;
		hasRequiredIteratorsCore = 1;
		var fails = requireFails();
		var isCallable = requireIsCallable();
		var isObject = requireIsObject();
		var create = requireObjectCreate();
		var getPrototypeOf = requireObjectGetPrototypeOf();
		var defineBuiltIn = requireDefineBuiltIn();
		var wellKnownSymbol = requireWellKnownSymbol();
		var IS_PURE = requireIsPure();

		var ITERATOR = wellKnownSymbol('iterator');
		var BUGGY_SAFARI_ITERATORS = false;

		// `%IteratorPrototype%` object
		// https://tc39.es/ecma262/#sec-%iteratorprototype%-object
		var IteratorPrototype, PrototypeOfArrayIteratorPrototype, arrayIterator;

		/* eslint-disable es/no-array-prototype-keys -- safe */
		if ([].keys) {
		  arrayIterator = [].keys();
		  // Safari 8 has buggy iterators w/o `next`
		  if (!('next' in arrayIterator)) BUGGY_SAFARI_ITERATORS = true;
		  else {
		    PrototypeOfArrayIteratorPrototype = getPrototypeOf(getPrototypeOf(arrayIterator));
		    if (PrototypeOfArrayIteratorPrototype !== Object.prototype) IteratorPrototype = PrototypeOfArrayIteratorPrototype;
		  }
		}

		var NEW_ITERATOR_PROTOTYPE = !isObject(IteratorPrototype) || fails(function () {
		  var test = {};
		  // FF44- legacy iterators case
		  return IteratorPrototype[ITERATOR].call(test) !== test;
		});

		if (NEW_ITERATOR_PROTOTYPE) IteratorPrototype = {};
		else if (IS_PURE) IteratorPrototype = create(IteratorPrototype);

		// `%IteratorPrototype%[@@iterator]()` method
		// https://tc39.es/ecma262/#sec-%iteratorprototype%-@@iterator
		if (!isCallable(IteratorPrototype[ITERATOR])) {
		  defineBuiltIn(IteratorPrototype, ITERATOR, function () {
		    return this;
		  });
		}

		iteratorsCore = {
		  IteratorPrototype: IteratorPrototype,
		  BUGGY_SAFARI_ITERATORS: BUGGY_SAFARI_ITERATORS
		};
		return iteratorsCore;
	}

	var setToStringTag;
	var hasRequiredSetToStringTag;

	function requireSetToStringTag () {
		if (hasRequiredSetToStringTag) return setToStringTag;
		hasRequiredSetToStringTag = 1;
		var defineProperty = requireObjectDefineProperty().f;
		var hasOwn = requireHasOwnProperty();
		var wellKnownSymbol = requireWellKnownSymbol();

		var TO_STRING_TAG = wellKnownSymbol('toStringTag');

		setToStringTag = function (target, TAG, STATIC) {
		  if (target && !STATIC) target = target.prototype;
		  if (target && !hasOwn(target, TO_STRING_TAG)) {
		    defineProperty(target, TO_STRING_TAG, { configurable: true, value: TAG });
		  }
		};
		return setToStringTag;
	}

	var iteratorCreateConstructor;
	var hasRequiredIteratorCreateConstructor;

	function requireIteratorCreateConstructor () {
		if (hasRequiredIteratorCreateConstructor) return iteratorCreateConstructor;
		hasRequiredIteratorCreateConstructor = 1;
		var IteratorPrototype = requireIteratorsCore().IteratorPrototype;
		var create = requireObjectCreate();
		var createPropertyDescriptor = requireCreatePropertyDescriptor();
		var setToStringTag = requireSetToStringTag();
		var Iterators = requireIterators();

		var returnThis = function () { return this; };

		iteratorCreateConstructor = function (IteratorConstructor, NAME, next, ENUMERABLE_NEXT) {
		  var TO_STRING_TAG = NAME + ' Iterator';
		  IteratorConstructor.prototype = create(IteratorPrototype, { next: createPropertyDescriptor(+!ENUMERABLE_NEXT, next) });
		  setToStringTag(IteratorConstructor, TO_STRING_TAG, false, true);
		  Iterators[TO_STRING_TAG] = returnThis;
		  return IteratorConstructor;
		};
		return iteratorCreateConstructor;
	}

	var functionUncurryThisAccessor;
	var hasRequiredFunctionUncurryThisAccessor;

	function requireFunctionUncurryThisAccessor () {
		if (hasRequiredFunctionUncurryThisAccessor) return functionUncurryThisAccessor;
		hasRequiredFunctionUncurryThisAccessor = 1;
		var uncurryThis = requireFunctionUncurryThis();
		var aCallable = requireACallable();

		functionUncurryThisAccessor = function (object, key, method) {
		  try {
		    // eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
		    return uncurryThis(aCallable(Object.getOwnPropertyDescriptor(object, key)[method]));
		  } catch (error) { /* empty */ }
		};
		return functionUncurryThisAccessor;
	}

	var isPossiblePrototype;
	var hasRequiredIsPossiblePrototype;

	function requireIsPossiblePrototype () {
		if (hasRequiredIsPossiblePrototype) return isPossiblePrototype;
		hasRequiredIsPossiblePrototype = 1;
		var isObject = requireIsObject();

		isPossiblePrototype = function (argument) {
		  return isObject(argument) || argument === null;
		};
		return isPossiblePrototype;
	}

	var aPossiblePrototype;
	var hasRequiredAPossiblePrototype;

	function requireAPossiblePrototype () {
		if (hasRequiredAPossiblePrototype) return aPossiblePrototype;
		hasRequiredAPossiblePrototype = 1;
		var isPossiblePrototype = requireIsPossiblePrototype();

		var $String = String;
		var $TypeError = TypeError;

		aPossiblePrototype = function (argument) {
		  if (isPossiblePrototype(argument)) return argument;
		  throw new $TypeError("Can't set " + $String(argument) + ' as a prototype');
		};
		return aPossiblePrototype;
	}

	var objectSetPrototypeOf;
	var hasRequiredObjectSetPrototypeOf;

	function requireObjectSetPrototypeOf () {
		if (hasRequiredObjectSetPrototypeOf) return objectSetPrototypeOf;
		hasRequiredObjectSetPrototypeOf = 1;
		/* eslint-disable no-proto -- safe */
		var uncurryThisAccessor = requireFunctionUncurryThisAccessor();
		var isObject = requireIsObject();
		var requireObjectCoercible = requireRequireObjectCoercible();
		var aPossiblePrototype = requireAPossiblePrototype();

		// `Object.setPrototypeOf` method
		// https://tc39.es/ecma262/#sec-object.setprototypeof
		// Works with __proto__ only. Old v8 can't work with null proto objects.
		// eslint-disable-next-line es/no-object-setprototypeof -- safe
		objectSetPrototypeOf = Object.setPrototypeOf || ('__proto__' in {} ? function () {
		  var CORRECT_SETTER = false;
		  var test = {};
		  var setter;
		  try {
		    setter = uncurryThisAccessor(Object.prototype, '__proto__', 'set');
		    setter(test, []);
		    CORRECT_SETTER = test instanceof Array;
		  } catch (error) { /* empty */ }
		  return function setPrototypeOf(O, proto) {
		    requireObjectCoercible(O);
		    aPossiblePrototype(proto);
		    if (!isObject(O)) return O;
		    if (CORRECT_SETTER) setter(O, proto);
		    else O.__proto__ = proto;
		    return O;
		  };
		}() : undefined);
		return objectSetPrototypeOf;
	}

	var iteratorDefine;
	var hasRequiredIteratorDefine;

	function requireIteratorDefine () {
		if (hasRequiredIteratorDefine) return iteratorDefine;
		hasRequiredIteratorDefine = 1;
		var $ = require_export();
		var call = requireFunctionCall();
		var IS_PURE = requireIsPure();
		var FunctionName = requireFunctionName();
		var isCallable = requireIsCallable();
		var createIteratorConstructor = requireIteratorCreateConstructor();
		var getPrototypeOf = requireObjectGetPrototypeOf();
		var setPrototypeOf = requireObjectSetPrototypeOf();
		var setToStringTag = requireSetToStringTag();
		var createNonEnumerableProperty = requireCreateNonEnumerableProperty();
		var defineBuiltIn = requireDefineBuiltIn();
		var wellKnownSymbol = requireWellKnownSymbol();
		var Iterators = requireIterators();
		var IteratorsCore = requireIteratorsCore();

		var PROPER_FUNCTION_NAME = FunctionName.PROPER;
		var CONFIGURABLE_FUNCTION_NAME = FunctionName.CONFIGURABLE;
		var IteratorPrototype = IteratorsCore.IteratorPrototype;
		var BUGGY_SAFARI_ITERATORS = IteratorsCore.BUGGY_SAFARI_ITERATORS;
		var ITERATOR = wellKnownSymbol('iterator');
		var KEYS = 'keys';
		var VALUES = 'values';
		var ENTRIES = 'entries';

		var returnThis = function () { return this; };

		iteratorDefine = function (Iterable, NAME, IteratorConstructor, next, DEFAULT, IS_SET, FORCED) {
		  createIteratorConstructor(IteratorConstructor, NAME, next);

		  var getIterationMethod = function (KIND) {
		    if (KIND === DEFAULT && defaultIterator) return defaultIterator;
		    if (!BUGGY_SAFARI_ITERATORS && KIND && KIND in IterablePrototype) return IterablePrototype[KIND];

		    switch (KIND) {
		      case KEYS: return function keys() { return new IteratorConstructor(this, KIND); };
		      case VALUES: return function values() { return new IteratorConstructor(this, KIND); };
		      case ENTRIES: return function entries() { return new IteratorConstructor(this, KIND); };
		    }

		    return function () { return new IteratorConstructor(this); };
		  };

		  var TO_STRING_TAG = NAME + ' Iterator';
		  var INCORRECT_VALUES_NAME = false;
		  var IterablePrototype = Iterable.prototype;
		  var nativeIterator = IterablePrototype[ITERATOR]
		    || IterablePrototype['@@iterator']
		    || DEFAULT && IterablePrototype[DEFAULT];
		  var defaultIterator = !BUGGY_SAFARI_ITERATORS && nativeIterator || getIterationMethod(DEFAULT);
		  var anyNativeIterator = NAME === 'Array' ? IterablePrototype.entries || nativeIterator : nativeIterator;
		  var CurrentIteratorPrototype, methods, KEY;

		  // fix native
		  if (anyNativeIterator) {
		    CurrentIteratorPrototype = getPrototypeOf(anyNativeIterator.call(new Iterable()));
		    if (CurrentIteratorPrototype !== Object.prototype && CurrentIteratorPrototype.next) {
		      if (!IS_PURE && getPrototypeOf(CurrentIteratorPrototype) !== IteratorPrototype) {
		        if (setPrototypeOf) {
		          setPrototypeOf(CurrentIteratorPrototype, IteratorPrototype);
		        } else if (!isCallable(CurrentIteratorPrototype[ITERATOR])) {
		          defineBuiltIn(CurrentIteratorPrototype, ITERATOR, returnThis);
		        }
		      }
		      // Set @@toStringTag to native iterators
		      setToStringTag(CurrentIteratorPrototype, TO_STRING_TAG, true, true);
		      if (IS_PURE) Iterators[TO_STRING_TAG] = returnThis;
		    }
		  }

		  // fix Array.prototype.{ values, @@iterator }.name in V8 / FF
		  if (PROPER_FUNCTION_NAME && DEFAULT === VALUES && nativeIterator && nativeIterator.name !== VALUES) {
		    if (!IS_PURE && CONFIGURABLE_FUNCTION_NAME) {
		      createNonEnumerableProperty(IterablePrototype, 'name', VALUES);
		    } else {
		      INCORRECT_VALUES_NAME = true;
		      defaultIterator = function values() { return call(nativeIterator, this); };
		    }
		  }

		  // export additional methods
		  if (DEFAULT) {
		    methods = {
		      values: getIterationMethod(VALUES),
		      keys: IS_SET ? defaultIterator : getIterationMethod(KEYS),
		      entries: getIterationMethod(ENTRIES)
		    };
		    if (FORCED) for (KEY in methods) {
		      if (BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME || !(KEY in IterablePrototype)) {
		        defineBuiltIn(IterablePrototype, KEY, methods[KEY]);
		      }
		    } else $({ target: NAME, proto: true, forced: BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME }, methods);
		  }

		  // define iterator
		  if ((!IS_PURE || FORCED) && IterablePrototype[ITERATOR] !== defaultIterator) {
		    defineBuiltIn(IterablePrototype, ITERATOR, defaultIterator, { name: DEFAULT });
		  }
		  Iterators[NAME] = defaultIterator;

		  return methods;
		};
		return iteratorDefine;
	}

	var createIterResultObject;
	var hasRequiredCreateIterResultObject;

	function requireCreateIterResultObject () {
		if (hasRequiredCreateIterResultObject) return createIterResultObject;
		hasRequiredCreateIterResultObject = 1;
		// `CreateIterResultObject` abstract operation
		// https://tc39.es/ecma262/#sec-createiterresultobject
		createIterResultObject = function (value, done) {
		  return { value: value, done: done };
		};
		return createIterResultObject;
	}

	var es_array_iterator;
	var hasRequiredEs_array_iterator;

	function requireEs_array_iterator () {
		if (hasRequiredEs_array_iterator) return es_array_iterator;
		hasRequiredEs_array_iterator = 1;
		var toIndexedObject = requireToIndexedObject();
		var addToUnscopables = requireAddToUnscopables();
		var Iterators = requireIterators();
		var InternalStateModule = requireInternalState();
		var defineProperty = requireObjectDefineProperty().f;
		var defineIterator = requireIteratorDefine();
		var createIterResultObject = requireCreateIterResultObject();
		var IS_PURE = requireIsPure();
		var DESCRIPTORS = requireDescriptors();

		var ARRAY_ITERATOR = 'Array Iterator';
		var setInternalState = InternalStateModule.set;
		var getInternalState = InternalStateModule.getterFor(ARRAY_ITERATOR);

		// `Array.prototype.entries` method
		// https://tc39.es/ecma262/#sec-array.prototype.entries
		// `Array.prototype.keys` method
		// https://tc39.es/ecma262/#sec-array.prototype.keys
		// `Array.prototype.values` method
		// https://tc39.es/ecma262/#sec-array.prototype.values
		// `Array.prototype[@@iterator]` method
		// https://tc39.es/ecma262/#sec-array.prototype-@@iterator
		// `CreateArrayIterator` internal method
		// https://tc39.es/ecma262/#sec-createarrayiterator
		es_array_iterator = defineIterator(Array, 'Array', function (iterated, kind) {
		  setInternalState(this, {
		    type: ARRAY_ITERATOR,
		    target: toIndexedObject(iterated), // target
		    index: 0,                          // next index
		    kind: kind                         // kind
		  });
		// `%ArrayIteratorPrototype%.next` method
		// https://tc39.es/ecma262/#sec-%arrayiteratorprototype%.next
		}, function () {
		  var state = getInternalState(this);
		  var target = state.target;
		  var index = state.index++;
		  if (!target || index >= target.length) {
		    state.target = null;
		    return createIterResultObject(undefined, true);
		  }
		  switch (state.kind) {
		    case 'keys': return createIterResultObject(index, false);
		    case 'values': return createIterResultObject(target[index], false);
		  } return createIterResultObject([index, target[index]], false);
		}, 'values');

		// argumentsList[@@iterator] is %ArrayProto_values%
		// https://tc39.es/ecma262/#sec-createunmappedargumentsobject
		// https://tc39.es/ecma262/#sec-createmappedargumentsobject
		var values = Iterators.Arguments = Iterators.Array;

		// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
		addToUnscopables('keys');
		addToUnscopables('values');
		addToUnscopables('entries');

		// V8 ~ Chrome 45- bug
		if (!IS_PURE && DESCRIPTORS && values.name !== 'values') try {
		  defineProperty(values, 'name', { value: 'values' });
		} catch (error) { /* empty */ }
		return es_array_iterator;
	}

	requireEs_array_iterator();

	var es_arrayBuffer_slice = {};

	var arrayBufferBasicDetection;
	var hasRequiredArrayBufferBasicDetection;

	function requireArrayBufferBasicDetection () {
		if (hasRequiredArrayBufferBasicDetection) return arrayBufferBasicDetection;
		hasRequiredArrayBufferBasicDetection = 1;
		// eslint-disable-next-line es/no-typed-arrays -- safe
		arrayBufferBasicDetection = typeof ArrayBuffer != 'undefined' && typeof DataView != 'undefined';
		return arrayBufferBasicDetection;
	}

	var defineBuiltInAccessor;
	var hasRequiredDefineBuiltInAccessor;

	function requireDefineBuiltInAccessor () {
		if (hasRequiredDefineBuiltInAccessor) return defineBuiltInAccessor;
		hasRequiredDefineBuiltInAccessor = 1;
		var makeBuiltIn = requireMakeBuiltIn();
		var defineProperty = requireObjectDefineProperty();

		defineBuiltInAccessor = function (target, name, descriptor) {
		  if (descriptor.get) makeBuiltIn(descriptor.get, name, { getter: true });
		  if (descriptor.set) makeBuiltIn(descriptor.set, name, { setter: true });
		  return defineProperty.f(target, name, descriptor);
		};
		return defineBuiltInAccessor;
	}

	var defineBuiltIns;
	var hasRequiredDefineBuiltIns;

	function requireDefineBuiltIns () {
		if (hasRequiredDefineBuiltIns) return defineBuiltIns;
		hasRequiredDefineBuiltIns = 1;
		var defineBuiltIn = requireDefineBuiltIn();

		defineBuiltIns = function (target, src, options) {
		  for (var key in src) defineBuiltIn(target, key, src[key], options);
		  return target;
		};
		return defineBuiltIns;
	}

	var anInstance;
	var hasRequiredAnInstance;

	function requireAnInstance () {
		if (hasRequiredAnInstance) return anInstance;
		hasRequiredAnInstance = 1;
		var isPrototypeOf = requireObjectIsPrototypeOf();

		var $TypeError = TypeError;

		anInstance = function (it, Prototype) {
		  if (isPrototypeOf(Prototype, it)) return it;
		  throw new $TypeError('Incorrect invocation');
		};
		return anInstance;
	}

	var toIndex;
	var hasRequiredToIndex;

	function requireToIndex () {
		if (hasRequiredToIndex) return toIndex;
		hasRequiredToIndex = 1;
		var toIntegerOrInfinity = requireToIntegerOrInfinity();
		var toLength = requireToLength();

		var $RangeError = RangeError;

		// `ToIndex` abstract operation
		// https://tc39.es/ecma262/#sec-toindex
		toIndex = function (it) {
		  if (it === undefined) return 0;
		  var number = toIntegerOrInfinity(it);
		  var length = toLength(number);
		  if (number !== length) throw new $RangeError('Wrong length or index');
		  return length;
		};
		return toIndex;
	}

	var mathSign;
	var hasRequiredMathSign;

	function requireMathSign () {
		if (hasRequiredMathSign) return mathSign;
		hasRequiredMathSign = 1;
		// `Math.sign` method implementation
		// https://tc39.es/ecma262/#sec-math.sign
		// eslint-disable-next-line es/no-math-sign -- safe
		mathSign = Math.sign || function sign(x) {
		  var n = +x;
		  // eslint-disable-next-line no-self-compare -- NaN check
		  return n === 0 || n !== n ? n : n < 0 ? -1 : 1;
		};
		return mathSign;
	}

	var mathRoundTiesToEven;
	var hasRequiredMathRoundTiesToEven;

	function requireMathRoundTiesToEven () {
		if (hasRequiredMathRoundTiesToEven) return mathRoundTiesToEven;
		hasRequiredMathRoundTiesToEven = 1;
		var EPSILON = 2.220446049250313e-16; // Number.EPSILON
		var INVERSE_EPSILON = 1 / EPSILON;

		mathRoundTiesToEven = function (n) {
		  return n + INVERSE_EPSILON - INVERSE_EPSILON;
		};
		return mathRoundTiesToEven;
	}

	var mathFloatRound;
	var hasRequiredMathFloatRound;

	function requireMathFloatRound () {
		if (hasRequiredMathFloatRound) return mathFloatRound;
		hasRequiredMathFloatRound = 1;
		var sign = requireMathSign();
		var roundTiesToEven = requireMathRoundTiesToEven();

		var abs = Math.abs;

		var EPSILON = 2.220446049250313e-16; // Number.EPSILON

		mathFloatRound = function (x, FLOAT_EPSILON, FLOAT_MAX_VALUE, FLOAT_MIN_VALUE) {
		  var n = +x;
		  var absolute = abs(n);
		  var s = sign(n);
		  if (absolute < FLOAT_MIN_VALUE) return s * roundTiesToEven(absolute / FLOAT_MIN_VALUE / FLOAT_EPSILON) * FLOAT_MIN_VALUE * FLOAT_EPSILON;
		  var a = (1 + FLOAT_EPSILON / EPSILON) * absolute;
		  var result = a - (a - absolute);
		  // eslint-disable-next-line no-self-compare -- NaN check
		  if (result > FLOAT_MAX_VALUE || result !== result) return s * Infinity;
		  return s * result;
		};
		return mathFloatRound;
	}

	var mathFround;
	var hasRequiredMathFround;

	function requireMathFround () {
		if (hasRequiredMathFround) return mathFround;
		hasRequiredMathFround = 1;
		var floatRound = requireMathFloatRound();

		var FLOAT32_EPSILON = 1.1920928955078125e-7; // 2 ** -23;
		var FLOAT32_MAX_VALUE = 3.4028234663852886e+38; // 2 ** 128 - 2 ** 104
		var FLOAT32_MIN_VALUE = 1.1754943508222875e-38; // 2 ** -126;

		// `Math.fround` method implementation
		// https://tc39.es/ecma262/#sec-math.fround
		// eslint-disable-next-line es/no-math-fround -- safe
		mathFround = Math.fround || function fround(x) {
		  return floatRound(x, FLOAT32_EPSILON, FLOAT32_MAX_VALUE, FLOAT32_MIN_VALUE);
		};
		return mathFround;
	}

	var ieee754;
	var hasRequiredIeee754;

	function requireIeee754 () {
		if (hasRequiredIeee754) return ieee754;
		hasRequiredIeee754 = 1;
		// IEEE754 conversions based on https://github.com/feross/ieee754
		var $Array = Array;
		var abs = Math.abs;
		var pow = Math.pow;
		var floor = Math.floor;
		var log = Math.log;
		var LN2 = Math.LN2;

		var pack = function (number, mantissaLength, bytes) {
		  var buffer = $Array(bytes);
		  var exponentLength = bytes * 8 - mantissaLength - 1;
		  var eMax = (1 << exponentLength) - 1;
		  var eBias = eMax >> 1;
		  var rt = mantissaLength === 23 ? pow(2, -24) - pow(2, -77) : 0;
		  var sign = number < 0 || number === 0 && 1 / number < 0 ? 1 : 0;
		  var index = 0;
		  var exponent, mantissa, c;
		  number = abs(number);
		  // eslint-disable-next-line no-self-compare -- NaN check
		  if (number !== number || number === Infinity) {
		    // eslint-disable-next-line no-self-compare -- NaN check
		    mantissa = number !== number ? 1 : 0;
		    exponent = eMax;
		  } else {
		    exponent = floor(log(number) / LN2);
		    c = pow(2, -exponent);
		    if (number * c < 1) {
		      exponent--;
		      c *= 2;
		    }
		    if (exponent + eBias >= 1) {
		      number += rt / c;
		    } else {
		      number += rt * pow(2, 1 - eBias);
		    }
		    if (number * c >= 2) {
		      exponent++;
		      c /= 2;
		    }
		    if (exponent + eBias >= eMax) {
		      mantissa = 0;
		      exponent = eMax;
		    } else if (exponent + eBias >= 1) {
		      mantissa = (number * c - 1) * pow(2, mantissaLength);
		      exponent += eBias;
		    } else {
		      mantissa = number * pow(2, eBias - 1) * pow(2, mantissaLength);
		      exponent = 0;
		    }
		  }
		  while (mantissaLength >= 8) {
		    buffer[index++] = mantissa & 255;
		    mantissa /= 256;
		    mantissaLength -= 8;
		  }
		  exponent = exponent << mantissaLength | mantissa;
		  exponentLength += mantissaLength;
		  while (exponentLength > 0) {
		    buffer[index++] = exponent & 255;
		    exponent /= 256;
		    exponentLength -= 8;
		  }
		  buffer[index - 1] |= sign * 128;
		  return buffer;
		};

		var unpack = function (buffer, mantissaLength) {
		  var bytes = buffer.length;
		  var exponentLength = bytes * 8 - mantissaLength - 1;
		  var eMax = (1 << exponentLength) - 1;
		  var eBias = eMax >> 1;
		  var nBits = exponentLength - 7;
		  var index = bytes - 1;
		  var sign = buffer[index--];
		  var exponent = sign & 127;
		  var mantissa;
		  sign >>= 7;
		  while (nBits > 0) {
		    exponent = exponent * 256 + buffer[index--];
		    nBits -= 8;
		  }
		  mantissa = exponent & (1 << -nBits) - 1;
		  exponent >>= -nBits;
		  nBits += mantissaLength;
		  while (nBits > 0) {
		    mantissa = mantissa * 256 + buffer[index--];
		    nBits -= 8;
		  }
		  if (exponent === 0) {
		    exponent = 1 - eBias;
		  } else if (exponent === eMax) {
		    return mantissa ? NaN : sign ? -Infinity : Infinity;
		  } else {
		    mantissa += pow(2, mantissaLength);
		    exponent -= eBias;
		  } return (sign ? -1 : 1) * mantissa * pow(2, exponent - mantissaLength);
		};

		ieee754 = {
		  pack: pack,
		  unpack: unpack
		};
		return ieee754;
	}

	var arrayFill;
	var hasRequiredArrayFill;

	function requireArrayFill () {
		if (hasRequiredArrayFill) return arrayFill;
		hasRequiredArrayFill = 1;
		var toObject = requireToObject();
		var toAbsoluteIndex = requireToAbsoluteIndex();
		var lengthOfArrayLike = requireLengthOfArrayLike();

		// `Array.prototype.fill` method implementation
		// https://tc39.es/ecma262/#sec-array.prototype.fill
		arrayFill = function fill(value /* , start = 0, end = @length */) {
		  var O = toObject(this);
		  var length = lengthOfArrayLike(O);
		  var argumentsLength = arguments.length;
		  var index = toAbsoluteIndex(argumentsLength > 1 ? arguments[1] : undefined, length);
		  var end = argumentsLength > 2 ? arguments[2] : undefined;
		  var endPos = end === undefined ? length : toAbsoluteIndex(end, length);
		  while (endPos > index) O[index++] = value;
		  return O;
		};
		return arrayFill;
	}

	var inheritIfRequired;
	var hasRequiredInheritIfRequired;

	function requireInheritIfRequired () {
		if (hasRequiredInheritIfRequired) return inheritIfRequired;
		hasRequiredInheritIfRequired = 1;
		var isCallable = requireIsCallable();
		var isObject = requireIsObject();
		var setPrototypeOf = requireObjectSetPrototypeOf();

		// makes subclassing work correct for wrapped built-ins
		inheritIfRequired = function ($this, dummy, Wrapper) {
		  var NewTarget, NewTargetPrototype;
		  if (
		    // it can work only with native `setPrototypeOf`
		    setPrototypeOf &&
		    // we haven't completely correct pre-ES6 way for getting `new.target`, so use this
		    isCallable(NewTarget = dummy.constructor) &&
		    NewTarget !== Wrapper &&
		    isObject(NewTargetPrototype = NewTarget.prototype) &&
		    NewTargetPrototype !== Wrapper.prototype
		  ) setPrototypeOf($this, NewTargetPrototype);
		  return $this;
		};
		return inheritIfRequired;
	}

	var arrayBuffer;
	var hasRequiredArrayBuffer;

	function requireArrayBuffer () {
		if (hasRequiredArrayBuffer) return arrayBuffer;
		hasRequiredArrayBuffer = 1;
		var globalThis = requireGlobalThis();
		var uncurryThis = requireFunctionUncurryThis();
		var DESCRIPTORS = requireDescriptors();
		var NATIVE_ARRAY_BUFFER = requireArrayBufferBasicDetection();
		var FunctionName = requireFunctionName();
		var createNonEnumerableProperty = requireCreateNonEnumerableProperty();
		var defineBuiltInAccessor = requireDefineBuiltInAccessor();
		var defineBuiltIns = requireDefineBuiltIns();
		var fails = requireFails();
		var anInstance = requireAnInstance();
		var toIntegerOrInfinity = requireToIntegerOrInfinity();
		var toIndex = requireToIndex();
		var fround = requireMathFround();
		var IEEE754 = requireIeee754();
		var getPrototypeOf = requireObjectGetPrototypeOf();
		var setPrototypeOf = requireObjectSetPrototypeOf();
		var arrayFill = requireArrayFill();
		var arraySlice = requireArraySlice();
		var inheritIfRequired = requireInheritIfRequired();
		var copyConstructorProperties = requireCopyConstructorProperties();
		var setToStringTag = requireSetToStringTag();
		var InternalStateModule = requireInternalState();

		var PROPER_FUNCTION_NAME = FunctionName.PROPER;
		var CONFIGURABLE_FUNCTION_NAME = FunctionName.CONFIGURABLE;
		var ARRAY_BUFFER = 'ArrayBuffer';
		var DATA_VIEW = 'DataView';
		var PROTOTYPE = 'prototype';
		var WRONG_LENGTH = 'Wrong length';
		var WRONG_INDEX = 'Wrong index';
		var getInternalArrayBufferState = InternalStateModule.getterFor(ARRAY_BUFFER);
		var getInternalDataViewState = InternalStateModule.getterFor(DATA_VIEW);
		var setInternalState = InternalStateModule.set;
		var NativeArrayBuffer = globalThis[ARRAY_BUFFER];
		var $ArrayBuffer = NativeArrayBuffer;
		var ArrayBufferPrototype = $ArrayBuffer && $ArrayBuffer[PROTOTYPE];
		var $DataView = globalThis[DATA_VIEW];
		var DataViewPrototype = $DataView && $DataView[PROTOTYPE];
		var ObjectPrototype = Object.prototype;
		var Array = globalThis.Array;
		var RangeError = globalThis.RangeError;
		var fill = uncurryThis(arrayFill);
		var reverse = uncurryThis([].reverse);

		var packIEEE754 = IEEE754.pack;
		var unpackIEEE754 = IEEE754.unpack;

		var packInt8 = function (number) {
		  return [number & 0xFF];
		};

		var packInt16 = function (number) {
		  return [number & 0xFF, number >> 8 & 0xFF];
		};

		var packInt32 = function (number) {
		  return [number & 0xFF, number >> 8 & 0xFF, number >> 16 & 0xFF, number >> 24 & 0xFF];
		};

		var unpackInt32 = function (buffer) {
		  return buffer[3] << 24 | buffer[2] << 16 | buffer[1] << 8 | buffer[0];
		};

		var packFloat32 = function (number) {
		  return packIEEE754(fround(number), 23, 4);
		};

		var packFloat64 = function (number) {
		  return packIEEE754(number, 52, 8);
		};

		var addGetter = function (Constructor, key, getInternalState) {
		  defineBuiltInAccessor(Constructor[PROTOTYPE], key, {
		    configurable: true,
		    get: function () {
		      return getInternalState(this)[key];
		    }
		  });
		};

		var get = function (view, count, index, isLittleEndian) {
		  var store = getInternalDataViewState(view);
		  var intIndex = toIndex(index);
		  var boolIsLittleEndian = !!isLittleEndian;
		  if (intIndex + count > store.byteLength) throw new RangeError(WRONG_INDEX);
		  var bytes = store.bytes;
		  var start = intIndex + store.byteOffset;
		  var pack = arraySlice(bytes, start, start + count);
		  return boolIsLittleEndian ? pack : reverse(pack);
		};

		var set = function (view, count, index, conversion, value, isLittleEndian) {
		  var store = getInternalDataViewState(view);
		  var intIndex = toIndex(index);
		  var pack = conversion(+value);
		  var boolIsLittleEndian = !!isLittleEndian;
		  if (intIndex + count > store.byteLength) throw new RangeError(WRONG_INDEX);
		  var bytes = store.bytes;
		  var start = intIndex + store.byteOffset;
		  for (var i = 0; i < count; i++) bytes[start + i] = pack[boolIsLittleEndian ? i : count - i - 1];
		};

		if (!NATIVE_ARRAY_BUFFER) {
		  $ArrayBuffer = function ArrayBuffer(length) {
		    anInstance(this, ArrayBufferPrototype);
		    var byteLength = toIndex(length);
		    setInternalState(this, {
		      type: ARRAY_BUFFER,
		      bytes: fill(Array(byteLength), 0),
		      byteLength: byteLength
		    });
		    if (!DESCRIPTORS) {
		      this.byteLength = byteLength;
		      this.detached = false;
		    }
		  };

		  ArrayBufferPrototype = $ArrayBuffer[PROTOTYPE];

		  $DataView = function DataView(buffer, byteOffset, byteLength) {
		    anInstance(this, DataViewPrototype);
		    anInstance(buffer, ArrayBufferPrototype);
		    var bufferState = getInternalArrayBufferState(buffer);
		    var bufferLength = bufferState.byteLength;
		    var offset = toIntegerOrInfinity(byteOffset);
		    if (offset < 0 || offset > bufferLength) throw new RangeError('Wrong offset');
		    byteLength = byteLength === undefined ? bufferLength - offset : toIndex(byteLength);
		    if (offset + byteLength > bufferLength) throw new RangeError(WRONG_LENGTH);
		    setInternalState(this, {
		      type: DATA_VIEW,
		      buffer: buffer,
		      byteLength: byteLength,
		      byteOffset: offset,
		      bytes: bufferState.bytes
		    });
		    if (!DESCRIPTORS) {
		      this.buffer = buffer;
		      this.byteLength = byteLength;
		      this.byteOffset = offset;
		    }
		  };

		  DataViewPrototype = $DataView[PROTOTYPE];

		  if (DESCRIPTORS) {
		    addGetter($ArrayBuffer, 'byteLength', getInternalArrayBufferState);
		    addGetter($DataView, 'buffer', getInternalDataViewState);
		    addGetter($DataView, 'byteLength', getInternalDataViewState);
		    addGetter($DataView, 'byteOffset', getInternalDataViewState);
		  }

		  defineBuiltIns(DataViewPrototype, {
		    getInt8: function getInt8(byteOffset) {
		      return get(this, 1, byteOffset)[0] << 24 >> 24;
		    },
		    getUint8: function getUint8(byteOffset) {
		      return get(this, 1, byteOffset)[0];
		    },
		    getInt16: function getInt16(byteOffset /* , littleEndian */) {
		      var bytes = get(this, 2, byteOffset, arguments.length > 1 ? arguments[1] : false);
		      return (bytes[1] << 8 | bytes[0]) << 16 >> 16;
		    },
		    getUint16: function getUint16(byteOffset /* , littleEndian */) {
		      var bytes = get(this, 2, byteOffset, arguments.length > 1 ? arguments[1] : false);
		      return bytes[1] << 8 | bytes[0];
		    },
		    getInt32: function getInt32(byteOffset /* , littleEndian */) {
		      return unpackInt32(get(this, 4, byteOffset, arguments.length > 1 ? arguments[1] : false));
		    },
		    getUint32: function getUint32(byteOffset /* , littleEndian */) {
		      return unpackInt32(get(this, 4, byteOffset, arguments.length > 1 ? arguments[1] : false)) >>> 0;
		    },
		    getFloat32: function getFloat32(byteOffset /* , littleEndian */) {
		      return unpackIEEE754(get(this, 4, byteOffset, arguments.length > 1 ? arguments[1] : false), 23);
		    },
		    getFloat64: function getFloat64(byteOffset /* , littleEndian */) {
		      return unpackIEEE754(get(this, 8, byteOffset, arguments.length > 1 ? arguments[1] : false), 52);
		    },
		    setInt8: function setInt8(byteOffset, value) {
		      set(this, 1, byteOffset, packInt8, value);
		    },
		    setUint8: function setUint8(byteOffset, value) {
		      set(this, 1, byteOffset, packInt8, value);
		    },
		    setInt16: function setInt16(byteOffset, value /* , littleEndian */) {
		      set(this, 2, byteOffset, packInt16, value, arguments.length > 2 ? arguments[2] : false);
		    },
		    setUint16: function setUint16(byteOffset, value /* , littleEndian */) {
		      set(this, 2, byteOffset, packInt16, value, arguments.length > 2 ? arguments[2] : false);
		    },
		    setInt32: function setInt32(byteOffset, value /* , littleEndian */) {
		      set(this, 4, byteOffset, packInt32, value, arguments.length > 2 ? arguments[2] : false);
		    },
		    setUint32: function setUint32(byteOffset, value /* , littleEndian */) {
		      set(this, 4, byteOffset, packInt32, value, arguments.length > 2 ? arguments[2] : false);
		    },
		    setFloat32: function setFloat32(byteOffset, value /* , littleEndian */) {
		      set(this, 4, byteOffset, packFloat32, value, arguments.length > 2 ? arguments[2] : false);
		    },
		    setFloat64: function setFloat64(byteOffset, value /* , littleEndian */) {
		      set(this, 8, byteOffset, packFloat64, value, arguments.length > 2 ? arguments[2] : false);
		    }
		  });
		} else {
		  var INCORRECT_ARRAY_BUFFER_NAME = PROPER_FUNCTION_NAME && NativeArrayBuffer.name !== ARRAY_BUFFER;
		  /* eslint-disable no-new, sonarjs/inconsistent-function-call -- required for testing */
		  if (!fails(function () {
		    NativeArrayBuffer(1);
		  }) || !fails(function () {
		    new NativeArrayBuffer(-1);
		  }) || fails(function () {
		    new NativeArrayBuffer();
		    new NativeArrayBuffer(1.5);
		    new NativeArrayBuffer(NaN);
		    return NativeArrayBuffer.length !== 1 || INCORRECT_ARRAY_BUFFER_NAME && !CONFIGURABLE_FUNCTION_NAME;
		  })) {
		    /* eslint-enable no-new, sonarjs/inconsistent-function-call -- required for testing */
		    $ArrayBuffer = function ArrayBuffer(length) {
		      anInstance(this, ArrayBufferPrototype);
		      return inheritIfRequired(new NativeArrayBuffer(toIndex(length)), this, $ArrayBuffer);
		    };

		    $ArrayBuffer[PROTOTYPE] = ArrayBufferPrototype;

		    ArrayBufferPrototype.constructor = $ArrayBuffer;

		    copyConstructorProperties($ArrayBuffer, NativeArrayBuffer);
		  } else if (INCORRECT_ARRAY_BUFFER_NAME && CONFIGURABLE_FUNCTION_NAME) {
		    createNonEnumerableProperty(NativeArrayBuffer, 'name', ARRAY_BUFFER);
		  }

		  // WebKit bug - the same parent prototype for typed arrays and data view
		  if (setPrototypeOf && getPrototypeOf(DataViewPrototype) !== ObjectPrototype) {
		    setPrototypeOf(DataViewPrototype, ObjectPrototype);
		  }

		  // iOS Safari 7.x bug
		  var testView = new $DataView(new $ArrayBuffer(2));
		  var $setInt8 = uncurryThis(DataViewPrototype.setInt8);
		  testView.setInt8(0, 2147483648);
		  testView.setInt8(1, 2147483649);
		  if (testView.getInt8(0) || !testView.getInt8(1)) defineBuiltIns(DataViewPrototype, {
		    setInt8: function setInt8(byteOffset, value) {
		      $setInt8(this, byteOffset, value << 24 >> 24);
		    },
		    setUint8: function setUint8(byteOffset, value) {
		      $setInt8(this, byteOffset, value << 24 >> 24);
		    }
		  }, { unsafe: true });
		}

		setToStringTag($ArrayBuffer, ARRAY_BUFFER);
		setToStringTag($DataView, DATA_VIEW);

		arrayBuffer = {
		  ArrayBuffer: $ArrayBuffer,
		  DataView: $DataView
		};
		return arrayBuffer;
	}

	var hasRequiredEs_arrayBuffer_slice;

	function requireEs_arrayBuffer_slice () {
		if (hasRequiredEs_arrayBuffer_slice) return es_arrayBuffer_slice;
		hasRequiredEs_arrayBuffer_slice = 1;
		var $ = require_export();
		var uncurryThis = requireFunctionUncurryThisClause();
		var fails = requireFails();
		var ArrayBufferModule = requireArrayBuffer();
		var anObject = requireAnObject();
		var toAbsoluteIndex = requireToAbsoluteIndex();
		var toLength = requireToLength();

		var ArrayBuffer = ArrayBufferModule.ArrayBuffer;
		var DataView = ArrayBufferModule.DataView;
		var DataViewPrototype = DataView.prototype;
		var nativeArrayBufferSlice = uncurryThis(ArrayBuffer.prototype.slice);
		var getUint8 = uncurryThis(DataViewPrototype.getUint8);
		var setUint8 = uncurryThis(DataViewPrototype.setUint8);

		var INCORRECT_SLICE = fails(function () {
		  return !new ArrayBuffer(2).slice(1, undefined).byteLength;
		});

		// `ArrayBuffer.prototype.slice` method
		// https://tc39.es/ecma262/#sec-arraybuffer.prototype.slice
		$({ target: 'ArrayBuffer', proto: true, unsafe: true, forced: INCORRECT_SLICE }, {
		  slice: function slice(start, end) {
		    if (nativeArrayBufferSlice && end === undefined) {
		      return nativeArrayBufferSlice(anObject(this), start); // FF fix
		    }
		    var length = anObject(this).byteLength;
		    var first = toAbsoluteIndex(start, length);
		    var fin = toAbsoluteIndex(end === undefined ? length : end, length);
		    var result = new ArrayBuffer(toLength(fin - first));
		    var viewSource = new DataView(this);
		    var viewTarget = new DataView(result);
		    var index = 0;
		    while (first < fin) {
		      setUint8(viewTarget, index++, getUint8(viewSource, first++));
		    } return result;
		  }
		});
		return es_arrayBuffer_slice;
	}

	requireEs_arrayBuffer_slice();

	var es_object_assign = {};

	var objectAssign;
	var hasRequiredObjectAssign;

	function requireObjectAssign () {
		if (hasRequiredObjectAssign) return objectAssign;
		hasRequiredObjectAssign = 1;
		var DESCRIPTORS = requireDescriptors();
		var uncurryThis = requireFunctionUncurryThis();
		var call = requireFunctionCall();
		var fails = requireFails();
		var objectKeys = requireObjectKeys();
		var getOwnPropertySymbolsModule = requireObjectGetOwnPropertySymbols();
		var propertyIsEnumerableModule = requireObjectPropertyIsEnumerable();
		var toObject = requireToObject();
		var IndexedObject = requireIndexedObject();

		// eslint-disable-next-line es/no-object-assign -- safe
		var $assign = Object.assign;
		// eslint-disable-next-line es/no-object-defineproperty -- required for testing
		var defineProperty = Object.defineProperty;
		var concat = uncurryThis([].concat);

		// `Object.assign` method
		// https://tc39.es/ecma262/#sec-object.assign
		objectAssign = !$assign || fails(function () {
		  // should have correct order of operations (Edge bug)
		  if (DESCRIPTORS && $assign({ b: 1 }, $assign(defineProperty({}, 'a', {
		    enumerable: true,
		    get: function () {
		      defineProperty(this, 'b', {
		        value: 3,
		        enumerable: false
		      });
		    }
		  }), { b: 2 })).b !== 1) return true;
		  // should work with symbols and should have deterministic property order (V8 bug)
		  var A = {};
		  var B = {};
		  // eslint-disable-next-line es/no-symbol -- safe
		  var symbol = Symbol('assign detection');
		  var alphabet = 'abcdefghijklmnopqrst';
		  A[symbol] = 7;
		  // eslint-disable-next-line es/no-array-prototype-foreach -- safe
		  alphabet.split('').forEach(function (chr) { B[chr] = chr; });
		  return $assign({}, A)[symbol] !== 7 || objectKeys($assign({}, B)).join('') !== alphabet;
		}) ? function assign(target, source) { // eslint-disable-line no-unused-vars -- required for `.length`
		  var T = toObject(target);
		  var argumentsLength = arguments.length;
		  var index = 1;
		  var getOwnPropertySymbols = getOwnPropertySymbolsModule.f;
		  var propertyIsEnumerable = propertyIsEnumerableModule.f;
		  while (argumentsLength > index) {
		    var S = IndexedObject(arguments[index++]);
		    var keys = getOwnPropertySymbols ? concat(objectKeys(S), getOwnPropertySymbols(S)) : objectKeys(S);
		    var length = keys.length;
		    var j = 0;
		    var key;
		    while (length > j) {
		      key = keys[j++];
		      if (!DESCRIPTORS || call(propertyIsEnumerable, S, key)) T[key] = S[key];
		    }
		  } return T;
		} : $assign;
		return objectAssign;
	}

	var hasRequiredEs_object_assign;

	function requireEs_object_assign () {
		if (hasRequiredEs_object_assign) return es_object_assign;
		hasRequiredEs_object_assign = 1;
		var $ = require_export();
		var assign = requireObjectAssign();

		// `Object.assign` method
		// https://tc39.es/ecma262/#sec-object.assign
		// eslint-disable-next-line es/no-object-assign -- required for testing
		$({ target: 'Object', stat: true, arity: 2, forced: Object.assign !== assign }, {
		  assign: assign
		});
		return es_object_assign;
	}

	requireEs_object_assign();

	var es_object_entries = {};

	var objectToArray;
	var hasRequiredObjectToArray;

	function requireObjectToArray () {
		if (hasRequiredObjectToArray) return objectToArray;
		hasRequiredObjectToArray = 1;
		var DESCRIPTORS = requireDescriptors();
		var fails = requireFails();
		var uncurryThis = requireFunctionUncurryThis();
		var objectGetPrototypeOf = requireObjectGetPrototypeOf();
		var objectKeys = requireObjectKeys();
		var toIndexedObject = requireToIndexedObject();
		var $propertyIsEnumerable = requireObjectPropertyIsEnumerable().f;

		var propertyIsEnumerable = uncurryThis($propertyIsEnumerable);
		var push = uncurryThis([].push);

		// in some IE versions, `propertyIsEnumerable` returns incorrect result on integer keys
		// of `null` prototype objects
		var IE_BUG = DESCRIPTORS && fails(function () {
		  // eslint-disable-next-line es/no-object-create -- safe
		  var O = Object.create(null);
		  O[2] = 2;
		  return !propertyIsEnumerable(O, 2);
		});

		// `Object.{ entries, values }` methods implementation
		var createMethod = function (TO_ENTRIES) {
		  return function (it) {
		    var O = toIndexedObject(it);
		    var keys = objectKeys(O);
		    var IE_WORKAROUND = IE_BUG && objectGetPrototypeOf(O) === null;
		    var length = keys.length;
		    var i = 0;
		    var result = [];
		    var key;
		    while (length > i) {
		      key = keys[i++];
		      if (!DESCRIPTORS || (IE_WORKAROUND ? key in O : propertyIsEnumerable(O, key))) {
		        push(result, TO_ENTRIES ? [key, O[key]] : O[key]);
		      }
		    }
		    return result;
		  };
		};

		objectToArray = {
		  // `Object.entries` method
		  // https://tc39.es/ecma262/#sec-object.entries
		  entries: createMethod(true),
		  // `Object.values` method
		  // https://tc39.es/ecma262/#sec-object.values
		  values: createMethod(false)
		};
		return objectToArray;
	}

	var hasRequiredEs_object_entries;

	function requireEs_object_entries () {
		if (hasRequiredEs_object_entries) return es_object_entries;
		hasRequiredEs_object_entries = 1;
		var $ = require_export();
		var $entries = requireObjectToArray().entries;

		// `Object.entries` method
		// https://tc39.es/ecma262/#sec-object.entries
		$({ target: 'Object', stat: true }, {
		  entries: function entries(O) {
		    return $entries(O);
		  }
		});
		return es_object_entries;
	}

	requireEs_object_entries();

	var es_object_keys = {};

	var hasRequiredEs_object_keys;

	function requireEs_object_keys () {
		if (hasRequiredEs_object_keys) return es_object_keys;
		hasRequiredEs_object_keys = 1;
		var $ = require_export();
		var toObject = requireToObject();
		var nativeKeys = requireObjectKeys();
		var fails = requireFails();

		var FAILS_ON_PRIMITIVES = fails(function () { nativeKeys(1); });

		// `Object.keys` method
		// https://tc39.es/ecma262/#sec-object.keys
		$({ target: 'Object', stat: true, forced: FAILS_ON_PRIMITIVES }, {
		  keys: function keys(it) {
		    return nativeKeys(toObject(it));
		  }
		});
		return es_object_keys;
	}

	requireEs_object_keys();

	var es_promise = {};

	var es_promise_constructor = {};

	var environment;
	var hasRequiredEnvironment;

	function requireEnvironment () {
		if (hasRequiredEnvironment) return environment;
		hasRequiredEnvironment = 1;
		/* global Bun, Deno -- detection */
		var globalThis = requireGlobalThis();
		var userAgent = requireEnvironmentUserAgent();
		var classof = requireClassofRaw();

		var userAgentStartsWith = function (string) {
		  return userAgent.slice(0, string.length) === string;
		};

		environment = (function () {
		  if (userAgentStartsWith('Bun/')) return 'BUN';
		  if (userAgentStartsWith('Cloudflare-Workers')) return 'CLOUDFLARE';
		  if (userAgentStartsWith('Deno/')) return 'DENO';
		  if (userAgentStartsWith('Node.js/')) return 'NODE';
		  if (globalThis.Bun && typeof Bun.version == 'string') return 'BUN';
		  if (globalThis.Deno && typeof Deno.version == 'object') return 'DENO';
		  if (classof(globalThis.process) === 'process') return 'NODE';
		  if (globalThis.window && globalThis.document) return 'BROWSER';
		  return 'REST';
		})();
		return environment;
	}

	var environmentIsNode;
	var hasRequiredEnvironmentIsNode;

	function requireEnvironmentIsNode () {
		if (hasRequiredEnvironmentIsNode) return environmentIsNode;
		hasRequiredEnvironmentIsNode = 1;
		var ENVIRONMENT = requireEnvironment();

		environmentIsNode = ENVIRONMENT === 'NODE';
		return environmentIsNode;
	}

	var path;
	var hasRequiredPath;

	function requirePath () {
		if (hasRequiredPath) return path;
		hasRequiredPath = 1;
		var globalThis = requireGlobalThis();

		path = globalThis;
		return path;
	}

	var setSpecies;
	var hasRequiredSetSpecies;

	function requireSetSpecies () {
		if (hasRequiredSetSpecies) return setSpecies;
		hasRequiredSetSpecies = 1;
		var getBuiltIn = requireGetBuiltIn();
		var defineBuiltInAccessor = requireDefineBuiltInAccessor();
		var wellKnownSymbol = requireWellKnownSymbol();
		var DESCRIPTORS = requireDescriptors();

		var SPECIES = wellKnownSymbol('species');

		setSpecies = function (CONSTRUCTOR_NAME) {
		  var Constructor = getBuiltIn(CONSTRUCTOR_NAME);

		  if (DESCRIPTORS && Constructor && !Constructor[SPECIES]) {
		    defineBuiltInAccessor(Constructor, SPECIES, {
		      configurable: true,
		      get: function () { return this; }
		    });
		  }
		};
		return setSpecies;
	}

	var aConstructor;
	var hasRequiredAConstructor;

	function requireAConstructor () {
		if (hasRequiredAConstructor) return aConstructor;
		hasRequiredAConstructor = 1;
		var isConstructor = requireIsConstructor();
		var tryToString = requireTryToString();

		var $TypeError = TypeError;

		// `Assert: IsConstructor(argument) is true`
		aConstructor = function (argument) {
		  if (isConstructor(argument)) return argument;
		  throw new $TypeError(tryToString(argument) + ' is not a constructor');
		};
		return aConstructor;
	}

	var speciesConstructor;
	var hasRequiredSpeciesConstructor;

	function requireSpeciesConstructor () {
		if (hasRequiredSpeciesConstructor) return speciesConstructor;
		hasRequiredSpeciesConstructor = 1;
		var anObject = requireAnObject();
		var aConstructor = requireAConstructor();
		var isNullOrUndefined = requireIsNullOrUndefined();
		var wellKnownSymbol = requireWellKnownSymbol();

		var SPECIES = wellKnownSymbol('species');

		// `SpeciesConstructor` abstract operation
		// https://tc39.es/ecma262/#sec-speciesconstructor
		speciesConstructor = function (O, defaultConstructor) {
		  var C = anObject(O).constructor;
		  var S;
		  return C === undefined || isNullOrUndefined(S = anObject(C)[SPECIES]) ? defaultConstructor : aConstructor(S);
		};
		return speciesConstructor;
	}

	var functionApply;
	var hasRequiredFunctionApply;

	function requireFunctionApply () {
		if (hasRequiredFunctionApply) return functionApply;
		hasRequiredFunctionApply = 1;
		var NATIVE_BIND = requireFunctionBindNative();

		var FunctionPrototype = Function.prototype;
		var apply = FunctionPrototype.apply;
		var call = FunctionPrototype.call;

		// eslint-disable-next-line es/no-function-prototype-bind, es/no-reflect -- safe
		functionApply = typeof Reflect == 'object' && Reflect.apply || (NATIVE_BIND ? call.bind(apply) : function () {
		  return call.apply(apply, arguments);
		});
		return functionApply;
	}

	var validateArgumentsLength;
	var hasRequiredValidateArgumentsLength;

	function requireValidateArgumentsLength () {
		if (hasRequiredValidateArgumentsLength) return validateArgumentsLength;
		hasRequiredValidateArgumentsLength = 1;
		var $TypeError = TypeError;

		validateArgumentsLength = function (passed, required) {
		  if (passed < required) throw new $TypeError('Not enough arguments');
		  return passed;
		};
		return validateArgumentsLength;
	}

	var environmentIsIos;
	var hasRequiredEnvironmentIsIos;

	function requireEnvironmentIsIos () {
		if (hasRequiredEnvironmentIsIos) return environmentIsIos;
		hasRequiredEnvironmentIsIos = 1;
		var userAgent = requireEnvironmentUserAgent();

		environmentIsIos = /ipad|iphone|ipod/i.test(userAgent) && /applewebkit/i.test(userAgent);
		return environmentIsIos;
	}

	var task;
	var hasRequiredTask;

	function requireTask () {
		if (hasRequiredTask) return task;
		hasRequiredTask = 1;
		var globalThis = requireGlobalThis();
		var apply = requireFunctionApply();
		var bind = requireFunctionBindContext();
		var isCallable = requireIsCallable();
		var hasOwn = requireHasOwnProperty();
		var fails = requireFails();
		var html = requireHtml();
		var arraySlice = requireArraySlice();
		var createElement = requireDocumentCreateElement();
		var validateArgumentsLength = requireValidateArgumentsLength();
		var IS_IOS = requireEnvironmentIsIos();
		var IS_NODE = requireEnvironmentIsNode();

		var set = globalThis.setImmediate;
		var clear = globalThis.clearImmediate;
		var process = globalThis.process;
		var Dispatch = globalThis.Dispatch;
		var Function = globalThis.Function;
		var MessageChannel = globalThis.MessageChannel;
		var String = globalThis.String;
		var counter = 0;
		var queue = {};
		var ONREADYSTATECHANGE = 'onreadystatechange';
		var $location, defer, channel, port;

		fails(function () {
		  // Deno throws a ReferenceError on `location` access without `--location` flag
		  $location = globalThis.location;
		});

		var run = function (id) {
		  if (hasOwn(queue, id)) {
		    var fn = queue[id];
		    delete queue[id];
		    fn();
		  }
		};

		var runner = function (id) {
		  return function () {
		    run(id);
		  };
		};

		var eventListener = function (event) {
		  run(event.data);
		};

		var globalPostMessageDefer = function (id) {
		  // old engines have not location.origin
		  globalThis.postMessage(String(id), $location.protocol + '//' + $location.host);
		};

		// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
		if (!set || !clear) {
		  set = function setImmediate(handler) {
		    validateArgumentsLength(arguments.length, 1);
		    var fn = isCallable(handler) ? handler : Function(handler);
		    var args = arraySlice(arguments, 1);
		    queue[++counter] = function () {
		      apply(fn, undefined, args);
		    };
		    defer(counter);
		    return counter;
		  };
		  clear = function clearImmediate(id) {
		    delete queue[id];
		  };
		  // Node.js 0.8-
		  if (IS_NODE) {
		    defer = function (id) {
		      process.nextTick(runner(id));
		    };
		  // Sphere (JS game engine) Dispatch API
		  } else if (Dispatch && Dispatch.now) {
		    defer = function (id) {
		      Dispatch.now(runner(id));
		    };
		  // Browsers with MessageChannel, includes WebWorkers
		  // except iOS - https://github.com/zloirock/core-js/issues/624
		  } else if (MessageChannel && !IS_IOS) {
		    channel = new MessageChannel();
		    port = channel.port2;
		    channel.port1.onmessage = eventListener;
		    defer = bind(port.postMessage, port);
		  // Browsers with postMessage, skip WebWorkers
		  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
		  } else if (
		    globalThis.addEventListener &&
		    isCallable(globalThis.postMessage) &&
		    !globalThis.importScripts &&
		    $location && $location.protocol !== 'file:' &&
		    !fails(globalPostMessageDefer)
		  ) {
		    defer = globalPostMessageDefer;
		    globalThis.addEventListener('message', eventListener, false);
		  // IE8-
		  } else if (ONREADYSTATECHANGE in createElement('script')) {
		    defer = function (id) {
		      html.appendChild(createElement('script'))[ONREADYSTATECHANGE] = function () {
		        html.removeChild(this);
		        run(id);
		      };
		    };
		  // Rest old browsers
		  } else {
		    defer = function (id) {
		      setTimeout(runner(id), 0);
		    };
		  }
		}

		task = {
		  set: set,
		  clear: clear
		};
		return task;
	}

	var safeGetBuiltIn;
	var hasRequiredSafeGetBuiltIn;

	function requireSafeGetBuiltIn () {
		if (hasRequiredSafeGetBuiltIn) return safeGetBuiltIn;
		hasRequiredSafeGetBuiltIn = 1;
		var globalThis = requireGlobalThis();
		var DESCRIPTORS = requireDescriptors();

		// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
		var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

		// Avoid NodeJS experimental warning
		safeGetBuiltIn = function (name) {
		  if (!DESCRIPTORS) return globalThis[name];
		  var descriptor = getOwnPropertyDescriptor(globalThis, name);
		  return descriptor && descriptor.value;
		};
		return safeGetBuiltIn;
	}

	var queue;
	var hasRequiredQueue;

	function requireQueue () {
		if (hasRequiredQueue) return queue;
		hasRequiredQueue = 1;
		var Queue = function () {
		  this.head = null;
		  this.tail = null;
		};

		Queue.prototype = {
		  add: function (item) {
		    var entry = { item: item, next: null };
		    var tail = this.tail;
		    if (tail) tail.next = entry;
		    else this.head = entry;
		    this.tail = entry;
		  },
		  get: function () {
		    var entry = this.head;
		    if (entry) {
		      var next = this.head = entry.next;
		      if (next === null) this.tail = null;
		      return entry.item;
		    }
		  }
		};

		queue = Queue;
		return queue;
	}

	var environmentIsIosPebble;
	var hasRequiredEnvironmentIsIosPebble;

	function requireEnvironmentIsIosPebble () {
		if (hasRequiredEnvironmentIsIosPebble) return environmentIsIosPebble;
		hasRequiredEnvironmentIsIosPebble = 1;
		var userAgent = requireEnvironmentUserAgent();

		environmentIsIosPebble = /ipad|iphone|ipod/i.test(userAgent) && typeof Pebble != 'undefined';
		return environmentIsIosPebble;
	}

	var environmentIsWebosWebkit;
	var hasRequiredEnvironmentIsWebosWebkit;

	function requireEnvironmentIsWebosWebkit () {
		if (hasRequiredEnvironmentIsWebosWebkit) return environmentIsWebosWebkit;
		hasRequiredEnvironmentIsWebosWebkit = 1;
		var userAgent = requireEnvironmentUserAgent();

		environmentIsWebosWebkit = /web0s(?!.*chrome)/i.test(userAgent);
		return environmentIsWebosWebkit;
	}

	var microtask_1;
	var hasRequiredMicrotask;

	function requireMicrotask () {
		if (hasRequiredMicrotask) return microtask_1;
		hasRequiredMicrotask = 1;
		var globalThis = requireGlobalThis();
		var safeGetBuiltIn = requireSafeGetBuiltIn();
		var bind = requireFunctionBindContext();
		var macrotask = requireTask().set;
		var Queue = requireQueue();
		var IS_IOS = requireEnvironmentIsIos();
		var IS_IOS_PEBBLE = requireEnvironmentIsIosPebble();
		var IS_WEBOS_WEBKIT = requireEnvironmentIsWebosWebkit();
		var IS_NODE = requireEnvironmentIsNode();

		var MutationObserver = globalThis.MutationObserver || globalThis.WebKitMutationObserver;
		var document = globalThis.document;
		var process = globalThis.process;
		var Promise = globalThis.Promise;
		var microtask = safeGetBuiltIn('queueMicrotask');
		var notify, toggle, node, promise, then;

		// modern engines have queueMicrotask method
		if (!microtask) {
		  var queue = new Queue();

		  var flush = function () {
		    var parent, fn;
		    if (IS_NODE && (parent = process.domain)) parent.exit();
		    while (fn = queue.get()) try {
		      fn();
		    } catch (error) {
		      if (queue.head) notify();
		      throw error;
		    }
		    if (parent) parent.enter();
		  };

		  // browsers with MutationObserver, except iOS - https://github.com/zloirock/core-js/issues/339
		  // also except WebOS Webkit https://github.com/zloirock/core-js/issues/898
		  if (!IS_IOS && !IS_NODE && !IS_WEBOS_WEBKIT && MutationObserver && document) {
		    toggle = true;
		    node = document.createTextNode('');
		    new MutationObserver(flush).observe(node, { characterData: true });
		    notify = function () {
		      node.data = toggle = !toggle;
		    };
		  // environments with maybe non-completely correct, but existent Promise
		  } else if (!IS_IOS_PEBBLE && Promise && Promise.resolve) {
		    // Promise.resolve without an argument throws an error in LG WebOS 2
		    promise = Promise.resolve(undefined);
		    // workaround of WebKit ~ iOS Safari 10.1 bug
		    promise.constructor = Promise;
		    then = bind(promise.then, promise);
		    notify = function () {
		      then(flush);
		    };
		  // Node.js without promises
		  } else if (IS_NODE) {
		    notify = function () {
		      process.nextTick(flush);
		    };
		  // for other environments - macrotask based on:
		  // - setImmediate
		  // - MessageChannel
		  // - window.postMessage
		  // - onreadystatechange
		  // - setTimeout
		  } else {
		    // `webpack` dev server bug on IE global methods - use bind(fn, global)
		    macrotask = bind(macrotask, globalThis);
		    notify = function () {
		      macrotask(flush);
		    };
		  }

		  microtask = function (fn) {
		    if (!queue.head) notify();
		    queue.add(fn);
		  };
		}

		microtask_1 = microtask;
		return microtask_1;
	}

	var hostReportErrors;
	var hasRequiredHostReportErrors;

	function requireHostReportErrors () {
		if (hasRequiredHostReportErrors) return hostReportErrors;
		hasRequiredHostReportErrors = 1;
		hostReportErrors = function (a, b) {
		  try {
		    // eslint-disable-next-line no-console -- safe
		    arguments.length === 1 ? console.error(a) : console.error(a, b);
		  } catch (error) { /* empty */ }
		};
		return hostReportErrors;
	}

	var perform;
	var hasRequiredPerform;

	function requirePerform () {
		if (hasRequiredPerform) return perform;
		hasRequiredPerform = 1;
		perform = function (exec) {
		  try {
		    return { error: false, value: exec() };
		  } catch (error) {
		    return { error: true, value: error };
		  }
		};
		return perform;
	}

	var promiseNativeConstructor;
	var hasRequiredPromiseNativeConstructor;

	function requirePromiseNativeConstructor () {
		if (hasRequiredPromiseNativeConstructor) return promiseNativeConstructor;
		hasRequiredPromiseNativeConstructor = 1;
		var globalThis = requireGlobalThis();

		promiseNativeConstructor = globalThis.Promise;
		return promiseNativeConstructor;
	}

	var promiseConstructorDetection;
	var hasRequiredPromiseConstructorDetection;

	function requirePromiseConstructorDetection () {
		if (hasRequiredPromiseConstructorDetection) return promiseConstructorDetection;
		hasRequiredPromiseConstructorDetection = 1;
		var globalThis = requireGlobalThis();
		var NativePromiseConstructor = requirePromiseNativeConstructor();
		var isCallable = requireIsCallable();
		var isForced = requireIsForced();
		var inspectSource = requireInspectSource();
		var wellKnownSymbol = requireWellKnownSymbol();
		var ENVIRONMENT = requireEnvironment();
		var IS_PURE = requireIsPure();
		var V8_VERSION = requireEnvironmentV8Version();

		var NativePromisePrototype = NativePromiseConstructor && NativePromiseConstructor.prototype;
		var SPECIES = wellKnownSymbol('species');
		var SUBCLASSING = false;
		var NATIVE_PROMISE_REJECTION_EVENT = isCallable(globalThis.PromiseRejectionEvent);

		var FORCED_PROMISE_CONSTRUCTOR = isForced('Promise', function () {
		  var PROMISE_CONSTRUCTOR_SOURCE = inspectSource(NativePromiseConstructor);
		  var GLOBAL_CORE_JS_PROMISE = PROMISE_CONSTRUCTOR_SOURCE !== String(NativePromiseConstructor);
		  // V8 6.6 (Node 10 and Chrome 66) have a bug with resolving custom thenables
		  // https://bugs.chromium.org/p/chromium/issues/detail?id=830565
		  // We can't detect it synchronously, so just check versions
		  if (!GLOBAL_CORE_JS_PROMISE && V8_VERSION === 66) return true;
		  // We need Promise#{ catch, finally } in the pure version for preventing prototype pollution
		  if (IS_PURE && !(NativePromisePrototype['catch'] && NativePromisePrototype['finally'])) return true;
		  // We can't use @@species feature detection in V8 since it causes
		  // deoptimization and performance degradation
		  // https://github.com/zloirock/core-js/issues/679
		  if (!V8_VERSION || V8_VERSION < 51 || !/native code/.test(PROMISE_CONSTRUCTOR_SOURCE)) {
		    // Detect correctness of subclassing with @@species support
		    var promise = new NativePromiseConstructor(function (resolve) { resolve(1); });
		    var FakePromise = function (exec) {
		      exec(function () { /* empty */ }, function () { /* empty */ });
		    };
		    var constructor = promise.constructor = {};
		    constructor[SPECIES] = FakePromise;
		    SUBCLASSING = promise.then(function () { /* empty */ }) instanceof FakePromise;
		    if (!SUBCLASSING) return true;
		  // Unhandled rejections tracking support, NodeJS Promise without it fails @@species test
		  } return !GLOBAL_CORE_JS_PROMISE && (ENVIRONMENT === 'BROWSER' || ENVIRONMENT === 'DENO') && !NATIVE_PROMISE_REJECTION_EVENT;
		});

		promiseConstructorDetection = {
		  CONSTRUCTOR: FORCED_PROMISE_CONSTRUCTOR,
		  REJECTION_EVENT: NATIVE_PROMISE_REJECTION_EVENT,
		  SUBCLASSING: SUBCLASSING
		};
		return promiseConstructorDetection;
	}

	var newPromiseCapability = {};

	var hasRequiredNewPromiseCapability;

	function requireNewPromiseCapability () {
		if (hasRequiredNewPromiseCapability) return newPromiseCapability;
		hasRequiredNewPromiseCapability = 1;
		var aCallable = requireACallable();

		var $TypeError = TypeError;

		var PromiseCapability = function (C) {
		  var resolve, reject;
		  this.promise = new C(function ($$resolve, $$reject) {
		    if (resolve !== undefined || reject !== undefined) throw new $TypeError('Bad Promise constructor');
		    resolve = $$resolve;
		    reject = $$reject;
		  });
		  this.resolve = aCallable(resolve);
		  this.reject = aCallable(reject);
		};

		// `NewPromiseCapability` abstract operation
		// https://tc39.es/ecma262/#sec-newpromisecapability
		newPromiseCapability.f = function (C) {
		  return new PromiseCapability(C);
		};
		return newPromiseCapability;
	}

	var hasRequiredEs_promise_constructor;

	function requireEs_promise_constructor () {
		if (hasRequiredEs_promise_constructor) return es_promise_constructor;
		hasRequiredEs_promise_constructor = 1;
		var $ = require_export();
		var IS_PURE = requireIsPure();
		var IS_NODE = requireEnvironmentIsNode();
		var globalThis = requireGlobalThis();
		var path = requirePath();
		var call = requireFunctionCall();
		var defineBuiltIn = requireDefineBuiltIn();
		var setPrototypeOf = requireObjectSetPrototypeOf();
		var setToStringTag = requireSetToStringTag();
		var setSpecies = requireSetSpecies();
		var aCallable = requireACallable();
		var isCallable = requireIsCallable();
		var isObject = requireIsObject();
		var anInstance = requireAnInstance();
		var speciesConstructor = requireSpeciesConstructor();
		var task = requireTask().set;
		var microtask = requireMicrotask();
		var hostReportErrors = requireHostReportErrors();
		var perform = requirePerform();
		var Queue = requireQueue();
		var InternalStateModule = requireInternalState();
		var NativePromiseConstructor = requirePromiseNativeConstructor();
		var PromiseConstructorDetection = requirePromiseConstructorDetection();
		var newPromiseCapabilityModule = requireNewPromiseCapability();

		var PROMISE = 'Promise';
		var FORCED_PROMISE_CONSTRUCTOR = PromiseConstructorDetection.CONSTRUCTOR;
		var NATIVE_PROMISE_REJECTION_EVENT = PromiseConstructorDetection.REJECTION_EVENT;
		var NATIVE_PROMISE_SUBCLASSING = PromiseConstructorDetection.SUBCLASSING;
		var getInternalPromiseState = InternalStateModule.getterFor(PROMISE);
		var setInternalState = InternalStateModule.set;
		var NativePromisePrototype = NativePromiseConstructor && NativePromiseConstructor.prototype;
		var PromiseConstructor = NativePromiseConstructor;
		var PromisePrototype = NativePromisePrototype;
		var TypeError = globalThis.TypeError;
		var document = globalThis.document;
		var process = globalThis.process;
		var newPromiseCapability = newPromiseCapabilityModule.f;
		var newGenericPromiseCapability = newPromiseCapability;

		var DISPATCH_EVENT = !!(document && document.createEvent && globalThis.dispatchEvent);
		var UNHANDLED_REJECTION = 'unhandledrejection';
		var REJECTION_HANDLED = 'rejectionhandled';
		var PENDING = 0;
		var FULFILLED = 1;
		var REJECTED = 2;
		var HANDLED = 1;
		var UNHANDLED = 2;

		var Internal, OwnPromiseCapability, PromiseWrapper, nativeThen;

		// helpers
		var isThenable = function (it) {
		  var then;
		  return isObject(it) && isCallable(then = it.then) ? then : false;
		};

		var callReaction = function (reaction, state) {
		  var value = state.value;
		  var ok = state.state === FULFILLED;
		  var handler = ok ? reaction.ok : reaction.fail;
		  var resolve = reaction.resolve;
		  var reject = reaction.reject;
		  var domain = reaction.domain;
		  var result, then, exited;
		  try {
		    if (handler) {
		      if (!ok) {
		        if (state.rejection === UNHANDLED) onHandleUnhandled(state);
		        state.rejection = HANDLED;
		      }
		      if (handler === true) result = value;
		      else {
		        if (domain) domain.enter();
		        result = handler(value); // can throw
		        if (domain) {
		          domain.exit();
		          exited = true;
		        }
		      }
		      if (result === reaction.promise) {
		        reject(new TypeError('Promise-chain cycle'));
		      } else if (then = isThenable(result)) {
		        call(then, result, resolve, reject);
		      } else resolve(result);
		    } else reject(value);
		  } catch (error) {
		    if (domain && !exited) domain.exit();
		    reject(error);
		  }
		};

		var notify = function (state, isReject) {
		  if (state.notified) return;
		  state.notified = true;
		  microtask(function () {
		    var reactions = state.reactions;
		    var reaction;
		    while (reaction = reactions.get()) {
		      callReaction(reaction, state);
		    }
		    state.notified = false;
		    if (isReject && !state.rejection) onUnhandled(state);
		  });
		};

		var dispatchEvent = function (name, promise, reason) {
		  var event, handler;
		  if (DISPATCH_EVENT) {
		    event = document.createEvent('Event');
		    event.promise = promise;
		    event.reason = reason;
		    event.initEvent(name, false, true);
		    globalThis.dispatchEvent(event);
		  } else event = { promise: promise, reason: reason };
		  if (!NATIVE_PROMISE_REJECTION_EVENT && (handler = globalThis['on' + name])) handler(event);
		  else if (name === UNHANDLED_REJECTION) hostReportErrors('Unhandled promise rejection', reason);
		};

		var onUnhandled = function (state) {
		  call(task, globalThis, function () {
		    var promise = state.facade;
		    var value = state.value;
		    var IS_UNHANDLED = isUnhandled(state);
		    var result;
		    if (IS_UNHANDLED) {
		      result = perform(function () {
		        if (IS_NODE) {
		          process.emit('unhandledRejection', value, promise);
		        } else dispatchEvent(UNHANDLED_REJECTION, promise, value);
		      });
		      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
		      state.rejection = IS_NODE || isUnhandled(state) ? UNHANDLED : HANDLED;
		      if (result.error) throw result.value;
		    }
		  });
		};

		var isUnhandled = function (state) {
		  return state.rejection !== HANDLED && !state.parent;
		};

		var onHandleUnhandled = function (state) {
		  call(task, globalThis, function () {
		    var promise = state.facade;
		    if (IS_NODE) {
		      process.emit('rejectionHandled', promise);
		    } else dispatchEvent(REJECTION_HANDLED, promise, state.value);
		  });
		};

		var bind = function (fn, state, unwrap) {
		  return function (value) {
		    fn(state, value, unwrap);
		  };
		};

		var internalReject = function (state, value, unwrap) {
		  if (state.done) return;
		  state.done = true;
		  if (unwrap) state = unwrap;
		  state.value = value;
		  state.state = REJECTED;
		  notify(state, true);
		};

		var internalResolve = function (state, value, unwrap) {
		  if (state.done) return;
		  state.done = true;
		  if (unwrap) state = unwrap;
		  try {
		    if (state.facade === value) throw new TypeError("Promise can't be resolved itself");
		    var then = isThenable(value);
		    if (then) {
		      microtask(function () {
		        var wrapper = { done: false };
		        try {
		          call(then, value,
		            bind(internalResolve, wrapper, state),
		            bind(internalReject, wrapper, state)
		          );
		        } catch (error) {
		          internalReject(wrapper, error, state);
		        }
		      });
		    } else {
		      state.value = value;
		      state.state = FULFILLED;
		      notify(state, false);
		    }
		  } catch (error) {
		    internalReject({ done: false }, error, state);
		  }
		};

		// constructor polyfill
		if (FORCED_PROMISE_CONSTRUCTOR) {
		  // 25.4.3.1 Promise(executor)
		  PromiseConstructor = function Promise(executor) {
		    anInstance(this, PromisePrototype);
		    aCallable(executor);
		    call(Internal, this);
		    var state = getInternalPromiseState(this);
		    try {
		      executor(bind(internalResolve, state), bind(internalReject, state));
		    } catch (error) {
		      internalReject(state, error);
		    }
		  };

		  PromisePrototype = PromiseConstructor.prototype;

		  // eslint-disable-next-line no-unused-vars -- required for `.length`
		  Internal = function Promise(executor) {
		    setInternalState(this, {
		      type: PROMISE,
		      done: false,
		      notified: false,
		      parent: false,
		      reactions: new Queue(),
		      rejection: false,
		      state: PENDING,
		      value: null
		    });
		  };

		  // `Promise.prototype.then` method
		  // https://tc39.es/ecma262/#sec-promise.prototype.then
		  Internal.prototype = defineBuiltIn(PromisePrototype, 'then', function then(onFulfilled, onRejected) {
		    var state = getInternalPromiseState(this);
		    var reaction = newPromiseCapability(speciesConstructor(this, PromiseConstructor));
		    state.parent = true;
		    reaction.ok = isCallable(onFulfilled) ? onFulfilled : true;
		    reaction.fail = isCallable(onRejected) && onRejected;
		    reaction.domain = IS_NODE ? process.domain : undefined;
		    if (state.state === PENDING) state.reactions.add(reaction);
		    else microtask(function () {
		      callReaction(reaction, state);
		    });
		    return reaction.promise;
		  });

		  OwnPromiseCapability = function () {
		    var promise = new Internal();
		    var state = getInternalPromiseState(promise);
		    this.promise = promise;
		    this.resolve = bind(internalResolve, state);
		    this.reject = bind(internalReject, state);
		  };

		  newPromiseCapabilityModule.f = newPromiseCapability = function (C) {
		    return C === PromiseConstructor || C === PromiseWrapper
		      ? new OwnPromiseCapability(C)
		      : newGenericPromiseCapability(C);
		  };

		  if (!IS_PURE && isCallable(NativePromiseConstructor) && NativePromisePrototype !== Object.prototype) {
		    nativeThen = NativePromisePrototype.then;

		    if (!NATIVE_PROMISE_SUBCLASSING) {
		      // make `Promise#then` return a polyfilled `Promise` for native promise-based APIs
		      defineBuiltIn(NativePromisePrototype, 'then', function then(onFulfilled, onRejected) {
		        var that = this;
		        return new PromiseConstructor(function (resolve, reject) {
		          call(nativeThen, that, resolve, reject);
		        }).then(onFulfilled, onRejected);
		      // https://github.com/zloirock/core-js/issues/640
		      }, { unsafe: true });
		    }

		    // make `.constructor === Promise` work for native promise-based APIs
		    try {
		      delete NativePromisePrototype.constructor;
		    } catch (error) { /* empty */ }

		    // make `instanceof Promise` work for native promise-based APIs
		    if (setPrototypeOf) {
		      setPrototypeOf(NativePromisePrototype, PromisePrototype);
		    }
		  }
		}

		// `Promise` constructor
		// https://tc39.es/ecma262/#sec-promise-executor
		$({ global: true, constructor: true, wrap: true, forced: FORCED_PROMISE_CONSTRUCTOR }, {
		  Promise: PromiseConstructor
		});

		PromiseWrapper = path.Promise;

		setToStringTag(PromiseConstructor, PROMISE, false, true);
		setSpecies(PROMISE);
		return es_promise_constructor;
	}

	var es_promise_all = {};

	var iterate;
	var hasRequiredIterate;

	function requireIterate () {
		if (hasRequiredIterate) return iterate;
		hasRequiredIterate = 1;
		var bind = requireFunctionBindContext();
		var call = requireFunctionCall();
		var anObject = requireAnObject();
		var tryToString = requireTryToString();
		var isArrayIteratorMethod = requireIsArrayIteratorMethod();
		var lengthOfArrayLike = requireLengthOfArrayLike();
		var isPrototypeOf = requireObjectIsPrototypeOf();
		var getIterator = requireGetIterator();
		var getIteratorMethod = requireGetIteratorMethod();
		var iteratorClose = requireIteratorClose();

		var $TypeError = TypeError;

		var Result = function (stopped, result) {
		  this.stopped = stopped;
		  this.result = result;
		};

		var ResultPrototype = Result.prototype;

		iterate = function (iterable, unboundFunction, options) {
		  var that = options && options.that;
		  var AS_ENTRIES = !!(options && options.AS_ENTRIES);
		  var IS_RECORD = !!(options && options.IS_RECORD);
		  var IS_ITERATOR = !!(options && options.IS_ITERATOR);
		  var INTERRUPTED = !!(options && options.INTERRUPTED);
		  var fn = bind(unboundFunction, that);
		  var iterator, iterFn, index, length, result, next, step;

		  var stop = function (condition) {
		    var $iterator = iterator;
		    iterator = undefined;
		    if ($iterator) iteratorClose($iterator, 'normal');
		    return new Result(true, condition);
		  };

		  var callFn = function (value) {
		    if (AS_ENTRIES) {
		      anObject(value);
		      return INTERRUPTED ? fn(value[0], value[1], stop) : fn(value[0], value[1]);
		    } return INTERRUPTED ? fn(value, stop) : fn(value);
		  };

		  if (IS_RECORD) {
		    iterator = iterable.iterator;
		  } else if (IS_ITERATOR) {
		    iterator = iterable;
		  } else {
		    iterFn = getIteratorMethod(iterable);
		    if (!iterFn) throw new $TypeError(tryToString(iterable) + ' is not iterable');
		    // optimisation for array iterators
		    if (isArrayIteratorMethod(iterFn)) {
		      for (index = 0, length = lengthOfArrayLike(iterable); length > index; index++) {
		        result = callFn(iterable[index]);
		        if (result && isPrototypeOf(ResultPrototype, result)) return result;
		      } return new Result(false);
		    }
		    iterator = getIterator(iterable, iterFn);
		  }

		  next = IS_RECORD ? iterable.next : iterator.next;
		  while (!(step = call(next, iterator)).done) {
		    // `IteratorValue` errors should propagate without closing the iterator
		    var value = step.value;
		    try {
		      result = callFn(value);
		    } catch (error) {
		      if (iterator) iteratorClose(iterator, 'throw', error);
		      else throw error;
		    }
		    if (typeof result == 'object' && result && isPrototypeOf(ResultPrototype, result)) return result;
		  } return new Result(false);
		};
		return iterate;
	}

	var promiseStaticsIncorrectIteration;
	var hasRequiredPromiseStaticsIncorrectIteration;

	function requirePromiseStaticsIncorrectIteration () {
		if (hasRequiredPromiseStaticsIncorrectIteration) return promiseStaticsIncorrectIteration;
		hasRequiredPromiseStaticsIncorrectIteration = 1;
		var NativePromiseConstructor = requirePromiseNativeConstructor();
		var checkCorrectnessOfIteration = requireCheckCorrectnessOfIteration();
		var FORCED_PROMISE_CONSTRUCTOR = requirePromiseConstructorDetection().CONSTRUCTOR;

		promiseStaticsIncorrectIteration = FORCED_PROMISE_CONSTRUCTOR || !checkCorrectnessOfIteration(function (iterable) {
		  NativePromiseConstructor.all(iterable).then(undefined, function () { /* empty */ });
		});
		return promiseStaticsIncorrectIteration;
	}

	var hasRequiredEs_promise_all;

	function requireEs_promise_all () {
		if (hasRequiredEs_promise_all) return es_promise_all;
		hasRequiredEs_promise_all = 1;
		var $ = require_export();
		var call = requireFunctionCall();
		var aCallable = requireACallable();
		var newPromiseCapabilityModule = requireNewPromiseCapability();
		var perform = requirePerform();
		var iterate = requireIterate();
		var PROMISE_STATICS_INCORRECT_ITERATION = requirePromiseStaticsIncorrectIteration();

		// `Promise.all` method
		// https://tc39.es/ecma262/#sec-promise.all
		$({ target: 'Promise', stat: true, forced: PROMISE_STATICS_INCORRECT_ITERATION }, {
		  all: function all(iterable) {
		    var C = this;
		    var capability = newPromiseCapabilityModule.f(C);
		    var resolve = capability.resolve;
		    var reject = capability.reject;
		    var result = perform(function () {
		      var $promiseResolve = aCallable(C.resolve);
		      var values = [];
		      var counter = 0;
		      var remaining = 1;
		      iterate(iterable, function (promise) {
		        var index = counter++;
		        var alreadyCalled = false;
		        remaining++;
		        call($promiseResolve, C, promise).then(function (value) {
		          if (alreadyCalled) return;
		          alreadyCalled = true;
		          values[index] = value;
		          --remaining || resolve(values);
		        }, reject);
		      });
		      --remaining || resolve(values);
		    });
		    if (result.error) reject(result.value);
		    return capability.promise;
		  }
		});
		return es_promise_all;
	}

	var es_promise_catch = {};

	var hasRequiredEs_promise_catch;

	function requireEs_promise_catch () {
		if (hasRequiredEs_promise_catch) return es_promise_catch;
		hasRequiredEs_promise_catch = 1;
		var $ = require_export();
		var IS_PURE = requireIsPure();
		var FORCED_PROMISE_CONSTRUCTOR = requirePromiseConstructorDetection().CONSTRUCTOR;
		var NativePromiseConstructor = requirePromiseNativeConstructor();
		var getBuiltIn = requireGetBuiltIn();
		var isCallable = requireIsCallable();
		var defineBuiltIn = requireDefineBuiltIn();

		var NativePromisePrototype = NativePromiseConstructor && NativePromiseConstructor.prototype;

		// `Promise.prototype.catch` method
		// https://tc39.es/ecma262/#sec-promise.prototype.catch
		$({ target: 'Promise', proto: true, forced: FORCED_PROMISE_CONSTRUCTOR, real: true }, {
		  'catch': function (onRejected) {
		    return this.then(undefined, onRejected);
		  }
		});

		// makes sure that native promise-based APIs `Promise#catch` properly works with patched `Promise#then`
		if (!IS_PURE && isCallable(NativePromiseConstructor)) {
		  var method = getBuiltIn('Promise').prototype['catch'];
		  if (NativePromisePrototype['catch'] !== method) {
		    defineBuiltIn(NativePromisePrototype, 'catch', method, { unsafe: true });
		  }
		}
		return es_promise_catch;
	}

	var es_promise_race = {};

	var hasRequiredEs_promise_race;

	function requireEs_promise_race () {
		if (hasRequiredEs_promise_race) return es_promise_race;
		hasRequiredEs_promise_race = 1;
		var $ = require_export();
		var call = requireFunctionCall();
		var aCallable = requireACallable();
		var newPromiseCapabilityModule = requireNewPromiseCapability();
		var perform = requirePerform();
		var iterate = requireIterate();
		var PROMISE_STATICS_INCORRECT_ITERATION = requirePromiseStaticsIncorrectIteration();

		// `Promise.race` method
		// https://tc39.es/ecma262/#sec-promise.race
		$({ target: 'Promise', stat: true, forced: PROMISE_STATICS_INCORRECT_ITERATION }, {
		  race: function race(iterable) {
		    var C = this;
		    var capability = newPromiseCapabilityModule.f(C);
		    var reject = capability.reject;
		    var result = perform(function () {
		      var $promiseResolve = aCallable(C.resolve);
		      iterate(iterable, function (promise) {
		        call($promiseResolve, C, promise).then(capability.resolve, reject);
		      });
		    });
		    if (result.error) reject(result.value);
		    return capability.promise;
		  }
		});
		return es_promise_race;
	}

	var es_promise_reject = {};

	var hasRequiredEs_promise_reject;

	function requireEs_promise_reject () {
		if (hasRequiredEs_promise_reject) return es_promise_reject;
		hasRequiredEs_promise_reject = 1;
		var $ = require_export();
		var newPromiseCapabilityModule = requireNewPromiseCapability();
		var FORCED_PROMISE_CONSTRUCTOR = requirePromiseConstructorDetection().CONSTRUCTOR;

		// `Promise.reject` method
		// https://tc39.es/ecma262/#sec-promise.reject
		$({ target: 'Promise', stat: true, forced: FORCED_PROMISE_CONSTRUCTOR }, {
		  reject: function reject(r) {
		    var capability = newPromiseCapabilityModule.f(this);
		    var capabilityReject = capability.reject;
		    capabilityReject(r);
		    return capability.promise;
		  }
		});
		return es_promise_reject;
	}

	var es_promise_resolve = {};

	var promiseResolve;
	var hasRequiredPromiseResolve;

	function requirePromiseResolve () {
		if (hasRequiredPromiseResolve) return promiseResolve;
		hasRequiredPromiseResolve = 1;
		var anObject = requireAnObject();
		var isObject = requireIsObject();
		var newPromiseCapability = requireNewPromiseCapability();

		promiseResolve = function (C, x) {
		  anObject(C);
		  if (isObject(x) && x.constructor === C) return x;
		  var promiseCapability = newPromiseCapability.f(C);
		  var resolve = promiseCapability.resolve;
		  resolve(x);
		  return promiseCapability.promise;
		};
		return promiseResolve;
	}

	var hasRequiredEs_promise_resolve;

	function requireEs_promise_resolve () {
		if (hasRequiredEs_promise_resolve) return es_promise_resolve;
		hasRequiredEs_promise_resolve = 1;
		var $ = require_export();
		var getBuiltIn = requireGetBuiltIn();
		var IS_PURE = requireIsPure();
		var NativePromiseConstructor = requirePromiseNativeConstructor();
		var FORCED_PROMISE_CONSTRUCTOR = requirePromiseConstructorDetection().CONSTRUCTOR;
		var promiseResolve = requirePromiseResolve();

		var PromiseConstructorWrapper = getBuiltIn('Promise');
		var CHECK_WRAPPER = IS_PURE && !FORCED_PROMISE_CONSTRUCTOR;

		// `Promise.resolve` method
		// https://tc39.es/ecma262/#sec-promise.resolve
		$({ target: 'Promise', stat: true, forced: IS_PURE || FORCED_PROMISE_CONSTRUCTOR }, {
		  resolve: function resolve(x) {
		    return promiseResolve(CHECK_WRAPPER && this === PromiseConstructorWrapper ? NativePromiseConstructor : this, x);
		  }
		});
		return es_promise_resolve;
	}

	var hasRequiredEs_promise;

	function requireEs_promise () {
		if (hasRequiredEs_promise) return es_promise;
		hasRequiredEs_promise = 1;
		// TODO: Remove this module from `core-js@4` since it's split to modules listed below
		requireEs_promise_constructor();
		requireEs_promise_all();
		requireEs_promise_catch();
		requireEs_promise_race();
		requireEs_promise_reject();
		requireEs_promise_resolve();
		return es_promise;
	}

	requireEs_promise();

	var es_regexp_exec = {};

	var regexpFlags;
	var hasRequiredRegexpFlags;

	function requireRegexpFlags () {
		if (hasRequiredRegexpFlags) return regexpFlags;
		hasRequiredRegexpFlags = 1;
		var anObject = requireAnObject();

		// `RegExp.prototype.flags` getter implementation
		// https://tc39.es/ecma262/#sec-get-regexp.prototype.flags
		regexpFlags = function () {
		  var that = anObject(this);
		  var result = '';
		  if (that.hasIndices) result += 'd';
		  if (that.global) result += 'g';
		  if (that.ignoreCase) result += 'i';
		  if (that.multiline) result += 'm';
		  if (that.dotAll) result += 's';
		  if (that.unicode) result += 'u';
		  if (that.unicodeSets) result += 'v';
		  if (that.sticky) result += 'y';
		  return result;
		};
		return regexpFlags;
	}

	var regexpStickyHelpers;
	var hasRequiredRegexpStickyHelpers;

	function requireRegexpStickyHelpers () {
		if (hasRequiredRegexpStickyHelpers) return regexpStickyHelpers;
		hasRequiredRegexpStickyHelpers = 1;
		var fails = requireFails();
		var globalThis = requireGlobalThis();

		// babel-minify and Closure Compiler transpiles RegExp('a', 'y') -> /a/y and it causes SyntaxError
		var $RegExp = globalThis.RegExp;

		var UNSUPPORTED_Y = fails(function () {
		  var re = $RegExp('a', 'y');
		  re.lastIndex = 2;
		  return re.exec('abcd') !== null;
		});

		// UC Browser bug
		// https://github.com/zloirock/core-js/issues/1008
		var MISSED_STICKY = UNSUPPORTED_Y || fails(function () {
		  return !$RegExp('a', 'y').sticky;
		});

		var BROKEN_CARET = UNSUPPORTED_Y || fails(function () {
		  // https://bugzilla.mozilla.org/show_bug.cgi?id=773687
		  var re = $RegExp('^r', 'gy');
		  re.lastIndex = 2;
		  return re.exec('str') !== null;
		});

		regexpStickyHelpers = {
		  BROKEN_CARET: BROKEN_CARET,
		  MISSED_STICKY: MISSED_STICKY,
		  UNSUPPORTED_Y: UNSUPPORTED_Y
		};
		return regexpStickyHelpers;
	}

	var regexpUnsupportedDotAll;
	var hasRequiredRegexpUnsupportedDotAll;

	function requireRegexpUnsupportedDotAll () {
		if (hasRequiredRegexpUnsupportedDotAll) return regexpUnsupportedDotAll;
		hasRequiredRegexpUnsupportedDotAll = 1;
		var fails = requireFails();
		var globalThis = requireGlobalThis();

		// babel-minify and Closure Compiler transpiles RegExp('.', 's') -> /./s and it causes SyntaxError
		var $RegExp = globalThis.RegExp;

		regexpUnsupportedDotAll = fails(function () {
		  var re = $RegExp('.', 's');
		  return !(re.dotAll && re.test('\n') && re.flags === 's');
		});
		return regexpUnsupportedDotAll;
	}

	var regexpUnsupportedNcg;
	var hasRequiredRegexpUnsupportedNcg;

	function requireRegexpUnsupportedNcg () {
		if (hasRequiredRegexpUnsupportedNcg) return regexpUnsupportedNcg;
		hasRequiredRegexpUnsupportedNcg = 1;
		var fails = requireFails();
		var globalThis = requireGlobalThis();

		// babel-minify and Closure Compiler transpiles RegExp('(?<a>b)', 'g') -> /(?<a>b)/g and it causes SyntaxError
		var $RegExp = globalThis.RegExp;

		regexpUnsupportedNcg = fails(function () {
		  var re = $RegExp('(?<a>b)', 'g');
		  return re.exec('b').groups.a !== 'b' ||
		    'b'.replace(re, '$<a>c') !== 'bc';
		});
		return regexpUnsupportedNcg;
	}

	var regexpExec;
	var hasRequiredRegexpExec;

	function requireRegexpExec () {
		if (hasRequiredRegexpExec) return regexpExec;
		hasRequiredRegexpExec = 1;
		/* eslint-disable regexp/no-empty-capturing-group, regexp/no-empty-group, regexp/no-lazy-ends -- testing */
		/* eslint-disable regexp/no-useless-quantifier -- testing */
		var call = requireFunctionCall();
		var uncurryThis = requireFunctionUncurryThis();
		var toString = requireToString();
		var regexpFlags = requireRegexpFlags();
		var stickyHelpers = requireRegexpStickyHelpers();
		var shared = requireShared();
		var create = requireObjectCreate();
		var getInternalState = requireInternalState().get;
		var UNSUPPORTED_DOT_ALL = requireRegexpUnsupportedDotAll();
		var UNSUPPORTED_NCG = requireRegexpUnsupportedNcg();

		var nativeReplace = shared('native-string-replace', String.prototype.replace);
		var nativeExec = RegExp.prototype.exec;
		var patchedExec = nativeExec;
		var charAt = uncurryThis(''.charAt);
		var indexOf = uncurryThis(''.indexOf);
		var replace = uncurryThis(''.replace);
		var stringSlice = uncurryThis(''.slice);

		var UPDATES_LAST_INDEX_WRONG = (function () {
		  var re1 = /a/;
		  var re2 = /b*/g;
		  call(nativeExec, re1, 'a');
		  call(nativeExec, re2, 'a');
		  return re1.lastIndex !== 0 || re2.lastIndex !== 0;
		})();

		var UNSUPPORTED_Y = stickyHelpers.BROKEN_CARET;

		// nonparticipating capturing group, copied from es5-shim's String#split patch.
		var NPCG_INCLUDED = /()??/.exec('')[1] !== undefined;

		var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED || UNSUPPORTED_Y || UNSUPPORTED_DOT_ALL || UNSUPPORTED_NCG;

		var setGroups = function (re, groups) {
		  var object = re.groups = create(null);
		  for (var i = 0; i < groups.length; i++) {
		    var group = groups[i];
		    object[group[0]] = re[group[1]];
		  }
		};

		if (PATCH) {
		  patchedExec = function exec(string) {
		    var re = this;
		    var state = getInternalState(re);
		    var str = toString(string);
		    var raw = state.raw;
		    var result, reCopy, lastIndex;

		    if (raw) {
		      raw.lastIndex = re.lastIndex;
		      result = call(patchedExec, raw, str);
		      re.lastIndex = raw.lastIndex;

		      if (result && state.groups) setGroups(result, state.groups);

		      return result;
		    }

		    var groups = state.groups;
		    var sticky = UNSUPPORTED_Y && re.sticky;
		    var flags = call(regexpFlags, re);
		    var source = re.source;
		    var charsAdded = 0;
		    var strCopy = str;

		    if (sticky) {
		      flags = replace(flags, 'y', '');
		      if (indexOf(flags, 'g') === -1) {
		        flags += 'g';
		      }

		      strCopy = stringSlice(str, re.lastIndex);
		      // Support anchored sticky behavior.
		      var prevChar = re.lastIndex > 0 && charAt(str, re.lastIndex - 1);
		      if (re.lastIndex > 0 &&
		        (!re.multiline || re.multiline && prevChar !== '\n' && prevChar !== '\r' && prevChar !== '\u2028' && prevChar !== '\u2029')) {
		        source = '(?: (?:' + source + '))';
		        strCopy = ' ' + strCopy;
		        charsAdded++;
		      }
		      // ^(? + rx + ) is needed, in combination with some str slicing, to
		      // simulate the 'y' flag.
		      reCopy = new RegExp('^(?:' + source + ')', flags);
		    }

		    if (NPCG_INCLUDED) {
		      reCopy = new RegExp('^' + source + '$(?!\\s)', flags);
		    }
		    if (UPDATES_LAST_INDEX_WRONG) lastIndex = re.lastIndex;

		    var match = call(nativeExec, sticky ? reCopy : re, strCopy);

		    if (sticky) {
		      if (match) {
		        match.input = str;
		        match[0] = stringSlice(match[0], charsAdded);
		        match.index = re.lastIndex;
		        re.lastIndex += match[0].length;
		      } else re.lastIndex = 0;
		    } else if (UPDATES_LAST_INDEX_WRONG && match) {
		      re.lastIndex = re.global ? match.index + match[0].length : lastIndex;
		    }
		    if (NPCG_INCLUDED && match && match.length > 1) {
		      // Fix browsers whose `exec` methods don't consistently return `undefined`
		      // for NPCG, like IE8. NOTE: This doesn't work for /(.?)?/
		      call(nativeReplace, match[0], reCopy, function () {
		        for (var i = 1; i < arguments.length - 2; i++) {
		          if (arguments[i] === undefined) match[i] = undefined;
		        }
		      });
		    }

		    if (match && groups) setGroups(match, groups);

		    return match;
		  };
		}

		regexpExec = patchedExec;
		return regexpExec;
	}

	var hasRequiredEs_regexp_exec;

	function requireEs_regexp_exec () {
		if (hasRequiredEs_regexp_exec) return es_regexp_exec;
		hasRequiredEs_regexp_exec = 1;
		var $ = require_export();
		var exec = requireRegexpExec();

		// `RegExp.prototype.exec` method
		// https://tc39.es/ecma262/#sec-regexp.prototype.exec
		$({ target: 'RegExp', proto: true, forced: /./.exec !== exec }, {
		  exec: exec
		});
		return es_regexp_exec;
	}

	requireEs_regexp_exec();

	var es_regexp_toString = {};

	var regexpFlagsDetection;
	var hasRequiredRegexpFlagsDetection;

	function requireRegexpFlagsDetection () {
		if (hasRequiredRegexpFlagsDetection) return regexpFlagsDetection;
		hasRequiredRegexpFlagsDetection = 1;
		var globalThis = requireGlobalThis();
		var fails = requireFails();

		// babel-minify and Closure Compiler transpiles RegExp('.', 'd') -> /./d and it causes SyntaxError
		var RegExp = globalThis.RegExp;

		var FLAGS_GETTER_IS_CORRECT = !fails(function () {
		  var INDICES_SUPPORT = true;
		  try {
		    RegExp('.', 'd');
		  } catch (error) {
		    INDICES_SUPPORT = false;
		  }

		  var O = {};
		  // modern V8 bug
		  var calls = '';
		  var expected = INDICES_SUPPORT ? 'dgimsy' : 'gimsy';

		  var addGetter = function (key, chr) {
		    // eslint-disable-next-line es/no-object-defineproperty -- safe
		    Object.defineProperty(O, key, { get: function () {
		      calls += chr;
		      return true;
		    } });
		  };

		  var pairs = {
		    dotAll: 's',
		    global: 'g',
		    ignoreCase: 'i',
		    multiline: 'm',
		    sticky: 'y'
		  };

		  if (INDICES_SUPPORT) pairs.hasIndices = 'd';

		  for (var key in pairs) addGetter(key, pairs[key]);

		  // eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
		  var result = Object.getOwnPropertyDescriptor(RegExp.prototype, 'flags').get.call(O);

		  return result !== expected || calls !== expected;
		});

		regexpFlagsDetection = { correct: FLAGS_GETTER_IS_CORRECT };
		return regexpFlagsDetection;
	}

	var regexpGetFlags;
	var hasRequiredRegexpGetFlags;

	function requireRegexpGetFlags () {
		if (hasRequiredRegexpGetFlags) return regexpGetFlags;
		hasRequiredRegexpGetFlags = 1;
		var call = requireFunctionCall();
		var hasOwn = requireHasOwnProperty();
		var isPrototypeOf = requireObjectIsPrototypeOf();
		var regExpFlagsDetection = requireRegexpFlagsDetection();
		var regExpFlagsGetterImplementation = requireRegexpFlags();

		var RegExpPrototype = RegExp.prototype;

		regexpGetFlags = regExpFlagsDetection.correct ? function (it) {
		  return it.flags;
		} : function (it) {
		  return (!regExpFlagsDetection.correct && isPrototypeOf(RegExpPrototype, it) && !hasOwn(it, 'flags'))
		    ? call(regExpFlagsGetterImplementation, it)
		    : it.flags;
		};
		return regexpGetFlags;
	}

	var hasRequiredEs_regexp_toString;

	function requireEs_regexp_toString () {
		if (hasRequiredEs_regexp_toString) return es_regexp_toString;
		hasRequiredEs_regexp_toString = 1;
		var PROPER_FUNCTION_NAME = requireFunctionName().PROPER;
		var defineBuiltIn = requireDefineBuiltIn();
		var anObject = requireAnObject();
		var $toString = requireToString();
		var fails = requireFails();
		var getRegExpFlags = requireRegexpGetFlags();

		var TO_STRING = 'toString';
		var RegExpPrototype = RegExp.prototype;
		var nativeToString = RegExpPrototype[TO_STRING];

		var NOT_GENERIC = fails(function () { return nativeToString.call({ source: 'a', flags: 'b' }) !== '/a/b'; });
		// FF44- RegExp#toString has a wrong name
		var INCORRECT_NAME = PROPER_FUNCTION_NAME && nativeToString.name !== TO_STRING;

		// `RegExp.prototype.toString` method
		// https://tc39.es/ecma262/#sec-regexp.prototype.tostring
		if (NOT_GENERIC || INCORRECT_NAME) {
		  defineBuiltIn(RegExpPrototype, TO_STRING, function toString() {
		    var R = anObject(this);
		    var pattern = $toString(R.source);
		    var flags = $toString(getRegExpFlags(R));
		    return '/' + pattern + '/' + flags;
		  }, { unsafe: true });
		}
		return es_regexp_toString;
	}

	requireEs_regexp_toString();

	var es_string_iterator = {};

	var stringMultibyte;
	var hasRequiredStringMultibyte;

	function requireStringMultibyte () {
		if (hasRequiredStringMultibyte) return stringMultibyte;
		hasRequiredStringMultibyte = 1;
		var uncurryThis = requireFunctionUncurryThis();
		var toIntegerOrInfinity = requireToIntegerOrInfinity();
		var toString = requireToString();
		var requireObjectCoercible = requireRequireObjectCoercible();

		var charAt = uncurryThis(''.charAt);
		var charCodeAt = uncurryThis(''.charCodeAt);
		var stringSlice = uncurryThis(''.slice);

		var createMethod = function (CONVERT_TO_STRING) {
		  return function ($this, pos) {
		    var S = toString(requireObjectCoercible($this));
		    var position = toIntegerOrInfinity(pos);
		    var size = S.length;
		    var first, second;
		    if (position < 0 || position >= size) return CONVERT_TO_STRING ? '' : undefined;
		    first = charCodeAt(S, position);
		    return first < 0xD800 || first > 0xDBFF || position + 1 === size
		      || (second = charCodeAt(S, position + 1)) < 0xDC00 || second > 0xDFFF
		        ? CONVERT_TO_STRING
		          ? charAt(S, position)
		          : first
		        : CONVERT_TO_STRING
		          ? stringSlice(S, position, position + 2)
		          : (first - 0xD800 << 10) + (second - 0xDC00) + 0x10000;
		  };
		};

		stringMultibyte = {
		  // `String.prototype.codePointAt` method
		  // https://tc39.es/ecma262/#sec-string.prototype.codepointat
		  codeAt: createMethod(false),
		  // `String.prototype.at` method
		  // https://github.com/mathiasbynens/String.prototype.at
		  charAt: createMethod(true)
		};
		return stringMultibyte;
	}

	var hasRequiredEs_string_iterator;

	function requireEs_string_iterator () {
		if (hasRequiredEs_string_iterator) return es_string_iterator;
		hasRequiredEs_string_iterator = 1;
		var charAt = requireStringMultibyte().charAt;
		var toString = requireToString();
		var InternalStateModule = requireInternalState();
		var defineIterator = requireIteratorDefine();
		var createIterResultObject = requireCreateIterResultObject();

		var STRING_ITERATOR = 'String Iterator';
		var setInternalState = InternalStateModule.set;
		var getInternalState = InternalStateModule.getterFor(STRING_ITERATOR);

		// `String.prototype[@@iterator]` method
		// https://tc39.es/ecma262/#sec-string.prototype-@@iterator
		defineIterator(String, 'String', function (iterated) {
		  setInternalState(this, {
		    type: STRING_ITERATOR,
		    string: toString(iterated),
		    index: 0
		  });
		// `%StringIteratorPrototype%.next` method
		// https://tc39.es/ecma262/#sec-%stringiteratorprototype%.next
		}, function next() {
		  var state = getInternalState(this);
		  var string = state.string;
		  var index = state.index;
		  var point;
		  if (index >= string.length) return createIterResultObject(undefined, true);
		  point = charAt(string, index);
		  state.index += point.length;
		  return createIterResultObject(point, false);
		});
		return es_string_iterator;
	}

	requireEs_string_iterator();

	var es_string_padStart = {};

	var stringRepeat;
	var hasRequiredStringRepeat;

	function requireStringRepeat () {
		if (hasRequiredStringRepeat) return stringRepeat;
		hasRequiredStringRepeat = 1;
		var toIntegerOrInfinity = requireToIntegerOrInfinity();
		var toString = requireToString();
		var requireObjectCoercible = requireRequireObjectCoercible();

		var $RangeError = RangeError;
		var floor = Math.floor;

		// `String.prototype.repeat` method implementation
		// https://tc39.es/ecma262/#sec-string.prototype.repeat
		stringRepeat = function repeat(count) {
		  var str = toString(requireObjectCoercible(this));
		  var result = '';
		  var n = toIntegerOrInfinity(count);
		  if (n < 0 || n === Infinity) throw new $RangeError('Wrong number of repetitions');
		  for (;n > 0; (n = floor(n / 2)) && (str += str)) if (n % 2) result += str;
		  return result;
		};
		return stringRepeat;
	}

	var stringPad;
	var hasRequiredStringPad;

	function requireStringPad () {
		if (hasRequiredStringPad) return stringPad;
		hasRequiredStringPad = 1;
		var uncurryThis = requireFunctionUncurryThis();
		var toLength = requireToLength();
		var toString = requireToString();
		var $repeat = requireStringRepeat();
		var requireObjectCoercible = requireRequireObjectCoercible();

		var repeat = uncurryThis($repeat);
		var stringSlice = uncurryThis(''.slice);
		var ceil = Math.ceil;

		// `String.prototype.{ padStart, padEnd }` methods implementation
		var createMethod = function (IS_END) {
		  return function ($this, maxLength, fillString) {
		    var S = toString(requireObjectCoercible($this));
		    var intMaxLength = toLength(maxLength);
		    var stringLength = S.length;
		    if (intMaxLength <= stringLength) return S;
		    var fillStr = fillString === undefined ? ' ' : toString(fillString);
		    var fillLen, stringFiller;
		    if (fillStr === '') return S;
		    fillLen = intMaxLength - stringLength;
		    stringFiller = repeat(fillStr, ceil(fillLen / fillStr.length));
		    if (stringFiller.length > fillLen) stringFiller = stringSlice(stringFiller, 0, fillLen);
		    return IS_END ? S + stringFiller : stringFiller + S;
		  };
		};

		stringPad = {
		  // `String.prototype.padStart` method
		  // https://tc39.es/ecma262/#sec-string.prototype.padstart
		  start: createMethod(false),
		  // `String.prototype.padEnd` method
		  // https://tc39.es/ecma262/#sec-string.prototype.padend
		  end: createMethod(true)
		};
		return stringPad;
	}

	var stringPadWebkitBug;
	var hasRequiredStringPadWebkitBug;

	function requireStringPadWebkitBug () {
		if (hasRequiredStringPadWebkitBug) return stringPadWebkitBug;
		hasRequiredStringPadWebkitBug = 1;
		// https://github.com/zloirock/core-js/issues/280
		var userAgent = requireEnvironmentUserAgent();

		stringPadWebkitBug = /Version\/10(?:\.\d+){1,2}(?: [\w./]+)?(?: Mobile\/\w+)? Safari\//.test(userAgent);
		return stringPadWebkitBug;
	}

	var hasRequiredEs_string_padStart;

	function requireEs_string_padStart () {
		if (hasRequiredEs_string_padStart) return es_string_padStart;
		hasRequiredEs_string_padStart = 1;
		var $ = require_export();
		var $padStart = requireStringPad().start;
		var WEBKIT_BUG = requireStringPadWebkitBug();

		// `String.prototype.padStart` method
		// https://tc39.es/ecma262/#sec-string.prototype.padstart
		$({ target: 'String', proto: true, forced: WEBKIT_BUG }, {
		  padStart: function padStart(maxLength /* , fillString = ' ' */) {
		    return $padStart(this, maxLength, arguments.length > 1 ? arguments[1] : undefined);
		  }
		});
		return es_string_padStart;
	}

	requireEs_string_padStart();

	var es_string_replace = {};

	var fixRegexpWellKnownSymbolLogic;
	var hasRequiredFixRegexpWellKnownSymbolLogic;

	function requireFixRegexpWellKnownSymbolLogic () {
		if (hasRequiredFixRegexpWellKnownSymbolLogic) return fixRegexpWellKnownSymbolLogic;
		hasRequiredFixRegexpWellKnownSymbolLogic = 1;
		// TODO: Remove from `core-js@4` since it's moved to entry points
		requireEs_regexp_exec();
		var call = requireFunctionCall();
		var defineBuiltIn = requireDefineBuiltIn();
		var regexpExec = requireRegexpExec();
		var fails = requireFails();
		var wellKnownSymbol = requireWellKnownSymbol();
		var createNonEnumerableProperty = requireCreateNonEnumerableProperty();

		var SPECIES = wellKnownSymbol('species');
		var RegExpPrototype = RegExp.prototype;

		fixRegexpWellKnownSymbolLogic = function (KEY, exec, FORCED, SHAM) {
		  var SYMBOL = wellKnownSymbol(KEY);

		  var DELEGATES_TO_SYMBOL = !fails(function () {
		    // String methods call symbol-named RegExp methods
		    var O = {};
		    // eslint-disable-next-line unicorn/no-immediate-mutation -- ES3 syntax limitation
		    O[SYMBOL] = function () { return 7; };
		    return ''[KEY](O) !== 7;
		  });

		  var DELEGATES_TO_EXEC = DELEGATES_TO_SYMBOL && !fails(function () {
		    // Symbol-named RegExp methods call .exec
		    var execCalled = false;
		    var re = /a/;

		    if (KEY === 'split') {
		      // We can't use real regex here since it causes deoptimization
		      // and serious performance degradation in V8
		      // https://github.com/zloirock/core-js/issues/306
		      // RegExp[@@split] doesn't call the regex's exec method, but first creates
		      // a new one. We need to return the patched regex when creating the new one.
		      var constructor = {};
		      // eslint-disable-next-line unicorn/no-immediate-mutation -- ES3 syntax limitation
		      constructor[SPECIES] = function () { return re; };
		      re = { constructor: constructor, flags: '' };
		      // eslint-disable-next-line unicorn/no-immediate-mutation -- ES3 syntax limitation
		      re[SYMBOL] = /./[SYMBOL];
		    }

		    re.exec = function () {
		      execCalled = true;
		      return null;
		    };

		    re[SYMBOL]('');
		    return !execCalled;
		  });

		  if (
		    !DELEGATES_TO_SYMBOL ||
		    !DELEGATES_TO_EXEC ||
		    FORCED
		  ) {
		    var nativeRegExpMethod = /./[SYMBOL];
		    var methods = exec(SYMBOL, ''[KEY], function (nativeMethod, regexp, str, arg2, forceStringMethod) {
		      var $exec = regexp.exec;
		      if ($exec === regexpExec || $exec === RegExpPrototype.exec) {
		        if (DELEGATES_TO_SYMBOL && !forceStringMethod) {
		          // The native String method already delegates to @@method (this
		          // polyfilled function), leasing to infinite recursion.
		          // We avoid it by directly calling the native @@method method.
		          return { done: true, value: call(nativeRegExpMethod, regexp, str, arg2) };
		        }
		        return { done: true, value: call(nativeMethod, str, regexp, arg2) };
		      }
		      return { done: false };
		    });

		    defineBuiltIn(String.prototype, KEY, methods[0]);
		    defineBuiltIn(RegExpPrototype, SYMBOL, methods[1]);
		  }

		  if (SHAM) createNonEnumerableProperty(RegExpPrototype[SYMBOL], 'sham', true);
		};
		return fixRegexpWellKnownSymbolLogic;
	}

	var advanceStringIndex;
	var hasRequiredAdvanceStringIndex;

	function requireAdvanceStringIndex () {
		if (hasRequiredAdvanceStringIndex) return advanceStringIndex;
		hasRequiredAdvanceStringIndex = 1;
		var charAt = requireStringMultibyte().charAt;

		// `AdvanceStringIndex` abstract operation
		// https://tc39.es/ecma262/#sec-advancestringindex
		advanceStringIndex = function (S, index, unicode) {
		  return index + (unicode ? charAt(S, index).length || 1 : 1);
		};
		return advanceStringIndex;
	}

	var getSubstitution;
	var hasRequiredGetSubstitution;

	function requireGetSubstitution () {
		if (hasRequiredGetSubstitution) return getSubstitution;
		hasRequiredGetSubstitution = 1;
		var uncurryThis = requireFunctionUncurryThis();
		var toObject = requireToObject();

		var floor = Math.floor;
		var charAt = uncurryThis(''.charAt);
		var replace = uncurryThis(''.replace);
		var stringSlice = uncurryThis(''.slice);
		// eslint-disable-next-line redos/no-vulnerable -- safe
		var SUBSTITUTION_SYMBOLS = /\$([$&'`]|\d{1,2}|<[^>]*>)/g;
		var SUBSTITUTION_SYMBOLS_NO_NAMED = /\$([$&'`]|\d{1,2})/g;

		// `GetSubstitution` abstract operation
		// https://tc39.es/ecma262/#sec-getsubstitution
		getSubstitution = function (matched, str, position, captures, namedCaptures, replacement) {
		  var tailPos = position + matched.length;
		  var m = captures.length;
		  var symbols = SUBSTITUTION_SYMBOLS_NO_NAMED;
		  if (namedCaptures !== undefined) {
		    namedCaptures = toObject(namedCaptures);
		    symbols = SUBSTITUTION_SYMBOLS;
		  }
		  return replace(replacement, symbols, function (match, ch) {
		    var capture;
		    switch (charAt(ch, 0)) {
		      case '$': return '$';
		      case '&': return matched;
		      case '`': return stringSlice(str, 0, position);
		      case "'": return stringSlice(str, tailPos);
		      case '<':
		        capture = namedCaptures[stringSlice(ch, 1, -1)];
		        break;
		      default: // \d\d?
		        var n = +ch;
		        if (n === 0) return match;
		        if (n > m) {
		          var f = floor(n / 10);
		          if (f === 0) return match;
		          if (f <= m) return captures[f - 1] === undefined ? charAt(ch, 1) : captures[f - 1] + charAt(ch, 1);
		          return match;
		        }
		        capture = captures[n - 1];
		    }
		    return capture === undefined ? '' : capture;
		  });
		};
		return getSubstitution;
	}

	var regexpExecAbstract;
	var hasRequiredRegexpExecAbstract;

	function requireRegexpExecAbstract () {
		if (hasRequiredRegexpExecAbstract) return regexpExecAbstract;
		hasRequiredRegexpExecAbstract = 1;
		var call = requireFunctionCall();
		var anObject = requireAnObject();
		var isCallable = requireIsCallable();
		var classof = requireClassofRaw();
		var regexpExec = requireRegexpExec();

		var $TypeError = TypeError;

		// `RegExpExec` abstract operation
		// https://tc39.es/ecma262/#sec-regexpexec
		regexpExecAbstract = function (R, S) {
		  var exec = R.exec;
		  if (isCallable(exec)) {
		    var result = call(exec, R, S);
		    if (result !== null) anObject(result);
		    return result;
		  }
		  if (classof(R) === 'RegExp') return call(regexpExec, R, S);
		  throw new $TypeError('RegExp#exec called on incompatible receiver');
		};
		return regexpExecAbstract;
	}

	var hasRequiredEs_string_replace;

	function requireEs_string_replace () {
		if (hasRequiredEs_string_replace) return es_string_replace;
		hasRequiredEs_string_replace = 1;
		var apply = requireFunctionApply();
		var call = requireFunctionCall();
		var uncurryThis = requireFunctionUncurryThis();
		var fixRegExpWellKnownSymbolLogic = requireFixRegexpWellKnownSymbolLogic();
		var fails = requireFails();
		var anObject = requireAnObject();
		var isCallable = requireIsCallable();
		var isObject = requireIsObject();
		var toIntegerOrInfinity = requireToIntegerOrInfinity();
		var toLength = requireToLength();
		var toString = requireToString();
		var requireObjectCoercible = requireRequireObjectCoercible();
		var advanceStringIndex = requireAdvanceStringIndex();
		var getMethod = requireGetMethod();
		var getSubstitution = requireGetSubstitution();
		var getRegExpFlags = requireRegexpGetFlags();
		var regExpExec = requireRegexpExecAbstract();
		var wellKnownSymbol = requireWellKnownSymbol();

		var REPLACE = wellKnownSymbol('replace');
		var max = Math.max;
		var min = Math.min;
		var concat = uncurryThis([].concat);
		var push = uncurryThis([].push);
		var stringIndexOf = uncurryThis(''.indexOf);
		var stringSlice = uncurryThis(''.slice);

		var maybeToString = function (it) {
		  return it === undefined ? it : String(it);
		};

		// IE <= 11 replaces $0 with the whole match, as if it was $&
		// https://stackoverflow.com/questions/6024666/getting-ie-to-replace-a-regex-with-the-literal-string-0
		var REPLACE_KEEPS_$0 = (function () {
		  // eslint-disable-next-line regexp/prefer-escape-replacement-dollar-char -- required for testing
		  return 'a'.replace(/./, '$0') === '$0';
		})();

		// Safari <= 13.0.3(?) substitutes nth capture where n>m with an empty string
		var REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE = (function () {
		  if (/./[REPLACE]) {
		    return /./[REPLACE]('a', '$0') === '';
		  }
		  return false;
		})();

		var REPLACE_SUPPORTS_NAMED_GROUPS = !fails(function () {
		  var re = /./;
		  re.exec = function () {
		    var result = [];
		    result.groups = { a: '7' };
		    return result;
		  };
		  // eslint-disable-next-line regexp/no-useless-dollar-replacements -- false positive
		  return ''.replace(re, '$<a>') !== '7';
		});

		// @@replace logic
		fixRegExpWellKnownSymbolLogic('replace', function (_, nativeReplace, maybeCallNative) {
		  var UNSAFE_SUBSTITUTE = REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE ? '$' : '$0';

		  return [
		    // `String.prototype.replace` method
		    // https://tc39.es/ecma262/#sec-string.prototype.replace
		    function replace(searchValue, replaceValue) {
		      var O = requireObjectCoercible(this);
		      var replacer = isObject(searchValue) ? getMethod(searchValue, REPLACE) : undefined;
		      return replacer
		        ? call(replacer, searchValue, O, replaceValue)
		        : call(nativeReplace, toString(O), searchValue, replaceValue);
		    },
		    // `RegExp.prototype[@@replace]` method
		    // https://tc39.es/ecma262/#sec-regexp.prototype-@@replace
		    function (string, replaceValue) {
		      var rx = anObject(this);
		      var S = toString(string);

		      var functionalReplace = isCallable(replaceValue);
		      if (!functionalReplace) replaceValue = toString(replaceValue);
		      var flags = toString(getRegExpFlags(rx));

		      if (
		        typeof replaceValue == 'string' &&
		        !~stringIndexOf(replaceValue, UNSAFE_SUBSTITUTE) &&
		        !~stringIndexOf(replaceValue, '$<') &&
		        !~stringIndexOf(flags, 'y')
		      ) {
		        var res = maybeCallNative(nativeReplace, rx, S, replaceValue);
		        if (res.done) return res.value;
		      }

		      var global = !!~stringIndexOf(flags, 'g');
		      var fullUnicode;
		      if (global) {
		        fullUnicode = !!~stringIndexOf(flags, 'u') || !!~stringIndexOf(flags, 'v');
		        rx.lastIndex = 0;
		      }

		      var results = [];
		      var result;
		      while (true) {
		        result = regExpExec(rx, S);
		        if (result === null) break;

		        push(results, result);
		        if (!global) break;

		        var matchStr = toString(result[0]);
		        if (matchStr === '') rx.lastIndex = advanceStringIndex(S, toLength(rx.lastIndex), fullUnicode);
		      }

		      var accumulatedResult = '';
		      var nextSourcePosition = 0;
		      for (var i = 0; i < results.length; i++) {
		        result = results[i];

		        var matched = toString(result[0]);
		        var position = max(min(toIntegerOrInfinity(result.index), S.length), 0);
		        var captures = [];
		        var replacement;
		        // NOTE: This is equivalent to
		        //   captures = result.slice(1).map(maybeToString)
		        // but for some reason `nativeSlice.call(result, 1, result.length)` (called in
		        // the slice polyfill when slicing native arrays) "doesn't work" in safari 9 and
		        // causes a crash (https://pastebin.com/N21QzeQA) when trying to debug it.
		        for (var j = 1; j < result.length; j++) push(captures, maybeToString(result[j]));
		        var namedCaptures = result.groups;
		        if (functionalReplace) {
		          var replacerArgs = concat([matched], captures, position, S);
		          if (namedCaptures !== undefined) push(replacerArgs, namedCaptures);
		          replacement = toString(apply(replaceValue, undefined, replacerArgs));
		        } else {
		          replacement = getSubstitution(matched, S, position, captures, namedCaptures, replaceValue);
		        }
		        if (position >= nextSourcePosition) {
		          accumulatedResult += stringSlice(S, nextSourcePosition, position) + replacement;
		          nextSourcePosition = position + matched.length;
		        }
		      }

		      return accumulatedResult + stringSlice(S, nextSourcePosition);
		    }
		  ];
		}, !REPLACE_SUPPORTS_NAMED_GROUPS || !REPLACE_KEEPS_$0 || REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE);
		return es_string_replace;
	}

	requireEs_string_replace();

	var es_typedArray_uint8Array = {};

	var typedArrayConstructor = {exports: {}};

	var arrayBufferViewCore;
	var hasRequiredArrayBufferViewCore;

	function requireArrayBufferViewCore () {
		if (hasRequiredArrayBufferViewCore) return arrayBufferViewCore;
		hasRequiredArrayBufferViewCore = 1;
		var NATIVE_ARRAY_BUFFER = requireArrayBufferBasicDetection();
		var DESCRIPTORS = requireDescriptors();
		var globalThis = requireGlobalThis();
		var isCallable = requireIsCallable();
		var isObject = requireIsObject();
		var hasOwn = requireHasOwnProperty();
		var classof = requireClassof();
		var tryToString = requireTryToString();
		var createNonEnumerableProperty = requireCreateNonEnumerableProperty();
		var defineBuiltIn = requireDefineBuiltIn();
		var defineBuiltInAccessor = requireDefineBuiltInAccessor();
		var isPrototypeOf = requireObjectIsPrototypeOf();
		var getPrototypeOf = requireObjectGetPrototypeOf();
		var setPrototypeOf = requireObjectSetPrototypeOf();
		var wellKnownSymbol = requireWellKnownSymbol();
		var uid = requireUid();
		var InternalStateModule = requireInternalState();

		var enforceInternalState = InternalStateModule.enforce;
		var getInternalState = InternalStateModule.get;
		var Int8Array = globalThis.Int8Array;
		var Int8ArrayPrototype = Int8Array && Int8Array.prototype;
		var Uint8ClampedArray = globalThis.Uint8ClampedArray;
		var Uint8ClampedArrayPrototype = Uint8ClampedArray && Uint8ClampedArray.prototype;
		var TypedArray = Int8Array && getPrototypeOf(Int8Array);
		var TypedArrayPrototype = Int8ArrayPrototype && getPrototypeOf(Int8ArrayPrototype);
		var ObjectPrototype = Object.prototype;
		var TypeError = globalThis.TypeError;

		var TO_STRING_TAG = wellKnownSymbol('toStringTag');
		var TYPED_ARRAY_TAG = uid('TYPED_ARRAY_TAG');
		var TYPED_ARRAY_CONSTRUCTOR = 'TypedArrayConstructor';
		// Fixing native typed arrays in Opera Presto crashes the browser, see #595
		var NATIVE_ARRAY_BUFFER_VIEWS = NATIVE_ARRAY_BUFFER && !!setPrototypeOf && classof(globalThis.opera) !== 'Opera';
		var TYPED_ARRAY_TAG_REQUIRED = false;
		var NAME, Constructor, Prototype;

		var TypedArrayConstructorsList = {
		  Int8Array: 1,
		  Uint8Array: 1,
		  Uint8ClampedArray: 1,
		  Int16Array: 2,
		  Uint16Array: 2,
		  Int32Array: 4,
		  Uint32Array: 4,
		  Float32Array: 4,
		  Float64Array: 8
		};

		var BigIntArrayConstructorsList = {
		  BigInt64Array: 8,
		  BigUint64Array: 8
		};

		var isView = function isView(it) {
		  if (!isObject(it)) return false;
		  var klass = classof(it);
		  return klass === 'DataView'
		    || hasOwn(TypedArrayConstructorsList, klass)
		    || hasOwn(BigIntArrayConstructorsList, klass);
		};

		var getTypedArrayConstructor = function (it) {
		  var proto = getPrototypeOf(it);
		  if (!isObject(proto)) return;
		  var state = getInternalState(proto);
		  return (state && hasOwn(state, TYPED_ARRAY_CONSTRUCTOR)) ? state[TYPED_ARRAY_CONSTRUCTOR] : getTypedArrayConstructor(proto);
		};

		var isTypedArray = function (it) {
		  if (!isObject(it)) return false;
		  var klass = classof(it);
		  return hasOwn(TypedArrayConstructorsList, klass)
		    || hasOwn(BigIntArrayConstructorsList, klass);
		};

		var aTypedArray = function (it) {
		  if (isTypedArray(it)) return it;
		  throw new TypeError('Target is not a typed array');
		};

		var aTypedArrayConstructor = function (C) {
		  if (isCallable(C) && (!setPrototypeOf || isPrototypeOf(TypedArray, C))) return C;
		  throw new TypeError(tryToString(C) + ' is not a typed array constructor');
		};

		var exportTypedArrayMethod = function (KEY, property, forced, options) {
		  if (!DESCRIPTORS) return;
		  if (forced) for (var ARRAY in TypedArrayConstructorsList) {
		    var TypedArrayConstructor = globalThis[ARRAY];
		    if (TypedArrayConstructor && hasOwn(TypedArrayConstructor.prototype, KEY)) try {
		      delete TypedArrayConstructor.prototype[KEY];
		    } catch (error) {
		      // old WebKit bug - some methods are non-configurable
		      try {
		        TypedArrayConstructor.prototype[KEY] = property;
		      } catch (error2) { /* empty */ }
		    }
		  }
		  if (!TypedArrayPrototype[KEY] || forced) {
		    defineBuiltIn(TypedArrayPrototype, KEY, forced ? property
		      : NATIVE_ARRAY_BUFFER_VIEWS && Int8ArrayPrototype[KEY] || property, options);
		  }
		};

		var exportTypedArrayStaticMethod = function (KEY, property, forced) {
		  var ARRAY, TypedArrayConstructor;
		  if (!DESCRIPTORS) return;
		  if (setPrototypeOf) {
		    if (forced) for (ARRAY in TypedArrayConstructorsList) {
		      TypedArrayConstructor = globalThis[ARRAY];
		      if (TypedArrayConstructor && hasOwn(TypedArrayConstructor, KEY)) try {
		        delete TypedArrayConstructor[KEY];
		      } catch (error) { /* empty */ }
		    }
		    if (!TypedArray[KEY] || forced) {
		      // V8 ~ Chrome 49-50 `%TypedArray%` methods are non-writable non-configurable
		      try {
		        return defineBuiltIn(TypedArray, KEY, forced ? property : NATIVE_ARRAY_BUFFER_VIEWS && TypedArray[KEY] || property);
		      } catch (error) { /* empty */ }
		    } else return;
		  }
		  for (ARRAY in TypedArrayConstructorsList) {
		    TypedArrayConstructor = globalThis[ARRAY];
		    if (TypedArrayConstructor && (!TypedArrayConstructor[KEY] || forced)) {
		      defineBuiltIn(TypedArrayConstructor, KEY, property);
		    }
		  }
		};

		for (NAME in TypedArrayConstructorsList) {
		  Constructor = globalThis[NAME];
		  Prototype = Constructor && Constructor.prototype;
		  if (Prototype) enforceInternalState(Prototype)[TYPED_ARRAY_CONSTRUCTOR] = Constructor;
		  else NATIVE_ARRAY_BUFFER_VIEWS = false;
		}

		for (NAME in BigIntArrayConstructorsList) {
		  Constructor = globalThis[NAME];
		  Prototype = Constructor && Constructor.prototype;
		  if (Prototype) enforceInternalState(Prototype)[TYPED_ARRAY_CONSTRUCTOR] = Constructor;
		}

		// WebKit bug - typed arrays constructors prototype is Object.prototype
		if (!NATIVE_ARRAY_BUFFER_VIEWS || !isCallable(TypedArray) || TypedArray === Function.prototype) {
		  // eslint-disable-next-line no-shadow -- safe
		  TypedArray = function TypedArray() {
		    throw new TypeError('Incorrect invocation');
		  };
		  if (NATIVE_ARRAY_BUFFER_VIEWS) for (NAME in TypedArrayConstructorsList) {
		    if (globalThis[NAME]) setPrototypeOf(globalThis[NAME], TypedArray);
		  }
		}

		if (!NATIVE_ARRAY_BUFFER_VIEWS || !TypedArrayPrototype || TypedArrayPrototype === ObjectPrototype) {
		  TypedArrayPrototype = TypedArray.prototype;
		  if (NATIVE_ARRAY_BUFFER_VIEWS) for (NAME in TypedArrayConstructorsList) {
		    if (globalThis[NAME]) setPrototypeOf(globalThis[NAME].prototype, TypedArrayPrototype);
		  }
		}

		// WebKit bug - one more object in Uint8ClampedArray prototype chain
		if (NATIVE_ARRAY_BUFFER_VIEWS && getPrototypeOf(Uint8ClampedArrayPrototype) !== TypedArrayPrototype) {
		  setPrototypeOf(Uint8ClampedArrayPrototype, TypedArrayPrototype);
		}

		if (DESCRIPTORS && !hasOwn(TypedArrayPrototype, TO_STRING_TAG)) {
		  TYPED_ARRAY_TAG_REQUIRED = true;
		  defineBuiltInAccessor(TypedArrayPrototype, TO_STRING_TAG, {
		    configurable: true,
		    get: function () {
		      return isObject(this) ? this[TYPED_ARRAY_TAG] : undefined;
		    }
		  });
		  for (NAME in TypedArrayConstructorsList) if (globalThis[NAME]) {
		    createNonEnumerableProperty(globalThis[NAME].prototype, TYPED_ARRAY_TAG, NAME);
		  }
		}

		arrayBufferViewCore = {
		  NATIVE_ARRAY_BUFFER_VIEWS: NATIVE_ARRAY_BUFFER_VIEWS,
		  TYPED_ARRAY_TAG: TYPED_ARRAY_TAG_REQUIRED && TYPED_ARRAY_TAG,
		  aTypedArray: aTypedArray,
		  aTypedArrayConstructor: aTypedArrayConstructor,
		  exportTypedArrayMethod: exportTypedArrayMethod,
		  exportTypedArrayStaticMethod: exportTypedArrayStaticMethod,
		  getTypedArrayConstructor: getTypedArrayConstructor,
		  isView: isView,
		  isTypedArray: isTypedArray,
		  TypedArray: TypedArray,
		  TypedArrayPrototype: TypedArrayPrototype
		};
		return arrayBufferViewCore;
	}

	var typedArrayConstructorsRequireWrappers;
	var hasRequiredTypedArrayConstructorsRequireWrappers;

	function requireTypedArrayConstructorsRequireWrappers () {
		if (hasRequiredTypedArrayConstructorsRequireWrappers) return typedArrayConstructorsRequireWrappers;
		hasRequiredTypedArrayConstructorsRequireWrappers = 1;
		/* eslint-disable no-new, sonarjs/inconsistent-function-call -- required for testing */
		var globalThis = requireGlobalThis();
		var fails = requireFails();
		var checkCorrectnessOfIteration = requireCheckCorrectnessOfIteration();
		var NATIVE_ARRAY_BUFFER_VIEWS = requireArrayBufferViewCore().NATIVE_ARRAY_BUFFER_VIEWS;

		var ArrayBuffer = globalThis.ArrayBuffer;
		var Int8Array = globalThis.Int8Array;

		typedArrayConstructorsRequireWrappers = !NATIVE_ARRAY_BUFFER_VIEWS || !fails(function () {
		  Int8Array(1);
		}) || !fails(function () {
		  new Int8Array(-1);
		}) || !checkCorrectnessOfIteration(function (iterable) {
		  new Int8Array();
		  new Int8Array(null);
		  new Int8Array(1.5);
		  new Int8Array(iterable);
		}, true) || fails(function () {
		  // Safari (11+) bug - a reason why even Safari 13 should load a typed array polyfill
		  return new Int8Array(new ArrayBuffer(2), 1, undefined).length !== 1;
		});
		return typedArrayConstructorsRequireWrappers;
	}

	var isIntegralNumber;
	var hasRequiredIsIntegralNumber;

	function requireIsIntegralNumber () {
		if (hasRequiredIsIntegralNumber) return isIntegralNumber;
		hasRequiredIsIntegralNumber = 1;
		var isObject = requireIsObject();

		var floor = Math.floor;

		// `IsIntegralNumber` abstract operation
		// https://tc39.es/ecma262/#sec-isintegralnumber
		// eslint-disable-next-line es/no-number-isinteger -- safe
		isIntegralNumber = Number.isInteger || function isInteger(it) {
		  return !isObject(it) && isFinite(it) && floor(it) === it;
		};
		return isIntegralNumber;
	}

	var toPositiveInteger;
	var hasRequiredToPositiveInteger;

	function requireToPositiveInteger () {
		if (hasRequiredToPositiveInteger) return toPositiveInteger;
		hasRequiredToPositiveInteger = 1;
		var toIntegerOrInfinity = requireToIntegerOrInfinity();

		var $RangeError = RangeError;

		toPositiveInteger = function (it) {
		  var result = toIntegerOrInfinity(it);
		  if (result < 0) throw new $RangeError("The argument can't be less than 0");
		  return result;
		};
		return toPositiveInteger;
	}

	var toOffset;
	var hasRequiredToOffset;

	function requireToOffset () {
		if (hasRequiredToOffset) return toOffset;
		hasRequiredToOffset = 1;
		var toPositiveInteger = requireToPositiveInteger();

		var $RangeError = RangeError;

		toOffset = function (it, BYTES) {
		  var offset = toPositiveInteger(it);
		  if (offset % BYTES) throw new $RangeError('Wrong offset');
		  return offset;
		};
		return toOffset;
	}

	var toUint8Clamped;
	var hasRequiredToUint8Clamped;

	function requireToUint8Clamped () {
		if (hasRequiredToUint8Clamped) return toUint8Clamped;
		hasRequiredToUint8Clamped = 1;
		var floor = Math.floor;

		// https://tc39.es/ecma262/#sec-touint8clamp
		toUint8Clamped = function (it) {
		  var number = +it;
		  // eslint-disable-next-line no-self-compare -- NaN check
		  if (number !== number || number <= 0) return 0;
		  if (number >= 0xFF) return 0xFF;
		  var f = floor(number);
		  if (f + 0.5 < number) return f + 1;
		  if (number < f + 0.5) return f;
		  // round-half-to-even (banker's rounding)
		  return f % 2 === 0 ? f : f + 1;
		};
		return toUint8Clamped;
	}

	var isBigIntArray;
	var hasRequiredIsBigIntArray;

	function requireIsBigIntArray () {
		if (hasRequiredIsBigIntArray) return isBigIntArray;
		hasRequiredIsBigIntArray = 1;
		var classof = requireClassof();

		isBigIntArray = function (it) {
		  var klass = classof(it);
		  return klass === 'BigInt64Array' || klass === 'BigUint64Array';
		};
		return isBigIntArray;
	}

	var toBigInt;
	var hasRequiredToBigInt;

	function requireToBigInt () {
		if (hasRequiredToBigInt) return toBigInt;
		hasRequiredToBigInt = 1;
		var toPrimitive = requireToPrimitive();

		var $TypeError = TypeError;

		// `ToBigInt` abstract operation
		// https://tc39.es/ecma262/#sec-tobigint
		toBigInt = function (argument) {
		  var prim = toPrimitive(argument, 'number');
		  if (typeof prim == 'number') throw new $TypeError("Can't convert number to bigint");
		  // eslint-disable-next-line es/no-bigint -- safe
		  return BigInt(prim);
		};
		return toBigInt;
	}

	var typedArrayFrom;
	var hasRequiredTypedArrayFrom;

	function requireTypedArrayFrom () {
		if (hasRequiredTypedArrayFrom) return typedArrayFrom;
		hasRequiredTypedArrayFrom = 1;
		var bind = requireFunctionBindContext();
		var call = requireFunctionCall();
		var aCallable = requireACallable();
		var aConstructor = requireAConstructor();
		var toObject = requireToObject();
		var lengthOfArrayLike = requireLengthOfArrayLike();
		var getIterator = requireGetIterator();
		var getIteratorMethod = requireGetIteratorMethod();
		var isArrayIteratorMethod = requireIsArrayIteratorMethod();
		var isBigIntArray = requireIsBigIntArray();
		var aTypedArrayConstructor = requireArrayBufferViewCore().aTypedArrayConstructor;
		var toBigInt = requireToBigInt();

		typedArrayFrom = function from(source /* , mapfn, thisArg */) {
		  var C = aConstructor(this);
		  var argumentsLength = arguments.length;
		  var mapfn = argumentsLength > 1 ? arguments[1] : undefined;
		  var mapping = mapfn !== undefined;
		  if (mapping) aCallable(mapfn);
		  var O = toObject(source);
		  var iteratorMethod = getIteratorMethod(O);
		  var i, length, result, thisIsBigIntArray, value, step, iterator, next;
		  if (iteratorMethod && !isArrayIteratorMethod(iteratorMethod)) {
		    iterator = getIterator(O, iteratorMethod);
		    next = iterator.next;
		    O = [];
		    while (!(step = call(next, iterator)).done) {
		      O.push(step.value);
		    }
		  }
		  if (mapping && argumentsLength > 2) {
		    mapfn = bind(mapfn, arguments[2]);
		  }
		  length = lengthOfArrayLike(O);
		  result = new (aTypedArrayConstructor(C))(length);
		  thisIsBigIntArray = isBigIntArray(result);
		  for (i = 0; length > i; i++) {
		    value = mapping ? mapfn(O[i], i) : O[i];
		    // FF30- typed arrays doesn't properly convert objects to typed array values
		    result[i] = thisIsBigIntArray ? toBigInt(value) : +value;
		  }
		  return result;
		};
		return typedArrayFrom;
	}

	var arrayFromConstructorAndList;
	var hasRequiredArrayFromConstructorAndList;

	function requireArrayFromConstructorAndList () {
		if (hasRequiredArrayFromConstructorAndList) return arrayFromConstructorAndList;
		hasRequiredArrayFromConstructorAndList = 1;
		var lengthOfArrayLike = requireLengthOfArrayLike();

		arrayFromConstructorAndList = function (Constructor, list, $length) {
		  var index = 0;
		  var length = arguments.length > 2 ? $length : lengthOfArrayLike(list);
		  var result = new Constructor(length);
		  while (length > index) result[index] = list[index++];
		  return result;
		};
		return arrayFromConstructorAndList;
	}

	var hasRequiredTypedArrayConstructor;

	function requireTypedArrayConstructor () {
		if (hasRequiredTypedArrayConstructor) return typedArrayConstructor.exports;
		hasRequiredTypedArrayConstructor = 1;
		var $ = require_export();
		var globalThis = requireGlobalThis();
		var call = requireFunctionCall();
		var DESCRIPTORS = requireDescriptors();
		var TYPED_ARRAYS_CONSTRUCTORS_REQUIRES_WRAPPERS = requireTypedArrayConstructorsRequireWrappers();
		var ArrayBufferViewCore = requireArrayBufferViewCore();
		var ArrayBufferModule = requireArrayBuffer();
		var anInstance = requireAnInstance();
		var createPropertyDescriptor = requireCreatePropertyDescriptor();
		var createNonEnumerableProperty = requireCreateNonEnumerableProperty();
		var isIntegralNumber = requireIsIntegralNumber();
		var toIndex = requireToIndex();
		var toOffset = requireToOffset();
		var toUint8Clamped = requireToUint8Clamped();
		var toPropertyKey = requireToPropertyKey();
		var hasOwn = requireHasOwnProperty();
		var classof = requireClassof();
		var isObject = requireIsObject();
		var isSymbol = requireIsSymbol();
		var create = requireObjectCreate();
		var isPrototypeOf = requireObjectIsPrototypeOf();
		var setPrototypeOf = requireObjectSetPrototypeOf();
		var getOwnPropertyNames = requireObjectGetOwnPropertyNames().f;
		var typedArrayFrom = requireTypedArrayFrom();
		var forEach = requireArrayIteration().forEach;
		var setSpecies = requireSetSpecies();
		var defineBuiltInAccessor = requireDefineBuiltInAccessor();
		var definePropertyModule = requireObjectDefineProperty();
		var getOwnPropertyDescriptorModule = requireObjectGetOwnPropertyDescriptor();
		var arrayFromConstructorAndList = requireArrayFromConstructorAndList();
		var InternalStateModule = requireInternalState();
		var inheritIfRequired = requireInheritIfRequired();

		var getInternalState = InternalStateModule.get;
		var setInternalState = InternalStateModule.set;
		var enforceInternalState = InternalStateModule.enforce;
		var nativeDefineProperty = definePropertyModule.f;
		var nativeGetOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;
		var RangeError = globalThis.RangeError;
		var ArrayBuffer = ArrayBufferModule.ArrayBuffer;
		var ArrayBufferPrototype = ArrayBuffer.prototype;
		var DataView = ArrayBufferModule.DataView;
		var NATIVE_ARRAY_BUFFER_VIEWS = ArrayBufferViewCore.NATIVE_ARRAY_BUFFER_VIEWS;
		var TYPED_ARRAY_TAG = ArrayBufferViewCore.TYPED_ARRAY_TAG;
		var TypedArray = ArrayBufferViewCore.TypedArray;
		var TypedArrayPrototype = ArrayBufferViewCore.TypedArrayPrototype;
		var isTypedArray = ArrayBufferViewCore.isTypedArray;
		var BYTES_PER_ELEMENT = 'BYTES_PER_ELEMENT';
		var WRONG_LENGTH = 'Wrong length';

		var addGetter = function (it, key) {
		  defineBuiltInAccessor(it, key, {
		    configurable: true,
		    get: function () {
		      return getInternalState(this)[key];
		    }
		  });
		};

		var isArrayBuffer = function (it) {
		  var klass;
		  return isPrototypeOf(ArrayBufferPrototype, it) || (klass = classof(it)) === 'ArrayBuffer' || klass === 'SharedArrayBuffer';
		};

		var isTypedArrayIndex = function (target, key) {
		  return isTypedArray(target)
		    && !isSymbol(key)
		    && key in target
		    && isIntegralNumber(+key)
		    && key >= 0;
		};

		var wrappedGetOwnPropertyDescriptor = function getOwnPropertyDescriptor(target, key) {
		  key = toPropertyKey(key);
		  return isTypedArrayIndex(target, key)
		    ? createPropertyDescriptor(2, target[key])
		    : nativeGetOwnPropertyDescriptor(target, key);
		};

		var wrappedDefineProperty = function defineProperty(target, key, descriptor) {
		  key = toPropertyKey(key);
		  if (isTypedArrayIndex(target, key)
		    && isObject(descriptor)
		    && hasOwn(descriptor, 'value')
		    && !hasOwn(descriptor, 'get')
		    && !hasOwn(descriptor, 'set')
		    // TODO: add validation descriptor w/o calling accessors
		    && !descriptor.configurable
		    && (!hasOwn(descriptor, 'writable') || descriptor.writable)
		    && (!hasOwn(descriptor, 'enumerable') || descriptor.enumerable)
		  ) {
		    target[key] = descriptor.value;
		    return target;
		  } return nativeDefineProperty(target, key, descriptor);
		};

		if (DESCRIPTORS) {
		  if (!NATIVE_ARRAY_BUFFER_VIEWS) {
		    getOwnPropertyDescriptorModule.f = wrappedGetOwnPropertyDescriptor;
		    definePropertyModule.f = wrappedDefineProperty;
		    addGetter(TypedArrayPrototype, 'buffer');
		    addGetter(TypedArrayPrototype, 'byteOffset');
		    addGetter(TypedArrayPrototype, 'byteLength');
		    addGetter(TypedArrayPrototype, 'length');
		  }

		  $({ target: 'Object', stat: true, forced: !NATIVE_ARRAY_BUFFER_VIEWS }, {
		    getOwnPropertyDescriptor: wrappedGetOwnPropertyDescriptor,
		    defineProperty: wrappedDefineProperty
		  });

		  typedArrayConstructor.exports = function (TYPE, wrapper, CLAMPED) {
		    var BYTES = TYPE.match(/\d+/)[0] / 8;
		    var CONSTRUCTOR_NAME = TYPE + (CLAMPED ? 'Clamped' : '') + 'Array';
		    var GETTER = 'get' + TYPE;
		    var SETTER = 'set' + TYPE;
		    var NativeTypedArrayConstructor = globalThis[CONSTRUCTOR_NAME];
		    var TypedArrayConstructor = NativeTypedArrayConstructor;
		    var TypedArrayConstructorPrototype = TypedArrayConstructor && TypedArrayConstructor.prototype;
		    var exported = {};

		    var getter = function (that, index) {
		      var data = getInternalState(that);
		      return data.view[GETTER](index * BYTES + data.byteOffset, true);
		    };

		    var setter = function (that, index, value) {
		      var data = getInternalState(that);
		      data.view[SETTER](index * BYTES + data.byteOffset, CLAMPED ? toUint8Clamped(value) : value, true);
		    };

		    var addElement = function (that, index) {
		      nativeDefineProperty(that, index, {
		        get: function () {
		          return getter(this, index);
		        },
		        set: function (value) {
		          return setter(this, index, value);
		        },
		        enumerable: true
		      });
		    };

		    if (!NATIVE_ARRAY_BUFFER_VIEWS) {
		      TypedArrayConstructor = wrapper(function (that, data, offset, $length) {
		        anInstance(that, TypedArrayConstructorPrototype);
		        var index = 0;
		        var byteOffset = 0;
		        var buffer, byteLength, length;
		        if (!isObject(data)) {
		          length = toIndex(data);
		          byteLength = length * BYTES;
		          buffer = new ArrayBuffer(byteLength);
		        } else if (isArrayBuffer(data)) {
		          buffer = data;
		          byteOffset = toOffset(offset, BYTES);
		          var $len = data.byteLength;
		          if ($length === undefined) {
		            if ($len % BYTES) throw new RangeError(WRONG_LENGTH);
		            byteLength = $len - byteOffset;
		            if (byteLength < 0) throw new RangeError(WRONG_LENGTH);
		          } else {
		            byteLength = toIndex($length) * BYTES;
		            if (byteLength + byteOffset > $len) throw new RangeError(WRONG_LENGTH);
		          }
		          length = byteLength / BYTES;
		        } else if (isTypedArray(data)) {
		          return arrayFromConstructorAndList(TypedArrayConstructor, data);
		        } else {
		          return call(typedArrayFrom, TypedArrayConstructor, data);
		        }
		        setInternalState(that, {
		          buffer: buffer,
		          byteOffset: byteOffset,
		          byteLength: byteLength,
		          length: length,
		          view: new DataView(buffer)
		        });
		        while (index < length) addElement(that, index++);
		      });

		      if (setPrototypeOf) setPrototypeOf(TypedArrayConstructor, TypedArray);
		      TypedArrayConstructorPrototype = TypedArrayConstructor.prototype = create(TypedArrayPrototype);
		    } else if (TYPED_ARRAYS_CONSTRUCTORS_REQUIRES_WRAPPERS) {
		      TypedArrayConstructor = wrapper(function (dummy, data, typedArrayOffset, $length) {
		        anInstance(dummy, TypedArrayConstructorPrototype);
		        return inheritIfRequired(function () {
		          if (!isObject(data)) return new NativeTypedArrayConstructor(toIndex(data));
		          if (isArrayBuffer(data)) return $length !== undefined
		            ? new NativeTypedArrayConstructor(data, toOffset(typedArrayOffset, BYTES), $length)
		            : typedArrayOffset !== undefined
		              ? new NativeTypedArrayConstructor(data, toOffset(typedArrayOffset, BYTES))
		              : new NativeTypedArrayConstructor(data);
		          if (isTypedArray(data)) return arrayFromConstructorAndList(TypedArrayConstructor, data);
		          return call(typedArrayFrom, TypedArrayConstructor, data);
		        }(), dummy, TypedArrayConstructor);
		      });

		      if (setPrototypeOf) setPrototypeOf(TypedArrayConstructor, TypedArray);
		      forEach(getOwnPropertyNames(NativeTypedArrayConstructor), function (key) {
		        if (!(key in TypedArrayConstructor)) {
		          createNonEnumerableProperty(TypedArrayConstructor, key, NativeTypedArrayConstructor[key]);
		        }
		      });
		      TypedArrayConstructor.prototype = TypedArrayConstructorPrototype;
		    }

		    if (TypedArrayConstructorPrototype.constructor !== TypedArrayConstructor) {
		      createNonEnumerableProperty(TypedArrayConstructorPrototype, 'constructor', TypedArrayConstructor);
		    }

		    enforceInternalState(TypedArrayConstructorPrototype).TypedArrayConstructor = TypedArrayConstructor;

		    if (TYPED_ARRAY_TAG) {
		      createNonEnumerableProperty(TypedArrayConstructorPrototype, TYPED_ARRAY_TAG, CONSTRUCTOR_NAME);
		    }

		    var FORCED = TypedArrayConstructor !== NativeTypedArrayConstructor;

		    exported[CONSTRUCTOR_NAME] = TypedArrayConstructor;

		    $({ global: true, constructor: true, forced: FORCED, sham: !NATIVE_ARRAY_BUFFER_VIEWS }, exported);

		    if (!(BYTES_PER_ELEMENT in TypedArrayConstructor)) {
		      createNonEnumerableProperty(TypedArrayConstructor, BYTES_PER_ELEMENT, BYTES);
		    }

		    if (!(BYTES_PER_ELEMENT in TypedArrayConstructorPrototype)) {
		      createNonEnumerableProperty(TypedArrayConstructorPrototype, BYTES_PER_ELEMENT, BYTES);
		    }

		    setSpecies(CONSTRUCTOR_NAME);
		  };
		} else typedArrayConstructor.exports = function () { /* empty */ };
		return typedArrayConstructor.exports;
	}

	var hasRequiredEs_typedArray_uint8Array;

	function requireEs_typedArray_uint8Array () {
		if (hasRequiredEs_typedArray_uint8Array) return es_typedArray_uint8Array;
		hasRequiredEs_typedArray_uint8Array = 1;
		var createTypedArrayConstructor = requireTypedArrayConstructor();

		// `Uint8Array` constructor
		// https://tc39.es/ecma262/#sec-typedarray-objects
		createTypedArrayConstructor('Uint8', function (init) {
		  return function Uint8Array(data, byteOffset, length) {
		    return init(this, data, byteOffset, length);
		  };
		});
		return es_typedArray_uint8Array;
	}

	requireEs_typedArray_uint8Array();

	var es_typedArray_copyWithin = {};

	var arrayCopyWithin;
	var hasRequiredArrayCopyWithin;

	function requireArrayCopyWithin () {
		if (hasRequiredArrayCopyWithin) return arrayCopyWithin;
		hasRequiredArrayCopyWithin = 1;
		var toObject = requireToObject();
		var toAbsoluteIndex = requireToAbsoluteIndex();
		var lengthOfArrayLike = requireLengthOfArrayLike();
		var deletePropertyOrThrow = requireDeletePropertyOrThrow();

		var min = Math.min;

		// `Array.prototype.copyWithin` method implementation
		// https://tc39.es/ecma262/#sec-array.prototype.copywithin
		// eslint-disable-next-line es/no-array-prototype-copywithin -- safe
		arrayCopyWithin = [].copyWithin || function copyWithin(target /* = 0 */, start /* = 0, end = @length */) {
		  var O = toObject(this);
		  var len = lengthOfArrayLike(O);
		  var to = toAbsoluteIndex(target, len);
		  var from = toAbsoluteIndex(start, len);
		  var end = arguments.length > 2 ? arguments[2] : undefined;
		  var count = min((end === undefined ? len : toAbsoluteIndex(end, len)) - from, len - to);
		  var inc = 1;
		  if (from < to && to < from + count) {
		    inc = -1;
		    from += count - 1;
		    to += count - 1;
		  }
		  while (count-- > 0) {
		    if (from in O) O[to] = O[from];
		    else deletePropertyOrThrow(O, to);
		    to += inc;
		    from += inc;
		  } return O;
		};
		return arrayCopyWithin;
	}

	var hasRequiredEs_typedArray_copyWithin;

	function requireEs_typedArray_copyWithin () {
		if (hasRequiredEs_typedArray_copyWithin) return es_typedArray_copyWithin;
		hasRequiredEs_typedArray_copyWithin = 1;
		var uncurryThis = requireFunctionUncurryThis();
		var ArrayBufferViewCore = requireArrayBufferViewCore();
		var $ArrayCopyWithin = requireArrayCopyWithin();

		var u$ArrayCopyWithin = uncurryThis($ArrayCopyWithin);
		var aTypedArray = ArrayBufferViewCore.aTypedArray;
		var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;

		// `%TypedArray%.prototype.copyWithin` method
		// https://tc39.es/ecma262/#sec-%typedarray%.prototype.copywithin
		exportTypedArrayMethod('copyWithin', function copyWithin(target, start /* , end */) {
		  return u$ArrayCopyWithin(aTypedArray(this), target, start, arguments.length > 2 ? arguments[2] : undefined);
		});
		return es_typedArray_copyWithin;
	}

	requireEs_typedArray_copyWithin();

	var es_typedArray_every = {};

	var hasRequiredEs_typedArray_every;

	function requireEs_typedArray_every () {
		if (hasRequiredEs_typedArray_every) return es_typedArray_every;
		hasRequiredEs_typedArray_every = 1;
		var ArrayBufferViewCore = requireArrayBufferViewCore();
		var $every = requireArrayIteration().every;

		var aTypedArray = ArrayBufferViewCore.aTypedArray;
		var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;

		// `%TypedArray%.prototype.every` method
		// https://tc39.es/ecma262/#sec-%typedarray%.prototype.every
		exportTypedArrayMethod('every', function every(callbackfn /* , thisArg */) {
		  return $every(aTypedArray(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
		});
		return es_typedArray_every;
	}

	requireEs_typedArray_every();

	var es_typedArray_fill = {};

	var hasRequiredEs_typedArray_fill;

	function requireEs_typedArray_fill () {
		if (hasRequiredEs_typedArray_fill) return es_typedArray_fill;
		hasRequiredEs_typedArray_fill = 1;
		var ArrayBufferViewCore = requireArrayBufferViewCore();
		var $fill = requireArrayFill();
		var toBigInt = requireToBigInt();
		var classof = requireClassof();
		var call = requireFunctionCall();
		var uncurryThis = requireFunctionUncurryThis();
		var fails = requireFails();

		var aTypedArray = ArrayBufferViewCore.aTypedArray;
		var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;
		var slice = uncurryThis(''.slice);

		// V8 ~ Chrome < 59, Safari < 14.1, FF < 55, Edge <=18
		var CONVERSION_BUG = fails(function () {
		  var count = 0;
		  // eslint-disable-next-line es/no-typed-arrays -- safe
		  new Int8Array(2).fill({ valueOf: function () { return count++; } });
		  return count !== 1;
		});

		// `%TypedArray%.prototype.fill` method
		// https://tc39.es/ecma262/#sec-%typedarray%.prototype.fill
		exportTypedArrayMethod('fill', function fill(value /* , start, end */) {
		  var length = arguments.length;
		  aTypedArray(this);
		  var actualValue = slice(classof(this), 0, 3) === 'Big' ? toBigInt(value) : +value;
		  return call($fill, this, actualValue, length > 1 ? arguments[1] : undefined, length > 2 ? arguments[2] : undefined);
		}, CONVERSION_BUG);
		return es_typedArray_fill;
	}

	requireEs_typedArray_fill();

	var es_typedArray_filter = {};

	var typedArrayFromSameTypeAndList;
	var hasRequiredTypedArrayFromSameTypeAndList;

	function requireTypedArrayFromSameTypeAndList () {
		if (hasRequiredTypedArrayFromSameTypeAndList) return typedArrayFromSameTypeAndList;
		hasRequiredTypedArrayFromSameTypeAndList = 1;
		var arrayFromConstructorAndList = requireArrayFromConstructorAndList();
		var getTypedArrayConstructor = requireArrayBufferViewCore().getTypedArrayConstructor;

		typedArrayFromSameTypeAndList = function (instance, list) {
		  return arrayFromConstructorAndList(getTypedArrayConstructor(instance), list);
		};
		return typedArrayFromSameTypeAndList;
	}

	var hasRequiredEs_typedArray_filter;

	function requireEs_typedArray_filter () {
		if (hasRequiredEs_typedArray_filter) return es_typedArray_filter;
		hasRequiredEs_typedArray_filter = 1;
		var ArrayBufferViewCore = requireArrayBufferViewCore();
		var $filter = requireArrayIteration().filter;
		var fromSameTypeAndList = requireTypedArrayFromSameTypeAndList();

		var aTypedArray = ArrayBufferViewCore.aTypedArray;
		var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;

		// `%TypedArray%.prototype.filter` method
		// https://tc39.es/ecma262/#sec-%typedarray%.prototype.filter
		exportTypedArrayMethod('filter', function filter(callbackfn /* , thisArg */) {
		  var list = $filter(aTypedArray(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
		  return fromSameTypeAndList(this, list);
		});
		return es_typedArray_filter;
	}

	requireEs_typedArray_filter();

	var es_typedArray_find = {};

	var hasRequiredEs_typedArray_find;

	function requireEs_typedArray_find () {
		if (hasRequiredEs_typedArray_find) return es_typedArray_find;
		hasRequiredEs_typedArray_find = 1;
		var ArrayBufferViewCore = requireArrayBufferViewCore();
		var $find = requireArrayIteration().find;

		var aTypedArray = ArrayBufferViewCore.aTypedArray;
		var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;

		// `%TypedArray%.prototype.find` method
		// https://tc39.es/ecma262/#sec-%typedarray%.prototype.find
		exportTypedArrayMethod('find', function find(predicate /* , thisArg */) {
		  return $find(aTypedArray(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
		});
		return es_typedArray_find;
	}

	requireEs_typedArray_find();

	var es_typedArray_findIndex = {};

	var hasRequiredEs_typedArray_findIndex;

	function requireEs_typedArray_findIndex () {
		if (hasRequiredEs_typedArray_findIndex) return es_typedArray_findIndex;
		hasRequiredEs_typedArray_findIndex = 1;
		var ArrayBufferViewCore = requireArrayBufferViewCore();
		var $findIndex = requireArrayIteration().findIndex;

		var aTypedArray = ArrayBufferViewCore.aTypedArray;
		var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;

		// `%TypedArray%.prototype.findIndex` method
		// https://tc39.es/ecma262/#sec-%typedarray%.prototype.findindex
		exportTypedArrayMethod('findIndex', function findIndex(predicate /* , thisArg */) {
		  return $findIndex(aTypedArray(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
		});
		return es_typedArray_findIndex;
	}

	requireEs_typedArray_findIndex();

	var es_typedArray_forEach = {};

	var hasRequiredEs_typedArray_forEach;

	function requireEs_typedArray_forEach () {
		if (hasRequiredEs_typedArray_forEach) return es_typedArray_forEach;
		hasRequiredEs_typedArray_forEach = 1;
		var ArrayBufferViewCore = requireArrayBufferViewCore();
		var $forEach = requireArrayIteration().forEach;

		var aTypedArray = ArrayBufferViewCore.aTypedArray;
		var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;

		// `%TypedArray%.prototype.forEach` method
		// https://tc39.es/ecma262/#sec-%typedarray%.prototype.foreach
		exportTypedArrayMethod('forEach', function forEach(callbackfn /* , thisArg */) {
		  $forEach(aTypedArray(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
		});
		return es_typedArray_forEach;
	}

	requireEs_typedArray_forEach();

	var es_typedArray_includes = {};

	var hasRequiredEs_typedArray_includes;

	function requireEs_typedArray_includes () {
		if (hasRequiredEs_typedArray_includes) return es_typedArray_includes;
		hasRequiredEs_typedArray_includes = 1;
		var ArrayBufferViewCore = requireArrayBufferViewCore();
		var $includes = requireArrayIncludes().includes;

		var aTypedArray = ArrayBufferViewCore.aTypedArray;
		var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;

		// `%TypedArray%.prototype.includes` method
		// https://tc39.es/ecma262/#sec-%typedarray%.prototype.includes
		exportTypedArrayMethod('includes', function includes(searchElement /* , fromIndex */) {
		  return $includes(aTypedArray(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
		});
		return es_typedArray_includes;
	}

	requireEs_typedArray_includes();

	var es_typedArray_indexOf = {};

	var hasRequiredEs_typedArray_indexOf;

	function requireEs_typedArray_indexOf () {
		if (hasRequiredEs_typedArray_indexOf) return es_typedArray_indexOf;
		hasRequiredEs_typedArray_indexOf = 1;
		var ArrayBufferViewCore = requireArrayBufferViewCore();
		var $indexOf = requireArrayIncludes().indexOf;

		var aTypedArray = ArrayBufferViewCore.aTypedArray;
		var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;

		// `%TypedArray%.prototype.indexOf` method
		// https://tc39.es/ecma262/#sec-%typedarray%.prototype.indexof
		exportTypedArrayMethod('indexOf', function indexOf(searchElement /* , fromIndex */) {
		  return $indexOf(aTypedArray(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
		});
		return es_typedArray_indexOf;
	}

	requireEs_typedArray_indexOf();

	var es_typedArray_iterator = {};

	var hasRequiredEs_typedArray_iterator;

	function requireEs_typedArray_iterator () {
		if (hasRequiredEs_typedArray_iterator) return es_typedArray_iterator;
		hasRequiredEs_typedArray_iterator = 1;
		var globalThis = requireGlobalThis();
		var fails = requireFails();
		var uncurryThis = requireFunctionUncurryThis();
		var ArrayBufferViewCore = requireArrayBufferViewCore();
		var ArrayIterators = requireEs_array_iterator();
		var wellKnownSymbol = requireWellKnownSymbol();

		var ITERATOR = wellKnownSymbol('iterator');
		var Uint8Array = globalThis.Uint8Array;
		var arrayValues = uncurryThis(ArrayIterators.values);
		var arrayKeys = uncurryThis(ArrayIterators.keys);
		var arrayEntries = uncurryThis(ArrayIterators.entries);
		var aTypedArray = ArrayBufferViewCore.aTypedArray;
		var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;
		var TypedArrayPrototype = Uint8Array && Uint8Array.prototype;

		var GENERIC = !fails(function () {
		  TypedArrayPrototype[ITERATOR].call([1]);
		});

		var ITERATOR_IS_VALUES = !!TypedArrayPrototype
		  && TypedArrayPrototype.values
		  && TypedArrayPrototype[ITERATOR] === TypedArrayPrototype.values
		  && TypedArrayPrototype.values.name === 'values';

		var typedArrayValues = function values() {
		  return arrayValues(aTypedArray(this));
		};

		// `%TypedArray%.prototype.entries` method
		// https://tc39.es/ecma262/#sec-%typedarray%.prototype.entries
		exportTypedArrayMethod('entries', function entries() {
		  return arrayEntries(aTypedArray(this));
		}, GENERIC);
		// `%TypedArray%.prototype.keys` method
		// https://tc39.es/ecma262/#sec-%typedarray%.prototype.keys
		exportTypedArrayMethod('keys', function keys() {
		  return arrayKeys(aTypedArray(this));
		}, GENERIC);
		// `%TypedArray%.prototype.values` method
		// https://tc39.es/ecma262/#sec-%typedarray%.prototype.values
		exportTypedArrayMethod('values', typedArrayValues, GENERIC || !ITERATOR_IS_VALUES, { name: 'values' });
		// `%TypedArray%.prototype[@@iterator]` method
		// https://tc39.es/ecma262/#sec-%typedarray%.prototype-@@iterator
		exportTypedArrayMethod(ITERATOR, typedArrayValues, GENERIC || !ITERATOR_IS_VALUES, { name: 'values' });
		return es_typedArray_iterator;
	}

	requireEs_typedArray_iterator();

	var es_typedArray_join = {};

	var hasRequiredEs_typedArray_join;

	function requireEs_typedArray_join () {
		if (hasRequiredEs_typedArray_join) return es_typedArray_join;
		hasRequiredEs_typedArray_join = 1;
		var ArrayBufferViewCore = requireArrayBufferViewCore();
		var uncurryThis = requireFunctionUncurryThis();

		var aTypedArray = ArrayBufferViewCore.aTypedArray;
		var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;
		var $join = uncurryThis([].join);

		// `%TypedArray%.prototype.join` method
		// https://tc39.es/ecma262/#sec-%typedarray%.prototype.join
		exportTypedArrayMethod('join', function join(separator) {
		  return $join(aTypedArray(this), separator);
		});
		return es_typedArray_join;
	}

	requireEs_typedArray_join();

	var es_typedArray_lastIndexOf = {};

	var arrayLastIndexOf;
	var hasRequiredArrayLastIndexOf;

	function requireArrayLastIndexOf () {
		if (hasRequiredArrayLastIndexOf) return arrayLastIndexOf;
		hasRequiredArrayLastIndexOf = 1;
		/* eslint-disable es/no-array-prototype-lastindexof -- safe */
		var apply = requireFunctionApply();
		var toIndexedObject = requireToIndexedObject();
		var toIntegerOrInfinity = requireToIntegerOrInfinity();
		var lengthOfArrayLike = requireLengthOfArrayLike();
		var arrayMethodIsStrict = requireArrayMethodIsStrict();

		var min = Math.min;
		var $lastIndexOf = [].lastIndexOf;
		var NEGATIVE_ZERO = !!$lastIndexOf && 1 / [1].lastIndexOf(1, -0) < 0;
		var STRICT_METHOD = arrayMethodIsStrict('lastIndexOf');
		var FORCED = NEGATIVE_ZERO || !STRICT_METHOD;

		// `Array.prototype.lastIndexOf` method implementation
		// https://tc39.es/ecma262/#sec-array.prototype.lastindexof
		arrayLastIndexOf = FORCED ? function lastIndexOf(searchElement /* , fromIndex = @[*-1] */) {
		  // convert -0 to +0
		  if (NEGATIVE_ZERO) return apply($lastIndexOf, this, arguments) || 0;
		  var O = toIndexedObject(this);
		  var length = lengthOfArrayLike(O);
		  if (length === 0) return -1;
		  var index = length - 1;
		  if (arguments.length > 1) index = min(index, toIntegerOrInfinity(arguments[1]));
		  if (index < 0) index = length + index;
		  for (;index >= 0; index--) if (index in O && O[index] === searchElement) return index || 0;
		  return -1;
		} : $lastIndexOf;
		return arrayLastIndexOf;
	}

	var hasRequiredEs_typedArray_lastIndexOf;

	function requireEs_typedArray_lastIndexOf () {
		if (hasRequiredEs_typedArray_lastIndexOf) return es_typedArray_lastIndexOf;
		hasRequiredEs_typedArray_lastIndexOf = 1;
		var ArrayBufferViewCore = requireArrayBufferViewCore();
		var apply = requireFunctionApply();
		var $lastIndexOf = requireArrayLastIndexOf();

		var aTypedArray = ArrayBufferViewCore.aTypedArray;
		var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;

		// `%TypedArray%.prototype.lastIndexOf` method
		// https://tc39.es/ecma262/#sec-%typedarray%.prototype.lastindexof
		exportTypedArrayMethod('lastIndexOf', function lastIndexOf(searchElement /* , fromIndex */) {
		  var length = arguments.length;
		  return apply($lastIndexOf, aTypedArray(this), length > 1 ? [searchElement, arguments[1]] : [searchElement]);
		});
		return es_typedArray_lastIndexOf;
	}

	requireEs_typedArray_lastIndexOf();

	var es_typedArray_map = {};

	var hasRequiredEs_typedArray_map;

	function requireEs_typedArray_map () {
		if (hasRequiredEs_typedArray_map) return es_typedArray_map;
		hasRequiredEs_typedArray_map = 1;
		var ArrayBufferViewCore = requireArrayBufferViewCore();
		var $map = requireArrayIteration().map;
		var fromSameTypeAndList = requireTypedArrayFromSameTypeAndList();

		var aTypedArray = ArrayBufferViewCore.aTypedArray;
		var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;

		// `%TypedArray%.prototype.map` method
		// https://tc39.es/ecma262/#sec-%typedarray%.prototype.map
		exportTypedArrayMethod('map', function map(mapfn /* , thisArg */) {
		  var list = $map(aTypedArray(this), mapfn, arguments.length > 1 ? arguments[1] : undefined);
		  return fromSameTypeAndList(this, list);
		});
		return es_typedArray_map;
	}

	requireEs_typedArray_map();

	var es_typedArray_reduce = {};

	var arrayReduce;
	var hasRequiredArrayReduce;

	function requireArrayReduce () {
		if (hasRequiredArrayReduce) return arrayReduce;
		hasRequiredArrayReduce = 1;
		var aCallable = requireACallable();
		var toObject = requireToObject();
		var IndexedObject = requireIndexedObject();
		var lengthOfArrayLike = requireLengthOfArrayLike();

		var $TypeError = TypeError;

		var REDUCE_EMPTY = 'Reduce of empty array with no initial value';

		// `Array.prototype.{ reduce, reduceRight }` methods implementation
		var createMethod = function (IS_RIGHT) {
		  return function (that, callbackfn, argumentsLength, memo) {
		    var O = toObject(that);
		    var self = IndexedObject(O);
		    var length = lengthOfArrayLike(O);
		    aCallable(callbackfn);
		    if (length === 0 && argumentsLength < 2) throw new $TypeError(REDUCE_EMPTY);
		    var index = IS_RIGHT ? length - 1 : 0;
		    var i = IS_RIGHT ? -1 : 1;
		    if (argumentsLength < 2) while (true) {
		      if (index in self) {
		        memo = self[index];
		        index += i;
		        break;
		      }
		      index += i;
		      if (IS_RIGHT ? index < 0 : length <= index) {
		        throw new $TypeError(REDUCE_EMPTY);
		      }
		    }
		    for (;IS_RIGHT ? index >= 0 : length > index; index += i) if (index in self) {
		      memo = callbackfn(memo, self[index], index, O);
		    }
		    return memo;
		  };
		};

		arrayReduce = {
		  // `Array.prototype.reduce` method
		  // https://tc39.es/ecma262/#sec-array.prototype.reduce
		  left: createMethod(false),
		  // `Array.prototype.reduceRight` method
		  // https://tc39.es/ecma262/#sec-array.prototype.reduceright
		  right: createMethod(true)
		};
		return arrayReduce;
	}

	var hasRequiredEs_typedArray_reduce;

	function requireEs_typedArray_reduce () {
		if (hasRequiredEs_typedArray_reduce) return es_typedArray_reduce;
		hasRequiredEs_typedArray_reduce = 1;
		var ArrayBufferViewCore = requireArrayBufferViewCore();
		var $reduce = requireArrayReduce().left;

		var aTypedArray = ArrayBufferViewCore.aTypedArray;
		var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;

		// `%TypedArray%.prototype.reduce` method
		// https://tc39.es/ecma262/#sec-%typedarray%.prototype.reduce
		exportTypedArrayMethod('reduce', function reduce(callbackfn /* , initialValue */) {
		  var length = arguments.length;
		  return $reduce(aTypedArray(this), callbackfn, length, length > 1 ? arguments[1] : undefined);
		});
		return es_typedArray_reduce;
	}

	requireEs_typedArray_reduce();

	var es_typedArray_reduceRight = {};

	var hasRequiredEs_typedArray_reduceRight;

	function requireEs_typedArray_reduceRight () {
		if (hasRequiredEs_typedArray_reduceRight) return es_typedArray_reduceRight;
		hasRequiredEs_typedArray_reduceRight = 1;
		var ArrayBufferViewCore = requireArrayBufferViewCore();
		var $reduceRight = requireArrayReduce().right;

		var aTypedArray = ArrayBufferViewCore.aTypedArray;
		var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;

		// `%TypedArray%.prototype.reduceRight` method
		// https://tc39.es/ecma262/#sec-%typedarray%.prototype.reduceright
		exportTypedArrayMethod('reduceRight', function reduceRight(callbackfn /* , initialValue */) {
		  var length = arguments.length;
		  return $reduceRight(aTypedArray(this), callbackfn, length, length > 1 ? arguments[1] : undefined);
		});
		return es_typedArray_reduceRight;
	}

	requireEs_typedArray_reduceRight();

	var es_typedArray_reverse = {};

	var hasRequiredEs_typedArray_reverse;

	function requireEs_typedArray_reverse () {
		if (hasRequiredEs_typedArray_reverse) return es_typedArray_reverse;
		hasRequiredEs_typedArray_reverse = 1;
		var ArrayBufferViewCore = requireArrayBufferViewCore();

		var aTypedArray = ArrayBufferViewCore.aTypedArray;
		var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;
		var floor = Math.floor;

		// `%TypedArray%.prototype.reverse` method
		// https://tc39.es/ecma262/#sec-%typedarray%.prototype.reverse
		exportTypedArrayMethod('reverse', function reverse() {
		  var that = this;
		  var length = aTypedArray(that).length;
		  var middle = floor(length / 2);
		  var index = 0;
		  var value;
		  while (index < middle) {
		    value = that[index];
		    that[index++] = that[--length];
		    that[length] = value;
		  } return that;
		});
		return es_typedArray_reverse;
	}

	requireEs_typedArray_reverse();

	var es_typedArray_set = {};

	var hasRequiredEs_typedArray_set;

	function requireEs_typedArray_set () {
		if (hasRequiredEs_typedArray_set) return es_typedArray_set;
		hasRequiredEs_typedArray_set = 1;
		var globalThis = requireGlobalThis();
		var call = requireFunctionCall();
		var ArrayBufferViewCore = requireArrayBufferViewCore();
		var lengthOfArrayLike = requireLengthOfArrayLike();
		var toOffset = requireToOffset();
		var toIndexedObject = requireToObject();
		var fails = requireFails();

		var RangeError = globalThis.RangeError;
		var Int8Array = globalThis.Int8Array;
		var Int8ArrayPrototype = Int8Array && Int8Array.prototype;
		var $set = Int8ArrayPrototype && Int8ArrayPrototype.set;
		var aTypedArray = ArrayBufferViewCore.aTypedArray;
		var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;

		var WORKS_WITH_OBJECTS_AND_GENERIC_ON_TYPED_ARRAYS = !fails(function () {
		  // eslint-disable-next-line es/no-typed-arrays -- required for testing
		  var array = new Uint8ClampedArray(2);
		  call($set, array, { length: 1, 0: 3 }, 1);
		  return array[1] !== 3;
		});

		// https://bugs.chromium.org/p/v8/issues/detail?id=11294 and other
		var TO_OBJECT_BUG = WORKS_WITH_OBJECTS_AND_GENERIC_ON_TYPED_ARRAYS && ArrayBufferViewCore.NATIVE_ARRAY_BUFFER_VIEWS && fails(function () {
		  var array = new Int8Array(2);
		  array.set(1);
		  array.set('2', 1);
		  return array[0] !== 0 || array[1] !== 2;
		});

		// `%TypedArray%.prototype.set` method
		// https://tc39.es/ecma262/#sec-%typedarray%.prototype.set
		exportTypedArrayMethod('set', function set(arrayLike /* , offset */) {
		  aTypedArray(this);
		  var offset = toOffset(arguments.length > 1 ? arguments[1] : undefined, 1);
		  var src = toIndexedObject(arrayLike);
		  if (WORKS_WITH_OBJECTS_AND_GENERIC_ON_TYPED_ARRAYS) return call($set, this, src, offset);
		  var length = this.length;
		  var len = lengthOfArrayLike(src);
		  var index = 0;
		  if (len + offset > length) throw new RangeError('Wrong length');
		  while (index < len) this[offset + index] = src[index++];
		}, !WORKS_WITH_OBJECTS_AND_GENERIC_ON_TYPED_ARRAYS || TO_OBJECT_BUG);
		return es_typedArray_set;
	}

	requireEs_typedArray_set();

	var es_typedArray_slice = {};

	var hasRequiredEs_typedArray_slice;

	function requireEs_typedArray_slice () {
		if (hasRequiredEs_typedArray_slice) return es_typedArray_slice;
		hasRequiredEs_typedArray_slice = 1;
		var ArrayBufferViewCore = requireArrayBufferViewCore();
		var fails = requireFails();
		var arraySlice = requireArraySlice();

		var aTypedArray = ArrayBufferViewCore.aTypedArray;
		var getTypedArrayConstructor = ArrayBufferViewCore.getTypedArrayConstructor;
		var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;

		var FORCED = fails(function () {
		  // eslint-disable-next-line es/no-typed-arrays -- required for testing
		  new Int8Array(1).slice();
		});

		// `%TypedArray%.prototype.slice` method
		// https://tc39.es/ecma262/#sec-%typedarray%.prototype.slice
		exportTypedArrayMethod('slice', function slice(start, end) {
		  var list = arraySlice(aTypedArray(this), start, end);
		  var C = getTypedArrayConstructor(this);
		  var index = 0;
		  var length = list.length;
		  var result = new C(length);
		  while (length > index) result[index] = list[index++];
		  return result;
		}, FORCED);
		return es_typedArray_slice;
	}

	requireEs_typedArray_slice();

	var es_typedArray_some = {};

	var hasRequiredEs_typedArray_some;

	function requireEs_typedArray_some () {
		if (hasRequiredEs_typedArray_some) return es_typedArray_some;
		hasRequiredEs_typedArray_some = 1;
		var ArrayBufferViewCore = requireArrayBufferViewCore();
		var $some = requireArrayIteration().some;

		var aTypedArray = ArrayBufferViewCore.aTypedArray;
		var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;

		// `%TypedArray%.prototype.some` method
		// https://tc39.es/ecma262/#sec-%typedarray%.prototype.some
		exportTypedArrayMethod('some', function some(callbackfn /* , thisArg */) {
		  return $some(aTypedArray(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
		});
		return es_typedArray_some;
	}

	requireEs_typedArray_some();

	var es_typedArray_sort = {};

	var arraySort;
	var hasRequiredArraySort;

	function requireArraySort () {
		if (hasRequiredArraySort) return arraySort;
		hasRequiredArraySort = 1;
		var arraySlice = requireArraySlice();

		var floor = Math.floor;

		var sort = function (array, comparefn) {
		  var length = array.length;

		  if (length < 8) {
		    // insertion sort
		    var i = 1;
		    var element, j;

		    while (i < length) {
		      j = i;
		      element = array[i];
		      while (j && comparefn(array[j - 1], element) > 0) {
		        array[j] = array[--j];
		      }
		      if (j !== i++) array[j] = element;
		    }
		  } else {
		    // merge sort
		    var middle = floor(length / 2);
		    var left = sort(arraySlice(array, 0, middle), comparefn);
		    var right = sort(arraySlice(array, middle), comparefn);
		    var llength = left.length;
		    var rlength = right.length;
		    var lindex = 0;
		    var rindex = 0;

		    while (lindex < llength || rindex < rlength) {
		      array[lindex + rindex] = (lindex < llength && rindex < rlength)
		        ? comparefn(left[lindex], right[rindex]) <= 0 ? left[lindex++] : right[rindex++]
		        : lindex < llength ? left[lindex++] : right[rindex++];
		    }
		  }

		  return array;
		};

		arraySort = sort;
		return arraySort;
	}

	var environmentFfVersion;
	var hasRequiredEnvironmentFfVersion;

	function requireEnvironmentFfVersion () {
		if (hasRequiredEnvironmentFfVersion) return environmentFfVersion;
		hasRequiredEnvironmentFfVersion = 1;
		var userAgent = requireEnvironmentUserAgent();

		var firefox = userAgent.match(/firefox\/(\d+)/i);

		environmentFfVersion = !!firefox && +firefox[1];
		return environmentFfVersion;
	}

	var environmentIsIeOrEdge;
	var hasRequiredEnvironmentIsIeOrEdge;

	function requireEnvironmentIsIeOrEdge () {
		if (hasRequiredEnvironmentIsIeOrEdge) return environmentIsIeOrEdge;
		hasRequiredEnvironmentIsIeOrEdge = 1;
		var UA = requireEnvironmentUserAgent();

		environmentIsIeOrEdge = /MSIE|Trident/.test(UA);
		return environmentIsIeOrEdge;
	}

	var environmentWebkitVersion;
	var hasRequiredEnvironmentWebkitVersion;

	function requireEnvironmentWebkitVersion () {
		if (hasRequiredEnvironmentWebkitVersion) return environmentWebkitVersion;
		hasRequiredEnvironmentWebkitVersion = 1;
		var userAgent = requireEnvironmentUserAgent();

		var webkit = userAgent.match(/AppleWebKit\/(\d+)\./);

		environmentWebkitVersion = !!webkit && +webkit[1];
		return environmentWebkitVersion;
	}

	var hasRequiredEs_typedArray_sort;

	function requireEs_typedArray_sort () {
		if (hasRequiredEs_typedArray_sort) return es_typedArray_sort;
		hasRequiredEs_typedArray_sort = 1;
		var globalThis = requireGlobalThis();
		var uncurryThis = requireFunctionUncurryThisClause();
		var fails = requireFails();
		var aCallable = requireACallable();
		var internalSort = requireArraySort();
		var ArrayBufferViewCore = requireArrayBufferViewCore();
		var FF = requireEnvironmentFfVersion();
		var IE_OR_EDGE = requireEnvironmentIsIeOrEdge();
		var V8 = requireEnvironmentV8Version();
		var WEBKIT = requireEnvironmentWebkitVersion();

		var aTypedArray = ArrayBufferViewCore.aTypedArray;
		var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;
		var Uint16Array = globalThis.Uint16Array;
		var nativeSort = Uint16Array && uncurryThis(Uint16Array.prototype.sort);

		// WebKit
		var ACCEPT_INCORRECT_ARGUMENTS = !!nativeSort && !(fails(function () {
		  nativeSort(new Uint16Array(2), null);
		}) && fails(function () {
		  nativeSort(new Uint16Array(2), {});
		}));

		var STABLE_SORT = !!nativeSort && !fails(function () {
		  // feature detection can be too slow, so check engines versions
		  if (V8) return V8 < 74;
		  if (FF) return FF < 67;
		  if (IE_OR_EDGE) return true;
		  if (WEBKIT) return WEBKIT < 602;

		  var array = new Uint16Array(516);
		  var expected = Array(516);
		  var index, mod;

		  for (index = 0; index < 516; index++) {
		    mod = index % 4;
		    array[index] = 515 - index;
		    expected[index] = index - 2 * mod + 3;
		  }

		  nativeSort(array, function (a, b) {
		    return (a / 4 | 0) - (b / 4 | 0);
		  });

		  for (index = 0; index < 516; index++) {
		    if (array[index] !== expected[index]) return true;
		  }
		});

		var getSortCompare = function (comparefn) {
		  return function (x, y) {
		    if (comparefn !== undefined) return +comparefn(x, y) || 0;
		    // eslint-disable-next-line no-self-compare -- NaN check
		    if (y !== y) return x !== x ? 0 : -1;
		    // eslint-disable-next-line no-self-compare -- NaN check
		    if (x !== x) return 1;
		    if (x === 0 && y === 0) return 1 / x > 0 ? (1 / y > 0 ? 0 : 1) : (1 / y > 0 ? -1 : 0);
		    return x > y ? 1 : x < y ? -1 : 0;
		  };
		};

		// `%TypedArray%.prototype.sort` method
		// https://tc39.es/ecma262/#sec-%typedarray%.prototype.sort
		exportTypedArrayMethod('sort', function sort(comparefn) {
		  if (comparefn !== undefined) aCallable(comparefn);
		  if (STABLE_SORT) return nativeSort(this, comparefn);

		  return internalSort(aTypedArray(this), getSortCompare(comparefn));
		}, !STABLE_SORT || ACCEPT_INCORRECT_ARGUMENTS);
		return es_typedArray_sort;
	}

	requireEs_typedArray_sort();

	var es_typedArray_toLocaleString = {};

	var hasRequiredEs_typedArray_toLocaleString;

	function requireEs_typedArray_toLocaleString () {
		if (hasRequiredEs_typedArray_toLocaleString) return es_typedArray_toLocaleString;
		hasRequiredEs_typedArray_toLocaleString = 1;
		var globalThis = requireGlobalThis();
		var apply = requireFunctionApply();
		var ArrayBufferViewCore = requireArrayBufferViewCore();
		var fails = requireFails();
		var arraySlice = requireArraySlice();

		var Int8Array = globalThis.Int8Array;
		var aTypedArray = ArrayBufferViewCore.aTypedArray;
		var exportTypedArrayMethod = ArrayBufferViewCore.exportTypedArrayMethod;
		var $toLocaleString = [].toLocaleString;

		// iOS Safari 6.x fails here
		var TO_LOCALE_STRING_BUG = !!Int8Array && fails(function () {
		  $toLocaleString.call(new Int8Array(1));
		});

		var FORCED = fails(function () {
		  return [1, 2].toLocaleString() !== new Int8Array([1, 2]).toLocaleString();
		}) || !fails(function () {
		  Int8Array.prototype.toLocaleString.call([1, 2]);
		});

		// `%TypedArray%.prototype.toLocaleString` method
		// https://tc39.es/ecma262/#sec-%typedarray%.prototype.tolocalestring
		exportTypedArrayMethod('toLocaleString', function toLocaleString() {
		  return apply(
		    $toLocaleString,
		    TO_LOCALE_STRING_BUG ? arraySlice(aTypedArray(this)) : aTypedArray(this),
		    arraySlice(arguments)
		  );
		}, FORCED);
		return es_typedArray_toLocaleString;
	}

	requireEs_typedArray_toLocaleString();

	var es_typedArray_toString = {};

	var hasRequiredEs_typedArray_toString;

	function requireEs_typedArray_toString () {
		if (hasRequiredEs_typedArray_toString) return es_typedArray_toString;
		hasRequiredEs_typedArray_toString = 1;
		var exportTypedArrayMethod = requireArrayBufferViewCore().exportTypedArrayMethod;
		var fails = requireFails();
		var globalThis = requireGlobalThis();
		var uncurryThis = requireFunctionUncurryThis();

		var Uint8Array = globalThis.Uint8Array;
		var Uint8ArrayPrototype = Uint8Array && Uint8Array.prototype || {};
		var arrayToString = [].toString;
		var join = uncurryThis([].join);

		if (fails(function () { arrayToString.call({}); })) {
		  arrayToString = function toString() {
		    return join(this);
		  };
		}

		var IS_NOT_ARRAY_METHOD = Uint8ArrayPrototype.toString !== arrayToString;

		// `%TypedArray%.prototype.toString` method
		// https://tc39.es/ecma262/#sec-%typedarray%.prototype.tostring
		exportTypedArrayMethod('toString', arrayToString, IS_NOT_ARRAY_METHOD);
		return es_typedArray_toString;
	}

	requireEs_typedArray_toString();

	function _typeof$8(o) { "@babel/helpers - typeof"; return _typeof$8 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof$8(o); }
	function _createClass$8(Constructor, protoProps, staticProps) { Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
	function _classCallCheck$8(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	function _callSuper$1(t, o, e) { return o = _getPrototypeOf$1(o), _possibleConstructorReturn$1(t, _isNativeReflectConstruct$1() ? Reflect.construct(o, e || [], _getPrototypeOf$1(t).constructor) : o.apply(t, e)); }
	function _possibleConstructorReturn$1(self, call) { if (call && (_typeof$8(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized$1(self); }
	function _assertThisInitialized$1(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
	function _inherits$1(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf$1(subClass, superClass); }
	function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf$1(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf$1(Wrapper, Class); }; return _wrapNativeSuper(Class); }
	function _construct(t, e, r) { if (_isNativeReflectConstruct$1()) return Reflect.construct.apply(null, arguments); var o = [null]; o.push.apply(o, e); var p = new (t.bind.apply(t, o))(); return r && _setPrototypeOf$1(p, r.prototype), p; }
	function _isNativeReflectConstruct$1() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct$1 = function _isNativeReflectConstruct() { return !!t; })(); }
	function _isNativeFunction(fn) { try { return Function.toString.call(fn).indexOf("[native code]") !== -1; } catch (e) { return typeof fn === "function"; } }
	function _setPrototypeOf$1(o, p) { _setPrototypeOf$1 = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf$1(o, p); }
	function _getPrototypeOf$1(o) { _getPrototypeOf$1 = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf$1(o); }
	var DetailedError = /*#__PURE__*/function (_Error) {
	  function DetailedError(message) {
	    var _this;
	    var causingErr = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
	    var req = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
	    var res = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
	    _classCallCheck$8(this, DetailedError);
	    _this = _callSuper$1(this, DetailedError, [message]);
	    _this.originalRequest = req;
	    _this.originalResponse = res;
	    _this.causingError = causingErr;
	    if (causingErr != null) {
	      message += ", caused by ".concat(causingErr.toString());
	    }
	    if (req != null) {
	      var requestId = req.getHeader('X-Request-ID') || 'n/a';
	      var method = req.getMethod();
	      var url = req.getURL();
	      var status = res ? res.getStatus() : 'n/a';
	      var body = res ? res.getBody() || '' : 'n/a';
	      message += ", originated from request (method: ".concat(method, ", url: ").concat(url, ", response code: ").concat(status, ", response text: ").concat(body, ", request id: ").concat(requestId, ")");
	    }
	    _this.message = message;
	    return _this;
	  }
	  _inherits$1(DetailedError, _Error);
	  return _createClass$8(DetailedError);
	}( /*#__PURE__*/_wrapNativeSuper(Error));

	function log(msg) {
	  return;
	}

	function _typeof$7(o) { "@babel/helpers - typeof"; return _typeof$7 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof$7(o); }
	function _classCallCheck$7(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	function _defineProperties$7(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey$7(descriptor.key), descriptor); } }
	function _createClass$7(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties$7(Constructor.prototype, protoProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
	function _toPropertyKey$7(t) { var i = _toPrimitive$7(t, "string"); return "symbol" == _typeof$7(i) ? i : i + ""; }
	function _toPrimitive$7(t, r) { if ("object" != _typeof$7(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r); if ("object" != _typeof$7(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return (String )(t); }
	var NoopUrlStorage = /*#__PURE__*/function () {
	  function NoopUrlStorage() {
	    _classCallCheck$7(this, NoopUrlStorage);
	  }
	  return _createClass$7(NoopUrlStorage, [{
	    key: "listAllUploads",
	    value: function listAllUploads() {
	      return Promise.resolve([]);
	    }
	  }, {
	    key: "findUploadsByFingerprint",
	    value: function findUploadsByFingerprint(_fingerprint) {
	      return Promise.resolve([]);
	    }
	  }, {
	    key: "removeUpload",
	    value: function removeUpload(_urlStorageKey) {
	      return Promise.resolve();
	    }
	  }, {
	    key: "addUpload",
	    value: function addUpload(_fingerprint, _upload) {
	      return Promise.resolve(null);
	    }
	  }]);
	}();

	/**
	 *  base64.ts
	 *
	 *  Licensed under the BSD 3-Clause License.
	 *    http://opensource.org/licenses/BSD-3-Clause
	 *
	 *  References:
	 *    http://en.wikipedia.org/wiki/Base64
	 *
	 * @author Dan Kogai (https://github.com/dankogai)
	 */
	const version = '3.7.8';
	/**
	 * @deprecated use lowercase `version`.
	 */
	const VERSION = version;
	const _hasBuffer = typeof Buffer === 'function';
	const _TD = typeof TextDecoder === 'function' ? new TextDecoder() : undefined;
	const _TE = typeof TextEncoder === 'function' ? new TextEncoder() : undefined;
	const b64ch = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
	const b64chs = Array.prototype.slice.call(b64ch);
	const b64tab = ((a) => {
	    let tab = {};
	    a.forEach((c, i) => tab[c] = i);
	    return tab;
	})(b64chs);
	const b64re = /^(?:[A-Za-z\d+\/]{4})*?(?:[A-Za-z\d+\/]{2}(?:==)?|[A-Za-z\d+\/]{3}=?)?$/;
	const _fromCC = String.fromCharCode.bind(String);
	const _U8Afrom = typeof Uint8Array.from === 'function'
	    ? Uint8Array.from.bind(Uint8Array)
	    : (it) => new Uint8Array(Array.prototype.slice.call(it, 0));
	const _mkUriSafe = (src) => src
	    .replace(/=/g, '').replace(/[+\/]/g, (m0) => m0 == '+' ? '-' : '_');
	const _tidyB64 = (s) => s.replace(/[^A-Za-z0-9\+\/]/g, '');
	/**
	 * polyfill version of `btoa`
	 */
	const btoaPolyfill = (bin) => {
	    // console.log('polyfilled');
	    let u32, c0, c1, c2, asc = '';
	    const pad = bin.length % 3;
	    for (let i = 0; i < bin.length;) {
	        if ((c0 = bin.charCodeAt(i++)) > 255 ||
	            (c1 = bin.charCodeAt(i++)) > 255 ||
	            (c2 = bin.charCodeAt(i++)) > 255)
	            throw new TypeError('invalid character found');
	        u32 = (c0 << 16) | (c1 << 8) | c2;
	        asc += b64chs[u32 >> 18 & 63]
	            + b64chs[u32 >> 12 & 63]
	            + b64chs[u32 >> 6 & 63]
	            + b64chs[u32 & 63];
	    }
	    return pad ? asc.slice(0, pad - 3) + "===".substring(pad) : asc;
	};
	/**
	 * does what `window.btoa` of web browsers do.
	 * @param {String} bin binary string
	 * @returns {string} Base64-encoded string
	 */
	const _btoa = typeof btoa === 'function' ? (bin) => btoa(bin)
	    : _hasBuffer ? (bin) => Buffer.from(bin, 'binary').toString('base64')
	        : btoaPolyfill;
	const _fromUint8Array = _hasBuffer
	    ? (u8a) => Buffer.from(u8a).toString('base64')
	    : (u8a) => {
	        // cf. https://stackoverflow.com/questions/12710001/how-to-convert-uint8-array-to-base64-encoded-string/12713326#12713326
	        const maxargs = 0x1000;
	        let strs = [];
	        for (let i = 0, l = u8a.length; i < l; i += maxargs) {
	            strs.push(_fromCC.apply(null, u8a.subarray(i, i + maxargs)));
	        }
	        return _btoa(strs.join(''));
	    };
	/**
	 * converts a Uint8Array to a Base64 string.
	 * @param {boolean} [urlsafe] URL-and-filename-safe a la RFC4648 §5
	 * @returns {string} Base64 string
	 */
	const fromUint8Array = (u8a, urlsafe = false) => urlsafe ? _mkUriSafe(_fromUint8Array(u8a)) : _fromUint8Array(u8a);
	// This trick is found broken https://github.com/dankogai/js-base64/issues/130
	// const utob = (src: string) => unescape(encodeURIComponent(src));
	// reverting good old fationed regexp
	const cb_utob = (c) => {
	    if (c.length < 2) {
	        var cc = c.charCodeAt(0);
	        return cc < 0x80 ? c
	            : cc < 0x800 ? (_fromCC(0xc0 | (cc >>> 6))
	                + _fromCC(0x80 | (cc & 0x3f)))
	                : (_fromCC(0xe0 | ((cc >>> 12) & 0x0f))
	                    + _fromCC(0x80 | ((cc >>> 6) & 0x3f))
	                    + _fromCC(0x80 | (cc & 0x3f)));
	    }
	    else {
	        var cc = 0x10000
	            + (c.charCodeAt(0) - 0xD800) * 0x400
	            + (c.charCodeAt(1) - 0xDC00);
	        return (_fromCC(0xf0 | ((cc >>> 18) & 0x07))
	            + _fromCC(0x80 | ((cc >>> 12) & 0x3f))
	            + _fromCC(0x80 | ((cc >>> 6) & 0x3f))
	            + _fromCC(0x80 | (cc & 0x3f)));
	    }
	};
	const re_utob = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g;
	/**
	 * @deprecated should have been internal use only.
	 * @param {string} src UTF-8 string
	 * @returns {string} UTF-16 string
	 */
	const utob = (u) => u.replace(re_utob, cb_utob);
	//
	const _encode = _hasBuffer
	    ? (s) => Buffer.from(s, 'utf8').toString('base64')
	    : _TE
	        ? (s) => _fromUint8Array(_TE.encode(s))
	        : (s) => _btoa(utob(s));
	/**
	 * converts a UTF-8-encoded string to a Base64 string.
	 * @param {boolean} [urlsafe] if `true` make the result URL-safe
	 * @returns {string} Base64 string
	 */
	const encode = (src, urlsafe = false) => urlsafe
	    ? _mkUriSafe(_encode(src))
	    : _encode(src);
	/**
	 * converts a UTF-8-encoded string to URL-safe Base64 RFC4648 §5.
	 * @returns {string} Base64 string
	 */
	const encodeURI = (src) => encode(src, true);
	// This trick is found broken https://github.com/dankogai/js-base64/issues/130
	// const btou = (src: string) => decodeURIComponent(escape(src));
	// reverting good old fationed regexp
	const re_btou = /[\xC0-\xDF][\x80-\xBF]|[\xE0-\xEF][\x80-\xBF]{2}|[\xF0-\xF7][\x80-\xBF]{3}/g;
	const cb_btou = (cccc) => {
	    switch (cccc.length) {
	        case 4:
	            var cp = ((0x07 & cccc.charCodeAt(0)) << 18)
	                | ((0x3f & cccc.charCodeAt(1)) << 12)
	                | ((0x3f & cccc.charCodeAt(2)) << 6)
	                | (0x3f & cccc.charCodeAt(3)), offset = cp - 0x10000;
	            return (_fromCC((offset >>> 10) + 0xD800)
	                + _fromCC((offset & 0x3FF) + 0xDC00));
	        case 3:
	            return _fromCC(((0x0f & cccc.charCodeAt(0)) << 12)
	                | ((0x3f & cccc.charCodeAt(1)) << 6)
	                | (0x3f & cccc.charCodeAt(2)));
	        default:
	            return _fromCC(((0x1f & cccc.charCodeAt(0)) << 6)
	                | (0x3f & cccc.charCodeAt(1)));
	    }
	};
	/**
	 * @deprecated should have been internal use only.
	 * @param {string} src UTF-16 string
	 * @returns {string} UTF-8 string
	 */
	const btou = (b) => b.replace(re_btou, cb_btou);
	/**
	 * polyfill version of `atob`
	 */
	const atobPolyfill = (asc) => {
	    // console.log('polyfilled');
	    asc = asc.replace(/\s+/g, '');
	    if (!b64re.test(asc))
	        throw new TypeError('malformed base64.');
	    asc += '=='.slice(2 - (asc.length & 3));
	    let u24, r1, r2;
	    let binArray = []; // use array to avoid minor gc in loop
	    for (let i = 0; i < asc.length;) {
	        u24 = b64tab[asc.charAt(i++)] << 18
	            | b64tab[asc.charAt(i++)] << 12
	            | (r1 = b64tab[asc.charAt(i++)]) << 6
	            | (r2 = b64tab[asc.charAt(i++)]);
	        if (r1 === 64) {
	            binArray.push(_fromCC(u24 >> 16 & 255));
	        }
	        else if (r2 === 64) {
	            binArray.push(_fromCC(u24 >> 16 & 255, u24 >> 8 & 255));
	        }
	        else {
	            binArray.push(_fromCC(u24 >> 16 & 255, u24 >> 8 & 255, u24 & 255));
	        }
	    }
	    return binArray.join('');
	};
	/**
	 * does what `window.atob` of web browsers do.
	 * @param {String} asc Base64-encoded string
	 * @returns {string} binary string
	 */
	const _atob = typeof atob === 'function' ? (asc) => atob(_tidyB64(asc))
	    : _hasBuffer ? (asc) => Buffer.from(asc, 'base64').toString('binary')
	        : atobPolyfill;
	//
	const _toUint8Array = _hasBuffer
	    ? (a) => _U8Afrom(Buffer.from(a, 'base64'))
	    : (a) => _U8Afrom(_atob(a).split('').map(c => c.charCodeAt(0)));
	/**
	 * converts a Base64 string to a Uint8Array.
	 */
	const toUint8Array = (a) => _toUint8Array(_unURI(a));
	//
	const _decode = _hasBuffer
	    ? (a) => Buffer.from(a, 'base64').toString('utf8')
	    : _TD
	        ? (a) => _TD.decode(_toUint8Array(a))
	        : (a) => btou(_atob(a));
	const _unURI = (a) => _tidyB64(a.replace(/[-_]/g, (m0) => m0 == '-' ? '+' : '/'));
	/**
	 * converts a Base64 string to a UTF-8 string.
	 * @param {String} src Base64 string.  Both normal and URL-safe are supported
	 * @returns {string} UTF-8 string
	 */
	const decode = (src) => _decode(_unURI(src));
	/**
	 * check if a value is a valid Base64 string
	 * @param {String} src a value to check
	  */
	const isValid = (src) => {
	    if (typeof src !== 'string')
	        return false;
	    const s = src.replace(/\s+/g, '').replace(/={0,2}$/, '');
	    return !/[^\s0-9a-zA-Z\+/]/.test(s) || !/[^\s0-9a-zA-Z\-_]/.test(s);
	};
	//
	const _noEnum = (v) => {
	    return {
	        value: v, enumerable: false, writable: true, configurable: true
	    };
	};
	/**
	 * extend String.prototype with relevant methods
	 */
	const extendString = function () {
	    const _add = (name, body) => Object.defineProperty(String.prototype, name, _noEnum(body));
	    _add('fromBase64', function () { return decode(this); });
	    _add('toBase64', function (urlsafe) { return encode(this, urlsafe); });
	    _add('toBase64URI', function () { return encode(this, true); });
	    _add('toBase64URL', function () { return encode(this, true); });
	    _add('toUint8Array', function () { return toUint8Array(this); });
	};
	/**
	 * extend Uint8Array.prototype with relevant methods
	 */
	const extendUint8Array = function () {
	    const _add = (name, body) => Object.defineProperty(Uint8Array.prototype, name, _noEnum(body));
	    _add('toBase64', function (urlsafe) { return fromUint8Array(this, urlsafe); });
	    _add('toBase64URI', function () { return fromUint8Array(this, true); });
	    _add('toBase64URL', function () { return fromUint8Array(this, true); });
	};
	/**
	 * extend Builtin prototypes with relevant methods
	 */
	const extendBuiltins = () => {
	    extendString();
	    extendUint8Array();
	};
	const gBase64 = {
	    version: version,
	    VERSION: VERSION,
	    atob: _atob,
	    atobPolyfill: atobPolyfill,
	    btoa: _btoa,
	    btoaPolyfill: btoaPolyfill,
	    fromBase64: decode,
	    toBase64: encode,
	    encode: encode,
	    encodeURI: encodeURI,
	    encodeURL: encodeURI,
	    utob: utob,
	    btou: btou,
	    decode: decode,
	    isValid: isValid,
	    fromUint8Array: fromUint8Array,
	    toUint8Array: toUint8Array,
	    extendString: extendString,
	    extendUint8Array: extendUint8Array,
	    extendBuiltins: extendBuiltins
	};

	var requiresPort;
	var hasRequiredRequiresPort;

	function requireRequiresPort () {
		if (hasRequiredRequiresPort) return requiresPort;
		hasRequiredRequiresPort = 1;

		/**
		 * Check if we're required to add a port number.
		 *
		 * @see https://url.spec.whatwg.org/#default-port
		 * @param {Number|String} port Port number we need to check
		 * @param {String} protocol Protocol we need to check against.
		 * @returns {Boolean} Is it a default port for the given protocol
		 * @api private
		 */
		requiresPort = function required(port, protocol) {
		  protocol = protocol.split(':')[0];
		  port = +port;

		  if (!port) return false;

		  switch (protocol) {
		    case 'http':
		    case 'ws':
		    return port !== 80;

		    case 'https':
		    case 'wss':
		    return port !== 443;

		    case 'ftp':
		    return port !== 21;

		    case 'gopher':
		    return port !== 70;

		    case 'file':
		    return false;
		  }

		  return port !== 0;
		};
		return requiresPort;
	}

	var querystringify = {};

	var hasRequiredQuerystringify;

	function requireQuerystringify () {
		if (hasRequiredQuerystringify) return querystringify;
		hasRequiredQuerystringify = 1;

		var has = Object.prototype.hasOwnProperty
		  , undef;

		/**
		 * Decode a URI encoded string.
		 *
		 * @param {String} input The URI encoded string.
		 * @returns {String|Null} The decoded string.
		 * @api private
		 */
		function decode(input) {
		  try {
		    return decodeURIComponent(input.replace(/\+/g, ' '));
		  } catch (e) {
		    return null;
		  }
		}

		/**
		 * Attempts to encode a given input.
		 *
		 * @param {String} input The string that needs to be encoded.
		 * @returns {String|Null} The encoded string.
		 * @api private
		 */
		function encode(input) {
		  try {
		    return encodeURIComponent(input);
		  } catch (e) {
		    return null;
		  }
		}

		/**
		 * Simple query string parser.
		 *
		 * @param {String} query The query string that needs to be parsed.
		 * @returns {Object}
		 * @api public
		 */
		function querystring(query) {
		  var parser = /([^=?#&]+)=?([^&]*)/g
		    , result = {}
		    , part;

		  while (part = parser.exec(query)) {
		    var key = decode(part[1])
		      , value = decode(part[2]);

		    //
		    // Prevent overriding of existing properties. This ensures that build-in
		    // methods like `toString` or __proto__ are not overriden by malicious
		    // querystrings.
		    //
		    // In the case if failed decoding, we want to omit the key/value pairs
		    // from the result.
		    //
		    if (key === null || value === null || key in result) continue;
		    result[key] = value;
		  }

		  return result;
		}

		/**
		 * Transform a query string to an object.
		 *
		 * @param {Object} obj Object that should be transformed.
		 * @param {String} prefix Optional prefix.
		 * @returns {String}
		 * @api public
		 */
		function querystringify$1(obj, prefix) {
		  prefix = prefix || '';

		  var pairs = []
		    , value
		    , key;

		  //
		  // Optionally prefix with a '?' if needed
		  //
		  if ('string' !== typeof prefix) prefix = '?';

		  for (key in obj) {
		    if (has.call(obj, key)) {
		      value = obj[key];

		      //
		      // Edge cases where we actually want to encode the value to an empty
		      // string instead of the stringified value.
		      //
		      if (!value && (value === null || value === undef || isNaN(value))) {
		        value = '';
		      }

		      key = encode(key);
		      value = encode(value);

		      //
		      // If we failed to encode the strings, we should bail out as we don't
		      // want to add invalid strings to the query.
		      //
		      if (key === null || value === null) continue;
		      pairs.push(key +'='+ value);
		    }
		  }

		  return pairs.length ? prefix + pairs.join('&') : '';
		}

		//
		// Expose the module.
		//
		querystringify.stringify = querystringify$1;
		querystringify.parse = querystring;
		return querystringify;
	}

	var urlParse;
	var hasRequiredUrlParse;

	function requireUrlParse () {
		if (hasRequiredUrlParse) return urlParse;
		hasRequiredUrlParse = 1;

		var required = requireRequiresPort()
		  , qs = requireQuerystringify()
		  , controlOrWhitespace = /^[\x00-\x20\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]+/
		  , CRHTLF = /[\n\r\t]/g
		  , slashes = /^[A-Za-z][A-Za-z0-9+-.]*:\/\//
		  , port = /:\d+$/
		  , protocolre = /^([a-z][a-z0-9.+-]*:)?(\/\/)?([\\/]+)?([\S\s]*)/i
		  , windowsDriveLetter = /^[a-zA-Z]:/;

		/**
		 * Remove control characters and whitespace from the beginning of a string.
		 *
		 * @param {Object|String} str String to trim.
		 * @returns {String} A new string representing `str` stripped of control
		 *     characters and whitespace from its beginning.
		 * @public
		 */
		function trimLeft(str) {
		  return (str ? str : '').toString().replace(controlOrWhitespace, '');
		}

		/**
		 * These are the parse rules for the URL parser, it informs the parser
		 * about:
		 *
		 * 0. The char it Needs to parse, if it's a string it should be done using
		 *    indexOf, RegExp using exec and NaN means set as current value.
		 * 1. The property we should set when parsing this value.
		 * 2. Indication if it's backwards or forward parsing, when set as number it's
		 *    the value of extra chars that should be split off.
		 * 3. Inherit from location if non existing in the parser.
		 * 4. `toLowerCase` the resulting value.
		 */
		var rules = [
		  ['#', 'hash'],                        // Extract from the back.
		  ['?', 'query'],                       // Extract from the back.
		  function sanitize(address, url) {     // Sanitize what is left of the address
		    return isSpecial(url.protocol) ? address.replace(/\\/g, '/') : address;
		  },
		  ['/', 'pathname'],                    // Extract from the back.
		  ['@', 'auth', 1],                     // Extract from the front.
		  [NaN, 'host', undefined, 1, 1],       // Set left over value.
		  [/:(\d*)$/, 'port', undefined, 1],    // RegExp the back.
		  [NaN, 'hostname', undefined, 1, 1]    // Set left over.
		];

		/**
		 * These properties should not be copied or inherited from. This is only needed
		 * for all non blob URL's as a blob URL does not include a hash, only the
		 * origin.
		 *
		 * @type {Object}
		 * @private
		 */
		var ignore = { hash: 1, query: 1 };

		/**
		 * The location object differs when your code is loaded through a normal page,
		 * Worker or through a worker using a blob. And with the blobble begins the
		 * trouble as the location object will contain the URL of the blob, not the
		 * location of the page where our code is loaded in. The actual origin is
		 * encoded in the `pathname` so we can thankfully generate a good "default"
		 * location from it so we can generate proper relative URL's again.
		 *
		 * @param {Object|String} loc Optional default location object.
		 * @returns {Object} lolcation object.
		 * @public
		 */
		function lolcation(loc) {
		  var globalVar;

		  if (typeof window !== 'undefined') globalVar = window;
		  else if (typeof commonjsGlobal !== 'undefined') globalVar = commonjsGlobal;
		  else if (typeof self !== 'undefined') globalVar = self;
		  else globalVar = {};

		  var location = globalVar.location || {};
		  loc = loc || location;

		  var finaldestination = {}
		    , type = typeof loc
		    , key;

		  if ('blob:' === loc.protocol) {
		    finaldestination = new Url(unescape(loc.pathname), {});
		  } else if ('string' === type) {
		    finaldestination = new Url(loc, {});
		    for (key in ignore) delete finaldestination[key];
		  } else if ('object' === type) {
		    for (key in loc) {
		      if (key in ignore) continue;
		      finaldestination[key] = loc[key];
		    }

		    if (finaldestination.slashes === undefined) {
		      finaldestination.slashes = slashes.test(loc.href);
		    }
		  }

		  return finaldestination;
		}

		/**
		 * Check whether a protocol scheme is special.
		 *
		 * @param {String} The protocol scheme of the URL
		 * @return {Boolean} `true` if the protocol scheme is special, else `false`
		 * @private
		 */
		function isSpecial(scheme) {
		  return (
		    scheme === 'file:' ||
		    scheme === 'ftp:' ||
		    scheme === 'http:' ||
		    scheme === 'https:' ||
		    scheme === 'ws:' ||
		    scheme === 'wss:'
		  );
		}

		/**
		 * @typedef ProtocolExtract
		 * @type Object
		 * @property {String} protocol Protocol matched in the URL, in lowercase.
		 * @property {Boolean} slashes `true` if protocol is followed by "//", else `false`.
		 * @property {String} rest Rest of the URL that is not part of the protocol.
		 */

		/**
		 * Extract protocol information from a URL with/without double slash ("//").
		 *
		 * @param {String} address URL we want to extract from.
		 * @param {Object} location
		 * @return {ProtocolExtract} Extracted information.
		 * @private
		 */
		function extractProtocol(address, location) {
		  address = trimLeft(address);
		  address = address.replace(CRHTLF, '');
		  location = location || {};

		  var match = protocolre.exec(address);
		  var protocol = match[1] ? match[1].toLowerCase() : '';
		  var forwardSlashes = !!match[2];
		  var otherSlashes = !!match[3];
		  var slashesCount = 0;
		  var rest;

		  if (forwardSlashes) {
		    if (otherSlashes) {
		      rest = match[2] + match[3] + match[4];
		      slashesCount = match[2].length + match[3].length;
		    } else {
		      rest = match[2] + match[4];
		      slashesCount = match[2].length;
		    }
		  } else {
		    if (otherSlashes) {
		      rest = match[3] + match[4];
		      slashesCount = match[3].length;
		    } else {
		      rest = match[4];
		    }
		  }

		  if (protocol === 'file:') {
		    if (slashesCount >= 2) {
		      rest = rest.slice(2);
		    }
		  } else if (isSpecial(protocol)) {
		    rest = match[4];
		  } else if (protocol) {
		    if (forwardSlashes) {
		      rest = rest.slice(2);
		    }
		  } else if (slashesCount >= 2 && isSpecial(location.protocol)) {
		    rest = match[4];
		  }

		  return {
		    protocol: protocol,
		    slashes: forwardSlashes || isSpecial(protocol),
		    slashesCount: slashesCount,
		    rest: rest
		  };
		}

		/**
		 * Resolve a relative URL pathname against a base URL pathname.
		 *
		 * @param {String} relative Pathname of the relative URL.
		 * @param {String} base Pathname of the base URL.
		 * @return {String} Resolved pathname.
		 * @private
		 */
		function resolve(relative, base) {
		  if (relative === '') return base;

		  var path = (base || '/').split('/').slice(0, -1).concat(relative.split('/'))
		    , i = path.length
		    , last = path[i - 1]
		    , unshift = false
		    , up = 0;

		  while (i--) {
		    if (path[i] === '.') {
		      path.splice(i, 1);
		    } else if (path[i] === '..') {
		      path.splice(i, 1);
		      up++;
		    } else if (up) {
		      if (i === 0) unshift = true;
		      path.splice(i, 1);
		      up--;
		    }
		  }

		  if (unshift) path.unshift('');
		  if (last === '.' || last === '..') path.push('');

		  return path.join('/');
		}

		/**
		 * The actual URL instance. Instead of returning an object we've opted-in to
		 * create an actual constructor as it's much more memory efficient and
		 * faster and it pleases my OCD.
		 *
		 * It is worth noting that we should not use `URL` as class name to prevent
		 * clashes with the global URL instance that got introduced in browsers.
		 *
		 * @constructor
		 * @param {String} address URL we want to parse.
		 * @param {Object|String} [location] Location defaults for relative paths.
		 * @param {Boolean|Function} [parser] Parser for the query string.
		 * @private
		 */
		function Url(address, location, parser) {
		  address = trimLeft(address);
		  address = address.replace(CRHTLF, '');

		  if (!(this instanceof Url)) {
		    return new Url(address, location, parser);
		  }

		  var relative, extracted, parse, instruction, index, key
		    , instructions = rules.slice()
		    , type = typeof location
		    , url = this
		    , i = 0;

		  //
		  // The following if statements allows this module two have compatibility with
		  // 2 different API:
		  //
		  // 1. Node.js's `url.parse` api which accepts a URL, boolean as arguments
		  //    where the boolean indicates that the query string should also be parsed.
		  //
		  // 2. The `URL` interface of the browser which accepts a URL, object as
		  //    arguments. The supplied object will be used as default values / fall-back
		  //    for relative paths.
		  //
		  if ('object' !== type && 'string' !== type) {
		    parser = location;
		    location = null;
		  }

		  if (parser && 'function' !== typeof parser) parser = qs.parse;

		  location = lolcation(location);

		  //
		  // Extract protocol information before running the instructions.
		  //
		  extracted = extractProtocol(address || '', location);
		  relative = !extracted.protocol && !extracted.slashes;
		  url.slashes = extracted.slashes || relative && location.slashes;
		  url.protocol = extracted.protocol || location.protocol || '';
		  address = extracted.rest;

		  //
		  // When the authority component is absent the URL starts with a path
		  // component.
		  //
		  if (
		    extracted.protocol === 'file:' && (
		      extracted.slashesCount !== 2 || windowsDriveLetter.test(address)) ||
		    (!extracted.slashes &&
		      (extracted.protocol ||
		        extracted.slashesCount < 2 ||
		        !isSpecial(url.protocol)))
		  ) {
		    instructions[3] = [/(.*)/, 'pathname'];
		  }

		  for (; i < instructions.length; i++) {
		    instruction = instructions[i];

		    if (typeof instruction === 'function') {
		      address = instruction(address, url);
		      continue;
		    }

		    parse = instruction[0];
		    key = instruction[1];

		    if (parse !== parse) {
		      url[key] = address;
		    } else if ('string' === typeof parse) {
		      index = parse === '@'
		        ? address.lastIndexOf(parse)
		        : address.indexOf(parse);

		      if (~index) {
		        if ('number' === typeof instruction[2]) {
		          url[key] = address.slice(0, index);
		          address = address.slice(index + instruction[2]);
		        } else {
		          url[key] = address.slice(index);
		          address = address.slice(0, index);
		        }
		      }
		    } else if ((index = parse.exec(address))) {
		      url[key] = index[1];
		      address = address.slice(0, index.index);
		    }

		    url[key] = url[key] || (
		      relative && instruction[3] ? location[key] || '' : ''
		    );

		    //
		    // Hostname, host and protocol should be lowercased so they can be used to
		    // create a proper `origin`.
		    //
		    if (instruction[4]) url[key] = url[key].toLowerCase();
		  }

		  //
		  // Also parse the supplied query string in to an object. If we're supplied
		  // with a custom parser as function use that instead of the default build-in
		  // parser.
		  //
		  if (parser) url.query = parser(url.query);

		  //
		  // If the URL is relative, resolve the pathname against the base URL.
		  //
		  if (
		      relative
		    && location.slashes
		    && url.pathname.charAt(0) !== '/'
		    && (url.pathname !== '' || location.pathname !== '')
		  ) {
		    url.pathname = resolve(url.pathname, location.pathname);
		  }

		  //
		  // Default to a / for pathname if none exists. This normalizes the URL
		  // to always have a /
		  //
		  if (url.pathname.charAt(0) !== '/' && isSpecial(url.protocol)) {
		    url.pathname = '/' + url.pathname;
		  }

		  //
		  // We should not add port numbers if they are already the default port number
		  // for a given protocol. As the host also contains the port number we're going
		  // override it with the hostname which contains no port number.
		  //
		  if (!required(url.port, url.protocol)) {
		    url.host = url.hostname;
		    url.port = '';
		  }

		  //
		  // Parse down the `auth` for the username and password.
		  //
		  url.username = url.password = '';

		  if (url.auth) {
		    index = url.auth.indexOf(':');

		    if (~index) {
		      url.username = url.auth.slice(0, index);
		      url.username = encodeURIComponent(decodeURIComponent(url.username));

		      url.password = url.auth.slice(index + 1);
		      url.password = encodeURIComponent(decodeURIComponent(url.password));
		    } else {
		      url.username = encodeURIComponent(decodeURIComponent(url.auth));
		    }

		    url.auth = url.password ? url.username +':'+ url.password : url.username;
		  }

		  url.origin = url.protocol !== 'file:' && isSpecial(url.protocol) && url.host
		    ? url.protocol +'//'+ url.host
		    : 'null';

		  //
		  // The href is just the compiled result.
		  //
		  url.href = url.toString();
		}

		/**
		 * This is convenience method for changing properties in the URL instance to
		 * insure that they all propagate correctly.
		 *
		 * @param {String} part          Property we need to adjust.
		 * @param {Mixed} value          The newly assigned value.
		 * @param {Boolean|Function} fn  When setting the query, it will be the function
		 *                               used to parse the query.
		 *                               When setting the protocol, double slash will be
		 *                               removed from the final url if it is true.
		 * @returns {URL} URL instance for chaining.
		 * @public
		 */
		function set(part, value, fn) {
		  var url = this;

		  switch (part) {
		    case 'query':
		      if ('string' === typeof value && value.length) {
		        value = (fn || qs.parse)(value);
		      }

		      url[part] = value;
		      break;

		    case 'port':
		      url[part] = value;

		      if (!required(value, url.protocol)) {
		        url.host = url.hostname;
		        url[part] = '';
		      } else if (value) {
		        url.host = url.hostname +':'+ value;
		      }

		      break;

		    case 'hostname':
		      url[part] = value;

		      if (url.port) value += ':'+ url.port;
		      url.host = value;
		      break;

		    case 'host':
		      url[part] = value;

		      if (port.test(value)) {
		        value = value.split(':');
		        url.port = value.pop();
		        url.hostname = value.join(':');
		      } else {
		        url.hostname = value;
		        url.port = '';
		      }

		      break;

		    case 'protocol':
		      url.protocol = value.toLowerCase();
		      url.slashes = !fn;
		      break;

		    case 'pathname':
		    case 'hash':
		      if (value) {
		        var char = part === 'pathname' ? '/' : '#';
		        url[part] = value.charAt(0) !== char ? char + value : value;
		      } else {
		        url[part] = value;
		      }
		      break;

		    case 'username':
		    case 'password':
		      url[part] = encodeURIComponent(value);
		      break;

		    case 'auth':
		      var index = value.indexOf(':');

		      if (~index) {
		        url.username = value.slice(0, index);
		        url.username = encodeURIComponent(decodeURIComponent(url.username));

		        url.password = value.slice(index + 1);
		        url.password = encodeURIComponent(decodeURIComponent(url.password));
		      } else {
		        url.username = encodeURIComponent(decodeURIComponent(value));
		      }
		  }

		  for (var i = 0; i < rules.length; i++) {
		    var ins = rules[i];

		    if (ins[4]) url[ins[1]] = url[ins[1]].toLowerCase();
		  }

		  url.auth = url.password ? url.username +':'+ url.password : url.username;

		  url.origin = url.protocol !== 'file:' && isSpecial(url.protocol) && url.host
		    ? url.protocol +'//'+ url.host
		    : 'null';

		  url.href = url.toString();

		  return url;
		}

		/**
		 * Transform the properties back in to a valid and full URL string.
		 *
		 * @param {Function} stringify Optional query stringify function.
		 * @returns {String} Compiled version of the URL.
		 * @public
		 */
		function toString(stringify) {
		  if (!stringify || 'function' !== typeof stringify) stringify = qs.stringify;

		  var query
		    , url = this
		    , host = url.host
		    , protocol = url.protocol;

		  if (protocol && protocol.charAt(protocol.length - 1) !== ':') protocol += ':';

		  var result =
		    protocol +
		    ((url.protocol && url.slashes) || isSpecial(url.protocol) ? '//' : '');

		  if (url.username) {
		    result += url.username;
		    if (url.password) result += ':'+ url.password;
		    result += '@';
		  } else if (url.password) {
		    result += ':'+ url.password;
		    result += '@';
		  } else if (
		    url.protocol !== 'file:' &&
		    isSpecial(url.protocol) &&
		    !host &&
		    url.pathname !== '/'
		  ) {
		    //
		    // Add back the empty userinfo, otherwise the original invalid URL
		    // might be transformed into a valid one with `url.pathname` as host.
		    //
		    result += '@';
		  }

		  //
		  // Trailing colon is removed from `url.host` when it is parsed. If it still
		  // ends with a colon, then add back the trailing colon that was removed. This
		  // prevents an invalid URL from being transformed into a valid one.
		  //
		  if (host[host.length - 1] === ':' || (port.test(url.hostname) && !url.port)) {
		    host += ':';
		  }

		  result += host + url.pathname;

		  query = 'object' === typeof url.query ? stringify(url.query) : url.query;
		  if (query) result += '?' !== query.charAt(0) ? '?'+ query : query;

		  if (url.hash) result += url.hash;

		  return result;
		}

		Url.prototype = { set: set, toString: toString };

		//
		// Expose the URL parser and some additional properties that might be useful for
		// others or testing.
		//
		Url.extractProtocol = extractProtocol;
		Url.location = lolcation;
		Url.trimLeft = trimLeft;
		Url.qs = qs;

		urlParse = Url;
		return urlParse;
	}

	var urlParseExports = requireUrlParse();
	var URL$1 = /*@__PURE__*/getDefaultExportFromCjs(urlParseExports);

	/**
	 * Generate a UUID v4 based on random numbers. We intentioanlly use the less
	 * secure Math.random function here since the more secure crypto.getRandomNumbers
	 * is not available on all platforms.
	 * This is not a problem for us since we use the UUID only for generating a
	 * request ID, so we can correlate server logs to client errors.
	 *
	 * This function is taken from following site:
	 * https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
	 *
	 * @return {string} The generate UUID
	 */
	function uuid() {
	  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
	    var r = Math.random() * 16 | 0;
	    var v = c === 'x' ? r : r & 0x3 | 0x8;
	    return v.toString(16);
	  });
	}

	function _regeneratorRuntime$1() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime$1 = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: true, configurable: true, writable: true }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof$6(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: true }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(true); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = false, next; return next.value = t, next.done = true, next; }; return i.next = i; } } throw new TypeError(_typeof$6(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: true }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: true }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = false, next; } return next.done = true, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = false, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = true; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, true); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, true); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
	function asyncGeneratorStep$1(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
	function _asyncToGenerator$1(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep$1(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep$1(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
	function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
	function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
	function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = true, o = false; try { if (i = (t = t.call(r)).next, 0 === l) ; else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = true, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
	function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
	function _typeof$6(o) { "@babel/helpers - typeof"; return _typeof$6 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof$6(o); }
	function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike) { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
	function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
	function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
	function ownKeys$1(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
	function _objectSpread$1(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys$1(Object(t), true).forEach(function (r) { _defineProperty$1(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys$1(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
	function _defineProperty$1(obj, key, value) { key = _toPropertyKey$6(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
	function _classCallCheck$6(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	function _defineProperties$6(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey$6(descriptor.key), descriptor); } }
	function _createClass$6(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties$6(Constructor.prototype, protoProps); if (staticProps) _defineProperties$6(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
	function _toPropertyKey$6(t) { var i = _toPrimitive$6(t, "string"); return "symbol" == _typeof$6(i) ? i : i + ""; }
	function _toPrimitive$6(t, r) { if ("object" != _typeof$6(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r); if ("object" != _typeof$6(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return (String )(t); }
	var PROTOCOL_TUS_V1 = 'tus-v1';
	var PROTOCOL_IETF_DRAFT_03 = 'ietf-draft-03';
	var PROTOCOL_IETF_DRAFT_05 = 'ietf-draft-05';
	var defaultOptions$1 = {
	  endpoint: null,
	  uploadUrl: null,
	  metadata: {},
	  metadataForPartialUploads: {},
	  fingerprint: null,
	  uploadSize: null,
	  onProgress: null,
	  onChunkComplete: null,
	  onSuccess: null,
	  onError: null,
	  onUploadUrlAvailable: null,
	  overridePatchMethod: false,
	  headers: {},
	  addRequestId: false,
	  onBeforeRequest: null,
	  onAfterResponse: null,
	  onShouldRetry: defaultOnShouldRetry,
	  chunkSize: Number.POSITIVE_INFINITY,
	  retryDelays: [0, 1000, 3000, 5000],
	  parallelUploads: 1,
	  parallelUploadBoundaries: null,
	  storeFingerprintForResuming: true,
	  removeFingerprintOnSuccess: false,
	  uploadLengthDeferred: false,
	  uploadDataDuringCreation: false,
	  urlStorage: null,
	  fileReader: null,
	  httpStack: null,
	  protocol: PROTOCOL_TUS_V1
	};
	var BaseUpload = /*#__PURE__*/function () {
	  function BaseUpload(file, options) {
	    _classCallCheck$6(this, BaseUpload);
	    // Warn about removed options from previous versions
	    if ('resume' in options) {
	      console.log('tus: The `resume` option has been removed in tus-js-client v2. Please use the URL storage API instead.');
	    }

	    // The default options will already be added from the wrapper classes.
	    this.options = options;

	    // Cast chunkSize to integer
	    this.options.chunkSize = Number(this.options.chunkSize);

	    // The storage module used to store URLs
	    this._urlStorage = this.options.urlStorage;

	    // The underlying File/Blob object
	    this.file = file;

	    // The URL against which the file will be uploaded
	    this.url = null;

	    // The underlying request object for the current PATCH request
	    this._req = null;

	    // The fingerpinrt for the current file (set after start())
	    this._fingerprint = null;

	    // The key that the URL storage returned when saving an URL with a fingerprint,
	    this._urlStorageKey = null;

	    // The offset used in the current PATCH request
	    this._offset = null;

	    // True if the current PATCH request has been aborted
	    this._aborted = false;

	    // The file's size in bytes
	    this._size = null;

	    // The Source object which will wrap around the given file and provides us
	    // with a unified interface for getting its size and slice chunks from its
	    // content allowing us to easily handle Files, Blobs, Buffers and Streams.
	    this._source = null;

	    // The current count of attempts which have been made. Zero indicates none.
	    this._retryAttempt = 0;

	    // The timeout's ID which is used to delay the next retry
	    this._retryTimeout = null;

	    // The offset of the remote upload before the latest attempt was started.
	    this._offsetBeforeRetry = 0;

	    // An array of BaseUpload instances which are used for uploading the different
	    // parts, if the parallelUploads option is used.
	    this._parallelUploads = null;

	    // An array of upload URLs which are used for uploading the different
	    // parts, if the parallelUploads option is used.
	    this._parallelUploadUrls = null;
	  }

	  /**
	   * Use the Termination extension to delete an upload from the server by sending a DELETE
	   * request to the specified upload URL. This is only possible if the server supports the
	   * Termination extension. If the `options.retryDelays` property is set, the method will
	   * also retry if an error ocurrs.
	   *
	   * @param {String} url The upload's URL which will be terminated.
	   * @param {object} options Optional options for influencing HTTP requests.
	   * @return {Promise} The Promise will be resolved/rejected when the requests finish.
	   */
	  return _createClass$6(BaseUpload, [{
	    key: "findPreviousUploads",
	    value: function findPreviousUploads() {
	      var _this = this;
	      return this.options.fingerprint(this.file, this.options).then(function (fingerprint) {
	        return _this._urlStorage.findUploadsByFingerprint(fingerprint);
	      });
	    }
	  }, {
	    key: "resumeFromPreviousUpload",
	    value: function resumeFromPreviousUpload(previousUpload) {
	      this.url = previousUpload.uploadUrl || null;
	      this._parallelUploadUrls = previousUpload.parallelUploadUrls || null;
	      this._urlStorageKey = previousUpload.urlStorageKey;
	    }
	  }, {
	    key: "start",
	    value: function start() {
	      var _this2 = this;
	      var file = this.file;
	      if (!file) {
	        this._emitError(new Error('tus: no file or stream to upload provided'));
	        return;
	      }
	      if (![PROTOCOL_TUS_V1, PROTOCOL_IETF_DRAFT_03, PROTOCOL_IETF_DRAFT_05].includes(this.options.protocol)) {
	        this._emitError(new Error("tus: unsupported protocol ".concat(this.options.protocol)));
	        return;
	      }
	      if (!this.options.endpoint && !this.options.uploadUrl && !this.url) {
	        this._emitError(new Error('tus: neither an endpoint or an upload URL is provided'));
	        return;
	      }
	      var retryDelays = this.options.retryDelays;
	      if (retryDelays != null && Object.prototype.toString.call(retryDelays) !== '[object Array]') {
	        this._emitError(new Error('tus: the `retryDelays` option must either be an array or null'));
	        return;
	      }
	      if (this.options.parallelUploads > 1) {
	        // Test which options are incompatible with parallel uploads.
	        for (var _i = 0, _arr = ['uploadUrl', 'uploadSize', 'uploadLengthDeferred']; _i < _arr.length; _i++) {
	          var optionName = _arr[_i];
	          if (this.options[optionName]) {
	            this._emitError(new Error("tus: cannot use the ".concat(optionName, " option when parallelUploads is enabled")));
	            return;
	          }
	        }
	      }
	      if (this.options.parallelUploadBoundaries) {
	        if (this.options.parallelUploads <= 1) {
	          this._emitError(new Error('tus: cannot use the `parallelUploadBoundaries` option when `parallelUploads` is disabled'));
	          return;
	        }
	        if (this.options.parallelUploads !== this.options.parallelUploadBoundaries.length) {
	          this._emitError(new Error('tus: the `parallelUploadBoundaries` must have the same length as the value of `parallelUploads`'));
	          return;
	        }
	      }
	      this.options.fingerprint(file, this.options).then(function (fingerprint) {
	        _this2._fingerprint = fingerprint;
	        if (_this2._source) {
	          return _this2._source;
	        }
	        return _this2.options.fileReader.openFile(file, _this2.options.chunkSize);
	      }).then(function (source) {
	        _this2._source = source;

	        // First, we look at the uploadLengthDeferred option.
	        // Next, we check if the caller has supplied a manual upload size.
	        // Finally, we try to use the calculated size from the source object.
	        if (_this2.options.uploadLengthDeferred) {
	          _this2._size = null;
	        } else if (_this2.options.uploadSize != null) {
	          _this2._size = Number(_this2.options.uploadSize);
	          if (Number.isNaN(_this2._size)) {
	            _this2._emitError(new Error('tus: cannot convert `uploadSize` option into a number'));
	            return;
	          }
	        } else {
	          _this2._size = _this2._source.size;
	          if (_this2._size == null) {
	            _this2._emitError(new Error("tus: cannot automatically derive upload's size from input. Specify it manually using the `uploadSize` option or use the `uploadLengthDeferred` option"));
	            return;
	          }
	        }

	        // If the upload was configured to use multiple requests or if we resume from
	        // an upload which used multiple requests, we start a parallel upload.
	        if (_this2.options.parallelUploads > 1 || _this2._parallelUploadUrls != null) {
	          _this2._startParallelUpload();
	        } else {
	          _this2._startSingleUpload();
	        }
	      })["catch"](function (err) {
	        _this2._emitError(err);
	      });
	    }

	    /**
	     * Initiate the uploading procedure for a parallelized upload, where one file is split into
	     * multiple request which are run in parallel.
	     *
	     * @api private
	     */
	  }, {
	    key: "_startParallelUpload",
	    value: function _startParallelUpload() {
	      var _this$options$paralle,
	        _this3 = this;
	      var totalSize = this._size;
	      var totalProgress = 0;
	      this._parallelUploads = [];
	      var partCount = this._parallelUploadUrls != null ? this._parallelUploadUrls.length : this.options.parallelUploads;

	      // The input file will be split into multiple slices which are uploaded in separate
	      // requests. Here we get the start and end position for the slices.
	      var parts = (_this$options$paralle = this.options.parallelUploadBoundaries) !== null && _this$options$paralle !== void 0 ? _this$options$paralle : splitSizeIntoParts(this._source.size, partCount);

	      // Attach URLs from previous uploads, if available.
	      if (this._parallelUploadUrls) {
	        parts.forEach(function (part, index) {
	          part.uploadUrl = _this3._parallelUploadUrls[index] || null;
	        });
	      }

	      // Create an empty list for storing the upload URLs
	      this._parallelUploadUrls = new Array(parts.length);

	      // Generate a promise for each slice that will be resolve if the respective
	      // upload is completed.
	      var uploads = parts.map(function (part, index) {
	        var lastPartProgress = 0;
	        return _this3._source.slice(part.start, part.end).then(function (_ref) {
	          var value = _ref.value;
	          return new Promise(function (resolve, reject) {
	            // Merge with the user supplied options but overwrite some values.
	            var options = _objectSpread$1(_objectSpread$1({}, _this3.options), {}, {
	              // If available, the partial upload should be resumed from a previous URL.
	              uploadUrl: part.uploadUrl || null,
	              // We take manually care of resuming for partial uploads, so they should
	              // not be stored in the URL storage.
	              storeFingerprintForResuming: false,
	              removeFingerprintOnSuccess: false,
	              // Reset the parallelUploads option to not cause recursion.
	              parallelUploads: 1,
	              // Reset this option as we are not doing a parallel upload.
	              parallelUploadBoundaries: null,
	              metadata: _this3.options.metadataForPartialUploads,
	              // Add the header to indicate the this is a partial upload.
	              headers: _objectSpread$1(_objectSpread$1({}, _this3.options.headers), {}, {
	                'Upload-Concat': 'partial'
	              }),
	              // Reject or resolve the promise if the upload errors or completes.
	              onSuccess: resolve,
	              onError: reject,
	              // Based in the progress for this partial upload, calculate the progress
	              // for the entire final upload.
	              onProgress: function onProgress(newPartProgress) {
	                totalProgress = totalProgress - lastPartProgress + newPartProgress;
	                lastPartProgress = newPartProgress;
	                _this3._emitProgress(totalProgress, totalSize);
	              },
	              // Wait until every partial upload has an upload URL, so we can add
	              // them to the URL storage.
	              onUploadUrlAvailable: function onUploadUrlAvailable() {
	                _this3._parallelUploadUrls[index] = upload.url;
	                // Test if all uploads have received an URL
	                if (_this3._parallelUploadUrls.filter(function (u) {
	                  return Boolean(u);
	                }).length === parts.length) {
	                  _this3._saveUploadInUrlStorage();
	                }
	              }
	            });
	            var upload = new BaseUpload(value, options);
	            upload.start();

	            // Store the upload in an array, so we can later abort them if necessary.
	            _this3._parallelUploads.push(upload);
	          });
	        });
	      });
	      var req;
	      // Wait until all partial uploads are finished and we can send the POST request for
	      // creating the final upload.
	      Promise.all(uploads).then(function () {
	        req = _this3._openRequest('POST', _this3.options.endpoint);
	        req.setHeader('Upload-Concat', "final;".concat(_this3._parallelUploadUrls.join(' ')));

	        // Add metadata if values have been added
	        var metadata = encodeMetadata(_this3.options.metadata);
	        if (metadata !== '') {
	          req.setHeader('Upload-Metadata', metadata);
	        }
	        return _this3._sendRequest(req, null);
	      }).then(function (res) {
	        if (!inStatusCategory(res.getStatus(), 200)) {
	          _this3._emitHttpError(req, res, 'tus: unexpected response while creating upload');
	          return;
	        }
	        var location = res.getHeader('Location');
	        if (location == null) {
	          _this3._emitHttpError(req, res, 'tus: invalid or missing Location header');
	          return;
	        }
	        _this3.url = resolveUrl(_this3.options.endpoint, location);
	        log("Created upload at ".concat(_this3.url));
	        _this3._emitSuccess(res);
	      })["catch"](function (err) {
	        _this3._emitError(err);
	      });
	    }

	    /**
	     * Initiate the uploading procedure for a non-parallel upload. Here the entire file is
	     * uploaded in a sequential matter.
	     *
	     * @api private
	     */
	  }, {
	    key: "_startSingleUpload",
	    value: function _startSingleUpload() {
	      // Reset the aborted flag when the upload is started or else the
	      // _performUpload will stop before sending a request if the upload has been
	      // aborted previously.
	      this._aborted = false;

	      // The upload had been started previously and we should reuse this URL.
	      if (this.url != null) {
	        log("Resuming upload from previous URL: ".concat(this.url));
	        this._resumeUpload();
	        return;
	      }

	      // A URL has manually been specified, so we try to resume
	      if (this.options.uploadUrl != null) {
	        log("Resuming upload from provided URL: ".concat(this.options.uploadUrl));
	        this.url = this.options.uploadUrl;
	        this._resumeUpload();
	        return;
	      }
	      this._createUpload();
	    }

	    /**
	     * Abort any running request and stop the current upload. After abort is called, no event
	     * handler will be invoked anymore. You can use the `start` method to resume the upload
	     * again.
	     * If `shouldTerminate` is true, the `terminate` function will be called to remove the
	     * current upload from the server.
	     *
	     * @param {boolean} shouldTerminate True if the upload should be deleted from the server.
	     * @return {Promise} The Promise will be resolved/rejected when the requests finish.
	     */
	  }, {
	    key: "abort",
	    value: function abort(shouldTerminate) {
	      var _this4 = this;
	      // Stop any parallel partial uploads, that have been started in _startParallelUploads.
	      if (this._parallelUploads != null) {
	        var _iterator = _createForOfIteratorHelper(this._parallelUploads),
	          _step;
	        try {
	          for (_iterator.s(); !(_step = _iterator.n()).done;) {
	            var upload = _step.value;
	            upload.abort(shouldTerminate);
	          }
	        } catch (err) {
	          _iterator.e(err);
	        } finally {
	          _iterator.f();
	        }
	      }

	      // Stop any current running request.
	      if (this._req !== null) {
	        this._req.abort();
	        // Note: We do not close the file source here, so the user can resume in the future.
	      }
	      this._aborted = true;

	      // Stop any timeout used for initiating a retry.
	      if (this._retryTimeout != null) {
	        clearTimeout(this._retryTimeout);
	        this._retryTimeout = null;
	      }
	      if (!shouldTerminate || this.url == null) {
	        return Promise.resolve();
	      }
	      return BaseUpload.terminate(this.url, this.options)
	      // Remove entry from the URL storage since the upload URL is no longer valid.
	      .then(function () {
	        return _this4._removeFromUrlStorage();
	      });
	    }
	  }, {
	    key: "_emitHttpError",
	    value: function _emitHttpError(req, res, message, causingErr) {
	      this._emitError(new DetailedError(message, causingErr, req, res));
	    }
	  }, {
	    key: "_emitError",
	    value: function _emitError(err) {
	      var _this5 = this;
	      // Do not emit errors, e.g. from aborted HTTP requests, if the upload has been stopped.
	      if (this._aborted) return;

	      // Check if we should retry, when enabled, before sending the error to the user.
	      if (this.options.retryDelays != null) {
	        // We will reset the attempt counter if
	        // - we were already able to connect to the server (offset != null) and
	        // - we were able to upload a small chunk of data to the server
	        var shouldResetDelays = this._offset != null && this._offset > this._offsetBeforeRetry;
	        if (shouldResetDelays) {
	          this._retryAttempt = 0;
	        }
	        if (shouldRetry(err, this._retryAttempt, this.options)) {
	          var delay = this.options.retryDelays[this._retryAttempt++];
	          this._offsetBeforeRetry = this._offset;
	          this._retryTimeout = setTimeout(function () {
	            _this5.start();
	          }, delay);
	          return;
	        }
	      }
	      if (typeof this.options.onError === 'function') {
	        this.options.onError(err);
	      } else {
	        throw err;
	      }
	    }

	    /**
	     * Publishes notification if the upload has been successfully completed.
	     *
	     * @param {object} lastResponse Last HTTP response.
	     * @api private
	     */
	  }, {
	    key: "_emitSuccess",
	    value: function _emitSuccess(lastResponse) {
	      if (this.options.removeFingerprintOnSuccess) {
	        // Remove stored fingerprint and corresponding endpoint. This causes
	        // new uploads of the same file to be treated as a different file.
	        this._removeFromUrlStorage();
	      }
	      if (typeof this.options.onSuccess === 'function') {
	        this.options.onSuccess({
	          lastResponse: lastResponse
	        });
	      }
	    }

	    /**
	     * Publishes notification when data has been sent to the server. This
	     * data may not have been accepted by the server yet.
	     *
	     * @param {number} bytesSent  Number of bytes sent to the server.
	     * @param {number} bytesTotal Total number of bytes to be sent to the server.
	     * @api private
	     */
	  }, {
	    key: "_emitProgress",
	    value: function _emitProgress(bytesSent, bytesTotal) {
	      if (typeof this.options.onProgress === 'function') {
	        this.options.onProgress(bytesSent, bytesTotal);
	      }
	    }

	    /**
	     * Publishes notification when a chunk of data has been sent to the server
	     * and accepted by the server.
	     * @param {number} chunkSize  Size of the chunk that was accepted by the server.
	     * @param {number} bytesAccepted Total number of bytes that have been
	     *                                accepted by the server.
	     * @param {number} bytesTotal Total number of bytes to be sent to the server.
	     * @api private
	     */
	  }, {
	    key: "_emitChunkComplete",
	    value: function _emitChunkComplete(chunkSize, bytesAccepted, bytesTotal) {
	      if (typeof this.options.onChunkComplete === 'function') {
	        this.options.onChunkComplete(chunkSize, bytesAccepted, bytesTotal);
	      }
	    }

	    /**
	     * Create a new upload using the creation extension by sending a POST
	     * request to the endpoint. After successful creation the file will be
	     * uploaded
	     *
	     * @api private
	     */
	  }, {
	    key: "_createUpload",
	    value: function _createUpload() {
	      var _this6 = this;
	      if (!this.options.endpoint) {
	        this._emitError(new Error('tus: unable to create upload because no endpoint is provided'));
	        return;
	      }
	      var req = this._openRequest('POST', this.options.endpoint);
	      if (this.options.uploadLengthDeferred) {
	        req.setHeader('Upload-Defer-Length', '1');
	      } else {
	        req.setHeader('Upload-Length', "".concat(this._size));
	      }

	      // Add metadata if values have been added
	      var metadata = encodeMetadata(this.options.metadata);
	      if (metadata !== '') {
	        req.setHeader('Upload-Metadata', metadata);
	      }
	      var promise;
	      if (this.options.uploadDataDuringCreation && !this.options.uploadLengthDeferred) {
	        this._offset = 0;
	        promise = this._addChunkToRequest(req);
	      } else {
	        if (this.options.protocol === PROTOCOL_IETF_DRAFT_03 || this.options.protocol === PROTOCOL_IETF_DRAFT_05) {
	          req.setHeader('Upload-Complete', '?0');
	        }
	        promise = this._sendRequest(req, null);
	      }
	      promise.then(function (res) {
	        if (!inStatusCategory(res.getStatus(), 200)) {
	          _this6._emitHttpError(req, res, 'tus: unexpected response while creating upload');
	          return;
	        }
	        var location = res.getHeader('Location');
	        if (location == null) {
	          _this6._emitHttpError(req, res, 'tus: invalid or missing Location header');
	          return;
	        }
	        _this6.url = resolveUrl(_this6.options.endpoint, location);
	        log("Created upload at ".concat(_this6.url));
	        if (typeof _this6.options.onUploadUrlAvailable === 'function') {
	          _this6.options.onUploadUrlAvailable();
	        }
	        if (_this6._size === 0) {
	          // Nothing to upload and file was successfully created
	          _this6._emitSuccess(res);
	          _this6._source.close();
	          return;
	        }
	        _this6._saveUploadInUrlStorage().then(function () {
	          if (_this6.options.uploadDataDuringCreation) {
	            _this6._handleUploadResponse(req, res);
	          } else {
	            _this6._offset = 0;
	            _this6._performUpload();
	          }
	        });
	      })["catch"](function (err) {
	        _this6._emitHttpError(req, null, 'tus: failed to create upload', err);
	      });
	    }

	    /*
	     * Try to resume an existing upload. First a HEAD request will be sent
	     * to retrieve the offset. If the request fails a new upload will be
	     * created. In the case of a successful response the file will be uploaded.
	     *
	     * @api private
	     */
	  }, {
	    key: "_resumeUpload",
	    value: function _resumeUpload() {
	      var _this7 = this;
	      var req = this._openRequest('HEAD', this.url);
	      var promise = this._sendRequest(req, null);
	      promise.then(function (res) {
	        var status = res.getStatus();
	        if (!inStatusCategory(status, 200)) {
	          // If the upload is locked (indicated by the 423 Locked status code), we
	          // emit an error instead of directly starting a new upload. This way the
	          // retry logic can catch the error and will retry the upload. An upload
	          // is usually locked for a short period of time and will be available
	          // afterwards.
	          if (status === 423) {
	            _this7._emitHttpError(req, res, 'tus: upload is currently locked; retry later');
	            return;
	          }
	          if (inStatusCategory(status, 400)) {
	            // Remove stored fingerprint and corresponding endpoint,
	            // on client errors since the file can not be found
	            _this7._removeFromUrlStorage();
	          }
	          if (!_this7.options.endpoint) {
	            // Don't attempt to create a new upload if no endpoint is provided.
	            _this7._emitHttpError(req, res, 'tus: unable to resume upload (new upload cannot be created without an endpoint)');
	            return;
	          }

	          // Try to create a new upload
	          _this7.url = null;
	          _this7._createUpload();
	          return;
	        }
	        var offset = Number.parseInt(res.getHeader('Upload-Offset'), 10);
	        if (Number.isNaN(offset)) {
	          _this7._emitHttpError(req, res, 'tus: invalid or missing offset value');
	          return;
	        }
	        var length = Number.parseInt(res.getHeader('Upload-Length'), 10);
	        if (Number.isNaN(length) && !_this7.options.uploadLengthDeferred && _this7.options.protocol === PROTOCOL_TUS_V1) {
	          _this7._emitHttpError(req, res, 'tus: invalid or missing length value');
	          return;
	        }
	        if (typeof _this7.options.onUploadUrlAvailable === 'function') {
	          _this7.options.onUploadUrlAvailable();
	        }
	        _this7._saveUploadInUrlStorage().then(function () {
	          // Upload has already been completed and we do not need to send additional
	          // data to the server
	          if (offset === length) {
	            _this7._emitProgress(length, length);
	            _this7._emitSuccess(res);
	            return;
	          }
	          _this7._offset = offset;
	          _this7._performUpload();
	        });
	      })["catch"](function (err) {
	        _this7._emitHttpError(req, null, 'tus: failed to resume upload', err);
	      });
	    }

	    /**
	     * Start uploading the file using PATCH requests. The file will be divided
	     * into chunks as specified in the chunkSize option. During the upload
	     * the onProgress event handler may be invoked multiple times.
	     *
	     * @api private
	     */
	  }, {
	    key: "_performUpload",
	    value: function _performUpload() {
	      var _this8 = this;
	      // If the upload has been aborted, we will not send the next PATCH request.
	      // This is important if the abort method was called during a callback, such
	      // as onChunkComplete or onProgress.
	      if (this._aborted) {
	        return;
	      }
	      var req;

	      // Some browser and servers may not support the PATCH method. For those
	      // cases, you can tell tus-js-client to use a POST request with the
	      // X-HTTP-Method-Override header for simulating a PATCH request.
	      if (this.options.overridePatchMethod) {
	        req = this._openRequest('POST', this.url);
	        req.setHeader('X-HTTP-Method-Override', 'PATCH');
	      } else {
	        req = this._openRequest('PATCH', this.url);
	      }
	      req.setHeader('Upload-Offset', "".concat(this._offset));
	      var promise = this._addChunkToRequest(req);
	      promise.then(function (res) {
	        if (!inStatusCategory(res.getStatus(), 200)) {
	          _this8._emitHttpError(req, res, 'tus: unexpected response while uploading chunk');
	          return;
	        }
	        _this8._handleUploadResponse(req, res);
	      })["catch"](function (err) {
	        // Don't emit an error if the upload was aborted manually
	        if (_this8._aborted) {
	          return;
	        }
	        _this8._emitHttpError(req, null, "tus: failed to upload chunk at offset ".concat(_this8._offset), err);
	      });
	    }

	    /**
	     * _addChunktoRequest reads a chunk from the source and sends it using the
	     * supplied request object. It will not handle the response.
	     *
	     * @api private
	     */
	  }, {
	    key: "_addChunkToRequest",
	    value: function _addChunkToRequest(req) {
	      var _this9 = this;
	      var start = this._offset;
	      var end = this._offset + this.options.chunkSize;
	      req.setProgressHandler(function (bytesSent) {
	        _this9._emitProgress(start + bytesSent, _this9._size);
	      });
	      if (this.options.protocol === PROTOCOL_TUS_V1) {
	        req.setHeader('Content-Type', 'application/offset+octet-stream');
	      } else if (this.options.protocol === PROTOCOL_IETF_DRAFT_05) {
	        req.setHeader('Content-Type', 'application/partial-upload');
	      }

	      // The specified chunkSize may be Infinity or the calcluated end position
	      // may exceed the file's size. In both cases, we limit the end position to
	      // the input's total size for simpler calculations and correctness.
	      if ((end === Number.POSITIVE_INFINITY || end > this._size) && !this.options.uploadLengthDeferred) {
	        end = this._size;
	      }
	      return this._source.slice(start, end).then(function (_ref2) {
	        var value = _ref2.value,
	          done = _ref2.done;
	        var valueSize = value !== null && value !== void 0 && value.size ? value.size : 0;

	        // If the upload length is deferred, the upload size was not specified during
	        // upload creation. So, if the file reader is done reading, we know the total
	        // upload size and can tell the tus server.
	        if (_this9.options.uploadLengthDeferred && done) {
	          _this9._size = _this9._offset + valueSize;
	          req.setHeader('Upload-Length', "".concat(_this9._size));
	        }

	        // The specified uploadSize might not match the actual amount of data that a source
	        // provides. In these cases, we cannot successfully complete the upload, so we
	        // rather error out and let the user know. If not, tus-js-client will be stuck
	        // in a loop of repeating empty PATCH requests.
	        // See https://community.transloadit.com/t/how-to-abort-hanging-companion-uploads/16488/13
	        var newSize = _this9._offset + valueSize;
	        if (!_this9.options.uploadLengthDeferred && done && newSize !== _this9._size) {
	          return Promise.reject(new Error("upload was configured with a size of ".concat(_this9._size, " bytes, but the source is done after ").concat(newSize, " bytes")));
	        }
	        if (value === null) {
	          return _this9._sendRequest(req);
	        }
	        if (_this9.options.protocol === PROTOCOL_IETF_DRAFT_03 || _this9.options.protocol === PROTOCOL_IETF_DRAFT_05) {
	          req.setHeader('Upload-Complete', done ? '?1' : '?0');
	        }
	        _this9._emitProgress(_this9._offset, _this9._size);
	        return _this9._sendRequest(req, value);
	      });
	    }

	    /**
	     * _handleUploadResponse is used by requests that haven been sent using _addChunkToRequest
	     * and already have received a response.
	     *
	     * @api private
	     */
	  }, {
	    key: "_handleUploadResponse",
	    value: function _handleUploadResponse(req, res) {
	      var offset = Number.parseInt(res.getHeader('Upload-Offset'), 10);
	      if (Number.isNaN(offset)) {
	        this._emitHttpError(req, res, 'tus: invalid or missing offset value');
	        return;
	      }
	      this._emitProgress(offset, this._size);
	      this._emitChunkComplete(offset - this._offset, offset, this._size);
	      this._offset = offset;
	      if (offset === this._size) {
	        // Yay, finally done :)
	        this._emitSuccess(res);
	        this._source.close();
	        return;
	      }
	      this._performUpload();
	    }

	    /**
	     * Create a new HTTP request object with the given method and URL.
	     *
	     * @api private
	     */
	  }, {
	    key: "_openRequest",
	    value: function _openRequest(method, url) {
	      var req = openRequest(method, url, this.options);
	      this._req = req;
	      return req;
	    }

	    /**
	     * Remove the entry in the URL storage, if it has been saved before.
	     *
	     * @api private
	     */
	  }, {
	    key: "_removeFromUrlStorage",
	    value: function _removeFromUrlStorage() {
	      var _this10 = this;
	      if (!this._urlStorageKey) return;
	      this._urlStorage.removeUpload(this._urlStorageKey)["catch"](function (err) {
	        _this10._emitError(err);
	      });
	      this._urlStorageKey = null;
	    }

	    /**
	     * Add the upload URL to the URL storage, if possible.
	     *
	     * @api private
	     */
	  }, {
	    key: "_saveUploadInUrlStorage",
	    value: function _saveUploadInUrlStorage() {
	      var _this11 = this;
	      // We do not store the upload URL
	      // - if it was disabled in the option, or
	      // - if no fingerprint was calculated for the input (i.e. a stream), or
	      // - if the URL is already stored (i.e. key is set alread).
	      if (!this.options.storeFingerprintForResuming || !this._fingerprint || this._urlStorageKey !== null) {
	        return Promise.resolve();
	      }
	      var storedUpload = {
	        size: this._size,
	        metadata: this.options.metadata,
	        creationTime: new Date().toString()
	      };
	      if (this._parallelUploads) {
	        // Save multiple URLs if the parallelUploads option is used ...
	        storedUpload.parallelUploadUrls = this._parallelUploadUrls;
	      } else {
	        // ... otherwise we just save the one available URL.
	        storedUpload.uploadUrl = this.url;
	      }
	      return this._urlStorage.addUpload(this._fingerprint, storedUpload).then(function (urlStorageKey) {
	        _this11._urlStorageKey = urlStorageKey;
	      });
	    }

	    /**
	     * Send a request with the provided body.
	     *
	     * @api private
	     */
	  }, {
	    key: "_sendRequest",
	    value: function _sendRequest(req) {
	      var body = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
	      return sendRequest(req, body, this.options);
	    }
	  }], [{
	    key: "terminate",
	    value: function terminate(url) {
	      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	      var req = openRequest('DELETE', url, options);
	      return sendRequest(req, null, options).then(function (res) {
	        // A 204 response indicates a successfull request
	        if (res.getStatus() === 204) {
	          return;
	        }
	        throw new DetailedError('tus: unexpected response while terminating upload', null, req, res);
	      })["catch"](function (err) {
	        if (!(err instanceof DetailedError)) {
	          err = new DetailedError('tus: failed to terminate upload', err, req, null);
	        }
	        if (!shouldRetry(err, 0, options)) {
	          throw err;
	        }

	        // Instead of keeping track of the retry attempts, we remove the first element from the delays
	        // array. If the array is empty, all retry attempts are used up and we will bubble up the error.
	        // We recursively call the terminate function will removing elements from the retryDelays array.
	        var delay = options.retryDelays[0];
	        var remainingDelays = options.retryDelays.slice(1);
	        var newOptions = _objectSpread$1(_objectSpread$1({}, options), {}, {
	          retryDelays: remainingDelays
	        });
	        return new Promise(function (resolve) {
	          return setTimeout(resolve, delay);
	        }).then(function () {
	          return BaseUpload.terminate(url, newOptions);
	        });
	      });
	    }
	  }]);
	}();
	function encodeMetadata(metadata) {
	  return Object.entries(metadata).map(function (_ref3) {
	    var _ref4 = _slicedToArray(_ref3, 2),
	      key = _ref4[0],
	      value = _ref4[1];
	    return "".concat(key, " ").concat(gBase64.encode(String(value)));
	  }).join(',');
	}

	/**
	 * Checks whether a given status is in the range of the expected category.
	 * For example, only a status between 200 and 299 will satisfy the category 200.
	 *
	 * @api private
	 */
	function inStatusCategory(status, category) {
	  return status >= category && status < category + 100;
	}

	/**
	 * Create a new HTTP request with the specified method and URL.
	 * The necessary headers that are included in every request
	 * will be added, including the request ID.
	 *
	 * @api private
	 */
	function openRequest(method, url, options) {
	  var req = options.httpStack.createRequest(method, url);
	  if (options.protocol === PROTOCOL_IETF_DRAFT_03) {
	    req.setHeader('Upload-Draft-Interop-Version', '5');
	  } else if (options.protocol === PROTOCOL_IETF_DRAFT_05) {
	    req.setHeader('Upload-Draft-Interop-Version', '6');
	  } else {
	    req.setHeader('Tus-Resumable', '1.0.0');
	  }
	  var headers = options.headers || {};
	  for (var _i2 = 0, _Object$entries = Object.entries(headers); _i2 < _Object$entries.length; _i2++) {
	    var _Object$entries$_i = _slicedToArray(_Object$entries[_i2], 2),
	      name = _Object$entries$_i[0],
	      value = _Object$entries$_i[1];
	    req.setHeader(name, value);
	  }
	  if (options.addRequestId) {
	    var requestId = uuid();
	    req.setHeader('X-Request-ID', requestId);
	  }
	  return req;
	}

	/**
	 * Send a request with the provided body while invoking the onBeforeRequest
	 * and onAfterResponse callbacks.
	 *
	 * @api private
	 */
	function sendRequest(_x, _x2, _x3) {
	  return _sendRequest2.apply(this, arguments);
	}
	/**
	 * Checks whether the browser running this code has internet access.
	 * This function will always return true in the node.js environment
	 *
	 * @api private
	 */
	function _sendRequest2() {
	  _sendRequest2 = _asyncToGenerator$1( /*#__PURE__*/_regeneratorRuntime$1().mark(function _callee(req, body, options) {
	    var res;
	    return _regeneratorRuntime$1().wrap(function _callee$(_context) {
	      while (1) switch (_context.prev = _context.next) {
	        case 0:
	          if (!(typeof options.onBeforeRequest === 'function')) {
	            _context.next = 3;
	            break;
	          }
	          _context.next = 3;
	          return options.onBeforeRequest(req);
	        case 3:
	          _context.next = 5;
	          return req.send(body);
	        case 5:
	          res = _context.sent;
	          if (!(typeof options.onAfterResponse === 'function')) {
	            _context.next = 9;
	            break;
	          }
	          _context.next = 9;
	          return options.onAfterResponse(req, res);
	        case 9:
	          return _context.abrupt("return", res);
	        case 10:
	        case "end":
	          return _context.stop();
	      }
	    }, _callee);
	  }));
	  return _sendRequest2.apply(this, arguments);
	}
	function isOnline() {
	  var online = true;
	  // Note: We don't reference `window` here because the navigator object also exists
	  // in a Web Worker's context.
	  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
	    online = false;
	  }
	  return online;
	}

	/**
	 * Checks whether or not it is ok to retry a request.
	 * @param {Error|DetailedError} err the error returned from the last request
	 * @param {number} retryAttempt the number of times the request has already been retried
	 * @param {object} options tus Upload options
	 *
	 * @api private
	 */
	function shouldRetry(err, retryAttempt, options) {
	  // We only attempt a retry if
	  // - retryDelays option is set
	  // - we didn't exceed the maxium number of retries, yet, and
	  // - this error was caused by a request or it's response and
	  // - the error is server error (i.e. not a status 4xx except a 409 or 423) or
	  // a onShouldRetry is specified and returns true
	  // - the browser does not indicate that we are offline
	  if (options.retryDelays == null || retryAttempt >= options.retryDelays.length || err.originalRequest == null) {
	    return false;
	  }
	  if (options && typeof options.onShouldRetry === 'function') {
	    return options.onShouldRetry(err, retryAttempt, options);
	  }
	  return defaultOnShouldRetry(err);
	}

	/**
	 * determines if the request should be retried. Will only retry if not a status 4xx except a 409 or 423
	 * @param {DetailedError} err
	 * @returns {boolean}
	 */
	function defaultOnShouldRetry(err) {
	  var status = err.originalResponse ? err.originalResponse.getStatus() : 0;
	  return (!inStatusCategory(status, 400) || status === 409 || status === 423) && isOnline();
	}

	/**
	 * Resolve a relative link given the origin as source. For example,
	 * if a HTTP request to http://example.com/files/ returns a Location
	 * header with the value /upload/abc, the resolved URL will be:
	 * http://example.com/upload/abc
	 */
	function resolveUrl(origin, link) {
	  return new URL$1(link, origin).toString();
	}

	/**
	 * Calculate the start and end positions for the parts if an upload
	 * is split into multiple parallel requests.
	 *
	 * @param {number} totalSize The byte size of the upload, which will be split.
	 * @param {number} partCount The number in how many parts the upload will be split.
	 * @return {object[]}
	 * @api private
	 */
	function splitSizeIntoParts(totalSize, partCount) {
	  var partSize = Math.floor(totalSize / partCount);
	  var parts = [];
	  for (var i = 0; i < partCount; i++) {
	    parts.push({
	      start: partSize * i,
	      end: partSize * (i + 1)
	    });
	  }
	  parts[partCount - 1].end = totalSize;
	  return parts;
	}
	BaseUpload.defaultOptions = defaultOptions$1;

	var isReactNative = function isReactNative() {
	  return typeof navigator !== 'undefined' && typeof navigator.product === 'string' && navigator.product.toLowerCase() === 'reactnative';
	};

	/**
	 * uriToBlob resolves a URI to a Blob object. This is used for
	 * React Native to retrieve a file (identified by a file://
	 * URI) as a blob.
	 */
	function uriToBlob(uri) {
	  return new Promise(function (resolve, reject) {
	    var xhr = new XMLHttpRequest();
	    xhr.responseType = 'blob';
	    xhr.onload = function () {
	      var blob = xhr.response;
	      resolve(blob);
	    };
	    xhr.onerror = function (err) {
	      reject(err);
	    };
	    xhr.open('GET', uri);
	    xhr.send();
	  });
	}

	var isCordova = function isCordova() {
	  return typeof window !== 'undefined' && (typeof window.PhoneGap !== 'undefined' || typeof window.Cordova !== 'undefined' || typeof window.cordova !== 'undefined');
	};

	/**
	 * readAsByteArray converts a File object to a Uint8Array.
	 * This function is only used on the Apache Cordova platform.
	 * See https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-file/index.html#read-a-file
	 */
	function readAsByteArray(chunk) {
	  return new Promise(function (resolve, reject) {
	    var reader = new FileReader();
	    reader.onload = function () {
	      var value = new Uint8Array(reader.result);
	      resolve({
	        value: value
	      });
	    };
	    reader.onerror = function (err) {
	      reject(err);
	    };
	    reader.readAsArrayBuffer(chunk);
	  });
	}

	function _typeof$5(o) { "@babel/helpers - typeof"; return _typeof$5 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof$5(o); }
	function _classCallCheck$5(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	function _defineProperties$5(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey$5(descriptor.key), descriptor); } }
	function _createClass$5(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties$5(Constructor.prototype, protoProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
	function _toPropertyKey$5(t) { var i = _toPrimitive$5(t, "string"); return "symbol" == _typeof$5(i) ? i : i + ""; }
	function _toPrimitive$5(t, r) { if ("object" != _typeof$5(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r); if ("object" != _typeof$5(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return (String )(t); }
	var FileSource = /*#__PURE__*/function () {
	  // Make this.size a method
	  function FileSource(file) {
	    _classCallCheck$5(this, FileSource);
	    this._file = file;
	    this.size = file.size;
	  }
	  return _createClass$5(FileSource, [{
	    key: "slice",
	    value: function slice(start, end) {
	      // In Apache Cordova applications, a File must be resolved using
	      // FileReader instances, see
	      // https://cordova.apache.org/docs/en/8.x/reference/cordova-plugin-file/index.html#read-a-file
	      if (isCordova()) {
	        return readAsByteArray(this._file.slice(start, end));
	      }
	      var value = this._file.slice(start, end);
	      var done = end >= this.size;
	      return Promise.resolve({
	        value: value,
	        done: done
	      });
	    }
	  }, {
	    key: "close",
	    value: function close() {
	      // Nothing to do here since we don't need to release any resources.
	    }
	  }]);
	}();

	function _typeof$4(o) { "@babel/helpers - typeof"; return _typeof$4 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof$4(o); }
	function _classCallCheck$4(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	function _defineProperties$4(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey$4(descriptor.key), descriptor); } }
	function _createClass$4(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties$4(Constructor.prototype, protoProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
	function _toPropertyKey$4(t) { var i = _toPrimitive$4(t, "string"); return "symbol" == _typeof$4(i) ? i : i + ""; }
	function _toPrimitive$4(t, r) { if ("object" != _typeof$4(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r); if ("object" != _typeof$4(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return (String )(t); }
	function len(blobOrArray) {
	  if (blobOrArray === undefined) return 0;
	  if (blobOrArray.size !== undefined) return blobOrArray.size;
	  return blobOrArray.length;
	}

	/*
	  Typed arrays and blobs don't have a concat method.
	  This function helps StreamSource accumulate data to reach chunkSize.
	*/
	function concat(a, b) {
	  if (a.concat) {
	    // Is `a` an Array?
	    return a.concat(b);
	  }
	  if (a instanceof Blob) {
	    return new Blob([a, b], {
	      type: a.type
	    });
	  }
	  if (a.set) {
	    // Is `a` a typed array?
	    var c = new a.constructor(a.length + b.length);
	    c.set(a);
	    c.set(b, a.length);
	    return c;
	  }
	  throw new Error('Unknown data type');
	}
	var StreamSource = /*#__PURE__*/function () {
	  function StreamSource(reader) {
	    _classCallCheck$4(this, StreamSource);
	    this._buffer = undefined;
	    this._bufferOffset = 0;
	    this._reader = reader;
	    this._done = false;
	  }
	  return _createClass$4(StreamSource, [{
	    key: "slice",
	    value: function slice(start, end) {
	      if (start < this._bufferOffset) {
	        return Promise.reject(new Error("Requested data is before the reader's current offset"));
	      }
	      return this._readUntilEnoughDataOrDone(start, end);
	    }
	  }, {
	    key: "_readUntilEnoughDataOrDone",
	    value: function _readUntilEnoughDataOrDone(start, end) {
	      var _this = this;
	      var hasEnoughData = end <= this._bufferOffset + len(this._buffer);
	      if (this._done || hasEnoughData) {
	        var value = this._getDataFromBuffer(start, end);
	        var done = value == null ? this._done : false;
	        return Promise.resolve({
	          value: value,
	          done: done
	        });
	      }
	      return this._reader.read().then(function (_ref) {
	        var value = _ref.value,
	          done = _ref.done;
	        if (done) {
	          _this._done = true;
	        } else if (_this._buffer === undefined) {
	          _this._buffer = value;
	        } else {
	          _this._buffer = concat(_this._buffer, value);
	        }
	        return _this._readUntilEnoughDataOrDone(start, end);
	      });
	    }
	  }, {
	    key: "_getDataFromBuffer",
	    value: function _getDataFromBuffer(start, end) {
	      // Remove data from buffer before `start`.
	      // Data might be reread from the buffer if an upload fails, so we can only
	      // safely delete data when it comes *before* what is currently being read.
	      if (start > this._bufferOffset) {
	        this._buffer = this._buffer.slice(start - this._bufferOffset);
	        this._bufferOffset = start;
	      }
	      // If the buffer is empty after removing old data, all data has been read.
	      var hasAllDataBeenRead = len(this._buffer) === 0;
	      if (this._done && hasAllDataBeenRead) {
	        return null;
	      }
	      // We already removed data before `start`, so we just return the first
	      // chunk from the buffer.
	      return this._buffer.slice(0, end - start);
	    }
	  }, {
	    key: "close",
	    value: function close() {
	      if (this._reader.cancel) {
	        this._reader.cancel();
	      }
	    }
	  }]);
	}();

	function _typeof$3(o) { "@babel/helpers - typeof"; return _typeof$3 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof$3(o); }
	function _regeneratorRuntime() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: true, configurable: true, writable: true }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof$3(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: true }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(true); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = false, next; return next.value = t, next.done = true, next; }; return i.next = i; } } throw new TypeError(_typeof$3(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: true }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: true }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = false, next; } return next.done = true, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = false, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = true; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, true); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, true); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
	function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
	function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
	function _classCallCheck$3(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	function _defineProperties$3(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey$3(descriptor.key), descriptor); } }
	function _createClass$3(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties$3(Constructor.prototype, protoProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
	function _toPropertyKey$3(t) { var i = _toPrimitive$3(t, "string"); return "symbol" == _typeof$3(i) ? i : i + ""; }
	function _toPrimitive$3(t, r) { if ("object" != _typeof$3(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r); if ("object" != _typeof$3(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return (String )(t); }
	var FileReader$1 = /*#__PURE__*/function () {
	  function FileReader() {
	    _classCallCheck$3(this, FileReader);
	  }
	  return _createClass$3(FileReader, [{
	    key: "openFile",
	    value: function () {
	      var _openFile = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee(input, chunkSize) {
	        var blob;
	        return _regeneratorRuntime().wrap(function _callee$(_context) {
	          while (1) switch (_context.prev = _context.next) {
	            case 0:
	              if (!(isReactNative() && input && typeof input.uri !== 'undefined')) {
	                _context.next = 11;
	                break;
	              }
	              _context.prev = 1;
	              _context.next = 4;
	              return uriToBlob(input.uri);
	            case 4:
	              blob = _context.sent;
	              return _context.abrupt("return", new FileSource(blob));
	            case 8:
	              _context.prev = 8;
	              _context.t0 = _context["catch"](1);
	              throw new Error("tus: cannot fetch `file.uri` as Blob, make sure the uri is correct and accessible. ".concat(_context.t0));
	            case 11:
	              if (!(typeof input.slice === 'function' && typeof input.size !== 'undefined')) {
	                _context.next = 13;
	                break;
	              }
	              return _context.abrupt("return", Promise.resolve(new FileSource(input)));
	            case 13:
	              if (!(typeof input.read === 'function')) {
	                _context.next = 18;
	                break;
	              }
	              chunkSize = Number(chunkSize);
	              if (Number.isFinite(chunkSize)) {
	                _context.next = 17;
	                break;
	              }
	              return _context.abrupt("return", Promise.reject(new Error('cannot create source for stream without a finite value for the `chunkSize` option')));
	            case 17:
	              return _context.abrupt("return", Promise.resolve(new StreamSource(input, chunkSize)));
	            case 18:
	              return _context.abrupt("return", Promise.reject(new Error('source object may only be an instance of File, Blob, or Reader in this environment')));
	            case 19:
	            case "end":
	              return _context.stop();
	          }
	        }, _callee, null, [[1, 8]]);
	      }));
	      function openFile(_x, _x2) {
	        return _openFile.apply(this, arguments);
	      }
	      return openFile;
	    }()
	  }]);
	}();

	// TODO: Differenciate between input types

	/**
	 * Generate a fingerprint for a file which will be used the store the endpoint
	 *
	 * @param {File} file
	 * @param {Object} options
	 * @param {Function} callback
	 */
	function fingerprint(file, options) {
	  if (isReactNative()) {
	    return Promise.resolve(reactNativeFingerprint(file, options));
	  }
	  return Promise.resolve(['tus-br', file.name, file.type, file.size, file.lastModified, options.endpoint].join('-'));
	}
	function reactNativeFingerprint(file, options) {
	  var exifHash = file.exif ? hashCode(JSON.stringify(file.exif)) : 'noexif';
	  return ['tus-rn', file.name || 'noname', file.size || 'nosize', exifHash, options.endpoint].join('/');
	}
	function hashCode(str) {
	  // from https://stackoverflow.com/a/8831937/151666
	  var hash = 0;
	  if (str.length === 0) {
	    return hash;
	  }
	  for (var i = 0; i < str.length; i++) {
	    var _char = str.charCodeAt(i);
	    hash = (hash << 5) - hash + _char;
	    hash &= hash; // Convert to 32bit integer
	  }
	  return hash;
	}

	function _typeof$2(o) { "@babel/helpers - typeof"; return _typeof$2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof$2(o); }
	function _classCallCheck$2(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	function _defineProperties$2(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey$2(descriptor.key), descriptor); } }
	function _createClass$2(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties$2(Constructor.prototype, protoProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
	function _toPropertyKey$2(t) { var i = _toPrimitive$2(t, "string"); return "symbol" == _typeof$2(i) ? i : i + ""; }
	function _toPrimitive$2(t, r) { if ("object" != _typeof$2(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r); if ("object" != _typeof$2(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return (String )(t); }
	var XHRHttpStack = /*#__PURE__*/function () {
	  function XHRHttpStack() {
	    _classCallCheck$2(this, XHRHttpStack);
	  }
	  return _createClass$2(XHRHttpStack, [{
	    key: "createRequest",
	    value: function createRequest(method, url) {
	      return new Request(method, url);
	    }
	  }, {
	    key: "getName",
	    value: function getName() {
	      return 'XHRHttpStack';
	    }
	  }]);
	}();
	var Request = /*#__PURE__*/function () {
	  function Request(method, url) {
	    _classCallCheck$2(this, Request);
	    this._xhr = new XMLHttpRequest();
	    this._xhr.open(method, url, true);
	    this._method = method;
	    this._url = url;
	    this._headers = {};
	  }
	  return _createClass$2(Request, [{
	    key: "getMethod",
	    value: function getMethod() {
	      return this._method;
	    }
	  }, {
	    key: "getURL",
	    value: function getURL() {
	      return this._url;
	    }
	  }, {
	    key: "setHeader",
	    value: function setHeader(header, value) {
	      this._xhr.setRequestHeader(header, value);
	      this._headers[header] = value;
	    }
	  }, {
	    key: "getHeader",
	    value: function getHeader(header) {
	      return this._headers[header];
	    }
	  }, {
	    key: "setProgressHandler",
	    value: function setProgressHandler(progressHandler) {
	      // Test support for progress events before attaching an event listener
	      if (!('upload' in this._xhr)) {
	        return;
	      }
	      this._xhr.upload.onprogress = function (e) {
	        if (!e.lengthComputable) {
	          return;
	        }
	        progressHandler(e.loaded);
	      };
	    }
	  }, {
	    key: "send",
	    value: function send() {
	      var _this = this;
	      var body = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
	      return new Promise(function (resolve, reject) {
	        _this._xhr.onload = function () {
	          resolve(new Response(_this._xhr));
	        };
	        _this._xhr.onerror = function (err) {
	          reject(err);
	        };
	        _this._xhr.send(body);
	      });
	    }
	  }, {
	    key: "abort",
	    value: function abort() {
	      this._xhr.abort();
	      return Promise.resolve();
	    }
	  }, {
	    key: "getUnderlyingObject",
	    value: function getUnderlyingObject() {
	      return this._xhr;
	    }
	  }]);
	}();
	var Response = /*#__PURE__*/function () {
	  function Response(xhr) {
	    _classCallCheck$2(this, Response);
	    this._xhr = xhr;
	  }
	  return _createClass$2(Response, [{
	    key: "getStatus",
	    value: function getStatus() {
	      return this._xhr.status;
	    }
	  }, {
	    key: "getHeader",
	    value: function getHeader(header) {
	      return this._xhr.getResponseHeader(header);
	    }
	  }, {
	    key: "getBody",
	    value: function getBody() {
	      return this._xhr.responseText;
	    }
	  }, {
	    key: "getUnderlyingObject",
	    value: function getUnderlyingObject() {
	      return this._xhr;
	    }
	  }]);
	}();

	function _typeof$1(o) { "@babel/helpers - typeof"; return _typeof$1 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof$1(o); }
	function _classCallCheck$1(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	function _defineProperties$1(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey$1(descriptor.key), descriptor); } }
	function _createClass$1(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties$1(Constructor.prototype, protoProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
	function _toPropertyKey$1(t) { var i = _toPrimitive$1(t, "string"); return "symbol" == _typeof$1(i) ? i : i + ""; }
	function _toPrimitive$1(t, r) { if ("object" != _typeof$1(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r); if ("object" != _typeof$1(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return (String )(t); }
	var hasStorage = false;
	try {
	  // Note: localStorage does not exist in the Web Worker's context, so we must use window here.
	  hasStorage = 'localStorage' in window;

	  // Attempt to store and read entries from the local storage to detect Private
	  // Mode on Safari on iOS (see #49)
	  // If the key was not used before, we remove it from local storage again to
	  // not cause confusion where the entry came from.
	  var key = 'tusSupport';
	  var originalValue = localStorage.getItem(key);
	  localStorage.setItem(key, originalValue);
	  if (originalValue === null) localStorage.removeItem(key);
	} catch (e) {
	  // If we try to access localStorage inside a sandboxed iframe, a SecurityError
	  // is thrown. When in private mode on iOS Safari, a QuotaExceededError is
	  // thrown (see #49)
	  if (e.code === e.SECURITY_ERR || e.code === e.QUOTA_EXCEEDED_ERR) {
	    hasStorage = false;
	  } else {
	    throw e;
	  }
	}
	var canStoreURLs = hasStorage;
	var WebStorageUrlStorage = /*#__PURE__*/function () {
	  function WebStorageUrlStorage() {
	    _classCallCheck$1(this, WebStorageUrlStorage);
	  }
	  return _createClass$1(WebStorageUrlStorage, [{
	    key: "findAllUploads",
	    value: function findAllUploads() {
	      var results = this._findEntries('tus::');
	      return Promise.resolve(results);
	    }
	  }, {
	    key: "findUploadsByFingerprint",
	    value: function findUploadsByFingerprint(fingerprint) {
	      var results = this._findEntries("tus::".concat(fingerprint, "::"));
	      return Promise.resolve(results);
	    }
	  }, {
	    key: "removeUpload",
	    value: function removeUpload(urlStorageKey) {
	      localStorage.removeItem(urlStorageKey);
	      return Promise.resolve();
	    }
	  }, {
	    key: "addUpload",
	    value: function addUpload(fingerprint, upload) {
	      var id = Math.round(Math.random() * 1e12);
	      var key = "tus::".concat(fingerprint, "::").concat(id);
	      localStorage.setItem(key, JSON.stringify(upload));
	      return Promise.resolve(key);
	    }
	  }, {
	    key: "_findEntries",
	    value: function _findEntries(prefix) {
	      var results = [];
	      for (var i = 0; i < localStorage.length; i++) {
	        var _key = localStorage.key(i);
	        if (_key.indexOf(prefix) !== 0) continue;
	        try {
	          var upload = JSON.parse(localStorage.getItem(_key));
	          upload.urlStorageKey = _key;
	          results.push(upload);
	        } catch (_e) {
	          // The JSON parse error is intentionally ignored here, so a malformed
	          // entry in the storage cannot prevent an upload.
	        }
	      }
	      return results;
	    }
	  }]);
	}();

	function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
	function _createClass(Constructor, protoProps, staticProps) { if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
	function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
	function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
	function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
	function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
	function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
	function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
	function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
	function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), true).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
	function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
	function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
	function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
	var defaultOptions = _objectSpread(_objectSpread({}, BaseUpload.defaultOptions), {}, {
	  httpStack: new XHRHttpStack(),
	  fileReader: new FileReader$1(),
	  urlStorage: canStoreURLs ? new WebStorageUrlStorage() : new NoopUrlStorage(),
	  fingerprint: fingerprint
	});
	var Upload = /*#__PURE__*/function (_BaseUpload) {
	  function Upload() {
	    var file = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
	    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	    _classCallCheck(this, Upload);
	    options = _objectSpread(_objectSpread({}, defaultOptions), options);
	    return _callSuper(this, Upload, [file, options]);
	  }
	  _inherits(Upload, _BaseUpload);
	  return _createClass(Upload, null, [{
	    key: "terminate",
	    value: function terminate(url) {
	      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	      options = _objectSpread(_objectSpread({}, defaultOptions), options);
	      return BaseUpload.terminate(url, options);
	    }
	  }]);
	}(BaseUpload); // Note: We don't reference `window` here because these classes also exist in a Web Worker's context.

	/**
	 * Copyright (c) Starisian Technologies. All rights reserved.
	 *
	 * This file is part of the SPARXSTAR platform and is proprietary and confidential.
	 * Unauthorized copying, modification, distribution, or use of this file, via any medium,
	 * is strictly prohibited except as expressly permitted in writing by Starisian Technologies.
	 *
	 * License: Business Source License 1.1
	 * Change Date: January 1, 2036
	 * Change License: Starisian Community License
	 *
	 * See the LICENSE file in the repository root for full license terms.
	 */

	var sparxstarIntegration = {
	  /**
	   * Whether the integration layer is active.
	   * @type {boolean}
	   */
	  isAvailable: true,
	  /**
	   * Cached battery reading for deferred uploads.
	   * Updated by _readBattery if Battery API is available.
	   * @type {{level: number, charging: boolean}|null}
	   * @private
	   */
	  _battery: null,
	  /**
	   * Initialises integration and resolves environment data.
	   *
	   * @returns {Promise<Object>} Resolved environment payload
	   */
	  init: function init() {
	    this._readBattery();
	    return Promise.resolve(this.getEnvironmentData());
	  },
	  /**
	   * Returns current environment data.
	   * Prefers STARMUS_BOOTSTRAP if injected by the server.
	   *
	   * @returns {Object} Environment payload with tier, network, recordingSettings
	   */
	  getEnvironmentData: function getEnvironmentData() {
	    var bootstrap = typeof window !== "undefined" ? window.STARMUS_BOOTSTRAP : undefined;
	    if (bootstrap && bootstrap.tier) {
	      return {
	        tier: bootstrap.tier,
	        recordingSettings: bootstrap.tierConfig || {
	          uploadChunkSize: 524288
	        },
	        network: {
	          type: "unknown"
	        },
	        device: {},
	        browser: {}
	      };
	    }
	    return {
	      tier: typeof MediaRecorder !== "undefined" ? "A" : "C",
	      recordingSettings: {
	        uploadChunkSize: 524288
	      },
	      network: {
	        type: "unknown"
	      },
	      device: {},
	      browser: {}
	    };
	  },
	  /**
	   * Reports integration errors to the console (and to Sirus when available).
	   *
	   * @param {string} msg - Error identifier
	   * @param {Object} data - Supplemental error context
	   * @returns {void}
	   */
	  reportError: function reportError(msg, data) {
	    console.warn("[SparxstarIntegration] Error:", msg, data);
	    if (typeof window !== "undefined" && window.SirusError) {
	      window.SirusError.report(msg, data);
	    }
	  },
	  /**
	   * Returns true when battery is below 20% and not charging.
	   * Used by offline queue to defer uploads.
	   *
	   * @returns {boolean}
	   */
	  isBatteryCritical: function isBatteryCritical() {
	    var b = this._battery;
	    return b !== null && b.level < 0.2 && !b.charging;
	  },
	  /**
	   * Reads battery status using the Battery API when available.
	   * Result is cached in this._battery.
	   *
	   * @private
	   * @returns {void}
	   */
	  _readBattery: function _readBattery() {
	    var _this = this;
	    if (typeof navigator === "undefined" || typeof navigator.getBattery !== "function") {
	      return;
	    }
	    navigator.getBattery().then(function (battery) {
	      _this._battery = {
	        level: battery.level,
	        charging: battery.charging
	      };
	      battery.addEventListener("levelchange", function () {
	        _this._battery = {
	          level: battery.level,
	          charging: battery.charging
	        };
	      });
	      battery.addEventListener("chargingchange", function () {
	        _this._battery = {
	          level: battery.level,
	          charging: battery.charging
	        };
	      });
	    });
	  }
	};
	if (typeof window !== "undefined") {
	  window.SparxstarIntegration = sparxstarIntegration;
	}

	/**
	 * Copyright (c) Starisian Technologies. All rights reserved.
	 *
	 * This file is part of the SPARXSTAR platform and is proprietary and confidential.
	 * Unauthorized copying, modification, distribution, or use of this file, via any medium,
	 * is strictly prohibited except as expressly permitted in writing by Starisian Technologies.
	 *
	 * License: Business Source License 1.1
	 * Change Date: January 1, 2036
	 * Change License: Starisian Community License
	 *
	 * See the LICENSE file in the repository root for full license terms.
	 */


	/* ---- Circuit Breaker ---- */

	/**
	 * Simple circuit breaker that opens after repeated upload failures.
	 * Prevents hammering a broken endpoint while offline or during server errors.
	 */
	var UploadCircuitBreaker = /*#__PURE__*/function () {
	  function UploadCircuitBreaker() {
	    _classCallCheck$9(this, UploadCircuitBreaker);
	    this.failures = 0;
	    this.threshold = 3;
	    this.timeout = 60000;
	    this.state = "closed";
	    this.openedAt = null;
	  }
	  return _createClass$9(UploadCircuitBreaker, [{
	    key: "execute",
	    value: function () {
	      var _execute = _asyncToGenerator$2(/*#__PURE__*/_regenerator().m(function _callee(operation) {
	        var elapsed, result, _t;
	        return _regenerator().w(function (_context) {
	          while (1) switch (_context.p = _context.n) {
	            case 0:
	              if (!(this.state === "open")) {
	                _context.n = 2;
	                break;
	              }
	              elapsed = Date.now() - this.openedAt;
	              if (!(elapsed < this.timeout)) {
	                _context.n = 1;
	                break;
	              }
	              throw new Error("Upload circuit breaker open — too many failures");
	            case 1:
	              this.state = "half-open";
	            case 2:
	              _context.p = 2;
	              _context.n = 3;
	              return operation();
	            case 3:
	              result = _context.v;
	              if (this.state === "half-open") {
	                this.state = "closed";
	                this.failures = 0;
	              }
	              return _context.a(2, result);
	            case 4:
	              _context.p = 4;
	              _t = _context.v;
	              this.failures++;
	              if (this.failures >= this.threshold) {
	                this.state = "open";
	                this.openedAt = Date.now();
	                console.error("[CircuitBreaker] Opened after", this.failures, "failures");
	              }
	              throw _t;
	            case 5:
	              return _context.a(2);
	          }
	        }, _callee, this, [[2, 4]]);
	      }));
	      function execute(_x) {
	        return _execute.apply(this, arguments);
	      }
	      return execute;
	    }()
	  }]);
	}();
	var uploadCircuitBreaker = new UploadCircuitBreaker();

	/* ---- Config ---- */

	/**
	 * Returns a configuration object merged from tier-defaults and global overrides.
	 *
	 * @returns {Object} Upload configuration
	 */
	function getConfig() {
	  var envData = sparxstarIntegration.getEnvironmentData();
	  var settings = (envData === null || envData === void 0 ? void 0 : envData.recordingSettings) || {};
	  var defaults = {
	    chunkSize: settings.uploadChunkSize || 512 * 1024,
	    // max 512 KB per AGENTS.md
	    retryDelays: [0, 2000, 4000],
	    removeFingerprintOnSuccess: true,
	    maxChunkRetries: 3,
	    requestTimeoutMs: 5000,
	    endpoint: "",
	    nonce: ""
	  };
	  var globalCfg = typeof window !== "undefined" && (window.starmusTus || window.starmusConfig) || {};
	  return Object.assign({}, defaults, globalCfg);
	}

	/* ---- Helpers ---- */

	/**
	 * Sanitises a metadata value for TUS header transmission.
	 * Objects are JSON-encoded; all values have control characters stripped.
	 *
	 * @param {*} value
	 * @returns {string}
	 */
	function sanitizeMetadata(value) {
	  var raw = _typeof$9(value) === "object" ? JSON.stringify(value) : String(value || "");
	  return raw.replace(/[\r\n\t]/g, " ");
	}

	/**
	 * Normalises formFields to a plain object.
	 *
	 * @param {*} fields
	 * @returns {Object}
	 */
	function normalizeFormFields(fields) {
	  return fields && _typeof$9(fields) === "object" ? fields : {};
	}
	function createUploadId() {
	  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
	    return crypto.randomUUID();
	  }
	  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
	    var values = new Uint8Array(16);
	    crypto.getRandomValues(values);
	    var suffix = Array.from(values, function (value) {
	      return value.toString(16).padStart(2, "0");
	    }).join("");
	    return "starmus-upload-".concat(suffix);
	  }
	  throw new Error("Secure UUID generation is not available in this runtime");
	}

	/* ---- Direct Upload (fallback) ---- */

	/**
	 * Uploads a recording blob directly to the WordPress REST API using FormData.
	 * Used when TUS is unavailable or the endpoint is not configured.
	 *
	 * @param {Blob} blob - Audio blob
	 * @param {string} fileName - File name for the upload
	 * @param {Object} [formFields={}] - Form fields (language, consent, etc.)
	 * @param {Object} [metadata={}] - Additional metadata
	 * @param {string} [instanceId=''] - Recorder instance ID
	 * @param {function} [onProgress] - Progress callback (loaded, total)
	 * @returns {Promise<Object>} Server response
	 */
	function uploadDirect(_x2, _x3) {
	  return _uploadDirect.apply(this, arguments);
	}

	/* ---- TUS Upload ---- */

	/**
	 * Uploads a recording blob using the TUS resumable-upload protocol.
	 *
	 * @param {Blob} blob - Audio blob
	 * @param {string} fileName - File name for the upload
	 * @param {Object} [formFields={}] - Form fields
	 * @param {Object} [metadata={}] - Additional metadata
	 * @param {string} [instanceId=''] - Recorder instance ID
	 * @param {function} [onProgress] - Progress callback (bytesUploaded, bytesTotal)
	 * @returns {Promise<Object>} Server response
	 */
	function _uploadDirect() {
	  _uploadDirect = _asyncToGenerator$2(/*#__PURE__*/_regenerator().m(function _callee2(blob, fileName) {
	    var _cfg$endpoints;
	    var formFields,
	      metadata,
	      instanceId,
	      onProgress,
	      cfg,
	      nonce,
	      requestTimeoutMs,
	      endpoint,
	      fields,
	      fd,
	      uploadId,
	      _i,
	      _Object$entries,
	      _Object$entries$_i,
	      key,
	      val,
	      _args2 = arguments;
	    return _regenerator().w(function (_context2) {
	      while (1) switch (_context2.n) {
	        case 0:
	          formFields = _args2.length > 2 && _args2[2] !== undefined ? _args2[2] : {};
	          metadata = _args2.length > 3 && _args2[3] !== undefined ? _args2[3] : {};
	          instanceId = _args2.length > 4 && _args2[4] !== undefined ? _args2[4] : "";
	          onProgress = _args2.length > 5 ? _args2[5] : undefined;
	          cfg = getConfig();
	          nonce = cfg.nonce || "";
	          requestTimeoutMs = Number.isFinite(cfg.requestTimeoutMs) ? cfg.requestTimeoutMs : 5000;
	          endpoint = ((_cfg$endpoints = cfg.endpoints) === null || _cfg$endpoints === void 0 ? void 0 : _cfg$endpoints.directUpload) || "/wp-json/star-starmus-audio-recorder/v1/upload-fallback";
	          fields = normalizeFormFields(formFields);
	          if (blob instanceof Blob) {
	            _context2.n = 1;
	            break;
	          }
	          throw new Error("INVALID_BLOB_TYPE: blob must be a Blob instance");
	        case 1:
	          fd = new FormData();
	          uploadId = createUploadId();
	          fd.append("audio_file", blob, fileName);
	          fd.append("upload_uuid", uploadId);
	          for (_i = 0, _Object$entries = Object.entries(fields); _i < _Object$entries.length; _i++) {
	            _Object$entries$_i = _slicedToArray$1(_Object$entries[_i], 2), key = _Object$entries$_i[0], val = _Object$entries$_i[1];
	            fd.append(key, String(val));
	          }
	          if (metadata.transcript) {
	            fd.append("transcription", metadata.transcript);
	          }
	          if (metadata.calibration) {
	            fd.append("_starmus_calibration", JSON.stringify(metadata.calibration));
	          }
	          if (metadata.env) {
	            fd.append("_starmus_env", JSON.stringify(metadata.env));
	          }
	          if (metadata.tier) {
	            fd.append("tier", metadata.tier);
	          }
	          if (instanceId) {
	            fd.append("instanceId", instanceId);
	          }
	          return _context2.a(2, new Promise(function (resolve, reject) {
	            var xhr = new XMLHttpRequest();
	            var timeout = setTimeout(function () {
	              xhr.abort();
	              reject(new Error("Direct upload timed out after ".concat(requestTimeoutMs, "ms")));
	            }, requestTimeoutMs);
	            xhr.upload.addEventListener("progress", function (e) {
	              if (onProgress && e.lengthComputable) {
	                onProgress(e.loaded, e.total);
	              }
	            });
	            xhr.addEventListener("load", function () {
	              clearTimeout(timeout);
	              if (xhr.status >= 200 && xhr.status < 300) {
	                try {
	                  resolve(JSON.parse(xhr.responseText));
	                } catch (_unused) {
	                  resolve({
	                    success: true,
	                    raw: xhr.responseText
	                  });
	                }
	              } else {
	                reject(new Error("Direct upload failed: HTTP ".concat(xhr.status, " \u2014 ").concat(xhr.responseText)));
	              }
	            });
	            xhr.addEventListener("error", function () {
	              clearTimeout(timeout);
	              reject(new Error("Direct upload network error"));
	            });
	            xhr.addEventListener("abort", function () {
	              clearTimeout(timeout);
	              reject(new Error("Direct upload aborted"));
	            });
	            xhr.open("POST", endpoint);
	            if (nonce) {
	              xhr.setRequestHeader("X-WP-Nonce", nonce);
	            }
	            xhr.send(fd);
	          }));
	      }
	    }, _callee2);
	  }));
	  return _uploadDirect.apply(this, arguments);
	}
	function uploadTus(_x4, _x5) {
	  return _uploadTus.apply(this, arguments);
	}

	/* ---- Priority Upload (TUS → Direct fallback) ---- */

	/**
	 * Attempts TUS upload first; falls back to direct upload on failure.
	 * Wrapped in circuit breaker to prevent repeated hammering.
	 *
	 * @param {Object} options - Upload options
	 * @param {Blob} options.blob - Audio blob
	 * @param {string} options.fileName - File name
	 * @param {Object} [options.formFields={}] - Form fields
	 * @param {Object} [options.metadata={}] - Metadata
	 * @param {string} [options.instanceId=''] - Instance ID
	 * @param {function} [options.onProgress] - Progress callback
	 * @returns {Promise<Object>} Upload result
	 */
	function _uploadTus() {
	  _uploadTus = _asyncToGenerator$2(/*#__PURE__*/_regenerator().m(function _callee3(blob, fileName) {
	    var _cfg$endpoints2;
	    var formFields,
	      metadata,
	      instanceId,
	      _onProgress,
	      cfg,
	      nonce,
	      tusEndpoint,
	      fields,
	      uploadId,
	      tusMetadata,
	      _i2,
	      _Object$entries2,
	      _Object$entries2$_i,
	      key,
	      val,
	      headers,
	      _args3 = arguments;
	    return _regenerator().w(function (_context3) {
	      while (1) switch (_context3.n) {
	        case 0:
	          formFields = _args3.length > 2 && _args3[2] !== undefined ? _args3[2] : {};
	          metadata = _args3.length > 3 && _args3[3] !== undefined ? _args3[3] : {};
	          instanceId = _args3.length > 4 && _args3[4] !== undefined ? _args3[4] : "";
	          _onProgress = _args3.length > 5 ? _args3[5] : undefined;
	          cfg = getConfig();
	          nonce = cfg.nonce || "";
	          tusEndpoint = cfg.endpoint || ((_cfg$endpoints2 = cfg.endpoints) === null || _cfg$endpoints2 === void 0 ? void 0 : _cfg$endpoints2.tus) || "/wp-json/star-starmus-audio-recorder/v1/tus";
	          fields = normalizeFormFields(formFields);
	          uploadId = createUploadId(); // Flatten all metadata into TUS metadata (strings only)
	          tusMetadata = {
	            upload_uuid: sanitizeMetadata(uploadId),
	            filename: sanitizeMetadata(fileName),
	            filetype: sanitizeMetadata(blob.type),
	            instanceId: sanitizeMetadata(instanceId),
	            tier: sanitizeMetadata(metadata.tier || "C"),
	            transcript: sanitizeMetadata(metadata.transcript || ""),
	            calibration: sanitizeMetadata(metadata.calibration || ""),
	            env: sanitizeMetadata(metadata.env || "")
	          }; // Merge form fields into TUS metadata
	          for (_i2 = 0, _Object$entries2 = Object.entries(fields); _i2 < _Object$entries2.length; _i2++) {
	            _Object$entries2$_i = _slicedToArray$1(_Object$entries2[_i2], 2), key = _Object$entries2$_i[0], val = _Object$entries2$_i[1];
	            tusMetadata[key] = sanitizeMetadata(val);
	          }
	          headers = {};
	          if (nonce) {
	            headers["X-WP-Nonce"] = nonce;
	          }
	          return _context3.a(2, new Promise(function (resolve, reject) {
	            var upload = new Upload(blob, {
	              endpoint: tusEndpoint,
	              chunkSize: cfg.chunkSize,
	              retryDelays: cfg.retryDelays,
	              removeFingerprintOnSuccess: cfg.removeFingerprintOnSuccess,
	              checksumAlgorithm: "sha1",
	              metadata: tusMetadata,
	              headers: headers,
	              onProgress: function onProgress(bytesUploaded, bytesTotal) {
	                if (_onProgress) {
	                  _onProgress(bytesUploaded, bytesTotal);
	                }
	              },
	              onSuccess: function onSuccess() {
	                resolve({
	                  success: true,
	                  url: upload.url
	                });
	              },
	              onError: function onError(err) {
	                console.error("[TUS] Upload error:", err);
	                sparxstarIntegration.reportError("tus_upload_error", {
	                  error: err.message,
	                  instanceId: instanceId,
	                  tier: metadata.tier
	                });
	                reject(err);
	              }
	            });
	            upload.start();
	          }));
	      }
	    }, _callee3);
	  }));
	  return _uploadTus.apply(this, arguments);
	}
	function uploadWithPriority(_x6) {
	  return _uploadWithPriority.apply(this, arguments);
	}
	function _uploadWithPriority() {
	  _uploadWithPriority = _asyncToGenerator$2(/*#__PURE__*/_regenerator().m(function _callee5(_ref) {
	    var _cfg$endpoints3;
	    var blob, fileName, _ref$formFields, formFields, _ref$metadata, metadata, _ref$instanceId, instanceId, onProgress, cfg, hasTusEndpoint;
	    return _regenerator().w(function (_context5) {
	      while (1) switch (_context5.n) {
	        case 0:
	          blob = _ref.blob, fileName = _ref.fileName, _ref$formFields = _ref.formFields, formFields = _ref$formFields === void 0 ? {} : _ref$formFields, _ref$metadata = _ref.metadata, metadata = _ref$metadata === void 0 ? {} : _ref$metadata, _ref$instanceId = _ref.instanceId, instanceId = _ref$instanceId === void 0 ? "" : _ref$instanceId, onProgress = _ref.onProgress;
	          cfg = getConfig();
	          hasTusEndpoint = !!(cfg.endpoint || (_cfg$endpoints3 = cfg.endpoints) !== null && _cfg$endpoints3 !== void 0 && _cfg$endpoints3.tus);
	          return _context5.a(2, uploadCircuitBreaker.execute(/*#__PURE__*/_asyncToGenerator$2(/*#__PURE__*/_regenerator().m(function _callee4() {
	            var _t2;
	            return _regenerator().w(function (_context4) {
	              while (1) switch (_context4.p = _context4.n) {
	                case 0:
	                  if (!hasTusEndpoint) {
	                    _context4.n = 4;
	                    break;
	                  }
	                  _context4.p = 1;
	                  _context4.n = 2;
	                  return uploadTus(blob, fileName, formFields, metadata, instanceId, onProgress);
	                case 2:
	                  return _context4.a(2, _context4.v);
	                case 3:
	                  _context4.p = 3;
	                  _t2 = _context4.v;
	                  console.warn("[TUS] Falling back to direct upload:", _t2.message);
	                  sparxstarIntegration.reportError("tus_fallback_to_direct", {
	                    error: _t2.message,
	                    instanceId: instanceId
	                  });
	                case 4:
	                  return _context4.a(2, uploadDirect(blob, fileName, formFields, metadata, instanceId, onProgress));
	              }
	            }, _callee4, null, [[1, 3]]);
	          }))));
	      }
	    }, _callee5);
	  }));
	  return _uploadWithPriority.apply(this, arguments);
	}

	var es_array_map = {};

	var hasRequiredEs_array_map;

	function requireEs_array_map () {
		if (hasRequiredEs_array_map) return es_array_map;
		hasRequiredEs_array_map = 1;
		var $ = require_export();
		var $map = requireArrayIteration().map;
		var arrayMethodHasSpeciesSupport = requireArrayMethodHasSpeciesSupport();

		var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('map');

		// `Array.prototype.map` method
		// https://tc39.es/ecma262/#sec-array.prototype.map
		// with adding support of @@species
		$({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT }, {
		  map: function map(callbackfn /* , thisArg */) {
		    return $map(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
		  }
		});
		return es_array_map;
	}

	requireEs_array_map();

	/**
	 * Copyright (c) Starisian Technologies. All rights reserved.
	 *
	 * This file is part of the SPARXSTAR platform and is proprietary and confidential.
	 * Unauthorized copying, modification, distribution, or use of this file, via any medium,
	 * is strictly prohibited except as expressly permitted in writing by Starisian Technologies.
	 *
	 * License: Business Source License 1.1
	 * Change Date: January 1, 2036
	 * Change License: Starisian Community License
	 *
	 * See the LICENSE file in the repository root for full license terms.
	 */


	/** @type {Object} Queue configuration constants */
	var CONFIG = {
	  dbName: "StarmusSubmissions",
	  storeName: "pendingSubmissions",
	  dbVersion: 1,
	  maxRetries: 3,
	  retryDelays: [0, 5000, 10000],
	  maxBlobSizes: {
	    A: 20 * 1024 * 1024,
	    // 20 MB — Tier A
	    B: 10 * 1024 * 1024,
	    // 10 MB — Tier B
	    C: 5 * 1024 * 1024 // 5 MB  — Tier C (default)
	  },
	  defaultMaxBlobSize: 5 * 1024 * 1024
	};

	/**
	 * Resolves the maximum blob size permitted for the given metadata's tier.
	 *
	 * @param {Object} [metadata={}] - Submission metadata with optional tier property
	 * @returns {number} Maximum blob size in bytes
	 */
	function getMaxBlobSize() {
	  var _metadata$tier, _metadata$env;
	  var metadata = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	  var rawTier = metadata && _typeof$9(metadata) === "object" ? (_metadata$tier = metadata.tier) !== null && _metadata$tier !== void 0 ? _metadata$tier : (_metadata$env = metadata.env) === null || _metadata$env === void 0 ? void 0 : _metadata$env.tier : undefined;
	  if (typeof rawTier === "string" && Object.prototype.hasOwnProperty.call(CONFIG.maxBlobSizes, rawTier)) {
	    return CONFIG.maxBlobSizes[rawTier];
	  }
	  return CONFIG.defaultMaxBlobSize;
	}

	/** @private */
	var OfflineQueue = /*#__PURE__*/function () {
	  function OfflineQueue() {
	    _classCallCheck$9(this, OfflineQueue);
	    /** @type {IDBDatabase|null} */
	    this.db = null;
	    /** @type {boolean} */
	    this.isProcessing = false;
	  }

	  /**
	   * Opens (or creates) the IndexedDB database.
	   *
	   * @returns {Promise<void>}
	   */
	  return _createClass$9(OfflineQueue, [{
	    key: "init",
	    value: (function () {
	      var _init = _asyncToGenerator$2(/*#__PURE__*/_regenerator().m(function _callee() {
	        var _this = this;
	        var error;
	        return _regenerator().w(function (_context) {
	          while (1) switch (_context.n) {
	            case 0:
	              if (window.indexedDB) {
	                _context.n = 1;
	                break;
	              }
	              error = new Error("IndexedDB not supported");
	              console.error("[Offline] CRITICAL:", error.message);
	              this._reportStorageFailure("no_indexeddb", error);
	              throw error;
	            case 1:
	              return _context.a(2, new Promise(function (resolve, reject) {
	                var req = indexedDB.open(CONFIG.dbName, CONFIG.dbVersion);
	                req.onerror = function (e) {
	                  var error = e.target.error;
	                  console.error("[Offline] CRITICAL: DB open failed:", error);
	                  _this._reportStorageFailure("db_open_failed", error, {
	                    name: error.name,
	                    message: error.message,
	                    userAgent: navigator.userAgent
	                  });
	                  reject(error);
	                };
	                req.onblocked = function () {
	                  var error = new Error("DB open blocked — close other tabs");
	                  console.error("[Offline] CRITICAL:", error.message);
	                  _this._reportStorageFailure("db_blocked", error);
	                  reject(error);
	                };
	                req.onsuccess = function () {
	                  _this.db = req.result;
	                  _this.db.onversionchange = function () {
	                    _this.db.close();
	                    console.warn("[Offline] DB version changed — connection closed");
	                  };
	                  _this.db.onerror = function (event) {
	                    console.error("[Offline] DB runtime error:", event.target.error);
	                    _this._reportStorageFailure("db_runtime_error", event.target.error);
	                  };
	                  resolve();
	                };
	                req.onupgradeneeded = function (e) {
	                  var db = e.target.result;
	                  if (!db.objectStoreNames.contains(CONFIG.storeName)) {
	                    var store = db.createObjectStore(CONFIG.storeName, {
	                      keyPath: "id"
	                    });
	                    store.createIndex("timestamp", "timestamp", {
	                      unique: false
	                    });
	                    store.createIndex("retryCount", "retryCount", {
	                      unique: false
	                    });
	                  }
	                };
	              }));
	          }
	        }, _callee, this);
	      }));
	      function init() {
	        return _init.apply(this, arguments);
	      }
	      return init;
	    }()
	    /**
	     * Adds a submission to the queue.
	     *
	     * @param {string} instanceId
	     * @param {Blob} audioBlob
	     * @param {string} fileName
	     * @param {Object} [formFields={}]
	     * @param {Object} [metadata={}]
	     * @returns {Promise<string>} Submission ID
	     */
	    )
	  }, {
	    key: "add",
	    value: (function () {
	      var _add = _asyncToGenerator$2(/*#__PURE__*/_regenerator().m(function _callee2(instanceId, audioBlob, fileName) {
	        var _this2 = this;
	        var formFields,
	          metadata,
	          maxAllowedSize,
	          safeBlob,
	          item,
	          _args2 = arguments;
	        return _regenerator().w(function (_context2) {
	          while (1) switch (_context2.n) {
	            case 0:
	              formFields = _args2.length > 3 && _args2[3] !== undefined ? _args2[3] : {};
	              metadata = _args2.length > 4 && _args2[4] !== undefined ? _args2[4] : {};
	              if (this.db) {
	                _context2.n = 1;
	                break;
	              }
	              throw new Error("OfflineQueue: DB not initialised");
	            case 1:
	              maxAllowedSize = getMaxBlobSize(metadata);
	              if (!(audioBlob.size > maxAllowedSize)) {
	                _context2.n = 2;
	                break;
	              }
	              throw new Error("Audio too large (".concat((audioBlob.size / 1024 / 1024).toFixed(2), " MB); limit ").concat((maxAllowedSize / 1024 / 1024).toFixed(2), " MB"));
	            case 2:
	              safeBlob = new Blob([audioBlob], {
	                type: audioBlob.type
	              });
	              item = {
	                id: "starmus-offline-".concat(Date.now(), "-").concat(Math.random().toString(36).slice(2, 11)),
	                instanceId: instanceId,
	                fileName: fileName,
	                timestamp: Date.now(),
	                audioBlob: safeBlob,
	                formFields: formFields,
	                metadata: metadata,
	                retryCount: 0,
	                lastAttempt: null,
	                error: null
	              };
	              return _context2.a(2, new Promise(function (resolve, reject) {
	                var tx = _this2.db.transaction([CONFIG.storeName], "readwrite");
	                var store = tx.objectStore(CONFIG.storeName);
	                store.add(item);
	                tx.oncomplete = function () {
	                  debugLog("[Offline] Queued:", item.id);
	                  _this2._notifyQueueUpdate();
	                  resolve(item.id);
	                };
	                tx.onerror = function (ev) {
	                  return reject(ev.target.error);
	                };
	              }));
	          }
	        }, _callee2, this);
	      }));
	      function add(_x, _x2, _x3) {
	        return _add.apply(this, arguments);
	      }
	      return add;
	    }()
	    /**
	     * Retrieves all pending submissions.
	     *
	     * @returns {Promise<Array<Object>>}
	     */
	    )
	  }, {
	    key: "getAll",
	    value: (function () {
	      var _getAll = _asyncToGenerator$2(/*#__PURE__*/_regenerator().m(function _callee3() {
	        var _this3 = this;
	        return _regenerator().w(function (_context3) {
	          while (1) switch (_context3.n) {
	            case 0:
	              if (this.db) {
	                _context3.n = 1;
	                break;
	              }
	              return _context3.a(2, []);
	            case 1:
	              return _context3.a(2, new Promise(function (resolve, reject) {
	                var tx = _this3.db.transaction([CONFIG.storeName], "readonly");
	                var req = tx.objectStore(CONFIG.storeName).getAll();
	                req.onsuccess = function () {
	                  return resolve(req.result || []);
	                };
	                req.onerror = function () {
	                  return reject(req.error);
	                };
	              }));
	          }
	        }, _callee3, this);
	      }));
	      function getAll() {
	        return _getAll.apply(this, arguments);
	      }
	      return getAll;
	    }()
	    /**
	     * Removes a submission from the queue.
	     *
	     * @param {string} id
	     * @returns {Promise<void>}
	     */
	    )
	  }, {
	    key: "remove",
	    value: (function () {
	      var _remove = _asyncToGenerator$2(/*#__PURE__*/_regenerator().m(function _callee4(id) {
	        var _this4 = this;
	        return _regenerator().w(function (_context4) {
	          while (1) switch (_context4.n) {
	            case 0:
	              if (this.db) {
	                _context4.n = 1;
	                break;
	              }
	              return _context4.a(2);
	            case 1:
	              return _context4.a(2, new Promise(function (resolve, reject) {
	                var tx = _this4.db.transaction([CONFIG.storeName], "readwrite");
	                tx.objectStore(CONFIG.storeName).delete(id);
	                tx.oncomplete = function () {
	                  _this4._notifyQueueUpdate();
	                  resolve();
	                };
	                tx.onerror = function (ev) {
	                  return reject(ev.target.error);
	                };
	              }));
	          }
	        }, _callee4, this);
	      }));
	      function remove(_x4) {
	        return _remove.apply(this, arguments);
	      }
	      return remove;
	    }() /** @private */)
	  }, {
	    key: "_updateRetry",
	    value: (function () {
	      var _updateRetry2 = _asyncToGenerator$2(/*#__PURE__*/_regenerator().m(function _callee5(id, retryCount, error) {
	        var _this5 = this;
	        return _regenerator().w(function (_context5) {
	          while (1) switch (_context5.n) {
	            case 0:
	              if (this.db) {
	                _context5.n = 1;
	                break;
	              }
	              return _context5.a(2);
	            case 1:
	              return _context5.a(2, new Promise(function (resolve, reject) {
	                var tx = _this5.db.transaction([CONFIG.storeName], "readwrite");
	                var store = tx.objectStore(CONFIG.storeName);
	                var req = store.get(id);
	                req.onsuccess = function () {
	                  var item = req.result;
	                  if (item) {
	                    item.retryCount = retryCount;
	                    item.lastAttempt = Date.now();
	                    item.error = error || null;
	                    store.put(item);
	                  }
	                };
	                req.onerror = function (ev) {
	                  return reject(ev.target.error);
	                };
	                tx.oncomplete = function () {
	                  return resolve();
	                };
	              }));
	          }
	        }, _callee5, this);
	      }));
	      function _updateRetry(_x5, _x6, _x7) {
	        return _updateRetry2.apply(this, arguments);
	      }
	      return _updateRetry;
	    }()
	    /**
	     * Processes all pending submissions, skipping items that have hit retry limits
	     * or are within their backoff window.
	     *
	     * @returns {Promise<void>}
	     */
	    )
	  }, {
	    key: "processQueue",
	    value: (function () {
	      var _processQueue = _asyncToGenerator$2(/*#__PURE__*/_regenerator().m(function _callee6() {
	        var _sparxstarIntegration;
	        var pending, _iterator, _step, item, id, audioBlob, fileName, formFields, metadata, retryCount, instanceId, delay, msg, nonRetryable, _t, _t2, _t3;
	        return _regenerator().w(function (_context6) {
	          while (1) switch (_context6.p = _context6.n) {
	            case 0:
	              if (!(this.isProcessing || !navigator.onLine)) {
	                _context6.n = 1;
	                break;
	              }
	              return _context6.a(2);
	            case 1:
	              if (!((_sparxstarIntegration = sparxstarIntegration.isBatteryCritical) !== null && _sparxstarIntegration !== void 0 && _sparxstarIntegration.call(sparxstarIntegration))) {
	                _context6.n = 2;
	                break;
	              }
	              return _context6.a(2);
	            case 2:
	              this.isProcessing = true;
	              _context6.p = 3;
	              _context6.n = 4;
	              return this.getAll();
	            case 4:
	              pending = _context6.v;
	              if (!(pending.length === 0)) {
	                _context6.n = 5;
	                break;
	              }
	              return _context6.a(2);
	            case 5:
	              debugLog("[Offline] Processing ".concat(pending.length, " items"));
	              _iterator = _createForOfIteratorHelper$1(pending);
	              _context6.p = 6;
	              _iterator.s();
	            case 7:
	              if ((_step = _iterator.n()).done) {
	                _context6.n = 14;
	                break;
	              }
	              item = _step.value;
	              id = item.id, audioBlob = item.audioBlob, fileName = item.fileName, formFields = item.formFields, metadata = item.metadata, retryCount = item.retryCount, instanceId = item.instanceId;
	              if (!(retryCount >= CONFIG.maxRetries)) {
	                _context6.n = 8;
	                break;
	              }
	              return _context6.a(3, 13);
	            case 8:
	              if (!(item.lastAttempt !== null)) {
	                _context6.n = 9;
	                break;
	              }
	              delay = CONFIG.retryDelays[Math.min(retryCount, CONFIG.retryDelays.length - 1)];
	              if (!(Date.now() - item.lastAttempt < delay)) {
	                _context6.n = 9;
	                break;
	              }
	              return _context6.a(3, 13);
	            case 9:
	              _context6.p = 9;
	              _context6.n = 10;
	              return uploadWithPriority({
	                blob: audioBlob,
	                fileName: fileName,
	                formFields: formFields,
	                metadata: metadata,
	                instanceId: instanceId
	              });
	            case 10:
	              _context6.n = 11;
	              return this.remove(id);
	            case 11:
	              _context6.n = 13;
	              break;
	            case 12:
	              _context6.p = 12;
	              _t = _context6.v;
	              msg = _t && _t.message ? _t.message : String(_t);
	              nonRetryable = /400|Invalid JSON|QuotaExceeded/i.test(msg);
	              if (nonRetryable) {
	                _context6.n = 13;
	                break;
	              }
	              _context6.n = 13;
	              return this._updateRetry(id, retryCount + 1, msg);
	            case 13:
	              _context6.n = 7;
	              break;
	            case 14:
	              _context6.n = 16;
	              break;
	            case 15:
	              _context6.p = 15;
	              _t2 = _context6.v;
	              _iterator.e(_t2);
	            case 16:
	              _context6.p = 16;
	              _iterator.f();
	              return _context6.f(16);
	            case 17:
	              _context6.n = 19;
	              break;
	            case 18:
	              _context6.p = 18;
	              _t3 = _context6.v;
	              console.error("[Offline] Queue fatal:", _t3);
	            case 19:
	              _context6.p = 19;
	              this.isProcessing = false;
	              return _context6.f(19);
	            case 20:
	              return _context6.a(2);
	          }
	        }, _callee6, this, [[9, 12], [6, 15, 16, 17], [3, 18, 19, 20]]);
	      }));
	      function processQueue() {
	        return _processQueue.apply(this, arguments);
	      }
	      return processQueue;
	    }()
	    /**
	     * Sets up online/offline event listeners and a polling interval.
	     *
	     * @returns {void}
	     */
	    )
	  }, {
	    key: "setupNetworkListeners",
	    value: function setupNetworkListeners() {
	      var _this6 = this;
	      window.addEventListener("online", function () {
	        return _this6.processQueue();
	      });
	      setInterval(function () {
	        if (navigator.onLine) {
	          _this6.processQueue().catch(function () {});
	        }
	      }, 60 * 1000);
	    }

	    /** @private */
	  }, {
	    key: "_notifyQueueUpdate",
	    value: function _notifyQueueUpdate() {
	      var BUS = window.CommandBus || window.StarmusHooks;
	      if (!BUS || typeof BUS.dispatch !== "function") {
	        return;
	      }
	      this.getAll().then(function (queue) {
	        BUS.dispatch("starmus/offline/queue_updated", {
	          count: queue.length,
	          queue: queue.map(function (item) {
	            return {
	              id: item.id,
	              retryCount: item.retryCount,
	              error: item.error
	            };
	          })
	        });
	      });
	    }

	    /** @private */
	  }, {
	    key: "_reportStorageFailure",
	    value: function _reportStorageFailure(type, error) {
	      var details = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
	      var errorData = {
	        type: "offline_storage_".concat(type),
	        error: error.message,
	        details: _objectSpread2(_objectSpread2({}, details), {}, {
	          timestamp: Date.now()
	        })
	      };
	      if ("storage" in navigator && "estimate" in navigator.storage) {
	        navigator.storage.estimate().then(function (estimate) {
	          errorData.details.storageEstimate = {
	            usage: estimate.usage,
	            quota: estimate.quota
	          };
	          sparxstarIntegration.reportError(errorData.type, errorData);
	        });
	      } else {
	        sparxstarIntegration.reportError(errorData.type, errorData);
	      }
	      this._showUserError(type);
	    }

	    /** @private */
	  }, {
	    key: "_showUserError",
	    value: function _showUserError(type) {
	      var messages = {
	        no_indexeddb: "Your browser doesn't support offline storage. Recordings will upload immediately.",
	        db_open_failed: "Storage initialisation failed. Please check your browser settings.",
	        db_blocked: "Please close other tabs and try again.",
	        quota_exceeded: "Storage full. Please free up space or upload pending recordings."
	      };
	      var message = messages[type] || "Storage error occurred.";
	      console.error("[Offline] User message:", message);
	      if (window.CommandBus) {
	        window.CommandBus.dispatch("starmus/storage-error", {
	          type: type,
	          message: message
	        });
	      }
	    }
	  }]);
	}();
	var offlineQueue = new OfflineQueue();

	/**
	 * Returns the initialised OfflineQueue instance.
	 * Initialises database and network listeners on first call.
	 *
	 * @returns {Promise<OfflineQueue>}
	 */
	function getOfflineQueue() {
	  return _getOfflineQueue.apply(this, arguments);
	}

	/**
	 * Queues an audio submission for later upload.
	 *
	 * @param {string} instanceId
	 * @param {Blob} audioBlob
	 * @param {string} fileName
	 * @param {Object} formFields
	 * @param {Object} metadata
	 * @returns {Promise<string>} Unique submission ID
	 */
	function _getOfflineQueue() {
	  _getOfflineQueue = _asyncToGenerator$2(/*#__PURE__*/_regenerator().m(function _callee7() {
	    return _regenerator().w(function (_context7) {
	      while (1) switch (_context7.n) {
	        case 0:
	          if (offlineQueue.db) {
	            _context7.n = 2;
	            break;
	          }
	          _context7.n = 1;
	          return offlineQueue.init();
	        case 1:
	          offlineQueue.setupNetworkListeners();
	        case 2:
	          return _context7.a(2, offlineQueue);
	      }
	    }, _callee7);
	  }));
	  return _getOfflineQueue.apply(this, arguments);
	}
	function queueSubmission(_x8, _x9, _x0, _x1, _x10) {
	  return _queueSubmission.apply(this, arguments);
	}

	/**
	 * Returns the count of pending offline submissions.
	 *
	 * @returns {Promise<number>}
	 */
	function _queueSubmission() {
	  _queueSubmission = _asyncToGenerator$2(/*#__PURE__*/_regenerator().m(function _callee8(instanceId, audioBlob, fileName, formFields, metadata) {
	    var q;
	    return _regenerator().w(function (_context8) {
	      while (1) switch (_context8.n) {
	        case 0:
	          _context8.n = 1;
	          return getOfflineQueue();
	        case 1:
	          q = _context8.v;
	          return _context8.a(2, q.add(instanceId, audioBlob, fileName, formFields, metadata));
	      }
	    }, _callee8);
	  }));
	  return _queueSubmission.apply(this, arguments);
	}
	function getPendingCount() {
	  return _getPendingCount.apply(this, arguments);
	}

	/**
	 * Initialises the offline queue. Alias of getOfflineQueue.
	 *
	 * @returns {Promise<OfflineQueue>}
	 */
	function _getPendingCount() {
	  _getPendingCount = _asyncToGenerator$2(/*#__PURE__*/_regenerator().m(function _callee9() {
	    var q, list;
	    return _regenerator().w(function (_context9) {
	      while (1) switch (_context9.n) {
	        case 0:
	          _context9.n = 1;
	          return getOfflineQueue();
	        case 1:
	          q = _context9.v;
	          _context9.n = 2;
	          return q.getAll();
	        case 2:
	          list = _context9.v;
	          return _context9.a(2, list.length);
	      }
	    }, _callee9);
	  }));
	  return _getPendingCount.apply(this, arguments);
	}
	function initOffline() {
	  return getOfflineQueue();
	}
	if (typeof window !== "undefined") {
	  window.initOffline = initOffline;
	  window.StarmusOfflineQueue = getOfflineQueue;
	}

	/**
	 * Copyright (c) Starisian Technologies. All rights reserved.
	 *
	 * This file is part of the SPARXSTAR platform and is proprietary and confidential.
	 * Unauthorized copying, modification, distribution, or use of this file, via any medium,
	 * is strictly prohibited except as expressly permitted in writing by Starisian Technologies.
	 *
	 * License: Business Source License 1.1
	 * Change Date: January 1, 2036
	 * Change License: Starisian Community License
	 *
	 * See the LICENSE file in the repository root for full license terms.
	 */

	var _window$StarmusHooks;
	var subscribe = ((_window$StarmusHooks = window.StarmusHooks) === null || _window$StarmusHooks === void 0 ? void 0 : _window$StarmusHooks.subscribe) || function () {};

	/**
	 * Detects browser capability tier.
	 * Prefers the tier provided by SPARXSTAR environment data.
	 *
	 * @param {Object|null} [environmentData=null] - SPARXSTAR environment data
	 * @returns {'A'|'B'|'C'} Tier classification
	 */
	function detectTier() {
	  var environmentData = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
	  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
	    return "C";
	  }
	  if (typeof MediaRecorder === "undefined") {
	    return "C";
	  }
	  if (environmentData && environmentData.tier) {
	    return environmentData.tier;
	  }
	  if (!window.AudioContext && !window.webkitAudioContext) {
	    return "B";
	  }
	  return "A";
	}

	/**
	 * Initialises the core Starmus submission and tier-detection logic.
	 *
	 * @param {Object} store - Redux-style state store
	 * @param {string} instanceId - Unique recorder instance identifier
	 * @param {Object} env - Environment data (may be partial on first call)
	 * @returns {{ handleSubmit: function }}
	 */
	function initCore(store, instanceId, env) {
	  sparxstarIntegration.init().then(function (environmentData) {
	    var _enhancedEnv$network;
	    var tier = detectTier(environmentData);
	    var enhancedEnv = _objectSpread2(_objectSpread2(_objectSpread2({}, env), environmentData), {}, {
	      tier: tier,
	      sparxstar_available: sparxstarIntegration.isAvailable
	    });
	    store.dispatch({
	      type: "starmus/tier-ready",
	      payload: {
	        tier: tier
	      }
	    });
	    store.dispatch({
	      type: "starmus/env-update",
	      payload: enhancedEnv
	    });
	    window.dispatchEvent(new CustomEvent("starmus-ready", {
	      detail: {
	        instanceId: instanceId,
	        tier: tier,
	        environment: enhancedEnv
	      }
	    }));
	    console.log("[Core] Environment ready:", {
	      tier: tier,
	      sparxstar: sparxstarIntegration.isAvailable,
	      network: (_enhancedEnv$network = enhancedEnv.network) === null || _enhancedEnv$network === void 0 ? void 0 : _enhancedEnv$network.type
	    });
	  }).catch(function (error) {
	    console.error("[Core] Environment initialisation failed:", error);
	    var tier = detectTier();
	    store.dispatch({
	      type: "starmus/tier-ready",
	      payload: {
	        tier: tier
	      }
	    });
	    window.dispatchEvent(new CustomEvent("starmus-ready", {
	      detail: {
	        instanceId: instanceId,
	        tier: tier
	      }
	    }));
	  });

	  /**
	   * Handles audio submission: attempts upload, falls back to offline queue.
	   *
	   * @param {Object} formFields - Form data from the recorder form
	   * @returns {Promise<void>}
	   */
	  function handleSubmit(_x) {
	    return _handleSubmit.apply(this, arguments);
	  }
	  function _handleSubmit() {
	    _handleSubmit = _asyncToGenerator$2(/*#__PURE__*/_regenerator().m(function _callee(formFields) {
	      var _source$transcript;
	      var state, source, calibration, currentEnvData, stateEnv, audioBlob, fileName, metadata, result, _result$data, _result$data2, redirect, submissionId, pending, _t, _t2;
	      return _regenerator().w(function (_context) {
	        while (1) switch (_context.p = _context.n) {
	          case 0:
	            state = store.getState();
	            source = state.source || {};
	            calibration = state.calibration || {};
	            currentEnvData = sparxstarIntegration.getEnvironmentData();
	            stateEnv = _objectSpread2(_objectSpread2(_objectSpread2(_objectSpread2({}, state.env), env), currentEnvData), {}, {
	              submission_timestamp: Date.now()
	            });
	            audioBlob = source.blob || source.file;
	            fileName = source.fileName || (source.file ? source.file.name : "rec-".concat(Date.now(), ".webm"));
	            if (audioBlob) {
	              _context.n = 1;
	              break;
	            }
	            console.error("[Core] No audio recording found.");
	            return _context.a(2);
	          case 1:
	            metadata = {
	              transcript: ((_source$transcript = source.transcript) === null || _source$transcript === void 0 ? void 0 : _source$transcript.trim()) || null,
	              calibration: calibration.complete ? {
	                gain: calibration.gain,
	                speechLevel: calibration.speechLevel
	              } : null,
	              env: stateEnv,
	              tier: stateEnv.tier || (currentEnvData === null || currentEnvData === void 0 ? void 0 : currentEnvData.tier) || "C"
	            };
	            store.dispatch({
	              type: "starmus/submit-start"
	            });
	            _context.p = 2;
	            if (navigator.onLine) {
	              _context.n = 3;
	              break;
	            }
	            throw new Error("OFFLINE_FAST_PATH");
	          case 3:
	            _context.n = 4;
	            return uploadWithPriority({
	              blob: audioBlob,
	              fileName: fileName,
	              formFields: formFields,
	              metadata: metadata,
	              instanceId: instanceId,
	              onProgress: function onProgress(uploaded, total) {
	                return store.dispatch({
	                  type: "starmus/submit-progress",
	                  progress: uploaded / total
	                });
	              }
	            });
	          case 4:
	            result = _context.v;
	            store.dispatch({
	              type: "starmus/submit-complete",
	              payload: result
	            });

	            // Fire redirect if server provided one
	            if (result && result.success) {
	              redirect = ((_result$data = result.data) === null || _result$data === void 0 ? void 0 : _result$data.redirect_url) || result.redirect_url;
	              if (redirect) {
	                setTimeout(function () {
	                  window.location.href = redirect;
	                }, 1500);
	              }

	              // Notify parent frame (modal context) safely
	              if ((_result$data2 = result.data) !== null && _result$data2 !== void 0 && _result$data2.post_id) {
	                try {
	                  if (window.parent && window.parent !== window) {
	                    void window.parent.location.href; // Throws if cross-origin
	                    if (window.parent.jQuery) {
	                      window.parent.jQuery(window.parent.document).trigger("starmusRecordingComplete", [{
	                        audioPostId: result.data.post_id
	                      }]);
	                    }
	                  }
	                } catch (_unused) {
	                  // Cross-origin — silently skip
	                }
	              }
	            }
	            _context.n = 10;
	            break;
	          case 5:
	            _context.p = 5;
	            _t = _context.v;
	            console.error("[Core] Upload failed:", _t.message);
	            sparxstarIntegration.reportError("upload_failed", {
	              error: _t.message,
	              instanceId: instanceId,
	              tier: stateEnv.tier,
	              network: stateEnv.network,
	              fileSize: audioBlob.size
	            });

	            // Offline fallback
	            _context.p = 6;
	            _context.n = 7;
	            return queueSubmission(instanceId, audioBlob, fileName, formFields, metadata);
	          case 7:
	            submissionId = _context.v;
	            store.dispatch({
	              type: "starmus/submit-queued",
	              submissionId: submissionId
	            });
	            _context.n = 8;
	            return getPendingCount();
	          case 8:
	            pending = _context.v;
	            if (window.CommandBus) {
	              window.CommandBus.dispatch("starmus/offline/queue_updated", {
	                count: pending
	              });
	            }
	            _context.n = 10;
	            break;
	          case 9:
	            _context.p = 9;
	            _t2 = _context.v;
	            console.error("[Core] Offline queue failed:", _t2);
	            store.dispatch({
	              type: "starmus/error",
	              error: {
	                message: "Upload failed completely.",
	                retryable: false
	              }
	            });
	          case 10:
	            return _context.a(2);
	        }
	      }, _callee, null, [[6, 9], [2, 5]]);
	    }));
	    return _handleSubmit.apply(this, arguments);
	  }
	  subscribe("submit", function (payload, meta) {
	    if (meta && meta.instanceId === instanceId) {
	      handleSubmit(payload.formFields || {});
	    }
	  });
	  subscribe("reset", function (_p, meta) {
	    if (meta && meta.instanceId === instanceId) {
	      store.dispatch({
	        type: "starmus/reset"
	      });
	    }
	  });
	  subscribe("continue", function (_p, meta) {
	    if (meta && meta.instanceId === instanceId) {
	      store.dispatch({
	        type: "starmus/ui/step-continue"
	      });
	    }
	  });
	  return {
	    handleSubmit: handleSubmit
	  };
	}
	if (typeof window !== "undefined") {
	  window.initCore = initCore;
	}

	var es_array_includes = {};

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

	var web_domCollections_iterator = {};

	var hasRequiredWeb_domCollections_iterator;

	function requireWeb_domCollections_iterator () {
		if (hasRequiredWeb_domCollections_iterator) return web_domCollections_iterator;
		hasRequiredWeb_domCollections_iterator = 1;
		var globalThis = requireGlobalThis();
		var DOMIterables = requireDomIterables();
		var DOMTokenListPrototype = requireDomTokenListPrototype();
		var ArrayIteratorMethods = requireEs_array_iterator();
		var createNonEnumerableProperty = requireCreateNonEnumerableProperty();
		var setToStringTag = requireSetToStringTag();
		var wellKnownSymbol = requireWellKnownSymbol();

		var ITERATOR = wellKnownSymbol('iterator');
		var ArrayValues = ArrayIteratorMethods.values;

		var handlePrototype = function (CollectionPrototype, COLLECTION_NAME) {
		  if (CollectionPrototype) {
		    // some Chrome versions have non-configurable methods on DOMTokenList
		    if (CollectionPrototype[ITERATOR] !== ArrayValues) try {
		      createNonEnumerableProperty(CollectionPrototype, ITERATOR, ArrayValues);
		    } catch (error) {
		      CollectionPrototype[ITERATOR] = ArrayValues;
		    }
		    setToStringTag(CollectionPrototype, COLLECTION_NAME, true);
		    if (DOMIterables[COLLECTION_NAME]) for (var METHOD_NAME in ArrayIteratorMethods) {
		      // some Chrome versions have non-configurable methods on DOMTokenList
		      if (CollectionPrototype[METHOD_NAME] !== ArrayIteratorMethods[METHOD_NAME]) try {
		        createNonEnumerableProperty(CollectionPrototype, METHOD_NAME, ArrayIteratorMethods[METHOD_NAME]);
		      } catch (error) {
		        CollectionPrototype[METHOD_NAME] = ArrayIteratorMethods[METHOD_NAME];
		      }
		    }
		  }
		};

		for (var COLLECTION_NAME in DOMIterables) {
		  handlePrototype(globalThis[COLLECTION_NAME] && globalThis[COLLECTION_NAME].prototype, COLLECTION_NAME);
		}

		handlePrototype(DOMTokenListPrototype, 'DOMTokenList');
		return web_domCollections_iterator;
	}

	requireWeb_domCollections_iterator();

	var web_url = {};

	var web_url_constructor = {};

	var urlConstructorDetection;
	var hasRequiredUrlConstructorDetection;

	function requireUrlConstructorDetection () {
		if (hasRequiredUrlConstructorDetection) return urlConstructorDetection;
		hasRequiredUrlConstructorDetection = 1;
		var fails = requireFails();
		var wellKnownSymbol = requireWellKnownSymbol();
		var DESCRIPTORS = requireDescriptors();
		var IS_PURE = requireIsPure();

		var ITERATOR = wellKnownSymbol('iterator');

		urlConstructorDetection = !fails(function () {
		  // eslint-disable-next-line unicorn/relative-url-style -- required for testing
		  var url = new URL('b?a=1&b=2&c=3', 'https://a');
		  var params = url.searchParams;
		  var params2 = new URLSearchParams('a=1&a=2&b=3');
		  var result = '';
		  url.pathname = 'c%20d';
		  params.forEach(function (value, key) {
		    params['delete']('b');
		    result += key + value;
		  });
		  params2['delete']('a', 2);
		  // `undefined` case is a Chromium 117 bug
		  // https://bugs.chromium.org/p/v8/issues/detail?id=14222
		  params2['delete']('b', undefined);
		  return (IS_PURE && (!url.toJSON || !params2.has('a', 1) || params2.has('a', 2) || !params2.has('a', undefined) || params2.has('b')))
		    || (!params.size && (IS_PURE || !DESCRIPTORS))
		    || !params.sort
		    || url.href !== 'https://a/c%20d?a=1&c=3'
		    || params.get('c') !== '3'
		    || String(new URLSearchParams('?a=1')) !== 'a=1'
		    || !params[ITERATOR]
		    // throws in Edge
		    || new URL('https://a@b').username !== 'a'
		    || new URLSearchParams(new URLSearchParams('a=b')).get('a') !== 'b'
		    // not punycoded in Edge
		    || new URL('https://тест').host !== 'xn--e1aybc'
		    // not escaped in Chrome 62-
		    || new URL('https://a#б').hash !== '#%D0%B1'
		    // fails in Chrome 66-
		    || result !== 'a1c3'
		    // throws in Safari
		    || new URL('https://x', undefined).host !== 'x';
		});
		return urlConstructorDetection;
	}

	var stringPunycodeToAscii;
	var hasRequiredStringPunycodeToAscii;

	function requireStringPunycodeToAscii () {
		if (hasRequiredStringPunycodeToAscii) return stringPunycodeToAscii;
		hasRequiredStringPunycodeToAscii = 1;
		// based on https://github.com/bestiejs/punycode.js/blob/master/punycode.js
		var uncurryThis = requireFunctionUncurryThis();

		var maxInt = 2147483647; // aka. 0x7FFFFFFF or 2^31-1
		var base = 36;
		var tMin = 1;
		var tMax = 26;
		var skew = 38;
		var damp = 700;
		var initialBias = 72;
		var initialN = 128; // 0x80
		var delimiter = '-'; // '\x2D'
		var regexNonASCII = /[^\0-\u007E]/; // non-ASCII chars
		var regexSeparators = /[.\u3002\uFF0E\uFF61]/g; // RFC 3490 separators
		var OVERFLOW_ERROR = 'Overflow: input needs wider integers to process';
		var baseMinusTMin = base - tMin;

		var $RangeError = RangeError;
		var exec = uncurryThis(regexSeparators.exec);
		var floor = Math.floor;
		var fromCharCode = String.fromCharCode;
		var charCodeAt = uncurryThis(''.charCodeAt);
		var join = uncurryThis([].join);
		var push = uncurryThis([].push);
		var replace = uncurryThis(''.replace);
		var split = uncurryThis(''.split);
		var toLowerCase = uncurryThis(''.toLowerCase);

		/**
		 * Creates an array containing the numeric code points of each Unicode
		 * character in the string. While JavaScript uses UCS-2 internally,
		 * this function will convert a pair of surrogate halves (each of which
		 * UCS-2 exposes as separate characters) into a single code point,
		 * matching UTF-16.
		 */
		var ucs2decode = function (string) {
		  var output = [];
		  var counter = 0;
		  var length = string.length;
		  while (counter < length) {
		    var value = charCodeAt(string, counter++);
		    if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
		      // It's a high surrogate, and there is a next character.
		      var extra = charCodeAt(string, counter++);
		      if ((extra & 0xFC00) === 0xDC00) { // Low surrogate.
		        push(output, ((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
		      } else {
		        // It's an unmatched surrogate; only append this code unit, in case the
		        // next code unit is the high surrogate of a surrogate pair.
		        push(output, value);
		        counter--;
		      }
		    } else {
		      push(output, value);
		    }
		  }
		  return output;
		};

		/**
		 * Converts a digit/integer into a basic code point.
		 */
		var digitToBasic = function (digit) {
		  //  0..25 map to ASCII a..z or A..Z
		  // 26..35 map to ASCII 0..9
		  return digit + 22 + 75 * (digit < 26);
		};

		/**
		 * Bias adaptation function as per section 3.4 of RFC 3492.
		 * https://tools.ietf.org/html/rfc3492#section-3.4
		 */
		var adapt = function (delta, numPoints, firstTime) {
		  var k = 0;
		  delta = firstTime ? floor(delta / damp) : delta >> 1;
		  delta += floor(delta / numPoints);
		  while (delta > baseMinusTMin * tMax >> 1) {
		    delta = floor(delta / baseMinusTMin);
		    k += base;
		  }
		  return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
		};

		/**
		 * Converts a string of Unicode symbols (e.g. a domain name label) to a
		 * Punycode string of ASCII-only symbols.
		 */
		var encode = function (input) {
		  var output = [];

		  // Convert the input in UCS-2 to an array of Unicode code points.
		  input = ucs2decode(input);

		  // Cache the length.
		  var inputLength = input.length;

		  // Initialize the state.
		  var n = initialN;
		  var delta = 0;
		  var bias = initialBias;
		  var i, currentValue;

		  // Handle the basic code points.
		  for (i = 0; i < input.length; i++) {
		    currentValue = input[i];
		    if (currentValue < 0x80) {
		      push(output, fromCharCode(currentValue));
		    }
		  }

		  var basicLength = output.length; // number of basic code points.
		  var handledCPCount = basicLength; // number of code points that have been handled;

		  // Finish the basic string with a delimiter unless it's empty.
		  if (basicLength) {
		    push(output, delimiter);
		  }

		  // Main encoding loop:
		  while (handledCPCount < inputLength) {
		    // All non-basic code points < n have been handled already. Find the next larger one:
		    var m = maxInt;
		    for (i = 0; i < input.length; i++) {
		      currentValue = input[i];
		      if (currentValue >= n && currentValue < m) {
		        m = currentValue;
		      }
		    }

		    // Increase `delta` enough to advance the decoder's <n,i> state to <m,0>, but guard against overflow.
		    var handledCPCountPlusOne = handledCPCount + 1;
		    if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
		      throw new $RangeError(OVERFLOW_ERROR);
		    }

		    delta += (m - n) * handledCPCountPlusOne;
		    n = m;

		    for (i = 0; i < input.length; i++) {
		      currentValue = input[i];
		      if (currentValue < n && ++delta > maxInt) {
		        throw new $RangeError(OVERFLOW_ERROR);
		      }
		      if (currentValue === n) {
		        // Represent delta as a generalized variable-length integer.
		        var q = delta;
		        var k = base;
		        while (true) {
		          var t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
		          if (q < t) break;
		          var qMinusT = q - t;
		          var baseMinusT = base - t;
		          push(output, fromCharCode(digitToBasic(t + qMinusT % baseMinusT)));
		          q = floor(qMinusT / baseMinusT);
		          k += base;
		        }

		        push(output, fromCharCode(digitToBasic(q)));
		        bias = adapt(delta, handledCPCountPlusOne, handledCPCount === basicLength);
		        delta = 0;
		        handledCPCount++;
		      }
		    }

		    delta++;
		    n++;
		  }
		  return join(output, '');
		};

		stringPunycodeToAscii = function (input) {
		  var encoded = [];
		  var labels = split(replace(toLowerCase(input), regexSeparators, '\u002E'), '.');
		  var i, label;
		  for (i = 0; i < labels.length; i++) {
		    label = labels[i];
		    push(encoded, exec(regexNonASCII, label) ? 'xn--' + encode(label) : label);
		  }
		  return join(encoded, '.');
		};
		return stringPunycodeToAscii;
	}

	var es_string_fromCodePoint = {};

	var hasRequiredEs_string_fromCodePoint;

	function requireEs_string_fromCodePoint () {
		if (hasRequiredEs_string_fromCodePoint) return es_string_fromCodePoint;
		hasRequiredEs_string_fromCodePoint = 1;
		var $ = require_export();
		var uncurryThis = requireFunctionUncurryThis();
		var toAbsoluteIndex = requireToAbsoluteIndex();

		var $RangeError = RangeError;
		var fromCharCode = String.fromCharCode;
		// eslint-disable-next-line es/no-string-fromcodepoint -- required for testing
		var $fromCodePoint = String.fromCodePoint;
		var join = uncurryThis([].join);

		// length should be 1, old FF problem
		var INCORRECT_LENGTH = !!$fromCodePoint && $fromCodePoint.length !== 1;

		// `String.fromCodePoint` method
		// https://tc39.es/ecma262/#sec-string.fromcodepoint
		$({ target: 'String', stat: true, arity: 1, forced: INCORRECT_LENGTH }, {
		  // eslint-disable-next-line no-unused-vars -- required for `.length`
		  fromCodePoint: function fromCodePoint(x) {
		    var elements = [];
		    var length = arguments.length;
		    var i = 0;
		    var code;
		    while (length > i) {
		      code = +arguments[i];
		      if (toAbsoluteIndex(code, 0x10FFFF) !== code) throw new $RangeError(code + ' is not a valid code point');
		      elements[i++] = code < 0x10000
		        ? fromCharCode(code)
		        : fromCharCode(((code -= 0x10000) >> 10) + 0xD800, code % 0x400 + 0xDC00);
		    } return join(elements, '');
		  }
		});
		return es_string_fromCodePoint;
	}

	var web_urlSearchParams_constructor;
	var hasRequiredWeb_urlSearchParams_constructor;

	function requireWeb_urlSearchParams_constructor () {
		if (hasRequiredWeb_urlSearchParams_constructor) return web_urlSearchParams_constructor;
		hasRequiredWeb_urlSearchParams_constructor = 1;
		// TODO: in core-js@4, move /modules/ dependencies to public entries for better optimization by tools like `preset-env`
		requireEs_array_iterator();
		requireEs_string_fromCodePoint();
		var $ = require_export();
		var globalThis = requireGlobalThis();
		var safeGetBuiltIn = requireSafeGetBuiltIn();
		var getBuiltIn = requireGetBuiltIn();
		var call = requireFunctionCall();
		var uncurryThis = requireFunctionUncurryThis();
		var DESCRIPTORS = requireDescriptors();
		var USE_NATIVE_URL = requireUrlConstructorDetection();
		var defineBuiltIn = requireDefineBuiltIn();
		var defineBuiltInAccessor = requireDefineBuiltInAccessor();
		var defineBuiltIns = requireDefineBuiltIns();
		var setToStringTag = requireSetToStringTag();
		var createIteratorConstructor = requireIteratorCreateConstructor();
		var InternalStateModule = requireInternalState();
		var anInstance = requireAnInstance();
		var isCallable = requireIsCallable();
		var hasOwn = requireHasOwnProperty();
		var bind = requireFunctionBindContext();
		var classof = requireClassof();
		var anObject = requireAnObject();
		var isObject = requireIsObject();
		var $toString = requireToString();
		var create = requireObjectCreate();
		var createPropertyDescriptor = requireCreatePropertyDescriptor();
		var getIterator = requireGetIterator();
		var getIteratorMethod = requireGetIteratorMethod();
		var createIterResultObject = requireCreateIterResultObject();
		var validateArgumentsLength = requireValidateArgumentsLength();
		var wellKnownSymbol = requireWellKnownSymbol();
		var arraySort = requireArraySort();

		var ITERATOR = wellKnownSymbol('iterator');
		var URL_SEARCH_PARAMS = 'URLSearchParams';
		var URL_SEARCH_PARAMS_ITERATOR = URL_SEARCH_PARAMS + 'Iterator';
		var setInternalState = InternalStateModule.set;
		var getInternalParamsState = InternalStateModule.getterFor(URL_SEARCH_PARAMS);
		var getInternalIteratorState = InternalStateModule.getterFor(URL_SEARCH_PARAMS_ITERATOR);

		var nativeFetch = safeGetBuiltIn('fetch');
		var NativeRequest = safeGetBuiltIn('Request');
		var Headers = safeGetBuiltIn('Headers');
		var RequestPrototype = NativeRequest && NativeRequest.prototype;
		var HeadersPrototype = Headers && Headers.prototype;
		var TypeError = globalThis.TypeError;
		var encodeURIComponent = globalThis.encodeURIComponent;
		var fromCharCode = String.fromCharCode;
		var fromCodePoint = getBuiltIn('String', 'fromCodePoint');
		var $parseInt = parseInt;
		var charAt = uncurryThis(''.charAt);
		var join = uncurryThis([].join);
		var push = uncurryThis([].push);
		var replace = uncurryThis(''.replace);
		var shift = uncurryThis([].shift);
		var splice = uncurryThis([].splice);
		var split = uncurryThis(''.split);
		var stringSlice = uncurryThis(''.slice);
		var exec = uncurryThis(/./.exec);

		var plus = /\+/g;
		var FALLBACK_REPLACER = '\uFFFD';
		var VALID_HEX = /^[0-9a-f]+$/i;

		var parseHexOctet = function (string, start) {
		  var substr = stringSlice(string, start, start + 2);
		  if (!exec(VALID_HEX, substr)) return NaN;

		  return $parseInt(substr, 16);
		};

		var getLeadingOnes = function (octet) {
		  var count = 0;
		  for (var mask = 0x80; mask > 0 && (octet & mask) !== 0; mask >>= 1) {
		    count++;
		  }
		  return count;
		};

		var utf8Decode = function (octets) {
		  var codePoint = null;
		  var length = octets.length;

		  switch (length) {
		    case 1:
		      codePoint = octets[0];
		      break;
		    case 2:
		      codePoint = (octets[0] & 0x1F) << 6 | (octets[1] & 0x3F);
		      break;
		    case 3:
		      codePoint = (octets[0] & 0x0F) << 12 | (octets[1] & 0x3F) << 6 | (octets[2] & 0x3F);
		      break;
		    case 4:
		      codePoint = (octets[0] & 0x07) << 18 | (octets[1] & 0x3F) << 12 | (octets[2] & 0x3F) << 6 | (octets[3] & 0x3F);
		      break;
		  }

		  // reject surrogates, overlong encodings, and out-of-range codepoints
		  if (codePoint === null
		    || codePoint > 0x10FFFF
		    || (codePoint >= 0xD800 && codePoint <= 0xDFFF)
		    || codePoint < (length > 3 ? 0x10000 : length > 2 ? 0x800 : length > 1 ? 0x80 : 0)
		  ) return null;

		  return codePoint;
		};

		/* eslint-disable max-statements, max-depth -- ok */
		var decode = function (input) {
		  input = replace(input, plus, ' ');
		  var length = input.length;
		  var result = '';
		  var i = 0;

		  while (i < length) {
		    var decodedChar = charAt(input, i);

		    if (decodedChar === '%') {
		      if (charAt(input, i + 1) === '%' || i + 3 > length) {
		        result += '%';
		        i++;
		        continue;
		      }

		      var octet = parseHexOctet(input, i + 1);

		      // eslint-disable-next-line no-self-compare -- NaN check
		      if (octet !== octet) {
		        result += decodedChar;
		        i++;
		        continue;
		      }

		      i += 2;
		      var byteSequenceLength = getLeadingOnes(octet);

		      if (byteSequenceLength === 0) {
		        decodedChar = fromCharCode(octet);
		      } else {
		        if (byteSequenceLength === 1 || byteSequenceLength > 4) {
		          result += FALLBACK_REPLACER;
		          i++;
		          continue;
		        }

		        var octets = [octet];
		        var sequenceIndex = 1;

		        while (sequenceIndex < byteSequenceLength) {
		          i++;
		          if (i + 3 > length || charAt(input, i) !== '%') break;

		          var nextByte = parseHexOctet(input, i + 1);

		          // eslint-disable-next-line no-self-compare -- NaN check
		          if (nextByte !== nextByte || nextByte > 191 || nextByte < 128) break;

		          // https://encoding.spec.whatwg.org/#utf-8-decoder - position-specific byte ranges
		          if (sequenceIndex === 1) {
		            if (octet === 0xE0 && nextByte < 0xA0) break;
		            if (octet === 0xED && nextByte > 0x9F) break;
		            if (octet === 0xF0 && nextByte < 0x90) break;
		            if (octet === 0xF4 && nextByte > 0x8F) break;
		          }

		          push(octets, nextByte);
		          i += 2;
		          sequenceIndex++;
		        }

		        if (octets.length !== byteSequenceLength) {
		          result += FALLBACK_REPLACER;
		          continue;
		        }

		        var codePoint = utf8Decode(octets);
		        if (codePoint === null) {
		          for (var replacement = 0; replacement < byteSequenceLength; replacement++) result += FALLBACK_REPLACER;
		          i++;
		          continue;
		        } else {
		          decodedChar = fromCodePoint(codePoint);
		        }
		      }
		    }

		    result += decodedChar;
		    i++;
		  }

		  return result;
		};
		/* eslint-enable max-statements, max-depth -- ok */

		var find = /[!'()~]|%20/g;

		var replacements = {
		  '!': '%21',
		  "'": '%27',
		  '(': '%28',
		  ')': '%29',
		  '~': '%7E',
		  '%20': '+'
		};

		var replacer = function (match) {
		  return replacements[match];
		};

		var serialize = function (it) {
		  return replace(encodeURIComponent(it), find, replacer);
		};

		var URLSearchParamsIterator = createIteratorConstructor(function Iterator(params, kind) {
		  setInternalState(this, {
		    type: URL_SEARCH_PARAMS_ITERATOR,
		    target: getInternalParamsState(params).entries,
		    index: 0,
		    kind: kind
		  });
		}, URL_SEARCH_PARAMS, function next() {
		  var state = getInternalIteratorState(this);
		  var target = state.target;
		  var index = state.index++;
		  if (!target || index >= target.length) {
		    state.target = null;
		    return createIterResultObject(undefined, true);
		  }
		  var entry = target[index];
		  switch (state.kind) {
		    case 'keys': return createIterResultObject(entry.key, false);
		    case 'values': return createIterResultObject(entry.value, false);
		  } return createIterResultObject([entry.key, entry.value], false);
		}, true);

		var URLSearchParamsState = function (init) {
		  this.entries = [];
		  this.url = null;

		  if (init !== undefined) {
		    if (isObject(init)) this.parseObject(init);
		    else this.parseQuery(typeof init == 'string' ? charAt(init, 0) === '?' ? stringSlice(init, 1) : init : $toString(init));
		  }
		};

		URLSearchParamsState.prototype = {
		  type: URL_SEARCH_PARAMS,
		  bindURL: function (url) {
		    this.url = url;
		    this.update();
		  },
		  parseObject: function (object) {
		    var entries = this.entries;
		    var iteratorMethod = getIteratorMethod(object);
		    var iterator, next, step, entryIterator, entryNext, first, second;

		    if (iteratorMethod) {
		      iterator = getIterator(object, iteratorMethod);
		      next = iterator.next;
		      while (!(step = call(next, iterator)).done) {
		        entryIterator = getIterator(anObject(step.value));
		        entryNext = entryIterator.next;
		        if (
		          (first = call(entryNext, entryIterator)).done ||
		          (second = call(entryNext, entryIterator)).done ||
		          !call(entryNext, entryIterator).done
		        ) throw new TypeError('Expected sequence with length 2');
		        push(entries, { key: $toString(first.value), value: $toString(second.value) });
		      }
		    } else for (var key in object) if (hasOwn(object, key)) {
		      push(entries, { key: key, value: $toString(object[key]) });
		    }
		  },
		  parseQuery: function (query) {
		    if (query) {
		      var entries = this.entries;
		      var attributes = split(query, '&');
		      var index = 0;
		      var attribute, entry;
		      while (index < attributes.length) {
		        attribute = attributes[index++];
		        if (attribute.length) {
		          entry = split(attribute, '=');
		          push(entries, {
		            key: decode(shift(entry)),
		            value: decode(join(entry, '='))
		          });
		        }
		      }
		    }
		  },
		  serialize: function () {
		    var entries = this.entries;
		    var result = [];
		    var index = 0;
		    var entry;
		    while (index < entries.length) {
		      entry = entries[index++];
		      push(result, serialize(entry.key) + '=' + serialize(entry.value));
		    } return join(result, '&');
		  },
		  update: function () {
		    this.entries.length = 0;
		    this.parseQuery(this.url.query);
		  },
		  updateURL: function () {
		    if (this.url) this.url.update();
		  }
		};

		// `URLSearchParams` constructor
		// https://url.spec.whatwg.org/#interface-urlsearchparams
		var URLSearchParamsConstructor = function URLSearchParams(/* init */) {
		  anInstance(this, URLSearchParamsPrototype);
		  var init = arguments.length > 0 ? arguments[0] : undefined;
		  var state = setInternalState(this, new URLSearchParamsState(init));
		  if (!DESCRIPTORS) this.size = state.entries.length;
		};

		var URLSearchParamsPrototype = URLSearchParamsConstructor.prototype;

		defineBuiltIns(URLSearchParamsPrototype, {
		  // `URLSearchParams.prototype.append` method
		  // https://url.spec.whatwg.org/#dom-urlsearchparams-append
		  append: function append(name, value) {
		    var state = getInternalParamsState(this);
		    validateArgumentsLength(arguments.length, 2);
		    push(state.entries, { key: $toString(name), value: $toString(value) });
		    if (!DESCRIPTORS) this.size++;
		    state.updateURL();
		  },
		  // `URLSearchParams.prototype.delete` method
		  // https://url.spec.whatwg.org/#dom-urlsearchparams-delete
		  'delete': function (name /* , value */) {
		    var state = getInternalParamsState(this);
		    var length = validateArgumentsLength(arguments.length, 1);
		    var entries = state.entries;
		    var key = $toString(name);
		    var $value = length < 2 ? undefined : arguments[1];
		    var value = $value === undefined ? $value : $toString($value);
		    var index = 0;
		    while (index < entries.length) {
		      var entry = entries[index];
		      if (entry.key === key && (value === undefined || entry.value === value)) {
		        splice(entries, index, 1);
		      } else index++;
		    }
		    if (!DESCRIPTORS) this.size = entries.length;
		    state.updateURL();
		  },
		  // `URLSearchParams.prototype.get` method
		  // https://url.spec.whatwg.org/#dom-urlsearchparams-get
		  get: function get(name) {
		    var entries = getInternalParamsState(this).entries;
		    validateArgumentsLength(arguments.length, 1);
		    var key = $toString(name);
		    var index = 0;
		    for (; index < entries.length; index++) {
		      if (entries[index].key === key) return entries[index].value;
		    }
		    return null;
		  },
		  // `URLSearchParams.prototype.getAll` method
		  // https://url.spec.whatwg.org/#dom-urlsearchparams-getall
		  getAll: function getAll(name) {
		    var entries = getInternalParamsState(this).entries;
		    validateArgumentsLength(arguments.length, 1);
		    var key = $toString(name);
		    var result = [];
		    var index = 0;
		    for (; index < entries.length; index++) {
		      if (entries[index].key === key) push(result, entries[index].value);
		    }
		    return result;
		  },
		  // `URLSearchParams.prototype.has` method
		  // https://url.spec.whatwg.org/#dom-urlsearchparams-has
		  has: function has(name /* , value */) {
		    var entries = getInternalParamsState(this).entries;
		    var length = validateArgumentsLength(arguments.length, 1);
		    var key = $toString(name);
		    var $value = length < 2 ? undefined : arguments[1];
		    var value = $value === undefined ? $value : $toString($value);
		    var index = 0;
		    while (index < entries.length) {
		      var entry = entries[index++];
		      if (entry.key === key && (value === undefined || entry.value === value)) return true;
		    }
		    return false;
		  },
		  // `URLSearchParams.prototype.set` method
		  // https://url.spec.whatwg.org/#dom-urlsearchparams-set
		  set: function set(name, value) {
		    var state = getInternalParamsState(this);
		    validateArgumentsLength(arguments.length, 2);
		    var entries = state.entries;
		    var found = false;
		    var key = $toString(name);
		    var val = $toString(value);
		    var index = 0;
		    var entry;
		    for (; index < entries.length; index++) {
		      entry = entries[index];
		      if (entry.key === key) {
		        if (found) splice(entries, index--, 1);
		        else {
		          found = true;
		          entry.value = val;
		        }
		      }
		    }
		    if (!found) push(entries, { key: key, value: val });
		    if (!DESCRIPTORS) this.size = entries.length;
		    state.updateURL();
		  },
		  // `URLSearchParams.prototype.sort` method
		  // https://url.spec.whatwg.org/#dom-urlsearchparams-sort
		  sort: function sort() {
		    var state = getInternalParamsState(this);
		    arraySort(state.entries, function (a, b) {
		      return a.key > b.key ? 1 : -1;
		    });
		    state.updateURL();
		  },
		  // `URLSearchParams.prototype.forEach` method
		  forEach: function forEach(callback /* , thisArg */) {
		    var entries = getInternalParamsState(this).entries;
		    var boundFunction = bind(callback, arguments.length > 1 ? arguments[1] : undefined);
		    var index = 0;
		    var entry;
		    while (index < entries.length) {
		      entry = entries[index++];
		      boundFunction(entry.value, entry.key, this);
		    }
		  },
		  // `URLSearchParams.prototype.keys` method
		  keys: function keys() {
		    return new URLSearchParamsIterator(this, 'keys');
		  },
		  // `URLSearchParams.prototype.values` method
		  values: function values() {
		    return new URLSearchParamsIterator(this, 'values');
		  },
		  // `URLSearchParams.prototype.entries` method
		  entries: function entries() {
		    return new URLSearchParamsIterator(this, 'entries');
		  }
		}, { enumerable: true });

		// `URLSearchParams.prototype[@@iterator]` method
		defineBuiltIn(URLSearchParamsPrototype, ITERATOR, URLSearchParamsPrototype.entries, { name: 'entries' });

		// `URLSearchParams.prototype.toString` method
		// https://url.spec.whatwg.org/#urlsearchparams-stringification-behavior
		defineBuiltIn(URLSearchParamsPrototype, 'toString', function toString() {
		  return getInternalParamsState(this).serialize();
		}, { enumerable: true });

		// `URLSearchParams.prototype.size` getter
		// https://url.spec.whatwg.org/#dom-urlsearchparams-size
		if (DESCRIPTORS) defineBuiltInAccessor(URLSearchParamsPrototype, 'size', {
		  get: function size() {
		    return getInternalParamsState(this).entries.length;
		  },
		  configurable: true,
		  enumerable: true
		});

		setToStringTag(URLSearchParamsConstructor, URL_SEARCH_PARAMS);

		$({ global: true, constructor: true, forced: !USE_NATIVE_URL }, {
		  URLSearchParams: URLSearchParamsConstructor
		});

		// Wrap `fetch` and `Request` for correct work with polyfilled `URLSearchParams`
		if (!USE_NATIVE_URL && isCallable(Headers)) {
		  var headersHas = uncurryThis(HeadersPrototype.has);
		  var headersSet = uncurryThis(HeadersPrototype.set);

		  var wrapRequestOptions = function (init) {
		    if (isObject(init)) {
		      var body = init.body;
		      var headers;
		      if (classof(body) === URL_SEARCH_PARAMS) {
		        headers = init.headers ? new Headers(init.headers) : new Headers();
		        if (!headersHas(headers, 'content-type')) {
		          headersSet(headers, 'content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
		        }
		        return create(init, {
		          body: createPropertyDescriptor(0, $toString(body)),
		          headers: createPropertyDescriptor(0, headers)
		        });
		      }
		    } return init;
		  };

		  if (isCallable(nativeFetch)) {
		    $({ global: true, enumerable: true, dontCallGetSet: true, forced: true }, {
		      fetch: function fetch(input /* , init */) {
		        return nativeFetch(input, arguments.length > 1 ? wrapRequestOptions(arguments[1]) : {});
		      }
		    });
		  }

		  if (isCallable(NativeRequest)) {
		    var RequestConstructor = function Request(input /* , init */) {
		      anInstance(this, RequestPrototype);
		      return new NativeRequest(input, arguments.length > 1 ? wrapRequestOptions(arguments[1]) : {});
		    };

		    RequestPrototype.constructor = RequestConstructor;
		    RequestConstructor.prototype = RequestPrototype;

		    $({ global: true, constructor: true, dontCallGetSet: true, forced: true }, {
		      Request: RequestConstructor
		    });
		  }
		}

		web_urlSearchParams_constructor = {
		  URLSearchParams: URLSearchParamsConstructor,
		  getState: getInternalParamsState
		};
		return web_urlSearchParams_constructor;
	}

	var hasRequiredWeb_url_constructor;

	function requireWeb_url_constructor () {
		if (hasRequiredWeb_url_constructor) return web_url_constructor;
		hasRequiredWeb_url_constructor = 1;
		// TODO: in core-js@4, move /modules/ dependencies to public entries for better optimization by tools like `preset-env`
		requireEs_string_iterator();
		var $ = require_export();
		var DESCRIPTORS = requireDescriptors();
		var USE_NATIVE_URL = requireUrlConstructorDetection();
		var globalThis = requireGlobalThis();
		var bind = requireFunctionBindContext();
		var uncurryThis = requireFunctionUncurryThis();
		var defineBuiltIn = requireDefineBuiltIn();
		var defineBuiltInAccessor = requireDefineBuiltInAccessor();
		var anInstance = requireAnInstance();
		var hasOwn = requireHasOwnProperty();
		var assign = requireObjectAssign();
		var arrayFrom = requireArrayFrom();
		var arraySlice = requireArraySlice();
		var codeAt = requireStringMultibyte().codeAt;
		var toASCII = requireStringPunycodeToAscii();
		var $toString = requireToString();
		var setToStringTag = requireSetToStringTag();
		var validateArgumentsLength = requireValidateArgumentsLength();
		var URLSearchParamsModule = requireWeb_urlSearchParams_constructor();
		var InternalStateModule = requireInternalState();

		var setInternalState = InternalStateModule.set;
		var getInternalURLState = InternalStateModule.getterFor('URL');
		var URLSearchParams = URLSearchParamsModule.URLSearchParams;
		var getInternalSearchParamsState = URLSearchParamsModule.getState;

		var NativeURL = globalThis.URL;
		var TypeError = globalThis.TypeError;
		var encodeURIComponent = globalThis.encodeURIComponent;
		var parseInt = globalThis.parseInt;
		var floor = Math.floor;
		var pow = Math.pow;
		var charAt = uncurryThis(''.charAt);
		var exec = uncurryThis(/./.exec);
		var join = uncurryThis([].join);
		var numberToString = uncurryThis(1.1.toString);
		var pop = uncurryThis([].pop);
		var push = uncurryThis([].push);
		var replace = uncurryThis(''.replace);
		var shift = uncurryThis([].shift);
		var split = uncurryThis(''.split);
		var stringSlice = uncurryThis(''.slice);
		var toLowerCase = uncurryThis(''.toLowerCase);
		var unshift = uncurryThis([].unshift);

		var INVALID_AUTHORITY = 'Invalid authority';
		var INVALID_SCHEME = 'Invalid scheme';
		var INVALID_HOST = 'Invalid host';
		var INVALID_PORT = 'Invalid port';

		var ALPHA = /[a-z]/i;
		var ALPHANUMERIC_PLUS_MINUS_DOT = /[\d+\-.a-z]/i;
		var DIGIT = /\d/;
		var HEX_START = /^0x/i;
		var OCT = /^[0-7]+$/;
		var DEC = /^\d+$/;
		var HEX = /^[\da-f]+$/i;
		/* eslint-disable regexp/no-control-character -- safe */
		var FORBIDDEN_HOST_CODE_POINT = /[\0\t\n\r #%/:<>?@[\\\]^|]/;
		var FORBIDDEN_HOST_CODE_POINT_EXCLUDING_PERCENT = /[\0\t\n\r #/:<>?@[\\\]^|]/;
		var LEADING_C0_CONTROL_OR_SPACE = /^[\u0000-\u0020]+/;
		var TRAILING_C0_CONTROL_OR_SPACE = /(^|[^\u0000-\u0020])[\u0000-\u0020]+$/;
		var TAB_AND_NEW_LINE = /[\t\n\r]/g;
		/* eslint-enable regexp/no-control-character -- safe */
		// eslint-disable-next-line no-unassigned-vars -- expected `undefined` value
		var EOF;

		// https://url.spec.whatwg.org/#ends-in-a-number-checker
		var endsInNumber = function (input) {
		  var parts = split(input, '.');
		  var last, hexPart;
		  if (parts[parts.length - 1] === '') {
		    if (parts.length === 1) return false;
		    parts.length--;
		  }
		  last = parts[parts.length - 1];
		  if (exec(DEC, last)) return true;
		  if (exec(HEX_START, last)) {
		    hexPart = stringSlice(last, 2);
		    return hexPart === '' || !!exec(HEX, hexPart);
		  }
		  return false;
		};

		// https://url.spec.whatwg.org/#concept-ipv4-parser
		var parseIPv4 = function (input) {
		  var parts = split(input, '.');
		  var partsLength, numbers, index, part, radix, number, ipv4;
		  if (parts.length && parts[parts.length - 1] === '') {
		    parts.length--;
		  }
		  partsLength = parts.length;
		  if (partsLength > 4) return null;
		  numbers = [];
		  for (index = 0; index < partsLength; index++) {
		    part = parts[index];
		    if (part === '') return null;
		    radix = 10;
		    if (part.length > 1 && charAt(part, 0) === '0') {
		      radix = exec(HEX_START, part) ? 16 : 8;
		      part = stringSlice(part, radix === 8 ? 1 : 2);
		    }
		    if (part === '') {
		      number = 0;
		    } else {
		      if (!exec(radix === 10 ? DEC : radix === 8 ? OCT : HEX, part)) return null;
		      number = parseInt(part, radix);
		    }
		    push(numbers, number);
		  }
		  for (index = 0; index < partsLength; index++) {
		    number = numbers[index];
		    if (index === partsLength - 1) {
		      if (number >= pow(256, 5 - partsLength)) return null;
		    } else if (number > 255) return null;
		  }
		  ipv4 = pop(numbers);
		  for (index = 0; index < numbers.length; index++) {
		    ipv4 += numbers[index] * pow(256, 3 - index);
		  }
		  return ipv4;
		};

		// https://url.spec.whatwg.org/#concept-ipv6-parser
		// eslint-disable-next-line max-statements -- TODO
		var parseIPv6 = function (input) {
		  var address = [0, 0, 0, 0, 0, 0, 0, 0];
		  var pieceIndex = 0;
		  var compress = null;
		  var pointer = 0;
		  var value, length, numbersSeen, ipv4Piece, number, swaps, swap;

		  var chr = function () {
		    return charAt(input, pointer);
		  };

		  if (chr() === ':') {
		    if (charAt(input, 1) !== ':') return;
		    pointer += 2;
		    pieceIndex++;
		    compress = pieceIndex;
		  }
		  while (chr()) {
		    if (pieceIndex === 8) return;
		    if (chr() === ':') {
		      if (compress !== null) return;
		      pointer++;
		      pieceIndex++;
		      compress = pieceIndex;
		      continue;
		    }
		    value = length = 0;
		    while (length < 4 && exec(HEX, chr())) {
		      value = value * 16 + parseInt(chr(), 16);
		      pointer++;
		      length++;
		    }
		    if (chr() === '.') {
		      if (length === 0) return;
		      pointer -= length;
		      if (pieceIndex > 6) return;
		      numbersSeen = 0;
		      while (chr()) {
		        ipv4Piece = null;
		        if (numbersSeen > 0) {
		          if (chr() === '.' && numbersSeen < 4) pointer++;
		          else return;
		        }
		        if (!exec(DIGIT, chr())) return;
		        while (exec(DIGIT, chr())) {
		          number = parseInt(chr(), 10);
		          if (ipv4Piece === null) ipv4Piece = number;
		          else if (ipv4Piece === 0) return;
		          else ipv4Piece = ipv4Piece * 10 + number;
		          if (ipv4Piece > 255) return;
		          pointer++;
		        }
		        address[pieceIndex] = address[pieceIndex] * 256 + ipv4Piece;
		        numbersSeen++;
		        if (numbersSeen === 2 || numbersSeen === 4) pieceIndex++;
		      }
		      if (numbersSeen !== 4) return;
		      break;
		    } else if (chr() === ':') {
		      pointer++;
		      if (!chr()) return;
		    } else if (chr()) return;
		    address[pieceIndex++] = value;
		  }
		  if (compress !== null) {
		    swaps = pieceIndex - compress;
		    pieceIndex = 7;
		    while (pieceIndex !== 0 && swaps > 0) {
		      swap = address[pieceIndex];
		      address[pieceIndex--] = address[compress + swaps - 1];
		      address[compress + --swaps] = swap;
		    }
		  } else if (pieceIndex !== 8) return;
		  return address;
		};

		var findLongestZeroSequence = function (ipv6) {
		  var maxIndex = null;
		  var maxLength = 1;
		  var currStart = null;
		  var currLength = 0;
		  var index = 0;
		  for (; index < 8; index++) {
		    if (ipv6[index] !== 0) {
		      if (currLength > maxLength) {
		        maxIndex = currStart;
		        maxLength = currLength;
		      }
		      currStart = null;
		      currLength = 0;
		    } else {
		      if (currStart === null) currStart = index;
		      ++currLength;
		    }
		  }
		  return currLength > maxLength ? currStart : maxIndex;
		};

		// https://url.spec.whatwg.org/#host-serializing
		var serializeHost = function (host) {
		  var result, index, compress, ignore0;

		  // ipv4
		  if (typeof host == 'number') {
		    result = [];
		    for (index = 0; index < 4; index++) {
		      unshift(result, host % 256);
		      host = floor(host / 256);
		    }
		    return join(result, '.');
		  }

		  // ipv6
		  if (typeof host == 'object') {
		    result = '';
		    compress = findLongestZeroSequence(host);
		    for (index = 0; index < 8; index++) {
		      if (ignore0 && host[index] === 0) continue;
		      if (ignore0) ignore0 = false;
		      if (compress === index) {
		        result += index ? ':' : '::';
		        ignore0 = true;
		      } else {
		        result += numberToString(host[index], 16);
		        if (index < 7) result += ':';
		      }
		    }
		    return '[' + result + ']';
		  }

		  return host;
		};

		var C0ControlPercentEncodeSet = {};
		var queryPercentEncodeSet = assign({}, C0ControlPercentEncodeSet, {
		  ' ': 1, '"': 1, '#': 1, '<': 1, '>': 1
		});
		var specialQueryPercentEncodeSet = assign({}, queryPercentEncodeSet, {
		  "'": 1
		});
		var fragmentPercentEncodeSet = assign({}, C0ControlPercentEncodeSet, {
		  ' ': 1, '"': 1, '<': 1, '>': 1, '`': 1
		});
		var pathPercentEncodeSet = assign({}, fragmentPercentEncodeSet, {
		  '#': 1, '?': 1, '{': 1, '}': 1, '^': 1
		});
		var userinfoPercentEncodeSet = assign({}, pathPercentEncodeSet, {
		  '/': 1, ':': 1, ';': 1, '=': 1, '@': 1, '[': 1, '\\': 1, ']': 1, '^': 1, '|': 1
		});

		var percentEncode = function (chr, set) {
		  var code = codeAt(chr, 0);
		  // encodeURIComponent does not encode ', which is in the special-query percent-encode set
		  return code >= 0x20 && code < 0x7F && !hasOwn(set, chr) ? chr : chr === "'" && hasOwn(set, chr) ? '%27' : encodeURIComponent(chr);
		};

		// https://url.spec.whatwg.org/#special-scheme
		var specialSchemes = {
		  ftp: 21,
		  file: null,
		  http: 80,
		  https: 443,
		  ws: 80,
		  wss: 443
		};

		// https://url.spec.whatwg.org/#windows-drive-letter
		var isWindowsDriveLetter = function (string, normalized) {
		  var second;
		  return string.length === 2 && exec(ALPHA, charAt(string, 0))
		    && ((second = charAt(string, 1)) === ':' || (!normalized && second === '|'));
		};

		// https://url.spec.whatwg.org/#start-with-a-windows-drive-letter
		var startsWithWindowsDriveLetter = function (string) {
		  var third;
		  return string.length > 1 && isWindowsDriveLetter(stringSlice(string, 0, 2)) && (
		    string.length === 2 ||
		    ((third = charAt(string, 2)) === '/' || third === '\\' || third === '?' || third === '#')
		  );
		};

		// https://url.spec.whatwg.org/#single-dot-path-segment
		var isSingleDot = function (segment) {
		  return segment === '.' || toLowerCase(segment) === '%2e';
		};

		// https://url.spec.whatwg.org/#double-dot-path-segment
		var isDoubleDot = function (segment) {
		  segment = toLowerCase(segment);
		  return segment === '..' || segment === '%2e.' || segment === '.%2e' || segment === '%2e%2e';
		};

		// States:
		var SCHEME_START = {};
		var SCHEME = {};
		var NO_SCHEME = {};
		var SPECIAL_RELATIVE_OR_AUTHORITY = {};
		var PATH_OR_AUTHORITY = {};
		var RELATIVE = {};
		var RELATIVE_SLASH = {};
		var SPECIAL_AUTHORITY_SLASHES = {};
		var SPECIAL_AUTHORITY_IGNORE_SLASHES = {};
		var AUTHORITY = {};
		var HOST = {};
		var HOSTNAME = {};
		var PORT = {};
		var FILE = {};
		var FILE_SLASH = {};
		var FILE_HOST = {};
		var PATH_START = {};
		var PATH = {};
		var CANNOT_BE_A_BASE_URL_PATH = {};
		var QUERY = {};
		var FRAGMENT = {};

		var URLState = function (url, isBase, base) {
		  var urlString = $toString(url);
		  var baseState, failure, searchParams;
		  if (isBase) {
		    failure = this.parse(urlString);
		    if (failure) throw new TypeError(failure);
		    this.searchParams = null;
		  } else {
		    if (base !== undefined) baseState = new URLState(base, true);
		    failure = this.parse(urlString, null, baseState);
		    if (failure) throw new TypeError(failure);
		    searchParams = getInternalSearchParamsState(new URLSearchParams());
		    searchParams.bindURL(this);
		    this.searchParams = searchParams;
		  }
		};

		URLState.prototype = {
		  type: 'URL',
		  // https://url.spec.whatwg.org/#url-parsing
		  // eslint-disable-next-line max-statements -- TODO
		  parse: function (input, stateOverride, base) {
		    var url = this;
		    var state = stateOverride || SCHEME_START;
		    var pointer = 0;
		    var buffer = '';
		    var seenAt = false;
		    var seenBracket = false;
		    var seenPasswordToken = false;
		    var codePoints, chr, bufferCodePoints, failure;

		    input = $toString(input);

		    if (!stateOverride) {
		      url.scheme = '';
		      url.username = '';
		      url.password = '';
		      url.host = null;
		      url.port = null;
		      url.path = [];
		      url.query = null;
		      url.fragment = null;
		      url.cannotBeABaseURL = false;
		      input = replace(input, LEADING_C0_CONTROL_OR_SPACE, '');
		      input = replace(input, TRAILING_C0_CONTROL_OR_SPACE, '$1');
		    }

		    input = replace(input, TAB_AND_NEW_LINE, '');

		    codePoints = arrayFrom(input);

		    while (pointer <= codePoints.length) {
		      chr = codePoints[pointer];
		      switch (state) {
		        case SCHEME_START:
		          if (chr && exec(ALPHA, chr)) {
		            buffer += toLowerCase(chr);
		            state = SCHEME;
		          } else if (!stateOverride) {
		            state = NO_SCHEME;
		            continue;
		          } else return INVALID_SCHEME;
		          break;

		        case SCHEME:
		          if (chr && exec(ALPHANUMERIC_PLUS_MINUS_DOT, chr)) {
		            buffer += toLowerCase(chr);
		          } else if (chr === ':') {
		            if (stateOverride && (
		              (url.isSpecial() !== hasOwn(specialSchemes, buffer)) ||
		              (buffer === 'file' && (url.includesCredentials() || url.port !== null)) ||
		              (url.scheme === 'file' && url.host === '')
		            )) return;
		            url.scheme = buffer;
		            if (stateOverride) {
		              if (url.isSpecial() && specialSchemes[url.scheme] === url.port) url.port = null;
		              return;
		            }
		            buffer = '';
		            if (url.scheme === 'file') {
		              state = FILE;
		            } else if (url.isSpecial() && base && base.scheme === url.scheme) {
		              state = SPECIAL_RELATIVE_OR_AUTHORITY;
		            } else if (url.isSpecial()) {
		              state = SPECIAL_AUTHORITY_SLASHES;
		            } else if (codePoints[pointer + 1] === '/') {
		              state = PATH_OR_AUTHORITY;
		              pointer++;
		            } else {
		              url.cannotBeABaseURL = true;
		              push(url.path, '');
		              state = CANNOT_BE_A_BASE_URL_PATH;
		            }
		          } else if (!stateOverride) {
		            buffer = '';
		            state = NO_SCHEME;
		            pointer = 0;
		            continue;
		          } else return INVALID_SCHEME;
		          break;

		        case NO_SCHEME:
		          if (!base || (base.cannotBeABaseURL && chr !== '#')) return INVALID_SCHEME;
		          if (base.cannotBeABaseURL && chr === '#') {
		            url.scheme = base.scheme;
		            url.path = arraySlice(base.path);
		            url.query = base.query;
		            url.fragment = '';
		            url.cannotBeABaseURL = true;
		            state = FRAGMENT;
		            break;
		          }
		          state = base.scheme === 'file' ? FILE : RELATIVE;
		          continue;

		        case SPECIAL_RELATIVE_OR_AUTHORITY:
		          if (chr === '/' && codePoints[pointer + 1] === '/') {
		            state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
		            pointer++;
		          } else {
		            state = RELATIVE;
		            continue;
		          } break;

		        case PATH_OR_AUTHORITY:
		          if (chr === '/') {
		            state = AUTHORITY;
		            break;
		          } else {
		            state = PATH;
		            continue;
		          }

		        case RELATIVE:
		          url.scheme = base.scheme;
		          if (chr === EOF) {
		            url.username = base.username;
		            url.password = base.password;
		            url.host = base.host;
		            url.port = base.port;
		            url.path = arraySlice(base.path);
		            url.query = base.query;
		          } else if (chr === '/' || (chr === '\\' && url.isSpecial())) {
		            state = RELATIVE_SLASH;
		          } else if (chr === '?') {
		            url.username = base.username;
		            url.password = base.password;
		            url.host = base.host;
		            url.port = base.port;
		            url.path = arraySlice(base.path);
		            url.query = '';
		            state = QUERY;
		          } else if (chr === '#') {
		            url.username = base.username;
		            url.password = base.password;
		            url.host = base.host;
		            url.port = base.port;
		            url.path = arraySlice(base.path);
		            url.query = base.query;
		            url.fragment = '';
		            state = FRAGMENT;
		          } else {
		            url.username = base.username;
		            url.password = base.password;
		            url.host = base.host;
		            url.port = base.port;
		            url.path = arraySlice(base.path);
		            if (url.path.length) url.path.length--;
		            state = PATH;
		            continue;
		          } break;

		        case RELATIVE_SLASH:
		          if (url.isSpecial() && (chr === '/' || chr === '\\')) {
		            state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
		          } else if (chr === '/') {
		            state = AUTHORITY;
		          } else {
		            url.username = base.username;
		            url.password = base.password;
		            url.host = base.host;
		            url.port = base.port;
		            state = PATH;
		            continue;
		          } break;

		        case SPECIAL_AUTHORITY_SLASHES:
		          state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
		          if (chr !== '/' || codePoints[pointer + 1] !== '/') continue;
		          pointer++;
		          break;

		        case SPECIAL_AUTHORITY_IGNORE_SLASHES:
		          if (chr !== '/' && chr !== '\\') {
		            state = AUTHORITY;
		            continue;
		          } break;

		        case AUTHORITY:
		          if (chr === '@') {
		            if (seenAt) buffer = '%40' + buffer;
		            seenAt = true;
		            bufferCodePoints = arrayFrom(buffer);
		            for (var i = 0; i < bufferCodePoints.length; i++) {
		              var codePoint = bufferCodePoints[i];
		              if (codePoint === ':' && !seenPasswordToken) {
		                seenPasswordToken = true;
		                continue;
		              }
		              var encodedCodePoints = percentEncode(codePoint, userinfoPercentEncodeSet);
		              if (seenPasswordToken) url.password += encodedCodePoints;
		              else url.username += encodedCodePoints;
		            }
		            buffer = '';
		          } else if (
		            chr === EOF || chr === '/' || chr === '?' || chr === '#' ||
		            (chr === '\\' && url.isSpecial())
		          ) {
		            if (seenAt && buffer === '') return INVALID_AUTHORITY;
		            pointer -= arrayFrom(buffer).length + 1;
		            buffer = '';
		            state = HOST;
		          } else buffer += chr;
		          break;

		        case HOST:
		        case HOSTNAME:
		          if (stateOverride && url.scheme === 'file') {
		            state = FILE_HOST;
		            continue;
		          } else if (chr === ':' && !seenBracket) {
		            if (buffer === '') return INVALID_HOST;
		            if (stateOverride === HOSTNAME) return;
		            failure = url.parseHost(buffer);
		            if (failure) return failure;
		            buffer = '';
		            state = PORT;
		          } else if (
		            chr === EOF || chr === '/' || chr === '?' || chr === '#' ||
		            (chr === '\\' && url.isSpecial())
		          ) {
		            if (url.isSpecial() && buffer === '') return INVALID_HOST;
		            if (stateOverride && buffer === '' && (url.includesCredentials() || url.port !== null)) return;
		            failure = url.parseHost(buffer);
		            if (failure) return failure;
		            buffer = '';
		            state = PATH_START;
		            if (stateOverride) return;
		            continue;
		          } else {
		            if (chr === '[') seenBracket = true;
		            else if (chr === ']') seenBracket = false;
		            buffer += chr;
		          } break;

		        case PORT:
		          if (exec(DIGIT, chr)) {
		            buffer += chr;
		          } else if (
		            chr === EOF || chr === '/' || chr === '?' || chr === '#' ||
		            (chr === '\\' && url.isSpecial()) ||
		            stateOverride
		          ) {
		            if (buffer !== '') {
		              var port = parseInt(buffer, 10);
		              if (port > 0xFFFF) return INVALID_PORT;
		              url.port = (url.isSpecial() && port === specialSchemes[url.scheme]) ? null : port;
		              buffer = '';
		            }
		            if (stateOverride) return;
		            state = PATH_START;
		            continue;
		          } else return INVALID_PORT;
		          break;

		        case FILE:
		          url.scheme = 'file';
		          url.host = '';
		          if (chr === '/' || chr === '\\') state = FILE_SLASH;
		          else if (base && base.scheme === 'file') {
		            switch (chr) {
		              case EOF:
		                url.host = base.host;
		                url.path = arraySlice(base.path);
		                url.query = base.query;
		                break;
		              case '?':
		                url.host = base.host;
		                url.path = arraySlice(base.path);
		                url.query = '';
		                state = QUERY;
		                break;
		              case '#':
		                url.host = base.host;
		                url.path = arraySlice(base.path);
		                url.query = base.query;
		                url.fragment = '';
		                state = FRAGMENT;
		                break;
		              default:
		                url.host = base.host;
		                if (!startsWithWindowsDriveLetter(join(arraySlice(codePoints, pointer), ''))) {
		                  url.path = arraySlice(base.path);
		                  url.shortenPath();
		                }
		                state = PATH;
		                continue;
		            }
		          } else {
		            state = PATH;
		            continue;
		          } break;

		        case FILE_SLASH:
		          if (chr === '/' || chr === '\\') {
		            state = FILE_HOST;
		            break;
		          }
		          if (base && base.scheme === 'file') {
		            url.host = base.host;
		            if (!startsWithWindowsDriveLetter(join(arraySlice(codePoints, pointer), ''))
		              && isWindowsDriveLetter(base.path[0], true)) push(url.path, base.path[0]);
		          }
		          state = PATH;
		          continue;

		        case FILE_HOST:
		          if (chr === EOF || chr === '/' || chr === '\\' || chr === '?' || chr === '#') {
		            if (!stateOverride && isWindowsDriveLetter(buffer)) {
		              state = PATH;
		            } else if (buffer === '') {
		              url.host = '';
		              if (stateOverride) return;
		              state = PATH_START;
		            } else {
		              failure = url.parseHost(buffer);
		              if (failure) return failure;
		              if (url.host === 'localhost') url.host = '';
		              if (stateOverride) return;
		              buffer = '';
		              state = PATH_START;
		            } continue;
		          } else buffer += chr;
		          break;

		        case PATH_START:
		          if (url.isSpecial()) {
		            state = PATH;
		            if (chr !== '/' && chr !== '\\') continue;
		          } else if (!stateOverride && chr === '?') {
		            url.query = '';
		            state = QUERY;
		          } else if (!stateOverride && chr === '#') {
		            url.fragment = '';
		            state = FRAGMENT;
		          } else if (chr !== EOF) {
		            state = PATH;
		            if (chr !== '/') continue;
		          } break;

		        case PATH:
		          if (
		            chr === EOF || chr === '/' ||
		            (chr === '\\' && url.isSpecial()) ||
		            (!stateOverride && (chr === '?' || chr === '#'))
		          ) {
		            if (isDoubleDot(buffer)) {
		              url.shortenPath();
		              if (chr !== '/' && !(chr === '\\' && url.isSpecial())) {
		                push(url.path, '');
		              }
		            } else if (isSingleDot(buffer)) {
		              if (chr !== '/' && !(chr === '\\' && url.isSpecial())) {
		                push(url.path, '');
		              }
		            } else {
		              if (url.scheme === 'file' && !url.path.length && isWindowsDriveLetter(buffer)) {
		                if (url.host !== null && url.host !== '') url.host = '';
		                buffer = charAt(buffer, 0) + ':'; // normalize windows drive letter
		              }
		              push(url.path, buffer);
		            }
		            buffer = '';
		            if (url.scheme === 'file' && (chr === EOF || chr === '?' || chr === '#')) {
		              while (url.path.length > 1 && url.path[0] === '') {
		                shift(url.path);
		              }
		            }
		            if (chr === '?') {
		              url.query = '';
		              state = QUERY;
		            } else if (chr === '#') {
		              url.fragment = '';
		              state = FRAGMENT;
		            }
		          } else {
		            buffer += percentEncode(chr, pathPercentEncodeSet);
		          } break;

		        case CANNOT_BE_A_BASE_URL_PATH:
		          if (chr === '?') {
		            url.query = '';
		            state = QUERY;
		          } else if (chr === '#') {
		            url.fragment = '';
		            state = FRAGMENT;
		          } else if (chr !== EOF) {
		            url.path[0] += percentEncode(chr, C0ControlPercentEncodeSet);
		          } break;

		        case QUERY:
		          if (!stateOverride && chr === '#') {
		            url.fragment = '';
		            state = FRAGMENT;
		          } else if (chr !== EOF) {
		            url.query += percentEncode(chr, url.isSpecial() ? specialQueryPercentEncodeSet : queryPercentEncodeSet);
		          } break;

		        case FRAGMENT:
		          if (chr !== EOF) url.fragment += percentEncode(chr, fragmentPercentEncodeSet);
		          break;
		      }

		      pointer++;
		    }
		  },
		  // https://url.spec.whatwg.org/#host-parsing
		  parseHost: function (input) {
		    var result, codePoints, index;
		    if (charAt(input, 0) === '[') {
		      if (charAt(input, input.length - 1) !== ']') return INVALID_HOST;
		      result = parseIPv6(stringSlice(input, 1, -1));
		      if (!result) return INVALID_HOST;
		      this.host = result;
		    // opaque host
		    } else if (!this.isSpecial()) {
		      if (exec(FORBIDDEN_HOST_CODE_POINT_EXCLUDING_PERCENT, input)) return INVALID_HOST;
		      result = '';
		      codePoints = arrayFrom(input);
		      for (index = 0; index < codePoints.length; index++) {
		        result += percentEncode(codePoints[index], C0ControlPercentEncodeSet);
		      }
		      this.host = result;
		    } else {
		      input = toASCII(input);
		      if (exec(FORBIDDEN_HOST_CODE_POINT, input)) return INVALID_HOST;
		      if (endsInNumber(input)) {
		        result = parseIPv4(input);
		        if (result === null) return INVALID_HOST;
		        this.host = result;
		      } else {
		        this.host = input;
		      }
		    }
		  },
		  // https://url.spec.whatwg.org/#cannot-have-a-username-password-port
		  cannotHaveUsernamePasswordPort: function () {
		    return this.host === null || this.host === '' || this.cannotBeABaseURL || this.scheme === 'file';
		  },
		  // https://url.spec.whatwg.org/#include-credentials
		  includesCredentials: function () {
		    return this.username !== '' || this.password !== '';
		  },
		  // https://url.spec.whatwg.org/#is-special
		  isSpecial: function () {
		    return hasOwn(specialSchemes, this.scheme);
		  },
		  // https://url.spec.whatwg.org/#shorten-a-urls-path
		  shortenPath: function () {
		    var path = this.path;
		    var pathSize = path.length;
		    if (pathSize && (this.scheme !== 'file' || pathSize !== 1 || !isWindowsDriveLetter(path[0], true))) {
		      path.length--;
		    }
		  },
		  // https://url.spec.whatwg.org/#concept-url-serializer
		  serialize: function () {
		    var url = this;
		    var scheme = url.scheme;
		    var username = url.username;
		    var password = url.password;
		    var host = url.host;
		    var port = url.port;
		    var path = url.path;
		    var query = url.query;
		    var fragment = url.fragment;
		    var output = scheme + ':';
		    if (host !== null) {
		      output += '//';
		      if (url.includesCredentials()) {
		        output += username + (password ? ':' + password : '') + '@';
		      }
		      output += serializeHost(host);
		      if (port !== null) output += ':' + port;
		    } else if (scheme === 'file') output += '//';
		    if (host === null && !url.cannotBeABaseURL && path.length > 1 && path[0] === '') output += '/.';
		    output += url.cannotBeABaseURL ? path[0] : path.length ? '/' + join(path, '/') : '';
		    if (query !== null) output += '?' + query;
		    if (fragment !== null) output += '#' + fragment;
		    return output;
		  },
		  // https://url.spec.whatwg.org/#dom-url-href
		  setHref: function (href) {
		    var failure = this.parse(href);
		    if (failure) throw new TypeError(failure);
		    this.searchParams.update();
		  },
		  // https://url.spec.whatwg.org/#dom-url-origin
		  getOrigin: function () {
		    var scheme = this.scheme;
		    var port = this.port;
		    if (scheme === 'blob') try {
		      return new URLConstructor(this.path[0]).origin;
		    } catch (error) {
		      return 'null';
		    }
		    if (scheme === 'file' || !this.isSpecial()) return 'null';
		    return scheme + '://' + serializeHost(this.host) + (port !== null ? ':' + port : '');
		  },
		  // https://url.spec.whatwg.org/#dom-url-protocol
		  getProtocol: function () {
		    return this.scheme + ':';
		  },
		  setProtocol: function (protocol) {
		    this.parse($toString(protocol) + ':', SCHEME_START);
		  },
		  // https://url.spec.whatwg.org/#dom-url-username
		  getUsername: function () {
		    return this.username;
		  },
		  setUsername: function (username) {
		    var codePoints = arrayFrom($toString(username));
		    if (this.cannotHaveUsernamePasswordPort()) return;
		    this.username = '';
		    for (var i = 0; i < codePoints.length; i++) {
		      this.username += percentEncode(codePoints[i], userinfoPercentEncodeSet);
		    }
		  },
		  // https://url.spec.whatwg.org/#dom-url-password
		  getPassword: function () {
		    return this.password;
		  },
		  setPassword: function (password) {
		    var codePoints = arrayFrom($toString(password));
		    if (this.cannotHaveUsernamePasswordPort()) return;
		    this.password = '';
		    for (var i = 0; i < codePoints.length; i++) {
		      this.password += percentEncode(codePoints[i], userinfoPercentEncodeSet);
		    }
		  },
		  // https://url.spec.whatwg.org/#dom-url-host
		  getHost: function () {
		    var host = this.host;
		    var port = this.port;
		    return host === null ? ''
		      : port === null ? serializeHost(host)
		      : serializeHost(host) + ':' + port;
		  },
		  setHost: function (host) {
		    if (this.cannotBeABaseURL) return;
		    this.parse(host, HOST);
		  },
		  // https://url.spec.whatwg.org/#dom-url-hostname
		  getHostname: function () {
		    var host = this.host;
		    return host === null ? '' : serializeHost(host);
		  },
		  setHostname: function (hostname) {
		    if (this.cannotBeABaseURL) return;
		    this.parse(hostname, HOSTNAME);
		  },
		  // https://url.spec.whatwg.org/#dom-url-port
		  getPort: function () {
		    var port = this.port;
		    return port === null ? '' : $toString(port);
		  },
		  setPort: function (port) {
		    if (this.cannotHaveUsernamePasswordPort()) return;
		    port = $toString(port);
		    if (port === '') this.port = null;
		    else this.parse(port, PORT);
		  },
		  // https://url.spec.whatwg.org/#dom-url-pathname
		  getPathname: function () {
		    var path = this.path;
		    return this.cannotBeABaseURL ? path[0] : path.length ? '/' + join(path, '/') : '';
		  },
		  setPathname: function (pathname) {
		    if (this.cannotBeABaseURL) return;
		    this.path = [];
		    this.parse(pathname, PATH_START);
		  },
		  // https://url.spec.whatwg.org/#dom-url-search
		  getSearch: function () {
		    var query = this.query;
		    return query ? '?' + query : '';
		  },
		  setSearch: function (search) {
		    search = $toString(search);
		    if (search === '') {
		      this.query = null;
		    } else {
		      if (charAt(search, 0) === '?') search = stringSlice(search, 1);
		      this.query = '';
		      this.parse(search, QUERY);
		    }
		    this.searchParams.update();
		  },
		  // https://url.spec.whatwg.org/#dom-url-searchparams
		  getSearchParams: function () {
		    return this.searchParams.facade;
		  },
		  // https://url.spec.whatwg.org/#dom-url-hash
		  getHash: function () {
		    var fragment = this.fragment;
		    return fragment ? '#' + fragment : '';
		  },
		  setHash: function (hash) {
		    hash = $toString(hash);
		    if (hash === '') {
		      this.fragment = null;
		      return;
		    }
		    if (charAt(hash, 0) === '#') hash = stringSlice(hash, 1);
		    this.fragment = '';
		    this.parse(hash, FRAGMENT);
		  },
		  update: function () {
		    this.query = this.searchParams.serialize() || null;
		  }
		};

		// `URL` constructor
		// https://url.spec.whatwg.org/#url-class
		var URLConstructor = function URL(url /* , base */) {
		  var that = anInstance(this, URLPrototype);
		  var base = validateArgumentsLength(arguments.length, 1) > 1 ? arguments[1] : undefined;
		  var state = setInternalState(that, new URLState(url, false, base));
		  if (!DESCRIPTORS) {
		    that.href = state.serialize();
		    that.origin = state.getOrigin();
		    that.protocol = state.getProtocol();
		    that.username = state.getUsername();
		    that.password = state.getPassword();
		    that.host = state.getHost();
		    that.hostname = state.getHostname();
		    that.port = state.getPort();
		    that.pathname = state.getPathname();
		    that.search = state.getSearch();
		    that.searchParams = state.getSearchParams();
		    that.hash = state.getHash();
		  }
		};

		var URLPrototype = URLConstructor.prototype;

		var accessorDescriptor = function (getter, setter) {
		  return {
		    get: function () {
		      return getInternalURLState(this)[getter]();
		    },
		    set: setter && function (value) {
		      return getInternalURLState(this)[setter](value);
		    },
		    configurable: true,
		    enumerable: true
		  };
		};

		if (DESCRIPTORS) {
		  // `URL.prototype.href` accessors pair
		  // https://url.spec.whatwg.org/#dom-url-href
		  defineBuiltInAccessor(URLPrototype, 'href', accessorDescriptor('serialize', 'setHref'));
		  // `URL.prototype.origin` getter
		  // https://url.spec.whatwg.org/#dom-url-origin
		  defineBuiltInAccessor(URLPrototype, 'origin', accessorDescriptor('getOrigin'));
		  // `URL.prototype.protocol` accessors pair
		  // https://url.spec.whatwg.org/#dom-url-protocol
		  defineBuiltInAccessor(URLPrototype, 'protocol', accessorDescriptor('getProtocol', 'setProtocol'));
		  // `URL.prototype.username` accessors pair
		  // https://url.spec.whatwg.org/#dom-url-username
		  defineBuiltInAccessor(URLPrototype, 'username', accessorDescriptor('getUsername', 'setUsername'));
		  // `URL.prototype.password` accessors pair
		  // https://url.spec.whatwg.org/#dom-url-password
		  defineBuiltInAccessor(URLPrototype, 'password', accessorDescriptor('getPassword', 'setPassword'));
		  // `URL.prototype.host` accessors pair
		  // https://url.spec.whatwg.org/#dom-url-host
		  defineBuiltInAccessor(URLPrototype, 'host', accessorDescriptor('getHost', 'setHost'));
		  // `URL.prototype.hostname` accessors pair
		  // https://url.spec.whatwg.org/#dom-url-hostname
		  defineBuiltInAccessor(URLPrototype, 'hostname', accessorDescriptor('getHostname', 'setHostname'));
		  // `URL.prototype.port` accessors pair
		  // https://url.spec.whatwg.org/#dom-url-port
		  defineBuiltInAccessor(URLPrototype, 'port', accessorDescriptor('getPort', 'setPort'));
		  // `URL.prototype.pathname` accessors pair
		  // https://url.spec.whatwg.org/#dom-url-pathname
		  defineBuiltInAccessor(URLPrototype, 'pathname', accessorDescriptor('getPathname', 'setPathname'));
		  // `URL.prototype.search` accessors pair
		  // https://url.spec.whatwg.org/#dom-url-search
		  defineBuiltInAccessor(URLPrototype, 'search', accessorDescriptor('getSearch', 'setSearch'));
		  // `URL.prototype.searchParams` getter
		  // https://url.spec.whatwg.org/#dom-url-searchparams
		  defineBuiltInAccessor(URLPrototype, 'searchParams', accessorDescriptor('getSearchParams'));
		  // `URL.prototype.hash` accessors pair
		  // https://url.spec.whatwg.org/#dom-url-hash
		  defineBuiltInAccessor(URLPrototype, 'hash', accessorDescriptor('getHash', 'setHash'));
		}

		// `URL.prototype.toJSON` method
		// https://url.spec.whatwg.org/#dom-url-tojson
		defineBuiltIn(URLPrototype, 'toJSON', function toJSON() {
		  return getInternalURLState(this).serialize();
		}, { enumerable: true });

		// `URL.prototype.toString` method
		// https://url.spec.whatwg.org/#URL-stringification-behavior
		defineBuiltIn(URLPrototype, 'toString', function toString() {
		  return getInternalURLState(this).serialize();
		}, { enumerable: true });

		if (NativeURL) {
		  var nativeCreateObjectURL = NativeURL.createObjectURL;
		  var nativeRevokeObjectURL = NativeURL.revokeObjectURL;
		  // `URL.createObjectURL` method
		  // https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL
		  if (nativeCreateObjectURL) defineBuiltIn(URLConstructor, 'createObjectURL', bind(nativeCreateObjectURL, NativeURL));
		  // `URL.revokeObjectURL` method
		  // https://developer.mozilla.org/en-US/docs/Web/API/URL/revokeObjectURL
		  if (nativeRevokeObjectURL) defineBuiltIn(URLConstructor, 'revokeObjectURL', bind(nativeRevokeObjectURL, NativeURL));
		}

		setToStringTag(URLConstructor, 'URL');

		$({ global: true, constructor: true, forced: !USE_NATIVE_URL, sham: !DESCRIPTORS }, {
		  URL: URLConstructor
		});
		return web_url_constructor;
	}

	var hasRequiredWeb_url;

	function requireWeb_url () {
		if (hasRequiredWeb_url) return web_url;
		hasRequiredWeb_url = 1;
		// TODO: Remove this module from `core-js@4` since it's replaced to module below
		requireWeb_url_constructor();
		return web_url;
	}

	requireWeb_url();

	var web_url_toJson = {};

	var hasRequiredWeb_url_toJson;

	function requireWeb_url_toJson () {
		if (hasRequiredWeb_url_toJson) return web_url_toJson;
		hasRequiredWeb_url_toJson = 1;
		var $ = require_export();
		var call = requireFunctionCall();

		// `URL.prototype.toJSON` method
		// https://url.spec.whatwg.org/#dom-url-tojson
		$({ target: 'URL', proto: true, enumerable: true }, {
		  toJSON: function toJSON() {
		    return call(URL.prototype.toString, this);
		  }
		});
		return web_url_toJson;
	}

	requireWeb_url_toJson();

	var web_urlSearchParams = {};

	var hasRequiredWeb_urlSearchParams;

	function requireWeb_urlSearchParams () {
		if (hasRequiredWeb_urlSearchParams) return web_urlSearchParams;
		hasRequiredWeb_urlSearchParams = 1;
		// TODO: Remove this module from `core-js@4` since it's replaced to module below
		requireWeb_urlSearchParams_constructor();
		return web_urlSearchParams;
	}

	requireWeb_urlSearchParams();

	/**
	 * Copyright (c) Starisian Technologies. All rights reserved.
	 *
	 * This file is part of the SPARXSTAR platform and is proprietary and confidential.
	 * Unauthorized copying, modification, distribution, or use of this file, via any medium,
	 * is strictly prohibited except as expressly permitted in writing by Starisian Technologies.
	 *
	 * License: Business Source License 1.1
	 * Change Date: January 1, 2036
	 * Change License: Starisian Community License
	 *
	 * See the LICENSE file in the repository root for full license terms.
	 */

	var currentAudio = null;

	/**
	 * Formats seconds to MM'm SS's string.
	 *
	 * @param {number} seconds
	 * @returns {string}
	 */
	function formatTime(seconds) {
	  if (!Number.isFinite(seconds)) {
	    return "00m 00s";
	  }
	  var m = Math.floor(seconds / 60);
	  var s = Math.floor(seconds % 60);
	  return "".concat(m < 10 ? "0" + m : m, "m ").concat(s < 10 ? "0" + s : s, "s");
	}

	/**
	 * Binds an event handler to an element, preventing duplicate bindings.
	 * Prevents default on cancelable events and respects disabled state.
	 *
	 * @param {HTMLElement|null} element
	 * @param {string} eventName
	 * @param {function} handler
	 * @returns {void}
	 */
	function safeBind(element, eventName, handler) {
	  if (!element || element._starmusBound) {
	    return;
	  }
	  element.addEventListener(eventName, function (e) {
	    if (e.cancelable) {
	      e.preventDefault();
	    }
	    e.stopPropagation();
	    if (!element.disabled) {
	      handler(e);
	    }
	  });
	  element._starmusBound = true;
	}

	/**
	 * Renders UI state to DOM elements based on current store state.
	 * All state transitions are driven by this function; no direct DOM
	 * mutations outside of it.
	 *
	 * @param {Object} state - Current application state
	 * @param {Object} elements - DOM element references
	 * @returns {void}
	 */
	function render(state, elements, i18n) {
	  if (!elements) {
	    return;
	  }
	  var status = state.status,
	    step = state.step,
	    tier = state.tier;
	  var recorder = state.recorder || {};
	  var calibration = state.calibration || {};
	  var submission = state.submission || {};

	  /* --- Tier C: show file upload fallback, hide recorder UI --- */
	  if (tier === "C") {
	    if (elements.recorderContainer) {
	      elements.recorderContainer.style.display = "none";
	    }
	    if (elements.setupContainer) {
	      elements.setupContainer.style.display = "none";
	    }
	    var fallback = document.querySelector("[data-starmus-fallback-container]");
	    if (fallback) {
	      fallback.style.display = "block";
	    }
	    return;
	  }

	  /* --- Amplitude meter --- */
	  var vol = status === "calibrating" ? calibration.volumePercent || 0 : status === "recording" ? recorder.amplitude || 0 : 0;
	  if (elements.volumeMeter) {
	    elements.volumeMeter.style.setProperty("--starmus-audio-level", "".concat(vol, "%"));
	  }

	  /* --- Timer --- */
	  if (elements.timerElapsed) {
	    elements.timerElapsed.textContent = formatTime(recorder.duration || 0);
	  }

	  /* --- Duration progress bar --- */
	  if (elements.durationProgress) {
	    var maxDuration = 1200;
	    var pct = Math.min(100, (recorder.duration || 0) / maxDuration * 100);
	    elements.durationProgress.style.setProperty("--starmus-recording-progress", "".concat(pct, "%"));
	  }

	  /* --- Step visibility --- */
	  if (elements.step1 && elements.step2) {
	    var activeStatuses = ["recording", "paused", "processing", "ready_to_submit", "submitting", "calibrating", "ready", "complete"];
	    var showStep2 = step === 2 || activeStatuses.includes(status);
	    elements.step1.style.display = showStep2 ? "none" : "block";
	    elements.step2.style.display = showStep2 ? "block" : "none";
	  }

	  /* --- Calibration / setup container --- */
	  var isCalibrated = calibration.complete === true;
	  if (elements.setupContainer) {
	    elements.setupContainer.style.display = !isCalibrated || status === "calibrating" ? "block" : "none";
	    if (elements.setupMicBtn) {
	      if (status === "calibrating") {
	        elements.setupMicBtn.textContent = calibration.message || i18n("setupAdjusting", "Adjusting...");
	        elements.setupMicBtn.disabled = true;
	      } else {
	        elements.setupMicBtn.textContent = i18n("setupMicrophone", "Setup Microphone");
	        elements.setupMicBtn.disabled = false;
	      }
	    }
	  }
	  if (elements.recorderContainer) {
	    elements.recorderContainer.style.display = isCalibrated ? "block" : "none";
	  }

	  /* --- Recording control buttons --- */
	  var isRec = status === "recording";
	  var isPaused = status === "paused";
	  var isDone = status === "ready_to_submit";
	  var isReady = (status === "ready" || status === "ready_to_record" || status === "idle") && isCalibrated;
	  if (elements.recordBtn) {
	    elements.recordBtn.style.display = isReady && !isRec && !isPaused && !isDone ? "inline-flex" : "none";
	  }
	  if (elements.pauseBtn) {
	    elements.pauseBtn.style.display = isRec ? "inline-flex" : "none";
	  }
	  if (elements.resumeBtn) {
	    elements.resumeBtn.style.display = isPaused ? "inline-flex" : "none";
	  }
	  if (elements.stopBtn) {
	    elements.stopBtn.style.display = isRec || isPaused ? "inline-flex" : "none";
	  }
	  if (elements.reviewControls) {
	    elements.reviewControls.style.display = isDone ? "flex" : "none";
	  } else {
	    if (elements.playBtn) {
	      elements.playBtn.style.display = isDone ? "inline-flex" : "none";
	    }
	    if (elements.resetBtn) {
	      elements.resetBtn.style.display = isDone ? "inline-flex" : "none";
	    }
	  }

	  /* --- Offline indicator --- */
	  if (elements.offlineBanner) {
	    elements.offlineBanner.style.display = !navigator.onLine ? "block" : "none";
	  }

	  /* --- Submit button --- */
	  if (elements.submitBtn) {
	    if (status === "submitting") {
	      elements.submitBtn.textContent = "".concat(i18n("uploading", "Uploading..."), " ").concat(Math.round((submission.progress || 0) * 100), "%");
	      elements.submitBtn.disabled = true;
	    } else if (status === "complete") {
	      elements.submitBtn.textContent = submission.isQueued ? i18n("queuedUploading", "Queued — uploading when online") : i18n("submitted", "Submitted!");
	      elements.submitBtn.disabled = true;
	    } else {
	      elements.submitBtn.textContent = i18n("submitRecording", "Submit Recording");
	      elements.submitBtn.disabled = status !== "ready_to_submit";
	    }
	  }

	  /* --- Mode indicator text --- */
	  if (elements.modeIndicator) {
	    var modeLabels = {
	      uninitialized: i18n("modeLoading", "Loading…"),
	      idle: i18n("modeReady", "Ready"),
	      calibrating: i18n("modeCalibrating", "Calibrating microphone…"),
	      ready: i18n("modeReadyToRecord", "Ready to record"),
	      recording: i18n("modeRecording", "Recording"),
	      paused: i18n("modePaused", "Paused"),
	      ready_to_submit: i18n("modeReview", "Review your recording"),
	      submitting: i18n("modeUploading", "Uploading…"),
	      complete: submission.isQueued ? i18n("modeQueued", "Queued for upload") : i18n("modeComplete", "Complete")
	    };
	    elements.modeIndicator.textContent = modeLabels[status] || status;
	    elements.modeIndicator.dataset.starmusStatus = status;
	  }
	}

	/**
	 * Initialises the UI for a recorder instance.
	 * Binds all interactive elements and sets up state subscription.
	 *
	 * @param {Object} store - Redux-style state store
	 * @param {Object} [_incomingElements] - Reserved
	 * @param {string} [forcedInstanceId] - Instance ID override
	 * @returns {function} Unsubscribe function
	 */
	function initInstance(store, _incomingElements, forcedInstanceId) {
	  var _window$STARMUS_BOOTS;
	  var instId = forcedInstanceId || store.getState().instanceId;
	  var root = document;
	  if (instId) {
	    var found = document.querySelector("form[data-starmus-instance=\"".concat(instId, "\"]"));
	    if (found) {
	      root = found;
	    }
	  }
	  var BUS = window.CommandBus;
	  var bootstrapI18n = ((_window$STARMUS_BOOTS = window.STARMUS_BOOTSTRAP) === null || _window$STARMUS_BOOTS === void 0 ? void 0 : _window$STARMUS_BOOTS.i18n) || {};
	  var i18n = function i18n(key, fallback) {
	    var value = bootstrapI18n[key];
	    return typeof value === "string" && value.trim() !== "" ? value : fallback;
	  };
	  var el = {
	    step1: root.querySelector('[data-starmus-step="1"]'),
	    step2: root.querySelector('[data-starmus-step="2"]'),
	    setupContainer: root.querySelector("[data-starmus-setup-container]"),
	    timer: root.querySelector("[data-starmus-timer]"),
	    timerElapsed: root.querySelector(".starmus-timer-elapsed"),
	    volumeMeter: root.querySelector("[data-starmus-volume-meter]"),
	    durationProgress: root.querySelector("[data-starmus-duration-progress]"),
	    recorderContainer: root.querySelector("[data-starmus-recorder-container]"),
	    reviewControls: root.querySelector(".starmus-review-controls"),
	    messageBox: root.querySelector("[data-starmus-message-box]"),
	    modeIndicator: root.querySelector("[data-starmus-mode]"),
	    offlineBanner: root.querySelector("[data-starmus-offline-banner]"),
	    continueBtn: root.querySelector('[data-starmus-action="next"]'),
	    setupMicBtn: root.querySelector('[data-starmus-action="setup-mic"]'),
	    recordBtn: root.querySelector('[data-starmus-action="record"]'),
	    pauseBtn: root.querySelector('[data-starmus-action="pause"]'),
	    resumeBtn: root.querySelector('[data-starmus-action="resume"]'),
	    stopBtn: root.querySelector('[data-starmus-action="stop"]'),
	    playBtn: root.querySelector('[data-starmus-action="play"]'),
	    resetBtn: root.querySelector('[data-starmus-action="reset"]'),
	    submitBtn: root.querySelector('[data-starmus-action="submit"]')
	  };

	  /* --- Continue button (step 1 → step 2) --- */
	  safeBind(el.continueBtn, "click", function () {
	    var inputs = el.step1 ? el.step1.querySelectorAll("[required]") : [];
	    var valid = true;
	    if (el.messageBox) {
	      el.messageBox.style.display = "none";
	      el.messageBox.textContent = "";
	    }
	    var _iterator = _createForOfIteratorHelper$1(inputs),
	      _step;
	    try {
	      for (_iterator.s(); !(_step = _iterator.n()).done;) {
	        var input = _step.value;
	        var isCheckbox = input.type === "checkbox" || input.type === "radio";
	        var isValid = isCheckbox ? input.checked : input.value.trim() !== "";
	        if (!isValid) {
	          valid = false;
	          input.style.outlineColor = "var(--sparxstar-danger, #d63638)";
	        } else {
	          input.style.outlineColor = "";
	        }
	      }
	    } catch (err) {
	      _iterator.e(err);
	    } finally {
	      _iterator.f();
	    }
	    if (valid) {
	      store.dispatch({
	        type: "starmus/ui/step-continue"
	      });
	    } else if (el.messageBox) {
	      el.messageBox.textContent = i18n("requiredFieldsError", "Please fill in all required fields.");
	      el.messageBox.style.display = "block";
	    }
	  });

	  /* --- Setup microphone --- */
	  safeBind(el.setupMicBtn, "click", function () {
	    if (BUS) {
	      BUS.dispatch("starmus/setup-mic", {}, {
	        instanceId: instId
	      });
	    }
	  });

	  /* --- Record --- */
	  safeBind(el.recordBtn, "click", function () {
	    if (BUS) {
	      BUS.dispatch("starmus/mic-start", {}, {
	        instanceId: instId
	      });
	    }
	  });

	  /* --- Pause --- */
	  safeBind(el.pauseBtn, "click", function () {
	    if (BUS) {
	      BUS.dispatch("starmus/mic-pause", {}, {
	        instanceId: instId
	      });
	    }
	  });

	  /* --- Resume --- */
	  safeBind(el.resumeBtn, "click", function () {
	    if (BUS) {
	      BUS.dispatch("starmus/mic-resume", {}, {
	        instanceId: instId
	      });
	    }
	  });

	  /* --- Stop --- */
	  safeBind(el.stopBtn, "click", function () {
	    if (BUS) {
	      BUS.dispatch("starmus/mic-stop", {}, {
	        instanceId: instId
	      });
	    }
	  });

	  /* --- Play review audio --- */
	  safeBind(el.playBtn, "click", function () {
	    var _state$source;
	    var state = store.getState();
	    var blob = (_state$source = state.source) === null || _state$source === void 0 ? void 0 : _state$source.blob;
	    if (!blob) {
	      return;
	    }
	    if (currentAudio) {
	      currentAudio.pause();
	      currentAudio = null;
	      el.playBtn.textContent = i18n("play", "Play");
	      return;
	    }
	    var url = URL.createObjectURL(blob);
	    currentAudio = new Audio(url);
	    el.playBtn.textContent = i18n("stop", "Stop");
	    currentAudio.addEventListener("ended", function () {
	      URL.revokeObjectURL(url);
	      currentAudio = null;
	      el.playBtn.textContent = i18n("play", "Play");
	    });
	    currentAudio.play().catch(function (err) {
	      console.error("[UI] Playback error:", err);
	      URL.revokeObjectURL(url);
	      currentAudio = null;
	      el.playBtn.textContent = i18n("play", "Play");
	    });
	  });

	  /* --- Reset --- */
	  safeBind(el.resetBtn, "click", function () {
	    if (currentAudio) {
	      currentAudio.pause();
	      currentAudio = null;
	    }
	    if (BUS) {
	      BUS.dispatch("reset", {}, {
	        instanceId: instId
	      });
	    }
	  });

	  /* --- Submit --- */
	  safeBind(el.submitBtn, "click", function () {
	    var formRoot = root instanceof HTMLFormElement ? root : root.querySelector("form");
	    var formData = formRoot ? new FormData(formRoot) : new FormData();
	    var fields = {};
	    var _iterator2 = _createForOfIteratorHelper$1(formData.entries()),
	      _step2;
	    try {
	      for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
	        var _step2$value = _slicedToArray$1(_step2.value, 2),
	          key = _step2$value[0],
	          val = _step2$value[1];
	        fields[key] = val;
	      }
	    } catch (err) {
	      _iterator2.e(err);
	    } finally {
	      _iterator2.f();
	    }
	    if (BUS) {
	      BUS.dispatch("submit", {
	        formFields: fields
	      }, {
	        instanceId: instId
	      });
	    }
	  });

	  /* --- File input (Tier C fallback) --- */
	  var fileInput = root.querySelector('[data-starmus-file-input]');
	  if (fileInput) {
	    fileInput.addEventListener("change", function () {
	      var file = fileInput.files[0];
	      if (file) {
	        store.dispatch({
	          type: "starmus/file-attached",
	          file: file
	        });
	      }
	    });
	  }

	  /* --- Offline banner dismiss --- */
	  var dismissOfflineBtn = root.querySelector("[data-starmus-offline-dismiss]");
	  if (dismissOfflineBtn) {
	    dismissOfflineBtn.addEventListener("click", function () {
	      if (el.offlineBanner) {
	        el.offlineBanner.style.display = "none";
	      }
	    });
	  }

	  /* --- Offline queue badge --- */
	  if (BUS) {
	    BUS.subscribe("starmus/offline/queue_updated", function (payload) {
	      var badge = root.querySelector("[data-starmus-queue-count]");
	      if (badge) {
	        badge.textContent = payload.count > 0 ? "".concat(payload.count, " queued") : "";
	        badge.style.display = payload.count > 0 ? "inline" : "none";
	      }
	    });
	  }

	  /* --- Online/offline DOM events --- */
	  window.addEventListener("online", function () {
	    return render(store.getState(), el, i18n);
	  });
	  window.addEventListener("offline", function () {
	    return render(store.getState(), el, i18n);
	  });

	  /* --- State subscription --- */
	  store.dispatch({
	    type: "starmus/init",
	    payload: {
	      instanceId: instId
	    }
	  });
	  var unsubscribe = store.subscribe(function (state) {
	    return render(state, el, i18n);
	  });
	  render(store.getState(), el, i18n);
	  return unsubscribe;
	}

	var es_map = {};

	var es_map_constructor = {};

	var internalMetadata = {exports: {}};

	var objectGetOwnPropertyNamesExternal = {};

	var hasRequiredObjectGetOwnPropertyNamesExternal;

	function requireObjectGetOwnPropertyNamesExternal () {
		if (hasRequiredObjectGetOwnPropertyNamesExternal) return objectGetOwnPropertyNamesExternal;
		hasRequiredObjectGetOwnPropertyNamesExternal = 1;
		/* eslint-disable es/no-object-getownpropertynames -- safe */
		var classof = requireClassofRaw();
		var toIndexedObject = requireToIndexedObject();
		var $getOwnPropertyNames = requireObjectGetOwnPropertyNames().f;
		var arraySlice = requireArraySlice();

		var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
		  ? Object.getOwnPropertyNames(window) : [];

		var getWindowNames = function (it) {
		  try {
		    return $getOwnPropertyNames(it);
		  } catch (error) {
		    return arraySlice(windowNames);
		  }
		};

		// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
		objectGetOwnPropertyNamesExternal.f = function getOwnPropertyNames(it) {
		  return windowNames && classof(it) === 'Window'
		    ? getWindowNames(it)
		    : $getOwnPropertyNames(toIndexedObject(it));
		};
		return objectGetOwnPropertyNamesExternal;
	}

	var arrayBufferNonExtensible;
	var hasRequiredArrayBufferNonExtensible;

	function requireArrayBufferNonExtensible () {
		if (hasRequiredArrayBufferNonExtensible) return arrayBufferNonExtensible;
		hasRequiredArrayBufferNonExtensible = 1;
		// FF26- bug: ArrayBuffers are non-extensible, but Object.isExtensible does not report it
		var fails = requireFails();

		arrayBufferNonExtensible = fails(function () {
		  if (typeof ArrayBuffer == 'function') {
		    var buffer = new ArrayBuffer(8);
		    // eslint-disable-next-line es/no-object-isextensible, es/no-object-defineproperty -- safe
		    if (Object.isExtensible(buffer)) Object.defineProperty(buffer, 'a', { value: 8 });
		  }
		});
		return arrayBufferNonExtensible;
	}

	var objectIsExtensible;
	var hasRequiredObjectIsExtensible;

	function requireObjectIsExtensible () {
		if (hasRequiredObjectIsExtensible) return objectIsExtensible;
		hasRequiredObjectIsExtensible = 1;
		var fails = requireFails();
		var isObject = requireIsObject();
		var classof = requireClassofRaw();
		var ARRAY_BUFFER_NON_EXTENSIBLE = requireArrayBufferNonExtensible();

		// eslint-disable-next-line es/no-object-isextensible -- safe
		var $isExtensible = Object.isExtensible;
		var FAILS_ON_PRIMITIVES = fails(function () { });

		// `Object.isExtensible` method
		// https://tc39.es/ecma262/#sec-object.isextensible
		objectIsExtensible = (FAILS_ON_PRIMITIVES || ARRAY_BUFFER_NON_EXTENSIBLE) ? function isExtensible(it) {
		  if (!isObject(it)) return false;
		  if (ARRAY_BUFFER_NON_EXTENSIBLE && classof(it) === 'ArrayBuffer') return false;
		  return $isExtensible ? $isExtensible(it) : true;
		} : $isExtensible;
		return objectIsExtensible;
	}

	var freezing;
	var hasRequiredFreezing;

	function requireFreezing () {
		if (hasRequiredFreezing) return freezing;
		hasRequiredFreezing = 1;
		var fails = requireFails();

		freezing = !fails(function () {
		  // eslint-disable-next-line es/no-object-isextensible, es/no-object-preventextensions -- required for testing
		  return Object.isExtensible(Object.preventExtensions({}));
		});
		return freezing;
	}

	var hasRequiredInternalMetadata;

	function requireInternalMetadata () {
		if (hasRequiredInternalMetadata) return internalMetadata.exports;
		hasRequiredInternalMetadata = 1;
		var $ = require_export();
		var uncurryThis = requireFunctionUncurryThis();
		var hiddenKeys = requireHiddenKeys();
		var isObject = requireIsObject();
		var hasOwn = requireHasOwnProperty();
		var defineProperty = requireObjectDefineProperty().f;
		var getOwnPropertyNamesModule = requireObjectGetOwnPropertyNames();
		var getOwnPropertyNamesExternalModule = requireObjectGetOwnPropertyNamesExternal();
		var isExtensible = requireObjectIsExtensible();
		var uid = requireUid();
		var FREEZING = requireFreezing();

		var REQUIRED = false;
		var METADATA = uid('meta');
		var id = 0;

		var setMetadata = function (it) {
		  defineProperty(it, METADATA, { value: {
		    objectID: 'O' + id++, // object ID
		    weakData: {}          // weak collections IDs
		  } });
		};

		var fastKey = function (it, create) {
		  // return a primitive with prefix
		  if (!isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
		  if (!hasOwn(it, METADATA)) {
		    // can't set metadata to uncaught frozen object
		    if (!isExtensible(it)) return 'F';
		    // not necessary to add metadata
		    if (!create) return 'E';
		    // add missing metadata
		    setMetadata(it);
		  // return object ID
		  } return it[METADATA].objectID;
		};

		var getWeakData = function (it, create) {
		  if (!hasOwn(it, METADATA)) {
		    // can't set metadata to uncaught frozen object
		    if (!isExtensible(it)) return true;
		    // not necessary to add metadata
		    if (!create) return false;
		    // add missing metadata
		    setMetadata(it);
		  // return the store of weak collections IDs
		  } return it[METADATA].weakData;
		};

		// add metadata on freeze-family methods calling
		var onFreeze = function (it) {
		  if (FREEZING && REQUIRED && isExtensible(it) && !hasOwn(it, METADATA)) setMetadata(it);
		  return it;
		};

		var enable = function () {
		  meta.enable = function () { /* empty */ };
		  REQUIRED = true;
		  var getOwnPropertyNames = getOwnPropertyNamesModule.f;
		  var splice = uncurryThis([].splice);
		  var test = {};
		  // eslint-disable-next-line unicorn/no-immediate-mutation -- ES3 syntax limitation
		  test[METADATA] = 1;

		  // prevent exposing of metadata key
		  if (getOwnPropertyNames(test).length) {
		    getOwnPropertyNamesModule.f = function (it) {
		      var result = getOwnPropertyNames(it);
		      for (var i = 0, length = result.length; i < length; i++) {
		        if (result[i] === METADATA) {
		          splice(result, i, 1);
		          break;
		        }
		      } return result;
		    };

		    $({ target: 'Object', stat: true, forced: true }, {
		      getOwnPropertyNames: getOwnPropertyNamesExternalModule.f
		    });
		  }
		};

		var meta = internalMetadata.exports = {
		  enable: enable,
		  fastKey: fastKey,
		  getWeakData: getWeakData,
		  onFreeze: onFreeze
		};

		hiddenKeys[METADATA] = true;
		return internalMetadata.exports;
	}

	var collection;
	var hasRequiredCollection;

	function requireCollection () {
		if (hasRequiredCollection) return collection;
		hasRequiredCollection = 1;
		var $ = require_export();
		var globalThis = requireGlobalThis();
		var uncurryThis = requireFunctionUncurryThis();
		var isForced = requireIsForced();
		var defineBuiltIn = requireDefineBuiltIn();
		var InternalMetadataModule = requireInternalMetadata();
		var iterate = requireIterate();
		var anInstance = requireAnInstance();
		var isCallable = requireIsCallable();
		var isNullOrUndefined = requireIsNullOrUndefined();
		var isObject = requireIsObject();
		var fails = requireFails();
		var checkCorrectnessOfIteration = requireCheckCorrectnessOfIteration();
		var setToStringTag = requireSetToStringTag();
		var inheritIfRequired = requireInheritIfRequired();

		collection = function (CONSTRUCTOR_NAME, wrapper, common) {
		  var IS_MAP = CONSTRUCTOR_NAME.indexOf('Map') !== -1;
		  var IS_WEAK = CONSTRUCTOR_NAME.indexOf('Weak') !== -1;
		  var ADDER = IS_MAP ? 'set' : 'add';
		  var NativeConstructor = globalThis[CONSTRUCTOR_NAME];
		  var NativePrototype = NativeConstructor && NativeConstructor.prototype;
		  var Constructor = NativeConstructor;
		  var exported = {};

		  var fixMethod = function (KEY) {
		    var uncurriedNativeMethod = uncurryThis(NativePrototype[KEY]);
		    defineBuiltIn(NativePrototype, KEY,
		      KEY === 'add' ? function add(value) {
		        uncurriedNativeMethod(this, value === 0 ? 0 : value);
		        return this;
		      } : KEY === 'delete' ? function (key) {
		        return IS_WEAK && !isObject(key) ? false : uncurriedNativeMethod(this, key === 0 ? 0 : key);
		      } : KEY === 'get' ? function get(key) {
		        return IS_WEAK && !isObject(key) ? undefined : uncurriedNativeMethod(this, key === 0 ? 0 : key);
		      } : KEY === 'has' ? function has(key) {
		        return IS_WEAK && !isObject(key) ? false : uncurriedNativeMethod(this, key === 0 ? 0 : key);
		      } : function set(key, value) {
		        uncurriedNativeMethod(this, key === 0 ? 0 : key, value);
		        return this;
		      }
		    );
		  };

		  var REPLACE = isForced(
		    CONSTRUCTOR_NAME,
		    !isCallable(NativeConstructor) || !(IS_WEAK || NativePrototype.forEach && !fails(function () {
		      new NativeConstructor().entries().next();
		    }))
		  );

		  if (REPLACE) {
		    // create collection constructor
		    Constructor = common.getConstructor(wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER);
		    InternalMetadataModule.enable();
		  } else if (isForced(CONSTRUCTOR_NAME, true)) {
		    var instance = new Constructor();
		    // early implementations not supports chaining
		    var HASNT_CHAINING = instance[ADDER](IS_WEAK ? {} : -0, 1) !== instance;
		    // V8 ~ Chromium 40- weak-collections throws on primitives, but should return false
		    var THROWS_ON_PRIMITIVES = fails(function () { instance.has(1); });
		    // most early implementations doesn't supports iterables, most modern - not close it correctly
		    // eslint-disable-next-line no-new -- required for testing
		    var ACCEPT_ITERABLES = checkCorrectnessOfIteration(function (iterable) { new NativeConstructor(iterable); });
		    // for early implementations -0 and +0 not the same
		    var BUGGY_ZERO = !IS_WEAK && fails(function () {
		      // V8 ~ Chromium 42- fails only with 5+ elements
		      var $instance = new NativeConstructor();
		      var index = 5;
		      while (index--) $instance[ADDER](index, index);
		      return !$instance.has(-0);
		    });

		    if (!ACCEPT_ITERABLES) {
		      Constructor = wrapper(function (dummy, iterable) {
		        anInstance(dummy, NativePrototype);
		        var that = inheritIfRequired(new NativeConstructor(), dummy, Constructor);
		        if (!isNullOrUndefined(iterable)) iterate(iterable, that[ADDER], { that: that, AS_ENTRIES: IS_MAP });
		        return that;
		      });
		      Constructor.prototype = NativePrototype;
		      NativePrototype.constructor = Constructor;
		    }

		    if (THROWS_ON_PRIMITIVES || BUGGY_ZERO) {
		      fixMethod('delete');
		      fixMethod('has');
		      IS_MAP && fixMethod('get');
		    }

		    if (BUGGY_ZERO || HASNT_CHAINING) fixMethod(ADDER);

		    // weak collections should not contains .clear method
		    if (IS_WEAK && NativePrototype.clear) delete NativePrototype.clear;
		  }

		  exported[CONSTRUCTOR_NAME] = Constructor;
		  $({ global: true, constructor: true, forced: Constructor !== NativeConstructor }, exported);

		  setToStringTag(Constructor, CONSTRUCTOR_NAME);

		  if (!IS_WEAK) common.setStrong(Constructor, CONSTRUCTOR_NAME, IS_MAP);

		  return Constructor;
		};
		return collection;
	}

	var collectionStrong;
	var hasRequiredCollectionStrong;

	function requireCollectionStrong () {
		if (hasRequiredCollectionStrong) return collectionStrong;
		hasRequiredCollectionStrong = 1;
		var create = requireObjectCreate();
		var defineBuiltInAccessor = requireDefineBuiltInAccessor();
		var defineBuiltIns = requireDefineBuiltIns();
		var bind = requireFunctionBindContext();
		var anInstance = requireAnInstance();
		var isNullOrUndefined = requireIsNullOrUndefined();
		var iterate = requireIterate();
		var defineIterator = requireIteratorDefine();
		var createIterResultObject = requireCreateIterResultObject();
		var setSpecies = requireSetSpecies();
		var DESCRIPTORS = requireDescriptors();
		var fastKey = requireInternalMetadata().fastKey;
		var InternalStateModule = requireInternalState();

		var setInternalState = InternalStateModule.set;
		var internalStateGetterFor = InternalStateModule.getterFor;

		collectionStrong = {
		  getConstructor: function (wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER) {
		    var Constructor = wrapper(function (that, iterable) {
		      anInstance(that, Prototype);
		      setInternalState(that, {
		        type: CONSTRUCTOR_NAME,
		        index: create(null),
		        first: null,
		        last: null,
		        size: 0
		      });
		      if (!DESCRIPTORS) that.size = 0;
		      if (!isNullOrUndefined(iterable)) iterate(iterable, that[ADDER], { that: that, AS_ENTRIES: IS_MAP });
		    });

		    var Prototype = Constructor.prototype;

		    var getInternalState = internalStateGetterFor(CONSTRUCTOR_NAME);

		    var define = function (that, key, value) {
		      var state = getInternalState(that);
		      var entry = getEntry(that, key);
		      var previous, index;
		      // change existing entry
		      if (entry) {
		        entry.value = value;
		      // create new entry
		      } else {
		        state.last = entry = {
		          index: index = fastKey(key, true),
		          key: key,
		          value: value,
		          previous: previous = state.last,
		          next: null,
		          removed: false
		        };
		        if (!state.first) state.first = entry;
		        if (previous) previous.next = entry;
		        if (DESCRIPTORS) state.size++;
		        else that.size++;
		        // add to index
		        if (index !== 'F') state.index[index] = entry;
		      } return that;
		    };

		    var getEntry = function (that, key) {
		      var state = getInternalState(that);
		      // fast case
		      var index = fastKey(key);
		      var entry;
		      if (index !== 'F') return state.index[index];
		      // frozen object case
		      for (entry = state.first; entry; entry = entry.next) {
		        if (entry.key === key) return entry;
		      }
		    };

		    defineBuiltIns(Prototype, {
		      // `{ Map, Set }.prototype.clear()` methods
		      // https://tc39.es/ecma262/#sec-map.prototype.clear
		      // https://tc39.es/ecma262/#sec-set.prototype.clear
		      clear: function clear() {
		        var that = this;
		        var state = getInternalState(that);
		        var entry = state.first;
		        while (entry) {
		          entry.removed = true;
		          if (entry.previous) entry.previous = entry.previous.next = null;
		          entry = entry.next;
		        }
		        state.first = state.last = null;
		        state.index = create(null);
		        if (DESCRIPTORS) state.size = 0;
		        else that.size = 0;
		      },
		      // `{ Map, Set }.prototype.delete(key)` methods
		      // https://tc39.es/ecma262/#sec-map.prototype.delete
		      // https://tc39.es/ecma262/#sec-set.prototype.delete
		      'delete': function (key) {
		        var that = this;
		        var state = getInternalState(that);
		        var entry = getEntry(that, key);
		        if (entry) {
		          var next = entry.next;
		          var prev = entry.previous;
		          delete state.index[entry.index];
		          entry.removed = true;
		          if (prev) prev.next = next;
		          if (next) next.previous = prev;
		          if (state.first === entry) state.first = next;
		          if (state.last === entry) state.last = prev;
		          if (DESCRIPTORS) state.size--;
		          else that.size--;
		        } return !!entry;
		      },
		      // `{ Map, Set }.prototype.forEach(callbackfn, thisArg = undefined)` methods
		      // https://tc39.es/ecma262/#sec-map.prototype.foreach
		      // https://tc39.es/ecma262/#sec-set.prototype.foreach
		      forEach: function forEach(callbackfn /* , that = undefined */) {
		        var state = getInternalState(this);
		        var boundFunction = bind(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
		        var entry;
		        while (entry = entry ? entry.next : state.first) {
		          boundFunction(entry.value, entry.key, this);
		          // revert to the last existing entry
		          while (entry && entry.removed) entry = entry.previous;
		        }
		      },
		      // `{ Map, Set}.prototype.has(key)` methods
		      // https://tc39.es/ecma262/#sec-map.prototype.has
		      // https://tc39.es/ecma262/#sec-set.prototype.has
		      has: function has(key) {
		        return !!getEntry(this, key);
		      }
		    });

		    defineBuiltIns(Prototype, IS_MAP ? {
		      // `Map.prototype.get(key)` method
		      // https://tc39.es/ecma262/#sec-map.prototype.get
		      get: function get(key) {
		        var entry = getEntry(this, key);
		        return entry && entry.value;
		      },
		      // `Map.prototype.set(key, value)` method
		      // https://tc39.es/ecma262/#sec-map.prototype.set
		      set: function set(key, value) {
		        return define(this, key === 0 ? 0 : key, value);
		      }
		    } : {
		      // `Set.prototype.add(value)` method
		      // https://tc39.es/ecma262/#sec-set.prototype.add
		      add: function add(value) {
		        return define(this, value = value === 0 ? 0 : value, value);
		      }
		    });
		    if (DESCRIPTORS) defineBuiltInAccessor(Prototype, 'size', {
		      configurable: true,
		      get: function () {
		        return getInternalState(this).size;
		      }
		    });
		    return Constructor;
		  },
		  setStrong: function (Constructor, CONSTRUCTOR_NAME, IS_MAP) {
		    var ITERATOR_NAME = CONSTRUCTOR_NAME + ' Iterator';
		    var getInternalCollectionState = internalStateGetterFor(CONSTRUCTOR_NAME);
		    var getInternalIteratorState = internalStateGetterFor(ITERATOR_NAME);
		    // `{ Map, Set }.prototype.{ keys, values, entries, @@iterator }()` methods
		    // https://tc39.es/ecma262/#sec-map.prototype.entries
		    // https://tc39.es/ecma262/#sec-map.prototype.keys
		    // https://tc39.es/ecma262/#sec-map.prototype.values
		    // https://tc39.es/ecma262/#sec-map.prototype-@@iterator
		    // https://tc39.es/ecma262/#sec-set.prototype.entries
		    // https://tc39.es/ecma262/#sec-set.prototype.keys
		    // https://tc39.es/ecma262/#sec-set.prototype.values
		    // https://tc39.es/ecma262/#sec-set.prototype-@@iterator
		    defineIterator(Constructor, CONSTRUCTOR_NAME, function (iterated, kind) {
		      setInternalState(this, {
		        type: ITERATOR_NAME,
		        target: iterated,
		        state: getInternalCollectionState(iterated),
		        kind: kind,
		        last: null
		      });
		    }, function () {
		      var state = getInternalIteratorState(this);
		      var kind = state.kind;
		      var entry = state.last;
		      // revert to the last existing entry
		      while (entry && entry.removed) entry = entry.previous;
		      // get next entry
		      if (!state.target || !(state.last = entry = entry ? entry.next : state.state.first)) {
		        // or finish the iteration
		        state.target = null;
		        return createIterResultObject(undefined, true);
		      }
		      // return step by kind
		      if (kind === 'keys') return createIterResultObject(entry.key, false);
		      if (kind === 'values') return createIterResultObject(entry.value, false);
		      return createIterResultObject([entry.key, entry.value], false);
		    }, IS_MAP ? 'entries' : 'values', !IS_MAP, true);

		    // `{ Map, Set }.prototype[@@species]` accessors
		    // https://tc39.es/ecma262/#sec-get-map-@@species
		    // https://tc39.es/ecma262/#sec-get-set-@@species
		    setSpecies(CONSTRUCTOR_NAME);
		  }
		};
		return collectionStrong;
	}

	var hasRequiredEs_map_constructor;

	function requireEs_map_constructor () {
		if (hasRequiredEs_map_constructor) return es_map_constructor;
		hasRequiredEs_map_constructor = 1;
		var collection = requireCollection();
		var collectionStrong = requireCollectionStrong();

		// `Map` constructor
		// https://tc39.es/ecma262/#sec-map-objects
		collection('Map', function (init) {
		  return function Map() { return init(this, arguments.length ? arguments[0] : undefined); };
		}, collectionStrong);
		return es_map_constructor;
	}

	var hasRequiredEs_map;

	function requireEs_map () {
		if (hasRequiredEs_map) return es_map;
		hasRequiredEs_map = 1;
		// TODO: Remove this module from `core-js@4` since it's replaced to module below
		requireEs_map_constructor();
		return es_map;
	}

	requireEs_map();

	var es_array_reduce = {};

	var hasRequiredEs_array_reduce;

	function requireEs_array_reduce () {
		if (hasRequiredEs_array_reduce) return es_array_reduce;
		hasRequiredEs_array_reduce = 1;
		var $ = require_export();
		var $reduce = requireArrayReduce().left;
		var arrayMethodIsStrict = requireArrayMethodIsStrict();
		var CHROME_VERSION = requireEnvironmentV8Version();
		var IS_NODE = requireEnvironmentIsNode();

		// Chrome 80-82 has a critical bug
		// https://bugs.chromium.org/p/chromium/issues/detail?id=1049982
		var CHROME_BUG = !IS_NODE && CHROME_VERSION > 79 && CHROME_VERSION < 83;
		var FORCED = CHROME_BUG || !arrayMethodIsStrict('reduce');

		// `Array.prototype.reduce` method
		// https://tc39.es/ecma262/#sec-array.prototype.reduce
		$({ target: 'Array', proto: true, forced: FORCED }, {
		  reduce: function reduce(callbackfn /* , initialValue */) {
		    var length = arguments.length;
		    return $reduce(this, callbackfn, length, length > 1 ? arguments[1] : undefined);
		  }
		});
		return es_array_reduce;
	}

	requireEs_array_reduce();

	var es_math_log10 = {};

	var mathLog10;
	var hasRequiredMathLog10;

	function requireMathLog10 () {
		if (hasRequiredMathLog10) return mathLog10;
		hasRequiredMathLog10 = 1;
		var log = Math.log;
		var LOG10E = Math.LOG10E;

		// eslint-disable-next-line es/no-math-log10 -- safe
		mathLog10 = Math.log10 || function log10(x) {
		  return log(x) * LOG10E;
		};
		return mathLog10;
	}

	var hasRequiredEs_math_log10;

	function requireEs_math_log10 () {
		if (hasRequiredEs_math_log10) return es_math_log10;
		hasRequiredEs_math_log10 = 1;
		var $ = require_export();
		var log10 = requireMathLog10();

		// `Math.log10` method
		// https://tc39.es/ecma262/#sec-math.log10
		$({ target: 'Math', stat: true }, {
		  log10: log10
		});
		return es_math_log10;
	}

	requireEs_math_log10();

	/**
	 * Copyright (c) Starisian Technologies. All rights reserved.
	 *
	 * This file is part of the SPARXSTAR platform and is proprietary and confidential.
	 * Unauthorized copying, modification, distribution, or use of this file, via any medium,
	 * is strictly prohibited except as expressly permitted in writing by Starisian Technologies.
	 *
	 * License: Business Source License 1.1
	 * Change Date: January 1, 2036
	 * Change License: Starisian Community License
	 *
	 * See the LICENSE file in the repository root for full license terms.
	 */


	/**
	 * Tier-based calibration settings.
	 * @type {Object}
	 */
	var TIER_SETTINGS = {
	  A: {
	    duration: 15000,
	    phases: 3,
	    noiseThreshold: 5,
	    speechThreshold: 20,
	    sampleRate: 16000,
	    // Runtime policy: cap all tiers to 16kHz for upload compatibility
	    fftSize: 2048,
	    smoothing: 0.8,
	    gainRange: [0.5, 2.0],
	    autoGainControl: true
	  },
	  B: {
	    duration: 10000,
	    phases: 2,
	    noiseThreshold: 8,
	    speechThreshold: 15,
	    sampleRate: 16000,
	    // Runtime policy: cap all tiers to 16kHz for upload compatibility
	    fftSize: 1024,
	    smoothing: 0.6,
	    gainRange: [0.7, 1.5],
	    autoGainControl: true
	  },
	  C: {
	    duration: 5000,
	    phases: 1,
	    noiseThreshold: 12,
	    speechThreshold: 10,
	    sampleRate: 16000,
	    fftSize: 512,
	    smoothing: 0.4,
	    gainRange: [0.8, 1.2],
	    autoGainControl: false
	  }
	};
	var EnhancedCalibration = /*#__PURE__*/function () {
	  function EnhancedCalibration() {
	    _classCallCheck$9(this, EnhancedCalibration);
	    this.audioContext = null;
	    this.analyser = null;
	    this.source = null;
	    this.calibrationData = null;
	    this.tier = "C";
	    this.environmentData = null;
	  }

	  /**
	   * Initialises calibration with environment data from SPARXSTAR.
	   *
	   * @returns {Promise<EnhancedCalibration>} this
	   */
	  return _createClass$9(EnhancedCalibration, [{
	    key: "init",
	    value: (function () {
	      var _init = _asyncToGenerator$2(/*#__PURE__*/_regenerator().m(function _callee() {
	        var _this$environmentData;
	        return _regenerator().w(function (_context) {
	          while (1) switch (_context.n) {
	            case 0:
	              this.environmentData = sparxstarIntegration.getEnvironmentData();
	              this.tier = ((_this$environmentData = this.environmentData) === null || _this$environmentData === void 0 ? void 0 : _this$environmentData.tier) || "C";
	              return _context.a(2, this);
	          }
	        }, _callee, this);
	      }));
	      function init() {
	        return _init.apply(this, arguments);
	      }
	      return init;
	    }()
	    /**
	     * Returns tier-specific calibration settings.
	     *
	     * @returns {Object} Settings object
	     */
	    )
	  }, {
	    key: "getTierSettings",
	    value: function getTierSettings() {
	      return TIER_SETTINGS[this.tier] || TIER_SETTINGS.C;
	    }

	    /**
	     * Performs calibration on the provided media stream.
	     *
	     * @param {MediaStream} stream - Live microphone stream
	     * @param {function} onUpdate - Callback(message, volume, complete, data)
	     * @returns {Promise<Object>} Calibration result
	     */
	  }, {
	    key: "performCalibration",
	    value: (function () {
	      var _performCalibration = _asyncToGenerator$2(/*#__PURE__*/_regenerator().m(function _callee2(stream, onUpdate) {
	        var settings, result, _t;
	        return _regenerator().w(function (_context2) {
	          while (1) switch (_context2.p = _context2.n) {
	            case 0:
	              settings = this.getTierSettings();
	              _context2.p = 1;
	              try {
	                this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
	                  sampleRate: settings.sampleRate,
	                  latencyHint: "interactive"
	                });
	              } catch (_sampleRateError) {
	                this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
	                  latencyHint: "interactive"
	                });
	                sparxstarIntegration.reportError("calibration_samplerate_fallback", {
	                  tier: this.tier,
	                  requestedSampleRate: settings.sampleRate,
	                  error: _sampleRateError.message
	                });
	              }
	              if (!(this.audioContext.state === "suspended")) {
	                _context2.n = 2;
	                break;
	              }
	              _context2.n = 2;
	              return this.audioContext.resume();
	            case 2:
	              this.source = this.audioContext.createMediaStreamSource(stream);
	              this.analyser = this.audioContext.createAnalyser();
	              this.analyser.fftSize = settings.fftSize;
	              this.analyser.smoothingTimeConstant = settings.smoothing;
	              this.source.connect(this.analyser);
	              _context2.n = 3;
	              return this.runTierBasedCalibration(settings, onUpdate);
	            case 3:
	              result = _context2.v;
	              sparxstarIntegration.reportError("calibration_completed", {
	                tier: this.tier,
	                actualSampleRate: this.audioContext.sampleRate,
	                duration: settings.duration,
	                result: result
	              });
	              return _context2.a(2, result);
	            case 4:
	              _context2.p = 4;
	              _t = _context2.v;
	              console.error("[EnhancedCalibration] Fatal:", _t);
	              sparxstarIntegration.reportError("calibration_failed", {
	                error: _t.message,
	                tier: this.tier
	              });
	              throw _t;
	            case 5:
	              _context2.p = 5;
	              this.cleanup();
	              return _context2.f(5);
	            case 6:
	              return _context2.a(2);
	          }
	        }, _callee2, this, [[1, 4, 5, 6]]);
	      }));
	      function performCalibration(_x, _x2) {
	        return _performCalibration.apply(this, arguments);
	      }
	      return performCalibration;
	    }()
	    /**
	     * Runs the calibration measurement loop.
	     *
	     * @param {Object} settings - Tier settings
	     * @param {function} onUpdate - Progress callback
	     * @returns {Promise<Object>} Calibration result
	     */
	    )
	  }, {
	    key: "runTierBasedCalibration",
	    value: (function () {
	      var _runTierBasedCalibration = _asyncToGenerator$2(/*#__PURE__*/_regenerator().m(function _callee3(settings, onUpdate) {
	        var _this = this;
	        var data, startTime, maxVolume, sampleCount, noiseFloor, speechPeaks, phaseDuration, currentPhase;
	        return _regenerator().w(function (_context3) {
	          while (1) switch (_context3.n) {
	            case 0:
	              data = new Uint8Array(this.analyser.fftSize);
	              startTime = Date.now();
	              maxVolume = 0;
	              sampleCount = 0;
	              noiseFloor = 0;
	              speechPeaks = [];
	              phaseDuration = settings.duration / settings.phases;
	              currentPhase = 0;
	              return _context3.a(2, new Promise(function (resolve) {
	                var _loop = function loop() {
	                  var elapsed = Date.now() - startTime;
	                  var phaseElapsed = elapsed % phaseDuration;
	                  var newPhase = Math.floor(elapsed / phaseDuration);
	                  if (newPhase !== currentPhase) {
	                    currentPhase = newPhase;
	                  }
	                  _this.analyser.getByteTimeDomainData(data);
	                  var sumSquares = 0;
	                  for (var i = 0; i < data.length; i++) {
	                    var centered = data[i] - 128;
	                    sumSquares += centered * centered;
	                  }
	                  var rms = Math.sqrt(sumSquares / data.length) / 128;
	                  var db = 20 * Math.log10(Math.max(rms, 1e-6));
	                  var volume = Math.min(100, Math.max(0, (db + 60) / 60 * 100));
	                  sampleCount++;
	                  if (volume > maxVolume) {
	                    maxVolume = volume;
	                  }
	                  var progress = elapsed / settings.duration * 100;
	                  var message;
	                  switch (currentPhase) {
	                    case 0:
	                      if (volume < settings.noiseThreshold) {
	                        noiseFloor = Math.max(noiseFloor, volume);
	                      }
	                      message = _this.tier === "C" ? "Quick setup..." : "Phase 1: Measuring background noise (".concat(Math.ceil((phaseDuration - phaseElapsed) / 1000), "s)");
	                      break;
	                    case 1:
	                      if (volume > settings.speechThreshold) {
	                        speechPeaks.push(volume);
	                      }
	                      message = "Phase 2: Speak your name clearly...";
	                      break;
	                    case 2:
	                      message = "Phase 3: Optimising settings...";
	                      break;
	                    default:
	                      message = "Calibration complete";
	                  }
	                  if (onUpdate) {
	                    onUpdate(message, Math.min(volume, 100), false, {
	                      phase: currentPhase + 1,
	                      totalPhases: settings.phases,
	                      progress: Math.min(progress, 100),
	                      tier: _this.tier
	                    });
	                  }
	                  if (elapsed >= settings.duration) {
	                    var avgSpeechLevel = speechPeaks.length > 0 ? speechPeaks.reduce(function (a, b) {
	                      return a + b;
	                    }, 0) / speechPeaks.length : maxVolume;
	                    var dynamicRange = maxVolume - noiseFloor;
	                    var signalToNoise = avgSpeechLevel / Math.max(noiseFloor, 1);
	                    var optimalGain = _this._calculateOptimalGain(avgSpeechLevel, noiseFloor, dynamicRange, settings);
	                    var result = {
	                      complete: true,
	                      tier: _this.tier,
	                      gain: optimalGain,
	                      speechLevel: avgSpeechLevel,
	                      noiseFloor: noiseFloor,
	                      dynamicRange: dynamicRange,
	                      signalToNoise: signalToNoise,
	                      sampleCount: sampleCount,
	                      duration: elapsed,
	                      phases: settings.phases,
	                      quality: _this._assessQuality(dynamicRange, signalToNoise, settings),
	                      recommendations: _this._generateRecommendations(dynamicRange, signalToNoise, settings)
	                    };
	                    if (onUpdate) {
	                      onUpdate("Calibration complete!", 0, true, result);
	                    }
	                    resolve(result);
	                    return;
	                  }
	                  requestAnimationFrame(_loop);
	                };
	                _loop();
	              }));
	          }
	        }, _callee3, this);
	      }));
	      function runTierBasedCalibration(_x3, _x4) {
	        return _runTierBasedCalibration.apply(this, arguments);
	      }
	      return runTierBasedCalibration;
	    }()
	    /**
	     * Calculates optimal recording gain.
	     * @private
	     */
	    )
	  }, {
	    key: "_calculateOptimalGain",
	    value: function _calculateOptimalGain(speechLevel, noiseFloor, _dynamicRange, settings) {
	      var _this$environmentData2;
	      var targetLevel = 60;
	      var baseGain = targetLevel / Math.max(speechLevel, 1);
	      var _settings$gainRange = _slicedToArray$1(settings.gainRange, 2),
	        minGain = _settings$gainRange[0],
	        maxGain = _settings$gainRange[1];
	      var gain = Math.max(minGain, Math.min(maxGain, baseGain));
	      if (noiseFloor > 15) {
	        gain *= 0.9;
	      } else if (noiseFloor < 5) {
	        gain *= 1.1;
	      }
	      if (((_this$environmentData2 = this.environmentData) === null || _this$environmentData2 === void 0 || (_this$environmentData2 = _this$environmentData2.network) === null || _this$environmentData2 === void 0 ? void 0 : _this$environmentData2.type) === "very_low") {
	        gain *= 0.8;
	      }
	      return Math.round(gain * 100) / 100;
	    }

	    /**
	     * Assesses calibration quality.
	     * @private
	     */
	  }, {
	    key: "_assessQuality",
	    value: function _assessQuality(dynamicRange, signalToNoise, _settings) {
	      var score = 0;
	      if (dynamicRange > 40) {
	        score += 3;
	      } else if (dynamicRange > 20) {
	        score += 2;
	      } else if (dynamicRange > 10) {
	        score += 1;
	      }
	      if (signalToNoise > 5) {
	        score += 3;
	      } else if (signalToNoise > 3) {
	        score += 2;
	      } else if (signalToNoise > 2) {
	        score += 1;
	      }
	      var maxScore = this.tier === "A" ? 6 : this.tier === "B" ? 5 : 4;
	      var pct = score / maxScore * 100;
	      if (pct >= 80) {
	        return "excellent";
	      }
	      if (pct >= 60) {
	        return "good";
	      }
	      if (pct >= 40) {
	        return "fair";
	      }
	      return "poor";
	    }

	    /**
	     * Generates user-facing recommendations.
	     * @private
	     */
	  }, {
	    key: "_generateRecommendations",
	    value: function _generateRecommendations(dynamicRange, signalToNoise, settings) {
	      var _this$environmentData3;
	      var recs = [];
	      if (dynamicRange < 15) {
	        recs.push("Consider moving to a quieter location");
	      }
	      if (signalToNoise < 2) {
	        recs.push("Speak closer to the microphone");
	      }
	      if (this.tier === "C" && ((_this$environmentData3 = this.environmentData) === null || _this$environmentData3 === void 0 || (_this$environmentData3 = _this$environmentData3.network) === null || _this$environmentData3 === void 0 ? void 0 : _this$environmentData3.type) === "very_low") {
	        recs.push("Recording optimised for your network conditions");
	      }
	      if (settings.autoGainControl && dynamicRange > 50) {
	        recs.push("Automatic gain control will help maintain consistent levels");
	      }
	      return recs;
	    }

	    /**
	     * Releases audio resources.
	     */
	  }, {
	    key: "cleanup",
	    value: function cleanup() {
	      try {
	        if (this.source) {
	          this.source.disconnect();
	          this.source = null;
	        }
	        if (this.analyser) {
	          this.analyser.disconnect();
	          this.analyser = null;
	        }
	        if (this.audioContext && this.audioContext.state !== "closed") {
	          this.audioContext.close();
	          this.audioContext = null;
	        }
	      } catch (err) {
	        console.warn("[EnhancedCalibration] Cleanup error:", err);
	      }
	    }
	  }]);
	}();

	/**
	 * Copyright (c) Starisian Technologies. All rights reserved.
	 *
	 * This file is part of the SPARXSTAR platform and is proprietary and confidential.
	 * Unauthorized copying, modification, distribution, or use of this file, via any medium,
	 * is strictly prohibited except as expressly permitted in writing by Starisian Technologies.
	 *
	 * License: Business Source License 1.1
	 * Change Date: January 1, 2036
	 * Change License: Starisian Community License
	 *
	 * See the LICENSE file in the repository root for full license terms.
	 */


	/**
	 * Registry of active recorder instances, keyed by instanceId.
	 * @type {Map<string, Object>}
	 */
	var recorderRegistry = new Map();

	/**
	 * Shared AudioContext reused across instances.
	 * @type {AudioContext|null}
	 */
	var sharedAudioContext = null;

	/**
	 * Preferred MIME types in priority order.
	 * WebM/Opus is strongly preferred for Africa-first bandwidth constraints.
	 *
	 * @type {string[]}
	 */
	var PREFERRED_MIME_TYPES = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4"];

	/**
	 * Returns the first MIME type supported by MediaRecorder.
	 *
	 * @returns {string} Supported MIME type
	 */
	function getSupportedMimeType() {
	  var _iterator = _createForOfIteratorHelper$1(PREFERRED_MIME_TYPES),
	    _step;
	  try {
	    for (_iterator.s(); !(_step = _iterator.n()).done;) {
	      var mimeType = _step.value;
	      if (MediaRecorder.isTypeSupported(mimeType)) {
	        return mimeType;
	      }
	    }
	  } catch (err) {
	    _iterator.e(err);
	  } finally {
	    _iterator.f();
	  }
	  return "";
	}

	/**
	 * Maximum recording duration in seconds (20 minutes).
	 * Enforced by a timeout to prevent orphaned recordings.
	 * @type {number}
	 */
	var MAX_DURATION_SECONDS = 1200;

	/**
	 * Initialises a recorder instance for a given store and instance ID.
	 * Subscribes to the CommandBus for mic-start, mic-pause, mic-resume, and mic-stop.
	 *
	 * @param {Object} store - Redux-style state store
	 * @param {string} instanceId - Unique recorder instance identifier
	 * @returns {void}
	 */
	function initRecorder(store, instanceId) {
	  var state = store.getState();
	  var tier = state.tier || "C";

	  /**
	   * Starts microphone calibration then transitions to recording-ready state.
	   *
	   * @returns {Promise<void>}
	   */
	  function startCalibration() {
	    return _startCalibration.apply(this, arguments);
	  }
	  /**
	   * Opens a fresh microphone stream and starts MediaRecorder.
	   *
	   * @returns {Promise<void>}
	   */
	  function _startCalibration() {
	    _startCalibration = _asyncToGenerator$2(/*#__PURE__*/_regenerator().m(function _callee() {
	      var stream, calibration, result, _t, _t2;
	      return _regenerator().w(function (_context) {
	        while (1) switch (_context.p = _context.n) {
	          case 0:
	            store.dispatch({
	              type: "starmus/calibration-start"
	            });
	            _context.p = 1;
	            _context.n = 2;
	            return navigator.mediaDevices.getUserMedia({
	              audio: {
	                echoCancellation: true,
	                noiseSuppression: true,
	                sampleRate: 16000,
	                channelCount: 1
	              }
	            });
	          case 2:
	            stream = _context.v;
	            _context.n = 4;
	            break;
	          case 3:
	            _context.p = 3;
	            _t = _context.v;
	            console.error("[Recorder] Microphone access denied:", _t);
	            store.dispatch({
	              type: "starmus/error",
	              error: {
	                code: "MIC_DENIED",
	                message: _t.message,
	                retryable: true
	              }
	            });
	            return _context.a(2);
	          case 4:
	            calibration = new EnhancedCalibration();
	            _context.n = 5;
	            return calibration.init();
	          case 5:
	            _context.p = 5;
	            _context.n = 6;
	            return calibration.performCalibration(stream, function (msg, vol, done, data) {
	              if (done) {
	                store.dispatch({
	                  type: "starmus/calibration-complete",
	                  payload: {
	                    calibration: data
	                  }
	                });
	              } else {
	                store.dispatch({
	                  type: "starmus/calibration-update",
	                  message: msg,
	                  volumePercent: vol
	                });
	              }
	            });
	          case 6:
	            result = _context.v;
	            // Store the calibrated stream for recording
	            recorderRegistry.set(instanceId, _objectSpread2(_objectSpread2({}, recorderRegistry.get(instanceId) || {}), {}, {
	              calibrationResult: result,
	              stream: stream
	            }));
	            _context.n = 8;
	            break;
	          case 7:
	            _context.p = 7;
	            _t2 = _context.v;
	            console.error("[Recorder] Calibration failed:", _t2);
	            // Fallback: mark calibration complete with defaults
	            store.dispatch({
	              type: "starmus/calibration-complete",
	              payload: {
	                calibration: {
	                  complete: true,
	                  gain: 1.0,
	                  speechLevel: 50
	                }
	              }
	            });
	            recorderRegistry.set(instanceId, _objectSpread2(_objectSpread2({}, recorderRegistry.get(instanceId) || {}), {}, {
	              stream: stream
	            }));
	          case 8:
	            // Stop calibration stream tracks — a new stream is opened at record start
	            stream.getTracks().forEach(function (t) {
	              return t.stop();
	            });
	          case 9:
	            return _context.a(2);
	        }
	      }, _callee, null, [[5, 7], [1, 3]]);
	    }));
	    return _startCalibration.apply(this, arguments);
	  }
	  function startRecording() {
	    return _startRecording.apply(this, arguments);
	  } // Subscribe to setup-mic and record commands
	  function _startRecording() {
	    _startRecording = _asyncToGenerator$2(/*#__PURE__*/_regenerator().m(function _callee2() {
	      var stream, mimeType, mediaRecorder, chunks, startTime, elapsedBeforePause, rafId, analyser, analyserData, source, getAmplitude, tick, maxDurationTimeout, pauseRecording, resumeRecording, stopRecording, paused, resumed, stopped, _t3, _t4;
	      return _regenerator().w(function (_context2) {
	        while (1) switch (_context2.p = _context2.n) {
	          case 0:
	            stopRecording = function _stopRecording() {
	              clearTimeout(maxDurationTimeout);
	              if (mediaRecorder.state !== "inactive") {
	                mediaRecorder.stop();
	              }
	              store.dispatch({
	                type: "starmus/mic-stop"
	              });
	            };
	            resumeRecording = function _resumeRecording() {
	              if (mediaRecorder.state === "paused") {
	                startTime = Date.now();
	                mediaRecorder.resume();
	                rafId = requestAnimationFrame(tick);
	                store.dispatch({
	                  type: "starmus/mic-resume"
	                });
	              }
	            };
	            pauseRecording = function _pauseRecording() {
	              if (mediaRecorder.state === "recording") {
	                elapsedBeforePause += (Date.now() - startTime) / 1000;
	                mediaRecorder.pause();
	                if (rafId) {
	                  cancelAnimationFrame(rafId);
	                  rafId = null;
	                }
	                store.dispatch({
	                  type: "starmus/mic-pause"
	                });
	              }
	            };
	            tick = function _tick() {
	              var now = store.getState();
	              if (now.status !== "recording") {
	                return;
	              }
	              var elapsed = elapsedBeforePause + (Date.now() - startTime) / 1000;
	              var amplitude = getAmplitude();
	              store.dispatch({
	                type: "starmus/recorder-tick",
	                duration: elapsed,
	                amplitude: amplitude
	              });

	              // Enforce max duration
	              if (elapsed >= MAX_DURATION_SECONDS) {
	                stopRecording();
	                return;
	              }
	              rafId = requestAnimationFrame(tick);
	            };
	            getAmplitude = function _getAmplitude() {
	              if (!analyser || !analyserData) {
	                return 0;
	              }
	              analyser.getByteTimeDomainData(analyserData);
	              var sumSq = 0;
	              for (var i = 0; i < analyserData.length; i++) {
	                var v = (analyserData[i] - 128) / 128;
	                sumSq += v * v;
	              }
	              return Math.min(100, Math.sqrt(sumSq / analyserData.length) * 200);
	            };
	            store.dispatch({
	              type: "starmus/mic-start"
	            });
	            _context2.p = 1;
	            _context2.n = 2;
	            return navigator.mediaDevices.getUserMedia({
	              audio: {
	                echoCancellation: true,
	                noiseSuppression: true,
	                sampleRate: 16000,
	                channelCount: 1
	              }
	            });
	          case 2:
	            stream = _context2.v;
	            _context2.n = 4;
	            break;
	          case 3:
	            _context2.p = 3;
	            _t3 = _context2.v;
	            console.error("[Recorder] Cannot open microphone for recording:", _t3);
	            store.dispatch({
	              type: "starmus/error",
	              error: {
	                code: "MIC_DENIED",
	                message: _t3.message,
	                retryable: true
	              }
	            });
	            return _context2.a(2);
	          case 4:
	            mimeType = getSupportedMimeType();
	            _context2.p = 5;
	            mediaRecorder = new MediaRecorder(stream, mimeType ? {
	              mimeType: mimeType
	            } : {});
	            _context2.n = 7;
	            break;
	          case 6:
	            _context2.p = 6;
	            _t4 = _context2.v;
	            console.error("[Recorder] MediaRecorder creation failed:", _t4);
	            store.dispatch({
	              type: "starmus/error",
	              error: {
	                code: "MEDIARECORDER_FAILED",
	                message: _t4.message,
	                retryable: false
	              }
	            });
	            stream.getTracks().forEach(function (t) {
	              return t.stop();
	            });
	            return _context2.a(2);
	          case 7:
	            chunks = [];
	            startTime = Date.now();
	            elapsedBeforePause = 0;
	            rafId = null; // Amplitude meter — uses AudioContext only on Tier A/B
	            analyser = null;
	            analyserData = null;
	            if (!(tier !== "C")) {
	              _context2.n = 12;
	              break;
	            }
	            _context2.p = 8;
	            if (sharedAudioContext) {
	              _context2.n = 9;
	              break;
	            }
	            sharedAudioContext = new (window.AudioContext || window.webkitAudioContext)({
	              sampleRate: 16000
	            });
	            _context2.n = 10;
	            break;
	          case 9:
	            if (!(sharedAudioContext.state === "suspended")) {
	              _context2.n = 10;
	              break;
	            }
	            _context2.n = 10;
	            return sharedAudioContext.resume();
	          case 10:
	            source = sharedAudioContext.createMediaStreamSource(stream);
	            analyser = sharedAudioContext.createAnalyser();
	            analyser.fftSize = 256;
	            analyser.smoothingTimeConstant = 0.6;
	            source.connect(analyser);
	            analyserData = new Uint8Array(analyser.fftSize);
	            _context2.n = 12;
	            break;
	          case 11:
	            _context2.p = 11;
	            _context2.v;
	          case 12:
	            mediaRecorder.addEventListener("dataavailable", function (e) {
	              if (e.data && e.data.size > 0) {
	                chunks.push(e.data);
	              }
	            });
	            mediaRecorder.addEventListener("stop", function () {
	              if (rafId) {
	                cancelAnimationFrame(rafId);
	                rafId = null;
	              }
	              stream.getTracks().forEach(function (t) {
	                return t.stop();
	              });
	              var finalMime = mimeType || "audio/webm";
	              var blob = new Blob(chunks, {
	                type: finalMime
	              });
	              var fileName = "starmus-".concat(instanceId, "-").concat(Date.now(), ".webm");
	              store.dispatch({
	                type: "starmus/recording-available",
	                payload: {
	                  blob: blob,
	                  fileName: fileName
	                }
	              });
	            });
	            mediaRecorder.start(1000); // 1-second chunks
	            startTime = Date.now();
	            rafId = requestAnimationFrame(tick);

	            // Max-duration safety timeout
	            maxDurationTimeout = setTimeout(function () {
	              return stopRecording();
	            }, MAX_DURATION_SECONDS * 1000);
	            recorderRegistry.set(instanceId, _objectSpread2(_objectSpread2({}, recorderRegistry.get(instanceId) || {}), {}, {
	              mediaRecorder: mediaRecorder,
	              stream: stream,
	              getAmplitude: getAmplitude,
	              stopFn: stopRecording,
	              maxDurationTimeout: maxDurationTimeout
	            }));
	            // Override CommandBus subscriptions for this session
	            paused = Bus.subscribe("starmus/mic-pause", function (_p, meta) {
	              if (meta && meta.instanceId === instanceId) {
	                pauseRecording();
	              }
	            });
	            resumed = Bus.subscribe("starmus/mic-resume", function (_p, meta) {
	              if (meta && meta.instanceId === instanceId) {
	                resumeRecording();
	              }
	            });
	            stopped = Bus.subscribe("starmus/mic-stop", function (_p, meta) {
	              if (meta && meta.instanceId === instanceId) {
	                stopRecording();
	                paused();
	                resumed();
	                stopped();
	              }
	            });
	          case 13:
	            return _context2.a(2);
	        }
	      }, _callee2, null, [[8, 11], [5, 6], [1, 3]]);
	    }));
	    return _startRecording.apply(this, arguments);
	  }
	  Bus.subscribe("starmus/setup-mic", function (_p, meta) {
	    if (meta && meta.instanceId === instanceId) {
	      startCalibration();
	    }
	  });
	  Bus.subscribe("starmus/mic-start", function (_p, meta) {
	    if (meta && meta.instanceId === instanceId) {
	      startRecording();
	    }
	  });

	  // Report environment data
	  var envData = sparxstarIntegration.getEnvironmentData();
	  if (envData && envData.tier) {
	    store.dispatch({
	      type: "starmus/tier-ready",
	      payload: {
	        tier: envData.tier
	      }
	    });
	  }
	}
	if (typeof window !== "undefined") {
	  window.StarmusRecorder = {
	    initRecorder: initRecorder
	  };
	}

	/**
	 * Copyright (c) Starisian Technologies. All rights reserved.
	 *
	 * This file is part of the SPARXSTAR platform and is proprietary and confidential.
	 * Unauthorized copying, modification, distribution, or use of this file, via any medium,
	 * is strictly prohibited except as expressly permitted in writing by Starisian Technologies.
	 *
	 * License: Business Source License 1.1
	 * Change Date: January 1, 2036
	 * Change License: Starisian Community License
	 *
	 * See the LICENSE file in the repository root for full license terms.
	 */

	function updateField(form, name, value) {
	  var input = form.querySelector("input[name=\"".concat(name, "\"]"));
	  if (!input) {
	    input = document.createElement("input");
	    input.type = "hidden";
	    input.name = name;
	    form.appendChild(input);
	  }
	  var stringValue = _typeof$9(value) === "object" ? JSON.stringify(value) : String(value || "");

	  // Safety guard: do not overwrite a non-empty server-injected value with an empty one.
	  if (input.value && input.value.trim() !== "" && (stringValue === "" || stringValue === "{}" || stringValue === "[]")) {
	    return;
	  }
	  if (input.value !== stringValue) {
	    input.value = stringValue;
	  }
	}

	/**
	 * Builds a flat metadata map from application state.
	 * Used by initAutoMetadata and by tests to validate schema consistency.
	 *
	 * @param {Object} state - Application state from store
	 * @returns {Object} Flat key→value map of form field names to state values
	 */
	function buildMetadataMap(state) {
	  var env = state.env || {};
	  var cal = state.calibration || {};
	  var source = state.source || {};
	  var recorder = state.recorder || {};
	  return {
	    starmus_title: source.title || "",
	    starmus_language: source.language || "",
	    starmus_recording_type: source.recording_type || "",
	    audio_file_type: source.metadata && source.metadata.mimeType || "",
	    agreement_to_terms: "",
	    _starmus_calibration: cal.complete ? {
	      gain: cal.gain,
	      speechLevel: cal.speechLevel,
	      message: cal.message
	    } : {},
	    _starmus_env: env,
	    recording_metadata: source.metadata || {},
	    waveform_json: source.waveform || [],
	    session_date: "",
	    session_start_time: "",
	    session_end_time: "",
	    location: env.device && env.device.location || "",
	    gps_coordinates: env.device && env.device.gps || "",
	    interviewers_recorders: "",
	    recording_equipment: env.device && env.device.model || "",
	    audio_files_originals: source.fileName || "",
	    media_condition_notes: "",
	    related_consent_agreement: "",
	    usage_restrictions_rights: "",
	    audio_quality_score: cal.complete && cal.speechLevel ? cal.speechLevel > 60 ? "good" : cal.speechLevel > 30 ? "warning" : "poor" : "",
	    access_level: "",
	    device: env.device && env.device.model || "",
	    transcript: source.transcript || "",
	    duration: recorder && recorder.duration || 0
	  };
	}

	/**
	 * Initialises automatic metadata synchronisation from store to form fields.
	 *
	 * @param {Object} store - Redux-style store with getState and subscribe
	 * @param {HTMLFormElement} formEl - Form element to sync fields on
	 * @param {Object} [_options] - Reserved for future use
	 * @returns {function} Cleanup function — call on unmount
	 */
	function initAutoMetadata(store, formEl, _options) {
	  if (!store || !formEl) {
	    console.warn("[StarmusMetadata] Store or Form missing.");
	    return function () {};
	  }
	  function sync() {
	    var state = store.getState();
	    var map = buildMetadataMap(state);

	    // Sync core fields
	    updateField(formEl, "_starmus_calibration", map._starmus_calibration);
	    updateField(formEl, "_starmus_env", map._starmus_env);
	    if (map.recording_metadata) {
	      updateField(formEl, "recording_metadata", map.recording_metadata);
	    }
	    if (map.transcript) {
	      updateField(formEl, "transcription", map.transcript);
	    }
	    var source = state.source || {};
	    if (source.transcriptJson) {
	      updateField(formEl, "transcription_json", source.transcriptJson);
	    }
	    if (map.waveform_json && map.waveform_json.length > 0) {
	      updateField(formEl, "waveform_json", map.waveform_json);
	    }
	  }
	  sync();
	  return store.subscribe(sync);
	}

	/**
	 * @file starmus-integrator.js
	 * @version 6.5.0-SCHEMA-NORMALIZER
	 * @description Bridges and NORMALIZES SparxstarUEC data to match Starmus Backend Schema.
	 */

	window.Starmus = window.Starmus || {
	  /* intentionally empty */
	};

	/**
	 * Current version of the Starmus integration layer.
	 * @global
	 * @type {string}
	 */
	window.Starmus.version = "6.5.0";

	/**
	 * Exposes Peaks.js waveform library through the Starmus namespace.
	 * Creates a bridge between the global Peaks library and Starmus.Peaks.
	 * Provides a fallback implementation if Peaks.js is not available.
	 *
	 * @function
	 * @exports exposePeaksBridge
	 * @returns {void}
	 */
	// 1. PEAKS BRIDGE
	function exposePeaksBridge() {
	  if (window.Peaks && !window.Starmus.Peaks) {
	    window.Starmus.Peaks = window.Peaks;
	  } else if (!window.Peaks) {
	    window.Peaks = {
	      init: function init() {
	        return null;
	      }
	    };
	    window.Starmus.Peaks = window.Peaks;
	  }
	}
	exposePeaksBridge();

	/**
	 * Speech Recognition API compatibility check and polyfill setup.
	 * Detects browser support for speech recognition and logs availability.
	 * Sets up webkit prefixed fallback for cross-browser compatibility.
	 */
	// 2. SPEECH API CHECK
	if (!("SpeechRecognition" in window) && !("webkitSpeechRecognition" in window)) {
	  console.log("[StarmusIntegrator] Speech API missing (Tier B/C)");
	} else {
	  window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
	}

	/**
	 * Handles SparxstarUEC environment data and normalizes it for Starmus backend.
	 * Listens for 'sparxstar:environment-ready' events and transforms the payload
	 * to match the strict schema expected by the Starmus backend.
	 *
	 * @listens window~sparxstar:environment-ready
	 * @param {CustomEvent} e - The environment ready event
	 * @param {Object} e.detail - Raw UEC environment data
	 * @param {Object} e.detail.technical - Technical device information
	 * @param {Object} e.detail.identifiers - Session and visitor identifiers
	 */
	// 3. UEC DATA INGESTION (CRITICAL FIX)
	function getRuntimeStore() {
	  if (window.__STARMUS_RUNTIME_INSTANCE__) {
	    return window.__STARMUS_RUNTIME_INSTANCE__;
	  }
	  if (window.StarmusRuntime && window.StarmusRuntime.store) {
	    return window.StarmusRuntime.store;
	  }
	  return null;
	}
	window.addEventListener("sparxstar:environment-ready", function (e) {
	  var _raw$identifiers, _raw$identifiers2;
	  console.log("[StarmusIntegrator] 📡 Parsing UEC Payload...");
	  var runtimeStore = getRuntimeStore();
	  if (!runtimeStore) {
	    return;
	  }
	  var raw = e.detail || {
	    /* intentionally empty */
	  };
	  var tech = raw.technical || {
	    /* intentionally empty */
	  };
	  var rawTech = tech.raw || {
	    /* intentionally empty */
	  };
	  var profile = tech.profile || {
	    /* intentionally empty */
	  };
	  var idents = raw.identifiers || {
	    /* intentionally empty */
	  }; // Sometimes at root
	  // Handle case where identifiers might be inside technical or separate (based on logs)

	  /**
	   * Normalized environment data object matching Starmus backend schema.
	   * @type {Object}
	   * @property {Object} device - Device information including class, OS, and user agent
	   * @property {Object} browser - Browser capabilities and client details
	   * @property {Object} network - Network information and connection profile
	   * @property {Object} identifiers - Session, visitor, and IP identifiers
	   * @property {Object} features - Battery and performance feature detection
	   * @property {Array} errors - Array of initialization errors
	   */
	  // --- NORMALIZE TO STRICT SCHEMA ---
	  // The server expects keys: 'device', 'browser', 'network', 'errors' at ROOT of _starmus_env

	  var normalizedEnv = {
	    // 1. Device Info (Merge Detector + Profile)
	    device: _objectSpread2(_objectSpread2({}, rawTech.device || {
	      /* intentionally empty */
	    }), {}, {
	      class: profile.deviceClass || "unknown",
	      os: ((_raw$identifiers = raw.identifiers) === null || _raw$identifiers === void 0 || (_raw$identifiers = _raw$identifiers.deviceDetails) === null || _raw$identifiers === void 0 ? void 0 : _raw$identifiers.os) || {
	        /* intentionally empty */
	      },
	      userAgent: navigator.userAgent
	    }),
	    // 2. Browser Info
	    browser: _objectSpread2(_objectSpread2({}, rawTech.browser || {
	      /* intentionally empty */
	    }), ((_raw$identifiers2 = raw.identifiers) === null || _raw$identifiers2 === void 0 || (_raw$identifiers2 = _raw$identifiers2.deviceDetails) === null || _raw$identifiers2 === void 0 ? void 0 : _raw$identifiers2.client) || {
	      /* intentionally empty */
	    }),
	    // 3. Network Info
	    network: _objectSpread2(_objectSpread2({}, rawTech.network || {
	      /* intentionally empty */
	    }), {}, {
	      profile: profile.networkProfile || "unknown"
	    }),
	    // 4. Identifiers (Session/Visitor)
	    identifiers: {
	      sessionId: idents.sessionId || raw.sessionId || "unknown",
	      visitorId: idents.visitorId || raw.visitorId || "unknown",
	      ip: idents.ipAddress || "0.0.0.0"
	    },
	    // 5. Features / Battery / Perf
	    features: {
	      battery: rawTech.battery || {
	        /* intentionally empty */
	      },
	      performance: rawTech.performance || {
	        /* intentionally empty */
	      }
	    },
	    // 6. Init Error Array (Required by Schema)
	    errors: [],
	    // 7. Fingerprint (Explicitly required for Schema)
	    fingerprint: raw.fingerprint || idents.fingerprint || idents.visitorId || "unknown"
	  };
	  console.log("[StarmusIntegrator] ✅ Normalized Env:", normalizedEnv);

	  // Dispatch merged environment
	  runtimeStore.dispatch({
	    type: "starmus/env-update",
	    payload: normalizedEnv
	  });
	});

	/**
	 * Audio Context watchdog for user activation compliance.
	 * Resumes suspended AudioContext on first user interaction to comply
	 * with browser autoplay policies. Uses {once: true} to run only once.
	 *
	 * @listens document~click
	 */
	// 4. AUDIO CONTEXT WATCHDOG
	document.addEventListener("click", function () {
	  try {
	    var ctx = window.StarmusAudioContext;
	    if (ctx && ctx.state === "suspended") {
	      ctx.resume();
	    }
	  } catch (_unused) {
	    /* intentionally empty */
	  }
	}, {
	  once: true
	});

	/**
	 * Copyright (c) Starisian Technologies. All rights reserved.
	 *
	 * This file is part of the SPARXSTAR platform and is proprietary and confidential.
	 * Unauthorized copying, modification, distribution, or use of this file, via any medium,
	 * is strictly prohibited except as expressly permitted in writing by Starisian Technologies.
	 *
	 * License: Business Source License 1.1
	 * Change Date: January 1, 2036
	 * Change License: Starisian Community License
	 *
	 * See the LICENSE file in the repository root for full license terms.
	 */


	/* --- Global error capture (Africa first: surface runtime errors clearly) --- */
	(function () {
	  var log = function log(type, data) {
	    return console.warn("[STARMUS RUNTIME]", type, data);
	  };
	  window.addEventListener("error", function (e) {
	    log("window.error", {
	      message: e.message,
	      file: e.filename,
	      line: e.lineno,
	      col: e.colno
	    });
	  });
	  window.addEventListener("unhandledrejection", function (e) {
	    log("unhandledrejection", e.reason);
	  });
	})();

	/* --- Store --- */
	var store = createStore();
	window.__STARMUS_RUNTIME_INSTANCE__ = store;
	window.StarmusStoreInstance = store;
	window.StarmusRuntime = window.StarmusRuntime || {};
	window.StarmusRuntime.store = store;

	/**
	 * Initialises a recorder instance from a form element.
	 *
	 * @param {HTMLFormElement} recorderForm - Form with data-starmus-instance attribute
	 * @param {string} instanceId - Instance identifier
	 * @returns {void}
	 */
	function initRecorderInstance(recorderForm, instanceId) {
	  console.log("[StarmusMain] Booting recorder for ID:", instanceId);
	  recorderForm.addEventListener("submit", function (e) {
	    return e.preventDefault();
	  });
	  sparxstarIntegration.init().then(function (environmentData) {
	    initCore(store, instanceId, environmentData);
	    initInstance(store, {}, instanceId);
	    initRecorder(store, instanceId);
	    initOffline();
	    initAutoMetadata(store, recorderForm);
	  }).catch(function (error) {
	    console.warn("[StarmusMain] SPARXSTAR init failed, using fallback:", error);
	    initCore(store, instanceId, {});
	    initInstance(store, {}, instanceId);
	    initRecorder(store, instanceId);
	    initOffline();
	    initAutoMetadata(store, recorderForm);
	  });
	}

	/* --- Bootstrap on DOM ready --- */
	document.addEventListener("DOMContentLoaded", function () {
	  try {
	    var recorderForm = document.querySelector("form[data-starmus-instance]");
	    if (recorderForm) {
	      var instanceId = recorderForm.getAttribute("data-starmus-instance");
	      initRecorderInstance(recorderForm, instanceId);
	    } else {
	      console.warn("[StarmusMain] No Starmus recorder form found.");
	    }
	  } catch (e) {
	    console.error("[StarmusMain] Boot failed:", e);
	  }
	});

	/* --- Global API exports --- */
	window.StarmusRecorder = initRecorder;
	window.StarmusTus = {
	  queueSubmission: queueSubmission
	};
	window.StarmusOfflineQueue = getOfflineQueue;
	window.SparxstarIntegration = sparxstarIntegration;

})();
