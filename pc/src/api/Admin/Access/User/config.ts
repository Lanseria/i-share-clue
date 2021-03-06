import { modulePrefix } from '../config';
const prefix = `${modulePrefix}/users`;

const api = {
  self: prefix,
  clear: `${prefix}/clear`, //DELETE
  restore: `${prefix}/restore`, //POST
  info: `${prefix}/info`, // GET
  information: `${prefix}/information`, // GET
  editDetail: `${prefix}/edit/detail`, // POST
  base: `${prefix}/base`, // POST
  // admin page
  page: `${prefix}/page`, // get
  block: `${prefix}/block`, // POST
  white: `${prefix}/white`, // POST
};

export { api };
