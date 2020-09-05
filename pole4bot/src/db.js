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
  const request = axios.post(`${baseUrl}/polls`, {
    user,
    command,
    shortStatusThis: statuses.statusThis.shortStatus,
    shortStatusNext: statuses.statusNext.shortStatus,
    shortStatusNextNext: statuses.statusNextNext.shortStatus,
  });
  return request.then((response) => response.data);
};

const updatePollStatus = async (poll, statuses) => {
  const request = axios.put(`${baseUrl}/polls/${poll.id}`, {
    user: poll.user,
    command: poll.command,
    shortStatusThis: statuses.shortStatusThis
      ? statuses.shortStatusThis
      : poll.shortStatusThis,
    shortStatusNext: statuses.shortStatusNext
      ? statuses.shortStatusNext
      : poll.shortStatusNext,
    shortStatusNextNext: statuses.shortStatusNextNext
      ? statuses.shortStatusNextNext
      : poll.shortStatusNextNext,
  });
  return request.then((response) => response.data);
};

/*
const updatePollStatus = (poll, statuses) => {
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
*/
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
