'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = init;

var _uberproto = require('uberproto');

var _uberproto2 = _interopRequireDefault(_uberproto);

var _feathersQueryFilters = require('feathers-query-filters');

var _feathersQueryFilters2 = _interopRequireDefault(_feathersQueryFilters);

var _feathersErrors = require('feathers-errors');

var _feathersErrors2 = _interopRequireDefault(_feathersErrors);

var _utils = require('feathers-commons/lib/utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _ = {
  values: function values(obj) {
    return Object.keys(obj).map(function (key) {
      return obj[key];
    });
  },
  isEmpty: function isEmpty(obj) {
    return Object.keys(obj).length === 0;
  },
  extend: function extend() {
    return Object.assign.apply(Object, arguments);
  },
  omit: function omit(obj) {
    var result = Object.assign({}, obj);

    for (var _len = arguments.length, keys = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      keys[_key - 1] = arguments[_key];
    }

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = keys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var key = _step.value;

        delete result[key];
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    return result;
  },
  pick: function pick(source) {
    var result = {};

    for (var _len2 = arguments.length, keys = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      keys[_key2 - 1] = arguments[_key2];
    }

    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = keys[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var key = _step2.value;

        result[key] = source[key];
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }

    return result;
  }
};

var Service = function () {
  function Service() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Service);

    this.paginate = options.paginate || {};
    this._id = options.idField || 'id';
    this._uId = options.startId || 0;
    this.store = options.store || {};
  }

  _createClass(Service, [{
    key: 'extend',
    value: function extend(obj) {
      return _uberproto2.default.extend(obj, this);
    }

    // Find without hooks and mixins that can be used internally and always returns
    // a pagination object

  }, {
    key: '_find',
    value: function _find(params) {
      var getFilter = arguments.length <= 1 || arguments[1] === undefined ? _feathersQueryFilters2.default : arguments[1];

      var query = params.query || {};
      var filters = getFilter(query);

      var values = _.values(this.store).filter((0, _utils.matcher)(query));

      var total = values.length;

      if (filters.$sort) {
        values.sort((0, _utils.sorter)(filters.$sort));
      }

      if (filters.$skip) {
        values = values.slice(filters.$skip);
      }

      if (filters.$limit) {
        values = values.slice(0, filters.$limit);
      }

      if (filters.$select) {
        values = values.map(function (value) {
          return _.pick(value, filters.$select);
        });
      }

      return Promise.resolve({
        total: total,
        limit: filters.$limit,
        skip: filters.$skip || 0,
        data: values
      });
    }
  }, {
    key: 'find',
    value: function find(params) {
      var paginate = typeof params.paginate !== 'undefined' ? params.paginate : this.paginate;
      // Call the internal find with query parameter that include pagination
      var result = this._find(params, function (query) {
        return (0, _feathersQueryFilters2.default)(query, paginate);
      });

      if (!(paginate && paginate.default)) {
        return result.then(function (page) {
          return page.data;
        });
      }

      return result;
    }
  }, {
    key: 'get',
    value: function get(id) {
      if (id in this.store) {
        return Promise.resolve(this.store[id]);
      }

      return Promise.reject(new _feathersErrors2.default.NotFound('No record found for id \'' + id + '\''));
    }

    // Create without hooks and mixins that can be used internally

  }, {
    key: '_create',
    value: function _create(data) {
      var id = data[this._id] || this._uId++;
      var current = _.extend({}, data, _defineProperty({}, this._id, id));

      if (this.store[id]) {
        return Promise.reject(new _feathersErrors2.default.Conflict('A record with id: ' + id + ' already exists'));
      }

      return Promise.resolve(this.store[id] = current);
    }
  }, {
    key: 'create',
    value: function create(data) {
      var _this = this;

      if (Array.isArray(data)) {
        return Promise.all(data.map(function (current) {
          return _this._create(current);
        }));
      }

      return this._create(data);
    }

    // Update without hooks and mixins that can be used internally

  }, {
    key: '_update',
    value: function _update(id, data) {
      if (id in this.store) {
        // We don't want our id to change type if it can be coerced
        var oldId = this.store[id][this._id];
        id = oldId == id ? oldId : id; // jshint ignore:line

        data = _.extend({}, data, _defineProperty({}, this._id, id));
        this.store[id] = data;

        return Promise.resolve(this.store[id]);
      }

      return Promise.reject(new _feathersErrors2.default.NotFound('No record found for id \'' + id + '\''));
    }
  }, {
    key: 'update',
    value: function update(id, data) {
      if (id === null || Array.isArray(data)) {
        return Promise.reject(new _feathersErrors2.default.BadRequest('You can not replace multiple instances. Did you mean \'patch\'?'));
      }

      return this._update(id, data);
    }

    // Patch without hooks and mixins that can be used internally

  }, {
    key: '_patch',
    value: function _patch(id, data) {
      if (id in this.store) {
        _.extend(this.store[id], _.omit(data, this._id));

        return Promise.resolve(this.store[id]);
      }

      return Promise.reject(new _feathersErrors2.default.NotFound('No record found for id \'' + id + '\''));
    }
  }, {
    key: 'patch',
    value: function patch(id, data, params) {
      var _this2 = this;

      if (id === null) {
        return this._find(params).then(function (page) {
          return Promise.all(page.data.map(function (current) {
            return _this2._patch(current[_this2._id], data, params);
          }));
        });
      }

      return this._patch(id, data, params);
    }

    // Remove without hooks and mixins that can be used internally

  }, {
    key: '_remove',
    value: function _remove(id) {
      if (id in this.store) {
        var deleted = this.store[id];
        delete this.store[id];

        return Promise.resolve(deleted);
      }

      return Promise.reject(new _feathersErrors2.default.NotFound('No record found for id \'' + id + '\''));
    }
  }, {
    key: 'remove',
    value: function remove(id, params) {
      var _this3 = this;

      if (id === null) {
        return this._find(params).then(function (page) {
          return Promise.all(page.data.map(function (current) {
            return _this3._remove(current[_this3._id]);
          }));
        });
      }

      return this._remove(id);
    }
  }]);

  return Service;
}();

function init(options) {
  return new Service(options);
}

init.Service = Service;
module.exports = exports['default'];