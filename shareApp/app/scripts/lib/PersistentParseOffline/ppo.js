/**
 * @license Share❣ v0.0.1
 * (c) 2013 HiddenData & VorskiImagineering http://share.url
 * License: MIT
 */

/**
 * @ngdoc overview
 * @name PersistentParseOffline
 *
 * @description
  It allows store data obtained from Parse.com and make it available without Internet access. It uses Lawnchair as a backend to store data and is really similiar to Parse.com JS SDK api.
 PPO plugin uses two method to store uploaded file. It tries to use webkitPersistentStorage and if it is not available then save base64 data via Lawnchair. Feel free to take a look at document code in shareApp/app/scripts/lib/PersistentParseOffline/ppo.js.

 It uses two adapters:

  - for online mode, ParseAdapter:
    - saves data to local storage
    - saves results of CloudCode functions
  - for offline mode, LawnchairAdapter:
    - obtains data from local storage
    - saves execution of CloudCode funtions to changelog
    - saves Parse.Object.save() to changelog

 After turning Internet on, there is a synchronization.

 Remember, if you want to use PPO plugin you have to replace every Parse.Query call with PPO.Query.
 */
(function (root) {
  root.PPO = root.PPO || {};
  root.PPO.VERSION = "js0.0.1";

  var PPO = root.PPO;
  var Parse = root.Parse || {},
    Lawnchair = root.Lawnchair || {},
    lchair = new Lawnchair({adapter: 'dom'});

  // MONKEY PATCHING
  Parse.File.prototype.urlOrData = function () {
    return this._url_or_data || this.url();
  };


  function fsErrorHandler(e) {
    var msg = '';
    switch (e.code) {
      case FileError.QUOTA_EXCEEDED_ERR:
        msg = 'QUOTA_EXCEEDED_ERR';
        break;
      case FileError.NOT_FOUND_ERR:
        msg = 'NOT_FOUND_ERR';
        break;
      case FileError.SECURITY_ERR:
        msg = 'SECURITY_ERR';
        break;
      case FileError.INVALID_MODIFICATION_ERR:
        msg = 'INVALID_MODIFICATION_ERR';
        break;
      case FileError.INVALID_STATE_ERR:
        msg = 'INVALID_STATE_ERR';
        break;
      default:
        msg = 'Unknown Error';
        console.log(e);
        break;
    }
    ;
    console.log('Error: ' + msg);
  }


  var LawnchairAdapter = {};

  LawnchairAdapter.Query = function (objectClass) {
    'use strict';

    this._limit = -1;
    this._skip = 0;
    this._extraOptions = {};
    this._order = '';
    this._where = {};
    this._include = [];

    this.objectClass = objectClass;

    if (objectClass === 'User') {
      this.objectClass = '_User';
    }
  };

  Parse._.extend(LawnchairAdapter.Query.prototype, Parse.Query.prototype, {
    equalTo: function (key, value) {
      this._where[key] = Parse._encode(value);
      return this;
    },

    _addCondition: function (key, condition, value) {
      // Check if we already have a condition
      if (!this._where[key]) {
        this._where[key] = {};
      }
      this._where[key][condition] = Parse._encode(value);
      return this;
    },

    notEqualTo: function (key, value) {
      this._addCondition(key, "$ne", value);
      return this;
    },

    lessThan: function (key, value) {
      this._addCondition(key, "$lt", value);
      return this;
    },

    containedIn: function (key, values) {
      this._addCondition(key, "$in", values);
      return this;
    },

    include: function () {
      var self = this;
      Parse._arrayEach(arguments, function (key) {
        if (Parse._.isArray(key)) {
          self._include = self._include.concat(key);
        } else {
          self._include.push(key);
        }
      });
      return this;
    },

    ascending: function (key) {
      this._order = key;
      return this;
    },

    descending: function (key) {
      this._order = "-" + key;
      return this;
    },

    limit: function (n) {
      this._limit = n;
      return this;
    },

    skip: function (n) {
      this._skip = n;
      return this;
    },

    toJSON: function () {
      var params = {
        where: this._where
      };

      if (this._include.length > 0) {
        params.include = this._include.join(",");
      }
      if (this._select) {
        params.keys = this._select.join(",");
      }
      if (this._limit >= 0) {
        params.limit = this._limit;
      }
      if (this._skip > 0) {
        params.skip = this._skip;
      }
      if (this._order !== undefined) {
        params.order = this._order;
      }

      Parse._objectEach(this._extraOptions, function (v, k) {
        params[k] = v;
      });

      return params;
    },

    _orQuery: function (queries) {
      var queryJSON = Parse._.map(queries, function (q) {
        return q.toJSON().where;
      });

      this._where.$or = queryJSON;
      return this;
    },

    count: function (options) {
      var promise = new Parse.Promise();
      this._find(options).then(function (response) {
        promise.resolve(response ? response.length : 0);
        promise._thenRunCallbacks(options);
      });
      return promise;
    },
    find: function (options) {
      return this._find(options)._thenRunCallbacks(options);
    },
    _find: function (options) {
      var promise,
        self = this,
        mappedObjList = [];

      promise = new Parse.Promise(mappedObjList);
        var mapObject = function (obj) {
          // fetching related objects
          Parse._objectEach(obj.attributes, function (v, k) {
            if (Parse._.isObject(v) && !Parse._isNullOrUndefined(v.className)) {
              lchair.get("class_" + v.className, function (result) {
                var data = result.data.filter(function (el) {
                  if (!Parse._isNullOrUndefined(el.offlineId) && !Parse._isNullOrUndefined(v.get('offlineId'))) {
                    return el.offlineId === v.offlineId;
                  } else {
                    return el.objectId === v.id;
                  }
                });
                if (data.length === 1) {
                  obj.set(k, new Parse.Object(data[0]));
                  mapObject(obj.get(k));
                }
              });
            } else {
              if (v instanceof Parse.File) {
                PPO._fetchFileData(v);
              }
            }
          });
        };

        lchair.get("class_" + self.objectClass, function (obj) {
          var i, data = [],
            dataLength = obj && obj.data ? obj.data.length : 0;
          // map data
          for (i = 0; i < dataLength; i += 1) {
            var parseObj = new Parse.Object(obj.data[i]);
            mapObject(parseObj);
            data.push(parseObj);
          }
          var getValue = function (obj, key) {
            if (key === "objectId") {
              key = "id";
            }
            if (Parse._.contains(["id", "objectId", "createdAt", "updatedAt"], key)) {
              return Parse._decode(null, obj[key]);
            } else {
              return Parse._decode(null, obj.get(key));
            }
          };
          if (self._order) {
            data.sort(function (a, b) {
              if (self._order[0] === "-") {
                return getValue(b, self._order.slice(1)) - getValue(a, self._order.slice(1));
              } else {
                return getValue(a, self._order) - getValue(b, self._order);
              }

            })
          }

          for (i = 0; i < dataLength; i += 1) {
            if (self._skip > 0 && mappedObjList.length < self._skip) {
              continue;
            }
            if (self._limit > 0 && mappedObjList.length >= self._limit) {
              break;
            }
            var parseObj = data[i];
            // filtering
            // TODO: implement '$or'
            Parse._objectEach(self._where, function (v, key) {
              if (Parse._.isObject(v)) {
                Parse._objectEach(v, function (val, type) {
                  val = Parse._decode(null, val);
                  if (type === "$exists") {
                    if (Parse._.has(parseObj, type) === !val) {
                      parseObj = null;
                    }
                  }

                  if (type === "$ne") {
                    if (getValue(parseObj, key) == val) parseObj = null;
                  } else if (type === "$lt") {
                    if (getValue(parseObj, key) >= val) parseObj = null;
                  } else if (type === "$gt") {
                    if (getValue(parseObj, key) <= val) parseObj = null;
                  } else if (type === "$lte") {
                    if (getValue(parseObj, key) > val) parseObj = null;
                  } else if (type === "$gte") {
                    if (getValue(parseObj, key) < val) parseObj = null;
                  } else if (type === "$in") {
                    if (Parse._.contains(val, getValue(parseObj, key)) === false) parseObj = null;
                  } else if (type === "$nin") {
                    if (Parse._.contains(val, getValue(parseObj, key)) === true) parseObj = null;
                  }
                });
              } else {
                if (getValue(parseObj, key) != v) parseObj = null;
              }
            });
            if (parseObj !== null) {
              mappedObjList.push(parseObj);
            }
          }
          promise.resolve(mappedObjList);
        });

      return promise;
    },

    get: function (objectId, options) {
      this.equalTo('objectId', objectId);
      return this.first().then(function (response) {
        if (response) {
          return response;
        }

        var errorObject = new Parse.Error(Parse.Error.OBJECT_NOT_FOUND,
          "Object not found.");
        return Parse.Promise.error(errorObject);

      })._thenRunCallbacks(options, null);
    },

    first: function (options) {
      var limit = this._limit, promise;
      this._limit = 1;
      promise = this.find(options).then(function (response) {
        if (response.length > 0) {
          return response[0];
        } else {
          return undefined;
        }
      });
      this._limit = limit;
      return promise;
    },

    save: function () {

    }
  });

  LawnchairAdapter.Query.or = function () {
    var queries = Array.prototype.slice.call(arguments);
    var className = null;
    Parse._arrayEach(queries, function (q) {
      if (Parse._.isNull(className)) {
        className = q.className;
      }

      if (className !== q.className) {
        throw "All queries must be for the same class";
      }
    });
    var query = new (PPO.getQueryClass())(className);
    query._orQuery(queries);
    return query;
  };

  LawnchairAdapter.FileSave = function (options) {
    var self = this;
    if (!self._previousSave) {
      self._previousSave = self._source.then(function (base64, type) {
        var promise = new Parse.Promise();
        if (navigator.webkitPersistentStorage !== undefined) {
          var onInitFs = function (fs) {
            var saveFile = function (fileEntry) {
              fileEntry.createWriter(function (fileWriter) {
                fileWriter.onwriteend = function (e) {
                  console.log("file's been written");
                  self._url = fileEntry.toURL();
                  self._url_or_data = 'data:' + type + ';base64,' + base64;
                  promise.resolve(self);
                };
                fileWriter.onerror = function (e) {
                  console.log('Write failed: ' + e.toString());
                  promise.reject();
                };

                var blob = new Blob([base64], {type: type});
                fileWriter.write(blob);
              }, fsErrorHandler);
            };
            fs.root.getFile(self.name(), {create: true, exclusive: true}, saveFile, function (e) {
              // in case of duplicate file name
              if (e.code === FileError.INVALID_MODIFICATION_ERR) {
                self._previousSave = undefined;
                self._name = self._name + "." + self._name.split('.').pop();
                self.save(options).then(function (obj) {
                  promise.resolve(obj);
                });
              } else {
                fsErrorHandler(e);
                promise.reject();
              }
            });
          };
          navigator.webkitPersistentStorage.requestQuota(base64.length * 3 + 1024 * 1024 * 5, function (grantedBytes) {
            window.webkitRequestFileSystem(PERSISTENT, grantedBytes, onInitFs, fsErrorHandler);
          }, function (e) {
            console.log('Error', e);
          });
        } else {
            var saveFile = function () {
              var promise = new Parse.Promise();
              try {
                lchair.save({key: "file_" + self._name, data: base64}, function () {
                  self._url = "file_" + self._name;
                  self._url_or_data = 'data:' + type + ';base64,' + base64;
                  promise.resolve(self);
                });
              }
              catch (err) {
                if (err.code === 22) {
                  alert("Your webbrowser doesn't allow for storing big-sized images. Please, try upload smaller image.");
                } else {
                  console.error(err);
                }
                promise.reject(err);
              }
              return promise;
            };


            lchair.get("file_" + self._name, function (exist) {
              if (exist) {
                // in case of duplicate file name
                self._previousSave = undefined;
                self._name = self._name + "." + self._name.split('.').pop();
                self.save(options).then(function (obj) {
                  promise.resolve(obj)
                });
              } else {
                saveFile().then(function (obj) {
                  promise.resolve(obj);
                });
              }
            });
        }
        return promise;
      });
    } else {
      console.log("is previous save");
    }
    return self._previousSave._thenRunCallbacks(options);
  };

  LawnchairAdapter.cloudRun = function (fetch, modify, funName) {
    var promise = new Parse.Promise();
    var options = Array.prototype.slice.call(arguments);

    if (modify === true) {
      PPO.pushToChangelog({type: 'cloudRun', name: funName, arguments: Array.prototype.slice.call(arguments).slice(2)});
    }
    if (fetch === true) {
        lchair.get("cloud_" + funName, function (result) {
          promise.resolve(Parse._decode(null, result.data));
        });
    } else {
      promise.resolve();
    }
    return promise._thenRunCallbacks(options[4]);
  };

  LawnchairAdapter.SaveObject = function () {

    var i, attrs, current, options, saved, obj = arguments[0],
      arg1 = arguments[1], arg2 = arguments[2], arg3 = arguments[3];
    if (Parse._.isObject(arg1) || Parse._isNullOrUndefined(arg1)) {
      attrs = arg1;
      options = arg2;
    } else {
      attrs = {};
      attrs[arg1] = arg2;
      options = arg3;
    }
    current = Parse._.clone(obj.attributes);
    var setOptions = Parse._.clone(options) || {};
    obj.set(current, setOptions);
    // TODO: add pinch of uniqueness to offlineId. I have no idea how to do it properly.
    obj.set('offlineId', Parse._.random(999999999999999));
    PPO.pushToChangelog({type: 'object', object: Parse._encode(arguments[0]._toFullJSON()), arguments: [arg1, arg2, arg3]});
    var clonedObj = Parse._.clone(obj);
    var now = new Date();
    clonedObj.set('createdAt', now.toISOString());
    clonedObj.set('updatedAt', now.toISOString());
    var promise = new Parse.Promise.as(obj);
    PPO.saveObjToStorage(clonedObj).then(function () {
      promise._thenRunCallbacks(options);
    });


    return promise;
  };


  var ParseAdapter = {};

  ParseAdapter.Query = function () {
    Parse.Query.apply(this, arguments);
  };

  Parse._.extend(ParseAdapter.Query.prototype, Parse.Query.prototype, {
    /**
     * Override Parse.Query.find
     * @param options
     * @returns {Parse.Promise}
     */
    find: function (options) {
      var self = this;
      var request = Parse._request("classes", this.className, null, "GET",
        this.toJSON());

      return request.then(function (response) {
        var objs_map = Parse._.map(response.results, function (json) {
          var obj;
          if (response.className) {
            obj = new Parse.Object(response.className);
          } else {
            obj = new self.objectClass();
          }
          obj._finishFetch(json, true);
          return obj;
        });

        /**
         * Check if objects with the same id already exist in storage and remove them.
         */
        var objToSave = [];
        objs_map.forEach(function (obj) {
          Parse._objectEach(obj.attributes, function (v, k) {
            if (v instanceof Parse.Object) {
              objToSave.push(v);
            }
          });
          objToSave.push(obj);
        });
        var save = function (obj) {
          PPO.saveObjToStorage(obj).then(function () {
            if (objToSave.length > 0)
              save(objToSave.pop());
          });
        };
        if (objToSave.length > 0)
          save(objToSave.pop());
        return objs_map;
      })._thenRunCallbacks(options);
    }
  });

  ParseAdapter.Query.or = Parse.Query.or;

  ParseAdapter.cloudRun = function (fetch, modify, funName) {
    return Parse.Cloud.run.apply(this, Array.prototype.slice.call(arguments).slice(2)).then(function (result) {
      if (fetch === true) {
          lchair.save({key: "cloud_" + funName, data: Parse._encode(result, [])});

      }
    });
  };

  ParseAdapter.SaveObject = function () {
    var args = Array.prototype.slice.call(arguments);
    var obj = args[0];
    return obj.save.apply(obj, args.slice(1)).then(function (obj) {
      PPO.saveObjToStorage(obj);
    });
  };

  PPO.isOnline = function () {
    'use strict';
    // FOR TESTING PURPOSE ONLY
    //
//    return false;
    return navigator.onLine;
  };

  PPO.pushToChangelog = function (delta) {
      lchair.get("changelog", function (result) {
        result = result || {};
        var changelog = result.data || [];
        changelog.push({time: new Date().getTime(),
          delta: delta,
          counter: 0
        });
        lchair.save({key: "changelog", data: changelog});
      });
  };

  PPO.synchronize = function () {
    var promise = new Parse.Promise();
    if (PPO._synchronizing === true) {
      promise.resolve();
      return promise;
    }

    PPO._synchronizing = true;
      var synchronizeFile = function (value) {
        var promise = new Parse.Promise();
        var saveToParse = function (content) {
          var fileObj = new Parse.File(value.name, {base64: content});
          return fileObj.save().then(function () {
            promise.resolve(fileObj);
          }, function () {
            promise.reject();
          });
        };
        if (navigator.webkitPersistentStorage !== undefined) {
          var onInitFs = function (fs) {
            fs.root.getFile(value.name, {}, function (fileEntry) {
              fileEntry.file(function (file) {
                var reader = new FileReader();
                reader.onloadend = function (e) {
                  saveToParse(this.result);
                };
                reader.readAsBinaryString(file);
              }, fsErrorHandler);
            }, fsErrorHandler);
          };
          window.webkitRequestFileSystem(PERSISTENT, 55 * 1024 * 1024, onInitFs, fsErrorHandler);
        } else {
            lchair.get("file_" + value.name, function (file) {
              if (file) {
                saveToParse(file.data).then(function () {
                  lchair.remove("file_" + value.name);
                });
              } else {
                console.error("there is no file " + value.name + " in storage");
                promise.reject();
              }

            });
        }
        return promise;
      };
      var executeNextTask = function () {

        lchair.get("changelog", function (result) {
          result = result || {};
          var changelog = result.data || [];
          if (changelog.length === 0) {
            promise.resolve();
            PPO._synchronizing = false;
            return;
          }
          var task = changelog[0].delta;
          setTimeout(function () {
            console.log("executing ", task);
            if (task.type === 'cloudRun') {
              Parse.Cloud.run(task.name, task.arguments).then(function () {
                lchair.save({key: "changelog", data: changelog.slice(1)}, executeNextTask);
              }, function () {
                console.error("error in task " + task.name);
                // put current task at the end
                var el = changelog[0];
                el.counter = el.counter + 1;
                lchair.save({key: "changelog", data: changelog.slice(1).concat([el])}, executeNextTask);
              });
            } else if (task.type === 'object') {
              args = Array.prototype.slice.call(arguments);
              var taskObject = Parse._.clone(task.object);
              var obj = Parse.Object._create(taskObject.className);
              delete taskObject['className'];
              delete taskObject['__type'];
              delete taskObject['ACL'];
              var promises = [];
              Parse._.each(taskObject, function (value, attr) {
                if (Parse._.isObject(value) && value.__type === "File") {
                  var promise = synchronizeFile(value).then(null, function () {
                    console.log("error during saving object ", obj);
                    var el = changelog[0];
                    el.counter = el.counter + 1;
                    lchair.save({key: "changelog", data: changelog.slice(1).concat([el])}, executeNextTask);

                  });
                  promises.push(promise);
                  promise.then(function (result) {
                    obj.set(attr, result);
                  });
                } else {
                  obj.set(attr, value);
                }
              });
              Parse.Promise.when(promises).then(function () {
                obj.save.apply(obj, args.slice(1)).then(function () {
                  lchair.save({key: "changelog", data: changelog.slice(1)}, executeNextTask);
                }, function () {
                  console.log("error during saving object ", obj);
                  lchair.save({key: "changelog", data: changelog.slice(1).concat([changelog[0]])}, executeNextTask);
                });
              });
            }
          }, changelog[0].counter * 100);
        });
      };
      executeNextTask();
    return promise;
  };

  PPO.saveObjToStorage = function (objToUpdate) {
    var promise = new Parse.Promise();
        className = objToUpdate.className;
      lchair.get("class_" + className, function (currentData) {
        var currentList = [];
        if (currentData) {
          currentList = currentData.data;
          currentList = currentList.filter(function (currObj) {
            if (!Parse._isNullOrUndefined(currObj.offlineId) && !Parse._isNullOrUndefined(objToUpdate.attributes['offlineId'])) {
              return currObj.offlineId !== objToUpdate.attributes['offlineId'];
            } else {
              return currObj.objectId !== objToUpdate.id;
            }
          });
          currentList.push(objToUpdate);
        }
        lchair.save({key: "class_" + className, data: currentList}, function () {
          promise.resolve();
        });
      });
    return promise;
  };

  PPO._fetchFileData = function (fileObj) {
    if (navigator.webkitPersistentStorage !== undefined) {
      var onInitFs = function (fs) {
        fs.root.getFile(fileObj._name, {}, function (fileEntry) {
          fileEntry.file(function (file) {
            var reader = new FileReader();
            reader.onloadend = function (e) {
              fileObj._url_or_data = 'data:image/jpeg;base64,' + this.result;
            };
            reader.readAsBinaryString(file);
          }, fsErrorHandler);

        }, fsErrorHandler);
      };
      window.webkitRequestFileSystem(PERSISTENT, 55 * 1024 * 1024, onInitFs, fsErrorHandler);
    } else {
        lchair.get("file_" + fileObj._name, function (file) {
          if (file)
            fileObj._url_or_data = 'data:image/jpeg;base64,' + file.data;
        });
    }
  }

  root.OnlineAdapter = ParseAdapter;
  root.OfflineAdapter = LawnchairAdapter;

  PPO.getQueryClass = function () {
    if (PPO.isOnline()) {
      return root.OnlineAdapter.Query;
    } else {
      return root.OfflineAdapter.Query;
    }
  };
  PPO.File = function (arg1, arg2, arg3) {
    if (PPO.isOnline()) {
      return new Parse.File(arg1, arg2, arg3);
    } else {
      var obj = new Parse.File(arg1, arg2, arg3);
      obj.save = root.OfflineAdapter.FileSave;
      return obj;
    }
  };

  /**
   * Use SaveObject to save object to Parse without concerning about data consistency. It works like Parse.Object.save and returs Parse.Promise.
   * There is no possibility to create something like PPO.Object.save and use it in obj.save() schema.
   *
   * @param obj is instance of Parse.Object to save
   * @returns Parse.Promise
   */
  PPO.SaveObject = function () {
    if (PPO.isOnline()) {
      return root.OnlineAdapter.SaveObject.apply(this, arguments);
    } else {
      return root.OfflineAdapter.SaveObject.apply(this, arguments);
    }
  };

  /**
   * It's simple replacement for Parse.Cloud.run, but in offline mode it DOES NOT save to changelog, so when the connection will be restored, the function won't be executed.
   * When you execute this method in offline mode, you will get cached data.
   * If you want different behavior see: PPO.RunModifyCloud
   */
  PPO.RunFetchCloud = function () {
    if (PPO.isOnline()) {
      return root.OnlineAdapter.cloudRun.apply(this, [true, false].concat(Array.prototype.slice.call(arguments)));
    } else {
      return root.OfflineAdapter.cloudRun.apply(this, [true, false].concat(Array.prototype.slice.call(arguments)));
    }
  };

  /**
   * It's simple replacement for Parse.Cloud.run.
   * In offline mode it saves to changelog, so when the connection will be restored, the function will be executed.
   * Remember that in offline mode you won't receive any data. To obtain cached data see: PPO.RunFetchCloud
   */
  PPO.RunModifyCloud = function () {
    if (PPO.isOnline()) {
      return root.OnlineAdapter.cloudRun.apply(this, [false, true].concat(Array.prototype.slice.call(arguments)));
    } else {
      return root.OfflineAdapter.cloudRun.apply(this, [false, true].concat(Array.prototype.slice.call(arguments)));
    }
  };

  /**
   * It's simple replacement for Parse.Cloud.run.
   * In offline mode it either saves to changelog or returns cached data.
   * It combines behavior of PPO.RunFetchCloud and PPO.RunModifyCloud
   */
  PPO.RunFetchAndModifyCloud = function () {
    if (PPO.isOnline()) {
      return root.OnlineAdapter.cloudRun.apply(this, [true, true].concat(Array.prototype.slice.call(arguments)));
    } else {
      return root.OfflineAdapter.cloudRun.apply(this, [true, true].concat(Array.prototype.slice.call(arguments)));
    }
  };

}(this));