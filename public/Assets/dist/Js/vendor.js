/**
 * @license AngularJS v1.5.8
 * (c) 2010-2016 Google, Inc. http://angularjs.org
 * License: MIT
 */
(function(window, angular) {'use strict';

/* global shallowCopy: true */

/**
 * Creates a shallow copy of an object, an array or a primitive.
 *
 * Assumes that there are no proto properties for objects.
 */
function shallowCopy(src, dst) {
  if (isArray(src)) {
    dst = dst || [];

    for (var i = 0, ii = src.length; i < ii; i++) {
      dst[i] = src[i];
    }
  } else if (isObject(src)) {
    dst = dst || {};

    for (var key in src) {
      if (!(key.charAt(0) === '$' && key.charAt(1) === '$')) {
        dst[key] = src[key];
      }
    }
  }

  return dst || src;
}

/* global shallowCopy: false */

// There are necessary for `shallowCopy()` (included via `src/shallowCopy.js`).
// They are initialized inside the `$RouteProvider`, to ensure `window.angular` is available.
var isArray;
var isObject;

/**
 * @ngdoc module
 * @name ngRoute
 * @description
 *
 * # ngRoute
 *
 * The `ngRoute` module provides routing and deeplinking services and directives for angular apps.
 *
 * ## Example
 * See {@link ngRoute.$route#example $route} for an example of configuring and using `ngRoute`.
 *
 *
 * <div doc-module-components="ngRoute"></div>
 */
 /* global -ngRouteModule */
var ngRouteModule = angular.module('ngRoute', ['ng']).
                        provider('$route', $RouteProvider),
    $routeMinErr = angular.$$minErr('ngRoute');

/**
 * @ngdoc provider
 * @name $routeProvider
 *
 * @description
 *
 * Used for configuring routes.
 *
 * ## Example
 * See {@link ngRoute.$route#example $route} for an example of configuring and using `ngRoute`.
 *
 * ## Dependencies
 * Requires the {@link ngRoute `ngRoute`} module to be installed.
 */
function $RouteProvider() {
  isArray = angular.isArray;
  isObject = angular.isObject;

  function inherit(parent, extra) {
    return angular.extend(Object.create(parent), extra);
  }

  var routes = {};

  /**
   * @ngdoc method
   * @name $routeProvider#when
   *
   * @param {string} path Route path (matched against `$location.path`). If `$location.path`
   *    contains redundant trailing slash or is missing one, the route will still match and the
   *    `$location.path` will be updated to add or drop the trailing slash to exactly match the
   *    route definition.
   *
   *    * `path` can contain named groups starting with a colon: e.g. `:name`. All characters up
   *        to the next slash are matched and stored in `$routeParams` under the given `name`
   *        when the route matches.
   *    * `path` can contain named groups starting with a colon and ending with a star:
   *        e.g.`:name*`. All characters are eagerly stored in `$routeParams` under the given `name`
   *        when the route matches.
   *    * `path` can contain optional named groups with a question mark: e.g.`:name?`.
   *
   *    For example, routes like `/color/:color/largecode/:largecode*\/edit` will match
   *    `/color/brown/largecode/code/with/slashes/edit` and extract:
   *
   *    * `color: brown`
   *    * `largecode: code/with/slashes`.
   *
   *
   * @param {Object} route Mapping information to be assigned to `$route.current` on route
   *    match.
   *
   *    Object properties:
   *
   *    - `controller` – `{(string|function()=}` – Controller fn that should be associated with
   *      newly created scope or the name of a {@link angular.Module#controller registered
   *      controller} if passed as a string.
   *    - `controllerAs` – `{string=}` – An identifier name for a reference to the controller.
   *      If present, the controller will be published to scope under the `controllerAs` name.
   *    - `template` – `{string=|function()=}` – html template as a string or a function that
   *      returns an html template as a string which should be used by {@link
   *      ngRoute.directive:ngView ngView} or {@link ng.directive:ngInclude ngInclude} directives.
   *      This property takes precedence over `templateUrl`.
   *
   *      If `template` is a function, it will be called with the following parameters:
   *
   *      - `{Array.<Object>}` - route parameters extracted from the current
   *        `$location.path()` by applying the current route
   *
   *    - `templateUrl` – `{string=|function()=}` – path or function that returns a path to an html
   *      template that should be used by {@link ngRoute.directive:ngView ngView}.
   *
   *      If `templateUrl` is a function, it will be called with the following parameters:
   *
   *      - `{Array.<Object>}` - route parameters extracted from the current
   *        `$location.path()` by applying the current route
   *
   *    - `resolve` - `{Object.<string, function>=}` - An optional map of dependencies which should
   *      be injected into the controller. If any of these dependencies are promises, the router
   *      will wait for them all to be resolved or one to be rejected before the controller is
   *      instantiated.
   *      If all the promises are resolved successfully, the values of the resolved promises are
   *      injected and {@link ngRoute.$route#$routeChangeSuccess $routeChangeSuccess} event is
   *      fired. If any of the promises are rejected the
   *      {@link ngRoute.$route#$routeChangeError $routeChangeError} event is fired.
   *      For easier access to the resolved dependencies from the template, the `resolve` map will
   *      be available on the scope of the route, under `$resolve` (by default) or a custom name
   *      specified by the `resolveAs` property (see below). This can be particularly useful, when
   *      working with {@link angular.Module#component components} as route templates.<br />
   *      <div class="alert alert-warning">
   *        **Note:** If your scope already contains a property with this name, it will be hidden
   *        or overwritten. Make sure, you specify an appropriate name for this property, that
   *        does not collide with other properties on the scope.
   *      </div>
   *      The map object is:
   *
   *      - `key` – `{string}`: a name of a dependency to be injected into the controller.
   *      - `factory` - `{string|function}`: If `string` then it is an alias for a service.
   *        Otherwise if function, then it is {@link auto.$injector#invoke injected}
   *        and the return value is treated as the dependency. If the result is a promise, it is
   *        resolved before its value is injected into the controller. Be aware that
   *        `ngRoute.$routeParams` will still refer to the previous route within these resolve
   *        functions.  Use `$route.current.params` to access the new route parameters, instead.
   *
   *    - `resolveAs` - `{string=}` - The name under which the `resolve` map will be available on
   *      the scope of the route. If omitted, defaults to `$resolve`.
   *
   *    - `redirectTo` – `{(string|function())=}` – value to update
   *      {@link ng.$location $location} path with and trigger route redirection.
   *
   *      If `redirectTo` is a function, it will be called with the following parameters:
   *
   *      - `{Object.<string>}` - route parameters extracted from the current
   *        `$location.path()` by applying the current route templateUrl.
   *      - `{string}` - current `$location.path()`
   *      - `{Object}` - current `$location.search()`
   *
   *      The custom `redirectTo` function is expected to return a string which will be used
   *      to update `$location.path()` and `$location.search()`.
   *
   *    - `[reloadOnSearch=true]` - `{boolean=}` - reload route when only `$location.search()`
   *      or `$location.hash()` changes.
   *
   *      If the option is set to `false` and url in the browser changes, then
   *      `$routeUpdate` event is broadcasted on the root scope.
   *
   *    - `[caseInsensitiveMatch=false]` - `{boolean=}` - match routes without being case sensitive
   *
   *      If the option is set to `true`, then the particular route can be matched without being
   *      case sensitive
   *
   * @returns {Object} self
   *
   * @description
   * Adds a new route definition to the `$route` service.
   */
  this.when = function(path, route) {
    //copy original route object to preserve params inherited from proto chain
    var routeCopy = shallowCopy(route);
    if (angular.isUndefined(routeCopy.reloadOnSearch)) {
      routeCopy.reloadOnSearch = true;
    }
    if (angular.isUndefined(routeCopy.caseInsensitiveMatch)) {
      routeCopy.caseInsensitiveMatch = this.caseInsensitiveMatch;
    }
    routes[path] = angular.extend(
      routeCopy,
      path && pathRegExp(path, routeCopy)
    );

    // create redirection for trailing slashes
    if (path) {
      var redirectPath = (path[path.length - 1] == '/')
            ? path.substr(0, path.length - 1)
            : path + '/';

      routes[redirectPath] = angular.extend(
        {redirectTo: path},
        pathRegExp(redirectPath, routeCopy)
      );
    }

    return this;
  };

  /**
   * @ngdoc property
   * @name $routeProvider#caseInsensitiveMatch
   * @description
   *
   * A boolean property indicating if routes defined
   * using this provider should be matched using a case insensitive
   * algorithm. Defaults to `false`.
   */
  this.caseInsensitiveMatch = false;

   /**
    * @param path {string} path
    * @param opts {Object} options
    * @return {?Object}
    *
    * @description
    * Normalizes the given path, returning a regular expression
    * and the original path.
    *
    * Inspired by pathRexp in visionmedia/express/lib/utils.js.
    */
  function pathRegExp(path, opts) {
    var insensitive = opts.caseInsensitiveMatch,
        ret = {
          originalPath: path,
          regexp: path
        },
        keys = ret.keys = [];

    path = path
      .replace(/([().])/g, '\\$1')
      .replace(/(\/)?:(\w+)(\*\?|[\?\*])?/g, function(_, slash, key, option) {
        var optional = (option === '?' || option === '*?') ? '?' : null;
        var star = (option === '*' || option === '*?') ? '*' : null;
        keys.push({ name: key, optional: !!optional });
        slash = slash || '';
        return ''
          + (optional ? '' : slash)
          + '(?:'
          + (optional ? slash : '')
          + (star && '(.+?)' || '([^/]+)')
          + (optional || '')
          + ')'
          + (optional || '');
      })
      .replace(/([\/$\*])/g, '\\$1');

    ret.regexp = new RegExp('^' + path + '$', insensitive ? 'i' : '');
    return ret;
  }

  /**
   * @ngdoc method
   * @name $routeProvider#otherwise
   *
   * @description
   * Sets route definition that will be used on route change when no other route definition
   * is matched.
   *
   * @param {Object|string} params Mapping information to be assigned to `$route.current`.
   * If called with a string, the value maps to `redirectTo`.
   * @returns {Object} self
   */
  this.otherwise = function(params) {
    if (typeof params === 'string') {
      params = {redirectTo: params};
    }
    this.when(null, params);
    return this;
  };


  this.$get = ['$rootScope',
               '$location',
               '$routeParams',
               '$q',
               '$injector',
               '$templateRequest',
               '$sce',
      function($rootScope, $location, $routeParams, $q, $injector, $templateRequest, $sce) {

    /**
     * @ngdoc service
     * @name $route
     * @requires $location
     * @requires $routeParams
     *
     * @property {Object} current Reference to the current route definition.
     * The route definition contains:
     *
     *   - `controller`: The controller constructor as defined in the route definition.
     *   - `locals`: A map of locals which is used by {@link ng.$controller $controller} service for
     *     controller instantiation. The `locals` contain
     *     the resolved values of the `resolve` map. Additionally the `locals` also contain:
     *
     *     - `$scope` - The current route scope.
     *     - `$template` - The current route template HTML.
     *
     *     The `locals` will be assigned to the route scope's `$resolve` property. You can override
     *     the property name, using `resolveAs` in the route definition. See
     *     {@link ngRoute.$routeProvider $routeProvider} for more info.
     *
     * @property {Object} routes Object with all route configuration Objects as its properties.
     *
     * @description
     * `$route` is used for deep-linking URLs to controllers and views (HTML partials).
     * It watches `$location.url()` and tries to map the path to an existing route definition.
     *
     * Requires the {@link ngRoute `ngRoute`} module to be installed.
     *
     * You can define routes through {@link ngRoute.$routeProvider $routeProvider}'s API.
     *
     * The `$route` service is typically used in conjunction with the
     * {@link ngRoute.directive:ngView `ngView`} directive and the
     * {@link ngRoute.$routeParams `$routeParams`} service.
     *
     * @example
     * This example shows how changing the URL hash causes the `$route` to match a route against the
     * URL, and the `ngView` pulls in the partial.
     *
     * <example name="$route-service" module="ngRouteExample"
     *          deps="angular-route.js" fixBase="true">
     *   <file name="index.html">
     *     <div ng-controller="MainController">
     *       Choose:
     *       <a href="Book/Moby">Moby</a> |
     *       <a href="Book/Moby/ch/1">Moby: Ch1</a> |
     *       <a href="Book/Gatsby">Gatsby</a> |
     *       <a href="Book/Gatsby/ch/4?key=value">Gatsby: Ch4</a> |
     *       <a href="Book/Scarlet">Scarlet Letter</a><br/>
     *
     *       <div ng-view></div>
     *
     *       <hr />
     *
     *       <pre>$location.path() = {{$location.path()}}</pre>
     *       <pre>$route.current.templateUrl = {{$route.current.templateUrl}}</pre>
     *       <pre>$route.current.params = {{$route.current.params}}</pre>
     *       <pre>$route.current.scope.name = {{$route.current.scope.name}}</pre>
     *       <pre>$routeParams = {{$routeParams}}</pre>
     *     </div>
     *   </file>
     *
     *   <file name="book.html">
     *     controller: {{name}}<br />
     *     Book Id: {{params.bookId}}<br />
     *   </file>
     *
     *   <file name="chapter.html">
     *     controller: {{name}}<br />
     *     Book Id: {{params.bookId}}<br />
     *     Chapter Id: {{params.chapterId}}
     *   </file>
     *
     *   <file name="script.js">
     *     angular.module('ngRouteExample', ['ngRoute'])
     *
     *      .controller('MainController', function($scope, $route, $routeParams, $location) {
     *          $scope.$route = $route;
     *          $scope.$location = $location;
     *          $scope.$routeParams = $routeParams;
     *      })
     *
     *      .controller('BookController', function($scope, $routeParams) {
     *          $scope.name = "BookController";
     *          $scope.params = $routeParams;
     *      })
     *
     *      .controller('ChapterController', function($scope, $routeParams) {
     *          $scope.name = "ChapterController";
     *          $scope.params = $routeParams;
     *      })
     *
     *     .config(function($routeProvider, $locationProvider) {
     *       $routeProvider
     *        .when('/Book/:bookId', {
     *         templateUrl: 'book.html',
     *         controller: 'BookController',
     *         resolve: {
     *           // I will cause a 1 second delay
     *           delay: function($q, $timeout) {
     *             var delay = $q.defer();
     *             $timeout(delay.resolve, 1000);
     *             return delay.promise;
     *           }
     *         }
     *       })
     *       .when('/Book/:bookId/ch/:chapterId', {
     *         templateUrl: 'chapter.html',
     *         controller: 'ChapterController'
     *       });
     *
     *       // configure html5 to get links working on jsfiddle
     *       $locationProvider.html5Mode(true);
     *     });
     *
     *   </file>
     *
     *   <file name="protractor.js" type="protractor">
     *     it('should load and compile correct template', function() {
     *       element(by.linkText('Moby: Ch1')).click();
     *       var content = element(by.css('[ng-view]')).getText();
     *       expect(content).toMatch(/controller\: ChapterController/);
     *       expect(content).toMatch(/Book Id\: Moby/);
     *       expect(content).toMatch(/Chapter Id\: 1/);
     *
     *       element(by.partialLinkText('Scarlet')).click();
     *
     *       content = element(by.css('[ng-view]')).getText();
     *       expect(content).toMatch(/controller\: BookController/);
     *       expect(content).toMatch(/Book Id\: Scarlet/);
     *     });
     *   </file>
     * </example>
     */

    /**
     * @ngdoc event
     * @name $route#$routeChangeStart
     * @eventType broadcast on root scope
     * @description
     * Broadcasted before a route change. At this  point the route services starts
     * resolving all of the dependencies needed for the route change to occur.
     * Typically this involves fetching the view template as well as any dependencies
     * defined in `resolve` route property. Once  all of the dependencies are resolved
     * `$routeChangeSuccess` is fired.
     *
     * The route change (and the `$location` change that triggered it) can be prevented
     * by calling `preventDefault` method of the event. See {@link ng.$rootScope.Scope#$on}
     * for more details about event object.
     *
     * @param {Object} angularEvent Synthetic event object.
     * @param {Route} next Future route information.
     * @param {Route} current Current route information.
     */

    /**
     * @ngdoc event
     * @name $route#$routeChangeSuccess
     * @eventType broadcast on root scope
     * @description
     * Broadcasted after a route change has happened successfully.
     * The `resolve` dependencies are now available in the `current.locals` property.
     *
     * {@link ngRoute.directive:ngView ngView} listens for the directive
     * to instantiate the controller and render the view.
     *
     * @param {Object} angularEvent Synthetic event object.
     * @param {Route} current Current route information.
     * @param {Route|Undefined} previous Previous route information, or undefined if current is
     * first route entered.
     */

    /**
     * @ngdoc event
     * @name $route#$routeChangeError
     * @eventType broadcast on root scope
     * @description
     * Broadcasted if any of the resolve promises are rejected.
     *
     * @param {Object} angularEvent Synthetic event object
     * @param {Route} current Current route information.
     * @param {Route} previous Previous route information.
     * @param {Route} rejection Rejection of the promise. Usually the error of the failed promise.
     */

    /**
     * @ngdoc event
     * @name $route#$routeUpdate
     * @eventType broadcast on root scope
     * @description
     * The `reloadOnSearch` property has been set to false, and we are reusing the same
     * instance of the Controller.
     *
     * @param {Object} angularEvent Synthetic event object
     * @param {Route} current Current/previous route information.
     */

    var forceReload = false,
        preparedRoute,
        preparedRouteIsUpdateOnly,
        $route = {
          routes: routes,

          /**
           * @ngdoc method
           * @name $route#reload
           *
           * @description
           * Causes `$route` service to reload the current route even if
           * {@link ng.$location $location} hasn't changed.
           *
           * As a result of that, {@link ngRoute.directive:ngView ngView}
           * creates new scope and reinstantiates the controller.
           */
          reload: function() {
            forceReload = true;

            var fakeLocationEvent = {
              defaultPrevented: false,
              preventDefault: function fakePreventDefault() {
                this.defaultPrevented = true;
                forceReload = false;
              }
            };

            $rootScope.$evalAsync(function() {
              prepareRoute(fakeLocationEvent);
              if (!fakeLocationEvent.defaultPrevented) commitRoute();
            });
          },

          /**
           * @ngdoc method
           * @name $route#updateParams
           *
           * @description
           * Causes `$route` service to update the current URL, replacing
           * current route parameters with those specified in `newParams`.
           * Provided property names that match the route's path segment
           * definitions will be interpolated into the location's path, while
           * remaining properties will be treated as query params.
           *
           * @param {!Object<string, string>} newParams mapping of URL parameter names to values
           */
          updateParams: function(newParams) {
            if (this.current && this.current.$$route) {
              newParams = angular.extend({}, this.current.params, newParams);
              $location.path(interpolate(this.current.$$route.originalPath, newParams));
              // interpolate modifies newParams, only query params are left
              $location.search(newParams);
            } else {
              throw $routeMinErr('norout', 'Tried updating route when with no current route');
            }
          }
        };

    $rootScope.$on('$locationChangeStart', prepareRoute);
    $rootScope.$on('$locationChangeSuccess', commitRoute);

    return $route;

    /////////////////////////////////////////////////////

    /**
     * @param on {string} current url
     * @param route {Object} route regexp to match the url against
     * @return {?Object}
     *
     * @description
     * Check if the route matches the current url.
     *
     * Inspired by match in
     * visionmedia/express/lib/router/router.js.
     */
    function switchRouteMatcher(on, route) {
      var keys = route.keys,
          params = {};

      if (!route.regexp) return null;

      var m = route.regexp.exec(on);
      if (!m) return null;

      for (var i = 1, len = m.length; i < len; ++i) {
        var key = keys[i - 1];

        var val = m[i];

        if (key && val) {
          params[key.name] = val;
        }
      }
      return params;
    }

    function prepareRoute($locationEvent) {
      var lastRoute = $route.current;

      preparedRoute = parseRoute();
      preparedRouteIsUpdateOnly = preparedRoute && lastRoute && preparedRoute.$$route === lastRoute.$$route
          && angular.equals(preparedRoute.pathParams, lastRoute.pathParams)
          && !preparedRoute.reloadOnSearch && !forceReload;

      if (!preparedRouteIsUpdateOnly && (lastRoute || preparedRoute)) {
        if ($rootScope.$broadcast('$routeChangeStart', preparedRoute, lastRoute).defaultPrevented) {
          if ($locationEvent) {
            $locationEvent.preventDefault();
          }
        }
      }
    }

    function commitRoute() {
      var lastRoute = $route.current;
      var nextRoute = preparedRoute;

      if (preparedRouteIsUpdateOnly) {
        lastRoute.params = nextRoute.params;
        angular.copy(lastRoute.params, $routeParams);
        $rootScope.$broadcast('$routeUpdate', lastRoute);
      } else if (nextRoute || lastRoute) {
        forceReload = false;
        $route.current = nextRoute;
        if (nextRoute) {
          if (nextRoute.redirectTo) {
            if (angular.isString(nextRoute.redirectTo)) {
              $location.path(interpolate(nextRoute.redirectTo, nextRoute.params)).search(nextRoute.params)
                       .replace();
            } else {
              $location.url(nextRoute.redirectTo(nextRoute.pathParams, $location.path(), $location.search()))
                       .replace();
            }
          }
        }

        $q.when(nextRoute).
          then(resolveLocals).
          then(function(locals) {
            // after route change
            if (nextRoute == $route.current) {
              if (nextRoute) {
                nextRoute.locals = locals;
                angular.copy(nextRoute.params, $routeParams);
              }
              $rootScope.$broadcast('$routeChangeSuccess', nextRoute, lastRoute);
            }
          }, function(error) {
            if (nextRoute == $route.current) {
              $rootScope.$broadcast('$routeChangeError', nextRoute, lastRoute, error);
            }
          });
      }
    }

    function resolveLocals(route) {
      if (route) {
        var locals = angular.extend({}, route.resolve);
        angular.forEach(locals, function(value, key) {
          locals[key] = angular.isString(value) ?
              $injector.get(value) :
              $injector.invoke(value, null, null, key);
        });
        var template = getTemplateFor(route);
        if (angular.isDefined(template)) {
          locals['$template'] = template;
        }
        return $q.all(locals);
      }
    }


    function getTemplateFor(route) {
      var template, templateUrl;
      if (angular.isDefined(template = route.template)) {
        if (angular.isFunction(template)) {
          template = template(route.params);
        }
      } else if (angular.isDefined(templateUrl = route.templateUrl)) {
        if (angular.isFunction(templateUrl)) {
          templateUrl = templateUrl(route.params);
        }
        if (angular.isDefined(templateUrl)) {
          route.loadedTemplateUrl = $sce.valueOf(templateUrl);
          template = $templateRequest(templateUrl);
        }
      }
      return template;
    }


    /**
     * @returns {Object} the current active route, by matching it against the URL
     */
    function parseRoute() {
      // Match a route
      var params, match;
      angular.forEach(routes, function(route, path) {
        if (!match && (params = switchRouteMatcher($location.path(), route))) {
          match = inherit(route, {
            params: angular.extend({}, $location.search(), params),
            pathParams: params});
          match.$$route = route;
        }
      });
      // No route matched; fallback to "otherwise" route
      return match || routes[null] && inherit(routes[null], {params: {}, pathParams:{}});
    }

    /**
     * @returns {string} interpolation of the redirect path with the parameters
     */
    function interpolate(string, params) {
      var result = [];
      angular.forEach((string || '').split(':'), function(segment, i) {
        if (i === 0) {
          result.push(segment);
        } else {
          var segmentMatch = segment.match(/(\w+)(?:[?*])?(.*)/);
          var key = segmentMatch[1];
          result.push(params[key]);
          result.push(segmentMatch[2] || '');
          delete params[key];
        }
      });
      return result.join('');
    }
  }];
}

ngRouteModule.provider('$routeParams', $RouteParamsProvider);


/**
 * @ngdoc service
 * @name $routeParams
 * @requires $route
 *
 * @description
 * The `$routeParams` service allows you to retrieve the current set of route parameters.
 *
 * Requires the {@link ngRoute `ngRoute`} module to be installed.
 *
 * The route parameters are a combination of {@link ng.$location `$location`}'s
 * {@link ng.$location#search `search()`} and {@link ng.$location#path `path()`}.
 * The `path` parameters are extracted when the {@link ngRoute.$route `$route`} path is matched.
 *
 * In case of parameter name collision, `path` params take precedence over `search` params.
 *
 * The service guarantees that the identity of the `$routeParams` object will remain unchanged
 * (but its properties will likely change) even when a route change occurs.
 *
 * Note that the `$routeParams` are only updated *after* a route change completes successfully.
 * This means that you cannot rely on `$routeParams` being correct in route resolve functions.
 * Instead you can use `$route.current.params` to access the new route's parameters.
 *
 * @example
 * ```js
 *  // Given:
 *  // URL: http://server.com/index.html#/Chapter/1/Section/2?search=moby
 *  // Route: /Chapter/:chapterId/Section/:sectionId
 *  //
 *  // Then
 *  $routeParams ==> {chapterId:'1', sectionId:'2', search:'moby'}
 * ```
 */
function $RouteParamsProvider() {
  this.$get = function() { return {}; };
}

ngRouteModule.directive('ngView', ngViewFactory);
ngRouteModule.directive('ngView', ngViewFillContentFactory);


/**
 * @ngdoc directive
 * @name ngView
 * @restrict ECA
 *
 * @description
 * # Overview
 * `ngView` is a directive that complements the {@link ngRoute.$route $route} service by
 * including the rendered template of the current route into the main layout (`index.html`) file.
 * Every time the current route changes, the included view changes with it according to the
 * configuration of the `$route` service.
 *
 * Requires the {@link ngRoute `ngRoute`} module to be installed.
 *
 * @animations
 * | Animation                        | Occurs                              |
 * |----------------------------------|-------------------------------------|
 * | {@link ng.$animate#enter enter}  | when the new element is inserted to the DOM |
 * | {@link ng.$animate#leave leave}  | when the old element is removed from to the DOM  |
 *
 * The enter and leave animation occur concurrently.
 *
 * @knownIssue If `ngView` is contained in an asynchronously loaded template (e.g. in another
 *             directive's templateUrl or in a template loaded using `ngInclude`), then you need to
 *             make sure that `$route` is instantiated in time to capture the initial
 *             `$locationChangeStart` event and load the appropriate view. One way to achieve this
 *             is to have it as a dependency in a `.run` block:
 *             `myModule.run(['$route', function() {}]);`
 *
 * @scope
 * @priority 400
 * @param {string=} onload Expression to evaluate whenever the view updates.
 *
 * @param {string=} autoscroll Whether `ngView` should call {@link ng.$anchorScroll
 *                  $anchorScroll} to scroll the viewport after the view is updated.
 *
 *                  - If the attribute is not set, disable scrolling.
 *                  - If the attribute is set without value, enable scrolling.
 *                  - Otherwise enable scrolling only if the `autoscroll` attribute value evaluated
 *                    as an expression yields a truthy value.
 * @example
    <example name="ngView-directive" module="ngViewExample"
             deps="angular-route.js;angular-animate.js"
             animations="true" fixBase="true">
      <file name="index.html">
        <div ng-controller="MainCtrl as main">
          Choose:
          <a href="Book/Moby">Moby</a> |
          <a href="Book/Moby/ch/1">Moby: Ch1</a> |
          <a href="Book/Gatsby">Gatsby</a> |
          <a href="Book/Gatsby/ch/4?key=value">Gatsby: Ch4</a> |
          <a href="Book/Scarlet">Scarlet Letter</a><br/>

          <div class="view-animate-container">
            <div ng-view class="view-animate"></div>
          </div>
          <hr />

          <pre>$location.path() = {{main.$location.path()}}</pre>
          <pre>$route.current.templateUrl = {{main.$route.current.templateUrl}}</pre>
          <pre>$route.current.params = {{main.$route.current.params}}</pre>
          <pre>$routeParams = {{main.$routeParams}}</pre>
        </div>
      </file>

      <file name="book.html">
        <div>
          controller: {{book.name}}<br />
          Book Id: {{book.params.bookId}}<br />
        </div>
      </file>

      <file name="chapter.html">
        <div>
          controller: {{chapter.name}}<br />
          Book Id: {{chapter.params.bookId}}<br />
          Chapter Id: {{chapter.params.chapterId}}
        </div>
      </file>

      <file name="animations.css">
        .view-animate-container {
          position:relative;
          height:100px!important;
          background:white;
          border:1px solid black;
          height:40px;
          overflow:hidden;
        }

        .view-animate {
          padding:10px;
        }

        .view-animate.ng-enter, .view-animate.ng-leave {
          transition:all cubic-bezier(0.250, 0.460, 0.450, 0.940) 1.5s;

          display:block;
          width:100%;
          border-left:1px solid black;

          position:absolute;
          top:0;
          left:0;
          right:0;
          bottom:0;
          padding:10px;
        }

        .view-animate.ng-enter {
          left:100%;
        }
        .view-animate.ng-enter.ng-enter-active {
          left:0;
        }
        .view-animate.ng-leave.ng-leave-active {
          left:-100%;
        }
      </file>

      <file name="script.js">
        angular.module('ngViewExample', ['ngRoute', 'ngAnimate'])
          .config(['$routeProvider', '$locationProvider',
            function($routeProvider, $locationProvider) {
              $routeProvider
                .when('/Book/:bookId', {
                  templateUrl: 'book.html',
                  controller: 'BookCtrl',
                  controllerAs: 'book'
                })
                .when('/Book/:bookId/ch/:chapterId', {
                  templateUrl: 'chapter.html',
                  controller: 'ChapterCtrl',
                  controllerAs: 'chapter'
                });

              $locationProvider.html5Mode(true);
          }])
          .controller('MainCtrl', ['$route', '$routeParams', '$location',
            function($route, $routeParams, $location) {
              this.$route = $route;
              this.$location = $location;
              this.$routeParams = $routeParams;
          }])
          .controller('BookCtrl', ['$routeParams', function($routeParams) {
            this.name = "BookCtrl";
            this.params = $routeParams;
          }])
          .controller('ChapterCtrl', ['$routeParams', function($routeParams) {
            this.name = "ChapterCtrl";
            this.params = $routeParams;
          }]);

      </file>

      <file name="protractor.js" type="protractor">
        it('should load and compile correct template', function() {
          element(by.linkText('Moby: Ch1')).click();
          var content = element(by.css('[ng-view]')).getText();
          expect(content).toMatch(/controller\: ChapterCtrl/);
          expect(content).toMatch(/Book Id\: Moby/);
          expect(content).toMatch(/Chapter Id\: 1/);

          element(by.partialLinkText('Scarlet')).click();

          content = element(by.css('[ng-view]')).getText();
          expect(content).toMatch(/controller\: BookCtrl/);
          expect(content).toMatch(/Book Id\: Scarlet/);
        });
      </file>
    </example>
 */


/**
 * @ngdoc event
 * @name ngView#$viewContentLoaded
 * @eventType emit on the current ngView scope
 * @description
 * Emitted every time the ngView content is reloaded.
 */
ngViewFactory.$inject = ['$route', '$anchorScroll', '$animate'];
function ngViewFactory($route, $anchorScroll, $animate) {
  return {
    restrict: 'ECA',
    terminal: true,
    priority: 400,
    transclude: 'element',
    link: function(scope, $element, attr, ctrl, $transclude) {
        var currentScope,
            currentElement,
            previousLeaveAnimation,
            autoScrollExp = attr.autoscroll,
            onloadExp = attr.onload || '';

        scope.$on('$routeChangeSuccess', update);
        update();

        function cleanupLastView() {
          if (previousLeaveAnimation) {
            $animate.cancel(previousLeaveAnimation);
            previousLeaveAnimation = null;
          }

          if (currentScope) {
            currentScope.$destroy();
            currentScope = null;
          }
          if (currentElement) {
            previousLeaveAnimation = $animate.leave(currentElement);
            previousLeaveAnimation.then(function() {
              previousLeaveAnimation = null;
            });
            currentElement = null;
          }
        }

        function update() {
          var locals = $route.current && $route.current.locals,
              template = locals && locals.$template;

          if (angular.isDefined(template)) {
            var newScope = scope.$new();
            var current = $route.current;

            // Note: This will also link all children of ng-view that were contained in the original
            // html. If that content contains controllers, ... they could pollute/change the scope.
            // However, using ng-view on an element with additional content does not make sense...
            // Note: We can't remove them in the cloneAttchFn of $transclude as that
            // function is called before linking the content, which would apply child
            // directives to non existing elements.
            var clone = $transclude(newScope, function(clone) {
              $animate.enter(clone, null, currentElement || $element).then(function onNgViewEnter() {
                if (angular.isDefined(autoScrollExp)
                  && (!autoScrollExp || scope.$eval(autoScrollExp))) {
                  $anchorScroll();
                }
              });
              cleanupLastView();
            });

            currentElement = clone;
            currentScope = current.scope = newScope;
            currentScope.$emit('$viewContentLoaded');
            currentScope.$eval(onloadExp);
          } else {
            cleanupLastView();
          }
        }
    }
  };
}

// This directive is called during the $transclude call of the first `ngView` directive.
// It will replace and compile the content of the element with the loaded template.
// We need this directive so that the element content is already filled when
// the link function of another directive on the same element as ngView
// is called.
ngViewFillContentFactory.$inject = ['$compile', '$controller', '$route'];
function ngViewFillContentFactory($compile, $controller, $route) {
  return {
    restrict: 'ECA',
    priority: -400,
    link: function(scope, $element) {
      var current = $route.current,
          locals = current.locals;

      $element.html(locals.$template);

      var link = $compile($element.contents());

      if (current.controller) {
        locals.$scope = scope;
        var controller = $controller(current.controller, locals);
        if (current.controllerAs) {
          scope[current.controllerAs] = controller;
        }
        $element.data('$ngControllerController', controller);
        $element.children().data('$ngControllerController', controller);
      }
      scope[current.resolveAs || '$resolve'] = locals;

      link(scope);
    }
  };
}


})(window, window.angular);

/**!
 * Sortable
 * @author	RubaXa   <trash@rubaxa.org>
 * @license MIT
 */


(function (factory) {
	"use strict";

	if (typeof define === "function" && define.amd) {
		define(factory);
	}
	else if (typeof module != "undefined" && typeof module.exports != "undefined") {
		module.exports = factory();
	}
	else if (typeof Package !== "undefined") {
		Sortable = factory();  // export for Meteor.js
	}
	else {
		/* jshint sub:true */
		window["Sortable"] = factory();
	}
})(function () {
	"use strict";

	var dragEl,
		parentEl,
		ghostEl,
		cloneEl,
		rootEl,
		nextEl,

		scrollEl,
		scrollParentEl,

		lastEl,
		lastCSS,
		lastParentCSS,

		oldIndex,
		newIndex,

		activeGroup,
		autoScroll = {},

		tapEvt,
		touchEvt,

		moved,

		/** @const */
		RSPACE = /\s+/g,

		expando = 'Sortable' + (new Date).getTime(),

		win = window,
		document = win.document,
		parseInt = win.parseInt,

		supportDraggable = !!('draggable' in document.createElement('div')),
		supportCssPointerEvents = (function (el) {
			el = document.createElement('x');
			el.style.cssText = 'pointer-events:auto';
			return el.style.pointerEvents === 'auto';
		})(),

		_silent = false,

		abs = Math.abs,
		slice = [].slice,

		touchDragOverListeners = [],

		_autoScroll = _throttle(function (/**Event*/evt, /**Object*/options, /**HTMLElement*/rootEl) {
			// Bug: https://bugzilla.mozilla.org/show_bug.cgi?id=505521
			if (rootEl && options.scroll) {
				var el,
					rect,
					sens = options.scrollSensitivity,
					speed = options.scrollSpeed,

					x = evt.clientX,
					y = evt.clientY,

					winWidth = window.innerWidth,
					winHeight = window.innerHeight,

					vx,
					vy
				;

				// Delect scrollEl
				if (scrollParentEl !== rootEl) {
					scrollEl = options.scroll;
					scrollParentEl = rootEl;

					if (scrollEl === true) {
						scrollEl = rootEl;

						do {
							if ((scrollEl.offsetWidth < scrollEl.scrollWidth) ||
								(scrollEl.offsetHeight < scrollEl.scrollHeight)
							) {
								break;
							}
							/* jshint boss:true */
						} while (scrollEl = scrollEl.parentNode);
					}
				}

				if (scrollEl) {
					el = scrollEl;
					rect = scrollEl.getBoundingClientRect();
					vx = (abs(rect.right - x) <= sens) - (abs(rect.left - x) <= sens);
					vy = (abs(rect.bottom - y) <= sens) - (abs(rect.top - y) <= sens);
				}


				if (!(vx || vy)) {
					vx = (winWidth - x <= sens) - (x <= sens);
					vy = (winHeight - y <= sens) - (y <= sens);

					/* jshint expr:true */
					(vx || vy) && (el = win);
				}


				if (autoScroll.vx !== vx || autoScroll.vy !== vy || autoScroll.el !== el) {
					autoScroll.el = el;
					autoScroll.vx = vx;
					autoScroll.vy = vy;

					clearInterval(autoScroll.pid);

					if (el) {
						autoScroll.pid = setInterval(function () {
							if (el === win) {
								win.scrollTo(win.pageXOffset + vx * speed, win.pageYOffset + vy * speed);
							} else {
								vy && (el.scrollTop += vy * speed);
								vx && (el.scrollLeft += vx * speed);
							}
						}, 24);
					}
				}
			}
		}, 30),

		_prepareGroup = function (options) {
			var group = options.group;

			if (!group || typeof group != 'object') {
				group = options.group = {name: group};
			}

			['pull', 'put'].forEach(function (key) {
				if (!(key in group)) {
					group[key] = true;
				}
			});

			options.groups = ' ' + group.name + (group.put.join ? ' ' + group.put.join(' ') : '') + ' ';
		}
	;



	/**
	 * @class  Sortable
	 * @param  {HTMLElement}  el
	 * @param  {Object}       [options]
	 */
	function Sortable(el, options) {
		if (!(el && el.nodeType && el.nodeType === 1)) {
			throw 'Sortable: `el` must be HTMLElement, and not ' + {}.toString.call(el);
		}

		this.el = el; // root element
		this.options = options = _extend({}, options);


		// Export instance
		el[expando] = this;


		// Default options
		var defaults = {
			group: Math.random(),
			sort: true,
			disabled: false,
			store: null,
			handle: null,
			scroll: true,
			scrollSensitivity: 30,
			scrollSpeed: 10,
			draggable: /[uo]l/i.test(el.nodeName) ? 'li' : '>*',
			ghostClass: 'sortable-ghost',
			chosenClass: 'sortable-chosen',
			ignore: 'a, img',
			filter: null,
			animation: 0,
			setData: function (dataTransfer, dragEl) {
				dataTransfer.setData('Text', dragEl.textContent);
			},
			dropBubble: false,
			dragoverBubble: false,
			dataIdAttr: 'data-id',
			delay: 0,
			forceFallback: false,
			fallbackClass: 'sortable-fallback',
			fallbackOnBody: false
		};


		// Set default options
		for (var name in defaults) {
			!(name in options) && (options[name] = defaults[name]);
		}

		_prepareGroup(options);

		// Bind all private methods
		for (var fn in this) {
			if (fn.charAt(0) === '_') {
				this[fn] = this[fn].bind(this);
			}
		}

		// Setup drag mode
		this.nativeDraggable = options.forceFallback ? false : supportDraggable;

		// Bind events
		_on(el, 'mousedown', this._onTapStart);
		_on(el, 'touchstart', this._onTapStart);

		if (this.nativeDraggable) {
			_on(el, 'dragover', this);
			_on(el, 'dragenter', this);
		}

		touchDragOverListeners.push(this._onDragOver);

		// Restore sorting
		options.store && this.sort(options.store.get(this));
	}


	Sortable.prototype = /** @lends Sortable.prototype */ {
		constructor: Sortable,

		_onTapStart: function (/** Event|TouchEvent */evt) {
			var _this = this,
				el = this.el,
				options = this.options,
				type = evt.type,
				touch = evt.touches && evt.touches[0],
				target = (touch || evt).target,
				originalTarget = target,
				filter = options.filter;


			if (type === 'mousedown' && evt.button !== 0 || options.disabled) {
				return; // only left button or enabled
			}

			target = _closest(target, options.draggable, el);

			if (!target) {
				return;
			}

			// get the index of the dragged element within its parent
			oldIndex = _index(target);

			// Check filter
			if (typeof filter === 'function') {
				if (filter.call(this, evt, target, this)) {
					_dispatchEvent(_this, originalTarget, 'filter', target, el, oldIndex);
					evt.preventDefault();
					return; // cancel dnd
				}
			}
			else if (filter) {
				filter = filter.split(',').some(function (criteria) {
					criteria = _closest(originalTarget, criteria.trim(), el);

					if (criteria) {
						_dispatchEvent(_this, criteria, 'filter', target, el, oldIndex);
						return true;
					}
				});

				if (filter) {
					evt.preventDefault();
					return; // cancel dnd
				}
			}


			if (options.handle && !_closest(originalTarget, options.handle, el)) {
				return;
			}


			// Prepare `dragstart`
			this._prepareDragStart(evt, touch, target);
		},

		_prepareDragStart: function (/** Event */evt, /** Touch */touch, /** HTMLElement */target) {
			var _this = this,
				el = _this.el,
				options = _this.options,
				ownerDocument = el.ownerDocument,
				dragStartFn;

			if (target && !dragEl && (target.parentNode === el)) {
				tapEvt = evt;

				rootEl = el;
				dragEl = target;
				parentEl = dragEl.parentNode;
				nextEl = dragEl.nextSibling;
				activeGroup = options.group;

				dragStartFn = function () {
					// Delayed drag has been triggered
					// we can re-enable the events: touchmove/mousemove
					_this._disableDelayedDrag();

					// Make the element draggable
					dragEl.draggable = true;

					// Chosen item
					_toggleClass(dragEl, _this.options.chosenClass, true);

					// Bind the events: dragstart/dragend
					_this._triggerDragStart(touch);
				};

				// Disable "draggable"
				options.ignore.split(',').forEach(function (criteria) {
					_find(dragEl, criteria.trim(), _disableDraggable);
				});

				_on(ownerDocument, 'mouseup', _this._onDrop);
				_on(ownerDocument, 'touchend', _this._onDrop);
				_on(ownerDocument, 'touchcancel', _this._onDrop);

				if (options.delay) {
					// If the user moves the pointer or let go the click or touch
					// before the delay has been reached:
					// disable the delayed drag
					_on(ownerDocument, 'mouseup', _this._disableDelayedDrag);
					_on(ownerDocument, 'touchend', _this._disableDelayedDrag);
					_on(ownerDocument, 'touchcancel', _this._disableDelayedDrag);
					_on(ownerDocument, 'mousemove', _this._disableDelayedDrag);
					_on(ownerDocument, 'touchmove', _this._disableDelayedDrag);

					_this._dragStartTimer = setTimeout(dragStartFn, options.delay);
				} else {
					dragStartFn();
				}
			}
		},

		_disableDelayedDrag: function () {
			var ownerDocument = this.el.ownerDocument;

			clearTimeout(this._dragStartTimer);
			_off(ownerDocument, 'mouseup', this._disableDelayedDrag);
			_off(ownerDocument, 'touchend', this._disableDelayedDrag);
			_off(ownerDocument, 'touchcancel', this._disableDelayedDrag);
			_off(ownerDocument, 'mousemove', this._disableDelayedDrag);
			_off(ownerDocument, 'touchmove', this._disableDelayedDrag);
		},

		_triggerDragStart: function (/** Touch */touch) {
			if (touch) {
				// Touch device support
				tapEvt = {
					target: dragEl,
					clientX: touch.clientX,
					clientY: touch.clientY
				};

				this._onDragStart(tapEvt, 'touch');
			}
			else if (!this.nativeDraggable) {
				this._onDragStart(tapEvt, true);
			}
			else {
				_on(dragEl, 'dragend', this);
				_on(rootEl, 'dragstart', this._onDragStart);
			}

			try {
				if (document.selection) {
					document.selection.empty();
				} else {
					window.getSelection().removeAllRanges();
				}
			} catch (err) {
			}
		},

		_dragStarted: function () {
			if (rootEl && dragEl) {
				// Apply effect
				_toggleClass(dragEl, this.options.ghostClass, true);

				Sortable.active = this;

				// Drag start event
				_dispatchEvent(this, rootEl, 'start', dragEl, rootEl, oldIndex);
			}
		},

		_emulateDragOver: function () {
			if (touchEvt) {
				if (this._lastX === touchEvt.clientX && this._lastY === touchEvt.clientY) {
					return;
				}

				this._lastX = touchEvt.clientX;
				this._lastY = touchEvt.clientY;

				if (!supportCssPointerEvents) {
					_css(ghostEl, 'display', 'none');
				}

				var target = document.elementFromPoint(touchEvt.clientX, touchEvt.clientY),
					parent = target,
					groupName = ' ' + this.options.group.name + '',
					i = touchDragOverListeners.length;

				if (parent) {
					do {
						if (parent[expando] && parent[expando].options.groups.indexOf(groupName) > -1) {
							while (i--) {
								touchDragOverListeners[i]({
									clientX: touchEvt.clientX,
									clientY: touchEvt.clientY,
									target: target,
									rootEl: parent
								});
							}

							break;
						}

						target = parent; // store last element
					}
					/* jshint boss:true */
					while (parent = parent.parentNode);
				}

				if (!supportCssPointerEvents) {
					_css(ghostEl, 'display', '');
				}
			}
		},


		_onTouchMove: function (/**TouchEvent*/evt) {
			if (tapEvt) {
				// only set the status to dragging, when we are actually dragging
				if (!Sortable.active) {
					this._dragStarted();
				}

				// as well as creating the ghost element on the document body
				this._appendGhost();

				var touch = evt.touches ? evt.touches[0] : evt,
					dx = touch.clientX - tapEvt.clientX,
					dy = touch.clientY - tapEvt.clientY,
					translate3d = evt.touches ? 'translate3d(' + dx + 'px,' + dy + 'px,0)' : 'translate(' + dx + 'px,' + dy + 'px)';

				moved = true;
				touchEvt = touch;

				_css(ghostEl, 'webkitTransform', translate3d);
				_css(ghostEl, 'mozTransform', translate3d);
				_css(ghostEl, 'msTransform', translate3d);
				_css(ghostEl, 'transform', translate3d);

				evt.preventDefault();
			}
		},

		_appendGhost: function () {
			if (!ghostEl) {
				var rect = dragEl.getBoundingClientRect(),
					css = _css(dragEl),
					options = this.options,
					ghostRect;

				ghostEl = dragEl.cloneNode(true);

				_toggleClass(ghostEl, options.ghostClass, false);
				_toggleClass(ghostEl, options.fallbackClass, true);

				_css(ghostEl, 'top', rect.top - parseInt(css.marginTop, 10));
				_css(ghostEl, 'left', rect.left - parseInt(css.marginLeft, 10));
				_css(ghostEl, 'width', rect.width);
				_css(ghostEl, 'height', rect.height);
				_css(ghostEl, 'opacity', '0.8');
				_css(ghostEl, 'position', 'fixed');
				_css(ghostEl, 'zIndex', '100000');
				_css(ghostEl, 'pointerEvents', 'none');

				options.fallbackOnBody && document.body.appendChild(ghostEl) || rootEl.appendChild(ghostEl);

				// Fixing dimensions.
				ghostRect = ghostEl.getBoundingClientRect();
				_css(ghostEl, 'width', rect.width * 2 - ghostRect.width);
				_css(ghostEl, 'height', rect.height * 2 - ghostRect.height);
			}
		},

		_onDragStart: function (/**Event*/evt, /**boolean*/useFallback) {
			var dataTransfer = evt.dataTransfer,
				options = this.options;

			this._offUpEvents();

			if (activeGroup.pull == 'clone') {
				cloneEl = dragEl.cloneNode(true);
				_css(cloneEl, 'display', 'none');
				rootEl.insertBefore(cloneEl, dragEl);
			}

			if (useFallback) {

				if (useFallback === 'touch') {
					// Bind touch events
					_on(document, 'touchmove', this._onTouchMove);
					_on(document, 'touchend', this._onDrop);
					_on(document, 'touchcancel', this._onDrop);
				} else {
					// Old brwoser
					_on(document, 'mousemove', this._onTouchMove);
					_on(document, 'mouseup', this._onDrop);
				}

				this._loopId = setInterval(this._emulateDragOver, 50);
			}
			else {
				if (dataTransfer) {
					dataTransfer.effectAllowed = 'move';
					options.setData && options.setData.call(this, dataTransfer, dragEl);
				}

				_on(document, 'drop', this);
				setTimeout(this._dragStarted, 0);
			}
		},

		_onDragOver: function (/**Event*/evt) {
			var el = this.el,
				target,
				dragRect,
				revert,
				options = this.options,
				group = options.group,
				groupPut = group.put,
				isOwner = (activeGroup === group),
				canSort = options.sort;

			if (evt.preventDefault !== void 0) {
				evt.preventDefault();
				!options.dragoverBubble && evt.stopPropagation();
			}

			moved = true;

			if (activeGroup && !options.disabled &&
				(isOwner
					? canSort || (revert = !rootEl.contains(dragEl)) // Reverting item into the original list
					: activeGroup.pull && groupPut && (
						(activeGroup.name === group.name) || // by Name
						(groupPut.indexOf && ~groupPut.indexOf(activeGroup.name)) // by Array
					)
				) &&
				(evt.rootEl === void 0 || evt.rootEl === this.el) // touch fallback
			) {
				// Smart auto-scrolling
				_autoScroll(evt, options, this.el);

				if (_silent) {
					return;
				}

				target = _closest(evt.target, options.draggable, el);
				dragRect = dragEl.getBoundingClientRect();

				if (revert) {
					_cloneHide(true);

					if (cloneEl || nextEl) {
						rootEl.insertBefore(dragEl, cloneEl || nextEl);
					}
					else if (!canSort) {
						rootEl.appendChild(dragEl);
					}

					return;
				}


				if ((el.children.length === 0) || (el.children[0] === ghostEl) ||
					(el === evt.target) && (target = _ghostIsLast(el, evt))
				) {

					if (target) {
						if (target.animated) {
							return;
						}

						targetRect = target.getBoundingClientRect();
					}

					_cloneHide(isOwner);

					if (_onMove(rootEl, el, dragEl, dragRect, target, targetRect) !== false) {
						if (!dragEl.contains(el)) {
							el.appendChild(dragEl);
							parentEl = el; // actualization
						}

						this._animate(dragRect, dragEl);
						target && this._animate(targetRect, target);
					}
				}
				else if (target && !target.animated && target !== dragEl && (target.parentNode[expando] !== void 0)) {
					if (lastEl !== target) {
						lastEl = target;
						lastCSS = _css(target);
						lastParentCSS = _css(target.parentNode);
					}


					var targetRect = target.getBoundingClientRect(),
						width = targetRect.right - targetRect.left,
						height = targetRect.bottom - targetRect.top,
						floating = /left|right|inline/.test(lastCSS.cssFloat + lastCSS.display)
							|| (lastParentCSS.display == 'flex' && lastParentCSS['flex-direction'].indexOf('row') === 0),
						isWide = (target.offsetWidth > dragEl.offsetWidth),
						isLong = (target.offsetHeight > dragEl.offsetHeight),
						halfway = (floating ? (evt.clientX - targetRect.left) / width : (evt.clientY - targetRect.top) / height) > 0.5,
						nextSibling = target.nextElementSibling,
						moveVector = _onMove(rootEl, el, dragEl, dragRect, target, targetRect),
						after
					;

					if (moveVector !== false) {
						_silent = true;
						setTimeout(_unsilent, 30);

						_cloneHide(isOwner);

						if (moveVector === 1 || moveVector === -1) {
							after = (moveVector === 1);
						}
						else if (floating) {
							var elTop = dragEl.offsetTop,
								tgTop = target.offsetTop;

							if (elTop === tgTop) {
								after = (target.previousElementSibling === dragEl) && !isWide || halfway && isWide;
							} else {
								after = tgTop > elTop;
							}
						} else {
							after = (nextSibling !== dragEl) && !isLong || halfway && isLong;
						}

						if (!dragEl.contains(el)) {
							if (after && !nextSibling) {
								el.appendChild(dragEl);
							} else {
								target.parentNode.insertBefore(dragEl, after ? nextSibling : target);
							}
						}

						parentEl = dragEl.parentNode; // actualization

						this._animate(dragRect, dragEl);
						this._animate(targetRect, target);
					}
				}
			}
		},

		_animate: function (prevRect, target) {
			var ms = this.options.animation;

			if (ms) {
				var currentRect = target.getBoundingClientRect();

				_css(target, 'transition', 'none');
				_css(target, 'transform', 'translate3d('
					+ (prevRect.left - currentRect.left) + 'px,'
					+ (prevRect.top - currentRect.top) + 'px,0)'
				);

				target.offsetWidth; // repaint

				_css(target, 'transition', 'all ' + ms + 'ms');
				_css(target, 'transform', 'translate3d(0,0,0)');

				clearTimeout(target.animated);
				target.animated = setTimeout(function () {
					_css(target, 'transition', '');
					_css(target, 'transform', '');
					target.animated = false;
				}, ms);
			}
		},

		_offUpEvents: function () {
			var ownerDocument = this.el.ownerDocument;

			_off(document, 'touchmove', this._onTouchMove);
			_off(ownerDocument, 'mouseup', this._onDrop);
			_off(ownerDocument, 'touchend', this._onDrop);
			_off(ownerDocument, 'touchcancel', this._onDrop);
		},

		_onDrop: function (/**Event*/evt) {
			var el = this.el,
				options = this.options;

			clearInterval(this._loopId);
			clearInterval(autoScroll.pid);
			clearTimeout(this._dragStartTimer);

			// Unbind events
			_off(document, 'mousemove', this._onTouchMove);

			if (this.nativeDraggable) {
				_off(document, 'drop', this);
				_off(el, 'dragstart', this._onDragStart);
			}

			this._offUpEvents();

			if (evt) {
				if (moved) {
					evt.preventDefault();
					!options.dropBubble && evt.stopPropagation();
				}

				ghostEl && ghostEl.parentNode.removeChild(ghostEl);

				if (dragEl) {
					if (this.nativeDraggable) {
						_off(dragEl, 'dragend', this);
					}

					_disableDraggable(dragEl);

					// Remove class's
					_toggleClass(dragEl, this.options.ghostClass, false);
					_toggleClass(dragEl, this.options.chosenClass, false);

					if (rootEl !== parentEl) {
						newIndex = _index(dragEl);

						if (newIndex >= 0) {
							// drag from one list and drop into another
							_dispatchEvent(null, parentEl, 'sort', dragEl, rootEl, oldIndex, newIndex);
							_dispatchEvent(this, rootEl, 'sort', dragEl, rootEl, oldIndex, newIndex);

							// Add event
							_dispatchEvent(null, parentEl, 'add', dragEl, rootEl, oldIndex, newIndex);

							// Remove event
							_dispatchEvent(this, rootEl, 'remove', dragEl, rootEl, oldIndex, newIndex);
						}
					}
					else {
						// Remove clone
						cloneEl && cloneEl.parentNode.removeChild(cloneEl);

						if (dragEl.nextSibling !== nextEl) {
							// Get the index of the dragged element within its parent
							newIndex = _index(dragEl);

							if (newIndex >= 0) {
								// drag & drop within the same list
								_dispatchEvent(this, rootEl, 'update', dragEl, rootEl, oldIndex, newIndex);
								_dispatchEvent(this, rootEl, 'sort', dragEl, rootEl, oldIndex, newIndex);
							}
						}
					}

					if (Sortable.active) {
						if (newIndex === null || newIndex === -1) {
							newIndex = oldIndex;
						}

						_dispatchEvent(this, rootEl, 'end', dragEl, rootEl, oldIndex, newIndex);

						// Save sorting
						this.save();
					}
				}

				// Nulling
				rootEl =
				dragEl =
				parentEl =
				ghostEl =
				nextEl =
				cloneEl =

				scrollEl =
				scrollParentEl =

				tapEvt =
				touchEvt =

				moved =
				newIndex =

				lastEl =
				lastCSS =

				activeGroup =
				Sortable.active = null;
			}
		},


		handleEvent: function (/**Event*/evt) {
			var type = evt.type;

			if (type === 'dragover' || type === 'dragenter') {
				if (dragEl) {
					this._onDragOver(evt);
					_globalDragOver(evt);
				}
			}
			else if (type === 'drop' || type === 'dragend') {
				this._onDrop(evt);
			}
		},


		/**
		 * Serializes the item into an array of string.
		 * @returns {String[]}
		 */
		toArray: function () {
			var order = [],
				el,
				children = this.el.children,
				i = 0,
				n = children.length,
				options = this.options;

			for (; i < n; i++) {
				el = children[i];
				if (_closest(el, options.draggable, this.el)) {
					order.push(el.getAttribute(options.dataIdAttr) || _generateId(el));
				}
			}

			return order;
		},


		/**
		 * Sorts the elements according to the array.
		 * @param  {String[]}  order  order of the items
		 */
		sort: function (order) {
			var items = {}, rootEl = this.el;

			this.toArray().forEach(function (id, i) {
				var el = rootEl.children[i];

				if (_closest(el, this.options.draggable, rootEl)) {
					items[id] = el;
				}
			}, this);

			order.forEach(function (id) {
				if (items[id]) {
					rootEl.removeChild(items[id]);
					rootEl.appendChild(items[id]);
				}
			});
		},


		/**
		 * Save the current sorting
		 */
		save: function () {
			var store = this.options.store;
			store && store.set(this);
		},


		/**
		 * For each element in the set, get the first element that matches the selector by testing the element itself and traversing up through its ancestors in the DOM tree.
		 * @param   {HTMLElement}  el
		 * @param   {String}       [selector]  default: `options.draggable`
		 * @returns {HTMLElement|null}
		 */
		closest: function (el, selector) {
			return _closest(el, selector || this.options.draggable, this.el);
		},


		/**
		 * Set/get option
		 * @param   {string} name
		 * @param   {*}      [value]
		 * @returns {*}
		 */
		option: function (name, value) {
			var options = this.options;

			if (value === void 0) {
				return options[name];
			} else {
				options[name] = value;

				if (name === 'group') {
					_prepareGroup(options);
				}
			}
		},


		/**
		 * Destroy
		 */
		destroy: function () {
			var el = this.el;

			el[expando] = null;

			_off(el, 'mousedown', this._onTapStart);
			_off(el, 'touchstart', this._onTapStart);

			if (this.nativeDraggable) {
				_off(el, 'dragover', this);
				_off(el, 'dragenter', this);
			}

			// Remove draggable attributes
			Array.prototype.forEach.call(el.querySelectorAll('[draggable]'), function (el) {
				el.removeAttribute('draggable');
			});

			touchDragOverListeners.splice(touchDragOverListeners.indexOf(this._onDragOver), 1);

			this._onDrop();

			this.el = el = null;
		}
	};


	function _cloneHide(state) {
		if (cloneEl && (cloneEl.state !== state)) {
			_css(cloneEl, 'display', state ? 'none' : '');
			!state && cloneEl.state && rootEl.insertBefore(cloneEl, dragEl);
			cloneEl.state = state;
		}
	}


	function _closest(/**HTMLElement*/el, /**String*/selector, /**HTMLElement*/ctx) {
		if (el) {
			ctx = ctx || document;
			selector = selector.split('.');

			var tag = selector.shift().toUpperCase(),
				re = new RegExp('\\s(' + selector.join('|') + ')(?=\\s)', 'g');

			do {
				if (
					(tag === '>*' && el.parentNode === ctx) || (
						(tag === '' || el.nodeName.toUpperCase() == tag) &&
						(!selector.length || ((' ' + el.className + ' ').match(re) || []).length == selector.length)
					)
				) {
					return el;
				}
			}
			while (el !== ctx && (el = el.parentNode));
		}

		return null;
	}


	function _globalDragOver(/**Event*/evt) {
		if (evt.dataTransfer) {
			evt.dataTransfer.dropEffect = 'move';
		}
		evt.preventDefault();
	}


	function _on(el, event, fn) {
		el.addEventListener(event, fn, false);
	}


	function _off(el, event, fn) {
		el.removeEventListener(event, fn, false);
	}


	function _toggleClass(el, name, state) {
		if (el) {
			if (el.classList) {
				el.classList[state ? 'add' : 'remove'](name);
			}
			else {
				var className = (' ' + el.className + ' ').replace(RSPACE, ' ').replace(' ' + name + ' ', ' ');
				el.className = (className + (state ? ' ' + name : '')).replace(RSPACE, ' ');
			}
		}
	}


	function _css(el, prop, val) {
		var style = el && el.style;

		if (style) {
			if (val === void 0) {
				if (document.defaultView && document.defaultView.getComputedStyle) {
					val = document.defaultView.getComputedStyle(el, '');
				}
				else if (el.currentStyle) {
					val = el.currentStyle;
				}

				return prop === void 0 ? val : val[prop];
			}
			else {
				if (!(prop in style)) {
					prop = '-webkit-' + prop;
				}

				style[prop] = val + (typeof val === 'string' ? '' : 'px');
			}
		}
	}


	function _find(ctx, tagName, iterator) {
		if (ctx) {
			var list = ctx.getElementsByTagName(tagName), i = 0, n = list.length;

			if (iterator) {
				for (; i < n; i++) {
					iterator(list[i], i);
				}
			}

			return list;
		}

		return [];
	}



	function _dispatchEvent(sortable, rootEl, name, targetEl, fromEl, startIndex, newIndex) {
		var evt = document.createEvent('Event'),
			options = (sortable || rootEl[expando]).options,
			onName = 'on' + name.charAt(0).toUpperCase() + name.substr(1);

		evt.initEvent(name, true, true);

		evt.to = rootEl;
		evt.from = fromEl || rootEl;
		evt.item = targetEl || rootEl;
		evt.clone = cloneEl;

		evt.oldIndex = startIndex;
		evt.newIndex = newIndex;

		rootEl.dispatchEvent(evt);

		if (options[onName]) {
			options[onName].call(sortable, evt);
		}
	}


	function _onMove(fromEl, toEl, dragEl, dragRect, targetEl, targetRect) {
		var evt,
			sortable = fromEl[expando],
			onMoveFn = sortable.options.onMove,
			retVal;

		evt = document.createEvent('Event');
		evt.initEvent('move', true, true);

		evt.to = toEl;
		evt.from = fromEl;
		evt.dragged = dragEl;
		evt.draggedRect = dragRect;
		evt.related = targetEl || toEl;
		evt.relatedRect = targetRect || toEl.getBoundingClientRect();

		fromEl.dispatchEvent(evt);

		if (onMoveFn) {
			retVal = onMoveFn.call(sortable, evt);
		}

		return retVal;
	}


	function _disableDraggable(el) {
		el.draggable = false;
	}


	function _unsilent() {
		_silent = false;
	}


	/** @returns {HTMLElement|false} */
	function _ghostIsLast(el, evt) {
		var lastEl = el.lastElementChild,
				rect = lastEl.getBoundingClientRect();

		return ((evt.clientY - (rect.top + rect.height) > 5) || (evt.clientX - (rect.right + rect.width) > 5)) && lastEl; // min delta
	}


	/**
	 * Generate id
	 * @param   {HTMLElement} el
	 * @returns {String}
	 * @private
	 */
	function _generateId(el) {
		var str = el.tagName + el.className + el.src + el.href + el.textContent,
			i = str.length,
			sum = 0;

		while (i--) {
			sum += str.charCodeAt(i);
		}

		return sum.toString(36);
	}

	/**
	 * Returns the index of an element within its parent
	 * @param  {HTMLElement} el
	 * @return {number}
	 */
	function _index(el) {
		var index = 0;

		if (!el || !el.parentNode) {
			return -1;
		}

		while (el && (el = el.previousElementSibling)) {
			if (el.nodeName.toUpperCase() !== 'TEMPLATE') {
				index++;
			}
		}

		return index;
	}

	function _throttle(callback, ms) {
		var args, _this;

		return function () {
			if (args === void 0) {
				args = arguments;
				_this = this;

				setTimeout(function () {
					if (args.length === 1) {
						callback.call(_this, args[0]);
					} else {
						callback.apply(_this, args);
					}

					args = void 0;
				}, ms);
			}
		};
	}

	function _extend(dst, src) {
		if (dst && src) {
			for (var key in src) {
				if (src.hasOwnProperty(key)) {
					dst[key] = src[key];
				}
			}
		}

		return dst;
	}


	// Export utils
	Sortable.utils = {
		on: _on,
		off: _off,
		css: _css,
		find: _find,
		is: function (el, selector) {
			return !!_closest(el, selector, el);
		},
		extend: _extend,
		throttle: _throttle,
		closest: _closest,
		toggleClass: _toggleClass,
		index: _index
	};


	/**
	 * Create sortable instance
	 * @param {HTMLElement}  el
	 * @param {Object}      [options]
	 */
	Sortable.create = function (el, options) {
		return new Sortable(el, options);
	};


	// Export
	Sortable.version = '1.4.2';
	return Sortable;
});

/**
 * @author RubaXa <trash@rubaxa.org>
 * @licence MIT
 */
(function (factory) {
	'use strict';

	if (typeof define === 'function' && define.amd) {
		define(['angular', './Sortable'], factory);
	}
	else if (typeof require === 'function' && typeof exports === 'object' && typeof module === 'object') {
		require('angular');
		factory(angular, require('./Sortable'));
		module.exports = 'ng-sortable';
	}
	else if (window.angular && window.Sortable) {
		factory(angular, Sortable);
	}
})(function (angular, Sortable) {
	'use strict';


	/**
	 * @typedef   {Object}        ngSortEvent
	 * @property  {*}             model      List item
	 * @property  {Object|Array}  models     List of items
	 * @property  {number}        oldIndex   before sort
	 * @property  {number}        newIndex   after sort
	 */

	var expando = 'Sortable:ng-sortable';

	angular.module('ng-sortable', [])
		.constant('ngSortableVersion', '0.4.0')
		.constant('ngSortableConfig', {})
		.directive('ngSortable', ['$parse', 'ngSortableConfig', function ($parse, ngSortableConfig) {
			var removed,
				nextSibling,
				getSourceFactory = function getSourceFactory(el, scope) {
					var ngRepeat = [].filter.call(el.childNodes, function (node) {
						return (
								(node.nodeType === 8) &&
								(node.nodeValue.indexOf('ngRepeat:') !== -1)
							);
					})[0];

					if (!ngRepeat) {
						// Without ng-repeat
						return function () {
							return null;
						};
					}

					// tests: http://jsbin.com/kosubutilo/1/edit?js,output
					ngRepeat = ngRepeat.nodeValue.match(/ngRepeat:\s*(?:\(.*?,\s*)?([^\s)]+)[\s)]+in\s+([^\s|]+)/);

					var itemsExpr = $parse(ngRepeat[2]);

					return function () {
						return itemsExpr(scope.$parent) || [];
					};
				};


			// Export
			return {
				restrict: 'AC',
				scope: { ngSortable: "=?" },
				link: function (scope, $el) {
					var el = $el[0],
						options = angular.extend(scope.ngSortable || {}, ngSortableConfig),
						watchers = [],
						getSource = getSourceFactory(el, scope),
						sortable
					;

					el[expando] = getSource;

					function _emitEvent(/**Event*/evt, /*Mixed*/item) {
						var name = 'on' + evt.type.charAt(0).toUpperCase() + evt.type.substr(1);
						var source = getSource();

						/* jshint expr:true */
						options[name] && options[name]({
							model: item || source[evt.newIndex],
							models: source,
							oldIndex: evt.oldIndex,
							newIndex: evt.newIndex
						});
					}


					function _sync(/**Event*/evt) {
						var items = getSource();

						if (!items) {
							// Without ng-repeat
							return;
						}

						var oldIndex = evt.oldIndex,
							newIndex = evt.newIndex;

						if (el !== evt.from) {
							var prevItems = evt.from[expando]();

							removed = prevItems[oldIndex];

							if (evt.clone) {
								removed = angular.copy(removed);
								prevItems.splice(Sortable.utils.index(evt.clone), 0, prevItems.splice(oldIndex, 1)[0]);
								evt.from.removeChild(evt.clone);
							}
							else {
								prevItems.splice(oldIndex, 1);
							}

							items.splice(newIndex, 0, removed);

							evt.from.insertBefore(evt.item, nextSibling); // revert element
						}
						else {
							items.splice(newIndex, 0, items.splice(oldIndex, 1)[0]);
						}

						scope.$apply();
					}


					sortable = Sortable.create(el, Object.keys(options).reduce(function (opts, name) {
						opts[name] = opts[name] || options[name];
						return opts;
					}, {
						onStart: function (/**Event*/evt) {
							nextSibling = evt.item.nextSibling;
							_emitEvent(evt);
							scope.$apply();
						},
						onEnd: function (/**Event*/evt) {
							_emitEvent(evt, removed);
							scope.$apply();
						},
						onAdd: function (/**Event*/evt) {
							_sync(evt);
							_emitEvent(evt, removed);
							scope.$apply();
						},
						onUpdate: function (/**Event*/evt) {
							_sync(evt);
							_emitEvent(evt);
						},
						onRemove: function (/**Event*/evt) {
							_emitEvent(evt, removed);
						},
						onSort: function (/**Event*/evt) {
							_emitEvent(evt);
						}
					}));

					$el.on('$destroy', function () {
						angular.forEach(watchers, function (/** Function */unwatch) {
							unwatch();
						});

						sortable.destroy();

						el[expando] = null;
						el = null;
						watchers = null;
						sortable = null;
						nextSibling = null;
					});

					angular.forEach([
						'sort', 'disabled', 'draggable', 'handle', 'animation', 'group', 'ghostClass', 'filter',
						'onStart', 'onEnd', 'onAdd', 'onUpdate', 'onRemove', 'onSort'
					], function (name) {
						watchers.push(scope.$watch('ngSortable.' + name, function (value) {
							if (value !== void 0) {
								options[name] = value;

								if (!/^on[A-Z]/.test(name)) {
									sortable.option(name, value);
								}
							}
						}));
					});
				}
			};
		}]);
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFuZ3VsYXItcm91dGUuanMiLCJTb3J0YWJsZS5qcyIsIm5nLXNvcnRhYmxlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3aUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqdUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJ2ZW5kb3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlIEFuZ3VsYXJKUyB2MS41LjhcbiAqIChjKSAyMDEwLTIwMTYgR29vZ2xlLCBJbmMuIGh0dHA6Ly9hbmd1bGFyanMub3JnXG4gKiBMaWNlbnNlOiBNSVRcbiAqL1xuKGZ1bmN0aW9uKHdpbmRvdywgYW5ndWxhcikgeyd1c2Ugc3RyaWN0JztcblxuLyogZ2xvYmFsIHNoYWxsb3dDb3B5OiB0cnVlICovXG5cbi8qKlxuICogQ3JlYXRlcyBhIHNoYWxsb3cgY29weSBvZiBhbiBvYmplY3QsIGFuIGFycmF5IG9yIGEgcHJpbWl0aXZlLlxuICpcbiAqIEFzc3VtZXMgdGhhdCB0aGVyZSBhcmUgbm8gcHJvdG8gcHJvcGVydGllcyBmb3Igb2JqZWN0cy5cbiAqL1xuZnVuY3Rpb24gc2hhbGxvd0NvcHkoc3JjLCBkc3QpIHtcbiAgaWYgKGlzQXJyYXkoc3JjKSkge1xuICAgIGRzdCA9IGRzdCB8fCBbXTtcblxuICAgIGZvciAodmFyIGkgPSAwLCBpaSA9IHNyYy5sZW5ndGg7IGkgPCBpaTsgaSsrKSB7XG4gICAgICBkc3RbaV0gPSBzcmNbaV07XG4gICAgfVxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KHNyYykpIHtcbiAgICBkc3QgPSBkc3QgfHwge307XG5cbiAgICBmb3IgKHZhciBrZXkgaW4gc3JjKSB7XG4gICAgICBpZiAoIShrZXkuY2hhckF0KDApID09PSAnJCcgJiYga2V5LmNoYXJBdCgxKSA9PT0gJyQnKSkge1xuICAgICAgICBkc3Rba2V5XSA9IHNyY1trZXldO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBkc3QgfHwgc3JjO1xufVxuXG4vKiBnbG9iYWwgc2hhbGxvd0NvcHk6IGZhbHNlICovXG5cbi8vIFRoZXJlIGFyZSBuZWNlc3NhcnkgZm9yIGBzaGFsbG93Q29weSgpYCAoaW5jbHVkZWQgdmlhIGBzcmMvc2hhbGxvd0NvcHkuanNgKS5cbi8vIFRoZXkgYXJlIGluaXRpYWxpemVkIGluc2lkZSB0aGUgYCRSb3V0ZVByb3ZpZGVyYCwgdG8gZW5zdXJlIGB3aW5kb3cuYW5ndWxhcmAgaXMgYXZhaWxhYmxlLlxudmFyIGlzQXJyYXk7XG52YXIgaXNPYmplY3Q7XG5cbi8qKlxuICogQG5nZG9jIG1vZHVsZVxuICogQG5hbWUgbmdSb3V0ZVxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogIyBuZ1JvdXRlXG4gKlxuICogVGhlIGBuZ1JvdXRlYCBtb2R1bGUgcHJvdmlkZXMgcm91dGluZyBhbmQgZGVlcGxpbmtpbmcgc2VydmljZXMgYW5kIGRpcmVjdGl2ZXMgZm9yIGFuZ3VsYXIgYXBwcy5cbiAqXG4gKiAjIyBFeGFtcGxlXG4gKiBTZWUge0BsaW5rIG5nUm91dGUuJHJvdXRlI2V4YW1wbGUgJHJvdXRlfSBmb3IgYW4gZXhhbXBsZSBvZiBjb25maWd1cmluZyBhbmQgdXNpbmcgYG5nUm91dGVgLlxuICpcbiAqXG4gKiA8ZGl2IGRvYy1tb2R1bGUtY29tcG9uZW50cz1cIm5nUm91dGVcIj48L2Rpdj5cbiAqL1xuIC8qIGdsb2JhbCAtbmdSb3V0ZU1vZHVsZSAqL1xudmFyIG5nUm91dGVNb2R1bGUgPSBhbmd1bGFyLm1vZHVsZSgnbmdSb3V0ZScsIFsnbmcnXSkuXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlcignJHJvdXRlJywgJFJvdXRlUHJvdmlkZXIpLFxuICAgICRyb3V0ZU1pbkVyciA9IGFuZ3VsYXIuJCRtaW5FcnIoJ25nUm91dGUnKTtcblxuLyoqXG4gKiBAbmdkb2MgcHJvdmlkZXJcbiAqIEBuYW1lICRyb3V0ZVByb3ZpZGVyXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogVXNlZCBmb3IgY29uZmlndXJpbmcgcm91dGVzLlxuICpcbiAqICMjIEV4YW1wbGVcbiAqIFNlZSB7QGxpbmsgbmdSb3V0ZS4kcm91dGUjZXhhbXBsZSAkcm91dGV9IGZvciBhbiBleGFtcGxlIG9mIGNvbmZpZ3VyaW5nIGFuZCB1c2luZyBgbmdSb3V0ZWAuXG4gKlxuICogIyMgRGVwZW5kZW5jaWVzXG4gKiBSZXF1aXJlcyB0aGUge0BsaW5rIG5nUm91dGUgYG5nUm91dGVgfSBtb2R1bGUgdG8gYmUgaW5zdGFsbGVkLlxuICovXG5mdW5jdGlvbiAkUm91dGVQcm92aWRlcigpIHtcbiAgaXNBcnJheSA9IGFuZ3VsYXIuaXNBcnJheTtcbiAgaXNPYmplY3QgPSBhbmd1bGFyLmlzT2JqZWN0O1xuXG4gIGZ1bmN0aW9uIGluaGVyaXQocGFyZW50LCBleHRyYSkge1xuICAgIHJldHVybiBhbmd1bGFyLmV4dGVuZChPYmplY3QuY3JlYXRlKHBhcmVudCksIGV4dHJhKTtcbiAgfVxuXG4gIHZhciByb3V0ZXMgPSB7fTtcblxuICAvKipcbiAgICogQG5nZG9jIG1ldGhvZFxuICAgKiBAbmFtZSAkcm91dGVQcm92aWRlciN3aGVuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoIFJvdXRlIHBhdGggKG1hdGNoZWQgYWdhaW5zdCBgJGxvY2F0aW9uLnBhdGhgKS4gSWYgYCRsb2NhdGlvbi5wYXRoYFxuICAgKiAgICBjb250YWlucyByZWR1bmRhbnQgdHJhaWxpbmcgc2xhc2ggb3IgaXMgbWlzc2luZyBvbmUsIHRoZSByb3V0ZSB3aWxsIHN0aWxsIG1hdGNoIGFuZCB0aGVcbiAgICogICAgYCRsb2NhdGlvbi5wYXRoYCB3aWxsIGJlIHVwZGF0ZWQgdG8gYWRkIG9yIGRyb3AgdGhlIHRyYWlsaW5nIHNsYXNoIHRvIGV4YWN0bHkgbWF0Y2ggdGhlXG4gICAqICAgIHJvdXRlIGRlZmluaXRpb24uXG4gICAqXG4gICAqICAgICogYHBhdGhgIGNhbiBjb250YWluIG5hbWVkIGdyb3VwcyBzdGFydGluZyB3aXRoIGEgY29sb246IGUuZy4gYDpuYW1lYC4gQWxsIGNoYXJhY3RlcnMgdXBcbiAgICogICAgICAgIHRvIHRoZSBuZXh0IHNsYXNoIGFyZSBtYXRjaGVkIGFuZCBzdG9yZWQgaW4gYCRyb3V0ZVBhcmFtc2AgdW5kZXIgdGhlIGdpdmVuIGBuYW1lYFxuICAgKiAgICAgICAgd2hlbiB0aGUgcm91dGUgbWF0Y2hlcy5cbiAgICogICAgKiBgcGF0aGAgY2FuIGNvbnRhaW4gbmFtZWQgZ3JvdXBzIHN0YXJ0aW5nIHdpdGggYSBjb2xvbiBhbmQgZW5kaW5nIHdpdGggYSBzdGFyOlxuICAgKiAgICAgICAgZS5nLmA6bmFtZSpgLiBBbGwgY2hhcmFjdGVycyBhcmUgZWFnZXJseSBzdG9yZWQgaW4gYCRyb3V0ZVBhcmFtc2AgdW5kZXIgdGhlIGdpdmVuIGBuYW1lYFxuICAgKiAgICAgICAgd2hlbiB0aGUgcm91dGUgbWF0Y2hlcy5cbiAgICogICAgKiBgcGF0aGAgY2FuIGNvbnRhaW4gb3B0aW9uYWwgbmFtZWQgZ3JvdXBzIHdpdGggYSBxdWVzdGlvbiBtYXJrOiBlLmcuYDpuYW1lP2AuXG4gICAqXG4gICAqICAgIEZvciBleGFtcGxlLCByb3V0ZXMgbGlrZSBgL2NvbG9yLzpjb2xvci9sYXJnZWNvZGUvOmxhcmdlY29kZSpcXC9lZGl0YCB3aWxsIG1hdGNoXG4gICAqICAgIGAvY29sb3IvYnJvd24vbGFyZ2Vjb2RlL2NvZGUvd2l0aC9zbGFzaGVzL2VkaXRgIGFuZCBleHRyYWN0OlxuICAgKlxuICAgKiAgICAqIGBjb2xvcjogYnJvd25gXG4gICAqICAgICogYGxhcmdlY29kZTogY29kZS93aXRoL3NsYXNoZXNgLlxuICAgKlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gcm91dGUgTWFwcGluZyBpbmZvcm1hdGlvbiB0byBiZSBhc3NpZ25lZCB0byBgJHJvdXRlLmN1cnJlbnRgIG9uIHJvdXRlXG4gICAqICAgIG1hdGNoLlxuICAgKlxuICAgKiAgICBPYmplY3QgcHJvcGVydGllczpcbiAgICpcbiAgICogICAgLSBgY29udHJvbGxlcmAg4oCTIGB7KHN0cmluZ3xmdW5jdGlvbigpPX1gIOKAkyBDb250cm9sbGVyIGZuIHRoYXQgc2hvdWxkIGJlIGFzc29jaWF0ZWQgd2l0aFxuICAgKiAgICAgIG5ld2x5IGNyZWF0ZWQgc2NvcGUgb3IgdGhlIG5hbWUgb2YgYSB7QGxpbmsgYW5ndWxhci5Nb2R1bGUjY29udHJvbGxlciByZWdpc3RlcmVkXG4gICAqICAgICAgY29udHJvbGxlcn0gaWYgcGFzc2VkIGFzIGEgc3RyaW5nLlxuICAgKiAgICAtIGBjb250cm9sbGVyQXNgIOKAkyBge3N0cmluZz19YCDigJMgQW4gaWRlbnRpZmllciBuYW1lIGZvciBhIHJlZmVyZW5jZSB0byB0aGUgY29udHJvbGxlci5cbiAgICogICAgICBJZiBwcmVzZW50LCB0aGUgY29udHJvbGxlciB3aWxsIGJlIHB1Ymxpc2hlZCB0byBzY29wZSB1bmRlciB0aGUgYGNvbnRyb2xsZXJBc2AgbmFtZS5cbiAgICogICAgLSBgdGVtcGxhdGVgIOKAkyBge3N0cmluZz18ZnVuY3Rpb24oKT19YCDigJMgaHRtbCB0ZW1wbGF0ZSBhcyBhIHN0cmluZyBvciBhIGZ1bmN0aW9uIHRoYXRcbiAgICogICAgICByZXR1cm5zIGFuIGh0bWwgdGVtcGxhdGUgYXMgYSBzdHJpbmcgd2hpY2ggc2hvdWxkIGJlIHVzZWQgYnkge0BsaW5rXG4gICAqICAgICAgbmdSb3V0ZS5kaXJlY3RpdmU6bmdWaWV3IG5nVmlld30gb3Ige0BsaW5rIG5nLmRpcmVjdGl2ZTpuZ0luY2x1ZGUgbmdJbmNsdWRlfSBkaXJlY3RpdmVzLlxuICAgKiAgICAgIFRoaXMgcHJvcGVydHkgdGFrZXMgcHJlY2VkZW5jZSBvdmVyIGB0ZW1wbGF0ZVVybGAuXG4gICAqXG4gICAqICAgICAgSWYgYHRlbXBsYXRlYCBpcyBhIGZ1bmN0aW9uLCBpdCB3aWxsIGJlIGNhbGxlZCB3aXRoIHRoZSBmb2xsb3dpbmcgcGFyYW1ldGVyczpcbiAgICpcbiAgICogICAgICAtIGB7QXJyYXkuPE9iamVjdD59YCAtIHJvdXRlIHBhcmFtZXRlcnMgZXh0cmFjdGVkIGZyb20gdGhlIGN1cnJlbnRcbiAgICogICAgICAgIGAkbG9jYXRpb24ucGF0aCgpYCBieSBhcHBseWluZyB0aGUgY3VycmVudCByb3V0ZVxuICAgKlxuICAgKiAgICAtIGB0ZW1wbGF0ZVVybGAg4oCTIGB7c3RyaW5nPXxmdW5jdGlvbigpPX1gIOKAkyBwYXRoIG9yIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhIHBhdGggdG8gYW4gaHRtbFxuICAgKiAgICAgIHRlbXBsYXRlIHRoYXQgc2hvdWxkIGJlIHVzZWQgYnkge0BsaW5rIG5nUm91dGUuZGlyZWN0aXZlOm5nVmlldyBuZ1ZpZXd9LlxuICAgKlxuICAgKiAgICAgIElmIGB0ZW1wbGF0ZVVybGAgaXMgYSBmdW5jdGlvbiwgaXQgd2lsbCBiZSBjYWxsZWQgd2l0aCB0aGUgZm9sbG93aW5nIHBhcmFtZXRlcnM6XG4gICAqXG4gICAqICAgICAgLSBge0FycmF5LjxPYmplY3Q+fWAgLSByb3V0ZSBwYXJhbWV0ZXJzIGV4dHJhY3RlZCBmcm9tIHRoZSBjdXJyZW50XG4gICAqICAgICAgICBgJGxvY2F0aW9uLnBhdGgoKWAgYnkgYXBwbHlpbmcgdGhlIGN1cnJlbnQgcm91dGVcbiAgICpcbiAgICogICAgLSBgcmVzb2x2ZWAgLSBge09iamVjdC48c3RyaW5nLCBmdW5jdGlvbj49fWAgLSBBbiBvcHRpb25hbCBtYXAgb2YgZGVwZW5kZW5jaWVzIHdoaWNoIHNob3VsZFxuICAgKiAgICAgIGJlIGluamVjdGVkIGludG8gdGhlIGNvbnRyb2xsZXIuIElmIGFueSBvZiB0aGVzZSBkZXBlbmRlbmNpZXMgYXJlIHByb21pc2VzLCB0aGUgcm91dGVyXG4gICAqICAgICAgd2lsbCB3YWl0IGZvciB0aGVtIGFsbCB0byBiZSByZXNvbHZlZCBvciBvbmUgdG8gYmUgcmVqZWN0ZWQgYmVmb3JlIHRoZSBjb250cm9sbGVyIGlzXG4gICAqICAgICAgaW5zdGFudGlhdGVkLlxuICAgKiAgICAgIElmIGFsbCB0aGUgcHJvbWlzZXMgYXJlIHJlc29sdmVkIHN1Y2Nlc3NmdWxseSwgdGhlIHZhbHVlcyBvZiB0aGUgcmVzb2x2ZWQgcHJvbWlzZXMgYXJlXG4gICAqICAgICAgaW5qZWN0ZWQgYW5kIHtAbGluayBuZ1JvdXRlLiRyb3V0ZSMkcm91dGVDaGFuZ2VTdWNjZXNzICRyb3V0ZUNoYW5nZVN1Y2Nlc3N9IGV2ZW50IGlzXG4gICAqICAgICAgZmlyZWQuIElmIGFueSBvZiB0aGUgcHJvbWlzZXMgYXJlIHJlamVjdGVkIHRoZVxuICAgKiAgICAgIHtAbGluayBuZ1JvdXRlLiRyb3V0ZSMkcm91dGVDaGFuZ2VFcnJvciAkcm91dGVDaGFuZ2VFcnJvcn0gZXZlbnQgaXMgZmlyZWQuXG4gICAqICAgICAgRm9yIGVhc2llciBhY2Nlc3MgdG8gdGhlIHJlc29sdmVkIGRlcGVuZGVuY2llcyBmcm9tIHRoZSB0ZW1wbGF0ZSwgdGhlIGByZXNvbHZlYCBtYXAgd2lsbFxuICAgKiAgICAgIGJlIGF2YWlsYWJsZSBvbiB0aGUgc2NvcGUgb2YgdGhlIHJvdXRlLCB1bmRlciBgJHJlc29sdmVgIChieSBkZWZhdWx0KSBvciBhIGN1c3RvbSBuYW1lXG4gICAqICAgICAgc3BlY2lmaWVkIGJ5IHRoZSBgcmVzb2x2ZUFzYCBwcm9wZXJ0eSAoc2VlIGJlbG93KS4gVGhpcyBjYW4gYmUgcGFydGljdWxhcmx5IHVzZWZ1bCwgd2hlblxuICAgKiAgICAgIHdvcmtpbmcgd2l0aCB7QGxpbmsgYW5ndWxhci5Nb2R1bGUjY29tcG9uZW50IGNvbXBvbmVudHN9IGFzIHJvdXRlIHRlbXBsYXRlcy48YnIgLz5cbiAgICogICAgICA8ZGl2IGNsYXNzPVwiYWxlcnQgYWxlcnQtd2FybmluZ1wiPlxuICAgKiAgICAgICAgKipOb3RlOioqIElmIHlvdXIgc2NvcGUgYWxyZWFkeSBjb250YWlucyBhIHByb3BlcnR5IHdpdGggdGhpcyBuYW1lLCBpdCB3aWxsIGJlIGhpZGRlblxuICAgKiAgICAgICAgb3Igb3ZlcndyaXR0ZW4uIE1ha2Ugc3VyZSwgeW91IHNwZWNpZnkgYW4gYXBwcm9wcmlhdGUgbmFtZSBmb3IgdGhpcyBwcm9wZXJ0eSwgdGhhdFxuICAgKiAgICAgICAgZG9lcyBub3QgY29sbGlkZSB3aXRoIG90aGVyIHByb3BlcnRpZXMgb24gdGhlIHNjb3BlLlxuICAgKiAgICAgIDwvZGl2PlxuICAgKiAgICAgIFRoZSBtYXAgb2JqZWN0IGlzOlxuICAgKlxuICAgKiAgICAgIC0gYGtleWAg4oCTIGB7c3RyaW5nfWA6IGEgbmFtZSBvZiBhIGRlcGVuZGVuY3kgdG8gYmUgaW5qZWN0ZWQgaW50byB0aGUgY29udHJvbGxlci5cbiAgICogICAgICAtIGBmYWN0b3J5YCAtIGB7c3RyaW5nfGZ1bmN0aW9ufWA6IElmIGBzdHJpbmdgIHRoZW4gaXQgaXMgYW4gYWxpYXMgZm9yIGEgc2VydmljZS5cbiAgICogICAgICAgIE90aGVyd2lzZSBpZiBmdW5jdGlvbiwgdGhlbiBpdCBpcyB7QGxpbmsgYXV0by4kaW5qZWN0b3IjaW52b2tlIGluamVjdGVkfVxuICAgKiAgICAgICAgYW5kIHRoZSByZXR1cm4gdmFsdWUgaXMgdHJlYXRlZCBhcyB0aGUgZGVwZW5kZW5jeS4gSWYgdGhlIHJlc3VsdCBpcyBhIHByb21pc2UsIGl0IGlzXG4gICAqICAgICAgICByZXNvbHZlZCBiZWZvcmUgaXRzIHZhbHVlIGlzIGluamVjdGVkIGludG8gdGhlIGNvbnRyb2xsZXIuIEJlIGF3YXJlIHRoYXRcbiAgICogICAgICAgIGBuZ1JvdXRlLiRyb3V0ZVBhcmFtc2Agd2lsbCBzdGlsbCByZWZlciB0byB0aGUgcHJldmlvdXMgcm91dGUgd2l0aGluIHRoZXNlIHJlc29sdmVcbiAgICogICAgICAgIGZ1bmN0aW9ucy4gIFVzZSBgJHJvdXRlLmN1cnJlbnQucGFyYW1zYCB0byBhY2Nlc3MgdGhlIG5ldyByb3V0ZSBwYXJhbWV0ZXJzLCBpbnN0ZWFkLlxuICAgKlxuICAgKiAgICAtIGByZXNvbHZlQXNgIC0gYHtzdHJpbmc9fWAgLSBUaGUgbmFtZSB1bmRlciB3aGljaCB0aGUgYHJlc29sdmVgIG1hcCB3aWxsIGJlIGF2YWlsYWJsZSBvblxuICAgKiAgICAgIHRoZSBzY29wZSBvZiB0aGUgcm91dGUuIElmIG9taXR0ZWQsIGRlZmF1bHRzIHRvIGAkcmVzb2x2ZWAuXG4gICAqXG4gICAqICAgIC0gYHJlZGlyZWN0VG9gIOKAkyBgeyhzdHJpbmd8ZnVuY3Rpb24oKSk9fWAg4oCTIHZhbHVlIHRvIHVwZGF0ZVxuICAgKiAgICAgIHtAbGluayBuZy4kbG9jYXRpb24gJGxvY2F0aW9ufSBwYXRoIHdpdGggYW5kIHRyaWdnZXIgcm91dGUgcmVkaXJlY3Rpb24uXG4gICAqXG4gICAqICAgICAgSWYgYHJlZGlyZWN0VG9gIGlzIGEgZnVuY3Rpb24sIGl0IHdpbGwgYmUgY2FsbGVkIHdpdGggdGhlIGZvbGxvd2luZyBwYXJhbWV0ZXJzOlxuICAgKlxuICAgKiAgICAgIC0gYHtPYmplY3QuPHN0cmluZz59YCAtIHJvdXRlIHBhcmFtZXRlcnMgZXh0cmFjdGVkIGZyb20gdGhlIGN1cnJlbnRcbiAgICogICAgICAgIGAkbG9jYXRpb24ucGF0aCgpYCBieSBhcHBseWluZyB0aGUgY3VycmVudCByb3V0ZSB0ZW1wbGF0ZVVybC5cbiAgICogICAgICAtIGB7c3RyaW5nfWAgLSBjdXJyZW50IGAkbG9jYXRpb24ucGF0aCgpYFxuICAgKiAgICAgIC0gYHtPYmplY3R9YCAtIGN1cnJlbnQgYCRsb2NhdGlvbi5zZWFyY2goKWBcbiAgICpcbiAgICogICAgICBUaGUgY3VzdG9tIGByZWRpcmVjdFRvYCBmdW5jdGlvbiBpcyBleHBlY3RlZCB0byByZXR1cm4gYSBzdHJpbmcgd2hpY2ggd2lsbCBiZSB1c2VkXG4gICAqICAgICAgdG8gdXBkYXRlIGAkbG9jYXRpb24ucGF0aCgpYCBhbmQgYCRsb2NhdGlvbi5zZWFyY2goKWAuXG4gICAqXG4gICAqICAgIC0gYFtyZWxvYWRPblNlYXJjaD10cnVlXWAgLSBge2Jvb2xlYW49fWAgLSByZWxvYWQgcm91dGUgd2hlbiBvbmx5IGAkbG9jYXRpb24uc2VhcmNoKClgXG4gICAqICAgICAgb3IgYCRsb2NhdGlvbi5oYXNoKClgIGNoYW5nZXMuXG4gICAqXG4gICAqICAgICAgSWYgdGhlIG9wdGlvbiBpcyBzZXQgdG8gYGZhbHNlYCBhbmQgdXJsIGluIHRoZSBicm93c2VyIGNoYW5nZXMsIHRoZW5cbiAgICogICAgICBgJHJvdXRlVXBkYXRlYCBldmVudCBpcyBicm9hZGNhc3RlZCBvbiB0aGUgcm9vdCBzY29wZS5cbiAgICpcbiAgICogICAgLSBgW2Nhc2VJbnNlbnNpdGl2ZU1hdGNoPWZhbHNlXWAgLSBge2Jvb2xlYW49fWAgLSBtYXRjaCByb3V0ZXMgd2l0aG91dCBiZWluZyBjYXNlIHNlbnNpdGl2ZVxuICAgKlxuICAgKiAgICAgIElmIHRoZSBvcHRpb24gaXMgc2V0IHRvIGB0cnVlYCwgdGhlbiB0aGUgcGFydGljdWxhciByb3V0ZSBjYW4gYmUgbWF0Y2hlZCB3aXRob3V0IGJlaW5nXG4gICAqICAgICAgY2FzZSBzZW5zaXRpdmVcbiAgICpcbiAgICogQHJldHVybnMge09iamVjdH0gc2VsZlxuICAgKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogQWRkcyBhIG5ldyByb3V0ZSBkZWZpbml0aW9uIHRvIHRoZSBgJHJvdXRlYCBzZXJ2aWNlLlxuICAgKi9cbiAgdGhpcy53aGVuID0gZnVuY3Rpb24ocGF0aCwgcm91dGUpIHtcbiAgICAvL2NvcHkgb3JpZ2luYWwgcm91dGUgb2JqZWN0IHRvIHByZXNlcnZlIHBhcmFtcyBpbmhlcml0ZWQgZnJvbSBwcm90byBjaGFpblxuICAgIHZhciByb3V0ZUNvcHkgPSBzaGFsbG93Q29weShyb3V0ZSk7XG4gICAgaWYgKGFuZ3VsYXIuaXNVbmRlZmluZWQocm91dGVDb3B5LnJlbG9hZE9uU2VhcmNoKSkge1xuICAgICAgcm91dGVDb3B5LnJlbG9hZE9uU2VhcmNoID0gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKGFuZ3VsYXIuaXNVbmRlZmluZWQocm91dGVDb3B5LmNhc2VJbnNlbnNpdGl2ZU1hdGNoKSkge1xuICAgICAgcm91dGVDb3B5LmNhc2VJbnNlbnNpdGl2ZU1hdGNoID0gdGhpcy5jYXNlSW5zZW5zaXRpdmVNYXRjaDtcbiAgICB9XG4gICAgcm91dGVzW3BhdGhdID0gYW5ndWxhci5leHRlbmQoXG4gICAgICByb3V0ZUNvcHksXG4gICAgICBwYXRoICYmIHBhdGhSZWdFeHAocGF0aCwgcm91dGVDb3B5KVxuICAgICk7XG5cbiAgICAvLyBjcmVhdGUgcmVkaXJlY3Rpb24gZm9yIHRyYWlsaW5nIHNsYXNoZXNcbiAgICBpZiAocGF0aCkge1xuICAgICAgdmFyIHJlZGlyZWN0UGF0aCA9IChwYXRoW3BhdGgubGVuZ3RoIC0gMV0gPT0gJy8nKVxuICAgICAgICAgICAgPyBwYXRoLnN1YnN0cigwLCBwYXRoLmxlbmd0aCAtIDEpXG4gICAgICAgICAgICA6IHBhdGggKyAnLyc7XG5cbiAgICAgIHJvdXRlc1tyZWRpcmVjdFBhdGhdID0gYW5ndWxhci5leHRlbmQoXG4gICAgICAgIHtyZWRpcmVjdFRvOiBwYXRofSxcbiAgICAgICAgcGF0aFJlZ0V4cChyZWRpcmVjdFBhdGgsIHJvdXRlQ29weSlcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLyoqXG4gICAqIEBuZ2RvYyBwcm9wZXJ0eVxuICAgKiBAbmFtZSAkcm91dGVQcm92aWRlciNjYXNlSW5zZW5zaXRpdmVNYXRjaFxuICAgKiBAZGVzY3JpcHRpb25cbiAgICpcbiAgICogQSBib29sZWFuIHByb3BlcnR5IGluZGljYXRpbmcgaWYgcm91dGVzIGRlZmluZWRcbiAgICogdXNpbmcgdGhpcyBwcm92aWRlciBzaG91bGQgYmUgbWF0Y2hlZCB1c2luZyBhIGNhc2UgaW5zZW5zaXRpdmVcbiAgICogYWxnb3JpdGhtLiBEZWZhdWx0cyB0byBgZmFsc2VgLlxuICAgKi9cbiAgdGhpcy5jYXNlSW5zZW5zaXRpdmVNYXRjaCA9IGZhbHNlO1xuXG4gICAvKipcbiAgICAqIEBwYXJhbSBwYXRoIHtzdHJpbmd9IHBhdGhcbiAgICAqIEBwYXJhbSBvcHRzIHtPYmplY3R9IG9wdGlvbnNcbiAgICAqIEByZXR1cm4gez9PYmplY3R9XG4gICAgKlxuICAgICogQGRlc2NyaXB0aW9uXG4gICAgKiBOb3JtYWxpemVzIHRoZSBnaXZlbiBwYXRoLCByZXR1cm5pbmcgYSByZWd1bGFyIGV4cHJlc3Npb25cbiAgICAqIGFuZCB0aGUgb3JpZ2luYWwgcGF0aC5cbiAgICAqXG4gICAgKiBJbnNwaXJlZCBieSBwYXRoUmV4cCBpbiB2aXNpb25tZWRpYS9leHByZXNzL2xpYi91dGlscy5qcy5cbiAgICAqL1xuICBmdW5jdGlvbiBwYXRoUmVnRXhwKHBhdGgsIG9wdHMpIHtcbiAgICB2YXIgaW5zZW5zaXRpdmUgPSBvcHRzLmNhc2VJbnNlbnNpdGl2ZU1hdGNoLFxuICAgICAgICByZXQgPSB7XG4gICAgICAgICAgb3JpZ2luYWxQYXRoOiBwYXRoLFxuICAgICAgICAgIHJlZ2V4cDogcGF0aFxuICAgICAgICB9LFxuICAgICAgICBrZXlzID0gcmV0LmtleXMgPSBbXTtcblxuICAgIHBhdGggPSBwYXRoXG4gICAgICAucmVwbGFjZSgvKFsoKS5dKS9nLCAnXFxcXCQxJylcbiAgICAgIC5yZXBsYWNlKC8oXFwvKT86KFxcdyspKFxcKlxcP3xbXFw/XFwqXSk/L2csIGZ1bmN0aW9uKF8sIHNsYXNoLCBrZXksIG9wdGlvbikge1xuICAgICAgICB2YXIgb3B0aW9uYWwgPSAob3B0aW9uID09PSAnPycgfHwgb3B0aW9uID09PSAnKj8nKSA/ICc/JyA6IG51bGw7XG4gICAgICAgIHZhciBzdGFyID0gKG9wdGlvbiA9PT0gJyonIHx8IG9wdGlvbiA9PT0gJyo/JykgPyAnKicgOiBudWxsO1xuICAgICAgICBrZXlzLnB1c2goeyBuYW1lOiBrZXksIG9wdGlvbmFsOiAhIW9wdGlvbmFsIH0pO1xuICAgICAgICBzbGFzaCA9IHNsYXNoIHx8ICcnO1xuICAgICAgICByZXR1cm4gJydcbiAgICAgICAgICArIChvcHRpb25hbCA/ICcnIDogc2xhc2gpXG4gICAgICAgICAgKyAnKD86J1xuICAgICAgICAgICsgKG9wdGlvbmFsID8gc2xhc2ggOiAnJylcbiAgICAgICAgICArIChzdGFyICYmICcoLis/KScgfHwgJyhbXi9dKyknKVxuICAgICAgICAgICsgKG9wdGlvbmFsIHx8ICcnKVxuICAgICAgICAgICsgJyknXG4gICAgICAgICAgKyAob3B0aW9uYWwgfHwgJycpO1xuICAgICAgfSlcbiAgICAgIC5yZXBsYWNlKC8oW1xcLyRcXCpdKS9nLCAnXFxcXCQxJyk7XG5cbiAgICByZXQucmVnZXhwID0gbmV3IFJlZ0V4cCgnXicgKyBwYXRoICsgJyQnLCBpbnNlbnNpdGl2ZSA/ICdpJyA6ICcnKTtcbiAgICByZXR1cm4gcmV0O1xuICB9XG5cbiAgLyoqXG4gICAqIEBuZ2RvYyBtZXRob2RcbiAgICogQG5hbWUgJHJvdXRlUHJvdmlkZXIjb3RoZXJ3aXNlXG4gICAqXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBTZXRzIHJvdXRlIGRlZmluaXRpb24gdGhhdCB3aWxsIGJlIHVzZWQgb24gcm91dGUgY2hhbmdlIHdoZW4gbm8gb3RoZXIgcm91dGUgZGVmaW5pdGlvblxuICAgKiBpcyBtYXRjaGVkLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdHxzdHJpbmd9IHBhcmFtcyBNYXBwaW5nIGluZm9ybWF0aW9uIHRvIGJlIGFzc2lnbmVkIHRvIGAkcm91dGUuY3VycmVudGAuXG4gICAqIElmIGNhbGxlZCB3aXRoIGEgc3RyaW5nLCB0aGUgdmFsdWUgbWFwcyB0byBgcmVkaXJlY3RUb2AuXG4gICAqIEByZXR1cm5zIHtPYmplY3R9IHNlbGZcbiAgICovXG4gIHRoaXMub3RoZXJ3aXNlID0gZnVuY3Rpb24ocGFyYW1zKSB7XG4gICAgaWYgKHR5cGVvZiBwYXJhbXMgPT09ICdzdHJpbmcnKSB7XG4gICAgICBwYXJhbXMgPSB7cmVkaXJlY3RUbzogcGFyYW1zfTtcbiAgICB9XG4gICAgdGhpcy53aGVuKG51bGwsIHBhcmFtcyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cblxuICB0aGlzLiRnZXQgPSBbJyRyb290U2NvcGUnLFxuICAgICAgICAgICAgICAgJyRsb2NhdGlvbicsXG4gICAgICAgICAgICAgICAnJHJvdXRlUGFyYW1zJyxcbiAgICAgICAgICAgICAgICckcScsXG4gICAgICAgICAgICAgICAnJGluamVjdG9yJyxcbiAgICAgICAgICAgICAgICckdGVtcGxhdGVSZXF1ZXN0JyxcbiAgICAgICAgICAgICAgICckc2NlJyxcbiAgICAgIGZ1bmN0aW9uKCRyb290U2NvcGUsICRsb2NhdGlvbiwgJHJvdXRlUGFyYW1zLCAkcSwgJGluamVjdG9yLCAkdGVtcGxhdGVSZXF1ZXN0LCAkc2NlKSB7XG5cbiAgICAvKipcbiAgICAgKiBAbmdkb2Mgc2VydmljZVxuICAgICAqIEBuYW1lICRyb3V0ZVxuICAgICAqIEByZXF1aXJlcyAkbG9jYXRpb25cbiAgICAgKiBAcmVxdWlyZXMgJHJvdXRlUGFyYW1zXG4gICAgICpcbiAgICAgKiBAcHJvcGVydHkge09iamVjdH0gY3VycmVudCBSZWZlcmVuY2UgdG8gdGhlIGN1cnJlbnQgcm91dGUgZGVmaW5pdGlvbi5cbiAgICAgKiBUaGUgcm91dGUgZGVmaW5pdGlvbiBjb250YWluczpcbiAgICAgKlxuICAgICAqICAgLSBgY29udHJvbGxlcmA6IFRoZSBjb250cm9sbGVyIGNvbnN0cnVjdG9yIGFzIGRlZmluZWQgaW4gdGhlIHJvdXRlIGRlZmluaXRpb24uXG4gICAgICogICAtIGBsb2NhbHNgOiBBIG1hcCBvZiBsb2NhbHMgd2hpY2ggaXMgdXNlZCBieSB7QGxpbmsgbmcuJGNvbnRyb2xsZXIgJGNvbnRyb2xsZXJ9IHNlcnZpY2UgZm9yXG4gICAgICogICAgIGNvbnRyb2xsZXIgaW5zdGFudGlhdGlvbi4gVGhlIGBsb2NhbHNgIGNvbnRhaW5cbiAgICAgKiAgICAgdGhlIHJlc29sdmVkIHZhbHVlcyBvZiB0aGUgYHJlc29sdmVgIG1hcC4gQWRkaXRpb25hbGx5IHRoZSBgbG9jYWxzYCBhbHNvIGNvbnRhaW46XG4gICAgICpcbiAgICAgKiAgICAgLSBgJHNjb3BlYCAtIFRoZSBjdXJyZW50IHJvdXRlIHNjb3BlLlxuICAgICAqICAgICAtIGAkdGVtcGxhdGVgIC0gVGhlIGN1cnJlbnQgcm91dGUgdGVtcGxhdGUgSFRNTC5cbiAgICAgKlxuICAgICAqICAgICBUaGUgYGxvY2Fsc2Agd2lsbCBiZSBhc3NpZ25lZCB0byB0aGUgcm91dGUgc2NvcGUncyBgJHJlc29sdmVgIHByb3BlcnR5LiBZb3UgY2FuIG92ZXJyaWRlXG4gICAgICogICAgIHRoZSBwcm9wZXJ0eSBuYW1lLCB1c2luZyBgcmVzb2x2ZUFzYCBpbiB0aGUgcm91dGUgZGVmaW5pdGlvbi4gU2VlXG4gICAgICogICAgIHtAbGluayBuZ1JvdXRlLiRyb3V0ZVByb3ZpZGVyICRyb3V0ZVByb3ZpZGVyfSBmb3IgbW9yZSBpbmZvLlxuICAgICAqXG4gICAgICogQHByb3BlcnR5IHtPYmplY3R9IHJvdXRlcyBPYmplY3Qgd2l0aCBhbGwgcm91dGUgY29uZmlndXJhdGlvbiBPYmplY3RzIGFzIGl0cyBwcm9wZXJ0aWVzLlxuICAgICAqXG4gICAgICogQGRlc2NyaXB0aW9uXG4gICAgICogYCRyb3V0ZWAgaXMgdXNlZCBmb3IgZGVlcC1saW5raW5nIFVSTHMgdG8gY29udHJvbGxlcnMgYW5kIHZpZXdzIChIVE1MIHBhcnRpYWxzKS5cbiAgICAgKiBJdCB3YXRjaGVzIGAkbG9jYXRpb24udXJsKClgIGFuZCB0cmllcyB0byBtYXAgdGhlIHBhdGggdG8gYW4gZXhpc3Rpbmcgcm91dGUgZGVmaW5pdGlvbi5cbiAgICAgKlxuICAgICAqIFJlcXVpcmVzIHRoZSB7QGxpbmsgbmdSb3V0ZSBgbmdSb3V0ZWB9IG1vZHVsZSB0byBiZSBpbnN0YWxsZWQuXG4gICAgICpcbiAgICAgKiBZb3UgY2FuIGRlZmluZSByb3V0ZXMgdGhyb3VnaCB7QGxpbmsgbmdSb3V0ZS4kcm91dGVQcm92aWRlciAkcm91dGVQcm92aWRlcn0ncyBBUEkuXG4gICAgICpcbiAgICAgKiBUaGUgYCRyb3V0ZWAgc2VydmljZSBpcyB0eXBpY2FsbHkgdXNlZCBpbiBjb25qdW5jdGlvbiB3aXRoIHRoZVxuICAgICAqIHtAbGluayBuZ1JvdXRlLmRpcmVjdGl2ZTpuZ1ZpZXcgYG5nVmlld2B9IGRpcmVjdGl2ZSBhbmQgdGhlXG4gICAgICoge0BsaW5rIG5nUm91dGUuJHJvdXRlUGFyYW1zIGAkcm91dGVQYXJhbXNgfSBzZXJ2aWNlLlxuICAgICAqXG4gICAgICogQGV4YW1wbGVcbiAgICAgKiBUaGlzIGV4YW1wbGUgc2hvd3MgaG93IGNoYW5naW5nIHRoZSBVUkwgaGFzaCBjYXVzZXMgdGhlIGAkcm91dGVgIHRvIG1hdGNoIGEgcm91dGUgYWdhaW5zdCB0aGVcbiAgICAgKiBVUkwsIGFuZCB0aGUgYG5nVmlld2AgcHVsbHMgaW4gdGhlIHBhcnRpYWwuXG4gICAgICpcbiAgICAgKiA8ZXhhbXBsZSBuYW1lPVwiJHJvdXRlLXNlcnZpY2VcIiBtb2R1bGU9XCJuZ1JvdXRlRXhhbXBsZVwiXG4gICAgICogICAgICAgICAgZGVwcz1cImFuZ3VsYXItcm91dGUuanNcIiBmaXhCYXNlPVwidHJ1ZVwiPlxuICAgICAqICAgPGZpbGUgbmFtZT1cImluZGV4Lmh0bWxcIj5cbiAgICAgKiAgICAgPGRpdiBuZy1jb250cm9sbGVyPVwiTWFpbkNvbnRyb2xsZXJcIj5cbiAgICAgKiAgICAgICBDaG9vc2U6XG4gICAgICogICAgICAgPGEgaHJlZj1cIkJvb2svTW9ieVwiPk1vYnk8L2E+IHxcbiAgICAgKiAgICAgICA8YSBocmVmPVwiQm9vay9Nb2J5L2NoLzFcIj5Nb2J5OiBDaDE8L2E+IHxcbiAgICAgKiAgICAgICA8YSBocmVmPVwiQm9vay9HYXRzYnlcIj5HYXRzYnk8L2E+IHxcbiAgICAgKiAgICAgICA8YSBocmVmPVwiQm9vay9HYXRzYnkvY2gvND9rZXk9dmFsdWVcIj5HYXRzYnk6IENoNDwvYT4gfFxuICAgICAqICAgICAgIDxhIGhyZWY9XCJCb29rL1NjYXJsZXRcIj5TY2FybGV0IExldHRlcjwvYT48YnIvPlxuICAgICAqXG4gICAgICogICAgICAgPGRpdiBuZy12aWV3PjwvZGl2PlxuICAgICAqXG4gICAgICogICAgICAgPGhyIC8+XG4gICAgICpcbiAgICAgKiAgICAgICA8cHJlPiRsb2NhdGlvbi5wYXRoKCkgPSB7eyRsb2NhdGlvbi5wYXRoKCl9fTwvcHJlPlxuICAgICAqICAgICAgIDxwcmU+JHJvdXRlLmN1cnJlbnQudGVtcGxhdGVVcmwgPSB7eyRyb3V0ZS5jdXJyZW50LnRlbXBsYXRlVXJsfX08L3ByZT5cbiAgICAgKiAgICAgICA8cHJlPiRyb3V0ZS5jdXJyZW50LnBhcmFtcyA9IHt7JHJvdXRlLmN1cnJlbnQucGFyYW1zfX08L3ByZT5cbiAgICAgKiAgICAgICA8cHJlPiRyb3V0ZS5jdXJyZW50LnNjb3BlLm5hbWUgPSB7eyRyb3V0ZS5jdXJyZW50LnNjb3BlLm5hbWV9fTwvcHJlPlxuICAgICAqICAgICAgIDxwcmU+JHJvdXRlUGFyYW1zID0ge3skcm91dGVQYXJhbXN9fTwvcHJlPlxuICAgICAqICAgICA8L2Rpdj5cbiAgICAgKiAgIDwvZmlsZT5cbiAgICAgKlxuICAgICAqICAgPGZpbGUgbmFtZT1cImJvb2suaHRtbFwiPlxuICAgICAqICAgICBjb250cm9sbGVyOiB7e25hbWV9fTxiciAvPlxuICAgICAqICAgICBCb29rIElkOiB7e3BhcmFtcy5ib29rSWR9fTxiciAvPlxuICAgICAqICAgPC9maWxlPlxuICAgICAqXG4gICAgICogICA8ZmlsZSBuYW1lPVwiY2hhcHRlci5odG1sXCI+XG4gICAgICogICAgIGNvbnRyb2xsZXI6IHt7bmFtZX19PGJyIC8+XG4gICAgICogICAgIEJvb2sgSWQ6IHt7cGFyYW1zLmJvb2tJZH19PGJyIC8+XG4gICAgICogICAgIENoYXB0ZXIgSWQ6IHt7cGFyYW1zLmNoYXB0ZXJJZH19XG4gICAgICogICA8L2ZpbGU+XG4gICAgICpcbiAgICAgKiAgIDxmaWxlIG5hbWU9XCJzY3JpcHQuanNcIj5cbiAgICAgKiAgICAgYW5ndWxhci5tb2R1bGUoJ25nUm91dGVFeGFtcGxlJywgWyduZ1JvdXRlJ10pXG4gICAgICpcbiAgICAgKiAgICAgIC5jb250cm9sbGVyKCdNYWluQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgJHJvdXRlLCAkcm91dGVQYXJhbXMsICRsb2NhdGlvbikge1xuICAgICAqICAgICAgICAgICRzY29wZS4kcm91dGUgPSAkcm91dGU7XG4gICAgICogICAgICAgICAgJHNjb3BlLiRsb2NhdGlvbiA9ICRsb2NhdGlvbjtcbiAgICAgKiAgICAgICAgICAkc2NvcGUuJHJvdXRlUGFyYW1zID0gJHJvdXRlUGFyYW1zO1xuICAgICAqICAgICAgfSlcbiAgICAgKlxuICAgICAqICAgICAgLmNvbnRyb2xsZXIoJ0Jvb2tDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCAkcm91dGVQYXJhbXMpIHtcbiAgICAgKiAgICAgICAgICAkc2NvcGUubmFtZSA9IFwiQm9va0NvbnRyb2xsZXJcIjtcbiAgICAgKiAgICAgICAgICAkc2NvcGUucGFyYW1zID0gJHJvdXRlUGFyYW1zO1xuICAgICAqICAgICAgfSlcbiAgICAgKlxuICAgICAqICAgICAgLmNvbnRyb2xsZXIoJ0NoYXB0ZXJDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCAkcm91dGVQYXJhbXMpIHtcbiAgICAgKiAgICAgICAgICAkc2NvcGUubmFtZSA9IFwiQ2hhcHRlckNvbnRyb2xsZXJcIjtcbiAgICAgKiAgICAgICAgICAkc2NvcGUucGFyYW1zID0gJHJvdXRlUGFyYW1zO1xuICAgICAqICAgICAgfSlcbiAgICAgKlxuICAgICAqICAgICAuY29uZmlnKGZ1bmN0aW9uKCRyb3V0ZVByb3ZpZGVyLCAkbG9jYXRpb25Qcm92aWRlcikge1xuICAgICAqICAgICAgICRyb3V0ZVByb3ZpZGVyXG4gICAgICogICAgICAgIC53aGVuKCcvQm9vay86Ym9va0lkJywge1xuICAgICAqICAgICAgICAgdGVtcGxhdGVVcmw6ICdib29rLmh0bWwnLFxuICAgICAqICAgICAgICAgY29udHJvbGxlcjogJ0Jvb2tDb250cm9sbGVyJyxcbiAgICAgKiAgICAgICAgIHJlc29sdmU6IHtcbiAgICAgKiAgICAgICAgICAgLy8gSSB3aWxsIGNhdXNlIGEgMSBzZWNvbmQgZGVsYXlcbiAgICAgKiAgICAgICAgICAgZGVsYXk6IGZ1bmN0aW9uKCRxLCAkdGltZW91dCkge1xuICAgICAqICAgICAgICAgICAgIHZhciBkZWxheSA9ICRxLmRlZmVyKCk7XG4gICAgICogICAgICAgICAgICAgJHRpbWVvdXQoZGVsYXkucmVzb2x2ZSwgMTAwMCk7XG4gICAgICogICAgICAgICAgICAgcmV0dXJuIGRlbGF5LnByb21pc2U7XG4gICAgICogICAgICAgICAgIH1cbiAgICAgKiAgICAgICAgIH1cbiAgICAgKiAgICAgICB9KVxuICAgICAqICAgICAgIC53aGVuKCcvQm9vay86Ym9va0lkL2NoLzpjaGFwdGVySWQnLCB7XG4gICAgICogICAgICAgICB0ZW1wbGF0ZVVybDogJ2NoYXB0ZXIuaHRtbCcsXG4gICAgICogICAgICAgICBjb250cm9sbGVyOiAnQ2hhcHRlckNvbnRyb2xsZXInXG4gICAgICogICAgICAgfSk7XG4gICAgICpcbiAgICAgKiAgICAgICAvLyBjb25maWd1cmUgaHRtbDUgdG8gZ2V0IGxpbmtzIHdvcmtpbmcgb24ganNmaWRkbGVcbiAgICAgKiAgICAgICAkbG9jYXRpb25Qcm92aWRlci5odG1sNU1vZGUodHJ1ZSk7XG4gICAgICogICAgIH0pO1xuICAgICAqXG4gICAgICogICA8L2ZpbGU+XG4gICAgICpcbiAgICAgKiAgIDxmaWxlIG5hbWU9XCJwcm90cmFjdG9yLmpzXCIgdHlwZT1cInByb3RyYWN0b3JcIj5cbiAgICAgKiAgICAgaXQoJ3Nob3VsZCBsb2FkIGFuZCBjb21waWxlIGNvcnJlY3QgdGVtcGxhdGUnLCBmdW5jdGlvbigpIHtcbiAgICAgKiAgICAgICBlbGVtZW50KGJ5LmxpbmtUZXh0KCdNb2J5OiBDaDEnKSkuY2xpY2soKTtcbiAgICAgKiAgICAgICB2YXIgY29udGVudCA9IGVsZW1lbnQoYnkuY3NzKCdbbmctdmlld10nKSkuZ2V0VGV4dCgpO1xuICAgICAqICAgICAgIGV4cGVjdChjb250ZW50KS50b01hdGNoKC9jb250cm9sbGVyXFw6IENoYXB0ZXJDb250cm9sbGVyLyk7XG4gICAgICogICAgICAgZXhwZWN0KGNvbnRlbnQpLnRvTWF0Y2goL0Jvb2sgSWRcXDogTW9ieS8pO1xuICAgICAqICAgICAgIGV4cGVjdChjb250ZW50KS50b01hdGNoKC9DaGFwdGVyIElkXFw6IDEvKTtcbiAgICAgKlxuICAgICAqICAgICAgIGVsZW1lbnQoYnkucGFydGlhbExpbmtUZXh0KCdTY2FybGV0JykpLmNsaWNrKCk7XG4gICAgICpcbiAgICAgKiAgICAgICBjb250ZW50ID0gZWxlbWVudChieS5jc3MoJ1tuZy12aWV3XScpKS5nZXRUZXh0KCk7XG4gICAgICogICAgICAgZXhwZWN0KGNvbnRlbnQpLnRvTWF0Y2goL2NvbnRyb2xsZXJcXDogQm9va0NvbnRyb2xsZXIvKTtcbiAgICAgKiAgICAgICBleHBlY3QoY29udGVudCkudG9NYXRjaCgvQm9vayBJZFxcOiBTY2FybGV0Lyk7XG4gICAgICogICAgIH0pO1xuICAgICAqICAgPC9maWxlPlxuICAgICAqIDwvZXhhbXBsZT5cbiAgICAgKi9cblxuICAgIC8qKlxuICAgICAqIEBuZ2RvYyBldmVudFxuICAgICAqIEBuYW1lICRyb3V0ZSMkcm91dGVDaGFuZ2VTdGFydFxuICAgICAqIEBldmVudFR5cGUgYnJvYWRjYXN0IG9uIHJvb3Qgc2NvcGVcbiAgICAgKiBAZGVzY3JpcHRpb25cbiAgICAgKiBCcm9hZGNhc3RlZCBiZWZvcmUgYSByb3V0ZSBjaGFuZ2UuIEF0IHRoaXMgIHBvaW50IHRoZSByb3V0ZSBzZXJ2aWNlcyBzdGFydHNcbiAgICAgKiByZXNvbHZpbmcgYWxsIG9mIHRoZSBkZXBlbmRlbmNpZXMgbmVlZGVkIGZvciB0aGUgcm91dGUgY2hhbmdlIHRvIG9jY3VyLlxuICAgICAqIFR5cGljYWxseSB0aGlzIGludm9sdmVzIGZldGNoaW5nIHRoZSB2aWV3IHRlbXBsYXRlIGFzIHdlbGwgYXMgYW55IGRlcGVuZGVuY2llc1xuICAgICAqIGRlZmluZWQgaW4gYHJlc29sdmVgIHJvdXRlIHByb3BlcnR5LiBPbmNlICBhbGwgb2YgdGhlIGRlcGVuZGVuY2llcyBhcmUgcmVzb2x2ZWRcbiAgICAgKiBgJHJvdXRlQ2hhbmdlU3VjY2Vzc2AgaXMgZmlyZWQuXG4gICAgICpcbiAgICAgKiBUaGUgcm91dGUgY2hhbmdlIChhbmQgdGhlIGAkbG9jYXRpb25gIGNoYW5nZSB0aGF0IHRyaWdnZXJlZCBpdCkgY2FuIGJlIHByZXZlbnRlZFxuICAgICAqIGJ5IGNhbGxpbmcgYHByZXZlbnREZWZhdWx0YCBtZXRob2Qgb2YgdGhlIGV2ZW50LiBTZWUge0BsaW5rIG5nLiRyb290U2NvcGUuU2NvcGUjJG9ufVxuICAgICAqIGZvciBtb3JlIGRldGFpbHMgYWJvdXQgZXZlbnQgb2JqZWN0LlxuICAgICAqXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGFuZ3VsYXJFdmVudCBTeW50aGV0aWMgZXZlbnQgb2JqZWN0LlxuICAgICAqIEBwYXJhbSB7Um91dGV9IG5leHQgRnV0dXJlIHJvdXRlIGluZm9ybWF0aW9uLlxuICAgICAqIEBwYXJhbSB7Um91dGV9IGN1cnJlbnQgQ3VycmVudCByb3V0ZSBpbmZvcm1hdGlvbi5cbiAgICAgKi9cblxuICAgIC8qKlxuICAgICAqIEBuZ2RvYyBldmVudFxuICAgICAqIEBuYW1lICRyb3V0ZSMkcm91dGVDaGFuZ2VTdWNjZXNzXG4gICAgICogQGV2ZW50VHlwZSBicm9hZGNhc3Qgb24gcm9vdCBzY29wZVxuICAgICAqIEBkZXNjcmlwdGlvblxuICAgICAqIEJyb2FkY2FzdGVkIGFmdGVyIGEgcm91dGUgY2hhbmdlIGhhcyBoYXBwZW5lZCBzdWNjZXNzZnVsbHkuXG4gICAgICogVGhlIGByZXNvbHZlYCBkZXBlbmRlbmNpZXMgYXJlIG5vdyBhdmFpbGFibGUgaW4gdGhlIGBjdXJyZW50LmxvY2Fsc2AgcHJvcGVydHkuXG4gICAgICpcbiAgICAgKiB7QGxpbmsgbmdSb3V0ZS5kaXJlY3RpdmU6bmdWaWV3IG5nVmlld30gbGlzdGVucyBmb3IgdGhlIGRpcmVjdGl2ZVxuICAgICAqIHRvIGluc3RhbnRpYXRlIHRoZSBjb250cm9sbGVyIGFuZCByZW5kZXIgdGhlIHZpZXcuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gYW5ndWxhckV2ZW50IFN5bnRoZXRpYyBldmVudCBvYmplY3QuXG4gICAgICogQHBhcmFtIHtSb3V0ZX0gY3VycmVudCBDdXJyZW50IHJvdXRlIGluZm9ybWF0aW9uLlxuICAgICAqIEBwYXJhbSB7Um91dGV8VW5kZWZpbmVkfSBwcmV2aW91cyBQcmV2aW91cyByb3V0ZSBpbmZvcm1hdGlvbiwgb3IgdW5kZWZpbmVkIGlmIGN1cnJlbnQgaXNcbiAgICAgKiBmaXJzdCByb3V0ZSBlbnRlcmVkLlxuICAgICAqL1xuXG4gICAgLyoqXG4gICAgICogQG5nZG9jIGV2ZW50XG4gICAgICogQG5hbWUgJHJvdXRlIyRyb3V0ZUNoYW5nZUVycm9yXG4gICAgICogQGV2ZW50VHlwZSBicm9hZGNhc3Qgb24gcm9vdCBzY29wZVxuICAgICAqIEBkZXNjcmlwdGlvblxuICAgICAqIEJyb2FkY2FzdGVkIGlmIGFueSBvZiB0aGUgcmVzb2x2ZSBwcm9taXNlcyBhcmUgcmVqZWN0ZWQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gYW5ndWxhckV2ZW50IFN5bnRoZXRpYyBldmVudCBvYmplY3RcbiAgICAgKiBAcGFyYW0ge1JvdXRlfSBjdXJyZW50IEN1cnJlbnQgcm91dGUgaW5mb3JtYXRpb24uXG4gICAgICogQHBhcmFtIHtSb3V0ZX0gcHJldmlvdXMgUHJldmlvdXMgcm91dGUgaW5mb3JtYXRpb24uXG4gICAgICogQHBhcmFtIHtSb3V0ZX0gcmVqZWN0aW9uIFJlamVjdGlvbiBvZiB0aGUgcHJvbWlzZS4gVXN1YWxseSB0aGUgZXJyb3Igb2YgdGhlIGZhaWxlZCBwcm9taXNlLlxuICAgICAqL1xuXG4gICAgLyoqXG4gICAgICogQG5nZG9jIGV2ZW50XG4gICAgICogQG5hbWUgJHJvdXRlIyRyb3V0ZVVwZGF0ZVxuICAgICAqIEBldmVudFR5cGUgYnJvYWRjYXN0IG9uIHJvb3Qgc2NvcGVcbiAgICAgKiBAZGVzY3JpcHRpb25cbiAgICAgKiBUaGUgYHJlbG9hZE9uU2VhcmNoYCBwcm9wZXJ0eSBoYXMgYmVlbiBzZXQgdG8gZmFsc2UsIGFuZCB3ZSBhcmUgcmV1c2luZyB0aGUgc2FtZVxuICAgICAqIGluc3RhbmNlIG9mIHRoZSBDb250cm9sbGVyLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGFuZ3VsYXJFdmVudCBTeW50aGV0aWMgZXZlbnQgb2JqZWN0XG4gICAgICogQHBhcmFtIHtSb3V0ZX0gY3VycmVudCBDdXJyZW50L3ByZXZpb3VzIHJvdXRlIGluZm9ybWF0aW9uLlxuICAgICAqL1xuXG4gICAgdmFyIGZvcmNlUmVsb2FkID0gZmFsc2UsXG4gICAgICAgIHByZXBhcmVkUm91dGUsXG4gICAgICAgIHByZXBhcmVkUm91dGVJc1VwZGF0ZU9ubHksXG4gICAgICAgICRyb3V0ZSA9IHtcbiAgICAgICAgICByb3V0ZXM6IHJvdXRlcyxcblxuICAgICAgICAgIC8qKlxuICAgICAgICAgICAqIEBuZ2RvYyBtZXRob2RcbiAgICAgICAgICAgKiBAbmFtZSAkcm91dGUjcmVsb2FkXG4gICAgICAgICAgICpcbiAgICAgICAgICAgKiBAZGVzY3JpcHRpb25cbiAgICAgICAgICAgKiBDYXVzZXMgYCRyb3V0ZWAgc2VydmljZSB0byByZWxvYWQgdGhlIGN1cnJlbnQgcm91dGUgZXZlbiBpZlxuICAgICAgICAgICAqIHtAbGluayBuZy4kbG9jYXRpb24gJGxvY2F0aW9ufSBoYXNuJ3QgY2hhbmdlZC5cbiAgICAgICAgICAgKlxuICAgICAgICAgICAqIEFzIGEgcmVzdWx0IG9mIHRoYXQsIHtAbGluayBuZ1JvdXRlLmRpcmVjdGl2ZTpuZ1ZpZXcgbmdWaWV3fVxuICAgICAgICAgICAqIGNyZWF0ZXMgbmV3IHNjb3BlIGFuZCByZWluc3RhbnRpYXRlcyB0aGUgY29udHJvbGxlci5cbiAgICAgICAgICAgKi9cbiAgICAgICAgICByZWxvYWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgZm9yY2VSZWxvYWQgPSB0cnVlO1xuXG4gICAgICAgICAgICB2YXIgZmFrZUxvY2F0aW9uRXZlbnQgPSB7XG4gICAgICAgICAgICAgIGRlZmF1bHRQcmV2ZW50ZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICBwcmV2ZW50RGVmYXVsdDogZnVuY3Rpb24gZmFrZVByZXZlbnREZWZhdWx0KCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGVmYXVsdFByZXZlbnRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgZm9yY2VSZWxvYWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgJHJvb3RTY29wZS4kZXZhbEFzeW5jKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICBwcmVwYXJlUm91dGUoZmFrZUxvY2F0aW9uRXZlbnQpO1xuICAgICAgICAgICAgICBpZiAoIWZha2VMb2NhdGlvbkV2ZW50LmRlZmF1bHRQcmV2ZW50ZWQpIGNvbW1pdFJvdXRlKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9LFxuXG4gICAgICAgICAgLyoqXG4gICAgICAgICAgICogQG5nZG9jIG1ldGhvZFxuICAgICAgICAgICAqIEBuYW1lICRyb3V0ZSN1cGRhdGVQYXJhbXNcbiAgICAgICAgICAgKlxuICAgICAgICAgICAqIEBkZXNjcmlwdGlvblxuICAgICAgICAgICAqIENhdXNlcyBgJHJvdXRlYCBzZXJ2aWNlIHRvIHVwZGF0ZSB0aGUgY3VycmVudCBVUkwsIHJlcGxhY2luZ1xuICAgICAgICAgICAqIGN1cnJlbnQgcm91dGUgcGFyYW1ldGVycyB3aXRoIHRob3NlIHNwZWNpZmllZCBpbiBgbmV3UGFyYW1zYC5cbiAgICAgICAgICAgKiBQcm92aWRlZCBwcm9wZXJ0eSBuYW1lcyB0aGF0IG1hdGNoIHRoZSByb3V0ZSdzIHBhdGggc2VnbWVudFxuICAgICAgICAgICAqIGRlZmluaXRpb25zIHdpbGwgYmUgaW50ZXJwb2xhdGVkIGludG8gdGhlIGxvY2F0aW9uJ3MgcGF0aCwgd2hpbGVcbiAgICAgICAgICAgKiByZW1haW5pbmcgcHJvcGVydGllcyB3aWxsIGJlIHRyZWF0ZWQgYXMgcXVlcnkgcGFyYW1zLlxuICAgICAgICAgICAqXG4gICAgICAgICAgICogQHBhcmFtIHshT2JqZWN0PHN0cmluZywgc3RyaW5nPn0gbmV3UGFyYW1zIG1hcHBpbmcgb2YgVVJMIHBhcmFtZXRlciBuYW1lcyB0byB2YWx1ZXNcbiAgICAgICAgICAgKi9cbiAgICAgICAgICB1cGRhdGVQYXJhbXM6IGZ1bmN0aW9uKG5ld1BhcmFtcykge1xuICAgICAgICAgICAgaWYgKHRoaXMuY3VycmVudCAmJiB0aGlzLmN1cnJlbnQuJCRyb3V0ZSkge1xuICAgICAgICAgICAgICBuZXdQYXJhbXMgPSBhbmd1bGFyLmV4dGVuZCh7fSwgdGhpcy5jdXJyZW50LnBhcmFtcywgbmV3UGFyYW1zKTtcbiAgICAgICAgICAgICAgJGxvY2F0aW9uLnBhdGgoaW50ZXJwb2xhdGUodGhpcy5jdXJyZW50LiQkcm91dGUub3JpZ2luYWxQYXRoLCBuZXdQYXJhbXMpKTtcbiAgICAgICAgICAgICAgLy8gaW50ZXJwb2xhdGUgbW9kaWZpZXMgbmV3UGFyYW1zLCBvbmx5IHF1ZXJ5IHBhcmFtcyBhcmUgbGVmdFxuICAgICAgICAgICAgICAkbG9jYXRpb24uc2VhcmNoKG5ld1BhcmFtcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0aHJvdyAkcm91dGVNaW5FcnIoJ25vcm91dCcsICdUcmllZCB1cGRhdGluZyByb3V0ZSB3aGVuIHdpdGggbm8gY3VycmVudCByb3V0ZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICRyb290U2NvcGUuJG9uKCckbG9jYXRpb25DaGFuZ2VTdGFydCcsIHByZXBhcmVSb3V0ZSk7XG4gICAgJHJvb3RTY29wZS4kb24oJyRsb2NhdGlvbkNoYW5nZVN1Y2Nlc3MnLCBjb21taXRSb3V0ZSk7XG5cbiAgICByZXR1cm4gJHJvdXRlO1xuXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSBvbiB7c3RyaW5nfSBjdXJyZW50IHVybFxuICAgICAqIEBwYXJhbSByb3V0ZSB7T2JqZWN0fSByb3V0ZSByZWdleHAgdG8gbWF0Y2ggdGhlIHVybCBhZ2FpbnN0XG4gICAgICogQHJldHVybiB7P09iamVjdH1cbiAgICAgKlxuICAgICAqIEBkZXNjcmlwdGlvblxuICAgICAqIENoZWNrIGlmIHRoZSByb3V0ZSBtYXRjaGVzIHRoZSBjdXJyZW50IHVybC5cbiAgICAgKlxuICAgICAqIEluc3BpcmVkIGJ5IG1hdGNoIGluXG4gICAgICogdmlzaW9ubWVkaWEvZXhwcmVzcy9saWIvcm91dGVyL3JvdXRlci5qcy5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBzd2l0Y2hSb3V0ZU1hdGNoZXIob24sIHJvdXRlKSB7XG4gICAgICB2YXIga2V5cyA9IHJvdXRlLmtleXMsXG4gICAgICAgICAgcGFyYW1zID0ge307XG5cbiAgICAgIGlmICghcm91dGUucmVnZXhwKSByZXR1cm4gbnVsbDtcblxuICAgICAgdmFyIG0gPSByb3V0ZS5yZWdleHAuZXhlYyhvbik7XG4gICAgICBpZiAoIW0pIHJldHVybiBudWxsO1xuXG4gICAgICBmb3IgKHZhciBpID0gMSwgbGVuID0gbS5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICAgICAgICB2YXIga2V5ID0ga2V5c1tpIC0gMV07XG5cbiAgICAgICAgdmFyIHZhbCA9IG1baV07XG5cbiAgICAgICAgaWYgKGtleSAmJiB2YWwpIHtcbiAgICAgICAgICBwYXJhbXNba2V5Lm5hbWVdID0gdmFsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcGFyYW1zO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHByZXBhcmVSb3V0ZSgkbG9jYXRpb25FdmVudCkge1xuICAgICAgdmFyIGxhc3RSb3V0ZSA9ICRyb3V0ZS5jdXJyZW50O1xuXG4gICAgICBwcmVwYXJlZFJvdXRlID0gcGFyc2VSb3V0ZSgpO1xuICAgICAgcHJlcGFyZWRSb3V0ZUlzVXBkYXRlT25seSA9IHByZXBhcmVkUm91dGUgJiYgbGFzdFJvdXRlICYmIHByZXBhcmVkUm91dGUuJCRyb3V0ZSA9PT0gbGFzdFJvdXRlLiQkcm91dGVcbiAgICAgICAgICAmJiBhbmd1bGFyLmVxdWFscyhwcmVwYXJlZFJvdXRlLnBhdGhQYXJhbXMsIGxhc3RSb3V0ZS5wYXRoUGFyYW1zKVxuICAgICAgICAgICYmICFwcmVwYXJlZFJvdXRlLnJlbG9hZE9uU2VhcmNoICYmICFmb3JjZVJlbG9hZDtcblxuICAgICAgaWYgKCFwcmVwYXJlZFJvdXRlSXNVcGRhdGVPbmx5ICYmIChsYXN0Um91dGUgfHwgcHJlcGFyZWRSb3V0ZSkpIHtcbiAgICAgICAgaWYgKCRyb290U2NvcGUuJGJyb2FkY2FzdCgnJHJvdXRlQ2hhbmdlU3RhcnQnLCBwcmVwYXJlZFJvdXRlLCBsYXN0Um91dGUpLmRlZmF1bHRQcmV2ZW50ZWQpIHtcbiAgICAgICAgICBpZiAoJGxvY2F0aW9uRXZlbnQpIHtcbiAgICAgICAgICAgICRsb2NhdGlvbkV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY29tbWl0Um91dGUoKSB7XG4gICAgICB2YXIgbGFzdFJvdXRlID0gJHJvdXRlLmN1cnJlbnQ7XG4gICAgICB2YXIgbmV4dFJvdXRlID0gcHJlcGFyZWRSb3V0ZTtcblxuICAgICAgaWYgKHByZXBhcmVkUm91dGVJc1VwZGF0ZU9ubHkpIHtcbiAgICAgICAgbGFzdFJvdXRlLnBhcmFtcyA9IG5leHRSb3V0ZS5wYXJhbXM7XG4gICAgICAgIGFuZ3VsYXIuY29weShsYXN0Um91dGUucGFyYW1zLCAkcm91dGVQYXJhbXMpO1xuICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJyRyb3V0ZVVwZGF0ZScsIGxhc3RSb3V0ZSk7XG4gICAgICB9IGVsc2UgaWYgKG5leHRSb3V0ZSB8fCBsYXN0Um91dGUpIHtcbiAgICAgICAgZm9yY2VSZWxvYWQgPSBmYWxzZTtcbiAgICAgICAgJHJvdXRlLmN1cnJlbnQgPSBuZXh0Um91dGU7XG4gICAgICAgIGlmIChuZXh0Um91dGUpIHtcbiAgICAgICAgICBpZiAobmV4dFJvdXRlLnJlZGlyZWN0VG8pIHtcbiAgICAgICAgICAgIGlmIChhbmd1bGFyLmlzU3RyaW5nKG5leHRSb3V0ZS5yZWRpcmVjdFRvKSkge1xuICAgICAgICAgICAgICAkbG9jYXRpb24ucGF0aChpbnRlcnBvbGF0ZShuZXh0Um91dGUucmVkaXJlY3RUbywgbmV4dFJvdXRlLnBhcmFtcykpLnNlYXJjaChuZXh0Um91dGUucGFyYW1zKVxuICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgJGxvY2F0aW9uLnVybChuZXh0Um91dGUucmVkaXJlY3RUbyhuZXh0Um91dGUucGF0aFBhcmFtcywgJGxvY2F0aW9uLnBhdGgoKSwgJGxvY2F0aW9uLnNlYXJjaCgpKSlcbiAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAkcS53aGVuKG5leHRSb3V0ZSkuXG4gICAgICAgICAgdGhlbihyZXNvbHZlTG9jYWxzKS5cbiAgICAgICAgICB0aGVuKGZ1bmN0aW9uKGxvY2Fscykge1xuICAgICAgICAgICAgLy8gYWZ0ZXIgcm91dGUgY2hhbmdlXG4gICAgICAgICAgICBpZiAobmV4dFJvdXRlID09ICRyb3V0ZS5jdXJyZW50KSB7XG4gICAgICAgICAgICAgIGlmIChuZXh0Um91dGUpIHtcbiAgICAgICAgICAgICAgICBuZXh0Um91dGUubG9jYWxzID0gbG9jYWxzO1xuICAgICAgICAgICAgICAgIGFuZ3VsYXIuY29weShuZXh0Um91dGUucGFyYW1zLCAkcm91dGVQYXJhbXMpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnJHJvdXRlQ2hhbmdlU3VjY2VzcycsIG5leHRSb3V0ZSwgbGFzdFJvdXRlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LCBmdW5jdGlvbihlcnJvcikge1xuICAgICAgICAgICAgaWYgKG5leHRSb3V0ZSA9PSAkcm91dGUuY3VycmVudCkge1xuICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJyRyb3V0ZUNoYW5nZUVycm9yJywgbmV4dFJvdXRlLCBsYXN0Um91dGUsIGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZXNvbHZlTG9jYWxzKHJvdXRlKSB7XG4gICAgICBpZiAocm91dGUpIHtcbiAgICAgICAgdmFyIGxvY2FscyA9IGFuZ3VsYXIuZXh0ZW5kKHt9LCByb3V0ZS5yZXNvbHZlKTtcbiAgICAgICAgYW5ndWxhci5mb3JFYWNoKGxvY2FscywgZnVuY3Rpb24odmFsdWUsIGtleSkge1xuICAgICAgICAgIGxvY2Fsc1trZXldID0gYW5ndWxhci5pc1N0cmluZyh2YWx1ZSkgP1xuICAgICAgICAgICAgICAkaW5qZWN0b3IuZ2V0KHZhbHVlKSA6XG4gICAgICAgICAgICAgICRpbmplY3Rvci5pbnZva2UodmFsdWUsIG51bGwsIG51bGwsIGtleSk7XG4gICAgICAgIH0pO1xuICAgICAgICB2YXIgdGVtcGxhdGUgPSBnZXRUZW1wbGF0ZUZvcihyb3V0ZSk7XG4gICAgICAgIGlmIChhbmd1bGFyLmlzRGVmaW5lZCh0ZW1wbGF0ZSkpIHtcbiAgICAgICAgICBsb2NhbHNbJyR0ZW1wbGF0ZSddID0gdGVtcGxhdGU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICRxLmFsbChsb2NhbHMpO1xuICAgICAgfVxuICAgIH1cblxuXG4gICAgZnVuY3Rpb24gZ2V0VGVtcGxhdGVGb3Iocm91dGUpIHtcbiAgICAgIHZhciB0ZW1wbGF0ZSwgdGVtcGxhdGVVcmw7XG4gICAgICBpZiAoYW5ndWxhci5pc0RlZmluZWQodGVtcGxhdGUgPSByb3V0ZS50ZW1wbGF0ZSkpIHtcbiAgICAgICAgaWYgKGFuZ3VsYXIuaXNGdW5jdGlvbih0ZW1wbGF0ZSkpIHtcbiAgICAgICAgICB0ZW1wbGF0ZSA9IHRlbXBsYXRlKHJvdXRlLnBhcmFtcyk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoYW5ndWxhci5pc0RlZmluZWQodGVtcGxhdGVVcmwgPSByb3V0ZS50ZW1wbGF0ZVVybCkpIHtcbiAgICAgICAgaWYgKGFuZ3VsYXIuaXNGdW5jdGlvbih0ZW1wbGF0ZVVybCkpIHtcbiAgICAgICAgICB0ZW1wbGF0ZVVybCA9IHRlbXBsYXRlVXJsKHJvdXRlLnBhcmFtcyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFuZ3VsYXIuaXNEZWZpbmVkKHRlbXBsYXRlVXJsKSkge1xuICAgICAgICAgIHJvdXRlLmxvYWRlZFRlbXBsYXRlVXJsID0gJHNjZS52YWx1ZU9mKHRlbXBsYXRlVXJsKTtcbiAgICAgICAgICB0ZW1wbGF0ZSA9ICR0ZW1wbGF0ZVJlcXVlc3QodGVtcGxhdGVVcmwpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdGVtcGxhdGU7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSB0aGUgY3VycmVudCBhY3RpdmUgcm91dGUsIGJ5IG1hdGNoaW5nIGl0IGFnYWluc3QgdGhlIFVSTFxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHBhcnNlUm91dGUoKSB7XG4gICAgICAvLyBNYXRjaCBhIHJvdXRlXG4gICAgICB2YXIgcGFyYW1zLCBtYXRjaDtcbiAgICAgIGFuZ3VsYXIuZm9yRWFjaChyb3V0ZXMsIGZ1bmN0aW9uKHJvdXRlLCBwYXRoKSB7XG4gICAgICAgIGlmICghbWF0Y2ggJiYgKHBhcmFtcyA9IHN3aXRjaFJvdXRlTWF0Y2hlcigkbG9jYXRpb24ucGF0aCgpLCByb3V0ZSkpKSB7XG4gICAgICAgICAgbWF0Y2ggPSBpbmhlcml0KHJvdXRlLCB7XG4gICAgICAgICAgICBwYXJhbXM6IGFuZ3VsYXIuZXh0ZW5kKHt9LCAkbG9jYXRpb24uc2VhcmNoKCksIHBhcmFtcyksXG4gICAgICAgICAgICBwYXRoUGFyYW1zOiBwYXJhbXN9KTtcbiAgICAgICAgICBtYXRjaC4kJHJvdXRlID0gcm91dGU7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgLy8gTm8gcm91dGUgbWF0Y2hlZDsgZmFsbGJhY2sgdG8gXCJvdGhlcndpc2VcIiByb3V0ZVxuICAgICAgcmV0dXJuIG1hdGNoIHx8IHJvdXRlc1tudWxsXSAmJiBpbmhlcml0KHJvdXRlc1tudWxsXSwge3BhcmFtczoge30sIHBhdGhQYXJhbXM6e319KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBpbnRlcnBvbGF0aW9uIG9mIHRoZSByZWRpcmVjdCBwYXRoIHdpdGggdGhlIHBhcmFtZXRlcnNcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBpbnRlcnBvbGF0ZShzdHJpbmcsIHBhcmFtcykge1xuICAgICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgICAgYW5ndWxhci5mb3JFYWNoKChzdHJpbmcgfHwgJycpLnNwbGl0KCc6JyksIGZ1bmN0aW9uKHNlZ21lbnQsIGkpIHtcbiAgICAgICAgaWYgKGkgPT09IDApIHtcbiAgICAgICAgICByZXN1bHQucHVzaChzZWdtZW50KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YXIgc2VnbWVudE1hdGNoID0gc2VnbWVudC5tYXRjaCgvKFxcdyspKD86Wz8qXSk/KC4qKS8pO1xuICAgICAgICAgIHZhciBrZXkgPSBzZWdtZW50TWF0Y2hbMV07XG4gICAgICAgICAgcmVzdWx0LnB1c2gocGFyYW1zW2tleV0pO1xuICAgICAgICAgIHJlc3VsdC5wdXNoKHNlZ21lbnRNYXRjaFsyXSB8fCAnJyk7XG4gICAgICAgICAgZGVsZXRlIHBhcmFtc1trZXldO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiByZXN1bHQuam9pbignJyk7XG4gICAgfVxuICB9XTtcbn1cblxubmdSb3V0ZU1vZHVsZS5wcm92aWRlcignJHJvdXRlUGFyYW1zJywgJFJvdXRlUGFyYW1zUHJvdmlkZXIpO1xuXG5cbi8qKlxuICogQG5nZG9jIHNlcnZpY2VcbiAqIEBuYW1lICRyb3V0ZVBhcmFtc1xuICogQHJlcXVpcmVzICRyb3V0ZVxuICpcbiAqIEBkZXNjcmlwdGlvblxuICogVGhlIGAkcm91dGVQYXJhbXNgIHNlcnZpY2UgYWxsb3dzIHlvdSB0byByZXRyaWV2ZSB0aGUgY3VycmVudCBzZXQgb2Ygcm91dGUgcGFyYW1ldGVycy5cbiAqXG4gKiBSZXF1aXJlcyB0aGUge0BsaW5rIG5nUm91dGUgYG5nUm91dGVgfSBtb2R1bGUgdG8gYmUgaW5zdGFsbGVkLlxuICpcbiAqIFRoZSByb3V0ZSBwYXJhbWV0ZXJzIGFyZSBhIGNvbWJpbmF0aW9uIG9mIHtAbGluayBuZy4kbG9jYXRpb24gYCRsb2NhdGlvbmB9J3NcbiAqIHtAbGluayBuZy4kbG9jYXRpb24jc2VhcmNoIGBzZWFyY2goKWB9IGFuZCB7QGxpbmsgbmcuJGxvY2F0aW9uI3BhdGggYHBhdGgoKWB9LlxuICogVGhlIGBwYXRoYCBwYXJhbWV0ZXJzIGFyZSBleHRyYWN0ZWQgd2hlbiB0aGUge0BsaW5rIG5nUm91dGUuJHJvdXRlIGAkcm91dGVgfSBwYXRoIGlzIG1hdGNoZWQuXG4gKlxuICogSW4gY2FzZSBvZiBwYXJhbWV0ZXIgbmFtZSBjb2xsaXNpb24sIGBwYXRoYCBwYXJhbXMgdGFrZSBwcmVjZWRlbmNlIG92ZXIgYHNlYXJjaGAgcGFyYW1zLlxuICpcbiAqIFRoZSBzZXJ2aWNlIGd1YXJhbnRlZXMgdGhhdCB0aGUgaWRlbnRpdHkgb2YgdGhlIGAkcm91dGVQYXJhbXNgIG9iamVjdCB3aWxsIHJlbWFpbiB1bmNoYW5nZWRcbiAqIChidXQgaXRzIHByb3BlcnRpZXMgd2lsbCBsaWtlbHkgY2hhbmdlKSBldmVuIHdoZW4gYSByb3V0ZSBjaGFuZ2Ugb2NjdXJzLlxuICpcbiAqIE5vdGUgdGhhdCB0aGUgYCRyb3V0ZVBhcmFtc2AgYXJlIG9ubHkgdXBkYXRlZCAqYWZ0ZXIqIGEgcm91dGUgY2hhbmdlIGNvbXBsZXRlcyBzdWNjZXNzZnVsbHkuXG4gKiBUaGlzIG1lYW5zIHRoYXQgeW91IGNhbm5vdCByZWx5IG9uIGAkcm91dGVQYXJhbXNgIGJlaW5nIGNvcnJlY3QgaW4gcm91dGUgcmVzb2x2ZSBmdW5jdGlvbnMuXG4gKiBJbnN0ZWFkIHlvdSBjYW4gdXNlIGAkcm91dGUuY3VycmVudC5wYXJhbXNgIHRvIGFjY2VzcyB0aGUgbmV3IHJvdXRlJ3MgcGFyYW1ldGVycy5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBganNcbiAqICAvLyBHaXZlbjpcbiAqICAvLyBVUkw6IGh0dHA6Ly9zZXJ2ZXIuY29tL2luZGV4Lmh0bWwjL0NoYXB0ZXIvMS9TZWN0aW9uLzI/c2VhcmNoPW1vYnlcbiAqICAvLyBSb3V0ZTogL0NoYXB0ZXIvOmNoYXB0ZXJJZC9TZWN0aW9uLzpzZWN0aW9uSWRcbiAqICAvL1xuICogIC8vIFRoZW5cbiAqICAkcm91dGVQYXJhbXMgPT0+IHtjaGFwdGVySWQ6JzEnLCBzZWN0aW9uSWQ6JzInLCBzZWFyY2g6J21vYnknfVxuICogYGBgXG4gKi9cbmZ1bmN0aW9uICRSb3V0ZVBhcmFtc1Byb3ZpZGVyKCkge1xuICB0aGlzLiRnZXQgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHt9OyB9O1xufVxuXG5uZ1JvdXRlTW9kdWxlLmRpcmVjdGl2ZSgnbmdWaWV3JywgbmdWaWV3RmFjdG9yeSk7XG5uZ1JvdXRlTW9kdWxlLmRpcmVjdGl2ZSgnbmdWaWV3JywgbmdWaWV3RmlsbENvbnRlbnRGYWN0b3J5KTtcblxuXG4vKipcbiAqIEBuZ2RvYyBkaXJlY3RpdmVcbiAqIEBuYW1lIG5nVmlld1xuICogQHJlc3RyaWN0IEVDQVxuICpcbiAqIEBkZXNjcmlwdGlvblxuICogIyBPdmVydmlld1xuICogYG5nVmlld2AgaXMgYSBkaXJlY3RpdmUgdGhhdCBjb21wbGVtZW50cyB0aGUge0BsaW5rIG5nUm91dGUuJHJvdXRlICRyb3V0ZX0gc2VydmljZSBieVxuICogaW5jbHVkaW5nIHRoZSByZW5kZXJlZCB0ZW1wbGF0ZSBvZiB0aGUgY3VycmVudCByb3V0ZSBpbnRvIHRoZSBtYWluIGxheW91dCAoYGluZGV4Lmh0bWxgKSBmaWxlLlxuICogRXZlcnkgdGltZSB0aGUgY3VycmVudCByb3V0ZSBjaGFuZ2VzLCB0aGUgaW5jbHVkZWQgdmlldyBjaGFuZ2VzIHdpdGggaXQgYWNjb3JkaW5nIHRvIHRoZVxuICogY29uZmlndXJhdGlvbiBvZiB0aGUgYCRyb3V0ZWAgc2VydmljZS5cbiAqXG4gKiBSZXF1aXJlcyB0aGUge0BsaW5rIG5nUm91dGUgYG5nUm91dGVgfSBtb2R1bGUgdG8gYmUgaW5zdGFsbGVkLlxuICpcbiAqIEBhbmltYXRpb25zXG4gKiB8IEFuaW1hdGlvbiAgICAgICAgICAgICAgICAgICAgICAgIHwgT2NjdXJzICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogfC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS18LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLXxcbiAqIHwge0BsaW5rIG5nLiRhbmltYXRlI2VudGVyIGVudGVyfSAgfCB3aGVuIHRoZSBuZXcgZWxlbWVudCBpcyBpbnNlcnRlZCB0byB0aGUgRE9NIHxcbiAqIHwge0BsaW5rIG5nLiRhbmltYXRlI2xlYXZlIGxlYXZlfSAgfCB3aGVuIHRoZSBvbGQgZWxlbWVudCBpcyByZW1vdmVkIGZyb20gdG8gdGhlIERPTSAgfFxuICpcbiAqIFRoZSBlbnRlciBhbmQgbGVhdmUgYW5pbWF0aW9uIG9jY3VyIGNvbmN1cnJlbnRseS5cbiAqXG4gKiBAa25vd25Jc3N1ZSBJZiBgbmdWaWV3YCBpcyBjb250YWluZWQgaW4gYW4gYXN5bmNocm9ub3VzbHkgbG9hZGVkIHRlbXBsYXRlIChlLmcuIGluIGFub3RoZXJcbiAqICAgICAgICAgICAgIGRpcmVjdGl2ZSdzIHRlbXBsYXRlVXJsIG9yIGluIGEgdGVtcGxhdGUgbG9hZGVkIHVzaW5nIGBuZ0luY2x1ZGVgKSwgdGhlbiB5b3UgbmVlZCB0b1xuICogICAgICAgICAgICAgbWFrZSBzdXJlIHRoYXQgYCRyb3V0ZWAgaXMgaW5zdGFudGlhdGVkIGluIHRpbWUgdG8gY2FwdHVyZSB0aGUgaW5pdGlhbFxuICogICAgICAgICAgICAgYCRsb2NhdGlvbkNoYW5nZVN0YXJ0YCBldmVudCBhbmQgbG9hZCB0aGUgYXBwcm9wcmlhdGUgdmlldy4gT25lIHdheSB0byBhY2hpZXZlIHRoaXNcbiAqICAgICAgICAgICAgIGlzIHRvIGhhdmUgaXQgYXMgYSBkZXBlbmRlbmN5IGluIGEgYC5ydW5gIGJsb2NrOlxuICogICAgICAgICAgICAgYG15TW9kdWxlLnJ1bihbJyRyb3V0ZScsIGZ1bmN0aW9uKCkge31dKTtgXG4gKlxuICogQHNjb3BlXG4gKiBAcHJpb3JpdHkgNDAwXG4gKiBAcGFyYW0ge3N0cmluZz19IG9ubG9hZCBFeHByZXNzaW9uIHRvIGV2YWx1YXRlIHdoZW5ldmVyIHRoZSB2aWV3IHVwZGF0ZXMuXG4gKlxuICogQHBhcmFtIHtzdHJpbmc9fSBhdXRvc2Nyb2xsIFdoZXRoZXIgYG5nVmlld2Agc2hvdWxkIGNhbGwge0BsaW5rIG5nLiRhbmNob3JTY3JvbGxcbiAqICAgICAgICAgICAgICAgICAgJGFuY2hvclNjcm9sbH0gdG8gc2Nyb2xsIHRoZSB2aWV3cG9ydCBhZnRlciB0aGUgdmlldyBpcyB1cGRhdGVkLlxuICpcbiAqICAgICAgICAgICAgICAgICAgLSBJZiB0aGUgYXR0cmlidXRlIGlzIG5vdCBzZXQsIGRpc2FibGUgc2Nyb2xsaW5nLlxuICogICAgICAgICAgICAgICAgICAtIElmIHRoZSBhdHRyaWJ1dGUgaXMgc2V0IHdpdGhvdXQgdmFsdWUsIGVuYWJsZSBzY3JvbGxpbmcuXG4gKiAgICAgICAgICAgICAgICAgIC0gT3RoZXJ3aXNlIGVuYWJsZSBzY3JvbGxpbmcgb25seSBpZiB0aGUgYGF1dG9zY3JvbGxgIGF0dHJpYnV0ZSB2YWx1ZSBldmFsdWF0ZWRcbiAqICAgICAgICAgICAgICAgICAgICBhcyBhbiBleHByZXNzaW9uIHlpZWxkcyBhIHRydXRoeSB2YWx1ZS5cbiAqIEBleGFtcGxlXG4gICAgPGV4YW1wbGUgbmFtZT1cIm5nVmlldy1kaXJlY3RpdmVcIiBtb2R1bGU9XCJuZ1ZpZXdFeGFtcGxlXCJcbiAgICAgICAgICAgICBkZXBzPVwiYW5ndWxhci1yb3V0ZS5qczthbmd1bGFyLWFuaW1hdGUuanNcIlxuICAgICAgICAgICAgIGFuaW1hdGlvbnM9XCJ0cnVlXCIgZml4QmFzZT1cInRydWVcIj5cbiAgICAgIDxmaWxlIG5hbWU9XCJpbmRleC5odG1sXCI+XG4gICAgICAgIDxkaXYgbmctY29udHJvbGxlcj1cIk1haW5DdHJsIGFzIG1haW5cIj5cbiAgICAgICAgICBDaG9vc2U6XG4gICAgICAgICAgPGEgaHJlZj1cIkJvb2svTW9ieVwiPk1vYnk8L2E+IHxcbiAgICAgICAgICA8YSBocmVmPVwiQm9vay9Nb2J5L2NoLzFcIj5Nb2J5OiBDaDE8L2E+IHxcbiAgICAgICAgICA8YSBocmVmPVwiQm9vay9HYXRzYnlcIj5HYXRzYnk8L2E+IHxcbiAgICAgICAgICA8YSBocmVmPVwiQm9vay9HYXRzYnkvY2gvND9rZXk9dmFsdWVcIj5HYXRzYnk6IENoNDwvYT4gfFxuICAgICAgICAgIDxhIGhyZWY9XCJCb29rL1NjYXJsZXRcIj5TY2FybGV0IExldHRlcjwvYT48YnIvPlxuXG4gICAgICAgICAgPGRpdiBjbGFzcz1cInZpZXctYW5pbWF0ZS1jb250YWluZXJcIj5cbiAgICAgICAgICAgIDxkaXYgbmctdmlldyBjbGFzcz1cInZpZXctYW5pbWF0ZVwiPjwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxociAvPlxuXG4gICAgICAgICAgPHByZT4kbG9jYXRpb24ucGF0aCgpID0ge3ttYWluLiRsb2NhdGlvbi5wYXRoKCl9fTwvcHJlPlxuICAgICAgICAgIDxwcmU+JHJvdXRlLmN1cnJlbnQudGVtcGxhdGVVcmwgPSB7e21haW4uJHJvdXRlLmN1cnJlbnQudGVtcGxhdGVVcmx9fTwvcHJlPlxuICAgICAgICAgIDxwcmU+JHJvdXRlLmN1cnJlbnQucGFyYW1zID0ge3ttYWluLiRyb3V0ZS5jdXJyZW50LnBhcmFtc319PC9wcmU+XG4gICAgICAgICAgPHByZT4kcm91dGVQYXJhbXMgPSB7e21haW4uJHJvdXRlUGFyYW1zfX08L3ByZT5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2ZpbGU+XG5cbiAgICAgIDxmaWxlIG5hbWU9XCJib29rLmh0bWxcIj5cbiAgICAgICAgPGRpdj5cbiAgICAgICAgICBjb250cm9sbGVyOiB7e2Jvb2submFtZX19PGJyIC8+XG4gICAgICAgICAgQm9vayBJZDoge3tib29rLnBhcmFtcy5ib29rSWR9fTxiciAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZmlsZT5cblxuICAgICAgPGZpbGUgbmFtZT1cImNoYXB0ZXIuaHRtbFwiPlxuICAgICAgICA8ZGl2PlxuICAgICAgICAgIGNvbnRyb2xsZXI6IHt7Y2hhcHRlci5uYW1lfX08YnIgLz5cbiAgICAgICAgICBCb29rIElkOiB7e2NoYXB0ZXIucGFyYW1zLmJvb2tJZH19PGJyIC8+XG4gICAgICAgICAgQ2hhcHRlciBJZDoge3tjaGFwdGVyLnBhcmFtcy5jaGFwdGVySWR9fVxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZmlsZT5cblxuICAgICAgPGZpbGUgbmFtZT1cImFuaW1hdGlvbnMuY3NzXCI+XG4gICAgICAgIC52aWV3LWFuaW1hdGUtY29udGFpbmVyIHtcbiAgICAgICAgICBwb3NpdGlvbjpyZWxhdGl2ZTtcbiAgICAgICAgICBoZWlnaHQ6MTAwcHghaW1wb3J0YW50O1xuICAgICAgICAgIGJhY2tncm91bmQ6d2hpdGU7XG4gICAgICAgICAgYm9yZGVyOjFweCBzb2xpZCBibGFjaztcbiAgICAgICAgICBoZWlnaHQ6NDBweDtcbiAgICAgICAgICBvdmVyZmxvdzpoaWRkZW47XG4gICAgICAgIH1cblxuICAgICAgICAudmlldy1hbmltYXRlIHtcbiAgICAgICAgICBwYWRkaW5nOjEwcHg7XG4gICAgICAgIH1cblxuICAgICAgICAudmlldy1hbmltYXRlLm5nLWVudGVyLCAudmlldy1hbmltYXRlLm5nLWxlYXZlIHtcbiAgICAgICAgICB0cmFuc2l0aW9uOmFsbCBjdWJpYy1iZXppZXIoMC4yNTAsIDAuNDYwLCAwLjQ1MCwgMC45NDApIDEuNXM7XG5cbiAgICAgICAgICBkaXNwbGF5OmJsb2NrO1xuICAgICAgICAgIHdpZHRoOjEwMCU7XG4gICAgICAgICAgYm9yZGVyLWxlZnQ6MXB4IHNvbGlkIGJsYWNrO1xuXG4gICAgICAgICAgcG9zaXRpb246YWJzb2x1dGU7XG4gICAgICAgICAgdG9wOjA7XG4gICAgICAgICAgbGVmdDowO1xuICAgICAgICAgIHJpZ2h0OjA7XG4gICAgICAgICAgYm90dG9tOjA7XG4gICAgICAgICAgcGFkZGluZzoxMHB4O1xuICAgICAgICB9XG5cbiAgICAgICAgLnZpZXctYW5pbWF0ZS5uZy1lbnRlciB7XG4gICAgICAgICAgbGVmdDoxMDAlO1xuICAgICAgICB9XG4gICAgICAgIC52aWV3LWFuaW1hdGUubmctZW50ZXIubmctZW50ZXItYWN0aXZlIHtcbiAgICAgICAgICBsZWZ0OjA7XG4gICAgICAgIH1cbiAgICAgICAgLnZpZXctYW5pbWF0ZS5uZy1sZWF2ZS5uZy1sZWF2ZS1hY3RpdmUge1xuICAgICAgICAgIGxlZnQ6LTEwMCU7XG4gICAgICAgIH1cbiAgICAgIDwvZmlsZT5cblxuICAgICAgPGZpbGUgbmFtZT1cInNjcmlwdC5qc1wiPlxuICAgICAgICBhbmd1bGFyLm1vZHVsZSgnbmdWaWV3RXhhbXBsZScsIFsnbmdSb3V0ZScsICduZ0FuaW1hdGUnXSlcbiAgICAgICAgICAuY29uZmlnKFsnJHJvdXRlUHJvdmlkZXInLCAnJGxvY2F0aW9uUHJvdmlkZXInLFxuICAgICAgICAgICAgZnVuY3Rpb24oJHJvdXRlUHJvdmlkZXIsICRsb2NhdGlvblByb3ZpZGVyKSB7XG4gICAgICAgICAgICAgICRyb3V0ZVByb3ZpZGVyXG4gICAgICAgICAgICAgICAgLndoZW4oJy9Cb29rLzpib29rSWQnLCB7XG4gICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2Jvb2suaHRtbCcsXG4gICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnQm9va0N0cmwnLFxuICAgICAgICAgICAgICAgICAgY29udHJvbGxlckFzOiAnYm9vaydcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC53aGVuKCcvQm9vay86Ym9va0lkL2NoLzpjaGFwdGVySWQnLCB7XG4gICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2NoYXB0ZXIuaHRtbCcsXG4gICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnQ2hhcHRlckN0cmwnLFxuICAgICAgICAgICAgICAgICAgY29udHJvbGxlckFzOiAnY2hhcHRlcidcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAkbG9jYXRpb25Qcm92aWRlci5odG1sNU1vZGUodHJ1ZSk7XG4gICAgICAgICAgfV0pXG4gICAgICAgICAgLmNvbnRyb2xsZXIoJ01haW5DdHJsJywgWyckcm91dGUnLCAnJHJvdXRlUGFyYW1zJywgJyRsb2NhdGlvbicsXG4gICAgICAgICAgICBmdW5jdGlvbigkcm91dGUsICRyb3V0ZVBhcmFtcywgJGxvY2F0aW9uKSB7XG4gICAgICAgICAgICAgIHRoaXMuJHJvdXRlID0gJHJvdXRlO1xuICAgICAgICAgICAgICB0aGlzLiRsb2NhdGlvbiA9ICRsb2NhdGlvbjtcbiAgICAgICAgICAgICAgdGhpcy4kcm91dGVQYXJhbXMgPSAkcm91dGVQYXJhbXM7XG4gICAgICAgICAgfV0pXG4gICAgICAgICAgLmNvbnRyb2xsZXIoJ0Jvb2tDdHJsJywgWyckcm91dGVQYXJhbXMnLCBmdW5jdGlvbigkcm91dGVQYXJhbXMpIHtcbiAgICAgICAgICAgIHRoaXMubmFtZSA9IFwiQm9va0N0cmxcIjtcbiAgICAgICAgICAgIHRoaXMucGFyYW1zID0gJHJvdXRlUGFyYW1zO1xuICAgICAgICAgIH1dKVxuICAgICAgICAgIC5jb250cm9sbGVyKCdDaGFwdGVyQ3RybCcsIFsnJHJvdXRlUGFyYW1zJywgZnVuY3Rpb24oJHJvdXRlUGFyYW1zKSB7XG4gICAgICAgICAgICB0aGlzLm5hbWUgPSBcIkNoYXB0ZXJDdHJsXCI7XG4gICAgICAgICAgICB0aGlzLnBhcmFtcyA9ICRyb3V0ZVBhcmFtcztcbiAgICAgICAgICB9XSk7XG5cbiAgICAgIDwvZmlsZT5cblxuICAgICAgPGZpbGUgbmFtZT1cInByb3RyYWN0b3IuanNcIiB0eXBlPVwicHJvdHJhY3RvclwiPlxuICAgICAgICBpdCgnc2hvdWxkIGxvYWQgYW5kIGNvbXBpbGUgY29ycmVjdCB0ZW1wbGF0ZScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGVsZW1lbnQoYnkubGlua1RleHQoJ01vYnk6IENoMScpKS5jbGljaygpO1xuICAgICAgICAgIHZhciBjb250ZW50ID0gZWxlbWVudChieS5jc3MoJ1tuZy12aWV3XScpKS5nZXRUZXh0KCk7XG4gICAgICAgICAgZXhwZWN0KGNvbnRlbnQpLnRvTWF0Y2goL2NvbnRyb2xsZXJcXDogQ2hhcHRlckN0cmwvKTtcbiAgICAgICAgICBleHBlY3QoY29udGVudCkudG9NYXRjaCgvQm9vayBJZFxcOiBNb2J5Lyk7XG4gICAgICAgICAgZXhwZWN0KGNvbnRlbnQpLnRvTWF0Y2goL0NoYXB0ZXIgSWRcXDogMS8pO1xuXG4gICAgICAgICAgZWxlbWVudChieS5wYXJ0aWFsTGlua1RleHQoJ1NjYXJsZXQnKSkuY2xpY2soKTtcblxuICAgICAgICAgIGNvbnRlbnQgPSBlbGVtZW50KGJ5LmNzcygnW25nLXZpZXddJykpLmdldFRleHQoKTtcbiAgICAgICAgICBleHBlY3QoY29udGVudCkudG9NYXRjaCgvY29udHJvbGxlclxcOiBCb29rQ3RybC8pO1xuICAgICAgICAgIGV4cGVjdChjb250ZW50KS50b01hdGNoKC9Cb29rIElkXFw6IFNjYXJsZXQvKTtcbiAgICAgICAgfSk7XG4gICAgICA8L2ZpbGU+XG4gICAgPC9leGFtcGxlPlxuICovXG5cblxuLyoqXG4gKiBAbmdkb2MgZXZlbnRcbiAqIEBuYW1lIG5nVmlldyMkdmlld0NvbnRlbnRMb2FkZWRcbiAqIEBldmVudFR5cGUgZW1pdCBvbiB0aGUgY3VycmVudCBuZ1ZpZXcgc2NvcGVcbiAqIEBkZXNjcmlwdGlvblxuICogRW1pdHRlZCBldmVyeSB0aW1lIHRoZSBuZ1ZpZXcgY29udGVudCBpcyByZWxvYWRlZC5cbiAqL1xubmdWaWV3RmFjdG9yeS4kaW5qZWN0ID0gWyckcm91dGUnLCAnJGFuY2hvclNjcm9sbCcsICckYW5pbWF0ZSddO1xuZnVuY3Rpb24gbmdWaWV3RmFjdG9yeSgkcm91dGUsICRhbmNob3JTY3JvbGwsICRhbmltYXRlKSB7XG4gIHJldHVybiB7XG4gICAgcmVzdHJpY3Q6ICdFQ0EnLFxuICAgIHRlcm1pbmFsOiB0cnVlLFxuICAgIHByaW9yaXR5OiA0MDAsXG4gICAgdHJhbnNjbHVkZTogJ2VsZW1lbnQnLFxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCAkZWxlbWVudCwgYXR0ciwgY3RybCwgJHRyYW5zY2x1ZGUpIHtcbiAgICAgICAgdmFyIGN1cnJlbnRTY29wZSxcbiAgICAgICAgICAgIGN1cnJlbnRFbGVtZW50LFxuICAgICAgICAgICAgcHJldmlvdXNMZWF2ZUFuaW1hdGlvbixcbiAgICAgICAgICAgIGF1dG9TY3JvbGxFeHAgPSBhdHRyLmF1dG9zY3JvbGwsXG4gICAgICAgICAgICBvbmxvYWRFeHAgPSBhdHRyLm9ubG9hZCB8fCAnJztcblxuICAgICAgICBzY29wZS4kb24oJyRyb3V0ZUNoYW5nZVN1Y2Nlc3MnLCB1cGRhdGUpO1xuICAgICAgICB1cGRhdGUoKTtcblxuICAgICAgICBmdW5jdGlvbiBjbGVhbnVwTGFzdFZpZXcoKSB7XG4gICAgICAgICAgaWYgKHByZXZpb3VzTGVhdmVBbmltYXRpb24pIHtcbiAgICAgICAgICAgICRhbmltYXRlLmNhbmNlbChwcmV2aW91c0xlYXZlQW5pbWF0aW9uKTtcbiAgICAgICAgICAgIHByZXZpb3VzTGVhdmVBbmltYXRpb24gPSBudWxsO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChjdXJyZW50U2NvcGUpIHtcbiAgICAgICAgICAgIGN1cnJlbnRTY29wZS4kZGVzdHJveSgpO1xuICAgICAgICAgICAgY3VycmVudFNjb3BlID0gbnVsbDtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGN1cnJlbnRFbGVtZW50KSB7XG4gICAgICAgICAgICBwcmV2aW91c0xlYXZlQW5pbWF0aW9uID0gJGFuaW1hdGUubGVhdmUoY3VycmVudEVsZW1lbnQpO1xuICAgICAgICAgICAgcHJldmlvdXNMZWF2ZUFuaW1hdGlvbi50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICBwcmV2aW91c0xlYXZlQW5pbWF0aW9uID0gbnVsbDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY3VycmVudEVsZW1lbnQgPSBudWxsO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHVwZGF0ZSgpIHtcbiAgICAgICAgICB2YXIgbG9jYWxzID0gJHJvdXRlLmN1cnJlbnQgJiYgJHJvdXRlLmN1cnJlbnQubG9jYWxzLFxuICAgICAgICAgICAgICB0ZW1wbGF0ZSA9IGxvY2FscyAmJiBsb2NhbHMuJHRlbXBsYXRlO1xuXG4gICAgICAgICAgaWYgKGFuZ3VsYXIuaXNEZWZpbmVkKHRlbXBsYXRlKSkge1xuICAgICAgICAgICAgdmFyIG5ld1Njb3BlID0gc2NvcGUuJG5ldygpO1xuICAgICAgICAgICAgdmFyIGN1cnJlbnQgPSAkcm91dGUuY3VycmVudDtcblxuICAgICAgICAgICAgLy8gTm90ZTogVGhpcyB3aWxsIGFsc28gbGluayBhbGwgY2hpbGRyZW4gb2YgbmctdmlldyB0aGF0IHdlcmUgY29udGFpbmVkIGluIHRoZSBvcmlnaW5hbFxuICAgICAgICAgICAgLy8gaHRtbC4gSWYgdGhhdCBjb250ZW50IGNvbnRhaW5zIGNvbnRyb2xsZXJzLCAuLi4gdGhleSBjb3VsZCBwb2xsdXRlL2NoYW5nZSB0aGUgc2NvcGUuXG4gICAgICAgICAgICAvLyBIb3dldmVyLCB1c2luZyBuZy12aWV3IG9uIGFuIGVsZW1lbnQgd2l0aCBhZGRpdGlvbmFsIGNvbnRlbnQgZG9lcyBub3QgbWFrZSBzZW5zZS4uLlxuICAgICAgICAgICAgLy8gTm90ZTogV2UgY2FuJ3QgcmVtb3ZlIHRoZW0gaW4gdGhlIGNsb25lQXR0Y2hGbiBvZiAkdHJhbnNjbHVkZSBhcyB0aGF0XG4gICAgICAgICAgICAvLyBmdW5jdGlvbiBpcyBjYWxsZWQgYmVmb3JlIGxpbmtpbmcgdGhlIGNvbnRlbnQsIHdoaWNoIHdvdWxkIGFwcGx5IGNoaWxkXG4gICAgICAgICAgICAvLyBkaXJlY3RpdmVzIHRvIG5vbiBleGlzdGluZyBlbGVtZW50cy5cbiAgICAgICAgICAgIHZhciBjbG9uZSA9ICR0cmFuc2NsdWRlKG5ld1Njb3BlLCBmdW5jdGlvbihjbG9uZSkge1xuICAgICAgICAgICAgICAkYW5pbWF0ZS5lbnRlcihjbG9uZSwgbnVsbCwgY3VycmVudEVsZW1lbnQgfHwgJGVsZW1lbnQpLnRoZW4oZnVuY3Rpb24gb25OZ1ZpZXdFbnRlcigpIHtcbiAgICAgICAgICAgICAgICBpZiAoYW5ndWxhci5pc0RlZmluZWQoYXV0b1Njcm9sbEV4cClcbiAgICAgICAgICAgICAgICAgICYmICghYXV0b1Njcm9sbEV4cCB8fCBzY29wZS4kZXZhbChhdXRvU2Nyb2xsRXhwKSkpIHtcbiAgICAgICAgICAgICAgICAgICRhbmNob3JTY3JvbGwoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICBjbGVhbnVwTGFzdFZpZXcoKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBjdXJyZW50RWxlbWVudCA9IGNsb25lO1xuICAgICAgICAgICAgY3VycmVudFNjb3BlID0gY3VycmVudC5zY29wZSA9IG5ld1Njb3BlO1xuICAgICAgICAgICAgY3VycmVudFNjb3BlLiRlbWl0KCckdmlld0NvbnRlbnRMb2FkZWQnKTtcbiAgICAgICAgICAgIGN1cnJlbnRTY29wZS4kZXZhbChvbmxvYWRFeHApO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjbGVhbnVwTGFzdFZpZXcoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gIH07XG59XG5cbi8vIFRoaXMgZGlyZWN0aXZlIGlzIGNhbGxlZCBkdXJpbmcgdGhlICR0cmFuc2NsdWRlIGNhbGwgb2YgdGhlIGZpcnN0IGBuZ1ZpZXdgIGRpcmVjdGl2ZS5cbi8vIEl0IHdpbGwgcmVwbGFjZSBhbmQgY29tcGlsZSB0aGUgY29udGVudCBvZiB0aGUgZWxlbWVudCB3aXRoIHRoZSBsb2FkZWQgdGVtcGxhdGUuXG4vLyBXZSBuZWVkIHRoaXMgZGlyZWN0aXZlIHNvIHRoYXQgdGhlIGVsZW1lbnQgY29udGVudCBpcyBhbHJlYWR5IGZpbGxlZCB3aGVuXG4vLyB0aGUgbGluayBmdW5jdGlvbiBvZiBhbm90aGVyIGRpcmVjdGl2ZSBvbiB0aGUgc2FtZSBlbGVtZW50IGFzIG5nVmlld1xuLy8gaXMgY2FsbGVkLlxubmdWaWV3RmlsbENvbnRlbnRGYWN0b3J5LiRpbmplY3QgPSBbJyRjb21waWxlJywgJyRjb250cm9sbGVyJywgJyRyb3V0ZSddO1xuZnVuY3Rpb24gbmdWaWV3RmlsbENvbnRlbnRGYWN0b3J5KCRjb21waWxlLCAkY29udHJvbGxlciwgJHJvdXRlKSB7XG4gIHJldHVybiB7XG4gICAgcmVzdHJpY3Q6ICdFQ0EnLFxuICAgIHByaW9yaXR5OiAtNDAwLFxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCAkZWxlbWVudCkge1xuICAgICAgdmFyIGN1cnJlbnQgPSAkcm91dGUuY3VycmVudCxcbiAgICAgICAgICBsb2NhbHMgPSBjdXJyZW50LmxvY2FscztcblxuICAgICAgJGVsZW1lbnQuaHRtbChsb2NhbHMuJHRlbXBsYXRlKTtcblxuICAgICAgdmFyIGxpbmsgPSAkY29tcGlsZSgkZWxlbWVudC5jb250ZW50cygpKTtcblxuICAgICAgaWYgKGN1cnJlbnQuY29udHJvbGxlcikge1xuICAgICAgICBsb2NhbHMuJHNjb3BlID0gc2NvcGU7XG4gICAgICAgIHZhciBjb250cm9sbGVyID0gJGNvbnRyb2xsZXIoY3VycmVudC5jb250cm9sbGVyLCBsb2NhbHMpO1xuICAgICAgICBpZiAoY3VycmVudC5jb250cm9sbGVyQXMpIHtcbiAgICAgICAgICBzY29wZVtjdXJyZW50LmNvbnRyb2xsZXJBc10gPSBjb250cm9sbGVyO1xuICAgICAgICB9XG4gICAgICAgICRlbGVtZW50LmRhdGEoJyRuZ0NvbnRyb2xsZXJDb250cm9sbGVyJywgY29udHJvbGxlcik7XG4gICAgICAgICRlbGVtZW50LmNoaWxkcmVuKCkuZGF0YSgnJG5nQ29udHJvbGxlckNvbnRyb2xsZXInLCBjb250cm9sbGVyKTtcbiAgICAgIH1cbiAgICAgIHNjb3BlW2N1cnJlbnQucmVzb2x2ZUFzIHx8ICckcmVzb2x2ZSddID0gbG9jYWxzO1xuXG4gICAgICBsaW5rKHNjb3BlKTtcbiAgICB9XG4gIH07XG59XG5cblxufSkod2luZG93LCB3aW5kb3cuYW5ndWxhcik7XG4iLCIvKiohXG4gKiBTb3J0YWJsZVxuICogQGF1dGhvclx0UnViYVhhICAgPHRyYXNoQHJ1YmF4YS5vcmc+XG4gKiBAbGljZW5zZSBNSVRcbiAqL1xuXG5cbihmdW5jdGlvbiAoZmFjdG9yeSkge1xuXHRcInVzZSBzdHJpY3RcIjtcblxuXHRpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcblx0XHRkZWZpbmUoZmFjdG9yeSk7XG5cdH1cblx0ZWxzZSBpZiAodHlwZW9mIG1vZHVsZSAhPSBcInVuZGVmaW5lZFwiICYmIHR5cGVvZiBtb2R1bGUuZXhwb3J0cyAhPSBcInVuZGVmaW5lZFwiKSB7XG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG5cdH1cblx0ZWxzZSBpZiAodHlwZW9mIFBhY2thZ2UgIT09IFwidW5kZWZpbmVkXCIpIHtcblx0XHRTb3J0YWJsZSA9IGZhY3RvcnkoKTsgIC8vIGV4cG9ydCBmb3IgTWV0ZW9yLmpzXG5cdH1cblx0ZWxzZSB7XG5cdFx0LyoganNoaW50IHN1Yjp0cnVlICovXG5cdFx0d2luZG93W1wiU29ydGFibGVcIl0gPSBmYWN0b3J5KCk7XG5cdH1cbn0pKGZ1bmN0aW9uICgpIHtcblx0XCJ1c2Ugc3RyaWN0XCI7XG5cblx0dmFyIGRyYWdFbCxcblx0XHRwYXJlbnRFbCxcblx0XHRnaG9zdEVsLFxuXHRcdGNsb25lRWwsXG5cdFx0cm9vdEVsLFxuXHRcdG5leHRFbCxcblxuXHRcdHNjcm9sbEVsLFxuXHRcdHNjcm9sbFBhcmVudEVsLFxuXG5cdFx0bGFzdEVsLFxuXHRcdGxhc3RDU1MsXG5cdFx0bGFzdFBhcmVudENTUyxcblxuXHRcdG9sZEluZGV4LFxuXHRcdG5ld0luZGV4LFxuXG5cdFx0YWN0aXZlR3JvdXAsXG5cdFx0YXV0b1Njcm9sbCA9IHt9LFxuXG5cdFx0dGFwRXZ0LFxuXHRcdHRvdWNoRXZ0LFxuXG5cdFx0bW92ZWQsXG5cblx0XHQvKiogQGNvbnN0ICovXG5cdFx0UlNQQUNFID0gL1xccysvZyxcblxuXHRcdGV4cGFuZG8gPSAnU29ydGFibGUnICsgKG5ldyBEYXRlKS5nZXRUaW1lKCksXG5cblx0XHR3aW4gPSB3aW5kb3csXG5cdFx0ZG9jdW1lbnQgPSB3aW4uZG9jdW1lbnQsXG5cdFx0cGFyc2VJbnQgPSB3aW4ucGFyc2VJbnQsXG5cblx0XHRzdXBwb3J0RHJhZ2dhYmxlID0gISEoJ2RyYWdnYWJsZScgaW4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JykpLFxuXHRcdHN1cHBvcnRDc3NQb2ludGVyRXZlbnRzID0gKGZ1bmN0aW9uIChlbCkge1xuXHRcdFx0ZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd4Jyk7XG5cdFx0XHRlbC5zdHlsZS5jc3NUZXh0ID0gJ3BvaW50ZXItZXZlbnRzOmF1dG8nO1xuXHRcdFx0cmV0dXJuIGVsLnN0eWxlLnBvaW50ZXJFdmVudHMgPT09ICdhdXRvJztcblx0XHR9KSgpLFxuXG5cdFx0X3NpbGVudCA9IGZhbHNlLFxuXG5cdFx0YWJzID0gTWF0aC5hYnMsXG5cdFx0c2xpY2UgPSBbXS5zbGljZSxcblxuXHRcdHRvdWNoRHJhZ092ZXJMaXN0ZW5lcnMgPSBbXSxcblxuXHRcdF9hdXRvU2Nyb2xsID0gX3Rocm90dGxlKGZ1bmN0aW9uICgvKipFdmVudCovZXZ0LCAvKipPYmplY3QqL29wdGlvbnMsIC8qKkhUTUxFbGVtZW50Ki9yb290RWwpIHtcblx0XHRcdC8vIEJ1ZzogaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9NTA1NTIxXG5cdFx0XHRpZiAocm9vdEVsICYmIG9wdGlvbnMuc2Nyb2xsKSB7XG5cdFx0XHRcdHZhciBlbCxcblx0XHRcdFx0XHRyZWN0LFxuXHRcdFx0XHRcdHNlbnMgPSBvcHRpb25zLnNjcm9sbFNlbnNpdGl2aXR5LFxuXHRcdFx0XHRcdHNwZWVkID0gb3B0aW9ucy5zY3JvbGxTcGVlZCxcblxuXHRcdFx0XHRcdHggPSBldnQuY2xpZW50WCxcblx0XHRcdFx0XHR5ID0gZXZ0LmNsaWVudFksXG5cblx0XHRcdFx0XHR3aW5XaWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoLFxuXHRcdFx0XHRcdHdpbkhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodCxcblxuXHRcdFx0XHRcdHZ4LFxuXHRcdFx0XHRcdHZ5XG5cdFx0XHRcdDtcblxuXHRcdFx0XHQvLyBEZWxlY3Qgc2Nyb2xsRWxcblx0XHRcdFx0aWYgKHNjcm9sbFBhcmVudEVsICE9PSByb290RWwpIHtcblx0XHRcdFx0XHRzY3JvbGxFbCA9IG9wdGlvbnMuc2Nyb2xsO1xuXHRcdFx0XHRcdHNjcm9sbFBhcmVudEVsID0gcm9vdEVsO1xuXG5cdFx0XHRcdFx0aWYgKHNjcm9sbEVsID09PSB0cnVlKSB7XG5cdFx0XHRcdFx0XHRzY3JvbGxFbCA9IHJvb3RFbDtcblxuXHRcdFx0XHRcdFx0ZG8ge1xuXHRcdFx0XHRcdFx0XHRpZiAoKHNjcm9sbEVsLm9mZnNldFdpZHRoIDwgc2Nyb2xsRWwuc2Nyb2xsV2lkdGgpIHx8XG5cdFx0XHRcdFx0XHRcdFx0KHNjcm9sbEVsLm9mZnNldEhlaWdodCA8IHNjcm9sbEVsLnNjcm9sbEhlaWdodClcblx0XHRcdFx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0LyoganNoaW50IGJvc3M6dHJ1ZSAqL1xuXHRcdFx0XHRcdFx0fSB3aGlsZSAoc2Nyb2xsRWwgPSBzY3JvbGxFbC5wYXJlbnROb2RlKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoc2Nyb2xsRWwpIHtcblx0XHRcdFx0XHRlbCA9IHNjcm9sbEVsO1xuXHRcdFx0XHRcdHJlY3QgPSBzY3JvbGxFbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblx0XHRcdFx0XHR2eCA9IChhYnMocmVjdC5yaWdodCAtIHgpIDw9IHNlbnMpIC0gKGFicyhyZWN0LmxlZnQgLSB4KSA8PSBzZW5zKTtcblx0XHRcdFx0XHR2eSA9IChhYnMocmVjdC5ib3R0b20gLSB5KSA8PSBzZW5zKSAtIChhYnMocmVjdC50b3AgLSB5KSA8PSBzZW5zKTtcblx0XHRcdFx0fVxuXG5cblx0XHRcdFx0aWYgKCEodnggfHwgdnkpKSB7XG5cdFx0XHRcdFx0dnggPSAod2luV2lkdGggLSB4IDw9IHNlbnMpIC0gKHggPD0gc2Vucyk7XG5cdFx0XHRcdFx0dnkgPSAod2luSGVpZ2h0IC0geSA8PSBzZW5zKSAtICh5IDw9IHNlbnMpO1xuXG5cdFx0XHRcdFx0LyoganNoaW50IGV4cHI6dHJ1ZSAqL1xuXHRcdFx0XHRcdCh2eCB8fCB2eSkgJiYgKGVsID0gd2luKTtcblx0XHRcdFx0fVxuXG5cblx0XHRcdFx0aWYgKGF1dG9TY3JvbGwudnggIT09IHZ4IHx8IGF1dG9TY3JvbGwudnkgIT09IHZ5IHx8IGF1dG9TY3JvbGwuZWwgIT09IGVsKSB7XG5cdFx0XHRcdFx0YXV0b1Njcm9sbC5lbCA9IGVsO1xuXHRcdFx0XHRcdGF1dG9TY3JvbGwudnggPSB2eDtcblx0XHRcdFx0XHRhdXRvU2Nyb2xsLnZ5ID0gdnk7XG5cblx0XHRcdFx0XHRjbGVhckludGVydmFsKGF1dG9TY3JvbGwucGlkKTtcblxuXHRcdFx0XHRcdGlmIChlbCkge1xuXHRcdFx0XHRcdFx0YXV0b1Njcm9sbC5waWQgPSBzZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRcdGlmIChlbCA9PT0gd2luKSB7XG5cdFx0XHRcdFx0XHRcdFx0d2luLnNjcm9sbFRvKHdpbi5wYWdlWE9mZnNldCArIHZ4ICogc3BlZWQsIHdpbi5wYWdlWU9mZnNldCArIHZ5ICogc3BlZWQpO1xuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdHZ5ICYmIChlbC5zY3JvbGxUb3AgKz0gdnkgKiBzcGVlZCk7XG5cdFx0XHRcdFx0XHRcdFx0dnggJiYgKGVsLnNjcm9sbExlZnQgKz0gdnggKiBzcGVlZCk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0sIDI0KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9LCAzMCksXG5cblx0XHRfcHJlcGFyZUdyb3VwID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcblx0XHRcdHZhciBncm91cCA9IG9wdGlvbnMuZ3JvdXA7XG5cblx0XHRcdGlmICghZ3JvdXAgfHwgdHlwZW9mIGdyb3VwICE9ICdvYmplY3QnKSB7XG5cdFx0XHRcdGdyb3VwID0gb3B0aW9ucy5ncm91cCA9IHtuYW1lOiBncm91cH07XG5cdFx0XHR9XG5cblx0XHRcdFsncHVsbCcsICdwdXQnXS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcblx0XHRcdFx0aWYgKCEoa2V5IGluIGdyb3VwKSkge1xuXHRcdFx0XHRcdGdyb3VwW2tleV0gPSB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0b3B0aW9ucy5ncm91cHMgPSAnICcgKyBncm91cC5uYW1lICsgKGdyb3VwLnB1dC5qb2luID8gJyAnICsgZ3JvdXAucHV0LmpvaW4oJyAnKSA6ICcnKSArICcgJztcblx0XHR9XG5cdDtcblxuXG5cblx0LyoqXG5cdCAqIEBjbGFzcyAgU29ydGFibGVcblx0ICogQHBhcmFtICB7SFRNTEVsZW1lbnR9ICBlbFxuXHQgKiBAcGFyYW0gIHtPYmplY3R9ICAgICAgIFtvcHRpb25zXVxuXHQgKi9cblx0ZnVuY3Rpb24gU29ydGFibGUoZWwsIG9wdGlvbnMpIHtcblx0XHRpZiAoIShlbCAmJiBlbC5ub2RlVHlwZSAmJiBlbC5ub2RlVHlwZSA9PT0gMSkpIHtcblx0XHRcdHRocm93ICdTb3J0YWJsZTogYGVsYCBtdXN0IGJlIEhUTUxFbGVtZW50LCBhbmQgbm90ICcgKyB7fS50b1N0cmluZy5jYWxsKGVsKTtcblx0XHR9XG5cblx0XHR0aGlzLmVsID0gZWw7IC8vIHJvb3QgZWxlbWVudFxuXHRcdHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgPSBfZXh0ZW5kKHt9LCBvcHRpb25zKTtcblxuXG5cdFx0Ly8gRXhwb3J0IGluc3RhbmNlXG5cdFx0ZWxbZXhwYW5kb10gPSB0aGlzO1xuXG5cblx0XHQvLyBEZWZhdWx0IG9wdGlvbnNcblx0XHR2YXIgZGVmYXVsdHMgPSB7XG5cdFx0XHRncm91cDogTWF0aC5yYW5kb20oKSxcblx0XHRcdHNvcnQ6IHRydWUsXG5cdFx0XHRkaXNhYmxlZDogZmFsc2UsXG5cdFx0XHRzdG9yZTogbnVsbCxcblx0XHRcdGhhbmRsZTogbnVsbCxcblx0XHRcdHNjcm9sbDogdHJ1ZSxcblx0XHRcdHNjcm9sbFNlbnNpdGl2aXR5OiAzMCxcblx0XHRcdHNjcm9sbFNwZWVkOiAxMCxcblx0XHRcdGRyYWdnYWJsZTogL1t1b11sL2kudGVzdChlbC5ub2RlTmFtZSkgPyAnbGknIDogJz4qJyxcblx0XHRcdGdob3N0Q2xhc3M6ICdzb3J0YWJsZS1naG9zdCcsXG5cdFx0XHRjaG9zZW5DbGFzczogJ3NvcnRhYmxlLWNob3NlbicsXG5cdFx0XHRpZ25vcmU6ICdhLCBpbWcnLFxuXHRcdFx0ZmlsdGVyOiBudWxsLFxuXHRcdFx0YW5pbWF0aW9uOiAwLFxuXHRcdFx0c2V0RGF0YTogZnVuY3Rpb24gKGRhdGFUcmFuc2ZlciwgZHJhZ0VsKSB7XG5cdFx0XHRcdGRhdGFUcmFuc2Zlci5zZXREYXRhKCdUZXh0JywgZHJhZ0VsLnRleHRDb250ZW50KTtcblx0XHRcdH0sXG5cdFx0XHRkcm9wQnViYmxlOiBmYWxzZSxcblx0XHRcdGRyYWdvdmVyQnViYmxlOiBmYWxzZSxcblx0XHRcdGRhdGFJZEF0dHI6ICdkYXRhLWlkJyxcblx0XHRcdGRlbGF5OiAwLFxuXHRcdFx0Zm9yY2VGYWxsYmFjazogZmFsc2UsXG5cdFx0XHRmYWxsYmFja0NsYXNzOiAnc29ydGFibGUtZmFsbGJhY2snLFxuXHRcdFx0ZmFsbGJhY2tPbkJvZHk6IGZhbHNlXG5cdFx0fTtcblxuXG5cdFx0Ly8gU2V0IGRlZmF1bHQgb3B0aW9uc1xuXHRcdGZvciAodmFyIG5hbWUgaW4gZGVmYXVsdHMpIHtcblx0XHRcdCEobmFtZSBpbiBvcHRpb25zKSAmJiAob3B0aW9uc1tuYW1lXSA9IGRlZmF1bHRzW25hbWVdKTtcblx0XHR9XG5cblx0XHRfcHJlcGFyZUdyb3VwKG9wdGlvbnMpO1xuXG5cdFx0Ly8gQmluZCBhbGwgcHJpdmF0ZSBtZXRob2RzXG5cdFx0Zm9yICh2YXIgZm4gaW4gdGhpcykge1xuXHRcdFx0aWYgKGZuLmNoYXJBdCgwKSA9PT0gJ18nKSB7XG5cdFx0XHRcdHRoaXNbZm5dID0gdGhpc1tmbl0uYmluZCh0aGlzKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBTZXR1cCBkcmFnIG1vZGVcblx0XHR0aGlzLm5hdGl2ZURyYWdnYWJsZSA9IG9wdGlvbnMuZm9yY2VGYWxsYmFjayA/IGZhbHNlIDogc3VwcG9ydERyYWdnYWJsZTtcblxuXHRcdC8vIEJpbmQgZXZlbnRzXG5cdFx0X29uKGVsLCAnbW91c2Vkb3duJywgdGhpcy5fb25UYXBTdGFydCk7XG5cdFx0X29uKGVsLCAndG91Y2hzdGFydCcsIHRoaXMuX29uVGFwU3RhcnQpO1xuXG5cdFx0aWYgKHRoaXMubmF0aXZlRHJhZ2dhYmxlKSB7XG5cdFx0XHRfb24oZWwsICdkcmFnb3ZlcicsIHRoaXMpO1xuXHRcdFx0X29uKGVsLCAnZHJhZ2VudGVyJywgdGhpcyk7XG5cdFx0fVxuXG5cdFx0dG91Y2hEcmFnT3Zlckxpc3RlbmVycy5wdXNoKHRoaXMuX29uRHJhZ092ZXIpO1xuXG5cdFx0Ly8gUmVzdG9yZSBzb3J0aW5nXG5cdFx0b3B0aW9ucy5zdG9yZSAmJiB0aGlzLnNvcnQob3B0aW9ucy5zdG9yZS5nZXQodGhpcykpO1xuXHR9XG5cblxuXHRTb3J0YWJsZS5wcm90b3R5cGUgPSAvKiogQGxlbmRzIFNvcnRhYmxlLnByb3RvdHlwZSAqLyB7XG5cdFx0Y29uc3RydWN0b3I6IFNvcnRhYmxlLFxuXG5cdFx0X29uVGFwU3RhcnQ6IGZ1bmN0aW9uICgvKiogRXZlbnR8VG91Y2hFdmVudCAqL2V2dCkge1xuXHRcdFx0dmFyIF90aGlzID0gdGhpcyxcblx0XHRcdFx0ZWwgPSB0aGlzLmVsLFxuXHRcdFx0XHRvcHRpb25zID0gdGhpcy5vcHRpb25zLFxuXHRcdFx0XHR0eXBlID0gZXZ0LnR5cGUsXG5cdFx0XHRcdHRvdWNoID0gZXZ0LnRvdWNoZXMgJiYgZXZ0LnRvdWNoZXNbMF0sXG5cdFx0XHRcdHRhcmdldCA9ICh0b3VjaCB8fCBldnQpLnRhcmdldCxcblx0XHRcdFx0b3JpZ2luYWxUYXJnZXQgPSB0YXJnZXQsXG5cdFx0XHRcdGZpbHRlciA9IG9wdGlvbnMuZmlsdGVyO1xuXG5cblx0XHRcdGlmICh0eXBlID09PSAnbW91c2Vkb3duJyAmJiBldnQuYnV0dG9uICE9PSAwIHx8IG9wdGlvbnMuZGlzYWJsZWQpIHtcblx0XHRcdFx0cmV0dXJuOyAvLyBvbmx5IGxlZnQgYnV0dG9uIG9yIGVuYWJsZWRcblx0XHRcdH1cblxuXHRcdFx0dGFyZ2V0ID0gX2Nsb3Nlc3QodGFyZ2V0LCBvcHRpb25zLmRyYWdnYWJsZSwgZWwpO1xuXG5cdFx0XHRpZiAoIXRhcmdldCkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdC8vIGdldCB0aGUgaW5kZXggb2YgdGhlIGRyYWdnZWQgZWxlbWVudCB3aXRoaW4gaXRzIHBhcmVudFxuXHRcdFx0b2xkSW5kZXggPSBfaW5kZXgodGFyZ2V0KTtcblxuXHRcdFx0Ly8gQ2hlY2sgZmlsdGVyXG5cdFx0XHRpZiAodHlwZW9mIGZpbHRlciA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRpZiAoZmlsdGVyLmNhbGwodGhpcywgZXZ0LCB0YXJnZXQsIHRoaXMpKSB7XG5cdFx0XHRcdFx0X2Rpc3BhdGNoRXZlbnQoX3RoaXMsIG9yaWdpbmFsVGFyZ2V0LCAnZmlsdGVyJywgdGFyZ2V0LCBlbCwgb2xkSW5kZXgpO1xuXHRcdFx0XHRcdGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHRcdHJldHVybjsgLy8gY2FuY2VsIGRuZFxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmIChmaWx0ZXIpIHtcblx0XHRcdFx0ZmlsdGVyID0gZmlsdGVyLnNwbGl0KCcsJykuc29tZShmdW5jdGlvbiAoY3JpdGVyaWEpIHtcblx0XHRcdFx0XHRjcml0ZXJpYSA9IF9jbG9zZXN0KG9yaWdpbmFsVGFyZ2V0LCBjcml0ZXJpYS50cmltKCksIGVsKTtcblxuXHRcdFx0XHRcdGlmIChjcml0ZXJpYSkge1xuXHRcdFx0XHRcdFx0X2Rpc3BhdGNoRXZlbnQoX3RoaXMsIGNyaXRlcmlhLCAnZmlsdGVyJywgdGFyZ2V0LCBlbCwgb2xkSW5kZXgpO1xuXHRcdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRpZiAoZmlsdGVyKSB7XG5cdFx0XHRcdFx0ZXZ0LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdFx0cmV0dXJuOyAvLyBjYW5jZWwgZG5kXG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXG5cdFx0XHRpZiAob3B0aW9ucy5oYW5kbGUgJiYgIV9jbG9zZXN0KG9yaWdpbmFsVGFyZ2V0LCBvcHRpb25zLmhhbmRsZSwgZWwpKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXG5cdFx0XHQvLyBQcmVwYXJlIGBkcmFnc3RhcnRgXG5cdFx0XHR0aGlzLl9wcmVwYXJlRHJhZ1N0YXJ0KGV2dCwgdG91Y2gsIHRhcmdldCk7XG5cdFx0fSxcblxuXHRcdF9wcmVwYXJlRHJhZ1N0YXJ0OiBmdW5jdGlvbiAoLyoqIEV2ZW50ICovZXZ0LCAvKiogVG91Y2ggKi90b3VjaCwgLyoqIEhUTUxFbGVtZW50ICovdGFyZ2V0KSB7XG5cdFx0XHR2YXIgX3RoaXMgPSB0aGlzLFxuXHRcdFx0XHRlbCA9IF90aGlzLmVsLFxuXHRcdFx0XHRvcHRpb25zID0gX3RoaXMub3B0aW9ucyxcblx0XHRcdFx0b3duZXJEb2N1bWVudCA9IGVsLm93bmVyRG9jdW1lbnQsXG5cdFx0XHRcdGRyYWdTdGFydEZuO1xuXG5cdFx0XHRpZiAodGFyZ2V0ICYmICFkcmFnRWwgJiYgKHRhcmdldC5wYXJlbnROb2RlID09PSBlbCkpIHtcblx0XHRcdFx0dGFwRXZ0ID0gZXZ0O1xuXG5cdFx0XHRcdHJvb3RFbCA9IGVsO1xuXHRcdFx0XHRkcmFnRWwgPSB0YXJnZXQ7XG5cdFx0XHRcdHBhcmVudEVsID0gZHJhZ0VsLnBhcmVudE5vZGU7XG5cdFx0XHRcdG5leHRFbCA9IGRyYWdFbC5uZXh0U2libGluZztcblx0XHRcdFx0YWN0aXZlR3JvdXAgPSBvcHRpb25zLmdyb3VwO1xuXG5cdFx0XHRcdGRyYWdTdGFydEZuID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdC8vIERlbGF5ZWQgZHJhZyBoYXMgYmVlbiB0cmlnZ2VyZWRcblx0XHRcdFx0XHQvLyB3ZSBjYW4gcmUtZW5hYmxlIHRoZSBldmVudHM6IHRvdWNobW92ZS9tb3VzZW1vdmVcblx0XHRcdFx0XHRfdGhpcy5fZGlzYWJsZURlbGF5ZWREcmFnKCk7XG5cblx0XHRcdFx0XHQvLyBNYWtlIHRoZSBlbGVtZW50IGRyYWdnYWJsZVxuXHRcdFx0XHRcdGRyYWdFbC5kcmFnZ2FibGUgPSB0cnVlO1xuXG5cdFx0XHRcdFx0Ly8gQ2hvc2VuIGl0ZW1cblx0XHRcdFx0XHRfdG9nZ2xlQ2xhc3MoZHJhZ0VsLCBfdGhpcy5vcHRpb25zLmNob3NlbkNsYXNzLCB0cnVlKTtcblxuXHRcdFx0XHRcdC8vIEJpbmQgdGhlIGV2ZW50czogZHJhZ3N0YXJ0L2RyYWdlbmRcblx0XHRcdFx0XHRfdGhpcy5fdHJpZ2dlckRyYWdTdGFydCh0b3VjaCk7XG5cdFx0XHRcdH07XG5cblx0XHRcdFx0Ly8gRGlzYWJsZSBcImRyYWdnYWJsZVwiXG5cdFx0XHRcdG9wdGlvbnMuaWdub3JlLnNwbGl0KCcsJykuZm9yRWFjaChmdW5jdGlvbiAoY3JpdGVyaWEpIHtcblx0XHRcdFx0XHRfZmluZChkcmFnRWwsIGNyaXRlcmlhLnRyaW0oKSwgX2Rpc2FibGVEcmFnZ2FibGUpO1xuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRfb24ob3duZXJEb2N1bWVudCwgJ21vdXNldXAnLCBfdGhpcy5fb25Ecm9wKTtcblx0XHRcdFx0X29uKG93bmVyRG9jdW1lbnQsICd0b3VjaGVuZCcsIF90aGlzLl9vbkRyb3ApO1xuXHRcdFx0XHRfb24ob3duZXJEb2N1bWVudCwgJ3RvdWNoY2FuY2VsJywgX3RoaXMuX29uRHJvcCk7XG5cblx0XHRcdFx0aWYgKG9wdGlvbnMuZGVsYXkpIHtcblx0XHRcdFx0XHQvLyBJZiB0aGUgdXNlciBtb3ZlcyB0aGUgcG9pbnRlciBvciBsZXQgZ28gdGhlIGNsaWNrIG9yIHRvdWNoXG5cdFx0XHRcdFx0Ly8gYmVmb3JlIHRoZSBkZWxheSBoYXMgYmVlbiByZWFjaGVkOlxuXHRcdFx0XHRcdC8vIGRpc2FibGUgdGhlIGRlbGF5ZWQgZHJhZ1xuXHRcdFx0XHRcdF9vbihvd25lckRvY3VtZW50LCAnbW91c2V1cCcsIF90aGlzLl9kaXNhYmxlRGVsYXllZERyYWcpO1xuXHRcdFx0XHRcdF9vbihvd25lckRvY3VtZW50LCAndG91Y2hlbmQnLCBfdGhpcy5fZGlzYWJsZURlbGF5ZWREcmFnKTtcblx0XHRcdFx0XHRfb24ob3duZXJEb2N1bWVudCwgJ3RvdWNoY2FuY2VsJywgX3RoaXMuX2Rpc2FibGVEZWxheWVkRHJhZyk7XG5cdFx0XHRcdFx0X29uKG93bmVyRG9jdW1lbnQsICdtb3VzZW1vdmUnLCBfdGhpcy5fZGlzYWJsZURlbGF5ZWREcmFnKTtcblx0XHRcdFx0XHRfb24ob3duZXJEb2N1bWVudCwgJ3RvdWNobW92ZScsIF90aGlzLl9kaXNhYmxlRGVsYXllZERyYWcpO1xuXG5cdFx0XHRcdFx0X3RoaXMuX2RyYWdTdGFydFRpbWVyID0gc2V0VGltZW91dChkcmFnU3RhcnRGbiwgb3B0aW9ucy5kZWxheSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0ZHJhZ1N0YXJ0Rm4oKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRfZGlzYWJsZURlbGF5ZWREcmFnOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHR2YXIgb3duZXJEb2N1bWVudCA9IHRoaXMuZWwub3duZXJEb2N1bWVudDtcblxuXHRcdFx0Y2xlYXJUaW1lb3V0KHRoaXMuX2RyYWdTdGFydFRpbWVyKTtcblx0XHRcdF9vZmYob3duZXJEb2N1bWVudCwgJ21vdXNldXAnLCB0aGlzLl9kaXNhYmxlRGVsYXllZERyYWcpO1xuXHRcdFx0X29mZihvd25lckRvY3VtZW50LCAndG91Y2hlbmQnLCB0aGlzLl9kaXNhYmxlRGVsYXllZERyYWcpO1xuXHRcdFx0X29mZihvd25lckRvY3VtZW50LCAndG91Y2hjYW5jZWwnLCB0aGlzLl9kaXNhYmxlRGVsYXllZERyYWcpO1xuXHRcdFx0X29mZihvd25lckRvY3VtZW50LCAnbW91c2Vtb3ZlJywgdGhpcy5fZGlzYWJsZURlbGF5ZWREcmFnKTtcblx0XHRcdF9vZmYob3duZXJEb2N1bWVudCwgJ3RvdWNobW92ZScsIHRoaXMuX2Rpc2FibGVEZWxheWVkRHJhZyk7XG5cdFx0fSxcblxuXHRcdF90cmlnZ2VyRHJhZ1N0YXJ0OiBmdW5jdGlvbiAoLyoqIFRvdWNoICovdG91Y2gpIHtcblx0XHRcdGlmICh0b3VjaCkge1xuXHRcdFx0XHQvLyBUb3VjaCBkZXZpY2Ugc3VwcG9ydFxuXHRcdFx0XHR0YXBFdnQgPSB7XG5cdFx0XHRcdFx0dGFyZ2V0OiBkcmFnRWwsXG5cdFx0XHRcdFx0Y2xpZW50WDogdG91Y2guY2xpZW50WCxcblx0XHRcdFx0XHRjbGllbnRZOiB0b3VjaC5jbGllbnRZXG5cdFx0XHRcdH07XG5cblx0XHRcdFx0dGhpcy5fb25EcmFnU3RhcnQodGFwRXZ0LCAndG91Y2gnKTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKCF0aGlzLm5hdGl2ZURyYWdnYWJsZSkge1xuXHRcdFx0XHR0aGlzLl9vbkRyYWdTdGFydCh0YXBFdnQsIHRydWUpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdF9vbihkcmFnRWwsICdkcmFnZW5kJywgdGhpcyk7XG5cdFx0XHRcdF9vbihyb290RWwsICdkcmFnc3RhcnQnLCB0aGlzLl9vbkRyYWdTdGFydCk7XG5cdFx0XHR9XG5cblx0XHRcdHRyeSB7XG5cdFx0XHRcdGlmIChkb2N1bWVudC5zZWxlY3Rpb24pIHtcblx0XHRcdFx0XHRkb2N1bWVudC5zZWxlY3Rpb24uZW1wdHkoKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR3aW5kb3cuZ2V0U2VsZWN0aW9uKCkucmVtb3ZlQWxsUmFuZ2VzKCk7XG5cdFx0XHRcdH1cblx0XHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRfZHJhZ1N0YXJ0ZWQ6IGZ1bmN0aW9uICgpIHtcblx0XHRcdGlmIChyb290RWwgJiYgZHJhZ0VsKSB7XG5cdFx0XHRcdC8vIEFwcGx5IGVmZmVjdFxuXHRcdFx0XHRfdG9nZ2xlQ2xhc3MoZHJhZ0VsLCB0aGlzLm9wdGlvbnMuZ2hvc3RDbGFzcywgdHJ1ZSk7XG5cblx0XHRcdFx0U29ydGFibGUuYWN0aXZlID0gdGhpcztcblxuXHRcdFx0XHQvLyBEcmFnIHN0YXJ0IGV2ZW50XG5cdFx0XHRcdF9kaXNwYXRjaEV2ZW50KHRoaXMsIHJvb3RFbCwgJ3N0YXJ0JywgZHJhZ0VsLCByb290RWwsIG9sZEluZGV4KTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0X2VtdWxhdGVEcmFnT3ZlcjogZnVuY3Rpb24gKCkge1xuXHRcdFx0aWYgKHRvdWNoRXZ0KSB7XG5cdFx0XHRcdGlmICh0aGlzLl9sYXN0WCA9PT0gdG91Y2hFdnQuY2xpZW50WCAmJiB0aGlzLl9sYXN0WSA9PT0gdG91Y2hFdnQuY2xpZW50WSkge1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHRoaXMuX2xhc3RYID0gdG91Y2hFdnQuY2xpZW50WDtcblx0XHRcdFx0dGhpcy5fbGFzdFkgPSB0b3VjaEV2dC5jbGllbnRZO1xuXG5cdFx0XHRcdGlmICghc3VwcG9ydENzc1BvaW50ZXJFdmVudHMpIHtcblx0XHRcdFx0XHRfY3NzKGdob3N0RWwsICdkaXNwbGF5JywgJ25vbmUnKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHZhciB0YXJnZXQgPSBkb2N1bWVudC5lbGVtZW50RnJvbVBvaW50KHRvdWNoRXZ0LmNsaWVudFgsIHRvdWNoRXZ0LmNsaWVudFkpLFxuXHRcdFx0XHRcdHBhcmVudCA9IHRhcmdldCxcblx0XHRcdFx0XHRncm91cE5hbWUgPSAnICcgKyB0aGlzLm9wdGlvbnMuZ3JvdXAubmFtZSArICcnLFxuXHRcdFx0XHRcdGkgPSB0b3VjaERyYWdPdmVyTGlzdGVuZXJzLmxlbmd0aDtcblxuXHRcdFx0XHRpZiAocGFyZW50KSB7XG5cdFx0XHRcdFx0ZG8ge1xuXHRcdFx0XHRcdFx0aWYgKHBhcmVudFtleHBhbmRvXSAmJiBwYXJlbnRbZXhwYW5kb10ub3B0aW9ucy5ncm91cHMuaW5kZXhPZihncm91cE5hbWUpID4gLTEpIHtcblx0XHRcdFx0XHRcdFx0d2hpbGUgKGktLSkge1xuXHRcdFx0XHRcdFx0XHRcdHRvdWNoRHJhZ092ZXJMaXN0ZW5lcnNbaV0oe1xuXHRcdFx0XHRcdFx0XHRcdFx0Y2xpZW50WDogdG91Y2hFdnQuY2xpZW50WCxcblx0XHRcdFx0XHRcdFx0XHRcdGNsaWVudFk6IHRvdWNoRXZ0LmNsaWVudFksXG5cdFx0XHRcdFx0XHRcdFx0XHR0YXJnZXQ6IHRhcmdldCxcblx0XHRcdFx0XHRcdFx0XHRcdHJvb3RFbDogcGFyZW50XG5cdFx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0dGFyZ2V0ID0gcGFyZW50OyAvLyBzdG9yZSBsYXN0IGVsZW1lbnRcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0LyoganNoaW50IGJvc3M6dHJ1ZSAqL1xuXHRcdFx0XHRcdHdoaWxlIChwYXJlbnQgPSBwYXJlbnQucGFyZW50Tm9kZSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoIXN1cHBvcnRDc3NQb2ludGVyRXZlbnRzKSB7XG5cdFx0XHRcdFx0X2NzcyhnaG9zdEVsLCAnZGlzcGxheScsICcnKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0sXG5cblxuXHRcdF9vblRvdWNoTW92ZTogZnVuY3Rpb24gKC8qKlRvdWNoRXZlbnQqL2V2dCkge1xuXHRcdFx0aWYgKHRhcEV2dCkge1xuXHRcdFx0XHQvLyBvbmx5IHNldCB0aGUgc3RhdHVzIHRvIGRyYWdnaW5nLCB3aGVuIHdlIGFyZSBhY3R1YWxseSBkcmFnZ2luZ1xuXHRcdFx0XHRpZiAoIVNvcnRhYmxlLmFjdGl2ZSkge1xuXHRcdFx0XHRcdHRoaXMuX2RyYWdTdGFydGVkKCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBhcyB3ZWxsIGFzIGNyZWF0aW5nIHRoZSBnaG9zdCBlbGVtZW50IG9uIHRoZSBkb2N1bWVudCBib2R5XG5cdFx0XHRcdHRoaXMuX2FwcGVuZEdob3N0KCk7XG5cblx0XHRcdFx0dmFyIHRvdWNoID0gZXZ0LnRvdWNoZXMgPyBldnQudG91Y2hlc1swXSA6IGV2dCxcblx0XHRcdFx0XHRkeCA9IHRvdWNoLmNsaWVudFggLSB0YXBFdnQuY2xpZW50WCxcblx0XHRcdFx0XHRkeSA9IHRvdWNoLmNsaWVudFkgLSB0YXBFdnQuY2xpZW50WSxcblx0XHRcdFx0XHR0cmFuc2xhdGUzZCA9IGV2dC50b3VjaGVzID8gJ3RyYW5zbGF0ZTNkKCcgKyBkeCArICdweCwnICsgZHkgKyAncHgsMCknIDogJ3RyYW5zbGF0ZSgnICsgZHggKyAncHgsJyArIGR5ICsgJ3B4KSc7XG5cblx0XHRcdFx0bW92ZWQgPSB0cnVlO1xuXHRcdFx0XHR0b3VjaEV2dCA9IHRvdWNoO1xuXG5cdFx0XHRcdF9jc3MoZ2hvc3RFbCwgJ3dlYmtpdFRyYW5zZm9ybScsIHRyYW5zbGF0ZTNkKTtcblx0XHRcdFx0X2NzcyhnaG9zdEVsLCAnbW96VHJhbnNmb3JtJywgdHJhbnNsYXRlM2QpO1xuXHRcdFx0XHRfY3NzKGdob3N0RWwsICdtc1RyYW5zZm9ybScsIHRyYW5zbGF0ZTNkKTtcblx0XHRcdFx0X2NzcyhnaG9zdEVsLCAndHJhbnNmb3JtJywgdHJhbnNsYXRlM2QpO1xuXG5cdFx0XHRcdGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRfYXBwZW5kR2hvc3Q6IGZ1bmN0aW9uICgpIHtcblx0XHRcdGlmICghZ2hvc3RFbCkge1xuXHRcdFx0XHR2YXIgcmVjdCA9IGRyYWdFbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcblx0XHRcdFx0XHRjc3MgPSBfY3NzKGRyYWdFbCksXG5cdFx0XHRcdFx0b3B0aW9ucyA9IHRoaXMub3B0aW9ucyxcblx0XHRcdFx0XHRnaG9zdFJlY3Q7XG5cblx0XHRcdFx0Z2hvc3RFbCA9IGRyYWdFbC5jbG9uZU5vZGUodHJ1ZSk7XG5cblx0XHRcdFx0X3RvZ2dsZUNsYXNzKGdob3N0RWwsIG9wdGlvbnMuZ2hvc3RDbGFzcywgZmFsc2UpO1xuXHRcdFx0XHRfdG9nZ2xlQ2xhc3MoZ2hvc3RFbCwgb3B0aW9ucy5mYWxsYmFja0NsYXNzLCB0cnVlKTtcblxuXHRcdFx0XHRfY3NzKGdob3N0RWwsICd0b3AnLCByZWN0LnRvcCAtIHBhcnNlSW50KGNzcy5tYXJnaW5Ub3AsIDEwKSk7XG5cdFx0XHRcdF9jc3MoZ2hvc3RFbCwgJ2xlZnQnLCByZWN0LmxlZnQgLSBwYXJzZUludChjc3MubWFyZ2luTGVmdCwgMTApKTtcblx0XHRcdFx0X2NzcyhnaG9zdEVsLCAnd2lkdGgnLCByZWN0LndpZHRoKTtcblx0XHRcdFx0X2NzcyhnaG9zdEVsLCAnaGVpZ2h0JywgcmVjdC5oZWlnaHQpO1xuXHRcdFx0XHRfY3NzKGdob3N0RWwsICdvcGFjaXR5JywgJzAuOCcpO1xuXHRcdFx0XHRfY3NzKGdob3N0RWwsICdwb3NpdGlvbicsICdmaXhlZCcpO1xuXHRcdFx0XHRfY3NzKGdob3N0RWwsICd6SW5kZXgnLCAnMTAwMDAwJyk7XG5cdFx0XHRcdF9jc3MoZ2hvc3RFbCwgJ3BvaW50ZXJFdmVudHMnLCAnbm9uZScpO1xuXG5cdFx0XHRcdG9wdGlvbnMuZmFsbGJhY2tPbkJvZHkgJiYgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChnaG9zdEVsKSB8fCByb290RWwuYXBwZW5kQ2hpbGQoZ2hvc3RFbCk7XG5cblx0XHRcdFx0Ly8gRml4aW5nIGRpbWVuc2lvbnMuXG5cdFx0XHRcdGdob3N0UmVjdCA9IGdob3N0RWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cdFx0XHRcdF9jc3MoZ2hvc3RFbCwgJ3dpZHRoJywgcmVjdC53aWR0aCAqIDIgLSBnaG9zdFJlY3Qud2lkdGgpO1xuXHRcdFx0XHRfY3NzKGdob3N0RWwsICdoZWlnaHQnLCByZWN0LmhlaWdodCAqIDIgLSBnaG9zdFJlY3QuaGVpZ2h0KTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0X29uRHJhZ1N0YXJ0OiBmdW5jdGlvbiAoLyoqRXZlbnQqL2V2dCwgLyoqYm9vbGVhbiovdXNlRmFsbGJhY2spIHtcblx0XHRcdHZhciBkYXRhVHJhbnNmZXIgPSBldnQuZGF0YVRyYW5zZmVyLFxuXHRcdFx0XHRvcHRpb25zID0gdGhpcy5vcHRpb25zO1xuXG5cdFx0XHR0aGlzLl9vZmZVcEV2ZW50cygpO1xuXG5cdFx0XHRpZiAoYWN0aXZlR3JvdXAucHVsbCA9PSAnY2xvbmUnKSB7XG5cdFx0XHRcdGNsb25lRWwgPSBkcmFnRWwuY2xvbmVOb2RlKHRydWUpO1xuXHRcdFx0XHRfY3NzKGNsb25lRWwsICdkaXNwbGF5JywgJ25vbmUnKTtcblx0XHRcdFx0cm9vdEVsLmluc2VydEJlZm9yZShjbG9uZUVsLCBkcmFnRWwpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAodXNlRmFsbGJhY2spIHtcblxuXHRcdFx0XHRpZiAodXNlRmFsbGJhY2sgPT09ICd0b3VjaCcpIHtcblx0XHRcdFx0XHQvLyBCaW5kIHRvdWNoIGV2ZW50c1xuXHRcdFx0XHRcdF9vbihkb2N1bWVudCwgJ3RvdWNobW92ZScsIHRoaXMuX29uVG91Y2hNb3ZlKTtcblx0XHRcdFx0XHRfb24oZG9jdW1lbnQsICd0b3VjaGVuZCcsIHRoaXMuX29uRHJvcCk7XG5cdFx0XHRcdFx0X29uKGRvY3VtZW50LCAndG91Y2hjYW5jZWwnLCB0aGlzLl9vbkRyb3ApO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vIE9sZCBicndvc2VyXG5cdFx0XHRcdFx0X29uKGRvY3VtZW50LCAnbW91c2Vtb3ZlJywgdGhpcy5fb25Ub3VjaE1vdmUpO1xuXHRcdFx0XHRcdF9vbihkb2N1bWVudCwgJ21vdXNldXAnLCB0aGlzLl9vbkRyb3ApO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0dGhpcy5fbG9vcElkID0gc2V0SW50ZXJ2YWwodGhpcy5fZW11bGF0ZURyYWdPdmVyLCA1MCk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0aWYgKGRhdGFUcmFuc2Zlcikge1xuXHRcdFx0XHRcdGRhdGFUcmFuc2Zlci5lZmZlY3RBbGxvd2VkID0gJ21vdmUnO1xuXHRcdFx0XHRcdG9wdGlvbnMuc2V0RGF0YSAmJiBvcHRpb25zLnNldERhdGEuY2FsbCh0aGlzLCBkYXRhVHJhbnNmZXIsIGRyYWdFbCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRfb24oZG9jdW1lbnQsICdkcm9wJywgdGhpcyk7XG5cdFx0XHRcdHNldFRpbWVvdXQodGhpcy5fZHJhZ1N0YXJ0ZWQsIDApO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRfb25EcmFnT3ZlcjogZnVuY3Rpb24gKC8qKkV2ZW50Ki9ldnQpIHtcblx0XHRcdHZhciBlbCA9IHRoaXMuZWwsXG5cdFx0XHRcdHRhcmdldCxcblx0XHRcdFx0ZHJhZ1JlY3QsXG5cdFx0XHRcdHJldmVydCxcblx0XHRcdFx0b3B0aW9ucyA9IHRoaXMub3B0aW9ucyxcblx0XHRcdFx0Z3JvdXAgPSBvcHRpb25zLmdyb3VwLFxuXHRcdFx0XHRncm91cFB1dCA9IGdyb3VwLnB1dCxcblx0XHRcdFx0aXNPd25lciA9IChhY3RpdmVHcm91cCA9PT0gZ3JvdXApLFxuXHRcdFx0XHRjYW5Tb3J0ID0gb3B0aW9ucy5zb3J0O1xuXG5cdFx0XHRpZiAoZXZ0LnByZXZlbnREZWZhdWx0ICE9PSB2b2lkIDApIHtcblx0XHRcdFx0ZXZ0LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdCFvcHRpb25zLmRyYWdvdmVyQnViYmxlICYmIGV2dC5zdG9wUHJvcGFnYXRpb24oKTtcblx0XHRcdH1cblxuXHRcdFx0bW92ZWQgPSB0cnVlO1xuXG5cdFx0XHRpZiAoYWN0aXZlR3JvdXAgJiYgIW9wdGlvbnMuZGlzYWJsZWQgJiZcblx0XHRcdFx0KGlzT3duZXJcblx0XHRcdFx0XHQ/IGNhblNvcnQgfHwgKHJldmVydCA9ICFyb290RWwuY29udGFpbnMoZHJhZ0VsKSkgLy8gUmV2ZXJ0aW5nIGl0ZW0gaW50byB0aGUgb3JpZ2luYWwgbGlzdFxuXHRcdFx0XHRcdDogYWN0aXZlR3JvdXAucHVsbCAmJiBncm91cFB1dCAmJiAoXG5cdFx0XHRcdFx0XHQoYWN0aXZlR3JvdXAubmFtZSA9PT0gZ3JvdXAubmFtZSkgfHwgLy8gYnkgTmFtZVxuXHRcdFx0XHRcdFx0KGdyb3VwUHV0LmluZGV4T2YgJiYgfmdyb3VwUHV0LmluZGV4T2YoYWN0aXZlR3JvdXAubmFtZSkpIC8vIGJ5IEFycmF5XG5cdFx0XHRcdFx0KVxuXHRcdFx0XHQpICYmXG5cdFx0XHRcdChldnQucm9vdEVsID09PSB2b2lkIDAgfHwgZXZ0LnJvb3RFbCA9PT0gdGhpcy5lbCkgLy8gdG91Y2ggZmFsbGJhY2tcblx0XHRcdCkge1xuXHRcdFx0XHQvLyBTbWFydCBhdXRvLXNjcm9sbGluZ1xuXHRcdFx0XHRfYXV0b1Njcm9sbChldnQsIG9wdGlvbnMsIHRoaXMuZWwpO1xuXG5cdFx0XHRcdGlmIChfc2lsZW50KSB7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0dGFyZ2V0ID0gX2Nsb3Nlc3QoZXZ0LnRhcmdldCwgb3B0aW9ucy5kcmFnZ2FibGUsIGVsKTtcblx0XHRcdFx0ZHJhZ1JlY3QgPSBkcmFnRWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cblx0XHRcdFx0aWYgKHJldmVydCkge1xuXHRcdFx0XHRcdF9jbG9uZUhpZGUodHJ1ZSk7XG5cblx0XHRcdFx0XHRpZiAoY2xvbmVFbCB8fCBuZXh0RWwpIHtcblx0XHRcdFx0XHRcdHJvb3RFbC5pbnNlcnRCZWZvcmUoZHJhZ0VsLCBjbG9uZUVsIHx8IG5leHRFbCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2UgaWYgKCFjYW5Tb3J0KSB7XG5cdFx0XHRcdFx0XHRyb290RWwuYXBwZW5kQ2hpbGQoZHJhZ0VsKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblxuXG5cdFx0XHRcdGlmICgoZWwuY2hpbGRyZW4ubGVuZ3RoID09PSAwKSB8fCAoZWwuY2hpbGRyZW5bMF0gPT09IGdob3N0RWwpIHx8XG5cdFx0XHRcdFx0KGVsID09PSBldnQudGFyZ2V0KSAmJiAodGFyZ2V0ID0gX2dob3N0SXNMYXN0KGVsLCBldnQpKVxuXHRcdFx0XHQpIHtcblxuXHRcdFx0XHRcdGlmICh0YXJnZXQpIHtcblx0XHRcdFx0XHRcdGlmICh0YXJnZXQuYW5pbWF0ZWQpIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHR0YXJnZXRSZWN0ID0gdGFyZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdF9jbG9uZUhpZGUoaXNPd25lcik7XG5cblx0XHRcdFx0XHRpZiAoX29uTW92ZShyb290RWwsIGVsLCBkcmFnRWwsIGRyYWdSZWN0LCB0YXJnZXQsIHRhcmdldFJlY3QpICE9PSBmYWxzZSkge1xuXHRcdFx0XHRcdFx0aWYgKCFkcmFnRWwuY29udGFpbnMoZWwpKSB7XG5cdFx0XHRcdFx0XHRcdGVsLmFwcGVuZENoaWxkKGRyYWdFbCk7XG5cdFx0XHRcdFx0XHRcdHBhcmVudEVsID0gZWw7IC8vIGFjdHVhbGl6YXRpb25cblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0dGhpcy5fYW5pbWF0ZShkcmFnUmVjdCwgZHJhZ0VsKTtcblx0XHRcdFx0XHRcdHRhcmdldCAmJiB0aGlzLl9hbmltYXRlKHRhcmdldFJlY3QsIHRhcmdldCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2UgaWYgKHRhcmdldCAmJiAhdGFyZ2V0LmFuaW1hdGVkICYmIHRhcmdldCAhPT0gZHJhZ0VsICYmICh0YXJnZXQucGFyZW50Tm9kZVtleHBhbmRvXSAhPT0gdm9pZCAwKSkge1xuXHRcdFx0XHRcdGlmIChsYXN0RWwgIT09IHRhcmdldCkge1xuXHRcdFx0XHRcdFx0bGFzdEVsID0gdGFyZ2V0O1xuXHRcdFx0XHRcdFx0bGFzdENTUyA9IF9jc3ModGFyZ2V0KTtcblx0XHRcdFx0XHRcdGxhc3RQYXJlbnRDU1MgPSBfY3NzKHRhcmdldC5wYXJlbnROb2RlKTtcblx0XHRcdFx0XHR9XG5cblxuXHRcdFx0XHRcdHZhciB0YXJnZXRSZWN0ID0gdGFyZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLFxuXHRcdFx0XHRcdFx0d2lkdGggPSB0YXJnZXRSZWN0LnJpZ2h0IC0gdGFyZ2V0UmVjdC5sZWZ0LFxuXHRcdFx0XHRcdFx0aGVpZ2h0ID0gdGFyZ2V0UmVjdC5ib3R0b20gLSB0YXJnZXRSZWN0LnRvcCxcblx0XHRcdFx0XHRcdGZsb2F0aW5nID0gL2xlZnR8cmlnaHR8aW5saW5lLy50ZXN0KGxhc3RDU1MuY3NzRmxvYXQgKyBsYXN0Q1NTLmRpc3BsYXkpXG5cdFx0XHRcdFx0XHRcdHx8IChsYXN0UGFyZW50Q1NTLmRpc3BsYXkgPT0gJ2ZsZXgnICYmIGxhc3RQYXJlbnRDU1NbJ2ZsZXgtZGlyZWN0aW9uJ10uaW5kZXhPZigncm93JykgPT09IDApLFxuXHRcdFx0XHRcdFx0aXNXaWRlID0gKHRhcmdldC5vZmZzZXRXaWR0aCA+IGRyYWdFbC5vZmZzZXRXaWR0aCksXG5cdFx0XHRcdFx0XHRpc0xvbmcgPSAodGFyZ2V0Lm9mZnNldEhlaWdodCA+IGRyYWdFbC5vZmZzZXRIZWlnaHQpLFxuXHRcdFx0XHRcdFx0aGFsZndheSA9IChmbG9hdGluZyA/IChldnQuY2xpZW50WCAtIHRhcmdldFJlY3QubGVmdCkgLyB3aWR0aCA6IChldnQuY2xpZW50WSAtIHRhcmdldFJlY3QudG9wKSAvIGhlaWdodCkgPiAwLjUsXG5cdFx0XHRcdFx0XHRuZXh0U2libGluZyA9IHRhcmdldC5uZXh0RWxlbWVudFNpYmxpbmcsXG5cdFx0XHRcdFx0XHRtb3ZlVmVjdG9yID0gX29uTW92ZShyb290RWwsIGVsLCBkcmFnRWwsIGRyYWdSZWN0LCB0YXJnZXQsIHRhcmdldFJlY3QpLFxuXHRcdFx0XHRcdFx0YWZ0ZXJcblx0XHRcdFx0XHQ7XG5cblx0XHRcdFx0XHRpZiAobW92ZVZlY3RvciAhPT0gZmFsc2UpIHtcblx0XHRcdFx0XHRcdF9zaWxlbnQgPSB0cnVlO1xuXHRcdFx0XHRcdFx0c2V0VGltZW91dChfdW5zaWxlbnQsIDMwKTtcblxuXHRcdFx0XHRcdFx0X2Nsb25lSGlkZShpc093bmVyKTtcblxuXHRcdFx0XHRcdFx0aWYgKG1vdmVWZWN0b3IgPT09IDEgfHwgbW92ZVZlY3RvciA9PT0gLTEpIHtcblx0XHRcdFx0XHRcdFx0YWZ0ZXIgPSAobW92ZVZlY3RvciA9PT0gMSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRlbHNlIGlmIChmbG9hdGluZykge1xuXHRcdFx0XHRcdFx0XHR2YXIgZWxUb3AgPSBkcmFnRWwub2Zmc2V0VG9wLFxuXHRcdFx0XHRcdFx0XHRcdHRnVG9wID0gdGFyZ2V0Lm9mZnNldFRvcDtcblxuXHRcdFx0XHRcdFx0XHRpZiAoZWxUb3AgPT09IHRnVG9wKSB7XG5cdFx0XHRcdFx0XHRcdFx0YWZ0ZXIgPSAodGFyZ2V0LnByZXZpb3VzRWxlbWVudFNpYmxpbmcgPT09IGRyYWdFbCkgJiYgIWlzV2lkZSB8fCBoYWxmd2F5ICYmIGlzV2lkZTtcblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRhZnRlciA9IHRnVG9wID4gZWxUb3A7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdGFmdGVyID0gKG5leHRTaWJsaW5nICE9PSBkcmFnRWwpICYmICFpc0xvbmcgfHwgaGFsZndheSAmJiBpc0xvbmc7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGlmICghZHJhZ0VsLmNvbnRhaW5zKGVsKSkge1xuXHRcdFx0XHRcdFx0XHRpZiAoYWZ0ZXIgJiYgIW5leHRTaWJsaW5nKSB7XG5cdFx0XHRcdFx0XHRcdFx0ZWwuYXBwZW5kQ2hpbGQoZHJhZ0VsKTtcblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHR0YXJnZXQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoZHJhZ0VsLCBhZnRlciA/IG5leHRTaWJsaW5nIDogdGFyZ2V0KTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRwYXJlbnRFbCA9IGRyYWdFbC5wYXJlbnROb2RlOyAvLyBhY3R1YWxpemF0aW9uXG5cblx0XHRcdFx0XHRcdHRoaXMuX2FuaW1hdGUoZHJhZ1JlY3QsIGRyYWdFbCk7XG5cdFx0XHRcdFx0XHR0aGlzLl9hbmltYXRlKHRhcmdldFJlY3QsIHRhcmdldCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdF9hbmltYXRlOiBmdW5jdGlvbiAocHJldlJlY3QsIHRhcmdldCkge1xuXHRcdFx0dmFyIG1zID0gdGhpcy5vcHRpb25zLmFuaW1hdGlvbjtcblxuXHRcdFx0aWYgKG1zKSB7XG5cdFx0XHRcdHZhciBjdXJyZW50UmVjdCA9IHRhcmdldC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuXHRcdFx0XHRfY3NzKHRhcmdldCwgJ3RyYW5zaXRpb24nLCAnbm9uZScpO1xuXHRcdFx0XHRfY3NzKHRhcmdldCwgJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUzZCgnXG5cdFx0XHRcdFx0KyAocHJldlJlY3QubGVmdCAtIGN1cnJlbnRSZWN0LmxlZnQpICsgJ3B4LCdcblx0XHRcdFx0XHQrIChwcmV2UmVjdC50b3AgLSBjdXJyZW50UmVjdC50b3ApICsgJ3B4LDApJ1xuXHRcdFx0XHQpO1xuXG5cdFx0XHRcdHRhcmdldC5vZmZzZXRXaWR0aDsgLy8gcmVwYWludFxuXG5cdFx0XHRcdF9jc3ModGFyZ2V0LCAndHJhbnNpdGlvbicsICdhbGwgJyArIG1zICsgJ21zJyk7XG5cdFx0XHRcdF9jc3ModGFyZ2V0LCAndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZTNkKDAsMCwwKScpO1xuXG5cdFx0XHRcdGNsZWFyVGltZW91dCh0YXJnZXQuYW5pbWF0ZWQpO1xuXHRcdFx0XHR0YXJnZXQuYW5pbWF0ZWQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRfY3NzKHRhcmdldCwgJ3RyYW5zaXRpb24nLCAnJyk7XG5cdFx0XHRcdFx0X2Nzcyh0YXJnZXQsICd0cmFuc2Zvcm0nLCAnJyk7XG5cdFx0XHRcdFx0dGFyZ2V0LmFuaW1hdGVkID0gZmFsc2U7XG5cdFx0XHRcdH0sIG1zKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0X29mZlVwRXZlbnRzOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHR2YXIgb3duZXJEb2N1bWVudCA9IHRoaXMuZWwub3duZXJEb2N1bWVudDtcblxuXHRcdFx0X29mZihkb2N1bWVudCwgJ3RvdWNobW92ZScsIHRoaXMuX29uVG91Y2hNb3ZlKTtcblx0XHRcdF9vZmYob3duZXJEb2N1bWVudCwgJ21vdXNldXAnLCB0aGlzLl9vbkRyb3ApO1xuXHRcdFx0X29mZihvd25lckRvY3VtZW50LCAndG91Y2hlbmQnLCB0aGlzLl9vbkRyb3ApO1xuXHRcdFx0X29mZihvd25lckRvY3VtZW50LCAndG91Y2hjYW5jZWwnLCB0aGlzLl9vbkRyb3ApO1xuXHRcdH0sXG5cblx0XHRfb25Ecm9wOiBmdW5jdGlvbiAoLyoqRXZlbnQqL2V2dCkge1xuXHRcdFx0dmFyIGVsID0gdGhpcy5lbCxcblx0XHRcdFx0b3B0aW9ucyA9IHRoaXMub3B0aW9ucztcblxuXHRcdFx0Y2xlYXJJbnRlcnZhbCh0aGlzLl9sb29wSWQpO1xuXHRcdFx0Y2xlYXJJbnRlcnZhbChhdXRvU2Nyb2xsLnBpZCk7XG5cdFx0XHRjbGVhclRpbWVvdXQodGhpcy5fZHJhZ1N0YXJ0VGltZXIpO1xuXG5cdFx0XHQvLyBVbmJpbmQgZXZlbnRzXG5cdFx0XHRfb2ZmKGRvY3VtZW50LCAnbW91c2Vtb3ZlJywgdGhpcy5fb25Ub3VjaE1vdmUpO1xuXG5cdFx0XHRpZiAodGhpcy5uYXRpdmVEcmFnZ2FibGUpIHtcblx0XHRcdFx0X29mZihkb2N1bWVudCwgJ2Ryb3AnLCB0aGlzKTtcblx0XHRcdFx0X29mZihlbCwgJ2RyYWdzdGFydCcsIHRoaXMuX29uRHJhZ1N0YXJ0KTtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5fb2ZmVXBFdmVudHMoKTtcblxuXHRcdFx0aWYgKGV2dCkge1xuXHRcdFx0XHRpZiAobW92ZWQpIHtcblx0XHRcdFx0XHRldnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0XHQhb3B0aW9ucy5kcm9wQnViYmxlICYmIGV2dC5zdG9wUHJvcGFnYXRpb24oKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGdob3N0RWwgJiYgZ2hvc3RFbC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGdob3N0RWwpO1xuXG5cdFx0XHRcdGlmIChkcmFnRWwpIHtcblx0XHRcdFx0XHRpZiAodGhpcy5uYXRpdmVEcmFnZ2FibGUpIHtcblx0XHRcdFx0XHRcdF9vZmYoZHJhZ0VsLCAnZHJhZ2VuZCcsIHRoaXMpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdF9kaXNhYmxlRHJhZ2dhYmxlKGRyYWdFbCk7XG5cblx0XHRcdFx0XHQvLyBSZW1vdmUgY2xhc3Mnc1xuXHRcdFx0XHRcdF90b2dnbGVDbGFzcyhkcmFnRWwsIHRoaXMub3B0aW9ucy5naG9zdENsYXNzLCBmYWxzZSk7XG5cdFx0XHRcdFx0X3RvZ2dsZUNsYXNzKGRyYWdFbCwgdGhpcy5vcHRpb25zLmNob3NlbkNsYXNzLCBmYWxzZSk7XG5cblx0XHRcdFx0XHRpZiAocm9vdEVsICE9PSBwYXJlbnRFbCkge1xuXHRcdFx0XHRcdFx0bmV3SW5kZXggPSBfaW5kZXgoZHJhZ0VsKTtcblxuXHRcdFx0XHRcdFx0aWYgKG5ld0luZGV4ID49IDApIHtcblx0XHRcdFx0XHRcdFx0Ly8gZHJhZyBmcm9tIG9uZSBsaXN0IGFuZCBkcm9wIGludG8gYW5vdGhlclxuXHRcdFx0XHRcdFx0XHRfZGlzcGF0Y2hFdmVudChudWxsLCBwYXJlbnRFbCwgJ3NvcnQnLCBkcmFnRWwsIHJvb3RFbCwgb2xkSW5kZXgsIG5ld0luZGV4KTtcblx0XHRcdFx0XHRcdFx0X2Rpc3BhdGNoRXZlbnQodGhpcywgcm9vdEVsLCAnc29ydCcsIGRyYWdFbCwgcm9vdEVsLCBvbGRJbmRleCwgbmV3SW5kZXgpO1xuXG5cdFx0XHRcdFx0XHRcdC8vIEFkZCBldmVudFxuXHRcdFx0XHRcdFx0XHRfZGlzcGF0Y2hFdmVudChudWxsLCBwYXJlbnRFbCwgJ2FkZCcsIGRyYWdFbCwgcm9vdEVsLCBvbGRJbmRleCwgbmV3SW5kZXgpO1xuXG5cdFx0XHRcdFx0XHRcdC8vIFJlbW92ZSBldmVudFxuXHRcdFx0XHRcdFx0XHRfZGlzcGF0Y2hFdmVudCh0aGlzLCByb290RWwsICdyZW1vdmUnLCBkcmFnRWwsIHJvb3RFbCwgb2xkSW5kZXgsIG5ld0luZGV4KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0XHQvLyBSZW1vdmUgY2xvbmVcblx0XHRcdFx0XHRcdGNsb25lRWwgJiYgY2xvbmVFbC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGNsb25lRWwpO1xuXG5cdFx0XHRcdFx0XHRpZiAoZHJhZ0VsLm5leHRTaWJsaW5nICE9PSBuZXh0RWwpIHtcblx0XHRcdFx0XHRcdFx0Ly8gR2V0IHRoZSBpbmRleCBvZiB0aGUgZHJhZ2dlZCBlbGVtZW50IHdpdGhpbiBpdHMgcGFyZW50XG5cdFx0XHRcdFx0XHRcdG5ld0luZGV4ID0gX2luZGV4KGRyYWdFbCk7XG5cblx0XHRcdFx0XHRcdFx0aWYgKG5ld0luZGV4ID49IDApIHtcblx0XHRcdFx0XHRcdFx0XHQvLyBkcmFnICYgZHJvcCB3aXRoaW4gdGhlIHNhbWUgbGlzdFxuXHRcdFx0XHRcdFx0XHRcdF9kaXNwYXRjaEV2ZW50KHRoaXMsIHJvb3RFbCwgJ3VwZGF0ZScsIGRyYWdFbCwgcm9vdEVsLCBvbGRJbmRleCwgbmV3SW5kZXgpO1xuXHRcdFx0XHRcdFx0XHRcdF9kaXNwYXRjaEV2ZW50KHRoaXMsIHJvb3RFbCwgJ3NvcnQnLCBkcmFnRWwsIHJvb3RFbCwgb2xkSW5kZXgsIG5ld0luZGV4KTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmIChTb3J0YWJsZS5hY3RpdmUpIHtcblx0XHRcdFx0XHRcdGlmIChuZXdJbmRleCA9PT0gbnVsbCB8fCBuZXdJbmRleCA9PT0gLTEpIHtcblx0XHRcdFx0XHRcdFx0bmV3SW5kZXggPSBvbGRJbmRleDtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0X2Rpc3BhdGNoRXZlbnQodGhpcywgcm9vdEVsLCAnZW5kJywgZHJhZ0VsLCByb290RWwsIG9sZEluZGV4LCBuZXdJbmRleCk7XG5cblx0XHRcdFx0XHRcdC8vIFNhdmUgc29ydGluZ1xuXHRcdFx0XHRcdFx0dGhpcy5zYXZlKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gTnVsbGluZ1xuXHRcdFx0XHRyb290RWwgPVxuXHRcdFx0XHRkcmFnRWwgPVxuXHRcdFx0XHRwYXJlbnRFbCA9XG5cdFx0XHRcdGdob3N0RWwgPVxuXHRcdFx0XHRuZXh0RWwgPVxuXHRcdFx0XHRjbG9uZUVsID1cblxuXHRcdFx0XHRzY3JvbGxFbCA9XG5cdFx0XHRcdHNjcm9sbFBhcmVudEVsID1cblxuXHRcdFx0XHR0YXBFdnQgPVxuXHRcdFx0XHR0b3VjaEV2dCA9XG5cblx0XHRcdFx0bW92ZWQgPVxuXHRcdFx0XHRuZXdJbmRleCA9XG5cblx0XHRcdFx0bGFzdEVsID1cblx0XHRcdFx0bGFzdENTUyA9XG5cblx0XHRcdFx0YWN0aXZlR3JvdXAgPVxuXHRcdFx0XHRTb3J0YWJsZS5hY3RpdmUgPSBudWxsO1xuXHRcdFx0fVxuXHRcdH0sXG5cblxuXHRcdGhhbmRsZUV2ZW50OiBmdW5jdGlvbiAoLyoqRXZlbnQqL2V2dCkge1xuXHRcdFx0dmFyIHR5cGUgPSBldnQudHlwZTtcblxuXHRcdFx0aWYgKHR5cGUgPT09ICdkcmFnb3ZlcicgfHwgdHlwZSA9PT0gJ2RyYWdlbnRlcicpIHtcblx0XHRcdFx0aWYgKGRyYWdFbCkge1xuXHRcdFx0XHRcdHRoaXMuX29uRHJhZ092ZXIoZXZ0KTtcblx0XHRcdFx0XHRfZ2xvYmFsRHJhZ092ZXIoZXZ0KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAodHlwZSA9PT0gJ2Ryb3AnIHx8IHR5cGUgPT09ICdkcmFnZW5kJykge1xuXHRcdFx0XHR0aGlzLl9vbkRyb3AoZXZ0KTtcblx0XHRcdH1cblx0XHR9LFxuXG5cblx0XHQvKipcblx0XHQgKiBTZXJpYWxpemVzIHRoZSBpdGVtIGludG8gYW4gYXJyYXkgb2Ygc3RyaW5nLlxuXHRcdCAqIEByZXR1cm5zIHtTdHJpbmdbXX1cblx0XHQgKi9cblx0XHR0b0FycmF5OiBmdW5jdGlvbiAoKSB7XG5cdFx0XHR2YXIgb3JkZXIgPSBbXSxcblx0XHRcdFx0ZWwsXG5cdFx0XHRcdGNoaWxkcmVuID0gdGhpcy5lbC5jaGlsZHJlbixcblx0XHRcdFx0aSA9IDAsXG5cdFx0XHRcdG4gPSBjaGlsZHJlbi5sZW5ndGgsXG5cdFx0XHRcdG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG5cblx0XHRcdGZvciAoOyBpIDwgbjsgaSsrKSB7XG5cdFx0XHRcdGVsID0gY2hpbGRyZW5baV07XG5cdFx0XHRcdGlmIChfY2xvc2VzdChlbCwgb3B0aW9ucy5kcmFnZ2FibGUsIHRoaXMuZWwpKSB7XG5cdFx0XHRcdFx0b3JkZXIucHVzaChlbC5nZXRBdHRyaWJ1dGUob3B0aW9ucy5kYXRhSWRBdHRyKSB8fCBfZ2VuZXJhdGVJZChlbCkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBvcmRlcjtcblx0XHR9LFxuXG5cblx0XHQvKipcblx0XHQgKiBTb3J0cyB0aGUgZWxlbWVudHMgYWNjb3JkaW5nIHRvIHRoZSBhcnJheS5cblx0XHQgKiBAcGFyYW0gIHtTdHJpbmdbXX0gIG9yZGVyICBvcmRlciBvZiB0aGUgaXRlbXNcblx0XHQgKi9cblx0XHRzb3J0OiBmdW5jdGlvbiAob3JkZXIpIHtcblx0XHRcdHZhciBpdGVtcyA9IHt9LCByb290RWwgPSB0aGlzLmVsO1xuXG5cdFx0XHR0aGlzLnRvQXJyYXkoKS5mb3JFYWNoKGZ1bmN0aW9uIChpZCwgaSkge1xuXHRcdFx0XHR2YXIgZWwgPSByb290RWwuY2hpbGRyZW5baV07XG5cblx0XHRcdFx0aWYgKF9jbG9zZXN0KGVsLCB0aGlzLm9wdGlvbnMuZHJhZ2dhYmxlLCByb290RWwpKSB7XG5cdFx0XHRcdFx0aXRlbXNbaWRdID0gZWw7XG5cdFx0XHRcdH1cblx0XHRcdH0sIHRoaXMpO1xuXG5cdFx0XHRvcmRlci5mb3JFYWNoKGZ1bmN0aW9uIChpZCkge1xuXHRcdFx0XHRpZiAoaXRlbXNbaWRdKSB7XG5cdFx0XHRcdFx0cm9vdEVsLnJlbW92ZUNoaWxkKGl0ZW1zW2lkXSk7XG5cdFx0XHRcdFx0cm9vdEVsLmFwcGVuZENoaWxkKGl0ZW1zW2lkXSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH0sXG5cblxuXHRcdC8qKlxuXHRcdCAqIFNhdmUgdGhlIGN1cnJlbnQgc29ydGluZ1xuXHRcdCAqL1xuXHRcdHNhdmU6IGZ1bmN0aW9uICgpIHtcblx0XHRcdHZhciBzdG9yZSA9IHRoaXMub3B0aW9ucy5zdG9yZTtcblx0XHRcdHN0b3JlICYmIHN0b3JlLnNldCh0aGlzKTtcblx0XHR9LFxuXG5cblx0XHQvKipcblx0XHQgKiBGb3IgZWFjaCBlbGVtZW50IGluIHRoZSBzZXQsIGdldCB0aGUgZmlyc3QgZWxlbWVudCB0aGF0IG1hdGNoZXMgdGhlIHNlbGVjdG9yIGJ5IHRlc3RpbmcgdGhlIGVsZW1lbnQgaXRzZWxmIGFuZCB0cmF2ZXJzaW5nIHVwIHRocm91Z2ggaXRzIGFuY2VzdG9ycyBpbiB0aGUgRE9NIHRyZWUuXG5cdFx0ICogQHBhcmFtICAge0hUTUxFbGVtZW50fSAgZWxcblx0XHQgKiBAcGFyYW0gICB7U3RyaW5nfSAgICAgICBbc2VsZWN0b3JdICBkZWZhdWx0OiBgb3B0aW9ucy5kcmFnZ2FibGVgXG5cdFx0ICogQHJldHVybnMge0hUTUxFbGVtZW50fG51bGx9XG5cdFx0ICovXG5cdFx0Y2xvc2VzdDogZnVuY3Rpb24gKGVsLCBzZWxlY3Rvcikge1xuXHRcdFx0cmV0dXJuIF9jbG9zZXN0KGVsLCBzZWxlY3RvciB8fCB0aGlzLm9wdGlvbnMuZHJhZ2dhYmxlLCB0aGlzLmVsKTtcblx0XHR9LFxuXG5cblx0XHQvKipcblx0XHQgKiBTZXQvZ2V0IG9wdGlvblxuXHRcdCAqIEBwYXJhbSAgIHtzdHJpbmd9IG5hbWVcblx0XHQgKiBAcGFyYW0gICB7Kn0gICAgICBbdmFsdWVdXG5cdFx0ICogQHJldHVybnMgeyp9XG5cdFx0ICovXG5cdFx0b3B0aW9uOiBmdW5jdGlvbiAobmFtZSwgdmFsdWUpIHtcblx0XHRcdHZhciBvcHRpb25zID0gdGhpcy5vcHRpb25zO1xuXG5cdFx0XHRpZiAodmFsdWUgPT09IHZvaWQgMCkge1xuXHRcdFx0XHRyZXR1cm4gb3B0aW9uc1tuYW1lXTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG9wdGlvbnNbbmFtZV0gPSB2YWx1ZTtcblxuXHRcdFx0XHRpZiAobmFtZSA9PT0gJ2dyb3VwJykge1xuXHRcdFx0XHRcdF9wcmVwYXJlR3JvdXAob3B0aW9ucyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9LFxuXG5cblx0XHQvKipcblx0XHQgKiBEZXN0cm95XG5cdFx0ICovXG5cdFx0ZGVzdHJveTogZnVuY3Rpb24gKCkge1xuXHRcdFx0dmFyIGVsID0gdGhpcy5lbDtcblxuXHRcdFx0ZWxbZXhwYW5kb10gPSBudWxsO1xuXG5cdFx0XHRfb2ZmKGVsLCAnbW91c2Vkb3duJywgdGhpcy5fb25UYXBTdGFydCk7XG5cdFx0XHRfb2ZmKGVsLCAndG91Y2hzdGFydCcsIHRoaXMuX29uVGFwU3RhcnQpO1xuXG5cdFx0XHRpZiAodGhpcy5uYXRpdmVEcmFnZ2FibGUpIHtcblx0XHRcdFx0X29mZihlbCwgJ2RyYWdvdmVyJywgdGhpcyk7XG5cdFx0XHRcdF9vZmYoZWwsICdkcmFnZW50ZXInLCB0aGlzKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gUmVtb3ZlIGRyYWdnYWJsZSBhdHRyaWJ1dGVzXG5cdFx0XHRBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsKGVsLnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkcmFnZ2FibGVdJyksIGZ1bmN0aW9uIChlbCkge1xuXHRcdFx0XHRlbC5yZW1vdmVBdHRyaWJ1dGUoJ2RyYWdnYWJsZScpO1xuXHRcdFx0fSk7XG5cblx0XHRcdHRvdWNoRHJhZ092ZXJMaXN0ZW5lcnMuc3BsaWNlKHRvdWNoRHJhZ092ZXJMaXN0ZW5lcnMuaW5kZXhPZih0aGlzLl9vbkRyYWdPdmVyKSwgMSk7XG5cblx0XHRcdHRoaXMuX29uRHJvcCgpO1xuXG5cdFx0XHR0aGlzLmVsID0gZWwgPSBudWxsO1xuXHRcdH1cblx0fTtcblxuXG5cdGZ1bmN0aW9uIF9jbG9uZUhpZGUoc3RhdGUpIHtcblx0XHRpZiAoY2xvbmVFbCAmJiAoY2xvbmVFbC5zdGF0ZSAhPT0gc3RhdGUpKSB7XG5cdFx0XHRfY3NzKGNsb25lRWwsICdkaXNwbGF5Jywgc3RhdGUgPyAnbm9uZScgOiAnJyk7XG5cdFx0XHQhc3RhdGUgJiYgY2xvbmVFbC5zdGF0ZSAmJiByb290RWwuaW5zZXJ0QmVmb3JlKGNsb25lRWwsIGRyYWdFbCk7XG5cdFx0XHRjbG9uZUVsLnN0YXRlID0gc3RhdGU7XG5cdFx0fVxuXHR9XG5cblxuXHRmdW5jdGlvbiBfY2xvc2VzdCgvKipIVE1MRWxlbWVudCovZWwsIC8qKlN0cmluZyovc2VsZWN0b3IsIC8qKkhUTUxFbGVtZW50Ki9jdHgpIHtcblx0XHRpZiAoZWwpIHtcblx0XHRcdGN0eCA9IGN0eCB8fCBkb2N1bWVudDtcblx0XHRcdHNlbGVjdG9yID0gc2VsZWN0b3Iuc3BsaXQoJy4nKTtcblxuXHRcdFx0dmFyIHRhZyA9IHNlbGVjdG9yLnNoaWZ0KCkudG9VcHBlckNhc2UoKSxcblx0XHRcdFx0cmUgPSBuZXcgUmVnRXhwKCdcXFxccygnICsgc2VsZWN0b3Iuam9pbignfCcpICsgJykoPz1cXFxccyknLCAnZycpO1xuXG5cdFx0XHRkbyB7XG5cdFx0XHRcdGlmIChcblx0XHRcdFx0XHQodGFnID09PSAnPionICYmIGVsLnBhcmVudE5vZGUgPT09IGN0eCkgfHwgKFxuXHRcdFx0XHRcdFx0KHRhZyA9PT0gJycgfHwgZWwubm9kZU5hbWUudG9VcHBlckNhc2UoKSA9PSB0YWcpICYmXG5cdFx0XHRcdFx0XHQoIXNlbGVjdG9yLmxlbmd0aCB8fCAoKCcgJyArIGVsLmNsYXNzTmFtZSArICcgJykubWF0Y2gocmUpIHx8IFtdKS5sZW5ndGggPT0gc2VsZWN0b3IubGVuZ3RoKVxuXHRcdFx0XHRcdClcblx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0cmV0dXJuIGVsO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHR3aGlsZSAoZWwgIT09IGN0eCAmJiAoZWwgPSBlbC5wYXJlbnROb2RlKSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblxuXG5cdGZ1bmN0aW9uIF9nbG9iYWxEcmFnT3ZlcigvKipFdmVudCovZXZ0KSB7XG5cdFx0aWYgKGV2dC5kYXRhVHJhbnNmZXIpIHtcblx0XHRcdGV2dC5kYXRhVHJhbnNmZXIuZHJvcEVmZmVjdCA9ICdtb3ZlJztcblx0XHR9XG5cdFx0ZXZ0LnByZXZlbnREZWZhdWx0KCk7XG5cdH1cblxuXG5cdGZ1bmN0aW9uIF9vbihlbCwgZXZlbnQsIGZuKSB7XG5cdFx0ZWwuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgZm4sIGZhbHNlKTtcblx0fVxuXG5cblx0ZnVuY3Rpb24gX29mZihlbCwgZXZlbnQsIGZuKSB7XG5cdFx0ZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudCwgZm4sIGZhbHNlKTtcblx0fVxuXG5cblx0ZnVuY3Rpb24gX3RvZ2dsZUNsYXNzKGVsLCBuYW1lLCBzdGF0ZSkge1xuXHRcdGlmIChlbCkge1xuXHRcdFx0aWYgKGVsLmNsYXNzTGlzdCkge1xuXHRcdFx0XHRlbC5jbGFzc0xpc3Rbc3RhdGUgPyAnYWRkJyA6ICdyZW1vdmUnXShuYW1lKTtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHR2YXIgY2xhc3NOYW1lID0gKCcgJyArIGVsLmNsYXNzTmFtZSArICcgJykucmVwbGFjZShSU1BBQ0UsICcgJykucmVwbGFjZSgnICcgKyBuYW1lICsgJyAnLCAnICcpO1xuXHRcdFx0XHRlbC5jbGFzc05hbWUgPSAoY2xhc3NOYW1lICsgKHN0YXRlID8gJyAnICsgbmFtZSA6ICcnKSkucmVwbGFjZShSU1BBQ0UsICcgJyk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblxuXHRmdW5jdGlvbiBfY3NzKGVsLCBwcm9wLCB2YWwpIHtcblx0XHR2YXIgc3R5bGUgPSBlbCAmJiBlbC5zdHlsZTtcblxuXHRcdGlmIChzdHlsZSkge1xuXHRcdFx0aWYgKHZhbCA9PT0gdm9pZCAwKSB7XG5cdFx0XHRcdGlmIChkb2N1bWVudC5kZWZhdWx0VmlldyAmJiBkb2N1bWVudC5kZWZhdWx0Vmlldy5nZXRDb21wdXRlZFN0eWxlKSB7XG5cdFx0XHRcdFx0dmFsID0gZG9jdW1lbnQuZGVmYXVsdFZpZXcuZ2V0Q29tcHV0ZWRTdHlsZShlbCwgJycpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2UgaWYgKGVsLmN1cnJlbnRTdHlsZSkge1xuXHRcdFx0XHRcdHZhbCA9IGVsLmN1cnJlbnRTdHlsZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBwcm9wID09PSB2b2lkIDAgPyB2YWwgOiB2YWxbcHJvcF07XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0aWYgKCEocHJvcCBpbiBzdHlsZSkpIHtcblx0XHRcdFx0XHRwcm9wID0gJy13ZWJraXQtJyArIHByb3A7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRzdHlsZVtwcm9wXSA9IHZhbCArICh0eXBlb2YgdmFsID09PSAnc3RyaW5nJyA/ICcnIDogJ3B4Jyk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblxuXHRmdW5jdGlvbiBfZmluZChjdHgsIHRhZ05hbWUsIGl0ZXJhdG9yKSB7XG5cdFx0aWYgKGN0eCkge1xuXHRcdFx0dmFyIGxpc3QgPSBjdHguZ2V0RWxlbWVudHNCeVRhZ05hbWUodGFnTmFtZSksIGkgPSAwLCBuID0gbGlzdC5sZW5ndGg7XG5cblx0XHRcdGlmIChpdGVyYXRvcikge1xuXHRcdFx0XHRmb3IgKDsgaSA8IG47IGkrKykge1xuXHRcdFx0XHRcdGl0ZXJhdG9yKGxpc3RbaV0sIGkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBsaXN0O1xuXHRcdH1cblxuXHRcdHJldHVybiBbXTtcblx0fVxuXG5cblxuXHRmdW5jdGlvbiBfZGlzcGF0Y2hFdmVudChzb3J0YWJsZSwgcm9vdEVsLCBuYW1lLCB0YXJnZXRFbCwgZnJvbUVsLCBzdGFydEluZGV4LCBuZXdJbmRleCkge1xuXHRcdHZhciBldnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnRXZlbnQnKSxcblx0XHRcdG9wdGlvbnMgPSAoc29ydGFibGUgfHwgcm9vdEVsW2V4cGFuZG9dKS5vcHRpb25zLFxuXHRcdFx0b25OYW1lID0gJ29uJyArIG5hbWUuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBuYW1lLnN1YnN0cigxKTtcblxuXHRcdGV2dC5pbml0RXZlbnQobmFtZSwgdHJ1ZSwgdHJ1ZSk7XG5cblx0XHRldnQudG8gPSByb290RWw7XG5cdFx0ZXZ0LmZyb20gPSBmcm9tRWwgfHwgcm9vdEVsO1xuXHRcdGV2dC5pdGVtID0gdGFyZ2V0RWwgfHwgcm9vdEVsO1xuXHRcdGV2dC5jbG9uZSA9IGNsb25lRWw7XG5cblx0XHRldnQub2xkSW5kZXggPSBzdGFydEluZGV4O1xuXHRcdGV2dC5uZXdJbmRleCA9IG5ld0luZGV4O1xuXG5cdFx0cm9vdEVsLmRpc3BhdGNoRXZlbnQoZXZ0KTtcblxuXHRcdGlmIChvcHRpb25zW29uTmFtZV0pIHtcblx0XHRcdG9wdGlvbnNbb25OYW1lXS5jYWxsKHNvcnRhYmxlLCBldnQpO1xuXHRcdH1cblx0fVxuXG5cblx0ZnVuY3Rpb24gX29uTW92ZShmcm9tRWwsIHRvRWwsIGRyYWdFbCwgZHJhZ1JlY3QsIHRhcmdldEVsLCB0YXJnZXRSZWN0KSB7XG5cdFx0dmFyIGV2dCxcblx0XHRcdHNvcnRhYmxlID0gZnJvbUVsW2V4cGFuZG9dLFxuXHRcdFx0b25Nb3ZlRm4gPSBzb3J0YWJsZS5vcHRpb25zLm9uTW92ZSxcblx0XHRcdHJldFZhbDtcblxuXHRcdGV2dCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdFdmVudCcpO1xuXHRcdGV2dC5pbml0RXZlbnQoJ21vdmUnLCB0cnVlLCB0cnVlKTtcblxuXHRcdGV2dC50byA9IHRvRWw7XG5cdFx0ZXZ0LmZyb20gPSBmcm9tRWw7XG5cdFx0ZXZ0LmRyYWdnZWQgPSBkcmFnRWw7XG5cdFx0ZXZ0LmRyYWdnZWRSZWN0ID0gZHJhZ1JlY3Q7XG5cdFx0ZXZ0LnJlbGF0ZWQgPSB0YXJnZXRFbCB8fCB0b0VsO1xuXHRcdGV2dC5yZWxhdGVkUmVjdCA9IHRhcmdldFJlY3QgfHwgdG9FbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuXHRcdGZyb21FbC5kaXNwYXRjaEV2ZW50KGV2dCk7XG5cblx0XHRpZiAob25Nb3ZlRm4pIHtcblx0XHRcdHJldFZhbCA9IG9uTW92ZUZuLmNhbGwoc29ydGFibGUsIGV2dCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJldFZhbDtcblx0fVxuXG5cblx0ZnVuY3Rpb24gX2Rpc2FibGVEcmFnZ2FibGUoZWwpIHtcblx0XHRlbC5kcmFnZ2FibGUgPSBmYWxzZTtcblx0fVxuXG5cblx0ZnVuY3Rpb24gX3Vuc2lsZW50KCkge1xuXHRcdF9zaWxlbnQgPSBmYWxzZTtcblx0fVxuXG5cblx0LyoqIEByZXR1cm5zIHtIVE1MRWxlbWVudHxmYWxzZX0gKi9cblx0ZnVuY3Rpb24gX2dob3N0SXNMYXN0KGVsLCBldnQpIHtcblx0XHR2YXIgbGFzdEVsID0gZWwubGFzdEVsZW1lbnRDaGlsZCxcblx0XHRcdFx0cmVjdCA9IGxhc3RFbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuXHRcdHJldHVybiAoKGV2dC5jbGllbnRZIC0gKHJlY3QudG9wICsgcmVjdC5oZWlnaHQpID4gNSkgfHwgKGV2dC5jbGllbnRYIC0gKHJlY3QucmlnaHQgKyByZWN0LndpZHRoKSA+IDUpKSAmJiBsYXN0RWw7IC8vIG1pbiBkZWx0YVxuXHR9XG5cblxuXHQvKipcblx0ICogR2VuZXJhdGUgaWRcblx0ICogQHBhcmFtICAge0hUTUxFbGVtZW50fSBlbFxuXHQgKiBAcmV0dXJucyB7U3RyaW5nfVxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0ZnVuY3Rpb24gX2dlbmVyYXRlSWQoZWwpIHtcblx0XHR2YXIgc3RyID0gZWwudGFnTmFtZSArIGVsLmNsYXNzTmFtZSArIGVsLnNyYyArIGVsLmhyZWYgKyBlbC50ZXh0Q29udGVudCxcblx0XHRcdGkgPSBzdHIubGVuZ3RoLFxuXHRcdFx0c3VtID0gMDtcblxuXHRcdHdoaWxlIChpLS0pIHtcblx0XHRcdHN1bSArPSBzdHIuY2hhckNvZGVBdChpKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gc3VtLnRvU3RyaW5nKDM2KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBpbmRleCBvZiBhbiBlbGVtZW50IHdpdGhpbiBpdHMgcGFyZW50XG5cdCAqIEBwYXJhbSAge0hUTUxFbGVtZW50fSBlbFxuXHQgKiBAcmV0dXJuIHtudW1iZXJ9XG5cdCAqL1xuXHRmdW5jdGlvbiBfaW5kZXgoZWwpIHtcblx0XHR2YXIgaW5kZXggPSAwO1xuXG5cdFx0aWYgKCFlbCB8fCAhZWwucGFyZW50Tm9kZSkge1xuXHRcdFx0cmV0dXJuIC0xO1xuXHRcdH1cblxuXHRcdHdoaWxlIChlbCAmJiAoZWwgPSBlbC5wcmV2aW91c0VsZW1lbnRTaWJsaW5nKSkge1xuXHRcdFx0aWYgKGVsLm5vZGVOYW1lLnRvVXBwZXJDYXNlKCkgIT09ICdURU1QTEFURScpIHtcblx0XHRcdFx0aW5kZXgrKztcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gaW5kZXg7XG5cdH1cblxuXHRmdW5jdGlvbiBfdGhyb3R0bGUoY2FsbGJhY2ssIG1zKSB7XG5cdFx0dmFyIGFyZ3MsIF90aGlzO1xuXG5cdFx0cmV0dXJuIGZ1bmN0aW9uICgpIHtcblx0XHRcdGlmIChhcmdzID09PSB2b2lkIDApIHtcblx0XHRcdFx0YXJncyA9IGFyZ3VtZW50cztcblx0XHRcdFx0X3RoaXMgPSB0aGlzO1xuXG5cdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdGlmIChhcmdzLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0XHRcdFx0Y2FsbGJhY2suY2FsbChfdGhpcywgYXJnc1swXSk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGNhbGxiYWNrLmFwcGx5KF90aGlzLCBhcmdzKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRhcmdzID0gdm9pZCAwO1xuXHRcdFx0XHR9LCBtcyk7XG5cdFx0XHR9XG5cdFx0fTtcblx0fVxuXG5cdGZ1bmN0aW9uIF9leHRlbmQoZHN0LCBzcmMpIHtcblx0XHRpZiAoZHN0ICYmIHNyYykge1xuXHRcdFx0Zm9yICh2YXIga2V5IGluIHNyYykge1xuXHRcdFx0XHRpZiAoc3JjLmhhc093blByb3BlcnR5KGtleSkpIHtcblx0XHRcdFx0XHRkc3Rba2V5XSA9IHNyY1trZXldO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGRzdDtcblx0fVxuXG5cblx0Ly8gRXhwb3J0IHV0aWxzXG5cdFNvcnRhYmxlLnV0aWxzID0ge1xuXHRcdG9uOiBfb24sXG5cdFx0b2ZmOiBfb2ZmLFxuXHRcdGNzczogX2Nzcyxcblx0XHRmaW5kOiBfZmluZCxcblx0XHRpczogZnVuY3Rpb24gKGVsLCBzZWxlY3Rvcikge1xuXHRcdFx0cmV0dXJuICEhX2Nsb3Nlc3QoZWwsIHNlbGVjdG9yLCBlbCk7XG5cdFx0fSxcblx0XHRleHRlbmQ6IF9leHRlbmQsXG5cdFx0dGhyb3R0bGU6IF90aHJvdHRsZSxcblx0XHRjbG9zZXN0OiBfY2xvc2VzdCxcblx0XHR0b2dnbGVDbGFzczogX3RvZ2dsZUNsYXNzLFxuXHRcdGluZGV4OiBfaW5kZXhcblx0fTtcblxuXG5cdC8qKlxuXHQgKiBDcmVhdGUgc29ydGFibGUgaW5zdGFuY2Vcblx0ICogQHBhcmFtIHtIVE1MRWxlbWVudH0gIGVsXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSAgICAgIFtvcHRpb25zXVxuXHQgKi9cblx0U29ydGFibGUuY3JlYXRlID0gZnVuY3Rpb24gKGVsLCBvcHRpb25zKSB7XG5cdFx0cmV0dXJuIG5ldyBTb3J0YWJsZShlbCwgb3B0aW9ucyk7XG5cdH07XG5cblxuXHQvLyBFeHBvcnRcblx0U29ydGFibGUudmVyc2lvbiA9ICcxLjQuMic7XG5cdHJldHVybiBTb3J0YWJsZTtcbn0pO1xuIiwiLyoqXG4gKiBAYXV0aG9yIFJ1YmFYYSA8dHJhc2hAcnViYXhhLm9yZz5cbiAqIEBsaWNlbmNlIE1JVFxuICovXG4oZnVuY3Rpb24gKGZhY3RvcnkpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcblx0XHRkZWZpbmUoWydhbmd1bGFyJywgJy4vU29ydGFibGUnXSwgZmFjdG9yeSk7XG5cdH1cblx0ZWxzZSBpZiAodHlwZW9mIHJlcXVpcmUgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnKSB7XG5cdFx0cmVxdWlyZSgnYW5ndWxhcicpO1xuXHRcdGZhY3RvcnkoYW5ndWxhciwgcmVxdWlyZSgnLi9Tb3J0YWJsZScpKTtcblx0XHRtb2R1bGUuZXhwb3J0cyA9ICduZy1zb3J0YWJsZSc7XG5cdH1cblx0ZWxzZSBpZiAod2luZG93LmFuZ3VsYXIgJiYgd2luZG93LlNvcnRhYmxlKSB7XG5cdFx0ZmFjdG9yeShhbmd1bGFyLCBTb3J0YWJsZSk7XG5cdH1cbn0pKGZ1bmN0aW9uIChhbmd1bGFyLCBTb3J0YWJsZSkge1xuXHQndXNlIHN0cmljdCc7XG5cblxuXHQvKipcblx0ICogQHR5cGVkZWYgICB7T2JqZWN0fSAgICAgICAgbmdTb3J0RXZlbnRcblx0ICogQHByb3BlcnR5ICB7Kn0gICAgICAgICAgICAgbW9kZWwgICAgICBMaXN0IGl0ZW1cblx0ICogQHByb3BlcnR5ICB7T2JqZWN0fEFycmF5fSAgbW9kZWxzICAgICBMaXN0IG9mIGl0ZW1zXG5cdCAqIEBwcm9wZXJ0eSAge251bWJlcn0gICAgICAgIG9sZEluZGV4ICAgYmVmb3JlIHNvcnRcblx0ICogQHByb3BlcnR5ICB7bnVtYmVyfSAgICAgICAgbmV3SW5kZXggICBhZnRlciBzb3J0XG5cdCAqL1xuXG5cdHZhciBleHBhbmRvID0gJ1NvcnRhYmxlOm5nLXNvcnRhYmxlJztcblxuXHRhbmd1bGFyLm1vZHVsZSgnbmctc29ydGFibGUnLCBbXSlcblx0XHQuY29uc3RhbnQoJ25nU29ydGFibGVWZXJzaW9uJywgJzAuNC4wJylcblx0XHQuY29uc3RhbnQoJ25nU29ydGFibGVDb25maWcnLCB7fSlcblx0XHQuZGlyZWN0aXZlKCduZ1NvcnRhYmxlJywgWyckcGFyc2UnLCAnbmdTb3J0YWJsZUNvbmZpZycsIGZ1bmN0aW9uICgkcGFyc2UsIG5nU29ydGFibGVDb25maWcpIHtcblx0XHRcdHZhciByZW1vdmVkLFxuXHRcdFx0XHRuZXh0U2libGluZyxcblx0XHRcdFx0Z2V0U291cmNlRmFjdG9yeSA9IGZ1bmN0aW9uIGdldFNvdXJjZUZhY3RvcnkoZWwsIHNjb3BlKSB7XG5cdFx0XHRcdFx0dmFyIG5nUmVwZWF0ID0gW10uZmlsdGVyLmNhbGwoZWwuY2hpbGROb2RlcywgZnVuY3Rpb24gKG5vZGUpIHtcblx0XHRcdFx0XHRcdHJldHVybiAoXG5cdFx0XHRcdFx0XHRcdFx0KG5vZGUubm9kZVR5cGUgPT09IDgpICYmXG5cdFx0XHRcdFx0XHRcdFx0KG5vZGUubm9kZVZhbHVlLmluZGV4T2YoJ25nUmVwZWF0OicpICE9PSAtMSlcblx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHR9KVswXTtcblxuXHRcdFx0XHRcdGlmICghbmdSZXBlYXQpIHtcblx0XHRcdFx0XHRcdC8vIFdpdGhvdXQgbmctcmVwZWF0XG5cdFx0XHRcdFx0XHRyZXR1cm4gZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Ly8gdGVzdHM6IGh0dHA6Ly9qc2Jpbi5jb20va29zdWJ1dGlsby8xL2VkaXQ/anMsb3V0cHV0XG5cdFx0XHRcdFx0bmdSZXBlYXQgPSBuZ1JlcGVhdC5ub2RlVmFsdWUubWF0Y2goL25nUmVwZWF0OlxccyooPzpcXCguKj8sXFxzKik/KFteXFxzKV0rKVtcXHMpXStpblxccysoW15cXHN8XSspLyk7XG5cblx0XHRcdFx0XHR2YXIgaXRlbXNFeHByID0gJHBhcnNlKG5nUmVwZWF0WzJdKTtcblxuXHRcdFx0XHRcdHJldHVybiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gaXRlbXNFeHByKHNjb3BlLiRwYXJlbnQpIHx8IFtdO1xuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH07XG5cblxuXHRcdFx0Ly8gRXhwb3J0XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRyZXN0cmljdDogJ0FDJyxcblx0XHRcdFx0c2NvcGU6IHsgbmdTb3J0YWJsZTogXCI9P1wiIH0sXG5cdFx0XHRcdGxpbms6IGZ1bmN0aW9uIChzY29wZSwgJGVsKSB7XG5cdFx0XHRcdFx0dmFyIGVsID0gJGVsWzBdLFxuXHRcdFx0XHRcdFx0b3B0aW9ucyA9IGFuZ3VsYXIuZXh0ZW5kKHNjb3BlLm5nU29ydGFibGUgfHwge30sIG5nU29ydGFibGVDb25maWcpLFxuXHRcdFx0XHRcdFx0d2F0Y2hlcnMgPSBbXSxcblx0XHRcdFx0XHRcdGdldFNvdXJjZSA9IGdldFNvdXJjZUZhY3RvcnkoZWwsIHNjb3BlKSxcblx0XHRcdFx0XHRcdHNvcnRhYmxlXG5cdFx0XHRcdFx0O1xuXG5cdFx0XHRcdFx0ZWxbZXhwYW5kb10gPSBnZXRTb3VyY2U7XG5cblx0XHRcdFx0XHRmdW5jdGlvbiBfZW1pdEV2ZW50KC8qKkV2ZW50Ki9ldnQsIC8qTWl4ZWQqL2l0ZW0pIHtcblx0XHRcdFx0XHRcdHZhciBuYW1lID0gJ29uJyArIGV2dC50eXBlLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgZXZ0LnR5cGUuc3Vic3RyKDEpO1xuXHRcdFx0XHRcdFx0dmFyIHNvdXJjZSA9IGdldFNvdXJjZSgpO1xuXG5cdFx0XHRcdFx0XHQvKiBqc2hpbnQgZXhwcjp0cnVlICovXG5cdFx0XHRcdFx0XHRvcHRpb25zW25hbWVdICYmIG9wdGlvbnNbbmFtZV0oe1xuXHRcdFx0XHRcdFx0XHRtb2RlbDogaXRlbSB8fCBzb3VyY2VbZXZ0Lm5ld0luZGV4XSxcblx0XHRcdFx0XHRcdFx0bW9kZWxzOiBzb3VyY2UsXG5cdFx0XHRcdFx0XHRcdG9sZEluZGV4OiBldnQub2xkSW5kZXgsXG5cdFx0XHRcdFx0XHRcdG5ld0luZGV4OiBldnQubmV3SW5kZXhcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH1cblxuXG5cdFx0XHRcdFx0ZnVuY3Rpb24gX3N5bmMoLyoqRXZlbnQqL2V2dCkge1xuXHRcdFx0XHRcdFx0dmFyIGl0ZW1zID0gZ2V0U291cmNlKCk7XG5cblx0XHRcdFx0XHRcdGlmICghaXRlbXMpIHtcblx0XHRcdFx0XHRcdFx0Ly8gV2l0aG91dCBuZy1yZXBlYXRcblx0XHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHR2YXIgb2xkSW5kZXggPSBldnQub2xkSW5kZXgsXG5cdFx0XHRcdFx0XHRcdG5ld0luZGV4ID0gZXZ0Lm5ld0luZGV4O1xuXG5cdFx0XHRcdFx0XHRpZiAoZWwgIT09IGV2dC5mcm9tKSB7XG5cdFx0XHRcdFx0XHRcdHZhciBwcmV2SXRlbXMgPSBldnQuZnJvbVtleHBhbmRvXSgpO1xuXG5cdFx0XHRcdFx0XHRcdHJlbW92ZWQgPSBwcmV2SXRlbXNbb2xkSW5kZXhdO1xuXG5cdFx0XHRcdFx0XHRcdGlmIChldnQuY2xvbmUpIHtcblx0XHRcdFx0XHRcdFx0XHRyZW1vdmVkID0gYW5ndWxhci5jb3B5KHJlbW92ZWQpO1xuXHRcdFx0XHRcdFx0XHRcdHByZXZJdGVtcy5zcGxpY2UoU29ydGFibGUudXRpbHMuaW5kZXgoZXZ0LmNsb25lKSwgMCwgcHJldkl0ZW1zLnNwbGljZShvbGRJbmRleCwgMSlbMF0pO1xuXHRcdFx0XHRcdFx0XHRcdGV2dC5mcm9tLnJlbW92ZUNoaWxkKGV2dC5jbG9uZSk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0cHJldkl0ZW1zLnNwbGljZShvbGRJbmRleCwgMSk7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRpdGVtcy5zcGxpY2UobmV3SW5kZXgsIDAsIHJlbW92ZWQpO1xuXG5cdFx0XHRcdFx0XHRcdGV2dC5mcm9tLmluc2VydEJlZm9yZShldnQuaXRlbSwgbmV4dFNpYmxpbmcpOyAvLyByZXZlcnQgZWxlbWVudFxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZWxzZSB7XG5cdFx0XHRcdFx0XHRcdGl0ZW1zLnNwbGljZShuZXdJbmRleCwgMCwgaXRlbXMuc3BsaWNlKG9sZEluZGV4LCAxKVswXSk7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdHNjb3BlLiRhcHBseSgpO1xuXHRcdFx0XHRcdH1cblxuXG5cdFx0XHRcdFx0c29ydGFibGUgPSBTb3J0YWJsZS5jcmVhdGUoZWwsIE9iamVjdC5rZXlzKG9wdGlvbnMpLnJlZHVjZShmdW5jdGlvbiAob3B0cywgbmFtZSkge1xuXHRcdFx0XHRcdFx0b3B0c1tuYW1lXSA9IG9wdHNbbmFtZV0gfHwgb3B0aW9uc1tuYW1lXTtcblx0XHRcdFx0XHRcdHJldHVybiBvcHRzO1xuXHRcdFx0XHRcdH0sIHtcblx0XHRcdFx0XHRcdG9uU3RhcnQ6IGZ1bmN0aW9uICgvKipFdmVudCovZXZ0KSB7XG5cdFx0XHRcdFx0XHRcdG5leHRTaWJsaW5nID0gZXZ0Lml0ZW0ubmV4dFNpYmxpbmc7XG5cdFx0XHRcdFx0XHRcdF9lbWl0RXZlbnQoZXZ0KTtcblx0XHRcdFx0XHRcdFx0c2NvcGUuJGFwcGx5KCk7XG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0b25FbmQ6IGZ1bmN0aW9uICgvKipFdmVudCovZXZ0KSB7XG5cdFx0XHRcdFx0XHRcdF9lbWl0RXZlbnQoZXZ0LCByZW1vdmVkKTtcblx0XHRcdFx0XHRcdFx0c2NvcGUuJGFwcGx5KCk7XG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0b25BZGQ6IGZ1bmN0aW9uICgvKipFdmVudCovZXZ0KSB7XG5cdFx0XHRcdFx0XHRcdF9zeW5jKGV2dCk7XG5cdFx0XHRcdFx0XHRcdF9lbWl0RXZlbnQoZXZ0LCByZW1vdmVkKTtcblx0XHRcdFx0XHRcdFx0c2NvcGUuJGFwcGx5KCk7XG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0b25VcGRhdGU6IGZ1bmN0aW9uICgvKipFdmVudCovZXZ0KSB7XG5cdFx0XHRcdFx0XHRcdF9zeW5jKGV2dCk7XG5cdFx0XHRcdFx0XHRcdF9lbWl0RXZlbnQoZXZ0KTtcblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRvblJlbW92ZTogZnVuY3Rpb24gKC8qKkV2ZW50Ki9ldnQpIHtcblx0XHRcdFx0XHRcdFx0X2VtaXRFdmVudChldnQsIHJlbW92ZWQpO1xuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdG9uU29ydDogZnVuY3Rpb24gKC8qKkV2ZW50Ki9ldnQpIHtcblx0XHRcdFx0XHRcdFx0X2VtaXRFdmVudChldnQpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pKTtcblxuXHRcdFx0XHRcdCRlbC5vbignJGRlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRhbmd1bGFyLmZvckVhY2god2F0Y2hlcnMsIGZ1bmN0aW9uICgvKiogRnVuY3Rpb24gKi91bndhdGNoKSB7XG5cdFx0XHRcdFx0XHRcdHVud2F0Y2goKTtcblx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHRzb3J0YWJsZS5kZXN0cm95KCk7XG5cblx0XHRcdFx0XHRcdGVsW2V4cGFuZG9dID0gbnVsbDtcblx0XHRcdFx0XHRcdGVsID0gbnVsbDtcblx0XHRcdFx0XHRcdHdhdGNoZXJzID0gbnVsbDtcblx0XHRcdFx0XHRcdHNvcnRhYmxlID0gbnVsbDtcblx0XHRcdFx0XHRcdG5leHRTaWJsaW5nID0gbnVsbDtcblx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdGFuZ3VsYXIuZm9yRWFjaChbXG5cdFx0XHRcdFx0XHQnc29ydCcsICdkaXNhYmxlZCcsICdkcmFnZ2FibGUnLCAnaGFuZGxlJywgJ2FuaW1hdGlvbicsICdncm91cCcsICdnaG9zdENsYXNzJywgJ2ZpbHRlcicsXG5cdFx0XHRcdFx0XHQnb25TdGFydCcsICdvbkVuZCcsICdvbkFkZCcsICdvblVwZGF0ZScsICdvblJlbW92ZScsICdvblNvcnQnXG5cdFx0XHRcdFx0XSwgZnVuY3Rpb24gKG5hbWUpIHtcblx0XHRcdFx0XHRcdHdhdGNoZXJzLnB1c2goc2NvcGUuJHdhdGNoKCduZ1NvcnRhYmxlLicgKyBuYW1lLCBmdW5jdGlvbiAodmFsdWUpIHtcblx0XHRcdFx0XHRcdFx0aWYgKHZhbHVlICE9PSB2b2lkIDApIHtcblx0XHRcdFx0XHRcdFx0XHRvcHRpb25zW25hbWVdID0gdmFsdWU7XG5cblx0XHRcdFx0XHRcdFx0XHRpZiAoIS9eb25bQS1aXS8udGVzdChuYW1lKSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0c29ydGFibGUub3B0aW9uKG5hbWUsIHZhbHVlKTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0pKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHR9XSk7XG59KTtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
