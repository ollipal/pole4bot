const axios = require("axios");
const baseUrl = "http://json-server:3000";

const validateWeek = (week) => {
  if (!["current", "next", "nextnext"].includes(week)) {
    throw `${week} not in ["current", "next", "nextnext"]`;
  }
};

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

const createPoll = (week, user, command, status) => {
  validateWeek(week);
  const request = axios.post(`${baseUrl}/${week}`, {
    user,
    command,
    status,
  });
  return request.then((response) => response.data);
};

const updatePollStatus = (week, poll, status) => {
  validateWeek(week);
  const request = axios.put(`${baseUrl}/${week}/${poll.id}`, {
    user: poll.user,
    command: poll.command,
    status,
  });
  return request.then((response) => response.data);
};

const getPolls = (week) => {
  validateWeek(week);
  const request = axios.get(`${baseUrl}/${week}`);
  return request.then((response) => response.data);
};

module.exports = {
  getUser,
  createUser,
  createPoll,
  updatePollStatus,
  getPolls,
};
