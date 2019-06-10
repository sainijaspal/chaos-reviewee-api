// Backbone.js 1.1.2

(function(t, e) {
  if (typeof define === 'function' && define.amd) {
    define(['underscore', 'jquery', 'exports'], function(i, r, s) {
      t.Backbone = e(t, s, i, r);
    });
  } else if (typeof exports !== 'undefined') {
    const i = require('underscore');
    e(t, exports, i);
  } else {
    t.Backbone = e(t, {}, t._, t.jQuery || t.Zepto || t.ender || t.$);
  }
})(this, function(t, e, i, r) {
  const s = t.Backbone;
  const n = [];
  const a = n.push;
  const o = n.slice;
  const h = n.splice;
  e.VERSION = '1.1.2';
  e.$ = r;
  e.noConflict = function() {
    t.Backbone = s;
    return this;
  };
  e.emulateHTTP = false;
  e.emulateJSON = false;
  const u = (e.Events = {
    on(t, e, i) {
      if (!c(this, 'on', t, [e, i]) || !e) return this;
      this._events || (this._events = {});
      const r = this._events[t] || (this._events[t] = []);
      r.push({ callback: e, context: i, ctx: i || this });
      return this;
    },
    once(t, e, r) {
      if (!c(this, 'once', t, [e, r]) || !e) return this;
      const s = this;
      var n = i.once(function() {
        s.off(t, n);
        e.apply(this, arguments);
      });
      n._callback = e;
      return this.on(t, n, r);
    },
    off(t, e, r) {
      let s;
      let n;
      let a;
      let o;
      let h;
      let u;
      let l;
      let f;
      if (!this._events || !c(this, 'off', t, [e, r])) return this;
      if (!t && !e && !r) {
        this._events = void 0;
        return this;
      }
      o = t ? [t] : i.keys(this._events);
      for (h = 0, u = o.length; h < u; h++) {
        t = o[h];
        if ((a = this._events[t])) {
          this._events[t] = s = [];
          if (e || r) {
            for (l = 0, f = a.length; l < f; l++) {
              n = a[l];
              if (
                (e && e !== n.callback && e !== n.callback._callback) ||
                (r && r !== n.context)
              ) {
                s.push(n);
              }
            }
          }
          if (!s.length) delete this._events[t];
        }
      }
      return this;
    },
    trigger(t) {
      if (!this._events) return this;
      const e = o.call(arguments, 1);
      if (!c(this, 'trigger', t, e)) return this;
      const i = this._events[t];
      const r = this._events.all;
      if (i) f(i, e);
      if (r) f(r, arguments);
      return this;
    },
    stopListening(t, e, r) {
      let s = this._listeningTo;
      if (!s) return this;
      const n = !e && !r;
      if (!r && typeof e === 'object') r = this;
      if (t) (s = {})[t._listenId] = t;
      for (const a in s) {
        t = s[a];
        t.off(e, r, this);
        if (n || i.isEmpty(t._events)) delete this._listeningTo[a];
      }
      return this;
    },
  });
  const l = /\s+/;
  var c = function(t, e, i, r) {
    if (!i) return true;
    if (typeof i === 'object') {
      for (const s in i) {
        t[e].apply(t, [s, i[s]].concat(r));
      }
      return false;
    }
    if (l.test(i)) {
      const n = i.split(l);
      for (let a = 0, o = n.length; a < o; a++) {
        t[e].apply(t, [n[a]].concat(r));
      }
      return false;
    }
    return true;
  };
  var f = function(t, e) {
    let i;
    let r = -1;
    const s = t.length;
    const n = e[0];
    const a = e[1];
    const o = e[2];
    switch (e.length) {
      case 0:
        while (++r < s) (i = t[r]).callback.call(i.ctx);
        return;
      case 1:
        while (++r < s) (i = t[r]).callback.call(i.ctx, n);
        return;
      case 2:
        while (++r < s) (i = t[r]).callback.call(i.ctx, n, a);
        return;
      case 3:
        while (++r < s) (i = t[r]).callback.call(i.ctx, n, a, o);
        return;
      default:
        while (++r < s) (i = t[r]).callback.apply(i.ctx, e);
    }
  };
  const d = { listenTo: 'on', listenToOnce: 'once' };
  i.each(d, function(t, e) {
    u[e] = function(e, r, s) {
      const n = this._listeningTo || (this._listeningTo = {});
      const a = e._listenId || (e._listenId = i.uniqueId('l'));
      n[a] = e;
      if (!s && typeof r === 'object') s = this;
      e[t](r, s, this);
      return this;
    };
  });
  u.bind = u.on;
  u.unbind = u.off;
  i.extend(e, u);
  const p = (e.Model = function(t, e) {
    let r = t || {};
    e || (e = {});
    this.cid = i.uniqueId('c');
    this.attributes = {};
    if (e.collection) this.collection = e.collection;
    if (e.parse) r = this.parse(r, e) || {};
    r = i.defaults({}, r, i.result(this, 'defaults'));
    this.set(r, e);
    this.changed = {};
    this.initialize.apply(this, arguments);
  });
  i.extend(p.prototype, u, {
    changed: null,
    validationError: null,
    idAttribute: 'id',
    initialize() {},
    toJSON(t) {
      return i.clone(this.attributes);
    },
    sync() {
      return e.sync.apply(this, arguments);
    },
    get(t) {
      return this.attributes[t];
    },
    escape(t) {
      return i.escape(this.get(t));
    },
    has(t) {
      return this.get(t) != null;
    },
    set(t, e, r) {
      let s;
      let n;
      let a;
      let o;
      let h;
      let u;
      let l;
      let c;
      if (t == null) return this;
      if (typeof t === 'object') {
        n = t;
        r = e;
      } else {
        (n = {})[t] = e;
      }
      r || (r = {});
      if (!this._validate(n, r)) return false;
      a = r.unset;
      h = r.silent;
      o = [];
      u = this._changing;
      this._changing = true;
      if (!u) {
        this._previousAttributes = i.clone(this.attributes);
        this.changed = {};
      }
      (c = this.attributes), (l = this._previousAttributes);
      if (this.idAttribute in n) this.id = n[this.idAttribute];
      for (s in n) {
        e = n[s];
        if (!i.isEqual(c[s], e)) o.push(s);
        if (!i.isEqual(l[s], e)) {
          this.changed[s] = e;
        } else {
          delete this.changed[s];
        }
        a ? delete c[s] : (c[s] = e);
      }
      if (!h) {
        if (o.length) this._pending = r;
        for (let f = 0, d = o.length; f < d; f++) {
          this.trigger(`change:${o[f]}`, this, c[o[f]], r);
        }
      }
      if (u) return this;
      if (!h) {
        while (this._pending) {
          r = this._pending;
          this._pending = false;
          this.trigger('change', this, r);
        }
      }
      this._pending = false;
      this._changing = false;
      return this;
    },
    unset(t, e) {
      return this.set(t, void 0, i.extend({}, e, { unset: true }));
    },
    clear(t) {
      const e = {};
      for (const r in this.attributes) e[r] = void 0;
      return this.set(e, i.extend({}, t, { unset: true }));
    },
    hasChanged(t) {
      if (t == null) return !i.isEmpty(this.changed);
      return i.has(this.changed, t);
    },
    changedAttributes(t) {
      if (!t) return this.hasChanged() ? i.clone(this.changed) : false;
      let e;
      let r = false;
      const s = this._changing ? this._previousAttributes : this.attributes;
      for (const n in t) {
        if (i.isEqual(s[n], (e = t[n]))) continue;
        (r || (r = {}))[n] = e;
      }
      return r;
    },
    previous(t) {
      if (t == null || !this._previousAttributes) return null;
      return this._previousAttributes[t];
    },
    previousAttributes() {
      return i.clone(this._previousAttributes);
    },
    fetch(t) {
      t = t ? i.clone(t) : {};
      if (t.parse === void 0) t.parse = true;
      const e = this;
      const r = t.success;
      t.success = function(i) {
        if (!e.set(e.parse(i, t), t)) return false;
        if (r) r(e, i, t);
        e.trigger('sync', e, i, t);
      };
      q(this, t);
      return this.sync('read', this, t);
    },
    save(t, e, r) {
      let s;
      let n;
      let a;
      const o = this.attributes;
      if (t == null || typeof t === 'object') {
        s = t;
        r = e;
      } else {
        (s = {})[t] = e;
      }
      r = i.extend({ validate: true }, r);
      if (s && !r.wait) {
        if (!this.set(s, r)) return false;
      } else if (!this._validate(s, r)) return false;
      if (s && r.wait) {
        this.attributes = i.extend({}, o, s);
      }
      if (r.parse === void 0) r.parse = true;
      const h = this;
      const u = r.success;
      r.success = function(t) {
        h.attributes = o;
        let e = h.parse(t, r);
        if (r.wait) e = i.extend(s || {}, e);
        if (i.isObject(e) && !h.set(e, r)) {
          return false;
        }
        if (u) u(h, t, r);
        h.trigger('sync', h, t, r);
      };
      q(this, r);
      n = this.isNew() ? 'create' : r.patch ? 'patch' : 'update';
      if (n === 'patch') r.attrs = s;
      a = this.sync(n, this, r);
      if (s && r.wait) this.attributes = o;
      return a;
    },
    destroy(t) {
      t = t ? i.clone(t) : {};
      const e = this;
      const r = t.success;
      const s = function() {
        e.trigger('destroy', e, e.collection, t);
      };
      t.success = function(i) {
        if (t.wait || e.isNew()) s();
        if (r) r(e, i, t);
        if (!e.isNew()) e.trigger('sync', e, i, t);
      };
      if (this.isNew()) {
        t.success();
        return false;
      }
      q(this, t);
      const n = this.sync('delete', this, t);
      if (!t.wait) s();
      return n;
    },
    url() {
      const t =
        i.result(this, 'urlRoot') || i.result(this.collection, 'url') || M();
      if (this.isNew()) return t;
      return t.replace(/([^\/])$/, '$1/') + encodeURIComponent(this.id);
    },
    parse(t, e) {
      return t;
    },
    clone() {
      return new this.constructor(this.attributes);
    },
    isNew() {
      return !this.has(this.idAttribute);
    },
    isValid(t) {
      return this._validate({}, i.extend(t || {}, { validate: true }));
    },
    _validate(t, e) {
      if (!e.validate || !this.validate) return true;
      t = i.extend({}, this.attributes, t);
      const r = (this.validationError = this.validate(t, e) || null);
      if (!r) return true;
      this.trigger('invalid', this, r, i.extend(e, { validationError: r }));
      return false;
    },
  });
  const v = ['keys', 'values', 'pairs', 'invert', 'pick', 'omit'];
  i.each(v, function(t) {
    p.prototype[t] = function() {
      const e = o.call(arguments);
      e.unshift(this.attributes);
      return i[t].apply(i, e);
    };
  });
  const g = (e.Collection = function(t, e) {
    e || (e = {});
    if (e.model) this.model = e.model;
    if (e.comparator !== void 0) this.comparator = e.comparator;
    this._reset();
    this.initialize.apply(this, arguments);
    if (t) this.reset(t, i.extend({ silent: true }, e));
  });
  const m = { add: true, remove: true, merge: true };
  const y = { add: true, remove: false };
  i.extend(g.prototype, u, {
    model: p,
    initialize() {},
    toJSON(t) {
      return this.map(function(e) {
        return e.toJSON(t);
      });
    },
    sync() {
      return e.sync.apply(this, arguments);
    },
    add(t, e) {
      return this.set(t, i.extend({ merge: false }, e, y));
    },
    remove(t, e) {
      const r = !i.isArray(t);
      t = r ? [t] : i.clone(t);
      e || (e = {});
      let s;
      let n;
      let a;
      let o;
      for (s = 0, n = t.length; s < n; s++) {
        o = t[s] = this.get(t[s]);
        if (!o) continue;
        delete this._byId[o.id];
        delete this._byId[o.cid];
        a = this.indexOf(o);
        this.models.splice(a, 1);
        this.length--;
        if (!e.silent) {
          e.index = a;
          o.trigger('remove', o, this, e);
        }
        this._removeReference(o, e);
      }
      return r ? t[0] : t;
    },
    set(t, e) {
      e = i.defaults({}, e, m);
      if (e.parse) t = this.parse(t, e);
      const r = !i.isArray(t);
      t = r ? (t ? [t] : []) : i.clone(t);
      let s;
      let n;
      let a;
      let o;
      let h;
      let u;
      let l;
      const c = e.at;
      const f = this.model;
      const d = this.comparator && c == null && e.sort !== false;
      const v = i.isString(this.comparator) ? this.comparator : null;
      const g = [];
      const y = [];
      const _ = {};
      const b = e.add;
      const w = e.merge;
      const x = e.remove;
      const E = !d && b && x ? [] : false;
      for (s = 0, n = t.length; s < n; s++) {
        h = t[s] || {};
        if (h instanceof p) {
          a = o = h;
        } else {
          a = h[f.prototype.idAttribute || 'id'];
        }
        if ((u = this.get(a))) {
          if (x) _[u.cid] = true;
          if (w) {
            h = h === o ? o.attributes : h;
            if (e.parse) h = u.parse(h, e);
            u.set(h, e);
            if (d && !l && u.hasChanged(v)) l = true;
          }
          t[s] = u;
        } else if (b) {
          o = t[s] = this._prepareModel(h, e);
          if (!o) continue;
          g.push(o);
          this._addReference(o, e);
        }
        o = u || o;
        if (E && (o.isNew() || !_[o.id])) E.push(o);
        _[o.id] = true;
      }
      if (x) {
        for (s = 0, n = this.length; s < n; ++s) {
          if (!_[(o = this.models[s]).cid]) y.push(o);
        }
        if (y.length) this.remove(y, e);
      }
      if (g.length || (E && E.length)) {
        if (d) l = true;
        this.length += g.length;
        if (c != null) {
          for (s = 0, n = g.length; s < n; s++) {
            this.models.splice(c + s, 0, g[s]);
          }
        } else {
          if (E) this.models.length = 0;
          const k = E || g;
          for (s = 0, n = k.length; s < n; s++) {
            this.models.push(k[s]);
          }
        }
      }
      if (l) this.sort({ silent: true });
      if (!e.silent) {
        for (s = 0, n = g.length; s < n; s++) {
          (o = g[s]).trigger('add', o, this, e);
        }
        if (l || (E && E.length)) this.trigger('sort', this, e);
      }
      return r ? t[0] : t;
    },
    reset(t, e) {
      e || (e = {});
      for (let r = 0, s = this.models.length; r < s; r++) {
        this._removeReference(this.models[r], e);
      }
      e.previousModels = this.models;
      this._reset();
      t = this.add(t, i.extend({ silent: true }, e));
      if (!e.silent) this.trigger('reset', this, e);
      return t;
    },
    push(t, e) {
      return this.add(t, i.extend({ at: this.length }, e));
    },
    pop(t) {
      const e = this.at(this.length - 1);
      this.remove(e, t);
      return e;
    },
    unshift(t, e) {
      return this.add(t, i.extend({ at: 0 }, e));
    },
    shift(t) {
      const e = this.at(0);
      this.remove(e, t);
      return e;
    },
    slice() {
      return o.apply(this.models, arguments);
    },
    get(t) {
      if (t == null) return void 0;
      return this._byId[t] || this._byId[t.id] || this._byId[t.cid];
    },
    at(t) {
      return this.models[t];
    },
    where(t, e) {
      if (i.isEmpty(t)) return e ? void 0 : [];
      return this[e ? 'find' : 'filter'](function(e) {
        for (const i in t) {
          if (t[i] !== e.get(i)) return false;
        }
        return true;
      });
    },
    findWhere(t) {
      return this.where(t, true);
    },
    sort(t) {
      if (!this.comparator)
        throw new Error('Cannot sort a set without a comparator');
      t || (t = {});
      if (i.isString(this.comparator) || this.comparator.length === 1) {
        this.models = this.sortBy(this.comparator, this);
      } else {
        this.models.sort(i.bind(this.comparator, this));
      }
      if (!t.silent) this.trigger('sort', this, t);
      return this;
    },
    pluck(t) {
      return i.invoke(this.models, 'get', t);
    },
    fetch(t) {
      t = t ? i.clone(t) : {};
      if (t.parse === void 0) t.parse = true;
      const e = t.success;
      const r = this;
      t.success = function(i) {
        const s = t.reset ? 'reset' : 'set';
        r[s](i, t);
        if (e) e(r, i, t);
        r.trigger('sync', r, i, t);
      };
      q(this, t);
      return this.sync('read', this, t);
    },
    create(t, e) {
      e = e ? i.clone(e) : {};
      if (!(t = this._prepareModel(t, e))) return false;
      if (!e.wait) this.add(t, e);
      const r = this;
      const s = e.success;
      e.success = function(t, i) {
        if (e.wait) r.add(t, e);
        if (s) s(t, i, e);
      };
      t.save(null, e);
      return t;
    },
    parse(t, e) {
      return t;
    },
    clone() {
      return new this.constructor(this.models);
    },
    _reset() {
      this.length = 0;
      this.models = [];
      this._byId = {};
    },
    _prepareModel(t, e) {
      if (t instanceof p) return t;
      e = e ? i.clone(e) : {};
      e.collection = this;
      const r = new this.model(t, e);
      if (!r.validationError) return r;
      this.trigger('invalid', this, r.validationError, e);
      return false;
    },
    _addReference(t, e) {
      this._byId[t.cid] = t;
      if (t.id != null) this._byId[t.id] = t;
      if (!t.collection) t.collection = this;
      t.on('all', this._onModelEvent, this);
    },
    _removeReference(t, e) {
      if (this === t.collection) delete t.collection;
      t.off('all', this._onModelEvent, this);
    },
    _onModelEvent(t, e, i, r) {
      if ((t === 'add' || t === 'remove') && i !== this) return;
      if (t === 'destroy') this.remove(e, r);
      if (e && t === `change:${e.idAttribute}`) {
        delete this._byId[e.previous(e.idAttribute)];
        if (e.id != null) this._byId[e.id] = e;
      }
      this.trigger.apply(this, arguments);
    },
  });
  const _ = [
    'forEach',
    'each',
    'map',
    'collect',
    'reduce',
    'foldl',
    'inject',
    'reduceRight',
    'foldr',
    'find',
    'detect',
    'filter',
    'select',
    'reject',
    'every',
    'all',
    'some',
    'any',
    'include',
    'contains',
    'invoke',
    'max',
    'min',
    'toArray',
    'size',
    'first',
    'head',
    'take',
    'initial',
    'rest',
    'tail',
    'drop',
    'last',
    'without',
    'difference',
    'indexOf',
    'shuffle',
    'lastIndexOf',
    'isEmpty',
    'chain',
    'sample',
  ];
  i.each(_, function(t) {
    g.prototype[t] = function() {
      const e = o.call(arguments);
      e.unshift(this.models);
      return i[t].apply(i, e);
    };
  });
  const b = ['groupBy', 'countBy', 'sortBy', 'indexBy'];
  i.each(b, function(t) {
    g.prototype[t] = function(e, r) {
      const s = i.isFunction(e)
        ? e
        : function(t) {
            return t.get(e);
          };
      return i[t](this.models, s, r);
    };
  });
  const w = (e.View = function(t) {
    this.cid = i.uniqueId('view');
    t || (t = {});
    i.extend(this, i.pick(t, E));
    this._ensureElement();
    this.initialize.apply(this, arguments);
    this.delegateEvents();
  });
  const x = /^(\S+)\s*(.*)$/;
  var E = [
    'model',
    'collection',
    'el',
    'id',
    'attributes',
    'className',
    'tagName',
    'events',
  ];
  i.extend(w.prototype, u, {
    tagName: 'div',
    $(t) {
      return this.$el.find(t);
    },
    initialize() {},
    render() {
      return this;
    },
    remove() {
      this.$el.remove();
      this.stopListening();
      return this;
    },
    setElement(t, i) {
      if (this.$el) this.undelegateEvents();
      this.$el = t instanceof e.$ ? t : e.$(t);
      this.el = this.$el[0];
      if (i !== false) this.delegateEvents();
      return this;
    },
    delegateEvents(t) {
      if (!(t || (t = i.result(this, 'events')))) return this;
      this.undelegateEvents();
      for (const e in t) {
        let r = t[e];
        if (!i.isFunction(r)) r = this[t[e]];
        if (!r) continue;
        const s = e.match(x);
        let n = s[1];
        const a = s[2];
        r = i.bind(r, this);
        n += `.delegateEvents${this.cid}`;
        if (a === '') {
          this.$el.on(n, r);
        } else {
          this.$el.on(n, a, r);
        }
      }
      return this;
    },
    undelegateEvents() {
      this.$el.off(`.delegateEvents${this.cid}`);
      return this;
    },
    _ensureElement() {
      if (!this.el) {
        const t = i.extend({}, i.result(this, 'attributes'));
        if (this.id) t.id = i.result(this, 'id');
        if (this.className) t.class = i.result(this, 'className');
        const r = e.$(`<${i.result(this, 'tagName')}>`).attr(t);
        this.setElement(r, false);
      } else {
        this.setElement(i.result(this, 'el'), false);
      }
    },
  });
  e.sync = function(t, r, s) {
    const n = T[t];
    i.defaults(s || (s = {}), {
      emulateHTTP: e.emulateHTTP,
      emulateJSON: e.emulateJSON,
    });
    const a = { type: n, dataType: 'json' };
    if (!s.url) {
      a.url = i.result(r, 'url') || M();
    }
    if (
      s.data == null &&
      r &&
      (t === 'create' || t === 'update' || t === 'patch')
    ) {
      a.contentType = 'application/json';
      a.data = JSON.stringify(s.attrs || r.toJSON(s));
    }
    if (s.emulateJSON) {
      a.contentType = 'application/x-www-form-urlencoded';
      a.data = a.data ? { model: a.data } : {};
    }
    if (s.emulateHTTP && (n === 'PUT' || n === 'DELETE' || n === 'PATCH')) {
      a.type = 'POST';
      if (s.emulateJSON) a.data._method = n;
      const o = s.beforeSend;
      s.beforeSend = function(t) {
        t.setRequestHeader('X-HTTP-Method-Override', n);
        if (o) return o.apply(this, arguments);
      };
    }
    if (a.type !== 'GET' && !s.emulateJSON) {
      a.processData = false;
    }
    if (a.type === 'PATCH' && k) {
      a.xhr = function() {
        return new ActiveXObject('Microsoft.XMLHTTP');
      };
    }
    const h = (s.xhr = e.ajax(i.extend(a, s)));
    r.trigger('request', r, h, s);
    return h;
  };
  var k =
    typeof window !== 'undefined' &&
    !!window.ActiveXObject &&
    !(window.XMLHttpRequest && new XMLHttpRequest().dispatchEvent);
  var T = {
    create: 'POST',
    update: 'PUT',
    patch: 'PATCH',
    delete: 'DELETE',
    read: 'GET',
  };
  e.ajax = function() {
    return e.$.ajax.apply(e.$, arguments);
  };
  const $ = (e.Router = function(t) {
    t || (t = {});
    if (t.routes) this.routes = t.routes;
    this._bindRoutes();
    this.initialize.apply(this, arguments);
  });
  const S = /\((.*?)\)/g;
  const H = /(\(\?)?:\w+/g;
  const A = /\*\w+/g;
  const I = /[\-{}\[\]+?.,\\\^$|#\s]/g;
  i.extend($.prototype, u, {
    initialize() {},
    route(t, r, s) {
      if (!i.isRegExp(t)) t = this._routeToRegExp(t);
      if (i.isFunction(r)) {
        s = r;
        r = '';
      }
      if (!s) s = this[r];
      const n = this;
      e.history.route(t, function(i) {
        const a = n._extractParameters(t, i);
        n.execute(s, a);
        n.trigger.apply(n, [`route:${r}`].concat(a));
        n.trigger('route', r, a);
        e.history.trigger('route', n, r, a);
      });
      return this;
    },
    execute(t, e) {
      if (t) t.apply(this, e);
    },
    navigate(t, i) {
      e.history.navigate(t, i);
      return this;
    },
    _bindRoutes() {
      if (!this.routes) return;
      this.routes = i.result(this, 'routes');
      let t;
      const e = i.keys(this.routes);
      while ((t = e.pop()) != null) {
        this.route(t, this.routes[t]);
      }
    },
    _routeToRegExp(t) {
      t = t
        .replace(I, '\\$&')
        .replace(S, '(?:$1)?')
        .replace(H, function(t, e) {
          return e ? t : '([^/?]+)';
        })
        .replace(A, '([^?]*?)');
      return new RegExp(`^${t}(?:\\?([\\s\\S]*))?$`);
    },
    _extractParameters(t, e) {
      const r = t.exec(e).slice(1);
      return i.map(r, function(t, e) {
        if (e === r.length - 1) return t || null;
        return t ? decodeURIComponent(t) : null;
      });
    },
  });
  const N = (e.History = function() {
    this.handlers = [];
    i.bindAll(this, 'checkUrl');
    if (typeof window !== 'undefined') {
      this.location = window.location;
      this.history = window.history;
    }
  });
  const R = /^[#\/]|\s+$/g;
  const O = /^\/+|\/+$/g;
  const P = /msie [\w.]+/;
  const C = /\/$/;
  const j = /#.*$/;
  N.started = false;
  i.extend(N.prototype, u, {
    interval: 50,
    atRoot() {
      return this.location.pathname.replace(/[^\/]$/, '$&/') === this.root;
    },
    getHash(t) {
      const e = (t || this).location.href.match(/#(.*)$/);
      return e ? e[1] : '';
    },
    getFragment(t, e) {
      if (t == null) {
        if (this._hasPushState || !this._wantsHashChange || e) {
          t = decodeURI(this.location.pathname + this.location.search);
          const i = this.root.replace(C, '');
          if (!t.indexOf(i)) t = t.slice(i.length);
        } else {
          t = this.getHash();
        }
      }
      return t.replace(R, '');
    },
    start(t) {
      if (N.started)
        throw new Error('Backbone.history has already been started');
      N.started = true;
      this.options = i.extend({ root: '/' }, this.options, t);
      this.root = this.options.root;
      this._wantsHashChange = this.options.hashChange !== false;
      this._wantsPushState = !!this.options.pushState;
      this._hasPushState = !!(
        this.options.pushState &&
        this.history &&
        this.history.pushState
      );
      const r = this.getFragment();
      const s = document.documentMode;
      const n = P.exec(navigator.userAgent.toLowerCase()) && (!s || s <= 7);
      this.root = `/${this.root}/`.replace(O, '/');
      if (n && this._wantsHashChange) {
        const a = e.$('<iframe src="javascript:0" tabindex="-1">');
        this.iframe = a.hide().appendTo('body')[0].contentWindow;
        this.navigate(r);
      }
      if (this._hasPushState) {
        e.$(window).on('popstate', this.checkUrl);
      } else if (this._wantsHashChange && 'onhashchange' in window && !n) {
        e.$(window).on('hashchange', this.checkUrl);
      } else if (this._wantsHashChange) {
        this._checkUrlInterval = setInterval(this.checkUrl, this.interval);
      }
      this.fragment = r;
      const o = this.location;
      if (this._wantsHashChange && this._wantsPushState) {
        if (!this._hasPushState && !this.atRoot()) {
          this.fragment = this.getFragment(null, true);
          this.location.replace(`${this.root}#${this.fragment}`);
          return true;
        }
        if (this._hasPushState && this.atRoot() && o.hash) {
          this.fragment = this.getHash().replace(R, '');
          this.history.replaceState(
            {},
            document.title,
            this.root + this.fragment,
          );
        }
      }
      if (!this.options.silent) return this.loadUrl();
    },
    stop() {
      e.$(window)
        .off('popstate', this.checkUrl)
        .off('hashchange', this.checkUrl);
      if (this._checkUrlInterval) clearInterval(this._checkUrlInterval);
      N.started = false;
    },
    route(t, e) {
      this.handlers.unshift({ route: t, callback: e });
    },
    checkUrl(t) {
      let e = this.getFragment();
      if (e === this.fragment && this.iframe) {
        e = this.getFragment(this.getHash(this.iframe));
      }
      if (e === this.fragment) return false;
      if (this.iframe) this.navigate(e);
      this.loadUrl();
    },
    loadUrl(t) {
      t = this.fragment = this.getFragment(t);
      return i.any(this.handlers, function(e) {
        if (e.route.test(t)) {
          e.callback(t);
          return true;
        }
      });
    },
    navigate(t, e) {
      if (!N.started) return false;
      if (!e || e === true) e = { trigger: !!e };
      let i = this.root + (t = this.getFragment(t || ''));
      t = t.replace(j, '');
      if (this.fragment === t) return;
      this.fragment = t;
      if (t === '' && i !== '/') i = i.slice(0, -1);
      if (this._hasPushState) {
        this.history[e.replace ? 'replaceState' : 'pushState'](
          {},
          document.title,
          i,
        );
      } else if (this._wantsHashChange) {
        this._updateHash(this.location, t, e.replace);
        if (this.iframe && t !== this.getFragment(this.getHash(this.iframe))) {
          if (!e.replace) this.iframe.document.open().close();
          this._updateHash(this.iframe.location, t, e.replace);
        }
      } else {
        return this.location.assign(i);
      }
      if (e.trigger) return this.loadUrl(t);
    },
    _updateHash(t, e, i) {
      if (i) {
        const r = t.href.replace(/(javascript:|#).*$/, '');
        t.replace(`${r}#${e}`);
      } else {
        t.hash = `#${e}`;
      }
    },
  });
  e.history = new N();
  const U = function(t, e) {
    const r = this;
    let s;
    if (t && i.has(t, 'constructor')) {
      s = t.constructor;
    } else {
      s = function() {
        return r.apply(this, arguments);
      };
    }
    i.extend(s, r, e);
    const n = function() {
      this.constructor = s;
    };
    n.prototype = r.prototype;
    s.prototype = new n();
    if (t) i.extend(s.prototype, t);
    s.__super__ = r.prototype;
    return s;
  };
  p.extend = g.extend = $.extend = w.extend = N.extend = U;
  var M = function() {
    throw new Error('A "url" property or function must be specified');
  };
  var q = function(t, e) {
    const i = e.error;
    e.error = function(r) {
      if (i) i(t, r, e);
      t.trigger('error', t, r, e);
    };
  };
  return e;
});

// From http://stackoverflow.com/a/19431552
// Compatibility override - Backbone 1.1 got rid of the 'options' binding
// automatically to views in the constructor - we need to keep that.
Backbone.View = (function(View) {
  return View.extend({
    constructor(options) {
      this.options = options || {};
      View.apply(this, arguments);
    },
  });
})(Backbone.View);
