const useResolve = () => {
  function resolve(body) {
    this.body = { ...body, ok: true, status: 200 };
    this.status = 200;
  }

  function badRequest(body) {
    this.body = { ...body, ok: false, status: 400 };
    this.status = 400;
  }

  function unauthorized(body) {
    this.body = { ...body, ok: false, status: 401 };
    this.status = 401;
  }

  function forbidden(body) {
    this.body = { ...body, ok: false, status: 403 };
    this.status = 403;
  }

  function notFound(body) {
    this.body = { ...body, ok: false, status: 404 };
    this.status = 404;
  }

  return (ctx, next) => {
    ctx.resolve = resolve;
    ctx.badRequest = badRequest;
    ctx.unauthorized = unauthorized;
    ctx.forbidden = forbidden;
    ctx.notFound = notFound;

    return next();
  };
};

export default useResolve;
