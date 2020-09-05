const axios = require("axios");
const baseUrl = "http://json-server:3000";

const getUsers = () => {
  const request = axios.get(`${baseUrl}/users`);
  return request.then((response) => response.data);
};

const getUser = (id) => {
  return getUsers().then((users) => users.find((user) => user.id === id));
};

const createUser = (id, name, username) => {
  const request = axios.post(`${baseUrl}/users`, { id, name, username });
  return request.then((response) => response.data);
};

const createPoll = (user, command, statuses) => {
  validateStatuses(statuses);
  const { shortStatusThis, shortStatusNext, shortStatusNextNext } = statuses;
  const request = axios.post(`${baseUrl}/polls`, {
    user,
    command,
    shortStatusThis,
    shortStatusNext,
    shortStatusNextNext,
  });
  return request.then((response) => response.data);
};

const updatePollStatus = (poll, statuses) => {
  validateStatuses(statuses);
  const { shortStatusThis, shortStatusNext, shortStatusNextNext } = statuses;
  const request = axios.put(`${baseUrl}/polls/${poll.id}`, {
    user: poll.user,
    command: poll.command,
    shortStatusThis,
    shortStatusNext,
    shortStatusNextNext,
  });
  return request.then((response) => response.data);
};

const validateStatuses = (statuses) => {
  console.log(statuses);
  console.log(statuses.shortStatusThis);
  // make sure that only one or all statuses are defined
  const undefinedStatusesAmount = [
    statuses.shortStatusThis,
    statuses.shortStatusNext,
    statuses.shortStatusNextNext,
  ].filter((status) => status !== undefined).length;
  if (![1, 3].includes(undefinedStatusesAmount)) {
    throw `Wrong amount of statuses defined ${undefinedStatusesAmount}`;
  }
};

const getPolls = () => {
  const request = axios.get(`${baseUrl}/polls`);
  return request.then((response) => response.data);
};

module.exports = {
  getUser,
  createUser,
  createPoll,
  updatePollStatus,
  getPolls,
};
