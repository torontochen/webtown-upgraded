import store from "./store/store";


export default (to, from, next) => {
  if (!store.getters.resident && !store.getters.vendor) {
    next({
      path: "/"
    });
  } else {
    next();
  }
};