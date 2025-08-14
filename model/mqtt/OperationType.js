const OperationType = {
  ADD: "AddPersons",
  ADD_RETURN: "AddPersons-Ack",
  EDIT: "EditPersons",
  EDIT_RETURN: "EditPersons-Ack",
  DELETE: "DeletePersons",
  DELETE_RETURN: "DeletePersons-Ack",

  fromValue(value) {
    return Object.keys(this).find((key) => this[key] === value);
  },
};

module.exports = OperationType;
