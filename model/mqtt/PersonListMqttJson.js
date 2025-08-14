class PersonInfo {
  constructor({
    customId,
    name,
    personType,
    tempCardType,
    cardValidBegin,
    cardValidEnd,
    picURI,
  }) {
    this.customId = customId;
    this.name = name;
    this.personType = personType;
    this.tempCardType = tempCardType;
    this.cardValidBegin = cardValidBegin;
    this.cardValidEnd = cardValidEnd;
    this.picURI = picURI;
  }
}

class PersonListMqttJson {
  constructor({
    messageId,
    DataBegin,
    operator,
    PersonNum,
    info,
    DataEnd,
  } = {}) {
    this.messageId = messageId || null;
    this.dataBegin = DataBegin || null;
    this.operator = operator || null;
    this.personNum = PersonNum || 0;
    this.info = Array.isArray(info) ? info.map((p) => new PersonInfo(p)) : [];
    this.dataEnd = DataEnd || null;
  }
}

module.exports = PersonListMqttJson;
