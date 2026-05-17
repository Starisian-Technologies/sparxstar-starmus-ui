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
 * @file starmus-hooks.js
 * @version 5.3.0
 * @description Lightweight publish/subscribe event bus for Starmus module communication.
 * Provides a global CommandBus for decoupled inter-module messaging.
 */

"use strict";

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
function dispatch(command, payload = {}, meta = {}) {
    const handlers = registry[command];
    if (!handlers || handlers.length === 0) {
        console.warn(`[Bus] Dispatched '${command}' but nobody is listening.`);
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
function debugLog(..._args) {
    /* console.log(..._args); */
}

const Bus = { subscribe, dispatch, debugLog };

globalScope.CommandBus = Bus;
globalScope.StarmusHooks = Bus;

export { subscribe, dispatch, debugLog, Bus as CommandBus, Bus as StarmusHooks };
