import TodoModel from '../models/todo';

const todos = {
  list: async (ctx) => {
    const { owner } = ctx.query;

    const res = await TodoModel.find({ owner });

    ctx.resolve({ res });
  },
  todo: async (ctx) => {
    const { id } = ctx.params;

    const res = await TodoModel.findById(id);

    ctx.resolve({ res });
  },
  add: async (ctx) => {
    const { body } = ctx.request;
    const { inner, owner } = body;

    const res = await TodoModel.create({ inner, owner });

    ctx.resolve({ res });
  },
  toggle: async (ctx) => {
    const { id } = ctx.params;

    const todo = await TodoModel.findById(id);
    const res = await TodoModel.updateOne(todo, { completed: !todo.completed });

    ctx.resolve({ res });
  },
  delete: async (ctx) => {
    const { id } = ctx.params;

    const res = await TodoModel.deleteOne({ _id: id });

    ctx.resolve({ res });
  },
  update: async (ctx) => {
    const { id } = ctx.params;

    const { body } = ctx.request;
    const { inner } = body;

    const todo = await TodoModel.findById(id);
    const res = await TodoModel.updateOne(todo, { inner });

    ctx.resolve({ res });
  },
};

export default todos;
