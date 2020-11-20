module.exports = {
  createID: function () {
    function getRandomInt(max) {
      return Math.floor(Math.random() * Math.floor(max));
    }
    let rtn = "";
    let LENGTH = 5;
    let alphabet = "ABCEDFGHIJKLMNOPQRSTUVWXYZ";

    for (var i = 0; i < LENGTH; i++) {
      rtn += alphabet[getRandomInt(26)];
    }

    return rtn;
  },
};
