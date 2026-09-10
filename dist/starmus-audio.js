(function () {
  'use strict';

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
   * Global scope for cross-environment compatibility.
   * @type {object}
   */
  const globalScope = typeof window !== "undefined" ? window : globalThis;
  if (!globalScope.StarmusRegistry) {
    globalScope.StarmusRegistry = {};
  }
  const registry = globalScope.StarmusRegistry;

  /**
   * Subscribes a handler to a named command.
   *
   * @param {string} command - Command name to listen for
   * @param {function} handler - Handler called with (payload, meta)
   * @returns {function} Unsubscribe function
   */
  function subscribe(command, handler) {
    if (!registry[command]) {
      registry[command] = [];
    }
    registry[command].push(handler);
    return function unsubscribe() {
      const idx = registry[command].indexOf(handler);
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
    let payload = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    let meta = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    const handlers = registry[command];
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
  const Bus = {
    subscribe: subscribe,
    dispatch: dispatch,
    debugLog: debugLog
  };
  globalScope.CommandBus = Bus;
  globalScope.StarmusHooks = Bus;

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
    const DEFAULT_INITIAL_STATE = {
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
        },
        // ADR-035: the capture profile travels with the asset. The whole
        // attainment record is kept — profile name, what was requested,
        // what the device actually delivered — because a consumer needs
        // all three to judge whether a measurement from this asset is
        // admissible. Two derived booleans would not carry that.
        captureProfile: null,
        captureAttainment: null
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
      const out = {};
      for (const k in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, k) && k !== "__proto__" && k !== "constructor" && k !== "prototype") {
          out[k] = obj[k];
        }
      }
      return out;
    }
    function merge(a, b) {
      const out = shallowClone(a);
      for (const k in b) {
        if (Object.prototype.hasOwnProperty.call(b, k) && k !== "__proto__" && k !== "constructor" && k !== "prototype") {
          out[k] = b[k];
        }
      }
      return out;
    }
    function reducer(state, action) {
      var _action$attainment$pr, _action$attainment, _action$attainment2;
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
            const newEnv = merge(state.env, action.payload || {});
            if (!newEnv.errors) {
              newEnv.errors = state.env.errors || [];
            }
            return merge(state, {
              env: newEnv
            });
          }
        case "starmus/error":
          {
            const errObj = action.error || action.payload;
            const currentErrors = state.env && state.env.errors ? state.env.errors.slice() : [];
            currentErrors.push({
              code: errObj.code || "RUNTIME_ERROR",
              message: errObj.message || "Unknown",
              timestamp: Date.now(),
              severity: errObj.retryable === false ? "hard" : "soft"
            });
            const shouldResetStatus = (state.status === "calibrating" || state.status === "recording") && (errObj.code === "MIC_DENIED" || errObj.code === "MEDIARECORDER_FAILED");
            return merge(state, {
              status: shouldResetStatus ? "ready" : state.status,
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
        case "starmus/capture-profile":
          return merge(state, {
            source: merge(state.source, {
              captureProfile: (_action$attainment$pr = (_action$attainment = action.attainment) === null || _action$attainment === void 0 ? void 0 : _action$attainment.profile) !== null && _action$attainment$pr !== void 0 ? _action$attainment$pr : null,
              captureAttainment: (_action$attainment2 = action.attainment) !== null && _action$attainment2 !== void 0 ? _action$attainment2 : null
            })
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
      let state = merge(DEFAULT_INITIAL_STATE, initial || {});
      const listeners = [];
      return {
        getState: function getState() {
          return state;
        },
        dispatch: function dispatch(action) {
          state = reducer(state, action);
          for (let i = 0; i < listeners.length; i++) {
            listeners[i](state);
          }
        },
        subscribe: function subscribe(fn) {
          listeners.push(fn);
          return function () {
            const index = listeners.indexOf(fn);
            if (index >= 0) {
              listeners.splice(index, 1);
            }
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
  const runtimeGlobal = typeof window !== "undefined" ? window : globalThis;

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

  function createUrlResult(address, location) {
      if (typeof URL === "function") {
          return new URL(address, location);
      }

      const anchor = document.createElement("a");
      if (location) {
          anchor.href = location;
      }
      anchor.href = address;

      return {
          toString() {
              return anchor.href;
          },
      };
  }

  function URLParse(address, location) {
      return createUrlResult(address, location);
  }

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
    return new URLParse(link, origin).toString();
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


  /**
   * SPARXSTAR integration object. Provides init, getEnvironmentData, reportError.
   * When the full Sirus/UEC platform is available on `window`, it delegates there.
   * Otherwise falls back to capability detection.
   *
   * @type {Object}
   */
  const sparxstarIntegration = {
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
      const bootstrap = typeof window !== "undefined" ? window.STARMUS_BOOTSTRAP : undefined;
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
      const hasMediaRecorder = typeof MediaRecorder !== "undefined";
      const hasGetUserMedia = typeof navigator !== "undefined" && navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === "function";
      const hasAudioContext = typeof window !== "undefined" && (typeof window.AudioContext === "function" || typeof window.webkitAudioContext === "function");
      const fallbackTier = !hasMediaRecorder || !hasGetUserMedia ? "C" : hasAudioContext ? "A" : "B";
      return {
        tier: fallbackTier,
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
      const b = this._battery;
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
  let UploadCircuitBreaker = /*#__PURE__*/function () {
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
  const uploadCircuitBreaker = new UploadCircuitBreaker();

  /* ---- Config ---- */

  /**
   * Returns a configuration object merged from tier-defaults and global overrides.
   *
   * @returns {Object} Upload configuration
   */
  function getConfig() {
    const envData = sparxstarIntegration.getEnvironmentData();
    const settings = (envData === null || envData === void 0 ? void 0 : envData.recordingSettings) || {};
    const bootstrap = typeof window !== "undefined" && window.STARMUS_BOOTSTRAP ? window.STARMUS_BOOTSTRAP : {};
    const defaults = {
      chunkSize: settings.uploadChunkSize || 512 * 1024,
      // max 512 KB per AGENTS.md
      retryDelays: [0, 2000, 4000],
      removeFingerprintOnSuccess: true,
      maxChunkRetries: 3,
      requestTimeoutMs: 5000,
      endpoint: bootstrap.restUrl ? "".concat(bootstrap.restUrl.replace(/\/$/, ""), "/").concat(bootstrap.uploadEndpoint || "tus") : "",
      nonce: bootstrap.nonce || "",
      endpoints: bootstrap.restUrl ? {
        tus: "".concat(bootstrap.restUrl.replace(/\/$/, ""), "/").concat(bootstrap.uploadEndpoint || "tus"),
        directUpload: "".concat(bootstrap.restUrl.replace(/\/$/, ""), "/upload-fallback")
      } : {}
    };
    const globalCfg = typeof window !== "undefined" && (window.starmusTus || window.starmusConfig) || {};
    const merged = {};
    for (var _i = 0, _Object$entries = Object.entries(defaults); _i < _Object$entries.length; _i++) {
      const _Object$entries$_i = _slicedToArray$1(_Object$entries[_i], 2),
        key = _Object$entries$_i[0],
        val = _Object$entries$_i[1];
      merged[key] = val;
    }
    for (var _i2 = 0, _Object$entries2 = Object.entries(globalCfg); _i2 < _Object$entries2.length; _i2++) {
      const _Object$entries2$_i = _slicedToArray$1(_Object$entries2[_i2], 2),
        key = _Object$entries2$_i[0],
        val = _Object$entries2$_i[1];
      if (key === "__proto__" || key === "constructor" || key === "prototype") {
        continue;
      }
      merged[key] = val;
    }
    merged.chunkSize = Math.min(Number.isFinite(merged.chunkSize) ? merged.chunkSize : 512 * 1024, 512 * 1024);
    return merged;
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
    const raw = _typeof$9(value) === "object" ? JSON.stringify(value) : String(value || "");
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
      const values = new Uint8Array(16);
      crypto.getRandomValues(values);
      values[6] = values[6] & 0x0f | 0x40; // RFC 4122 version 4
      values[8] = values[8] & 0x3f | 0x80; // RFC 4122 variant
      const hex = Array.from(values, function (value) {
        return value.toString(16).padStart(2, "0");
      }).join("");
      return "".concat(hex.slice(0, 8), "-").concat(hex.slice(8, 12), "-").concat(hex.slice(12, 16), "-").concat(hex.slice(16, 20), "-").concat(hex.slice(20));
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
        _i3,
        _Object$entries3,
        _Object$entries3$_i,
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
            requestTimeoutMs = Number.isFinite(cfg.requestTimeoutMs) ? cfg.requestTimeoutMs : 5000; // ADR-034: this package holds no CMS path. The host injects the endpoint
            // via STARMUS_BOOTSTRAP; a hard-coded WordPress route here made the
            // package silently CMS-coupled and contradicted its own architecture doc.
            // Failing loudly is correct — a default that posts a speaker's recording
            // to a guessed URL is worse than not uploading it.
            endpoint = (_cfg$endpoints = cfg.endpoints) === null || _cfg$endpoints === void 0 ? void 0 : _cfg$endpoints.directUpload;
            if (endpoint) {
              _context2.n = 1;
              break;
            }
            throw new Error("NO_UPLOAD_ENDPOINT: set STARMUS_BOOTSTRAP.restUrl (and optionally uploadEndpoint). This package ships no default.");
          case 1:
            fields = normalizeFormFields(formFields);
            if (blob instanceof Blob) {
              _context2.n = 2;
              break;
            }
            throw new Error("INVALID_BLOB_TYPE: blob must be a Blob instance");
          case 2:
            fd = new FormData();
            uploadId = createUploadId();
            fd.append("audio_file", blob, fileName);
            fd.append("upload_uuid", uploadId);
            for (_i3 = 0, _Object$entries3 = Object.entries(fields); _i3 < _Object$entries3.length; _i3++) {
              _Object$entries3$_i = _slicedToArray$1(_Object$entries3[_i3], 2), key = _Object$entries3$_i[0], val = _Object$entries3$_i[1];
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
              const xhr = new XMLHttpRequest();
              const timeout = setTimeout(function () {
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
                    var _parsed$data, _parsed$data2;
                    const parsed = JSON.parse(xhr.responseText);
                    // Default successful HTTP responses to success: true, while
                    // still allowing an explicit server-provided success value
                    // (including false) to override the default.
                    const success = Object.prototype.hasOwnProperty.call(parsed, "success") ? parsed.success : true;
                    // The server's identifier wins over the client-generated
                    // one, in whichever spelling it arrives. Checking only
                    // `uploadId` and writing the local id into that field made
                    // the local id outrank a server `upload_id` downstream,
                    // because completion reads `uploadId` first.
                    const parsedUploadId = [parsed.uploadId, parsed.upload_id, (_parsed$data = parsed.data) === null || _parsed$data === void 0 ? void 0 : _parsed$data.uploadId, (_parsed$data2 = parsed.data) === null || _parsed$data2 === void 0 ? void 0 : _parsed$data2.upload_id].find(function (value) {
                      return typeof value === "string" && value.trim() !== "";
                    }) || uploadId;
                    resolve(_objectSpread2(_objectSpread2({}, parsed), {}, {
                      success: success,
                      uploadId: parsedUploadId
                    }));
                  } catch (_unused) {
                    resolve({
                      success: true,
                      uploadId: uploadId,
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
        _i4,
        _Object$entries4,
        _Object$entries4$_i,
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
            nonce = cfg.nonce || ""; // ADR-034: host-injected, never a CMS path held by this package.
            tusEndpoint = cfg.endpoint || ((_cfg$endpoints2 = cfg.endpoints) === null || _cfg$endpoints2 === void 0 ? void 0 : _cfg$endpoints2.tus);
            if (tusEndpoint) {
              _context3.n = 1;
              break;
            }
            throw new Error("NO_UPLOAD_ENDPOINT: set STARMUS_BOOTSTRAP.restUrl (and optionally uploadEndpoint). This package ships no default.");
          case 1:
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
            for (_i4 = 0, _Object$entries4 = Object.entries(fields); _i4 < _Object$entries4.length; _i4++) {
              _Object$entries4$_i = _slicedToArray$1(_Object$entries4[_i4], 2), key = _Object$entries4$_i[0], val = _Object$entries4$_i[1];
              tusMetadata[key] = sanitizeMetadata(val);
            }
            headers = {};
            if (nonce) {
              headers["X-WP-Nonce"] = nonce;
            }
            return _context3.a(2, new Promise(function (resolve, reject) {
              let settled = false;
              let timeoutId = null;
              const upload = new Upload(blob, {
                endpoint: tusEndpoint,
                chunkSize: cfg.chunkSize,
                retryDelays: cfg.retryDelays,
                removeFingerprintOnSuccess: cfg.removeFingerprintOnSuccess,
                checksumAlgorithm: "sha256",
                metadata: tusMetadata,
                headers: headers,
                onProgress: function onProgress(bytesUploaded, bytesTotal) {
                  if (_onProgress) {
                    _onProgress(bytesUploaded, bytesTotal);
                  }
                },
                onSuccess: function onSuccess() {
                  if (timeoutId) {
                    clearTimeout(timeoutId);
                  }
                  settled = true;
                  resolve({
                    success: true,
                    url: upload.url,
                    uploadId: uploadId
                  });
                },
                onError: function onError(err) {
                  if (timeoutId) {
                    clearTimeout(timeoutId);
                  }
                  settled = true;
                  console.error("[TUS] Upload error:", err);
                  sparxstarIntegration.reportError("tus_upload_error", {
                    error: err.message,
                    instanceId: instanceId,
                    tier: metadata.tier
                  });
                  reject(err);
                }
              });
              const requestTimeoutMs = Number.isFinite(cfg.requestTimeoutMs) ? cfg.requestTimeoutMs : 5000;
              timeoutId = setTimeout(function () {
                if (settled) {
                  return;
                }
                settled = true;
                upload.abort();
                reject(new Error("TUS upload timed out after ".concat(requestTimeoutMs, "ms")));
              }, requestTimeoutMs);
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

  /**
   * @file starmus-completion-event.js
   * @summary The single home for the `starmus:complete` event.
   *
   * `starmus:complete` is the boundary between capture and the platform audio
   * lifecycle (ADR-034): nothing server-side begins until it fires. It therefore
   * has to fire on every path that ends in a stored recording — an immediate
   * upload and a queued upload that later drains — and it has to describe the
   * asset that was actually captured.
   *
   * It lives here rather than in `starmus-core.js` so the offline queue can emit
   * the same event without duplicating how it is built, and without a circular
   * import between core and offline.
   */

  /**
   * Map a captured MIME type or file extension to the format name the
   * capture-to-ingestion contract uses.
   *
   * @param {string} mimeType
   * @param {string} fileName
   * @returns {string|null} null when the format is not one this package can name.
   */
  function resolveUploadFormat(mimeType, fileName) {
    const type = String(mimeType || "").trim().toLowerCase();
    const name = String(fileName || "").trim().toLowerCase();
    const ext = name.includes(".") ? name.split(".").pop() : "";
    if (type.includes("audio/mp4") || type.includes("audio/x-m4a") || type.includes("audio/aac") || type.includes("aac") || type.includes("mp4a") || ext === "m4a" || ext === "mp4" || ext === "aac") {
      return "aac-lc";
    }
    if (type.includes("audio/ogg") || type.includes("audio/opus") || type.includes("opus") || ext === "opus" || ext === "ogg") {
      return "opus";
    }

    // WAV and MP3 are reported as themselves. ADR-035 holds the container and
    // codec restriction pending OQ-021, so this package does not decide that
    // an arriving format is inadmissible — it names what it has and lets the
    // Spoken Audio Node rule on it. Silently mapping these onto `opus` would
    // be worse: it would misdescribe the asset.
    if (type.includes("audio/wav") || type.includes("audio/wave") || type.includes("audio/x-wav") || ext === "wav") {
      return "wav";
    }
    if (type.includes("audio/mpeg") || type.includes("audio/mp3") || ext === "mp3") {
      return "mp3";
    }
    return null;
  }

  /**
   * Read the contributor's stored consent record, if any.
   *
   * @returns {{granted?: boolean}|null}
   */
  function readContributorConsent() {
    try {
      const raw = typeof localStorage !== "undefined" ? localStorage.getItem("starmus_contributor_consent") : null;
      return raw ? JSON.parse(raw) : null;
    } catch (_unused) {
      return null;
    }
  }

  /**
   * Pick the upload identifier out of a result, in whichever spelling it
   * arrived, or an empty string when the result carries none.
   *
   * This cannot tell a server-issued identifier from a client-generated one:
   * `uploadDirect` already writes the client's UUID into `uploadId` when the
   * server returns no identifier of its own, so by the time a result reaches
   * here the two are indistinguishable. That fallback is deliberate — the same
   * UUID travels as TUS `upload_uuid` metadata, so it is a real correlation
   * handle rather than a guess — but this function does not verify the origin,
   * and callers must not assume it did.
   *
   * @param {Object} result
   * @returns {string}
   */
  function resolveUploadId(result) {
    var _result$data, _result$data2;
    return [result === null || result === void 0 ? void 0 : result.uploadId, result === null || result === void 0 ? void 0 : result.upload_id, result === null || result === void 0 || (_result$data = result.data) === null || _result$data === void 0 ? void 0 : _result$data.uploadId, result === null || result === void 0 || (_result$data2 = result.data) === null || _result$data2 === void 0 ? void 0 : _result$data2.upload_id].find(function (value) {
      return typeof value === "string" && value.trim() !== "";
    }) || "";
  }

  /**
   * Build the `starmus:complete` detail from an upload result and the metadata
   * that travelled with the asset.
   *
   * Audio details come from the capture attainment record, never from constants:
   * a `documentation` session at 48 kHz stereo must not be announced as 16 kHz
   * mono. `null` means the device did not report the value.
   *
   * @param {Object} input
   * @param {string} input.instanceId
   * @param {Object} input.result       Upload result.
   * @param {Object} input.metadata     Metadata that travelled with the asset.
   * @param {Object} [input.formFields]
   * @param {string} [input.fileName]
   * @param {string} [input.mimeType]
   * @param {string} [input.language]
   * @param {string} [input.contributorId]
   * @param {boolean} [input.calibrationApplied]
   * @param {number} [input.durationMs]
   * @returns {Object|null} null when the format cannot be named.
   */
  function buildCompletionDetail(input) {
    var _input$metadata, _input$durationMs, _attainment$actual$sa, _attainment$actual, _attainment$actual$ch, _attainment$actual2, _input$metadata2, _attainment$attained, _input$formFields;
    const format = resolveUploadFormat(input.mimeType, input.fileName);
    if (!format) {
      return null;
    }
    const attainment = ((_input$metadata = input.metadata) === null || _input$metadata === void 0 ? void 0 : _input$metadata.captureAttainment) || null;
    const consent = readContributorConsent();
    return {
      sessionId: input.instanceId,
      uploadId: resolveUploadId(input.result),
      durationMs: (_input$durationMs = input.durationMs) !== null && _input$durationMs !== void 0 ? _input$durationMs : 0,
      sampleRate: (_attainment$actual$sa = attainment === null || attainment === void 0 || (_attainment$actual = attainment.actual) === null || _attainment$actual === void 0 ? void 0 : _attainment$actual.sampleRate) !== null && _attainment$actual$sa !== void 0 ? _attainment$actual$sa : null,
      channels: (_attainment$actual$ch = attainment === null || attainment === void 0 || (_attainment$actual2 = attainment.actual) === null || _attainment$actual2 === void 0 ? void 0 : _attainment$actual2.channelCount) !== null && _attainment$actual$ch !== void 0 ? _attainment$actual$ch : null,
      captureProfile: ((_input$metadata2 = input.metadata) === null || _input$metadata2 === void 0 ? void 0 : _input$metadata2.captureProfile) || null,
      captureProfileAttained: (_attainment$attained = attainment === null || attainment === void 0 ? void 0 : attainment.attained) !== null && _attainment$attained !== void 0 ? _attainment$attained : null,
      format: format,
      language: input.language || ((_input$formFields = input.formFields) === null || _input$formFields === void 0 ? void 0 : _input$formFields.language) || "",
      contributorId: input.contributorId || "",
      consentGranted: !!(consent && consent.granted),
      calibrationApplied: !!input.calibrationApplied
    };
  }

  /**
   * Dispatch `starmus:complete`. No-op when the detail could not be built or
   * there is no document to dispatch on.
   *
   * @param {Object|null} detail
   * @returns {boolean} whether the event was dispatched.
   */
  function emitCompletionEvent(detail) {
    if (!detail || typeof document === "undefined") {
      return false;
    }
    document.dispatchEvent(new CustomEvent("starmus:complete", {
      detail: detail
    }));
    return true;
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


  /** @type {Object} Queue configuration constants */
  const CONFIG = {
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

  /** Tracks whether the singleton queue has installed its network listener. */
  let networkListenerInstalled = false;

  /**
   * Resolves the maximum blob size permitted for the given metadata's tier.
   *
   * @param {Object} [metadata={}] - Submission metadata with optional tier property
   * @returns {number} Maximum blob size in bytes
   */
  function getMaxBlobSize() {
    var _metadata$tier, _metadata$env;
    let metadata = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    const rawTier = metadata && _typeof$9(metadata) === "object" ? (_metadata$tier = metadata.tier) !== null && _metadata$tier !== void 0 ? _metadata$tier : (_metadata$env = metadata.env) === null || _metadata$env === void 0 ? void 0 : _metadata$env.tier : undefined;
    if (typeof rawTier === "string" && Object.prototype.hasOwnProperty.call(CONFIG.maxBlobSizes, rawTier)) {
      return CONFIG.maxBlobSizes[rawTier];
    }
    return CONFIG.defaultMaxBlobSize;
  }
  function createOfflineSubmissionId() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return "starmus-offline-".concat(crypto.randomUUID());
    }
    if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
      const values = new Uint8Array(16);
      crypto.getRandomValues(values);
      values[6] = values[6] & 0x0f | 0x40;
      values[8] = values[8] & 0x3f | 0x80;
      const hex = Array.from(values, function (value) {
        return value.toString(16).padStart(2, "0");
      }).join("");
      const suffix = "".concat(hex.slice(0, 8), "-").concat(hex.slice(8, 12), "-").concat(hex.slice(12, 16), "-").concat(hex.slice(16, 20), "-").concat(hex.slice(20));
      return "starmus-offline-".concat(suffix);
    }
    throw new Error("Secure UUID generation is not available in this runtime");
  }

  /**
   * @private
   * Offline submission queue backed by IndexedDB.
   *
   * Eviction policy (currently implemented):
   * - Entries are removed on successful upload.
   * - Entries that exceed {@link CONFIG.maxRetries} failures are removed at the
   *   next processQueue run (they are not left orphaned indefinitely).
   *
   * Target eviction policy (Phase 3 — not yet implemented):
   * - LRU, 20 MB maximum total queue size.
   * - Entries older than 7 days are eligible for automatic eviction.
   * - Eviction will run on queue initialization and after each successful upload.
   *
   * Storage: IndexedDB, database "StarmusSubmissions", store "pendingSubmissions".
   */
  let OfflineQueue = /*#__PURE__*/function () {
    function OfflineQueue() {
      _classCallCheck$9(this, OfflineQueue);
      /** @type {IDBDatabase|null} */
      this.db = null;
      /** @type {boolean} */
      this.isProcessing = false;
      /** @type {number|null} */
      this.processQueueTimeoutId = null;
      /** @type {number|null} */
      this.processQueueDueAt = null;
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
                  const req = indexedDB.open(CONFIG.dbName, CONFIG.dbVersion);
                  req.onerror = function (e) {
                    const error = e.target.error;
                    console.error("[Offline] CRITICAL: DB open failed:", error);
                    _this._reportStorageFailure("db_open_failed", error, {
                      name: error.name,
                      message: error.message,
                      userAgent: navigator.userAgent
                    });
                    reject(error);
                  };
                  req.onblocked = function () {
                    const error = new Error("DB open blocked — close other tabs");
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
                    const db = e.target.result;
                    if (!db.objectStoreNames.contains(CONFIG.storeName)) {
                      const store = db.createObjectStore(CONFIG.storeName, {
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
                  id: createOfflineSubmissionId(),
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
                  const tx = _this2.db.transaction([CONFIG.storeName], "readwrite");
                  const store = tx.objectStore(CONFIG.storeName);
                  store.add(item);
                  tx.oncomplete = function () {
                    debugLog("[Offline] Queued:", item.id);
                    _this2._notifyQueueUpdate();
                    if (navigator.onLine) {
                      _this2._scheduleProcessQueue(0);
                    }
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
                  const tx = _this3.db.transaction([CONFIG.storeName], "readonly");
                  const req = tx.objectStore(CONFIG.storeName).getAll();
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
                  const tx = _this4.db.transaction([CONFIG.storeName], "readwrite");
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
                  const tx = _this5.db.transaction([CONFIG.storeName], "readwrite");
                  const store = tx.objectStore(CONFIG.storeName);
                  const req = store.get(id);
                  req.onsuccess = function () {
                    const item = req.result;
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
          var pending, _iterator, _step, item, id, audioBlob, fileName, formFields, metadata, retryCount, instanceId, delay, _metadata$durationMs, _metadata$env2, result, detail, msg, nonRetryable, nextRetryCount, nextDelay, _t, _t2, _t3;
          return _regenerator().w(function (_context6) {
            while (1) switch (_context6.p = _context6.n) {
              case 0:
                if (!(this.isProcessing || !navigator.onLine)) {
                  _context6.n = 1;
                  break;
                }
                return _context6.a(2);
              case 1:
                this._clearScheduledProcessQueue();
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
                  _context6.n = 17;
                  break;
                }
                item = _step.value;
                id = item.id, audioBlob = item.audioBlob, fileName = item.fileName, formFields = item.formFields, metadata = item.metadata, retryCount = item.retryCount, instanceId = item.instanceId;
                if (!(retryCount >= CONFIG.maxRetries)) {
                  _context6.n = 9;
                  break;
                }
                _context6.n = 8;
                return this.remove(id);
              case 8:
                return _context6.a(3, 16);
              case 9:
                if (!(item.lastAttempt !== null)) {
                  _context6.n = 10;
                  break;
                }
                delay = CONFIG.retryDelays[Math.min(retryCount, CONFIG.retryDelays.length - 1)];
                if (!(Date.now() - item.lastAttempt < delay)) {
                  _context6.n = 10;
                  break;
                }
                return _context6.a(3, 16);
              case 10:
                _context6.p = 10;
                _context6.n = 11;
                return uploadWithPriority({
                  blob: audioBlob,
                  fileName: fileName,
                  formFields: formFields,
                  metadata: metadata,
                  instanceId: instanceId
                });
              case 11:
                result = _context6.v;
                // `starmus:complete` is the boundary before any
                // server-side processing (ADR-034). A queued upload that
                // drains is as complete as an immediate one, so it fires
                // here too — and it fires before `remove()`, because
                // removal destroys the metadata the event is built from.
                detail = buildCompletionDetail({
                  instanceId: instanceId,
                  result: result,
                  metadata: metadata,
                  formFields: formFields,
                  fileName: fileName,
                  mimeType: (metadata === null || metadata === void 0 ? void 0 : metadata.mimeType) || audioBlob.type || "",
                  durationMs: (_metadata$durationMs = metadata === null || metadata === void 0 ? void 0 : metadata.durationMs) !== null && _metadata$durationMs !== void 0 ? _metadata$durationMs : 0,
                  language: formFields === null || formFields === void 0 ? void 0 : formFields.language,
                  contributorId: (metadata === null || metadata === void 0 || (_metadata$env2 = metadata.env) === null || _metadata$env2 === void 0 || (_metadata$env2 = _metadata$env2.identifiers) === null || _metadata$env2 === void 0 ? void 0 : _metadata$env2.visitorId) || "",
                  calibrationApplied: !!(metadata !== null && metadata !== void 0 && metadata.calibration)
                });
                if (detail) {
                  emitCompletionEvent(detail);
                } else {
                  // The upload succeeded but the format cannot be named,
                  // so no consumer can be told this asset exists. The
                  // entry is still removed — the asset is on the server
                  // and re-uploading it on every future drain would burn
                  // bandwidth the contributor is paying for without ever
                  // producing a nameable format. What must not happen is
                  // this passing in silence, so it is reported.
                  console.error("[Offline] Uploaded but could not build starmus:complete:", {
                    id: id,
                    fileName: fileName,
                    mimeType: (metadata === null || metadata === void 0 ? void 0 : metadata.mimeType) || audioBlob.type || ""
                  });
                  sparxstarIntegration.reportError("completion_detail_unbuildable", {
                    submissionId: id,
                    instanceId: instanceId,
                    fileName: fileName,
                    mimeType: (metadata === null || metadata === void 0 ? void 0 : metadata.mimeType) || audioBlob.type || "",
                    captureProfile: (metadata === null || metadata === void 0 ? void 0 : metadata.captureProfile) || null
                  });
                }
                _context6.n = 12;
                return this.remove(id);
              case 12:
                _context6.n = 16;
                break;
              case 13:
                _context6.p = 13;
                _t = _context6.v;
                msg = _t && _t.message ? _t.message : String(_t);
                nonRetryable = /400|Invalid JSON|QuotaExceeded/i.test(msg);
                if (!nonRetryable) {
                  _context6.n = 15;
                  break;
                }
                _context6.n = 14;
                return this.remove(id);
              case 14:
                _context6.n = 16;
                break;
              case 15:
                nextRetryCount = Math.min(retryCount + 1, CONFIG.maxRetries);
                _context6.n = 16;
                return this._updateRetry(id, nextRetryCount, msg);
              case 16:
                _context6.n = 7;
                break;
              case 17:
                _context6.n = 19;
                break;
              case 18:
                _context6.p = 18;
                _t2 = _context6.v;
                _iterator.e(_t2);
              case 19:
                _context6.p = 19;
                _iterator.f();
                return _context6.f(19);
              case 20:
                _context6.n = 22;
                break;
              case 21:
                _context6.p = 21;
                _t3 = _context6.v;
                console.error("[Offline] Queue fatal:", _t3);
              case 22:
                _context6.p = 22;
                this.isProcessing = false;
                _context6.n = 23;
                return this._getNextProcessDelay();
              case 23:
                nextDelay = _context6.v;
                if (nextDelay !== null) {
                  this._scheduleProcessQueue(nextDelay);
                }
                return _context6.f(22);
              case 24:
                return _context6.a(2);
            }
          }, _callee6, this, [[10, 13], [6, 18, 19, 20], [3, 21, 22, 24]]);
        }));
        function processQueue() {
          return _processQueue.apply(this, arguments);
        }
        return processQueue;
      }()
      /**
       * Sets up the connectivity-restored listener once for the singleton queue.
       *
       * @returns {void}
       */
      )
    }, {
      key: "setupNetworkListeners",
      value: function setupNetworkListeners() {
        var _this6 = this;
        if (networkListenerInstalled) {
          return;
        }
        networkListenerInstalled = true;
        window.addEventListener("online", function () {
          _this6._scheduleProcessQueue(0);
        });

        // Flush pending items on startup when already online.
        if (navigator.onLine) {
          this._scheduleProcessQueue(0);
        }
      }
      /** @private */
    }, {
      key: "_clearScheduledProcessQueue",
      value: function _clearScheduledProcessQueue() {
        if (this.processQueueTimeoutId !== null) {
          window.clearTimeout(this.processQueueTimeoutId);
          this.processQueueTimeoutId = null;
        }
        this.processQueueDueAt = null;
      }
      /** @private */
    }, {
      key: "_scheduleProcessQueue",
      value: function _scheduleProcessQueue(delayMs) {
        var _this7 = this;
        if (!navigator.onLine) {
          return;
        }
        const safeDelay = Math.max(0, typeof delayMs === "number" ? delayMs : 0);
        const dueAt = Date.now() + safeDelay;
        if (this.processQueueTimeoutId !== null && this.processQueueDueAt !== null && this.processQueueDueAt <= dueAt) {
          return;
        }
        this._clearScheduledProcessQueue();
        this.processQueueDueAt = dueAt;
        this.processQueueTimeoutId = window.setTimeout(function () {
          _this7.processQueueTimeoutId = null;
          _this7.processQueueDueAt = null;
          void _this7.processQueue();
        }, safeDelay);
      }
      /** @private */
    }, {
      key: "_getNextProcessDelay",
      value: (function () {
        var _getNextProcessDelay2 = _asyncToGenerator$2(/*#__PURE__*/_regenerator().m(function _callee7() {
          var pending, nextDelay, now, _iterator2, _step2, item, retryDelay, remainingDelay, _t4;
          return _regenerator().w(function (_context7) {
            while (1) switch (_context7.p = _context7.n) {
              case 0:
                _context7.n = 1;
                return this.getAll();
              case 1:
                pending = _context7.v;
                if (!(pending.length === 0)) {
                  _context7.n = 2;
                  break;
                }
                return _context7.a(2, null);
              case 2:
                nextDelay = null;
                now = Date.now();
                _iterator2 = _createForOfIteratorHelper$1(pending);
                _context7.p = 3;
                _iterator2.s();
              case 4:
                if ((_step2 = _iterator2.n()).done) {
                  _context7.n = 7;
                  break;
                }
                item = _step2.value;
                if (!(item.retryCount >= CONFIG.maxRetries)) {
                  _context7.n = 5;
                  break;
                }
                return _context7.a(2, 0);
              case 5:
                retryDelay = CONFIG.retryDelays[Math.min(item.retryCount, CONFIG.retryDelays.length - 1)];
                remainingDelay = item.lastAttempt === null ? 0 : Math.max(0, retryDelay - (now - item.lastAttempt));
                if (nextDelay === null || remainingDelay < nextDelay) {
                  nextDelay = remainingDelay;
                }
              case 6:
                _context7.n = 4;
                break;
              case 7:
                _context7.n = 9;
                break;
              case 8:
                _context7.p = 8;
                _t4 = _context7.v;
                _iterator2.e(_t4);
              case 9:
                _context7.p = 9;
                _iterator2.f();
                return _context7.f(9);
              case 10:
                return _context7.a(2, nextDelay);
            }
          }, _callee7, this, [[3, 8, 9, 10]]);
        }));
        function _getNextProcessDelay() {
          return _getNextProcessDelay2.apply(this, arguments);
        }
        return _getNextProcessDelay;
      }() /** @private */)
    }, {
      key: "_notifyQueueUpdate",
      value: function _notifyQueueUpdate() {
        const BUS = window.CommandBus || window.StarmusHooks;
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
        let details = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        const errorData = {
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
        const messages = {
          no_indexeddb: "Your browser doesn't support offline storage. Recordings will upload immediately.",
          db_open_failed: "Storage initialisation failed. Please check your browser settings.",
          db_blocked: "Please close other tabs and try again.",
          quota_exceeded: "Storage full. Please free up space or upload pending recordings."
        };
        const message = messages[type] || "Storage error occurred.";
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
  const offlineQueue = new OfflineQueue();

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
    _getOfflineQueue = _asyncToGenerator$2(/*#__PURE__*/_regenerator().m(function _callee8() {
      return _regenerator().w(function (_context8) {
        while (1) switch (_context8.n) {
          case 0:
            if (offlineQueue.db) {
              _context8.n = 2;
              break;
            }
            _context8.n = 1;
            return offlineQueue.init();
          case 1:
            offlineQueue.setupNetworkListeners();
          case 2:
            return _context8.a(2, offlineQueue);
        }
      }, _callee8);
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
    _queueSubmission = _asyncToGenerator$2(/*#__PURE__*/_regenerator().m(function _callee9(instanceId, audioBlob, fileName, formFields, metadata) {
      var q;
      return _regenerator().w(function (_context9) {
        while (1) switch (_context9.n) {
          case 0:
            _context9.n = 1;
            return getOfflineQueue();
          case 1:
            q = _context9.v;
            return _context9.a(2, q.add(instanceId, audioBlob, fileName, formFields, metadata));
        }
      }, _callee9);
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
    _getPendingCount = _asyncToGenerator$2(/*#__PURE__*/_regenerator().m(function _callee0() {
      var q, list;
      return _regenerator().w(function (_context0) {
        while (1) switch (_context0.n) {
          case 0:
            _context0.n = 1;
            return getOfflineQueue();
          case 1:
            q = _context0.v;
            _context0.n = 2;
            return q.getAll();
          case 2:
            list = _context0.v;
            return _context0.a(2, list.length);
        }
      }, _callee0);
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


  /**
   * Mutable capability flags populated after tier resolution.
   * Sirus will overwrite these values at runtime in Phase 3.
   * Do not hardcode feature logic outside of this object.
   *
   * @type {{ tier: string, allowRecording: boolean, allowCalibration: boolean, allowCanvas: boolean, allowLiveTranscript: boolean }}
   */
  const starmusCapabilities = {
    tier: "A",
    allowRecording: true,
    allowCalibration: true,
    allowCanvas: true,
    allowLiveTranscript: true
  };

  /**
   * Converts a server-provided redirect into a safe same-origin HTTP(S) URL.
   *
   * @param {unknown} candidate - Redirect value returned by the upload service
   * @returns {string|null} Safe redirect URL, or null when the value is unsafe
   */
  function getSafeRedirect(candidate) {
    if (typeof candidate !== "string" || candidate.length === 0) {
      return null;
    }
    try {
      const redirect = new URL(candidate, window.location.origin);
      const isHttp = redirect.protocol === "https:" || redirect.protocol === "http:";
      return isHttp && redirect.origin === window.location.origin ? redirect.href : null;
    } catch (_unused) {
      return null;
    }
  }

  /**
   * Detects browser capability tier.
   * Prefers the tier provided by SPARXSTAR environment data.
   *
   * @param {Object|null} [environmentData=null] - SPARXSTAR environment data
   * @returns {'A'|'B'|'C'} Tier classification
   */
  function detectTier() {
    let environmentData = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
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
      const tier = detectTier(environmentData);
      const enhancedEnv = _objectSpread2(_objectSpread2(_objectSpread2({}, env), environmentData), {}, {
        tier: tier,
        sparxstar_available: sparxstarIntegration.isAvailable
      });

      // Populate mutable capabilities — Sirus will overwrite these in Phase 3
      starmusCapabilities.tier = tier;
      starmusCapabilities.allowRecording = tier !== "C";
      starmusCapabilities.allowCalibration = tier !== "C";
      starmusCapabilities.allowCanvas = tier !== "C";
      starmusCapabilities.allowLiveTranscript = tier !== "C";
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
      const tier = detectTier();

      // Populate mutable capabilities on the error path so consumers
      // never observe stale Tier A defaults when init() rejects.
      starmusCapabilities.tier = tier;
      starmusCapabilities.allowRecording = tier !== "C";
      starmusCapabilities.allowCalibration = tier !== "C";
      starmusCapabilities.allowCanvas = tier !== "C";
      starmusCapabilities.allowLiveTranscript = tier !== "C";
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
        var _source$transcript, _source$metadata, _source$metadata2;
        var state, source, calibration, currentEnvData, stateEnv, audioBlob, fileName, captureAttainment, metadata, result, _completedSource$meta, _completedSource$meta2, _completedState$env, _result$data, _result$data2, completedState, completedSource, completedCalibration, detail, redirect, message, retryableUploadError, submissionId, pending, _t, _t2;
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
              // ADR-035 / capture-to-ingestion contract: the capture profile travels
              // with the asset. This object is what the direct and TUS serializers
              // send and what the offline queue persists for later retry, so the
              // profile has to be in it here or it reaches ingestion on no path at
              // all. `null` means the recorder never reported one (a file upload via
              // the Tier C fallback), which is itself information the consumer needs.
              captureAttainment = source.captureAttainment || null;
              metadata = {
                transcript: ((_source$transcript = source.transcript) === null || _source$transcript === void 0 ? void 0 : _source$transcript.trim()) || null,
                calibration: calibration.complete ? {
                  gain: calibration.gain,
                  speechLevel: calibration.speechLevel
                } : null,
                captureProfile: source.captureProfile || null,
                captureAttainment: captureAttainment,
                // Persisted so a queued upload that drains hours later can still
                // describe the asset it sent. The store state it came from is long
                // gone by then.
                durationMs: Math.round((((_source$metadata = source.metadata) === null || _source$metadata === void 0 ? void 0 : _source$metadata.duration) || 0) * 1000),
                mimeType: ((_source$metadata2 = source.metadata) === null || _source$metadata2 === void 0 ? void 0 : _source$metadata2.mimeType) || audioBlob.type || "",
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

              // Emit starmus:complete — boundary between recording and server-side processing.
              // Nothing downstream triggers until this event fires.
              if (!(result && result.success)) {
                _context.n = 6;
                break;
              }
              completedState = store.getState();
              completedSource = completedState.source || {};
              completedCalibration = completedState.calibration || {};
              detail = buildCompletionDetail({
                instanceId: instanceId,
                result: result,
                metadata: metadata,
                formFields: formFields,
                fileName: fileName,
                mimeType: ((_completedSource$meta = completedSource.metadata) === null || _completedSource$meta === void 0 ? void 0 : _completedSource$meta.mimeType) || audioBlob.type || "",
                durationMs: Math.round((((_completedSource$meta2 = completedSource.metadata) === null || _completedSource$meta2 === void 0 ? void 0 : _completedSource$meta2.duration) || 0) * 1000),
                language: completedSource.language,
                contributorId: ((_completedState$env = completedState.env) === null || _completedState$env === void 0 || (_completedState$env = _completedState$env.identifiers) === null || _completedState$env === void 0 ? void 0 : _completedState$env.visitorId) || "",
                calibrationApplied: !!completedCalibration.complete
              });
              if (detail) {
                _context.n = 5;
                break;
              }
              throw new Error("UNSUPPORTED_UPLOAD_FORMAT");
            case 5:
              emitCompletionEvent(detail);
              redirect = getSafeRedirect(((_result$data = result.data) === null || _result$data === void 0 ? void 0 : _result$data.redirect_url) || result.redirect_url);
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
                } catch (_unused2) {
                  // Cross-origin — silently skip
                }
              }
            case 6:
              _context.n = 14;
              break;
            case 7:
              _context.p = 7;
              _t = _context.v;
              console.error("[Core] Upload failed:", _t.message);
              sparxstarIntegration.reportError("upload_failed", {
                error: _t.message,
                instanceId: instanceId,
                tier: stateEnv.tier,
                network: stateEnv.network,
                fileSize: audioBlob.size
              });
              message = _t && _t.message ? _t.message : String(_t);
              retryableUploadError = !navigator.onLine || /OFFLINE_FAST_PATH|network error|timed out|circuit breaker open|HTTP 5\d\d|aborted/i.test(message);
              if (!retryableUploadError) {
                _context.n = 13;
                break;
              }
              _context.p = 8;
              _context.n = 9;
              return queueSubmission(instanceId, audioBlob, fileName, formFields, metadata);
            case 9:
              submissionId = _context.v;
              store.dispatch({
                type: "starmus/submit-queued",
                submissionId: submissionId
              });
              _context.n = 10;
              return getPendingCount();
            case 10:
              pending = _context.v;
              if (window.CommandBus) {
                window.CommandBus.dispatch("starmus/offline/queue_updated", {
                  count: pending
                });
              }
              _context.n = 12;
              break;
            case 11:
              _context.p = 11;
              _t2 = _context.v;
              console.error("[Core] Offline queue failed:", _t2);
              store.dispatch({
                type: "starmus/error",
                error: {
                  message: "Upload failed completely.",
                  retryable: false
                }
              });
            case 12:
              _context.n = 14;
              break;
            case 13:
              store.dispatch({
                type: "starmus/error",
                error: {
                  message: message,
                  retryable: false
                }
              });
            case 14:
              return _context.a(2);
          }
        }, _callee, null, [[8, 11], [2, 7]]);
      }));
      return _handleSubmit.apply(this, arguments);
    }
    Bus.subscribe("submit", function (payload, meta) {
      if (meta && meta.instanceId === instanceId) {
        handleSubmit(payload.formFields || {});
      }
    });
    Bus.subscribe("reset", function (_p, meta) {
      if (meta && meta.instanceId === instanceId) {
        store.dispatch({
          type: "starmus/reset"
        });
      }
    });
    Bus.subscribe("continue", function (_p, meta) {
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

  let currentAudio = null;

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
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
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
    const status = state.status,
      step = state.step,
      tier = state.tier;
    const recorder = state.recorder || {};
    const calibration = state.calibration || {};
    const submission = state.submission || {};

    /* --- Tier C: show file upload fallback, hide recorder UI --- */
    if (tier === "C") {
      if (elements.recorderContainer) {
        elements.recorderContainer.style.display = "none";
      }
      if (elements.setupContainer) {
        elements.setupContainer.style.display = "none";
      }
      const fallback = document.querySelector("[data-starmus-fallback-container]");
      if (fallback) {
        fallback.style.display = "block";
      }
      return;
    }

    /* --- Amplitude meter --- */
    const vol = status === "calibrating" ? calibration.volumePercent || 0 : status === "recording" ? recorder.amplitude || 0 : 0;
    if (elements.volumeMeter) {
      elements.volumeMeter.style.setProperty("--starmus-audio-level", "".concat(vol, "%"));
    }

    /* --- Timer --- */
    if (elements.timerElapsed) {
      elements.timerElapsed.textContent = formatTime(recorder.duration || 0);
    }

    /* --- Duration progress bar --- */
    if (elements.durationProgress) {
      const maxDuration = 1200;
      const pct = Math.min(100, (recorder.duration || 0) / maxDuration * 100);
      elements.durationProgress.style.setProperty("--starmus-recording-progress", "".concat(pct, "%"));
    }

    /* --- Step visibility --- */
    if (elements.step1 && elements.step2) {
      const activeStatuses = ["recording", "paused", "processing", "ready_to_submit", "submitting", "calibrating", "ready", "complete"];
      const showStep2 = step === 2 || activeStatuses.includes(status);
      elements.step1.style.display = showStep2 ? "none" : "block";
      elements.step2.style.display = showStep2 ? "block" : "none";
    }

    /* --- Calibration / setup container --- */
    const isCalibrated = calibration.complete === true;
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
    const isRec = status === "recording";
    const isPaused = status === "paused";
    const isDone = status === "ready_to_submit";
    const isReady = (status === "ready" || status === "ready_to_record" || status === "idle") && isCalibrated;
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
      const modeLabels = {
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
    const instId = forcedInstanceId || store.getState().instanceId;
    let root = document;
    if (instId) {
      const found = document.querySelector("form[data-starmus-instance=\"".concat(instId, "\"]"));
      if (found) {
        root = found;
      }
    }
    const BUS = window.CommandBus;
    const bootstrapI18n = ((_window$STARMUS_BOOTS = window.STARMUS_BOOTSTRAP) === null || _window$STARMUS_BOOTS === void 0 ? void 0 : _window$STARMUS_BOOTS.i18n) || {};
    const i18n = function i18n(key, fallback) {
      const value = bootstrapI18n[key];
      return typeof value === "string" && value.trim() !== "" ? value : fallback;
    };
    const el = {
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
      const inputs = el.step1 ? el.step1.querySelectorAll("[required]") : [];
      let valid = true;
      if (el.messageBox) {
        el.messageBox.style.display = "none";
        el.messageBox.textContent = "";
      }
      var _iterator = _createForOfIteratorHelper$1(inputs),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          const input = _step.value;
          const isCheckbox = input.type === "checkbox" || input.type === "radio";
          const isValid = isCheckbox ? input.checked : input.value.trim() !== "";
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
      const state = store.getState();
      const blob = (_state$source = state.source) === null || _state$source === void 0 ? void 0 : _state$source.blob;
      if (!blob) {
        return;
      }
      if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
        el.playBtn.textContent = i18n("play", "Play");
        return;
      }
      const url = URL.createObjectURL(blob);
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
      const formRoot = root instanceof HTMLFormElement ? root : root.querySelector("form");
      const formData = formRoot ? new FormData(formRoot) : new FormData();
      const fields = {};
      var _iterator2 = _createForOfIteratorHelper$1(formData.entries()),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          const _step2$value = _slicedToArray$1(_step2.value, 2),
            key = _step2$value[0],
            val = _step2$value[1];
          if (key === "__proto__" || key === "constructor" || key === "prototype") {
            continue;
          }
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
    const fileInput = root.querySelector('[data-starmus-file-input]');
    if (fileInput) {
      fileInput.addEventListener("change", function () {
        const file = fileInput.files[0];
        if (file) {
          store.dispatch({
            type: "starmus/file-attached",
            file: file
          });
        }
      });
    }

    /* --- Offline banner dismiss --- */
    const dismissOfflineBtn = root.querySelector("[data-starmus-offline-dismiss]");
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
        const badge = root.querySelector("[data-starmus-queue-count]");
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
    const unsubscribe = store.subscribe(function (state) {
      return render(state, el, i18n);
    });
    render(store.getState(), el, i18n);
    return unsubscribe;
  }

  /**
   * @file starmus-capture-profiles.js
   * @summary Named capture profiles. Audio constraints belong to a profile the
   *          calling product chooses — never to a platform-wide ceiling.
   *
   * Governed by ADR-035. The 16 kHz / mono / 32 kbps limits that used to be
   * applied to every recording in this package are a low-bandwidth
   * conversational transport profile; held platform-wide they destroy the source
   * material that documentation, sound-to-IPA, tone and prosody work depend on.
   *
   * The profile travels with the asset. A consumer reads it to decide whether a
   * measurement taken from that asset is admissible.
   *
   * The numeric floor for `documentation` is deliberately NOT set here. It is
   * OQ-021 in the governance registry, owned by AIWA and the acoustic-analysis
   * owner. `null` means "do not constrain" — the device's own default is used
   * and the real capability is reported back, rather than this package inventing
   * a floor it has no authority to set.
   */

  /** @typedef {"conversation"|"documentation"|"import"} CaptureProfileName */

  /**
   * @typedef {Object} CaptureProfile
   * @property {CaptureProfileName} name
   * @property {number|null} sampleRate           Ceiling in Hz, or null to leave unconstrained.
   * @property {number|null} channelCount         Ceiling in channels, or null to leave unconstrained.
   * @property {number|null} audioBitsPerSecond   Encoder bitrate, or null to let the browser choose.
   * @property {boolean} voiceProcessing          Request browser echo cancellation and noise suppression.
   * @property {boolean} allowLossless
   * @property {boolean} transcode
   * @property {boolean} admissibleForMeasurement
   * @property {string} description
   */

  /** @type {Record<CaptureProfileName, CaptureProfile>} */
  const CAPTURE_PROFILES = Object.freeze({
    /** Efficient interactive use. The old platform-wide numbers live here, and only here. */
    conversation: Object.freeze({
      name: "conversation",
      sampleRate: 16000,
      channelCount: 1,
      audioBitsPerSecond: 32000,
      // Echo cancellation and noise suppression make conversational speech
      // intelligible at this bitrate. They are voice-telephony processing,
      // so they belong to this profile and to no other.
      voiceProcessing: true,
      allowLossless: false,
      transcode: true,
      admissibleForMeasurement: false,
      description: "Low-bandwidth conversational capture for interactive use."
    }),
    /**
     * Highest quality the device can safely sustain, for material that will be
     * measured. Not downsampled to a transport ceiling; not denied a lossless
     * container. Floors are OQ-021 and not set in this package.
     */
    documentation: Object.freeze({
      name: "documentation",
      sampleRate: null,
      channelCount: null,
      audioBitsPerSecond: null,
      // Off deliberately. Echo cancellation and noise suppression are
      // non-linear, non-invertible processing applied before the sample
      // reaches this package. Pitch, formant and intensity measurements
      // taken downstream would be measurements of the browser's voice
      // processing, not of the speaker.
      voiceProcessing: false,
      allowLossless: true,
      transcode: false,
      admissibleForMeasurement: true,
      description: "Highest safe source quality for material that will be measured."
    }),
    /** Prerecorded material, preserved unchanged. No transcode, resample or fold-down. */
    import: Object.freeze({
      name: "import",
      sampleRate: null,
      channelCount: null,
      audioBitsPerSecond: null,
      voiceProcessing: false,
      allowLossless: true,
      transcode: false,
      admissibleForMeasurement: true,
      description: "Prerecorded material preserved byte-for-byte."
    })
  });

  /** @type {CaptureProfileName} */
  const DEFAULT_CAPTURE_PROFILE = "conversation";

  /**
   * Resolve a profile by name. An unknown name is a caller error and is not
   * silently coerced into a different profile — ADR-035 forbids satisfying a
   * request with something other than what was asked for.
   *
   * Only an absent value (`undefined` or `null`) selects the default. An empty
   * string is an explicit request for a profile that does not exist, and throws.
   *
   * @param {CaptureProfileName|undefined|null} name
   * @returns {CaptureProfile}
   */
  function resolveCaptureProfile(name) {
    if (name === undefined || name === null) {
      return CAPTURE_PROFILES[DEFAULT_CAPTURE_PROFILE];
    }
    const profile = Object.prototype.hasOwnProperty.call(CAPTURE_PROFILES, name) ? CAPTURE_PROFILES[name] : undefined;
    if (!profile) {
      throw new Error("Unknown capture profile \"".concat(String(name), "\". Expected one of: ").concat(Object.keys(CAPTURE_PROFILES).join(", "), "."));
    }
    return profile;
  }

  /**
   * The capture profile for this session, chosen by the calling product.
   *
   * The product sets `window.STARMUS_BOOTSTRAP.captureProfile`; absent that,
   * `conversation` is used, which preserves this package's previous behaviour
   * exactly. `??` rather than `||`: an explicitly supplied empty string is an
   * invalid request and must reach `resolveCaptureProfile()` to be rejected,
   * not be silently upgraded into a working profile.
   *
   * @returns {CaptureProfileName}
   */
  function activeCaptureProfileName() {
    var _bootstrap$capturePro;
    const bootstrap = typeof window !== "undefined" ? window.STARMUS_BOOTSTRAP : null;
    return (_bootstrap$capturePro = bootstrap === null || bootstrap === void 0 ? void 0 : bootstrap.captureProfile) !== null && _bootstrap$capturePro !== void 0 ? _bootstrap$capturePro : DEFAULT_CAPTURE_PROFILE;
  }

  /**
   * Build getUserMedia audio constraints for a profile. Keys the profile does
   * not constrain are omitted entirely rather than sent as a null, so the
   * browser applies its own default instead of failing the request.
   *
   * Numeric limits are sent as `{ ideal: n }`, not as `{ max: n }` or
   * `{ exact: n }`. A mandatory constraint the device cannot meet makes
   * `getUserMedia` reject with `OverconstrainedError`, and the speaker cannot
   * record at all — which ADR-011's unconditional-capture rule forbids. The
   * package therefore asks, then reports what it actually got through
   * `describeAttainment()`; enforcing a ceiling on the resulting asset is the
   * Spoken Audio Node's, where refusing does not cost the recording.
   *
   * @param {CaptureProfileName} [name]
   * @returns {MediaTrackConstraints}
   */
  function getAudioConstraints(name) {
    const profile = resolveCaptureProfile(name);
    /** @type {MediaTrackConstraints} */
    const constraints = {
      echoCancellation: profile.voiceProcessing,
      noiseSuppression: profile.voiceProcessing
    };
    if (profile.sampleRate !== null) {
      constraints.sampleRate = {
        ideal: profile.sampleRate
      };
    }
    if (profile.channelCount !== null) {
      constraints.channelCount = {
        ideal: profile.channelCount
      };
    }
    return constraints;
  }

  /**
   * MediaRecorder options for a profile. An unconstrained bitrate lets the
   * browser choose, which is what `documentation` and `import` want.
   *
   * @param {CaptureProfileName} [name]
   * @param {string} [mimeType]
   * @returns {MediaRecorderOptions}
   */
  function getRecorderOptions(name, mimeType) {
    const profile = resolveCaptureProfile(name);
    /** @type {MediaRecorderOptions} */
    const options = {};
    if (mimeType) {
      options.mimeType = mimeType;
    }
    if (profile.audioBitsPerSecond !== null) {
      options.audioBitsPerSecond = profile.audioBitsPerSecond;
    }
    return options;
  }

  /**
   * @typedef {Object} CaptureAttainment
   * @property {CaptureProfileName} profile
   * @property {{sampleRate: number|null, channelCount: number|null}} requested
   * @property {{sampleRate?: number, channelCount?: number}} actual
   * @property {boolean} attained    True only when every constrained value was verified within its limit.
   * @property {string[]} exceeded   Constrained values the device delivered above the profile's limit.
   * @property {string[]} unverified Constrained values the device did not report at all.
   */

  /**
   * Report what the device actually delivered against what the profile asked
   * for. ADR-035: an unattainable profile is reported to the product, never
   * silently satisfied by substituting a different one.
   *
   * A profile's numbers are ceilings, so a value is within limit when it is at
   * or below the requested one. A value the device does not report is
   * `unverified`, never assumed to be fine — an unreported rate is exactly the
   * case where a 44.1 or 48 kHz stream would otherwise pass unnoticed.
   *
   * @param {CaptureProfileName} name
   * @param {MediaStreamTrack} track
   * @returns {CaptureAttainment}
   */
  function describeAttainment(name, track) {
    const profile = resolveCaptureProfile(name);
    const actual = typeof (track === null || track === void 0 ? void 0 : track.getSettings) === "function" ? track.getSettings() : {};
    const requested = {
      sampleRate: profile.sampleRate,
      channelCount: profile.channelCount
    };

    /** @type {string[]} */
    const exceeded = [];
    /** @type {string[]} */
    const unverified = [];
    for (var _i = 0, _arr = /** @type {const} */["sampleRate", "channelCount"]; _i < _arr.length; _i++) {
      const key = _arr[_i];
      const limit = profile[key];
      if (limit === null) {
        continue;
      }
      const reported = actual[key];
      if (typeof reported !== "number") {
        unverified.push(key);
      } else if (reported > limit) {
        exceeded.push(key);
      }
    }
    return {
      profile: profile.name,
      requested: requested,
      actual: actual,
      attained: exceeded.length === 0 && unverified.length === 0,
      exceeded: exceeded,
      unverified: unverified
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


  /**
   * Tier-based calibration settings.
   * @type {Object}
   */
  const TIER_SETTINGS = {
    A: {
      duration: 15000,
      phases: 3,
      noiseThreshold: 5,
      speechThreshold: 20,
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
      fftSize: 512,
      smoothing: 0.4,
      gainRange: [0.8, 1.2],
      autoGainControl: false
    }
  };
  let EnhancedCalibration = /*#__PURE__*/function () {
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
          var _options$captureProfi;
          var options,
            settings,
            profile,
            analysisSampleRate,
            result,
            _args2 = arguments,
            _t;
          return _regenerator().w(function (_context2) {
            while (1) switch (_context2.p = _context2.n) {
              case 0:
                options = _args2.length > 2 && _args2[2] !== undefined ? _args2[2] : {};
                settings = this.getTierSettings(); // ADR-035: the analysis rate comes from the capture profile, never
                // from the tier. A profile that constrains nothing (documentation,
                // import) gets the device's own rate, so calibration measures the
                // signal the recorder will actually capture.
                profile = resolveCaptureProfile((_options$captureProfi = options.captureProfile) !== null && _options$captureProfi !== void 0 ? _options$captureProfi : activeCaptureProfileName());
                analysisSampleRate = profile.sampleRate;
                _context2.p = 1;
                try {
                  this.audioContext = new (window.AudioContext || window.webkitAudioContext)(analysisSampleRate === null ? {
                    latencyHint: "interactive"
                  } : {
                    sampleRate: analysisSampleRate,
                    latencyHint: "interactive"
                  });
                } catch (_sampleRateError) {
                  this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
                    latencyHint: "interactive"
                  });
                  sparxstarIntegration.reportError("calibration_samplerate_fallback", {
                    tier: this.tier,
                    captureProfile: profile.name,
                    requestedSampleRate: analysisSampleRate,
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
                  const _loop = function loop() {
                    const elapsed = Date.now() - startTime;
                    const phaseElapsed = elapsed % phaseDuration;
                    const newPhase = Math.floor(elapsed / phaseDuration);
                    if (newPhase !== currentPhase) {
                      currentPhase = newPhase;
                    }
                    _this.analyser.getByteTimeDomainData(data);
                    let sumSquares = 0;
                    for (let i = 0; i < data.length; i++) {
                      const centered = data[i] - 128;
                      sumSquares += centered * centered;
                    }
                    const rms = Math.sqrt(sumSquares / data.length) / 128;
                    const db = 20 * Math.log10(Math.max(rms, 1e-6));
                    const volume = Math.min(100, Math.max(0, (db + 60) / 60 * 100));
                    sampleCount++;
                    if (volume > maxVolume) {
                      maxVolume = volume;
                    }
                    const progress = elapsed / settings.duration * 100;
                    let message;
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
                      const avgSpeechLevel = speechPeaks.length > 0 ? speechPeaks.reduce(function (a, b) {
                        return a + b;
                      }, 0) / speechPeaks.length : maxVolume;
                      const dynamicRange = maxVolume - noiseFloor;
                      const signalToNoise = avgSpeechLevel / Math.max(noiseFloor, 1);
                      const optimalGain = _this._calculateOptimalGain(avgSpeechLevel, noiseFloor, dynamicRange, settings);
                      const result = {
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
        const targetLevel = 60;
        const baseGain = targetLevel / Math.max(speechLevel, 1);
        const _settings$gainRange = _slicedToArray$1(settings.gainRange, 2),
          minGain = _settings$gainRange[0],
          maxGain = _settings$gainRange[1];
        let gain = Math.max(minGain, Math.min(maxGain, baseGain));
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
        let score = 0;
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
        const maxScore = this.tier === "A" ? 6 : this.tier === "B" ? 5 : 4;
        const pct = score / maxScore * 100;
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
        const recs = [];
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
  const recorderRegistry = new Map();

  /**
   * Shared AudioContext reused across instances.
   * @type {AudioContext|null}
   */
  let sharedAudioContext = null;

  /**
   * Preferred MIME types in priority order.
   * WebM/Opus is strongly preferred for Africa-first bandwidth constraints.
   *
   * @type {string[]}
   */
  const PREFERRED_MIME_TYPES = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4"];

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
        const mimeType = _step.value;
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
  const MAX_DURATION_SECONDS = 1200;

  /**
   * Initialises a recorder instance for a given store and instance ID.
   * Subscribes to the CommandBus for mic-start, mic-pause, mic-resume, and mic-stop.
   *
   * @param {Object} store - Redux-style state store
   * @param {string} instanceId - Unique recorder instance identifier
   * @returns {void}
   */
  function initRecorder(store, instanceId) {
    const state = store.getState();
    const tier = state.tier || "C";

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
        var constraints, stream, calibration, result, _t, _t2, _t3;
        return _regenerator().w(function (_context) {
          while (1) switch (_context.p = _context.n) {
            case 0:
              store.dispatch({
                type: "starmus/calibration-start"
              });

              // Resolve constraints before touching the microphone. An unknown
              // profile name throws, and inside the getUserMedia try/catch that
              // throw would be reported as MIC_DENIED — sending someone to check
              // browser permissions for what is a bootstrap typo.
              _context.p = 1;
              constraints = getAudioConstraints(activeCaptureProfileName());
              _context.n = 3;
              break;
            case 2:
              _context.p = 2;
              _t = _context.v;
              console.error("[Recorder] Invalid capture profile:", _t);
              store.dispatch({
                type: "starmus/error",
                error: {
                  code: "INVALID_CAPTURE_PROFILE",
                  message: _t.message,
                  retryable: false
                }
              });
              return _context.a(2);
            case 3:
              _context.p = 3;
              _context.n = 4;
              return navigator.mediaDevices.getUserMedia({
                audio: constraints
              });
            case 4:
              stream = _context.v;
              _context.n = 6;
              break;
            case 5:
              _context.p = 5;
              _t2 = _context.v;
              console.error("[Recorder] Microphone access denied:", _t2);
              store.dispatch({
                type: "starmus/error",
                error: {
                  code: "MIC_DENIED",
                  message: _t2.message,
                  retryable: true
                }
              });
              return _context.a(2);
            case 6:
              calibration = new EnhancedCalibration();
              _context.n = 7;
              return calibration.init();
            case 7:
              _context.p = 7;
              _context.n = 8;
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
              }, {
                captureProfile: activeCaptureProfileName()
              });
            case 8:
              result = _context.v;
              // Store the calibrated stream for recording
              recorderRegistry.set(instanceId, _objectSpread2(_objectSpread2({}, recorderRegistry.get(instanceId) || {}), {}, {
                calibrationResult: result,
                stream: stream
              }));
              _context.n = 10;
              break;
            case 9:
              _context.p = 9;
              _t3 = _context.v;
              console.error("[Recorder] Calibration failed:", _t3);
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
            case 10:
              // Stop calibration stream tracks — a new stream is opened at record start
              stream.getTracks().forEach(function (t) {
                return t.stop();
              });
            case 11:
              return _context.a(2);
          }
        }, _callee, null, [[7, 9], [3, 5], [1, 2]]);
      }));
      return _startCalibration.apply(this, arguments);
    }
    function startRecording() {
      return _startRecording.apply(this, arguments);
    } // Subscribe to setup-mic and record commands
    /**
     * Dispatches a TIER_C_NO_MIC error and returns true when the current tier
     * is "C", blocking any microphone command before the recorder runs.
     *
     * @returns {boolean} true if the command was blocked (Tier C), false otherwise
     */
    function _startRecording() {
      _startRecording = _asyncToGenerator$2(/*#__PURE__*/_regenerator().m(function _callee2() {
        var constraints, stream, mimeType, captureProfile, mediaRecorder, attainment, chunks, startTime, elapsedBeforePause, rafId, analyser, analyserData, meterSampleRate, source, getAmplitude, tick, maxDurationTimeout, pauseRecording, resumeRecording, stopRecording, paused, resumed, stopped, _t4, _t5, _t6;
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
                const now = store.getState();
                if (now.status !== "recording") {
                  return;
                }
                const elapsed = elapsedBeforePause + (Date.now() - startTime) / 1000;
                const amplitude = getAmplitude();
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
                let sumSq = 0;
                for (let i = 0; i < analyserData.length; i++) {
                  const v = (analyserData[i] - 128) / 128;
                  sumSq += v * v;
                }
                return Math.min(100, Math.sqrt(sumSq / analyserData.length) * 200);
              };
              _context2.p = 1;
              constraints = getAudioConstraints(activeCaptureProfileName());
              _context2.n = 3;
              break;
            case 2:
              _context2.p = 2;
              _t4 = _context2.v;
              console.error("[Recorder] Invalid capture profile:", _t4);
              store.dispatch({
                type: "starmus/error",
                error: {
                  code: "INVALID_CAPTURE_PROFILE",
                  message: _t4.message,
                  retryable: false
                }
              });
              return _context2.a(2);
            case 3:
              _context2.p = 3;
              _context2.n = 4;
              return navigator.mediaDevices.getUserMedia({
                audio: constraints
              });
            case 4:
              stream = _context2.v;
              _context2.n = 6;
              break;
            case 5:
              _context2.p = 5;
              _t5 = _context2.v;
              console.error("[Recorder] Cannot open microphone for recording:", _t5);
              store.dispatch({
                type: "starmus/error",
                error: {
                  code: "MIC_DENIED",
                  message: _t5.message,
                  retryable: true
                }
              });
              return _context2.a(2);
            case 6:
              mimeType = getSupportedMimeType();
              captureProfile = activeCaptureProfileName();
              _context2.p = 7;
              // ADR-035: the profile's encoder options are applied here, not
              // merely declared. Constructing with only { mimeType } left
              // `conversation`'s 32 kbps ceiling as dead configuration.
              mediaRecorder = new MediaRecorder(stream, getRecorderOptions(captureProfile, mimeType));
              _context2.n = 9;
              break;
            case 8:
              _context2.p = 8;
              _t6 = _context2.v;
              console.error("[Recorder] MediaRecorder creation failed:", _t6);
              store.dispatch({
                type: "starmus/error",
                error: {
                  code: "MEDIARECORDER_FAILED",
                  message: _t6.message,
                  retryable: false
                }
              });
              stream.getTracks().forEach(function (t) {
                return t.stop();
              });
              return _context2.a(2);
            case 9:
              // ADR-035: an unattainable profile is reported to the product, never
              // silently satisfied by substituting a different one. The capture
              // profile travels with the asset so a consumer can tell whether a
              // measurement taken from it is admissible.
              attainment = describeAttainment(captureProfile, stream.getAudioTracks()[0]);
              store.dispatch({
                type: "starmus/capture-profile",
                attainment: attainment
              });
              if (!attainment.attained) {
                console.warn("[Recorder] Capture profile \"".concat(attainment.profile, "\" not attained by this device."), attainment);
              }
              store.dispatch({
                type: "starmus/mic-start"
              });
              chunks = [];
              startTime = Date.now();
              elapsedBeforePause = 0;
              rafId = null; // Amplitude meter — uses AudioContext only on Tier A/B
              analyser = null;
              analyserData = null;
              if (!(tier !== "C")) {
                _context2.n = 14;
                break;
              }
              _context2.p = 10;
              if (sharedAudioContext) {
                _context2.n = 11;
                break;
              }
              // The meter must not force a rate the capture profile did not ask
              // for; let the context follow the device for unconstrained profiles.
              // Take the rate from the profile, not from
              // getAudioConstraints(): those are MediaTrackConstraints,
              // where sampleRate is `{ ideal: n }`. AudioContext wants a
              // plain number and would throw or ignore the object.
              meterSampleRate = resolveCaptureProfile(activeCaptureProfileName()).sampleRate;
              sharedAudioContext = new (window.AudioContext || window.webkitAudioContext)(meterSampleRate === null ? {} : {
                sampleRate: meterSampleRate
              });
              _context2.n = 12;
              break;
            case 11:
              if (!(sharedAudioContext.state === "suspended")) {
                _context2.n = 12;
                break;
              }
              _context2.n = 12;
              return sharedAudioContext.resume();
            case 12:
              source = sharedAudioContext.createMediaStreamSource(stream);
              analyser = sharedAudioContext.createAnalyser();
              analyser.fftSize = 256;
              analyser.smoothingTimeConstant = 0.6;
              source.connect(analyser);
              analyserData = new Uint8Array(analyser.fftSize);
              _context2.n = 14;
              break;
            case 13:
              _context2.p = 13;
              _context2.v;
            case 14:
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
                const finalMime = mimeType || "audio/webm";
                const blob = new Blob(chunks, {
                  type: finalMime
                });
                const fileName = "starmus-".concat(instanceId, "-").concat(Date.now(), ".webm");
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
            case 15:
              return _context2.a(2);
          }
        }, _callee2, null, [[10, 13], [7, 8], [3, 5], [1, 2]]);
      }));
      return _startRecording.apply(this, arguments);
    }
    function blockIfTierC() {
      if (store.getState().tier !== "C") {
        return false;
      }
      store.dispatch({
        type: "starmus/error",
        error: {
          code: "TIER_C_NO_MIC",
          message: "Recording is not available on this device. Please upload a file.",
          retryable: false
        }
      });
      return true;
    }
    Bus.subscribe("starmus/setup-mic", function (_p, meta) {
      if (meta && meta.instanceId === instanceId) {
        if (!blockIfTierC()) {
          startCalibration();
        }
      }
    });
    Bus.subscribe("starmus/mic-start", function (_p, meta) {
      if (meta && meta.instanceId === instanceId) {
        if (!blockIfTierC()) {
          startRecording();
        }
      }
    });

    // Report environment data
    const envData = sparxstarIntegration.getEnvironmentData();
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
    let input = form.querySelector("input[name=\"".concat(name, "\"]"));
    if (!input) {
      input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      form.appendChild(input);
    }
    const stringValue = _typeof$9(value) === "object" ? JSON.stringify(value) : String(value || "");

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
    const env = state.env || {};
    const cal = state.calibration || {};
    const source = state.source || {};
    const recorder = state.recorder || {};
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
      const state = store.getState();
      const map = buildMetadataMap(state);

      // Sync core fields
      updateField(formEl, "_starmus_calibration", map._starmus_calibration);
      updateField(formEl, "_starmus_env", map._starmus_env);
      if (map.recording_metadata) {
        updateField(formEl, "recording_metadata", map.recording_metadata);
      }
      if (map.transcript) {
        updateField(formEl, "transcription", map.transcript);
      }
      const source = state.source || {};
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
    const runtimeStore = getRuntimeStore();
    if (!runtimeStore) {
      return;
    }
    const raw = e.detail || {
      /* intentionally empty */
    };
    const tech = raw.technical || {
      /* intentionally empty */
    };
    const rawTech = tech.raw || {
      /* intentionally empty */
    };
    const profile = tech.profile || {
      /* intentionally empty */
    };
    const idents = raw.identifiers || {
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

    const normalizedEnv = {
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
      const ctx = window.StarmusAudioContext;
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
    const log = function log(type, data) {
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

  /**
   * Initialises a recorder instance from a form element.
   *
   * @param {Object} store - Runtime state store
   * @param {HTMLFormElement} recorderForm - Form with data-starmus-instance attribute
   * @param {string} instanceId - Instance identifier
   * @returns {void}
   */
  function initRecorderInstance(store, recorderForm, instanceId) {
    console.log("[StarmusMain] Booting recorder for ID:", instanceId);
    recorderForm.addEventListener("submit", function (e) {
      return e.preventDefault();
    });
    sparxstarIntegration.init().then(function (environmentData) {
      initCore(store, instanceId, environmentData);
      initInstance(store, {}, instanceId);
      initRecorder(store, instanceId);
      initAutoMetadata(store, recorderForm);
    }).catch(function (error) {
      console.warn("[StarmusMain] SPARXSTAR init failed, using fallback:", error);
      initCore(store, instanceId, {});
      initInstance(store, {}, instanceId);
      initRecorder(store, instanceId);
      initAutoMetadata(store, recorderForm);
    });
  }

  /* --- Bootstrap on DOM ready --- */
  document.addEventListener("DOMContentLoaded", function () {
    const bootstrap = typeof window !== "undefined" ? window.STARMUS_BOOTSTRAP : undefined;
    if (!bootstrap || _typeof$9(bootstrap) !== "object") {
      console.warn("[StarmusMain] STARMUS_BOOTSTRAP missing. Runtime not initialised.");
      return;
    }
    try {
      const recorderForms = document.querySelectorAll("form[data-starmus-instance]");
      if (!recorderForms.length) {
        console.warn("[StarmusMain] No Starmus recorder form found.");
        return;
      }

      /* --- Store --- */
      const store = createStore();
      window.__STARMUS_RUNTIME_INSTANCE__ = store;
      window.StarmusStoreInstance = store;
      window.StarmusRuntime = window.StarmusRuntime || {};
      window.StarmusRuntime.store = store;
      window.StarmusRuntime.capabilities = starmusCapabilities;
      initOffline().catch(function (error) {
        console.warn("[StarmusMain] Offline queue unavailable, continuing:", error);
      });
      recorderForms.forEach(function (recorderForm, index) {
        const rawInstanceId = recorderForm.getAttribute("data-starmus-instance");
        const instanceId = rawInstanceId || "starmus-instance-".concat(index + 1);
        initRecorderInstance(store, recorderForm, instanceId);
      });
    } catch (e) {
      console.error("[StarmusMain] Boot failed:", e);
    }
  });

  /* --- Global API exports --- */
  const starmusRecorderApi = _typeof$9(window.StarmusRecorder) === "object" && window.StarmusRecorder !== null ? window.StarmusRecorder : {};
  starmusRecorderApi.initRecorder = initRecorder;
  window.StarmusRecorder = starmusRecorderApi;
  window.StarmusTus = {
    queueSubmission: queueSubmission
  };
  window.StarmusOfflineQueue = getOfflineQueue;
  window.SparxstarIntegration = sparxstarIntegration;
  window.StarmusCapabilities = starmusCapabilities;

})();
