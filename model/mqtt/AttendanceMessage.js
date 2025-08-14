class Info {
  constructor({
    customId,
    personId,
    RecordID,
    VerifyStatus,
    PersonType,
    similarity1,
    similarity2,
    Sendintime,
    direction,
    otype,
    persionName,
    facesluiceId,
    facesluiceName,
    idCard,
    telnum,
    left,
    top,
    right,
    bottom,
    time,
    PushType,
    OpendoorWay,
    cardNum2,
    RFIDCard,
    szQrCodeData,
    isNoMask,
    dwFileIndex,
    dwFilePos,
    pic,
  }) {
    this.customId = customId;
    this.personId = personId;
    this.recordID = RecordID;
    this.verifyStatus = VerifyStatus;
    this.personType = PersonType;
    this.similarity1 = similarity1;
    this.similarity2 = similarity2;
    this.sendInTime = Sendintime;
    this.direction = direction;
    this.otype = otype;
    this.personName = persionName;
    this.facesluiceId = facesluiceId;
    this.facesluiceName = facesluiceName;
    this.idCard = idCard;
    this.telnum = telnum;
    this.left = left;
    this.top = top;
    this.right = right;
    this.bottom = bottom;
    this.time = time;
    this.pushType = PushType;
    this.opendoorWay = OpendoorWay;
    this.cardNum2 = cardNum2;
    this.rfidCard = RFIDCard;
    this.szQrCodeData = szQrCodeData;
    this.isNoMask = isNoMask;
    this.dwFileIndex = dwFileIndex;
    this.dwFilePos = dwFilePos;
    this.pic = pic;
  }
}

class AttendanceMessage {
  constructor({ operator, info }) {
    this.operator = operator;
    this.info = new Info(info);
  }
}

module.exports = { AttendanceMessage, Info };
