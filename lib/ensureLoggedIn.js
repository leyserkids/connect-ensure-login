/**
 * Ensure that a user is logged in before proceeding to next route middleware.
 *
 * This middleware ensures that a user is logged in.  If a request is received
 * that is unauthenticated, the request will be redirected to a login page (by
 * default to `/login`).
 *
 * Additionally, `returnTo` will be be set in the session to the URL of the
 * current request.  After authentication, this value can be used to redirect
 * the user to the page that was originally requested.
 *
 * Options:
 *   - `redirectTo`   URL to redirect to for login, defaults to _/login_
 *   - `setReturnTo`  set redirectTo in session, defaults to _true_
 *
 * Examples:
 *
 *     app.get('/profile',
 *       ensureLoggedIn(),
 *       function(req, res) { ... });
 *
 *     app.get('/profile',
 *       ensureLoggedIn('/signin'),
 *       function(req, res) { ... });
 *
 *     app.get('/profile',
 *       ensureLoggedIn({ redirectTo: '/session/new', setReturnTo: false }),
 *       function(req, res) { ... });
 *
 * @param {Object} options
 * @return {Function}
 * @api public
 */
module.exports = function ensureLoggedIn(options) {
  if (typeof options === 'string') {
    options = { redirectTo : options };
  }
  options = options || {};

  var url = options.redirectTo || '/login';
  var setReturnTo = (options.setReturnTo === undefined) ? true : options.setReturnTo;
  var errCallback = options.errCallback;

  return function(req, res, next) {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      if (setReturnTo && req.session) {
        req.session.returnTo = req.originalUrl || req.url;
      }
      // https://www.npmjs.com/package/express-session#sessionsavecallback
      // There are some cases where it is useful to call this method,
      // for example, redirects, long-lived requests or in WebSockets.
      if (req.session && typeof req.session.save === 'function') {
          req.session.save(function (err) {
            if (err && typeof errCallback  === 'function') {
              errCallback(err);
            }
            return res.redirect(url);
          });
      } else {
        return res.redirect(url);
      }
    } else {
      next();
    }
  };
};
