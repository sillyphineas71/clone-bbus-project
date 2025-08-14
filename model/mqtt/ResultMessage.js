class ResultMessage {
  constructor(messageId, operator, code, info) {
    this.messageId = messageId;
    this.operator = operator;
    this.code = code;
    this.info = info; // Kiểu Info
  }
}

class Info {
  constructor(
    facesluiceId,
    addErrNum,
    addSucNum,
    addErrInfos,
    addSucInfos,
    result
  ) {
    this.facesluiceId = facesluiceId;
    this.AddErrNum = addErrNum; // Giữ nguyên chữ hoa theo JSON
    this.AddSucNum = addSucNum;
    this.AddErrInfo = addErrInfos; // Mảng AddErrInfo
    this.AddSucInfo = addSucInfos; // Mảng AddSucInfo
    this.result = result;
  }
}

class AddErrInfo {
  constructor(customId, errCode) {
    this.customId = customId;
    this.errcode = errCode; // Giữ nguyên key theo JSON
  }
}

class AddSucInfo {
  constructor(customId) {
    this.customId = customId;
  }
}

module.exports = {
  ResultMessage,
  Info,
  AddErrInfo,
  AddSucInfo,
};
