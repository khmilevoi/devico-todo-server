export const useEmit = (io) => {
  const emit = (id, event, message) => io.to(id).emit(event, message);

  return (ctx, next) => {
    ctx.emit = emit;

    return next();
  };
};
