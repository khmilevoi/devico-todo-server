import ListModel from '../models/list';
import RoleModel from '../models/role';
import SocketModel from '../models/socket';
import TodoModel from '../models/todo';
import UserModel from '../models/user';

export const clear = async () => {
  await ListModel.deleteMany({});
  await RoleModel.deleteMany({});
  await SocketModel.deleteMany({});
  await TodoModel.deleteMany({});
  await UserModel.deleteMany({});
};

export class Target {
  constructor() {
    this.listeners = {};
    this.called = {};
  }

  add(event, callback) {
    this.listeners[event] = this.listeners[event] || [];
    this.listeners[event].push(callback);
    this.called[event] = [false, null];
  }

  dispatch(event, ...data) {
    this.called[event] = [true, ...data];

    return (
      this.listeners[event]
      && this.listeners[event].forEach((callback) => {
        callback(...data);
        this.called[event] = [false, null];
      })
    );
  }

  wait(event) {
    return new Promise((resolve) => {
      const [match, ...data] = this.called[event] || [];

      if (match) {
        resolve(...data);

        this.called[event] = [false, null];
      } else {
        this.add(event, (...args) => {
          resolve(...args);
        });
      }
    });
  }
}
